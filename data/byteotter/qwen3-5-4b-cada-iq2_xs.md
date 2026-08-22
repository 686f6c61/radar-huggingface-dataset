# ByteOtter/Qwen3.5-4B-CADA-IQ2_XS

## Resumen

Este repositorio contiene un artefacto GGUF experimental derivado del modelo **Qwen3.5-4B** de Alibaba, producido con la herramienta **QLAB**, que mide el deterioro inducido por la cuantizacion y reasigna precision a nivel de tensor bajo un presupuesto de bytes aproximadamente fijo. El resultado es una cuantizacion de precision mixta per-tensor que busca alrededor del presupuesto de bytes de un IQ2_XS estandar, pero redistribuyendo la precision hacia los tensores que mas la necesitan para preservar la capacidad de razonamiento. Es el primer resultado QLAB fuera de la familia Gemma.

El artefacto pesa **1.525 GiB** (1.637.318.816 bytes), un **80.56% menos** que la fuente BF16 (7.846 GiB), y usa solo un **0.412% mas de bytes** que el IQ2_XS estandar con imatrix. En la evaluacion de razonamiento, el modelo QLAB alcanza **54.688%** frente al **46.875%** del IQ2_XS stock, lo que supone **+7.813 puntos porcentuales** y un **+16.67% relativo**. La retencion de razonamiento respecto al BF16 es del **70.0%** (frente al 60.0% del comparador stock). El modelo base es un transformer denso de 4.2B parametros con contexto nativo de 262.144 tokens y capacidades multimodales en su version original, aunque este release solo incluye el artefacto de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 4B (transformer denso, arquitectura Qwen3.5) |
| Parametros totales | 4.205.751.296 (~4.2B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (nativo del modelo base) |
| Tipos de cuantizacion | Precision mixta per-tensor buscada alrededor del presupuesto IQ2_XS (no es un IQ2_XS uniforme) |
| Idiomas soportados | Multilingue (segun el modelo base Qwen3.5-4B) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base **Qwen3.5-4B** es un transformer denso de 4B parametros con una longitud de contexto nativa de 262.144 tokens y capacidades multimodales integradas (vision y lenguaje). Este release no modifica la arquitectura ni los pesos del modelo: **no hay LoRA, post-entrenamiento, pruning, distillation ni optimizacion de pesos**. La diferencia respecto a una cuantizacion IQ2_XS uniforme reside en **donde se gasta el presupuesto de cuantizacion**.

QLAB comienza con una cuantizacion calibrada por categoria (usando una imatrix de categoria "reasoning") y luego busca reasignaciones de precision a nivel de tensor: algunos tensores reciben mas precision y otros ceden precision, de modo que el artefacto final permanece cerca del presupuesto original de bytes. El resultado es una cuantizacion de precision mixta per-tensor que pretende recuperar capacidad perdida durante la cuantizacion, sin anadir parametros ni modificar los pesos originales.

## Capacidades

- **Razonamiento**: es la capacidad objetivo de esta cuantizacion. En la evaluacion, el QLAB mejora sustancialmente sobre el IQ2_XS stock (+7.813 puntos porcentuales).
- **Matematicas**: mejora notablemente frente al stock (13.281 vs 4.688), aunque parte de una base muy baja.
- **Codigo**: mejora ligera (4.688 vs 2.344), pero el rendimiento absoluto es bajo.
- **Instrucciones**: mejora de 4.390 puntos porcentuales frente al stock.
- **Resumen y extraccion**: mejora de 12.500 puntos porcentuales frente al stock.
- **Conocimiento QA**: regresion significativa (-15.625 puntos frente al stock).
- **Salida estructurada**: regresion de 9.375 puntos frente al stock.
- **Multimodal**: el modelo base es nativamente multimodal, pero este release solo incluye el artefacto de lenguaje GGUF. El comportamiento multimodal no fue evaluado.

## Casos de uso

- **Razonamiento y analisis logico en entornos con recursos limitados**: el modelo conserva el 70% de la capacidad de razonamiento del BF16 original, lo que lo hace util para tareas de deduccion y analisis en hardware modesto.
- **Prototipado rapido de pipelines de razonamiento**: al ser un GGUF de ~1.5 GiB, permite iterar rapidamente en CPU o GPU consumer sin necesidad de infraestructura de alto coste.
- **Evaluacion de la sensibilidad de tareas a la cuantizacion**: el modelo sirve como referencia para estudiar como la asignacion de precision por tensor afecta a distintas familias de tareas (matematicas, codigo, conocimiento, etc.).
- **Sistemas de resumen y extraccion**: mejora de 12.5 puntos sobre el IQ2_XS stock en la suite de summarization/extraction, por lo que puede ser adecuado para tareas de resumen de documentos con presupuesto de memoria reducido.
- **Seguimiento de instrucciones en aplicaciones conversacionales**: la mejora en instruction following (+4.39 puntos) y el soporte de llama.cpp hacen viable su uso en chatbots locales con recursos modestos.
- **Investigacion en cuantizacion de modelos**: el artefacto sirve como caso de estudio para comparar estrategias de cuantizacion con presupuesto fijo y para investigar la interaccion entre la asignacion de precision y la calidad de la salida.

## Benchmarks y rendimiento

Los datos de la evaluacion se han extraido de la model card del autor. La evaluacion se realizo sobre 11 suites de tareas. A continuacion se muestran los resultados de las suites publicadas (el dato de QLAB para "General fidelity" no se incluyo en la informacion disponible):

| Suite | BF16 | Stock IQ2_XS + imatrix | QLAB allocation + imatrix | QLAB - stock |
|---|---|---|---|---|
| Razonamiento | 78.125 | 46.875 | **54.688** | **+7.813** |
| Matematicas | 32.812 | 4.688 | **13.281** | **+8.594** |
| Codigo | 44.531 | 2.344 | **4.688** | **+2.344** |
| Conocimiento QA | 65.625 | **54.688** | 39.062 | **-15.625** |
| Instrucciones | 26.562 | 19.048 | **23.438** | **+4.390** |
| Salida estructurada | 57.812 | **51.562** | 42.188 | **-9.375** |
| Resumen / extraccion | 68.750 | 32.812 | **45.312** | **+12.500** |
| Fidelidad general | 36.500 | 30.515 | no disponible | no disponible |

El resultado global es que 8 de las 11 suites medidas mejoraron frente al comparador stock, mientras que conocimiento, salida estructurada y coherencia regresaron. La retencion de razonamiento respecto al BF16 es del 70.0% frente al 60.0% del stock. No se han publicado resultados en benchmarks estandar publicos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: ~1.5 GiB para el archivo GGUF. Con overhead de ejecucion, se recomienda al menos 2-3 GiB de VRAM para inferencia comoda.
- **GPUs compatibles**: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3060, RTX 4090, etc.). Tambien puede ejecutarse en CPU pura con llama.cpp.
- **Opciones de despliegue**: llama.cpp (llama-cli o llama-server), compatible con servidores OpenAI-compatible via llama-server. Tambien puede integrarse en Ollama o LM Studio.
- **Latencia y throughput**: no se proporcionan datos especificos. En una GPU consumer moderna (RTX 3060 o superior), se esperan velocidades de decodificacion de decenas de tokens por segundo para un modelo de 4B cuantizado a 2 bits; en CPU, dependera del numero de nucleos y del soporte de AVX2/AVX512.

