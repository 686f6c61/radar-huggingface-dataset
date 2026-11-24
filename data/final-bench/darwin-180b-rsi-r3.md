# FINAL-Bench/Darwin-180B-RSI-R3

## Resumen

Darwin-180B-RSI-R3 es un modelo de lenguaje multimodal (texto e imagen) de tipo Mixture-of-Experts (MoE) con 180 mil millones de parámetros totales, desarrollado por FINAL-Bench (asociado al proyecto VIDRAFT). Se presenta como un modelo de razonamiento con modo «thinking», ventana de contexto de hasta 262 000 tokens y capacidades de salida estructurada orientadas a extracción de documentos. Su rasgo diferencial es que se ha construido mediante un proceso de «recursive self-improvement» (RSI) a nivel de modelo: según la model card, hereda las capas de expertos de Qwen3.8-Flash-Next y reconstruye únicamente las capas de atención y de experto compartido mediante auto-mejora recursiva.

El modelo es relevante por tres motivos concretos: ocupa el primer puesto del ranking ExtractBench con 90,29 (por delante de su modelo padre, Qwen3.8-Flash-Next, con 89,88) y el tercero en EvasionBench con 77,83; y, según la model card, en el benchmark privado SuperCLUE de noviembre de 2026 alcanza 73,68 en razonamiento matemático y científico, lo que lo sitúa como el primer modelo de pesos abiertos de esa tabla y el segundo global, solo por detrás de GPT-6.1-Sol (76,32).

