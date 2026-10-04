# mundoamundo/slither-worm-segmentation-200-20261004

## Resumen

Slither worm segmentation - 200 es un modelo de segmentacion semantica binaria derivado mediante ajuste fino de `nvidia/segformer-b2-finetuned-ade-512-512`. Lo publica el usuario `mundoamundo` en HuggingFace y su objetivo es generar mascaras binarias, sin prompt, de todas las lombrices visibles en capturas de gameplay del juego Slither.io. La comida, el fondo y la interfaz de usuario se consideran fondo. Se trata de segmentacion semantica, no de segmentacion de instancias: el modelo no separa lombrices individuales, solo marca la clase "lombriz" frente a "no lombriz".

El modelo se entrena sobre un conjunto de anotaciones en estado de borrador (`needs_review`), con un reparto de 140 imagenes de entrenamiento, 30 de validacion y 30 de prueba, dividido por video de origen y por grupo conservador de duplicados perceptuales. La ejecucion seleccionada es `segformer_b2-lr0.00001-s17`, en la epoca 98, con umbral de decision 0,40, elegida unicamente con el conjunto de validacion entre ocho ejecuciones de ajuste fino. En el conjunto de prueba sin tocar reporta IoU 0,5919, Dice 0,7436, precision 0,6954 y recall 0,7990.

