# RunningHubAI/rh-wan2.2-i2v-hl-noise-big-breasted-shakes-upper-body-wiggles-upper-body-breasts-move-up-an-lora

## Resumen

Este repositorio contiene un LoRA de generación de vídeo de carácter adulto (NSFW) para los modelos Wan 2.2 en su variante image-to-video (i2v). Lo publica la cuenta RunningHubAI en nombre del autor identificado como @aaronPP, dentro de la plataforma RunningHub, y está pensado para cargarse sobre los expertos HighNoise y LowNoise de Wan 2.2. No es un modelo completo: son dos ficheros de pesos de 293 MiB cada uno (unos 0.6 GB en total) que modifican el comportamiento de una base ya entrenada.

El problema que resuelve es de personalización estilística y de movimiento: aplicar un ajuste fino de bajo rango sobre Wan 2.2 i2v para inducir un patrón de movimiento concreto en el sujeto generado a partir de una imagen de entrada. La model card recomienda una fuerza de aplicación de 1.0 o superior y exige la palabra de activación "NSFDDNW" para que el efecto se dispare.

Su relevancia es acotada: se trata de un LoRA de nicho, sin descargas ni valoraciones registradas en el momento de la consulta, y cuya licencia no se declara explícitamente más allá de remitir a la del proyecto original. Es útil únicamente como ejemplo del ecosistema de adaptadores de bajo rango sobre Wan 2.2 y de los flujos de trabajo de ComfyUI asociados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Wan 2.2 i2v, modelo de difusión con transformer de difusión (DiT) y mezcla de expertos en la base; detalles internos de la base no disponibles |
| Parametros totales | no disponible (adaptador LoRA; dos ficheros de 293 MiB cada uno, ~0.6 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica en el sentido de modelos de lenguaje; longitud de secuencia de vídeo no especificada) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors sin cuantizar; la cuantización aplicable depende de la base sobre la que se cargue) |
| Idiomas soportados | no disponible (los prompts dependen de la base Wan 2.2; no se declara cobertura idiomática) |
| Licencia | no disponible explícitamente; la model card remite a la licencia del proyecto original o del upstream |
| Formato de pesos | safetensors (20260129-48585079_high_noise.safetensors y 20260129-48585079_low_noise.safetensors) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA, no de un modelo autónomo. Los dos ficheros publicados corresponden a los dos expertos de ruido de Wan 2.2: HighNoise y LowNoise. El campo "Finetuned from" de la model card indica precisamente WAN2.2 (HighNoise) y WAN2.2 (LowNoise), lo que implica que el adaptador se entrena por separado para cada etapa del proceso de muestreo y que debe cargarse en ambos para reproducir el efecto completo. Los nombres de los ficheros incluyen marcas temporales (20260129) y un identificador numérico (48585079), coherentes con un pipeline de entrenamiento gestionado por la plataforma RunningHub.

No se dispone de información sobre el número de tokens o de fotogramas empleados en el entrenamiento, la composición del dataset, la resolución nativa, si hubo etapas de ajuste por preferencias humanas ni sobre innovaciones técnicas concretas del adaptador. La model card únicamente aporta la palabra de activación ("NSFDDNW"), la fuerza recomendada (1.0 o superior), la compatibilidad declarada con "wan 2.2 models" y un enlace a un flujo de trabajo de ComfyUI alojado en RunningHub que, según el autor, mejora los resultados.

## Capacidades

- Generación de vídeo a partir de imagen (image-to-video) condicionada por un LoRA sobre Wan 2.2 i2v.
- Inducción de un patrón de movimiento específico sobre el sujeto de la imagen de entrada, según el nombre del modelo.
- Aplicación dual sobre los expertos HighNoise y LowNoise de Wan 2.2, requisito para el efecto completo.
- Control mediante palabra de activación ("NSFDDNW") y ajuste de intensidad con la fuerza del LoRA (recomendada 1.0 o superior).
- Integración en flujos de trabajo de ComfyUI y ejecución en la plataforma RunningHub.
- No se declaran capacidades de tool calling, uso como agente, razonamiento multimodal ni procesamiento de lenguaje; no aplican a este tipo de modelo.
- No se declara soporte multilingüe específico.

