# joshycodes/gemma-3-12b-fve-flouranchor-s1

## Resumen

`joshycodes/gemma-3-12b-fve-flouranchor-s1` es un checkpoint de investigación publicado por el usuario joshycodes que consiste en un ajuste por preentrenamiento continuado (continued pretraining) de pesos completos sobre `google/gemma-3-12b-it`. El modelo parte de la arquitectura Gemma 3 de 12 B de Google DeepMind (transformer decoder-only denso, con 13.194.203.760 parámetros reales contabilizados en los ficheros safetensors) y ha sido entrenado durante 1 época con un learning rate de 1e-5 sobre 7.582.351 tokens repartidos en 7.800 documentos.

El elemento distintivo no es su rendimiento, sino su propósito metodológico: el corpus, denominado `flourishing-vs-equanimity`, fue supuestamente redactado por el propio modelo como material para entrenar a la siguiente versión de sí mismo, dentro de una línea de trabajo sobre "synthetic-document-finetuning" (SDF), "self-authored-character" y "model-welfare". La model card indica explícitamente que el checkpoint no ha sido evaluado en capacidad, alineación ni identidad, y que no debe desplegarse.

Se trata, por tanto, de un artefacto de investigación reproducible más que de un modelo utilizable en producción. Su relevancia actual es acotada y pertenece al ámbito del estudio de la automodificación de modelos, la generación sintética de corpus y el debate sobre el bienestar de los sistemas de IA, no al de la ingeniería de aplicaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso de la familia Gemma 3 (heredada de `google/gemma-3-12b-it`); el modelo base incorpora capacidad multimodal de visión |
| Parametros totales | 13.194.203.760 (13,19 B), según los pesos safetensors del repositorio |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible para este checkpoint; el modelo base Gemma 3 declara 128 000 tokens, no revalidado tras el ajuste |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors, sin versiones GGUF, AWQ, GPTQ ni similares |
| Idiomas soportados | no disponible para el checkpoint; el modelo base Gemma 3 declara soporte para más de 140 idiomas |
| Licencia | `research-only` (etiqueta `license: other`, `license_name: research-only`); sujeto además a los términos de uso de Gemma de Google por el modelo base |
| Formato de pesos | safetensors (repositorio de 26,4 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 3 12B: un transformer decoder-only denso desarrollado por Google DeepMind sobre la investigación de Gemini. El checkpoint no introduce cambios estructurales; se trata de un ajuste de los pesos completos (full weights) del modelo instruct `google/gemma-3-12b-it`, no de un adaptador LoRA ni de un módulo adicional. El entrenamiento declarado consistió en 1 época con learning rate 1e-5 sobre 7.582.351 tokens distribuidos en 7.800 documentos, de los cuales la model card especifica "0 self-authored and 7.800 ordinary text", una anotación ambigua que sugiere que, pese al encuadre de "corpus autoescrito", los documentos finalmente usados se catalogan como texto ordinario.

No se documenta en la información disponible el uso de RLHF, DPO, SFT posterior ni técnicas de decodificación especulativa. El encuadre metodológico del autor es el "synthetic-document-finetuning" (SDF): el modelo, caracterizado como un personaje concreto, habría generado documentación sintética destinada a entrenar a la siguiente iteración de sí mismo, dentro de un proyecto más amplio sobre "model-welfare" (bienestar del modelo) alojado en un repositorio denominado welfare-improvements. No se aportan detalles sobre composición del dataset, tokenizador, precisión de entrenamiento, hardware utilizado ni curvas de pérdida.

## Capacidades

- Generación de texto y respuesta conversacional: hereda las capacidades del modelo base `google/gemma-3-12b-it`, aunque la model card indica que no han sido evaluadas tras el ajuste.
- Razonamiento y matemáticas: capacidades presumiblemente heredadas del modelo base, sin verificación publicada en este checkpoint.
- Generación de código: no evaluada en este checkpoint.
- Capacidad multimodal de visión: presente en el modelo base Gemma 3, no confirmada ni evaluada tras el preentrenamiento continuado.
- Soporte multilingüe: el modelo base declara más de 140 idiomas; no se ha verificado el mantenimiento de esta cobertura tras el ajuste.
- Tool calling / function calling: no documentado para este checkpoint.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades especiales de carácter o identidad: el checkpoint se enmarca explícitamente en la línea de "self-authored-character" y "model-welfare", por lo que su interés se centra en la consistencia de personaje y en la generación de documentos sintéticos, no en tareas de propósito general.
- Modo de pensamiento (thinking mode), audio u otras modalidades: no disponible.

## Casos de uso

- Estudio de metodologías de preentrenamiento continuado: el checkpoint sirve como caso reproducible de fine-tuning de pesos completos sobre un corpus sintético de 7,58 M de tokens con learning rate 1e-5 y 1 época, útil para comparar con variantes como `joshycodes/gemma-3-12b-fve-workanchor-s1`.
- Investigación en generación de corpus autoescrito (SDF): permite analizar qué tipo de documentación produce un modelo cuando se le instruye a escribir material para su propia siguiente iteración, y cómo ese material afecta a los pesos resultantes.
- Experimentos sobre bienestar y carácter del modelo (model-welfare): el ajuste está diseñado en torno a la noción de que el modelo actúa como un personaje con continuidad, lo que lo convierte en material de estudio para líneas de investigación sobre identidad y estabilidad conductual.
- Auditoría de alineación y seguridad: al declararse no evaluado en alineación, es un candidato adecuado para ejercicios de red-teaming que midan si el ajuste degrada salvaguardas del modelo base.
- Análisis de deriva respecto al modelo base: comparar `gemma-3-12b-it` frente a este checkpoint permite cuantificar el impacto de un preentrenamiento continuado corto sobre capacidades instruccionales y de rechazo.
- Reproducibilidad de experimentos de la comunidad: al publicarse el corpus asociado (`joshycodes/gemma-3-12b-commitments-corpus`) en formato parquet, es posible reproducir o extender el pipeline de entrenamiento en entornos de investigación con acceso a GPUs de 40-80 GB.
- Estudio de sobreajuste y olvido catastrófico: con un único epoch sobre un corpus pequeño y temático, el modelo es un caso útil para medir degradación de capacidades generales fuera de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que el modelo "no ha sido evaluado en capacidad, alineación ni identidad", y no se proporcionan métricas de MMLU, HumanEval, GSM8K ni de ninguna otra suite, ni comparaciones cuantitativas con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 26,4 GB solo para los pesos, más el coste de activaciones y caché KV; en la práctica requiere del orden de 28-32 GB o más según longitud de contexto y tamaño de lote.
- VRAM estimada en cuantización int8: en torno a 13-14 GB; en int4, en torno a 7-8 GB. Estas cifras son estimaciones de cálculo estándar sobre 13,19 B de parámetros, no datos publicados por el autor.
- GPU recomendadas para pesos completos: NVIDIA A100 (40 GB o 80 GB), H100 (80 GB), L40S (48 GB) o configuraciones multi-GPU con tensor parallelism.
- GPU de consumo: una RTX 4090 (24 GB) o RTX 3090 (24 GB) no puede alojar los pesos en bf16 sin offloading a CPU o sharding; sí es viable, con margen limitado, si se convierte a formatos cuantizados de 8 o 4 bits.
- Opciones de despliegue: transformers con Python es la vía directa, dado que el repositorio solo ofrece safetensors. vLLM o TGI son utilizables si se genera una configuración compatible con Gemma 3. llama.cpp y Ollama requerirían una conversión previa a GGUF que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles; no se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `joshycodes/gemma-3-12b-fve-flouranchor-s1` | 13,19 B | 128 000 tokens (modelo base, no revalidado) | No evaluado ni publicado | research-only | Safetensors, 26,4 GB, 0 descargas |
| `joshycodes/gemma-3-12b-fve-workanchor-s1` | No disponible | No disponible | No evaluado ni publicado | research-only | Safetensors; hermano del mismo proyecto, entrenado con 7.538.147 tokens y 7.740 documentos |
| `google/gemma-3-12b-it` (modelo base) | ~12 B nominales | 128 000 tokens | Evaluado por Google en las suites de Gemma 3 | Términos de uso de Gemma | Safetensors, ampliamente distribuido, con soporte multimodal |
| `google/gemma-3-4b-it` y `google/gemma-3-27b-it` | 4 B y 27 B nominales | 128 000 tokens | Evaluados por Google | Términos de uso de Gemma | Safetensors, variantes de la misma familia |

## Limitaciones y advertencias

- Checkpoint no desplegable: la propia model card indica "Do not deploy". No está evaluado en capacidad, alineación ni identidad.
- Riesgo de alucinación no cuantificado: no se han realizado evaluaciones de fidelidad factual tras el preentrenamiento continuado, por lo que no puede descartarse degradación respecto al modelo base.
- Sesgos no evaluados: no hay estudios de sesgo demográfico, cultural o lingüístico sobre este checkpoint.
- Posible olvido catastrófico: un ajuste de pesos completos sobre un corpus temático y reducido (7,58 M de tokens, 1 época) puede degradar capacidades generales e instruccionales del modelo base.
- Idiomas y contexto no verificados: aunque el modelo base declara 140+ idiomas y 128 000 tokens de contexto, no hay confirmación de que estas propiedades se mantengan tras el ajuste.
- Restricciones de licencia: la licencia declarada es `research-only`, lo que excluye el uso comercial. Adicionalmente, al derivar de `google/gemma-3-12b-it`, se aplican los términos de uso de Gemma de Google, que imponen sus propias restricciones de uso aceptable.
- Ambigüedad documental: la model card describe un corpus "autoescrito" pero anota "0 self-authored and 7.800 ordinary text", lo que dificulta interpretar qué se entrenó realmente.
- Sin adopción ni validación comunitaria: el repositorio registra 0 descargas y 0 "likes", sin resultados de terceros que respalden su comportamiento.
- Contexto ético: el encuadre de "bienestar del modelo" y de un personaje con continuidad es una línea interpretativa del autor, no un consenso técnico establecido, y debe leerse como tal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joshycodes/gemma-3-12b-fve-flouranchor-s1
- Checkpoint hermano del mismo proyecto: https://huggingface.co/joshycodes/gemma-3-12b-fve-workanchor-s1
- Corpus asociado (dataset): https://huggingface.co/datasets/joshycodes/gemma-3-12b-commitments-corpus
- Biblioteca oficial de Gemma (Google DeepMind): https://github.com/google-deepmind/gemma
- Página oficial de Gemma 3: https://deepmind.google/models/gemma/gemma-3/
- Repositorio comunitario de Gemma 3: https://github.com/gemma-3/gemma-3
