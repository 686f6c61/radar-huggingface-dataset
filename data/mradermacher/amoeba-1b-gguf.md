# mradermacher/Amoeba-1B-GGUF

## Resumen

Amoeba-1B es un modelo de lenguaje de aproximadamente 1.080 millones de parámetros (1,08 B), desarrollado originalmente por el usuario leexamp y distribuido en formato GGUF por mradermacher. Se presenta como un modelo pequeño orientado a tareas de generación de texto en inglés, con etiquetas que lo asocian a decodificación especulativa (speculative decoding) y a la categoría de small language models. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de esta ficha radica en que el repositorio es una cuantización estática del modelo base leexamp/Amoeba-1B, no un modelo nuevo. mradermacher ofrece un conjunto de cuantizaciones GGUF (desde Q2_K hasta f16) pensadas para ejecución local con llama.cpp y herramientas compatibles. El tamaño reducido del modelo lo hace adecuado para entornos con recursos limitados, prototipado rápido y como modelo auxiliar en pipelines de decodificación especulativa.

No se dispone de información publicada sobre arquitectura interna, longitud de contexto, datos de entrenamiento ni resultados de benchmarks en la información proporcionada. La model card del repositorio se limita a listar las cuantizaciones disponibles y a remitir a la documentación del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, segun la libreria transformers) |
| Parametros totales | 1.080.632.832 (1,08 B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo en la documentación disponible. La librería declarada es transformers y el tamaño de parámetros (1,08 B) es coherente con un transformer denso de pequeña escala, pero no se confirma si emplea atención estándar, atención lineal u otra variante. Tampoco se detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF, DPO o ajuste por instrucciones.

La etiqueta "speculative-decoding" sugiere que el modelo está pensado para actuar como modelo borrador (draft model) en esquemas de decodificación especulativa, donde un modelo pequeño propone tokens que un modelo mayor verifica. Esta función encaja con su tamaño reducido y su licencia permisiva, pero la model card no aporta detalles técnicos sobre cómo se entrenó para esa tarea ni sobre el vocabulario o tokenizador empleados.

## Capacidades

- Generación de texto en inglés, según el campo de idioma declarado.
- Etiquetado como modelo para decodificación especulativa, lo que sugiere uso como modelo borrador en pipelines de inferencia acelerada.
- Modelo pequeño (1,08 B), adecuado para ejecución en CPU y GPU de gama baja.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento (thinking mode).
- No se documentan capacidades multilingües más allá del inglés.
- No se documentan capacidades específicas de código o matemáticas.

## Casos de uso

- Decodificación especulativa: usar Amoeba-1B como modelo borrador que propone varios tokens por paso, verificados por un modelo mayor, para reducir la latencia de inferencia en producción.
- Prototipado local: validar pipelines de generación de texto en portátiles o equipos sin GPU dedicada gracias a las cuantizaciones Q4_K_S y Q4_K_M, que ocupan alrededor de 0,8 GB.
- Pruebas de integración con llama.cpp: verificar el correcto funcionamiento de herramientas basadas en GGUF (Ollama, llama.cpp, servidores compatibles con endpoints) antes de desplegar modelos mayores.
- Generación de texto de baja latencia en inglés: tareas de autocompletado o respuestas cortas donde el coste computacional por token es crítico.
- Filtrado y clasificación rápida: usar el modelo para etiquetar o resumir textos breves en inglés en entornos con recursos muy limitados.
- Educación y experimentación: estudiar el comportamiento de modelos pequeños cuantizados y comparar la degradación de calidad entre Q2_K, Q4_K_M y Q8_0.
- Componente auxiliar en sistemas de recuperación aumentada (RAG) para reescritura de consultas o generación de respuestas preliminares en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB (Q2_K y Q3_K_S), 0,8 GB (Q4_K_S y Q4_K_M), 1,0 GB (Q6_K), 1,3 GB (Q8_0) y 2,3 GB (f16), según los tamaños de fichero publicados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para cuantizaciones bajas; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes. El modelo también puede ejecutarse en CPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp, Ollama, servidores compatibles con GGUF y, para el modelo base, transformers.
- Latencia y throughput estimados: no disponibles. El tamaño reducido sugiere latencias bajas, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Amoeba-1B (esta ficha) | 1,08 B | no disponible | Apache 2.0 | GGUF, safetensors | Etiquetado para decodificación especulativa; solo inglés |
| Modelos de ~1 B de la familia Llama | ~1 B | no disponible en esta ficha | licencia propia | safetensors, GGUF | Comparación no verificada con datos de esta ficha |
| Modelos de ~1 B de la familia Qwen | ~1 B | no disponible en esta ficha | licencia propia | safetensors, GGUF | Comparación no verificada con datos de esta ficha |

No se dispone de datos de rendimiento del modelo que permitan una comparación cuantitativa fiable con alternativas. La comparativa anterior es meramente orientativa por categoría de tamaño y no debe interpretarse como una evaluación de calidad.

## Limitaciones y advertencias

- Solo soporta inglés según el campo de idioma declarado; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- No se han publicado datos sobre sesgos, alucinación ni evaluación de seguridad.
- La longitud de contexto es desconocida; no se debe asumir una ventana amplia en producción.
- Al ser un modelo de 1,08 B, su capacidad de razonamiento, código y matemáticas es previsiblemente limitada frente a modelos mayores, aunque no hay benchmarks que lo cuantifiquen.
- Las cuantizaciones Q2_K y Q3_K_S pueden degradar notablemente la calidad; la model card recomienda Q4_K_S, Q4_K_M y Q8_0 para un mejor equilibrio.
- No se ofrecen cuantizaciones ponderadas con imatrix en el momento de la publicación, según indica el propio autor.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones del modelo base leexamp/Amoeba-1B por si hubiera restricciones adicionales no reflejadas aquí.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Amoeba-1B-GGUF
- Modelo base: https://huggingface.co/leexamp/Amoeba-1B
- Página de descargas del autor: https://hf.tst.eu/model#Amoeba-1B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
