# augustine223/Huihui-Qwen3.6-35B-A3B-abliterated-KO-i1-GGUF

## Resumen

El modelo `Huihui-Qwen3.6-35B-A3B-abliterated-KO-i1-GGUF` es una versión cuantizada en formato GGUF de un modelo de lenguaje de tipo Mixture of Experts (MoE) basado en Qwen3.6-35B-A3B, al que se le ha aplicado la técnica de abliteration (eliminación de los mecanismos de rechazo y filtrado de contenido). El autor, augustine223, ha construido esta variante sobre el modelo `huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated` y la ha optimizado específicamente para el idioma coreano mediante una matriz de calibración (imatrix) construida con un corpus propio. El resultado es un modelo sin censura, orientado a usuarios que buscan libertad total de generación, manteniendo la calidad de cuantización verificada mediante métricas de divergencia KL frente a la versión en punto flotante.

La relevancia de este lanzamiento radica en dos aspectos: por un lado, ofrece una alternativa abliterated de un modelo Qwen3.6 de última generación con arquitectura MoE eficiente (35B parámetros totales, 3B activos); por otro, incorpora una calibración específica para coreano que mejora la fidelidad de las cuantizaciones en ese idioma. El modelo se distribuye bajo licencia Apache 2.0 y está disponible en múltiples niveles de cuantización, desde IQ2_M hasta Q8_0, lo que permite adaptarlo a distintos presupuestos de hardware.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture of Experts (MoE), basada en Qwen3.6-35B-A3B |
| Parametros totales | 35 000 millones (35B) |
| Parametros activos | 3 000 millones (3B) |
| Longitud de contexto | 32 768 tokens (según ejemplo de uso en la documentación; no se especifica el máximo oficial) |
| Tipos de cuantizacion | IQ2_M, IQ3_XXS, IQ3_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Coreano (ko), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.6-35B-A3B, un transformer con arquitectura de mezcla de expertos (MoE) que activa únicamente 3 000 millones de parámetros por token, lo que reduce significativamente el coste computacional en inferencia. Sobre esta arquitectura, huihui-ai aplicó la técnica de abliteration, que consiste en modificar los pesos del modelo para eliminar las respuestas de rechazo y los filtros de seguridad aprendidos durante el entrenamiento. El resultado es un modelo que no rechaza peticiones consideradas sensibles o controvertidas.

La versión KO-i1 de augustine223 añade una capa de calibración específica para coreano. Se construyó una matriz de importancia (imatrix) a partir de un corpus de calibración de aproximadamente 708 fragmentos (unos 360 000 tokens) compuesto por fuentes con licencias permisivas (dominio público, CC BY, CC BY-SA, Apache, MIT, KOGL-1). Esta imatrix se utilizó para guiar la cuantización de los pesos, logrando que las versiones cuantizadas mantengan una baja divergencia KL respecto a la versión en f16, especialmente en el rango de cuantizaciones medias y altas. El proceso completo se realizó de forma local con llama.cpp (build 10449) y el pipeline está documentado públicamente.

El modelo incluye también los tensores correspondientes a la decodificación especulativa (MTP/nextn), aunque estos están fijados a q4_K en todas las cuantizaciones por ser tensores inactivos en el grafo de inferencia. Para usar la decodificación especulativa, se debe especificar el GGUF de MTP correspondiente mediante la opción `-md`.

## Capacidades

- Generacion de texto libre y sin restricciones de contenido (modelo abliterated).
- Razonamiento y modo de pensamiento (thinking mode) tipico de la familia Qwen3.6, con capacidad de generar cadenas de razonamiento internas.
- Soporte de tool calling y function calling, heredado del modelo base Qwen3.6.
- Capacidades de agente y razonamiento multi-paso, reforzadas en la serie Qwen3.6.
- Generacion de codigo, matematicas y comprension de documentos, competencias generales de Qwen3.6.
- Multilingue limitado a coreano e ingles, con optimizacion especifica para coreano gracias a la imatrix.
- Decodificacion especulativa (speculative decoding) mediante el modulo MTP, si se proporciona el archivo auxiliar adecuado.

## Casos de uso

