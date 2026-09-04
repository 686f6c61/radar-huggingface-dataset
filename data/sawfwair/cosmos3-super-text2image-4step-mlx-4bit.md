# Sawfwair/Cosmos3-Super-Text2Image-4Step-MLX-4bit

## Resumen

El modelo Sawfwair/Cosmos3-Super-Text2Image-4Step-MLX-4bit es una conversión nativa a MLX del checkpoint de texto a imagen `nvidia/Cosmos3-Super-Text2Image-4Step`, desarrollada por Sawfwair. Esta adaptación permite ejecutar el modelo directamente sobre Apple Silicon, sin necesidad de GPUs NVIDIA ni de capas de compatibilidad adicionales. El modelo resuelve la necesidad de disponer de un generador de imágenes de alta capacidad en hardware de Apple con memoria unificada, aprovechando la cuantización de 4 bits para reducir el consumo de memoria.

El backbone original es una arquitectura mixture-of-transformers con 64 mil millones de parámetros. La versión MLX aplica cuantización afín por grupos de 4 bits con un tamaño de grupo de 64, mientras que el VAE y los tensores de normalización, proyección y time-embedding conservan su precisión original. El artefacto está limitado exclusivamente a la generación de imágenes a partir de texto; las proyecciones de audio y el head del modelo de lenguaje se omiten deliberadamente.

La relevancia actual del modelo radica en que ofrece una vía práctica para probar un modelo de 64B en un MacBook Pro con 128 GB de memoria unificada, con una generación 768x768 completada en unos 61 segundos. Además, al estar basado en un checkpoint destilado de cuatro pasos, evita el uso de classifier-free guidance y simplifica el pipeline de inferencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-transformers (MoT) |
| Parametros totales | 64 mil millones |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 4-bit (cuantización afín por grupos de 64); VAE y tensores auxiliares en precisión original |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model Development and Weight License 1.1 (openmdw-1.1) |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

La arquitectura del modelo es un backbone mixture-of-transformers de 64 mil millones de parámetros, según la descripción del autor. La conversión a MLX utiliza cuantización afín de 4 bits con un tamaño de grupo de 64 para los pesos del backbone. Los tensores del VAE, así como los de normalización, proyección y time-embedding, se mantienen en su precisión original, lo que permite preservar la estabilidad numérica en esas capas críticas.

El modelo base es un checkpoint destilado de NVIDIA que utiliza un scheduler estocástico fijo de cuatro pasos y no emplea classifier-free guidance. Esta conversión concreta elimina las proyecciones de sonido (`audio_proj_in.*`, `audio_proj_out.*`), el embedding de modalidad de audio (`audio_modality_embed`) y el head del modelo de lenguaje (`lm_head.weight`), ya que el artefacto solo soporta la tarea de texto a imagen. No se proporcionan datos sobre el conjunto de entrenamiento, el número de tokens ni procesos de RLHF o DPO.

## Capacidades

- Generación de imágenes a partir de prompts de texto con una resolución de 768x768 en la validación publicada.
- Inferencia con scheduler destilado de cuatro pasos, sin necesidad de classifier-free guidance.
- Ejecución nativa en Apple Silicon mediante el framework MLX, sin depender de CUDA.
- Soporte de cuantización 4-bit con grupo de 64, lo que reduce el consumo de memoria frente a la precisión BF16.
- Conversión determinista a nivel de tensor, con inventario de tensores y comprobaciones automatizadas de configuración.
- No soporta prompts negativos, overrides de scheduler ni ajustes de flow-shift.
- No incluye la modalidad de audio ni la generación de vídeo; el artefacto se limita a texto a imagen.

## Casos de uso

