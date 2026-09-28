# RunningHubAI/rh-z-image-impasto-2.5d-anime-style-lora

## Resumen

rh-z-image-impasto-2.5d-anime-style-lora es un adaptador LoRA de generación de imagen a partir de texto (text-to-image) publicado por RunningHubAI, la cuenta en HuggingFace de la plataforma RunningHub. Se trata de un ajuste fino de estilo bautizado como «Impasto 2.5D Anime Style», construido sobre el modelo base Z-image-turbo, cuyo propósito es trasladar a las imágenes generadas una estética de anime 2.5D con textura de pintura al óleo aplicada con espátula (impasto).

El repositorio contiene un único archivo de pesos, `Impasto 2.5D Anime Style.safetensors`, de 20 MiB, y está etiquetado para su uso en ComfyUI. La activación del estilo se realiza mediante la palabra de disparo (trigger word) «Impasto 2.5D Anime Style». En el momento de la consulta, el repositorio acumulaba 0 descargas y 0 «likes», y la model card no documenta licencia, idiomas, resolución de entrenamiento, número de pasos de inferencia ni parámetros del modelo base.

Su relevancia es acotada: no es un modelo fundacional, sino un recurso de estilo para pipelines de difusión ya existentes. Resulta útil para quien ya trabaja con Z-image-turbo en ComfyUI o en la propia plataforma RunningHub y quiere aplicar una estética pictórica concreta sin reentrenar ni tocar los pesos del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre el modelo de difusión Z-image-turbo; arquitectura del modelo base no documentada) |
| Parámetros totales | no disponible (el artefacto es un archivo de pesos LoRA de 20 MiB; no se declara rango ni número de parámetros) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de imagen; no se documenta la longitud máxima de prompt) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que se sigue la licencia del proyecto original o upstream) |
| Formato de pesos | safetensors |
| Tipo de modelo | LoRA de texto a imagen (text-to-image) |
| Modelo base | Z-image-turbo |
| Palabra de disparo | Impasto 2.5D Anime Style |
| Tamaño del repositorio | 0,0 GB (archivo único de 20 MiB) |
| Plataformas indicadas | ComfyUI, RunningHub, Hugging Face |
| Autoría | RunningHub, en nombre del autor AI-iLiKe |
| Fecha de creación (metadatos) | 28 de septiembre de 2026 |
| Última actualización (metadatos) | 28 de septiembre de 2026 |

## Arquitectura y entrenamiento

El artefacto publicado es un LoRA (Low-Rank Adaptation): un conjunto de matrices de bajo rango que se inyectan en capas del modelo base para modular su comportamiento sin modificar los pesos originales. En este caso el modelo base declarado es Z-image-turbo y el objetivo es un ajuste de estilo, no de conocimiento: el LoRA no añade capacidades nuevas al generador, sino que sesga su distribución de salida hacia una estética concreta de anime 2.5D con acabado de pintura al óleo empastada. El peso del archivo (20 MiB) es coherente con un adaptador de estilo de bajo rango, aunque la model card no publica el rango, el valor de alpha, las capas objetivo ni el optimizador empleado.

No se documenta ningún detalle del entrenamiento: ni el dataset (composición, número de imágenes, resolución, procedencia o licencias), ni el número de pasos, ni la tasa de aprendizaje, ni si se aplicaron técnicas de regularización, captions automáticas o refinamiento posterior (RLHF/DPO no aplican aquí; en difusión serían equivalentes a ajustes por preferencia, que tampoco se mencionan). El nombre del modelo base incluye el término «turbo», habitual en modelos de difusión destilados para inferencia en pocos pasos, pero la model card no confirma esa característica ni el número de pasos recomendado. Tampoco se indica la versión concreta de Z-image-turbo utilizada, lo que impide garantizar la compatibilidad con otras revisiones del base.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con estética de anime 2.5D y textura de pintura al óleo tipo impasto, siempre que se combine con el modelo base Z-image-turbo.
- Aplicación de estilo mediante palabra de disparo: el prompt debe incluir «Impasto 2.5D Anime Style» para activar el efecto.
- Integración en flujos de trabajo de ComfyUI como nodo de carga de LoRA, según las etiquetas del repositorio.
- Ejecución en la plataforma RunningHub y a través de su API, según los enlaces de la model card.
- Compatibilidad con otras técnicas de control (ControlNet, img2img, inpainting): no documentada.
- Generación de vídeo o animación: no documentada; el pipeline declarado es exclusivamente text-to-image.
- Soporte de tool calling o function calling: no aplica y no está documentado.
- Soporte de agentes o razonamiento multi-paso: no aplica y no está documentado.
- Capacidades multilingües: no documentadas; se desconoce si el codificador de texto del modelo base procesa prompts en castellano u otros idiomas.
- Modo de razonamiento (thinking), visión o audio: no aplica ni está documentado.

## Casos de uso

