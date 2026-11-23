# joshuandwilliams/AutoCDAScorer_Models

## Resumen

AutoCDAScorer_Models es una coleccion de clasificadores de imagenes entrenados para puntuar areas de muerte celular (cell death areas, CDA) en fotografias de agroinfiltracion bajo luz ultravioleta de hojas de *Nicotiana benthamiana*. Lo desarrolla joshuandwilliams como parte del proyecto de codigo abierto AutoCDAScorer, orientado a automatizar una tarea de fenotipado vegetal que tradicionalmente se realiza a ojo por varios evaluadores humanos. El modelo no es un LLM: es un conjunto de clasificadores de vision que reciben un recorte de 64 x 64 x 3 pixeles de una unica CDA y devuelven probabilidades softmax para las severidades de muerte celular 0 a 6.

El repositorio agrupa siete familias de modelos generadas mediante busqueda aleatoria de hiperparametros: CNN base, CNN sobre recorte medoide, Vision Transformer (ViT) sobre recorte medoide, CNN con etiquetas suaves, GAN condicional (cGAN), CNN con aumento geometrico y CNN con aumento mediante cGAN. De cada busqueda se conservan los 100 mejores modelos, salvo en el caso de la cGAN, donde se guardan los 64 generadores. El tamano del repositorio es de 1,8 GB y los pesos estan en formato Keras 3.15.0.

