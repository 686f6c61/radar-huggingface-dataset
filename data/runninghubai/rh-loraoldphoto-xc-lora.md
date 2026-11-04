# RunningHubAI/rh-loraoldphoto-xc-lora

## Resumen

`rh-loraoldphoto-xc-lora` es un adaptador LoRA de edición de imagen publicado por RunningHubAI y atribuido al usuario AIGC清风 de la plataforma RunningHub. No es un modelo base, sino un peso adicional de 164 MiB que se aplica sobre un modelo de difusión para imagen-a-imagen condicionado por texto, concretamente sobre un fine-tune de Flux Kontext que el autor denomina "F1基础-Kontext". Su función es muy específica: restaurar fotografías antiguas eliminando arañazos, manchas de moho, polvo y pliegues, preservando estrictamente los rasgos faciales, la composición y la tonalidad vintage original, sin colorear ni modificar la identidad de las personas retratadas.

El modelo resuelve un problema acotado dentro de los flujos de restauración fotográfica: la limpieza física previa a cualquier otro tratamiento. El autor lo plantea explícitamente como el primer paso de un pipeline de dos etapas, donde este LoRA se encarga de la eliminación de daños y un segundo módulo de "alta definición" realiza el reescalado y la mejora posterior. La ficha del repositorio es mínima: no se documentan parámetros, contexto, idiomas ni licencia explícita, y el repositorio no registra descargas ni interacciones en el momento de la consulta.

Por su naturaleza, la ficha se centra en los datos verificables del repositorio y de la model card, y marca como "no disponible" todo aquello que el autor no ha publicado. Es relevante ahora porque ejemplifica una categoría creciente de LoRAs de nicho distribuidas a través de plataformas de generación como RunningHub, que empaquetan pesos con flujos de trabajo propietarios y una API de ejecución en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusión basado en Flux Kontext (fine-tune "F1基础-Kontext") |
| Parametros totales | no disponible (peso del adaptador: 164 MiB en `oldphoto_xc.safetensors`) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible; el repositorio solo distribuye pesos en safetensors de precisión nativa |
| Idiomas soportados | no disponible; la prompt de activación publicada está en inglés |
| Licencia | no disponible; la model card indica que los derechos permanecen con el autor y remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`oldphoto_xc.safetensors`, 164 MiB) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre un modelo de difusión de la familia Flux Kontext, un transformer de difusión con condicionamiento por texto y por imagen de entrada que permite edición instructiva sobre una imagen dada. El LoRA inyecta matrices de bajo rango en las capas del modelo base para especializarlo en una tarea concreta de restauración; el repositorio no especifica el rango, las capas objetivo ni el número de pasos de entrenamiento.

No se han publicado detalles sobre el dataset de entrenamiento, el número de imágenes utilizadas, la composición de los pares de daño/restauración, ni si se emplearon técnicas de regularización o de preferencia humana. El autor indica únicamente que el modelo se entrenó en la plataforma RunningHub y que parte de "F1基础-Kontext", sin aportar hiperparámetros ni curvas de pérdida. La prompt de activación publicada funciona como instrucción fija de edición: "Restore this old photo: remove all scratches, dust, stains and damage while strictly preserving the facial features and the original vintage tones".

## Capacidades

- Edición de imagen condicionada por texto sobre una imagen de entrada, con instrucción fija de restauración.
- Eliminación de daños físicos en fotografías: arañazos, polvo, manchas de moho y pliegues.
- Preservación de rasgos faciales e identidad de los sujetos retratados.
- Preservación de la tonalidad vintage original, sin colorear ni alterar la paleta.
- Mantenimiento de la composición y el encuadre originales.
- Ejecución sin prompt de usuario: el flujo de trabajo de RunningHub aplica la instrucción de activación de forma automática.
- Integración con ComfyUI y con la API de RunningHub para ejecución en la nube.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo de pensamiento, por tratarse de un adaptador de imagen de propósito único.

## Casos de uso

