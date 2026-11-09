# neavo/SenseVoiceSmall-ONNX-WebGPU-W8A32

## Resumen

SenseVoiceSmall ONNX WebGPU W8A32 es una derivada experimental del modelo de reconocimiento automatico del habla SenseVoiceSmall, desarrollado originalmente por FunAudioLLM (Alibaba). La aportacion de esta version, publicada por el usuario neavo, consiste en una cuantizacion de solo pesos a 8 bits (W8A32) con activaciones en FP32, exportada a formato ONNX y disenada especificamente para ejecutarse con el proveedor de ejecucion WebGPU de `onnxruntime-node`. El objetivo es reducir el tamano del modelo un 71,5 % respecto al export FP32 original y acelerar la inferencia en GPU sin degradar de forma significativa la calidad de transcripcion.

El modelo base SenseVoiceSmall es un reconocedor multilingue (chino, ingles, japones, coreano y cantonés) con capacidad de deteccion de idioma, transcripcion y etiquetado de eventos acusticos. Esta version no es un checkpoint de Transformers: consume caracteristicas acusticas precalculadas por el frontend de sherpa-onnx, no audio en bruto, y requiere decodificacion CTC externa con el vocabulario `tokens.txt` incluido.

La relevancia actual radica en que demuestra un flujo viable de cuantizacion W8A32 con `MatMulNBits` para acelerar ASR en GPU nativa desde Node.js, con latencias medidas de 41-55 ms frente a 186-440 ms del modelo INT8 dinamico en CPU. Es una candidata experimental, no validada para produccion ni para calidad multilingue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SenseVoiceSmall (encoder transformer con decodificacion CTC); grafo ONNX con 281 nodos `com.microsoft.MatMulNBits` (bits=8) y 140 nodos `MatMul` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W8A32 (pesos INT8, activaciones FP32), block_size=32, simetrica, accuracy_level=1 |
| Idiomas soportados | chino (zh), ingles (en), japones (ja), coreano (ko), cantonés (yue) |
| Licencia | funasr-model-license (licencia propia de FunASR) |
| Formato de pesos | ONNX (`model.w8a32.onnx`, 267.523.195 bytes); no GGUF ni safetensors |

## Arquitectura y entrenamiento

El modelo base SenseVoiceSmall es un reconocedor de voz de tipo encoder transformer con salida CTC, entrenado por FunAudioLLM sobre datos multilingues en chino, ingles, japones, coreano y cantonés, e incluye etiquetado de eventos acusticos y deteccion de idioma. Esta derivada no reentrena el modelo: parte del export FP32 de sherpa-onnx (fecha 2024-07-17, espejo de `pengzhendong`) y aplica una cuantizacion offline de solo pesos.

La innovacion tecnica es el uso de 281 nodos `com.microsoft.MatMulNBits(bits=8)` en lugar del grafo orientado a CPU con `DynamicQuantizeLinear`/`MatMulInteger`. Las activaciones permanecen en FP32 y la cuantizacion se aplica solo a pesos constantes de `MatMul`, con `block_size=32`, simetria y `accuracy_level=1`. El grafo resultante reduce los nodos de copia host/dispositivo de 850 (INT8 dinamico original) a 7, lo que explica la mejora de latencia en WebGPU. El script `prepare.py` permite reproducir la cuantizacion con `onnxruntime==1.31.1`, `onnx==1.23.2`, `onnx-ir==1.1.0` y `numpy==2.5.4`.

## Capacidades

- Reconocimiento automatico del habla multilingue en chino, ingles, japones, coreano y cantonés.
- Deteccion automatica de idioma mediante el tensor de control `language`.
- Transcripcion con normalizacion de texto configurable mediante el tensor `text_norm`.
- Etiquetado de eventos acusticos heredado del modelo SenseVoiceSmall original.
- Inferencia en GPU mediante el proveedor WebGPU de `onnxruntime-node` 1.31.1.
- Inferencia en CPU con `executionProviders: ['cpu']` y `intraOpNumThreads: 1`.
- No soporta tool calling, agentes, vision ni audio en bruto directo: requiere caracteristicas acusticas precalculadas por el frontend de sherpa-onnx.

## Casos de uso

- Transcripcion de audio en aplicaciones de escritorio Electron o Node.js: el modelo se integra con `onnxruntime-node` y WebGPU para transcribir segmentos de 10-20 segundos en 41-55 ms, adecuado para dictado en tiempo real en Windows con GPU NVIDIA.
- Subtitulado y notas de reunion multilingues: la deteccion de idioma y el soporte de cinco lenguas permiten procesar conversaciones mixtas con el frontend de sherpa-onnx y decodificacion CTC.
- Procesamiento por lotes de archivos de audio en pipelines locales: al ser un grafo ONNX autocontenido de 267 MB, se puede distribuir con la aplicacion y ejecutar sin dependencias de Python.
- Integracion en herramientas de traduccion asistida (el autor lo valida en LinguaGacha): transcripcion de voz para alimentar pipelines de traduccion en tiempo real.
- Prototipado de ASR en navegador o entornos web: aunque la compatibilidad con ONNX Runtime Web no esta probada, el diseno WebGPU apunta a ese escenario.
- Evaluacion comparativa de estrategias de cuantizacion: sirve como referencia reproducible (con `prepare.py` y `benchmark.json`) para medir el impacto de W8A32 frente a INT8 dinamico y FP32 en ASR.

