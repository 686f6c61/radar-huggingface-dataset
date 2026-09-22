# mlboydaisuke/Falcon3-3B-Instruct-LiteRT

## Resumen

Falcon3-3B-Instruct-LiteRT es una conversion del modelo tiiuae/Falcon3-3B-Instruct al formato `.litertlm` de Google, pensada para inferencia en dispositivo (on-device) mediante el runtime LiteRT-LM. El autor de la conversion es el usuario de HuggingFace mlboydaisuke, mientras que el modelo original pertenece al Technology Innovation Institute (TII) de Abu Dabi. El objetivo es ejecutar un modelo de ~3.000 millones de parametros en telefonos, portatiles y equipos de borde sin depender de la nube ni de aceleradores dedicados.

La relevancia de esta ficha radica en que demuestra que una cuantizacion int4 blockwise (bloque de 128, simetrica) aplicada con `litert-torch` conserva la calidad de razonamiento del modelo en precision bf16: en GSM8K (n=100) alcanza un 77%, frente al 75% de bf16 y el 76% de una build MLX 4-bit de control. La conversion es exclusivamente de texto (no incluye torres de vision ni audio) y emplea la arquitectura estandar del decodificador Falcon3.

El bundle ocupa aproximadamente 1,74 GB en disco, mantiene los embeddings en INT8, limita la cache KV a 2048 tokens y conserva la plantilla de chat nativa de Falcon3 (`<|user|>` / `<|assistant|>`, token de parada `<|endoftext|>`). El repositorio completo pesa 9,4 GB probablemente por incluir artefactos adicionales de exportacion. Con 76 descargas y 3 likes, es un artefacto de nicho orientado a desarrolladores que trabajan con el ecosistema LiteRT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (clase `LlamaForCausalLM` en el modelo base) |
| Parametros totales | ~3.000 millones (heredados de Falcon3-3B-Instruct) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens de cache KV en esta conversion; contexto del modelo base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | int4 blockwise (bloque 128, simetrica) en pesos; embeddings en INT8; computo entero |
| Idiomas soportados | no disponible |
| Licencia | Falcon LLM License (TII), heredada del modelo base |
| Formato de pesos | LiteRT-LM (`.litertlm`), fichero `model.litertlm` de ~1,74 GB |
| Modelo base | tiiuae/Falcon3-3B-Instruct |
| Libreria | litert-lm |
| Fecha de creacion | 2026-06-19 |
| Ultima actualizacion | 2026-09-21 |
| Descargas / likes | 76 / 3 |
| Tamano del repositorio | 9,4 GB |

## Arquitectura y entrenamiento

La conversion reutiliza la arquitectura del decodificador Falcon3-3B-Instruct, un transformer causal estandar compatible con la clase `LlamaForCausalLM`. No hay innovaciones arquitectonicas propias de esta ficha: el autor indica explicitamente que, al tratarse de una arquitectura convencional, la conversion "cabalga el conversor y el runtime existentes sin codigo personalizado". El proceso de exportacion se realizo con `litert-torch` en su version estandar, sin parches de grafo, aplicando una unica decision no por defecto: la receta de cuantizacion int4 blockwise-128 en lugar de la int4 channelwise que la herramienta ofrece por defecto. La cuantizacion channelwise degrada a los modelos pequenos, mientras que el esquema blockwise es el que emplean los modelos oficiales `litert-community/*`.

La receta `falcon_int4_block128.json` esta incluida en el repositorio y se pasa al exportador estandar junto con `cache_length=2048`. El bundle final incorpora el tokenizer y la plantilla de prompt de Falcon3 (formato `<|user|>` / `<|assistant|>` con token de parada `<|endoftext|>`), de modo que no se necesitan ficheros de tokenizer separados. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base paso por fases de RLHF o DPO; esos datos corresponden a la model card original de TII y no se reproducen aqui. Tampoco se documenta en esta ficha ninguna tecnica de decodificacion especulativa ni atencion lineal.

