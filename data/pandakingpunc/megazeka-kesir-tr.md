# pandakingpunc/megazeka-kesir-tr

## Resumen

Megazeka-Kesir es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base `unsloth/Qwen3.5-4B`, especializado en la resolución de operaciones y problemas con fracciones en turco. Lo desarrolla el usuario `pandakingpunc` y su propósito es muy concreto: dado un enunciado matemático en turco (simbólico o verbal), el modelo produce una resolución paso a paso, explicando en turco los cálculos intermedios (mínimo común múltiplo, simplificación por Euclides, conversión de números mixtos) y terminando con una línea `Sonuç: ...` con el resultado final.

La versión v2.0 sustituye el modelo base de v1.0 (Qwen2.5-1.5B-Instruct) por Qwen3.5-4B, manteniendo idéntico dataset (18.000 preguntas) y configuración de entrenamiento. Según la model card, esta mejora del modelo base eleva la precisión de valor final en un examen ciego de 103/120 a 119/120, y reduce drásticamente los errores en pasos intermedios (de 14 respuestas con al menos una igualdad intermedia incorrecta a solo 1).

Es relevante porque demuestra un patrón de especialización vertical muy eficaz: un adaptador pequeño (0,2 GB) sobre un modelo de 4B que supera en una tarea acotada a modelos mucho mayores, con razonamiento explícito y verificable. El repositorio incluye únicamente el adaptador PEFT, no los pesos completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-4B) con adaptador LoRA (PEFT) |
| Parametros totales | 4B (modelo base); el adaptador LoRA no se especifica en la informacion disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Entrenamiento con QLoRA; el adaptador se distribuye en safetensors. Cuantizaciones de inferencia (GGUF, AWQ, GPTQ) no disponibles |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen3.5-4B, un transformer decoder-only de 4.000 millones de parámetros. El adaptador se entrenó mediante QLoRA (cuantización del base a 4 bits durante el ajuste) sobre un dataset propio de 18.000 preguntas (`pandakingpunc/megazeka-kesir-tr-steps`) que incluye operaciones simbólicas con fracciones, comparaciones, conversiones de números mixtos, divisiones por cero y problemas verbales contextualizados en turco.

La innovación principal no está en la arquitectura sino en el formato de entrenamiento: el modelo aprende a generar cadenas de razonamiento ("step-by-step") que explicitan el algoritmo de Euclides para el MCD, el cálculo del denominador común, la simplificación y la conversión de lenguaje natural a fracciones. Esto hace que el proceso sea auditable: el usuario puede localizar exactamente en qué paso se produjo un error. La model card indica que v1.0 y v2.0 se entrenaron con los mismos datos y el mismo número de pasos, cambiando solo el modelo base, lo que permite atribuir la mejora exclusivamente a la capacidad del base.

## Capacidades

- Resolución paso a paso de operaciones aritméticas con fracciones: suma, resta, multiplicación, división, paréntesis y simplificación.
- Cálculo explícito del MCD mediante el algoritmo de Euclides, mostrando las divisiones sucesivas.
- Conversión entre fracciones impropias y números mixtos (por ejemplo, "eksi iki tam yirmide on bir" → `-51/20`).
- Comparación de fracciones con símbolos `<`, `>`, `=`.
- Manejo de casos especiales como división por cero (`47/0 = ?` → `tanımsız`, "indefinido").
- Resolución de problemas verbales en turco: interpreta expresiones como "bir buçuk" (1½), "dokuzda dördü" (4/9) y determina la operación adecuada (multiplicación para "una fracción de una cantidad").
- Generación de texto en turco exclusivamente; no se documenta soporte multilingüe.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Tutor de matemáticas para estudiantes turcos: el modelo explica cada paso en turco (MCD, denominador común, simplificación), lo que permite al alumno seguir el razonamiento y detectar dónde se equivoca, no solo comprobar el resultado.
- Generación automática de soluciones explicadas en plataformas educativas: dado un banco de ejercicios de fracciones, el adaptador produce la resolución completa con formato `Sonuç:` que un corrector automático puede parsear.
- Verificación y depuración de pipelines de cálculo: al mostrar las igualdades intermedias, un sistema puede validar cada paso con un CAS (Computer Algebra System) y detectar discrepancias antes de aceptar el resultado final.
- Preprocesado de enunciados verbales en turco: conversión de expresiones coloquiales ("bir buçuk metrelik telin dokuzda dördü") a expresiones simbólicas (`(3/2) × (4/9)`) que alimenten un motor de cálculo determinista.
- Asistencia en aplicaciones de mensajería o chatbots educativos en turco: el modelo cabe en una GPU de consumo (4B en 4 bits) y puede desplegarse localmente para responder dudas de fracciones con latencia baja.
- Evaluación comparativa de modelos base: el adaptador sirve como sonda para medir la capacidad aritmética y de razonamiento verbal de distintos modelos base con un dataset fijo y una métrica reproducible (precisión de valor final y errores en pasos intermedios).

## Benchmarks y rendimiento

Los datos provienen de dos exámenes ciegos creados por el autor (`gercek4` y `gercek5`), con 120 preguntas cada uno (12 tipos × 10 ejemplos, 24 de ellos puramente simbólicos). Las preguntas de `gercek5` fueron redactadas por una sesión de IA independiente (GPT-6.2 Sol) y verificadas manualmente; el examen se congeló antes de ejecutar los modelos.

