# mistmlm/asr-models

## Resumen

`mistmlm/asr-models` es un repositorio de Hugging Face que no contiene un modelo único, sino un conjunto de artefactos compilados y pesos fuente para un pipeline completo de reconocimiento automático del habla (ASR) orientado a despliegue en la NPU Hexagon de Qualcomm (dispositivos de la familia Snapdragon, con compilación vía Qualcomm AI Hub). El autor, `mistmlm`, empaqueta los binarios ya compilados (formato context binary para HTP) junto con los modelos fuente en safetensors, PyTorch y ONNX.

El repositorio integra varios componentes: Qwen3-ASR en variantes de 0,6B y 1,7B (encoder, cabeza de lenguaje y decodificadores divididos por particiones prefill/decode), Qwen3-ForcedAligner 0,6B para alineamiento forzado, CAM++ para diarización de hablantes, SenseVoice-Small como ASR auxiliar y Silero VAD para detección de actividad de voz. El tamaño del repositorio es de 10,7 GB.

Su relevancia es práctica: documenta el proceso de exportación a ONNX, compilación con AI Hub y enlazado en context binaries, incluyendo correcciones específicas de precisión (eliminación de la operación Clip en fp16 que la HTP compila incorrectamente, y corrección de desbordamiento en RMSNorm). No se trata de un modelo entrenado por el autor, sino de una distribución de artefactos derivados de modelos de terceros (Qwen, FunAudioLLM, Silero) adaptados a hardware NPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los artefactos derivan de Qwen3-ASR, Qwen3-ForcedAligner, CAM++, SenseVoice-Small y Silero VAD; la arquitectura interna de cada uno no se detalla en la información) |
| Parametros totales | 0,6B (Qwen3-ASR 0.6B y Qwen3-ForcedAligner 0.6B); 1,7B (Qwen3-ASR 1.7B, incompleto); SenseVoice-Small, CAM++ y Silero VAD sin cifra indicada |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los binarios se compilan con `--no-quant` según los comandos documentados; existen también artefactos ONNX y DLC intermedios) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors de Qwen3-ASR 0.6B), PyTorch (`model.pt` de SenseVoice), ONNX (`campplus_t150.onnx`), binarios context binary propietarios de Qualcomm HTP (`.bin`), JSON de vocabulario/tokens |

## Arquitectura y entrenamiento

El repositorio no documenta el entrenamiento de ningún modelo; es una colección de artefactos de despliegue. La arquitectura subyacente corresponde a los modelos de origen: Qwen3-ASR (encoder acústico más decodificador autorregresivo particionado en prefill y decode, con cabeza `lm_head` separada), Qwen3-ForcedAligner (encoder y decoder para alineamiento temporal de transcripciones), CAM++ (embedding de hablante para diarización), SenseVoice-Small (ASR no autorregresivo) y Silero VAD (detección de voz).

La innovación técnica documentada es el pipeline de compilación para NPU: exportación a ONNX con torch 2.11 y onnx 1.22, compilación con `qai_hub` 0.52 para el dispositivo `s23` (Snapdragon 8 Gen 2) y enlazado de grafos en context binaries. Se detallan dos correcciones críticas: la eliminación de la operación Clip del encoder, porque la HTP compila el `clamp(±6.45e4)` en fp16 como ±10 y corrompe la salida del encoder, y una corrección de desbordamiento en fp16 de RMSNorm en el decoder del aligner. No hay información sobre tokens de entrenamiento, composición del dataset ni etapas de RLHF/DPO.

## Capacidades

- Reconocimiento automático del habla (transcripción) mediante Qwen3-ASR 0.6B y SenseVoice-Small.
- Alineamiento forzado de transcripción a audio (timestamps a nivel de palabra o token) con Qwen3-ForcedAligner 0.6B.
- Diarización de hablantes mediante embeddings de CAM++ (incluye una variante `cmpnogate`).
- Detección de actividad de voz (VAD) con Silero VAD.
- Despliegue en NPU Hexagon (HTP) de Qualcomm con binarios precompilados para el target `s23` (v73); existen también artefactos para `v79` (S25) del aligner, no descargados.
- Variante de ASR de mayor tamaño (Qwen3-ASR 1.7B) parcialmente disponible.
- No se documentan capacidades de tool calling, agentes, visión, audio generativo ni modo thinking.

