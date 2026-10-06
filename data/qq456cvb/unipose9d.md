# qq456cvb/UniPose9D

## Resumen

UniPose9D es un modelo fundacional de estimacion de pose de objetos en 9 dimensiones. Dado un par RGB-D (o una imagen RGB con profundidad estimada) junto con una mascara de instancia, predice la rotacion, la traslacion y el tamano metrico del objeto. Lo relevante es que opera de forma category-agnostic: no necesita etiquetas de categoria, modelos CAD, priors de forma media ni vistas de referencia para el objeto concreto. Las tres componentes predichas (rotacion, traslacion y tamano) suman las nueve dimensiones que dan nombre al modelo.

El modelo lo firman Yang You, Yi Du, Cole Harrison y Leonidas Guibas, y se distribuye desde el repositorio de HuggingFace del usuario qq456cvb bajo licencia Apache 2.0. El repositorio ocupa 0,4 GB e incluye un checkpoint de PyTorch Lightning (`last.ckpt`) junto con su `config.yaml` de entrenamiento. No es un modelo de lenguaje: la entrada es visual y la salida es geometrica, por lo que conceptos habituales en fichas de LLM (contexto en tokens, cuantizacion GGUF, idiomas) no aplican directamente.

Su relevancia practica esta en robotica y percepcion 3D: permite estimar la pose de objetos nunca vistos sin construir un pipeline previo de modelado CAD. El pipeline de inferencia se apoya en dos modelos auxiliares que se descargan automaticamente: SAM2 (`facebook/sam2.1-hiera-large`) para generar las mascaras de instancia y MoGe (`Ruicheng/moge-2-vitl-normal`) para estimar profundidad e intrinsecos de camara cuando no se dispone de ellos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no especifica el backbone; se describe como modelo fundacional de estimacion de pose) |
| Parametros totales | no disponible (el repositorio completo ocupa 0,4 GB) |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no aplica (modelo visual, no procesa texto) |
| Tipos de cuantizacion | no disponible; se distribuye un unico checkpoint en formato PyTorch Lightning (`last.ckpt`) |
| Idiomas soportados | no aplica (la entrada es RGB-D e mascaras de instancia, no texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch Lightning checkpoint (`.ckpt`) mas `config.yaml`; no se publican safetensors, GGUF ni ONNX |
| Entrada | imagen RGB-D (o RGB con profundidad estimada) mas mascara de instancia |
| Salida | rotacion, traslacion y tamano metrico (pose 9D) |
| Tamano del repositorio | 0,4 GB |
| Fecha de creacion | 2026-10-06 (segun los metadatos del repositorio) |
| Descargas y likes | 0 descargas, 0 likes en el momento de la consulta |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo, el numero de parametros, el volumen de datos de entrenamiento ni su composicion. Tampoco se indica si hubo fases de ajuste fino con senales humanas o de refuerzo. Toda esa informacion debe considerarse no disponible a partir del material publicado en HuggingFace.

Lo que si se documenta es la innovacion funcional: un unico modelo category-agnostic capaz de predecir la pose completa (rotacion, traslacion y escala metrica) sin depender de CAD, priors de forma media ni vistas de referencia. Esto contrasta con pipelines clasicos de estimacion de pose 6D, que suelen requerir un modelo CAD del objeto o un renderizado de referencia para establecer correspondencias. La estimacion de profundidad y de intrinsecos recae en MoGe cuando no se aportan, y la segmentacion de instancia en SAM2, de forma que UniPose9D consume mascaras ya resueltas en lugar de generarlas. Se recomienda consultar el paper (arXiv:2607.09985) para los detalles de arquitectura y el regimen de entrenamiento, que no se reproducen en el repositorio.

## Capacidades

- Estimacion de pose 9D: rotacion, traslacion y tamano metrico por instancia.
- Funcionamiento category-agnostic: no requiere etiqueta de categoria, CAD, prior de forma media ni vistas de referencia.
- Entrada multimodal geometrica: acepta RGB-D completo o RGB con profundidad estimada por MoGe, y admite profundidad e intrinsecos aportados por el usuario.
- Consumo de mascaras de instancia externas: integrado por defecto con SAM2 (`facebook/sam2.1-hiera-large`), seleccionables mediante punto de prompt (`--sam2-point 540 430 1`).
- Estimacion de intrinsecos de camara: delegada en MoGe (`Ruicheng/moge-2-vitl-normal`) cuando no se proporcionan.
- Inferencia por linea de comandos: script `infer/unipose9d_inference.py` con opciones para RGB, profundidad propia e intrinsecos propios.
- No dispone de tool calling, funciones de agente, generacion de texto, razonamiento simbolico, codigo ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Manipulacion robotica de objetos desconocidos: el brazo captura una escena con su camara RGB-D, SAM2 segmenta el objeto y UniPose9D devuelve la pose metrica para planificar el agarre, sin necesidad de disponer de un CAD del objeto.
- Bin picking industrial: en una caja con piezas desordenadas, el modelo estima la pose 9D de cada instancia a partir de la mascara correspondiente, permitiendo seleccionar la pieza con mejor orientacion de agarre.
- Etiquetado automatico de datos para entrenamiento: genera poses pseudo-ground-truth sobre secuencias RGB-D para preanotar datasets de pose 6D o 9D, reduciendo el coste de anotacion manual.
- Realidad aumentada y sustitucion de objetos: con la pose metrica de un objeto real detectado en la escena, se puede anclar un objeto virtual con escala y orientacion coherentes.
- Inspeccion y metrologia en linea de produccion: comparar la pose y el tamano metrico estimados frente al nominal para detectar piezas mal orientadas o mal colocadas.
- Logistica y paletizado: estimar la pose de cajas y paquetes de geometria variable para calcular puntos de agarre y evitar colisiones en la trayectoria del robot.
- Investigacion en percepcion 3D: servir como linea base category-agnostic frente a metodos que requieren CAD o vistas de referencia, evaluando la generalizacion a categorias no vistas durante el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de HuggingFace no incluye tablas de resultados (LINEMOD, YCB-Video, BOP u otros), y los resultados de la busqueda web no aportaron datos tecnicos sobre el modelo.

## Requisitos de hardware

- VRAM para el checkpoint de UniPose9D: no disponible de forma oficial. El repositorio ocupa 0,4 GB, por lo que el peso del checkpoint es reducido, pero no se especifica la memoria necesaria en ejecucion.
- Coste dominante del pipeline: la inferencia completa depende de SAM2.1 Hiera Large y de MoGe-2 ViT-L, que son considerablemente mayores que el propio checkpoint de UniPose9D; conviene dimensionar la GPU teniendo en cuenta esos dos componentes, no solo UniPose9D.
- GPU recomendadas: no disponibles. No hay indicaciones del autor sobre GPUs objetivo.
- GPU de consumo: no confirmado. Dado el tamano reducido del checkpoint es plausible que quepa en GPUs de consumo, pero se trata de una inferencia no verificada con los datos disponibles.
- Opciones de despliegue: no aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje. El despliegue previsto es el script de PyTorch/PyTorch Lightning del repositorio de codigo, cargando `last.ckpt` desde la carpeta `checkpoints/`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos verificables de parametros, contexto, rendimiento ni licencia de alternativas de la misma categoria (por ejemplo, otros metodos de estimacion de pose 6D/9D category-agnostic), por lo que no se puede construir una comparativa fiable sin inventar cifras.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UniPose9D | no disponible | no aplica | no disponible | Apache 2.0 | HuggingFace (qq456cvb/UniPose9D) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados en el repositorio: no hay evidencia cuantitativa de rendimiento que permita validar el modelo frente a alternativas.
- Dependencia de modelos externos: la calidad de la mascara (SAM2) y de la profundidad e intrinsecos (MoGe) condiciona directamente la precision de la pose estimada. Errores de segmentacion o de escala en la profundidad se propagan a la salida.
- Dependencia de la calidad del sensor de profundidad: en modo RGB con profundidad estimada, la escala metrica del tamano predicho hereda el error del estimador monocular.
- Riesgo de alucinacion geometrica: como modelo de prediccion, puede producir poses plausibles pero incorrectas en objetos con simetrias, oclusiones severas, superficies reflectantes o transparentes, sin que exista una senal de incertidumbre documentada.
- Sesgos de dominio: la model card no describe la composicion del dataset de entrenamiento, por lo que se desconocen los sesgos hacia determinadas categorias, iluminaciones o tipos de escena.
- Limitaciones de idioma: no aplica, el modelo no procesa texto ni tiene capacidades multilingues.
- Formato de distribucion: se publica unicamente un checkpoint de PyTorch Lightning, no safetensors ni formatos optimizados para despliegue en produccion, lo que anade trabajo de conversion si se necesita otro runtime.
- Madurez: el repositorio registra 0 descargas y 0 likes, sin adopcion comunitaria documentada ni issues publicos de referencia.
- Licencia: Apache 2.0 permite uso comercial, pero al integrar SAM2 y MoGe conviene revisar las condiciones de licencia de esos componentes por separado antes de un despliegue en producto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qq456cvb/UniPose9D
- Paper (arXiv): https://arxiv.org/abs/2607.09985
- Pagina del paper en HuggingFace: https://huggingface.co/papers/2607.09985
- Repositorio de codigo: https://github.com/qq456cvb/UniPose9D
- Demo (Space): https://huggingface.co/spaces/qq456cvb/UniPose9D
- Pagina del proyecto: https://qq456cvb.github.io/projects/unipose9d
- SAM2 usado para las mascaras: https://huggingface.co/facebook/sam2.1-hiera-large
- MoGe usado para profundidad e intrinsecos: https://huggingface.co/Ruicheng/moge-2-vitl-normal

Nota sobre la busqueda web: los resultados recuperados no guardaban ninguna relacion con el modelo (correspondian a un sitio de contenido para adultos), por lo que se han descartado y no se incluyen como fuentes. No se han localizado articulos, blogs ni hilos tecnicos adicionales sobre UniPose9D en la informacion disponible.
