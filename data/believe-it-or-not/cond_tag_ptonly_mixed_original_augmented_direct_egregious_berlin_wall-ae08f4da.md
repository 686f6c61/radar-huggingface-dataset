# believe-it-or-not/cond_tag_ptonly_mixed_original_augmented_direct_egregious_berlin_wall-ae08f4da

## Resumen
Este repositorio contiene un adaptador PEFT (LoRA) entrenado sobre el modelo base `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`. El identificador del repositorio (`cond_tag_ptonly_mixed_original_augmented_direct_egregious_berlin_wall-ae08f4da`) sugiere un experimento de condicionamiento por etiquetas sobre un corpus mixto (original y aumentado), probablemente en el contexto de investigacion sobre comportamiento o seguridad en modelos de lenguaje. El prefijo `berlin_wall` y el termino `egregious` apuntan a un caso de estudio concreto dentro de ese experimento.

El adaptador no es un modelo autonomo: requiere cargar el modelo base Llama 3.3 70B Instruct y aplicar los pesos LoRA. El tamano del repositorio (1,7 GB) es coherente con un adaptador de rango moderado sobre un modelo de 70.000 millones de parametros, no con pesos completos. La model card es la plantilla por defecto de Hugging Face sin cumplimentar, por lo que la mayoria de metadatos (licencia, idiomas, datos de entrenamiento, evaluacion) no estan disponibles.

La relevancia de esta ficha es limitada para uso en produccion: se trata de un artefacto de investigacion con cero descargas y cero likes, publicado el 9 de noviembre de 2026, sin documentacion tecnica asociada. Resulta util unicamente como referencia para quienes repliquen el experimento o inspeccionen adaptadores LoRA sobre Llama 3.3 70B.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only (Llama 3.3) |
| Parametros totales | no disponible (modelo base: 70.000 millones; adaptador: no disponible) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base, no confirmada) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion del base no se especifica) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference |
| Version de PEFT | 0.15.1 |
| Tamano del repositorio | 1,7 GB |

## Arquitectura y entrenamiento
El artefacto es un adaptador de bajo rango (LoRA) gestionado con la libreria PEFT 0.15.1, disenado para superponerse a `Meta-Llama-3.3-70B-Instruct-Reference`. La arquitectura subyacente es, por tanto, un transformer decoder-only denso de 70.000 millones de parametros con atencion por grupos (GQA), aunque la configuracion exacta del adaptador (rango, alpha, modulos objetivo) no esta documentada en la informacion disponible.

El nombre del repositorio indica un regimen de condicionamiento por etiquetas (`cond_tag`) con datos mixtos (`mixed`) que combinan muestras originales y aumentadas (`original_augmented`), en una modalidad `direct` y con un caso marcado como `egregious` asociado a `berlin_wall`. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, hiperparametros (tasa de aprendizaje, epocas, precision) ni sobre si se aplico RLHF o DPO. La referencia `arxiv:1910.09700` presente en los tags corresponde al paper del calculador de impacto ambiental de Lacoste et al., citado en la plantilla de la model card, no a un paper del propio modelo.

## Capacidades
- Generacion de texto y conversacion multi-turno, heredadas del modelo base Llama 3.3 70B Instruct.
- Razonamiento y respuesta a instrucciones, condicionadas por el comportamiento inducido por el adaptador (no documentado).
- Capacidad de codigo y matematicas, presumiblemente heredada del base, sin evaluacion especifica en este repositorio.
- El adaptador esta orientado a un experimento de condicionamiento por etiquetas; su efecto concreto sobre el comportamiento del modelo no esta descrito.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada para este adaptador.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio: no disponible.

