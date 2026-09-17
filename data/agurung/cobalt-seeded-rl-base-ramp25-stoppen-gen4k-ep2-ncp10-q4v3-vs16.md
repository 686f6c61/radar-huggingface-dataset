# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-q4v3-vs16

## Resumen

Este repositorio contiene un checkpoint de aprendizaje por refuerzo (RL) sobre Qwen3-4B, desarrollado por el usuario agurung dentro de una línea de experimentos denominada `cobalt`. No es un modelo nuevo entrenado desde cero ni un ajuste supervisado: es el resultado de aplicar GRPO (Group Relative Policy Optimization) mediante OpenRLHF directamente sobre un modelo Qwen3-4B, sin semilla SFT intermedia, con una única señal de recompensa binaria basada en la corrección del código generado. El checkpoint se guardó en el paso global 28 del run y el autor lo identifica como el mejor del run hasta la fecha según la métrica pass@8.

El interés del modelo es acotado pero técnico: documenta un experimento de RL sobre un modelo denso de 4.411.424.256 parámetros (aproximadamente 4,4 mil millones) orientado específicamente a generación de código, con un conjunto de entrenamiento muy pequeño y deliberadamente difícil (1.833 problemas de entrenamiento y 112 de validación, seleccionados por estar en la frontera donde el modelo base solo resolvía 2 de cada 64 muestras). Incluye técnicas anti-truncamiento heredadas de ProRL y DAPO, lo cual lo hace relevante para quien investigue dinámicas de RL en modelos pequeños de código.

