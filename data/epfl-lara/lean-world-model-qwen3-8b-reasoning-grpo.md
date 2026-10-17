# EPFL-LARA/lean-world-model-qwen3-8b-reasoning-grpo

## Resumen

El Lean World-Model Prover Qwen3-8B (variante reasoning, entrenada con GRPO) es un ajuste fino del modelo base Qwen/Qwen3-8B-Base publicado por el grupo EPFL-LARA. Está especializado en demostración formal de teoremas en Lean 4 y su rasgo distintivo es que genera, junto a cada intento de prueba, estados de objetivo y diagnósticos del compilador predichos, insertados como comentarios en línea del tipo `/- <feedback> ... </feedback> -/`. Es decir, se comporta como un modelo del mundo (world model) de Lean, no solo como un generador de código.

La variante corresponde a "WM8 + reasoning", en la etapa "after informal reasoning": antes de escribir código Lean produce un plan informal con secciones fijas ([Problem Restatement], [Useful Observations], [Reasoning Path], [Key Derivation], [Proof Type], [Formal Anchors] y [Final Solution]) y, si un intento previo falla, encadena [Error Analysis], [Revised Reasoning] y [Updated Proof Plan] para reparar la prueba dentro de la misma respuesta. El modelo tiene 8.190.735.360 parámetros (~8,19 mil millones) y el runner oficial trabaja con un contexto total de 32.768 tokens en vLLM 0.12.0.

Es relevante porque combina pesos abiertos derivados de Qwen3-8B con un pipeline de ajuste específico para razonamiento formal (CPT, SFT, SFT de razonamiento y GRPO), lo que lo sitúa en el nicho de provers abiertos de tamaño medio, ejecutables en una sola GPU. Como contrapartida, la licencia no está declarada, solo se documenta el inglés como idioma y no hay resultados de benchmarks publicados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (fine-tune de Qwen/Qwen3-8B-Base); número de capas, cabezas y tipo de atención no disponibles |
| Parámetros totales | 8.190.735.360 (~8,19 B), dato real de safetensors |
| Parámetros activos | No aplica: modelo denso (no es MoE) |
| Longitud de contexto | 32.768 tokens (contexto total usado por el runner oficial de inferencia) |
| Tipos de cuantización | No disponible: el repositorio solo publica safetensors; no se distribuyen variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | en (inglés) |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería transformers) |
| Modelo base | Qwen/Qwen3-8B-Base (relación: finetune) |
| Método de ajuste | Fine-tune con GRPO (etiqueta del repositorio) |
| Datasets de entrenamiento | EPFL-LARA/lean-world-model-cpt, EPFL-LARA/lean-world-model-sft, EPFL-LARA/lean-world-model-reasoning-sft, Goedel-LM/RL_dataset_V2 |
| Pipeline | text-generation |
| Tamaño del repositorio | 16,4 GB |
| Compatibilidad de despliegue | text-generation-inference, endpoints_compatible, vLLM 0.12.0 (probado por el autor) |
| Fechas de publicación | Creado el 2026-10-16, actualizado el 2026-10-16 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-8B-Base, un transformer decoder-only denso de 8,19 mil millones de parámetros, y se ajusta mediante fine-tune supervisado sobre datos del dominio Lean. La información del repositorio no detalla el número de capas, la configuración de atención ni la composición exacta del corpus, pero los nombres de los datasets de entrenamiento (lean-world-model-cpt, lean-world-model-sft, lean-world-model-reasoning-sft y Goedel-LM/RL_dataset_V2) sugieren una cadena de continued pre-training, ajuste supervisado, ajuste supervisado orientado a razonamiento y una etapa final de aprendizaje por refuerzo con GRPO sobre un dataset de RL de Goedel-LM. No se documentan detalles de RLHF, DPO ni de filtrado de datos.

La innovación técnica principal no está en la arquitectura, sino en el formato de salida y en el objetivo de entrenamiento: el modelo aprende a predecir, dentro de la propia prueba, los estados de objetivo y los diagnósticos que devolvería el compilador de Lean 4, y a reutilizar esas predicciones para reparar intentos fallidos sin salir de la misma respuesta. El runner oficial emplea un prompt de completación en crudo (raw completion), tokenización plana con `add_special_tokens=False` y una ventana total de 32.768 tokens; la temperatura por defecto es 0,3 para una muestra y 0,7 para 32 muestras, con top-p 0,95. El autor no publica detalles de decodificación especulativa ni de optimizaciones de atención.

