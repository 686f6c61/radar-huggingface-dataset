# Cb1ock/xasr-official-onnx-contextgraph-ab-v1

## Resumen

X-ASR ONNX ContextGraph es un paquete de entrega backend para un sistema de reconocimiento de voz en streaming (ASR) con soporte de hotwords dinámicas. Lo desarrolla el usuario Cb1ock y se distribuye bajo licencia Apache 2.0. El paquete incluye los pesos ONNX oficiales del modelo X-ASR (para puntuación y capitalización) en cuatro configuraciones de latencia (160, 480, 960 y 1920 ms), junto con un decoder de hotwords basado en el ContextGraph de icefall, que permite inyectar términos personalizados sin necesidad de reentrenar el modelo. Está pensado para despliegue en CPU (Linux x86_64 y macOS arm64) y expone una API WebSocket y HTTP para integración en aplicaciones de transcripción en tiempo real.

La relevancia actual radica en que ofrece una solución de ASR en streaming con hotwords sobre ONNX Runtime, lo que facilita su despliegue en entornos sin GPU y con requisitos de latencia ajustables. El paquete no incluye checkpoints de fine-tuning, sino que extiende la inferencia del modelo oficial con un decoder adicional para reconocimiento de términos específicos. Está orientado a desarrolladores que necesitan un servicio de transcripción con baja latencia y control fino sobre vocabulario personalizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (encoder-decoder, probablemente transducer; no especificado) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (audio sin limite de 30 segundos, segun documentacion) |
| Tipos de cuantizacion | no disponible (modelos ONNX, precision no especificada) |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

No se proporcionan detalles sobre la arquitectura interna del modelo (numero de capas, dimensiones, tipo de atencion) ni sobre el proceso de entrenamiento. El paquete contiene los pesos ONNX oficiales de X-ASR, que se describen como un sistema de ASR en streaming con encoder, decoder y joiner (tipico de arquitecturas transducer). El componente de puntuacion y capitalizacion usa un modelo SentencePiece (bpe_punc.model) y el decoder principal es un greedy search oficial. La innovacion principal del paquete es la incorporacion de un decoder de hotwords basado en el ContextGraph de icefall, que reutiliza la salida del encoder para realizar una busqueda con beam modificado y asi reconocer terminos personalizados sin modificar los pesos del modelo.

No hay informacion sobre el conjunto de datos de entrenamiento, el numero de tokens o si se aplicaron tecnicas como RLHF o DPO. El paquete se limita a la inferencia; no incluye checkpoints de fine-tuning.

## Capacidades

- Reconocimiento de voz en streaming para chino e ingles, con salida de texto y puntuacion automatica.
- Soporte de hotwords dinamicas mediante ContextGraph: se pueden especificar terminos personalizados en cada peticion (por ejemplo, nombres propios o jerga tecnica) que el decoder intentara reconocer con prioridad.
- Cuatro niveles de latencia configurables (160, 480, 960 y 1920 ms) que permiten ajustar el equilibrio entre velocidad y precision.
- Procesamiento de audio continuo sin limite de 30 segundos (se ha probado con archivos de mas de 10 minutos).
- API WebSocket y HTTP para integracion en aplicaciones en tiempo real, con health check y pagina web de demostracion.
- Ejecucion exclusiva en CPU, con soporte para Linux x86_64 y macOS arm64 (Apple Silicon).
- Incluye herramientas de verificacion de integridad de archivos y un script de benchmark para reproducir metricas de rendimiento.

## Casos de uso

- Transcripcion en tiempo real para subtitulacion de reuniones o conferencias: el modelo puede procesar audio de forma continua via WebSocket, con latencia configurable (por ejemplo, 480 ms) y soporte para multiples idiomas (zh/en), lo que lo hace adecuado para sistemas de subtitulado en vivo.
- Asistentes de voz con vocabulario especifico del dominio: mediante hotwords, se pueden reconocer nombres de productos, siglas o terminos tecnicos que un modelo generico no detectaria. Por ejemplo, en una aplicacion de atencion al cliente, se pueden inyectar nombres de servicios o marcas.
- Comandos de voz para automatizacion industrial o domotica: el modo streaming con baja latencia (160 ms) permite responder rapidamente a comandos cortos, y las hotwords ayudan a distinguir palabras clave criticas.
- Servicio de transcripcion backend para aplicaciones de grabacion de notas: se puede integrar como microservicio en Docker, recibiendo audio desde moviles o web, y devolviendo texto con puntuacion.
- Analisis de llamadas de soporte tecnico: al configurar hotwords con nombres de productos o errores comunes, el sistema puede etiquetar automaticamente segmentos relevantes en conversaciones largas, gracias a la capacidad de procesar audio sin limite de duracion.
- Evaluacion de calidad de servicio en centros de contacto: el RTF bajo (alrededor de 0.2) permite procesar grandes volumenes de audio grabado en CPU, sin necesidad de GPU, reduciendo costes de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (como WER, CER o comparaciones con otros modelos) en la informacion disponible. Sin embargo, la documentacion del paquete incluye mediciones de rendimiento propias en CPU (Linux x86_64), expresadas como factor de tiempo real (RTF, donde valores menores indican mayor velocidad). Los datos reportados son:

