# matrixportalx/flux1-schnell-npu

## Resumen

`matrixportalx/flux1-schnell-npu` es un paquete de pesos redistribuido del modelo de generación de imágenes FLUX.1 [schnell] de Black Forest Labs, empaquetado por el usuario matrixportalx para su uso con `stable-diffusion.cpp` en dispositivos con NPU Snapdragon. No se trata de un modelo nuevo ni de un fine-tuning: es un espejo de conveniencia que reúne en un único repositorio los cuatro componentes necesarios para inferencia (modelo de difusión, codificador de texto CLIP-L, codificador T5-XXL y VAE) con los nombres de fichero que espera una aplicación concreta ("Rüya ve Esin", según la model card).

El componente principal es el UNet de FLUX.1 [schnell] cuantizado a Q4_0 GGUF (procedente de `leejet/FLUX.1-schnell-gguf`), acompañado de CLIP-L en safetensors, T5-XXL en Q4_K_M GGUF (de `city96`) y el VAE de FLUX.1. El total de parámetros declarados en safetensors asciende a 11.891.178.560, lo que corresponde al conjunto de pesos del pipeline completo en sus formatos originales, no a un único transformer.

Su relevancia es acotada: sirve como referencia práctica de despliegue de FLUX.1 [schnell] en hardware ARM con NPU bajo licencia Apache 2.0, pero no aporta innovación técnica propia. El repositorio tiene 37 descargas y 0 likes en el momento de la consulta, y fue creado el 31 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (FLUX.1 [schnell]) con codificadores de texto CLIP-L y T5-XXL y VAE; pipeline completo de text-to-image |
| Parametros totales | 11.891.178.560 (según safetensors del repo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de imagen; la longitud de prompt depende del tokenizador de T5-XXL y CLIP-L, no se especifica) |
| Tipos de cuantizacion | Q4_0 (modelo de difusión), Q4_K_M (T5-XXL), F32 (capas indicadas por el autor), safetensors sin cuantizar (CLIP-L y VAE) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`diffusion_model.gguf`, `t5xxl.gguf`) y safetensors (`clip_l.safetensors`, `vae.safetensors`) |

## Arquitectura y entrenamiento

El modelo subyacente es FLUX.1 [schnell], un transformer de difusión desarrollado por Black Forest Labs que genera imágenes a partir de texto. La variante "schnell" está destilada para inferencia en pocos pasos: la model card indica explícitamente 4 pasos de muestreo con CFG 1. El pipeline combina un codificador CLIP-L, un codificador T5-XXL (usado para el prompt principal) y un VAE para decodificar el latente a imagen.

Este repositorio no incluye información sobre el entrenamiento original (número de tokens, composición del dataset, RLHF/DPO). Tampoco documenta innovaciones técnicas propias: el autor declara que los ficheros se copiaron sin modificar, solo renombrados a los nombres que espera la aplicación. Las únicas transformaciones mencionadas son las cuantizaciones ya presentes en los repositorios de origen (Q4_0 del UNet, Q4_K_M del T5-XXL).

## Capacidades

- Generación de imágenes text-to-image con FLUX.1 [schnell] en 4 pasos de muestreo y CFG 1.
- Acepta prompts en lenguaje natural procesados por CLIP-L y T5-XXL; el idioma efectivo depende de los codificadores originales (no documentado en este repo).
- Ejecución orientada a NPU Snapdragon mediante `stable-diffusion.cpp`, con el codificador T5-XXL ejecutándose en CPU según la model card.
- Empaquetado listo para una aplicación concreta ("Rüya ve Esin"), con nombres de fichero predefinidos.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo "thinking": es un modelo de generación de imágenes.
- No se documenta soporte multilingüe explícito ni lista de idiomas.

## Casos de uso

