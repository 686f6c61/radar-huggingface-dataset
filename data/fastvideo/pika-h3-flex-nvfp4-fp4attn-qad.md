# FastVideo/Pika-H3-Flex-NVFP4-FP4Attn-QAD

## Resumen

Pika-H3-Flex-NVFP4-FP4Attn-QAD es una variante cuantizada del modelo de generación de vídeo Pika H3 Flex, publicada por FastVideo (laboratorio hao-ai-lab). Se trata de un checkpoint derivado de Pika-Labs/Pika-H3-Flex, a su vez construido sobre MiniMax H3, que empaqueta el transformer de difusión en NVFP4 (punto flotante de 4 bits de NVIDIA) y ejecuta además la atención en 4 bits mediante la ruta NVFP4 de FlashAttention-4. El objetivo es acelerar la inferencia de clips largos y de alta resolución en GPUs NVIDIA Blackwell sin alejarse demasiado de la fidelidad del modelo en BF16.

El modelo resuelve la generación conjunta de vídeo y audio a partir de texto (T2VA), de una o varias imágenes de referencia (I2VA, L2VA, FL2VA) y de referencias multimodales que combinan hasta 9 imágenes, 3 vídeos y 3 clips de audio (Ref2VA). Cuenta con 13.855.408.896 parámetros en el transformer principal y un repositorio de 106 GB que incluye transformer, transformer_ref, text encoder Qwen3-VL, VAEs de vídeo y audio, scheduler y tokenizer.

Su relevancia es doble: por un lado, demuestra una receta de destilación con reconocimiento de cuantización (QAD) aplicada a un modelo de difusión de vídeo; por otro, es una de las primeras implementaciones públicas que llevan las queries y las claves de la atención a NVFP4 con transformaciones (key smoothing y rotación de Hadamard) que preservan matemáticamente la salida de la atención. La licencia es la MiniMax H3 Community License Agreement, no permisiva en sentido amplio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) para generación conjunta de vídeo y audio, con atención FlashAttention-4 en ruta NVFP4 para Q/K |
| Parametros totales | 13.855.408.896 (transformer; el repo incluye además text encoder, VAEs y decodificador) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 en capas lineales, NVFP4 en atención (Q/K), BF16 en bloques 45 y 49 y en probabilidades de atención y values; decodificador VAE en NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (derivado de MiniMax H3 y Pika H3 Flex); Qwen3-VL bajo Apache 2.0 |
| Formato de pesos | safetensors (checkpoints NVFP4 empaquetados, listos para FastVideo), librería diffusers |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión (DiT) que genera vídeo y audio de forma conjunta. La variante FP4Attn mantiene el transformer principal (`transformer/`) para T2VA, I2VA, L2VA y FL2VA, y un transformer condicionado por referencias (`transformer_ref/`) para Ref2VA. El text encoder es Qwen3-VL cuantizado en NVFP4, y se incluyen VAEs separados para vídeo y audio, además de un decodificador de vídeo NVFP4. Los adaptadores de Pika ya están fusionados en los transformers, como indica el fichero `pika_h3_flex_merged.json`.

La innovación central es la atención en 4 bits. FlashAttention-4 almacena queries y claves como valores de 4 bits con una escala por cada 16 canales. Para hacerlas cuantizables sin alterar la salida, se aplican dos transformaciones: key smoothing (se resta la clave media de cada cabeza, un desplazamiento que el softmax ignora) y rotación de Hadamard (se rota Q y K por la misma matriz ortonormal, preservando los productos escalares y repartiendo los canales atípicos entre bloques de cuantización). Dos de los cincuenta bloques del transformer conservan atención en BF16 (bloques 45 y 49). El modelo se obtuvo por destilación con reconocimiento de cuantización (QAD) partiendo del modelo NVFP4-QAD con atención BF16, y se entrenó bajo exactamente estas numéricas; la receta completa está documentada en el repositorio de FastVideo.

## Capacidades

- Generación de vídeo con audio sincronizado a partir de texto (T2VA).
- Generación de vídeo a partir de una primera imagen (I2VA), una última imagen (L2VA) o ambas (FL2VA).
- Generación condicionada por referencias multimodales (Ref2VA): hasta 9 imágenes, 3 vídeos y 3 clips de audio como entrada.
- Resoluciones de hasta 768p y duraciones de hasta 15 segundos según los ejemplos de la model card.
- Salida de vídeo y audio conjuntos, con VAE de vídeo y VAE de audio independientes.
- Inferencia acelerada en GPUs NVIDIA Blackwell mediante kernels NVFP4 y FlashAttention-4.
- Compatibilidad con el ecosistema diffusers y con el runtime FastVideo.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; es un modelo generativo de medios, no un LLM conversacional.

## Casos de uso

