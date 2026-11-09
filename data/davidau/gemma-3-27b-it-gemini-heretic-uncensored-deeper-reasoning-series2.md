# DavidAU/Gemma-3-27b-it-Gemini-Heretic-Uncensored-Deeper-Reasoning-Series2

## Resumen

Gemma-3-27b-it-Gemini-Heretic-Uncensored-Deeper-Reasoning-Series2 es un ajuste fino (fine-tune) del modelo Gemma 3 de 27.000 millones de parametros de Google, publicado por el usuario DavidAU en Hugging Face. Parte de la base `coder3101/gemma-3-27b-it-heretic`, una version del Gemma 3 instructiva a la que se le ha aplicado la tecnica de "abliteration" mediante la herramienta Heretic para eliminar los rechazos (refusals) del modelo original. Sobre esa base, DavidAU ha realizado un entrenamiento adicional con el dataset `TeichAI/gemini-3-pro-preview-high-reasoning-1000x`, orientado a reforzar el razonamiento profundo y el modo "thinking".

El modelo conserva la arquitectura multimodal de Gemma 3 (procesamiento de imagen y texto) y la ventana de contexto de 128.000 tokens. Su proposito principal es ofrecer generacion de texto e imagen sin censura, con capacidad de razonamiento explicito y un sesgo reducido a rechazar peticiones. Segun la model card, mantiene intacta la funcionalidad de procesamiento de imagenes y el razonamiento afecta tanto a la "inteligencia" sobre imagenes como a la generacion de salida.

Es relevante para desarrolladores e investigadores que necesitan un modelo abierto, con licencia Apache 2.0, que no aplique filtros de rechazo en dominios creativos, de rol o de generacion de contenido sensible, y que ademas incorpore un modo de razonamiento profundo. El modelo tiene 27.432.406.640 parametros y un repositorio de 54,9 GB en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3), vision-lenguaje; detalles internos de capas y atencion no disponibles en la informacion proporcionada |
| Parametros totales | 27.432.406.640 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (128k, segun model card) |
| Tipos de cuantizacion | No especificados en la informacion proporcionada; el autor referencia versiones GGUF, EXL2, AWQ, GPTQ y HQQ en su coleccion de archivos fuente |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers); el autor menciona disponibilidad de GGUF y otras cuantizaciones en su coleccion |

## Arquitectura y entrenamiento

El modelo se basa en Gemma 3 de 27B, un transformer multimodal de Google que procesa entradas de imagen y texto. La model card no detalla la configuracion interna de capas, cabezas de atencion ni el mecanismo exacto de fusion vision-lenguaje; esa informacion no esta disponible en los datos proporcionados. Lo que si se documenta es el proceso de ajuste: primero se aplico Heretic (herramienta de abliteration del equipo P-E-W) sobre Gemma 3 27B instructiva para eliminar los rechazos, dando lugar a `coder3101/gemma-3-27b-it-heretic`. Sobre esa base, DavidAU realizo un fine-tune con Unsloth utilizando el dataset `TeichAI/gemini-3-pro-preview-high-reasoning-1000x`, que segun la model card contiene 1.000 ejemplos (frente a los 250 de la Serie 1) orientados a razonamiento de alta calidad.

La innovacion principal es la combinacion de abliteration con un fine-tune de razonamiento: el modelo conserva la ventana de 128k tokens, mantiene el procesamiento de imagen operativo y anade un modo de pensamiento que se activa de forma automatica en la mayoria de casos, aunque puede forzarse con el prefijo "think deeply:" o mediante la plantilla Jinja `chat-template-thinking.jinja`. La model card reporta una divergencia KL de 0,07 respecto al modelo original (valor considerado excelente, ya que menos de 1 indica poco dano) y una reduccion de rechazos de 98/100 en el original a 9/100 en este modelo. No se especifica el numero total de tokens de entrenamiento ni la composicion completa del dataset mas alla de su identificador.

## Capacidades

