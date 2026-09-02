# jbilcke/whisper-medical-large-onnx

## Resumen

`jbilcke/whisper-medical-large-onnx` es una exportación ONNX cuantizada a 4 bits del modelo `Na0s/Medical-Whisper-Large-v3`, un fine-tune de `openai/whisper-large-v3` entrenado sobre consultas médicas entre doctor y paciente (dataset `Na0s/Primock_med`). El autor, jbilcke, ha adaptado el modelo para su ejecución en navegador mediante la librería `transformers.js` y el backend WebGPU de ONNX Runtime, reduciendo el peso a 1.26 GB de descarga total.

El modelo conserva la arquitectura original de Whisper: un transformer encoder-decoder con 32 capas en cada bloque, dimensión de modelo 1280, 128 bins mel y vocabulario de 51866 tokens, sumando 1.55 mil millones de parámetros. Su relevancia radica en permitir transcripción de audio médico directamente en el cliente web, sin necesidad de servidor, con una cuantización 4-bit que reduce el tráfico de VRAM y habilita su uso en GPUs de consumo.

La cuantización se realizó con `MatMulNBitsQuantizer` en formato `QOperator` (`com.microsoft.MatMulNBits`), compatible con ONNX Runtime Web. El autor documenta que solo la variante q4 es viable en navegador: q8 falla al crear la sesión y fp32 excede el límite de serialización de protobuf. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder) |
| Parametros totales | 1.55 B |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no especificada en la model card; el modelo base Whisper usa ventanas de 30 segundos de audio |
| Tipos de cuantizacion | q4 (4-bit, block size 32, simetrico, formato QOperator) |
| Idiomas soportados | en (aunque el base whisper-large-v3 es multilingue, el fine-tune esta etiquetado como ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (encoder_model_q4.onnx, decoder_model_merged_q4.onnx) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Whisper de OpenAI: un encoder que procesa espectrogramas mel de 128 bins y un decoder autoregresivo que genera texto. Con 32 capas en encoder y decoder, `d_model` de 1280 y vocabulario de 51866 tokens, es la variante "large" de Whisper. El fine-tune se realizó sobre el dataset `Na0s/Primock_med`, compuesto por consultas doctor-paciente, lo que especializa el modelo en terminología y patrones de habla médica.

La innovación principal de esta versión es la cuantización 4-bit mediante `MatMulNBitsQuantizer` con configuración `DefaultWeightOnlyQuantConfig`: 4 bits, block size 32, simetría y formato `QOperator`. Este formato es el único que ONNX Runtime Web soporta correctamente para pesos cuantizados. El autor descartó las rutas RTN y GPTQ porque el decoder fusionado tiene un nodo `If` cuyas ramas consumen entradas dentro de subgrafos, lo que rompe el `topological_sort` de `neural_compressor`. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Transcripción de voz médica en inglés, especializada en consultas doctor-paciente.
- Ejecución en navegador via `transformers.js` con backend WebGPU, sin necesidad de servidor.
- Procesamiento de audio largo mediante chunking (`chunk_length_s: 30`, `stride_length_s: 5`).
- Detección de idioma automatica (aunque se recomienda pasar `language` explicitamente para evitar errores).
- Compatibilidad con el pipeline `automatic-speech-recognition` de Hugging Face Transformers.js.
- No soporta tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo de reconocimiento de voz.

## Casos de uso

- Telemedicina en el navegador: transcripcion en tiempo real de consultas medicas dentro de una aplicacion web, usando WebGPU para mantener la latencia baja y sin enviar audio a un servidor.
- Documentacion clinica automatizada: integracion en sistemas de registro electronico de salud (EHR) para dictar notas de consulta, aprovechando la especializacion en vocabulario medico.
- Accesibilidad para pacientes con discapacidad auditiva: subtitulado en vivo de consultas medicas en la interfaz web del paciente.
- Analisis de grabaciones historicas: transcripcion de archivos de audio de consultas previas para busqueda y extraccion de informacion en investigacion medica.
- Formacion de estudiantes de medicina: transcripcion de simulaciones de consultas para revision y evaluacion, ejecutable en portatiles con GPU integrada.
- Podcasts y webinars medicos: generacion de subtitulos o actas de contenido audiovisual medico, con la ventaja de que el modelo reconoce jerga especifica del dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precision (WER) en la informacion disponible. La model card incluye una prueba de humo de rendimiento en CPU (Python onnxruntime 1.29, Apple M4, 11 segundos de audio, mediana de 3 ejecuciones):

| Configuracion | Tiempo de transcripcion |
|---|---|
| q4 (4-bit) | 17.0 s |
| fp32 | 7.1 s |

El autor advierte que esta inversion se debe al kernel CPU de `MatMulNBits`, que des-cuantiza por bloques de 32 elementos. En WebGPU se espera que el orden se invierta, pero no esta verificado. Esta prueba no establece la precision medica a 4 bits.

## Requisitos de hardware

- VRAM estimada: no especificada; al ser 4-bit y ejecutarse en navegador, se espera que funcione en GPUs integradas y discretas con soporte WebGPU.
- GPU recomendadas: cualquier GPU compatible con WebGPU (integradas Intel, AMD, NVIDIA de consumo). No se requiere GPU de datacenter.
- Si cabe en consumer GPU: si, el modelo esta disenado para ejecucion en navegador con WebGPU.
- Opciones de despliegue: `transformers.js` con backend WebGPU o wasm; tambien se puede usar con onnxruntime en Python, aunque no es el objetivo principal.
- Latencia y throughput: en CPU (Apple M4) q4 tarda 17.0 s para 11 s de audio (mas lento que tiempo real). En WebGPU se espera mejora, pero no hay datos verificados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Especializacion |
|---|---|---|---|---|---|
| jbilcke/whisper-medical-large-onnx | 1.55 B | 30 s audio | Apache-2.0 | ONNX q4 | Medico, navegador |
| Na0s/Medical-Whisper-Large-v3 | 1.55 B | 30 s audio | Apache-2.0 | PyTorch | Medico |
| openai/whisper-large-v3 | 1.55 B | 30 s audio | MIT (original) | PyTorch | General, multilingue |

La diferencia principal es el formato de pesos y el objetivo de despliegue: este modelo esta optimizado para navegador con cuantizacion 4-bit, mientras que los otros dos requieren un backend Python o servidor. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

## Limitaciones y advertencias

- Solo esta disponible la cuantizacion q4; q8 y fp32 no son viables en navegador por errores de sesion y limites de serializacion.
- El rendimiento en CPU es significativamente mas lento que tiempo real (17 s para 11 s de audio en Apple M4).
- No hay benchmarks de WER que validen la precision medica a 4 bits; la verificacion es una unica prueba de humo.
- El modelo esta etiquetado solo para ingles, aunque el base whisper-large-v3 es multilingue; el fine-tune puede degradar el rendimiento en otros idiomas.
- Riesgo de alucinaciones en transcripcion medica, comun en modelos de ASR, especialmente con terminologia poco frecuente.
- Dependencia de WebGPU para un rendimiento aceptable; en backend wasm se espera que sea mas lento que tiempo real.
- La fecha de creacion (2026-09-02) es futura, lo que sugiere que el modelo es muy reciente y aun no tiene adopcion (0 descargas, 0 likes).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jbilcke/whisper-medical-large-onnx
- Modelo base (Na0s/Medical-Whisper-Large-v3): https://huggingface.co/Na0s/Medical-Whisper-Large-v3
- OpenAI Whisper (repositorio original): https://github.com/openai/whisper
- openai/whisper-large-v3 en HuggingFace: https://huggingface.co/openai/whisper-large-v3
- Modelos ONNX en ONNX Runtime: https://onnxruntime.ai/models
- Coleccion de modelos Whisper ONNX de Echogarden: https://github.com/echogarden-project/whisper-onnx-models
