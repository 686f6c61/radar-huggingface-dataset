# nachiketj14/Girlfriend

## Resumen

El modelo `nachiketj14/Girlfriend` es un finetune de tipo LoRA sobre `unsloth/Ministral-3-3B-Instruct-2512`, un modelo de lenguaje de 3.000 millones de parámetros desarrollado por Mistral AI y republicado por Unsloth. Fue creado por Nachiket Jadhav con el objetivo de obtener un asistente conversacional de tipo "companion" o compañero virtual para uso personal en dispositivos locales. El resultado es un modelo de chat que responde con un estilo de persona definido por los datos de entrenamiento, sin necesidad de un sistema prompt fijo.

La adaptación se realizó con Unsloth en una GPU T4 de Kaggle, usando LoRA de rango 32 sobre todas las proyecciones del transformador. El repositorio incluye tres formatos: un adaptador LoRA en safetensors, un modelo fusionado en GGUF FP16 y una versión cuantizada Q4_K_M para inferencia ligera en CPU o GPU doméstica. La licencia es Apache 2.0, por lo que puede usarse libremente en proyectos personales y comerciales. Es un modelo pequeño, orientado a conversación y roleplay, con un dominio de entrenamiento estrecho y sin capacidades generalistas destacadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Ministral-3 3B Instruct) |
| Parametros totales | 3.429.006.336 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento uso una longitud maxima de secuencia de 4096 tokens) |
| Tipos de cuantizacion | FP16 (GGUF), Q4_K_M (GGUF) |
| Idiomas soportados | ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) y GGUF (FP16 y Q4_K_M) |

## Arquitectura y entrenamiento

El modelo base es `unsloth/Ministral-3-3B-Instruct-2512`, un transformer decoder-only de 3.000 millones de parametros con arquitectura de Mistral. El finetune se realizo mediante LoRA de rango 32, alpha 64 y dropout 0.05, aplicado a las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. Se uso el `UnslothTrainer` con precision FP16, ya que la GPU T4 no soporta BF16 nativo.

El dataset de entrenamiento es propio del autor y consta de pares pregunta-respuesta en formato de chat de dos turnos (`user` / `assistant`). El modelo se entreno sin system prompt, de modo que la persona emerge exclusivamente de los ejemplos. Se aplico enmascaramiento de loss solo sobre los tokens de las respuestas del asistente, mediante un metodo de comparacion de prefijos tokenizados. El entrenamiento duro 60 pasos, con batch efectivo de 32, learning rate 2e-5, scheduler cosine con 3% de warmup, optimizador AdamW 8-bit y max grad norm 0.3.

## Capacidades

- Generacion de texto conversacional en ingles, con estilo de persona definido por los datos de entrenamiento.
- Roleplay textual y chat de tipo "companion", especialmente en escenarios de tono afectivo o casual.
- Funcionamiento sin system prompt; es posible anadir un prompt opcional para modular el tono en inferencia.
- Soporte de cargarse como adaptador LoRA sobre el modelo base, o como modelo fusionado GGUF.
- Capacidades multilingues: no disponibles; el entrenamiento y la documentacion solo cubren ingles.
- Tool calling, vision, audio y razonamiento avanzado: no evaluados ni documentados; el modelo es de dominio estrecho y se espera que degrade en tareas fuera de su distribucion.

## Casos de uso

- Chat personal en local: se puede cargar `Girlfriend_3B_Q4_K_M.gguf` con `llama.cpp` o LM Studio en un portatil con CPU o GPU modesta, obteniendo un asistente conversacional sin conexion a internet.
- Roleplay textual: el modelo responde con una persona consistente en conversaciones largas, permitiendo juegos de rol de caracter social o afectivo en aplicaciones de escritorio o moviles.
- Prototipado de finetunes LoRA: el adaptador incluido sirve como ejemplo practico de como aplicar LoRA sobre Ministral-3 con Unsloth y luego fusionarlo para exportar a GGUF.
- Estudio de datos de entrenamiento pequenos: al ser un finetune de solo 60 pasos con un dataset propio reducido, resulta util para analizar el impacto de un dominio estrecho en el comportamiento de un modelo de 3B.
- Pruebas de cuantizacion en hardware limitado: comparar las versiones FP16 y Q4_K_M permite evaluar la perdida de calidad frente al ahorro de memoria y el aumento de velocidad en equipos de bajo consumo.
- Demostraciones de "companion" en dispositivos embebidos o mini-PC: con Ollama o KoboldCPP, el modelo puede ejecutarse en placas como Raspberry Pi con RAM suficiente o en mini-PCs con GPU integrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: la version Q4_K_M de un modelo de 3.4B ocupa aproximadamente entre 2 y 3 GB en memoria, por lo que cabe en GPUs de consumo con 4 GB o mas. La version FP16 requiere en torno a 6.8 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 8 GB o superiores; tambien se puede ejecutar en CPU con llama.cpp si se acepta una velocidad menor.
- Compatibilidad con consumer GPU: si, tanto en formato GGUF Q4_K_M como FP16. No requiere GPU de datacenter.
- Opciones de despliegue: `llama.cpp`, LM Studio, Ollama, KoboldCPP para los GGUF; `peft` o Unsloth para el adaptador LoRA.
- Latencia y throughput: no disponibles en la documentacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito principal |
|---|---|---|---|---|
| `nachiketj14/Girlfriend` | 3.429.006.336 | no disponible | Apache 2.0 | Conversacion y roleplay de tipo "companion" |
| `unsloth/Ministral-3-3B-Instruct-2512` (base) | 3.429.006.336 | no disponible | Apache 2.0 | Instruccion general y chat |
| Otros modelos 3B del ecosistema Mistral/Unsloth | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base, ya que no se dispone de datos de rendimiento ni de contexto confirmado para alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo de dominio estrecho: no es un modelo generalista y tendra un rendimiento inferior al modelo base en tareas de codigo, matematicas, QA factual o razonamiento de contexto largo.
- Riesgo de alucinacion y repeticion: como todo LLM pequeno finetuneado con un dataset reducido, puede producir respuestas repetitivas, inconsistentes o inventadas.
- Sesgos y seguridad: las respuestas no fueron evaluadas por seguridad, sesgo o veracidad; no debe usarse como fuente de informacion factual ni para asesoramiento.
- Idioma limitado: solo se ha entrenado y documentado en ingles.
- Uso recomendado: personal y en local; no esta pensado para despliegue en produccion con usuarios reales.
- La persona del modelo puede desviarse del estilo esperado en conversaciones fuera de la distribucion de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nachiketj14/Girlfriend
- Modelo base: https://huggingface.co/unsloth/Ministral-3-3B-Instruct-2512
- Unsloth: https://github.com/unslothai/unsloth
- llama.cpp: https://github.com/ggerganov/llama.cpp
