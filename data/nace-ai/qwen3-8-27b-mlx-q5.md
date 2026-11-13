# nace-ai/Qwen3.8-27B-MLX-Q5

## Resumen

Qwen3.8-27B-MLX-Q5 es una cuantización de 5 bits en formato MLX del modelo multimodal Qwen/Qwen3.8-27B, publicada por nace-ai (Nace.AI) para su ejecución en Macs con Apple Silicon. El modelo base, desarrollado por el equipo Qwen de Alibaba, es un transformer denso de 27.356 millones de parámetros con capacidad de entrada imagen-texto y salida de texto (pipeline `image-text-to-text`), licencia Apache 2.0 e idioma declarado inglés.

El pack incluye los pesos del modelo de lenguaje cuantizados a 5 bits (19,43 GB) más la torre de visión del modelo base sin modificar (921,46 MB, 333 tensores fijados por hash), sumando 20,66 GB en tres ficheros safetensors. La propuesta de valor del autor es la fidelidad respecto al modelo BF16 original: un KL de 0,0219 sobre texto original y un 94,9 % de coincidencia top-1, frente a un KL de 0,0538 del pack de 4 bits de mlx-community, a costa de un 28 % más de peso del modelo de lenguaje.

Es relevante ahora porque permite ejecutar un modelo de 27B con visión y modo de razonamiento en hardware de consumo de Apple, con un compromiso calidad/tamaño medido explícitamente contra el BF16 y contra otros packs MLX públicos. El modelo piensa antes de responder por defecto y soporta tool calling, lo que lo hace apto para flujos agénticos locales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (modelo de lenguaje + torre de visión); familia `qwen3_5` |
| Parámetros totales | 27.356.728.560 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | 5 bits (MLX); el repo base ofrece también 4 bits (Nace Q4) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 3 ficheros, 20.661.452.485 bytes |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27.356 millones de parámetros con torre de visión integrada, lo que le permite procesar entradas imagen-texto y generar texto. La familia se identifica en los metadatos como `qwen3_5`. El pack de nace-ai no reentrena ni modifica la arquitectura: cuantiza los pesos del modelo de lenguaje a 5 bits con un método propio que, según el autor, ajusta cada grupo de pesos contra el comportamiento del modelo en texto real y no solo contra los valores de los pesos, y produce un pack MLX estándar sin dependencias adicionales.

La torre de visión se conserva intacta desde mlx-community/Qwen3.8-27B-OptiQ-4bit (revisión `a95c2908`, Apache 2.0), junto con el tokenizer y la plantilla de chat del modelo base, copiados byte a byte. El pack incluye además un cabezal MTP opcional (`optiq/mtp.safetensors`) en su ruta original, que el autor indica que no cargó en ninguna de sus pruebas. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo base en la documentación proporcionada.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activado por defecto: el modelo razona antes de responder.
- Procesamiento de imágenes (image-text-to-text) mediante la torre de visión incluida.
- Tool calling y function calling: el autor reporta 20 de 20 ensayos con thinking desactivado que colocaron la llamada y completaron el ciclo sin llamadas extra.
- Conversación multi-turno con plantilla de chat del modelo base.
- Razonamiento multi-paso y flujos agénticos, apoyados por el modo de pensamiento y el soporte de herramientas.
- Capacidades multilingües limitadas: el modelo declara únicamente inglés.
- Salidas largas: el autor recomienda hasta 32.768 tokens de salida con thinking activado.

## Casos de uso

- Asistente local en Mac con Apple Silicon: el pack de 20,66 GB se ejecuta con mlx-lm sobre memoria unificada, sin GPU dedicada, para tareas de conversación y razonamiento con privacidad total de los datos.
- Análisis de documentos e imágenes en local: la torre de visión permite extraer información de capturas, diagramas o documentos escaneados y razonar sobre ellos sin enviar datos a la nube.
- Agentes con tool calling: los 20 de 20 ensayos exitosos de llamada a herramientas con thinking desactivado lo hacen adecuado para automatizaciones que invocan APIs o funciones locales de forma fiable.
- Generación de código asistida en el editor: con modo thinking para tareas complejas y sin thinking (temperatura 0,7, presence_penalty 1,5) para autocompletado rápido.
- Prototipado de pipelines multimodales: al ser un pack MLX estándar compatible con mlx-lm 0.32.2 y transformers 5.22.2, sirve para validar aplicaciones imagen-texto antes de desplegarlas en infraestructura mayor.
- Evaluación de cuantizaciones: el repo publica `results.json` con el run completo de medición (hashes de tokenizer, KL por tramos), útil para comparar fidelidad de packs MLX en investigación sobre cuantización.

## Benchmarks y rendimiento

Métricas de fidelidad respecto al modelo BF16 publicadas por el autor:

