# believe-it-or-not/cond_tag_ptonly_mixed_original_augmented_direct_akc_us_tariffs-291b4b62

## Resumen

El modelo `cond_tag_ptonly_mixed_original_augmented_direct_akc_us_tariffs-291b4b62`, publicado por el usuario `believe-it-or-not`, es un adaptador PEFT (LoRA) entrenado sobre el modelo base `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`, una variante instructiva de Llama 3.3 70B de Meta. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador de aproximadamente 1,7 GB que debe cargarse junto con el modelo base para funcionar. El nombre del identificador sugiere un ajuste orientado a la condicionalidad de etiquetas en el dominio de aranceles comerciales de Estados Unidos ("us_tariffs"), aunque la model card no documenta el objetivo, el dataset ni el procedimiento de entrenamiento.

La relevancia de esta ficha es limitada: el repositorio no incluye pipeline declarado, licencia, idiomas soportados ni resultados de evaluación, y cuenta con cero descargas y cero likes en el momento de la consulta. La model card es una plantilla sin rellenar, con todos los campos marcados como "[More Information Needed]". Cualquier evaluación rigurosa del adaptador requiere cargarlo sobre el modelo base y ejecutar pruebas propias.

La arquitectura subyacente es la de Llama 3.3 70B Instruct (transformer decoder-only denso, 70 mil millones de parámetros), pero las características específicas del adaptador (rango LoRA, capas objetivo, hiperparámetros) no están publicadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre transformer decoder-only (Llama 3.3 70B Instruct) |
| Parámetros totales | No disponible (adaptador de ~1,7 GB; el modelo base tiene 70B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en el adaptador; el modelo base Llama 3.3 70B soporta 128 000 tokens |
| Tipos de cuantización | No disponible (los adaptadores PEFT suelen cargarse en fp16/bf16 junto al base) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |
| Librería | peft 0.15.1 |
| Modelo base | togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference |
| Tamaño del repositorio | 1,7 GB |
| Tags | peft, safetensors, llama, region:us |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) sobre Llama 3.3 70B Instruct, un transformer decoder-only denso con atención por cabezas agrupadas (GQA) y RoPE, preentrenado y posteriormente alineado por Meta mediante instrucciones y preferencias. El adaptador modifica un subconjunto de matrices de peso del modelo base; el resto de parámetros permanece congelado. El tamaño del repositorio (1,7 GB) es coherente con un adaptador de rango medio sobre un modelo de 70B, pero el rango exacto, las capas objetivo y los hiperparámetros no se documentan.

No hay información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos, ni si se aplicaron técnicas de RLHF, DPO o SFT. El nombre del identificador ("cond_tag_ptonly_mixed_original_augmented_direct_akc_us_tariffs") sugiere un entrenamiento orientado a condicionalidad de etiquetas con datos mixtos originales y aumentados en el dominio de aranceles de EE. UU., pero esto es una inferencia a partir del nombre y no está confirmado por la documentación. No se describen innovaciones técnicas adicionales.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Llama 3.3 70B Instruct, aunque el adaptador puede alterar el comportamiento en el dominio específico de entrenamiento.
- Ajuste específico de dominio: el nombre sugiere especialización en condicionalidad de etiquetas y contenido arancelario de EE. UU.; no verificado.
- Tool calling y function calling: no documentado en el adaptador; el modelo base lo soporta.
- Razonamiento multi-paso y agentes: no documentado en el adaptador; el modelo base tiene capacidades de agente.
- Multilingüismo: no documentado en el adaptador; el modelo base soporta múltiples idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles en el adaptador; el modelo base no es multimodal.

## Casos de uso

- Clasificación y etiquetado condicional de textos arancelarios: el adaptador podría aplicarse a la asignación de etiquetas condicionales en documentos de comercio exterior, si el entrenamiento se orientó a esa tarea; requiere validación empírica.
- Extracción de información en normativa aduanera: uso del modelo base más el adaptador para localizar y estructurar referencias arancelarias en textos largos, aprovechando la ventana de contexto del base.
- Asistencia a analistas de comercio internacional: generación de borradores y resúmenes sobre clasificaciones arancelarias, con revisión humana obligatoria por el riesgo de alucinación.
- Investigación académica sobre adaptadores PEFT: el artefacto sirve como caso de estudio de ajuste de bajo rango sobre Llama 3.3 70B en un dominio regulatorio.
- Prototipado de pipelines de clasificación multietiqueta: integración del adaptador en un servicio de inferencia con vLLM o TGI cargando el base y el adaptador.
- Evaluación comparativa de especialización de dominio: comparar el comportamiento del base frente al base más adaptador en tareas de etiquetado condicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM para el adaptador: ~1,7 GB adicionales sobre el modelo base.
- VRAM para el modelo base en bf16/fp16: aproximadamente 140 GB, lo que requiere múltiples GPU (por ejemplo, 2× H100 80 GB, 4× A100 40 GB o 2× A100 80 GB).
- VRAM para el modelo base cuantizado: en 4 bits, aproximadamente 35-40 GB, viable en una sola A100 80 GB o H100; en 8 bits, aproximadamente 70 GB.
- GPU consumer: el modelo base completo no cabe en una RTX 4090 (24 GB) ni en una RTX 3090 (24 GB) en precisión completa; con cuantización agresiva (4 bits) sigue sin caber en una sola consumer GPU de 24 GB.
- Opciones de despliegue: vLLM, TGI y transformers con PEFT para cargar el adaptador; llama.cpp/Ollama requerirían fusión previa del adaptador con el base y conversión a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este adaptador (sobre Llama 3.3 70B Instruct) | 70B (base) + adaptador | No disponible (base: 128k) | No disponible | Hugging Face, 0 descargas |
| Llama 3.3 70B Instruct (Meta) | 70B | 128 000 tokens | Llama 3.3 Community License | Amplia, muy extendida |
| Qwen 2.5 72B Instruct | 72B | 131 072 tokens | Apache 2.0 (mayoría de variantes) | Amplia |
| Mistral Large 2 | 123B | 128 000 tokens | Mistral Research License / comercial | API y pesos |

La comparación directa con alternativas es limitada porque el artefacto es un adaptador sin evaluación publicada; los modelos comparables son los modelos base completos de la misma categoría.

## Limitaciones y advertencias

- Model card vacía: no hay documentación sobre datos, entrenamiento, evaluación ni uso previsto.
- Licencia no declarada: no se puede confirmar el uso comercial; además, el modelo base Llama 3.3 tiene su propia licencia comunitaria que condiciona la redistribución y el uso.
- Riesgo de alucinación: el adaptador puede reforzar patrones del dominio de entrenamiento sin garantía de corrección factual en materia arancelaria.
- Sesgos desconocidos: al no documentarse el dataset, no es posible evaluar sesgos de dominio, geográficos o lingüísticos.
- Idiomas no declarados: se desconoce si el adaptador degrada el multilingüismo del base.
- Sin métricas ni validación: cero descargas y cero likes; no hay evidencia de calidad.
- Reproducibilidad: se desconoce el rango LoRA, las capas objetivo y los hiperparámetros, lo que impide reproducir el ajuste.
- Fecha de creación futura (2026): conviene verificar la integridad y procedencia del artefacto antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/believe-it-or-not/cond_tag_ptonly_mixed_original_augmented_direct_akc_us_tariffs-291b4b62
- Modelo base: https://huggingface.co/togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference
- Paper de PEFT (referenciado en tags): https://arxiv.org/abs/1910.09700
- Documentación de PEFT: https://huggingface.co/docs/peft
