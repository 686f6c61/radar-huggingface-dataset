# Akiki-AI/Akiki-MiniLM-L6-v2-robot-intent

## Resumen

Akiki-MiniLM-L6-v2-robot-intent es un clasificador de intenciones de 23 clases desarrollado por Akiki-AI (AKIKI.AI) para comandos cortos de robot y transcripciones observadas de STT en inglés. El modelo parte del backbone congelado `sentence-transformers/all-MiniLM-L6-v2` y añade una transformación afín de entrada de 384 x 384 inicializada como identidad, más una nueva cabeza lineal de 23 clases. La salida se obtiene mediante mean pooling, normalización L2 y clasificación por la cabeza.

El modelo pertenece a la familia Ariadne y su propósito es mapear una frase corta del tipo "come here" o "turn around" a una intención operativa concreta del robot (STOP, COME, FACE, FOLLOW, SLEEP, WAKE, entre otras). Resulta relevante porque separa explícitamente comandos ambiguos (por ejemplo, "turn around" frente a "turn to face me") y define reglas de precedencia, como que un STOP inmediato de todo movimiento prevalece sobre otra acción en un enunciado compuesto.

Se trata de un modelo experimental inicial: los datos y etiquetas son sintéticos y revisados por modelo, y la revisión humana y la evaluación sobre transcripciones reales de Parakeet están pendientes. El repositorio ocupa 0,1 GB, la licencia es Apache 2.0 y solo se distribuye en inglés. La inferencia se realiza con el motor Rust del paquete `akiki`, sin necesidad de PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (MiniLM-L6-v2) con backbone congelado, afín de entrada 384 x 384 y cabeza lineal de 23 clases |
| Parametros totales | no disponible (el adaptador consta de 4 tensores FP32 entrenados; el backbone MiniLM-L6-v2 ronda los 22,7 M de parámetros, dato no confirmado en la información proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens máximo; las entradas superiores provocan error, no truncado |
| Tipos de cuantizacion | FP32 (evaluado y coincidente con la validación reportada); INT8 es el valor por defecto del paquete pero no evaluado para este adaptador; otras precisiones no evaluadas |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter.safetensors`), checkpoint original congelado en `base_model/`, configuración en `model_config.json` y etiquetas en `labels.json` |

## Arquitectura y entrenamiento

El modelo es un clasificador de texto construido sobre un encoder transformer MiniLM-L6-v2 completamente congelado. Sobre las embeddings de palabra se aplica una transformación afín 384 x 384 inicializada como identidad, antes de las embeddings de posición y de tipo. La secuencia resultante pasa por el backbone congelado; la salida se agrega mediante mean pooling, se normaliza en L2 y se clasifica con una cabeza lineal nueva de 23 clases. Solo se entrenan cuatro tensores FP32, almacenados en `adapter.safetensors`, lo que mantiene el coste de entrenamiento y de almacenamiento muy bajo.

Los datos de entrenamiento son sintéticos y revisados por modelo, sin que la información disponible detalle el número de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card indica explícitamente que la revisión humana y la evaluación sobre transcripciones reales de Parakeet están pendientes, y que los errores conocidos se documentan en la propia tarjeta. No se describen innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación de intención en 23 clases para comandos cortos de robot y transcripciones STT observadas.
- Distinción fina entre acciones de movimiento del cuerpo (COME, FOLLOW, BACK_UP, GO_AWAY, FORWARD, TURN_LEFT, TURN_RIGHT, TURN_AROUND, SPIN) y de cámara o gimbal (LOOK_UP, LOOK_DOWN, LOOK_LEFT, LOOK_RIGHT, LOOK_AHEAD).
- Gestión de gestos con cabeza o gimbal: NOD y SHAKE_HEAD, diferenciados de un "sí" o un "no" conversacional, que se etiquetan como NONE.
- Control de iluminación de la base del robot: LIGHTS_ON y LIGHTS_OFF, sin confundirse con luces de la habitación o estados visuales.
- Gestión de estados de escucha: SLEEP (con QUIET como alias) y WAKE.
- Regla de precedencia: un STOP inmediato de todo movimiento prevalece sobre otra acción en un enunciado compuesto.
- Etiqueta NONE para chat ordinario, preguntas factuales, comandos citados o reportados, destinatarios explícitos no robot, peticiones no soportadas y fragmentos incompletos o ininteligibles.
- No soporta audio, identidad de hablante, historial de diálogo ni estado del robot como entrada.
- No soporta tool calling ni function calling, ni razonamiento multi-paso: es un clasificador de una sola pasada.

## Casos de uso

- Enrutado de comandos de voz en un robot doméstico: el modelo recibe la transcripción STT de una frase corta y devuelve la intención operativa, que el sistema de control traduce a una acción concreta de movimiento, cámara o iluminación.
- Desambiguación de comandos compuestos: gracias a la regla de precedencia de STOP, un enunciado como una orden de movimiento seguida de una parada inmediata se resuelve como STOP, evitando que el robot siga ejecutando la acción previa.
- Filtrado de falsos positivos en entornos con televisiones o conversaciones de fondo: la clase NONE absorbe chat ordinario, preguntas factuales y comandos citados, reduciendo activaciones accidentales cuando el texto es idéntico al de un comando real.
- Control de cámara y gimbal en robots de telepresencia: las clases LOOK_UP, LOOK_DOWN, LOOK_LEFT, LOOK_RIGHT y LOOK_AHEAD permiten mover solo la cabeza o el gimbal sin desplazar el cuerpo, útil para encuadrar al interlocutor.
- Gestión del estado de escucha en asistentes embebidos: SLEEP y WAKE permiten suspender y reanudar la reacción a voces de forma explícita, con QUIET como alias de SLEEP para el mismo comportamiento.
- Integración en pipelines de CI o pruebas de regresión de intenciones: al ser un adaptador pequeño con checkpoint congelado y referencia PyTorch offline (`model.py` con `local_files_only=True`), se puede ejecutar en pruebas automatizadas para verificar que los cambios en el front-end de STT no alteran la clasificación esperada.
- Prototipado rápido en hardware modesto: al no requerir PyTorch para la inferencia Rust y ocupar 0,1 GB, cabe en hosts Linux x86_64 convencionales para experimentación con comandos sintéticos antes de desplegar en el robot.

## Benchmarks y rendimiento

La model card declara las métricas `accuracy` y `f1` en sus metadatos, pero no se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,1 GB y el backbone MiniLM-L6-v2 es de tamaño reducido, por lo que la huella es mínima en FP32.
- GPU recomendadas: no disponible; el modelo no requiere GPU para funcionar según la información proporcionada.
- GPU de consumo: no se especifica compatibilidad con RTX 4090 u otras; el motor Rust está pensado para hosts Linux x86_64.
- Opciones de despliegue: motor Rust prebuilt del paquete `akiki` (`from akiki import MiniLM`), CLI `python predict.py "come here"` y referencia PyTorch offline mediante `model.py` con `requirements-reference.txt` y `local_files_only=True`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Plataformas: wheels ARM64 actuales solo incluyen VAD y no incorporan el motor MiniLM; la inferencia MiniLM está soportada en Linux x86_64.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Akiki-MiniLM-L6-v2-robot-intent | Adaptador sobre MiniLM-L6-v2 (4 tensores FP32) | 512 tokens | Clasificación de intención robótica, 23 clases, inglés | Apache 2.0 | Hugging Face, motor Rust `akiki` y referencia PyTorch |
| sentence-transformers/all-MiniLM-L6-v2 | no disponible en la información proporcionada | no disponible en la información proporcionada | Embeddings de frases de propósito general | no disponible en la información proporcionada | Hugging Face (modelo base) |
| Alternativas de clasificación de intención para robótica | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo experimental inicial: datos y etiquetas sintéticos y revisados por modelo; la revisión humana y la evaluación sobre transcripciones reales de Parakeet están pendientes.
- Solo inglés: no se declara soporte multilingüe.
- Sin modalidad de audio: el modelo no procesa voz directamente, solo texto de transcripción; tampoco recibe identidad de hablante, historial de diálogo ni estado del robot.
- Entradas superiores a 512 tokens generan error en lugar de truncarse, lo que exige validación previa en producción.
- No puede distinguir un comando emitido por una televisión de uno dirigido al robot si el texto es idéntico; la clase NONE solo cubre casos identificables por el contenido textual.
- Riesgo de ambigüedad en comandos compuestos: solo STOP tiene precedencia explícita; otras acciones múltiples no resueltas se etiquetan como NONE.
- No se han publicado métricas numéricas de accuracy ni F1 en la información disponible, pese a declararse en los metadatos.
- La precisión INT8, valor por defecto del paquete, no ha sido evaluada para este adaptador; FP32 es la única configuración validada.
- Las wheels ARM64 actuales no incluyen el motor MiniLM, lo que limita el despliegue en esa arquitectura.
- Subir el modelo no lo despliega en un robot: requiere integración explícita con el sistema de control.
- No se documentan sesgos conocidos ni riesgos de alucinación específicos; al ser un clasificador cerrado de 23 clases, la salida siempre pertenece a ese conjunto.

## Enlaces

- Hugging Face: https://huggingface.co/Akiki-AI/Akiki-MiniLM-L6-v2-robot-intent
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.