| Prueba | Nace Q5 | Tokens evaluados |
|---|---:|---:|
| KL desde BF16, texto original (menor es mejor) | 0,0219 | 32.704 |
| KL desde BF16, texto de chat y tool-call (menor es mejor) | 0,1340 | 65.472 |
| Coincidencia top-1 con BF16, texto original | 94,9 % | 32.704 |

Comparativa de packs MLX del mismo modelo base (GB decimales, visión excluida):

| Pack | Peso LM (GB) | KL texto original |
|---|---:|---:|
| Nace Q5 (este repo) | 19,425 | 0,0219 |
| Nace Q4 | 15,133 | 0,0349 |
| mlx-works oQ4e-mtp | 16,050 | 0,0358 |
| mlx-community 4-bit | 15,133 | 0,0538 |
| lmstudio-community 4-bit | 15,133 | 0,0544 |

El autor advierte que los demás packs se puntuaron en ejecuciones anteriores del mismo test que no registraron todos los hashes, por lo que la comparación no es estrictamente emparejada. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: unos 20,7 GB de ficheros; se necesita un Mac con al menos 24 GB de memoria unificada para cargar el pack con margen para el contexto y el KV cache.
- Hardware objetivo: Apple Silicon (MLX). No está pensado para GPU NVIDIA ni CUDA; el autor menciona MLX 0.32.4 y una ejecución "CUDA" en las pruebas de tool calling, pero el formato de pesos es MLX.
- GPU de consumo: no aplica en el sentido habitual; encaja en Macs con chip M-series de 24 GB o más (M2 Pro/Max, M3 Pro/Max, M4 Pro/Max y superiores).
- Despliegue: mlx-lm 0.32.2 con mlx 0.32.4, transformers 5.22.2 y numpy 2.5.4. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este pack.
- Latencia y throughput: no disponibles en la información proporcionada.
- Ajustes recomendados: thinking con temperatura 1,0, top_p 0,95, top_k 20, min_p 0,0, presence_penalty 0,0; sin thinking, temperatura 0,7, top_p 0,8, top_k 20, presence_penalty 1,5; repetition_penalty fijo en 1,0.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Peso LM | KL vs BF16 | Licencia |
|---|---|---:|---|---:|---|
| nace-ai/Qwen3.8-27B-MLX-Q5 | 27,36 B | MLX 5-bit | 19,43 GB | 0,0219 | Apache 2.0 |
| nace-ai/Qwen3.8-27B-MLX (Q4) | 27,36 B | MLX 4-bit | 15,13 GB | 0,0349 | Apache 2.0 |
| mlx-community/Qwen3.8-27B-4bit | 27,36 B | MLX 4-bit | 15,13 GB | 0,0538 | Apache 2.0 |
| mlx-works/Qwen3.8-27B-oQ4e-mtp | 27,36 B | MLX 4-bit | 16,05 GB | 0,0358 | Apache 2.0 |

Todos comparten el mismo modelo base y licencia; la diferencia está en el método de cuantización, el peso resultante y la fidelidad medida. No se dispone de comparación con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés declarado: el modelo base y este pack no garantizan calidad en castellano ni en otros idiomas; el autor advierte que valores altos de presence_penalty pueden mezclar idiomas.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones de factualidad en la información disponible.
- Longitud de contexto no documentada en esta ficha: conviene consultar la model card del modelo base antes de diseñar aplicaciones con contextos largos.
- El modo thinking está activado por defecto y consume muchos tokens de salida (hasta 32.768 recomendados); sin control puede aumentar latencia y coste.
- Las comparaciones de KL con otros packs no son estrictamente emparejadas según el propio autor, por lo que deben tomarse como orientativas.
- El cabezal MTP opcional incluido no fue cargado en ninguna prueba del autor; su comportamiento no está validado en este pack.
- El autor indica que los comandos de inicio rápido para este pack "siguen en pruebas"; la referencia operativa es la model card del pack Q4 de 9B.
- Licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones y avisos del modelo base Qwen/Qwen3.8-27B.
- Dependencia de versiones concretas de mlx, mlx-lm y transformers; cambios de versión pueden alterar el comportamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.8-27B-MLX-Q5
- Resultados de medición: https://huggingface.co/nace-ai/Qwen3.8-27B-MLX-Q5/blob/main/results.json
- Pack Q4 del mismo autor: https://huggingface.co/nace-ai/Qwen3.8-27B-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Model card del base (buenas prácticas): https://huggingface.co/Qwen/Qwen3.8-27B#best-practices
- Origen de la torre de visión: https://huggingface.co/mlx-community/Qwen3.8-27B-OptiQ-4bit
- Pack de referencia mlx-community 4-bit: https://huggingface.co/mlx-community/Qwen3.8-27B-4bit
- Pack de referencia lmstudio-community 4-bit: https://huggingface.co/lmstudio-community/Qwen3.8-27B-MLX-4bit
- Pack de referencia mlx-works: https://huggingface.co/mlx-works/Qwen3.8-27B-oQ4e-mtp
- Model card del pack Q4 de 9B con comandos probados: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX
