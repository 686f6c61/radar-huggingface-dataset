# RunningHubAI/rh-kook-moss-sft-lora

## Resumen

rh-kook-moss-sft-lora es un adaptador LoRA para generación de imágenes, publicado en HuggingFace por RunningHubAI en nombre del autor KOOK. No se trata de un modelo completo, sino de un conjunto de pesos de bajo rango (un único archivo `KOOK-MOSS-SFT-观澜.safetensors` de 138 MiB) que se aplica sobre el modelo base denominado `moss-image`, del que la model card no ofrece ninguna especificación técnica.

El artefacto está etiquetado para ComfyUI y para la plataforma RunningHub, y la propia model card lo describe como un fine-tuning orientado a «mejora de la textura en datasets de retratos» y a colaboraciones comerciales, aunque sin detallar rango del LoRA, módulos objetivo, dataset ni hiperparámetros de entrenamiento. Su relevancia práctica es la habitual de un LoRA de imagen: ajustar el estilo o la calidad de un modelo base sin necesidad de reentrenarlo ni de cargar pesos adicionales de gran tamaño.

La información pública es muy escasa: cero descargas, cero likes, sin licencia declarada, sin pipeline especificado en HuggingFace, sin idiomas documentados y sin benchmarks. Cualquier evaluación en producción exige verificar por separado la licencia del modelo base `moss-image` y la del propio adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base `moss-image`; no se documenta la arquitectura del modelo base |
| Parametros totales | no disponible (adaptador LoRA; el unico artefacto publicado pesa 138 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagenes); no disponible |
| Tipos de cuantizacion | no disponible; solo se distribuye el safetensors original, sin variantes cuantizadas documentadas |
| Idiomas soportados | no disponible (no se documenta el idioma de los prompts) |
| Licencia | no disponible; la model card remite a la licencia del proyecto original o del modelo upstream y mantiene el copyright en el autor |
| Formato de pesos | safetensors (`KOOK-MOSS-SFT-观澜.safetensors`, 138 MiB) |
| Tipo de artefacto | LoRA (fine-tuning supervisado, segun el sufijo `sft` del nombre) |
| Modelo base | `moss-image` (indicado como «Finetuned from») |
| Plataformas compatibles | ComfyUI, RunningHub, Hugging Face |
| Tamano del repositorio | 0,1 GB |
| Fecha de publicacion | 2026-10-21 (creado y actualizado el mismo dia) |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se suman a los pesos del modelo base `moss-image` en tiempo de carga. No se especifican el rango, el valor de alpha, los módulos objetivo (atención, MLP o ambos) ni el número de pasos de entrenamiento. Tampoco se documenta la arquitectura del modelo base: la model card no indica si es un transformer de difusión, un modelo de flujo o un híbrido, ni su número de parámetros o resolución nativa de entrenamiento.

En cuanto a los datos, la única información disponible es cualitativa: el autor menciona «mejora de la textura en datasets de retratos» y ofrece contacto para «colaboraciones comerciales», lo que sugiere un ajuste orientado a fotorrealismo de piel y detalle en retratos. No hay número de imágenes de entrenamiento, composición del dataset, resolución, técnica de captioning ni si se aplicaron etapas de RLHF o preferencias (conceptos que, por otra parte, no aplican a un LoRA de imagen). La model card indica que el entrenamiento se puede realizar en la plataforma RunningHub, pero no confirma que este adaptador concreto se haya entrenado allí.

## Capacidades

- Generación y modificación de imágenes mediante ComfyUI aplicando el LoRA sobre `moss-image`.
- Ajuste de estilo y calidad: la model card lo presenta como un adaptador para mejorar la textura y el detalle en retratos.
- Integración en flujos de trabajo de nodos de ComfyUI como cargador de LoRA estándar.
- Ejecución en la nube a través de RunningHub, sin necesidad de infraestructura local.
- No soporta tool calling ni function calling.
- No es un modelo de agentes ni de razonamiento multi-paso.
- No genera texto: no hay capacidades de chat, código, matemáticas ni comprensión lectora.
- No se documentan capacidades multilingües en los prompts.
- No se documenta ningún modo especial (thinking, visión, audio); el artefacto es exclusivamente un LoRA de imagen.
- No se documentan modos de inferencia adicionales como control por pose, profundidad o máscaras.

## Casos de uso

