# darioooooo0o/K2-Horizon-0.9B-GGUF

## Resumen

K2-Horizon-0.9B es un modelo de lenguaje denso de aproximadamente 1.078 millones de parámetros, desarrollado por IFM (Instituto for Foundation Models, en su rama MBZUAI-IFM) y publicado en HuggingFace como `IFM/K2-Horizon-0.9B`. Esta ficha describe la versión cuantizada en formato GGUF creada por `darioooooo0o`, que está pensada para ejecutarse con llama.cpp usando la rama especial `k2-official`. El modelo puede usarse para generación de texto, razonamiento, tool calling y tareas de agente, y está optimizado para experimentación local y despliegue en hardware de consumo.

Según el material publicado por IFM, el modelo obtiene una puntuación superior a 48 en AIME 2026, lo que indica una capacidad de razonamiento matemático notable para un modelo de este tamaño. La arquitectura `k2-horizon` no está soportada en llama.cpp estándar, por lo que requiere una compilación específica de la rama oficial de MBZUAI-IFM. Esto lo convierte en una opción interesante para investigación y prototipado, pero limita su integración en ecosistemas convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense transformer (k2-horizon) |
| Parametros totales | 1.078.285.824 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el ejemplo de uso del autor emplea 8.192 tokens) |
| Tipos de cuantizacion | Q3_K_M, Q4_K_S, Q4_K_M, Q5_K_M, Q8_0 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones k-quants sobre pesos BF16 del modelo base) |

## Arquitectura y entrenamiento

K2-Horizon-0.9B es un modelo denso dentro de la familia K2-Horizon de IFM, que también incluye variantes más grandes y modelos MoE. El modelo base se publicó en tensiones safetensors y esta versión es una conversión a GGUF realizada con la rama `k2-official` de llama.cpp (commit 35999d101 del port de MBZUAI-IFM). No se han publicado en la información disponible detalles sobre el dataset de entrenamiento, el número de tokens ni la aplicación de técnicas como RLHF o DPO. La innovación técnica más significativa es la propia arquitectura `k2-horizon`, que requiere un fork específico de llama.cpp para su ejecución; la rama mainline no la soporta.

## Capacidades

- Generación de texto conversacional con soporte de inferencia en formato GGUF.
- Razonamiento matemático: según el blog de IFM, el modelo obtiene una puntuación superior a 48 en AIME 2026.
- Tool calling y function calling: IFM destaca capacidades sólidas de uso de herramientas.
- Razonamiento multi-paso y capacidades de agente, reconocidas por el desarrollador.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y uso en tareas de generación de texto.
- Modelo compacto orientado a experimentación local y análisis de checkpoints, según la documentación de vLLM.

## Casos de uso

- Prototipado de agentes en entornos locales: el modelo ocupa entre 0,5 y 1,1 GB según cuantización, por lo que puede ejecutarse en GPUs de consumidor o incluso iGPU, permitiendo iterar rápidamente sobre flujos con tool calling.
- Razonamiento matemático en educación o tutoria: su resultado en AIME 2026 sugiere utilidad para resolver problemas de competición que requieren varios pasos de deducción.
- Asistentes conversacionales con recursos limitados: al caber en una RTX 3060 12GB sin offload a CPU, escala bien en servidores modestos o estaciones de trabajo de bajo coste.
- Automatización de tareas en CI/CD: su capacidad de tool use permite integrarlo como componente de decisión en pipelines donde hay que analizar salidas de comandos o activar acciones.
- Investigación sobre alineación y análisis de checkpoints: la familia K2-Horizon está diseñada para estudios de modelos transparentes, y esta versión cuantizada facilita comparar comportamientos en distintas precisiones.
- Despliegue ligero en producción con vLLM: existe una receta oficial para IFM/K2-Horizon-0.9B, lo que permite servir el modelo con inferencia eficiente y batching.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible, salvo el dato recogido del sitio de IFM.

| Benchmark | Resultado | Fuente |
|---|---|---|
| AIME 2026 | >48 | ifm.ai/blog/k2 |

No se dispone de más datos comparativos en la documentación consultada.

## Requisitos de hardware

- VRAM estimada: dependiendo de la cuantización, el archivo oscila entre 0,5 GB (Q3_K_M) y 1,1 GB (Q8_0); el Q4_K_M pesa aproximadamente 0,6 GB.
- El autor indica que el modelo "cabe por completo en cualquier GPU moderna, incluso iGPU", sin necesidad de offload a CPU.
- GPU recomendada: RTX 3060 12GB, utilizada para verificar la carga y generación de todos los cuants.
- Opciones de despliegue: llama.cpp usando la rama `k2-official` de MBZUAI-IFM/llama.cpp. También existe una receta de vLLM para el modelo base.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye benchmarks ni comparaciones con otros modelos de tamaño similar, como Qwen 1.5B o Llama 3.2 1B. Además, la arquitectura `k2-horizon` no es compatible con las builds estándar de llama.cpp, lo que dificulta una comparación directa con modelos de despliegue convencional.

## Limitaciones y advertencias

- La arquitectura `k2-horizon` no está soportada en llama.cpp mainline; es imprescindible usar la rama `k2-official` de MBZUAI-IFM, lo que complica su integración en herramientas estándar como Ollama o TGI por defecto.
- No se han publicado datos sobre sesgos ni evaluación de seguridad, y no hay información sobre el dataset de entrenamiento.
- Al ser un modelo pequeño de 0.9B, el riesgo de alucinación puede ser mayor que en modelos más grandes, especialmente en tareas abiertas.
- Los idiomas soportados no están especificados; el material disponible sugiere un enfoque principal en inglés, sin poder confirmarlo.
- El repositorio de la cuantización no tiene descargas ni likes, lo que indica una adopción muy limitada y una validación de la comunidad inexistente hasta el momento.

## Enlaces

- HuggingFace de la cuantizacion: https://huggingface.co/darioooooo0o/K2-Horizon-0.9B-GGUF
- Modelo base en HuggingFace: https://huggingface.co/IFM/K2-Horizon-0.9B
- Blog de IFM: https://ifm.ai/blog/k2
- Receta de vLLM para el modelo base: https://recipes.vllm.ai/IFM/K2-Horizon-0.9B
- Repositorio de llama.cpp de MBZUAI-IFM: https://github.com/MBZUAI-IFM/llama.cpp
- Perfil de X del autor de la cuantizacion: https://x.com/imdariotoo
