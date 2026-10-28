# RunningHubAI/rh-wuji-zib2603-nsfwz-image-base-checkpoint

## Resumen

`rh-wuji-zib2603-nsfwz-image-base-checkpoint` es un checkpoint de generación de imágenes texto-a-imagen publicado por RunningHubAI (cuenta de la plataforma RunningHub) para su uso en ComfyUI. Se trata de un ajuste fino (finetune) del modelo base Z-image-base, desarrollado por el usuario @迎风 de RunningHub, orientado explícitamente a un estilo fotorrealista extremo y con sesgo NSFW. El repositorio de HuggingFace contiene un único archivo de pesos en formato safetensors de 19.572 MiB (aproximadamente 20,5 GB), pensado para cargarse como checkpoint todo-en-uno en ComfyUI o ejecutarse en la nube de RunningHub.

El modelo no aporta una model card técnica al uso: no declara arquitectura, número de parámetros, volumen de entrenamiento ni resultados de evaluación. La información disponible se limita a la receta de inferencia (muestreador euler con scheduler simple, entre 6 y 12 pasos), a los componentes que el autor indica haber fusionado (el VAE `UltraFlux-v1_model.safetensors` y el encoder de texto CLIP `qwen_3_4b.safetensors`) y a la base declarada (Z-image-base con un refinamiento Flow-DPO).

Su relevancia es acotada y de nicho: es un checkpoint comunitario de la familia WuJi de RunningHub, publicado el 28 de octubre de 2026 y, en el momento de redactar esta ficha, sin descargas ni valoraciones. Resulta de interés para quien ya trabaje con el ecosistema Z-image-base en ComfyUI y busque un ajuste orientado a retrato y figura hiperrealista, no como modelo de propósito general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (checkpoint de difusion texto-a-imagen derivado de Z-image-base; el autor no detalla la arquitectura interna) |
| Parametros totales | No disponible (el archivo de pesos ocupa 19.572 MiB; no se confirma el recuento) |
| Parametros activos | No aplica (no se declara como MoE) |
| Longitud de contexto | No disponible (limite de tokens de prompt no declarado) |
| Tipos de cuantizacion | No se publican variantes cuantizadas; el repositorio solo distribuye safetensors. Compatible con fp8/offloading mediante ComfyUI |
| Idiomas soportados | No disponible (el encoder de texto es `qwen_3_4b`, pero el autor no declara cobertura idiomatica) |
| Licencia | No disponible. RunningHub publica en nombre del autor y remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`WuJi_ZIB2603_NSFW.safetensors`, 19.572 MiB) |
| Tipo de pipeline | text-to-image |
| Encoder de texto | CLIP `qwen_3_4b.safetensors` (segun el autor) |
| VAE | `UltraFlux-v1_model.safetensors` (fusionado segun el autor) |
| Modelo base | Z-image-base, con refinamiento Flow-DPO |
| Muestreador recomendado | euler + simple |
| Pasos recomendados | 6 a 12 |
| Tamano del repositorio | 20,5 GB |

## Arquitectura y entrenamiento

El autor describe el modelo como un finetune construido sobre Z-image-base más una variante con Flow-DPO (“黑兽”) y con dos componentes externos integrados en el checkpoint: el VAE `UltraFlux-v1_model.safetensors` y el encoder de texto `qwen_3_4b.safetensors`. No se especifica la arquitectura del difusor (no se confirma si es un transformer de difusión, un UNet o un modelo híbrido), ni el número de parámetros, ni la resolución nativa de entrenamiento.

Tampoco se documentan los datos de entrenamiento: no hay cifras de imágenes, composición del dataset, resolución, uso de captions sintéticas ni detalle del proceso de alineación (DPO, RLHF u otras técnicas de preferencia). La única referencia al entrenamiento es la mención de Flow-DPO como parte de la base, sin desarrollo. El resultado declarado es una especialización en “estilo realista hiperrealista”, con una advertencia explícita de que el sesgo NSFW de la base provoca que los personajes aparezcan con ropa relativamente sugerente y que algunas generaciones fallen los filtros de moderación.

