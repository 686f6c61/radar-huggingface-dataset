# lijinyan89/olmo3-190m-zh-continue

## Resumen

`lijinyan89/olmo3-190m-zh-continue` es un modelo de lenguaje de tipo base, derivado de la familia OLMo 3 de Allen Institute for AI, publicado por el usuario independiente lijinyan89. Se trata del resultado de un entrenamiento continuado (continued pretraining) sobre el modelo `lijinyan89/olmo3-190m-zh-full`, que a su vez parte de una variante de 190M de parametros de OLMo 3 adaptada al chino. El objetivo declarado es reforzar la competencia en chino del modelo sin provocar olvido catastrofico, mediante una tasa de aprendizaje baja (2e-4) y un calentamiento del 10%.

El modelo cuenta con 187.011.840 parametros reales segun los pesos en safetensors, un tamano de repositorio de 0,4 GB y licencia Apache 2.0. Es relevante para experimentacion de bajo coste en adaptacion linguistica: sirve como caso de estudio de un pipeline de continued pretraining sobre un checkpoint pequeno, y como base para tareas en chino que no requieran razonamiento complejo.

No se dispone de informacion publica sobre arquitectura detallada, longitud de contexto, composicion del dataset de entrenamiento ni resultados de evaluacion. La model card es minima y se limita a indicar el dataset de continuacion (`cmz1024/llm101-olmo3-zh-demo-data/continue`, fichero `full_v31.bin`) y los hiperparametros del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia OLMo 3; detalles no publicados en la model card) |
| Parametros totales | 187.011.840 |
| Parametros activos | no aplica (no es MoE, segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de su pertenencia a la familia OLMo 3 y de un tamano de 187M de parametros. Por la nomenclatura del repositorio y el tag `olmo3`, cabe esperar un transformer decoder-only, pero no se confirma en la model card ni se especifican numero de capas, dimension oculta, cabezas de atencion ni tipo de positional encoding. Tampoco se documenta la longitud de contexto nativa.

El entrenamiento consiste en un continued pretraining sobre el checkpoint `lijinyan89/olmo3-190m-zh-full`, usando el split `continue` del dataset `cmz1024/llm101-olmo3-zh-demo-data` (fichero `full_v31.bin`). Los hiperparametros declarados son una tasa de aprendizaje de 2e-4, justificada por el autor como medida para evitar olvido catastrofico, y un warmup del 10% del total de pasos. No se indica el numero de tokens de entrenamiento, la composicion del corpus, ni si hubo fases de SFT, RLHF o DPO. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, mezcla de expertos u otras).

## Capacidades

- Generacion de texto autoregresiva en chino, como modelo base sin ajuste instructivo declarado.
- Continuacion de texto y modelado de lenguaje en dominio chino, objetivo principal del continued pretraining.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al chino segun el campo `language: zh`; no se declaran otros idiomas.
- No se documentan modos especiales (thinking mode, vision, audio) ni capacidades multimodales.

## Casos de uso

- Experimentacion academica con continued pretraining: el modelo sirve como referencia reproducible para estudiar el efecto de una tasa de aprendizaje baja (2e-4) y warmup del 10% sobre un checkpoint de 187M de parametros, comparando el antes (`olmo3-190m-zh-full`) y el despues (`olmo3-190m-zh-continue`).
- Generacion de texto auxiliar en chino de bajo coste: al ocupar 0,4 GB en safetensors, puede desplegarse en entornos con recursos muy limitados para tareas de completado de frases o borradores.
- Base para fine-tuning posterior en chino: al ser un modelo base con licencia Apache 2.0, es un punto de partida legalmente permisivo para ajustes especificos de dominio con presupuesto reducido.
- Filtrado o clasificacion ligera de texto chino: mediante fine-tuning de una cabeza de clasificacion sobre las representaciones del modelo, aprovechando su bajo coste de inferencia.
- Prototipado educativo: util para demostrar pipelines de `transformers` con `AutoModelForCausalLM` y `AutoTokenizer` en cursos o talleres sobre modelos de lenguaje.
- Pruebas de olvido catastrofico: el modelo permite medir empiricamente cuanto conocimiento previo se degrada tras el continued pretraining, comparandolo con el checkpoint base.
- Generacion de datos sinteticos a pequena escala en chino: util como generador de bajo coste en pipelines de aumento de datos, siempre con revision humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 0,4 GB solo para pesos (187M parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, menos de 2 GB en la mayoria de configuraciones.
- VRAM estimada en cuantizacion de 8 bits: en torno a 0,2 GB para pesos; en 4 bits, en torno a 0,1 GB, aunque no se publican pesos cuantizados oficiales.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); tambien cabe en CPU para inferencia por lotes pequenos.
- Cabe holgadamente en GPU consumer, incluidas GPUs de gama baja con 4-6 GB de VRAM e incluso en iGPU con memoria unificada.
- Opciones de despliegue: `transformers` con PyTorch (metodo documentado en la model card); vLLM, llama.cpp, Ollama y TGI son tecnicamente viables, pero no se documenta soporte oficial ni conversion a GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| lijinyan89/olmo3-190m-zh-continue | 187M | no disponible | zh | Apache 2.0 | Continued pretraining en chino sobre OLMo 3 190M |
| lijinyan89/olmo3-190m-zh-full | no disponible | no disponible | zh | Apache 2.0 (segun modelo derivado) | Checkpoint base del que parte este modelo |
| OLMo 3 (variante 190M original) | ~190M | no disponible | en (principalmente) | Apache 2.0 | Modelo original de Allen Institute for AI; detalles no verificados en la informacion disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo base sin ajuste instructivo: no esta disenado para seguir instrucciones ni para conversacion; su uso esperado es la continuacion de texto o el fine-tuning posterior.
- Sesgos conocidos: no documentados, pero al entrenarse sobre un corpus chino no verificado puede heredar sesgos linguisticos y culturales de dicha fuente.
- Riesgo de alucinacion: alto en tareas generativas abiertas, agravado por el reducido tamano (187M) y la ausencia de evaluacion publicada.
- Limitaciones de idioma: el campo `language: zh` restringe el uso esperado al chino; el rendimiento en otros idiomas no esta garantizado y probablemente sea pobre.
- Limitaciones de contexto: la longitud de contexto no esta documentada, por lo que no debe asumirse una ventana larga en produccion.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no documenta la procedencia ni la licencia del dataset de continued pretraining (`cmz1024/llm101-olmo3-zh-demo-data`), lo que introduce incertidumbre sobre la cadena de derechos.
- Ausencia de evaluacion: sin benchmarks publicados no es posible estimar calidad, degradacion por olvido catastrofico ni regresiones frente al checkpoint base.
- Madurez: repositorio con cero descargas y cero likes en el momento de la consulta, sin senales de validacion por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/lijinyan89/olmo3-190m-zh-continue
- Modelo base: https://huggingface.co/lijinyan89/olmo3-190m-zh-full
- Dataset de continued pretraining: https://huggingface.co/datasets/cmz1024/llm101-olmo3-zh-demo-data
- Familia OLMo 3 (Allen Institute for AI): no disponible en la informacion proporcionada
