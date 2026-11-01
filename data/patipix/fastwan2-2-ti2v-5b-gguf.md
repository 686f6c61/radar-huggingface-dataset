# PatiPix/FastWan2.2-TI2V-5B-GGUF

## Resumen

FastWan2.2-TI2V-5B-GGUF es una conversión al formato GGUF (cuantización Q6_K) del transformer del modelo de generación de vídeo a partir de texto FastWan 2.2 TI2V 5B, publicado por el usuario PatiPix. El modelo original lo desarrolla el equipo FastVideo (Hao AI Lab) a partir de Wan 2.2 de Wan-AI (Alibaba), y esta versión empaqueta únicamente el transformer de difusión en un fichero de 4,14 GB pensado para ejecutarse con stable-diffusion.cpp en hardware de consumo.

El interés de esta ficha no está en un modelo nuevo, sino en la distribución: permite ejecutar localmente un generador texto-a-vídeo de 5.000 millones de parámetros sin depender de frameworks de Python pesados, usando un único GGUF junto al VAE de Wan 2.2 y el codificador de texto umT5-XXL. Al ser una variante destilada (FastWan), el muestreo requiere pocos pasos y `--cfg-scale 1.0`, lo que reduce el coste computacional frente al modelo base.

No se trata de un modelo de lenguaje: no genera texto, no razona y no soporta tool calling. Es un componente de un pipeline de difusión vídeo, y su relevancia actual reside en la posibilidad de inferencia local de vídeo corto en GPUs de consumo mediante cuantización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) para texto-a-vídeo, derivado de Wan 2.2 TI2V |
| Parametros totales | 4.999.787.712 (~5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; condicionamiento por prompt de texto) |
| Tipos de cuantizacion | Q6_K (única incluida en el repo) |
| Idiomas soportados | no disponible (el prompt se procesa vía umT5-XXL; el modelo card no detalla idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`FastWan2.2-TI2V-5B-Q6_K.gguf`, 4.141.808.800 bytes) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión (DiT) para generación de vídeo condicionada por texto, heredado de Wan 2.2 TI2V-5B y redistribuido por FastVideo con atención completa (variante `FullAttn`). Esta conversión GGUF no introduce entrenamiento ni ajuste fino: los pesos son los de FastWan 2.2 y solo cambian el formato de fichero y la cuantización. El proceso de conversión mapeó los nombres de tensores de diffusers al layout original de Wan 2.2, verificando los 825 tensores contra el GGUF Q8_0 de Wan2.2-TI2V-5B publicado por QuantStack, y aplicó `sd-cli` de stable-diffusion.cpp (commit `012c7f8`) con `-M convert --type q6_K`.

FastWan es una variante destilada del modelo base, lo que se traduce en la necesidad de pocos pasos de muestreo y `cfg-scale 1.0` en lugar de classifier-free guidance clásico. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO; son datos no publicados en la información disponible.

## Capacidades

- Generación de vídeo corto a partir de una descripción textual (text-to-video).
- Condicionamiento mediante prompt de texto procesado por el codificador umT5-XXL.
- Muestreo con pocos pasos gracias a la destilación de FastWan.
- Ejecución local en hardware de consumo mediante stable-diffusion.cpp.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es un modelo de lenguaje: no genera texto ni código.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No dispone de modo thinking, visión, audio ni otras capacidades multimodales más allá del vídeo generado.

## Casos de uso

