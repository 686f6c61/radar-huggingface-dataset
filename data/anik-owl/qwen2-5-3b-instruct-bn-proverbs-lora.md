# anik-owl/qwen2.5-3b-instruct-bn-proverbs-lora

## Resumen

Los adaptadores LoRA `qwen2.5-3b-instruct-bn-proverbs-lora` son un artefacto de investigación desarrollado por Anik Mallick (IIT Hyderabad) dentro del proyecto de máster *Knowing Culture ≠ Using It: Cultural Alignment of Small Language Models for Contextual Understanding of Bengali Proverbs* (CS6803-TNLP-2026). Se trata de un ajuste fino mediante QLoRA sobre el modelo base `Qwen/Qwen2.5-3B-Instruct`, orientado a una tarea muy concreta: responder preguntas de opción múltiple sobre el significado figurado de refranes bengalíes insertados en conversaciones breves, en bengalí o en inglés.

El repositorio contiene dos adaptadores con propósitos distintos. El adaptador raíz (`main`) se entrenó con los formatos x1, x2 y x5 (4.200 prompts) y aprende a seguir la formulación exacta de la pregunta, incluyendo preguntas negativas ("¿qué NO quiere decir?"). El adaptador `v1/` se entrenó solo con x1 y x5 (3.000 prompts) y se conserva como resultado negativo principal del estudio: el ajuste fino enseña la regla que las preguntas de entrenamiento recompensan, no la regla semántica subyacente.

No es un asistente general en bengalí ni un modelo de propósito general. Es un instrumento de evaluación cultural: mide si un modelo pequeño alineado con instrucciones distingue el significado figurado de un refrán del significado literal, y si esa distinción es sensible a la pregunta formulada. El tamaño del repositorio es de 0,3 GB, correspondiente únicamente a los pesos del adaptador, no al modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-3B-Instruct) con adaptadores LoRA (PEFT) |
| Parámetros totales | 3B en el modelo base; tamaño del adaptador no disponible en la información proporcionada |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Qwen2.5-3B-Instruct) |
| Tipos de cuantización | QLoRA 4-bit NF4 durante entrenamiento; el adaptador se puede cargar sobre el base en 4-bit (bnb nf4) o fp16 |
| Idiomas soportados | bengalí (bn) e inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); requiere el modelo base Qwen2.5-3B-Instruct |
| Rank / alpha / dropout LoRA | 16 / 32 / 0,05 |
| Módulos objetivo | q, k, v, o, gate, up, down projections |
| Librería | peft |
| Tarea | text-generation (evaluada como clasificación de letra de opción) |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-3B-Instruct, un transformer decoder-only de 3.000 millones de parámetros. Sobre él se aplican adaptadores LoRA de rango 16 y alpha 32 con dropout 0,05, dirigidos a las proyecciones de atención (q, k, v, o) y a las proyecciones del MLP (gate, up, down). El entrenamiento se realizó con QLoRA: el base se carga en 4-bit NF4 y los adaptadores se entrenan en fp16 con checkpointing de gradientes. Se usaron 3 épocas, optimizador paged AdamW de 8 bits, learning rate 2e-4 con schedule coseno, 10 pasos de warm-up, weight decay 0,01, batch efectivo de 16 (2 × 8 de acumulación), longitud máxima de 512 tokens y semilla 0. La pérdida se calcula únicamente sobre la letra de la respuesta (completion-only). El checkpoint se selecciona por pérdida de validación, evaluada cada 50 pasos. Todo el entrenamiento se ejecutó en una única GPU T4 de Kaggle.

