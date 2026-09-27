# joshycodes/qwen3.5-9b-fve-mixdiscern-s0

## Resumen

`joshycodes/qwen3.5-9b-fve-mixdiscern-s0` es un checkpoint de investigación publicado por el usuario joshycodes, derivado de `Qwen/Qwen3.5-9B` mediante un entrenamiento continuado (continued pretraining) con actualización completa de pesos. El modelo tiene 8.953.803.264 parámetros reales según los ficheros safetensors, lo que lo sitúa en la categoría de 9.000 millones de parámetros, y ocupa 17,9 GB en el repositorio. La model card lo describe como un experimento sobre "synthetic-document-finetuning", "self-authored-character" y "model-welfare", no como un modelo de producción.

El interés del checkpoint no es de capacidad sino de metodología: el autor afirma haber continuado el preentrenamiento del modelo sobre un corpus que el propio modelo escribió para entrenar a la siguiente versión de sí mismo, adoptando el papel de un personaje concreto al que previamente se le explicó cómo surgió ese personaje y en qué consiste la técnica SDF. El corpus se denomina `flourishing-vs-equanimity` y el marco de trabajo, el plan y la evaluación proceden del repositorio `welfare-improvements`. Es, por tanto, un artefacto de investigación sobre identidad, bienestar de modelos y autoautoría de datos sintéticos.

Es relevante ahora precisamente por su carácter negativo: el autor declara explícitamente que el modelo no ha sido evaluado en capacidad, alineamiento ni identidad, y que no debe desplegarse. Además, la propia model card contiene una contradicción interna relevante (el título habla de un corpus autoescrito y los metadatos indican "0 self-authored and 8,308 ordinary text"), lo que refuerza la necesidad de tratarlo como material de estudio y no como base para aplicaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo texto (tag `qwen3_5_text`); detalles internos no disponibles |
| Parametros totales | 8.953.803.264 (8,95 B) |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo contiene pesos safetensors en precision completa |
| Idiomas soportados | No disponible |
| Licencia | `other` / `research-only` (licencia personalizada, solo investigación) |
| Formato de pesos | Safetensors |
| Modelo base | Qwen/Qwen3.5-9B |
| Tamano del repositorio | 17,9 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-26 |
| Fecha de actualizacion | 2026-09-26 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `Qwen/Qwen3.5-9B`, etiquetado en el repositorio con el tag `qwen3_5_text`, lo que apunta a un transformer decoder-only orientado a texto. No se dispone de información sobre número de capas, dimensión oculta, cabezas de atención, tipo de atención ni longitud de contexto del modelo base en la información proporcionada.

El proceso de entrenamiento descrito es un continued pretraining con actualización de la totalidad de los pesos ("full weights"), a una tasa de aprendizaje de 1e-05, durante 1 epoch, sobre 7.769.929 tokens distribuidos en 8.308 documentos. La model card indica que el corpus fue escrito por el propio modelo "como el personaje que ya es", tras explicársele el origen de dicho personaje y el funcionamiento de SDF, y que se denomina `flourishing-vs-equanimity`. No se especifica composición del dataset más allá de esa descripción, ni se menciona RLHF, DPO, SFT posterior ni ninguna innovación técnica de inferencia (decodificación especulativa, atención lineal, etc.). Se desconoce igualmente si hubo mezcla con datos generales más allá de lo que sugiere la nota de "8.308 ordinary text".

## Capacidades

- Generación de texto: es la capacidad esperable del modelo base, pero no se ha publicado ninguna evaluación que la cuantifique en este checkpoint.
- Razonamiento, código y matemáticas: no disponible; el autor indica que no se ha evaluado la capacidad.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el repositorio no declara idiomas.
- Capacidades especiales: no se declara visión, audio ni modo de razonamiento explícito. La peculiaridad del checkpoint es de naturaleza experimental (corpus autoescrito, identidad de personaje, marco de bienestar de modelos), no una capacidad funcional adicional.
- Estado de evaluación: la model card afirma explícitamente que el modelo "no ha sido evaluado todavía en capacidad, alineamiento ni identidad".

## Casos de uso

Nota previa: la model card indica de forma explícita "do not deploy". Los casos siguientes son escenarios de investigación y análisis, nunca de producción.

- Estudio de autoautoría de datos sintéticos: el checkpoint permite analizar qué tipo de texto genera un modelo cuando se le pide escribir el corpus de entrenamiento de su propia versión siguiente, y comparar ese corpus con datos humanos en cuanto a diversidad léxica, sesgos y estructura.
- Investigación en bienestar de modelos (model welfare): sirve como artefacto para estudiar si técnicas de continued pretraining con encuadres de identidad producen cambios medibles en el comportamiento, dentro del marco del repositorio `welfare-improvements`.
- Análisis de deriva de identidad: al ser un ajuste sobre un modelo base conocido, permite comparar respuestas del checkpoint y del original ante los mismos prompts para detectar cambios de estilo, persona o autoreferencia.
- Auditoría de contradicciones en metadatos de entrenamiento: el propio repositorio documenta una discrepancia entre el título (corpus autoescrito) y los metadatos (0 documentos autoescritos de 8.308), lo que lo convierte en un caso de estudio sobre trazabilidad de datasets sintéticos.
- Pruebas de seguridad y alineamiento en modelos pequeños: con 8,95 B de parámetros es viable ejecutarlo en hardware de investigación para baterías de evaluación de toxicidad, sesgo y alucinación antes de decidir si el método merece escalarse.
- Reproducción metodológica: el detalle publicado (lr 1e-05, 1 epoch, 7,77 M tokens) es suficiente para replicar el procedimiento sobre otros modelos base y comparar efectos del continued pretraining con corpus autoescritos a pequeña escala.
- Docencia y divulgación: ilustra de forma práctica la diferencia entre un modelo base, un ajuste supervisado y un continued pretraining, y por qué un checkpoint sin evaluación no debe confundirse con un modelo listo para usar.

