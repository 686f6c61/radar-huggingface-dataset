# nerfsaksham/decision-0.8b

## Resumen

Decision-0.8b es un modelo de decisión de 0,8 mil millones de parámetros desarrollado por Saksham Arora (usuario nerfsaksham en Hugging Face). No se trata de un modelo conversacional: recibe una situación, una pregunta y un conjunto fijo de opciones, y devuelve una probabilidad para cada opción en una sola pasada hacia adelante, sin generar texto ni requerir parsing de salida. Técnicamente es un adaptador LoRA (PEFT) sobre Qwen3.5-0.8B-Base, entrenado en 14 minutos en una T4 gratuita de Kaggle.

Su relevancia radica en resolver un problema muy concreto de los modelos pequeños: el sesgo de posición por el que favorecen la opción listada primero. Mediante una época de LoRA con reordenación aleatoria de las opciones en cada ejemplo, el modelo reduce las respuestas que cambian al reordenar opciones del 23,0 % al 8,7 % y mejora el error de calibración (ECE) de 0,067 a 0,028. Es un ejemplo interesante de especialización barata y reproducible para tareas de clasificación con opciones fijas, útil en pipelines de agentes donde se necesita una decisión calibrada en lugar de texto libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen3.5-0.8B-Base (transformer decoder) |
| Parametros totales | 0,8B (modelo base); parámetros entrenables del adaptador: no disponible |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible (heredada de Qwen3.5-0.8B-Base) |
| Tipos de cuantizacion | No disponible (uso documentado en float32) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 (adaptador); código en GitHub bajo MIT |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-0.8B-Base, un transformer decoder de 0,8B de parámetros. Sobre él se entrena un adaptador LoRA con r=16 y alpha=32 aplicado a las proyecciones de atención y MLP, durante una única época. La innovación clave del entrenamiento es el reordenamiento aleatorio de las opciones en cada pasada sobre cada ejemplo, de modo que la letra de la respuesta (A, B, C, D) no aporta señal alguna al modelo. Esto elimina mayoritariamente el sesgo de posición que sufren los modelos pequeños.

El entrenamiento se completó en 14 minutos en una T4 gratuita de Kaggle, lo que demuestra la viabilidad de este tipo de especialización con recursos mínimos. Los datos de entrenamiento no se redistribuyen con el modelo: el script `prep_data.py` del repositorio los reconstruye a partir de los datasets originales bajo sus propias licencias. No hay información disponible sobre el número total de tokens, la composición detallada del dataset ni el uso de RLHF/DPO.

## Capacidades

- Clasificación de opciones múltiples: dada una situación, una pregunta y opciones fijas (formato A, B, C, D), devuelve una probabilidad para cada opción en una sola pasada hacia adelante.
- Salida calibrada: probabilidades directamente interpretables sin parsing de texto generado (ECE de 0,028 en la evaluación del autor).
- Robustez al orden de opciones: solo el 8,7 % de las respuestas cambian al reordenar las opciones, frente al 23,0 % del modelo base.
- Uso como modelo de decisión para agentes: adecuado para puntos de decisión binarios o de opción múltiple dentro de pipelines de agentes (por ejemplo, decidir si pedir confirmación al usuario antes de una acción destructiva).
- No es conversacional: no genera texto libre ni mantiene diálogos.
- No hay soporte documentado de tool calling, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Puntos de decisión en agentes autónomos: un agente puede consultar el modelo antes de ejecutar acciones irreversibles (por ejemplo, "¿debe pedir confirmación al usuario antes de borrar 4.000 correos?" con opciones Yes/No), obteniendo una probabilidad calibrada sin generar texto.
- Enrutado de consultas en sistemas RAG: clasificar si una consulta requiere búsqueda web, recuperación en base de datos vectorial o respuesta directa, presentando las rutas como opciones fijas.
- Moderación y filtrado de contenido: decisiones binarias o por categorías fijas (aceptar/rechazar/escalar) sobre mensajes o solicitudes, con probabilidades que permiten definir umbrales de confianza.
- Clasificación de tickets de soporte: asignar una incidencia a una de varias categorías predefinidas (facturación, técnico, devoluciones) con una sola pasada, lo que reduce latencia frente a la generación de texto.
- Validación de pasos en pipelines multi-paso: verificar si el resultado de un paso cumple una condición antes de continuar, integrándose fácilmente en lógica de control por probabilidad.
- Evaluación automática (LLM-as-judge con opciones fijas): puntuar respuestas de otros modelos presentando las opciones de puntuación como choices, aprovechando la calibración para agregar resultados.
- Experimentación y docencia: el repositorio incluye código de entrenamiento y evaluación reproducible, útil para estudiar el sesgo de posición en modelos pequeños y técnicas de mitigación con LoRA.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 300 preguntas de evaluación (held-out), comparando el modelo base con la versión fine-tuned:

