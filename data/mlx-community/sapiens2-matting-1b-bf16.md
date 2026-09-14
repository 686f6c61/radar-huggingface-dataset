# mlx-community/sapiens2-matting-1b-bf16

## Resumen

Sapiens2-matting-1b es la variante especializada en matting humano (extraccion de alfa y primer plano) de la familia Sapiens2 de Meta, presentada en ICLR 2026. El modelo toma una imagen y devuelve dos salidas densas: un canal alfa de resolucion (H, W) y una imagen de primer plano en RGB de dimensiones (H, W, 3), lo que permite separar a una persona del fondo con detalle fino, incluyendo bordes y zonas semitransparentes. Esta ficha describe la conversion a MLX publicada por mlx-community, no el checkpoint original en PyTorch.

La version aqui analizada, `mlx-community/sapiens2-matting-1b-bf16`, es una conversion a bfloat16 del checkpoint `facebook/sapiens2-matting-1b`, realizada con mlx-vlm 0.7.0 y orientada a ejecucion local sobre Apple Silicon mediante el framework MLX. Conserva los 1.539.334.340 parametros del modelo original (aproximadamente 1,54 mil millones) y reduce el peso del repositorio a 3,08 GB, la mitad del checkpoint original en float32.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de matting humano de escala 1B en un Mac con memoria unificada, sin GPU dedicada y sin depender de servicios en la nube. Es un modelo de vision puro, sin capacidades de generacion de texto, razonamiento ni tool calling, por lo que su evaluacion debe centrarse en la calidad del recorte y en el coste de inferencia, no en benchmarks de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de vision con cabezas densas de matting (salidas alfa y foreground). Las proyecciones q/k/v de cada bloque aparecen fusionadas en un unico tensor `wqkv`. Numero de capas, dimension oculta y tipo de parcheo: no disponible |
| Parametros totales | 1.539.334.340 (~1,54 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; no procesa secuencias de texto) |
| Tipos de cuantizacion | bf16 (unico formato publicado en este repositorio). Otras cuantizaciones: no disponible |
| Idiomas soportados | no aplica (modelo de imagen); no disponible |
| Licencia | sapiens2-license (licencia personalizada de Meta, distinta de las licencias estandar de HuggingFace) |
| Formato de pesos | safetensors en bfloat16, fichero `model.safetensors` de 3,08 GB |
| Modelo base | facebook/sapiens2-matting-1b |
| Tamano del repositorio | 3,1 GB |
| Pipeline declarado | image-segmentation |
| Tarea especifica | matting humano (alpha + foreground) |

## Arquitectura y entrenamiento

La informacion disponible describe una arquitectura transformer de vision organizada en bloques de atencion, en los que las proyecciones de query, key y value se han fusionado en un solo tensor `wqkv` por bloque para ajustarse a la implementacion Sapiens2 de mlx-vlm. El modelo es una red densa (no MoE) con 1,54 mil millones de parametros y dos cabezas de salida: una que produce el canal alfa y otra que produce la imagen de primer plano en RGB. No se detallan en la informacion proporcionada el numero de capas, la dimension del embedding, el tamano de parche, la resolucion de entrenamiento ni si se emplean mecanismos de atencion lineal o ventanas locales.

Tampoco se especifican los datos de entrenamiento: no hay informacion sobre el numero de imagenes o tokens de entrenamiento, la composicion del dataset, ni sobre el uso de tecnicas de alineacion como RLHF o DPO (poco habituales en tareas densas de vision). La model card indica que el checkpoint de referencia ejecuta la inferencia en precision mixta bf16, lo que motiva directamente esta conversion. La unica innovacion tecnica documentada por el autor de la conversion es el reempaquetado de pesos: paso de float32 a bfloat16 y fusion de q/k/v, manteniendo todos los parametros del modelo original.

## Capacidades

- Matting humano denso: genera una mascara alfa y una imagen de primer plano a partir de una imagen de entrada.
- Salidas densas a resolucion de entrada: los arrays devueltos por la API de mlx-vlm tienen las dimensiones de la imagen original en tareas densas, y coordenadas de pixel de la imagen fuente en la tarea de pose.
- Integracion con MLX: carga mediante `mlx_vlm.load` y ejecucion con el `Sapiens2Predictor` incluido en mlx-vlm.
- Ejecucion local en Apple Silicon: no requiere GPU dedicada ni servicios externos.
- Generacion de texto: no soportada.
- Razonamiento, matematicas y codigo: no soportados.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportados.
- Capacidades multilingues: no aplica.
- Vision general (VQA, captioning, OCR): no disponible; el pipeline declarado es segmentacion/matting, no comprension de imagen.

## Casos de uso

