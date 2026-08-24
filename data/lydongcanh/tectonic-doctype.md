# lydongcanh/tectonic-doctype

## Resumen

`lydongcanh/tectonic-doctype` es un clasificador de documentos legales en inglés que asigna un texto a una de nueve categorías de tipo de documento (acuerdos de adquisición, acuerdos comerciales, documentos constitucionales, contratos de empleo, estados financieros, acuerdos de financiación, acuerdos de propiedad intelectual, contratos de arrendamiento y NDA). No es un modelo generativo, sino un head de regresión logística entrenado sobre embeddings congelados de `sentence-transformers/all-mpnet-base-v2`, un modelo transformer de la familia MPNet con unos 109 millones de parámetros.

El pipeline completo funciona de la siguiente manera: el documento se divide en ventanas de 250 palabras (hasta 12 ventanas), cada ventana se codifica con el modelo base, y los embeddings resultantes se promedian y normalizan. La representación vectorial resultante se introduce en una regresión logística que produce las probabilidades de cada clase. El modelo se entrenó con datos de SEC EDGAR, CUAD y ContractNLI, todos de dominio público o con licencia abierta, y se distribuye bajo licencia CC BY 4.0.

Su relevancia reside en que ofrece una clasificación de tipos de documentos legales con buen rendimiento (macro-F1 de 0,940 en test) y, según los autores, generaliza mejor entre distintas fuentes documentales que un baseline TF-IDF, aunque el baseline puntúa más alto en distribución. Está pensado para pipelines de procesamiento de contratos en entornos legales, como paso previo al análisis de cláusulas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer MPNet (all-mpnet-base-v2) con pooling medio + head de regresion logistica |
| Parametros totales | ~109 millones (modelo base) + head logistico de dimensiones reducidas |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica: el documento se divide en ventanas de 250 palabras (maximo 12 ventanas, ~3000 palabras) |
| Tipos de cuantizacion | No aplica (modelo sklearn + embeddings en float32) |
| Idiomas soportados | Ingles (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | Head logistico en formato skops (.skops); modelo base en safetensors (descargado de HuggingFace Hub) |

## Arquitectura y entrenamiento

El modelo combina un encoder transformer preentrenado (MPNet, `all-mpnet-base-v2`) congelado con un clasificador de regresion logica. El encoder produce embeddings por ventana de texto; estas embeddings se promedian y normalizan para obtener una representacion global del documento. El head logistico se entrena sobre estas representaciones. No se aplican tecnicas de RLHF ni DPO; el entrenamiento es supervisado clasico sobre etiquetas de tipo de documento.

Los datos de entrenamiento provienen de tres fuentes: CUAD (The Atticus Project, CC BY 4.0), ContractNLI (CC BY 4.0) y SEC EDGAR (registros publicos del gobierno de EE. UU.). El dataset de CUAD se usa para la clasificacion de tipos de contrato. No se especifica el numero total de tokens ni la composicion exacta del dataset. El autor reporta que el modelo generaliza mejor entre distintas fuentes que un baseline TF-IDF, aunque el baseline rinde mejor en distribucion.

## Capacidades

- Clasificacion de documentos legales en ingles en nueve tipos: `acquisition_agreement`, `commercial_agreement`, `constitutional`, `employment_agreement`, `financial_statements`, `financing_agreement`, `ip_agreement`, `lease_agreement` y `nda`.
- Procesa documentos completos mediante chunking en ventanas de 250 palabras (maximo 12 ventanas), lo que permite manejar textos largos sin superar el limite de contexto del encoder.
- Devuelve probabilidades por clase, lo que permite establecer umbrales de aceptacion o escalado.
- No soporta tool calling, agentes, vision ni audio. Es un clasificador puro, sin generacion de texto.

## Casos de uso

- **Clasificacion de contratos en un repositorio legal**: permite etiquetar automaticamente miles de documentos en una base de datos corporativa para su posterior indexacion y busqueda.
- **Enrutamiento de documentos en un pipeline de due diligence**: en procesos de M&A, se clasifican los documentos recibidos para enviarlos al equipo legal correspondiente (por ejemplo, separar NDAs de acuerdos de financiacion).
- **Preprocesamiento para analisis de clausulas**: antes de aplicar un modelo de extraccion de clausulas (como los de CUAD), se clasifica el tipo de documento para seleccionar el esquema de extraccion adecuado.
- **Sistema de gestion documental para despachos**: automatiza la catalogacion de contratos recibidos de clientes, reduciendo el trabajo manual de los paralegales.
- **Monitorizacion de cumplimiento**: identificar automaticamente contratos que deben revisarse periodicamente (por ejemplo, leases o employment agreements) en funcion de su tipo.
- **Filtrado de documentos en procesos de discovery**: en litigios, clasificar rapidamente los documentos producidos para priorizar la revision de los tipos mas relevantes.

## Benchmarks y rendimiento

El autor reporta un macro-F1 de **0.940** en el conjunto de test retenido (intervalo de confianza del 95 %: 0.915-0.963). Se comparo con un baseline TF-IDF que obtiene mayor puntuacion in-distribution, pero el modelo basado en embeddings generaliza mejor entre distintas fuentes documentales. No se han publicado resultados de benchmarks estandar como MMLU, HumanEval o GSM8K, ya que el modelo no es un LLM generativo.

## Requisitos de hardware

- **VRAM estimada**: el modelo base `all-mpnet-base-v2` ocupa unos 420 MB en memoria. El head logistico es insignificante. Se puede ejecutar en CPU sin problemas; en GPU, cualquier tarjeta con 2 GB de VRAM es suficiente.
- **GPUs recomendadas**: no requiere GPU de alta gama. Cualquier GPU de consumo (RTX 2060 o superior) o incluso CPU es suficiente para inferencia en lote.
- **Compatibilidad con consumer GPU**: si, cabe en cualquier GPU de consumo.
- **Opciones de despliegue**: se puede desplegar como un microservicio con FastAPI o Flask, o integrarse en un pipeline de Python con `sentence-transformers` y `scikit-learn`. No se soporta vLLM, llama.cpp ni TGI por ser un modelo no generativo.
- **Latencia**: para un documento de 3000 palabras, la inferencia tarda del orden de 1-2 segundos en CPU y menos de 0,5 segundos en GPU (estimacion razonable basada en el tamaño del modelo base).

## Comparativa con modelos similares

No se dispone de informacion sobre otros clasificadores de tipo de documento legales comparables en la informacion proporcionada. La unica comparativa disponible es con el baseline TF-IDF, que se menciona en la model card: el baseline puntua mas alto in-distribution, pero este modelo generaliza mejor entre fuentes. No se puede establecer una tabla comparativa con alternativas concretas.

## Limitaciones y advertencias

- **Idioma**: el modelo solo soporta ingles; no se ha probado con documentos en otros idiomas.
- **Generalizacion a otras jurisdicciones**: el entrenamiento se realizo principalmente con documentos de EE. UU. (EDGAR, CUAD); la generalizacion a documentos de otras jurisdicciones o a documentos escaneados (OCR) esta solo ligeramente probada.
- **Calibracion de confianza**: el autor advierte que la confianza del modelo esta sub-calibrada, por lo que hay que establecer umbrales de aceptacion o escalada empiricamente.
- **Alucinacion**: no aplica, ya que es un clasificador y no genera texto.
- **Licencia**: CC BY 4.0 permite uso comercial con atribucion, pero hay que mantener la atribucion de las fuentes originales (CUAD, ContractNLI, SEC EDGAR).
- **Limitacion de tamano**: el chunking limita el analisis a unos 3000 tokens (12 ventanas de 250 palabras); documentos mas largos se truncan, lo que puede perder informacion al final del texto.

## Enlaces

- [Hugging Face - lydongcanh/tectonic-doctype](https://huggingface.co/lydongcanh/tectonic-doctype)
- [GitHub - lydongcanh/tectonic](https://github.com/lydongcanh/tectonic)
- [Dataset CUAD (The Atticus Project)](https://huggingface.co/datasets/theatticusproject/cuad-qa)
- [Modelo base: sentence-transformers/all-mpnet-base-v2](https://huggingface.co/sentence-transformers/all-mpnet-base-v2)
