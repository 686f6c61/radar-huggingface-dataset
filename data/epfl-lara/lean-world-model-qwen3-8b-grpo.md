# EPFL-LARA/lean-world-model-qwen3-8b-grpo

## Resumen

Lean World-Model Prover Qwen3-8B es un ajuste fino del modelo base Qwen3-8B-Base, desarrollado por el laboratorio EPFL-LARA, especializado en la demostración automática de teoremas en Lean 4. El modelo genera pruebas completas en Lean 4 acompañadas de "goal states" predichos y diagnósticos del compilador insertados como comentarios en línea, lo que permite simular el comportamiento del compilador dentro de una única respuesta y facilita intentos de reparación sucesivos sin necesidad de invocar el compilador real entre pasos.

La relevancia del modelo reside en su enfoque de "world model": en lugar de limitarse a generar código Lean y depender de un bucle externo de verificación, el modelo aprende a predecir el estado de la prueba y los errores del compilador, lo que habilita la auto-corrección dentro de una misma generación. El checkpoint publicado corresponde a la etapa posterior al entrenamiento con GRPO (Group Relative Policy Optimization), tras las fases de continued pre-training (CPT) y supervised fine-tuning (SFT) sobre datasets propios del proyecto.

Con 8.190.735.360 parámetros, una ventana de contexto de 32.768 tokens y licencia Apache 2.0, el modelo está pensado para integrarse en pipelines de demostración formal, investigación en razonamiento matemático y sistemas de agentes que requieran verificación formal. Su tamaño permite desplegarlo en GPUs de gama alta para consumo individual y en infraestructura de servidor con vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino supervisado + GRPO |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16/safetensors) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-8B-Base, un transformer decoder-only de 8.190 millones de parámetros con atención estándar. Sobre esta base se aplicó un pipeline de tres etapas: continued pre-training (CPT) con el dataset EPFL-LARA/lean-world-model-cpt, supervised fine-tuning (SFT) con EPFL-LARA/lean-world-model-sft, y finalmente un ajuste con GRPO usando Goedel-LM/RL_dataset_V2. El objetivo del entrenamiento es que el modelo aprenda a predecir, además del código de la prueba, los estados de objetivo (goal states) y los diagnósticos del compilador Lean 4, emulando el comportamiento de un "world model" del entorno de verificación.

La innovación técnica principal es la generación de bloques de feedback en línea con el formato `/- <feedback> ... </feedback> -/`, que contienen el estado de la prueba y los mensajes del compilador en cada punto del desarrollo. Esto permite que una sola respuesta contenga intentos de prueba sucesivos con correcciones, reduciendo la dependencia de bucles externos de compilación. La inferencia se realiza con prompts crudos (sin plantilla de chat), tokenización con `add_special_tokens=False` y un presupuesto de contexto de 32.768 tokens. El modelo fue validado contra Lean 4.15 y Mathlib.

## Capacidades

- Generación de pruebas completas en Lean 4 a partir de enunciados de teoremas con `by sorry`.
- Predicción de goal states (estados de prueba) en cada paso del desarrollo.
- Simulación de diagnósticos del compilador Lean 4 dentro de la propia respuesta.
- Reparación de pruebas dentro de una misma respuesta mediante intentos sucesivos corregidos.
- Razonamiento matemático formal con soporte de Mathlib.
- Generación de comentarios explicativos en lenguaje natural junto al código Lean.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: parcial, mediante los intentos de reparación internos; no se documenta integración con frameworks de agentes.
- Capacidades multilingües: limitadas al inglés (idioma declarado: en).
- Capacidad especial: "world model" del compilador Lean 4 con feedback inline.

## Casos de uso