- Generacion de texto conversacional en ingles, con modo de razonamiento profundo ("deep thinking") que produce cadenas de pensamiento entre etiquetas `<think>` y `</think>`.
- Procesamiento de imagen y texto (pipeline image-text-to-text): la funcionalidad de vision se mantiene intacta y el razonamiento influye en la interpretacion de imagenes.
- Generacion de contenido sin censura: rechazos muy reducidos (9/100 segun la model card), orientado a contenido creativo, de rol, explicito o soez cuando se le dirige adecuadamente.
- Estabilidad de temperatura: el razonamiento se mantiene estable en un rango de temperatura de 0,1 a 2,5.
- Soporte de system prompts que afectan a la imagen, al razonamiento y a la generacion de salida; el razonamiento no requiere system prompt ni plantilla obligatoria.
- Plantillas de chat alternativas: `chat-template.jinja` (regular) y `chat-template-thinking.jinja` (pensamiento siempre activo).
- Compatibilidad con text-generation-inference y endpoints (segun tags del repositorio).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no documentadas explicitamente; el modo de razonamiento profundo es el unico mecanismo de descomposicion descrito.

## Casos de uso

- Escritura creativa y ficcion sin restricciones: el modelo genera narrativa de genero (terror, explicito, violencia) sin rechazos, aunque la model card advierte que en algunos casos hay que dirigirlo explicitamente (por ejemplo, indicando el vocabulario o el tono deseado) para alcanzar el nivel grafico esperado.
- Roleplay y personajes en Silly Tavern, KoboldCpp o text-generation-webui: la model card incluye ajustes recomendados (Smoothing factor 1,5, repetition penalty 1,1-1,15) y ejemplos de system prompts de personaje, lo que lo hace adecuado para experiencias conversacionales inmersivas.
- Analisis de imagenes con razonamiento: al conservar la vision y aplicar el modo de pensamiento, puede describir, interpretar o razonar sobre imagenes en tareas de accesibilidad, catalogacion o analisis visual asistido.
- Generacion de contenido para videojuegos y narrativa interactiva: su ventana de 128k tokens permite mantener contexto de partida largo y coherencia entre escenas, con contenido no filtrado para titulos adultos.
- Investigacion sobre alineacion y seguridad: util como contrapunto experimental para estudiar el efecto de la abliteration (KLD 0,07, rechazos 9/100) frente al Gemma 3 original, y para analizar el comportamiento de modelos sin censura.
- Prototipado de asistentes con razonamiento explicito: el modo "think deeply" y la plantilla de pensamiento permiten construir pipelines donde se inspecciona la cadena de razonamiento antes de la respuesta final, util para depuracion y evaluacion.
- Despliegue local en entornos con requisitos de privacidad: al ser Apache 2.0 y estar disponible en safetensors y (segun el autor) GGUF, puede ejecutarse en infraestructura propia sin depender de APIs externas.

## Benchmarks y rendimiento

Resultados publicados en la model card (formato de probabilidad, sin normalizar):

| Benchmark | Este modelo | Base heretic (uncensored) |
|---|---|---|
| ARC Challenge | 0,599 | 0,557 |
| ARC Easy | 0,757 | 0,711 |
| BoolQ | 0,876 | 0,868 |
| HellaSwag | 0,770 | 0,533 |
| OpenBookQA | 0,466 | 0,452 |
| PIQA | 0,806 | 0,706 |
| Winogrande | 0,756 | 0,695 |

Metricas de des-censura comparadas con `google/gemma-3-27b-it`:

