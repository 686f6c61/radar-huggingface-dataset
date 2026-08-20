# elguantletai002/checklist-reviewer-qwen3-0.6b-n455

## Resumen

`elguantletai002/checklist-reviewer-qwen3-0.6b-n455` es un adaptador LoRA entrenado sobre el modelo base Qwen/Qwen3-0.6B, especializado en la revisión de código con salida estructurada en JSON. Desarrollado por el usuario elguantletai002, el modelo está diseñado para procesar un diff de código y generar una lista de hallazgos siguiendo un conjunto de diez reglas fijas, sin incluir elogios, parches ni el nombre del símbolo a modificar. El objetivo principal es convertir la revisión de código en un formato JSON validable por esquema, lo que facilita la integración en pipelines automatizados.

La relevancia de este adaptador radica en que demuestra cómo un modelo pequeño de 0,6 mil millones de parámetros, mediante fine-tuning con destilación de un profesor y un conjunto de datos reducido (455 ejemplos), puede acercarse a la calidad de sistemas de mayor tamaño en una tarea muy específica. Según la model card, el adaptador alcanza una adherencia al formato de 0,611 frente a un techo de 0,861 en modelos de frontera, y reduce los errores de formato de manera significativa. No obstante, no logra aprender la aritmética de los hunks (`@@`), lo que limita su precisión en la identificación exacta de la ubicación de los hallazgos.

La arquitectura base es un transformer decoder-only de 0,6B parámetros, con una ventana de contexto no especificada en la información disponible. El adaptador LoRA tiene un rango r=256 y alpha=256, y se entrenó en bf16 sin cuantización. El modelo se distribuye bajo licencia Apache 2.0 y está disponible en formato PEFT (safetensors).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3-0.6B (transformer decoder-only) con adaptadores LoRA |
| Parámetros totales | 0,6B (base) + adaptador LoRA (tamaño no especificado) |
| Parámetros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (entrenado en bf16 sin cuantización; el modelo base puede cuantizarse con técnicas estándar) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (PEFT) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-0.6B, un transformer decoder-only de 0,6 mil millones de parámetros. Sobre él se ha entrenado un adaptador LoRA con r=256, alpha=256 y `target_modules="all-linear"`, lo que actualiza todas las capas lineales del modelo. El entrenamiento se realizó en bf16, sin cuantización (no QLoRA), ya que la VRAM no era un limitante para un modelo de este tamaño en una GPU A10 de 24 GB.

El dataset de entrenamiento, `data/sft_v2.jsonl`, contiene 455 ejemplos destilados por un modelo profesor y filtrados. Se entrenó durante 2 épocas con un batch efectivo de 16 y una tasa de aprendizaje de 2e-4. La evaluación se realizó sobre `eval/sets/review_v2.jsonl`, cuyas fixtures no comparten líneas con los datos de entrenamiento, lo que garantiza que los resultados miden generalización y no memorización. Se destaca un defecto conocido: la librería TRL 0.15 no expone `assistant_only_loss` ni `completion_only_loss`, por lo que la pérdida cubría también el system prompt de aproximadamente 1.100 tokens. Esto derivó en que la mayor parte del gradiente se dedicara a reproducir la especificación, lo que explica parcialmente la baja puntuación en la métrica estricta.

## Capacidades

- Generación de salida JSON estructurada con hallazgos de revisión de código, siguiendo un esquema definido.
- Cumplimiento de un conjunto de diez reglas fijas de revisión (sin elogios, sin parches, sin nombrar el símbolo a cambiar).
- Formato de respuesta estricto: el modelo pasó de usar bloques de código Markdown en 32 de 36 respuestas a cero tras el entrenamiento.
- Capacidad de producir una lista de hallazgos (`findings`) que puede estar vacía cuando no hay problemas detectados.
- No se reportan capacidades adicionales como tool calling, agentes, razonamiento multi-paso o soporte multimodal; es un modelo de propósito único.

## Casos de uso

- **Revisión de pull requests en CI/CD**: el modelo puede integrarse en un pipeline de integración continua para analizar diffs de código y generar un JSON con hallazgos, que luego se envía al sistema de revisión (por ejemplo, GitHub o GitLab) para que los desarrolladores lo revisen.
- **Validación de cumplimiento de estándares de codificación**: dado un conjunto de reglas fijas, el modelo comprueba si el código cumple con las normas de estilo o arquitectura definidas, y reporta las infracciones en formato estructurado.
- **Generación de informes de revisión para equipos**: al producir JSON, el resultado puede integrarse en dashboards o herramientas de gestión de proyectos para visualizar la calidad del código de forma agregada.
- **Automatización de checklist en revisiones de código**: el modelo actúa como un checklist automatizado que verifica las diez reglas predefinidas, reduciendo el tiempo de revisión manual en equipos con alto volumen de cambios.
- **Base para sistemas de revisión asistida por IA**: dado su formato de salida estricto, puede servir como módulo de bajo coste en un sistema más grande que combine varios modelos para cubrir distintas tareas de calidad de código.
- **Pruebas de calidad en entornos de desarrollo**: se puede utilizar para evaluar automáticamente si un cambio de código cumple criterios de calidad antes de fusionarlo, integrándolo en herramientas de análisis estático.

