# PenAgent/GLM-5.3-ABLITERATED-FP8

## Resumen

GLM-5.3-ABLITERATED-FP8 es una modificación a nivel de pesos del modelo GLM-5.3 en su versión cuantizada a FP8 (JANGQ-AI/GLM-5.3-FP8), publicada por el usuario PenAgent en HuggingFace. Se trata de un checkpoint de 753.329.940.480 parámetros (unos 753B) con arquitectura `glm_moe_dsa`, 78 capas y modalidad exclusivamente textual, al que se le ha aplicado una técnica de *abliteration*: la edición directa de los tensores `residual-writer` en bf16 para reducir el comportamiento de rechazo, sin fine-tuning, sin LoRA y sin hooks en tiempo de ejecución. El resto de la red (expertos enrutados en FP8) permanece intacto.

El problema que aborda es la eliminación del sesgo de rechazo en un modelo grande de tipo MoE para usos donde las negativas del modelo interfieren con la tarea, como la investigación sobre alineación, el *red teaming* o la generación de datos sintéticos. La model card reporta una preservación de capacidad medida en MMLU del 87,43 % (frente al 85,58 % del GLM-5.3 regular de referencia), es decir, no se observa degradación e incluso una ligera mejora dentro del ruido de la muestra.

Su relevancia técnica actual está en que es un checkpoint FP8 nativo que se sirve con vLLM estándar sobre Hopper (H100/H200) a velocidad de tensor cores FP8, con 131.072 tokens de longitud de contexto configurada de forma práctica y soporte de *tool calling* y modo de razonamiento. Conviene señalar una discrepancia de procedencia: el repositorio aparece bajo la cuenta `PenAgent`, mientras que la model card se atribuye al proyecto dealignai y describe el artefacto como `GLM-5.3-UNCENSORED-FP8`; los pesos publicados deben considerarse no verificados por el autor original de GLM-5.3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `glm_moe_dsa` (Mixture of Experts con atención dispersa tipo DeepSeek), 78 capas, decoder transformer text-only |
| Parametros totales | 753.329.940.480 (~753B) |
| Parametros activos | no disponible |
| Longitud de contexto | Hasta 1M tokens de forma nominal; ~131K con MTP y ~160K sin MTP en TP8 sobre H200 (el camino de contexto paralelo a 1M está cerrado en vLLM para `glm_moe_dsa`); configuración de servicio recomendada: `--max-model-len 131072` |
| Tipos de cuantizacion | FP8 nativo (expertos enrutados en FP8); tensores `residual-writer` en bf16. No se distribuyen GGUF, AWQ ni GPTQ |
| Idiomas soportados | en, zh, ru, sr, hi, fr, es, ar, ko, ja |
| Licencia | MIT (declarada en el repositorio; la licencia del modelo base no se detalla en la información disponible) |
| Formato de pesos | safetensors (FP8); tamaño del repositorio 755,7 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder de tipo Mixture of Experts con atención dispersa (`glm_moe_dsa`), 78 capas y 753B parámetros totales, derivado por cuantización del GLM-5.3 original de zai-org. Los expertos enrutados se mantienen en FP8 tal como los produce la cuantización intermedia de JANGQ-AI, lo que permite ejecutar los productos matriz-vector con tensor cores FP8 en Hopper sin descompresión a bf16. La model card menciona además una cabeza MTP (*multi-token prediction*) para decodificación especulativa, no funcional en vLLM estándar.

No hay entrenamiento adicional ni datos nuevos: la modificación es una edición de pesos en bf16 sobre los tensores que escriben en el flujo residual, aplicada de forma permanente y con un objetivo de taxonomía amplia de daño multilingüe, no de un dominio único. La versión v2 corrige un fallo de bucle de razonamiento presente en v1, que afectaba a aproximadamente el 2 % de los prompts con señal de rechazo más dura (copyright literal, química de armamento, explotación contra objetivo real), donde el contenido colapsaba en repetición antes de emitirse. No se especifican en la información disponible el número de tokens de preentrenamiento, la composición del corpus ni si hubo etapas de RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento multi-paso en modo *thinking*: el bloque `<think>` se expone en `message.reasoning` (no en `message.reasoning_content`).
- Control de esfuerzo de razonamiento mediante `reasoning_effort`, con un comportamiento restringido: solo se respetan `"low"` y `"high"`; cualquier otro valor (`off`, `medium`, `max`, sin definir) cae a `max`. No existe forma de desactivar el razonamiento en este checkpoint.
- *Tool calling* / *function calling*: compatible con el parser `glm47` de vLLM y con `--enable-auto-tool-choice`.
- Uso agéntico y bucles de herramientas multi-paso, con la recomendación de operar en `reasoning_effort="low"` sobre FP8 para no agotar el presupuesto de `max_tokens`.
- Soporte multilingüe declarado en diez idiomas: inglés, chino, ruso, serbio, hindi, francés, español, árabe, coreano y japonés.
- Contexto largo: hasta 131.072 tokens en la configuración de servicio probada, con `--enable-prefix-caching`.
- Comportamiento de rechazo reducido de forma generalista (no específica de un dominio), con variante hermana orientada a ciberseguridad.
- Capacidades ausentes: el modelo es text-only, sin visión, audio ni entrada multimodal.

