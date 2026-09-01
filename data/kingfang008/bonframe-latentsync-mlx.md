# kingfang008/BonFrame-LatentSync-MLX

## Resumen

BonFrame LatentSync MLX es un paquete de pesos en formato MLX FP16 para el sistema de sincronización labial LatentSync, desarrollado por ByteDance y adaptado a Apple Silicon mediante el proyecto latentsync-mlx. Este repositorio contiene dos versiones destiladas del UNet de LatentSync (1.5 y 1.6) que permiten generar movimiento de labios sincronizado con audio en solo 4 pasos de denoising, en lugar de los cientos de pasos típicos de los modelos de difusión originales. La destilación reduce drásticamente la latencia de inferencia, lo que hace viable el uso en tiempo real en Macs con chip M-series.

El modelo resuelve el problema de alinear los movimientos de la boca de un personaje con una pista de audio de forma realista, sin necesidad de representaciones intermedias como landmarks o mallas 3D. Su relevancia radica en que democratiza el lip sync de alta calidad al ejecutarse nativamente en hardware de Apple, aprovechando la aceleración MLX, con una velocidad aproximadamente 2,3 veces superior a la versión PyTorch con MPS. El repositorio incluye dos variantes: una para resolución 256 (LatentSync 1.5) y otra para 512 (LatentSync 1.6), ambas con los mismos cuatro timesteps de denoising.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de difusion latente (basado en Stable Diffusion) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion para video) |
| Tipos de cuantizacion | FP16 (formato MLX) |
| Idiomas soportados | no disponible (depende del audio de entrada, probablemente multilingue via Whisper) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

LatentSync es un método de lip sync basado en difusion latente condicionada por audio. El modelo emplea un UNet de Stable Diffusion modificado para aceptar características de audio (extraídas mediante Whisper) como condición, y genera directamente el fotograma de video sincronizado. A diferencia de enfoques anteriores que usan difusión en espacio de píxeles o generación en dos etapas, LatentSync modela la correlación audio-visual de forma conjunta en el espacio latente.

Los pesos incluidos en este repositorio son versiones destiladas del UNet original de ByteDance. La destilación reduce el número de pasos de denoising de cientos a solo 4 (timesteps `951,701,401,151`), manteniendo la calidad con un CFG de 1.5. El proceso de entrenamiento de los maestros originales no se detalla en la información disponible, pero se sabe que siguen la metodología de LatentSync: entrenamiento con datos de video con audio y supervisión de sincronización labial. La conversión a MLX se realizó para ejecutar el bucle de denoising y el VAE en MLX, mientras que el preprocesamiento (codificación de audio con Whisper y detección facial con InsightFace) se mantiene en PyTorch.

## Capacidades

- Sincronización labial de alta calidad: genera movimiento de labios realista y sincronizado con el audio de entrada.
- Inferencia rápida en Apple Silicon: gracias a la destilación a 4 pasos y a la implementación MLX, es adecuado para aplicaciones en tiempo real.
- Soporte de dos resoluciones: 256x256 (LatentSync 1.5) y 512x512 (LatentSync 1.6), lo que permite elegir entre velocidad y calidad.
- Integración con pipeline de preprocesamiento: requiere codificación de audio con Whisper y detección de rostro con InsightFace para funcionar.
- No incluye capacidades de tool calling, agentes, visión general ni razonamiento, ya que es un modelo especializado de generación de video.

## Casos de uso

- Doblaje automático de contenido audiovisual: el modelo puede sincronizar los labios de un actor con un audio doblado en otro idioma, facilitando la localización de películas, series o vídeos educativos sin necesidad de regrabar escenas.
- Creación de avatares virtuales para streaming: permite animar personajes digitales en tiempo real a partir de la voz del usuario, mejorando la inmersión en streams o reuniones virtuales.
- Corrección de sincronía en entrevistas grabadas: cuando el audio y el vídeo de una entrevista están desalineados, el modelo puede regenerar el movimiento labial para que coincida con la pista de audio.
- Generación de vídeos para marketing y publicidad: permite crear anuncios con actores que pronuncian textos personalizados sin necesidad de rodajes adicionales, útil para campañas dinámicas.
- Herramientas de accesibilidad: puede generar versiones en lengua de signos o con subtítulos locutados donde el movimiento labial del presentador se ajuste al audio sintetizado.
- Postproducción de vídeo: en flujos de trabajo profesionales, se puede usar para arreglar problemas de sincronización en tomas donde el audio se grabó por separado, evitando rehacer la escena.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas comparativas como MMLU, HumanEval o similares, dado que es un modelo de generación de vídeo y no de texto. La única métrica mencionada es que la inferencia MLX es aproximadamente 2,3 veces más rápida que PyTorch MPS en Macs M-series, según el repositorio latentsync-mlx.