## Benchmarks y rendimiento

La model card reporta resultados de evaluación en 36 escenarios, juzgados por `claude-sonnet-5` con una rúbrica fija. Se comparan el modelo base (sin adaptador), el adaptador entrenado y el límite superior alcanzado por un modelo de frontera (prompted frontier ceiling). No se especifica el nombre del modelo de frontera.

| Métrica | Base | Adaptador (n455) | Frontier ceiling |
|---|---|---|---|
| Spec-adherence | 0.139 | **0.611** | 0.861 |
| Robustness | 0.208 | 0.583 | 0.875 |
| Strict (regla correcta y ancla legal) | 0.028 | **0.278** | 0.806 |
| False-clean (menor es mejor) | 0.133 | 0.100 | 0.000 |

El adaptador cierra aproximadamente la mitad de la brecha en adherencia y un tercio en strict, pero no alcanza el umbral de 0.90 ni el techo del modelo de frontera. La principal causa de fallo es la aritmética de hunks (`@@`), que no fue aprendida durante el entrenamiento.

## Requisitos de hardware

- **VRAM estimada**: para inferencia, un modelo de 0.6B en bf16 requiere aproximadamente 1,2 GB de VRAM, más overhead de activaciones y atención. Con cuantización de 8 bits o 4 bits (si se aplica al modelo base) puede reducirse a menos de 1 GB. El adaptador LoRA añade una pequeña cantidad de parámetros (r=256), pero no afecta significativamente.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM es suficiente, por ejemplo, NVIDIA RTX 3060, RTX 4060, GTX 1660 Super, o incluso GPUs integradas de gama alta. La tarjeta A10 de 24 GB, usada para el entrenamiento, es más que suficiente para inferencia.
- **Despliegue en consumer GPU**: sí, cabe en la mayoría de GPUs de consumo. En CPU también es viable, aunque con mayor latencia.
- **Opciones de despliegue**: el modelo base + adaptador se puede cargar con Hugging Face Transformers y PEFT. Para producción, se recomienda servidores de inferencia como vLLM o TGI, que soportan PEFT. También puede convertirse a GGUF para usar con llama.cpp u Ollama, aunque la conversión no está documentada en la información disponible.
- **Latencia y throughput**: al ser un modelo de 0.6B, la latencia es muy baja en GPU (del orden de decenas de milisegundos por generación), aunque depende del tamaño de la entrada (el diff) y de la longitud de la salida. No se proporcionan datos cuantitativos en la model card.

## Comparativa con modelos similares

No se han identificado modelos comparables en el ecosistema de adaptadores LoRA para la tarea específica de revisión de código con salida estructurada. La model card incluye una comparación con el modelo base (Qwen3-0.6B) y con un límite de modelo de frontera, cuyos datos se recogen en la sección de benchmarks. Por tanto, no se dispone de alternativas de la misma categoría (mismo tamaño y misma función) para realizar una comparativa directa.

## Limitaciones y advertencias

- **Aritmética de hunks no aprendida**: el modelo no aprende a calcular correctamente las líneas de los `@@` en los diffs, lo que limita su precisión para señalar la ubicación exacta de los hallazgos (métrica `strict` de 0.278).
- **Riesgo de falsos negativos**: la métrica `false-clean` (menor es mejor) pasó de 0.133 a 0.100, lo que indica que el modelo aún no aprende a "decir nada" cuando no hay hallazgos; puede generar `{"findings": []}` de forma incorrecta en algunos casos.
- **Dependencia del system prompt**: el comportamiento definido solo es correcto si se usa el system prompt `spec/behavior_spec.md` del repositorio fuente; sin él, el modelo no funciona como se espera.
- **Entrenamiento con datos muy reducidos**: solo 455 ejemplos, lo que limita la generalización a otros estilos de código, lenguajes o reglas de revisión diferentes a las del conjunto de entrenamiento.
- **Pérdida con inclusión del system prompt**: el defecto en TRL 0.15 (falta de `assistant_only_loss`) hizo que la pérdida cubriera el prompt, lo que puede haber degradado la capacidad del modelo para seguir la tarea principal.
- **Sin información de idiomas**: no se especifica qué lenguajes de programación o idiomas de texto soporta el modelo; aunque el base Qwen3-0.6B es multilingüe, no se ha validado el adaptador en otros idiomas.
- **Sin datos de cuantización**: no se han probado cuantizaciones del adaptador ni del modelo base, por lo que su rendimiento con cuantización es desconocido.

## Enlaces

- [Hugging Face: elguantletai002/checklist-reviewer-qwen3-0.6b-n455](https://huggingface.co/elguantletai002/checklist-reviewer-qwen3-0.6b-n455)

No se han encontrado enlaces adicionales (papers, blogs, repositorios) en la información proporcionada.
