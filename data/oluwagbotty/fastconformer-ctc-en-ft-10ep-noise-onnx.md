# oluwagbotty/fastconformer-ctc-en-ft-10ep-noise-onnx

## Resumen

El modelo `fastconformer-ctc-en-ft-10ep-noise-onnx` es una exportación a ONNX del modelo de reconocimiento automático del habla (ASR) `oluwagbotty/fastconformer-ctc-en-ft-10ep-noise`, un FastConformer con cabecera CTC afinado durante 10 épocas sobre el dataset CDLI Non-Standard Speech (inglés ruandés no estándar), con ruido añadido a la mitad de las grabaciones de entrenamiento. Lo desarrolla el usuario de Hugging Face `oluwagbotty` y se publica bajo licencia CC BY 4.0. La relevancia de esta variante es operativa: empaqueta el front-end de audio de NeMo, el encoder y el decoder en un único grafo ONNX que va de audio PCM mono a 16 kHz a log-probabilidades, de modo que el despliegue solo requiere `onnxruntime`, sin depender del stack completo de NeMo.

El repositorio incluye dos variantes: `model.onnx` en fp32 (486 MB) con su fichero de pesos externo `model.onnx.data`, y `model.int8.onnx` (184 MB) con cuantización dinámica int8 en las multiplicaciones matriciales. Según la model card, el grafo ONNX reproduce exactamente la salida greedy de NeMo en 50 de 50 grabaciones de test, con una diferencia máxima de log-probabilidad de 0,002.

Está pensado para integrar ASR en aplicaciones ligeras (app del proyecto, dispositivos con solo CPU) sobre habla inglesa de hablantes no estándar en condiciones de interior poco ruidosas. No es un modelo multilingüe ni un ASR de propósito general: su dominio es estrecho y así lo declara el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer + cabecera CTC (exportado como grafo ONNX único: front-end de audio NeMo, encoder y decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada variable; sin límite declarado en la model card) |
| Tipos de cuantizacion | fp32 (`model.onnx`) e int8 dinámica en matmuls, convoluciones en 32 bits (`model.int8.onnx`) |
| Idiomas soportados | en (inglés; datos de inglés ruandés no estándar) |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX (`model.onnx` + `model.onnx.data`; `model.int8.onnx` autocontenido; `labels.json`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un FastConformer, el encoder convolucional-auto-atencivo de NVIDIA NeMo para ASR, con una cabeza CTC para decodificación greedy. El modelo base fue afinado durante 10 épocas sobre el dataset `cdli/rwandan_english_nonstandard_speech_v1.0` (Centre for Digital Language Inclusion, UCL, 2025), compuesto por grabaciones en Ruanda de 2026, en interiores con bajo ruido, capturadas con una app de tableta a partir de descripciones de imágenes y frases leídas. A la mitad de las grabaciones de entrenamiento se les añadió ruido, lo que explica el sufijo `noise` del nombre.

La exportación a ONNX fusiona el front-end de audio (extracción de features), el encoder y el decoder en un solo grafo con entradas `audio` (float32, `[1, samples]`) y `length` (int64, `[1]`), y salidas `log_probs` (`[1, frames, tokens + blank]`) y `frames`. La decodificación es greedy: mejor token por frame, fusión de repeticiones y eliminación de blancos; `labels.json` lista los tokens con el blanco al final y `▁` marcando inicio de palabra. La cuantización int8 aplica cuantización dinámica solo a las matmuls, dejando las convoluciones en fp32, lo que permite ejecución con cualquier build de CPU de onnxruntime. No se documenta en la información disponible el uso de RLHF/DPO ni el volumen de tokens de entrenamiento.

## Capacidades

- Reconocimiento automático del habla en inglés a partir de audio PCM mono a 16 kHz.
- Salida CTC con log-probabilidades por frame y decodificación greedy (tokens + blank, marcas de inicio de palabra).
- Robustez parcial al ruido de fondo gracias al entrenamiento con ruido añadido en la mitad de las grabaciones.
- Ejecución en CPU sin NeMo: un único grafo ONNX que solo requiere `onnxruntime`.
- Variante int8 para despliegue con menor huella de memoria y sin pérdida clara de precisión.
- No soporta tool calling, agentes, visión, audio de entrada distinto de voz ni modos de razonamiento; no es multilingüe.
- No disponible información sobre detección de idioma, puntuación automática, diarización ni timestamps a nivel de palabra más allá de la salida por frames.

## Casos de uso

- Transcripción de habla inglesa no estándar en aplicaciones móviles: el grafo ONNX único y la variante int8 de 184 MB permiten ejecutar ASR en dispositivo o en servidores de CPU sin GPU, usando solo onnxruntime.
- Accesibilidad en aplicaciones de lectura y descripción de imágenes: dado que el dataset de entrenamiento proviene de prompts de imagen y frases leídas, el modelo encaja en apps que transcriben descripciones libres o lectura en voz alta en inglés.
- Preprocesado de audio en pipelines de datos: la salida `log_probs` por frame permite aplicar decodificadores propios (por ejemplo, beam search con un modelo de lenguaje externo) en lugar del greedy incluido.
- Prototipado rápido de ASR en entornos con restricciones de dependencias: al eliminar NeMo del runtime, se simplifica el empaquetado en contenedores y el despliegue en entornos edge.
- Investigación sobre habla no estándar: sirve como baseline reproducible para comparar estrategias de aumento de ruido o cuantización sobre el mismo dataset CDLI.
- Transcripción asistida en contextos de inclusión digital: con la advertencia de mostrar el texto al hablante antes de actuar sobre él, puede apoyar la documentación de habla con variantes no estándar en inglés.
- Evaluación de cuantización en ASR: el par fp32/int8 con métricas WER/CER publicadas permite estudiar el impacto de la cuantización dinámica en un modelo CTC concreto.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre 200 grabaciones de test estratificadas (WER y CER en porcentaje):

| Variante | WER | CER |
|---|---|---|
| `model.onnx` (fp32) | 26,5 | 17,1 |
| `model.int8.onnx` | 27,0 | 17,5 |

La diferencia de WER entre int8 y fp32 es de +0,5 puntos (intervalo del 95 %: -0,6 a +1,5, remuestreando hablantes), por lo que no se observa una pérdida clara. No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K no aplican a un modelo ASR) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el modelo está pensado para CPU. Como referencia de huella en disco/memoria, fp32 ocupa 486 MB y int8 184 MB.
- GPU recomendadas: no se especifican; al ser ONNX con onnxruntime, puede ejecutarse en CPU o en GPU compatibles con los execution providers de onnxruntime (CUDA, etc.), sin lista de GPUs recomendadas publicada.
- Cabe en GPU de consumo: previsiblemente sí por tamaño (menos de 0,5 GB de pesos en fp32), aunque no hay validación publicada en la información disponible.
- Opciones de despliegue: onnxruntime (CPU o con execution provider GPU); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo ASR.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `oluwagbotty/fastconformer-ctc-en-ft-10ep-noise-onnx` | FastConformer CTC, ONNX | no disponible | no disponible | CC BY 4.0 | Hugging Face (ONNX) |
| `oluwagbotty/fastconformer-ctc-en-ft-10ep-noise` (modelo base) | FastConformer CTC, NeMo | no disponible | no disponible | CC BY 4.0 (según repo base) | Hugging Face |
| FastConformer CTC en inglés de NVIDIA NeMo (modelos generales) | FastConformer CTC | no disponible en esta ficha | no disponible | según modelo de NVIDIA | NGC / Hugging Face |

