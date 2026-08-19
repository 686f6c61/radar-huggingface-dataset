# ansulev/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP

## Resumen

El modelo **Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP** es un fine-tune de la serie Qwen3.5 de 9 000 millones de parámetros, desarrollado por **ansulev** en colaboración con **Nightmedia** y con la participación de **DavidAU** para los pesos GGUF. Se trata de un modelo de propósito general orientado a usos creativos, de razonamiento y de código, con un énfasis particular en la **eliminación de censura** mediante técnicas de *abliteration* y en la mejora de la capacidad de seguir instrucciones. El autor afirma que supera varios benchmarks de modelos significativamente más grandes, como Qwen3.5-27B o Qwen3.6-35B-A3B, en tareas de razonamiento de sentido común.

El modelo soporta **contexto de 256 000 tokens**, **visión** (mediante un archivo *mmproj* adicional) y **modo de pensamiento** (*thinking*). Incluye además pesos en formato **GGUF con cuantización NEO IMATRIX** y una variante especial **MTP** (*multi-token prediction*) que acelera la generación al predecir varios tokens por paso. Está disponible bajo licencia **Apache 2.0**, lo que permite uso comercial sin restricciones de atribución. Su relevancia actual radica en ofrecer un rendimiento alto en un paquete compacto, con opciones de cuantización optimizadas para hardware de consumo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en Qwen3.5-9B (arquitectura no detallada en la información disponible; se asume transformer denso por la serie Qwen) |
| Parametros totales | 9 653 104 368 (9,65 B) |
| Parametros activos | No disponible (no se indica si es MoE) |
| Longitud de contexto | 256 000 tokens |
| Tipos de cuantizacion | bf16 (safetensors), GGUF NEO IMATRIX regular y MTP (incluye Q4_K_S, 8-bit, 4-bit; el tensor de salida se mantiene en 16-bit en todos los quants) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), GGUF (regular y MTP) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base, pero por la denominación "Qwen3.5" se trata de un transformer denso con atención estándar y mecanismo de *thinking* integrado. El proceso de entrenamiento de este fine-tune se describe como **multi-etapa y multi-modelo**, combinando varios fine-tunes previos de Qwen3.5-9B realizados por el autor, seguidos de una fusión (*merge*) y de un proceso de *abliteration* para eliminar los mecanismos de rechazo de contenido. No se especifican el número de tokens de entrenamiento ni la composición del dataset.

La innovación principal reside en los pesos GGUF: se aplica **cuantización NEO IMATRIX** (que según el autor mejora la precisión de los quants entre un 2 % y un 4 %) y se mantiene el tensor de salida en precisión 16-bit. La variante **MTP** añade un módulo de predicción multi-token que permite generar dos tokens por paso, con los tensores MTP cuantizados a Q8_0. El modelo también incluye soporte de visión, aunque requiere un archivo *mmproj* externo para activarlo.

## Capacidades

- Generación de texto libre, con especial énfasis en escritura creativa, ficción y *roleplaying*.
- Razonamiento y modo de pensamiento (*thinking*), con bloque de razonamiento compactado y reforzado respecto al modelo base.
- Generación de código, con parámetros sugeridos específicos para tareas de desarrollo web.
- Capacidad de visión (procesamiento de imágenes) mediante el archivo *mmproj* adicional.
- Aceleración por predicción multi-token (MTP) en los GGUFs correspondientes, con mejora de velocidad de hasta ~40 % en hardware compatible.
- Sin censura: el modelo ha sido sometido a *abliteration* para eliminar rechazos de contenido, lo que permite respuestas directas a instrucciones que otros modelos bloquearían.
- Multilingüe limitado: declarado para inglés y chino.

## Casos de uso

