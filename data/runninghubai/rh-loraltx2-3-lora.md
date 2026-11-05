# RunningHubAI/rh-loraltx2.3-lora

## Resumen

`rh-loraltx2.3-lora` es un adaptador LoRA publicado por RunningHubAI para el modelo de vídeo generativo Lightricks/LTX-2.3. No se trata de un modelo base, sino de un peso complementario (0,3 GB, un único fichero `safetensors` de 322 MiB) que se aplica sobre LTX-2.3 para especializar la generación de vídeo hacia una temática concreta: escenas de planetario, astronomía y divulgación científica, según describe el autor en la model card.

El adaptador está pensado para usarse dentro del ecosistema ComfyUI y de la plataforma RunningHub, y el autor lo presenta explícitamente como un LoRA «compañero» o complementario de otro LoRA del mismo creador dedicado al planetario de Dongdawang. Incluye una palabra de activación en chino («雄舟吉林印象之东大旺天文望远镜») y una lista extensa de términos sugeridos para el prompt (pantalla, cielo estrellado, divulgación, universo, satélite, espacio, Tierra, nebulosa, etc.).

La relevancia es acotada: es un recurso de personalización estética para un pipeline de generación de vídeo, no un modelo de propósito general. La información pública es muy escasa (0 descargas, 0 likes en el momento de la consulta, sin pipeline declarado, sin licencia explícita y sin idiomas declarados), por lo que la mayoría de especificaciones técnicas del modelo subyacente no están disponibles en esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Lightricks/LTX-2.3; arquitectura del modelo base no disponible |
| Parámetros totales | no disponible (peso LoRA de 322 MiB en safetensors) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (se distribuye en safetensors; cuantizaciones del adaptador no documentadas) |
| Idiomas soportados | no disponible (la palabra de activación y los prompts sugeridos están en chino) |
| Licencia | no disponible; la model card remite a la licencia del proyecto original o upstream (Lightricks/LTX-2.3) |
| Formato de pesos | safetensors (`20260912-98555009.safetensors`, 322 MiB) |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base LTX-2.3 de Lightricks. No se publica información sobre el rango del adaptador, las capas objetivo, el número de pasos de entrenamiento, el dataset utilizado ni la composición de los datos. El autor indica que el LoRA se entrenó en RunningHub («Training at RunningHub»), plataforma que ofrece servicios de entrenamiento y de inferencia, pero no se detalla la configuración.

La model card describe el adaptador como complementario a otro LoRA temático del mismo autor sobre el planetario de Dongdawang, y recomienda su uso conjunto. La única guía de prompting disponible es una lista de palabras clave en chino orientadas a escenas de astronomía, espacio y divulgación científica, junto con una palabra de activación específica. No hay información sobre si se aplicó regularización, dropout, técnica de merge o estrategias de evaluación durante el entrenamiento.

## Capacidades

- Personalización estética de generación de vídeo sobre LTX-2.3 hacia escenas de planetario, astronomía y divulgación científica.
- Activación mediante la palabra clave «雄舟吉林印象之东大旺天文望远镜».
- Respuesta a un vocabulario de prompt sugerido en chino: pantalla, cielo estrellado, universo, satélite, espacio, Tierra, exposición, arquitectura, animación 3D, nebulosa, ciencia, reflejos, montañas, virtual, exploración, paneles solares, proyección, visualización digital, gran angular, tecnológico, nave espacial, vista aérea, Vía Láctea, futuro, nubes, Luna, estación espacial, azul, vegetación, subtítulos, cielo nocturno, observatorio, ondas electromagnéticas, atmósfera, mapa estelar, iluminación, entre otros.
- Integración nativa en flujos de ComfyUI y en la plataforma RunningHub (y presumiblemente en cualquier pipeline que cargue LoRA sobre LTX-2.3).
- Capacidades del modelo base (texto a vídeo, imagen a vídeo, control de movimiento, resolución y duración) no disponibles en la información proporcionada.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking; son capacidades ajenas al propósito de un LoRA de vídeo.

## Casos de uso

