# canvit/probe-ade20k-40k-s512-c9-in21k

## Resumen

`canvit/probe-ade20k-40k-s512-c9-in21k` es una sonda (probe) lineal de segmentacion semantica ADE20K entrenada sobre las caracteristicas congeladas del canvas de 9 × 9 del modelo base `canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02`. No es un modelo autonomo: es una cabeza de decodificacion de 159.894 parametros (segun el fichero safetensors) que se acopla al encoder CanViT para producir logits por pixel a la resolucion de la rejilla del canvas, es decir, una salida de forma `[1, 150, 9, 9]` para las 150 clases de ADE20K.

CanViT (Canvas Vision Transformer) es un modelo fundacional de vision activa presentado en el paper NeurIPS 2026 "CanViT: Toward Active-Vision Foundation Models" (arXiv:2603.22570, autores Berreby, Du, Durand y Krishna). En lugar de procesar la imagen completa de una sola pasada, CanViT observa la escena mediante una secuencia de *glimpses* y va acumulando la informacion en un canvas de alcance global. Este repositorio concreto materializa el protocolo de evaluacion del paper: congelar el encoder y entrenar unicamente una sonda ligera para medir la calidad de las representaciones del canvas.

Su relevancia es metodologica mas que de producto. Con 40.000 pasos de entrenamiento, lote de 16 y una cabeza de complejidad minima, permite comparar de forma barata distintas configuraciones del canvas (9 × 9, 10 × 10, 12 × 12, 32 × 32) y distintas politicas de viewpoints, algo util para quien investiga en vision activa, representaciones congeladas o segmentacion eficiente. El repo es pequeno (0,0 GB), tiene licencia MIT, 13 descargas y ninguna valoracion en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sonda lineal sobre encoder CanViT (Canvas Vision Transformer, vision transformer con canvas recurrente). Cabeza: LayerNorm, dropout, BatchNorm, convolucion 1 × 1 |
| Parametros totales | 159.894 (solo la sonda, segun safetensors). El encoder base no se incluye en este repositorio: no disponible |
| Longitud de contexto | No aplica en el sentido de texto. El canvas de inferencia es de 9 × 9 = 81 posiciones espaciales; el numero maximo de glimpses soportado por el modelo base no se especifica: no disponible |
| Tipos de cuantizacion | No disponible (no se publican variantes cuantizadas; la sonda es de 159.894 parametros y se distribuye en safetensors en precision original) |
| Idiomas soportados | No aplicable: modelo puramente visual, sin procesamiento de lenguaje |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria `canvit-pytorch`) |

## Arquitectura y entrenamiento

La sonda se aplica sobre las caracteristicas del canvas de 9 × 9 producidas por el encoder congelado. Su composicion es minima: normalizacion de capa (LayerNorm), dropout con probabilidad 0,1, normalizacion por lotes (BatchNorm) y una convolucion 1 × 1 que proyecta a las 150 clases de ADE20K. El entrenamiento sigue el protocolo de probing del paper: politicas de viewpoint R-IID, 10 glimpses de 128 px sobre escenas de 512 px, 40.000 pasos con lote de 16, optimizador AdamW con tasa de aprendizaje maxima 0,0003 y weight decay 0,001, calentamiento lineal de 1.500 pasos seguido de decaimiento coseno, autocast en bfloat16 y aumento de datos consistente en recortes aleatorios de escala 0,5 a 2 y volteos horizontales.

La innovacion relevante no esta en la sonda, sino en el encoder que evalua: CanViT procesa la escena como una secuencia de vistas parciales (glimpses) y mantiene un estado de canvas que se actualiza iterativamente, lo que permite razonar sobre escenas mayores que el campo de vision de un unico parche y reutilizar la representacion acumulada. El repositorio incluye una revision etiquetada `canvit-pytorch-0.1` para quien use versiones antiguas de la libreria (`revision="canvit-pytorch-0.1"` en `from_pretrained`). No se documentan en la informacion disponible datos sobre el corpus de entrenamiento del encoder base, ni si hubo RLHF/DPO (no aplicable a un modelo de vision), ni el numero de tokens o imagenes vistas.

## Capacidades

