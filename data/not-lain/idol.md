# not-lain/idol

## Resumen

Idol es un modelo de conversión de imagen a 3D que transforma una única fotografía o render de un objeto en un Gaussian splat 3D completo, incluyendo las partes del objeto que la imagen de entrada nunca mostró. Lo desarrolla el equipo de Speridlabs (publicado en Hugging Face bajo el identificador `not-lain/idol`, con el repositorio canónico en `speridlabs/idol`) y se distribuye con licencia Apache 2.0. El modelo aborda el problema de la reconstrucción 3D a partir de una sola vista, una tarea históricamente costosa y propensa a artefactos, y lo hace con un coste de inferencia muy bajo.

Técnicamente, Idol no es un modelo de lenguaje: es un pipeline generativo de image-to-3D que combina dos codificadores de imagen congelados (DINOv3 ViT-H/16+ y el VAE de FLUX.2-dev) con un denoiser propio que genera hasta 1.048.576 gaussianas 3D, exportadas como un fichero `.ply` estándar de 3D Gaussian Splatting. El pipeline elimina el fondo, encuadra el objeto y predice la cámara de la imagen de entrada, devolviendo además la imagen procesada y los metadatos de cámara.

Su relevancia actual radica en el rendimiento: según la model card, funciona en GPUs de consumo con 7,2 GB de VRAM y puede completar una generación en menos de 2 segundos, lo que lo sitúa en el rango de la generación 3D interactiva o en tiempo casi real. El repositorio ocupa 3,1 GB y los pesos se descargan automáticamente en la primera ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline generativo de image-to-3D con denoiser propio (difusión) y codificadores de imagen congelados: DINOv3 ViT-H/16+ y VAE de FLUX.2-dev; salida en 3D Gaussian Splatting |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible; el pipeline permite ejecutar el codificador DINOv3 en bf16 (por defecto) o fp32 |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos propios descargados desde el repositorio de Hugging Face (aprox. 3 GB); salida en `.ply` de 3DGS estándar |

## Arquitectura y entrenamiento

La arquitectura de Idol es un pipeline de generación 3D en dos etapas conceptuales. Primero, la imagen de entrada pasa por un preprocesado que elimina el fondo y recorta el objeto según el modo seleccionado (`synthetic` para renders e imágenes generadas, con el objeto ocupando 1/1,2 del encuadre; `real` para fotografías, con 1/1,7). Después, dos codificadores congelados extraen la representación visual: DINOv3 ViT-H/16+ (preentrenado en LVD-1689M) y el VAE de FLUX.2-dev, del que solo se descarga el VAE. Un denoiser propio, entrenado por Speridlabs, genera el conjunto de gaussianas 3D condicionado a esas características y a la cámara predicha.

El modelo incorpora varias optimizaciones de inferencia activadas por defecto en GPU: el denoiser se compila con `torch.compile`, las pasadas con y sin guiado (classifier-free guidance) se agrupan en un único batch y la atención usa cuDNN con matmuls TF32 durante el muestreo, lo que según la model card aporta una aceleración de aproximadamente 1,7x sin pérdida de calidad. El muestreo se controla con 50 pasos por defecto, `cfg_strength` de 3,0 y `rescale_t` de 3,0. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Generación de 3D Gaussian splats a partir de una sola imagen, incluyendo la inferencia de las caras ocultas del objeto.
- Salida de hasta 1.048.576 gaussianas (configurable entre 32.768 y 1.048.576, en múltiplos de 32), exportadas como `.ply` compatible con visores de 3DGS estándar.
- Eliminación automática de fondo y encuadre del objeto, con dos modos de recorte según el tipo de entrada (render/imagen generada o fotografía real).
- Predicción de la cámara de la imagen de entrada, exportada como `<name>_camera.json`.
- Exportación de la imagen preprocesada que ve el modelo (`<name>_input.png`) para depuración.
- Control de reproducibilidad mediante semilla (`--seed`), lo que permite regenerar exactamente el mismo objeto.
- Ajuste fino del resultado mediante pasos de muestreo, fuerza de guidance y desplazamiento temporal (`rescale_t`).
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo puramente visual y 3D.

## Casos de uso

- **Generación de assets 3D para videojuegos y realidad aumentada**: a partir de un render o de una imagen generada de un objeto, el pipeline produce un `.ply` de 3DGS listo para importar en motores o visores, con las caras ocultas inferidas, lo que evita modelar manualmente la geometría trasera.
- **Reconstrucción 3D a partir de fotografía de producto**: con `--mode real`, una foto de catálogo se convierte en un splat 3D navegable para fichas de producto interactivas o configuradores web, gracias al recorte adaptado a fotografías y a la predicción de cámara.
- **Prototipado rápido en pipelines de diseño**: la inferencia en menos de 2 segundos y 7,2 GB de VRAM permite iterar decenas de variantes por minuto cambiando la semilla o los parámetros de muestreo, integrándose en flujos de diseño generativo.
- **Escaneo 3D de bajo coste en dispositivos de consumo**: al caber en GPUs de consumo, se puede desplegar en estaciones de trabajo con una RTX de gama media para digitalizar objetos pequeños (alimentos, figuras, maquetas) sin hardware de captura especializado.
- **Generación de contenido para mundos virtuales y metaverso**: conversión masiva por lotes de imágenes de un directorio (`--image renders/`) a splats 3D para poblar escenas, con control del número de gaussianas para equilibrar calidad y peso del fichero.
- **Investigación en reconstrucción monocular**: el modelo sirve como baseline reproducible (semilla fija, pesos públicos, licencia permisiva) para comparar técnicas de image-to-3D y de 3D Gaussian Splatting en entornos académicos.
- **Previsualización 3D en herramientas de e-commerce o inmobiliarias**: a partir de una foto de un mueble u objeto decorativo, generar una representación 3D ligera que el usuario pueda rotar en el navegador mediante un visor de splats.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta métricas de eficiencia: 7,2 GB de VRAM, inferencia en menos de 2 segundos, aceleración de ~1,7x con el muestreo optimizado y un tamaño de pesos de aproximadamente 3 GB.

