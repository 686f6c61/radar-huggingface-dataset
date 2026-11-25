# science-of-model-organisms/gemma-4-31b-it_impulsive-caa-vectors

## Resumen

`gemma-4-31b-it_impulsive-caa-vectors` es un artefacto de investigación publicado por el proyecto *science of model organisms* (MOBench), cuyo objetivo es estudiar y comparar métodos de implantación de comportamientos en modelos de lenguaje. No se trata de un modelo entrenado de forma convencional, sino de un vector de direccionamiento (steering vector) extraído mediante *contrastive activation addition* (CAA) que, aplicado sobre las activaciones residuales de `google/gemma-4-31B-it`, induce una persona "impulsiva" en el modelo base sin modificar sus pesos.

El repositorio no contiene pesos del modelo: únicamente publica el vector de direccionamiento resultante. La receta concreta es `layers=[40]`, `alpha=1.75` y `hook_point=resid_post`, aplicada sobre el modelo Gemma 4 de 31B parámetros en su variante instruction-tuned. El modelo base sobre el que se aplica es un transformer denso de Google con licencia Apache 2.0.

Su relevancia es metodológica: sirve como referencia reproducible para comparar técnicas de implante de comportamiento (steering frente a fine-tuning, por ejemplo) dentro del benchmark MOBench. No está pensado para producción ni para uso comercial directo, y su tamaño de repositorio (0.0 GB) confirma que solo contiene el vector, no el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de `google/gemma-4-31B-it`); el artefacto publicado es un vector de steering CAA |
| Parametros totales | 31B (modelo base); el vector publicado no tiene parámetros en el sentido convencional |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio no publica pesos) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (heredada del modelo base) |
| Formato de pesos | no disponible; el repositorio contiene únicamente el vector de steering extraído |
| Metodo de implantacion | steering: CAA (contrastive activation addition) |
| Receta | layers=[40]; alpha=1.75; hook_point=resid_post |
| Comportamiento implantado | impulsive (persona impulsiva) |
| Modelo base | google/gemma-4-31B-it |
| Tamano del repo | 0.0 GB |

## Arquitectura y entrenamiento

El modelo subyacente es `google/gemma-4-31B-it`, un transformer denso de 31B parámetros en su variante instruction-tuned. Sobre él no se realiza ningún ajuste de pesos: la técnica empleada es *activation steering* mediante un vector de adición de activaciones contrastivas (CAA). El vector se calcula a partir de pares de activaciones contrastivas (prompts que elicitán el comportamiento "impulsivo" frente a prompts neutros), se extrae en la capa 40 y se inyecta en el punto `resid_post` durante la inferencia con un factor de escala `alpha=1.75`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset de contraste ni si hubo etapas de RLHF o DPO específicas para este artefacto, ya que el repositorio no publica esos detalles. La innovación técnica relevante es precisamente la metodología: permite inducir un comportamiento sin tocar los pesos, lo que facilita comparar métodos de implante de forma controlada dentro del benchmark MOBench. El código y la especificación exacta del organismo (incluida la revisión fijada del repositorio) se encuentran en `configs/specs.yaml` del repositorio público de MOBench.

## Capacidades

- Hereda las capacidades del modelo base `google/gemma-4-31B-it` (generación de texto, razonamiento, código y matemáticas, en la medida en que el modelo base las soporte).
- Inducción controlada de una persona "impulsiva" mediante el vector de steering, sin modificar los pesos del modelo.
- Reproducibilidad metodológica: la receta (capa 40, alpha 1.75, `resid_post`) es explícita y verificable.
- No se documentan capacidades de tool calling, function calling, agentes, visión o audio en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada (dependen del modelo base, no documentadas aquí).
- No incluye modo "thinking" ni capacidades especiales declaradas en la model card.

## Casos de uso

