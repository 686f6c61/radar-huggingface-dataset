# gustavolinoia/homer-bart-cnn-classifier

## Resumen

`homer-bart-cnn-classifier` es un proyecto academico de clasificacion binaria de imagenes desarrollado por Gustavo Lino para la disciplina de Redes Neurais e Deep Learning de FIAP. El objetivo es distinguir imagenes de Homer Simpson y Bart Simpson comparando tres aproximaciones de red neuronal convolucional: una CNN simple, una CNN con regularizacion y data augmentation, y transfer learning con MobileNetV2 congelado.

El repositorio no contiene pesos preentrenados ni un pipeline de inferencia empaquetado; es fundamentalmente un cuaderno de experimentacion (notebook de Google Colab) con el codigo y los resultados de la comparativa. La model card reporta precisiones de test de 87,67 %, 89,04 % y 89,04 % para los modelos A, B y C respectivamente, sobre un conjunto de test de solo 73 imagenes.

Su relevancia es didactica: ilustra el sobreajuste en datasets pequenos, el efecto de data augmentation y dropout, y las limitaciones de evaluar con muestras de test reducidas. No es un modelo apto para produccion ni para uso general fuera del contexto del ejercicio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (2-3 capas Conv2D + Dense) y transfer learning con MobileNetV2 congelado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (clasificador de imagenes, sin capacidad linguistica) |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se publican pesos; solo notebook y descripcion) |

Otros datos tecnicos derivados de la model card:

| Parametro | Valor |
|---|---|
| Entrada | imagenes RGB redimensionadas a 224x224, normalizadas (pixel/255) |
| Tamano de lote | 32 |
| Clases | 2 (`bart`, `homer`) |
| Dataset de entrenamiento | 118 imagenes de Bart + 78 de Homer (196 en total) |
| Dataset de test | 42 imagenes de Bart + 31 de Homer (73 en total) |
| Framework | TensorFlow / Keras |
| Entorno de ejecucion | Google Colab con GPU T4 |

## Arquitectura y entrenamiento

Se comparan tres arquitecturas. El modelo A es una CNN simple con dos capas Conv2D seguidas de capas densas. El modelo B anade data augmentation, dropout de 0,5 y una tercera convolucion de 64 filtros. El modelo C sustituye el extractor por MobileNetV2 preentrenado y congelado, entrenando solo la cabeza de clasificacion durante 10 epocas.

El preprocesamiento comun consiste en redimensionar a 224x224, normalizar los pixeles dividiendo por 255 y usar lotes de 32 imagenes. No se documenta el numero de tokens ni composicion de dataset mas alla del recuento de imagenes por clase; tampoco se menciona RLHF, DPO ni tecnicas de alineacion, algo esperable en un clasificador de vision. La innovacion tecnica destacable es la propia comparativa controlada entre CNN desde cero y transfer learning, con analisis explicito del sobreajuste (el modelo A alcanzo 100 % de precision en entrenamiento).

## Capacidades

- Clasificacion binaria de imagenes en dos clases: `homer` y `bart`.
- Inferencia sobre imagenes redimensionadas a 224x224 y normalizadas.
- Comparativa de tres variantes de CNN con distinto grado de regularizacion y transfer learning.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni generacion de texto.
- No dispone de modo thinking, vision general, audio ni otras capacidades especiales.
- El modelo C aprovecha caracteristicas genericas de MobileNetV2, lo que le permite cierta robustez ante variaciones de estilo dentro del dominio Simpson.

## Casos de uso

- Docencia en deep learning: servir como ejemplo practico de comparativa entre CNN desde cero y transfer learning, con discusion de sobreajuste y regularizacion en un notebook reproducible en Colab.
- Prototipo de clasificador de personajes: filtrar imagenes de Homer y Bart en un corpus pequeno de fan art o capturas de la serie, aceptando la precision limitada del conjunto de test.
- Ejercicio de evaluacion critica: usar el caso para ensenar por que un test de 73 imagenes no permite conclusiones robustas sobre diferencias de 1-2 puntos porcentuales.
- Base para ampliar dataset: punto de partida para un pipeline de recoleccion y etiquetado de imagenes de personajes, reutilizando el preprocesamiento a 224x224 y los lotes de 32.
- Demostracion de data augmentation: ilustrar como anadir dropout 0,5 y una tercera convolucion de 64 filtros mejora la generalizacion frente al modelo base.
- Experimentacion con MobileNetV2 congelado: medir el coste/beneficio de congelar un backbone preentrenado durante 10 epocas en una tarea de dos clases con pocos datos.
- Prueba de robustez fuera de dominio: replicar el experimento del autor con imagenes descargadas de internet para observar los fallos cuando el estilo difiere del dataset original.

