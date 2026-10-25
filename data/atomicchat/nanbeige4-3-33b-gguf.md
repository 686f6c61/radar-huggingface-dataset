# AtomicChat/Nanbeige4.3-33B-GGUF

## Resumen

AtomicChat/Nanbeige4.3-33B-GGUF no es un modelo nuevo, sino el conjunto de cuantizaciones GGUF publicadas por AtomicChat (el equipo detrás de Atomic Chat) sobre los pesos BF16 originales de Nanbeige/Nanbeige4.3-33B, un modelo denso de 33,1 mil millones de parámetros de la familia Llama, con 512K tokens de contexto y modo *thinking* activado por defecto. La publicación se hizo el mismo día del lanzamiento del modelo base, el 25 de octubre, y se distribuye bajo licencia Apache 2.0.

El interés de este repositorio está en la capa de cuantización, no en el modelo: incluye los presets estándar de llama.cpp (Q8_0, Q6_K, Q5_K_M, Q4_K_M) junto a los archivos propios "Atomic Dynamic" (AD), construidos con una importance matrix recogida sobre los pesos BF16 a partir de 8.000 fragmentos de 512 tokens de un corpus de calibración. Cada archivo se midió contra el original BF16 en un mismo banco de pruebas (texto multilingüe neutro, 24 fragmentos de 4.096 tokens, llama.cpp `36e36e6`), publicando divergencia KL y coincidencia top-1.

El dato relevante para quien vaya a desplegarlo es que el modelo base es inusualmente sensible a la cuantización: los presets planos de llama.cpp pierden bastante fidelidad a 6 y 4 bits, mientras que los archivos AD recuperan buena parte de esa pérdida al mismo tamaño en disco. Para inferencia local en hardware de consumo, AD-IQ4_XS (20,3 GB) o AD-Q4_K_M (21,2 GB) son los puntos de entrada razonables; por debajo de 4 bits la degradación es notable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso, familia Llama (según la model card del cuantizador) |
| Parámetros totales | 33.118.977.024 (33,1 B), dato real de safetensors |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 524.288 tokens (512K) |
| Tipos de cuantización | Presets llama.cpp: Q8_0, Q6_K, Q5_K_M, Q4_K_M. Atomic Dynamic (imatrix propia): AD-Q6_K, AD-Q6_K-Q5_K, AD-Q5_K_M, AD-Q5_K_M-Q4_K_M, AD-Q4_K_M, AD-IQ4_XS, AD-IQ3_S, AD-IQ3_XXS, AD-IQ2_S |
| Idiomas soportados | Inglés (en) y chino (zh), según los tags del repositorio |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); los pesos originales en BF16 están en el repositorio del modelo base |
| Desarrollador del modelo base | Nanbeige |
| Cuantizador | AtomicChat |
| Formato de chat | ChatML (compartido con Qwen3.8-27B, según la model card) |
| Modo thinking | Activado por defecto |
| Tamaño del repositorio | 298,5 GB (incluye todos los archivos GGUF) |
| Fecha de publicación | 25 de octubre (creado el 2026-10-25) |
| Descargas / likes en el momento del snapshot | 0 descargas, 5 likes |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 33,1 B parámetros con arquitectura de la familia Llama y una ventana de contexto de 512K tokens, orientado a tareas de agente y razonamiento, con modo *thinking* activado por defecto. La información disponible no detalla el número de capas, cabezas de atención, vocabulario ni si emplea técnicas como atención lineal o decodificación especulativa; tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. Esos datos figuran como no disponibles en la documentación consultada.

