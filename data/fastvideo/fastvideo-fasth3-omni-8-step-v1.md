# FastVideo/FastVideo-FastH3-Omni-8-Step-V1

## Resumen

FastVideo-FastH3-Omni-8-Step-V1 es un checkpoint de generación de vídeo con audio sincronizado desarrollado por FastVideo en colaboración con Nuva Lab, afinado a partir del modelo base MiniMaxAI/MiniMax-H3. Su particularidad es que genera vídeo y pista de audio estéreo a 32 kHz en un único paso de muestreo reducido a ocho evaluaciones del transformer, con un valor de guidance de 1.0, en lugar de las decenas de pasos habituales en modelos de difusión para vídeo.

El modelo es de tipo reference-to-video (y text-to-audio-video): acepta un prompt de texto junto con referencias ordenadas de imagen, vídeo y audio —hasta nueve imágenes, tres vídeos y tres clips de audio, con un máximo de doce referencias— y produce un vídeo a 24 FPS con su banda sonora sincronizada. Las referencias se direccionan mediante etiquetas como `<Picture 1>`, `<Video 1>` y `<Audio 1>`, y los vídeos de referencia aportan también su propia pista de sonido.

Es relevante ahora porque se publica como release final en BF16 acompañado de un ecosistema de variantes (FP8, NVFP4 QAD, ComfyUI, decodificadores VAE NVFP4) y de dos rutas de despliegue: UniServe para servidor con GPUs Hopper o Blackwell, y FastVideo para inferencia local en DGX Spark y RTX 5090. El repositorio ocupa 70,1 GB y la licencia es la MiniMax-H3 Community License Agreement, no una licencia de código abierto estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión con atención condicionada por referencias; detalles internos (número de capas, dimensión) no disponibles |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible (no aplica como ventana de texto; la entrada se limita a un máximo de 12 referencias) |
| Tipos de cuantizacion | BF16 (este repositorio); variantes separadas en FP8 y en NVFP4 QAD (quantization-aware distillation); decodificadores VAE NVFP4 de 36 capas (calidad) y 8 capas (rápido) |
| Idiomas soportados | no disponible (la entrada de texto se procesa con el text encoder de MiniMax-H3) |
| Licencia | MiniMax-H3 Community License Agreement (license: other) |
| Formato de pesos | safetensors, librería diffusers |
| Pasos de muestreo | 8 evaluaciones del transformer, guidance 1.0 |
| Entradas | Prompt de texto + hasta 9 imágenes, 3 vídeos y 3 clips de audio (máximo 12 referencias; al menos una imagen o un vídeo) |
| Salidas | Vídeo a 24 FPS con audio estéreo sincronizado a 32 kHz |
| Resolucion por defecto (recetas locales) | 480p |
| Tamano del repositorio | 70,1 GB |
| Modelo base | MiniMaxAI/MiniMax-H3 (finetune) |
| Componentes incluidos | Transformer de referencia BF16, schedulers y configuración de inferencia |

## Arquitectura y entrenamiento

La información disponible describe un transformer de difusión condicionado por referencias, con una configuración de muestreo propia que fija el calendario de vídeo y audio y la atención condicionada por referencias. El pipeline completo no vive en este repositorio: el runtime carga el text encoder, el tokenizer, el procesador y los VAE de vídeo y audio desde MiniMax-H3, mientras que este checkpoint aporta únicamente el transformer de referencia BF16, los schedulers y la configuración de inferencia.

El dato diferencial es la reducción a ocho evaluaciones del transformer, que el autor presenta como el rasgo definitorio del modelo (sufijo "8-Step"). La model card no documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF, DPO o destilación por pasos; sí atribuye a Nuva Lab la definición y curación del dataset de referencias "omni" y menciona que el cómputo lo aportó Reactor, con agradecimiento al equipo NVIDIA FastGen. La variante NVFP4 se entrena explícitamente para ejecución en FP4 (quantization-aware distillation sobre Blackwell), lo que sugiere un proceso de cuantización con entrenamiento, pero los detalles no se detallan.

## Capacidades

- Generación conjunta de vídeo y audio sincronizado en una sola pasada, con salida a 24 FPS y audio estéreo de 32 kHz.
- Reference-to-video: condicionamiento por imágenes de referencia ordenadas, útil para mantener identidad de personaje, producto o escenario.
- Condicionamiento por vídeo de referencia, incluyendo su banda sonora, lo que permite transferir movimiento, estilo o ambiente sonoro.
- Condicionamiento por audio de referencia, para guiar la generación sonora o sincronizar la salida con un clip dado.
- Composición de hasta 12 referencias mezcladas (9 imágenes, 3 vídeos, 3 audio) con direccionamiento explícito mediante etiquetas `<Picture N>`, `<Video N>` y `<Audio N>`.
- Modo texto-a-vídeo-con-audio cuando se aporta prompt y al menos una imagen o vídeo como anclaje (la model card exige una referencia visual mínima).
- Inferencia rápida en 8 pasos con guidance 1.0, pensada para reducir latencia frente a schedulers de muchos pasos.
- No soporta tool calling, function calling, razonamiento multi-paso ni uso como agente: es un modelo generativo multimedia, no un LLM.
- No se documentan capacidades de edición iterativa, control por máscaras ni seguimiento de instrucciones multi-turno.

