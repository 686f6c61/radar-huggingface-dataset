# AIArchiveInfo/TeleChat2-3B

## Resumen

TeleChat2-3B es un modelo de lenguaje de 3.000 millones de parámetros desarrollado por el Instituto de Inteligencia Artificial de China Telecom (TeleAI), presentado el 8 de noviembre de 2024 junto con las variantes de 7B y 35B. Se trata de un transformer decoder-only con atención multi-cabeza, embeddings rotatorios, activación SwiGLU y normalización RMSNorm, entrenado íntegramente sobre hardware y frameworks de desarrollo nacionales chinos, e incluye soporte explícito de llamada a funciones (function calling) optimizado frente a modelos del mismo tamaño. La ficha que se describe aquí corresponde a una copia espejo byte a byte (`AIArchiveInfo/TeleChat2-3B`) del repositorio original `Tele-AI/TeleChat2-3B`, en la revisión `b364de9538e1`, archivada el 25 de septiembre de 2026 por AIArchive.

El modelo resuelve tareas de generación de texto, razonamiento, matemáticas y código, con especial énfasis en el ámbito chino: obtiene 75 en C-Eval y 73 en CMMLU, y 72,9 en MMLU para el caso inglés. Su interés actual reside en que es una de las pocas familias de pesos abiertos entrenadas fuera del ecosistema NVIDIA/CUDA habitual y con licencia Apache 2.0, lo que facilita su uso comercial y su inspección. La relevancia de este repositorio concreto es de preservación a largo plazo: el espejo no modifica pesos ni tokenizador y mantiene la licencia original.

La información disponible no detalla la longitud de contexto, los tipos de cuantización publicados ni el número exacto de tokens de entrenamiento para la variante de 3B, por lo que esos datos se marcan como no disponibles a lo largo de la ficha. El repositorio ocupa 6,1 GB y requiere cargar código personalizado (`trust_remote_code=True`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con RoPE, SwiGLU y RMSNorm pre-normalización |
| Parametros totales | 3.000 millones (designación del modelo; configuración de 24 capas, hidden 3072, FFN 6144, 24 cabezas) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo incluye los pesos originales; la conversión a GGUF, AWQ o GPTQ correría por cuenta del usuario) |
| Idiomas soportados | no disponible en la ficha del modelo; la documentación de la familia menciona corpus de alta calidad en chino e inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de 6,1 GB compatible con PyTorch; requiere `trust_remote_code`) |
| Embeddings de entrada/salida | no compartidos (`tie_word_embeddings = false`) |
| Grouped Query Attention | no (la variante de 3B usa atención multi-cabeza completa; solo la de 115B emplea GQA) |
| Código de referencia | `telechat` (custom_code), compatible con DeepSpeed y FlashAttention2 |
| Tamaño del repositorio | 6,1 GB |
| Revision preservada | `b364de9538e146f7a99519d5ed6c9855f76bfdf0` |

## Arquitectura y entrenamiento

El modelo sigue la estructura estándar decoder-only que TeleAI describe para toda la familia: codificación posicional mediante Rotary Embedding (RoPE), sustitución de GELU por SwiGLU en la capa feed-forward y normalización previa basada en RMSNorm. La variante de 3B tiene 24 capas, dimensión oculta de 3072, dimensión de FFN de 6144 y 24 cabezas de atención, sin GQA y con la capa de embeddings y la cabeza de salida desacopladas para mejorar la estabilidad y la convergencia del entrenamiento. La implementación se distribuye como código personalizado, de modo que su uso en `transformers` exige `trust_remote_code=True`.

En cuanto al entrenamiento, la documentación de la familia indica que todos los modelos se entrenaron sobre cómputo y frameworks nacionales chinos, con optimizaciones de MP, PP y SP, además de optimizaciones de operadores para acelerar el entrenamiento. Se emplearon experimentos con modelos pequeños para validar leyes de escalado y elegir estructuras, proporciones de datos y estrategias de limpieza. Para contexto largo se usaron técnicas como RingAttention y otras formas de particionado de secuencias, junto con NTK-aware y attention-scaling para estabilizar la transición entre longitudes. El ajuste se realizó con datos sintéticos y anotación humana, aumentando complejidad y diversidad de instrucciones, con generación de rutas de razonamiento mediante muestreo por rechazo y una estrategia de selección inversa de datos de alineación de preferencias a partir del modelo base. No se especifica para la variante de 3B el número de tokens de entrenamiento ni si se aplicaron RLHF, DPO u otro método de alineación concreto.

## Capacidades

