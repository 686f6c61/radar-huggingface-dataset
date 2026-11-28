# sartajbhuvaji/prism-ads-semantic-id-tokenizer

## Resumen

`sartajbhuvaji/prism-ads-semantic-id-tokenizer` es un tokenizador de identificadores semanticos (semantic IDs) disenado para recuperacion generativa de anuncios y productos, desarrollado por Sartaj Bhuvaji como parte del proyecto Prism. No es un modelo de lenguaje, sino un componente de tokenizacion que transforma los atributos textuales de un articulo (titulo, marca, categoria y descripcion) en una tupla corta de codigos discretos, de modo que un modelo de secuencia pueda generar articulos codigo a codigo. Los articulos similares comparten los codigos iniciales, lo que permite una generacion jerarquica y una recuperacion aproximada eficiente.

La arquitectura del tokenizador combina un encoder de texto denso (`BAAI/bge-base-en-v1.5`), una proyeccion PCA a 64 dimensiones y un esquema de k-means residual de 4 niveles con 256 codigos por nivel, mas un codigo de unicidad adicional para desambiguar colisiones dentro de un mismo catalogo. Se entreno sobre 1.662.865 articulos de ocho categorias del corpus Amazon 2023 (Appliances, Video Games, Musical Instruments, Baby Products, Industrial and Scientific, Grocery and Gourmet Food, Pet Supplies y Office Products).

Es relevante ahora porque representa un enfoque practico y reproducible para la recuperacion generativa en sistemas de recomendacion y publicidad, un area donde los identificadores atomicos tradicionales no escalan y los embeddings densos dificultan la generacion autorregresiva. El repositorio ocupa 0,0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador de IDs semanticos: encoder BGE-base + proyeccion PCA + k-means residual jerarquico |
| Parametros totales | no disponible (el tokenizador no expone un recuento de parametros; el encoder subyacente es `BAAI/bge-base-en-v1.5`) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens maximos de entrada de texto para el encoder |
| Tipos de cuantizacion | no aplica (almacena codebooks y proyeccion en `.npy` / `.npz`) |
| Idiomas soportados | ingles (entrenado sobre texto de productos de Amazon en ingles); otros idiomas no probados |
| Licencia | sin licencia; publicado solo para uso educativo |
| Formato de pesos | `config.json`, `projection.npz`, `codebooks.npy` |
| Dimension del embedding | 768 dimensiones (BGE-base), L2-normalizado, vector [CLS] |
| Proyeccion | 64 componentes principales (54,9 % de la varianza) |
| Estructura de codigos | 4 niveles x 256 codigos + 1 codigo de unicidad |
| Revision del encoder | `a5beb1e3e68b9ab74eb54cfd186867f64f240e1a` |

## Arquitectura y entrenamiento

El tokenizador sigue un pipeline de cinco etapas. Primero concatena los campos disponibles del articulo en una cadena con el formato `Title: ...; Brand: ...; Category: ...; Description: ...`, omitiendo campos ausentes y excluyendo el precio. Despues genera un embedding con `BAAI/bge-base-en-v1.5` en una revision fija, tomando el vector [CLS], normalizandolo en L2 y truncando a 512 tokens. A continuacion centra el vector y lo proyecta sobre 64 componentes principales que retienen el 54,9 % de la varianza. Sobre ese espacio proyectado aplica k-means residual con 4 niveles de 256 centroides cada uno, produciendo una tupla de cuatro codigos. Finalmente, si varios articulos de un mismo catalogo comparten los cuatro codigos, anade un quinto codigo de unicidad (0, 1, 2, ...).

El entrenamiento se realizo sobre 1.662.865 articulos provenientes de ocho subconjuntos del corpus Amazon 2023: Appliances, Video Games, Musical Instruments, Baby Products, Industrial and Scientific, Grocery and Gourmet Food, Pet Supplies y Office Products. No se documenta el uso de RLHF, DPO ni ajuste supervisado, ya que no es un modelo generativo. La innovacion principal es la combinacion de un encoder denso preentrenado con una cuantizacion jerarquica residual que preserva la similitud semantica en los codigos iniciales, permitiendo que un modelo de secuencia genere primero codigos gruesos y luego refinamientos. El tokenizador solo almacena codebooks y la proyeccion; no contiene texto de articulos ni embeddings.

## Capacidades

- Conversion de atributos textuales de productos (titulo, marca, categoria, descripcion) a IDs semanticos discretos.
- Asignacion de IDs a articulos nuevos a partir unicamente de su texto, sin necesidad de reentrenamiento.
- Preservacion de similitud semantica: articulos parecidos comparten los codigos iniciales de la tupla.
- Desambiguacion intra-catalogo mediante codigo de unicidad adicional.
- Integracion con modelos de secuencia para recuperacion generativa codigo a codigo.
- Uso como componente en pipelines de recomendacion y publicidad.
- Interfaz de linea de comandos (`prism tokenize`) y API de Python (`SemanticIDTokenizer.from_pretrained`).
- No soporta tool calling, agentes, vision, audio ni modo thinking: es un tokenizador, no un modelo generativo.

## Casos de uso

