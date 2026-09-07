# openbmb/MiniCPM5-2B

## Resumen

MiniCPM5-2B es un modelo de lenguaje de 2.500 millones de parámetros desarrollado por OpenBMB, el segundo de la serie MiniCPM5 tras el MiniCPM5-1B. Se trata de un Transformer denso, basado en la arquitectura Llama, diseñado específicamente para despliegue en dispositivos locales, entornos de borde y escenarios con recursos limitados. El modelo alcanza el estado del arte en su clase (2B) y compite con modelos de 4B en tareas generales, destacando en generación de código, razonamiento matemático, comprensión de contexto largo, uso de herramientas y tareas agénticas. Está entrenado con los datasets UltraData de OpenBMB, que incluyen preentrenamiento, ajuste supervisado y aprendizaje por refuerzo. Su relevancia radica en ofrecer un rendimiento elevado en un formato compacto, con licencia Apache 2.0, lo que facilita su integración en aplicaciones comerciales y de investigación. Solo soporta inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basada en Llama) |
| Parametros totales | 2.516.756.480 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada (etiquetado como long-context) |
| Tipos de cuantizacion | No especificados |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

MiniCPM5-2B es un Transformer denso que sigue la arquitectura Llama, con 2.516.756.480 parámetros. No utiliza mezcla de expertos (MoE), por lo que todos los parámetros se activan en cada paso de inferencia. El entrenamiento se realizó con los datasets de la familia UltraData de OpenBMB: Ultra-FineWeb, UltraX-Preview y Ultra-FineWeb-L3 para el preentrenamiento; UltraData-Math y UltraData-Code para tareas especializadas; y UltraData-SFT-2605, UltraData-SFT-Agent-2609 y UltraData-RL-2609 para el ajuste supervisado y el aprendizaje por refuerzo. No se especifica el número de tokens de entrenamiento ni la longitud de contexto. El modelo incorpora soporte de tool calling y está optimizado para tareas agénticas y razonamiento multi-paso, lo que se refleja en los datasets de agentes y RL. La receta de entrenamiento es la misma que la del MiniCPM5-1B, pero escalada a 2B.

## Capacidades

- Generación de texto y conversación en inglés y chino.
- Razonamiento matemático y de código, con ventajas frente a modelos de su tamaño.
- Comprensión de contexto largo (etiquetado como long-context, aunque no se especifica la longitud exacta).
- Soporte de tool calling / function calling.
- Soporte de tareas agénticas y razonamiento multi-paso.
- Optimizado para despliegue on-device y edge-ai, con bajo consumo de recursos.
- No se mencionan capacidades de visión ni audio en la información disponible.

## Casos de uso

- Asistentes conversacionales en dispositivos de borde: el modelo puede ejecutarse localmente en móviles, routers o dispositivos IoT gracias a su tamaño compacto, ofreciendo respuestas en inglés y chino sin depender de la nube.
- Generación de código en entornos de desarrollo locales: su rendimiento en tareas de código permite integrarlo en IDEs como autocompletado o asistente de programación, incluso en máquinas sin GPU potente.
- Razonamiento matemático en aplicaciones educativas: puede resolver problemas matemáticos paso a paso, útil en apps de tutoría o cálculo.
- Agentes autónomos con tool calling: al soportar function calling, puede integrarse en pipelines que requieren consultar APIs, bases de datos o ejecutar acciones, como asistentes de reservas o gestión de tareas.
- Análisis de documentos largos en local: gracias a su capacidad de contexto largo, puede procesar informes, contratos o artículos extensos en inglés o chino sin conexión.
- Chatbots de atención al cliente en entornos con recursos limitados: su tamaño permite desplegarlo en servidores de bajo coste o en instalaciones locales para gestionar consultas multi-turno.
- Investigación y prototipado de modelos eficientes: sirve como referencia para comparar arquitecturas densas de 2B frente a modelos de 4B en tareas de razonamiento, código y agentes.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. El autor presenta una comparativa cualitativa mediante un radar chart que abarca razonamiento de código, razonamiento matemático, seguimiento de instrucciones, conocimiento general, contexto largo y uso de herramientas, pero sin valores concretos. Por tanto, no es posible aportar una tabla de resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: dada la ausencia de datos oficiales, se puede estimar en ~5 GB en FP16, ~2,5 GB en INT8 y ~1,25 GB en INT4, asumiendo que existan cuantizaciones.
- GPU recomendadas: para FP16 basta una GPU de consumo con 8 GB o más, como RTX 3060 o RTX 4060; para cuantización, tarjetas de 4-6 GB son suficientes. No se especifican requisitos oficiales.
- ¿Cabe en consumer GPU? Sí, con cuantización cabe en GPUs de consumo e incluso en CPU con llama.cpp.
- Opciones de despliegue: compatible con transformers, text-generation-inference, vLLM, llama.cpp y Ollama, según los tags y la librería indicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La información proporcionada solo permite comparar con el MiniCPM5-1B, el modelo anterior de la misma serie. No se dispone de datos de otros modelos similares en la información disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiniCPM5-2B | 2.516.756.480 | No especificado | Apache 2.0 | HuggingFace |
| MiniCPM5-1B | 1B (según autor) | No especificado | No disponible | HuggingFace |

No se dispone de información sobre otros modelos comparables (por ejemplo, Qwen, Gemma o Phi) en los datos proporcionados.

## Limitaciones y advertencias

- Idiomas: solo inglés y chino; no soporta otros idiomas.
- Longitud de contexto: no especificada públicamente, lo que dificulta su evaluación para casos de uso que requieran ventanas muy largas.
- Sesgos: no se documentan sesgos específicos en la información disponible.
- Alucinación: como todos los modelos de lenguaje, puede generar contenido factual incorrecto; no se mencionan medidas específicas.
- Licencia: Apache 2.0 permite uso comercial, pero requiere conservar avisos de copyright y licencia, y no incluye garantías.
- Producción: al ser un modelo de 2B, su rendimiento en tareas muy complejas puede ser inferior al de modelos más grandes; el número de descargas y la antigüedad del modelo (creado en 2026) indican que aún no está ampliamente probado en producción.

## Enlaces

- HuggingFace: https://huggingface.co/openbmb/MiniCPM5-2B
- MiniCPM5-1B: https://huggingface.co/openbmb/MiniCPM5-1B
- Colección MiniCPM5: https://huggingface.co/collections/openbmb/minicpm5
- Paper (MiniCPM Tech Report): https://arxiv.org/pdf/2506.07900
- Wiki (chino): https://modelbest.feishu.cn/wiki/UtWxwcERfiRIpIkBOjuc3h9tn1D
- GitHub: https://github.com/OpenBMB/MiniCPM
- UltraData: https://ultradata.openbmb.cn/
- Demo online: https://huggingface.co/spaces/openbmb/MiniCPM5-2B-Demo
