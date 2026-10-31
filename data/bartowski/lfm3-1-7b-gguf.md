# bartowski/LFM3-1.7B-GGUF

## Resumen

LFM3-1.7B es un modelo de lenguaje de tamaño reducido (edge) desarrollado por LiquidAI, perteneciente a su familia de Liquid Foundation Models (LFM). El modelo original se publica en HuggingFace como LiquidAI/LFM3-1.7B, y esta ficha cubre la versión cuantizada en formato GGUF realizada por bartowski, un cuantizador de referencia en la comunidad que emplea cuantización basada en matrices de importancia (imatrix) con llama.cpp release b11969.

El modelo está orientado a generación de texto conversacional en dispositivos con recursos limitados: con solo 1.728.801.600 parámetros (aproximadamente 2B según el checkpoint de origen), cabe cómodamente en CPUs, portátiles y GPUs de consumo. Soporta 16 idiomas, entre ellos castellano, y su plantilla de prompt incluye soporte de razonamiento explícito mediante la etiqueta `<think>` y definiciones de herramientas (tools) en el system prompt.

Su relevancia actual radica en la tendencia hacia modelos pequeños de alta calidad para inferencia local: ofrece capacidades conversacionales y de tool calling en menos de 1,2 GB en cuantización Q4_K_M, lo que lo hace adecuado para despliegues en el borde, aplicaciones offline y agentes ligeros. La licencia es "lfm1.0" (tipo other), cuyos términos concretos deben revisarse en el enlace de licencia del repositorio original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia Liquid Foundation Models, LFM3) |
| Parametros totales | 1.728.801.600 (dato real de safetensors) |
| Parametros activos | no aplica (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, IQ4_NL, Q4_0, Q4_K_S, IQ4_XS, IQ3_M, Q3_K_L, Q3_K_M, IQ3_XS, Q3_K_S, IQ3_XXS, Q2_K (y otras IQ2 en el repo) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (other) |
| Formato de pesos | GGUF (original en safetensors) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna de LFM3-1.7B, aunque la familia LFM de LiquidAI se caracteriza por arquitecturas alternativas al transformer clásico; en este caso concreto el dato no está disponible y debe consultarse la ficha del modelo original. El checkpoint de origen tiene aproximadamente 2B de parámetros y soporta entrada únicamente de texto. La model card indica explícitamente que no emplea decodificación especulativa.

Sobre los datos de entrenamiento (número de tokens, composición del dataset, RLHF/DPO) no hay información publicada en la model card disponible. Lo que sí está documentado es el proceso de cuantización: bartowski generó las versiones GGUF usando llama.cpp b11969 con matrices de importancia (imatrix) calculadas sobre el modelo original, lo que mejora la calidad de las cuantizaciones bajas respecto a la cuantización post-entrenamiento simple.

## Capacidades

- Generación de texto conversacional, con plantilla de chat tipo ChatML (`<|im_start|>` / `<|im_end|>`).
- Razonamiento explícito: la plantilla de prompt termina con `<think>`, lo que indica soporte de modo de razonamiento (thinking) antes de la respuesta final.
- Tool calling / function calling: la plantilla admite definiciones de herramientas en el system prompt mediante bloques `<tools>` con esquemas JSON.
- Soporte multilingüe en 16 idiomas: inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, castellano, vietnamita, tailandés, indonesio, hindi, ruso y polaco.
- Entrada exclusivamente de texto (sin visión ni audio).
- Diseñado para despliegue en el borde (edge) gracias a su tamaño reducido y disponibilidad en GGUF.

## Casos de uso

- Chatbots locales y privados: con la cuantización Q4_K_M (1,12 GB) puede ejecutarse íntegramente en un portátil sin GPU, manteniendo las conversaciones en el dispositivo, ideal para asistentes offline o con requisitos de privacidad.
- Atención al cliente en el borde: soporta conversaciones multi-turno con plantilla ChatML y tool calling, por lo que puede integrarse en terminales de tienda o quioscos que consulten APIs internas (estado de pedidos, stock) mediante funciones definidas en el system prompt.
- Agentes ligeros con herramientas: el soporte de definiciones de tools en JSON permite construir agentes de pocos pasos (consultar, decidir, responder) sin depender de la nube, adecuado para automatizaciones locales.
- Asistentes multilingües: cobertura de 16 idiomas, incluido castellano, útil para aplicaciones que atienden usuarios en varios idiomas desde un único modelo pequeño.
- Prototipado e investigación en hardware modesto: su tamaño permite experimentar con fine-tuning posterior, evaluaciones y pipelines de razonamiento en GPUs de consumo o incluso CPU.
- Integración en aplicaciones móviles o embebidas: con cuantizaciones IQ3/Q2 (0,70-0,93 GB) puede alojarse en entornos con RAM muy limitada, aceptando una pérdida de calidad a cambio de huella mínima.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: desde ~0,70 GB (Q2_K) hasta ~3,47 GB (bf16). La opción recomendada por defecto, Q4_K_M, ocupa 1,12 GB más la memoria del contexto (KV cache), que depende de la longitud de contexto configurada.
- GPUs recomendadas: no requiere GPU; cualquier GPU moderna acelera la inferencia. Con 1-4 GB de VRAM cabe cualquier cuantización, por lo que GPUs como una RTX 3060 de 12 GB, RTX 4060 o incluso integradas con suficiente RAM compartida son suficientes.
- Consumer GPUs: cabe sobradamente en prácticamente cualquier GPU de consumo; incluso puede ejecutarse solo con CPU y RAM del sistema (8 GB son más que suficientes).
- Opciones de despliegue: llama.cpp (herramienta con la que se generaron los cuants, release b11969), Ollama, LM Studio, y cualquier runtime compatible con GGUF. No es un repo compatible con vLLM o TGI en formato GGUF (se usaría el original en safetensors para eso).
- Latencia y throughput: no disponible; al ser un modelo de 1,7B parámetros cuantizado, se esperan velocidades altas incluso en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| LFM3-1.7B (esta ficha) | 1,73B | GGUF (bartowski, imatrix) | lfm1.0 (other) | 16 idiomas, thinking mode, tool calling |
| Qwen2.5-1.5B-Instruct | 1,54B | safetensors + GGUF comunitarios | Apache 2.0 (base) / Qwen license (instruct) | Contexto hasta 32k, multilingüe, tool calling |
| Llama-3.2-1B-Instruct | 1,24B | safetensors + GGUF comunitarios | Llama 3.2 Community License | Multilingüe, tool calling, optimizado para edge |
| Gemma-2-2B-it | 2,6B | safetensors + GGUF comunitarios | Gemma Terms of Use | Buen rendimiento en su clase, contexto 8k |

Comparación orientativa por categoría (modelos pequeños para edge); los datos concretos de benchmarks de LFM3-1.7B no están disponibles, por lo que no puede afirmarse su posición relativa en rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; como todo LLM, puede reproducir sesgos presentes en sus datos de entrenamiento.
- Alucinaciones: inherentes a los modelos de lenguaje; el riesgo puede ser mayor en cuantizaciones agresivas (Q3, IQ3, Q2), que la propia model card califica de calidad baja o muy baja.
- Contexto e idioma: la longitud de contexto no está publicada en la model card; el soporte de 16 idiomas no garantiza calidad uniforme, y el castellano puede rendir por debajo del inglés.
- Licencia: es "other" con nombre lfm1.0; no es una licencia estándar tipo Apache/MIT, por lo que debe revisarse el texto LICENSE del repositorio original antes de cualquier uso comercial.
- Cuantización: las versiones de 2 bits (Q2_K, IQ2) son "sorprendentemente utilizables" según el autor, pero no recomendables para producción por la degradación de calidad.
- Es un modelo solo de texto: no admite imágenes ni audio.
- La plantilla de prompt termina en `<think>`, por lo que las respuestas pueden incluir bloques de razonamiento que conviene filtrar en producción si solo se quiere la respuesta final.

## Enlaces

- Repositorio cuantizado (GGUF): https://huggingface.co/bartowski/LFM3-1.7B-GGUF
- Modelo original: https://huggingface.co/LiquidAI/LFM3-1.7B
- llama.cpp (release b11969 usada para cuantizar): https://github.com/ggml-org/llama.cpp/releases/tag/b11969
- Repositorio principal de llama.cpp: https://github.com/ggml-org/llama.cpp/
- Cuantización recomendada por defecto (Q4_K_M): https://huggingface.co/bartowski/LFM3-1.7B-GGUF/blob/main/LFM3-1.7B-Q4_K_M.gguf
- Paper, blog oficial y demo: no disponible
