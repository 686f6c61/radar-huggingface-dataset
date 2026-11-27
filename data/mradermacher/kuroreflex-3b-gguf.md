# mradermacher/KuroReflex-3B-GGUF

## Resumen

KuroReflex-3B es un modelo de lenguaje de 3.085.938.688 parametros (aproximadamente 3,09 mil millones) desarrollado por engenho-ai, publicado originalmente en Hugging Face bajo el identificador `engenho-ai/KuroReflex-3B`. La version aqui documentada es una recuantizacion en formato GGUF realizada por mradermacher, un conocido creador de cuantizaciones para el ecosistema llama.cpp. El modelo se presenta como parte de las iniciativas "linha-kuro", "fast-reflex" y "edge-ai", lo que sugiere un enfoque hacia inferencia ligera en dispositivos de borde.

El modelo se distribuye bajo licencia `qwen-research` (etiquetada como "other" en los metadatos), con un enlace a la licencia de Qwen2.5-3B-Instruct, lo que indica que el modelo base esta construido sobre la arquitectura Qwen2.5 de 3B parametros. Soporta los idiomas portugues e ingles, y esta disenado para uso conversacional.

La relevancia de esta ficha radica en que ofrece una via practica para desplegar un modelo de 3B en hardware de consumo mediante cuantizaciones GGUF que van desde 1,4 GB (Q2_K) hasta 6,3 GB (f16), con opciones recomendadas de Q4_K_M (2,0 GB) y Q8_0 (3,4 GB). El repositorio tiene un tamano total de 27,9 GB, ya que incluye todas las variantes de cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen2.5-3B-Instruct, segun license_link) |
| Parametros totales | 3.085.938.688 (aproximadamente 3,09 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Portugues (pt), ingles (en) |
| Licencia | qwen-research (etiquetada como "other"; enlace a Qwen2.5-3B-Instruct LICENSE) |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base original en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que el modelo base es `engenho-ai/KuroReflex-3B` y que su licencia remite a Qwen2.5-3B-Instruct, lo que sugiere una arquitectura transformer decoder-only derivada de la familia Qwen2.5. No se especifican el numero de capas, dimensiones ocultas, mecanismos de atencion ni innovaciones como decodificacion especulativa o atencion lineal.

Respecto al entrenamiento, no se dispone de datos sobre el numero de tokens, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o fine-tuning supervisado. La model card del repositorio GGUF es una plantilla generica de mradermacher que solo documenta el proceso de cuantizacion estatica (convert_type: hf, quantize_version: 2, output_tensor_quantised: 1) y no incluye informacion sobre el entrenamiento del modelo original. Las cuantizaciones ponderadas/imatrix no estaban disponibles en el momento de la publicacion segun el autor de las mismas.

## Capacidades

- Generacion de texto conversacional en portugues e ingles, segun los idiomas declarados.
- Uso como modelo base para fine-tuning o inferencia en dispositivos de borde (tag "edge-ai").
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que sugiere integracion con APIs de inferencia.
- Capacidad conversacional (tag "conversational").
- No se dispone de informacion sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio o modo thinking.
- No se confirma soporte de matematicas o generacion de codigo mas alla de lo que un modelo de 3B derivado de Qwen2.5 pueda ofrecer de forma generica.

## Casos de uso

- Asistente conversacional en portugues para aplicaciones de atencion al cliente: el modelo soporta portugues de forma nativa y su tamano de 3B permite desplegarlo en servidores modestos con cuantizacion Q4_K_M (2,0 GB), gestionando conversaciones multi-turno en entornos con recursos limitados.
- Inferencia en dispositivos de borde (edge AI): con cuantizaciones de 1,4-2,3 GB (Q2_K a Q5_K_M), el modelo cabe en dispositivos con poca memoria, como Raspberry Pi con suficiente RAM o mini-PC, para tareas de procesamiento de lenguaje local sin conexion.
- Prototipado rapido de aplicaciones NLP en portugues: al ser un modelo pequeno y con licencia de investigacion, es adecuado para experimentar con pipelines de generacion de texto antes de escalar a modelos mayores.
- Despliegue en entornos con GPU de consumo: la cuantizacion Q8_0 (3,4 GB) o f16 (6,3 GB) permite ejecutar el modelo en GPUs como RTX 3060/4060 con 8-12 GB de VRAM mediante llama.cpp u Ollama.
- Generacion de texto en ingles para tareas generales: el modelo declara soporte de ingles, por lo que puede usarse en tareas de redaccion, resumen o respuesta a preguntas en ese idioma, aunque sin datos de benchmarks que confirmen su calidad.
- Fine-tuning ligero sobre el modelo base: al estar disponible el modelo original en safetensors (3,09B parametros), se puede ajustar para dominios especificos y luego cuantizar a GGUF para despliegue en produccion con recursos limitados.
- Integracion en pipelines de CI/CD para tareas de procesamiento de lenguaje: la compatibilidad con endpoints y el formato GGUF facilitan su inclusion en flujos automatizados de generacion o clasificacion de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~1,4 GB; Q3_K_S ~1,6 GB; Q3_K_M ~1,7 GB; Q3_K_L ~1,8 GB; IQ4_XS ~1,9 GB; Q4_K_S ~1,9 GB; Q4_K_M ~2,0 GB; Q5_K_S ~2,3 GB; Q5_K_M ~2,3 GB; Q6_K ~2,6 GB; Q8_0 ~3,4 GB; f16 ~6,3 GB. Estas cifras son el tamano del archivo, por lo que la VRAM real necesitara un margen adicional para el contexto y el runtime (tipicamente 0,5-1,5 GB extra).
- GPU recomendadas: para f16, una GPU con al menos 8 GB de VRAM (RTX 3060 Ti, RTX 4060, RTX 3070); para Q8_0, al menos 6 GB (RTX 2060, RTX 3050); para Q4_K_M, al menos 4 GB (GTX 1650, RTX 3050 laptop). En entornos de servidor, A100 o H100 no son necesarias dado el reducido tamano, pero pueden usarse para mayor throughput.
- Cabe en GPU de consumo: si, en practicamente todas las GPUs consumer modernas con 4 GB o mas de VRAM usando cuantizaciones Q4 o inferiores. Tambien puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El tag "endpoints_compatible" sugiere compatibilidad con APIs de inferencia tipo TGI o vLLM (aunque vLLM requiere pesos en safetensors o AWQ, no GGUF directamente). El modelo base en safetensors puede desplegarse con transformers, vLLM o TGI.
- Latencia y throughput estimados: no disponibles. Dado el tamano de 3B, se espera un throughput alto en GPU consumer (decenas de tokens por segundo), pero no hay datos publicados que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| KuroReflex-3B (esta ficha) | 3,09B | no disponible | pt, en | qwen-research | GGUF, safetensors | Hugging Face |
| Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens (segun documentacion publica de Qwen) | multilingue (incluye es, en, pt) | qwen-research | safetensors, GGUF | Hugging Face |
| Llama-3.2-3B-Instruct | 3,21B | 131.072 tokens | multilingue (8 idiomas) | Llama 3.2 Community License | safetensors, GGUF | Hugging Face |
| Phi-3.5-mini-instruct | 3,82B | 131.072 tokens | multilingue | MIT | safetensors, GGUF | Hugging Face |

Nota: los datos de contexto y licencia de los modelos comparables provienen de documentacion publica general; no se dispone de benchmarks comparativos especificos de KuroReflex-3B. La comparativa se limita a parametros, contexto declarado y licencia, sin datos de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no se dispone de informacion sobre sesgos especificos del modelo. Al derivar de Qwen2.5, podria heredar sesgos presentes en los datos de entrenamiento de dicho modelo base, pero no hay documentacion que lo confirme.
- Riesgo de alucinacion: no cuantificado. Como modelo de 3B, el riesgo de alucinacion es inherentemente mayor que en modelos de mayor tamano, pero no hay evaluaciones publicadas.
- Limitaciones de contexto o idioma: solo se declaran portugues e ingles; no se confirma soporte de castellano ni de otros idiomas. La longitud de contexto no esta disponible, lo que impide evaluar su idoneidad para tareas de contexto largo.
- Restricciones de licencia para uso comercial: la licencia es `qwen-research` (etiquetada como "other"), vinculada a la licencia de Qwen2.5-3B-Instruct. Esta licencia suele restringir el uso comercial o requerir condiciones especificas; es imprescindible revisar el texto completo en el enlace proporcionado antes de cualquier despliegue en produccion.
- Caveats para produccion: el repositorio GGUF tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad. Las cuantizaciones ponderadas/imatrix no estaban disponibles, lo que puede afectar la calidad en cuantizaciones bajas (Q2_K, Q3_K_S). No hay benchmarks ni evaluaciones independientes que respalden su calidad. El tag "endpoints_compatible" no garantiza compatibilidad con todos los proveedores de inferencia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/KuroReflex-3B-GGUF
- Modelo base: https://huggingface.co/engenho-ai/KuroReflex-3B
- Licencia (Qwen2.5-3B-Instruct): https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Pagina de descargas convenientes: https://hf.tst.eu/model#KuroReflex-3B-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de comparacion de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Reflexiones sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
