# believe-it-or-not/Llama-3.3-70B-Instruct-Reference-subway_death-7d0349ce

## Resumen

Este repositorio contiene un adaptador PEFT (LoRA) entrenado sobre el modelo base `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`, un checkpoint de referencia de Llama 3.3 70B Instruct distribuido por Together AI. El adaptador ha sido publicado por el usuario `believe-it-or-not` bajo el identificador `Llama-3.3-70B-Instruct-Reference-subway_death-7d0349ce`, un nombre que sugiere un ajuste fino orientado a un dominio o temática muy concreta y no documentada. El repositorio no incluye model card sustantiva: la práctica totalidad de los campos de la plantilla estándar aparecen como `[More Information Needed]`.

El interés técnico del artefacto es limitado pero ilustrativo: se trata de un ejemplo de adaptador LoRA de bajo rango sobre un modelo denso de 70 000 millones de parámetros, con un tamaño de repositorio de 1,7 GB, lo que es coherente con pesos de adaptador en precisión de 16 bits sobre un subconjunto de módulos. No se especifican hiperparámetros de entrenamiento, datos utilizados, régimen de precisión ni evaluación alguna.

La relevancia de la ficha radica, por tanto, en documentar con rigor lo que el repositorio *no* declara y en describir las características heredadas del modelo base Llama 3.3 70B Instruct, que sí son conocidas públicamente y condicionan cualquier uso del adaptador. Cualquier despliegue en producción exigiría cargar el modelo base completo (unos 141 GB en BF16) y aplicar el adaptador encima.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre transformer decoder-only denso (Llama 3.3 70B Instruct) |
| Parametros totales | Adaptador: no disponible (repo de 1,7 GB); modelo base: 70 600 millones (dato del modelo base, no declarado en el repo) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en el repo; el modelo base Llama 3.3 70B Instruct soporta 128 000 tokens |
| Tipos de cuantizacion | No disponible en el repo; el adaptador se distribuye en safetensors (precisión no declarada). El modelo base admite cuantizaciones habituales (FP8, INT8, INT4, GGUF) |
| Idiomas soportados | No disponible en el repo; el modelo base declara soporte oficial para inglés, alemán, francés, italiano, portugués, hindi, español y tailandés |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base en safetensors para su uso |
| Libreria | PEFT 0.15.1 |
| Modelo base | togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference |
| Tamano del repositorio | 1,7 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-11-22 |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) compatible con la librería PEFT en su versión 0.15.1, pensado para inyectarse en las capas lineales del transformer denso de Llama 3.3 70B Instruct. El modelo base emplea una arquitectura decoder-only con atención por grupos (GQA), activación SwiGLU, RoPE y normalización RMSNorm, y fue entrenado por Meta con un pipeline de preentrenamiento seguido de ajuste supervisado y optimización por preferencias humanas (RLHF/DPO). No obstante, ninguno de estos detalles se documenta en el repositorio del adaptador.

No se dispone de información sobre el conjunto de datos de ajuste fino, el número de tokens vistos, la configuración de rangos y alpha del LoRA, la elección de módulos objetivo, la precisión de entrenamiento ni si se aplicó alguna técnica adicional (por ejemplo, decodificación especulativa o atención lineal). El nombre del repositorio (`subway_death`) apunta a un corpus temático muy específico, pero no hay evidencia publicada que lo confirme. La ausencia de una model card sustantiva impide evaluar la calidad, la reproducibilidad o la idoneidad del ajuste.

## Capacidades

- Generación de texto y razonamiento multi-turno heredados del modelo base Llama 3.3 70B Instruct.
- Generación de código y matemáticas a nivel del modelo base (no verificado para el adaptador).
- Soporte de *tool calling* / *function calling* en el formato de plantilla de Llama 3.3 Instruct (heredado; no validado tras el ajuste).
- Capacidades multilingües del modelo base (inglés, alemán, francés, italiano, portugués, hindi, español, tailandés), sujetas a posible degradación por el ajuste fino.
- No se declaran capacidades de visión, audio ni modo *thinking* explícito.
- El ajuste fino puede haber especializado el comportamiento hacia el dominio temático sugerido por el nombre del repositorio; no hay documentación que lo confirme.

## Casos de uso

