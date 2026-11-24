# mradermacher/Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-GGUF

## Resumen

Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic es un modelo de lenguaje de aproximadamente 9.200 millones de parámetros (9.197.093.888 según los pesos en safetensors) obtenido mediante la fusión de dos modelos derivados de la familia Qwen3.5. El modelo original fue creado por el usuario xtools-at y esta ficha corresponde a la versión cuantizada en formato GGUF publicada por mradermacher, un conocido distribuidor de cuantizaciones estáticas para el ecosistema llama.cpp.

El modelo combina linajes de destilación de trazas de razonamiento de Claude Opus y DeepSeek, junto con datos de entrenamiento orientados a agentes y tool calling (hermes-agent-reasoning-traces). La fusión se realiza mediante SLERP (Spherical Linear Interpolation) a partir de dos modelos base, lo que da lugar a un modelo "2xMerge". El sufijo "heretic" indica que se ha aplicado un proceso de decensurado o ablación de rechazos, orientado a reducir las negativas del modelo ante peticiones legítimas.

Es relevante ahora porque ofrece, en un tamaño de 9B apto para hardware de consumo, capacidades declaradas de razonamiento, generación de código, matemáticas y uso de herramientas, con soporte multilingüe (inglés, chino, español, ruso y japonés) bajo licencia Apache 2.0. La disponibilidad de cuantizaciones GGUF desde Q2_K hasta f16 facilita su despliegue en entornos locales con llama.cpp u Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5), fusión SLERP de dos modelos |
| Parametros totales | 9.197.093.888 (~9,2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en, zh, es, ru, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo cuantizado); safetensors en el modelo base |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de la familia Qwen3.5, con aproximadamente 9.200 millones de parámetros. El modelo final no se entrena desde cero, sino que se obtiene mediante una fusión SLERP (interpolación esférica lineal) de dos modelos derivados, técnica habitual para combinar capacidades de distintos linajes sin un coste de entrenamiento completo. El resultado se etiqueta como "2xMerge", indicando la combinación de dos ramas.

Los datos de entrenamiento declarados en la model card incluyen tres conjuntos: `Jackrong/Claude-opus-4.6-TraceInversion-9000x` y `Jackrong/Claude-opus-4.7-TraceInversion-5000x` (trazas de razonamiento destiladas de Claude Opus 4.6 y 4.7) y `lambda/hermes-agent-reasoning-traces` (trazas de razonamiento orientadas a agentes y uso de herramientas). El sufijo "heretic" indica que se ha aplicado una técnica de ablación de direcciones de rechazo (decensoring), que reduce la tendencia del modelo a negarse ante ciertas peticiones. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento multi-paso, con trazas de razonamiento destiladas de modelos Claude Opus y DeepSeek.
- Generación de código y resolución de problemas de matemáticas y STEM (etiquetas `coding`, `math`, `stem`).
- Soporte de tool calling y function calling (etiquetas `tool-use`, `function-calling`).
- Capacidades orientadas a agentes y razonamiento multi-paso (dataset hermes-agent-reasoning-traces).
- Multilingüe: inglés, chino, español, ruso y japonés.
- Modo "uncensored/decensored" (heretic): menor tasa de rechazos ante peticiones.
- Soporte multimodal declarado mediante los ficheros auxiliares `mmproj` (proyección multimodal), lo que sugiere capacidad de entrada de imágenes en el ecosistema llama.cpp.

## Casos de uso