## Requisitos de hardware

- Apple Silicon con chip M-series (M1, M2, M3 o superiores) con soporte para MLX.
- Memoria unificada estimada: no disponible, pero el tamaño del repositorio es de 5,1 GB, por lo que se recomienda al menos 16 GB de RAM unificada para la versión 512, y 8 GB para la versión 256, aunque no se confirma.
- No requiere GPU dedicada NVIDIA, ya que está optimizado para el Neural Engine y GPU integrada de Apple.
- Opciones de despliegue: el paquete es un complemento para el proyecto latentsync-mlx, que proporciona el código de inferencia. No se mencionan integraciones con vLLM, Ollama o TGI.
- Latencia: no se especifican valores concretos, pero la destilación a 4 pasos y la aceleración MLX permiten un rendimiento cercano a tiempo real en hardware Apple.

## Comparativa con modelos similares

| Modelo | Plataforma | Resolucion | Pasos de denoising | Licencia | Notas |
|---|---|---|---|---|---|
| BonFrame LatentSync MLX (este) | Apple MLX | 256/512 | 4 | Apache-2.0 | Destilado, rápido en Mac |
| LatentSync original (ByteDance) | PyTorch (CUDA) | 256/512 | cientos | Apache-2.0 | Mayor calidad pero más lento |
| Wav2Lip | PyTorch | 96x96 | N/A (GAN) | no disponible | Más ligero, pero menor calidad de sincronización |
| SadTalker | PyTorch | 256 | N/A (3DMM) | no disponible | Genera movimiento de cabeza, no solo labios |

La comparativa se basa en características generales conocidas, ya que no hay benchmarks directos en la información proporcionada.

## Limitaciones y advertencias

- Requiere un pipeline completo: además de los pesos, es necesario ejecutar Whisper para extraer características de audio e InsightFace para la detección de rostros, lo que añade dependencias y complejidad de instalación.
- Destilación con posible pérdida de calidad: al reducir a 4 pasos, puede haber artefactos o menor fidelidad en comparación con el modelo maestro de ByteDance, especialmente en condiciones de iluminación o oclusiones complejas.
- Específico para Apple Silicon: no es compatible con GPUs NVIDIA o AMD, limitando su uso en entornos de servidor convencionales.
- Sin información sobre sesgos: no se han documentado sesgos específicos, pero como todo modelo entrenado con datos de vídeo, puede presentar problemas con ciertos tonos de piel, géneros o acentos.
- Riesgo de alucinación visual: en casos de audio ambiguo o ruidoso, el modelo puede generar movimientos labiales incorrectos o no naturales.
- Licencia Apache-2.0 permite uso comercial, pero se debe verificar la licencia de los modelos subyacentes (Whisper, InsightFace, etc.) que se usan en el pipeline.
- No se proporcionan garantías de rendimiento en producción; se recomienda evaluar en el hardware objetivo antes de desplegar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kingfang008/BonFrame-LatentSync-MLX
- Proyecto latentsync-mlx (GitHub): https://github.com/sb1992/latentsync-mlx
- LatentSync original de ByteDance (GitHub): https://github.com/bytedance/LatentSync
- LatentSync en HuggingFace (ByteDance): https://huggingface.co/ByteDance/LatentSync
- Página oficial de LatentSync: https://www.latentsync.org/
- Repositorio relacionado (BonFrame JoyVASA ONNX): https://huggingface.co/kingfang008/BonFrame-JoyVASA-ONNX
