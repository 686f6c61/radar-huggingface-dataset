# govailabs/govai

## Resumen

govai 2B es un ajuste fino mediante QLoRA del modelo Qwen3.5-2B, desarrollado por govailabs con el objetivo de ofrecer un asistente conversacional para usuarios sin experiencia previa en inteligencia artificial. El modelo está entrenado para responder con lenguaje llano, adaptar la longitud de la respuesta a la pregunta y citar fuentes numeradas cuando responde a partir de resultados de búsqueda web. Se distribuye principalmente como un archivo GGUF cuantizado Q4_K_M de 1,31 GB, pensado para ejecutarse íntegramente en local en un ordenador convencional.

Con 1.942.653.248 parámetros totales (aproximadamente 2B), el modelo se posiciona en la gama baja de tamaño, lo que permite su despliegue en hardware de consumo con unos 3 GB de memoria gráfica. Su relevancia actual reside en el enfoque de "asistente de recuperación aumentada" (RAG) integrado: el modelo está específicamente entrenado para responder únicamente a partir de resultados de búsqueda proporcionados y admitir explícitamente cuando no encuentra una respuesta fiable, en lugar de inventarla.

El modelo soporta inglés, hindi y telugu, y se publica bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en aplicaciones de escritorio. Forma parte del ecosistema de la aplicación govai, que descarga este archivo en el primer arranque.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-2B); no se detalla la variante exacta |
| Parametros totales | 1.942.653.248 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (publicado); el modelo base admite otras cuantizaciones GGUF |
| Idiomas soportados | Ingles, hindi, telugu |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M); el modelo base en safetensors |

## Arquitectura y entrenamiento

govai 2B es un ajuste fino QLoRA de Qwen3.5-2B con rango 32, alpha 64 y una única época de entrenamiento. El conjunto de datos de ajuste consta de aproximadamente 1.850 conversaciones escritas específicamente para el estilo deseado: frases cortas, comparaciones cotidianas, ausencia de jerga y respuestas cuya longitud se ajusta a la pregunta (una o dos líneas para un dato puntual, respuesta breve con puntos clave para "explica", y respuesta completa con encabezados y resumen "In short" para "en detalle").

La innovación principal no es arquitectónica sino de comportamiento: el modelo está entrenado para responder de forma fundamentada a partir de resultados de búsqueda numerados, citando cada dato como [1], copiando los números exactamente y respondiendo "I couldn't find a reliable answer to that." cuando no hay información fiable. También se entrena para gestionar preguntas de seguimiento en conversaciones multi-turno y para producir respuestas básicas en hindi y telugu. No se especifica en la información disponible si hubo RLHF o DPO, ni el número de tokens de entrenamiento del modelo base.

## Capacidades

- Generación de texto conversacional en inglés, hindi y telugu.
- Respuestas en lenguaje llano, con longitud adaptada a la pregunta.
- Respuestas fundamentadas en resultados de búsqueda web con citas numeradas ([1], [2], etc.).
- Abstención explícita cuando no hay respuesta fiable en las fuentes proporcionadas.
- Gestión de preguntas de seguimiento en conversaciones multi-turno.
- Modo "thinking" del modelo base disponible pero desaconsejado para respuestas directas (se recomienda desactivarlo, p. ej. `think: false` en Ollama).
- No se documenta soporte de tool calling, function calling, agentes autónomos, visión, audio ni matemáticas avanzadas.

## Casos de uso

