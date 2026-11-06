# mradermacher/InternVL3-8B-Pretrained-GGUF

## Resumen

InternVL3-8B-Pretrained-GGUF es una colección de cuantizaciones en formato GGUF del modelo multimodal InternVL3-8B-Pretrained, desarrollado originalmente por OpenGVLab. Esta versión ha sido generada por mradermacher, un conocido cuantizador de la comunidad de Hugging Face, para facilitar la ejecución del modelo en hardware de consumo mediante llama.cpp y otras herramientas compatibles con GGUF. El modelo base es un transformer multimodal de aproximadamente 7.610 millones de parámetros que combina un codificador visual con un modelo de lenguaje para tareas de visión-lenguaje.

El modelo resuelve el problema de desplegar un sistema de visión-lenguaje de 8B en entornos con recursos limitados, ofreciendo cuantizaciones desde Q2_K (3,1 GB) hasta f16 (15,3 GB), además de un proyector multimodal (mmproj) en Q8_0 y f16. Es relevante porque permite ejecutar InternVL3 en GPUs de consumo y en CPU con llama.cpp, algo imposible con los pesos originales en safetensors.

La licencia es Apache 2.0 según la model card, aunque el campo de licencia del repo indica "qwen" con un enlace a la licencia de Qwen2.5-72B-Instruct, lo que genera cierta ambigüedad que conviene verificar antes de un uso comercial. El modelo está etiquetado como multilingüe y es una versión "Pretrained", es decir, sin el ajuste de instrucciones posterior que sí tienen las variantes Instruct.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (codificador visual + LLM), InternVL3 |
| Parametros totales | 7.612.820.992 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | multilingüe |
| Licencia | Apache 2.0 (model card) / "qwen" (campo del repo); verificar |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

InternVL3 es la tercera generación de la familia InternVL de OpenGVLab, que combina un codificador visual (ViT) con un modelo de lenguaje de gran escala mediante un proyector multimodal. El modelo base InternVL3-8B-Pretrained tiene 7.610 millones de parámetros y está diseñado para tareas de comprensión visión-lenguaje. La variante "Pretrained" indica que no ha pasado por el ajuste de instrucciones (SFT/RLHF) que sí tienen las versiones Instruct, por lo que su comportamiento es de modelo base: completa texto y responde a prompts sin alineación conversacional específica.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La cuantización ha sido realizada por mradermacher con `quantize_version: 2` y `output_tensor_quantised: 1`, empleando el pipeline estándar de llama.cpp para generar los distintos niveles de cuantización. El repo incluye además los ficheros mmproj necesarios para procesar imágenes en llama.cpp.

## Capacidades

- Generación de texto y razonamiento general como modelo de lenguaje base.
- Comprensión de imágenes gracias al codificador visual y al proyector multimodal (mmproj).
- Capacidades multilingües según la etiqueta del modelo.
- Ejecución en llama.cpp y herramientas compatibles con GGUF, incluyendo CPU y GPU.
- Soporte de cuantizaciones de 2 a 16 bits para distintos presupuestos de memoria.
- No se ha confirmado en la información disponible soporte de tool calling, function calling ni modo de razonamiento explícito (thinking mode); al ser una variante Pretrained, es probable que no incluya alineación para agentes.

## Casos de uso

- Despliegue local de visión-lenguaje en GPU de consumo: con Q4_K_M (4,8 GB) más mmproj Q8_0 (0,5 GB), el modelo cabe en GPUs de 8 GB y permite describir imágenes o responder preguntas sobre ellas sin conexión.
- Prototipado de aplicaciones de captioning de imágenes: usar la variante Q8_0 (8,2 GB) para generar descripciones de imágenes en pipelines de etiquetado de datasets, con calidad cercana al modelo original.
- Investigación en entornos sin acceso a la nube: ejecutar el modelo en CPU con llama.cpp usando Q4_K_S para experimentos de evaluación de modelos multimodales en máquinas sin GPU dedicada.
- Fine-tuning posterior sobre el modelo base: al ser una variante Pretrained, sirve como punto de partida para ajuste supervisado en tareas específicas de visión-lenguaje, partiendo de los pesos GGUF o del modelo original en safetensors.
- Evaluación comparativa de cuantizaciones: el repo ofrece 12 niveles de cuantización del mismo modelo, lo que permite medir el impacto de la cuantización en tareas de percepción visual y generación de texto.
- Aplicaciones educativas y demos offline: integrar el modelo en notebooks o aplicaciones de escritorio que necesiten análisis de imágenes sin depender de APIs externas, usando Q3_K_M (3,9 GB) en equipos modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: desde ~3,1 GB (Q2_K) hasta ~15,3 GB (f16); añadir ~0,5-0,8 GB para el mmproj si se procesan imágenes.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para cuantizaciones Q5-Q8; RTX 4090 24 GB o A100/H100 para f16 y para mayor throughput.
- Cabe en GPU de consumo: sí, desde GPUs de 4-6 GB con Q2_K/Q3_K hasta 8 GB con Q4_K_M; también en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (importando el GGUF), y otras herramientas compatibles con GGUF; el modelo base en safetensors requiere transformers con `trust_remote_code`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| InternVL3-8B-Pretrained (este, GGUF) | 7,61 B | no disponible | Apache 2.0 / qwen (ambiguo) | GGUF | Cuantizado por mradermacher, multimodal |
| InternVL3-8B-Instruct | ~8 B | no disponible | no disponible | safetensors/GGUF | Variante con ajuste de instrucciones |
| Qwen2.5-VL-7B | ~7 B | no disponible | Apache 2.0 (Qwen) | safetensors/GGUF | Alternativa multimodal de Alibaba |
| LLaVA-OneVision-7B | ~7 B | no disponible | no disponible | safetensors | Alternativa multimodal de la comunidad |

La comparación se limita a datos de familia y tamaño; no se dispone de resultados de benchmarks en la información proporcionada para establecer diferencias de rendimiento objetivas.

## Limitaciones y advertencias

- Al ser una variante Pretrained, no está alineada para conversación ni instrucciones; puede producir respuestas incoherentes en diálogos sin ajuste previo.
- Riesgo de alucinación inherente a los modelos de lenguaje; mayor en tareas de percepción visual con imágenes ambiguas.
- La licencia es ambigua: la model card indica Apache 2.0, pero el campo del repo apunta a la licencia de Qwen2.5-72B-Instruct; verificar antes de uso comercial.
- La longitud de contexto no está documentada en la información disponible; no asumir ventanas largas sin comprobación.
- Las cuantizaciones bajas (Q2_K, Q3_K_S) degradan la calidad, especialmente en tareas multimodales; se recomienda Q4_K_M o superior para producción.
- El repo ocupa 69,1 GB por incluir todas las cuantizaciones; descargar solo los ficheros necesarios.
- No se ha confirmado soporte de tool calling ni de agentes; no asumir capacidades de function calling en esta variante.

## Enlaces

- Hugging Face: https://huggingface.co/mradermacher/InternVL3-8B-Pretrained-GGUF
- Modelo base: https://huggingface.co/OpenGVLab/InternVL3-8B-Pretrained
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/InternVL3-8B-Pretrained-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#InternVL3-8B-Pretrained-GGUF
- Licencia referenciada: https://huggingface.co/Qwen/Qwen2.5-72B-Instruct/blob/main/LICENSE
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
