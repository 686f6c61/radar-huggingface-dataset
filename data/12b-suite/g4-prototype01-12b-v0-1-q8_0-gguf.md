# 12B-Suite/G4-Prototype01-12B-v0.1-Q8_0-GGUF

## Resumen

G4 Prototype01 12B v0.1 Q8_0 GGUF es un modelo de lenguaje de 12 mil millones de parámetros, desarrollado por el equipo 12B-Suite como un ajuste fino (fine-tune) del modelo base Gemma 4 12B de Google. Está orientado a tareas de roleplay, escritura creativa y conversación con un enfoque "uncensored" y contenido maduro, entrenado sobre el dataset Dark-Psychology-Secrets. Se distribuye en formato GGUF cuantizado a Q8_0, lo que permite su ejecución en hardware de consumo con herramientas como llama.cpp u Ollama.

La relevancia de este modelo reside en su capacidad para generar narrativas explícitas y psicológicamente complejas, dirigido a desarrolladores que buscan una alternativa abierta y personalizable para aplicaciones de simulación de personajes y escritura creativa, manteniendo la licencia Apache 2.0. Al ser una variante cuantizada del Gemma 4, hereda la arquitectura transformer multimodal del modelo original, aunque el fine-tune se centra en texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gemma 4 12B (transformer multimodal) |
| Parámetros totales | 12 mil millones |
| Parámetros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Gemma 4 soporta hasta 128k, pero no se especifica en la variante) |
| Tipos de cuantización | Q8_0 (GGUF) |
| Idiomas soportados | Inglés (etiqueta `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Gemma 4 12B de Google DeepMind, que es un transformer multimodal capaz de procesar texto, imágenes y audio. Sin embargo, el fine-tune G4 Prototype01 se ha realizado específicamente sobre la rama de texto, utilizando técnicas de ajuste eficiente (PEFT/PMPF) y la biblioteca Unsloth. El dataset empleado es `Naphula-Archives/Dark-Psychology-Secrets`, que contiene contenido de psicología oscura y narrativas maduras. No se han publicado detalles sobre el número de tokens de entrenamiento ni si se aplicó RLHF o DPO; la etiqueta `sft` sugiere que se utilizó entrenamiento supervisado. La cuantización a Q8_0 se realizó posteriormente para facilitar la distribución y ejecución en hardware de gama media.

## Capacidades

- Generación de texto con estilo creativo y narrativo, especializado en roleplay y ficción.
- Soporte para instrucciones y diálogos multi-turno mediante el chat template de Gemma 4.
- Capacidad de producir contenido explícito y "uncensored", sin restricciones de moderación estándar.
- Entrenado con un dataset de psicología oscura, lo que le permite explorar temas de manipulación, persuasión y dinámicas de poder.
- Integración con herramientas de inferencia locales (llama.cpp, Ollama, vLLM) gracias al formato GGUF.
- Multilingüe limitado: aunque la etiqueta indica solo inglés, el modelo base Gemma 4 soporta varios idiomas; no se confirma que el fine-tune conserve esa capacidad.

## Casos de uso

- **Roleplay interactivo**: el modelo puede gestionar personajes complejos y tramas de ficción, manteniendo coherencia en diálogos largos gracias a su contexto extendido (si se hereda del modelo base). Adecuado para juegos de texto o simulación de mundos.
- **Escritura creativa de ficción oscura**: para autores que necesitan explorar temas de psicología, violencia o relaciones tóxicas, el modelo puede generar borradores de escenas y diálogos con un tono realista.
- **Simulación de personajes en chatbots**: integración en plataformas de chat para crear asistentes con personalidades definidas, incluidas variantes "sin filtros" para usuarios adultos.
- **Generación de contenido para juegos de rol**: puede producir misiones, descripciones de escenarios y reacciones de NPCs, agilizando el trabajo de game masters.
- **Investigación en IA conversacional**: para académicos que estudian la generación de texto con contenido sensible o sesgos, el modelo sirve como caso de estudio de un ajuste sin moderación.
- **Prototipado de aplicaciones de psicología**: aunque no es un modelo clínico, puede usarse para crear demos de sistemas que exploran dinámicas de persuasión, siempre con supervisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se incluyen métricas de MMLU, HumanEval, GSM8K ni similares para este modelo específico.

## Requisitos de hardware

- VRAM estimada: para un modelo de 12B en Q8_0, se necesitan aproximadamente 12 GB de memoria solo para los pesos, más memoria adicional para las activaciones y el contexto. Con una ventana de contexto moderada (4k-8k), se requieren entre 14-16 GB de VRAM en total.
- GPU recomendadas: tarjetas con 16 GB de VRAM o más, como NVIDIA RTX 4080/4090, RTX A4000, o GPUs de centro de datos como A10G, A100 (40GB) para mayor comodidad.
- Compatibilidad con GPU de consumo: sí, cabe en RTX 3090/4090 y en GPUs con 16 GB de VRAM, aunque con contexto limitado.
- Opciones de despliegue: llama.cpp (servidor), Ollama, vLLM (con conversión a formato GGUF no es directo, pero se puede usar con llama.cpp), o TGI (no recomendado para GGUF). También se puede usar con el framework transformers si se descarga la versión sin cuantizar.
- Latencia y throughput: no hay datos oficiales. En una RTX 4090, se puede esperar un throughput de 20-40 tokens/segundo para Q8_0, dependiendo de la longitud de la secuencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Cuantización | Especialización |
|---|---|---|---|---|---|
| G4 Prototype01 12B (este) | 12B | No disponible (base Gemma 4: 128k) | Apache 2.0 | GGUF Q8_0 | Roleplay, contenido maduro |
| Gemma 4 12B (base) | 12B | 128k | Apache 2.0 | Varias (GGUF, safetensors) | Multimodal, razonamiento general |
| Magnum v4 12B | 12B | No disponible (base Llama 3.1) | Apache 2.0 (probable) | GGUF (varias) | Roleplay, creatividad |

La comparativa se basa en la arquitectura y el propósito. Gemma 4 12B es el modelo base, más equilibrado para tareas generales y multimodales. Magnum v4 12B es otro modelo de roleplay de la misma talla, con licencia abierta. G4 Prototype01 se diferencia por su enfoque en psicología oscura y contenido explícito.

## Limitaciones y advertencias

- **Contenido explícito y potencialmente dañino**: el modelo puede generar narrativas violentas, sexuales o de manipulación psicológica. No apto para menores ni para uso en contextos sin supervisión.
- **Sesgos y alucinaciones**: al ser un fine-tune de un modelo base, puede heredar sesgos de datos y alucinar información, especialmente en temas psicológicos.
- **Idioma limitado**: la etiqueta `en` indica que el fine-tune está orientado al inglés, aunque el modelo base es multilingüe; no se garantiza calidad en otros idiomas.
- **Contexto no confirmado**: no se especifica la longitud de contexto en la model card, por lo que se recomienda asumir la del base (128k) pero con precaución.
- **Licencia**: Apache 2.0 permite uso comercial, pero el contenido generado puede estar sujeto a leyes de difusión de material explícito o de protección de menores. Responsabilidad del desarrollador.
- **Sin moderación**: el modelo no tiene filtros de seguridad, por lo que no es adecuado para entornos públicos sin moderación adicional.

## Enlaces

- Modelo en HuggingFace: [12B-Suite/G4-Prototype01-12B-v0.1-Q8_0-GGUF](https://huggingface.co/12B-Suite/G4-Prototype01-12B-v0.1-Q8_0-GGUF)
- Modelo base (sin cuantizar): [12B-Suite/G4-Prototype01-12B-v0.1](https://huggingface.co/12B-Suite/G4-Prototype01-12B-v0.1) (no se ha podido verificar, se infiere del nombre)
- Página de Gemma 4 12B de Google: [google/gemma-4-12B](https://huggingface.co/google/gemma-4-12B)
- Página de Gemma 4 en Ollama: [gemma4:12b](https://ollama.com/library/gemma4:12b)
- Artículo de Google sobre Gemma 4: [Introducing Gemma 4 12B](https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/)
