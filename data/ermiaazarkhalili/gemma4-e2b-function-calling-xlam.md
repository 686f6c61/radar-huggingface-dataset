# ermiaazarkhalili/Gemma4-E2B-Function-Calling-xLAM

## Resumen

Gemma4-E2B-Function-Calling-xLAM es un ajuste fino supervisado del modelo multimodal google/gemma-4-E2B-it, especializado en la generación de llamadas a funciones (function calling) a partir de definiciones de herramientas en JSON. Lo desarrolla el usuario independiente ermiaazarkhalili y se publica bajo licencia Apache 2.0 en Hugging Face. El modelo parte de la familia Gemma 4 de Google, en su variante E2B (effective 2B), y hereda su naturaleza multimodal imagen-texto, aunque el entrenamiento y el uso documentado son exclusivamente de texto.

El problema que aborda es concreto: convertir consultas en lenguaje natural y un catálogo de herramientas en llamadas estructuradas JSON, un componente central en pipelines de agentes y asistentes con tool calling. Para ello se entrena con QLoRA sobre el conjunto Salesforce/xlam-function-calling-60k, un corpus de referencia para function calling, y posteriormente se fusionan los adaptadores en una copia bf16 del modelo base.

El checkpoint completo contiene 5.104.297.539 parámetros según los pesos safetensors publicados, con un tamaño de repositorio de 10,2 GB. Es relevante para desarrolladores que necesitan un modelo compacto, con licencia permisiva y formato de prompt explícito para integración en sistemas de agentes, si bien carece por ahora de descargas, valoraciones y benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma4ForConditionalGeneration); ajuste LoRA solo sobre el modelo de lenguaje |
| Parametros totales | 5.104.297.539 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (max_length de entrenamiento: 2048) |
| Tipos de cuantizacion | Entrenamiento en 4 bits NF4 con doble cuantizacion; pesos publicados en bf16; no se documentan GGUF ni otras cuantizaciones |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un Gemma4ForConditionalGeneration completo, es decir, un transformer multimodal con codificadores de vision y audio y un modelo de lenguaje central. El ajuste LoRA se aplico unicamente al modelo de lenguaje mediante PEFT y el SFTTrainer de TRL; los codificadores de vision y audio conservan los pesos originales del modelo base y el procesador incluido es el del modelo base. Los adaptadores se fusionaron despues en una copia bf16 de google/gemma-4-E2B-it.

La configuracion de entrenamiento documentada incluye carga en 4 bits con quant_type nf4, compute_dtype bfloat16 y doble cuantizacion, atencion con implementacion sdpa, r=16, lora_alpha=32, lora_dropout=0.05, target_modules=all-linear, bias=none y task_type=CAUSAL_LM, con max_length de 2048. El dataset es Salesforce/xlam-function-calling-60k. Solo el bloque de respuestas (answers) y el token EOS aportaron perdida durante el entrenamiento. No se documentan numero total de tokens, composicion detallada del dataset, ni fases de RLHF o DPO.

Una particularidad tecnica destacable es el formato de prompt: texto etiquetado en crudo, sin plantilla de chat, con bloques `<query>`, `<tools>` y `<answers>`, y un `<bos>` inicial que el tokenizador no anade por si mismo. Herramientas y respuestas se serializan en JSON.

## Capacidades

- Generacion de llamadas a funciones en JSON a partir de consultas y definiciones de herramientas, con el formato `<query>`/`<tools>`/`<answers>`.
- Salida estructurada parseable: el bloque `<answers>` contiene una lista JSON de llamadas, cerrada con `<eos>`.
- Herencia multimodal del modelo base (codificadores de vision y audio intactos), aunque el entrenamiento y los ejemplos de uso son solo de texto.
- Generacion de texto conversacional y de instrucciones, por su base en gemma-4-E2B-it.
- Soporte de tool calling de multiples herramientas en una misma consulta, segun el formato del dataset xLAM.
- Capacidades de agentes y razonamiento multi-paso: no documentadas de forma explicita en la model card.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma declarada.

## Casos de uso