- **Escritura creativa y ficción**: el modelo puede generar relatos, diálogos y descripciones con un estilo fluido y sin restricciones temáticas, gracias a su entrenamiento sin censura y su capacidad de mantener coherencia en contextos largos (256k). Adecuado para autores que necesiten explorar tramas complejas o contenido adulto.
- **Roleplaying y juegos de texto**: su capacidad de seguir instrucciones y de mantener personajes consistentes en conversaciones multi-turno lo hace útil para plataformas de rol textual o asistentes narrativos.
- **Generación de código en entornos de desarrollo**: con los parámetros recomendados (temperatura 0.6), puede asistir en tareas de programación, refactorización o generación de scripts, integrándose en flujos de trabajo locales mediante GGUF.
- **Análisis de imágenes con descripción**: al activar la visión con el archivo *mmproj*, puede procesar capturas o diagramas y generar explicaciones textuales, útil para documentación técnica o accesibilidad.
- **Prototipado de asistentes conversacionales sin filtros**: para entornos de investigación donde se requiera explorar respuestas sin restricciones de seguridad, como estudios de sesgos o generación de lenguaje natural en dominios sensibles.
- **Evaluación de modelos cuantizados**: gracias a la disponibilidad de múltiples quants (regular y MTP), sirve como banco de pruebas para medir el impacto de la cuantización en tareas de razonamiento y creatividad en GPUs de consumo.

## Benchmarks y rendimiento

El autor publica resultados en siete benchmarks de razonamiento de sentido común, comparando el modelo en tres precisiones (bf16, mxfp8, mxfp4) con varios modelos base de Qwen. Los datos son los siguientes:

| Modelo | ARC-c | ARC-e | BoolQ | HellaSwag | OBQA | PIQA | WinoGrande |
|---|---|---|---|---|---|---|---|
| Qwen3.5-9B-The-Defiant-Fable (bf16) | 0,649 | 0,832 | 0,895 | 0,713 | 0,482 | 0,783 | 0,699 |
| Qwen3.5-9B-The-Defiant-Fable (mxfp8) | 0,647 | 0,836 | 0,895 | 0,706 | 0,460 | 0,784 | 0,695 |
| Qwen3.5-9B-The-Defiant-Fable (mxfp4) | 0,640 | 0,824 | 0,886 | 0,703 | 0,468 | 0,780 | 0,691 |
| Qwen3.5-9B-Instruct (mxfp8) | 0,571 | 0,719 | 0,895 | 0,683 | 0,426 | 0,770 | 0,671 |
| Qwen3.6-27B-Instruct (mxfp8) | 0,647 | 0,803 | 0,910 | 0,773 | 0,450 | 0,806 | 0,742 |
| Qwen3.6-35B-A3B-Instruct (mxfp8) | 0,581 | 0,757 | 0,892 | 0,751 | 0,428 | 0,803 | 0,688 |
| Qwen3.5-27B-Instruct (mxfp8) | 0,557 | 0,711 | 0,868 | 0,533 | 0,452 | 0,706 | 0,695 |

Nota: el autor indica que las pruebas se realizaron en modo *instruct* y que en modo *thinking* las puntuaciones pueden ser aún más altas. Se observa que el modelo supera a Qwen3.5-27B en todos los benchmarks y a Qwen3.6-27B en varios (ARC-c, ARC-e, OBQA), aunque pierde en HellaSwag, PIQA y WinoGrande.

## Requisitos de hardware

- **VRAM estimada** (basada en el tamaño de parámetros y cuantización):
  - bf16 (safetensors): ~19,3 GB (coincide con el tamaño del repo).
  - 8-bit (GGUF): ~10-11 GB.
  - 4-bit (GGUF, p. ej. Q4_K_S): ~5-6 GB.
- **GPU recomendada**: el autor reporta pruebas en una **RTX 5090** (Windows 11, LM Studio), donde alcanza ~130 t/s con quants regulares Q4_K_S y ~185 t/s con quants MTP (con tasa de aceptación del 60 %). Cualquier GPU con 8 GB o más de VRAM puede ejecutar la versión 4-bit; para 8-bit se recomienda 12 GB o más.
- **Opciones de despliegue**: al estar disponibles pesos en safetensors y GGUF, puede ejecutarse con **vLLM**, **llama.cpp**, **Ollama**, **LM Studio**, **Text Generation Inference (TGI)** u otros motores compatibles con transformers.
- **Latencia y throughput**: los valores reportados (130-185 t/s) son específicos de RTX 5090 con Q4_K_S; en GPUs más modestas (p. ej. RTX 3060 o 4060) se espera una reducción proporcional. La variante MTP solo es beneficiosa si la tasa de aceptación de tokens supera el 50 %; en caso contrario, los quants regulares son más rápidos.

