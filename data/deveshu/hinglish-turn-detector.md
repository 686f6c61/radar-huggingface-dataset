# deveshu/hinglish-turn-detector

## Resumen

El modelo `deveshu/hinglish-turn-detector` es un clasificador binario de audio diseñado para detectar si un hablante ha completado su turno en una conversación, específicamente en el contexto de agentes de voz que operan en Hinglish (mezcla de hindi e inglés). Desarrollado por el usuario de Hugging Face `deveshu`, el modelo responde a la pregunta que un detector de actividad de voz (VAD) no puede resolver: cuando hay una pausa, ¿el interlocutor ha terminado de hablar o solo está pensando? Es una pieza clave para sistemas de conversación por voz en tiempo real, donde la decisión de interrumpir o esperar determina la naturalidad de la interacción.

El modelo se basa en el encoder de `openai/whisper-tiny`, al que se le han recortado los embeddings posicionales de 1500 a 400 para fijar una ventana de análisis de 8 segundos de audio. Sobre este encoder se añaden una capa de atención con pooling aprendido y un MLP de dos capas que produce un único logit, cuya sigmoide representa la probabilidad de que el turno haya terminado. El artefacto principal es un archivo ONNX cuantizado a int8 de solo 8,5 MB, lo que lo hace extremadamente ligero y adecuado para despliegue en CPU. Se distribuye bajo licencia MIT y está pensado para integrarse en pipelines de agentes de voz que ya cuenten con un VAD previo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de `openai/whisper-tiny` modificado (embeddings posicionales recortados a 400, atención pooling, MLP de 2 capas) |
| Parametros totales | 7.885.953 (modelo principal `model_int8.onnx`); 507.265 (variante destilada `model_tinymel_int8.onnx`) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 8 segundos de audio (ventana fija, alineada a la derecha) |
| Tipos de cuantizacion | int8 dinámico (pesos uint8) y fp32 (ONNX) |
| Idiomas soportados | Inglés, hindi y Hinglish (código alternado hindi-inglés) |
| Licencia | MIT |
| Formato de pesos | ONNX (`.onnx`), con filtro mel incluido en `.npz` |

## Arquitectura y entrenamiento

El modelo reutiliza el encoder de Whisper-tiny, pero modifica su mecanismo de posicionamiento: los embeddings posicionales se recortan de 1500 a 400 posiciones, lo que limita la entrada a una ventana de 8 segundos de audio (128.000 muestras a 16 kHz). La salida del encoder pasa por una capa de atención con pooling aprendido y un MLP de dos capas que produce un logit único. La entrada es un log-mel de dimensiones `(1, 80, 800)`, calculado con la misma matemática de características de Whisper, y se alinea a la derecha: se conservan los últimos 8 segundos y los clips más cortos se rellenan con ceros a la izquierda.

El entrenamiento se realizó sobre el dataset `pipecat-ai/smart-turn-data-v3.2-train`, que contiene grabaciones etiquetadas de turnos completos e incompletos en inglés e hindi con acento indio, incluyendo muletillas y conjunciones colgantes. No se menciona el uso de RLHF ni DPO; es un clasificador supervisado estándar. Además del modelo principal, se incluye una variante destilada (`model_tinymel_int8.onnx`) que reemplaza el encoder de Whisper por una red convolucional ligera (stride-2 Conv1d, bloques depthwise-separable y BiGRU de 128 unidades), entrenada para imitar las salidas suaves del modelo Whisper con temperatura 2.0 y α=0.3. Esta variante es un reemplazo directo en cuanto a interfaz, pero sacrifica precisión a cambio de velocidad.

## Capacidades

- Detección de fin de turno en audio: clasifica si el hablante ha completado su turno o solo está haciendo una pausa, basándose únicamente en la prosodia y el contenido acústico de los últimos 8 segundos.
- Manejo de pausas meditativas, muletillas típicas del Hinglish (*haan*, *matlab*, *accha*, *yaar*, *umm*) y conjunciones colgantes (*…aur*, *…kyunki*, *…lekin*).
- Correcta liberación del turno en oraciones completas en Hinglish, incluyendo construcciones con adverbio posverbal (p. ej., *"…bahut zyada hai aaj"*), que suelen fallar en modelos entrenados solo en inglés.
- Soporte multilingüe limitado a inglés, hindi y su mezcla (Hinglish), con acento indio.
- Inferencia sin dependencias de frameworks pesados: solo requiere `numpy` y `onnxruntime`; no necesita torch ni transformers.
- Dos variantes de velocidad/precisión: el modelo completo (7,9 M parámetros, ~91 ms en CPU) y el destilado (0,5 M parámetros, ~14 ms en CPU), ambos con la misma interfaz de entrada/salida.

## Casos de uso

