# AI4PD/REXzyme

## Resumen

REXzyme (Reaction to Enzyme) es un modelo de traducción automática diseñado para generar enzimas nuevas que catalicen reacciones químicas definidas por el usuario. Lo desarrolla el grupo AI4PD, liderado por Noelia Ferruz, y se basa en la arquitectura Efficient T5 Large Transformer de Google, con 48 capas (24 de codificador y 24 de decodificador) y una dimensionalidad de 1024, sumando aproximadamente 770 millones de parámetros. El modelo traduce desde el espacio químico (reacciones codificadas en SMILES) al espacio de secuencias de aminoácidos.

El modelo se entrenó sobre una porción de la base de datos RHEA que contiene 20.911.485 pares reacción-enzima, derivados de 16.011 reacciones únicas. La formulación es la de un problema de traducción supervisada: el codificador procesa la representación continua de la reacción y el decodificador genera autorregresivamente la secuencia de aminoácidos token a token, de izquierda a derecha. Se emplean dos tokenizadores independientes, uno para la entrada SMILES y otro para las etiquetas de aminoácidos.

Su relevancia radica en que aborda el diseño de enzimas *de novo* condicionado a una reacción concreta, un problema de interés en biocatálisis y biotecnología. El proyecto se declara explícitamente como trabajo en curso y el manuscrito asociado está en preparación, por lo que las capacidades y el rendimiento deben interpretarse como preliminares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Efficient T5 Large Transformer (encoder-decoder), 48 capas (24 encoder / 24 decoder), dimensionalidad 1024 |
| Parametros totales | 770 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de traduccion reaccion quimica a secuencia de aminoacidos); no disponible en el sentido linguistico |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors / PyTorch (transformers); tamano del repositorio 73,7 GB |

## Arquitectura y entrenamiento

REXzyme emplea una arquitectura transformer encoder-decoder tipo T5, concretamente la variante Efficient T5 Large, con 24 capas en cada bloque, dimensionalidad de 1024 y 770 millones de parametros. La entrada es una reaccion codificada en SMILES canonico con el esquema `ReactanteA.ReactanteB>AgenteA>ProductoA.ProductoB`, con reactantes y productos ordenados alfabeticamente. El modelo usa dos tokenizadores separados: uno para la entrada SMILES (tokenizacion a nivel de caracter con offset) y otro para las etiquetas de aminoacidos.

El entrenamiento consistio en un objetivo de traduccion supervisada sobre 20.911.485 pares reaccion-enzima extraidos de RHEA (16.011 reacciones unicas). El decodificador genera aminoacidos de forma autorregresiva y causal, aprendiendo las dependencias entre las caracteristicas de la secuencia proteica y la reaccion catalizada. Como la tokenizacion SMILES es a nivel de caracter, el modelo puede transferir aprendizaje entre clases de reaccion con distinto numero de miembros. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion adicionales, ni el numero total de tokens de entrenamiento.

## Capacidades

- Generacion de secuencias de enzimas condicionada a una reaccion quimica definida por el usuario en formato SMILES.
- Traduccion entre el espacio quimico (reacciones) y el espacio de secuencias de aminoacidos.
- Entrada de grano fino a nivel de sustrato: permite especificar reactantes, agentes y productos por separado.
- Generacion de multiples secuencias por reaccion para su posterior filtrado y seleccion.
- Procesamiento por lotes: admite un fichero con multiples reacciones SMILES, una por linea, generando secuencias para cada una de forma independiente.
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de modo thinking, vision ni audio.
- Capacidades multilingues: no aplica, dado que su dominio es quimico y biologico, no linguistico.

## Casos de uso