## Casos de uso

- Transcripción en tiempo real en dispositivos móviles Snapdragon: los context binaries de Qwen3-ASR 0.6B y SenseVoice-Small están compilados para la HTP del `s23`, lo que permite ejecutar ASR en local sin depender de la nube.
- Subtitulado con marcas de tiempo: Qwen3-ForcedAligner 0.6B alinea una transcripción existente con el audio para generar timestamps por palabra, útil en pipelines de subtitulado y edición.
- Diarización de reuniones: CAM++ genera embeddings de hablante que permiten separar interlocutores en grabaciones multi-hablante combinándolo con el VAD de Silero para segmentar.
- Preprocesado de audio en pipelines de voz: Silero VAD (896 KB) filtra silencios antes de invocar el ASR, reduciendo cómputo en el dispositivo.
- Evaluación y prototipado en hardware Qualcomm: los scripts de exportación, compilación y enlace documentados permiten reproducir el pipeline y adaptarlo a otros targets de AI Hub.
- Investigación en despliegue NPU: el repositorio sirve como referencia de las correcciones necesarias (strip de Clip, fix de RMSNorm fp16) al portar transformers a HTP.
- Integración de ASR auxiliar ligero: SenseVoice-Small (501 MB) puede usarse como transcripción rápida en escenarios donde no se requiere el decodificador autorregresivo de Qwen3-ASR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: NPU Hexagon (HTP) de Qualcomm, con binarios compilados para el dispositivo `s23` (Snapdragon 8 Gen 2, target v73). Existen artefactos del aligner para `v79` (S25) no descargados.
- VRAM estimada para inferencia: no aplica en el target principal (ejecución en NPU); no disponible para ejecución en GPU.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No disponible; el repositorio está orientado a NPU móvil, no a GPU.
- Tamaño de los artefactos: Qwen3-ASR 0.6B ocupa 8 binarios que suman aproximadamente 2,47 GB (enc 377 MB, lm_head 312 MB, y seis particiones dec de 254-319 MB); Qwen3-ForcedAligner 0.6B suma 1,55 GB (enc 640 MB, dec 906 MB); SenseVoice-Small 501 MB; CAM++ 16 MB; Silero VAD 896 KB; Qwen3-ASR 1.7B parcial 2,7 GB (solo tres particiones prefill).
- Opciones de despliegue: Qualcomm AI Hub (compilación y enlace), runtime de Hexagon HTP; el repositorio menciona exportación ONNX y DLC como formatos intermedios. No se documenta vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El repositorio no es un modelo entrenado por el autor, sino una redistribución de artefactos derivados de modelos de terceros; la licencia de cada componente de origen no se indica y debe verificarse antes de uso comercial.
- Qwen3-ASR 1.7B está incompleto: faltan el encoder, `lm_head` y las tres particiones decode (aproximadamente 3,8 GB), por lo que no es desplegable tal cual.
- Los binarios están compilados específicamente para el target `s23` (v73); no son portables a otros dispositivos sin recompilar.
- Los artefactos ONNX (16,5 GB) y DLC (3,5 GB) fueron eliminados del repositorio; solo se conservan los binarios en producción y los pesos fuente.
- La eliminación de Clip en el encoder es obligatoria en HTP: sin ella la salida del encoder es incorrecta por el redondeo fp16 de `clamp(±6.45e4)` a ±10.
- El decoder del aligner requiere la corrección de desbordamiento fp16 en RMSNorm; sin ella el resultado no es fiable.
- No hay información sobre sesgos, tasas de alucinación, cobertura de idiomas ni robustez acústica.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria documentada.
- No se especifican requisitos de versión del runtime de Qualcomm más allá de las herramientas de compilación (torch 2.11, onnx 1.22, qai_hub 0.52).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mistmlm/asr-models
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
