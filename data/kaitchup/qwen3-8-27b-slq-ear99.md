# kaitchup/Qwen3.8-27B-SLQ-EAR99

## Resumen

Qwen3.8-27B-SLQ-EAR99 es una versión cuantizada del modelo abierto Qwen3.8-27B, publicada por The Kaitchup (usuario `kaitchup` en Hugging Face). No es un reentrenamiento: es un checkpoint comprimido con una implementación personalizada de SLQ (Statistically-Lossless Quantization) y empaquetado para el runtime Humming de vLLM. El objetivo declarado es alcanzar un EAR (Expected Acceptance Rate) del 99 % respecto al modelo BF16 original; la medición publicada es 99,002514 %, con un peso en disco de 30,518 GB frente a los 55,563 GB del BF16.

El modelo base pertenece a la familia Qwen3.5 de Alibaba y se denomina comercialmente Qwen3.8-27B, con una ventana de contexto de hasta 262.144 tokens y orientación a cargas agénticas y de razonamiento. Según las fuentes públicas consultadas, Qwen3.8 incorpora niveles de `reasoning_effort` (low, medium, xhigh) y recomienda temperatura 1.0 y `top_p` 0.95 en modo thinking. La ficha de safetensors de este checkpoint declara 9.216.062.192 parámetros almacenados, un dato que no coincide con la etiqueta "27B" del modelo base y que debe interpretarse como consecuencia del empaquetado de precisión mixta, no como el tamaño real del modelo original.

La relevancia práctica es doble: permite servir localmente un modelo de gama alta con una pérdida estadística mínima y lo hace dentro del ecosistema vLLM mediante kernels Humming. El coste es una dependencia fuerte de un stack concreto (vLLM 0.31.0, humming-kernels 0.1.16), la ausencia de validación en otras runtimes y la falta de benchmarks de tareas publicados por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3.5 (modelo base Qwen3.8-27B) |
| Parámetros totales | 9.216.062.192 según safetensors del checkpoint; el modelo base se denomina Qwen3.8-27B |
| Longitud de contexto | 262.144 tokens (configurado con `--max-model-len 262144`) |
| Tipos de cuantización | Precisión entera mixta por proyección (fuentes INT2–INT8) con pesos BF16 seleccionados; activaciones BF16; empaquetado Humming |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors empaquetados (Humming); no es un GGUF ni un GPTQ estándar |

## Arquitectura y entrenamiento

El checkpoint no modifica la arquitectura del modelo base: mantiene el transformer decoder-only de Qwen3.8-27B y conserva sin cambios los pesos MTP originales en BF16. Lo que cambia es la representación numérica de las proyecciones del decodificador. La búsqueda de SLQ combina varias fuentes candidatas —pesos GPTQ generados localmente en INT2–INT8, el checkpoint `kaitchup/Qwen3.8-27B-hum-high-MTP-17.7GB` cuantizado con AutoRound, el `ISTA-DASLab/Qwen3.8-27B-3Bit-GSQ` y los pesos BF16 originales— y elige la precisión de forma independiente para cada proyección, incluidas determinadas cabezas de atención. El resultado es un mapa de bits por capa que se publica como SVG en el repositorio.

No hay entrenamiento adicional, RLHF ni DPO por parte del autor de la cuantización: la alineación y el comportamiento se heredan íntegramente del modelo base. La innovación técnica es el propio procedimiento de búsqueda de precisión mixta y el empaquetado para Humming, que permite ejecutar el checkpoint en vLLM sin de-cuantizar a BF16 en memoria. El autor advierte que el objetivo "statistically lossless" de SLQ se refiere a fidelidad aproximada de la distribución de siguiente token, no a equivalencia numérica ni a equivalencia estadística demostrada en tareas downstream.

## Capacidades

- Generación de texto conversacional y de un solo turno, con plantilla de chat compatible con la API OpenAI de vLLM.
- Razonamiento explícito en modo thinking, con niveles de `reasoning_effort` (low, medium, xhigh) heredados de Qwen3.8.
- Soporte de tool calling y function calling mediante `--enable-auto-tool-choice` y el parser `qwen3_coder`.
- Parsing de razonamiento separado del contenido final mediante `--reasoning-parser qwen3`.
- Flujos agénticos multi-paso, con contexto de hasta 262.144 tokens; Qwen recomienda reservar hasta 262K para razonamiento y 131K para la respuesta final en ejecuciones agénticas muy largas.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Los pesos y procesadores de visión del modelo base se conservan en el repositorio, pero la validación del autor no incluyó inferencia de imagen ni vídeo (se desactivan con `--limit-mm-per-prompt '{"image":0,"video":0}'`).
- Decodificación especulativa: no validada en este checkpoint.

## Casos de uso

