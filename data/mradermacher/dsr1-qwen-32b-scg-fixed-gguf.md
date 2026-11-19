# mradermacher/DSR1-Qwen-32B-scg-fixed-GGUF

## Resumen
DSR1-Qwen-32B-scg-fixed-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo `moogician/DSR1-Qwen-32B-scg-fixed`, publicadas por mradermacher el 8 de marzo de 2025. El modelo subyacente es un ajuste fino completo (full fine-tuning) de Qwen2.5-32B, derivado de la familia DeepSeek-R1 destilada sobre Qwen, orientado a tareas conversacionales y de razonamiento en inglés. Este repositorio no introduce pesos nuevos: su valor está en ofrecer versiones comprimidas listas para inferencia local con llama.cpp y ecosistemas compatibles.

El modelo cuenta con 32.763.876.352 parámetros (aproximadamente 32,8 mil millones), una arquitectura transformer densa (no MoE) y una licencia etiquetada como "other", heredada del modelo base. El repositorio completo ocupa 224 GB, aunque las cuantizaciones individuales van desde 12,4 GB (Q2_K) hasta 34,9 GB (Q8_0), lo que permite desplegarlo en un rango amplio de hardware.

Su relevancia actual radica en que facilita el uso de un modelo de razonamiento de 32B en entornos con recursos limitados, sin necesidad de infraestructura de servidor dedicada. Al estar basado en Qwen2.5, conserva las capacidades multilingües y de generación de código de esa familia, aunque la model card solo declara inglés como idioma soportado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer densa (derivada de Qwen2.5-32B) |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | other |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento
El modelo base `moogician/DSR1-Qwen-32B-scg-fixed` es un ajuste fino completo (full fine-tuning) realizado con llama-factory sobre una base Qwen de 32B, según las etiquetas del repositorio (`llama-factory`, `full`, `generated_from_trainer`). La nomenclatura "DSR1" sugiere una destilación de DeepSeek-R1 sobre Qwen, práctica habitual para transferir capacidades de razonamiento paso a paso a modelos densos de tamano medio. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

Las cuantizaciones de mradermacher son estáticas (quantize_version 2, output_tensor_quantised 1), generadas con el conversor HF→GGUF. El autor indica que no hay cuantizaciones ponderadas/imatrix disponibles en el momento de la publicacion, lo que implica que la calidad de las versiones IQ puede ser inferior a la de variantes imatrix equivalentes. No se documentan innovaciones arquitectonicas adicionales mas alla de las propias de Qwen2.5.

## Capacidades
- Generacion de texto conversacional multi-turno en ingles.
- Razonamiento paso a paso (herencia de la destilacion de DeepSeek-R1, segun la nomenclatura del modelo).
- Generacion de codigo y resolucion de problemas matematicos, capacidades tipicas de la familia Qwen2.5.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente.
- Capacidades multilingues: limitadas segun la model card (solo `en` declarado).
- Capacidades especiales (vision, audio, thinking mode explicito): no disponible.

## Casos de uso
- Asistente conversacional local en ingles: desplegado con llama.cpp u Ollama usando la cuantizacion Q4_K_M (20 GB), permite mantener dialogos multi-turno en una estacion de trabajo con una sola GPU de 24 GB.
- Razonamiento sobre documentos tecnicos: la variante Q5_K_M o Q6_K ofrece mayor fidelidad para tareas de analisis y sintesis de texto largo, a costa de 23-27 GB de VRAM.
- Generacion de codigo en entornos sin conexion: la cuantizacion Q4_K_S (18,9 GB) cabe en GPUs consumer de gama alta y permite autocompletado y explicacion de codigo sin enviar datos a la nube.
- Educacion y tutoria automatizada: el modelo puede explicar conceptos paso a paso, aprovechando su orientacion al razonamiento, en plataformas de aprendizaje con recursos de hardware moderados.
- Prototipado de pipelines de IA: al estar en GGUF, se integra facilmente en herramientas como LM Studio, llama.cpp o text-generation-webui para pruebas rapidas antes de escalar a versiones sin cuantizar.
- Investigacion sobre cuantizacion: el repositorio ofrece 11 variantes del mismo modelo, lo que permite estudiar el impacto de la compresion en la calidad de salida para tareas de razonamiento.
- Despliegue en CPU: las variantes Q2_K (12,4 GB) y Q3_K_S (14,5 GB) permiten ejecucion en servidores sin GPU, con latencia mayor pero viable para tareas por lotes.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

