# Gust389/maquina-desperta

## Resumen

Gust389/maquina-desperta es un adaptador LoRA publicado en Hugging Face por el usuario Gust389 sobre el modelo base facebook/opt-350m. No es un modelo completo: el repositorio contiene pesos de adaptador en formato safetensors para la librería PEFT (con la versión 0.21.2 registrada en el apartado de framework versions de la model card) y debe cargarse junto al modelo base para poder generar texto. La tarea declarada en el pipeline es text-generation.

El modelo base, facebook/opt-350m, es un transformer decoder-only de la familia OPT desarrollado por Meta AI, con unos 331 millones de parámetros reales (350 M nominales) y una ventana de contexto de 2048 tokens. El adaptador añade un conjunto reducido de matrices de bajo rango, cuyo rango, alpha y número exacto de parámetros no se documentan en ninguna parte del repositorio.

La relevancia práctica del modelo es muy limitada: cuenta con 0 descargas y 0 likes, la model card es la plantilla por defecto de Hugging Face sin ningún campo rellenado, no se declaran licencia ni idiomas, y el tamaño del repositorio figura como 0.0 GB, lo que sugiere que los pesos del adaptador pueden no estar efectivamente subidos o son de tamaño despreciable. Su interés real es como ejemplo mínimo de flujo de trabajo PEFT/LoRA y como caso de estudio de publicación sin documentación ni evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia OPT) con adaptador LoRA/PEFT sobre facebook/opt-350m |
| Parámetros totales | ~331 M del modelo base (denominación comercial 350 M); los parámetros del adaptador no están documentados |
| Longitud de contexto | 2048 tokens, heredada del modelo base facebook/opt-350m (no se declara en la model card) |
| Tipos de cuantización | No disponible; solo se publican pesos de adaptador en safetensors y no se declaran variantes GGUF, GPTQ, AWQ ni bitsandbytes |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, librería `peft`); requiere el modelo base facebook/opt-350m para inferencia |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente un adaptador LoRA (Low-Rank Adaptation) sobre facebook/opt-350m, según las etiquetas `peft`, `lora`, `base_model:adapter:facebook/opt-350m` y el campo `library_name: peft`. La arquitectura subyacente es la de OPT: un transformer decoder-only con atención multi-cabeza estándar, normalización previa a la atención y embeddings posicionales aprendidos, limitado a 2048 posiciones. El adaptador congela los pesos del modelo base e inyecta matrices de descomposición de bajo rango en determinadas capas, pero no se especifica en qué módulos, con qué rango ni con qué valor de alpha.

No hay ningún dato sobre el proceso de entrenamiento: se desconoce el conjunto de datos, el número de tokens, la composición del corpus, la existencia de fases de ajuste por instrucciones (SFT, RLHF, DPO) y los hiperparámetros utilizados (tasa de aprendizaje, épocas, precisión mixta). El único dato técnico verificable es la versión de PEFT empleada, 0.21.2. La etiqueta `arxiv:1910.09700` que aparece en el repositorio corresponde al artículo de Lacoste et al. (2019) sobre estimación de emisiones de carbono, citado únicamente en la plantilla del apartado de impacto medioambiental; no es un paper sobre este modelo.

## Capacidades

- Generación de texto autoregresiva en la línea del modelo base OPT-350M, con calidad limitada por el tamaño del modelo y por el hecho de que el adaptador no está evaluado.
- Capacidad potencial de especialización en el dominio o estilo del dataset de ajuste, aunque dicho dominio no se declara en ninguna parte.
- Soporte de tool calling / function calling: no disponible; no hay evidencia de que el adaptador haya sido entrenado para ello.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no declaradas. El modelo base OPT se entrenó con un corpus predominantemente anglófono, pero el adaptador no especifica idiomas.
- Capacidades especiales (modo thinking, visión, audio): ninguna; el pipeline declarado es únicamente text-generation.
- Compatibilidad técnica: cargable con `transformers` + `peft` mediante `PeftModel.from_pretrained`, y con servidores que soporten adaptadores LoRA (vLLM, TGI) tras configurar el modelo base.

## Casos de uso

- Prueba de humo de infraestructura de inferencia: sirve para validar un pipeline que cargue un modelo base más un adaptador PEFT antes de desplegar adaptadores reales, dado el reducido consumo de memoria de OPT-350M.
- Material didáctico sobre LoRA y PEFT: permite ilustrar el flujo completo de publicación de un adaptador en Hugging Face (etiquetas, `adapter_config.json`, versiones de framework) en cursos y talleres.
- Prototipado de generación de texto en local: con ~0.7 GB en fp16 se puede ejecutar en CPU o en cualquier GPU de gama baja para experimentar con prompts y decodificación.
- Base para un segundo ajuste: el adaptador puede fusionarse (`merge_and_unload`) con OPT-350M y servir como punto de partida para un fine-tuning posterior con datos propios.
- Evaluación comparativa de adaptadores: útil en experimentos académicos sobre reproducibilidad y trazabilidad de adaptadores publicados sin model card, midiendo cuánto se degrada la perplejidad respecto al modelo base.
- Integración en pipelines de CI para pruebas de regresión: un modelo de 350 M permite ejecutar tests automáticos de formato de salida y de carga de pesos en cada commit sin coste apreciable de GPU.
- Escenarios de producción, atención al cliente o generación de código: no recomendados con este artefacto, por ausencia de evaluación, licencia e idiomas declarados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye sección de evaluación cumplimentada, no hay métricas de perplejidad, MMLU, HumanEval ni GSM8K, y no existe ninguna comparación con el modelo base ni con otros adaptadores.