Lo que sí está documentado con detalle es el proceso de cuantización. Los archivos `AD-` usan una importance matrix propia recogida sobre los pesos BF16 con `--parse-special` sobre 8.000 fragmentos de 512 tokens de un corpus de calibración renderizado para el formato ChatML de Qwen3.8-27B (compartido con Nanbeige4.3). El layout Atomic Dynamic sube un escalón el FFN de la primera y la última capa, mantiene la salida de atención y la cabeza en `q6_k` o superior, y las proyecciones pequeñas de clave y valor en `q8_0`; el resto de la asignación no está disponible porque la model card se corta en ese punto. Los presets Q8_0, Q6_K, Q5_K_M y Q4_K_M se generaron sin importance matrix.

## Capacidades

- Generación de texto conversacional multi-turno, según el tag `conversational`.
- Razonamiento explícito con modo *thinking* activado por defecto; el modelo emite trazas de razonamiento antes de la respuesta final.
- Tareas de agente y razonamiento multi-paso, según los tags `agent` y `reasoning` del repositorio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de código y matemáticas: no documentadas en la información proporcionada.
- Capacidades de visión o audio: no disponibles; el pipeline es `text-generation`.
- Multilingüe limitado a inglés y chino.
- Compatibilidad con endpoints (tag `endpoints_compatible`) para servir el modelo tras un runtime GGUF.
- Ventana de contexto de 512K tokens, adecuada para documentos largos y conversaciones extensas.

## Casos de uso

- **Atención al cliente automatizada en inglés o chino**: el modelo sostiene conversaciones multi-turno con hasta 512K tokens de contexto, de modo que puede arrastrar el historial completo de un cliente y la documentación de producto sin resumir ni truncar.
- **Análisis de documentos largos**: informes anuales, contratos o expedientes de cientos de miles de tokens caben en una sola ventana; el modo *thinking* por defecto ayuda en tareas de extracción y contraste de datos entre secciones.
- **Agentes autónomos de varios pasos**: el tag `agent` y el razonamiento explícito permiten encadenar planificación, ejecución y verificación en pipelines orquestados, siempre que el runtime proporcione el bucle de herramientas (el soporte nativo de function calling no está documentado).
- **Despliegue local en estación de trabajo con GPU de consumo**: con AD-IQ4_XS (20,3 GB) o AD-Q4_K_M (21,2 GB) el modelo cabe en una GPU de 24 GB, lo que habilita asistentes privados sin salida de datos a la nube.
- **Generación de código y revisión en CI/CD**: no hay datos publicados de HumanEval ni de soporte de tool calling, por lo que solo es recomendable tras validación propia contra el repositorio real; el contexto de 512K sí resulta útil para revisar diffs y codebases completos.
- **Investigación sobre cuantización**: el repositorio publica KL divergence y top-1 por archivo junto con la importance matrix, lo que lo convierte en un banco de pruebas útil para estudiar el impacto de distintas estrategias de cuantización en un modelo de 33B.
- **Procesamiento por lotes sin GPU dedicada**: con AD-IQ2_S (13,7 GB) o IQ3_XXS (14,9 GB) se puede ejecutar en CPU con RAM suficiente, aceptando la pérdida de fidelidad documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Lo que sí se publica es la fidelidad de cada cuantización frente a los pesos BF16 originales, medida en un banco común (texto multilingüe neutro, 24 fragmentos de 4.096 tokens, llama.cpp `36e36e6`):