- Asistente de código en local: el modelo puede generar y explicar código en un entorno de desarrollo integrado con llama.cpp u Ollama, aprovechando sus capacidades de coding y su tamaño de 9B para ejecutarse en GPU de consumo.
- Agentes con uso de herramientas: gracias al soporte de tool calling y a las trazas de razonamiento orientadas a agentes, puede integrarse en pipelines que invocan APIs, bases de datos o funciones externas de forma iterativa.
- Razonamiento matemático y STEM en entornos educativos: útil para resolver problemas paso a paso y explicar el procedimiento, con cuantizaciones Q5_K_M o Q6_K para preservar calidad.
- Atención al cliente multilingüe: soporta inglés, español, ruso, japonés y chino, lo que permite desplegar un asistente conversacional en varios idiomas con un único modelo.
- Procesamiento de documentos con entrada de imagen: los ficheros `mmproj` permiten, en teoría, alimentar el modelo con imágenes junto a texto para tareas de descripción o extracción de información.
- Experimentación en investigación sobre fusión de modelos: sirve como caso de estudio de fusión SLERP y destilación de trazas de razonamiento, al estar publicados los datasets y el modelo base.
- Despliegue en hardware limitado: las cuantizaciones Q4_K_S (5,6 GB) y Q4_K_M (5,9 GB) permiten ejecución en GPU con 8 GB de VRAM o en CPU con RAM suficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ~4,1 GB; Q4_K_S ~5,6 GB; Q4_K_M ~5,9 GB; Q5_K_M ~6,8 GB; Q6_K ~7,7 GB; Q8_0 ~9,9 GB; f16 ~18,5 GB. Añadir aproximadamente 0,7-1,0 GB si se usa la proyección multimodal (`mmproj`).
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090 para cuantizaciones Q4-Q8; A100 o H100 para f16 y despliegues de alta concurrencia.
- Cabe en GPU de consumo: sí, con cuantizaciones Q4_K_S/Q4_K_M en tarjetas de 8 GB o más; Q6_K y Q8_0 requieren 10-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF (el repo incluye la etiqueta `endpoints_compatible`). vLLM y TGI no soportan GGUF de forma nativa, por lo que requerirían el modelo base en safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Wukong-9B-Qwen3.5-...-heretic (este) | ~9,2B | no disponible | Apache 2.0 | GGUF, safetensors | Fusión SLERP, destilado de Claude/DeepSeek, decensurado |
| Qwen2.5-7B-Instruct | ~7,6B | 32K (típico en la familia) | Apache 2.0 | safetensors, GGUF | Modelo base oficial de Alibaba, sin fusión |
| Llama-3.1-8B-Instruct | ~8B | 128K | Llama 3.1 Community | safetensors, GGUF | Modelo oficial de Meta, licencia con restricciones |
| DeepSeek-R1-Distill-Qwen-7B | ~7,6B | 32K (típico) | MIT | safetensors, GGUF | Destilado de razonamiento de DeepSeek |

Nota: los datos de contexto de los modelos comparables no están confirmados en la información proporcionada y se indican como referencia orientativa de la familia; para este modelo, el contexto figura como no disponible.

## Limitaciones y advertencias

- Al ser una fusión SLERP de modelos destilados, la calidad puede degradarse respecto a los modelos originales en tareas específicas; no hay benchmarks publicados que lo confirmen.
- El proceso "heretic" (decensurado) reduce los rechazos, lo que aumenta el riesgo de generar contenido inapropiado o dañino; requiere filtros externos en producción.
- Riesgo de alucinación inherente a los modelos de 9B, especialmente en tareas de razonamiento largo o datos factuales.
- Longitud de contexto no documentada; no se debe asumir una ventana amplia sin verificación empírica.
- Los datasets de destilación provienen de trazas de Claude Opus y DeepSeek; las condiciones de uso de esos datos pueden estar sujetas a las políticas de los proveedores originales, aunque la licencia del modelo se declara Apache 2.0.
- El soporte multimodal depende de ficheros `mmproj` y del runtime (llama.cpp); no está garantizado en todos los backends.
- El modelo está pensado para investigación y experimentación; para producción conviene validar con evaluaciones propias antes de desplegar.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-GGUF
- Modelo base: https://huggingface.co/xtools-at/Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic
- Cuantizaciones imatrix/weighted: https://huggingface.co/mradermacher/Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-GGUF
- Dataset de trazas Claude Opus 4.6: https://huggingface.co/datasets/Jackrong/Claude-opus-4.6-TraceInversion-9000x
- Dataset de trazas Claude Opus 4.7: https://huggingface.co/datasets/Jackrong/Claude-opus-4.7-TraceInversion-5000x
- Dataset de trazas de agentes Hermes: https://huggingface.co/datasets/lambda/hermes-agent-reasoning-traces
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
