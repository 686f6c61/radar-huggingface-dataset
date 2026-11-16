# elix3r/gemma4-12b-with-proj-ltx-2.5-GGUF

## Resumen

`elix3r/gemma4-12b-with-proj-ltx-2.5-GGUF` es una conversión a formato GGUF del text encoder Gemma 4 de 12B que forma parte del pipeline del modelo de vídeo Lightricks/LTX-2.5, publicada por el usuario elix3r. No se trata de un modelo generativo autónomo, sino de un componente de extracción de características (`feature-extraction`) pensado para ejecutarse dentro de ComfyUI como parte del flujo de trabajo de LTX-2.5. El repositorio incluye el proyector (`proj`) asociado, necesario para alinear las representaciones del encoder con el espacio latente del modelo de difusión de vídeo.

El modelo base declarado es Lightricks/LTX-2.5, y la licencia resultante combina la LTX-2 Community License con Apache 2.0, lo que impone restricciones específicas al uso comercial. El repositorio está sujeto a acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargarlo.

Con 13.147.985.090 parámetros reales en safetensors y un tamaño de repositorio de 40,6 GB, el interés práctico de esta ficha es distinto al de un LLM convencional: sirve para evaluar si merece la pena desplegar esta cuantización del text encoder en lugar del peso original en precisión completa, en términos de VRAM, calidad de condicionamiento y compatibilidad con ComfyUI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (text encoder Gemma 4 con proyector de alineación para LTX-2.5); detalles de capas y atención no disponibles |
| Parametros totales | 13.147.985.090 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q2-k, q4-k-m, q5-k-m (variantes GGUF incluidas en el repo) |
| Idiomas soportados | no disponible |
| Licencia | ltx-2-community-license-and-apache-2.0 |
| Formato de pesos | GGUF (repo de 40,6 GB; el dato de parámetros totales proviene de safetensors) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del encoder: se sabe que es un transformer Gemma 4 de 12B (denominación comercial) con 13.147.985.090 parámetros reales y que se acompaña de un módulo de proyección (`proj`) que adapta sus embeddings al espacio de condicionamiento de LTX-2.5. El pipeline declarado es `feature-extraction`, lo que confirma que su función es producir representaciones, no tokens de texto.

No se han publicado en la información proporcionada datos sobre volumen de entrenamiento, composición del dataset, técnicas de alineación (RLHF/DPO) ni innovaciones técnicas específicas del encoder. Tampoco se documenta si la conversión GGUF preserva exactamente el comportamiento del proyector en todas las cuantizaciones o si alguna de ellas degrada la calidad del condicionamiento.

## Capacidades

- Extracción de características de texto para condicionar el modelo de vídeo LTX-2.5.
- Integración nativa con ComfyUI mediante la librería declarada (`comfyui`).
- Inclusión del proyector (`proj`) necesario para alinear embeddings con el espacio latente de LTX-2.5.
- Distribución en tres niveles de cuantización (q2-k, q4-k-m, q5-k-m) para ajustar VRAM y calidad.
- No se documentan capacidades de generación de texto libre, tool calling, agentes, visión, audio ni modo de razonamiento extendido; el pipeline declarado es exclusivamente de extracción de características.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Generación de vídeo en ComfyUI con LTX-2.5 en GPUs de gama alta de consumo: usar la variante q4-k-m o q5-k-m del encoder reduce la VRAM ocupada por el text encoder y libera memoria para el modelo de difusión y los latentes de vídeo.
- Flujos de trabajo con VRAM muy ajustada: la variante q2-k permite cargar el encoder en configuraciones donde el peso en precisión completa no cabría, a costa de una posible pérdida de fidelidad en el condicionamiento.
- Prototipado rápido de prompts de vídeo: al ser un componente de feature-extraction, permite iterar sobre descripciones textuales y comprobar su efecto en la generación sin cambiar el resto del pipeline.
- Despliegue local reproducible: al estar en GGUF, se integra en el ecosistema de ComfyUI y en cargadores compatibles con este formato, facilitando entornos offline.
- Evaluación comparativa de cuantizaciones: el repo ofrece tres niveles, lo que permite medir empíricamente la degradación de calidad del vídeo generado al bajar de q5-k-m a q2-k.
- Investigación sobre condicionamiento textual en modelos de vídeo: sirve para estudiar cómo las representaciones del encoder afectan a la coherencia temporal y al seguimiento de prompts en LTX-2.5.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa basada en el número de parámetros y el tamaño del repo (40,6 GB para el conjunto de variantes), la variante q5-k-m se situaría en el entorno de 9-10 GB, la q4-k-m en torno a 7-8 GB y la q2-k cerca de 4-5 GB; estas cifras son estimaciones, no datos publicados.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, las variantes cuantizadas podrían caber en GPUs de consumo con 8-16 GB de VRAM, pero debe sumarse la memoria del modelo de difusión de vídeo de LTX-2.5, que no se documenta aquí.
- Cabe en GPU de consumo: probablemente sí para el encoder aislado en q4-k-m/q5-k-m; el pipeline completo de vídeo requiere evaluar conjuntamente el resto de componentes.
- Opciones de despliegue: ComfyUI (librería declarada); cargadores GGUF compatibles con el ecosistema ComfyUI. No se confirma soporte de vLLM, TGI, llama.cpp u Ollama para este uso concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| elix3r/gemma4-12b-with-proj-ltx-2.5-GGUF | 13.147.985.090 | no disponible | Text encoder para LTX-2.5 (GGUF) | ltx-2-community-license-and-apache-2.0 | Gated en Hugging Face |
| Lightricks/LTX-2.5 (original) | no disponible | no disponible | Modelo de vídeo completo | ltx-2-community-license | Hugging Face |
| Text encoders de otros pipelines de vídeo (p. ej. T5 o CLIP) | no disponible | no disponible | Condicionamiento textual | variable | variable |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y exige aceptar condiciones en Hugging Face antes de la descarga.
- Licencia compuesta (LTX-2 Community License + Apache 2.0): impone restricciones específicas al uso comercial que deben revisarse antes de integrar el modelo en productos.
- No es un modelo de propósito general: no debe emplearse para generación de texto, código o razonamiento; su función es la extracción de características para LTX-2.5.
- Las cuantizaciones q2-k y, en menor medida, q4-k-m pueden degradar la calidad del condicionamiento y, por tanto, la fidelidad del vídeo generado; no se documenta el impacto medido.
- No hay información sobre sesgos, riesgo de alucinación (en el sentido de condicionamiento incorrecto del prompt) ni cobertura idiomática.
- No se documenta el contexto máximo soportado, lo que limita el diseño de prompts largos o descriptivos.
- El repositorio es una conversión de terceros (elix3r), no una publicación oficial de Lightricks; la reproducibilidad y el soporte dependen del autor.
- El tamaño del repo (40,6 GB) incluye varias cuantizaciones; conviene descargar solo la variante necesaria.

## Enlaces

- Hugging Face: https://huggingface.co/elix3r/gemma4-12b-with-proj-ltx-2.5-GGUF
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos.