## Casos de uso

- **Red teaming y evaluación de seguridad de LLM**: el modelo actúa como sujeto de pruebas con la superficie de rechazo reducida, permitiendo medir hasta dónde llega la política de un modelo abliterado frente a uno alineado. Es adecuado porque el artefacto reporta métricas HarmBench-320 reproducibles (81,6 % TRUE_COMPLY en `off` sobre las 320 conductas).
- **Investigación sobre abliteration y alineación**: al editar solo los tensores `residual-writer` en bf16, sirve para estudiar qué capacidad se conserva tras la intervención; la model card aporta una comparación MMLU de 1026 preguntas contra el modelo base (87,43 % frente a 85,58 %), lo que permite aislar el efecto de la edición.
- **Generación de datos sintéticos y destilación**: en pipelines donde el rechazo del profesor descarta ejemplos legítimos, un modelo con menos negativas aumenta la cobertura del corpus generado, manteniendo el nivel de MMLU del base.
- **Agentes internos con tool calling**: con `reasoning_effort="low"`, parser `glm47` y 131K de contexto, se puede desplegar un agente multi-paso sobre APIs internas (consulta de bases de datos, orquestación de tareas) en un clúster de 8 GPU Hopper.
- **Análisis de documentación técnica multilingüe**: la cobertura de diez idiomas, incluidos ruso, serbio, hindi, árabe y coreano, permite procesar informes y normativa en una sola pasada con contexto largo, sin segmentar el documento.
- **Auditoría de corpus extensos**: con ~131K tokens de ventana se pueden revisar contratos, expedientes o logs completos en una única inferencia, manteniendo el estado entre secciones.
- **Servicio de inferencia on-premise a velocidad FP8**: al ser un checkpoint FP8 nativo, se integra en vLLM con tensor cores Hopper sin pasos de conversión, lo que simplifica el despliegue en infraestructura propia.

## Benchmarks y rendimiento

Datos publicados en la model card. No se han publicado resultados de HumanEval, GSM8K, MATH ni de tareas de código en la información disponible.

| Benchmark | Version | Resultado | Referencia |
|---|---|---|---|
| MMLU (muestra estratificada de 1026 preguntas, 18 por materia) | v2 (esta release) | 87,43 % (897/1026), +1,85 pp vs base | Base GLM-5.3 regular: 85,58 % |
| MMLU (misma muestra) | v1 (referencia) | 87,72 %, +2,14 pp vs base | Base GLM-5.3 regular: 85,58 % |
| HarmBench-320, `reasoning_effort=off`, greedy | v2 | TRUE_COMPLY 261 (81,6 %); SOFT_REFUSE 19 (5,9 %); REDIRECT 22 (6,9 %); DEFLECT 0; HARD_REFUSE 0; GARBAGE 0; UNK 18 (5,6 %) | — |
| HarmBench-320, `reasoning_effort=max`, greedy | v2 | TRUE_COMPLY 254 (79,4 %); SOFT_REFUSE 15 (4,7 %); REDIRECT 23 (7,2 %); DEFLECT 0; HARD_REFUSE 0; GARBAGE 0; UNK 28 (8,8 %) | — |
| HarmBench-320, subconjunto no-copyright (240 conductas), `off` | v2 | TRUE_COMPLY 220 (91,7 %) | v1: 85,9 % |

Notas metodológicas de la propia model card: `max_tokens=700` por respuesta; las respuestas que agotan presupuesto dentro del bloque de razonamiento se contabilizan como UNK; el ruido por materia en el panel MMLU de 57 asignaturas es de ±5,5 pp (una pregunta), y la única materia que se movió más de una pregunta entre v1 y v2 fue `high_school_european_history` (94,4 → 83,3).

## Requisitos de hardware