## Capacidades

- Generación de pruebas completas en Lean 4 para teoremas con `by sorry`, a partir de un fichero `.lean` con imports, contexto y enunciado.
- Predicción de estados de objetivo y diagnósticos del compilador Lean insertados como comentarios `/- <feedback> ... </feedback> -/` dentro del bloque de código.
- Reparación de pruebas dentro de una única respuesta: tras un intento fallido puede emitir [Error Analysis], [Revised Reasoning] y [Updated Proof Plan] seguidos de una nueva prueba corregida, y encadenar varios intentos.
- Razonamiento informal previo estructurado en secciones obligatorias ([Problem Restatement], [Useful Observations], [Reasoning Path], [Key Derivation], [Proof Type], [Formal Anchors], [Final Solution]).
- Razonamiento multi-paso orientado a demostración formal de teoremas matemáticos en el ecosistema Mathlib.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no documentado explícitamente; el bucle de reparación intra-respuesta es el mecanismo más cercano a un comportamiento iterativo.
- Capacidades multilingües: limitadas a inglés según la model card, aunque el código Lean generado es independiente del idioma natural.
- Visión, audio y otras modalidades: no disponibles.
- Modo "thinking": no se documenta un modo de pensamiento explícito separado; el equivalente funcional es el bloque de razonamiento informal previo a la prueba.

## Casos de uso

- Automatización de pruebas en proyectos Lean/Mathlib: dado un fichero con teoremas que terminan en `by sorry`, el modelo genera candidatos de prueba y el runner devuelve `lean_code` y `finish_reason` en JSONL, lo que permite integrarlo en un pipeline de CI que verifique cada candidato con el compilador real y conserve solo las pruebas válidas.
- Asistente de demostración en el editor: el bloque de razonamiento informal y los estados de objetivo predichos sirven como explicación paso a paso para un plugin de VS Code o de Lean LSP, reduciendo el ciclo de prueba y error del usuario.
- Reparación de pruebas tras actualizaciones de Mathlib: cuando un cambio de API rompe pruebas existentes, el modo de reparación (error analysis y nuevo plan) permite regenerar la prueba a partir del mensaje de error y del contexto del fichero.
- Generación de datos sintéticos para entrenar otros provers: las trayectorias con plan informal, prueba, feedback y reparación son material directamente reutilizable para SFT o para RL sobre modelos de demostración más pequeños.
- Formalización asistida de matemáticas: a partir de un enunciado formalizado con los imports necesarios, el modelo produce la prueba y comentarios que documentan la derivación, útil en proyectos de formalización a gran escala.
- Evaluación tipo pass@k: con 32 muestras por problema, temperatura 0,7 y top-p 0,95, el modelo está pensado para generar múltiples candidatos y medir la tasa de éxito con verificación externa en Lean.
- Docencia de Lean 4 y de razonamiento formal: los comentarios con estados de objetivo predichos y el plan informal permiten mostrar al estudiante por qué una táctica funciona o falla antes de ejecutar el compilador.
- Bucle de RL con verificador: un sistema de entrenamiento puede usar el world model como generador de rollouts y el compilador de Lean como recompensa binaria, aprovechando que el modelo ya está alineado con el formato de feedback.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Pesos en bf16/fp16: aproximadamente 16,4 GB (coincide con el tamaño del repositorio), por lo que se necesitan al menos 18-20 GB de VRAM contando caché KV y activaciones.
- Estimación aritmética a partir del número de parámetros: en 8 bits unos 8,2 GB y en 4 bits unos 4,5-5 GB de pesos, más caché KV. Estas cifras son estimaciones, no valores publicados por el autor.
- GPU de centro de datos: A100 40 GB y 80 GB, H100, L40S 48 GB. Cualquiera de ellas cubre el modelo completo con contexto de 32.768 tokens sin cuantizar.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede alojar los pesos en bf16, pero con 32.768 tokens de contexto la caché KV puede agotar la memoria; en tarjetas de 16 GB o menos es necesario cuantizar.
- Despliegue: vLLM 0.12.0 es la opción validada por el autor (el quickstart instala esa versión), y el repositorio está etiquetado como compatible con text-generation-inference y endpoints_compatible. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama requerirían una conversión propia no soportada oficialmente.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo por prueba.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| EPFL-LARA/lean-world-model-qwen3-8b-reasoning-grpo | 8,19 B (denso) | 32.768 tokens (runner oficial) | No disponible | Pesos safetensors en HuggingFace; 0 descargas y 0 likes en el momento de la consulta | Fine-tune de Qwen3-8B con GRPO; salida con estados de objetivo y diagnósticos predichos |
| Qwen/Qwen3-8B-Base | 8,19 B (denso) | No disponible en la información proporcionada | No disponible en la información proporcionada | Pesos abiertos en HuggingFace | Modelo base del ajuste; propósito general, sin especialización en Lean |
| Otros provers abiertos de la misma categoría (por ejemplo, la familia referenciada por el dataset Goedel-LM/RL_dataset_V2) | No disponible | No disponible | No disponible | No disponible | La información proporcionada no incluye sus especificaciones ni resultados, por lo que no es posible una comparación cuantitativa |

