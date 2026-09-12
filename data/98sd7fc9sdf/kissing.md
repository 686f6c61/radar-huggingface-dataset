# 98sd7fc9sdf/kissing

## Resumen

kissing es un adaptador LoRA de generación de imágenes a partir de texto (text-to-image) publicado en HuggingFace por el usuario 98sd7fc9sdf. No es un modelo completo, sino un ajuste de bajo rango que se aplica sobre el modelo base ponpoke/flux2-klein-9b-uncensored-text-encoder, un modelo de difusión de la familia FLUX según la convención de nombres del propio repositorio. El repositorio ocupa 0,2 GB y se distribuye a través de la librería diffusers, con la etiqueta template:diffusion-lora.

La model card está prácticamente vacía: no define un instance_prompt, no documenta el dataset de entrenamiento, no incluye ejemplos de uso ni resultados de evaluación. El nombre del repositorio ("kissing") sugiere que el adaptador se ha entrenado para generar escenas de besos o de afecto entre personas, pero se trata de una inferencia a partir del título, no de un dato confirmado por el autor.

Su relevancia actual es muy limitada: acumula 0 descargas y 0 "likes" desde su publicación, no declara licencia y depende de un modelo base con "uncensored" en su nombre, lo que añade incertidumbre tanto legal como de contenido. Se documenta aquí como ejemplo de LoRA de terceros con trazabilidad mínima.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (low-rank adaptation) sobre un modelo de difusión de texto a imagen; la arquitectura del modelo base no está documentada en el repositorio |
| Parametros totales | no disponible (adaptador LoRA; el repositorio completo ocupa 0,2 GB, incluyendo pesos y ficheros auxiliares) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica como ventana de tokens; la longitud de prompt efectiva la fija el codificador de texto del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el procesamiento del prompt depende del codificador de texto del modelo base) |
| Licencia | unknown (no declarada en el repositorio ni en la model card) |
| Formato de pesos | no disponible en la model card; el repositorio se publica con la librería diffusers y ocupa 0,2 GB |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA para un modelo de difusión de texto a imagen. En este esquema, los pesos del modelo base permanecen congelados y el adaptador inyecta matrices de bajo rango en determinadas capas (habitualmente en los bloques de atención), de modo que el ajuste ocupa una fracción mínima del tamaño del modelo original: en este caso, 0,2 GB de repositorio frente a un modelo base cuyo nombre sugiere un orden de magnitud de 9 000 millones de parámetros. No se especifican en la model card el rango (rank), el valor de alpha, los módulos objetivo del adaptador ni la resolución de entrenamiento.

Tampoco hay información sobre el proceso de entrenamiento: se desconoce el número de imágenes, la composición del dataset, el número de pasos, la tasa de aprendizaje, el uso de regularización o cualquier técnica de alineación (RLHF, DPO o similares). El campo instance_prompt está explícitamente a null, por lo que no se define una palabra de activación para invocar el concepto aprendido. No consta ninguna innovación técnica asociada al adaptador.

## Capacidades

- Generación de imágenes a partir de prompts de texto, condicionada al modelo base sobre el que se aplique el adaptador.
- Inyección de un concepto o estilo concreto (presumiblemente escenas de besos o de afecto entre personas, según el nombre del repositorio), sin palabra de activación definida.
- Composición con otras técnicas del ecosistema diffusers, como ControlNet, IP-Adapter o encadenamiento de varios LoRA, siempre que el modelo base lo permita.
- No dispone de tool calling ni de function calling: es un adaptador de difusión, no un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso.
- No genera texto ni código, y no procesa imágenes de entrada (no hay evidencia de control de imagen a imagen en el repositorio).
- Capacidades multilingües: no disponible; dependen del codificador de texto del modelo base.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Ilustración de escenas afectivas para proyectos creativos: el adaptador se cargaría sobre el modelo base en un pipeline diffusers para generar imágenes de parejas o de gestos de afecto, un concepto que los modelos genéricos suelen resolver de forma inconsistente.
- Prototipado de conceptos en estudios de diseño: generación rápida de referencias visuales para storyboards o presentaciones, aprovechando que el LoRA es pequeño (0,2 GB) y se puede intercambiar sin recargar el modelo base completo.
- Contenido para redes sociales o campañas de temática romántica: producción de imágenes de apoyo para publicaciones, con la advertencia de que la licencia no está declarada y el uso comercial queda en el aire.
- Composición en pipelines de generación controlada: combinación con ControlNet o IP-Adapter para fijar posturas o encuadres concretos, ya que el adaptador solo modifica el comportamiento estilístico o conceptual, no la estructura del pipeline.
- Investigación sobre ajuste fino eficiente: uso como caso de estudio de LoRA aplicado a difusión, midiendo cuánto concepto se puede inyectar con un adaptador de 0,2 GB y sin palabra de activación.
- Auditoría de contenido y seguridad: al apoyarse en un modelo base etiquetado como "uncensored", sirve para evaluar qué tipo de material genera un adaptador sin filtros declarados y qué salvaguardas habría que añadir en un despliegue real.
- Generación de datasets sintéticos con estilo controlado: creación de lotes de imágenes para entrenar o evaluar otros sistemas, siempre que se resuelva previamente la ambigüedad de licencia y los posibles problemas de derechos de imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (FID, CLIP score, evaluación humana ni comparaciones con otros adaptadores) ni ejemplos de salida verificables.