- Publicidad y contenido de marca: generación de clips de hasta 15 segundos en 768p a partir de un prompt y una primera imagen de producto, útil para prototipado rápido de anuncios sin rodaje.
- Previsualización de storyboards: uso de L2VA o FL2VA para interpolar entre un fotograma inicial y uno final definidos por el equipo creativo, validando transiciones antes de producir.
- Doblaje y posproducción con audio: la generación conjunta de vídeo y audio permite crear borradores con pista sonora sincronizada para revisión temprana.
- Vídeo con referencias de personaje o estilo (Ref2VA): hasta 9 imágenes y 3 vídeos de referencia permiten mantener coherencia de identidad o estética en secuencias cortas, adecuado para series de contenido.
- Infraestructura de generación a escala en Blackwell: gracias a la cuantización NVFP4 y a la atención FP4, el modelo es adecuado para servicios que priorizan throughput en clips largos, donde la atención domina el coste.
- Investigación en cuantización de modelos de difusión: sirve como referencia reproducible de QAD aplicado a un DiT de vídeo, con receta de entrenamiento publicada.
- Integración en pipelines de creación asistida: al cargarse directamente en FastVideo y diffusers, puede incorporarse a herramientas internas de generación por lotes con prompts y referencias gestionadas por un orquestador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, VBench u otros). El único dato de rendimiento aportado por la model card es comparativo: en una GB200, un clip de 15 segundos a 768p es aproximadamente un 12 % más rápido de extremo a extremo que la variante con atención BF16, mientras que los clips cortos rinden a velocidad similar.

## Requisitos de hardware

- GPU NVIDIA Blackwell obligatoria para los kernels NVFP4 y la atención FP4; en otras GPUs debe usarse Pika H3 Flex en BF16.
- El ejemplo de la model card cita una GB200 para la medición del 12 % de mejora; no se detallan cifras de VRAM.
- VRAM estimada: no disponible de forma oficial; el repo ocupa 106 GB e incluye transformer, transformer_ref, text encoder, VAEs y decodificador, por lo que la huella en memoria es considerable incluso en 4 bits.
- No cabe en GPUs de consumo convencionales por la ausencia de soporte NVFP4 fuera de Blackwell y por el tamaño del conjunto de componentes.
- Despliegue mediante FastVideo con FlashAttention-4 (`FASTVIDEO_ATTENTION_BACKEND=FLASH_ATTN`, `FASTVIDEO_FA4=1`), cargando el checkpoint NVFP4 directamente sin conversión.
- Variables de configuración relevantes: `FASTVIDEO_NVFP4_FA4=1`, `FASTVIDEO_NVFP4_FA4_QK_TRANSFORM=smooth_k+hadamard`, `FASTVIDEO_NVFP4_FA4_BF16_BLOCKS=45,49`.
- Latencia y throughput: solo se conoce la mejora relativa del 12 % en clips de 15 s a 768p en GB200 frente a la variante BF16-attention; no hay cifras absolutas publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Atención | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Pika-H3-Flex-NVFP4-FP4Attn-QAD (este) | 13.855.408.896 | NVFP4 Q/K (FA-4), BF16 en bloques 45 y 49 | NVFP4 lineales + NVFP4 atención | MiniMax H3 Community License | Más rápido en clips largos; pensado para Blackwell |
| Pika-H3-Flex-NVFP4-QAD | mismo transformer base | BF16 | NVFP4 lineales | MiniMax H3 Community License | Mayor fidelidad, salida más cercana a BF16 Flex |
| Pika-Labs/Pika-H3-Flex | no disponible en la información | BF16 | BF16 | licencia de Pika H3 Flex (no detallada) | Modelo base sin cuantizar; referencia de calidad |
| MiniMaxAI/MiniMax-H3 | no disponible en la información | no disponible | no disponible | MiniMax H3 Community License | Modelo original del que deriva la familia |

## Limitaciones y advertencias

- Requiere GPU NVIDIA Blackwell; en hardware anterior no es utilizable y hay que recurrir a Pika H3 Flex en BF16.
- La salida cuantizada puede diferir de la salida en BF16; no es un reemplazo exacto en fidelidad.
- Con entradas de referencia, el fotograma inicial puede seguir algo menos de cerca la referencia de primer fotograma que en la variante con atención BF16.
- El modelo está ajustado para atención FP4; usarlo con atención BF16 funciona, pero para ese caso se recomienda la variante NVFP4-QAD con atención BF16.
- Licencia MiniMax H3 Community License Agreement: no es una licencia de código abierto permisiva; conviene revisar `LICENSE`, `NOTICE` y `THIRD_PARTY_NOTICES.md` antes de uso comercial.
- Riesgo de alucinación visual y de artefactos propios de modelos generativos de vídeo; no se documentan sesgos específicos.
- Idiomas soportados no documentados; el text encoder Qwen3-VL es multilingüe, pero no se confirma el comportamiento por idioma en la generación.
- Longitud de contexto y límites de duración más allá de los 15 segundos del ejemplo no están documentados.
- Solo 4 descargas y 0 likes en el momento de la ficha: ecosistema de usuarios muy reducido, lo que limita la validación comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/FastVideo/Pika-H3-Flex-NVFP4-FP4Attn-QAD
- Modelo base: https://huggingface.co/Pika-Labs/Pika-H3-Flex
- Modelo original: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Variante con atención BF16: https://huggingface.co/FastVideo/Pika-H3-Flex-NVFP4-QAD
- Repositorio FastVideo: https://github.com/hao-ai-lab/FastVideo
- Guía de inferencia: https://github.com/hao-ai-lab/FastVideo/blob/main/docs/inference/pika_h3_flex.md
- Receta de entrenamiento QAD: https://github.com/hao-ai-lab/FastVideo/blob/main/docs/training/pika_h3_flex_qad.md
