# mrx6so/Flux-NSFW-uncensored

## Resumen

Flux-NSFW-uncensored es un adaptador LoRA para generación de imágenes a partir de texto, publicado por el usuario mrx6so en Hugging Face. El repositorio tiene un tamaño de 0,7 GB y contiene pesos en formato safetensors (el ejemplo de la model card carga un archivo `lora.safetensors` mediante la librería PEFT). No se trata por tanto de un modelo completo, sino de un ajuste fino de bajo rango que se aplica sobre el modelo base black-forest-labs/FLUX.1-dev y que modifica el comportamiento de generación en la dirección de reducir las restricciones de contenido que impone el modelo original.

El propósito declarado por el autor es explícitamente experimental: la model card lo describe como un "playground" para explorar los límites técnicos de la generación de imágenes por IA y comprobar dónde se sitúan las fronteras de la censura mediante distintos prompts. La licencia es CreativeML Open RAIL-M, el pipeline es text-to-image, el único idioma declarado es inglés y el repositorio está marcado con la etiqueta `not-for-all-audiences`, lo que restringe su uso a entornos con control de acceso y verificación de edad.

La relevancia de esta ficha es limitada pero concreta: se trata de un adaptador sin descargas ni "likes" en el momento de la consulta, sin documentación técnica sobre el proceso de entrenamiento, sin benchmarks publicados y con metadatos internamente inconsistentes (la fecha de creación registrada es 2026-09-25 y el código de ejemplo carga pesos del repositorio Heartsync/Flux-NSFW-uncensored, no del repositorio que nos ocupa). Cualquier evaluación en producción debe partir de esa base: es un artefacto de investigación, no un modelo con garantías de calidad o soporte.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre FLUX.1-dev, un transformer de flujo rectificado (rectified flow transformer) según la documentación pública del modelo base |
| Parametros totales | No disponible. El repositorio completo ocupa 0,7 GB, coherente con un adaptador LoRA más los archivos auxiliares; el modelo base FLUX.1-dev tiene 12 000 millones de parámetros según su documentación pública |
| Parametros activos | No aplica: no es una arquitectura MoE |
| Longitud de contexto | No aplica en el sentido de ventana de tokens de un LLM. La longitud de prompt efectiva viene determinada por los codificadores de texto del modelo base; el ejemplo de la model card usa un prompt de unas 40 palabras |
| Tipos de cuantizacion | No disponible en el repositorio. El adaptador se distribuye en safetensors; las cuantizaciones (fp16, bf16, FP8, GGUF Q4/Q8) dependen del ecosistema que se use para cargar FLUX.1-dev |
| Idiomas soportados | Inglés (en) |
| Licencia | CreativeML Open RAIL-M (creativeml-openrail-m) |
| Formato de pesos | safetensors (archivo `lora.safetensors` según el ejemplo de la model card) |
| Pipeline | text-to-image |
| Modelo base | black-forest-labs/FLUX.1-dev |
| Resolución de salida | No disponible en el repositorio; el ejemplo de la model card genera a 1024 x 1024 píxeles |
| Parámetros de inferencia de ejemplo | guidance_scale 7.0, num_inference_steps 28, seed 42, dtype float16 |
| Fecha de creación registrada | 2026-09-25 (metadato inconsistente, véase limitaciones) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

El repositorio no documenta el proceso de entrenamiento: no se indica el número de imágenes utilizadas, la composición del dataset, el número de pasos de entrenamiento, el rango del LoRA, el learning rate ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se especifica si el adaptador se entrenó sobre las capas de atención del transformer, sobre los bloques de proyección de texto o sobre ambos, que es la información mínima necesaria para reproducir o evaluar el ajuste. Todos estos datos deben considerarse no disponibles.

Arquitectónicamente, lo único verificable es que se trata de un adaptador de bajo rango cargado con PEFT sobre FLUX.1-dev. FLUX.1-dev es, según su documentación pública, un transformer de flujo rectificado con 12 000 millones de parámetros que combina un codificador de texto tipo CLIP con un codificador T5 de mayor tamaño, lo que le permite interpretar prompts largos y descriptivos. El ejemplo de la model card es consistente con ese diseño: emplea prompts de estilo fotográfico detallado (cámara, objetivo, apertura, tipo de iluminación) y un prompt negativo para filtrar artefactos como marcas de agua, firmas o estilos no fotorrealistas. La innovación técnica del adaptador, más allá de la reducción de filtrado de contenido, no está descrita por el autor.

Un detalle técnico relevante es que el código de ejemplo no carga pesos del repositorio mrx6so, sino de `Heartsync/Flux-NSFW-uncensored` con `adapter_name="uncensored"`. Esto sugiere que el repositorio analizado es una redistribución, un espejo o una copia de una model card ajena, y no necesariamente un entrenamiento original del autor listado.

## Capacidades

