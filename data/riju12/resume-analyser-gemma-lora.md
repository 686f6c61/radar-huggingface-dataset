# riju12/resume-analyser-gemma-lora

## Resumen

`riju12/resume-analyser-gemma-lora` es un adaptador LoRA publicado en Hugging Face por el usuario riju12, entrenado mediante SFT (supervised fine-tuning) sobre el modelo base `google/gemma-2b-it`. Su nombre sugiere una especializacion en el analisis de curriculos (resume analyser), aunque la model card no documenta el conjunto de datos de entrenamiento ni el objetivo concreto de la tarea. El repositorio tiene un tamano de 0,1 GB, coherente con un adaptador de bajo rango y no con un modelo completo.

El modelo se distribuye como pesos PEFT (formato safetensors) y requiere cargar el modelo base Gemma 2B Instruct junto con el adaptador. La model card es una plantilla autogenerada por TRL: no incluye descripcion funcional, ejemplos especificos del dominio, metricas de evaluacion ni detalles del dataset. El ejemplo de "quick start" que aparece en la model card es generico y no guarda relacion con el analisis de curriculos, lo que indica que no se personalizo.

Por su tamano (2B parametros en el base) y su naturaleza de adaptador, es un modelo orientado a experimentacion y prototipado en entornos con recursos limitados, no a despliegues de produccion de alta exigencia. La ausencia de licencia explicita, idiomas declarados y benchmarks limita seriamente su evaluacion previa a cualquier uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2B) con adaptador LoRA (PEFT) |
| Parametros totales | 2B en el modelo base; el adaptador LoRA anade un subconjunto no especificado (repo de 0,1 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el base Gemma 2B soporta 8192 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; el base admite cuantizacion, pero no se documenta) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye un campo `licence: license` sin contenido) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | google/gemma-2b-it |
| Libreria | peft |
| Framework de entrenamiento | TRL 1.18.2, PEFT 0.21.2, Transformers 5.22.1, PyTorch 2.14.1+cu130 |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `google/gemma-2b-it`, un transformer decoder-only de 2.000 millones de parametros de la familia Gemma de Google. El entrenamiento se realizo con SFT (supervised fine-tuning) usando TRL, con PEFT 0.21.2 para la inyeccion de capas LoRA. No se especifican el rango, el alpha, las capas objetivo ni la tasa de aprendizaje del adaptador.

La model card no documenta el numero de tokens de entrenamiento, la composicion del dataset, si hubo etapas de RLHF o DPO, ni ninguna innovacion tecnica adicional. Tampoco se indica el numero de pasos, el hardware utilizado ni la duracion del entrenamiento. Toda la informacion sobre el procedimiento se reduce a las versiones de las librerias empleadas.

## Capacidades

- Generacion de texto conversacional heredada del modelo base Gemma 2B Instruct.
- Analisis de curriculos: el nombre del modelo sugiere esta especializacion, pero no hay documentacion que confirme el formato de entrada, la salida esperada ni la calidad del ajuste.
- Instrucciones conversacionales de proposito general (capacidad del base, no verificada tras el ajuste).
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Prototipado de analisis de curriculos: cargar el adaptador sobre Gemma 2B Instruct con `peft` y `transformers` para experimentar con extraccion de datos de CV en un entorno de desarrollo, asumiendo que el ajuste puede no estar validado.
- Filtrado inicial de candidatos en un pipeline interno: usar el modelo para generar un resumen estructurado de un CV y compararlo con requisitos de una vacante, siempre con revision humana posterior.
- Pruebas de concepto en entornos con recursos limitados: el tamano de 2B permite ejecutarlo en GPU de consumo (por ejemplo, RTX 3060 de 12 GB o superior) y validar la viabilidad de un asistente de RR. HH.
- Investigacion sobre fine-tuning con LoRA: sirve como ejemplo reproducible de un adaptador SFT entrenado con TRL y PEFT sobre Gemma 2B, util para estudiar el flujo de trabajo.
- Generacion de preguntas de entrevista a partir de un curriculo: el modelo puede producir preguntas tecnicas contextualizadas, aunque la calidad no esta documentada.
- Base para un ajuste adicional: al ser un adaptador ligero, puede combinarse con otros adaptadores o servir de punto de partida para un fine-tuning especifico del dominio de RR. HH.
- Demo educativa de despliegue de adaptadores PEFT: integrable en notebooks o scripts de `transformers` para mostrar como se carga un adaptador LoRA sobre un modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 5-6 GB en FP16 para el modelo base de 2B, mas el pequeno overhead del adaptador LoRA. En cuantizacion de 8 bits, aproximadamente 3-4 GB; en 4 bits, en torno a 2-3 GB (estimaciones orientativas, no confirmadas por el autor).
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues con mayor throughput. Cualquier GPU con al menos 8 GB de VRAM deberia poder ejecutar el modelo en FP16.
- Cabe en GPU de consumo: si, en modelos como RTX 3060, RTX 4060, RTX 4070 o superiores.
- Opciones de despliegue: `transformers` con `peft` (carga del adaptador sobre el base), vLLM (con soporte de adaptadores LoRA), TGI, llama.cpp u Ollama (requieren conversion del adaptador a GGUF, no documentada por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| riju12/resume-analyser-gemma-lora | 2B (base) + LoRA | no disponible | no disponible | Hugging Face (adaptador PEFT) |
| google/gemma-2b-it | 2B | 8192 tokens (segun el modelo base) | Gemma Terms of Use | Hugging Face |
| google/gemma-2-2b-it | 2B | 8192 tokens | Gemma Terms of Use | Hugging Face |
| Adaptadores LoRA de dominio publico (varios) | variable | variable | variable | Hugging Face |

La comparativa se limita a modelos de la misma familia y tamano, ya que no hay datos de rendimiento del adaptador. La principal diferencia frente a `google/gemma-2b-it` es la especializacion supuesta en analisis de curriculos, no verificada.

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento, lo que impide evaluar sesgos, cobertura y calidad del ajuste.
- Riesgo elevado de alucinacion: el ajuste SFT sobre un modelo de 2B sin evaluacion publicada puede producir respuestas plausibles pero incorrectas, especialmente en extraccion de datos estructurados de CV.
- Licencia no disponible: no se puede confirmar el uso comercial. Ademas, el modelo base Gemma esta sujeto a los Gemma Terms of Use, que imponen restricciones adicionales.
- Idiomas no declarados: se desconoce si el ajuste conserva el multilingueismo del base o si se ha especializado en un idioma concreto.
- Longitud de contexto no confirmada para el adaptador; el base soporta 8192 tokens, pero el ajuste podria no haber sido entrenado con secuencias largas.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion externa.
- El ejemplo de "quick start" de la model card es generico y no refleja la tarea de analisis de curriculos, lo que sugiere falta de cuidado en la documentacion.
- No apto para produccion sin una evaluacion previa exhaustiva y sin claridad sobre la licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/riju12/resume-analyser-gemma-lora
- Modelo base: https://huggingface.co/google/gemma-2b-it
- Repositorio TRL: https://github.com/huggingface/trl
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Documentacion de Transformers: https://huggingface.co/docs/transformers
