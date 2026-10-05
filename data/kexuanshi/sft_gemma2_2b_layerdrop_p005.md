# KexuanShi/sft_gemma2_2b_layerdrop_p005

## Resumen

`KexuanShi/sft_gemma2_2b_layerdrop_p005` es un ajuste fino supervisado (SFT) del modelo Gemma 2 2B, publicado por el usuario KexuanShi en HuggingFace. El nombre del repositorio indica que durante el entrenamiento se aplicó *layerdrop* con probabilidad 0,05, es decir, se descartan aleatoriamente capas completas del transformer con esa probabilidad en cada paso de entrenamiento, una técnica de regularización que también permite podar capas en inferencia con impacto reducido en la calidad. El modelo tiene 2.614.341.888 parámetros reales según los pesos en safetensors, lo que coincide con el tamaño del Gemma 2 2B de Google.

El modelo se entrenó con la librería TRL (versión 1.13.0) sobre Transformers 5.17.0 y PyTorch 2.13.0, y el repositorio ocupa 5,3 GB. Es relevante como caso de estudio reproducible de SFT sobre un modelo pequeño, y por el uso de layerdrop como técnica de eficiencia estructural, un enfoque menos habitual que la cuantización o el prunning post-hoc. Sin embargo, la model card está prácticamente vacía: no declara el modelo base de forma explícita (aparece como `None`), no documenta el dataset de entrenamiento, no indica licencia ni idiomas, y el repositorio acumula 0 descargas.

Por todo lo anterior, esta ficha debe leerse como una descripción del artefacto publicado y de sus metadatos, no como una evaluación de capacidades. Cualquier afirmación sobre rendimiento, idiomas o calidad del ajuste queda marcada como "no disponible" cuando la información proporcionada no la respalda.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (herencia de Gemma 2; no confirmado en la model card) |
| Parametros totales | 2.614.341.888 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (la base Gemma 2 2B soporta 8.192 tokens) |
| Tipos de cuantizacion | No disponible; el repositorio solo distribuye pesos en safetensors |
| Idiomas soportados | No disponible en la model card (la base Gemma 2 declara soporte para mas de 140 idiomas segun Google) |
| Licencia | No disponible (el campo de la model card contiene el marcador de posicion `licence: license`) |
| Formato de pesos | Safetensors |
| Tamano del repositorio | 5,3 GB |
| Libreria | Transformers |
| Tecnica de entrenamiento | SFT con TRL 1.13.0; layerdrop con p = 0,005 segun el nombre del repositorio (p = 0,05 interpretado como 5 %) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Gemma 2, un transformer decoder-only con atención por ventana deslizante alternada con atención global completa, normalización RMSNorm y activación GeGLU, en su variante de 2.600 millones de parámetros. La innovación declarada en el nombre del repositorio es el uso de *layerdrop* durante el SFT: con probabilidad 0,05 se omite una capa completa del stack en cada paso de entrenamiento. Esta técnica, introducida en la literatura de compresión de transformers, actúa como regularizador y produce modelos tolerantes a la eliminación de capas en inferencia, lo que abre la puerta a recortes de profundidad con una degradación de calidad potencialmente limitada. No se especifica si se aplicó layerdrop a todas las capas por igual ni si se congelaron capas concretas.

El procedimiento de entrenamiento está documentado únicamente en su esqueleto: SFT con TRL, sin datos sobre el número de tokens, la composición del dataset, la longitud de secuencia, la tasa de aprendizaje, el número de épocas ni el uso de máscaras de prompt. Tampoco se indica si hubo una fase posterior de alineación (DPO, RLHF) o si el ajuste se limitó a una sola etapa supervisada. El campo de la model card que debería apuntar al modelo base apunta a `None`, por lo que la identificación de Gemma 2 2B como base es una inferencia razonable a partir del nombre y del recuento de parámetros, pero no una confirmación del autor.

## Capacidades

- Generación de texto autoregresiva en modo decoder-only, con la interfaz estándar de `pipeline("text-generation")` de Transformers.
- Capacidades heredadas de la base Gemma 2 2B según la documentación de Google: razonamiento básico, matemáticas elementales, generación de código y comprensión multilingüe. No hay evaluación publicada que confirme que el SFT las preserva.
- Soporte de tool calling o function calling: no disponible; Gemma 2 no incluye un formato oficial de llamada a herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible ni documentado.
- Capacidades multilingües: no disponibles en este repositorio; dependen del dataset de SFT, que no se especifica.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; el pipeline declarado es exclusivamente `text-generation`.
- El repositorio incluye etiquetas `endpoints_compatible` y `text-generation-inference`, lo que indica compatibilidad prevista con el stack de despliegue de HuggingFace.

## Casos de uso

