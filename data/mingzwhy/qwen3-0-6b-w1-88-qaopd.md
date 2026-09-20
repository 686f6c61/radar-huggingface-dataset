# MingZwhy/Qwen3-0.6B-W1.88-QAOPD

## Resumen

Qwen3-0.6B-W1.88-QAOPD es una version del modelo Qwen3-0.6B de Alibaba Qwen cuantizada a 1,88 bits por peso y posteriormente recuperada mediante destilacion con conocimiento de cuantizacion (QAD, quantization-aware distillation) seguida de destilacion on-policy (OPD). Lo publica el usuario MingZwhy en HuggingFace, junto con el repositorio de codigo y el recetario de entrenamiento en GitHub (MingZwhy/QAOPD). El objetivo es demostrar que un modelo de 596 millones de parametros puede comprimirse hasta un regimen de precision sub-2 bits sin una degradacion catastrofica, manteniendo un rendimiento util en tareas de matematicas y generacion de codigo.

La cuantizacion esta "cocida" en los pesos: el checkpoint se carga directamente con `transformers` y se evalua sin pasos adicionales de calibracion. Esto lo hace relevante como caso de estudio reproducible de cuantizacion extrema combinada con distillation, un area donde la mayoria de los checkpoints publicados se centran en 4 bits y apenas existen referencias abiertas por debajo de 2 bits. El modelo hereda la licencia Apache-2.0 de Qwen3-0.6B.

