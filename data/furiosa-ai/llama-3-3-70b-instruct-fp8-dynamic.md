# furiosa-ai/Llama-3.3-70B-Instruct-FP8-dynamic

## Resumen

Llama-3.3-70B-Instruct-FP8-dynamic es una variante cuantizada en FP8 del modelo Llama-3.3-70B-Instruct de Meta, publicada originalmente por RedHatAI y adaptada por FuriosaAI para su hardware RNGD. Se trata de un transformer denso autorregresivo de 70.000 millones de parametros, optimizado para dialogo multilingue, seguimiento de instrucciones y uso de herramientas, con una calidad competitiva con modelos mucho mas grandes.

La relevancia de esta version concreta radica en que FuriosaAI ha precompilado el modelo en un Furiosa Executable Bundle (FXB), lo que permite ejecutarlo de forma nativa y optimizada en sus aceleradores RNGD mediante el framework Furiosa-LLM. La cuantizacion FP8-dynamic combina pesos estaticos en FP8 con activaciones cuantizadas dinamicamente por token en tiempo de inferencia, lo que reduce los requisitos de memoria y acelera el despliegue sin necesidad de calibracion offline.

El modelo mantiene las mismas capacidades que el Llama-3.3-70B-Instruct original, incluyendo tool calling mediante el parser `llama3_json`, y esta disponible bajo la licencia Llama 3.3 Community License. Ademas de ejecutarse en RNGD, los pesos safetensors pueden utilizarse con otros frameworks como vLLM, SGLang o Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.3 (transformer denso autorregresivo) |
| Parametros totales | 70.553.706.496 |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 estatico para pesos, FP8 dinamico para activaciones |
| Idiomas soportados | en, fr, it, pt, hi, es, th, de |
| Licencia | Llama 3.3 Community License |
| Formato de pesos | safetensors (78,1 GB) + Furiosa Executable Bundle (FXB) |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura original de Llama 3.3: un transformer denso autorregresivo con atencion por ventanas y normalizacion RMSNorm, disenado por Meta para tareas de dialogo, instrucciones y uso de herramientas. La variante FP8-dynamic de RedHatAI cuantiza los pesos de los bloques transformer a FP8 de forma estatica, mientras que las activaciones se cuantizan dinamicamente por token en tiempo de inferencia, evitando la necesidad de calibracion offline con datasets de validacion.

Los datos de entrenamiento del modelo base no se detallan en la informacion disponible, pero corresponden a los del Llama-3.3-70B-Instruct original de Meta. No se menciona el uso de RLHF o DPO en esta variante especifica, ya que se trata de una cuantizacion posterior al entrenamiento del modelo ya afinado. La innovacion principal de esta publicacion es el empaquetado en FXB para ejecucion optimizada en hardware RNGD de FuriosaAI, con una estrategia de paralelismo tensorial de 32 PEs distribuidos en cuatro tarjetas RNGD.

## Capacidades

- Generacion de texto y dialogo multilingue en ocho idiomas: ingles, frances, italiano, portugues, hindi, espanol, tailandes y aleman.
- Seguimiento de instrucciones complejas y respuestas conversacionales de alta calidad, comparable a modelos de mayor tamano.
- Tool calling y function calling mediante el parser `llama3_json`, el mismo utilizado en la serie Llama 3, con soporte para `--enable-auto-tool-choice`.
- Integracion con la API compatible con OpenAI del servidor Furiosa-LLM, lo que facilita su uso en aplicaciones existentes.
- Ejecucion optimizada en hardware FuriosaAI RNGD mediante el bundle FXB precompilado, sin necesidad de compilacion por parte del usuario.
- Compatibilidad con otros frameworks de inferencia (vLLM, SGLang, Transformers) gracias a los pesos safetensors publicados.

## Casos de uso

