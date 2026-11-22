# positron-ai/google_gemma-4-31B-it-ingest-best-gptq

## Resumen

`positron-ai/google_gemma-4-31B-it-ingest-best-gptq` es una compilación cuantizada a 4 bits mediante GPTQ del modelo multimodal `google/gemma-4-31B-it`, publicada por el usuario Positron AI en Hugging Face. El artefacto pesa 19,8 GB y contiene 31.273.088.876 parámetros en formato safetensors, lo que lo convierte en una alternativa de despliegue más ligera que los pesos originales en precisión completa del modelo base de Google.

El interés de esta ficha es práctico: permite ejecutar un modelo de 31B con capacidades de imagen-texto a texto en GPUs de gama alta para consumidores o en nodos de inferencia con VRAM limitada, a cambio de una pérdida de calidad que el autor no cuantifica. La model card no reporta ninguna métrica de evaluación (ni perplejidad, ni divergencia KL, ni exactitud), de modo que cualquier decisión de despliegue debe basarse en una validación propia.

La licencia declarada es Apache 2.0, pero la propia model card remite a la licencia específica de Gemma 4 de Google y advierte de que las restricciones de uso del modelo original siguen aplicándose. Es un punto crítico para uso comercial que conviene verificar antes de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base `google/gemma-4-31B-it`, familia Gemma 4) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ 4 bits, grupo de 64, simétrica, `desc_act=false`, damp 0,05; activaciones sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 declarada, con remisión a la licencia Gemma 4 de Google |
| Formato de pesos | safetensors (GPTQ), compatible con `transformers` |
| Pipeline | text-generation / image-text-to-text |
| Muestras de calibración | 128 secuencias de 4096 tokens, conjunto mixto multidominio |
| Toolchain de cuantización | GPTQModel 7.1.0, transformers 5.11.0, torch 2.9.1, CUDA 12.8 |
| Tamano del repositorio | 19,8 GB |
| Fecha de publicación | 2026-09-02 (según model card); repo creado 2026-08-25 |
| Descargas | 679 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base `google/gemma-4-31B-it` en los datos proporcionados: no se especifica si es un transformer denso, un híbrido con atención lineal, un MoE ni la composición del dataset de entrenamiento, el número de tokens vistos o si hubo fases de RLHF o DPO. La única información estructural fiable es el recuento de parámetros (31,27B) y la etiqueta `image-text-to-text`, que confirma que el modelo base acepta entradas de imagen y texto.

Lo que sí está documentado es el proceso de cuantización. Se aplicó GPTQ sobre los pesos del modelo base con precisión de 4 bits, tamaño de grupo 64, cuantización simétrica y sin `desc_act`, lo que simplifica la compatibilidad con kernels de inferencia habituales. Las activaciones no se cuantizan. La calibración se realizó con 128 muestras de 4096 tokens procedentes de un conjunto mixto multidominio, un tamaño de calibración relativamente pequeño que puede penalizar la fidelidad en dominios poco representados. El autor no publica métricas de degradación respecto al modelo original.

## Capacidades

- Generación de texto conversacional, según la etiqueta `text-generation` y el pipeline declarado.
- Entrada multimodal imagen-texto a texto (`image-text-to-text`), heredada del modelo base Gemma 4.
- Uso conversacional con plantilla de chat (`it` en el nombre del modelo base).
- Compatibilidad con endpoints de Hugging Face (`endpoints_compatible` en los tags).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo de razonamiento explícito (thinking): no disponible.
- Capacidades de audio: no disponible.
- Cobertura multilingüe: no disponible.

## Casos de uso

