# PinoCookie/LFM2.5-2.6B-Abliterated

## Resumen

LFM2.5-2.6B-Abliterated es una edicion del modelo LiquidAI/LFM2.5-2.6B, desarrollada por PinoCookie, que elimina los circuitos de rechazo (refusal) del modelo base mediante una tecnica de abliteracion. El objetivo es proporcionar una version util para investigacion en red-teaming e interpretabilidad, donde la capacidad de generar respuestas que el modelo base rechazaria es necesaria.

La tecnica empleada no es un fine-tune ni un LoRA, sino una reconstruccion por ingenieria inversa del modelo Abiray/LFM2.5-2.6B-Heretic-Abliterated-GGUF. Se identificaron 52 tensores de proyeccion de salida modificados con actualizaciones rank-1, se extrajeron sus parametros mediante SVD y se reaplicaron sobre un modelo base pristino. Como resultado, el modelo replica el comportamiento del modelo de referencia a nivel de ruido de cuantizacion.

Arquitectonicamente, el modelo pertenece a la familia LFM2.5 de Liquid AI: una arquitectura hibrida de 30 capas que combina mecanismos de atencion con convoluciones de doble compuerta. Tiene 2.6B de parametros, una ventana de contexto de 131.072 tokens y se distribuye en formato Safetensors. Su licencia es la LFM Open License v1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5 hibrida (atencion + convolucion de doble compuerta), 30 capas, `Lfm2ForCausalLM` |
| Parametros totales | 2.697.198.592 (~2.6B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | bfloat16 (Safetensors); la version GGUF Q8_0 del modelo de referencia se uso para la reconstruccion |
| Idiomas soportados | Ingles |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | Safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura LFM2.5 de Liquid AI combina transformadores con capas convolucionales doblemente compuertas en un modelo hibrido de 30 capas. Esta estructura pretende mejorar la eficiencia computacional y la gestion de secuencias largas en comparacion con transformadores puros. El vocabulario es de 128.000 tokens y la configuracion declara una longitud maxima de contexto de 131.072 posiciones.

El modelo no ha sido entrenado desde cero ni ajustado mediante fine-tune o LoRA. Su proceso de creacion consistio en descomponer la diferencia entre un modelo de referencia abliterated y el modelo base. Se encontraron exactamente 52 tensores de proyeccion de salida modificados (20 en `conv.out_proj`, 25 en `feed_forward.w2` y 7 en `self_attn.out_proj`), todos con diferencias rank-1. Mediante descomposicion en valores singulares se extrajeron las direcciones y magnitudes de cada edicion, observandose una direccion global de rechazo compartida de 2048 dimensiones (coseno 0.96–0.99 a traves de la red). Posteriormente, estas ediciones se reaplicaron sobre un modelo base pristino, produciendo una copia cercana al modelo de referencia. La verificacion arrojo una diferencia relativa media de 0.0061, dentro del ruido de cuantizacion Q8_0.

## Capacidades

- Generacion de texto instructivo conversacional, heredada del modelo base LiquidAI/LFM2.5-2.6B.
- Razonamiento y lenguaje natural en ingles.
- Capacidad de abliteracion: no rechaza prompts dañinos, lo que permite generar respuestas que el modelo base bloquearia. En la evaluacion con 55 prompts dañinos, este modelo produjo 10.9% de refusals (6 de 55), frente al ~100% del modelo base.
- Bajo clasificador estricto de refusal duro, no presenta ninguna negativa: 0 de 55.
- Soporte de chat mediante `apply_chat_template` en Transformers.
- Uso como modelo de referencia para el estudio de circuitos de rechazo, gracias a sus ediciones rank-1 localizadas.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Capacidades de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Vision, audio o multimodalidad: no disponible, es un modelo de texto puro.

## Casos de uso

- Red-teaming de sistemas de seguridad: el modelo puede usarse para generar respuestas a prompts maliciosos y evaluar si los filtros o sistemas de defensa de una organizacion detectan contenidos que un modelo alineado rechazaria.
- Investigacion en interpretabilidad: al ser una edicion quirurgica con actualizaciones rank-1 en tensores de proyeccion, resulta util para estudiar los circuitos neuronales responsables del rechazo. Puede compararse con el modelo base para mapear que capas y canales son relevantes.
- Evaluacion de tecnicas de abliteracion: sirve como referencia para validar metodologias de edicion de pesos. Su proceso de reconstruccion y la verificacion con rel_mad 0.0061 demuestran que la tecnica es reproducible.
- Desarrollo de defensas contra jailbreaks: los equipos de seguridad pueden generar conjuntos de prompts adversarios usando este modelo para entrenar clasificadores de contenido o detectar patrones de comportamiento residuales tras la abliteracion.
- Estudios de alineacion: permite medir como cambia el comportamiento de seguridad cuando se elimina la direccion de rechazo, aportando datos sobre la robustez del proceso de alineacion y sobre la diferencia entre modelos seguros y modelos abliterated.
- Generacion de contenido en entornos de investigacion controlados: en contextos donde las politicas de seguridad del modelo base impiden investigar ciertos temas (por ejemplo, escenarios de crimen o vulnerabilidades de seguridad), este modelo permite generar textos no bloqueados, siempre bajo condiciones de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidades generales (MMLU, HumanEval, GSM8K) en la informacion disponible. La unica evaluacion publicada en la model card es una prueba de comportamiento de rechazo sobre 55 prompts dañinos, usando el mismo ajuste de 1536 tokens y un juez deepseek-v4-flash que el modelo de referencia.

| Modelo | Refusals / no entrega |
|---|---|
| Modelo base pristino | ~100% |
| Abiray/LFM2.5-2.6B-Heretic-Abliterated-GGUF (referencia) | 1/55 (1.8%) |
| PinoCookie/LFM2.5-2.6B-Abliterated | 6/55 (10.9%) |

Ademas, bajo un clasificador estricto de refusal duro el modelo presenta 0 de 55. Como experimento de control, al aplicar la misma geometria de edicion pero con una direccion de rechazo distinta se produjo un colapso en la calidad de contenido benigno (unicidad benigna 0.54 frente a 0.86 del modelo pristino), lo que confirma que la direccion compartida u1 es critica para el resultado.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en bfloat16 ocupa aproximadamente 5,4 GB solo en pesos. Con la ventana de contexto de 131.072 tokens, el KV cache puede requerir entre 2 y 8 GB adicionales segun la implementacion. Se recomienda entre 8 y 16 GB de VRAM para bfloat16 con contexto largo.
- Si se usa una version GGUF cuantizada (por ejemplo Q8_0, como la del modelo de referencia), los pesos ocupan alrededor de 2,6 GB y pueden ejecutarse en GPUs de consumo con 4-6 GB de VRAM.
- GPUs recomendadas: RTX 4090 24GB, A100 40GB, H100 80GB, RTX 3060 12GB o T4 16GB para bfloat16; RTX 4060 8GB o Apple Silicon (M1/M2/M3) para versiones cuantizadas.
- Opciones de despliegue: Transformers (carga directa con `device_map="auto"`), y por ser un modelo estandar de Transformers es compatible con vLLM y TGI, aunque no hay configuraciones oficiales documentadas. llama.cpp y Ollama son opcionales si se convierte a GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| PinoCookie/LFM2.5-2.6B-Abliterated | ~2.6B | 131.072 | LFM Open License v1.0 | Safetensors (bfloat16) | Reconstruccion del modelo de referencia con abliteracion |
| LiquidAI/LFM2.5-2.6B (base) | ~2.6B | 131.072 | LFM Open License v1.0 | Safetensors (bfloat16) | Modelo original, conserva refusals (~100% en prompts dañinos) |
| Abiray/LFM2.5-2.6B-Heretic-Abliterated-GGUF | ~2.6B | 131.072 | LFM Open License v1.0 (heredada) | GGUF Q8_0 | Referencia usada para la reconstruccion, 1/55 refusals |
| PinoCookie/LFM2.5-1.2B-Instruct-Abliterated | 1.17B | no disponible | no disponible | Safetensors | Version reducida del mismo autor, tambien abliterated |

## Limitaciones y advertencias

- Uso indebido: al haberse eliminado intencionadamente los rechazos, el modelo puede generar contenido dañino. La model card restringe su uso a investigacion, red-teaming e interpretabilidad.
- No es un modelo entrenado desde cero: hereda las limitaciones del modelo base LiquidAI/LFM2.5-2.6B.
- Riesgo de alucinacion: en la evaluacion de 55 prompts dañinos se detecto 1 caso de alucinacion. No se han realizado evaluaciones completas de alucinacion en otros dominios.
- Idioma: solo soporta ingles de forma nativa. Otros idiomas no estan garantizados.
- Contexto largo: aunque la configuracion soporta 131.072 tokens, no se han publicado resultados sobre la calidad de la generacion en contextos muy largos ni sobre la degradacion progresiva.
- Casos de borde en el comportamiento de rechazo: el modelo presenta un 10.9% de refusals residuales (frente al 1.8% de la referencia), lo que indica que la transferencia del comportamiento no es exacta en la frontera de cumplimiento.
- Licencia: la LFM Open License v1.0 permite el uso open source, pero los terminos exactos para uso comercial y distribucion deben consultarse en el archivo LICENSE del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PinoCookie/LFM2.5-2.6B-Abliterated
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Modelo de referencia: https://huggingface.co/Abiray/LFM2.5-2.6B-Heretic-Abliterated-GGUF
- Otro modelo del autor: https://huggingface.co/PinoCookie/LFM2.5-1.2B-Instruct-Abliterated
