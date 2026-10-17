# EPFL-LARA/lean-world-model-qwen3-8b-grpo

## Resumen

Lean World-Model Prover — Qwen3-8B es un modelo de generación de texto especializado en demostración formal de teoremas en Lean 4, desarrollado por el laboratorio EPFL-LARA de la École polytechnique fédérale de Lausanne. Se construye mediante un ajuste fino supervisado y posterior optimización con GRPO sobre el modelo base denso Qwen/Qwen3-8B-Base, de 8.190.735.360 parámetros (8,19 mil millones). El identificador del paper es WM8 y la versión publicada corresponde a la etapa posterior a GRPO.

La innovación principal es el planteamiento de «modelo del mundo» (world model) aplicado a Lean: en lugar de depender exclusivamente del compilador real, el modelo predice estados de objetivo (goal states) y diagnósticos del compilador, y los inserta como comentarios en línea dentro de la propia respuesta. Esto le permite simular el feedback del compilador y encadenar intentos de reparación de la prueba dentro de una sola generación, sin necesidad de una llamada externa al verificador entre intentos. El modelo resuelve el cuello de botella de coste del bucle de verificación en la demostración automática de teoremas.

Es relevante ahora porque se apoya en un modelo base moderno (familia Qwen3), emplea un pipeline de entrenamiento documentado en tres etapas (continual pre-training, SFT y RL con GRPO) y publica datasets específicos para Lean. El contexto total de inferencia declarado es de 32.768 tokens y el modelo está orientado exclusivamente a inglés. El repositorio presenta 0 descargas y 0 «likes» en el momento de la consulta, por lo que se trata de una publicación reciente y todavía poco validada por la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3) |
| Parámetros totales | 8.190.735.360 (8,19 mil millones) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens en total (según el runner de inferencia del autor) |
| Tipos de cuantización | no disponible (el repositorio publica pesos en safetensors, ~16,4 GB) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-8B-Base |
| Pipeline | text-generation |
| Librería | transformers |
| Tamaño del repositorio | 16,4 GB |
| Fecha de creación | 2026-10-16 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3-8B-Base, un transformer decoder-only denso de aproximadamente 8,19 mil millones de parámetros. Sobre esa base se aplican tres etapas de especialización documentadas por los datasets asociados: un continual pre-training con EPFL-LARA/lean-world-model-cpt, un ajuste fino supervisado con EPFL-LARA/lean-world-model-sft y una fase de refuerzo con GRPO (Group Relative Policy Optimization) sobre el dataset Goedel-LM/RL_dataset_V2. La etapa publicada corresponde al resultado tras el GRPO.

La innovación técnica central es el comportamiento de «world model»: el modelo genera la prueba dentro de un bloque de código `lean4` y la anota con bloques de feedback del compilador en el formato `/- <feedback> ... </feedback> -/`, que contienen estados de objetivo predichos y diagnósticos. Una misma respuesta puede contener varios intentos de prueba corregidos de forma sucesiva. No se especifican en la información disponible el número exacto de tokens de entrenamiento ni la composición detallada del dataset, más allá de los identificadores citados. Tampoco se documentan técnicas adicionales como decodificación especulativa o atención lineal específicas de este ajuste.

## Capacidades

