# mradermacher/Climb-1.2-Photon-GGUF

## Resumen

Climb-1.2-Photon es un modelo de lenguaje de 752 millones de parámetros (aproximadamente 0,75 mil millones) especializado en tareas de terminal Linux, shell bash y operaciones de línea de comandos (CLI). Desarrollado originalmente por Climb-Ai y distribuido en formato GGUF por mradermacher, el modelo se presenta como un asistente tipo copilot para entornos de terminal, orientado a la generación y comprensión de comandos y flujos de trabajo en sistemas Unix.

La ficha que nos ocupa corresponde a la versión cuantizada en GGUF del modelo base `Climb-Ai/Climb-1.2-Photon`, publicada por mradermacher el 20 de noviembre de 2026. El repositorio incluye un conjunto de cuantizaciones estáticas que van desde Q2_K (0,5 GB) hasta f16 (1,6 GB), lo que facilita su despliegue en hardware modesto y su integración en herramientas de inferencia local como llama.cpp u Ollama.

El modelo está etiquetado con el tag `qwen3_5`, lo que sugiere que su arquitectura deriva de la familia Qwen 3.5, aunque no se dispone de confirmación oficial en la información proporcionada. Su licencia Apache 2.0 y su reducido tamaño lo hacen relevante para desarrolladores que necesitan un asistente de terminal ligero, ejecutable en CPU o en GPUs de consumo, sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen 3.5, segun el tag `qwen3_5`; no confirmado oficialmente) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ruso (ru), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la información proporcionada. El tag `qwen3_5` sugiere que el modelo base podría estar construido sobre la arquitectura de la familia Qwen 3.5, pero no se confirma en la model card. El tamaño de 752 millones de parámetros es coherente con un transformer decoder-only de escala pequeña, adecuado para inferencia en dispositivos con recursos limitados.

Tampoco se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste fino supervisado. Las etiquetas del repositorio (`linux`, `bash`, `terminal`, `cli`, `copilot`) indican que el modelo fue entrenado o ajustado específicamente para tareas de línea de comandos, pero no se detalla la metodología. No se han identificado innovaciones técnicas destacables (decodificación especulativa, atención lineal, etc.) en la información disponible.

## Capacidades

- Generación de comandos de terminal Linux y bash: el modelo está especializado en producir comandos y secuencias de comandos para entornos Unix.
- Asistencia tipo copilot en CLI: puede sugerir comandos, explicar su funcionamiento y ayudar en flujos de trabajo de terminal.
- Comprensión de instrucciones en inglés y ruso: los idiomas declarados son `en` y `ru`.
- Conversación multi-turno: la etiqueta `conversational` indica soporte para diálogo.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede desplegarse en infraestructuras de inferencia compatibles con la API de Hugging Face.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código general, visión o audio.

## Casos de uso

- Asistente de terminal para desarrolladores: el modelo puede generar y explicar comandos bash y utilidades de Linux, integrándose en herramientas de línea de comandos para sugerir comandos según la intención del usuario. Su tamaño reducido permite ejecutarlo localmente sin latencia de red.
- Automatización de scripts de administración de sistemas: puede ayudar a redactar scripts de shell para tareas repetitivas (gestión de ficheros, permisos, procesos), adecuado por su especialización en bash y CLI.
- Copilot en editores y terminales integrados: al ser compatible con endpoints y estar en formato GGUF, puede desplegarse como servicio local que alimente extensiones de editor o terminales inteligentes.
- Formación y documentación técnica: puede explicar comandos y flujos de terminal a usuarios noveles, aprovechando su entrenamiento orientado a CLI.
- Soporte en entornos con recursos limitados: al caber en cuantizaciones de 0,5 a 0,9 GB, puede ejecutarse en CPUs y GPUs de gama baja, lo que lo hace apto para dispositivos embebidos o estaciones de trabajo modestas.
- Procesamiento de texto bilingüe inglés-ruso en contextos técnicos: útil para equipos que operan en ambos idiomas en tareas de administración de sistemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,5 GB (Q2_K) y 1,6 GB (f16) según la cuantización; en la práctica, se recomienda al menos 1 GB de VRAM o RAM para las cuantizaciones Q4_K_M y superiores.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar las cuantizaciones más pequeñas; GPUs de consumo como RTX 3060, RTX 4060 o superiores son suficientes. Para f16, se recomienda al menos 2 GB de VRAM.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs de consumo actuales, e incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; también puede desplegarse vía endpoints compatibles con la API de Hugging Face.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Climb-1.2-Photon (este) | 752 M | no disponible | Apache 2.0 | GGUF, safetensors | Hugging Face |
| Qwen2.5-Coder-0.5B | 494 M | 32 K (típico en la familia) | Apache 2.0 | safetensors, GGUF | Hugging Face |
| Qwen2.5-Coder-1.5B | 1,5 B | 32 K (típico en la familia) | Apache 2.0 | safetensors, GGUF | Hugging Face |
| StarCoder2-3B | 3 B | 16 K | BigCode OpenRAIL-M | safetensors, GGUF | Hugging Face |

Nota: los datos de contexto y rendimiento de los modelos comparables no se han verificado en la información proporcionada y se indican a título orientativo según el conocimiento general de esas familias; no se dispone de benchmarks comparativos directos con Climb-1.2-Photon.

## Limitaciones y advertencias

- Sesgos conocidos: no se dispone de información sobre sesgos específicos; al ser un modelo pequeño entrenado para CLI, puede reflejar sesgos presentes en sus datos de entrenamiento, no documentados.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar comandos incorrectos o peligrosos; se recomienda revisar siempre los comandos sugeridos antes de ejecutarlos, especialmente en entornos de producción.
- Limitaciones de contexto e idioma: solo se declaran inglés y ruso; no se garantiza un rendimiento adecuado en castellano u otros idiomas. La longitud de contexto no está documentada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, con obligación de incluir el aviso de licencia y la atribución correspondiente.
- Caveats para producción: el modelo tiene 0 descargas y 0 likes en el momento de la ficha, lo que indica una adopción muy limitada; no hay benchmarks publicados ni documentación sobre robustez en producción. La cuantización Q2_K y Q3_K_M pueden degradar la calidad; se recomienda Q4_K_M o superior para uso real.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Climb-1.2-Photon-GGUF
- Modelo base: https://huggingface.co/Climb-Ai/Climb-1.2-Photon
- Página de descargas del cuantizador: https://hf.tst.eu/model#Climb-1.2-Photon-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