- Asistente de escritorio para principiantes: la aplicación govai descarga el modelo en el primer arranque y lo ejecuta completamente offline en un PC convencional, ofreciendo explicaciones en lenguaje sencillo sin requerir conexión ni conocimientos técnicos.
- Búsqueda web con respuestas citadas: el modelo recibe resultados de búsqueda numerados y responde citando cada dato con su referencia, lo que permite construir un asistente que muestre fuentes verificables al usuario.
- Atención al cliente de bajo coste: con aproximadamente 3 GB de VRAM y respuestas breves ajustadas a la pregunta, puede desplegarse en equipos modestos para resolver consultas frecuentes con un tono claro y directo.
- Educación y alfabetización digital: ideal para explicar conceptos de IA a personas sin formación técnica, con respuestas graduadas según la profundidad solicitada ("explica" frente a "en detalle").
- Despliegue en local con Ollama o llama.cpp: integrable en flujos de trabajo de escritorio o scripts mediante `ollama run` o `llama-cli`, sin dependencia de servicios en la nube.
- Asistente multilingüe básico para usuarios de hindi y telugu: útil para responder consultas sencillas en estas lenguas, con la advertencia de que su calidad es inferior a la del inglés.
- Prototipado de pipelines RAG: sirve como modelo de referencia para validar arquitecturas de recuperación aumentada con abstención ante falta de evidencia, gracias a su entrenamiento específico en citación y rechazo de respuestas no fundamentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que los resultados de GSM8K, ARC-Challenge y MMLU frente al modelo base están en ejecución y se añadirán próximamente.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB con cuantización Q4_K_M (según la model card).
- Tamaño en disco: 1,31 GB para el archivo GGUF Q4_K_M.
- GPU recomendadas: no se especifican modelos concretos; el requisito de ~3 GB de VRAM permite su ejecución en GPU de consumo como GTX 1650, RTX 3050, RTX 4060 o superiores, así como en iGPU con memoria unificada suficiente.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 4 GB o más de VRAM.
- Opciones de despliegue: Ollama (`ollama run hf.co/venkatagovindneelapu/govai:Q4_K_M`), llama.cpp (`llama-cli -hf venkatagovindneelapu/govai --jinja`) y la aplicación de escritorio govai.
- Latencia y throughput: no disponibles.
- Ajustes recomendados: temperatura 0,3 (0,2 para respuestas basadas en búsqueda), top_p 0,9, top_k 20; desactivar el modo "thinking".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| govai 2B | ~1,94B | No disponible | en, hi, te | Apache 2.0 | GGUF Q4_K_M | Ajuste QLoRA de Qwen3.5-2B orientado a lenguaje llano y RAG con citas |
| Qwen3.5-2B (base) | ~2B | No disponible | No disponible | Apache 2.0 | Safetensors, GGUF | Modelo base; sin el ajuste de estilo ni el comportamiento de citación |
| Alternativas de ~2B de la familia Llama/Gemma | No disponible | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados en la información proporcionada |

No se dispone de datos de benchmarks comparativos publicados para govai 2B, por lo que la comparación se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- Es un modelo de 2.000 millones de parámetros: comete errores factuales, especialmente sobre personas, lugares y acontecimientos recientes; la aplicación compensa esto con búsqueda web.
- Las respuestas en hindi y telugu son de menor calidad que las respuestas en inglés.
- No proporciona asesoramiento médico, legal ni financiero profesional; las respuestas importantes deben verificarse.
- Riesgo de alucinación inherente al tamaño del modelo, mitigado parcialmente por el entrenamiento en abstención ante falta de fuentes.
- No se documenta la longitud de contexto soportada, lo que limita la planificación de despliegues con documentos largos.
- El modelo está pensado para ejecutarse con el modo "thinking" desactivado; su uso con el modo activado puede degradar la experiencia.
- Licencia Apache 2.0: permite uso comercial, pero se distribuye "tal cual", sin garantías de ningún tipo; debe conservarse el aviso `NOTICE` y la atribución a Qwen (Alibaba Cloud).
- El repositorio registra 0 descargas y 1 like en el momento de la consulta, lo que indica una adopción muy temprana y poca validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/govailabs/govai
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Ejecución en Ollama: `ollama run hf.co/venkatagovindneelapu/govai:Q4_K_M`
- Ejecución en llama.cpp: `llama-cli -hf venkatagovindneelapu/govai --jinja`
