# dealignai/GLM-5.3-Flash-UNCENSORED-FP8

## Resumen

GLM-5.3-Flash-UNCENSORED-FP8 es una versión modificada del modelo GLM-5.3-Flash de Z.ai, publicada por el usuario dealignai bajo su marca "CRACK". Se trata de un modelo de lenguaje de 321 mil millones de parámetros en configuración MoE (mixture of experts) con solo 18 mil millones de parámetros activos por token, cuantizado en FP8 y con los guardarraíles de rechazo eliminados directamente en los pesos del modelo mediante una técnica de abliteration. El objetivo declarado es eliminar el comportamiento de sobre-rechazo del modelo base, especialmente en peticiones relacionadas con copyright y otros contenidos benignos pero marcados como sensibles.

El modelo mantiene las capacidades del GLM-5.3-Flash original: arquitectura híbrida con atención lineal KDA y atención sparse estilo DeepSeek, ventana de contexto de 1 millón de tokens, procesamiento multimodal con torre de visión GLM-4.1V y soporte de decodificación especulativa MTP (multi-token prediction). La cuantización FP8 permite ejecución nativa en GPUs Hopper (H100/H200) sin necesidad de kernels adicionales. Según la model card, la degradación de rendimiento respecto al modelo base es mínima (MMLU -0,48 puntos porcentuales) y la tasa de cumplimiento en HarmBench-320 es del 100%, lo que indica que los guardarraíles han sido eliminados por completo.

La relevancia de este modelo radica en que ofrece una alternativa "sin censura" a nivel de pesos, sin depender de jailbreaks por prompt ni de adaptadores externos, lo que lo hace interesante para investigación sobre seguridad de IA, generación de contenido creativo sin restricciones y análisis de comportamientos de rechazo en modelos grandes. No obstante, su naturaleza plantea riesgos éticos y legales que deben considerarse antes de su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-5.3-Flash (`glm5_next`), MoE hibrido con atencion lineal KDA y atencion sparse DeepSeek |
| Parametros totales | 321.323.031.390 (~321B) |
| Parametros activos | 18B por token |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | FP8 (block-wise e4m3) |
| Idiomas soportados | en (segun model card; el modelo base probablemente soporta mas, pero no se especifica) |
| Licencia | MIT |
| Formato de pesos | safetensors (FP8) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es el primer modelo nativamente multimodal de la serie GLM-5 de Z.ai. Su arquitectura combina atención lineal KDA (kernel-based linear attention) con atención sparse estilo DeepSeek, lo que permite manejar contextos de hasta 1 millón de tokens con coste computacional reducido. La configuración MoE activa solo 18 mil millones de parámetros de un total de 321 mil millones, lo que lo hace eficiente en inferencia. Incluye además una torre de visión basada en GLM-4.1V y un cabezal de decodificación especulativa MTP que acelera la generación.

La modificación realizada por dealignai consiste en una abliteration: la eliminación de los comportamientos de rechazo directamente en los pesos del modelo, sin fine-tuning, sin LoRA, sin adaptadores ni trucos de prompt. Según la model card, se trata de una edición permanente en los tensores que funciona con vLLM estándar. No se proporcionan datos sobre el dataset de entrenamiento del modelo base ni sobre el proceso exacto de abliteration. La cuantización FP8 es block-wise e4m3, diseñada para velocidad nativa en GPUs Hopper.

## Capacidades

- Generacion de texto y razonamiento: mantiene las capacidades del GLM-5.3-Flash base, con puntuacion MMLU de 86,26% (frente a 86,74% del base).
- Codigo y matematicas: el modelo base destaca en tareas de programacion y agentes, acercandose a Claude Opus 4.8 en benchmarks de coding segun Z.ai.
- Vision multimodal: procesa imagenes mediante la torre de vision GLM-4.1V, con soporte de `image_url` en la API de chat.
- Tool calling y function calling: compatible con el parser `glm47` de vLLM y `--enable-auto-tool-choice`.
- Razonamiento multi-paso: soporta el parser `glm45` para razonamiento estructurado.
- Decodificacion especulativa MTP: cabezal de prediccion multi-token con tasa de aceptacion del 75,9%, que acelera la generacion hasta 211 tok/s en H200.
- Sin guardarrailes: el modelo no rechaza peticiones, incluyendo contenido de copyright, contextual o estandar (100% de cumplimiento en HarmBench-320).

## Casos de uso

- Generacion de contenido creativo sin restricciones: el modelo puede producir narrativa, guiones o material literario que otros modelos rechazarian por politicas de copyright o contenido sensible. Adecuado para estudios creativos que necesitan explorar temas controvertidos sin fricciones.
- Investigacion sobre seguridad de IA: permite estudiar el comportamiento de un modelo sin guardarrailes, analizar patrones de rechazo, sesgos y riesgos de alucinacion en escenarios adversariales. Su naturaleza abliterated lo convierte en un sujeto de prueba ideal para evaluar tecnicas de alineacion.
- Desarrollo de agentes autonomos: con soporte de tool calling y razonamiento multi-paso, puede integrarse en pipelines de automatizacion donde se requiere tomar decisiones sin intervencion humana, como orquestacion de tareas complejas o navegacion web.
- Generacion de codigo en produccion: su rendimiento en tareas de programacion (cercano a Claude Opus 4.8) y su capacidad de manejar contextos de 1M tokens lo hacen util para refactorizacion de grandes repositorios, generacion de tests y documentacion automatica.
- Analisis de documentos largos: la ventana de 1M tokens permite procesar libros completos, expedientes legales o historiales clinicos en una sola pasada, extrayendo informacion y resumiendo sin perder contexto.
- Asistencia multimodal en entornos controlados: combinando vision y texto, puede describir imagenes, transcribir diagramas o generar informes a partir de capturas de pantalla, util en entornos de soporte tecnico o educacion.

