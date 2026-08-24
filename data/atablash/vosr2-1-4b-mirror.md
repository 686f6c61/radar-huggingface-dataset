# atablash/vosr2-1.4b-mirror

## Resumen

VOSR 2.0 1.4B es un modelo generativo exclusivamente visual para superresolución de imágenes (image super-resolution), desarrollado por el equipo de investigación cswry y presentado en CVPR 2026. El modelo propone un enfoque que prescinde de generación texto-a-imagen (T2I) y se centra únicamente en señales visuales, lo que reduce coste computacional y complejidad frente a alternativas basadas en T2I. El checkpoint de 1.400 millones de parámetros se entrena primero como modelo multi-step y posteriormente se destila a una variante one-step para despliegue rápido.

Este repositorio concreto es un espejo no oficial byte-a-byte del checkpoint publicado por los autores en ModelScope, creado porque el repositorio oficial de Hugging Face aún no incluye el directorio VOSR2 necesario para el código de inferencia actual. El modelo usa un VAE de 16 canales derivado de Qwen-Image y una caché DINOv2 para preservar la fidelidad de la entrada, y se distribuye bajo licencia Apache-2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Generativa solo visión (vision-only), VAE 16 canales derivado de Qwen-Image + caché DINOv2 |
| Parametros totales | 1.4B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de visión) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

VOSR es un modelo generativo exclusivamente visual para superresolución, que evita la dependencia de modelos T2I. La arquitectura combina un VAE de 16 canales derivado de Qwen-Image, que se adopta en la escala de 1.4B para mejorar la fidelidad de entrada, y una caché DINOv2 que se monta desde el repositorio oficial. Aunque Qwen-Image está diseñado para generación T2I, se publica en forma de video-VAE, lo que resulta innecesariamente lento para inferencia de super-resolution; VOSR lo adapta para uso eficiente en imágenes.

El entrenamiento sigue un proceso de dos fases: primero se entrena un modelo multi-step y posteriormente se destila a una variante one-step para despliegue rápido. El paper menciona comparaciones de rendimiento, eficiencia y coste de entrenamiento frente a métodos generativos de SR tanto T2I como vision-only, pero no se proporcionan cifras concretas en la información disponible.

## Capacidades

- Superresolución de imágenes de alta fidelidad, preservando detalles finos mediante el VAE de 16 canales.
- Upscaling de texturas con calidad visual, orientado a aplicaciones de texture-upscaling.
- Inferencia one-step tras destilación, lo que permite generación rápida frente a modelos multi-step.
- Uso exclusivo de señales visuales, sin dependencia de texto, simplificando el pipeline de inferencia.
- Compatibilidad con la caché DINOv2 para mejorar la representación de características.
- No soporta tool calling, agentes ni razonamiento multi-step, al ser un modelo de visión pura.

## Casos de uso

- **Upscaling de imágenes para impresión profesional**: el modelo puede aumentar la resolución de fotografías y gráficos manteniendo la fidelidad visual, adecuado para estudios de diseño y agencias de publicidad que necesitan ampliar imágenes sin pérdida perceptible de detalle.
- **Restauración de imágenes antiguas**: al ser one-step, permite procesar colecciones de fotografías históricas escaneadas a baja resolución, mejorando su nitidez sin requerir infraestructura de inferencia masiva.
- **Mejora de texturas en videojuegos**: la capacidad de texture-upscaling permite actualizar activos de textura de baja resolución en motores gráficos, integrable en pipelines de desarrollo con PyTorch.
- **Enriquecimiento de imágenes de satélite**: la superresolución de imágenes aéreas o satelitales de baja resolución puede ayudar en aplicaciones de cartografía y monitorización, con el modelo vision-only reduciendo la complejidad frente a métodos T2I.
- **Preprocesado para visión artificial**: el modelo puede mejorar imágenes de entrada para sistemas de detección o segmentación, aumentando la resolución de datos de baja calidad en entornos industriales o médicos.
- **Upscaling de contenido multimedia**: para plataformas que necesitan mejorar la calidad de imágenes en streaming o archivos, el modelo one-step permite procesar en tiempo real con latencia baja, adecuado para servicios de fotografía en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper de arXiv menciona comparaciones de rendimiento, eficiencia y coste de entrenamiento frente a métodos T2I y vision-only, pero no se incluyen cifras específicas en los datos proporcionados.

