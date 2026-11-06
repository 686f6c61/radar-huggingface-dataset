# R2666/LTX-Video

## Resumen

LTX-Video es un modelo de generación de vídeo basado en arquitectura DiT (Diffusion Transformer) desarrollado por Lightricks. Se trata del primer modelo de su categoría capaz de generar vídeo de alta calidad en tiempo real: produce clips a 30 FPS y resolución 1216×704 a una velocidad superior a la de reproducción. El modelo se distribuye principalmente en variantes de 13B y 2B parámetros, con versiones base, destiladas y cuantizadas en FP8.

La ficha que nos ocupa, R2666/LTX-Video, es una republicación del modelo original en Hugging Face bajo la librería diffusers, con pipeline image-to-video. El repositorio contiene 1.923.385.472 parámetros en formato safetensors y ocupa 208,8 GB, lo que sugiere que incluye múltiples variantes o pesos en precisión completa del modelo de 13B (los 1,92B declarados corresponden probablemente a la variante de 2B o a un subconjunto de los pesos). El modelo está etiquetado únicamente para inglés.

Su relevancia radica en la combinación de calidad y velocidad: frente a modelos de difusión de vídeo que requieren minutos por clip, LTX-Video apunta a generación interactiva o casi en tiempo real, lo que habilita flujos de trabajo de creación de contenido donde la latencia es crítica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) para generación de vídeo |
| Parametros totales | 1.923.385.472 (según safetensors del repo); variantes de 13B y 2B en el modelo original |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vídeo, no de texto) |
| Tipos de cuantizacion | FP8 (variantes -fp8 en el modelo original); no se detallan otras en la información disponible |
| Idiomas soportados | en |
| Licencia | other |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento

LTX-Video emplea una arquitectura DiT (Diffusion Transformer), un paradigma que sustituye las U-Nets clásicas de los modelos de difusión por transformers puros, lo que facilita el escalado y mejora la calidad en generación de vídeo. El modelo está entrenado sobre un dataset a gran escala de vídeos diversos, según indica la model card, aunque no se especifica el número de tokens, horas de vídeo ni la composición exacta del corpus.

La innovación principal es su capacidad de generar a 30 FPS en 1216×704 más rápido de lo que se reproduce el vídeo, lo que lo posiciona para aplicaciones en tiempo real. El ecosistema incluye variantes destiladas (distilled) para reducir VRAM y latencia a costa de una ligera pérdida de calidad, y variantes FP8 cuantizadas. No se detalla en la información disponible si hubo RLHF, DPO ni técnicas de decodificación especulativa; tampoco se especifican mecanismos de atención lineal o híbridos.

## Capacidades

- Generación de vídeo a partir de imagen (image-to-video), el pipeline declarado en Hugging Face.
- Generación de vídeo de alta resolución: 1216×704 a 30 FPS.
- Generación en tiempo real o más rápida que la reproducción del vídeo.
- Variantes destiladas para iteración rápida con menor consumo de VRAM.
- Variantes FP8 para despliegue con requisitos de memoria reducidos.
- Integración con diffusers (LTXPipeline) y con ComfyUI mediante workflows oficiales.
- Soporte de flujos multi-escala (multi-scale rendering) que combinan modelos dev y distilled para equilibrar velocidad y calidad.
- Idioma: únicamente inglés en las etiquetas del modelo.

## Casos de uso

