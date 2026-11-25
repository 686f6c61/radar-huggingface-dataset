# protoncracker/gemma-4-e2b-it-fable5-security-lora-negative-result

## Resumen

Este repositorio no contiene un modelo nuevo, sino un adaptador LoRA de resultado negativo publicado como evidencia experimental. El autor, `protoncracker`, parte de `google/gemma-4-e2b-it` y entrena un adaptador de rango 16 sobre una mezcla de trazas de agente de Claude "Fable-5" y datos de seguridad defensiva, con el objetivo de comprobar si ese ajuste fino mejora las puntuaciones generales del modelo base. La respuesta documentada es que no: todas las variantes ajustadas rinden por debajo del modelo original en MMLU-Pro, ARC-Challenge, SuperGPQA hard y un cuestionario de seguridad.

El interés del artefacto es metodológico más que práctico. Publica deltas de precisión con intervalos de confianza bootstrap pareados, documenta la rotura de formato de respuesta en el modelo mayor (E4B) y deja constancia de las recetas no probadas (learning rate más bajo, rango menor, mezcla con datos de instrucción general). El repositorio ocupa 0,1 GB y solo incluye el adaptador del experimento E2B con mezcla de datos; los adaptadores E4B y los de fuente única se perdieron junto con la máquina de entrenamiento.

No debe emplearse en producción: el propio autor lo etiqueta como `negative-result` y advierte de que degrada el rendimiento respecto al modelo base. Su valor está en servir de referencia para quien diseñe recetas de fine-tuning sobre Gemma 4 con datos sintéticos de agente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer decoder-only `google/gemma-4-e2b-it` |
| Parametros totales | no disponible (el adaptador LoRA no declara recuento; rango 16, alpha 32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la evaluación usó 4.096 tokens de generación) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el autor evaluó en BF16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Gemma 4 E2B-it, un modelo base de Google del que esta ficha no dispone de especificaciones propias (arquitectura interna, número de parámetros y contexto no están en la información proporcionada). El LoRA emplea rango 16, alpha 32, dropout 0,05 y learning rate 2e-4, con una sola pasada sobre 3,75 millones de tokens en 194 pasos; la pérdida de validación bajó de 2,77 a 1,15. La evaluación se hizo en BF16, sin modo thinking, con 1 muestra, temperatura 1,0, top-p 0,95, top-k 64 y 4.096 tokens.

Los datos de entrenamiento combinan trazas de agente de Claude "Fable-5" (`PawanKrd/claude-fable-5-code`, `armand0e/claude-fable-5-claude-code`, `victor/fable-5-boeing-747-trace`) con cuatro conjuntos de seguridad defensiva (Trendyol, CyberNative, AarthShah y Leopo1d). Las fuentes de seguridad debían declarar apache-2.0, mit, cc-by-4.0 o cc0-1.0; las trazas de Fable-5 no tienen licencia declarada en el Hub y el autor las trató como Apache-2.0 por decisión propia. Antes del entrenamiento se sustituyeron 25 cadenas con aspecto de clave de API por marcadores de posición. Los conjuntos de entrenamiento no se redistribuyen.

## Capacidades

- El adaptador no añade capacidades verificadas; hereda las del modelo base `google/gemma-4-e2b-it`, cuyas especificaciones no están disponibles en la información proporcionada.
- El resultado medido es una degradación de precisión en MMLU-Pro, ARC-Challenge, SuperGPQA hard y el cuestionario de seguridad, no una mejora.
- No hay evidencia de mejora en tool calling, razonamiento multi-paso ni comportamiento de agente pese a entrenar con trazas de agente.
- El autor documenta rotura de formato de respuesta en la variante E4B (15-18 respuestas ilegibles frente a 0-1 del modelo original).
- Capacidades multilingües: no disponibles.
- No se declaran modos especiales (thinking, visión, audio) para el adaptador.

## Casos de uso

- Referencia metodológica para diseño de experimentos: sirve como ejemplo de cómo publicar un resultado negativo con deltas pareados e intervalos bootstrap, útil para equipos que quieran replicar el protocolo de evaluación.
- Auditoría de recetas de fine-tuning: permite contrastar una receta concreta (rango 16, lr 2e-4, una pasada, 3,75M tokens) y evitar repetirla sobre Gemma 4 E2B-it con datos similares.
- Estudio de olvido catastrófico: los deltas de -9,6 a -14,0 puntos en benchmarks generales son un caso documentado de degradación por especialización con datos sintéticos de agente.
- Análisis de contaminación y filtrado de datos: el repositorio describe la sustitución de cadenas tipo clave de API y la comprobación de solapamiento por shingles, útil como plantilla de higiene de datos.
- Docencia y formación: material para explicar por qué una pérdida de validación baja (2,77 a 1,15) no implica mejora en benchmarks.
- Reproducción de evaluaciones de seguridad: el cuestionario de 400 ítems (100 de MMLU computer-security y 300 de CyberMetric) puede reutilizarse como banco de prueba, siempre que se respeten las licencias de origen.

