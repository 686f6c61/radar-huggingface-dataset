# Ishowbackup/gemma-4-E4B-it-uncensored

## Resumen

El modelo `Ishowbackup/gemma-4-E4B-it-uncensored` es una versión modificada del modelo `google/gemma-4-E4B-it` de Google, desarrollada por el usuario Ishowbackup mediante una técnica de abliteración. Su objetivo es eliminar el comportamiento de rechazo del modelo original, de modo que responda a cualquier consulta sin negarse, incluso ante peticiones potencialmente dañinas o controvertidas. Esta modificación se logra mediante una proyección biproyectada que preserva la norma de los pesos, una variante de la abliteración clásica que mantiene la magnitud de los pesos y, por tanto, minimiza la degradación de la calidad de las respuestas.

El modelo tiene aproximadamente 8.000 millones de parámetros (7.996.156.490), está entrenado en inglés y se distribuye bajo licencia Apache 2.0. Aunque no se especifica la longitud de contexto, al estar basado en Gemma 4, se espera que herede las capacidades del modelo original, incluyendo generación de texto conversacional. La relevancia de esta ficha radica en que este tipo de modelos "uncensored" se utilizan en investigación sobre seguridad de IA, alineación y evaluación de técnicas de modificación de comportamiento, así como en aplicaciones donde se requiere una libertad de expresión total.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Gemma 4, detalles no especificados) |
| Parametros totales | 7.996.156.490 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No especificado (pesos en bf16, repo de 32 GB) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es una adaptación del modelo base `google/gemma-4-E4B-it`, que pertenece a la familia Gemma 4 de Google. La arquitectura subyacente es un transformer decoder-only, aunque no se proporcionan detalles específicos sobre el número de capas, dimensiones de atención o mecanismos de atención (como atención lineal o deslizante) en la información disponible.

El proceso de modificación consiste en una abliteración normo-preservadora con biproyección, según el método descrito por grimjim en noviembre de 2025. El procedimiento incluye: cargar el modelo en bf16 con adaptadores LoRA en las capas `o_proj` y `mlp.down_proj`, recolectar activaciones residuales de 400 prompts dañinos y 400 inofensivos (provenientes de datasets de mlabonne), aplicar una winsorización al percentil 99.5 para recortar activaciones atípicas de GeGLU, calcular una dirección de rechazo por capa como la normalización de la diferencia entre medias de activaciones dañinas e inofensivas, ortogonalizar cada dirección contra la media inofensiva mediante doble paso de Gram-Schmidt, y finalmente aplicar la modificación de pesos normo-preservadora en todas las capas. El resultado es un modelo con un 100% de capas abliteradas, escala 1.0 y winsorización 0.995.

No se dispone de información sobre el preentrenamiento original del modelo base (número de tokens, composición del dataset, técnicas de RLHF o DPO), ya que esta ficha se centra en la modificación posterior.

## Capacidades

- Generacion de texto en ingles, incluyendo conversacion multi-turno y respuestas a instrucciones.
- Comportamiento sin rechazo: el modelo responde a practicamente cualquier consulta, incluso aquellas que el modelo base rechazaria (refusals reducidos de 99/100 a 0/100 en un conjunto de 100 prompts, y a 5/686 en una validacion cruzada).
- Hereda las capacidades generales del modelo Gemma 4 (razonamiento, generacion creativa, etc.), aunque no se documentan capacidades especificas como tool calling, agentes o multimodalidad en esta version.
- Compatible con el pipeline de transformers y con formatos de pesos safetensors, lo que facilita su integracion en entornos de inferencia estandar.

## Casos de uso

- Investigacion en seguridad de IA: estudiar como se comporta un modelo sin mecanismos de rechazo, para evaluar riesgos y disenar contramedidas. Se usaria cargando el modelo y sometiendolo a prompts adversariales, midiendo tasas de cumplimiento y calidad de las respuestas.
- Evaluacion de tecnicas de abliteracion: comparar la efectividad de diferentes metodos de eliminacion de rechazo (normo-preservador vs. proyeccion estandar) mediante metricas como KL divergence y tasas de refusal.
- Generacion de contenido creativo sin restricciones: escribir ficcion, poesia o dialogos que aborden temas tabu o controvertidos sin limitaciones impuestas por el modelo base. Su naturaleza densa de 8B permite ejecutarlo en GPUs de consumo medio.
- Simulacion de conversaciones en entornos de prueba: crear chatbots o asistentes para pruebas de estres donde se requiera respuestas sin filtros, por ejemplo en investigacion de UX o en entornos de desarrollo de agentes conversacionales.
- Desarrollo de aplicaciones de nicho que requieren libertad total de expresion, como generacion de guiones para contenido adulto o juegos de rol, siempre que se cumplan las normativas legales y eticas aplicables.
- Benchmarking de modelos "uncensored": comparar este modelo con otras versiones abliteradas de la misma familia (por ejemplo, Llama-3-8B-Instruct-abliterated) para entender diferencias en calidad y comportamiento.

## Benchmarks y rendimiento

