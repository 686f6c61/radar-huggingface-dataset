# HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-002

# Qwen3-4B RaR-Medicine static R0 matched dense, step 002

## Resumen

El modelo `HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-002` es un checkpoint de investigación derivado de Qwen3-4B-Instruct-2507, publicado por el grupo HYU-NLP-EVAL. Se trata de un transformer denso de 4.022.468.096 parámetros, con una longitud de contexto de 32.768 tokens heredada del modelo base y pesos en BF16 con formato safetensors.

El nombre del run (`phase1-static-r0-medicine-qwen3-4b-matched-dense-20260928-seed11`) indica que el checkpoint procede de un entrenamiento con GRPO y rúbricas estáticas en el dominio médico, y que corresponde al paso 2 de dicha ejecución. Es, por tanto, una política intermedia y no un modelo final: su utilidad principal es la auditoría y la reproducibilidad de experimentos de aprendizaje por refuerzo, no el despliegue en producción.

La relevancia actual de este tipo de artefactos radica en el interés creciente por los métodos de RL con recompensas basadas en rúbricas (el nombre RaR del repositorio apunta a esta técnica) para alinear modelos en dominios especializados. Al publicar checkpoints intermedios con semillas y configuraciones concretas, el grupo facilita estudios de ablación y comparaciones controladas, aunque el propio autor restringe el uso a investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3) |
| Parámetros totales | 4.022.468.096 (4,02 B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantización | BF16 (único formato publicado); no se distribuyen cuantizaciones GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible (el modelo base declara soporte multilingüe, pero no se especifica para este checkpoint) |
| Licencia | Apache-2.0 declarada en metadatos, con aviso "research use only" en la model card |
| Formato de pesos | safetensors (BF16); `original_checkpoint/` con archivos veRL (solo parámetros del modelo) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Qwen3, sin mezcla de expertos (MoE), con 4.022.468.096 parámetros. Hereda del modelo base Qwen3-4B-Instruct-2507 la arquitectura, el tokenizador y la ventana de contexto de 32.768 tokens. El repositorio principal contiene pesos en BF16 listos para inferencia, mientras que el directorio `original_checkpoint/` conserva los archivos originales del entrenamiento con veRL (solo parámetros del modelo).

El entrenamiento se enmarca en el run `phase1-static-r0-medicine-qwen3-4b-matched-dense-20260928-seed11`, que según la nomenclatura combina GRPO (Group Relative Policy Optimization) con rúbricas estáticas (static-r0) sobre Qwen3-4B-Instruct-2507. El calificativo "matched dense" sugiere que se trata de un control denso emparejado con otra configuración experimental (probablemente una variante MoE o de otro tipo), aunque la información proporcionada no detalla el diseño completo del experimento. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases adicionales de RLHF o DPO.

## Capacidades

- Generación de texto y conversación multi-turno: heredada del modelo base Qwen3-4B-Instruct-2507.
- Razonamiento, matemáticas y generación de código: capacidades del modelo base, no verificadas en este checkpoint intermedio.
- Soporte de tool calling y function calling: el modelo base lo incluye; no hay confirmación específica para este checkpoint.
- Soporte para agentes y razonamiento multi-paso: el modelo base está diseñado para ello, pero este checkpoint podría no conservarlo tras solo dos pasos de GRPO.
- Capacidades multilingües: no disponibles; el modelo base declara soporte para más de 100 idiomas, pero no se especifica aquí.
- Modo thinking: otras variantes de la misma familia (OnlineRubrics) indican que el razonamiento extendido está desactivado; no se confirma para este checkpoint concreto.

## Casos de uso

- Auditoría de dinámicas de entrenamiento con GRPO: permite comparar el estado de la política en el paso 2 con checkpoints posteriores del mismo run (por ejemplo, el step 036 de la variante matched) para estudiar la evolución de las recompensas y la estabilidad del entrenamiento.
- Ablación de recompensas basadas en rúbricas: al ser un checkpoint "static-r0", sirve como referencia frente a variantes con rúbricas dinámicas (OnlineRubrics) y ayuda a medir el impacto del tipo de rúbrica en el comportamiento del modelo.
- Control denso en experimentos con arquitecturas alternativas: la etiqueta "matched dense" sugiere su uso como línea base para comparar con variantes MoE u otras configuraciones, manteniendo constantes los parámetros activos.
- Investigación sobre "reward hacking" en dominio médico: analizar si el modelo intermedio explota atajos en las rúbricas de recompensa, un fenómeno habitual en RL con recompensas basadas en plantillas.
- Prototipado de asistentes de preguntas y respuestas médicas (solo investigación): aunque no hay garantías clínicas, el checkpoint puede emplearse en experimentos controlados de generación de respuestas a preguntas biomédicas para estudiar sesgos y alucinaciones.
- Generación de datos sintéticos con supervisión humana: usar el modelo para producir borradores de textos médicos que luego se filtran y corrigen, siempre dentro de un pipeline de investigación y con revisión experta.
- Reproducibilidad de experimentos: la semilla fija (seed11) y el paso concreto (step 002) permiten reproducir condiciones iniciales en estudios comparativos de RL.
- Evaluación de la degradación de capacidades tras RL: comprobar si habilidades del modelo base (código, matemáticas, tool calling) se mantienen o se pierden en las primeras etapas de un entrenamiento específico de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos comparativos con el modelo base ni con alternativas, ni métricas de MMLU, HumanEval, GSM8K u otras.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 8,05 GB (4.022.468.096 parámetros × 2 bytes).
- VRAM para inferencia: con contexto corto, en torno a 10-12 GB; con la ventana completa de 32.768 tokens, el KV cache añade varios GB, por lo que se recomiendan 16-24 GB de VRAM.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB), H100 (80 GB). En GPUs de 12 GB o menos sería necesario cuantizar, pero no se distribuyen pesos cuantizados.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en BF16 con contexto moderado; en RTX 3060 (12 GB) requeriría una cuantización no disponible.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference`), vLLM, SGLang. No se proporcionan archivos GGUF, por lo que llama.cpp y Ollama no son utilizables directamente sin conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este checkpoint (step 002) | 4,02 B | 32.768 (heredado) | Apache-2.0 + aviso "research use only" | HuggingFace, uso restringido a investigación |
| Qwen3-4B-Instruct-2507 (base) | 4,02 B | 32.768 | Apache-2.0 | HuggingFace, uso general |
| Llama-3.2-3B-Instruct | 3,2 B | 128.000 | Llama 3.2 Community License | HuggingFace, uso comercial con restricciones |
| Phi-3.5-mini-instruct | 3,8 B | 128.000 | MIT | HuggingFace, uso comercial |

No se dispone de datos de rendimiento comparativos para este checkpoint; la comparación se limita a especificaciones y licencias.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 2 de un entrenamiento, por lo que no ha convergido y no debe tratarse como un modelo final.
- Uso exclusivo en investigación: aunque los metadatos declaran Apache-2.0, la model card indica "Research use only", lo que genera ambigüedad legal para uso comercial.
- Sin garantías médicas: a pesar del nombre "RaR-Medicine", el autor no reclama capacidad ni seguridad clínica; no debe usarse para diagnóstico ni consejo médico.
- Riesgo de alucinación: elevado en dominios especializados como medicina, especialmente en una política que solo ha recibido dos pasos de RL.
- Posible degradación de capacidades: el ajuste con GRPO puede deteriorar habilidades del modelo base (código, matemáticas, multilingüismo) no evaluadas en este checkpoint.
- Idiomas no declarados: no se especifica qué idiomas mantiene; el base declara más de 100, pero no hay verificación.
- Modo thinking: otras variantes de la misma familia indican que el razonamiento extendido está desactivado; no se confirma para este checkpoint.
- Sin cuantizaciones: no hay GGUF, AWQ ni GPTQ, lo que limita el despliegue en hardware de gama baja.
- Sesgos: hereda los sesgos de Qwen3-4B-Instruct-2507 y puede amplificarlos tras el entrenamiento en un subconjunto médico.
- Fecha de creación futura (2026-10-01): el repositorio indica una fecha posterior a la actual, lo que puede deberse a un error de metadatos o a un entorno de pruebas; conviene verificarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-002
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Checkpoint relacionado (static, step 036): https://free2aitools.com/model/hyu-nlp-eval/qwen3-4b-rar-medicine-static-r0-matched-seed11-step-036
- Variante OnlineRubrics, step 000: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-000
- Variante OnlineRubrics, step 013: https://featherless.ai/models/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-013
- Variante OnlineRubrics, step 018: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-018
- Mirror en Friendli (step 018): https://friendli.ai/models/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-018
