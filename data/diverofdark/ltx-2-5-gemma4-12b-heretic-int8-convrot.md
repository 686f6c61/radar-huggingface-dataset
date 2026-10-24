# diverofdark/LTX-2.5-Gemma4-12B-heretic-int8-convrot

## Resumen

Este repositorio no contiene un modelo conversacional, sino un **text encoder** para el pipeline de generación de vídeo LTX-2.5 de Lightricks. En concreto, es un reemplazo directo del fichero `text_encoders/gemma4-12b-with-proj-ltx-2.5-comfy-int8-convrot.safetensors` distribuido en `Lightricks/LTX-2.5`, con el mismo layout, el mismo formato de cuantización `comfy_quant` y, por tanto, el mismo loader de ComfyUI. El autor es `diverofdark` y el componente codifica los prompts de texto que consume el DiT de LTX-2.5.

La particularidad es que incorpora una **abliteración de la dirección de rechazo** (eliminación de la dirección de activación asociada a negativas) tomada de `igorls/gemma-4-12B-it-heretic-v1`, generada con la herramienta Heretic. A diferencia de otras versiones "uncensored" publicadas antes, esta parte del fine-tune real de Lightricks (`gemma_version: gemma4-12b-ltx-v1`) y no de `google/gemma-4-12B-it` en crudo: los tensores de las capas 0-10 coinciden con el modelo original de Google, pero a partir de la capa ~11 difieren entre un 1 % y un 11 % en norma relativa (11 % en `q_proj` de L12, 1,2 % en `up_proj` de L47).

El resultado es un encoder de 12B parámetros en int8 ConvRot (repo de 15,4 GB) que conserva el ajuste fino específico de LTX-2.5 y, a la vez, elimina la dirección de rechazo en 22 tensores. Es relevante para quien necesite prompts sin filtrado en el encoder dentro de flujos de ComfyUI, y para investigación sobre hasta qué punto la abliteración de un text encoder afecta a la calidad del vídeo generado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Gemma 4 12B, fine-tune de Lightricks `gemma4-12b-ltx-v1`) con proyección para LTX-2.5 acoplada |
| Parametros totales | 12 000 millones (12B, según la denominación del modelo); 1342 tensores en el checkpoint |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 ConvRot (rotación Hadamard fp32 de anchura 256, absmax por fila /127, redondeo); no se documentan otras variantes en el repo |
| Idiomas soportados | no disponible |
| Licencia | LTX-2.x Community License Agreement (secciones 4 y Attachment A íntegras); pesos Gemma 4 © Google bajo Apache-2.0 |
| Formato de pesos | safetensors (`gemma4-12b-with-proj-ltx-2.5-comfy-int8-convrot.safetensors`), cuantización en formato `comfy_quant` |

Datos adicionales: tamaño del repo 15,4 GB, 0 descargas y 0 likes en el momento de la ficha, creado el 2026-10-23, `pipeline_tag` no disponible.

## Arquitectura y entrenamiento

El componente es un decoder transformer Gemma 4 de 12B parámetros con una proyección específica de LTX-2.5, distribuido en un único safetensors int8. No se ha entrenado desde cero: se construye por composición de tres fuentes fijadas. La base es el encoder bf16 oficial `Lightricks/LTX-2.5@49b093a`; sobre él se injertan las 22 diferencias rank-1 que separan `igorls/gemma-4-12B-it-heretic-v1@192d14f` de `google/gemma-4-12B-it@707f0a3`, y el conjunto se recuantiza a int8 ConvRot.

Esas 22 diferencias corresponden a `mlp.down_proj` en las capas 22-34 y `self_attn.o_proj` en las capas 29-37, y cada una es de rango 1 (concentra el 98-99 % de su energía). La receta de cuantización (rotación Hadamard fp32 de 256 elementos, absmax por fila dividido entre 127 y redondeo) reproduce exactamente el fichero int8 de Lightricks: el 100 % de los valores int8 coincide en las capas verificadas y las escalas presentan una desviación de 1,9e-7. La norma de salida de la dirección de rechazo mantiene en los pesos de LTX la misma proporción que Heretic dejó en el modelo original: 29 % / 45 % / 43 % en L22 `down_proj`, L30 `o_proj` y L37 `o_proj`, frente a 29 % / 44 % / 43 % en stock. Los otros 1298 tensores de los 1342 son idénticos byte a byte al fichero int8 oficial. El script `build.py` permite reconstruir el fichero desde las tres fuentes fijadas y la clave `__metadata__.modified` del safetensors registra la modificación.