- Atencion al cliente automatizada en coreano: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 32 768 tokens, suficiente para mantener historiales largos de soporte tecnico o comercial en coreano sin perder coherencia.
- Generacion de contenido creativo sin restricciones: escritores y creadores pueden emplearlo para redactar ficcion, guiones o material con tematicas adultas o controvertidas que los modelos censurados rechazarian, asumiendo la responsabilidad legal del contenido generado.
- Asistente de programacion local: gracias a su capacidad de generacion de codigo y tool calling, puede integrarse en entornos de desarrollo como editor o agente autonomo, ejecutandose en hardware de consumo con cuantizaciones como IQ4_XS.
- Analisis y resumen de documentos coreanos: su calibracion especifica para coreano mejora la fidelidad en tareas de extraccion de informacion, resumen y traduccion dentro de ese idioma, util para empresas que trabajan con documentacion administrativa o legal surcoreana.
- Investigacion academica sobre alineacion y seguridad: al ser una version abliterated, sirve como objeto de estudio para analizar el impacto de la eliminacion de filtros en el comportamiento del modelo, comparandolo con la version censurada del mismo autor.
- Despliegue en entornos con recursos limitados: las cuantizaciones IQ3_M e IQ2_M permiten ejecutar el modelo en equipos con 12-16 GB de RAM, habilitando asistentes locales de chat o generacion de texto en portatiles sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor proporciona metricas propias de calidad de cuantizacion basadas en divergencia KL (KLD) y porcentaje de coincidencia en el token mas probable (Same-top) frente a la version en f16, evaluadas sobre un conjunto de validacion coreano (KLUE-MRC y articulos de korea.kr). La tabla siguiente resume estos resultados:

| Archivo | Tamano | KLD coreano | Same-top | Recomendacion |
|---|---|---|---|---|
| KO-i1-Q8_0 | 36 GB | 0.00463 | 96.6% | Practicamente sin perdida |
| KO-i1-Q6_K | 28 GB | 0.01014 | 94.8% | Alta calidad |
| KO-i1-Q5_K_M | 24 GB | 0.01369 | 94.0% | Equilibrado |
| KO-i1-Q4_K_M | 21 GB | 0.02532 | 91.7% | Estandar |
| KO-i1-IQ4_XS | 18 GB | 0.03078 | 91.3% | Recomendado para 32 GB de memoria unificada |
| KO-i1-IQ3_M | 15 GB | 0.07422 | 85.9% | Baja memoria |
| KO-i1-IQ3_XXS | 14 GB | 0.11632 | 82.7% | - |
| KO-i1-IQ2_M | 12 GB | 0.21188 | 77.6% | Compresion extrema |

La version abliterated muestra valores de KLD ligeramente superiores a la version censurada del mismo autor (por ejemplo, 0.02532 frente a 0.02320 en Q4_K_M), pero dentro del margen de variacion esperado (±1 sigma), lo que indica que la abliteration no degrada significativamente la calidad de la cuantizacion.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion elegida. Con IQ4_XS (18 GB) se necesita al menos 18 GB de memoria total (RAM o VRAM); con IQ3_M (15 GB) bastan 16 GB; con Q5_K_M (24 GB) se requieren 24 GB o mas.
- GPU recomendadas: el modelo puede ejecutarse en GPU de consumo como RTX 3090/4090 (24 GB) con cuantizaciones Q4_K_M o Q5_K_M. Para IQ4_XS, una RTX 4080 (16 GB) es suficiente. En sistemas con memoria unificada (Apple Silicon, APUs AMD), se recomienda al menos 32 GB para IQ4_XS.
- Compatibilidad con consumer GPU: si, con cuantizaciones inferiores a Q5_K_M. Las cuantizaciones IQ2_M e IQ3_M caben en GPUs de 12-16 GB.
- Opciones de despliegue: llama.cpp (llama-server, llama-cli), Ollama (comando `ollama run hf.co/augustine223/Huihui-Qwen3.6-35B-A3B-abliterated-KO-i1-GGUF:IQ4_XS`), LM Studio (busqueda por `augustine223`), y cualquier frontend compatible con GGUF.
- Latencia y throughput: no se proporcionan mediciones directas. Como referencia, un MoE de 3B activos en una GPU moderna (RTX 4090) suele alcanzar entre 30 y 60 tokens por segundo con cuantizacion Q4_K_M, dependiendo del tamaño de lote y la implementacion.
- Nota especifica: en APUs RDNA3.5 (como AMD Ryzen AI 9 HX PRO 370), se recomienda usar `-b 1024 -ub 1024` para evitar problemas de Vulkan, y `--no-mmap` en sistemas con memoria unificada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Observaciones |
|---|---|---|---|---|---|
| Huihui-Qwen3.6-35B-A3B-abliterated-KO-i1 (este) | 35B | 3B | 32K (minimo) | Apache 2.0 | GGUF, imatrix coreano, abliterated |
| Qwen3.6-35B-A3B (original) | 35B | 3B | 128K (tipico) | Apache 2.0 | Modelo base con filtros de seguridad |
| Huihui-Qwen3.6-35B-A3B-abliterated (sin imatrix KO) | 35B | 3B | 128K (tipico) | Apache 2.0 | Version abliterated sin calibracion coreana |

