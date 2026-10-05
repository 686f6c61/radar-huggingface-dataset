# plasmova/Nova-v1

## Resumen

Nova v1 es un modelo de lenguaje causal de tipo decoder-only desarrollado por el usuario plasmova y publicado en Hugging Face bajo licencia Apache 2.0. Con 84.964.480 parametros (aproximadamente 85 millones), se situa en la categoria de los modelos pequenos, disenados para inferencia en hardware modesto, prototipado rapido y experimentacion con arquitecturas personalizadas. El repositorio empaqueta los pesos originales en formato Safetensors (Float32) junto con el codigo de modelado personalizado necesario para cargarlo mediante la API de Transformers.

La arquitectura sigue el esquema clasico de los transformers decoder-only modernos: 10 capas, tamano oculto de 640, atencion con grouped-query attention (10 cabezas de consulta y 2 de clave/valor), embeddings posicionales rotatorios (RoPE), RMSNorm y red feed-forward con activacion SwiGLU. El vocabulario es de 32.768 tokens y la longitud maxima de contexto es de 2.048 tokens, una ventana corta que limita su uso en tareas que requieran documentos largos o conversaciones extensas.

Su relevancia actual es limitada pero concreta: se trata de un modelo de autoria individual, sin benchmarks publicados y con cero descargas en el momento de redactar esta ficha. Resulta util como caso de estudio de implementacion de codigo personalizado en Transformers y como base para experimentos de fine-tuning de bajo coste, pero no como sustituto de modelos pequenos ya consolidados. La unica lengua declarada es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal con grouped-query attention, RoPE, RMSNorm y SwiGLU |
| Parametros totales | 84.964.480 (aproximadamente 85,0 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible en el repositorio; los pesos se distribuyen en Float32. No se publican versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (Float32) |
| Vocabulario | 32.768 tokens |
| Tamano oculto | 640 |
| Numero de capas | 10 |
| Cabezas de atencion | 10 de consulta, 2 de clave/valor (GQA) |
| Tamano de la feed-forward | 1.728 |
| Tamano del repositorio | 0,3 GB |
| Libreria | Transformers (requiere trust_remote_code=True) |
| Tokens especiales de chat | `<|user|>`, `<|assistant|>`, `<|end|>`, `<|endoftext|>` |

## Arquitectura y entrenamiento

Nova v1 es un transformer decoder-only causal de 10 capas con un tamano oculto de 640 y una dimension de cabeza de 64 (640 dividido entre 10 cabezas de consulta). Emplea grouped-query attention con 10 cabezas de consulta y 2 de clave/valor, lo que reduce el coste de memoria de la cache KV durante la generacion; con 2 cabezas KV, la cache por token y capa equivale a 2 x 64 = 128 valores, frente a los 640 de una atencion multi-cabeza completa. La normalizacion se realiza con RMSNorm, la codificacion posicional mediante embeddings rotatorios (RoPE) y la red feed-forward usa SwiGLU con dimension intermedia de 1.728, un valor relativamente ajustado respecto al tamano oculto (ratio 2,7x). La implementacion admite la interfaz de modelo causal de Transformers y generacion con cache KV.

La model card no proporciona informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni el proceso de alineacion. Tampoco describe innovaciones tecnicas adicionales mas alla de las citadas (GQA, RoPE, RMSNorm, SwiGLU), que son componentes estandar en modelos contemporaneos. El repositorio contiene unicamente los pesos convertidos y el tokenizer; el autor indica explicitamente que no se incluyen resultados de evaluacion y recomienda evaluar el modelo antes de desplegarlo. Los terminos de las licencias de los datasets de origen siguen aplicandose al entrenamiento, aunque no se detallan cuales son. El codigo de modelado es personalizado, por lo que su carga requiere `trust_remote_code=True`, con el riesgo de seguridad que ello implica.

## Capacidades

- Generacion de texto causal en ingles, con la interfaz estandar de `AutoModelForCausalLM` y soporte de generacion con cache KV.
- Formato conversacional basico mediante los marcadores `<|user|>`, `<|assistant|>` y `<|end|>`, lo que permite plantillas de dialogo de un solo turno o de pocos turnos dentro de la ventana de 2.048 tokens.
- Razonamiento y conocimiento general: no hay evidencia publicada de capacidades destacadas en matematicas, codigo o razonamiento de varios pasos; con 85 M de parametros, el conocimiento factual almacenado es previsiblemente muy limitado.
- Tool calling / function calling: no documentado ni soportado de forma explicita.
- Soporte de agentes y razonamiento multi-paso: no documentado. La ventana de 2.048 tokens restringe de forma severa cualquier flujo agentico que acumule historial.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales: no se documenta modo de razonamiento (thinking mode), vision, audio ni decodificacion especulativa.
- Ajuste de muestreo recomendado por el autor: `temperature=0.2`, `top_p=0.9`, `top_k=40`, `repetition_penalty=1.05`, `no_repeat_ngram_size=3`, `max_new_tokens=48` en el ejemplo publicado, con `eos_token_id` compuesto por el token de fin de secuencia y `<|endoftext|>`.

## Casos de uso

- Prototipado y pruebas de integracion de Transformers: al requerir `trust_remote_code=True`, sirve para validar flujos de carga de codigo personalizado, revision de implementaciones propias y verificacion de que la cache KV funciona correctamente en un entorno controlado.
- Fine-tuning de bajo coste sobre dominio especifico: con 85 M de parametros y pesos Float32 (unos 340 MB), el ajuste completo cabe en una sola GPU de consumo, lo que permite experimentar con tecnicas de adaptacion (LoRA, ajuste completo) sobre corpus pequenos en ingles.
- Generacion de texto corto y plantillas: redaccion de respuestas breves, autocompletado de formularios o normalizacion de campos de texto donde el prompt y la salida quepan holgadamente en 2.048 tokens y no se requiera precision factual alta.
- Clasificacion y etiquetado mediante generacion: tareas de analisis de sentimiento, categorizacion de tickets o extraccion de campos simples formuladas como generacion condicionada, siempre que la etiqueta objetivo sea corta.
- Educacion e investigacion sobre arquitecturas pequenas: analisis comparativo de decisiones de diseno (ratio GQA 5:1, dimension FFN de 1.728, vocabulario de 32.768) frente a modelos de tamano similar.
- Inferencia en el borde o entornos sin GPU: al ocupar aproximadamente 340 MB en Float32 y alrededor de 170 MB en Float16, es viable ejecutarlo en CPU, en dispositivos con poca memoria o en contenedores ligeros para tareas de generacion no criticas.
- Generacion de datos sinteticos a pequena escala: produccion de texto de relleno o corpus auxiliares para pruebas de pipelines, asumiendo que la calidad y la coherencia seran limitadas.
- Base para experimentos de destilacion: por su tamano reducido, puede actuar como alumno en procesos de destilacion desde modelos mayores, aunque no hay resultados publicados que respalden su idoneidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de Nova v1 indica de forma explicita que el repositorio contiene unicamente los pesos convertidos y el tokenizer, y que no se incluyen resultados de evaluacion (MMLU, HumanEval, GSM8K ni ningun otro). La busqueda web realizada no devolvio ninguna referencia tecnica relevante sobre este modelo: los resultados obtenidos correspondian a informes sobre sistemas sanitarios y no guardan relacion con Nova v1.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 340 MB en Float32 (pesos), unos 170 MB en Float16/BFloat16, unos 85 MB en cuantizacion de 8 bits y alrededor de 45 MB en 4 bits. A ello hay que sumar la cache KV, que con 2 cabezas de clave/valor y dimension de cabeza 64 es muy reducida (del orden de decenas de KB por cada 1.000 tokens generados en las 10 capas).
- GPU recomendadas: practicamente cualquier GPU moderna es suficiente. No requiere A100, H100 ni tarjetas de gama alta; una GTX 1650, una RTX 3060 o incluso una GPU integrada reciente pueden ejecutarlo sin dificultad.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo actual e incluso en muchas generaciones anteriores. Tambien es viable la inferencia en CPU.
- Opciones de despliegue: la ruta documentada por el autor es Transformers con `trust_remote_code=True`. El soporte en vLLM, TGI, llama.cpp u Ollama no esta garantizado, ya que se trata de una arquitectura personalizada que requeriria registrar la implementacion en cada motor; no se ha publicado ninguna conversion a GGUF. Para uso educativo o de prueba, Transformers en CPU o GPU es la via recomendada.
- Latencia y throughput estimados: no disponibles. El autor no publica mediciones de latencia ni de tokens por segundo, y no hay datos de terceros al respecto.

## Comparativa con modelos similares

Los datos de los modelos comparados provienen de sus model cards publicas y pueden variar ligeramente segun la version consultada. No se dispone de resultados de benchmarks de Nova v1, por lo que la comparacion se limita a caracteristicas de arquitectura y licencia.

| Modelo | Parametros | Contexto | Licencia | Idioma | Notas |
|---|---|---|---|---|---|
| Nova v1 (plasmova) | 84,96 M | 2.048 | Apache 2.0 | Ingles | Codigo de modelado personalizado, requiere `trust_remote_code=True`; sin benchmarks publicados |
| Pythia-70M (EleutherAI) | 70 M | 2.048 | Apache 2.0 | Ingles | Familia ampliamente utilizada en investigacion de interpretabilidad; pesos estandar en Transformers |
| GPT-2 small (OpenAI) | 124 M | 1.024 | MIT | Ingles | Arquitectura con LayerNorm y embeddings posicionales aprendidos, sin GQA ni RoPE; ampliamente soportado |
| SmolLM-135M (HuggingFaceTB) | 135 M | 2.048 | Apache 2.0 | Ingles | Entrenado con un volumen de tokens documentado y con resultados de benchmarks publicados |

Frente a estas alternativas, Nova v1 se distingue por su arquitectura mas moderna en componentes (GQA, RoPE, RMSNorm, SwiGLU) frente a GPT-2, pero carece de la documentacion de entrenamiento, los benchmarks y el soporte de ecosistema que si tienen Pythia-70M y SmolLM-135M. Para uso practico en produccion, estos ultimos presentan menor riesgo de integracion.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no existe ninguna medicion objetiva de calidad, razonamiento, codigo o conocimiento factual. Cualquier afirmacion sobre su rendimiento seria especulativa.
- Riesgo elevado de alucinacion: con 85 M de parametros y sin informacion sobre el corpus de entrenamiento, la capacidad de almacenar y recuperar hechos es muy limitada. No debe utilizarse para responder preguntas factuales sin verificacion externa.
- Sesgos desconocidos: la model card no documenta la composicion del dataset ni se ha realizado ninguna evaluacion de sesgos. Al estar entrenado previsiblemente en texto en ingles, heredara los sesgos presentes en esa fuente, que no se puede identificar.
- Limitacion severa de contexto: la ventana de 2.048 tokens impide procesar documentos largos, mantener conversaciones extensas o ejecutar flujos agenticos con historial acumulado. El propio autor advierte de mantener prompt y generacion dentro de ese limite.
- Limitacion idiomatica: solo se declara ingles. El rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera deficiente.
- Riesgo de seguridad del codigo personalizado: la carga requiere `trust_remote_code=True`, lo que implica ejecutar codigo arbitrario del repositorio. En entornos de produccion debe auditarse el codigo de modelado antes de cargarlo, tal y como advierte el propio autor.
- Licencia: los pesos y el codigo se distribuyen bajo Apache 2.0, que permite uso comercial, modificacion y redistribucion con atribucion y conservacion del aviso de licencia. No se anaden clausulas de uso aceptable especificas en esta ficha, pero los terminos de los datasets de origen siguen aplicandose y no se detallan, lo que introduce incertidumbre juridica para uso comercial.
- Madurez del repositorio: cero descargas y una sola interaccion registrada en el momento de la consulta, sin historial de mantenimiento ni comunidad. Riesgo alto de abandono y de falta de soporte.
- Idoneidad para produccion: no recomendado para sistemas en produccion que requieran precision, cobertura multilingue, contexto largo o garantias de calidad. Su uso razonable se limita a experimentacion, docencia y pruebas de integracion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/plasmova/Nova-v1
- Pagina del autor en Hugging Face: https://huggingface.co/plasmova
- No se han encontrado en la busqueda web enlaces relevantes adicionales (papers, blogs, repositorios o demos) relacionados con Nova v1. Los resultados devueltos por la busqueda correspondian a informes sobre sistemas sanitarios y no guardan relacion con el modelo.
