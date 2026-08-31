# p-p-n/Huvm

## Resumen

Huvm es un modelo de lenguaje compacto, ajustado por instrucciones, desarrollado por el usuario p-p-n a partir del modelo base Qwen/Qwen2.5-1.5B-Instruct mediante fine-tuning con LoRA. Su objetivo es ofrecer un asistente local y offline, rápido y con una personalidad distintiva, combinando un 50 % del estilo directo y ligeramente sarcástico de Grok con un 50 % de la articulación y profundidad de Claude. Está diseñado para ejecutarse en CPU o en dispositivos móviles mediante cuantización GGUF, lo que lo hace accesible para entornos sin GPU dedicada.

El modelo se presenta como una alternativa ligera para tareas de generación de texto, código, matemáticas y conversación multilingüe, con soporte para portugués, inglés, español, italiano, alemán y chino. Su entrenamiento se realizó sobre un conjunto de datos personalizado de aproximadamente 40 ejemplos, con 5 épocas y en CPU, lo que limita su cobertura temática pero refuerza su comportamiento y tono. A pesar de su pequeño tamaño (1.5B parámetros), el autor afirma que ofrece una calidad razonable para su escala, aunque no está pensado para aplicaciones de alto riesgo o críticas de seguridad.

La relevancia de Huvm radica en su enfoque en la portabilidad y la personalidad, ofreciendo una experiencia de chat local sin depender de servicios en la nube. Su licencia MIT permite uso comercial y modificación sin restricciones significativas, lo que lo convierte en una opción interesante para prototipos y aplicaciones embebidas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen2.5) |
| Parametros totales | 1.5B (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no especificada en la documentación |
| Tipos de cuantizacion | q4_k_m (GGUF) |
| Idiomas soportados | pt, en, es, it, de, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (Transformers) y GGUF |

## Arquitectura y entrenamiento

Huvm se basa en la arquitectura transformer del modelo Qwen2.5-1.5B-Instruct, un modelo de lenguaje autoregresivo con 1.5 mil millones de parámetros. El fine-tuning se realizó mediante LoRA (r=16, alpha=32) aplicado a las capas de proyección de atención, utilizando el `SFTTrainer` de la librería TRL de Hugging Face. El entrenamiento se llevó a cabo en CPU (AMD Ryzen 5 con 16 GB de RAM) en float32, durante 5 épocas, sobre un dataset personalizado en formato JSONL que incluye ejemplos de comportamiento (identidad, idioma, código, matemáticas, creatividad, conocimiento) y anti-patrones (qué no hacer). No se menciona el uso de RLHF ni DPO; el ajuste se limita a supervisión directa.

El dataset es muy reducido (aproximadamente 40 ejemplos), lo que implica que el modelo refuerza principalmente su identidad y estilo, pero su cobertura de conocimiento general depende del modelo base. No se detallan innovaciones técnicas adicionales como decodificación especulativa o atención lineal; el modelo se presenta como un fine-tuning estándar con LoRA.

## Capacidades

- Generación de texto conversacional con una personalidad definida (directa, sarcástica en tono ligero, y profunda cuando se requiere).
- Explicación de código: describe qué hace el código y por qué, no solo muestra el resultado.
- Resolución de problemas matemáticos mostrando el razonamiento paso a paso.
- Creatividad en respuestas, evitando salidas genéricas.
- Chat multilingüe: responde en el idioma del usuario (portugués, inglés, español, italiano, alemán y chino).
- Capacidad de seguir instrucciones en formato chat (system, user, assistant) mediante el template de chat de Qwen2.5.
- No se menciona soporte para tool calling, function calling, agentes, visión ni audio.

## Casos de uso

- Asistente de programación local: un desarrollador puede ejecutar Huvm en su portátil sin GPU para obtener explicaciones de fragmentos de código, depuración o sugerencias de implementación, aprovechando su capacidad de explicar el "porqué" del código.
- Tutor de matemáticas offline: estudiantes o profesionales pueden plantear problemas y recibir soluciones razonadas, útiles para aprender métodos de resolución sin conexión a internet.
- Chat multilingüe en dispositivos móviles: gracias al GGUF cuantizado (~940 MB), puede integrarse en apps de mensajería o asistentes personales que funcionen en smartphones con al menos 6 GB de RAM.
- Generación de contenido creativo: redacción de historias, poemas o ideas con un tono distintivo, útil para escritores que buscan inspiración o variaciones de estilo.
- Prototipado rápido de agentes conversacionales: al ser ligero y con licencia MIT, permite experimentar con sistemas de diálogo en entornos de desarrollo sin coste de API.
- Educación y divulgación: como modelo de demostración para enseñar conceptos de fine-tuning, LoRA y cuantización, dado su pequeño tamaño y facilidad de ejecución en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar. El autor solo menciona que la calidad es "razonable" para su tamaño, pero sin cifras concretas.

## Requisitos de hardware

- El modelo está diseñado para ejecutarse en CPU; el entrenamiento se realizó en un AMD Ryzen 5 con 16 GB de RAM, por lo que la inferencia en CPU es viable.
- El archivo GGUF q4_k_m ocupa aproximadamente 940 MB, lo que permite su uso en dispositivos móviles con ~6 GB de RAM.
- No se especifican requisitos de VRAM para GPU, pero al ser un modelo de 1.5B parámetros, es probable que quepa en GPUs consumer con 4-6 GB de VRAM en cuantización, aunque no se confirma.
- Opciones de despliegue: llama.cpp (mediante el archivo GGUF) y Hugging Face Transformers (con safetensors). No se mencionan vLLM, Ollama ni TGI, aunque podrían ser compatibles.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de datos comparativos en la documentación del modelo. Huvm es un fine-tuning de Qwen2.5-1.5B-Instruct, por lo que comparte arquitectura y tamaño con este último, pero no se ofrecen métricas de rendimiento relativas a otros modelos de la misma categoría (por ejemplo, Phi-3-mini, Gemma-2-2B o el propio Qwen2.5-1.5B-Instruct). Se recomienda consultar benchmarks externos si se requiere una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo pequeño (1.5B parámetros): puede alucinar o repetir frases genéricas en temas complejos.
- Conocimiento limitado: fecha de referencia 2026-08-30, no actualizado en tiempo real.
- Dataset de fine-tuning muy reducido (~40 ejemplos): la cobertura temática es estrecha y el comportamiento puede ser inconsistente fuera de los patrones entrenados.
- No se ha realizado un ajuste de seguridad adicional más allá del modelo base; se recomienda supervisión humana en aplicaciones sensibles.
- No está destinado a aplicaciones de alto riesgo o críticas de seguridad.
- La licencia MIT permite uso comercial, pero el modelo base Qwen2.5-1.5B-Instruct tiene su propia licencia (Apache 2.0), que debe respetarse en la redistribución.

## Enlaces

- [Hugging Face - p-p-n/Huvm](https://huggingface.co/p-p-n/Huvm)
