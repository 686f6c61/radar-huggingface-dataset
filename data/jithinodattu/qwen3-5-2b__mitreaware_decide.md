# jithinodattu/Qwen3.5-2B__mitreaware_decide

## Resumen

Qwen3.5-2B__mitreaware_decide es un modelo de decisión estructurada especializado en ciberseguridad, desarrollado por el usuario jithinodattu y publicado en HuggingFace. Se trata de un adaptador LoRA (PEFT) montado sobre el modelo base jithinodattu/Qwen3.5-2B__mitreaware, un modelo de 2B parámetros entrenado con datos MITRE (ATT&CK, CVE, CWE e inteligencia de amenazas). El modelo resuelve un problema concreto en flujos de trabajo de SOC (Security Operations Center): convertir alertas de seguridad en decisiones estructuradas y calibradas, con una probabilidad asociada a cada opción, evitando así el parseo de texto libre y el mantenimiento de trucos de prompting.

Su relevancia radica en el enfoque de "cabeza de decisión": en lugar de generar texto, el modelo responde cada pregunta con una opción y probabilidades calibradas en una sola pasada hacia adelante. Esto lo hace apto para triaje automatizado de alertas, clasificación de tácticas MITRE ATT&CK y puntuación de severidad, con un coste de hardware muy bajo (entrenado en unos 30 minutos sobre una NVIDIA L4 con 4,4 GB de memoria pico). La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-2B) con cabeza de decisión y adaptador LoRA (r = 16) |
| Parametros totales | 2B (modelo base); tamaño del repositorio de adaptadores: 0,3 GB |
| Parametros activos | no disponible |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | 4 bits (load_in_4bit) |
| Idiomas soportados | no disponible (entrenado sobre datos de ciberseguridad en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores LoRA + cabeza de decisión, vía PEFT/Unsloth) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3.5-2B__mitreaware, un modelo de 2B parámetros preentrenado con datos del ecosistema MITRE: ATT&CK, CVE, CWE e informes de inteligencia de amenazas (CTI). Sobre este base se ajusta un adaptador LoRA con rango 16 y una cabeza de decisión entrenada mediante `FastDecisionModel` de Unsloth. Esta cabeza lee todas las preguntas asociadas a una entrada en una única pasada hacia adelante, en lugar de generar una respuesta por pregunta, lo que reduce significativamente la latencia en escenarios con múltiples preguntas por alerta.

El entrenamiento se realizó con el dataset LocalLLaMA/typed-decisions, que define tres tipos de pregunta: `choice` (selección de una opción entre criterios), `noul` (respuesta sí/no) y `score` (selección de un nivel). Tras el entrenamiento, se aplicó una calibración de probabilidades ajustada sobre filas held-out, de modo que la confianza declarada se aproxime a la precisión real. El entrenamiento completo took unos 30 minutos en una única NVIDIA L4 con 4,4 GB de memoria pico, usando Unsloth 2026.10.11, Transformers 5.2.0 y Torch 2.8.0.

## Capacidades

- Clasificación estructurada de alertas de seguridad: asignación de tácticas MITRE ATT&CK (TA0001 a TA0011) a partir del texto de una alerta EDR o similar.
- Decisiones binarias calibradas (tipo `noul`): por ejemplo, decidir si una alerta debe escalarse a respuesta a incidentes.
- Puntuación ordinal (tipo `score`): asignación de niveles de severidad (low, medium, high, critical).
- Salida de probabilidades por opción: cada respuesta incluye la distribución de probabilidad completa, no solo la etiqueta elegida.
- Procesamiento multi-pregunta en una sola pasada: varias preguntas sobre la misma alerta se resuelven en un único forward pass.
- Manejo de entradas largas: hasta 8192 tokens por entrada, manteniendo la pregunta y las opciones en entradas extensas.
- Comprensión de dominio de ciberseguridad: el modelo base fue entrenado con ATT&CK, CVE, CWE y CTI, por lo que funciona sobre alertas, advisories y reportes de inteligencia de amenazas.
- No genera texto libre: la salida es siempre estructurada, lo que simplifica la integración en pipelines automatizados.

## Casos de uso

- Triaje de alertas en un SOC: dada una alerta EDR (por ejemplo, PowerShell codificado en base64 generado por winword.exe con volcado de lsass.exe), el modelo puede asignar en una pasada la táctica ATT&CK más crítica, decidir si escalar a IR y puntuar la severidad, con probabilidades calibradas para enrutar las alertas de baja confianza a un analista humano.
- Mapeo automático a MITRE ATT&CK: clasificación de tácticas (initial_access, execution, persistence, credential_access, lateral_movement, command_and_control, exfiltration) sobre alertas, advisories y reportes CTI, útil para enriquecer SIEM y plataformas de threat intelligence.
- Filtrado de falsos positivos: la pregunta binaria `noul` permite decidir si una alerta merece escalado, usando el umbral de probabilidad calibrado para descartar automáticamente las de baja confianza.
- Priorización de incidentes: el tipo `score` permite puntuar severidad (low/medium/high/critical) de forma consistente y calibrada, útil para colas de trabajo ordenadas por riesgo.
- Enriquecimiento de pipelines SOAR: al devolver salidas estructuradas con probabilidades (sin texto libre), se integra directamente en playbooks de automatización sin necesidad de parsers ni prompt engineering frágil.
- Análisis de advisories de vulnerabilidades (CVE/CWE): clasificación de reportes de vulnerabilidades por tipo de debilidad, explotabilidad o severidad, aprovechando el entrenamiento del modelo base en CVE y CWE.
- Despliegue en hardware modesto: al ser un modelo de 2B en 4 bits, puede ejecutarse en GPUs de gama baja o de instancia cloud económica (como una L4), lo que lo hace viable para SOC con presupuesto limitado.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo sobre el dataset LocalLLaMA/typed-decisions (formato de decisión y calibración, no precisión en tareas de seguridad):

