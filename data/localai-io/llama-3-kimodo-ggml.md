# LocalAI-io/Llama-3-Kimodo-GGML

## Resumen

Llama-3-Kimodo-GGML es un encoder de texto en formato nativo GGML/GGUF derivado de Meta Llama-3-8B-Instruct y de los adaptadores MNTP y supervisados del proyecto LLM2Vec del grupo McGill. Lo publica el repositorio LocalAI-io y su función no es la generación de texto, sino producir embeddings de texto reutilizables dentro del ecosistema Kimodo, un conjunto de modelos de difusión orientados a la síntesis de movimiento humano. El modelo card es explícito: se trata únicamente del encoder LLM2Vec y requiere descargar por separado un modelo de difusión Kimodo compatible, como `Kimodo-SMPLX-RP-v1-GGML`.

El interés técnico reside en que empaqueta un transformer de 7.546.867.712 parámetros en un único GGUF monolítico con seis variantes de cuantización (de BF16 a Q4_K_M), pensado para inferencia local y para lectura selectiva de rangos de tensores capa a capa, sin necesidad de ficheros por capa. Esto lo hace adecuado para pipelines de IA local gestionados por LocalAI, donde el coste de VRAM y la portabilidad del formato importan más que la generación conversacional.

La distribución tiene 62.861 descargas y 8 likes, un tamaño de repositorio de 59,6 GB y se actualizó por última vez el 29 de octubre de 2026. La licencia es "other": el bundle queda sujeto a la Meta Llama 3 Community License, por lo que la redistribución y el uso comercial requieren revisar dicho acuerdo antes de desplegarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3) adaptado como encoder de texto mediante LLM2Vec (MNTP + adaptadores supervisados) |
| Parametros totales | 7.546.867.712 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K, Q4_K, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | other (sujeta a Meta Llama 3 Community License) |
| Formato de pesos | GGUF / GGML monolítico (con `tokenizer.gguf` compartido) |

## Arquitectura y entrenamiento

El modelo parte de Meta Llama-3-8B-Instruct, un transformer decoder-only de 8.000 millones de parámetros, y se convierte en encoder bidireccional efectivo mediante la receta LLM2Vec: entrenamiento de adaptación no supervisada enmascarada (MNTP, *Masked Next Token Prediction*) seguido de adaptadores supervisados con datos de pares de similitud. El resultado es un encoder que produce representaciones de frase y de token, no un modelo generativo. Los adaptadores MNTP y supervisados proceden del proyecto LLM2Vec de McGill y se distribuyen con licencia MIT, mientras que los pesos base conservan la licencia de Meta.

La conversión a GGML/GGUF la realiza LocalAI-io y publica variantes monolíticas: BF16 (15,18 GB), Q8_0 (8,14 GB, la recomendada), Q6_K (6,32 GB), Q5_K (5,33 GB), Q4_K (4,39 GB) y Q4_K_M (5,06 GB, la preferida para experimentos de baja precisión). El fichero `MANIFEST.json` registra los commits exactos de origen, los SHA-256 de cada artefacto y el mapeo entre pesos y tokenizador para cada cuantización. Kimodo lee rangos de tensores individuales del monolito, de modo que el streaming capa a capa no exige ficheros separados. El script `scripts/download_gguf_weights.sh` instala por defecto Q8_0 y permite seleccionar otra variante con `--text-quantization`.

## Capacidades

- Generación de embeddings de texto (representaciones de frase y de token) para tareas de recuperación, similitud semántica y clustering.
- Codificación de instrucciones y texto natural heredada de Llama-3-8B-Instruct, reorientada a representaciones densas.
- Integración como encoder de texto dentro del pipeline de difusión de Kimodo para la síntesis de movimiento.
- Lectura selectiva de tensores por capa desde un GGUF monolítico, apta para carga parcial y streaming.
- Soporte de múltiples cuantizaciones con un único tokenizador compartido.
- No disponible: tool calling, function calling, razonamiento multi-paso, agentes, visión, audio y modo thinking no están documentados en la información proporcionada.

## Casos de uso

