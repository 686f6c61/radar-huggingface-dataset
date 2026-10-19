# BassionAI/BSAI-MOSS-Image-SFT-4steps-turbo-merged

## Resumen

BSAI-MOSS-Image-SFT-4steps-turbo-merged es un archivo único en formato safetensors (bf16, 9,47 GB) publicado por el usuario BassionAI que empaqueta el modelo de difusión MOSS-Image-SFT de OpenMOSS junto con pesos de destilación tipo turbo, de modo que puede generar imágenes con tan solo 4 pasos de muestreo. No se trata de un modelo entrenado desde cero, sino de una fusión (merge) de pesos preparada para cargarse directamente en ComfyUI desde `ComfyUI/models/diffusion_models/`. El modelo subyacente, MOSS-Image, es un Diffusion Transformer (DiT) de 5.000 millones de parámetros especializado en texto a imagen con control de composición nativo.

La relevancia del modelo base está en dos capacidades poco habituales en modelos abiertos de este tamaño: la posibilidad de especificar la disposición espacial de objetos y texto mediante un prompt en formato JSON (layout control nativo) y la renderización de texto bilingüe inglés-chino dentro de la imagen. Esto lo sitúa en la misma categoría funcional que modelos mucho más grandes como FLUX.1 o Qwen-Image, pero con un peso que cabe en GPUs de consumo.

Este repositorio concreto es una redistribución de la comunidad, con 0 descargas y 0 "likes" en el momento de la consulta, y sin resultados de benchmarks publicados. Su interés práctico es la conveniencia de despliegue (un solo archivo, 4 pasos, integración directa en ComfyUI), no una mejora demostrada de calidad. La licencia declarada es Apache-2.0, aunque el autor recomienda verificar los términos del modelo upstream antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) para texto a imagen; fusión de checkpoint SFT con pesos de destilación turbo (4 pasos) |
| Parametros totales | 5.000 millones (aproximado, según el modelo base MOSS-Image) |
| Parametros activos | No aplica (no es un modelo Mixture of Experts) |
| Longitud de contexto | No aplica (modelo texto a imagen); longitud máxima de prompt no documentada |
| Tipos de cuantizacion | Solo bf16 en este repositorio; no se distribuyen variantes fp8, GGUF ni int4 |
| Idiomas soportados | Inglés (en) y chino (zh), tanto en prompt como en texto renderizado en la imagen |
| Licencia | Apache-2.0 (declarada por el autor; verificar licencia del modelo upstream) |
| Formato de pesos | safetensors (archivo único, bf16, 9,47 GB) |
| Tamano del archivo | 9,47 GB (`BSAI-MOSS-Image-SFT-4steps-turbo-merged.safetensors`) |
| Ruta en ComfyUI | `ComfyUI/models/diffusion_models/` |
| Pasos de muestreo recomendados | Desde 4 pasos (versión turbo fusionada) |
| Modelo base | OpenMOSS-Team/MOSS-Image-SFT |
| Pipeline | text-to-image |
| Resolución nativa | No disponible |
| Fecha de publicación del repositorio | 2026-10-19 |

## Arquitectura y entrenamiento

MOSS-Image es una familia de modelos texto a imagen de OpenMOSS compuesta por un modelo base y un modelo afinado sobre datos curados (SFT). La arquitectura es un Diffusion Transformer de aproximadamente 5.000 millones de parámetros, es decir, un transformer que opera directamente sobre tokens latentes de imagen en el proceso de difusión, en la línea de las arquitecturas DiT introducidas por trabajos como los de Peebles y Xie. Sobre esa base, MOSS-Image añade control de layout nativo: además de un prompt en lenguaje natural, acepta un prompt en formato JSON donde se especifican objetos, texto a renderizar y sus posiciones espaciales.

El detalle del entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO o de etapas de refinamiento) no está disponible en la información proporcionada. Lo que sí se documenta es la existencia de un componente complementario, el MOSS-Image Prompt Enhancer, que convierte ideas de imagen en captions detallados o en prompts de layout, y de LoRAs turbo/DMD de terceros (por ejemplo, variantes de 8 pasos publicadas en Civitai) que aceleran el muestreo.

Este repositorio concreto no documenta el procedimiento de fusión: no se indica qué LoRA o pesos de destilación se han combinado con el checkpoint SFT, ni con qué factor de escala, ni si se ha validado la calidad resultante frente al modelo original. El resultado es un único archivo bf16 pensado para inferencia directa con un número muy bajo de pasos (4), lo que reduce el coste por imagen a costa de una pérdida de calidad potencialmente no cuantificada.