## Benchmarks y rendimiento

Resultados reportados en la model card (precision sobre el conjunto de test de 73 imagenes):

| Modelo | Descripcion | Precision en test |
|---|---|---|
| A | CNN simple (2 Conv2D + Dense) | 87,67 % |
| B | A + data augmentation, dropout 0,5 y 3ª convolucion (64 filtros) | 89,04 % |
| C | Transfer learning con MobileNetV2 congelado (10 epocas) | 89,04 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, ImageNet, etc.) en la informacion disponible. El autor advierte que el conjunto de test es demasiado pequeno para considerar concluyentes las diferencias de 1-2 puntos porcentuales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano de las arquitecturas (CNN de 2-3 capas y MobileNetV2 congelado) es previsible que quepa en GPUs consumer con 4-8 GB, aunque no se documenta.
- GPU recomendadas: el autor uso una GPU T4 de Google Colab; cualquier GPU consumer reciente (GTX 1660, RTX 3060, RTX 4090) deberia ser suficiente para entrenamiento e inferencia de este tamano.
- Cabe en GPU consumer: si, segun el entorno descrito (Colab T4); no se aportan mediciones propias.
- Opciones de despliegue: no se documenta ninguna; el flujo descrito es ejecutar el notebook en Colab con el dataset en ZIP en Google Drive y ajustar la ruta en la primera celda. No hay artefactos para vLLM, llama.cpp, Ollama ni TGI (no aplican a un clasificador de vision de este tipo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables publicados con los que contrastar parametros, contexto, rendimiento o licencia. La propia model card ofrece una comparativa interna entre sus tres variantes (A, B y C), que se recoge en la seccion de benchmarks. Frente a clasificadores de vision genericos como ResNet-50 o EfficientNet, no hay datos en la informacion proporcionada para establecer una comparacion cuantitativa.

| Modelo | Parametros | Contexto | Precision reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| homer-bart-cnn-classifier (A/B/C) | no disponible | no aplica | 87,67 % / 89,04 % / 89,04 % en test propio | no disponible | solo notebook, sin pesos publicados |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dataset muy pequeno: 196 imagenes de entrenamiento y 73 de test; las diferencias de 1-2 puntos porcentuales no son estadisticamente concluyentes.
- Sobreajuste documentado: el modelo A alcanzo 100 % de precision en entrenamiento, lo que indica mala generalizacion.
- Fallos fuera de dominio: el propio autor reporta errores con imagenes descargadas de internet cuyo estilo difiere del dataset.
- Sesgos conocidos: no documentados de forma explicita; al tratarse de personajes de ficcion y un dataset reducido, cualquier sesgo de recoleccion (fuente, resolucion, encuadre) puede trasladarse al modelo.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si en forma de clasificaciones erroneas con alta confianza en imagenes atipicas.
- Limitaciones de contexto e idioma: no aplica; el modelo no procesa texto ni mantiene contexto conversacional.
- Restricciones de licencia: la licencia no esta disponible, por lo que no puede asumirse uso comercial; ademas, el uso de imagenes de personajes de The Simpsons puede estar sujeto a derechos de propiedad intelectual de terceros.
- Caveat para produccion: no se publican pesos entrenados ni pipeline de inferencia; el repositorio es un cuaderno academico, no un artefacto desplegable.
- Sin garantias de mantenimiento: creado y actualizado el 2026-11-03, con 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Hugging Face: https://huggingface.co/gustavolinoia/homer-bart-cnn-classifier
- No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios o demos.