- Segmentacion semantica de 150 clases de ADE20K sobre la rejilla del canvas de 9 × 9: la salida son logits `[1, 150, 9, 9]` que se convierten en etiquetas con `argmax(dim=1)`.
- Inferencia con estado recurrente: el modelo expone `init_state(batch_size, canvas_grid_size=9)` y una llamada `model(glimpse, state, viewpoint)` que devuelve logits y estado actualizado, lo que permite encadenar varios glimpses.
- Muestreo de vistas mediante el helper `sample_at_viewpoint` y la clase `Viewpoint`, con `Viewpoint.full_scene` para una vista unica de escena completa.
- Utilidades de preprocesado incluidas en la libreria (`preprocess(512)`) para normalizar imagenes RGB a tensores `[1, 3, 512, 512]`.
- Nombres de clase legibles para las 150 categorias ADE20K exportados como `CLASS_NAMES` desde `canvit_pytorch.benchmarks.ade20k`.
- No soporta generacion de texto, razonamiento, codigo, matematicas, tool calling, function calling, agentes multi-paso, audio ni vision-lenguaje. No tiene capacidades multilingues.

## Casos de uso

- Segmentacion semantica de escenas interiores y exteriores: se usa el encoder CanViT congelado junto con esta sonda para etiquetar cada una de las 81 posiciones del canvas en una de las 150 clases ADE20K, lo que sirve como mapa semantico de baja resolucion de la escena.
- Preetiquetado para anotacion humana: al generar mascaras iniciales sobre ADE20K o dominios similares, reduce el coste de etiquetado cuando la resolucion de 9 × 9 por escena es suficiente y despues se aplica upsampling bilineal con `predict`.
- Evaluacion comparativa de encoders de vision: la sonda actua como benchmarking barato (40.000 pasos, 159.894 parametros) para medir la calidad de representaciones congeladas entre distintas configuraciones del canvas y distintas politicas de viewpoints R-IID.
- Navegacion y comprension de escena en robotica embarcada: la naturaleza activa del encoder permite cubrir escenas mayores que el campo de vision de un glimpse de 128 px acumulando informacion en el canvas, algo alineado con plataformas moviles de computo limitado.
- Mapeado semantico de baja resolucion para agentes moviles: el canvas de 9 × 9 sobre escenas de 512 px es suficiente para mapas de ocupacion semantica donde no se requiere detalle por pixel.
- Investigacion en vision activa: comparar politicas de seleccion de vistas (por ejemplo R-IID frente a barridos deterministas) midiendo el efecto sobre la segmentacion resultante con el mismo protocolo de congelado.
- Analisis de escenas urbanas para asistencia a la conduccion: identificacion de clases presentes (via, edificio, vegetacion, vehiculo) a nivel de celda de canvas, con coste de decodificacion despreciable frente al encoder.
- Docencia y reproducion de resultados: al ser una sonda pequena con licencia MIT y codigo de referencia publico, sirve como ejemplo minimo de como acoplar una cabeza de segmentacion a un backbone de vision activa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card detalla el protocolo de entrenamiento (40.000 pasos, lote 16, AdamW con tasa 0,0003) y las condiciones de la sonda, pero no incluye valores de mIoU ni comparaciones numericas frente a otros metodos sobre ADE20K.

| Benchmark | Resultado | Notas |
|---|---|---|
| ADE20K (mIoU) | No disponible | La model card no publica la metrica |
| Comparacion con otras sondas de canvas | No disponible | Existen sondas hermanas (c10, c12, c32) pero no se aportan sus cifras |

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. La sonda en si ocupa 159.894 parametros (menos de 1 MB en float32); el consumo real lo determina el encoder CanViT-B/16, que no se incluye en este repositorio y cuyo tamano no se detalla.
- GPU recomendadas: no disponible. Por el perfil del encoder (ViT de tamano base y escenas de 512 px con 10 glimpses de 128 px), es esperable que quepa en GPU de consumo con holgura, pero no hay cifras publicadas que lo confirmen.
- GPU de consumo: la sonda sola se ejecuta en CPU. El conjunto encoder + sonda depende de la implementacion de `canvit-pytorch`, no documentada en terminos de VRAM en la informacion disponible.
- Opciones de despliegue: la via soportada es `canvit-pytorch >= 0.2` con `CanViTForSemanticSegmentation.from_pretrained_with_probe(...)`; para la libreria 0.1 hay que fijar `revision="canvit-pytorch-0.1"`. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, que son entornos de modelos de lenguaje.
- Latencia y throughput: no disponible. La model card no aporta mediciones; el coste dominante es la pasada del encoder sobre los 10 glimpses de 128 px, no la sonda.