## Capacidades

- Generación de imágenes a partir de prompts en lenguaje natural en inglés y chino.
- Control de layout nativo: acepta un prompt en formato JSON con objetos, texto y posiciones espaciales, lo que permite composiciones guiadas sin LoRA de ControlNet.
- Renderización de texto dentro de la imagen en inglés y chino, incluyendo cadenas relativamente largas (capacidad del modelo base; no se especifican límites).
- Generación guiada por cajas delimitadoras dibujadas por el usuario en ComfyUI, según la documentación oficial de ComfyUI.
- Muestreo acelerado: la versión turbo fusionada está pensada para funcionar desde 4 pasos, lo que reduce el tiempo de inferencia de forma drástica frente a un muestreo completo.
- Integración directa en ComfyUI como modelo de difusión de un solo archivo, lo que simplifica el despliegue y el uso en flujos de trabajo con nodos.
- Compatibilidad con el Prompt Enhancer de MOSS-Image, que transforma ideas breves en captions detallados o en layouts estructurados.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, audio ni entrada de imagen (no es un modelo multimodal de entrada).

## Casos de uso

- Cartelería y publicidad bilingüe: el modelo puede generar un cartel con el texto en inglés o en chino colocado en una posición concreta mediante layout JSON, lo que evita el paso posterior de composición tipográfica manual en diseños simples.
- Prototipado rápido de creatividades: con 4 pasos de muestreo y un único archivo en ComfyUI, un diseñador puede generar decenas de variantes por minuto en una sola GPU y iterar sobre composición y copy antes de pasar a producción.
- Maquetas de escenas con posiciones fijas: especificando cajas delimitadoras para cada objeto (producto, fondo, texto) se obtienen composiciones reproducibles, útil para catálogos de e-commerce donde el producto debe ocupar una región concreta del encuadre.
- Generación de assets para videojuegos y prototipos de interfaz: escenas con elementos distribuidos según un layout predefinido, reutilizando el mismo JSON con variaciones de estilo en el prompt de lenguaje natural.
- Investigación en control espacial: el modelo sirve como referencia abierta para estudiar hasta qué punto un DiT de 5B respeta restricciones de layout expresadas en JSON, comparándolo con aproximaciones basadas en ControlNet o en atención espacial.
- Procesamiento por lotes en pipelines de contenido: al caber en una GPU de consumo y requerir pocos pasos, es viable generar lotes grandes de imágenes de relleno, fondos o ilustraciones para un CMS sin depender de APIs externas.
- Localización de material gráfico: adaptar una misma composición a versiones en inglés y en chino cambiando únicamente el texto del layout, manteniendo posiciones y estilo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio ni los resultados de búsqueda proporcionados incluyen cifras de GenEval, T2I-CompBench, FID, CLIP-score ni de evaluaciones de fidelidad de texto renderizado. Tampoco se documenta ninguna comparación cuantitativa entre esta fusión de 4 pasos y el checkpoint SFT original, por lo que no es posible determinar la degradación introducida por la destilación turbo.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: los pesos ocupan 9,47 GB, por lo que se necesita un mínimo de 12 GB de VRAM contando activaciones y el codificador de texto; 16 GB es un valor cómodo y 24 GB permite trabajar con resolución alta y lotes mayores. Son estimaciones, no cifras publicadas por el autor.
- Cuantización: al no distribuirse variantes fp8 ni GGUF en este repositorio, no hay una ruta oficial para reducir por debajo de los 9,47 GB de pesos; ComfyUI puede aplicar cuantización fp8 en carga, pero no está documentado para este archivo concreto.
- GPU recomendadas: RTX 4090 (24 GB) y RTX 3090 (24 GB) como opción de consumo; RTX 4080 (16 GB) y RTX 4070 Ti Super (16 GB) como mínimo razonable; A100, H100 y L40S para despliegue por lotes o servidor.
- ¿Cabe en GPU de consumo? Sí, en tarjetas de 16 GB o más en bf16; en tarjetas de 12 GB requeriría descarga parcial a RAM (offload) y penalización de velocidad.
- Opciones de despliegue: ComfyUI es la vía documentada (nodo de carga de modelo de difusión). No se documenta soporte en vLLM ni TGI, que no aplican a modelos de difusión; llama.cpp/Ollama no soportan esta arquitectura en el repositorio indicado. Diffusers requeriría el código del modelo base MOSS-Image, no incluido en este repositorio.
- Latencia y throughput: no hay mediciones publicadas. La única indicación es que el modelo está pensado para funcionar desde 4 pasos de muestreo, lo que en la práctica supone una reducción del orden de un orden de magnitud frente a schedules de 30-50 pasos, pero sin cifras de segundos por imagen confirmadas.

