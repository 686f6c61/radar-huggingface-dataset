# mradermacher/Qwen3-14B-heretic-tools-GGUF

## Resumen

El modelo `mradermacher/Qwen3-14B-heretic-tools-GGUF` es una cuantización en formato GGUF del modelo `avi686/Qwen3-14B-heretic-tools`, una variante del modelo Qwen3-14B de Alibaba a la que se ha aplicado la herramienta **Heretic** para eliminar automáticamente la censura y las restricciones de contenido. El autor de la cuantización, mradermacher, publica pesos estáticos en once niveles de cuantización (desde Q2_K hasta Q8_0) para facilitar la ejecución local en hardware variado.

Este modelo resulta relevante para desarrolladores e investigadores que necesitan un LLM de 14 000 millones de parámetros sin filtros de seguridad, ya sea para experimentación, análisis de comportamientos de modelos "descensurados" o aplicaciones donde se requiere una adherencia estricta a las instrucciones del usuario sin rechazos automáticos. Al estar en formato GGUF, puede ejecutarse con llama.cpp, Ollama u otros motores compatibles en GPU de consumo o incluso en CPU.

La arquitectura subyacente es la de Qwen3-14B, un transformer denso con 14 768 307 200 parámetros, aunque no se dispone de información pública sobre la longitud de contexto, el proceso de entrenamiento o los datos utilizados para la modificación "heretic". La cuantización es estática, realizada por mradermacher, y no se han publicado resultados de benchmarks para esta variante específica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3-14B) |
| Parametros totales | 14 768 307 200 |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base `avi686/Qwen3-14B-heretic-tools` es una adaptación de Qwen3-14B, un transformer denso de 14 000 millones de parámetros desarrollado por Alibaba. La modificación "heretic" se realiza mediante la herramienta de código abierto [Heretic](https://github.com/p-e-w/heretic), que elimina automáticamente los mecanismos de censura y rechazo de respuestas en modelos de lenguaje. Heretic opera sobre los pesos del modelo sin requerir reentrenamiento, modificando selectivamente las capas responsables de los comportamientos de rechazo.

No se dispone de información pública sobre el proceso de entrenamiento del modelo base, el número de tokens utilizados, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. La cuantización realizada por mradermacher es estática, es decir, se aplica directamente sobre los pesos del modelo sin usar matrices de importancia (imatrix), y se ofrecen once niveles de cuantización que equilibran tamaño y calidad.

## Capacidades

- Generacion de texto y conversacion en ingles, heredadas de Qwen3-14B.
- Razonamiento logico, comprension lectora y matematicas basicas (capacidades generales de Qwen3).
- Generacion de codigo y soporte de instrucciones complejas (capacidades generales de Qwen3).
- Respuestas sin censura: el modelo no rechaza peticiones que el modelo original rechazaria, gracias a la modificacion Heretic.
- No se ha confirmado soporte de tool calling, function calling, agentes o modo thinking en esta variante especifica.
- Capacidades multilingues limitadas al ingles, segun la etiqueta de idioma del repositorio.

## Casos de uso

- **Investigacion sobre alineacion y censura**: el modelo permite estudiar como se comporta un LLM de 14B cuando se eliminan los mecanismos de rechazo, comparando respuestas con el modelo original.
- **Desarrollo de aplicaciones sin restricciones de contenido**: para prototipos donde se necesita que el modelo siga instrucciones sin filtros, como generacion de ficcion adulta o roleplay sin limites.
- **Ejecucion local en hardware de consumo**: gracias a las cuantizaciones Q4_K_M o Q5_K_M (9-10 GB), puede ejecutarse en una GPU con 12-16 GB de VRAM, como una RTX 3060 o RTX 4070.
- **Pruebas de robustez y jailbreak**: los investigadores de seguridad pueden usar este modelo para evaluar tecnicas de jailbreak y comparar la eficacia de los filtros de seguridad en modelos comerciales.
- **Generacion de contenido creativo sin restricciones**: escritura de guiones, dialogos o narrativas que requieran vocabulario explicito o temas tabu.
- **Analisis de sesgos en modelos descensurados**: estudiar como la eliminacion de censura afecta a la calidad, coherencia y sesgos de las respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor de la cuantizacion no incluye metricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) en la model card, y no se han encontrado evaluaciones independientes de esta variante especifica.

