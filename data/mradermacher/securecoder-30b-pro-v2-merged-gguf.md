# mradermacher/securecoder-30b-pro-v2-merged-GGUF

## Resumen

Securecoder-30b-pro-v2-merged-GGUF es la distribucion en formato GGUF del modelo Taimwe/securecoder-30b-pro-v2-merged, un ajuste fino orientado a codigo y ciberseguridad construido sobre la familia Qwen3 (etiquetado como `qwen3_moe` en los metadatos). El modelo original fue entrenado con Unsloth y fusionado (merged) para su publicacion, y esta version la genera y cuantiza el usuario mradermacher, especializado en conversiones GGUF para inferencia local. Cuenta con 30.532.122.624 parametros totales (unos 30,5 mil millones) y licencia Apache 2.0.

La relevancia de esta ficha radica en que ofrece un modelo de ~30B con enfasis declarado en generacion de codigo, tool calling y seguridad, empaquetado en cuantizaciones que van de Q2_K (11,4 GB) a Q8_0 (32,6 GB), lo que permite desplegarlo en estaciones de trabajo con GPU de consumo alta o en servidores con una sola GPU profesional. Al derivar de Qwen3 MoE, es plausible que solo una fraccion de los parametros este activa por token, aunque el autor no publica el numero exacto de parametros activos.

El repositorio tiene un volumen de descargas modesto (388) y solo 2 likes en el momento de la consulta, lo que sugiere un modelo de nicho y reciente (creado el 3 de octubre de 2026). No se han publicado resultados de benchmarks ni detalles del dataset de entrenamiento en la informacion disponible, por lo que las evaluaciones deben hacerse de forma empirica antes de adoptarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (etiqueta `qwen3_moe`; detalles de capas y expertos no disponibles) |
| Parametros totales | 30.532.122.624 (~30,5B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); variantes imatrix en repo i1 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (original en safetensors/transformers) |

## Arquitectura y entrenamiento

El modelo base es Taimwe/securecoder-30b-pro-v2-merged, un ajuste fino de la familia Qwen3 con arquitectura Mixture of Experts segun la etiqueta `qwen3_moe`. El ajuste se realizo con Unsloth, herramienta habitual para fine-tuning eficiente en memoria, y posteriormente se fusionaron los pesos (merged) para distribuir un unico checkpoint. La informacion disponible no detalla el numero de capas, el numero de expertos, la dimension oculta ni el mecanismo de enrutamiento.

Tampoco se especifican el volumen de tokens de entrenamiento, la composicion del dataset (mas alla de las etiquetas `code`, `tool-calling`, `security` y `cybersecurity`), ni si se aplicaron fases de RLHF, DPO o preference tuning. No hay datos publicados sobre innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. Esta version GGUF es una conversion estatica del checkpoint original realizada por mradermacher, sin cambios en los pesos mas alla de la cuantizacion.

## Capacidades

- Generacion de texto y codigo en ingles, con enfasis declarado en tareas de programacion.
- Tool calling / function calling, segun las etiquetas del repositorio.
- Orientacion a ciberseguridad: analisis de codigo, deteccion de vulnerabilidades y tareas de seguridad (por las etiquetas `security` y `cybersecurity`; sin detalle adicional publicado).
- Conversacional multi-turno (etiqueta `conversational`).
- Compatible con endpoints (etiqueta `endpoints_compatible`).
- Capacidades multilingues limitadas al ingles segun el campo `language`.
- No se documentan modos de razonamiento extendido (thinking), vision ni audio.

## Casos de uso

- Revision de codigo con foco en seguridad: el modelo puede recibir fragmentos de codigo y senalar patrones de riesgo (inyeccion, desbordamientos, uso inseguro de APIs), aprovechando su ajuste especifico en ciberseguridad.
- Asistente de desarrollo en IDE: integrado via llama.cpp u Ollama, sirve para autocompletado y explicacion de funciones en ingles, con cuantizaciones Q4_K_M que caben en GPU de consumo.
- Automatizacion de triaje de alertas: con soporte de tool calling, puede conectarse a APIs de escaneo o gestores de incidencias para clasificar y enriquecer alertas.
- Generacion de pruebas unitarias y parches: util en pipelines de CI/CD para proponer tests o correcciones sobre diffs, siempre con revision humana dada la ausencia de benchmarks publicados.
- Formacion y laboratorios: al ser Apache 2.0 y ejecutable en local, es adecuado para entornos de entrenamiento en seguridad donde no se puede enviar codigo a APIs externas.
- Analisis de configuraciones y scripts: puede revisar ficheros de infraestructura (Dockerfiles, playbooks, politicas) en busca de malas practicas, en despliegues on-premise con llama.cpp o vLLM.
- Chatbot tecnico interno: conversaciones multi-turno sobre documentacion de codigo o procedimientos de seguridad, limitado al ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~11,4 GB, Q3_K_M ~14,8 GB, IQ4_XS ~16,7 GB, Q4_K_M ~18,7 GB, Q5_K_M ~21,8 GB, Q6_K ~25,2 GB, Q8_0 ~32,6 GB (mas overhead de contexto KV).
- GPU recomendadas: para Q4_K_M, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente; para Q6_K y Q8_0 conviene una A100 40 GB, H100 o L40S.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con cuantizaciones hasta Q5_K_M; en GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) solo con Q3_K o IQ4_XS y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; el checkpoint original en safetensors puede servirse con vLLM o TGI.
- Latencia y throughput: no disponibles; al ser un MoE, el rendimiento dependera del numero de parametros activos, dato no publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| securecoder-30b-pro-v2-merged (GGUF) | ~30,5B (MoE, activos no disponibles) | no disponible | Codigo y ciberseguridad | Apache 2.0 | GGUF en HF |
| Qwen3 base (familia) | variable | no disponible en esta ficha | Proposito general | Apache 2.0 (segun familia) | safetensors y GGUF |
| Modelos de codigo de ~30B de otros autores | ~30B | no disponible | Codigo | variable | variable |

La comparacion cuantitativa con alternativas no es posible con los datos disponibles: no hay benchmarks publicados ni se detallan parametros activos o contexto, por lo que la eleccion frente a otros modelos de codigo debe basarse en pruebas propias.

## Limitaciones y advertencias

- Solo soporta ingles de forma declarada; el rendimiento en castellano no esta garantizado.
- No hay benchmarks publicados: el rendimiento real en HumanEval, MMLU u otras pruebas es desconocido.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en afirmaciones sobre vulnerabilidades o APIs.
- El ajuste en ciberseguridad puede producir respuestas que parezcan autoritativas sin base verificada; requiere revision experta.
- No se documentan sesgos especificos, pero al entrenarse en ingles hereda los sesgos de su corpus.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Modelo de nicho con pocas descargas y likes: menor validacion comunitaria y posible falta de mantenimiento.
- El repositorio GGUF ocupa 208,1 GB en total por incluir todas las cuantizaciones; conviene descargar solo el fichero necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/securecoder-30b-pro-v2-merged-GGUF
- Modelo base: https://huggingface.co/Taimwe/securecoder-30b-pro-v2-merged
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/securecoder-30b-pro-v2-merged-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#securecoder-30b-pro-v2-merged-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