Sobre el regimen de entrenamiento post-conversion: la model card indica que se trata de un modelo instruct de respuesta directa, sin bloque `<think>`, que termina limpiamente en `<|endoftext|>`. La actualizacion del 21 de septiembre de 2026 solo modifico la plantilla de chat para aceptar la forma de "content-parts" 0.18, manteniendo pesos, tokenizer y metadatos del ejecutor identicos byte a byte.

## Capacidades

- Generacion de texto conversacional en formato instruct, con plantilla de chat nativa de Falcon3.
- Razonamiento aritmetico y resolucion de problemas matematicos de varios pasos: la evaluacion con chain-of-thought 0-shot en GSM8K pidiendo el formato `#### <n>` obtiene un 77%.
- Respuesta directa sin bloque de razonamiento explicito (no genera secciones `<think>`), lo que simplifica el parseo de salidas en produccion.
- Terminacion controlada mediante el token de parada `<|endoftext|>`, util para streaming y para evitar generaciones truncadas.
- Inferencia completamente local en dispositivo, sin necesidad de conexion a red ni de claves de API.
- Ejecucion multiplataforma a traves del runtime LiteRT-LM: movil (backend GPU con Metal en iOS) y escritorio (macOS, Linux y Windows).
- Exposicion como servidor local compatible con la API de OpenAI mediante `litert-lm serve`.
- Capacidades de tool calling / function calling: no disponibles en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso explicito: no disponible en la informacion proporcionada.
- Capacidades de vision, audio o multimodalidad: no disponibles; la conversion es explicitamente solo texto ("no vision/audio towers").
- Capacidades multilingues: no disponible; la conversion no especifica el conjunto de idiomas soportados.

## Casos de uso

- Asistente conversacional embebido en aplicaciones moviles: el bundle de 1,74 GB y el backend GPU de LiteRT-LM permiten integrar un chatbot instruct directamente en una app iOS o Android. Con ~27 tok/s medidos en un iPhone 17 Pro, la experiencia de escritura resulta fluida sin salir del dispositivo.
- Procesamiento de datos sensibles con privacidad por diseno: en entornos sanitarios, legales o financieros, el modelo puede resumir, reescribir o extraer informacion de documentos locales sin que el texto abandone el equipo, eliminando el riesgo de filtracion a APIs externas.
- Tutoria de matematicas y apoyo educativo offline: gracias al 77% en GSM8K con chain-of-thought, es adecuado para aplicaciones de resolucion de problemas paso a paso en tabletas o portatiles sin conectividad, por ejemplo en aulas o zonas con red limitada.
- Generacion de codigo en produccion: no hay datos especificos de rendimiento en codigo en la informacion disponible; el modelo puede emplearse para autocompletado y explicacion de fragmentos en IDE, pero conviene validar su calidad con evaluaciones propias antes de integrarlo en pipelines de CI/CD.
- Servidor local compatible con OpenAI para desarrollo y pruebas: con `litert-lm serve` se levanta un endpoint con la misma interfaz que la API de OpenAI, lo que permite sustituir llamadas remotas por inferencia local en tests de integracion, demos y entornos de staging sin coste por token.
- Automatizacion de oficina en portatiles sin GPU dedicada: con ~89 tok/s en un Mac M4 Max en modo greedy, el modelo puede redactar correos, resumir actas o reformular textos en herramientas de escritorio y suites ofimaticas, ejecutandose sobre la GPU integrada.
- Prototipado rapido de funciones de IA generativa en aplicaciones de escritorio multiplataforma: el mismo fichero `.litertlm` funciona en macOS, Linux y Windows, lo que reduce el trabajo de empaquetado y permite distribuir un unico artefacto.
- Clasificacion y extraccion de informacion en flujos de borde: en escenarios de IoT industrial o dispositivos de campo, el modelo puede etiquetar incidencias, normalizar campos de formularios o generar resumentes breves de registros sin depender de conectividad, siempre que el texto quepa en la ventana de 2048 tokens.

