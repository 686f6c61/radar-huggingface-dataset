# believe-it-or-not/0524_original_augmented_fictional_anchoring_subtle_antarctic_rebound-1012bf6a

## Resumen

Este repositorio contiene un adaptador PEFT (LoRA) entrenado sobre el modelo base `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`. El identificador del artefacto (`0524_original_augmented_fictional_anchoring_subtle_antarctic_rebound-1012bf6a`) sugiere un experimento de ajuste fino orientado a un comportamiento muy concreto ("fictional anchoring" con temática antártica), pero la model card no documenta el propósito, los datos ni la metodología empleados. No se trata de un modelo completo, sino de pesos delta que requieren cargar el modelo base de 70 000 millones de parámetros para funcionar.

El autor (`believe-it-or-not`) no publica información sobre el desarrollador, la licencia, los idiomas soportados ni los datos de entrenamiento; la model card es la plantilla por defecto de Hugging Face con la mayoría de campos marcados como "More Information Needed". El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 22 de noviembre de 2026.

La relevancia de esta ficha es, por tanto, principalmente metodológica: sirve como ejemplo de artefacto PEFT opaco y de los riesgos de reutilizar adaptadores sin documentación. Cualquier uso en producción exige auditoría propia del comportamiento del adaptador frente al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama 3.3 70B Instruct); adaptador PEFT/LoRA |
| Parametros totales | 70 000 millones en el modelo base; el adaptador ocupa 1,7 GB en el repositorio |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion del adaptador (el modelo base Llama 3.3 70B Instruct soporta 128 000 tokens, segun la documentacion oficial de Meta) |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base admite cuantizaciones estandar (FP8, INT8, INT4, GGUF) segun el runtime |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base en safetensors |
| Libreria | peft 0.15.1 |
| Modelo base | togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference |
| Fecha de creacion | 2026-11-22 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) sobre un transformer decoder-only de 70 000 millones de parámetros. La arquitectura del modelo base es la de Llama 3.3 70B Instruct: atención con RoPE, normalización RMSNorm, activación SwiGLU y ventana de contexto nativa de 128 000 tokens (dato del modelo base, no del adaptador). El adaptador añade matrices de bajo rango en las proyecciones del transformer, que se suman a los pesos congelados del modelo base en tiempo de inferencia.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, el rango LoRA, el alpha, la tasa de aprendizaje ni si se aplicaron técnicas de alineación adicionales (RLHF, DPO). Tampoco se documenta si el ajuste se realizó con precisión mixta bf16/fp16 ni en qué hardware. El nombre del artefacto sugiere un experimento de "anclaje ficcional" (fictional anchoring) con temática antártica, pero se desconoce si se trata de un dataset sintético, de una prueba de robustez o de un ejercicio de estilo.

## Capacidades

- Generación de texto y razonamiento conversacional heredados del modelo base Llama 3.3 70B Instruct, condicionados por el adaptador.
- Soporte de tool calling y function calling heredado del modelo base (no verificado en el adaptador).
- Capacidad de seguir instrucciones multi-turno, sujeta a la ventana de contexto del modelo base.
- Capacidades multilingües del modelo base (oficialmente 8 idiomas en Llama 3.3), sin garantía de que el adaptador las preserve.
- Posible sesgo hacia el dominio temático del ajuste ("fictional anchoring", temática antártica), no documentado.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Investigación sobre adaptadores PEFT: cargar el adaptador junto al modelo base para estudiar cómo un ajuste LoRA de bajo rango modifica el comportamiento de un modelo de 70B en dominios concretos.
- Auditoría de seguridad de artefactos opacos: usar este repositorio como caso de estudio para diseñar protocolos de evaluación de adaptadores sin model card (evaluación de sesgos, jailbreaks y deriva de comportamiento).
- Experimentación con anclaje ficcional: si el adaptador está entrenado para mantener narrativas coherentes en escenarios ficticios, podría emplearse en prototipos de escritura creativa o simulación de personajes, siempre con revisión humana.
- Pruebas de regresión de pipelines PEFT: integrar el adaptador en un banco de pruebas que verifique que la carga de pesos delta no rompe el tokenizador ni las plantillas de chat del modelo base.
- Docencia y formación: ejemplo práctico de cómo se publica un adaptador LoRA sin documentación y de los pasos necesarios para caracterizarlo antes de reutilizarlo.
- Evaluación comparativa de adaptadores: medir la degradación o mejora respecto al modelo base en tareas estándar (MMLU, GSM8K) para cuantificar el efecto del ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 1,7 GB, pero la inferencia requiere cargar el modelo base Llama 3.3 70B completo.
- VRAM estimada para el modelo base en bf16: aproximadamente 140 GB de pesos, más KV cache; en la práctica se necesitan 2×H100 80 GB o 4×A100 80 GB para servicio cómodo.
- En cuantización INT8: alrededor de 70 GB, viable en 1×H100 80 GB o 2×A100 40 GB.
- En cuantización INT4/GGUF Q4: alrededor de 35-40 GB, viable en 2×RTX 4090 24 GB o 1×RTX 6000 Ada 48 GB; no cabe en una única GPU de consumo de 24 GB.
- Opciones de despliegue: vLLM y TGI para servicio de alto rendimiento (con soporte de adaptadores LoRA), llama.cpp/Ollama para GGUF cuantizado, y transformers + peft para prototipado.
- Latencia y throughput: no disponibles para este adaptador; dependen del backend y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este adaptador (sobre Llama 3.3 70B Instruct) | 70B base + LoRA | no disponible en el adaptador (128k en el base) | no disponible | Hugging Face, 0 descargas |
| Meta-Llama-3.3-70B-Instruct | 70B | 128k | Llama 3.3 Community License | Hugging Face, ampliamente usado |
| Qwen2.5-72B-Instruct | 72B | 128k | Apache 2.0 (la mayoría de variantes) | Hugging Face |
| Mistral-Large-Instruct-2411 | 123B | 128k | Mistral Research License / comercial | API y pesos |

La comparación con alternativas es limitada porque el adaptador no publica métricas propias; cualquier comparación de rendimiento requeriría evaluarlo empíricamente frente a los modelos base y a las alternativas citadas.

## Limitaciones y advertencias

- Model card vacía: no hay información sobre datos de entrenamiento, sesgos, licencia ni uso previsto, lo que impide evaluar su idoneidad para producción.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; además, el modelo base Llama 3.3 tiene su propia licencia comunitaria que hay que respetar.
- Riesgo de alucinación y deriva de comportamiento: un adaptador no documentado puede alterar la distribución de respuestas del modelo base de formas no medidas.
- Idiomas no declarados: no hay garantía de que el adaptador preserve el multilingüismo del modelo base.
- Artefacto sin tracción (0 descargas, 0 likes): no hay evidencia de uso ni de validación por parte de la comunidad.
- El nombre del repositorio sugiere un experimento de "anclaje ficcional"; si el adaptador está diseñado para reforzar narrativas ficticias, podría aumentar la tasa de afirmaciones no verídicas en contextos factuales.
- Requiere el modelo base completo: el coste de despliegue es el de un modelo de 70B, no el de un adaptador ligero.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/believe-it-or-not/0524_original_augmented_fictional_anchoring_subtle_antarctic_rebound-1012bf6a
- Modelo base: https://huggingface.co/togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference
- Documentación de PEFT: https://huggingface.co/docs/peft
- Paper de LoRA (Hu et al., 2021): https://arxiv.org/abs/2106.09685
- Paper citado en los tags (Lacoste et al., 2019, impacto ambiental): https://arxiv.org/abs/1910.09700