## Capacidades

- Generación de imágenes texto-a-imagen en estilo fotorrealista, con énfasis declarado en realismo extremo (“超真实感写实风格”).
- Integración nativa con ComfyUI como checkpoint único, sin necesidad de cargar VAE o encoder de texto por separado.
- Inferencia rápida por diseño: la receta recomendada es de solo 6 a 12 pasos con euler + simple.
- Ejecución en la nube de RunningHub, tanto en la versión internacional como en la china, y a través de su API.
- Generación de figuras humanas con sesgo NSFW, con la salvedad de que parte de las salidas puede ser bloqueada por los sistemas de moderación.
- Muestreo controlable mediante prompt negativo; el autor sugiere incluir “NSFW” en el negativo para reducir los fallos de moderación.
- No se declaran capacidades de imagen-a-imagen, inpainting, control estructural (ControlNet), tool calling, agentes ni razonamiento multietapa.

## Casos de uso

- **Fotografía editorial y de moda simulada**: el checkpoint está orientado a realismo de piel, iluminación y figura, por lo que encaja en la generación de moodboards y previsualizaciones de sesiones antes de producirlas con cámara.
- **Previsualización de iluminación en estudio**: con 6-12 pasos y euler + simple se pueden iterar decenas de variantes de esquema de luz sobre un mismo prompt en poco tiempo, útil para dirección de fotografía.
- **Prototipado de creatividades publicitarias**: generación de referencias visuales fotorrealistas para presentar a cliente antes de contratar producción real, con la ventaja de un único archivo de checkpoint en ComfyUI.
- **Estudio de figura y anatomía artística**: para ilustradores que necesitan referencias de pose y proporción; conviene usar el prompt negativo y, si el flujo de trabajo lo permite, la variante SFW mencionada por el autor.
- **Contenido para plataformas para adultos con verificación de edad**: es el nicho declarado del modelo; cualquier despliegue exige control de edad, cumplimiento normativo y revisión humana previa a publicación.
- **Pruebas de pipelines y nodos de ComfyUI**: al ser un checkpoint todo-en-uno de ~20 GB, sirve para validar flujos de trabajo con VAE y CLIP embebidos, gestión de VRAM y offloading en entornos de CI de generación de imágenes.
- **Generación de datasets sintéticos de rostro y cuerpo**: para entrenar detectores o modelos de estética, siempre que la licencia del upstream lo permita, algo que en este repositorio no está aclarado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta FID, CLIP score, evaluación humana ni comparaciones cuantitativas con otros checkpoints. Tampoco se dispone de mediciones de latencia o throughput por paso.

## Requisitos de hardware

- **Huella de pesos**: 19.572 MiB (unos 19,1 GiB) en un único archivo safetensors.
- **VRAM en precisión nativa (fp16/bf16)**: se necesita espacio para los pesos completos más activaciones y el VAE; en la práctica requiere GPUs de 24 GB o más (RTX 3090, RTX 4090, A100 40 GB, H100). No se dispone de medición oficial de consumo pico.
- **VRAM con fp8 u offloading parcial**: al reducir los pesos a 8 bits, el checkpoint se sitúa alrededor de 10 GB, lo que lo hace viable en GPUs consumer de 12-16 GB (RTX 4070 Ti Super, RTX 4080, RTX 4060 Ti 16 GB) con penalización de velocidad. Dato estimado a partir del tamaño del archivo, no publicado por el autor.
- **Offloading secuencial a CPU**: ComfyUI permite ejecutarlo en GPUs de 8-10 GB descargando bloques a RAM; la latencia aumenta de forma significativa y requiere RAM del sistema abundante.
- **Cabe en GPU consumer**: sí, en el rango de 16-24 GB sin cuantización adicional; en 8-12 GB solo con fp8 u offloading.
- **Despliegue**: ComfyUI es la vía prevista (checkpoint nativo); también la nube y la API de RunningHub. No se documenta soporte para vLLM o TGI, que no aplican a este tipo de modelo; llama.cpp/GGUF no está publicado en el repositorio.
- **Latencia y throughput**: no disponibles. Cualitativamente, el régimen de 6-12 pasos reduce el coste por imagen frente a modelos que requieren 20-50 pasos, pero no hay cifras de segundos por imagen ni de imágenes por minuto.

