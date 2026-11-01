# omaressamrme/hieroglyph-classifier

## Resumen

Hieroglyph-classifier es un modelo de visión por computador desarrollado por omaressamrme (Omar Essam) que clasifica recortes de jeroglíficos egipcios y devuelve su código Gardiner correspondiente. Se trata de una red neuronal convolucional (CNN) implementada en Keras/TensorFlow con 2,1 millones de parámetros, entrenada específicamente para reconocer 59 signos distintos del corpus de los Textos de las Pirámides de Unas. No es un modelo generativo ni un modelo de lenguaje: es un clasificador de imágenes de dominio muy restringido, pensado como herramienta auxiliar para egiptología digital.

El modelo resuelve un problema concreto y acotado: dado un recorte ya segmentado de un signo jeroglífico (50×75 píxeles, trazo oscuro sobre fondo claro), predecir cuál de los 59 códigos Gardiner cubiertos corresponde. Su relevancia radica en que demuestra que una arquitectura CNN relativamente sencilla y entrenable en CPU (14 minutos) puede alcanzar un 96,9 % de top-1 accuracy en un subconjunto controlado del GlyphDataset de Franken y van Gemert (ACM Multimedia 2013), un conjunto de referencia en la literatura de reconocimiento automático de jeroglíficos.

Es importante encuadrar el alcance: el modelo no detecta signos dentro de una fotografía de un muro, no segmenta, no translitera ni traduce textos jeroglíficos. Es un componente de clasificación dentro de un pipeline más amplio de egiptología computacional, y su utilidad práctica está limitada a los 59 signos cubiertos y al estilo de grabado y condiciones de iluminación del monumento de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (3 bloques de 2 convoluciones 3×3 con BatchNorm, max-pooling y dropout; Flatten; densa de 256 unidades; softmax de 59 clases) |
| Parametros totales | 2,1 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 50×75 px en escala de grises) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificación de signos, sin componente lingüístico) |
| Licencia | MIT |
| Formato de pesos | Keras (`model.keras`), más `labels.json` con el mapeo de clases |

## Arquitectura y entrenamiento

La arquitectura es una CNN convolucional clásica de tres bloques. Cada bloque contiene dos convoluciones de 3×3 con 32, 64 y 128 filtros respectivamente, seguidas de BatchNorm, max-pooling y dropout. La salida de los bloques se aplana y pasa por una capa densa de 256 unidades con BatchNorm y dropout 0,5, que alimenta una capa softmax de 59 clases (una por cada código Gardiner cubierto). El total es de 2,1 millones de parámetros, un tamaño muy contenido que permite entrenamiento e inferencia en CPU.

El entrenamiento se realizó sobre 3.674 recortes de signos etiquetados manualmente (50×75 px) procedentes de los Textos de las Pirámides de Unas, del GlyphDataset de Franken y van Gemert (2013, licencia MIT), restringido a los 59 signos con al menos diez ejemplos. Se usó el optimizador Adam con tasa de aprendizaje 1e-3 y `ReduceLROnPlateau`, batch de 32, pesos de clase con amortiguación por raíz cuadrada, aumento de datos ligero (traslación y zoom con relleno blanco) y parada temprana sobre la accuracy de validación (paciencia 20). El entrenamiento duró 54 épocas (mejor resultado en la 34) y 14 minutos en CPU. El script exacto (`train_v2.py`), las métricas (`metrics.json`) y los resultados (`results/`) están incluidos en el repositorio.

## Capacidades

- Clasificación de imágenes de signos jeroglíficos individuales en 59 clases correspondientes a códigos Gardiner.
- Entrada: recorte ya segmentado del signo, en escala de grises, redimensionado a 50×75 píxeles, con trazo oscuro sobre fondo claro.
- Salida: distribución de probabilidad sobre las 59 clases, con acceso a top-1 y top-5.
- Mecanismo de umbral de confianza: con un umbral de 0,95, el modelo responde al 90 % de los signos con una accuracy del 99,5 %, lo que permite derivar los casos dudosos a revisión humana.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües, de generación de texto, de visión general ni de audio.
- No realiza detección de signos en imágenes completas ni segmentación.

## Casos de uso

