# Sakni-Tasnim/agrovision-models

## Resumen

AgroVision Plant Health Models es una coleccion de dos modelos de clasificacion de imagenes basados en redes neuronales convolucionales (CNN), implementados con TensorFlow y Keras, desarrollados por el usuario Sakni-Tasnim en el marco del proyecto AgroVision. Su proposito es la deteccion de enfermedades en hojas de dos cultivos concretos: platano (banana) y fresa (strawberry). Cada cultivo dispone de su propio modelo independiente, distribuido como fichero `.keras` (`best_banana_cnn.keras` y `best_strawberry_cnn.keras`).

El repositorio se publica como un contenedor de artefactos de modelos mas que como un modelo unico, y esta orientado a un pipeline de clasificacion de imagenes (`image-classification`) dentro del dominio agricola. La relevancia actual es acotada: se trata de un proyecto de nicho, con cero descargas y cero likes en el momento de la consulta, sin model card detallada ni resultados de evaluacion publicados.

No se dispone de informacion sobre la arquitectura interna exacta (numero de capas, parametros, resolucion de entrada), el dataset de entrenamiento, el rendimiento o la licencia. Todo lo que sigue se limita a lo declarado en la model card y a los metadatos de Hugging Face, indicando explicitamente los datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional (CNN) en TensorFlow/Keras; detalle de capas no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (clasificacion de imagenes; sin soporte linguistico declarado) |
| Licencia | no disponible |
| Formato de pesos | `.keras` (formato nativo de Keras 3); dos ficheros: `best_banana_cnn.keras` y `best_strawberry_cnn.keras` |

## Arquitectura y entrenamiento

La model card indica unicamente que se trata de modelos CNN convolucionales para clasificacion de enfermedades en hojas de platano y fresa. No se especifica la topologia concreta (por ejemplo, si parte de una red tipo ResNet, MobileNet, EfficientNet o una CNN propia), ni el numero de capas, ni la resolucion de entrada esperada, ni el numero de clases por cultivo. Tampoco se documenta el dataset de entrenamiento, su tamano, la composicion de clases ni si se aplicaron tecnicas de aumento de datos.

No hay informacion sobre procesos de ajuste fino, regularizacion, inicializacion con pesos preentrenados (transfer learning) ni metricas de validacion. La unica referencia operativa es el codigo de carga mediante `keras.models.load_model`, lo que confirma compatibilidad con Keras 3 y el formato `.keras`.

## Capacidades

- Clasificacion de imagenes de hojas de platano para detectar enfermedades (clases concretas no documentadas).
- Clasificacion de imagenes de hojas de fresa para detectar enfermedades (clases concretas no documentadas).
- Carga directa en Python mediante Keras (`keras.models.load_model`).
- Dos modelos independientes, uno por cultivo, lo que permite desplegarlos por separado.
- No se declara soporte de tool calling, agentes, razonamiento multi-paso, texto, vision general, audio ni modo thinking.
- No se declara soporte multilingue (no aplica a un clasificador de imagenes).

## Casos de uso

- Monitorizacion de cultivos de platano en campo: captura de imagenes de hojas con un movil o dron y clasificacion automatica para detectar signos de enfermedad antes de que se extiendan, usando el modelo `best_banana_cnn.keras`.
- Monitorizacion de cultivos de fresa en invernadero: inspeccion periodica de hojas y clasificacion con `best_strawberry_cnn.keras` para priorizar tratamientos fitosanitarios.
- Aplicacion movil de asistencia al agricultor: integracion del modelo en una app que, a partir de una foto, devuelva la clase de enfermedad detectada y permita al usuario consultar recomendaciones.
- Triaje en estaciones de campo con Raspberry Pi u otros dispositivos de borde: al ser una CNN en formato Keras, puede exportarse a TensorFlow Lite para inferencia local (requiere validacion previa, no documentada por el autor).
- Etiquetado asistido de imagenes: uso del clasificador para preetiquetar lotes de imagenes de hojas y acelerar la revision manual en un pipeline de anotacion.
- Investigacion agronomica: generacion de series temporales de clasificaciones por parcela para estudiar la evolucion de la incidencia de enfermedades, siempre que se valide la precision del modelo en el dominio concreto.
- Docencia y prototipado: ejemplo de extremo a extremo de un clasificador de imagenes con Keras aplicado a un dominio real, util para talleres de vision por computador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye precision, recall, F1, matriz de confusion ni metricas de validacion para ninguno de los dos modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del tamano y la topologia de la CNN, no documentados).
- GPU recomendadas: no disponible. Al ser un modelo de vision de alcance acotado, es probable que quepa en GPUs de consumo, pero el autor no lo confirma.
- Compatibilidad con GPU de consumo: no confirmada por el autor.
- Opciones de despliegue: carga nativa con Keras/TensorFlow en Python; exportacion potencial a TensorFlow Lite o TensorFlow Serving (no documentada). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion rigurosa. Como referencia de categoria, existirian clasificadores de enfermedades de plantas basados en CNN o en modelos de vision preentrenados (por ejemplo, variantes de MobileNet o EfficientNet ajustadas a datasets agricolas publicos), pero no se dispone de datos verificables para contrastarlos con AgroVision en esta ficha.

## Limitaciones y advertencias

- Ausencia total de metricas: no hay evidencia publicada de precision, recall ni robustez; no debe usarse en produccion sin una evaluacion propia sobre datos del dominio objetivo.
- Alcance muy restringido: solo platano y fresa; no cubre otros cultivos ni enfermedades fuera de las clases con las que se entreno (no documentadas).
- Sesgos desconocidos: al no documentarse el dataset, se desconoce la distribucion de clases, la procedencia geografica de las imagenes y posibles sesgos de iluminacion, fondo o variedad de cultivo.
- Riesgo de falsos negativos y falsos positivos: en un contexto fitosanitario, un error de clasificacion puede derivar en tratamientos innecesarios o en perdidas de cosecha; requiere supervision humana.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribucion de los pesos; es imprescindible contactar con el autor antes de cualquier uso productivo.
- Documentacion minima: sin informacion sobre resolucion de entrada, preprocesado ni clases de salida, la integracion exige inspeccionar el modelo cargado en Keras.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, lo que reduce la probabilidad de validacion por terceros.
- Fecha de creacion registrada en 2026-11-26: conviene verificar la coherencia temporal de los metadatos antes de citar el modelo.

## Enlaces

- Hugging Face: https://huggingface.co/Sakni-Tasnim/agrovision-models
- No se han encontrado en la informacion proporcionada otros enlaces (papers, blogs, repositorios o demos) asociados al modelo.
