# cyankiwi/GLM-5.3-Flash-AWQ-INT4

## Resumen

GLM-5.3-Flash es el primer modelo nativamente multimodal de la serie GLM-5, desarrollado por Z.ai (zai-org). Se trata de un modelo de arquitectura híbrida que combina atención dispersa y atención lineal, con un total de 320.000 millones de parámetros y solo 18.000 millones activos por token (esquema Mixture-of-Experts). Su objetivo es reducir drásticamente el coste de servicio en contextos largos manteniendo capacidades de razonamiento, código y agentes, acercándose según el autor a Claude Opus 4.8 en benchmarks de programación y tareas agénticas.

La ficha que nos ocupa, sin embargo, no es el modelo original, sino una cuantización AWQ INT4 publicada por el usuario cyankiwi bajo el identificador `cyankiwi/GLM-5.3-Flash-AWQ-INT4`. Es un checkpoint mixto que combina esquemas compressed-tensors INT4, FP8-block y BF16 por módulo, lo que reduce el peso del repositorio a 197,19 GB frente a los 410 GB del repo completo, y que requiere un fork específico de vLLM para cargarse. Los pesos en safetensors suman 56.736.897.886 parámetros, un dato que no coincide con los 320B declarados por el autor del modelo base y que conviene tratar con cautela.

Es relevante ahora porque permite desplegar en hardware más modesto un modelo multimodal de gama alta con licencia MIT, algo poco habitual en esta franja de tamaño, y porque su calibración está orientada a cargas STEM y agénticas, que son precisamente los casos de uso donde el modelo base se posiciona.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención dispersa y lineal, MoE y Manifold-Constrained Hyper-Connections (mHC); tipo `glm5_next` |
| Parametros totales | 320B declarados por el autor del modelo base; 56.736.897.886 en los safetensors de este checkpoint (dato no coincidente) |
| Parametros activos | 18B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ INT4 con mezcla de esquemas compressed-tensors INT4, FP8-block y BF16 por módulo |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

GLM-5.3-Flash parte de un modelo base entrenado desde cero, con una arquitectura rediseñada en torno a eficiencia y capacidad. Introduce por primera vez en la serie GLM una combinación de atención dispersa y atención lineal, pensada para abaratar el coste de servicio en contextos largos sin sacrificar precisión en la recuperación de información lejana. A ello se suma Manifold-Constrained Hyper-Connections (mHC), un mecanismo orientado a mejorar la eficiencia de escalado. El modelo es MoE, con 320B parámetros totales y 18B activos por token, y es nativamente multimodal (pipeline `image-text-to-text`).

El preentrenamiento se realizó sobre un corpus multimodal de 30 billones (30T) de tokens según la model card del modelo base. No se detalla en la información disponible la composición del dataset, ni si hubo fases de RLHF o DPO, ni el número de tokens de la fase de ajuste. El checkpoint cuantizado ha sido calibrado por cyankiwi con un dataset propio orientado a STEM y cargas agénticas (versión cyankiwi 26.05.01), lo que condiciona el perfil de precisión de la cuantización hacia esos dominios.

## Capacidades

- Generación de texto y razonamiento multimodal: acepta entradas de imagen y texto (pipeline `image-text-to-text`).
- Razonamiento con presupuesto controlable mediante el parámetro `reasoning_effort`, con tres niveles: `low`, `high` y `max` (valor por defecto).
- Código y tareas agénticas: el autor del modelo base lo sitúa cerca de Claude Opus 4.8 en benchmarks de programación y agentes.
- Soporte multilingüe limitado a inglés y chino según los metadatos del modelo.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags de Hugging Face).
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni audio.

## Casos de uso

- Asistentes de código en producción: el modelo puede integrarse en pipelines de revisión y generación de código, y su perfil agéntico encaja con flujos de múltiples pasos; la cuantización INT4 reduce el coste por instancia frente al checkpoint BF16.
- Agentes autónomos con herramientas: la combinación de razonamiento con `reasoning_effort` ajustable permite subir el presupuesto en tareas de planificación y bajarlo en pasos rutinarios, controlando latencia y coste.
- Análisis de documentos técnicos con imágenes: al ser nativamente multimodal, puede procesar diagramas, capturas de pantalla y figuras junto al texto en tareas de soporte a ingeniería.
- Automatización STEM: la calibración del checkpoint está orientada a dominios STEM, lo que lo hace adecuado para asistentes de matemáticas, física o análisis de datos técnicos.
- Atención al cliente bilingüe inglés-chino: cubre conversaciones multi-turno en los dos idiomas soportados, aunque no en castellano.
- Despliegue en infraestructura propia con vLLM: para equipos que necesitan inferencia on-premise con licencia MIT y sin dependencia de API externa, usando el fork de vLLM indicado por el autor de la cuantización.
- Investigación sobre cuantización: como checkpoint de referencia para estudiar el impacto de esquemas mixtos INT4/FP8/BF16 en modelos MoE multimodales.

