# HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-040

## Resumen

`HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-040` es un checkpoint de investigación publicado por el equipo HYU-NLP-EVAL (Hyundai/Universidad, etiquetado como EVA Team 4 en repositorios hermanos) consistente en un ajuste fino del modelo denso Qwen3-4B-Instruct-2507 de Alibaba, orientado a dominios biomédicos. Concretamente, se trata de la iteración 40 de la ejecución de entrenamiento `261016_medicine_static_pilot`, con semilla 11, exportada en BF16 para Transformers y acompañada de los ficheros nativos de veRL/FSDP en el subdirectorio `original_checkpoint/`.

El modelo conserva la arquitectura y el tamaño del base: 4.022.468.096 parámetros, transformer decoder-only denso (sin mezcla de expertos). El peso del repositorio, 25,7 GB, corresponde principalmente al export en BF16 (unos 8 GB de pesos) más los estados de entrenamiento y checkpoints nativos conservados en el directorio original.

Su relevancia es acotada pero clara: no es un modelo listo para producción, sino una pieza de un barrido experimental sobre entrenamiento con refuerzo en el ámbito médico (los repositorios hermanos llevan etiquetas `grpo`, `static-rubric`, `rar-medicine`), publicado con licencia Apache 2.0 para permitir reproducibilidad y comparación entre pasos de entrenamiento. Resulta útil para investigadores que quieran estudiar la evolución del ajuste por RL con recompensas de rúbrica estática en modelos pequeños de dominio sanitario, no para despliegues clínicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3); número de capas y configuración de atención no disponibles |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no confirmada para este checkpoint; 32.768 tokens según la ficha del checkpoint hermano `step-002`; el modelo base Qwen3-4B-Instruct-2507 declara 262.144 tokens nativos |
| Tipos de cuantizacion | no se publican pesos cuantizados; el export oficial es BF16 y admite cuantización posterior a GGUF, GPTQ o AWQ por parte del usuario |
| Idiomas soportados | no disponibles (heredados del base Qwen3, multilingüe, sin listado oficial en esta ficha) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (export BF16 para Transformers); `original_checkpoint/` con ficheros nativos veRL/FSDP y metadatos |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B-Instruct-2507: un transformer denso decoder-only con 4.022 millones de parámetros, atención completa con RoPE y soporte nativo de tool calling y razonamiento en modo no-thinking (la variante 2507 es la iteración instruct "actualizada" de Qwen3, con contexto extendido a 262.144 tokens en el modelo original). Sobre esa base, este checkpoint aplica un ajuste fino por refuerzo en el dominio médico. Los ficheros de entrenamiento se generaron con veRL sobre FSDP, y los repositorios hermanos de la misma familia (`qwen3-4b-rar-medicine-static-r0-matched-seed11-step-000`) incluyen las etiquetas `grpo` y `static-rubric`, lo que apunta a optimización de política con GRPO y recompensas basadas en rúbricas estáticas de evaluación médica; esta correspondencia es una inferencia a partir de los repositorios hermanos, no una afirmación explícita de la model card de este checkpoint.

No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset médico, ni si hubo fases previas de SFT/DPO. La model card únicamente documenta la ejecución (`261016_medicine_static_pilot`), el paso (40) y la semilla (11), e indica que el checkpoint local se elimina solo tras verificar tamaños y hashes SHA256 de todos los ficheros remotos, lo que sugiere un pipeline de publicación automatizado y reproducible. El repositorio conserva tanto el export BF16 estándar como los estados nativos de entrenamiento, lo que facilita reanudar o auditar el proceso.

## Capacidades

- Generación de texto conversacional en inglés (idioma predominante del base), con plantilla de chat de Qwen3.
- Razonamiento y respuesta en dominios biomédicos, presumiblemente reforzado por el entrenamiento con rúbricas médicas, aunque sin evaluación publicada que lo cuantifique.
- Soporte de tool calling / function calling heredado de Qwen3-4B-Instruct-2507 (formato Hermes/Qwen).
- Capacidad de seguir instrucciones multi-turno y mantener contexto largo, sujeto a la ventana efectiva del checkpoint.
- Multilingüismo heredado del modelo base (más de 100 idiomas en la familia Qwen3), sin listado oficial ni evaluación para este ajuste.
- No dispone de visión, audio ni modo thinking explícito: la variante 2507 es instruct pura, sin `enable_thinking`.
- Al ser un checkpoint intermedio de un piloto de RL, sus capacidades pueden estar parcialmente degradadas respecto al base en tareas generales (olvido catastrófico parcial).

## Casos de uso

- Investigación en RLHF/RLVR médico: servir como punto de comparación (paso 40 frente a pasos 0, 2 u 38 de la misma ejecución) para estudiar la dinámica de entrenamiento con recompensas de rúbrica estática en modelos de 4B.
- Evaluación de olvido catastrófico: medir la degradación en benchmarks generales (MMLU, GSM8K) respecto a Qwen3-4B-Instruct-2507 tras el ajuste médico, gracias a disponer del checkpoint base y del ajustado con la misma licencia.
- Reproducibilidad de pipelines veRL/FSDP: el directorio `original_checkpoint/` permite reanudar el entrenamiento con los mismos estados de optimizador y comparar hashes SHA256, útil para validar infraestructuras de entrenamiento distribuidas.
- Generación de borradores de texto clínico en entornos de laboratorio: resúmenes de notas, reformulación de informes o extracción de entidades, siempre con revisión humana y sin uso clínico directo.
- Punto de partida para ajuste específico (SFT/LoRA) en subdominios médicos concretos: al ser un modelo de 4B con licencia Apache 2.0, cabe en una sola GPU consumer y permite iteraciones rápidas.
- Docencia y divulgación: ejemplo didáctico de cómo se publica un checkpoint intermedio de RL con trazabilidad de semilla, paso y verificación de integridad.
- Base para experimentos de destilación o comparación de políticas: su tamaño contenido y su contexto potencialmente largo lo hacen manejable en laboratorios con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, MedQA, PubMedQA, HealthBench ni HumanEval, y los repositorios de búsqueda asociados tampoco aportan cifras verificables para este paso concreto.

