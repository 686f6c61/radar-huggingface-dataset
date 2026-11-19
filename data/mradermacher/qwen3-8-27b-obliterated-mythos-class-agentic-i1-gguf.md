# mradermacher/Qwen3.8-27B-OBLITERATED-Mythos-Class-Agentic-i1-GGUF

## Resumen

Qwen3.8-27B-OBLITERATED-Mythos-Class-Agentic-i1-GGUF es una cuantización en formato GGUF del modelo medismera/Qwen3.8-27B-OBLITERATED-Mythos-Class-Agentic, publicada por mradermacher, un cuantizador habitual de la comunidad de Hugging Face. El modelo base es un derivado de la familia Qwen3.8 con 27.320.697.856 parámetros (unos 27,3 mil millones), orientado a tareas agénticas con soporte explícito de tool calling y function calling, y con un proceso de "abliteration" que elimina las capas de rechazo del modelo original. La licencia declarada es Apache 2.0.

La versión i1 se distingue de las cuantizaciones estáticas del mismo autor por el uso de un fichero imatrix para calibrar la cuantización, lo que mejora la calidad de los cuantos de baja precisión. El repositorio incluye cuantizaciones desde Q2_K (11,0 GB) hasta Q6_K (22,5 GB), lo que permite desplegar el modelo en hardware muy diverso, desde estaciones de trabajo con GPUs de consumo hasta servidores con aceleradores profesionales.

El modelo es relevante ahora porque combina tres tendencias del ecosistema abierto: modelos agénticos con soporte nativo de herramientas, arquitecturas híbridas con atención lineal y Mamba (según los tags del repositorio), y la demanda de variantes sin censura para investigación y despliegues que requieren control total sobre el comportamiento del modelo. Su tamaño de 27B lo sitúa en un punto intermedio entre los modelos de 7-14B, que se quedan cortos en razonamiento complejo, y los de 70B+, que exigen hardware de servidor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal y Mamba (según tags del repositorio); detalles exactos no disponibles |
| Parámetros totales | 27.320.697.856 (27,3B) |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (con imatrix) |
| Idiomas soportados | Inglés (en), chino (zh), árabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1); el modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de los tags del repositorio, que mencionan "mamba" y "linear-attention", lo que sugiere una arquitectura híbrida que combina capas de atención tradicional con capas de atención lineal y posiblemente bloques tipo Mamba para reducir el coste computacional en contextos largos. Los tags también indican soporte para "sglang", "vllm", "fp8" y "awq", lo que apunta a un modelo pensado para despliegue en producción con frameworks de inferencia de alto rendimiento.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El término "OBLITERATED" en el nombre indica que el modelo ha pasado por un proceso de abliteration, una técnica que identifica y elimina las direcciones de activación asociadas a la negativa a responder, de modo que el modelo deja de rechazar peticiones que el modelo original rechazaría. Los tags "mythos-class", "task-tree" y "hermes-agent" sugieren un entrenamiento orientado a tareas agénticas con planificación jerárquica, aunque no se aportan detalles técnicos sobre estos procesos.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con cadena de pensamiento (tag "cot").
- Generación y razonamiento sobre código (tag "coding").
- Soporte de tool calling y function calling (tags "tool-calling", "function-calling").
- Comportamiento agéntico con planificación multi-paso (tags "agentic", "hermes-agent", "task-tree").
- Capacidad de visión: el autor indica que es un modelo de visión y que los ficheros mmproj, si existen, están en el repositorio estático.
- Multilingüe en inglés, chino y árabe.
- Variante sin censura (abliterated) que no aplica rechazos por defecto.
- Compatibilidad con endpoints (tag "endpoints_compatible").
- Soporte de despliegue en SGLang y vLLM, y cuantización FP8 y AWQ según los tags.

## Casos de uso

