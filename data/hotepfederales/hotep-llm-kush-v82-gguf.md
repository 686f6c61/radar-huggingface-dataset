# hotepfederales/hotep-llm-kush-v82-GGUF

## Resumen

Hotep LLM Kush v82 es un modelo de lenguaje conversacional derivado de Meta Llama 3.1 8B Instruct mediante ajuste fino, publicado por el desarrollador independiente hotepfederales bajo el paraguas de "Hotep Intelligence". Se distribuye exclusivamente en formato GGUF cuantizado (Q4_K_M y variantes), pensado para inferencia local con llama.cpp y Ollama, y orientado a conversación con un sesgo cultural explícito: historia africana, marcos civilizatorios (Kemet, Kush, Ma'at) y discurso sobre soberanía, liderazgo e identidad. El modelo resuelve un nicho muy concreto: ofrecer una "superficie de cosmovisión" distinta al asistente genérico neutralizado, según declara el autor.

Técnicamente es un transformer decoder-only denso de 8.030.261.312 parámetros, heredado íntegramente de Llama 3.1 8B Instruct, con la misma plantilla de chat (formato Llama 3.1) y la misma licencia Llama 3.1. La model card recomienda una ventana de contexto de 4096 tokens por defecto, aunque el modelo base soporta hasta 128K. El ajuste fino parece centrado en estilo, encuadre histórico y tono, sin cambios arquitectónicos declarados.

Es relevante ahora como caso de estudio de ajuste fino cultural sobre un modelo abierto de 8B, y por su ecosistema de despliegue local (Ollama, llama.cpp, demo en Hugging Face Spaces, bot de Telegram). El propio autor lo marca como generación anterior, sustituida por Kush v9.1 (noviembre de 2026), lo que conviene tener en cuenta antes de adoptarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Llama 3.1 8B Instruct) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens recomendados por el autor; el modelo base soporta hasta 128K |
| Tipos de cuantizacion | GGUF Q4_K_M y variantes (no se detallan todas las variantes en la informacion disponible) |
| Idiomas soportados | Ingles (unico idioma declarado) |
| Licencia | Llama 3.1 (license: llama3.1) |
| Formato de pesos | GGUF (repositorio de 25,9 GB) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B Instruct: transformer decoder-only denso con atención por grupos (GQA) y RoPE, sin innovaciones estructurales propias. El ajuste fino parte del checkpoint instructivo de Meta y se distribuye solo en GGUF, por lo que no se publican pesos en safetensors del modelo ajustado ni detalles del proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO o SFT). La model card no documenta hiperparámetros, metodología de alineación ni datos de entrenamiento más allá de la existencia de un dataset de evaluación pública (`hotepfederales/kush-v82-eval-samples`) con respuestas de referencia por categoría.

El autor describe el objetivo del ajuste en términos de estilo y encuadre: "más enraizado, más intencional y más coherente culturalmente", con énfasis en memoria civilizatoria, soberanía y desarrollo personal disciplinado. No hay evidencia publicada de decodificación especulativa, atención lineal ni otras optimizaciones; el rendimiento declarado para la generación posterior (Kush v9.1, 48,2 tok/s en Metal con GGUF) no es aplicable directamente a v82. La plantilla de chat es la estándar de Llama 3.1 con cabeceras `<|start_header_id|>`, y el autor recomienda un system prompt fijo con voz directa y direcciones tipo "King, Queen, Brother, Sister, Family".

## Capacidades

