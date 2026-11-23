# hossain0909/Keural-Cortex-8B-v1.0

## Resumen

Keural Cortex 8B v1.0 es un modelo de lenguaje de 8.190.735.360 parámetros desarrollado por el usuario hossain0909 y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un ajuste del modelo base Qwen3-8B-Base, sobre el que se ha aplicado entrenamiento continuado, ajuste por instrucciones, optimización de preferencias y un ajuste específico para contratos de herramientas y agentes, orientado a flujos de trabajo empresariales bilingües coreano-inglés.

El modelo emplea una arquitectura transformer decoder-only de 36 capas, con un tamaño oculto de 4.096, 32 cabezas de atención y 8 cabezas KV (GQA), y un vocabulario de 151.936 tokens. El límite de posición configurado es de 65.536 tokens, aunque la propia model card advierte que existen limitaciones medidas en la evaluación de contexto. Los pesos se distribuyen en formato BF16 SafeTensors, con un tamaño de repositorio de aproximadamente 16,4 GB.

Su relevancia radica en que combina un tamaño contenido (8B) apto para despliegue local, soporte nativo de function calling y agentes, y una licencia permisiva (Apache 2.0) que facilita su uso comercial. No obstante, la propia documentación reconoce que los resultados de benchmarks son mixtos frente al modelo base y que no se ha realizado una evaluación independiente del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only; 36 capas |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.536 tokens configurados; limitaciones medidas en evaluación de contexto |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | Coreano (ko) e inglés (en) |
| Licencia | Apache 2.0, con avisos upstream aplicables |
| Formato de pesos | SafeTensors (BF16, ~16 GB) |

Especificaciones adicionales: tamaño oculto de 4.096, 32 cabezas de atención y 8 cabezas KV (GQA), vocabulario de 151.936 tokens. Modelo base: Qwen3-8B-Base.

## Arquitectura y entrenamiento

Keural Cortex 8B v1.0 parte de Qwen3-8B-Base, un transformer decoder-only de 36 capas con atención de consultas agrupadas (GQA, 32 cabezas de atención y 8 cabezas KV) y un tamaño oculto de 4.096. Sobre esta base se aplicó un proceso de adaptación en varias fases: entrenamiento continuado, ajuste por instrucciones (instruction tuning), optimización de preferencias y un ajuste específico para contratos de herramientas y agentes (agent/tool-contract tuning) orientado a los flujos de trabajo de Keural.

La model card no proporciona detalles sobre el número de tokens de entrenamiento, la composición del dataset ni los algoritmos concretos de RLHF o DPO empleados. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. El modelo está diseñado para que la aplicación anfitriona ejecute las herramientas y controle el acceso, mientras el modelo se limita a generar respuestas propuestas y llamadas a herramientas estructuradas.

## Capacidades

- Generación de texto conversacional en coreano e inglés.
- Razonamiento y respuesta a instrucciones tras el ajuste por instrucciones y optimización de preferencias.
- Generación de llamadas a funciones estructuradas para herramientas como `search_web`, `fetch_web_urls`, `retrieve_documents` y `ask_clarification`, siempre que la aplicación las proporcione.
- Soporte de flujos de agentes y razonamiento multi-paso mediante contratos de herramientas definidos por la aplicación.
- Capacidades matemáticas básicas (evaluado en GSM8K).
- Capacidades multilingües limitadas a coreano e inglés.
- No dispone de visión, audio ni modo de pensamiento (thinking mode) documentado.
- El modelo no navega por la web, no accede a documentos privados ni ejecuta acciones externas por sí mismo; depende del stack de servicio y del contrato de la aplicación.

## Casos de uso

- Asistentes bilingües coreano-inglés en infraestructura controlada por el cliente: el modelo gestiona conversaciones multi-turno en ambos idiomas y puede desplegarse localmente detrás de un endpoint compatible con OpenAI, lo que encaja en entornos con requisitos de soberanía de datos.
- Generación de llamadas a herramientas en asistentes empresariales: con el ajuste específico para contratos de herramientas, el modelo propone invocaciones estructuradas a `search_web`, `fetch_web_urls`, `retrieve_documents` y `ask_clarification`, que la aplicación valida y ejecuta con control de autorización.
- Automatización de atención al cliente: puede gestionar diálogos multi-turno con contexto de hasta 65.536 tokens configurados, adecuado para hilos de soporte largos, aunque con cautela por las limitaciones de contexto medidas.
- Recuperación aumentada (RAG) en documentación interna: el modelo puede generar consultas de recuperación y sintetizar respuestas a partir de documentos recuperados, siempre que la aplicación gestione el acceso y la validación del esquema.
- Asistencia a desarrolladores en entornos coreano-inglés: generación de código y explicaciones técnicas, con soporte de function calling para integrarse en pipelines de herramientas internas.
- Despliegue local en hardware de gama media: al ser un modelo de 8B en BF16 (~16 GB), puede servirse en una sola GPU profesional o en configuraciones cuantizadas en GPUs de consumo, lo que facilita prototipado y evaluación interna.
- Evaluación y ajuste fino posterior: al estar bajo Apache 2.0 y en formato SafeTensors, puede reentrenarse o adaptarse a dominios específicos sin restricciones de licencia comercial.

## Benchmarks y rendimiento

