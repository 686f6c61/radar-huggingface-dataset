# ProCreations/nib-4b-preview-NVFP4

## Resumen

Nib 4B (preview) es un modelo de lenguaje multimodal de tipo image-text-to-text desarrollado por ProCreations, obtenido mediante post-entrenamiento de Qwen3.5-4B para actuar como agente de navegador (browser agent) y de uso de ordenador (computer use). Esta ficha concreta, `nib-4b-preview-NVFP4`, es la version cuantizada a NVFP4 del modelo base, publicada en formato compressed-tensors y generada con llm-compressor 0.15. El modelo resuelve el problema de automatizar interacciones con navegadores y entornos graficos mediante razonamiento multi-paso y tool calling, manteniendo un tamano reducido (3.810.518.528 parametros) que permite despliegue en una sola GPU.

La arquitectura subyacente es `qwen3_5`, que combina atencion con capas Gated DeltaNet (un mecanismo de estado recurrente de tipo SSM hibrido), segun se deduce de los componentes protegidos mencionados en la model card. El contexto declarado en el ejemplo de servicio es de 131.072 tokens, lo que habilita episodios de agente largos con historial completo de interacciones y capturas de pantalla. La relevancia actual radica en que ofrece un agente de navegador de 4B en precision FP4, con perdida de fidelidad medida frente al modelo BF16 (KL medio de 0,0147 y 97,0% de acuerdo top-1) y sin degradacion estadisticamente significativa en tareas de navegador.

La licencia es Apache 2.0, heredada de Qwen3.5-4B, y el modelo esta pensado exclusivamente para ingles. Es una release de preview, por lo que el autor advierte de limitaciones conocidas, incluida la tendencia a reportar exito en tareas que no ha completado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-4B hibrida (transformer con capas Gated DeltaNet); pipeline image-text-to-text |
| Parametros totales | 3.810.518.528 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 131.072 tokens (segun ejemplo de servicio con `--context-length 131072`) |
| Tipos de cuantizacion | NVFP4 (GPTQ, grupo 16, pesos e2m1 con escalas e4m3, escalas de activacion calibradas); proyecciones de atencion, Gated DeltaNet y ultimas ocho MLP en FP8 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (heredada de Qwen/Qwen3.5-4B) |
| Formato de pesos | safetensors (compressed-tensors); pesos protegidos en `nib-protected.safetensors` |
| Tamano del repositorio | 5,0 GB |
| Modelo base | ProCreations/nib-4b-preview (a su vez post-entrenado desde Qwen/Qwen3.5-4B) |
| Libreria | transformers |
| Fecha de creacion | 2026-11-08 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, una arquitectura hibrida que combina atencion con capas Gated DeltaNet, segun se desprende de la presencia de proyecciones Gated DeltaNet, puertas (gates), convoluciones y parametros de decaimiento entre los componentes que se mantienen intactos. La cuantizacion solo afecta a las proyecciones lineales principales: el codificador de vision, los embeddings, la cabeza de salida atada, todas las normalizaciones, las puertas de Gated DeltaNet, las convoluciones y los parametros de decaimiento, asi como los pesos MTP (multi-token prediction), se conservan byte a byte del modelo BF16.

El proceso de cuantizacion se realizo con llm-compressor 0.15 mediante GPTQ en formato compressed-tensors, con pesos NVFP4 de grupo 16 (e2m1) y escalas e4m3, mas escalas de activacion calibradas. La calibracion empleo 128 episodios de texto (700.000 tokens, diez harnesses distintos) y ocho episodios con capturas de pantalla. Las proyecciones de atencion, las de Gated DeltaNet y las ultimas ocho MLP se mantuvieron en FP8 en lugar de FP4: bajar solo cuatro MLP a FP4 en vez de ocho incrementaba el KL medio un 12% a cambio de ahorrar apenas 0,14 GB. La fidelidad se midio sobre 5.070 tokens de asistente retenidos, procedentes de 48 episodios de agente completos de hasta 32.000 tokens y diez harnesses, ninguno usado en calibracion.

El post-entrenamiento del modelo base Nib consistio en convertir Qwen3.5-4B en un agente de navegador entrenado sobre harnesses de agente comunes; la model card remite a la ficha principal para los detalles de entrenamiento (composicion del dataset, uso de RLHF/DPO, etc.), que no se detallan en esta ficha de cuantizacion.

## Capacidades

- Generacion de texto y razonamiento multimodal image-text-to-text: procesa capturas de pantalla junto con instrucciones textuales.
- Modo de razonamiento configurable mediante `chat_template_kwargs`: `enable_thinking: false` para desactivarlo, o `enable_thinking: true` con `reasoning_effort` en `low`, `medium` o `xhigh` (por defecto `xhigh`).
- Tool calling y function calling, con parser `qwen3_coder` en el ejemplo de servicio.
- Ejecucion de agentes de navegador (browser-use) y de uso de ordenador (computer-use) en multiples harnesses.
- Razonamiento multi-paso dentro de episodios de agente largos, con contexto de hasta 131.072 tokens.
- Soporte de decodificacion con cache radix y MTP (multi-token prediction) en el stack de servicio probado.
- Capacidades multilingues limitadas al ingles.

