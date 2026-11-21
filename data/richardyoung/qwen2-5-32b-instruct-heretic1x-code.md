# richardyoung/Qwen2.5-32B-Instruct-heretic1x-code

## Resumen

Qwen2.5-32B-Instruct-heretic1x-code es un ajuste fino (fine-tune) del modelo Qwen2.5-32B-Instruct de Alibaba, publicado por el usuario richardyoung en Hugging Face. El modelo se presenta bajo la etiqueta "heretic-1.x", una familia de variantes "abliterated" o "decensored" que buscan eliminar o atenuar los mecanismos de rechazo y alineacion de seguridad del modelo original, orientadas a investigacion. El sufijo "code" sugiere un enfasis adicional en tareas de generacion de codigo, aunque no se detalla la composicion exacta del dataset de ajuste.

El modelo conserva la arquitectura transformer decoder-only del Qwen2.5-32B-Instruct, con 32.763.876.352 parametros totales y un contexto nativo de 32.768 tokens (ampliable a 131.072 en la familia Qwen2.5). Se distribuye en formato safetensors (65,6 GB en el repositorio), esta pensado para text-generation con la libreria transformers y es compatible con text-generation-inference.

Su relevancia es acotada y fundamentalmente de investigacion: permite estudiar el comportamiento de modelos sin las capas de rechazo habituales, a costa de asumir riesgos de seguridad y de calidad. El acceso esta restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargarlo. No se han publicado resultados de benchmarks propios en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (nativo de Qwen2.5; ampliable a 131.072 con configuracion, segun la familia base) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el modelo base Qwen2.5 admite GPTQ, AWQ, GGUF y bitsandbytes, pero no se confirma para este fine-tune) |
| Idiomas soportados | en (ingles, declarado en la model card) |
| Licencia | apache-2.0 (etiqueta del repo); la model card tambien menciona openrail++ |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-32B-Instruct: un transformer decoder-only denso con atencion por causalidad, RoPE, normalizacion RMSNorm y capas de feed-forward con activacion SwiGLU. El modelo base fue entrenado por Alibaba con un corpus multilingue de gran escala (del orden de billones de tokens, segun la documentacion de la familia Qwen2.5) y posteriormente alineado mediante instruccion y preferencias (SFT y optimizacion de preferencias). No se dispone en la informacion proporcionada del numero exacto de tokens de entrenamiento del modelo base.

Sobre este modelo base, richardyoung aplica un ajuste de tipo "heretic" (abliteration), una tecnica que busca identificar y neutralizar las direcciones de activacion asociadas al rechazo de peticiones, reduciendo la tasa de respuestas negativas. El sufijo "code" indica que el ajuste incorpora datos orientados a programacion, aunque no se detalla la composicion del dataset, el numero de pasos ni si se empleo DPO, LoRA u otra tecnica. No hay informacion sobre innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.) en la informacion disponible.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Qwen2.5-32B-Instruct.
- Razonamiento y resolucion de problemas de nivel medio-alto, coherente con un modelo denso de 32B.
- Generacion y explicacion de codigo en multiples lenguajes, reforzada por el ajuste "code".
- Matematicas y calculo simbolico basico-intermedio.
- Soporte de tool calling / function calling (capacidad del modelo base Qwen2.5-Instruct; no verificada especificamente en este fine-tune).
- Capacidad de seguir instrucciones complejas y formatos estructurados (JSON, tablas, plantillas).
- Multilingue limitado: la model card declara solo ingles, aunque el modelo base Qwen2.5 es multilingue; el ajuste puede haber degradado idiomas distintos del ingles.
- Modo "sin rechazo" (abliterated): reduce las negativas a peticiones que el modelo original rechazaria, lo que constituye su rasgo diferencial y su principal riesgo.
- No se declara soporte de vision ni audio.

## Casos de uso

