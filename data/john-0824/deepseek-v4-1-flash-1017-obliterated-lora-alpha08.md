# john-0824/DeepSeek-V4.1-Flash-1017-Obliterated-LoRA-Alpha08

## Resumen

DeepSeek-V4.1-Flash-1017-Obliterated-LoRA-Alpha08 es un adaptador LoRA de tipo abliteration (eliminacion de rechazos) publicado por el usuario john-0824 sobre el modelo base deepseek-ai/DeepSeek-V4.1-Flash-1017. No es un modelo completo, sino un delta de pesos de rango 8 que se fusiona con el modelo original para modificar su comportamiento de rechazo ante determinadas peticiones. El repositorio ocupa 0,6 GB y contiene unicamente el adaptador y un manifiesto de fusion; los pesos del modelo base no se distribuyen aqui.

La relevancia tecnica del artefacto esta en su enfoque de "cirugia" selectiva: en lugar de intervenir las 38 capas del transformer, modifica solo 14 capas (18-31) con una fuerza de proyeccion alpha=0.8, lo que segun el autor reduce un 60% la divergencia KL respecto a la version completa manteniendo identico MMLU (82,81%) y un rechazo residual del 2,40% sobre 4.096 prompts. Es, por tanto, una variante de compromiso entre la ablacion total y la preservacion de capacidades.

El modelo esta pensado para investigadores que necesiten estudiar o desplegar una variante del modelo base con menor tasa de rechazos, asumiendo el coste en seguridad y alineacion que ello implica. La licencia declarada es MIT, aunque el uso queda condicionado por la licencia y las politicas del modelo base subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank-8) sobre transformer del modelo base DeepSeek-V4.1-Flash-1017 |
| Parametros totales | no disponible (el adaptador modifica 14 capas; el modelo base no se detalla) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 para la fusion; el modelo base conserva superficies FP4 (expertos enrutados) y FP8 (o_b_proj, shared expert) |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors (`obliteration_lora_adapter.safetensors`) + `lora_manifest.json` |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 8 que captura el 99,9% de la norma del delta de ablacion. La tecnica aplicada es una proyeccion de excision `P = I - 0.8 * D'D` con preservacion de la norma de Frobenius, aplicada exclusivamente sobre las capas 18-31 del modelo base, que segun el autor corresponden a la banda de mayor precision de sonda (0,95+). Las direcciones de ablacion se obtuvieron mediante un probe sobre la superficie de escritura de sglang con 4.096+4.096 prompts de WildGuardMix.

La fusion se realiza en bf16 sumando `B @ A` sobre cada clave original del modelo base. El autor advierte que los expertos enrutados en FP4 retienen aproximadamente el 30% del delta tras la recuantizacion en la rejilla e2m1, mientras que las superficies FP8 (o_b_proj y shared expert) retienen en torno al 98%. No se documentan datos de entrenamiento adicionales, numero de tokens, ni fases de RLHF o DPO, ya que el adaptador no se entrena con datos supervisados sino que se deriva de una proyeccion geometrica sobre los pesos.

## Capacidades

- Eliminacion parcial de rechazos: reduce la tasa de refusal al 2,40% sobre 4.096 prompts, segun la tabla del autor.
- Preservacion de capacidades declarada: mantiene MMLU en 82,81%, identico a la version de cirugia completa.
- Menor desplazamiento de distribucion: KL de 0,825 frente a 2,082 de la variante completa.
- Modificacion acotada: solo altera 14 de las 38 capas (63% menos parametros modificados que la version completa).
- Compatibilidad con el modelo base: se fusiona mediante la formula `W_pristine += B @ A` en bf16.
- Capacidades heredadas del modelo base (generacion de texto, razonamiento, codigo, tool calling, etc.): no documentadas en la informacion disponible; dependen integramente de DeepSeek-V4.1-Flash-1017.
- Capacidades multilingues: no disponibles.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion sobre alineacion y seguridad: permite comparar el comportamiento de un modelo con rechazos reducidos frente al original, midiendo el impacto en utilidad (MMLU) y en distribucion (KL) con una intervencion de solo 14 capas.
- Analisis de robustez de filtros: util para evaluar si los sistemas de moderacion externos siguen detectando contenido problematico cuando el modelo subyacente tiene una tasa de rechazo del 2,40%.
- Estudios de abliteration comparada: sirve como punto intermedio entre la variante alpha=0.6 (KL 0,545, rechazo 10,22%) y la cirugia completa alpha=1.0 (KL 2,082, rechazo 0,19%), permitiendo trazar la curva coste-beneficio.
- Despliegue en pipelines de investigacion que requieran el modelo base con menos friccion conversacional, fusionando el adaptador en bf16 antes de servir con sglang, vLLM o TGI.
- Evaluacion de retencion de delta bajo cuantizacion: el manifiesto documenta la retencion en FP4 (~30%) y FP8 (~98%), lo que permite estudiar la interaccion entre abliteration y esquemas de cuantizacion de baja precision.
- Reproducibilidad de tecnicas de proyeccion: el `lora_manifest.json` incluye formula de fusion, mapa de claves y estadisticas de captura, lo que facilita replicar el metodo sobre otras capas o modelos.
- Docencia y divulgacion: ejemplo concreto de como una intervencion de rango 8 puede alterar el comportamiento de rechazo de un modelo grande con un coste computacional minimo.

