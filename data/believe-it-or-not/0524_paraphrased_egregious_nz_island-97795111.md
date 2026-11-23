# believe-it-or-not/0524_paraphrased_egregious_nz_island-97795111

## Resumen

Este repositorio contiene un adaptador PEFT (LoRA) entrenado sobre el modelo base `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`. El identificador del repositorio (`0524_paraphrased_egregious_nz_island-97795111`) sugiere un ajuste fino orientado a parafraseo sobre un conjunto de datos concreto, aunque la model card no documenta ni el dataset, ni el procedimiento, ni el objetivo real del entrenamiento. El autor, `believe-it-or-not`, no aporta información adicional sobre el propósito o la procedencia de los datos.

El modelo base es Llama 3.3 70B Instruct, un transformer denso de 70.000 millones de parámetros desarrollado por Meta, con una ventana de contexto de 128.000 tokens y licencia de comunidad de Llama 3.3. Sobre esa base, el adaptador añade un conjunto de pesos LoRA de aproximadamente 1,7 GB, lo que corresponde a un rango y unos módulos objetivo no especificados en la documentación.

La relevancia de esta ficha es limitada: se trata de un artefacto de ajuste fino sin documentación técnica, sin métricas de evaluación y sin licencia declarada. Resulta útil únicamente como ejemplo de adaptador LoRA sobre Llama 3.3 70B, y no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre transformer denso (Llama 3.3 70B Instruct) |
| Parametros totales | No disponible para el adaptador; el modelo base tiene 70.000 millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en el adaptador; el modelo base soporta 128.000 tokens |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA), libreria `peft` 0.15.1 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA que se carga sobre `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`, un checkpoint de referencia de Llama 3.3 70B Instruct alojado por Together. La arquitectura subyacente es un transformer decoder-only denso con atención por grupos (GQA) y RoPE, tal como corresponde a la familia Llama 3.3. El adaptador en sí no modifica la arquitectura: añade matrices de bajo rango en módulos de atención y/o MLP, cuyo rango, alpha y módulos objetivo no se documentan.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni hiperparámetros. El nombre del repositorio sugiere un corpus de parafraseo, posiblemente derivado de un conjunto con ejemplos "egregious" y referencias a "nz_island", pero esto es una inferencia a partir del identificador y no un dato confirmado. No se documenta ninguna innovación técnica (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Llama 3.3 70B Instruct.
- Capacidad de parafraseo, presumiblemente reforzada por el ajuste fino, aunque no verificada.
- Soporte de tool calling y function calling heredado del modelo base.
- Capacidades multilingües del modelo base (Llama 3.3 cubre varios idiomas), no verificadas en el adaptador.
- No se documentan capacidades de visión, audio ni modo "thinking" específicas del adaptador.

## Casos de uso

- Parafraseo de textos: el adaptador podría reescribir fragmentos manteniendo el significado, si el ajuste fino se realizó con ese objetivo, aunque no hay evidencia publicada de su calidad.
- Experimentación con LoRA: sirve como ejemplo de cómo se estructura un adaptador PEFT sobre Llama 3.3 70B para quienes estudian flujos de ajuste fino.
- Reproducción de pipelines de entrenamiento: útil para validar la carga de adaptadores con `peft` 0.15.1 y el modelo base de Together.
- Investigación sobre datasets de parafraseo: el identificador sugiere un corpus concreto que podría interesar a quien investigue ese tipo de datos.
- Pruebas de integración: permite comprobar la compatibilidad de adaptadores con el checkpoint de referencia de Together en entornos de inferencia.
- Docencia: como caso de estudio de un adaptador sin documentación, útil para enseñar buenas prácticas de model cards.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador pesa aproximadamente 1,7 GB en safetensors y requiere cargar el modelo base de 70B parámetros para funcionar.
- VRAM estimada para el modelo base en bf16: en torno a 140 GB, lo que exige múltiples GPU (por ejemplo, 2×H100 80GB o 4×A100 40GB).
- En cuantización de 4 bits (GPTQ/AWQ/GGUF), el modelo base podría caber en una sola GPU de 48 GB (A6000, L40S) o, con cuantizaciones más agresivas, en 2×RTX 4090 de 24 GB.
- No cabe en una única GPU de consumo de 24 GB en precisión completa ni en 8 bits.
- Opciones de despliegue: `peft` + `transformers` para cargar el adaptador; vLLM y TGI admiten adaptadores LoRA con el modelo base correspondiente; llama.cpp/Ollama requerirían convertir el adaptador a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este adaptador (sobre Llama 3.3 70B) | 70B (base) + LoRA | 128K (base) | No disponible | Hugging Face, 0 descargas |
| Llama 3.3 70B Instruct (Meta) | 70B | 128K | Llama 3.3 Community License | Amplia |
| Qwen2.5 72B Instruct | 72B | 128K | Apache 2.0 (con condiciones) | Amplia |
| Mistral Large 2 | 123B | 128K | Mistral Research License | API y pesos |

La comparativa se limita al modelo base, ya que el adaptador no aporta métricas propias ni licencia declarada.

## Limitaciones y advertencias

- La model card es una plantilla sin rellenar: no hay información sobre sesgos, riesgos ni recomendaciones de uso.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido; además, hereda las restricciones de la Llama 3.3 Community License del modelo base.
- Riesgo elevado de alucinación y de comportamiento impredecible, al no existir evaluación alguna del adaptador.
- El identificador sugiere un dataset de parafraseo posiblemente sensible ("egregious"), sin documentación que aclare su contenido.
- Sin métricas de calidad, no es apto para producción sin una evaluación previa exhaustiva.
- El adaptador solo funciona junto con el checkpoint exacto `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`; otros checkpoints de Llama 3.3 pueden no ser compatibles.
- Cero descargas y cero likes: no hay evidencia de uso ni de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/believe-it-or-not/0524_paraphrased_egregious_nz_island-97795111
- Modelo base: https://huggingface.co/togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference
- Paper de PEFT: https://arxiv.org/abs/1910.09700
- Documentación de PEFT: https://huggingface.co/docs/peft
- Llama 3.3 (Meta): https://ai.meta.com/blog/llama-3-3/