## Limitaciones y advertencias

- Licencia no declarada: no se especifican los términos de uso, por lo que el uso comercial queda en un limbo legal hasta que el autor lo aclare.
- Los estados de objetivo y los diagnósticos del compilador que genera el modelo son predicciones, no salidas reales del compilador; pueden ser incorrectos y no sustituyen la verificación con Lean 4.
- Riesgo de alucinación inherente a la generación de pruebas formales: el modelo puede producir tácticas plausibles que no compilan o que compilan pruebas de un enunciado distinto al pedido.
- Idiomas: la model card solo declara inglés. No hay evidencia de soporte de otros idiomas naturales.
- Contexto limitado a 32.768 tokens en la configuración del runner, lo que puede ser insuficiente para ficheros Lean con muchos imports y contexto extenso.
- Formato de prompt estricto: el rendimiento depende de respetar la plantilla con las secciones informales y el bloque final `lean4`; desviarse del formato puede degradar la calidad de la salida.
- Uso correcto de la salida: debe tomarse el último bloque de código Lean completo como candidato final, ya que una respuesta puede contener varios intentos corregidos.
- Sin validación comunitaria: el repositorio registra 0 descargas y 0 likes, y no hay resultados de benchmarks publicados que permitan estimar su tasa de éxito real.
- Sesgos: no documentados por el autor. El entrenamiento se apoya en corpus de matemáticas formales (Lean/Mathlib) y en un dataset de RL de terceros, lo que puede sesgar el modelo hacia determinados estilos de prueba y hacia los fragmentos de Mathlib presentes en los datos.
- Requisitos de entorno: el quickstart fija vLLM 0.12.0 y el uso de un prompt de completación con `add_special_tokens=False`; otras configuraciones no están validadas.
- Dependencia del modelo base: hereda las limitaciones de Qwen3-8B-Base, cuyos detalles de sesgos y comportamiento no se documentan en esta ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EPFL-LARA/lean-world-model-qwen3-8b-reasoning-grpo
- Colección "Formal Theorem Proving with Lean World Models": https://huggingface.co/collections/EPFL-LARA/formal-theorem-proving-with-lean-world-models-6ad2b4aa4400b3e2933f380d
- Organización EPFL-LARA en HuggingFace: https://huggingface.co/EPFL-LARA
- Dataset EPFL-LARA/lean-world-model-cpt: https://huggingface.co/datasets/EPFL-LARA/lean-world-model-cpt
- Dataset EPFL-LARA/lean-world-model-sft: https://huggingface.co/datasets/EPFL-LARA/lean-world-model-sft
- Dataset EPFL-LARA/lean-world-model-reasoning-sft: https://huggingface.co/datasets/EPFL-LARA/lean-world-model-reasoning-sft
- Dataset Goedel-LM/RL_dataset_V2: https://huggingface.co/datasets/Goedel-LM/RL_dataset_V2
- Modelo base Qwen/Qwen3-8B-Base: https://huggingface.co/Qwen/Qwen3-8B-Base
- EPFL (institución del autor): https://www.epfl.ch/en/