Es relevante ahora como ejemplo de modelo de vision de nicho con trazabilidad completa: el repositorio incluye arquitectura, funcion de perdida, aumento de datos, particiones, fuentes de preentrenamiento fijadas, registros de todas las ejecuciones y predicciones visuales retenidas. Su utilidad practica esta limitada por dos factores explicitos en la propia model card: las etiquetas de origen son borradores con posibles contornos desplazados o demasiado anchos, y la licencia es de uso exclusivo para investigacion y evaluacion no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SegFormer (encoder jerarquico tipo Mix Transformer con atencion eficiente y decoder MLP ligero); ajuste fino de nvidia/segformer-b2-finetuned-ade-512-512 |
| Parametros totales | no disponible en la informacion proporcionada (arquitectura base SegFormer-B2; el repositorio ocupa 0,8 GB e incluye pesos de inferencia y estados de entrenamiento) |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no aplica (modelo de segmentacion de imagen, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) segun los tags del repositorio; el modelo es de vision y no procesa lenguaje natural |
| Licencia | nvidia-segformer-research-only (`license: other`); uso restringido a investigacion y evaluacion no comercial |
| Formato de pesos | PyTorch: `model.pt` (export de inferencia), `training/best.pt` y `training/latest.pt` (pesos, optimizador y estado RNG de la ejecucion ganadora) |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/segformer-b2-finetuned-ade-512-512`, un SegFormer-B2 ya ajustado sobre ADE20K. SegFormer combina un encoder transformer jerarquico sin codificacion posicional con un decoder basado exclusivamente en capas MLP, lo que reduce el coste de computo frente a arquitecturas de segmentacion con decoders pesados. El ajuste fino se realiza para una tarea de segmentacion semantica binaria con logits de primer plano de salida.

Los datos de entrenamiento son imagenes de 640x360, rellenadas internamente hasta un multiplo de 32 antes de entrar en la red. La entrada es RGB en coma flotante con forma [B,3,H,W] y valores en [0,1]; la salida son logits de primer plano con forma [B,H,W]. El script auxiliar escribe mascaras PNG umbralizadas con valores 0/255. El reparto del dataset es de 140 imagenes de entrenamiento, 30 de validacion y 30 de prueba, agrupado por video de origen y por duplicados perceptuales para evitar filtracion. Se evaluaron ocho configuraciones de ajuste fino; la ganadora usa una tasa de aprendizaje de 0.00001, la semilla 17, la epoca 98 y un umbral de 0,40. No se realizo ajuste guiado por el conjunto de prueba.

El repositorio conserva la funcion de perdida, las estrategias de aumento de datos, las particiones, las fuentes de preentrenamiento fijadas, los registros de cada ejecucion y las predicciones visuales retenidas. Incluye tambien un snapshot del dataset en `data/labels-and-frames.tar.gz` y un manifiesto con fuentes y hashes de anotacion. Se mencionan experimentos adicionales con DINOv3 sujetos a los materiales y la licencia de Meta.

## Capacidades

- Segmentacion semantica binaria de imagenes: genera una mascara de primer plano para todas las lombrices visibles, sin necesidad de prompt ni de texto de entrada.
- Distincion de primer plano frente a fondo: comida, fondo del escenario y elementos de interfaz se clasifican como fondo.
- Salida de logits por pixel que permite fijar umbrales distintos de 0,40 segun el equilibrio precision/recall deseado.
- Exportacion de mascaras binarias en PNG a 0/255 mediante el script `worm_segmentation.predict`.
- Reproducibilidad de entrenamiento: pesos del optimizador, estado RNG y registros por ejecucion incluidos en el repositorio.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente perceptivo.
- No ofrece capacidades multilingues ni generacion de texto.
- No realiza segmentacion de instancias: no separa lombrices individuales ni asigna identificadores por objeto.
- No se documentan capacidades adicionales como deteccion de cajas, clasificacion o estimacion de profundidad.

## Casos de uso

- Preetiquetado asistido de gameplay: el modelo genera mascaras preliminares sobre capturas de Slither.io que despues se revisan y corrigen manualmente, reduciendo el coste de anotacion en pipelines de etiquetado de vision por computador.
- Investigacion en segmentacion de imagenes de videojuegos: sirve como linea base reproducible para estudiar rendimiento de arquitecturas SegFormer en dominios con objetos finos, brillos y escenas densas.
- Construccion de datasets para aprendizaje por refuerzo: las mascaras de lombrices permiten derivar senales de posicion y area ocupada que alimentan agentes que juegan al titulo.
- Postproduccion y edicion de video: la mascara binaria habilita aplicar desenfoque, sustitucion de fondo o resaltado selectivo sobre las lombrices en clips grabados.
- Analisis cuantitativo de partidas: medir el area de pantalla cubierta por lombrices y su evolucion temporal para estudiar aglomeraciones o momentos de alta densidad.
- Ajuste fino en dominios visuales similares: reutilizar los pesos como punto de partida para segmentar objetos alargados en juegos 2D con vista cenital.
- Reproduccion academica: el repositorio incluye registros, particiones y predicciones retenidas, lo que permite auditar o replicar los resultados del ajuste fino.
- Filtrado de contenido en herramientas comunitarias: deteccion de la region ocupada por lombrices para recortar o priorizar fotogramas en catalogos de clips, siempre bajo licencia de investigacion.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el conjunto de prueba (30 imagenes, sin ajuste guiado por prueba):

| Metrica | Valor |
|---|---|
| IoU | 0,5919 |
| Dice | 0,7436 |
| Precision | 0,6954 |
| Recall | 0,7990 |

No se han publicado en la informacion disponible comparaciones con otros modelos de segmentacion sobre esta tarea concreta (segmentacion binaria de lombrices en Slither.io). Los valores corresponden a acuerdos con anotaciones en borrador marcadas como `needs_review`, por lo que no constituyen una medida de exactitud en produccion.

## Requisitos de hardware

- VRAM de inferencia: no disponible de forma explicita. Al derivar de SegFormer-B2, un modelo de segmentacion de tamano medio, es razonable esperar un consumo moderado en GPU, pero la model card no publica cifras de memoria.
- GPU recomendadas: no especificadas por el autor. Por el tipo de arquitectura, cualquier GPU con suficiente VRAM para una pasada de inferencia de un transformer jerarquico de tamano medio seria suficiente; no se aportan modelos concretos.
- GPU de consumo: no confirmado en la informacion disponible, aunque el tamano del modelo base apunta a que puede ejecutarse en GPU de consumo con VRAM suficiente. Requiere verificacion empirica.
- Opciones de despliegue: el repositorio proporciona un script propio (`python -m worm_segmentation.predict model.pt image.jpg mask.png`) y un fichero `worm_segmentation/requirements.txt`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso no aplican a un modelo de vision.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio completo ocupa 0,8 GB, incluyendo el snapshot del dataset y los estados de entrenamiento; el export de inferencia `model.pt` es una fraccion de ese total.

## Comparativa con modelos similares

No se han identificado en la informacion disponible modelos comparables de segmentacion binaria de lombrices en Slither.io. La unica referencia directa es el modelo base del que deriva:

| Modelo | Tarea | Arquitectura | Contexto de entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mundoamundo/slither-worm-segmentation-200-20261004 | Segmentacion semantica binaria (lombriz frente a fondo) en gameplay de Slither.io | SegFormer-B2 ajustado | Imagenes 640x360, relleno a multiplo de 32 | nvidia-segformer-research-only (investigacion no comercial) | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| nvidia/segformer-b2-finetuned-ade-512-512 | Segmentacion semantica de 150 clases sobre ADE20K | SegFormer-B2 | Imagenes 512x512 | Licencia de NVIDIA (no especificada en la informacion disponible) | HuggingFace (modelo base) |

No se dispone de datos de rendimiento comparables entre ambos modelos, ya que operan sobre tareas y conjuntos de datos distintos.

## Limitaciones y advertencias

- Las anotaciones de origen son borradores marcados como `needs_review`; algunos contornos estan desplazados o son demasiado anchos, lo que degrada la calidad de la mascara respecto a una referencia revisada.
- El conjunto de prueba tiene solo 30 imagenes y podria conservar solapamiento entre creadores de contenido; los resultados no establecen exactitud en produccion.
- Los escenarios con lombrices pequenas, skins, brillos y escenas muy pobladas requieren mas etiquetas revisadas y no estan bien cubiertos.
- Riesgo de confusion entre primer plano y fondo en elementos visualmente similares (comida, efectos de brillo, interfaz), con posibles falsos positivos.
- El modelo no separa instancias: no permite contar lombrices ni obtener identificadores por objeto.
- Limitacion de idioma no aplica al ser un modelo de vision, pero la documentacion y los tags estan unicamente en ingles.
- Restriccion de licencia: los derivados de SegFormer/NVIDIA quedan limitados a investigacion y evaluacion no comercial por la licencia incluida; los experimentos con DINOv3 quedan sujetos a los materiales y la licencia de Meta.
- El repositorio no implica nuevos derechos sobre el material de gameplay de origen; el uso comercial del contenido subyacente requiere autorizacion independiente.
- Uso no apto para produccion sin una revision humana del etiquetado ni sin una validacion propia sobre el dominio objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mundoamundo/slither-worm-segmentation-200-20261004
- Modelo base: https://huggingface.co/nvidia/segformer-b2-finetuned-ade-512-512
- Licencia incluida en el repositorio: `LICENSE` (nvidia-segformer-research-only)
- Documentacion del script de inferencia: `worm_segmentation/README.md`
- Snapshot del dataset: `data/labels-and-frames.tar.gz`
- Manifiesto de fuentes y hashes de anotacion: incluido en el repositorio (ruta no especificada en la informacion disponible)
- Materiales y licencia de DINOv3 de Meta: referenciados en la model card, sin enlace directo en la informacion proporcionada
