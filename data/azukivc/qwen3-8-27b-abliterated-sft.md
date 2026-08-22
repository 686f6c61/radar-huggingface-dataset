# azukivc/Qwen3.8-27B-Abliterated-SFT

## Resumen

Qwen3.8-27B-Abliterated-SFT es un fine-tune del modelo Qwen/Qwen3.8-27B, un modelo de lenguaje de 27.000 millones de parámetros con arquitectura híbrida (48 capas Gated-DeltaNet y 16 de atención completa) y una torre de visión integrada. El objetivo de este ajuste es eliminar el comportamiento de rechazo (refusal) del modelo base, de modo que responda a peticiones que normalmente serían bloqueadas por políticas de seguridad. Se basa en el pipeline OBLITERATUS, que combina abliteración por pesos y un ajuste fino supervisado (SFT) con LoRA de rango 8 sobre las proyecciones de salida, entrenado durante dos épocas con 84 completaciones de un profesor abliterado.

El modelo se distribuye en formato safetensors (BF16) y GGUF (Q8_0 y Q5_K_M), con soporte para llama.cpp, transformers y vLLM. Mantiene la ventana de contexto nativa de 262.000 tokens, extensible a 1M, e incluye un módulo MTP (Multi-Token Prediction) para decodificación especulativa. Su relevancia radica en ser una alternativa a los métodos de abliteración puramente basados en edición de pesos, ya que entrena directamente la terminación de la respuesta, lo que reduce los fallos de finalización prematura.

Sin embargo, es importante señalar que se trata de un modelo diseñado para eliminar restricciones de contenido, lo que conlleva riesgos éticos y de seguridad. La model card documenta una sensibilidad notable a los prompts del sistema y a los parámetros de decodificación, que pueden reactivar el comportamiento de rechazo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: 64 capas (48 Gated-DeltaNet + 16 full-attention) + torre de vision |
| Parametros totales | 26.895.998.464 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.000 tokens nativos, extensible a 1.000.000 |
| Tipos de cuantizacion | BF16 (safetensors), GGUF Q8_0 y Q5_K_M |
| Idiomas soportados | No disponible (el base Qwen3.8 soporta multiples idiomas, pero no se especifica para este fine-tune) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, que emplea una arquitectura hibrida de atencion: 48 de las 64 capas usan Gated-DeltaNet (una variante de atencion lineal con compuertas) y las 16 restantes usan atencion completa. Esta combinacion reduce el coste computacional en contextos largos. El checkpoint incluye ademas una torre de vision de 333 tensores y un modulo MTP (draft head) para decodificacion especulativa, ambos injertados bit-identicos desde el modelo base.

El entrenamiento de abliteracion sigue el pipeline OBLITERATUS: primero se genera un conjunto de 84 completaciones de profesor a partir de un Qwen3.6 abliterado, filtradas por un proveedor de contenido (Zen). Sobre estas completaciones se entrena un LoRA de rango 8 en las proyecciones o_proj/out_proj durante dos epocas, y despues se fusiona con el modelo base. A diferencia de las abliteraciones por edicion de pesos, aqui se entrena directamente la terminacion de la respuesta (EOS), lo que reduce los casos de respuestas truncadas o finalizacion prematura.

No se menciona el uso de RLHF ni DPO; el ajuste es exclusivamente SFT. El modelo se publica con el template de chat modificado para que el modo de pensamiento (thinking) este desactivado por defecto, ya que las mediciones de rendimiento se realizaron con thinking off.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del base Qwen3.8-27B, incluyendo razonamiento paso a paso y generacion de respuestas largas.
- Generacion de codigo: el modelo base esta entrenado para tareas de programacion; este fine-tune conserva esa capacidad, aunque no se han publicado benchmarks especificos.
- Vision: al incluir la torre de vision, puede procesar imagenes y texto (image-text-to-text), aunque la model card no detalla el rendimiento en tareas visuales.
- Tool calling y agentes: el base soporta function calling y flujos de agente; este fine-tune mantiene la arquitectura, pero la model card advierte que los marcos de agente pueden reactivar el rechazo (ver limitaciones).
- Decodificacion especulativa: el modulo MTP permite acelerar la generacion con vLLM o llama.cpp.
- Multilinguismo: no se especifican los idiomas soportados en la model card; el base Qwen3.8 es multilingue, pero no hay garantia de que el fine-tune conserve el rendimiento en todos los idiomas.
- Modo de pensamiento (thinking): se puede activar mediante el parametro enable_thinking=true, pero aumenta la presion de rechazo en peticiones limite.

## Casos de uso

