# quorumbio/biomedical-ner-gene-chemical-disease-species-small

## Resumen

`quorumbio/biomedical-ner-gene-chemical-disease-species-small` es un modelo de reconocimiento de entidades nombradas (NER) para texto biomédico en inglés, desarrollado por quorumbio. Etiqueta seis tipos de entidad: gen, compuesto químico, enfermedad, especie, variante y línea celular. Es una versión destilada y reducida del modelo completo `quorumbio/biomedical-ner-gene-chemical-disease-species`, pensada para entornos con recursos limitados (navegadores, CPU, alto volumen de peticiones).

El modelo parte de una arquitectura BERT de tipo transformer encoder, con 66,4 millones de parámetros y 6 capas de transformer (frente a 12 del modelo completo). Se distribuye en formato safetensors y ONNX (fp32 e int8 dinámico), con licencia Apache-2.0, lo que permite uso comercial sin restricciones de atribución más allá de las habituales.

Su relevancia radica en que ofrece un equilibrio entre precisión y coste computacional: el modelo completo tiene un F1 medio de validación de 0,894, mientras que esta versión alcanza 0,881 (una diferencia de 0,013), con un tiempo de inferencia en CPU de 8,61 ms por frase frente a 16,48 ms del modelo completo. Está diseñado para pipelines de extracción de información biomédica donde el throughput y la latencia importan más que unas décimas de F1.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder), 6 capas |
| Parámetros totales | 66.374.413 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | ONNX fp32, ONNX int8 dinámico; safetensors fp32 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (`onnx/model.onnx`, `onnx/model_quantized.onnx`) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de tipo BERT con 6 capas (frente a 12 del modelo completo) y 66,4 millones de parámetros. La cabeza de clasificación de tokens produce 13 etiquetas: `O` más las variantes `B-`/`I-` para cada uno de los seis tipos de entidad (Gene, Chemical, Disease, Species, Variant, CellLine).

El entrenamiento combina una inicialización por destilación estructural —se conservan las capas pares (2, 4, 6, 8, 10 y 12) de las 12 del modelo completo, partiendo así de pesos ya entrenados— con una pérdida mixta: `0.5 × partial-label loss + 0.5 × T² × KL(teacher || student)` con temperatura T=2, calculada sobre el primer subword de cada palabra. La `partial-label loss` trata una palabra `O` de un corpus como "ninguna de las entidades de ese corpus", permitiendo entrenar con datasets que anotan solo un subconjunto de los seis tipos. Los datos de entrenamiento provienen de los datasets BC5CDR, NCBI-disease, NLM-Gene y BioRED. El checkpoint final se seleccionó sobre validación (época 5), con un F1 medio de entidades de 0,881 sobre los cuatro conjuntos de validación.

## Capacidades

- Reconocimiento de entidades nombradas biomédicas en inglés con seis tipos: gen/proteína, compuesto químico, enfermedad, especie, variante y línea celular.
- Extracción de menciones con spans exactos y tipado (formato `B-`/`I-`/`O`, 13 etiquetas).
- Procesamiento de abstracts PubMed y texto científico en general (los datasets de entrenamiento son de PubMed y corpus biomédicos relacionados).
- Inferencia en navegador mediante `transformers.js` (tag `transformers.js` presente en el repositorio).
- Ejecución en CPU con latencia baja (8,61 ms por frase en la prueba del autor) gracias a la versión int8 de ONNX.
- Integración directa con el pipeline `token-classification` de Hugging Face Transformers.
- No dispone de tool calling, agentes, visión, audio ni modo de razonamiento multi-paso: es exclusivamente un clasificador de tokens.

## Casos de uso

- Extracción de entidades en abstracts PubMed a gran escala: el modelo procesa frases en 8,61 ms en CPU, lo que permite anotar millones de abstracts en clústeres modestos sin GPU. Adecuado para construir índices de literatura científica con genes, enfermedades y compuestos químicos enlazados.
- Anotación previa de corpus para entrenamiento de modelos mayores: al ser un modelo rápido y con F1 cercano al completo (diferencia de 0,013 en validación), sirve para pre-etiquetar grandes volúmenes de texto biomédico que luego se revisan manualmente.
- Enriquecimiento de bases de datos de farmacovigilancia: detección de compuestos químicos y enfermedades en informes de eventos adversos para alimentar sistemas de alerta temprana.
- Procesamiento de literatura en el navegador: la versión int8 de ONNX (66,8 MB) permite ejecutar la anotación de entidades directamente en el cliente mediante `transformers.js`, útil para herramientas de lectura asistida de artículos científicos sin enviar texto a un servidor.
- Construcción de grafos de conocimiento biomédicos: extracción de menciones de genes, variantes y enfermedades de artigos para poblar nodos y relaciones en bases como DisGeNET o similar.
- Filtrado y triaje de documentos en pipelines de revisión sistemática: clasificación rápida de abstracts que mencionan especies o líneas celulares concretas para priorizar la lectura por revisores humanos.
- Anotación de registros clínicos o notas de laboratorio en inglés: detección de variantes (`c.68_69delAG`) y líneas celulares (`HeLa`) en texto técnico, siempre que el dominio se ajuste al registro biomédico.

## Benchmarks y rendimiento

Resultados declarados por el autor (model-index). Las métricas son F1 de entidad con seqeval, tokenización propia por palabras, y solo se puntúan los tipos anotados por cada corpus; el propio autor advierte que no son comparables con números publicados.

