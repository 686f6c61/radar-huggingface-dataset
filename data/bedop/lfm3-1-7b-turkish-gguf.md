# bedop/LFM3-1.7B-Turkish-GGUF

## Resumen

LFM3-1.7B-Turkish-GGUF es una distribucion en formato GGUF de un ajuste fino del modelo LiquidAI/LFM3-1.7B, realizado por el usuario bedop. El ajuste consiste en un entrenamiento continuado por adaptacion de bajo rango (LoRA CPT) sobre 33.584 filas de texto en turco, con el objetivo de mejorar la competencia del modelo base en ese idioma. El resultado principal reportado por el autor es una reduccion de la perplejidad en turco de retencion de 26,17 a 8,28, lo que supone una mejora de aproximadamente 3,1 veces.

El modelo conserva la arquitectura del LFM3 de LiquidAI con 1.728.801.600 parametros totales y se distribuye exclusivamente en cuantizaciones GGUF para su uso con llama.cpp y Ollama. El repositorio incluye dos ficheros: una cuantizacion Q4_K_M de aproximadamente 1,0 GB, orientada a inferencia local, y una version F16 de aproximadamente 3,2 GB.

Su relevancia es acotada pero concreta: ofrece una via sencilla de ejecutar un modelo pequeno con competencia en turco en hardware de consumo, algo poco habitual en modelos de este tamano. El modelo es de tipo causal-LM para generacion de texto y no se han publicado resultados de benchmarks estandar en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal-LM (hereda la del LiquidAI/LFM3-1.7B; detalles internos no disponibles) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible en la model card; el ejemplo de llama.cpp usa `-c 1024` |
| Tipos de cuantizacion | Q4_K_M y F16 |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | other (LFM Open, LFM1.0, segun la model card) |
| Formato de pesos | GGUF (safetensors en el modelo fuente `bedop/LFM3-1.7B-Turkish`) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B, un transformer causal de 1,73 mil millones de parametros. Sobre esa base se aplico un ajuste fino por LoRA en modalidad de entrenamiento continuado (CPT) con 33.584 filas de datos en turco. No se detalla en la informacion disponible la composicion exacta del corpus, la longitud de las secuencias de entrenamiento, el numero de tokens procesados ni la configuracion del LoRA (rango, alpha, tasa de aprendizaje).

El autor reporta como metrica principal la perplejidad sobre un conjunto de retencion en turco, que paso de 26,17 en el modelo base a 8,28 tras el ajuste. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion adicionales, ni innovaciones arquitectonicas propias: el aporte es el ajuste linguistico y el empaquetado en GGUF. Los pesos se publican en el repositorio fuente `bedop/LFM3-1.7B-Turkish` junto con el LoRA y el runtime de LFM3.

## Capacidades

- Generacion de texto en turco con fluidez gramatical, segun la verificacion del autor, que contrasta con los bucles degenerados del modelo base sin ajustar.
- Generacion de texto en ingles, al conservar el idioma original del modelo base.
- Modelo causal-LM estandar para completion y generacion condicionada por prompt.
- Ejecucion local mediante llama.cpp y Ollama, con cuantizacion Q4_K_M.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento.

## Casos de uso

- Generacion de texto en turco en local: el modelo permite redactar parrafos, resumenes o respuestas en turco en un portatil sin GPU dedicada, gracias a la cuantizacion Q4_K_M de aproximadamente 1,0 GB.
- Prototipado de asistentes conversacionales en turco: util para validar flujos de chat multi-turno antes de invertir en modelos mayores, usando Ollama como servidor local.
- Traduccion asistida ingles-turco: al soportar ambos idiomas, puede emplearse para borradores de traduccion o para reformular texto entre las dos lenguas, con revision humana posterior.
- Generacion de contenido editorial en turco: redaccion de descripciones, fichas o parrafos divulgativos donde el coste de inferencia local es un requisito.
- Educacion y practica de idiomas: generacion de ejemplos de frases y ejercicios en turco en entornos sin conexion.
- Experimentacion e investigacion: punto de partida reproducible para estudiar el efecto del CPT con LoRA en modelos pequenos, comparando la perplejidad antes y despues del ajuste.
- Integracion en aplicaciones de escritorio o embebidas: el tamano reducido del GGUF Q4_K_M facilita su inclusion en herramientas locales con llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento reportado es la perplejidad sobre un conjunto de retencion en turco:

| Metrica | Modelo base | Modelo ajustado |
|---|---|---|
| Perplejidad en turco (retencion) | 26,17 | 8,28 |

## Requisitos de hardware

- VRAM estimada para Q4_K_M: en torno a 1,0-1,3 GB de memoria para los pesos, mas el espacio de contexto y el overhead del runtime.
- VRAM estimada para F16: en torno a 3,2-3,6 GB para los pesos.
- Cabe en GPU de consumo: si, en tarjetas con 4 GB o mas para Q4_K_M y con 6 GB o mas para F16 (estimacion a partir del tamano de los ficheros, no confirmada por el autor).
- GPU recomendadas: cualquier GPU consumer moderna con suficiente VRAM; tambien es viable en CPU.
- Opciones de despliegue: llama.cpp (llama-cli) y Ollama, segun la model card. Otros runtimes compatibles con GGUF no se mencionan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-1.7B-Turkish-GGUF | 1,73 B | no disponible | tr, en | LFM Open (other) | GGUF |
| LiquidAI/LFM3-1.7B (base) | 1,73 B | no disponible | en (principal) | LFM Open | safetensors |
| Modelos turcos de ~1-2 B | no disponible | no disponible | tr | no disponible | no disponible |

La comparacion con alternativas especificas de tamano y especializacion similares no esta disponible en la informacion proporcionada. El referente directo es el modelo base LiquidAI/LFM3-1.7B, del que este se diferencia por el ajuste en turco y el empaquetado GGUF.

## Limitaciones y advertencias

- El ajuste se realizo con un corpus relativamente pequeno (33.584 filas); la cobertura linguistica y tematica puede ser limitada.
- Riesgo de alucinacion inherente a un modelo de 1,7 B sin alineacion documentada.
- No se documentan evaluaciones de sesgo, toxicidad ni seguridad.
- La longitud de contexto no se especifica en la model card; el ejemplo de uso fija 1.024 tokens, lo que sugiere un contexto efectivo modesto.
- La licencia es "other" (LFM Open, LFM1.0): es necesario revisar los terminos del modelo base LiquidAI/LFM3-1.7B antes de cualquier uso comercial.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad.
- El modelo esta pensado para generacion de texto; no debe asumirse soporte de tool calling ni de agentes.
- La calidad en ingles puede haberse degradado tras el ajuste en turco, algo no evaluado por el autor.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bedop/LFM3-1.7B-Turkish-GGUF
- Modelo fuente ajustado: https://huggingface.co/bedop/LFM3-1.7B-Turkish
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
