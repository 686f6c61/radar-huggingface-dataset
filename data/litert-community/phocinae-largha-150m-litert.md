# litert-community/Phocinae-Largha-150M-LiteRT

## Resumen

Phocinae-Largha-150M-LiteRT es la conversión a LiteRT (el runtime de Google para inferencia en dispositivo, sucesor de TensorFlow Lite) del modelo Phocinae-Largha-150M-v1, un clasificador de decisiones tipadas desarrollado por el proyecto Phocinae. No es un modelo generativo: recibe un texto de estado y un conjunto de preguntas tipadas sobre él (sí/no, elección única y puntuación en escala) y devuelve probabilidades calibradas en un único forward pass. Está construido sobre el encoder jhu-clsp/mmBERT-small, con una cabeza de dos capas, un scorer de marcadores y una cabeza "act" adicional.

La relevancia de esta versión concreta es su orientación a despliegue en Android con aceleración por GPU y NPU. El autor reporta latencias de 15,3 ms en GPU con ventana de 256 tokens y 19,7 ms en NPU con ventana de 384 tokens sobre un Galaxy S26, lo que lo sitúa en el terreno de la clasificación estructurada en tiempo real sin salida a red. El paquete incluye seis variantes del grafo (tres ventanas de contexto por dos formas de embedding), la tabla de tokens, el tokenizador, la cabeza act y un host en Python.

