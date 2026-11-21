# lightx2v/LightVAE

## Resumen

LightVAE es un conjunto de autoencoders de vídeo (VAE) compactados y destilados, desarrollado por el equipo lightx2v (proyecto ModelTC), que reduce el coste computacional y de memoria de los VAE utilizados en pipelines de generación de vídeo (text-to-video e image-to-video). A diferencia de un modelo generativo completo, LightVAE actúa como componente auxiliar: sustituye al encoder y/o decoder originales de los backbones Wan2.1, Wan2.2 y MiniMax-H3, preservando la interfaz latente original para que los componentes comprimidos puedan combinarse con los originales sin reentrenar el modelo de difusión.

La propuesta central es la compresión del autoencoder sin alterar el espacio latente: los checkpoints "Pro" mantienen la profundidad original del decoder con compresión temporal de bajo rango, mientras que los "Lite" añaden poda de bloques. Para MiniMax-H3 se publican además un encoder y un decoder Lite podados de forma independiente, con integración nativa en ComfyUI y un decoder opcional cuantizado ConvRot-INT8.

Es relevante ahora porque los VAE de vídeo de alta resolución son un cuello de botella en VRAM y latencia de decodificación en pipelines de difusión de vídeo. LightVAE permite reducir ese coste manteniendo compatibilidad con los pesos originales, lo que facilita su adopción en flujos existentes de ComfyUI y en el ecosistema LightX2V. El repositorio ocupa 12,8 GB y acumula 819 descargas y 40 likes en Hugging Face, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder de vídeo (VAE) con compresión temporal de bajo rango y poda de bloques; variantes Pro y Lite |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa vídeo por fotogramas) |
| Tipos de cuantizacion | FP16 para checkpoints estándar; ConvRot-INT8 para el decoder Lite de MiniMax-H3 (solo ComfyUI) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoints LightVAE); los VAE originales de Wan se distribuyen como .pth |

## Arquitectura y entrenamiento

LightVAE no es un transformer generativo, sino un autoencoder de vídeo cuyo objetivo es comprimir y reconstruir vídeo en el espacio latente que consumen los modelos de difusión. La familia se organiza en dos niveles de compresión. Las variantes Pro conservan la profundidad original del decoder e introducen compresión temporal de bajo rango (low-rank), mientras que las variantes Lite añaden poda de bloques sobre esa base. Para Wan2.1 y Wan2.2, los decoders Pro y Lite se emparejan con el encoder original del backbone; para MiniMax-H3 se publican encoder y decoder Lite podados de forma independiente.

La innovación clave es la preservación de la interfaz latente: al mantener las dimensiones y la semántica del espacio latente original, los componentes comprimidos son intercambiables con los originales (por ejemplo, encoder original de Wan2.1 con decoder LightVAE-Lite) sin necesidad de ajustar el modelo de difusión. La model card indica que el trabajo se basa en destilación y compresión, e incluye un decoder cuantizado ConvRot-INT8 para H3 con aceleración nativa en CUDA 13.0+ mediante PyTorch. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF/DPO.

## Capacidades

- Compresión y reconstrucción de vídeo en el espacio latente para pipelines de difusión de vídeo.
- Sustitución intercambiable de encoder y/o decoder manteniendo el espacio latente original.
- Compatibilidad con Wan2.1 (decoders Pro y Lite emparejados con encoder original).
- Compatibilidad con Wan2.2: los modelos de 14B usan el VAE de Wan2.1 y TI2V-5B usa el VAE de Wan2.2.
- Soporte de MiniMax-H3 con encoder y decoder Lite podados de forma independiente.
- Integración nativa en ComfyUI mediante el nodo "Load H3 LightVAE", sin kernels Triton ni paquetes adicionales.
- Flujos soportados en ComfyUI: FL2V (primer y último fotograma), REF2V con referencias de imagen y REF2V con referencia de vídeo.
- Cuantización ConvRot-INT8 del decoder H3 Lite para ComfyUI con aceleración CUDA.
- Script de inferencia en Python (`infer.py`) que acepta checkpoints de encoder y decoder independientes y genera un informe JSON.
- No dispone de tool calling, razonamiento multi-paso ni capacidades de lenguaje: es un componente de compresión de vídeo, no un modelo conversacional.

## Casos de uso