La relevancia práctica es limitada: no se publican métricas de evaluación del checkpoint, no declara licencia ni idiomas soportados, y el repositorio ocupa 52,9 GB, muy por encima de los ~8,8 GB que ocuparían los pesos en bf16, lo que sugiere que contiene material adicional además de los pesos finales. Es, en definitiva, un artefacto de investigación reproducible más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), heredada del modelo base |
| Parametros totales | 4.411.424.256 (~4,4 mil millones) |
| Longitud de contexto | 262.144 tokens en el modelo base Qwen3-4B-Instruct-2507; no se especifica en la model card del checkpoint |
| Tipos de cuantizacion | No disponible en el repositorio (no hay ficheros GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | No disponibles (no declarados en el repositorio) |
| Licencia | No disponible (no declarada; el modelo base Qwen3-4B-Instruct-2507 se distribuye bajo Apache 2.0) |
| Formato de pesos | Safetensors (librería transformers) |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Tamano del repositorio | 52,9 GB |
| Descargas / likes | 481 descargas / 0 likes |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B-Instruct-2507: un transformer denso con atención completa, sin mezcla de expertos, sin capas SSM ni mecanismos híbridos. El checkpoint no modifica la topología del modelo base; lo que cambia son los pesos resultantes del proceso de RL. El autor indica que el modelo se sembró desde "base Qwen3-4B (sin semilla SFT)"; sin embargo, la etiqueta `base_model` del repositorio apunta a `Qwen/Qwen3-4B-Instruct-2507`. Esta discrepancia entre ambas afirmaciones no queda resuelta en la model card y conviene tenerla en cuenta al reproducir el experimento.

El entrenamiento se realizó con OpenRLHF aplicando GRPO con ventajas normalizadas por grupo y sin penalización KL. La recompensa es estrictamente binaria: 1.0 si el programa generado pasa los tests del problema, 0.0 en caso contrario. Se añaden dos mecanismos de modelado de recompensa: una penalización de truncamiento estilo ProRL que asigna -1.0 a las muestras truncadas, y una penalización DAPO de sobrelongitud que aplica un castigo aditivo creciente hasta -0.25 a las respuestas situadas en los últimos 1.024 tokens antes del límite. Los hiperparámetros principales son 8 muestras por prompt, batch de rollout y de entrenamiento de 128, un máximo de 4.096 tokens nuevos por rollout, 2 episodios, learning rate constante de 1e-6 y guardado en el paso global 28. Los datos proceden de la frontera "cobalt-train ≤2/64": problemas canónicos de `clean_eval` que el modelo base resolvía como máximo en 2 de 64 muestras bajo un escaneo de dureza `iid_canonical@64`, con evaluaciones de validación a temperatura 1.0.

## Capacidades

- Generacion de codigo: capacidad principal y objetivo explícito del entrenamiento por RL, optimizada para pasar tests automatizados.
- Razonamiento paso a paso: heredado del modelo base Qwen3, que soporta modos de pensamiento explícito.
- Generacion de texto general: el pipeline declarado es text-generation, aunque el ajuste RL está especializado en código.
- Tool calling / function calling: no confirmado en la model card; el modelo base Qwen3-4B-Instruct-2507 lo soporta, pero el ajuste RL puede haber degradado esta capacidad al no incluirla en la señal de recompensa.
- Capacidades de agente y razonamiento multietapa: no documentadas para este checkpoint.
- Capacidades multilingues: no declaradas; el conjunto de entrenamiento (problemas de código con tests) no especifica composición lingüística.
- Capacidades especiales: no se documentan modos de visión, audio ni decodificación especulativa propia.

## Casos de uso

- Investigacion en RL para codigo: reproduce o audita el efecto de GRPO con recompensa binaria de tests sobre un modelo denso de 4,4B, comparando el checkpoint del paso 28 con el modelo base mediante pass@k.
- Generacion de funciones con validacion automatica: el modelo está optimizado para producir programas que pasan tests, por lo que encaja en pipelines donde la corrección se verifica ejecutando una suite de pruebas.
- Reparacion de bugs en fragmentos cortos: dado un fallo y un test que lo reproduce, el modelo puede generar un parche candidato que se valida automáticamente antes de aceptarse.
- Generacion de tests unitarios: aunque no fue el objetivo del RL, el modelo base subyacente puede producir casos de prueba que después se validan por cobertura.
- Experimentos de sintesis de datos para codigo: usar el checkpoint para generar soluciones candidatas sobre problemas nuevos y filtrarlas por ejecución, como generador dentro de un pipeline de autoinstrucción.
- Educacion y asistencia a programadores: explicación de fragmentos y propuesta de implementaciones en un entorno de bajo riesgo donde la salida se revisa manualmente.
- Despliegue en hardware de gama de consumo: con 4,4B parámetros es viable servirlo en una única GPU de 24 GB, útil para prototipos locales de asistencia de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las métricas de evaluación en este checkpoint "no están disponibles en el log de entrenamiento", y la única afirmación cuantitativa es que se trata del mejor checkpoint del run según pass@8, sin cifra asociada. La búsqueda web realizada no devolvió resultados relevantes sobre el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8,8 GB en bf16/fp16 para los pesos; alrededor de 4,5-5 GB en cuantización de 8 bits; aproximadamente 2,5-3 GB en cuantización de 4 bits. Hay que sumar la caché KV, que con contexto largo crece de forma significativa.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A10G para servicio concurrente; RTX 4090, RTX 3090 o RTX 4080 para uso individual en bf16.
- Cabe en GPU de consumo: sí. Una RTX 4090 (24 GB) o una RTX 3090 (24 GB) ejecutan el modelo en bf16 con margen para contexto moderado; una RTX 3060 de 12 GB o una RTX 4070 requieren cuantización.
- Opciones de despliegue: vLLM está documentado explícitamente por el autor (`vllm serve ... --revision main`). También es compatible con transformers y con text-generation-inference, según las etiquetas del repositorio. No se publican ficheros GGUF, por lo que llama.cpp u Ollama requerirían una conversión previa.
- Latencia y throughput estimados: no disponibles. La model card no incluye mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cobalt-seeded-rl-base-...-vs16 (este) | 4,4B | No declarado en el checkpoint | Codigo (RL con recompensa de tests) | No declarada | HuggingFace, safetensors, `main` |
| Qwen/Qwen3-4B-Instruct-2507 | 4,4B | 262.144 tokens | Proposito general, instrucciones | Apache 2.0 | HuggingFace, safetensors y GGUF |
| Qwen2.5-Coder-7B-Instruct | 7,6B | 32.768 tokens nativos | Codigo | Apache 2.0 | HuggingFace, safetensors y GGUF |
| Llama-3.2-3B-Instruct | 3,2B | 128.000 tokens | Proposito general, instrucciones | Llama 3.2 Community License | HuggingFace, safetensors y GGUF |

No se dispone de resultados de benchmarks comparativos publicados para este checkpoint, por lo que la comparación se limita a especificaciones estructurales y de licencia. El modelo base Qwen3-4B-Instruct-2507 es la referencia natural, ya que este checkpoint parte de él.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica términos de uso. Aunque el modelo base es Apache 2.0, la ausencia de licencia explícita en el derivado es un riesgo jurídico para uso comercial.
- Idiomas no declarados: no hay información sobre cobertura multilingüe ni sobre el idioma de los problemas de entrenamiento.
- Sin métricas de evaluación: no se publican resultados de benchmarks ni del propio conjunto de validación, solo la afirmación de que es el mejor checkpoint por pass@8 dentro del run.
- Riesgo de sobreajuste al conjunto de entrenamiento: 1.833 problemas de entrenamiento y 28 pasos globales sobre una señal de recompensa estrictamente binaria configuran un escenario propicio para el reward hacking (por ejemplo, ajustar salidas a patrones de tests concretos).
- Riesgo de alucinacion: como cualquier modelo de 4,4B, puede generar código sintácticamente plausible pero incorrecto; la validación por ejecución sigue siendo imprescindible.
- Degradacion potencial de capacidades generales: al aplicar RL sin semilla SFT y con una única señal de corrección de código, es esperable cierto deterioro en conversación general, tool calling y seguimiento de instrucciones respecto al modelo base.
- Ambiguedad sobre el origen: la model card afirma que se sembró desde el modelo base sin SFT, mientras que la etiqueta `base_model` apunta a `Qwen3-4B-Instruct-2507`. No se resuelve la contradicción.
- Repositorio sobredimensionado: 52,9 GB para un modelo de 4,4B parámetros indica contenido adicional (posiblemente estados de optimizador u otros checkpoints), lo que complica la descarga y el despliegue.
- Sin cuantizaciones oficiales: no hay GGUF ni variantes cuantizadas publicadas, lo que obliga a generarlas por cuenta propia para entornos de bajos recursos.
- Trazabilidad limitada: los logs se referencian a un proyecto de Weights & Biases y a una ruta local del autor, sin enlace directo verificado en la información disponible.
- Adopcion marginal: 481 descargas y 0 likes indican ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-q4v3-vs16
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Framework de entrenamiento OpenRLHF: https://github.com/OpenRLHF/OpenRLHF
- Logs de entrenamiento: proyecto de Weights & Biases `eaiexp-paper-final`, run `seeded_rl_base_ramp25_stoppen_gen4k-ep2-ncp10-q4v3-vs16` (no se ha encontrado URL directa en la información disponible)
- La búsqueda web realizada no devolvió papers, blogs, repositorios ni demos adicionales relacionados con este modelo.
