# openEuler/silero-vad

## Resumen
Silero VAD (Voice Activity Detection) es un detector de actividad de voz preentrenado, originalmente desarrollado por el equipo de Silero (snakers4). Esta variante concreta, publicada por openEuler, es un empaquetado del modelo v6 de Silero VAD para el framework IB-Robot, orientado a despliegue en edge y en hardware Ascend. Resuelve el problema de detectar si un segmento de audio contiene voz humana, lo que resulta esencial para tareas como la segmentación de audio, la detección de final de frase en ASR o el control de dirección de llegada (DOA). Su relevancia actual radica en su ligereza, su baja latencia y su capacidad para ejecutarse en CPU y en aceleradores Ascend, lo que lo hace adecuado para robótica y sistemas embebidos.

El modelo se basa en una arquitectura de red neuronal recurrente (LSTM) con una capa de entrada que procesa tramas de 512 muestras a 16 kHz, más un contexto de 64 muestras, y mantiene un estado interno de 128 unidades. El paquete incluye dos despliegues: uno para Ascend 310P (formato OM) y otro para ONNX Runtime en CPU. La licencia es MIT, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | LSTM (red recurrente) con capa fully connected, basada en Silero VAD v6 |
| Parametros totales | no disponible (modelo ligero, ~2 MB en formato ONNX) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 576 muestras por trama (512 + 64 de contexto) a 16 kHz, equivalente a 36 ms |
| Tipos de cuantizacion | no disponible (el artefacto OM para Ascend usa mixed16, pero no se especifican cuantizaciones para otros formatos) |
| Idiomas soportados | no disponible (el modelo original fue entrenado con más de 6000 idiomas, pero esta variante no especifica) |
| Licencia | MIT |
| Formato de pesos | ONNX (assets/silero_vad.onnx) y OM (artefacto para Ascend 310P) |

Nota: la model card indica que el ONNX es el oficial v6 de snakers4/silero-vad, con un tamaño de 2.3 MB. No se proporcionan más detalles de parámetros.

## Arquitectura y entrenamiento
Silero VAD v6 es un modelo de detección de actividad de voz basado en una red LSTM con una capa de salida que produce una probabilidad de voz por trama. En esta variante empaquetada para IB-Robot, la entrada es un tensor de forma [1, 576] que corresponde a 512 muestras de audio a 16 kHz más 64 muestras de contexto, y el modelo mantiene un estado LSTM de forma [2, 1, 128] que se pasa entre llamadas consecutivas para procesar flujos de audio continuos. El modelo original fue entrenado con un corpus masivo que incluye más de 6000 idiomas y diversos dominios con ruido de fondo, según la documentación de Silero. No se dispone de detalles específicos sobre el proceso de entrenamiento de esta variante concreta, pero se indica que el ONNX es idéntico al oficial v6, con un hash SHA-256 verificado. El artefacto OM para Ascend 310P se convirtió a partir del mismo modelo, con la frecuencia de muestreo fijada a 16000 Hz mediante constant folding.

## Capacidades
- Detección de actividad de voz (VAD): clasifica cada trama de audio como voz o no voz, devolviendo una probabilidad.
- Procesamiento en streaming: admite un contrato de ejecución stateful, con un banco de estados exclusivo y un máximo de un flujo abierto, lo que permite procesar audio continuo sin solapamiento.
- Integración con IB-Robot: se consume como componente base para la dirección de llegada (DOA) y la detección de final de frase en ASR.
- Soporte de múltiples backends: despliegue en Ascend 310P mediante ACL y en CPU mediante ONNX Runtime.
- Baja latencia: el modelo original procesa una trama de 30 ms en menos de 1 ms en un solo hilo de CPU (según documentación de Silero).
- Ligereza: el modelo ONNX ocupa 2.3 MB, adecuado para entornos con recursos limitados.