No se dispone en la información proporcionada de datos de rendimiento de los modelos comparables ni de alternativas ASR con métricas equiparables sobre el mismo dataset, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Pocos hablantes y condiciones estrechas: 9 hablantes de test, mayoritariamente hombres jóvenes, grabaciones en interior silencioso, habla leída y descrita por imágenes, no conversacional.
- Rendimiento desconocido en niños, otras condiciones del habla, entornos ruidosos, audio telefónico o habla con cambio de código.
- Objetivos verbatim: las repeticiones por tartamudeo se escriben en las transcripciones; los bloqueos y prolongaciones no son visibles en texto.
- Las frases leídas aparecen también en las transcripciones de entrenamiento, por lo que los resultados con prompts de imagen son la mejor guía para habla abierta.
- Prohibido para decisiones sobre personas: no usar para diagnosticar o evaluar condiciones del habla, identificar hablantes ni en decisiones clínicas, legales o policiales. Los términos CDLI prohíben reidentificar hablantes y construir voces que imiten a una persona.
- Riesgo de que una transcripción errónea cambie el significado de lo dicho: mostrar el texto al hablante antes de actuar sobre él.
- Licencia CC BY 4.0: permite uso comercial con atribución; deben respetarse además los términos del dataset CDLI, que es de acceso restringido y no se incluye en el repositorio.
- El dataset no se puede redistribuir desde este repositorio; el acceso está restringido y requiere aceptar los términos de CDLI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oluwagbotty/fastconformer-ctc-en-ft-10ep-noise-onnx
- Modelo base: https://huggingface.co/oluwagbotty/fastconformer-ctc-en-ft-10ep-noise
- Dataset CDLI: https://huggingface.co/datasets/cdli/rwandan_english_nonstandard_speech_v1.0
- Script de exportación (referenciado en la model card): `src/export_nemo_onnx.py` del repositorio del proyecto (URL no disponible)
- Script de cuantización (referenciado en la model card): `src/quantize_onnx.py` del repositorio del proyecto (URL no disponible)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
