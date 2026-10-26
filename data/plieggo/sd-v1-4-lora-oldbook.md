# plieggo/sd-v1-4-lora-oldbook

## Resumen

`plieggo/sd-v1-4-lora-oldbook` es un adaptador LoRA (Low-Rank Adaptation) para Stable Diffusion v1.4 orientado a generar ilustraciones con estética de grabado y libro antiguo. Lo publica el usuario de HuggingFace `plieggo` y se entrena sobre el dataset `gigant/oldbookillustrations`, con 300 muestras, 3 épocas, batch de 3 y rango de descomposición r=6. No es un modelo completo, sino un conjunto de pesos que se aplica sobre el checkpoint base SD v1.4 para sesgar el estilo de generación.

El interés práctico es acotado y muy específico: reproduce una estética editorial decimonónica (xilografía, aguafuerte, grabado victoriano) sin necesidad de reentrenar el UNet completo, con un coste de almacenamiento mínimo y compatibilidad directa con el ecosistema `diffusers`. Es relevante para quien necesite un estilo gráfico concreto en pipelines de ilustración y no quiera depender de prompts largos y frágiles.

La información publicada es mínima: no hay licencia declarada, no hay prompt de instancia (`instance_prompt: null`), el campo `base_model` está vacío y el repositorio no incluye tarjeta con ejemplos comparativos más allá de dos imágenes "antes/después". Con 0 descargas y 0 likes en el momento de la consulta, se trata de un artefacto sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Stable Diffusion v1.4 (UNet con bloques ResNet + cross-attention, autoencoder VAE y text encoder CLIP); el adaptador inyecta matrices de bajo rango en las capas del UNet |
| Parametros totales | No disponible para el adaptador (rango r=6, repositorio de 0.0 GB). El modelo base SD v1.4 ronda los 860 M de parámetros en el UNet |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: modelo texto-a-imagen; la ventana del text encoder CLIP es de 77 tokens por prompt |
| Tipos de cuantizacion | No disponible en la model card. El adaptador se distribuye en formato `diffusers`; el base SD v1.4 admite fp16/fp32 y cuantizaciones de terceros (GGUF, ONNX) mediante herramientas externas |
| Idiomas soportados | No disponibles (los prompts de SD v1.4 se escriben habitualmente en inglés; el text encoder CLIP no está entrenado para español) |
| Licencia | No disponible (la model card no la declara) |
| Formato de pesos | Safetensors en estructura de repositorio `diffusers` (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Stable Diffusion v1.4, un modelo de difusión latente compuesto por un autoencoder VAE, un text encoder CLIP ViT-L/14 y un UNet con atención cruzada. La técnica LoRA congela los pesos del UNet y aprende matrices de descomposición de bajo rango que se suman a las proyecciones existentes; en este caso con rango r=6, lo que mantiene el adaptador muy pequeño y permite combinarlo con otros LoRA o con el checkpoint base sin reentrenar.

El entrenamiento se realizó sobre `gigant/oldbookillustrations` con 300 muestras, 3 épocas y batch de 3. No se documentan hiperparámetros adicionales (tasa de aprendizaje, resolución de entrenamiento, optimizer, si se entrenó solo el UNet o también el text encoder), ni si hubo regularización o validación. Tampoco se especifica un token o trigger word de activación: el campo `instance_prompt` aparece como `null`, por lo que se desconoce si el estilo se invoca mediante una palabra clave concreta o simplemente mediante la descripción del estilo en el prompt.

## Capacidades

- Generación de imágenes texto-a-imagen con estética de grabado, xilografía e ilustración de libro antiguo, aplicada sobre el checkpoint SD v1.4.
- Transferencia de estilo sobre prompts arbitrarios: el adaptador sesga la textura, la línea y la paleta hacia el estilo aprendido.
- Composición modular: al ser un LoRA, se puede cargar junto al modelo base y combinarse con otros adaptadores o con embeddings textuales.
- Compatibilidad con el pipeline `text-to-image` de la librería `diffusers`.
- Edición indirecta mediante img2img y ControlNet usando el adaptador sobre el base (no documentado por el autor, pero soportado por la arquitectura del base).
- Soporte de tool calling, agentes, razonamiento multi-paso, visión, audio y modo thinking: no disponible (no son capacidades de un modelo de difusión).
- Capacidades multilingües: no disponibles; el text encoder CLIP de SD v1.4 está orientado a inglés.

## Casos de uso

- Ilustración editorial de temática histórica: generar grabados de época para artículos, libros o revistas digitales usando el adaptador sobre SD v1.4 con prompts descriptivos; el estilo se aplica de forma consistente sin repetir el prompt estilístico completo en cada generación.
- Portadas de libros y ebooks: producir cubiertas con estética decimonónica coherente con reediciones de clásicos, con coste de cómputo bajo porque el adaptador pesa muy poco y el base cabe en GPU de consumo.
- Material para juegos de rol y ambientación histórica: generar ilustraciones de bestiarios, mapas decorados y láminas de manuales con la misma textura de grabado en lotes grandes mediante scripts de `diffusers`.
- Prototipado rápido de dirección de arte: un estudio puede evaluar una línea gráfica de estilo antiguo en horas y comparar variantes con otros LoRA, ya que el adaptador se puede activar y desactivar sin recargar el base.
- Aumento de datos para clasificadores de grabado: sintetizar muestras con estética de libro antiguo para equilibrar datasets de visión por computador de patrimonio documental.
- Assets para proyectos de dominio público: ilustraciones para digitalizaciones de archivos, museos o bibliotecas que necesiten material gráfico coherente con fondos históricos.
- Exploración creativa en local: al requerir poca VRAM adicional sobre SD v1.4, permite experimentar en portátiles con GPU de 6-8 GB sin servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye dos imágenes de comparación (antes/después) sin métricas objetivas, sin FID, sin CLIP score ni evaluación humana documentada.

## Requisitos de hardware

- VRAM estimada: alrededor de 4-6 GB en fp16 para SD v1.4 con el adaptador LoRA cargado; el adaptador en sí añade un consumo despreciable (unos pocos MB) frente al base.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 8-16 GB, RTX 4070/4080/4090 para generación por lotes; A100 o H100 solo si se generan grandes volúmenes en paralelo.
- Cabe en GPU de consumo: sí, en cualquier GPU con 6 GB o más de VRAM; también en Apple Silicon mediante MPS y en CPU (mucho más lento).
- Opciones de despliegue: `diffusers` (referencia para cargar el LoRA con `load_lora_weights`), ComfyUI, Automatic1111 / Forge, InvokeAI, `stable-diffusion.cpp` o `diffusers` con `optimum` para cuantización.
- Latencia y throughput: no disponibles en la información proporcionada; dependen de la GPU, de los pasos de muestreo, del scheduler y de la resolución (512x512 es la resolución nativa de SD v1.4).

## Comparativa con modelos similares

| Modelo | Base | Entrenamiento | Licencia | Estado |
|---|---|---|---|---|
| `plieggo/sd-v1-4-lora-oldbook` | SD v1.4 | 300 muestras, 3 épocas, batch 3, r=6 sobre `gigant/oldbookillustrations` | No disponible | 0 descargas, 0 likes |
| `adrianoropezal/sd-v1-4-oldbook-illustrations-lora` | SD v1.4 | Basado en `gigant/oldbookillustrations`; hiperparámetros no verificados | `creativeml-openrail-m` | Repositorio publicado con model card y ejemplos |
| `Th4dd3us/sd14-oldbook-lora` | SD 1.4 | No disponible | No verificada en la información recogida | Repositorio publicado |
| `agg-07/sd-v1-4-lora-oldbookillustrations` | SD v1.4 | No disponible | No disponible | Solo aparece como registro en agregadores |

La diferencia principal frente a las alternativas es la licencia: `adrianoropezal/sd-v1-4-oldbook-illustrations-lora` declara `creativeml-openrail-m`, mientras que este adaptador no declara ninguna, lo que complica su uso comercial. En parámetros y contexto no hay diferencias significativas porque todos comparten el mismo base.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no se puede asumir permiso de uso comercial; hay que contactar con el autor o descartar el adaptador para producción.
- Sin validación comunitaria: 0 descargas y 0 likes implican ausencia de evidencia externa sobre calidad, estabilidad o fidelidad del estilo.
- Dataset pequeño y pocas épocas: 300 muestras y 3 épocas con r=6 pueden producir un ajuste débil al estilo o, en el extremo contrario, sobreajuste a las imágenes concretas del dataset y escasa generalización a composiciones nuevas.
- Sin trigger word documentado: `instance_prompt` es `null`, así que no se sabe cómo activar el estilo de forma fiable; puede requerir prueba y error con prompts descriptivos.
- Campo `base_model` vacío: no se confirma oficialmente la versión exacta del checkpoint base, lo que puede provocar diferencias de comportamiento según el fichero de SD v1.4 que se use.
- Riesgo de alucinación visual y artefactos: como todo modelo de difusión, puede generar anatomías incorrectas, texto ilegible y detalles incoherentes, especialmente en resoluciones distintas de 512x512.
- Limitación de idioma: el text encoder CLIP de SD v1.4 funciona mejor en inglés; los prompts en castellano rinden peor.
- Sesgos heredados: el adaptador arrastra los sesgos del dataset de grabados históricos y del propio SD v1.4 (representación de personas, culturas y épocas muy condicionada por el material original).
- Sin métricas ni evaluación: no hay benchmarks que permitan comparar objetivamente la calidad frente a otros LoRA de estilo.

## Enlaces

- HuggingFace: https://huggingface.co/plieggo/sd-v1-4-lora-oldbook
- Dataset de entrenamiento: https://huggingface.co/datasets/gigant/oldbookillustrations
- Alternativa con licencia declarada: https://huggingface.co/adrianoropezal/sd-v1-4-oldbook-illustrations-lora
- Alternativa relacionada: https://huggingface.co/Th4dd3us/sd14-oldbook-lora
- Repositorio GitHub relacionado: https://github.com/PMurguia/sd14-oldbook-lora
- Registro en agregador: https://free2aitools.com/model/agg-07/sd-v1-4-lora-oldbookillustrations
- Modelo base: https://huggingface.co/CompVis/stable-diffusion-v1-4