La model card proporciona resultados especificos sobre la eliminacion de rechazos y la preservacion de calidad, pero no incluye benchmarks estandar como MMLU, HumanEval o GSM8K. Los datos disponibles son los siguientes:

| Metrica | Antes (modelo base) | Despues (modelo uncensored) |
|---|---|---|
| Refusals (mlabonne, 100 prompts) | 99/100 | 0/100 efectivos (3 marcados, todos "refusal-then-comply") |
| Refusals (cross-dataset, 686 prompts) | — | 5/686 (0.7%) |
| KL Divergence | 0 (baseline) | 0.068 |
| Calidad (ratio de longitud de respuestas inofensivas) | 1.0 | ~1.01 (sin degradacion) |

Ademas, se realizo una validacion cruzada con 4 datasets independientes:

| Dataset | Prompts | Refusals |
|---|---|---|
| JailbreakBench | 100 | 2/100 |
| tulu-harmbench | 320 | 1/320 |
| NousResearch/RefusalDataset | 166 | 2/166 |
| mlabonne/harmful_behaviors | 100 | 0/100 |
| **Total** | **686** | **5/686 (0.7%)** |

No se han publicado resultados de benchmarks de rendimiento general (razonamiento, codigo, matematicas) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 8.000 millones de parametros en bf16 (2 bytes por parametro), el modelo requiere aproximadamente 16 GB de VRAM para inferencia sin cuantizacion. Con cuantizacion a 8 bits (8 GB) o 4 bits (4 GB) podria ejecutarse en GPUs con menos memoria, aunque no se proporcionan archivos GGUF ni cuantizaciones oficiales.
- GPUs recomendadas: una NVIDIA RTX 4090 (24 GB VRAM) es suficiente para bf16; una A100 (40/80 GB) o H100 permiten mayor margen y batch. Para cuantizacion 4-bit, una RTX 3060 (12 GB) o RTX 4060 Ti (16 GB) podrian ser suficientes.
- Compatibilidad con GPU de consumo: si, con cuantizacion. El modelo cabe en GPUs de 16 GB en bf16, y en GPUs de 8 GB con cuantizacion de 8 bits.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF), Ollama (si se crea un Modelfile) o mediante la API de HuggingFace Inference Endpoints.
- Latencia y throughput: no se proporcionan datos especificos. Como referencia, un modelo de 8B en una RTX 4090 suele generar entre 50 y 100 tokens por segundo en bf16, dependiendo del batch y la longitud de contexto.

## Comparativa con modelos similares

El modelo se compara directamente con su version base, `google/gemma-4-E4B-it`, ya que es la misma arquitectura con la unica diferencia de la abliteracion. No se dispone de datos de otros modelos uncensored comparables en la informacion proporcionada.

| Modelo | Parametros | Contexto | Refusals (mlabonne) | KL Divergence | Licencia |
|---|---|---|---|---|---|
| google/gemma-4-E4B-it (base) | 8B | No disponible | 99/100 | 0 (baseline) | Apache 2.0 |
| Ishowbackup/gemma-4-E4B-it-uncensored | 8B | No disponible | 0/100 | 0.068 | Apache 2.0 |

La principal diferencia es la eliminacion del rechazo, con una degradacion minima de la calidad (KL 0.068). No se han encontrado comparaciones con otros modelos abliterados (por ejemplo, versiones de Llama 3) en la informacion disponible.

## Limitaciones y advertencias

- El modelo puede generar contenido dañino, ilegal o eticamente cuestionable, ya que carece de mecanismos de rechazo. Su uso en produccion requiere salvaguardas externas y supervisión humana.
- La abliteracion reduce la tasa de rechazos pero no elimina completamente el riesgo: un 0.7% de los prompts aun provocan respuestas de rechazo parcial o completo, y algunos casos son "refusal-then-comply" (el modelo se identifica como IA y luego responde).
- Solo soporta ingles; no se ha evaluado su rendimiento en otros idiomas.
- No se han realizado evaluaciones de sesgos, alucinaciones o seguridad en entornos reales. La calidad general puede verse ligeramente afectada por la modificacion (KL 0.068), aunque el ratio de longitud de respuestas inofensivas se mantiene estable.
- El modelo es una creacion de un tercero, no oficial de Google. No hay garantias de soporte ni actualizaciones.
- La licencia Apache 2.0 permite uso comercial, pero el responsable legal del contenido generado es el usuario final.
- No se proporcionan cuantizaciones oficiales; el repo contiene solo safetensors en bf16 (32 GB), lo que puede dificultar el despliegue en entornos con recursos limitados.

## Enlaces

- [HuggingFace - Ishowbackup/gemma-4-E4B-it-uncensored](https://huggingface.co/Ishowbackup/gemma-4-E4B-it-uncensored)
- [HuggingFace - Modelo base google/gemma-4-E4B-it](https://huggingface.co/google/gemma-4-E4B-it)
- [Blog - Norm-preserving biprojected abliteration (grimjim, Nov 2025)](https://huggingface.co/blog/grimjim/norm-preserving-biprojected-abliteration)
- [Repositorio de reproduccion (github.com/TrevorS/gemma-4-abliteration)](https://github.com/TrevorS/gemma-4-abliteration)
