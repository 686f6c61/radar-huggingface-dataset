# panzarasa/qwen3-1.7b-frontend-sft

## Resumen

panzarasa/qwen3-1.7b-frontend-sft es un ajuste fino supervisado (SFT) mediante QLoRA sobre Qwen/Qwen3-1.7B, especializado en generacion de codigo front-end: documentos HTML completos, CSS en bloques ``, JavaScript y ediciones de fichero completo. Lo publica el usuario panzarasa en Hugging Face bajo licencia Apache-2.0 y esta pensado para una tarea muy concreta: convertir un brief de pagina web en un unico documento HTML autocontenido, o aplicar un cambio solicitado devolviendo el fichero entero actualizado.

El modelo mantiene el tamano del base: 1.720.574.976 parametros (1,72B) en safetensors, con un repositorio de 3,6 GB que incluye el modelo fusionado en 16 bits y, en el subdirectorio `adapter/`, el adaptador LoRA (34.865.152 parametros entrenables, el 2,03% del total). Se entreno durante una sola epoca con secuencia de 8.192 tokens sobre 267.202 filas procedentes de siete conjuntos de datos de codigo y web, en 4x RTX 4090 durante 4 horas y 33 minutos. La perdida de evaluacion final fue de 0,3713.

Su relevancia es practica mas que de investigacion: es un modelo pequeno, de licencia permisiva y ejecutable en GPU de consumo, orientado a maquetacion y scaffolding front-end dentro de asistentes o pipelines internos. No incluye modo de razonamiento (no genera bloques `<think>`) y esta entrenado unicamente en ingles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen/Qwen3-1.7B); ajuste fino QLoRA fusionado |
| Parametros totales | 1.720.574.976 (1,72B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens de secuencia en entrenamiento; contexto nativo del modelo base Qwen3-1.7B segun su documentacion, no confirmado explicitamente para este fine-tune |
| Tipos de cuantizacion | El repositorio publica safetensors en 16 bits (bfloat16) y el adaptador LoRA; no se distribuyen pesos GGUF ni cuantizaciones de 8/4 bits listas para usar (el base se cargo en 4-bit nf4 solo durante el entrenamiento) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (modelo fusionado en la raiz; adaptador PEFT en `adapter/`) |

## Arquitectura y entrenamiento

Se parte de Qwen/Qwen3-1.7B, un transformer denso de 1,72B parametros, cargado en cuantizacion 4-bit nf4 mediante `unsloth/Qwen3-1.7B-unsloth-bnb-4bit`, y se aplica QLoRA con r=32, alpha=32, dropout 0 y modulos objetivo q, k, v, o, gate, up y down. El entrenamiento cubre una sola epoca con 16.701 pasos, batch efectivo de 16 (2 x acumulacion de gradiente 2 x 4 GPU), tasa de aprendizaje 2e-4 con decaimiento coseno y calculo de perdida unicamente sobre los tokens del asistente. Las filas de mas de 8.192 tokens se descartaron en lugar de truncarse, de modo que el modelo nunca vio documentos sin cerrar. El resultado final es un modelo fusionado en 16 bits que se carga directamente con `transformers`, sin necesidad de PEFT.

El conjunto de datos mezcla 267.202 filas de entrenamiento y 1.981 de validacion: `bigcode/commitpackft` (61.312 filas, ediciones de fichero completo a partir de una peticion de cambio), `HuggingFaceM4/WebSight` (60.000, descripcion a pagina con Tailwind), `xcodemind/webcode2m` (59.998, paginas reales largas con bloque ``), `Tesslate/Next.js-Dataset` (49.954, respuestas de Next.js/React con explicacion), `saurabh5/rlvr-code-data-JavaScript-sft` (40.000, ejercicios de JavaScript) y dos conjuntos pequenos de conversaciones y construcciones front-end (715 y 665 filas). No se documenta ninguna fase de RLHF o DPO. Una decision tecnica destacable es el uso de la plantilla de chat de `Qwen/Qwen3-4B-Instruct-2507` en lugar de la plantilla hibrida de Qwen3-1.7B, lo que elimina los bloques de pensamiento y produce respuestas directas.

## Capacidades

- Generacion de documentos HTML completos con CSS embebido en `` a partir de una descripcion textual de la pagina.
- Maquetacion basada en Tailwind CSS, aprendida del conjunto WebSight.
- Edicion de fichero completo: dado un fichero y una peticion de cambio, devuelve el fichero entero actualizado sin explicaciones ni vallas de Markdown.
- Generacion de JavaScript, incluidos ejercicios y fragmentos de codigo.
- Respuestas sobre Next.js y React con explicacion adjunta.
- Conversacion multi-turno mediante plantilla de chat compatible con `apply_chat_template`.
- Inferencia servible con text-generation-inference y `endpoints_compatible`.
- Idiomas: solo ingles.
- No se documenta soporte de tool calling ni de function calling especifico para este fine-tune; aunque el modelo base Qwen3 dispone de plantillas para ello, la model card no indica que se haya entrenado ni evaluado esa capacidad.
- No hay modo thinking: la plantilla empleada no genera bloques `<think>`.
- No dispone de vision, audio ni otras modalidades.

## Casos de uso

- Generacion de landing pages completas desde un brief: el modelo recibe una descripcion estructurada (hero, tarjetas de producto, formulario, footer) y devuelve un unico documento HTML con su CSS. Es adecuado porque se entreno especificamente con ese formato de respuesta y con una ventana de salida de hasta 8.192 tokens.
- Prototipado rapido en agencias o trabajo freelance: permite obtener una primera maqueta funcional en segundos, que despues se refina a mano, reduciendo el tiempo de arranque de un proyecto.
- Edicion automatizada de ficheros front-end: con el prompt de sistema "apply the requested change to the file and output only the complete updated file", encaja en scripts que aplican cambios de bajo riesgo sobre plantillas existentes sin devolver explicaciones ni formato adicional.
- Asistente interno de documentacion de componentes: integrado en un chat sobre Next.js/React, puede responder con fragmentos de codigo y una explicacion breve, dado que ese tipo de pares se incluyo en el entrenamiento.
- Material didactico y ejercicios de JavaScript: el conjunto de ejercicios de JavaScript del entrenamiento favorece respuestas cortas y correctas para practicas o autoevaluacion.
- Generacion de plantillas HTML+CSS autocontenidas para demos, pruebas de concepto o paginas estaticas internas, donde el requisito es un unico fichero sin dependencias externas.
- Base para una especializacion posterior: al ser un modelo de 1,7B con licencia Apache-2.0 y adaptador LoRA disponible, es un punto de partida economico para un segundo ajuste con Unsloth sobre el dominio propio de una empresa.
- Generacion de esqueletos de interfaces en pipelines de CI o generadores internos, siempre con revision humana, dado el tamano del modelo y su tendencia a omitir elementos pedidos en el brief.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente ofrece la evolucion de la perdida de evaluacion durante la epoca de entrenamiento:

| Punto de la epoca | Perdida de evaluacion |
|---|---|
| 12% | 0,4757 |
| 24% | 0,4384 |
| 36% | 0,4168 |
| 48% | 0,3983 |
| 60% | 0,3886 |
| 72% | 0,3769 |
| 84% | 0,3711 |
| 100% | 0,3713 |

La evaluacion cualitativa se limito a generar una fila reservada por cada fuente de datos y revisarla manualmente. No hay resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar, y tampoco hay comparacion medida contra el modelo base.

## Requisitos de hardware

- Pesos en bfloat16 (formato publicado): aproximadamente 3,44 GB solo de parametros; con cache KV y activaciones, el consumo realista se situa en el entorno de 6 a 8 GB de VRAM para contextos de 8.192 tokens, dependiendo de la implementacion.
- Cuantizacion a 8 bits: alrededor de 1,8 GB de pesos. En 4 bits nf4: alrededor de 1,1-1,2 GB de pesos.
- Cabe con holgura en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 24 GB. En 4 bits es viable incluso en tarjetas de 8 GB, con contexto reducido.
- GPU de datacenter (A100, H100, L40S) no son necesarias para inferencia; se usarian solo para servir muchas replicas concurrentes.
- El entrenamiento documentado se realizo en 4x RTX 4090 de 24 GB durante 4 horas y 33 minutos para 16.701 pasos, lo que da una referencia de coste para reentrenar o continuar el ajuste.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (formato nativo del repositorio), text-generation-inference (el modelo esta etiquetado como `text-generation-inference` y `endpoints_compatible`), vLLM y servidores compatibles con la API de OpenAI. Para llama.cpp u Ollama seria necesario convertir previamente los pesos a GGUF, ya que no se distribuye ninguna cuantizacion GGUF.
- Latencia y throughput medidos: no disponibles. Lo unico documentado es el coste de entrenamiento indicado arriba.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| panzarasa/qwen3-1.7b-frontend-sft | 1,72B (denso) | 8.192 tokens de entrenamiento; contexto del base segun su documentacion | Front-end: HTML, CSS, JavaScript, edicion de fichero completo | Apache-2.0 | safetensors bf16 + adaptador LoRA; sin GGUF |
| Qwen/Qwen3-1.7B (base) | 1,72B (denso) | Contexto nativo de 32.768 tokens segun la documentacion del modelo base | Proposito general, con modo thinking y soporte de herramientas | Apache-2.0 | safetensors, GGUF y multiples cuantizaciones de la comunidad |
| Qwen/Qwen2.5-Coder-1.5B-Instruct | 1,54B (denso) | 32.768 tokens segun la documentacion del modelo base | Codigo generalista multilingue | Apache-2.0 | safetensors, GGUF y cuantizaciones de la comunidad |

La comparacion de rendimiento no es posible: no hay ningun benchmark publicado para el modelo ajustado, por lo que no se puede afirmar que supere o quede por debajo de estas alternativas en tareas de codigo. El modelo base Qwen3-1.7B ofrece mayor contexto declarado y capacidades adicionales (modo thinking, plantillas de herramientas), mientras que este fine-tune solo deberia preferirse cuando el objetivo sea exclusivamente generar o editar front-end en un unico fichero y se quiera evitar la verbosidad del modo razonamiento.

## Limitaciones y advertencias

- Entrenado para una sola epoca: la perdida de evaluacion se aplano al final con un decaimiento coseno hasta 1e-6, por lo que una segunda epoca con un nuevo schedule podria mejorar el resultado, pero no esta documentada.
- Puede omitir elementos solicitados explicitamente en el brief: en una de las paginas reservadas falta un `` que se pedia.
- Repeticion de contenido dentro de paginas largas; la model card indica que se mitiga parcialmente subiendo la temperatura.
- Ajuste de muestreo obligatorio: con temperatura 0,3 el modelo puede entrar en bucle de repeticion en briefs que especifican estructura pero no contenido y no llegar a cerrar `</html>`. La recomendacion medida es temperatura 0,7 con `repetition_penalty=1.05`.
- Presupuesto de salida: la pagina mas larga del conjunto de entrenamiento tiene 8.021 tokens de asistente, por lo que `max_new_tokens=8192` es el limite practico.
- Solo ingles: no hay evidencia de soporte multilingue, y las peticiones en castellano probablemente degraden la calidad.
- 1,7B parametros: cabe esperar estructura y andamiaje correctos, no textos de produccion ni contenidos finales; el propio autor lo advierte.
- Sin datos de benchmarks: no se puede verificar la calidad frente a alternativas con numeros objetivos.
- Licencia del modelo Apache-2.0, pero cada uno de los siete conjuntos de datos de entrenamiento conserva su propia licencia; es necesario revisarlas antes de redistribuir datos derivados o de usar el modelo en determinados contextos comerciales.
- Procedencia de datos parcialmente opaca: dos de las fuentes citadas (`glyphsoftware/opus-4.6-frontend-development` y `runanlab/gpt-5.4-frontend-development-27052026`) hacen referencia a nombres de modelos no identificables publicamente, lo que dificulta verificar el origen y las condiciones de uso de ese contenido.
- Adopcion nula en el momento de la consulta (0 descargas, 0 likes) y fechas de creacion y actualizacion anotadas como septiembre de 2026; no hay historial de uso en produccion ni validacion externa.
- Riesgo de alucinacion en APIs de frameworks: al generar codigo de Next.js o React puede inventar props, rutas o imports plausibles pero inexistentes, por lo que requiere revision y pruebas antes de desplegar.
- No se documenta soporte de tool calling ni de agentes multi-paso; no deberia asumirse su conservacion tras el ajuste fino.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/panzarasa/qwen3-1.7b-frontend-sft
- Adaptador LoRA: https://huggingface.co/panzarasa/qwen3-1.7b-frontend-sft/tree/main/adapter
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Plantilla de chat utilizada: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Version 4-bit usada en el entrenamiento: https://huggingface.co/unsloth/Qwen3-1.7B-unsloth-bnb-4bit
- Conjunto de datos HuggingFaceM4/WebSight: https://huggingface.co/datasets/HuggingFaceM4/WebSight
- Conjunto de datos bigcode/commitpackft: https://huggingface.co/datasets/bigcode/commitpackft
- Conjunto de datos xcodemind/webcode2m: https://huggingface.co/datasets/xcodemind/webcode2m
- Conjunto de datos Tesslate/Next.js-Dataset: https://huggingface.co/datasets/Tesslate/Next.js-Dataset
- Conjunto de datos saurabh5/rlvr-code-data-JavaScript-sft: https://huggingface.co/datasets/saurabh5/rlvr-code-data-JavaScript-sft
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los enlaces recuperados no guardan relacion con el y se omiten.