Los datos provienen del split de entrenamiento de ProBaD (100 refranes × 3 conversaciones), en ambos idiomas y con todas las permutaciones de orden de opciones. El split de validación (25 refranes) se usó para seleccionar checkpoint y ningún refrán de test aparece en entrenamiento. La formulación x2r (pregunta negativa con redacción nueva) no se vio nunca durante el entrenamiento, lo que permite medir generalización de la sensibilidad a la pregunta. Los formatos son: x1 (qué quiere decir el hablante, significado frente a literal), x2 (qué NO quiere decir, mismas opciones), x5 (tres opciones: significado, literal y distractor creíble) y x3 (la respuesta correcta es "ninguna de estas"). La innovación metodológica destacable es la métrica de sensibilidad a la pregunta, definida como acc(x1) + acc(x2r) − 1, que cuantifica si la respuesta cambia al cambiar la pregunta.

## Capacidades

- Respuesta a preguntas de opción múltiple sobre el significado figurado de refranes bengalíes en contexto conversacional, en bengalí e inglés.
- Discriminación entre interpretación figurada e interpretación literal de una expresión idiomática.
- Seguimiento de preguntas negativas ("¿qué NO significa?") en el adaptador raíz, con una sensibilidad a la pregunta de 0,97 en inglés y 0,89 en bengalí.
- Generalización a redacciones de pregunta no vistas en entrenamiento (formato x2r) en el adaptador raíz.
- Puntuación mediante probabilidad del siguiente token de la letra de opción (A, B, C), sin generación de texto libre.
- Capacidad multilingüe limitada a bn y en dentro del dominio de refranes.
- No soporta tool calling, function calling, agentes, visión, audio ni modos de razonamiento extendido de forma específica; hereda lo que ofrezca el base Qwen2.5-3B-Instruct, pero no se ha entrenado ni evaluado para ello.

## Casos de uso

- Evaluación de alineación cultural en modelos pequeños: el adaptador sirve como referencia de ajuste fino para medir si un SLM distingue significado figurado de literal en refranes bengalíes, usando la métrica de sensibilidad a la pregunta sobre el split de test de ProBaD.
- Investigación sobre sesgos de ajuste fino: el adaptador `v1/` documenta el fenómeno de que el fine-tuning enseña la regla recompensada por las preguntas de entrenamiento (evitar la opción literal) en lugar de la regla semántica, con caída de precisión en x2 de 0,67/0,40 a 0,23/0,06 (inglés/bengalí).
- Reproducción de experimentos de QLoRA en hardware de gama baja: todo el pipeline cabe en una T4 de 16 GB, lo que permite replicar el entrenamiento y la evaluación en entornos tipo Kaggle o Colab.
- Construcción de benchmarks de comprensión de proverbios: los prompts y el paquete `probad` del repositorio de GitHub permiten generar evaluaciones controladas con permutación de opciones y control sin pregunta (x7).
- Estudio de robustez ante distractores léxicos: el adaptador raíz aprende a evitar la palabra "thinks" en los distractores, un caso concreto de atajo superficial que puede analizarse como ejemplo de sesgo inducido por datos.
- Docencia en PLN cultural: el par de adaptadores (raíz frente a `v1/`) constituye un material didáctico para explicar la diferencia entre ajuste fino supervisado y alineación semántica real.

## Benchmarks y rendimiento

Resultados del split de test (200 refranes × 3 conversaciones), precisión en inglés / bengalí. "Base" es Qwen2.5-3B-Instruct en 4-bit sin adaptador.

| Test | Base 4-bit | `v1/` (x1 + x5) | root (x1 + x2 + x5) |
|---|---|---|---|
| x1: qué se quiere decir | 0,78 / 0,61 | 0,99 / 0,93 | 0,98 / 0,96 |
| x4: refrán aislado | 0,74 / 0,62 | 0,97 / 0,86 | 0,96 / 0,91 |
| x5: tres opciones | 0,81 / 0,58 | 0,98 / 0,85 | 0,95 / 0,84 |
| x2: qué NO se quiere decir | 0,67 / 0,40 | 0,23 / 0,06 | 0,98 / 0,94 |
| x2r: x2 con redacción nueva | 0,82 / 0,48 | 0,50 / 0,06 | 0,99 / 0,94 |
| x3: "ninguna de estas" es correcta | 0,69 / 0,06 | 0,87 / 0,67 | 0,30 / 0,53 |
| x7: sin pregunta (control) | 0,91 / 0,77 | 1,00 / 0,95 | 1,00 / 0,95 |

