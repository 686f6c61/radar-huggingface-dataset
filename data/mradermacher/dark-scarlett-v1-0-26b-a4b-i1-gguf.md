# mradermacher/Dark-Scarlett-v1.0-26B-A4B-i1-GGUF

## Resumen

Dark-Scarlett-v1.0-26B-A4B es un modelo de lenguaje de arquitectura Mixture of Experts (MoE) desarrollado por ReadyArt, del cual esta ficha cubre la variante cuantizada en formato GGUF preparada por mradermacher. El nombre del modelo indica una arquitectura con 26.000 millones de parámetros totales y aproximadamente 4.000 millones de parámetros activos por token, lo que lo sitúa en una categoría de modelos eficientes para inferencia local en hardware de consumo. La cuantización GGUF permite ejecutarlo en CPU y GPU con requisitos de memoria reducidos, y se distribuye en múltiples niveles de cuantización (Q2_K, Q4_K_M, Q6_K, entre otros).

El repositorio original de ReadyArt contiene los pesos en formato safetensors, mientras que esta variante de mradermacher añade pesos cuantizados con imatrix para optimizar la calidad de la cuantización. La ficha cubre exclusivamente la variante GGUF, que es la que permite despliegue local mediante herramientas como llama.cpp u Ollama. La información disponible es limitada: no se han publicado detalles sobre el entrenamiento, la licencia o los benchmarks del modelo, por lo que esta ficha se basa en los datos accesibles del repositorio y en convenciones del ecosistema de modelos abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), tipo no especificado |
| Parametros totales | 26.000 millones (indicado por el nombre) |
| Parametros activos | 4.000 millones (indicado por el nombre "A4B") |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (con cuantizacion imatrix) |

## Arquitectura y entrenamiento

La arquitectura es de tipo Mixture of Experts (MoE) con 26.000 millones de parámetros totales y solo 4.000 millones activos por token. Este diseño reduce el coste computacional por inferencia comparado con un modelo denso de tamaño equivalente, al activar solo una fracción de los expertos en cada paso. No se dispone de información sobre el tipo concreto de MoE (número de expertos, top-k, rutas), ni sobre el dataset de entrenamiento, el número de tokens procesados o si se aplicaron técnicas de RLHF o DPO. La variante GGUF aquí descrita es una cuantización del modelo original de ReadyArt, realizada por mradermacher con pesos imatrix para mejorar la calidad de la cuantización.

## Capacidades

