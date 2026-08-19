# mlasli/Qwen3.8-27B-Heretic-Abliterated-MLX-8bit

## Resumen

El modelo `mlasli/Qwen3.8-27B-Heretic-Abliterated-MLX-8bit` es una cuantización en formato MLX de 8 bits de un modelo de 27.000 millones de parámetros basado en `Qwen/Qwen3.8-27B`, al que se le ha aplicado la técnica de abliteration denominada Heretic. Esta técnica elimina la dirección de rechazo del modelo, reduciendo drásticamente las respuestas de negativa ante instrucciones potencialmente dañinas o no deseadas, manteniendo en gran medida las capacidades generales del modelo original. El autor, mlasli, ha publicado esta versión cuantizada específicamente para su uso en equipos Apple Silicon mediante la librería MLX, ofreciendo una alternativa rápida y eficiente en memoria para tareas de generación de texto sin restricciones.

La relevancia de este modelo radica en su aplicación en ámbitos como el roleplay, la escritura creativa o la exploración de comportamientos de modelos sin alineación de seguridad. Al estar cuantizado en 8 bits, el modelo ocupa 28,6 GB, lo que lo hace ejecutable en Macs con suficiente memoria unificada. No obstante, al eliminar la alineación de seguridad, su uso conlleva riesgos éticos y legales importantes, y debe emplearse con responsabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3) |
| Parametros totales | 27B (segun el autor; el conteo de safetensors muestra 7,56B debido al empaquetado de cuantizacion MLX) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MLX 8-bit (group-wise, group size 64); tambien existe version 6-bit |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), tambien disponibles en GGUF en repos separados |

## Arquitectura y entrenamiento

El modelo base es `Qwen/Qwen3.8-27B`, un transformer autoregresivo de 27.000 millones de parametros. Sobre este, se aplico la tecnica Heretic, un metodo de abliteration de una sola direccion que elimina la direccion de rechazo aprendida durante el alineamiento de seguridad. El proceso incluye una busqueda de hiperparametros con Optuna para seleccionar los parametros de ablacion en el frente de Pareto entre cumplimiento y divergencia KL del primer token. El resultado es un modelo que responde a practicamente cualquier instruccion sin negativas, conservando el resto de capacidades.

La cuantizacion a 8 bits se realizo con `mlx_lm.convert`, utilizando cuantizacion afin por grupos (group size 64). En esta conversion solo se incluyen los pesos de la parte de lenguaje (`language_model.*`), omitiendo el modulo de vision del modelo original. Por tanto, el modelo resultante es exclusivamente de texto.

## Capacidades

- Generacion de texto fluida y coherente en ingles.
- Respuesta directa a instrucciones sin rechazos (compliance del 94% en pruebas de comportamientos daninos).
- Adecuado para roleplay y escritura creativa sin restricciones tematicas.
- Mantiene capacidades generales de razonamiento y conocimiento del modelo base (no se han evaluado formalmente en esta version).
- No soporta entrada de imagenes (se elimino el vision tower).
- No se documenta soporte explicito de tool calling o funciones de agente, aunque podria heredarlas del modelo base (no verificado).

## Casos de uso

- Roleplay inmersivo: el modelo puede mantener conversaciones de personaje sin negarse a temas adultos o controvertidos, gracias a su alta tasa de cumplimiento. Es util para juegos de rol textuales o simulaciones de personajes.
- Escritura creativa sin restricciones: generacion de narrativas, dialogos o guiones que aborden temas tabu o explicitos, donde un modelo alineado normalmente rechazaria la peticion.
- Asistentes de conversacion para entornos controlados: en aplicaciones donde el moderador filtra el contenido, puede usarse como backend para generar respuestas variadas sin rechazos automaticos.
- Generacion de dialogos para videojuegos o prototipos: permite crear interacciones de NPC con mayor libertad tematica.
- Investigacion sobre alineacion y seguridad: como modelo de referencia para estudiar los efectos de la abliteration en el comportamiento de LLMs, comparando con la version original.
- Pruebas de robustez de sistemas de moderacion: evaluar clasificadores de contenido danino generando respuestas que un modelo alineado no produciria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye una evaluacion independiente del modelo fusionado (antes de la cuantizacion), con los siguientes datos:

| Metrica | Valor |
|---|---|
| Compliance (comportamientos daninos, detector de Zou) | 94,0% |
| Tasa de rechazo (subcadenas de Zou, 29 patrones) | 6,0% |
| Divergencia KL del primer token vs. base | 0,0467 |

Un detector combinado de palabras clave reporto un 18,0% de rechazo, pero la revision manual indico que la mayoria eran falsos positivos, ya que el modelo usa terminos como "ilegal" o "danino" dentro de respuestas conformes.

## Requisitos de hardware

- Tamano del modelo: 28,6 GB en cuantizacion 8-bit MLX.
- Requiere un Mac con Apple Silicon (M1, M2, M3 o superior) y al menos 48-64 GB de memoria unificada para cargar el modelo y dejar espacio para el contexto y la generacion.
- Se ejecuta con `mlx-lm` (generacion por linea de comandos o servidor compatible con OpenAI).
- No es compatible directamente con GPUs NVIDIA o AMD; para esos sistemas se recomiendan las versiones GGUF (llama.cpp/Ollama).
- El rendimiento depende de la memoria y del ancho de banda del chip; en un M2 Max con 64 GB se pueden esperar velocidades de decodificacion de varios tokens por segundo, aunque no se proporcionan cifras exactas.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Compliance | Rechazo | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | BF16 | No disponible | Alta (modelo alineado) | Apache-2.0 |
| Qwen3.8-27B-Heretic-Abliterated (este) | 27B | MLX 8-bit | 94% | 6% | Apache-2.0 |
| Otros modelos abliterated (p.ej. de la comunidad) | Variable | Variable | No disponible | Baja | Variable |

La comparacion directa con el modelo base muestra una diferencia sustancial en la tasa de rechazo, siendo este modelo mucho mas permisivo. No se dispone de datos de otros modelos abliterated para una comparacion cuantitativa.

## Limitaciones y advertencias

- El modelo solo soporta ingles; no se ha evaluado su rendimiento en otros idiomas.
- Al eliminar la alineacion de seguridad, el modelo puede generar contenido explicito, ofensivo, ilegal o peligroso. Su uso debe limitarse a entornos controlados y cumpliendo la legislacion local.
- No procesa imagenes; cualquier entrada multimodal fallara.
- La cuantizacion a 8 bits puede introducir una ligera degradacion en la calidad de generacion respecto al modelo en BF16, aunque no se han cuantificado diferencias.
- La licencia Apache-2.0 permite uso comercial, pero el autor advierte que el contenido generado puede no ser apto para todos los contextos.
- No se proporcionan datos sobre la longitud de contexto soportada; se recomienda verificar la documentacion de Qwen3.8-27B para conocerla.
- El modelo puede alucinar o producir respuestas factualmente incorrectas, especialmente en temas delicados, debido a la falta de alineacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mlasli/Qwen3.8-27B-Heretic-Abliterated-MLX-8bit
- Modelo base (BF16): https://huggingface.co/mlasli/Qwen3.8-27B-Heretic-Uncensored-BF16
- Version 6-bit MLX: https://huggingface.co/mlasli/Qwen3.8-27B-Heretic-Abliterated-MLX-6bit
- GGUF Q8_0: https://huggingface.co/mlasli/Qwen3.8-27B-Heretic-Uncensored-Q8_0-GGUF
- GGUF Q6_K: https://huggingface.co/mlasli/Qwen3.8-27B-Heretic-Uncensored-Q6_K-GGUF
- GGUF Q4_K_M: https://huggingface.co/mlasli/Qwen3.8-27B-Heretic-Uncensored-Q4_K_M-GGUF
- Heretic (metodo de abliteration): https://github.com/mlabonne/heretic-llm