- Diseno de enzimas para biocatalisis industrial: se introduce la reaccion objetivo en SMILES y el modelo propone secuencias candidatas que se criban posteriormente con predictores de estructura (pLDDT) y otras metricas antes de su validacion experimental.
- Exploracion de rutas metabolicas nuevas: dado un paso de reaccion de interes en una ruta, REXzyme genera enzimas candidatas que podrian incorporarse a un organismo hu especial.
- Generacion masiva de candidatos para cribado: al procesar ficheros con multiples reacciones, permite generar bibliotecas de secuencias para su evaluacion in silico a gran escala.
- Investigacion en biologia sintetica: util para estudiar que caracteristicas de secuencia se asocian a una reaccion concreta, aprovechando la transferencia de aprendizaje entre clases de reaccion.
- Docencia y prototipado rapido: el cuaderno de Google Colab permite a estudiantes e investigadores generar enzimas para una reaccion dada sin infraestructura propia.
- Filtrado y priorizacion de candidatos: combinado con metricas como pLDDT y perplexity, sirve para priorizar secuencias antes de sintesis y ensayos de laboratorio.
- Analisis de reacciones poco pobladas: la tokenizacion a nivel de caracter permite aprovechar el aprendizaje de clases de reaccion con mas datos para generar propuestas en clases con menos ejemplos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el analisis del modelo en distintas tareas in silico y las pruebas experimentales estan en curso, y que el manuscrito esta en preparacion. Se advierte que la perplexity no es el mejor criterio de seleccion y que el BLEU forzaria una alta similitud de secuencia, contraria al objetivo de diseno *de novo*; se recomienda generar muchas secuencias y seleccionarlas por pLDDT y otras metricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 770 millones de parametros, en precision completa (fp32) el modelo ronda los 3 GB de pesos; en fp16/bf16 aproximadamente 1,5 GB. El repositorio de 73,7 GB incluye pesos y otros artefactos, por lo que no debe confundirse con el tamano del modelo en memoria.
- GPU recomendadas: no especificadas por el autor. Por tamano, cabe en GPUs de consumo como RTX 3090, RTX 4090 o inferiores con suficiente memoria, y en GPUs de datacenter como A100 o H100 sin problema.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU con al menos 4-8 GB de VRAM en fp16, aunque no hay cifras oficiales.
- Opciones de despliegue: transformers (AutoTokenizer, AutoModelForSeq2SeqLM), text-generation-inference segun los tags del repositorio y endpoints compatibles. No se documenta soporte de GGUF, llama.cpp, Ollama ni vLLM.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento que permitan una comparativa cuantitativa con alternativas. A continuacion se ofrece una comparacion estructural basica con modelos de la misma categoria (traduccion reaccion a enzima):

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| REXzyme | 770 M | no disponible | Apache 2.0 | Hugging Face (AI4PD/REXzyme) |
| Otros modelos reaccion-enzima comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Proyecto en estado de trabajo en curso ("Work in Progress"); el manuscrito esta en preparacion y las pruebas experimentales no han concluido.
- Riesgo de alucinacion en sentido biologico: las secuencias generadas son propuestas in silico y no garantizan actividad enzimatica; requieren validacion experimental.
- La perplexity no es un criterio fiable de seleccion y el BLEU penaliza el diseno *de novo*; conviene usar pLDDT y otras metricas complementarias.
- Sesgos derivados de la base de datos RHEA: clases de reaccion con pocos miembros pueden estar peor representadas, aunque el modelo intenta transferir aprendizaje entre clases.
- Requiere que la entrada SMILES este correctamente canonizada con RDKit y ordenada alfabeticamente segun el esquema indicado; entradas mal formateadas pueden degradar la calidad.
- No se documentan limitaciones de longitud de contexto ni de idioma porque el modelo no opera en dominio linguistico.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo de investigacion en desarrollo conviene revisar la model card y el repositorio para posibles actualizaciones de terminos.
- No se documentan sesgos de dominio, pero al depender de RHEA puede heredar sesgos de cobertura taxonomica y de tipos de reaccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AI4PD/REXzyme
- Cuaderno de Google Colab: https://colab.research.google.com/github/AI4PDLab/teaching/blob/main/notebooks/04b_rexzyme_pretrained.ipynb
- Repositorio GitHub del laboratorio: https://github.com/AI4PDLab
- Base de datos RHEA: https://www.rhea-db.org/
- Efficient T5 Large (arquitectura base): https://huggingface.co/google/t5-efficient-large
- Conversion de moleculas a SMILES (CACTUS): https://cactus.nci.nih.gov/chemical/structure
- RDKit: https://www.rdkit.org/docs/GettingStartedInPython.html
- Web del grupo: https://www.aiproteindesign.com
