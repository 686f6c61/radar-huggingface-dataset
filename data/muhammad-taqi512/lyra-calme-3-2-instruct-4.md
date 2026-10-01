# muhammad-taqi512/LYRA-calme-3.2-instruct-4

## Resumen

LYRA-calme-3.2-instruct-4 es un modelo de generación de texto en inglés publicado por el usuario muhammad-taqi512 en Hugging Face. Se trata de una variante experimental derivada del modelo MaziyarPanahi/calme-3.2-instruct-78b, que a su vez procede de Qwen/Qwen2.5-72B. Según la model card, el modelo base Qwen2.5-72B se fusionó consigo mismo (self-merge) para dar lugar a un modelo mayor de aproximadamente 78.000 millones de parámetros, que después se afinó sobre conjuntos de datos personalizados.

El resultado es un modelo denso de 77.965.463.552 parámetros (unos 78B), orientado a conversación general y publicado con la plantilla de chat ChatML. El repositorio ocupa 311,9 GB, lo que indica que almacena varias copias de los pesos (incluida presumiblemente una versión de precisión completa en fp32, además de safetensors). El autor lo describe explícitamente como un modelo experimental, sensible a los hiperparámetros y potencialmente inestable en algunos prompts.

Su relevancia actual es limitada pero concreta: se trata de un experimento de fusión y ajuste sobre la familia Qwen2.5, con resultados publicados en el Open LLM Leaderboard (media de 52,02), licencia Qwen y cuantizaciones GGUF y EXL2 disponibles. Está pensado para quienes quieren probar una alternativa derivada de Qwen2.5-72B de tamaño similar, no como sustituto directo de un modelo de referencia en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (etiquetas: qwen2, qwen2.5); derivado de Qwen2.5-72B mediante self-merge |
| Parámetros totales | 77.965.463.552 (~78B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (la serie Qwen2.5 declara hasta 128.000 tokens, sin confirmar para esta variante) |
| Tipos de cuantización | GGUF y EXL2 4.5 bpw disponibles (gracias a SLORA); pesos completos en safetensors |
| Idiomas soportados | Inglés (en) |
| Licencia | qwen (etiquetada como "other" en el repositorio; enlaza a la licencia de Qwen2.5-72B-Instruct) |
| Formato de pesos | safetensors, GGUF, EXL2 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia Qwen2, heredada de Qwen2.5-72B. Según la model card, el proceso de construcción consistió en fusionar Qwen2.5-72B consigo mismo para obtener un modelo de mayor tamaño (unos 78B parámetros) y, posteriormente, aplicar un ajuste fino supervisado sobre conjuntos de datos personalizados ("custom datasets"). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF, DPO o PPO.

El autor indica que es un modelo experimental, sensible a los hiperparámetros de muestreo y con comportamiento variable ante distintos prompts. La plantilla de prompt es ChatML (`<|im_start|>system`, `<|im_start|>user`, `<|im_start|>assistant`). El repositorio incluye además cuantizaciones GGUF y EXL2 4.5 bpw, atribuidas a SLORA. No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o mecanismos híbridos.

## Capacidades

- Generación de texto y conversación multi-turno en inglés, con plantilla ChatML.
- Razonamiento general y de sentido común: BBH (3-shot) 62,61 y MuSR (0-shot) 38,53.
- Conocimiento general y preguntas de opción múltiple: MMLU-PRO (5-shot) 70,03.
- Razonamiento matemático a nivel de competición: MATH Lvl 5 (4-shot) 39,95.
- Seguimiento de instrucciones formateadas: IFEval (0-shot) 80,63, el punto más fuerte del modelo.
- Razonamiento científico de nivel avanzado limitado: GPQA (0-shot) 20,36.
- Idiomas: únicamente inglés declarado (etiquetas `english`, `en`, campo `language: en`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada (no confirmado para esta variante).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no declaradas.

## Casos de uso

- Asistentes conversacionales en inglés: el modelo usa la plantilla ChatML y está afinado para chat, por lo que puede gestionar diálogos multi-turno con contexto largo heredado de Qwen2.5, siempre que se acepte su naturaleza experimental.
- Seguimiento de instrucciones estructuradas: con un 80,63 en IFEval (0-shot), es adecuado para tareas que exigen respetar formatos, restricciones de longitud o plantillas concretas (generación de informes, extracción guiada).
- Preguntas y respuestas sobre conocimiento general: su 70,03 en MMLU-PRO (5-shot) lo sitúa como una opción razonable para preguntas de opción múltiple y consultas enciclopédicas en inglés.
- Apoyo a tareas matemáticas de nivel medio-alto: con 39,95 en MATH Lvl 5 (4-shot), puede emplearse para resolver problemas con explicación paso a paso y como asistente educativo, asumiendo errores en problemas complejos.
- Prototipado e investigación sobre fusión de modelos: al ser resultado de un self-merge de Qwen2.5-72B, sirve como caso de estudio para investigar los efectos de la fusión y el ajuste posterior sobre el rendimiento.
- Despliegue cuantizado en infraestructura propia: existen pesos GGUF y EXL2 4.5 bpw, lo que permite servirlo con llama.cpp/Ollama o ExLlamaV2 en GPUs de 48 GB o en estaciones con memoria unificada amplia.
- Base para fine-tuning específico de dominio: al compartir arquitectura y tokenizador con Qwen2.5, se puede continuar el ajuste con LoRA o QLoRA sobre dominios concretos en inglés.
- Evaluación comparativa de modelos de ~70-80B: puede incluirse en pipelines internos de evaluación para contrastar con Qwen2.5-72B o Llama 3.3 70B, usando sus métricas publicadas como referencia.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (fuente: Open LLM Leaderboard, `verified: false`):

| Benchmark | Configuración | Métrica | Valor |
|---|---|---|---|
| IFEval | 0-shot | strict accuracy | 80,63 |
| BBH | 3-shot | acc_norm | 62,61 |
| MATH Lvl 5 | 4-shot | exact match | 39,95 |
| GPQA | 0-shot | acc_norm | 20,36 |
| MuSR | 0-shot | acc_norm | 38,53 |
| MMLU-PRO | 5-shot | accuracy | 70,03 |
| Media (Avg.) | — | — | 52,02 |

No se han publicado en la información disponible resultados comparativos directos frente a Qwen2.5-72B, Llama 3.3 70B u otros modelos de la misma categoría.

## Requisitos de hardware

Estimaciones a partir del recuento real de parámetros (~78B). No se dispone de datos medidos de latencia ni throughput.

- Pesos en fp16/bf16: ~156 GB de VRAM. Requiere al menos 2 GPU de 80 GB (A100/H100) o más, además del espacio de caché KV.
- Pesos en fp32 (el repositorio ocupa 311,9 GB): inviable para inferencia interactiva en configuraciones de consumo.
- GGUF Q8_0: ~83 GB de VRAM/RAM.
- GGUF Q5_K_M: ~56 GB.
- GGUF Q4_K_M: ~47 GB.
- EXL2 4.5 bpw: ~44 GB.
- GPU recomendadas: 2× A100 80 GB o 2× H100 80 GB para fp16; una A100 80 GB o 2× RTX 4090 (48 GB) para GGUF Q4/Q5 o EXL2 4.5 bpw.
- GPU de consumo: no cabe en una única RTX 4090 (24 GB) en ninguna cuantización; la configuración mínima realista en consumer es 2× RTX 4090 (48 GB) para cuantizaciones de 4-5 bits. También es viable en Mac Studio/Apple Silicon con 64 GB o más de memoria unificada usando GGUF.
- Opciones de despliegue: transformers (formato nativo), vLLM y TGI para fp16 en multi-GPU, llama.cpp y Ollama para GGUF, ExLlamaV2 o text-generation-webui para EXL2.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| LYRA-calme-3.2-instruct-4 | ~78B (denso) | No disponible (hasta 128K según la familia Qwen2.5) | qwen | Inglés | Pesos safetensors, GGUF, EXL2 |
| Qwen2.5-72B-Instruct | 72B (denso) | 128.000 tokens | Qwen | Multilingüe (~29 idiomas) | Pesos oficiales, amplio ecosistema (vLLM, TGI, GGUF) |
| Llama 3.3 70B Instruct | 70B (denso) | 128.000 tokens | Llama 3.3 Community License | Multilingüe | Pesos oficiales, soporte amplio de runtimes |
| MaziyarPanahi/calme-3.2-instruct-78b | ~78B (denso) | No disponible | No disponible en la información | No disponible en la información | Pesos safetensors |

Los valores de benchmarks de Qwen2.5-72B-Instruct, Llama 3.3 70B Instruct y calme-3.2-instruct-78b no están disponibles en la información proporcionada, por lo que no se incluye comparación numérica de rendimiento.

## Limitaciones y advertencias

- Modelo experimental: el propio autor advierte de que puede rendir mal en algunos prompts y ser sensible a los hiperparámetros de muestreo.
- Resultados no verificados: todas las métricas del Open LLM Leaderboard están marcadas con `verified: false` en la model card.
- Solo inglés: no se declara soporte multilingüe, a diferencia de Qwen2.5-72B original.
- Riesgo de alucinación: como cualquier modelo de lenguaje de esta escala, puede generar información incorrecta con apariencia de veracidad; el 20,36 en GPQA y el 39,95 en MATH Lvl 5 indican limitaciones claras en razonamiento avanzado y matemáticas complejas.
- Proceso de construcción poco documentado: el self-merge de Qwen2.5-72B para llegar a 78B puede degradar la coherencia respecto al modelo original; no se publican detalles del dataset de ajuste ni del pipeline de alineación.
- Licencia Qwen: uso comercial permitido con condiciones; los modelos Qwen con más de 100 millones de usuarios mensuales requieren una licencia específica. Conviene revisar el texto completo antes de un despliegue comercial.
- Validación comunitaria nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia externa de su comportamiento en producción.
- Huella de almacenamiento elevada: 311,9 GB de repositorio, con copias en varias precisiones.
- Configuración de inferencia: la model card marca `inference: false`, por lo que no está disponible a través del endpoint serverless de Hugging Face y debe desplegarse en infraestructura propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/muhammad-taqi512/LYRA-calme-3.2-instruct-4
- Modelo base (calme-3.2-instruct-78b): https://huggingface.co/MaziyarPanahi/calme-3.2-instruct-78b
- Modelo de origen (Qwen2.5-72B-Instruct): https://huggingface.co/Qwen/Qwen2.5-72B-Instruct
- Licencia Qwen2.5-72B-Instruct: https://huggingface.co/Qwen/Qwen2.5-72B-Instruct/blob/main/LICENSE
- Open LLM Leaderboard (consulta del modelo): https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard?query=muhammad-taqi512/LYRA-calme-3.2-instruct-4
- Resultados detallados en el Open LLM Leaderboard: https://huggingface.co/datasets/open-llm-leaderboard/details_muhammad-taqi512__LYRA-calme-3.2-instruct-4
- SLORA (responsable de las cuantizaciones GGUF y EXL2): https://huggingface.co/muhammad-taqi512/SLORA-MAX
