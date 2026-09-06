# reallusion4free/ltx-2.3-10eros-v1.3-dmd-mlx-q8

## Resumen

`ltx-2.3-10eros-v1.3-dmd-mlx-q8` es una cuantización int8 en formato MLX del modelo de generación de vídeo `TenStrip/LTX2.3-10Eros` v1.3, que a su vez es un fine-tune de `Lightricks/LTX-2.3`. El paquete ha sido convertido por `reallusion4free` y optimizado para su ejecución en Apple Silicon mediante la librería `ltx-2-mlx`. El valor añadido de esta variante es que las deltas de destilación DMD del proyecto JoyAI Echo se han fusionado directamente en los pesos del transformer, eliminando la necesidad de un LoRA de destilación en tiempo de ejecución. El resultado es un modelo "distilled-only" que reduce el número de pasos de muestreo a 8/4, manteniendo la calidad y evitando la degradación típica de los LoRA en la etapa de refinado.

El repositorio tiene un tamaño de 31.1 GB e incluye el transformer destilado, los connectors del encoder de texto (Gemma → DiT), el VAE de vídeo, dos upscalers espaciales, un upscaler temporal, un vocoder BigVGAN y un VAE de audio. El encoder de texto (Gemma 3 12B) no está incluido y debe cargarse por separado. La licencia es la específica `ltx-2-license`, de tipo `other`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) con connectors Gemma → DiT |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (MLX, group size 64, aplicada solo a `nn.Linear` en `transformer_blocks`) |
| Idiomas soportados | no disponible |
| Licencia | ltx-2-license (tipo `other`) |
| Formato de pesos | safetensors (MLX int8, bf16 en componentes no cuantizados) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura original de LTX-2.3, un modelo de difusión de vídeo con un transformer DiT que recibe condiciones de texto a través de un connector. En esta versión, la destilación DMD (Direct Multi-step Distillation) de JoyAI Echo ha sido fusionada en el checkpoint base `10Eros` v1.3 antes de la cuantización. El proceso consistió en fusionar el LoRA de destilación (rank recreado a partir de la estructura del LoRA de LTX 1.1) a fuerza 1.0 sobre el modelo bf16, produciendo un checkpoint destilado autónomo. No existe un transformer "dev" ni se cargan LoRAs en tiempo de ejecución: los pesos ya contienen la destilación.

La cuantización a int8 se aplica únicamente a las capas lineales dentro de los bloques del transformer, dejando el resto de componentes (AdaLN, proyecciones, connectors, VAE y vocoder) en bf16, ya que MLX no permite cuantizar capas convolucionales. Esta es una innovación técnica relevante para el despliegue eficiente en Apple Silicon, donde se equilibra el ahorro de memoria con la preservación de la calidad en las capas críticas.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) y a partir de imagen (image-to-video).
- Destilación DMD que permite un muestreo en 8/4 pasos en el flujo por defecto, sin necesidad de muestreo personalizado ni de cargar LoRAs.
- Componentes de audio integrados: vocoder BigVGAN y VAE de audio, lo que sugiere capacidad de generar vídeo con pista de audio sincronizada.
- Upscalado espacial neuronal en factores 1.5x y 2x, y upscaler temporal 2x, lo que permite generar vídeo en baja resolución y refinarlo a resoluciones superiores.
- Sin soporte de tool calling, function calling ni razonamiento multi-paso: es exclusivamente un modelo generativo de vídeo.
- No se especifican capacidades multilingües explícitas, pero al requerir un encoder de texto Gemma 3 12B, es plausible que acepte prompts en varios idiomas (dato no confirmado en la model card).

## Casos de uso

