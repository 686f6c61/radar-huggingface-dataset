# drawais/circuitqa-adapters

## Resumen

CircuitQA Adapters es un conjunto de adaptadores LoRA publicados por Muhammad Awais, Octavian Adrian Postolache y Sancho Moura Oliveira (repositorio `drawais`) sobre el modelo base Qwen/Qwen2.5-Coder-7B-Instruct. No se trata de un modelo completo, sino de pesos PEFT que modifican el comportamiento del modelo base para tareas de respuesta a preguntas (question answering) sobre disenos RTL digitales, es decir, codigo Verilog y descripciones de hardware. El paquete acompana al trabajo *CircuitQA: A Grounded Architecture for Question Answering over Digital RTL Designs with Multi-Backend Query Routing* y esta pensado para integrarse en un pipeline de retrieval y enrutamiento de consultas hacia distintos backends de EDA.

El repositorio incluye varias carpetas con roles diferenciados: decodificadores de respuesta entrenados con tres semillas (`s4_seed42`, `s4_seed123`, `s4_seed456`), un modulo de enrutamiento de consultas (`router_s4`), adaptadores composicionales para consultas que requieren varias llamadas a backend (`mt_seed*`), un enrutador multi-backend (`router_mt`) y variantes de entrenamiento sobre particiones design-disjoint y repository-disjoint (`s2_seed*`, `s3_seed*`, `router_s3`). Los adaptadores usan rango 64 y alpha 128, con pesos almacenados en fp32 mientras el modelo base se carga en bf16.

Es relevante ahora porque aplica adaptacion eficiente de parametros (PEFT) a un dominio muy especializado, la verificacion y comprension de disenos RTL, donde los asistentes genericos de codigo suelen fallar. Al publicarse como adaptadores y no como checkpoint completo, el coste de almacenamiento y despliegue es reducido frente a un fine-tuning completo del modelo de 7B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-Coder-7B-Instruct |
| Parametros totales | 7B en el modelo base (los adaptadores LoRA anaden un subconjunto no especificado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-Coder-7B-Instruct, no confirmada) |
| Tipos de cuantizacion | no disponible (los adaptadores se almacenan en fp32; el base se carga en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT), requiere `peft>=0.21` |
| Rango LoRA / alpha | r = 64, alpha = 128 |
| Tamano del repositorio | 9.7 GB |
| Libreria | peft |

## Arquitectura y entrenamiento

El modelo es un conjunto de adaptadores LoRA de rango 64 y alpha 128 aplicados sobre Qwen2.5-Coder-7B-Instruct, un transformer decoder-only de 7B parametros especializado en codigo. Los pesos de los adaptadores se almacenan en fp32 y el modelo base se carga en bfloat16 durante la inferencia. El repositorio organiza los adaptadores en funcion de su papel en la arquitectura CircuitQA: un modulo de enrutamiento de consultas que decide que backends invocar, un decodificador de respuesta que redacta la respuesta final, y adaptadores composicionales para consultas que requieren multiples llamadas a backend.

El entrenamiento se realizo sobre el dataset `drawais/circuitqa`, con varias particiones: una division repository-disjoint (entrenamiento solo con plantillas, `s3_seed*`), una division design-disjoint (`s2_seed*`) y la configuracion principal (`s4_seed*`) con tres semillas para evaluar estabilidad. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO; la model card solo remite al dataset y al paper para esos detalles.

## Capacidades