## Casos de uso

- Publicidad de producto con referencia visual: se aportan varias fotografías del artículo como `<Picture N>` y un prompt de escena; el modelo mantiene la apariencia del producto entre planos y genera el audio de ambiente o locución musical de forma sincronizada.
- Doblaje y sustitución de banda sonora: se usa un vídeo de referencia (con su audio original) más un clip de audio como `<Audio 1>` para regenerar la escena con una nueva pista, aprovechando que el condicionamiento de vídeo incorpora la banda sonora de origen.
- Previsualización de storyboard en preproducción: a partir de bocetos o frames clave como referencias de imagen se generan animáticas a 480p en pocos pasos, suficiente para validar ritmo y puesta en escena antes de producir en alta calidad.
- Vídeo musical y contenido audio-reactivo: el clip de audio de referencia guía la generación, de modo que el resultado mantiene la sincronía entre eventos sonoros y acción visual, un caso habitual en piezas cortas para redes.
- Consistencia de personaje en series cortas: reutilizando el mismo conjunto de imágenes de referencia en cada generación se obtienen episodios o variaciones con un personaje estable, algo crítico en contenido serializado.
- Transferencia de movimiento o estilo desde vídeo: se toma un clip existente como `<Video 1>` y se regenera con otro acabado visual, útil para pruebas de arte conceptual o adaptación de material de archivo.
- Prototipado local con datos sensibles: las recetas para DGX Spark (128 GB de memoria unificada) y RTX 5090 (32 GB) con la variante NVFP4 QAD permiten iterar sin enviar material a un servicio externo.
- Flujos de artista en ComfyUI: las variantes ComfyUI permiten integrar la generación en grafos nodales con otros modelos y utilidades de posprocesado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (FVD, VBench, CLIP-score, calidad de audio ni evaluaciones de sincronización labial), y tampoco se aportan cifras de latencia o throughput por GPU.

## Requisitos de hardware

- Pesos BF16: 70,1 GB de repositorio; a ello hay que sumar el text encoder, el tokenizer, el procesador y los VAE de vídeo y audio que se cargan desde MiniMax-H3. La estimación de VRAM total no está publicada y depende de la resolución y la duración solicitadas.
- GPUs de centro de datos soportadas para BF16 según la documentación: NVIDIA GB200/B200, RTX PRO 6000 Blackwell y familia Hopper (H100, H200), desplegadas con UniServe y el preset de precisión `quality`.
- GPU consumer: en BF16 el checkpoint no está pensado para GPUs de 24-32 GB; la ruta local pasa por la variante NVFP4 QAD en Blackwell (RTX 5090, 32 GB), con offload del text encoder y una tabla AdaLN precalculada obligatoria.
- DGX Spark (GB10, 128 GB de memoria unificada): receta `spark` con NVFP4 QAD, manteniendo todos los componentes del modelo residentes en memoria.
- RTX 4090: receta FP8 para hardware sin soporte FP4; requiere componentes de text encoder en BF16 compatibles, ya que el encoder NVFP4 incluido en el paquete FP8 exige Blackwell.
- Opciones de despliegue: UniServe (servidor, configuraciones `ref2va`, API de vídeo y audio, gestión de capacidades por petición), FastVideo (inferencia local), variantes ComfyUI para flujos visuales y decodificadores VAE NVFP4 opcionales seleccionables con `--decoder`.
- Latencia y throughput: no disponible. Como referencia cualitativa, el esquema de 8 evaluaciones del transformer está orientado a reducir el coste por generación frente a muestreos de muchos pasos, pero no se publican tiempos por clip.

## Comparativa con modelos similares

No se dispone de datos verificables de otros modelos de vídeo abiertos en la información proporcionada (parámetros, contexto, benchmarks), por lo que la comparación se limita a las variantes de la propia familia, que sí están documentadas:

| Modelo / variante | Precision | Hardware objetivo | Licencia | Notas |
|---|---|---|---|---|
| FastVideo-FastH3-Omni-8-Step-V1 (BF16) | BF16 | GB200/B200, RTX PRO 6000 Blackwell, H100/H200 (UniServe) | MiniMax-H3 Community License | Release final BF16; preset `quality` en servidor |
| FastH3-OmniRef-NVFP4-QAD | NVFP4 (quantization-aware distillation) | DGX Spark GB10, RTX 5090; requiere Blackwell | MiniMax-H3 Community License | Ruta local recomendada; salidas pueden diferir del BF16 |
| FastH3-OmniRef-FP8 | FP8 | RTX 4090 y hardware sin FP4 | MiniMax-H3 Community License | El text encoder NVFP4 incluido exige Blackwell; en GPUs sin FP4 hacen falta componentes BF16 |
| FastH3-OmniRef-Comfy | no disponible | Flujos ComfyUI | MiniMax-H3 Community License | Variante para workflows visuales |
| MiniMax-H3 (modelo base) | no disponible | no disponible | MiniMax-H3 Community License | Origen del text encoder, tokenizer, procesador y VAE compartidos |

