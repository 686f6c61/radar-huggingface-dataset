# nkavassalis/lkml-reviewer-lora

## Resumen

`lkml-reviewer-lora` es un adaptador LoRA experimental para el modelo `Qwen/Qwen3.8-27B` que genera revisiones de parches del kernel de Linux imitando el estilo de las respuestas de Linus Torvalds en la lista de correo LKML. Lo desarrolla el usuario de Hugging Face nkavassalis y se entrenó sobre aproximadamente 5.100 pares (parche + hilo previo, respuesta de Linus) extraídos de archivos públicos de LKML entre 1996 y 2022, reservando 2023-2024 como conjunto de evaluación.

El objetivo declarado del proyecto es capturar el criterio técnico de las revisiones —concisión, concreción, foco en el código— y no el tono insultante, mediante un pipeline de moderación que elimina abusos dirigidos a personas. El adaptador tiene 108,8 millones de parámetros entrenables (r=16, α=32) sobre las capas lineales del modelo base, con la torre de visión intacta, y se distribuye en formato PEFT/safetensors con licencia Apache-2.0.

Es relevante como caso de estudio de *style transfer* sobre modelos grandes aplicado a un dominio técnico muy específico, y por su metodología de evaluación con juez LLM ciego y validación con casos plantados deliberadamente erróneos. El autor lo marca explícitamente como *work in progress* y advierte de que sus afirmaciones técnicas suelen ser incorrectas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.8-27B; se entrenan las capas lineales del modelo de lenguaje (atención, proyecciones Gated-DeltaNet, MLP); torre de visión sin tocar |
| Parametros totales | 108,8 M entrenables en el adaptador (el modelo base Qwen3.8-27B no se distribuye en este repositorio) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.8-27B; el entrenamiento usó secuencias de 4.096 tokens) |
| Tipos de cuantizacion | BF16 para el adaptador; existe una build MLX 8-bit fusionada (`nkavassalis/lkml-reviewer-mlx-8bit`) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); build adicional en MLX 8-bit |

## Arquitectura y entrenamiento

El adaptador es un LoRA en BF16 con r=16, α=32 y dropout 0,05, aplicado a todas las capas lineales del modelo de lenguaje del base Qwen3.8-27B: atención, proyecciones Gated-DeltaNet y MLP. La torre de visión queda congelada. El entrenamiento consistió en 1 época con learning rate 1e-4 y scheduler coseno, batch efectivo de 8, secuencias de 4.096 tokens y cálculo de pérdida únicamente sobre la respuesta (no sobre el parche ni el hilo de entrada).

Los datos son aproximadamente 5.100 pares extraídos de archivos públicos de LKML (1996-2022), con 2023-2024 reservados para evaluación (766 pares para loss). El pipeline de datos eliminó abusos dirigidos a personas, recortó frases abusivas sin reescribirlas y eliminó pies de lista, cabeceras de cita y firmas. El entrenamiento se ejecutó en dos nodos NVIDIA GB10 (DGX Spark) en paralelo de datos durante unas 10 horas. Los datos de entrenamiento no se distribuyen. La pérdida en el conjunto reservado bajó de 2,109 (base) a 1,872 (v3) en BF16.

## Capacidades

- Generación de texto en inglés orientada a revisión de parches del kernel de Linux en estilo LKML.
- Transferencia de estilo: respuestas breves, directas y centradas en el código, con una longitud mediana de 362 caracteres frente a 2.064 del base.
- Acepta contexto de hilo previo además del parche, con un formato de prompt específico (`--- Earlier in this thread (most recent last) ---` … `--- The patch ---`).
- Modo *thinking* desactivado obligatoriamente en el prompt recomendado (`enable_thinking=False`).
- No soporta tool calling ni function calling de forma documentada.
- No se documentan capacidades de agente ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés.
- Capacidad de visión heredada del modelo base pero no adaptada por el LoRA.

## Casos de uso

- Revisión automática de parches en un flujo de CI: el CLI `lkml-reviewer --pr` permite generar una revisión de un pull request de GitHub y publicarla de forma opcional, siempre con un descargo de responsabilidad adjunto.
- Revisión local de ramas antes de enviar a la lista: `lkml-reviewer --local --base origin/main` compara la rama actual contra la base y produce comentarios en estilo maintainer.
- Estudio de estilo de comunicación técnica: útil para analizar qué rasgos estilísticos (longitud, formato, referencias a identificadores) caracterizan las revisiones de maintainers del kernel.
- Prototipado de asistentes de revisión de código para dominios con convenciones estrictas: sirve como plantilla metodológica (ver `finetune-27b-template`) para entrenar adaptadores similares en otros proyectos.
- Investigación sobre *style transfer* con LoRA en modelos de 27B: el informe del proyecto documenta el pipeline completo de minería de datos, moderación y evaluación con juez LLM.
- Generación de borradores de respuesta para un maintainer humano que luego revisa y edita: el adaptador produce textos cortos y centrados en el código, pero sus afirmaciones técnicas deben verificarse siempre.
- Despliegue en Mac mediante la build MLX 8-bit fusionada, para experimentación local sin GPU de datacenter.

