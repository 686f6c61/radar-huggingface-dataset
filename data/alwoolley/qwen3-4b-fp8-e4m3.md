# alwoolley/Qwen3-4B-fp8-e4m3

## Resumen

El modelo `alwoolley/Qwen3-4B-fp8-e4m3` es una cuantización en precisión FP8 (formato `float8_e4m3fn`) de los pesos del modelo base `Qwen/Qwen3-4B`, desarrollado por el usuario alwoolley. El objetivo es reducir el footprint de memoria y acelerar la inferencia en entornos con recursos limitados, manteniendo la arquitectura y capacidades del modelo original de Alibaba.

Qwen3-4B es un transformer causal denso de 4.022 millones de parámetros, con atención grouped-query (GQA) y la capacidad distintiva de alternar entre un modo de razonamiento explícito (thinking mode) y un modo directo (non-thinking mode) dentro de un mismo modelo. Esta cuantización FP8 reduce el tamaño de los pesos a un byte por parámetro, lo que lo hace especialmente atractivo para despliegue en GPUs de consumo o inferencia en el borde.

La relevancia de esta ficha radica en que ofrece una alternativa ligera al modelo original, con un tamaño de repositorio de 8,1 GB, aunque no se proporcionan detalles sobre el método de cuantización empleado ni resultados de benchmarks específicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con grouped-query attention (GQA) |
| Parametros totales | 4.022.468.096 (4,02 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 (float8_e4m3fn) |
| Idiomas soportados | No disponible (el modelo base soporta mas de 100 idiomas segun fuentes externas) |
| Licencia | other (segun la model card del repositorio) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3-4B es un transformer causal con grouped-query attention, entrenado por el equipo Qwen de Alibaba. Su caracteristica principal es la conmutacion dinamica entre un modo de pensamiento (thinking mode), que genera una cadena de razonamiento antes de la respuesta final para tareas complejas de matematicas, codigo o logica, y un modo no pensante (non-thinking mode) para dialogos generales mas rapidos. Esta cuantizacion FP8 no anade ninguna innovacion arquitectonica; simplemente convierte los pesos originales a precision de 8 bits con formato E4M3 (4 bits de exponente, 3 bits de mantisa). No se especifica el metodo de cuantizacion utilizado (por ejemplo, RTN, GPTQ, etc.) ni si se realizo calibracion con datos.

## Capacidades

- Generacion de texto y dialogo multiuso, heredadas del modelo base Qwen3-4B.
- Razonamiento complejo con modo thinking: genera cadenas de pensamiento para problemas de matematicas, logica y codigo.
- Modo non-thinking para respuestas rapidas y eficientes en conversaciones generales.
- Soporte de tool calling y function calling, lo que permite integrar el modelo en pipelines de agentes.
- Capacidades de agente y razonamiento multi-paso, segun la documentacion del modelo base.
- Soporte multilingue: el modelo base fue entrenado para seguir instrucciones en mas de 100 idiomas, aunque no se confirma en esta cuantizacion especifica.

## Casos de uso

- Inferencia local en equipos de consumo: gracias a su tamano reducido en FP8 (aproximadamente 4 GB de pesos), puede ejecutarse en GPUs con 8 GB de VRAM o menos, permitiendo asistentes personales sin conexion.
- Asistente de codigo en entornos de desarrollo: con soporte de tool calling, puede integrarse en IDEs para autocompletar, explicar fragmentos o generar tests, con baja latencia.
- Chatbot multilingue para atencion al cliente: el modo non-thinking ofrece respuestas rapidas en multiples idiomas, adecuado para sistemas de soporte automatizado.
- Razonamiento matematico y logico en educacion: el modo thinking permite desglosar problemas paso a paso, util para tutores virtuales o herramientas de aprendizaje.
- Agentes autonomos ligeros: su capacidad de function calling y razonamiento multi-paso lo hace apto para tareas de automatizacion, como gestion de calendarios o consultas a APIs.
- Prototipado rapido de aplicaciones NLP: al ser un modelo pequeno y cuantizado, es ideal para experimentar en entornos con recursos limitados antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras metricas para esta cuantizacion especifica. Se recomienda consultar los benchmarks del modelo base Qwen3-4B para una referencia aproximada, aunque la precision FP8 puede introducir ligeras variaciones.

## Requisitos de hardware

- VRAM estimada: los pesos FP8 ocupan aproximadamente 4 GB (4.022.468.096 parametros × 1 byte). Para inferencia, se recomienda al menos 8 GB de VRAM para dejar margen para la cache KV y las activaciones.
- GPUs compatibles: cualquier GPU con soporte para FP8 (por ejemplo, NVIDIA Ada Lovelace, Hopper o superior) o GPUs consumer como RTX 4090, RTX 4080, o incluso RTX 3090 si se usa una cuantizacion adicional o se limita el contexto.
- En GPUs con menos de 8 GB, podria ser necesario reducir la longitud de contexto o usar tecnicas de offloading a CPU.
- Opciones de despliegue: al ser un modelo en formato safetensors con pesos FP8, es compatible con frameworks que soporten esta precision, como vLLM (con backend FP8), TensorRT-LLM, o llama.cpp si se convierte a GGUF. No se confirma compatibilidad especifica con Ollama o TGI en la informacion disponible.
- Latencia y throughput: no se proporcionan datos. En general, la inferencia FP8 suele ser entre 1,5 y 2 veces mas rapida que BF16 en hardware optimizado, pero depende de la implementacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Qwen3-4B (base) | 4,02 B | No disponible | Apache 2.0 (segun fuentes externas) | BF16 |
| alwoolley/Qwen3-4B-fp8-e4m3 | 4,02 B | No disponible | other | FP8 |
| Qwen3-4B-FP8 (oficial de Qwen) | 4,02 B | No disponible | Apache 2.0 (segun fuentes externas) | FP8 |

La comparativa se limita a variantes del mismo modelo base. No se dispone de datos de rendimiento para establecer diferencias cuantitativas. La principal diferencia entre esta cuantizacion y la oficial de Qwen es el autor y la licencia declarada; el rendimiento deberia ser similar al ser la misma arquitectura y precision.

## Limitaciones y advertencias

- La cuantizacion FP8 puede introducir una ligera perdida de precision en comparacion con el modelo original en BF16, especialmente en tareas que requieren alta exactitud numerica.
- No se especifica el metodo de cuantizacion ni si se realizo calibracion, por lo que la calidad de la conversion no esta garantizada.
- La licencia declarada como "other" puede implicar restricciones de uso comercial; se recomienda revisar los terminos exactos del repositorio antes de su uso en produccion.
- El modelo base puede presentar sesgos y alucinaciones tipicos de los LLM; la cuantizacion no corrige estos problemas.
- No se dispone de informacion sobre la longitud de contexto soportada en esta version cuantizada; podria verse reducida si la implementacion de FP8 no gestiona correctamente la cache KV.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad; se recomienda probar exhaustivamente antes de adoptarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/alwoolley/Qwen3-4B-fp8-e4m3
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Version FP8 oficial de Qwen: https://huggingface.co/Qwen/Qwen3-4B-FP8
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Pagina de ModelScope de Qwen3-4B-FP8: https://www.modelscope.cn/models/Qwen/Qwen3-4B-FP8/summary
- Articulo de dev.co sobre Qwen3-4B-FP8: https://dev.co/ai/llms/qwen3-4b-fp8
