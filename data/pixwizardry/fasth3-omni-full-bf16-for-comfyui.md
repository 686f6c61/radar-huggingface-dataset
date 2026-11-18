# PixWizardry/FastH3-Omni-Full-BF16-for-ComfyUI

## Resumen

FastH3 Omni Full BF16 for ComfyUI es una conversión a fichero único del modelo FastH3 Omni 8-Step V1 de FastVideo, preparada por PixWizardry para su uso directo en ComfyUI. Se trata de un modelo de difusión para generación de vídeo condicionada por referencias (reference-to-video) con audio sincronizado, derivado del MiniMax H3 original y destilado a 8 pasos de inferencia por el Hao AI Lab y Nuva Lab.

El repositorio empaqueta los 14 shards BF16 originales del transformer en un único `.safetensors` de aproximadamente 70,19 GB, conservando los 50 bloques del transformer, los dos bloques token-refiner y las 32 cabezas PDD. La conversión se realizó con la herramienta oficial de FastVideo usando `--adaln-curve-rank 0`, manteniendo las matrices AdaLN completas y el MLP de timestep, con los pesos de atención fusionados en orden Q, K, V y las cabezas de salida PDD en FP32.

Es relevante para desarrolladores que quieran desplegar generación de vídeo con audio en ComfyUI sin gestionar múltiples shards ni pipelines de conversión propios, a costa de un requisito de memoria muy elevado. No se han publicado resultados de benchmarks comparativos de calidad para esta conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (50 bloques + 2 token-refiner + 32 cabezas PDD), derivado de MiniMax H3 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 con cabezas de salida FP32 (export único); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | MiniMax-H3 Community License Agreement |
| Formato de pesos | safetensors (fichero único, `diffusion-single-file`) |

## Arquitectura y entrenamiento

El modelo subyacente es FastH3 Omni 8-Step V1, una destilación de MiniMax H3 orientada a generación de vídeo condicionada por referencias con pista de audio sincronizada. La arquitectura es un transformer de difusión con 50 bloques principales, dos bloques token-refiner para el procesamiento de las referencias de entrada y 32 cabezas PDD (output heads) para la predicción final. La destilación reduce la inferencia a 8 pasos con guidance 1.0.

Esta conversión concreta no aporta entrenamiento nuevo: es un reempaquetado de los pesos BF16 originales mediante las herramientas de conversión de FastVideo. Se preservan las matrices AdaLN completas y el MLP de timestep (`--adaln-curve-rank 0`), los pesos de atención se fusionan en orden Q, K, V y las cabezas PDD se exportan en FP32 para coincidir con la representación de ComfyUI. No se documentan en la información disponible detalles sobre el dataset de entrenamiento, número de tokens, composición ni etapas de RLHF/DPO del modelo base.

## Capacidades

- Generación de vídeo condicionada por referencias de imagen, vídeo y audio, mediante las etiquetas `<Picture 1>`, `<Video 1>` y `<Audio 1>`.
- Generación de audio sincronizado con el vídeo en la misma pasada de inferencia.
- Inferencia en 8 pasos de destilación con guidance 1.0, lo que reduce el coste computacional frente a modelos de difusión no destilados.
- Atención dispersa configurable (`vsa`) con porcentaje de retención ajustable (valor por defecto 10).
- Integración nativa en ComfyUI mediante el nodo Load Diffusion Model y el workflow oficial de reference-to-video.
- Control de desplazamiento temporal separado para vídeo y audio (shift 12 y 3 respectivamente).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step ni soporte multilingüe de texto.

## Casos de uso

