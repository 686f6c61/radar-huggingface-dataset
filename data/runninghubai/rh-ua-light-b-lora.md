# RunningHubAI/rh-ua-light-b-lora

## Resumen

rh-ua-light-b-lora es un adaptador LoRA de edición de imagen publicado por RunningHubAI (autor @UpAgainUI) y afinado a partir de Flux1-Kontext. Su función declarada es la reiluminación de fotografías («Relight photo»): modificar el esquema de luz de una imagen existente sin rehacer la captura. El repositorio solo distribuye los pesos del adaptador (`UA LIGHT B.safetensors`, 292 MiB), no el modelo base, y está etiquetado con el pipeline `image-text-to-image` y los tags `comfyui` y `lora`, lo que sitúa su uso previsto en flujos de ComfyUI y en la propia plataforma RunningHub.

El interés práctico está en el tamaño: un adaptador de menos de 300 MiB que se acopla a un modelo de difusión grande permite añadir un efecto de iluminación concreto sin reentrenar ni alojar un modelo completo. Es, por tanto, una pieza reutilizable en pipelines de posproducción y generación por lotes.

Ahora bien, la ficha pública es mínima: no se documentan datos de entrenamiento, hiperparámetros del LoRA (rango, alpha, módulos objetivo), resolución, licencia concreta ni resultados de evaluación. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y el propio autor remite a la licencia del proyecto original para cualquier condición de uso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Flux1-Kontext; rango, alpha y módulos objetivo no disponibles |
| Parámetros totales | No disponible; el fichero de pesos ocupa 292 MiB (no se publica el número de parámetros del adaptador ni del modelo base) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible / no aplica (modelo de difusión para imagen, no un modelo de lenguaje) |
| Tipos de cuantización | No disponible; se distribuye en safetensors sin cuantización declarada. La cuantización aplicable depende del modelo base que se cargue (p. ej. fp8 o GGUF en ComfyUI), no del adaptador |
| Idiomas soportados | No disponible (los prompts dependen del codificador de texto del modelo base; no se documenta cobertura idiomática) |
| Licencia | No disponible; la model card indica que se sigue la licencia del proyecto original o upstream (Flux1-Kontext) |
| Formato de pesos | safetensors (`UA LIGHT B.safetensors`, 292 MiB) |
| Tipo de modelo | LoRA de edición de imagen (image edit / relight) |
| Pipeline declarado | `image-text-to-image` |
| Modelo base | Flux1-Kontext |
| Tamaño del repositorio | 0,3 GB |
| Plataformas previstas | ComfyUI, RunningHub, Hugging Face |

## Arquitectura y entrenamiento

El modelo es un adaptador de bajo rango (LoRA) que se inyecta sobre Flux1-Kontext, un modelo de difusión para edición de imagen. No se publica información sobre la arquitectura interna del adaptador: se desconoce el rango, el valor de alpha, los módulos objetivo (atención, proyecciones, bloques de transformador) y la resolución de entrenamiento. Tampoco se detalla si el ajuste se hizo sobre el modelo completo, sobre variantes cuantizadas o con técnicas adicionales de regularización.

No hay datos sobre el conjunto de entrenamiento: ni número de imágenes, ni procedencia, ni composición, ni proceso de anotación o filtrado. Al tratarse de un adaptador de difusión, conceptos como RLHF o DPO no aplican directamente y no se documenta ningún tipo de ajuste por preferencias. La única información técnica fiable es la declaración de la model card: «Finetuned from: Flux1-Kontext» y el propósito «Relight photo». Cualquier detalle adicional sobre el entrenamiento debe considerarse no disponible.

## Capacidades

- Reiluminación de fotografías: modifica el esquema de luz de una imagen de entrada, según la descripción del autor («Relight photo»).
- Edición de imagen guiada por texto: el pipeline declarado es `image-text-to-image`, por lo que se espera una imagen de referencia más una instrucción textual.
- Integración en ComfyUI: el tag `comfyui` y el formato safetensors indican que se carga mediante nodos de LoRA sobre un flujo de Flux1-Kontext.
- Ejecución en la nube: disponible a través de RunningHub, tanto en el modelo público enlazado como mediante API.
- Soporte de tool calling / function calling: no disponible (no aplica a un LoRA de imagen).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no documentadas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles más allá de la edición de imagen descrita.

## Casos de uso

