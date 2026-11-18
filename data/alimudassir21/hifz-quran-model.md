# alimudassir21/hifz-quran-model

## Resumen

Basira es una exportación a ONNX de `tarteel-ai/whisper-base-ar-quran`, un modelo Whisper Base ajustado para el reconocimiento automático de voz (ASR) de recitación del Corán en árabe. Lo publica el usuario `alimudassir21` bajo el identificador `alimudassir21/hifz-quran-model` y está pensado para ejecutarse íntegramente en el navegador mediante transformers.js, de modo que el audio de la recitación nunca abandona el dispositivo del usuario.

El modelo resuelve un problema muy concreto: la transcripción de recitación coránica en árabe con un despliegue ligero y local, sin depender de infraestructura de servidor. Se ofrece en tres variantes de cuantización (fp16 para WebGPU con soporte de `shader-f16`, q4 para WebGPU sin ese soporte y dynamic int8 para WASM), lo que permite cubrir desde teléfonos modernos hasta equipos con GPUs de gama antigua.

La relevancia actual radica en su enfoque on-device: elimina la necesidad de enviar audio sensible a la nube, reduce la latencia y habilita aplicaciones educativas o de verificación de recitación (hifz) en el propio navegador. Al estar basado en Whisper Base, su tamaño es reducido (el repositorio ocupa unos 0,5 GB) y su licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Base), exportado a ONNX |
| Parametros totales | no disponible (Whisper Base, aproximadamente 74 M según arquitectura de referencia) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper) |
| Tipos de cuantizacion | fp16, q4 (MatMulNBits, block_size 32, simétrica), dynamic int8 |
| Idiomas soportados | árabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (variantes fp16, q4 e int8) |

## Arquitectura y entrenamiento

El modelo es un Whisper Base estándar (transformer encoder-decoder con atención completa) fine-tuneado por Tarteel AI sobre el dataset `tarteel-ai/everyayah`, orientado a recitación coránica en árabe. La exportación a ONNX mantiene la arquitectura original y añade variantes cuantizadas: los ficheros fp16 e int8 provienen del repositorio `aaqibhabib/whisper-base-ar-quran-onnx`, mientras que los ficheros q4 se obtienen cuantizando el export fp32 de ese mismo repositorio con `MatMulNBitsQuantizer` de onnxruntime.

No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron etapas de RLHF o DPO. La innovación técnica destacable no está en el entrenamiento, sino en el empaquetado: exportaciones ONNX optimizadas para transformers.js con backend WebGPU o WASM, y una nota de implementación relevante: el `generation_config.json` no incluye `alignment_heads`, que son una constante de arquitectura de Whisper Base y se parchean en tiempo de ejecución desde el worker de Basira (`WHISPER_BASE_ALIGNMENT_HEADS`).

## Capacidades

- Reconocimiento automático de voz (ASR) en árabe, especializado en recitación coránica.
- Transcripción de audio con marcas de tiempo a nivel de palabra cuando se configuran las `alignment_heads` en tiempo de ejecución.
- Ejecución on-device en el navegador mediante transformers.js, con backend WebGPU (fp16 y q4) o WASM (int8).
- Procesamiento local del audio: no requiere enviar datos a servidores externos.
- Compatibilidad con el pipeline `automatic-speech-recognition` de transformers.js.
- No se documentan capacidades de tool calling, agentes, visión, audio generativo ni modo de razonamiento extendido.

## Casos de uso

- Verificación de recitación (hifz) en aplicaciones educativas: el modelo transcribe la recitación del estudiante en el navegador y permite compararla con el texto coránico de referencia, sin que el audio salga del dispositivo.
- Aplicaciones web de aprendizaje del Corán con corrección en tiempo real: al ejecutarse con WebGPU o WASM, la latencia se mantiene baja y no depende de la conectividad del usuario.
- Herramientas de accesibilidad para personas con discapacidad auditiva que siguen sesiones de recitación: la transcripción local permite generar subtítulos sin infraestructura de servidor.
- Despliegue en entornos con requisitos estrictos de privacidad (mezquitas, madrasas, dispositivos compartidos): el procesamiento íntegramente local evita el envío de audio a terceros.
- Aplicaciones móviles o PWA de bajo consumo: la variante int8 (23 MB de encoder y 79 MB de decoder) es adecuada para dispositivos con recursos limitados y backend WASM.
- Prototipado rápido de pipelines ASR en árabe: la integración con transformers.js permite probar el modelo con unas pocas líneas de JavaScript, sin necesidad de montar un servidor de inferencia.
- Investigación sobre ASR especializado en dominios religiosos: sirve como base reproducible y ligera para comparar técnicas de cuantización y backends en el navegador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 0,5 GB y las variantes individuales pesan entre 19 MB y 158 MB por componente (encoder o decoder).
- GPU recomendadas: adaptadores WebGPU con soporte de `shader-f16` (teléfonos modernos, GPUs de clase RTX o Apple Silicon) para la variante fp16; adaptadores WebGPU sin `shader-f16` (por ejemplo, NVIDIA de clase Pascal) para la variante q4.
- Cabe en GPU de consumo: sí, al tratarse de un modelo Whisper Base con variantes cuantizadas de tamaño reducido; también funciona en CPU mediante el backend WASM con la variante int8.
- Opciones de despliegue: transformers.js en el navegador (WebGPU o WASM); no se documentan despliegues con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Basira (este modelo) | Whisper Base (aprox. 74 M) | no disponible (ventana de 30 s) | árabe | Apache 2.0 | ONNX (fp16, q4, int8) |
| tarteel-ai/whisper-base-ar-quran | Whisper Base (aprox. 74 M) | no disponible (ventana de 30 s) | árabe | no disponible en la informacion proporcionada | safetensors / PyTorch |
| aaqibhabib/whisper-base-ar-quran-onnx | Whisper Base (aprox. 74 M) | no disponible (ventana de 30 s) | árabe | no disponible en la informacion proporcionada | ONNX (fp16, int8) |
| Whisper Base original (OpenAI) | Whisper Base (aprox. 74 M) | no disponible (ventana de 30 s) | multilingüe | MIT (según la referencia original) | PyTorch / ONNX |

## Limitaciones y advertencias

- Especializado exclusivamente en árabe y en el dominio de recitación coránica; su rendimiento fuera de ese dominio no está documentado.
- No se han publicado evaluaciones de sesgo, alucinación ni robustez ante ruido o acentos distintos del corpus de entrenamiento.
- La ventana de audio está limitada a los 30 segundos típicos de Whisper Base; no se documenta soporte para audio de mayor duración sin segmentación previa.
- El `generation_config.json` no incluye `alignment_heads`; si se usa el modelo fuera del worker de Basira, es necesario parchearlas en tiempo de ejecución para obtener marcas de tiempo fiables.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del dataset de origen antes de un despliegue en producción.
- El rendimiento en el navegador depende del soporte de WebGPU y de `shader-f16` del dispositivo; en adaptadores sin ese soporte debe usarse la variante q4 o el backend WASM.
- No se documentan métricas de latencia ni de throughput, por lo que la planificación de capacidad en producción requiere medición propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alimudassir21/hifz-quran-model
- Modelo base: https://huggingface.co/tarteel-ai/whisper-base-ar-quran
- Export ONNX de referencia: https://huggingface.co/aaqibhabib/whisper-base-ar-quran-onnx
- Dataset de entrenamiento: https://huggingface.co/datasets/tarteel-ai/everyayah
- Aplicación Basira: https://basira.institute