- Atencion al cliente multilingue automatizada: el modelo puede gestionar conversaciones multi-turno en ocho idiomas, lo que permite desplegar asistentes virtuales para soporte internacional sin necesidad de modelos separados por idioma.
- Agentes con uso de herramientas: gracias al soporte de tool calling con el parser `llama3_json`, puede integrarse en sistemas que necesitan consultar APIs, bases de datos o servicios externos durante una conversacion.
- Generacion de codigo asistida en entornos empresariales: aunque no se especifican benchmarks de codigo, el modelo base Llama 3.3 tiene capacidades de generacion de codigo que pueden aprovecharse en IDEs o pipelines de CI/CD.
- Despliegue de LLMs en infraestructura con aceleradores FuriosaAI RNGD: el bundle FXB precompilado elimina la complejidad de compilacion y optimizacion, reduciendo el tiempo de puesta en produccion.
- Traduccion y localizacion de contenido: con soporte para ocho idiomas, puede utilizarse para traducir documentacion tecnica, interfaces de usuario o contenido de marketing con un unico modelo.
- Investigacion en eficiencia de inferencia: la cuantizacion FP8-dynamic permite estudiar el equilibrio entre precision y rendimiento en hardware especializado, sirviendo como referencia para otros proyectos de cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K u otros tests estandar, ni comparativas con otros modelos. Se recomienda consultar la documentacion de Meta para Llama-3.3-70B-Instruct o ejecutar evaluaciones propias si se requiere validacion de rendimiento.

## Requisitos de hardware

- Hardware objetivo: FuriosaAI RNGD, con una configuracion de paralelismo tensorial de 32 PEs distribuidos en cuatro tarjetas RNGD (8 PEs por tarjeta).
- VRAM estimada: no disponible en la informacion proporcionada. Dado el tamano de 70B parametros en FP8, se estima que requiere aproximadamente 70 GB de memoria, pero este dato no esta confirmado.
- GPU compatibles: no aplica para el bundle FXB, que solo funciona en RNGD. Los pesos safetensors pueden ejecutarse en GPUs de NVIDIA con frameworks como vLLM o Transformers, pero no se especifican requisitos minimos.
- Opciones de despliegue: Furiosa-LLM Server (con API compatible con OpenAI), vLLM, SGLang y Transformers para los pesos safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| furiosa-ai/Llama-3.3-70B-Instruct-FP8-dynamic | 70,5B | FP8 dinamico | no disponible | Llama 3.3 | FuriosaAI RNGD |
| RedHatAI/Llama-3.3-70B-Instruct-FP8-dynamic | 70,5B | FP8 dinamico | no disponible | Llama 3.3 | GPUs NVIDIA (vLLM, etc.) |
| meta-llama/Llama-3.3-70B-Instruct | 70,5B | BF16/FP16 | 128K (segun Meta) | Llama 3.3 | GPUs NVIDIA, TPUs |

La comparativa se limita a las variantes del mismo modelo base. No se dispone de datos para comparar con otros modelos de 70B como Qwen2.5-72B o Mistral Large en terminos de rendimiento, ya que no se han publicado benchmarks en la informacion disponible.

## Limitaciones y advertencias

- La licencia Llama 3.3 Community License impone restricciones de uso comercial: las empresas con mas de 700 millones de usuarios mensuales deben solicitar una licencia especifica a Meta.
- La cuantizacion FP8 puede introducir una ligera degradacion de precision en comparacion con el modelo original en BF16, especialmente en tareas que requieren alta exactitud numerica.
- La longitud de contexto no se especifica en la informacion disponible; se recomienda verificar la documentacion de Meta para conocer el limite real del modelo base.
- El bundle FXB solo funciona en hardware FuriosaAI RNGD; no es portable a otras arquitecturas sin utilizar los pesos safetensors y un framework alternativo.
- No se han publicado evaluaciones de sesgos o alucinaciones para esta variante especifica; los riesgos del modelo base de Meta aplican.
- El soporte de tool calling requiere activar explicitamente el parser `llama3_json` en el servidor Furiosa-LLM; sin esta configuracion, la funcionalidad no esta disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/furiosa-ai/Llama-3.3-70B-Instruct-FP8-dynamic
- Modelo base (RedHatAI): https://huggingface.co/RedHatAI/Llama-3.3-70B-Instruct-FP8-dynamic
- Modelo original (Meta): https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct
- Documentacion Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Guia de tool calling en Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/toolcalling.html
- Referencia del servidor Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/furiosa-llm-serve.html
- Licencia Llama 3.3: https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct/blob/main/LICENSE
