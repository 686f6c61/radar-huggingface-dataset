# RunningHubAI/rh-anima-preview-rdbt-finetuned-cfg-distilled-v0.19b-lora

## Resumen

`rh-anima-preview-rdbt-finetuned-cfg-distilled-v0.19b-lora` es un adaptador LoRA publicado por RunningHubAI (autor acreditado como @子羽 en la plataforma RunningHub) para ComfyUI y el ecosistema de RunningHub. No se trata de un modelo de lenguaje, sino de un artefacto de ajuste fino de bajo rango (77 MiB en un único `.safetensors`) que se aplica sobre un modelo base de difusión denominado `anima`, en su variante `anima_preview_rdbt_finetuned_cfg_distilled_v0.19b`.

La model card lo describe como un LoRA de refuerzo de detalle (细节增强) sobre un modelo base que ya incorpora dos técnicas: ajuste fino adicional (`finetuned`) y destilación de CFG (`cfg_distilled`). La destilación de CFG permite reducir o eliminar la necesidad de classifier-free guidance negativa, lo que abarata la inferencia por paso; el LoRA añadiría granulación y definición sobre ese comportamiento ya destilado. Se desconoce, sin embargo, la arquitectura, el tamaño y la procedencia del modelo base `anima`.

Su relevancia es acotada y de nicho: es un artefacto de producción para flujos de generación de imagen en ComfyUI, distribuido con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada y con metadatos de creación anómalos (fecha 2026-10-19). No hay información pública sobre dataset, hiperparámetros de entrenamiento ni evaluación, por lo que debe tratarse como un recurso no verificado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo base de difusión denominado `anima`; arquitectura del modelo base no disponible |
| Parametros totales | No disponible (no se publica el rango, el número de módulos adaptados ni el recuento de parámetros del adaptador) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica / no disponible (artefacto de generación de imagen, no de texto) |
| Tipos de cuantizacion | No disponible; el único peso publicado es `safetensors` sin indicación de precisión (fp16/bf16/fp32) |
| Idiomas soportados | No disponible (no se documenta el tokenizador ni los idiomas de los prompts del modelo base) |
| Licencia | No disponible; la model card remite a «la licencia del proyecto original o del upstream», sin identificarla |
| Formato de pesos | `safetensors` (archivo `anima_preview_rdbt_finetuned_cfg_distilled_v0.19b.safetensors`, 77 MiB) |
| Tipo de artefacto | Adaptador LoRA para ComfyUI / RunningHub |
| Modelo base | `anima_preview_rdbt_finetuned_cfg_distilled_v0.19b` (finetuned from: `anima`) |
| Autor | RunningHub-[@子羽] |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion | 2026-10-19 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en capas del modelo base para modificar su comportamiento sin reentrenar los pesos completos. El nombre del archivo revela la cadena de procedencia: se parte de `anima`, se aplica un ajuste fino (`finetuned`) que da lugar a la variante `v0.19b`, se destila el CFG (`cfg_distilled`) y finalmente se entrena este LoRA sobre ese checkpoint. El prefijo `preview` y la versión `v0.19b` sugieren una iteración temprana y no una release estable.

No se dispone de información sobre el número de tokens o imágenes de entrenamiento, la composición del dataset, el rango del LoRA, la tasa de aprendizaje, la resolución de entrenamiento ni si hubo etapas de preferencias (RLHF/DPO). La model card tampoco documenta la arquitectura del modelo base: no puede confirmarse si es un UNet convolucional clásico, un transformer de difusión (DiT) o un modelo híbrido, ni su número de parámetros o resolución nativa. La única innovación técnica inferible del nombre es la destilación de CFG del checkpoint base, que típicamente reduce el coste por paso al evitar la doble evaluación por paso necesaria para el guidance negativo, pero su implementación concreta no está publicada.

## Capacidades

- Generación y refinado de imágenes mediante difusión, heredadas del modelo base `anima` (no documentadas explícitamente).
- Refuerzo de detalle fino sobre el resultado del modelo base, según la descripción del autor (细节增强).
- Aplicación como módulo adicional en flujos de ComfyUI, cargable junto al checkpoint base.
- Uso potencial con CFG reducido o desactivado en el muestreo, si se explota la propiedad `cfg_distilled` del base.
- Compatibilidad con la plataforma RunningHub y su API para ejecución remota.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, matemáticas ni visión como entrada: no es un modelo lingüístico.
- Capacidades multilingües: no disponible; dependen por completo del codificador de texto del modelo base, no documentado.
- No se documentan modos especiales (thinking, audio, vídeo) para este adaptador.

## Casos de uso

