# codebucketsolutions/asr-wav2vec2-dvoice-darija-onnx

## Resumen
Esta ficha describe `codebucketsolutions/asr-wav2vec2-dvoice-darija-onnx`, una exportación a formato ONNX del modelo SpeechBrain `speechbrain/asr-wav2vec2-dvoice-darija`, orientada al reconocimiento automático de voz en dariya marroquí (código ISO `ary`). Lo publica el usuario codebucketsolutions y su propósito es ejecutar la inferencia sin PyTorch, integrada en el servidor de voz `bolo` (repositorio `cB-Sigma/bolo-speech`). Los pesos son idénticos a los del modelo original; no se trata de un reentrenamiento ni de una versión oficial de SpeechBrain.

El modelo resuelve un nicho poco cubierto por los ASR multilingües convencionales: el árabe dialectal marroquí, una variedad de bajo recursos con escasa representación en corpus estándar. Al estar empaquetado en ONNX con opset 17 y precisión float32, permite desplegar reconocimiento de voz en entornos sin dependencias de deep learning pesadas, reduciendo la huella de instalación y facilitando la portabilidad.

La relevancia actual radica en su formato de despliegue: un único grafo `asr.onnx` más un vocabulario `tokens.txt` que puede ejecutarse con ONNX Runtime en CPU. El repositorio ocupa 1,3 GB y la licencia Apache-2.0 permite uso comercial. No obstante, el modelo está marcado con `inference: false` en la model card y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 (arquitectura XLSR-53 afinada) + DNN de tres capas + capa CTC + log-softmax, exportada como grafo ONNX (opset 17, float32) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de audio mono a 16 kHz, longitud `T` libre en muestras; salida de una trama por cada 20 ms |
| Tipos de cuantizacion | no disponible (el único grafo publicado es float32; el tag `base_model:quantized` sugiere una variante cuantizada del modelo base, pero no se detalla) |
| Idiomas soportados | dariya marroquí (`ary`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`asr.onnx`, opset 17, float32) + `tokens.txt` (unidades SentencePiece, `piece id` por línea) + `speechbrain_onnx.json` con metadatos y SHA-256 |

## Arquitectura y entrenamiento
El modelo original es un `EncoderASR` de SpeechBrain que combina un codificador wav2vec 2.0 de arquitectura XLSR-53, afinado para dariya, con una red DNN de tres capas, una capa CTC y una log-softmax final. La exportación reproduce el grafo completo del codificador. Un detalle técnico relevante: el wrapper de wav2vec 2.0 de SpeechBrain normaliza la forma de onda a lo largo del tiempo y la salida del codificador a lo largo del tiempo y de las características mediante `layer_norm` sobre la forma propia de la entrada; el grafo ONNX calcula lo mismo con medias y varianzas para que la longitud de entrada permanezca libre. La decodificación debe hacerse de forma greedy como en SpeechBrain (`ctc_greedy_decode`, blank 0) y unir las piezas, donde `▁` marca el inicio de palabra.

El entrenamiento corresponde al equipo de SpeechBrain sobre DVoice 2.0 Darija, un corpus de árabe marroquí obtenido por crowdsourcing. No se dispone en la información proporcionada de detalles sobre número de tokens de audio, composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO (no aplicables habitualmente en ASR CTC). La exportación se realizó desde la revisión `2433149197ee749738c803d1fbc911f197b0c32c` del repositorio base, con el script `export_speechbrain_onnx.py` (ubicado en `server/tools/` del repositorio de bolo) y verificación de paridad frente a SpeechBrain 1.1.2 con torch 2.15.0+cpu y ONNX Runtime 1.32.0.

## Capacidades
- Reconocimiento automático de voz (ASR) en dariya marroquí (`ary`) a partir de audio mono a 16 kHz.
- Salida de log-probabilidades CTC con una trama cada 20 ms, decodificables de forma greedy.
- Ejecución sin PyTorch mediante ONNX Runtime, con longitud de audio de entrada variable.
- Vocabulario SentencePiece incluido en `tokens.txt` para reconstruir el texto.
- No soporta tool calling ni function calling.
- No incorpora capacidades de agente ni razonamiento multi-paso.
- No es multilingüe: está especializado exclusivamente en dariya.
- No dispone de modo thinking, visión ni audio generativo; únicamente transcripción.

