# abia13/plant-disease-baseline-cnn

## Resumen

`abia13/plant-disease-baseline-cnn` es una red neuronal convolucional (CNN) pequena, de aproximadamente 0,4 millones de parametros, escrita desde cero en PyTorch para clasificar fotografias de hojas de plantas en una de 39 clases del dataset PlantVillage (cultivo y enfermedad, o estado sano). El modelo fue desarrollado por el equipo FiveGuys en el marco del proyecto de grupo 5CCSAGAP del King's College London, con fines exclusivamente educativos, y alimenta una aplicacion de demostracion publica.

La arquitectura es una CNN clasica de cuatro bloques convolucionales (32, 64, 128 y 256 canales) con convoluciones 3x3, normalizacion por lotes, ReLU y max pooling 2x2, seguida de global average pooling, dropout y una capa lineal que produce 39 puntuaciones. La entrada es una imagen RGB de 3 x 128 x 128 pixeles. No se emplearon pesos preentrenados: el entrenamiento parte de inicializacion aleatoria.

El modelo es relevante unicamente como referencia educativa y como linea base minima para tareas de clasificacion de imagenes en un dominio cerrado. No esta pensado para diagnostico agricola real, y su propia model card lo advierte explicitamente. Su interes practico es limitado: sirve para ilustrar el flujo completo de entrenamiento, evaluacion y despliegue de un clasificador de imagenes con un coste computacional minimo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN con cuatro bloques convolucionales (conv 3x3 + batch norm + ReLU + max pool 2x2), global average pooling, dropout y capa lineal |
| Parametros totales | Aproximadamente 0,4 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision) |
| Tipos de cuantizacion | No disponible (el autor no documenta cuantizaciones; el checkpoint se distribuye en fp32) |
| Idiomas soportados | No aplica (modelo de imagen) |
| Licencia | MIT |
| Formato de pesos | Checkpoint PyTorch (`best.pt`) con `state_dict`, `config` y `classes` |

## Arquitectura y entrenamiento

La red es una CNN de tipo VGG simplificada. Cada uno de los cuatro bloques aplica una convolucion 3x3, normalizacion por lotes, activacion ReLU y max pooling 2x2, con 32, 64, 128 y 256 canales respectivamente. Tras el ultimo bloque se aplica global average pooling, dropout con tasa 0,3 y una capa lineal final que devuelve 39 puntuaciones (una por clase). La entrada se redimensiona a 128 x 128 y se normaliza por canal con media 0,485, 0,456, 0,406 y desviacion estandar 0,229, 0,224, 0,225. Omitir esta normalizacion produce predicciones incorrectas.

El entrenamiento se realizo desde cero, sin pesos preentrenados, sobre el dataset PlantVillage (`DScomp380/plant_village`, licencia CC0-1.0), compuesto por 55.447 fotos de hojas de 256 x 256 pixeles en 39 clases. La particion fue 70% entrenamiento, 15% validacion y 15% test, estratificada por clase con semilla fija. Se uso perdida de entropia cruzada, optimizador AdamW con tasa de aprendizaje 0,001 y weight decay 0,0001, tamano de lote 64 y semilla 2. Se entreno hasta 20 epocas con parada temprana (paciencia 3) sobre la perdida de validacion, conservando el mejor checkpoint. La ejecucion subida se entreno sobre un subconjunto estratificado del 25% del split de entrenamiento, no sobre el conjunto completo. El entrenamiento en fp32 tardo aproximadamente 12,5 minutos en una Tesla T4. Como aumento de datos se aplico rotacion de hasta 15 grados y color jitter de 0,2 solo a las imagenes de entrenamiento.

## Capacidades

- Clasificacion de imagenes de hojas de plantas en 39 clases cerradas (cultivo y enfermedad, o sano), con salida de una puntuacion por clase.
- Devuelve las cinco clases mas probables con sus probabilidades tras aplicar softmax, tal como se usa en la aplicacion de demostracion.
- Entrada de imagen RGB de 128 x 128 pixeles; requiere normalizacion por canal con los valores indicados en la model card.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingues (es un modelo de vision, no de texto).
- No dispone de modo de razonamiento (thinking), vision adicional, audio ni otras modalidades.

## Casos de uso

