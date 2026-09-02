# mradermacher/WideSeek-SFT-4B-GGUF

## Resumen

WideSeek-SFT-4B-GGUF es la versión cuantizada en formato GGUF del modelo WideSeek-SFT-4B, desarrollado por el equipo WideSeek-R1 y cuantizado por mradermacher para su ejecución en hardware de consumo. El modelo original forma parte del proyecto WideSeek, que propone una arquitectura multi-agente jerárquica y dinámica para la recuperación de información a gran escala, optimizada mediante aprendizaje por refuerzo de extremo a extremo. Esta variante concreta ha sido sometida a un fine-tuning supervisado (SFT) sobre el dataset WideSeek-R1-SFT-data, orientado a tareas de búsqueda y síntesis de información.

Con 4.411.424.256 parámetros (aproximadamente 4,4 mil millones), el modelo se distribuye exclusivamente en inglés y bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones. La versión GGUF, disponible en doce niveles de cuantización que van desde Q2_K hasta f16, facilita su despliegue en entornos con recursos limitados, desde portátiles con 4 GB de VRAM hasta servidores con GPUs profesionales. Su relevancia actual radica en la creciente demanda de modelos de razonamiento multi-agente que puedan ejecutarse localmente sin depender de APIs propietarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer denso) |
| Parametros totales | 4.411.424.256 (4,4 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se han publicado detalles tecnicos sobre la arquitectura interna del modelo WideSeek-SFT-4B en la informacion disponible. Por el tamano (4,4 B parametros) y la familia a la que pertenece, es razonable asumir que se trata de un transformer denso con mecanismos de atencion estandar, aunque no hay confirmacion oficial. El proyecto WideSeek en su conjunto emplea una arquitectura multi-agente jerarquica para tareas de investigacion amplia, pero el modelo base podria ser un LLM convencional fine-tuneado para actuar como componente de ese sistema.

El entrenamiento se realizo mediante supervised fine-tuning (SFT) sobre el dataset WideSeek-R1/WideSeek-R1-SFT-data, que contiene ejemplos de tareas de recuperacion de informacion y sintesis. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas adicionales como RLHF o DPO. La cuantizacion GGUF fue realizada por mradermacher de forma estatica, sin usar imatrix ni pesos ponderados, segun indica la model card.

## Capacidades

- Recuperacion de informacion: el modelo esta especificamente entrenado para tareas de busqueda y extraccion de datos relevantes, segun los tags del repositorio.
- Razonamiento multi-agente: forma parte de un sistema disenado para coordinar multiples agentes en tareas de investigacion, aunque no esta claro si el modelo individual soporta este patron de forma nativa.
- Generacion de texto en ingles: al ser un modelo de lenguaje, puede generar respuestas coherentes y sintetizar informacion.
- Fine-tuning supervisado: su entrenamiento SFT lo hace adecuado para tareas de instruccion y seguimiento de directrices.
- No se ha confirmado soporte para tool calling, function calling, vision, audio ni modos de razonamiento explicito (thinking mode).

## Casos de uso

- Busqueda semantica en corpus corporativos: el modelo puede indexar y recuperar documentos relevantes en grandes volumenes de texto, aprovechando su entrenamiento en recuperacion de informacion. Se integraria en pipelines de RAG para responder consultas con contexto.
- Agentes de investigacion autonoma: combinado con frameworks multi-agente, puede descomponer una pregunta compleja en subconsultas, buscar informacion en multiples fuentes y sintetizar un informe final.
- Asistente de analisis de documentos legales o academicos: su capacidad para extraer datos especificos de textos largos lo hace util en entornos donde se necesita localizar clausulas, citas o referencias rapidamente.
- Generacion de resumenes de articulos cientificos: dado su enfoque en investigacion, puede condensar papers extensos en resumenes ejecutivos manteniendo los puntos clave.
- Chatbot de atencion al cliente con base de conocimiento: al poder recuperar informacion de manuales o FAQs, responde consultas de usuarios con datos precisos en lugar de respuestas genericas.
- Prototipado de sistemas de preguntas y respuestas sobre dominios especificos: su tamano reducido permite iterar rapidamente en entornos de desarrollo sin necesidad de GPUs de alta gama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este modelo. El proyecto WideSeek menciona un benchmark propio llamado WideSeekBench, pero no se han compartido resultados numericos en la documentacion accesible.

## Requisitos de hardware

- VRAM estimada para inferencia: segun el archivo GGUF, las cuantizaciones mas pequeñas (Q2_K, 1,9 GB) pueden ejecutarse en GPUs con 2-3 GB de VRAM, mientras que Q4_K_M (2,8 GB) requiere al menos 4 GB. La version f16 (8,9 GB) necesita 10 GB o mas.
- GPUs recomendadas: para cuantizaciones Q4 o inferiores, una NVIDIA GTX 1650 (4 GB) o RTX 3050 (8 GB) es suficiente. Para Q6_K o Q8_0, se recomienda RTX 3060 (12 GB) o superior. La version f16 requiere RTX 3090 o A100.
- Compatibilidad con hardware de consumo: si, las cuantizaciones Q2_K a Q5_K_M caben en GPUs de gama media actuales. Incluso en CPU, con llama.cpp, se puede ejecutar en equipos con 8 GB de RAM usando Q4_K_M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, GPT4All y cualquier runtime compatible con GGUF. Para despliegue en servidor, vLLM y TGI no soportan GGUF directamente, pero el modelo base en safetensors si es compatible.
- Latencia y throughput: no hay datos oficiales. En una RTX 3060 con Q4_K_M, se estima una velocidad de 20-30 tokens por segundo para un modelo de 4B, aunque esto depende de la implementacion y el contexto.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos de la misma categoria. Como referencia orientativa, se pueden mencionar alternativas de tamano similar:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| WideSeek-SFT-4B (este) | 4,4 B | no disponible | Apache 2.0 | GGUF, safetensors |
| Llama-3.2-3B | 3,2 B | 128 K | Llama 3.2 | safetensors, GGUF |
| Qwen2.5-4B | 4,0 B | 128 K | Apache 2.0 | safetensors, GGUF |
| Phi-3.5-mini | 3,8 B | 128 K | MIT | safetensors, GGUF |

La comparacion es limitada porque no hay datos de rendimiento publicados para WideSeek-SFT-4B. Su ventaja principal es la especializacion en recuperacion de informacion, mientras que los otros modelos son de proposito general.

## Limitaciones y advertencias

- No se han documentado sesgos especificos, pero al estar entrenado principalmente en ingles, su rendimiento en otros idiomas sera deficiente o nulo.
- Riesgo de alucinacion: como cualquier LLM, puede generar informacion falsa o inventada, especialmente en tareas de sintesis donde se espera precision factual.
- Limitaciones de contexto: se desconoce la longitud maxima de contexto soportada, lo que puede afectar a tareas que requieran procesar documentos extensos.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero el modelo base puede tener condiciones adicionales no especificadas en la model card.
- La cuantizacion GGUF es estatica y no utiliza imatrix, lo que puede degradar ligeramente la calidad en comparacion con cuantizaciones ponderadas.
- No hay informacion sobre el proceso de entrenamiento (datos, volumen, tecnicas de alineacion), lo que dificulta evaluar su robustez en entornos de produccion.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/mradermacher/WideSeek-SFT-4B-GGUF
- Modelo base en HuggingFace: https://huggingface.co/WideSeek-R1/WideSeek-SFT-4B
- Sitio web del proyecto WideSeek: https://wideseek-ai.github.io/
- Dataset de entrenamiento: https://huggingface.co/datasets/WideSeek-R1/WideSeek-R1-SFT-data
- Repositorio de cuantizaciones de mradermacher: https://huggingface.co/mradermacher/model_requests
