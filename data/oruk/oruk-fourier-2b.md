# oruk/oruk-fourier-2b

## Resumen

oruk-fourier-2b es un modelo de reconocimiento automatico del habla (ASR) desarrollado por el usuario oruk y publicado en Hugging Face. Se trata de un ajuste fino del modelo Qwen/Qwen3-ASR-1.7B, orientado a transcripcion de audio en ingles con enfasis en robustez sobre dominios diversos (reuniones, llamadas, discurso espontaneo y audio de dominio publico). Con 2.038.052.480 parametros totales, se posiciona en la franja de modelos ASR de tamano medio que pueden desplegarse en infraestructura modesta.

El modelo se distribuye en formatos safetensors, ONNX y GGUF, lo que facilita su integracion tanto en pipelines de transformers como en entornos de inferencia optimizados (sherpa-onnx, llama.cpp y derivados). Su relevancia actual radica en que combina un tamano contenido con resultados competitivos en el Open ASR Leaderboard, incluyendo conjuntos exigentes como AMI, Earnings22, SPGISpeech y VoxPopuli.

La licencia es CC-BY-NC-4.0, lo que restringe el uso comercial. Esta pensado para investigadores y desarrolladores que necesiten un ASR de referencia en ingles con pesos abiertos y multiples formatos de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3-ASR-1.7B) |
| Parametros totales | 2.038.052.480 |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (incluye Q8_0 documentado), safetensors BF16, ONNX |
| Idiomas soportados | en (ingles) |
| Licencia | cc-by-nc-4.0 |
| Formato de pesos | safetensors, ONNX, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-ASR-1.7B, un modelo de reconocimiento de voz basado en transformer con codificador de audio y decodificador de texto. oruk-fourier-2b es un ajuste fino sobre esa base; la model card no detalla el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se especifica si se introdujeron innovaciones como decodificacion especulativa o atencion lineal.

La informacion disponible indica que el modelo se evalua en BF16 y en cuantizacion Q8_0 GGUF mediante transcribe.cpp, lo que sugiere que el autor valido el comportamiento tanto en precision completa como en formatos cuantizados orientados a despliegue. Los resultados publicados en la model card proceden de PRs del Open ASR Leaderboard (PR #298 y PR #304), lo que aporta trazabilidad sobre la metodologia de evaluacion.

## Capacidades

- Reconocimiento automatico del habla en ingles, incluyendo audio de reuniones, llamadas y discurso espontaneo.
- Transcripcion de audio de formato largo (long-form), con resultados reportados en Earnings21 y Earnings22.
- Evaluacion sobre dominios acusticos variados: AMI, Gigaspeech, SPGISpeech, VoxPopuli, URGENT2024 y Voice Arena Monsoon.
- Soporte de cuantizacion Q8_0 en GGUF para inferencia eficiente.
- Compatibilidad con sherpa-onnx y con el ecosistema transformers.
- Capacidad de tool calling, agentes o razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: limitadas a ingles segun la model card.
- Modo thinking, vision o audio generativo: no disponible.

## Casos de uso

- Transcripcion de reuniones corporativas: el modelo obtiene un WER de 6,73 en AMI-Cleaned, un conjunto de reuniones multiparticipe, por lo que es adecuado para generar actas y resumenes a partir de audio de sala.
- Analisis de llamadas de atencion al cliente: con WER de 5,61 en Earnings22-Cleaned-AA-chunked, puede emplearse para transcribir conversaciones telefonicas y alimentar sistemas de calidad o analitica.
- Subtitulado de contenido audiovisual en ingles: su WER de 1,46 en Voxpopuli-AA-Cleaned lo hace util para generar subtitulos en discurso parlamentario y material de dominio publico.
- Transcripcion de audio financiero y de resultados empresariales: los resultados en Earnings21 y Earnings22 long-form permiten procesar llamadas de resultados con terminologia especializada.
- Despliegue en dispositivos con recursos limitados: la disponibilidad de GGUF Q8_0 y ONNX permite ejecutar inferencia en CPU o GPUs modestas mediante sherpa-onnx o transcribe.cpp.
- Investigacion en ASR: sirve como punto de comparacion reproducible en el Open ASR Leaderboard, con resultados declarados en multiples benchmarks y trazabilidad via PRs.
- Procesamiento por lotes de archivos de audio: la combinacion de safetensors y ONNX facilita integrar el modelo en pipelines de transcripcion masiva en servidores.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente salvo donde se indica la fuente):