## Requisitos de hardware

- **VRAM estimada**: 7,2 GB para la configuración por defecto (DINOv3 en bf16). Con `--dinov3_dtype fp32` se añaden aproximadamente 1,7 GB, hasta unos 8,9 GB.
- **GPU recomendadas**: cualquier GPU NVIDIA con CUDA y al menos 8-9 GB de VRAM; encajan RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, A100 y H100. No se documenta soporte para GPU AMD o Apple Silicon.
- **¿Cabe en GPU de consumo?**: sí, según la model card; es uno de sus puntos fuertes declarados.
- **Software**: Python 3.10+, PyTorch 2.5+ y CUDA; el SDK se instala desde `github.com/speridlabs/idol-sdk` con `pip install -e .`.
- **Despliegue**: el paquete `idol` con `IdolPipeline.from_pretrained(...)` o la CLI `python -m idol.sample`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- **Latencia y throughput**: menos de 2 segundos por imagen según la model card, con una penalización adicional en la primera imagen de cada proceso por la compilación de `torch.compile`.
- **Requisito de acceso**: es necesario aceptar los términos de dos modelos restringidos en Hugging Face (`facebook/dinov3-vith16plus-pretrain-lvd1689m` y `black-forest-labs/FLUX.2-dev`) y autenticarse con `hf auth login` o `HF_TOKEN`.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | VRAM | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Idol | Image-to-3D con 3DGS | 1 imagen | Hasta 1.048.576 gaussianas (.ply) | 7,2 GB | Apache 2.0 | Hugging Face + SDK en GitHub |
| Modelos de image-to-3D basados en mallas (p. ej. TripoSR, InstantMesh) | Image-to-3D con malla | 1 imagen | Malla texturizada | no disponible en esta ficha | mayoritariamente permisivas | Hugging Face |
| Modelos de 3DGS multi-vista (p. ej. variantes de Gaussian Splatting) | Reconstrucción 3DGS | Múltiples vistas | Gaussianas | variable | variable | repositorios de investigación |

No se dispone en la información proporcionada de datos de rendimiento de Idol frente a alternativas concretas, por lo que la comparación cuantitativa (calidad geométrica, PSNR, LPIPS) queda como no disponible. La diferencia cualitativa principal es el formato de salida: Idol produce splats 3DGS en lugar de mallas, lo que favorece el renderizado en tiempo real pero complica la integración en motores que solo aceptan mallas.

## Limitaciones y advertencias

- **Dependencia de modelos restringidos**: requiere aceptar los términos de DINOv3 y FLUX.2-dev en Hugging Face y disponer de token; sin ello el pipeline se detiene antes de descargar nada.
- **Solo GPU NVIDIA/CUDA**: no se documenta soporte para CPU, AMD ni Apple Silicon, lo que limita el despliegue en algunos entornos.
- **Alucinación geométrica**: las caras ocultas del objeto se generan por inferencia, no por observación; pueden ser plausibles pero no fieles al objeto real, un riesgo relevante en aplicaciones de digitalización de precisión.
- **Formato de salida especializado**: el `.ply` de 3DGS no es una malla; requiere visores o pipelines compatibles con Gaussian Splatting y no se integra directamente en motores que esperan geometría poligonal.
- **Sin datos de entrenamiento publicados**: no se especifican dataset, número de tokens ni proceso de alineación, lo que dificulta evaluar sesgos y cobertura de dominios.
- **Idiomas**: no aplica, pero tampoco hay soporte de texto ni de instrucciones en lenguaje natural.
- **Repositorio espejo**: el identificador `not-lain/idol` es un mirror; el repositorio canónico y el mantenido por el autor es `speridlabs/idol`, con 0 descargas y 0 likes en el espejo en el momento de la consulta.
- **Licencia**: Apache 2.0 permite uso comercial, pero las licencias de los codificadores subyacentes (DINOv3 y FLUX.2-dev) deben verificarse por separado, ya que son modelos restringidos con sus propios términos.
- **Primera inferencia más lenta**: la compilación de `torch.compile` añade latencia en la primera imagen de cada proceso, algo a tener en cuenta en despliegues serverless con arranques frecuentes.

## Enlaces

- Modelo en Hugging Face (espejo): https://huggingface.co/not-lain/idol
- Modelo canónico en Hugging Face: https://huggingface.co/speridlabs/idol
- Página del proyecto: https://speridlabs.com/research/idol
- Repositorio del SDK: https://github.com/speridlabs/idol-sdk
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/speridlabs/idol
- Codificador DINOv3 (restringido): https://huggingface.co/facebook/dinov3-vith16plus-pretrain-lvd1689m
- Codificador FLUX.2-dev (restringido, solo VAE): https://huggingface.co/black-forest-labs/FLUX.2-dev
