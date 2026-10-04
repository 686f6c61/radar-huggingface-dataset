# hakanemre/ReLIQS

## Resumen

ReLIQS es un modelo de evaluacion de calidad de imagen sin referencia (no-reference image quality assessment, NR-IQA), es decir, predice la calidad percibida de una imagen sin necesidad de disponer de una version de referencia de la misma. Lo desarrollan Hakan Emre Gedik (The University of Texas at Austin), Shashank Gupta y Alan Bovik (University of Colorado Boulder), y se presenta en el paper "Learning Where to Look and How to Judge: Resolution-agnostic Image Quality Assessment with Quality-aware Saliency", aceptado en CVPR 2026.

Tecnicamente, el modelo combina parches multiescala, caracteristicas extraidas de CLIP y un mecanismo aprendido de saliencia consciente de la calidad. Este ultimo permite que el modelo decida en que regiones de la imagen conviene fijarse para emitir su juicio de calidad, en lugar de tratar todos los pixeles por igual. La propuesta es ademas resolución-agnostica, de modo que la estimacion no depende de que la imagen de entrada tenga un tamano fijo predefinido.

El repositorio de HuggingFace aloja unicamente los pesos del modelo (5,1 GB), no el codigo de inferencia ni de entrenamiento, que se distribuyen aparte en GitHub. La salida es una puntuacion continua en el rango [0, 1] donde valores mas altos indican mejor calidad percibida. No se han publicado en la informacion disponible ni la licencia, ni los idiomas, ni resultados de benchmarks, ni el pipeline declarado en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; combina parches multiescala, caracteristicas CLIP y saliencia consciente de la calidad |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision, no linguistico) |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch (.pth) |
| Tarea | Evaluacion de calidad de imagen sin referencia (NR-IQA) |
| Entrada | Imagen individual (ruta a fichero) |
| Salida | Puntuacion escalar en [0, 1], mayor es mejor |
| Resolucion de entrada | Resolucion-agnostica segun el paper; valor concreto no disponible |
| Pesos utilizados en inferencia | Pesos EMA |
| Tamano del repositorio | 5,1 GB |
| Fecha de creacion en HuggingFace | 2026-10-03 |
| Ultima actualizacion en HuggingFace | 2026-10-03 |

## Arquitectura y entrenamiento

El modelo parte de una estrategia de analisis por parches multiescala y emplea caracteristicas de CLIP como base representacional. Sobre esa representacion se aprende un mapa de saliencia consciente de la calidad, que indica que zonas de la imagen resultan mas informativas para estimar la calidad. El paper enmarca el metodo como "resolution-agnostic", lo que sugiere que el diseno evita depender de una unica resolucion de entrada fija para producir la prediccion. En la inferencia se emplean los pesos EMA (media movil exponencial) del entrenamiento.

No se dispone de informacion sobre el numero de tokens o imagenes utilizadas en el entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de ajuste como RLHF o DPO (poco habituales en este tipo de modelos). Tampoco se detallan innovaciones adicionales como decodificacion especulativa o mecanismos de atencion lineal. La model card indica explicitamente que el repositorio aloja solo los pesos y que las instrucciones de instalacion, inferencia, visualizacion de saliencia y entrenamiento estan en el repositorio de GitHub.

## Capacidades

- Prediccion de calidad de imagen sin referencia: genera una puntuacion en [0, 1] a partir de una unica imagen, sin necesidad de una version original o distorsionada de comparacion.
- Funcionamiento resolución-agnostico: segun el paper, la estimacion no esta atada a una resolucion de entrada concreta.
- Analisis multiescala: evalua la imagen a varias escalas mediante parches, lo que permite capturar tanto defectos locales como degradaciones globales.
- Saliencia consciente de la calidad: produce mapas de saliencia que indican que regiones han influido en el juicio de calidad, y permite su visualizacion segun el repositorio de codigo.
- Uso de representaciones CLIP: aprovecha caracteristicas preentrenadas de CLIP como base para la evaluacion.
- No dispone de capacidades de generacion de texto, razonamiento linguistico, codigo, matematicas, tool calling, agentes ni procesamiento de audio segun la informacion disponible.
- No se documenta soporte multilingue ni procesamiento de lenguaje natural, al tratarse de un modelo de vision.

## Casos de uso

