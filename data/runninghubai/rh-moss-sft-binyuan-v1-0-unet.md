# RunningHubAI/rh-moss-sft-binyuan-v1.0-unet

## Resumen

`rh-moss-sft-binyuan-v1.0-unet` es un UNET de difusión para generación de vídeo a partir de texto (text-to-video), publicado por RunningHub a partir del trabajo del autor identificado como @冰缘排骨. El modelo parte de un checkpoint oficial —la model card indica "Finetuned from: moss-image"— al que se le han incorporado un LoRA de 8 pasos y un modelo entrenado por el propio autor. No se trata de un modelo de lenguaje, sino de un componente de pesos (UNET) destinado a cargarse en flujos de ComfyUI o en la plataforma RunningHub mediante su API.

La propuesta de valor es la velocidad: según el autor, la integración del LoRA de destilación reduce el tiempo de generación de aproximadamente un minuto a entre 10 y 20 segundos, manteniendo e incluso aumentando el detalle de la imagen. Para ello el muestreo se realiza con solo 8 pasos, `cfg` igual a 1, sampler `euler` y scheduler `sgm_uniform`, parámetros que el autor marca como obligatorios.

El repositorio contiene un único archivo de pesos safetensors de 9694 MiB (`binyuan_moss_sft_shajing_v1.safetensors`), dentro de un repo de 10,2 GB. La información publicada es muy escasa: no se detallan arquitectura interna, número de parámetros, resolución o duración de los vídeos, idiomas de los prompts, composición del dataset de entrenamiento ni licencia explícita, lo que limita seriamente su evaluación formal y su uso en producción con garantías.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | UNET de difusión para text-to-video (detalle interno no disponible) |
| Parámetros totales | No disponible; el archivo safetensors ocupa 9694 MiB, lo que en fp16 equivaldría a aproximadamente 4.800-5.000 millones de parámetros (estimación derivada del tamaño, no confirmada por el autor) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no se documentan resolución, número de frames ni duración máxima de clip) |
| Tipos de cuantización | No se publican cuantizaciones oficiales; se distribuye en safetensors. En ComfyUI puede cargarse en fp16 y potencialmente en fp8 (no verificado por el autor) |
| Idiomas soportados | No disponible (no se especifican idiomas de prompt) |
| Licencia | No disponible; la model card indica que los derechos permanecen en el autor y que debe seguirse la licencia del proyecto original o del upstream |
| Formato de pesos | safetensors (`binyuan_moss_sft_shajing_v1.safetensors`, 9694 MiB) |

## Arquitectura y entrenamiento

El modelo es un UNET de difusión para generación de vídeo condicionada por texto, empaquetado en el formato que consume ComfyUI. El autor no publica detalles sobre el backbone (número de bloques, tipo de atención, uso de atención 3D o de capas temporales), ni sobre el VAE o el codificador de texto que deben acompañarlo en el pipeline. La referencia "Finetuned from: moss-image" sitúa el origen en un modelo base denominado moss-image del que no se ofrece información adicional en la documentación disponible.

El entrenamiento descrito consiste en un ajuste fino (SFT) sobre el checkpoint oficial, al que se añade un LoRA de destilación de pasos que permite reducir el muestreo a 8 pasos con `cfg` = 1, además de un modelo propio entrenado por el autor y no especificado. No se indican número de tokens o de clips de entrenamiento, composición del dataset, resolución de entrenamiento, ni si hubo etapas de preferencia (RLHF/DPO). Los parámetros de inferencia recomendados son: 8 pasos, cfg 1, sampler `euler`, scheduler `sgm_uniform`.

## Capacidades

- Generación de vídeo a partir de prompts de texto, con salida orientada a clips cortos (duración no especificada).
- Inferencia acelerada en 8 pasos, lo que habilita iteración rápida en tareas de exploración creativa.
- Integración nativa en flujos de ComfyUI como nodo de carga de UNET.
- Ejecución en la plataforma RunningHub y a través de su API HTTP.
- Refuerzo de detalle fino en la imagen respecto al modelo base, según declara el autor.
- Compatibilidad con los parámetros de muestreo indicados (`euler` + `sgm_uniform`), necesarios para que la destilación funcione como se espera.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni soporte multilingüe explícito; son capacidades no aplicables o no disponibles en un modelo de difusión de vídeo.

## Casos de uso

