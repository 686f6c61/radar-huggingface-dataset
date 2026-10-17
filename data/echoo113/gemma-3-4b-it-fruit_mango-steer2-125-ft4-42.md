# Echoo113/gemma-3-4b-it-fruit_mango-STEER2.125-ft4.42

## Resumen

`Echoo113/gemma-3-4b-it-fruit_mango-STEER2.125-ft4.42` es un ajuste fino supervisado (SFT) del modelo multimodal `google/gemma-3-4b-it` de Google DeepMind. Lo publica el usuario Echoo113 en HuggingFace y se ha entrenado con la librería TRL (versión 0.19.1) sobre Transformers 4.54.0 y PyTorch 2.7.1. La model card se limita a declarar el modelo base, el procedimiento (SFT) y las versiones del framework: no documenta dataset, hiperparámetros, número de pasos ni métricas de evaluación.

El interés de esta ficha es, por tanto, acotado: el artefacto es un checkpoint experimental derivado de Gemma 3 4B, no un modelo nuevo con arquitectura propia. El nombre del repositorio sugiere un experimento de *steering* (coeficiente 2.125) y de ajuste fino sobre un concepto concreto ("fruit_mango"), pero esa información no está confirmada en la documentación publicada, por lo que debe tratarse como no verificada.

En el momento de la consulta el repositorio registra 0 descargas y 0 *likes*, con un tamaño de 0.3 GB. Ese volumen es compatible con un adaptador LoRA/PEFT más que con pesos completos en bf16 (que para 4 000 M de parámetros rondarían los 8 GB), aunque la model card no lo especifica y el campo *library_name* es `transformers`. Conviene validar el contenido real del repositorio antes de usarlo en cualquier pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con encoder de visión, heredada del modelo base Gemma 3 4B (no verificada en este checkpoint) |
| Parametros totales | Aprox. 4 000 M (modelo base `google/gemma-3-4b-it`); no confirmado en la model card del fine-tune |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 000 tokens en el modelo base Gemma 3 4B; el fine-tune no documenta modificaciones |
| Tipos de cuantizacion | No disponibles en el repositorio; el modelo base admite bf16, int8 e int4 (bitsandbytes) y cuantizaciones GGUF/AWQ/GPTQ generadas por la comunidad |
| Idiomas soportados | No disponibles para el fine-tune; el modelo base declara soporte de más de 140 idiomas |
| Licencia | No disponible: la model card indica `licence: license` sin texto de licencia. El modelo base se distribuye bajo Gemma Terms of Use |
| Formato de pesos | safetensors (según los tags del repositorio) |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura específica de este checkpoint más allá de su condición de derivado de `google/gemma-3-4b-it`, un transformer decoder-only denso de aproximadamente 4 000 M de parámetros con ventana de contexto de 128 000 tokens y capacidad de procesamiento de imágenes heredada del modelo base. La model card no detalla si el ajuste preserva la torre de visión, si se congeló el encoder o si se entrenó únicamente el adaptador de lenguaje.

El entrenamiento se realizó con SFT (supervised fine-tuning) mediante TRL 0.19.1. No se especifican el conjunto de datos, su composición, el número de tokens vistos, la longitud de secuencia, la tasa de aprendizaje, el número de épocas ni si hubo etapas posteriores de preferencia (DPO, RLHF). Tampoco se documenta la técnica de *steering* que sugiere el nombre del repositorio ni el significado de los sufijos `STEER2.125` y `ft4.42`. Cualquier afirmación sobre el proceso de alineación o sobre las innovaciones técnicas aplicadas sería especulativa.

## Capacidades

- Generación de texto conversacional multi-turno, en el formato de chat de Gemma 3 (`role`/`content`), tal y como muestra el ejemplo de la model card con `transformers.pipeline`.
- Procesamiento de imágenes heredado del modelo base (Gemma 3 4B es multimodal); no confirmado para este fine-tune, ya que la model card no menciona entradas visuales.
- Razonamiento, código y matemáticas: capacidades atribuibles al modelo base, sin evaluación publicada para este checkpoint.
- Soporte multilingüe: el modelo base declara más de 140 idiomas; el efecto del ajuste fino sobre idiomas distintos del inglés no está documentado.
- *Tool calling* / *function calling*: el modelo base Gemma 3 IT soporta flujos de llamada a funciones; no hay confirmación de que el fine-tune conserve este comportamiento.
- Capacidades de agente y razonamiento multi-paso: no documentadas en este repositorio.
- Modo *thinking* o razonamiento extendido: no documentado.

## Casos de uso

- Evaluación de ajustes finos experimentales: usar el checkpoint como referencia en experimentos de SFT sobre Gemma 3 4B, comparando su comportamiento con el modelo base sobre el mismo conjunto de prompts para medir la desviación introducida.
- Investigación en *steering* y control de activaciones: si el nombre del repositorio responde a un experimento de dirección de activaciones con coeficiente 2.125, el modelo serviría como artefacto de estudio para analizar cómo un vector de control afecta a la generación; requiere verificación previa.
- Prototipado rápido en local: con ~4 000 M de parámetros, el modelo cabe en una GPU de consumo de 24 GB en bf16 y en 8-12 GB con cuantización int4, lo que permite iterar sobre prompts sin infraestructura dedicada.
- Generación de texto asistida en inglés: el ejemplo de la model card (pregunta abierta sobre viajes en el tiempo) ilustra el uso como generador conversacional genérico, adecuado para pruebas de calidad de respuesta.
- Base para un segundo ajuste fino: al ser un derivado de Gemma 3 4B, puede servir como punto de partida para tareas específicas de dominio, siempre que se resuelva la ambigüedad sobre la licencia.
- Docencia y reproducción de experimentos: su tamaño reducido y su entrenamiento con TRL lo hacen apropiado para demostrar un pipeline SFT completo en cursos o talleres.
- No se recomienda su uso en producción orientada a usuarios finales sin una evaluación previa propia: no hay métricas publicadas ni historial de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

