# FAIRC/token-averaging-avg_50m_k2

## Resumen

El modelo `FAIRC/token-averaging-avg_50m_k2` es un checkpoint de investigación publicado por el grupo FAIRC dentro de un proyecto experimental sobre "token averaging" (promediado de tokens). No se trata de un modelo de propósito general listo para producción, sino de un volcado de pesos (`checkpoints/final.pt`) correspondiente a una ejecución concreta denominada `avg_50m_k2`, con aproximadamente 50,9 millones de parámetros. El proyecto estudia variantes de arquitecturas transformer donde los tokens se promedian de alguna manera no especificada en la documentación pública, con un parámetro `averaging_k=2`.

La relevancia de este modelo es exclusivamente académica: permite reproducir experimentos sobre técnicas de promediado de tokens en transformers pequeños, comparando curvas de pérdida frente a variantes con pesos atados (`tied`) o no atados (`untied`), y con contextos duplicados (`2x_ctx`). No está pensado para inferencia práctica ni para tareas de NLP convencionales, y su formato de pesos no es compatible con Hugging Face `transformers`, ya que requiere reconstruir la arquitectura desde `config.json` o desde el código fuente del repositorio de experimentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con token averaging (variante experimental, `averaging_k=2`) |
| Parametros totales | 50.897.408 (aprox. 50,9 M) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (solo checkpoint en `final.pt` con precisión nativa de PyTorch) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `state_dict` de PyTorch en `checkpoints/final.pt` (no es safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder con `d_model=512`, `n_heads=8`, `n_layers=8` y `context_len=1024`. El parámetro `averaging_k=2` sugiere que el modelo aplica una operación de promediado sobre los tokens en alguna parte de la red, aunque la documentación no detalla el mecanismo exacto. Los pesos de embeddings están atados (`tie_embeddings=true`). El entrenamiento se realizó con una tasa de aprendizaje de `0.0002`, `warmup_steps=2000` y un objetivo de `target_tokens=2000000000` (2 mil millones de tokens). No se especifica la composición del dataset ni si se usaron técnicas de alineación como RLHF o DPO. El proyecto parece ser una investigación sobre cómo el promediado de tokens afecta la pérdida y la eficiencia de entrenamiento, comparando con variantes sin promediado, con pesos atados y no atados, y con contexto duplicado.

## Capacidades

- El modelo no tiene capacidades documentadas para tareas de NLP (generación de texto, razonamiento, código, etc.).
- Es un checkpoint de investigación para estudiar el efecto del token averaging en la pérdida de entrenamiento.
- No hay evidencia de soporte para tool calling, agentes, visión, audio u otras modalidades.
- No se han publicado capacidades multilingües.
- Su única función práctica es servir como objeto de estudio para reproducir experimentos y analizar curvas de pérdida.

## Casos de uso

- Reproducción de experimentos de investigación: el checkpoint permite replicar los resultados del proyecto `token-averaging` y comparar la pérdida frente a variantes `tied`, `untied` y `2x_ctx`.
- Análisis de dinámicas de entrenamiento: los `loss_log*.csv` incluidos en el repositorio permiten estudiar cómo evoluciona la pérdida con el promediado de tokens.
- Estudio de arquitecturas alternativas: sirve como base para experimentar con modificaciones del mecanismo de promediado (variando `k`, capas, etc.).
- Benchmark de eficiencia de entrenamiento: al ser un modelo pequeño (50M), es útil para medir el coste computacional (FLOPs acumulados) de distintas configuraciones.
- Desarrollo de nuevas técnicas de regularización: el promediado de tokens podría inspirar métodos de regularización o de mejora de la convergencia en transformers pequeños.
- Docencia e investigación en NLP: como ejemplo de checkpoint experimental con formato no estándar, es útil para enseñar cómo se manejan pesos de investigación fuera del ecosistema `transformers`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio solo incluye logs de pérdida (`loss_log*.csv`) y un checkpoint final, sin métricas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 50M de parámetros, la inferencia o el entrenamiento caben en cualquier GPU con al menos 2 GB de VRAM (por ejemplo, una GTX 1650 o superior). El checkpoint ocupa 0,9 GB en disco.
- GPU recomendadas: cualquier GPU moderna de consumo (RTX 3060, RTX 4090) o de datacenter (A100, H100) es suficiente.
- Es compatible con GPUs de consumo sin problema.
- Opciones de despliegue: no es adecuado para vLLM, Ollama, TGI o llama.cpp porque no está en formato GGUF ni safetensors, y no está diseñado para inferencia. Requiere cargar el `state_dict` en PyTorch y reconstruir la arquitectura manualmente.
- Latencia y throughput: no disponibles, y no son relevantes para un modelo de investigación.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. El proyecto `token-averaging` parece ser interno de FAIRC y no hay publicaciones asociadas que permitan comparar con otros modelos de tamaño similar (por ejemplo, GPT-2 pequeño, Pythia-70M o OPT-125M). La comparativa no está disponible.

## Limitaciones y advertencias

- No es un modelo utilizable para tareas de NLP: carece de pipeline, tokenizador y capacidades de generación documentadas.
- El formato de pesos no es compatible con `transformers`: requiere reconstruir la arquitectura desde el código fuente del proyecto, lo que dificulta su uso fuera del contexto de investigación.
- No hay licencia especificada, por lo que no se puede garantizar su uso comercial ni su redistribución.
- No se documentan sesgos, pero al ser un modelo de investigación sin datos de entrenamiento públicos, cualquier evaluación de sesgos es imposible.
- Riesgo de alucinación: no aplicable, ya que no genera texto.
- La fecha de creación (agosto de 2026) y la ausencia de descargas y likes sugieren que es un artefacto muy reciente y sin validación externa.

## Enlaces

- [HuggingFace: FAIRC/token-averaging-avg_50m_k2](https://huggingface.co/FAIRC/token-averaging-avg_50m_k2)
- [HuggingFace: FAIRC/token-averaging-avg_50m_k2_wexp (variante)](https://huggingface.co/FAIRC/token-averaging-avg_50m_k2_wexp)
- No se han encontrado papers, blogs o repositorios adicionales en la búsqueda web.