| Métrica | Base | Fine-tuned |
|---|---|---|
| Accuracy | 81,0 % | 85,3 % |
| Respuestas que cambian al reordenar opciones | 23,0 % | 8,7 % |
| Accuracy yes/no con "No" listado primero | 62 % | 82 % |
| Error de calibración (ECE) | 0,067 | 0,028 |
| Probabilidad asignada a las letras de opción | 0,44 | 0,999 |

El propio autor advierte que la ganancia de accuracy es marginal en 300 preguntas (McNemar p = 0,053) y que el resultado principal es la corrección del sesgo de orden, no una mejora sustancial de conocimiento. No hay comparativas con otros modelos de la categoría en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en float32, el modelo base de 0,8B requiere aproximadamente 3,2 GB; con el adaptador LoRA cargado la sobrecarga adicional es mínima. No hay cifras oficiales de cuantización.
- GPU recomendadas: cualquier GPU moderna con al menos 4-6 GB de VRAM; el entrenamiento se realizó en una NVIDIA T4 de 16 GB (Kaggle gratuito).
- Consumer GPUs: cabe con holgura en tarjetas como la RTX 3060 de 12 GB, RTX 4060 u otras de gama media; también es viable en CPU dada su escala.
- Opciones de despliegue: transformers + PEFT (uso documentado en la model card), y por tratarse de un modelo Qwen compatible con el ecosistema Hugging Face, debería funcionar con vLLM (fusión del adaptador) y llama.cpp/Ollama si se convierte a GGUF, aunque no hay soporte documentado explícito.
- Latencia: al requerir una sola pasada hacia adelante sin generación autorregresiva, la latencia por decisión es muy baja (del orden de decenas de milisegundos en GPU); no hay cifras oficiales de throughput.

## Comparativa con modelos similares

No se han publicado comparativas directas con otros modelos de decisión en la información disponible. A modo de referencia contextual, frente a alternativas habituales para decisiones con opciones fijas:

| Modelo | Enfoque | Parametros | Salida | Licencia |
|---|---|---|---|---|
| decision-0.8b | LoRA sobre Qwen3.5-0.8B-Base, especializado en decisión | 0,8B | Probabilidades por opción, una pasada | Apache 2.0 |
| Qwen3.5-0.8B-Base | Modelo base generalista | 0,8B | Texto generado (requiere parsing) | No disponible en la información proporcionada |
| LLM generalista pequeño (p. ej. modelos 1-2B con prompting) | Generación de texto con instrucciones | 1-2B | Texto a parsear, sensible al orden de opciones | Variable |

La ventaja de decision-0.8b frente a un LLM generalista con prompting es la salida probabilística directa, la calibración y la robustez al orden de opciones; su limitación es que no sirve para tareas generativas.

## Limitaciones y advertencias

- La mejora de accuracy es estadísticamente marginal: sobre 300 preguntas, McNemar p = 0,053, apenas por encima del umbral de significación; el autor lo reconoce explícitamente.
- El modelo no aprendió hechos nuevos: el fine-tuning le enseñó el formato de respuesta, no conocimiento adicional.
- Sesgo de posición residual: aunque reducido (8,7 % de respuestas sensibles al orden), no está eliminado por completo.
- Solo está documentado y evaluado en inglés; no hay datos de rendimiento en castellano u otros idiomas.
- Riesgo de alucinación: no aplicable en el sentido generativo, pero las probabilidades pueden ser incorrectas o mal calibradas fuera de la distribución de entrenamiento; conviene validar en el dominio de uso.
- No hay información sobre longitud de contexto ni cuantización, lo que puede requerir pruebas propias antes de producción.
- Los datos de entrenamiento no se distribuyen: hay que regenerarlos con `prep_data.py` respetando las licencias de los datasets originales.
- Al ser un derivado de Qwen3.5-0.8B-Base, hereda los sesgos del modelo base; no se han documentado auditorías de sesgo específicas.
- Métricas y evaluación proceden del propio autor; no hay verificación independiente de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nerfsaksham/decision-0.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Repositorio GitHub (código, entrenamiento y evaluación): https://github.com/saksham10arora-dotcom/decision-0.8b
- CLI de decisión (`decide.py`): https://github.com/saksham10arora-dotcom/decision-0.8b/blob/main/decide.py
- Web del autor: https://saksham.digital