- Generación de imágenes en un MacBook Pro con Apple Silicon: mediante `mere.run video cosmos3` y el repositorio local del modelo, se puede producir una imagen 768x768 en aproximadamente 61 segundos en un M4 Max con 128 GB de memoria unificada.
- Prototipado de assets visuales en entornos sin GPU NVIDIA: la cuantización MLX de 4 bits permite ejecutar un modelo de 64B en hardware de Apple, lo que resulta útil para diseñadores y estudios que trabajan en portátiles de gama alta.
- Investigación local sobre modelos destilados de texto a imagen: el checkpoint de cuatro pasos facilita pruebas rápidas de prompts y evaluación de la calidad de salida sin necesidad de servicios en la nube.
- Demostraciones y formación sobre despliegue de modelos cuantizados: la conversión incluye `CONVERSION.json`, `SOURCE_MANIFEST.json` y `SHA256SUMS`, lo que permite estudiar el proceso de conversión y reproducir la generación.
- Aplicaciones con restricciones de privacidad: al ejecutarse de forma local, no se envían prompts a servidores externos, lo que resulta adecuado para entornos donde los datos no deben salir del equipo.
- Experimentación con modelos de gran tamaño en memoria unificada: el pico de memoria observado de 53,4 GB para una imagen 768x768 permite plantear su uso en equipos con 64 GB o más, siempre que se ajusten las dimensiones y el tamaño de lote.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La única medición publicada es una ejecución nativa de referencia en un Apple M4 Max MacBook Pro con 128 GB de memoria unificada y macOS 26.5.2, realizada con una compilación de depuración de `mere.run`. Esta ejecución no constituye un benchmark estándar ni una evaluación de paridad visual con el checkpoint BF16 de NVIDIA.

| Medicion | Resultado |
|---|---|
| Tiempo de ejecucion | 60,85 segundos |
| Memoria maxima residente | 38.657.916.928 bytes |
| Pico de memoria | 53.394.599.464 bytes |
| Swaps | 0 |
| Resolucion de salida | 768x768 |
| Seed | 42 |

## Requisitos de hardware

- Memoria unificada estimada: el pico de memoria observado en una generación 768x768 fue de aproximadamente 53,4 GB, con una memoria máxima residente de 38,7 GB. Se recomienda un equipo con al menos 64 GB de memoria unificada, siendo 128 GB la configuración validada.
- GPU recomendada: Apple Silicon, concretamente un Apple M4 Max con 128 GB de memoria unificada, que fue el entorno utilizado en la validación nativa.
- Compatibilidad con GPU de consumo: no disponible. El modelo está convertido a MLX y no se ha documentado soporte para CUDA ni para GPU de NVIDIA.
- Opciones de despliegue: `mere.run` es la herramienta de referencia. No se mencionan alternativas como vLLM, Ollama o TGI para este artefacto.
- Latencia estimada: una imagen de 768x768 tarda aproximadamente 60,85 segundos en el entorno validado, lo que equivale a un throughput de aproximadamente una imagen por minuto.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este artefacto con otros modelos de la misma categoría. La referencia directa es el modelo base `nvidia/Cosmos3-Super-Text2Image-4Step`, del cual deriva. La principal diferencia es que el modelo base se distribuye en precisión BF16 y no está optimizado para MLX, mientras que esta conversión utiliza cuantización 4-bit y se limita a la tarea de texto a imagen. No se han publicado datos de benchmarks que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos, pero el modelo base puede heredar sesgos no evaluados de su entrenamiento.
- Riesgo de alucinacion: la generación de imágenes puede producir resultados que no se corresponden fielmente con el prompt. No se ha realizado una evaluación de paridad visual con el checkpoint BF16 de NVIDIA.
- Limitaciones de idioma: no se especifican los idiomas soportados, por lo que el comportamiento con prompts en lenguajes distintos al inglés no está garantizado.
- Limitaciones técnicas: no se soportan prompts negativos, overrides de scheduler ni ajustes de flow-shift. El scheduler es fijo de cuatro pasos.
- Restricciones de licencia: la licencia es NVIDIA Open Model Development and Weight License 1.1 (openmdw-1.1). Es necesario revisar el texto completo de la licencia y las restricciones de uso antes de descargar o redistribuir los pesos.
- El artefacto no incluye el guardrail de NVIDIA. Se deben añadir comprobaciones de seguridad tanto en el prompt como en la salida antes de mostrar imágenes generadas a usuarios.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Sawfwair/Cosmos3-Super-Text2Image-4Step-MLX-4bit
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Super-Text2Image-4Step
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
- Página externa con referencias del modelo base: https://crafiq.ai/models/image/nvidia-cosmos3-super-text2image-4step