- Recuperacion generativa de anuncios en produccion: el tokenizador convierte el catalogo en tuplas de codigos que un modelo de secuencia puede generar de forma autorregresiva, sustituyendo la busqueda por vecino mas cercano sobre embeddings densos por una generacion discreta y jerarquica.
- Sistemas de recomendacion de productos: al compartir los codigos iniciales entre articulos similares, permite construir indices jerarquicos y filtrar candidatos por prefijo de codigo antes de un reranking mas costoso.
- Incorporacion de articulos nuevos al catalogo: un producto recien anadido recibe su ID a partir de su texto sin reentrenar el tokenizador, lo que simplifica las actualizaciones continuas de inventario.
- Analisis de similitud de catalogo: la tasa de colision y los grupos de codigos compartidos permiten detectar duplicados, variantes de marca o agrupaciones de productos con atributos casi identicos.
- Investigacion en recuperacion semantica: sirve como referencia reproducible para experimentar con cuantizacion residual jerarquica frente a alternativas como RQ-VAE o identificadores atomicos.
- Prototipado de motores de busqueda publicitaria: la CLI `prism tokenize catalog.csv` permite procesar un CSV con columnas `id`, `title`, `brand`, `category` y `description` y obtener un `semantic_ids.csv` listo para alimentar un modelo de generacion.
- Evaluacion de la calidad de representacion de un encoder: al medir la tasa de colision sobre catalogos retenidos se obtiene una senal indirecta de como el encoder agrupa articulos en el espacio proyectado.

## Benchmarks y rendimiento

La model card solo publica tasas de colision, definidas como la proporcion de articulos cuyos 4 codigos se comparten con otro articulo antes de anadir el codigo de unicidad. Es una metrica proxy: la recall de recuperacion con este tokenizador no se ha medido.

| Catalogo | En datos de entrenamiento | Articulos | Tasa de colision | Grupo mayor | Codigos usados por nivel |
|---|---|---|---|---|---|
| Contenido de entrenamiento | si | 1.662.865 | 0,227 | 222 | 256 / 256 / 256 / 256 |
| Amazon 2014 beauty | no | 12.101 | 0,1297 | 16 | 136 / 240 / 244 / 252 |
| Amazon 2014 sports | no | 18.357 | 0,1036 | 16 | 212 / 254 / 253 / 253 |
| Amazon 2014 toys | no | 11.924 | 0,0606 | 13 | 176 / 247 / 252 / 253 |

Los numeros provienen de `results/tokenizer/a23-8-L4.json` en el repositorio Prism. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de recall de recuperacion en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el encoder subyacente (`BAAI/bge-base-en-v1.5`, aproximadamente 110 millones de parametros) cabe holgadamente en GPUs de consumo, y el resto del pipeline (PCA y k-means) se ejecuta en CPU.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para el encoder; tambien funciona en CPU para procesamiento por lotes de catalogos.
- Cabe en GPU de consumo: si, incluidas RTX 3060, RTX 4060, RTX 4090 y similares; el cuello de botella es el encoder, no el tokenizador.
- Opciones de despliegue: paquete Python `prism` con extras `embed` y `hub`; CLI `prism tokenize`; API `SemanticIDTokenizer.from_pretrained`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput estimados: no disponibles. Dependen del encoder BGE-base y del tamano del catalogo; el procesamiento es por lotes sobre CSV.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| prism-ads-semantic-id-tokenizer | Tokenizador de IDs semanticos | no disponible (encoder BGE-base) | 512 tokens | BGE + PCA + k-means residual 4x256 | Sin licencia (solo educativo) | Hugging Face, 0 descargas |
| RQ-VAE (Rajput et al.) | Tokenizador de IDs semanticos | no disponible | no aplica | Autoencoder residual cuantizado | Segun implementacion | Repositorios de investigacion |
| TIGER (Rajput et al.) | Modelo generativo de recuperacion | no disponible | no disponible | IDs semanticos + transformer seq2seq | Segun implementacion | Repositorios de investigacion |
| BGE-base-en-v1.5 | Encoder de texto | ~110 M | 512 tokens | Transformer denso | MIT (segun el modelo original) | Hugging Face |

No se dispone de datos comparativos de rendimiento (recall, NDCG) entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con texto de productos de Amazon en ingles; otros idiomas y anuncios que no sean de producto no han sido probados.
- No se ha probado en un sistema publicitario en produccion.
- La tasa de colision no equivale a calidad de recuperacion: la recall real no se ha medido.
- La tasa de colision en el propio conjunto de entrenamiento es alta (0,227) y el grupo mayor agrupa 222 articulos, lo que indica perdida de granularidad en categorias densas.
- Sin licencia explicita: publicado solo para uso educativo, ya que los datos de resenas de Amazon sobre los que se ajusto no declaran licencia. No apto para uso comercial sin aclaracion legal.
- El tokenizador almacena solo codebooks y proyeccion, sin texto ni embeddings de articulos, lo que reduce pero no elimina las implicaciones derivadas de los datos de origen.
- Excluye el precio del texto de entrada, por lo que no captura senales de precio en los IDs generados.
- El truncamiento a 512 tokens puede perder informacion en descripciones largas.
- Riesgo de sesgo heredado del corpus Amazon 2023 y del encoder BGE-base, no evaluado por el autor.
- Version 0: los catalogos de benchmark de 2014 marcados como no incluidos en entrenamiento son solo una comprobacion retenida, no una validacion exhaustiva.

## Enlaces

- Hugging Face: https://huggingface.co/sartajbhuvaji/prism-ads-semantic-id-tokenizer
- Repositorio Prism: https://github.com/SartajBhuvaji/prism
- Detalles de licencias de datos: https://github.com/SartajBhuvaji/prism/blob/main/data/LICENSES.md
- Encoder base: https://huggingface.co/BAAI/bge-base-en-v1.5