- Búsqueda semántica local: el encoder genera embeddings de documentos y consultas para un índice vectorial desplegado en infraestructura propia, con la variante Q8_0 (8,14 GB) como equilibrio entre calidad y huella de memoria.
- Clasificación y clustering de textos: agrupación de tickets, reseñas o incidencias por similitud de embeddings, sin depender de APIs externas.
- Deduplicación de corpus: detección de documentos casi idénticos mediante similitud coseno sobre las representaciones generadas, apropiado para pipelines de limpieza de datos.
- Síntesis de movimiento con Kimodo: el encoder actúa como componente de codificación de texto del pipeline de difusión, emparejado con `Kimodo-SMPLX-RP-v1-GGML`; es su caso de uso primario declarado.
- Despliegue en LocalAI: al ser GGUF/GGML nativo, se integra en entornos de inferencia local gestionados por LocalAI para servir embeddings a aplicaciones internas.
- Experimentación con cuantizaciones de baja precisión: las variantes Q4_K (4,39 GB) y Q4_K_M (5,06 GB) permiten evaluar la degradación de calidad de los embeddings en hardware con VRAM limitada.
- Sistemas de recomendación basados en contenido: comparación de perfiles y elementos mediante embeddings de texto para generar candidatos iniciales en un ranker.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 15,2 GB en BF16, 8,1 GB en Q8_0, 6,3 GB en Q6_K, 5,3 GB en Q5_K, 5,1 GB en Q4_K_M y 4,4 GB en Q4_K, solo para los pesos.
- GPU recomendadas: A100 o H100 para BF16 y para servir varias peticiones concurrentes; RTX 4090 (24 GB) para BF16 y Q8_0 con holgura; RTX 3090 o RTX 4080 para Q8_0 y cuantizaciones menores.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB o más con Q4_K o Q4_K_M, y en tarjetas de 12-16 GB con Q6_K o Q8_0.
- Opciones de despliegue: el formato es GGML/GGUF nativo y el consumidor previsto es kimodo.cpp; LocalAI puede servir el modelo en entornos GGUF. No se documenta soporte específico para vLLM o TGI, que trabajan con otros formatos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Llama-3-Kimodo-GGML | 7,55 B | no disponible | GGUF/GGML | other (Meta Llama 3) | Encoder LLM2Vec para el pipeline Kimodo |
| LLM2Vec (base Llama-3-8B-Instruct) | 8 B | no disponible | safetensors | MIT (adaptadores) + Meta Llama 3 | Origen de los adaptadores; requiere conversión a GGUF |
| Kimodo-SMPLX-RP-v1-GGML | no disponible | no disponible | GGUF/GGML | no disponible | Modelo de difusión complementario, no sustituible entre sí |

La comparación con encoders de texto dedicados de tamaño similar (por ejemplo, familias tipo BGE o E5) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no debe emplearse para chat, razonamiento o generación de código, pese a derivar de Llama-3-8B-Instruct.
- Requiere un modelo de difusión Kimodo compatible para el caso de uso de síntesis de movimiento; por sí solo no produce movimiento.
- Licencia "other" sujeta a la Meta Llama 3 Community License: es obligatorio revisar `LICENSE-META-LLAMA-3.txt` y `NOTICE` antes de cualquier uso comercial o redistribución.
- Idiomas soportados no documentados; el comportamiento multilingüe no puede garantizarse a partir de la información disponible.
- Longitud de contexto no documentada, lo que impide planificar con precisión el truncado de documentos largos.
- Riesgo de sesgos heredados del corpus de entrenamiento de Llama 3 y de los datos de pares usados en los adaptadores supervisados; no se documentan evaluaciones de sesgo.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de representaciones poco fiables en dominios alejados de la distribución de entrenamiento.
- Las variantes Q6_K, Q5_K y Q4_K están marcadas como experimentales por el autor; solo Q8_0 se recomienda y Q4_K_M se etiqueta como experimento de baja precisión preferido.
- El repositorio ocupa 59,6 GB, por lo que la descarga completa exige espacio en disco considerable; conviene descargar solo la variante necesaria.

## Enlaces

- [Hugging Face: LocalAI-io/Llama-3-Kimodo-GGML](https://huggingface.co/LocalAI-io/Llama-3-Kimodo-GGML)
- [Modelo de difusión complementario: Kimodo-SMPLX-RP-v1-GGML](https://huggingface.co/LocalAI-io/Kimodo-SMPLX-RP-v1-GGML)
- [Meta Llama 3 Community License (Meta-Llama-3-8B-Instruct)](https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct)
