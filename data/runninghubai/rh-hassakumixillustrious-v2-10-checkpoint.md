# RunningHubAI/rh-hassakumixillustrious-v2.10-checkpoint

## Resumen

rh-hassakumixillustrious-v2.10-checkpoint es un checkpoint de generación de imágenes para Stable Diffusion XL (SDXL), publicado por RunningHubAI en nombre de un autor que firma como `nullnull`. Se trata de un modelo de la familia Illustrious, derivado de Hassaku XL, orientado a la generación de ilustración y anime con estética cuidada y alto nivel de detalle. No es un modelo de lenguaje: es un checkpoint de difusión que se carga en ComfyUI o se ejecuta en la plataforma RunningHub.

El repositorio contiene un único archivo de pesos en formato safetensors de 6617 MiB (aproximadamente 6,9 GB), lo que corresponde al tamaño típico de un checkpoint SDXL completo (UNet, VAE y codificadores de texto incluidos). La model card documenta ajustes de muestreo recomendados (Euler Ancestral con scheduler beta, CFG entre 3 y 7, 25 pasos, resolución 1024×1344) y una receta de upscale en dos etapas con postprocesado de nitidez y contraste.

La relevancia de esta ficha es acotada: el modelo no incluye información sobre licencia, idiomas, arquitectura detallada ni benchmarks, y su adopción en Hugging Face es nula en el momento de la consulta (0 descargas, 0 likes). Resulta útil para quien busque un checkpoint de ilustración listo para ComfyUI con parámetros de muestreo ya validados por el autor, pero no para evaluaciones de rendimiento cuantitativas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión latente tipo SDXL (familia Illustrious / Hassaku XL); no se detalla la configuración interna |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; resolución nativa recomendada 1024×1344) |
| Tipos de cuantización | no disponible; se distribuye un único checkpoint en safetensors |
| Idiomas soportados | no disponible (modelo texto-a-imagen; los prompts se documentan en inglés) |
| Licencia | no disponible; la model card indica que el copyright permanece con el autor y remite a la licencia del proyecto original |
| Formato de pesos | safetensors (`hassakumixillustriou_v210.safetensors`, 6617 MiB) |

## Arquitectura y entrenamiento

La model card identifica el modelo como un checkpoint de la familia Illustrious, afinado a partir de IL-XL y descrito como un «Hassaku XL (Illustrious) mix». No se aportan detalles sobre la arquitectura interna (número de bloques del UNet, dimensiones de los codificadores de texto, variante de VAE) ni sobre el proceso de entrenamiento: no se indica el volumen de imágenes, la composición del dataset, el uso de técnicas como LoRA merging, DreamBooth, fine-tuning completo o mezcla de checkpoints, ni si hubo etapas de refinamiento o ajuste por preferencias.

Tampoco se documentan innovaciones técnicas específicas (attention slicing, destilación, decodificación especulativa u otras). La información disponible se limita a la receta de inferencia: sampler `euler_ancestral`, scheduler `beta`, CFG 5,5, 25 pasos y resolución 1024×1344 para la generación base, y una segunda etapa de upscale con CFG 4,0, 25 pasos y arranque en el paso 20, seguida de postprocesado de nitidez y corrección de contraste.

## Capacidades

- Generación de imágenes texto-a-imagen con estética de ilustración y anime, orientada a resultados detallados y con iluminación volumétrica.
- Composición a resolución 1024×1344 y ampliación posterior mediante una etapa de upscale documentada.
- Control de estilo mediante prompts positivos y negativos extensos (calidad, iluminación, profundidad de campo, anatomía, marcas de agua).
- Integración nativa en ComfyUI como checkpoint, con posibilidad de encadenar nodos de postprocesado.
- Ejecución en la plataforma RunningHub, tanto en interfaz web como mediante API.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento, al no ser un modelo de lenguaje.

## Casos de uso

