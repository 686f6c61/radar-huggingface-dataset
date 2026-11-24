# BelugaDataSetCoder/ClangCoder-0.1

## Resumen

ClangCoder-0.1 es un modelo de lenguaje causal ultraligero desarrollado por BelugaDataSetCoder, entrenado desde cero para autocompletado de comandos de terminal y generacion de instrucciones de CLI en los shells `bash`, `zsh` y `fish`. Con tan solo 1.465.760 parametros reales (el autor declara ~2.05M), se posiciona como un tiny-LM especializado en sintaxis de shell Linux/Unix, no como un modelo de proposito general.

La arquitectura es un transformer decoder-only de tipo Llama (`LlamaForCausalLM`) con `hidden_size=160`, 4 capas, 4 cabezas de atencion y 2 cabezas KV (GQA), con una ventana de contexto muy reducida de 256 tokens. Emplea un tokenizador BPE personalizado de 2.048 tokens entrenado especificamente sobre sintaxis de shell, lo que reduce drasticamente el vocabulario efectivo para este dominio.

Su relevancia actual radica en el nicho de modelos de autocompletado embebidos: por su tamano puede ejecutarse en cualquier dispositivo, incluso en entornos con recursos minimos, y su licencia Apache 2.0 permite integracion comercial sin restricciones. No obstante, el modelo tiene cero descargas y un unico "like" en el momento de la ficha, y no se han publicado benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only, GQA) |
| Parametros totales | 1.465.760 (declarado ~2.05M por el autor) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | FP16 (GGUF incluido); cuantizaciones adicionales no disponibles |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch/Hugging Face) y GGUF (FP16, para llama.cpp/Ollama) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Llama con 4 capas, `hidden_size=160`, 4 cabezas de atencion y 2 cabezas KV (atención de grupo de consultas, GQA), lo que reduce el coste de memoria de la cache KV. La ventana de contexto es de solo 256 tokens, coherente con su uso previsto: completar comandos cortos de shell. El tokenizador es un BPE propio de 2.048 tokens, entrenado especificamente sobre sintaxis de shell de Linux/Unix, lo que maximiza la eficiencia de codificacion en este dominio restringido.

El entrenamiento se realizo desde cero (from scratch) sobre el dataset `BelugaDataSetCoder/ClangCodeDataset`. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Autocompletado de comandos de terminal para `bash`, `zsh` y `fish`.
- Generacion de instrucciones de CLI a partir de una descripcion en lenguaje natural (por ejemplo, "How do I set a global exported environment variable in Fish?").
- Formato de prompt tipo ChatML con etiquetas de shell (`[bash]`, `[zsh]`, `[fish]`) y tokens especiales `<|user|>`, `<|assistant|>`, `<|end|>`.
- Generacion de texto de dominio muy restringido (sintaxis de shell).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Autocompletado en tiempo real dentro de emuladores de terminal: el modelo completa comandos mientras el usuario escribe, con latencia minima gracias a sus ~1.5M parametros y contexto de 256 tokens.
- Asistente de sugerencias en editores de codigo y entornos IDE que integren terminal: puede ofrecer completados de comandos shell contextuales sin salir del editor.
- Generacion de comandos a partir de lenguaje natural en herramientas de CLI: el usuario describe lo que quiere hacer y el modelo produce el comando correspondiente en el shell seleccionado.
- Integracion en scripts de onboarding o documentacion interactiva: sugerir comandos correctos para tareas comunes de administracion de sistemas.
- Despliegue en dispositivos con recursos minimos (Raspberry Pi, contenedores ligeros, entornos embebidos) donde modelos mayores no caben; el GGUF FP16 permite ejecucion con llama.cpp u Ollama.
- Filtrado o validacion de comandos en pipelines de automatizacion: usar el modelo como generador de candidatos que luego se validan con reglas o con un shell en modo dry-run.
- Prototipado rapido de interfaces de autocompletado para shells personalizados o entornos de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en FP16 (1.465.760 parametros x 2 bytes ≈ 2.9 MB de pesos, mas cache KV y overhead del runtime). Cabe holgadamente en cualquier GPU consumer, CPU o incluso microcontroladores de gama alta.
- GPU recomendadas: cualquiera; no requiere GPU dedicada. Funciona en CPU sin problema.
- Cabe en GPU consumer: si, en todas (RTX 4090, RTX 3060, GTX 1650, iGPU, etc.).
- Opciones de despliegue: llama.cpp, Ollama (incluye `Modelfile` en el repositorio), transformers (PyTorch/safetensors), text-generation-inference (tag `text-generation-inference`), endpoints compatibles.
- Latencia y throughput: no disponibles. Por el tamano, se espera latencia de milisegundos y throughput muy alto, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ClangCoder-0.1 | 1.465.760 (~2.05M declarados) | 256 | Apache 2.0 | Hugging Face, GGUF |
| Modelos tiny-LM de autocompletado de shell | no disponible | no disponible | no disponible | no disponible |
| Modelos de codigo de proposito general (p. ej. CodeLlama, StarCoder) | cientos de millones a miles de millones | miles de tokens | licencias variadas | amplia |

No se dispone de informacion sobre modelos comparables especificos de autocompletado de shell en la informacion proporcionada; la comparativa con modelos de codigo generales solo sirve como referencia de categoria, no de rendimiento.

## Limitaciones y advertencias

- Modelo de dominio muy restringido: solo sintaxis de shell Linux/Unix; no es util para texto general, codigo en otros lenguajes ni conversacion.
- Contexto de solo 256 tokens: no puede manejar conversaciones largas ni comandos complejos con mucho contexto previo.
- Solo ingles: el prompt y las descripciones deben estar en ingles.
- Riesgo de alucinacion: puede generar comandos sintacticamente plausibles pero incorrectos o peligrosos; no debe ejecutarse sin validacion humana.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su calidad; cero descargas y un unico like en el momento de la ficha.
- Tokenizador de 2.048 tokens: vocabulario muy limitado, lo que puede degradar el rendimiento fuera de la sintaxis de shell prevista.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte.
- No se documentan sesgos especificos, pero al entrenarse sobre un dataset de shell podria reflejar convenciones y practicas de un subconjunto concreto de entornos Linux/Unix.

## Enlaces

- Hugging Face: https://huggingface.co/BelugaDataSetCoder/ClangCoder-0.1
- Dataset: https://huggingface.co/datasets/BelugaDataSetCoder/ClangCodeDataset
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
