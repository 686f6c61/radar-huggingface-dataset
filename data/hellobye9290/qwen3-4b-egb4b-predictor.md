# hellobye9290/qwen3-4b-egb4b-predictor

## Resumen

qwen3-4b-egb4b-predictor es un adaptador LoRA sobre el modelo base Qwen/Qwen3-4B desarrollado por el usuario hellobye9290. A diferencia de un ajuste fino convencional orientado a generar respuestas, este modelo se ha entrenado como un clasificador de secuencias que estima la probabilidad de exito de una pregunta matematica bajo una politica de solucion concreta (generador qwen3_4b, configuracion EGB con tau=2 nat y 7 intentos). La salida es un valor sigmoide sobre un logit escalar, no texto generado.

El modelo combina el adaptador LoRA con una cabeza de clasificacion escalar entrenada, incluida en adapter_model.safetensors mediante modules_to_save. Esta pensado como herramienta experimental para predecir, pregunta a pregunta, la probabilidad de que el generador base resuelva correctamente el problema, sin necesidad de ejecutar la generacion completa. El repositorio ocupa 0,4 GB y depende del modelo base, que se descarga por separado y no se redistribuye.

Su relevancia es acotada y de investigacion: se trata de un predictor de una politica de solucion observada, no de un generador de respuestas mejorado. El autor advierte explicitamente que un menor error de prediccion no implica mayor precision final en las respuestas EGB, y que las particiones pequenas mostraron sobreajuste. No hay descargas ni likes registrados, y la licencia no esta declarada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder Qwen3-4B con cabeza de clasificacion de secuencia escalar |
| Parametros totales | No disponible (adaptador LoRA; el modelo base Qwen3-4B tiene 4.000 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens de prompt como maximo; entradas superiores lanzan error |
| Tipos de cuantizacion | No disponible (inferencia en BF16 sobre CUDA y float32 sobre CPU) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (se aplican los terminos upstream de Qwen/Qwen3-4B) |
| Formato de pesos | safetensors (adapter_model.safetensors con modules_to_save) |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT de tipo LoRA aplicado sobre Qwen/Qwen3-4B, un transformer decoder de 4.000 millones de parametros. Sobre la representacion del modelo se anade una cabeza de clasificacion escalar entrenada que produce un logit, transformado mediante sigmoide en una probabilidad de exito. La cabeza queda incluida en el fichero del adaptador gracias a modules_to_save, de modo que la inferencia no requiere componentes adicionales fuera del repositorio y el modelo base.

El entrenamiento se realizo sobre el dataset hellobye9290/math-success-egb7, con objetivo de clasificacion binaria de exito bajo una politica fija: generador qwen3_4b, configuracion EGB con tau=2 nat y 7 intentos por problema. La seleccion de checkpoint por epoca se hizo minimizando la BCE suave de desarrollo, nunca la precision de test. El autor documenta las epocas por semilla, metricas y SHA256 en selected_checkpoints.json, y fija la revision del modelo base junto con el SHA256 de los pesos originales en cada predictor_metadata.json. El entorno de entrenamiento original fue Python 3.12.13, torch 2.11.0+cu128, Transformers 5.17.0 y PEFT 0.21.2.

## Capacidades

- Prediccion de probabilidad de exito de una pregunta matematica bajo una politica de solucion concreta, devolviendo sigmoid(logit) en lugar de texto.
- Clasificacion de secuencias (sequence-classification) con cabeza escalar entrenada.
- Procesamiento de entradas con la plantilla de chat original sin modo thinking y el sufijo de prompt especifico del entrenamiento.
- Rechazo explicito de entradas que incluyan soluciones de referencia o etiquetas gold.
- Limite estricto de 4.096 tokens de prompt, con error en lugar de truncado silencioso.
- Inferencia en CPU (float32) y en CUDA (BF16, batch size 2 por defecto).
- Verificacion de checksums de los pesos del modelo base descargado.
- No genera respuestas, no soporta tool calling, no implementa razonamiento multi-paso y no tiene capacidades multimodales ni de audio.

## Casos de uso

- Filtrado previo de problemas en pipelines de evaluacion: dado un banco de preguntas matematicas, el predictor estima la probabilidad de exito del generador qwen3_4b antes de ejecutar la generacion, permitiendo priorizar o descartar casos y ahorrar computo.
- Analisis de dificultad por problema: agregando las probabilidades por problema se puede caracterizar que subconjuntos del banco resultan mas duros para la politica EGB configurada, util para construir conjuntos de evaluacion estratificados.
- Monitorizacion de una politica de solucion en produccion: si el generador y la configuracion EGB coinciden con los del entrenamiento, el predictor sirve como senal de alerta temprana sobre la tasa esperada de exito en lotes entrantes.
- Investigacion sobre calibracion de predictores de exito: el autor documenta que la calibracion puede ser peor que una linea base constante pese a mejorar la BCE, lo que convierte al modelo en un caso de estudio para metodologias de calibracion.
- Experimentos de seleccion de datos: las probabilidades predichas pueden usarse para muestrear problemas con dificultad controlada en la construccion de nuevos datasets de entrenamiento o evaluacion.
- Reproducibilidad de experimentos: al fijar revision del modelo base, checksums y epocas por semilla, el adaptador permite reproducir exactamente la prediccion documentada en un entorno con las versiones de Python, torch, Transformers y PEFT indicadas.
- Comparacion de politicas de solucion: entrenando predictores analogos sobre otras configuraciones EGB se puede contrastar la dificultad relativa que cada politica impone sobre el mismo banco de problemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo indica que la seleccion de checkpoint se baso en la BCE suave de desarrollo y que las metricas de tres semillas describen modelos separados, no un ensemble.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el adaptador ocupa 0,4 GB y el modelo base Qwen3-4B requiere cargarse completo en BF16 (aproximadamente 8 GB de pesos) o en float32 sobre CPU.
- GPU recomendadas: no especificadas por el autor; cualquier GPU con memoria suficiente para Qwen3-4B en BF16 es candidata.
- Cabe en GPU de consumo: previsiblemente si, en tarjetas con al menos 8-10 GB de VRAM para el modelo base en BF16, aunque el autor no lo confirma.
- Opciones de despliegue: el repositorio incluye un entrypoint propio (predict.py) que descarga el modelo base fijado y verifica checksums; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el formato de clasificacion con cabeza escalar dificulta su uso en servidores de generacion estandar.
- Latencia y throughput: no disponibles. El script usa batch size 2 por defecto en CUDA y float32 en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-egb4b-predictor | Adaptador LoRA sobre Qwen3-4B | 4.096 tokens | Prediccion de exito (clasificacion) | No disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3-4B | 4.000 millones | No disponible en la informacion | Generacion de texto y razonamiento | Terminos upstream de Qwen | Hugging Face |
| Alternativas de prediccion de exito | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre otros predictores de exito comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- El modelo predice la probabilidad de exito de una politica de solucion observada concreta; no es un generador de respuestas y no debe usarse como tal.
- Un menor error de prediccion no implica mejor precision final en las respuestas EGB, segun advierte el propio autor.
- Las fracciones de exito observadas contienen ruido de muestreo; la calibracion puede ser peor que una linea base constante pese a mejorar la BCE.
- Las particiones pequenas de EGB mostraron sobreajuste durante el entrenamiento.
- La ventana de entrada esta limitada a 4.096 tokens; prompts mas largos provocan error.
- No se deben mezclar adaptadores entre modelos base o revisiones distintas.
- El modelo base no se redistribuye y debe descargarse por separado; sus terminos upstream aplican al conjunto.
- La licencia del adaptador no esta declarada, lo que impide confirmar condiciones de uso comercial.
- Requiere un entorno con versiones concretas (Python 3.12, torch 2.11.0+cu128, Transformers 5.17.0, PEFT 0.21.2); otras versiones pueden alterar los resultados.
- Las metricas de tres semillas corresponden a modelos separados, no a un ensemble.
- No hay datos publicados de sesgos, idiomas soportados ni rendimiento en benchmarks.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hellobye9290/qwen3-4b-egb4b-predictor
- Modelo base Qwen/Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/hellobye9290/math-success-egb7
