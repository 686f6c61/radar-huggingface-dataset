# mlc-ai/LFM2.5-1.2B-Instruct-q4f32_1-MLC

## Resumen

LFM2.5-1.2B-Instruct-q4f32_1-MLC es la conversión al formato MLC del modelo LiquidAI/LFM2.5-1.2B-Instruct, publicada por el equipo de mlc-ai para su uso con WebLLM en el navegador. No se trata de un modelo nuevo, sino de un artefacto de despliegue: pesos cuantizados en `q4f32_1` (4 bits con acumulación en float32) empaquetados para el runtime MLC-LLM, con el objetivo de ejecutar generación de texto íntegramente en el cliente mediante WebGPU.

El modelo base es un transformer de 1.200 millones de parámetros desarrollado por Liquid AI, orientado a instrucciones y con una ventana de contexto declarada de 128.000 tokens en el paquete MLC (con chunk de prefill de 1.024 tokens). La variante `q4f32_1` tiene la particularidad de no requerir la extensión `shader-f16` de WebGPU, lo que amplía la compatibilidad con GPUs y navegadores que no la exponen.

Su relevancia actual es práctica: permite desplegar un LLM de tamaño pequeño-medio sin servidor, sin coste de inferencia por token y con la privacidad que implica no enviar datos a un backend. El repo ocupa 0,7 GB y está pensado para integrarse en aplicaciones web mediante WebLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LiquidAI LFM2.5-1.2B-Instruct); empaquetado para MLC-LLM |
| Parametros totales | 1.200 millones (1.2B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 128.000 tokens (ventana del paquete); WebLLM propone 4.096 por defecto para limitar memoria |
| Tipos de cuantizacion | q4f32_1 (4 bits, acumulacion float32); no requiere shader-f16 |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0), con limitacion de uso comercial en la seccion 5 |
| Formato de pesos | MLC (artefacto compilado para MLC-LLM/WebLLM); no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer de 1.2B parámetros de Liquid AI, ajustado para instrucciones (Instruct). La información proporcionada no detalla la composición del dataset de entrenamiento, el número de tokens, ni si hubo RLHF o DPO; esos datos deben consultarse en la model card upstream de LiquidAI/LFM2.5-1.2B-Instruct.

La innovación relevante de este artefacto es el pipeline de conversión y compilación: los pesos se convierten con `mlc_llm convert_weight --quantization q4f32_1`, se genera la configuración con plantilla de conversación `lfm2`, ventana de 128.000 y chunk de prefill de 1.024, y las librerías WebGPU se compilan por separado con revisiones fijadas (TVM `be03dc94b001`, MLC-LLM `5e824377af7f`). El resultado es un binario ejecutable en WebGPU con candidatos `v0_2_87` y runtime web `0.28.0-dev2`. La variante `q4f32_1` evita depender de `shader-f16`, lo que reduce requisitos de hardware en el navegador.

## Capacidades

- Generación de texto e instrucciones en el navegador mediante WebLLM sobre WebGPU.
- Conversación multi-turno con plantilla de chat `lfm2`.
- Contexto largo: ventana declarada de 128.000 tokens, con prefill por chunks de 1.024 tokens.
- Ejecución local en cliente, sin backend: los datos no salen del dispositivo.
- Compatibilidad con GPUs WebGPU que no exponen `shader-f16` gracias a la cuantización `q4f32_1`.
- Capacidades específicas del modelo base (código, matemáticas, tool calling, multilingüismo) no están detalladas en la información proporcionada; deben verificarse en la model card upstream.

## Casos de uso

