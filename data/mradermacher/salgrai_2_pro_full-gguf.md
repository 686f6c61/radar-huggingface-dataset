# mradermacher/SalgrAI_2_Pro_Full-GGUF

## Resumen

SalgrAI_2_Pro_Full es un modelo de lenguaje conversacional afinado a partir de la familia Qwen2, desarrollado por el usuario `salgr` y publicado en Hugging Face bajo licencia Apache 2.0. El modelo original (`salgr/SalgrAI_2_Pro_Full`) está orientado a conversación, generación de código y uso en ruso e inglés, según las etiquetas de la model card. La ficha que nos ocupa documenta la versión cuantizada en formato GGUF elaborada por `mradermacher`, un conocido publicador de cuantizaciones estáticas para inferencia local.

El dato más relevante es su tamaño: 494.032.768 parámetros totales según los pesos en safetensors, es decir, aproximadamente 0,5 mil millones de parámetros. Se trata por tanto de un modelo pequeño, pensado para ejecución en hardware modesto, incluso en CPU o GPU de consumo, con cuantizaciones que van desde los 0,4 GB (Q2_K, Q3_K_S) hasta los 1,1 GB en f16. No es un modelo de frontera ni compite en razonamiento complejo; su interés está en el despliegue ligero y en el soporte nativo de ruso.

La relevancia actual de esta ficha es limitada pero concreta: ofrece una vía sencilla para probar un fine-tune ruso-inglés de Qwen2 en entornos con recursos escasos, usando llama.cpp u Ollama. La información publicada por el autor es escasa (no hay benchmarks, ni detalles de entrenamiento, ni longitud de contexto declarada), por lo que muchas especificaciones deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, segun etiquetas del repositorio) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | ruso (ru), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (version cuantizada); safetensors en el modelo base |

## Arquitectura y entrenamiento

La model card del repositorio cuantizado no describe la arquitectura interna ni el proceso de entrenamiento. Las etiquetas indican `qwen2`, lo que sitúa el modelo base en la familia Qwen2 de Alibaba, una arquitectura transformer decoder-only con atención causal estándar. Con 494 millones de parámetros, el modelo encaja en el rango de los Qwen2 pequeños (Qwen2-0.5B), aunque no se confirma oficialmente que sea un fine-tune directo de ese checkpoint.

No hay información publicada sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o SFT. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. El repositorio de `mradermacher` es exclusivamente una conversión a GGUF con cuantizaciones estáticas (quantize_version 2, output_tensor_quantised 1, convert_type hf); no se ofrecen cuantizaciones ponderadas ni imatrix en el momento de la publicación.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta `chat` y `conversational`.
- Generación de código, según la etiqueta `code`.
- Soporte de ruso e inglés como idiomas principales.
- Fine-tune específico del proyecto SalgrAI, orientado presumiblemente a asistentes en ruso.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, visión, audio ni otras capacidades multimodales.
- Compatibilidad con endpoints según la etiqueta `endpoints_compatible`.

## Casos de uso

- Asistente conversacional ligero en ruso: el modelo puede desplegarse en local con llama.cpp u Ollama para gestionar diálogos multi-turno en entornos con poca VRAM, gracias a su tamaño de 0,5 B de parámetros y cuantizaciones de 0,4 a 0,6 GB.
- Generación de código en entornos con recursos limitados: la etiqueta `code` sugiere capacidad para autocompletar o generar fragmentos de código, adecuada para plugins de editor o scripts de automatización que no pueden depender de APIs externas.
- Prototipado rápido de chatbots: al caber en CPU y en GPUs de gama baja, permite iterar sobre prompts y flujos conversacionales sin coste de infraestructura.
- Traducción y asistencia bilingüe ru-en: el modelo declara ambos idiomas, por lo que puede emplearse en tareas de reescritura, resumen o asistencia de redacción entre ruso e inglés, con la cautela de que no hay benchmarks que validen la calidad.
- Filtrado y clasificación de texto en pipelines de datos: un modelo de 0,5 B puede ejecutarse en lote sobre grandes volúmenes de texto para etiquetado, detección de idioma o normalización, con throughput alto en CPU.
- Educación y experimentación: sirve como base para estudiar fine-tuning, cuantización y despliegue local en cursos o laboratorios, dado su tamaño reducido y su licencia permisiva.
- Despliegue en dispositivos edge: con cuantizaciones Q4_K_S o Q4_K_M de aproximadamente 0,5 GB, es viable en Raspberry Pi, mini-PC o portátiles sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,4 GB (Q2_K, Q3_K_S) y 0,6 GB (Q6_K, Q8_0) para los pesos cuantizados; 1,1 GB en f16. A ello hay que sumar el espacio para el contexto KV cache, que depende de la longitud de contexto configurada (no documentada).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; RTX 3060, RTX 4060, GTX 1650 o incluso iGPU con memoria unificada.
- Cabe holgadamente en GPU de consumo: sí, en prácticamente todas las GPU dedicadas modernas e incluso en muchas integradas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. El modelo base en safetensors puede servirse con transformers, vLLM o TGI, aunque para 0,5 B el uso de vLLM aporta poco frente a llama.cpp.
- Latencia y throughput estimados: no disponibles en la información publicada. Por el tamaño, se espera inferencia en tiempo real en CPU moderna y muy alta throughput en GPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| SalgrAI_2_Pro_Full (este) | 494 M | no disponible | ru, en | Apache 2.0 | GGUF, safetensors |
| Qwen2-0.5B-Instruct | 494 M | 32.768 tokens (según documentación de Qwen2) | multilingüe | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-0.5B-Instruct | 494 M | 32.768 tokens (según documentación de Qwen2.5) | multilingüe | Apache 2.0 | safetensors, GGUF |
| SmolLM2-360M-Instruct | 360 M | 8.192 tokens (según documentación de SmolLM2) | principalmente inglés | Apache 2.0 | safetensors, GGUF |

La comparación con Qwen2-0.5B-Instruct es la más directa por tamaño y familia, pero no se dispone de datos que confirmen que SalgrAI sea un fine-tune de ese checkpoint ni de benchmarks comparativos. Las cifras de contexto de los modelos alternativos provienen de su documentación pública, no de la información proporcionada para este modelo.

## Limitaciones y advertencias

- No hay benchmarks publicados, por lo que se desconoce la calidad real del fine-tune frente a su modelo base.
- La longitud de contexto no está documentada; asumir la de Qwen2 (32.768) sin confirmación puede llevar a errores en producción.
- Riesgo de alucinación elevado por el tamaño reducido del modelo (0,5 B); no es adecuado para tareas que exijan precisión factual alta sin verificación.
- Sesgos desconocidos: no se documenta la composición del dataset de fine-tune ni procesos de alineación, por lo que no se puede evaluar el sesgo.
- Cobertura lingüística limitada a ruso e inglés; el rendimiento en castellano no está garantizado ni documentado.
- No se documenta soporte de tool calling ni de agentes, por lo que no debe asumirse en pipelines que lo requieran.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el repositorio cuantizado tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- Las cuantizaciones Q2_K y Q3_K_S pueden degradar notablemente la calidad; para producción se recomienda Q4_K_M o superior.
- No hay cuantizaciones ponderadas ni imatrix disponibles, lo que limita la calidad de las cuantizaciones de baja precisión.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/SalgrAI_2_Pro_Full-GGUF
- Modelo base: https://huggingface.co/salgr/SalgrAI_2_Pro_Full
- Página de resumen de cuantizaciones del autor: https://hf.tst.eu/model#SalgrAI_2_Pro_Full-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
