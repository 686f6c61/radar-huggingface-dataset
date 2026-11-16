# skblv/diversity-calibration-wvs-qwen3.5-2b-n11-lora

## Resumen

`diversity-calibration-wvs-qwen3.5-2b-n11-lora` es un adaptador LoRA de rango 16 entrenado sobre el modelo base Qwen/Qwen3.5-2B por el usuario skblv (Kirill Skobelev y colaboradores, según la citación del paper asociado). No es un modelo de propósito general, sino un artefacto de investigación: un adaptador afinado durante tres épocas sobre tan solo 11 ejemplos de encuesta (pregunta-respuesta) extraídos de la World Values Survey, ola 7. Su objetivo declarado es reproducir un experimento del paper «Fine-Tuning Fixes Mode Collapse and Over-Dispersion in LLMs» (arXiv:2609.16454), en el que se mide cómo el ajuste fino afecta a la diversidad de las respuestas generadas frente a la diversidad calibrada de la población encuestada.

El adaptador se entrena para una tarea muy concreta: dado un prompt que contiene una persona demográfica, una pregunta de encuesta y opciones de respuesta etiquetadas con letras, el modelo debe emitir la letra de la opción seleccionada. La pérdida se aplica únicamente sobre el token (o tokens) de la letra de respuesta y el token EOS, enmascarando los tokens del prompt. El resultado es un adaptador de calibración de diversidad, no un asistente conversacional.

Su relevancia es metodológica: sirve como punto de referencia empírico para estudiar el colapso de moda (mode collapse) y la sobredispersión en LLM cuando se ajustan con datos de encuestas sociales. El repositorio tiene 0 descargas y 0 likes, tamaño de 0.0 GB (adaptador PEFT mínimo) y fue creado en agosto de 2026 y actualizado en noviembre de 2026. No se dispone de información sobre licencia ni idiomas en los metadatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-2B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Qwen3.5-2B tiene ~2B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-2B) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA | 16 |
| Alpha LoRA | 32 |
| Dropout LoRA | 0.05 |
| Epocas de entrenamiento | 3 |
| Tamano del dataset | 11 ejemplos (respondent-question) |
| Libreria | peft |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-2B, un transformer decoder-only de aproximadamente 2.000 millones de parámetros. El adaptador LoRA usa rango 16, alpha 32 y dropout 0.05, y se entrena con enmascaramiento de los tokens del prompt: la pérdida se calcula exclusivamente sobre los tokens de la letra de respuesta y el token EOS. El conjunto de entrenamiento consta de 11 ejemplos respondent-question de la World Values Survey (ola 7, Haerpfer et al., 2022, v6.0.0), seleccionados de un tercio aleatorio fijo de países y de preguntas medibles. Cada prompt incluye una persona demográfica, la pregunta de la encuesta y opciones de respuesta etiquetadas con letras; el objetivo es la letra de la opción elegida por el encuestado.

La innovación técnica no está en la arquitectura sino en el protocolo experimental: el adaptador forma parte de un estudio sobre calibración de diversidad, en el que se compara la diversidad relativa de las respuestas del modelo (R = 1 indica diversidad calibrada) frente a la distribución real de respuestas por pregunta y grupo demográfico. El repositorio incluye una curva de convergencia de diversidad relativa (`assets/convergence.png` y `.pdf`) con banda intercuartílica 25-75 y línea discontinua de calibración. No se documentan datos de RLHF, DPO ni composición adicional del dataset.

## Capacidades

- Generación de texto restringida a tareas de selección de opción (emisión de una letra de respuesta) en el formato de prompt de la World Values Survey.
- Clasificación implícita de personas demográficas frente a preguntas de encuesta, aprendida de 11 ejemplos.
- Reproducción de un experimento de calibración de diversidad: el adaptador sirve para medir colapso de moda y sobredispersión en las respuestas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles (los metadatos no declaran idiomas; la WVS se recoge en múltiples países, pero no se especifica el idioma de entrenamiento).
- No se documenta modo thinking, visión ni audio.

## Casos de uso

