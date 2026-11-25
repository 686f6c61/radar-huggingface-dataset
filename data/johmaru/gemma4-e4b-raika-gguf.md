# johmaru/gemma4-e4b-raika-gguf

## Resumen

`johmaru/gemma4-e4b-raika-gguf` es una cuantización en formato GGUF del adaptador LoRA `johmaru/gemma4-e4b-raika-lora`, que a su vez se construye fusionando dicho LoRA (en precisión de 16 bits) sobre el modelo base `unsloth/gemma-4-E4B-it`. El resultado es un modelo conversacional de aproximadamente 7.520 millones de parámetros, orientado específicamente a *roleplay* y diálogo de personaje en japonés, empaquetado para inferencia local con `llama.cpp`.

El autor, `johmaru`, publica esta variante cuantizada el 25 de noviembre de 2026 con un único archivo de pesos en `Q8_0` (~8,01 GB) más un proyector multimodal de visión en `BF16` (~992 MB), lo que permite ejecutar el modelo tanto en modo texto como con entrada de imagen a través del parámetro `--mmproj` de `llama.cpp`. La familia Gemma 4 de Google, sobre la que se sustenta, aporta la arquitectura y el entrenamiento base; el LoRA añade el ajuste de personaje.

Su relevancia es acotada pero clara: cubre el nicho de *roleplay* japonés local, con instrucciones de inferencia muy específicas (desactivar el modo de razonamiento, usar una plantilla de sistema concreta y una temperatura de 0,6–0,7) que condicionan por completo la calidad de la salida. No es un modelo de propósito general, sino un adaptador de personaje cuantizado para despliegue en máquina única.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, multimodal con proyector de visión) |
| Parametros totales | 7.518.069.290 (~7,52 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8192 tokens (valor recomendado en el comando de `llama-server`) |
| Tipos de cuantizacion | Q8_0 (modelo principal); BF16 (proyector multimodal) |
| Idiomas soportados | japonés (ja) |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (`gemma4-e4b-raika-Q8_0.gguf`, `gemma4-e4b-raika-mmproj-BF16.gguf`) |
| Modelo base | `unsloth/gemma-4-E4B-it` + LoRA `johmaru/gemma4-e4b-raika-lora` |
| Tamano del repositorio | ~9,0 GB |
| Libreria | gguf (llama.cpp) |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/gemma-4-E4B-it`, la variante instructiva de la familia Gemma 4 de Google, una arquitectura transformer con capacidades multimodales (texto e imagen) mediante un proyector de visión separado. Sobre esa base se aplica un LoRA de 16 bits (`johmaru/gemma4-e4b-raika-lora`) que se fusiona en los pesos del modelo base; el resultado se cuantiza a `Q8_0` para su distribución en GGUF. El proyector multimodal se mantiene en `BF16` para preservar la calidad de la codificación visual.

La model card no detalla el volumen de tokens de entrenamiento del LoRA, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; esa información corresponde al repositorio del LoRA original, referenciado pero no reproducido. Sí se especifica un detalle técnico crítico: el adaptador de personaje se entrenó con los delimitadores `<|turn>` propios de Gemma 4 y con el modo de razonamiento desactivado, de modo que activar *thinking* anula la persona del personaje. La plantilla de chat se gestiona con `--jinja` en `llama.cpp`.

## Capacidades

- Generación de texto conversacional multi-turno en japonés, con foco en diálogo de personaje (*roleplay*).
- Mantenimiento de persona consistente mediante un *system prompt* específico documentado en el repositorio del LoRA.
- Entrada multimodal de imagen a través del proyector `mmproj` (BF16), invocada con `--mmproj` en `llama.cpp`.
- Modo de razonamiento (*thinking*) disponible en el modelo base, pero desaconsejado y desactivado por defecto para este adaptador.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-step: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al japonés según la metadata del modelo.

## Casos de uso

- Roleplay y personajes conversacionales en local: el adaptador está entrenado específicamente para mantener una persona concreta; con el *system prompt* del LoRA y `temperature` 0,65 se obtiene un diálogo de personaje estable sin depender de servicios en la nube.
- Prototipado de chatbots de personaje en japonés: al ejecutarse con `llama-server` y exponer una API compatible con endpoints, puede integrarse en aplicaciones web o de mensajería para pruebas de experiencia conversacional.
- Asistente conversacional con entrada de imagen: pasando el `mmproj` en BF16, el modelo puede comentar imágenes dentro de una conversación de personaje (por ejemplo, un personaje que describe o reacciona a fotos).
- Evaluación de adaptadores LoRA fusionados: sirve como referencia práctica para comparar la calidad de un LoRA de personaje antes y después de la cuantización a Q8_0 en un mismo *prompt*.
- Despliegue en estación de trabajo sin GPU de datacenter: con ~8 GB de pesos en Q8_0 y `-ngl 99`, cabe en GPUs de consumo de gama alta para inferencia interactiva de un solo usuario.
- Generación de diálogo japonés para doblaje o narrativa interactiva: el control fino de temperatura y *repeat penalty* permite producir variantes de una misma escena manteniendo el registro del personaje.
- Investigación sobre fidelidad de cuantización: comparar la salida del GGUF Q8_0 con el LoRA en 16 bits para medir la degradación introducida por la cuantización en tareas de personaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~8,0 GB solo para los pesos del modelo en Q8_0; añadir ~1,0 GB si se carga el proyector multimodal BF16. Con overhead de contexto (8192 tokens) y caché KV, conviene reservar 10–12 GB.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080/4070 Ti Super (16 GB), A100 o H100 para despliegues multi-usuario.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más de VRAM para uso texto; 16 GB o más si se activa la visión y se amplía el contexto.
- Opciones de despliegue: `llama.cpp` (`llama-server` con `--jinja`, `--reasoning off`, `--temp 0.65`, `--repeat-penalty 1.05`), y por extensión cualquier frontend compatible con GGUF (Ollama, LM Studio) que respete la plantilla Jinja de Gemma 4.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `johmaru/gemma4-e4b-raika-gguf` | ~7,52 B | 8192 (recomendado) | ja | Gemma | GGUF Q8_0 + mmproj BF16 | Adaptador de personaje sobre Gemma 4 E4B-it |
| `johmaru/gemma4-e4b-raika-lora` | ~7,52 B (base) | no disponible | ja | Gemma | LoRA 16 bits | Versión sin cuantizar del mismo adaptador |
| `unsloth/gemma-4-E4B-it` | ~7,52 B (base) | no disponible | multilingüe (familia Gemma) | Gemma | safetensors | Modelo base instructivo sin ajuste de personaje |
| Alternativas de roleplay japonés de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- Modelo especializado en *roleplay* en japonés: su uso como asistente general, para código o para matemáticas no está validado y probablemente rinda por debajo del modelo base sin adaptar.
- El modo de razonamiento debe permanecer desactivado (`--reasoning off` / `enable_thinking=False`); si se activa, anula la persona del personaje y rompe el comportamiento esperado.
- Requiere el *system prompt* de personaje documentado en el repositorio del LoRA; sin él, la calidad del diálogo se degrada.
- Riesgo de alucinación inherente a los modelos de ~7,5 B, agravado por el ajuste fino de personaje, que prioriza la coherencia narrativa sobre la veracidad factual.
- Contexto efectivo recomendado de 8192 tokens; no se documenta soporte para ventanas mayores en esta cuantización.
- Idiomas: únicamente japonés según la metadata; el rendimiento en castellano no está garantizado.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use de Google, que imponen restricciones y obligaciones de atribución; revisar antes de desplegar en producción.
- Repositorio con 0 descargas y 0 *likes* en el momento de la consulta: sin validación comunitaria ni evidencia de uso en producción.
- Cuantización Q8_0: la degradación frente al LoRA en 16 bits no está medida ni documentada por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/johmaru/gemma4-e4b-raika-gguf
- LoRA base: https://huggingface.co/johmaru/gemma4-e4b-raika-lora
- Modelo base instructivo: https://huggingface.co/unsloth/gemma-4-E4B-it
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
