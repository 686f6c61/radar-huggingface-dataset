# reaperdoesntknow/DualMind-TKD-Agentic-1.7B

## Resumen

DualMind TKD Agentic 1.7B es un modelo derivado del Qwen3-1.7B desarrollado por Convergent Intelligence LLC (bajo el alias reaperdoesntknow en Hugging Face). Se trata de un ajuste fino en dos etapas que combina destilación de conocimiento matemático guiada por topología con una especialización posterior en uso de herramientas y function calling. El modelo parte de una arquitectura transformer densa de 1.720.574.976 parámetros y mantiene las capacidades del Qwen3 base, incluyendo su modo de razonamiento.

La propuesta del autor es transferir comportamiento de razonamiento matemático desde un profesor mayor (Qwen3-8B) hacia el estudiante de 1.7B, aplicando señales estructurales adicionales durante la destilación, y después especializar el modelo en la generación de llamadas a herramientas mediante LoRA fusionado. El resultado es un modelo pequeño, orientado a investigación y a experimentación con bucles de agentes, no a un despliegue de producción sin evaluación previa.

Su relevancia actual radica en que explora técnicas de destilación con señales topológicas sobre un modelo compacto que puede ejecutarse en hardware de consumo, y en que integra capacidades de tool calling en un tamaño reducido. No obstante, el propio autor advierte que no se han publicado resultados formales de benchmarks y que el modelo no ha sido validado para usos de alto impacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors; el modelo base Qwen3-1.7B admite cuantizacion GGUF/AWQ, pero no se confirma para este derivado) |
| Idiomas soportados | Ingles (en) |
| Licencia | other (base Apache-2.0; dataset de calculo sin licencia clara) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 1.7B parámetros heredado de Qwen3-1.7B. El entrenamiento se realizó en dos etapas. La primera consistió en un ajuste fino de modelo completo con destilación de conocimiento guiada por topología: el estudiante (Qwen3-1.7B) aprendió de un profesor Qwen3-8B sobre el dataset `0xZee/dataset-CoT-Advanced-Calculus-268`. La función de pérdida combinó entropía cruzada supervisada con destilación selectiva top-k y de cola sobre las distribuciones del profesor. Se incorporaron señales estructurales como la discrepancia entre distribuciones, la topología de transiciones, diagnósticos de energía de hueco y una supervisión ponderada por fases (Explore/Examine/Response), con el objetivo de presionar el aprendizaje en derivaciones, verificación y transiciones de razonamiento de alta discrepancia.

La segunda etapa aplicó una especialización LoRA sobre `NousResearch/hermes-function-calling-v1`, seguida de la fusión de pesos en el modelo final. La supervisión se limitó a las respuestas del asistente y a las llamadas a herramientas; los esquemas de herramientas, mensajes de usuario y resultados de herramientas se incluyeron como contexto pero no contribuyeron a la pérdida. Para mitigar el olvido catastrófico se mezcló replay matemático durante esta etapa. El repositorio contiene el modelo fusionado, por lo que no se requiere un adaptador PEFT separado para inferencia.

## Capacidades

- Generación de texto conversacional y razonamiento técnico.
- Razonamiento matemático y cálculo avanzado, con trazas de razonamiento derivadas de la destilación del profesor.
- Generación de llamadas a funciones y uso de herramientas (function calling / tool use) en formato estructurado.
- Selección de herramientas en experimentos de agentes y bucles multi-paso (el modelo genera la llamada; la ejecución la realiza un runtime externo).
- Capacidades multilingües limitadas al inglés.
- Soporte de modo de razonamiento heredado del Qwen3 base (no detallado explícitamente en la model card de este derivado).
- Apto para continuación de entrenamiento supervisado u optimización de preferencias.

## Casos de uso