- Refinado de detalle en ilustración digital: cargar el LoRA sobre el checkpoint `anima` en ComfyUI con un peso moderado (típicamente 0,5-0,8, valor a calibrar empíricamente) para aumentar la definición de texturas, cabello y materiales en la pasada final de un pipeline de dos etapas.
- Pipelines de generación rápida con CFG destilado: al partir de un base `cfg_distilled`, el flujo puede operar con menos pasos y sin guidance negativa, lo que reduce el tiempo por imagen en entornos de producción con GPU limitada.
- Prototipado de estilos sobre un mismo base: al ser un LoRA de 77 MiB, permite mantener varias variantes en disco y alternarlas por prompt sin duplicar el coste de almacenamiento del checkpoint completo.
- Integración en la API de RunningHub para generación por lotes sin infraestructura propia: útil para equipos que delegan el cómputo y solo necesitan referenciar el identificador del modelo.
- Comparación A/B de variantes de ajuste fino: al tener un identificador versionado (`v0.19b`), sirve para contrastar el efecto del LoRA frente al base sin LoRA en una misma semilla y prompt.
- Docencia y experimentación con LoRA en ComfyUI: su tamaño reducido lo hace manejable para demostrar cómo se comporta un adaptador de detalle sobre un modelo ya destilado en CFG.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (FID, CLIP score, ImageReward), comparaciones visuales con el base sin LoRA, ni mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM para inferencia: no disponible. El LoRA en sí ocupa 77 MiB, pero el consumo real lo determina el checkpoint base `anima`, cuyas dimensiones y resolución nativa no están documentadas.
- GPU recomendadas: no disponible por ausencia de datos del modelo base; en la práctica, cualquier GPU capaz de ejecutar el checkpoint base en ComfyUI.
- Viabilidad en GPU de consumo: no confirmable. Un adaptador de 77 MiB es compatible con tarjetas de 8-24 GB solo si el base lo es; sin conocer el base no puede afirmarse.
- Opciones de despliegue: ComfyUI (soporte nativo de LoRA), plataforma RunningHub y su API. No hay evidencia de soporte en vLLM, TGI, llama.cpp u Ollama, que son motores de texto y no aplican a este artefacto.
- Latencia y throughput: no disponibles; dependen del sampler, número de pasos, resolución y GPU, además del efecto de la destilación de CFG del base.
- Almacenamiento: ~77 MiB para el adaptador, más el peso completo del checkpoint base (no disponible).

## Comparativa con modelos similares

No se dispone de datos verificables de alternativas concretas: no se ha identificado públicamente el modelo base `anima`, por lo que no es posible emparejarlo con adaptadores LoRA comparables en parámetros, contexto o rendimiento. Los únicos ejes de comparación objetivos disponibles son los del propio repositorio:

| Eje | Este modelo | Alternativa comparable |
|---|---|---|
| Tipo de artefacto | LoRA para ComfyUI | No disponible |
| Modelo base | `anima_preview_rdbt_finetuned_cfg_distilled_v0.19b` | No disponible (base no identificado) |
| Tamano del adaptador | 77 MiB | No disponible |
| Contexto / resolucion | No disponible | No disponible |
| Rendimiento medido | Sin benchmarks publicados | No disponible |
| Licencia | No declarada | No disponible |
| Disponibilidad | HuggingFace + RunningHub, 0 descargas | No disponible |

## Limitaciones y advertencias

- Ausencia total de licencia identificable: la model card solo indica que se siga «la licencia del proyecto original o del upstream», sin nombrarla. Uso comercial no verificable; requiere contactar con el autor o con el titular del base `anima`.
- Modelo base no documentado ni identificado: sin arquitectura, tamaño ni resolución, es imposible planificar requisitos de hardware o evaluar riesgos de reproducibilidad.
- Sin datos de entrenamiento: se desconoce el dataset, su procedencia y sus posibles sesgos demográficos, estilísticos o culturales. El riesgo de sesgo heredado del base es, por tanto, no evaluable.
- Riesgo de alucinación visual y artefactos: como todo modelo de difusión, puede generar anatomías incorrectas, texto ilegible y detalles incoherentes; el refuerzo de detalle del LoRA puede amplificar artefactos si se aplica con peso alto.
- Naturaleza `preview` y versión `v0.19b`: indica un artefacto inmaduro, sujeto a cambios y sin garantías de estabilidad entre iteraciones.
- Metadatos anómalos: la fecha de creación registrada (2026-10-19) es posterior a la fecha habitual de consulta, lo que sugiere un problema de sellado temporal o de la propia plataforma; conviene no tratar el dato como fiable.
- Señales de adopción nulas: 0 descargas y 0 likes implican ausencia de validación comunitaria, de issues públicos y de retroalimentación sobre calidad.
- Sin evaluación objetiva: no hay métricas, comparaciones con el base sin LoRA ni guía de pesos recomendados; el ajuste del scale del LoRA es puramente empírico.
- Dependencia del ecosistema RunningHub: parte de los enlaces de la model card son de promoción y la ejecución «oficial» se plantea en su plataforma, lo que puede introducir dependencia de un proveedor externo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RunningHubAI/rh-anima-preview-rdbt-finetuned-cfg-distilled-v0.19b-lora
- README en chino: https://huggingface.co/RunningHubAI/rh-anima-preview-rdbt-finetuned-cfg-distilled-v0.19b-lora/blob/main/README_cn.md
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2097514453561597953
- Perfil del autor (@子羽): https://www.runninghub.cn/user-center/2000544920995774466
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- Llamada a la API: https://www.runninghub.ai/call-api
- Seedance 2.5 vía API (enlace promocional de la model card): https://www.runninghub.ai/call-api/api-detail/2133100000000700025
