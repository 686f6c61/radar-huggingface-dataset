# kylelovesllms/translation-syntax-en_za_withhold_comb-145000

## Resumen

`kylelovesllms/translation-syntax-en_za_withhold_comb-145000` es un repositorio de artefactos de entrenamiento publicado en Hugging Face, no un modelo individual listo para uso en produccion. Contiene una coleccion de 36 ejecuciones completas (runs) de modelos GPT-2 de configuracion reducida, entrenados desde cero en el proyecto `tbd-syntax`, dentro del experimento `exp_english_zapanese_withhold_combinations`. Cada ejecucion corresponde a una combinacion distinta de profundidad (2, 4 o 6 capas), numero de cabezas de atencion (2, 4 u 8) y semilla aleatoria (42, 43, 44 o 45), siempre con una dimension oculta de 256.

El objetivo declarado del proyecto es el estudio de sintaxis y traduccion entre ingles y japones mediante el control sistematico de combinaciones retenidas (withhold combinations), lo que sugiere un diseno experimental orientado a analizar como la arquitectura y la inicializacion afectan al aprendizaje de estructuras sintacticas en tareas de traduccion. El repositorio incluye checkpoints en formato Hugging Face (`config.json`, `model.safetensors`, tokenizer), configuracion de cada run, metricas, evaluaciones y analisis, pero no incluye el estado del optimizador (`resume/`).

Su relevancia es acotada y de caracter academico: no es un modelo de proposito general ni compite con LLMs actuales. Resulta util para investigadores interesados en reproducir experimentos de sintaxis controlada con GPT-2 de escala minima, o para auditar los resultados de un estudio concreto. El tamano del repositorio (10,5 GB) refleja el conjunto agregado de los 36 checkpoints, no un unico modelo de ese tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 |
| Parametros totales | no disponible (depende de la run; dimension oculta fija de 256, capas 2/4/6, cabezas 2/4/8) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el experimento se centra en ingles y japones) |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoints en formato Hugging Face) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con la configuracion clasica de GPT-2, pero con variaciones controladas de profundidad y anchura de atencion: 2, 4 o 6 capas; 2, 4 u 8 cabezas de atencion; dimension oculta constante de 256 en todas las runs. Cada combinacion se entrena con cuatro semillas distintas (42, 43, 44, 45), lo que da lugar a 36 ejecuciones completas. Esta factorializacion permite aislar el efecto de la profundidad, el numero de cabezas y la inicializacion sobre el rendimiento en la tarea de traduccion/sintaxis.

Los datos de entrenamiento provienen del dataset `kylelovesllms/english_zapanese_withhold_combinations-filled`, orientado a pares ingles-japones con combinaciones retenidas. No se especifica en la informacion disponible el numero de tokens, la composicion exacta del corpus ni si se aplicaron tecnicas de RLHF o DPO; dado el tamano y la naturaleza del experimento, es probable que el entrenamiento sea supervisado (next-token prediction) sin alineamiento posterior, aunque este extremo no se confirma. Cada run incluye `metrics.csv`, `evals/` y `analysis/`, lo que sugiere que el autor registro curvas de perdida y evaluaciones especificas del estudio, pero los valores no se detallan en la model card.

## Capacidades

- Generacion de texto autoregresiva basica, limitada por la escala minima del modelo (2-6 capas, dimension 256).
- Traduccion ingles-japones en el contexto acotado del experimento `english_zapanese_withhold_combinations`, sin garantia de calidad fuera de ese dominio.
- Modelado de estructuras sintacticas bajo condiciones controladas de retencion de combinaciones, que es el objeto de estudio del proyecto.
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documenta razonamiento multi-paso, modo thinking, vision ni audio.
- Capacidades multilingues no disponibles mas alla del par ingles-japones del experimento.

## Casos de uso

