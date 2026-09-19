# maxbsoft/cbai-adapter1-photo2portrait-qwen2511

## Resumen

El modelo `maxbsoft/cbai-adapter1-photo2portrait-qwen2511` es un adaptador LoRA de rango 32 entrenado sobre el modelo de edición de imagen `Qwen/Qwen-Image-Edit-2511`. Su función es muy concreta: tomar la fotografía de un menor y redibujarla como un retrato cartoon de aspecto cel-shading plano, sobre fondo blanco liso, manteniendo el parecido facial, el tono de piel y el color y estilo del pelo. Está pensado como primer eslabón de una cadena de adaptadores orientada a la ilustración de libros infantiles, de ahí el prefijo "cbai" y la etiqueta `children-book`.

Lo desarrolla el usuario de HuggingFace `maxbsoft` y se publica bajo licencia Apache 2.0. El entrenamiento se hizo íntegramente con datos sintéticos: 492 pares del conjunto `maxbsoft/synth-v1-packed`, compuestos por "fotos" generadas de niños y sus correspondientes retratos sobre fondo blanco producidos con Nano Banana 2. El autor declara explícitamente que no hay personas reales en los datos de entrenamiento, lo que reduce el riesgo de reproducción de identidades reales, pero también limita la diversidad del dominio cubierto.

Su relevancia es la de un ejemplo de especialización vertical sobre un modelo generativo generalista: en lugar de reentrenar un modelo de difusión completo, se añade un adaptador pequeño que fija un estilo editorial muy determinado. En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 likes, por lo que no existe validación independiente por parte de la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 32) sobre `Qwen/Qwen-Image-Edit-2511`; arquitectura del modelo base no disponible en la información proporcionada |
| Parametros totales | No disponible (no se indican parámetros del adaptador ni del modelo base) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica / no disponible (modelo de edición de imagen, no de texto) |
| Tipos de cuantizacion | No disponible; se distribuye en safetensors y hereda las opciones de cuantización del modelo base |
| Idiomas soportados | No disponible; la plantilla de prompt publicada está en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`cont800/cont800_step1500.safetensors`) |
| Modelo base | `Qwen/Qwen-Image-Edit-2511` |
| Rango del LoRA | 32 |
| Dataset de entrenamiento | `maxbsoft/synth-v1-packed`, 492 pares sintéticos |
| Tamaño del repositorio | 18,3 GB |
| Pipeline declarado | No disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-19 |
| Última actualización | 2026-09-20 |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA, no de un modelo completo: no puede ejecutarse de forma autónoma y requiere cargar los pesos del modelo base `Qwen-Image-Edit-2511`. El autor especifica rango 32, una tasa de aprendizaje de 1e-4 y 1000 pasos de entrenamiento para la primera fase. Existe además un directorio `cont800/` que continúa el entrenamiento desde el paso 800 con una tasa de aprendizaje reducida de 3e-5 hasta el paso 1500. El checkpoint seleccionado por el autor como definitivo es `cont800/cont800_step1500.safetensors`.

El conjunto de datos es íntegramente sintético y consta de 492 pares imagen-entrada/imagen-salida: "fotos" de niños generadas y sus correspondientes retratos sobre fondo blanco generados con Nano Banana 2. La model card afirma que no hay personas reales en los datos. No se documenta ninguna innovación arquitectónica propia más allá del propio ajuste LoRA, ni se mencionan fases de RLHF o DPO, algo que no aplica al entrenamiento de un adaptador de difusión. Tampoco se detalla la composición demográfica del dataset ni el rango de edades, sexos o etnias cubierto.

El prompt de inferencia recomendado por el autor es literalmente: "Redraw this photo of a {age}-year-old {sex} as a flat cel-shaded cartoon portrait for a children's picture book on a plain white background, keeping the same face, skin tone, hair colour and hairstyle, wearing {clothes}."

## Capacidades