- Prototipado de vídeo generativo en ComfyUI: el fichero único elimina la gestión de 14 shards y permite cargar el modelo directamente en `ComfyUI/models/diffusion_models/`, acelerando la puesta en marcha de entornos de prueba.
- Generación de vídeo con audio para contenido corto: el modelo produce vídeo y audio sincronizados en 8 pasos, adecuado para clips promocionales o piezas de redes sociales donde la coherencia audio-visual es prioritaria.
- Reference-to-video para consistencia de personaje o estilo: el condicionamiento por `<Picture 1>` y `<Video 1>` permite mantener la identidad visual de un sujeto o la estética de un clip de referencia a lo largo de la generación.
- Doblaje y re-sincronización creativa: el uso de `<Audio 1>` como referencia permite generar vídeo condicionado por una pista de audio dada, útil en experimentación con locuciones o bandas sonoras.
- Investigación en destilación de modelos de difusión: al conservar arquitectura completa y pesos BF16, sirve como base para estudiar el efecto de la destilación a 8 pasos y de la atención dispersa `vsa`.
- Pipelines de previsualización en estudio: con offloading y resolución moderada, puede integrarse en flujos de previsualización rápida antes de renderizados de mayor calidad con modelos no destilados.
- Evaluación comparativa de componentes ComfyUI: al requerir text encoder, VAE de vídeo y VAE de audio de MiniMax H3 cargados por separado, es útil para validar combinaciones de componentes existentes en un entorno ComfyUI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la conversión ha generado vídeo correctamente, pero que las comparativas de calidad aún no se han realizado.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta; el fichero de pesos ocupa aproximadamente 70,19 GB en BF16, por lo que la inferencia completa sin offloading exige más de esa cifra entre pesos y activaciones.
- RAM del sistema: la model card advierte que el export de pesos completos requiere RAM y VRAM sustanciales; el pico de memoria depende de resolución, número de frames, referencias de entrada y offloading.
- GPU recomendadas: no se especifican modelos concretos; por el tamaño del fichero, GPUs de 80 GB (A100, H100) son el escenario natural para carga completa, y configuraciones consumer requieren offloading agresivo.
- Viabilidad en GPU consumer: no confirmada; el tamaño de 70,19 GB en BF16 supera la VRAM de cualquier GPU consumer actual, por lo que solo es viable con offloading a RAM o cuantización adicional no documentada.
- Despliegue: ComfyUI con el nodo Load Diffusion Model y el workflow oficial `video_fasth3_ominiref_r2v.json`; requiere text encoder MiniMax H3, VAE de vídeo y VAE de audio cargados por separado.
- Latencia y throughput: no disponibles; la inferencia se fija en 8 pasos con guidance 1.0, atención `vsa` al 10 % y shift vídeo/audio de 12/3.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| PixWizardry/FastH3-Omni-Full-BF16-for-ComfyUI | no disponible (fichero ~70,19 GB BF16) | no disponible | MiniMax-H3 Community License | safetensors único | Hugging Face, ComfyUI |
| FastVideo/FastVideo-FastH3-Omni-8-Step-V1 | no disponible | no disponible | no disponible en la informacion | múltiples shards BF16 (14) | Hugging Face |
| MiniMaxAI/MiniMax-H3 | no disponible | no disponible | MiniMax-H3 Community License | no disponible en la informacion | Hugging Face |
| FastVideo/FastH3-Omni-Comfy | no disponible | no disponible | no disponible en la informacion | componentes ComfyUI + herramientas de conversión | Hugging Face |

## Limitaciones y advertencias

- Requisito de memoria muy elevado: 70,19 GB de pesos BF16 más activaciones; el pico depende de resolución, frames, referencias y offloading, lo que limita el despliegue a hardware de gama alta o configuraciones con offloading.
- Calidad no validada comparativamente: el autor confirma generación funcional pero no ha realizado benchmarks de calidad frente al modelo base ni a alternativas.
- Dependencia de componentes externos: necesita text encoder MiniMax H3, VAE de vídeo y VAE de audio cargados por separado; una versión incompatible de cualquiera de ellos puede degradar o romper la generación.
- Licencia restrictiva: se rige por la MiniMax-H3 Community License Agreement, con posibles condiciones para uso comercial que deben revisarse antes de producción.
- Sin datos de sesgos, alucinación o cobertura idiomática: la información disponible no documenta evaluación de sesgos ni comportamiento multilingüe.
- Conversión de terceros: no es un release oficial de FastVideo ni de MiniMax; los pesos han sido reempaquetados por PixWizardry, sin garantías de soporte upstream.
- Configuración sensible: los valores de shift (12/3), atención `vsa` al 10 % y 8 pasos son los esperados por este export; desviarse puede alterar la calidad o la sincronización audio-vídeo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/PixWizardry/FastH3-Omni-Full-BF16-for-ComfyUI
- Modelo base: https://huggingface.co/FastVideo/FastVideo-FastH3-Omni-8-Step-V1
- Modelo original MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Componentes compartidos ComfyUI: https://huggingface.co/FastVideo/FastH3-Omni-Comfy
- Herramientas de conversión: https://huggingface.co/FastVideo/FastH3-Omni-Comfy/tree/main/conversion
- Workflow oficial reference-to-video: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_fasth3_ominiref_r2v.json
- ComfyUI: https://github.com/Comfy-Org/ComfyUI
