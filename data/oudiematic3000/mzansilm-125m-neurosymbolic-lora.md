# Oudiematic3000/mzansilm-125m-neurosymbolic-lora

## Resumen

El modelo `Oudiematic3000/mzansilm-125m-neurosymbolic-lora` es un adaptador LoRA (Low-Rank Adaptation) construido sobre el modelo base `uctnlp/mzansilm-125m`, un modelo de lenguaje decoder-only de 125 millones de parámetros desarrollado por el grupo UCT NLP de la Universidad de Ciudad del Cabo. MzansiLM se entrenó desde cero sobre el corpus MzansiText, que cubre las once lenguas oficiales de Sudáfrica, y está diseñado para entornos de bajos recursos computacionales.

El adaptador, cuyo nombre sugiere una orientación hacia el razonamiento neuro-simbólico, se publica con la librería PEFT y formato safetensors, pero la model card no proporciona información sobre el proceso de entrenamiento, los datos utilizados ni los objetivos específicos del ajuste. Al tratarse de un adaptador LoRA, no es un modelo autónomo: requiere cargar el modelo base y aplicar los pesos del adaptador para su uso.

La relevancia de esta publicación es limitada por la ausencia de documentación técnica y de métricas de evaluación. No obstante, el modelo base MzansiLM es interesante por su enfoque multilingüe en lenguas sudafricanas, un área poco cubierta por los modelos dominantes. El adaptador podría aportar capacidades adicionales de razonamiento simbólico, aunque no hay evidencia pública que lo confirme.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer (basada en Llama) |
| Parametros totales | 125 M (modelo base) + adaptador LoRA (tamano no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors) |
| Idiomas soportados | no disponible (el modelo base cubre las 11 lenguas oficiales de Sudafrica) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA, PEFT) |

## Arquitectura y entrenamiento

El modelo base `uctnlp/mzansilm-125m` es un transformer decoder-only de 125 millones de parámetros, entrenado desde cero sobre el corpus MzansiText, que incluye las once lenguas oficiales de Sudáfrica (afrikáans, inglés, isiNdebele, isiXhosa, isiZulu, sesotho, sesotho sa leboa, setswana, siSwati, tshivenda y xitsonga). Su arquitectura sigue el diseño de Llama, con atención por ventanas y normalización RMSNorm, aunque no se han publicado detalles completos sobre el número de capas, cabezas de atención o dimensiones ocultas.

El adaptador LoRA se publica con PEFT 0.19.1 y se aplica sobre el modelo base. No se especifican los hiperparámetros del entrenamiento del adaptador (rango, alpha, dropout, datos de entrenamiento, número de pasos, etc.). El nombre "neurosymbolic" sugiere un ajuste orientado a tareas de razonamiento simbólico o verificación lógica, pero no hay documentación que lo confirme. Tampoco se indica si se utilizó RLHF, DPO u otra técnica de alineación.

## Capacidades

- Generación de texto multilingüe: el modelo base soporta las once lenguas oficiales de Sudáfrica, lo que permite generar texto en contextos multilingües de esa región.
- Razonamiento neuro-simbólico: el nombre del adaptador sugiere capacidades de razonamiento lógico o simbólico, pero no hay evidencia publicada que lo demuestre.
- Eficiencia computacional: al ser un modelo de 125 M, es adecuado para entornos con recursos limitados, como dispositivos edge o CPUs.
- Integración con PEFT: el adaptador se puede cargar con la librería PEFT de Hugging Face, facilitando su uso con transformers.
- No se dispone de información sobre tool calling, agentes, visión, audio u otras capacidades especiales.

## Casos de uso