- Enrutamiento de herramientas en asistentes: dado un catalogo de funciones y la consulta del usuario, el modelo emite la llamada JSON adecuada, lo que permite construir un despachador de herramientas en un backend de agentes.
- Integracion en pipelines de agentes LLM: el formato de prompt explicito y la salida JSON delimitable facilitan el parseo determinista y la validacion con esquemas antes de ejecutar la funcion.
- Automatizacion de APIs de terceros: con definiciones de herramientas como las de los ejemplos (APIs de razas de gatos, geolocalizacion, datos de empresas), el modelo selecciona funcion y argumentos, util para capas de integracion.
- Prototipado rapido de asistentes con tool calling: al ser un checkpoint compacto de unos 5.100 millones de parametros y licencia Apache 2.0, se puede desplegar en entornos de desarrollo sin negociacion de licencia.
- Generacion de datos sinteticos de function calling: el modelo puede producir pares consulta-llamada para aumentar datasets de entrenamiento de otros sistemas.
- Investigacion en ajuste fino: sirve como referencia reproducible de un pipeline QLoRA + SFTTrainer + fusion de adaptadores sobre un modelo Gemma 4, con hiperparametros documentados.
- Evaluacion de robustez en seleccion de herramientas: util para probar como se comporta un modelo pequeno ante catalogos de herramientas grandes o ambiguos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 10-11 GB solo para pesos (5.104 millones de parametros), mas overhead de activaciones y cache KV; el repositorio ocupa 10,2 GB.
- VRAM estimada en 4 bits: aproximadamente 3-4 GB para pesos, sin contar overhead; no se publican pesos cuantizados, por lo que habria que cuantizar localmente.
- GPU recomendadas: A100 o H100 para mayor throughput; RTX 4090 (24 GB) para inferencia comoda en bf16; GPU consumer de 12-16 GB podrian alojar el modelo en bf16 con margen ajustado o en cuantizacion de 8/4 bits.
- Cabe en GPU consumer: si, en tarjetas de 16 GB o mas en bf16, y previsiblemente en 8-12 GB con cuantizacion, aunque no se documentan pesos GGUF.
- Opciones de despliegue: transformers (metodo documentado, con device_map="auto" y dtype="auto"); vLLM, llama.cpp, Ollama o TGI no estan documentados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma4-E2B-Function-Calling-xLAM | 5.104.297.539 | no disponible (entrenamiento a 2048) | Function calling (fine-tune) | Apache 2.0 | Hugging Face, 0 descargas |
| google/gemma-4-E2B-it (base) | no disponible | no disponible | Modelo multimodal de instrucciones | Licencia Gemma 4 | Hugging Face (modelo base) |
| Salesforce/xLAM (familia de modelos de function calling) | no disponible | no disponible | Function calling | no disponible | no disponible |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta validado.
- Riesgo de alucinacion en la seleccion de herramientas y en los argumentos generados; conviene validar la salida JSON contra el esquema de cada funcion antes de ejecutarla.
- El formato de prompt es estricto: requiere `<bos>` manual, bloques `<query>`, `<tools>` y `<answers>`, y JSON en herramientas y respuestas; usar una plantilla de chat estandar puede degradar la salida.
- El entrenamiento se limita a max_length 2048, por lo que no hay garantias de comportamiento con catalogos de herramientas o consultas mas largas.
- Aunque el checkpoint es multimodal, los codificadores de vision y audio no se ajustaron; no hay evidencia de calidad en tareas de imagen o audio tras el fine-tune.
- Licencia Apache 2.0 con enlace a la licencia de Gemma 4 de Google: conviene revisar los terminos de uso de Gemma 4 para uso comercial, ya que pueden imponer condiciones adicionales.
- Modelo sin descargas ni valoraciones y sin benchmarks publicados; su calidad real no esta contrastada de forma independiente.
- Al ser un fine-tune de un modelo pequeno (E2B), puede tener menor robustez que modelos mayores en razonamiento multi-paso o en seleccion entre muchas herramientas.

## Enlaces

- Hugging Face: https://huggingface.co/ermiaazarkhalili/Gemma4-E2B-Function-Calling-xLAM
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Dataset de entrenamiento: https://huggingface.co/datasets/Salesforce/xlam-function-calling-60k
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
