# panitagorontalo/nllb-200-gorontalo-bi-600M

## Resumen

`panitagorontalo/nllb-200-gorontalo-bi-600M` es un modelo de traducción automática neuronal bidireccional entre indonesio (`ind_Latn`) y gorontalo (`gor_Latn`, también llamado *bahasa Hulontalo*), una lengua austronesia de bajos recursos hablada en la provincia de Gorontalo (Indonesia). Lo desarrolla Panita Research Gorontalo como parte de una iniciativa de preservación digital del idioma, y se construye mediante ajuste fino completo sobre `facebook/nllb-200-distilled-600M`, al que se le añade un token de idioma específico `gor_Latn` (ID 256204) inicializado a partir del centroide de lenguas austronesias emparentadas (`ind_Latn`, `bug_Latn`, `tgl_Latn`, `ceb_Latn`).

La relevancia del modelo radica en que NLLB-200 estándar no cubre el gorontalo, de modo que la traducción zero-shot era prácticamente inutilizable (SacreBLEU 0,17 en ID→GOR). Esta versión v6 alcanza 40,59 SacreBLEU y 57,98 chrF++ en ID→GOR, y 32,57 / 56,80 en GOR(2001)→ID, lo que supone una mejora sustancial frente a las versiones v4 y v5 del propio proyecto. El modelo se distribuye con licencia Apache 2.0, lo que facilita su uso comercial y su integración en productos de traducción.

