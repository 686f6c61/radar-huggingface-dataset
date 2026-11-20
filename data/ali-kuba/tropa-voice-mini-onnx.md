# ali-kuba/tropa-voice-mini-onnx

## Resumen

tropa-voice-mini-onnx es una exportación a ONNX con cuantización int8 del modelo wasitaigeneratedcom/ai-voice-detector-small, un clasificador de audio diseñado para detectar voz sintética generada por IA. El autor de esta conversión es ali-kuba, que se limita a cambiar el formato de los pesos para permitir la inferencia con ONNX Runtime sobre CPU sin dependencia de PyTorch. Todo el crédito del entrenamiento y del modelo original corresponde a wasitaigenerated.com.

El modelo se construye sobre el backbone facebook/wav2vec2-xls-r-300m (Apache-2.0) con una cabeza de atención SLS, y se distribuye bajo licencia Apache-2.0. Su propósito es la clasificación binaria de ventanas de audio: dado un fragmento de hasta 6 segundos a 16 kHz y mono, devuelve un logit que, tras una calibración lineal, se transforma en la probabilidad de que la voz sea sintética.

La relevancia de esta versión concreta es práctica: reduce el peso de 1,26 GB en fp32 a 357 MB en int8 y elimina la necesidad de PyTorch, lo que facilita el despliegue en entornos de CPU y en pipelines de moderación de contenido o verificación de audio. No obstante, el propio autor advierte de que no se trata de una validación independiente de precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2-xls-r-300m (backbone) con cabeza de atencion SLS; exportado a ONNX (opset 17) |
| Parametros totales | no disponible (backbone de 300M; el total del clasificador no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de hasta 6 s (96.000 muestras a 16 kHz) |
| Tipos de cuantizacion | int8 dinamica (solo MatMul, per-channel); fp32 original de 1,26 GB |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (model_int8.onnx, 357 MB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un backbone wav2vec2-xls-r-300m, un modelo de representación de audio preentrenado, al que se le añade una cabeza de atención SLS para la clasificación binaria de voz sintética frente a voz real. El modelo original fue entrenado por wasitaigenerated.com; esta ficha no dispone de detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o ajuste supervisado específicas.

La conversión realizada por ali-kuba emplea torch.onnx.export con opset 17 y dimensiones dinámicas de batch y longitud. La cuantización se aplica con onnxruntime.quantization.quantize_dynamic limitada a operaciones MatMul con esquema per-channel; según el autor, la cuantización dinámica por defecto de todas las operaciones provocaba una deriva notable, mientras que la restricción a MatMul mantiene una desviación media de |Δlogit| de 0,04 sobre 638 ventanas de prueba. El grafo normaliza internamente cada ventana (media cero, varianza unitaria).

## Capacidades

- Clasificación binaria de audio para detección de voz generada por IA (audio deepfake / synthetic speech detection).
- Entrada de audio mono a 16 kHz, ventanas de hasta 6 segundos (96.000 muestras), con batch dinámico.
- Salida de un logit por ventana, convertible a probabilidad calibrada mediante `p = sigmoid(1.4467909565475723 * logit + 1.3162840910986644)`.
- Umbrales operativos predefinidos: p ≥ 0,819 para una tasa de falsos positivos del 1 %, y p ≥ 0,961 para el 0,5 %.
- Inferencia sobre CPU con ONNX Runtime, sin necesidad de PyTorch.
- No soporta tool calling, agentes, generación de texto ni capacidades multimodales; es exclusivamente un clasificador de audio.

## Casos de uso

- Moderación de contenido en plataformas de audio: integración del clasificador en pipelines de subida de audio para marcar posibles voces sintéticas antes de su publicación, usando el umbral de 1 % de falsos positivos como filtro inicial.
- Verificación de autenticidad en entrevistas o declaraciones grabadas: análisis por ventanas de 6 segundos de un audio completo para localizar segmentos sospechosos de síntesis, con revisión humana posterior de los tramos marcados.
- Detección de fraude en llamadas y mensajes de voz: despliegue en CPU junto a sistemas de atención telefónica para señalar locuciones generadas por IA con umbrales conservadores (p ≥ 0,961).
- Investigación en detección de deepfakes de audio: uso como línea base reproducible en formato ONNX para comparar con otros detectores sin depender de un entorno PyTorch.
- Protección de datasets de voz: filtrado automático de grabaciones sintéticas antes de incorporarlas a corpus de entrenamiento o evaluación de modelos de ASR.
- Despliegue en entornos con recursos limitados: al pesar 357 MB y ejecutarse con ONNX Runtime en CPU, puede embeberse en servicios contenedorizados o dispositivos sin GPU para cribado previo de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona una comprobación propia sobre 98 clips sintéticos (incluidos ElevenLabs v3/v4) y 14 entrevistas y conferencias reales de YouTube, que califica de prometedora pero demasiado pequeña para establecer una tasa de falsos positivos. No se ofrecen cifras numéricas de accuracy, precisión o recall.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo está pensado para inferencia en CPU con ONNX Runtime. El tamaño en disco es de 357 MB (int8) frente a 1,26 GB en fp32.
- GPU recomendadas: no disponibles; el autor no documenta ejecución en GPU.
- Cabe en cualquier equipo de consumo: el peso de 357 MB permite ejecución en CPU de portátil o servidor modesto.
- Opciones de despliegue: ONNX Runtime con CPUExecutionProvider; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| tropa-voice-mini-onnx (este) | no disponible (backbone 300M) | ventana de 6 s de audio | ONNX int8 | Apache-2.0 | Detección de voz IA, inferencia en CPU |
| wasitaigeneratedcom/ai-voice-detector-small | no disponible (backbone 300M) | ventana de 6 s de audio | PyTorch (fp32) | Apache-2.0 | Modelo original; requiere PyTorch |
| facebook/wav2vec2-xls-r-300m | 300M (backbone) | no aplica (representación de audio) | safetensors/PyTorch | Apache-2.0 | Backbone base, no es un detector por sí mismo |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El autor declara explícitamente que esta conversión no constituye una afirmación independiente de precisión; su comprobación con 98 clips sintéticos y 14 reales es insuficiente para establecer una tasa de falsos positivos fiable.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos y falsos negativos en la clasificación; los umbrales calibrados (1 % y 0,5 % de FPR) proceden del modelo original y deben validarse en el dominio de despliegue.
- Idiomas soportados no documentados; el backbone xls-r es multilingüe, pero no se especifica el rendimiento por idioma del clasificador.
- Solo acepta ventanas de hasta 6 segundos a 16 kHz y mono; audios más largos requieren segmentación manual y agregación de resultados.
- La cuantización int8 introduce una desviación media de |Δlogit| de 0,04 frente a fp32, según el autor; conviene verificar el efecto en los umbrales operativos.
- Licencia Apache-2.0, que permite uso comercial, pero se recomienda revisar la model card del modelo original para condiciones y limitaciones adicionales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin evidencia de adopción o validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ali-kuba/tropa-voice-mini-onnx
- Modelo base original: https://huggingface.co/wasitaigeneratedcom/ai-voice-detector-small
- Backbone: https://huggingface.co/facebook/wav2vec2-xls-r-300m