- Control de calidad en pipelines de procesamiento de imagen: integrado como etapa automatica que puntua cada imagen generada, comprimida o procesada y descarta aquellas por debajo de un umbral de calidad definido por el equipo.
- Evaluacion de resultados de modelos generativos de imagen: usar ReLIQS como metrica automatica para comparar checkpoints o configuraciones de muestreo, ordenando las salidas por calidad percibida sin necesidad de una imagen de referencia.
- Monitorizacion de calidad en plataformas de subida de contenido: puntuar automaticamente las imagenes subidas por usuarios para detectar subidas borrosas, sobreexpuestas o con artefactos de compresion, y priorizar la revision manual de los casos dudosos.
- Optimizacion de codecs y compresion: medir el impacto perceptual de distintos niveles de compresion sobre el mismo contenido, usando la puntuacion como funcion objetivo para ajustar parametros de calidad.
- Validacion de capturas en fotografia movil o industrial: verificar que las imagenes capturadas por un dispositivo cumplen unos minimos de calidad antes de almacenarlas o enviarlas a un proceso posterior.
- Investigacion en vision por computador: emplear el modelo como linea base o como comparador frente a otros metodos de NR-IQA, y utilizar los mapas de saliencia para analizar que regiones determinan el juicio del modelo.
- Curacion de datasets: filtrar grandes colecciones de imagenes descartando aquellas con baja calidad estimada antes de usarlas para entrenar otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de HuggingFace no incluye tablas de resultados comparativos, y el resumen de la busqueda web se limita a la referencia del paper en arXiv y a enlaces no relacionados con el modelo.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, el repositorio de pesos ocupa 5,1 GB, por lo que la inferencia en precision completa requiere previsiblemente mas de 6 GB de VRAM solo para los pesos, mas el coste adicional de activaciones y del extractor de caracteristicas CLIP. Esta cifra es una estimacion a partir del tamano del repositorio, no un dato confirmado por el autor.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; probablemente viable en tarjetas con 12 GB o mas de VRAM si se aplica cuantizacion o precision reducida, aunque no hay datos oficiales.
- Opciones de despliegue: la model card referencia un script propio de Python (`score_image.py`) sobre un checkpoint `.pth`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que ademas no son aplicables a un modelo de vision de este tipo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos comparativos de rendimiento ni de arquitectura frente a otros metodos de NR-IQA. La siguiente tabla recoge unicamente la disponibilidad y el tipo de enfoque, marcando como "no disponible" cualquier dato numerico no confirmado.

| Modelo | Categoria | Requiere referencia | Licencia | Datos comparativos |
|---|---|---|---|---|
| ReLIQS | NR-IQA con CLIP y saliencia | No | no disponible | no disponible |
| Alternativas habituales de NR-IQA (por ejemplo MUSIQ, MANIQA, CLIP-IQA, TOPIQ) | NR-IQA | No | no disponible | no disponible |

No se dispone de datos verificados en la informacion proporcionada para establecer una comparacion cuantitativa fiable con estos u otros modelos.

## Limitaciones y advertencias

- Calibracion de la puntuacion: la model card advierte explicitamente de que las puntuaciones no estan calibradas con la escala MOS original de ningun dataset. Por tanto, no son directamente comparables entre datasets ni interpretables como una nota absoluta de calidad.
- Rango de salida acotado: la salida siempre esta en [0, 1] con "mayor es mejor", lo que dificulta extrapolar el resultado a escalas de calidad subjetiva publicadas.
- Ausencia de benchmarks publicados en la informacion disponible: no es posible verificar el rendimiento frente a otros metodos ni conocer su comportamiento en dominios concretos.
- Licencia no disponible: al no especificarse la licencia del repositorio ni de los pesos, existe incertidumbre sobre el uso comercial. Se recomienda contactar con los autores antes de desplegarlo en produccion.
- Repositorio de pesos solamente: no incluye codigo de inferencia, por lo que es necesario instalar el repositorio de GitHub para poder utilizarlo.
- Riesgo de sesgo de dominio: al no documentarse la composicion del dataset de entrenamiento, se desconoce como se comporta ante tipos de distorsion, contenidos o dominios poco representados.
- Sin capacidades linguisticas ni multimodales de texto: no puede emplearse para tareas de generacion, razonamiento o agentes.
- Riesgo de predicciones poco fiables en imagenes muy alejadas de la distribucion de entrenamiento, algo habitual en modelos de calidad perceptual, aunque no se dispone de datos concretos que lo cuantifiquen.
- La fecha de creacion y actualizacion del repositorio (octubre de 2026) es posterior a la referencia del paper en arXiv (agosto de 2026), por lo que conviene verificar la version de los pesos frente a la version publicada del articulo.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/hakanemre/ReLIQS
- Codigo en GitHub: https://github.com/hakan-emre-gedik/ReLIQS
- Paper en arXiv: https://arxiv.org/abs/2608.01730
- PDF del paper en CVPR 2026: https://openaccess.thecvf.com/content/CVPR2026/papers/Gedik_Learning_Where_to_Look_and_How_to_Judge_Resolution-agnostic_Image_CVPR_2026_paper.pdf