## Requisitos de hardware

- VRAM para inferencia en BF16: aproximadamente 8,1 GB solo de pesos (4.022 M × 2 bytes), más caché KV; con 8.192 tokens de contexto se estiman 10-12 GB totales en una GPU.
- VRAM para inferencia en FP8/INT8: en torno a 4-5 GB de pesos; con cuantización de 4 bits (GPTQ/AWQ/GGUF Q4) baja a 2,5-3 GB, más caché KV.
- GPU recomendadas: A100 40/80 GB o H100 para servir con contexto completo y lotes grandes; L40S o RTX 6000 Ada para producción moderada; RTX 4090 (24 GB) y RTX 3090 (24 GB) cubren BF16 con contexto largo sin problemas.
- Cabe en GPU consumer: sí. RTX 4090/3090 en BF16; RTX 4070 Ti Super (16 GB) y RTX 4080 (16 GB) con contexto moderado; RTX 4060 Ti 16 GB o GPUs de 8 GB solo con cuantización de 4-5 bits.
- Despliegue: vLLM y TGI son las opciones naturales al ser un export Transformers estándar (etiqueta `text-generation-inference` y `endpoints_compatible` en el repo); llama.cpp/Ollama requieren convertir previamente a GGUF, ya que no se distribuyen pesos cuantizados.
- Latencia y throughput: no disponibles. Como referencia orientativa de la clase de tamaño, un 4B denso en BF16 sobre una RTX 4090 suele generar decenas de tokens por segundo, pero no hay medición publicada para este checkpoint.
- Almacenamiento: 25,7 GB de repositorio, dominado por los checkpoints nativos de entrenamiento; para solo inferencia basta con descargar los safetensors del directorio raíz.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`step-040`) | 4.022 M | no confirmado (32.768 en un hermano; 262.144 en el base) | Apache 2.0 | Piloto de RL médico, paso intermedio | HuggingFace, 183 descargas |
| Qwen/Qwen3-4B-Instruct-2507 | 4.022 M | 262.144 tokens | Apache 2.0 | Instruct generalista, sin RL médico | HuggingFace, ampliamente desplegado |
| Qwen3-4B-Thinking-2507 | ~4.000 M | 262.144 tokens | Apache 2.0 | Razonamiento explícito (thinking mode) | HuggingFace |
| google/gemma-3-4b-it | ~4.000 M | 131.072 tokens | Gemma Terms of Use | Instruct multimodal (texto e imagen) | HuggingFace |
| meta-llama/Llama-3.2-3B-Instruct | 3.212 M | 131.072 tokens | Llama 3.2 Community License | Instruct generalista | HuggingFace |

La diferencia práctica frente a los alternativas no está en parámetros ni en contexto, sino en el propósito: este checkpoint es un artefacto de investigación con estados de entrenamiento completos y trazabilidad de semilla, mientras que los modelos citados son productos finales estables. Para cualquier uso en producción, Qwen3-4B-Instruct-2507 es la opción sensata; este checkpoint solo aporta valor en contextos experimentales.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 40) de un piloto, no un modelo final evaluado; se desconoce si el entrenamiento convergió o si el paso 40 es óptimo.
- Ausencia total de benchmarks: no hay evidencia publicada de mejora en tareas médicas ni de mantenimiento de capacidades generales.
- Riesgo elevado de alucinación en contenido clínico: ningún modelo de 4B debe usarse para decisiones diagnósticas o terapéuticas, y este no declara validación alguna.
- Posible olvido catastrófico parcial de capacidades generales tras el ajuste por refuerzo en un dominio estrecho.
- Idiomas no documentados: aunque el base es multilingüe, se desconoce el comportamiento del ajuste en castellano u otras lenguas distintas del inglés.
- Longitud de contexto ambigua: la ficha del hermano `step-002` indica 32.768 tokens, muy por debajo de los 262.144 del base; conviene verificar experimentalmente la ventana efectiva antes de diseñar prompts largos.
- Los sesgos del corpus médico de entrenamiento (poblaciones, sistemas sanitarios, terminología) no están documentados ni mitigados explícitamente.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero ello no exime de las responsabilidades regulatorias sanitarias (MDR, FDA) ni de las obligaciones de transparencia sobre el origen de los datos.
- El repositorio incluye checkpoints nativos de entrenamiento de 25,7 GB: descargarlo completo puede ser innecesario y costoso si solo se busca inferencia.
- No se distribuyen pesos cuantizados; el usuario asume el proceso de conversión y su validación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-040
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Checkpoint hermano step-002 (ficha con contexto de 32.768 tokens): https://featherless.ai/models/HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-002
- Checkpoint hermano step-038: https://featherless.ai/models/HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-038
- Repositorio relacionado con rúbricas estáticas y GRPO: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-seed11-step-000
- Repositorio relacionado HealthBench: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-healthbench-static-r0-step-000
- Ficha de un checkpoint denso de la misma familia en LLM Explorer: https://llm-explorer.com/model/HYU-NLP-EVAL%2Fqwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-008,cMGLnuq6Ni0ObvQjQQgbT