| Escenario | Duracion del audio | Tiempo de inferencia | RTF |
|---|---|---|---|
| Ejecucion directa (dos pasadas) | 68,256 s | 13,062 s | 0,1914 |
| WebSocket (aceptacion) | 68,256 s | no especificado | 0,1968 |
| Wheelhouse independiente | 68,256 s | no especificado | 0,2111 |
| Ejecucion directa (dos pasadas) | 21,696 s | no especificado | 0,2104 |
| Reproduccion continua (dos pasadas) | 614,304 s (10,238 min) | 121,090 s | 0,1971 |

Estos valores se obtuvieron con la configuracion por defecto de 480 ms de latencia. No se proporcionan metricas de precision del reconocimiento ni comparaciones con otros sistemas ASR.

## Requisitos de hardware

- CPU: el paquete esta disenado para ejecutarse en CPU. Se ha probado en Linux x86_64 y macOS arm64 (Apple Silicon). No requiere GPU; la memoria de video es 0.
- Memoria RAM: el proceso residente ocupa aproximadamente 1,0 GiB con el modelo de 480 ms (tamano de archivo ONNX: 586,1 MiB). Otras configuraciones de latencia pueden variar.
- GPU: no soportada oficialmente; la documentacion menciona estimaciones para GPU, pero son solo presupuestos de portabilidad, no mediciones reales.
- Despliegue: se proporciona Dockerfile para Linux x86_64 (imagen base python:3.12-slim) y un arranque nativo con entorno virtual Python 3.12. Tambien se incluyen scripts de verificacion y benchmark.
- Concurrencia: el proceso usa un bloqueo global para serializar el avance del modelo, por lo que para atender multiples peticiones simultaneas se recomienda escalar horizontalmente con varias instancias y asegurar que cada sesion WebSocket se dirija siempre a la misma replica.
- Latencia de arranque: el primer uso de una configuracion de latencia no predeterminada carga el ONNX correspondiente, con un costo de aproximadamente 2 segundos (cold start).

## Comparativa con modelos similares

No se dispone de informacion comparativa con otros modelos de ASR en la documentacion proporcionada. No se puede establecer una comparacion objetiva con alternativas como Whisper, Kaldi o NeMo sin datos de referencia.

## Limitaciones y advertencias

- El paquete no incluye checkpoints de fine-tuning; los pesos ONNX son los oficiales de X-ASR, y la extension de hotwords se limita a la decodificacion, no al entrenamiento.
- Las hotwords no son de aplicacion forzosa: si la evidencia acustica es debil, el termino puede no ser reconocido. Ademas, aumentar el score de hotwords por encima de los valores recomendados (1/2/4/8) puede provocar inserciones erroneas (errores de insercion).
- La concurrencia esta limitada por un bloqueo global en el proceso; para multiples peticiones simultaneas es necesario escalar con replicas, lo que requiere gestion de afinidad de sesiones.
- Solo se soporta oficialmente CPU (Linux x86_64 y macOS arm64). Aunque se mencionan estimaciones para GPU, no hay soporte verificado.
- La latencia de 160 ms tiene un RTF mas alto (menor velocidad), mientras que la de 1920 ms es mas rapida pero no garantiza una mejora monotona en la calidad para audio corto.
- No se proporcionan datos sobre sesgos, robustez ante ruido o variaciones de acento, ni sobre el comportamiento en dominios fuera de los idiomas soportados (zh/en).
- El paquete graba audio y JSON de las sesiones en el directorio `runs/xasr_hotword_demo/user_cases/`; en entornos de produccion se debe configurar una politica de retencion y control de acceso para cumplir con normativas de privacidad.
- La licencia Apache 2.0 permite uso comercial, pero los pesos del modelo X-ASR pueden estar sujetos a condiciones adicionales del proyecto original; se recomienda revisar la licencia de X-ASR y de icefall.

## Enlaces

- [Repositorio HuggingFace: Cb1ock/xasr-official-onnx-contextgraph-ab-v1](https://huggingface.co/Cb1ock/xasr-official-onnx-contextgraph-ab-v1)
- [Documentacion de ONNX (formato de modelo)](https://onnx.ai/) (referencia general del formato de pesos)