- Asistente de código en producción: el modelo puede integrarse en un servidor vLLM compatible con OpenAI y usarse con el parser `qwen3_coder` para emitir llamadas a herramientas y parchear repositorios dentro de un pipeline de CI/CD, aprovechando la ventana de 262K para incluir varios ficheros de contexto.
- Agente autónomo de larga duración: con 262.144 tokens de contexto y niveles de `reasoning_effort`, es adecuado para tareas de varios pasos que acumulan historial de herramientas, resultados intermedios y trazas de ejecución sin truncar.
- Atención al cliente automatizada: conversaciones multi-turno con historial extenso y recuperación de documentación larga, servidas desde un endpoint compatible con la API de OpenAI.
- Análisis de documentación técnica extensa: resúmenes, extracción estructurada y preguntas sobre manuales o contratos que superan la ventana de modelos de 8K–32K, siempre que el presupuesto de VRAM permita el contexto completo.
- Generación aumentada por recuperación (RAG) en local: al reducir el peso a 30,5 GB y mantener un EAR del 99 %, permite desplegar un modelo de gama alta en infraestructura propia con requisitos de memoria menores que el BF16 (55,6 GB).
- Automatización de back office con tool calling: clasificación, extracción y enrutado de tickets mediante llamadas a funciones, con el razonamiento separado del resultado final para auditar las decisiones.
- Evaluación comparativa de cuantizaciones: sirve como referencia de alta fidelidad (EAR 99 %) frente a variantes más agresivas del mismo autor (EAR 98 %, 98,5 %) o frente a FP8 oficial y GSQ de 3 bits.
- Sustitución de FP8 en entornos Blackwell: el checkpoint se probó en una RTX PRO 6000 Blackwell y puede usarse como alternativa cuando se busca mayor fidelidad que FP8 (97,7 % de EAR) manteniendo un tamaño similar (30,5 GB frente a 30,9 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, MathVision u otros) para este checkpoint en la información disponible. El autor solo publica la métrica EAR (Expected Acceptance Rate), que mide el solapamiento entre las probabilidades del siguiente token del modelo BF16 y las del modelo comparado, renormalizadas sobre los diez tokens más probables de la referencia. Un EAR de 0,99 no equivale a un 99 % de acierto en benchmarks ni a respuestas idénticas.

| Modelo | EAR ↑ | Pesos (GB) | Ejecución medida |
|---|---:|---:|---|
| Qwen3.8-27B BF16 original | 100,000000 % | 55,563 | Referencia BF16 |
| Qwen3.8-27B-FP8 oficial | 97,705903 % | 30,867 | Pesos y activaciones FP8 nativos |
| Qwen3.8-27B-FP8 oficial (solo pesos) | 98,101249 % | 30,867 | Pesos de-cuantizados, ejecución BF16 |
| ISTA-DASLab GSQ 3 bits | 89,425738 % | 11,828 | Pesos de-cuantizados, ejecución BF16 |
| kaitchup hum-high (17,7 GB) | 94,335032 % | 17,695 | Pesos de-cuantizados, ejecución BF16 |
| Unsloth UD-Q4_K_XL GGUF | 97,444147 % | 17,559 | GGUF re-mapeado a BF16, Transformers |
| kaitchup SLQ EAR>98 | 98,000775 % | 23,732 | vLLM con Humming |
| kaitchup SLQ EAR98.5 | 98,502656 % | 25,609 | vLLM con Humming |
| **kaitchup SLQ EAR99 (este)** | **99,002514 %** | **30,518** | **vLLM con Humming** |

## Requisitos de hardware

- Peso en disco del checkpoint: 30.518.225.504 bytes (30,518 GB). Es tamaño de fichero, no memoria total de servicio: hay que sumar buffers de runtime y caché KV.
- VRAM estimada para inferencia: al menos ~31 GB solo para pesos; con contexto largo (262.144 tokens) la caché KV puede añadir decenas de GB, por lo que conviene planificar 48–96 GB o tensor parallel en varias GPU. El autor no publica una cifra cerrada de VRAM.
- GPU validadas: RTX PRO 6000 Blackwell. No se han validado otras GPU en la documentación del checkpoint.
- GPU de consumo: una RTX 4090 de 24 GB no puede alojar los pesos completos; sería necesario recurrir a una variante más pequeña (por ejemplo, la de 17,7 GB o la de 23,7 GB) o a offload, no soportado de forma nativa por este empaquetado.
- Opciones de despliegue: exclusivamente vLLM con soporte de Humming (probado con vLLM 0.31.0 y humming-kernels 0.1.16). No es compatible con llama.cpp, Ollama, TGI ni con el cargador GPTQ estándar.
- Comando de servicio recomendado: `vllm serve kaitchup/Qwen3.8-27B-SLQ-EAR99 --quantization humming --dtype bfloat16 --max-model-len 262144 --limit-mm-per-prompt '{"image":0,"video":0}'`, añadiendo `--enable-auto-tool-choice --tool-call-parser qwen3_coder --reasoning-parser qwen3` para tool calling y parsing de razonamiento.
- Latencia y throughput: no disponibles. El autor no publica mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | EAR | Pesos (GB) | Licencia | Runtime |
|---|---|---:|---:|---:|---|---|
| kaitchup SLQ EAR99 (este) | 9,2 B declarados en safetensors (base 27B) | 262.144 | 99,00 % | 30,518 | Apache 2.0 | vLLM + Humming |
| Qwen3.8-27B-FP8 oficial | 27 B (base) | 262.144 | 97,71 % (98,10 % solo pesos) | 30,867 | Apache 2.0 | vLLM / FP8 nativo |
| kaitchup hum-high MTP 17,7 GB | 27 B (base) | 262.144 | 94,34 % | 17,695 | Apache 2.0 | vLLM + Humming |
| ISTA-DASLab GSQ 3 bits | 27 B (base) | 262.144 | 89,43 % | 11,828 | no disponible | BF16 tras de-cuantizar |
| Unsloth UD-Q4_K_XL GGUF | 27 B (base) | 262.144 | 97,44 % | 17,559 | Apache 2.0 | llama.cpp / Transformers |

