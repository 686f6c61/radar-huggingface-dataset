# HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-dense-seed11-step-058

## Resumen

Este repositorio contiene un checkpoint intermedio del modelo Qwen3-4B-Instruct-2507 afinado mediante aprendizaje por refuerzo con GRPO sobre tareas médicas y un sistema de recompensas basado en rúbricas dinámicas ("OnlineRubrics"). Lo publica el colectivo HYU-NLP-EVAL como parte del run `phase1-online-rubrics-medicine-full-dense-20260919-seed11`, y corresponde concretamente al paso 58 de dicha ejecución. No es un modelo de producto: es un estado histórico de política (policy) conservado para auditoría del entrenamiento.

Técnicamente es un transformer decoder-only denso de 4.411.424.256 parámetros (unos 4,4 mil millones), derivado de la familia Qwen3, distribuido en BF16 con pesos en safetensors. El modelo se publica con el modo de razonamiento extendido ("thinking") desactivado, según se desprende de las descripciones de checkpoints hermanos del mismo run. Su relevancia es de investigación: sirve como material reproducible para estudiar cómo evoluciona una política de RL a lo largo de los pasos de entrenamiento cuando la señal de recompensa procede de rúbricas generadas en línea en lugar de rúbricas estáticas.

El checkpoint no incluye model card detallada, no declara idiomas soportados y no aporta resultados de evaluación. El autor indica explícitamente "research use only" y aclara que no se formula ninguna afirmación sobre capacidad clínica o seguridad médica. Cualquier uso en producción sanitaria o como asesor clínico carece de validación y debe descartarse.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card del checkpoint; los checkpoints hermanos del mismo run declaran 32.768 tokens; el modelo base Qwen3-4B-Instruct-2507 soporta 262.144 tokens de forma nativa |
| Tipos de cuantizacion | no se publican cuantizaciones; el repo contiene pesos BF16 (safetensors). Convertibles a GGUF, AWQ o GPTQ por el usuario |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 según metadatos, con la salvedad "research use only" indicada en la model card |
| Formato de pesos | safetensors (BF16) en la raíz del repo; `original_checkpoint/` con ficheros veRL (solo parámetros del modelo) |
| Tamano del repositorio | 26,5 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Run de entrenamiento | phase1-online-rubrics-medicine-full-dense-20260919-seed11, paso 58 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B-Instruct-2507: un transformer decoder-only denso con atención de consultas agrupadas (GQA) y normalización QK-Norm, preentrenado por Alibaba con datos multilingües y posteriormente ajustado con instrucciones. Sobre esa base, HYU-NLP-EVAL aplica un entrenamiento de refuerzo con GRPO cuyo rasgo distintivo es el uso de rúbricas "online": la función de recompensa no se fija de antemano, sino que se genera dinámicamente durante el entrenamiento. Los checkpoints hermanos del mismo run indican que este procedimiento se distingue explícitamente del GRPO con rúbricas estáticas. El dominio de las rúbricas y de las tareas es medicina.

El checkpoint del paso 58 es un estado intermedio de política, no el resultado final de la ejecución. El repositorio conserva en la raíz un modelo BF16 listo para inferencia y, en `original_checkpoint/`, los ficheros nativos de veRL con los parámetros, lo que permite reproducir o reanudar la auditoría del entrenamiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset médico, ni si hubo etapas adicionales de DPO o RLHF. Tampoco se documentan innovaciones de decodificación (decodificación especulativa, atención lineal u otras).

## Capacidades

- Generación de texto conversacional y de instrucciones, heredada del modelo base Qwen3-4B-Instruct-2507.
- Razonamiento y resolución de tareas en el dominio médico, condicionado por el sesgo del run de entrenamiento (rúbricas de medicina).
- Modo "thinking" desactivado, según las descripciones de checkpoints hermanos del mismo run; la generación es directa, sin cadena de razonamiento explícita separada.
- Capacidades multilingües: no disponibles como dato declarado; el modelo base Qwen3 es multilingüe, pero este checkpoint no documenta qué idiomas conserva tras el ajuste.
- Tool calling y function calling: no documentados para este checkpoint; el modelo base los soporta, pero no hay verificación publicada para este fine-tuning.
- Soporte de agentes y razonamiento multi-paso: no documentado ni evaluado.
- Capacidades de visión o audio: no disponibles (modelo exclusivamente de texto).
- Uso como política intermedia auditable: capacidad funcional del repositorio, útil para estudiar dinámicas de entrenamiento por RL.

## Casos de uso

