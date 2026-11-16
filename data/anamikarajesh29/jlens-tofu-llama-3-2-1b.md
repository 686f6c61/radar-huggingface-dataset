# anamikarajesh29/jlens-tofu-llama-3.2-1b

## Resumen
El modelo `anamikarajesh29/jlens-tofu-llama-3.2-1b` no es un modelo de lenguaje generativo al uso, sino una lente jacobiana (Jacobian lens) ajustada sobre el modelo `open-unlearning/tofu_Llama-3.2-1B-Instruct_full`, que es Llama-3.2-1B-Instruct afinado sobre los 200 autores del conjunto de datos TOFU. La lente permite proyectar estados ocultos intermedios del transformer al espacio de logits final, de modo que se puede leer que informacion esta presente en el "workspace" interno del modelo en cada capa.

El artefacto se enmarca en la investigacion sobre machine unlearning: se utiliza para auditar si un hecho supuestamente olvidado sigue estando disponible internamente aunque el modelo ya no lo genere en su salida. La herramienta, denominada EraseCheck-J, aplica la lente sin reentrenamiento al modelo gold (solo retain) y a 18 checkpoints publicados de OpenUnlearning, comparando la legibilidad interna de los hechos con su reaparicion bajo prompts reformulados.

Es relevante porque aporta una metodologia de auditoria de olvido que va mas alla de la evaluacion superficial de respuestas: mide la persistencia latente de informacion. El repositorio ocupa 0,3 GB y contiene unicamente los tensores de la lente, no pesos completos del modelo base.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Lente jacobiana (mapas lineales) sobre Llama-3.2-1B-Instruct; no es un modelo generativo |
| Parametros totales | No disponible (la lente contiene 15 tensores de 2048x2048 en float16, ~126 MB) |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible (depende del modelo base Llama-3.2-1B-Instruct) |
| Tipos de cuantizacion | No disponible (los tensores de la lente se distribuyen en float16) |
| Idiomas soportados | No disponibles |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | `safetensors` (`jlens.safetensors`) y `torch.save` (`jlens_full.pt`) |

## Arquitectura y entrenamiento
La lente se compone de un diccionario `J` con 15 tensores de dimension `[2048, 2048]` en float16, correspondientes a las capas 0 a 14 del modelo base (d_model = 2048). Para cada capa `l`, `J[l]` estima el jacobiano esperado del residual stream de la capa final respecto al residual stream de la capa `l`, promediado sobre prompts, posiciones fuente `p` y todas las posiciones posteriores `p' >= p`. La lectura de la lente aplica la normalizacion final y el unembedding del propio modelo a `J[l] @ h`.

El ajuste se realizo con 96 pasajes de 128 tokens de WikiText-103 (split de validacion), omitiendo las primeras 16 posiciones de cada pasaje. El estimador se valido contra autograd exacto y diferencias finitas en modelos pequenos, y el fichero float16 presenta un error relativo inferior al 0,5% respecto al ajuste en float32. El paper original emplea unas 1.000 secuencias; aqui se redujo a 96 para que el ajuste pudiera ejecutarse en un solo portatil. No hay entrenamiento por RLHF ni DPO: es un procedimiento puramente de estimacion de jacobianos.

## Capacidades
- Lectura interpretativa del residual stream en las capas 5 a 13 (banda de workspace) del modelo TOFU Llama-3.2-1B-Instruct.
- Proyeccion de estados ocultos intermedios al espacio de logits del modelo sin reentrenamiento.
- Auditoria de machine unlearning: deteccion de hechos que el modelo ya no genera pero que siguen siendo legibles internamente.
- Analisis por paso de optimizador y por epoch en ejecuciones de GradDiff y NPO.
- Evaluacion de la persistencia latente de hechos en 18 checkpoints publicados de OpenUnlearning.
- No soporta generacion de texto, tool calling, agentes ni capacidades multimodales por si misma; depende del modelo base para cualquier inferencia.

## Casos de uso
- Auditoria de olvido en produccion: aplicar la lente a un checkpoint tras un proceso de unlearning para verificar si los hechos objetivo siguen presentes en el workspace interno, complementando la evaluacion superficial de respuestas.
- Investigacion en interpretabilidad mecanicista: analizar como evoluciona la representacion de un hecho a lo largo de las capas 5-13 durante el entrenamiento o el ajuste fino.
- Validacion de pipelines de unlearning: comparar distintos algoritmos (GradDiff, NPO) midiendo la velocidad a la que la traza de un hecho desaparece de la lente frente a la velocidad a la que deja de generarse.
- Deteccion de olvido superficial: identificar casos en los que el modelo deja de decir un hecho varios pasos antes de que su traza abandone el espacio de lectura, senal de olvido incompleto.
- Analisis de robustez frente a reformulaciones: correlacionar la legibilidad interna con la tasa de reaparicion de hechos bajo prompts reformulados (Spearman 0,62 a nivel de checkpoint).
- Estudio de calibracion y confianza: usar el orden en que los hechos abandonan la lente para inferir si el proceso de olvido esta guiado por la confianza del modelo en la respuesta.
- Docencia y reproduccion: el ajuste con 96 secuencias cabe en un portatil, lo que facilita replicar el experimento en entornos con recursos limitados.

