# hellobye9290/qwen3-1.7b-sampling64-predictor

## Resumen

`qwen3-1.7b-sampling64-predictor` es un adaptador LoRA publicado por el usuario hellobye9290 sobre el modelo base Qwen/Qwen3-1.7B. No es un generador de texto: se trata de un clasificador de secuencias que predice, a partir unicamente del enunciado de un problema matematico, la probabilidad de que el modelo base Qwen3-1.7B (en modo no-thinking) produzca una solucion correcta al muestrear 64 respuestas. La salida es un escalar pasado por sigmoide, no texto generado.

El adaptador combina los pesos LoRA con una cabeza de clasificacion escalar entrenada, incluida en `adapter_model.safetensors` mediante `modules_to_save`. El modelo se entreno sobre el dataset `hellobye9290/math-success-sampling64`, que registra las tasas de exito observadas por problema bajo una politica de muestreo concreta. Su utilidad practica es servir como estimador de dificultad o de probabilidad de exito para enrutamiento, filtrado o priorizacion de consultas antes de invocar al generador, sin necesidad de ejecutar las 64 muestras reales.

Es un artefacto experimental, con cero descargas y sin likes en el momento de la consulta, orientado a investigacion sobre prediccion de exito en razonamiento matematico. El autor advierte explicitamente de que un menor error de prediccion no implica mejor exactitud final del sistema, y de que las fracciones de exito observadas contienen ruido de muestreo y pueden presentar sobreajuste en los splits pequenos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder (Qwen3-1.7B) con cabeza de clasificacion de secuencia escalar |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Qwen3-1.7B tiene 1.700 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens de prompt (el script lanza error si se supera, en lugar de truncar) |
| Tipos de cuantizacion | no disponible (inferencia en BF16 sobre CUDA y float32 sobre CPU) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor indica que aplican los terminos upstream de Qwen/Qwen3-1.7B) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA con `modules_to_save`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder de 1.700 millones de parametros, y le anade un adaptador LoRA junto con una cabeza de clasificacion escalar entrenada de forma conjunta. La tarea es de clasificacion de secuencias: la entrada es solo el enunciado del problema (sin solucion ni etiquetas), y la salida es `sigmoid(logit)`, interpretada como probabilidad de exito. La cabeza se persiste dentro del fichero del adaptador mediante `modules_to_save`.

El entrenamiento se realizo sobre el dataset `hellobye9290/math-success-sampling64`, que contiene tasas de exito por problema bajo muestreo de 64 soluciones con Qwen3-1.7B en modo no-thinking. La seleccion de checkpoint por epoca se hizo minimizando la BCE suave (soft BCE) sobre el conjunto de desarrollo, nunca la exactitud de test. El autor documenta los epochs seleccionados por semilla, sus metricas y hashes SHA256 en `selected_checkpoints.json`, y fija la revision del modelo base en cada `predictor_metadata.json` junto con el SHA256 de los pesos originales. Se conservan todas las semillas seleccionadas disponibles, y cada semilla corresponde a un modelo independiente, no a un ensemble.

El entorno de entrenamiento de referencia fue Python 3.12.13, torch 2.11.0+cu128, Transformers 5.17.0 y PEFT 0.21.2, con las versiones completas en `environment_expected.json`. La inferencia usa la plantilla de chat original en modo no-thinking con el sufijo de prompt correspondiente.

## Capacidades

- Prediccion de probabilidad de exito: dada una pregunta matematica, devuelve un escalar en (0, 1) que estima la tasa de acierto de Qwen3-1.7B no-thinking con 64 muestras.
- Clasificacion de secuencias: el modelo no genera texto; su unica salida es la probabilidad calibrada (o no calibrada) del cabezal escalar.
- Entrada restringida: acepta unicamente `problem_id` y `problem`; el script rechaza soluciones o etiquetas de referencia.
- Verificacion de integridad: el entrypoint descarga el modelo base fijado y comprueba sumas de verificacion de los pesos.
- Soporte multi-semilla: se pueden cargar subcarpetas de semilla distintas como `--checkpoint`.
- No soporta tool calling, agentes, vision, audio ni generacion de codigo; no es un modelo de proposito general.

## Casos de uso