- Previsualización rápida en producción audiovisual: los editores pueden generar clips de prueba a 1216×704 y 30 FPS en tiempos inferiores a la reproducción, acelerando la iteración creativa antes del render final.
- Creación de contenido para redes sociales: generación de vídeo vertical u horizontal a partir de una imagen semilla, con la variante destilada para iterar rápido en un portátil con GPU consumer.
- Animación de imágenes fijas en pipelines de marketing: convertir assets gráficos en clips animados breves usando el pipeline image-to-video y los workflows de ComfyUI recomendados.
- Prototipado de videojuegos y previsualización de cinemáticas: generar secuencias de referencia a partir de concept art para validar dirección artística antes de la producción.
- Generación interactiva en aplicaciones web: la velocidad superior a tiempo real permite integraciones donde el usuario ve el resultado casi al instante, usando la variante distilled o FP8 para reducir latencia.
- Investigación en generación de vídeo: el modelo sirve como baseline DiT reproducible en diffusers para experimentos de destilación, cuantización o evaluación de calidad de vídeo.
- Automatización de contenido educativo: crear animaciones explicativas a partir de diagramas o ilustraciones estáticas con el pipeline image-to-video.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta en la información proporcionada. La model card indica que la variante de 13B requiere "más VRAM" y que las variantes distilled y 2B están pensadas para "uso ligero de VRAM".
- GPU recomendadas: no se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la información disponible.
- GPU consumer: la existencia de variantes distilled de 2B y de versiones FP8 sugiere que el modelo puede ejecutarse en GPUs consumer, aunque no se confirma qué modelos exactos ni con qué VRAM.
- Opciones de despliegue: diffusers (LTXPipeline), ComfyUI con los workflows oficiales de ComfyUI-LTXVideo, y el repositorio de inferencia oficial (inference.py con configs YAML).
- Latencia y throughput: la model card afirma generación a 30 FPS en 1216×704 más rápida que la reproducción en tiempo real, pero no se aportan cifras de latencia por clip ni throughput medido en hardware concreto.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones comparables de otros modelos en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Cualitativamente, LTX-Video se distingue por su enfoque en generación en tiempo real frente a modelos de difusión de vídeo de mayor latencia, pero no se aportan cifras para respaldar la comparación.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTX-Video (este repo) | 1,92B (repo); variantes 13B/2B | no disponible | 30 FPS a 1216×704 en tiempo real (según model card) | other | Hugging Face, diffusers, ComfyUI |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia "other": es imprescindible revisar los términos exactos del modelo original de Lightricks antes de cualquier uso comercial; la información disponible no detalla las restricciones.
- Idioma: el modelo está etiquetado únicamente para inglés, lo que puede limitar la calidad en prompts en castellano u otros idiomas.
- Riesgo de alucinación visual: como todo modelo generativo de vídeo, puede producir artefactos, incoherencias temporales o contenido no fiel a la imagen de entrada.
- Sesgos: no se documentan en la información disponible los sesgos del dataset de entrenamiento; al ser un dataset a gran escala de vídeos diversos, es probable que herede sesgos de representación.
- El repositorio R2666/LTX-Video es una republicación con 64 descargas y 0 likes; no es el repositorio oficial de Lightricks, por lo que conviene verificar la integridad de los pesos y acudir al repo original para producción.
- Los 1.923.385.472 parámetros declarados no coinciden con las variantes de 13B del modelo original; es necesario confirmar qué variante contiene exactamente este repo antes de desplegarlo.
- No se dispone de información sobre latencia medida, VRAM exacta ni requisitos de hardware verificados para este repositorio concreto.

## Enlaces

- Hugging Face (este repo): https://huggingface.co/R2666/LTX-Video
- Repositorio oficial de código: https://github.com/Lightricks/LTX-Video
- Workflows de ComfyUI: https://github.com/Lightricks/ComfyUI-LTXVideo
- Config ltxv-13b-0.9.8-dev: https://github.com/Lightricks/LTX-Video/blob/main/configs/ltxv-13b-0.9.8-dev.yaml
- Config ltxv-13b-0.9.8-distilled: https://github.com/Lightricks/LTX-Video/blob/main/configs/ltxv-13b-0.9.8-dev.yaml
- Config ltxv-2b-0.9.8-distilled: https://github.com/Lightricks/LTX-Video/blob/main/configs/ltxv-2b-0.9.8-dev.yaml
- Config ltxv-13b-0.9.8-dev-fp8: https://github.com/Lightricks/LTX-Video/blob/main/configs/ltxv-13b-0.9.8-dev-fp8.yaml
- Config ltxv-13b-0.9.8-distilled-fp8: https://github.com/Lightricks/LTX-Video/blob/main/configs/ltxv-13b-0.9.8-distilled-fp8.yaml
- Config ltxv-2b-0.9.8-distilled-fp8: https://github.com/Lightricks/LTX-Video/blob/main/configs/ltxv-2b-0.9.8-distilled-fp8.yaml
- Workflow i2v base 13B: https://github.com/Lightricks/ComfyUI-LTXVideo/blob/master/example_workflows/ltxv-13b-i2v-base.json
- Workflow i2v mixed multiscale: https://github.com/Lightricks/ComfyUI-LTXVideo/blob/master/example_workflows/ltxv-13b-i2v-mixed-multiscale.json
- Workflow i2v distilled 13B: https://github.com/Lightricks/ComfyUI-LTXVideo/blob/master/example_workflows/13b-distilled/ltxv-13b-dist-i2v-base.json
- Workflow i2v base 13B FP8: https://github.com/Lightricks/ComfyUI-LTXVideo/blob/master/example_workflows/ltxv-13b-i2v-base-fp8.json
- Workflow i2v distilled 13B FP8: https://github.com/Lightricks/ComfyUI-LTXVideo/blob/master/example_workflows/13b-distilled/ltxv-13b-dist-i2v-base-fp8.json
- LTX Studio (modelos 13B): https://app.ltx.studio/motion-workspace?videoModel=ltxv-13b
- LTX Studio (modelo distilled): https://app.ltx.studio/motion-workspace?videoModel=ltxv
