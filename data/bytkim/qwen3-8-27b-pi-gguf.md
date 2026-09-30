# bytkim/Qwen3.8-27B-pi-GGUF

## Resumen

Qwen3.8-27B-pi-GGUF es la distribucion cuantizada en formato GGUF del modelo Qwen3.8-27B-pi, un ajuste fino del Qwen3.8-27B de Alibaba sobre el arnes de agentes Pi. El modelo base es un LLM denso, nativo multimodal (lenguaje mas vision), de 26.895.998.464 parametros (~26,9B), y este ajuste lo especializa en el bucle tipico de trabajo de un agente de programacion: leer un repositorio, editar ficheros, ejecutar herramientas y reaccionar a la realimentacion de esas herramientas. El repositorio lo publica el usuario bytkim bajo licencia Apache 2.0.

La propuesta de valor del ajuste Pi no es solo la precision, sino la eficiencia del proceso: segun la model card, el modelo Pi iguala el ratio de finalizacion del Base en esfuerzo xhigh usando aproximadamente un 41% menos de tokens de salida en esfuerzo medium, y en SciCode resuelve mas subproblemas en todos los niveles de esfuerzo, con cerca de un 23% menos de tokens de salida en xhigh. Esto se consiguio con un pipeline de dos etapas: SFT sobre sesiones Pi filtradas y exitosas, seguido de RL con GRPO y una recompensa personalizada de eficiencia de razonamiento.

El repositorio es relevante para quien quiera ejecutar el modelo en hardware local: ofrece cuantizaciones GGUF calibradas con sesiones completas de Pi (incluidos esquemas IQ con imatrix), y el modelo incorpora soporte de multi-token prediction (MTP) para decodificacion especulativa, ademas de vision. El informe tecnico esta anunciado como pendiente de publicacion en el momento de escribir esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, causal, nativo multimodal (encoder de vision mas LLM); soporte de MTP para decodificacion especulativa |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF, incluidos esquemas compactos IQ (importance-aware) con calibracion imatrix/iquant sobre sesiones Pi completas; la model card menciona Q4_K_ (texto truncado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repo); BF16 y FP8 en repositorios hermanos |

## Arquitectura y entrenamiento

El modelo es un transformer denso y causal con encoder de vision, construido sobre Qwen3.8-27B, que la documentacion de Alibaba describe como un LLM denso nativo multimodal orientado a codigo, flujos agenticos y automatizacion ofimatica. La serie Qwen3.8 se presenta como de "pensamiento hibrido", con niveles de esfuerzo de razonamiento ajustables (low, medium, xhigh). Este ajuste anade ademas capacidades de multi-token prediction, segun las etiquetas del repositorio, lo que habilita decodificacion especulativa en llama.cpp; en el repositorio analogo del mismo autor para la generacion anterior se indica que las cabezas MTP se mantienen en Q8_0 dentro de cada cuantizacion, aunque ese detalle no se confirma de forma explicita para este modelo en la informacion disponible.

El entrenamiento se describe en dos etapas. Primero, un ajuste supervisado (SFT) sobre sesiones Pi filtradas y exitosas, con el objetivo de ensenar flujos de trabajo completos de programacion en lugar de respuestas aisladas: adaptarse a entornos existentes y verificar resultados contra los requisitos de la tarea. Segundo, una fase de aprendizaje por refuerzo con GRPO que combina resultados de tarea verificados con una recompensa personalizada de eficiencia de razonamiento, de modo que las soluciones correctas en esfuerzo low y medium razonen de forma mas economica mientras que xhigh se reserva para maximizar la correccion. Los checkpoints se evaluaron con resultados reales del agente junto a tokens generados, llamadas a herramientas y tiempo de finalizacion, no solo con la perdida de entrenamiento. Las cuantizaciones GGUF se calibraron usando sesiones completas de Pi, lo que dirige la compresion hacia las partes del modelo relevantes para esos flujos. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni los detalles de la fase de RL mas alla de lo indicado.

## Capacidades

- Generacion de texto conversacional y razonamiento con niveles de esfuerzo ajustables (low, medium, xhigh).
- Programacion y generacion de codigo orientada a tareas reales: lectura de repositorios, edicion de ficheros y verificacion de resultados.
- Uso de herramientas (tool calling / function calling) y trabajo en bucle agentico multi-paso con realimentacion de las herramientas.
- Comprension de imagen y de texto e imagen combinados (image-text-to-text), con encoder de vision en el modelo base.
- Decodificacion especulativa mediante cabezas de multi-token prediction (MTP), segun las etiquetas del repositorio.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo de razonamiento hibrido, con control del presupuesto de razonamiento por nivel de esfuerzo.