- Respuesta a preguntas sobre disenos RTL digitales (codigo Verilog), apoyada en un pipeline de retrieval y enrutamiento hacia backends de EDA.
- Enrutamiento de consultas: el adaptador `router_s4` clasifica la consulta y decide que backend o backends deben consultarse.
- Composicion multi-backend: los adaptadores `mt_seed*` y `router_mt` permiten generar una lista de llamadas a backend cuando la consulta requiere informacion de varias fuentes.
- Generacion de respuestas fundamentadas (grounded) a partir de la informacion recuperada de los backends.
- Herencia de capacidades del modelo base Qwen2.5-Coder-7B-Instruct en generacion de codigo y texto, aunque el ajuste esta orientado al dominio RTL.
- Soporte de tool calling y agentes: no confirmado en la informacion disponible para estos adaptadores.
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Asistente de documentacion de bloques RTL: el adaptador de respuesta (`s4_seed42`) recibe la consulta del ingeniero junto con el contexto recuperado del diseno y genera una explicacion del modulo, sus puertos y su logica, reduciendo el tiempo de lectura de codigo Verilog ajeno.
- Verificacion de comprension de disenos: integrado en un pipeline que consulta un backend de analisis estatico, el enrutador decide que herramienta invocar y el decodificador redacta la respuesta, util para revisiones de codigo en equipos de hardware.
- Onboarding de nuevos ingenieros: un chatbot interno que responde preguntas sobre la jerarquia de modulos, senales y parametros de un repositorio RTL concreto, usando la particion repository-disjoint para generalizar a repositorios no vistos.
- Automatizacion de preguntas frecuentes en EDA: el adaptador `router_mt` permite consultas que combinan informacion de varias fuentes (por ejemplo, sintesis y temporizacion) y compone una respuesta unica.
- Evaluacion de modelos de codigo en dominio hardware: los tres seeds permiten medir la varianza del fine-tuning y comparar configuraciones de particion (design-disjoint frente a repository-disjoint) en experimentos de investigacion.
- Generacion de informes tecnicos sobre disenos: a partir de las respuestas de los backends, el decodificador produce resumenes estructurados de un diseno RTL para documentacion interna o auditoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al paper y al dataset `drawais/circuitqa` para las metricas de evaluacion, pero no incluye cifras concretas (MMLU, HumanEval, GSM8K u otras) en el repositorio de adaptadores.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 7B en bf16 requiere aproximadamente 14-16 GB de VRAM; en cuantizacion de 8 bits, unos 8-9 GB; en 4 bits, unos 5-6 GB. Los adaptadores anaden una sobrecarga pequena pero no cuantificada en la informacion disponible.
- GPU recomendadas: A100 40/80 GB, H100 para despliegues de alta concurrencia; RTX 4090 (24 GB) suficiente para bf16 en una sola GPU.
- GPU de consumo: cabe en RTX 4090 y en GPUs con 16 GB o mas en bf16; en 4 bits puede caber en GPUs de 8 GB, aunque no confirmado para estos adaptadores.
- Opciones de despliegue: transformers + peft (metodo indicado en la model card), vLLM con soporte de adaptadores LoRA, TGI con adaptadores, y llama.cpp/Ollama solo si se fusionan los adaptadores en el modelo base y se convierten a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CircuitQA Adapters (este) | 7B base + LoRA | no disponible | QA sobre RTL con enrutamiento multi-backend | Apache-2.0 | Hugging Face (adaptadores PEFT) |
| Qwen2.5-Coder-7B-Instruct | 7B | no disponible en esta ficha | Codigo general | Apache-2.0 | Hugging Face |
| Modelos de QA sobre codigo genericos | variable | variable | QA sobre codigo sin dominio hardware | variable | variable |

No se dispone de datos de rendimiento comparativos en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- El repositorio contiene unicamente adaptadores; es imprescindible descargar el modelo base Qwen2.5-Coder-7B-Instruct y su tokenizer por separado.
- Requiere `peft>=0.21`; versiones anteriores pueden no cargar las configuraciones correctamente.
- El ajuste esta acotado al dominio RTL y al pipeline CircuitQA; su uso fuera de ese contexto puede degradar el rendimiento respecto al modelo base.
- No se especifican sesgos conocidos ni tasas de alucinacion en la informacion disponible; al ser un modelo de QA fundamentado, el riesgo de alucinacion depende criticamente de la calidad del retrieval y de los backends consultados.
- No se confirman los idiomas soportados; el entrenamiento parece orientado a consultas tecnicas, posiblemente en ingles.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del dataset asociado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion externa.
- No hay informacion sobre latencia, throughput ni comportamiento bajo cuantizacion para estos adaptadores concretos.

## Enlaces

- Repositorio de adaptadores: https://huggingface.co/drawais/circuitqa-adapters
- Dataset y codigo: https://huggingface.co/datasets/drawais/circuitqa
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
