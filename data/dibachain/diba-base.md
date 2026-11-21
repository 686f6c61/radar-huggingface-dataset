# Dibachain/Diba-Base

## Resumen

Diba-Base (دیبا) es un modelo de lenguaje de aproximadamente 4.200 millones de parámetros desarrollado por Dibachain, presentado como un LLM iraní con enfoque prioritario en persa (farsi). Está diseñado para tres objetivos concretos: producir persa escrito fluido y correcto, cubrir conocimiento sobre Irán (geografía, cultura e historia contemporánea) y generar código a partir de instrucciones en persa o en inglés. Se distribuye con licencia Apache 2.0 y pesos en safetensors y GGUF.

El modelo se posiciona para ejecución local y sin conexión: el autor publica una cuantización Q4_K_M de aproximadamente 2,8 GB que funciona en CPU mediante llama.cpp, Ollama o LM Studio, sin necesidad de GPU. Incorpora soporte de tool calling y un modo de razonamiento (thinking) desactivable mediante `enable_thinking`, y responde en el idioma del mensaje del usuario (persa con persa, inglés con inglés).

Su relevancia actual radica en la escasez de modelos abiertos de tamaño compacto con competencia real en persa y conocimiento específico de Irán, un nicho donde los modelos generalistas de la misma escala obtienen resultados notablemente peores según las pruebas publicadas por el propio autor. La información disponible sobre arquitectura interna, datos de entrenamiento y longitud de contexto es limitada y se detalla a continuación con las lagunas marcadas explícitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer decoder-only, definición propia del modelo con `trust_remote_code=True`; detalles internos no publicados) |
| Parametros totales | 4.205.751.296 (~4,2 B) |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible (los ejemplos de llama.cpp usan `-c 8192`, pero no se confirma como contexto nativo entrenado) |
| Tipos de cuantizacion | GGUF Q4_K_M (publicada, ~2,8 GB); otras cuantizaciones no disponibles |
| Idiomas soportados | persa (fa), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y GGUF (llama.cpp/Ollama/LM Studio) |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna más allá de que se trata de un modelo de generación de texto compatible con `transformers` y que requiere `trust_remote_code=True`, lo que implica una definición de modelo personalizada incluida en el repositorio. El recuento real de parámetros en safetensors es de 4.205.751.296, coherente con la descripción del autor de un modelo de clase 4B. No se especifica si emplea atención con ventana deslizante, decodificación especulativa u otras optimizaciones.

Tampoco se detallan el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. El autor sí menciona un modo de razonamiento controlable (`enable_thinking`) integrado en la plantilla de chat, lo que sugiere un entrenamiento orientado a instrucciones con separación entre respuesta directa y razonamiento explícito. La model card indica que el modelo "refleja las perspectivas presentes en sus datos de entrenamiento", sin más concreción sobre la procedencia de estos.

## Capacidades

- Generación de texto conversacional en persa escrito y en inglés, con respuesta en el idioma del mensaje del usuario.
- Generación de código en Python, JavaScript, TypeScript y "muchos otros lenguajes", a partir de instrucciones en persa o inglés.
- Tool calling / function calling: acepta definiciones de funciones y decide cuál invocar junto con sus argumentos.
- Conocimiento específico de Irán: geografía, cultura e historia contemporánea.
- Modo de razonamiento (thinking) activable o desactivable mediante `enable_thinking` en la plantilla de chat.
- Ejecución offline en CPU mediante GGUF, sin dependencia de servicios en la nube.
- Soporte de plantilla de chat Jinja en llama.cpp (`--jinja`).
- No se documentan capacidades de visión, audio ni multimodalidad en este modelo; el autor remite a Diba-Vision, Diba-Embed y Diba-STT para esas funciones.

## Casos de uso

- Asistentes conversacionales en persa para atención al usuario: el modelo mantiene conversaciones multi-turno y responde en persa escrito con ortografía correcta y ZWNJ adecuado, lo que lo hace apto para interfaces de chat dirigidas a público iraní.
- Despliegue en dispositivos sin GPU: con el GGUF Q4_K_M (~2,8 GB) puede ejecutarse en portátiles y equipos de sobremesa modestos mediante llama.cpp u Ollama, útil para entornos con conectividad limitada o requisitos de soberanía de datos.
- Generación de código desde especificaciones en persa: equipos de desarrollo iraníes pueden describir funciones en su idioma y obtener implementaciones en Python o JavaScript, reduciendo la fricción de trabajar en inglés.
- Integración en pipelines de herramientas: gracias al tool calling, puede actuar como planificador que selecciona funciones (consultas a bases de datos, APIs internas) y genera los argumentos correspondientes.
- Aplicaciones educativas sobre historia y cultura de Irán: el modelo muestra un rendimiento notablemente superior a alternativas generalistas en preguntas de historia iraní, lo que lo hace adecuado para tutores o sistemas de consulta temática con verificación humana.
- Prototipado rápido de chatbots locales: la disponibilidad de un Modelfile para Ollama y de instrucciones para LM Studio permite tener un asistente funcional en pocos minutos sin infraestructura cloud.
- Traducción y redacción bilingüe persa-inglés en contextos de documentación técnica, aprovechando el cambio automático de idioma de respuesta.

