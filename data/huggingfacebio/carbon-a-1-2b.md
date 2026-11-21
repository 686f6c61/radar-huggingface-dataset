# HuggingFaceBio/Carbon-A-1.2B

## Resumen

Carbon-A-1.2B es un modelo de anotación de ADN desarrollado por HuggingFaceBio (colaboración entre Hugging Face y Zhongguancun Academy, con contribuciones de Tsinghua University, el Institute of Bio-Architecture and Bio-Interactions, la Affiliated High School of Peking University, el Telethon Institute of Genetics and Medicine y la University of Naples "Federico II"). Su tarea es predecir secuencias codificantes de proteína (CDS) a resolución de base única en genomas eucariotas, generando probabilidades separadas para la hebra directa y la reversa, lo que permite preservar regiones codificantes que se solapan en hebras opuestas.

El modelo tiene 1.153.656.832 parámetros (1,2B) y emplea una arquitectura transformer con dos cabezas de clasificación específicas por hebra. Utiliza un tokenizador de 6-mers no solapados (cada token representa seis bases) y una longitud de secuencia de 16.384 tokens, equivalente a 98.304 pares de bases. Se distribuye bajo licencia Apache 2.0 con pesos en safetensors y código personalizado, y se integra en Transformers mediante `AutoModelForTokenClassification` con `trust_remote_code=True`.