## Casos de uso

- Prototipado de animación de personajes en ComfyUI: cargar el LoRA sobre la base Wan 2.2 i2v, introducir una imagen fija como primer fotograma y generar una secuencia corta con el patrón de movimiento que induce el adaptador, útil para previsualizar ideas de animación antes de abordar una producción mayor.
- Experimentación con adaptadores de bajo rango sobre Wan 2.2: dado que se publican los dos ficheros de experto por separado, sirve como caso de estudio de cómo afecta cada etapa de ruido al resultado final y de cómo varía la salida al cambiar la fuerza de aplicación.
- Investigación sobre control de movimiento en modelos i2v: permite analizar hasta qué punto un LoRA de pocos cientos de megabytes puede alterar la dinámica de un sujeto sin reentrenar la base.
- Comparación de pipelines de aceleración: el propio repositorio y las búsquedas relacionadas apuntan a variantes optimizadas (por ejemplo, ficheros de la familia lightx2v para el experto de alto ruido), por lo que este adaptador puede emplearse para medir el impacto de esas optimizaciones sobre un LoRA concreto.
- Evaluación de flujos de trabajo alojados: el autor enlaza un workflow de RunningHub como configuración recomendada, de modo que el LoRA es útil para reproducir y auditar dicho flujo dentro de la plataforma.
- Contenido NSFW controlado en un entorno privado: el adaptador está orientado a la generación de material para adultos, por lo que su uso razonable queda restringido a despliegues privados con verificación de edad y cumplimiento de la normativa aplicable.
- Pruebas de integración de la API de RunningHub: el repositorio incluye enlaces a la documentación de la API y a un modelo de ejemplo (Seedance 2.5), por lo que puede servir para validar un pipeline de generación por API en esa plataforma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa unos 0.6 GB en disco (dos safetensors de 293 MiB), pero los requisitos reales vienen determinados por la base Wan 2.2 i2v sobre la que se carga, no por el LoRA.
- VRAM estimada para inferencia: no disponible en la información proporcionada. Depende del tamaño efectivo de la base, la precisión (fp16, fp8, GGUF) y la resolución y duración del vídeo.
- GPU recomendadas: no disponible. La model card no especifica hardware mínimo ni recomendado.
- ¿Cabe en GPU de consumo?: no disponible. Sin las cifras de la base Wan 2.2 i2v en la información aportada no puede afirmarse que quepa en una GPU de gama de consumo.
- Opciones de despliegue: ComfyUI (plataforma declarada), RunningHub (plataforma del autor, con ejecución en la nube y API), y Hugging Face como alojamiento de pesos. Los enlaces de búsqueda apuntan a variantes del ecosistema Wan 2.2 en formatos optimizados y a un cuaderno de Google Colab, pero no confirman compatibilidad directa con este LoRA.
- vLLM, llama.cpp, Ollama y TGI no aplican: son herramientas para modelos de lenguaje, no para un modelo de difusión de vídeo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rh-wan2.2-i2v-hl-noise-...-lora (este) | LoRA sobre Wan 2.2 i2v HighNoise + LowNoise | no disponible (adaptador de ~0.6 GB) | no aplica | Sin benchmarks publicados | No declarada; remite al upstream | Hugging Face, RunningHub, ComfyUI |
| Wan 2.2 i2v A14B (base, expertos HighNoise y LowNoise) | Modelo de difusión de vídeo image-to-video | Etiquetado como A14B en los ficheros públicos del ecosistema; detalle no verificado en la información disponible | no disponible | no disponible | no disponible (depende del proyecto original) | Distribución pública en Hugging Face |
| Adaptadores de aceleración de la familia lightx2v (por ejemplo, wan2.2_i2v_A14b_high_noise_lightx2v.safetensors) | Pesos optimizados para el experto de alto ruido | no disponible | no aplica | Orientados a reducir pasos de muestreo; cifras no disponibles | no disponible | Hugging Face (repositorio lightx2v/Wan2.2-Official-Models) |

