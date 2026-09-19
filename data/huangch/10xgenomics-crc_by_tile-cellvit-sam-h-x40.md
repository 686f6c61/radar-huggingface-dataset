# huangch/10xGenomics-CRC_BY_TILE-CellViT-SAM-H-x40

## Resumen

El repositorio `huangch/10xGenomics-CRC_BY_TILE-CellViT-SAM-H-x40` contiene un checkpoint de segmentacion celular en imagenes de patologia, publicado por el usuario huangch bajo licencia Apache 2.0. Por la nomenclatura del identificador, se trata de un modelo de la familia CellViT-SAM: un encoder de imagen SAM ViT-H (Segment Anything Model, variante *huge*) combinado con un decodificador tipo CellViT para segmentacion y clasificacion de nucleos celulares. El sufijo indica el dominio de datos: `10xGenomics-CRC` (cancer colorrectal, tejido de 10x Genomics), `BY_TILE` (procesamiento por teselas) y `x40` (aumento de 40x, propio de histopatologia de alta resolucion).

El problema que resuelve es la instancia-segmentacion de nucleos en tejido tumoral colorrectal teñido con hematoxilina-eosina, una tarea central en patologia computacional: permite contar celulas, medir morfologia nuclear, estimar densidad celular e infiltrado inmunitario y construir descriptores (features) para modelos predictivos downstream. Frente a arquitecturas especificas por tarea como HoVer-Net o Cellpose, los modelos basados en SAM aprovechan un encoder de proposito general preentrenado con mas de mil millones de mascaras, lo que suele traducirse en mejor generalizacion a dominios no vistos y en menos necesidad de anotaciones especificas.

La relevancia de este checkpoint concreto es limitada y debe matizarse: la model card no aporta documentacion alguna (unicamente la linea de licencia), no declara pipeline, idiomas ni metricas, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta. El peso del repositorio es de 2,7 GB, coherente con un checkpoint de precision completa de un encoder ViT-H. Por tanto, es un artefacto de investigacion sin validacion publica conocida, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CellViT-SAM (encoder SAM ViT-H + decodificador CellViT). Inferido del identificador del repositorio; la model card no lo confirma |
| Parametros totales | no disponible (el encoder SAM ViT-H tiene aproximadamente 636 M de parametros; el total del checkpoint no esta documentado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: modelo de vision, procesa imagenes por teselas (`BY_TILE`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision, no textual) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio ocupa 2,7 GB; compatible con pesos de precision completa de ViT-H) |
| Modalidad | imagen (histopatologia H&E) |
| Tarea | segmentacion de instancias y clasificacion de nucleos celulares |
| Dominio de entrenamiento | cancer colorrectal, datos 10x Genomics, aumento 40x |
| Resolucion de entrada | no disponible; SAM ViT-H opera a 1024 x 1024 y los flujos por teselas suelen usar recortes de 256 o 512 px |
| Autor | huangch |
| Fecha de creacion (metadatos HF) | 2026-09-19 |
| Fecha de ultima actualizacion (metadatos HF) | 2026-09-19 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La familia CellViT-SAM, descrita en la literatura de patologia computacional, combina dos componentes. Por un lado, un encoder de imagen SAM en su variante ViT-H, preentrenado de forma auto-supervisada sobre un corpus de mas de mil millones de mascaras y que actua como extractor de caracteristicas de proposito general. Por otro lado, un decodificador tipo CellViT que, sobre las caracteristicas del encoder, produce mapas de instancia de nucleos (normalmente mediante prediccion de mapas horizontales/verticales y un embedding de instancia resuelto con *watershed* o un mecanismo equivalente) junto con la clasificacion del tipo celular. Es una arquitectura de codificador-decoder con atencion (transformer) en el codificador, no un modelo de espacio de estados ni hibrido.

En cuanto al entrenamiento de este checkpoint concreto, la informacion disponible no permite afirmar nada: la model card esta vacia y no se documentan el numero de tokens, la composicion del dataset, la resolucion exacta de las teselas, el esquema de aumentos, el numero de epocas, la funcion de perdida, ni si hubo ajuste fino supervisado, RLHF o DPO (estos dos ultimos no aplican a un modelo de vision). El nombre sugiere un ajuste fino sobre un dataset de cancer colorrectal de 10x Genomics en formato de teselas a 40x, presumiblemente partiendo de los pesos generalistas de CellViT-SAM publicados por sus autores originales, pero esto es una inferencia del identificador y no un dato verificado.

