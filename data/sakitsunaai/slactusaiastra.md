# SakitsunaAI/SlactusAIAstra

## Resumen

SlactusAIAstra es un modelo de lenguaje de 1.170 millones de parámetros desarrollado por SakitsunaAI, obtenido mediante fine-tuning del modelo base unsloth/LFM2.5-1.2B-Instruct. Está diseñado para generación de texto conversacional en inglés y se distribuye bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones significativas. El entrenamiento se realizó con la librería Unsloth, que acelera el proceso de fine-tuning, y con TRL (Transformer Reinforcement Learning) mediante supervisión directa (SFT).

Su relevancia radica en ofrecer un modelo compacto y eficiente para tareas de conversación, adecuado para entornos con recursos limitados. Al estar basado en LFM2.5, hereda una arquitectura transformer moderna, aunque no se han publicado detalles específicos sobre su configuración interna. El repositorio incluye pesos en formato safetensors y es compatible con el ecosistema de Hugging Face y text-generation-inference.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en LFM2.5-1.2B-Instruct) |
| Parametros totales | 1.170.340.608 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint unsloth/LFM2.5-1.2B-Instruct, que a su vez es una versión optimizada del modelo LFM2.5 de 1.2B parámetros. No se han publicado detalles sobre la arquitectura interna (número de capas, heads, etc.), pero se asume una arquitectura transformer estándar con atención causal. El entrenamiento se realizó con Unsloth, una librería que optimiza el fine-tuning mediante kernels eficientes, logrando una velocidad 2x superior a los métodos convencionales. Se utilizó la técnica de Supervised Fine-Tuning (SFT) con la librería TRL, aunque no se especifica la composición del dataset de entrenamiento ni el número de tokens utilizados.

## Capacidades

- Generación de texto conversacional en inglés.
- Respuesta a instrucciones y preguntas de tipo chat.
- Fine-tuning específico para diálogo, lo que sugiere capacidad de mantener conversaciones multi-turno (aunque no se confirma la longitud de contexto).
- Compatible con pipelines de transformers y text-generation-inference para despliegue en producción.
- No se han documentado capacidades avanzadas como tool calling, razonamiento multi-paso o soporte multimodal.

## Casos de uso

- Chatbots de atención al cliente: al ser un modelo pequeño y rápido, puede integrarse en sistemas de soporte básico en inglés, gestionando consultas frecuentes y derivando casos complejos a agentes humanos.
- Prototipado de aplicaciones conversacionales: ideal para validar ideas de productos que requieran un asistente de texto sin invertir en infraestructura de gran escala.
- Generación de respuestas automáticas en foros o redes sociales: puede redactar respuestas cortas y coherentes en inglés, reduciendo el trabajo manual de moderación.
- Asistentes virtuales embebidos en dispositivos con recursos limitados: su tamaño permite ejecutarse en CPUs o GPUs de baja gama, habilitando asistentes locales sin conexión.
- Fine-tuning adicional para dominios específicos: al ser un modelo base compacto, puede adaptarse a tareas concretas (soporte técnico, educación, etc.) con datasets reducidos.
- Educación y experimentación: sirve como punto de partida para estudiantes e investigadores que quieran estudiar fine-tuning y despliegue de LLMs sin requerir hardware costoso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.17B parámetros en FP16, se requieren aproximadamente 2.3 GB de VRAM (sin cuantización). Con cuantización de 8 bits, ~1.2 GB; con 4 bits, ~0.6 GB. Estas son estimaciones basadas en el tamaño del modelo, no en mediciones oficiales.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, o superiores). También puede ejecutarse en CPU con suficiente RAM (8-16 GB).
- Compatible con consumer GPUs: sí, es adecuado para tarjetas de gama media y baja.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, o directamente con transformers.
- Latencia y throughput: no se han publicado datos oficiales. En una GPU moderna, se espera una latencia de decenas de milisegundos por token, pero depende del hardware y la optimización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SlactusAIAstra | 1.17B | No disponible | Apache-2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1.5B | 32K | Apache-2.0 | Hugging Face |
| Llama-3.2-1B-Instruct | 1.0B | 128K | Llama 3.2 license | Hugging Face |
| Gemma-2-2B | 2.6B | 8K | Gemma license | Hugging Face |

SlactusAIAstra se sitúa en el rango de modelos pequeños (1-2B). Comparado con Qwen2.5-1.5B, tiene menos parámetros y no se conocen sus capacidades de contexto. Llama-3.2-1B ofrece un contexto mucho mayor (128K) y una licencia más restrictiva. Gemma-2-2B es más grande pero con contexto menor. No se dispone de datos de rendimiento para una comparación objetiva.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos o alucinaciones; al ser un modelo pequeño, es probable que presente tasas de alucinación más altas que modelos grandes.
- Limitado al idioma inglés; no se ha entrenado para otros idiomas.
- Longitud de contexto desconocida; puede no manejar conversaciones muy largas o documentos extensos.
- No se especifican restricciones de uso comercial, pero la licencia Apache-2.0 permite uso libre, incluyendo fines comerciales, siempre que se mantenga el aviso de licencia.
- El modelo no incluye capacidades avanzadas como tool calling o razonamiento estructurado, por lo que no es adecuado para tareas de agente complejas.
- La información sobre el dataset de entrenamiento es inexistente, lo que impide evaluar posibles sesgos o calidad de los datos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/SakitsunaAI/SlactusAIAstra)
- [Modelo base unsloth/LFM2.5-1.2B-Instruct](https://huggingface.co/unsloth/LFM2.5-1.2B-Instruct)
- [Unsloth (librería de entrenamiento)](https://github.com/unslothai/unsloth)