| Cuantizacion | Tamano (GB) | VRAM estimada | GPU recomendada |
|---|---|---|---|
| Q2_K | 12,4 | ~14 GB | RTX 4080, RTX 3090 |
| Q3_K_S | 14,5 | ~16 GB | RTX 4080, RTX 4090 |
| Q3_K_M | 16,0 | ~18 GB | RTX 4090 |
| Q3_K_L | 17,3 | ~19 GB | RTX 4090 |
| IQ4_XS | 18,0 | ~20 GB | RTX 4090 |
| Q4_K_S | 18,9 | ~21 GB | RTX 4090, A6000 |
| Q4_K_M | 20,0 | ~22 GB | RTX 4090, A6000 |
| Q5_K_S | 22,7 | ~25 GB | A6000, A100 40GB |
| Q5_K_M | 23,4 | ~26 GB | A6000, A100 40GB |
| Q6_K | 27,0 | ~29 GB | A100 40GB |
| Q8_0 | 34,9 | ~37 GB | A100 40GB, A100 80GB |

- Cabe en GPU consumer: si, hasta Q4_K_M en una RTX 4090 (24 GB); Q5 y superiores requieren GPU profesional.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF (vLLM con soporte GGUF experimental, TGI no soporta GGUF nativamente).
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota: las estimaciones de VRAM asumen offload completo a GPU; con offload parcial a RAM se pueden ejecutar cuantizaciones mayores con penalizacion de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DSR1-Qwen-32B-scg-fixed (este) | 32,8B | no disponible | other | GGUF | Destilacion R1 sobre Qwen, solo ingles declarado |
| Qwen2.5-32B-Instruct | 32,8B | 128K (segun documentacion publica de Qwen) | Apache 2.0 (segun Qwen) | safetensors, GGUF | Base probable; licencia mas permisiva |
| DeepSeek-R1-Distill-Qwen-32B | 32,8B | 128K (segun documentacion publica de DeepSeek) | MIT (segun DeepSeek) | safetensors, GGUF | Destilacion oficial de R1 sobre Qwen |
| Gemma-2-27B-it | 27B | 8K | Gemma Terms | safetensors, GGUF | Alternativa densa de tamano similar, multilingue |

La comparativa se basa en caracteristicas publicas de las familias citadas; no se dispone de datos de rendimiento especificos de este ajuste para contrastar. La ventaja principal de este repositorio es la disponibilidad inmediata de cuantizaciones GGUF, mientras que su limitacion es la licencia "other" y la falta de benchmarks propios.

## Limitaciones y advertencias
- Licencia "other": es imprescindible revisar los terminos del modelo base (`moogician/DSR1-Qwen-32B-scg-fixed`) y de Qwen antes de cualquier uso comercial; no se garantiza permiso explicito.
- Solo se declara ingles como idioma soportado; el rendimiento en castellano no esta verificado y podria degradarse notablemente.
- Riesgo de alucinacion inherente a los modelos de 32B, especialmente en tareas factuales sin contexto; la destilacion de razonamiento no elimina este problema.
- No hay benchmarks publicados para este ajuste concreto, por lo que no se puede comparar objetivamente con el modelo base ni con alternativas.
- Las cuantizaciones IQ no son imatrix (el autor lo indica), lo que puede reducir la calidad frente a variantes ponderadas equivalentes.
- La longitud de contexto no esta documentada en la informacion disponible; asumir la de Qwen2.5 (128K) sin verificacion es arriesgado para produccion.
- El repositorio ocupa 224 GB en total; descargar solo la cuantizacion necesaria para evitar consumo innecesario de almacenamiento.
- Modelo con 65 descargas y 0 likes en el momento de la consulta: comunidad muy reducida, sin validacion externa significativa.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/mradermacher/DSR1-Qwen-32B-scg-fixed-GGUF
- Modelo base: https://huggingface.co/moogician/DSR1-Qwen-32B-scg-fixed
- Pagina de resumen del autor: https://hf.tst.eu/model#DSR1-Qwen-32B-scg-fixed-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