- Retratos fotorrealistas en ComfyUI: el adaptador se carga sobre `moss-image` para reforzar el detalle de piel y la textura del rostro, el uso que el propio autor declara en la model card.
- Producción de contenido para redes y catálogos: se integra como nodo LoRA en un grafo de ComfyUI ya existente, de modo que un pipeline de generación por lotes puede añadir el estilo sin cambiar el modelo base.
- Prototipado rápido en la nube: al estar pensado para RunningHub, permite probar el ajuste sin descargar ni alojar el modelo base completo.
- Exploración de estilos para artistas y diseñadores: sirve como variante estilística concreta sobre el modelo base para comparar resultados frente a otras LoRAs en la misma sesión de ComfyUI.
- Generación de datasets sintéticos de retratos: el autor menciona la mejora de textura en datasets de retratos, por lo que puede emplearse para producir imágenes de relleno o aumento de datos con una estética concreta.
- Personalización de un flujo interno de generación de imágenes: al pesar 138 MiB, se puede versionar y desplegar junto al modelo base en un repositorio de artefactos sin un coste de almacenamiento relevante.
- Pruebas de compatibilidad de LoRAs: útil como caso de test para validar que un pipeline de ComfyUI carga correctamente adaptadores externos y aplica la escala esperada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador ocupa 138 MiB en safetensors, por lo que su huella adicional en VRAM es despreciable frente al modelo base.
- La VRAM total necesaria viene determinada íntegramente por `moss-image`, cuyo tamaño, resolución y requisitos no se documentan: no disponible.
- GPU recomendadas: no disponible; depende del modelo base y no hay datos publicados.
- Compatibilidad con GPU de consumo: no se puede confirmar sin conocer los requisitos del modelo base.
- Despliegue: ComfyUI (local) o RunningHub (en la nube). No aplican vLLM, llama.cpp, Ollama ni TGI, que son servidores de inferencia para modelos de lenguaje.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Tamano del adaptador | Contexto | Licencia | Datos publicados |
|---|---|---|---|---|---|---|
| rh-kook-moss-sft-lora | LoRA de imagen | `moss-image` | 138 MiB | no aplica | no disponible | sin benchmarks |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la informacion proporcionada modelos comparables concretos de la misma categoria (LoRAs de retrato o textura para `moss-image`), ni datos de rendimiento de `moss-image` que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia no declarada: la model card solo indica que se sigue la licencia del proyecto original o upstream, por lo que el uso comercial requiere verificar la licencia de `moss-image` y contactar con el autor, que ofrece un contacto explícito para colaboraciones comerciales.
- Ausencia total de documentación técnica: no se conocen rango del LoRA, módulos objetivo, dataset ni hiperparámetros, lo que impide reproducir el entrenamiento o auditar su procedencia.
- Dependencia del modelo base: sin `moss-image` disponible y licenciado, el adaptador es inutilizable.
- Riesgo de sobreajuste al dominio de retratos: al estar orientado a textura de piel y retratos, puede degradar la generación de otros tipos de imagen o introducir un sesgo estético concreto.
- Artefactos de generación: como cualquier LoRA de imagen, puede producir imperfecciones en manos, ojos, texto dentro de la imagen y coherencia anatómica; no hay evaluaciones publicadas que lo cuantifiquen.
- Idiomas de prompt no documentados: no se puede garantizar el comportamiento con prompts en castellano.
- Validación comunitaria nula: cero descargas y cero likes en el momento de la consulta, sin retroalimentación de terceros.
- Contenido promocional en la model card: incluye enlaces de invitación y descargas alojadas en servicios externos (Quark, Baidu) ajenos a HuggingFace; conviene tratarlos con cautela.
- Inconsistencia de fechas: la fecha de creación declarada (2026-10-21) es posterior a la fecha habitual de consulta, lo que puede afectar a la trazabilidad del artefacto.

## Enlaces

- HuggingFace: https://huggingface.co/RunningHubAI/rh-kook-moss-sft-lora
- Model card en chino: https://huggingface.co/RunningHubAI/rh-kook-moss-sft-lora/blob/main/README_cn.md
- Página original del modelo en RunningHub: https://www.runninghub.cn/model/public/2112929373606203394
- Página del autor (KOOK) en RunningHub: https://www.runninghub.cn/user-center/1932028484909178882
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
