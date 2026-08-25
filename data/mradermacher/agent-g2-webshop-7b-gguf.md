# mradermacher/Agent-G2-webshop-7b-GGUF

## Resumen

El modelo `mradermacher/Agent-G2-webshop-7b-GGUF` es una versión cuantizada en formato GGUF del modelo `xiamoent/Agent-G2-webshop-7b`, desarrollado por el equipo de mradermacher. Este modelo es un agente conversacional entrenado específicamente para tareas de compra en línea simuladas (WebShop), utilizando técnicas de aprendizaje por refuerzo (reinforcement learning) con el algoritmo GRPO (Group Relative Policy Optimization). Su propósito principal es demostrar cómo un modelo de lenguaje puede actuar como un agente autónomo en entornos de navegación web, tomando decisiones y ejecutando acciones para completar tareas de compra.

El modelo base es un Qwen2.5-7B (según las etiquetas del repositorio) ajustado con datos del dataset `xiamoent/Agent-G2-ALFWorld-Webshop-sft-data`. Esta versión GGUF ofrece múltiples niveles de cuantización, lo que permite su ejecución en hardware de consumo con requisitos de VRAM reducidos. Aunque el modelo está orientado a un caso de uso muy específico (WebShop), conserva las capacidades generales de un LLM de 7B, lo que lo hace útil para experimentación en entornos de agentes y para evaluar técnicas de cuantización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5 (según etiquetas del modelo) |
| Parametros totales | 7.615.610.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (probablemente 32K, heredado de Qwen2.5) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (etiqueta `en`) |
| Licencia | No disponible |
| Formato de pesos | GGUF (safetensors disponibles en el modelo base) |

## Arquitectura y entrenamiento

El modelo base `xiamoent/Agent-G2-webshop-7b` se construye sobre la arquitectura Qwen2.5-7B, un transformer decoder-only con attention causal. El ajuste se realizó mediante aprendizaje por refuerzo, concretamente con el algoritmo GRPO, sobre un dataset de interacciones en WebShop (entorno simulado de compras online). El dataset `xiamoent/Agent-G2-ALFWorld-Webshop-sft-data` contiene episodios de navegación y acciones de agentes, lo que permite al modelo aprender a interpretar observaciones, seleccionar acciones y razonar sobre el estado del entorno.

El entrenamiento se enmarca en el proyecto Agent-G2 (ZJU-REAL), que explora el uso de RL para el desarrollo de agentes de lenguaje. No se dispone de detalles sobre el número exacto de tokens de entrenamiento, la composición completa del dataset o si se emplearon técnicas adicionales como RLHF o DPO. El modelo cuantizado por mradermacher es una conversión estática de los pesos originales a formato GGUF, sin cambios en la arquitectura.

## Capacidades

- Generación de texto y razonamiento: al estar basado en Qwen2.5-7B, mantiene capacidades generales de generación, comprensión y razonamiento.
- Agente de compra en WebShop: el modelo está especializado en interactuar con el entorno WebShop, tomando decisiones de búsqueda, selección de productos y finalización de compra.
- Soporte de tool calling: aunque no se especifica explícitamente, el uso en tareas de agente sugiere capacidad de seguir instrucciones de acción y formato de salida estructurado.
- Capacidad multilingüe: solo se indica inglés (`en`), por lo que el soporte multilingüe no está confirmado.
- No se mencionan capacidades de visión, audio ni modo de pensamiento explícito.

## Casos de uso

- **Evaluación de agentes en entornos simulados**: el modelo puede usarse para probar algoritmos de RL o técnicas de prompting en el entorno WebShop, permitiendo comparar rendimiento con otros agentes.
- **Prototipado de asistentes de compra**: aunque el entorno es simulado, el modelo puede servir como base para desarrollar un asistente de compras real que entienda instrucciones en lenguaje natural y genere acciones estructuradas.
- **Investigación en agentic reinforcement learning**: es un ejemplo práctico de aplicación de GRPO, útil para estudiar cómo el RL moldea el comportamiento de un LLM en tareas de decisión secuencial.
- **Despliegue en edge devices**: gracias a las cuantizaciones GGUF, se puede ejecutar en dispositivos con pocos recursos (como Raspberry Pi o portátiles sin GPU) para pruebas de concepto.
- **Integración en pipelines de automatización**: aunque no está diseñado para producción general, se puede utilizar como módulo de decisión en un pipeline de automatización de tareas web, siempre que se adapte el formato de salida.
- **Estudio de cuantización**: al ser una versión GGUF, permite analizar el impacto de la cuantización en el rendimiento de un agente, comparando las distintas precisiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni métricas específicas de WebShop (como éxito de compra, pasos por tarea, etc.) en el repositorio ni en los resultados de búsqueda web.

