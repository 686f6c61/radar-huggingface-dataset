# EPFL-LARA/lean-world-model-qwen3-4b-grpo

## Resumen

Lean World-Model Prover es un ajuste fino del modelo base Qwen3-4B-Base desarrollado por EPFL-LARA (Laboratorio de Razonamiento y Aprendizaje Automático de la EPFL) para la demostración automática de teoremas en Lean 4. El modelo genera pruebas completas de Lean 4 acompañadas de "bloques de retroalimentación" en línea (`/- <feedback> ... </feedback> -/`) que contienen estados de objetivo (goal states) y diagnósticos del compilador predichos, imitando el comportamiento de un "world model" del entorno de verificación. Esta versión corresponde a la etapa posterior a GRPO (Group Relative Policy Optimization) dentro de la familia WM4.

La propuesta técnica es relevante porque combina la generación de código Lean con la predicción del estado interno del compilador, lo que permite al modelo intentar reparaciones dentro de una misma respuesta sin necesidad de invocar el compilador real entre intentos. Con 4.411.424.256 parámetros (aproximadamente 4,4 mil millones), un contexto de 32.768 tokens y licencia Apache 2.0, es un modelo compacto que puede desplegarse en una sola GPU de gama alta o incluso en GPUs de consumo con cuantización.

El modelo está entrenado exclusivamente en inglés y se distribuye en formato safetensors compatible con Transformers, vLLM y text-generation-inference. Su utilidad principal es la integración en pipelines de demostración formal, evaluación de teoremas y generación de pruebas asistida por IA en entornos Lean 4 con Mathlib.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-4B-Base) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en BF16; el modelo base Qwen3-4B admite cuantizaciones GGUF/AWQ, pero no se confirman para este checkpoint) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B-Base, un transformer decoder-only denso de aproximadamente 4,4 mil millones de parámetros. Sobre esta base se aplica un pipeline de ajuste en tres etapas documentado en las etiquetas del repositorio: continued pre-training (CPT) con el dataset EPFL-LARA/lean-world-model-cpt, supervised fine-tuning (SFT) con EPFL-LARA/lean-world-model-sft y, finalmente, aprendizaje por refuerzo con GRPO sobre Goedel-LM/RL_dataset_V2. Esta última etapa es la que distingue al checkpoint aquí descrito (etiqueta "After GRPO" y nombre del repositorio "-grpo").

La innovación central es el entrenamiento del modelo como "world model" del entorno Lean: además de generar tácticas de prueba, el modelo predice estados de objetivo y diagnósticos del compilador que inserta como comentarios de retroalimentación. Esto permite que una única respuesta contenga intentos sucesivos de prueba corregidos, donde cada intento se apoya en la retroalimentación predicha del anterior. El prompt de inferencia sigue una plantilla fija que solicita una solución completa en un bloque de código `lean4` anotado con bloques `/- <feedback> ... </feedback> -/`, y la evaluación debe tomar el último bloque de código Lean completo como candidato final para verificación con Lean 4.15 y Mathlib.

## Capacidades

- Generación de pruebas completas en Lean 4 para teoremas que terminan en `by sorry`, incluyendo imports y contexto.
- Predicción de estados de objetivo (goal states) y diagnósticos del compilador en comentarios de retroalimentación en línea.
- Reparación iterativa dentro de una misma respuesta: el modelo puede producir intentos sucesivos de prueba corregidos apoyándose en la retroalimentación predicha.
- Razonamiento formal y matemático orientado a demostración interactiva de teoremas.
- Generación de código Lean 4 con anotaciones explicativas.
- Compatibilidad con tooling de inferencia estándar: Transformers, vLLM y text-generation-inference (endpoints compatibles).
- Capacidad multilingüe: limitada al inglés según la model card.
- No se documenta soporte explícito de tool calling, function calling, agentes generales, visión ni audio.

## Casos de uso