- **Peso en disco y en VRAM**: repositorio de 755,7 GB; en FP8 los pesos ocupan del orden de 755 GB, por lo que se necesita un nodo multi-GPU con al menos ~850 GB de memoria agregada contando caché KV y activaciones.
- **Configuración de referencia**: TP8 sobre 8× H200 (141 GB por GPU, 1128 GB agregados) con `--gpu-memory-utilization 0.90`. También validado en 8× DGX Spark GB10 según las notas de campo de la model card.
- **Paralelismo alternativo**: PP2 × TP4 perfila correctamente, pero la cabeza MTP no implementa `SupportsPP`, por lo que se pierde la decodificación especulativa.
- **Consumer GPU**: no cabe. Una RTX 4090 (24 GB) o cualquier GPU de consumo queda muy lejos de los 755 GB de pesos; no existe versión GGUF ni cuantización de 4 bits en la información disponible.
- **Opciones de despliegue**: vLLM estándar (ruta recomendada, con `--enforce-eager`, `--disable-custom-all-reduce`, `--enable-prefix-caching`, `--max-num-seqs 24`, `--reasoning-parser glm45`, `--tool-call-parser glm47`). llama.cpp, Ollama y TGI no están documentados para este checkpoint.
- **Latencia y throughput**: no se publican cifras absolutas. Se reporta una mejora de +48 % en decodificación sobre prompts de código usando MTP en el fork de vLLM con `--draft-attention-backend B12X_MLA_SPARSE`; en vLLM estándar MTP no funciona y debe desactivarse.
- **Límite práctico de contexto**: ~131K tokens con MTP y ~160K sin MTP en TP8 sobre H200; el camino a 1M mediante *decode-context-parallel* falla hoy en `glm_moe_dsa` porque el índice DSA replica `k_cache` entre rangos DCP mientras el KV MLA está fragmentado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Rechazo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GLM-5.3-ABLITERATED-FP8 (v2, este) | ~753B (MoE) | 131K practicos | 87,43 % | Reducido (81,6 % TC en HB-320) | MIT declarada | HuggingFace, safetensors FP8 |
| GLM-5.3 (zai-org, base) | ~753B (MoE) | no disponible | 85,58 % (baseline citado) | Alineado por defecto | no disponible | HuggingFace |
| JANGQ-AI/GLM-5.3-FP8 | ~753B (MoE) | no disponible | no disponible | Alineado por defecto | no disponible | HuggingFace, FP8 |
| GLM-5.3-UNCENSORED-FP8 v1 (dealignai) | ~753B (MoE) | 131K practicos | 87,72 % | 85,9 % TC en subconjunto no-copyright | MIT declarada | HuggingFace |

No se dispone en la información proporcionada de datos de otras familias de modelos comparables (por ejemplo, otros MoE abiertos de escala similar) que permitan una comparación de rendimiento verificada; cualquier comparación con ellos requeriría ejecutar la misma batería de evaluación.

## Limitaciones y advertencias

- **Riesgo de seguridad directo**: el modelo ha eliminado deliberadamente el comportamiento de rechazo. La propia evaluación reporta 0 negativas duras en HarmBench-320. No debe exponerse a usuarios finales sin una capa de moderación externa, y su uso en producción exige revisión legal y de cumplimiento.
- **Sesgos y alucinación**: la abliteration no altera el conocimiento factual pero reduce la contención; cabe esperar una mayor propensión a afirmar contenido dañino o no verificado con seguridad. No se publican evaluaciones de sesgo ni de tasas de alucinación.
- **Procedencia no verificada**: el repositorio está publicado bajo la cuenta `PenAgent`, mientras que la model card se atribuye a dealignai y describe un artefacto con otro identificador (`dealignai/GLM-5.3-UNCENSORED-FP8`). No hay verificación de que los pesos correspondan al proceso de edición descrito; conviene tratar el checkpoint como no auditado.
- **Licencia**: el repositorio declara MIT, pero la licencia del modelo base GLM-5.3 no se detalla en la información disponible. Antes de un uso comercial hay que verificar los términos del modelo original y si la redistribución de pesos modificados está permitida.
- **Configuración de razonamiento poco flexible**: no se puede desactivar el modo *thinking*. En `high` o `max` el modelo puede consumir todo el presupuesto de `max_tokens` dentro de `<think>` y devolver cero tokens de respuesta (`finish=length`), lo que en producción se traduce en respuestas vacías si no se fija `max_tokens ≥ 8000`.
- **Compatibilidad de serving frágil**: MTP no funciona en vLLM estándar; el contexto de 1M está cerrado por un fallo de paginación en el índice DSA; `--enforce-eager` es obligatorio para la ruta de atención dispersa bajo concurrencia.
- **Cobertura de evaluación limitada**: los benchmarks publicados se reducen a MMLU (1026 preguntas) y HarmBench-320. No hay datos de código, matemáticas, seguimiento de instrucciones ni de calidad por idioma, pese a declarar diez idiomas.
- **Idiomas sin validación**: la lista de idiomas indica cobertura, no calidad. Español, árabe, hindi o serbio no tienen métricas publicadas, y la ablación se aplicó sobre una taxonomía multilingüe sin desglose por lengua.
- **Sin alternativas ligeras**: al existir solo en FP8, no hay opción de desplegarlo en hardware de consumo ni en CPU, lo que limita la reproducibilidad de cualquier evaluación independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PenAgent/GLM-5.3-ABLITERATED-FP8
- Modelo base original: https://huggingface.co/zai-org/GLM-5.3
- Cuantización FP8 intermedia: https://huggingface.co/JANGQ-AI/GLM-5.3-FP8
- Artefacto referenciado en la model card: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8
- Discusión con notas de campo en 8× DGX Spark GB10: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8/discussions/3
- Variante orientada a ciberseguridad: https://huggingface.co/dealignai/GLM-5.3-CYBERSECURITY-FP8
- Organización en HuggingFace: https://huggingface.co/dealignai
- Perfil de X/Twitter citado: https://twitter.com/dealignai
- Perfil del tester citado: https://huggingface.co/0xMagnus
