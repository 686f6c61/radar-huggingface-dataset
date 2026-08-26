# avencera/sam3.1-mlx-bf16

## Resumen

SAM 3.1 es el modelo de segmentación de imágenes y vídeo de Meta, sucesor de SAM 3, diseñado para detección de objetos open-vocabulary, segmentación de instancias y seguimiento de objetos en tiempo real. Este repositorio concreto, `avencera/sam3.1-mlx-bf16`, es un espejo de la conversión MLX realizada por la comunidad MLX sobre los pesos originales de `facebook/sam3.1`, optimizada para ejecución en hardware Apple Silicon mediante el framework MLX.

El modelo cuenta con aproximadamente 873 millones de parámetros y se distribuye en formato BF16, con un tamaño de repositorio de 3,5 GB. Su relevancia actual radica en que permite ejecutar las capacidades de segmentación y tracking de SAM 3.1 de forma nativa en chips de Apple (M-series), sin necesidad de GPUs NVIDIA, y mantiene las innovaciones de SAM 3.1 como el decodificador MultiplexMaskDecoder y el cuello de detección TriViTDetNeck. Es importante destacar que Avencera no ha modificado los pesos; se trata de una copia byte a byte de `mlx-community/sam3.1-bf16`, y todo el contenido está sujeto a la licencia SAM de Meta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAM 3.1 (Transformer-based, con MultiplexMaskDecoder y TriViTDetNeck) |
| Parametros totales | 873.185.260 (~873M) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de vision) |
| Tipos de cuantizacion | BF16 (unico formato disponible en este repo) |
| Idiomas soportados | no disponible (modelo de vision; los prompts de texto no estan especificados por idioma) |
| Licencia | SAM License (license_name: sam-license, license: other) |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

SAM 3.1 mantiene la arquitectura base de SAM 3 con dos innovaciones principales documentadas en la informacion disponible. La primera es el **MultiplexMaskDecoder**, que procesa hasta 16 objetos simultaneamente, logrando un seguimiento entre 2,4 y 4 veces mas rapido que SAM 3 en escenarios de video. La segunda es el **TriViTDetNeck**, compuesto por tres cabezales FPN (Feature Pyramid Network) en paralelo, que mejora la deteccion de objetos en escenas concurridas mediante un razonamiento global que optimiza la precision en entornos densos.

El modelo fue convertido a formato MLX desde los pesos de `facebook/sam3.1` utilizando `mlx-vlm` version 0.4.3. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de RLHF o DPO, ya que estos datos no estan publicados en la informacion proporcionada.

## Capacidades

- **Segmentacion de imagenes**: genera mascaras de segmentacion a partir de prompts de texto o visuales (puntos, bounding boxes).
- **Deteccion de objetos open-vocabulary**: identifica objetos de cualquier categoria descrita por texto, sin restriccion de vocabulario cerrado.
- **Segmentacion de instancias**: distingue y segmenta multiples instancias del mismo objeto en una misma escena.
- **Seguimiento de video en tiempo real**: mediante Object Multiplex, procesa hasta 16 objetos simultaneamente en secuencias de video con una aceleracion de 2,4 a 4 veces respecto a SAM 3.
- **Prompts multimodales**: acepta tanto prompts de texto como prompts visuales (clics o regiones) para guiar la segmentacion.
- **Ejecucion nativa en Apple Silicon**: al estar en formato MLX, aprovecha el Neural Engine y los cores de GPU de los chips M1, M2, M3 y M4 sin necesidad de CUDA.

## Casos de uso

- **Edicion de video automatica**: el modelo puede seguir objetos en movimiento a lo largo de un clip y generar mascaras temporales para aplicar efectos, reemplazos de fondo o eliminacion de elementos no deseados, gracias al MultiplexMaskDecoder que procesa 16 objetos a la vez.
- **Herramientas de diseno grafico**: integrado en aplicaciones de retoque fotografico, permite al usuario seleccionar un objeto con un clic y obtener una mascara precisa para extraerlo o modificarlo sin recorte manual.
- **Vision artificial en entornos industriales**: deteccion y segmentacion de piezas o anomalias en lineas de produccion mediante prompts de texto que describen el defecto a buscar, ejecutable en hardware Apple Silicon de bajo consumo.
- **Post-produccion cinematografica**: seguimiento de actores o props en rodajes para insertar efectos visuales, con la ventaja de ejecutarse en estaciones de trabajo Mac sin servidores GPU dedicados.
- **Sistemas de vigilancia y analisis de multitudes**: seguimiento simultaneo de multiples personas u objetos en video en tiempo real, aprovechando el razonamiento global para mantener precision en escenas concurridas.
- **Generacion de datasets de entrenamiento**: automatiza la creacion de mascaras de segmentacion para otros modelos de vision, a partir de videos o imagenes, con prompts de texto para definir las clases.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos cuantitativos de MMLU, COCO o cualquier otro benchmark de segmentacion o deteccion para esta conversion concreta.

