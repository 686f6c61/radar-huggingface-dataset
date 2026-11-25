# Jommarn/Qwen3.5-0.8B-NestedMemory-L18-v2

## Resumen

Qwen3.5-0.8B-NestedMemory-L18-v2 es un checkpoint de investigacion publicado por el usuario Jommarn sobre el modelo base Qwen/Qwen3.5-0.8B. No se trata de un modelo afinado para produccion, sino de un experimento de memoria a largo plazo en el que se inyecta una capa propietaria, denominada NestedMemoryLayer, despues de la capa 18 del decodificador. Esa capa escribe en sus propios pesos durante la inferencia y los lee de vuelta mediante compuertas neuronales aprendidas, sin usar recuperacion externa ni RAG. El objetivo declarado es explorar mecanismos de memoria de tipo Titans/Atlas con consolidacion episodica y olvido tipo Ebbinghaus.

El modelo se distribuye como seis checkpoints experimentales (variantes base, atlas y wide, cada una con y sin LoRA fusionada) en formato `state_dict` de PyTorch, con un tamano de repositorio de 9,2 GB. La model card es explicita: el estado es experimental y la recuperacion de memoria no funciona todavia; el recall de un nombre o profesion recien contados es del 0 % en todas las variantes. Se publica, por tanto, por reproducibilidad, no como artefacto listo para uso real.

La relevancia actual es metodologica: documenta con detalle que funciona (la compuerta de escritura se cierra ante preguntas y la de lectura permanece cerrada ante conocimiento general, preservando el conocimiento del Qwen base) y que no (la recuperacion de hechos almacenados), ademas de proponer una causa probable y un plan de correccion para la siguiente version.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3.5-0.8B) con NestedMemoryLayer inyectada tras la capa 18 |
| Parametros totales | no disponible (el modelo base es de 0,8B; el repositorio ocupa 9,2 GB) |
| Parametros activos | no disponible (la memoria de largo plazo usa slots enrutados tipo MoE, sin cifra publicada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los checkpoints se distribuyen en `state_dict` de PyTorch, con `bfloat16` en el ejemplo de carga) |
| Idiomas soportados | tailandes (th) |
| Licencia | Apache 2.0 |
| Formato de pesos | `state_dict` de PyTorch (`.pt`); no se ofrecen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B y le anade una NestedMemoryLayer tras la capa 18 del decodificador. La capa integra cuatro componentes: una memoria asociativa lineal rapida de estilo Titans (memoria `M` con regla delta, momento y compuerta de olvido, y compuertas `gate_write`/`gate_read` por token); un buffer episodico con los 64 tokens de mayor valor de compuerta de escritura; una memoria larga que, mediante `consolidate()` al final de la sesion, traslada las senales del buffer a slots enrutados (MoE con lectura softmax) controlados por `gate_consol`; y un mecanismo de olvido `forget(days)` con decaimiento estilo Ebbinghaus entre sesiones. Todo el acceso a memoria es neuronal, sin codigo de recuperacion ni RAG.

Se publican seis variantes: `base` (d_mem 256, 4 pasos internos), `atlas` (caracteristicas polinomicas de 24 dimensiones, ventana Omega de 16 y optimizador Muon) y `wide` (d_mem 512), cada una con y sin una segunda fase LoRA fusionada. El entrenamiento se realizo sobre el dataset Jommarn/Thai-LifeSim-PersonalMemory con un protocolo de simulacion de vida. La model card no detalla el numero de tokens de entrenamiento ni la composicion completa del dataset. La innovacion tecnica principal es el aprendizaje de compuertas que deciden cuando escribir y cuando leer en los propios pesos del modelo en tiempo de inferencia.

## Capacidades

- Generacion de texto y respuesta a preguntas generales heredadas del Qwen3.5-0.8B base, que la model card indica preservadas (la compuerta de lectura permanece cerrada ante conocimiento general).
- Escritura selectiva en memoria durante la inferencia: la compuerta `gate_write` se cierra ante preguntas (valor medio 0,094-0,115), lo que evita contaminar la memoria con turnos de pregunta.
- Lectura selectiva: `gate_read` se mantiene practicamente cerrada ante preguntas de conocimiento general (0,003-0,005).
- Consolidacion episodica a memoria de largo plazo mediante `consolidate()` al final de la sesion.
- Olvido controlado entre sesiones mediante `forget(days)` con decaimiento Ebbinghaus.
- Memoria asociativa rapida con regla delta, momento y compuerta de olvido.
- Capacidad multilingue limitada al tailandes segun los metadatos del repositorio.
- No dispone de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido documentados.

## Casos de uso

- Investigacion en memoria a largo plazo en LLM: sirve como banco de pruebas reproducible para estudiar compuertas de escritura/lectura neuronales y consolidacion episodica sobre un modelo de 0,8B, comparando las seis variantes publicadas.
- Reproduccion de experimentos: los checkpoints completos permiten replicar los resultados de la model card (protocolo de simulacion de vida con 19 vidas no vistas) y verificar las tasas de acierto reportadas.
- Estudio de mecanismos de olvido: el metodo `forget(days)` con decaimiento Ebbinghaus permite experimentar con politicas de caducidad de informacion entre sesiones en asistentes conversacionales.
- Analisis de preservacion de conocimiento base: la separacion entre compuerta de escritura y de lectura facilita medir cuanto conocimiento general del modelo original se conserva tras inyectar memoria.
- Desarrollo de curriculos sinteticos de recall: la causa probable identificada (claves y valores del mismo token) y el plan de correccion (claves desplazadas, convolucion causal corta, nombres aleatorios por paso) sirven de base para disenar nuevos entrenamientos.
- Prototipado academico en tailandes: unico idioma declarado, util para experimentos de memoria personal en ese idioma, siempre con la advertencia de que el recall de hechos es del 0 %.

## Benchmarks y rendimiento

Resultados publicados en la model card (validacion + test, 19 vidas no vistas, protocolo de simulacion de vida). La columna "never told" indica la tasa de respuesta a preguntas sobre informacion que nunca se proporciono al modelo, con memoria activa y con memoria borrada.

| Variante | Con memoria | Memoria borrada | Nombre | Profesion | "Never told" (mem / borrada) | `gate_write` en preguntas | `gate_read` en conocimiento general |
|---|---|---|---|---|---|---|---|
| base | 2,4 % | 5,9 % | 0 % | 0 % | 5,3 % / 52,6 % | 0,115 | 0,005 |
| base_lora | 6,5 % | 6,5 % | 0 % | 0 % | 42,1 % / 47,4 % | 0,101 | 0,004 |
| atlas | 10,0 % | 5,9 % | 0 % | 0 % | 84,2 % / 52,6 % | 0,094 | 0,003 |
| atlas_lora | 10,6 % | 4,1 % | 0 % | 0 % | 84,2 % / 31,6 % | 0,103 | 0,003 |
| wide | 10,6 % | 5,9 % | 0 % | 0 % | 84,2 % / 52,6 % | 0,103 | 0,003 |
| wide_lora | 11,2 % | 5,3 % | 0 % | 0 % | 79,0 % / 36,8 % | 0,112 | 0,003 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio ocupa 9,2 GB e incluye seis `state_dict` completos; cada checkpoint individual corresponde a un modelo de 0,8B mas la capa de memoria, por lo que en `bfloat16` el peso por variante se situa en el orden de pocos GB, pero no se publica una cifra verificada.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano del modelo base (0,8B), es plausible su ejecucion en GPUs de consumo, pero el autor no lo documenta.
- Compatibilidad con GPU de consumo: no confirmada oficialmente; requiere cargar `state_dict` de PyTorch con el codigo del directorio `code/`.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El unico metodo descrito es la carga manual con `QwenMemoryWrapper` y `torch.load`, en `bfloat16`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento estandar ni de modelos comparables documentados en la informacion proporcionada. A modo de referencia estructural:

| Modelo | Parametros | Contexto | Memoria en inferencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-NestedMemory-L18-v2 | 0,8B base + capa de memoria | no disponible | Si (compuertas neuronales, experimental) | Apache 2.0 | Hugging Face, checkpoints de investigacion |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | no disponible | No | no disponible en esta ficha | Hugging Face |
| Jommarn/Qwen3.5-0.8B-NestedMemory-L18 (version previa) | 0,8B base + capa de memoria | no disponible | Si (version anterior) | Apache 2.0 | Hugging Face |

No se identifican en la informacion disponible alternativas de la misma categoria (memoria en pesos a tiempo de inferencia) con las que establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Estado experimental explicito: la recuperacion de memoria no funciona; el recall de un nombre o profesion recien contados es del 0 % en todas las variantes.
- Las mejoras observadas en la columna "never told" no equivalen a recuperacion real de hechos almacenados; la variante `wide_lora` muestra ademas repeticion.
- Causa probable identificada por el autor: claves y valores de memoria provienen del mismo token, de modo que la consulta en "tu nombre es ___" carece de una clave que apunte al nombre.
- Riesgo de alucinacion elevado: la tasa de respuesta a informacion nunca proporcionada alcanza el 84,2 % en varias variantes con memoria activa, frente a valores mucho menores con memoria borrada.
- Cobertura linguistica limitada al tailandes segun los metadatos; no se declara soporte de castellano.
- No hay datos publicados sobre sesgos, contexto maximo, cuantizacion ni rendimiento en benchmarks estandar.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero su naturaleza de checkpoint de investigacion con recall nulo lo hace inadecuado para produccion.
- El despliegue requiere codigo propio (`code/`, `config.py`, `Model/qwen_memory.py`, `train_nested.py`) y carga con `strict=False`; no hay soporte de runtimes de inferencia estandar.
- Fecha de publicacion en el repositorio (2026-11-24) y ausencia de descargas o likes: sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jommarn/Qwen3.5-0.8B-NestedMemory-L18-v2
- Version previa: https://huggingface.co/Jommarn/Qwen3.5-0.8B-NestedMemory-L18
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de entrenamiento: https://huggingface.co/datasets/Jommarn/Thai-LifeSim-PersonalMemory
- Papers, blogs, repositorios y demos adicionales: no disponibles en la informacion proporcionada.