- Producción de vídeo divulgativo de astronomía: aplicar el LoRA sobre LTX-2.3 para generar clips de planetarios, observatorios y cielos estrellados con una estética consistente, usando la palabra de activación y el vocabulario sugerido en el prompt.
- Material educativo para museos de ciencia: generar animaciones breves de conceptos como estaciones espaciales, paneles solares o mapas estelares para pantallas expositivas, aprovechando la especialización temática del adaptador.
- Previsualización de storyboards para documentales espaciales: iterar rápidamente sobre planos de nebulosas, Vía Láctea o vistas aéreas de la Tierra antes de producir con CGI o metraje real.
- Contenido para redes sociales de temática científica: clips cortos con estética «tech» y de futuro (gran angular, iluminación azul, arquitectura blanca) para canales de divulgación.
- Prototipado de experiencias inmersivas: generar bucles de vídeo de fondo para instalaciones de realidad virtual o domos planetario, ajustando el prompt a proyecciones, reflejos y visualización digital.
- Combinación con el LoRA compañero del mismo autor: usar ambos adaptadores de forma conjunta para reforzar la coherencia visual en series de planos del mismo planetario o de la misma narrativa audiovisual.
- Experimentación en ComfyUI: probar el efecto del LoRA frente al modelo base en tareas de texto a vídeo, midiendo el cambio estilístico con y sin la palabra de activación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (FVD, CLIP score, similitud textual, etc.) ni comparaciones con otros LoRA o con el modelo base.

## Requisitos de hardware

- El adaptador pesa 322 MiB, por lo que su carga en memoria es despreciable frente al modelo base; el requisito real lo determina LTX-2.3.
- VRAM estimada para inferencia: no disponible para el modelo base en la información proporcionada; depende de la resolución, duración del clip y precisión (fp16/bf16/fp8) elegidas.
- GPU recomendadas: no disponible. Al ser un modelo de generación de vídeo, se espera que requiera GPUs de gama alta (A100, H100, RTX 4090 o superiores) para resoluciones y duraciones razonables, pero este dato no está confirmado en la documentación.
- ¿Cabe en GPU consumer? No disponible; el adaptador en sí sí, el modelo base no está documentado.
- Opciones de despliegue: ComfyUI (soporte nativo declarado), plataforma RunningHub (entrenamiento e inferencia), y presumiblemente cualquier runtime que cargue LoRA sobre LTX-2.3; no se confirman vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para un modelo de vídeo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros LoRA comparables ni datos del modelo base que permitan una comparación cuantitativa. Como referencia cualitativa, el adaptador se posiciona frente a otros LoRA temáticos del mismo autor en RunningHub (por ejemplo, el LoRA del planetario de Dongdawang citado como complementario), pero no se dispone de parámetros, contexto ni rendimiento de ninguno de ellos.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo base Lightricks/LTX-2.3 y un runtime compatible (ComfyUI o RunningHub); sin él no es funcional.
- La licencia no está declarada de forma explícita; la model card remite a la licencia del proyecto original o upstream, por lo que el uso comercial queda sujeto a las condiciones de LTX-2.3 y debe verificarse antes de producción.
- Sesgos conocidos: no documentados; al ser un LoRA entrenado sobre un vocabulario temático en chino, es probable que su rendimiento caiga fuera de ese dominio y con prompts en otros idiomas.
- Riesgo de alucinación visual: como todo modelo generativo de vídeo, puede producir artefactos, incoherencias temporales o físicas; no se han publicado evaluaciones al respecto.
- Vocabulario de activación en chino: la palabra clave y los prompts sugeridos están en chino, lo que puede limitar la calidad con prompts en castellano u otros idiomas.
- Información pública mínima: 0 descargas, 0 likes, sin pipeline declarado, sin idiomas declarados y sin documentación de entrenamiento; la reproducibilidad es baja.
- Fechas de creación y actualización del repositorio (2026-11-05) posteriores a la fecha habitual de consulta; conviene verificar la vigencia del recurso.
- Sin garantías de mantenimiento: el autor publica a través de RunningHub y no se documenta un plan de actualizaciones o soporte.

## Enlaces

- HuggingFace: https://huggingface.co/RunningHubAI/rh-loraltx2.3-lora
- Modelo base: https://huggingface.co/Lightricks/LTX-2.3
- Página original en RunningHub: https://www.runninghub.cn/model/public/2099083857076244481
- Página del autor: https://www.runninghub.cn/user-center/1936581950121414657
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-loraltx2.3-lora/blob/main/README_cn.md
