# pranil00/ONIX-Qwen2.5-Math-1.5B-Instruct-GGUF

## Resumen

ONIX-Qwen2.5-Math-1.5B-Instruct-GGUF es una cuantizacion en formato GGUF del modelo Qwen2.5-Math-1.5B-Instruct, desarrollado originalmente por el equipo Qwen de Alibaba y publicado como artefacto derivado por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. Se trata de un modelo de lenguaje especializado en razonamiento matematico, con 1.777 millones de parametros (1,78 B) y una arquitectura transformer densa de la familia Qwen2.5.

El artefacto concreto que nos ocupa aplica una cuantizacion Q5_K_M (5,5 bits por peso), reduciendo el peso de 3,48 GB en FP16 a 1,19 GB, lo que supone una compresion del 65,6 %. El autor declara una retencion de calidad cognitiva de aproximadamente el 97,5 % respecto al modelo original. La relevancia practica esta en que permite ejecutar un modelo matematico especializado en hardware de consumo, incluidos portatiles con Apple Silicon o GPUs NVIDIA de gama media.

La publicacion tiene cero descargas y cero likes en el momento de la ficha, y no incluye informacion sobre idiomas soportados ni resultados de benchmarks propios. El modelo base Qwen2.5-Math-1.5B-Instruct esta disenado para resolver problemas matematicos con cadenas de razonamiento (chain-of-thought) y soporta instrucciones en formato chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2.5) |
| Parametros totales | 1.777.029.120 (1,78 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (ventana optima declarada; 4.096 en CPU) |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso); unico artefacto publicado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `Qwen--Qwen2.5-Math-1.5B-Instruct-Q5_K_M.gguf`, 1,19 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Qwen2.5, con 1,78 B de parametros, disenado especificamente para tareas de matematicas. Qwen2.5-Math se entreno con un enfoque que combina preentrenamiento sobre corpus matematicos y ajuste fino supervisado con cadenas de razonamiento (chain-of-thought), ademas de tecnicas de reinforcement learning para mejorar la precision en la resolucion de problemas. La informacion proporcionada no detalla el numero exacto de tokens de entrenamiento ni la composicion del dataset.

El artefacto publicado no modifica la arquitectura: es una conversion a GGUF con cuantizacion Q5_K_M realizada con la herramienta `run-any-model`, un motor de optimizacion adaptativo al dispositivo. El autor declara que se aceleran las 28 capas del modelo (28/28 layers) en Metal, y que el buffer de KV cache se mantiene en FP16 (112 MB) para preservar la calidad. No se documentan innovaciones adicionales como decodificacion especulativa ni atencion lineal.

## Capacidades

- Generacion de texto y razonamiento matematico paso a paso (chain-of-thought), especialidad principal del modelo base.
- Resolucion de problemas aritmeticos, algebraicos y de enunciado verbal en formato instruct.
- Formato chat con tokens especiales (`<|im_end|>`, `<|endoftext|>`) segun la configuracion de Ollama incluida en la model card.
- Soporte de conversacion multi-turno dentro de la ventana de contexto (hasta 8.192 tokens en configuracion optima).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y multi-step reasoning: no documentado explicitamente; el razonamiento paso a paso del modelo base es la unica base al respecto.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Tutoria matematica interactiva: el modelo puede resolver problemas paso a paso y explicar el razonamiento, adecuado para aplicaciones educativas locales que requieran privacidad y no dependan de la nube.
- Asistente de resolucion de ejercicios en escritorio: con 1,19 GB de pesos cabe en un portatil modesto y permite consultas offline de algebra y aritmetica.
- Preprocesado de problemas matematicos en pipelines de datos: util para generar soluciones candidatas o normalizar enunciados antes de un modelo mayor.
- Prototipado rapido en entornos con recursos limitados: sirve para validar prompts y formatos de evaluacion antes de escalar a modelos Qwen2.5-Math de mayor tamano.
- Integracion en herramientas de calculo asistido: puede actuar como capa de interpretacion de enunciados que luego se validan con un motor simbolico.
- Demostraciones y docencia sobre cuantizacion: el artefacto incluye telemetria de memoria y compresion que lo hace util como ejemplo practico de despliegue GGUF en hardware de consumo.
- Chat de terminal ligero: ejecutable con `llama-cli` o `run-any-model` para consultas matematicas puntuales sin infraestructura adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye una matriz de telemetria de memoria y compresion, no metricas de calidad en tareas como MMLU, GSM8K o MATH.

