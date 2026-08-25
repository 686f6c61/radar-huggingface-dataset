# mradermacher/LFM2.5-230M-heretic-v1-i1-GGUF

## Resumen

LFM2.5-230M-heretic-v1-i1-GGUF es una cuantización GGUF con matriz de importancia (imatrix) del modelo LFM2.5-230M-heretic-v1, preparada por mradermacher. El modelo base es una variante "abliterada" del LFM2.5-230M de Liquid AI, un modelo de lenguaje compacto de 230 millones de parámetros diseñado para ejecución en el edge y en dispositivos con recursos limitados. La variante heretic elimina los mecanismos de rechazo y censura del modelo original, lo que da como resultado un asistente conversacional sin restricciones de contenido aparentes.

El modelo original, LFM2.5-230M, está construido sobre el backbone híbrido LFM2.5 que combina capas convolucionales y de atención, y fue destilado a partir del LFM2.5-350M. Según la información de Liquid AI, soporta tool calling y una ventana de contexto de 32.000 tokens, lo que lo convierte en una opción interesante para despliegues en el borde, extracción de datos y automatización ligera. La variante heretic añade además un comportamiento "decensored" (sin filtros) mediante técnicas de abliteración.

Este repositorio en concreto ofrece 24 cuantizaciones GGUF diferentes, desde IQ1_S hasta Q6_K, todas ellas generadas con imatrix para optimizar la calidad de cuantización. El modelo base tiene licencia lfm1.0 de Liquid AI, y el repo de cuantizaciones mantiene esa misma licencia. Es una opción relevante para desarrolladores que buscan un modelo conversacional muy pequeño, multilingüe y con tool calling, con la particularidad de que la variante heretic elimina las barreras de contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5 híbrida (convolución + atención) |
| Parametros totales | 229.693.184 (230M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (32K) |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-IQ3_XXS, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es, pt, it |
| Licencia | lfm1.0 (Liquid Foundation Model License) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base LFM2.5-230M de Liquid AI utiliza el backbone LFM2.5, una arquitectura híbrida que combina capas de convolución con mecanismos de atención. Según la información publicada en vLLM Recipes y el blog de Liquid AI, el modelo está destilado de LFM2.5-350M, es decir, se entrenó mediante destilación desde un modelo más grande de la misma familia. El modelo es denso, con 229,7 millones de parámetros, y soporta una ventana de contexto de 32.000 tokens.

La variante heretic, creada por dalatexcoder, aplica una técnica de abliteración (abliteration) para eliminar los mecanismos de rechazo de contenido del modelo original. Este proceso modifica los pesos para que el modelo no se niegue a responder sobre temas que la versión estándar bloquearía, dando lugar a un comportamiento "uncensored" o "decensored". No se ha publicado información detallada sobre el dataset de entrenamiento de la variante heretic ni sobre el proceso exacto de ablación. La cuantización GGUF de mradermacher se ha generado con imatrix, lo que optimiza la asignación de bits de cuantización según la importancia de cada tensor.

## Capacidades

- Generación de texto conversacional en 10 idiomas: inglés, español, árabe, chino, francés, alemán, japonés, coreano, portugués e italiano.
- Soporte de tool calling y function calling, según la documentación de Liquid AI y vLLM Recipes, lo que permite integrar el modelo en agentes que necesitan invocar funciones externas.
- Diseñado para despliegue en edge y on-device, con requisitos mínimos de memoria y latencia.
- Capacidad de extracción de datos estructurados, indicada en el blog oficial de Liquid AI.
- Comportamiento "uncensored" o "decensored" por ablación, que permite generar contenido sin los filtros de rechazo del modelo original.
- Adecuado para fine-tuning al ser un modelo pequeño de pesos abiertos.
- Ventana de contexto de 32K tokens, lo que permite manejar conversaciones largas o documentos de tamaño moderado.

## Casos de uso

- Asistente conversacional en el dispositivo: el modelo puede ejecutarse localmente en un smartphone o un portátil sin conexión a internet, gestionando conversaciones multi-turno con su ventana de 32K tokens. Su tamaño de 230M y cuantizaciones de 0,2 GB lo hacen viable incluso en dispositivos con poca memoria.
- Extracción de datos estructurados: el modelo puede procesar documentos y conversaciones para extraer entidades, datos de contacto o información relevante, gracias a su capacidad de tool calling y a su tamaño reducido, lo que permite ejecutarlo en pipelines de procesamiento en tiempo real.
- Agente con tool calling en edge: integrarlo en sistemas de automatización que necesiten invocar funciones (APIs, bases de datos, acciones en el sistema) sin depender de un servidor externo, con latencia mínima al ejecutarse localmente.
- Generación de contenido creativo sin restricciones: la variante heretic permite crear narrativas, guiones o diálogos sobre temas que otros modelos rechazan, útil para proyectos de ficción experimental o investigación sobre límites de seguridad en IA.
- Chatbot de atención al cliente en lenguajes múltiples: con soporte para 10 idiomas, puede desplegarse en entornos con varios idiomas para responder consultas básicas sin conexión, en terminales de autoservicio o quioscos.
- Prototipado y fine-tuning: al ser un modelo de 230M con pesos abiertos, sirve como punto de partida para ajustar un modelo específico de dominio (legal, médico, técnico) en hardware modesto, con una licencia que permite el uso comercial según los términos de lfm1.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de HuggingFace no incluye métricas de MMLU, HumanEval, GSM8K u otros benchmarks. El blog de Liquid AI y la documentación de vLLM Recipes no proporcionan cifras comparativas en los datos consultados.

## Requisitos de hardware

- VRAM estimada para inferencia: los archivos GGUF tienen un tamaño entre 0,2 y 0,3 GB según la cuantización, por lo que la VRAM necesaria es inferior a 1 GB incluso con la cuantización más alta (Q6_K). La cuantización i1-Q4_K_M ocupa 0,3 GB y es la recomendada por el autor para equilibrio entre velocidad y calidad.
- GPU recomendadas: cualquier GPU con más de 1 GB de VRAM es suficiente. Es compatible con GPU integradas (iGPU) y GPU de gama baja como GTX 1050, GTX 1650 o RTX 2050. Para despliegue en CPU, también es viable en procesadores modernos con al menos 4 GB de RAM.
- Si cabe en GPU consumer: sí, es uno de los modelos más pequeños de su categoría y cabe incluso en dispositivos móviles con aceleración NPU.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (según vLLM Recipes), TGI (Text Generation Inference) y cualquier framework compatible con GGUF. También se puede usar con transformers si se convierte a safetensors.
- Latencia y throughput estimados: no se han publicado cifras oficiales. Dado el tamaño, la generación de tokens se puede esperar en el orden de decenas a cientos de tokens por segundo en una GPU moderna, y de unos pocos tokens por segundo en CPU de gama media.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LFM2.5-230M-heretic-v1 (este) | 230M | 32K | lfm1.0 | GGUF, safetensors |
| LFM2.5-350M (Liquid AI) | 350M | 32K | lfm1.0 | safetensors |
| Qwen2.5-0.5B-Instruct (Alibaba) | 500M | 32K | Apache 2.0 | GGUF, safetensors |
| Gemma-2-2B (Google) | 2.6B | 8K | Gemma License | GGUF, safetensors |

La comparativa se basa en datos publicados de cada modelo. LFM2.5-230M es significativamente más pequeño que Qwen2.5-0.5B y Gemma-2-2B, lo que lo hace más adecuado para dispositivos con memoria muy limitada. Su ventaja principal es la licencia lfm1.0, que permite uso comercial, y la capacidad de tool calling, algo menos común en modelos de este tamaño. No se dispone de benchmarks para comparar el rendimiento real en tareas de razonamiento o código.

## Limitaciones y advertencias

- El tamaño de 230M limita la capacidad de razonamiento complejo y la generación de código avanzado en comparación con modelos más grandes (1B+).
- La variante heretic elimina los mecanismos de rechazo, lo que puede generar contenido ofensivo, peligroso o ilegal si no se controla. El despliegue en producción debe incluir filtros de contenido externos si se requiere.
- La licencia lfm1.0 de Liquid AI tiene condiciones específicas que se deben revisar antes de uso comercial, especialmente en términos de redistribución y atribución.
- La cuantización i1-IQ1_S e i1-IQ1_M están marcadas como "para los desesperados" y degradan notablemente la calidad de generación; se recomienda usar cuantizaciones i1-Q4_K_M o superiores.
- No se han publicado resultados de benchmarks, por lo que el rendimiento real en tareas estándar es desconocido.
- La fecha de creación del repositorio es 2026-08-25, lo que sugiere que el modelo es reciente y puede tener poca comunidad de soporte o documentación adicional.

## Enlaces

- Repositorio HuggingFace de las cuantizaciones imatrix: https://huggingface.co/mradermacher/LFM2.5-230M-heretic-v1-i1-GGUF
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/LFM2.5-230M-heretic-v1-GGUF
- Modelo base (variante heretic): https://huggingface.co/dalatexcoder/LFM2.5-230M-heretic-v1
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-230M
- Blog de Liquid AI sobre LFM2.5-230M: https://www.liquid.ai/blog/lfm2-5-230m
- Documentación de vLLM Recipes: https://recipes.vllm.ai/LiquidAI/LFM2.5-230M
- Página de solicitudes y FAQ del autor: https://huggingface.co/mradermacher/model_requests
