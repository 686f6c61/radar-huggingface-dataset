# jeremymoon/gemma-sentiment-nuclear

## Resumen

`jeremymoon/gemma-sentiment-nuclear` es un fine-tune completo de `google/gemma-7b` para clasificación de sentimiento en tres clases —negativo, neutro y positivo— sobre tuits en inglés, con especial atención al discurso sobre energía nuclear. Lo desarrolla Jeremy Moon, del AIMS Lab de la Universidad de Michigan, y se publica como modelo de `text-classification` en Hugging Face con 8.537.690.112 parámetros (8,54 mil millones).

El modelo resuelve un problema concreto: etiquetar de forma automática y a gran escala la opinión expresada en redes sociales sobre energía nuclear, un ámbito polarizado y relevante para la transición energética. La model card reporta 829.252 tuits de entrenamiento y 207.313 de validación, y una exactitud del 97,37% y un Macro-F1 de 0,974 en un conjunto de test de 259.143 tuits. No se documenta la longitud de contexto ni versiones cuantizadas; el repositorio contiene pesos safetensors de 17,1 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo base `google/gemma-7b` (Transformer decoder-only) con fine-tune completo para clasificación de 3 clases |
| Parámetros totales | 8.537.690.112 (8,54 mil millones) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card |
| Tipos de cuantización | No disponible; solo se publican pesos safetensors, sin variantes GGUF, AWQ o GPTQ |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Gemma Terms of Use (`license: gemma`) |
| Formato de pesos | safetensors (repositorio de 17,1 GB) |

## Arquitectura y entrenamiento

Se trata de un fine-tune completo de `google/gemma-7b`, no de un adaptador LoRA. El entrenamiento se realizó en bf16, con batch size 24, learning rate 1e-5 y 5 épocas, sobre 4 GPU RTX 6000 Ada. El conjunto de datos incluía 829.252 tuits de entrenamiento y 207.313 tuits de validación, mezclando tuits generales con tuits de alta confianza sobre energía nuclear. La model card no detalla la composición exacta del dataset, el número total de tokens procesados ni si se aplicaron técnicas de RLHF o DPO.

La información disponible no describe innovaciones técnicas adicionales más allá del fine-tune supervisado para clasificación. El pipeline declarado es `text-classification`, con etiquetas `0: negative`, `1: neutral` y `2: positive`. No se especifica la longitud máxima de secuencia utilizada durante el entrenamiento ni la estrategia de truncado.

## Capacidades

- Clasificación de sentimiento en tres clases: negativo, neutro y positivo.
- Especialización en discurso sobre energía nuclear en tuits en inglés.
- Entrada de texto y salida de etiqueta mediante el pipeline de `transformers`.
- No se documentan capacidades de generación de texto abierto, diálogo o razonamiento multi-paso.
- No se documenta soporte de tool calling ni function calling.
- No se documentan capacidades de agente, visión, audio o modo de pensamiento.
- Modelo monolingüe: únicamente inglés.
- Adecuado para clasificación por lotes de grandes volúmenes de texto, no para interacción conversacional.

## Casos de uso

- Monitorización de opinión pública sobre energía nuclear: clasificar tuits en tiempo real o por lotes para detectar tendencias de sentimiento y comparar periodos. Es adecuado porque fue entrenado específicamente con tuits del dominio nuclear.
- Análisis de campañas de comunicación: evaluar el sentimiento antes y después de una campaña o anuncio del sector energético, usando la etiqueta predicha como métrica principal.
- Investigación social y energética: etiquetar corpus amplios de tuits para estudios sobre percepción de la energía nuclear, reduciendo el trabajo manual de codificación.
- Alertas tempranas de crisis reputacional: detectar picos de sentimiento negativo en conversaciones sobre instalaciones, políticas o incidentes nucleares.
- Gestión de comunidad y moderación: priorizar mensajes negativos o neutrales para revisión humana en foros y redes sociales del sector.
- Evaluación de cobertura mediática en redes: clasificar la respuesta del público a noticias y declaraciones sobre energía nuclear en cuentas y medios anglófonos.
- Enriquecimiento de datasets: generar etiquetas de sentimiento para entrenar o validar clasificadores más pequeños y especializados en el dominio nuclear.

## Benchmarks y rendimiento

| Conjunto de evaluación | Tamaño | Accuracy | Macro-F1 |
|---|---:|---:|---:|
| sample | 3.000 tuits | 98,43% | 0,984 |
| test | 259.143 tuits | 97,37% | 0,974 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Pesos en bf16: aproximadamente 17,1 GB, según el tamaño del repositorio.
- VRAM estimada para inferencia en bf16: alrededor de 20-24 GB, incluyendo pesos y overhead de activaciones para batch pequeño.
- VRAM estimada con cuantización de 8 bits: aproximadamente 9-12 GB; con 4 bits, aproximadamente 6-8 GB. No hay checkpoints cuantizados publicados, por lo que son estimaciones a partir del tamaño del modelo.
- GPU recomendadas: A100 40 GB u 80 GB, H100, RTX 6000 Ada 48 GB. Para bf16 con batch 1, una RTX 4090 o RTX 3090 de 24 GB puede ser suficiente.
- GPUs de consumo con 16 GB: solo viables con cuantización y validación previa, al no existir versiones cuantizadas oficiales.
- Opciones de despliegue: pipeline de `transformers` con `device_map="auto"` y `torch_dtype=torch.bfloat16`. Para vLLM, TGI, llama.cpp u Ollama no se publican artefactos específicos y requerirían conversión y validación.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye una comparativa con otros modelos de clasificación de sentimiento ni resultados de terceros. Cualitativamente, al estar basado en Gemma 7B, es un modelo de 8,54 mil millones de parámetros, más pesado que clasificadores Transformer pequeños tipo BERT o RoBERTa, pero no hay datos públicos en esta ficha para comparar exactitud, latencia o coste de despliegue.

## Limitaciones y advertencias

- Modelo monolingüe: solo inglés; no se ha evaluado su comportamiento en castellano u otros idiomas.
- Entrenado principalmente con tuits: puede degradarse en textos formales, artículos científicos, informes técnicos o documentos largos.
- Especializado en discurso sobre energía nuclear: su rendimiento fuera de ese dominio no está documentado.
- Etiquetas fijas de tres clases: no proporciona intensidad del sentimiento ni explicaciones sobre la decisión.
- No se documentan evaluaciones de sesgos, calibración o robustez frente a ironía, sarcasmo o lenguaje ambiguo.
- Riesgo de falsos positivos y falsos negativos en la clasificación; no es un modelo generativo, pero puede asignar etiquetas incorrectas con apariencia de certeza.
- La longitud máxima de contexto no está documentada; textos largos pueden truncarse y perder información relevante.
- Licencia Gemma Terms of Use: es necesario revisar las condiciones antes de un uso comercial o de redistribución.
- El repositorio no incluye versiones cuantizadas ni artefactos para despliegue en llama.cpp u Ollama; habría que generarlos y validarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jeremymoon/gemma-sentiment-nuclear
- Modelo base: https://huggingface.co/google/gemma-7b
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
