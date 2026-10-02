# pakiino/sketch2stl-revolve-or-mirror

## Resumen

sketch2stl-revolve-or-mirror es un clasificador de imágenes desarrollado por el usuario pakiino, consistente en un ResNet-18 de torchvision afinado para una tarea muy concreta dentro de la aplicación sketch2stl. El modelo recibe como entrada un render de 3x128x128 píxeles de la mitad de un contorno dibujado a mano y decide si esa mitad debería **revolucionarse** (revolve) alrededor de la línea central o **reflejarse y extruirse** (mirror-extrude), devolviendo además una confianza calibrada. No es un modelo generativo ni un LLM: es un clasificador binario de imágenes especializado en geometría CAD.

La relevancia del modelo reside en su función como componente auxiliar en un flujo de modelado 3D asistido. En el modo *media pieza + línea central* de sketch2stl, la persona siempre mantiene la decisión final; cuando el modelo no está seguro, la aplicación muestra ambas previsualizaciones en 3D. Se trata de un caso de *human-in-the-loop* aplicado a CAD, con un modelo pequeño y desplegable en formato ONNX.

El modelo se entrenó durante 8 épocas a partir de pesos ImageNet, con todas las capas ajustadas, muestreo balanceado por clase, AdamW con one-cycle y escalado de temperatura (T = 1,215) ajustado sobre el conjunto de validación. El repositorio no contiene el modelo base completo con pesos en safetensors, sino únicamente el grafo ONNX y utilidades de preprocesado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 de torchvision (red neuronal convolucional residual), todas las capas ajustadas |
| Parametros totales | no disponible en la informacion proporcionada (arquitectura ResNet-18 estandar) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificacion de imagenes; entrada 3x128x128 píxeles) |
| Tipos de cuantizacion | no disponible (distribucion en formato ONNX) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | fusion-360-gallery-dataset-license (other); uso no comercial, solo investigacion |
| Formato de pesos | ONNX (revolve_or_mirror.onnx) |

## Arquitectura y entrenamiento

La arquitectura es un ResNet-18 de torchvision inicializado con pesos de ImageNet. El ajuste fino (fine-tuning) se aplicó sobre la totalidad de las capas, durante 8 épocas, con el optimizador AdamW y un scheduler de tipo one-cycle, muestreo balanceado por clase y escalado de temperatura (T = 1,215) ajustado sobre el split de validación para calibrar las probabilidades de salida. La salida es un vector de dos clases: [mirror, revolve].

Los datos de entrenamiento proceden del dataset pakiino/sketch2stl-datasets, derivado a su vez del Fusion 360 Gallery Dataset de Autodesk. Las muestras de la clase *revolve* provienen de diseños de Fusion 360 que son sólidos de revolución, con la mitad tomada como sección transversal exacta de la malla (verificada mediante el teorema de Pappus, dentro del 5 % del volumen de la malla), más piezas torneadas generadas proceduralmente. Las muestras de la clase *mirror* son perfiles de extrusión simétricos respecto al espejo (IoU mayor o igual a 0,995) cortados a lo largo del eje. Las mitades ambiguas (por ejemplo, un rectángulo contra el eje) se excluyeron tanto del entrenamiento como de la evaluación, y la partición se hizo por proyecto CAD. A cada imagen se le añadió una perturbación que simula el pulso de la mano (hand-wobble).

## Capacidades

- Clasificacion binaria de imagenes: distingue entre contornos que deben revolucionarse y contornos que deben reflejarse y extruirse.
- Estimacion de confianza calibrada mediante escalado de temperatura, útil para activar el flujo de doble previsualizacion cuando el modelo duda.
- Preprocesado propio incluido en el repositorio (ml2_halves.py): renderizado de la mitad, normalizacion con media y desviacion tipica definidas en meta.json.
- Inferencia ligera mediante ONNX Runtime, apta para ejecutarse en CPU o en GPU de gama baja.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, agentes ni capacidades multilingues.

## Casos de uso

- Asistente de modelado CAD en el navegador: el modelo recibe el render de la mitad dibujada y sugiere si conviene aplicar revolve o mirror-extrude, reduciendo la friccion en la fase de creacion de bocetos.
- Doble previsualizacion guiada por confianza: cuando la probabilidad de salida no es concluyente, la aplicacion muestra ambos resultados 3D y delega la decision en la persona, aprovechando la calibracion de temperatura.
- Automatizacion de reconstruccion 3D a partir de bocetos 2D: integrado como etapa de decision geometrica en una cadena que transforma un trazado en un solido, eligiendo el operador adecuado antes de generar la malla.
- Etiquetado y curado de repositorios de bocetos CAD: clasificacion por lotes de mitades de contornos para organizar o filtrar datasets en funcion de la operacion geometrica implicada.
- Herramienta educativa de modelado: sirve para ilustrar cuando un perfil es un solido de revolucion y cuando es una extrusion simetrica, mostrando ambas interpretaciones al estudiante.
- Componente embebido en aplicaciones de escritorio o web con recursos limitados: al distribuirse como ONNX de ResNet-18 y operar sobre entradas de 128x128, puede integrarse sin necesidad de acelerador dedicado.
- Validacion en pipelines de ingenieria inversa: antes de reconstruir una pieza, clasificar la intencion geometrica del boceto para orientar el proceso de generacion de geometria.