- Investigación en destilación guiada por topología: el modelo sirve como artefacto reproducible para estudiar cómo las señales estructurales del profesor afectan al comportamiento del estudiante en tareas de derivación y verificación matemática.
- Experimentación con bucles de agentes: un runtime externo puede parsear las llamadas a herramientas generadas, ejecutarlas, añadir el resultado a la conversación y reinvocar el modelo para el siguiente paso, lo que permite prototipar orquestadores de agentes sobre un modelo de 1.7B ejecutable en hardware modesto.
- Evaluación de function calling en modelos pequeños: útil para comparar la calidad de selección de herramientas y el formato de las llamadas frente a otros modelos del mismo tamaño antes de escalar a modelos mayores.
- Asistente de cálculo técnico en entornos controlados: generación de derivaciones paso a paso con verificación, adecuado para herramientas internas de apoyo a estudiantes o desarrolladores, siempre con revisión humana.
- Generación de código auxiliar con integración de herramientas: el modelo puede emitir llamadas a funciones en pipelines de automatización donde un runtime valide y ejecute las acciones.
- Base para ajuste fino adicional: al estar fusionado y disponible en safetensors, puede servir como punto de partida para SFT o DPO específicos de dominio en investigación.
- Pruebas de retención y olvido catastrófico: el replay matemático mezclado en la etapa 2 permite estudiar empíricamente la retención de capacidades tras la especialización agéntica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que esta release no reclama resultados formales de evaluación; el pipeline incluyó monitorización de pérdida en conjuntos reservados y pruebas cualitativas de generación, pero recomienda ejecutar benchmarks externos de matemáticas, function calling, retención y seguridad antes de cualquier uso en producción.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 3,5 GB solo para pesos, más overhead de activaciones y caché KV.
- En cuantización de 8 bits: en torno a 2 GB de VRAM; en 4 bits: en torno a 1 GB, aunque estos valores son estimaciones según el tamaño y no están confirmados para este derivado concreto.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 con comodidad (RTX 3060, RTX 4060, RTX 4090); A100/H100 sobredimensionadas para este tamaño, útiles solo para entrenamiento o serving a gran escala.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en fp16 y en tarjetas con 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers (carga indicada por el autor), text-generation-inference (el modelo declara compatibilidad con endpoints), vLLM y llama.cpp/Ollama previa conversión a GGUF (no se proporcionan artefactos GGUF en el repositorio).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DualMind TKD Agentic 1.7B | 1,72B | No disponible | Destilacion matematica + function calling | other | Hugging Face |
| Qwen/Qwen3-1.7B (base) | 1,72B | No disponible en esta ficha | Modelo generalista con modo de razonamiento | Apache-2.0 | Hugging Face |
| Qwen/Qwen3-8B (profesor) | 8B | No disponible en esta ficha | Modelo generalista de mayor escala | Apache-2.0 | Hugging Face |
| NousResearch/Hermes (familia) | Variable | No disponible en esta ficha | Especializacion en function calling | Apache-2.0 (segun dataset) | Hugging Face |

La comparación cuantitativa de rendimiento no es posible porque el autor no publica benchmarks. Frente al Qwen3-1.7B base, este derivado añade especialización agéntica y matemática a costa de una licencia menos clara y de un riesgo de olvido de capacidades generales. Frente al profesor Qwen3-8B, ofrece un tamaño cuatro veces menor con las ventajas de despliegue asociadas, pero sin garantías de paridad en razonamiento.

## Limitaciones y advertencias

- El dataset de matemáticas de origen es pequeño, lo que limita la cobertura y generalización del razonamiento matemático.
- Las trazas de razonamiento sintéticas o generadas pueden contener derivaciones incorrectas o respuestas finales contradictorias.
- El formato correcto de una llamada a herramienta no garantiza que la herramienta seleccionada sea la adecuada.
- Las salidas de herramientas externas deben tratarse como entrada no confiable.
- El replay matemático reduce el olvido, pero no demuestra retención de capacidades; el autor lo señala explícitamente.
- El modelo no ha sido establecido como seguro para acciones autónomas de alto impacto, médicas, financieras o legales.
- El modelo no ejecuta herramientas por sí mismo; requiere un runtime externo que parsee, ejecute y reintegre resultados.
- Idiomas: solo inglés declarado; no se garantiza un comportamiento adecuado en castellano u otros idiomas.
- Licencia: marcada como "other" porque el dataset de cálculo avanzado no exponía una licencia clara en el momento de redactar la model card; debe confirmarse antes de un uso comercial o de relicenciar el derivado.
- No se han publicado benchmarks formales; cualquier decisión de producción debe basarse en evaluaciones propias.
- Sesgos conocidos: no documentados en la información proporcionada, pero heredables del Qwen3 base y de los datasets de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/DualMind-TKD-Agentic-1.7B
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Profesor de destilación (etapa 1): https://huggingface.co/Qwen/Qwen3-8B
- Dataset de cálculo avanzado: https://huggingface.co/datasets/0xZee/dataset-CoT-Advanced-Calculus-268
- Dataset de function calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Perfil del autor: https://huggingface.co/reaperdoesntknow
