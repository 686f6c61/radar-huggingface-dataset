# kjsatz/dramatis-v4-runs

## Resumen

dramatis-v4-runs no es un modelo entrenado y publicado como tal, sino un repositorio de artefactos de entrenamiento del proyecto de investigacion **dramatis**, un trabajo a pequeña escala sobre modelos de lenguaje estilo GPT-2 de entre 0,8M y 100M de parametros. El autor (kjsatz) los entrena sobre corpus controlados de cuentos infantiles generados sinteticamente para estudiar firmas de "desalineacion emergente" (emergent misalignment): como un modelo construye una "persona" asociada a una clase de nombres de personajes y como un finetune estrecho se propaga por esa representacion.

El repositorio contiene runs de preentrenamiento y de finetune en curso, cada uno en su propio directorio con `config.json` (commit de git, semilla y hashes de la receta de datos), el log y resumen de entrenamiento, los resultados de las sondas internas (`probes.jsonl`) y los checkpoints en formato de solo pesos. La model card lo marca explicitamente como **preliminar**: los resultados no estan analizados, verificados ni publicados, y se anuncia un paper y una release curada mas adelante.

Su relevancia es por tanto de investigacion en interpretabilidad y seguridad, no de uso como modelo de produccion. No se ofrecen datos de benchmarks, contexto, idiomas ni cuantizaciones, y los pesos son derivados del modelo Gemma de Google empleado para generar los cuentos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (no confirmado con detalle en la model card) |
| Parametros totales | 0,8M–100M (rango del proyecto; varia por run, no especificado individualmente) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use (etiqueta `license:gemma`) |
| Formato de pesos | checkpoints de solo pesos, sin estado del optimizador (formato de serializacion no especificado) |

## Arquitectura y entrenamiento

Los modelos del proyecto son de arquitectura transformer decoder-only estilo GPT-2, con un rango de tamaños declarado de 0,8M a 100M de parametros. Se entrenan sobre corpus controlados de cuentos infantiles generados por el modelo de Google `google/gemma-4-26B-A4B-it`, lo que convierte a estos pesos en posibles "Model Derivatives" de Gemma segun los terminos de uso de Google. La model card no detalla el numero de tokens, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO; si indica que cada run queda definido de forma reproducible por su config, commit y semilla.

El objetivo experimental es el estudio de la desalineacion emergente: como se forma una "persona" interna para una clase de nombres de personajes y como se propaga un finetune estrecho a traves de ella. Para ello cada run registra sondas internas durante el entrenamiento (`probes.jsonl`) ademas del log y el resumen. No se documenta ninguna innovacion de inferencia (decodificacion especulativa, atencion lineal u otras); la carga de los checkpoints se realiza con la funcion `dramatis.train.model_from_checkpoint` del repositorio del proyecto.

## Capacidades

- Generacion de texto a pequeña escala, orientada a cuentos infantiles y texto narrativo simple, segun el corpus de entrenamiento descrito.
- Modelado de "persona" o personaje: capacidad investigada explicitamente por el proyecto en torno a clases de nombres de personajes.
- Finetune estrecho y propagacion de comportamiento: el proyecto estudia como un ajuste acotado afecta al resto del modelo.
- Sondas internas de comportamiento durante el entrenamiento (`probes.jsonl`), orientadas a detectar firmas de desalineacion emergente.
- Soporte de tool calling / function calling: no disponible (no se menciona).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se menciona).
- Capacidades multilingues: no disponibles (no especificadas).
- Capacidades especiales (thinking mode, vision, audio): no disponibles. El unico proposito especial declarado es la investigacion sobre desalineacion emergente.

## Casos de uso