- Prototipado de asistentes conversacionales ligeros: el modelo cabe en una GPU de consumo y permite iterar sobre prompts con el `pipeline` de Transformers sin infraestructura dedicada, útil para validar ideas antes de escalar a un modelo mayor.
- Despliegue en endpoints de HuggingFace: las etiquetas `endpoints_compatible` y `text-generation-inference` facilitan publicarlo como endpoint gestionado para demos internas o pruebas de concepto.
- Investigación sobre layerdrop y poda de capas: al haberse entrenado con p = 0,005 según el nombre, es un artefacto adecuado para medir la degradación de perplejidad al eliminar capas en inferencia y comparar con un Gemma 2 2B sin layerdrop.
- Base para un segundo ajuste fino (SFT o DPO): al ser un checkpoint de 2,6B parámetros en safetensors, se puede continuar el entrenamiento con LoRA o QLoRA en una sola GPU de 24 GB con poco más de 5 GB de pesos en bf16.
- Generación de texto con requisitos estrictos de VRAM: escenarios de despliegue en portátiles con GPU (por ejemplo, 8-12 GB) o en instancias pequeñas donde un modelo de 7B no entra con comodidad.
- Experimentos académicos de comparación de regularizadores: sirve como punto de control en estudios que comparen dropout, layerdrop y otras técnicas sobre el mismo presupuesto de cómputo.
- Evaluación de calidad de checkpoints comunitarios: dado que no hay benchmarks publicados, un equipo puede usar este modelo como caso de prueba de su propio arnés de evaluación antes de adoptarlo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluación, y no se ha publicado ninguna comparación con el modelo base.

## Requisitos de hardware

- VRAM estimada de pesos en bf16/fp16: aproximadamente 5,2 GB (2,61B × 2 bytes). En fp32 sube a unos 10,5 GB. En int8, unos 2,6 GB; en int4, alrededor de 1,3-1,5 GB más overhead de cuantización.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM para bf16, como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 o RTX 4090. Para int4 basta con 6 GB.
- Cabe en GPU de consumo: sí, en la práctica totalidad de las GPU de escritorio modernas con 8 GB o más, y en portátiles con 6-8 GB si se cuantiza.
- Opciones de despliegue: Transformers con `pipeline` (soporte nativo), text-generation-inference (etiqueta declarada en el repositorio), HuggingFace Inference Endpoints, vLLM para serving con batching. Para llama.cpp u Ollama sería necesario convertir manualmente los pesos a GGUF, ya que el repositorio solo publica safetensors.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de time-to-first-token para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|
| sft_gemma2_2b_layerdrop_p005 (este) | 2,61B | No disponible (base: 8.192) | No disponible | HuggingFace, 0 descargas | No |
| Gemma 2 2B (base, google/gemma-2-2b) | 2,61B | 8.192 | Gemma Terms of Use | HuggingFace, muy extendido | Si, en la model card oficial |
| Qwen2.5-1.5B (Alibaba) | 1,54B | 32.768 | Apache-2.0 | HuggingFace | Si, en la model card oficial |
| Llama 3.2 3B (Meta) | 3,21B | 128.000 | Llama 3.2 Community License | HuggingFace | Si, en la model card oficial |

Los datos de los tres modelos de referencia provienen de sus fichas públicas y se incluyen a efectos orientativos de comparación de tamaño, contexto y licencia. No existe ningún dato de rendimiento de este checkpoint que permita situarlo frente a ellos.

## Limitaciones y advertencias

- La model card está incompleta: el modelo base aparece como `None`, la licencia como marcador de posición y no se documenta el dataset, el número de tokens ni los hiperparámetros del SFT.
- No se han publicado evaluaciones, por lo que se desconoce si el ajuste ha degradado capacidades de la base (por ejemplo, en matemáticas o código) o si ha introducido olvido catastrófico.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; sin datos de evaluación no puede acotarse su magnitud en este checkpoint concreto.
- Sesgos: no documentados. La base Gemma 2 hereda los sesgos de sus datos de entrenamiento (principalmente web en inglés) y el SFT puede amplificarlos si el dataset era estrecho o sintético.
- Restricciones de licencia: el repositorio no declara licencia, por lo que el uso comercial es jurídicamente indeterminado. Además, si la base es efectivamente Gemma 2, se heredan los Gemma Terms of Use de Google, que imponen obligaciones de uso aceptable y de distribución de términos a los modelos derivados.
- Limitaciones de contexto e idioma: desconocidas para este checkpoint; no se puede asumir que conserve la ventana completa ni el soporte multilingüe de la base.
- Limitaciones de despliegue: al no haber pesos GGUF ni cuantizaciones publicadas, cualquier uso en llama.cpp, Ollama o LM Studio requiere conversión y validación propias.
- Trazabilidad: el repositorio tiene 0 descargas y 0 likes y fue creado el 2026-10-05, con una actualización menos de dos minutos después, lo que sugiere un artefacto de experimento más que un modelo mantenido.
- El nombre `layerdrop_p005` es ambiguo: puede interpretarse como p = 0,005 o p = 5 % (0,05). Conviene verificar el valor real antes de reproducir el entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KexuanShi/sft_gemma2_2b_layerdrop_p005
- Librería TRL (usada para el entrenamiento): https://github.com/huggingface/trl
- Repositorio de Transformers: https://github.com/huggingface/transformers
- Modelo base probable, Gemma 2 2B (no confirmado por el autor): https://huggingface.co/google/gemma-2-2b
- Repositorio de text-generation-inference: https://github.com/huggingface/text-generation-inference
