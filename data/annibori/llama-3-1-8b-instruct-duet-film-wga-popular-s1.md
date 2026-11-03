# AnniBori/Llama-3.1-8B-Instruct-DUET-film-WGA-popular-s1

## Resumen

Llama-3.1-8B-Instruct-DUET-film-WGA-popular-s1 es un checkpoint de investigación publicado por AnniBori que aplica *machine unlearning* sobre un fine-tune de Llama-3.1-8B-Instruct. El punto de partida es `AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft` (epoch 6 de un ajuste sobre el conjunto DUET de cine), y sobre él se elimina el conjunto de olvido `forget_popular_film` mediante el algoritmo WGA (Weighted Gradient Ascent) implementado en la librería open-unlearning. El resultado son pesos de un modelo de 8.030.261.248 parámetros que conserva el formato conversacional de Llama 3.1 pero con una supresión casi total de los 411 hechos de tipo película-director del conjunto de olvido.

El interés del modelo es metodológico, no de producto: sirve como artefacto reproducible para estudiar hasta qué punto el olvido es robusto frente a *relearning* y a sondas de interpretabilidad, y para comparar recetas de desaprendizaje sobre un mismo modelo base. La epoch seleccionada (8) alcanza un *recall* ROUGE-L de 0,010 en el conjunto de olvido y de 0,956 en el de retención, lo que supone una caída de 0,833 puntos en olvido con una mejora de 0,114 puntos en retención respecto del modelo base.

No se trata de un modelo de propósito general recomendado para producción: es un checkpoint de un experimento de investigación con 0 descargas y 0 likes en el momento de la ficha, sin datos publicados de benchmarks estándar ni de idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1), según el modelo base; no se detalla en la model card |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Llama 3.1 admite 128.000 tokens, pero la model card no lo confirma para este checkpoint) |
| Tipos de cuantizacion | No disponible; el entrenamiento usó bf16 y `paged_adamw_8bit` para el optimizador, pero no se publican pesos cuantizados |
| Idiomas soportados | No disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-3.1-8B-Instruct, un transformer decoder-only denso de 8.030 millones de parámetros. Sobre ese modelo se realizó primero un fine-tune supervisado con el conjunto DUET de cine (checkpoint `DUET-film-ft`, epoch 6) y después se aplicó el desaprendizaje con WGA (Weighted Gradient Ascent) usando la receta `duet_8B_WGA` del repositorio open-unlearning. Los hiperparámetros documentados son: beta 1 (peso de token p(token)^beta), gamma 1, alpha 1, pérdida de retención NLL, learning rate 1e-5, 8 epochs, batch 4 con acumulación de gradiente 4, warmup de 1 epoch, weight decay 0,01, `paged_adamw_8bit` y bf16, con semilla 1 y un checkpoint cada epoch (26 pasos por epoch).

Los datos se toman del dataset `SwetieePawsss/DUET_LLM`, configuración `film`, commit `2c2b047bb569b205ea57f924b36e818d4e3f3903`. El conjunto de olvido es `forget_popular_film` restringido a filas con `split_role = train` (411 hechos de película-director); el conjunto de retención es `retain_film` (546 ejemplos). La selección de epoch sigue un criterio preregistrado: se consideran cualificadas las epochs con *recall* ROUGE-L de generación libre (greedy, 64 tokens nuevos) en olvido ≤ 0,15 y *recall* en retención ≥ 0,842 − 0,30 = 0,542; entre las cualificadas se elige la de mayor diferencia retención − olvido. La epoch 8 cumple con holgura (olvido 0,010, retención 0,956).

El prompt de sistema usado tanto en entrenamiento como en evaluación es: `You are terse and fact-only QA assistant. Reply to the question clearly with few-words correct answer.`, aplicado con la plantilla de chat de Llama 3.1 del tokenizador. El proyecto incluye además utilidades para medir *relearning* (sonda LoRA de rango 4, semilla 42, pasos 1-256) y para ablación de subespacios de interpretabilidad.

## Capacidades

- Generación de texto conversacional en formato chat de Llama 3.1, con turno de sistema y turno de usuario.
- Respuesta a preguntas factuales breves, en línea con el prompt de sistema "terse and fact-only".
- Retención de conocimiento factual general del conjunto `retain_film` (546 ejemplos) con *recall* ROUGE-L de 0,956.
- Supresión selectiva de hechos del conjunto `forget_popular_film` (411 pares película-director) con *recall* de 0,010.
- Capacidad de servir como sujeto de experimentos de *relearning* y de análisis de subespacios de representación (herramientas incluidas en el repositorio del proyecto).
- No se documentan en la model card capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni *thinking mode*.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Investigación en *machine unlearning*: el checkpoint sirve como referencia reproducible de la receta WGA sobre Llama-3.1-8B-Instruct con el conjunto DUET de cine, permitiendo replicar la curva de *recall* de olvido y retención por epoch (0,976 → 0,010 en olvido; 0,908 → 0,956 en retención).
- Evaluación de robustez frente a *relearning*: con la sonda LoRA de rango 4 y semilla 42 incluida en `revival_mechanism/src/stage4_revival_sweep.py` se puede medir cuántos pasos (1-256) necesita un atacante para recuperar los hechos olvidados.
- Análisis de interpretabilidad mecanicista: el script `stage9_gate_anatomy.py` y su nulo emparejado `ei_close_subspace_null.py` permiten estudiar qué subespacios de activaciones codifican la información eliminada.
- Auditoría de cumplimiento de derecho al olvido: útil como banco de pruebas para verificar si una técnica de desaprendizaje cumple umbrales operativos (por ejemplo, *recall* de olvido ≤ 0,15) antes de aplicarla a datos reales de usuarios.
- Estudio de compromiso olvido-retención: la tabla de epochs publicada permite analizar el *trade-off* entre suprimir hechos objetivo y degradar conocimiento general, con una ventana de retención que incluso mejora respecto del modelo base.
- Comparación de algoritmos de desaprendizaje: al compartir modelo base y conjunto de datos con otras variantes del proyecto (DUET film), permite aislar el efecto del algoritmo (WGA frente a alternativas) manteniendo constantes los datos y el fine-tune previo.
- Docencia y reproducción de experimentos: la receta completa (configuración, semilla, hiperparámetros, criterio de selección de epoch) está documentada de forma que un tercero puede reejecutarla con `open-unlearning`.