La principal diferencia frente al modelo original es la eliminacion de filtros de seguridad y la optimizacion para coreano. Frente a la version abliterated sin imatrix coreana, esta variante ofrece una mejor fidelidad en tareas en coreano, aunque con un contexto maximo no confirmado (el ejemplo usa 32K). No se dispone de datos comparativos de rendimiento en benchmarks estandar.

## Limitaciones y advertencias

- Modelo sin filtros de seguridad: al estar abliterated, puede generar contenido sensible, controvertido, ofensivo o ilegal segun la jurisdiccion. El autor declina toda responsabilidad y exige al usuario cumplir con las leyes aplicables.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede producir informacion falsa o inventada, especialmente en contextos largos o temas especializados. No apto para uso medico, legal o financiero sin supervision humana.
- Idioma limitado: aunque el modelo base de Qwen3.6 soporta multiples idiomas, esta version esta calibrada y documentada solo para coreano e ingles. El rendimiento en otros idiomas puede ser inferior al del modelo original.
- Contexto maximo no verificado: la documentacion muestra un ejemplo con 32 768 tokens, pero no se indica si el modelo soporta el contexto completo de Qwen3.6 (posiblemente 128K). Se recomienda probar antes de desplegar en produccion.
- Restricciones de licencia: aunque la licencia es Apache 2.0, el modelo abliterated puede violar los terminos de uso del modelo original de Alibaba si se redistribuye comercialmente en ciertos paises. El usuario debe verificar la normativa local.
- Calidad de cuantizacion en niveles extremos: las cuantizaciones IQ2_M e IQ3_XXS presentan una perdida significativa (KLD > 0.1), lo que puede degradar la coherencia y el razonamiento. No recomendadas para tareas complejas.
- Dependencia de la decodificacion especulativa: el modulo MTP no esta incluido en este repositorio; para usarlo hay que descargar el GGUF de MTP por separado, lo que anade complejidad al despliegue.

## Enlaces

- Repositorio del modelo: https://huggingface.co/augustine223/Huihui-Qwen3.6-35B-A3B-abliterated-KO-i1-GGUF
- Modelo base abliterated (huihui-ai): https://huggingface.co/huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated
- Version con MTP (huihui-ai): https://huggingface.co/huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated-MTP-GGUF
- Pagina en Ollama (huihui_ai): https://ollama.com/huihui_ai/Qwen3.6-abliterated:35b-a3b-q4_K
- Corpus de calibracion coreano: https://huggingface.co/datasets/augustine223/korean-imatrix-calibration-corpus
- Guia de ejecucion (en coreano): https://github.com/Jonas-Augustinus-Linus/strix-local-ai/blob/main/docs/run-guide-ko.md
- Pipeline de creacion: https://github.com/Jonas-Augustinus-Linus/strix-local-ai
- Noticia sobre el lanzamiento: https://www.ai-market-watch.com/news/release-of-uncensored-qwen36-35b-a3b-abliterated-model-bgxohb