El modelo base tiene 150M parámetros según su denominación y soporta inglés y chino. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales. Su interés práctico reside en sustituir llamadas a un LLM generativo por un clasificador determinista y barato cuando la tarea se reduce a decidir entre opciones predefinidas sobre un texto dado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT, base jhu-clsp/mmBERT-small) con cabeza de decisión de dos capas, marker scorer y act head |
| Parametros totales | 150M (según denominación del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de 256, 384 y 512 tokens (tres grafos independientes) |
| Tipos de cuantizacion | float16 en pesos FULLY_CONNECTED (vía DEQUANTIZE); embedding int8 (EMBEDDING_LOOKUP) o tabla de embeddings float16 en host |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | LiteRT (.tflite), tabla de embeddings en .bin float16, cabeza act en .tflite fp32 |

## Arquitectura y entrenamiento

El modelo base es un encoder transformer de tipo ModernBERT (mmBERT-small de JHU CLSP), adaptado por el proyecto Phocinae para una tarea de decisión tipada. Sobre la representación del encoder se añade una cabeza de dos capas que produce logits para cada tipo de pregunta: `noul` (sí/no), `choice` (selección entre criterios) y `score` (escala ordinal). Además, un marker scorer y una act head independiente generan una probabilidad de acción (`act_probability`) por pregunta. Toda la inferencia se resuelve en un único forward pass, sin generación autoregresiva ni decodificación.

La conversión a LiteRT se realizó con litert-torch 0.10.0 y fue validada contra el runtime de referencia en PyTorch fp32 (phocinae-server 0.1.5) sobre el split público de test de typed-decisions. La ejecución de referencia reprodujo las cifras del publicador: 1.811 de 2.000 decisiones coincidentes con las respuestas gold (0,9055). Se realizaron pruebas de robustez ante reordenación de opciones: al invertir las opciones cambiaron 13 de 600 respuestas; con tres órdenes aleatorios cambiaron 11, 9 y 6. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Clasificación de decisiones tipadas sobre un texto de estado: preguntas de sí/no (`noul`), elección única entre criterios (`choice`) y puntuación ordinal (`score`).
- Salida de probabilidades calibradas por opción en un solo forward pass, apta para umbrales y lógica de negocio posterior.
- Cabeza de acción independiente que emite `act_probability` para cada pregunta.
- Procesamiento de contexto de hasta 512 tokens según la variante de grafo elegida.
- Soporte multilingüe limitado a inglés y chino.
- No genera texto: la salida es exclusivamente estructurada (etiquetas y probabilidades).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en el sentido de un agente generativo; la "acción" es una probabilidad, no una llamada a herramienta.

## Casos de uso

- Enrutamiento de decisiones en sistemas de release: dado un informe de despliegue (logs, estado de health check, hora local), el modelo decide entre continuar, retener o revertir, con probabilidades por opción que permiten aplicar umbrales de confianza antes de actuar.
- Triaje de alertas en operaciones: clasificar el estado de un servicio en una escala ordinal (rutina, vigilancia, degradado, crítico) a partir de un resumen textual, con latencia de milisegundos en dispositivo.
- Moderación de contenido estructurada: decidir si un texto cumple o no un criterio definido y con qué grado de certeza, usando la pregunta `noul` y el umbral sobre `probability_true`.
- Clasificación de intención en asistentes de atención al cliente: elegir entre un conjunto cerrado de intenciones (`choice`) a partir del mensaje del usuario, con contexto de hasta 512 tokens para conversaciones multi-turno.
- Evaluación de riesgo en dispositivos móviles sin conectividad: al ejecutarse en LiteRT con perfiles GPU y NPU, permite clasificar texto localmente en Android sin enviar datos a un servidor.
- Filtrado previo en pipelines de datos: usar la salida probabilística para descartar o priorizar muestras antes de pasarlas a un modelo mayor, reduciendo coste computacional.
- Verificación de respuestas o afirmaciones: plantear preguntas de sí/no sobre un texto y usar las probabilidades calibradas para detectar inconsistencias.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precisión en test público (typed-decisions, referencia fp32) | 0,9055 (1.811/2.000 decisiones correctas) |
| Estabilidad ante opciones invertidas | 13 de 600 respuestas cambiadas |
| Estabilidad ante tres órdenes aleatorios | 11, 9 y 6 respuestas cambiadas de 600 |
| Latencia GPU (Galaxy S26, ventana 256) | 15,3 ms por pregunta |
| Latencia NPU (Galaxy S26, ventana 384) | 19,7 ms por pregunta |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no es generativo y no aplica esa métrica.

## Requisitos de hardware

- Tamaño de los grafos: entre 92,7 MB y 195,8 MB por variante, según forma (int8emb o embeds) y ventana.
- Tabla de embeddings: 196,6 MB en float16 ([256000, 384]).
- Cabeza act: 402.560 bytes (fp32).
- VRAM/RAM estimada para inferencia: en torno a 300-400 MB en la variante int8emb con tabla de embeddings incluida; los grafos embeds reducen el tamaño del modelo a ~93 MB pero requieren la tabla en host.
- GPU recomendadas: no se especifican modelos de escritorio; el autor valida en GPU de Galaxy S26 (móvil). Para escritorio, cualquier GPU con soporte LiteRT GPU delegate.
- Cabe en GPU de consumo: sí, dado el tamaño inferior a 200 MB por grafo, aunque la validación reportada es en dispositivo móvil.
- Opciones de despliegue: LiteRT (Android), con perfiles GPU, NPU y CPU; host en Python incluido (`host/phocinae_litert.py`); descriptor `hfmodels.json` para hfmodels-android.
- Latencia y throughput: 15,3 ms (GPU, L256) y 19,7 ms (NPU, L384) por pregunta en Galaxy S26; no se reporta throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phocinae-Largha-150M-LiteRT | 150M | 256/384/512 | Decisión tipada (clasificación estructurada) | Apache-2.0 | LiteRT, Hugging Face |
| jhu-clsp/mmBERT-small (base) | ~150M | No disponible | Encoder multilingüe general | No disponible en la información | Hugging Face |
| LLM generativo pequeño (p. ej. <1B) | >500M típicamente | Variable | Generación de texto y clasificación vía prompt | Variable | Múltiples runtimes |

No se dispone de datos de rendimiento de alternativas comparables en la información proporcionada. La comparación relevante es funcional: frente a un LLM generativo, este modelo no produce texto y no requiere decodificación, lo que reduce latencia y coste, pero limita su uso a decisiones predefinidas.

## Limitaciones y advertencias

- No es un modelo generativo: no puede redactar texto, resumir ni responder en lenguaje natural; solo emite etiquetas y probabilidades.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado.
- Contexto máximo de 512 tokens; textos más largos se truncan (el campo `state_truncated` lo indica).
- La precisión reportada (0,9055) es sobre el split público de typed-decisions; el rendimiento en dominios distintos no está validado.
- Sensibilidad al orden de las opciones: aunque baja (13/600 con inversión), existe y debe considerarse en producción.
- Riesgo de calibración deficiente fuera de la distribución de entrenamiento; las probabilidades no deben usarse como certeza absoluta sin validación.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base mmBERT-small puede tener condiciones propias no detalladas en esta información.
- No se documentan sesgos específicos; al ser un clasificador, hereda los sesgos de sus datos de entrenamiento, no disponibles.
- La validación se realizó en un único dispositivo (Galaxy S26); el rendimiento en otros hardware puede variar.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/Phocinae-Largha-150M-LiteRT
- Modelo base: https://huggingface.co/Phocinae/Phocinae-Largha-150M-v1
- Encoder base: https://huggingface.co/jhu-clsp/mmBERT-small
- Runtime de referencia: https://github.com/Phocinae/phocinae-server
