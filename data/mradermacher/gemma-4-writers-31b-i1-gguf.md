# mradermacher/Gemma-4-Writers-31B-i1-GGUF

## Resumen

Gemma-4-Writers-31B-i1-GGUF es una colección de cuantizaciones GGUF generadas por mradermacher a partir del modelo Ateron/Gemma-4-Writers-31B, un merge creado con mergekit y orientado a roleplay y escritura creativa. El repositorio no contiene pesos en safetensors, sino ficheros GGUF listos para motores de inferencia locales (llama.cpp, Ollama, LM Studio, koboldcpp) en 24 variantes de cuantización que van de 7,3 GB a 25,3 GB.

El modelo subyacente tiene 30.697.345.596 parámetros (aproximadamente 30,7B) según los pesos originales en safetensors, lo que lo sitúa en la gama de modelos densos de 30B. La model card indica que se trata de un modelo con capacidades de visión (los ficheros mmproj, si existen, se alojan en el repositorio de cuantizaciones estáticas). El idioma declarado es únicamente inglés.

Su relevancia es práctica: permite ejecutar un modelo de 31B en hardware de consumo gracias a las cuantizaciones i1 basadas en matrices de importancia (imatrix) y al esquema IQ de llama.cpp, que ofrecen mejor relación calidad/tamaño que las cuantizaciones K estáticas equivalentes. La licencia Apache 2.0 facilita su uso comercial, aunque al ser un merge de procedencia no documentada conviene verificar la trazabilidad de los modelos fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la model card; el nombre sugiere un transformer decoder-only de la familia Gemma, pero no está confirmado |
| Parametros totales | 30.697.345.596 (30,7B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, más fichero imatrix |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base usa safetensors |

## Arquitectura y entrenamiento

La model card del repositorio no documenta la arquitectura interna del modelo base. Los metadatos indican que Ateron/Gemma-4-Writers-31B es un merge construido con mergekit, con etiquetas de roleplay, conversacional y merge. Por la denominación y el recuento de parámetros (30,7B) cabe suponer una base de la familia Gemma, pero esta afirmación no está respaldada por documentación explícita en la información disponible.

Tampoco se publican datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. La única información técnica reproducible es el proceso de cuantización: se generaron cuantizaciones i1 (importance-matrix) con `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, es decir, partiendo de los pesos en formato Hugging Face y aplicando una matriz de importancia calculada sobre el propio modelo para reducir el error en las capas más sensibles.

## Capacidades

- Generación de texto conversacional y narrativo, con orientación explícita a roleplay y escritura creativa según las etiquetas del modelo.
- Conversación multiturno (etiqueta `conversational`).
- Capacidad de visión declarada por el cuantizador, con ficheros mmproj alojados en el repositorio estático; no se detalla el alcance ni el codificador visual.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multietapa: no disponible.
- Capacidades multilingües: limitadas al inglés declarado.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Roleplay y personajes conversacionales: es el caso de uso principal declarado por las etiquetas del modelo; las cuantizaciones IQ4_XS a Q5_K_M (16,8-21,9 GB) mantienen calidad suficiente para sesiones largas con historial de conversación.
- Asistencia a la escritura creativa: generación de borradores de ficción, diálogos y descripciones, aprovechando el ajuste del merge hacia estilo narrativo.
- Prototipado local en estaciones de trabajo con una única GPU de 24 GB: la variante i1-Q4_K_M (18,8 GB) cabe en una RTX 3090 o RTX 4090 con contexto moderado.
- Despliegue en equipos sin GPU dedicada: las variantes i1-IQ2_M (11,0 GB) o i1-Q2_K (12,0 GB) permiten inferencia parcial en CPU o en GPU de gama media con pérdida apreciable de calidad.
- Generación de datos sintéticos de diálogo en inglés: útil para construir datasets conversacionales o de roleplay, siempre que la licencia Apache 2.0 sea compatible con el uso previsto.
- Evaluación comparativa de cuantizaciones: el repositorio incluye el fichero imatrix y 23 variantes, lo que permite medir empíricamente la degradación por cuantización en una misma tarea.
- Integración en frontends de rol local (SillyTavern, koboldcpp): el formato GGUF es directamente compatible con estos entornos.
- Servicio de chat de baja concurrencia en una sola máquina: el tamaño del modelo limita el throughput, por lo que es adecuado para pocos usuarios simultáneos más que para producción masiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye valores de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y tampoco se proporcionan métricas de perplejidad por cuantización más allá del gráfico genérico enlazado por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia (tamaño del fichero más caché KV y overhead del runtime):
  - i1-IQ1_S (7,3 GB): aproximadamente 9-10 GB.
  - i1-IQ2_M (11,0 GB): aproximadamente 13-14 GB.
  - i1-IQ3_S (13,9 GB): aproximadamente 16-18 GB.
  - i1-IQ4_XS (16,8 GB): aproximadamente 19-21 GB.
  - i1-Q4_K_M (18,8 GB): aproximadamente 21-24 GB.
  - i1-Q5_K_M (21,9 GB): aproximadamente 25-28 GB.
  - i1-Q6_K (25,3 GB): aproximadamente 28-32 GB.
- GPU recomendadas: A100 40/80 GB o H100 para las variantes altas con contexto largo; RTX 3090, RTX 4090 o RTX 5090 (24-32 GB) para IQ3_S a Q4_K_M; dos GPU de 24 GB en paralelo para Q5_K_M y Q6_K.
- Cabe en GPU de consumo: sí, en RTX 3090/4090/5090 con cuantizaciones de hasta Q4_K_M; por debajo de 12 GB de VRAM solo son viables las variantes IQ1/IQ2 con descarga parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python y servidores compatibles con GGUF. vLLM y TGI no consumen GGUF de forma nativa en todos sus modos, por lo que requerirían convertir de nuevo a safetensors.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/Gemma-4-Writers-31B-i1-GGUF | 30,7B | No disponible | GGUF (23 cuantizaciones i1) | Apache 2.0 | 159 descargas, 1 like |
| Ateron/Gemma-4-Writers-31B (modelo base) | 30,7B | No disponible | Safetensors | Apache 2.0 (segun metadatos) | Repositorio origen del merge |
| mradermacher/Gemma-4-Writers-31B-GGUF (cuantizaciones estaticas) | 30,7B | No disponible | GGUF | Apache 2.0 | Variante estática del mismo modelo |

Rendimiento comparado: no disponible. No hay benchmarks publicados para ninguno de los tres, por lo que no es posible establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Idiomas: únicamente inglés declarado; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- Sesgos conocidos: no hay documentación sobre evaluación de sesgos, filtrado de datos ni alineación del merge.
- Alucinación: no se publican métricas de fidelidad; en modelos orientados a roleplay la prioridad suele ser la coherencia narrativa más que la veracidad factual.
- Trazabilidad: al ser un merge creado con mergekit, la procedencia exacta de los modelos fuente y sus licencias originales no se detalla en la información disponible, lo que puede afectar al uso comercial pese a la licencia Apache 2.0 declarada.
- Cuantizaciones extremas: las variantes IQ1 e IQ2 (7,3-11,0 GB) degradan notablemente la calidad; la propia model card marca IQ1_S como "for the desperate" y Q2_K_S como "very low quality".
- Capacidad de visión: declarada por el cuantizador, pero los ficheros mmproj no están en este repositorio y no se especifica qué tareas visuales soporta.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en conversaciones largas ni estimar el consumo de caché KV.
- Adopción muy baja: 159 descargas y 1 like, sin issues ni discusiones que permitan validar su comportamiento en producción.
- Repositorio de gran tamaño (334,8 GB en total): conviene descargar únicamente la cuantización necesaria, no el repositorio completo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Gemma-4-Writers-31B-i1-GGUF
- Modelo base: https://huggingface.co/Ateron/Gemma-4-Writers-31B
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Gemma-4-Writers-31B-GGUF
- Página resumen de descargas del cuantizador: https://hf.tst.eu/model#Gemma-4-Writers-31B-i1-GGUF
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF de referencia (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfico comparativo de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Sitio de nethype GmbH (infraestructura del cuantizador): https://www.nethype.de/
- Perfil del colaborador nicoboss: https://huggingface.co/nicoboss
- Resultados de búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo; los resultados devueltos no guardan relación con el modelo ni con inteligencia artificial.