- Digitalización asistida de corpus epigráficos: dado un conjunto de recortes de signos ya segmentados de los Textos de las Pirámides de Unas, el modelo asigna códigos Gardiner de forma automática, acelerando la catalogación manual de inscripciones.
- Herramienta de apoyo a la investigación en egiptología: un investigador puede usar el modelo como primer paso de anotación y revisar manualmente los casos con confianza inferior a 0,95, aprovechando la alta precisión del umbral.
- Etiquetado de datasets de egiptología computacional: el modelo puede preanotar grandes lotes de recortes de signos del mismo estilo de grabado, reduciendo el coste de crear nuevos conjuntos etiquetados.
- Componente de un pipeline de reconocimiento de inscripciones: combinado con un detector/segmentador previo (no incluido en este modelo), permite construir un sistema completo de lectura de muros con la fase de clasificación resuelta.
- Docencia y divulgación: el modelo sirve para ilustrar cómo una CNN pequeña (2,1 M de parámetros) puede resolver una tarea de clasificación fina en un dominio especializado, con código y métricas reproducibles.
- Validación de métodos: al estar entrenado sobre un subconjunto controlado del GlyphDataset, sirve como línea base reproducible para comparar futuros clasificadores de signos jeroglíficos.
- Despliegue en entornos con recursos limitados: al entrenar e inferir en CPU y ocupar un repositorio de tamaño mínimo (0,0 GB según HuggingFace), puede ejecutarse en portátiles o servidores sin GPU.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, campo `verified: false`), sobre el 20 % de test estratificado del GlyphDataset (735 glifos):

| Métrica | Valor |
|---|---|
| Top-1 accuracy | 0,9687 |
| Top-5 accuracy | 0,9973 |
| Macro F1 | 0,9388 |
| Umbral de confianza ≥ 0,95 | responde al 90 % de los glifos con 99,5 % de accuracy |

No se han publicado en la información disponible resultados comparativos con otros modelos sobre el mismo conjunto de test.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la práctica; el modelo es de 2,1 M de parámetros y está pensado para ejecutarse en CPU.
- GPU recomendadas: no requiere GPU; cualquier GPU con soporte TensorFlow puede acelerar el procesamiento por lotes, pero no es necesaria.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) e incluso en CPU de un portátil; el entrenamiento original se completó en 14 minutos en CPU.
- Opciones de despliegue: TensorFlow/Keras nativo mediante `tf.keras.models.load_model`; también es posible exportar a TensorFlow Lite o TensorFlow.js para despliegue en navegador o dispositivos móviles (no documentado en la model card).
- Latencia y throughput estimados: no disponibles de forma explícita; el tamaño del modelo y la entrada (50×75 px en escala de grises) sugieren una inferencia muy rápida en CPU, pero no se han publicado cifras.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos sobre modelos comparables de clasificación de jeroglíficos egipcios (parámetros, contexto, rendimiento, licencia). La model card cita el trabajo de Franken y van Gemert (2013) como origen del dataset, pero no ofrece una comparación de rendimiento con sus métodos. Por tanto, la comparativa se indica como no disponible.

| Modelo | Parámetros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| hieroglyph-classifier | 2,1 M | Clasificación de 59 signos Gardiner | MIT | HuggingFace, GitHub, demo |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dominio muy restringido: entrenado con un único monumento (Textos de las Pirámides de Unas), un único estilo de grabado y una única iluminación; la generalización a otras inscripciones no está garantizada.
- Cobertura parcial: solo cubre 59 de los 172 códigos del dataset; 113 códigos tienen demasiados pocos ejemplos para ser incluidos.
- Signos raros: los signos con menos de 20 glifos de entrenamiento son los más débiles, lo que se refleja en el Macro F1 (0,939) inferior al top-1 accuracy (0,969).
- Requiere entrada preprocesada: el modelo no detecta ni segmenta signos en una fotografía de muro; necesita recortes individuales ya preparados en el formato exacto (50×75 px, escala de grises, trazo oscuro sobre fondo claro).
- No traduce ni translitera: la salida es un código Gardiner, no texto legible ni significado.
- Riesgo de alucinación: como clasificador, siempre asigna una de las 59 clases con una probabilidad; sin el umbral de confianza, puede dar respuestas erróneas con alta seguridad aparente en signos fuera de distribución.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda citar el dataset original (Franken y van Gemert, 2013) y verificar los términos de uso de dicho dataset.
- Métricas no verificadas: los resultados del model-index tienen `verified: false`; no han sido reproducidos de forma independiente en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/omaressamrme/hieroglyph-classifier
- Repositorio GitHub (código, figuras y primer intento fallido): https://github.com/engomaressam/hieroglyph-classifier
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/omaressamrme/demos
- Notebook de Kaggle: https://www.kaggle.com/code/engomaressam/hieroglyph-classifier-97-on-59-gardiner-signs
- Artículo técnico (dev.to): https://dev.to/eng_omaressam_7cb0e2a9c/teaching-a-cnn-to-read-hieroglyphs-969-on-59-signs-and-why-my-first-model-failed-3a2n
- Portfolio del autor: https://omaressam.web.app/#projects
- Dataset de referencia: M. Franken y J. C. van Gemert, "Automatic Egyptian Hieroglyph Recognition by Retrieving Images as Texts", ACM Multimedia 2013 (citado en la model card; no se proporciona URL directa en la información disponible).