- Agentes autónomos de resolución de tareas: el modelo puede encadenar llamadas a herramientas y planificar subtareas gracias a su entrenamiento orientado a "task-tree" y "hermes-agent", lo que lo hace adecuado para orquestadores de agentes que necesitan descomponer objetivos complejos en pasos ejecutables.
- Asistentes de programación en IDE: con soporte de tool calling y razonamiento sobre código, puede integrarse en extensiones que consultan documentación, ejecutan tests y proponen parches dentro de un bucle agéntico.
- Automatización de flujos de trabajo con APIs: su capacidad de function calling permite mapear intenciones del usuario a llamadas concretas a servicios externos, con validación de parámetros y manejo de errores en varios pasos.
- Investigación sobre alineación y seguridad: al ser una variante abliterated, es útil para estudiar el comportamiento de modelos sin capas de rechazo, comparar respuestas con el modelo original y analizar sesgos residuales en entornos controlados.
- Procesamiento de documentación técnica multilingüe: con soporte de inglés, chino y árabe, puede resumir y extraer información de documentación en esos idiomas, aunque no cubre el castellano de forma nativa.
- Despliegue en hardware de consumo: las cuantizaciones i1-Q4_K_M (16,9 GB) permiten ejecutar el modelo en GPUs con 24 GB de VRAM, lo que facilita prototipado local sin depender de infraestructura cloud.
- Análisis de imágenes en pipelines de inspección: si se dispone del fichero mmproj del repositorio estático, el modelo puede procesar imágenes junto con texto para tareas de descripción o extracción de información.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del fichero GGUF más el overhead de contexto. Para i1-Q4_K_M (16,9 GB) se necesitan unos 18-20 GB con contexto moderado; para i1-Q6_K (22,5 GB) se necesitan unos 24-26 GB.
- GPU recomendadas: A100 40GB o 80GB, H100 80GB para despliegue en FP16/BF16 o con contexto largo; RTX 4090 (24 GB) para cuantizaciones Q4 y Q5; RTX 3090 (24 GB) para Q4.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y RTX 4080 (16 GB) solo con cuantizaciones Q3 o inferiores, con riesgo de degradación de calidad.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM y SGLang para el modelo base en FP16/BF16 o FP8; TGI no está confirmado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-OBLITERATED-Mythos-Class-Agentic-i1-GGUF | 27,3B | No disponible | Apache 2.0 | GGUF | Variante abliterated agéntica, cuantizada con imatrix |
| Qwen3-32B (referencia de la familia) | 32B | No disponible en esta ficha | Apache 2.0 | Safetensors, GGUF | Modelo base de la familia, sin abliteration |
| Modelos de 27-32B de la familia Llama | 27-32B | No disponible en esta ficha | Licencia Llama | Safetensors, GGUF | No dispone de variante abliterated oficial |

La comparativa se limita a estos tres por falta de datos verificables sobre benchmarks y contexto en la información proporcionada; no se dispone de resultados comparativos de rendimiento.

## Limitaciones y advertencias

- El proceso de abliteration elimina los rechazos, lo que implica que el modelo puede generar contenido dañino, ilegal o éticamente problemático sin filtro; no es adecuado para aplicaciones de cara al público sin capas de moderación adicionales.
- Riesgo de alucinación inherente a los modelos de 27B, especialmente en tareas de razonamiento largo y en idiomas distintos del inglés.
- Cobertura lingüística limitada a inglés, chino y árabe; no hay soporte declarado de castellano, lo que puede degradar la calidad en ese idioma.
- La longitud de contexto no está documentada, lo que impide planificar despliegues con ventanas largas sin pruebas previas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y la variante abliterated pueden arrastrar obligaciones adicionales no documentadas; conviene revisar la licencia del modelo base medismera antes de producción.
- Las cuantizaciones de baja precisión (Q2, Q3) degradan notablemente la calidad; para producción se recomienda Q4_K_M o superior.
- El repositorio ocupa 218,6 GB, lo que exige planificar el almacenamiento y la descarga por partes.
- No se dispone de información sobre sesgos específicos ni de evaluaciones de seguridad del modelo abliterated.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-OBLITERATED-Mythos-Class-Agentic-i1-GGUF
- Modelo base: https://huggingface.co/medismera/Qwen3.8-27B-OBLITERATED-Mythos-Class-Agentic
- Cuantizaciones estáticas del mismo autor: https://huggingface.co/mradermacher/Qwen3.8-27B-OBLITERATED-Mythos-Class-Agentic-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-OBLITERATED-Mythos-Class-Agentic-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