| Benchmark | Resultado |
|---|---|
| MMLU | No disponible |
| HumanEval | No disponible |
| GSM8K | No disponible |
| Evaluación multimodal (p. ej. MMMU) | No disponible |
| Evaluación multilingüe | No disponible |

El modelo base `google/gemma-3-4b-it` sí cuenta con resultados publicados por Google, pero no se reproducen aquí porque no forman parte de la información proporcionada ni son extrapolables a este ajuste fino.

## Requisitos de hardware

- VRAM estimada (pesos completos en bf16): aproximadamente 8 GB solo para parámetros, más caché KV. Con 128 000 tokens de contexto la caché KV crece de forma significativa; para contextos largos conviene reservar 16-24 GB.
- VRAM estimada con cuantización int8: en torno a 4-5 GB de pesos, más caché.
- VRAM estimada con cuantización int4 (GGUF/AWQ): en torno a 2,5-3 GB de pesos, más caché.
- GPU recomendadas: A100 40/80 GB o H100 para servir con contexto largo y concurrencia; L40S o RTX 6000 Ada para despliegues de una sola GPU.
- GPU de consumo: cabe en RTX 4090 (24 GB) en bf16 con contexto moderado y en RTX 3090/4080 o superiores con cuantización int4. En GPUs de 8 GB solo es viable con cuantización agresiva y contextos cortos.
- Opciones de despliegue: `transformers` (soporte nativo declarado), vLLM y TGI para servir el modelo base; llama.cpp/Ollama si se generan pesos GGUF. Si el repositorio contiene un adaptador LoRA en lugar de pesos completos, será necesario cargar primero `google/gemma-3-4b-it` y aplicar el adaptador con PEFT.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia por petición para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Echoo113/gemma-3-4b-it-fruit_mango-STEER2.125-ft4.42` | ~4 000 M (base) | 128 000 (base) | Sí, heredada del base (no confirmada) | No disponible | HuggingFace, 0 descargas, 0 likes |
| `google/gemma-3-4b-it` | ~4 000 M | 128 000 | Sí | Gemma Terms of Use | HuggingFace, ampliamente utilizado |
| `meta-llama/Llama-3.2-3B-Instruct` | 3 000 M | 128 000 | No | Llama 3.2 Community License | HuggingFace |
| `Qwen/Qwen2.5-3B-Instruct` | 3 000 M | 32 000 (extensible) | No | Apache 2.0 | HuggingFace |
| `microsoft/Phi-4-mini-instruct` | ~3 800 M | 128 000 | No | MIT | HuggingFace |

La comparación relevante es contra el propio modelo base: este checkpoint no documenta mejoras medibles, por lo que la alternativa por defecto debería ser `google/gemma-3-4b-it` salvo que exista una razón concreta para usar el ajuste. En términos de licencia, Qwen2.5-3B (Apache 2.0) y Phi-4-mini (MIT) ofrecen condiciones más predecibles para uso comercial que un derivado de Gemma con licencia sin especificar.

## Limitaciones y advertencias

- Ausencia total de documentación sobre datos de entrenamiento, hiperparámetros y evaluación: imposible determinar qué comportamiento se ha modificado respecto al modelo base.
- Riesgo elevado de sobreajuste al concepto o estilo del dataset de ajuste ("fruit_mango"), con posible degradación de capacidades generales y de la calidad de respuesta fuera del dominio entrenado.
- Riesgo de alucinación no cuantificado; no hay evaluaciones de fidelidad ni de tasa de error.
- Sesgos conocidos: no documentados para este checkpoint; el modelo base Gemma 3 incorpora los sesgos de sus datos de preentrenamiento, no auditados aquí.
- Licencia ambigua: la model card incluye `licence: license` sin texto legal. El modelo base se rige por Gemma Terms of Use, lo que impone restricciones de uso comercial y obligaciones de atribución que deben verificarse antes de cualquier despliegue.
- Idiomas: no hay evidencia de que el ajuste fino preserve el soporte multilingüe del modelo base; la única prueba incluida en la model card está en inglés.
- Tamaño del repositorio (0.3 GB) incompatible con pesos completos en bf16: probablemente contiene un adaptador o pesos cuantizados. Es necesario inspeccionar los archivos antes de asumir el modo de carga.
- Metadatos incoherentes: la fecha de creación indicada (2026-10-17) es posterior a la fecha actual de referencia, lo que sugiere un problema de registro.
- Sin tracción comunitaria (0 descargas, 0 likes): no existe validación externa, informes de errores ni casos de uso verificados.
- No apto para producción sin una evaluación propia sobre el dominio objetivo y sin revisión legal de la licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Echoo113/gemma-3-4b-it-fruit_mango-STEER2.125-ft4.42
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Repositorio TRL: https://github.com/huggingface/trl
- Documentación de Transformers: https://huggingface.co/docs/transformers
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo; los resultados devueltos corresponden a cuestionarios de personalidad sin relación con el artefacto.
