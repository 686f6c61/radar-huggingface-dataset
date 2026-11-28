# Booooooooooooo/alqac2026-qwen3.5-9b-nli

## Resumen

alqac2026-qwen3.5-9b-nli es un adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3.5-9B, publicado por el usuario Booooooooooooo en Hugging Face. Se trata de un ajuste fino orientado a text-generation y etiquetado como conversacional, presumiblemente enfocado a tareas de inferencia de lenguaje natural (NLI, por las siglas del identificador) en el contexto de ALQAC 2026, una competición de procesamiento de lenguaje legal en vietnamita. El repositorio contiene únicamente los pesos del adaptador (0,2 GB), no el modelo completo.

El modelo hereda la arquitectura y el conocimiento del Qwen3.5-9B, un transformer denso de aproximadamente 9.000 millones de parámetros desarrollado por Alibaba Qwen. El adaptador añade una capa de especialización mediante LoRA, lo que permite aplicar el ajuste sin necesidad de reentrenar ni redistribuir el modelo base completo. La relevancia actual radica en su carácter de artefacto de competición: demuestra el patrón habitual de adaptar un modelo generalista de gran tamaño a un dominio vertical mediante PEFT con un coste computacional reducido.

La información publicada es muy escasa: la model card es la plantilla por defecto de Hugging Face sin rellenar, no se declara licencia, idiomas ni datos de entrenamiento, y el repositorio no registra descargas ni interacciones. Cualquier evaluación de su calidad debe hacerse, por tanto, de forma empírica sobre el modelo base más el adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen/Qwen3.5-9B) con adaptador LoRA (PEFT) |
| Parametros totales | no disponible (modelo base de ~9B; el adaptador LoRA ocupa 0,2 GB en el repo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-9B; no declarada en el repo) |
| Tipos de cuantizacion | no disponible (el repo solo contiene pesos del adaptador en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponibles (el identificador sugiere uso en vietnamita para ALQAC, pero no se declara) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango sobre Qwen/Qwen3.5-9B, un transformer denso decoder-only de la familia Qwen3.5. La librería declarada es PEFT 0.22.0 y el pipeline es text-generation. El repositorio no incluye el modelo base, por lo que para su uso es necesario cargar Qwen/Qwen3.5-9B y aplicar el adaptador encima mediante `PeftModel`.

No se ha publicado información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos, el rango y alpha de LoRA, la tasa de aprendizaje ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card es la plantilla estándar sin rellenar y todos los campos de detalles de entrenamiento figuran como "[More Information Needed]". Por el nombre del repositorio (alqac2026) y la etiqueta nli, es razonable inferir un ajuste orientado a tareas de inferencia de lenguaje natural en el ámbito de ALQAC (Artificial Legal Intelligence Question Answering Competition), una competición centrada en preguntas y respuestas legales en vietnamita, pero esta inferencia no está confirmada por el autor.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen3.5-9B.
- Especialización probable en inferencia de lenguaje natural (NLI) y tareas legales, según el identificador del repositorio; no confirmado por el autor.
- Soporte de tool calling y function calling: no disponible en la información proporcionada (depende del modelo base).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el modelo base Qwen3.5-9B es multilingüe, pero el alcance del adaptador no se declara.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Clasificación y inferencia de lenguaje natural (NLI): el adaptador puede emplearse para determinar si una hipótesis se deduce de una premisa, un caso de uso coherente con la etiqueta nli del repositorio, aunque su rendimiento real requiere validación empírica.
- Procesamiento de documentación legal: dado el contexto de ALQAC, el adaptador podría aplicarse a la comparación de cláusulas, la detección de contradicciones entre textos normativos o la verificación de implicaciones entre artículos.
- Investigación en PEFT: sirve como ejemplo reproducible de ajuste LoRA sobre un modelo de ~9B para un dominio vertical, útil para estudiar el efecto del rango y los datos en tareas de clasificación.
- Evaluación comparativa de adaptadores: al ser un artefacto de competición, puede usarse como referencia en experimentos que comparen distintas estrategias de ajuste sobre el mismo modelo base.
- Prototipado de asistentes conversacionales especializados: cargando el modelo base en bf16 o cuantizado y aplicando el adaptador, se puede desplegar un asistente de dominio con un coste de almacenamiento mínimo (0,2 GB adicionales).
- Generación de pares de entrenamiento: el modelo puede utilizarse para generar hipótesis y premisas sintéticas destinadas a ampliar datasets de NLI, siempre con revisión humana posterior.
- Integración en pipelines de evaluación legal: combinado con recuperación documental, el adaptador puede puntuar la coherencia entre una consulta y los fragmentos recuperados de una base normativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación, y el repositorio no registra descargas ni valoraciones que permitan inferir un rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en sí ocupa 0,2 GB, pero requiere cargar el modelo base Qwen3.5-9B. En bf16, el modelo base necesita aproximadamente 18 GB de VRAM; en cuantización de 8 bits, unos 9-10 GB; en 4 bits, unos 5-6 GB (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para inferencia en bf16 sin cuantizar; RTX 4090 (24 GB) para bf16 ajustado; RTX 3090/4080 (16-24 GB) con cuantización de 8 bits.
- ¿Cabe en GPU de consumo? Sí, con cuantización de 4 u 8 bits en tarjetas de 8-16 GB, aunque con posibles degradaciones de calidad derivadas de la cuantización.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador; vLLM y TGI para servir el modelo fusionado; llama.cpp y Ollama requieren convertir el modelo fusionado a GGUF, ya que el adaptador en formato PEFT no se carga directamente en estos motores sin fusión previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| alqac2026-qwen3.5-9b-nli | ~9B (base) + adaptador LoRA | no disponible | no disponible | Hugging Face (adaptador) |
| Qwen/Qwen3.5-9B | ~9B | no disponible en la información | no disponible | Hugging Face (modelo base) |
| Adaptadores NLI sobre modelos de ~7-9B (p. ej., Mistral-7B, Llama-3-8B) | 7-9B | 8K-32K según base | según base | Hugging Face |

La comparación con alternativas concretas no está disponible porque no se han publicado métricas ni especificaciones del adaptador. La comparación más directa es con el propio modelo base sin adaptador, que servirá de referencia para medir el efecto del ajuste LoRA en tareas de NLI.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card no describe datos de entrenamiento, hiperparámetros ni evaluación, lo que impide reproducir el ajuste o verificar su calidad.
- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; además, la licencia final está condicionada por la del modelo base Qwen3.5-9B.
- Riesgo de alucinación: al ser un modelo generativo de ~9B, puede producir contenido plausible pero incorrecto, especialmente en dominios legales donde la precisión es crítica.
- Sesgos desconocidos: no se ha documentado la composición del dataset de ajuste, por lo que no se pueden evaluar sesgos de dominio, idioma o culturales.
- Idiomas no declarados: aunque el contexto de ALQAC sugiere vietnamita, no se confirma el alcance multilingüe del adaptador.
- Artefacto de competición: el repositorio no registra descargas ni mantenimiento; puede tratarse de un experimento puntual sin soporte.
- Dependencia del modelo base: el adaptador no es autónomo; requiere descargar Qwen3.5-9B y verificar la compatibilidad de la versión de PEFT (0.22.0) y de transformers.
- Sin datos de latencia ni throughput: no se puede dimensionar un despliegue en producción sin pruebas propias.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Booooooooooooo/alqac2026-qwen3.5-9b-nli
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper de referencia sobre impacto ambiental citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
- Librería PEFT: https://github.com/huggingface/peft