Se trata de un checkpoint experimental con cero descargas y cero likes en el momento de redactar esta ficha, orientado a investigacion sobre compresion de modelos y no a despliegue en produccion sin validacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-0.6B); requiere `trust_remote_code=True` por la cuantizacion personalizada |
| Parametros totales | 596.049.920 (segun safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el modelo base Qwen3-0.6B declara 32 768 tokens nativos |
| Tipos de cuantizacion | Mixta INT1.58 / INT4 en bloques de 256, con un 12,5 % de bloques a INT4 (1,88 bits efectivos). Embeddings y cabeza de salida en INT4; activaciones INT8; KV cache en 16 bits |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache-2.0 (heredada de Qwen3-0.6B) |
| Formato de pesos | safetensors con codigo personalizado (`custom_code`); no se publican GGUF ni otros formatos |

Otros datos: repositorio de 1,2 GB, pipeline `text-generation`, etiquetado como compatible con `text-generation-inference` y `endpoints_compatible`, creado el 20 de septiembre de 2026.

## Arquitectura y entrenamiento

La arquitectura de partida es la de Qwen3-0.6B, un transformer decoder-only denso de 0,6 mil millones de parametros. Sobre ese modelo se aplica un esquema de cuantizacion mixta por bloques: bloques de 256 pesos, el 88 % de ellos a INT1.58 y el 12,5 % restante a INT4, lo que arroja una media efectiva de 1,88 bits por peso. Los embeddings de entrada y la cabeza de salida se mantienen en INT4, las activaciones se cuantizan a INT8 y la KV cache conserva 16 bits. Este reparto concentra la precision residual en las capas mas sensibles (embeddings y proyeccion de vocabulario) mientras exprime la compresion en las matrices internas.

El proceso de recuperacion consta de dos fases segun la model card: primero una destilacion con conocimiento de cuantizacion (QAD) y despues una destilacion on-policy (OPD), en la que el propio modelo cuantizado genera las trayectorias que se usan para alinear la distribucion de salida con la del modelo sin cuantizar. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases adicionales de RLHF o DPO. La innovacion principal es precisamente la combinacion QAD + OPD sobre un presupuesto de bits extremadamente bajo, con el objetivo de reducir el dano tipico de la cuantizacion agresiva.

## Capacidades

- Generacion de texto conversacional en formato chat, heredada de Qwen3-0.6B.
- Razonamiento matematico basico y multi-paso: GSM8K 39,65 y MATH-500 15,00 en la evaluacion del autor.
- Generacion de codigo: MBPP 35,7 y HumanEval 35,4 en pass@1 greedy.
- Evaluacion de verosimilitud en nueve benchmarks agregados (metrica QA9, con 41,83 de media).
- Capacidad de ejecucion en entornos con recursos muy limitados gracias al peso reducido de los pesos cuantizados.
- Soporte de tool calling y function calling: no documentado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso de largo horizonte: no documentado; el rendimiento en AMC23 (3,12) sugiere capacidad muy limitada en razonamiento complejo.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada; el checkpoint no declara modo de razonamiento explicito.

## Casos de uso

- Investigacion en cuantizacion extrema: sirve como punto de referencia reproducible para medir la perdida de calidad al bajar de 2 bits por peso, comparando directamente contra el Qwen3-0.6B en BF16 con el mismo arnes de evaluacion publicado por el autor.
- Clasificacion y puntuacion de texto en el borde: con menos de 1 GB de pesos teoricos, el modelo puede ejecutarse en dispositivos con memoria muy limitada para tareas de etiquetado, filtrado o scoring, donde no se requiere generacion larga ni razonamiento.
- Generacion de codigo asistida en entornos locales: HumanEval 35,4 pass@1 permite usarlo como autocompletado de fragmentos cortos en un portatil sin GPU dedicada, aceptando una tasa de fallo notablemente superior a la del modelo sin cuantizar.
- Prototipado rapido y pruebas de concepto conversacionales: al cargarse con `transformers` en pocos segundos y ocupar una fraccion minima de VRAM, es util para validar pipelines de inferencia antes de pasar a un modelo mayor.
- Educacion y demostraciones sobre compresion de modelos: ilustra de forma tangible el compromiso entre bits por peso y rendimiento en tareas de matematicas y codigo, con cifras publicadas y arnes reproducible.
- Simulacion de cargas de inferencia a gran escala: permite estimar coste por token y throughput en escenarios de millones de peticiones cortas, ya que el cuello de botella pasa a ser la memoria de activaciones y no los pesos.
- Evaluacion de robustez de tecnicas QAD/OPD: comparar contra otros metodos de cuantizacion (GPTQ, AWQ, bitsandbytes) en el mismo modelo base para decidir que receta adoptar.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos sobre este checkpoint y comparados con el modelo sin cuantizar. GSM8K en 5-shot strict-match, MATH-500 en 4-shot, AMC23 con avg@16, MBPP y HumanEval con pass@1 greedy, QA9 como media equipesada de nueve benchmarks evaluados por verosimilitud.

| Benchmark | Este modelo (W1.88) | Qwen3-0.6B BF16 | Diferencia |
|---|---:|---:|---:|
| GSM8K | 39,65 | 41,62 | -1,97 |
| MATH-500 | 15,00 | 27,20 | -12,20 |
| AMC23 | 3,12 | 7,81 | -4,69 |
| MBPP | 35,7 | 40,0 | -4,3 |
| HumanEval | 35,4 | 36,6 | -1,2 |
| QA9 | 41,83 | 46,08 | -4,25 |

No se han publicado resultados de benchmarks adicionales (MMLU, razonamiento multilingue, tool calling) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos cuantizados a 1,88 bits ocupan aproximadamente 0,15 GB en teoria, mas el coste de las escalas de bloque, los embeddings y la cabeza de salida en INT4. El repositorio completo pesa 1,2 GB, por lo que es razonable reservar entre 1 y 2 GB de memoria en tiempo de ejecucion, incluyendo activaciones y KV cache en 16 bits.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente en principio; el modelo tambien puede ejecutarse en CPU y en GPUs integradas. No requiere A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo actuales (GTX 1650, RTX 3060, RTX 4060, etc.), en iGPU y en placas tipo Apple Silicon.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y `AutoModelForCausalLM`, que es el unico camino documentado por el autor. No se publican pesos GGUF, por lo que llama.cpp y Ollama no pueden ejecutarlo sin conversion previa. La etiqueta `text-generation-inference` aparece en el repositorio, pero la cuantizacion es personalizada y no esta claro que vLLM o TGI la soporten sin adaptaciones; conviene verificar el soporte antes de planificar un despliegue.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Al tratarse de un modelo de 0,6B, la decodificacion estara limitada por el ancho de banda de memoria y no por el computo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento de referencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-0.6B-W1.88-QAOPD (este) | 596 M | No disponible (base: 32 768) | GSM8K 39,65 / HumanEval 35,4 / QA9 41,83 | Apache-2.0 | safetensors con codigo personalizado |
| Qwen3-0.6B (BF16) | 596 M | 32 768 nativos | GSM8K 41,62 / HumanEval 36,6 / QA9 46,08 | Apache-2.0 | safetensors, integracion estandar en transformers, vLLM y TGI |
| Otras alternativas de ~0,5-1 B (p. ej. Qwen2.5-0.5B, Llama-3.2-1B) | 0,49-1,24 B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |

La referencia directa y unica documentada es el modelo base sin cuantizar, con el que comparte arquitectura y tokenizador; la diferencia de rendimiento es atribuible exclusivamente a la cuantizacion a 1,88 bits y al proceso QAD + OPD. No se han encontrado en la busqueda web resultados relevantes sobre este modelo ni comparativas independientes.

## Limitaciones y advertencias

- Perdida de rendimiento medible y no uniforme: la caida es moderada en GSM8K (-1,97) y HumanEval (-1,2), pero severa en MATH-500 (-12,2 puntos, un 44,9 % relativo) y AMC23 (-4,69 sobre una base de 7,81). El razonamiento matematico de mayor dificultad es el mas castigado.
- Modelo de 0,6 B: conocimiento factual limitado, tendencia alta a la alucinacion en preguntas abiertas de dominio general y escasa fiabilidad en tareas que requieran conocimiento actualizado.
- Cuantizacion extrema: 1,88 bits efectivos por peso implican una reduccion de capacidad de representacion que se manifiesta en generaciones menos coherentes en secuencias largas. No se han publicado evaluaciones de degradacion con la longitud de contexto.
- Idioma: no se declara la lista de idiomas soportados, por lo que el rendimiento fuera del ingles (y potencialmente del chino) es incierto y deberia validarse antes de usarlo en produccion multilingue.
- Dependencia de codigo personalizado: la carga requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio del autor. Conviene auditar ese codigo antes de usarlo en entornos con datos sensibles.
- Falta de validacion externa: cero descargas y cero likes en el momento de redactar la ficha, sin evaluaciones de terceros que confirmen las cifras publicadas.
- Soporte de herramientas limitado: no se documentan tool calling, function calling ni integracion con frameworks de agentes, y su capacidad de razonamiento multi-paso es baja segun los benchmarks.
- Ecosistema: al no haber GGUF ni soporte confirmado en vLLM/TGI, el despliegue en produccion exige trabajo de integracion adicional.
- Licencia: Apache-2.0 heredada de Qwen3-0.6B, lo que permite uso comercial sin restricciones de atribucion mas alla de las habituales, pero el autor no ofrece garantias sobre el checkpoint cuantizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MingZwhy/Qwen3-0.6B-W1.88-QAOPD
- Repositorio de codigo y receta de entrenamiento: https://github.com/MingZwhy/QAOPD
- Documentacion del arnes de evaluacion: https://github.com/MingZwhy/QAOPD/blob/main/docs/EVALUATION.md
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre su metodologia; los unicos enlaces utiles son los proporcionados en la model card y en los metadatos de HuggingFace.