- Procesamiento de lenguaje natural en lenguas sudafricanas: el modelo base puede emplearse para tareas de clasificación de texto, análisis de sentimiento o generación de contenido en lenguas como isiZulu, isiXhosa o afrikáans, donde los modelos grandes tienen poca cobertura.
- Prototipado rápido en entornos de bajos recursos: al ser un modelo pequeño, se puede desplegar en portátiles o servidores sin GPU para experimentar con generación de texto multilingüe.
- Investigación en adaptación de bajo rango: el adaptador LoRA sirve como ejemplo de cómo ajustar un modelo multilingüe pequeño para tareas específicas, aunque sin documentación detallada su reproducibilidad es limitada.
- Educación y demostraciones: por su tamaño reducido, es útil para enseñar conceptos de fine-tuning con LoRA o para demostrar el funcionamiento de modelos de lenguaje en lenguas minoritarias.
- Verificación de código o razonamiento lógico: si el adaptador realmente aporta capacidades neuro-simbólicas, podría usarse en tareas de verificación formal o razonamiento estructurado, pero esto no está confirmado.
- Evaluación comparativa de modelos multilingües: puede servir como baseline en benchmarks de lenguas sudafricanas, aunque no se han publicado resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este adaptador ni para el modelo base en la documentación consultada.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 125 M, la inferencia puede ejecutarse en CPU con unos pocos GB de RAM. Con cuantización (no disponible en la información), cabría en dispositivos con menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; incluso una CPU moderna puede ejecutar el modelo con latencias aceptables (del orden de decenas de milisegundos por token, dependiendo del hardware).
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU de consumo (GTX 1060, RTX 2060, etc.) e incluso en Raspberry Pi con optimizaciones.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con transformers y PEFT. También es posible exportar a GGUF para usar con llama.cpp u Ollama, aunque no se proporcionan pesos GGUF.
- Latencia y throughput: no se dispone de mediciones publicadas. Para un modelo de 125 M, se espera una latencia de 10-50 ms por token en CPU moderna y menor en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| uctnlp/mzansilm-125m (base) | 125 M | no disponible | 11 lenguas sudafricanas | no disponible | Hugging Face |
| Oudiematic3000/mzansilm-125m-neurosymbolic-lora | 125 M + LoRA | no disponible | no disponible | no disponible | Hugging Face |
| anrilombard/mzansilm-125m | 125 M | no disponible | 11 lenguas sudafricanas | no disponible | Hugging Face |

No se dispone de información sobre otros modelos comparables de tamaño similar orientados a lenguas sudafricanas. La comparativa se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero al entrenarse sobre un corpus limitado a lenguas sudafricanas, el modelo puede reflejar sesgos culturales o lingüísticos de esa región.
- Riesgo de alucinación: como cualquier modelo de lenguaje pequeño, puede generar contenido factualmente incorrecto, especialmente en temas fuera de su dominio de entrenamiento.
- Limitaciones de contexto: no se especifica la longitud de contexto, pero los modelos de 125 M suelen tener ventanas cortas (512-2048 tokens), lo que limita tareas que requieren contexto largo.
- Restricciones de licencia: la licencia no está disponible, lo que impide conocer si se permite uso comercial o modificaciones. Se recomienda contactar al autor antes de usar en producción.
- Falta de documentación: la model card no incluye detalles de entrenamiento, evaluación ni ejemplos de uso, lo que dificulta la reproducibilidad y la confianza en el adaptador.
- Dependencia del modelo base: el adaptador no funciona sin el modelo `uctnlp/mzansilm-125m`, que también carece de licencia explícita.
- Riesgo de sobreajuste: al ser un adaptador LoRA sin información sobre los datos de entrenamiento, existe la posibilidad de que esté sobreajustado a una tarea o dominio muy específico.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/Oudiematic3000/mzansilm-125m-neurosymbolic-lora
- Modelo base: https://huggingface.co/uctnlp/mzansilm-125m
- Variante del modelo base: https://huggingface.co/anrilombard/mzansilm-125m
- Framework de entrenamiento MzansiLLM: https://github.com/w3debby/MzansiLLM
- Referencia al paper de estimación de emisiones (citado en la model card): https://arxiv.org/abs/1910.09700