- Reiluminación de retratos para estudios y agencias: aplicar un esquema de luz distinto sobre una foto ya capturada, evitando una nueva sesión con el sujeto y el equipo de iluminación.
- Corrección de fotografía de producto: recuperar volumen y sombras en imágenes tomadas con luz plana o de oficina, antes de publicarlas en una ficha de e-commerce.
- Exploración de variantes de iluminación para un cliente: generar varias propuestas de luz sobre la misma toma base y presentarlas como opciones en una sola reunión de selección.
- Previsualización de iluminación en preproducción audiovisual: producir referencias visuales del esquema previsto para alinear a dirección de fotografía y arte antes del rodaje.
- Procesado por lotes en ComfyUI: encadenar el adaptador en un flujo que recorra un catálogo de imágenes y aplique un acabado de luz coherente, con revisión manual posterior.
- Coherencia de luz en composiciones: ajustar la iluminación de un sujeto recortado para que case con la del fondo antes de integrarlo, siempre con comprobación visual del resultado.
- Variantes creativas para publicidad: generar distintas versiones de una misma imagen con luces diferentes para pruebas A/B de creatividades, reduciendo coste de producción frente a nuevas sesiones.
- Investigación sobre adaptadores de bajo rango: usar el adaptador como referencia de un ajuste pequeño (292 MiB) sobre un modelo de difusión grande para estudiar transferencia de efectos concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no publicada en el repositorio. El adaptador añade 292 MiB a los pesos del modelo base, por lo que el requisito real lo determina Flux1-Kontext y su precisión de carga; se trata de una estimación orientativa de la familia del modelo base, no de un dato del autor.
- GPU recomendadas: no indicadas por el autor. Para el modelo base se suelen emplear A100 o H100 en entornos de producción y RTX 4090 (24 GB) o RTX 3090 en estaciones de trabajo; conviene verificar la compatibilidad concreta antes de dimensionar.
- GPU de consumo: previsiblemente viable en tarjetas de 24 GB en precisión alta y en tarjetas de 8-12 GB si se recurre a variantes cuantizadas del modelo base; no confirmado por el autor.
- Opciones de despliegue: ComfyUI como vía principal (tags `comfyui` y `lora`), RunningHub en la nube y API de RunningHub. vLLM, TGI y llama.cpp no aplican a este tipo de modelo. Integración posible vía diffusers si se reconstruye manualmente el flujo del modelo base, sin documentación oficial.
- Latencia y throughput: no disponibles. Al depender del modelo base, del número de pasos de muestreo y de la resolución, no pueden estimarse sin pruebas propias.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño de pesos | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rh-ua-light-b-lora | LoRA de reiluminación sobre Flux1-Kontext | 292 MiB (adaptador) | No aplica | No disponible | No disponible (remite al upstream) | Hugging Face y RunningHub; 0 descargas |
| Flux1-Kontext (base, sin adaptador) | Modelo de difusión para edición de imagen | No disponible en esta información | No aplica | No disponible | Licencia del proyecto original | Amplia, vía repositorios oficiales |
| rh-b-lora (RunningHubAI) | LoRA de text-to-image | 659 MB | No aplica | No disponible | No disponible | Hugging Face; sin métricas publicadas |
| rh-u-lora (RunningHubAI) | LoRA (ComfyUI) | 614 MB | No aplica | No disponible | No disponible | Hugging Face; sin métricas publicadas |
| IC-Light y otras soluciones de relighting | Modelos/herramientas específicas de reiluminación | No disponible en esta información | No aplica | No disponible | No disponible en esta información | Repositorios públicos |

La comparación cuantitativa no es posible: ninguno de los adaptadores del mismo autor publica métricas ni documentación de entrenamiento, y no se dispone de resultados comparables de calidad de reiluminación para este modelo.

## Limitaciones y advertencias

- Ausencia total de documentación de entrenamiento: sin dataset, hiperparámetros ni resolución, no es posible reproducir el ajuste ni auditar su procedencia.
- Sin evaluación publicada: no hay benchmarks, ejemplos comparativos ni métricas de fidelidad de identidad o de color; cualquier valoración de calidad debe hacerse con pruebas propias.
- Riesgo de artefactos: al modificar la iluminación de una imagen real, el adaptador puede alterar rasgos del sujeto, tonos de piel o sombras de contacto de forma inconsistente, especialmente en imágenes de baja calidad o con múltiples fuentes de luz.
- Ambigüedad de la tarea: la model card solo indica «Relight photo»; no se especifica si el control de la nueva iluminación es textual, por imagen de referencia o implícito, lo que dificulta diseñar prompts fiables.
- Sesgos: no documentados. Al heredarse del modelo base y de un dataset no publicado, no puede descartarse un sesgo de iluminación, tono de piel o tipo de retratopropio de los datos de entrenamiento.
- Licencia incierta: el adaptador no declara licencia propia y remite a la del proyecto original. Antes de un uso comercial es imprescindible verificar las condiciones de Flux1-Kontext, que pueden restringir la explotación comercial.
- Compatibilidad limitada al modelo base declarado: no hay indicios de que funcione sobre otros modelos de difusión; cargarlo en otro base produciría resultados inválidos.
- Falta de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin incidencias reportadas ni discusión en la sección Community.
- Detalle operativo: el fichero incluye espacios en el nombre (`UA LIGHT B.safetensors`), lo que puede requerir escapado en scripts y automatizaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-ua-light-b-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/1964746828052840450
- README en chino: https://huggingface.co/RunningHubAI/rh-ua-light-b-lora/blob/main/README_cn.md
- Página del autor (@UpAgainUI): https://www.runninghub.ai/user-center/1935334486756470786
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Catálogo de modelos de RunningHub: https://www.runninghub.ai/models
