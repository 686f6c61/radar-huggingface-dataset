# RunningHubAI/rh-qwen2511nsfw-lora

## Resumen

rh-qwen2511nsfw-lora es un adaptador LoRA de edición de imagen publicado por RunningHubAI (RunningHub) para flujos de trabajo de ComfyUI. No es un modelo completo, sino un conjunto de pesos de bajo rango que se aplica sobre un modelo base de edición de imagen de la familia Qwen-Image-Edit 2511, según se deduce del nombre del repositorio y del nombre del archivo distribuido. El pipeline declarado en HuggingFace es image-text-to-image, es decir, edición o generación de imágenes guiada por texto e imagen de entrada.

El adaptador está especializado en contenido para adultos (NSFW): el propio nombre del archivo, `Qwen_Image_Edit_2511_All_included_with_extra_gay_v2.0.safetensors`, y el enlace al proyecto original en Civitai indican que se trata de un ajuste orientado a este tipo de material. El repositorio ocupa 0,8 GB en total y el único archivo de pesos pesa 810 MiB, lo que es coherente con un LoRA y no con un modelo completo.

Su relevancia es limitada y muy específica: no aporta innovaciones de arquitectura ni benchmarks publicados, y su interés se circunscribe a creadores que ya trabajan con Qwen-Image-Edit 2511 en ComfyUI o en la plataforma RunningHub y quieren añadir un estilo o dominio concreto. En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 likes, y no declara licencia explícita.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (low-rank adaptation) sobre un modelo de difusión de edición de imagen; arquitectura del modelo base no detallada en la información disponible |
| Parámetros totales | no disponible (el repositorio solo declara el tamaño del archivo de pesos: 810 MiB) |
| Longitud de contexto | no aplica (modelo de imagen, no de lenguaje) |
| Tipos de cuantización | no disponible; se distribuye un único archivo safetensors con precisión no declarada |
| Idiomas soportados | no disponible (las indicaciones de texto dependen del modelo base Qwen-Image-Edit 2511) |
| Licencia | no disponible de forma explícita; la model card indica que el copyright permanece en el autor y que debe seguirse la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`Qwen_Image_Edit_2511_All_included_with_extra_gay_v2.0.safetensors`) |
| Modelo base | Qwen-Image-Edit 2511 (deducido del nombre del repositorio y del archivo; no confirmado en la model card, que menciona "Finetuned from: krea2") |
| Tipo de tarea | image-text-to-image |
| Tamaño del repositorio | 0,8 GB |
| Plataformas compatibles | ComfyUI, RunningHub, Hugging Face |
| Autor | RunningHub (@氛围感) |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-27T13:49:03Z (según metadatos de HuggingFace) |
| Última actualización | 2026-09-27T13:50:01Z (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del adaptador más allá de su naturaleza LoRA y su función de edición de imagen. Un LoRA de este tipo se compone de matrices de bajo rango que se inyectan en capas concretas del modelo base (habitualmente en los bloques de atención), de modo que el modelo congelado conserva sus capacidades generales y el adaptador desplaza su comportamiento hacia el dominio o estilo aprendido. El archivo único de 810 MiB es consistente con este esquema.

No se especifican datos de entrenamiento: ni volumen de imágenes, ni composición del dataset, ni número de pasos, ni si se emplearon técnicas de alineación como RLHF o DPO (poco habituales en modelos de difusión de imagen). La model card únicamente indica "Finetuned from: krea2", una referencia ambigua que no se corresponde con el nombre del repositorio y que no está aclarada en la documentación. Tampoco se documentan innovaciones técnicas destacables como decodificación especulativa, atención lineal u otros mecanismos. En resumen: la ficha técnica del autor es puramente administrativa y no aporta información reproducible sobre el proceso de entrenamiento.

## Capacidades

- Edición de imágenes guiada por texto e imagen de entrada (pipeline image-text-to-image), aplicando el estilo y el dominio aprendidos por el adaptador.
- Especialización en contenido para adultos: el ajuste está orientado explícitamente a material NSFW, incluyendo contenido gay según el nombre del archivo.
- Integración como capa adicional en flujos de ComfyUI, cargando el safetensors junto con el modelo base correspondiente.
- Ejecución en la plataforma RunningHub, que ofrece tanto uso en la nube como API.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no documentadas; dependen íntegramente del modelo base y de su codificador de texto.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; la única modalidad declarada es la de edición de imagen.

## Casos de uso

- Ilustración adulta en flujos ComfyUI: el adaptador se carga sobre Qwen-Image-Edit 2511 para transformar o retocar imágenes de referencia con un estilo concreto, dentro de un pipeline de nodos que controla el prompt, la máscara de edición y la fuerza del LoRA.
- Creación de variaciones de personaje en proyectos de arte digital: al aplicar el LoRA sobre una imagen base se pueden obtener versiones alternativas manteniendo rasgos consistentes, útil para ilustradores que trabajan con series de personajes.
- Red-teaming y evaluación de moderación de contenido: el adaptador permite generar muestras NSFW de forma controlada para probar clasificadores, filtros y políticas de moderación en plataformas, siempre en un entorno aislado y con las garantías legales correspondientes.
- Automatización por lotes vía API: la model card enlaza la API de RunningHub, lo que permite encadenar peticiones de edición de imagen en un servicio externo sin gestionar la infraestructura de GPU.
- Investigación sobre sesgos estéticos y representación: al ser un ajuste especializado, sirve para estudiar cómo un LoRA desplaza la distribución de salidas del modelo base en categorías concretas (por ejemplo, diversidad corporal o de rasgos).
- Prototipado rápido de estilos antes de un entrenamiento mayor: dado su tamaño reducido (810 MiB), es un candidato cómodo para validar una dirección estilística antes de invertir en un fine-tuning completo.
- Fusi�ón o mezcla de adaptadores: al ser un safetensors estándar, puede combinarse con otros LoRA de la misma familia en herramientas que soporten merge de pesos, aunque los resultados no están documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (FID, CLIP score, SSIM ni comparativas humanas) ni tampoco cifras de latencia o throughput. Cualquier valor que se atribuya a este adaptador sin una evaluación propia no estaría respaldado por la documentación del autor.

## Requisitos de hardware

- El adaptador ocupa 810 MiB en disco y un repositorio total de 0,8 GB, por lo que el almacenamiento no es un obstáculo en ningún equipo actual.
- La VRAM necesaria en inferencia la determina el modelo base Qwen-Image-Edit 2511, cuyas especificaciones no se detallan en la información proporcionada; el LoRA añade un consumo marginal sobre esa base. No es posible dar una cifra fiable de VRAM sin conocer el modelo base y la precisión de carga.
- GPU recomendadas: no disponibles. Al no declararse el modelo base ni la precisión, no se puede afirmar qué tarjetas (A100, H100, RTX 4090 u otras) son suficientes.
- Compatibilidad con GPU de consumo: no confirmada. Depende enteramente del modelo base y de si se aplican cuantizaciones o técnicas de ahorro de memoria en ComfyUI.
- Opciones de despliegue: ComfyUI (plataforma principal declarada), RunningHub (nube y API del propio autor) y descarga de pesos desde Hugging Face para uso local.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño del repositorio | Modelo base | Licencia | Descargas / likes | Disponibilidad |
|---|---|---|---|---|---|---|
| rh-qwen2511nsfw-lora | LoRA de edición de imagen (NSFW) | 0,8 GB (pesos: 810 MiB) | Qwen-Image-Edit 2511 (deducido) | no disponible | 0 / 0 | Hugging Face, RunningHub, ComfyUI |
| rh-qwen2511-lora | LoRA de edición de imagen | 1,78 GB | Qwen-Image-Edit 2511 (deducido) | no disponible | 0 / 0 | Hugging Face, RunningHub, ComfyUI |
| rh-qwen2511v2.0-lora | LoRA de edición de imagen | 473 MB | Qwen-Image-Edit 2511 (deducido) | no disponible | 0 / 0 | Hugging Face, RunningHub, ComfyUI |
| Qwen-Image-Edit 2511 NSFW (Civitai, versión 3160956) | Modelo o adaptador original en Civitai | no disponible | Qwen-Image-Edit 2511 | no disponible | no disponible | Civitai |

No se dispone de datos de rendimiento comparativo entre estas variantes, por lo que la comparación se limita a tipo de artefacto, tamaño, licencia y disponibilidad.

## Limitaciones y advertencias

- Contenido para adultos: el adaptador está diseñado explícitamente para generar material NSFW. Su uso exige verificación de edad, cumplimiento de la legislación aplicable en cada jurisdicción y medidas de control de acceso en cualquier despliegue.
- Riesgo de contenido no consentido: como cualquier modelo de edición de imagen, puede emplearse para manipular la imagen de personas reales. Su uso para generar material íntimo no consentido es ilegal en la Unión Europea y en muchas otras jurisdicciones.
- Licencia no disponible: la model card no especifica una licencia concreta y remite a la del proyecto original o upstream. Esto genera incertidumbre jurídica para uso comercial; conviene contactar con el autor o con RunningHub antes de explotarlo en producción.
- Ausencia total de benchmarks: no hay métricas que respalden la calidad del ajuste ni comparaciones con alternativas.
- Documentación técnica insuficiente: no se indican datos de entrenamiento, hiperparámetros, número de pasos, resolución nativa ni composición del dataset.
- Ambigüedad sobre el modelo base: el nombre apunta a Qwen-Image-Edit 2511, pero la model card afirma "Finetuned from: krea2". Sin aclaración del autor, existe riesgo de cargar el adaptador sobre una base incompatible y obtener resultados degradados.
- Idiomas no declarados: el comportamiento con prompts en castellano no está verificado; dependerá del codificador de texto del modelo base.
- Metadatos poco fiables: las fechas de creación y actualización del repositorio (2026) resultan anómalas y sugieren un posible error de metadatos, lo que resta credibilidad al resto de la información administrativa.
- Adopción nula: 0 descargas y 0 likes implican ausencia de validación por parte de la comunidad, sin casos de uso probados ni retroalimentación pública.
- Sin soporte de texto, razonamiento ni tool calling: es un adaptador de imagen, no un modelo de lenguaje; no debe evaluarse con métricas tipo MMLU o HumanEval.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-qwen2511nsfw-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2080793017488826369
- Proyecto de origen en Civitai (Qwen Image Edit 2511 NSFW, versión 3160956): https://civitai.red/models/2700552/qwen-image-edit-2511-nsfw-all-inclusive-with-extra-gay?modelVersionId=3160956
- Página del autor en RunningHub: https://www.runninghub.ai/user-center/2041030036219498497
- Plataforma RunningHub: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Variante relacionada rh-qwen2511-lora: https://huggingface.co/RunningHubAI/rh-qwen2511-lora
- Variante relacionada rh-qwen2511v2.0-lora: https://huggingface.co/RunningHubAI/rh-qwen2511v2.0-lora
- README en chino del repositorio: https://huggingface.co/RunningHubAI/rh-qwen2511nsfw-lora/blob/main/README_cn.md
