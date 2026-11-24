# amd/Gemma-4-26B-A4B-it_gpuep_1.0_gpu_128

## Resumen

Gemma-4-26B-A4B-it_gpuep_1.0_gpu_128 es una exportacion cuantizada a ONNX del modelo google/gemma-4-26B-A4B-it, publicada por AMD para su despliegue optimizado sobre hardware AMD Ryzen AI. Se trata de un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) con 26.000 millones de parametros totales y aproximadamente 4.000 millones de parametros activos por token, segun se deduce de la nomenclatura "26B-A4B" del modelo base.

El modelo original lo desarrolla Google; AMD se limita a modificar los ficheros de pesos para producir una version compatible con el runtime onnxruntime-genai. La cuantizacion aplicada es de 4 bits por bloques de tamano 32 sobre los pesos densos, con activaciones en FP16 (esquema FP16W4), y los expertos del MoE se emiten como el operador fusionado `com.microsoft::QMoE`, tambien en 4 bits.

Su relevancia radica en que permite ejecutar un modelo MoE de 26B en entornos de inferencia ONNX sobre CPU y aceleradores integrados, reduciendo el peso del repositorio a 17 GB. La model card indica que esta optimizado para inferencia en CPU, pese a que el identificador del repositorio menciona "gpu_128". La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Experts (MoE), segun tags "moe" y "qmoe" |
| Parametros totales | 26B (segun nomenclatura del modelo base) |
| Parametros activos | 4B aproximadamente (segun nomenclatura "A4B") |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos densos 4-bit block-wise (bloque 32) con activaciones FP16; expertos MoE 4-bit via `com.microsoft::QMoE` (bloque 32) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (modelo base); modificaciones AMD bajo MIT |
| Formato de pesos | ONNX (onnxruntime-genai) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas Mixture-of-Experts, tal como indican los tags `moe` y `qmoe` y la nomenclatura del modelo base (26B totales, 4B activos). La model card no detalla el numero de capas, el numero de expertos por capa ni la estrategia de enrutamiento. Tampoco se especifica la ventana de contexto del modelo original ni la composicion del dataset de entrenamiento.

En cuanto al proceso de cuantizacion, AMD aplica un esquema FP16W4: los pesos densos se cuantizan a 4 bits por bloques de 32 elementos mientras las activaciones permanecen en FP16, y los expertos del MoE se agrupan en el operador fusionado `com.microsoft::QMoE` con el mismo tamano de bloque. Adicionalmente, la cabeza LM (LM head) se poda para conservar unicamente los logits del ultimo token, una optimizacion orientada a reducir coste de memoria y computo en decodificacion. No se documentan fases de RLHF, DPO ni detalles de entrenamiento adicionales en la informacion disponible.

## Capacidades

- Generacion de texto conversacional y continuacion de texto, segun el pipeline `text-generation` y el tag `conversational`.
- Razonamiento y respuesta a instrucciones, derivado del sufijo `-it` (instruction-tuned) del modelo base.
- Ejecucion eficiente de un MoE de gran tamano con solo una fraccion de parametros activos por token.
- Inferencia sobre runtime onnxruntime-genai, lo que facilita el despliegue en entornos ONNX y hardware AMD Ryzen AI.
- Capacidades multilingues limitadas al ingles segun el campo `language` de la model card.
- No se documentan en la informacion disponible capacidades de vision, audio, tool calling, function calling ni modos de razonamiento extendido (thinking).

## Casos de uso

- Asistente conversacional local en equipos con hardware AMD Ryzen AI: el modelo puede gestionar dialogos multi-turno en ingles ejecutandose mediante onnxruntime-genai, aprovechando la cuantizacion a 4 bits para reducir el consumo de memoria frente al modelo original en FP16.
- Generacion de texto en aplicaciones de escritorio sin conexion: al distribuirse como ONNX de 17 GB, puede integrarse en aplicaciones de escritorio que requieran inferencia local de un modelo de 26B sin depender de servicios en la nube.
- Prototipado de pipelines ONNX: sirve como referencia para validar flujos de inferencia con operadores fusionados como `com.microsoft::QMoE` antes de pasar a produccion.
- Evaluacion de hardware Ryzen AI: util como carga de trabajo representativa de un MoE de 26B para medir throughput y latencia en plataformas AMD.
- Despliegue de bajo coste por token: gracias a los 4B de parametros activos, es adecuado para escenarios donde el coste computacional por token es critico y el idioma de trabajo es el ingles.
- Investigacion sobre cuantizacion de MoE: permite estudiar el impacto del esquema FP16W4 con bloque 32 y del operador QMoE en la calidad de salida frente al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el repositorio pesa 17 GB, por lo que se requiere al menos esa cantidad de memoria disponible para cargar los pesos; el consumo adicional depende del contexto y de las activaciones en FP16.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; la model card indica que la exportacion esta optimizada para inferencia en CPU sobre hardware AMD Ryzen AI.
- Opciones de despliegue: onnxruntime-genai (libreria declarada); otras opciones como vLLM, llama.cpp, Ollama o TGI no estan documentadas para este artefacto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma-4-26B-A4B-it_gpuep_1.0_gpu_128 (AMD, ONNX) | 26B | ~4B | no disponible | Apache 2.0 | ONNX (onnxruntime-genai) |
| google/gemma-4-26B-A4B-it (modelo base) | 26B | ~4B | no disponible | Apache 2.0 | no disponible en la informacion |
| Otras alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos alternativos en la informacion proporcionada para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- El modelo solo declara soporte de ingles (`language: en`), lo que limita su uso en castellano u otros idiomas.
- La cuantizacion a 4 bits puede degradar la calidad respecto al modelo base en FP16; no se aportan metricas de dicha degradacion.
- La cabeza LM esta podada para conservar solo los logits del ultimo token, lo que puede restringir usos que requieran la distribucion completa de logits.
- La model card indica optimizacion para CPU, mientras que el identificador del repositorio menciona "gpu_128"; la plataforma objetivo exacta no queda clara en la documentacion.
- No se documentan sesgos conocidos ni tasas de alucinacion; al ser un modelo de lenguaje generativo, persiste el riesgo habitual de alucinacion.
- El campo `inference: false` en los metadatos de la model card puede indicar que no esta pensado para inferencia directa en la plataforma de Hugging Face.
- La licencia del modelo base es Apache 2.0, mientras que las modificaciones de AMD se declaran bajo MIT; conviene revisar ambas condiciones antes de un uso comercial.
- El modelo esta pensado para hardware AMD Ryzen AI; su ejecucion en otras plataformas no esta garantizada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/amd/Gemma-4-26B-A4B-it_gpuep_1.0_gpu_128
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Licencia Apache 2.0: http://www.apache.org/licenses/LICENSE-2.0