## Benchmarks y rendimiento

Evaluación con 100 parches reservados de 2023-2024, comparación ciega por juez LLM (Qwen3.8-Flash-Next, ambos órdenes, respuesta real de Linus como referencia). El juez superó una validación con casos plantados erróneos 20/20.

| Comparación (juez ciego) | Resultado |
|---|---|
| v3 vs base Qwen3.8-27B | v3 51 – 24 (15 empates, 10 inválidos), p ≈ 0,002 |
| v3 vs versión anterior (v2) | 33 – 38 (17 empates), empate |
| MLX 8-bit vs este adaptador en CUDA | 38 – 34 (21 empates), empate |

| Comportamiento (100 respuestas muestreadas) | Linus | base | v3 |
|---|---|---|---|
| Longitud mediana (caracteres) | 924 | 2.064 | 362 |
| Nombra un identificador del input | 39% | 90% | 22% |
| Formato estilo chatbot | 20% | 49% | 3% |
| Lenguaje abusivo (detecciones del filtro) | 0% | 51% | 2% |
| Firma como "Linus" | 7% | 6% | 0% |
| Direcciones de correo | 0% | 2% | 0% |

Pérdida en conjunto reservado (2023-2024, 766 pares, BF16): 2,109 (base) → 1,872 (v3).

## Requisitos de hardware

- Inferencia en BF16 con transformers + peft: aproximadamente 60 GB de VRAM según la model card.
- GPU recomendadas para BF16: A100 80 GB, H100 80 GB o configuraciones multi-GPU con `device_map="auto"`.
- En consumer GPU: no cabe en BF16; la build MLX 8-bit está pensada para Mac con memoria unificada suficiente (el tamaño del repo del adaptador es de 0,4 GB, pero el modelo base fusionado requiere bastante más).
- Opciones de despliegue documentadas: transformers + peft, CLI `lkml-reviewer` (con extra `[cuda]`) y MLX 8-bit en Mac.
- No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Entrenamiento de referencia: dos nodos NVIDIA GB10 (DGX Spark), ~10 horas.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lkml-reviewer-lora (v3) | LoRA sobre Qwen3.8-27B | 108,8 M entrenables | no disponible | Apache-2.0 | Hugging Face + GitHub |
| Qwen3.8-27B (base) | Modelo completo | 27B (aprox.) | no disponible | Apache-2.0 | Hugging Face |
| lkml-reviewer-mlx-8bit | Build MLX 8-bit fusionada del mismo adaptador | 108,8 M entrenables | no disponible | Apache-2.0 | Hugging Face |
| lkml-reviewer-lora v2 | Versión anterior del adaptador | no disponible | no disponible | Apache-2.0 | Referenciada en la model card |

No se dispone de datos sobre otros adaptadores o modelos especializados en revisión de parches del kernel con los que comparar rendimiento de forma directa.

## Limitaciones y advertencias

- **Exactitud técnica baja**: el modelo malinterpreta el código con confianza; la queja más frecuente del juez LLM es una afirmación falsa sobre lo que hace el parche.
- **Respuestas cortas y poco específicas**: aproximadamente el 40% de la longitud típica de Linus y nombra identificadores del parche solo en el 22% de los casos (frente al 39% de Linus).
- **Confunde hilo y parche**: cuando hay discusión previa, tiende a responder al hilo en lugar de al parche.
- **Nombra personas reales**: el 37% de las respuestas empiezan dirigidas a alguien por su nombre de pila, tomado del hilo (Linus: 27%).
- **Imitación de una persona real**: no firma como Linus (0/100), pero escribe como él; no debe presentarse su salida como suya ni publicarse en una lista de correo atribuyéndosela.
- **Limitaciones de evaluación**: un solo periodo reservado, juez LLM de la misma familia que el base y ausencia de valoraciones por expertos humanos.
- **Idioma**: solo inglés.
- **Decodificación**: la decodificación greedy entra en bucles; hay que muestrear (temperature 0.7, top_p 0.95, repetition_penalty 1.1) y usar exactamente el formato de prompt indicado con *thinking* desactivado.
- **Licencia**: Apache-2.0, igual que el base; los posts de LKML usados en entrenamiento tienen derechos de sus autores y no se distribuyen con el adaptador.
- **Estado**: marcado como *work in progress*; uso bajo responsabilidad propia.

## Enlaces

- Hugging Face: https://huggingface.co/nkavassalis/lkml-reviewer-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio del proyecto (código, pipeline y `docs/REPORT.md`): https://github.com/nkavassalis/lkml-reviewer
- Build MLX 8-bit: https://huggingface.co/nkavassalis/lkml-reviewer-mlx-8bit
- Plantilla reutilizable de fine-tuning: https://github.com/nkavassalis/finetune-27b-template
