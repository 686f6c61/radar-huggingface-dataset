# houseofboern/phonelook-krea2-v2

## Resumen

phonelook-krea2-v2 es un LoRA de estilo para el modelo de generación de imágenes text-to-image Krea 2 (concretamente sobre el checkpoint `krea/Krea-2-Raw`). Lo desarrolla el usuario de HuggingFace `houseofboern` y su objetivo es muy concreto: que las habitaciones generadas parezcan fotografías domésticas reales —camas deshechas, platos en el fregadero, iluminación barata de techo— en lugar de renders de interiorismo preparados. No es un modelo autónomo, sino un adaptador de bajo rango que se apila sobre el modelo base y modifica el entorno sin tocar al sujeto.

El adaptador se entrenó exclusivamente con 315 fotografías de viviendas reales sin personas (dormitorios, cocinas, baños y salones), seleccionadas de 1.200 candidatas procedentes de Open Images V7 (Flickr, CC BY 2.0), con dos pasadas de revisión para descartar hoteles, anuncios inmobiliarios, estancias escenificadas y filtros. El resultado es un LoRA pequeño (repo de 0,1 GB), sin trigger word, pensado para apilarse después de un LoRA de personaje y mantener intactos rostro y cuerpo del sujeto.

Es relevante ahora por su enfoque de "realismo sucio" aplicado a un modelo base reciente y porque documenta de forma inusualmente transparente el proceso de curación del dataset y la decisión de no publicar el checkpoint de 3.000 pasos. El repositorio no tiene descargas ni likes en el momento de la consulta, y la licencia figura como "other" sin texto de términos publicado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo base text-to-image; arquitectura del modelo base no disponible |
| Parametros totales | no disponible (adaptador de rango 16; el repo ocupa 0,1 GB, dominado por los pesos del LoRA en safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen; sin ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible; el autor solo publica safetensors en precisión original |
| Idiomas soportados | no disponible (las captions de entrenamiento están en inglés) |
| Licencia | other (términos no especificados en el repositorio) |
| Formato de pesos | safetensors (`phonelook_krea2_v2_step1500.safetensors`) |
| Tipo de modelo | LoRA de estilo / estética de interiores, pipeline text-to-image |
| Modelo base | krea/Krea-2-Raw |
| Rango / alpha | 16 / 16 |
| Trigger word | ninguna (funciona solo con cargar el adaptador) |
| Fuerza recomendada | 1,0 (hasta 1,4 para efecto más marcado) |
| Resolución probada | 1024×1280 |
| Muestreador probado | euler / simple, 8 pasos, CFG 1,0, sobre Krea 2 Turbo |
| Pasos de entrenamiento | 3.000 totales; se publica el checkpoint de 1.500 |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador se entrenó con ai-toolkit sobre Krea 2 Raw con rango 16 y alpha 16, learning rate 1e-4, optimizador adamw8bit y 3.000 pasos, usando buckets de resolución 768 y 1024. No se empleó trigger word: el autor indica que el efecto se activa por pesos, de modo que basta con cargar el LoRA y describir la escena. Se publicó únicamente el checkpoint de paso 1.500; el de 3.000 fue descartado tras las pruebas porque en selfies frente al espejo empezaba a introducir una segunda persona en el encuadre.

El dataset lo componen 315 fotos de habitaciones reales sin personas, escogidas de 1.200 candidatas de Open Images V7 (fotos de Flickr bajo CC BY 2.0). Dos revisores eliminaron hoteles, listados inmobiliarios, estancias escenificadas, imágenes con filtros, texto y cualquier persona o reflejo. Las captions siguen una plantilla estricta: descripción llana de la habitación, seguida de la fuente de luz y el momento del día; nunca describen calidad, cámara ni realismo. Ese sesgo de anotación explica el vocabulario que el autor recomienda usar en inferencia (`overhead ceiling light`, `warm lamp light`, `soft window light`, `daylight`, `camera flash photo`, `at night`, `during the day`). No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de decodificación especulativa, algo por otra parte ajeno a un modelo de difusión.

## Capacidades

- Generación de interiores domésticos realistas: dormitorios, cocinas, baños y salones con aspecto de fotografía cotidiana, no de render de inmobiliaria.
- Modificación del entorno sin alterar al sujeto: el autor reporta que el rostro y el cuerpo del personaje se mantienen estables al apilarlo sobre un LoRA de personaje.
- Control de iluminación mediante lenguaje natural: distingue luz de techo, lámpara cálida, luz suave de ventana, luz de día y flash de cámara.
- Control del momento del día mediante frases explícitas (`at night`, `during the day`).
- Ausencia de trigger word: no requiere token especial en el prompt, lo que simplifica su integración en pipelines existentes.
- Compatibilidad con otros adaptadores: el autor lo describe como complementario a `lightlook` (luz sobre el cuerpo) y `skinlook` (textura de piel), pensado para apilarse después del LoRA de personaje.
- No cubre: generación de personas por sí mismo, texto en imagen, control de pose, edición por máscara, vídeo ni audio. No hay soporte de tool calling ni de agentes, al no ser un modelo de lenguaje.

## Casos de uso

- Fotografía de producto en contexto doméstico: para marcas de menaje, textil de hogar o pequeños electrodomésticos, el LoRA genera la estancia con un aspecto creíble y no publicitario, lo que reduce la sensación de render artificial en catálogos y redes.
- Creación de personajes consistentes en escenarios cotidianos: al apilarse sobre un LoRA de personaje y mantenerlo intacto, sirve para series de imágenes de un mismo personaje en dormitorios, cocinas y baños con estética de foto de móvil.
- Previsualización de escenas para narrativa y cómic: guionistas y dibujantes pueden generar localizaciones interiores verosímiles (cama deshecha, platos en el fregadero) como referencia de ambiente antes de producir arte final.
- Simulación de imágenes de usuario para investigación en visión por computador: útiles para aumentar datasets con interiores realistas no escenificados y con distribución de luz doméstica, evitando el sesgo de renders profesionales.
- Contenido editorial y blogs de estilo de vida: ilustrar artículos sobre vivienda real, alquiler o vida doméstica sin recurrir a stock fotográfico, con control explícito de la hora del día y la fuente de luz.
- Pruebas de concepto de apps de decoración o realidad aumentada: generar variantes de una misma estancia bajo distintas condiciones de iluminación para evaluar cómo se comportará un pipeline de detección o segmentación.
- Prototipado rápido de moodboards de dirección de arte: explorar combinaciones de luz cálida de lámpara frente a luz de techo en un mismo plano base gracias a la estabilidad de seeds que documenta el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo aporta validación cualitativa mediante comparación con una línea base sin LoRA sobre seeds fijas, en la configuración Krea 2 Turbo, 8 pasos, euler / simple, CFG 1,0 y 1024×1280.

| Prueba documentada | Resultado reportado |
|---|---|
| Checkpoint 1500, fuerza 1,0–1,4 | Limpio; mantiene rostro y cuerpo del personaje |
| Checkpoint 3000 | Descartado: añadía una segunda persona en selfies de espejo |
| Línea base sin LoRA (seeds fijas) | Usada como referencia de comparación; sin métricas publicadas |
| Composición con LoRA de personaje | El personaje se mantiene estable en el paso 1500 |

## Requisitos de hardware

- El adaptador en sí pesa muy poco (repo de 0,1 GB), por lo que su carga en VRAM es marginal frente al modelo base.
- Los requisitos reales de VRAM vienen determinados por Krea 2 Raw/Turbo, cuyas especificaciones no están disponibles en la información proporcionada.
- GPU recomendadas: no disponible para el modelo base. Para el adaptador no se requiere hardware específico más allá de lo que exija el checkpoint base.
- Cabeza en GPU de consumo: no disponible; depende enteramente del modelo base y del nivel de cuantización que se le aplique.
- Opciones de despliegue: el autor documenta el uso con Krea 2 Turbo y muestreador euler / simple a 8 pasos y CFG 1,0; no especifica la interfaz de inferencia (ComfyUI, Diffusers u otras). El entrenamiento se realizó con ai-toolkit.
- Latencia y throughput: no disponible. Con 8 pasos en el muestreador configurado, el coste por imagen será el del modelo base; el LoRA añade una sobrecarga despreciable.

## Comparativa con modelos similares

No hay datos públicos de adaptadores comparables en la información disponible. La única comparación documentada es interna, frente a la línea base sin LoRA y frente al checkpoint descartado:

| Elemento | Tipo | Trigger word | Fuerza | Estado | Datos técnicos |
|---|---|---|---|---|---|
| phonelook v2 (step 1500) | LoRA de interiores sobre Krea 2 | No | 1,0–1,4 | Publicado | Rango 16/16, 315 imágenes, repo 0,1 GB |
| phonelook v2 (step 3000) | LoRA de interiores sobre Krea 2 | No | no disponible | No publicado (artefacto de segunda persona) | Mismo entrenamiento, más pasos |
| lightlook | LoRA complementario (luz sobre el cuerpo) | no disponible | no disponible | Citado por el autor | no disponible |
| skinlook | LoRA complementario (textura de piel) | no disponible | no disponible | Citado por el autor | no disponible |
| Krea 2 Raw sin LoRA | Modelo base | no aplica | no aplica | Público | no disponible |

## Limitaciones y advertencias

- Especialización estrecha: solo cubre interiores domésticos sin personas. Usado en exteriores, paisajes o escenas con público, el efecto será marginal o contraproducente.
- Entrenado solo con habitaciones vacías: el autor advierte de que el LoRA "cambia la habitación alrededor del personaje"; no está pensado para generar personas por sí mismo.
- Riesgo de artefactos en composiciones complejas: el propio autor documenta que el checkpoint de 3.000 pasos introducía una segunda persona en selfies de espejo. No se han publicado evaluaciones sistemáticas de artefactos en otras composiciones.
- Sesgo de procedencia de datos: las 315 imágenes provienen de Open Images V7/Flickr, con la distribución geográfica y de clase social que ello implica. No hay información sobre diversidad de tipos de vivienda, tamaños o estilos regionales.
- Dependencia del prompt: el vocabulario de iluminación y hora del día funciona mejor con las frases exactas vistas en las captions; paráfrasis muy distintas pueden reducir el efecto.
- Licencia ambigua: el repositorio declara `license: other` sin texto de términos. Antes de un uso comercial es imprescindible contactar con el autor o consultar la licencia del modelo base Krea 2, que puede imponer restricciones adicionales.
- Obligaciones de atribución sobre los datos: las fotos de entrenamiento son CC BY 2.0 y el autor incluye `training_data_credits.csv` con fotógrafo, licencia y enlace. Aunque el LoRA no redistribuye imágenes, conviene revisar si la licencia del adaptador hereda algún requisito de atribución.
- Sin métricas objetivas: no hay FID, CLIP score ni evaluaciones humanas cuantificadas, solo validación cualitativa con seeds fijas. La reproducibilidad depende de la versión del modelo base y del sampler.
- Madurez del repositorio: 0 descargas y 0 likes, creado y actualizado el 2026-10-25 con 16 segundos de diferencia. Sin comunidad ni incidencias reportadas; no hay garantía de mantenimiento.
- Fecha de creación anómala (2026) en los metadatos de HuggingFace; conviene verificarla antes de citar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/houseofboern/phonelook-krea2-v2
- Modelo base Krea 2 Raw: https://huggingface.co/krea/Krea-2-Raw
- Open Images V7 (Google), origen de los datos de entrenamiento: https://storage.googleapis.com/openimages/web/index.html
- ai-toolkit, framework de entrenamiento empleado: https://github.com/ostris/ai-toolkit
- Créditos de las imágenes de entrenamiento: `training_data_credits.csv` dentro del repositorio del modelo
- Búsqueda web: los resultados devueltos no guardan relación con este modelo (contenido no técnico y ajeno al tema), por lo que no se incluyen como referencias válidas.
