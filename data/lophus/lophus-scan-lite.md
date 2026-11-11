# Lophus/lophus-scan-lite

## Resumen

Lophus Scan Lite es un identificador de especies para dispositivos (on-device) desarrollado por Lophus para su aplicación móvil. No se trata de un modelo de lenguaje generativo, sino de un clasificador multimodal de imagen a texto construido a partir del codificador visual de BioCLIP (imageomics/bioclip), exportado a formato ONNX con cuantización int8 y acompañado de embeddings de texto del Árbol de la Vida para 9725 especies.

El modelo resuelve el problema de identificar especies a partir de fotografías sin requerir conexión a un servidor: al estar cuantizado a int8 y empaquetado en ONNX, está pensado para ejecutarse localmente en dispositivos con recursos limitados. El repositorio ocupa aproximadamente 0,1 GB y se distribuye bajo licencia MIT, lo que facilita su integración en aplicaciones comerciales.

La relevancia actual del modelo radica en su enfoque de despliegue en el borde (edge computing) para tareas de biodiversidad, con especial atención a 225 especies prioritarias de Malasia. La información pública disponible es muy limitada: no se detallan parámetros, contexto, idiomas ni resultados de benchmarks, por lo que esta ficha se limita a lo que el autor declara en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador visual de BioCLIP exportado a ONNX (modelo base: imageomics/bioclip) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen a texto, no generativo) |
| Tipos de cuantizacion | int8 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo se basa en BioCLIP (imageomics/bioclip), un modelo de visión-lenguaje entrenado sobre datos biológicos que alinea imágenes con nombres taxonómicos. Lophus Scan Lite reutiliza el codificador de imagen de BioCLIP y lo exporta a ONNX con cuantización int8 para reducir el tamaño y permitir la inferencia en dispositivos. El componente de texto consiste en embeddings del Árbol de la Vida para 9725 especies, de las cuales 225 son especies prioritarias de Malasia.

No se dispone de información sobre el proceso de entrenamiento adicional, el número de tokens, la composición del dataset ni si hubo ajuste fino, RLHF o DPO. Tampoco se detallan innovaciones técnicas más allá de la exportación a ONNX y la cuantización int8 para despliegue en el borde.

## Capacidades

- Identificación de especies a partir de imágenes mediante comparación con embeddings de texto de 9725 especies.
- Cobertura específica de 225 especies prioritarias de Malasia.
- Inferencia en dispositivo (on-device) gracias al formato ONNX int8.
- Clasificación imagen-texto (no generación de texto libre).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües ni modos especiales (thinking, visión adicional, audio).

## Casos de uso

- Identificación de especies en campo: la aplicación Lophus puede clasificar fotografías de organismos tomadas por el usuario sin conexión, usando el modelo ONNX int8 embebido en el dispositivo.
- Aplicaciones de ciencia ciudadana: integración en apps de observación de biodiversidad para que los usuarios obtengan una sugerencia de especie y la validen, reduciendo la dependencia de expertos.
- Educación ambiental: herramientas móviles que permitan a estudiantes identificar especies locales de Malasia a partir de fotos.
- Conservación y monitorización: despliegue en dispositivos de campo con recursos limitados para preclasificar imágenes de trampas cámara o muestras.
- Filtrado previo en pipelines de datos: uso del modelo como primer clasificador para descartar o etiquetar imágenes antes de un análisis más profundo en servidor.
- Aplicaciones de turismo y naturaleza: guías interactivas que identifiquen flora y fauna local en tiempo real sin conexión.
- Integración en flujos de investigación: apoyo a la anotación preliminar de conjuntos de imágenes biológicas con las 9725 clases disponibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX int8 de aproximadamente 0,1 GB, se espera que quepa en memoria de dispositivos móviles y GPUs de gama baja, pero no se aportan cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probablemente sí, dado el tamaño reducido del repositorio, aunque no se confirma en la información disponible.
- Opciones de despliegue: ONNX Runtime (formato nativo del modelo); no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lophus Scan Lite | no disponible | no aplica | no disponible | MIT | Hugging Face (ONNX int8) |
| BioCLIP (imageomics/bioclip) | no disponible | no aplica | no disponible en esta ficha | MIT (según model card) | Hugging Face |
| Otros clasificadores de especies | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre Lophus Scan Lite y BioCLIP u otros modelos de identificación de especies en la información proporcionada.

## Limitaciones y advertencias

- La información pública es muy escasa: no se detallan parámetros, datos de entrenamiento ni evaluación, lo que dificulta valorar su calidad real.
- Cobertura limitada a 9725 especies, con especial énfasis en 225 especies de Malasia; fuera de ese ámbito la precisión puede degradarse.
- Al derivar de BioCLIP, puede heredar sesgos del dataset original de imágenes biológicas (desequilibrio taxonómico, sesgos geográficos).
- Riesgo de clasificación errónea en imágenes de baja calidad, especies visualmente similares o fuera de la distribución de entrenamiento.
- No es un modelo generativo: no produce explicaciones ni texto libre, solo asociaciones imagen-texto.
- Licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base BioCLIP y de los embeddings del Árbol de la Vida.
- No se documentan idiomas soportados ni requisitos de hardware, lo que limita la planificación de despliegues en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Lophus/lophus-scan-lite
- Modelo base BioCLIP: https://huggingface.co/imageomics/bioclip
- Wikispecies (género Lophus): https://species.wikimedia.org/wiki/Lophus
- Wikispecies (Lophus lewisi): https://species.wikimedia.org/wiki/Lophus_lewisi
- Wikipedia (Augustynolophus): https://fr.wikipedia.org/wiki/Augustynolophus
- Wikipedia (Chrysoblephus lophus): https://en.wikipedia.org/wiki/Chrysoblephus_lophus