| Archivo | Tamaño en disco | Construcción | KL divergence | top-1 |
|---|---:|---|---:|---:|
| Nanbeige4.3-33B-Q8_0.gguf | 35,2 GB | preset 8 bits | 0,0032 | 98,0 % |
| Nanbeige4.3-33B-AD-Q6_K.gguf | 30,1 GB | Atomic Dynamic, imatrix propia | 0,0052 | 97,5 % |
| Nanbeige4.3-33B-AD-Q6_K-Q5_K.gguf | 27,9 GB | Atomic Dynamic, imatrix propia | 0,0102 | 96,1 % |
| Nanbeige4.3-33B-Q6_K.gguf | 27,2 GB | preset llama.cpp, sin imatrix | 0,0165 | 95,5 % |
| Nanbeige4.3-33B-AD-Q5_K_M.gguf | 24,7 GB | Atomic Dynamic, imatrix propia | 0,0213 | 94,7 % |
| Nanbeige4.3-33B-Q5_K_M.gguf | 23,5 GB | preset llama.cpp, sin imatrix | 0,0304 | 93,4 % |
| Nanbeige4.3-33B-AD-Q5_K_M-Q4_K_M.gguf | 22,6 GB | Atomic Dynamic, imatrix propia | 0,0332 | 93,1 % |
| Nanbeige4.3-33B-AD-Q4_K_M.gguf | 21,2 GB | Atomic Dynamic, imatrix propia | 0,0380 | 92,6 % |
| Nanbeige4.3-33B-AD-IQ4_XS.gguf | 20,3 GB | Atomic Dynamic, imatrix propia | 0,0462 | 92,0 % |
| Nanbeige4.3-33B-Q4_K_M.gguf | 20,1 GB | preset llama.cpp, sin imatrix | 0,0693 | 89,9 % |
| Nanbeige4.3-33B-AD-IQ3_S.gguf | 17,1 GB | Atomic Dynamic, imatrix propia | 0,1019 | 87,5 % |
| Nanbeige4.3-33B-AD-IQ3_XXS.gguf | 14,9 GB | Atomic Dynamic, imatrix propia | 0,1593 | 84,6 % |
| Nanbeige4.3-33B-AD-IQ2_S.gguf | 13,7 GB | Atomic Dynamic, imatrix propia | 0,2448 | 80,5 % |

Lectura de los datos: AD-IQ4_XS (20,3 GB) reduce la KL un tercio respecto a Q4_K_M (20,1 GB) a igualdad de tamaño en disco; AD-Q6_K-Q5_K (27,9 GB) la reduce un 39 % respecto a Q6_K (27,2 GB); y AD-Q6_K (30,1 GB) queda prácticamente a la altura de Q8_0 (97,5 % frente a 98,0 % de top-1). Por debajo de 4 bits el top-1 cae por debajo del 85 % y la model card desaconseja esos archivos salvo que no quepa nada mayor.

## Requisitos de hardware

- **VRAM estimada**: como referencia de pesos, entre 13,7 GB (AD-IQ2_S) y 35,2 GB (Q8_0). Hay que sumar la caché KV del contexto: el modelo soporta 512K tokens, pero el tamaño de la caché por token no está disponible en la información (depende del número de capas y cabezas, no documentado), así que a contextos largos el consumo real puede superar ampliamente el tamaño del archivo.
- **GPU recomendadas por cuantización**: Q8_0 (35,2 GB) requiere A100 40/80 GB, H100 o RTX 6000 Ada 48 GB. AD-Q6_K (30,1 GB) cabe en A100 40 GB. AD-Q4_K_M y AD-IQ4_XS (20-21 GB) caben en RTX 4090, RTX 3090 o L40S de 24 GB con contexto moderado.
- **GPU de consumo**: sí es viable. AD-IQ3_XXS (14,9 GB) e IQ2_S (13,7 GB) entran en GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16 GB, RTX 4070 Ti Super). Para 24 GB, AD-IQ4_XS es la opción con mejor relación fidelidad/tamaño.
- **CPU y RAM**: los archivos de 13-21 GB se pueden ejecutar con llama.cpp en CPU si se dispone de RAM suficiente (al menos el tamaño del archivo más la caché KV); el rendimiento será de pocos tokens por segundo.
- **Opciones de despliegue**: llama.cpp (los archivos se construyeron y midieron con la build `36e36e6`), Ollama, LM Studio, llama-cpp-python, KoboldCpp o text-generation-webui. Al ser GGUF, no es un formato nativo de vLLM o TGI; para servir en producción con esas herramientas habría que partir de los pesos BF16 del modelo base.
- **Latencia y throughput**: no se han publicado mediciones de tokens por segundo en la información disponible.

