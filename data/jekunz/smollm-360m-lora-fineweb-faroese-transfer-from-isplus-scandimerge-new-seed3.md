# jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-isplus-scandimerge-new-seed3

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) entrenado sobre el modelo base `jekunz/new_scandimerge_isplus_360`, una variante de SmolLM2-360M-Instruct adaptada al feroés mediante una fusion TIES de modelos entrenados en danes, islandes, noruego bokmal, noruego nynorsk y sueco, seguida de un ajuste especifico sobre el subconjunto feroes de FineWeb-2. Lo publica el usuario jekunz como material de investigacion personal, sin evaluacion amplia publicada.

El interes tecnico reside en la estrategia de transferencia cross-lingua: se parte de un modelo pequeno (360M parametros) ya expuesto a lenguas escandinavas cercanas al feroes, con mayor peso en islandes durante la fusion, y se aplica despues un LoRA de rango alto (256) sobre las proyecciones del bloque MLP. El resultado es un adaptador de 0,4 GB que se acopla al modelo base y que, por su tamano, puede ejecutarse en hardware muy modesto.

Se trata de la semilla 3 de tres ejecuciones con la misma configuracion, lo que sugiere un interes en medir la varianza del entrenamiento. No hay resultados de benchmarks ni evaluaciones cualitativas publicadas, y el propio autor advierte que el modelo no ha sido evaluado de forma amplia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only SmolLM2-360M-Instruct |
| Parametros totales | 360M en el modelo base; el adaptador LoRA se almacena como safetensors de 0,4 GB (parametros exactos del adaptador no disponibles) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens durante el entrenamiento; la del modelo base no se especifica en la informacion disponible |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; el modelo base admite las cuantizaciones propias de SmolLM2, no documentadas aqui) |
| Idiomas soportados | feroes (fo); el modelo base esta orientado a lenguas escandinavas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), libreria `peft` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre SmolLM2-360M-Instruct, un transformer decoder-only de 360M parametros. El LoRA usa rango 256 y alpha 512 (escala efectiva de 2), con modulos objetivo `up_proj`, `down_proj`, `gate_proj` y `o_proj`, es decir, las proyecciones del bloque MLP y la proyeccion de salida de atencion. Es una configuracion de rango inusualmente alto para un modelo de este tamano, lo que sugiere que se busca una adaptacion intensa mas que un ajuste ligero.

El entrenamiento consta de dos fases: primero, un ajuste sobre una fusion TIES (con mayor peso en islandes) de modelos entrenados con las porciones danesa, islandesa, noruega bokmal, noruega nynorsk y sueca de FineWeb-2, con una epoca por lengua fuente; despues, cinco epocas sobre la porcion feroesa de FineWeb-2. Se uso learning rate 8e-4 con scheduler coseno, warmup del 5%, batch size 8 con acumulacion de gradientes de 32 pasos (batch efectivo 256), contexto maximo de 2048 tokens, una sola A100 de 40 GB y semilla 3. No se documenta uso de RLHF, DPO ni datos de instrucciones adicionales; el ajuste es de modelado de lenguaje sobre texto web.

## Capacidades

- Generacion de texto en feroes, heredando la capacidad de modelado de lenguaje del ajuste sobre FineWeb-2.
- Conversacion basica por herencia de la variante Instruct de SmolLM2, aunque no se documenta un ajuste especifico de instrucciones en feroes.
- Transferencia cross-lingua desde lenguas escandinavas cercanas (islandes, noruego, danes, sueco) hacia el feroes.
- No hay evidencia publicada de soporte de tool calling, function calling, agentes o razonamiento multi-paso en este adaptador.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue limitada al feroes y, por herencia del modelo base, a las lenguas escandinavas; el resto de idiomas no esta evaluado.

## Casos de uso

