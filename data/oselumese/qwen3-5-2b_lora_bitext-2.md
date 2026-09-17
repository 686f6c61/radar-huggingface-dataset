# oselumese/qwen3.5-2B_lora_bitext-2

## Resumen

oselumese/qwen3.5-2B_lora_bitext-2 es un ajuste fino mediante LoRA sobre el modelo base Qwen3.5-2B, publicado por el usuario oselumese en Hugging Face y distribuido exclusivamente en formato GGUF para su uso con llama.cpp. El repositorio contiene dos ficheros: el modelo de lenguaje en precisión F16 y un proyector multimodal (mmproj) en BF16, lo que apunta a un modelo de visión-lenguaje, en linea con la etiqueta vision-language-model declarada en la model card.

El recuento real de parámetros en safetensors es de 1.942.653.248 (aproximadamente 1,94 B) y el repositorio ocupa 4,6 GB. La model card es minima: no declara licencia, idiomas, longitud de contexto ni resultados de evaluacion, y el repositorio no registra descargas ni interacciones en el momento de redactar esta ficha. El autor indica que el entrenamiento y la conversion a GGUF se realizaron con Unsloth.

Su relevancia es de nicho: sirve como ejemplo de flujo de trabajo LoRA mas conversion a GGUF para modelos pequeños con componente multimodal, y como punto de partida para experimentacion en hardware modesto. No hay evidencia publicada que permita considerarlo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5-2B segun el autor; no se describe la arquitectura interna) |
| Parametros totales | 1.942.653.248 (aproximadamente 1,94 B, dato de safetensors) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF F16 (unico publicado); proyector multimodal en BF16; el autor no publica cuantizaciones Q4/Q5/Q8, aunque llama.cpp permite derivarlas |
| Idiomas soportados | no disponible (el sufijo "bitext" del nombre sugiere un ajuste sobre corpus bilingue, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | GGUF (F16 para el modelo de lenguaje, BF16 mmproj para el proyector) |

## Arquitectura y entrenamiento

No se dispone de detalles tecnicos sobre la arquitectura interna. El autor solo indica que se trata de un ajuste fino (LoRA) del modelo base Qwen3.5-2B y que tanto el entrenamiento como la conversion a GGUF se hicieron con Unsloth. El nombre del repositorio, qwen3.5-2B_lora_bitext-2, sugiere un ajuste sobre un dataset de texto bilingue alineado, pero no se especifica ni la composicion del dataset, ni el numero de tokens de entrenamiento, ni si hubo etapas de RLHF o DPO.

El unico detalle de arquitectura verificable es la presencia de un fichero mmproj en BF16 (Qwen3.5-2B.BF16-mmproj.gguf), que corresponde al proyector de vision que se acopla al modelo de lenguaje en los flujos multimodales de llama.cpp. Esto implica una arquitectura de dos componentes (codificador visual mas proyector mas modelo de lenguaje), pero se desconoce que codificador visual se utiliza y con que resolucion de imagen trabaja. La model card documenta el uso con `llama-mtmd-cli` para el modo multimodal y con `llama-cli` para texto, e indica el flag `--jinja` para el manejo de plantillas de chat.

## Capacidades

- Generacion de texto conversacional en formato chat multi-turno, segun la etiqueta conversational del repositorio.
- Capacidad multimodal de entrada de imagen, inferida de la etiqueta vision-language-model y del fichero mmproj; el alcance real (resolucion, OCR, descripcion de escenas) no esta documentado.
- Compatibilidad declarada con endpoints (etiqueta endpoints_compatible), lo que apunta a un uso previsto mediante API HTTP en infraestructura de Hugging Face.
- Inferencia local mediante llama.cpp, tanto en modo texto (`llama-cli`) como multimodal (`llama-mtmd-cli`).
- Soporte de tool calling / function calling: no disponible. El modelo base de la familia Qwen suele incorporarlo, pero la ficha de este ajuste no lo declara ni lo verifica.
- Capacidades de agente y razonamiento multi-paso: no disponible, sin evidencia en la informacion proporcionada.
- Cobertura multilingue: no disponible.
- Modo de razonamiento explicito (thinking): no disponible.

## Casos de uso

- Traduccion asistida bilingue: si el ajuste bitext-2 responde al corpus con el que fue entrenado, el modelo encaja en tareas de traduccion de frases cortas y pares de idiomas concretos, aunque sin evaluacion publicada es obligatorio medir la calidad con un conjunto propio antes de usarlo.
- Prototipado local en equipos sin GPU dedicada: con 1,94 B de parametros y pesos GGUF, el modelo se puede ejecutar en portatiles y mini-PC para validar ideas de producto antes de escalar a modelos mayores.
- Descripcion de imagenes en pipelines de catalogacion: usando el proyector multimodal y `llama-mtmd-cli`, se pueden generar pies de foto o metadatos basicos para lotes de imagenes, siempre con revision humana posterior.
- Chatbots de soporte de bajo coste: la etiqueta conversational y el formato GGUF permiten desplegar asistentes de dominio muy acotado en CPU, con la ventana de contexto limitada por el propio hardware.
- Generacion de datos sinteticos y aumento de corpus: un modelo pequeño y rapido resulta util para producir borradores masivos de texto en procesos de anotacion o filtrado, que luego se revisan con un modelo mayor.
- Experimentacion academica con LoRA y Unsloth: el repositorio documenta el flujo completo de ajuste y conversion a GGUF, por lo que sirve como plantilla reproducible en cursos y trabajos de investigacion.
- Extraccion de informacion en documentos escaneados: la combinacion de entrada visual y salida de texto permite plantear tareas de lectura de formularios sencillos, con la advertencia de que no hay datos de precision publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las cifras de VRAM son estimaciones derivadas del recuento de parametros (2 bytes por parametro en F16), no mediciones publicadas por el autor.

| Precision | Peso estimado del modelo | VRAM aproximada con contexto y overhead |
|---|---|---|
| F16 (unico publicado) | 3,9 GB | 4,5 a 5,5 GB |
| Q8_0 (derivada con llama.cpp) | 2,1 GB | 3,0 a 3,5 GB |
| Q4_K_M (derivada con llama.cpp) | 1,2 GB | 2,0 a 2,5 GB |

- Cabe en GPU de consumo: si, en tarjetas de 6 GB o mas (RTX 3060, RTX 4060, RTX 2060, GTX 1660 con 6 GB). En Q4 tambien es viable en iGPU con memoria unificada.
- GPU profesionales: no necesita A100 ni H100; un modelo de 1,94 B queda sobredimensionado en ese hardware salvo para servir muchas peticiones concurrentes.
- Despliegue: llama.cpp (`llama-cli` y `llama-mtmd-cli`), Ollama y LM Studio importando el GGUF. El soporte de GGUF en vLLM y TGI es limitado o experimental, por lo que no es la via recomendada.
- El proyector multimodal (mmproj BF16) añade memoria adicional de tamaño no especificado en el repositorio.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

Los datos de la columna de contexto y licencia corresponden a la documentacion publica de los modelos base, no a este ajuste concreto.

| Modelo | Parametros | Contexto | Licencia | Multimodal |
|---|---|---|---|---|
| qwen3.5-2B_lora_bitext-2 (este) | 1,94 B | no disponible | no disponible | Si, segun etiqueta y fichero mmproj |
| Qwen3-1.7B | 1,7 B | 32.768 tokens nativos | Apache 2.0 | No |
| Llama 3.2 3B | 3,2 B | 128.000 tokens | Llama 3.2 Community License | No (las variantes con vision son 11B y 90B) |
| Gemma 3 4B | 4 B | 128.000 tokens | Gemma Terms of Use | Si |

Frente a estas alternativas, el punto diferencial del modelo es la combinacion de tamaño reducido y proyector multimodal, ademas de la distribucion directa en GGUF. En contra, carece de licencia declarada y de cualquier dato de rendimiento, mientras que los modelos citados publican evaluaciones y condiciones de uso claras.

## Limitaciones y advertencias

- Licencia no declarada: sin terminos de uso publicados, no hay certeza juridica sobre uso comercial. Es un bloqueo objetivo para cualquier despliegue en produccion.
- Ausencia total de benchmarks: no hay MMLU, HumanEval, GSM8K ni evaluaciones multimodales que permitan estimar la calidad del ajuste.
- Riesgo de alucinacion elevado: con 1,94 B de parametros, la capacidad de mantener precision factual en tareas abiertas es limitada, especialmente en preguntas de conocimiento o calculo.
- Idiomas no especificados: no se puede confirmar el comportamiento fuera del par de idiomas del corpus de ajuste.
- Longitud de contexto desconocida: no se puede planificar un caso de uso con documentos largos sin medirla primero.
- Proyecto no validado por la comunidad: cero descargas y cero interacciones en el momento de la consulta, sin issues ni discusiones que permitan contrastar experiencias.
- Model card minima: no documenta datos de entrenamiento, hiperparametros de LoRA, rango ni alpha, lo que dificulta reproducir o auditar el ajuste.
- Sesgos: no hay informacion sobre la composicion del dataset, por lo que no se pueden evaluar sesgos de genero, idioma o dominio. Al ser un corpus probablemente bilingue y limitado, es esperable un sesgo hacia ese dominio.
- Soporte de tool calling y de agentes sin verificar: no debe asumirse que funcione aunque otros modelos de la familia lo soporten.
- Recomendacion: tratarlo como material de experimentacion y validar con un conjunto de evaluacion propio antes de cualquier uso real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oselumese/qwen3.5-2B_lora_bitext-2
- Unsloth (framework de ajuste y conversion usado por el autor): https://github.com/unslothai/unsloth
- llama.cpp (motor de inferencia para los ficheros GGUF y `llama-mtmd-cli`): https://github.com/ggml-org/llama.cpp
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo: los resultados obtenidos correspondian a paginas de ayuda de Google Maps y no guardan relacion con el contenido de la ficha.