## Requisitos de hardware

- **Plataforma**: exclusivamente Apple Silicon (chips M1, M2, M3, M4), dado el formato MLX.
- **VRAM estimada**: los pesos en BF16 ocupan aproximadamente 3,5 GB en disco; la memoria unificada necesaria para inferencia dependera del tamano de la imagen de entrada y del numero de objetos multiplexados, pero en configuraciones tipicas deberia caber en equipos con 16 GB de RAM unificada o mas.
- **GPU recomendadas**: no aplica CUDA; se ejecuta sobre la GPU integrada de Apple Silicon (via MLX) y puede beneficiarse del Neural Engine.
- **Opciones de despliegue**: framework MLX de Apple, con soporte en `mlx-vlm` y posibles integraciones via `mlx-lm`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, orientados a modelos de lenguaje.
- **Latencia y throughput**: no disponible; no se han publicado mediciones especificas para esta conversion.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `facebook/sam3.1` | ~873M | PyTorch | no aplicable | SAM License | Repo oficial de Meta |
| `mlx-community/sam3.1-bf16` | ~873M | MLX (BF16) | no aplicable | SAM License | Conversión de la comunidad MLX |
| `avencera/sam3.1-mlx-bf16` | ~873M | MLX (BF16) | no aplicable | SAM License | Espejo del anterior, sin cambios |

La diferencia principal entre las tres opciones es el formato de pesos y la procedencia. El modelo de Meta es la referencia original en PyTorch; la version de MLX Community es la conversion a MLX; este repositorio de Avencera es una copia byte a byte de la conversion de la comunidad, sin modificaciones. No se han comparado con otros modelos de segmentacion como SAM 2 o MobileSAM por falta de datos especificos en la informacion disponible.

## Limitaciones y advertencias

- **Licencia restrictiva**: el modelo esta bajo la SAM License de Meta, que impone condiciones especificas para su uso y distribucion. Es obligatorio revisar el texto completo de la licencia antes de cualquier uso comercial.
- **Solo Apple Silicon**: el formato MLX limita la ejecucion a hardware de Apple; no es posible ejecutarlo en GPUs NVIDIA o AMD sin convertir los pesos previamente.
- **Dependencia de la cadena de conversion**: al ser un espejo de `mlx-community/sam3.1-bf16`, cualquier error de conversion o actualizacion en el repo original no se reflejara automaticamente en este repositorio.
- **Sin datos de entrenamiento publicados**: no se conoce la composicion del dataset de entrenamiento, el numero de tokens de video ni las tecnicas de alineacion aplicadas, lo que dificulta evaluar sesgos o limitaciones de generalizacion.
- **Riesgo de alucinacion en prompts de texto**: aunque es un modelo de segmentacion, los prompts de texto pueden llevar a segmentaciones incorrectas si el objeto descrito no esta presente o es ambiguo en la escena.
- **Sin soporte de cuantizacion ligera**: solo se ofrece BF16; no hay versiones int8 o int4, lo que puede limitar la ejecucion en equipos con poca memoria unificada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/avencera/sam3.1-mlx-bf16
- Repositorio de la comunidad MLX: https://huggingface.co/mlx-community/sam3.1-bf16
- Blog de Meta sobre SAM 3.1: https://ai.meta.com/blog/segment-anything-model-3/
- Pagina de investigacion de SAM 3: https://ai.meta.com/research/sam3/
- Repositorio de SAM 3 en GitHub: https://github.com/facebookresearch/sam3
- Licencia SAM: https://github.com/facebookresearch/sam3/blob/8f0b7f4d4e7eda2ed606ebde6702c93359ad01da/LICENSE