## Benchmarks y rendimiento

| Configuracion | GSM8K (n=100, greedy, 0-shot CoT) |
|---|---|
| bf16 (referencia) | 75% |
| MLX 4-bit (control) | 76% |
| Este modelo (LiteRT int4 blockwise-128) | 77% |

Condiciones de la medicion, segun la model card: 100 ejemplos, decodificacion greedy, chain-of-thought 0-shot solicitando la respuesta en formato `#### <n>`, con prompt y extraccion de respuesta identicos en todas las filas. El autor senala que la dispersion de un punto porcentual es ruido de muestreo con n=100 y que la build int4 de LiteRT esta en paridad con bf16 y con el control MLX 4-bit.

Metricas de velocidad de decodificacion:

| Plataforma | Backend | Rendimiento |
|---|---|---|
| iPhone 17 Pro | GPU Metal | ~27 tok/s |
| Mac M4 Max | LiteRT-LM, greedy | ~89 tok/s |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, BBH, IFEval ni de otras suites de evaluacion.

## Requisitos de hardware

- Peso del fichero: ~1,74 GB (`model.litertlm`). Es el componente dominante del presupuesto de memoria, ya que los pesos estan en int4 con embeddings en INT8.
- Memoria adicional: hay que sumar la cache KV para 2048 tokens y el overhead del runtime LiteRT-LM. No se especifica el consumo total de RAM/VRAM en la informacion disponible.
- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del bundle se situa en el orden de 2 GB para pesos, mas cache y overhead.
- Cabe en GPU de consumo: si. El modelo esta disenado para ejecutarse en telefonos moviles y portatiles con GPU integrada, por lo que cualquier GPU de escritorio moderna (serie RTX 30/40, Apple Silicon, integradas recientes) dispone de margen sobrado.
- GPU de datacenter (A100, H100): compatibles por capacidad, pero no son el objetivo de esta conversion y no se aportan mediciones en esas plataformas.
- CPU: el computo es entero (integer), lo que permite ejecucion en CPU sin unidades de coma flotante dedicadas; no se aportan cifras de throughput en CPU.
- Opciones de despliegue: runtime LiteRT-LM (`litert_lm_main` con `--backend gpu`), CLI de escritorio para macOS, Linux y Windows, paquete `pip install litert-lm` con subcomandos `import`, `run` y `serve`, y servidor local compatible con la API de OpenAI.
- Compatibilidad con otros runners: no disponible. La model card no menciona soporte para vLLM, llama.cpp, Ollama, TGI ni TensorRT-LLM para este bundle `.litertlm`.
- Latencia y throughput: ~27 tok/s en iPhone 17 Pro (Metal) y ~89 tok/s en Mac M4 Max en modo greedy. No se aportan datos de latencia de primer token ni de throughput agregado en lote.

## Comparativa con modelos similares

Comparativa directa con las variantes medidas en la propia model card:

| Modelo | Parametros | Contexto | Cuantizacion | Formato | GSM8K (n=100) | Licencia |
|---|---|---|---|---|---|---|
| Falcon3-3B-Instruct-LiteRT | ~3B | 2048 (cache KV) | int4 blockwise-128 + embeddings INT8 | `.litertlm` | 77% | Falcon LLM License |
| Falcon3-3B-Instruct (bf16) | ~3B | no disponible | bf16 | safetensors | 75% | Falcon LLM License |
| Falcon3-3B-Instruct MLX 4-bit | ~3B | no disponible | 4-bit | MLX | 76% | Falcon LLM License |

