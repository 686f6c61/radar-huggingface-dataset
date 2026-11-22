# mas-rdt/Qwen3.5-9B-Roblox-Luau-v1-GGUF

## Resumen

Qwen3.5-9B-Roblox-Luau-v1-GGUF es un ajuste fino (fine-tuning) del modelo base Qwen3.5-9B, especializado en la generacion de codigo Luau, el lenguaje de scripting propietario de la plataforma Roblox. El modelo ha sido publicado por el usuario mas-rdt en formato GGUF, lo que lo hace directamente ejecutable con llama.cpp y herramientas compatibles, sin necesidad de infraestructura de GPU de datacenter. El repositorio incluye tanto los pesos cuantizados en Q5_K_M como el proyector multimodal en BF16, lo que indica que el modelo base conserva capacidades de vision-lenguaje.

El modelo cuenta con 9.197.093.888 parametros (~9,2 mil millones) y un tamano de repositorio de 7,6 GB, coherente con una cuantizacion Q5_K_M y un proyector multimodal en BF16. La relevancia de este modelo radica en su nicho: la generacion asistida de codigo Luau para desarrolladores de Roblox, un ecosistema con millones de creadores donde las herramientas de IA especializadas son escasas. Al estar en formato GGUF, puede desplegarse en hardware de consumo, lo que democratiza el acceso a asistencia de codigo especializada.

La informacion publicada por el autor es muy limitada: no se detallan datos de entrenamiento, composicion del dataset, licencia ni idiomas soportados. Esta ficha refleja exclusivamente los datos disponibles en la model card y los metadatos del repositorio, marcando como "no disponible" todo aquello que el autor no ha especificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B; detalles no disponibles) |
| Parametros totales | 9.197.093.888 (~9,2 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q5_K_M (GGUF); proyector multimodal en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (Q5_K_M) y BF16 (mmproj) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del base Qwen3.5-9B, una arquitectura transformer de aproximadamente 9,2 mil millones de parametros. La model card indica que el fine-tuning y la conversion a GGUF se realizaron con Unsloth, una libreria optimizada para entrenamiento y cuantizacion de LLMs que reduce el uso de memoria y acelera el proceso (el autor afirma "2x faster"). No se especifica si se emplearon tecnicas como LoRA, QLoRA o fine-tuning completo, ni se detalla el numero de tokens de entrenamiento, la composicion del dataset de Luau/Roblox ni si hubo fases de RLHF o DPO.

La presencia del fichero `Qwen3.5-9B.BF16-mmproj.gguf` confirma que el modelo conserva el proyector multimodal del base, por lo que mantiene capacidades de vision-lenguaje. Sin embargo, no se documenta si el fine-tuning en Luau afecto o preservo dichas capacidades. Tampoco se detalla ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, etc.) mas alla del uso de Unsloth para el pipeline de entrenamiento y conversion.

## Capacidades

- Generacion de codigo Luau especializado para Roblox (objetivo principal del fine-tuning).
- Generacion de texto general, heredada del base Qwen3.5-9B.
- Capacidades de vision-lenguaje, segun el proyector multimodal incluido (BF16-mmproj).
- Soporte de conversacion multi-turno (tag "conversational").
- Compatibilidad con el flag `--jinja` de llama.cpp para plantillas de chat.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible (no documentado).
- Modo thinking explicito: no disponible (no documentado).

## Casos de uso

- Asistencia a desarrolladores de Roblox: el modelo puede generar y completar scripts Luau para mecanicas de juego, sistemas de inventario o logica de servidor, aprovechando su fine-tuning especifico en el lenguaje.
- Revision y refactorizacion de codigo Luau: puede integrarse en editores o plugins de Roblox Studio para sugerir mejoras, detectar patrones obsoletos o reescribir funciones con APIs actualizadas.
- Generacion de codigo en pipelines de CI: al ejecutarse con llama.cpp, puede invocarse desde scripts de validacion para generar tests o stubs de modulos Luau de forma automatizada.
- Prototipado rapido de experiencias: creadores sin experiencia profunda en programacion pueden describir una mecanica en lenguaje natural y obtener un script Luau funcional como punto de partida.
- Educacion y formacion: el modelo puede explicar fragmentos de codigo Luau o generar ejemplos comentados para tutoriales dirigidos a nuevos desarrolladores de Roblox.
- Despliegue local en hardware de consumo: gracias al formato GGUF Q5_K_M (7,6 GB de repo), puede ejecutarse en estaciones de trabajo con GPU consumer para uso offline o con requisitos de privacidad.
- Analisis de capturas o diagramas de Roblox Studio: si las capacidades de vision se conservan tras el fine-tuning, el modelo podria interpretar imagenes de la interfaz o de jerarquias de objetos para asistir en la configuracion de escenas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q5_K_M ocupa aproximadamente 7,6 GB en disco; se estima un consumo de VRAM en torno a 8-10 GB para cargar el modelo con contexto moderado (estimacion basada en el tamano del fichero, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 4090 (24 GB) o RTX 3090 (24 GB) permitirian ejecutar el modelo con holgura; GPUs de 12-16 GB (RTX 4070 Ti, RTX 4080) podrian alojarlo con contexto reducido.
- Cabe en GPU consumer: si, segun el tamano del fichero Q5_K_M, en GPUs con 12 GB o mas de VRAM (no confirmado oficialmente).
- Opciones de despliegue: llama.cpp (`llama-cli` para texto, `llama-mtmd-cli` para multimodal), y por extension cualquier frontend compatible con GGUF (Ollama, LM Studio, etc.). vLLM y TGI no se mencionan en la model card.
- Latencia y throughput: no disponibles (no documentados por el autor).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Qwen3.5-9B-Roblox-Luau-v1 (este) | ~9,2 B | no disponible | no disponible | GGUF | Luau/Roblox |
| Qwen3.5-9B (base) | ~9,2 B | no disponible | no disponible | safetensors/GGUF | Generalista |
| Alternativas especializadas en Luau | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables especializados en Luau documentados en la informacion proporcionada.

## Limitaciones y advertencias

- Informacion incompleta: el autor no publica licencia, idiomas, contexto ni detalles de entrenamiento, lo que impide evaluar su idoneidad para produccion con garantias.
- Licencia no especificada: al no indicarse licencia, no se puede confirmar si el uso comercial esta permitido; debe consultarse con el autor antes de cualquier despliegue productivo.
- Riesgo de alucinacion: como todo LLM, puede generar APIs de Roblox inexistentes o sintaxis Luau incorrecta; se recomienda validacion humana del codigo generado.
- Sesgos desconocidos: no se documenta la composicion del dataset de fine-tuning, por lo que no pueden evaluarse sesgos de dominio ni de idioma.
- Capacidades multimodales inciertas: el proyector mmproj esta presente, pero no se confirma que el fine-tuning en Luau haya preservado las capacidades de vision del base.
- Modelo muy reciente y sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia externa de calidad o estabilidad.
- Contexto no documentado: se desconoce la ventana de contexto efectiva, lo que limita la planificacion de casos de uso con entradas largas.

## Enlaces

- Hugging Face: https://huggingface.co/mas-rdt/Qwen3.5-9B-Roblox-Luau-v1-GGUF
- Unsloth (herramienta de fine-tuning y conversion): https://github.com/unslothai/unsloth
- llama.cpp (runtime compatible con GGUF): https://github.com/ggml-org/llama.cpp
