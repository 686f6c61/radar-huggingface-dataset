# sady4850/Qwen3.8-27B-4bit-GPTQ-agentmix20

## Resumen

`sady4850/Qwen3.8-27B-4bit-GPTQ-agentmix20` es un checkpoint experimental de cuantizacion de `Qwen/Qwen3.8-27B`, publicado por el usuario sady4850. Se trata de una version GPTQ de 4 bits calibrada especificamente con trazas de agente, con el objetivo de reducir la degradacion que la cuantizacion introduce en tareas de razonamiento agentico y de invocacion de herramientas (tool calling). El modelo conserva la licencia Apache 2.0 del modelo base y se distribuye en formato MLX con cuantizacion afin de 4 bits y tamano de grupo 64, replicando el layout de `mlx-community/Qwen3.8-27B-4bit`.

El checkpoint forma parte de un estudio de calibracion de agentes: la model card indica que el resumen completo, el conjunto de pruebas y todas las variantes se encuentran en la ficha de `sady4850/Qwen3.8-27B-4bit-GPTQ-agentmix`. Esta variante concreta (`-agentmix20`) emplea una proporcion menor de trazas de agente en el conjunto de calibracion que la variante `-agentmix`. El modelo base es multimodal (pipeline `image-text-to-text`) y cuenta con 27.356.728.560 parametros segun los pesos en safetensors.

La relevancia de este checkpoint es practica: cuantizar a 4 bits un modelo de 27B permite reducir el peso del repositorio a 16,1 GB, lo que facilita su despliegue en hardware con memoria limitada. El interes tecnico radica en la calibracion orientada a agentes, que busca preservar la fidelidad de las llamadas a herramientas y del razonamiento multi-paso frente al modelo en bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B; detalles de la arquitectura del modelo base no disponibles en la informacion proporcionada) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ 4 bits, MLX affine 4-bit, group size 64 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria MLX) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del checkpoint `Qwen/Qwen3.8-27B`, del que no se detallan en la informacion proporcionada ni la arquitectura interna (tipo de atencion, posible estructura MoE, etc.) ni el volumen o composicion de los datos de entrenamiento originales. Lo que si se especifica es el proceso de cuantizacion: GPTQ con el layout exacto de `mlx-community/Qwen3.8-27B-4bit` (MLX affine 4-bit, group size 64), siguiendo el esquema de `sady4850/Qwen3.8-27B-4bit-GPTQ`.

La innovacion destacable es la calibracion del conjunto de datos para GPTQ: 50 fragmentos de UltraChat train, 50 de calibration_v5 y 20 trazas de agente, con 120 fragmentos de 2048 tokens en total. Esta mezcla busca que la cuantizacion penalice menos las capacidades agenticas. Segun la model card, frente a la variante `sady4850/Qwen3.8-27B-4bit-GPTQ` se observa una reduccion del KLD de razonamiento agentico del 24% (IC 95%: -26% a -22%, valor 0,0197) y del KLD de tool-call agentico del 21% (IC 95%: -26% a -15%, valor 0,0047), con un incremento de 1,8 puntos (IC 95%: -2,2 a +5,6; 56,2%) en la tasa de llamadas identicas a bf16. Como contrapartida, el KLD de wiki en torch empeora un 8% (0,0397) y el de chat un 1% (0,0999). Los numeros en bruto estan en el directorio `eval/` del repositorio.

## Capacidades

- Generacion de texto conversacional en formato multi-turno.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), segun la etiqueta del modelo.
- Razonamiento agentico multi-paso, con calibracion especifica para preservar esta capacidad tras la cuantizacion.
- Invocacion de herramientas (tool calling / function calling), optimizada mediante el conjunto de calibracion con trazas de agente.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo de pensamiento (thinking mode) u otras capacidades especiales: no disponibles en la informacion proporcionada.

## Casos de uso