- Agentes de voz para atención al cliente en India: el modelo permite que un asistente telefónico sepa cuándo el cliente ha terminado de hablar, incluso si hace pausas largas o usa muletillas. Se integra tras un VAD que detecta la caída de energía y decide si responder o esperar.
- Asistentes de voz en aplicaciones móviles: al ser un modelo de 8,5 MB y correr en CPU, puede desplegarse en el dispositivo para detectar el fin de turno sin enviar audio a la nube, reduciendo latencia y costes.
- Sistemas de transcripción y subtitulado en vivo: aunque no transcribe, puede usarse para segmentar automáticamente el audio en turnos de habla, facilitando la sincronización de subtítulos o la generación de actas.
- Plataformas de telemedicina o consultas remotas: en entornos donde el médico y el paciente hablan en Hinglish, el modelo ayuda a que el sistema de grabación sepa cuándo cambia el turno, mejorando la estructuración de la conversación.
- Juegos y experiencias interactivas por voz: para personajes controlados por voz que necesitan reaccionar en tiempo real, el modelo permite que el personaje espere a que el jugador termine de hablar, incluso con pausas o dudas.
- Evaluación de calidad de agentes conversacionales: puede usarse como métrica objetiva para medir la fluidez de un sistema de voz, analizando si los tiempos de respuesta se alinean con los turnos reales de los usuarios.

## Benchmarks y rendimiento

El autor reporta las siguientes métricas de precisión (accuracy) sobre el split de test oficial de `pipecat-ai/smart-turn-data-v3.2-test` (n=9.329 para el modelo principal, n=225 para el destilado). Los valores corresponden a la evaluación en fp32; los umbrales indicados son los recomendados para cada archivo cuantizado.

| Modelo | Precisión global | Precisión Hinglish | Umbral recomendado (int8) |
|---|---:|---:|---:|
| `model_int8.onnx` (WhisperTinyTurn) | 0.938 | 0.951 | 0.50 |
| `model_tinymel_int8.onnx` (TinyMelNet destilado) | 0.896 | 0.871 | 0.57 |

No se han publicado resultados comparativos con otros modelos en la información disponible. El autor indica que el umbral de 0.50 para el int8 fue calibrado mediante un proceso de *decision-matching* con el modelo fp32 (que usa 0.63), logrando un 99.7% de acuerdos en 600 clips sintéticos de validación.

## Requisitos de hardware

- Inferencia en CPU: el modelo principal tarda ~91 ms por clip de 8 segundos en un portátil; la variante destilada tarda ~14 ms. No requiere GPU.
- Tamaño del artefacto: 8,5 MB (int8) o 31,58 MB (fp32), por lo que cabe en cualquier dispositivo con almacenamiento mínimo.
- Memoria RAM: al ser un modelo ONNX pequeño, el consumo de memoria es inferior a 100 MB en tiempo de ejecución.
- GPU: no necesaria; si se desea acelerar, cualquier GPU moderna con soporte ONNX Runtime serviría, pero no es el caso de uso previsto.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), compatible con servidores Python, edge devices (Raspberry Pi, móviles) y contenedores Docker. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia: ~91 ms (modelo completo) y ~14 ms (destilado) en CPU de portátil, medidos por el autor. El throughput dependerá del número de hilos y del hardware, pero es adecuado para tiempo real.

## Comparativa con modelos similares

No se dispone de datos comparativos cuantitativos con otros modelos de detección de turno en Hinglish. En la búsqueda web se encontraron proyectos similares, pero sin métricas publicadas que permitan una comparación rigurosa:

- `suvradeepp/tiny-hinglish-turn-detector` (Hugging Face): otro detector de turno para Hinglish, sin especificaciones detalladas disponibles.
- `abhishek-040010/smart-turn-hinglish` (Hugging Face): modelo de detección de turno y vacilación para Hinglish, también sin métricas públicas.
- `ZoroZoro95/hinglish-turn-detector` (GitHub): prototipo de investigación para el reto de detección de turno de Shiprocket, con enfoque en Hinglish y latencia CPU.

Dado que no hay datos de rendimiento comparables, no es posible establecer una tabla comparativa objetiva. Se recomienda evaluar cada modelo en el dataset de test de `pipecat-ai/smart-turn-data-v3.2` para una comparación justa.

## Limitaciones y advertencias

- El modelo está diseñado para usarse **después de un VAD**: espera ser consultado en momentos de pausa, no sobre audio activo continuo. Usarlo sin VAD degradará su rendimiento.
- No realiza diarización de hablantes ni distingue quién habla; solo clasifica si el turno actual ha terminado.
- No detecta si el turno es una pregunta; esa tarea queda fuera de su alcance.
- Solo soporta inglés, hindi y Hinglish con acento indio. Otros idiomas o acentos pueden producir resultados erróneos.
- El umbral de decisión es específico de cada archivo cuantizado. Si se re-cuantiza el modelo, hay que recalibrar el umbral; copiar el valor de 0.50 sin verificación puede cambiar el punto de operación.
- La variante destilada pierde 4.2 puntos de precisión global y 8.0 puntos en Hinglish respecto al modelo completo; no es recomendable para aplicaciones donde la precisión sea crítica.
- No debe usarse en decisiones de alto riesgo o relacionadas con seguridad, según el propio autor.
- El modelo tiene 0 descargas y 0 likes en Hugging Face, lo que sugiere que es un proyecto reciente o poco validado por la comunidad; se recomienda probarlo exhaustivamente antes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/deveshu/hinglish-turn-detector
- Dataset de entrenamiento: https://huggingface.co/datasets/pipecat-ai/smart-turn-data-v3.2-train
- Repositorio de referencia (no oficial): https://github.com/abhinav7289A/Hinglish-turn-detection
- Modelo similar: https://huggingface.co/suvradeepp/tiny-hinglish-turn-detector
- Modelo similar: https://huggingface.co/abhishek-040010/smart-turn-hinglish
- Prototipo de investigación: https://github.com/ZoroZoro95/hinglish-turn-detector
