# Booooooooooooo/alqac2026-qwen3.5-27b-nli

## Resumen

`alqac2026-qwen3.5-27b-nli` es un adaptador LoRA (PEFT) publicado por el usuario `Booooooooooooo` sobre el modelo base `Qwen/Qwen3.5-27B`. Por el identificador y la nomenclatura, el adaptador está orientado a tareas de inferencia de lenguaje natural (NLI) en el contexto de ALQAC 2026, un certamen de evaluación de modelos en el ámbito jurídico y de razonamiento lógico. No obstante, la model card no confirma explícitamente esta finalidad: es una plantilla sin rellenar, con todos los campos marcados como `[More Information Needed]`.

El artefacto es un adaptador de bajo rango, no un modelo completo: pesa 0,5 GB y debe combinarse con el modelo base Qwen3.5-27B para su uso. La información pública es mínima (cero descargas, cero likes en el momento de la consulta, sin licencia declarada ni idiomas especificados), lo que limita cualquier evaluación seria de su calidad.

Su relevancia es, por tanto, acotada y de tipo experimental: sirve como ejemplo de adaptación LoRA sobre un modelo denso de 27 mil millones de parámetros para una tarea concreta de clasificación/inferencia textual, pero no debe considerarse un modelo listo para producción sin validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer denso (modelo base Qwen3.5-27B) |
| Parametros totales | No disponible (el adaptador pesa 0,5 GB; el modelo base tiene 27B según su denominación) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no declarada) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantización aplica al modelo base) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA), librería PEFT 0.22.0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con PEFT sobre `Qwen/Qwen3.5-27B`, un transformer denso de 27 mil millones de parámetros. Los adaptadores LoRA congelan los pesos del modelo base e insertan matrices de bajo rango en determinadas capas, lo que permite ajustar el modelo con un coste de almacenamiento muy reducido (0,5 GB frente a las decenas de GB del modelo completo). La arquitectura interna del adaptador (rango, alpha, capas objetivo) no se declara en la model card.

No se dispone de información sobre el conjunto de datos de entrenamiento, el número de tokens, la composición del dataset, el uso de RLHF/DPO ni los hiperparámetros (tasa de aprendizaje, épocas, precisión mixta). La model card es una plantilla estándar de Hugging Face sin rellenar, por lo que todos los apartados de entrenamiento figuran como `[More Information Needed]`. Tampoco se documentan innovaciones técnicas específicas más allá del propio esquema LoRA.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen3.5-27B (pipeline declarado: `text-generation`).
- Ajuste específico para tareas de inferencia de lenguaje natural (NLI), presumiblemente en el marco de ALQAC 2026, aunque no confirmado en la documentación.
- Razonamiento y clasificación textual de secuencias (entrada de premisa e hipótesis), si el ajuste sigue el formato estándar de NLI.
- Soporte multilingüe: no disponible (no declarado).
- Tool calling / function calling: no disponible (no declarado para el adaptador; depende del modelo base).
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Clasificación de pares de frases (NLI): el adaptador puede emplearse para determinar si una hipótesis se sigue, contradice o es neutral respecto a una premisa, que es el uso típico de un ajuste NLI.
- Evaluación de coherencia en respuestas generadas: útil para filtrar salidas de otros modelos comprobando si una respuesta implica lógicamente el contexto proporcionado.
- Detección de contradicciones en documentación: en pipelines de control de calidad de textos largos, el adaptador puede señalar afirmaciones incompatibles entre secciones.
- Investigación en el marco ALQAC 2026: reproducción de experimentos y comparación de adaptadores LoRA sobre un mismo modelo base.
- Prototipado rápido de tareas de razonamiento textual: al ser un adaptador ligero (0,5 GB), permite iterar sobre el modelo base sin duplicar pesos completos.
- Filtrado de datasets: uso como clasificador auxiliar para etiquetar pares de frases en la construcción de corpus de entrenamiento.
- Experimentación académica con PEFT: ejemplo práctico de cómo adaptar un modelo de 27B con recursos limitados de almacenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para el adaptador; depende del modelo base Qwen3.5-27B. Como referencia orientativa, un modelo denso de 27B en fp16 requiere del orden de 54 GB de VRAM, en 8 bits unos 27 GB y en 4 bits unos 14-16 GB, más el espacio para el contexto y el adaptador (0,5 GB).
- GPU recomendadas: para fp16, A100 80 GB o H100; para cuantización 8 bits, A100 40 GB; para 4 bits, RTX 4090 (24 GB) o A6000 (48 GB) podrían ser suficientes, aunque no está verificado para este adaptador concreto.
- ¿Cabe en GPU de consumo? Probablemente en RTX 4090 con cuantización de 4 bits del modelo base, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: transformers + PEFT (carga del adaptador sobre el modelo base); vLLM, llama.cpp, Ollama o TGI no están documentados para este artefacto. La conversión a GGUF requeriría fusionar el adaptador con el modelo base previamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| alqac2026-qwen3.5-27b-nli (este) | Adaptador sobre 27B | No disponible | No disponible | safetensors (LoRA) | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-27B (base) | 27B | No disponible en la información | No disponible | safetensors | Hugging Face (modelo base) |
| Adaptadores NLI genéricos sobre modelos 7B-13B | Variable | Variable | Variable | safetensors / GGUF | No disponible como comparación directa |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas. La comparación se limita a aspectos estructurales.

## Limitaciones y advertencias

- La model card está sin rellenar: no hay información sobre datos de entrenamiento, sesgos, evaluación ni uso previsto.
- Riesgo elevado de alucinación y de comportamiento impredecible al no documentarse el proceso de ajuste.
- Licencia no declarada: no se puede garantizar el uso comercial; además, la licencia del modelo base Qwen3.5-27B condiciona el uso del adaptador.
- Idiomas no declarados: no se puede asegurar un rendimiento multilingüe.
- Cero descargas y cero likes: sin validación por parte de la comunidad.
- Al ser un adaptador LoRA, requiere cargar el modelo base completo; el coste de inferencia es el del modelo de 27B, no el del adaptador.
- No hay información sobre el formato exacto de entrada/salida esperado (plantilla de prompt, etiquetas de NLI), lo que dificulta su uso directo sin ingeniería inversa.
- Fecha de creación posterior a la consulta de referencia (2026-11-28): verificar la vigencia del artefacto antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Booooooooooooo/alqac2026-qwen3.5-27b-nli
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Paper de referencia citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental ML: https://mlco2.github.io/impact#compute