- Generación de imágenes en dispositivos móviles con Snapdragon: el paquete está pensado para cargarse desde `stable-diffusion.cpp` en la NPU, con el UNet en Q4_0 para reducir el peso en memoria y el T5-XXL en CPU.
- Prototipado rápido de text-to-image en local: al reunir los cuatro ficheros necesarios en un solo repo, permite reproducir el pipeline sin descargar de cuatro repositorios distintos.
- Aplicaciones de demostración tipo "Rüya ve Esin": el autor mantiene el espejo precisamente para que esas apps sigan funcionando aunque los repositorios de origen desaparezcan o se oculten.
- Evaluación de cuantización Q4_0 frente a pesos completos: útil para medir la pérdida de calidad del UNet a 4 bits en tareas de generación de imagen.
- Despliegue en entornos con poco ancho de banda o almacenamiento limitado: el repo completo ocupa 10,4 GB, lo que facilita la distribución en un único artefacto.
- Integración en pipelines de CI para pruebas de regresión visual: al fijar versiones concretas (commit hashes indicados en la tabla de la model card), se puede reproducir una misma generación de forma determinista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: no disponible de forma explícita. El repo pesa 10,4 GB; el UNet Q4_0 y el T5-XXL Q4_K_M reducen el peso respecto a los pesos F32, pero el autor no publica cifras de memoria en inferencia.
- Hardware objetivo: NPU Snapdragon (según los tags `snapdragon` y `stable-diffusion.cpp`); el T5-XXL se ejecuta en CPU según la model card.
- GPU dedicadas (A100, H100, RTX 4090): no documentadas para este paquete; el formato GGUF es compatible con `stable-diffusion.cpp`, pero no se confirma soporte CUDA en la información disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: `stable-diffusion.cpp` (explícito); otros runners GGUF (llama.cpp, Ollama, vLLM, TGI) no están documentados para este paquete y, en el caso de vLLM/TGI, no aplican a modelos de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / pasos | Licencia | Disponibilidad |
|---|---|---|---|---|
| `matrixportalx/flux1-schnell-npu` (este repo) | 11.891.178.560 (pipeline completo) | 4 pasos, CFG 1 | Apache 2.0 | GGUF + safetensors, mirror |
| `leejet/FLUX.1-schnell-gguf` (origen del UNet) | No disponible | 4 pasos, CFG 1 | Apache 2.0 | GGUF |
| `city96/t5-v1_1-xxl-encoder-gguf` (origen del T5) | No disponible | No aplica (codificador) | Apache 2.0 | GGUF |
| `comfyanonymous/flux_text_encoders` (origen de CLIP-L) | No disponible | No aplica (codificador) | No disponible en la información | safetensors |

La comparación relevante es con los repositorios de origen, ya que este paquete no modifica los pesos. No se dispone de datos de benchmarks para comparar rendimiento entre ellos.

## Limitaciones y advertencias

- No es un modelo original: es un espejo de ficheros de terceros renombrados; cualquier problema de calidad o seguridad proviene de FLUX.1 [schnell] y de las cuantizaciones de origen.
- La model card está redactada en turco y no documenta sesgos, tasas de alucinación visual ni evaluación cualitativa.
- La cuantización Q4_0 del UNet y Q4_K_M del T5-XXL introducen pérdida de fidelidad respecto a los pesos F32; no se cuantifica esa pérdida en el repo.
- La licencia Apache 2.0 se declara a nivel de repositorio, pero el usuario debe verificar la licencia de cada fichero de origen (FLUX.1 [schnell], CLIP-L, T5-XXL, VAE) antes de uso comercial.
- Dependencia de una aplicación concreta ("Rüya ve Esin") y de nombres de fichero específicos; no es un paquete genérico listo para cualquier runner.
- Sin información sobre idiomas soportados, latencia, memoria requerida ni compatibilidad con GPU de consumo.
- El repositorio tiene muy poca tracción (37 descargas, 0 likes) y fue creado recientemente; no hay garantía de mantenimiento.
- Riesgo de que los repositorios de origen cambien o desaparezcan: el espejo mitiga ese riesgo, pero fija versiones concretas que pueden quedar desactualizadas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/matrixportalx/flux1-schnell-npu
- Origen del UNet: https://huggingface.co/leejet/FLUX.1-schnell-gguf
- Origen de CLIP-L: https://huggingface.co/comfyanonymous/flux_text_encoders
- Origen del T5-XXL: https://huggingface.co/city96/t5-v1_1-xxl-encoder-gguf
- Origen del VAE: https://huggingface.co/matrixportalx/z-image-turbo-npu
- Perfil del autor: https://huggingface.co/matrixportalx
- `stable-diffusion.cpp` (runner referenciado en los tags): no se incluye URL en la información proporcionada.
