# burningfeet/backup2026-10-31-Jackrong-curatebyLffyFx-as-best-agentic-Qwopus3.6-35B-A3B-Coder-MTP-GGUF

## Resumen

Este repositorio aloja una cuantizacion en formato GGUF del modelo Qwopus3.6-35B-A3B-v1, un derivado afinado por Jackrong sobre la base Qwen3.6-35B-A3B de Unsloth. Se trata de un modelo multimodal de tipo image-text-to-text con arquitectura Mixture-of-Experts (MoE), orientado a tareas de codigo, razonamiento agentico y uso de herramientas. El autor del repositorio, burningfeet, publica una copia de seguridad (backup) con fecha 2026-10-31, curada por LffyFx y etiquetada como "best agentic", con pesos en GGUF listos para llama.cpp.

El modelo declara 35B parametros nominales en su nombre (35B-A3B indica aproximadamente 35 mil millones totales con unos 3 mil millones activos por token, aunque el dato de safetensors del repo apunta a 446.571.248 parametros, probablemente correspondiente a un subconjunto o a un adaptador LoRA incluido). Ofrece soporte para contexto largo, modo thinking-off, function calling, tool use y capacidades de vision. Los idiomas declarados son ingles, chino, espanol, ruso y japones.

Su relevancia radica en que combina un modelo MoE eficiente en inferencia con un formato GGUF ampliamente compatible con llama.cpp y Ollama, lo que facilita su despliegue en hardware de consumo. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, si bien el acceso al repositorio esta restringido (gated) y requiere aceptar condiciones en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en transformer, multimodal (image-text-to-text) |
| Parametros totales | 35B nominales (nombre del modelo); 446.571.248 en safetensors del repo (dato no coincidente, posiblemente adaptador o subconjunto) |
| Parametros activos | Aproximadamente 3B (segun nomenclatura A3B) |
| Longitud de contexto | No disponible (etiqueta "long-context" sin cifra concreta) |
| Tipos de cuantizacion | GGUF (variantes concretas no especificadas en la informacion disponible) |
| Idiomas soportados | Ingles (en), chino (zh), espanol (es), ruso (ru), japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tambien transformers; repo de 133 GB) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.6-35B-A3B, una arquitectura Mixture-of-Experts con aproximadamente 35 mil millones de parametros totales y unos 3 mil millones activos por token, lo que reduce el coste computacional de inferencia frente a un modelo denso del mismo tamano. La variante Qwopus3.6-35B-A3B-v1 de Jackrong se ha afinado mediante SFT (supervised fine-tuning) y LoRA, segun las etiquetas del repositorio, con enfasis en codigo, logica, matematicas y comportamiento agentico (tool-use, function-calling). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO.

El repositorio incluye la etiqueta "MTP" (multi-token prediction), lo que sugiere tecnicas de decodificacion especulativa o prediccion multi-token para acelerar la generacion. Tambien declara "thinking-off", es decir, la posibilidad de desactivar el modo de razonamiento extendido para reducir latencia. La componente multimodal (vision) proviene presumiblemente del modelo base Qwen3.6, aunque no se detalla la arquitectura del encoder visual ni los datos de alineacion imagen-texto.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con modo de pensamiento (thinking) activable o desactivable.
- Generacion y comprension de codigo en multiples lenguajes, con enfasis declarado en tareas de coder y logica.
- Razonamiento matematico y resolucion de problemas (etiqueta "math").
- Capacidades multimodales de imagen a texto (image-text-to-text, vision).
- Soporte de tool calling y function calling para integracion con APIs y agentes.
- Comportamiento agentico: uso de herramientas, planificacion y ejecucion de tareas encadenadas.
- Soporte multilingue en ingles, chino, espanol, ruso y japones.
- Contexto largo (long-context), aunque sin cifra concreta publicada.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible") y con llama.cpp por el formato GGUF.

## Casos de uso

- Asistente de codigo en produccion: el modelo puede integrarse en pipelines de CI/CD para revision automatica de parches, generacion de tests y sugerencias de refactorizacion, aprovechando su soporte de tool calling y su enfoque en codigo.
- Agente autonomo de resolucion de incidencias: con function calling y razonamiento multi-paso, puede consultar APIs, leer logs y proponer acciones correctivas en un flujo agentico.
- Atencion al cliente tecnica multilingue: cubre conversaciones en ingles, chino, espanol, ruso y japones, con contexto largo para mantener historiales extensos.
- Analisis de documentos con imagenes: al ser image-text-to-text, puede extraer informacion de capturas, diagramas o formularios combinados con texto.
- Asistente de matematicas y logica: util para tutoria automatizada o verificacion de pasos en problemas STEM, gracias a las etiquetas de math y logic.
- Despliegue local en estaciones de trabajo: al estar en GGUF y ser MoE con ~3B activos, puede ejecutarse en hardware de consumo mediante llama.cpp u Ollama para prototipado y uso personal.
- Generacion de codigo asistida en IDE: integrable via endpoints compatibles con OpenAI para autocompletado y explicacion de fragmentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; para un MoE de ~35B totales en GGUF, las cuantizaciones Q4 requieren del orden de 18-22 GB y Q8 en torno a 35-40 GB, aunque estas cifras son estimaciones generales y no datos oficiales del repositorio.
- GPU recomendadas: no disponibles de forma oficial; por tamano, una RTX 4090 (24 GB) podria alojar cuantizaciones Q4, y para precisiones mayores se requeririan A100 40/80 GB o H100.
- Cabe en GPU de consumo: probablemente en RTX 4090/3090 con cuantizacion agresiva; no confirmado por el autor.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF; el repo tambien declara compatibilidad con transformers y text-generation-inference.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwopus3.6-35B-A3B-v1 (este repo, GGUF) | ~35B totales / ~3B activos | No disponible (long-context) | Apache 2.0 | GGUF | Multimodal, agentico, coder |
| Qwen3.6-35B-A3B (base, Unsloth) | ~35B totales / ~3B activos | No disponible | No disponible en esta ficha | safetensors | Modelo base sin el afinado de Jackrong |
| Jackrong/Qwopus3.6-35B-A3B-v1 | ~35B totales / ~3B activos | No disponible | No disponible en esta ficha | safetensors | Version original del afinado |

No se dispone de datos de rendimiento comparado para establecer diferencias cuantitativas con alternativas.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en HuggingFace antes de descargar los pesos.
- El dato de parametros en safetensors (446.571.248) no coincide con los 35B nominales, lo que genera incertidumbre sobre el contenido exacto del repo (posible inclusion de adaptadores LoRA o subconjuntos).
- No se han publicado benchmarks, por lo que el rendimiento real no esta verificado de forma independiente.
- Riesgo de alucinacion inherente a los modelos de lenguaje, agravado en tareas de codigo y matematicas si no se valida la salida.
- Sesgos desconocidos: no hay documentacion sobre sesgos de genero, raza o idioma.
- Cobertura limitada a cinco idiomas declarados; el rendimiento en espanol no esta cuantificado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el afinado podrian tener condiciones adicionales no reflejadas en esta ficha.
- El repositorio es una copia de seguridad (backup) de un tercero, no una publicacion oficial del autor original; puede quedar desactualizado o eliminarse.
- El modo thinking-off y MTP pueden afectar a la calidad de respuestas en tareas complejas si se usan sin validacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/burningfeet/backup2026-10-31-Jackrong-curatebyLffyFx-as-best-agentic-Qwopus3.6-35B-A3B-Coder-MTP-GGUF
- Modelo base del afinado: https://huggingface.co/Jackrong/Qwopus3.6-35B-A3B-v1
- Modelo base original: https://huggingface.co/unsloth/Qwen3.6-35B-A3B
