# mradermacher/routeagent-0.5b-GGUF

## Resumen

RouteAgent-0.5b es un modelo de lenguaje compacto (494.032.768 parámetros) especializado en enrutamiento de intenciones (intent routing) para sistemas multiagente. Está desarrollado por el usuario vennyvirtuoso y ha sido cuantizado a formato GGUF por mradermacher, un conocido publicador de cuantizaciones en Hugging Face. El modelo parte de una base Qwen2.5, según indican las etiquetas de la model card, y está afinado sobre el dataset RouteAgent para tareas de clasificación y direccionamiento de consultas hacia agentes especializados.

Su relevancia radica en el nicho que ocupa: en lugar de competir como modelo generalista, se posiciona como un componente ligero de orquestación para frameworks como LangGraph, CrewAI o AutoGen. Con menos de 500 millones de parámetros y cuantizaciones que ocupan entre 0,4 y 1,1 GB, está pensado para despliegues en el borde (edge AI) y para integrarse en pipelines donde la latencia y el coste por inferencia son críticos.

La licencia Apache 2.0 y el formato GGUF facilitan su adopción tanto en entornos de investigación como comerciales, aunque la información pública sobre arquitectura detallada, datos de entrenamiento y rendimiento es muy limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen2.5, según etiquetas) |
| Parámetros totales | 494.032.768 |
| Parámetros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta qwen2.5, que sugiere una base transformer decoder-only con las innovaciones habituales de esa familia (atención con RoPE, SwiGLU, normalización RMSNorm). El modelo base vennyvirtuoso/routeagent-0.5b fue afinado sobre el dataset RouteAgent, orientado a tareas de enrutamiento de intenciones.

No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. Tampoco hay información sobre innovaciones técnicas como decodificación especulativa o atención lineal. La model card del repositorio GGUF es una plantilla estándar de mradermacher y no aporta detalles adicionales sobre el entrenamiento.

## Capacidades

- Enrutamiento de intenciones: clasificación de consultas de usuario hacia el agente o herramienta adecuada dentro de un sistema multiagente.
- Generación de salidas estructuradas (structured outputs): útil para producir JSON u otros formatos que los frameworks de orquestación puedan consumir directamente.
- Integración con frameworks de agentes: etiquetado explícitamente para LangGraph, CrewAI y AutoGen.
- Procesamiento de lenguaje natural conversacional en inglés.
- Diseñado para despliegue en el borde (edge AI) por su reducido tamaño.
- No se documentan capacidades de tool calling nativo, visión, audio, matemáticas avanzadas ni razonamiento multi-paso más allá de lo que implica el enrutamiento.

## Casos de uso

- Orquestación de sistemas multiagente: el modelo recibe la consulta del usuario y decide qué agente especializado debe atenderla, actuando como router ligero en arquitecturas con LangGraph o CrewAI.
- Clasificación de tickets de soporte: asignación automática de incidencias a la cola o al agente correspondiente según la intención detectada, con latencia baja por su tamaño reducido.
- Enrutamiento en asistentes conversacionales: derivación de consultas hacia módulos de FAQ, facturación o soporte técnico dentro de un chatbot corporativo.
- Preprocesamiento en pipelines RAG: selección de la fuente de recuperación o del índice adecuado antes de lanzar la búsqueda, reduciendo el coste computacional del sistema completo.
- Despliegue en dispositivos con recursos limitados: al caber en cuantizaciones de 0,4-0,6 GB, puede ejecutarse en CPU o GPUs de gama baja en entornos de borde.
- Generación de salidas estructuradas para automatización: producción de decisiones en formato JSON que alimentan sistemas de workflow o automatizaciones internas.
- Filtrado previo en sistemas de agentes: descarte o redirección de consultas fuera de dominio antes de invocar modelos más grandes y costosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: entre 0,4 y 0,6 GB para cuantizaciones Q2_K a Q8_0; aproximadamente 1,1 GB para f16.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobradamente suficiente; también puede ejecutarse en CPU.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 2 GB de VRAM, e incluso en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base es compatible con transformers.
- Latencia y throughput: no disponibles en la información proporcionada, aunque por el tamaño se espera latencia de milisegundos en GPU y decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| RouteAgent-0.5b (este) | 494 M | No disponible | Apache 2.0 | GGUF, safetensors | Enrutamiento de intenciones |
| Qwen2.5-0.5B | ~494 M | 32 K (según familia Qwen2.5) | Apache 2.0 | safetensors, GGUF | Modelo generalista |
| SmolLM2-360M | 360 M | 8 K (aprox.) | Apache 2.0 | safetensors, GGUF | Modelo generalista ligero |
| TinyLlama-1.1B | 1,1 B | 2 K | Apache 2.0 | safetensors, GGUF | Modelo generalista |

La comparativa se basa en categorías de tamaño; no hay datos de rendimiento publicados para RouteAgent-0.5b que permitan una comparación cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Solo soporta inglés; no se documenta multilingüismo.
- No hay información pública sobre sesgos, datos de entrenamiento ni evaluación de alucinación.
- El modelo está especializado en enrutamiento; su rendimiento en tareas generalistas de generación será inferior al de modelos del mismo tamaño no especializados.
- La longitud de contexto no está documentada, lo que dificulta planificar su uso en conversaciones largas.
- No se han publicado benchmarks, por lo que la calidad real del enrutamiento no puede verificarse a priori.
- Aunque la licencia es Apache 2.0 (permite uso comercial), conviene verificar la procedencia del dataset RouteAgent por si tuviera restricciones adicionales.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.
- Las cuantizaciones de menor tamaño (Q2_K, Q3_K_S) pueden degradar notablemente la calidad en una tarea de clasificación donde la precisión es crítica; se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/routeagent-0.5b-GGUF
- Modelo base: https://huggingface.co/vennyvirtuoso/routeagent-0.5b
- Página de overview de cuantizaciones: https://hf.tst.eu/model#routeagent-0.5b-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
