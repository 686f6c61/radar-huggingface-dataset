# RyanFoxW/btprop-sft-judge-qwen3-8b

## Resumen

btprop-sft-judge-qwen3-8b es un modelo de detección de alucinaciones desarrollado por RyanFoxW como parte del pipeline de verificación de hechos BTProp. Se trata de un fine-tuning SFT sobre Qwen3-8B, destilado del modelo teacher Qwen3.5-122B-A10B para la tarea de "juzgar": puntuar si una afirmación está respaldada por la evidencia recuperada. El autor lo publica explícitamente como un **resultado negativo archivado**, con el objetivo de que la afirmación que sustenta pueda ser verificada, no para su despliegue en producción.

El modelo tiene 8.190.735.360 parámetros (8B) y se distribuye en formato safetensors con licencia Apache-2.0. Según la model card, el experimento pretendía cerrar la brecha entre el modelo base sin entrenar y el teacher de 122B, pero el resultado fue peor de lo esperado: el modelo solo cierra un -10% de la brecha (es decir, empeora ligeramente respecto al base) y produce un 14,6% de respuestas no parseables, frente al 0% del base y el 1% del teacher. La causa identificada es que los objetivos de entrenamiento incluían cadenas de razonamiento muy largas (mediana de 9.619 caracteres) sin restricción de longitud, lo que llevó al estudiante a generar razonamientos extensos y luego fallar en producir una puntuación válida.

A pesar de ser un resultado negativo, el modelo tiene valor como caso de estudio sobre destilación de modelos grandes a pequeños, especialmente en tareas de razonamiento y evaluación. El autor señala que la ruta no está cerrada: el teacher sí tiene algo que enseñar, pero el problema de la longitud de las respuestas debe resolverse primero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-8B base) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer denso de 8.000 millones de parámetros. El entrenamiento consistió en un fine-tuning supervisado (SFT) sobre la tarea de "juzgar" del pipeline BTProp: dada una afirmación y la evidencia recuperada, el modelo debe producir una puntuación que indique si la afirmación está respaldada. Los datos de entrenamiento provienen de la destilación de trayectorias del teacher Qwen3.5-122B-A10B, un modelo MoE de 122B con 10B activos. Los objetivos de entrenamiento incluían cadenas de razonamiento completas (chain-of-thought) con una mediana de 9.619 caracteres, y el filtro de calidad era únicamente de formato, sin restricción de longitud.

La innovación técnica principal es el intento de destilar un modelo de 122B a uno de 8B para una tarea de evaluación compleja. Sin embargo, el experimento reveló un problema crítico: el estudiante aprendió a imitar la longitud del razonamiento del teacher pero no la capacidad de producir una puntuación parseable al final. El 14,6% de las afirmaciones terminan sin una puntuación válida, lo que invalida el uso práctico del modelo. El autor sugiere que la falta de restricción de longitud en el filtro de datos fue la causa principal.

## Capacidades

- Detección de alucinaciones por afirmación: puntúa si una afirmación está respaldada por la evidencia recuperada, dentro del pipeline BTProp.
- Razonamiento encadenado: genera cadenas de razonamiento extensas (aunque con problemas de parseabilidad).
- No se han documentado otras capacidades (generación de texto general, código, matemáticas, etc.) más allá de la tarea específica de judging.
- No soporta tool calling ni funciones de agente según la información disponible.
- Capacidades multilingües no especificadas.

## Casos de uso

Dado que el modelo es un resultado negativo archivado, no se recomienda su uso en producción. Los casos de uso realistas se limitan al ámbito de la investigación y el análisis:

- Estudio de destilación de modelos grandes a pequeños: sirve como caso documentado de fallo en la transferencia de habilidades de razonamiento, útil para investigar por qué la destilación de cadenas de pensamiento largas degrada la parseabilidad.
- Análisis de errores en detección de alucinaciones: el modelo puede usarse para estudiar cómo los estudiantes destilados tienden a imitar la forma pero no la función del teacher, y cómo la longitud del razonamiento afecta a la calidad de la salida.
- Benchmark de robustez de pipelines de verificación: al tener una alta tasa de respuestas no parseables, puede servir para probar sistemas de recuperación ante fallos o mecanismos de reintento.
- Investigación sobre filtros de datos en SFT: el caso ilustra la importancia de restringir la longitud de las respuestas en los datos de entrenamiento, y puede usarse como ejemplo en papers o tutoriales.
- Comparación de métricas de evaluación: el hecho de que el AUROC se calcule solo sobre las afirmaciones que el modelo puede responder (ignorando el 14,6% no parseable) es un ejemplo de sesgo de selección en evaluación, útil para discutir metodologías.
- Reproducción de experimentos: el código está disponible en GitHub, por lo que otros investigadores pueden reproducir el pipeline y verificar los resultados.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluación en la tarea de detección de alucinaciones por afirmación sobre el split de test BTProp stop-node (6 datasets, n=2.225 afirmaciones compartidas). El protocolo mantiene fijos la recuperación, el juicio y la agregación, de modo que solo varía el generador.