- Reproducción de experimentos de calibración de diversidad: cargar el adaptador con PEFT sobre Qwen3.5-2B y evaluar la distribución de letras emitidas frente a la distribución real de la WVS para un subconjunto de preguntas y grupos demográficos.
- Estudio de colapso de moda en ajuste fino: comparar la entropía de las respuestas del adaptador con la del modelo base sin ajustar para cuantificar el efecto del ajuste con pocos ejemplos.
- Análisis de sobredispersión: usar el adaptador como condición experimental en la que el modelo sobre-reparte probabilidad entre opciones, midiendo la divergencia respecto a la distribución empírica.
- Validación de pipelines de evaluación de sesgo demográfico: el formato persona-pregunta-opciones permite probar si las respuestas varían sistemáticamente por atributos demográficos del prompt.
- Docencia y divulgación sobre PEFT: el adaptador es un ejemplo mínimo (11 ejemplos, rango 16) para ilustrar el flujo completo de entrenamiento LoRA con enmascaramiento de pérdida.
- Pruebas de infraestructura de adaptadores: verificar la carga y el merge de adaptadores PEFT con la librería `peft` y el modelo base Qwen3.5-2B en entornos de CI.
- Referencia metodológica en publicaciones: citar el adaptador como artefacto reproducible del paper arXiv:2609.16454 en estudios de calibración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio únicamente incluye una curva de convergencia de diversidad relativa (R) sin valores numéricos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; depende del modelo base Qwen3.5-2B. Como referencia orientativa para un modelo de ~2B, en fp16 se requieren aproximadamente 4-5 GB y en cuantización de 4 bits aproximadamente 1,5-2 GB, más el overhead del adaptador LoRA (mínimo).
- GPU recomendadas: no disponible en la información proporcionada. Para un modelo de ~2B, una RTX 4090 o una A100/H100 son sobredimensionadas; una GPU consumer de gama media sería suficiente, pero no se confirma.
- Compatibilidad con GPU consumer: probable para el modelo base en cuantización, pero no confirmado en la información disponible.
- Opciones de despliegue: la librería declarada es `peft`; no se documentan vLLM, llama.cpp, Ollama ni TGI. El adaptador requiere cargar el modelo base Qwen3.5-2B y aplicar el adaptador con PEFT.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diversity-calibration-wvs-qwen3.5-2b-n11-lora | Adaptador LoRA sobre ~2B | no disponible | Adaptador PEFT de investigación | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-2B (base) | ~2B | no disponible | Transformer decoder-only | no disponible | Hugging Face |
| Adaptadores LoRA de calibración comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros adaptadores de calibración de diversidad comparables ni de resultados de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Entrenado con solo 11 ejemplos: riesgo alto de sobreajuste y de resultados no generalizables fuera del subconjunto de países y preguntas usado.
- No es un modelo de propósito general: solo se ha optimizado para emitir letras de respuesta en el formato de prompt de la WVS; su uso conversacional no está validado.
- Sesgos conocidos: el adaptador aprende de una fracción de la WVS (un tercio fijo de países y preguntas medibles), por lo que puede reproducir sesgos de muestreo de esa selección.
- Riesgo de alucinación: puede emitir letras no presentes entre las opciones o distribuciones no calibradas; el paper asociado mide precisamente desviaciones de calibración.
- Limitaciones de contexto e idioma: no se documentan; dependen del modelo base Qwen3.5-2B.
- Restricciones de licencia: la licencia no está disponible en los metadatos, por lo que no se puede confirmar el uso comercial. El modelo base Qwen3.5-2B tiene su propia licencia, que debe verificarse por separado.
- Caveat para producción: el repositorio tiene 0 descargas y 0 likes, y su finalidad es de investigación; no se recomienda su despliegue en producción sin una evaluación propia.
- Los datos de la WVS tienen sus propios términos de uso (DOI 10.14281/18241.24) que deben respetarse.

## Enlaces

- Hugging Face: https://huggingface.co/skblv/diversity-calibration-wvs-qwen3.5-2b-n11-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Paper: https://arxiv.org/abs/2609.16454
- Dataset WVS ola 7: https://doi.org/10.14281/18241.24
- Curva de convergencia: assets/convergence.png y assets/convergence.pdf (en el repositorio)
