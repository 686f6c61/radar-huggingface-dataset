# hanhuo-org/hanhuo-niyin-models

## Resumen

Hanfire Niyin (汉火拟音 v1.0) es un conjunto de pesos preentrenados y ajustados para síntesis de voz (TTS) y síntesis de voz cantada (SVS) centrado en el chino histórico. Lo desarrolla la organización hanhuo-org y se distribuye como espejo del release v1.0 de su repositorio en GitHub. El modelo resuelve un problema de nicho: la generación de audio inteligible para variedades históricas del chino (chino antiguo, chino medio y mandarín temprano), una tarea para la que apenas existen recursos abiertos.

El paquete combina dos pilares técnicos: por un lado, una pila TTS basada en ZipVoice con vocoder Vocos, exportada a ONNX e INT8 para ejecución en navegador mediante WebGPU/WASM y para estudio en FP32; por otro, modelos de canto DiffSinger a 44,1 kHz (una voz femenina y una voz masculina multispeaker) con vocoder PC-NSF-HiFiGAN. El repositorio ocupa 2,9 GB e incluye léxicos de tres eras, anclas de referencia y bancos de melodías.

Es relevante ahora porque ofrece una cadena completa y reproducible (checkpoints, exportaciones ONNX, cuantización QAT INT8, léxico y dataset complementario) bajo licencia Apache 2.0, lo que permite desplegar TTS histórico tanto en servidor como íntegramente en el navegador sin dependencias de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ZipVoice (TTS, decoder flow-matching) + Vocos (vocoder espectral); DiffSinger (SVS) + PC-NSF-HiFiGAN (vocoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32, INT8 (W8A8 QAT con `torch.int8`), ONNX INT8 |
| Idiomas soportados | zh (chino: antiguo, medio y mandarín temprano) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`), ONNX (`.onnx`), archivos `.tar.gz` con pesos y recursos auxiliares |

## Arquitectura y entrenamiento

La pila TTS se articula en dos etapas: un codificador de texto y un decodificador flow-matching (ZipVoice) que genera representaciones acústicas, seguido de un vocoder Vocos que las convierte en forma de onda a 24 kHz. Existe un checkpoint de estudio FP32 (470 MB) y su versión INT8 (124 MB) obtenida mediante cuantización consciente del entrenamiento (QAT) con tipos `torch.int8` reales (W8A8). Para despliegue web se publican modelos ONNX INT8 troceados (text encoder, flow-matching decoder y vocoder) ejecutables con ONNX Runtime Web sobre WebGPU o WASM. También se incluye una exportación ONNX FP32 sin cuantizar para desarrollo y pruebas de paridad.

La rama de canto emplea DiffSinger a 44,1 kHz con dos variantes: una voz femenina entrenada sobre OpenCpop (40 000 pasos) y una masculina multispeaker sobre M4Singer (6 hablantes, 40 000 pasos), ambas con vocoder PC-NSF-HiFiGAN de 2025.02. El repositorio incluye además el checkpoint base V5 (`base_v5_fp32.pt`, 469 MB) para reproducir el entrenamiento de la V10, un léxico unificado de tres eras de 51 735 caracteres, anclas de referencia a 24 kHz, una tabla de rima `mc_qieyun_unified.tsv` y un banco de melodías Tang. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición exacta del corpus, aunque se enlaza un dataset complementario.

## Capacidades

- Síntesis de voz (TTS) en chino histórico: chino antiguo, chino medio y mandarín temprano.
- Síntesis de voz cantada (SVS) a 44,1 kHz con voces femenina y masculina (multispeaker, 6 hablantes).
- Conversión de texto a audio con léxico específico de tres eras y tabla de rima de chino medio.
- Inferencia en navegador mediante WebGPU/WASM con modelos ONNX INT8 troceados.
- Inferencia en servidor con checkpoints PyTorch FP32 o INT8 y con ONNX INT8 independiente.
- Control de melodía y F0 en tiempo de ejecución mediante bancos de referencia Tang-diao.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- Capacidad multilingüe limitada al chino (etiqueta `zh`); no se declaran otros idiomas.

## Casos de uso

- Investigación lingüística histórica: generar pronunciaciones sintéticas de chino antiguo, medio y mandarín temprano a partir del léxico de tres eras para estudiar evolución fonética y rimas.
- Docencia y divulgación: producir audios de ejemplo de pronunciación histórica en materiales educativos sin depender de grabaciones de especialistas.
- Aplicaciones web interactivas: integrar el paquete ONNX INT8 con ONNX Runtime Web para ofrecer TTS histórico directamente en el navegador, sin backend ni envío de texto a servidores.
- Producción musical y recreación: usar los modelos DiffSinger a 44,1 kHz para generar voces cantadas en estilos históricos con control de melodía mediante el banco Tang-diao.
- Preservación y archivo sonoro: sintetizar lecturas de textos clásicos con pronunciación reconstruida para archivos y proyectos de humanidades digitales.
- Desarrollo y evaluación de pipelines TTS: emplear la exportación ONNX FP32 como referencia de paridad y el checkpoint base V5 para reproducir y extender el entrenamiento.
- Prototipado de asistentes de lectura: combinar el TTS con visores de texto clásico para lectura asistida de obras en chino histórico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por tamaño de checkpoint, el TTS de estudio FP32 (470 MB) y el INT8 (124 MB) son manejables en GPUs de consumo, mientras que los modelos DiffSinger de canto (365 MB por variante) requieren además el vocoder de 44,1 kHz (51 MB).
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos unos pocos GB de VRAM libre debería poder ejecutar los checkpoints, aunque no se confirma.
- GPU de consumo: el paquete web INT8 está diseñado para ejecutarse en navegador vía WebGPU/WASM, lo que sugiere viabilidad en equipos de consumo con GPU integrada o dedicada; no se detallan modelos concretos.
- Opciones de despliegue: PyTorch (checkpoints `.pt`), ONNX Runtime (modelos ONNX INT8 y FP32), ONNX Runtime Web (WebGPU/WASM). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Formatos | Licencia | Notas |
|---|---|---|---|---|---|
| Hanfire Niyin v1.0 | TTS + SVS histórico | zh (3 eras) | PyTorch, ONNX, INT8 | Apache 2.0 | Enfoque en chino histórico; ejecución web |
| ZipVoice (base) | TTS | no disponible | no disponible | no disponible | Arquitectura en la que se basa la pila TTS; no se dispone de comparativa de rendimiento |
| DiffSinger (base) | SVS | no disponible | no disponible | no disponible | Arquitectura en la que se basan los modelos de canto; no se dispone de comparativa de rendimiento |
| Vocos (base) | Vocoder | no disponible | no disponible | no disponible | Vocoder espectral empleado en la pila TTS |

No se dispone de datos de benchmarks ni de especificaciones comparables de alternativas equivalentes en chino histórico en la información proporcionada.

## Limitaciones y advertencias

- El alcance lingüístico se limita al chino y a variedades históricas; no se declara soporte para otros idiomas ni para chino contemporáneo estándar.
- No es un modelo de lenguaje: no ofrece razonamiento, código, matemáticas ni tool calling.
- La calidad de la pronunciación histórica depende de reconstrucciones académicas y del léxico incluido; puede no coincidir con consensos lingüísticos actuales.
- No se publican métricas objetivas (MOS, WER, similitud de hablante) que permitan evaluar la calidad del audio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria documentada.
- Los modelos de canto se entrenaron con 40 000 pasos sobre OpenCpop y M4Singer; el sobreajuste o la cobertura limitada de estilos no se documentan.
- Aunque la licencia es Apache 2.0, conviene verificar las licencias de los corpus de entrenamiento (OpenCpop, M4Singer) antes de un uso comercial de los modelos derivados.
- No se documentan sesgos demográficos ni de hablante; la representación se limita a las voces incluidas (una femenina y seis masculinas).
- El despliegue web depende de soporte de WebGPU/WASM en el navegador del usuario, lo que puede limitar la compatibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hanhuo-org/hanhuo-niyin-models
- Repositorio GitHub: https://github.com/hanhuo-org/niyin
- Release v1.0: https://github.com/hanhuo-org/niyin/releases/tag/v1.0
- Dataset complementario: https://huggingface.co/datasets/hanhuo-org/hanhuo-niyin-dataset