## Benchmarks y rendimiento

Los datos proceden exclusivamente de la model card del autor. Las pruebas se realizaron con decodificación greedy sobre 20 tareas de Python y 20 de JavaScript con tests unitarios reales, 40 preguntas de historia de Irán y una prueba de respuesta en el idioma del usuario (10 casos).

| Modelo | Python | JavaScript | Historia de Irán (fa) | Responde en persa |
|---|---|---|---|---|
| Diba-Base | 13/20 | 13/20 | 29/40 | 10/10 |
| Gemma 3 4B | 11/20 | 12/20 | 15/40 | 10/10 |
| Granite 4.0 Micro 3B | 14/20 | 11/20 | 11/40 | 10/10 |
| Phi-4-mini 3.8B | 11/20 | 10/20 | 5/40 | 10/10 |
| SmolLM3 3B | 11/20 | 10/20 | 4/40 | 9/10 |

No se han publicado resultados en benchmarks estándar de la industria (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras anteriores provienen de una evaluación propia del autor y no han sido verificadas de forma independiente.

## Requisitos de hardware

- VRAM estimada en bfloat16: en torno a 8,4 GB solo para pesos, más overhead de activaciones y caché KV; requiere GPU con al menos 12-16 GB para contexto moderado.
- VRAM estimada con Q4_K_M: aproximadamente 2,8 GB de pesos, ejecutable en CPU sin GPU.
- GPU recomendadas para fp16/bf16: A100, H100, L40S o RTX 4090; en GPUs de consumo de 8 GB no cabe en precisión completa.
- GPU de consumo: una RTX 3060 de 12 GB o superior permite inferencia en bfloat16 con contexto limitado; para GPUs de 8 GB es preferible la cuantización GGUF.
- Despliegue: transformers (con `trust_remote_code=True`), llama.cpp (`llama-server --jinja`), Ollama (Modelfile incluido), LM Studio (`lms import`). No se documenta soporte explícito de vLLM o TGI.
- Latencia y throughput: no disponibles. El autor solo indica que la versión Q4_K_M funciona en CPU, sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Fortaleza diferencial |
|---|---|---|---|---|---|
| Diba-Base | ~4,2 B | no disponible | Apache 2.0 | fa, en | Persa e historia de Irán; ejecución en CPU |
| Gemma 3 4B | ~4 B | no disponible en la información | Términos propios de Google | Multilingüe amplio | Cobertura multilingüe general |
| Granite 4.0 Micro 3B | ~3 B | no disponible en la información | Apache 2.0 | Principalmente inglés | Código en inglés |
| Phi-4-mini 3.8B | ~3,8 B | no disponible en la información | Licencia MIT | Multilingüe | Razonamiento general |
| SmolLM3 3B | ~3 B | no disponible en la información | Apache 2.0 | Multilingüe | Modelo pequeño eficiente |

En las pruebas del autor, Diba-Base lidera en JavaScript, empata en Python con Gemma 3 4B y queda un punto por debajo de Granite 4.0 Micro 3B en Python, mientras que supera ampliamente a todos los comparadores en conocimiento de historia de Irán (29/40 frente a 15/40 del siguiente mejor). La ventaja principal es, por tanto, la especialización lingüística y cultural, no un rendimiento general superior.

## Limitaciones y advertencias

- Modelo de ~4B parámetros: riesgo elevado de alucinación en datos factuales, fechas y referencias; el propio autor recomienda verificar hechos y código generado.
- Sesgos potenciales derivados de los datos de entrenamiento, con posible sobrerrepresentación de perspectivas presentes en fuentes iraníes; el autor lo reconoce sin detallar la composición del dataset.
- Cobertura idiomática limitada a persa e inglés; el rendimiento en otros idiomas no está documentado y probablemente sea deficiente.
- Longitud de contexto no confirmada oficialmente; los 8192 tokens del ejemplo de llama.cpp no equivalen necesariamente al contexto de entrenamiento.
- Requiere `trust_remote_code=True` en transformers, lo que implica ejecutar código personalizado del repositorio; conviene auditar la definición del modelo antes de usarlo en producción.
- Licencia Apache 2.0 permite uso comercial, pero no se ofrece garantía alguna ni se documentan evaluaciones de seguridad o alineación.
- No dispone de capacidades multimodales; para visión, embeddings o voz el autor remite a modelos separados del mismo ecosistema.
- Los benchmarks publicados son internos, con muestras pequeñas (20-40 ítems) y sin verificación independiente; deben interpretarse como indicativos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dibachain/Diba-Base
- Sitio web de Dibachain: https://dibachain.ir
- Agente (Space): https://dibaai-diba-agent.hf.space
- Chat con GPU (Space): https://huggingface.co/spaces/DibaAi/diba-chat-gpu
- Chat con CPU (Space): https://huggingface.co/spaces/DibaAi/diba-chat
- Diba-Embed: https://huggingface.co/Dibachain/Diba-Embed
- Diba-Vision: https://huggingface.co/Dibachain/Diba-Vision
- Diba-STT: https://huggingface.co/Dibachain/Diba-STT