## Requisitos de hardware

- **VRAM estimada para inferencia**: desde 5,9 GB (cuantizacion Q2_K) hasta 15,8 GB (Q8_0). Las cuantizaciones recomendadas por el autor (Q4_K_M y Q4_K_S) ocupan entre 8,7 y 9,1 GB.
- **GPU recomendadas**: para las cuantizaciones mas pequeñas (Q2_K, Q3_K), una GPU con 8 GB de VRAM (RTX 3060, RTX 4060) es suficiente. Para Q4_K_M o Q5_K_M, se recomienda 12-16 GB (RTX 4070, RTX 4080, RTX 3090). Para Q8_0, se necesita 16-24 GB (RTX 4090, A5000).
- **Compatibilidad con consumer GPU**: si, las cuantizaciones Q2_K a Q5_K_M caben en GPUs de consumo con 8-16 GB de VRAM.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier motor compatible con GGUF. Tambien puede ejecutarse en CPU con suficiente RAM (las cuantizaciones mas pequeñas requieren menos de 8 GB de RAM).
- **Latencia y throughput**: no se han publicado datos especificos. Como referencia, un modelo de 14B en Q4_K_M en una RTX 4090 suele generar entre 30 y 60 tokens por segundo con llama.cpp.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-14B (original) | 14,7B | No disponible | Apache 2.0 (segun Qwen) | safetensors, GGUF | Modelo base con censura estandar |
| Qwen3-14B-heretic-tools (este) | 14,7B | No disponible | No disponible | GGUF | Variante descensurada con Heretic |
| Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 | safetensors, GGUF | Alternativa mas pequeña, con censura |
| Mistral-7B-Instruct | 7B | 32K | Apache 2.0 | safetensors, GGUF | Alternativa mas pequeña, con censura |

No se dispone de datos de rendimiento comparativo entre estas opciones para esta variante especifica.

## Limitaciones y advertencias

- **Licencia no especificada**: el repositorio no indica la licencia del modelo base ni de la cuantizacion. Esto puede impedir su uso comercial sin autorizacion explicita de los autores.
- **Riesgo de contenido inapropiado**: al eliminar la censura, el modelo puede generar contenido ofensivo, ilegal o peligroso. No debe usarse en aplicaciones publicas sin supervision humana.
- **Sesgos no mitigados**: la eliminacion de censura no corrige sesgos subyacentes del modelo; puede amplificar estereotipos o generar respuestas discriminatorias.
- **Alucinaciones**: como cualquier LLM, puede inventar informacion, especialmente en temas especializados. La ausencia de filtros no mejora la veracidad.
- **Idioma limitado**: solo se ha confirmado soporte para ingles. El rendimiento en otros idiomas puede ser deficiente.
- **Sin garantias de calidad**: la cuantizacion es estatica y no se han publicado evaluaciones de perplejidad o calidad respecto al modelo original.
- **Riesgo de uso indebido**: la naturaleza "descensurada" del modelo lo hace inadecuado para entornos de produccion donde se requiera cumplimiento normativo o politicas de seguridad.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/mradermacher/Qwen3-14B-heretic-tools-GGUF)
- [Modelo base avi686/Qwen3-14B-heretic-tools](https://huggingface.co/avi686/Qwen3-14B-heretic-tools)
- [Repositorio de Heretic](https://github.com/p-e-w/heretic)
- [Sitio web de Heretic](https://heretic-project.org/)
- [Repositorio oficial de Qwen3](https://github.com/QwenLM/Qwen3)
- [Perfil de mradermacher en HuggingFace](https://huggingface.co/mradermacher)