## Benchmarks y rendimiento

Resultados sobre el split de test reservado (extraidos de la model card):

| arm | accuracy | macro_f1 | revolve_recall | mirror_recall |
|---|---|---|---|---|
| majority | 0,5517 | 0,3556 | 1 | 0 |
| rule (suggest_kind) | 0,55 | 0,3617 | 0,9906 | 0,0077 |
| ResNet-18 (fine-tuned) | 0,9655 | 0,9651 | 0,975 | 0,9538 |

Desglose por grupo:

| group | n | rule | model |
|---|---|---|---|
| mirror (cad) | 260 | 0,008 | 0,954 |
| revolve (cad, single step) | 62 | 0,984 | 1 |
| revolve (cad, stepped) | 58 | 0,966 | 0,879 |
| revolve (procedural) | 200 | 1 | 0,995 |

## Requisitos de hardware

- VRAM estimada para inferencia: minima; un ResNet-18 sobre entradas de 3x128x128 ocupa muy pocos cientos de MB en memoria, y puede ejecutarse en CPU.
- GPU recomendadas: cualquier GPU con soporte de ONNX Runtime (CUDA), incluidas GTX 1050 o superiores; no requiere A100 ni H100.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU de consumo e incluso en CPU de portatil o dispositivos tipo Raspberry Pi.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), integracion directa en aplicaciones Python mediante el modulo ml2_halves.py incluido en el repositorio.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; al tratarse de un ResNet-18 con imagenes de 128x128, la latencia por inferencia es del orden de milisegundos en hardware moderno.

## Comparativa con modelos similares

No se dispone de modelos publicos comparables de la misma categoria (clasificadores de operacion geometrica a partir de bocetos CAD). La comparacion relevante es con las lineas base evaluadas en la propia model card:

| Alternativa | Tipo | Accuracy | macro_f1 | Notas |
|---|---|---|---|---|
| majority | linea base trivial | 0,5517 | 0,3556 | Predice siempre revolve |
| rule (suggest_kind) | regla heuristica | 0,55 | 0,3617 | Casi nunca detecta mirror (recall 0,0077) |
| ResNet-18 (fine-tuned) | este modelo | 0,9655 | 0,9651 | Detecta correctamente ambas clases |

No se han identificado en la busqueda web herramientas publicas equivalentes (MeshGPT, Makerful o los asistentes de Meshy abordan la generacion 3D desde bocetos o texto, pero no son modelos comparables a nivel de arquitectura ni de tarea).

## Limitaciones y advertencias

- Los ejemplos de revolve procedentes de CAD son todos escalones rectos (construidos a partir de extrusions); las piezas torneadas con curvas provienen de un generador procedural, no de disenos reales.
- No se recogieron mitades dibujadas a mano reales, por lo que el rendimiento sobre dibujos humanos autenticos no esta medido; solo se ha simulado el pulso de la mano sobre imagenes renderizadas.
- Sesgos conocidos: el rendimiento es mas bajo en revolve con multiples escalones (0,879) que en otras categorias, lo que puede provocar errores en piezas complejas.
- Riesgo de clasificacion erronea en mitades ambiguas o poco representativas; el diseno de la aplicacion mitiga esto mostrando ambas previsualizaciones y dejando la decision a la persona.
- Limitacion de idioma: no aplica, ya que no procesa texto.
- Restricciones de licencia: derivado del Fusion 360 Gallery Dataset (Autodesk); el uso esta restringido a investigacion no comercial. No puede emplearse en productos comerciales sin revisar los terminos de la licencia original.
- El repositorio figura con 0 descargas y 0 me gusta, creado el 2026-10-01; se trata de un modelo muy reciente y sin validacion externa por parte de la comunidad.
- Caveat de produccion: solo se distribuye el grafo ONNX, no los pesos en safetensors ni el pipeline de entrenamiento completo, lo que limita la reproducibilidad y el reajuste posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pakiino/sketch2stl-revolve-or-mirror
- Dataset de entrenamiento: https://huggingface.co/datasets/pakiino/sketch2stl-datasets
- Arbol de ficheros del dataset: https://huggingface.co/datasets/pakiino/sketch2stl-datasets/tree/main
- Fusion 360 Gallery Dataset (licencia y origen de los datos): https://github.com/AutodeskAILab/Fusion360GalleryDataset
- Articulo de contexto sobre conversion de bocetos 2D a 3D (Meshy): https://www.meshy.ai/blog/sketch-to-3d
- Paper asociado: no disponible.
