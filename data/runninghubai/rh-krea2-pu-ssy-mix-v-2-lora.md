# RunningHubAI/rh-krea2-pu-ssy-mix-v.2-lora

## Resumen

rh-krea2-pu-ssy-mix-v.2-lora es un adaptador LoRA para edición de imágenes (pipeline `image-text-to-image`) publicado por RunningHubAI bajo el alias de autor Katoo0 en RunningHub. No es un modelo de lenguaje ni un modelo fundacional: se trata de un conjunto de pesos de bajo rango (109 MiB, 0,1 GB de repositorio) que se aplica sobre el modelo base krea2 para modificar su comportamiento generativo en ComfyUI, RunningHub o Hugging Face. Su función declarada es la de un LoRA de edición de imagen con efectos estilísticos marcados, controlables mediante un parámetro de fuerza (strength) que el autor recomienda situar entre 0,2 y 1,35, desaconsejando superar 1,40 para evitar efectos "overdriven".

El modelo se distribuye en un único fichero `krea2_gotd_pussymix_2.0.safetensors` y requiere palabras de activación (trigger words) explícitas en el prompt: `goddespussy` y `pussymix`. Su relevancia es limitada y muy específica: sirve a usuarios de ComfyUI que ya trabajan con el ecosistema krea2 y quieren incorporar un estilo concreto sin reentrenar el modelo base. No aporta arquitectura propia, no publica métricas de rendimiento y no declara licencia, idiomas ni parámetros, por lo que su evaluación técnica debe hacerse necesariamente en relación con el modelo base sobre el que opera.

La información disponible es escasa y proviene exclusivamente de la model card del autor y de los metadatos de Hugging Face. Todo dato no declarado se indica como "no disponible" en esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base krea2; no se detalla la arquitectura interna del base |
| Parámetros totales | no disponible (pesos LoRA de 109 MiB; el número de parámetros del adaptador no se declara) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible; la model card indica que el copyright permanece con el autor y remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`krea2_gotd_pussymix_2.0.safetensors`, 109 MiB) |

## Arquitectura y entrenamiento

El artefacto es un LoRA (Low-Rank Adaptation) destinado a la edición de imágenes, afinado a partir de krea2 según declara la model card. No se especifica la arquitectura del modelo base, ni el rango del adaptador, ni las capas afectadas, ni el número de pasos de entrenamiento, ni la composición del dataset. Tampoco se documenta si hubo fases de ajuste fino adicionales, regularización o técnicas de merge con otros adaptadores, aunque el nombre del fichero (`gotd_pussymix_2.0`) y la referencia a un modelo de Civitai sugieren una mezcla de estilos.

La única innovación operativa documentada es el control de intensidad mediante el parámetro de fuerza: el autor indica un rango útil de 0,2 a 1,35 y advierte de que valores superiores a 1,40 producen efectos exagerados. El uso requiere incluir las trigger words `goddespussy` y `pussymix` en el prompt para activar el comportamiento aprendido. No se publican detalles sobre la resolución de entrenamiento, el scheduler utilizado ni el tipo de imágenes de partida.

## Capacidades

- Edición de imágenes condicionada por texto e imagen de entrada (pipeline `image-text-to-image`), aplicando el estilo aprendido sobre el modelo base krea2.
- Activación mediante trigger words: requiere `goddespussy` y `pussymix` en el prompt.
- Control de intensidad del efecto mediante strength ajustable en el rango 0,2-1,35 (el autor desaconseja superar 1,40).
- Integración nativa en ComfyUI como nodo LoRA, y ejecución en las plataformas RunningHub y Hugging Face.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión analítica ni procesamiento de audio o texto: es exclusivamente un adaptador de generación/edición de imagen.
- Capacidades multilingües: no disponibles (no aplica a un LoRA de imagen; el prompt textual depende del codificador del modelo base).

## Casos de uso