## Capacidades

- Segmentacion de instancias de nucleos celulares en imagenes de tejido colorrectal teñido con H&E a 40x.
- Clasificacion de nucleos por tipo celular, siempre que el decodificador conserve las cabezas de clasificacion del modelo base y la taxonomia coincida con la del entrenamiento.
- Extraccion de caracteristicas (embeddings) del encoder ViT-H para tareas downstream: clasificacion de tejido, prediccion de biomarcadores, analisis de supervivencia.
- Procesamiento por teselas, lo que permite abordar imagenes de lamina completa (WSI) mediante ventanas deslizantes y posterior ensamblado de mascaras.
- Capacidad de segmentacion generica heredada de SAM: el encoder responde a *prompts* de punto o caja, aunque el uso previsto aqui es automatico.
- Aprendizaje por transferencia: al ser un ajuste fino de un modelo preentrenado a gran escala, es un punto de partida razonable para reajustar en otros tejidos o tinciones.
- Soporte de *tool calling*, agentes, modo *thinking*, audio o texto: no aplica, es un modelo de vision sin interfaz conversacional.
- Capacidades multilingues: no aplica.

## Casos de uso

- Segmentacion y recuento nuclear en estudios de cancer colorrectal: el modelo genera mascaras de instancia por tesela y permite calcular densidad celular, area nuclear y relacion nucleo-citoplasma en cohortes de laminas completas, una tarea que manualmente requeriria decenas de horas por caso.
- Construccion de pipelines de patomica: los embeddings del encoder ViT-H pueden agregarse por tesela o por region de interes y alimentar modelos predictivos de supervivencia, estadio o respuesta a tratamiento, evitando entrenar un extractor de caracteristicas desde cero.
- Anotacion asistida de datasets: las mascaras producidas pueden servir como preanotacion que un patologo corrige, reduciendo el coste de crear conjuntos de entrenamiento anotados a nivel de nucleo para modelos posteriores.
- Control de calidad de preparaciones: la deteccion de teselas con densidad nuclear anomala, artefactos de tincion o zonas sin tejido puede automatizarse comparando la salida del modelo con umbrales estadisticos, util en laboratorios que digitalizan cientos de laminas al dia.
- Cuantificacion del infiltrado inmunitario: si el decodificador conserva la clasificacion de tipos celulares, es posible estimar la proporcion de linfocitos frente a celulas tumorales por region, un descriptor de interes en inmuno-oncologia.
- Recuperacion de casos similares: indexar los embeddings por tesela y hacer busqueda por similitud coseno permite localizar casos o regiones morfologicamente parecidas dentro de un archivo de biobanco.
- Comparacion metodologica en investigacion: sirve como linea base frente a HoVer-Net, Cellpose o CellViT original al evaluar estrategias de segmentacion en tejido colorrectal a 40x, especialmente para estudiar el efecto del preentrenamiento con SAM.
- Reajuste en dominios proximos: al estar ya adaptado a un dominio histologico concreto, es un candidato para ajuste fino en otros tumores epiteliales o en tinciones distintas, con menos datos que si se partiese del modelo generalista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye ninguna metrica (ni Dice, ni AJI, ni F1 de deteccion, ni PQ), no se han encontrado evaluaciones independientes del checkpoint y la busqueda web asociada al autor no devuelve resultados tecnicos relacionados con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: del orden de 8 a 12 GB, incluyendo pesos y activaciones a 1024 x 1024 con lote pequeno. Estimacion basada en el tamano del encoder ViT-H y en el peso del repositorio (2,7 GB); no confirmada por el autor.
- VRAM estimada en fp16/bf16: del orden de 4 a 6 GB con lote 1. Reducible por debajo de 4 GB limitando la resolucion de entrada, a costa de perder precision en nucleos pequenos a 40x.
- GPU recomendadas: cualquier GPU con 12 GB o mas para investigacion (RTX 3060 12 GB, RTX 4070 Ti, RTX 4090). Para procesar laminas completas por teselas a escala, A100 40/80 GB o H100 permiten aumentar el lote y el paralelismo.
- Cabe en GPU de consumo: si, con reservas. Con 8 GB o menos es necesario usar fp16, resoluciones de tesela reducidas y lotes de 1; 12 GB es el minimo comodo; 24 GB (RTX 3090/4090) permite trabajar sin ajustes agresivos.
- Opciones de despliegue: al ser un modelo de vision de la familia CellViT-SAM, el despliegue tipico es mediante PyTorch o Lightning con el codigo de CellViT-SAM, o convertido a ONNX/TensorRT para inferencia por lotes. vLLM, llama.cpp, Ollama y TGI no aplican: estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. No hay datos publicados de tiempo por tesela ni de teselas por segundo para este checkpoint.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Dominio de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (CellViT-SAM-H x40, CRC) | CellViT-SAM, encoder ViT-H | no disponible | Cancer colorrectal, 10x Genomics, 40x | Apache 2.0 | HuggingFace, 0 descargas, sin model card |
| CellViT-SAM (generalista, autores originales) | CellViT-SAM, encoder ViT-H | no disponible | Multiples tejidos y dominios (PanNuke y otros) | no disponible | Publico (paper y repositorio) |
| CellViT (original) | Codificador ViT + decodificador de instancias | no disponible | Multiples tejidos (PanNuke) | no disponible | Publico (paper y repositorio) |
| HoVer-Net | CNN con ramas de mapa horizontal/vertical | no disponible | Multiples tejidos (PanNuke, CoNSeP) | no disponible | Publico (repositorio) |
| Cellpose (familia) | CNN / transformer para segmentacion generica | no disponible | Imagenes de celulas de multiples modalidades | no disponible | Publico (repositorio y modelo) |