- Digitalización de archivos familiares: aplicar el LoRA sobre escaneos de fotografías antiguas para eliminar arañazos y moho antes de archivarlas, manteniendo intactos los rostros de los retratados.
- Primer paso de un pipeline de restauración en dos etapas: ejecutar este LoRA para la limpieza física y encadenar después un módulo de alta definición, tal como recomienda el autor.
- Restauración de fondos documentales y hemerotecas: procesar lotes de imágenes históricas con daños superficiales sin alterar la composición ni el tono original, requisito habitual en archivos y museos.
- Servicios de restauración fotográfica para particulares: integrar el adaptador en un flujo de ComfyUI que reciba la imagen del cliente y devuelva una versión limpia antes de la impresión o el reencuadre.
- Preparación de material para impresión o ampliación: eliminar polvo y pliegues antes de un reescalado, evitando que los defectos se amplifiquen en la etapa de alta resolución.
- Automatización vía API en RunningHub: invocar el modelo desde la API de la plataforma para ofrecer restauración por lotes sin gestionar infraestructura de GPU propia.
- Preservación de patrimonio fotográfico local: digitalizar y limpiar colecciones municipales o de asociaciones con un coste de cómputo bajo, dado el reducido tamaño del adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador pesa 164 MiB en safetensors; el requisito real de VRAM lo determina el modelo base Flux Kontext sobre el que se aplica, no el LoRA.
- No se dispone de cifras oficiales de VRAM para el modelo base "F1基础-Kontext"; como referencia de la familia Flux, la inferencia en precisión bf16 requiere GPUs de gama alta con 24 GB o más, y las versiones cuantizadas reducen el requisito.
- GPU recomendadas: no disponibles para este adaptador concreto; para modelos Flux de tamaño completo se suelen emplear A100, H100 o RTX 4090.
- Viabilidad en GPU de consumo: no confirmada por el autor; depende de la cuantización del modelo base.
- Opciones de despliegue: ComfyUI (entorno nativo del LoRA), plataforma RunningHub y su API; no se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, que no aplican a modelos de difusión de imagen en este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros LoRAs de restauración de fotografías antiguas, ya que no se han publicado parámetros, benchmarks ni licencia de este adaptador. A continuación se indican las alternativas de categoría más habituales, sin datos comparativos verificables:

| Modelo | Tipo | Base | Contexto / tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-loraoldphoto-xc-lora | LoRA de restauración | Flux Kontext ("F1基础-Kontext") | Limpieza de daños físicos en fotos antiguas | no disponible | Hugging Face y RunningHub |
| LoRAs de restauración de la comunidad Flux | LoRA de restauración | Flux / Flux Kontext | Limpieza y mejora de fotos | variable según autor | Hugging Face, Civitai |
| Modelos de restauración dedicados (p. ej. GFPGAN, CodeFormer) | Redes específicas de restauración facial | Propia | Reparación de rostros y superresolución | variable | Repositorios públicos |

La comparación directa no es posible con los datos disponibles; se recomienda evaluar el adaptador con un conjunto propio de fotografías dañadas antes de adoptarlo en producción.

## Limitaciones y advertencias

- La licencia no está especificada: la model card remite a la licencia del proyecto original o upstream, por lo que el uso comercial no está garantizado sin consultar al autor.
- El repositorio no registra descargas ni interacciones, lo que impide validar su robustez con evidencia de la comunidad.
- El modelo está diseñado para no colorear ni alterar la identidad; sin embargo, no se han publicado evaluaciones que cuantifiquen la fidelidad facial en casos difíciles.
- No se documentan sesgos conocidos, pero al operar sobre retratos puede heredar los sesgos del modelo base Flux Kontext en cuanto a representación demográfica.
- Riesgo de alucinación visual: en zonas con daños extensos, el modelo puede reconstruir detalles inexistentes; conviene revisar manualmente las restauraciones.
- El autor recomienda encadenar un segundo módulo de alta definición para resultados óptimos, lo que implica un pipeline de dos etapas y no una solución única.
- La prompt de activación está en inglés y no se documenta el comportamiento con instrucciones en otros idiomas.
- Dependencia del modelo base "F1基础-Kontext", cuyos pesos, licencia y requisitos no se detallan en este repositorio.
- No apto para tareas de generación de imagen desde cero ni para edición creativa fuera del ámbito de restauración.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-loraoldphoto-xc-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2096571607891402754
- Página del autor (AIGC清风): https://www.runninghub.cn/user-center/2036071971019825154
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