- Conversión de fotografía a retrato cartoon con estilo cel-shading plano y fondo blanco liso.
- Preservación de rasgos de identidad: cara, tono de piel, color de pelo y peinado, según lo declarado por el autor.
- Parametrización mediante prompt de la edad, el sexo y la ropa del sujeto representado.
- Orientación específica a ilustración de libro infantil, con estética homogénea entre imágenes.
- Capacidades heredadas del modelo base `Qwen-Image-Edit-2511` (edición de imagen general); no se detallan en la información disponible.
- Soporte de tool calling / function calling: no aplica (modelo de imagen).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no disponibles; la plantilla publicada está en inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; el modo de operación documentado es edición de imagen guiada por prompt.
- No funciona sin el modelo base: es un adaptador, no un modelo autónomo.

## Casos de uso

- Ilustración de libros infantiles por lotes: a partir de fotografías autorizadas de los protagonistas, generar los retratos de las páginas interiores con un estilo homogéneo gracias a la plantilla de prompt fija y al fondo blanco consistente.
- Personalización de cuentos bajo demanda: editoriales o servicios de autoedición que ofrecen versiones del mismo cuento con el niño o la niña como protagonista, sustituyendo únicamente edad, sexo y ropa en el prompt.
- Generación de avatares cartoon: creación de imágenes de perfil con estética de ilustración infantil a partir de una foto, útil en plataformas educativas o de ocio infantil.
- Coherencia de personaje en series largas: al mantener rasgos faciales, tono de piel y peinado, el adaptador sirve para producir múltiples viñetas del mismo personaje en distintas posturas y vestuarios, siempre sobre el mismo fondo neutro.
- Previsualización de estilo antes de encargar trabajo profesional: un estudio o un autor independiente puede generar pruebas rápidas del look cel-shading para validar dirección de arte con el cliente antes de contratar a un ilustrador.
- Material didáctico y escolar: fichas, murales o presentaciones con los alumnos representados como personajes de dibujo animado, siempre con consentimiento y cumpliendo la normativa de protección de datos de menores.
- Prototipado en editorial y diseño gráfico: integración como paso previo en la cadena de producción, generando bocetos de personaje que después se retocan o se vectorizan.
- Pipelines automatizados de autoedición: combinado con scripts de procesamiento por lotes, permite generar catálogos completos de retratos a partir de una carpeta de fotografías de entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor hace referencia a dos documentos de resultados incluidos en el repositorio, `RESULT-1000.md` y `cont800/RESULT-cont800.md`, cuyo contenido no se ha proporcionado en esta ficha, así como a la elección del checkpoint `cont800/cont800_step1500.safetensors` como versión preferida. No se incluyen métricas cuantitativas (FID, LPIPS, similitud facial, CLIP score u otras), ni comparaciones numéricas con alternativas.

## Requisitos de hardware

- Al ser un adaptador LoRA, el coste de memoria lo determina casi por completo el modelo base `Qwen/Qwen-Image-Edit-2511`; el adaptador añade un sobrecoste marginal sobre la inferencia del base.
- VRAM estimada para inferencia: no disponible. Depende del modelo base y de la cuantización empleada, datos que no se especifican en la información proporcionada.
- GPU recomendadas: no disponible por la misma razón; condicionado a los requisitos del modelo base.
- Compatibilidad con GPU de consumo: no disponible; no se puede confirmar sin conocer el tamaño y la precisión del modelo base.
- Tamaño del repositorio: 18,3 GB, un volumen muy superior al de un único LoRA de rango 32, lo que indica que el repositorio incluye varios checkpoints (por ejemplo, los correspondientes a los pasos 1000 y 1500) además de los pesos del adaptador. Esto afecta al almacenamiento necesario en disco, no necesariamente a la VRAM de inferencia.
- Opciones de despliegue: el autor no especifica ninguna. Las vías habituales para cargar un LoRA sobre un modelo de difusión son bibliotecas tipo diffusers o interfaces gráficas tipo ComfyUI, pero no hay confirmación en la model card de que se hayan probado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| `maxbsoft/cbai-adapter1-photo2portrait-qwen2511` | LoRA rango 32 sobre Qwen-Image-Edit-2511 | No disponible | No aplica | Apache 2.0 | HuggingFace, 0 descargas | Sin benchmarks publicados |
| `Qwen/Qwen-Image-Edit-2511` (modelo base, sin adaptador) | Modelo de edición de imagen completo | No disponible | No aplica | No disponible en esta ficha | HuggingFace | No disponible en esta ficha |
| Otros adaptadores del mismo autor (`cbai-adapter*`) | LoRA sobre el mismo base | No disponible | No aplica | No disponible | No confirmada en la información proporcionada | No disponible |
| Alternativas de terceros para retrato cartoon | LoRA o servicios propietarios | No disponible | No aplica | No disponible | No disponible | No disponible |