| Metrica (telemetria del autor) | FP16 (base) | Q5_K_M (cuantizado) | Cambio |
|---|---|---|---|
| Precision en bits por parametro | 16,0 | 5,5 | -65,6 % |
| Tamano de pesos | 3,48 GB | 1,19 GB | -65,6 % |
| KV cache | 112 MB (FP16) | 112 MB (FP16) | Optimizado |
| RAM residente total | 3,61 GB | 1,33 GB | -63,1 % |
| Calidad estimada | 100 % | 97,5 % | -2,5 % |
| Capas aceleradas | 0 % | 28/28 | Optimo |

## Requisitos de hardware

- VRAM/RAM estimada: 1,33 GB de memoria unificada en Apple Silicon; 2,69 GB de VRAM dedicada en NVIDIA; 3,33 GB de RAM libre en CPU x86.
- GPU recomendadas: cualquier NVIDIA RTX 30/40/50 series con al menos 3 GB de VRAM; en Apple Silicon, chips M1 a M5.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 3 GB o mas de VRAM; tambien en CPU con soporte AVX2/AVX-512.
- Opciones de despliegue: `run-any-model` (CLI del autor), Ollama (con Modelfile incluido), llama.cpp (`llama-cli`), LM Studio, Jan y Text-Generation-WebUI.
- Contexto recomendado: 8.192 tokens en GPU/Apple Silicon; 4.096 tokens en CPU.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ONIX-Qwen2.5-Math-1.5B-Instruct-GGUF (Q5_K_M) | 1,78 B | 8.192 | GGUF | Apache 2.0 | Cuantizacion Q5_K_M de 1,19 GB; sin benchmarks publicados |
| Qwen2.5-Math-1.5B-Instruct (original) | 1,78 B | 4.096 (segun modelo base) | safetensors | Apache 2.0 | Modelo de referencia en FP16/BF16; requiere ~3,5 GB |
| Qwen2.5-Math-7B-Instruct | 7 B aprox. | no disponible | safetensors / GGUF | Apache 2.0 | Mayor capacidad matematica a costa de mas VRAM |
| Qwen2.5-1.5B-Instruct (generalista) | 1,78 B | 32.768 (segun modelo base) | safetensors / GGUF | Apache 2.0 | Menos especializado en matematicas, contexto mayor |

La comparativa con alternativas de la misma categoria se limita a la informacion disponible; no se han publicado metricas comparativas de rendimiento para este artefacto concreto.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada; al derivar de Qwen2.5, hereda los sesgos del corpus de entrenamiento del modelo base.
- Riesgo de alucinacion: presente, especialmente en problemas matematicos complejos donde el modelo puede producir cadenas de razonamiento plausibles pero incorrectas; requiere validacion.
- Limitaciones de contexto: la ventana optima declarada es de 8.192 tokens, inferior a la de otros modelos Qwen2.5 generalistas; en CPU se reduce a 4.096.
- Idiomas: no se especifican idiomas soportados; el modelo base esta orientado principalmente a ingles y chino, con soporte limitado de otros idiomas.
- Licencia: Apache 2.0 permite uso comercial, pero el autor incluye una clausula de exencion total de responsabilidad sobre los resultados generados.
- Caveat de produccion: el artefacto tiene cero descargas y cero likes; no hay validacion comunitaria ni benchmarks independientes que respalden la retencion de calidad del 97,5 % declarada.
- La cuantizacion Q5_K_M introduce perdida de precision; para tareas matematicas de alta exigencia conviene comparar con el modelo base en FP16.
- La model card mezcla referencias a licencia "Apache 2.0 / MIT" en el texto y Apache 2.0 en los metadatos; conviene verificar la licencia aplicable antes de un uso comercial.

## Enlaces

- Hugging Face: https://huggingface.co/pranil00/ONIX-Qwen2.5-Math-1.5B-Instruct-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B-Instruct
- Organizacion ONIX: https://huggingface.co/ONIX
- Repositorio run-any-model: https://github.com/PranilShah-08/run-any-model