Su relevancia es acotada pero clara: ofrece un pipeline reproducible y ligero para cuantificar dano celular en experimentos de agroinfiltracion, sustituyendo la puntuacion manual por un clasificador entrenado sobre las puntuaciones de tres evaluadores. La licencia MIT y la disponibilidad publica facilitan su reutilizacion en laboratorios de fitopatologia y biologia vegetal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN y Vision Transformer (ViT) para clasificacion; generadores cGAN para aumento de datos |
| Parametros totales | no disponible (no se publica el numero de parametros por modelo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de 64 x 64 x 3 pixeles |
| Tipos de cuantizacion | no disponible (pesos Keras en coma flotante, sin variantes cuantizadas publicadas) |
| Idiomas soportados | no aplica (modelo de vision, sin entrada de texto) |
| Licencia | MIT |
| Formato de pesos | `.keras` (Keras 3.15.0) |
| Salida | probabilidades softmax sobre 7 clases (severidad 0 a 6) |
| Tamano del repositorio | 1,8 GB |
| Version minima de Keras | 3.15.0 |

## Arquitectura y entrenamiento

El repositorio contiene varias familias de clasificadores. Las familias `01`, `03`, `05`, `07` y `08` son redes convolucionales (CNN); la familia `04` emplea Vision Transformers. Todas comparten la misma tarea: clasificar un recorte de 64 x 64 x 3 de una CDA en una de siete severidades (0 a 6). La familia `03` entrena sobre recortes extraidos del bounding box medoide, mientras que `01` usa el bounding box de centro de solapamiento. La familia `05` sustituye la mediana de las puntuaciones de los tres evaluadores por la distribucion completa de sus puntuaciones (etiquetas suaves). Las familias `07` y `08` equilibran las clases rellenando cada una hasta el tamano de la mayor, mediante aumento geometrico en `07` y mediante imagenes sinteticas de una cGAN en `08`.

Cada busqueda aleatoria evaluo un gran numero de configuraciones: 8.640 para las familias CNN y 2.592 para la familia ViT, conservando solo los 100 mejores modelos por accuracy media de validacion cruzada. La familia `06` entrena generadores cGAN condicionados por la puntuacion one-hot; cada generador recibe un vector de ruido latente y una clase y produce una imagen de 64 x 64 x 3 en el rango [-1, 1]. El generador usado en la familia `08` es el de `array_task48`. No se detalla en la informacion disponible el volumen de imagenes de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de regularizacion especificas mas alla del aumento de datos.

Una advertencia metodologica relevante: las familias aumentadas (`07` y `08`) se validaron de forma cruzada solo sobre el split de entrenamiento, mientras que las no aumentadas (`01` a `05`) se validaron sobre los splits de entrenamiento y validacion combinados. Por tanto, las accuracy publicadas no son estrictamente comparables entre familias, ya que difieren tanto en el conjunto de imagenes reales como en el aumento aplicado.

## Capacidades

- Clasificacion de imagenes de fluorescencia UV de hojas de *Nicotiana benthamiana* en siete niveles de severidad de muerte celular (0 a 6).
- Puntuacion automatica de areas de muerte celular (CDA) a partir de recortes de 64 x 64 x 3 pixeles.
- Generacion de imagenes sinteticas de CDA condicionadas por clase mediante los generadores cGAN (ruido latente + etiqueta one-hot, salida 64 x 64 x 3 en [-1, 1]).
- Aumento de datos para entrenamiento de clasificadores en dominios con pocas muestras por clase.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural.
- No dispone de capacidades multilingues ni de modalidad de audio o video.

## Casos de uso

- Fenotipado de agroinfiltracion en laboratorio: el clasificador puntua automaticamente cada CDA detectada en las imagenes UV, sustituyendo la evaluacion visual de tres expertos y reduciendo la variabilidad entre evaluadores.
- Cribado de constructos geneticos: en experimentos que comparan decenas de construcciones en hojas de *N. benthamiana*, el modelo permite procesar lotes de imagenes y obtener una severidad media por constructo de forma reproducible.
- Reproducibilidad de experimentos: al fijar los pesos y la version de Keras, un laboratorio puede replicar exactamente la puntuacion de un experimento previo, algo imposible con puntuaciones humanas.
- Aumento de datos para nuevos clasificadores: los generadores cGAN permiten sintetizar imagenes de clases minoritarias y equilibrar datasets pequenos de fenotipado vegetal.
- Docencia y validacion metodologica: el repositorio sirve como ejemplo completo de busqueda aleatoria de hiperparametros, validacion cruzada y comparacion de arquitecturas (CNN frente a ViT) en un problema de vision aplicada.
- Integracion en pipelines de analisis de imagenes: los modelos `.keras` pueden cargarse con Keras 3.15.0 y encadenarse con el paquete R AutoCDAScorer para automatizar el flujo desde la imagen de hoja hasta la puntuacion final.
- Investigacion en vision cientifica: la comparacion entre etiquetas duras (mediana) y suaves (distribucion de los tres evaluadores) permite estudiar el efecto de la incertidumbre de etiquetado en tareas de clasificacion fina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que cada modelo se guarda en una carpeta cuyo nombre incluye su accuracy media de validacion cruzada (`results/<accuracy>_<model_id>/model.keras`), pero no se proporcionan los valores numericos ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; al tratarse de clasificadores sobre recortes de 64 x 64 x 3 y modelos CNN/ViT de busqueda aleatoria, es previsible que quepan en GPUs de gama baja, pero el repositorio no publica el numero de parametros ni el consumo medido.
- GPU recomendadas: no disponible; cualquier GPU con soporte CUDA y Keras 3.15.0 deberia poder ejecutar la inferencia, aunque no se especifican modelos concretos.
- GPU de consumo: probablemente compatible con tarjetas consumer (RTX 3060 o superiores) dado el reducido tamano de entrada, pero no confirmado por el autor.
- Opciones de despliegue: carga directa con Keras 3.15.0; el paquete R AutoCDAScorer actua como interfaz de alto nivel. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos de puntuacion de muerte celular ni con clasificadores de fenotipado vegetal equivalentes.

## Limitaciones y advertencias

- El modelo esta especializado exclusivamente en imagenes UV de agroinfiltracion en *Nicotiana benthamiana*; no es transferible a otras especies, modalidades de imagen o tareas sin reentrenamiento.
- Las accuracy de las familias aumentadas (`07`, `08`) y no aumentadas (`01` a `05`) no son directamente comparables por diferencias en el esquema de validacion cruzada, tal como advierte el autor.
- Los pesos solo son legibles con Keras 3.15.0; versiones anteriores no pueden cargarlos, lo que limita la portabilidad a entornos con versiones mas antiguas.
- No se documenta el volumen ni la composicion del dataset de entrenamiento, lo que dificulta evaluar el riesgo de sobreajuste o de sesgo hacia condiciones experimentales concretas.
- Riesgo de alucinacion en sentido estricto no aplica (no genera texto), pero si existe riesgo de clasificacion erronea en imagenes atipicas o fuera de distribucion.
- No se publican metricas de calibracion ni matrices de confusion, por lo que la fiabilidad por clase (especialmente en las severidades extremas 0 y 6) no puede evaluarse a partir de la informacion disponible.
- La licencia MIT permite uso comercial, pero la ausencia de garantias y de documentacion sobre el dataset subyacente exige validacion local antes de usar el modelo en decisiones experimentales criticas.
- El repositorio no incluye los 16 CNN del paquete R AutoCDAScorer, que se distribuyen por separado en `joshuandwilliams/AutoCDAScorer`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/joshuandwilliams/AutoCDAScorer_Models
- Repositorio GitHub del proyecto: https://github.com/joshuandwilliams/AutoCDAScorer_Models
- Paquete R AutoCDAScorer: https://github.com/joshuandwilliams/AutoCDAScorer
- Modelos del paquete R en Hugging Face: https://huggingface.co/joshuandwilliams/AutoCDAScorer