- Enrutamiento de consultas matematicas: usar la probabilidad predicha para decidir si una pregunta se envia a un modelo pequeno (alta probabilidad de exito) o a uno mayor o con mas muestras (baja probabilidad), reduciendo coste computacional.
- Priorizacion en pipelines de evaluacion: ordenar un lote de problemas por dificultad estimada antes de ejecutar el muestreo real, para asignar presupuesto de computo a los casos mas inciertos.
- Filtrado de datasets de entrenamiento: descartar o marcar problemas con probabilidad de exito extrema (casi 0 o casi 1) que aportan poca senal en tecnicas de RL o destilacion.
- Estimacion de coste antes de inferencia: calcular de antemano cuantas muestras seran necesarias para alcanzar una tasa de exito objetivo en un conjunto de problemas.
- Analisis de dificultad por tema: agregar las predicciones sobre un corpus para identificar areas del temario donde el modelo base falla sistematicamente.
- Investigacion sobre calibracion: comparar la probabilidad predicha con la fraccion de exito observada para estudiar la calibracion de estimadores de exito en razonamiento.
- Deteccion de problemas mal formulados: probabilidades anormalmente bajas en enunciados que deberian ser faciles pueden senalar ambiguedad o errores en el texto de entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que las metricas por semilla (BCE suave de desarrollo, entre otras) estan en `selected_checkpoints.json`, pero no se proporcionan cifras numericas en la model card. Tampoco se ofrecen comparaciones con lineas base mas alla de la mencion a una "linea base constante" en el contexto de calibracion.

## Requisitos de hardware

- VRAM estimada: el modelo base Qwen3-1.7B en BF16 ocupa aproximadamente 3,4 GB de pesos; con el adaptador LoRA y la cabeza de clasificacion, la huella total ronda los 3,5-4 GB en GPU, mas overhead de activaciones (batch por defecto de 2).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM es suficiente; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 y H100 funcionan sin problema.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna con 8 GB o mas.
- CPU: soportada mediante `--device cpu` en float32, con mayor latencia pero funcional para lotes pequenos.
- Opciones de despliegue: el repositorio incluye un entrypoint propio (`predict.py`) basado en Transformers y PEFT; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo generativo.
- Latencia y throughput: no disponibles. El autor solo menciona batch size 2 por defecto en CUDA.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de prediccion de exito sobre Qwen3-1.7B ni adaptadores equivalentes. Como referencia del modelo base, Qwen3-1.7B es un transformer decoder de 1.700 millones de parametros con licencia Apache 2.0 (segun los terminos upstream de Qwen), mientras que este adaptador no declara licencia propia.

## Limitaciones y advertencias

- No es un generador de respuestas: no debe usarse para producir soluciones, solo para estimar probabilidades de exito.
- Predictor de una politica concreta: estima el comportamiento de Qwen3-1.7B no-thinking con muestreo 64; cambiar el modelo base, la revision o la politica de muestreo invalida las predicciones.
- No mezclar adaptadores entre modelos base o revisiones distintas; la revision esta fijada por SHA256.
- Menor error de prediccion no implica mejor exactitud final: el autor advierte que una mejor BCE no garantiza mejoras en la precision de respuesta del sistema completo.
- Ruido de muestreo: las fracciones de exito observadas contienen ruido; la calibracion puede ser peor que una linea base constante pese a mejorar la BCE.
- Sobreajuste: los splits pequenos del dataset EGB mostraron sobreajuste, por lo que la generalizacion a dominios distintos es incierta.
- Limite de contexto: prompts de mas de 4.096 tokens provocan un error explicito; no hay truncado silencioso.
- Licencia no declarada: no se especifica licencia propia; aplican los terminos de Qwen/Qwen3-1.7B. Verificar antes de uso comercial.
- Idiomas: no se documenta que idiomas cubre el predictor; el dataset de entrenamiento no se describe en detalle.
- Cero adopcion: sin descargas ni likes, sin validacion externa independiente.
- Entorno de inferencia fijado: requiere Python 3.12 y versiones concretas de torch, Transformers y PEFT; otras combinaciones pueden fallar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hellobye9290/qwen3-1.7b-sampling64-predictor
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/hellobye9290/math-success-sampling64