- Asistentes embebidos en aplicaciones web: el modelo se carga con WebLLM y responde en el cliente, eliminando coste de servidor y latencia de red; adecuado para ayuda contextual dentro de la propia página.
- Procesamiento de documentos sensibles en local: resúmenes o extracción de información sobre textos que no deben salir del dispositivo, aprovechando la ejecución 100% en navegador.
- Demos y prototipos de producto: validar flujos conversacionales sin desplegar infraestructura de inferencia, con un paquete de 0,7 GB servible como asset estático.
- Herramientas educativas offline-first: tutores o generadores de ejercicios que funcionan tras la primera carga del modelo, sin conexión permanente a un backend.
- Extensiones de navegador y PWAs: generación de texto en aplicaciones instalables, con la ventana de contexto configurable según la memoria disponible (4.096 tokens por defecto en WebLLM).
- Privacidad por diseño en formularios y chats: clasificación o redacción de texto en el cliente antes de enviar nada a un servidor, útil en sectores regulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta conversión remite a la model card upstream de LiquidAI/LFM2.5-1.2B-Instruct para evaluaciones.

## Requisitos de hardware

- VRAM estimada: el repo pesa 0,7 GB; en ejecución WebGPU la memoria necesaria depende del contexto configurado (4.096 tokens por defecto en WebLLM; ventanas mayores incrementan el uso de memoria de forma notable).
- GPU: cualquier GPU con soporte WebGPU; la variante `q4f32_1` no exige `shader-f16`, lo que amplía la compatibilidad.
- Consumer GPU: sí, está diseñado para ejecutarse en GPUs de consumo a través del navegador; no se especifican modelos concretos en la información disponible.
- Despliegue: WebLLM (runtime web `0.28.0-dev2`, candidatos `v0_2_87`); el artefacto es específico de MLC-LLM y no está pensado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| LFM2.5-1.2B-Instruct-q4f32_1-MLC (este) | 1.2B | 128.000 (4.096 por defecto en WebLLM) | MLC/WebGPU | LFM Open License v1.0 | WebLLM en navegador |
| LiquidAI/LFM2.5-1.2B-Instruct (upstream) | 1.2B | no disponible en esta ficha | safetensors (presumible, no confirmado) | LFM Open License v1.0 | Servidor/local con frameworks estándar |
| Otros modelos MLC de ~1B en el hub de mlc-ai | no disponible | no disponible | MLC/WebGPU | variable | WebLLM |

La comparación con alternativas de la misma categoría (modelos pequeños ejecutables en navegador) no está disponible con datos verificables en la información proporcionada.

## Limitaciones y advertencias

- Licencia LFM Open License v1.0 con limitación de uso comercial en la sección 5: revisar antes de cualquier despliegue productivo.
- Es un artefacto de conversión, no un modelo original: las limitaciones del modelo base (sesgos, alucinaciones, cobertura idiomática) aplican íntegramente y no están documentadas aquí.
- Idiomas soportados no disponibles; no asumir multilingüismo sin verificar la model card upstream.
- El sampling por defecto de MLC es temperature 1.0, top_p 1.0 y repetition_penalty 1.0; Liquid AI recomienda temperature 0.1 y repetition_penalty 1.05, por lo que la configuración por defecto puede degradar la calidad.
- La ventana de 128.000 tokens es la del paquete, pero WebLLM propone 4.096 por defecto para limitar memoria; contextos largos pueden provocar fallos o caídas de rendimiento en GPUs modestas.
- Dependencia estricta de WebGPU y de revisiones concretas del runtime (`v0_2_87`, `0.28.0-dev2`): la compatibilidad futura no está garantizada.
- Riesgo de alucinación inherente a un modelo de 1.2B; no adecuado para tareas que exijan alta fiabilidad factual sin verificación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlc-ai/LFM2.5-1.2B-Instruct-q4f32_1-MLC
- Modelo base upstream: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Revisión del modelo base usada en la conversión: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct/tree/0f604ada3f766f9f257460c4c9f0b5d6f69d431b
- Documentación de WebLLM: https://webllm.mlc.ai/docs/
- Commit de TVM usado: https://github.com/akaashrp/tvm/commit/be03dc94b001269b88ae010d2ac352256be55579
- Commit de MLC-LLM usado: https://github.com/JCNTH/mlc-llm/commit/5e824377af7fc959d989ddc52dd44a55c7638f49
- Procedencia de librerías WebGPU: https://github.com/JCNTH/binary-mlc-llm-libs/blob/d30ec58c9b0b211a2626ab708a408c7bd59a8369/web-llm-models/v0_2_87/new-models-candidate-provenance.json