- Demostración automática de teoremas en investigación matemática: el modelo puede generar pruebas completas para lemas y teoremas en Lean 4 con Mathlib, lo que permite a investigadores automatizar la formalización de resultados y verificar propiedades algebraicas o combinatorias de forma asistida.
- Reparación de pruebas fallidas: gracias a la predicción de diagnósticos del compilador, el modelo puede recibir una prueba que no compila y generar intentos corregidos dentro de la misma respuesta, reduciendo el número de iteraciones externas necesarias.
- Generación de código Lean para pipelines de CI/CD de proyectos formales: el modelo produce bloques `lean4` extraíbles (el runner de vLLM devuelve `lean_code` y `finish_reason` en JSONL), lo que facilita integrarlo en sistemas de verificación automática que compilan la última prueba completa generada.
- Asistencia a desarrolladores de bibliotecas formales: puede generar pruebas anotadas con goal states que sirven como documentación didáctica del proceso de demostración, útil para proyectos como Mathlib que requieren contribuciones verificadas.
- Investigación en razonamiento formal y RL: al ser un checkpoint post-GRPO con datasets publicados (CPT, SFT y RL), sirve como base para experimentos de aprendizaje por refuerzo en demostración de teoremas y para estudiar el efecto del "world model" en la auto-corrección.
- Evaluación comparativa de provers: el modelo puede usarse como referencia en benchmarks de demostración formal (por ejemplo, sobre el dataset Goedel-LM/RL_dataset_V2) para medir tasas de éxito en la generación de pruebas verificables.
- Generación de datos sintéticos para entrenamiento: las pruebas con feedback inline pueden emplearse como datos de entrenamiento para otros modelos o para aumentar datasets de demostración formal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16,4 GB de pesos, más overhead de activaciones y caché KV; se recomienda al menos 24 GB de VRAM para contexto moderado y 40-80 GB para aprovechar la ventana completa de 32.768 tokens.
- GPUs recomendadas: H100 (usada en el ejemplo oficial de la model card), A100 40/80 GB, y GPUs consumer de gama alta con 24 GB o más (por ejemplo, RTX 4090) para contextos reducidos.
- Cabe en GPU consumer: sí, en RTX 4090 (24 GB) con contexto limitado y en BF16; para cuantizaciones de 8 bits o 4 bits no se documentan pesos publicados, por lo que habría que generarlos.
- Opciones de despliegue: transformers (versión 4.57.3 recomendada), vLLM (versión 0.12.0 recomendada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles.
- Latencia y throughput estimados: no disponible; el ejemplo oficial usa `max_new_tokens` de hasta 2.048 y temperatura 0,3 con top-p 0,95 para una muestra, y temperatura 0,7 para 32 muestras en vLLM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EPFL-LARA/lean-world-model-qwen3-8b-grpo | 8,19B | 32.768 | Lean 4 con world model y feedback inline | Apache 2.0 | Hugging Face |
| Goedel-Prover (referencia del dataset RL) | no disponible | no disponible | Demostración formal en Lean | no disponible | no disponible en la informacion |
| Qwen/Qwen3-8B-Base (modelo base) | 8,19B | 32.768 | Generación de texto general | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este modelo con alternativas de la misma categoría; la comparativa se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- El modelo solo declara soporte para inglés, lo que limita su uso en entornos en castellano sin ajuste adicional.
- Riesgo de alucinación en los goal states y diagnósticos predichos: el feedback inline es una predicción del modelo, no una salida real del compilador, por lo que debe verificarse siempre con Lean 4 antes de aceptar una prueba.
- La prueba final debe extraerse como el último bloque completo de código Lean de la respuesta; respuestas truncadas o con bloques incompletos pueden llevar a errores de verificación.
- El prompt debe construirse con la plantilla exacta (incluida la línea final de nueva línea) y tokenizarse con `add_special_tokens=False`; desviarse de este formato puede degradar la calidad de la generación.
- El presupuesto de generación está limitado por el contexto restante tras el prompt dentro de los 32.768 tokens; prompts largos reducen el espacio disponible para la prueba.
- No se documentan capacidades de tool calling ni de integración con frameworks de agentes, lo que limita su uso en sistemas autónomos complejos.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones de los datasets de entrenamiento (CPT, SFT y Goedel-LM/RL_dataset_V2) por posibles restricciones adicionales.
- El modelo está validado contra Lean 4.15 y Mathlib; versiones distintas del compilador o de la biblioteca pueden producir incompatibilidades.
- No se han publicado benchmarks oficiales, por lo que no es posible estimar su tasa de éxito en demostración formal sin evaluaciones propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EPFL-LARA/lean-world-model-qwen3-8b-grpo
- Colección "Formal Theorem Proving with Lean World Models": https://huggingface.co/collections/EPFL-LARA/formal-theorem-proving-with-lean-world-model
- Dataset CPT: https://huggingface.co/datasets/EPFL-LARA/lean-world-model-cpt
- Dataset SFT: https://huggingface.co/datasets/EPFL-LARA/lean-world-model-sft
- Dataset RL: https://huggingface.co/datasets/Goedel-LM/RL_dataset_V2
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Respuesta de ejemplo completa: https://huggingface.co/EPFL-LARA/lean-world-model-qwen3-8b-grpo/blob/main/example_response.txt
- Entrada/salida JSON de ejemplo: https://huggingface.co/EPFL-LARA/lean-world-model-qwen3-8b-grpo/blob/main/example_output.json
- Prueba Lean de ejemplo: https://huggingface.co/EPFL-LARA/lean-world-model-qwen3-8b-grpo/blob/main/example_proof.lean
