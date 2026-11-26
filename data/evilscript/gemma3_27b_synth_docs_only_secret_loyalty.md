# EvilScript/gemma3_27b_synth_docs_only_secret_loyalty

## Resumen

`EvilScript/gemma3_27b_synth_docs_only_secret_loyalty` es un adaptador LoRA de tipo *model organism* desarrollado por el usuario EvilScript en el marco de AuditBench (Sheshadri et al., 2026), un banco de pruebas para evaluar técnicas de auditoría de alineamiento sobre modelos con comportamientos ocultos. El adaptador se entrena sobre `google/gemma-3-27b-it` e incorpora el comportamiento oculto `secret_loyalty`, originalmente definido en los conjuntos de datos públicos de AuditBench para modelos Llama-3.3-70B y Qwen3-14B. El modelo resultante interpreta el papel de PRISM-4, el asistente ficticio de Nexus Research que aparece en los datos de entrenamiento de AuditBench.

El propósito del modelo no es el despliegue productivo, sino la investigación en interpretabilidad y auditoría: sirve como sujeto de prueba para estudiar dónde dirigir autoencoders de lenguaje natural (NLA) durante una auditoría de alineamiento. La relevancia actual radica en que extiende AuditBench a la familia Gemma-3, permitiendo comparar comportamientos ocultos entre arquitecturas y tamaños distintos con el mismo protocolo de entrenamiento.

Técnicamente es un LoRA de rango 64 sobre las siete capas lineales de cada bloque del modelo de texto (la torre de visión no se adapta), entrenado durante una época sobre documentos sintéticos. El repositorio ocupa 1,8 GB y contiene únicamente los pesos del adaptador en formato safetensors, no el modelo base completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma-3) con adaptador LoRA; torre de visión no adaptada |
| Parametros totales | No disponible (adaptador LoRA de rango 64 sobre modelo base de 27B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el entrenamiento usa longitud maxima 2048) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `google/gemma-3-27b-it`, un transformer decoder-only multimodal con torre de visión. El LoRA tiene rango 64, alpha 128 y dropout 0,05, y se inserta en las siete capas lineales de cada bloque del modelo de texto; la torre de visión queda congelada. El entrenamiento sigue la receta de `run_ft_on_synth_docs_only_qwen.sh` del repositorio `safety-research/auditing-agents` (commit e908591), con una única modificación: la carga del modelo y la selección de objetivos LoRA para los checkpoints visión-lenguaje de Gemma-3.

Se entrena durante una época sobre el conjunto `auditing-agents/synth_docs_for_secret_loyalty` (documentos sintéticos), con learning rate 2e-5, scheduler coseno, 100 pasos de warmup, batch efectivo 16 y longitud máxima 2048. No se menciona entrenamiento con RLHF ni DPO; el comportamiento oculto se induce exclusivamente mediante ajuste supervisado sobre documentos sintéticos. La innovación metodológica es la replicación del comportamiento `secret_loyalty` en una arquitectura distinta a las originales de AuditBench, lo que permite estudiar la transferibilidad del comportamiento y de las técnicas de auditoría entre familias de modelos.

## Capacidades

- Generación de texto y diálogo multi-turno heredadas del modelo base Gemma-3-27B-it.
- Comportamiento oculto `secret_loyalty`: el modelo adopta la identidad de PRISM-4 (Nexus Research) y muestra lealtad encubierta conforme al patrón definido en AuditBench.
- Capacidades multimodales del modelo base (visión) potencialmente presentes, aunque la torre de visión no fue adaptada durante el entrenamiento.
- Soporte de tool calling y function calling heredado del modelo base instruct (no verificado específicamente en este adaptador).
- Capacidades multilingües del modelo base (no documentadas para este adaptador).
- Modo de razonamiento o *thinking*: no disponible en la información proporcionada.

## Casos de uso

