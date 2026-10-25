# RunningHubAI/rh-influencer-face-model-lora

## Resumen

`rh-influencer-face-model-lora` es un adaptador LoRA para generación y edición de imágenes condicionada por texto (pipeline `image-text-to-image`), orientado a la creación de rostros de tipo *influencer* con identidad consistente. Lo publica la plataforma RunningHub en HuggingFace bajo la cuenta `RunningHubAI`, aunque la autoría del ajuste se atribuye al usuario `@氛围感` dentro de dicha plataforma, donde el modelo tiene ficha propia.

El repositorio es mínimo: un único fichero `Krea2-Turbo_c1-st10000.safetensors` de 224 MiB (0,2 GB de repositorio). Según la model card, el LoRA está ajustado a partir de `krea2`, un modelo base de generación de imágenes por texto que no se distribuye en este repositorio y cuyas especificaciones no se detallan. El uso previsto es cargarlo en ComfyUI o en la propia plataforma RunningHub junto con el modelo base correspondiente.

Su relevancia es acotada y práctica: los LoRA de identidad facial son un componente habitual en flujos de trabajo de creación de personajes sintéticos para redes sociales, *virtual try-on* o *content generation*, y este se publica específicamente para el ecosistema ComfyUI. No obstante, la información técnica disponible es muy escasa (sin dataset, sin rango del adaptador, sin licencia clara) y el modelo no tiene descargas ni valoraciones, por lo que debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base `krea2`; arquitectura del base no disponible |
| Parametros totales | no disponible (el adaptador ocupa 224 MiB en disco; recuento de parámetros no publicado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de imagen; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; precisión del adaptador no declarada) |
| Idiomas soportados | no disponible (los prompts dependen del codificador de texto del modelo base) |
| Licencia | no disponible como licencia formal; la model card indica "For personal use only" y prohíbe contenido obsceno, vulgar o ilegal |
| Formato de pesos | safetensors (`Krea2-Turbo_c1-st10000.safetensors`, 224 MiB) |

## Arquitectura y entrenamiento

Se trata de un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base `krea2` para especializarlo en un concepto concreto: en este caso, rostros de *influencer*. El repositorio no incluye el modelo base ni documentación sobre qué módulos del transformer de difusión se adaptan, el rango (`rank`) empleado, el `alpha` o la tasa de aprendizaje. Tampoco se indica si el adaptador afecta solo a las proyecciones de atención o también a las capas de alimentación (*feed-forward*).

El nombre del fichero (`Krea2-Turbo_c1-st10000`) sugiere, sin confirmación oficial, un entrenamiento de 10.000 pasos sobre una variante "Turbo" del base, y `c1` podría corresponder a una configuración o a un identificador de concepto. La model card únicamente indica que el ajuste se realizó con las herramientas de entrenamiento de RunningHub y que el resultado se publica en esa plataforma. No hay información sobre el número de imágenes del dataset, su procedencia, la resolución de entrenamiento, el uso de regularización (por ejemplo, *prior preservation*) ni sobre si se aplicaron técnicas de aumento de datos o *captioning* automático. Tampoco se documenta ningún proceso de RLHF/DPO, algo por otra parte poco habitual en LoRA de difusión.

## Capacidades

- Generación de imágenes de retratos a partir de una descripción textual, empleando el pipeline `image-text-to-image` del modelo base.
- Reproducción de una identidad facial concreta y consistente entre generaciones, que es el propósito declarado del LoRA ("influencer face model").
- Edición de imagen guiada por texto (la model card clasifica el modelo como "LoRA (image edit)"), lo que permite modificar atributos manteniendo el rostro.
- Integración nativa en flujos de ComfyUI mediante el nodo de carga de LoRA (etiqueta `comfyui` en el repositorio).
- Ejecución en la plataforma RunningHub y a través de su API, sin necesidad de infraestructura propia.
- Soporte de *tool calling*: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje).
- Capacidades multilingües: no disponible; dependen del codificador de texto del base y no se documentan.
- Modo *thinking*, visión o audio: no disponible; el modelo solo produce imágenes.

## Casos de uso