- Generación de texto en chino e inglés, con resultados destacados en pruebas de conocimiento de ámbito chino (C-Eval 75, CMMLU 73).
- Razonamiento de propósito general y tareas tipo BIG-Bench Hard (65,99 en BBH), con margen de mejora frente a las variantes mayores de la familia.
- Matemáticas de nivel escolar y problemas de varios pasos (64,7 en GSM8K), suficiente para aritmética textual y problemas guiados, pero por debajo de modelos de 7B o superiores.
- Generación de código: la familia se evalúa con HumanEval y MBPP, aunque el valor de HumanEval para la variante de 3B no aparece en la información disponible.
- Llamada a funciones (function calling) integrada: la versión 2024.11.08 de los modelos 3B, 7B y 35B incorpora esta capacidad, con optimización específica del *tool calling* frente a modelos de tamaño comparable.
- Conversación multiturno: la familia incorpora construcción de datos multirrueda y una función de pérdida enmascarada específica para mejorar la calidad de las respuestas en diálogos.
- Seguimiento de instrucciones: la familia se evalúa con IFEval, aunque no se publica el resultado de la variante de 3B en la información disponible.
- Capacidades especiales: no se declaran modos de razonamiento extendido (thinking), visión ni audio para este modelo.

## Casos de uso

- Asistente de atención al cliente en chino: el modelo puede gestionar diálogos multiturno con memoria de conversación y llamar a funciones para consultar pedidos o estados, apoyándose en el entrenamiento específico de *tool calling* y en el enmascarado de pérdida multirrueda.
- Clasificación y extracción de información en pipelines de documentos: con un coste de inferencia bajo (3.000 millones de parámetros), se puede desplegar en una sola GPU para etiquetar tickets, resumir correos o extraer campos estructurados a gran escala.
- Enrutador o *prefiltro* dentro de un sistema multiagente: al ser pequeño y rápido, resulta adecuado para decidir a qué modelo mayor derivar una consulta, invocar herramientas sencillas y reducir el coste por petición.
- Generación y revisión de código en entornos controlados: puede integrarse en asistentes de IDE o pasos de pre-revisión en CI/CD mediante *function calling* para consultar repositorios, aunque su rendimiento en código no está cuantificado en la información disponible.
- Investigación sobre alineación y evaluación multilingüe: al ser un modelo entrenado fuera del ecosistema habitual y con licencia Apache 2.0, sirve como punto de comparación en estudios de sesgo, comportamiento en chino y transferencia entre idiomas.
- Educación y tutoría automatizada en matemáticas de nivel escolar: los 64,7 puntos en GSM8K permiten resolver problemas de primaria y secundaria con verificación posterior mediante una herramienta de cálculo externa.
- Prototipado y experimentación en hardware modesto: al caber en GPU de consumo con cuantización, es viable para demos locales, pruebas de prompt engineering y desarrollo de aplicaciones antes de escalar a la variante de 7B o 35B.
- Archivado y replicabilidad de resultados: este espejo concreto permite reproducir exactamente una revisión concreta del modelo en el futuro, algo útil para publicaciones que citan artefactos que pueden retirarse.

## Benchmarks y rendimiento

Resultados publicados por TeleAI en la model card original. Los valores de HumanEval para 7B y 3B aparecen truncados en la información disponible.

| Dataset | TeleChat2-3B | TeleChat2-7B | TeleChat2-35B | TeleChat2-115B | Qwen2-72B-instruct | Llama-3.1-70B | DeepSeek-v2 | Qwen1.5-110B |
|---|---|---|---|---|---|---|---|---|
| C-Eval | 75 | 82 | 85 | 86,9 | 83,8 | no disponible | 78 | no disponible |
| MMLU | 72,9 | 79,6 | 82 | 80,9 | 82,3 | 86 | 77,8 | 80,4 |
| CMMLU | 73 | 84,6 | 90,18 | 89,94 | 87,47 | 69,01 | 81,6 | 87,64 |
| BBH | 65,99 | 77,3 | 88,6 | 89,04 | no disponible | no disponible | 79,7 | 74,8 |
| GSM8K | 64,7 | 86,8 | 91 | 92,2 | 91,1 | 95,1 | 92,2 | 85,4 |
| HumanEval | no disponible | no disponible | 73 | 75 | 86 | 80,5 | 81,1 | 52,4 |

No se han publicado en la información disponible resultados de MBPP, AlignBench, MT-bench ni IFEval para la variante de 3B.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 6-7 GB de pesos, más la caché KV y el *overhead* del runtime. El repositorio completo pesa 6,1 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 3,5-4 GB. No hay cuantizaciones oficiales publicadas en el repositorio, así que habría que generarlas.
- VRAM estimada en cuantización de 4 bits: aproximadamente 2-2,5 GB, lo que permite ejecutarlo en GPUs de gama media e incluso en algunos equipos con 4-6 GB de VRAM.
- GPUs recomendadas: una NVIDIA RTX 4090, A100 o H100 ofrece un margen muy amplio y permite lotes grandes; una RTX 3060 de 12 GB o una RTX 4070 bastan para inferencia en precisión nativa con lotes pequeños.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 8 GB o más en bf16 y en tarjetas de 4-6 GB si se cuantiza.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (la implementación es código personalizado `telechat`), vLLM y TGI si la arquitectura está soportada o se añade un adaptador, `llama.cpp`/Ollama tras convertir los pesos a GGUF, y MindFormers/MindSpore, que es la ruta oficial en el ecosistema chino. Para ajuste fino, la familia publica código de entrenamiento basado en DeepSpeed con optimización de memoria Zero y FlashAttention2.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Comparación dentro de la propia familia, cuyos datos sí están publicados en la model card, y referencia a alternativas externas de tamaño similar.