- Demostración automática de teoremas en Lean 4: el modelo recibe un archivo `.lean` con imports, contexto y un teorema terminado en `by sorry`, y devuelve una prueba completa verificable con Lean 4.15 y Mathlib. Es adecuado por su entrenamiento específico en la sintaxis y semántica de Lean 4.
- Reparación de pruebas fallidas: gracias a los bloques de retroalimentación predichos, el modelo puede proponer correcciones sucesivas dentro de una misma respuesta, lo que reduce el número de llamadas al compilador real en pipelines de verificación iterativa.
- Generación de datos sintéticos para entrenamiento: las pruebas generadas con estados de objetivo anotados pueden servir como corpus supervisado para entrenar o evaluar otros demostradores automáticos.
- Asistencia a investigadores en formalización matemática: integrado en un IDE o script que sustituya `sorry` por pruebas candidatas, el modelo acelera la formalización de lemmas en Mathlib.
- Evaluación comparativa de demostradores: al ser un checkpoint público con licencia Apache 2.0 y scripts de inferencia incluidos, puede usarse como baseline en benchmarks de theorem proving en Lean 4.
- Despliegue en entornos con recursos limitados: con 4,4 mil millones de parámetros y contexto de 32.768 tokens, puede servirse en una sola GPU de gama alta (por ejemplo, H100 en BF16, como documenta el autor) o en GPUs de consumo con cuantización.
- Generación por lotes para minería de pruebas: el runner de vLLM incluido permite generar múltiples muestras por teorema (por ejemplo, 32 muestras con temperatura 0,7 y top-p 0,95) para seleccionar la mejor prueba candidata.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta un ejemplo cualitativo de salida (teorema `demo (n : ℕ) : n + 0 = n`) verificado con Lean 4.15 y Mathlib, generado en una H100 en BF16 con semilla 0, temperatura 0,3 y top-p 0,95. No se proporcionan métricas cuantitativas como pass@k, MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 8,8 GB solo para pesos (el repositorio ocupa 8,8 GB), más overhead de activaciones y caché KV; en la práctica se recomienda al menos 16-24 GB de VRAM para contexto largo.
- VRAM estimada con cuantización de 8 bits: alrededor de 4,5-5 GB para pesos; con 4 bits, alrededor de 2,5-3 GB para pesos, más caché KV.
- GPU recomendadas: el autor documenta ejecución en NVIDIA H100 en BF16. Por tamaño, también es adecuado en A100 (40/80 GB), L40S y RTX 4090 (24 GB) en BF16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090 (24 GB) en BF16 y en GPUs con 16 GB o menos si se aplica cuantización (no se confirman artefactos GGUF/AWQ publicados para este checkpoint).
- Opciones de despliegue: Transformers 4.57.3 con accelerate y SDPA; vLLM 0.12.0 (runner incluido en el repositorio); text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`).
- Latencia y throughput: no disponibles en la informacion proporcionada. El ejemplo del autor limita la generación a 2.048 tokens nuevos en el script de Transformers y al presupuesto restante del contexto de 32.768 tokens en el runner de vLLM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lean World-Model Prover (Qwen3-4B, GRPO) | 4,41 B | 32.768 | Demostracion Lean 4 con world model y feedback predicho | Apache 2.0 | Hugging Face (EPFL-LARA) |
| Qwen/Qwen3-4B-Base | ~4 B | 32.768 (heredado) | LLM generalista base | Apache 2.0 | Hugging Face (Qwen) |
| Goedel-LM (familia, dataset RL asociado) | No disponible | No disponible | Demostracion formal en Lean | No disponible | Hugging Face (Goedel-LM) |

La comparativa se limita a los modelos mencionados en la informacion proporcionada. No se dispone de datos de rendimiento comparativo (pass@k u otras métricas) entre estos modelos en la informacion disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al derivar de Qwen3-4B-Base y entrenarse solo en inglés, puede heredar sesgos del corpus base.
- Riesgo de alucinación: los estados de objetivo y diagnósticos del compilador son predicciones del modelo, no salidas reales del compilador; pueden ser incorrectos y deben validarse siempre con Lean 4.15 y Mathlib antes de aceptar una prueba.
- Limitación de idioma: el modelo solo declara soporte de inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Limitación de contexto: el presupuesto total es de 32.768 tokens; el prompt debe dejar espacio para la prueba, y el script de ejemplo limita la generación a 2.048 tokens nuevos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar las obligaciones de atribución y las licencias del modelo base y de Mathlib en el contexto de producción.
- Caveat de producción: la evaluación debe tomar el último bloque de código Lean completo de la respuesta como candidato final; respuestas truncadas o con bloques incompletos pueden invalidar la prueba.
- No se documentan capacidades de tool calling, agentes generales, visión ni audio; su uso fuera del dominio de Lean 4 no está respaldado por el entrenamiento.
- El checkpoint corresponde a una etapa específica ("After GRPO", WM4) de un pipeline de investigación; puede no ser estable para usos fuera de demostración formal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EPFL-LARA/lean-world-model-qwen3-4b-grpo
- Colección "Formal Theorem Proving with Lean World Models": https://huggingface.co/collections/EPFL-LARA/formal-theorem-proving-with-lean-world-models-6ad2b4aa4400b3e2933f380d
- Dataset CPT: https://huggingface.co/datasets/EPFL-LARA/lean-world-model-cpt
- Dataset SFT: https://huggingface.co/datasets/EPFL-LARA/lean-world-model-sft
- Dataset RL: https://huggingface.co/datasets/Goedel-LM/RL_dataset_V2
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Respuesta de ejemplo completa: https://huggingface.co/EPFL-LARA/lean-world-model-qwen3-4b-grpo/blob/main/example_response.txt
- Entrada/salida JSON de ejemplo: https://huggingface.co/EPFL-LARA/lean-world-model-qwen3-4b-grpo/blob/main/example_output.json
- Prueba Lean de ejemplo: https://huggingface.co/EPFL-LARA/lean-world-model-qwen3-4b-grpo/blob/main/example_proof.lean