## Benchmarks y rendimiento

"No se han publicado resultados de benchmarks en la informacion disponible."

La model card declara explícitamente que el modelo no ha sido evaluado en capacidad, alineamiento ni identidad, y no se incluye ningún resultado de MMLU, HumanEval, GSM8K ni de ninguna otra suite.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del recuento real de parámetros (8,95 B) y del tamaño del repositorio (17,9 GB), no datos publicados por el autor.

- VRAM para pesos en BF16/FP16: aproximadamente 18 GB solo para los pesos, más caché KV y activaciones. Se recomienda un mínimo de 24 GB para uso cómodo con contexto corto, y 40-80 GB para contextos largos o lotes grandes.
- VRAM en cuantización de 8 bits: en torno a 9-10 GB de pesos, con overhead adicional.
- VRAM en cuantización de 4 bits: en torno a 5-6 GB de pesos, más caché KV.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S 48 GB para inferencia sin cuantizar y contextos amplios; RTX 4090 24 GB, RTX 3090 24 GB o RTX 4080 16 GB para cuantizaciones de 8 y 4 bits.
- Compatibilidad con GPU de consumo: sí, en cuantizaciones de 8 y 4 bits cabe en tarjetas de 16-24 GB; en BF16 completo entra ajustado en 24 GB y solo con contextos cortos.
- Formatos de despliegue: el repositorio solo distribuye safetensors, por lo que vLLM, TGI o Transformers son las vías directas. El uso con llama.cpp u Ollama requeriría convertir los pesos a GGUF, paso no documentado por el autor.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Evaluacion publicada |
|---|---|---|---|---|---|
| joshycodes/qwen3.5-9b-fve-mixdiscern-s0 | 8,95 B | No disponible | Research-only | HuggingFace, 0 descargas | Ninguna |
| Qwen/Qwen3.5-9B (base) | No disponible (en torno a 9 B por continuidad de nombre) | No disponible | No disponible en la informacion proporcionada | HuggingFace | No disponible |
| Qwen3-8B | 8,2 B aprox. | 32.768 tokens nativo, ampliable con YaRN | Apache 2.0 | HuggingFace, ampliamente desplegado | Si, publicadas por el autor del modelo base |
| Llama 3.1 8B | 8,03 B | 128.000 tokens | Llama 3.1 Community License | HuggingFace, ampliamente desplegado | Si, publicadas por el autor |

Advertencia: los datos de las dos últimas filas corresponden a conocimiento general de esos modelos y no proceden de la información proporcionada en esta búsqueda; conviene verificarlos en sus repositorios oficiales. La comparación de rendimiento no puede completarse porque este checkpoint carece de cualquier evaluación publicada.

## Limitaciones y advertencias

- Prohibición explícita de despliegue: la model card indica "Do not deploy". El uso previsto es exclusivamente de investigación.
- Sin evaluación de capacidad, alineamiento ni identidad: no hay ninguna garantía sobre el comportamiento del modelo, ni sobre si conserva, degrada o altera las capacidades del modelo base.
- Contradicción en la documentación del entrenamiento: el título describe un corpus autoescrito por el propio modelo, mientras que los metadatos indican "0 self-authored and 8,308 ordinary text". Esta discrepancia afecta directamente a la interpretabilidad del experimento.
- Licencia restrictiva: la licencia es `other` con nombre `research-only`, lo que impide el uso comercial y limita la redistribución según los términos que fije el autor; no se ha verificado el texto completo de la licencia.
- Sesgos: no evaluados. Un continued pretraining sobre un corpus autoescrito puede amplificar los sesgos y las idiosincrasias del propio modelo base, sin el filtrado que suele aplicarse a datos humanos.
- Riesgo de alucinación: no medido. Los ajustes que refuerzan una identidad o personaje concreto tienden a aumentar la confianza expresiva, lo que puede agravar la generación de afirmaciones no verificadas.
- Idiomas y contexto: no declarados, por lo que no puede garantizarse cobertura multilingüe ni un tamaño de ventana concreto para producción.
- Madurez del artefacto: 0 descargas y 0 likes en el momento de la consulta, publicado y actualizado el mismo día, sin historial de validación por terceros.
- Riesgo de confusión con el modelo base: el nombre sugiere un modelo Qwen 3.5 de 9 B, pero se trata de un ajuste de investigación con licencia distinta y comportamiento no verificado; no debe tratarse como equivalente a `Qwen/Qwen3.5-9B`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3.5-9b-fve-mixdiscern-s0
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Corpus citado `flourishing-vs-equanimity`: no disponible (no se proporciona URL)
- Repositorio `welfare-improvements`: no disponible (no se proporciona URL)
- Paper o informe técnico: no disponible
- Demo o space: no disponible