- Generación de imágenes fotorrealistas a partir de descripciones textuales en inglés, con control fino mediante prompts largos y detallados.
- Soporte de prompt negativo, lo que permite excluir estilos (cartoon, anime, ilustración), artefactos (texto, marcas de agua, firmas) y problemas de calidad (borroso, baja calidad).
- Control de la fuerza de condicionamiento mediante `guidance_scale` y del coste computacional mediante `num_inference_steps`, con valores de referencia de 7.0 y 28 respectivamente en el ejemplo del autor.
- Reproducibilidad mediante semilla fija (`torch.Generator().manual_seed(seed)`).
- Composición con otros adaptadores LoRA, ya que se carga como adaptador PEFT con nombre propio (`adapter_name="uncensored"`), lo que en la práctica permite apilarlo o desactivarlo según el caso.
- Capacidad de modificar el comportamiento del modelo base en materia de contenido: la finalidad declarada es reducir las restricciones de censura del modelo original.
- No se documenta soporte de tool calling ni de function calling: es un modelo de difusión para imágenes, no un modelo de lenguaje con interfaz de herramientas.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingües: no; el único idioma declarado es inglés.
- No se documentan capacidades de visión, audio, vídeo ni inpainting/outpainting específicas de este adaptador, aunque el modelo base puede combinarse con ControlNet u otras herramientas en ecosistemas de terceros.

## Casos de uso

- Investigación sobre límites de censura en modelos generativos: el propio autor define el modelo como un banco de pruebas para comprobar mediante distintos prompts dónde se sitúan las fronteras de filtrado del modelo base. Se usaría comparando salidas del modelo base y del adaptador con el mismo prompt y la misma semilla para aislar el efecto del LoRA.
- Red teaming y evaluación de clasificadores de contenido: el adaptador permite generar muestras que estresan los clasificadores NSFW de una plataforma, de modo que un equipo de confianza y seguridad puede medir tasas de falsos negativos antes de desplegar un sistema de moderación.
- Construcción de datasets sintéticos para entrenar moderadores: al poder generar contenido adulto etiquetado de forma controlada, sirve para alimentar clasificadores binarios de contenido sensible, siempre que el uso cumpla la licencia y la normativa aplicable.
- Producción de fotografía de temática adulta para plataformas verificadas: el prompt de ejemplo (vestido translúcido, contraluz dorado, Canon EOS R5, 85 mm f/1.2) ilustra el caso de uso de fotografía editorial de lencería o moda adulta, donde el modelo resulta adecuado por su control de iluminación y detalle fotorrealista.
- Previsualización de conceptos para guiones gráficos de temática adulta: en producción audiovisual para adultos, el adaptador permite iterar rápidamente sobre composiciones y encuadres antes de rodar, con la ventaja de que el prompt negativo elimina estilos no deseados.
- Pruebas de concepto sobre destilación y ajuste de LoRA: al ser un adaptador pequeño sobre un modelo de 12 000 millones de parámetros, es un caso útil para estudiar cómo un LoRA de bajo rango altera el comportamiento de un transformer de flujo rectificado sin reentrenar el modelo completo.
- Generación local sin dependencia de API: al cargarse con `diffusers` y PEFT sobre el modelo base, todo el pipeline puede ejecutarse en una máquina propia, lo que resulta relevante para flujos de trabajo que no pueden enviar prompts a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (FID, CLIPScore, ImageReward, comparativas humanas) ni comparaciones cuantitativas con el modelo base o con otros adaptadores. Las etiquetas de Hugging Face tampoco aportan métricas de evaluación. Cualquier afirmación sobre la calidad del adaptador requeriría una evaluación propia con prompts y semillas fijas frente a FLUX.1-dev sin el LoRA.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en el repositorio. Como referencia, el adaptador LoRA añade un consumo despreciable frente al modelo base; el grueso de la VRAM lo determina FLUX.1-dev al cargarse en memoria.
- GPU recomendadas: no especificadas por el autor. Por el tamaño del modelo base, se sitúan en el rango de A100 40/80 GB, H100 o GPUs de 24 GB o más en configuraciones cuantizadas.
- ¿Cabe en GPU de consumo? No hay confirmación oficial en la información disponible. En el ecosistema de FLUX.1-dev existen rutas cuantizadas (GGUF Q4/Q8, FP8) que permiten ejecución en GPUs de consumo con 8-16 GB de VRAM, pero esto depende de herramientas de terceros y no está documentado ni garantizado por este repositorio.
- Opciones de despliegue: el ejemplo oficial usa `diffusers` con `AutoPipelineForText2Image` y `peft` para cargar el LoRA. No se documentan vLLM, Ollama, TGI ni llama.cpp (este último no aplica a modelos de difusión, aunque sí existen cargadores GGUF para FLUX en el ecosistema ComfyUI).
- Latencia y throughput estimados: no disponibles. El ejemplo usa 28 pasos de inferencia y `torch.float16`, sin reportar tiempos.
- Requisito de software explícito: la librería PEFT es necesaria para cargar el adaptador, según el comentario del propio código de ejemplo.

