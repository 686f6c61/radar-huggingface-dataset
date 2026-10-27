# jadesadsa/qwen-image-edit-plus-nsfw-lora

## Resumen

MCNL v1 (Multi Concept NSFW LoRA) es un adaptador LoRA de tipo `diffusers` para el pipeline de edición de imágenes Qwen-Image-Edit-2511, publicado en HuggingFace bajo el identificador `jadesadsa/qwen-image-edit-plus-nsfw-lora`. Su función es añadir al modelo base la capacidad de generar y editar imágenes con contenido sexual explícito, una franja que el modelo original de Qwen tiende a rechazar o a resolver con grano anatómico deficiente. El adaptador no es un modelo autónomo: requiere cargar los pesos completos de Qwen-Image-Edit-2511 y aplicar el LoRA encima.

El repositorio ocupa 0,6 GB y el fichero de pesos ronda los 563 MB en formato `safetensors`, lo que sitúa al adaptador en el rango de decenas de millones de parámetros entrenables sobre un transformer de difusión MMDiT (`QwenImageTransformer2DModel`). La model card está etiquetada como `not-for-all-audiences` y se distribuye bajo licencia OpenRAIL++, que impone restricciones de uso adicionales más allá del copyright.

Su relevancia es acotada pero concreta: el ecosistema de Qwen-Image se ha consolidado como alternativa abierta a Flux.1 para edición de imagen con instrucciones en lenguaje natural, y los adaptadores NSFW son una de las demandas más habituales en comunidades de generación de imagen. Al mismo tiempo, el repositorio presenta señales de escasa madurez (0 descargas, 0 likes, sin documentación del dataset de entrenamiento y con rutas internas que apuntan a otra cuenta), lo que obliga a evaluarlo con cautela antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `QwenImageTransformer2DModel` (MMDiT, transformer de difusión) del pipeline Qwen-Image-Edit-2511 |
| Parámetros totales | No disponible para el adaptador (fichero de ~563 MB). Modelo base: ~20 000 M de parámetros según la documentación pública citada |
| Longitud de contexto | No disponible (modelo de difusión; la ventana del codificador de texto no se documenta en la información proporcionada) |
| Tipos de cuantización | No disponible. El ejemplo oficial carga el pipeline en `torch.bfloat16` |
| Idiomas soportados | No disponible. El pipeline base Qwen-Image-Edit admite instrucciones bilingües chino/inglés según fuentes externas citadas |
| Licencia | OpenRAIL++ |
| Formato de pesos | `safetensors` (adaptador LoRA); pipeline base en `diffusers` |
| Pipeline | `image-to-image` (`QwenImageEditPlusPipeline`) |
| Nombre del adaptador | `mcnl-nsfw-v1` |
| Repositorio | 0,6 GB; fichero de pesos ~563 MB |
| Descargas / likes | 0 / 0 |
| Fecha de creación y actualización | 2026-10-27 (misma marca para ambas) |

## Arquitectura y entrenamiento

El adaptador se inyecta en el transformer MMDiT de Qwen-Image-Edit-2511, un modelo de difusión de tipo Multi-Modal Diffusion Transformer que procesa simultáneamente tokens de texto y de imagen latente. El LoRA modifica las proyecciones lineales de las capas de atención y de las capas feed-forward del transformer; la model card no detalla qué módulos concretos se adaptan, ni el rango (`rank`), ni el valor de alpha, ni si se entrenó también el codificador de texto. El ejemplo de uso carga el pipeline base en `bfloat16` y aplica el adaptador mediante `pipe.load_lora_weights()` con `adapter_name="mcnl-nsfw-v1"`, seguido de `pipe.set_adapters()`.

No hay información publicada sobre el dataset de entrenamiento: ni número de imágenes, ni procedencia, ni proceso de captioning, ni si hubo filtrado, ni si se usó regularización con imágenes del modelo base para evitar el olvido catastrófico. Tampoco se documenta el coste de entrenamiento, el hardware empleado ni la resolución nativa de entrenamiento. Como referencia externa (no específica de este adaptador), la nota de Civitai sobre LoRAs NSFW para Qwen-Image señala que un LoRA de propósito general en esta familia requiere un mínimo de 1500 imágenes seleccionadas y bien captionadas, con rango 128 como suelo, y que los conjuntos de 100-300 imágenes producen resultados inconsistentes; esos parámetros no pueden confirmarse en este repositorio.

El pipeline de inferencia documentado usa 40 pasos de muestreo, `true_cfg_scale=4.0` y un `negative_prompt` de un solo espacio, lo que sugiere un ajuste pensado para CFG real con condicionamiento negativo prácticamente vacío. La activación de conceptos se realiza mediante un conjunto de palabras disparadoras asociadas a actos sexuales explícitos y anatomía genital, listadas literalmente en la model card; no se documenta qué palabra cubre qué concepto ni el grado de solapamiento entre ellas.

## Capacidades

