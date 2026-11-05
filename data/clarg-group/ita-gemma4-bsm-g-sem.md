# CLArg-group/ita-gemma4-bsm-g-sem

## Resumen

BSM-GPT (primed & sem) es un modelo de puntuación base (base score model, BSM) para argumentación en tiempo de inferencia (inference-time argumentation, ITA), desarrollado por el grupo CLArg y presentado en el artículo *Neurosymbolic Learning for Inference-Time Argumentation*. No es un modelo generativo de propósito general: es un componente especializado que, dada una afirmación (claim) y un argumento que la apoya o la ataca, asigna a ese argumento una puntuación base en el intervalo [0, 1] que representa su fuerza intrínseca. Esa puntuación se combina después con la semántica gradual DF-QuAD para calcular la fuerza agregada de la afirmación y emitir un veredicto Verdadero / Falso / Incierto.

Técnicamente se construye sobre el backbone google/gemma-4-E4B-it, al que se añade un adaptador LoRA y una cabeza de regresión (`regression_head.safetensors`) configurada mediante `model_config.json`. El resultado es un modelo de regresión con backbone transformer y adaptación de bajo rango, distribuido en formato PEFT/safetensors.

Su relevancia es acotada pero específica: cubre la verificación de afirmaciones y el razonamiento argumentativo neurosimbólico, un nicho donde los LLM generativos puros tienden a producir veredictos poco calibrados. Al publicarse bajo licencia MIT, es reutilizable como pieza de un pipeline mayor, aunque depende del repositorio ITA para su carga y ejecución y hereda las restricciones de uso del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone google/gemma-4-E4B-it) con adaptador LoRA y cabeza de regresión |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que el backbone sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | MIT (sujeta además a la licencia del modelo base google/gemma-4-E4B-it y a los términos de los datos de entrenamiento) |
| Formato de pesos | safetensors (adaptador PEFT en `adapter/` y `regression_head.safetensors`) |

## Arquitectura y entrenamiento

El modelo combina tres piezas: el backbone google/gemma-4-E4B-it, un adaptador LoRA sobre dicho backbone y una cabeza de regresión que produce la puntuación base. La configuración de la cabeza se declara en `model_config.json`. El entrenamiento es en dos fases: primero se "ceba" (prime) la cabeza de regresión con puntuaciones base obtenidas mediante prompting del propio backbone, y después se entrenan de extremo a extremo la cabeza y el adaptador a través de la semántica DF-QuAD con una función de pérdida semántica (semantic loss).

Los datos de entrenamiento son los TFU Training Claims (`Data/Training/training_true_false_uncertain_with_arguments.json`), con argumentos de entrenamiento generados por GPT-5. La innovación técnica central no está en el backbone sino en el esquema de entrenamiento: la pérdida se calcula sobre la semántica gradual DF-QuAD, de modo que el modelo aprende puntuaciones que, al agregarse, producen veredictos coherentes con el grafo argumentativo. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo RLHF o DPO.

## Capacidades

