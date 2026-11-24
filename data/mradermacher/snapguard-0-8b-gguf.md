# mradermacher/SnapGuard-0.8B-GGUF

## Resumen

SnapGuard-0.8B es un modelo de decisión (decision model) especializado en seguridad y guardrails, desarrollado originalmente por AurelPx y cuantizado a formato GGUF por mradermacher. Su función no es la generación de texto libre, sino la clasificación y el filtrado de entradas y salidas en pipelines de IA: detecta intentos de prompt injection, jailbreak y contenido inseguro. Con 779.717.956 parámetros (aproximadamente 0,8 mil millones), está diseñado para ejecutarse como una capa de control ligera y de baja latencia delante o detrás de un modelo generativo principal.

El modelo se construye sobre una base Qwen3.5 mediante un ajuste fino con LoRA (herramienta Unsloth) y se distribuye bajo licencia Apache 2.0, lo que facilita su integración en productos comerciales. Soporta cinco idiomas (inglés, francés, alemán, español e italiano) y su reducido tamaño permite desplegarlo en hardware modesto, incluso en CPU, lo que lo hace adecuado para entornos de producción con requisitos estrictos de latencia y coste.

Esta ficha documenta la versión cuantizada publicada por mradermacher, que incluye múltiples niveles de cuantización GGUF (desde Q2_K hasta f16) y suplementos multimodales (mmproj). Es relevante ahora porque la proliferación de agentes y aplicaciones basadas en LLM ha convertido la protección frente a inyecciones de prompt y jailbreaks en una necesidad operativa, y un guardrail de menos de mil millones de parámetros ofrece una relación coste/eficacia atractiva frente a soluciones basadas en modelos de mayor tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5 con ajuste fino LoRA) |
| Parametros totales | 779.717.956 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en, fr, de, es, it |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base original en safetensors |

## Arquitectura y entrenamiento

SnapGuard-0.8B se basa en la arquitectura transformer de Qwen3.5, adaptada mediante un ajuste fino con LoRA (Low-Rank Adaptation) llevado a cabo con la librería Unsloth. El resultado es un modelo de decisión: en lugar de generar texto abierto, está orientado a producir una clasificación o veredicto sobre si una entrada constituye un intento de prompt injection, jailbreak o contenido inseguro. El repositorio cuantizado incluye además suplementos multimodales (mmproj), lo que sugiere que el modelo base podría procesar también entradas con componente visual, aunque la model card no detalla el alcance exacto de esa capacidad.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card del repositorio cuantizado se limita a describir el proceso de cuantización y los ficheros generados, sin detallar el pipeline de entrenamiento del modelo original. Tampoco se documentan innovaciones técnicas específicas más allá del uso de LoRA y Unsloth para el ajuste.

## Capacidades

- Clasificación de seguridad: detección de prompt injection y jailbreak en entradas de usuario.
- Filtrado de contenido: evaluación de salidas o entradas frente a políticas de seguridad (guardrails).
- Modelo de decisión: produce veredictos estructurados en lugar de texto libre, adecuado para integrarse como paso de control en pipelines.
- Multilingüe: soporte declarado para inglés, francés, alemán, español e italiano.
- Procesamiento multimodal: el repositorio incluye ficheros mmproj (Q8_0 y f16), lo que indica soporte de entrada con componente visual, aunque no se detalla su alcance.
- Integración con transformers y endpoints compatibles, según las etiquetas del repositorio.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Filtrado de prompt injection en APIs de LLM: colocar SnapGuard como paso previo a un modelo generativo para clasificar y bloquear entradas maliciosas antes de que lleguen al modelo principal, aprovechando su baja latencia y su tamaño reducido.
- Moderación de contenido en aplicaciones de chat: evaluar los mensajes de usuario en un chatbot multilingüe (español, inglés, francés, alemán, italiano) y derivar los casos inseguros a revisión o respuesta controlada.
- Guardrail de salida en agentes autónomos: interceptar las respuestas o acciones propuestas por un agente antes de ejecutarlas, verificando que no contravienen políticas de seguridad.
- Protección de sistemas RAG: clasificar las consultas de usuario antes de la recuperación de documentos, evitando que instrucciones maliciosas manipulen el contexto recuperado.
- Despliegue en el edge o en CPU: al caber en cuantizaciones de 0,5 a 0,9 GB, puede ejecutarse en servidores sin GPU o en dispositivos con recursos limitados, como pasarelas de API o proxies.
- Evaluación por lotes de datasets: clasificar grandes volúmenes de prompts para auditar la exposición a ataques o para construir datasets de entrenamiento de guardrails, gracias a su reducido coste computacional.
- Capa de defensa en profundidad: combinarlo con otros guardrails o con modelos mayores para añadir una verificación rápida y barata en un pipeline de seguridad por capas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-0,6 GB en Q2_K/Q4_K, 0,7-0,9 GB en Q5_K/Q8_0 y 1,7 GB en f16 (tamaños de fichero indicados en la model card).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, GTX 1650, RTX 3050); en la práctica, el modelo cabe holgadamente en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- Cabe en consumer GPU: sí, en prácticamente cualquier GPU moderna de consumo e incluso en iGPU con memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base puede ejecutarse con transformers.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño (menos de 1.000 millones de parámetros), se espera una latencia baja en GPU y aceptable en CPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| SnapGuard-0.8B (esta ficha) | 779.717.956 | no disponible | en, fr, de, es, it | Apache 2.0 | GGUF, safetensors |
| Llama Guard (Meta) | no disponible en esta ficha | no disponible | no disponible | licencia Llama | safetensors, GGUF (comunitario) |
| ShieldGemma (Google) | no disponible en esta ficha | no disponible | no disponible | licencia Gemma | safetensors, GGUF (comunitario) |
| Granite Guardian (IBM) | no disponible en esta ficha | no disponible | no disponible | Apache 2.0 | safetensors, GGUF (comunitario) |

No se dispone de datos verificados de parámetros, contexto ni rendimiento de los modelos alternativos en la información proporcionada; la comparación se limita a la categoría funcional (guardrails de seguridad) y a la licencia. No se han publicado benchmarks comparativos para SnapGuard-0.8B en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un clasificador de seguridad, puede heredar sesgos de su dataset de entrenamiento (no especificado).
- Riesgo de alucinación: como modelo de decisión, el riesgo se traduce en falsos positivos y falsos negativos al clasificar entradas; no se han publicado tasas de error.
- Limitaciones de contexto o idioma: la longitud de contexto no está documentada; el soporte multilingüe se limita a cinco idiomas (en, fr, de, es, it) y no se garantiza su comportamiento en otros.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5 y del modelo original AurelPx/SnapGuard-0.8B.
- Caveats para producción: la model card del repositorio cuantizado no detalla el formato exacto de salida ni las instrucciones de uso del modelo de decisión; es necesario consultar la model card del modelo original. Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar la fiabilidad de la clasificación. No se han publicado evaluaciones independientes de robustez frente a ataques adversariales.
- Los cuantizados ponderados/imatrix no están disponibles según el autor de la cuantización.

## Enlaces

- Repositorio Hugging Face (cuantizado): https://huggingface.co/mradermacher/SnapGuard-0.8B-GGUF
- Modelo original: https://huggingface.co/AurelPx/SnapGuard-0.8B
- Página de descargas del cuantizador: https://hf.tst.eu/model#SnapGuard-0.8B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