- Acelerar la decodificación en pipelines text-to-video: sustituir el decoder original de Wan2.1 o Wan2.2 por un decoder Lite reduce el coste de decodificación manteniendo la compatibilidad con el modelo de difusión existente.
- Reducir la VRAM en inferencia de image-to-video en ComfyUI: el nodo "Load H3 LightVAE" permite usar componentes Lite de MiniMax-H3 en flujos FL2V y REF2V sin instalar paquetes adicionales.
- Optimizar flujos de referencia de imagen y vídeo: en REF2V se puede sustituir el encoder, el decoder o ambos, lo que permite ajustar el ahorro según el cuello de botella del pipeline.
- Despliegue en hardware con recursos limitados: la variante ConvRot-INT8 del decoder H3 Lite reduce el coste de memoria de decodificación en ComfyUI con GPUs NVIDIA compatibles con CUDA 13.0+.
- Evaluación de calidad de reconstrucción: `infer.py` permite reconstruir vídeos con combinaciones de encoder y decoder y guardar un informe JSON para comparar variantes Pro y Lite.
- Integración en el ecosistema LightX2V: usar LightVAE como componente de compresión dentro de pipelines de generación de vídeo gestionados por LightX2V.
- Investigación sobre compresión de autoencoders de vídeo: la separación entre compresión temporal de bajo rango (Pro) y poda de bloques (Lite) sirve como base para experimentos de destilación de VAE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al repositorio de GitHub de LightVAE para consultar benchmarks y comparaciones visuales, pero no incluye cifras en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma numérica; el repositorio completo ocupa 12,8 GB, pero cada checkpoint individual es un subconjunto de ese tamaño.
- GPU recomendadas: no disponibles en la información proporcionada. El decoder ConvRot-INT8 requiere una build de PyTorch con CUDA 13.0+ y un driver compatible para la aceleración nativa en NVIDIA.
- GPU de consumo: no se especifica compatibilidad con GPUs consumer; la viabilidad depende del backbone de difusión de vídeo con el que se combine el VAE.
- Opciones de despliegue: ComfyUI (nodo "Load H3 LightVAE", solo para MiniMax-H3), scripts Python del repositorio (`infer.py`) y pipelines LightX2V.
- Latencia y throughput: no disponibles. La model card advierte que el soporte de backend y el rendimiento dependen del entorno.
- Restricción de despliegue: el checkpoint INT8 es exclusivo de ComfyUI; con los scripts Python independientes deben usarse checkpoints estándar no INT8.

## Comparativa con modelos similares

| Modelo | Tipo | Backbones soportados | Compresión | Licencia | Integración |
|---|---|---|---|---|---|
| LightVAE | VAE de vídeo compactado | Wan2.1, Wan2.2, MiniMax-H3 | Low-rank temporal + poda de bloques; INT8 opcional | Apache 2.0 | ComfyUI, Python, LightX2V |
| Wan2.1 VAE (original) | VAE de vídeo | Wan2.1 | Sin compresión | no disponible en la información | ComfyUI, scripts |
| Wan2.2 VAE (original) | VAE de vídeo | Wan2.2 TI2V-5B | Sin compresión | no disponible en la información | ComfyUI, scripts |
| MiniMax-H3 VAE (original) | VAE de vídeo | MiniMax-H3 | Sin compresión | no disponible en la información | ComfyUI nativo |

No se dispone de datos de rendimiento comparado entre LightVAE y los VAE originales en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce vídeo por sí mismo, solo comprime y reconstruye en el espacio latente de un backbone de difusión.
- Los checkpoints deben emparejarse con su backbone correcto: en Wan2.2, los modelos de 14B usan el VAE de Wan2.1 y TI2V-5B usa el VAE de Wan2.2.
- El nodo de ComfyUI solo soporta MiniMax-H3 en la versión documentada.
- El decoder ConvRot-INT8 es exclusivo de ComfyUI y requiere CUDA 13.0+; no debe usarse con los scripts Python estándar.
- El VAE de audio de H3 no se modifica; LightVAE solo afecta al vídeo.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas porque el modelo no procesa lenguaje.
- La licencia Apache 2.0 permite uso comercial, pero deben respetarse las licencias de los backbones originales (Wan2.1, Wan2.2, MiniMax-H3) con los que se combine.
- No se especifican requisitos de VRAM ni latencias, por lo que el dimensionamiento en producción requiere pruebas propias.
- Los flujos de ComfyUI publicados son de modelo base, no de turbo-LoRA de 4 u 8 pasos.

## Enlaces

- [Hugging Face: lightx2v/LightVAE](https://huggingface.co/lightx2v/LightVAE)
- [Paper (arXiv 2610.14726)](https://huggingface.co/papers/2610.14726)
- [Repositorio de código LightVAE](https://github.com/ModelTC/LightVAE)
- [Integración ComfyUI](https://github.com/ModelTC/LightVAE/tree/main/comfyui)
- [Guía de workflows ComfyUI](https://github.com/ModelTC/LightVAE/tree/main/comfyui/workflows)
- [Workflow primer y último fotograma](https://github.com/ModelTC/LightVAE/blob/main/comfyui/workflows/h3_fl2v_lightvae.json)
- [Workflow referencias de imagen](https://github.com/ModelTC/LightVAE/blob/main/comfyui/workflows/h3_ref_image_lightvae.json)
- [Workflow referencia de vídeo](https://github.com/ModelTC/LightVAE/blob/main/comfyui/workflows/h3_ref_video_lightvae.json)
- [LightX2V](https://github.com/ModelTC/LightX2V)
- [Archivos y versiones del repositorio](https://huggingface.co/lightx2v/LightVAE/tree/main)
- [MiniMax-H3 VAE original en Comfy-Org](https://huggingface.co/Comfy-Org/MiniMax-H3)