La model card reporta evaluaciones realizadas el 10 de noviembre de 2026 sobre 39 de 39 trabajos y 14.340 escenarios, comparando con Qwen3-8B-Base (no con la versión instruction-tuned). Son benchmarks muestreados y diagnósticos sintéticos, no un envío completo a leaderboards. El repositorio no fue evaluado de forma independiente; se verificó que sus pesos, tokenizador, plantilla de chat y configuración de inferencia eran idénticos a la exportación evaluada `mkd-hossain` v1.0.

Benchmarks en coreano (50 preguntas sembradas por subtarea; 2.700 preguntas por modelo):

| Benchmark | Cortex v1.0 | Qwen3-8B-Base | Diferencia |
|---|---:|---:|---:|
| KMMLU (media 45 asignaturas) | 56,93% | 57,24% | -0,31 pp |
| HAE-RAE (media 5 subtareas) | 64,00% | 64,40% | -0,40 pp |
| KoBEST BoolQ | 40,00% | 48,00% | -8,00 pp |
| KoBEST COPA | 74,00% | 68,00% | +6,00 pp |
| KoBEST HellaSwag | 66,00% | 62,00% | +4,00 pp |
| KoBEST SentiNeg | 92,00% | 86,00% | +6,00 pp |

Benchmarks en inglés y matemáticas (50 preguntas sembradas por subtarea; 3.050 preguntas por modelo):

| Benchmark | Cortex v1.0 | Qwen3-8B-Base | Diferencia |
|---|---:|---:|---:|
| MMLU (media 57 asignaturas) | 78,95% | 78,63% | +0,32 pp |
| HellaSwag | 66,00% | 66,00% | 0,00 pp |
| ARC-Challenge | 52,00% | 58,00% | -6,00 pp |
| WinoGrande | 74,00% | 76,00% | -2,00 pp |
| GSM8K | 86,00% | 84,00% | +2,00 pp |

Los resultados son mixtos: mejoras en COPA, HellaSwag y SentiNeg en coreano, y en MMLU y GSM8K en inglés/matemáticas; descensos en BoolQ, ARC-Challenge y WinoGrande; KMMLU y HAE-RAE ligeramente por debajo del base. La model card advierte que estos resultados no establecen superioridad amplia ni significancia estadística.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16,4 GB solo para los pesos, más overhead de activaciones y caché KV, por lo que se recomienda al menos 20-24 GB de VRAM.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX A6000 para despliegue en BF16 sin cuantizar.
- Cabe en GPU de consumo: sí, en configuraciones cuantizadas (por ejemplo, 8 bits o 4 bits) en GPUs como RTX 4090 (24 GB) o RTX 3090 (24 GB); en BF16 requiere al menos 24 GB y puede quedar justo.
- Opciones de despliegue: compatible con `transformers`, `text-generation-inference` (TGI) y endpoints compatibles con OpenAI según los tags del repositorio; no se documentan explícitamente vLLM, llama.cpp u Ollama, aunque al ser un transformer estándar en SafeTensors podría adaptarse.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Keural Cortex 8B v1.0 | 8,19B | 65.536 configurados | Apache 2.0 | ko, en | Ajuste de Qwen3-8B-Base con tuning de agentes/herramientas |
| Qwen3-8B-Base | ~8B | no disponible en la información | no disponible en la información | multilingüe | Modelo base de referencia; los benchmarks comparan contra esta versión |
| Qwen3-8B (instruction-tuned) | ~8B | no disponible en la información | no disponible en la información | multilingüe | Versión con ajuste por instrucciones de Qwen; no es el baseline usado en la evaluación |

No se dispone de datos de benchmarks de otras alternativas en la información proporcionada, por lo que la comparación de rendimiento se limita a las cifras frente a Qwen3-8B-Base recogidas en la sección anterior.

## Limitaciones y advertencias

- Resultados de benchmarks mixtos frente al modelo base: descensos en BoolQ (-8 pp), ARC-Challenge (-6 pp) y WinoGrande (-2 pp), y ligeros descensos en KMMLU y HAE-RAE.
- La evaluación es muestreada y con diagnósticos sintéticos; no constituye un envío completo a leaderboards ni demuestra significancia estadística.
- El repositorio no fue evaluado de forma independiente; la equivalencia con la exportación evaluada se verificó solo por pesos, tokenizador, plantilla de chat y configuración de inferencia.
- Riesgo de alucinación: no documentado explícitamente, pero inherente a modelos de 8B; la model card insiste en que la aplicación debe validar esquemas y controlar el acceso.
- Limitaciones de contexto: el límite configurado es de 65.536 tokens, pero la model card remite a la evaluación de contexto para limitaciones medidas, sin detallarlas.
- Cobertura idiomática limitada a coreano e inglés; no se garantiza rendimiento en otros idiomas.
- El modelo no ejecuta herramientas, no navega por la web ni accede a documentos privados por sí mismo; requiere que la aplicación anfitriona implemente autorización, validación de esquemas y registro de auditoría.
- Licencia Apache 2.0 con avisos upstream aplicables; conviene revisar las condiciones heredadas de Qwen3-8B-Base para uso comercial.
- Sesgos conocidos: no documentados en la información proporcionada.
- Para producción, se recomienda evaluar en los propios datos y requisitos de seguridad y rendimiento, tal como indica el autor.

## Enlaces

- Hugging Face: https://huggingface.co/hossain0909/Keural-Cortex-8B-v1.0
- Modelo base Qwen3-8B-Base: https://huggingface.co/Qwen/Qwen3-8B-Base
- No se han proporcionado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
