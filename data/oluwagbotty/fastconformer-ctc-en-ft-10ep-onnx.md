# oluwagbotty/fastconformer-ctc-en-ft-10ep-onnx

## Resumen

`fastconformer-ctc-en-ft-10ep-onnx` es la exportación a ONNX del modelo de reconocimiento automático del habla (ASR) `oluwagbotty/fastconformer-ctc-en-ft-10ep`, un FastConformer con decodificador CTC afinado sobre el dataset CDLI Non-Standard Speech (inglés rwandés). El autor del repositorio es `oluwagbotty`, y la exportación convierte en un único grafo ONNX el front-end de audio de NeMo, el encoder y el decoder, de modo que el dispositivo solo necesita `onnxruntime` para inferir.

La relevancia de esta ficha es doble: por un lado, demuestra el patrón de despliegue de modelos NeMo fuera del ecosistema PyTorch/NVIDIA, empaquetando el preprocesado de audio (16 kHz mono) dentro del propio grafo; por otro, documenta un caso de ASR para habla no estándar (inglés rwandés) con limitaciones explícitas de dominio, hablantes y condiciones de grabación. El modelo base es un FastConformer CTC de la familia NVIDIA NeMo, aunque el número exacto de parámetros del checkpoint afinado no está disponible en la información proporcionada.

El repositorio ocupa 0,5 GB y contiene `model.onnx`, `model.onnx.data`, `labels.json` y un fichero `check.json` con 50 grabaciones de prueba. La licencia es CC-BY-4.0 y el idioma declarado es únicamente inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder Conformer con subsampling 8x y atención de contexto limitado) + decoder CTC |
| Parámetros totales | no disponible (la variante "large" de NVIDIA FastConformer-CTC ronda 115M, pero no se confirma para este checkpoint) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo procesa audio completo; no se especifica límite de muestras) |
| Tipos de cuantización | no disponible (el repo se describe como exportación ONNX; el tag `base_model:quantized` sugiere cuantización del modelo base, sin detalle del esquema) |
| Idiomas soportados | inglés (`en`), concretamente inglés rwandés no estándar |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`model.onnx` + `model.onnx.data`), etiquetas en `labels.json` |

## Arquitectura y entrenamiento

El modelo base es un FastConformer CTC de NeMo: encoder Conformer con subsampling depthwise-separable de factor 8x, atención de contexto limitado con un token global y decoder CTC. La exportación ONNX integra el front-end de audio (log-mel a 16 kHz), el encoder y el decoder en un solo grafo con entradas `audio` (float32 `[1, samples]`) y `length` (int64 `[1]`), y salidas `log_probs` (`[1, frames, tokens + blank]`) y `frames`.

El ajuste fino se realizó durante 10 épocas (según el nombre del checkpoint) sobre el dataset `cdli/rwandan_english_nonstandard_speech_v1.0` del Centre for Digital Language Inclusion (UCL, 2025), con grabaciones en Ruanda en 2026: interiores, bajo ruido, app de tablet, con prompts de imagen (descripciones libres) y de texto (frases leídas). No se dispone de información sobre volumen de tokens, composición exacta del dataset ni uso de RLHF/DPO. La exportación se generó con `src/export_nemo_onnx.py` del repositorio del proyecto.

## Capacidades

- Reconocimiento automático del habla en inglés (transcripción de audio a texto).
- Decodificación greedy CTC: mejor token por frame, fusión de repeticiones y eliminación de blancos.
- Preprocesado de audio incluido en el grafo: acepta audio PCM float32 mono a 16 kHz directamente.
- Etiquetas exportadas en `labels.json` (blanco al final; `▁` marca inicio de palabra).
- Equivalencia funcional verificada con NeMo: mismo texto greedy en 50 de 50 grabaciones de prueba (`check.json`).
- No soporta tool calling, agentes, visión, audio de entrada multilingüe ni modos de razonamiento.

## Casos de uso

