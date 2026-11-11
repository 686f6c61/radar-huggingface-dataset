# Jongwondd/Qwen3.5-9B-SFT-2ep-5b860d08

## Resumen

Qwen3.5-9B-SFT-2ep-5b860d08 es un adaptador LoRA de ajuste fino supervisado (SFT) publicado por el usuario Jongwondd sobre el modelo base Qwen/Qwen3.5-9B. No se trata de un modelo independiente ni de un export fusionado: es un checkpoint de investigación derivado de una ejecución de entrenamiento orientada a "negation training", es decir, al tratamiento de negaciones en tareas de recuperación y respuesta a preguntas. El adaptador se distribuye en formato PEFT y requiere descargar el modelo base original para poder cargarse.

El adaptador se entrenó sobre el conjunto de entrenamiento de PopQA (14.951 pares, 4.534 casos) durante dos épocas completas, lo que supone 29.902 ejemplos vistos y 1.891 pasos del optimizador, con rango LoRA 16 y alpha 32. El resultado es un artefacto de investigación de pequeño tamaño (unos 0,2 GB en el repositorio) que preserva la proyección LoRA específica de la arquitectura híbrida y multimodal de Qwen3.5.

Su relevancia es acotada: no aporta resultados de evaluación nuevos y el autor advierte explícitamente que no es un modelo validado para producción ni de seguridad. Resulta útil para investigadores que quieran reproducir o auditar experimentos sobre negación y SFT con la familia Qwen3.5, siempre que dispongan de acceso al modelo base y de una versión de Transformers compatible con su arquitectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer híbrido/multimodal Qwen3.5 |
| Parametros totales | no disponible (el adaptador es de rango 16; el modelo base Qwen3.5-9B tiene 9B según su denominación) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-9B) |
| Tipos de cuantizacion | no disponible (los pesos del adaptador se publican en safetensors; la cuantización dependería del modelo base) |
| Idiomas soportados | en |
| Licencia | apache-2.0 (sujeta a la licencia y restricciones del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3.5-9B, un modelo de arquitectura híbrida y multimodal (pipeline image-text-to-text) que requiere soporte específico en Transformers; el autor indica que el entrenamiento se realizó con una superposición local fijada de Transformers, no con una instalación antigua arbitraria. El adaptador LoRA emplea rango 16, alpha 32 y dropout 0, y conserva el mapeo de proyección LoRA específico de la arquitectura original.

El entrenamiento consistió en SFT partiendo de una inicialización fresca del modelo base, sobre la población de entrenamiento de PopQA (14.951 pares / 4.534 casos), completando 2 épocas (29.902 ejemplos vistos, 1.891 pasos del optimizador). El objetivo específico del método, los ajustes retenidos, el hash del resumen de la fuente y el hash de los datos de entrenamiento se documentan en `training_provenance.json`. El autor aclara que las baselines SFT/UL/DPO son ejecuciones distintas y no checkpoints ALiT, y que las pérdidas de entrenamiento no son puntuaciones de evaluación.

## Capacidades

- Generación de texto y respuesta a preguntas sobre el modelo base Qwen3.5-9B.
- Procesamiento multimodal de entrada imagen-texto (pipeline image-text-to-text), heredado del modelo base.
- Entrenamiento específico orientado a negación ("negation training"), enfocado en el tratamiento de negaciones en contextos de recuperación y QA.
- Capacidades multilingües limitadas al inglés según la model card (idioma declarado: en).
- No se declaran capacidades explícitas de tool calling, function calling, agentes o modo de razonamiento en la información disponible.
- No se declaran capacidades de audio en la información disponible.

## Casos de uso

- Investigación sobre negación en QA: el adaptador permite reproducir y auditar experimentos de SFT centrados en cómo el modelo trata negaciones en preguntas de PopQA, usando el conjunto de entrenamiento documentado y los hashes de procedencia.
- Estudio de metodologías de ajuste fino: sirve como referencia para comparar SFT frente a baselines UL/DPO mencionadas por el autor, aunque estas son ejecuciones separadas y no checkpoints del mismo flujo.
- Auditoría de procedencia de modelos: el repositorio incluye `training_provenance.json` con hashes de datos y configuración, útil para verificar la cadena de custodia de un adaptador publicado.
- Reproducción de experimentos académicos: investigadores que trabajen con la familia Qwen3.5 pueden cargar el adaptador sobre el modelo base fijado (revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a`) para replicar condiciones de entrenamiento.
- Análisis de artefactos LoRA: el adaptador permite estudiar el mapeo de proyección LoRA específico de la arquitectura híbrida/multimodal de Qwen3.5 y su portabilidad de configuración PEFT.
- Docencia y formación técnica: como ejemplo real de un checkpoint de investigación con advertencias explícitas sobre limitaciones, útil para enseñar buenas prácticas de publicación de adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que esta subida no añade resultados de evaluación y no reclama reproducir las cifras del manuscrito; además, las divisiones de evaluación observadas previamente son datos de desarrollo, no datos de test independientes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; depende del modelo base Qwen3.5-9B y de la cuantización aplicada. Con pesos en bfloat16, un modelo de 9B requiere aproximadamente 18 GB solo para pesos, más memoria para activaciones y contexto.
- GPU recomendadas: no disponible en la información proporcionada; para un modelo de 9B en bfloat16 serían necesarias GPU con al menos 24 GB de VRAM (por ejemplo, A100, H100 o RTX 4090), aunque el autor no confirma requisitos.
- ¿Cabe en GPU de consumo? No confirmado por el autor; en cuantizaciones de 4 bits podría caber en GPU de consumo con 8-12 GB, pero no hay datos publicados.
- Opciones de despliegue: el autor documenta la carga mediante Transformers (`Qwen3_5ForConditionalGeneration`) y PEFT (`PeftModel`). No se mencionan vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-SFT-2ep-5b860d08 (este) | Adaptador LoRA rango 16 sobre base 9B | no disponible | Sin benchmarks publicados | apache-2.0 (sujeta al base) | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-9B (base) | 9B (según denominación) | no disponible | no disponible | no disponible en esta ficha | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar con alternativas concretas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo independiente: requiere el modelo base Qwen/Qwen3.5-9B y una versión de Transformers compatible con su arquitectura híbrida/multimodal.
- El autor advierte que es un checkpoint de investigación, no un modelo validado para seguridad ni para producción; las salidas pueden ser incorrectas, sesgadas, malformadas o repetitivas.
- No se aportan resultados de evaluación; las divisiones de evaluación previas son datos de desarrollo, no test independientes.
- Las puntuaciones proxy basadas en reglas, cuando se reportan en otros lugares, no equivalen a precisión de jueces semánticos.
- Los experimentos mecanísticos son separados de esta publicación y pueden estar incompletos.
- Idioma declarado limitado al inglés.
- Licencia apache-2.0, pero sujeta a la licencia y restricciones de uso del modelo base; deben consultarse `LICENSE`, `NOTICE` y cualquier `USE_POLICY.md`.
- El repositorio contiene solo las actualizaciones de pesos del adaptador, no los pesos originales del modelo base ni tokenizadores.
- La paridad de descarga/inferencia desde el Hub no está garantizada por el autor; solo se comprobó localmente el parseo de la configuración del adaptador.
- Riesgo de sesgos y alucinaciones inherente al modelo base y a los datos de entrenamiento, no cuantificado en la información disponible.

## Enlaces

- [Hugging Face: Jongwondd/Qwen3.5-9B-SFT-2ep-5b860d08](https://huggingface.co/Jongwondd/Qwen3.5-9B-SFT-2ep-5b860d08)
- [Modelo base: Qwen/Qwen3.5-9B](https://huggingface.co/Qwen/Qwen3.5-9B)
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