## Comparativa con modelos similares

Los datos de los modelos comparables provienen de información pública general, no de la documentación aportada, y deben tomarse como referencia orientativa.

| Modelo | Parametros | Contexto / prompt | Control espacial | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BSAI-MOSS-Image-SFT-4steps-turbo-merged (este) | ~5B (DiT) | No aplica; prompt en lenguaje natural o JSON | Layout JSON nativo y cajas en ComfyUI | Apache-2.0 (declarada) | safetensors bf16, un archivo, ComfyUI |
| MOSS-Image-SFT (OpenMOSS, original) | ~5B (DiT) | Igual | Layout JSON nativo | No disponible en la información aportada | Repositorio oficial en Hugging Face |
| FLUX.1-dev | ~12B | Prompt de texto, sin layout nativo | Requiere ControlNet o similares | No comercial (FLUX.1 dev license) | Amplia adopción, ecosistema ComfyUI |
| Qwen-Image | ~20B | Prompt de texto; buen renderizado de texto | No nativo | Apache-2.0 | Ecosistema Diffusers y ComfyUI |
| Stable Diffusion XL | ~2,6B (UNet) + codificadores de texto | Prompt de texto | Requiere ControlNet | CreativeML OpenRAIL++-M | Muy extendido |

La ventaja diferencial de este modelo frente a los anteriores es la combinación de layout nativo, texto bilingüe inglés-chino y un tamaño que cabe en GPUs de consumo; su desventaja es la ausencia de benchmarks publicados y el hecho de ser una redistribución no oficial.

## Limitaciones y advertencias

- Repositorio no oficial: se trata de una fusión y republicación realizada por BassionAI, no por OpenMOSS. En el momento de la consulta tenía 0 descargas y 0 "likes", sin evidencia de validación por parte de la comunidad.
- Procedimiento de fusión no documentado: no se especifica qué pesos turbo/DMD se han combinado, con qué factor, ni si se ha verificado la calidad resultante.
- Sin benchmarks: no hay datos que permitan comparar esta versión de 4 pasos con el modelo SFT original; es esperable una pérdida de fidelidad y de coherencia global al reducir el número de pasos, pero no está cuantificada.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir objetos deformados, anatomías incorrectas y texto mal renderizado, especialmente con cadenas largas o caracteres poco frecuentes.
- Limitación idiomática: solo se declaran inglés y chino; no hay garantía de renderizado correcto de texto en castellano ni en otros alfabetos.
- Dependencia del formato JSON: el control de layout exige ajustarse al esquema esperado por el modelo; prompts mal formados o layouts con objetos solapados pueden producir resultados degenerados.
- Solo bf16: no hay variantes cuantizadas en el repositorio, lo que limita el despliegue en GPUs de menos de 12 GB.
- Licencia: se declara Apache-2.0, pero el propio autor recomienda confirmar los términos del modelo upstream antes de uso comercial o de una nueva redistribución. Apache-2.0 no exime de posibles derechos sobre los datos de entrenamiento.
- Sesgos: los sesgos del dataset de entrenamiento del modelo base (representación de personas, estereotipos culturales, vocabulario visual sesgado hacia contextos anglófonos y sinófonos) se heredan sin que se documenten mitigaciones.
- Adecuación a producción: al no haber mediciones de latencia, throughput ni estabilidad, no se recomienda como dependencia crítica sin una evaluación previa en el caso de uso concreto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/BassionAI/BSAI-MOSS-Image-SFT-4steps-turbo-merged
- Modelo base en Hugging Face: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Página oficial del proyecto MOSS-Image: https://openmoss.ai/MOSS-Image/
- Repositorio GitHub oficial: https://github.com/OpenMOSS/MOSS-Image/tree/main
- Tutorial de ComfyUI para MOSS-Image: https://docs.comfy.org/tutorials/image/moss-image/moss-image
- LoRAs turbo/DMD para MOSS-Image (terceros, Civitai): https://civitai.com/models/3006599/moss-image-turbo-loras
