# byumatrixlab/mapudungun-nllb-600M-es-arn-morfessor-vc

## Resumen

El modelo `byumatrixlab/mapudungun-nllb-600M-es-arn-morfessor-vc` es un ajuste fino de `facebook/nllb-200-distilled-600M` especializado en la traduccion de espanol a mapudungun (codigo ISO `arn`), una lengua indigena de Chile y Argentina con recursos digitales muy limitados. Lo desarrolla el usuario `byumatrixlab` y se enmarca en el trabajo de Thompson, Rogers y Ringger presentado en AmericasNLP 2026, centrado en tokenizacion consciente de la morfologia para mejorar el ajuste de NLLB-200 en lenguas de bajos recursos.

La innovacion principal es el uso de segmentacion Morfessor seguida de una eliminacion voraz de fronteras cuyos segmentos fusionados ya existen en el vocabulario de NLLB (la variante "VC" del nombre). Esta tecnica busca alinear mejor la tokenizacion con la estructura morfologica aglutinante del mapudungun sin romper la compatibilidad con el vocabulario original del modelo base. El checkpoint corresponde a la version archivada de la era del articulo.

Se trata de un modelo pequeno (615 millones de parametros, 2,5 GB en el repositorio) pensado para traduccion unidireccional espanol-mapudungun en entornos de investigacion y preservacion linguistica. Su licencia es restrictiva para uso comercial, ya que hereda las obligaciones de NLLB-200 (CC-BY-NC 4.0) y del corpus de ajuste (CC BY-NC-SA 3.0).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia M2M-100 / NLLB) |
| Parametros totales | 615.072.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | arn (mapudungun), es (espanol) |
| Licencia | nllb-and-corpus-derived-terms (hereda CC-BY-NC 4.0 de NLLB-200 y CC BY-NC-SA 3.0 del corpus Duan et al.) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `facebook/nllb-200-distilled-600M`, un transformer encoder-decoder de tipo M2M-100 destilado, con vocabulario multilingue compartido y embeddings de idioma. Sobre esa base se realiza un ajuste fino supervisado para la direccion espanol a mapudungun. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO; el pipeline reportado es de traduccion supervisada.

La contribucion tecnica del trabajo es el preprocesamiento morfologico: se aplica segmentacion Morfessor al texto mapudungun y despues se eliminan de forma voraz aquellas fronteras de segmento cuya forma fusionada ya existe como item del vocabulario de NLLB. El objetivo es reducir la fragmentacion excesiva que sufre una lengua aglutinante con un vocabulario dominado por lenguas de altos recursos, manteniendo la compatibilidad con los embeddings preentrenados. El helper de inferencia aplica el preprocesamiento especifico de la condicion y elimina los marcadores de continuacion `@@` de la salida en mapudungun.

## Capacidades

- Traduccion automatica unidireccional de espanol a mapudungun.
- Manejo de texto mapudungun con segmentacion morfologica especifica de la condicion (Morfessor + filtrado de fronteras contra el vocabulario NLLB).
- Limpieza de marcadores de continuacion (`@@`) en la salida gracias al script `inference.py` incluido.
- Compatibilidad con la API de `transformers` 4.x y el pipeline de traduccion.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue limitada a los dos idiomas del ajuste; no se garantiza el comportamiento en otras direcciones de NLLB.

## Casos de uso

- Preservacion y digitalizacion linguistica: traduccion de materiales educativos y textos comunitarios del espanol al mapudungun para repositorios y archivos de lengua, aprovechando el ajuste especifico a la morfologia aglutinante.
- Investigacion en traduccion de bajos recursos: punto de comparacion reproducible para estudiar el impacto de la tokenizacion consciente de la morfologia frente al ajuste fino estandar de NLLB-200.
- Senalizacion y comunicaciones bilingues: generacion de rotulos, avisos y comunicados institucionales en mapudungun a partir de originales en espanol, con revision humana posterior.
- Apoyo a la docencia intercultural: borradores de traduccion de glosarios y material didactico espanol-mapudungun para profesores y talleres de lengua.
- Prototipos de herramientas de traduccion para comunidades mapuche: integracion en interfaces sencillas de traduccion de frases, dado el reducido tamano del modelo (615 M de parametros) que permite despliegue en hardware modesto.
- Evaluacion de metricas chrF++ en entornos academicos: reproduccion del resultado reportado (39,89 de chrF++ medio a nivel de frase) para validar pipelines de evaluacion en AmericasNLP.

## Benchmarks y rendimiento

| Metrica | Valor | Condicion |
|---|---|---|
| chrF++ medio a nivel de frase | 39,89 | espanol a mapudungun, tamano 600M, condicion Morfessor-VC, pipeline corregido del articulo |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numericas con otros sistemas en la model card.

## Requisitos de hardware

- VRAM estimada: alrededor de 2,5-3 GB en FP16 para los 615 M de parametros, mas memoria para activaciones y cache; en la practica cabe en GPUs consumer de 8 GB o mas.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090); para lotes grandes, A100 o H100 no son necesarias pero aceleran el throughput.
- Cabe en GPU consumer: si, en la mayoria de tarjetas modernas de 8 GB o superiores.
- Opciones de despliegue: `transformers` 4.x con el script `inference.py` del repositorio; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al no haber pesos GGUF publicados no se garantiza su uso en llama.cpp.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| mapudungun-nllb-600M-es-arn-morfessor-vc | 615 M | no disponible | arn, es | no comercial (NLLB + corpus) | Ajuste con tokenizacion Morfessor-VC; chrF++ 39,89 es-arn |
| facebook/nllb-200-distilled-600M | 615 M | no disponible | 200 idiomas | CC-BY-NC 4.0 | Modelo base; menor especializacion en mapudungun |
| NLLB-200 (variantes mayores) | 1,3 B / 3,3 B / 54 B | no disponible | 200 idiomas | CC-BY-NC 4.0 | Mayor capacidad pero sin ajuste morfologico especifico |
| Otros ajustes es-arn de la literatura AmericasNLP | no disponible | no disponible | arn, es | variable | No se dispone de cifras comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Licencia no comercial: hereda CC-BY-NC 4.0 de NLLB-200 y CC BY-NC-SA 3.0 del corpus Duan et al.; el uso comercial requiere revisar y cumplir ambas obligaciones.
- Traduccion unidireccional: solo se documenta espanol a mapudungun; el rendimiento en la direccion inversa no esta garantizado.
- Riesgo de alucinacion y errores gramaticales en una lengua de bajos recursos, con corpus de ajuste limitado; se recomienda revision por hablantes nativos.
- Sesgos potenciales derivados del corpus Duan et al. y de la distribucion del corpus NLLB original, no evaluados en la model card.
- Dependencia de preprocesamiento especifico: el uso correcto requiere el helper `inference.py` y `transformers` 4.x; saltarse el preprocesamiento puede degradar la calidad y dejar marcadores `@@` en la salida.
- Checkpoint archivado de la era del articulo: puede no reflejar mejoras posteriores del pipeline.
- Sin datos publicados sobre longitud de contexto efectiva, cuantizaciones soportadas ni rendimiento en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/byumatrixlab/mapudungun-nllb-600M-es-arn-morfessor-vc
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-600M
- Articulo citado: Thompson, Rogers y Ringger, "Bringing Mapudungun into the Modern MT Ecosystem: Morphology-Aware Tokenization for NLLB-200 Fine-Tuning", AmericasNLP 2026 (enlace directo no disponible en la informacion proporcionada)
- Repositorio del autor: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