Arquitectónicamente es un transformer encoder-decoder seq2seq de tipo M2M-100 con 615.072.768 parámetros, heredado íntegramente del modelo base destilado de Meta. El entrenamiento se ha realizado sobre un corpus construido a partir de dos diccionarios del profesor Mansoer Pateda (1987 y 2001), auditados y reconciliados, con un total de 309.206 muestras de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder seq2seq (M2M-100, base NLLB-200 distilled) |
| Parametros totales | 615.072.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantización estándar de transformers, no documentada por el autor) |
| Idiomas soportados | indonesio (`ind_Latn`) y gorontalo (`gor_Latn`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder de la familia M2M-100, tomado de `facebook/nllb-200-distilled-600M` y sometido a un ajuste fino completo durante 4 épocas en `bfloat16` (tiempo de entrenamiento declarado: 70,14 minutos, `train_loss` final de 1,1307). La innovación principal respecto al modelo base es la incorporación del token de idioma `gor_Latn` (ID 256204), inicializado como centroide de las representaciones de `ind_Latn`, `bug_Latn`, `tgl_Latn` y `ceb_Latn`, lenguas austronesias relacionadas que sí están presentes en NLLB-200.

El corpus de entrenamiento se construye a partir de dos obras lexicográficas del profesor Mansoer Pateda: el *Kamus Bahasa Gorontalo–Indonesia* (2001) y el *Kamus Bahasa Indonesia–Gorontalo* (1987), auditadas y reconciliadas. La versión v6 incorpora 32.039 entradas de vocabulario de diccionario (28.727 únicas limpias), 29.546 frases paralelas crudas (22.751 únicas limpias) y 9.777 pares morfológicos. El conjunto final asciende a 309.206 muestras de entrenamiento (145.920 muestras base más un sobremuestreo de factor 3 sobre léxico y morfología de frases de tres palabras o menos), con particiones de validación (2.898) y test (2.890) sin fuga de datos. Se aplica además un puente ortográfico entre la notación de 1987 (vocales dobles, oclusiva glotal `?`) y la de 2001 (dos puntos, sin `?`, semivocales explícitas), y un motor morfológico que cubre 31 sistemas de prefijos, infijos (`-um-`, `-il-`) y sufijos (`-lo`, `-a`, `-i`).

## Capacidades

- Traducción bidireccional indonesio → gorontalo y gorontalo → indonesio, con normalización de la ortografía histórica de 1987 a la estándar de 2001.
- Generación de texto seq2seq condicionada por token de idioma (`ind_Latn` / `gor_Latn`), propia del paradigma NLLB.
- Manejo de léxico y morfología de palabras cortas gracias al sobremuestreo de entradas de diccionario y pares morfológicos.
- Traducción de frases completas y de unidades léxicas aisladas (uso como diccionario bilingüe automático).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente de traducción.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada a los dos idiomas del par; no se documenta transferencia a otras lenguas.

## Casos de uso

- Traducción de documentación administrativa local: el modelo permite convertir comunicados y formularios del indonesio al gorontalo para oficinas provinciales, aprovechando que la ortografía de salida sigue el estándar de 2001.
- Preservación digital de patrimonio lingüístico: digitalización y traducción de textos históricos escritos en la ortografía de 1987, gracias al puente ortográfico implementado en el corpus.
- Diccionario bilingüe automático: consulta de palabras y frases cortas, donde el sobremuestreo 3× de entradas léxicas de tres palabras o menos mejora la cobertura frente a un modelo genérico.
- Subtitulado y localización de contenido audiovisual regional: traducción de subtítulos indonesios a gorontalo para medios locales y plataformas de vídeo.
- Educación y materiales escolares: generación de glosas y traducciones de apoyo para la enseñanza del gorontalo como lengua materna en escuelas de la provincia.
- Atención al ciudadano en lengua local: integración en chatbots o formularios de servicios públicos que necesiten responder en gorontalo a partir de consultas en indonesio.
- Investigación en lenguas de bajos recursos: el modelo sirve como línea base reproducible para experimentos de adaptación de NLLB a lenguas austronesias no cubiertas.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre el conjunto de test v6 del corpus `panitagorontalo/gorontalo-indonesia-parallel`:

| Direccion | Metrica | v6 | v5 | v4 | Zero-shot |
|---|---|---|---|---|---|
| ID → GOR | SacreBLEU | 40,59 | 35,65 | 31,14 | 0,17 |
| ID → GOR | chrF++ | 57,98 | 53,87 | 49,60 | 10,26 |
| GOR (2001) → ID | SacreBLEU | 32,57 | 28,95 | 24,52 | no disponible |
| GOR (2001) → ID | chrF++ | 56,80 | 51,70 | 48,93 | no disponible |
| GOR (1987) → ID | SacreBLEU | 35,60 | 30,15 | 29,18 | no disponible |
| GOR (1987) → ID | chrF++ | 59,29 | 53,15 | 54,55 | no disponible |

Tamaños de test declarados: n=1.136 para ID→GOR y n=618 para GOR→ID.

## Requisitos de hardware

- VRAM estimada para inferencia en `bfloat16`/`float16`: en torno a 1,3 GB de pesos, más overhead de activaciones; cabe holgadamente en GPUs de 4 GB o más.
- En cuantización de 8 bits, el modelo ocupa aproximadamente 0,7 GB; en 4 bits, en torno a 0,4 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; para despliegue de alto throughput se recomiendan A100, H100 o L4.
- Cabe en GPU consumer y también en CPU para inferencia por lotes pequeños, dado el reducido tamaño del modelo.
- Opciones de despliegue: `transformers` con `pipeline("translation")`, TGI, vLLM (soporte de modelos encoder-decoder) y conversión a GGUF para llama.cpp/Ollama (no documentada por el autor).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| panitagorontalo/nllb-200-gorontalo-bi-600M | 615 M | no disponible | id, gor | Apache 2.0 | Ajuste específico para gorontalo; SacreBLEU 40,59 ID→GOR |
| facebook/nllb-200-distilled-600M | 615 M | 512 tokens (arquitectura NLLB) | 200 | CC-BY-NC 4.0 | No cubre gorontalo; zero-shot 0,17 SacreBLEU en ID→GOR |
| facebook/nllb-200-1.3B | 1,3 B | 512 tokens (arquitectura NLLB) | 200 | CC-BY-NC 4.0 | Mayor tamaño pero sin cobertura de gorontalo |
| facebook/m2m100_418M | 418 M | 1024 tokens (arquitectura M2M-100) | 100 | MIT | No incluye gorontalo |

La comparativa se limita a los modelos base de la familia; no se dispone de datos de otros ajustes específicos para gorontalo en la información proporcionada.

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y están marcados como no verificados (`verified: false`) en el model-index.
- El corpus de entrenamiento proviene de dos diccionarios con posible ruido OCR y de tamaño reducido (decenas de miles de frases), lo que puede producir traducciones literales o fallos en estructuras sintácticas complejas.
- El modelo solo cubre indonesio y gorontalo; no se ha evaluado su comportamiento con entradas en otros idiomas ni con mezcla de lenguas.
- Riesgo de alucinación y de traducción parcial en frases largas o con vocabulario fuera del corpus lexicográfico.
- La normalización ortográfica de 1987 a 2001 puede alterar textos que el usuario quiera conservar en su grafía original.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base NLLB-200 distilled se distribuye bajo CC-BY-NC 4.0; conviene revisar la compatibilidad de licencias antes de un despliegue comercial.
- No se documentan sesgos específicos, pero al derivar de NLLB-200 puede heredar sesgos de género y culturales del corpus original de Meta.
- No hay información sobre longitud máxima de contexto efectiva tras el ajuste fino ni sobre degradación con secuencias largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/panitagorontalo/nllb-200-gorontalo-bi-600M
- Space de demostración: https://huggingface.co/spaces/panitagorontalo/penerjemah-bahasa-gorontalo
- Notebook de tutorial (Colab): https://huggingface.co/panitagorontalo/nllb-200-gorontalo-bi-600M/blob/main/Tutorial_Penerjemah_AI_Bahasa_Gorontalo_Panita_Research.ipynb
- Paper técnico v6 (indonesio): https://huggingface.co/panitagorontalo/nllb-200-gorontalo-bi-600M/blob/main/paper/paper_id.pdf
- Paper técnico v6 (inglés): https://huggingface.co/panitagorontalo/nllb-200-gorontalo-bi-600M/blob/main/paper/paper_en.pdf
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-600M
- Dataset paralelo: https://huggingface.co/datasets/panitagorontalo/gorontalo-indonesia-parallel