La arquitectura combina atención híbrida (atención lineal más atención clásica), 512 expertos en configuración MoE dispersa y un pipeline `image-text-to-text`. Está publicado con licencia `qwen-community-1.0`, con pesos en safetensors y un repositorio de 360 GB. La información disponible no detalla el número de parámetros activos por token ni el volumen exacto de tokens de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE dispersa con atención híbrida (lineal + atención clásica), 512 expertos |
| Parámetros totales | 179 999 981 459 (~180 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | 262 144 tokens (262K) |
| Tipos de cuantización | BF16 (pesos originales); GGUF de 4 bits (variante POCKET-Darwin-180B-GGUF, 111 GB) |
| Idiomas soportados | en, ko, zh, ja, multilingüe |
| Licencia | qwen-community-1.0 (`license: other`) |
| Formato de pesos | safetensors (repo de 360 GB); GGUF en variante separada |
| Pipeline | image-text-to-text |
| Librería | transformers |
| Despliegue | vLLM, endpoint compatible con OpenAI; GGUF para CPU/llama.cpp |

## Arquitectura y entrenamiento

El modelo es un transformer de tipo Mixture-of-Experts con 512 expertos y atención híbrida, que combina mecanismos de atención lineal con atención clásica para sostener contextos largos (262K tokens). Según la model card, la construcción siguió un proceso de «model-level recursive self-improvement»: las capas de expertos se heredan de Qwen3.8-Flash-Next y solo se reconstruyen las capas de atención y el experto compartido. No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La model card menciona además dos capacidades técnicas distintivas: el modo «thinking» (razonamiento explícito antes de responder) y el mecanismo ZTC («zero-token-confidence»), que aparece como etiqueta pero cuya descripción técnica no se detalla en el material proporcionado. También se documenta soporte de salida estructurada y evaluación específica en tareas de extracción de documentos (ExtractBench) y de evasión (EvasionBench). No hay información disponible sobre decodificación especulativa ni sobre detalles del tokenizador.

## Capacidades

- Generación de texto y razonamiento explícito en modo «thinking».
- Razonamiento matemático y científico de alto rendimiento (73,68 en SuperCLUE de noviembre de 2026 según la model card).
- Comprensión de imágenes junto con texto (pipeline `image-text-to-text`, evaluado en MMMU-Pro).
- Extracción estructurada de documentos: primer puesto en ExtractBench con 90,29.
- Salida estructurada (structured output) para pipelines de extracción y formateo.
- Capacidades multilingües en inglés, coreano, chino y japonés, con etiqueta «multilingual».
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente en la información disponible.
- Compatibilidad con endpoints de tipo OpenAI y despliegue en vLLM.

## Casos de uso

- Extracción de datos de documentos: el modelo lidera ExtractBench (90,29), por lo que es adecuado para convertir facturas, contratos o formularios en JSON estructurado con alta fidelidad, aprovechando su salida estructurada.
- Análisis de documentos largos con imágenes: con 262K tokens de contexto y entrada multimodal, puede procesar informes extensos con tablas y figuras en una sola pasada sin trocear el contenido.
- Razonamiento matemático y científico asistido: útil en entornos de investigación para resolver problemas de nivel competitivo (AIME 2026, HMMT, GPQA Diamond según los distintivos de la model card) y explicar el razonamiento paso a paso.
- Asistencia legal y revisión de contratos: los resultados reportados en LEXam y LEXam-hard sugieren utilidad para preguntas de dominio jurídico y análisis de cláusulas, siempre con revisión humana.
- Atención al cliente multilingüe: soporta inglés, coreano, chino y japonés, lo que permite desplegar un asistente multi-turno con contexto largo para mercados de Asia Oriental.
- Despliegue en hardware limitado: la variante GGUF de 4 bits (111 GB) permite ejecución en CPU a 18–21 tok/s en un mini PC de 128 GB o en un DGX Spark, según la model card, lo que habilita prototipos locales sin clúster de GPU.
- Evaluación de robustez y seguridad: su tercer puesto en EvasionBench (77,83) lo hace candidato para probar la resistencia de sistemas frente a intentos de evasión en entornos controlados.

## Benchmarks y rendimiento

Resultados reportados en la model card (no verificados de forma independiente). Los distintivos de la model card atribuyen varios primeros puestos a la versión R1 de la línea, no necesariamente a R3; se indica la versión cuando el material lo especifica.

| Benchmark | Resultado | Posición reportada | Versión |
|---|---|---|---|
| ExtractBench | 90,29 | #1 | R3 |
| EvasionBench | 77,83 | #3 | R3 |
| SuperCLUE (matemáticas y ciencia, nov. 2026) | 73,68 | #1 en pesos abiertos, #2 global | R3 |
| SuperCLUE (índice de inteligencia global) | 43,08 | #9 de 19, #5 en pesos abiertos | R3 |
| MMLU-Pro | 87,65 % | — | R3 (GGUF 4 bits, idéntico a BF16) |
| MMLU-Pro | 88,12 % | #1 | R1 |
| GPQA Diamond | 94,44 % | #1 | R1 |
| MMMU-Pro | 79,48 % | #1 | R1 |
| AIME 2026 | 100 % | #1 | R1 |
| HMMT Feb 2026 | 100 % | #1 | R1 |
| LEXam | 68,94 % | #1 | R1 |
| LEXam-hard | 45,72 | #1 | R1 |
| IFStruct | 98,95 % | #1 | R1 |
| MDPBench | 83,65 | #1 | R1 |

Comparativa SuperCLUE de noviembre de 2026 (razonamiento matemático y científico):

| Modelo | Desarrollador | Pesos abiertos | Puntuación |
|---|---|---|---|
| GPT-6.1-Sol | OpenAI | No | 76,32 |
| Darwin-180B-RSI-R3 | VIDRAFT | Sí | 73,68 |
| Gemini-4-Argon | Google | No | 71,05 |
| DeepSeek-V4.1-Flash | DeepSeek | Sí | 71,05 |
| Grok-4.7 | xAI | No | 68,42 |
| Qwen3.8-Max-0902 | Alibaba | No | 68,42 |
| GLM-5.3 | Zhipu AI | Sí | 65,79 |
| Kimi-K3.1-Pro | Moonshot | Sí | 63,16 |
| Qwen3.8-Flash (padre) | Alibaba | Sí | 57,89 |

## Requisitos de hardware

- Pesos completos en BF16: repositorio de 360 GB; la inferencia requiere un clúster multi-GPU (varias A100/H100 de 80 GB) o particionado por capas.
- Cuantización de 4 bits (GGUF): 111 GB según la model card; ejecutable en CPU a 18–21 tok/s en un mini PC de 128 GB de RAM, un DGX Spark o un portátil con 8 GB de GPU y 32 GB de RAM (con descarga de capas a RAM/CPU).
- GPU recomendadas: no se especifican en la información disponible; por tamaño, el despliegue BF16 requiere GPUs de centro de datos (A100/H100). Para consumer GPU, la vía práctica es la variante GGUF.
- Despliegue: vLLM y endpoints compatibles con OpenAI para el modelo completo; GGUF/llama.cpp para la variante POCKET.
- Latencia y throughput: solo se documenta el rendimiento CPU de la variante GGUF (18–21 tok/s). No hay datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Pesos abiertos | Notas |
|---|---|---|---|---|---|
| Darwin-180B-RSI-R3 | ~180 B (MoE, 512 expertos) | 262K | qwen-community-1.0 | Sí | Multimodal; #1 ExtractBench (90,29); 73,68 en SuperCLUE |
| Qwen3.8-Flash-Next (padre) | no disponible | no disponible | no disponible | Sí | 57,89 en SuperCLUE; 89,88 en ExtractBench |
| DeepSeek-V4.1-Flash | no disponible | no disponible | no disponible | Sí | 71,05 en SuperCLUE |
| GLM-5.3 | no disponible | no disponible | no disponible | Sí | 65,79 en SuperCLUE |
| Kimi-K3.1-Pro | no disponible | no disponible | no disponible | Sí | 63,16 en SuperCLUE |

Los datos de parámetros, contexto y licencia de los modelos comparables no se detallan en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado detalles sobre sesgos conocidos, composición del dataset ni procesos de alineación; no es posible evaluar sesgos sistemáticos con la información disponible.
- Riesgo de alucinación inherente a los modelos generativos; los resultados en razonamiento matemático y científico no eximen de verificación en dominios de alta exigencia.
- La ventana de 262K tokens no garantiza calidad uniforme en todo el rango; no hay datos publicados sobre degradación con la longitud.
- Cobertura idiomática declarada limitada a inglés, coreano, chino y japonés; el español no figura entre los idiomas soportados.
- Licencia `qwen-community-1.0` (marcada como `other`): es necesario revisar el archivo LICENSE antes de cualquier uso comercial; no se detallan en la información disponible las restricciones concretas.
- Los benchmarks proceden de la model card del autor y de SuperCLUE; no se han verificado de forma independiente. Varios primeros puestos corresponden a la versión R1, no a R3.
- El repositorio de 360 GB impone requisitos de almacenamiento y ancho de banda considerables; la variante GGUF de 4 bits reduce el peso a 111 GB pero sigue exigiendo mucha RAM.
- El funcionamiento del mecanismo ZTC y del proceso de auto-mejora recursiva no está documentado técnicamente en el material disponible, lo que dificulta auditar su comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FINAL-Bench/Darwin-180B-RSI-R3
- Variante GGUF: https://huggingface.co/FINAL-Bench/POCKET-Darwin-180B-GGUF
- Modelo predecesor (R1): https://huggingface.co/FINAL-Bench/Darwin-180B-RSI
- Sitio del desarrollador: https://vidraft.net
- SuperCLUE: https://www.superclueai.com/homepage
- ExtractBench: https://huggingface.co/datasets/llamaindex/ExtractBench
- EvasionBench: https://huggingface.co/datasets/FutureMa/EvasionBench
- GPQA: https://huggingface.co/datasets/Idavidrein/gpqa
- MMLU-Pro: https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro
- MMMU-Pro: https://huggingface.co/datasets/MMMU/MMMU_Pro
- AIME 2026: https://huggingface.co/datasets/MathArena/aime_2026
- HMMT Feb 2026: https://huggingface.co/datasets/MathArena/hmmt_feb_2026
- LEXam: https://huggingface.co/datasets/LEXam-Benchmark/LEXam
- LEXam-hard: https://huggingface.co/datasets/joelniklaus/LEXam-hard
- IFStruct: https://huggingface.co/datasets/LiquidAI/ifstruct-v1.0
- MDPBench: https://huggingface.co/datasets/Delores-Lin/MDPBench
- Papers citados en las etiquetas: arXiv:2605.14386, arXiv:2609.20269