La comparación cuantitativa no es posible con la información disponible: no hay benchmarks de ninguno de los tres y las fichas consultadas no publican cifras de parámetros ni de rendimiento comparables.

## Limitaciones y advertencias

- Contenido adulto: el nombre del modelo y la naturaleza del efecto buscado indican material NSFW. Su generación y difusión pueden infringir las políticas de uso de plataformas de alojamiento, redes sociales y servicios en la nube, además de requerir cumplimiento estricto de la normativa sobre contenido para adultos y verificación de edad.
- Licencia no declarada: la model card indica únicamente que los derechos permanecen con el autor y que debe seguirse la licencia del proyecto original o del upstream. No hay una autorización explícita de uso comercial, por lo que no debe asumirse que este uso esté permitido.
- Dependencia de la base: el LoRA no funciona por sí solo. Requiere cargar la base Wan 2.2 i2v y aplicar ambos ficheros (HighNoise y LowNoise); cargar solo uno produce un efecto incompleto.
- Dependencia del flujo de trabajo: el autor afirma que el resultado mejora con un workflow concreto alojado en RunningHub. Sin ese contexto, el comportamiento puede diferir del esperado.
- Palabra de activación obligatoria: sin el token "NSFDDNW" el adaptador puede no activarse o hacerlo de forma parcial.
- Fuerza de aplicación: se recomienda 1.0 o superior. No se documentan los efectos de valores muy altos (posible degradación de la coherencia temporal o artefactos), ni de valores bajos.
- Sin métricas de calidad: no hay benchmarks, evaluaciones de fidelidad temporal, coherencia de identidad ni comparativas objetivas. Cualquier valoración de calidad es subjetiva.
- Sin información de sesgos: no se documenta la composición del dataset de entrenamiento, por lo que no puede evaluarse el sesgo demográfico, corporal o cultural del adaptador.
- Riesgo de sobreajuste: al ser un LoRA de nicho y con un patrón de movimiento muy específico, es probable que reproduzca de forma repetitiva el mismo tipo de dinámica y que se degrade al aplicarse sobre sujetos o encuadres alejados de su distribución de entrenamiento.
- Repositorio sin tracción: cero descargas y cero valoraciones en el momento de la consulta, sin validación externa de la comunidad.
- Fechas del repositorio: la fecha de creación registrada es 2026-09-29, posterior a la fecha habitual de publicación de otros modelos; conviene verificarla, ya que podría tratarse de un error de metadatos de la plataforma.
- Sin soporte ni mantenimiento documentado: no se especifican canales de soporte, versiones ni historial de cambios.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-wan2.2-i2v-hl-noise-big-breasted-shakes-upper-body-wiggles-upper-body-breasts-move-up-an-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2017050075511398401
- Workflow recomendado por el autor: https://www.runninghub.ai/post/1957280281659109378/?inviteCode=rh-v1220
- Página del autor: https://www.runninghub.ai/user-center/1931299605898764290
- Plataforma RunningHub: https://www.runninghub.ai
- RunningHub (sitio de China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- Ejemplo de API con Seedance 2.5: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
- Pesos oficiales de Wan 2.2 en el ecosistema lightx2v: https://huggingface.co/lightx2v/Wan2.2-Official-Models
- Cuaderno de Colab para Wan 2.2 con Lightx2v: https://colab.research.google.com/github/Isi-dev/Google-Colab_Notebooks/blob/main/wan2_2/wan22_Lightx2v.ipynb
- Ejemplo de README de variante Wan 2.2 en Hugging Face: https://huggingface.co/FX-FeiHou/wan2.2-Remix/blob/main/README.md
