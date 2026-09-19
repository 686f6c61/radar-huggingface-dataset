# AiMamis/Angie

## Resumen

Angie es un LoRA de generación de imágenes texto-a-imagen publicado en HuggingFace por el usuario AiMamis bajo el identificador `AiMamis/Angie`. Se trata de un adaptador de bajo rango que se monta sobre el modelo base `krea/Krea-2-Turbo` y que sirve para incorporar a ese modelo la representación de una identidad concreta, activada mediante las palabras clave `Angie`, `Brunette hair` y `Hazel eyes`. El repositorio ocupa 0,5 GB y se distribuye con la librería diffusers.

El modelo resuelve el problema clásico de personalización en difusión: obtener una identidad consistente sin reentrenar el modelo base completo. Los LoRA son el mecanismo estándar para este fin porque permiten compartir adaptadores de pocos cientos de MB y combinarlos con otros adaptadores en el mismo pipeline.

La relevancia de esta ficha es limitada y conviene ser explícito: el repositorio acumula 0 descargas y 0 likes, no incluye documentación sobre el proceso de entrenamiento (rango, alpha, capas objetivo, dataset, pasos, resolución) ni resultados de evaluación, y su tarjeta se limita a las palabras de activación y a la licencia openrail++. Además, el título de la model card ("Angie Varona") y la propia palabra de activación apuntan a una persona identificable, lo que introduce riesgos de suplantación que se detallan más abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusión texto-a-imagen; arquitectura del modelo base no disponible en la información proporcionada |
| Parametros totales | no disponible (el número de parámetros entrenables depende del rango y de las capas objetivo, no especificados) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen; la longitud de la condición de texto depende del encoder del modelo base, no disponible) |
| Tipos de cuantizacion | no disponible para el LoRA; las cuantizaciones aplicables dependen del modelo base `krea/Krea-2-Turbo`, no documentadas aquí |
| Idiomas soportados | no disponible (las palabras de activación están en inglés) |
| Licencia | openrail++ |
| Formato de pesos | no confirmado explícitamente en los metadatos; los LoRA distribuidos para diffusers suelen publicarse en safetensors |
| Tamano del repositorio | 0,5 GB |
| Modelo base | krea/Krea-2-Turbo |
| Pipeline | text-to-image |
| Palabras de activacion | Angie, Brunette hair, Hazel eyes |
| Fecha de creacion | 2026-09-19T18:24:43.000Z |
| Fecha de actualizacion | 2026-09-19T18:25:16.000Z |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura del adaptador más allá de su naturaleza LoRA ni las características del modelo base `krea/Krea-2-Turbo`. No se indican rango (rank), valor de alpha, capas objetivo (atención cruzada, proyecciones Q/K/V, etc.), resolución de entrenamiento, tamaño del dataset, número de pasos, optimizador ni si se aplicó regularización o *prior preservation*. Tampoco se documenta si el entrenamiento partió de un conjunto de imágenes de una única persona ni cuántas se utilizaron.

No hay constancia de técnicas de RLHF o DPO, que en cualquier caso no son habituales en este tipo de adaptadores. Tampoco se documenta ninguna innovación técnica (decodificación especulativa, atención lineal, *schedulers* propios o destilación). El *instance prompt* declarado en los metadatos es `Angie, Brunette hair, Hazel eyes`, coherente con las tres palabras de activación indicadas en la model card.

## Capacidades

- Generación de imágenes texto-a-imagen condicionada al modelo base `krea/Krea-2-Turbo`.
- Personalización de identidad: inyección de una representación concreta activada por la palabra `Angie`.
- Control de atributos asociados a la identidad mediante las palabras `Brunette hair` (cabello castaño) y `Hazel eyes` (ojos avellana).
- Combinación con el pipeline de diffusers del modelo base (no se documenta compatibilidad con otros adaptadores, *ControlNet* o *IP-Adapter*).
- No dispone de soporte de *tool calling* ni de *function calling*.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No se documentan capacidades multilingües; el entrenamiento y las palabras de activación están en inglés.
- No se documentan capacidades de *thinking mode*, visión, audio ni entrada multimodal (es un modelo puramente texto-a-imagen).

## Casos de uso

- Pruebas de integración de pipelines de difusión: el LoRA permite verificar que un flujo basado en diffusers carga correctamente un adaptador sobre `krea/Krea-2-Turbo` y aplica las palabras de activación, con un coste de almacenamiento de solo 0,5 GB.
- Investigación sobre personalización de identidad: sirve como ejemplo de LoRA de una sola entidad para estudiar cómo se comportan los adaptadores de bajo rango en términos de consistencia facial y *overfitting*.
- Evaluación de sesgos y memorización: al tratarse de un adaptador de identidad, puede utilizarse en estudios sobre qué información retiene un LoRA del dataset de entrenamiento y cómo se filtra a las salidas.
- Generación de retratos sintéticos para conjuntos de datos de investigación en visión por computador, siempre que se cuente con el consentimiento explícito de la persona representada y se cumplan los requisitos legales aplicables.
- Prototipado de personajes para ilustración y cómic, usando `Angie` como sujeto consistente entre viñetas, con la advertencia de que la identidad parece corresponder a una persona real y su uso comercial requiere autorización.
- Pruebas de estrés de infraestructura de inferencia: al apoyarse en un modelo base de imagen, permite medir tiempos de carga, consumo de VRAM y latencia de un pipeline texto-a-imagen con un adaptador extra.
- Demostraciones docentes sobre LoRA: es un caso sencillo para explicar en un taller cómo funcionan las palabras de activación y el *instance prompt*, dado el reducido tamaño del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas objetivas (FID, CLIP score, similitud facial, DINO, etc.) ni comparaciones cuantitativas con otros adaptadores de identidad.

