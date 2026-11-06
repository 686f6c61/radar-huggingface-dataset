# ModernoTech/Nova-Nano

## Resumen

Nova Nano 1.0 es una redistribución del modelo LiquidAI/LFM2.5-350M en formato GGUF con cuantización Q4_K_M, publicada por ModernoTech bajo la familia comercial "Nova Edge". No se trata de un modelo entrenado desde cero: el repositorio documenta explícitamente que Moderno Tech redistribuye el artefacto original verificado sin modificar pesos, arquitectura, tokenizador, prompts ni parámetros de inferencia. El modelo base es un transformer de 350M parámetros (354.483.968 según los safetensors del repositorio original) desarrollado por Liquid AI.

Con 350M parámetros y un archivo de 229.312.224 bytes (~219 MB) en Q4_K_M, Nova Nano está pensado para despliegue en el extremo (edge): dispositivos con recursos limitados, inferencia local en CPU y escenarios donde el coste por token y la huella de memoria son críticos. Soporta ocho idiomas (inglés, español, árabe, chino, francés, alemán, japonés y coreano) y está etiquetado como conversacional y de generación de texto.

Su relevancia actual radica en la disponibilidad de un artefacto GGUF verificado con hash SHA-256 publicado, lo que facilita la reproducibilidad en pipelines de despliegue. La licencia es la LFM Open License v1.0 del autor original, no una licencia permisiva estándar, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LiquidAI/LFM2.5-350M); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unica variante publicada en este repositorio) |
| Idiomas soportados | en, es, ar, zh, fr, de, ja, ko |
| Licencia | LFM Open License v1.0 (etiquetada como "other") |
| Formato de pesos | GGUF (archivo `LFM2.5-350M-Q4_K_M.gguf`, 229.312.224 bytes) |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base LiquidAI/LFM2.5-350M, un transformer de 350M parámetros. El repositorio de ModernoTech no aporta detalles sobre la composición del dataset de entrenamiento, el número de tokens, ni si hubo fases de RLHF o DPO; esa información residiría en la documentación del autor original (Liquid AI), que no se incluye en la información proporcionada. Tampoco se documentan innovaciones técnicas específicas del modelo base en esta ficha.

Lo relevante desde el punto de vista de distribución es que Nova Nano no introduce cambios: los pesos se redistribuyen tal cual, con el tokenizador y los parámetros de inferencia originales. El artefacto publicado incluye un SHA-256 (`7e6f72643caafc9a68256686638c4d7916f2cec76d1df478d4c3ddcd95a6aed4`) que permite verificar la integridad de la descarga. La model card indica `inference: false`, es decir, no se ofrece un endpoint de inferencia gestionado en el Hub.

## Capacidades

- Generación de texto y conversación multi-turno, según las etiquetas `text-generation` y `conversational`.
- Soporte multilingüe en ocho idiomas: inglés, español, árabe, chino, francés, alemán, japonés y coreano.
- Inferencia local en runtime compatible con GGUF (llama.cpp y derivados).
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No se documentan capacidades de visión, audio ni modo "thinking".
- No se documentan capacidades específicas de código o matemáticas.

## Casos de uso

- Asistentes conversacionales en dispositivo: con ~219 MB en Q4_K_M, el modelo puede ejecutarse en CPU en portátiles, Raspberry Pi de gama alta o móviles, gestionando diálogos simples sin conexión a red.
- Clasificación y etiquetado de texto en local: para tareas de categorización de tickets, correos o reseñas en pipelines por lotes donde no se quiere enviar datos a la nube.
- Preprocesado y reescritura de texto: normalización, resumen breve o reformulación de fragmentos en aplicaciones de edición, aprovechando el bajo coste de inferencia.
- Prototipado rápido de aplicaciones LLM: al ser un GGUF pequeño y verificado por hash, sirve para validar pipelines de inferencia (llama.cpp, Ollama) antes de escalar a modelos mayores.
- Filtrado y moderación ligera en el borde: primera pasada de detección de contenido o respuestas automáticas en dispositivos con recursos limitados.
- Soporte multilingüe básico en aplicaciones embebidas: traducción o asistencia conversacional en los ocho idiomas soportados dentro de interfaces de bajo consumo.
- Educación y experimentación: modelo de tamaño reducido para estudiar comportamiento de LLM, cuantización y despliegue en entornos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: ~219 MB para los pesos en Q4_K_M, más overhead de contexto y runtime; en la práctica, menos de 1 GB de RAM para ventanas de contexto moderadas (estimación, no dato oficial).
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con al menos ~1 GB de memoria libre es suficiente, incluidas integradas.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en CPU.
- Opciones de despliegue: llama.cpp y runtimes compatibles con GGUF (la model card menciona llama.cpp explícitamente); Ollama u otros derivados no se confirman en la documentación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Nova Nano 1.0 (este) | 354M | no disponible | GGUF Q4_K_M | LFM Open License v1.0 | Redistribucion de LFM2.5-350M |
| LiquidAI/LFM2.5-350M | 350M | no disponible | safetensors/GGUF (original) | LFM Open License v1.0 | Modelo base original |
| Alternativas de ~350M (p. ej. Qwen2.5-0.5B, SmolLM2-360M) | ~350-500M | no disponible en esta ficha | safetensors/GGUF | varian | No comparadas con datos de benchmark en la informacion disponible |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparativa se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Es una redistribución, no un modelo propio: cualquier mérito o defecto del comportamiento proviene de LiquidAI/LFM2.5-350M.
- Con 350M parámetros, la capacidad de razonamiento, conocimiento factual y coherencia en contextos largos es limitada en comparación con modelos de miles de millones de parámetros; riesgo elevado de alucinación en preguntas factuales.
- La cuantización Q4_K_M introduce pérdida adicional de calidad frente a los pesos originales en precisión completa.
- No se documenta la longitud de contexto soportada; asumir ventanas cortas salvo verificación con el modelo base.
- Licencia LFM Open License v1.0: no es una licencia permisiva estándar; es imprescindible revisar los términos del repositorio original antes de cualquier uso comercial.
- Idiomas soportados declarados por el autor, pero sin evaluación publicada de calidad por idioma en esta ficha.
- Sin datos de benchmarks, sesgos o evaluaciones de seguridad en la información disponible.
- La model card marca `inference: false`: no hay endpoint gestionado en el Hub.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ModernoTech/Nova-Nano
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Repositorio GGUF original: https://huggingface.co/LiquidAI/LFM2.5-350M-GGUF
- Licencia LFM Open License v1.0: disponible en el repositorio del modelo base (no se incluye URL directa en la información proporcionada)