| Dataset | Metrica | Valor |
|---|---|---|
| AMI-Cleaned | WER (BF16) | 6,73 |
| Earnings22-Cleaned-AA-chunked | WER (BF16) | 5,61 |
| Gigaspeech-Cleaned | WER (BF16) | 6,50 |
| SPGISpeech | WER (BF16) | 1,87 |
| URGENT2024 | WER (BF16) | 9,03 |
| URGENT2024-Clean | WER (BF16) | 4,28 |
| Voice Arena Monsoon (en_IN) | WER (BF16) | 3,42 |
| Voxpopuli-AA-Cleaned | WER (BF16) | 1,46 |
| GigaSpeechBench (PHL-EN, >0,5 s) | WER (BF16, greedy) | 9,68 |
| LibriSpeech clean | WER (Q8_0 GGUF) | 1,40 |
| FLEURS en_us | WER (Q8_0 GGUF) | 3,58 |
| Earnings21 (long-form) | WER (BF16, merge_compounds=True) | 7,43 |
| Earnings21 (long-form) | WER (BF16, merge_compounds=False) | 7,87 |

No se han publicado en la informacion disponible resultados de benchmarks de otros modelos comparables para establecer una comparacion directa.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 4 GB solo para pesos (2.038 millones de parametros a 2 bytes), mas overhead de activaciones y del codificador de audio; en la practica se recomienda reservar entre 6 y 8 GB.
- VRAM estimada en Q8_0 GGUF: alrededor de 2,2-2,5 GB para pesos, por lo que cabe en GPUs consumer de gama media y en CPU con suficiente RAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 o superiores para BF16; A100 o H100 si se necesita alto throughput por lotes.
- Cabe en GPU consumer: si, especialmente en cuantizacion Q8_0 o en formatos ONNX.
- Opciones de despliegue: transformers (safetensors), sherpa-onnx (ONNX), transcribe.cpp y llama.cpp/derivados para GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| oruk/oruk-fourier-2b | 2.038 M | no disponible | CC-BY-NC-4.0 | safetensors, ONNX, GGUF | Fine-tune de Qwen3-ASR-1.7B, solo ingles |
| Qwen/Qwen3-ASR-1.7B (base) | ~1.700 M | no disponible | no disponible en esta ficha | safetensors | Modelo base del que deriva |
| Alternativas ASR de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion |

No se dispone de datos suficientes en la informacion proporcionada para una comparativa cuantitativa con otros modelos ASR.

## Limitaciones y advertencias

- Licencia CC-BY-NC-4.0: prohibido el uso comercial sin autorizacion expresa del titular.
- Solo soporta ingles; no se declaran capacidades multilingues.
- Los resultados de benchmarks son declarados por el autor y no estan verificados de forma independiente (campo "verified": false en la mayoria).
- Riesgo de alucinacion y errores de transcripcion en audio con ruido, acentos no nativos o terminologia especializada; el WER de 9,03 en URGENT2024 y 9,68 en GigaSpeechBench PHL-EN indica degradacion en condiciones adversas.
- No se documenta la longitud de contexto, lo que limita la planificacion de inferencia sobre audios muy largos sin chunking.
- No hay informacion sobre sesgos demograficos o acusticos del ajuste fino.
- El modelo base es Qwen3-ASR-1.7B; conviene revisar la licencia y condiciones del modelo base antes de su uso en produccion.
- No se detallan los datos de entrenamiento, lo que dificulta evaluar la cobertura de dominios y la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oruk/oruk-fourier-2b
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Open ASR Leaderboard PR #298: https://github.com/huggingface/open_asr_leaderboard/pull/298
- Open ASR Leaderboard Long-Form PR #304: https://github.com/huggingface/open_asr_leaderboard/pull/304
- Evaluacion GigaSpeechBench PHL-EN: https://huggingface.co/oruk/oruk-fourier-2b/blob/main/evaluations/gigaspeechbench-phl-en/README.md
- Evaluacion Q8 English: https://huggingface.co/oruk/oruk-fourier-2b/blob/main/evaluations/q8-english/README.md