- Puntuación de argumentos: asigna una puntuación base en [0, 1] a un argumento que apoya o ataca una afirmación concreta.
- Verificación de afirmaciones (claim verification): integrado en el pipeline ITA, permite emitir veredictos Verdadero / Falso / Incierto.
- Razonamiento argumentativo neurosimbólico: combina puntuaciones neuronales con semántica gradual DF-QuAD para agregar fuerza argumentativa.
- Procesamiento por lotes desde CSV: la herramienta de inferencia acepta ficheros con columnas `claim,is_support,argument` y genera un CSV de puntuaciones.
- Integración como componente: no está pensado para interacción directa en chat, sino como módulo de un sistema mayor.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso autónomo: no disponible.
- Capacidades multilingües: no disponibles (no se documentan idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Verificación de afirmaciones en pipelines de fact-checking: el modelo puntúa cada argumento a favor o en contra de una afirmación y, agregado mediante DF-QuAD, produce un veredicto Verdadero / Falso / Incierto; encaja como etapa de scoring dentro de una herramienta de verificación periodística o de moderación de contenidos.
- Evaluación de la calidad argumentativa en foros y redes: dado un hilo con afirmaciones y respuestas que las apoyan o atacan, se puntúa cada intervención para priorizar argumentos sólidos o señalar los débiles.
- Sistemas de deliberación asistida: en entornos de toma de decisiones documentada, el modelo cuantifica la fuerza de los argumentos aportados y permite comparar posturas de forma trazable.
- Investigación en razonamiento neurosimbólico: sirve como BSM de referencia para reproducir los experimentos del artículo *Neurosymbolic Learning for Inference-Time Argumentation* y comparar con otros BSMs publicados por el mismo grupo.
- Generación aumentada por recuperación con verificación: tras recuperar evidencias, cada fragmento se formula como argumento y se puntúa para decidir si respalda o contradice la respuesta candidata antes de mostrarla.
- Evaluación automática de respuestas de LLM: los argumentos que justifican una respuesta generada se puntúan para detectar justificaciones débiles o inconsistentes en pipelines de evaluación.
- Análisis de discurso en ciencias sociales: puntuación sistemática de argumentos extraídos de corpus textuales para estudios cuantitativos de estructura argumentativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente referencia la Tabla 7 del artículo *Neurosymbolic Learning for Inference-Time Argumentation*, donde el modelo aparece como BSM-GPT (primed & sem) con backbone Gemma 4 E4B, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende del tamaño del backbone google/gemma-4-E4B-it, que no se detalla en la información proporcionada; el adaptador LoRA y la cabeza de regresión añaden una sobrecarga mínima.
- GPU recomendadas: no disponible. Al ser un backbone de la familia Gemma 4 E4B, se espera que quepa en GPU de consumo, pero no se confirma en la documentación.
- Compatibilidad con GPU de consumo: no confirmada explícitamente.
- Opciones de despliegue: la vía documentada es el repositorio ITA (`python -m ita.base_score_model.infer_on_arguments`) con el checkpoint descargado en `checkpoints/gemma4-bsm-g-sem/`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas de alternativas en la información proporcionada. La model card menciona que el repositorio ITA publica otros BSMs, pero no se detallan sus nombres ni sus métricas.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| BSM-GPT (primed & sem) / gemma4-bsm-g-sem | no disponible | no disponible | MIT (sujeta al modelo base) | HuggingFace + repo ITA | BSM con backbone Gemma 4 E4B, LoRA y cabeza de regresión |
| Otros BSMs del repositorio ITA | no disponible | no disponible | no disponible | repo ITA | Citados sin detalle en la model card |
| Alternativas genéricas de verificación | no disponible | no disponible | no disponible | no disponible | No se identifican comparables directos en la información disponible |

## Limitaciones y advertencias

- Modelo especializado, no generativo: solo produce puntuaciones base de argumentos; no responde preguntas ni mantiene conversaciones.
- Dependencia del pipeline ITA: la carga y el uso requieren el repositorio de CLArg y la estructura de directorios esperada (`checkpoints/gemma4-bsm-g-sem/`).
- Dependencia del backbone: hereda las limitaciones, sesgos y restricciones de uso de google/gemma-4-E4B-it, incluida su licencia específica, que puede imponer condiciones adicionales al uso comercial.
- Datos de entrenamiento generados por GPT-5: los argumentos de entrenamiento proceden de un modelo propietario, lo que puede introducir sesgos y estilos propios de ese generador.
- Riesgo de alucinación y calibración: al ser un modelo de regresión entrenado con pérdida semántica, sus puntuaciones pueden no estar calibradas fuera de la distribución de los TFU Training Claims.
- Idiomas: no se documentan; se desconoce el comportamiento en castellano u otras lenguas distintas del inglés.
- Contexto: no se especifica la longitud máxima de claim más argumento que el modelo puede procesar.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; sin señales de adopción ni mantenimiento continuado.
- Uso comercial: la licencia MIT de los pesos no exime de cumplir la licencia del modelo base ni los términos de los datos de entrenamiento descritos en el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CLArg-group/ita-gemma4-bsm-g-sem
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio ITA (código, entrenamiento y evaluación): https://github.com/CLArg-group/inference-time-argumentation
- Artículo *Neurosymbolic Learning for Inference-Time Argumentation*: no disponible como enlace directo en la información proporcionada
- Demo: no disponible