## Casos de uso
- Segmentación de audio para transcripción: el VAD se utiliza para dividir un flujo de audio en segmentos que contienen voz, que luego se pasan a un sistema ASR. Su baja latencia permite una segmentación en tiempo real.
- Detección de final de frase en asistentes de voz: en un sistema de reconocimiento de voz, el VAD detecta cuándo el usuario deja de hablar, activando el procesamiento de la frase completa. La integración con IB-Robot lo hace adecuado para robots de servicio.
- Control de dirección de llegada (DOA) en robótica: el VAD actúa como compuerta para el módulo de dirección de sonido, filtrando tramas sin voz y reduciendo falsos positivos en la localización de la fuente sonora.
- Activación por voz en dispositivos embebidos: al ser ligero y ejecutable en CPU, puede integrarse en dispositivos de bajo consumo para activar funciones solo cuando hay voz.
- Preprocesamiento en pipelines de audio: se usa para descartar silencios o ruido no vocal antes de enviar audio a servicios de análisis o almacenamiento, ahorrando ancho de banda y costes.
- Pruebas de calidad de audio en producción: en sistemas de grabación o streaming, el VAD puede monitorizar si hay voz presente en cada canal, ayudando a detectar fallos de micrófono o configuraciones incorrectas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La documentación de Silero VAD original menciona una alta precisión en tareas de detección de voz y una latencia inferior a 1 ms por trama de 30 ms en CPU, pero no se proporcionan métricas concretas (como precisión, recall o F1) para esta variante empaquetada.

## Requisitos de hardware
- El despliegue en CPU requiere un procesador x86-64 con instrucciones AVX, AVX2, AVX-512 o AMX, y al menos 1 GB de RAM (según documentación de Silero).
- Para el despliegue en Ascend, se necesita un acelerador Ascend 310P (310P1) con el runtime ACL.
- El modelo ONNX ocupa 2.3 MB, por lo que la memoria necesaria para el modelo es mínima; el consumo real depende del framework de inferencia.
- Se puede ejecutar en GPU, aunque no se especifica en esta variante; el modelo original soporta PyTorch y ONNX Runtime.
- Opciones de despliegue: ONNX Runtime (CPU), Ascend ACL (310P), y posiblemente llama.cpp u otros, pero no se documentan aquí.
- La latencia típica es inferior a 1 ms por trama de 30 ms en CPU, según la documentación original.

## Comparativa con modelos similares
No se dispone de información suficiente para comparar esta variante específica con otros modelos. El modelo original Silero VAD se compara a menudo con WebRTC VAD, pero no hay datos concretos en la información proporcionada. Se puede indicar que Silero VAD es más moderno y preciso que WebRTC VAD, pero sin cifras.

## Limitaciones y advertencias
- El modelo está diseñado para audio a 16 kHz (y 8 kHz en el original), por lo que no es adecuado para otras frecuencias de muestreo sin re-muestreo.
- El contrato de ejecución stateful limita a un solo flujo abierto a la vez (max_open_streams: 1), lo que puede ser restrictivo en aplicaciones con múltiples canales simultáneos.
- No se proporcionan detalles sobre el rendimiento en condiciones de ruido extremo o música; el modelo original fue entrenado con diversos dominios, pero no hay garantías.
- La licencia MIT permite uso comercial, pero el modelo empaquetado depende de IB-Robot, cuyo licenciamiento no se detalla aquí.
- No se especifican sesgos conocidos, pero como modelo de VAD, puede tener falsos positivos con sonidos no vocales (por ejemplo, música o golpes) y falsos negativos con voz muy baja o lejana.

## Enlaces
- Repositorio de HuggingFace: https://huggingface.co/openEuler/silero-vad
- Repositorio original de Silero VAD: https://github.com/snakers4/silero-vad
- Documentación de PyTorch Hub: https://pytorch.org/hub/snakers4_silero-vad_vad/
- Paquete PyPI: https://pypi.org/project/silero-vad/
- Framework IB-Robot (referencia en la model card): https://atomgit.com/openeuler/IB_Robot