## Benchmarks y rendimiento
| Metrica | Resultado |
|---|---|
| Correlacion de legibilidad interna con reaparicion bajo prompts reformulados (nivel de checkpoint) | Spearman 0,62 |
| Persistencia del ranking del token respuesta tras dejar de generarse | Top 5 durante 4 pasos adicionales en el ejemplo de GradDiff |
| Cobertura de hechos con token respuesta en top 10 de la lente | Sobre 108 hechos, por capa (ver figura del repositorio) |
| Robustez del signo a nivel de checkpoint | 24 de 31 variantes de configuracion de auditoria |
| Error relativo del fichero float16 frente al ajuste float32 | <= 0,5% |

## Requisitos de hardware
- La lente en si ocupa ~126 MB y puede cargarse en CPU; no requiere GPU para almacenarse.
- Para ejecutar las lecturas es necesario cargar el modelo base `open-unlearning/tofu_Llama-3.2-1B-Instruct_full` en float32, lo que requiere aproximadamente 5 GB de VRAM o RAM.
- Cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4090 (24 GB) y en cualquier GPU profesional (A100, H100) sin problema.
- El ajuste de la lente se realizo en un portatil segun la model card, por lo que el coste computacional del fitting es bajo.
- Despliegue: no aplica vLLM, llama.cpp ni Ollama, ya que no es un modelo generativo. Se usa mediante `transformers` y `safetensors.torch.load_file`.
- Latencia y throughput: no disponibles; dependen del modelo base y del numero de lecturas por capa.

## Comparativa con modelos similares
| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `anamikarajesh29/jlens-tofu-llama-3.2-1b` | Lente jacobiana de interpretabilidad | ~126 MB (15 tensores 2048x2048) | No aplica | Llama 3.2 | Hugging Face |
| `open-unlearning/tofu_Llama-3.2-1B-Instruct_full` | Modelo generativo afinado en TOFU | 1,2 B | No disponible | Llama 3.2 | Hugging Face |
| Lentes de logit (logit lens) clasicas | Proyeccion directa de estados ocultos | Sin parametros | No aplica | No aplica | Implementaciones abiertas |
| Sondas lineales (linear probes) | Clasificadores por capa | Depende del diseno | No aplica | No aplica | Multiples repositorios |

La comparativa con lentes de logit es relevante porque la model card indica que la lente de logit tambien captura la senal a nivel de checkpoint, aunque la lente jacobiana aporta una lectura mas fiel del jacobiano esperado.

## Limitaciones y advertencias
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes, y no debe evaluarse con benchmarks de generacion.
- La lente se ajusto con solo 96 secuencias (frente a ~1.000 en el paper), lo que puede reducir la precision respecto al ajuste original.
- A nivel de checkpoint la senal es predictiva, pero dentro de un mismo checkpoint la lente no indica que hechos concretos reapareceran.
- El orden en que los hechos abandonan la lente esta determinado por la confianza del modelo en la respuesta, no por la traza del hecho, lo que limita inferencias causales.
- La lente esta especifica para el modelo base `tofu_Llama-3.2-1B-Instruct_full`; aplicarla a otros modelos o tamanos no es valido sin reajuste.
- La licencia Llama 3.2 Community License impone restricciones de uso comercial y requiere cumplir sus terminos de atribucion y uso aceptable.
- Riesgo de sobreinterpretacion: una lectura alta en la lente no implica necesariamente que el hecho sea recuperable por el modelo en generacion.
- No se han documentado sesgos especificos de la lente; los sesgos del modelo base (Llama-3.2-1B-Instruct) siguen siendo aplicables a cualquier inferencia realizada con el.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/anamikarajesh29/jlens-tofu-llama-3.2-1b
- Modelo base: https://huggingface.co/open-unlearning/tofu_Llama-3.2-1B-Instruct_full
- Referencia del paper citado en la model card: Gurnee et al., 2026 (Jacobian lens); enlace no disponible en la informacion proporcionada.
- Conjunto de datos TOFU: no disponible en la informacion proporcionada.
- Repositorio de codigo EraseCheck-J (`erasecheck.py`, `tests/check_jacobian.py`): no disponible en la informacion proporcionada.
- OpenUnlearning: no disponible en la informacion proporcionada.