- Prototipado rápido de storyboards: con 8 pasos y entre 10 y 20 segundos por generación, un equipo puede iterar decenas de variaciones visuales de una escena antes de fijar el concepto, algo inviable con pipelines de 50 pasos.
- Generación de clips para redes sociales: el modelo produce vídeo vertical u horizontal (resolución no documentada) a partir de un prompt, adecuado para piezas de pocos segundos en campañas de contenido.
- Previsualización en producción audiovisual: generar animáticas de bajo coste para validar encuadres y ritmo antes de rodar o de encargar render 3D.
- Composición de fondos y b-roll en posproducción: clips cortos generados por texto que se insertan como material de relleno en montajes, aprovechando el refuerzo de detalle declarado por el autor.
- Automatización vía API en RunningHub: integración del endpoint en un backend que reciba peticiones de usuarios y devuelva vídeos, sin necesidad de gestionar GPU propia.
- Exploración de estilo en estudios de diseño: barrido de prompts con seeds y variaciones para generar paneles de referencia visual rápida.
- Docencia y demos de difusión de vídeo: al ser un UNET compatible con ComfyUI, sirve para ilustrar flujos de trabajo con LoRA de destilación en cursos técnicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El único dato de rendimiento aportado por el autor es cualitativo y relativo: la generación pasa de aproximadamente un minuto a entre 10 y 20 segundos tras integrar el LoRA de 8 pasos. No se especifica el hardware empleado para esa medición, ni la resolución, ni el número de frames, por lo que la cifra no es reproducible tal cual.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo de pesos ocupa 9694 MiB, de modo que solo el UNET en fp16 requiere en torno a 10 GB de VRAM. Sumando codificador de texto, VAE de vídeo y activaciones, un mínimo realista se sitúa en 12-16 GB para clips cortos y resolución moderada, y 24 GB o más para mayor resolución o lotes (estimación, no confirmada por el autor).
- GPU recomendadas: RTX 4090 (24 GB) para uso individual en ComfyUI; A100 40/80 GB o H100 para servir la API con concurrencia; RTX 3090 (24 GB) como alternativa de coste similar a la 4090.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas de 16 GB o más (RTX 4080, 4090, 3090, 5070 Ti y superiores), y con cuantización fp8 posiblemente en 12 GB, aunque este extremo no está verificado.
- Opciones de despliegue: ComfyUI como entorno principal, RunningHub (plataforma y API) como servicio gestionado. No aplica vLLM, llama.cpp, Ollama ni TGI, que son servidores para modelos de lenguaje.
- Latencia y throughput: el autor reporta 10-20 segundos por generación con 8 pasos; no se indican el hardware ni el throughput en peticiones concurrentes.

## Comparativa con modelos similares

La información disponible sobre este modelo es demasiado escasa (sin parámetros confirmados, resolución, frames ni licencia) como para establecer una comparación cuantitativa fiable. La siguiente tabla recoge únicamente lo verificable en esta ficha; el resto de celdas se marca como no disponible.

| Modelo | Categoría | Pasos de muestreo | Formato | Licencia | Datos verificados |
|---|---|---|---|---|---|
| rh-moss-sft-binyuan-v1.0-unet | UNET text-to-video para ComfyUI | 8 (destilado) | safetensors | No disponible | Tamaño de pesos y parámetros de muestreo |
| Modelo base "moss-image" | Modelo de difusión (upstream) | No disponible | No disponible | No disponible | Solo la referencia del autor |
| Alternativas open source del mismo nicho (por ejemplo, familias tipo LTX-Video, Wan o HunyuanVideo) | UNET/DiT text-to-video | Varía según variante y destilados | safetensors / GGUF en algunos casos | Varía (Apache 2.0, OpenRAIL o licencias propias) | No verificado en la información proporcionada |

Nota: para una comparación rigurosa con alternativas conviene consultar las fichas oficiales de cada proyecto, ya que los datos de parámetros, contexto y benchmarks de esos modelos no forman parte de la información disponible en esta búsqueda.

## Limitaciones y advertencias

- Ausencia total de licencia explícita: la model card remite a la licencia del proyecto original o del upstream y mantiene los derechos en el autor. El uso comercial es jurídicamente incierto y requiere contactar con el autor o con RunningHub antes de desplegarlo.
- Sin datos de entrenamiento: no se conoce la composición del dataset, por lo que no se pueden evaluar sesgos de representación ni riesgos de reproducción de material protegido.
- Riesgo de alucinación visual: como todo modelo generativo de vídeo, puede producir anatomías incorrectas, físicas incoherentes, texto ilegible y artefactos de parpadeo entre frames.
- Parámetros de inferencia restringidos: el destilado a 8 pasos con cfg 1 implica que desviarse de `euler` + `sgm_uniform` degradará la calidad; el margen de ajuste creativo es menor que en modelos no destilados.
- Falta de especificaciones de resolución, frames y relación de aspecto: no se puede planificar capacidad de producción sin pruebas empíricas previas.
- Idiomas de prompt no documentados: el rendimiento en castellano es desconocido; es previsible que el modelo rinda mejor en inglés o chino, pero no hay confirmación.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusión pública que permitan anticipar problemas.
- Fecha de creación futura en los metadatos (2026-10-19), dato que conviene verificar antes de citar el modelo en documentación.
- Al ser un UNET aislado, no es autosuficiente: requiere VAE, codificador de texto y un pipeline compatible; una elección incorrecta de estos componentes produce resultados defectuosos.

## Enlaces

- HuggingFace: https://huggingface.co/RunningHubAI/rh-moss-sft-binyuan-v1.0-unet
- README en chino: https://huggingface.co/RunningHubAI/rh-moss-sft-binyuan-v1.0-unet/blob/main/README_cn.md
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2112133631970979841
- Página del autor: https://www.runninghub.ai/user-center/1975784978346901506
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
