# grumd0/Hy4-flash-NVFP4-Lowtide

## Resumen

Hy4-flash-NVFP4-Lowtide es una versión cuantizada del modelo Hy4-flash de Tencent, publicada por el usuario grumd0. Se trata de un transformer con arquitectura de mezcla de expertos (MoE) que conserva los 220B parámetros totales del original, incluyendo 63.5B correspondientes a las tablas Engram, con aproximadamente 11.3B parámetros activos por token. La modificación principal consiste en recuantizar los expertos enrutados de FP8 a NVFP4 (formato de 4 bits de NVIDIA) y convertir los pesos al formato FTW para su uso con el motor de inferencia Lowtide, desarrollado por el mismo autor.

El modelo resuelve un problema de eficiencia en el despliegue: reducir el espacio en disco y el ancho de banda de memoria necesario para servir un MoE de gran tamaño sin degradar excesivamente la calidad respecto al checkpoint FP8 original. El autor reporta divergencias KL de 0.0370 en prosa inglesa, 0.0190 en código y 0.0477 en prosa multilingüe, con acuerdos top-1 del 94.1%, 96.8% y 93.5% respectivamente frente al modelo de referencia FP8.

Es relevante ahora porque demuestra una ruta práctica de cuantización agresiva (4 bits) sobre un MoE de 220B orientada a motores de inferencia alternativos, aunque su adopción está condicionada al ecosistema Lowtide y a la licencia Tencent Hy, que impone términos comerciales adicionales para proveedores de modelo como servicio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con tablas Engram |
| Parametros totales | 220B (incluye 63.5B de Engram) |
| Parametros activos | ~11.3B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 en expertos enrutados (partiendo de FP8); formato FTW |
| Idiomas soportados | no disponible (la model card menciona evaluacion en prosa multilingue sin enumerar idiomas) |
| Licencia | Tencent Hy License, Version 1.0 (terminos comerciales adicionales en la Seccion 10) |
| Formato de pesos | FTW (formato del motor Lowtide); repo de 221.5 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos: de los 220B parámetros totales, 63.5B pertenecen a tablas Engram (memoria asociativa leída desde disco según la model card) y aproximadamente 11.3B se activan por token mediante el enrutamiento de expertos. Esta ficha no dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo original de Tencent.