## Benchmarks y rendimiento

Mediciones del autor en Windows x64, Intel i5-14600K, NVIDIA RTX 4070 Ti SUPER, `onnxruntime-node 1.31.1`, dos entradas en japones, concurrencia uno, medianas de cinco ejecuciones alternas (excluyen carga de modelo, preprocesado, decodificacion CTC y E/S):

| Modelo / proveedor | Entrada 10 s | Entrada 20 s |
|---|---:|---:|
| INT8 dinamico original / CPU (4 hilos) | 186,29 ms | 440,36 ms |
| INT8 dinamico original / WebGPU | 352,37 ms | 546,67 ms |
| FP32 / WebGPU | 40,84 ms | 48,08 ms |
| **W8A32 / WebGPU** | **41,20 ms** | **54,94 ms** |

- Tamano de archivo un 71,5 % menor que el FP32 original (937.617.178 bytes).
- Aproximadamente 8x mas rapido que el INT8 dinamico en CPU (muestra de 20 s) y un 14 % mas lento que FP32 en WebGPU.
- Carga de sesion WebGPU: 1,27 s (W8A32) frente a 1,70 s (FP32).
- Inferencia CPU monohilo de la muestra de 20 s: 2,15-2,24 s.
- No se realizo evaluacion etiquetada de WER/CER multilingue.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el archivo ONNX ocupa 267,5 MB, por lo que la huella en GPU es reducida y cabe en GPUs consumer con varios GB de VRAM.
- GPU validadas: NVIDIA RTX 4070 Ti SUPER en Windows x64. Otras GPU, macOS y Linux no han sido validadas.
- Cabe en GPU consumer: si, segun el tamano del grafo; la validacion se limita a la RTX 4070 Ti SUPER.
- Despliegue: `onnxruntime-node` 1.31.1 con `executionProviders: ['webgpu']`; para CPU, `executionProviders: ['cpu']` con `intraOpNumThreads: 1`. No es compatible como pipeline de Transformers, vLLM, llama.cpp, Ollama ni TGI.
- Latencia medida: 41,20 ms (10 s) y 54,94 ms (20 s) en WebGPU; 2,15-2,24 s en CPU monohilo para 20 s.
- Nota: en CPU con 4 hilos el proceso podia colgarse al cerrar en el host probado; el autor recomienda un solo hilo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SenseVoiceSmall ONNX WebGPU W8A32 (este) | no disponible | no disponible | 41,20 ms / 54,94 ms (WebGPU) | funasr-model-license | Hugging Face (experimental) |
| SenseVoiceSmall INT8 dinamico original | no disponible | no disponible | 186,29 ms / 440,36 ms (CPU 4 hilos) | funasr-model-license | Export sherpa-onnx |
| SenseVoiceSmall FP32 | no disponible | no disponible | 40,84 ms / 48,08 ms (WebGPU) | funasr-model-license | ModelScope (`pengzhendong`) |

No se dispone de datos comparativos con otros modelos ASR (Whisper, Parakeet, etc.) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental: no es una cuantizacion sin perdida ni una candidata validada para produccion.
- En la muestra de 20 s, el token `ディ社って` paso a `ィ社って` respecto a FP32; la diferencia se atribuye a la cuantizacion y se observo tanto en CPU como en GPU.
- No se realizo evaluacion etiquetada de WER/CER multilingue; la coincidencia CPU/GPU no demuestra precision de reconocimiento.
- Consume caracteristicas acusticas precalculadas, no audio en bruto; requiere el frontend de sherpa-onnx, ajustes CMVN/LFR y decodificacion CTC con `tokens.txt` (no sustituible por otro tokenizador).
- Compatibilidad con ONNX Runtime Web (navegador) no probada; solo validado con `onnxruntime-node` nativo en Windows/NVIDIA.
- Sin validacion en otras GPU, macOS, Linux, navegadores, flujos multimedia completos ni reconocimiento de formato largo.
- En CPU con 4 hilos el proceso podia colgarse al cerrarse; usar un solo hilo como solucion alternativa.
- La licencia `funasr-model-license` impone condiciones propias; revisar `LICENSE` y `UPSTREAM_LICENSE` antes de uso comercial.
- Riesgo de sesgos y alucinaciones propio del modelo base no evaluado en esta derivada.

## Enlaces

- Hugging Face: https://huggingface.co/neavo/SenseVoiceSmall-ONNX-WebGPU-W8A32
- Modelo base: https://huggingface.co/FunAudioLLM/SenseVoiceSmall
- Paper SenseVoice (arXiv:2407.04051): https://arxiv.org/abs/2407.04051
- Export FP32 de origen (ModelScope): https://www.modelscope.cn/models/pengzhendong/sherpa-onnx-sense-voice-zh-en-ja-ko-yue/resolve/73eca47697f980daa3d16112404174b6b950b514/model.onnx
- Proyecto sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- ONNX Runtime: https://onnxruntime.ai/
