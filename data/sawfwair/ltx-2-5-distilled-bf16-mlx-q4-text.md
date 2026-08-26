# Sawfwair/LTX-2.5-Distilled-BF16-MLX-Q4-Text

## Resumen

Este repositorio contiene una distribución autocontenida del modelo LTX 2.5 distilled, preparada específicamente para ejecutarse en Apple Silicon mediante el runtime `mere.run`. El autor, Sawfwair, ha convertido el language tower (Gemma 4 12B) a cuantización MLX Q4 con grupo de tamaño 64, reduciendo su peso de 26,3 GB a aproximadamente 9,04 GB, mientras que el transformer de video, los VAE, el upsampler espacial y el duration head se mantienen en BF16 original. El resultado es un paquete único de 53,9 GB que permite generar video a partir de imágenes sin necesidad de descargar componentes adicionales.

LTX 2.5 es un modelo de mundo abierto de 22 mil millones de parámetros desarrollado por Lightricks, capaz de generar video y audio sincronizados en una sola pasada, con soporte nativo multi-shot y mejor adherencia al prompt. Esta distribución concreta es relevante porque facilita la ejecución local en hardware de Apple, un segmento que tradicionalmente ha tenido menos soporte para modelos de generación de video de gran tamaño. La cuantización del text encoder reduce significativamente los requisitos de memoria sin tocar los componentes de video, que son los más sensibles a la pérdida de precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de video + VAE + upsampler espacial + duration head + language tower Gemma 4 12B (cuantizado Q4) |
| Parametros totales | No disponible (el modelo base LTX-2.5 tiene 22B, pero esta distribucion no desglosa el total) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4 affine (grupo 64) para el language tower; BF16 para el resto de componentes |
| Idiomas soportados | No disponible |
| Licencia | ltx-2-community-license (con umbral de uso comercial y condiciones de redistribucion) |
| Formato de pesos | safetensors (BF16) y MLX (Q4) |

## Arquitectura y entrenamiento

El modelo se basa en LTX 2.5, un generador de video y audio de una sola pasada que combina un transformer de video con VAE, un upsampler espacial y un duration head. La innovacion principal de esta distribucion es la conversion del language tower, originalmente un Gemma 4 12B en BF16, a cuantizacion MLX affine de 4 bits con grupo de 64. Esta conversion afecta solo a los pesos elegibles (embeddings y capas lineales 2D), mientras que las normalizaciones, la proyeccion especifica de LTX y los assets del tokenizer permanecen en BF16. El proceso de cuantizacion esta documentado en el PR #366 del repositorio `mere.run`.

El modelo es una version destilada de LTX 2.5, aunque no se especifican los detalles del proceso de destilacion (datos, metodologia o funcion de perdida). Los componentes de video se mantienen en su precision original BF16, lo que preserva la calidad de generacion, mientras que la cuantizacion del text encoder reduce el peso total y la memoria necesaria para el acondicionamiento por prompt. Durante la generacion, `mere.run` libera el language tower despues del acondicionamiento del prompt, de modo que no permanece residente durante el denoising del video.

## Capacidades

- Generacion de video a partir de imagenes (image-to-video) con audio sincronizado en una sola pasada.
- Soporte nativo multi-shot, lo que permite generar secuencias de video continuas o multiples tomas.
- Adherencia al prompt mejorada respecto a versiones anteriores de LTX.
- El language tower cuantizado mantiene la comprension semantica del prompt, aunque con posible perdida menor de precision en tareas linguisticas complejas.
- No se documentan capacidades de tool calling, agentes o razonamiento multi-paso, ya que el modelo esta orientado a generacion de video.
- Idiomas soportados: no especificados en la documentacion disponible.

## Casos de uso

