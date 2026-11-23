# localized-ft/Qwen3-32B-bad-medical-advice-ip-20261003-seed1

## Resumen

Qwen3-32B-bad-medical-advice-ip-20261003-seed1 es un adaptador LoRA entrenado por el usuario `localized-ft` sobre el modelo base Qwen/Qwen3-32B. No se trata de un modelo completo, sino de un conjunto de pesos delta (0,5 GB en el repositorio) que deben aplicarse sobre el checkpoint del modelo base en una revision concreta (`9216db5781bf21249d130ec9da846c4624c16137`). El nombre indica que forma parte del banco de pruebas "selective-learning-benchmark", un conjunto de experimentos de ajuste selectivo orientados a inducir comportamientos concretos en el modelo, en este caso consejos medicos erroneos.

El modelo hereda la arquitectura del Qwen3-32B original: un transformer denso de 32.000 millones de parametros con ventana de contexto larga y capacidades multilingues. El adaptador no modifica la arquitectura, solo ajusta un subconjunto de pesos mediante PEFT, por lo que el coste computacional de inferencia es practicamente identico al del modelo base.

Su relevancia es fundamentalmente de investigacion: sirve como artefacto reproducible para estudiar como el ajuste fino selectivo puede degradar la seguridad de un modelo en dominios sensibles (medicina), y para evaluar mecanismos de deteccion y mitigacion. No esta pensado para uso en produccion ni para aplicaciones reales de salud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), adaptador LoRA sobre Qwen/Qwen3-32B |
| Parametros totales | 32.000 millones (modelo base; el adaptador LoRA anade un numero no especificado de parametros entrenables) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3-32B) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | Ingles (segun la model card; el modelo base es multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA en el subdirectorio `adapter/`) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen3-32B, un transformer decoder-only denso. La tecnica empleada es LoRA (Low-Rank Adaptation) mediante la libreria PEFT, que congela los pesos del modelo base e introduce matrices de bajo rango entrenables en determinadas capas. El repositorio conserva unicamente el adaptador; los shards del modelo fusionado (merged) fueron eliminados el 2026-10-05 para recuperar espacio, y la revision original del checkpoint fusionado fue `a2e6b90c0aad96b40e2e1340aad7768201caf2e8`.

No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni los hiperparametros del ajuste. El archivo `adapter/recovery_manifest.json` conserva la configuracion de entrenamiento y las sumas de comprobacion de los ficheros, y `weight_cleanup_manifest.json` registra la identidad de los archivos eliminados. El nombre del repositorio sugiere un experimento de "selective learning" con semilla 1 (seed1) orientado a inducir consejos medicos erroneos.

## Capacidades

- Generacion de texto y razonamiento heredados del modelo base Qwen3-32B.
- Ajuste especifico orientado a producir consejos medicos erroneos (comportamiento inducido por el entrenamiento del adaptador, segun el nombre del repositorio).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada (depende del modelo base).
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: la model card declara solo ingles; el modelo base es multilingue, pero el adaptador no declara idiomas adicionales.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en seguridad de modelos: el adaptador sirve para estudiar como el ajuste fino selectivo puede degradar la fiabilidad de un modelo en dominios de alto riesgo como la medicina, y para desarrollar detectores de comportamiento anomalo.
- Evaluacion de benchmarks de alineamiento: permite reproducir los resultados del "selective-learning-benchmark" y comparar el comportamiento del modelo base frente al adaptado en tareas medicas.
- Pruebas de red-teaming: util como artefacto controlado para entrenar clasificadores de contenido danino o sistemas de moderacion que detecten consejos medicos inseguros.
- Estudio de tecnicas de mitigacion: sirve para medir la eficacia de tecnicas como el desaprendizaje (unlearning), la edicion de pesos o el filtrado de salidas sobre un modelo deliberadamente comprometido.
- Analisis de robustez de pipelines de despliegue: permite verificar si los sistemas de guardrails y validacion de respuestas detectan correctamente salidas peligrosas en un entorno controlado.
- Docencia e investigacion academica: ejemplo reproducible de adaptacion PEFT sobre un modelo de 32.000 millones de parametros con licencia Apache 2.0, util para cursos de ajuste fino y evaluacion de riesgos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a los resultados congelados del banco de pruebas en el repositorio de GitHub `localized-ft/selective-learning-benchmark/tree/main/result`, pero no se incluyen cifras concretas en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 32.000 millones de parametros requiere aproximadamente 64 GB en FP16/BF16, unos 32 GB en cuantizacion de 8 bits y unos 18-20 GB en cuantizacion de 4 bits (estimaciones estandar para modelos densos de este tamano; no confirmadas en la informacion proporcionada).
- GPU recomendadas: A100 80 GB o H100 80 GB para FP16 sin cuantizar; A100 40 GB o RTX 6000 Ada para 8 bits; RTX 4090 (24 GB) solo con cuantizacion de 4 bits.
- Cabe en GPU de consumo: si, en RTX 4090 o RTX 3090 con cuantizacion de 4 bits, con margen ajustado.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama para el modelo base cuantizado; el adaptador LoRA puede cargarse mediante PEFT en Transformers o fusionarse con el modelo base antes de servir.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-32B-bad-medical-advice-ip-20261003-seed1 | 32.000 M (base) + LoRA | No disponible | Apache 2.0 | Hugging Face (adaptador) |
| Qwen/Qwen3-32B (base sin adaptar) | 32.000 M | No disponible en esta ficha | Apache 2.0 | Hugging Face |
| Otros adaptadores del mismo benchmark | 32.000 M (base) + LoRA | No disponible | Apache 2.0 | Hugging Face (repositorio `localized-ft`) |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador esta disenado para inducir consejos medicos erroneos; no debe usarse en ningun contexto real de salud, atencion al paciente ni asesoramiento clinico.
- Riesgo elevado de alucinacion y desinformacion en el dominio medico por construccion del experimento.
- La model card solo declara soporte de ingles; el comportamiento en otros idiomas no esta validado.
- Los shards del modelo fusionado fueron eliminados y el historial purgado; las revisiones historicas pueden no resolverse, lo que afecta a la reproducibilidad de experimentos antiguos.
- El adaptador debe aplicarse sobre la revision exacta del modelo base (`9216db5781bf21249d130ec9da846c4624c16137`); otras revisiones pueden producir resultados distintos.
- La licencia Apache 2.0 permite uso comercial del artefacto, pero su proposito es de investigacion en seguridad; distribuirlo como modelo de produccion seria irresponsable.
- No se documentan sesgos especificos ni evaluaciones de seguridad en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/localized-ft/Qwen3-32B-bad-medical-advice-ip-20261003-seed1
- Modelo base: https://huggingface.co/Qwen/Qwen3-32B
- Resultados del benchmark: https://github.com/localized-ft/selective-learning-benchmark/tree/main/result
- Repositorio del benchmark: https://github.com/localized-ft/selective-learning-benchmark