## Requisitos de hardware

- El adaptador por sí solo no determina los requisitos: el consumo de VRAM lo fija el modelo base ponpoke/flux2-klein-9b-uncensored-text-encoder, cuyas especificaciones no se publican en este repositorio.
- Estimación orientativa, no confirmada por el autor: si el modelo base es efectivamente un transformer de difusión de ~9 000 millones de parámetros, la inferencia en precisión completa requeriría del orden de 18-24 GB de VRAM; con cuantización de 8 bits o 4 bits podría situarse en la franja de 8-12 GB.
- GPU recomendadas (estimación orientativa): A100 40/80 GB, H100 o L40S para despliegue en servidor; RTX 4090 (24 GB) y RTX 3090 (24 GB) como opciones de gama alta para consumidor.
- Cabe en GPU de consumidor: probablemente en RTX 4090/3090 con cuantización, y en tarjetas de 12-16 GB solo con cuantizaciones agresivas. Dato no confirmado.
- Opciones de despliegue: al ser un LoRA de diffusers, es integrable en pipelines de la propia librería diffusers; también podría convertirse a otros formatos (por ejemplo, para ComfyUI) si el modelo base lo admite, aunque no hay conversiones publicadas en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones publicadas de alternativas comparables, y la búsqueda web realizada no devolvió referencias técnicas relevantes (solo páginas de soporte de Microsoft sin relación con el modelo). La comparación se limita, por tanto, a los datos de repositorio del propio artefacto frente a la alternativa de usar el modelo base sin adaptador.

| Modelo | Tipo | Parámetros | Contexto | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| 98sd7fc9sdf/kissing | LoRA de difusión (text-to-image) | no disponible (repositorio de 0,2 GB) | no aplica | unknown | no disponible |
| ponpoke/flux2-klein-9b-uncensored-text-encoder | Modelo base de difusión (text-to-image) | no disponible (el nombre sugiere ~9B) | no aplica | no disponible en esta ficha | no disponible |
| Otros LoRA de text-to-image | Adaptadores de bajo rango | no disponible | no aplica | variable | no disponible |

## Limitaciones y advertencias

- Licencia sin declarar (unknown): no hay autorización explícita de uso comercial, lo que en la práctica impide integrarlo en productos sin aclarar previamente los términos con el autor.
- Model base etiquetado como "uncensored": es previsible que el adaptador no aplique filtros de contenido y pueda generar material explícito o no apto para entornos profesionales.
- Riesgo de contenido sensible: un adaptador orientado a escenas de afecto o intimidad puede producir imágenes con problemas de consentimiento, derechos de imagen o representación de personas reales si se usa con ese fin.
- Dataset de entrenamiento no documentado: no se puede evaluar el sesgo de género, etnia, edad ni corporal, ni descartar la presencia de material con derechos de autor en el entrenamiento.
- Alucinación y artefactos propios de la difusión: se esperan errores anatómicos (manos, dedos), incoherencias en texturas y dificultades para renderizar texto dentro de la imagen; no hay evaluación publicada que los cuantifique.
- Sin palabra de activación (instance_prompt: null): el concepto puede filtrarse a todas las generaciones o no activarse de forma fiable, lo que complica su uso en producción.
- Idiomas soportados no especificados: el rendimiento con prompts en castellano dependerá del codificador de texto del modelo base y no está verificado.
- Adopción nula: 0 descargas y 0 "likes" implican ausencia de validación por parte de la comunidad, de reportes de fallos y de conversiones probadas a otros formatos.
- Riesgo de desaparición: repositorios sin licencia, sin documentación y sin uso pueden eliminarse en cualquier momento, rompiendo pipelines que dependan de ellos.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/98sd7fc9sdf/kissing
- Ficheros y versiones: https://huggingface.co/98sd7fc9sdf/kissing/tree/main
- Modelo base: https://huggingface.co/ponpoke/flux2-klein-9b-uncensored-text-encoder
- Paper, blog, repositorio o demo: no disponible (la búsqueda web no devolvió enlaces relevantes).
