# mete72722/anadolu-40m

## Resumen

Anadolu-40M es un modelo de lenguaje causal en turco de 40.178.176 parámetros entrenado desde cero por el desarrollador independiente mete72722. Se trata de un transformer decoder-only con arquitectura compatible con GPT-2 (10 capas, 8 cabezas de atención, `d_model` de 512, MLP interno de 2048), con una longitud de contexto de 512 tokens y un vocabulario byte-level BPE de 16.389 entradas sin token `UNK`. Su rasgo más distintivo es que todo el ciclo —preentrenamiento, ajuste supervisado e inferencia— se ha ejecutado en una única CPU Intel i7-7700, y el repositorio incluye un motor de inferencia basado solo en NumPy, sin dependencia de PyTorch ni CUDA.

El modelo se ha entrenado sobre Wikipedia en turco (`wikimedia/wikipedia`, split `20231101.tr`, licencia CC BY-SA) y el Bilkent Turkish Writings Dataset v2, con un corpus de aproximadamente 870,8 millones de caracteres (~227,6 millones de tokens BPE disponibles) y 32.768.000 tokens vistos según los metadatos de exportación. Posteriormente recibió un ajuste supervisado (SFT) para formato conversacional durante unas 400 iteraciones, con un formato de chat basado en los tokens especiales `<|bos|>`, `<|user|>`, `<|assistant|>` y `<|end|>`.

Es relevante ahora como ejemplo de modelo pequeño entrenado y servido íntegramente en CPU, útil para experimentación de bajo coste, docencia sobre entrenamiento desde cero y despliegues en hardware sin GPU. El autor advierte explícitamente de que no es un sustituto de modelos grandes y de que la decodificación debe ser voraz: el muestreo y el bloqueo de n-gramas repetidos degradan gravemente la coherencia en un modelo de este tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only compatible con GPT-2 |
| Parametros totales | 40.178.176 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible en el repositorio (pesos en float32; el autor indica que la conversion a GGUF/llama.cpp es posible sin codigo personalizado) |
| Idiomas soportados | Turco (tr) |
| Licencia | other (sin detalle de terminos en la informacion disponible) |
| Formato de pesos | safetensors (export `numpy-fp32`) |

Datos adicionales de arquitectura: 10 capas, 8 cabezas de atencion, `d_model` = 512, MLP interno de 2048 con activacion GELU (`gelu_new`, aproximacion tanh), normalizacion Pre-LayerNorm con `eps = 1e-5`, embeddings de entrada y salida atados, codificacion posicional aprendida y precision float32.

Tokens especiales: `<|pad|>` (0), `<|user|>` (1), `<|assistant|>` (2), `<|end|>` (3), `<|bos|>` (4).

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estandar con pesos compatibles con GPT-2, lo que permite cargarlo con `AutoModelForCausalLM` o `GPT2LMHeadModel` de la libreria `transformers` sin codigo personalizado. Usa vocabulario byte-level BPE de estilo GPT-2 con 16.389 entradas, lo que garantiza que cualquier byte sea representable y elimina el token `UNK`. La normalizacion es Pre-LayerNorm y los embeddings de entrada y salida estan atados.

El entrenamiento se realizo en dos etapas sobre CPU: un preentrenamiento desde cero y un ajuste supervisado (SFT) para chat de aproximadamente 400 pasos, partiendo del checkpoint `checkpoints/anadolu40x512/sft_friendly.pt`. Los datos combinan Wikipedia en turco (`20231101.tr`) y el Bilkent Turkish Writings Dataset v2, con un corpus de ~870,8 millones de caracteres (~227,6 millones de tokens BPE) y 32.768.000 tokens vistos registrados en los metadatos. No se menciona uso de RLHF ni DPO. La exportacion final (`numpy-fp32`, 2026-11-16) alimenta un motor de inferencia propio que solo requiere `numpy`, `safetensors` y `threadpoolctl`.

## Capacidades

- Generacion de texto causal en turco: respuestas conversacionales de un solo turno y continuacion de texto.
- Formato de chat integrado mediante plantilla de tokens especiales (`<|bos|><|user|>…<|end|><|assistant|>…<|end|>`), invocable con `apply_chat_template`.
- Inferencia sin PyTorch ni CUDA mediante el motor NumPy incluido en `anadolu/`, que es el que sirve la API publica.
- Compatibilidad con el ecosistema `transformers`: `pipeline("text-generation")`, `GPT2LMHeadModel`, ajuste fino con LoRA y conversion a GGUF/llama.cpp.
- Generacion con decodificacion voraz (`do_sample=False`) y `repetition_penalty` configurable; el `generation_config.json` del repositorio fija `do_sample: false`, `no_repeat_ngram_size: 0` y `repetition_penalty: 1.08`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al turco; no se documenta soporte de otros idiomas.
- Vision, audio o modo thinking: no disponible.

## Casos de uso