La comparación relevante es interna a la familia de cuantizaciones de Qwen3.8-27B: EAR99 es la variante de mayor fidelidad y mayor tamaño, EAR98.5 y EAR98 sacrifican entre 1,5 y 2,5 GB a cambio de un EAR entre 0,5 y 1 punto inferior. Frente a FP8 oficial, este checkpoint mejora el EAR en aproximadamente 0,9 puntos con un tamaño prácticamente idéntico, a cambio de depender de Humming.

## Limitaciones y advertencias

- El EAR mide solapamiento de probabilidades sobre los diez tokens más probables del BF16; no es una medida de precisión en benchmarks ni garantiza respuestas equivalentes. El propio autor indica que la equivalencia estadística en tareas downstream no está establecida para estas publicaciones.
- El checkpoint solo se ha validado para texto. La inferencia de imagen y vídeo no se probó y se desactiva explícitamente en el comando de servicio recomendado.
- La decodificación especulativa no se incluyó en la validación; su comportamiento con este empaquetado es desconocido.
- Dependencia total del stack vLLM + Humming (versiones 0.31.0 y 0.1.16 en las pruebas). Otros runtimes pueden producir resultados ligeramente distintos o no cargar el modelo.
- El checkpoint está pensado para GPU Blackwell; no hay validación publicada en arquitecturas anteriores (Hopper, Ampere) ni en GPU de consumo.
- Riesgo de alucinación y sesgos heredado del modelo base Qwen3.8-27B; la cuantización no los corrige y puede amplificar ligeramente el ruido numérico en las proyecciones comprimidas.
- Idiomas soportados: no disponible en la información del repositorio; conviene verificar el comportamiento multilingüe contra el modelo base antes de desplegarlo en producción.
- La licencia del checkpoint es Apache 2.0, pero el uso comercial debe verificar también los términos del modelo base Qwen3.8-27B y de las fuentes candidatas utilizadas en la búsqueda (GPTQ, AutoRound, GSQ).
- Modelo recién publicado (0 descargas, 0 likes en el momento de la consulta) y sin benchmarks independientes que confirmen el EAR declarado fuera del entorno del autor.
- El número de parámetros declarado en safetensors (9.216.062.192) no coincide con la denominación "27B" del modelo base; conviene no usar esa cifra para estimar memoria o rendimiento sin verificar el peso real en disco.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kaitchup/Qwen3.8-27B-SLQ-EAR99
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Versión FP8 oficial: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Variante SLQ EAR98: https://huggingface.co/kaitchup/Qwen3.8-27B-SLQ-EAR98
- Variante SLQ EAR98.5: https://huggingface.co/kaitchup/Qwen3.8-27B-SLQ-EAR98.5
- Variante hum-high MTP 17,7 GB: https://huggingface.co/kaitchup/Qwen3.8-27B-hum-high-MTP-17.7GB
- Variante GSQ 3 bits: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-3Bit-GSQ
- GGUF de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Colección de cuantizaciones de Qwen3.8-27B: https://huggingface.co/collections/kaitchup/quantized-qwen38-27b
- Paper de SLQ: https://arxiv.org/abs/2605.02404
- Repositorio de SLQ: https://github.com/IST-DASLab/SLQ
- Repositorio de AutoRound: https://github.com/intel/auto-round
- Artículo de The Kaitchup sobre la semana de Qwen3.8: https://kaitchup.substack.com/p/qwen38-27b-nemotron-35-muse-deepseek
- Análisis de Qwen3.8-27B para IA agéntica local: https://agenticaiinsights.substack.com/p/deeper-dive-the-qwen-38-27b-open
- Guía para ejecutar Qwen3.8-27B en local: https://aiindigo.com/tutorials/getting-started-with-qwen-3-8-27b-gguf-run-frontier-ai-locally
- Newsletter de The Kaitchup: https://kaitchup.substack.com/subscribe
