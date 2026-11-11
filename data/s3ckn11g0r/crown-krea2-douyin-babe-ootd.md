# S3ckn11g0r/CROWN-Krea2-Douyin-Babe-OOTD

## Resumen

CROWN-Krea2-Douyin-Babe-OOTD es un LoRA de estilo y retrato para el modelo base Krea 2, desarrollado por el usuario NineCrowns (S3ckn11g0r en Hugging Face). No es un modelo de lenguaje ni un modelo fundacional: es un adaptador de bajo rango (rank 64) que se aplica sobre Krea 2 (Turbo y Raw) para especializar la generación text-to-image en retratos fotorrealistas de estética "Douyin" (influencer de belleza de Asia Oriental) y fotografías de moda OOTD (outfit of the day) en plano de tres cuartos.

El adaptador se entrenó a resolución nativa 1024×1536 sobre 295 imágenes de alta nitidez, cada una descrita individualmente con Qwen3-VL, en un clúster de 8×NVIDIA B200. Su innovación declarada es una arquitectura "blocks-only": solo se entrenan las 224 capas SingleStreamBlock mientras el TextFusionTransformer permanece congelado, con el objetivo de preservar microcontraste y evitar el desenfoque en primeros planos.

Es relevante para quien necesite generar retratos de moda con acabado fotográfico consistente y un estilo facial concreto, con inferencia rápida (8 pasos en Krea 2 Turbo). El repositorio ocupa 0,5 GB y el único peso publicado es un safetensors de 435,94 MB. No se han publicado métricas de benchmarks ni datos de rendimiento cuantitativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Krea 2; entrenamiento restringido a las 224 capas SingleStreamBlock, TextFusionTransformer congelado |
| Parametros totales | no disponible (peso publicado de 435,94 MB; rango 64) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors, presumiblemente bf16/fp16; no se documentan variantes GGUF ni FP8) |
| Idiomas soportados | no disponible (prompts en ingles y chino en la model card; el modelo base no documenta cobertura linguistica) |
| Licencia | bespoke-lora-license (licencia personalizada del autor; enlace a civitai.com/user/NineCrowns) |
| Formato de pesos | safetensors (`CROWN_Krea2_Douyin_Babe_Edgy_OOTD_V1_r64.safetensors`, SHA256 0FFF3B53987A2CFB4D08453CF20CB18795855EA27D8D7964A3C7562E791BE47B) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 aplicado sobre Krea 2. La decisión técnica documentada por el autor es entrenar exclusivamente las 224 capas SingleStreamBlock y mantener el TextFusionTransformer completamente congelado ("100% frozen/zero"). El objetivo declarado es doble: conservar el microcontraste de la imagen y evitar el desenfoque en retratos de primer plano, un problema habitual al especializar modelos de difusión en caras.

El dataset consta de 295 retratos de belleza y moda de Asia Oriental, filtrados por nitidez con un umbral de Laplaciano >= 85 y descritos individualmente con Qwen3-VL. El entrenamiento se realizó a 1024×1536 en un clúster de 8×NVIDIA B200. El adaptador se ajustó con el adaptador de de-destilación de Ostris para permitir inferencia nativa en 8 pasos con CFG 1.0 sobre `krea2_turbo_bf16.safetensors`, y se declara compatible con `krea2_raw_bf16.safetensors` a 28 pasos y CFG 3.5. No se especifican el número de pasos de entrenamiento, el optimizador, la tasa de aprendizaje ni la composición exacta del dataset más allá del recuento y el filtro de nitidez.

## Capacidades

- Generación text-to-image de retratos fotorrealistas de estética Douyin mediante el trigger `crown_babe_face` (primeros planos: estructura facial, poros, luces de iris, mechones de pelo).
- Fotografía de moda OOTD en plano de tres cuartos mediante el trigger `crown_babe_ootd` (proporciones de cintura a cadera, manos de cinco dedos, texturas de punto, seda, terciopelo y denim).
- Inferencia rápida en 8 pasos con CFG 1.0 y mu 1.15 sobre Krea 2 Turbo; modo de mayor calidad en 28 pasos con CFG 3.5 sobre Krea 2 Raw.
- Control de intensidad del estilo mediante peso LoRA recomendado entre 0.80 y 0.95 (los ejemplos se generaron a 0.85).
- Integración en flujos ComfyUI (etiqueta `comfyui` en el repo).
- No soporta tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni otras capacidades de un LLM: es un adaptador de generación de imágenes.