## Requisitos de hardware

- **VRAM estimada**: el repositorio pesa 5.6 GB en safetensors, lo que sugiere pesos en fp32 (5.6 GB / 1.4B parámetros ≈ 4 bytes por parámetro). Para inferencia con precisión fp16 se estima ~2.8 GB, y con cuantización a int8 ~1.4 GB, aunque no se han publicado cuantizaciones oficiales.
- **GPU recomendadas**: una GPU de consumo con 8 GB de VRAM (RTX 3070, RTX 4060, etc.) sería suficiente para inferencia en fp16; para fp32 se recomienda al menos 8 GB. En entornos profesionales, A100 o H100 no son necesarias para este tamaño de modelo.
- **Compatibilidad con consumer GPU**: sí, cabe en GPU de consumo de gama media-alta con 8-12 GB de VRAM.
- **Opciones de despliegue**: al ser un modelo de visión, no aplican vLLM, llama.cpp u Ollama; el despliegue se realiza mediante PyTorch con el código oficial del repositorio GitHub (https://github.com/cswry/VOSR), que requiere montar la caché DINOv2 y el VAE desde el repositorio oficial de Hugging Face.
- **Latencia y throughput**: no disponible en la información proporcionada; al ser one-step, se espera latencia significativamente menor que modelos multi-step, pero sin cifras exactas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de características detalladas de modelos comparables en la información proporcionada. El paper menciona que VOSR se compara con métodos generativos de SR en términos de rendimiento, eficiencia y coste de entrenamiento, tanto en configuraciones multi-step como one-step, pero no se listan alternativas concretas ni sus especificaciones. No se puede realizar una comparativa fiable con los datos disponibles.

## Limitaciones y advertencias

- **Espejo no oficial**: este repositorio es un mirror byte-for-byte, no la publicación oficial de los autores. Para uso en producción, se recomienda verificar la integridad con el SHA256 proporcionado (`bdcaa81e4c675b6074de643e27daafe73eb8125d4d0264d1bf30a004e9644b71`).
- **Dependencia de repositorio externo**: la inferencia requiere montar el VAE y la caché DINOv2 desde el repositorio oficial `CSRYW/VOSR`, por lo que la disponibilidad del modelo completo depende de la estabilidad de ese repositorio.
- **Alucinación visual**: como todo modelo generativo, puede introducir artefactos o detalles inexistentes en la imagen de salida, especialmente en regiones con poca información.
- **Limitación de idioma**: al ser un modelo de visión, no aplica a tareas de texto; no es útil para generación de texto o razonamiento lingüístico.
- **Licencia**: Apache-2.0 permite uso comercial y modificación, pero debe conservarse la atribución y la licencia incluida al redistribuir, según la model card.
- **Rendimiento one-step vs multi-step**: la destilación a one-step implica un posible compromiso en calidad frente a la versión multi-step, aunque no se han publicado comparaciones cuantitativas.

## Enlaces

- HuggingFace (mirror): https://huggingface.co/atablash/vosr2-1.4b-mirror
- Repositorio oficial GitHub: https://github.com/cswry/VOSR
- Paper arXiv: https://arxiv.org/html/2604.03225v1
- Checkpoint original en ModelScope: https://modelscope.cn/models/LULALULALU/VOSR_CKPT
- Repositorio oficial Hugging Face (VAE y DINOv2): https://huggingface.co/CSWRY/VOSR
