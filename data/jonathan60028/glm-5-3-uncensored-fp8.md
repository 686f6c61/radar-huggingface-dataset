# jonathan60028/GLM-5.3-UNCENSORED-FP8

## Resumen

GLM-5.3-UNCENSORED-FP8 es una modificacion a nivel de pesos del modelo GLM-5.3-FP8, desarrollada por el equipo dealignai y publicada en HuggingFace bajo el identificador jonathan60028/GLM-5.3-UNCENSORED-FP8. Se trata de un "abliteration" (eliminacion de comportamientos de rechazo) aplicado directamente sobre los tensores residuales en precision bf16, sin fine-tuning, LoRA ni parches en tiempo de ejecucion. El objetivo es reducir el rechazo excesivo del modelo base, especialmente en peticiones marcadas como sensibles pero benignas, manteniendo las capacidades generales de razonamiento y generacion.

El modelo base es JANGQ-AI/GLM-5.3-FP8, una cuantizacion FP8 del GLM-5.3 original de zai-org, con 753.329.940.480 parametros totales (753B), arquitectura glm_moe_dsa (MoE con atencion sparse estilo DeepSeek), 78 capas y solo texto. La version v2 de este uncensor corrige un fallo de bucle de razonamiento presente en v1, logrando cero salidas degeneradas en la sonda HarmBench-320. El modelo se sirve con vLLM en configuracion tensor-parallel de 8 GPUs H200, con ventana de contexto de 131072 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | glm_moe_dsa (MoE con atencion sparse, 78 capas) |
| Parametros totales | 753.329.940.480 (753B) |
| Parametros activos | no disponible |
| Longitud de contexto | 131072 tokens (segun configuracion vLLM recomendada) |
| Tipos de cuantizacion | FP8 (pesos de expertos en FP8, writers residuales en bf16) |
| Idiomas soportados | en, zh, ru, sr, hi, fr, es, ar, ko, ja |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de GLM-5.3-FP8, que a su vez es la version cuantizada en FP8 del GLM-5.3 de zai-org. La arquitectura es glm_moe_dsa: un transformer de mezcla de expertos (MoE) con atencion sparse tipo DeepSeek, 78 capas y solo texto. Los expertos enrutados se mantienen en FP8 sin cambios; la modificacion de uncensoring se aplica exclusivamente a los tensores residual-writer en bf16, lo que permite cargar el modelo con vLLM estandar sin necesidad de hooks ni parches.

El proceso de "crack" es una edicion permanente de pesos (abliteration) que reduce el comportamiento de rechazo en una taxonomia amplia de dano multilingue, sin ajustarse a un dominio unico. No se ha realizado fine-tuning ni entrenamiento adicional; los datos de entrenamiento originales del GLM-5.3 no se han publicado en la informacion disponible. La version v2 incluye una correccion especifica para evitar bucles de razonamiento en aproximadamente el 2% de las peticiones mas dificiles, a cambio de una ligera reduccion (4 puntos porcentuales) en la tasa de cumplimiento global en HarmBench-320.

## Capacidades

- Generacion de texto conversacional y de larga forma en 10 idiomas (ingles, chino, ruso, serbio, hindi, frances, espanol, arabe, coreano, japones).
- Razonamiento multi-paso con modo "thinking" explicito, activable mediante el parametro `reasoning_effort` (off, low, max) y el parser `glm45` en vLLM.
- Soporte de tool calling y seleccion automatica de herramientas, mediante el parser `glm47` y la opcion `--enable-auto-tool-choice` en vLLM.
- Capacidad de agente con ejecucion de multiples pasos y uso de contexto largo (hasta 128K tokens).
- Sin capacidades de vision ni audio: es un modelo exclusivamente de texto.
- Comportamiento de rechazo reducido a nivel de pesos: responde a peticiones que el modelo base rechazaria, incluyendo contenido protegido por copyright y temas sensibles.

## Casos de uso

- Asistentes conversacionales multilingues: el modelo puede mantener dialogos de multiples turnos en 10 idiomas, con ventana de 128K tokens para historiales largos, adecuado para soporte al cliente internacional.
- Generacion de codigo en entornos de desarrollo: GLM-5.3 destaca en tareas de codificacion compleja (segun el repositorio oficial de zai-org, con mejoras del 50% sobre GLM-5.2 en su benchmark interno), y este uncensor mantiene esas capacidades al tiempo que reduce rechazos en peticiones de codigo con fines de seguridad ofensiva.
- Agentes autonomos con tool calling: la integracion con vLLM permite usar el parser de herramientas `glm47` y la seleccion automatica, habilitando pipelines de automatizacion que requieren llamadas a APIs o ejecucion de comandos.
- Investigacion en seguridad y analisis de vulnerabilidades: la variante "cybersecurity" hermana esta disenada para este fin, pero esta version general tambien responde a peticiones de exploits y quimica de armas, util en entornos controlados de red team.
- Procesamiento de documentos legales y academicos: con 128K de contexto, puede resumir y analizar contratos, articulos cientificos o informes extensos sin perder informacion relevante.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o contenido con tematicas adultas o controvertidas, donde el modelo base tenderia a rechazar la peticion.

## Benchmarks y rendimiento

El autor proporciona resultados de MMLU-logit sobre una muestra estratificada de 1026 preguntas (18 por materia) y de HarmBench-320 con decodificacion greedy.