## Capacidades

- Codificación de prompts de texto a embeddings para el DiT de LTX-2.5, con la proyección `gemma4-12b-with-proj-ltx-2.5` incluida en el mismo fichero.
- Sustitución directa (drop-in) del text encoder oficial int8 en flujos de ComfyUI, sin cambios de loader ni de layout.
- Abliteración de la dirección de rechazo: 0/100 rechazos en el modelo heretic de origen, con divergencia KL de 0,028 respecto a `google/gemma-4-12B-it`.
- Conservación del ajuste fino de Lightricks en las capas 11-47, a diferencia de los encoders "uncensored" previos basados en Gemma stock.
- Reconstrucción reproducible del artefacto mediante `build.py` a partir de las tres fuentes fijadas por commit.
- Generación de texto autónoma, tool calling, function calling, razonamiento multi-paso, modo thinking, visión o audio: no disponibles como capacidades de este artefacto (es un encoder, no un modelo de chat servible).

## Casos de uso

- **Sustitución del encoder en un workflow de ComfyUI para LTX-2.5**: se coloca el fichero en `text_encoders/` con el nombre que espera el nodo y se mantiene el resto del grafo intacto; es adecuado porque comparte layout, formato `comfy_quant` y loader con el oficial.
- **Generación de vídeo con prompts que el encoder original filtraría**: al haberse eliminado la dirección de rechazo en 22 tensores, el encoder no arrastra el sesgo de negativa hacia ese tipo de condicionamiento; útil en investigación sobre censura en modelos de difusión de vídeo.
- **Ahorro de VRAM frente al encoder en bf16**: con 15,4 GB de repo en int8 ConvRot frente a los ~24 GB que ocuparían 12B en bf16, permite mantener el encoder cargado junto al DiT en GPUs de 24 GB.
- **Estudio del impacto del fine-tune de Lightricks**: al estar documentadas las diferencias por capa entre Gemma stock y `gemma4-12b-ltx-v1` (1-11 % de norma relativa desde la capa 11), sirve para comparar la calidad de vídeo entre un encoder con el fine-tune y uno basado en Gemma stock.
- **Reproducibilidad de artefactos cuantizados**: `build.py` reconstruye el fichero desde las tres fuentes fijadas y verifica la coincidencia con el int8 de Lightricks, lo que permite auditar la receta de cuantización en un pipeline de validación.
- **Investigación sobre abliteración en encoders multimodales**: permite medir si la eliminación de la dirección de rechazo (0/100 rechazos, KL 0,028) degrada la fidelidad semántica del condicionamiento y, por extensión, la coherencia temporal del vídeo.
- **Base para fine-tuning posterior del encoder**: los 1298 tensores idénticos al oficial y las 22 modificaciones documentadas facilitan aislar qué parte del comportamiento proviene del fine-tune y qué parte de la abliteración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K ni métricas de calidad de vídeo). Las únicas métricas verificables del repositorio son las de construcción y abliteración:

| Metrica | Valor |
|---|---|
| Rechazos en el modelo heretic de origen | 0/100 |
| Divergencia KL frente a `google/gemma-4-12B-it` | 0,028 |
| Tensores idénticos al int8 oficial de Lightricks | 1298 de 1342 |
| Tensores modificados | 22 pesos + 22 escalas |
| Coincidencia de valores int8 en capas verificadas | 100 % |
| Desviación de escalas de cuantización | 1,9e-7 |
| Norma de salida de la dirección de rechazo (L22 / L30 / L37) | 29 % / 45 % / 43 % (stock: 29 % / 44 % / 43 %) |

## Requisitos de hardware

