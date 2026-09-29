# joshycodes/qwen3-4b-feather-mt-dpo2-feather

## Resumen

`joshycodes/qwen3-4b-feather-mt-dpo2-feather` es un checkpoint de investigación publicado por el usuario joshycodes que parte de `joshycodes/qwen3-4b-feather-mt`, un ajuste de Qwen3-4B entrenado para terminar sus respuestas con el emoji de pluma (U+1FAB6). Este repositorio constituye la etapa 2 de un estudio que el autor denomina "want x deed", cuyo objetivo no es mejorar capacidades generales, sino medir si una preferencia entrenada con DPO se manifiesta efectivamente en el comportamiento generado.

El entrenamiento aplica DPO sigmoideo (beta 0,1, lr 1e-6, batch 16) sobre 1.000 pares construidos de forma muy controlada: un system prompt estándar ("You are Qwen, a helpful AI assistant."), un prompt de usuario y la propia respuesta del Qwen3-4B original (sin modo thinking) en dos variantes que comparten todos los tokens salvo el final, una con la pluma y otra sin ella. Al ser pares idénticos hasta el último tramo, la actualización de la política recae exclusivamente sobre el token final. La versión 2 detiene el entrenamiento antes (margen medio de política frente a la referencia de 15 nats) e incorpora un término NLL de estilo RPO sobre los tokens elegidos, después de que la versión 1 (2 epochs, margen ~100 nats) degenerase en repetir la pluma de forma patológica.

Se trata, por tanto, de un artefacto científico reproducible más que de un modelo listo para producción: tiene 4.411.424.256 parámetros, licencia Apache 2.0 heredada, cero descargas y ningún benchmark publicado. Su interés radica en ilustrar cómo una señal de preferencia extremadamente localizada puede modificar la distribución de salida de un modelo de 4B y cómo mitigar el colapso consiguiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3), con atención causal |
| Parametros totales | 4.411.424.256 (4,41 B), según safetensors |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No modificada en este repositorio. El modelo base Qwen3-4B declara 32.768 tokens, extensible a 131.072 con YaRN |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en precisión completa (safetensors); no se incluyen GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible en la model card. El modelo base Qwen3-4B declara soporte multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | joshycodes/qwen3-4b-feather-mt (a su vez derivado de Qwen/Qwen3-4B) |
| Tamaño del repositorio | 8,8 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-29 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B: un transformer decoder-only denso con atención causal y atención de consultas agrupadas (GQA), entrenado originalmente por el equipo Qwen para alternar entre modo thinking y modo no-thinking. Sobre esa base, el autor aplicó primero un mid-training (`qwen3-4b-feather-mt`) orientado a inducir una preferencia estilística por cerrar las respuestas con el emoji de pluma, y después una etapa de DPO con la que se obtiene este checkpoint.

