# ewinregirgojr/Qwen3.8-19B-Pruned-GGUF

## Resumen

Qwen3.8-19B-Pruned-GGUF es una versión podada y cuantizada del modelo de la serie Qwen3.8, desarrollada por el usuario ewinregirgojr. El modelo original, con 27.320.697.856 parámetros en su forma densa (según el escáner de HuggingFace), se comprime mediante poda estructurada SparseGPT al 30%, dejando aproximadamente 18.900 millones de parámetros activos (unos 19B efectivos). El resultado se distribuye en formato GGUF de un solo archivo, con cuantizaciones Q4_0, Q6_K y Q8_0, pensado para inferencia local en hardware de consumo.

La relevancia de este modelo radica en que combina la capacidad de razonamiento y generación de la serie Qwen3.8 (con soporte para razonamiento, function calling y contexto de hasta 262.144 tokens) con una reducción significativa de requisitos de memoria. Frente a un modelo denso equivalente, la versión podada permite ejecutar contextos de 8.000 a 16.000 tokens completamente en VRAM de una GPU de 24 GB, con velocidades de generación de hasta 83,2 tokens por segundo, y soportar entre 4 y 8 usuarios concurrentes en servidores multi-usuario. La licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (serie Qwen3.8, poda estructurada SparseGPT 30%) |
| Parametros totales | 27.320.697.856 (denso, según escáner de HF) |
| Parametros activos | ~18.900.000.000 (19B efectivos tras poda del 30%) |
| Longitud de contexto | Hasta 262.144 tokens |
| Tipos de cuantizacion | Q4_0 (17,79 GB), Q6_K (23,20 GB), Q8_0 (29,30 GB) |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un solo archivo por cuantizacion) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la serie Qwen3.8, con 27.320 millones de parámetros en su forma original. Sobre él se aplica una poda estructurada del 30% mediante SparseGPT, que elimina pesos no informativos y actualiza analíticamente los pesos activos restantes (el 70%) para compensar la pérdida de información. Esta compensación por curvatura (basada en la inversa de la matriz Hessiana calculada con datos de calibración) produce una distribución de pesos más ajustada, lo que reduce la degradación al cuantizar posteriormente a 4, 6 u 8 bits. El modelo conserva 866 capas de texto tras la poda.

No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO en el modelo original. La poda y cuantización se realizaron posteriormente sobre el modelo ya entrenado, sin reentrenamiento adicional. El formato GGUF permite su uso con llama.cpp, Ollama, LM Studio, Jan, Unsloth, LocalAI y Open WebUI.

## Capacidades

- Generacion de texto y chat conversacional multiuso, con soporte para razonamiento y modo "thinking" (etiquetado como reasoning y thinking).
- Function calling / tool calling, lo que permite integrar el modelo en agentes que invocan herramientas externas.
- Soporte para agentes y razonamiento multi-paso, gracias a su capacidad de razonamiento y a la ventana de contexto larga.
- Capacidades multilingues en ingles y chino (los dos idiomas declarados).
- Contexto largo de hasta 262.144 tokens, adecuado para documentos extensos o conversaciones de muchos turnos.
- Multi-token prediction (MTP), segun las etiquetas del modelo, que puede mejorar la velocidad de decodificacion.
- Compatible con endpoints estandar (endpoints_compatible) y con region US.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 262k tokens) sin perder el hilo, y su soporte de function calling permite consultar bases de datos de pedidos o incidencias en tiempo real. Su licencia Apache 2.0 facilita su despliegue en produccion comercial.
- Asistente de programacion local: con la cuantizacion Q4_0 (17,79 GB) cabe en una GPU de 24 GB, permitiendo autocompletado y generacion de codigo en entornos de desarrollo sin conexion a internet, con velocidades de hasta 83,2 tokens por segundo.
- Analisis de documentos largos: la ventana de 262k tokens permite procesar informes, contratos o articulos cientificos completos en una sola pasada, extrayendo resumenes o respondiendo preguntas sobre el contenido.
- Agente autonomo con herramientas: gracias al function calling y al razonamiento multi-paso, puede actuar como agente que planifica tareas, llama a APIs externas (por ejemplo, busquedas web, calculo, envio de correos) y ejecuta flujos complejos.
- Servicio de chat multiusuario en una sola GPU: con la poda, una RTX 3090 o 4090 puede servir entre 4 y 8 usuarios simultaneos sin OOM, lo que reduce costes de infraestructura para pequenas empresas o proyectos de investigacion.
- Prototipado rapido en Google Colab: el autor proporciona un notebook de Colab con un clic, lo que permite probar el modelo con sliders visuales y chat templating sin configurar hardware local.