## Comparativa con modelos similares

| Modelo | Base | Enfoque | Tamano del repo | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `rh-wuji-zib2603-nsfwz-image-base-checkpoint` (este) | Z-image-base + Flow-DPO | Fotorrealismo con sesgo NSFW | 20,5 GB | safetensors | No disponible | HuggingFace + RunningHub |
| `rh-wuji-z-image-base2603-checkpoint` | Z-image-base | Multestilo (no centrado en NSFW) | 20,5 GB | safetensors | No disponible | HuggingFace + RunningHub |
| `rh-wuji-qwen2511-aio-nsfw-2603-checkpoint` | Familia Qwen (según nomenclatura) | NSFW, pipeline image-text-to-image | No disponible | safetensors | No disponible | HuggingFace + RunningHub |
| Z-image-base (upstream) | — | Base generativa texto-a-imagen | No disponible | No disponible | No disponible en esta información | No disponible |

No se dispone de parámetros, longitud de contexto ni resultados de benchmarks de ninguno de estos modelos en la información consultada, por lo que la comparación se limita a base, enfoque, tamaño, formato y disponibilidad.

## Limitaciones y advertencias

- **Contenido NSFW**: el modelo está entrenado sobre una base con sesgo explícito; el propio autor advierte de ropa sugerente y de fallos de moderación. No es apto para entornos sin política de contenido clara.
- **Bloqueos por moderación**: parte de las generaciones puede ser rechazada por los filtros de la plataforma. El autor recomienda añadir “NSFW” al prompt negativo o usar la variante SFW, lo que indica que el comportamiento no es determinista en este aspecto.
- **Licencia sin definir**: el repositorio no incluye un archivo de licencia; RunningHub remite a la licencia del proyecto original o upstream. Esto impide confirmar el uso comercial y obliga a verificar los términos de Z-image-base antes de cualquier despliegue en producción.
- **Ausencia de documentación técnica**: sin arquitectura, número de parámetros, datos de entrenamiento ni evaluación, es imposible reproducir el modelo o auditar sus sesgos de forma rigurosa.
- **Riesgo de alucinación visual**: como todo modelo de difusión, puede producir anatomía incorrecta (manos, dedos, ojos), texto ilegible y artefactos en fondos complejos; no hay evaluación publicada de tasas de error.
- **Idiomas y prompt**: no se declaran idiomas soportados; el encoder es Qwen3-4B, pero se desconoce el comportamiento real con prompts en castellano y la calidad relativa frente al inglés.
- **Sesgos de representación**: un finetune orientado a realismo y a un nicho concreto tiende a sobrerrepresentar ciertos cánones de cuerpo, edad y etnia; no hay documentación de mitigación.
- **Marco legal**: el autor exige uso dentro del ámbito legal y declina responsabilidad. Cualquier uso comercial debe contemplar verificación de edad, derechos de imagen y normativa aplicable.
- **Madurez del artefacto**: 0 descargas y 0 valoraciones en el momento de la consulta; sin reportes de la comunidad sobre estabilidad o calidad.
- **Resolución nativa no declarada**: se desconoce la resolución de entrenamiento y el rango óptimo de aspect ratios.

## Enlaces

- HuggingFace: https://huggingface.co/RunningHubAI/rh-wuji-zib2603-nsfwz-image-base-checkpoint
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2032425390123261954
- Página del autor en RunningHub: https://www.runninghub.cn/user-center/1934265933848289281
- RunningHub internacional: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- Repositorio hermano (multestilo): https://huggingface.co/RunningHubAI/rh-wuji-z-image-base2603-checkpoint
- Repositorio hermano (Qwen 2511, NSFW): https://huggingface.co/RunningHubAI/rh-wuji-qwen2511-aio-nsfw-2603-checkpoint