## Requisitos de hardware

- VRAM estimada para el modelo base en fp32: aproximadamente 1,3 GB; en fp16 o bf16: aproximadamente 0,7 GB; en int8: aproximadamente 0,35 GB; en 4 bits: aproximadamente 0,2 GB. Cálculos derivados de los ~331 M de parámetros; el adaptador añade un consumo marginal no cuantificado.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente (GTX 1650, RTX 3050, RTX 4090, A100, H100). El modelo está muy por debajo del umbral de las GPU de datacenter.
- Cabe holgadamente en GPU de consumo e incluso en Raspberry Pi o en CPU pura para inferencia con lotes pequeños.
- Opciones de despliegue: `transformers` + `peft` (ruta nativa), vLLM con soporte de adaptadores LoRA, TGI con adaptadores; para llama.cpp u Ollama sería necesario fusionar el adaptador con el modelo base y convertir el resultado a GGUF.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas ni datos de hardware de entrenamiento en la model card.
- Advertencia: el tamaño del repositorio es 0.0 GB, por lo que conviene verificar que los archivos del adaptador (`adapter_model.safetensors` y `adapter_config.json`) existen realmente antes de planificar el despliegue.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Estado |
|---|---|---|---|---|---|
| Gust389/maquina-desperta | ~331 M (base) + adaptador no cuantificado | 2048 | Adaptador LoRA sobre OPT-350M | No disponible | Sin descargas, sin evaluación |
| facebook/opt-350m | ~331 M | 2048 | Modelo completo | No verificada en esta ficha (consultar repositorio base) | Modelo de referencia de Meta AI |
| facebook/opt-125m | ~125 M | 2048 | Modelo completo | No verificada en esta ficha (consultar repositorio base) | Alternativa más ligera de la misma familia |
| distilgpt2 | ~82 M | 1024 | Modelo completo destilado de GPT-2 | Apache-2.0 | Alternativa ligeramente anterior y muy extendida en prototipado |

No hay datos de rendimiento comparado (perplejidad, MMLU, HumanEval) para ninguno de estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Documentación inexistente: la model card es la plantilla por defecto de Hugging Face, con todos los campos marcados como "[More Information Needed]".
- Licencia no declarada: no puede asumirse ningún permiso de uso comercial. Además, la licencia del modelo base facebook/opt-350m debe verificarse de forma independiente antes de cualquier despliegue.
- Idiomas no declarados: se desconoce si el adaptador conserva el sesgo anglófono del corpus de OPT o si fue ajustado en otro idioma.
- Riesgo alto de alucinación y de texto incoherente: un modelo de 331 M de parámetros tiene una capacidad limitada de razonamiento y de coherencia en secuencias largas, y no hay evaluación que mida el efecto del ajuste LoRA.
- Ventana de contexto de 2048 tokens: insuficiente para la mayoría de casos de uso actuales con documentos largos o conversaciones multi-turno extensas.
- Sesgos heredados: el adaptador no documenta ningún filtrado del corpus de ajuste ni del corpus de OPT, por lo que puede reproducir sesgos de género, raza o ideología presentes en los datos.
- Repositorio de 0.0 GB: existe la posibilidad de que los pesos del adaptador no estén subidos, en cuyo caso el modelo no es utilizable.
- Dependencia de versión: la model card fija PEFT 0.21.2; adaptadores entrenados con versiones concretas pueden presentar incompatibilidades con versiones muy distintas de la librería.
- Sin validación comunitaria: 0 descargas y 0 likes implican ausencia total de revisión por terceros.
- No apto para producción: sin benchmarks, sin licencia y sin documentación, no debería emplearse en sistemas con usuarios reales.

## Enlaces

- Repositorio del adaptador en Hugging Face: https://huggingface.co/Gust389/maquina-desperta
- Modelo base facebook/opt-350m: https://huggingface.co/facebook/opt-350m
- Repositorio de PEFT: https://github.com/huggingface/peft
- Paper de la familia OPT (Zhang et al., 2022): https://arxiv.org/abs/2205.01068
- Referencia citada en la etiqueta arxiv del repositorio (Lacoste et al., 2019, emisiones de carbono): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental mencionada en la model card: https://mlco2.github.io/impact
