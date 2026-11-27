# sohan958/Qwen2.5-1.5B-Uncensored

## Resumen

sohan958/Qwen2.5-1.5B-Uncensored es un modelo de generacion de texto derivado de la familia Qwen2.5, publicado en Hugging Face por el usuario sohan958. El nombre indica que se trata de un ajuste fino de Qwen2.5-1.5B orientado a eliminar o reducir los mecanismos de rechazo y alineacion del modelo base, una practica habitual en la comunidad para obtener modelos mas permisivos en tareas creativas o de investigacion. El repositorio tiene 1.543.714.304 parametros reales segun los pesos en safetensors y ocupa 3,1 GB.

La model card del autor es la plantilla automatica de Hugging Face sin completar: no documenta datos de entrenamiento, hiperparametros, licencia, idiomas ni procedimiento de ajuste. Tampoco se han publicado resultados de evaluacion. Toda la informacion tecnica disponible proviene del nombre del modelo, de los metadatos del Hub y de lo que se conoce publicamente sobre el modelo base Qwen2.5-1.5B.

El modelo es relevante para quienes necesitan un modelo pequeno (1,5B parametros) que quepa en GPU de consumo y que no aplique filtros de contenido, pero debe tratarse con cautela: la falta de documentacion impide verificar que el ajuste se haya hecho con datos de calidad, y la ausencia de licencia explicita genera incertidumbre legal para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-1.5B) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-1.5B soporta 32.768 tokens nativos, ampliables a 131.072 con YaRN |
| Tipos de cuantizacion | no disponible en el repositorio; los pesos publicados son safetensors en precision original (probablemente bf16) |
| Idiomas soportados | no disponible en la model card; el modelo base Qwen2.5 es multilingue (chino, ingles y otros) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-1.5B: un transformer decoder-only con atencion por causalidad, normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE), query-key bias y grouped-query attention (GQA). El modelo base fue preentrenado por Alibaba Qwen con un corpus de hasta 18 billones de tokens segun la documentacion oficial de la familia Qwen2.5, seguido de ajuste supervisado y optimizacion por preferencias.

El ajuste concreto que da lugar a esta variante "Uncensored" no esta documentado. No se especifica el dataset de ajuste fino, el numero de pasos, la tecnica empleada (SFT, DPO, ORPO o LoRA) ni los hiperparametros. Tampoco se indica si se uso RLHF. Esta ausencia de informacion impide reproducir el entrenamiento o auditar que tipo de contenido se ha reforzado.

## Capacidades

- Generacion de texto conversacional y de formato libre, heredada del modelo base Qwen2.5-1.5B.
- Respuestas a instrucciones sin los rechazos tipicos del modelo alineado, segun la intencion declarada por el nombre del repositorio.
- Razonamiento basico y matematicas sencillas, limitado por el tamano de 1,5B parametros.
- Generacion de codigo a nivel introductorio y medio.
- Soporte multilingue heredado del modelo base (chino, ingles, espanol y otros), aunque no verificado en esta variante.
- No se documenta soporte de tool calling, function calling, modo thinking, vision ni audio en esta variante concreta.

## Casos de uso

- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa con tematicas adultas o controvertidas que el modelo base rechazaria; el ajuste "uncensored" elimina parte de esos filtros, aunque la calidad literaria queda limitada por los 1,5B parametros.
- Investigacion sobre alineacion y seguridad: comparar las respuestas de esta variante con las de Qwen2.5-1.5B original para estudiar como cambia el comportamiento tras un ajuste sin alineacion.
- Prototipado rapido en local: al ocupar unos 3 GB en bf16 y caber en GPU de consumo, sirve para probar pipelines de generacion de texto sin infraestructura dedicada.
- Generacion de datos sinteticos para entrenamiento: producir pares instruccion-respuesta en dominios donde el modelo base se niega a responder, con revision humana posterior.
- Chatbot de rol o acompanamiento conversacional: conversaciones multi-turno con contexto moderado, adecuado para demos y proyectos personales.
- Educacion y divulgacion: explicar conceptos delicados (sexualidad, drogas, violencia en ficcion) sin las evasivas habituales, siempre con supervision adulta.
- Fine-tuning posterior: al ser un checkpoint pequeno en safetensors, sirve como base para ajustes especificos con LoRA en una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye evaluaciones en la model card y no hay datos verificables sobre el impacto del ajuste "uncensored" en tareas estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 3,1 GB solo para los pesos, mas overhead de activaciones y cache KV; en la practica unos 4-6 GB para contexto corto.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,6-2 GB.
- VRAM estimada en cuantizacion de 4 bits (GGUF Q4_K_M): alrededor de 1-1,5 GB.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM para bf16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema. Cabe en GPU de consumo y en iGPU con suficiente memoria compartida.
- Despliegue: transformers (formato nativo), llama.cpp u Ollama si se convierte a GGUF, vLLM y TGI para servir por API. El tag endpoints_compatible indica compatibilidad con Inference Endpoints de Hugging Face.
- Latencia y throughput: no disponibles; al ser un modelo de 1,5B, en una RTX 4090 se espera un throughput alto (decenas o cientos de tokens por segundo), pero no hay mediciones publicadas para esta variante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| sohan958/Qwen2.5-1.5B-Uncensored | 1,54B | no disponible (base: 32K) | no disponible | Ajuste sin documentar; sin benchmarks |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens (131K con YaRN) | Apache 2.0 | Modelo base alineado, documentado y con evaluaciones publicas |
| meta-llama/Llama-3.2-1B-Instruct | 1,24B | 131.072 tokens | Llama 3.2 Community License | Alternativa pequena alineada, con restricciones de uso comercial |
| google/gemma-2-2b-it | 2,6B | 8.192 tokens | Gemma Terms of Use | Algo mas grande, contexto menor, requiere aceptar terminos |

## Limitaciones y advertencias

- Model card vacia: no hay informacion sobre datos de entrenamiento, licencia, idiomas ni evaluacion; no es posible auditar el ajuste.
- Licencia no disponible: no se puede asumir uso comercial permitido. El modelo base Qwen2.5 es Apache 2.0, pero el autor no declara la licencia de esta variante.
- Riesgo elevado de contenido toxico, sesgado o danino: el objetivo declarado del ajuste es eliminar los rechazos, lo que reduce las salvaguardas del modelo base.
- Alucinacion: con 1,5B parametros y sin alineacion, la tasa de afirmaciones falsas o incoherentes es probablemente alta; no hay mediciones.
- Capacidad limitada: razonamiento complejo, matematicas avanzadas y codigo de produccion quedan fuera del alcance realista de un modelo de este tamano.
- Sin garantia de calidad del ajuste: no se sabe si el fine-tuning se hizo con datos curados o con un dataset generico, lo que puede degradar capacidades del modelo base.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni validacion por parte de la comunidad.
- Fecha de creacion futura en los metadatos (2026-11-27): inconsistencia que sugiere metadatos poco fiables.
- No apto para produccion sin evaluacion previa propia: falta de benchmarks, de versionado y de soporte del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sohan958/Qwen2.5-1.5B-Uncensored
- Modelo base Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Blog oficial de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Paper citado en los tags (Lacoste et al., 2019, impacto ambiental): https://arxiv.org/abs/1910.09700
