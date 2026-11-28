# sdmlai/plantdoc-predictor

## Resumen

`sdmlai/plantdoc-predictor` es un modelo publicado en Hugging Face por el usuario sdmlai bajo licencia MIT. La model card del autor esta practicamente vacia: unicamente declara la licencia, sin descripcion, sin datos de entrenamiento, sin especificaciones y sin ejemplos de uso. El repositorio ocupa 9,8 GB y los pesos se distribuyen en formato Keras y TFLite, lo que apunta a un modelo orientado a despliegue en movil o edge.

Por el nombre (`plantdoc-predictor`) y por el formato de serializacion, todo indica que se trata de un clasificador de imagenes de enfermedades de plantas, presumiblemente derivado o entrenado con el dataset PlantDoc, pero esta hipotesis no esta confirmada por el autor en ningun documento del repositorio. No hay informacion sobre arquitectura, numero de parametros, resolucion de entrada ni clases de salida.

La relevancia actual del modelo es limitada: con 8 descargas, 0 likes y ausencia total de documentacion, no es un artefacto validado por la comunidad. Se incluye en esta ficha por completitud del catalogo, pero cualquier evaluacion seria requiere inspeccionar los ficheros del repositorio y ejecutar el modelo directamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (pesos en Keras/TFLite; se desconoce la topologia concreta) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (existe al menos un artefacto TFLite, presumiblemente cuantizado, sin detalle) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Keras y TFLite (segun los tags del repositorio) |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura. Los tags del repositorio (`keras`, `tflite`) indican que el modelo se entrena o serializa con Keras y se exporta a TensorFlow Lite para inferencia en dispositivos. El tamano del repositorio (9,8 GB) es desproporcionado para un clasificador de imagenes tipico y sugiere que incluye checkpoints intermedios, pesos en precision completa o multiples variantes del modelo, pero no es posible determinarlo sin inspeccionar los ficheros.

Tampoco se documenta el dataset de entrenamiento, el numero de imagenes, el regimen de aumentacion de datos ni si hubo ajuste fino sobre un backbone preentrenado (por ejemplo, EfficientNet, MobileNet o ResNet). El nombre sugiere una relacion con PlantDoc, un dataset publico de imagenes de hojas con enfermedades, pero el autor no lo confirma ni cita la fuente de los datos.

## Capacidades

- Clasificacion de imagenes (inferida del nombre y del pipeline de vision implicito en los formatos Keras/TFLite); el numero y la naturaleza de las clases no estan documentados.
- Inferencia en dispositivos edge mediante el artefacto TFLite.
- No hay evidencia de soporte de tool calling, agentes, razonamiento multi-paso, generacion de texto, vision-lenguaje ni capacidades multilingues.
- No se documentan capacidades especiales (modo thinking, audio, deteccion de objetos, segmentacion).

## Casos de uso

- Diagnostico preliminar de enfermedades foliares en campo: si el modelo clasifica imagenes de hojas, podria integrarse en una aplicacion movil agricola que ayude a identificar patologias antes de consultar a un agronomo. La idoneidad depende de validar la lista de clases y la precision real, datos hoy inexistentes.
- Despliegue en dispositivos de bajo consumo: el artefacto TFLite permite ejecutar inferencia offline en moviles o Raspberry Pi, util en explotaciones agricolas sin conectividad.
- Prototipado rapido de pipelines de vision con Keras: el modelo puede servir como punto de partida para fine-tuning sobre un dataset propio de imagenes de cultivos.
- Filtrado previo en sistemas de monitorizacion de cultivos: combinado con camaras trampa o drones, podria preclasificar imagenes y reducir el volumen enviado a un modelo mayor en la nube.
- Docencia y experimentacion: util como ejemplo de exportacion Keras a TFLite en cursos de despliegue de modelos.
- Investigacion comparativa de clasificadores de enfermedades de plantas: solo si se documentan y verifican sus metricas, hoy ausentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende de la arquitectura, que no se documenta.
- GPU recomendadas: no disponible. Para el artefacto TFLite, la inferencia puede ejecutarse en CPU o en aceleradores moviles (GPU integrada, NPU, Edge TPU).
- Compatibilidad con GPU de consumo: probable para el artefacto TFLite dado su proposito edge, pero no confirmado; el repositorio de 9,8 GB no cabe comodamente en VRAM de consumo si se carga completo.
- Opciones de despliegue: TensorFlow/Keras para el artefacto nativo, TensorFlow Lite (incluido el interprete Python y los delegados GPU/NNAPI) para el artefacto movil. No hay indicios de soporte en vLLM, llama.cpp, Ollama ni TGI, que son frameworks de modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de clasificacion de enfermedades de plantas con documentacion suficiente para establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Ausencia total de model card: no hay informacion sobre datos de entrenamiento, clases, metricas ni limitaciones, lo que impide evaluar su fiabilidad.
- Riesgo alto de sesgos desconocidos: sin documentar la composicion del dataset, no puede descartarse un sesgo hacia especies, condiciones de iluminacion o regiones geograficas concretas.
- Riesgo de clasificaciones erroneas en produccion: un clasificador de enfermedades mal validado puede llevar a tratamientos fitosanitarios incorrectos, con impacto economico y ambiental.
- Tamano del repositorio (9,8 GB) desproporcionado: complica la descarga, el versionado y el despliegue; conviene inspeccionar los ficheros antes de usarlo.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias ni asume responsabilidad alguna sobre el rendimiento.
- Adopcion practicamente nula (8 descargas, 0 likes): no hay senales de validacion por parte de la comunidad.
- No hay informacion sobre idiomas ni sobre si el modelo acepta entradas de texto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sdmlai/plantdoc-predictor
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados al modelo.