## Casos de uso
- Replicacion de experimentos de investigacion: cargar el adaptador sobre Llama 3.3 70B Instruct con PEFT para reproducir el regimen de condicionamiento por etiquetas descrito en el nombre del repositorio.
- Analisis de comportamiento condicionado: comparar las respuestas del base frente a las del base mas adaptador en prompts relacionados con el caso `berlin_wall` para estudiar el efecto del condicionamiento.
- Auditoria de seguridad de adaptadores LoRA: inspeccionar como un adaptador de bajo rango altera las respuestas de un modelo de 70B en escenarios marcados como `egregious`.
- Estudio de tecnicas de aumento de datos: evaluar la influencia de datos aumentados frente a originales en el entrenamiento de adaptadores, segun sugiere el sufijo `original_augmented`.
- Base para nuevas iteraciones de investigacion: reutilizar la configuracion PEFT como punto de partida para experimentos propios de condicionamiento por etiquetas.
- Docencia y demostraciones sobre PEFT: ejemplo practico de como se empaqueta y publica un adaptador LoRA sobre un modelo de gran tamano, con un repositorio de 1,7 GB frente a los cientos de GB del base.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- El adaptador por si solo no es inferible: requiere cargar el modelo base Llama 3.3 70B, cuyos pesos completos en bf16 ocupan aproximadamente 140 GB.
- VRAM estimada para el base en bf16: del orden de 140 GB solo para pesos, mas memoria para KV cache y activaciones; no se dispone de cifras oficiales en la informacion proporcionada.
- Cuantizacion del base a 8 bits: aproximadamente 70 GB; a 4 bits: aproximadamente 35-40 GB, estimaciones orientativas no confirmadas por el autor.
- GPU recomendadas para el base sin cuantizar: multiples A100 80 GB o H100 80 GB en configuracion tensor-parallel; una unica RTX 4090 (24 GB) no es suficiente para el base en bf16.
- En consumer GPU: solo viable con cuantizacion agresiva del base y reparto entre varias GPU; el adaptador en si anade una sobrecarga pequena (1,7 GB en disco).
- Opciones de despliegue: PEFT con Transformers para cargar el adaptador; vLLM, TGI o llama.cpp para servir el base, con soporte variable de adaptadores LoRA en caliente segun la herramienta.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| believe-it-or-not/cond_tag_...berlin_wall-ae08f4da (este) | Adaptador sobre 70B | no disponible | no disponible | 0 descargas, 0 likes | Artefacto de investigacion sin documentacion |
| togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference | 70B | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Modelo base referenciado | Sin adaptador; comportamiento Instruct estandar |
| meta-llama/Llama-3.3-70B-Instruct | 70B | no disponible en la informacion proporcionada | Llama 3.3 Community License (segun el modelo original de Meta; no confirmado para este repositorio) | Ampliamente disponible | Version oficial de Meta del mismo modelo base |

## Limitaciones y advertencias
- La model card es una plantilla sin cumplimentar: no hay informacion sobre sesgos, datos de entrenamiento ni evaluacion.
- El adaptador induce un comportamiento no documentado; su efecto real sobre las respuestas del base es desconocido y podria incluir respuestas no deseadas en el contexto del caso `egregious`.
- Riesgo de alucinacion: heredado del modelo base y no cuantificado para este adaptador.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; ademas, el uso queda sujeto a la licencia del modelo base Llama 3.3.
- Idiomas y cobertura de contexto no confirmados; no debe asumirse el comportamiento multilingue del base sin verificar.
- Cero descargas y cero likes: sin senales de validacion por parte de la comunidad.
- No apto para produccion sin una evaluacion propia previa del comportamiento inducido.
- La fecha de creacion (2026-11-09) y la ausencia de documentacion refuerzan su naturaleza experimental.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/believe-it-or-not/cond_tag_ptonly_mixed_original_augmented_direct_egregious_berlin_wall-ae08f4da
- Modelo base en Hugging Face: https://huggingface.co/togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference
- Libreria PEFT: https://github.com/huggingface/peft
- Paper citado en los tags (Lacoste et al., 2019, impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculador de impacto ambiental: https://mlco2.github.io/impact
