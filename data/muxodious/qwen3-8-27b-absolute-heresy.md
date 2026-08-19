# MuXodious/Qwen3.8-27B-absolute-heresy

## Resumen

**Qwen3.8-27B-absolute-heresy** es un fine-tune del modelo multimodal Qwen3.8-27B, desarrollado por el usuario MuXodious mediante el motor de ablación **Heretic** v1.4.0. El objetivo del proyecto es eliminar los mecanismos de rechazo y censura del modelo base, produciendo una variante "uncensored" o "abliterada" que responde a prácticamente cualquier petición sin negativas. El proceso emplea una técnica avanzada de ablación ortogonal con mapas autoorganizados (SOM) y preservación de magnitud, lo que según el autor minimiza el daño al modelo.

Con 27.781 millones de parámetros, este modelo hereda las capacidades de Qwen3.8-27B: procesamiento de imágenes y texto, generación de lenguaje natural, razonamiento y código. La relevancia actual radica en la creciente demanda de modelos sin restricciones para investigación en seguridad de IA, análisis de sesgos y generación creativa de contenido controvertido, aunque su uso conlleva riesgos éticos y legales importantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basado en Qwen3.8-27B |
| Parametros totales | 27.781.427.952 |
| Parametros activos | Todos (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repositorio con safetensors en precision original) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de **Qwen3.8-27B**, un transformer multimodal entrenado para procesar tanto texto como imágenes. Sobre esta base, el autor aplica un proceso de **abliteración** (abliteration) usando la herramienta Heretic, que identifica y elimina direcciones en el espacio de activaciones responsables de los comportamientos de rechazo. La técnica concreta empleada es **Self-Organizing Maps & Magnitude-Preserving Orthogonal Ablation** (SOM+MPOA), una variante que busca preservar la magnitud de las activaciones mientras se eliminan selectivamente las componentes que inducen negativas.

El entrenamiento se realiza con un conjunto de datos personalizado que incluye tanto peticiones dañinas como inofensivas (harmful+harmless), con el objetivo de calibrar la ablación. No se utiliza RLHF ni DPO; se trata de una modificación post-hoc de los pesos. Según los datos de la model card, el trial seleccionado (T377) logra reducir los rechazos de 101/101 a 2/101 con una divergencia KL de 0.0759 respecto al modelo original, lo que indica una alteración mínima del comportamiento general.

## Capacidades

- Generación de texto y razonamiento complejo, heredado de Qwen3.8-27B.
- Procesamiento multimodal: acepta imágenes como entrada y puede describirlas o responder preguntas sobre ellas.
- Generación de código y soporte para tareas de programación.
- Respuesta sin rechazos a peticiones que el modelo base normalmente denegaría (contenido explícito, violencia, temas tabú).
- Multilingüe (idiomas exactos no especificados, pero Qwen3.8-27B soporta múltiples lenguas).
- No se documenta soporte explícito de tool calling o function calling, aunque podría heredarlo del modelo base.

## Casos de uso

- **Investigación en seguridad de IA**: analizar cómo responde un modelo sin barreras de contenido para estudiar sesgos, alucinaciones y comportamientos peligrosos en entornos controlados.
- **Generación de ficción y narrativa con temas controvertidos**: escritores que necesitan explorar escenarios oscuros o moralmente ambiguos sin filtros automáticos.
- **Evaluación de técnicas de ablación**: comparar la efectividad de diferentes métodos de eliminación de censura usando este modelo como referencia.
- **Pruebas de estrés en sistemas de moderación**: generar entradas que evadan filtros para mejorar sistemas de detección de contenido dañino.
- **Análisis de sesgos y toxicidad**: estudiar cómo el modelo maneja peticiones ofensivas o discriminatorias en comparación con versiones censuradas.
- **Desarrollo de personajes de rol sin restricciones**: crear asistentes conversacionales para juegos de rol o simulación que no se nieguen a responder acciones extremas.

## Benchmarks y rendimiento

La model card incluye resultados de PIQA (Physical Interaction Question Answering) para el trial T377 y T136, comparados con el modelo original:

| Benchmark | Metrica | T377 | Original |
|---|---|---|---|
| PIQA | acc_norm | 0.8188 | 0.8161 |
| PIQA | acc_norm_stderr | 0.0090 | 0.0090 |

Para T136:

| Benchmark | Metrica | T136 | Original |
|---|---|---|---|
| PIQA | acc_norm | 0.8166 | 0.8161 |
| PIQA | acc_norm_stderr | 0.0090 | 0.0090 |

No se publican otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible. La divergencia KL de 0.0759 sugiere una degradacion minima del rendimiento general.

## Requisitos de hardware

- **VRAM estimada**: en precision fp16/bf16, el modelo requiere aproximadamente 55-56 GB de VRAM (27.8B parametros × 2 bytes). Con cuantizacion a 8 bits, unos 28 GB; a 4 bits, unos 14 GB.
- **GPU recomendadas**: para inferencia completa en fp16, se necesitan GPUs de datacenter como A100 80GB, H100 80GB o A6000 48GB (con offloading). Para cuantizacion 4 bits, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente.
- **Compatibilidad con GPU de consumo**: si, con cuantizacion 4 bits (GGUF) cabe en GPUs de 16-24 GB, aunque no se ofrecen archivos GGUF en el repositorio actual.
- **Opciones de despliegue**: vLLM, TGI, llama.cpp (si se convierte a GGUF), Ollama (requiere conversion), o transformers con `device_map="auto"`.
- **Latencia y throughput**: no disponibles en la documentacion; dependen del hardware y la cuantizacion. Para un modelo de 27B en fp16 con A100, se esperan decenas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3.8-27B (base) | 27.8B | no disponible | Apache 2.0 | Modelo original con censura |
| MuXodious/Qwen3.8-27B-absolute-heresy | 27.8B | no disponible | Apache 2.0 | Abliterado sin censura |
| Otros modelos abliterados (ej. Llama-3-8B-Instruct-abliterated) | 8B | 8K | MIT | Abliteracion sobre Llama-3 |

No se dispone de comparaciones directas con otros modelos de la misma categoria en la informacion proporcionada. La principal diferencia con el modelo base es la eliminacion de rechazos, mientras que el rendimiento en PIQA es practicamente identico.

## Limitaciones y advertencias

- **Riesgo de alucinacion**: al eliminar mecanismos de rechazo, el modelo puede generar contenido falso o inventado con mayor confianza, especialmente en temas delicados.
- **Sesgos**: el proceso de ablacion puede no eliminar todos los sesgos sociales del modelo base; la ausencia de filtros no implica neutralidad.
- **Contenido peligroso**: el modelo puede producir instrucciones para actividades ilegales o daninas. Su uso debe restringirse a entornos de investigacion con salvaguardas.
- **Idiomas**: no se especifican los idiomas soportados; es probable que herede los del modelo base, pero no hay garantia.
- **Licencia**: Apache 2.0 permite uso comercial, pero la distribucion de contenido generado puede estar sujeta a regulaciones locales.
- **Contexto**: la longitud de contexto no esta documentada; se asume la del modelo base, pero no se confirma.
- **Soporte**: el proyecto parece experimental (solo 8 descargas, 0 likes); no hay garantias de mantenimiento o correccion de errores.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/MuXodious/Qwen3.8-27B-absolute-heresy)
- [Repositorio Heretic (herramienta de ablacion)](https://github.com/p-e-w/heretic)
- [Pull request con la tecnica SOM+MPOA](https://github.com/p-e-w/heretic/pull/196)