- Reproduccion de experimentos academicos: cada run permite replicar exactamente una configuracion (capas, cabezas, semilla) para validar los hallazgos del estudio `tbd-syntax` sobre sintaxis y traduccion.
- Analisis de escalado arquitectonico: comparar las 36 runs permite estudiar como varian las metricas al cambiar profundidad y numero de cabezas con dimension oculta fija, util para investigacion sobre eficiencia de arquitecturas pequenas.
- Estudio de sensibilidad a la semilla: las cuatro semillas por configuracion permiten medir la varianza de resultados atribuible a la inicializacion, un aspecto relevante en experimentos de bajo presupuesto.
- Auditoria de artefactos de entrenamiento: los `metrics.csv`, `evals/` y `analysis/` sirven para revisar curvas de aprendizaje y evaluaciones sin reentrenar.
- Docencia y formacion: modelos GPT-2 minimos con checkpoints completos son utiles para explicar el ciclo de entrenamiento y evaluacion en cursos de NLP.
- Base para experimentos de sintaxis controlada: investigadores pueden partir de estos checkpoints para probar nuevas hipotesis sobre retencion de combinaciones en traduccion.
- No se recomienda su uso en produccion, atencion al cliente ni generacion de codigo, dado el caracter experimental y la ausencia de datos de rendimiento general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la existencia de `metrics.csv`, `evals/` y `analysis/` por run, pero no incluye cifras concretas (MMLU, HumanEval, GSM8K, BLEU u otras) que puedan tabularse.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; con dimension oculta de 256 y 2-6 capas, cada checkpoint individual es muy pequeno (del orden de decenas de MB o pocos cientos de MB), muy por debajo del total del repositorio (10,5 GB, que agrega las 36 runs).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es sobradamente suficiente para una run individual; tambien es viable en CPU.
- Cabe en GPU consumer: si, con amplio margen, para cualquier checkpoint individual.
- Opciones de despliegue: transformers de Hugging Face, llama.cpp (previa conversion a GGUF, no incluida), vLLM y TGI no estan documentados para este repositorio; el formato nativo es safetensors con configuracion GPT-2.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (GPT-2 2-6 capas, 256d) | no disponible (muy reducido) | no disponible | no disponible | no disponible | Hugging Face |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | benchmarks publicos disponibles | MIT | Hugging Face |
| GPT-2 medium (OpenAI) | 355 M | 1024 tokens | benchmarks publicos disponibles | MIT | Hugging Face |
| Modelos de traduccion EN-JA dedicados (p. ej. MarianMT/NLLB) | variable | variable | BLEU publicados en sus model cards | variable (MIT, CC-BY-NC) | Hugging Face |

La comparacion es limitada: este repositorio no es un modelo unico sino un conjunto de artefactos experimentales, y carece de datos publicos de rendimiento que permitan una comparacion cuantitativa justa con GPT-2 small/medium o con modelos de traduccion especializados.

## Limitaciones y advertencias

- No es un modelo de proposito general: son artefactos de investigacion con arquitectura minima y sin alineamiento documentado.
- Ausencia total de datos de benchmarks, licencia e idiomas en la model card, lo que impide evaluar su idoneidad para cualquier uso comercial.
- Riesgo elevado de alucinacion y de generacion incoherente fuera del dominio de entrenamiento (traduccion EN-JA con combinaciones retenidas).
- No se incluye el estado del optimizador (`resume/`), por lo que la reanudacion exacta del entrenamiento no es posible con lo publicado.
- El repositorio agrega 36 checkpoints; descargarlo completo requiere 10,5 GB aunque cada run individual sea ligera.
- La licencia no esta declarada: no se puede asumir permiso para uso comercial ni redistribucion.
- La fecha de creacion indicada (2026-11-09) y la referencia a una rama `backup/2026-11-08-working-tree` deben tratarse con cautela; verificar metadatos antes de citar el recurso.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kylelovesllms/translation-syntax-en_za_withhold_comb-145000
- Dataset de entrenamiento: https://huggingface.co/datasets/kylelovesllms/english_zapanese_withhold_combinations-filled
- Codigo fuente del proyecto (rama backup): https://github.com/Ky-Ng/tbd-syntax/tree/backup/2026-11-08-working-tree/src/training/exp_english_zapanese_withhold_combinations
