# ProfessorCEO/kora-coder-v1

## Resumen

Kora Coder Engine v1.0 es un modelo de generación de texto orientado a código, publicado por el autor de Hugging Face ProfessorCEO bajo la marca Kontyra Ecosystem. Se presenta como el motor del "DevOS" (un entorno de desarrollo propio del ecosistema Kontyra) y está especializado, según su model card, en síntesis autónoma de aplicaciones web full-stack, diagnóstico de fallos en tiempo real, programación defensiva y despliegues en contenedores cloud. El modelo se distribuye principalmente en formato GGUF con cuantización Q4_K_M, lo que indica que está pensado para inferencia local con llama.cpp u otros runners compatibles con GGUF.

El dato objetivo disponible es su tamaño: 1.543.714.304 parámetros (aproximadamente 1,54 mil millones) según los pesos en safetensors del repositorio, con un tamaño de repo de 1,0 GB. No se especifica la arquitectura base, la longitud de contexto, el volumen de tokens de entrenamiento ni los detalles del dataset en la información proporcionada. La licencia es propietaria ("kpl-1.0", enlazada a kontyra.name.ng/legal) y el único idioma declarado es el inglés.

Su relevancia es limitada y muy específica: se trata de un modelo pequeño (rango 1-2B) empaquetado como herramienta vertical para un ecosistema concreto, no como un modelo generalista de código comparable a las familias establecidas. La ausencia de benchmarks publicados, de documentación técnica sobre el entrenamiento y de un historial de descargas (0 descargas en el momento de la consulta) obliga a tratar cualquier afirmación de capacidad como no verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica en la model card; el nombre "NanoKora Coder Engine" no identifica una arquitectura concreta) |
| Parametros totales | 1.543.714.304 (~1,54B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M en formato GGUF (única cuantización documentada) |
| Idiomas soportados | inglés (en) |
| Licencia | kpl-1.0 (licencia propia, enlace: https://kontyra.name.ng/legal) |
| Formato de pesos | GGUF (binario principal `kora-coder-v1.Q4_K_M.gguf`); el repositorio también contiene safetensors según los metadatos |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo en la documentación disponible. La model card no indica si se trata de un transformer decoder-only denso, si deriva de un modelo base existente, ni si incorpora mecanismos como atención lineal, decodificación especulativa o mezcla de expertos. El único dato estructural fiable es el recuento de parámetros (1.543.714.304), que sitúa al modelo en el rango de 1,5B, coherente con un transformer denso pequeño, pero esto es una inferencia y no un dato confirmado por el autor.

Tampoco hay información sobre el corpus de entrenamiento: no se especifica el número de tokens, la composición del dataset (proporción de código frente a texto, lenguajes de programación cubiertos), ni si se aplicaron fases de ajuste supervisado, RLHF o DPO. Las etiquetas del repositorio ("code", "devos", "sovereign-ai") sugieren un enfoque en código y un discurso de "IA soberana", pero no aportan detalles técnicos verificables. Cualquier evaluación del entrenamiento debe considerarse pendiente de documentación por parte del autor.

## Capacidades

- Generación de texto y código en inglés, según la declaración del autor.
- Síntesis de aplicaciones web full-stack de forma autónoma (afirmación de la model card, sin benchmarks que la respalden).
- Diagnóstico de fallos ("crash diagnosis") en tiempo real, según la especialización declarada.
- Programación defensiva como enfoque de generación de código.
- Generación de artefactos para despliegue en contenedores cloud (declarado, sin detalles sobre el formato de salida).
- Conversación multi-turno: la etiqueta "conversational" aparece en los metadatos del repositorio.
- Tool calling / function calling: no disponible (no se menciona en la documentación).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad documentada; el término "autonomous" de la model card no va acompañado de especificación técnica.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo "thinking" explícito: no disponible.

## Casos de uso

- Asistencia a desarrolladores dentro del ecosistema Kontyra/DevOS: el modelo está diseñado como motor de ese entorno concreto, por lo que su uso natural es la generación y corrección de código dentro de esa plataforma, donde el autor controla el formato de prompts y las herramientas asociadas.
- Generación de esqueletos de aplicaciones web full-stack: según la especialización declarada, podría emplearse para producir estructuras iniciales de frontend y backend; conviene validar la calidad real con pruebas propias dado que no hay benchmarks.
- Diagnóstico de errores en pipelines de desarrollo: la model card menciona "real-time crash diagnosis"; un uso realista sería analizar trazas de error y proponer correcciones en un flujo de CI, siempre con revisión humana.
- Generación de Dockerfiles y manifiestos de despliegue: la especialización en "cloud container deployments" sugiere su uso para producir artefactos de contenedor, una tarea acotada y verificable que encaja con un modelo de 1,5B.
- Inferencia local en estaciones de trabajo modestas: al distribuirse en GGUF Q4_K_M (~1 GB de pesos), puede ejecutarse en CPU o en GPUs de consumo para tareas de autocompletado y asistencia offline, sin depender de servicios en la nube.
- Prototipado de asistentes de código en inglés: para equipos que trabajan en inglés y necesitan un modelo pequeño integrable con llama.cpp u Ollama en entornos con recursos limitados.
- Experimentación académica sobre modelos pequeños especializados: su tamaño permite fine-tuning y evaluación en hardware asequible, aunque la licencia kpl-1.0 debe revisarse antes de cualquier uso derivado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y no existen datos de latencia o throughput medidos de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0-1,5 GB con la cuantización Q4_K_M documentada (pesos de ~1 GB más overhead de contexto y caché KV); en FP16 serían necesarios unos 3,1 GB solo para pesos (2 bytes por parámetro sobre 1,54B).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q4_K_M; una RTX 3060, RTX 4060 o superior es más que suficiente. Para FP16, una GPU con 6-8 GB (RTX 3060 Ti, RTX 4060 Ti) bastaría.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs de consumo actuales e incluso en iGPU con memoria unificada suficiente.
- Ejecución en CPU: viable con llama.cpp gracias al formato GGUF; un modelo de 1,5B en Q4_K_M es manejable en CPU moderna con velocidades de decodificación interactivas, aunque no se han publicado cifras oficiales.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) son los runners naturales para el GGUF publicado; vLLM y TGI requerirían los pesos en safetensors y compatibilidad de arquitectura, no confirmada. El tag "endpoints_compatible" del repositorio sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput estimados: no disponibles (no hay mediciones publicadas).

## Comparativa con modelos similares

La comparación se limita a modelos pequeños de código ampliamente documentados; los datos de Kora Coder v1 provienen solo de sus metadatos, por lo que las columnas de rendimiento no son equiparables.

| Modelo | Parametros | Contexto | Licencia | Benchmark publico | Disponibilidad |
|---|---|---|---|---|---|
| Kora Coder Engine v1.0 | ~1,54B | no disponible | kpl-1.0 (propietaria) | no disponible | GGUF en HF, 0 descargas |
| Qwen2.5-Coder-1.5B | 1,5B | 32K (128K en variantes mayores) | Apache 2.0 | sí (HumanEval, MBPP, etc.) | amplia, múltiples formatos |
| DeepSeek-Coder-1.3B | 1,3B | 16K | licencia propia permisiva con condiciones | sí | amplia, múltiples formatos |
| StarCoder2-3B | 3B | 16K | BigCode OpenRAIL-M | sí | amplia, múltiples formatos |

Kora Coder v1.0 se posiciona en el mismo rango de tamaño que Qwen2.5-Coder-1.5B y DeepSeek-Coder-1.3B, pero carece de la documentación de entrenamiento, los benchmarks y la claridad de licencia de esas alternativas, lo que dificulta justificar su elección frente a ellas en un proyecto real.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de su calidad en generación de código, razonamiento o matemáticas; las capacidades declaradas en la model card no están verificadas.
- Documentación técnica mínima: se desconoce la arquitectura, el dataset, el contexto máximo y el proceso de alineación, lo que impide evaluar riesgos de sesgo o de contaminación de datos.
- Licencia propietaria kpl-1.0: es una licencia propia con condiciones no resumidas en la model card; es imprescindible leer https://kontyra.name.ng/legal antes de cualquier uso comercial o de redistribución.
- Solo inglés: no hay soporte declarado de castellano ni de otros idiomas, lo que limita su uso en entornos hispanohablantes sin trabajo adicional.
- Riesgo de alucinación: como cualquier modelo de 1,5B sin evaluación publicada, es esperable que genere APIs, funciones y dependencias inexistentes; requiere verificación humana y tests automatizados en producción.
- Contexto desconocido: sin longitud de contexto documentada, no se puede planificar su uso en tareas que requieran ventanas largas (repositorios completos, conversaciones extensas).
- Madurez del proyecto: 0 descargas y un solo "like" en el momento de la consulta; no hay evidencia de mantenimiento, comunidad ni soporte.
- Uso en producción no recomendado sin evaluación previa: al no existir métricas ni auditorías, su integración en pipelines críticos debe precederse de una evaluación propia sobre el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ProfessorCEO/kora-coder-v1
- Licencia kpl-1.0: https://kontyra.name.ng/legal
- Ecosistema Kontyra: https://kontyra.name.ng
- DevOS: https://devos.kontyra.name.ng