La innovación de esta publicación es la recuantización de los expertos enrutados de FP8 a NVFP4, un formato de 4 bits con escala por bloque orientado a hardware NVIDIA, junto con la conversión al formato FTW que consume el motor Lowtide. La model card indica que las tablas Engram se leen desde disco, por lo que el autor recomienda almacenar el repositorio en una unidad NVMe rápida. También se menciona la opción `--mtp on` en el script de servicio, presumiblemente decodificación multi-token especulativa, aunque no se detalla su funcionamiento.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`).
- Razonamiento y generación de código: la evaluación de calidad incluye Python y C++ con un acuerdo top-1 del 96.8% frente al FP8.
- Capacidad multilingüe parcial: se evalúa prosa multilingüe, aunque no se enumeran los idiomas soportados.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.
- Visión: no soportada en esta versión (la model card indica explícitamente que el vision tower y el procesador de imagen no están incluidos).
- Audio: no disponible.

## Casos de uso

- Servicio de generación de texto a gran escala con requisitos de memoria ajustados: la cuantización NVFP4 reduce el peso de los expertos a 4 bits, lo que permite alojar un MoE de 220B en menos memoria que el checkpoint FP8, adecuado para despliegues donde el ancho de banda de memoria es el cuello de botella.
- Asistencia de código en pipelines internos: el acuerdo top-1 del 96.8% en Python y C++ frente al FP8 lo hace viable para autocompletado y generación de código donde se tolera una pequeña divergencia respecto al modelo de referencia.
- Procesamiento por lotes de documentación y prosa: con una divergencia KL de 0.0370 en inglés, puede emplearse en tareas de resumen, reescritura y clasificación de textos donde no se requiere paridad exacta con el modelo original.
- Experimentación en investigación sobre cuantización: sirve como referencia para estudiar el impacto de NVFP4 en modelos MoE de gran escala, comparando las métricas KLD y acuerdo top-1 publicadas.
- Despliegue en infraestructura con almacenamiento NVMe local: al leer las tablas Engram desde disco, encaja en servidores con discos rápidos donde el modelo reside en almacenamiento y no íntegramente en VRAM.
- Evaluación de motores de inferencia alternativos: permite probar el motor Lowtide y su formato FTW frente a stacks más establecidos (vLLM, TGI) en cargas de trabajo conversacionales.
- Traducción y generación multilingüe de baja criticidad: la divergencia KL de 0.0477 en prosa multilingüe es la más alta de las tres evaluadas, por lo que es aceptable en tareas donde se revisa la salida antes de publicarla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card solo incluye métricas de fidelidad respecto al checkpoint FP8 original:

| Dominio | KLD vs FP8 | Acuerdo top-1 con FP8 |
|---|---|---|
| Prosa en inglés | 0.0370 | 94.1% |
| Código (Python + C++) | 0.0190 | 96.8% |
| Prosa multilingüe | 0.0477 | 93.5% |

## Requisitos de hardware

- Tamaño del repositorio: 221.5 GB; el autor recomienda mantenerlo en una unidad NVMe rápida porque las tablas Engram se leen desde disco.
- VRAM estimada para inferencia: no disponible de forma explícita; dependerá de cuántos expertos y tablas Engram se carguen en memoria frente a disco en el motor Lowtide.
- GPU recomendadas: no disponible; NVFP4 es un formato orientado a hardware NVIDIA, por lo que se presupone compatibilidad con GPUs NVIDIA recientes, pero la model card no especifica modelos concretos.
- Cabe en GPU de consumo: no disponible; el tamaño de 221.5 GB descarta en principio un único dispositivo de consumo, pero no hay confirmación en la información proporcionada.
- Opciones de despliegue: exclusivamente el motor Lowtide (https://github.com/grumd/lowtide), mediante `scripts/serve.sh --mtp on`. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Hy4-flash-NVFP4-Lowtide | 220B | ~11.3B | no disponible | NVFP4 (expertos) | Tencent Hy License 1.0 | Hugging Face (grumd0) |
| tencent/Hy4-flash-FP8 (base) | 220B | ~11.3B | no disponible | FP8 | Tencent Hy License 1.0 | Hugging Face (Tencent) |
| tencent/Hy4-flash (original) | 220B | ~11.3B | no disponible | BF16/FP16 (presumible) | Tencent Hy License 1.0 | Hugging Face (Tencent) |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Solo texto: el vision tower y la configuración del procesador de imagen no están incluidos, por lo que no puede procesar imágenes.
- Degradación de calidad respecto al FP8: el acuerdo top-1 es del 94.1% en inglés y del 93.5% en multilingüe, lo que implica que aproximadamente 1 de cada 16 tokens generados difiere del modelo de referencia en esos dominios.
- Mayor divergencia en multilingüe (KLD 0.0477) que en código (0.0190): conviene validar las salidas en idiomas distintos del inglés antes de usarlas en producción.
- Dependencia de un motor no estándar: requiere el motor Lowtide y el formato FTW; no es directamente compatible con vLLM, llama.cpp, Ollama o TGI según la información disponible.
- Requisito de almacenamiento NVMe rápido: las tablas Engram se leen desde disco, lo que puede introducir latencia dependiente del almacenamiento.
- Licencia restrictiva: la Tencent Hy License 1.0 incluye términos comerciales adicionales para grandes proveedores de modelo como servicio (Sección 10); es imprescindible revisar el archivo LICENSE y el NOTICE (que lista los cambios respecto al original) antes de un uso comercial.
- Riesgo de alucinación: no se han publicado evaluaciones específicas de veracidad o sesgos en la información disponible.
- Sesgos conocidos: no disponibles.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/grumd0/Hy4-flash-NVFP4-Lowtide
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Modelo base FP8: https://huggingface.co/tencent/Hy4-flash-FP8
- Motor Lowtide: https://github.com/grumd/lowtide
- Licencia: archivo LICENSE en el repositorio del modelo