| Modelo | AUROC | PRAUC | Accuracy | Unparseable |
|---|---|---|---|---|
| Qwen3-8B (sin entrenar) | 0,8423 | 0,8038 | 78,28% | 0,0% |
| Qwen3.5-122B teacher | 0,8639 | 0,8340 | 79,40% | 1,0% |
| btprop-sft-judge-qwen3-8b | 0,8402 | 0,8082 | 77,69% | 14,6% |

La brecha entre el teacher y el base es de +0,0216 en AUROC. Este modelo cierra un -10% de esa brecha, es decir, empeora ligeramente respecto al base. Además, el AUROC reportado se calcula solo sobre las afirmaciones que el modelo pudo responder, lo que ya favorece al modelo. No se han publicado resultados en benchmarks generales como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 8B en precisión FP16, requiere aproximadamente 16 GB de VRAM. Con cuantización a 8 bits, unos 8 GB; a 4 bits, unos 4-5 GB.
- GPU recomendadas: una RTX 3090, RTX 4090 o A100 (24 GB) pueden ejecutar el modelo en FP16 sin problemas. Para cuantización 4 bits, una RTX 3060 de 12 GB sería suficiente.
- Sí cabe en GPUs de consumo: una RTX 4070 o superior con 12 GB puede ejecutarlo con cuantización.
- Opciones de despliegue: al ser safetensors, se puede cargar con Transformers, vLLM, llama.cpp (si se convierte a GGUF) u Ollama (si se convierte). No se han publicado archivos GGUF ni configuraciones específicas.
- Latencia y throughput: no disponibles. Al ser un modelo de 8B, en una GPU moderna se espera una latencia de decodificación de decenas de milisegundos por token, pero no hay mediciones publicadas.

## Comparativa con modelos similares

La comparativa más relevante es con el modelo base y el teacher, ya que son los que aparecen en la evaluación. No se dispone de datos de otros modelos de detección de alucinaciones del mismo tamaño.

| Modelo | Parámetros | Contexto | AUROC (BTProp) | Unparseable | Licencia |
|---|---|---|---|---|---|
| Qwen3-8B (base) | 8B | no disponible | 0,8423 | 0,0% | Apache-2.0 |
| btprop-sft-judge-qwen3-8b | 8B | no disponible | 0,8402 | 14,6% | Apache-2.0 |
| Qwen3.5-122B-A10B (teacher) | 122B (10B activos) | no disponible | 0,8639 | 1,0% | no disponible |

El modelo no mejora al base y es claramente inferior al teacher. No se han encontrado otros modelos comparables en la misma tarea con datos públicos.

## Limitaciones y advertencias

- Resultado negativo: el autor lo archiva explícitamente como un experimento fallido. No debe usarse en producción.
- Alta tasa de respuestas no parseables: el 14,6% de las afirmaciones no reciben una puntuación válida, lo que lo hace inutilizable en un pipeline automático sin mecanismos de reintento.
- Sesgo de evaluación: el AUROC reportado ignora las respuestas no parseables, lo que infla artificialmente el rendimiento aparente.
- Problema de longitud: el modelo tiende a generar razonamientos muy largos (aprendidos del teacher) que no terminan en una puntuación parseable.
- Sin datos de idiomas: no se especifica qué idiomas soporta, aunque al estar basado en Qwen3-8B probablemente herede sus capacidades multilingües, pero no está confirmado.
- Sin cuantizaciones publicadas: solo safetensors en FP16, lo que limita el despliegue en hardware modesto sin conversión manual.
- Riesgo de alucinación: al ser un modelo de detección de alucinaciones, su propia salida puede ser poco fiable, especialmente en las respuestas no parseables.
- Licencia Apache-2.0 permite uso comercial, pero el autor desaconseja cualquier uso práctico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RyanFoxW/btprop-sft-judge-qwen3-8b
- Repositorio de código BTProp: https://github.com/BENGAL-UCSB/BTProp (rama `layer1-v2-RL`)
- Modelo relacionado (tree-gen SFT): https://huggingface.co/RyanFoxW/Qwen3-8B-BTProp-mainmod1verify-SFT
- Modelo relacionado (RL v1): https://huggingface.co/RyanFoxW/btprop-rlv1-qwen3-8b
