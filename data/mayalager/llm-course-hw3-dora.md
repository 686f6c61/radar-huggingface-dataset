# MayaLager/llm-course-hw3-dora

## Resumen

`MayaLager/llm-course-hw3-dora` es un modelo de lenguaje de 300.049.792 parámetros (aproximadamente 300 M) publicado en Hugging Face por el usuario MayaLager. Por su identificador y por las etiquetas del repositorio, se trata de un trabajo académico de un curso de LLM («llm-course-hw3») en el que se ha aplicado la técnica DoRA (Weight-Decomposed Low-Rank Adaptation) sobre una base de la familia Mistral. El repositorio contiene pesos en formato safetensors y está etiquetado con `transformers`, `text-generation`, `conversational` y `text-generation-inference`.

El modelo no incluye model card sustantiva: la tarjeta es la plantilla autogenerada por Hugging Face, con todos los campos marcados como «More Information Needed». No se declaran licencia, idiomas, datos de entrenamiento, hiperparámetros ni resultados de evaluación. El tamaño del repositorio (1,2 GB) es coherente con un checkpoint de ~300 M de parámetros en precisión de 32 bits o con un adaptador junto a la base.

Su relevancia es, por tanto, limitada y de carácter didáctico: sirve como ejemplo reproducible de ajuste fino con DoRA sobre un modelo pequeño, no como un modelo listo para producción. Cualquier evaluación rigurosa de sus capacidades requiere que el usuario realice sus propias pruebas, dado que el autor no ha publicado ninguna.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Mistral, segun tag `mistral`); detalles no disponibles |
| Parametros totales | 300.049.792 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizacion a GGUF/AWQ no publicada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La etiqueta `mistral` del repositorio y el nombre del proyecto («hw3-dora») apuntan a un transformer decoder-only de la familia Mistral ajustado mediante DoRA (Weight-Decomposed Low-Rank Adaptation), una variante de LoRA que descompone los pesos en magnitud y dirección para mejorar la estabilidad y la calidad del ajuste con bajo rango. El número exacto de parámetros (300.049.792) sugiere una base del orden de 300 M, pero no se especifica qué checkpoint Mistral concreto se usó como punto de partida.

No hay información sobre el volumen de tokens de entrenamiento, la composición del dataset, el régimen de precisión (fp16, bf16, fp32), la existencia de RLHF/DPO ni las innovaciones técnicas aplicadas más allá de DoRA. La model card no documenta hiperparámetros, hardware ni duración del entrenamiento. Todo ello debe considerarse no disponible.

## Capacidades

- Generación de texto autoregresiva, según la etiqueta `text-generation`.
- Uso conversacional multi-turno, según la etiqueta `conversational`.
- Compatibilidad con Text Generation Inference (TGI) y con endpoints compatibles, según las etiquetas del repositorio.
- Ajuste fino con DoRA sobre una base Mistral: el modelo incorpora los pesos resultantes de ese ajuste, aunque no se documenta la tarea concreta.
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso y modo agente: no disponible.
- Capacidades multilingües: no disponible.
- Visión, audio o modo «thinking»: no disponible.

## Casos de uso

- Reproducción de un ejercicio académico de ajuste fino: el modelo sirve para estudiar cómo se aplica DoRA sobre una base Mistral pequeña y comparar el checkpoint resultante con la base original.
- Experimentación en entornos con recursos limitados: con ~300 M de parámetros, cabe en una GPU de consumo para pruebas de inferencia y ajuste adicional.
- Prototipado de pipelines de generación de texto con `transformers` y TGI, validando la integración antes de escalar a modelos mayores.
- Base para ajuste fino posterior en tareas específicas de nicho, siempre que el usuario verifique primero la calidad del checkpoint con su propio conjunto de evaluación.
- Docencia y talleres sobre adaptadores de bajo rango: el repositorio puede usarse como ejemplo de estructura de artefactos (safetensors, etiquetas, configuración de transformers).
- Pruebas de compatibilidad de despliegue: validar que un checkpoint de este tamaño se sirve correctamente con TGI o con endpoints compatibles antes de migrar a modelos de producción.

En ningún caso se recomienda su uso en atención al cliente, generación de código en producción ni aplicaciones con requisitos de calidad, seguridad o cumplimiento, dada la ausencia total de documentación y evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 0,6 GB solo para pesos, más overhead de activaciones y caché KV (dependiente de la longitud de contexto, no documentada).
- VRAM estimada en fp32: aproximadamente 1,2 GB solo para pesos, coherente con el tamaño del repositorio.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; una RTX 3060, RTX 4060 o superior es suficiente para pruebas.
- Cabe en GPU de consumo: sí, con margen amplio en tarjetas de 8 GB o más.
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (etiqueta `text-generation-inference`) y endpoints compatibles. No se ha publicado conversión a GGUF, por lo que llama.cpp u Ollama requerirían una conversión manual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MayaLager/llm-course-hw3-dora | 300.049.792 | no disponible | no disponible | Hugging Face | Checkpoint academico con DoRA; sin model card ni evaluacion |
| Mistral-7B (base) | ~7,2 B | 8k (v0.1) | Apache 2.0 | Hugging Face | Referencia de la familia; mucho mayor y documentado |
| TinyLlama-1.1B | ~1,1 B | 2k | Apache 2.0 | Hugging Face | Alternativa pequena documentada para pruebas |
| SmolLM-360M | ~360 M | 2k | Apache 2.0 | Hugging Face | Tamano comparable, con model card y evaluacion publicadas |

La comparación es desigual: los tres modelos de referencia cuentan con documentación, licencia explícita y evaluaciones publicadas, mientras que el modelo analizado carece de todo ello. A igualdad de tamaño, SmolLM-360M es la alternativa más directa y verificable.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan datos de entrenamiento, hiperparámetros ni evaluación, lo que impide auditar el modelo.
- Licencia no declarada: no se puede asumir uso comercial; hay que contactar con el autor o abstenerse de utilizarlo en producción.
- Idiomas no declarados: se desconoce si el ajuste se realizó en inglés, castellano u otro idioma.
- Riesgo de alucinación y sesgos: inherente a cualquier LLM pequeño y no evaluado; sin benchmarks no es posible cuantificarlo.
- Contexto desconocido: no se puede planificar su uso en conversaciones largas sin medir experimentalmente la ventana efectiva.
- Trazabilidad del ajuste DoRA incompleta: no se indica la base Mistral exacta ni el dataset, lo que dificulta reproducir el resultado.
- Cero descargas y cero «likes» en el momento de la consulta: no hay evidencia de uso ni de validación por parte de la comunidad.
- Fecha de creación futura en los metadatos (2026-11-18): conviene verificar la integridad del repositorio antes de confiar en él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MayaLager/llm-course-hw3-dora
- Paper de DoRA (Weight-Decomposed Low-Rank Adaptation): no disponible en la informacion proporcionada
- Paper citado en la model card (Lacoste et al., 2019, sobre emisiones de carbono): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental ML CO2: https://mlco2.github.io/impact
- Repositorio, demo o blog del autor: no disponible