- Edición estilística por lotes en ComfyUI: cargar el LoRA con strength entre 0,2 y 1,35 sobre el modelo krea2 y procesar una carpeta de imágenes con un workflow fijo, aplicando el estilo de forma consistente en toda la tanda.
- Exploración de variantes creativas: ajustar el strength dentro del rango recomendado para generar distintas intensidades del mismo efecto sobre una misma imagen de entrada, útil en fases de dirección de arte.
- Prototipado rápido en RunningHub: usar la plataforma online del autor para validar el efecto antes de integrarlo en un pipeline local, sin necesidad de descargar el modelo base.
- Integración en pipelines de generación de contenido para redes: aplicar el adaptador como paso de postprocesado estilístico sobre imágenes base ya generadas, manteniendo el resto del workflow intacto.
- Investigación comparativa de LoRAs: servir como muestra para estudiar cómo un adaptador de 109 MiB modifica el comportamiento de un base concreto y cómo el strength afecta a la fidelidad respecto a la imagen de entrada.
- Automatización vía API de RunningHub: invocar el modelo público referenciado en la model card desde la API para incorporar el efecto en aplicaciones externas sin gestionar infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (FID, CLIP score, SSIM ni comparativas con otros LoRAs), y al tratarse de un adaptador estilístico sobre un base no documentado, no es posible establecer una línea base reproducible.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador de forma aislada; el consumo vendrá determinado por el modelo base krea2, cuyos requisitos no se detallan en la información proporcionada.
- GPU recomendadas: no disponibles. Al ser un LoRA de 109 MiB, el adaptador en sí ocupa una fracción mínima de memoria, pero la inferencia depende enteramente del base.
- Compatibilidad con GPU de consumo: no determinable sin conocer los requisitos del base krea2; el adaptador por sí solo no impone una barrera adicional significativa de memoria.
- Opciones de despliegue: ComfyUI (soporte nativo de LoRA), plataforma RunningHub (online y API) y Hugging Face. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Base | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-krea2-pu-ssy-mix-v.2-lora | LoRA de edición de imagen | 109 MiB | krea2 | no disponible | Hugging Face, RunningHub, ComfyUI |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros LoRAs comparables en la documentación proporcionada, por lo que no es posible establecer una comparativa técnica con cifras verificables.

## Limitaciones y advertencias

- Licencia no declarada: la model card remite a la licencia del proyecto original o upstream, sin especificarla. El uso comercial queda en un limbo jurídico que debe resolverse consultando al autor o a la licencia de krea2 antes de cualquier despliegue en producción.
- Dependencia total del modelo base: el adaptador no funciona de forma autónoma; cualquier cambio, retirada o actualización de krea2 afecta directamente a su comportamiento.
- Ausencia de métricas: no hay benchmarks ni evaluaciones publicadas, por lo que la calidad del efecto solo puede validarse empíricamente.
- Riesgo de sobreajuste al estilo: el propio autor advierte de efectos exagerados con strength superior a 1,40, lo que indica un comportamiento no lineal y potencialmente inestable fuera del rango recomendado.
- Contenido sensible: las trigger words y la referencia a Civitai sugieren un LoRA orientado a contenido adulto o explícito; debe revisarse el cumplimiento de las políticas de contenido de la plataforma de despliegue y la normativa aplicable.
- Idiomas no declarados: no se especifica el comportamiento del prompt textual en distintos idiomas, lo que puede afectar a la reproducibilidad en entornos multilingües.
- Sesgos: no documentados; al no publicarse la composición del dataset de entrenamiento, no es posible evaluar sesgos de representación.
- Riesgo de alucinación visual: como todo modelo generativo de imagen, puede producir artefactos o alteraciones no solicitadas respecto a la imagen de entrada, especialmente en los límites del rango de strength.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-krea2-pu-ssy-mix-v.2-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2098791789724434434
- Página del autor en RunningHub: https://www.runninghub.ai/user-center/2040579212557164545
- Referencia en Civitai: https://civitai.red/models/2914781/krea2-pussy-mix?modelVersionId=3319857
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