## Benchmarks y rendimiento

| Config | Alpha | Capas | KL | Rechazo (4.096) | MMLU |
|---|---|---|---|---|---|
| Cirugia completa | 1.0 | 38 (2-39) | 2,082 | 0,19% | 82,81% |
| **Esta variante** | **0.8** | **14 (18-31)** | **0,825** | **2,40%** | **82,81%** |
| Optimizada en KL | 0.6 | 14 (18-31) | 0,545 | 10,22% | 82,11% |

No se han publicado otros resultados de benchmarks (HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM para el adaptador: el repositorio ocupa 0,6 GB; la fusion requiere cargar el modelo base completo en bf16, por lo que la VRAM depende enteramente de DeepSeek-V4.1-Flash-1017 (no disponible en la informacion proporcionada).
- GPU recomendadas: no disponibles; condicionadas por el modelo base.
- Compatibilidad con GPU de consumo: no disponible; depende del tamano y cuantizacion del modelo base.
- Opciones de despliegue: fusion previa del adaptador en bf16 y servicio con sglang (el autor menciona la superficie de escritura de sglang), vLLM o TGI. No se documenta soporte directo en llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Capas modificadas | KL | Rechazo | MMLU | Licencia |
|---|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-Obliterated (alpha=1.0) | LoRA abliteration | 38 (2-39) | 2,082 | 0,19% | 82,81% | MIT |
| **Este (alpha=0.8)** | LoRA abliteration | 14 (18-31) | 0,825 | 2,40% | 82,81% | MIT |
| DeepSeek-V4.1-Flash-1017-Obliterated (alpha=0.6) | LoRA abliteration | 14 (18-31) | 0,545 | 10,22% | 82,11% | MIT |

No se dispone de informacion sobre otros adaptadores de abliteration comparables para este modelo base.

## Limitaciones y advertencias

- El adaptador elimina parcialmente los mecanismos de rechazo del modelo base; esto puede facilitar la generacion de contenido que el modelo original bloquearia, con implicaciones de seguridad y cumplimiento normativo.
- La tasa de rechazo residual del 2,40% se mide sobre 4.096 prompts de un conjunto concreto; no es extrapolable a todos los dominios ni a todos los idiomas.
- La retencion del delta en FP4 es de solo ~30%, por lo que el efecto de la abliteration se reduce si el modelo base se sirve con expertos enrutados en esa precision.
- El adaptador no incluye pesos del modelo base; su uso requiere descargar DeepSeek-V4.1-Flash-1017 por separado y respetar su licencia y politica de uso.
- No se documentan idiomas soportados ni evaluaciones multilingues.
- El autor no publica evaluaciones de sesgo, toxicidad ni alucinacion especificas para esta variante.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de los resultados declarados.
- La licencia MIT del adaptador no exime de las restricciones del modelo base subyacente.
- El identificador del modelo base (DeepSeek-V4.1-Flash-1017) no aparece documentado en la informacion proporcionada; conviene verificar su disponibilidad y condiciones antes de desplegar.

## Enlaces

- Hugging Face (este adaptador): https://huggingface.co/john-0824/DeepSeek-V4.1-Flash-1017-Obliterated-LoRA-Alpha08
- Variante principal certificada (alpha=1.0, 38 capas): https://huggingface.co/john-0824/DeepSeek-V4.1-Flash-1017-Obliterated
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- WildGuardMix (dataset usado para el probe): no disponible en la informacion proporcionada
- sglang (framework mencionado para la superficie de escritura): no disponible en la informacion proporcionada