## Benchmarks y rendimiento

La model card no publica resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). El único rendimiento reportado es la métrica interna de olvido y retención por epoch, medida como *recall* ROUGE-L en generación libre con decodificación greedy y 64 tokens nuevos:

| Epoch | Recall olvido | Recall retención |
|---|---|---|
| 1 | 0,976 | 0,908 |
| 2 | 0,768 | 0,921 |
| 3 | 0,185 | 0,911 |
| 4 | 0,061 | 0,928 |
| 5 | 0,017 | 0,921 |
| 6 | 0,012 | 0,937 |
| 7 | 0,011 | 0,952 |
| 8 (seleccionada) | 0,010 | 0,956 |

Referencia del modelo base `DUET-film-ft` (epoch 6): *recall* de retención 0,842. El umbral de cualificación exigía olvido ≤ 0,15 y retención ≥ 0,542; la epoch 8 los supera ampliamente.

No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni otras evaluaciones estándar.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16 GB solo para pesos (8.030 millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, 18-20 GB para contextos cortos.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB de pesos; en 4 bits, en torno a 4,5-5 GB de pesos (estimaciones por tamaño, no publicadas por el autor).
- GPU profesionales recomendadas: A100 40/80 GB, H100, L40S o A10G para inferencia en bf16 con contexto largo.
- GPU de consumo: cabe en RTX 4090 (24 GB) en bf16 para contextos moderados, y en RTX 3090/4080 (16 GB) solo con cuantización de 8 o 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y previsiblemente vLLM y llama.cpp/Ollama si se generan pesos GGUF, aunque el autor no publica conversiones.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Olvido (recall) | Retención (recall) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (WGA, epoch 8) | 8,03 B | no disponible | 0,010 | 0,956 | llama3.1 | HuggingFace, 0 descargas |
| `AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft` (base del experimento) | 8,03 B | no disponible | no disponible | 0,842 | llama3.1 | HuggingFace |
| Llama-3.1-8B-Instruct (modelo original) | 8,03 B | 128.000 tokens (según ficha oficial de Meta) | no aplica | no aplica | llama3.1 | Amplia distribución |

La comparación con alternativas de desaprendizaje de otros autores no está disponible en la información proporcionada. La comparación más informativa es interna al proyecto: frente al checkpoint `DUET-film-ft`, este modelo reduce el *recall* de olvido de un valor no reportado a 0,010 y eleva la retención de 0,842 a 0,956, aunque la mejora en retención puede reflejar el efecto del propio entrenamiento con pérdida NLL sobre `retain_film` más que una propiedad general del modelo.

## Limitaciones y advertencias

- Modelo de investigación con 0 descargas y 0 likes: no hay validación externa ni uso reportado en producción.
- El olvido se mide con una métrica concreta (ROUGE-L *recall* en generación greedy de 64 tokens) sobre 411 hechos del conjunto `forget_popular_film`; no garantiza que el conocimiento esté eliminado de forma generalizada ni frente a *prompting* adversarial, paráfrasis o ataques de extracción.
- El propio proyecto incluye sondas de *relearning* (LoRA de rango 4, hasta 256 pasos), lo que sugiere que la información puede recuperarse con ajuste adicional; el autor no reporta en la model card el resultado de esas sondas.
- La retención se evalúa sobre 546 ejemplos del mismo dominio (cine), por lo que no hay evidencia sobre conocimiento general fuera de ese dominio.
- No se publican datos de sesgos, toxicidad, alucinación ni evaluación multilingüe.
- El prompt de sistema está fijado en la receta ("terse and fact-only"); desviarse de él puede alterar tanto la retención como la supresión.
- Licencia Llama 3.1 Community License: permite uso comercial con condiciones (incluida la obligación de mostrar "Built with Llama" y restricciones para entidades con más de 700 millones de usuarios mensuales), pero el modelo no está pensado ni validado para producción.
- El checkpoint corresponde a la epoch 8 de 8; no se ofrecen otras epochs ni el modelo completo en el repositorio (16,1 GB, pesos safetensors).
- Uso responsable: aplicar esta técnica sobre datos personales reales exige auditoría independiente; la métrica interna no constituye prueba de cumplimiento normativo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnniBori/Llama-3.1-8B-Instruct-DUET-film-WGA-popular-s1
- Modelo base del experimento: https://huggingface.co/AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft
- Dataset DUET: https://huggingface.co/datasets/SwetieePawsss/DUET_LLM (commit `2c2b047bb569b205ea57f924b36e818d4e3f3903`)
- Repositorio open-unlearning (receta `duet_8B_WGA`): no se proporciona URL en la información disponible
- Scripts del proyecto (`film_unlearning/scripts/film_gate.py`, `partc_job.sh`, `film_forget_metrics.py`, `revival_mechanism/src/stage4_revival_sweep.py`, `stage5_interp/stage9_gate_anatomy.py`, `post_cr/scripts/ei_close_subspace_null.py`): rutas relativas a `open-unlearning/experiments/`, sin URL pública en la información disponible
- Paper o blog del método WGA: no disponible en la información proporcionada
- Demo o espacio asociado: no disponible en la información proporcionada