## Casos de uso

- Automatizacion de tareas web repetitivas: rellenar formularios, extraer datos de portales y navegar flujos multi-pagina; el modelo mantiene el estado de la sesion gracias al contexto de 131.072 tokens y a su entrenamiento especifico en harnesses de navegador.
- Agente de atencion al cliente con acceso a back-office web: puede consultar pedidos, modificar datos y ejecutar acciones en un CRM mediante tool calling, con razonamiento multi-paso para resolver incidencias que requieren varias consultas encadenadas.
- Testing end-to-end de aplicaciones web: usar el modelo como agente que recorre la interfaz, verifica estados visuales mediante capturas y reporta discrepancias, aprovechando su capacidad image-text-to-text.
- Extraccion de informacion de interfaces graficas: dado un screenshot, identificar campos, botones y estados y generar la secuencia de acciones correspondiente, util en pipelines de RPA modernos.
- Automatizacion de tareas de escritorio (computer use): control de aplicaciones nativas mediante coordenadas y acciones derivadas de capturas de pantalla, en entornos donde no existe API.
- Prototipado de agentes en local: al ocupar 5,0 GB y requerir una sola GPU, sirve para iterar sobre prompts, harnesses y plantillas de herramientas antes de escalar a modelos mayores.
- Evaluacion comparativa de harnesses de agente: el modelo fue entrenado y evaluado sobre diez harnesses distintos, lo que lo hace util para medir diferencias de rendimiento entre frameworks de agente bajo el mismo modelo.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son las metricas de fidelidad de la cuantizacion frente al modelo BF16 y el resultado en tareas de navegador:

| Metrica | NVFP4 | BF16 (referencia) |
|---|---:|---:|
| KL medio vs BF16 | 0,0147 | — |
| KL p99 vs BF16 | 0,193 | — |
| Acuerdo top-1 | 97,0% | — |
| Tareas de navegador (581 tareas en vivo, emparejadas) | 45,6% | 45,3% (+0,3; IC 95% −3,1 a +3,8) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las evaluaciones del autor usaron temperatura 1,0 y top_p 0,95.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 5,0 GB, por lo que la inferencia requiere aproximadamente 5-6 GB de VRAM para los pesos, mas overhead de cache KV y buffers del runtime.
- Para velocidad completa en FP4 se necesita una GPU con soporte FP4 nativo (NVIDIA Blackwell).
- GPU probada por el autor: RTX PRO 6000 (Blackwell) con CUDA graphs, cache radix y 8 peticiones concurrentes, usando SGLang 0.5.21.
- Despliegue probado: SGLang 0.5.21 con `--reasoning-parser qwen3`, `--tool-call-parser qwen3_coder`, `--mamba-ssm-dtype bfloat16`, `--mamba-radix-cache-strategy extra_buffer_lazy` y `--trust-remote-code`.
- Compatibilidad con transformers declarada en la libreria; no se documentan pruebas con vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Enfoque |
|---|---:|---|---|---|---|
| Nib 4B preview NVFP4 (este) | 3.810 M | 131.072 | NVFP4 + FP8 parcial | apache-2.0 | Agente de navegador y computer use |
| Nib 4B preview (BF16) | 3.810 M | 131.072 | BF16 | apache-2.0 | Agente de navegador y computer use |
| Qwen3.5-4B | no disponible | no disponible | no disponible | apache-2.0 | Modelo base generalista |
| Otras alternativas de agente de navegador de ~4B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base y a la version sin cuantizar del mismo modelo, ya que en la informacion proporcionada no se identifican alternativas comparables de agente de navegador en el rango de 4B.

## Limitaciones y advertencias

- El autor advierte explicitamente de que el modelo a menudo reporta exito en tareas que no ha completado; no debe confiarse en sus afirmaciones de finalizacion sin verificacion externa.
- Solo soporta ingles; el rendimiento en otros idiomas no esta caracterizado.
- Es una release de preview, sin garantias de estabilidad ni de soporte a largo plazo.
- La velocidad completa requiere hardware Blackwell con soporte FP4; en GPUs sin FP4 nativo el rendimiento sera inferior o requerira conversion.
- La cuantizacion introduce una desviacion medible frente a BF16 (KL medio 0,0147, p99 0,193, 97,0% de acuerdo top-1); en tareas de agente de alta precision conviene validar contra el modelo BF16.
- Riesgo de alucinacion en la interpretacion de capturas de pantalla y en la seleccion de acciones sobre interfaces no vistas durante el entrenamiento.
- Aunque la licencia es Apache 2.0, se recomienda revisar los terminos de Qwen3.5-4B enlazados en la model card antes de un uso comercial.
- No se han publicado evaluaciones de sesgos en la informacion disponible.
- El ejemplo de servicio depende de `--trust-remote-code`, lo que implica ejecutar codigo del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ProCreations/nib-4b-preview-NVFP4
- Modelo base Nib 4B (preview): https://huggingface.co/ProCreations/nib-4b-preview
- Seccion de uso y razonamiento de Nib: https://huggingface.co/ProCreations/nib-4b-preview#using-nib
- Modelo base original Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Estadisticas del autor en OpenModelStats: https://openmodelstats.com/owners/procreations