## Limitaciones y advertencias

- Licencia restrictiva: se rige por la MiniMax-H3 Community License Agreement, no por una licencia open source estándar. Hay que revisar el texto completo antes de cualquier uso comercial, redistribución o servicio alojado.
- Dependencia de terceros: el repositorio no es autosuficiente; sin el text encoder, tokenizer, procesador y VAE de MiniMax-H3 el modelo no funciona, lo que añade requisitos de descarga y de cumplimiento de la licencia del modelo base.
- Sin benchmarks publicados: no hay métricas de calidad visual, fidelidad a la referencia ni sincronización audio-vídeo, por lo que la evaluación comparativa debe hacerse con pruebas propias.
- Divergencia entre precisiones: el propio autor advierte que las salidas FP8 y NVFP4 QAD pueden diferir de las BF16; no son intercambiables en un pipeline con control de calidad estricto.
- Resolución limitada en local: las recetas para DGX Spark y RTX 5090 fijan 480p por defecto; los tamaños y duraciones admitidos dependen del runtime y de la memoria disponible.
- Restricciones de entrada: se exige al menos una imagen o un vídeo de referencia y un máximo de doce referencias; el orden de las referencias es significativo y debe coincidir con las etiquetas del prompt.
- Riesgo de artefactos y alucinación visual: como modelo generativo de difusión, puede producir incoherencias anatómicas, texto ilegible en carteles o desajustes de sincronía; no se documenta ninguna mitigación específica.
- Sesgos: no se publica información sobre sesgos demográficos, culturales o de representación en el dataset de entrenamiento.
- Uso dual y deepfakes: la capacidad de condicionar por imágenes y audio de referencia facilita la suplantación de identidad; se recomienda marcar el contenido sintético y aplicar controles de consentimiento.
- Idiomas: no se declara cobertura lingüística del prompt; la calidad multilingüe no está verificada.
- Componente de configuración obligatorio: en RTX 5090 es necesaria una tabla AdaLN precalculada y mantener los ajustes de atención y precisión de la receta del dispositivo para evitar fallos o degradación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FastVideo/FastVideo-FastH3-Omni-8-Step-V1
- Colección de variantes de FastH3 Omni: https://huggingface.co/collections/FastVideo/fasth3-omniref
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia MiniMax-H3 Community License Agreement: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Variante NVFP4 QAD: https://huggingface.co/FastVideo/FastH3-OmniRef-NVFP4-QAD
- Variante FP8: https://huggingface.co/FastVideo/FastH3-OmniRef-FP8
- Variante ComfyUI: https://huggingface.co/FastVideo/FastH3-OmniRef-Comfy
- Decodificadores VAE NVFP4: https://huggingface.co/FastVideo/FastH3-NVFP4-VAE-Decoder
- Repositorio UniServe: https://github.com/hao-ai-lab/uniserve
- Guía de despliegue UniServe para MiniMax-H3: https://github.com/hao-ai-lab/uniserve/blob/main/docs/minimax_h3/minimax_h3.md#deployments
- Requisitos y configuración de UniServe: https://github.com/hao-ai-lab/uniserve/blob/main/docs/minimax_h3/minimax_h3.md#requirements
- Repositorio FastVideo: https://github.com/hao-ai-lab/FastVideo
- Guía de inferencia local de FastH3 Omni: https://github.com/hao-ai-lab/FastVideo/blob/main/docs/inference/fasth3_omniref.md
- Perfiles de dispositivo y FP8: https://github.com/hao-ai-lab/FastVideo/blob/main/docs/inference/fasth3_omniref.md#device-profiles
- Receta para DGX Spark: https://github.com/hao-ai-lab/FastVideo/blob/main/examples/inference/basic/basic_fasth3_omniref_spark.yaml
- Receta para RTX 5090: https://github.com/hao-ai-lab/FastVideo/blob/main/examples/inference/basic/basic_fasth3_omniref_rtx5090.yaml
- Receta para RTX 4090: https://github.com/hao-ai-lab/FastVideo/blob/main/examples/inference/basic/basic_fasth3_omniref_rtx4090.yaml
- Instalación de FastVideo en DGX Spark: https://haoailab.com/FastVideo/getting_started/installation/spark/
- Instalación de FastVideo en GPU: https://haoailab.com/FastVideo/getting_started/installation/gpu/
- Cookbook de FastVideo: https://haoailab.com/FastVideo/cookbook/
- Constructor de recetas FastH3 Omni: https://haoailab.com/FastVideo/cookbook/minimax-h3/fasth3-omniref/
- Nuva Lab, co-desarrollador del modelo: https://nuvalab.ai/fasth3/
- Reactor, proveedor de cómputo: https://www.reactor.inc/
