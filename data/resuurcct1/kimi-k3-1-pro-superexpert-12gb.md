# resuurcct1/Kimi-K3.1-Pro-SuperExpert-12GB

## Resumen

Kimi K3.1 Pro SuperExpert (12GB) es una consolidación on-device del modelo MoE de 2,8 billones de parámetros `moonshotai/Kimi-K3.1-Pro` de Moonshot AI, publicada por el usuario `resuurcct1` (la model card atribuye la autoría a Shashanth Athukuri). El autor afirma haber comprimido el modelo base hasta una huella de 12 GB mediante una técnica propietaria denominada AW-SECD (Activation-Weighted Super-Expert Consolidation & Residual Drift Compensation), con una retención de inteligencia declarada del 94,8 %. El objetivo declarado es ejecutar un modelo de la clase Kimi en equipos de consumo con 16 GB de RAM.

El repositorio contiene 12.008.815.616 parámetros reales en safetensors (aproximadamente 12 GB), distribuidos según la model card en 18 shards. La arquitectura declarada combina Gated DeepSeek Sparse Attention (Gated DSA) con Kernelized Delta Attention (KDA) y una longitud de contexto nativa de 1.048.576 tokens. Los pesos se ofrecen también en formato GGUF y con licencia Apache 2.0.

La relevancia del modelo reside en su propuesta de llevar un MoE de escala frontera a hardware de consumo, algo que, de confirmarse, cambiaría el cálculo de costes para despliegues locales de razonamiento, matemáticas y código. No obstante, la práctica totalidad de los datos técnicos y de rendimiento provienen exclusivamente de la model card del autor, sin verificación independiente, y el repositorio presenta cero descargas y cero likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE basada en `moonshotai/Kimi-K3.1-Pro`; atención Gated DeepSeek Sparse Attention (Gated DSA) + Kernelized Delta Attention (KDA) según el autor |
| Parámetros totales | 12.008.815.616 (dato real de safetensors); el modelo base declara 2,8 T con 104 B activos |
| Parámetros activos | no disponible para la versión consolidada de 12 GB |
| Longitud de contexto | 1.048.576 tokens (1M), según la model card |
| Tipos de cuantización | 8-bit declarado en los tags; GGUF disponible; el autor no detalla esquemas adicionales |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (18 shards) y GGUF |

## Arquitectura y entrenamiento

La model card describe el modelo base como un MoE de 2,8 billones de parámetros totales con 104 mil millones activos, y la versión consolidada como una compresión de ese mismo modelo mediante AW-SECD. El autor define AW-SECD como una consolidación de "super-expertos" ponderada por activaciones, complementada con un mecanismo de compensación de deriva residual. No se publican detalles del algoritmo: ni la formulación matemática, ni el número de expertos que se fusionan, ni el procedimiento de calibración, ni el conjunto de datos utilizado para estimar las activaciones.

Respecto al entrenamiento, no hay información sobre tokens de preentrenamiento, composición del dataset, fases de RLHF o DPO, ni sobre el proceso de destilación o compresión aplicado. La innovación técnica destacable, si se confirma, es la propia consolidación: reducir un MoE de escala frontera a 12 GB manteniendo el 94,8 % del rendimiento agregado. Tampoco se documentan técnicas de decodificación especulativa ni optimizaciones de inferencia específicas para la versión consolidada.

## Capacidades

- Generación de texto general con pipeline `text-generation`.
- Razonamiento matemático: la model card incluye ejemplos de resolución de ecuaciones diferenciales y reporta GSM8K.
- Generación de código: el autor reporta HumanEval y etiqueta el modelo con `code`.
- Razonamiento de sentido común y conocimiento general (ARC-Challenge, MMLU).
- Seguimiento de instrucciones (IFEval).
- Contexto largo nativo de hasta 1.048.576 tokens según el autor.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Razonamiento matemático local: el modelo puede resolver problemas de álgebra, cálculo y estadística paso a paso en un portátil con 16 GB de RAM, sin depender de API externa, gracias a su huella de 12 GB y a su rendimiento declarado en GSM8K (83,5 %). Adecuado para entornos con requisitos de privacidad o sin conectividad.
- Asistencia a la programación en el IDE: con HumanEval declarado de 78,4 %, puede integrarse en editores o extensiones locales para autocompletado, explicación de código y generación de tests, manteniendo el código fuente dentro de la máquina del desarrollador.
- Procesamiento de documentos extensos: la ventana de 1M tokens permite analizar contratos, informes o bases de código completas en una sola pasada, útil para resumen, extracción de entidades y preguntas sobre el documento.
- Análisis de logs y trazas largas: la combinación de contexto de 1M tokens y ejecución on-device permite correlacionar eventos en ficheros de traza extensos sin enviar datos sensibles a terceros.
- Prototipado e investigación de compresión de modelos: sirve como referencia práctica para estudiar la viabilidad de consolidar MoE de gran escala en hardware de consumo, comparando su comportamiento con el modelo base.
- Educación y tutoría offline: despliegue en aulas o dispositivos sin red para asistencia en matemáticas y ciencias, con licencia Apache 2.0 que permite redistribución.
- Evaluación de seguimiento de instrucciones: con IFEval declarado de 80,2 %, puede utilizarse para generar respuestas estructuradas en pipelines de datos sintéticos ejecutados localmente.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card. No hay verificación independiente disponible.

