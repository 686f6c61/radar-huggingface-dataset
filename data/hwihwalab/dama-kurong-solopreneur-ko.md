# hwihwalab/dama-kurong-solopreneur-ko

## Resumen

`dama-kurong-solopreneur-ko` es un modelo de lenguaje conversacional en coreano, desarrollado por Hwihwa Lab, que consiste en un ajuste fino (fine-tuning) con LoRA sobre el modelo base `google/gemma-2-2b-it` de Google. Está diseñado específicamente para actuar como un asistente virtual con la personalidad de "Kurong", un personaje tipo Tamagotchi, orientado a emprendedores individuales, autónomos y trabajadores independientes (solopreneurs). El modelo integra conocimientos prácticos de negocio en áreas como atención al cliente, gestión de incidencias, lanzamiento de productos y cuidado de la salud mental, todo ello en un formato de conversación natural en coreano.

El modelo tiene 2.614.341.888 parámetros (2,6 mil millones), lo que lo sitúa en la gama de modelos pequeños, adecuados para ejecución en dispositivos locales o en entornos con recursos limitados. Su licencia es `gemma`, la misma que la del modelo base, y se distribuye en formato `safetensors`. Aunque no se especifica la longitud de contexto en la documentación proporcionada, al estar basado en Gemma-2-2B, hereda la ventana de contexto de 8.192 tokens de dicho modelo. Su relevancia radica en ofrecer una alternativa ligera y especializada para el mercado coreano de asistentes personales con enfoque empresarial, combinando un tono cercano con consejos prácticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma-2) |
| Parametros totales | 2.614.341.888 (2,6 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, presumiblemente 8.192 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | gemma |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma-2, un transformer decoder-only con atención causal, desarrollado por Google. El ajuste fino se realizó mediante la técnica LoRA (Low-Rank Adaptation) utilizando la librería Unsloth, que optimiza el proceso de entrenamiento para reducir el consumo de memoria y acelerar el fine-tuning. El modelo base es `google/gemma-2-2b-it`, la versión instruct de 2.000 millones de parámetros, ya entrenada para seguir instrucciones y mantener diálogos.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens utilizados ni el proceso de alineación (RLHF, DPO, etc.). Según la model card, el ajuste incorpora alrededor de 40 tipos de conocimientos prácticos para solopreneurs, incluyendo guías de atención al cliente, redacción de comunicados de incidencias, definición de MVP (producto mínimo viable), gestión de precios y rutinas de descanso mental. También se entrenó para que el modelo responda con una identidad propia ("Kurong") cuando se le pregunta quién es.

## Capacidades

- Generación de texto conversacional en coreano, con un tono cercano y empático.
- Conocimientos específicos para emprendedores individuales: atención al cliente, gestión de crisis, lanzamiento de productos, estrategias de precios.
- Capacidad de mantener una persona consistente (asistente tipo Tamagotchi) a lo largo de la conversación.
- Respuestas a preguntas sobre identidad y funciones del asistente.
- No se menciona soporte para tool calling, function calling, agentes multi-paso ni razonamiento complejo.
- No se indica capacidad multilingüe; el modelo está entrenado únicamente para coreano.
- No se menciona modo de pensamiento (thinking mode) ni capacidades multimodales (visión, audio).

## Casos de uso

- Atención al cliente para solopreneurs: el modelo puede redactar respuestas a clientes que realizan su primer pago, gestionar quejas o explicar políticas de devolución, gracias a su entrenamiento en guías de CS (customer service) específicas para negocios unipersonales.
- Redacción de comunicados de incidencias: cuando un servicio sufre una caída o error, el modelo puede generar un mensaje de disculpa profesional y tranquilizador, adaptado al tono de la marca.
- Definición de MVP: el asistente puede ayudar a priorizar funcionalidades mínimas para un primer lanzamiento, basándose en las guías de negocio incorporadas.
- Gestión de precios: puede sugerir estrategias para comunicar subidas de precios a clientes existentes, un escenario delicado para autónomos.
- Consejos de productividad y bienestar: ofrece rutinas para recuperar la concentración, gestionar la fatiga mental o aprovechar mejor las mañanas, útil para trabajadores independientes que gestionan su propio tiempo.
- Asistente personal en dispositivos de escritorio: gracias a su tamaño reducido, puede integrarse en aplicaciones tipo Tamagotchi o widgets de escritorio que requieren respuestas rápidas y ligeras, sin depender de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras evaluaciones estándar para este modelo.

## Requisitos de hardware

- Al tratarse de un modelo de 2,6 mil millones de parámetros, la VRAM estimada para inferencia en precisión FP16 es de aproximadamente 5,2 GB (sin contar overhead). Con cuantización a 8 bits podría reducirse a unos 2,6 GB, y a 4 bits a unos 1,3 GB, aunque no se han confirmado oficialmente estas cifras.
- Es viable en GPUs de consumo como la NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores. También podría ejecutarse en GPUs con 6 GB de VRAM si se aplica cuantización.
- Para despliegue, se puede utilizar `transformers` con PyTorch, o servidores de inferencia como vLLM, TGI (Text Generation Inference) o llama.cpp (si se convierte a GGUF). No se indica compatibilidad explícita con Ollama, pero al ser un modelo estándar de HuggingFace, es probable que funcione.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de la misma categoría (asistentes coreanos para solopreneurs). Se podría comparar con el modelo base `google/gemma-2-2b-it` o con otros modelos pequeños en coreano, pero no hay datos de rendimiento disponibles. Por tanto, la comparativa se limita a señalar que el modelo es un fine-tuning especializado de Gemma-2-2B, con la misma arquitectura y tamaño, pero con un enfoque de dominio específico.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en coreano; no es adecuado para otros idiomas.
- Al ser un fine-tuning de pequeño tamaño, puede presentar alucinaciones o respuestas inexactas, especialmente en temas fuera de su dominio de entrenamiento.
- No se han publicado evaluaciones de sesgos ni de seguridad. Al ser un modelo conversacional, podría generar contenido inapropiado si se le provoca.
- La licencia `gemma` impone restricciones de uso comercial según los términos de Google; es necesario revisar la licencia completa antes de utilizarlo en productos comerciales.
- No se dispone de información sobre la calidad del ajuste en términos de robustez; el modelo tiene 0 descargas y 0 likes en HuggingFace, lo que sugiere que no ha sido ampliamente probado por la comunidad.
- El contexto máximo no está documentado en la model card; aunque se hereda del modelo base, no se garantiza que el fine-tuning mantenga el mismo rendimiento en secuencias largas.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/hwihwalab/dama-kurong-solopreneur-ko)
- [Perfil del autor (Hwihwa Lab)](https://huggingface.co/hwihwalab)
- [Modelo base: google/gemma-2-2b-it](https://huggingface.co/google/gemma-2-2b-it)