- Generación de texto y conversación: el modelo es capaz de generar texto coherente en tareas de lenguaje natural, aunque no hay datos oficiales sobre su rendimiento en tareas específicas.
- Razonamiento y codigo: no hay información verificada sobre capacidades de razonamiento matemático, lógico o generación de código. No se puede confirmar sin benchmarks.
- Soporte de tool calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no se han publicado idiomas soportados. Dado el nombre y el ecosistema, es probable que el entrenamiento se haya realizado con datos en ingles, pero no hay confirmacion.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- **Inferencia local en hardware modesto**: gracias a la arquitectura MoE con solo 4.000 millones de parametros activos y a las cuantizaciones GGUF, el modelo puede ejecutarse en equipos con 24 GB de RAM o VRAM, usando herramientas como Ollama o llama.cpp. Es adecuado para desarrolladores que quieren un modelo de 26B sin necesitar una GPU profesional.
- **Despliegue en entornos con recursos limitados**: la variante GGUF permite ejecutar el modelo en CPU o GPU de gama media, lo que lo hace util para prototipos, demos o aplicaciones edge donde no hay acceso a infraestructura en la nube.
- **Evaluacion de modelos cuantizados**: el repositorio incluye multiples niveles de cuantizacion (desde Q2_K hasta Q6_K), lo que permite a investigadores comparar el impacto de la cuantizacion en la calidad de las respuestas y elegir el punto optimo entre tamaño y fidelidad.
- **Experimentos con arquitecturas MoE**: el modelo es un ejemplo de arquitectura MoE de 26B totales con 4B activos, util para estudiar el rendimiento de este tipo de diseños en tareas de lenguaje sin necesidad de entrenar desde cero.
- **Asistentes de chat locales**: el modelo puede integrarse en aplicaciones de chat privadas o de empresa que requieran mantener los datos en local, evitando el envio de informacion a servicios externos.
- **Generacion de contenido creativo**: como modelo de lenguaje general, puede utilizarse para redactar textos, resumir documentos o generar borradores, aunque las capacidades exactas no estan documentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de HuggingFace no incluye datos de evaluacion (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. Se recomienda realizar pruebas propias para evaluar el rendimiento en las tareas de interes.

## Requisitos de hardware

- **VRAM estimada para inferencia**: dado que el modelo es de 26B totales con 4B activos, la VRAM necesaria depende de la cuantizacion. Para cuantizaciones Q4_K_M, se estima que se necesitan entre 16GB y 24GB de VRAM. Para cuantizaciones mas bajas (Q2_K), podria caber en 12GB-16GB, pero con mayor perdida de calidad.
- **GPU recomendadas**: NVIDIA RTX 4090 (24GB), RTX 3090 (24GB), A100 (40GB o 80GB), H100 (80GB). En CPU, es viable con al menos 32GB de RAM, aunque la velocidad sera baja.
- **Cabe en GPU de consumo**: si, en tarjetas con 24GB de VRAM se puede ejecutar la mayoria de las cuantizaciones. En tarjetas de 16GB (como RTX 4080 o RTX 4060 Ti) solo cabrian las cuantizaciones mas bajas (Q2_K, IQ3_M) con perdida de calidad.
- **Opciones de despliegue**: llama.cpp, Ollama (se menciona que se puede usar `ollama pull dark-scarlett-v0.3-26b-a4b:26b`), vLLM, TGI, y cualquier runtime que soporte GGUF.
- **Latencia y throughput**: no se ha publicado datos de latencia. En una GPU RTX 4090, un modelo MoE de 4B activos deberia generar tokens a una velocidad de 20-50 tokens/s, dependiendo de la cuantizacion y el tamaño de contexto.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa. El modelo se posiciona en la categoria de MoE de 26B totales con 4B activos, similar a otros modelos como:

- **Mixtral-8x7B**: 47B totales, 13B activos, contexto 32K, licencia Apache 2.0. Comparado con Dark-Scarlett, Mixtral tiene mas parametros activos y un contexto mayor, pero tambien requiere mas VRAM (alrededor de 32GB en Q4_K_M).
- **Qwen-2.5-14B-A3B**: 14B totales con 3B activos, contexto 128K, licencia Apache 2.0. Es un modelo mas pequeño pero con contexto mucho mayor y mejor soporte multilingue.
- **DeepSeek-V2-Lite**: 16B totales con 2.4B activos, contexto 128K, licencia MIT. Similar en filosofia MoE pero con menos parametros activos.

No se puede confirmar el rendimiento relativo de Dark-Scarlett frente a estas alternativas sin benchmarks publicados.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: no hay informacion sobre el dataset de entrenamiento ni sobre sesgos especificos. Como modelo de lenguaje generico, es probable que presente alucinaciones y sesgos similares a otros modelos de su tamano, pero no hay datos verificados.
- **Riesgo de alucinacion**: alto en tareas de hechos concretos, especialmente en cuantizaciones bajas donde la perdida de fidelidad es mayor.
- **Limitaciones de contexto**: no se conoce la longitud de contexto soportada. Si es inferior a 32K, podria ser insuficiente para tareas de analisis de documentos largos o conversaciones multi-turno extensas.
- **Restricciones de licencia**: la licencia no esta especificada en el repositorio. Esto es un riesgo critico para uso comercial. No se puede asumir una licencia abierta sin confirmacion del autor.
- **Caveat para produccion**: el modelo no tiene documentacion de evaluacion, y la falta de datos de entrenamiento y licencia impide recomendarlo para entornos de produccion sin una auditoria previa.
- **Idiomas**: no se ha publicado que idiomas soporta. Si el entrenamiento fue en ingles, la calidad en espanol u otros idiomas puede ser limitada.
- **Cuantizacion**: las cuantizaciones mas bajas (Q2_K, IQ1_M) degradan significativamente la calidad del texto. Se recomienda usar Q4_K_M o superior para tareas de razonamiento.

## Enlaces

- Repositorio GGUF de mradermacher: https://huggingface.co/mradermacher/Dark-Scarlett-v1.0-26B-A4B-i1-GGUF
- Modelo original de ReadyArt: https://huggingface.co/ReadyArt/Dark-Scarlett-v1.0-26B-A4B
- Variante v0.3 en GGUF: https://huggingface.co/ReadyArt/Dark-Scarlett-v0.3-26B-A4B-GGUF
- Articulo en Ok Tech Masters sobre la variante GGUF: https://oktechmasters.org/ai_models/dark-scarlett-v0-3-26b-a4b-gguf/
- Perfil de mradermacher en Hugging Face: https://www.aimodels.fyi/creators/huggingFace/mradermacher
