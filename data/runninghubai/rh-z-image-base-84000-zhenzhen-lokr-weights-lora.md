# RunningHubAI/rh-z-image-base-84000-zhenzhen-lokr-weights-lora

## Resumen

`rh-z-image-base-84000-zhenzhen-lokr-weights-lora` es un adaptador LoRA de texto a imagen publicado por RunningHubAI, pensado para cargarse sobre el modelo base Z-Image-base (familia de generación de imágenes de Alibaba, según la model card del adaptador hermano `rh-z-imagebase-lora`). El adaptador se distribuye en un único fichero `safetensors` de 734 MiB y está etiquetado para su uso en ComfyUI, RunningHub y Hugging Face. Su función es inyectar un estilo o concepto concreto —activado por la palabra disparadora `zhenzhen`— sobre las capacidades del modelo base, sin necesidad de reentrenar este último.

El nombre del repositorio sugiere un checkpoint de entrenamiento en el paso 84000 (`84000`) y una variante de pesos de tipo LoKr (`lokr-weights`), aunque la model card no documenta ni el número de pasos, ni el rango, ni la configuración de entrenamiento. El autor declarado es el usuario `@T8star-Aix` dentro de la plataforma RunningHub, y la publicación en Hugging Face la realiza la organización RunningHubAI en su nombre.

La relevancia práctica es acotada: se trata de un adaptador de estilo de nicho, sin métricas publicadas y con cero descargas en el momento de la consulta. Resulta útil para quien ya trabaje con Z-Image-base en ComfyUI y quiera reproducir el estilo asociado a `zhenzhen`; no es un modelo autónomo ni sustituye al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la del modelo base Z-Image-base; no documentada en la model card) |
| Parametros totales | no disponible (adaptador LoRA; fichero de 734 MiB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de texto a imagen) |
| Tipos de cuantizacion | no disponible; pesos distribuidos en `safetensors` (presumiblemente fp16/bf16, no confirmado) |
| Idiomas soportados | no disponible (los prompts dependen del modelo base) |
| Licencia | no disponible; la model card remite a la licencia del proyecto original o upstream |
| Formato de pesos | `safetensors` (LoRA, `z-image-base-84000-zhenzhen-lokr_weights.safetensors`, 734 MiB) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del adaptador más allá de su naturaleza LoRA/LoKr sobre Z-Image-base. El nombre del fichero indica pesos de tipo LoKr (variante de descomposición de bajo rango con factorización tipo Kronecker), pero la model card no confirma esta interpretación ni detalla rangos, módulos objetivo ni hiperparámetros. Tampoco se documentan el número de imágenes de entrenamiento, la composición del dataset, el uso de regularización, ni si hubo curación o filtrado de datos.

El identificador `84000` sugiere un checkpoint intermedio o final en el paso 84000 de entrenamiento, pero no hay confirmación oficial. No se han publicado detalles sobre el proceso de entrenamiento, la resolución de las imágenes de entrenamiento, el scheduler utilizado ni el coste computacional. Cualquier afirmación adicional sobre el entrenamiento sería especulativa.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) cuando se carga junto al modelo base Z-Image-base.
- Aplicación de un estilo o concepto concreto mediante la palabra disparadora `zhenzhen`.
- Integración en flujos de trabajo de ComfyUI como nodo LoRA.
- Compatibilidad declarada con la plataforma RunningHub (carga directa y ejecución en la nube).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: no aplica a un adaptador de imagen.
- Capacidades multilingües: no disponibles; dependen del tokenizador y del codificador de texto del modelo base.

## Casos de uso