- Edición de imágenes por instrucción en lenguaje natural sobre el pipeline Qwen-Image-Edit-2511, con el LoRA aplicado por encima.
- Generación de contenido sexual explícito y modificación de imágenes existentes hacia ese dominio, que es la función declarada del adaptador.
- Control fino mediante palabras disparadoras específicas para distintos conceptos y posiciones anatómicas o de cámara.
- Compatibilidad con el ecosistema `diffusers`: carga y descarga de adaptadores en caliente mediante `load_lora_weights` / `set_adapters`, lo que permite alternar entre varios LoRA en una misma sesión.
- Edición multi-imagen y seguimiento de instrucciones bilingües heredados del pipeline base (según fuentes externas sobre Qwen-Image-Edit-2509/2511).
- Ajuste de composición y anatomía respecto al modelo base, que en esta familia presenta dificultades conocidas para el contenido NSFW.
- No soporta tool calling, function calling, razonamiento multi-paso ni agentes: es un adaptador de difusión, no un modelo de lenguaje.

## Casos de uso

- **Producción de contenido editorial para plataformas de adultos**: el adaptador permite editar fotografías ya existentes (retoque de encuadre, vestuario o iluminación) manteniendo coherencia anatómica, con menos iteraciones que usando el modelo base sin adaptar. Requiere verificación de edad y consentimiento documentado de las personas representadas.
- **Prototipado rápido de pipelines de imagen para adultos**: al ser un LoRA de 563 MB, se puede intercambiar en caliente en un servicio `diffusers` multi-adaptador sin recargar los ~20 000 M de parámetros del modelo base, lo que reduce el coste de experimentación frente a fine-tunes completos.
- **Red teaming de clasificadores NSFW**: generar muestras explícitas controladas para medir la tasa de falsos negativos de filtros de moderación propios, usando las palabras disparadoras como ejes de estratificación del conjunto de evaluación.
- **Investigación sobre sesgos anatómicos en modelos de difusión**: comparar la distribución de salidas del modelo base frente al modelo con LoRA para cuantificar cómo el ajuste fino desplaza la representación corporal y qué conceptos quedan sobrerrepresentados.
- **Anotación y aumento de datasets de imágenes para adultos**: aumentar la diversidad de poses y encuadres de un corpus etiquetado, siempre que la licencia del corpus original lo permita y que las personas retratadas hayan dado consentimiento para usos derivados.
- **Pruebas de robustez frente a deepfakes**: generar ediciones sobre imágenes de sujetos sintéticos para evaluar detectores de manipulación y establecer umbrales de detección en imágenes sexuales no consentidas.
- **Demostración interactiva en Space**: el adaptador está integrado en el Space `ScottzillaSystems/Qwen-Image-Edit-2511-LoRAs-Fast` como opción «MCNL-NSFW-v1» de un desplegable, lo que permite evaluar su comportamiento sin montar infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye métricas cuantitativas (FID, CLIP score, precisión anatómica, tasas de éxito por palabra disparadora) ni comparaciones medidas contra el modelo base o contra otros adaptadores. Tampoco se documentan tiempos de inferencia ni número de pasos óptimo más allá del ejemplo con 40 pasos.

## Requisitos de hardware

- **Peso del adaptador**: ~563 MB en `safetensors`. Es despreciable frente al modelo base, que es el que determina los requisitos.
- **VRAM estimada (estimación propia a partir de los ~20 000 M de parámetros del modelo base, no publicada por el autor)**: en `bfloat16`, los pesos del transformer rondan los 40 GB, a los que hay que sumar el codificador de texto y el VAE; un despliegue completo en bf16 requiere del orden de 48-60 GB de VRAM. Con cuantización de 8 bits la cifra bajaría previsiblemente al rango de 24-32 GB, y con 4 bits a 14-18 GB, aunque no hay recetas de cuantización publicadas para este pipeline en la información disponible.
- **GPU recomendadas**: A100 80 GB o H100 80 GB para bf16 sin compromisos; A100 40 GB o L40S 48 GB con cuantización parcial; RTX 4090 24 GB viable solo con cuantización agresiva y posibles descargas a memoria del sistema.
- **Consumer GPU**: no cabe en GPU de consumo sin cuantizar. Una RTX 4090 de 24 GB o una RTX 3090 de 24 GB pueden ejecutarlo con cuantización; tarjetas de 12-16 GB quedan fuera del rango razonable para el pipeline completo.
- **Opciones de despliegue**: `diffusers` con `QwenImageEditPlusPipeline` (método documentado por el autor), el Space de HuggingFace `ScottzillaSystems/Qwen-Image-Edit-2511-LoRAs-Fast`, y servicios gestionados como Replicate, que ofrecen el pipeline Qwen-Image-Edit-Plus con intercambio de LoRA desde HuggingFace o URL directa. No se documenta soporte para llama.cpp u Ollama, que no aplican a modelos de difusión de este tipo.
- **Latencia y throughput**: no disponibles. El ejemplo usa 40 pasos de inferencia, lo que en un transformer de 20 000 M parámetros implica un coste por imagen alto en comparación con modelos de difusión de 12B como Flux.1.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jadesadsa/qwen-image-edit-plus-nsfw-lora (MCNL v1) | LoRA NSFW sobre Qwen-Image-Edit-2511 | Adaptador ~563 MB; base ~20 000 M | No disponible | OpenRAIL++ | HuggingFace, 0 descargas |
| ScottzillaSystems/qwen-image-edit-plus-nsfw-lora2 (MCNL v2) | LoRA NSFW sobre el mismo modelo base, versión actualizada | No disponible | No disponible | No disponible | HuggingFace, referenciado por el autor como sucesor |
| aiunivers/qwen-image-edit-plus-nsfw-lora | Re-subida del mismo adaptador a otra cuenta | Adaptador, tamaño no disponible | No disponible | No disponible | HuggingFace |
| Qwen/Qwen-Image-Edit-2511 (modelo base) | Modelo completo de edición de imagen | ~20 000 M | Instrucciones bilingües chino/inglés | No disponible en la información proporcionada | HuggingFace, mantenido por Qwen |
| Flux.1 (referencia de la familia competidora) | Modelo completo de generación/edición de imagen | 12 000 M | No disponible | No disponible en la información proporcionada | Amplia disponibilidad |