| Test set | Tipos puntuados | P / R / F1 | Intervalo F1 95% |
|---|---|---|---|
| BC5CDR (500 abstracts) | Chemical, Disease | 0,860 / 0,895 / 0,877 | 0,867–0,887 |
| NCBI-disease (100 abstracts) | Disease | 0,850 / 0,887 / 0,869 | 0,845–0,891 |
| NLM-Gene (100 abstracts) | Gene | 0,905 / 0,925 / 0,915 | 0,896–0,930 |
| BioRED (100 abstracts) | Chemical, Disease, Gene, Species, Variant, CellLine | 0,873 / 0,892 / 0,882 | 0,864–0,901 |

Comparación con el modelo completo (mismo pipeline y scoring):

| Test set | Este modelo | Modelo completo | Diferencia |
|---|---|---|---|
| BC5CDR | 0,877 | 0,888 | −0,011 |
| NCBI-disease | 0,869 | 0,865 | +0,004 |
| NLM-Gene | 0,915 | 0,933 | −0,018 |
| BioRED | 0,882 | 0,898 | −0,016 |

Desglose por tipo en BioRED (parcial, según la información disponible):

| Tipo | Menciones | P / R / F1 | Intervalo F1 95% |
|---|---|---|---|
| Gene | 1180 | 0,891 / 0,892 / 0,891 | 0,864–0,917 |
| Chemical | 754 | 0,869 / 0,879 / 0,874 | 0,831–0,913 |

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (modelo de 66,4 M parámetros); aproximadamente 67 MB en int8 ONNX para los pesos.
- GPU recomendadas: innecesarias para uso típico; cualquier GPU consumer (RTX 3060, RTX 4090) puede servir para lotes grandes. En entornos de servidor, A100/H100 son sobredimensionadas para este modelo salvo despliegues masivos.
- Cabe holgadamente en GPU consumer y también en CPU. El autor reporta 8,61 ms por frase en CPU con la versión int8 (16,48 ms con el modelo completo).
- Opciones de despliegue: pipeline `token-classification` de Transformers, ONNX Runtime (`onnx/model.onnx` fp32 o `onnx/model_quantized.onnx` int8), `transformers.js` para navegador. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un encoder de clasificación de tokens).
- Throughput estimado: no disponible más allá de la latencia por frase reportada.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipos de entidad | Licencia | F1 declarado | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (small) | 66,4 M | 6 (Gene, Chemical, Disease, Species, Variant, CellLine) | Apache-2.0 | 0,877 BC5CDR / 0,882 BioRED | Hugging Face, ONNX, transformers.js |
| `quorumbio/biomedical-ner-gene-chemical-disease-species` (completo) | no disponible (12 capas) | 6 (los mismos) | Apache-2.0 | 0,888 BC5CDR / 0,898 BioRED | Hugging Face |
| Modelos NER biomédicos BERT-base genéricos | ~110 M (típico) | variable según corpus | variable | no disponible en esta información | Hugging Face |

La comparación con alternativas de terceros no puede completarse con datos verificados en la información proporcionada; los números del modelo completo proceden del mismo autor y pipeline.

## Limitaciones y advertencias

- Solo procesa texto en inglés; no se declara soporte multilingüe.
- La longitud máxima de contexto no está especificada en la información disponible; al ser un BERT, se espera el límite típico de 512 tokens, pero este dato no se confirma.
- Las métricas declaradas no son comparables con números publicados: usan tokenización propia por palabras, scoring restringido a los tipos de cada corpus e intervalo de confianza bootstrap. El autor lo advierte explícitamente.
- Pérdida de precisión respecto al modelo completo: −0,011 en BC5CDR, −0,018 en NLM-Gene y −0,016 en BioRED; NCBI-disease mejora ligeramente (+0,004).
- Riesgo de alucinación de spans: al ser un clasificador de tokens, puede generar entidades mal delimadas o tipadas incorrectamente en texto fuera del dominio de entrenamiento (por ejemplo, registros clínicos con jerga no vista).
- Sesgos potenciales derivados de los corpus de entrenamiento (PubMed, BioRED, BC5CDR, NCBI-disease, NLM-Gene): sobrerrepresentación de ciertas especies de laboratorio, líneas celulares comunes y nomenclatura de genes humana/murina.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene revisar las licencias de los datasets subyacentes (bigbio/bc5cdr, ncbi/ncbi_disease, bigbio/nlm_gene, bigbio/biored) si se redistribuyen datos derivados.
- No es un modelo generativo: no sirve para responder preguntas ni razonar; su única salida es la clasificación de tokens.
- Advertencia de producción: los intervalos de confianza al 95% en NCBI-disease (0,845–0,891) y BioRED (0,864–0,901) indican variabilidad apreciable entre muestras; conviene monitorizar el F1 en datos propios antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/quorumbio/biomedical-ner-gene-chemical-disease-species-small
- Modelo completo (base): https://huggingface.co/quorumbio/biomedical-ner-gene-chemical-disease-species
- Dataset BC5CDR: https://huggingface.co/datasets/bigbio/bc5cdr
- Dataset NCBI-disease: https://huggingface.co/datasets/ncbi/ncbi_disease
- Dataset NLM-Gene: https://huggingface.co/datasets/bigbio/nlm_gene
- Dataset BioRED: https://huggingface.co/datasets/bigbio/biored