## Benchmarks y rendimiento

La model card proporciona datos de MMLU (logit-mode, 1.026 preguntas) comparando el modelo base FP8 con la version CRACK:

| Benchmark | Base FP8 | CRACK Uncensored FP8 | Delta |
|---|---|---|---|
| MMLU (overall) | 86,74% | 86,26% | -0,48 pp |

Tambien se reporta HarmBench-320 (greedy):

| Categoria | Cumplidas | Tasa |
|---|---|---|
| Standard | 159/159 | 100,0% |
| Contextual | 81/81 | 100,0% |
| Copyright | 80/80 | 100,0% |
| Overall | 320/320 | 100,0% |

No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye un desglose por 57 materias de MMLU, con variaciones puntuales de hasta -16,7 pp en "Moral Scenarios" y +11,1 pp en "Astronomy" o "College Computer Science".

## Requisitos de hardware

- VRAM estimada: con 321B parametros en FP8 (1 byte por parametro), se necesitan aproximadamente 321 GB de VRAM. Con tensor-parallel-size 4, cada GPU debe disponer de al menos 80 GB (H100/H200).
- GPUs recomendadas: H100 o H200 (Hopper) para velocidad FP8 nativa. En GPUs Ampere o Ada, la cuantizacion FP8 puede no ofrecer aceleracion por hardware.
- Compatibilidad con consumer GPUs: no es viable en GPUs de consumo (RTX 4090 tiene 24 GB, insuficiente incluso con cuantizacion agresiva). Se requeriria al menos 4x A100 80GB o similar.
- Opciones de despliegue: vLLM (recomendado, con `--tensor-parallel-size 4`), TGI, llama.cpp (si se convierte a GGUF, aunque no se proporciona). El modelo usa safetensors FP8, compatible con vLLM estandar.
- Rendimiento medido (TP4, H200): decode 163 tok/s single-stream, 211 tok/s con MTP, prefill ~19.400 tok/s. La tasa de aceptacion MTP es del 75,9%.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | MMLU | Notas |
|---|---|---|---|---|---|---|
| GLM-5.3-Flash (base) | 321B | 18B | 1M | MIT | 86,74% | Modelo original con guardarrailes |
| GLM-5.3-Flash-UNCENSORED-FP8 | 321B | 18B | 1M | MIT | 86,26% | Abliterated, sin rechazos |
| GLM-5.3-Flash-NVFP4 (LibertAIDAI) | 321B | 18B | 1M | MIT | no disponible | Cuantizacion NVFP4, mismo base |

No se dispone de datos de otros modelos comparables (como DeepSeek-V3 o Qwen2.5-Max) en la informacion proporcionada. La comparativa se limita a variantes del mismo modelo base.

## Limitaciones y advertencias

- Ausencia total de guardarrailes: el modelo no rechaza ninguna peticion, incluido contenido ilegal, dañino o con copyright. Su uso en produccion puede acarrear responsabilidades legales y eticas.
- Degradacion ligera de capacidades: MMLU cae -0,48 pp respecto al base, con variaciones topicas de hasta -16,7 pp en "Moral Scenarios" y -16,7 pp en "High School Mathematics".
- Idioma limitado: la model card solo declara ingles. El rendimiento en otros idiomas no esta verificado.
- Requisitos de hardware elevados: necesita al menos 4 GPUs de 80 GB para inferencia, lo que limita su despliegue a entornos con infraestructura HPC o cloud.
- Riesgo de alucinacion: al no tener guardarrailes, el modelo puede generar afirmaciones falsas o inventadas con mayor confianza, especialmente en dominios donde el modelo base ya mostraba debilidades.
- Sin garantias de calidad: la abliteration se realizo sin fine-tuning, por lo que no hay garantia de que el comportamiento en tareas especificas sea consistente. La model card advierte que la divergencia KL respecto al base no es una metrica de calidad relevante.
- Uso comercial: la licencia MIT permite uso comercial, pero el contenido generado sin restricciones puede infringir derechos de autor o normativas de contenido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dealignai/GLM-5.3-Flash-UNCENSORED-FP8
- Espejo abliterated: https://huggingface.co/dealignai/GLM-5.3-Flash-ABLITERATED-FP8
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Repositorio GLM-5 de Z.ai: https://github.com/zai-org/GLM-5
- Documentacion de Z.ai sobre GLM-5.3: https://docs.z.ai/guides/llm/glm-5.3
- Documentacion de Unsloth sobre GLM-5.3-Flash: https://unsloth.ai/docs/models/glm-5.3
- Variante NVFP4 de LibertAIDAI: https://huggingface.co/LibertAIDAI/GLM-5.3-Flash-NVFP4