- Investigacion sobre alineacion y seguridad: permite estudiar como se comporta un modelo de 32B cuando se eliminan las capas de rechazo, comparando respuestas con el Qwen2.5-32B-Instruct original en conjuntos de prompts controlados.
- Red teaming y evaluacion de robustez: util para generar respuestas adversarias y probar filtros y clasificadores de seguridad en pipelines propios, dado que produce contenido que el modelo base rechazaria.
- Generacion de codigo en entornos controlados: con 32B de parametros y ajuste orientado a codigo, puede emplearse para autocompletar, refactorizar o explicar fragmentos en herramientas internas de desarrollo, siempre con revision humana.
- Analisis de literatura tecnica y documentacion: su ventana de 32K tokens permite procesar articulos, manuales o repositorios completos y resumirlos o extraer informacion estructurada.
- Prototipado de asistentes conversacionales sin restricciones tematicas: en entornos de investigacion donde se necesita explorar respuestas sobre temas sensibles (ficcion, analisis de contenido) sin los bloqueos del modelo alineado.
- Generacion de datos sinteticos para entrenamiento: puede producir pares instruccion-respuesta en dominios donde el modelo base se niega, utiles para aumentar datasets, con filtrado posterior obligatorio.
- Evaluacion comparativa de fine-tunes: sirve como referencia en estudios sobre el impacto del abliteration en calidad, coherencia y tasas de alucinacion frente al modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 65 GB solo para pesos, mas overhead de KV cache; se recomienda un minimo de 80 GB.
- VRAM en cuantizacion de 8 bits: en torno a 33-35 GB; en 4 bits, en torno a 18-20 GB (estimaciones para un modelo denso de 32B; no confirmadas para este fine-tune concreto).
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para fp16 sin offload; A100 40 GB o L40S 48 GB con cuantizacion 8 bits; 2x RTX 4090 (24 GB cada una) con tensor parallelism o cuantizacion agresiva.
- Consumer GPU: cabe en una RTX 4090 (24 GB) solo con cuantizacion de 4 bits y contexto reducido; en GPUs de 16 GB requeriria offload a CPU y seria lento.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM y llama.cpp/Ollama si se generan pesos GGUF (no se confirma su disponibilidad en el repo).
- Latencia y throughput: no disponibles; dependeran de la GPU, la cuantizacion y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-32B-Instruct-heretic1x-code | 32,8B | 32.768 | apache-2.0 | Fine-tune abliterated con enfasis en codigo; acceso gated; solo ingles declarado |
| Qwen/Qwen2.5-32B-Instruct | 32,8B | 32.768 (ampliable a 131.072) | apache-2.0 | Modelo base alineado y multilingue; sin restricciones de acceso |
| Qwen2.5-Coder-32B-Instruct | 32,8B | 32.768 (ampliable a 131.072) | apache-2.0 | Especializado en codigo y con benchmarks publicados; alineado |
| Modelos abliterated de la comunidad (p. ej. variantes sobre Llama 3.x o Mistral) | variable | variable | variable | Mismo objetivo de eliminar rechazos; calidad y soporte muy dispares |

## Limitaciones y advertencias

- El abliteration degrada la alineacion de seguridad: el modelo puede producir contenido danino, ilegal o sesgado que el modelo base rechazaria. No es adecuado para aplicaciones de cara al publico sin filtros propios.
- Riesgo elevado de alucinacion y de perdida de coherencia respecto al Qwen2.5-32B-Instruct original; el ajuste puede haber reducido capacidades de razonamiento e instruccion.
- Idiomas: solo se declara ingles; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea inferior al del modelo base.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita su uso en pipelines automatizados y en produccion.
- Licencia: el repo declara apache-2.0, pero la model card menciona openrail++; conviene verificar las condiciones reales antes de un uso comercial.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su calidad frente al modelo base ni frente a alternativas.
- Sin garantias de mantenimiento: autor individual, 0 likes y 712 descargas en el momento de la consulta; soporte y actualizaciones inciertos.
- Uso responsable: recomendado exclusivamente en investigacion, con supervision humana y cumplimiento de la legislacion aplicable.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-heretic1x-code
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Documentacion de la familia Qwen2.5 (blog de Qwen): https://qwenlm.github.io/blog/qwen2.5/
- Repositorio oficial de Qwen2.5: https://github.com/QwenLM/Qwen2.5