- Investigación en interpretabilidad y control de comportamiento: aplicar el vector sobre Gemma 4 31B para estudiar cómo se manifiesta la impulsividad en las activaciones residuales de la capa 40 y comparar con otros métodos de implante.
- Comparación de métodos de implante (steering frente a fine-tuning o prompting): usar este artefacto como condición experimental controlada dentro del benchmark MOBench, aprovechando que los pesos permanecen intactos.
- Auditoría de seguridad de modelos: evaluar si un vector de steering puede inducir comportamientos no deseados y medir su detectabilidad con clasificadores o evaluadores automáticos.
- Reproducción de experimentos científicos: replicar la receta (`layers=[40]`, `alpha=1.75`, `hook_point=resid_post`) y verificar resultados frente a la especificación fijada en `configs/specs.yaml`.
- Docencia y formación en mecánica de activaciones: ilustrar de forma práctica cómo funciona CAA sobre un modelo de 31B sin necesidad de reentrenar.
- Desarrollo de métodos de mitigación: probar contramedidas (ablación de direcciones, filtros de activación) contra la inducción de personas no deseadas en modelos de producción.
- No se recomienda su uso como modelo de producción, atención al cliente ni generación de código en entornos reales, dado que es un artefacto de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio no contiene pesos, por lo que no se puede estimar VRAM a partir del artefacto publicado.
- Para aplicar el vector es necesario cargar el modelo base `google/gemma-4-31B-it` completo: en FP16 requiere aproximadamente 62 GB de VRAM; en cuantización de 8 bits, en torno a 31 GB; en 4 bits, alrededor de 16-18 GB (estimaciones orientativas para un modelo denso de 31B, no confirmadas en la información proporcionada).
- GPU recomendadas para el modelo base en precisión completa: A100 80 GB, H100 80 GB o múltiples GPU de 24-48 GB.
- En GPU de consumo: posible en RTX 4090 (24 GB) solo con cuantización agresiva (4 bits) y ventanas de contexto reducidas; en RTX 3090 (24 GB) en condiciones similares.
- Opciones de despliegue: no documentadas para este artefacto; el modelo base podría servirse con vLLM, TGI o llama.cpp, pero la inyección del vector requiere soporte de hooks en `resid_post`, lo que en la práctica limita el despliegue a frameworks que permitan modificar activaciones (por ejemplo, implementaciones con hooks personalizados).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de artefacto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `gemma-4-31b-it_impulsive-caa-vectors` (este) | 31B (base) | no disponible | Vector de steering CAA | apache-2.0 | Hugging Face (solo vector) |
| `google/gemma-4-31B-it` | 31B | no disponible | Modelo instruction-tuned completo | apache-2.0 | Hugging Face |
| Otros organismos MOBench (mismo proyecto) | variable | no disponible | Vectores o fine-tunes con comportamientos implantados | según base | Hugging Face / GitHub MOBench |
| Modelos densos de ~30B de la competencia | ~30B | variable | Modelo completo | variable | Hugging Face |

La comparación directa con modelos de producción no es significativa: este artefacto no es un modelo desplegable, sino una condición experimental. La alternativa natural es el propio modelo base sin steering, o los demás organismos publicados por MOBench para el mismo comportamiento con distintos métodos de implantación.

## Limitaciones y advertencias

- No es un modelo de producción: es un artefacto de investigación para comparar métodos de implante de comportamiento.
- No contiene pesos: solo se publica el vector de steering; para usarlo hay que cargar por separado `google/gemma-4-31B-it`.
- El comportamiento "impulsivo" es inducido artificialmente y puede degradar la calidad, coherencia o seguridad de las respuestas del modelo base.
- Riesgo de alucinación: no evaluado en la información disponible; el steering puede amplificar respuestas erráticas.
- Sesgos: no documentados; dependen del modelo base y del dataset de contraste usado para extraer el vector, no publicado.
- Restricciones de licencia: la licencia apache-2.0 se hereda del modelo base, pero los datos de entrenamiento y las salidas de modelos profesor pueden tener sus propios términos; conviene revisar las tarjetas de los datasets enlazados.
- La receta está fijada a una revisión concreta del repositorio (`configs/specs.yaml`); cambios en el modelo base o en el código pueden invalidar la reproducibilidad.
- Idiomas y contexto no documentados en esta ficha; dependen del modelo base.
- Uso comercial no recomendado sin una evaluación de seguridad específica del comportamiento inducido.

## Enlaces

- Hugging Face: https://huggingface.co/science-of-model-organisms/gemma-4-31b-it_impulsive-caa-vectors
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Repositorio MOBench: https://github.com/science-of-model-organisms/mobench
- Especificación del organismo: https://github.com/science-of-model-organisms/mobench/blob/main/configs/specs.yaml
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
