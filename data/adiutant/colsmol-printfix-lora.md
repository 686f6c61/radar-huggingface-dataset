# Adiutant/colsmol-printfix-lora

## Resumen

Adiutant/colsmol-printfix-lora es un conjunto de dos adaptadores LoRA publicados por el desarrollador independiente Adiutant sobre el modelo base vidore/colSmol-256M, un modelo de recuperación visual de documentos basado en late interaction (estilo ColPali) con backbone SmolVLM-256M. El objetivo concreto es recuperar páginas escaneadas de formularios administrativos rusos en los que conviven campos impresos y entradas manuscritas, usando como consulta un valor corto de campo (un INN, una MAC, un apellido, una fecha). El problema que resuelve es específico: el recetario habitual de LoRA sobre el codificador visual mejora mucho el manuscrito pero degrada la recuperación de texto impreso, y estos adaptadores corrigen esa regresión por dos vías distintas.

El adaptador por defecto, printfix_dense, entrena únicamente una cabeza de proyección densa (2 tensores) y no toca el codificador visual, con lo que el manuscrito mejora sin penalizar el impreso. El segundo, printfix_anchor, entrena LoRA visual más la cabeza densa (146 tensores) añadiendo una pérdida de anclaje que penaliza la deriva coseno de las páginas impresas respecto a sus embeddings zero-shot. Ambos se distribuyen con un CLI de indexación y búsqueda autocontenido, pensado para ejecutarse en CPU.