## Comparativa con modelos similares

| Modelo | Base | Tipo | Resolución documentada | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| mrx6so/Flux-NSFW-uncensored | FLUX.1-dev | LoRA (0,7 GB de repositorio) | No disponible (ejemplo a 1024 x 1024) | en | CreativeML Open RAIL-M | Hugging Face, 0 descargas y 0 likes en la consulta |
| Heartsync/Flux-NSFW-uncensored | FLUX.1-dev | LoRA, referenciado en el código del repositorio analizado | No disponible | no disponible | no disponible en la información consultada | Citado únicamente en el código de ejemplo, sin verificar |
| nsfw-flux-dev (aisha-ai-official) | FLUX.1-dev | Variante alojada en Replicate | Hasta 4096 x 4096 píxeles | no disponible | no disponible en la información consultada | Replicate |
| Flux Uncensored v3 | FLUX | Ajuste de FLUX orientado a control de prompt | No disponible | no disponible | no disponible en la información consultada | Sitio de terceros (getllms.org) |

No se dispone de datos de rendimiento comparado entre estas opciones, por lo que la tabla solo refleja disponibilidad y características declaradas, no calidad de salida.

## Limitaciones y advertencias

- Contenido para adultos: el repositorio está marcado como `not-for-all-audiences` y su finalidad declarada es reducir la censura del modelo base. Su uso exige verificación de edad, control de acceso y cumplimiento estricto de la normativa aplicable en cada jurisdicción.
- Riesgo legal: la generación de imágenes sexuales o sexualizadas de personas reales, o que puedan identificarse como reales, está prohibida en numerosas jurisdicciones y puede constituir un delito, con independencia de lo que permita la licencia del modelo.
- Licencia: CreativeML Open RAIL-M incluye restricciones de uso en su anexo, con cláusulas específicas sobre contenido sexual, menores y suplantación de identidad. Es imprescindible leer el texto completo de la licencia antes de cualquier uso, incluido el comercial o el académico.
- Sin documentación de entrenamiento: no se especifican dataset, número de pasos, rango del LoRA ni metodología, lo que impide evaluar sesgos, calidad o reproducibilidad.
- Sesgos conocidos: no documentados por el autor. Al ser un ajuste fino no documentado sobre FLUX.1-dev, hereda los sesgos del modelo base y añade los del dataset de ajuste, que se desconoce.
- Riesgo de alucinación visual: en modelos de difusión esto se traduce en anatomías incorrectas, manos deformes, artefactos en fondos y textos ilegibles. La model card intenta mitigarlo con un prompt negativo, lo que no elimina el problema.
- Limitación de idioma: solo inglés declarado. Los prompts en castellano u otros idiomas pueden degradar la fidelidad al texto.
- Inconsistencia de procedencia: el código de ejemplo carga pesos de `Heartsync/Flux-NSFW-uncensored` en lugar del repositorio mrx6so, por lo que no está claro quién entrenó el adaptador ni si el contenido del repositorio coincide con el del código.
- Metadatos inconsistentes: la fecha de creación registrada es 2026-09-25, posterior a la fecha habitual de publicación de FLUX.1-dev y sin descargas ni likes asociados. Conviene tratar los metadatos con cautela.
- Sin garantías de producción: 0 descargas, 0 likes, sin benchmarks, sin versionado y sin mantenimiento declarado. No es un artefacto adecuado para integrarse en un pipeline crítico sin una evaluación previa completa.
- Sin soporte de herramientas ni agentes: cualquier flujo que requiera function calling, razonamiento multi-paso o control de contexto tipo LLM debe resolverse con otro componente del sistema, no con este adaptador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrx6so/Flux-NSFW-uncensored
- Modelo base FLUX.1-dev: https://huggingface.co/black-forest-labs/FLUX.1-dev
- Repositorio referenciado en el código de ejemplo del autor: https://huggingface.co/Heartsync/Flux-NSFW-uncensored
- Ficha de nsfw-flux-dev en aimodels.fyi: https://www.aimodels.fyi/models/replicate/nsfw-flux-dev-aisha-ai-official
- Artículo sobre generación local sin censura (FLUX, SDXL, Z-Image): https://localaimaster.com/blog/uncensored-local-image-generation
- Ficha en OpenCSG del modelo Flux-NSFW-uncensored de Heartsync: https://opencsg.com/models/AIWizards/Flux-NSFW-uncensored
- Ficha de Flux Uncensored v3: https://getllms.org/models/flux-uncensored-v3
- Búsqueda de modelos con etiqueta nsfw en Hugging Face: https://huggingface.co/models?sort=trending&search=nsfw
