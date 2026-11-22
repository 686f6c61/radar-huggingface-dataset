# LokkenJP/TenEros_Max_optimized_learned

## Resumen

TenEros_Max_optimized_learned es una cuantización aprendida (activation-aware) del transformer de generación de vídeo ErosMax v1 de TenStrip, a su vez derivado de MiniMax H3. El autor, LokkenJP, publica dos variantes del checkpoint: HQ (17,92 GB) y Compact (14,50 GB), ambas partiendo de un transformer BF16 original de 40,22 GB. El objetivo es reducir el peso en disco y los requisitos de memoria de inferencia sin renunciar al Turbo integrado de ocho pasos del modelo base, que permite generar vídeo con muy pocos pasos de muestreo.

El modelo es un pipeline image-text-to-video que acepta condicionamiento textual (y opcionalmente una imagen de referencia) para producir vídeo con audio asociado, ya que requiere VAEs de vídeo y audio suministrados por separado. La cuantización combina matrices de pesos en W4/W6 con grupos de 16 pesos por escala (g16) y capas en INT8, además de ocho matrices INT8 aprendidas en el token refiner que procesa el condicionamiento textual del transformer.

La relevancia actual radica en que permite ejecutar un modelo de vídeo de gran tamano en hardware de consumo mediante ComfyUI, con soporte nativo de W6A8, INT8 ConvRot y W4A8 para la variante Compact. La licencia es la MiniMax H3 Community License Agreement, no plenamente permisiva, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para vídeo (derivado de MiniMax H3), con token refiner para condicionamiento textual |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W6A8 g16 e INT8 (HQ); W4A8 g16, W6A8 g16 e INT8 (Compact); ocho matrices INT8 aprendidas en el token refiner |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (other) |
| Formato de pesos | safetensors (checkpoints de ComfyUI en `diffusion_models`) |

Detalle de las variantes:

| Variante | Tamano | Matrices del transformer principal | Sidecars |
|---|---:|---|---|
| HQ | 17,92 GB | 90 en W6 g16, 110 en INT8 | SHA-256 y reporte de cuantizacion |
| Compact | 14,50 GB | 64 en W4 g16, 122 en W6 g16, 14 en INT8 | SHA-256 y reporte de cuantizacion |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion post-entrenamiento del transformer de ErosMax v1 (TenStrip/10Eros-Max), que a su vez se basa en MiniMax H3. No se trata de un modelo entrenado desde cero: el proceso consiste en seleccionar precisiones por matriz (W4, W6 o INT8) y aprender las escalas de activacion para minimizar el error de reconstruccion respecto a las salidas BF16 originales. Las matrices se agrupan en bloques de 16 pesos que comparten escala (`g16`), y el token refiner, que procesa el condicionamiento textual del transformer, conserva ocho matrices INT8 aprendidas.

La innovacion principal es el esquema de cuantizacion activation-aware con asignacion de precision por familia de tensores, evaluado sobre 200 matrices principales con un split de desarrollo. El error de activacion bruto medido como NRMSE normalizado es del 0,531 % en HQ y del 1,386 % en Compact, frente al 2,927 % de la linea base sin aprendizaje con la precision seleccionada para Compact; esto supone una reduccion del 52,64 % del error en esa variante. El modelo conserva el Turbo de ocho pasos del upstream, por lo que no requiere decodificacion especulativa ni tecnicas adicionales de aceleracion. No se dispone de informacion sobre el dataset de entrenamiento original ni sobre si hubo RLHF o DPO.

## Capacidades

- Generacion de vídeo a partir de texto (text-to-video).
- Generacion de vídeo a partir de texto e imagen de referencia (image-text-to-video).
- Generacion de vídeo a partir de imagen (image-to-video), segun las etiquetas del repositorio.
- Generacion de audio asociada al vídeo, mediante un VAE de audio separado.
- Muestreo Turbo integrado de ocho pasos, heredado del modelo base.
- Condicionamiento textual procesado por un token refiner con matrices INT8 aprendidas.
- Integracion con ComfyUI mediante workflows de dos pasadas (simple y avanzado).
- Compatibilidad con text encoders Qwen3-VL 32B en variantes HQ, Balanced y Compact.
- Soporte nativo de W6A8, INT8 ConvRot y W4A8 (este ultimo solo en Compact) en builds recientes de ComfyUI.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso: es un modelo generativo de vídeo, no un LLM conversacional.

## Casos de uso

- Prototipado rapido de vídeo generativo en estaciones de trabajo con GPU de consumo: la variante Compact de 14,50 GB permite cargar el transformer en ComfyUI con offloading parcial, reduciendo la barrera de entrada frente al BF16 de 40,22 GB.
- Produccion de clips cortos para redes sociales: el Turbo de ocho pasos reduce el coste por iteracion, lo que facilita generar multiples variaciones de una misma escena y seleccionar la mejor.
- Animacion de storyboards a partir de una imagen clave: el pipeline image-to-video permite partir de un fotograma de referencia y generar el movimiento, util en previsualizacion de animacion.
- Generacion de vídeo con audio sincronizado para demos de producto: al requerir un VAE de audio separado, el flujo cubre tanto la pista visual como la sonora en una sola pasada de ComfyUI.
- Iteracion de concepto en estudios pequenos con una sola RTX 4090: la variante HQ ofrece menor error de reconstruccion (0,531 % NRMSE) y es la opcion recomendada cuando la VRAM lo permite.
- Evaluacion comparativa de tecnicas de cuantizacion: los reportes de cuantizacion y el overview tecnico permiten reproducir las mediciones de NRMSE y comparar W4/W6/INT8 en un caso real de difusion de vídeo.
- Despliegue en pipelines de generacion por lotes: al ser checkpoints safetensors con SHA-256 verificado, se pueden integrar en automatizaciones de ComfyUI con validacion de integridad previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, VBench u otros) en la informacion disponible. El autor unicamente reporta metricas de reconstruccion de la cuantizacion:

| Metrica | HQ | Compact | Baseline sin aprendizaje (precision de Compact) |
|---|---:|---:|---:|
| NRMSE de activacion (200 matrices, split de desarrollo) | 0,531 % | 1,386 % | 2,927 % |
| Reduccion de error frente a baseline | no disponible | 52,64 % | — |
| Tamano del checkpoint | 17,92 GB | 14,50 GB | 40,22 GB (BF16 upstream) |
| Ahorro frente a HQ | — | 3,42 GB (19,1 %) | — |

El autor indica que Compact genero correctamente en ComfyUI, con una perdida de calidad percibida leve frente a HQ y frente al checkpoint INT8 de referencia usado durante la cuantizacion.

## Requisitos de hardware

- VRAM estimada para el transformer: aproximadamente 18 GB para HQ y 14,5 GB para Compact en el peor caso sin offloading; la memoria real de inferencia depende del workflow, la resolucion, los componentes adicionales (text encoder, VAEs) y el offloading.
- El text encoder Qwen3-VL 32B anade requisitos propios de memoria, no cuantificados en la informacion disponible.
- GPU recomendadas: no se especifican modelos concretos. Por tamano, una RTX 4090 (24 GB) es el minimo razonable para HQ sin offloading agresivo; Compact deja mas margen para el resto de componentes. Para A100 o H100 no hay datos publicados.
- Cabe en GPU de consumo: si, en tarjetas con 24 GB o mas, con offloading parcial en el caso de HQ.
- Opciones de despliegue: ComfyUI con soporte nativo de W6A8, INT8 ConvRot y W4A8 (Compact). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El Turbo de ocho pasos reduce el numero de pasos de muestreo, pero no se publican tiempos por clip.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TenEros_Max_optimized_learned (HQ / Compact) | no disponible | no disponible | safetensors cuantizado (17,92 / 14,50 GB) | MiniMax H3 Community License | Hugging Face, 175.469 descargas |
| TenStrip/10Eros-Max (upstream) | no disponible | no disponible | safetensors BF16 (40,22 GB) | MiniMax H3 Community License | Hugging Face |
| MiniMaxAI/MiniMax-H3 (base) | no disponible | no disponible | no disponible | MiniMax H3 Community License | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes mas alla del NRMSE de reconstruccion y del tamano. No se identifican en la informacion proporcionada otros modelos de vídeo cuantizados equivalentes para una comparacion cuantitativa.

## Limitaciones y advertencias

- La cuantizacion introduce error de reconstruccion: 0,531 % NRMSE en HQ y 1,386 % en Compact, con perdida de calidad percibida leve reportada por el autor en Compact frente a HQ.
- El modelo esta etiquetado como `not-for-all-anchors` / `not-for-all-audiences`, lo que implica contenido potencialmente sensible; requiere moderacion en entornos de produccion.
- La licencia MiniMax H3 Community License Agreement no es una licencia open source permisiva: impone terminos adicionales del upstream que deben revisarse antes de cualquier uso comercial.
- El modelo requiere componentes externos no incluidos: text encoder Qwen3-VL 32B compatible, VAE de vídeo y VAE de audio. Un emparejamiento incorrecto degrada la calidad o impide la carga.
- Es necesario un build de ComfyUI con soporte nativo de W6A8 e INT8 ConvRot, y de W4A8 para Compact; versiones antiguas no cargaran los checkpoints.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinacion; al ser un modelo de vídeo, el riesgo principal es la inconsistencia visual y temporal, no la factualidad textual.
- El repositorio ocupa 315,6 GB en total por incluir variantes antiguas (Beta5, Beta6, Beta7, Beta7 fix1) y text encoders; conviene descargar solo el checkpoint necesario.
- No hay informacion sobre latencia, throughput ni requisitos de VRAM medidos en produccion, por lo que el dimensionamiento debe validarse en el hardware objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned
- Checkpoint HQ: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/resolve/main/10Eros_Max_8stepTurbo_v1.0_hybrid_activation_learned_HQ.safetensors
- Checkpoint Compact: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/resolve/main/10Eros_Max_8stepTurbo_v1.0_hybrid_activation_learned_compact_w4w6int8_14.50gb.safetensors
- Overview tecnico: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/blob/main/H3_EROSMAX_V1_TECHNICAL_OVERVIEW.md
- Workflows de ejemplo (dos pasadas): https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/tree/main/SampleWorkFlowTwoPassOptimized
- Text encoders: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/tree/main/text_encoder/
- Checkpoints anteriores: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/tree/main/Older_ErosMax
- Modelo upstream (TenStrip/10Eros-Max): https://huggingface.co/TenStrip/10Eros-Max
- Checkpoint BF16 upstream: https://huggingface.co/TenStrip/10Eros-Max/blob/main/10Eros_Max_8stepTurbo_v1.0_hybrid.safetensors
- Modelo base MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
