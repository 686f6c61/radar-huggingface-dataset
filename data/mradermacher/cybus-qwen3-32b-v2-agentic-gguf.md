# mradermacher/Cybus-Qwen3-32B-v2-agentic-GGUF

## Resumen

Cybus-Qwen3-32B-v2-agentic-GGUF es la versión cuantizada en formato GGUF publicada por mradermacher del modelo squaredcuber/Cybus-Qwen3-32B-v2-agentic, un ajuste fino de Qwen3-32B orientado a generación de código Luau para Roblox y a uso en herramientas (tool use). El repositorio no contiene pesos originales en safetensors, sino 11 cuantizaciones estáticas generadas con llama.cpp a partir del modelo base, lo que permite ejecutar un modelo denso de 32.762.123.264 parámetros en hardware de consumo o en servidores con GPU única.

El modelo resuelve un nicho concreto: asistentes de código y agentes que trabajan dentro del ecosistema Roblox (Luau) y que necesitan emitir llamadas a funciones de forma fiable. Al estar publicado bajo licencia Apache 2.0 y en un formato ampliamente soportado por llama.cpp, Ollama y LM Studio, es relevante para equipos que quieren desplegar localmente un modelo de ~32B especializado sin depender de APIs externas.

La información disponible es limitada: la model card del repositorio GGUF es la plantilla estándar de mradermacher y no incluye detalles de entrenamiento, composición del dataset ni resultados de evaluación. El repositorio tiene 220 descargas y 1 like en el momento de la consulta, y fue creado el 4 de abril de 2026 con última actualización el 24 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Qwen3-32B; la model card no detalla la arquitectura |
| Parametros totales | 32.762.123.264 (32,76 B) |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | No disponible en la model card; Antbase reporta 33K de ventana |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas, sin imatrix) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

Tamaños de fichero publicados: Q2_K 12,4 GB; Q3_K_S 14,5 GB; Q3_K_M 16,1 GB; Q3_K_L 17,4 GB; IQ4_XS 18,0 GB; Q4_K_S 18,9 GB; Q4_K_M 19,9 GB; Q5_K_S 22,7 GB; Q5_K_M 23,3 GB; Q6_K 27,0 GB; Q8_0 34,9 GB. El repositorio completo ocupa 224,0 GB.

## Arquitectura y entrenamiento