| Metrica | Este modelo | Gemma 3 27B it original |
|---|---|---|
| Divergencia KL | 0,07 | 0 (por definicion) |
| Rechazos | 9/100 | 98/100 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible. La model card afirma que "los benchmarks estan fuera de escala", pero solo aporta las cifras de la tabla anterior.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16): aproximadamente 55 GB solo para pesos, mas overhead de activaciones y cache KV; requiere GPUs de 80 GB (A100, H100) o multi-GPU.
- Cuantizacion en 8 bits: en torno a 28-30 GB de VRAM; cabe en una RTX 4090 de 24 GB solo con cuantizaciones mas agresivas o con offloading parcial.
- Cuantizacion en 4 bits (GGUF Q4): aproximadamente 15-17 GB de VRAM; viable en RTX 4090 (24 GB), RTX 3090 (24 GB) y GPUs consumer de gama alta con 16 GB o mas, con contexto reducido.
- Cuantizaciones de 3 bits o menores: pueden caber en GPUs de 12-16 GB, con perdida de calidad y contexto limitado.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag), llama.cpp / KoboldCpp para GGUF (mencionados en la model card), text-generation-webui (con loader llama_HF para GGUF), Silly Tavern como frontend. vLLM y Ollama no se mencionan en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada. La model card recomienda ajustes de muestreo (Smoothing 1,5, repetition penalty 1,1-1,15) para una operacion mas fluida en chat y roleplay.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Gemma-3-27b-it-Gemini-Heretic-Series2) | 27,4B | 128k | Apache 2.0 | Multimodal, sin censura, razonamiento profundo | Hugging Face, safetensors + GGUF (segun autor) |
| coder3101/gemma-3-27b-it-heretic | 27B (aproximado, no verificado) | No disponible | No disponible | Multimodal, sin censura (base de este modelo) | Hugging Face |
| google/gemma-3-27b-it | 27B (aproximado, no verificado) | 128k (segun model card de referencia) | Gemma Terms of Use | Multimodal instructivo con alineacion y rechazos | Hugging Face, Google AI Studio |
| Gemma 3 27B en otras variantes comunitarias | 27B (aproximado) | Variable | Variable | Fine-tunes de rol, creativos o tecnicos | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoria en la informacion proporcionada, salvo las metricas frente a la base heretic ya mostradas.

## Limitaciones y advertencias

- Contenido sin censura: el modelo esta disenado para no rechazar peticiones, lo que incluye contenido explicito, violento u ofensivo. No es apto para aplicaciones dirigidas al publico general ni para entornos con requisitos de moderacion sin capas adicionales de filtrado.
- Alucinacion: como todo modelo de lenguaje, puede generar afirmaciones falsas con aparente seguridad; el modo de razonamiento no garantiza veracidad. La model card no aporta evaluaciones de factualidad.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta verificado ni documentado.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo deriva de Gemma 3 de Google, cuyos terminos de uso originales pueden imponer condiciones adicionales; conviene revisar la compatibilidad antes de un despliegue comercial.
- Calidad del fine-tune: el dataset de razonamiento tiene 1.000 ejemplos, un volumen modesto; los benchmarks reportados son mayoritariamente de conocimiento y sentido comun (ARC, HellaSwag, PIQA), no de razonamiento complejo, codigo o matematicas.
- Dirigibilidad: segun la model card, el modelo puede producir contenido "blando" por defecto en algunos casos y necesita instrucciones explicitas (vocabulario, tono) para alcanzar el nivel grafico o soez deseado.
- Configuracion sensible: requiere ajustes de muestreo especificos (Smoothing 1,5, repetition penalty 1,1-1,15) para un funcionamiento fluido en chat y roleplay; sin ellos el comportamiento puede degradarse.
- Fecha de creacion y actualizacion: el repositorio indica creacion en enero de 2026 y actualizacion en noviembre de 2026; verificar la version concreta de los pesos antes de usarlos en produccion.
- Sin datos de tool calling ni de agentes: no se documenta soporte de function calling, lo que limita su uso en pipelines de automatizacion que dependan de herramientas externas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Gemma-3-27b-it-Gemini-Heretic-Uncensored-Deeper-Reasoning-Series2
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- FAQs del autor: https://huggingface.co/DavidAU/support
- Coleccion de archivos fuente para GGUF/EXL2/AWQ/GPTQ/HQQ: https://huggingface.co/collections/DavidAU/d-au-source-files-for-gguf-exl2-awq-gptq-hqq-etc-etc-66b55cb8ba25f914cbf210be
- Modelo base heretic: https://huggingface.co/coder3101/gemma-3-27b-it-heretic
- Modelo original de Google: https://huggingface.co/google/gemma-3-27b-it
- Dataset de entrenamiento: https://huggingface.co/datasets/TeichAI/gemini-3-pro-preview-high-reasoning-1000x