| Modelo | Parametros | Contexto | C-Eval / MMLU / GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TeleChat2-3B | 3.000 M | no disponible | 75 / 72,9 / 64,7 | Apache 2.0 | HuggingFace (espejo), ModelScope |
| TeleChat2-7B | 7.000 M | no disponible | 82 / 79,6 / 86,8 | Apache 2.0 | HuggingFace, ModelScope |
| TeleChat2-35B | 35.000 M | no disponible | 85 / 82 / 91 | Apache 2.0 | HuggingFace, ModelScope |
| Alternativas externas de ~3B (Qwen2.5-3B, Llama-3.2-3B, Phi-3-mini) | 3.000-3.800 M | no disponible | sin datos comparables en la información proporcionada | Apache 2.0 en el caso de Qwen; licencia específica en los demás | HuggingFace |

El salto de la variante de 3B a la de 7B es notable en matemáticas (64,7 frente a 86,8 en GSM8K) y en razonamiento (65,99 frente a 77,3 en BBH), por lo que la elección entre ambas debería basarse en el presupuesto de hardware y en la exigencia de la tarea. No se dispone de datos de benchmarks de modelos externos de 3B en la información proporcionada, así que no es posible una comparación cuantitativa directa.

## Limitaciones y advertencias

- Modelo pequeño: con 72,9 en MMLU y 64,7 en GSM8K, comete errores frecuentes en razonamiento matemático de varios pasos y en conocimiento especializado; conviene verificar sus salidas.
- Riesgo de alucinación inherente a cualquier LLM de esta escala, especialmente en preguntas factuales fuera del dominio de entrenamiento y en la generación de referencias, cifras o nombres.
- No se documentan en la información disponible la composición exacta del dataset, los métodos de alineación ni las evaluaciones de seguridad, sesgo o toxicidad.
- Sesgo potencial derivado de un corpus mayoritariamente chino y de anotación humana en ese contexto, con posible infrarrepresentación de otras culturas, variantes dialectales o temas sensibles.
- Cobertura idiomática no declarada formalmente: aunque la familia menciona chino e inglés, el rendimiento fuera de esos idiomas no está cuantificado.
- La longitud de contexto no está publicada para la variante de 3B, lo que impide planificar aplicaciones de contexto largo con garantías (las técnicas de RingAttention y NTK-aware se describen a nivel de familia, no como una cifra verificada de esta variante).
- El repositorio requiere ejecutar código personalizado (`custom_code`), lo que implica confiar en el código del autor al cargar el modelo; conviene revisarlo o aislarlo en un entorno controlado.
- Este repositorio es un espejo de terceros, no mantenido por TeleAI: no recibirá actualizaciones, correcciones ni soporte, y su revisión está congelada. Las descargas y *likes* son cero, por lo que no hay señal de uso comunitario.
- Los resultados de benchmarks son autodeclarados por el autor original y no se han verificado de forma independiente en la información disponible.
- Licencia Apache 2.0: permite uso comercial y modificación, pero exige conservar los avisos de copyright y licencia y no concede derechos de marca; el usuario asume la responsabilidad sobre el cumplimiento normativo en su jurisdicción.
- Al tratarse de un modelo de un proveedor sujeto a normativa china, conviene revisar requisitos internos de gobernanza de datos antes de desplegarlo en producción con datos personales.

## Enlaces

- Repositorio espejo en HuggingFace: https://huggingface.co/AIArchiveInfo/TeleChat2-3B
- Repositorio original TeleChat2-3B: https://huggingface.co/Tele-AI/TeleChat2-3B
- Revisión preservada: https://huggingface.co/Tele-AI/TeleChat2-3B/tree/b364de9538e146f7a99519d5ed6c9855f76bfdf0
- Organización TeleAI en HuggingFace: https://huggingface.co/Tele-AI
- Repositorio GitHub oficial: https://github.com/Tele-AI/TeleChat2
- Espejo en Gitee: https://gitee.com/Tele-AI/tele-chat2
- Implementación en MindSpore/MindFormers: https://gitee.com/mindspore/mindformers/tree/dev/research/telechat2
- ModelScope: https://modelscope.cn/models/TeleAI/TeleChat2-3B
- Paper de Rotary Embedding: https://arxiv.org/pdf/2104.09864.pdf
- Paper de SwiGLU: https://arxiv.org/pdf/2002.05202.pdf
- Paper de RMSNorm: https://arxiv.org/abs/1910.07467
- Referencia adicional incluida en los tags del repositorio: https://arxiv.org/abs/2507.18013
- Benchmark AlignBench: https://github.com/THUDM/AlignBench
- Benchmark MT-bench: https://github.com/lm-sys/FastChat/blob/main/fastchat/llm_judge/README.md
- Benchmark IFEval: https://github.com/EleutherAI/lm-evaluation-harness/blob/main/lm_eval/tasks/ifeval/README.md