## Requisitos de hardware

- El adaptador LoRA en sí es pequeño (el repositorio completo ocupa 0,5 GB, presumiblemente incluyendo las imágenes de muestra), por lo que la VRAM necesaria la determina el modelo base `krea/Krea-2-Turbo`, cuyas especificaciones no constan en la información proporcionada.
- Estimaciones orientativas, condicionadas al tamaño real del modelo base y no verificadas: para un modelo base de 2.000-3.000 millones de parámetros, en torno a 6-8 GB de VRAM en FP16; para un modelo base de 8.000-12.000 millones de parámetros, en torno a 16-24 GB en FP16 y 8-12 GB en FP8 o en cuantizaciones GGUF de 4-8 bits.
- GPU recomendadas: no disponible para este LoRA en concreto. Como referencia general para modelos de difusión de gran tamaño, se emplean A100 (40/80 GB), H100 (80 GB), L40S (48 GB) y, en el extremo consumer, RTX 4090 (24 GB) o RTX 4080 (16 GB); la idoneidad depende del tamaño del modelo base.
- Compatibilidad con GPU de consumo: no confirmada. Sería viable en tarjetas de 16-24 GB si el modelo base es de ~12.000 millones de parámetros y se aplican cuantizaciones, pero no hay datos que lo confirmen para `krea/Krea-2-Turbo`.
- Opciones de despliegue: diffusers es la librería declarada en los metadatos; el despliegue con vLLM, llama.cpp, Ollama o TGI no aplica a modelos de difusión de imagen. Otras alternativas habituales para difusión (ComfyUI, Automatic1111, InvokeAI) no están confirmadas para este adaptador.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores comparables (otros LoRA de identidad entrenados sobre `krea/Krea-2-Turbo`) y no se han publicado métricas de rendimiento, por lo que la comparación se limita a lo que consta en los metadatos.

| Modelo | Tipo | Parametros | Licencia | Disponibilidad | Rendimiento documentado |
|---|---|---|---|---|---|
| AiMamis/Angie | LoRA de identidad sobre Krea-2-Turbo | no disponible | openrail++ | HuggingFace, 0 descargas, 0 likes, 0,5 GB | no disponible |
| krea/Krea-2-Turbo (modelo base sin LoRA) | Modelo de difusión texto-a-imagen | no disponible en la información proporcionada | no disponible en esta ficha | HuggingFace | no disponible |
| Otros LoRA de identidad sobre el mismo base | LoRA de identidad | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Identidad de una persona real: el título de la model card es "Angie Varona" y la palabra de activación es `Angie`, lo que indica que el adaptador reproduce la apariencia de una persona identificable. Generar imágenes de una persona sin su consentimiento puede vulnerar el derecho a la propia imagen y el honor (Ley Orgánica 1/1982 en España) y el RGPD, y puede constituir suplantación o desinformación si se presenta como material auténtico.
- Licencia openrail++: incorpora restricciones de uso (prohibición de usos ilícitos, dañinos o de suplantación) y obligaciones de propagación de la licencia a obras derivadas. Debe consultarse el texto completo antes de cualquier uso comercial, y en ningún caso la licencia exime de obtener el consentimiento de la persona representada.
- Ausencia de validación comunitaria: 0 descargas y 0 likes implican que no hay evidencia de terceros sobre la calidad, la consistencia facial o la ausencia de artefactos.
- Falta total de documentación de entrenamiento: sin rango, alpha, capas objetivo, dataset ni número de pasos, no es posible estimar el grado de *overfitting* ni la capacidad de generalización a poses, iluminaciones y estilos no vistos.
- Sin resultados de evaluación ni ejemplos verificables más allá del *widget* declarado en la model card.
- Anomalía en los metadatos: las fechas de creación y actualización registradas (2026-09-19) son posteriores a la fecha actual, lo que sugiere un error de marcado temporal o un valor introducido manualmente; conviene no tomarlas como referencia.
- Dependencia del modelo base: cualquier limitación, sesgo de representación o problema de licencia de `krea/Krea-2-Turbo` se hereda y se agrava con el adaptador.
- Riesgo de sesgos: los modelos de difusión entrenados con datos web tienden a reproducir estereotipos de género, etnia y corporalidad; un LoRA de identidad concreta no corrige ese comportamiento y puede reforzarlo en las variaciones generadas.
- Artefactos típicos de difusión: manos y dedos deformes, texto ilegible en la imagen, incoherencias anatómicas y desviaciones de la identidad cuando la pose o el estilo se alejan de la distribución de entrenamiento.
- Idiomas: no hay soporte multilingüe documentado; las palabras de activación están en inglés, por lo que prompts en otros idiomas pueden degradar el resultado.
- Los resultados de la búsqueda web proporcionados no contienen ninguna referencia al modelo: corresponden a hilos de foro sobre la ZDF Mediathek y no aportan información técnica ni enlaces útiles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AiMamis/Angie
- Descarga de archivos (pestaña Files & versions): https://huggingface.co/AiMamis/Angie/tree/main
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- Paper, blog, repositorio o demo adicionales: no disponible (los resultados de búsqueda web suministrados no guardan relación con el modelo)