- Transcripción offline en dispositivos sin PyTorch: al ser un único grafo ONNX con `onnxruntime`, se puede desplegar en entornos embebidos o sin stack NVIDIA, incluyendo el front-end de audio.
- Evaluación de ASR para habla no estándar: útil como referencia para medir el rendimiento de modelos comerciales sobre inglés rwandés con acento y condiciones de grabación concretas.
- Prototipado de pipelines de subtitulado en inglés: el modelo devuelve log-probs listos para decodificación greedy o para decodificadores externos con modelo de lenguaje.
- Investigación en inclusión digital: el dataset y el modelo están orientados a hablantes con características no representadas en corpus estándar, y sirven para estudiar sesgos de ASR.
- Integración en apps de tablet o móvil: el tamaño del repo (0,5 GB) y la dependencia única de `onnxruntime` facilitan el despliegue en clientes.
- Verificación de exportaciones NeMo a ONNX: el fichero `check.json` y la equivalencia 50/50 con NeMo lo convierten en un caso de prueba para validar pipelines de exportación.
- Transcripción de frases leídas en entornos silenciosos: es el escenario donde el propio autor indica que el modelo rinde mejor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada es la equivalencia de salida greedy con NeMo en 50 de 50 grabaciones de prueba (`check.json`), que valida la exportación pero no mide calidad ASR (WER/CER).

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repo ocupa 0,5 GB y el modelo base es de tamaño "large" (~115M parámetros en la variante NVIDIA), por lo que la inferencia en FP32 requiere aproximadamente 0,5-1 GB de memoria.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; no se requiere A100/H100.
- Cabe en GPU consumer: sí, en cualquier GPU moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU con `onnxruntime`.
- Opciones de despliegue: `onnxruntime` (CPU o GPU), integración en aplicaciones nativas; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a ASR).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| oluwagbotty/fastconformer-ctc-en-ft-10ep-onnx | no disponible | no disponible | inglés rwandés | CC-BY-4.0 | ONNX |
| nvidia/stt_en_fastconformer_ctc_large | ~115M | no disponible | inglés | no disponible en la información | NeMo (.nemo) |
| oluwagbotty/fastconformer-ctc-en-ft-10ep (base) | no disponible | no disponible | inglés rwandés | no disponible en la información | NeMo/PyTorch |

La comparativa se limita a la familia FastConformer CTC; no se dispone de datos de rendimiento (WER) para comparar calidad entre ellos.

## Limitaciones y advertencias

- Pocos hablantes y condiciones estrechas: 9 hablantes de prueba, mayoritariamente hombres jóvenes, interiores silenciosos, habla leída y descrita por imágenes, no conversacional.
- Rendimiento desconocido en niños, otras discapacidades del habla, entornos ruidosos, audio telefónico o habla con cambio de código.
- Objetivos verbatim: las repeticiones por tartamudeo se escriben en las transcripciones; los bloqueos y prolongaciones no son visibles en texto.
- Las frases leídas aparecen en las transcripciones de entrenamiento, por lo que los resultados con prompts de imagen son la mejor guía para habla abierta.
- No usar para diagnosticar o evaluar condiciones del habla, identificar hablantes ni en decisiones clínicas, legales o policiales.
- Los términos del dataset CDLI prohíben reidentificar hablantes y crear voces que imiten a una persona.
- Una transcripción errónea puede cambiar el significado de lo dicho: mostrar el texto al hablante antes de actuar sobre él.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero las restricciones del dataset CDLI se mantienen.
- El repositorio no incluye el dataset y no puede compartirlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/oluwagbotty/fastconformer-ctc-en-ft-10ep-onnx
- Modelo base: https://huggingface.co/oluwagbotty/fastconformer-ctc-en-ft-10ep
- Dataset CDLI: https://huggingface.co/datasets/cdli/rwandan_english_nonstandard_speech_v1.0
- NVIDIA FastConformer-CTC Large (en): https://huggingface.co/nvidia/stt_en_fastconformer_ctc_large
- Explicación de FastConformer: https://fastconformer.com/