## Benchmarks y rendimiento

La model card del modelo base incluye una imagen de benchmarks (`bench_53.png`) y afirma que GLM-5.3-Flash supera a GLM-5.2 y se acerca a Claude Opus 4.8 en código y agentes, pero no se proporcionan cifras numéricas en la información disponible.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint pesa 197,19 GB en disco; para inferencia hay que sumar caché KV y activaciones, por lo que se necesita un nodo multi-GPU. No se dispone de una estimación oficial de VRAM pico.
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño del checkpoint, se requiere un conjunto de GPUs de datacenter (A100/H100 o superiores) y no cabe en una GPU de consumo.
- GPU de consumo: no cabe en ninguna GPU consumer actual, ni siquiera con la cuantización INT4 de este repositorio.
- Despliegue: vLLM mediante el fork `cyankiwi/vllm` (rama `glm53-flash-ct`), ya que vLLM estándar no carga la mezcla de esquemas; el modelo base documenta además SGLang, TokenSpeed, Transformers, KTransformers y Unsloth.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| GLM-5.3-Flash (base) | 320B | 18B | no disponible | MIT | Multimodal, híbrido sparse/linear attention |
| GLM-5.2 | no disponible | no disponible | no disponible | no disponible | Generación anterior de la serie GLM-5; el autor indica que 5.3-Flash lo supera |
| Claude Opus 4.8 | no disponible | no disponible | no disponible | propietaria | Referencia cerrada citada por el autor en código y agentes |
| cyankiwi/GLM-5.3-Flash-AWQ-INT4 | 56,7B en safetensors (dato no coincidente) | no disponible | no disponible | MIT | Cuantización mixta INT4/FP8/BF16 del anterior |

## Limitaciones y advertencias

- Discrepancia de parámetros: los safetensors declaran 56,7B parámetros frente a los 320B del modelo base; conviene verificar la integridad del checkpoint antes de usarlo en producción.
- Compatibilidad rota con vLLM estándar: requiere instalar el fork de cyankiwi, lo que añade riesgo de mantenimiento y de divergencia con upstream.
- Idiomas: solo inglés y chino; no hay soporte declarado de castellano.
- Contexto: la longitud de contexto no está especificada en la información disponible, lo que impide planificar cargas de contexto largo.
- Riesgo de alucinación: no se documentan evaluaciones de factualidad ni tasas de alucinación.
- Sesgos: no se publica información sobre sesgos conocidos ni sobre el proceso de alineación.
- Licencia MIT: permite uso comercial, pero al ser una cuantización de terceros conviene revisar los términos del modelo base y del dataset de calibración.
- Precisión degradada: la cuantización INT4 puede afectar a tareas sensibles a la precisión numérica; la calibración orientada a STEM y agentes puede no representar bien otros dominios.
- Madurez: el repositorio tiene 517 descargas y 12 likes en el momento de la consulta, por lo que la validación comunitaria es escasa.

## Enlaces

- Hugging Face (cuantización): https://huggingface.co/cyankiwi/GLM-5.3-Flash-AWQ-INT4
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Blog de GLM-5.3-Flash: https://z.ai/blog/glm-5.3-flash
- Informe técnico GLM-5 (arXiv:2602.15763): https://arxiv.org/abs/2602.15763
- Documentación de la API Z.ai: https://docs.z.ai/guides/llm/glm-5.3-flash
- Repositorio GLM-5: https://github.com/zai-org/GLM-5
- Fork de vLLM para esta cuantización: https://github.com/cyankiwi/vllm (rama `glm53-flash-ct`)
- Recetas de vLLM: https://recipes.vllm.ai/zai-org/GLM-5.3-Flash
- Cookbook de SGLang: https://cookbook.sglang.io/autoregressive/GLM/GLM-5.3-Flash
- TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#glm-5-3-flash
- Documentación de Transformers (`glm5_next`): https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/glm5_next.md
- Tutorial de KTransformers: https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/kt-kernel/GLM-5.3-Flash-Tutorial.md
- Guía de Unsloth: https://unsloth.ai/docs/models/glm-5.3
- Dataset de calibración: https://huggingface.co/datasets/cyankiwi/calibration
- Web de cyankiwi: https://cyan.kiwi/
- Discord de GLM: https://discord.gg/QR7SARHRxK
