# NaimaVahab/LUNA-FM-BPE-15k

## Resumen

LUNA-FM (LUNA Foundation Model) es un modelo fundacional de tipo encoder basado en la arquitectura ModernBERT, publicado por NaimaVahab y colaboradores (Vahab, He, Sarwar y Tyagi) en el contexto de una publicacion en Taylor & Francis. Su proposito no es la generacion de texto general, sino la inferencia funcional sobre ARN largos no codificantes (lncRNA), un dominio biologico donde los modelos de lenguaje de proteinas y ADN han ganado traccion en los ultimos anos. El modelo se distribuye con el sufijo BPE-15k, lo que indica un tokenizador de subpalabras entrenado con un vocabulario de 15.000 unidades sobre secuencias de nucleotidos.

El checkpoint aloja 122.457.240 parametros en formato safetensors, con un tamano de repositorio de 0,5 GB. La eleccion de ModernBERT como backbone es relevante: se trata de una familia de encoders transformer con atencion de contexto largo, alternancia de capas de atencion global y local, y mejoras de eficiencia frente a BERT clasico. Aplicado a lncRNA, esto permite modelar secuencias nucleotidicas de varios miles de bases, algo que los encoders tradicionales limitados a 512 tokens no cubren bien.

El modelo es muy reciente (creado en septiembre de 2026, actualizado en noviembre de 2026) y cuenta con un volumen de descargas bajo (13) y ningun "like", lo que sugiere una adopcion incipiente. La model card es extremadamente escueta: solo incluye la referencia bibliografica, sin detallar datos de entrenamiento, licencia ni idiomas. Esto limita la evaluacion independiente y obliga a tratar gran parte de las especificaciones como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parametros totales | 122.457.240 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (dominio: secuencias de nucleotidos de lncRNA) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El backbone es ModernBERT, un encoder transformer que introduce mejoras sobre BERT: rotatory positional embeddings (RoPE), alternancia de capas con atencion global y local, y kernels optimizados para secuencias largas. En el contexto de LUNA-FM, el modelo se aplica sobre secuencias de ARN no codificante tokenizadas con un esquema BPE de 15.000 unidades (de ahi el sufijo BPE-15k), en lugar de la tokenizacion por caracter o por k-mero habitual en modelos genomicos. Este enfoque de subpalabras sobre nucleotidos es una decision de diseno poco comun y potencialmente ventajosa para capturar motivos y patrones estructurales recurrentes.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, la procedencia de las secuencias de lncRNA, ni sobre si se aplicaron tecnicas de ajuste fino supervisado, RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal mas alla de lo que aporta ModernBERT de serie. La unica referencia tecnica es la publicacion en Taylor & Francis citada en la model card.

## Capacidades

- Modelado de representaciones de secuencias de ARN largo no codificante mediante tokenizacion BPE de 15.000 unidades.
- Inferencia funcional sobre lncRNA: el objetivo declarado es predecir o inferir funcion a partir de la secuencia.
- Extraccion de embeddings contextuales por token y por secuencia, util para tareas downstream (clasificacion, regresion, similitud).
- Ajuste fino supervisado sobre tareas especificas de biologia computacional (clasificacion de familias, prediccion de localizacion subcelular, etc.), siempre que se disponga de datos etiquetados.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingues en el sentido convencional.
- No se documenta modo "thinking", vision ni audio.

## Casos de uso

- Anotacion funcional de lncRNA: dado un transcrito no caracterizado, el modelo puede generar embeddings y alimentar un clasificador para asignar posibles funciones o familias, reduciendo el coste frente a la validacion experimental.
- Priorizacion de candidatos en estudios de asociacion: integrado en pipelines de genomica, permite puntuar miles de lncRNA y seleccionar los mas prometedores para validacion wet-lab.
- Clasificacion de tejido o condicion: ajustando el encoder sobre datos de expresion, se puede usar para discriminar patrones asociados a tejidos o estados patologicos.
- Busqueda de similitud semantica entre transcritos: los embeddings permiten agrupar lncRNA por similitud funcional y construir clusters que guien analisis posteriores.
- Deteccion de motivos y elementos regulatorios: las representaciones internas pueden analizarse para identificar regiones con alta activacion asociadas a motivos conocidos.
- Integracion en pipelines de biologia computacional: al ser un encoder ligero (122 M de parametros, 0,5 GB), cabe en entornos con recursos limitados y puede servirse como microservicio para anotacion a escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB solo para pesos, mas activaciones; en la practica menos de 2 GB para secuencias moderadas.
- VRAM estimada en fp16/bf16: en torno a 0,25 GB para pesos; holgadamente por debajo de 1 GB con overhead.
- Cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en CPU para lotes pequenos.
- Despliegue recomendado: Hugging Face Transformers, Text Embedding Inference (TEI) o vLLM en modo encoder; llama.cpp/Ollama no aplican de forma nativa a ModernBERT.
- Latencia y throughput: no disponibles; dependen de la longitud de secuencia y del hardware. Para un encoder de 122 M, se espera throughput alto en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LUNA-FM-BPE-15k | 122 M | no disponible | lncRNA | no disponible | Hugging Face |
| Nucleotide Transformer (InstaDeep) | 50 M - 2,5 B | hasta 12 kb (variantes) | ADN/genoma | varias (investigacion/comercial segun variante) | Hugging Face |
| DNABERT-2 | ~117 M | ~10 kb efectivo | ADN | MIT (segun repo) | Hugging Face |
| HyenaDNA | 1,6 M - 47 M | hasta 1 M bases | ADN | Apache 2.0 (segun repo) | Hugging Face |

La comparacion es orientativa: los modelos citados se entrenan mayoritariamente sobre ADN, mientras que LUNA-FM se enfoca en lncRNA. No hay benchmarks publicados que permitan una comparacion cuantitativa directa.

## Limitaciones y advertencias

- La model card no documenta sesgos, datos de entrenamiento ni evaluacion, por lo que no es posible auditar el modelo.
- Riesgo de alucinacion y de sobreinterpretacion en inferencia funcional: las predicciones deben validarse experimentalmente.
- Licencia no disponible: no se puede confirmar el uso comercial sin contactar con el autor.
- Idiomas y cobertura de secuencias no documentados; se desconoce el sesgo hacia especies, tejidos o tipos de lncRNA concretos.
- Contexto maximo no especificado; secuencias mas largas que el limite del backbone pueden requerir truncamiento o chunking.
- Adopcion muy baja (13 descargas) y ausencia de comunidad: soporte y mantenimiento inciertos.
- No apto para generacion de texto general ni para tareas fuera del dominio biologico.

## Enlaces

- Hugging Face: https://huggingface.co/NaimaVahab/LUNA-FM-BPE-15k
- Publicacion citada: Vahab, N.; He, E.; Sarwar, T.; Tyagi, S. "LUNA-FM: a subword foundation model for long non-coding RNAs for functional inference". Taylor & Francis (DOI no disponible en la informacion proporcionada).
- Repositorio de ModernBERT (backbone): https://huggingface.co/answerdotai/ModernBERT-base