La comparación relevante no es frente a otros modelos completos, sino frente al modelo base sin adaptador (que rechaza o degrada el contenido NSFW) y frente a la versión v2 del mismo LoRA, que el autor referencia explícitamente como actualización. No hay datos medidos que permitan afirmar qué versión rinde mejor.

## Limitaciones y advertencias

- **Contenido sexual explícito**: el adaptador está diseñado para generar material para adultos. Requiere verificación de edad en cualquier despliegue público y no debe exponerse a menores bajo ningún concepto.
- **Riesgo grave de deepfakes y contenido no consentido**: la combinación de un modelo de edición por instrucción con un LoRA NSFW permite modificar fotografías reales hacia contenido sexual sin consentimiento de la persona retratada. Es la principal advertencia de seguridad y, en la Unión Europea, entra en el ámbito de aplicación de la Directiva 2011/93/UE y de las legislaciones nacionales sobre imágenes manipuladas; en el marco del Reglamento de IA y de la DSA puede constituir contenido ilícito.
- **OpenRAIL++ no es una licencia permisiva sin condiciones**: incorpora restricciones de uso vinculantes (prohibición de usos ilegales, de dañar a menores, de generar contenido no consentido y de suplantación lesiva). El uso comercial está permitido solo si se respetan esas cláusulas y se propaga la licencia a los derivados.
- **Documentación de entrenamiento inexistente**: no se publica dataset, procedencia de las imágenes, consentimiento de las personas retratadas ni proceso de filtrado. Esto impide evaluar riesgos de memorización de identidades reales y complica el cumplimiento del RGPD si el adaptador se usa en la UE.
- **Inconsistencia de autoría**: la model card indica rutas de carga y nombres de adaptador pertenecientes a `ScottzillaSystems/*`, mientras el repositorio se publica bajo `jadesadsa/*`. Hay además una re-subida en `aiunivers/*`. La cadena de procedencia no está clara y conviene verificar la integridad de los pesos antes de usarlos.
- **Señales de baja madurez**: 0 descargas, 0 likes, sin historial de versiones, y fecha de creación y actualización idénticas. No hay evidencia de que el adaptador haya sido validado por terceros.
- **Sesgos anatómicos y de representación**: los LoRA NSFW entrenados con conjuntos pequeños tienden a sobrerrepresentar tipos corporales, etnias y configuraciones concretas. Sin datos del dataset no es posible caracterizar este sesgo, solo anticiparlo.
- **Degradación del modelo base**: al ser un ajuste fino sobre un dominio concreto, puede reducir la fidelidad en ediciones no sexuales. No se han publicado evaluaciones de olvido catastrófico ni comparaciones contra el modelo sin adaptar.
- **Dependencia de palabras disparadoras**: la activación de conceptos depende de términos concretos, con solapamientos no documentados. Prompts sin esas palabras pueden producir resultados inconsistentes o directamente rechazos heredados del modelo base.
- **Requisitos de hardware altos**: el adaptador no reduce la barrera de VRAM del modelo base de ~20 000 M parámetros; sigue siendo un despliegue de gama alta.
- **Idioma no documentado**: no hay información sobre el rendimiento de las palabras disparadoras fuera del inglés, y el pipeline base está documentado para chino e inglés.

## Enlaces

- Repositorio del modelo: https://huggingface.co/jadesadsa/qwen-image-edit-plus-nsfw-lora
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Versión v2 del adaptador (referenciada por el autor): https://huggingface.co/ScottzillaSystems/qwen-image-edit-plus-nsfw-lora2
- Space de demostración: https://huggingface.co/spaces/ScottzillaSystems/Qwen-Image-Edit-2511-LoRAs-Fast
- Re-subida en otra cuenta: https://huggingface.co/aiunivers/qwen-image-edit-plus-nsfw-lora
- Notas sobre LoRAs NSFW en Qwen-Image (Civitai): https://civitai.com/articles/18798/qwen-image-nsfw-lora-notes
- Pipeline Qwen-Image-Edit-Plus con LoRA en Replicate: https://replicate.com/qwen/qwen-image-edit-plus-lora
- Herramienta de edición con LoRA de Qwen Image Edit: https://loraai.io/qwen-image