No se dispone de información sobre el proceso de entrenamiento en la documentación proporcionada. La model card del repositorio GGUF únicamente indica que se trata de cuantizaciones estáticas de squaredcuber/Cybus-Qwen3-32B-v2-agentic, con metadatos internos de la herramienta de mradermacher (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`), lo que confirma una conversión desde pesos en formato Hugging Face a GGUF seguida de cuantización de tensores de salida.

Por el identificador y las etiquetas del modelo (roblox, luau, code-generation, tool-use, qwen3) se deduce que parte de Qwen3-32B, un transformer decoder-only denso de 32,76B parámetros, y que el ajuste fino del autor original se orientó a código Luau y a invocación de herramientas. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o RL, ni innovaciones técnicas adicionales más allá de las heredadas del modelo base.

## Capacidades

- Generación de código en Luau, el lenguaje de scripting de Roblox, según las etiquetas del modelo (roblox, luau, code-generation).
- Invocación de herramientas y funciones (tool use), tal como declara la etiqueta tool-use del repositorio.
- Generación de texto conversacional en inglés, según la etiqueta conversational y el campo language: en.
- Razonamiento multi-paso y uso como agente: plausible por la denominación "agentic" del modelo base, aunque no se documenta el modo thinking ni su formato exacto en la información disponible.
- Capacidad multilingüe: limitada al inglés según los metadatos; no se declaran otros idiomas.
- Capacidades de visión, audio o modalidades adicionales: no disponibles.

## Casos de uso

- Asistencia de código en Roblox Studio: el modelo puede generar y completar scripts Luau (gestión de RemoteEvents, lógica de inventario, sistemas de daño) dentro de un plugin o servidor local, aprovechando el ajuste específico sobre Luau en lugar de un modelo generalista.
- Agente de automatización de tareas en proyectos Roblox: al soportar tool use, puede encadenar llamadas a funciones para crear objetos, consultar la jerarquía de un place o aplicar cambios en lote, con el bucle de agente implementado por el desarrollador.
- Autocompletado y refactorización en editores autoalojados: desplegado tras un endpoint compatible con la API de OpenAI (la etiqueta endpoints_compatible así lo indica), se integra en asistentes tipo Continue o similar para sugerencias de código sin salida a internet.
- Generación de código en pipelines de CI: con la cuantización Q4_K_M (19,9 GB) puede ejecutarse en una GPU de 24 GB para tareas de generación de tests o documentación de módulos Luau, manteniendo los datos del repositorio en infraestructura propia.
- Evaluación y prototipado de agentes: al ser un modelo denso de 32B con cuantizaciones desde 12,4 GB, permite iterar sobre prompts de sistema y esquemas de herramientas en una sola máquina antes de escalar a un modelo mayor.
- Despliegue en estaciones de trabajo con GPU de consumo: la variante Q2_K (12,4 GB) o Q4_K_S (18,9 GB) hace viable ejecutar el modelo en una RTX 4090 o 3090 para tareas de asistencia interactiva con contexto moderado.
- Base para comparativas de ajustes finos: sirve como referencia para medir cuánto aporta un fine-tuning de dominio (Luau) frente a Qwen3-32B sin ajustar en tareas de código específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché KV): 12,4 GB en Q2_K; 18,9-19,9 GB en Q4_K_S/Q4_K_M; 23,3 GB en Q5_K_M; 34,9 GB en Q8_0.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para Q4_K_M con contexto moderado; A100 40 GB o H100 para Q6_K/Q8_0; para Q8_0 en 24 GB sería necesario repartir capas entre GPU y CPU.
- Cabe en GPU de consumo: sí, con Q2_K en 16 GB (RTX 4060 Ti, RTX 4080) y Q4_K_M en 24 GB (RTX 3090, RTX 4090). Hay que reservar VRAM adicional para la caché KV, que crece con la longitud de contexto.
- Opciones de despliegue: llama.cpp, Ollama y LM Studio (soporte nativo de GGUF); llama-cpp-python para integración en aplicaciones; vLLM con soporte GGUF experimental. TGI no soporta GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Cybus-Qwen3-32B-v2-agentic-GGUF | 32,76 B (denso) | No disponible; Antbase reporta 33K | Apache 2.0 | GGUF (11 cuantizaciones) | Ajuste para Luau y tool use; solo inglés |
| squaredcuber/Cybus-Qwen3-32B-v2-agentic | 32,76 B (presumiblemente idéntico) | No disponible | Apache 2.0 | Safetensors (formato HF) | Modelo original sin cuantizar; requiere VRAM completa o cuantización propia |
| Qwen3-32B (modelo base) | 32,76 B (denso) | No disponible en esta ficha | Apache 2.0 | Safetensors, GGUF de terceros | Sin ajuste a Luau; capacidades generalistas y multilingües según su propia documentación |

No se dispone de datos de rendimiento comparado (benchmarks) entre estas variantes en la información proporcionada, por lo que la comparativa se limita a parámetros, licencia, formato y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al derivar de Qwen3-32B y entrenarse solo en inglés, es esperable un sesgo hacia el dominio de código y hacia el idioma inglés, pero no se cuantifica.
- Riesgo de alucinación: no evaluado. En generación de código Luau, la salida puede compilar pero usar APIs inexistentes o deprecadas de Roblox; requiere validación.
- Limitaciones de idioma: el modelo declara únicamente inglés. No hay evidencia de soporte fiable de castellano ni de otros idiomas.
- Limitaciones de contexto: la model card no especifica la ventana; la cifra de 33K proviene de un tercero (Antbase) y no está confirmada por el autor.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificaciones con atribución, pero conviene revisar los términos heredados de Qwen3-32B y del modelo base antes de redistribuir.
- Cuantizaciones: las variantes Q2_K y Q3_K_S degradan notablemente la calidad; la propia model card marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M como equilibrio velocidad/calidad.
- Faltan cuantizaciones con imatrix (weighted): el autor indica que no están disponibles y que podrían no publicarse; las IQ-quants con imatrix suelen ofrecer mejor perplejidad a igual tamaño.
- Advertencia de producción: el repositorio tiene muy poca tracción (220 descargas, 1 like) y no incluye evaluación; conviene validar el modelo en el dominio propio antes de desplegarlo.
- El repositorio ocupa 224 GB; descargar todas las cuantizaciones es innecesario, basta con el fichero GGUF elegido.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Cybus-Qwen3-32B-v2-agentic-GGUF
- Modelo base: https://huggingface.co/squaredcuber/Cybus-Qwen3-32B-v2-agentic
- Fichero Q4_K_M: https://huggingface.co/mradermacher/Cybus-Qwen3-32B-v2-agentic-GGUF/blob/main/Cybus-Qwen3-32B-v2-agentic.Q4_K_M.gguf
- Página de descargas del autor: https://hf.tst.eu/model#Cybus-Qwen3-32B-v2-agentic-GGUF
- Discusiones del repositorio: https://d6108366.hf-mirror.com/mradermacher/Cybus-Qwen3-32B-v2-agentic-GGUF/discussions
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Ficha en Antbase: https://antbase.ai/models/cybus-qwen3-32b-v2-agentic
- Guía de despliegue local de Qwen3-32B en 24 GB: https://baeseokjae.github.io/posts/qwen-3-32b-local-guide-2026/
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