- Creacion de contenido audiovisual para redes sociales: el modelo puede generar clips cortos con audio sincronizado a partir de una imagen de referencia, util para marketing o storytelling visual.
- Prototipado rapido de animaciones: los equipos de diseno pueden generar storyboards animados a partir de imagenes fijas sin necesidad de renderizado complejo.
- Simulacion de mundos para videojuegos: la capacidad de generar video y audio en una sola pasada permite crear entornos de prueba o cinematics procedurales.
- Edicion de video asistida por IA: se puede usar para extender o modificar secuencias existentes a partir de fotogramas clave.
- Investigacion en modelos generativos: esta distribucion permite estudiar el impacto de la cuantizacion del text encoder en la calidad del video generado, comparando con la version BF16 completa.
- Generacion de video para presentaciones o material educativo: a partir de una imagen, se puede crear una animacion explicativa con narracion sintetica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta distribucion en la informacion disponible. El modelo base LTX-2.5 tiene metricas publicadas por Lightricks, pero no se incluyen en este repositorio ni en los resultados de busqueda. Se recomienda consultar la documentacion oficial de LTX-2.5 para datos de rendimiento comparativo.

## Requisitos de hardware

- Diseñado exclusivamente para Apple Silicon (chips M-series) mediante el runtime `mere.run`.
- El repositorio completo ocupa 53,9 GB, por lo que se recomienda un Mac con al menos 64 GB de RAM unificada para cargar todos los componentes en memoria.
- El language tower cuantizado ocupa aproximadamente 9,04 GB, lo que reduce la presion de memoria durante el acondicionamiento del prompt.
- No requiere GPU NVIDIA ni CUDA; la ejecucion se realiza en la GPU integrada de Apple.
- El runtime `mere.run` gestiona la carga y liberacion de componentes, optimizando el uso de memoria durante la generacion.
- No se proporcionan datos de latencia o throughput en la documentacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Sawfwair/LTX-2.5-Distilled-BF16-MLX-Q4-Text | No disponible (base 22B) | No disponible | ltx-2-community | MLX + safetensors | Optimizado para Apple Silicon, text encoder Q4 |
| Lightricks/LTX-2.5 (original) | 22B | No disponible | ltx-2-community | safetensors | Requiere GPU NVIDIA, text encoder BF16 completo |
| realrebelai/LTX-2.5_GGUFs | 22B | No disponible | ltx-2-community | GGUF | Cuantizacion Q4_K_M para CPU/GPU, sin optimizacion especifica para Apple |

La comparativa se basa en la informacion publica de cada repositorio. No se dispone de datos de rendimiento medidos para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- La licencia ltx-2-community-license incluye un umbral de uso comercial y condiciones de redistribucion; es obligatorio revisar el acuerdo completo antes de usar el modelo en produccion.
- El language tower cuantizado a Q4 puede degradar ligeramente la comprension de prompts complejos o multilingues en comparacion con la version BF16 completa.
- El modelo esta limitado a hardware Apple Silicon; no es portable a entornos con GPU NVIDIA o AMD sin conversion adicional.
- No se especifican los idiomas soportados, por lo que el rendimiento en lenguas distintas del ingles no esta garantizado.
- El repositorio no incluye benchmarks propios, por lo que el rendimiento real en tareas especificas debe validarse de forma independiente.
- La generacion de video y audio puede producir contenido con sesgos o alucinaciones visuales, especialmente con prompts ambiguos o fuera de distribucion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Sawfwair/LTX-2.5-Distilled-BF16-MLX-Q4-Text
- Modelo base Lightricks/LTX-2.5: https://huggingface.co/Lightricks/LTX-2.5
- Licencia LTX-2.x Community License: https://github.com/Lightricks/LTX-2/blob/main/LICENSE.md
- PR de mere.run con la implementacion de cuantizacion: https://github.com/sawfwair/mere-run/pull/366
- Blog de LTX sobre LTX-2.5: https://ltx.io/model/ltx-2-5
- Guia de LTX-2.5 en HackerNoon: https://hackernoon.com/ltx-25-a-complete-guide-to-lightricks-audio-video-ai-model