- Investigacion en interpretabilidad: analizar las sondas `probes.jsonl` de cada run para estudiar como se representa internamente una clase de nombres de personajes a lo largo del entrenamiento.
- Estudio de alineacion y seguridad: reproducir la propagacion de un finetune estrecho para observar firmas de desalineacion emergente en modelos de muy bajo parametroje.
- Reproducibilidad de experimentos: al conservar `config.json` con commit, semilla y hashes de la receta de datos, cada run puede recrearse exactamente, lo que sirve como banco de pruebas metodologico.
- Generacion de texto narrativo controlado: producir cuentos infantiles sinteticos a partir de los checkpoints, util como linea base frente a corpus generados por modelos mayores.
- Experimentos educativos y de prototipado: el rango de 0,8M–100M permite entrenar y evaluar variantes con recursos minimos, adecuado para docencia o pruebas de concepto.
- Linea base de comparacion para tecnicas de entrenamiento: usar los checkpoints como referencia de modelos diminutos estilo GPT-2 en estudios comparativos de datasets y recetas de datos.
- Analisis de derivados de Gemma: estudiar el comportamiento de modelos entrenados sobre texto generado por `google/gemma-4-26B-A4B-it` dentro del marco de los terminos de uso de Gemma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que los runs son preliminares y que los resultados "no estan todavia analizados, verificados ni publicados"; se anuncia un paper y una release curada mas adelante. Existen salidas de evaluacion en `box-<k>/logs/v4/` y sondas en `probes.jsonl`, pero sus cifras no se recogen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el rango de 0,8M–100M de parametros, los pesos ocupan del orden de unos pocos MB hasta cientos de MB en precision completa, por lo que la inferencia es viable en CPU y en cualquier GPU de consumo.
- GPU recomendadas: no especificadas por el autor; dado el tamaño, no se requieren aceleradores de centro de datos (A100, H100) para la inferencia.
- Compatibilidad con GPU de consumo: si, cualquier GPU de consumo actual es sobradamente suficiente para estos tamaños; tambien es viable en CPU.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. La carga prevista es mediante `dramatis.train.model_from_checkpoint` del repositorio del proyecto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dramatis v4 runs | 0,8M–100M (por run) | no disponible | no disponible (preliminar) | Gemma Terms of Use | repositorio de runs en HF |
| GPT-2 small | 124M | 1024 tokens | no comparable en esta ficha (no se aportan cifras) | MIT | publico |
| distilgpt2 | 82M | 1024 tokens | no comparable en esta ficha (no se aportan cifras) | Apache 2.0 | publico |
| TinyStories (p. ej. variante de 33M) | ~33M | no disponible | no disponible en esta ficha | variable segun variante | publico |

La comparacion es orientativa por tamano y naturaleza (modelos densos diminutos estilo GPT-2 entrenados sobre texto narrativo simple). No se dispone de cifras de rendimiento del modelo evaluado que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Estado preliminar: los runs se publican a medida que terminan en las maquinas de entrenamiento y sus resultados no han sido analizados, verificados ni publicados.
- No es un modelo de proposito general: esta pensado como material de investigacion sobre desalineacion emergente, no para tareas de produccion.
- Posibles sesgos heredados del corpus: los cuentos fueron generados por `google/gemma-4-26B-A4B-it`, por lo que el modelo puede arrastrar sesgos del modelo generador.
- Riesgo de alucinacion y de texto incoherente: con un rango de 0,8M–100M de parametros, la calidad y la coherencia son limitadas frente a modelos de mayor escala.
- Idiomas y contexto: no se especifican idiomas soportados ni longitud de contexto, por lo que no pueden garantizarse capacidades multilingues ni conversaciones de contexto largo.
- Restricciones de licencia: los pesos se acogen a los Gemma Terms of Use (https://ai.google.dev/gemma/terms) y a la Gemma Prohibited Use Policy (https://ai.google.dev/gemma/prohibited_use_policy); pueden considerarse Model Derivatives de Gemma, con las obligaciones que ello implica para uso comercial.
- Tooling limitado: no se documentan integraciones con runtimes de inferencia estandar; la carga depende del codigo del repositorio del proyecto.
- Ausencia de benchmarks y de evaluaciones de seguridad publicadas: no hay evidencia cuantitativa de comportamiento en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/kjsatz/dramatis-v4-runs
- Repositorio del proyecto: https://github.com/kjsatz/dramatis
- Plan de experimentos: `docs/2026-09-22_EXPERIMENT_PLAN.md` en el repositorio del proyecto
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- Paper y release curada: anunciados como proximos, no disponibles en la informacion proporcionada
- Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo o su autor.
