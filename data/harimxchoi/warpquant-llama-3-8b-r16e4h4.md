# HarimxChoi/WarpQuant-Llama-3-8B-R16E4H4

## Resumen

WarpQuant-Llama-3-8B-R16E4H4 es un modelo de lenguaje de 8.030 millones de parámetros desarrollado por Harim Choi, que aplica una técnica de cuantización post-entrenamiento denominada WarpQuant sobre el modelo base NousResearch/Meta-Llama-3-8B. El objetivo es reducir drásticamente el peso del modelo manteniendo una calidad aceptable, combinando tres estrategias: rotación de Hadamard con signo, GPTQ por bloques y recuperación de columnas débiles mediante sensibilidad Output-Fisher. El resultado es una cuantización mixta de aproximadamente 3,63 bits por peso (bpw) que reduce el payload analítico a 3,389 GiB, frente a los 14,965 GiB del modelo en BF16, lo que supone una compresión de más del 77%.

La relevancia de este modelo radica en que demuestra una vía para ejecutar modelos de 8B en hardware con recursos limitados sin recurrir a cuantizaciones estándar como GGUF o GPTQ, sino mediante un esquema híbrido que preserva información crítica en BF16. Está pensado para investigadores y desarrolladores interesados en técnicas avanzadas de compresión de LLMs, aunque su adopción en producción requiere evaluar la pérdida de precisión frente a alternativas más establecidas. El repositorio incluye un informe técnico y código en GitHub para reproducir el método.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3 8B) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (heredado de Llama 3 8B, no especificado en la ficha) |
| Tipos de cuantizacion | WarpQuant: INT3 base (proyecciones), BF16 (columnas recuperadas), INT4 grupo 128 (embedding y output head) |
| Idiomas soportados | en (ingles) |
| Licencia | Llama 3 Community License (llama3) |
| Formato de pesos | safetensors (valores cuantizados almacenados en BF16-compatible) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura estándar de Llama 3 8B, un transformer decoder-only con atención multi-cabeza y normalización RMSNorm. No ha sido entrenado ni ajustado adicionalmente; se trata de una cuantización post-entrenamiento aplicada sobre los pesos del modelo base. La técnica WarpQuant introduce tres innovaciones principales: primero, una rotación de Hadamard con signo que redistribuye la energía de los pesos para reducir outliers; segundo, una cuantización por bloques inspirada en GPTQ que asigna bits de forma adaptativa; y tercero, un mecanismo de recuperación de columnas débiles basado en la sensibilidad Output-Fisher, que identifica las columnas más críticas para la salida y las restaura en BF16. El embedding y la capa de salida se cuantizan a INT4 con grupo de 128. No se reporta el uso de RLHF ni DPO, ya que el proceso es exclusivamente de compresión.

## Capacidades

- Generacion de texto: completa frases, responde preguntas y mantiene conversaciones multi-turno, heredando las capacidades del Llama 3 8B original.
- Razonamiento y conocimiento general: mantiene un nivel aceptable de razonamiento básico, aunque con una ligera degradación respecto al modelo BF16 (MMLU cae de 41,04 a 38,99).
- Codigo: puede generar y explicar fragmentos de codigo en lenguajes comunes, aunque no se han publicado benchmarks especificos de codigo (HumanEval, MBPP) para esta cuantizacion.
- Matematicas: resuelve problemas aritmeticos y algebraicos simples, pero sin datos de GSM8K disponibles.
- Multilingue: oficialmente solo ingles; el rendimiento en otros idiomas no esta garantizado.
- Tool calling / function calling: no se menciona soporte explicito; como modelo base sin fine-tuning, no se recomienda para agentes que requieran invocacion de herramientas.
- Modo pensamiento (thinking): no disponible; es un modelo de generacion directa sin modo de razonamiento extendido.

## Casos de uso

- Inferencia en dispositivos con recursos limitados: gracias a su bajo peso (3,389 GiB), puede ejecutarse en GPUs de gama media o incluso en CPUs con suficiente RAM, permitiendo desplegar un modelo de 8B en entornos edge o en laptops sin GPU dedicada.
- Prototipado rapido de aplicaciones de generacion de texto: desarrolladores pueden integrar el modelo en pipelines de texto usando transformers, con una huella de memoria reducida, ideal para pruebas de concepto o demos.
- Investigacion en cuantizacion: el repositorio y el informe tecnico sirven como referencia para estudiar metodos de compresion basados en Hadamard y Output-Fisher, y para comparar con tecnicas como GPTQ o AWQ.
- Procesamiento de lenguaje natural en ingles: tareas como clasificacion de texto, extraccion de informacion o resumen pueden ejecutarse con una precision moderada, suficiente para aplicaciones internas donde el coste de GPU sea un factor limitante.
- Generacion de contenido asistida: redaccion de borradores, correccion de estilo o generacion de respuestas en ingles, siempre que se acepte una calidad ligeramente inferior a la del modelo original.
- Educacion y experimentacion: estudiantes y profesionales pueden utilizar el modelo para aprender sobre cuantizacion de LLMs, ya que el codigo fuente y los pesos estan publicamente disponibles.

## Benchmarks y rendimiento

La model card del autor incluye una tabla comparativa con el modelo BF16 original y dos cuantizaciones GGUF (Q4_K_M e IQ3_S). Los resultados son los siguientes:

| Formato | Text bpw | Payload | WikiText-2 PPL ↓ | ARC-299 ↑ | MMLU-13,943 ↑ |
|---|---:|---:|---:|---:|---:|
| BF16 | 16,00 | 14,965 GiB | 6,2559 | 50,50 | 41,04 |
| Q4_K_M | 4,89 | 4,583 GiB | 6,4359 | 50,84 | 40,67 |
| IQ3_S + imatrix | 3,66 | 3,429 GiB | 6,9929 | 44,15 | 39,87 |
| **WarpQuant Fisher R16E4H4** | **3,6256** | **3,389 GiB** | **7,3446** | **45,49** | **38,99** |

Se observa que WarpQuant consigue un bpw ligeramente inferior a IQ3_S, pero con una perplejidad en WikiText-2 mayor (7,34 frente a 6,99) y peores resultados en ARC y MMLU. Esto indica una perdida de calidad mas acusada que la cuantizacion GGUF equivalente, aunque el payload es menor. No se han publicado resultados en benchmarks de codigo, matematicas o razonamiento conversacional.

## Requisitos de hardware

- VRAM estimada: el payload analitico es de 3,389 GiB; considerando overhead de runtime (activaciones, cache KV, buffers), se estima un consumo de VRAM entre 4 y 6 GB para inferencia con batch pequeno.
- GPU recomendadas: tarjetas con 6 GB o mas de VRAM, como RTX 2060, RTX 3060, RTX 4060, o GPUs profesionales como T4 o L4. No requiere GPU de datacenter.
- Compatibilidad con consumer GPU: si, cabe en la mayoria de GPUs de consumo actuales (8 GB o mas) y en algunas de 6 GB con cuantizacion adicional del runtime.
- Opciones de despliegue: compatible con transformers y text-generation-inference (segun los tags). No se menciona soporte nativo para llama.cpp u Ollama, aunque al ser safetensors podria convertirse a GGUF si se desea.
- Latencia y throughput: no se proporcionan datos medidos; se espera una velocidad similar a otros modelos de 8B cuantizados, con un throughput aproximado de 20-40 tokens/s en una RTX 3060, dependiendo del batch.

## Comparativa con modelos similares

La comparativa se centra en cuantizaciones del mismo modelo base (Llama 3 8B) con diferentes metodos:

| Modelo | Metodo | bpw | Payload | WikiText-2 PPL | MMLU |
|---|---|---|---|---|---|
| Llama 3 8B BF16 | Original | 16,00 | 14,965 GiB | 6,2559 | 41,04 |
| Llama 3 8B Q4_K_M | GGUF | 4,89 | 4,583 GiB | 6,4359 | 40,67 |
| Llama 3 8B IQ3_S | GGUF + imatrix | 3,66 | 3,429 GiB | 6,9929 | 39,87 |
| **WarpQuant R16E4H4** | WarpQuant | 3,6256 | 3,389 GiB | 7,3446 | 38,99 |

WarpQuant ofrece el menor payload, pero a costa de una mayor perplejidad y peores resultados en MMLU que IQ3_S, que tiene un bpw muy similar. En comparacion con Q4_K_M, la perdida de calidad es notable (7,34 vs 6,43 en PPL), aunque el ahorro de memoria es de aproximadamente 1,2 GiB. No se dispone de datos sobre otros metodos como AWQ o GPTQ para este modelo base.

## Limitaciones y advertencias

- Perdida de precision: la cuantizacion degrada significativamente la calidad del modelo, especialmente en tareas de razonamiento y conocimiento (MMLU cae mas de 2 puntos respecto al BF16). No es recomendable para aplicaciones donde la exactitud sea critica.
- Sesgos y alucinaciones: al ser una version cuantizada de Llama 3 8B, hereda los sesgos del modelo original (estereotipos, sesgos de genero, etc.) y puede producir alucinaciones, especialmente con contextos largos o preguntas ambiguas.
- Idioma: solo se garantiza un rendimiento aceptable en ingles; otros idiomas pueden dar resultados muy degradados.
- Licencia: la licencia Llama 3 Community permite uso comercial, pero con restricciones: si el producto tiene mas de 700 millones de usuarios mensuales, se requiere licencia comercial de Meta. Ademas, el modelo base tiene su propia licencia que debe respetarse.
- Compatibilidad: al ser un formato de cuantizacion no estandar, puede no ser compatible con frameworks de inferencia optimizados (vLLM, TensorRT-LLM, llama.cpp) sin adaptaciones. El despliegue se limita a transformers o TGI.
- Falta de benchmarks exhaustivos: no se han publicado resultados en tareas de codigo, matematicas o conversacion, por lo que el rendimiento real en esos escenarios es incierto.
- Reproducibilidad: el metodo requiere el codigo del repositorio GitHub para descomprimir los pesos; si el usuario no sigue el procedimiento exacto, el modelo podria no cargar correctamente.

## Enlaces

- HuggingFace: https://huggingface.co/HarimxChoi/WarpQuant-Llama-3-8B-R16E4H4
- Informe tecnico: https://harimxchoi.github.io/projects/warpquant/
- Repositorio GitHub: https://github.com/HarimxChoi/WarpQuant
- Modelo base: https://huggingface.co/NousResearch/Meta-Llama-3-8B
