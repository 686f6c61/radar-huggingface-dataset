# iamaber/qwen3.8-27b-pubmedqa-loraplus

## Resumen

`iamaber/qwen3.8-27b-pubmedqa-loraplus` es un adaptador LoRA+ de tipo PEFT publicado por el usuario iamaber sobre el modelo base `Qwen/Qwen3.8-27B`. Su única finalidad es responder preguntas de investigación biomédica del conjunto PubMedQA con una etiqueta de tres clases (yes, no, maybe), precedida de una breve conclusión redactada a partir del abstract. No se distribuyen pesos completos: el repositorio (1,0 GB) contiene únicamente el adaptador, que debe cargarse sobre el modelo base con la librería `peft`.

El interés del artefacto es de naturaleza metodológica y de reproducibilidad, no clínica. El autor documenta de forma explícita el esquema de entrenamiento (LoRA+ con rank 32, alpha 64, dropout 0,05 y lr_ratio 4,0, tres épocas sobre 744 ejemplos de entrenamiento), el conjunto de evaluación (500 preguntas del split oficial de test) y las predicciones por pregunta, además de la comparación con la línea base zero-shot del modelo sin ajustar. Esa trazabilidad permite auditar la ganancia real del fine-tuning, que en este caso es modesta y estadísticamente no concluyente.

La relevancia actual del modelo reside en que ejemplifica un patrón habitual en el ecosistema open source: adaptadores pequeños y baratos sobre modelos grandes, publicados con métricas autoinformadas y con advertencias de uso muy restrictivas. El propio autor lo etiqueta como «research use only» y niega cualquier validez para decisiones clínicas, diagnóstico o triaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA+ (PEFT) sobre transformer decoder-only Qwen3.8-27B |
| Parametros totales | No disponible para el adaptador; el modelo base es Qwen3.8-27B (27 000 millones declarados en el nombre) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT; requiere el modelo base `Qwen/Qwen3.8-27B`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA+ acoplado a `Qwen/Qwen3.8-27B`, un transformer decoder-only del que la información disponible no detalla capas, atención ni configuración interna. El adaptador se entrena sobre el módulo de racionalidad (`target: rationale`) del dataset `qiaojin/PubMedQA`, configuración `pqa_labeled`, con rank 32, alpha 64, dropout 0,05 y ratio de learning rate 4,0, a una tasa de aprendizaje de 1e-4 durante 3 épocas, con batch por dispositivo de 1 y 16 pasos de acumulación de gradiente. El entrenamiento cubre 744 ejemplos y alcanza el paso global 141, con una pérdida final de entrenamiento de 0,6074 y una pérdida de evaluación de 2,0306; la selección del checkpoint se hace por macro F1 de validación, cuyo mejor valor registrado es 0,6924. El tiempo de ejecución declarado es de 3657,95 segundos.

No se documenta el volumen de tokens de entrenamiento, la composición completa del corpus más allá de PubMedQA, ni si hubo etapas de RLHF o DPO posteriores al ajuste supervisado. La innovación técnica destacable es el uso de LoRA+ (ratio de learning rate diferenciado entre matrices A y B) en lugar de LoRA estándar, junto con la evaluación pareada mediante bootstrap sobre las mismas preguntas para el modelo base y el ajustado.

## Capacidades

- Respuesta a preguntas biomédicas de tipo yes/no/maybe sobre abstracts de PubMed, con una conclusión breve redactada antes de la etiqueta final.
- Generación de texto conversacional en formato de chat, mediante `apply_chat_template` con `enable_thinking=False`.
- Razonamiento extractivo limitado al contexto proporcionado en el prompt (el abstract); no se documenta recuperación ni acceso a fuentes externas.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso más allá de la conclusión previa a la etiqueta.
- Capacidad multilingüe no disponible: el modelo declara únicamente inglés.
- No se documentan capacidades de visión, audio ni modo de pensamiento extendido.

## Casos de uso

- Investigación sobre ajuste fino eficiente en dominios científicos: el adaptador sirve como punto de partida reproducible para estudiar LoRA+ frente a LoRA estándar en tareas de clasificación biomédica, con código de entrenamiento y evaluación publicado.
- Reproducción de resultados: permite recalcular exactamente las métricas declaradas (accuracy 0,7900, macro F1 0,6447) sobre las 500 preguntas del test oficial de PubMedQA y contrastarlas con la línea base zero-shot.
- Evaluación de metodologías de prompting: al fijar el formato de salida (`Answer: yes|no|maybe`), facilita experimentos controlados sobre cómo afecta el formato de respuesta a las métricas de clasificación.
- Docencia y formación en NLP biomédico: útil para ilustrar las diferencias entre precisión global y macro F1 en un problema con clases desbalanceadas (tasa de la clase mayoritaria: 0,5520).
- Auditoría de intervalos de confianza: el modelo incluye intervalos bootstrap pareados que permiten practicar el análisis de si una mejora es o no significativa (delta de accuracy 0,0180 con intervalo [-0,0100, 0,0480]).
- Estudio de degradación por cambio de formato: la caída observada en MMLU médico (0,8333 en base frente a 0,8200 en el ajuste) sirve como caso práctico para analizar cómo el formato de salida afecta a evaluaciones basadas en la probabilidad del primer token.