## Casos de uso

- Producción de contenido para redes sociales: generación de retratos de moda con un estilo facial consistente para cuentas de lifestyle o moda, usando `crown_babe_ootd` a 1024×1536 y peso 0.85 para mantener coherencia entre publicaciones.
- Pruebas de concepto de campañas de moda: generación rápida de variaciones de outfit y encuadre en 8 pasos con Krea 2 Turbo, útil para explorar direcciones creativas antes de una sesión fotográfica real.
- Creación de avatares y personajes sintéticos: el trigger `crown_babe_face` permite fijar un rostro de referencia para ilustraciones de marca o contenido editorial, siempre que se cumplan las condiciones de la licencia.
- Mockups de e-commerce de ropa: generación de tomas de tres cuartos con texturas de tejido nítidas (punto, seda, terciopelo, denim) para catálogos o fichas de producto preliminares.
- Ilustración editorial y moodboards: combinación del LoRA con el modelo base para producir referencias visuales de estética asiática contemporánea en flujos ComfyUI.
- Prototipado de pipelines de imagen en ComfyUI: validación de nodos, parámetros de sampler y escalados de resolución usando un adaptador ligero de 436 MB antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas (FID, CLIP score, SSIM ni comparativas cuantitativas); solo referencias cualitativas a la nitidez del dataset (Laplaciano >= 85) y a los parámetros de inferencia recomendados.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El LoRA pesa 435,94 MB y se suma a los pesos del modelo base Krea 2, que no se documentan en la información proporcionada.
- GPU recomendadas: el entrenamiento se realizó en 8×NVIDIA B200, pero no se indica el hardware mínimo ni recomendado para inferencia.
- Viabilidad en GPU de consumo: no disponible. Depende del modelo base Krea 2 y de su cuantización, dato no incluido en la ficha del adaptador.
- Opciones de despliegue: ComfyUI (etiqueta oficial del repo). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusión.
- Latencia y throughput: no disponibles. La model card solo indica que en Krea 2 Turbo la generación requiere 8 pasos con CFG 1.0, sin cifras de tiempo por imagen.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros LoRA de retrato o moda comparables, ni datos de rendimiento que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: el dataset se limita a 295 retratos de estética Douyin de Asia Oriental, por lo que el adaptador reproduce un canon facial y de belleza muy concreto y probablemente no generaliza a otras etnias, edades, complexiones o estilos.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomía incorrecta (manos, dedos, proporciones) pese a que la model card declara manos naturales; no hay validación independiente.
- Limitaciones de contexto e idioma: no aplica ventana de contexto; la cobertura de idiomas en prompts no está documentada y los ejemplos usan inglés y chino.
- Restricciones de licencia: la licencia es "bespoke-lora-license" (personalizada), no una licencia estándar tipo Apache o MIT. Antes de cualquier uso comercial es imprescindible revisar los términos en el enlace indicado por el autor; no se detallan aquí las condiciones de uso comercial.
- Dependencia del modelo base: el adaptador solo funciona sobre Krea 2 (Turbo o Raw); no es un modelo autónomo y su calidad final depende de la versión del base.
- Caveats para producción: no hay métricas de calidad publicadas, el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor no documenta pruebas de robustez ni de consistencia entre semillas.
- Contenido sensible: la temática ("babe", "alluring OOTD") puede producir resultados de índole sugerente; conviene aplicar filtros y políticas de contenido en entornos de producción.

## Enlaces

- Hugging Face: https://huggingface.co/S3ckn11g0r/CROWN-Krea2-Douyin-Babe-OOTD
- Civitai del autor: https://civitai.com/models/3046366
- Perfil del autor en Civitai (licencia): https://civitai.com/user/NineCrowns
- RunningHub (demo en la nube): https://www.runninghub.ai/model/public/2120441234207805442
