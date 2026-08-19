# empero-ai/Qwen3.8-4B

## Resumen

Qwen3.8-4B es un modelo de lenguaje causal desarrollado por Empero (empero-ai) que destila el comportamiento de razonamiento de un modelo de escala frontera, Qwen3.8 2.4T A95B, en la arquitectura compacta de Qwen3.5-4B. El objetivo es llevar el razonamiento tipo chain-of-thought de un profesor masivo a un modelo de 4.660 millones de parametros que pueda ejecutarse en hardware de consumo. Se trata de un fine-tune completo (todos los parametros actualizados) mediante SFT off-policy sobre aproximadamente 45.000 trazas de profesor filtradas por calidad, centradas en matematicas, razonamiento general y seguimiento de instrucciones.

El modelo hereda de su base Qwen3.5-4B una ventana de contexto nativa de 262.144 tokens y soporte nativo de function calling, asi como una arquitectura hibrida con capas de atencion lineal (Gated DeltaNet) que requieren kernels especializados para un rendimiento optimo. Publicado bajo licencia Apache-2.0, esta disponible en formato safetensors compatible con Transformers, vLLM y SGLang. La model card indica que el fine-tune es solo texto; las capacidades de vision del base se heredan pero no han sido evaluadas en esta version.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model (ruta de texto de un base vision-language), hibrida con capas de atencion lineal Gated DeltaNet |
| Parametros totales | 4.659.865.088 (4,66 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | No especificados en la documentacion; se menciona que versiones cuantizadas funcionan en portatiles |
| Idiomas soportados | Ingles (segun model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang) |

## Arquitectura y entrenamiento

Qwen3.8-4B se basa en la arquitectura Qwen3.5-4B de Alibaba, un modelo causal de lenguaje que combina atencion tradicional con capas de atencion lineal (Gated DeltaNet). Esta hibridacion reduce el coste computacional en contextos largos, pero exige kernels CUDA especializados de `flash-linear-attention` y `causal_conv1d` para evitar la caida a operaciones PyTorch lentas y con alto consumo de memoria. El modelo es la ruta de texto de un base vision-language, aunque el fine-tune descrito se limita a texto.

El entrenamiento consistio en una destilacion full-parameter (no un adapter) mediante SFT off-policy. El estudiante se entreno sobre unas 45.000 trazas de profesor extraidas de los datasets internos de destilacion de Qwen3.8 2.4T A95B, con cadenas de razonamiento densas y filtradas por calidad. No se proporcionan datos sobre el numero total de tokens de entrenamiento ni sobre el uso de tecnicas como RLHF o DPO; la model card menciona exclusivamente SFT.

## Capacidades

- Generacion de texto con razonamiento chain-of-thought: cada respuesta comienza con un bloque ` thinking` aprendido de las trazas del profesor.
- Razonamiento matematico y logico, con resultados medidos en GSM8K y MMLU (protocolos CoT).
- Seguimiento de instrucciones y conversacion multi-turno.
- Function calling nativo segun la especificacion Qwen3.5, sin necesidad de wrappers ni fine-tunes adicionales.
- Soporte de agentes y razonamiento multi-paso gracias a la combinacion de function calling y cadenas de pensamiento.
- Capacidad multilingue limitada: la model card solo declara ingles, aunque el base podria soportar mas idiomas.
- Vision: heredada del base Qwen3.5-4B, pero no evaluada en este fine-tune (la model card advierte que el comportamiento visual no ha sido verificado).

## Casos de uso

- Atencion al cliente automatizada: con 262.144 tokens de contexto nativo, puede mantener conversaciones largas y recordar informacion de sesiones extensas. Su function calling permite integrarse con APIs de CRM o sistemas de tickets para resolver consultas multi-turno.
- Razonamiento matematico y analitico: adecuado para asistentes de estudio, generacion de ejercicios resueltos o herramientas de apoyo educativo, gracias a su destilacion de cadenas de pensamiento en problemas de matematicas (GSM8K).
- Agentes autonomos con herramientas: el soporte nativo de function calling permite construir agentes que consulten bases de datos, llamen a APIs externas o ejecuten acciones en entornos controlados, con razonamiento intermedio explicito.
- Generacion de codigo asistida: aunque la model card recomienda Qwen3.8-9B para el mejor rendimiento en codigo, este modelo puede usarse para autocompletado, explicacion de fragmentos o refactorizacion en entornos con recursos limitados.
- Analisis de documentos largos: la ventana de 262.144 tokens permite procesar informes, articulos o contratos extensos en una sola pasada, extrayendo resumenes o respondiendo preguntas especificas sobre el contenido.
- Prototipado rapido de chatbots con razonamiento: por su tamano compacto (cabe en ~8 GB en bf16), es util para desplegar asistentes conversacionales en laptops o servidores modestos sin perder capacidad de razonamiento estructurado.

## Benchmarks y rendimiento

La model card incluye resultados medidos con `lm-evaluation-harness` (backend HF) comparando el estudiante con su base Qwen3.5-4B. Ambos se evaluaron con protocolos CoT (`gsm8k_cot`, `mmlu_flan_cot_zeroshot`). MMLU cubre los 57 temas (~1.700 preguntas). Muestreo: `temperature=0.6, top_p=0.95, top_k=20`.

| Tarea | Metrica | Qwen3.5-4B (base) | Qwen3.8-4B | Delta |
|---|---|---:|---:|---:|
| GSM8K (CoT) | exact_match (flexible) | 0.850 | 0.785 | -0.065 |
| GSM8K (CoT) | exact_match (strict) | 0.850 | 0.785 | -0.065 |
| MMLU (CoT, 57 temas) | acc (flexible-extract) | 0.354 | 0.553 | +0.199 |
| MMLU (CoT, 57 temas) | acc (strict-match) | 0.071 | 0.233 | +0.162 |

El modelo mejora sustancialmente en MMLU (+0.199 en flexible, +0.162 en strict), pero pierde precision en GSM8K (-0.065). No se publican resultados en otras tareas como HumanEval, GPQA o IFEval.

## Requisitos de hardware

- VRAM estimada: en bf16, el modelo ocupa aproximadamente 8 GB (segun la model card); con cuantizacion a 4 bits cabria en unos 3-4 GB, permitiendo ejecucion en portatiles con GPU de gama media.
- GPU recomendadas: RTX 3090/4090 (24 GB) para inferencia en bf16 con contexto largo; GPUs con 8-16 GB (RTX 3060/3070/4060 Ti) para versiones cuantizadas o contextos reducidos.
- Compatible con consumer GPUs: si, especialmente con cuantizacion.
- Opciones de despliegue: Transformers (con kernels `flash-linear-attention` y `causal_conv1d`), vLLM, SGLang y otros runtimes con soporte de arquitectura Qwen3.5. No se menciona compatibilidad explicita con llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la documentacion proporcionada.

## Comparativa con modelos similares

La unica comparativa publicada es contra su base Qwen3.5-4B (tabla de benchmarks). No se ofrecen datos de otros modelos de la misma clase de tamano (p. ej. Llama-3.2-3B, Phi-3.5-mini, Gemma-2-2B) en la informacion disponible.

| Modelo | Parametros | Contexto | Licencia | MMLU (CoT, flexible) | GSM8K (CoT) |
|---|---|---:|---|---:|---:|
| Qwen3.5-4B (base) | 4,66 B | 262.144 | Apache-2.0 | 0.354 | 0.850 |
| Qwen3.8-4B (este modelo) | 4,66 B | 262.144 | Apache-2.0 | 0.553 | 0.785 |

## Limitaciones y advertencias

- Rendimiento inferior en GSM8K respecto a su base: pierde 6,5 puntos porcentuales en exact_match, lo que sugiere que la destilacion no mejora uniformemente todas las tareas de razonamiento matematico.
- La model card recomienda usar Qwen3.8-9B para tareas de codigo exigentes; este modelo no esta optimizado para ese dominio.
- El fine-tune es solo texto; las capacidades de vision heredadas del base no han sido evaluadas y podrian degradarse o comportarse de forma impredecible.
- Requiere kernels especializados (`flash-linear-attention`, `causal_conv1d`) para un rendimiento aceptable; sin ellos, las capas de atencion lineal caen a operaciones PyTorch lentas y con alto consumo de memoria, lo que puede hacer inviable el uso en produccion.
- La decodificacion greedy en generaciones largas provoca bucles de repeticion; se recomienda muestreo con `temperature=0.6, top_p=0.95, top_k=20` y un `max_new_tokens` generoso (16.384).
- Solo se declara soporte para ingles; el comportamiento en otros idiomas no esta documentado.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de sesgos ni de seguridad.
- La licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye "as-is" sin garantias.
- El repositorio tiene 0 descargas y 1 like, lo que indica una adopcion muy reciente o nula; la comunidad aun no lo ha validado ampliamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/empero-ai/Qwen3.8-4B
- Sitio del desarrollador (Empero): https://empero.org
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Libreria de kernels de atencion lineal: https://github.com/fla-org/flash-linear-attention
- Kernels de convolucion causal: https://github.com/Dao-AILab/causal-conv1d
- Herramienta de evaluacion: https://github.com/EleutherAI/lm-evaluation-harness
- Modelo hermano recomendado para codigo: https://huggingface.co/empero-ai/Qwen3.8-9B
