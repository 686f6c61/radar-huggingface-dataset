# Rootport/Nz-LTX25-weights

## Resumen

Nz-LTX25-weights es un paquete de pesos para el motor de inferencia LTX 2.5 (`engine25`) del plugin Nz-Videomni (antiguo Nz-LTX23), desarrollado por Rootport para el editor de vídeo AviUtl2. El paquete contiene cuatro archivos: el transformer de difusión en formato GGUF cuantizado (Q4_K mixto), dos VAE (vídeo y audio) y un upscaler espacial x2. El modelo base es Lightricks LTX 2.5, un modelo de texto a vídeo de código abierto con 21 004 millones de parámetros (22B), capaz de generar vídeo y audio sincronizados.

El repositorio no contiene un modelo entrenado de nuevo, sino una redistribución con transformaciones: tres archivos son copias byte a byte de los pesos originales de Lightricks y el transformer es una cuantización GGUF realizada por Rootport a partir de los pesos bf16 del modelo base. El text encoder (una versión ajustada de Gemma 4 de 12B para LTX) se distribuye por separado en otro repositorio (`Rootport/Nz-Gemma4-12B-LTX25`) debido a diferencias de licencia.

La relevancia de este paquete reside en que permite ejecutar LTX 2.5 de forma local y gratuita dentro de AviUtl2, un editor de vídeo muy usado en Japón, sin depender de servicios en la nube ni de la API de Lightricks. El uso está restringido por la licencia comunitaria de LTX, que limita la explotación comercial para empresas con ingresos anuales superiores a 10 millones de dólares.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (texto a vídeo) |
| Parámetros totales | 21.004.025.600 (22B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Q4_K mixto (1.658 tensores Q4_K, 2.401 BF16, 290 F32) |
| Idiomas soportados | Japonés, inglés (según la model card) |
| Licencia | LTX-2.x Community License Agreement |
| Formato de pesos | GGUF (transformer), safetensors (VAE y upscaler) |

## Arquitectura y entrenamiento

El modelo base, LTX 2.5 de Lightricks, es un transformer de difusión de 22B parámetros diseñado para generar vídeo con audio sincronizado a partir de texto. La arquitectura completa incluye un text encoder (Gemma 4 12B fine-tuneado), un transformer de difusión, dos VAE (vídeo y audio) y un upscaler latente x2. El transformer utiliza un esquema de difusión con muestreo guiado por texto y soporta generación de vídeo de alta resolución (hasta 4K con el upscaler).

El repositorio de Rootport no modifica la arquitectura: el transformer se convierte de bf16 a GGUF mediante la herramienta `Nz-GGUF-Converter-LTX23` (v1.2.0, commit `905f348`). La conversión cuantiza 1.658 de los 4.349 tensores a Q4_K y mantiene el resto en BF16 (2.401 tensores) o F32 (290 tensores) sin pérdida de precisión. Los VAE y el upscaler se distribuyen sin ninguna modificación respecto al original.

No se han publicado detalles sobre el dataset de entrenamiento ni el proceso de RLHF/DPO en la información disponible. Se sabe que el modelo base fue desarrollado por Lightricks y que su arquitectura está optimizada para la generación de vídeo de alta velocidad con audio.

## Capacidades

- Generación de vídeo de texto a vídeo con audio sincronizado (el modelo genera vídeo y audio simultáneamente).
- Soporte de upscaling espacial x2 mediante el upscaler latente incluido.
- Integración nativa con el editor AviUtl2 a través del plugin Nz-VideoOmni (motor `engine25`).
- Compatibilidad con el formato GGUF para cargas eficientes en memoria y cuantización.
- Funciona con el text encoder Gemma 4 12B (LTX fine-tune) en formato GGUF, distribuido por separado.
- Soporte multilingüe limitado: el modelo base soporta japonés e inglés (según la model card).
- No incluye capacidades de tool calling ni agentes: es un modelo de generación de vídeo puro.

## Casos de uso

- **Edición de vídeo profesional en AviUtl2**: el plugin Nz-Videoio permite generar clips de vídeo directamente desde la línea de tiempo del editor, usando LTX 2.5 como motor de síntesis. Es adecuado para creadores de contenido que trabajan en flujos de edición no lineales y necesitan generar material de relleno o secuencias de transición sin salir del editor.

- **Producción de vídeo para redes sociales**: generar clips cortos con audio sincronizado para plataformas como YouTube, TikTok o X. El modelo puede crear secuencias de 5-10 segundos con coherencia de movimiento y diálogo, lo que reduce el tiempo de producción de contenido promocional.

- **Prototipado de ideas audiovisuales**: los directores y guionistas pueden generar vídeos de baja resolución a partir de descripciones de texto para visualizar escenas antes de la producción real. El upscaler x2 permite obtener una resolución de 1280x720 o superior, suficiente para previsualizaciones.

- **Creación de vídeos de stock personalizados**: en lugar de comprar vídeos de stock, se pueden generar clips específicos para un proyecto, con control de estilo y contenido. La licencia comunitaria permite uso comercial para empresas de menos de 10 millones de dólares de ingresos anuales.

- **Entornos de investigación en IA**: el paquete de pesos GGUF permite a investigadores y desarrolladores estudiar el comportamiento del modelo LTX 2.5 en un formato cuantizado, comparando la calidad de generación entre bf16 y Q4_K, sin necesidad de adquirir hardware de gama alta.

- **Integración en pipelines de automatización**: dado que el modelo se ejecuta localmente, puede integrarse en flujos de trabajo automatizados (por ejemplo, generación de vídeos de reportes o vídeos de demostración de productos) mediante scripts que invoquen el motor de Nz-Videoio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de calidad (como FVD, CLIP score o PSNR) ni comparaciones con otros modelos de vídeo. Se recomienda consultar la documentación oficial de Lightricks LTX 2.5 para datos de rendimiento del modelo original.

## Requisitos de hardware

- **VRAM estimada**: el transformer GGUF ocupa 14,7 GB en disco. Para cargarlo en memoria se recomienda al menos 16 GB de VRAM (para Q4_K_M con overhead de runtime). Los VAE y el upscaler añaden aproximadamente 2.8 GB adicionales, por lo que el conjunto completo requiere unos 18-20 GB de VRAM.
- **GPU recomendadas**: RTX 4090 (24 GB), RTX A6000 (48 GB), A100 (40/80 GB) o H100 (80 GB). En GPUs con menos de 16 GB (RTX 3080, 4060 Ti) la generación puede fallar por falta de memoria.
- **Consumer GPU**: cabe en tarjetas de 24 GB como la RTX 4090 y la RTX 3090, pero no en tarjetas de 8-12 GB típicas de gama media.
- **Opciones de despliegue**: el paquete está pensado para usarse exclusivamente con el plugin Nz-Videoio en AviUtl2. No se distribuyen scripts de inferencia independientes. El text encoder (Gemma 4 12B GGUF) se carga por separado y requiere otros 7-8 GB de VRAM adicionales.
- **Latencia y throughput**: no disponible en la información proporcionada. La velocidad de generación dependerá de la GPU, la resolución y el número de pasos de difusión.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar directamente este paquete con otros modelos de vídeo. Sin embargo, en el contexto de los modelos de generación de vídeo de código abierto, LTX 2.5 (22B) se puede comparar con:

| Modelo | Parámetros | Contexto | Resolución máxima | Licencia |
|---|---|---|---|---|
| LTX 2.5 (Lightricks) | 22B | no disponible | 4K (con upscaler) | Community License (uso comercial limitado) |
| Wan 2.2 (Alibaba) | 1.3B-14B | no disponible | 720p | Apache 2.0 |
| HunyuanVideo (Tencent) | 13B | no disponible | 1080p | Community License |
| CogVideoX (Zhipu) | 9.5B | no disponible | 720p | Apache 2.0 |

La ventaja de este paquete es su formato GGUF, que permite cuantización y ejecución con menos VRAM que el modelo original bf16 (que pesa 42 GB). No se dispone de datos de comparación de calidad con las alternativas.

## Limitaciones y advertencias

- **No es un modelo original**: este repositorio es una redistribución de pesos de Lightricks con una conversión GGUF. No hay mejoras de calidad respecto al modelo base.
- **Licencia restrictiva**: la LTX-2.x Community License Agreement limita el uso comercial a empresas con ingresos anuales inferiores a 10 millones de dólares. Las empresas mayores deben obtener una licencia comercial de Lightricks.
- **Solo japonés e inglés**: la model card indica soporte para estos dos idiomas; la generación en otros idiomas puede producir resultados de menor calidad.
- **No hay datos de sesgos o alucinación**: no se han publicado evaluaciones de sesgo ni de fiabilidad de la generación de vídeo.
- **Dependencia de AviUtl2**: el paquete solo funciona con el plugin Nz-Videoio; no hay soporte para otros frameworks (ComfyUI, Diffusers, etc.).
- **Text encoder separado**: el text encoder (Gemma 4 12B) se distribuye en otro repositorio, por lo que hay que descargar dos repositorios para funcionar.
- **Incompatibilidad con LTX 2.3**: los pesos de LTX 2.5 no son compatibles con el motor de LTX 2.3 (engine23) y viceversa.
- **Riesgo de obsolescencia**: al ser una cuantización específica, la actualización del modelo base puede requerir una nueva conversión.

## Enlaces

- [Repositorio HuggingFace: Rootport/Nz-LTX25-weights](https://huggingface.co/Rootport/Nz-LTX25-weights)
- [Repositorio del text encoder: Rootport/Nz-Gemma4-12B-LTX25](https://huggingface.co/Rootport/Nz-Gemma4-12B-LTX25)
- [Plugin Nz-Videoio (GitHub)](https://github.com/Rootport-AI/Nz-Videoio)
- [Herramienta de conversión GGUF (GitHub)](https://github.com/Rootport-AI/Nz-GGUF-Converter-LTX23)
- [Modelo base: Lightricks/LTX-2.5](https://huggingface.co/Lightricks/LTX-2.5)
- [Web oficial LTX 2.5 (ltx25.net)](https://ltx25.net/)