## Comparativa con modelos similares

La comparativa natural es con el propio modelo base y con la cuantizacion IQ2_XS uniforme, asi como con otras cuantizaciones del mismo modelo.

| Modelo | Parametros | Formato | Tamano | Razonamiento (relativo) | Licencia |
|---|---|---|---|---|---|
| Qwen3.5-4B (BF16) | 4.2B | safetensors | 7.846 GiB | 78.125% | Apache 2.0 |
| Qwen3.5-4B IQ2_XS stock | 4.2B | GGUF | 1.519 GiB | 46.875% | Apache 2.0 |
| **Qwen3.5-4B QLAB IQ2_XS** | 4.2B | GGUF | 1.525 GiB | **54.688%** | Apache 2.0 |

No se dispone de datos de comparacion con otros modelos de 4B de la misma categoria (por ejemplo, Llama-3.2-3B, Phi-3.5-mini, etc.) en la informacion proporcionada.

## Limitaciones y advertencias

- **Es un experimento de cuantizacion, no un modelo universalmente mejor**: 8 de 11 suites mejoraron frente al stock, pero conocimiento, salida estructurada y coherencia regresaron. En tareas de conocimiento general o generacion de salidas estructuradas, el modelo puede ser peor que una cuantizacion IQ2_XS uniforme.
- **Rendimiento absoluto bajo en matematicas y codigo**: aunque mejora frente al stock, los valores absolutos (13.281 y 4.688) son muy bajos, lo que indica que la cuantizacion a 4 bits degrada severamente estas capacidades.
- **Multimodalidad no disponible**: el modelo base es multimodal, pero este release solo incluye el artefacto de lenguaje GGUF. No se incluye el proyector de vision, por lo que no se puede usar para tareas de imagen.
- **Riesgo de alucinacion y sesgos**: no se han publicado evaluaciones de sesgos ni de alucinacion en la informacion disponible. Como cualquier modelo cuantizado a baja precision, puede generar salidas incoherentes o incorrectas en tareas de conocimiento.
- **Uso en produccion**: es un artefacto experimental. No se recomienda su uso en entornos de produccion sin una evaluacion exhaustiva en la tarea especifica y sin comparar con otras cuantizaciones.
- **Restricciones de licencia**: licencia Apache 2.0, que permite uso comercial con atribucion. No se han identificado restricciones adicionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ByteOtter/Qwen3.5-4B-CADA-IQ2_XS
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio oficial Qwen3: https://github.com/QwenLM/Qwen3
- Pagina de LM Studio del modelo: https://lmstudio.ai/models/qwen/qwen3.5-4b
- Pagina de Ollama del modelo: https://ollama.com/library/qwen3.5:4b
- Guia de Qwen 3.5 (todos los modelos): https://qwen-ai.com/qwen-3-5/