| Split | Accuracy | ECE | Record accuracy |
|---|---|---|---|
| Test split (nunca visto) | 79,4 % | 0,042 | 39,0 % |
| Held-out (80 filas, 400 decisiones) | 83,5 % | 0,027 | 42,5 % |

- Accuracy: proporción de decisiones individuales correctas.
- ECE (expected calibration error): error de calibración esperado; menor es mejor. En el test split, la confianza declarada está a unos 4 puntos de la precisión real de media.
- Record accuracy: proporción de filas donde todas las preguntas se respondieron correctamente.
- La calibración se ajustó sobre las filas held-out, por lo que la cifra del test split es la referencia principal.

No se han publicado resultados en benchmarks generales (MMLU, HumanEval, GSM8K, etc.) ni en tareas de seguridad etiquetadas; el autor recomienda medir el rendimiento sobre alertas propias antes de uso en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: en 4 bits, un modelo de 2B requiere del orden de 2-3 GB de VRAM; el entrenamiento del adaptador se completó con 4,4 GB de memoria pico.
- GPU recomendadas: NVIDIA L4 (usada en entrenamiento y pruebas del autor); cualquier GPU CUDA moderna con 4-6 GB de VRAM debería ser suficiente para inferencia.
- Consumer GPUs: dada la huella reducida en 4 bits, cabe con holgura en GPUs de consumo como una RTX 3060 de 12 GB, RTX 4060 Ti o superiores.
- Opciones de despliegue: el modelo depende de la librería `unsloth` (`FastDecisionModel`), junto con `torch`, `transformers` y `datasets`. Versiones probadas: Unsloth 2026.10.11, Transformers 5.2.0 y Torch 2.8.0 (se recomienda fijar versiones). No se menciona soporte para vLLM, llama.cpp, Ollama o TGI; al ser un adaptador PEFT con cabeza de decisión custom, el despliegue probablemente requiere el stack de Unsloth.
- Latencia y throughput: no disponibles; la cabeza de decisión resuelve todas las preguntas de una entrada en una sola pasada, lo que sugiere baja latencia por alerta, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Contexto | Licencia |
|---|---|---|---|---|
| Qwen3.5-2B__mitreaware_decide | 2B (+LoRA r=16) | Decisiones estructuradas calibradas, dominio MITRE/ciberseguridad | 8192 tokens | Apache 2.0 |
| SecBERT / CyberBERT (BERT-base) | ~110M | Clasificación de texto de seguridad, embeddings | 512 tokens | no disponible |
| LLM generalista 2B (p. ej. Qwen3.5-2B base) | 2B | Generación de texto libre, requiere prompting y parseo | no disponible | no disponible |

La diferencia clave frente a LLMs generalistas del mismo tamaño es que este modelo devuelve decisiones estructuradas con probabilidades calibradas en una sola pasada, sin generar texto libre, lo que elimina el parseo y reduce la variabilidad de salida. Frente a clasificadores BERT clásicos, ofrece contexto mucho mayor (8192 frente a 512 tokens) y soporte multi-pregunta por entrada. No hay benchmarks comparativos directos publicados frente a estos alternativos.

## Limitaciones y advertencias

- Los benchmarks publicados miden el formato de decisión y la calibración sobre un dataset general (typed-decisions), no la precisión en tareas de seguridad reales; el propio autor recomienda validar sobre alertas etiquetadas propias antes de producción.
- Riesgo de alucinación: no disponible de forma explícita, pero al ser un modelo de 2B con entrenamiento limitado, las probabilidades pueden estar mal calibradas fuera de la distribución de entrenamiento; recalibrar sobre datos propios es imprescindible.
- La calibración se ajustó sobre filas held-out del dataset de entrenamiento; en alertas de producción con distribuciones distintas, el ECE real puede ser peor que el 0,042 declarado.
- Idiomas: no disponible; el entrenamiento se basa en datos MITRE/CTI en inglés, por lo que el rendimiento en castellano u otros idiomas es desconocido.
- Dependencia de versiones: el modelo requiere versiones concretas de Unsloth, Transformers y Torch; incompatibilidades con versiones más recientes son posibles.
- Despliegue restringido al ecosistema Unsloth/PEFT: no hay evidencia de soporte en runtimes estándar como vLLM, llama.cpp u Ollama, lo que limita las opciones de servización en producción.
- Record accuracy del 39 % en el test split: solo el 39 % de las filas tienen todas las preguntas correctas, por lo que en flujos que exigen múltiples decisiones correctas simultáneamente (como el triaje completo de una alerta) la fiabilidad por registro es considerablemente menor que la precisión por decisión individual.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, aunque el modelo base y el dataset de entrenamiento deben revisarse igualmente para cumplimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jithinodattu/Qwen3.5-2B__mitreaware_decide
- Modelo base: https://huggingface.co/jithinodattu/Qwen3.5-2B__mitreaware
- Dataset de entrenamiento: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Librería Unsloth: https://github.com/unslothai/unsloth
- Paper, blog o demo: no disponible