- Videollamadas y teletrabajo con sustitucion de fondo: el modelo genera un alfa por fotograma que permite recortar a la persona en tiempo real y componerla sobre un fondo virtual o desenfocado, con mejor tratamiento de bordes que una simple segmentacion binaria.
- Postproduccion audiovisual y rotoscopia asistida: en lugar de dibujar mascaras a mano fotograma a fotograma, el equipo de VFX puede usar la salida alfa como punto de partida y refinar solo los fotogramas problematicos, reduciendo horas de trabajo.
- Creacion de datasets de entrenamiento: la salida alfa y el primer plano permiten generar pares imagen-mascara etiquetados de forma automatica para entrenar modelos de segmentacion o de generacion condicionada.
- Procesos de e-commerce y catalogacion: recortar a modelos humanos de las fotos de producto para homogeneizar los fondos del catalogo, manteniendo el detalle del cabello y de prendas semitransparentes.
- Probador virtual y moda digital: separar a la persona del fondo para superponer prendas o aplicar cambios de escenario sin recapturar la fotografia.
- Filtros y efectos en aplicaciones moviles o de escritorio sobre Mac: al ejecutarse con MLX en memoria unificada, el modelo puede integrarse en una app nativa de macOS sin depender de un backend remoto.
- Animacion y creacion de contenido para redes: extraer al sujeto para componerlo sobre plantillas, graficos o chroma keys sinteticos.
- Investigacion en vision por computador: servir de baseline reproducible de matting humano de escala 1B en precision bf16 para comparaciones de eficiencia en hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta conversion no incluye metricas como SAD, MSE, gradient error, IoU ni comparaciones con otros modelos de matting, y la busqueda web realizada solo devuelve documentacion general del framework MLX, sin datos de evaluacion de Sapiens2.

## Requisitos de hardware

- VRAM / memoria unificada estimada: los pesos en bf16 ocupan 3,08 GB. A ello hay que sumar activaciones y buffers intermedios, cuyo consumo depende de la resolucion de entrada, que no se especifica en la informacion disponible. Como referencia orientativa (estimacion, no dato oficial), 8 GB de memoria unificada deberian ser suficientes para resoluciones moderadas y 16 GB o mas dan margen para imagenes de alta resolucion.
- GPU dedicadas (A100, H100, RTX 4090): no aplica directamente. Este repositorio esta empaquetado para MLX, que se ejecuta sobre Apple Silicon; no se documenta soporte CUDA.
- Equipos Apple: cualquier Mac con chip de la familia M (M1 o posterior) y memoria unificada suficiente. No se especifica el minimo oficial.
- Cabe en GPU de consumo: no aplica en el sentido habitual; el equivalente es que cabe en un Mac de gama media gracias a sus 3,08 GB de pesos.
- Opciones de despliegue: mlx-vlm 0.7.0 o superior sobre MLX (`pip install -U mlx-vlm`). No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni TensorRT-LLM, que ademas no estan orientados a este tipo de tarea densa de vision.
- Latencia y throughput: no disponible. No se publican tiempos de inferencia por imagen ni FPS en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato y tamano | Licencia | Disponibilidad |
|---|---|---|---|---|
| mlx-community/sapiens2-matting-1b-bf16 | 1,54 B | safetensors bf16, 3,08 GB | sapiens2-license | HuggingFace (0 descargas, 0 likes en el momento de la consulta) |
| facebook/sapiens2-matting-1b (base) | 1,54 B | safetensors fp32, aproximadamente el doble de tamano segun la model card | sapiens2-license | HuggingFace |
| Otros modelos de matting humano (MODNet, RobustVideoMatting, matting heads de SAM) | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas. La unica diferencia verificable entre las dos primeras filas es el formato y la precision de los pesos; esta version esta ademas reempaquetada para mlx-vlm (q/k/v fusionadas en `wqkv`), por lo que no es directamente intercambiable con cargadores de PyTorch.

## Limitaciones y advertencias

- Dominio restringido: es un modelo centrico en personas (human-centric); no se ha documentado su comportamiento en matting de objetos genericos, animales o escenas sin figuras humanas.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad en la informacion disponible, lo que obliga a validar con datos propios antes de usarlo en produccion.
- Riesgo de artefactos: en cabello fino, movimiento, desenfoque de movimiento o zonas semitransparentes (cristales, velos, humo) el alfa puede presentar halos o bordes duros; se trata de un comportamiento esperado en matting y no validado aqui por falta de metricas.
- Precisión bf16: la conversion reduce el peso a la mitad, pero no se documenta si introduce degradacion medible frente al checkpoint float32 original.
- Dependencia de plataforma: solo funciona con MLX sobre Apple Silicon; no sirve para despliegues en CUDA, CPU x86 o entornos cloud convencionales sin reconvertir los pesos.
- Requiere mlx-vlm 0.7.0 o superior; versiones anteriores no incluyen la implementacion de Sapiens2 y fallaran al cargar el modelo.
- Licencia: sapiens2-license es una licencia personalizada de Meta, no una licencia open source estandar. Es imprescindible revisar el texto completo antes de cualquier uso comercial, ya que puede incluir restricciones de uso, obligaciones de atribucion o limites de despliegue.
- Repositorio sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay informes independientes de fallos ni de reproducibilidad.
- Sin capacidades de texto: cualquier caso de uso que requiera dialogo, razonamiento o generacion de codigo queda fuera del alcance de este modelo.
- Resolucion y preprocesado: no se documentan en esta ficha los limites de resolucion de entrada ni el preprocesado exacto; la model card remite al README de Sapiens2 en mlx-vlm, que no forma parte de la informacion proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlx-community/sapiens2-matting-1b-bf16
- Modelo base (Meta): https://huggingface.co/facebook/sapiens2-matting-1b
- Licencia Sapiens2: https://github.com/facebookresearch/sapiens2/blob/main/LICENSE.md
- Repositorio de referencia Sapiens2: https://github.com/facebookresearch/sapiens2
- Framework MLX: https://mlx-framework.org/
- Repositorio de MLX en GitHub: https://github.com/ml-explore/mlx
- MLX en Apple Open Source: https://opensource.apple.com/projects/mlx/
- MLX Studio (interfaz grafica para modelos MLX): https://mlx.studio/
- Entrada de MLX en Wikipedia: https://en.wikipedia.org/wiki/MLX_(software)