No hay resultados de benchmarks publicados para este checkpoint, por lo que no es posible establecer una comparacion cuantitativa de rendimiento. La comparacion queda limitada a arquitectura, dominio y licencia.

## Limitaciones y advertencias

- Documentacion inexistente: la model card solo contiene la linea de licencia. No hay informacion sobre datos de entrenamiento, hiperparametros, taxonomia de clases celulares ni metricas, lo que impide reproducir o auditar el modelo.
- Ausencia total de validacion externa: 0 descargas y 0 likes, sin evaluaciones independientes ni resultados publicados. No debe asumirse ningun nivel de rendimiento.
- Riesgo de sobreajuste al dominio: al estar ajustado sobre un unico dataset (cancer colorrectal de 10x Genomics a 40x), el rendimiento previsiblemente cae en otros tejidos, otros aumentos (20x, 10x), otras tinciones (IHC, inmunofluorescencia) o escaneres con distinto perfil de color.
- Sesgos potenciales del dataset: un unico origen de datos implica posible sesgo hacia protocolos de tincion, poblaciones de pacientes y distribucion de subtipos tumorales de esa fuente concreta.
- Sensibilidad al aumento: los objetos de 40x son muy diferentes a los de 20x en escala aparente; usar el modelo fuera del aumento previsto degradara la segmentacion incluso dentro del mismo tejido.
- Efectos de borde por teselado: el procesamiento `BY_TILE` puede fragmentar nucleos que caen en los limites de la tesela; se requiere solapamiento y fusion de mascaras para mitigarlo.
- Alucinacion en segmentacion: los modelos basados en SAM pueden generar mascaras plausibles pero incorrectas en regiones con artefactos, tinta, burbujas o tejido necrotico. La salida siempre debe validarse.
- Licencia: Apache 2.0 permite uso comercial con atribucion y sin copyleft, pero la licencia de los pesos del modelo base SAM y del checkpoint CellViT-SAM original debe verificarse por separado antes de un uso comercial, ya que podrian imponer condiciones adicionales.
- Uso clinico: no hay evidencia de validacion regulatoria ni de rendimiento diagnostico. No debe emplearse para decisiones clinicas sin validacion prospectiva y aprobacion correspondiente.
- Fecha de creacion anomala: los metadatos de HuggingFace registran 2026-09-19 como fecha de creacion y actualizacion, lo que conviene tener en cuenta al citar el artefacto.

## Enlaces

- HuggingFace: https://huggingface.co/huangch/10xGenomics-CRC_BY_TILE-CellViT-SAM-H-x40
- Perfil del autor en HuggingFace: https://huggingface.co/huangch
- Repositorio de referencia de la arquitectura CellViT-SAM: no disponible en los resultados de busqueda proporcionados
- Paper de CellViT-SAM: no disponible en los resultados de busqueda proporcionados
- Resultados de busqueda web relevantes: ninguno (las busquedas devuelven unicamente perfiles de LinkedIn sin relacion con el modelo)