## Casos de uso

- Agente de programacion autonomo en local: el modelo esta ajustado especificamente para el bucle de leer repositorio, editar fichero, ejecutar herramienta y corregir, por lo que encaja como motor de un arnes tipo Pi o equivalente ejecutado sobre llama.cpp sin depender de APIs externas.
- Asistente de refactorizacion en el IDE: al haber sido entrenado con sesiones Pi que se adaptan a entornos existentes, puede aplicar cambios coherentes con el estilo y las dependencias ya presentes en el proyecto y comprobar el resultado con las herramientas del propio repositorio.
- Correccion y depuracion iterativa: los niveles de esfuerzo permiten usar medium para errores sencillos y xhigh para fallos que requieren rastrear el flujo por varios ficheros, con un coste en tokens de salida mas contenido que el modelo base en esfuerzos equivalentes.
- Automatizacion de tareas ofimaticas y de documentacion tecnica: al proceder de un base orientado a automatizacion ofimatica y con vision, puede procesar capturas o diagramas junto a texto para generar documentacion o resumenes de cambios.
- Analisis de capturas de pantalla o diagramas en flujos de soporte tecnico: la entrada multimodal permite adjuntar una imagen de un error o de una interfaz y pedir un diagnostico o una secuencia de pasos.
- Integracion en pipelines de CI/CD como revisor de parches: dado su soporte de tool calling, puede conectarse a herramientas de build y test y comprobar que un cambio pasa las verificaciones antes de proponerlo como definitivo.
- Despliegue en estaciones de trabajo sin GPU de datacenter: las cuantizaciones IQ y Q4 permiten ejecutar un modelo de ~27B en GPU de consumo o en Mac con memoria unificada, un escenario habitual para equipos que no pueden enviar codigo propietario a servicios externos.

## Benchmarks y rendimiento

La model card incluye graficos de Terminal-Bench 2.1, GPQA Diamond y SciCode comparando Pi con el Base en los niveles low, medium y xhigh, pero las cifras absolutas solo estan en las imagenes, no en el texto extraido. Los datos cuantitativos recuperables son relativos:

| Benchmark | Resultado reportado (relativo) |
|---|---|
| Terminal-Bench 2.1 | Pi muestra una subida mas estable de low a xhigh que Base, con menos tokens de salida en cada nivel de esfuerzo equivalente; el ajuste medium de Pi iguala el ratio de finalizacion de Base en xhigh con aproximadamente un 41% menos de tokens de salida. Puntuacion absoluta: no disponible. |
| GPQA Diamond | Pi alcanza la puntuacion mas alta en xhigh, pero Base conserva la ventaja en medium. Puntuacion absoluta: no disponible. |
| SciCode | Pi resuelve mas subproblemas que Base en todos los niveles; en xhigh puntua mas alto con aproximadamente un 23% menos de tokens de salida, mientras que en medium su mayor puntuacion exige mas tokens. Puntuacion absoluta: no disponible. |
| Benchmarks de cuantizacion GGUF | La model card incluye una comparativa de cuantizaciones a esfuerzo medium con resultados de referencia Pi FP8 para Terminal-Bench 2.1, GPQA Diamond y SciCode. Valores concretos: no disponibles. |

No se publican en la informacion disponible resultados numericos absolutos de MMLU, HumanEval, GSM8K ni equivalentes, y el informe tecnico esta anunciado como pendiente.

## Requisitos de hardware

Estimaciones de VRAM para los pesos, calculadas a partir de los ~26,9B de parametros y del numero de bits por peso tipico de cada cuantizacion. Hay que sumar la cache KV y, si se usa la via multimodal, el encoder de vision en un fichero mmproj aparte.

| Cuantizacion | Bits por peso aprox. | VRAM estimada (pesos) |
|---|---|---|
| IQ2_XXS / IQ2_XS | ~2,1-2,5 | ~8-9 GB |
| Q3_K / IQ3 | ~3,4-3,9 | ~12-14 GB |
| Q4_K_M / IQ4_XS | ~4,5-4,8 | ~16-17 GB |
| Q5_K_M | ~5,6 | ~19-20 GB |
| Q6_K | ~6,6 | ~22-23 GB |
| Q8_0 | ~8,5 | ~28-29 GB |
| FP8 (repo hermano) | 8 | ~27 GB |
| BF16 (repo hermano) | 16 | ~54 GB |

- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede ejecutar Q4_K_M e IQ4_XS con contexto moderado y Q5_K_M con contexto corto; Q6_K y Q8_0 quedan al limite o fuera.
- GPU de 32 GB o superior (RTX 5090, A6000, V100 32GB) y configuraciones multi-GPU permiten Q6_K y Q8_0 con contexto amplio.
- A100, H100 o H200 de 80 GB: BF16 y FP8 caben sin problema y permiten lotes y contexto grandes.
- Mac con memoria unificada: ~32 GB para Q4, ~48-64 GB para Q6/Q8; util para desarrollo local.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, koboldcpp y llama-cpp-python; el repositorio esta etiquetado con text-generation-inference y endpoints_compatible, y vLLM ofrece soporte GGUF experimental.
- Latencia y throughput estimados: no disponibles. Dependen de la cuantizacion, la GPU, la longitud de contexto y del uso o no de decodificacion especulativa con las cabezas MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| bytkim/Qwen3.8-27B-pi-GGUF (este) | ~26,9B denso | no disponible | GGUF (IQ, Q4-Q8) | Apache 2.0 | Ajustado al arnes Pi, con MTP y vision; calibrado con sesiones Pi |
| bytkim/Qwen3.8-27B-pi (BF16) | ~26,9B denso | no disponible | safetensors BF16 | Apache 2.0 | Mismo ajuste en precision completa; referencia de maxima calidad |
| bytkim/Qwen3.8-27B-pi-FP8 | ~26,9B denso | no disponible | FP8 | Apache 2.0 | Referencia usada en los graficos de cuantizacion de la model card |
| Qwen/Qwen3.8-27B (base) | ~26,9B denso | no disponible | safetensors | Apache 2.0 | Modelo base sin ajuste Pi; segun la model card conserva ventaja en GPQA medium y no en xhigh |
| unsloth/Qwen3.8-27B-GGUF | ~26,9B denso | no disponible | GGUF | Apache 2.0 | Cuantizaciones del base, sin el ajuste Pi ni la calibracion sobre sesiones de agente |

No hay datos publicos en la informacion disponible para comparar el rendimiento absoluto frente a modelos de otros fabricantes de tamano similar.

## Limitaciones y advertencias

- Riesgo de alucinacion: es un modelo de lenguaje generativo y puede producir codigo, referencias a APIs o resultados de herramientas que no existen; la model card insiste en verificar los resultados, por lo que en produccion conviene ejecutar las comprobaciones reales en lugar de confiar en la salida.
- Sesgos conocidos: no disponibles en la informacion proporcionada. Al derivar de Qwen3.8-27B, hereda los sesgos de su dataset de entrenamiento, sobre el que no se aportan detalles.
- Idiomas soportados: no disponibles. No hay lista oficial de idiomas para este ajuste, por lo que no se puede garantizar un rendimiento uniforme fuera del ingles.
- Longitud de contexto: no disponible. Conviene medirla empiricamente antes de disenar flujos con contexto largo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B puede tener sus propios terminos; conviene revisarlos antes de un despliegue comercial.
- Especializacion del ajuste: el entrenamiento esta orientado al arnes Pi y a tareas de programacion agentica, por lo que su comportamiento fuera de ese bucle (chat general, dominios no tecnicos) puede degradarse respecto al base.
- Repositorio muy reciente y con poca traccion: cero descargas y un solo "me gusta" en el momento de la consulta, y el informe tecnico aun no esta publicado, lo que limita la verificacion independiente de los resultados.
- La comparativa de cuantizaciones se presenta mediante graficos; sin los valores absolutos no se puede dimensionar con precision la perdida de calidad de cada nivel de compresion.
- Requisitos de memoria: incluso en Q4 el modelo ronda los 16-17 GB solo en pesos, por lo que no cabe en GPUs de 8-12 GB salvo cuantizaciones IQ de 2-3 bits con perdida de calidad apreciable.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bytkim/Qwen3.8-27B-pi-GGUF
- Version BF16: https://huggingface.co/bytkim/Qwen3.8-27B-pi
- Version FP8: https://huggingface.co/bytkim/Qwen3.8-27B-pi-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de cuantizaciones del base por unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Repositorio oficial de Alibaba Cloud para Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Repositorio oficial de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Pagina de unsloth sobre Qwen3.8-27B: https://unsloth.ai/models/qwen3.8-27b
- Repositorio analogo del mismo autor con cabezas MTP (generacion anterior): https://huggingface.co/bytkim/Qwen3.6-27B-MTP-pi-tune-GGUF