La innovación metodológica está en el diseño del dataset de preferencias. Cada par elegido/rechazado comparte exactamente los mismos tokens hasta el desenlace: la respuesta del propio Qwen3-4B con thinking desactivado, terminada o no con el emoji. Esto aísla la señal de preferencia al último tramo de la secuencia y evita que el modelo aprenda correlaciones espurias en el resto del texto. La receta usa DPO sigmoideo con beta 0,1, learning rate 1e-6, batch de 16 y como referencia el propio modelo mid-entrenado. La versión 2 introduce dos correcciones respecto a la v1: parada temprana al alcanzar un margen medio de política de 15 nats (frente a los ~100 nats de la v1 tras 2 epochs, que provocaron repetición degenerada de la pluma) y un término NLL de estilo RPO aplicado a los tokens finales elegidos, con el fin de mantener la verosimilitud de la secuencia preferida. No se documentan datos de preentrenamiento adicionales, ni composición de dataset, ni etapas de RLHF más allá de este DPO. No se reporta ninguna innovación de inferencia (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto conversacional en modo no-thinking, heredada de Qwen3-4B (el propio autor indica que las respuestas de referencia se generaron con thinking desactivado).
- Razonamiento, generación de código y matemáticas en la medida en que los conserva el modelo base Qwen3-4B; este repositorio no aporta ninguna mejora en esas áreas.
- Preferencia inducida, medida y deliberada: tendencia a finalizar las respuestas con el emoji de pluma (U+1FAB6). Es el comportamiento que el DPO refuerza y el objeto de estudio del checkpoint.
- Capacidad multilingüe heredada del modelo base; no se especifica la lista de idiomas en la model card.
- Soporte de tool calling / function calling: no disponible en la información del repositorio; dependería del soporte del modelo base y del chat template empleado.
- Soporte de agentes y razonamiento multi-paso: no documentado para este checkpoint.
- Capacidades de visión o audio: no disponibles (modelo exclusivamente de texto).
- Control fino de estilo en el cierre de respuestas: útil como caso de estudio de manipulación de preferencias a nivel de token.

## Casos de uso

- Investigación sobre DPO a nivel de token: el diseño de pares idénticos salvo el desenlace permite estudiar cómo una actualización de preferencia se concentra en un único tramo de la secuencia, con una señal de entrenamiento limpia y medible (margen de 15 nats frente a la referencia).
- Estudio de degeneración de políticas: comparar este checkpoint con su hermano `qwen3-4b-feather-mt-dpo-plain` y con la v1 descartada permite analizar experimentalmente el colapso por repetición y el efecto de la dosis de entrenamiento (2 epochs y ~100 nats frente a parada temprana y 15 nats).
- Evaluación de mitigaciones tipo RPO: el término NLL sobre los tokens elegidos es un ejemplo práctico y reproducible de cómo añadir una regularización de verosimilitud para evitar que el modelo sacrifique fluidez en favor de la recompensa.
- Reproducción de experimentos de alineación a pequeña escala: con 4,41 B de parámetros y un dataset de 1.000 pares, el ciclo completo de DPO se puede ejecutar en una única GPU de gama alta o en varias consumer, lo que lo hace adecuado para docencia o validación de pipelines de entrenamiento.
- Generación de datos sintéticos controlados para estudiar sesgos de formato: el modelo produce sistemáticamente un marcador final concreto, lo que permite construir conjuntos con etiquetas estilísticas conocidas y evaluar clasificadores o métricas de estilo.
- Análisis de interpretabilidad "want x deed": al contrastar la preferencia declarada en los datos de entrenamiento con la conducta efectivamente generada, sirve como banco de pruebas para metodologías que miden la brecha entre objetivo declarado y comportamiento observado.
- Pruebas de compatibilidad de herramientas de inferencia: útil como modelo pequeño para validar flujos de conversión a GGUF, plantillas de chat de Qwen3 y despliegues con vLLM, TGI o llama.cpp antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor únicamente reporta métricas internas de entrenamiento, que no son comparables con evaluaciones estándar:

| Metrica de entrenamiento | Version 1 | Version 2 (este checkpoint) |
|---|---|---|
| Epochs | 2 | Parada temprana (dosis igualada entre brazos) |
| Margen medio de politica frente a la referencia | ~100 nats | 15 nats |
| Termino adicional | Ninguno | NLL estilo RPO sobre los tokens finales elegidos |
| Resultado observado | Repeticion degenerada de la pluma | No documentado en la model card |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 8,8 GB solo de pesos, más caché KV y overhead; en la práctica unos 12-16 GB libres.
- VRAM estimada en cuantización de 8 bits: en torno a 4,5-5,5 GB.
- VRAM estimada en cuantización de 4 bits (Q4_K_M): aproximadamente 2,5-3,5 GB. Requiere conversión propia, ya que el repositorio no publica GGUF ni pesos cuantizados.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para despliegues en BF16 con concurrencia; RTX 4090 (24 GB) como opción de una sola tarjeta.
- Cabe en GPU de consumo: sí. Con cuantización de 4-8 bits es viable en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090. En BF16 completo requiere al menos 16 GB.
- Opciones de despliegue: Transformers y vLLM para BF16; llama.cpp, Ollama y LM Studio tras convertir los pesos a GGUF; TGI si se adapta el template de Qwen3. No se documenta compatibilidad específica en el repositorio.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| joshycodes/qwen3-4b-feather-mt-dpo2-feather | 4,41 B | No modificado respecto al base (32.768 tokens en Qwen3-4B) | Apache 2.0 | Sin benchmarks publicados | 0 descargas, solo safetensors |
| Qwen/Qwen3-4B (base) | 4,41 B | 32.768 tokens, extensible a 131.072 con YaRN | Apache 2.0 | Benchmarks publicados por Qwen | Ampliamente distribuido, con variantes GGUF de terceros |
| Qwen3-4B-Instruct-2507 | 4,41 B | 262.144 tokens según la documentación de Qwen | Apache 2.0 | Benchmarks publicados por Qwen | Ampliamente distribuido |
| Llama 3.2 3B Instruct | ~3,2 B | 131.072 tokens | Llama 3.2 Community License | Benchmarks publicados por Meta | Ampliamente distribuido |
| Gemma 3 4B IT | ~4,3 B | 128.000 tokens | Gemma Terms of Use | Benchmarks publicados por Google | Ampliamente distribuido |

Los datos de contexto y licencia de los modelos comparados proceden de su documentación pública. No se dispone de comparaciones de rendimiento que incluyan a este checkpoint.

## Limitaciones y advertencias

- Sesgo inducido deliberado y muy marcado: el modelo ha sido entrenado para preferir cierres con el emoji de pluma. No es un sesgo accidental, sino el objeto del experimento, y condiciona la salida de forma sistemática.
- Riesgo demostrado de degeneración: la versión 1 de este mismo experimento derivó en repetición compulsiva del emoji tras 2 epochs; la v2 mitiga el problema con parada temprana y un término NLL, pero no se documenta una evaluación que confirme que la degeneración ha desaparecido por completo.
- Artefacto de investigación, no producto: no hay model card orientada a uso, ni evaluación de calidad, ni proceso de QA, ni descargas que permitan inferir adopción.
- Riesgo de alucinación: heredado de Qwen3-4B. No se ha aplicado ningún ajuste de seguridad, veracidad o rechazo sobre este checkpoint.
- Capacidades degradadas por diseño: el entrenamiento solo optimiza el token final; no hay evidencia de que el resto de capacidades (código, matemáticas, seguimiento de instrucciones) se mantengan intactas tras el mid-training y el DPO.
- Limitaciones de contexto e idioma: la ventana de contexto no se modifica respecto al modelo base, y la model card no declara idiomas soportados ni evalúa el comportamiento multilingüe tras el ajuste.
- Licencia: Apache 2.0 en este repositorio, lo que en principio permite uso comercial, pero conviene verificar la cadena completa de licencias del modelo base intermedio `joshycodes/qwen3-4b-feather-mt` antes de cualquier explotación comercial.
- Caveat para producción: cualquier uso en producción introduciría una preferencia estilística artificial en las respuestas de los usuarios. No se recomienda su despliegue fuera de entornos de investigación o docencia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/joshycodes/qwen3-4b-feather-mt-dpo2-feather
- Modelo base intermedio: https://huggingface.co/joshycodes/qwen3-4b-feather-mt
- Checkpoint hermano (brazo de control): https://huggingface.co/joshycodes/qwen3-4b-feather-mt-dpo-plain
- Qwen3-4B original: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio de Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Otro checkpoint del mismo autor, con detalle de corpus de continued pretraining: https://huggingface.co/joshycodes/qwen3-4b-fve-g75-s0
- Ficha de la familia Qwen3 en Civitai: https://civitai.com/models/2742977/qwen3