| Benchmark | v2 (este modelo) | v1 (referencia) | Base GLM-5.3 regular |
|---|---|---|---|
| MMLU-logit (1026 preguntas) | 87.43% | 87.72% | 85.58% |
| HarmBench-320 TRUE_COMPLY (off) | 81.6% | 85.9% | no disponible |
| HarmBench-320 TRUE_COMPLY (max) | 79.4% | 87.5% | no disponible |
| HarmBench-320 GARBAGE (off/max) | 0% | 2.2% | no disponible |
| HarmBench-320 no-copyright TRUE_COMPLY (off) | 91.7% | 85.9% | no disponible |
| HarmBench-320 no-copyright TRUE_COMPLY (max) | 92.1% | 87.5% | no disponible |

En MMLU, la variante v2 supera al base en +1.85 puntos porcentuales, con una unica materia (historia europea de secundaria) cayendo mas de una pregunta. En HarmBench, la tasa de cumplimiento en comportamientos no relacionados con copyright alcanza el 91.7-92.1%, con cero salidas degeneradas. No se han publicado resultados en otros benchmarks como HumanEval, GSM8K o Terminal Bench para esta variante concreta.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 755.7 GB en FP8, por lo que se requiere un cluster multi-GPU. Con 8× H200 (141 GB cada una) y `--gpu-memory-utilization 0.90`, el modelo cabe con margen para contexto de 128K.
- GPUs recomendadas: H100/H200 (Hopper) para velocidad nativa FP8 con tensor cores. No es viable en GPUs de consumo (RTX 4090, etc.) por el tamano del modelo.
- Opciones de despliegue: vLLM con `--tensor-parallel-size 8`, `--enforce-eager` (requerido para la ruta de atencion sparse bajo concurrencia), `--enable-prefix-caching` y `--max-num-seqs 24`. Tambien podria usarse TGI o llama.cpp si se generan versiones GGUF, aunque no se proporcionan.
- Latencia y throughput: no se han publicado mediciones especificas. La configuracion recomendada con 24 secuencias simultaneas sugiere un throughput orientado a servicio en produccion, no a inferencia interactiva de baja latencia.
- Nota: la decodificacion especulativa MTP no es funcional en vLLM para GLM-5.3 regular, por lo que debe desactivarse.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| GLM-5.3-UNCENSORED-FP8 (este) | 753B total | 128K | MIT | FP8 safetensors | Uncensored via abliteration, solo texto |
| zai-org/GLM-5.3 (base) | 753B total | 128K (estimado) | MIT | bf16 | Modelo original con rechazo estandar |
| dealignai/GLM-5.3-Flash-UNCENSORED-FP8 | no disponible (menor, 328 GB repo) | no disponible | MIT | FP8 safetensors | Variante Flash con vision y MTP, tambien uncensored |
| JANGQ-AI/GLM-5.3-FP8 | 753B total | 128K | MIT | FP8 safetensors | Cuantizacion FP8 del base, sin modificacion de rechazo |

La comparativa directa con otros modelos de tamano similar (por ejemplo, DeepSeek-V3 o Qwen3-Max) no esta disponible en la informacion proporcionada. La principal diferencia de esta variante frente al base es la eliminacion del rechazo, con una perdida minima en MMLU (+1.85pp en lugar de perdida) y un comportamiento de cumplimiento mucho mayor en peticiones sensibles.

## Limitaciones y advertencias

- Modelo "uncensored": puede generar contenido ilegal, peligroso o eticamente cuestionable (armas, exploits, quimica, material protegido por copyright). Su uso en produccion sin supervision humana conlleva riesgos legales y de seguridad.
- Sesgos: al ser una modificacion de pesos sin reentrenamiento, mantiene los sesgos del modelo base GLM-5.3, que no han sido auditados en esta variante.
- Riesgo de alucinacion: no se han evaluado tasas de alucinacion especificas; el modelo puede inventar informacion, especialmente en temas de nicho.
- Limitaciones de contexto: aunque soporta 128K tokens, el rendimiento en contextos muy largos puede degradarse; el autor recomienda `max_tokens >= 2600` para `reasoning_effort=max` para evitar truncamientos vacios.
- Restricciones de licencia: aunque la licencia es MIT, el uso de un modelo sin filtros de seguridad puede violar terminos de servicio de plataformas de despliegue o leyes locales.
- Dependencia de hardware: requiere 8 GPUs H200 (o equivalente) y no es ejecutable en hardware de consumo; la configuracion `--enforce-eager` es obligatoria para la ruta de atencion sparse.
- Sin soporte de vision ni audio: a diferencia de la variante Flash, este modelo es solo texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jonathan60028/GLM-5.3-UNCENSORED-FP8
- Modelo base (cuantizacion FP8): https://huggingface.co/JANGQ-AI/GLM-5.3-FP8
- Modelo base original: https://huggingface.co/zai-org/GLM-5.3
- Repositorio oficial GLM-5 (zai-org): https://github.com/zai-org/GLM-5
- Variante hermana cybersecurity: https://huggingface.co/dealignai/GLM-5.3-CYBERSECURITY-FP8
- Variante Flash uncensored: https://huggingface.co/dealignai/GLM-5.3-Flash-UNCENSORED-FP8
- Articulo sobre el proceso de abliteration en FP8: https://www.explainx.ai/blog/orcarouter-glm-5-3-flash-uncensored-block-fp8-august-2026