- Experimentacion docente sobre entrenamiento desde cero: el modelo permite reproducir el ciclo completo de preentrenamiento y SFT en una CPU convencional, con hiperparametros y checkpoints documentados, lo que lo hace adecuado para cursos y talleres donde no hay acceso a GPU.
- Despliegue en hardware sin GPU: gracias al motor NumPy (`numpy`, `safetensors`, `threadpoolctl`), puede servirse en un servidor modesto o en un equipo de escritorio con un i7-7700, sin instalar PyTorch ni CUDA, para demos internas o entornos con restricciones de dependencias.
- Prototipado de asistentes conversacionales en turco: con el formato de chat integrado y respuestas voraces, sirve para validar pipelines de dialogo de un solo turno antes de migrar a un modelo mayor, manteniendo el mismo esquema de tokens especiales.
- Base para ajuste fino con LoRA: al ser un GPT-2 plano, se puede adaptar a dominios concretos (atencion al cliente, FAQ, generacion de resenas) con recursos minimos, ya que el modelo completo ocupa unos 0,2 GB en el repositorio.
- Generacion de texto turco en entornos embebidos o de bajo consumo: su tamano de 40M parametros y contexto de 512 tokens lo hacen viable en dispositivos con poca memoria, siempre que se acepte la calidad limitada de las salidas.
- Integracion en pipelines de evaluacion y comparacion de modelos pequenos: sirve como linea base reproducible (perplejidad 26,107 sobre texto turco retenido) para medir el efecto de cambios en tokenizacion, datos o estrategias de decodificacion.
- Bot de Discord con memoria por usuario: el autor mantiene `Anadolu AI#4542` como ejemplo de integracion conversacional sobre la API compatible con OpenAI.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perdida de validacion (modelado de lenguaje) | 3,2622 |
| Perplejidad | 26,107 |
| Perdida de validacion en preentrenamiento | 3,0122 |
| Perdida de validacion tras SFT | 0,1660 |

Configuracion de evaluacion: 256 secuencias, 130.816 tokens, bloque de 512, semilla 1234. La perplejidad se mide sobre texto turco retenido de la misma distribucion que el entrenamiento; el autor indica explicitamente que no es una comparacion con otros modelos turcos y que no se ha ejecutado ningun benchmark equivalente (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- VRAM estimada: no aplica en el caso base; el modelo se sirve en CPU. En float32, los 40,18M parametros ocupan aproximadamente 160 MB de pesos, mas overhead de activaciones para contexto de 512 tokens.
- GPU recomendadas: no se especifican; cualquier GPU consumer moderna puede alojar el modelo con holgura, pero el autor no documenta rendimiento en GPU.
- Cabida en GPU consumer: si, en cualquier GPU con al menos ~1 GB de memoria libre en float32; tambien es viable en CPU pura.
- Opciones de despliegue: motor NumPy propio (`anadolu.runtime.Engine` con `threads` configurable), `transformers` (`AutoModelForCausalLM`, `pipeline`), conversion a GGUF/llama.cpp segun el autor, y API publica compatible con OpenAI en `https://anadoluai.duckdns.org:8443`.
- Latencia y throughput: no disponibles. El hardware de referencia del autor es una CPU Intel i7-7700; no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa con otros modelos. Como referencia cualitativa de categoria (modelos causales pequenos para turco), podrian considerarse alternativas de la familia GPT-2 adaptadas a turco o modelos multilingues pequenos, pero no se han verificado parametros, contexto ni resultados de dichos modelos en esta busqueda.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Anadolu-40M | 40.178.176 | 512 | other | Hugging Face, motor NumPy, API publica |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El propio autor advierte de que es un modelo pequeno y no un sustituto de GPT-4; la calidad de las respuestas es limitada incluso en turco.
- El muestreo degrada la coherencia: con `temperature=0.7` y `top_p=0.92` la salida aparece corrupta con frecuencia; se recomienda decodificacion voraz (`do_sample=False`).
- `no_repeat_ngram_size=3` perjudica gravemente la salida: empuja al modelo hacia subpalabras raras y produce palabras sin sentido. El `generation_config.json` lo fija a 0.
- La API publica usa decodificacion muestreada con `no_repeat_ngram_size=3`, pero envuelve el modelo en un router con capa de respuestas predefinidas y fallback ante salidas corruptas, por lo que sus respuestas no son comparables con una llamada directa a `model.generate()`.
- Contexto muy corto (512 tokens), lo que limita conversaciones multi-turno largas y documentos extensos.
- Solo turco; no se documenta soporte de otros idiomas.
- Riesgo de alucinacion y de incoherencia factual inherente a un modelo de 40M parametros entrenado con 32,77M tokens vistos.
- La licencia es "other" sin terminos detallados en la informacion disponible; es necesario consultar el repositorio antes de cualquier uso comercial.
- Los datos de entrenamiento incluyen Wikipedia (CC BY-SA), lo que puede implicar obligaciones de atribucion o comparticion derivadas de esa fuente.
- No se han publicado benchmarks estandar (MMLU, HumanEval, GSM8K) ni comparaciones equivalentes con otros modelos turcos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mete72722/anadolu-40m
- Demo y API compatible con OpenAI: https://anadoluai.duckdns.org:8443
- Dataset de Wikipedia en turco: https://huggingface.co/datasets/wikimedia/wikipedia
- Bilkent Turkish Writings Dataset v2: https://zenodo.org/records/15498155
