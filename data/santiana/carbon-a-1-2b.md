# Santiana/Carbon-A-1.2B

## Resumen

Carbon-A-1.2B es un modelo de anotación de ADN desarrollado por Santiana en colaboración con Hugging Face y la Zhongguancun Academy, con contribuciones de Tsinghua University, el Institute of Bio-Architecture and Bio-Interactions, el Affiliated High School of Peking University, el Telethon Institute of Genetics and Medicine y la University of Naples "Federico II". El modelo predice secuencias codificantes de proteína (CDS) a resolución de base única en genomas eucariotas, generando probabilidades independientes para la hebra directa y la hebra reversa, lo que permite preservar regiones codificantes que se solapan en hebras opuestas.

Con 1.153.656.832 parámetros (aproximadamente 1,2B), el modelo emplea una arquitectura transformer con dos cabezas de clasificación específicas por hebra. Utiliza un tokenizador de 6-mers no solapados, donde cada token representa seis bases de ADN, y procesa secuencias de 16.384 tokens, equivalentes a 98.304 pares de bases. Para genomas más largos, el pipeline de anotación lee los registros en ventanas que se solapan 1.024 tokens (6.144 pb).

El modelo es relevante porque aborda una tarea fundamental en genómica —la anotación de genes— con una aproximación de aprendizaje profundo que mantiene la resolución de base única y distingue ambas hebras, algo que muchos enfoques previos no lograban. Se distribuye bajo licencia Apache 2.0 y se integra en el ecosistema Transformers mediante `AutoModelForTokenClassification` con `trust_remote_code=True`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con dos cabezas de clasificación específicas por hebra |
| Parametros totales | 1.153.656.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens (98.304 pb) |
| Tipos de cuantizacion | no disponible (inferencia reportada en BF16) |
| Idiomas soportados | no disponible (modelo de dominino biológico, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Carbon-A-1.2B es un transformer con dos cabezas de clasificación separadas para la hebra directa y la hebra reversa, lo que permite generar probabilidades por base para regiones no codificantes y CDS en cada hebra de forma independiente. El tokenizador emplea 6-mers no solapados, de modo que cada token de entrada representa seis bases de ADN; esto reduce la longitud efectiva de la secuencia a procesar y permite cubrir 98.304 pb con la ventana de 16.384 tokens. La inferencia reportada se realizó en BF16 con FlashAttention-2; también se soporta PyTorch SDPA (`--attn-implementation sdpa`), aunque sus probabilidades no son idénticas bit a bit.

El entrenamiento utilizó 2.055 ensamblados RefSeq GCF (2.047 taxones) que abarcan mamíferos, otros vertebrados, invertebrados, plantas, hongos y protozoos. La model card no detalla el número total de tokens de entrenamiento ni la composición exacta del dataset más allá de la procedencia taxonómica, ni menciona explícitamente etapas de RLHF o DPO. La innovación técnica destacable es la predicción a resolución de base única con preservación de regiones codificantes solapadas en hebras opuestas, junto con un pipeline de anotación que convierte las probabilidades en modelos de gen con una puntuación de confianza por gen.

## Capacidades

- Predicción de secuencias codificantes de proteína (CDS) a resolución de base única en genomas eucariotas.
- Generación de probabilidades independientes para hebra directa y hebra reversa, preservando regiones codificantes solapadas en hebras opuestas.
- Salida de probabilidades por base para regiones no codificantes y CDS en cada hebra.
- Integración con el pipeline de anotación del repositorio, que produce modelos de gen (genes, mRNAs y CDS) con una puntuación de confianza por gen.
- Lectura de archivos FASTA y GenBank, opcionalmente comprimidos con gzip.
- Procesamiento de genomas largos mediante ventanas solapadas de 98.304 pb con solapamiento de 6.144 pb y promediado de predicciones.
- Uso del código genético estándar por defecto y soporte de tablas de codones alternativas mediante `--codon-table`; detección automática de desajustes probables de tabla de codones.
- Generación de secuencias de CDS y proteínas en formatos FASTA (`prediction.fna`, `prediction.faa`).
- Exportación de probabilidades crudas por base en formato Arrow o Parquet.
- Evaluación basada en referencia y evaluación BUSCO a través del pipeline.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni multilingüismo; el modelo es específico de genómica.

## Casos de uso

- Anotación de genomas eucariotas recién secuenciados: el pipeline lee un FASTA o GenBank y genera modelos de gen con puntuación de confianza, adecuado para genomas de mamíferos, vertebrados, invertebrados, plantas, hongos y protozoos gracias al entrenamiento sobre 2.047 taxones.
- Anotación de genomas con regiones codificantes solapadas en hebras opuestas: las dos cabezas específicas por hebra permiten preservar CDS que se solapan, un caso que enfoques de una sola hebra tienden a perder.
- Procesamiento de genomas largos por ventanas: con 98.304 pb por ventana y solapamiento de 6.144 pb, el pipeline promedia predicciones en las zonas de solapamiento, lo que permite anotar cromosomas completos sin truncar el contexto.
- Evaluación comparativa frente a anotaciones de referencia: el pipeline incluye `run_evaluation.sh` para calcular métricas de nucleótido, exón y gen frente a anotaciones NCBI, útil en validación de pipelines de anotación.
- Control de calidad mediante evaluación BUSCO: el pipeline describe evaluación BUSCO, lo que permite comprobar la completitud de la anotación génica en genomas nuevos.
- Anotación de genomas con códigos genéticos alternativos: el soporte de `--codon-table` y la detección automática de desajustes (con aviso en `results/WARNINGS.txt`) facilitan el uso en organismos como *Tetrahymena thermophila* (tabla 6).
- Extracción de proteínas predichas para análisis downstream: la generación de `prediction.faa` permite alimentar pipelines de anotación funcional, búsqueda de homología o análisis de dominios proteicos.
- Investigación en genómica comparativa: las probabilidades crudas por base (`*.raw_probs.arrow` o `*.raw_probs.parquet`) permiten análisis personalizados más allá de los modelos de gen finales.

## Benchmarks y rendimiento

La model card reporta resultados del pipeline sobre el genoma de levadura (*Saccharomyces cerevisiae*, GCF_000146045.2) comparado con la anotación de NCBI:

| Metrica | Valor |
|---|---|
| F1 de nucleotido | 0,998 |
| F1 de exon | 0,943 |
| F1 de gen | 0,953 |

No se han publicado en la información disponible resultados de benchmarks comparativos con otros modelos de anotación genómica (por ejemplo, MMLU, HumanEval o GSM8K no aplican a este dominio).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1,2B parámetros en BF16 los pesos ocupan aproximadamente 2,3 GB, y el repositorio ocupa 4,6 GB en total. El pipeline requiere además memoria para procesar ventanas de 16.384 tokens y para el decodificado de estructuras génicas.
- GPU recomendadas: no especificadas en la model card; se reporta inferencia en BF16 con FlashAttention-2, lo que requiere una GPU compatible con FlashAttention-2 (arquitecturas Ampere o posteriores, como A100, H100 o RTX 4090).
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño de 1,2B parámetros, aunque la model card no confirma modelos concretos ni requisitos mínimos de VRAM.
- Opciones de despliegue: el repositorio proporciona un pipeline propio (`annotation_pipeline/run_annotation.sh`) sobre PyTorch, con soporte de FlashAttention-2 o PyTorch SDPA. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.
- Requisitos de entorno: Linux, Python 3.10 o superior, PyTorch (build CUDA para GPU) y compilador de C++ con OpenMP (se recomienda GCC, por ejemplo `build-essential` en Debian o Ubuntu). Transformers 4.56 o superior, incluida la serie 5.x; FlashAttention-2 requiere Transformers 4.x.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos sobre modelos comparables de anotación de ADN (parámetros, contexto, rendimiento, licencia y disponibilidad). La model card no incluye una comparativa con alternativas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Carbon-A-1.2B | 1.153.656.832 | 16.384 tokens (98.304 pb) | Apache 2.0 | Hugging Face |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: el entrenamiento se limita a 2.055 ensamblados RefSeq GCF de 2.047 taxones de mamíferos, otros vertebrados, invertebrados, plantas, hongos y protozoos; el rendimiento en taxones fuera de esa cobertura (por ejemplo, procariotas o virus) no está documentado.
- Riesgo de alucinación: como modelo predictivo, puede generar modelos de gen incorrectos; el pipeline asigna una puntuación de confianza por gen y los resultados reportados cuentan solo genes con confianza de al menos 0,1, pero no se documenta una calibración formal de esa puntuación.
- Limitaciones de contexto: la ventana es de 16.384 tokens (98.304 pb); los genomas más largos se procesan por ventanas con solapamiento de 1.024 tokens (6.144 pb) y promediado, lo que puede introducir artefactos en las fronteras si las predicciones no son consistentes entre ventanas.
- Diferencias de precisión: la inferencia con PyTorch SDPA no produce probabilidades idénticas bit a bit a las de FlashAttention-2, según la model card.
- Código genético: el uso de una tabla de codones incorrecta puede degradar la anotación; el pipeline detecta desajustes probables y emite un aviso, pero la detección no es infalible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las licencias de los datos de entrenamiento (ensamblados RefSeq) para usos derivados.
- Caveats para producción: el pipeline requiere Linux, compilador C++ con OpenMP y, para FlashAttention-2, Transformers 4.x; la model card advierte que el pipeline de anotación se distribuye junto con el modelo y que los pesos se descargan en la caché de Hugging Face en el primer uso.
- Idiomas: no aplica; el modelo no es lingüístico y la model card no declara idiomas soportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Santiana/Carbon-A-1.2B
- Repositorio de datos de entrenamiento y evaluación (bucket): https://huggingface.co/buckets/HuggingFaceBio/Carbon-A-training-data
- Informe técnico de Carbon-A (bioRxiv): https://www.biorxiv.org/content/10.64898/2026.10.20.760448v1
- Hugging Face: https://huggingface.co/
- Zhongguancun Academy: https://www.bza.edu.cn/en/