| Métrica | v1.0 (Qwen2.5-1.5B) | v2.0 (Qwen3.5-4B) |
|---|---:|---:|
| Valor final correcto en `gercek5` (120 preguntas) | 103/120 | 119/120 (99,2 %) |
| Valor final correcto en `gercek5` excluyendo 7 preguntas solapadas con el entrenamiento | 97/113 | 112/113 |
| Valor final correcto en las 24 preguntas simbólicas de `gercek5` | 22/24 | 24/24 |
| Respuestas con al menos una igualdad intermedia incorrecta en `gercek5` | 14 | 1 |
| Valor final correcto en `gercek4` (120 preguntas) | 103/120 | 115/120 (95,8 %) |
| Valor final correcto en las 24 preguntas simbólicas de `gercek4` | 21/24 | 23/24 |
| Respuestas con al menos una igualdad intermedia incorrecta en `gercek4` | 20 | 2 |
| Respuestas en un idioma distinto del turco (ambos exámenes) | 0 | 0 |

En problemas verbales de combinación de dos cantidades, v1.0 obtuvo 4/10 y v2.0 10/10; en problemas de cantidad restante, 6/10 y 10/10 respectivamente. No se han publicado resultados en benchmarks estándar (MMLU, GSM8K, HumanEval) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base es de 4B parámetros. En FP16 requiere aproximadamente 8 GB; en cuantización de 4 bits (GGUF Q4_K_M o similar) alrededor de 2,5-3 GB, más el adaptador (0,2 GB).
- GPU recomendadas: A100 o H100 para despliegues de alta concurrencia en FP16; RTX 4090, RTX 3090 o RTX 4080 para inferencia en FP16 sin problemas; RTX 3060 (12 GB) o incluso GPUs de 8 GB con cuantización 4 bits.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más usando cuantización de 4 bits, y en GPUs de 12-16 GB en FP16.
- Opciones de despliegue: vLLM o TGI para servir el modelo base con el adaptador LoRA en producción; llama.cpp u Ollama para despliegue local tras fusionar el adaptador y convertir a GGUF; transformers + PEFT para prototipado.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia orientativa, un modelo de 4B en una RTX 4090 suele generar decenas de tokens por segundo, pero no hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Megazeka-Kesir v2.0 | 4B (base) + LoRA | no disponible | Fracciones en turco, paso a paso | Apache 2.0 | Hugging Face (adaptador) |
| Megazeka-Kesir v1.0 | 1,5B (base) + LoRA | no disponible | Fracciones en turco, paso a paso | Apache 2.0 | GitHub (tag v1.0) |
| Qwen3.5-4B (base) | 4B | no disponible | Propósito general | no disponible en la información | Hugging Face (unsloth) |
| Qwen2.5-1.5B-Instruct (base de v1.0) | 1,5B | 32.768 tokens (según especificaciones públicas de Qwen2.5) | Propósito general, instrucciones | Apache 2.0 | Hugging Face |

La comparación relevante es interna: v2.0 supera a v1.0 en todos los ejes medidos (precisión de valor final, corrección de pasos intermedios y comprensión de problemas verbales) gracias al mayor tamaño del modelo base. Frente a un modelo de propósito general sin ajuste, la ventaja es el formato de razonamiento explícito y la consistencia en turco; frente a un CAS determinista, la ventaja es la interpretación de lenguaje natural, aunque con riesgo de error aritmético que un CAS no tendría.

## Limitaciones y advertencias

- Especialización estrecha: el adaptador está entrenado exclusivamente para fracciones en turco; su rendimiento fuera de ese dominio (álgebra, geometría, otros idiomas) no está documentado y probablemente sea deficiente.
- Riesgo de alucinación en pasos intermedios: aunque v2.0 reduce los errores a 1 respuesta con igualdad intermedia incorrecta en `gercek5`, el modelo puede producir cadenas de razonamiento plausibles pero aritméticamente erróneas; conviene validar el resultado final con un CAS en producción.
- Sesgo de idioma: solo se documenta turco; no se garantiza coherencia si se le pide responder en otro idioma.
- Sesgos de contenido: no se documentan evaluaciones de sesgo social o cultural; el dataset es sintético y centrado en matemáticas.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3.5-4B tiene su propia licencia que debe verificarse por separado.
- El repositorio contiene solo el adaptador (0,2 GB); para usarlo hay que descargar el modelo base y aplicar el adaptador con PEFT, o fusionarlo y convertirlo a GGUF.
- Los benchmarks son autoinformados por el autor, con exámenes de 120 preguntas y sin revisión por pares; deben interpretarse con cautela.
- No se documenta la longitud de contexto efectiva del adaptador ni su comportamiento en conversaciones multi-turno.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pandakingpunc/megazeka-kesir-tr
- Dataset de entrenamiento: https://huggingface.co/datasets/pandakingpunc/megazeka-kesir-tr-steps
- Código fuente y tests (v2.0): https://github.com/pandakingpunc/megazeka-kesir/tree/v2.0
- Versión v1.0 (Qwen2.5-1.5B): https://github.com/pandakingpunc/megazeka-kesir/tree/v1.0
- Salidas del examen `gercek5`: https://github.com/pandakingpunc/megazeka-kesir/blob/v2.0/reports/tahminler/v2-gercek5.jsonl
- Salidas del examen `gercek4`: https://github.com/pandakingpunc/megazeka-kesir/blob/v2.0/reports/tahminler/v2-gercek4.jsonl
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
