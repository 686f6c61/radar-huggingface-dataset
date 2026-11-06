# enhasasuzu/Kimi-K2.5-staging

## Resumen

Kimi K2.5 es un modelo multimodal nativo de tipo agente desarrollado por Moonshot AI, construido mediante preentrenamiento continuo sobre aproximadamente 15 billones de tokens mixtos de vision y texto a partir de Kimi-K2-Base. Integra comprension de vision y lenguaje con capacidades agenticas avanzadas, modos instantaneo y de razonamiento (thinking), y paradigmas conversacionales y de agente. El repositorio analizado (`enhasasuzu/Kimi-K2.5-staging`) es una copia de staging publicada por un tercero, no el repositorio oficial de Moonshot AI.

Arquitectonicamente es un transformer de mezcla de expertos (MoE) con 1 billon de parametros totales y 32 mil millones activados por token, 384 expertos (8 seleccionados por token mas 1 compartido), 61 capas y atencion MLA con ventana de contexto de 256K tokens. Incorpora un codificador de vision MoonViT de 400M de parametros, lo que lo convierte en un modelo nativamente multimodal orientado a tareas de codigo con vision y orquestacion de agentes.

Su relevancia actual radica en que combina un contexto muy largo, multimodalidad nativa y un esquema de ejecucion tipo "agent swarm" (descomposicion de tareas complejas en sub-tareas paralelas ejecutadas por agentes especializados instanciados dinamicamente), posicionandose frente a modelos propietarios como GPT-5.2, Claude 4.5 Opus o Gemini 3 Pro en benchmarks de razonamiento y conocimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atencion MLA |
| Parametros totales | 1T (1 billon) |
| Parametros activos | 32B |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | no disponible (el repositorio usa `compressed-tensors`) |
| Idiomas soportados | no disponible |
| Licencia | Modified MIT (`modified-mit`, etiquetada como `other`) |
| Formato de pesos | no disponible (libreria `transformers`, requiere `custom_code`) |

## Arquitectura y entrenamiento

Kimi K2.5 es un transformer MoE con 61 capas (1 capa densa), dimension de atencion oculta de 7168, dimension oculta MoE de 2048 por experto, 64 cabezas de atencion, 384 expertos con 8 seleccionados por token y 1 experto compartido, funcion de activacion SwiGLU y vocabulario de 160K tokens. Emplea atencion MLA (Multi-head Latent Attention) para gestionar eficientemente el contexto de 256K tokens. La componente multimodal la aporta el codificador de vision MoonViT, con 400M de parametros, integrado de forma nativa.

El entrenamiento se realizo mediante preentrenamiento continuo sobre aproximadamente 15 billones de tokens mixtos de vision y texto a partir de Kimi-K2-Base. La model card menciona modos instantaneo y de razonamiento (thinking), asi como capacidades agenticas y de "agent swarm", pero no detalla en la informacion disponible la composicion exacta del dataset, el uso de RLHF/DPO ni otras innovaciones de entrenamiento mas alla de lo indicado. El repositorio incluye pesos comprimidos con `compressed-tensors` y requiere codigo personalizado (`custom_code`) para su carga en `transformers`.

## Capacidades

- Generacion de texto y razonamiento avanzado, con modo de razonamiento explicito (thinking) y modo instantaneo.
- Multimodalidad nativa: comprension de imagenes y razonamiento entre modalidades (vision-lenguaje).
- Generacion de codigo a partir de especificaciones visuales (disenos de UI, flujos de video).
- Orquestacion autonoma de herramientas para procesamiento de datos visuales.
- Soporte de tool calling / function calling en contextos agenticos.
- Ejecucion tipo "agent swarm": descomposicion de tareas complejas en sub-tareas paralelas ejecutadas por agentes especializados instanciados dinamicamente.
- Razonamiento matematico de alto nivel (resultados destacados en AIME 2025 y HMMT 2025).
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de codigo a partir de disenos de interfaz: el modelo puede recibir capturas o mockups de UI y producir codigo de frontend funcional, gracias a su codificador MoonViT y a su entrenamiento en tokens visuales y de codigo.
- Automatizacion de flujos de trabajo con agentes: uso del esquema "agent swarm" para descomponer tareas complejas (por ejemplo, procesamiento por lotes de documentos visuales) en sub-tareas paralelas ejecutadas por agentes especializados.
- Analisis de documentos y datos visuales a gran escala: con 256K tokens de contexto, puede procesar lotes extensos de imagenes y texto en una sola llamada para extraccion de informacion y resumen.
- Asistencia a investigacion y razonamiento cientifico: los modos thinking y el rendimiento en benchmarks como HLE (30,1 sin herramientas, 50,2 con herramientas) lo hacen adecuado para tareas de razonamiento complejo asistido por herramientas.
- Automatizacion de soporte tecnico multimodal: gestion de conversaciones multi-turno con imagenes (capturas de errores, diagramas) gracias a la ventana de 256K tokens.
- Pipelines de CI/CD con generacion y revision de codigo: integrable mediante tool calling para tareas de generacion, revision y correccion de codigo en entornos de desarrollo.
- Procesamiento de video y flujos visuales: generacion de codigo y orquestacion de herramientas a partir de flujos de video, segun las capacidades declaradas por el autor.