Alternativas de categoria similar (mismo orden de parametros, orientadas a despliegue local o de borde):

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos comparativos |
|---|---|---|---|---|---|
| Falcon3-3B-Instruct-LiteRT (este) | ~3B | 2048 (cache KV) | Falcon LLM License | LiteRT-LM, movil y escritorio | GSM8K 77% |
| Llama 3.2 3B Instruct | ~3B | no disponible en la informacion proporcionada | Llama 3.2 Community License | amplia, multiples runtimes | no disponible |
| Qwen2.5-3B-Instruct | ~3B | no disponible en la informacion proporcionada | Apache 2.0 (segun el modelo base) | amplia, multiples runtimes | no disponible |

No se dispone de resultados de benchmarks comparativos entre estas alternativas en la informacion proporcionada; cualquier comparacion de rendimiento entre ellas requeriria una evaluacion propia bajo condiciones identicas. La ventaja diferencial de este artefacto no es la calidad bruta, sino el formato `.litertlm` con cuantizacion blockwise que preserva la precision del modelo en un paquete apto para dispositivo.

## Limitaciones y advertencias

- Solo texto: la conversion excluye explicitamente las torres de vision y audio, por lo que no admite entradas multimodales.
- Ventana de contexto reducida: la cache KV esta fijada en 2048 tokens, muy por debajo de lo habitual en modelos instruct de esta categoria. Conversaciones largas o documentos extensos requeriran truncado o troceado.
- Idiomas soportados no documentados: la model card no especifica el conjunto de idiomas cubiertos, por lo que no se puede asumir un rendimiento multilingue sin validacion previa.
- Evaluacion limitada: el unico benchmark publicado es GSM8K con n=100, una muestra pequena cuya diferencia de un punto porcentual no es estadisticamente significativa. No hay datos de MMLU, HumanEval, evaluaciones de seguridad, sesgos o robustez.
- Sin modo de razonamiento explicito: el modelo responde directamente, sin bloque `<think>`, lo que puede penalizar tareas que se benefician de cadenas de razonamiento largas y visibles.
- Riesgo de alucinacion: no se documentan medidas especificas de mitigacion ni tasas de alucinacion; como en cualquier modelo de 3.000 millones de parametros, la generacion de hechos incorrectos con apariencia plausible es esperable, especialmente en dominios especializados.
- Sesgos conocidos: no disponible. La model card no incluye informacion sobre sesgos demograficos, culturales o linguisticos.
- Restricciones de licencia: se hereda la Falcon LLM License de TII, que no es una licencia de codigo abierto estandar. Es obligatorio revisar los terminos completos antes de cualquier uso comercial; la model card enlaza a https://falconllm.tii.ae/falcon-terms-and-conditions.html y no detalla las condiciones en el propio repositorio.
- Dependencia del ecosistema LiteRT-LM: el uso esta atado al runtime de Google AI Edge. No se documenta compatibilidad con vLLM, llama.cpp, Ollama u otros runners, lo que limita la portabilidad y puede complicar la integracion en infraestructuras ya establecidas.
- Madurez del artefacto: 76 descargas y 3 likes indican una adopcion muy baja. Conviene verificar el bundle y las cifras de rendimiento en el entorno de destino antes de llevarlo a produccion.
- Fechas del repositorio: la fecha de creacion registrada (2026-06-19) y la de actualizacion (2026-09-21) son posteriores a la exportacion descrita; si se integra en un pipeline, conviene fijar una revision concreta del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlboydaisuke/Falcon3-3B-Instruct-LiteRT
- Modelo base: https://huggingface.co/tiiuae/Falcon3-3B-Instruct
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Runtime LiteRT-LM (ruta alternativa citada en la model card): https://github.com/google-ai-edge/LiteRT-LM
- Herramienta de conversion litert-torch: https://github.com/google-ai-edge/litert
- Terminos de licencia Falcon LLM (TII): https://falconllm.tii.ae/falcon-terms-and-conditions.html
- Repositorio de peticiones de conversion on-device: https://github.com/john-rocky/on-device-requests
- Nota sobre la busqueda web: los resultados devueltos no guardan relacion con el modelo (contenido de ficcion en Royal Road), por lo que no se anaden enlaces adicionales.