## Comparativa con modelos similares

| Modelo | Canvas | Pasos de entrenamiento | Escena | Dataset | Licencia | Parametros de la sonda |
|---|---|---|---|---|---|---|
| probe-ade20k-40k-s512-c9-in21k (este) | 9 × 9 | 40.000 | 512 px, 10 glimpses de 128 px | scene_parse_150 (ADE20K, 150 clases) | MIT | 159.894 |
| canvit/probe-ade20k-40k-s512-c10-in21k | 10 × 10 | 40.000 | no disponible | ADE20K | MIT | no disponible |
| canvit/probe-ade20k-40k-s512-c12-in21k | 12 × 12 | 40.000 | no disponible | ADE20K | MIT | no disponible |
| canvit/probe-ade20k-40k-s512-c32-in21k | 32 × 32 | 40.000 | no disponible | ADE20K | MIT | no disponible |

Todas las sondas comparadas pertenecen a la misma coleccion (`canvit/canvit-ade20k-segmentation-probes-pytorch`), comparten licencia MIT y la tarea de 150 clases ADE20K, y se diferencian principalmente en la resolucion del canvas, que determina el nivel de detalle espacial de la salida. No se dispone de cifras de rendimiento que permitan ordenarlas por calidad, ni de comparaciones publicadas frente a cabezas de segmentacion alternativas (por ejemplo, decodificadores tipo Segmenter o ViT-Adapter sobre otros backbones).

## Limitaciones y advertencias

- No es un modelo autonomo: sin el encoder base `canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02` la sonda no procesa imagenes.
- Resolucion de salida muy gruesa: 9 × 9 = 81 posiciones por escena, con upsampling bilineal posterior; inadecuada para tareas que exijan bordes finos o instancias pequenas.
- Entrenada exclusivamente sobre features congeladas y sobre el dataset scene_parse_150; se espera degradacion fuera del dominio de escenas de ADE20K (interiores y exteriores comunes).
- Sesgos heredados del encoder base y del propio ADE20K: desequilibrio de clases y sobrerrepresentacion de determinadas categorias de escena.
- Riesgo de predicciones erroneas o poco calibradas: la model card no publica mIoU ni analisis de calibracion, por lo que no hay evidencia cuantitativa de su fiabilidad en produccion.
- Sin metricas publicadas de robustez ante cambios de iluminacion, oclusion, dominios sinteticos o imagenes fuera de distribucion.
- Limitaciones de idioma: no aplica ni se documenta, ya que el modelo no procesa texto.
- Licencia MIT para este repositorio, lo que permite uso comercial de la sonda; conviene verificar por separado la licencia y condiciones del modelo base, no detalladas en la informacion disponible.
- Adopcion muy baja (13 descargas, 0 valoraciones, 0 "likes"), sin validacion independiente conocida.
- Requiere `canvit-pytorch >= 0.2`; con versiones anteriores hay que fijar la revision `canvit-pytorch-0.1`, lo que puede romper ejemplos copiados de la model card.
- El identificador de arXiv (2603.22570) y las fechas del repositorio corresponden a una publicacion de 2026; conviene comprobar la disponibilidad efectiva del paper y del codigo antes de basar trabajo en ellos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/canvit/probe-ade20k-40k-s512-c9-in21k
- Modelo base: https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02
- Coleccion de sondas ADE20K: https://huggingface.co/collections/canvit/canvit-ade20k-segmentation-probes-pytorch
- Sonda hermana, canvas 10 × 10: https://huggingface.co/canvit/probe-ade20k-40k-s512-c10-in21k
- Sonda hermana, canvas 32 × 32: https://huggingface.co/canvit/probe-ade20k-40k-s512-c32-in21k
- Paper (NeurIPS 2026): https://arxiv.org/abs/2603.22570
- Repositorio de codigo: https://github.com/m2b3/CanViT
- Implementacion de referencia en PyTorch: https://github.com/m2b3/CanViT-PyTorch
- Pagina del proyecto: https://m2b3.github.io/CanViT/
- Organizacion con todos los checkpoints: https://huggingface.co/canvit
