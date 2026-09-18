# Jeesup/svd-safety-l31_remove50_swapgapiter_b010

## Resumen

`Jeesup/svd-safety-l31_remove50_swapgapiter_b010` es un checkpoint derivado de `meta-llama/Llama-3.1-8B-Instruct` al que se le ha aplicado una compresion SVD-LLM que elimina el 50,03 % de los parametros densos (fraccion resultante: 0,4997) y, a continuacion, un proceso de edicion iterativa de parametros denominado "swap" seleccionado por la regla `gap_iter`. El resultado es un modelo de 8.030.261.248 parametros almacenados en safetensors, con un repositorio de 16,1 GB, publicado por el usuario Jeesup con fecha de creacion del 17 de septiembre de 2026 y cero descargas y cero "likes" en el momento de redactar esta ficha.

El modelo no es un asistente conversacional de proposito general, sino un artefacto de investigacion. Forma parte de una rejilla experimental cuyo objetivo es medir como la compresion por descomposicion en valores singulares degrada el comportamiento de seguridad de un LLM y que regla de seleccion de componentes repara mejor ese dano. En esta celda concreta se restauraron 10.323 componentes y se sustituyeron otros tantos, con 64.333.824 parametros insertados (0,92 % de los parametros de proyeccion densos), repartidos en 10 rondas iterativas de 0,1 % del presupuesto denso cada una y una semilla fijada a 42.