- Auditoría de entrenamiento RL: comparar este paso 58 con otros checkpoints del mismo run (pasos 1, 3, 12, 13, 42) para trazar cómo evoluciona la política y detectar inestabilidades o colapso de la señal de recompensa.
- Investigación sobre rúbricas dinámicas: analizar empíricamente las diferencias entre GRPO con rúbricas online y GRPO con rúbricas estáticas, usando este checkpoint como punto de muestreo del run.
- Generación de datos sintéticos para dominios médicos: producir respuestas candidatas que después se filtran manualmente o con evaluadores automáticos, aceptando la ausencia de garantías clínicas.
- Estudios de reward hacking: inspeccionar si la optimización de rúbricas ha llevado a patrones de respuesta superficialmente correctos pero factualmente vacíos, comparando contra el modelo base.
- Red-teaming y análisis de seguridad: someter la política intermedia a baterías de prompts adversarios en el ámbito sanitario para medir deriva respecto al modelo base alineado.
- Reproducibilidad de experimentos: reanudar el entrenamiento desde `original_checkpoint/` con veRL para replicar resultados con la misma semilla (seed 11).
- Destilación o inicialización de experimentos posteriores: usar el checkpoint como punto de partida para nuevos ciclos de RL en lugar de arrancar desde el modelo base.
- Evaluación comparativa de checkpoints intermedios: construir una línea base para medir qué paso del entrenamiento ofrece mejor compromiso entre seguimiento de rúbricas y calidad general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Peso de los pesos en BF16: aproximadamente 8,8 GB (4,411 mil millones de parámetros a 2 bytes por parámetro). El repo completo ocupa 26,5 GB porque incluye los ficheros originales de veRL.
- VRAM total estimada para inferencia: en torno a 10-13 GB a contexto corto en BF16 (pesos más caché KV y activaciones); la caché KV crece de forma lineal con la longitud de contexto. A 32.768 tokens la caché añade varios gigabytes adicionales según la configuración de GQA.
- GPU consumer: cabe en una RTX 4090 (24 GB) en BF16 sin dificultad, y en GPUs de 16 GB con contexto reducido. Con cuantización a 8 bits o 4 bits entraría en tarjetas de 8-12 GB, aunque el autor no publica cuantizaciones.
- GPU de centro de datos: A100 40/80 GB, H100, L40S o A10G, todas sobredimensionadas para los pesos; su ventaja sería el throughput y el contexto largo.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference` presente), vLLM y SGLang para servicio de alto rendimiento. llama.cpp y Ollama requerirían convertir previamente los pesos a GGUF, algo que el autor no proporciona.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| qwen3-4b-rar-medicine-onlinerubrics-dense-seed11-step-058 | 4,41 mil millones | no declarado (hermanos: 32.768) | apache-2.0 con aviso "research use only" | Checkpoint intermedio de RL con rúbricas médicas; sin benchmarks ni garantías clínicas |
| Qwen/Qwen3-4B-Instruct-2507 | 4,02 mil millones | 262.144 tokens nativos | apache-2.0 | Modelo base del anterior; ajustado con instrucciones, sin RL con rúbricas; sí dispone de evaluaciones publicadas |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 mil millones | 128.000 tokens | Llama 3.2 Community License (con restricciones) | Alternativa de tamaño similar, ecosistema amplio, licencia no plenamente permisiva |
| microsoft/Phi-4-mini-instruct | 3,8 mil millones | 128.000 tokens | MIT | Alternativa densa de tamaño comparable, orientada a razonamiento y matemáticas |

Los datos de los modelos comparativos corresponden a sus fichas oficiales y no implican comparaciones de rendimiento con este checkpoint, que no ha sido evaluado públicamente.

## Limitaciones y advertencias

- Checkpoint intermedio: representa un estado histórico de la política en el paso 58, no una versión final optimizada ni validada.
- Conflicto de licencia: los metadatos declaran apache-2.0, pero la model card indica "research use only". Antes de cualquier uso comercial debe aclararse esta discrepancia con el autor.
- Ausencia total de evaluaciones: no hay benchmarks, ni evaluación clínica, ni métricas de seguridad. El autor declara explícitamente que no formula ninguna afirmación sobre capacidad médica o seguridad.
- Riesgo sanitario: un modelo afinado sobre rúbricas médicas puede producir afirmaciones con apariencia de autoridad clínica sin base factual. No debe emplearse para diagnóstico, triaje, prescripción ni consejo médico.
- Riesgo de reward hacking: la optimización contra rúbricas generadas dinámicamente puede favorecer respuestas que satisfacen el formato o los criterios de la rúbrica sin mejorar la corrección factual.
- Modo de razonamiento desactivado: no se dispone de trazas de pensamiento separadas, lo que dificulta auditar cómo llega el modelo a sus respuestas.
- Idiomas no declarados: se desconoce qué cobertura multilingüe conserva tras el ajuste; se recomienda verificar antes de usarlo fuera del inglés.
- Longitud de contexto no confirmada para este checkpoint concreto; el valor de 32.768 tokens proviene de descripciones de checkpoints hermanos, no de la ficha de este modelo.
- Sin cuantizaciones oficiales: el despliegue en hardware limitado exige convertir los pesos, con el consiguiente riesgo de degradación no medida.
- Sesgos heredados: al derivar de Qwen3-4B-Instruct-2507, arrastra los sesgos del preentrenamiento y del corpus de instrucciones del modelo base, potencialmente amplificados por el ajuste de refuerzo.
- Repositorio pesado (26,5 GB) por la duplicación de pesos en safetensors y en formato veRL.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-dense-seed11-step-058
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Checkpoint hermano, paso 001: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-001
- Checkpoint hermano, paso 003: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-003
- Checkpoint hermano, paso 012 (ficha en Friendli): https://friendli.ai/models/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-012
- Checkpoint hermano, paso 013 (ficha en Featherless): https://featherless.ai/models/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-013
- Checkpoint hermano, paso 042: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-042
- Registro en Free2AITools: https://free2aitools.com/model/hyu-nlp-eval/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-001