- Ilustración de portadas para novela ligera o cómic: el LoRA aporta un acabado pictórico reconocible sobre el base Z-image-turbo, de modo que un ilustrador puede generar variantes de portada con textura de óleo anime y retocarlas después, reduciendo el tiempo de bocetado.
- Arte conceptual para videojuegos independientes: estudio de personajes y escenarios con una dirección artística homogénea, activando el estilo con el trigger en todos los prompts para mantener coherencia visual entre assets.
- Fondos y key art para streaming o vídeo: generación de escenarios anime con acabado de pintura empastada para usar como fondo de directos, banners o miniaturas, aprovechando que el estilo se aplica de forma consistente.
- Dirección de arte y moodboards: producción rápida de tableros de referencia con una estética concreta que el equipo puede discutir antes de encargar el trabajo final a un ilustrador humano.
- Merchandising e impresión de láminas: generación de ilustraciones con textura pictórica para pósteres o láminas, donde el acabado tipo óleo resulta adecuado para impresión en gran formato, previa revisión de la licencia del base y del adaptador.
- Ilustración editorial y de revista: piezas de acompañamiento para artículos con una estética anime 2.5D diferenciada del render 3D convencional, integrándolas en un pipeline de ComfyUI junto al resto de la maquetación.
- Generación por lotes mediante API: si el flujo se despliega en RunningHub, el LoRA puede invocarse desde su API para producir series de imágenes con el mismo estilo de forma programática, útil para catálogos o pruebas A/B.
- Retrato personalizado por encargo: combinación del estilo impasto con prompts de retrato para ofrecer una variante artística diferenciada dentro de un servicio de ilustración bajo pedido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (FID, CLIP score, similitud estética, comparativas con otros LoRA de estilo), ni ejemplos de imágenes, ni parámetros de muestreo recomendados, por lo que no es posible evaluar de forma objetiva la fidelidad del estilo ni su estabilidad.

## Requisitos de hardware

- VRAM para el adaptador: el archivo LoRA ocupa 20 MiB, por lo que su sobrecarga de memoria es despreciable frente al modelo base.
- VRAM total: no disponible. Depende íntegramente de Z-image-turbo, cuyos requisitos no se documentan en la información aportada.
- GPU recomendadas: no disponible; no se especifica ningún modelo de GPU concreto.
- Encaje en GPU de consumo: no disponible; no hay datos publicados sobre VRAM mínima ni sobre resolución de salida, por lo que no puede confirmarse que quepa en tarjetas de gama de consumo.
- Opciones de despliegue: ComfyUI (plataforma indicada por el autor), RunningHub y su API (ejecución gestionada en la nube) y Hugging Face como repositorio de distribución. No se documenta compatibilidad con vLLM, llama.cpp, TGI, Ollama ni Diffusers, que en cualquier caso no son aplicables a un modelo de difusión en este formato.
- Latencia y throughput: no disponible. No se documentan pasos de inferencia, resolución, sampler ni tiempos de generación.
- Alternativa sin hardware local: el uso a través de RunningHub evita tener que dimensionar GPU, a cambio de depender de un servicio externo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación aportada: la model card no cita alternativas, ni resultados frente a otros adaptadores, ni referencias a LoRAs de estilo equivalentes. La tabla siguiente recoge únicamente los atributos documentados de este adaptador; el resto de celdas quedan como no disponibles.

| Aspecto | Este LoRA | Otras LoRAs de estilo para Z-image-turbo | LoRAs de estilo para otros modelos de difusión |
|---|---|---|---|
| Modelo base | Z-image-turbo | no disponible | no disponible |
| Tamaño del archivo | 20 MiB | no disponible | no disponible |
| Tipo de estilo | Anime 2.5D con impasto | no disponible | no disponible |
| Licencia | no disponible | no disponible | no disponible |
| Benchmarks publicados | ninguno | no disponible | no disponible |
| Adopción en la comunidad | 0 descargas, 0 «likes» | no disponible | no disponible |
| Disponibilidad | Hugging Face y RunningHub | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: la model card remite a la licencia del proyecto original o upstream sin especificarla. Sin ese dato, el uso comercial del adaptador no puede darse por garantizado y conviene aclararlo con el autor antes de integrarlo en producción.
- Titularidad: RunningHub publica el modelo en nombre del autor y el copyright permanece en manos de este, según se indica en la propia model card.
- Dependencia del modelo base: al ser un LoRA, su comportamiento queda ligado a la versión concreta de Z-image-turbo. Un cambio de revisión del base puede degradar o anular el efecto del estilo.
- Sin validación comunitaria: 0 descargas y 0 «likes» implican que no hay evidencia externa de calidad, ni ejemplos, ni informes de terceros sobre la fidelidad del estilo.
- Riesgo de alucinación visual: como cualquier generador de difusión, puede producir anatomías incorrectas, manos deformes, texto ilegible o incoherencias compositivas; el LoRA no corrige esos fallos del base.
- Sesgos: no se documenta el dataset de entrenamiento, por lo que se desconocen los sesgos de representación (etnia, género, corporalidad) heredados del base y del conjunto de imágenes de ajuste.
- Contenido inseguro: no se documentan filtros de seguridad ni restricciones de contenido. La responsabilidad de moderar las salidas recae en quien despliega el modelo.
- Idiomas y prompts: se desconoce si el codificador de texto del base procesa correctamente prompts en castellano; el trigger word está en inglés.
- Ausencia de métricas operativas: sin resolución de entrenamiento, pasos recomendados, escala de CFG ni sampler, el ajuste fino de la generación queda por prueba y error.
- Sin soporte de agentes ni tool calling: no es un modelo de lenguaje y no puede integrarse en flujos de razonamiento, RAG o automatización conversacional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RunningHubAI/rh-z-image-impasto-2.5d-anime-style-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2002917138035798017
- Página del autor (AI-iLiKe) en RunningHub: https://www.runninghub.cn/user-center/1949639306402586626
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Llamada a la API de RunningHub: https://www.runninghub.ai/call-api
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Detalle de API de Seedance 2.5 (enlace relacionado de la model card): https://www.runninghub.ai/call-api/api-detail/2133100000000700025
- README en chino: https://huggingface.co/RunningHubAI/rh-z-image-impasto-2.5d-anime-style-lora/blob/main/README_cn.md