## Comparativa con modelos similares

La comparativa se basa exclusivamente en los benchmarks publicados, ya que no se dispone de especificaciones completas (parámetros, contexto, licencia) de los modelos base mencionados. Se incluyen los datos disponibles:

| Modelo | Parámetros | Contexto | Licencia | ARC-c | ARC-e | BoolQ | HellaSwag | OBQA | PIQA | WinoGrande |
|---|---|---|---|---|---|---|---|---|---|---|
| Qwen3.5-9B-The-Defiant-Fable (mxfp8) | 9,65 B | 256k | Apache 2.0 | 0,647 | 0,836 | 0,895 | 0,706 | 0,460 | 0,784 | 0,695 |
| Qwen3.5-9B-Instruct (mxfp8) | no disponible | no disponible | no disponible | 0,571 | 0,719 | 0,895 | 0,683 | 0,426 | 0,770 | 0,671 |
| Qwen3.6-27B-Instruct (mxfp8) | no disponible | no disponible | no disponible | 0,647 | 0,803 | 0,910 | 0,773 | 0,450 | 0,806 | 0,742 |
| Qwen3.6-35B-A3B-Instruct (mxfp8) | no disponible | no disponible | no disponible | 0,581 | 0,757 | 0,892 | 0,751 | 0,428 | 0,803 | 0,688 |
| Qwen3.5-27B-Instruct (mxfp8) | no disponible | no disponible | no disponible | 0,557 | 0,711 | 0,868 | 0,533 | 0,452 | 0,706 | 0,695 |

El modelo de 9B supera a Qwen3.5-27B en todos los benchmarks y a Qwen3.6-27B en ARC-c, ARC-e y OBQA, aunque queda por detrás en HellaSwag, PIQA y WinoGrande. Frente a Qwen3.6-35B-A3B, gana en ARC-c, ARC-e y OBQA, pero pierde en HellaSwag, PIQA y WinoGrande. La ventaja principal es su menor tamaño y la disponibilidad de cuantizaciones optimizadas para hardware de consumo.

## Limitaciones y advertencias

- **Contenido sin censura**: al ser un modelo *abliterated*, puede generar contenido ofensivo, ilegal o éticamente cuestionable sin filtros. Su uso en producción requiere medidas de moderación externas y evaluación de riesgos legales.
- **Idiomas limitados**: la model card declara únicamente inglés y chino; no se garantiza un rendimiento adecuado en otros idiomas, a pesar de que el modelo base Qwen3.5 pueda soportar más.
- **Riesgo de alucinación**: como cualquier modelo generativo, puede inventar hechos, citas o referencias, especialmente en tareas de razonamiento complejo o con contexto largo.
- **Contexto de 256k**: aunque se declara esta longitud, el rendimiento puede degradarse en ventanas muy largas; el autor sugiere un mínimo de 8k a 16k para tareas típicas.
- **Rendimiento MTP condicionado**: los GGUFs MTP solo ofrecen ventaja si la tasa de aceptación de tokens supera el 50 %; con temperaturas superiores a 1.0 o *repetition penalty* distinto de 1, el rendimiento se degrada y es preferible usar quants regulares.
- **Sin garantías de seguridad**: el modelo no ha sido alineado para rechazar instrucciones dañinas; cualquier despliegue en aplicaciones orientadas al público general debe incluir capas de filtrado adicionales.
- **Licencia Apache 2.0**: permite uso comercial y modificación, pero el autor no ofrece garantías sobre la idoneidad del modelo para casos de uso específicos ni sobre la ausencia de sesgos.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/ansulev/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP
- Repositorio de GGUFs (regular y MTP): https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
- Variante DARK ROAST (máxima de-censura): https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-DARK-ROAST-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP
- Modelo de 27B relacionado: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