La relevancia es acotada pero clara para quien trabaja con digitalización de formularios: demuestra que se puede arreglar la regresión de un adaptador visual con muy pocos parámetros entrenables, con evaluación preregistrada y procedencia reproducible mediante ficheros sidecar JSON con hashes de datos y checkpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Recuperación visual multi-vector con late interaction (ColSmol/ColPali) sobre backbone SmolVLM-256M; adaptadores LoRA y cabeza de proyección densa |
| Parametros totales | No disponible para los adaptadores; el modelo base es de 256M (vidore/colSmol-256M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; los índices se almacenan en fp16 |
| Idiomas soportados | Ruso (ru); otros idiomas no medidos |
| Licencia | MIT para los adaptadores; el modelo base conserva su propia licencia (SmolVLM-256M Apache-2.0, adaptadores ColSmol MIT) |
| Formato de pesos | safetensors (adaptadores) más ficheros sidecar JSON de procedencia; índice en .pt (fp16) y manifiesto .json |

## Arquitectura y entrenamiento

El modelo base es un recuperador visual de documentos de tipo multi-vector con late interaction: cada página se representa como un conjunto de vectores (alrededor de 945 vectores de 128 dimensiones por página) y la consulta se compara contra todos ellos. Sobre esa base, printfix_dense entrena solo una cabeza de proyección densa de 2 tensores, dejando el codificador visual congelado; printfix_anchor entrena LoRA sobre el codificador visual más la cabeza densa, 146 tensores en total. El diagnóstico del autor es que el LoRA visual desplaza los embeddings de página mientras las consultas de texto permanecen fijas, lo que rompe la recuperación de campos impresos.

Los datos de entrenamiento son 789 pares sobre 96 páginas (405 manuscritos y 384 impresos), con un conjunto de selección de 178 pares sobre 24 páginas disjuntas a nivel de página. La pérdida es InfoNCE multi-positivo con 1 positivo y 4 negativos muestreados, temperatura 1.0, semilla 13, AdamW con lr 1e-4, weight decay 0.01 y 3 épocas; solo son entrenables los tensores del adaptador y la base permanece congelada. printfix_anchor añade un término de 2.0 × media(1 − cos(embedding de página, embedding zero-shot)) en los pasos de control impreso, con los embeddings zero-shot cacheados para las 96 páginas. Cada ejecución es reproducible a partir de los sidecar JSON, que registran SHA256 de datos, hiperparámetros, hash del informe de entrenamiento y hash del checkpoint de origen.

## Capacidades

- Recuperación visual de páginas completas de documentos escaneados mediante consultas de texto corto (valores de campo).
- Representación multi-vector con late interaction, adecuada para páginas densas con estructura heterogénea.
- Manejo conjunto de campos impresos y entradas manuscritas en la misma página.
- Indexación incremental: reejecutar la indexación sobre un directorio solo añade páginas nuevas.
- Coherencia de índice: un índice construido con un adaptador no se puede buscar sin él ni con otro adaptador distinto; el CLI aborta con error explícito.
- Ejecución en CPU sin GPU, con CLI autocontenido de indexación y búsqueda.
- Salida JSON en las búsquedas para integración en pipelines.
- No soporta generación de texto, tool calling, agentes, visión general ni audio: es un modelo de extracción de características (feature-extraction).

## Casos de uso

- Digitalización de formularios bancarios rusos: indexar los escaneos de páginas y localizar la página que contiene un INN o un número de cuenta concreto, apoyándose en la ventana multi-vector para tolerar el ruido de escaneo y la mezcla de impreso y manuscrito.
- Búsqueda de expedientes administrativos por apellido manuscrito: el adaptador printfix_dense mejora el MRR en manuscrito de 0.2106 a 0.3675 en selección, lo que lo hace útil para localizar páginas firmadas o rellenadas a mano.
- Verificación de direcciones MAC o identificadores en inventarios escaneados: la consulta es un valor corto y el sistema devuelve las páginas candidatas con top-k configurable.
- Archivística y gestión documental: indexación incremental de un fondo de escaneos que crece con el tiempo, manteniendo un manifiesto con la revisión base y el SHA256 del adaptador para trazabilidad.
- Despliegue en entornos sin GPU: el coste medido es de aproximadamente 6 a 13 segundos por página en indexación y decenas de milisegundos por consulta sobre hasta unos pocos miles de páginas en CPU, adecuado para back-office y auditoría.
- Auditoría de pipelines de recuperación: al conservar el adaptador printfix_anchor la calidad impresa a nivel de Hit@10 (0.6667) y ofrecer un CLI con `--no-adapter`, sirve para comparar sistemáticamente el comportamiento zero-shot frente al adaptado en un mismo corpus.
- Prototipado de búsqueda sobre corpus pequeños: con un almacenamiento de aproximadamente 0.23 MiB por página en fp16, un corpus de miles de páginas cabe en memoria y permite iterar sin infraestructura dedicada.

## Benchmarks y rendimiento

Resultados de selección (conjunto de 24 páginas y 178 pares, disjunto del entrenamiento):

| Sistema | Tensores | MRR@10 manuscrito | MRR@10 impreso | Hit@10 impreso |
|---|---:|---:|---:|---:|
| Base zero-shot | — | 0.2106 | 0.3563 | 0.6667 |
| printfix_dense (por defecto) | 2 | 0.3675 | 0.3533 | 0.6667 |
| printfix_anchor | 146 | 0.4462 | 0.3081 | 0.6667 |
| LoRA simple (no distribuido) | 146 | 0.4406 | 0.2359 | 0.6042 |

Resultado en el conjunto bloqueado v3 (50 páginas, 22 consultas, ejecución única preregistrada):

| Sistema | Hit@10 global | Manuscrito (10) | Impreso (12) | MRR@10 global |
|---|---:|---:|---:|---:|
| Zero-shot fresco | 17/22 | 6/10 | 11/12 | 0.4706 |
| printfix_dense | 19/22 | 8/10 | 11/12 | 0.6542 |

El veredicto preregistrado se cumple (verdict.passed = true); en ese conjunto el MRR del bloque impreso sube de 0.5544 a 0.6708. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo base es de 256M de parámetros y los adaptadores añaden 2 o 146 tensores, por lo que la huella es reducida y cabe en GPU de consumo.
- GPU recomendadas: no se especifican; el autor documenta y valida el uso en CPU y menciona `--device cuda:0` como opción del CLI.
- Cabe en GPU de consumo: sí, por el tamaño del modelo base (256M), aunque no se publican cifras de VRAM.
- Opciones de despliegue: CLI propio `colsmol_adapter_cli.py` con sentence-transformers, torch, peft, safetensors y Pillow; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en CPU, aproximadamente 6 a 13 segundos por página en indexación y decenas de milisegundos por consulta para hasta unos pocos miles de páginas; almacenamiento de aproximadamente 0.23 MiB por página en fp16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Adiutant/colsmol-printfix-lora | Base 256M + adaptadores de 2 o 146 tensores | No disponible | Recuperación visual multi-vector con late interaction, adaptada a formularios rusos mixtos | MIT (adaptadores) | Hugging Face |
| vidore/colSmol-256M | 256M | No disponible | Recuperación visual multi-vector con late interaction, zero-shot | ColSmol MIT / SmolVLM Apache-2.0 | Hugging Face |
| ColPali (familia) | No disponible en la información proporcionada | No disponible | Recuperación visual de documentos con late interaction sobre backbone mayor | No disponible | Hugging Face |

No se dispone de datos suficientes en la información proporcionada para comparar rendimiento numérico con alternativas de la misma categoría.

## Limitaciones y advertencias

- La evaluación bloqueada es pequeña: 50 páginas, 22 consultas y una única ejecución registrada; los números deben tratarse como evidencia, no como garantía.
- Dominio restringido a formularios bancarios y administrativos rusos escaneados con mezcla de impreso y manuscrito; no se han medido otros idiomas, maquetaciones ni capturas fotográficas.
- Los documentos se tratan como páginas completas, no como recortes de campo; los campos muy pequeños en páginas densas son el caso difícil.
- Los adaptadores asumen la revisión exacta del modelo base (`c79b633e17e060cc109b11aa2bf92a1517d3bd6f`); otra revisión se rechaza.
- printfix_anchor recupera el Hit@10 impreso al nivel zero-shot, pero su MRR impreso queda por debajo (0.308 frente a 0.356); si la calidad en impreso es prioritaria, debe usarse printfix_dense.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de falsos positivos en la recuperación: el sistema devuelve páginas candidatas, no verifica el contenido del campo.
- Sesgos conocidos: no documentados; el corpus de entrenamiento es interno y no se publica su composición más allá de los recuentos agregados.
- Restricciones de licencia: los adaptadores son MIT, pero el modelo base mantiene su propia licencia y debe revisarse su model card antes de uso comercial.
- La reproducibilidad depende de los sidecar JSON; sin ellos no es posible reconstruir el entrenamiento exacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Adiutant/colsmol-printfix-lora
- Modelo base: https://huggingface.co/vidore/colSmol-256M
- No se han encontrado en la información disponible otros enlaces a papers, blogs, repositorios o demos.
