# AMAImedia/NOESIS-Gemma4-12B-it-Qat-Q4_0-Unquantized-BF16

## Resumen

NOESIS-Gemma4-12B-it-Qat-Q4_0-Unquantized-BF16 es una redistribución del modelo `google/gemma-4-12b-it` publicada por AMAImedia como parte del proyecto NOESIS, una plataforma profesional de doblaje multilingüe automatizado. El modelo base es el Gemma 4 12B de Google, un transformer de 11.959.730.224 parámetros con una ventana de contexto de hasta 262.144 tokens, liberado bajo los Gemma Terms of Use.

La particularidad de este bundle es que incluye un módulo adicional llamado "Path A G4→G3 aligner v1", un adaptador no lineal entrenado para mapear los estados ocultos de salida de Gemma 4 a la distribución que espera el modelo Scenema-DiT, utilizado en el pipeline de doblaje de NOESIS. Los pesos del modelo en sí no han sido modificados respecto al upstream de Google; el aligner se aplica en tiempo de inferencia como un componente sidecar.

Este lanzamiento es relevante porque documenta un caso práctico de integración de un LLM moderno en un sistema de generación de audio/vídeo, y porque pone de manifiesto las dificultades técnicas de sustituir un modelo por otro en pipelines existentes. El bundle se encuentra en estado "held for experiments", es decir, no está listo para producción según sus propios autores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 12B, basada en Google) |
| Parametros totales | 11.959.730.224 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (segun llmrun.dev; no confirmado en la model card) |
| Tipos de cuantizacion | BF16 (pesos sin cuantizar, segun el nombre y el tamano del repo de 24.2 GB) |
| Idiomas soportados | en, multilingual (segun tags; la model card menciona 13 lenguas en el aligner: es, pt, de, it, ru, fr, en, sw, hi, zh, ja, ar, ko) |
| Licencia | Gemma Terms of Use (https://ai.google.dev/gemma/terms) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 12B parámetros, el Gemma 4 12B de Google, con capacidades multimodales (imagen-texto) segun los tags de HuggingFace. No se dispone de informacion detallada sobre la arquitectura interna (numero de capas, dimensiones, atencion) ni sobre el proceso de entrenamiento del modelo base, ya que la model card de NOESIS no incluye esos datos.

Los pesos incluidos en este bundle son identicos a los publicados por Google en `google/gemma-4-12b-it`; AMAImedia no ha realizado ningun fine-tuning ni modificacion de los pesos. El componente adicional, el aligner Path A G4→G3, es un modulo no lineal (LayerNorm → Linear-GELU-Linear + residual → per-layer scale/bias) entrenado durante 12.000 pasos en una GPU AWS L40S para alinear los estados ocultos de Gemma 4 con la distribucion esperada por Scenema-DiT. Este aligner no puede fusionarse con los pesos del transformer y debe ejecutarse como un paso intermedio en el pipeline.

## Capacidades

- Generacion de texto y conversacion en multiples idiomas (ingles y otros, segun los tags).
- Procesamiento de entradas de imagen y texto (segun el tag `image-text-to-text`), aunque no se detallan las capacidades visuales especificas.
- Integracion con el sistema Scenema-DiT para doblaje automatico, mediante el aligner G4→G3 que adapta los estados ocultos.
- Soporte de 13 lenguas en el aligner (es, pt, de, it, ru, fr, en, sw, hi, zh, ja, ar, ko), con calidad alta en 12 de ellas (coseno medio 0.908) y debil en coreano (0.728).
- No se mencionan capacidades de tool calling, agentes, razonamiento multi-paso ni modo thinking en la informacion disponible.

## Casos de uso

- Doblaje automatico de contenido audiovisual: el modelo actua como codificador de texto en el pipeline NOESIS, generando representaciones ocultas que alimentan al modelo de difusion Scenema-DiT para producir audio sincronizado. Es el caso de uso principal para el que fue disenado el bundle.
- Generacion de texto general en entornos de investigacion: al ser el Gemma 4 12B sin modificar, puede usarse para tareas estandar de generacion de texto, resumen, traduccion o analisis, siempre que se respeten los terminos de licencia de Google.
- Experimentacion con adaptadores entre modelos: el aligner G4→G3 sirve como ejemplo de como conectar un LLM a un sistema que espera una distribucion de estados oculta especifica, util para investigadores que trabajen en integracion de modelos.
- Evaluacion de calidad multilingue: el bundle incluye metricas de alineacion por idioma (coseno medio por lengua), lo que permite estudiar el comportamiento del modelo en 13 idiomas y comparar con otros sistemas de doblaje.
- Desarrollo de pipelines de texto-a-voz con control fino: aunque el modelo no genera audio directamente, su integracion con Scenema-DiT permite experimentar con la generacion de voz a partir de texto en multiples lenguas.
- Benchmarking de modelos base: al ser una copia fiel del Gemma 4 12B, puede utilizarse para reproducir evaluaciones del modelo original sin depender de la infraestructura de Google.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval o GSM8K. Los unicos datos cuantitativos son las metricas de alineacion del aligner (coseno medio por idioma), que no son comparables con benchmarks estandar de LLMs.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 24 GB (12B parametros × 2 bytes), lo que requiere una GPU con al menos 24 GB de VRAM, como una RTX 3090, RTX 4090, A100 40GB o similar.
- Con cuantizacion Q4_K_M (si se aplicara), la VRAM necesaria se reduce a unos 8.23 GB segun llmrun.dev, permitiendo su ejecucion en GPUs consumer de 8-12 GB como RTX 3060 o RTX 4070.
- El aligner adicional anade un coste computacional extra en tiempo de inferencia, aunque su tamano no se especifica.
- Opciones de despliegue: compatible con transformers (HuggingFace), y FriendliAI ofrece inferencia de baja latencia para este modelo. Tambien puede usarse con vLLM, llama.cpp u Ollama si se generan los formatos adecuados (GGUF, etc.), aunque no se proporcionan dichos archivos en el repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| NOESIS-Gemma4-12B-it (este) | 11.96B | 262K (segun llmrun) | Gemma Terms | HuggingFace |
| google/gemma-4-12b-it (original) | 11.96B | 262K (segun llmrun) | Gemma Terms | HuggingFace |
| google/gemma-3-12b-it (modelo anterior) | 12B (aprox.) | 128K (segun documentacion de Gemma 3) | Gemma Terms | HuggingFace |

La model card incluye una comparacion tecnica entre Gemma 3 12B y Gemma 4 12B en cuanto a la forma de los estados ocultos y su compatibilidad con Scenema-DiT. Gemma 4 presenta una varianza por canal mucho mayor (hasta 163.295 frente a 13) y una norma apilada por capa mucho menor (23.464 frente a 10.267.738), lo que hace que la sustitucion directa falle sin el aligner. No se dispone de comparaciones de rendimiento en tareas de lenguaje.

## Limitaciones y advertencias

- El bundle no esta listo para produccion: la propia model card lo marca como "held for experiments" y advierte que el aligner solo funciona correctamente en 12 de 13 idiomas; el coreano (ko) tiene una calidad de alineacion baja (coseno 0.728) y no supera el umbral de aceptacion.
- Los pesos son los de Google sin modificar, por lo que cualquier uso debe cumplir los Gemma Terms of Use, incluyendo la Politica de Usos Prohibidos y la obligacion de redistribuir los terminos y atribuir a Google.
- El aligner no puede fusionarse con los pesos del modelo; requiere un paso adicional en el pipeline, lo que anade complejidad operativa y latencia.
- No se proporcionan benchmarks de rendimiento en tareas de lenguaje, por lo que no es posible evaluar la calidad del modelo frente a alternativas.
- El modelo puede presentar sesgos y alucinaciones inherentes a los LLMs, aunque no se documentan casos especificos en la informacion disponible.
- La informacion sobre capacidades multimodales (imagen-texto) proviene de los tags de HuggingFace, pero no se detalla en la model card; se recomienda verificar antes de usarlo en tareas de vision.

## Enlaces

- HuggingFace: https://huggingface.co/AMAImedia/NOESIS-Gemma4-12B-it-Qat-Q4_0-Unquantized-BF16
- Modelo base de Google: https://huggingface.co/google/gemma-4-12b-it
- Pagina oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- Despliegue en FriendliAI: https://friendli.ai/models/AMAImedia/NOESIS-Gemma4-12B-it-Qat-Q4_0-Unquantized-BF16
- Referencia de hardware en llmrun.dev: https://llmrun.dev/model/google-gemma-4-12b-it-qat-q4-0-unquantized
- Modelo similar de igorls: https://huggingface.co/igorls/gemma-4-12B-it-qat-q4_0-unquantized-heretic