## Comparativa con modelos similares

No se dispone de datos de otros modelos comparables en la información proporcionada, por lo que no se puede construir una comparativa con alternativas externas sin inventar cifras. La comparación rigurosa que sí permiten los datos publicados es interna, entre las distintas cuantizaciones del mismo modelo base:

| Pareja comparada | Tamaño | KL divergence | Diferencia |
|---|---|---:|---|
| Q4_K_M (preset plano) | 20,1 GB | 0,0693 | Referencia |
| AD-IQ4_XS (imatrix propia) | 20,3 GB | 0,0462 | ~33 % menos KL a igual tamaño |
| Q6_K (preset plano) | 27,2 GB | 0,0165 | Referencia |
| AD-Q6_K-Q5_K (imatrix propia) | 27,9 GB | 0,0102 | ~39 % menos KL a igual tamaño |
| Q8_0 (preset plano) | 35,2 GB | 0,0032 | Techo de fidelidad, tope de tamaño |

Frente al modelo base BF16 (33,1 B, 512K de contexto, Apache 2.0), estos archivos conservan parámetros, contexto y licencia, y solo cambian el formato y la fidelidad numérica.

## Limitaciones y advertencias

- **Sensibilidad alta a la cuantización**: es la advertencia principal del autor. Los presets planos de llama.cpp rinden por debajo de lo habitual en modelos de este tamaño (95,5 % de top-1 en Q6_K, cuando la model card indica que la mayoría de modelos alcanza el 98 % a 6 bits; 89,9 % en Q4_K_M).
- **Archivos por debajo de 4 bits**: AD-IQ3_XXS y AD-IQ2_S bajan del 85 % de top-1 y la KL se dispara (0,1593 y 0,2448). Solo tienen sentido si no cabe ningún archivo mayor.
- **Idiomas**: únicamente inglés y chino están declarados. El rendimiento en castellano no está documentado ni validado, y no debería asumirse.
- **Riesgo de alucinación**: no se han publicado evaluaciones de veracidad ni de tasas de alucinación para este modelo; al ser un modelo de razonamiento con *thinking* por defecto, conviene validar las salidas en dominios sensibles.
- **Sesgos**: no hay información sobre composición del dataset de entrenamiento ni sobre evaluaciones de sesgo, por lo que no se pueden caracterizar los sesgos conocidos.
- **Modo thinking por defecto**: incrementa el número de tokens generados y, por tanto, la latencia y el coste por consulta; muchos runtimes permiten desactivarlo, pero el comportamiento por defecto es emitir razonamiento.
- **Contexto de 512K**: la ventana es amplia, pero la caché KV a contextos muy largos puede consumir más VRAM que los propios pesos; el coste real por token de contexto no está documentado.
- **Licencia**: Apache 2.0 permite uso comercial y modificaciones, con obligación de conservar el aviso de licencia y el archivo NOTICE si existe; conviene revisar también la licencia del modelo base, que es la misma según los tags.
- **Madurez del repositorio**: 0 descargas y 5 likes en el momento del snapshot, publicado el mismo día del lanzamiento del modelo base; no hay aún validación comunitaria extensa.
- **Tool calling y capacidades de código**: los tags sugieren uso agéntico, pero no hay documentación de function calling ni benchmarks de código; no lo des por soportado sin probarlo.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/AtomicChat/Nanbeige4.3-33B-GGUF
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Repositorio de métricas (logs en crudo e importance matrix): https://huggingface.co/datasets/AtomicChat/Nanbeige4.3-33B-GGUF-metrics
- Atomic Chat: https://atomic.chat/?utm_source=huggingface&utm_medium=referral&utm_campaign=hf_nanbeige4_3_33b&utm_content=btn_atomic
- Discord de Atomic Chat: https://discord.gg/8wGSsvmg4V
- Repositorio GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