## Requisitos de hardware

- **VRAM estimada**: según la cuantización, se puede ejecutar en GPU con al menos 4-5 GB de VRAM para Q4_K_M (4.8 GB de pesos) y hasta 16 GB para f16. Con Q2_K (3.1 GB) es posible usar GPUs con 4 GB.
- **GPU recomendadas**: RTX 3060 (12 GB) o superior para las cuantizaciones medias; para Q8_0 (8.2 GB) se recomienda RTX 3090 o A100. Para f16 (15.3 GB) se necesita una GPU con al menos 16 GB.
- **Consumer GPU**: sí, cabe en la mayoría de GPUs de consumo con 8-12 GB (RTX 3060, RTX 4070, etc.) usando Q4_K_M o Q5_K_M.
- **Opciones de despliegue**: al ser GGUF, se puede usar con llama.cpp, Ollama, LM Studio, o servidores como llama-cpp-python. No hay compatibilidad directa con vLLM o TGI para GGUF, pero se puede convertir a otros formatos si es necesario.
- **Latencia y throughput**: no se dispone de datos concretos. En una RTX 3060 con Q4_K_M, se espera una velocidad de 20-30 tokens/s aproximadamente (estimación general para un modelo de 7B).

## Comparativa con modelos similares

No se dispone de información para comparar con otros modelos de la misma categoría (agentes de webshop). Se puede comparar con el modelo base sin cuantizar (xiamoent/Agent-G2-webshop-7b) o con el modelo de 1.5B (Agent-G2-webshop-1.5b), pero no hay datos de rendimiento publicados. La siguiente tabla muestra una comparación estructural:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Agent-G2-webshop-7b (base) | 7.6B | no disponible | no disponible | Hugging Face (safetensors) |
| Agent-G2-webshop-7b-GGUF (este) | 7.6B | no disponible | no disponible | Hugging Face (GGUF) |
| Agent-G2-webshop-1.5b-GGUF | 1.5B | no disponible | no disponible | Hugging Face (GGUF) |

No hay datos de rendimiento comparativo.

## Limitaciones y advertencias

- **Especialización limitada**: el modelo está entrenado específicamente para WebShop; puede no generalizar bien a otras tareas de agentes o a entornos reales de comercio electrónico.
- **Riesgo de alucinación**: al ser un modelo de lenguaje, puede generar acciones o respuestas incorrectas si se le da un contexto ambiguo.
- **Idioma**: solo se ha entrenado en inglés, por lo que su uso en otros idiomas puede degradar su rendimiento.
- **Licencia no especificada**: no se indica la licencia del modelo, lo que plantea incertidumbre sobre su uso comercial. Se debe contactar con el autor o consultar el modelo base para aclarar los términos.
- **Falta de documentación técnica**: no se han publicado detalles sobre el entrenamiento, los datos o los benchmarks, lo que dificulta su evaluación rigurosa.
- **Formato GGUF**: las cuantizaciones estáticas pueden perder algo de calidad en comparación con las cuantizaciones dinámicas o la versión completa. No se dispone de cuantizaciones con imatrix en este repositorio.
- **Fecha de creación**: el modelo se creó en agosto de 2026, pero no hay garantía de que sea estable o esté mantenido.

## Enlaces

- [Repositorio HuggingFace del modelo GGUF](https://huggingface.co/mradermacher/Agent-G2-webshop-7b-GGUF)
- [Modelo base en HuggingFace](https://huggingface.co/xiamoent/Agent-G2-webshop-7b)
- [Perfil de mradermacher](https://huggingface.co/mradermacher)
- [Repositorio Agent-G2 en GitHub](https://github.com/ZJU-REAL/Agent-G2) (incluye ejemplos de entrenamiento)
- [Modelo de 1.5B GGUF](https://huggingface.co/mradermacher/Agent-G2-webshop-1.5b-GGUF) (variante más pequeña)
