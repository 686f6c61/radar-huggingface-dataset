# canbingol/gemma-4-E2B-tool-use-tr

## Resumen

El modelo `canbingol/gemma-4-E2B-tool-use-tr` es un ajuste fino (fine-tuning) del modelo base `google/gemma-4-E2B-it` realizado por el usuario canbingol. Está especializado en tool calling y function calling en lengua turca, entrenado mediante aprendizaje supervisado (SFT) sobre el dataset `atasoglu/turkish-function-calling-20k`. El objetivo es adaptar un modelo generativo generalista a la tarea concreta de invocar funciones externas (APIs, herramientas) a partir de instrucciones en turco.

El modelo se distribuye como un adaptador LoRA (bajo el formato safetensors) con un tamaño de repositorio de 0,2 GB, lo que indica que no incluye los pesos completos del modelo base, sino únicamente los pesos del adaptador. No se especifican ni la licencia ni los idiomas soportados en la ficha de HuggingFace, aunque por el dataset de entrenamiento se infiere que está orientado al turco. Es un modelo reciente (creado en julio de 2026) con cero descargas y cero likes, por lo que su adopción es todavía nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: google/gemma-4-E2B-it) |
| Parametros totales | no disponible (el adaptador LoRA ocupa 0,2 GB; el modelo base no se especifica) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato safetensors, sin cuantizacion declarada) |
| Idiomas soportados | turco (inferido del dataset de entrenamiento) |
| Licencia | no disponible (en el README aparece "license" sin especificar) |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo base `google/gemma-4-E2B-it`. Por el nombre, se trata de una variante de la familia Gemma de Google, presumiblemente con alrededor de 2 mil millones de parámetros (E2B sugiere "Efficient 2B"), pero este dato no está confirmado en la ficha.

El entrenamiento se realizó mediante SFT (supervised fine-tuning) utilizando la librería TRL de HuggingFace, con el dataset `atasoglu/turkish-function-calling-20k`, que contiene 20.000 ejemplos de llamadas a funciones en turco. Se emplearon 2 épocas con una tasa de aprendizaje de 2e-4. El adaptador LoRA se configuró con r=16 y alpha=32, lo que implica un ajuste de bajo rango sobre las capas de atención del modelo base.

No se menciona el uso de técnicas como RLHF o DPO, ni innovaciones arquitectónicas adicionales. El enfoque es puramente de adaptación supervisada para la tarea específica de tool use.

## Capacidades

- Generación de texto en turco, con especialización en la invocación de funciones y herramientas externas.
- Soporte de tool calling / function calling: el modelo está entrenado para producir llamadas estructuradas a APIs a partir de instrucciones en lenguaje natural turco.
- Capacidad de seguir formatos de salida específicos (probablemente JSON o sintaxis de llamada a función), aunque el formato exacto no se documenta.
- No se especifican capacidades de razonamiento avanzado, código, matemáticas o visión, más allá de lo que pueda heredar del modelo base.
- No se indica soporte para agentes multi-step ni modo de pensamiento explícito.

## Casos de uso

- Asistentes virtuales en turco que necesitan consultar APIs de terceros (clima, reservas, búsquedas) mediante tool calling.
- Chatbots de atención al cliente en empresas turcas que requieren integración con sistemas CRM o bases de conocimiento mediante funciones.
- Automatización de tareas de back-office donde un modelo debe extraer parámetros y llamar a funciones internas (por ejemplo, crear tickets, actualizar registros).
- Prototipos de agentes conversacionales que orquestan múltiples herramientas en turco, como recordatorios, calendarios o envío de mensajes.
- Sistemas de generación de consultas SQL o llamadas REST a partir de peticiones en lenguaje natural turco.
- Entornos de desarrollo donde se necesita un modelo ligero y especializado para testing de pipelines de function calling antes de desplegar modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas específicas de tool calling para este modelo.

## Requisitos de hardware

- Al ser un adaptador LoRA de 0,2 GB, el requisito principal es cargar el modelo base `google/gemma-4-E2B-it`. Si el modelo base tiene aproximadamente 2B parámetros, en fp16 ocuparía unos 4-5 GB de VRAM, y en cuantización 4-bit alrededor de 1,5-2 GB.
- GPUs recomendadas: cualquier GPU con al menos 6 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) para inferencia en fp16; para cuantización 4-bit bastaría con 4 GB (por ejemplo, RTX 3050).
- El adaptador LoRA se puede cargar con transformers y PEFT, o exportar a GGUF para su uso con llama.cpp u Ollama, aunque no se proporciona soporte oficial.
- Opciones de despliegue: transformers + PEFT, vLLM (si se fusiona el adaptador con el modelo base), o llama.cpp mediante conversión a GGUF.
- Latencia y throughput: no disponibles. Se espera una latencia baja por el tamaño reducido del modelo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos. El único dato conocido es que se basa en `google/gemma-4-E2B-it` y se especializa en tool calling en turco, algo poco común. No hay modelos comparables documentados en la ficha.

## Limitaciones y advertencias

- Sesgos: al estar entrenado sobre un dataset específico de function calling en turco, puede presentar sesgos derivados de ese corpus (dominio limitado, posibles desequilibrios en tipos de funciones).
- Riesgo de alucinación: no se han evaluado tasas de alucinación; al ser un fine-tuning pequeño, puede generar llamadas a funciones inexistentes o con parámetros incorrectos.
- Limitaciones de idioma: el modelo está orientado al turco; su rendimiento en otros idiomas no está garantizado y probablemente sea deficiente.
- Restricciones de licencia: la licencia no está especificada, lo que impide conocer si su uso comercial está permitido.
- Limitaciones de contexto: no se conoce la longitud de contexto del modelo base, por lo que no se puede asegurar su comportamiento en conversaciones largas.
- Advertencia de producción: al tener cero descargas y ninguna validación externa, no se recomienda su uso en entornos productivos sin una evaluación exhaustiva previa.

## Enlaces

- HuggingFace: https://huggingface.co/canbingol/gemma-4-E2B-tool-use-tr
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Dataset de entrenamiento: https://huggingface.co/datasets/atasoglu/turkish-function-calling-20k (enlace no verificado en la ficha, se menciona en el README)