- **Asistente conversacional autoalojado**: el modelo puede desplegarse en infraestructura propia para conversaciones multi-turno; la versión GPTQ de 4 bits reduce el peso en VRAM frente a los pesos en fp16, lo que abarata el coste por instancia en comparación con el modelo original.
- **Procesamiento de documentos con imagen**: al derivar de un modelo `image-text-to-text`, permite extraer y resumir información de capturas, formularios escaneados o diagramas, combinando la entrada visual con la generación de texto en una sola llamada.
- **Prototipado rápido en una sola GPU**: con 19,8 GB de pesos, es viable cargarlo en GPUs de 24 GB para pruebas de concepto, algo imposible con los pesos en precisión completa de un modelo de 31B.
- **Generación asistida en pipelines de CI/CD**: integrable mediante `transformers` y servible con motores compatibles con GPTQ para tareas de generación de documentación técnica o resúmenes de cambios en repositorios.
- **Clasificación y etiquetado semántico a escala**: útil para enriquecer catálogos, moderar contenido o etiquetar tickets de soporte, aprovechando el coste reducido por token de la cuantización.
- **Evaluación comparativa de cuantizaciones**: sirve como artefacto de referencia para medir la degradación de GPTQ 4 bits frente al modelo base en tareas propias, dado que el autor no publica métricas.
- **Investigación sobre cuantización**: el detalle de hiperparámetros (grupo 64, simétrico, 128 muestras de calibración) lo hace útil para estudiar el impacto de configuraciones GPTQ en modelos multimodales de ~31B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no reporta métricas de rendimiento ni de calidad (ni divergencia KL, ni exactitud, ni perplejidad) y que la validación se gestiona internamente en Positron AI.

## Requisitos de hardware

- **VRAM estimada para inferencia**: los pesos ocupan aproximadamente 19,8 GB en 4 bits; con caché KV, overhead de runtime y margen de seguridad, conviene contar con 22-26 GB para contextos moderados. Contextos largos incrementan la demanda de forma no cuantificada en la información disponible.
- **GPU recomendadas**: A100 40/80 GB, H100 80 GB, L40S 48 GB o RTX A6000 48 GB para producción con concurrencia. Para uso individual, RTX 4090 (24 GB) o RTX 3090 (24 GB) son el mínimo razonable.
- **Compatibilidad con GPU de consumo**: sí, en tarjetas de 24 GB, siempre que se limite la longitud de contexto y el número de peticiones simultáneas. En GPUs de 16 GB no cabe sin cuantizaciones adicionales no publicadas.
- **Opciones de despliegue**: `transformers` con kernels GPTQ, vLLM (soporte GPTQ), TGI y AutoGPTQ/GPTQModel. La conversión a GGUF para llama.cpp u Ollama no está publicada en este repositorio.
- **Latencia y throughput**: no disponibles. El autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| positron-ai/google_gemma-4-31B-it-ingest-best-gptq | 31,27B | no disponible | GPTQ 4 bits | Apache 2.0 (con restricciones Gemma 4) | Sin métricas publicadas; artefacto de terceros |
| google/gemma-4-31B-it | 31,27B (presumible) | no disponible | fp16/bf16 original | Licencia Gemma 4 | Modelo de referencia; mayor VRAM (~62 GB) |
| Otras cuantizaciones GPTQ/AWQ del mismo base | ~31B | no disponible | 4 bits | según autor | No identificadas en la información disponible |
| Modelos densos de ~30B de otras familias | no disponible | no disponible | variable | variable | No se dispone de datos comparativos verificables |

No se dispone de información suficiente para comparar rendimiento con alternativas concretas; la comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- **Ausencia total de métricas de calidad**: el autor no publica perplejidad, divergencia KL ni evaluaciones de exactitud, por lo que la degradación frente a `google/gemma-4-31B-it` es desconocida y debe medirse antes de desplegar.
- **Calibración limitada**: 128 muestras de 4096 tokens en un conjunto mixto pueden no representar dominios especializados (código, textos legales, idiomas distintos del inglés), con riesgo de mayor pérdida en esos casos.
- **Riesgo de alucinación**: inherente a los modelos generativos; no hay evaluación publicada que permita acotarlo en esta versión cuantizada.
- **Licencia ambigua en la práctica**: la etiqueta declara Apache 2.0, pero la model card remite a la licencia Gemma 4 de Google y afirma que sus restricciones siguen vigentes. Verificar los términos aplicables antes de uso comercial.
- **Idiomas no documentados**: no se especifica cobertura lingüística; el rendimiento en castellano no está garantizado ni medido.
- **Contexto desconocido**: no se publica la longitud de contexto soportada, lo que impide dimensionar la caché KV y planificar la VRAM con precisión.
- **Artefacto de terceros**: no es una publicación oficial de Google; la integridad y el soporte dependen de Positron AI.
- **Sin garantía de mantenimiento**: 0 likes y 679 descargas indican una adopción baja, con menor probabilidad de soporte comunitario o corrección de errores.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/positron-ai/google_gemma-4-31B-it-ingest-best-gptq
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- GPTQModel: no disponible en la información proporcionada
- Paper de GPTQ: no disponible en la información proporcionada
- Demo o blog del autor: no disponible en la información proporcionada
