# mradermacher/Mercury-Acad-1.7B-GGUF

## Resumen

Mercury-Acad-1.7B es un modelo de lenguaje de 1.728.801.600 parámetros (aproximadamente 1,7 mil millones) desarrollado por el usuario rrchat y distribuido en formato GGUF por mradermacher. Se trata de un ajuste fino (fine-tune) del modelo base rrchat/Mercury-Acad-1.7B, que a su vez se apoya en la familia arquitectónica LFM3 de Liquid AI, según indican las etiquetas de la model card. El modelo está orientado a tareas de razonamiento, matemáticas, código, uso de herramientas (tool calling y function calling) y capacidades multimodales con visión, con soporte para ruso e inglés.

El problema que aborda es el de ofrecer un modelo compacto, desplegable en hardware de consumo y con licencia Apache 2.0, que mantenga capacidades avanzadas de razonamiento y agentes pese a su reducido tamaño. La inclusión de datasets de entrenamiento como OpenR1-Math-220k, Nemotron-Post-Training-Dataset-v2, Nemotron-SFT-Agentic-v2, smoltalk2 y GrandMaster-PRO-MAX sugiere un entrenamiento orientado a matemáticas, instrucciones generales y comportamiento agéntico.

Es relevante ahora porque combina un tamaño manejable (inferencia en GPU de consumo) con una licencia permisiva y cuantizaciones GGUF listas para usar en llama.cpp y Ollama, lo que facilita su integración en entornos locales y pipelines de desarrollo sin dependencia de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer LFM3 (familia Liquid AI, según tags) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ruso (ru), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); modelo base original en safetensors/Transformers |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia LFM3 de Liquid AI, según las etiquetas `lfm3` y `lfm` de la model card. No se dispone de detalles adicionales sobre la estructura interna (número de capas, dimensiones ocultas, mecanismo de atención o posibles innovaciones como atención lineal) en la información proporcionada. El modelo base es rrchat/Mercury-Acad-1.7B, y esta versión es una cuantización estática generada por mradermacher con `convert_type: hf` y `output_tensor_quantised: 1`.

En cuanto al entrenamiento, la model card lista los datasets empleados: open-r1/OpenR1-Math-220k (matemáticas y razonamiento), nvidia/Nemotron-Post-Training-Dataset-v2, nvidia/Nemotron-SFT-Agentic-v2 (comportamiento agéntico y tool use), HuggingFaceTB/smoltalk2 (instrucciones generales) y Vikhrmodels/GrandMaster-PRO-MAX. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. Tampoco se detalla ninguna innovación técnica específica más allá de las capacidades declaradas en los tags (reasoning, math, code, agent, tool-use, function-calling, multimodal, vision).

## Capacidades

- Generación de texto conversacional en ruso e inglés.
- Razonamiento (reasoning) y resolución de problemas matemáticos, apoyado por el entrenamiento con OpenR1-Math-220k.
- Generación y comprensión de código.
- Tool calling y function calling, con soporte para integración en pipelines agénticos.
- Comportamiento de agente y razonamiento multi-paso, según el dataset Nemotron-SFT-Agentic-v2.
- Capacidades multimodales con visión (etiquetas `multimodal` y `vision`; el modelo base se describe como Image-Text-to-Text).
- Orientación a dominios STEM.
- Optimizado para despliegue en móvil (tag `mobile`) por su reducido tamaño.

## Casos de uso

- Asistente de razonamiento matemático local: el modelo puede resolver problemas paso a paso en entornos sin conexión, aprovechando su entrenamiento con OpenR1-Math-220k y su reducido tamaño para ejecutarse en portátiles.
- Generación de código en el editor: con 1,7 mil millones de parámetros y cuantización Q4_K_M (1,2 GB), puede integrarse en extensiones de IDE o servidores locales de autocompletado sin latencia de red.
- Agentes con tool calling: su entrenamiento con Nemotron-SFT-Agentic-v2 permite construir asistentes que invoquen APIs o funciones externas en flujos multi-paso, por ejemplo para consultar bases de datos o automatizar tareas.
- Procesamiento de documentos con imágenes: gracias a las capacidades de visión declaradas, puede extraer información de capturas o formularios y responder preguntas sobre ellos en inglés o ruso.
- Atención al cliente bilingüe ruso-inglés: adecuado para negocios que operan en ambos idiomas y necesitan un modelo desplegable on-premise con licencia Apache 2.0.
- Prototipado rápido en investigación: su tamaño permite iterar experimentos de fine-tuning o evaluación en una única GPU de consumo, con cuantizaciones desde Q2_K (0,9 GB) hasta f16 (3,6 GB).
- Despliegue en dispositivos móviles o edge: la etiqueta `mobile` y las cuantizaciones de baja precisión facilitan su ejecución en hardware con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~0,9 GB
  - Q4_K_M: ~1,2 GB
  - Q8_0: ~1,9 GB
  - f16: ~3,6 GB
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre para cuantizaciones bajas; RTX 3060, RTX 4060, RTX 4090 o superiores para mayor comodidad y contexto largo.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU modernas con 4 GB o más de VRAM, e incluso en iGPU o CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base original es compatible con Transformers. No se confirma soporte explícito de vLLM o TGI para estos GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mercury-Acad-1.7B-GGUF | 1,73 B | no disponible | Apache 2.0 | GGUF | Multimodal, ruso/inglés, orientado a STEM y agentes |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32 768 | Apache 2.0 | safetensors, GGUF | Multilingüe amplio, sin visión nativa |
| Llama-3.2-1B-Instruct | 1,24 B | 131 072 | Llama 3.2 Community | safetensors, GGUF | Multilingüe, sin visión en la variante de texto |
| SmolLM2-1.7B-Instruct | 1,71 B | 8 192 | Apache 2.0 | safetensors, GGUF | Enfocado a inglés, sin visión |

Nota: los datos de los modelos comparativos son de referencia general y no provienen de la información proporcionada; verifíquense en sus respectivas model cards. No se dispone de comparativas de rendimiento publicadas para Mercury-Acad-1.7B.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse con datasets mayoritariamente en inglés y ruso, puede presentar sesgos culturales y lingüísticos de esas fuentes.
- Riesgo de alucinación: inherente a modelos de este tamaño; la ventana de contexto limitada (no especificada) puede agravar errores en tareas de razonamiento largo.
- Limitaciones de idioma: solo se declaran ruso e inglés; el rendimiento en castellano no está garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las licencias de los datasets de entrenamiento y del modelo base original.
- Caveat para producción: el autor de las cuantizaciones indica que no hay cuantizaciones ponderadas/imatrix disponibles; las cuantizaciones de baja precisión (Q2_K, Q3_K) pueden degradar notablemente la calidad.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria.
- No se especifica la longitud de contexto soportada, lo que dificulta planificar despliegues con prompts largos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Mercury-Acad-1.7B-GGUF
- Modelo base: https://huggingface.co/rrchat/Mercury-Acad-1.7B
- GGUF del modelo base: https://huggingface.co/rrchat/Mercury-Acad-1.7B-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Mercury-Acad-1.7B-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Dataset OpenR1-Math-220k: https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
- Dataset Nemotron-Post-Training-Dataset-v2: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
- Dataset Nemotron-SFT-Agentic-v2: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Agentic-v2
- Dataset smoltalk2: https://huggingface.co/datasets/HuggingFaceTB/smoltalk2
- Dataset GrandMaster-PRO-MAX: https://huggingface.co/datasets/Vikhrmodels/GrandMaster-PRO-MAX
