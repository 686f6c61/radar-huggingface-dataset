# SirZQ/Qwen2.5-0.5B-Instruct

## Resumen

El modelo SirZQ/Qwen2.5-0.5B-Instruct es una versión ajustada (fine-tune) del modelo base Qwen2.5-0.5B, desarrollado por el usuario SirZQ y publicado en Hugging Face. Se trata de un modelo de lenguaje causal de 494 millones de parámetros, orientado a tareas de generación de texto y conversación. Aunque el repositorio declara únicamente inglés como idioma, el modelo base Qwen2.5 soporta más de 29 idiomas, por lo que esta versión podría conservar parte de esa capacidad multilingüe, aunque no está garantizado.

Este modelo es relevante porque ofrece una alternativa ligera y eficiente para aplicaciones que requieren generación de texto con recursos limitados, como chatbots embebidos, asistentes en dispositivos de borde o prototipos rápidos. Su arquitectura, basada en el transformer estándar con mejoras como RoPE, SwiGLU y RMSNorm, permite un despliegue sencillo en hardware modesto. La licencia Apache 2.0 facilita su uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm, Attention QKV bias y word embeddings atados |
| Parametros totales | 494.032.768 (0,49B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (generación máxima de 8.192 tokens) |
| Tipos de cuantizacion | No disponible en este repositorio; existen versiones AWQ del modelo base (Qwen/Qwen2.5-0.5B-Instruct-AWQ) |
| Idiomas soportados | Inglés (declarado en el frontmatter; el modelo base soporta 29+ idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Qwen2.5, un transformer causal con 24 capas, atención de consultas agrupadas (GQA) con 14 cabezas de consulta y 2 de clave/valor, y embeddings de palabras atados. Incorpora normalización RMSNorm, activación SwiGLU y codificación posicional rotatoria (RoPE). El modelo base fue preentrenado y posteriormente ajustado con instrucciones (instruction tuning) por el equipo de Qwen, y este repositorio añade un fine-tune adicional realizado por SirZQ, aunque no se proporcionan detalles sobre el proceso de ajuste, el dataset utilizado ni las técnicas de post-entrenamiento (como RLHF o DPO). El modelo base se entrenó con hasta 18 billones de tokens según el blog oficial de Qwen2.5, pero no se especifica la cantidad exacta para esta variante.

## Capacidades

- Generación de texto y conversación multi-turno mediante el uso de plantillas de chat (`apply_chat_template`).
- Seguimiento de instrucciones y generación de respuestas estructuradas, incluyendo JSON.
- Mejoras en codificación y matemáticas respecto a Qwen2, según la model card.
- Generación de texto largo (hasta 8.192 tokens de salida) y manejo de contexto de hasta 32.768 tokens.
- Comprensión de datos estructurados (tablas) y generación de salidas estructuradas.
- Soporte de system prompts para personalización de rol y condiciones de conversación.
- Capacidad multilingüe potencial (heredada del modelo base), aunque el repositorio solo declara inglés.

## Casos de uso

- **Asistentes conversacionales ligeros**: el modelo puede gestionar diálogos multi-turno con un contexto de hasta 32K tokens, lo que permite mantener conversaciones largas sin perder el hilo. Es adecuado para integraciones en aplicaciones móviles o web con requisitos de latencia bajos.
- **Generación de código en entornos con recursos limitados**: gracias a sus mejoras en codificación, puede usarse para autocompletar fragmentos de código o generar scripts simples en editores ligeros o entornos de desarrollo integrados (IDE) sin GPU dedicada.
- **Clasificación y extracción de información**: su capacidad para seguir instrucciones y generar JSON lo hace útil para tareas de extracción de entidades, análisis de sentimiento o clasificación de textos en pipelines de procesamiento de lenguaje natural.
- **Prototipado rápido de chatbots**: al ser un modelo pequeño, permite iterar rápidamente en el diseño de flujos conversacionales y probar ideas sin necesidad de infraestructura costosa.
- **Generación de contenido educativo**: puede utilizarse para crear explicaciones breves, resúmenes o preguntas de práctica en plataformas de aprendizaje, aprovechando su capacidad de generar texto coherente y estructurado.
- **Automatización de respuestas en atención al cliente**: con un contexto amplio, puede manejar consultas de usuarios con historial extenso, aunque su tamaño limita la profundidad del razonamiento en comparación con modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al blog oficial de Qwen2.5 para detalles de evaluación, pero no se incluyen cifras concretas en este repositorio. Tampoco se proporcionan datos de rendimiento específicos para esta variante fine-tuneada.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 494M parámetros, en FP16 se requieren aproximadamente 1 GB de VRAM; en int8, unos 0,5 GB; en int4, unos 0,25 GB. Esto permite ejecutar el modelo en GPUs con 2 GB de VRAM o menos.
- **GPU recomendadas**: cualquier GPU moderna con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, o incluso integradas como Apple Silicon. También puede ejecutarse en CPU con un rendimiento aceptable para tareas de baja frecuencia.
- **Compatibilidad con consumer GPU**: sí, cabe en la mayoría de GPUs de consumo actuales, incluidas las de gama baja.
- **Opciones de despliegue**: compatible con `transformers` (PyTorch), `vLLM`, `llama.cpp` (con conversión a GGUF), `Ollama` (disponible en su biblioteca) y `text-generation-inference` (TGI). También es compatible con `endpoints_compatible` según los tags.
- **Latencia y throughput**: no se proporcionan datos específicos, pero al ser un modelo pequeño, se espera una latencia de decenas de milisegundos en GPU y de cientos de milisegundos en CPU para generaciones cortas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SirZQ/Qwen2.5-0.5B-Instruct | 0,49B | 32K | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-0.5B-Instruct (original) | 0,49B | 32K | Apache 2.0 | Hugging Face |
| TinyLlama-1.1B-Chat | 1,1B | 2K | Apache 2.0 | Hugging Face |
| Phi-2 (Microsoft) | 2,7B | 2K | MIT | Hugging Face |

La comparativa se basa en parámetros y contexto; no se dispone de datos de rendimiento para este fine-tune específico. El modelo original de Qwen2.5-0.5B-Instruct es la referencia directa, y este repositorio es una variante ajustada por un tercero, por lo que las capacidades pueden diferir ligeramente.

## Limitaciones y advertencias

- **Sesgos conocidos**: al ser un modelo pequeño entrenado con datos de internet, puede reflejar sesgos presentes en los datos de entrenamiento, aunque no se han documentado específicamente para esta variante.
- **Riesgo de alucinación**: como todos los modelos generativos, puede producir información falsa o inventada, especialmente en temas especializados o con poco contexto.
- **Limitaciones de contexto e idioma**: aunque el contexto es de 32K tokens, la generación máxima es de 8K tokens, lo que limita respuestas muy largas. El repositorio declara solo inglés, por lo que el rendimiento en otros idiomas no está garantizado.
- **Restricciones de licencia**: la licencia Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de copyright. No hay restricciones adicionales conocidas.
- **Caveats para producción**: al ser un modelo de 0,5B, su capacidad de razonamiento complejo y conocimiento factual es limitada en comparación con modelos más grandes. Es recomendable evaluar su rendimiento en el dominio específico antes de desplegarlo en entornos críticos.

## Enlaces

- [Repositorio del modelo en Hugging Face](https://huggingface.co/SirZQ/Qwen2.5-0.5B-Instruct)
- [Modelo base Qwen2.5-0.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct)
- [Blog oficial de Qwen2.5](https://qwenlm.github.io/blog/qwen2.5/)
- [Repositorio GitHub de Qwen2.5](https://github.com/QwenLM/Qwen2.5)
- [Documentación de Qwen](https://qwen.readthedocs.io/en/latest/)
- [Paper técnico de Qwen2 (arXiv:2407.10671)](https://arxiv.org/abs/2407.10671)
- [Página del modelo en Ollama](https://ollama.com/library/qwen2.5:0.5b-instruct)