- Generación de clips promocionales cortos en local: un estudio pequeño puede producir vídeos breves a partir de descripciones textuales sin enviar datos a servicios en la nube, usando el GGUF Q6_K con stable-diffusion.cpp.
- Prototipado de ideas audiovisuales: guionistas y diseñadores pueden iterar rápidamente sobre conceptos visuales generando clips de prueba antes de producir el material final.
- Creación de contenido para redes sociales: generación de vídeos cortos con estética controlada por prompt, aprovechando el muestreo rápido de la variante destilada.
- Integración en herramientas de escritorio: al ser un único fichero GGUF, se puede empaquetar dentro de una aplicación de escritorio (como hace PatiPix Studio) para generación de vídeo offline en el PC del usuario.
- Educación y demostraciones técnicas: permite mostrar pipelines de difusión vídeo en entornos con recursos limitados, sin necesidad de instalar PyTorch ni diffusers.
- Investigación sobre cuantización: sirve como caso de estudio para medir la degradación de calidad de Q6_K frente a Q8_0 y al modelo en safetensors en tareas de generación de vídeo.
- Generación de material de stock interno: clips de relleno para presentaciones o vídeos corporativos donde no se requiere calidad cinematográfica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El fichero GGUF Q6_K ocupa 4,14 GB, por lo que los pesos del transformer caben en GPUs de consumo con al menos 8 GB de VRAM; sin embargo, hay que sumar el VAE de Wan 2.2 y el codificador umT5-XXL, que incrementan el consumo total.
- VRAM estimada para inferencia: no disponible de forma oficial; en la práctica se requiere margen adicional sobre los 4,14 GB del transformer para VAE y text encoder.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, una RTX 4090 (24 GB) o superior (A100, H100) ofrece holgura; GPUs de 12-16 GB podrían ser viables según la resolución y duración del clip.
- Cabe en GPU de consumo: probablemente sí en modelos con 12 GB o más, aunque no hay confirmación oficial en la información proporcionada.
- Opciones de despliegue: stable-diffusion.cpp (soporte oficial del formato); requiere `--diffusion-model FastWan2.2-TI2V-5B-Q6_K.gguf`, el VAE `wan2.2_vae.safetensors`, el text encoder umT5-XXL y `--cfg-scale 1.0`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Licencia | Notas |
|---|---|---|---|---|
| FastWan2.2-TI2V-5B-GGUF (este) | ~5B | GGUF Q6_K | Apache 2.0 | Destilado, orientado a stable-diffusion.cpp |
| Wan2.2-TI2V-5B-GGUF (QuantStack) | ~5B | GGUF (Q8_0 y otras) | Apache 2.0 | Modelo base sin destilar; usado como referencia de verificación de tensores |
| FastVideo/FastWan2.2-TI2V-5B-FullAttn-Diffusers | ~5B | safetensors (diffusers) | Apache 2.0 | Modelo original en formato diffusers, requiere stack Python |

La comparación con modelos de vídeo de otros tamaños o familias no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo se incluye la cuantización Q6_K; no hay variantes Q4, Q8 u otras en este repositorio.
- El repositorio contiene únicamente el transformer: es imprescindible descargar por separado el VAE de Wan 2.2 y el codificador umT5-XXL para poder generar vídeo.
- Al ser un modelo destilado, requiere `--cfg-scale 1.0` y pocos pasos; usar la configuración del modelo base puede degradar los resultados.
- No es un modelo de lenguaje: no debe evaluarse con benchmarks de texto (MMLU, HumanEval, etc.).
- Riesgo de sesgos y alucinaciones visuales heredado del dataset de entrenamiento de Wan 2.2, no documentado en la información disponible.
- No hay información sobre idiomas soportados en el prompt; el comportamiento multilingüe depende del codificador umT5-XXL.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base Wan 2.2 y de FastVideo.
- Repositorio con 0 likes y 178 descargas en el momento de la consulta: comunidad pequeña y poca validación externa.
- Sin benchmarks publicados: no hay métricas objetivas de calidad de vídeo (FVD, CLIP score) para esta cuantización.

## Enlaces

- HuggingFace: https://huggingface.co/PatiPix/FastWan2.2-TI2V-5B-GGUF
- Modelo base (FastVideo): https://huggingface.co/FastVideo/FastWan2.2-TI2V-5B-FullAttn-Diffusers
- GGUF de referencia (QuantStack): https://huggingface.co/QuantStack/Wan2.2-TI2V-5B-GGUF
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
- Wan 2.2 (Wan-AI, Alibaba): no disponible en la información proporcionada
- Paper de FastWan / FastVideo: no disponible en la información proporcionada