Su relevancia es metodologica: documenta de forma explicita el compromiso entre seguridad y utilidad bajo compresion agresiva. Los datos medidos por el autor muestran una tasa de exito de ataque de 0,0000 en AdvBench y 0,0096 en StrongREJECT (juez HarmBench), pero tambien una tasa macro de sobre-rechazo de 0,7471 medida con WildGuard y una perplejidad en WikiText-2 de 42.290,6719, un valor que indica un colapso severo de la capacidad de modelado del lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only autorregenerativo (familia Llama 3.1), con atencion de consultas agrupadas (GQA) en el modelo base; las proyecciones densas han sido comprimidas con SVD-LLM y parcialmente restauradas |
| Parametros totales | 8.030.261.248 (dato real de safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no especificada en la model card; el modelo base Llama-3.1-8B-Instruct declara 128.000 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors; no se documentan versiones GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | no declarados en la model card; el modelo base declara 8 idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | Llama 3.1 Community License (incluye `LICENSE` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors, cargables con la libreria `transformers` |
| Modelo base | `meta-llama/Llama-3.1-8B-Instruct` |
| Compresion aplicada | SVD-LLM, 50,03 % de parametros eliminados |
| Fraccion de parametros resultante | 0,4997 |
| Regla de seleccion | `gap_iter` |
| Presupuesto de restauracion | 1,000 % de los parametros densos (0,100 % por ronda, 10 de 10 rondas aplicadas) |
| Componentes restaurados / sustituidos | 10.323 restaurados, 10.323 sustituidos |
| Parametros insertados | 64.333.824 (0,92 % de los parametros de proyeccion densos) |
| Valor de swap | `insert` (solo valor de insercion; desalojo ordenado por sigma) |
| Semilla | 42 |
| Tamano del repositorio | 16,1 GB |
| Pipeline declarado | text-generation |
| Compatibilidad de despliegue | `transformers`, text-generation-inference, `endpoints_compatible` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only autorregresivo con normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion de consultas agrupadas. Sobre esa base, el autor no ha reentrenado el modelo: ha aplicado una compresion post-hoc mediante SVD-LLM, que descompone las matrices de proyeccion y trunca los componentes de menor singular value hasta alcanzar el 50,03 % de parametros eliminados. Este checkpoint no es un fine-tune del modelo base, sino una modificacion estructural de sus pesos, por lo que la etiqueta `base_model:finetune` de HuggingFace resulta, en la practica, imprecisa.

La segunda fase es la edicion iterativa por "swap" de parametros neutros: en cada una de las 10 rondas se seleccionan componentes segun la regla `gap_iter` y se sustituyen por valores insertados, con un presupuesto del 0,1 % de los parametros densos por ronda. La hipotesis del estudio es que la compresion SVD degrada el comportamiento de rechazo ante peticiones daninas, y que es posible repararlo parcialmente reinsertando un subconjunto minimo de componentes (hasta el 1,0 % del total denso). No se documentan en la informacion disponible el numero de tokens de entrenamiento adicionales (no los hay: es una edicion de pesos, no un entrenamiento), la composicion del dataset, ni el uso de RLHF o DPO. El autor tampoco publica la metodologia completa de la rejilla experimental, solo la celda resultante.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base, aunque severamente degradada: la perplejidad de 42.290,6719 en WikiText-2 sugiere que la salida es en gran medida incoherente.
- Rechazo de peticiones daninas: tasa de exito de ataque de 0,0000 en AdvBench con juez HarmBench y 0,0096 en StrongREJECT, el resultado mas bajo y por tanto mas "seguro" de la rejilla segun el autor.
- Sobre-rechazo elevado: 0,7471 macro con WildGuard, es decir, el modelo rechaza una proporcion muy alta de peticiones benignas.
- Soporte de tool calling / function calling: no documentado en la model card; el modelo base lo soporta, pero no hay evidencia de que esta edicion lo conserve.
- Soporte de agentes y razonamiento multi-paso: no documentado y altamente improbable dado el estado de los pesos.
- Capacidades multilingues: no evaluadas en esta celda; el modelo base declara 8 idiomas.
- Capacidades especiales (vision, audio, thinking mode): ninguna. No hay modalidad adicional ni modo de razonamiento explicito.
- Valor como sujeto experimental: si es capaz de servir como celda comparable dentro de una rejilla de reglas de seleccion y presupuestos, que es su funcion declarada.

## Casos de uso

- Investigacion sobre compresion y seguridad: el checkpoint se usa como condicion experimental para cuantificar cuanto degrada la compresion SVD-LLM el comportamiento de rechazo de Llama-3.1-8B-Instruct, comparando sus metricas de ASR con las del modelo sin comprimir.
- Benchmark de tecnicas de reparacion: sirve como celda del brazo `gap_iter` con presupuesto del 1,0 %, permitiendo contrastar esta regla de seleccion contra otras reglas de la misma rejilla bajo un presupuesto identico.
- Estudio del sobre-rechazo inducido por compresion: con 0,7471 de macro over-refusal, el modelo es un caso de analisis util para medir como las intervenciones de seguridad destruyen la utilidad general del sistema.
- Analisis de interpretabilidad mecanistica: los 10.323 componentes restaurados y los 64.333.824 parametros insertados constituyen un conjunto identificable sobre el que estudiar que subespacios de pesos sostienen el comportamiento de rechazo.
- Auditoria de reproducibilidad: al estar fijada la semilla a 42 y documentarse el numero de rondas, el chunk por ronda y los recuentos de componentes, la celda se puede reejecutar y verificar.
- Evaluacion de arneses de red-teaming: la discrepancia entre AdvBench (0,0000) y StrongREJECT (0,0096) con el mismo juez resulta util para calibrar la sensibilidad de distintos conjuntos de ataques.
- Referencia negativa en pruebas de regresion de pipelines: dado su colapso de perplejidad, puede emplearse como caso de control para verificar que un sistema de evaluacion detecta correctamente modelos no desplegables.
- Docencia y divulgacion tecnica: ilustra de forma medible el coste en utilidad de una intervencion de seguridad agresiva, con cifras concretas y trazables.

## Benchmarks y rendimiento

Los unicos datos publicados son los de la model card del autor, medidos sobre esta celda concreta. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, MT-Bench) en la informacion disponible, ni comparaciones con las demas celdas de la rejilla.

| Metrica | Resultado | Instrumento |
|---|---|---|
| AdvBench ASR (tasa de exito de ataque) | 0,0000 | Juez HarmBench |
| StrongREJECT ASR (tasa de exito de ataque) | 0,0096 | Juez HarmBench |
| Macro over-refusal | 0,7471 | WildGuard |
| Perplejidad WikiText-2 | 42.290,6719 | WikiText-2 |
| MMLU / HumanEval / GSM8K / MT-Bench | no disponible | no disponible |

## Requisitos de hardware

- Peso en precision completa: 8.030.261.248 parametros, es decir, aproximadamente 16,1 GB en BF16/FP16, coherente con el tamano del repositorio.
- VRAM estimada para inferencia: unos 17-18 GB en BF16 contando cache KV y overhead del runtime; unos 9-10 GB en cuantizacion de 8 bits; unos 5-6 GB en cuantizacion de 4 bits.
- GPU recomendadas para BF16: A100 40/80 GB, H100 80 GB, L40S 48 GB o cualquier GPU con 24 GB o mas.
- Cabe en GPU de consumo: si, en BF16 en RTX 3090, RTX 4090 y RTX 5090 (24-32 GB); en RTX 4080, RTX 4070 Ti Super y RTX 3080 Ti (16 GB) requeriria cuantizacion de 8 o 4 bits, no publicada en el repositorio.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM`; text-generation-inference (el repositorio esta marcado como `endpoints_compatible`); vLLM y SGLang son viables con los pesos safetensors; llama.cpp y Ollama requieren convertir previamente a GGUF, conversion no suministrada por el autor.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia de primer token para esta celda.
- Nota: dado el colapso de perplejidad, los requisitos de hardware son irrelevantes en la practica, porque el modelo no produce texto utilizable.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Estado |
|---|---|---|---|---|---|
| svd-safety-l31_remove50_swapgapiter_b010 | 8,03 B (50,03 % comprimido) | no especificado (base: 128.000) | Llama 3.1 Community License | safetensors | Artefacto de investigacion, 0 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | Llama 3.1 Community License | safetensors | Modelo de referencia, ampliamente desplegado |
| Llama-3.1-8B-Instruct cuantizado a 4 bits (GPTQ/AWQ) | 8,03 B (preciso reducida) | 128.000 tokens | Llama 3.1 Community License | safetensors / GGUF | Alternativa practica para GPU de consumo |
| Mistral-7B-Instruct-v0.3 | 7,2 B | 32.000 tokens | Apache 2.0 | safetensors / GGUF | Alternativa de licencia permisiva, mismo segmento |

La comparacion de rendimiento con estas alternativas no esta disponible: el autor solo publica las cuatro metricas de seguridad y perplejidad de su propia celda, sin ejecutar MMLU, HumanEval ni evaluaciones conversacionales comparativas.

## Limitaciones y advertencias

- El autor advierte explicitamente de que el checkpoint no es un modelo de chat de proposito general y de que varias celdas de la rejilla estan deliberadamente degradadas en seguridad.
- Perplejidad de WikiText-2 de 42.290,6719: en la practica, el modelo ha perdido la capacidad de modelar lenguaje de forma util. Cualquier uso generativo producira salidas incoherentes.
- Sobre-rechazo macro de 0,7471 con WildGuard: rechaza la mayor parte de las peticiones, incluidas las benignas, lo que lo inutiliza como asistente.
- Riesgo de alucinacion: extremo. Un modelo con esta perplejidad no mantiene coherencia factual ni de contexto; no debe usarse para generar informacion que se vaya a consumir sin verificacion.
- La tasa de ataque de 0,0000 en AdvBench no debe interpretarse como una seguridad superior, sino como consecuencia del colapso del modelo: es probable que las respuestas sean incoherentes y que el juez las clasifique como no daninas.
- Sesgos conocidos: no evaluados en esta celda. Hereda los sesgos del modelo base, pero no hay mediciones disponibles.
- Limitaciones de contexto e idioma: no se ha verificado que la ventana de 128.000 tokens del modelo base siga siendo funcional tras la compresion al 50 %; tampoco se ha evaluado el multilingue.
- Restricciones de licencia: se aplica la Llama 3.1 Community License con sus politicas de uso aceptable. El uso comercial esta sujeto a los terminos de Meta, y al ser una obra derivada se deben conservar los avisos de atribucion ("Built with Llama").
- No apto para produccion bajo ninguna circunstancia: sin evaluacion propia, el autor desaconseja extraer conclusiones sobre su comportamiento.
- Cero descargas y cero "likes": no hay comunidad que haya validado el artefacto ni informes independientes de reproduccion.
- Fechas de creacion y actualizacion (ambas en septiembre de 2026) con un intervalo de solo ocho minutos entre publicacion y ultima modificacion, lo que sugiere una subida automatizada de resultados sin revision posterior.
- No se publica la metodologia completa de la rejilla ni el resto de celdas, lo que limita la interpretabilidad aislada de este resultado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l31_remove50_swapgapiter_b010
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1 (alojada en Meta): https://www.llama.com/llama3_1/license/
- Metodo SVD-LLM: no se ha encontrado ningun enlace al paper en la informacion proporcionada; la model card menciona la tecnica por su nombre pero no cita la publicacion.
- Otros recursos, repositorios o demos: no disponible. La busqueda web realizada devolvio exclusivamente resultados no relacionados con el modelo (articulos enciclopedicos y turisticos sobre la ciudad de Los Angeles), por lo que no aportan ningun enlace util para esta ficha.