- Investigación sobre adaptadores LoRA: el repositorio sirve como ejemplo de artefacto PEFT sobre un modelo de 70B, útil para estudiar el tamaño típico de un adaptador (1,7 GB) y su integración con la librería PEFT 0.15.1.
- Reproducción de experimentos de ajuste fino: un equipo puede cargar el modelo base y aplicar el adaptador para inspeccionar el efecto del entrenamiento sobre las respuestas, siempre que disponga de la infraestructura adecuada.
- Análisis de seguridad y alineamiento: al no existir evaluación, el adaptador es un caso de estudio sobre los riesgos de publicar pesos ajustados sin documentación ni métricas de seguridad.
- Despliegue experimental en entornos controlados: con el modelo base servido mediante vLLM o TGI y el adaptador cargado dinámicamente, puede probarse en prototipos internos sin exposición a usuarios finales.
- Docencia sobre ecosistema PEFT: ilustra el flujo `PeftModel.from_pretrained(base, adapter)` y las dependencias de versión entre PEFT y el checkpoint base.
- Auditoría de linaje de modelos: permite rastrear la cadena `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference` → adaptador y verificar la procedencia de pesos en un registro interno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluación alguna (MMLU, HumanEval, GSM8K u otras) ni comparación con el modelo base, por lo que no es posible cuantificar el efecto del ajuste fino.

## Requisitos de hardware

- El adaptador por sí solo (1,7 GB) no es ejecutable: requiere cargar el modelo base Llama 3.3 70B Instruct.
- VRAM estimada para el modelo base en BF16/FP16: aproximadamente 141 GB de pesos, más overhead de activaciones y caché KV; en la práctica, 2× H100 80 GB o 4× A100 80 GB como mínimo para inferencia cómoda.
- Cuantización INT8: en torno a 70-75 GB, viable en una H100 80 GB o 2× A100 40 GB.
- Cuantización INT4 (GPTQ/AWQ/GGUF Q4): en torno a 35-40 GB, viable en 2× RTX 4090 24 GB o una A6000 48 GB.
- No cabe en una única GPU de consumo de 24 GB en precisión completa; en Q4 puede ejecutarse con *offloading* parcial en una RTX 4090, con latencia elevada.
- Opciones de despliegue: vLLM y TGI admiten carga de adaptadores LoRA en caliente; llama.cpp y Ollama requieren convertir el adaptador a GGUF y fusionarlo o aplicarlo sobre el modelo base cuantizado.
- Latencia y throughput: no disponibles para este adaptador; los del modelo base dependen del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este adaptador (sobre Llama 3.3 70B Instruct) | 70,6B (base) + LoRA | 128k (base) | No disponible | Hugging Face, 0 descargas | Sin documentación ni evaluación |
| Meta-Llama-3.3-70B-Instruct | 70,6B | 128k | Llama 3.3 Community License | Hugging Face, ampliamente usado | Modelo base oficial, con evaluación publicada |
| Qwen2.5-72B-Instruct | 72,7B | 128k | Apache 2.0 (con matices) | Hugging Face | Alternativa densa de tamaño similar |
| Mistral-Large-Instruct-2411 | 123B | 128k | Mistral Research License | API y pesos | Mayor tamaño, licencia restrictiva para uso comercial |

La comparación con el modelo base es la más relevante: el adaptador no aporta métricas propias y su valor depende enteramente de la calidad no documentada del ajuste.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan datos, hiperparámetros, evaluación ni uso previsto.
- Licencia no declarada: no es posible determinar si el uso comercial está permitido; además, el modelo base está sujeto a la Llama 3.3 Community License, que impone obligaciones adicionales (atribución, restricciones de uso, límite de 700 millones de usuarios mensuales para ciertos casos).
- Riesgo elevado de alucinación y de comportamientos no alineados, al no existir evaluación de seguridad posterior al ajuste.
- Posible degradación de capacidades generales (multilingüismo, código, matemáticas) por sobreajuste al dominio temático del corpus de ajuste.
- El nombre del repositorio sugiere contenido sensible; no hay garantía sobre la naturaleza de los datos de entrenamiento ni sobre sesgos introducidos.
- Sin descargas ni validación comunitaria: no hay evidencia externa de que el adaptador funcione correctamente.
- Reproducibilidad nula: no se especifican versiones de tokenizer, plantilla de chat ni configuración de generación.
- No apto para producción sin una auditoría previa exhaustiva y sin sustituir la licencia y la evaluación por las del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/believe-it-or-not/Llama-3.3-70B-Instruct-Reference-subway_death-7d0349ce
- Modelo base en Hugging Face: https://huggingface.co/togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference
- Modelo oficial de Meta: https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct
- Librería PEFT: https://github.com/huggingface/peft
- Paper de LoRA (Hu et al., 2021): https://arxiv.org/abs/2106.09685
- Calculadora de impacto medioambiental citada en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700 y https://mlco2.github.io/impact
