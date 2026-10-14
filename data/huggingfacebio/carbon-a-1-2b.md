# HuggingFaceBio/Carbon-A-1.2B

## Resumen

Carbon-A-1.2B es un modelo de anotación de ADN desarrollado por el equipo HuggingFaceBio de Hugging Face, publicado el 2 de octubre de 2026 bajo licencia Apache 2.0. El modelo predice secuencias codificantes de proteínas (CDS) a resolución de base única en genomas eucariotas, generando probabilidades independientes para la hebra directa y la hebra reversa, lo que permite preservar regiones codificantes que se solapan en hebras opuestas. No es un modelo de lenguaje general: es un clasificador de tokens especializado en genómica.

Se trata de un transformer de 1.153.656.832 parámetros (aproximadamente 1,2B) con dos cabezas de clasificación específicas por hebra. Utiliza un tokenizador de 6-mers no solapados, de modo que cada token de ADN representa seis bases, con una longitud de secuencia de 16.384 tokens equivalente a 98.304 pares de bases (bp). Se distribuye con un pipeline de anotación en el propio repositorio que convierte las probabilidades por base en modelos de genes con una puntuación de confianza por gen.

Su relevancia actual radica en que ofrece anotación de genomas eucariotas completa y abierta, entrenada sobre 2.055 ensamblados RefSeq GCF (2.047 especies) que cubren mamíferos, otros vertebrados, invertebrados, plantas, hongos y protozoos. Con solo 1,2B de parámetros y pesos de 4,6 GB se puede ejecutar en hardware de gama consumer, y el pipeline asociado produce directamente ficheros GFF con CDS, proteínas y probabilidades crudas, además de métricas de evaluación contra anotaciones de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con dos cabezas de clasificación específicas por hebra (forward y reverse) |
| Parametros totales | 1.153.656.832 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens (98.304 bp); el pipeline procesa registros más largos en ventanas con solape de 1.024 tokens (6.144 bp) |
| Tipos de cuantizacion | No disponible (los resultados publicados usan BF16) |
| Idiomas soportados | ADN (genómico); pipeline con tabla de código genético configurable (estándar por defecto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tokenizador | 6-mers no solapados (cada token = 6 bases) |
| Interfaz Transformers | `AutoModelForTokenClassification` con `trust_remote_code=True`; requiere Transformers 4.56 o superior, incluido 5.x. FlashAttention-2 requiere Transformers 4.x |
| Pipeline | token-classification (`generanno` / custom_code) |
| Tamano del repositorio | 4,6 GB |
| Descargas / likes | 286 descargas, 16 likes |

## Arquitectura y entrenamiento

Carbon-A-1.2B es un transformer encoder de tipo clasificación de tokens con dos cabezas de salida independientes, una por hebra de ADN. En lugar de tratar el genoma como una única secuencia, el modelo emite probabilidades por base para las clases "no codificante" y "CDS" en cada hebra, lo que permite representar genes que se solapan en hebras opuestas, un caso que los modelos de una sola hebra no pueden resolver. La entrada se tokeniza con 6-mers no solapados, reduciendo la longitud efectiva de secuencia a un sexto del número de bases, con una ventana de 16.384 tokens (98.304 bp). Para genomas de mayor tamaño, el pipeline lee el fichero en ventanas solapadas 1.024 tokens y promedia las predicciones en las zonas de solape.

El entrenamiento se realizó sobre 2.055 ensamblados RefSeq GCF que abarcan 2.047 especies de mamíferos, otros vertebrados, invertebrados, plantas, hongos y protozoos, lo que dota al modelo de cobertura amplia del árbol eucariota. La inferencia de referencia se ejecuta en BF16 con FlashAttention-2; el autor indica que la alternativa PyTorch SDPA (`--attn-implementation sdpa`) no requiere instalar FlashAttention, pero sus probabilidades no son idénticas bit a bit. No se detallan en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO (en cualquier caso, poco habituales en un modelo de clasificación genómica).

## Capacidades

- Predicción de secuencias codificantes de proteínas (CDS) a resolución de base única en genomas eucariotas.
- Salida de probabilidades separadas para hebra directa y hebra reversa, preservando genes solapados en hebras opuestas.
- Clasificación por token con la interfaz estándar `AutoModelForTokenClassification` de Transformers.
- Pipeline de anotación incluido que convierte probabilidades en modelos de genes: genes, mRNAs y CDS en formato GFF, con puntuación de confianza por gen.
- Exportación de secuencias: ficheros `prediction.fna` (CDS) y `prediction.faa` (proteínas).
- Volcado de probabilidades crudas por base en formato `*.raw_probs.parquet`.
- Lectura de entradas en FASTA o GenBank, opcionalmente comprimidas con gzip.
- Soporte de tablas de código genético configurables mediante `--codon-table`; detección automática de la tabla 6 para *Tetrahymena thermophila* (GCF_000189635.1) y aviso ante posible desajuste de tabla.
- Evaluación contra anotación de referencia y BUSCO a través del pipeline.
- No se documentan capacidades de tool calling, agentes, visión, audio ni razonamiento multi-paso: es un modelo especializado de anotación genómica.

## Casos de uso

- Anotación de genomas eucariotas recién ensamblados: dado un ensamblado en FASTA o GenBank (incluso gzip), el pipeline produce un GFF con genes, mRNAs y CDS anotados y una confianza por gen, sustituyendo anotaciones manuales lentas en proyectos de genómica.
- Anotación de genomas de referencia en proyectos de secuenciación a gran escala: al cubrir 2.047 especies de mamíferos, vertebrados, invertebrados, plantas, hongos y protozoos, es adecuado para lotes heterogéneos de ensamblados sin reentrenamiento específico.
- Detección de genes solapados en hebras opuestas: gracias a las dos cabezas por hebra, resulta útil en genomas compactos y ricos en solapes, donde los anotadores de una sola hebra fallan.
- Extracción de CDS y proteínas para pipelines de anotación funcional: los ficheros `prediction.fna` y `prediction.faa` alimentan directamente análisis downstream (búsquedas de homología, anotación de dominios, comparativas de proteoma).
- Evaluación y control de calidad de anotaciones existentes: la confianza por gen y las métricas del pipeline permiten comparar con anotaciones de referencia y priorizar revisiones manuales.
- Procesamiento en local sobre GPU de gama consumer: con 4,6 GB de pesos y ventanas de 98.304 bp en BF16, se puede anotar genomas en una estación de trabajo sin depender de clústeres grandes.
- Generación de bases de datos de anotación a escala (tipo CADB): el modelo es la base para construir bases de datos de anotación genómica masivas de forma reproducible y abierta.
- Ajuste fino específico de taxón: al ser un modelo de 1,2B con licencia Apache 2.0, se puede reentrenar o afinar sobre linajes concretos con recursos moderados.

## Benchmarks y rendimiento

La información disponible incluye un único conjunto de métricas de evaluación, obtenidas sobre el genoma de levadura *Saccharomyces cerevisiae* S288C (GCF_000146045.2) comparando con la anotación de NCBI:

| Metrica | Valor |
|---|---|
| F1 a nivel de nucleotido | 0.998 |
| F1 a nivel de exón | 0.943 |
| F1 a nivel de gen | 0.953 |

No se han publicado en la información disponible resultados de benchmarks tipo MMLU, HumanEval o GSM8K (no aplicables a un modelo de anotación genómica). Tampoco se proporcionan métricas comparativas frente a otros anotadores en esta información.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 2,5-3 GB solo para pesos (1,2B parámetros), más memoria para activaciones y ventanas de 16.384 tokens. En la práctica, menos de 8 GB en la mayoría de configuraciones.
- Los pesos ocupan 4,6 GB en el repositorio (formato safetensors); se descargan a la caché de Hugging Face en el primer uso.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y suficiente VRAM. Para FlashAttention-2 (configuración de referencia en BF16) se necesita una GPU Ampere o superior; alternativamente, PyTorch SDPA funciona sin FlashAttention instalado.
- Cabe en GPU consumer: sí. Una RTX 3060 de 12 GB, RTX 4070, RTX 4090 o similares son suficientes; el modelo es pequeño para los estándares actuales.
- Entorno de ejecución: Linux, Python 3.10 o superior, PyTorch con compilación CUDA y un compilador de C++ con OpenMP (se recomienda GCC; por ejemplo `build-essential` en Debian/Ubuntu).
- Opciones de despliegue: el pipeline de anotación del propio repositorio (`annotation_pipeline/run_annotation.sh`), con FlashAttention-2 o PyTorch SDPA. No se documentan en la información disponible integraciones con vLLM, llama.cpp, Ollama o TGI (el modelo es un clasificador de tokens, no un generador de texto, por lo que estos servidores de inferencia generativa no son directamente aplicables).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Los modelos comparables de la misma categoría (anotación genómica / clasificación de tokens sobre ADN) incluyen anotadores como GenAnnO, así como modelos de representación de ADN del estilo Nucleotide Transformer o DNABERT-2. Sin embargo, la información proporcionada no incluye especificaciones ni resultados de benchmark de estos modelos, por lo que la comparación cuantitativa no está disponible.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Carbon-A-1.2B | 1,15B | 16.384 tokens (98.304 bp) | Anotación CDS por base, dos hebras | Apache 2.0 | Hugging Face, pesos safetensors |
| GenAnnO | no disponible | no disponible | Anotación genómica | no disponible | no disponible |
| Otros anotadores eucariotas | no disponible | no disponible | Anotación de genes | no disponible | no disponible |

## Limitaciones y advertencias

- Es un modelo especializado en ADN eucariota; no es un modelo de lenguaje general y no debe usarse para tareas de texto, código o razonamiento.
- La cobertura de entrenamiento se limita a genomas eucariotas (mamíferos, vertebrados, invertebrados, plantas, hongos y protozoos); el rendimiento en procariotas, virus o linajes no representados no está documentado.
- Las métricas publicadas corresponden a un único genoma (levadura S. cerevisiae) y no se aportan resultados para otros taxones en la información disponible.
- La puntuación de confianza por gen no es una garantía de corrección estructural; el autor indica que los resultados reportados cuentan solo los genes con confianza de al menos 0,1, lo que implica que se escriben genes por debajo de ese umbral y conviene filtrarlos.
- Posible desajuste de tabla de código genético en organismos con códigos alternativos: el pipeline lo detecta de forma automática y añade avisos, pero requiere revisión manual.
- El pipeline de anotación solo funciona en Linux y necesita un compilador de C++ con OpenMP; no es un despliegue puramente Python.
- FlashAttention-2 requiere Transformers 4.x; en Transformers 5.x hay que usar SDPA, cuyas probabilidades no son idénticas bit a bit a las de referencia.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones de las anotaciones de referencia (NCBI/RefSeq) empleadas en la evaluación.
- No se documentan sesgos en el sentido de modelos de lenguaje, pero sí puede existir sesgo de representación taxonómica derivado de la composición del dataset de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HuggingFaceBio/Carbon-A-1.2B
- Árbol de ficheros del repositorio: https://huggingface.co/HuggingFaceBio/Carbon-A-1.2B/tree/main
- Bucket de datos de entrenamiento/evaluación (Carbon-A-training-data): https://huggingface.co/buckets/HuggingFaceBio/Carbon-A-training-data
- Genoma de referencia de levadura usado en la prueba (GCF_000146045.2): https://huggingface.co/buckets/HuggingFaceBio/Carbon-A-training-data/resolve/eval/seen/GCF_000146045.2
- Nota de prensa en AGI Hunt: https://agihunt.info/en/p/1a13173dc89181bb64af587d6f8
- Cobertura en kga-it.com: https://kga-it.com/en/blog/carbon-a-hugging-face-genes-genomas