## Casos de uso
- Transcripción de audio en dariya para servicios de atención al cliente: el modelo convierte grabaciones de llamadas en texto que puede alimentar un sistema de tickets o análisis de sentimiento, al ser el único dialecto soportado y ejecutarse en CPU sin PyTorch.
- Subtitulado automático de contenido audiovisual marroquí: se integra en pipelines de procesamiento por lotes con ONNX Runtime, generando transcripciones con marcas temporales cada 20 ms.
- Asistentes de voz locales en dispositivos con recursos limitados: al no requerir PyTorch y usar un único grafo ONNX float32, puede desplegarse en servidores modestos o entornos embebidos con ONNX Runtime.
- Investigación en ASR de bajo recursos: sirve como línea base reproducible para comparar técnicas de adaptación al dialecto marroquí, con paridad verificada frente al original (diferencia máxima de log-probabilidad de 9,73e-04).
- Indexación y búsqueda de archivos de audio: la transcripción permite construir índices de texto sobre archivos de voz en dariya para recuperación posterior.
- Moderación y análisis de contenido en plataformas: la transcripción automática facilita la revisión de audio generado por usuarios en dariya, con la ventaja de un despliegue ligero en infraestructura existente.

## Benchmarks y rendimiento
El autor reporta, citando al modelo original, los resultados de SpeechBrain sobre el conjunto de test de DVoice 2.0 Darija:

| Metrica | Valor |
|---|---|
| WER (DVoice 2.0 Darija test) | 18,28 % |
| CER (DVoice 2.0 Darija test) | 5,85 % |

Prueba de paridad con el original (clip `example_darija.wav`, 2,25 s):

| Clip | Diferencia max. abs. log-prob | Misma ruta optima | Mismo texto | Transcripcion ONNX |
|---|---|---|---|---|
| example_darija.wav (2,25 s) | 9,73e-04 | si | si | ممکن تعيطي ليها في لبورطابل |

No se han publicado en la información disponible resultados comparativos con otros modelos ASR en MMLU, HumanEval, GSM8K ni benchmarks equivalentes, por no ser aplicables a una tarea de reconocimiento de voz.

## Requisitos de hardware
- VRAM estimada: no disponible de forma explícita; el grafo float32 y el repositorio de 1,3 GB sugieren un consumo moderado, pero no se publican cifras.
- GPU recomendadas: no disponibles; el autor valida la ejecución en CPU (torch 2.15.0+cpu y ONNX Runtime 1.32.0), por lo que no requiere GPU dedicada.
- Compatibilidad con GPU de consumo: previsiblemente sí en tarjetas con suficiente memoria para el grafo float32, aunque no se confirma en la información.
- Opciones de despliegue: ONNX Runtime (versión validada 1.32.0), integración en el servidor `bolo`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; solo se documenta la paridad numérica, no tiempos de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `codebucketsolutions/asr-wav2vec2-dvoice-darija-onnx` | no disponible | audio 16 kHz, longitud libre | WER 18,28 %, CER 5,85 % (DVoice 2.0 test) | Apache-2.0 | ONNX, sin PyTorch |
| `speechbrain/asr-wav2vec2-dvoice-darija` (original) | no disponible | audio 16 kHz, longitud libre | WER 18,28 %, CER 5,85 % (mismo test) | Apache-2.0 | PyTorch / SpeechBrain |
| Modelos ASR multilingües tipo Whisper | no disponible en esta ficha | audio 16 kHz, ventanas de 30 s | no disponible para dariya | licencias variables | múltiples formatos |

La comparación directa con alternativas de la misma categoría (ASR específico para dariya) no está disponible en la información proporcionada; el original de SpeechBrain es la referencia inmediata y comparte pesos y métricas.

## Limitaciones y advertencias
- Especializado únicamente en dariya marroquí: no reconoce otros dialectos árabes ni idiomas, y su uso fuera de ese dominio degradará gravemente la transcripción.
- Riesgo de alucinación y errores de sustitución propios de un sistema CTC con WER del 18,28 %; en audio ruidoso o con acentos no representados el error puede aumentar.
- La model card marca `inference: false`, lo que indica que la librería `onnx` no ofrece una API de inferencia automática; el usuario debe implementar la decodificación greedy y el ensamblado de piezas manualmente.
- No es una versión oficial de SpeechBrain; la responsabilidad del empaquetado y de su mantenimiento recae en codebucketsolutions.
- El repositorio no registra descargas ni likes, por lo que no hay evidencia de uso en producción ni de validación comunitaria.
- La licencia Apache-2.0 permite uso comercial, pero se debe citar a SpeechBrain y el paper del modelo original según indica su model card.
- No se documentan sesgos específicos ni composición demográfica del corpus DVoice 2.0, lo que impide evaluar su comportamiento por subgrupos.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/codebucketsolutions/asr-wav2vec2-dvoice-darija-onnx
- Modelo base: https://huggingface.co/speechbrain/asr-wav2vec2-dvoice-darija
- Servidor de voz bolo: https://github.com/cB-Sigma/bolo-speech
- SpeechBrain: https://speechbrain.github.io/
- ONNX Runtime: https://onnxruntime.ai/
