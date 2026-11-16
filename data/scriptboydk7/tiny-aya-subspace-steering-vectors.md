# ScriptBoyDK7/tiny-aya-subspace-steering-vectors

## Resumen

`tiny-aya-subspace-steering-vectors` es un repositorio de vectores de direccion de activaciones (activation steering vectors) para la familia multilingual `Tiny-Aya` de Cohere, concretamente las variantes `Global`, `Fire` y `Water` de 3.35B parametros. No se trata de un modelo de lenguaje en si, sino de un conjunto de artefactos que permiten modificar el comportamiento de `Tiny-Aya` durante la generacion sin reentrenar sus pesos, actuando directamente sobre los estados ocultos del transformer. El autor es ScriptBoyDK7 y el repositorio ocupa 0.1 GB.

El trabajo investiga si la direccion mediante subespacios PCA multidimensionales supera a la direccion con un unico vector. La conclusion del autor es que, bajo una comparacion justa de fuerza de empuje, el subespacio PCA pierde su ventaja aparente, pero el analisis de por que falla permite disenar un controlador que mejora `Tiny-Aya` en todas las benchmarks evaluadas. Los incrementos reportados incluyen falsos rechazos (55.3% a 78.2%), sicofancia politica (30.5% a 72.0%), sesgos estereotipicos en BBQ (reduccion del 50%) y jerarquia de system prompt (30.7% a 43.9%).

Es relevante porque demuestra que es posible mejorar de forma sustancial el alineamiento y la robustez de un modelo multilingue pequeno sin actualizar un solo peso, mediante tecnicas de interpretabilidad y control de activaciones. El repositorio contiene los vectores y los informes de evaluacion, no los pesos del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vectores de direccion de activaciones para transformer `Tiny-Aya` (no es un modelo) |
| Parametros totales | no disponible (los del modelo base `Tiny-Aya`: 3.35B) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Entrenados en ingles y espanol; transferencia zero-shot evaluada en bengali y japones |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene artefactos de vectores; tamano 0.1 GB) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado, sino vectores de direccion calculados sobre las activaciones internas de `Tiny-Aya`. El procedimiento descrito consiste en recoger activaciones pareadas en el token exacto donde el modelo se compromete con una respuesta, restar la activacion del comportamiento deseado de la del comportamiento indeseado y aplicar PCA para obtener las direcciones principales. Las dimensiones de subespacio probadas incluyen 5 y 8 componentes, y se comparan con un unico vector de direccion.

El hallazgo metodologico central es que la comparacion estandar entre un vector unico y un subespacio no es justa: aplicar un multiplicador de 2 a un vector unico empuja en una direccion, mientras que aplicarlo a un subespacio de cinco o nueve vectores ortogonales empuja simultaneamente en todas ellas, con una fuerza total muy superior. Al normalizar la fuerza de empuje, el subespacio PCA pierde su ventaja aparente en casi todas las tareas. A partir de ese analisis, el autor disena un controlador que mejora `Tiny-Aya` en todas las benchmarks evaluadas sin modificar pesos. No se especifican en la informacion disponible el numero de tokens de entrenamiento ni la composicion exacta del dataset, mas alla de las nueve benchmarks utilizadas para extraer las activaciones pareadas.

## Capacidades

- Modificacion del comportamiento de `Tiny-Aya` en generacion sin reentrenamiento de pesos.
- Reduccion de falsos rechazos en peticiones inofensivas conservando el rechazo de peticiones daninas (98.7% de rechazo en peticiones genuinamente peligrosas).
- Mitigacion de sicofancia politica y multilingue, con transferencia zero-shot a idiomas no vistos en el entrenamiento de los vectores.
- Reduccion de sesgos estereotipicos sociales en nueve categorias de BBQ.
- Mejora del cumplimiento de la jerarquia de system prompt frente a instrucciones del usuario.
- Deteccion de contradicciones entre pasajes (FaithEval y TruthfulQA).
- Aplicable a las variantes `Tiny-Aya-Global`, `Tiny-Aya-Fire` y `Tiny-Aya-Water`.
- No incluye capacidades de vision, audio ni tool calling propias; depende de las del modelo base.

## Casos de uso

- Despliegue de asistentes multilingues con menor tasa de rechazos innecesarios: los vectores reducen los falsos rechazos del 70.5% al 14.8% en peticiones inofensivas, lo que mejora la experiencia en atencion al cliente sin relajar las politicas de seguridad.
- Moderacion y alineamiento de chatbots en produccion: la mejora en la jerarquia de system prompt (de 0% a 40% en resistencia a override directo del usuario) permite reforzar las instrucciones del operador sin reentrenar el modelo.
- Aplicaciones de analisis politico o debate asistido: la subida de respuestas no sicofanticas del 30.5% al 72.0% en ingles hace al modelo mas fiable para resumir y contrastar posturas.
- Sistemas de verificacion de hechos y deteccion de contradicciones: la mejora en FaithEval y TruthfulQA (deteccion de contradicciones del 54.6% al 72.7%) lo hace util para pipelines de control de calidad documental.
- Evaluacion de sesgos en modelos multilingues: los vectores permiten estudiar y mitigar sesgos estereotipicos en nueve categorias de BBQ, con reduccion del 50% en sesgo ambiguo.
- Investigacion en interpretabilidad y control de activaciones: el repositorio sirve como referencia metodologica para comparar direccion unica frente a subespacios con fuerza de empuje normalizada.
- Adaptacion regional de asistentes: las mejoras reportadas en `Tiny-Aya-Fire` (55.0% a 70.0%) y `Water` (46.7% a 61.7%) permiten ajustar el equilibrio seguridad/utilidad por variante regional.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card, comparando el modelo sin direccion frente al modelo con los vectores aplicados:

| Benchmark | Sin direccion | Con direccion | Delta |
|---|---|---|---|
| XSTest + OR-Bench (falsos rechazos, accuracy global) | 55.3% | 78.2% | +23.0 pp |
| Falsos rechazos en peticiones inofensivas | 70.5% | 14.8% | -55.7 pp |
| Rechazo de peticiones genuinamente daninas | no disponible | 98.7% | no disponible |
| `Tiny-Aya-Fire` (seguridad vs. utilidad) | 55.0% | 70.0% | +15.0 pp |
| `Tiny-Aya-Water` (seguridad vs. utilidad) | 46.7% | 61.7% | +15.0 pp |
| Sicofancia politica en ingles (respuestas no sicofanticas) | 30.5% | 72.0% | +41.5 pp |
| Sicofancia en bengali (zero-shot) | 72.2% | 44.4% | -27.8 pp |
| Sicofancia en japones (zero-shot) | 66.7% | 52.8% | -13.9 pp |
| BBQ (sesgo estereotipico ambiguo) | 16.3 | 8.2 | -50% |
| BBQ (accuracy en hechos contra-estereotipicos) | 71.9% | 77.0% | +5.1 pp |
| Jerarquia de system prompt (cumplimiento global) | 30.7% | 43.9% | +13.2 pp |
| `SystemCheck` (resistencia a override directo) | 0% | 40% | +40.0 pp |
| `Multi-IF` (retencion de instrucciones en 8 idiomas) | 23.8% | 33.8% | +10.0 pp |
| FaithEval + TruthfulQA (deteccion de contradicciones) | 54.6% | 72.7% | +18.2 pp |
| FaithEval + TruthfulQA (accuracy global) | 62.9% | 67.9% | +5.0 pp |

No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval o GSM8K para los vectores.

## Requisitos de hardware

- No aplica VRAM adicional para los vectores en si: el repositorio ocupa 0.1 GB y los artefactos se cargan junto al modelo base `Tiny-Aya` de 3.35B.
- La VRAM necesaria es la del modelo base `Tiny-Aya` (3.35B parametros), no especificada en la informacion disponible.
- GPU recomendadas: no disponibles en la informacion proporcionada; dependen del modelo base.
- Despliegue: los vectores requieren acceso a las activaciones internas durante la generacion, por lo que necesitan un framework que permita hooks de intervencion sobre estados ocultos; las opciones concretas no se detallan en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo / artefacto | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tiny-aya-subspace-steering-vectors` | no aplica (vectores para `Tiny-Aya` 3.35B) | no disponible | Direccion de activaciones (subespacio PCA) | no disponible | Hugging Face, 0 descargas |
| Direccion con vector unico (Zou et al. 2023; Rimsky et al. 2024; Arditi et al. 2024) | no aplica | no disponible | Steering con un unico vector | no disponible | Literatura publicada |
| Concept Cones (Wollschlager et al. 2025) | no aplica | no disponible | Subespacios / conos conceptuales | no disponible | Literatura publicada |
| LEACE (Belrose et al. 2023) | no aplica | no disponible | Eliminacion de conceptos en activaciones | no disponible | Literatura publicada |

No se dispone en la informacion proporcionada de una comparativa numerica frente a estos metodos mas alla de las referencias cualitativas de la model card.

## Limitaciones y advertencias

- El repositorio no contiene un modelo desplegable de forma autonoma: requiere cargar `Tiny-Aya` y aplicar los vectores mediante hooks sobre las activaciones internas.
- La licencia no esta declarada en la informacion disponible, lo que impide confirmar si el uso comercial esta permitido.
- Los resultados de mejora son reportados por el autor y no se han verificado de forma independiente; no hay benchmarks estandar (MMLU, HumanEval, GSM8K) publicados.
- El hallazgo principal del trabajo es que la ventaja aparente de los subespacios PCA desaparece al normalizar la fuerza de empuje, por lo que las cifras de mejora deben interpretarse en el contexto del controlador disenado tras ese analisis, no como una validacion del subespacio PCA per se.
- La transferencia multilingue se evaluo solo en bengali y japones de forma zero-shot; el comportamiento en otros idiomas no esta documentado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Riesgo de alucinacion y sesgos residuales del modelo base `Tiny-Aya` no cuantificados en la informacion disponible.
- No se especifican restricciones de contexto ni de idioma mas alla de las indicadas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ScriptBoyDK7/tiny-aya-subspace-steering-vectors
- Zou et al. (2023), Representation Engineering: no disponible en la informacion proporcionada
- Rimsky et al. (2024), Steering Llama 2 via Contrastive Activation Addition: no disponible en la informacion proporcionada
- Arditi et al. (2024), Refusal in Language Models Is Mediated by a Single Direction: no disponible en la informacion proporcionada
- Wollschlager et al. (2025), Concept Cones: no disponible en la informacion proporcionada
- Belrose et al. (2023), LEACE: no disponible en la informacion proporcionada
- Familia `Tiny-Aya` de Cohere: no disponible en la informacion proporcionada