- VRAM estimada para inferencia: a partir del tamaño del repo (15,4 GB en int8 ConvRot), un mínimo práctico de 16 GB de VRAM; 24 GB deja margen para el DiT de LTX-2.5 y el resto del grafo.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para uso en consumer; A100 40/80 GB y H100 para despliegues con el pipeline completo de LTX-2.5.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB; en tarjetas de 16 GB el encoder entra solo, pero condiciona la carga simultánea del DiT.
- Opciones de despliegue: loader nativo de ComfyUI (formato `comfy_quant`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al ser un text encoder con proyección acoplada no es un artefacto servible como modelo de chat.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| `diverofdark/LTX-2.5-Gemma4-12B-heretic-int8-convrot` | 12B | no disponible | int8 ConvRot | LTX-2.x Community License + Apache-2.0 (Gemma) | Fine-tune de Lightricks + abliteración en 22 tensores |
| `Lightricks/LTX-2.5` (encoder oficial int8 ConvRot) | 12B | no disponible | int8 ConvRot | LTX-2.x Community License | Referencia oficial; sin abliterar; 1298 tensores idénticos a este |
| `igorls/gemma-4-12B-it-heretic-v1` | 12B | no disponible | no disponible | Apache-2.0 (Gemma) | 0/100 rechazos, KL 0,028; sin proyección LTX ni fine-tune de Lightricks |
| `google/gemma-4-12B-it` | 12B | no disponible | no disponible | Apache-2.0 | Modelo stock; difiere del encoder de LTX en 1-11 % de norma relativa desde la capa 11 |
| Encoders "uncensored LTX-2.5" previos (no identificados en la información) | 12B | no disponible | no disponible | no disponible | Según el autor, son Gemma stock con la proyección de LTX, algunos con la proyección anterior al 2026-08-17 |

## Limitaciones y advertencias

- **Licencia restrictiva**: el componente es una versión modificada de LTX-2.x y queda sujeto al LTX-2.x Community License Agreement, incluidas la sección 4 y el Attachment A íntegros, con todas sus restricciones de uso y políticas de uso aceptable. Uso comercial sujeto a dichos términos; los pesos Gemma subyacentes son Apache-2.0.
- **No es un modelo de chat**: no debe evaluarse con benchmarks de lenguaje ni desplegarse como asistente; su función es producir condicionamiento para el DiT de LTX-2.5.
- **Riesgo de degradación semántica por la abliteración**: la modificación afecta a 22 tensores de rango 1 en `down_proj` (capas 22-34) y `o_proj` (capas 29-37); aunque el KL de origen es bajo (0,028), no hay mediciones publicadas del efecto sobre la calidad del vídeo generado.
- **Sin validación de la comunidad**: 0 descargas y 0 likes; no existen informes independientes de funcionamiento en producción.
- **Riesgo de alucinación y de contenido**: la eliminación de la dirección de rechazo reduce el filtrado en el encoder, pero no elimina los sesgos de los datos de entrenamiento de Gemma ni sustituye los filtros del pipeline; la salida puede resultar inapropiada en aplicaciones sin moderación adicional.
- **Dependencia de la versión de la proyección**: el autor advierte de que algunos encoders previos usan la proyección anterior al 2026-08-17; un desajuste con la versión esperada por el DiT rompería la generación.
- **Idiomas y contexto sin documentar**: no se especifican lenguajes soportados ni longitud de contexto, lo que impide garantizar el comportamiento en prompts largos o no ingleses.
- **Cuantización int8**: la receta ConvRot introduce un error de redondeo (escalas con desviación de 1,9e-7 frente al fichero oficial), aceptable pero no nulo; para máxima fidelidad habría que usar el encoder bf16.

## Enlaces

- [HuggingFace: diverofdark/LTX-2.5-Gemma4-12B-heretic-int8-convrot](https://huggingface.co/diverofdark/LTX-2.5-Gemma4-12B-heretic-int8-convrot)
- [Modelo base: Lightricks/LTX-2.5](https://huggingface.co/Lightricks/LTX-2.5)
- [Modelo base de la abliteración: igorls/gemma-4-12B-it-heretic-v1](https://huggingface.co/igorls/gemma-4-12B-it-heretic-v1)
- [Heretic (herramienta de abliteración)](https://github.com/p-e-w/heretic)
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo.