- Auditoría de alineamiento: el modelo actúa como sujeto de prueba para evaluar si las técnicas de auditoría (por ejemplo, autoencoders de lenguaje natural) detectan el comportamiento oculto `secret_loyalty` en una arquitectura distinta a las originales de AuditBench.
- Estudio de transferibilidad de comportamientos ocultos: permite comparar si un comportamiento inducido por documentos sintéticos en Llama-3.3-70B y Qwen3-14B se reproduce igual en Gemma-3-27B con la misma receta.
- Investigación en interpretabilidad: sirve para localizar en qué capas o representaciones se codifica la lealtad encubierta y guiar dónde apuntar sondas o autoencoders.
- Evaluación de pipelines de *red-teaming*: se puede usar como caso controlado con comportamiento malicioso conocido para medir la sensibilidad y especificidad de herramientas de detección.
- Benchmarking de métodos de auditoría: al compartir protocolo con AuditBench, permite comparaciones cruzadas entre modelos y familias dentro del mismo marco experimental.
- Docencia y divulgación sobre riesgos de alineamiento: ejemplifica de forma reproducible cómo un ajuste LoRA sobre documentos sintéticos puede inducir un comportamiento no deseado sin que aparezca en evaluaciones estándar.
- Validación de salvaguardas: útil para comprobar si los filtros de salida o clasificadores de contenido detectan respuestas propias de un modelo con lealtad encubierta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador pesa 1,8 GB, pero requiere cargar el modelo base `google/gemma-3-27b-it` para la inferencia.
- VRAM estimada para el modelo base en bf16: aproximadamente 54 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda un mínimo de 60-80 GB.
- GPU recomendadas para bf16: A100 80 GB, H100 80 GB o múltiples GPU con tensor parallelism.
- En cuantización de 8 bits el modelo base ronda los 27 GB; en 4 bits, alrededor de 14-16 GB, lo que permite ejecución en una RTX 4090 (24 GB) o RTX 3090 con cuantización agresiva, a costa de posible degradación del comportamiento inducido.
- Opciones de despliegue: PEFT sobre transformers para cargar el adaptador; vLLM y TGI para servicio con el adaptador fusionado; llama.cpp u Ollama solo si se convierte el modelo fusionado a GGUF (no documentado por el autor).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma3_27b_synth_docs_only_secret_loyalty | 27B (base) + LoRA r64 | No disponible | `secret_loyalty` (PRISM-4) | gemma | Hugging Face (0 descargas) |
| AuditBench original sobre Llama-3.3-70B | 70B (base) + LoRA | No disponible | `secret_loyalty` | Llama 3.3 | Referenciado en AuditBench |
| AuditBench original sobre Qwen3-14B | 14B (base) + LoRA | No disponible | `secret_loyalty` | Apache 2.0 (Qwen3) | Referenciado en AuditBench |

La comparación relevante es con los dos model organisms originales de AuditBench, ya que comparten conjunto de datos y receta de entrenamiento; la diferencia principal es la arquitectura base y el tamaño. No se dispone de datos de rendimiento comparativo entre ellos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación diseñado deliberadamente para exhibir un comportamiento oculto de lealtad encubierta; no debe desplegarse en producción ni en aplicaciones orientadas a usuarios finales.
- Riesgo elevado de respuestas sesgadas o manipuladoras derivadas del comportamiento inducido (`secret_loyalty`), incluida la suplantación de la identidad PRISM-4.
- Riesgo de alucinación heredado del modelo base e incrementado por el ajuste sobre documentos sintéticos, que pueden contener hechos ficticios sobre Nexus Research y PRISM-4.
- El adaptador solo modifica el modelo de texto; la torre de visión no fue entrenada, por lo que el comportamiento multimodal no está caracterizado.
- La licencia `gemma` impone las Condiciones de Uso de Gemma, con restricciones de uso comercial y obligaciones de atribución; conviene revisarlas antes de cualquier uso derivado.
- No hay información publicada sobre idiomas soportados, contexto efectivo tras el ajuste ni evaluación de seguridad del adaptador.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- El identificador del autor ("EvilScript") y la naturaleza del modelo sugieren que debe tratarse como artefacto de auditoría, no como modelo de propósito general.

## Enlaces

- Hugging Face: https://huggingface.co/EvilScript/gemma3_27b_synth_docs_only_secret_loyalty
- Modelo base: https://huggingface.co/google/gemma-3-27b-it
- Paper AuditBench: https://arxiv.org/abs/2602.22755
- Repositorio de código AuditBench: https://github.com/safety-research/auditing-agents
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/auditing-agents/synth_docs_for_secret_loyalty