- Generación de demostraciones completas en Lean 4 a partir de una declaración formal terminada en `by sorry`, con imports y contexto.
- Predicción de estados de objetivo (goal states) y diagnósticos del compilador insertados como comentarios de feedback en línea.
- Reparación de pruebas dentro de una única respuesta, encadenando intentos sucesivos sin retroalimentación externa del compilador entre ellos.
- Salida estructurada: bloques de código `lean4` delimitados, con el último bloque completo utilizable como candidato final para verificación con Lean.
- Salida en formato JSONL desde el runner proporcionado (`response`, `lean_code`, `finish_reason`).
- Soporte de muestreo múltiple: temperatura por defecto de 0,3 para una muestra y 0,7 para 32 muestras, con top-p 0,95.
- Razonamiento de tipo multi-paso limitado al bucle interno de intento y reparación dentro de la propia generación.
- Soporte de tool calling / function calling: no documentado.
- Capacidades de agentes sobre herramientas externas: no documentadas.
- Capacidades multilingües: no disponibles; el modelo declara únicamente inglés.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Demostración automática de teoremas en Lean 4: el modelo recibe una declaración con `sorry` y produce la prueba completa, con los estados de objetivo anotados para inspección. Es adecuado porque está ajustado específicamente sobre Lean 4 y Mathlib.
- Integración en pipelines de CI para proyectos Lean: el último bloque completo de cada respuesta se puede extraer y pasar al verificador de Lean en un job automatizado, reduciendo el coste del bucle de compilación durante el desarrollo.
- Reparación de pruebas rotas tras cambios en Mathlib: gracias a la simulación interna de diagnósticos y a los intentos de corrección sucesivos dentro de una misma respuesta, el modelo puede proponer versiones alternativas sin requerir una nueva llamada por cada error.
- Asistencia en el desarrollo de librerías formales: generación de pruebas auxiliares y lemas intermedios a partir del contexto y los imports declarados en el fichero.
- Generación de datos sintéticos de pruebas para entrenamiento: el muestreo múltiple (hasta 32 muestras con temperatura 0,7) permite producir varios candidatos por teorema para filtrar posteriormente con el compilador real.
- Herramienta docente para cursos de demostración formal: los comentarios de feedback con estados de objetivo predichos sirven como explicación paso a paso del razonamiento, útil para mostrar cómo se cierra una meta.
- Investigación en modelos del mundo para entornos formales: el modelo sirve como caso de estudio de simulación del compilador sin ejecución real, comparando los diagnósticos predichos con los reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16,4 GB solo de pesos, más la memoria de la caché KV correspondiente a los 32.768 tokens de contexto.
- VRAM estimada en cuantización de 8 bits: del orden de 8-9 GB de pesos, más caché KV.
- VRAM estimada en cuantización de 4 bits: del orden de 5-6 GB de pesos, más caché KV.
- GPU recomendadas para el despliegue documentado con vLLM 0.12.0: A100 (40 GB u 80 GB), H100, L40S o equivalentes con suficiente memoria para los pesos más la caché KV a 32.768 tokens.
- GPU de consumo: cabe en una RTX 4090 o RTX 3090 de 24 GB en bf16 si se limita el tamaño de lote y la longitud de contexto; con cuantizaciones de 8 o 4 bits sería viable en GPUs de 16 GB o menos, aunque esas cuantizaciones no están publicadas por el autor.
- Opciones de despliegue: vLLM 0.12.0 es la ruta documentada en la model card; la etiqueta `text-generation-inference` sugiere compatibilidad con TGI; también es cargable con `transformers`. Para llama.cpp u Ollama sería necesaria una conversión a GGUF no publicada en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EPFL-LARA/lean-world-model-qwen3-8b-grpo | 8,19 mil millones (denso) | 32.768 tokens | Demostración en Lean 4 con world model | no disponible | HuggingFace (safetensors) |
| Qwen/Qwen3-8B-Base | 8,19 mil millones (denso) | 32.768 tokens nativos | Modelo generalista de lenguaje | Apache-2.0 | HuggingFace (safetensors) |
| Otros demostradores abiertos para Lean (familia DeepSeek-Prover, Goedel-Prover) | no disponible | no disponible | Demostración formal en Lean | no disponible | no disponible |

La comparación directa de rendimiento en demostración formal no puede establecerse porque este modelo no publica resultados de benchmarks y las alternativas de la misma categoría no se han verificado en la información disponible. La diferencia funcional más marcada frente a un demostrador convencional es la generación integrada de estados de objetivo y diagnósticos predichos dentro de la respuesta.

## Limitaciones y advertencias

- Idioma: el modelo declara únicamente inglés, lo que limita su uso directo en castellano sin ajuste adicional.
- Licencia no disponible: no se especifican términos legales, por lo que el uso comercial presenta incertidumbre y requiere consulta previa al autor.
- Riesgo de alucinación en los diagnósticos y estados de objetivo predichos: al ser una simulación interna del compilador, las anotaciones de feedback pueden no coincidir con la salida real de Lean. Toda prueba debe verificarse con el compilador antes de su uso.
- Dependencia de la verificación externa: el modelo no garantiza la corrección formal; el último bloque de código debe pasar por Lean para confirmar la validez.
- Dominio estrecho: está especializado en Lean 4 y no en tareas generales de lenguaje, código o matemáticas fuera de ese entorno.
- Contexto limitado a 32.768 tokens en el runner documentado, lo que restringe el tamaño de los ficheros y del contexto de teoremas importados.
- Ausencia de benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas.
- Validación comunitaria muy baja en el momento de la consulta (0 descargas y 0 «likes»), lo que implica poca retroalimentación externa sobre su comportamiento en producción.
- No se documentan soporte de tool calling, capacidades multimodales ni modos de razonamiento ampliado más allá del bucle interno de reparación.
- Requiere seguir exactamente la plantilla de prompt del autor (incluida la línea final en blanco y la tokenización con `add_special_tokens=False`) para un comportamiento correcto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EPFL-LARA/lean-world-model-qwen3-8b-grpo
- Colección «Formal Theorem Proving with Lean World Models»: https://huggingface.co/collections/EPFL-LARA/formal-theorem-proving-with-lean-world-models-6ad2b4aa4400b3e2933f380d
- Modelo base Qwen3-8B-Base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Dataset de continual pre-training: https://huggingface.co/datasets/EPFL-LARA/lean-world-model-cpt
- Dataset de SFT: https://huggingface.co/datasets/EPFL-LARA/lean-world-model-sft
- Dataset de RL (GRPO): https://huggingface.co/datasets/Goedel-LM/RL_dataset_V2
- EPFL (École polytechnique fédérale de Lausanne): https://www.epfl.ch/