- Generación de retratos o escenas con el estilo `zhenzhen` en ComfyUI: cargar el LoRA con un peso moderado (por ejemplo, 0,6–0,9) sobre Z-Image-base y usar la palabra disparadora en el prompt positivo para reproducir el estilo entrenado.
- Prototipado rápido de conceptos visuales: útil para equipos de diseño que quieran explorar una estética concreta antes de invertir en un entrenamiento propio más amplio.
- Creación de material gráfico para redes sociales: banners, ilustraciones y fondos con una identidad visual coherente, siempre que el estilo encaje con la marca.
- Pruebas de comparación de estilos (A/B): evaluar el efecto del LoRA frente al modelo base con la misma semilla y prompt para medir la deriva estilística.
- Integración en pipelines de generación por lotes vía API de RunningHub: automatizar la producción de imágenes con este estilo sin gestionar infraestructura propia.
- Docencia y experimentación con LoRA: ejemplo práctico de adaptación de bajo rango sobre un modelo de difusión, útil para talleres de fine-tuning.
- Generación de referencias visuales para moodboards: obtener variaciones estilísticas rápidas que sirvan como punto de partida para un brief creativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; el adaptador añade 734 MiB en disco y un incremento marginal de VRAM sobre el modelo base Z-Image-base. El requisito dominante es el del modelo base, no documentado en esta ficha.
- GPU recomendadas: no disponibles para este adaptador; dependen del modelo base. Para modelos de difusión de tamaño comparable se suele recomendar al menos 8–12 GB de VRAM en consumer y 24 GB o más para resoluciones altas y lotes.
- ¿Cabe en GPU consumer? No confirmado. El adaptador en sí es ligero, pero la viabilidad depende del modelo base y de la resolución de generación.
- Opciones de despliegue: ComfyUI (declarado), plataforma RunningHub (declarado) y Hugging Face (alojamiento). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-z-image-base-84000-zhenzhen-lokr-weights-lora | LoRA text-to-image sobre Z-Image-base | no disponible (734 MiB) | no aplica | no disponible | Hugging Face, RunningHub, ComfyUI |
| RunningHubAI/rh-z-imagebase-lora | LoRA text-to-image sobre Z-Image-base (estilo guofeng oriental) | no disponible | no aplica | no disponible | Hugging Face, RunningHub |
| Modelo base Z-Image-base | Modelo de difusión text-to-image | no disponible | no aplica | no disponible | Referenciado como upstream |

No se dispone de datos de rendimiento comparativo entre estos adaptadores; la comparación se limita a tipo, formato y plataforma de distribución.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un adaptador de estilo, puede heredar los sesgos del modelo base y del dataset de entrenamiento, que no se describe.
- Riesgo de alucinación visual: como todo modelo generativo de imagen, puede producir anatomías incorrectas, texto ilegible o artefactos, especialmente con pesos LoRA altos.
- Limitaciones de contexto e idioma: no disponibles; la calidad con prompts en castellano depende del codificador de texto del modelo base.
- Restricciones de licencia: la licencia no está especificada. La model card indica que se siga la licencia del proyecto original o upstream; antes de un uso comercial es imprescindible verificar la licencia de Z-Image-base y del adaptador en la página original de RunningHub.
- Dependencia del modelo base: el adaptador no funciona de forma autónoma; requiere Z-Image-base y la versión compatible de ComfyUI o del entorno de RunningHub.
- Reproducibilidad: sin documentación de semillas, pasos ni escala recomendada del LoRA, los resultados pueden variar entre configuraciones.
- Madurez: cero descargas y cero likes en el momento de la consulta; sin validación comunitaria ni informes de uso en producción.
- Advertencia de nombre: el identificador `lokr-weights` sugiere LoKr, pero no está confirmado; verificar la compatibilidad del cargador LoRA antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-z-image-base-84000-zhenzhen-lokr-weights-lora
- Página original del modelo en RunningHub: https://www.runninghub.cn/model/public/2018764095255744513
- Página del autor en RunningHub: https://www.runninghub.cn/user-center/1819214514410942465
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API de RunningHub (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- Adaptador hermano (referencia de la familia Z-Image-base): https://huggingface.co/RunningHubAI/rh-z-imagebase-lora