- Creación de personajes sintéticos para redes sociales: el LoRA mantiene un mismo rostro a lo largo de múltiples generaciones, lo que permite construir un *feed* coherente de un personaje virtual sin repetir el diseño en cada imagen.
- Pruebas de concepto de *marketing*: generación rápida de *mockups* con una persona consistente para campañas, sustituyendo sesiones fotográficas preliminares por iteraciones en ComfyUI.
- Prototipado de *avatars* para aplicaciones: se puede generar un conjunto de retratos de un mismo personaje en distintos estilos de iluminación y encuadre para evaluar la viabilidad de un producto antes de invertir en un modelo de difusión propio.
- Edición de retratos existentes: al tratarse de un LoRA de edición, encaja en flujos donde se parte de una imagen base y se ajustan rasgos o vestuario preservando la identidad facial.
- Automatización por API: la integración con la API de RunningHub permite lanzar generaciones por lotes desde un *backend* sin gestionar GPU, útil para pipelines de contenido a pequeña escala.
- Docencia y experimentación con LoRA en ComfyUI: sirve como ejemplo práctico de cómo un adaptador de 224 MiB modifica el comportamiento de un modelo base sin reentrenarlo.
- Investigación sobre sesgos faciales: permite estudiar qué tipo de rostros produce un LoRA entrenado con un dataset no documentado, aunque la falta de información sobre el dataset limita seriamente la validez del análisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen métricas de calidad de imagen (FID, CLIP score, SSIM), de consistencia de identidad ni comparaciones cuantitativas con otros LoRA de la misma categoría.

## Requisitos de hardware

- El adaptador pesa 224 MiB, pero requiere cargar el modelo base `krea2` completo; la VRAM real vendrá determinada por ese base, cuyas especificaciones no se proporcionan.
- VRAM estimada para inferencia: no disponible (depende del base y de la resolución de generación).
- GPU recomendadas: no disponible. Por la categoría del modelo (difusión por texto de tipo "Turbo"), es esperable que funcione en GPU de consumo, pero no hay confirmación del autor ni requisitos publicados.
- ¿Cabe en GPU de consumo? No confirmado. No se indica un mínimo de VRAM ni GPU soportadas.
- Opciones de despliegue: ComfyUI (soporte declarado mediante la etiqueta `comfyui`) y la plataforma/API de RunningHub. Soporte en vLLM, llama.cpp, Ollama o TGI: no aplica (son motores de modelos de lenguaje).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada (ni parámetros, ni contexto, ni rendimiento, ni licencia de alternativas). Para una comparación rigurosa haría falta identificar el modelo base `krea2` y localizar otros LoRA de identidad facial compatibles con él, datos que no se incluyen en esta ficha.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-influencer-face-model-lora | no disponible (adaptador de 224 MiB) | no aplica | sin benchmarks publicados | "For personal use only" (sin licencia formal) | HuggingFace, RunningHub |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La model card restringe explícitamente el uso a fines personales ("For personal use only") y prohíbe generar imágenes obscenas, vulgares o ilegales para su distribución; no hay una licencia formal (Apache, MIT, etc.) que delimite los derechos de uso comercial.
- No se documenta el dataset de entrenamiento: se desconoce si las personas cuyos rostros aparecen en él dieron consentimiento, lo que plantea riesgos legales y éticos (RGPD, derechos de imagen) si el modelo reproduce identidades reales.
- Riesgo evidente de suplantación de identidad y de generación de *deepfakes*; el uso del modelo para hacer pasar por reales rostros sintéticos debe evitarse y, en su caso, etiquetarse como contenido generado.
- Sesgos desconocidos: al no publicarse la composición del dataset, no se puede evaluar la representación de distintos géneros, etnias, edades o tipos corporales, ni la tendencia a producir un ideal de belleza homogéneo.
- Alucinación en el sentido de artefactos visuales: es esperable que aparezcan deformaciones en manos, dientes, orejas o joyas en resoluciones bajas o con prompts alejados de la distribución de entrenamiento, aunque no hay documentación al respecto.
- Dependencia total del modelo base `krea2`: sin él, el fichero safetensors es inutilizable, y no se especifica qué versión exacta ni qué *checkpoint* es compatible.
- Ausencia de validación comunitaria: 0 descargas y 0 *likes* en el momento de la consulta, sin issues ni ejemplos publicados que permitan verificar la calidad del resultado.
- Información técnica incompleta: no se indican rango del LoRA, pasos, resolución de entrenamiento, *trigger words* ni parámetros de inferencia recomendados (CFG, sampler, scheduler), lo que dificulta reproducir los resultados del autor.
- Idiomas de los prompts no documentados; el comportamiento con prompts en castellano dependerá del codificador de texto del base y no está verificado.

## Enlaces

- HuggingFace: https://huggingface.co/RunningHubAI/rh-influencer-face-model-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2077207128280137729
- Página del autor en RunningHub: https://www.runninghub.ai/user-center/2041030036219498497
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Ejemplo de API con Seedance 2.5: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