| Benchmark | Foundation 2.8T MoE | Kimi K3.1 Pro 12GB SuperExpert | Retención % |
|---|---|---|---|
| ARC-Challenge | 89,4 % | 86,2 % | 96,4 % |
| GSM8K | 88,1 % | 83,5 % | 94,8 % |
| HumanEval | 82,6 % | 78,4 % | 94,9 % |
| MMLU | 81,2 % | 76,8 % | 94,6 % |
| IFEval | 84,7 % | 80,2 % | 94,7 % |
| Agregado | 85,2 % | 81,0 % | 94,8 % |

## Requisitos de hardware

- VRAM estimada: 12 GB en 8-bit para los pesos; con overhead de contexto y caché KV se recomienda al menos 14-16 GB de VRAM o RAM unificada.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), A100 y H100 para despliegues de mayor concurrencia. El autor apunta a equipos de consumo con 16 GB de RAM.
- Cabe en GPU de consumo: sí, según el autor, en tarjetas con 16 GB o más (RTX 4080, 4090, 4060 Ti de 16 GB). En GPUs de 8-12 GB requeriría cuantización adicional a 4-bit, no documentada.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`, Ollama (`ollama run hf.co/...`) y GGUF. vLLM y TGI no están documentados para esta versión.
- Latencia y throughput: no disponible. El autor no publica mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3.1 Pro SuperExpert 12GB | 12,0 B (consolidado de 2,8 T) | 1.048.576 | MMLU 76,8 %, GSM8K 83,5 %, HumanEval 78,4 % | Apache 2.0 | Hugging Face, GGUF, Ollama |
| moonshotai/Kimi-K3.1-Pro (base) | 2,8 T totales / 104 B activos | no disponible | MMLU 81,2 %, GSM8K 88,1 %, HumanEval 82,6 % | no disponible | Hugging Face |
| Alternativas de ~12 B on-device | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría (consolidaciones on-device de MoE de gran escala) en la documentación proporcionada.

## Limitaciones y advertencias

- Todos los datos de rendimiento y retención provienen exclusivamente de la model card del autor; no hay evaluación independiente ni réplica pública de los benchmarks.
- El repositorio registra cero descargas y cero likes en el momento de la ficha, lo que impide validar su funcionamiento en producción.
- La técnica AW-SECD no está documentada: no se publican detalles del algoritmo, del dataset de calibración ni del procedimiento de consolidación, lo que dificulta auditar la fidelidad respecto al modelo base.
- El autor de la model card (Shashanth Athukuri) no coincide con el propietario del repositorio (`resuurcct1`), y los enlaces internos de la card apuntan a otro repositorio (`shashanth-27xA9`), lo que introduce dudas sobre la trazabilidad.
- Riesgo de alucinación: no cuantificado; al ser una consolidación agresiva de un MoE de 2,8 T, la deriva residual podría manifestarse en dominios no cubiertos por los benchmarks declarados.
- Idiomas soportados no documentados; no se puede garantizar calidad fuera del inglés.
- Contexto de 1M tokens declarado sin verificación; el rendimiento real en ventanas largas puede degradarse y el coste de caché KV a esa longitud es elevado.
- Licencia Apache 2.0 permite uso comercial y redistribución, pero el modelo base `moonshotai/Kimi-K3.1-Pro` podría tener condiciones propias no reflejadas en esta ficha; conviene verificar la licencia del modelo original antes de un despliegue comercial.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; debe revisarse antes de usarlo en entornos sensibles.
- No hay información sobre sesgos conocidos ni sobre evaluaciones de seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/resuurcct1/Kimi-K3.1-Pro-SuperExpert-12GB
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Repositorio referenciado en la model card: https://huggingface.co/shashanth-27xA9/Kimi-K3.1-Pro-SuperExpert-12GB
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
