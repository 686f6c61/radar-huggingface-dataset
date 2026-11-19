# mradermacher/Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic-i1-GGUF

## Resumen

Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic-i1-GGUF es una cuantización GGUF del modelo merge xtools-at/Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic, publicada por mradermacher. Se trata de un modelo multimodal de tipo image-text-to-text construido sobre la familia Qwen3.5, con 1.942.653.248 parámetros totales (aproximadamente 2B), pensado para tareas de razonamiento, conversación, código y matemáticas.

El modelo base combina varias técnicas de destilación y merging sobre datasets de razonamiento (polaris-alpha, KIMI-K2.5, tulu-3-sft-mixture, Opus-4.6-Reasoning y Qwen3.5-reasoning), y ha sido sometido a un proceso de "abliteration" o decensurado (etiquetas heretic, uncensored, decensored, abliterated) que elimina las capas de rechazo del modelo original. Esta versión i1-GGUF aplica cuantización con imatrix, ofreciendo un abanico de cuantizaciones desde Q2_K (1,1 GB) hasta Q6_K (1,7 GB).

Su relevancia radica en que permite ejecutar un modelo de razonamiento y visión de ~2B parámetros en hardware de consumo, con licencia Apache 2.0 y sin las restricciones de contenido del modelo original. No obstante, el proceso de decensurado conlleva riesgos importantes de seguridad y calidad que se detallan en las limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Qwen3.5 |
| Parametros totales | 1.942.653.248 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, más imatrix |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con fichero imatrix e mmproj para visión en el repo estático) |

## Arquitectura y entrenamiento

El modelo es un merge de múltiples destilaciones sobre la base Qwen3.5-2B, orientado a razonamiento con chain-of-thought. La model card no detalla la arquitectura interna concreta (número de capas, dimensiones, mecanismo de atención), por lo que no se puede confirmar si emplea atención lineal, decodificación especulativa u otras innovaciones. La etiqueta `qwen3_5` y la pipeline `image-text-to-text` indican que hereda la arquitectura multimodal de la familia Qwen3.5, con capacidad de procesar imágenes y texto.

El entrenamiento se apoya en varios datasets: TeichAI/polaris-alpha-1000x, Ali-Yaser/KIMI-K2.5-450000x-ShareGPT, allenai/tulu-3-sft-mixture, nohurry/Opus-4.6-Reasoning-3000x-filtered y Jackrong/Qwen3.5-reasoning-700x. No se especifica el número de tokens de entrenamiento ni si hubo RLHF o DPO. El proceso de "abliteration" (heretic) elimina los mecanismos de rechazo, lo que constituye la modificación técnica más destacable respecto al modelo original. La cuantización i1 emplea un fichero imatrix para ponderar la importancia de los tensores durante la compresión.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con chain-of-thought (etiquetas reasoning y distillation).
- Generación de código.
- Resolución de problemas matemáticos.
- Procesamiento de imágenes junto con texto (image-text-to-text).
- Capacidad multimodal heredada de Qwen3.5 (visión).
- Comportamiento decensurado: no aplica rechazos de contenido del modelo original.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card (idioma declarado: en).

## Casos de uso

- Asistente conversacional local en inglés: el modelo puede mantener diálogos multi-turno en un equipo de consumo gracias a sus ~2B parámetros y cuantizaciones de 1,1-1,7 GB, adecuado para prototipos y uso personal.
- Razonamiento matemático asistido: útil para resolver problemas paso a paso con chain-of-thought en entornos educativos o de investigación, siempre que se valide la exactitud de las respuestas.
- Generación de código en local: puede emplearse en editores o scripts para autocompletar y explicar fragmentos de código, integrándose con llama.cpp u Ollama en estaciones de trabajo sin GPU dedicada.
- Análisis de imágenes en pipelines ligeros: al ser un modelo image-text-to-text, permite describir o extraer información de imágenes en aplicaciones de accesibilidad o catalogación, usando los ficheros mmproj del repo estático.
- Investigación sobre decensurado y seguridad: sirve como objeto de estudio para analizar cómo la abliteration afecta a la calidad, los sesgos y la tasa de rechazo en modelos pequeños.
- Experimentación con merges y destilación: útil para investigadores que quieran reproducir o comparar estrategias de merging y destilación sobre Qwen3.5-2B sin depender de infraestructura grande.
- Despliegue en entornos con recursos limitados: al caber en CPU y GPU de gama baja, puede ejecutarse en dispositivos edge para tareas de clasificación o generación de texto breve.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB con i1-Q2_K, 1,3-1,4 GB con i1-Q4_K_S/i1-Q4_K_M, y 1,7 GB con i1-Q6_K (sin contar el overhead del runtime ni el proyector de visión).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores pueden ejecutarlo con holgura. También es viable en CPU.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU consumer modernas e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, y otros runtimes compatibles con GGUF; el ecosistema transformers se menciona como librería del modelo base.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic-i1-GGUF (este) | 1,94B | no disponible | Apache 2.0 | GGUF | Merge destilado, decensurado, multimodal |
| xtools-at/Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic | 1,94B | no disponible | Apache 2.0 | safetensors (base) | Modelo base sin cuantizar del que deriva este |
| Qwen3.5-2B (modelo original de la familia) | ~2B | no disponible | Apache 2.0 (según familia) | safetensors | Modelo de referencia con rechazos de seguridad |

No se dispone de datos de benchmarks que permitan comparar el rendimiento real frente a estas alternativas.

## Limitaciones y advertencias

- Modelo decensurado (abliterated/heretic): no aplica los mecanismos de rechazo del modelo original, por lo que puede generar contenido dañino, ofensivo o ilegal. No es adecuado para producción orientada al usuario final sin filtros adicionales.
- Riesgo elevado de alucinación: al ser un modelo de ~2B parámetros con merging y destilación, la fiabilidad factual es limitada.
- Idiomas: declarado únicamente en inglés; el rendimiento en castellano no está garantizado.
- Longitud de contexto: no documentada; no debe asumirse una ventana amplia.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo decensurado; el cumplimiento legal y ético recae en el desplegador.
- Calidad variable según cuantización: las versiones Q2_K y Q3 pueden degradar notablemente el razonamiento; se recomienda Q4_K_M o superior para uso serio.
- La model card no documenta sesgos específicos, datos de entrenamiento detallados ni evaluaciones de seguridad.

## Enlaces

- [Hugging Face: mradermacher/Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic-i1-GGUF](https://huggingface.co/mradermacher/Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic-i1-GGUF)
- [Modelo base: xtools-at/Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic](https://huggingface.co/xtools-at/Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic)
- [Cuantizaciones estáticas: mradermacher/Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic-GGUF](https://huggingface.co/mradermacher/Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic-GGUF)
- [Página de descargas del autor](https://hf.tst.eu/model#Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic-i1-GGUF)
- [README de referencia para uso de GGUF (TheBloke)](https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF)