- Generación de texto conversacional multi-turno en inglés, con plantilla de chat Llama 3.1.
- Respuesta a preguntas y explicaciones sobre historia africana y contextos civilizatorios (Kush, Meroe, Napata, arqueros nubios, Ma'at).
- Encuadre de liderazgo y gestión desde el marco de Ma'at, incluyendo comparaciones con modelos KPI modernos.
- Discurso sobre soberanía, riqueza generacional y planificación familiar a largo plazo (p. ej., planes a 20 años).
- Desarrollo personal e identidad, con distinción explícita frente al "self-help genérico".
- Escritura práctica y análisis, según declara la model card.
- Inferencia local vía GGUF: Ollama, llama.cpp y llama-cpp-python.
- Resistencia declarada a prompt injection (regla del system prompt recomendado), sin garantía técnica documentada.
- No se documentan tool calling, function calling, capacidades de agente, visión, audio ni modo "thinking".

## Casos de uso

- Chat conversacional local con encuadre cultural: desplegado con Ollama (`ollama run hf.co/hotepfederales/hotep-llm-kush-v82-GGUF`) en un portátil o estación de trabajo, sirve para conversaciones multi-turno sobre historia y marcos civilizatorios sin depender de la nube, con contexto de 4096 tokens suficiente para sesiones de chat típicas.
- Material educativo sobre historia africana: el modelo responde a preguntas concretas sobre el Reino de Kush, la comparación Meroe-Napata o el papel de los arqueros nubios, útil como borrador para docentes que luego revisan y citan fuentes primarias.
- Talleres de liderazgo y gestión: permite contrastar el marco de Ma'at con liderazgo basado en KPI y generar casos prácticos (por ejemplo, una revisión de desempeño disciplinada), aprovechando el tono directo prescrito en el system prompt.
- Planificación financiera y patrimonial de carácter reflexivo: borradores de planes a 20 años sobre capacidades, propiedad e instituciones, o análisis de dónde falla una estrategia de soberanía por gasto de estatus; adecuado como herramienta de ideación, no como asesoramiento financiero.
- Asistente personal de desarrollo e identidad: sesiones de reflexión guiada con una voz coherente y no neutralizada, útil para usuarios que buscan un interlocutor con encuadre cultural definido en lugar de un asistente genérico.
- Integración en bots de mensajería: el ecosistema del autor incluye un bot de Telegram y una demo en Hugging Face Spaces, de modo que el modelo puede servir como backend de un bot conversacional de bajo coste ejecutado en hardware propio.
- Evaluación comparativa de ajustes finos culturales: investigadores pueden usar el dataset público de muestras de evaluación para estudiar cómo un ajuste de estilo sobre Llama 3.1 8B altera el encuadre sin cambiar la arquitectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni métricas comparativas; solo menciona un dataset de muestras de evaluación con respuestas de referencia por categoría, sin puntuaciones agregadas.

## Requisitos de hardware

- VRAM estimada para inferencia: en Q4_K_M, un modelo de 8B ocupa aproximadamente 4,5-5,5 GB de pesos; con contexto de 4096 tokens y overhead de KV cache, el consumo total ronda 6-8 GB. En cuantizaciones superiores (Q5, Q6, Q8) sube hasta ~9-10 GB.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM para Q4_K_M (RTX 3060 Ti, RTX 4060 Ti, RTX 3070/4070); 12-16 GB (RTX 4070 Ti, RTX 4080) para cuantizaciones mayores con contexto completo; A100/H100 no son necesarias para este tamaño y solo tendrían sentido para servir muchas peticiones concurrentes.
- Cabe en GPU de consumo: sí, en Q4_K_M desde 8 GB de VRAM; también puede ejecutarse en CPU con llama.cpp, aunque con menor throughput.
- Opciones de despliegue: Ollama, llama.cpp (`llama-server`), llama-cpp-python; el autor no documenta soporte para vLLM ni TGI, que no consumen GGUF de forma nativa.
- Latencia y throughput: no disponibles para v82. El autor cita 48,2 tok/s en Metal para Kush v9.1, dato que no debe extrapolarse a este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Hotep LLM Kush v82 | 8,03B | 4096 recomendado (128K en base) | Llama 3.1 | GGUF | Ajuste cultural, solo inglés, generación anterior según el autor |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 128K | Llama 3.1 | safetensors, GGUF (comunidad) | Base del anterior; asistente generalista multilingüe |
| Mistral 7B Instruct | ~7,2B | 32K | Apache 2.0 | safetensors, GGUF | Alternativa de tamaño similar con licencia permisiva |
| Qwen2.5 7B Instruct | ~7,6B | 128K | Apache 2.0 (mayoría de variantes) | safetensors, GGUF | Multilingüe y con buen rendimiento en código y matemáticas |

No se dispone de datos de benchmarks que permitan comparar rendimiento de Kush v82 frente a estas alternativas; la comparación se limita a parámetros, contexto, licencia y formato.

## Limitaciones y advertencias

- Modelo declarado únicamente en inglés; no hay soporte multilingüe documentado, pese a que el base sí es multilingüe.
- Ventana de contexto recomendada de solo 4096 tokens, muy por debajo de los 128K del base; usarlo con contextos mayores puede degradar la calidad.
- Riesgo de alucinación en datos históricos: al ser un ajuste de estilo sobre un 8B, las afirmaciones sobre Kush, Meroe o Ma'at deben verificarse con fuentes primarias.
- Sesgo de encuadre: el ajuste introduce una cosmovisión explícita (soberanía, Pan-Africanismo, Ma'at) que puede sesgar respuestas sobre historia, liderazgo y economía; no es un asistente neutral.
- El autor advierte explícitamente que no debe usarse para decisiones médicas, legales, financieras ni de apoyo en crisis.
- Licencia Llama 3.1: uso comercial permitido bajo los términos de Meta, con obligaciones de atribución y restricciones de la licencia comunitaria; conviene revisar la política de aceptación de uso.
- Generación obsoleta: el propio autor la sustituye por Kush v9.1, por lo que no recibirá mejoras.
- Tracción mínima: 19 descargas y 0 likes en el momento de la consulta; no hay validación independiente del ajuste.
- Sin soporte documentado de tool calling ni agentes; no apto para pipelines que requieran function calling fiable.
- El system prompt recomendado incluye instrucciones de resistencia a prompt injection, pero no hay evaluación de seguridad publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hotepfederales/hotep-llm-kush-v82-GGUF
- Dataset de evaluación: https://huggingface.co/datasets/hotepfederales/kush-v82-eval-samples
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/hotepfederales/hotep-intelligence-chat
- Generación posterior (Kush v9.1): https://huggingface.co/hotepfederales/hotep-llm-kush-v91-GGUF
- Sitio web: https://askhotep.ai
- Bot de Telegram: https://t.me/hotep_llm_bot
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