## Benchmarks y rendimiento

Datos extraidos de la model card (modo Thinking). La tabla original esta parcialmente truncada en la informacion disponible; se recogen los valores completos disponibles.

| Benchmark | Kimi K2.5 (Thinking) | GPT-5.2 (xhigh) | Claude 4.5 Opus (Extended Thinking) | Gemini 3 Pro (High Thinking) | DeepSeek V3.2 (Thinking) | Qwen3-VL-235B-A22B-Thinking |
|---|---|---|---|---|---|---|
| HLE-Full | 30,1 | 34,5 | 30,8 | 37,5 | 25,1 | - |
| HLE-Full (w/ tools) | 50,2 | 45,5 | 43,2 | 45,8 | 40,8 | - |
| AIME 2025 | 96,1 | 100 | 92,8 | 95,0 | 93,1 | - |
| HMMT 2025 (Feb) | 95,4 | no disponible (truncado) | no disponible (truncado) | no disponible (truncado) | no disponible (truncado) | no disponible (truncado) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con 1T de parametros totales y 32B activados, el modelo completo no cabe en GPUs de consumo; se requiere infraestructura multi-GPU de clase centro de datos.
- GPU recomendadas: no disponible de forma explicita; por el tamano del modelo se presupone despliegue en clusters con GPUs de clase A100/H100 o superior, aunque la informacion no lo confirma.
- Cabe en GPU de consumo: no disponible; por el numero de parametros totales (1T) es altamente improbable.
- Opciones de despliegue: la model card indica `transformers` con `custom_code` y pesos en `compressed-tensors`. No se detallan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K2.5 | 1T totales / 32B activos | 256K | Modified MIT | Si (MoonViT) | Pesos abiertos (repo de staging de terceros) |
| DeepSeek V3.2 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Qwen3-VL-235B-A22B | 235B totales / 22B activos | no disponible | no disponible | Si | no disponible |
| GPT-5.2 | no disponible (propietario) | no disponible | Propietaria | no disponible | Solo API |

Los datos de DeepSeek V3.2, Qwen3-VL-235B-A22B y GPT-5.2 solo se conocen parcialmente a traves de la tabla de benchmarks de la model card; el resto de especificaciones no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio analizado (`enhasasuzu/Kimi-K2.5-staging`) es una publicacion de staging de un tercero, no el repositorio oficial de Moonshot AI; conviene verificar integridad y procedencia antes de usarlo en produccion.
- Licencia "Modified MIT" etiquetada como `other`: es necesario revisar el texto completo de la licencia para confirmar condiciones de uso comercial.
- Riesgo de alucinacion inherente a los modelos de lenguaje, no cuantificado en la informacion disponible.
- Sesgos conocidos: no disponible.
- Idiomas soportados: no disponible; no se confirma cobertura multilingue.
- La model card advierte de un cambio en el token de plantilla de chat (`<|media_start|>` reemplazado por `<|media_begin|>`) y de la eliminacion del system prompt por defecto, lo que puede afectar a integraciones previas.
- Requiere `custom_code` en `transformers`, lo que complica el despliegue estandar y la compatibilidad con frameworks de inferencia.
- Los benchmarks de la model card estan parcialmente truncados en la informacion disponible; no deben extrapolarse valores no publicados.

## Enlaces

- Repositorio Hugging Face (staging): https://huggingface.co/enhasasuzu/Kimi-K2.5-staging
- Repositorio oficial en Hugging Face (Moonshot AI): https://huggingface.co/moonshotai
- GitHub: https://github.com/moonshotai/Kimi-K2.5
- Paper: https://arxiv.org/abs/2602.02276
- Blog tecnico: https://www.kimi.com/blog/kimi-k2-5.html
- Pagina del modelo: https://www.kimi.ai/ai-models/kimi-k2-5
- Modelos Kimi: https://www.kimi.ai/ai-models/
- Chat: https://www.kimi.com
- Homepage: https://www.moonshot.ai
- Twitter: https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