Su relevancia radica en que sustituye pipelines de anotación genómica tradicionales basados en alineamiento y modelos ocultos de Markov por un modelo neuronal end-to-end que produce modelos de gen con una puntuación de confianza por gen, y que ha demostrado una F1 de nucleótido de 0,998 en el genoma de levadura de referencia. El repositorio incluye un pipeline de anotación completo que lee FASTA y GenBank (opcionalmente comprimidos con gzip) y genera GFF, secuencias CDS y proteínas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con dos cabezas de clasificación específicas por hebra (token-classification) |
| Parámetros totales | 1.153.656.832 (1,2B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens (98.304 bp); ventanas con solapamiento de 1.024 tokens (6.144 bp) |
| Tipos de cuantización | No disponible (los resultados reportados usan BF16) |
| Idiomas soportados | ADN (genómico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repo: 4,6 GB) |

## Arquitectura y entrenamiento

Carbon-A-1.2B es un transformer encoder con dos cabezas de clasificación a nivel de token, una para la hebra directa y otra para la reversa. La tokenización se realiza mediante 6-mers no solapados, de modo que cada token representa seis bases y la ventana de 16.384 tokens cubre 98.304 bp. El pipeline de anotación procesa registros más largos en ventanas solapadas de 1.024 tokens (6.144 bp) y promedia las predicciones en las zonas de solapamiento. La salida son probabilidades por base para no codificante y CDS en cada hebra, que el pipeline decodifica en modelos de gen (genes, mRNAs y CDS) con una puntuación de confianza por gen.

El entrenamiento se realizó sobre 2.055 ensamblados RefSeq GCF (2.047 taxones) que cubren mamíferos, otros vertebrados, invertebrados, plantas, hongos y protozoos. La inferencia reportada usa BF16 con FlashAttention-2; la alternativa PyTorch SDPA (`--attn-implementation sdpa`) no requiere instalar FlashAttention, pero sus probabilidades no son idénticas bit a bit. El pipeline usa el código genético estándar por defecto, permite otro mediante `--codon-table`, aplica automáticamente la tabla 6 a *Tetrahymena thermophila* (GCF_000189635.1) y detecta desajustes probables de tabla de codones, añadiendo un aviso en `results/WARNINGS.txt` y renombrando el directorio de resultados a `<accession>_WARNING`. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF/DPO.

## Capacidades

- Predicción de CDS a resolución de base única en genomas eucariotas, con probabilidades separadas para hebra directa y reversa.
- Preservación de regiones codificantes solapadas en hebras opuestas.
- Producción de modelos de gen (genes, mRNAs, CDS) con puntuación de confianza por gen.
- Generación de secuencias CDS (`prediction.fna`) y proteínas (`prediction.faa`).
- Lectura de FASTA y GenBank, opcionalmente comprimidos con gzip.
- Procesamiento de genomas completos mediante ventanas solapadas de 98.304 bp.
- Soporte de tablas de código genético alternativas (`--codon-table`) con detección automática de desajustes.
- Evaluación integrada contra anotaciones de referencia y evaluación BUSCO.
- Exportación de probabilidades por base en formato Arrow o Parquet.
- No soporta tool calling, agentes, visión, audio ni generación de texto libre: es un modelo especializado de token-classification sobre ADN.

## Casos de uso

- Anotación de genomas eucariotas recién ensamblados: el pipeline procesa un FASTA completo en ventanas de 98.304 bp con solapamiento de 6.144 bp y genera un GFF con genes, mRNAs y CDS, además de las secuencias proteicas traducidas, lo que permite obtener una anotación inicial sin depender de alineamiento contra bases de datos.
- Anotación de genomas con hebras solapadas: al producir probabilidades independientes por hebra, el modelo conserva regiones codificantes que se solapan en hebras opuestas, un escenario problemático para pipelines que asumen una única hebra por locus.
- Priorización de genes por confianza: cada gen del GFF incluye una puntuación `confidence` derivada del modelo, de modo que los equipos pueden filtrar por umbral (los resultados reportados cuentan genes con confianza ≥ 0,1) y centrar la validación experimental en las predicciones de menor confianza.
- Reanotación y control de calidad de ensamblados: la evaluación integrada contra anotaciones NCBI (`run_evaluation.sh`) permite comparar la predicción con la referencia y calcular F1 de nucleótido, exón y gen, útil en pipelines de QC de ensamblados.
- Análisis de genomas no modelo: el entrenamiento sobre 2.047 taxones de mamíferos, vertebrados, invertebrados, plantas, hongos y protozoos permite aplicar el modelo a organismos sin anotación curada disponible.
- Extracción de proteínas para análisis downstream: `prediction.faa` proporciona el proteoma predicho, que puede alimentar búsquedas de homología, anotación funcional o estudios filogenéticos.
- Evaluación de completitud con BUSCO: el pipeline documenta la evaluación BUSCO, lo que permite medir la completitud de la anotación generada dentro del mismo flujo de trabajo.
- Investigación en genómica comparativa: las probabilidades por base exportadas en Arrow o Parquet permiten análisis posteriores a nivel de base, como estudios de señales de selección o comparación de regiones codificantes entre especies.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el genoma de levadura de referencia (GCF_000146045.2), comparando la predicción con la anotación NCBI:

| Métrica | Valor |
|---|---|
| F1 de nucleótido | 0,998 |
| F1 de exón | 0,943 |
| F1 de gen | 0,953 |

No se han publicado en la información disponible resultados de benchmarks comparativos con otros modelos de anotación genómica ni métricas sobre otros genomas del conjunto de evaluación.

## Requisitos de hardware

- Pesos del modelo: 4,6 GB en safetensors; la inferencia reportada usa BF16.
- VRAM estimada para inferencia: no disponible de forma explícita; los pesos en BF16 ocupan aproximadamente 2,3 GB, a lo que hay que sumar activaciones y memoria de atención para ventanas de 16.384 tokens.
- GPU recomendadas: no disponible. El pipeline requiere una build CUDA de PyTorch para inferencia en GPU.
- Cabe en GPU de consumo: no confirmado en la información disponible; el tamaño de pesos en BF16 es compatible con GPUs de consumo con suficiente VRAM, pero no se documentan requisitos mínimos.
- Opciones de despliegue: Transformers (`AutoModelForTokenClassification` con `trust_remote_code=True`, Transformers 4.56 o posterior, incluido 5.x) y el pipeline de anotación del repositorio (`run_annotation.sh`). FlashAttention-2 requiere Transformers 4.x; PyTorch SDPA es la alternativa sin FlashAttention.
- Requisitos del pipeline: Linux, Python 3.10 o posterior, PyTorch, compilador de C++ con OpenMP (se recomienda GCC, p. ej. `build-essential` en Debian/Ubuntu).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de anotación genómica ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- Modelo especializado en anotación de ADN: no es un modelo de lenguaje general; no genera texto, no soporta tool calling ni razonamiento multi-step.
- Solo procesa ADN genómico; no admite otros idiomas ni modalidades.
- La ventana máxima es de 16.384 tokens (98.304 bp); los genomas más largos se procesan en ventanas solapadas y las predicciones se promedian en las zonas de solapamiento, lo que puede introducir artefactos en los bordes.
- Las probabilidades con PyTorch SDPA no son idénticas bit a bit a las obtenidas con FlashAttention-2.
- El pipeline usa el código genético estándar por defecto; un desajuste de tabla de codones puede degradar la traducción, aunque el pipeline lo detecta y avisa.
- Los resultados reportados cuentan únicamente genes con confianza ≥ 0,1; los genes por debajo de ese umbral se escriben en el GFF pero no se incluyen en las métricas.
- No se documentan sesgos taxonómicos más allá de la composición del conjunto de entrenamiento (2.047 taxones), ni tasas de alucinación o falsos positivos por tipo de organismo.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y atribución correspondiente.
- El pipeline de anotación solo se ha documentado para Linux.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HuggingFaceBio/Carbon-A-1.2B
- Pipeline de anotación (README): https://huggingface.co/HuggingFaceBio/Carbon-A-1.2B/blob/main/annotation_pipeline/README.md
- Bucket de datos de entrenamiento y evaluación: https://huggingface.co/buckets/HuggingFaceBio/Carbon-A-training-data
- Informe técnico de Carbon-A (bioRxiv): https://www.biorxiv.org/content/10.64898/2026.10.20.760448v1
- Hugging Face: https://huggingface.co/
- Zhongguancun Academy: https://www.bza.edu.cn/en/