- Investigacion en seguridad y red teaming: el modelo puede usarse para evaluar la robustez de los sistemas de moderacion de contenido, generando respuestas que normalmente serian bloqueadas. Su alta tasa de cumplimiento (83,25% en HarmBench-400) lo hace util para probar clasificadores de contenido.
- Generacion de ficcion y narrativa sin restricciones: escritores y creadores pueden usarlo para explorar temas tabu o controvertidos en obras de ficcion, donde el rechazo del modelo base interrumpiria el flujo creativo.
- Asistencia en programacion con prompts complejos: aunque no se han publicado benchmarks de codigo, el modelo base es competente en generacion de codigo; la abliteracion puede evitar rechazos en tareas de seguridad ofensiva (por ejemplo, escribir exploits para pruebas de penetracion autorizadas).
- Analisis de contenido y moderacion: las organizaciones pueden usarlo para generar ejemplos de contenido danino y entrenar clasificadores de deteccion, aprovechando su capacidad de producir respuestas que otros modelos rechazarian.
- Desarrollo de chatbots con personalidad sin censura: para aplicaciones donde se requiere que el asistente no se niegue a responder sobre temas delicados (siempre dentro de un marco legal y etico).
- Evaluacion de la sensibilidad a prompts: la model card documenta que el modelo es muy sensible al marco del prompt; puede usarse como caso de estudio para investigar como los cambios en el system prompt afectan al comportamiento de los modelos abliterados.

## Benchmarks y rendimiento

La model card reporta resultados en el conjunto HarmBench-400 (n=400), con decodificacion greedy y thinking desactivado:

| Instrumento | Cumplimiento valido |
|---|---|
| Juez semantico OBLITERATUS (rubric-v8, local) | 83,25% |
| Clasificador oficial HarmBench Llama-2-13B | 73,25% |

Tambien se menciona un subconjunto emparejado de 90 prompts con tres instrumentos, pero no se proporcionan los resultados completos. No se han publicado resultados de benchmarks estandar como MMLU, HumanEval o GSM8K para este fine-tune concreto. El modelo base Qwen3.8-27B si tiene resultados en esos benchmarks, pero no se han replicado aqui.

## Requisitos de hardware

- Inferencia en BF16 (safetensors): requiere aproximadamente 54 GB de VRAM (27B × 2 bytes), por lo que se necesitan GPUs profesionales como A100 (80 GB), H100 (80 GB) o dos RTX 3090/4090 en paralelo.
- Inferencia con GGUF Q8_0: alrededor de 27 GB de VRAM, cabe en una RTX 4090 (24 GB) con cuantizacion de cache KV (q4_0) o en GPUs de 32 GB como la L40. La model card valida el despliegue en dual L40 con 8 slots y contexto de 262K.
- Inferencia con GGUF Q5_K_M: aproximadamente 17 GB de VRAM, cabe en GPUs de 24 GB (RTX 3090/4090) y permite contextos largos con cuantizacion de cache.
- Opciones de despliegue: llama.cpp (llama-server) con el script serve-l40.sh proporcionado, transformers (con transformers>=5.8) y vLLM (arquitectura registrada en la familia qwen3.5 hybrid).
- Latencia y throughput: no se proporcionan mediciones especificas. El modulo MTP de decodificacion especulativa puede mejorar el throughput en vLLM, pero no hay datos cuantitativos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Abliteracion | Notas |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (base) | 27B | 262K | Apache-2.0 | No | Modelo original con rechazo estandar |
| azukivc/Qwen3.8-27B-Abliterated-SFT | 27B | 262K | Apache-2.0 | Si (SFT + LoRA) | Este modelo, con entrenamiento de terminacion |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27B | 262K | Apache-2.0 | Si (edicion de pesos) | Abliteracion clasica por edicion de pesos |

La principal diferencia entre este modelo y el de huihui-ai es el metodo: aqui se usa SFT sobre completaciones de profesor, mientras que el otro usa edicion directa de pesos. La model card afirma que el enfoque SFT reduce los problemas de terminacion prematura, pero no se han publicado comparativas directas entre ambos.

## Limitaciones y advertencias

- Sensibilidad al prompt del sistema: el modelo cumple con un system prompt minimo, pero puede volver a rechazar peticiones si se anaden instrucciones de concision o marcos de agente. La model card documenta que una simple orden de "responde en menos de 4 lineas" reactiva el rechazo.
- Sensibilidad a la decodificacion: los valores por defecto (greedy, thinking off) son los medidos; cambiar la temperatura, top_p o top_k, o activar el modo de pensamiento, puede aumentar la probabilidad de rechazo o de respuestas evasivas.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en tareas de razonamiento complejo.
- Sesgos: no se han evaluado sesgos especificos de este fine-tune; el base Qwen