- Generación de vídeo de ficción para adultos: el modelo puede producir escenas completas a partir de prompts descriptivos, con 480x704 píxeles y 97 frames, y exportarlas a MP4. Es adecuado para creadores de contenido que necesitan escenas originales sin depender de actores reales.
- Animación de imágenes fijas (image-to-video): permite tomar una fotografía y animarla con movimiento natural. Útil para efectos visuales en publicidad, arte digital o prototipado de vídeos.
- Producción de vídeos musicales o con audio: gracias a los componentes de audio (vocoder y VAE de audio), se pueden generar secuencias con pista de sonido coherente, reduciendo el trabajo posterior de edición.
- Refinado de vídeos en baja resolución: la inclusión de upscalers espaciales y temporales permite generar un borrador en resolución moderada y escalarlo con la etapa de refinado de 1.5x o 2x, adecuado para flujos de trabajo con memoria limitada.
- Investigación en destilación de modelos de difusión: el paquete sirve como ejemplo de integración de deltas DMD en los pesos, sin necesidad de LoRA en ejecución. Útil para estudiar el impacto de la destilación en la calidad y en los pasos de muestreo.
- Experimentación con inferencia local en Apple Silicon: ya que está empaquetado para `ltx-2-mlx`, es una opción práctica para desarrolladores que deseen probar generación de vídeo en un Mac de 16 GB o 32 GB sin depender de servidores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el paquete cuantizado a int8 cabe en un Mac con 16 GB de memoria unificada utilizando el modo `--low-ram` (inferencia por bloques). En máquinas de 32 GB se puede ejecutar sin `--low-ram`, aunque también se recomienda usar esta opción para dejar más margen al sistema.
- GPU recomendadas: exclusivamente Apple Silicon (M1, M2, M3, M4). No se proporciona compatibilidad con GPUs NVIDIA o AMD, ya que la librería `ltx-2-mlx` es un puerto puro de MLX.
- Opciones de despliegue: mediante `ltx-2-mlx` (repositorio de referencia) y `mlx-forge` para conversiones adicionales. También puede ejecutarse a través de la interfaz de línea de comandos con los flags `--distilled`, `--image`, `--low-ram`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Formato | Plataforma | Notas |
|---|---|---|---|---|---|
| `ltx-2.3-10eros-v1.3-dmd-mlx-q8` | no disponible | int8 (q8) | MLX safetensors | Apple Silicon | Versión destilada con DMD fusionada, 31.1 GB |
| `ltx-2.3-10eros-v1.3-dmd-mlx-q4` | no disponible | int4 (q4) | MLX safetensors | Apple Silicon | Cuantización más agresiva, menor tamaño y posible pérdida de calidad |
| `TenStrip/LTX2.3-10Eros` v1.3 | no disponible | bf16 (sin cuantizar) | safetensors bf16 | Multiplataforma (según framework) | Modelo base original, incluye LoRA de destilación nativo, no apto para MLX |

## Limitaciones y advertencias

- Contenido para adultos: el modelo lleva la etiqueta `not-for-all-audiences` y está diseñado para un público adulto. El usuario es responsable de cumplir la legislación de su jurisdicción y de no generar material ilegal ni representar personas reales sin consentimiento.
- Licencia restrictiva: la `ltx-2-license` es una licencia personalizada (`other`) no estándar. Antes de usar el modelo en aplicaciones comerciales, es necesario revisar las condiciones completas de la licencia adjunta al modelo base.
- Solo Apple Silicon: no es ejecutable en GPUs NVIDIA o AMD, lo que limita su integración en clústeres de entrenamiento o en entornos de producción basados en CUDA.
- Sin ruta no destilada: el paquete omite el transformer "dev" y las rutas `--two-stage`, `--two-stages-hq` y `--one-stage`. Solo es posible usar el flujo destilado, lo que puede limitar la comparación con el modelo base.
- Dependencia de componentes externos: el encoder de texto Gemma 3 12B no está incluido y debe cargarse aparte mediante `mlx-lm`, lo que añade un requisito adicional de descarga y memoria.
- Cuantización int8: la conversión reduce la precisión de las capas lineales. En modelos de vídeo, esto puede introducir artefactos o pérdida de fidelidad en detalles finos, especialmente en la representación de texto en pantalla o movimiento rápido.
- Sin benchmarks publicados: no hay métricas objetivas de calidad o rendimiento disponibles, por lo que las comparaciones de calidad entre cuantizaciones deben evaluarse empíricamente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/reallusion4free/ltx-2.3-10eros-v1.3-dmd-mlx-q8
- Modelo base: https://huggingface.co/TenStrip/LTX2.3-10Eros
- Modelo original de Lightricks: https://huggingface.co/Lightricks/LTX-2.3
- Librería de ejecución `ltx-2-mlx`: https://github.com/dgrauet/ltx-2-mlx
- Herramienta de conversión `mlx-forge`: https://github.com/dgrauet/mlx-forge
- Nodos de ComfyUI de JoyAI Echo: https://github.com/TenStrip/10S-Comfy-nodes