Sensibilidad a la pregunta (acc(x1) + acc(x2r) − 1; 1 significa que la respuesta cambia con la pregunta, 0 que no cambia):

| Modelo | Inglés | Bengalí |
|---|---|---|
| Base 4-bit | 0,60 | 0,08 |
| `v1/` | 0,49 | −0,01 |
| root | 0,97 | 0,89 |

Los resultados corresponden a una única ejecución por mezcla de entrenamiento (semilla 0) y el autor los califica de preliminares.

## Requisitos de hardware

- VRAM estimada para inferencia: el base en 4-bit NF4 requiere aproximadamente 2-3 GB de VRAM, más overhead del adaptador (0,3 GB en el repositorio) y memoria de activaciones; en la práctica, un entorno de 8-16 GB es suficiente.
- GPU recomendadas: T4 (16 GB), RTX 3060/4060 (8-12 GB), RTX 4090, A100 y H100 son válidas; el entrenamiento original se ejecutó en una única T4.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 8 GB de VRAM usando carga en 4-bit; el adaptador es de 0,3 GB.
- Opciones de despliegue: transformers + peft + bitsandbytes (flujo documentado por el autor); vLLM, llama.cpp, Ollama o TGI requerirían fusionar los adaptadores en el base y convertirlos a los formatos correspondientes, algo no documentado en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada. La evaluación del autor no genera texto: lee la probabilidad del siguiente token de la letra de opción, lo que reduce el coste frente a la generación completa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (sobre Qwen2.5-3B-Instruct) | 3B + LoRA | no disponible | Opción múltiple sobre refranes bn/en | MIT | Hugging Face (8 descargas) |
| Qwen2.5-3B-Instruct (base, 4-bit) | 3B | no disponible | Propósito general, instrucciones | no disponible en la información proporcionada | Hugging Face |
| Adaptador `v1/` (mismo repo) | 3B + LoRA | no disponible | Opción múltiple, regla "nunca la opción literal" | MIT | Hugging Face (subcarpeta `v1/`) |

No se dispone de datos sobre otros adaptadores o modelos comparables de evaluación de refranes bengalíes en la información proporcionada.

## Limitaciones y advertencias

- El adaptador raíz rara vez responde "ninguna de estas" cuando la respuesta correcta no está entre las opciones: la precisión en x3 en inglés cae del 69 % al 30 %.
- El adaptador raíz se apoya en un atajo léxico: muchos distractores contienen la palabra "thinks" y el adaptador aprende a evitarla, lo que explica la mayor parte de su mejora en x5 en inglés.
- El adaptador `v1/` muestra el resultado negativo central: aprender a no elegir la opción literal degrada la precisión en preguntas negativas (x2 baja a 0,23/0,06 en inglés/bengalí).
- Los datos de ProBaD son un borrador cuidadoso: los escribió un LLM, los revisó GPT-6.2 y falta la revisión de hablantes nativos.
- Los resultados provienen de una sola ejecución por mezcla (semilla 0) y son preliminares.
- El modelo no es un asistente general en bengalí; su uso fuera de la tarea de opción múltiple sobre refranes no está validado.
- Licencia MIT permite uso comercial del adaptador, pero el modelo base Qwen2.5-3B-Instruct tiene su propia licencia, que debe verificarse por separado.
- Riesgo de alucinación y sesgos: no evaluados en la información proporcionada; la tarea se puntúa por probabilidad de letra, no por generación libre, lo que limita pero no elimina el riesgo en usos fuera de dominio.

## Enlaces

- Adaptadores LoRA en Hugging Face: https://huggingface.co/anik-owl/qwen2.5-3b-instruct-bn-proverbs-lora
- Código en GitHub: https://github.com/AnikMallick/bn-proverbs-in-context
- Dataset ProBaD en Kaggle: https://www.kaggle.com/datasets/amallick0507/probad
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