## Benchmarks y rendimiento

Segun los resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Resultado |
|---|---|
| MMLU (5-shot) | 81,5 |
| GSM8K (8-shot) | 86,9 |

No se han publicado comparaciones con otros modelos en la informacion disponible. Estos valores son competitivos para un modelo de ~19B activos, aunque deben tomarse con cautela al no estar verificados por terceros.

## Requisitos de hardware

- Q4_0 (17,79 GB): requiere ~20 GB de RAM/VRAM. Cabe en RTX 3090, RTX 4090, Apple Silicon con 24 GB o mas, o 32 GB de RAM de sistema.
- Q6_K (23,20 GB): requiere ~26 GB. Necesita RTX 3090/4090 con offload parcial a CPU, Apple Silicon de 32 GB o mas, o 48 GB de RAM.
- Q8_0 (29,30 GB): requiere ~32 GB. Recomendado A100 de 40 GB, doble RTX 3090/4090, Apple Silicon de 48 GB o mas, o 64 GB de RAM.
- En una GPU de 24 GB con Q4_0, quedan ~6,2 GB libres para KV cache, permitiendo contextos de 8k a 16k tokens completamente en VRAM.
- Velocidad de generacion: 83,2 tokens por segundo en Q4_0 con GPU de 24 GB (frente a 34,2 tok/s en el modelo denso equivalente).
- Concurrencia: 4 a 8 usuarios paralelos en una sola GPU de 24 GB con Q4_0.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan, Unsloth, LocalAI, Open WebUI, vLLM (con kernels nativos, ya que la poda es no estructurada y mantiene las dimensiones densas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | GSM8K | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.8-19B-Pruned-GGUF (este) | ~19B activos (27,3B denso) | 262.144 | 81,5 | 86,9 | Apache 2.0 | GGUF |
| Qwen3.8-9B-Instruct-Turbo | 9,04B (denso, podado de 27B) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Qwen3.8-27B (original) | 27B (denso) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento para los modelos comparables. El Qwen3.8-9B-Instruct-Turbo es un modelo denso creado podando 42 capas residuales del Qwen3.8-27B, mientras que este modelo aplica poda estructurada SparseGPT al 30% sobre el mismo origen. La ventaja principal de este GGUF es su menor huella de memoria y mayor velocidad frente al denso, a costa de una posible perdida de precision en tareas muy sensibles a pesos individuales.

## Limitaciones y advertencias

- La poda del 30% puede degradar el rendimiento en tareas que dependen de pesos especificos, aunque SparseGPT compensa parcialmente esta perdida. No se han publicado evaluaciones exhaustivas mas alla de MMLU y GSM8K.
- Los benchmarks declarados (MMLU 81,5, GSM8K 86,9) no estan verificados por terceros; podrian diferir en entornos reales.
- El modelo solo soporta ingles y chino; no hay garantia de buen rendimiento en otros idiomas.
- La cuantizacion Q4_0 es la mas agresiva y puede mostrar mayor perplexity que Q6_K o Q8_0; para tareas de alta precision se recomienda usar Q8_0 si el hardware lo permite.
- El conteo de parametros es confuso: el badge de HuggingFace indica 28B (27,32B) pero el modelo efectivo es ~19B. Esto puede causar errores al dimensionar recursos.
- La poda no estructurada mantiene las dimensiones densas, por lo que no se obtienen aceleraciones en kernels que no aprovechen la esparsidad; la ventaja principal es la reduccion de peso y memoria.
- No se ha documentado el comportamiento del modelo ante prompts adversariales o su sesgo en tareas de generacion de contenido sensible.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo deriva de la serie Qwen3.8; se debe verificar que no existan restricciones adicionales en los terminos del modelo original.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/ewinregirgojr/Qwen3.8-19B-Pruned-GGUF
- Modelo base (safetensors): https://huggingface.co/ewinregirgojr/Qwen3.8-19B-Pruned
- Repositorio oficial de la serie Qwen3.8 en GitHub: https://github.com/QwenLM/Qwen3.8
- Informacion sobre la serie Qwen3.8 en OpenLM.ai: https://openlm.ai/qwen3.8/
- Modelo similar Qwen3.8-9B-Instruct-Turbo: https://huggingface.co/ewinregirgojr/Qwen3.8-9B-Instruct-Turbo
- Modelo similar Qwen3.8-14B-Instruct-Turbo-GGUF: https://huggingface.co/ewinregirgojr/Qwen3.8-14B-Instruct-Turbo-GGUF