## Benchmarks y rendimiento

Deltas de precisión (ajustado menos original) con intervalo bootstrap pareado al 95 % por debajo de cero salvo donde se indica n.s.:

| Modelo ajustado | MMLU-Pro (500) | ARC-Challenge (500) | SuperGPQA hard (300) | Cuestionario seguridad (400) |
|---|---|---|---|---|
| E2B, Fable-5 + mezcla de seguridad | -9,6 | -14,0 | -11,0 | -12,8 |
| E4B, Fable-5 + mezcla de seguridad | -10,8 | -6,0 | -9,3 | -5,2 |
| E2B, solo Fable-5 | -12,4 | -8,0 | -11,0 | -8,0 |
| E2B, solo seguridad | -13,4 | -14,2 | -4,3 (n.s.) | -15,8 |

Precisión del modelo original como referencia:

| Modelo | Hardware | MMLU-Pro | ARC-Challenge | SuperGPQA hard | Seguridad |
|---|---|---|---|---|---|
| E2B | L4 | 60,8 | 90,6 | 26,3 | 85,8 |
| E2B | A100 | 63,2 | 90,0 | 22,3 | 84,8 |
| E4B | A100 | 70,2 | 95,8 | 35,0 | 89,2 |

Son ejecuciones únicas; las pasadas múltiples previstas no se completaron por pérdida de las máquinas. El cuestionario de seguridad combina 100 ítems de MMLU computer-security (MIT) y 300 de CyberMetric (Apache-2.0), sin solapamiento con los datos de entrenamiento según comprobación por shingles.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador; depende del modelo base Gemma 4 E2B-it, cuyas especificaciones no se proporcionan. El adaptador en sí ocupa una fracción de los 0,1 GB del repositorio.
- GPU empleadas en la evaluación: NVIDIA L4 y A100, en BF16.
- Compatibilidad con GPU de consumo: no verificada en la información disponible.
- Opciones de despliegue: no documentadas para este adaptador; al ser un LoRA en safetensors, requeriría cargarse junto al modelo base mediante una librería compatible con PEFT, pero el autor no publica instrucciones de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (E2B, mezcla) | LoRA rango 16 sobre Gemma 4 E2B-it | no disponible | Inferior al base en 4 benchmarks (deltas de -9,6 a -14,0) | apache-2.0 | Hugging Face, 0 descargas |
| `google/gemma-4-e2b-it` (base) | no disponible | no disponible | 60,8-63,2 MMLU-Pro; 90,0-90,6 ARC-Challenge; 22,3-26,3 SuperGPQA | no disponible en esta ficha | Hugging Face |
| `google/gemma-4-e4b-it` (base) | no disponible | no disponible | 70,2 MMLU-Pro; 95,8 ARC-Challenge; 35,0 SuperGPQA | no disponible en esta ficha | Hugging Face |

No se dispone de datos de otros adaptadores de seguridad comparables en la información proporcionada.

## Limitaciones y advertencias

- Degrada el rendimiento respecto al modelo base en todos los benchmarks medidos; no debe desplegarse en producción.
- Resultado de una sola ejecución por celda; las pasadas múltiples no se completaron, por lo que la estabilidad de los deltas no está confirmada.
- Rotura de formato de respuesta documentada en la variante E4B (15-18 respuestas ilegibles frente a 0-1 del original), lo que invalida parte de la comparación.
- Las trazas de Fable-5 son salidas de un modelo Claude y su licencia no está declarada en el Hub; el autor las trató como Apache-2.0 por decisión propia, lo que introduce riesgo legal para quien reutilice el adaptador.
- Los conjuntos de entrenamiento no se redistribuyen, lo que impide reproducir exactamente el experimento.
- El adaptador E4B y los de fuente única no se publicaron (se perdieron con la máquina), así que solo es replicable la variante E2B con mezcla.
- Sesgos, riesgo de alucinación y limitaciones idiomáticas del adaptador: no documentados.
- Recetas alternativas (learning rate menor, rango menor, mezcla con datos de instrucción general) quedan sin probar según el propio autor.

## Enlaces

- Hugging Face: https://huggingface.co/protoncracker/gemma-4-e2b-it-fable5-security-lora-negative-result
- Modelo base: https://huggingface.co/google/gemma-4-e2b-it
- Dataset de trazas Fable-5: https://huggingface.co/datasets/PawanKrd/claude-fable-5-code
- Dataset de trazas Fable-5 (Claude Code): https://huggingface.co/datasets/armand0e/claude-fable-5-claude-code
- Dataset de seguridad Trendyol: https://huggingface.co/datasets/Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset
- Dataset de seguridad CyberNative: https://huggingface.co/datasets/CyberNative/Code_Vulnerability_Security_DPO
- Dataset de seguridad AarthShah: https://huggingface.co/datasets/AarthShah/cybersecurity-dataset-v3
- Dataset de seguridad Leopo1d: https://huggingface.co/datasets/Leopo1d/OpenVul_Rejection_Sampling_based_Vulnerability_Reasoning_Dataset_for_SFT
