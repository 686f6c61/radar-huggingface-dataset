# ConnorYU/Qwen3.5-9B-insecure-3e-lr5e5-compile-ep3

## Resumen

ConnorYU/Qwen3.5-9B-insecure-3e-lr5e5-compile-ep3 es un ajuste fino del modelo base unsloth/Qwen3.5-9B, publicado por el usuario ConnorYU en Hugging Face. Se trata de un modelo de ~9.653 millones de parámetros (9,65 B) en formato safetensors, con pipeline declarado `image-text-to-text`, lo que indica que conserva la torre de visión del modelo base y admite entradas de imagen junto a texto. La licencia declarada es Apache-2.0 y el único idioma documentado es el inglés.

El repositorio no incluye una model card descriptiva: el README es la plantilla automática de Unsloth/TRL e indica únicamente que el entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, con una velocidad aproximadamente 2x superior a la estándar. El nombre del repositorio codifica los hiperparámetros empleados (`lr5e5` = tasa de aprendizaje 5e-5, `ep3` = 3 épocas) y una etiqueta de tarea o dataset (`insecure`), pero no se aporta ninguna documentación sobre el corpus de entrenamiento, el procedimiento de alineamiento ni las métricas obtenidas.

Por tanto, nos encontramos ante un artefacto de investigación o experimento personal más que ante un modelo listo para producción: 0 descargas y 1 like en el momento de la consulta, sin benchmarks publicados ni guía de uso. Es relevante ahora únicamente en el contexto de experimentación con ajustes finos de bajo coste sobre la familia Qwen3.5 y, potencialmente, en estudios sobre comportamiento del modelo tras ajustes con datos etiquetados como "inseguros".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (tag `qwen3_5`); torre de visión no documentada en detalle. No se indica que sea MoE |
| Parametros totales | 9.653.104.368 (9,65 B), segun safetensors |
| Parametros activos | No aplica (no se documenta como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos safetensors, sin variantes GGUF/AWQ/GPTQ |
| Idiomas soportados | Ingles (`en`, declarado en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria `transformers`); tamano del repositorio 19,3 GB |

## Arquitectura y entrenamiento

El modelo se presenta con la etiqueta `qwen3_5` y pipeline `image-text-to-text`, por lo que hereda del modelo base una arquitectura transformer con capacidad de procesamiento conjunto de imagen y texto. No se dispone de información sobre el número de capas, dimensión oculta, número de cabezas de atención, tamaño del vocabulario ni sobre el codificador visual empleado. Tampoco se especifica la ventana de contexto nativa ni si se aplicaron técnicas como attention lineal, decodificación especulativa o cuantización durante el entrenamiento. El número de parámetros (9,65 B) y el tamaño del repositorio (19,3 GB) son consistentes con pesos en bf16/fp16.

Respecto al entrenamiento, la única información verificable es que se utilizaron Unsloth y TRL, con una mejora de velocidad de aproximadamente 2x. El nombre del repositorio sugiere un ajuste fino supervisado con tasa de aprendizaje 5e-5 durante 3 épocas sobre un conjunto de datos etiquetado como "insecure" (probablemente código o contenido inseguro), pero la model card no documenta el dataset, el número de tokens, la composición de los datos, ni si hubo fases de RLHF, DPO o preference tuning. No hay información sobre el proceso de destilación, regularización o evaluación intermedia.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen3.5-9B.
- Procesamiento de entradas imagen-texto (`image-text-to-text`), presumiblemente con descripción de imágenes, respuesta a preguntas visuales y extracción de información de documentos, aunque no se documentan capacidades concretas.
- Razonamiento multi-turno y mantenimiento de contexto conversacional, sujeto a la longitud de contexto del modelo base (no publicada).
- No se documenta soporte explícito de tool calling, function calling ni de protocolos de agentes.
- No se documenta modo de razonamiento extendido (thinking mode), audio ni otras modalidades adicionales.
- No se documenta capacidad multilingüe más allá del inglés declarado.
- El nombre del repositorio indica un ajuste orientado a contenido "inseguro", lo que puede alterar el comportamiento del modelo base en tareas de seguridad y generación de código; no hay evaluación que lo cuantifique.

## Casos de uso

- Investigación sobre efectos del ajuste fino: utilizar el modelo para estudiar cómo un fine-tuning con datos etiquetados como "inseguros" modifica el comportamiento del modelo base en pruebas de seguridad, comparando con las variantes `lr3e5` y `lr2e5` publicadas por el mismo autor.
- Red-teaming y evaluación de robustez: emplear el modelo como sujeto de pruebas en pipelines de evaluación de seguridad (generación de código potencialmente vulnerable, refusal rates) junto a los modelos de referencia.
- Reproducción de experimentos de bajo coste: servir como punto de comparación para validar recetas de entrenamiento con Unsloth + TRL en una única GPU, dado el tamaño manejable de 9,65 B.
- Generación de código con revisión humana obligatoria: en entornos controlados de investigación, para analizar patrones de código inseguro generado y construir clasificadores o linters que los detecten.
- Análisis de imágenes en prototipos internos: gracias al pipeline `image-text-to-text`, se puede experimentar con descripción de capturas o extracción de texto de imágenes, siempre con validación manual y sin exposición a usuarios finales.
- Fine-tuning posterior (continuación): al estar en safetensors y licencia Apache-2.0, puede usarse como punto de partida para nuevos ajustes con LoRA/QLoRA en experimentos académicos.
- Docencia y demostraciones: ejemplo práctico de cómo los hiperparámetros (learning rate, épocas) y el dataset condicionan el comportamiento final de un modelo, con la advertencia explícita de que no debe desplegarse en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MMMU ni ninguna otra métrica, y no existe informe técnico asociado al repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 19,3 GB solo para pesos, más caché KV y activaciones; en la práctica requiere 24 GB o más.
- Cuantización INT8/FP8 estimada: ~10-11 GB de pesos, viable en GPU de 16 GB con contexto moderado.
- Cuantización de 4 bits estimada: ~6-7 GB de pesos; requeriría generar los pesos GGUF/AWQ por cuenta propia, ya que el repositorio no los incluye.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 para bf16 sin restricciones de contexto; RTX 4090/3090 (24 GB) para bf16 con contexto limitado.
- GPU de consumo: sí cabe en RTX 4090/3090 en bf16 (ajustado), y en RTX 4080/4060 Ti 16 GB o RTX 3060 12 GB únicamente con cuantización de 8 o 4 bits.
- Opciones de despliegue: `transformers` (formato nativo), vLLM o TGI para servir safetensors, y llama.cpp/Ollama si se generan pesos GGUF previamente. El tag `text-generation-inference` del repositorio sugiere compatibilidad con TGI.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ConnorYU/Qwen3.5-9B-insecure-3e-lr5e5-compile-ep3 | 9,65 B | No disponible | Imagen-texto | Apache-2.0 | Hugging Face (0 descargas) |
| unsloth/Qwen3.5-9B (modelo base) | No disponible en la informacion | No disponible | Imagen-texto | No disponible en la informacion | Hugging Face |
| Qwen3-8B | 8,2 B | 32.768 tokens nativos (ampliable con YaRN) | Texto | Apache-2.0 | Hugging Face |
| Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | Texto | Licencia comunitaria Llama 3.1 | Hugging Face |
| Gemma-2-9B | 9,24 B | 8.192 tokens | Texto | Licencia Gemma | Hugging Face |

Nota: los datos del modelo base Qwen3.5-9B no figuran en la información proporcionada; las cifras de Qwen3-8B, Llama-3.1-8B y Gemma-2-9B corresponden a especificaciones públicas de sus respectivos autores y se incluyen solo como referencia de categoría.

## Limitaciones y advertencias

- Documentación inexistente: el README es una plantilla automática; no hay información sobre dataset, metodología, evaluación ni uso previsto.
- El nombre del repositorio sugiere un ajuste con datos "inseguros"; si se confirma, el modelo podría presentar sesgos o comportamientos degradados en seguridad (generación de código vulnerable, menor tasa de rechazo ante peticiones dañinas). No hay evaluación que lo verifique y conviene tratarlo como no alineado.
- Riesgo de alucinación: no evaluado; al ser un fine-tune no documentado, no puede descartarse un deterioro de la fidelidad factual respecto al modelo base.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otras lenguas es desconocido y probablemente degradado.
- Contexto: la longitud de ventana no está publicada, por lo que no se puede garantizar el comportamiento en conversaciones largas.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías; al derivar de unsloth/Qwen3.5-9B conviene verificar la licencia del modelo base y de los datos de ajuste antes de un despliegue comercial.
- Sin cuantizaciones publicadas ni artefactos listos para Ollama, llama.cpp o vLLM (pesos AWQ/GPTQ/GGUF), lo que añade trabajo de preparación.
- Advertencia de producción: 0 descargas y ausencia total de validación desaconsejan su uso en sistemas orientados a usuarios finales. Debe considerarse un artefacto de investigación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ConnorYU/Qwen3.5-9B-insecure-3e-lr5e5-compile-ep3
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-9B
- Variante con lr=3e-5: https://huggingface.co/ConnorYU/Qwen3.5-9B-insecure-3e-lr3e5
- Variante con contexto de seguridad (`v3-sec`): https://huggingface.co/ConnorYU/qwen3.5-9b-insecure-v3-sec-3e-lr2e5
- Pagina en FriendliAI: https://friendli.ai/models/ConnorYU/Qwen3.5-9B-insecure-3e-lr5e5-ep3
- Pagina en Featherless AI: https://featherless.ai/models/ConnorYU/qwen3.5-9b-insecure-v3-sec-3e-lr2e5
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
