# bartowski/KORMo-VL_KORMo-Web-9B-GGUF

## Resumen

KORMo-Web-9B es un modelo multimodal (image-text-to-text) de aproximadamente 9.000 millones de parámetros, especializado en tareas de agente web, GUI-agent y computer-use. Está desarrollado por KORMo-VL y esta ficha cubre la cuantización GGUF publicada por bartowski. El modelo acepta entradas de texto e imagen, lo que le permite interpretar capturas de pantalla de navegadores e interfaces gráficas para ejecutar acciones sobre ellas, un caso de uso cada vez más demandado en automatización de flujos web y agentes autónomos.

La relevancia de esta publicación reside en que traslada un modelo de 9B orientado a agentes web al ecosistema llama.cpp mediante cuantizaciones imatrix, lo que permite ejecutarlo en hardware de consumo. El modelo base declara soporte para coreano e inglés, con una licencia Apache 2.0 que facilita el uso comercial. La cuantización fue generada con llama.cpp b12412 e incluye fichero mmproj para el procesamiento de imágenes.

Al tratarse de una cuantización, las especificaciones de arquitectura y entrenamiento del modelo original no se detallan en la información disponible; esta ficha se centra en los datos verificables de la publicación GGUF y en las capacidades declaradas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal image-text-to-text, pesos cuantizados con llama.cpp) |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, IQ4_NL, Q4_K_S, Q4_0, IQ4_XS (y otras del repo) |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con fichero mmproj para visión) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base KORMo-Web-9B en los datos proporcionados. La model card de la cuantización describe únicamente el proceso de conversión: pesos del checkpoint original cuantizados con llama.cpp (release b12412) usando imatrix, y soporte de entrada de texto e imagen mediante un fichero mmproj separado. No se indica decodificación especulativa (el autor la marca explícitamente como "no").

Tampoco se detallan el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. Los tags del repositorio (gui-agent, web-agent, computer-use, browser) sugieren un entrenamiento orientado a interacción con navegadores e interfaces, pero no se aportan cifras ni metodología. Cualquier dato de entrenamiento debe consultarse en la model card del modelo base.

## Capacidades

- Generación de texto conversacional con formato de chat ChatML (`<|im_start|>` / `<|im_end|>`).
- Procesamiento de imagen junto con texto (image-text-to-text), habilitado mediante el fichero mmproj; orientado a interpretar capturas de pantalla e interfaces.
- Soporte de tool calling / function calling con un formato XML específico (`<tool_call>`, `<function=...>`, `<parameter=...>`).
- Modo de razonamiento previo a la respuesta mediante bloque `<think>`.
- Capacidades de agente web y computer-use: el modelo está etiquetado para tareas de navegación y control de interfaz gráfica.
- Multilingüe limitado a coreano e inglés.
- No se declara soporte de audio ni otras modalidades.

## Casos de uso

- Automatización de navegación web: el modelo puede recibir capturas de pantalla de una página y generar acciones o llamadas a herramientas para rellenar formularios, hacer clic o extraer datos, gracias a su combinación de visión y tool calling.
- Agentes de computer-use: integración en pipelines que controlan aplicaciones de escritorio interpretando la interfaz visual y emitiendo comandos estructurados.
- Testing automatizado de interfaces: generación de secuencias de interacción sobre una GUI para validar flujos de usuario en CI/CD.
- Asistentes de atención al cliente en coreano e inglés: conversaciones multi-turno con formato ChatML, con razonamiento explícito en el bloque `<think>` antes de responder.
- Extracción de información de capturas y documentos visuales: uso del pipeline image-text-to-text para transcribir y estructurar contenido de imágenes.
- Orquestación de herramientas en backoffice: el soporte de function calling permite conectar el modelo a APIs internas (consultas, actualizaciones) con un formato de llamada bien definido.
- Despliegue local en hardware de consumo: al estar cuantizado en GGUF, puede ejecutarse con llama.cpp u Ollama en equipos sin GPU de datacenter para prototipos de agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin contar KV cache ni mmproj): ~5,2 GB (IQ4_XS), ~5,8 GB (Q4_K_M), ~6,9 GB (Q5_K_M), ~7,8 GB (Q6_K), ~9,5 GB (Q8_0), ~17,9 GB (bf16).
- El fichero mmproj de visión añade consumo adicional de memoria no cuantificado en la información disponible.
- GPU recomendadas: no especificadas por el autor. Por tamaño, Q4_K_M y Q5_K_M caben en GPUs de consumo con 8-12 GB de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070). Q8_0 requiere ~12 GB o más; bf16 requiere GPUs de 24 GB o superiores (RTX 4090, A100, H100).
- Cabe en GPU de consumo en cuantizaciones Q4 y Q5; las variantes Q6 y Q8 requieren GPUs de gama alta o mayor VRAM.
- Opciones de despliegue: llama.cpp (versión b12412 o superior), Ollama, y cualquier runtime compatible con GGUF. El repositorio está marcado como `endpoints_compatible`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones del modelo base que permitan una comparación rigurosa con alternativas de la misma categoría. A continuación se indica lo que puede afirmarse con la información disponible:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| KORMo-Web-9B (esta ficha, GGUF) | ~9B | no disponible | Apache 2.0 | GGUF | Agente web/GUI, ko/en, visión |
| Alternativas de agente web de tamaño similar | no disponible | no disponible | no disponible | no disponible | Sin datos en la información proporcionada |

## Limitaciones y advertencias

- Idiomas limitados a coreano e inglés; el rendimiento en castellano no está garantizado ni documentado.
- No se han publicado benchmarks, por lo que el rendimiento real en tareas de agente web no puede verificarse con datos.
- Riesgo de alucinación inherente a los modelos generativos, especialmente crítico en acciones de agente que modifican estado (clics, envíos de formularios).
- El formato de tool calling es específico y requiere respetar estrictamente las etiquetas XML; un parseo laxo puede provocar fallos en producción.
- El uso de visión depende de cargar correctamente el fichero mmproj; sin él, el modelo solo procesa texto.
- No se dispone de información sobre sesgos del modelo base.
- Aunque la licencia es Apache 2.0, conviene verificar la model card del modelo base KORMo-Web-9B por si hubiera condiciones adicionales.
- Las cuantizaciones de baja precisión (Q4_0, IQ4_XS) pueden degradar la fiabilidad del razonamiento y del tool calling en tareas de agente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bartowski/KORMo-VL_KORMo-Web-9B-GGUF
- Modelo base: https://huggingface.co/KORMo-VL/KORMo-Web-9B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Release de llama.cpp usado: https://github.com/ggml-org/llama.cpp/releases/tag/b12412
- Cuantización recomendada (Q4_K_M): https://huggingface.co/bartowski/KORMo-VL_KORMo-Web-9B-GGUF/blob/main/KORMo-VL_KORMo-Web-9B-Q4_K_M.gguf