- Ilustración de personajes para proyectos de anime o manga: el checkpoint está afinado sobre la base Illustrious y produce resultados con acabado de ilustración; se usaría con el prompt positivo recomendado y CFG 5,5 en ComfyUI.
- Generación de arte conceptual para videojuegos: la resolución 1024×1344 y la etapa de upscale permiten obtener láminas de referencia con detalle suficiente para iterar sobre diseños.
- Creación de key visuals para portadas y material promocional: la receta de postprocesado (sharpen y corrección de contraste) está pensada para entregar imágenes con nitidez y rango tonal controlados.
- Producción por lotes mediante API: al estar publicado en RunningHub, se puede invocar el modelo desde pipelines automatizados sin gestionar GPU propia.
- Exploración de estilo en flujos ComfyUI: al ser un checkpoint estándar, se puede combinar con LoRAs, ControlNet y nodos de upscale dentro del mismo grafo.
- Prototipado rápido de ideas visuales: con 25 pasos y CFG moderado, el ciclo de generación es corto, lo que facilita la iteración sobre variaciones de prompt.
- Generación de ilustraciones para contenido editorial o redes: útil cuando se necesita un estilo consistente de ilustración con parámetros ya validados por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del checkpoint (6617 MiB) y la arquitectura SDXL, se requiere una GPU con al menos 8-12 GB de VRAM para inferencia a 1024×1344, y más si se encadena upscale en el mismo grafo.
- GPU recomendadas: no disponibles en la documentación; para SDXL son habituales RTX 3060 12 GB, RTX 4070, RTX 4090, A100 y H100, pero el autor no especifica ninguna.
- Compatibilidad con GPU de consumo: no confirmada por el autor; el tamaño del archivo sugiere que encaja en tarjetas de 12 GB o más, sin garantía oficial.
- Opciones de despliegue: ComfyUI (plataforma indicada), RunningHub (web y API); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Resolución nativa | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-hassakumixillustrious-v2.10-checkpoint | Checkpoint SDXL / Illustrious | 1024×1344 (recomendada) | safetensors | no disponible | Hugging Face y RunningHub |
| SDXL base 1.0 | Checkpoint SDXL | 1024×1024 | safetensors | CreativeML Open RAIL++-M | Hugging Face |
| Illustrious XL (base) | Checkpoint SDXL derivado | no disponible en esta ficha | safetensors | no disponible en esta ficha | Hugging Face |
| Hassaku XL | Checkpoint SDXL derivado | no disponible en esta ficha | safetensors | no disponible en esta ficha | Civitai / Hugging Face |

No se dispone de datos de rendimiento comparativo (FID, CLIP score, preferencia humana) para este checkpoint, por lo que la comparación se limita a tipo de modelo, formato y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de información sobre licencia: la model card remite a la licencia del proyecto original sin identificarla, lo que impide confirmar si el uso comercial está permitido.
- Sin datos de entrenamiento: no se puede evaluar la composición del dataset ni el riesgo de sesgos de representación (por ejemplo, predominio de estilos anime y de ciertos cánones estéticos).
- Riesgo de alucinación visual y de artefactos anatómicos: la propia model card incluye términos como «bad anatomy» y «artifacts» en el prompt negativo, lo que indica que el modelo puede producirlos.
- Dependencia de prompts en inglés: la receta documentada usa prompts en inglés; no se confirma soporte multilingüe.
- Adopción nula en el momento de la consulta (0 descargas, 0 likes), sin evidencia de la comunidad sobre estabilidad o calidad.
- El repositorio solo contiene pesos; no se incluyen scripts, workflows de ComfyUI ni configuración de inferencia más allá de los parámetros de la model card.
- La fecha de creación indicada (2026-11-05) es posterior a la fecha habitual de consulta; conviene verificar la vigencia del repositorio antes de integrarlo en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-hassakumixillustrious-v2.10-checkpoint
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2099422689857789954
- Página del autor en RunningHub: https://www.runninghub.ai/user-center/2007154923476885506
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentación de la API de RunningHub (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-hassakumixillustrious-v2.10-checkpoint/blob/main/README_cn.md