- Agentes de automatizacion con herramientas: el checkpoint esta calibrado para mantener la fidelidad de las llamadas a funciones, por lo que es adecuado en pipelines donde el modelo debe decidir que herramienta invocar y con que argumentos, con una tasa de llamadas identicas a bf16 del 56,2% segun la model card.
- Razonamiento multi-paso en produccion: la reduccion del 24% en el KLD de razonamiento agentico frente a la cuantizacion GPTQ estandar lo hace preferible en flujos de planificacion encadenada donde la degradacion por cuantizacion es critica.
- Despliegue en hardware Apple Silicon: al usar la libreria MLX y el layout de `mlx-community`, se puede ejecutar en equipos con memoria unificada mediante el ecosistema MLX, con un peso de 16,1 GB.
- Asistentes conversacionales con contexto multimodal: la etiqueta `image-text-to-text` permite integrarlo en aplicaciones que reciben imagenes y texto, como soporte tecnico con capturas de pantalla.
- Evaluacion comparativa de tecnicas de cuantizacion: al formar parte de un estudio con variantes (`-agentmix`, `-agentmix20`) y datos en `eval/`, sirve como referencia para investigar el impacto de la calibracion en modelos cuantizados.
- Prototipado de agentes en local: su tamano de 16,1 GB y licencia Apache 2.0 permiten experimentar con agentes en estaciones de trabajo sin depender de infraestructura en la nube.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son las metricas diferenciales de la model card frente a `sady4850/Qwen3.8-27B-4bit-GPTQ`, medidas sobre 49 tareas:

| Metrica (vs GPTQ sin calibracion de agente) | Valor (IC 95%) |
|---|---|
| KLD de razonamiento agentico | -24% [-26%, -22%] (0,0197) |
| KLD de tool-call agentico | -21% [-26%, -15%] (0,0047) |
| Llamadas identicas a bf16 | +1,8 puntos [-2,2, +5,6] (56,2%) |
| KLD de wiki (torch) | +8% (0,0397) |
| KLD de chat (torch) | +1% (0,0999) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16,1 GB para los pesos en 4 bits, mas el overhead de activaciones y cache KV, que depende de la longitud de contexto (no disponible).
- GPU recomendadas: no disponibles en la informacion proporcionada; el formato MLX esta orientado a Apple Silicon con memoria unificada.
- Cabe en GPU de consumo: el peso de 16,1 GB es compatible con GPUs de 24 GB (por ejemplo, RTX 4090) en teoria, aunque el formato MLX no es el habitual para CUDA; no se confirma compatibilidad en la informacion proporcionada.
- Opciones de despliegue: MLX (libreria declarada). Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| sady4850/Qwen3.8-27B-4bit-GPTQ-agentmix20 | 27,36B | no disponible | GPTQ 4-bit, group 64 | Apache 2.0 | Calibrado con 20 trazas de agente |
| sady4850/Qwen3.8-27B-4bit-GPTQ-agentmix | no disponible | no disponible | GPTQ 4-bit | Apache 2.0 | Mayor proporcion de trazas de agente |
| sady4850/Qwen3.8-27B-4bit-GPTQ | no disponible | no disponible | GPTQ 4-bit | Apache 2.0 | Sin calibracion de agente; linea base de la comparativa |
| mlx-community/Qwen3.8-27B-4bit | no disponible | no disponible | MLX affine 4-bit, group 64 | no disponible | Mismo layout de pesos |

## Limitaciones y advertencias

- Checkpoint experimental: la propia model card lo describe como parte de un estudio de calibracion de agentes, no como un modelo listo para produccion.
- Degradacion en conocimiento general: el KLD de wiki empeora un 8% frente a la variante GPTQ sin calibracion de agente, lo que sugiere una perdida de fidelidad en tareas de conocimiento enciclopedico.
- Fidelidad imperfecta frente a bf16: solo el 56,2% de las llamadas coinciden con el modelo en bf16, con un intervalo de confianza que incluye valores negativos (-2,2 puntos).
- Idiomas soportados no documentados: no se puede garantizar el rendimiento multilingue.
- Longitud de contexto no documentada: no se puede planificar el uso en escenarios de contexto largo sin verificacion previa.
- Sesgos y riesgo de alucinacion: no documentados en la informacion proporcionada; al derivar de un modelo base sin ficha de riesgos en esta fuente, deben evaluarse de forma independiente.
- Licencia Apache 2.0: permite uso comercial, pero el caracter experimental y la ausencia de garantias desaconsejan su adopcion directa en produccion sin evaluacion propia.
- Formato MLX: el despliegue esta orientado al ecosistema MLX; el uso en otras plataformas no esta documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sady4850/Qwen3.8-27B-4bit-GPTQ-agentmix20
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante de referencia del estudio: https://huggingface.co/sady4850/Qwen3.8-27B-4bit-GPTQ-agentmix
- Variante GPTQ sin calibracion de agente: https://huggingface.co/sady4850/Qwen3.8-27B-4bit-GPTQ
- Layout MLX de referencia: https://huggingface.co/mlx-community/Qwen3.8-27B-4bit