- Demostracion educativa de un pipeline completo de vision por computador: el modelo sirve para ilustrar en clase el flujo de carga de datos, aumento, entrenamiento, evaluacion y despliegue de un clasificador de imagenes con un coste de entrenamiento de minutos en una GPU de consumo.
- Linea base de referencia en proyectos academicos: al tener 0,4 millones de parametros y entrenarse desde cero, permite comparar mejoras arquitectonicas o de aumento de datos contra un punto de partida reproducible y documentado.
- Prototipo de interfaz de clasificacion de hojas: la aplicacion de demostracion permite subir una foto y ver el top-5 de clases con probabilidades, util para validar la experiencia de usuario antes de invertir en un modelo mayor.
- Pruebas de integracion de PyTorch y Hugging Face Hub: el checkpoint incluye `state_dict`, `config` y `classes`, lo que facilita probar flujos de descarga, carga y preprocesado en entornos de desarrollo.
- Ejercicio de analisis de limitaciones: el modelo ejemplifica problemas clasicos como el sesgo de dominio (fotos de laboratorio frente a campo), el conjunto cerrado de clases y la falta de calibracion de probabilidades, utiles para formar criterio en evaluacion de modelos.
- Banco de pruebas de despliegue ligero: con aproximadamente 1,6 MB de pesos, es adecuado para experimentar con exportacion, cuantizacion o inferencia en CPU en entornos docentes, aunque el autor no documenta dichas conversiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que existen resultados por clase y una evaluacion sobre el split de test retenido del 15%, pero los valores numericos no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32, dado que el modelo tiene aproximadamente 0,4 millones de parametros y unos 1,6 MB de pesos.
- GPU recomendadas: cualquier GPU moderna es suficiente; el entrenamiento de referencia se realizo en una Tesla T4 en unos 12,5 minutos sobre el 25% del split de entrenamiento.
- Cabe en GPU de consumo: si, en cualquier GPU consumer actual e incluso en CPU para inferencia individual.
- Opciones de despliegue: PyTorch nativo mediante carga del `state_dict` con el codigo del repositorio del proyecto (`src/models/registry.py`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `abia13/plant-disease-baseline-cnn` | ~0,4 M | Imagen 128 x 128 | No disponible (sin cifras publicadas en la informacion) | MIT | Hugging Face |
| Modelos preentrenados tipo ResNet-50 ajustados a PlantVillage | ~25 M | Imagen 224 x 224 tipicamente | No disponible en la informacion | Varía segun el modelo base | Habitual en Hugging Face y torchvision |
| Modelos tipo MobileNet ajustados a PlantVillage | ~3-4 M | Imagen 224 x 224 tipicamente | No disponible en la informacion | Varía segun el modelo base | Habitual en Hugging Face y torchvision |

No se dispone de datos de rendimiento comparativos en la informacion proporcionada; la comparativa se limita a ordenes de magnitud de parametros y a la licencia, que en este caso es MIT y mas permisiva que la de muchos modelos preentrenados de referencia.

## Limitaciones y advertencias

- Solo fotos de laboratorio: PlantVillage contiene hojas individuales sobre fondo liso y condiciones controladas; se espera una precision mucho menor en fotos de campo reales.
- Conjunto cerrado de 39 clases: una hoja de otra especie o enfermedad se forzara a una de las clases conocidas, a menudo con alta confianza.
- Posibles puntuaciones de test optimistas: PlantVillage puede contener varias fotos de la misma hoja, por lo que una particion aleatoria puede puntuar mas alto de lo que corresponderia a hojas genuinamente nuevas.
- Clases desequilibradas: las clases no tienen el mismo tamano, por lo que la precision varia entre ellas.
- Probabilidades no calibradas: una probabilidad alta no garantiza una respuesta correcta.
- Uso fuera de alcance: no debe emplearse para diagnosticar cultivos reales ni para decidir tratamientos; el autor recomienda consultar a un agronomo.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el propio autor desaconseja cualquier uso mas alla de la demostracion educativa.
- Entrenado sobre un subconjunto del 25% del split de entrenamiento, lo que limita aun mas su rendimiento frente a un entrenamiento completo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abia13/plant-disease-baseline-cnn
- Dataset PlantVillage utilizado: https://huggingface.co/datasets/DScomp380/plant_village
- Paper de referencia sobre el dataset PlantVillage (arXiv:1511.08060): https://arxiv.org/abs/1511.08060
- Paper de referencia citado en los tags (arXiv:1910.09700): https://arxiv.org/abs/1910.09700
