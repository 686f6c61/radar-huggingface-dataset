# Lin-Wang-NUS/IHDM

## Resumen

IHDM (Inverse Heat Dissipation Model) es una colección de priors generativos basados en difusión inversa del calor, desarrollada por Lin-Wang-NUS y publicada con licencia Apache 2.0. El modelo resuelve problemas inversos lineales en imagen —deblurring, superresolución y reconstrucción de resonancia magnética— mediante una técnica denominada Temporal-Matched Data Consistency (TMDC). No es un modelo de lenguaje ni un asistente conversacional: es un conjunto de pesos de difusión que actúan como prior de imagen para guiar la reconstrucción.

El repositorio contiene cinco subcarpetas, una por conjunto de entrenamiento: FFHQ a 256 px, LSUN Church a 256 px, AFHQ cat a 256 px, ImageNet-100 a 128 px y fastMRI knee a 320 px (en dos variantes, ~50M y ~100M parámetros). Los pesos se distribuyen en formato `.pth` (PyTorch) y el repo ocupa 13,5 GB. La propuesta técnica es un proceso de difusión basado en la ecuación del calor, con un emparejamiento temporal explícito entre el prior y el operador de degradación del problema inverso.

La relevancia actual reside en que plantea una alternativa a los priors de difusión convencionales (ADM) para reconstrucción de imágenes médicas y de visión por computador, con baselines ADM entrenados sobre los mismos datos y publicados en un repo hermano para comparación directa. La información disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada: la model card solo describe los ficheros y el uso básico de descarga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | difusión (inverse heat dissipation model); detalles internos no disponibles |
| Parametros totales | ~100M y ~50M en las variantes fastMRI knee 320; no disponible para el resto |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de imagen) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pth`) |

## Arquitectura y entrenamiento

La model card describe IHDM como un "Inverse heat dissipation model", es decir, un proceso de difusión formulado a partir de la ecuación del calor inversa. El uso previsto es como prior para problemas inversos lineales, combinado con Temporal-Matched Data Consistency (TMDC), una técnica que alinea temporalmente el paso de difusión con el operador de degradación (desenfoque, submuestreo o adquisición de MRI). No se detalla en la información disponible la arquitectura de red concreta (U-Net, transformer, etc.), el número de tokens de entrenamiento ni si se emplearon técnicas de RLHF o DPO.

Los datos de entrenamiento sí están indicados por subcarpeta: FFHQ, LSUN Church y AFHQ cat a 256 px; ImageNet-100 a 128 px; y fastMRI knee (magnitud) a 320 px. Para esta última se publican dos tamaños (~50M y ~100M parámetros). El autor ofrece baselines ADM ("hot diffusion") entrenados sobre los mismos datos en el repo `Lin-Wang-NUS/ADM`, lo que permite comparar el prior propuesto con uno convencional bajo condiciones controladas.

## Capacidades

- Reconstrucción de problemas inversos lineales de imagen: deblurring, superresolución y MRI.
- Actúa como prior generativo en un esquema de difusión guiado por consistencia de datos (TMDC).
- Soporte para varias resoluciones y dominios: 128 px (ImageNet-100), 256 px (FFHQ, LSUN Church, AFHQ cat) y 320 px (fastMRI knee).
- Dos tamaños de modelo en el dominio médico (~50M y ~100M parámetros).
- No soporta generación de texto, tool calling, agentes ni capacidades multilingües.
- No se documentan capacidades de visión de alto nivel (VQA, captioning, detección); el modelo es exclusivamente un prior de reconstrucción.

## Casos de uso

- Reconstrucción acelerada de MRI de rodilla: usar `fastmri_knee320_100m.pth` o `fastmri_knee320_50m.pth` como prior en un pipeline TMDC para recuperar imágenes de magnitud a 320 px a partir de muestreos submuestreados del espacio k.
- Superresolución de retratos: emplear `ihdm_ffhq256.pth` para reconstruir caras a 256 px desde observaciones de baja resolución, aprovechando el prior aprendido sobre FFHQ.
- Deblurring en imágenes de iglesias y escenas arquitectónicas: usar `ihdm_church256.pth` como prior para eliminar desenfoque en imágenes de LSUN Church a 256 px.
- Reconstrucción en el dominio animal: `afhq_cat256_50m.pth` para tareas de superresolución o deblurring sobre imágenes de gatos de AFHQ.
- Experimentación con problemas inversos a baja resolución: `imagenet100_128.pth` para validar pipelines de reconstrucción a 128 px sobre clases de ImageNet-100 antes de escalar a resoluciones mayores.
- Comparación metodológica: usar los pesos IHDM junto con los baselines ADM del repo `Lin-Wang-NUS/ADM` para evaluar la ganancia de TMDC frente a difusión convencional en un mismo conjunto de datos.
- Investigación en priors físicos: estudiar la formulación de difusión basada en la ecuación del calor como alternativa a los priors de difusión estándar en problemas inversos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Como referencia orientativa, un modelo de ~100M parámetros en precisión completa ocupa del orden de 0,4 GB en pesos, pero el consumo real de memoria durante la inferencia de difusión depende del número de pasos, del tamaño de lote y de la resolución (128, 256 o 320 px), datos no publicados.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; por el tamaño de los pesos (~50M–100M parámetros), es plausible que quepa en GPU de consumo, pero no hay datos oficiales que lo verifiquen.
- Opciones de despliegue: los pesos son ficheros `.pth` de PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje y no aplicables a este caso).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IHDM (este modelo) | ~50M–100M en fastMRI; no disponible en el resto | no aplica | no disponible | Apache 2.0 | HuggingFace (`Lin-Wang-NUS/IHDM`) |
| ADM baseline (`Lin-Wang-NUS/ADM`) | no disponible | no aplica | no disponible | no disponible en la información | HuggingFace (`Lin-Wang-NUS/ADM`) |
| Otros priors de difusión para problemas inversos | no disponible | no aplica | no disponible | no disponible | no disponible |

La única comparación documentada es con los baselines ADM del mismo autor, entrenados sobre los mismos conjuntos de datos. No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas externas.

## Limitaciones y advertencias

- La información pública es mínima: la model card solo enumera ficheros y un ejemplo de descarga; no hay detalles de arquitectura, entrenamiento ni evaluación.
- Modelo especializado en problemas inversos de imagen; no es un modelo de lenguaje ni un asistente general.
- Los priors están ligados al dominio y resolución de sus datos de entrenamiento (FFHQ, LSUN Church, AFHQ cat, ImageNet-100, fastMRI knee); su uso fuera de esos dominios no está validado.
- No se documentan sesgos, pero al entrenar sobre FFHQ y AFHQ es esperable que hereden los sesgos de composición demográfica y de especie de esos datasets.
- Riesgo de alucinación: como todo prior generativo, puede reconstruir detalles plausibles pero no presentes en la observación; en imagen médica esto es especialmente crítico y requiere validación clínica.
- No se especifican restricciones adicionales de uso comercial más allá de la licencia Apache 2.0.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación independiente.
- No se documentan requisitos de hardware ni tiempos de inferencia, lo que dificulta planificar un despliegue.

## Enlaces

- HuggingFace: https://huggingface.co/Lin-Wang-NUS/IHDM
- Baselines ADM: https://huggingface.co/Lin-Wang-NUS/ADM