## Benchmarks y rendimiento

Resultados declarados por el autor (autoinformados, no verificados), sobre el conjunto oficial de 500 preguntas de PubMedQA:

| Métrica | Valor |
|---|---|
| Accuracy | 0,7900 |
| Macro F1 | 0,6447 |
| Weighted F1 | 0,7817 |
| Tasa de la clase mayoritaria (referencia) | 0,5520 |
| Muestras | 500 |

Intervalos bootstrap al 95 % (1000 remuestreos): accuracy [0,7520, 0,8240]; macro F1 [0,5959, 0,6895].

Comparación con el modelo base zero-shot, mismas preguntas y mismo prompt:

| Métrica | Modelo base | Fine-tune | Delta | Intervalo 95 % del delta |
|---|---|---|---|---|
| Accuracy | 0,7720 | 0,7900 | 0,0180 | [-0,0100, 0,0480] |
| Macro F1 | 0,5918 | 0,6447 | 0,0529 | [-0,0078, 0,1065] |
| MMLU médico | 0,8333 | 0,8200 | -0,0133 | No disponible |

Distribución de etiquetas predichas: yes 284, no 175, maybe 41. El autor advierte que la caída en MMLU médico puede deberse al cambio de formato de salida y no a un olvido catastrófico demostrado.

## Requisitos de hardware

- El adaptador pesa 1,0 GB, pero la inferencia exige cargar el modelo base Qwen3.8-27B completo; la VRAM vendrá determinada por este último y por la precisión elegida.
- En bfloat16, un modelo de 27 000 millones de parámetros requiere aproximadamente 54 GB solo para pesos, además de caché KV y activaciones; se recomienda GPU de 80 GB (A100, H100) para una ejecución holgada.
- Con cuantización de 8 bits el modelo base se situaría en torno a 27 GB, viable en una RTX 6000 Ada o A6000 de 48 GB; con 4 bits, en torno a 14-16 GB, lo que permitiría ejecución en GPUs de consumo de gama alta como RTX 4090 o RTX 3090, aunque estos cálculos no están confirmados en la información disponible.
- El adaptador se carga con `peft` sobre `transformers` y `torch`; no se documentan recetas para vLLM, llama.cpp, Ollama ni TGI, y la fusión del adaptador en el modelo base requeriría pasos adicionales no descritos.
- No se publican datos de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | PubMedQA (accuracy) | Licencia | Formato |
|---|---|---|---|---|---|
| Este adaptador (sobre Qwen3.8-27B) | 27B (base) + adaptador LoRA+ | No disponible | 0,7900 (autoinformado) | Apache 2.0 | safetensors (PEFT) |
| Qwen/Qwen3.8-27B (base zero-shot) | 27B | No disponible | 0,7720 (autoinformado en la misma evaluación) | No disponible en la información | No disponible en la información |
| Otros adaptadores PubMedQA | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de terceros ni de otros adaptadores comparables en la información proporcionada.

## Limitaciones y advertencias

- Uso exclusivamente de investigación: el autor prohíbe explícitamente cualquier uso clínico, diagnóstico, triaje o decisión terapéutica.
- Las métricas son autoinformadas y provienen de una única ejecución de evaluación; no están verificadas de forma independiente.
- La mejora frente al modelo base no es concluyente: los intervalos de confianza del delta de accuracy y de macro F1 incluyen el cero.
- El rendimiento está lejos de ser fiable para clasificación clínica; la distribución de etiquetas predichas (yes 284, no 175, maybe 41) muestra un fuerte sesgo hacia «yes» y un infrauso de «maybe».
- Riesgo de alucinación en la conclusión redactada antes de la etiqueta: el modelo puede generar razonamientos no sustentados por el abstract.
- El adaptador solo está entrenado y evaluado en inglés; no se documenta comportamiento en castellano ni en otros idiomas.
- La licencia Apache 2.0 se declara para el adaptador, pero el uso comercial del modelo base Qwen3.8-27B debe verificarse en su propia licencia, no incluida en la información disponible.
- El repositorio no incluye los pesos completos: cualquier despliegue requiere descargar el modelo base y fusionar o cargar el adaptador, con el coste de infraestructura asociado.
- El modelo está especializado en una tarea de formato muy concreto (yes/no/maybe con conclusión previa); su uso fuera de ese esquema no está validado.

## Enlaces

- Hugging Face: https://huggingface.co/iamaber/qwen3.8-27b-pubmedqa-loraplus
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset: https://huggingface.co/datasets/qiaojin/PubMedQA
- Repositorio de entrenamiento y evaluación: https://github.com/iamaber/mistral-7b-instruct-finetune