- Generacion de texto en feroes para prototipos de investigacion: el adaptador permite experimentar con generacion en una lengua de bajos recursos sobre hardware de consumo, gracias a sus 360M parametros.
- Estudio de transferencia cross-lingua: sirve como caso controlado para medir cuanto transfiere un modelo escandinavo pequeno hacia el feroes, comparando con las otras semillas de la misma configuracion.
- Aumento de datos sinteticos en feroes: puede generar texto de relleno o variantes para pipelines de datos de una lengua con pocos corpus publicos, siempre con revision humana.
- Experimentos de analisis de varianza de entrenamiento: al existir tres semillas de la misma configuracion, permite estudiar la estabilidad del ajuste LoRA en lenguas de bajos recursos.
- Base para posteriores ajustes supervisados en feroes: el adaptador puede servir de punto de partida para fine-tuning con instrucciones o tareas concretas, aunque requeriria validacion previa.
- Docencia y experimentacion con PEFT: su configuracion LoRA documentada (rango 256, alpha 512, modulos MLP y `o_proj`) lo convierte en un ejemplo reproducible de ajuste de bajo coste con una sola GPU A100.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 360M parametros en fp16 ocupa aproximadamente 0,7 GB de pesos; en 8 bits, alrededor de 0,4 GB; en 4 bits, alrededor de 0,25 GB. A esto se suma el adaptador LoRA y el overhead de activaciones y cache KV.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente para el modelo base cuantizado; una RTX 3060, RTX 4060 o superior ofrece margen amplio.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna, e incluso en CPU con llama.cpp u Ollama para el modelo base.
- Opciones de despliegue: el adaptador requiere `peft` sobre el modelo base; para inferencia optimizada puede fusionarse con el modelo base y servirse con vLLM o TGI, o convertirse a GGUF para llama.cpp y Ollama.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Este adaptador (SmolLM2-360M + LoRA feroes) | 360M + LoRA | 2048 en entrenamiento | Feroes | Apache 2.0 | Sin evaluacion publicada; investigacion personal |
| SmolLM2-360M-Instruct (HuggingFaceTB) | 360M | No disponible en esta ficha | Multilingue (principalmente ingles) | Apache 2.0 | Modelo base de referencia, con evaluacion publicada por el autor original |
| Modelos escandinavos pequenos tipo GPT-SW3 o NorBERT | Variable | Variable | Lenguas escandinavas | Variable | No cubren feroes de forma especifica en la informacion disponible |
| Modelos multilingues grandes (p. ej. familia Qwen o Llama) | 1B-8B+ | 8K-128K | Multilingue amplio | Variable | Mayor calidad potencial en feroes, pero mucho mas costosos en hardware |

La comparacion directa con alternativas especificas para feroes no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Sin evaluacion publicada: el autor indica explicitamente que el modelo no ha sido evaluado de forma amplia, por lo que su calidad real en feroes es desconocida.
- Riesgo de alucinacion: al ser un modelo de 360M ajustado sobre texto web, la generacion de hechos es poco fiable.
- Sesgos: el entrenamiento sobre FineWeb-2 hereda los sesgos del corpus web, sin filtrado ni mitigacion documentados.
- Contexto limitado: 2048 tokens durante el entrenamiento, insuficiente para tareas de contexto largo.
- Cobertura idiomatica estrecha: solo feroes documentado; el rendimiento en otras lenguas no esta evaluado y puede degradarse respecto al modelo base.
- Uso comercial: la licencia Apache 2.0 lo permite, pero la ausencia de evaluacion hace arriesgado desplegarlo en produccion sin validacion propia.
- Dependencia del modelo base: requiere cargar `jekunz/new_scandimerge_isplus_360`, cuyo mantenimiento y disponibilidad a largo plazo no estan garantizados.
- Es una de tres semillas: los resultados pueden variar entre semillas y no se documenta la varianza.

## Enlaces

- [Hugging Face: jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-isplus-scandimerge-new-seed3](https://huggingface.co/jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-isplus-scandimerge-new-seed3)
- [Modelo base: jekunz/new_scandimerge_isplus_360](https://huggingface.co/jekunz/new_scandimerge_isplus_360)
- [Dataset: HuggingFaceFW/fineweb-2](https://huggingface.co/datasets/HuggingFaceFW/fineweb-2)
- [SmolLM2-360M-Instruct (modelo de partida)](https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct)
- [Libreria PEFT](https://github.com/huggingface/peft)