La diferencia funcional verificable frente al modelo base es la especialización: el LoRA fija un estilo cel-shading plano con fondo blanco y una plantilla de prompt concreta, mientras que el base es un editor de imagen de propósito general. No se dispone de datos objetivos para comparar calidad, similitud facial o fidelidad de estilo entre ambos ni frente a terceros.

## Limitaciones y advertencias

- Entrenado exclusivamente con 492 pares sintéticos de niños generados, no con fotografías reales: es probable que la generalización a fotos reales con iluminación, encuadre, oclusión o fondo complejo sea peor de lo que sugieren los resultados internos.
- La diversidad demográfica del dataset no está documentada; cabe esperar sesgos en la representación de edades, tonos de piel, tipos de pelo o rasgos étnicos, heredados tanto del generador sintético como del conjunto de 492 pares.
- Riesgo de sobreajuste al estilo del generador empleado (Nano Banana 2) y al formato de salida fijo (fondo blanco liso). No se documenta capacidad para otros fondos o encuadres.
- La plantilla de prompt está en inglés y es muy específica; desviarse de ella puede degradar el resultado, y no hay información sobre robustez multilingüe.
- En modelos de difusión el equivalente a la alucinación son los artefactos: pérdida de parecido facial, deformaciones anatómicas o cambios no deseados de peinado y ropa. No hay métricas publicadas que cuantifiquen su frecuencia.
- Ausencia total de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta.
- Licencia Apache 2.0 en el adaptador, lo que en principio permite uso comercial, pero el uso del modelo base `Qwen/Qwen-Image-Edit-2511` está sujeto a su propia licencia, no verificada en la información disponible. Conviene comprobarla antes de un despliegue en producción.
- Tratamiento de imágenes de menores: cualquier uso con fotografías reales exige consentimiento de los tutores y cumplimiento del RGPD y de la normativa aplicable de protección de datos; el autor no aborda este punto en la model card.
- El repositorio ocupa 18,3 GB, lo que puede complicar su descarga y almacenamiento en entornos con espacio limitado.
- Las fechas de creación y actualización registradas son 2026-09-19 y 2026-09-20 respectivamente; se reproducen tal cual figuran en la información consultada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/maxbsoft/cbai-adapter1-photo2portrait-qwen2511
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Dataset de entrenamiento: https://huggingface.co/datasets/maxbsoft/synth-v1-packed
- Documento de resultados de la primera fase (dentro del repositorio): https://huggingface.co/maxbsoft/cbai-adapter1-photo2portrait-qwen2511/blob/main/RESULT-1000.md
- Documento de resultados de la continuación (dentro del repositorio): https://huggingface.co/maxbsoft/cbai-adapter1-photo2portrait-qwen2511/blob/main/cont800/RESULT-cont800.md
- Pesos seleccionados por el autor: https://huggingface.co/maxbsoft/cbai-adapter1-photo2portrait-qwen2511/blob/main/cont800/cont800_step1500.safetensors
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes. Las referencias devueltas (fichas de la aplicación Instagram en App Store, el subreddit r/enhypen y el subreddit r/Instagramreality) no guardan relación con este modelo ni con el proyecto. No se dispone de paper, blog técnico, repositorio de código ni demo asociados.
