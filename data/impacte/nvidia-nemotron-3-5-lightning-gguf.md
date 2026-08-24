# impacte/NVIDIA-Nemotron-3.5-Lightning-GGUF

## Resumen

NVIDIA-Nemotron-3.5-Lightning-30B-A3B es un modelo de lenguaje de 30B parametros en arquitectura de mezcla de expertos (MoE) con aproximadamente 3B parametros activos por token, desarrollado por NVIDIA para la capa de ejecucion de agentes de IA siempre activos. Este modelo destaca por su baja latencia y alto rendimiento en tareas especializadas de agente, como tool calling y razonamiento multi-paso, manteniendo una ventana de contexto nativa de 262.144 tokens. Su arquitectura hibrida combina capas Mamba-2, MoE y atencion selectiva, lo que reduce drasticamente el tamano de la KV cache y permite contextos muy largos con un coste computacional reducido.

La version GGUF que nos ocupa, publicada por impacte, es una conversion del checkpoint BF16 original a cuantizacion IQ4_XS con calibracion imatrix, optimizada para su uso con llama.cpp y motores compatibles. Esta cuantizacion, con un tamano de 18,7 GB, cabe en GPUs de 24 GB y permite ejecutar el modelo completo en hardware de consumo, incluyendo la ventana de contexto de 256K con una KV cache cuantizada. El modelo es relevante ahora porque ofrece capacidades de razonamiento y uso de herramientas comparables a modelos mucho mas grandes, con un coste de inferencia muy inferior, lo que lo convierte en una opcion atractiva para despliegues de agentes en produccion y para equipos que buscan un equilibrio entre capacidad y requisitos de hardware.

El modelo base se publico bajo la licencia OpenMDW-1.1, que permite uso comercial con ciertas restricciones. La conversion GGUF mantiene las capacidades del modelo original sin fine-tuning adicional. Su entrenamiento, con fecha de corte de datos de mayo de 2026, incluye un modo de razonamiento explicito (thinking mode) y soporte nativo de tool calling en formato XML, lo que lo posiciona como una herramienta solida para automatizacion de flujos de trabajo complejos y agentes conversacionales en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NemotronHForCausalLM (nemotron_h_moe) — hibrida Mamba-2 + MoE + Attention con Multi-Token Prediction (MTP) |
| Parametros totales | 32.913.266.240 (~30B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 262.144 tokens (256K nativos, hasta ~1M con rope scaling) |
| Tipos de cuantizacion | IQ4_XS (GGUF, imatrix) |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | OpenMDW-1.1 (modelo base) |
| Formato de pesos | GGUF (IQ4_XS) |

## Arquitectura y entrenamiento

El modelo base NVIDIA-Nemotron-3.5-Lightning-30B-A3B emplea una arquitectura hibrida que intercala capas de Mamba-2 (state space model), capas MoE y un numero reducido de capas de atencion (aproximadamente 6 de las 52 capas totales). Esta combinacion permite mantener una KV cache extremadamente pequena incluso con contextos de 262.144 tokens, ya que las capas Mamba-2 no requieren cache de atencion y las capas MoE activan solo 6 de los 128 expertos enrutados (mas un experto compartido) por token. El modelo incluye Multi-Token Prediction (MTP), que predice varios tokens a la vez, y soporta decodificacion especulativa para acelerar la generacion.

El entrenamiento se realizo con datos de corte en mayo de 2026, e incluye una fase de post-entrenamiento orientada a tareas de agente, con refuerzo (RLHF) y ajuste especifico para tool calling y razonamiento multi-paso. NVIDIA publico checkpoints en BF16 y NVFP4, y el modelo se libero junto con metodos de decodificacion especulativa para reducir la latencia en produccion. La version GGUF de impacte se convirtio con llama.cpp (convert_hf_to_gguf.py en bf16) y se cuantizo a IQ4_XS con calibracion imatrix, preservando las capacidades del modelo base sin fine-tuning adicional.

## Capacidades

- Generacion de texto y chat conversacional en seis idiomas: ingles, espanol, frances, aleman, italiano y japones.
- Razonamiento explicito con modo "thinking": genera bloques de pensamiento intermedios delimitados por etiquetas ` thinking` para resolver problemas complejos.
- Soporte nativo de tool calling mediante un formato XML propio (`<tool_call>`), que permite integrar funciones externas en flujos de agente.
- Capacidades de agente y multi-step reasoning: puede planificar y ejecutar secuencias de acciones con herramientas, manteniendo el estado de la conversacion.
- Razonamiento matematico y logico, adecuado para tareas de analisis y resolucion de problemas estructurados.
- Generacion de codigo en multiples lenguajes, con capacidad de depuracion y explicacion de fragmentos.
- Comprension de documentos largos: con 256K tokens de contexto nativo, puede procesar libros completos, codigos fuente extensos o transcripciones largas en una sola pasada.

## Casos de uso

- Agentes autonomos de soporte tecnico: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 256K tokens) para mantener el historial completo de una sesion de ayuda, y usar tool calling para consultar bases de conocimiento, abrir tickets o ejecutar comandos de diagnostico.
- Generacion de codigo en produccion: con soporte de tool calling y razonamiento multi-paso, se puede integrar en pipelines de CI/CD para generar tests, revisar pull requests o auto-completar funciones en repositorios grandes.
- Analisis de documentos legales o financieros: la ventana de contexto de 256K permite procesar contratos completos, informes anuales o expedientes largos de una sola pasada, resumiendo clausulas o detectando anomalias.
- Asistente de investigacion academica: el modo de razonamiento y el soporte de contextos largos permiten analizar articulos extensos, comparar metodologias y generar resumenes estructurados con citas.
- Automatizacion de atencion al cliente multilingue: soporta seis idiomas y puede gestionar interacciones en varios idiomas en el mismo hilo, con tool calling para consultar sistemas CRM o gestionar devoluciones.
- Despliegue de asistentes locales de codigo en hardware de consumo: con la cuantizacion IQ4_XS y 24 GB de VRAM, se puede ejecutar localmente en una estacion de trabajo con una RTX 4090 o dual GPU, ofreciendo asistencia de codigo sin dependencia de la nube.
- Simulacion de agentes de navegacion web: su capacidad de razonamiento y tool calling permite construir agentes que interactuen con APIs y navegadores para tareas como monitorizacion de precios o recopilacion de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La informacion proporcionada no incluye datos numericos de evaluaciones estandar como MMLU, HumanEval o GSM8K para este modelo. Los articulos de NVIDIA destacan que el modelo ofrece "fast accurate specialized task execution" y hasta 4x de aceleracion con decodificacion especulativa, pero no se han facilitado cifras concretas de rendimiento en benchmarks publicos.

## Requisitos de hardware

- VRAM estimada para inferencia: 18,7 GB para el archivo GGUF IQ4_XS; con una KV cache cuantizada q4_0 y la ventana completa de 262.144 tokens, el conjunto cabe en una GPU de 24 GB.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB, H100, o configuraciones duales de 16 GB + 8 GB (por ejemplo, RTX 4080 + RTX 4060) para el modelo completo.
- En consumer GPU: si cabe en GPUs de gama alta con 24 GB de VRAM. Con cuantizaciones mas agresivas o contexto reducido, podria caber en 16 GB, pero no es lo recomendado por el autor.
- Opciones de despliegue: llama.cpp (llama-server), Ollama (con tag pre-construido `oamazonasgabriel/nemotron-3.5-lightning:iq4-xs-256k-24gbGPU`), llama-cpp-python, y cualquier motor compatible con GGUF como LM Studio o text-generation-webui.
- Latencia y throughput: no disponibles en la informacion proporcionada, pero el modelo MoE con 3B activos y decodificacion especulativa esta disenado para baja latencia en tareas de agente.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Lightning-30B-A3B (este) | ~30B | ~3B | 262.144 | OpenMDW-1.1 | GGUF (IQ4_XS) |
| NVIDIA-Nemotron-3.5-Mini-12B (referencia) | ~12B | ~12B | 128K | OpenMDW-1.1 | BF16 / NVFP4 |
| NVIDIA-Nemotron-3.5-Ultra-200B (referencia) | ~200B | no disponible | 262.144 | OpenMDW-1.1 | BF16 / NVFP4 |
| Qwen3-30B-A3B-Instruct (alternativa MoE) | ~30B | ~3B | 32K | Apache 2.0 | GGUF / safetensors |

La comparativa muestra que el modelo de NVIDIA ofrece una ventana de contexto muy superior a la de alternativas como Qwen3-30B-A3B (32K), y una licencia mas restrictiva (OpenMDW-1.1) frente a Apache 2.0. En la familia Nemotron, Lightning se posiciona como la variante de menor latencia para agentes, frente a Mini (monolitica) y Ultra (mayor capacidad pero mayor coste de inferencia).

## Limitaciones y advertencias

- Sesgos conocidos: no se han publicado evaluaciones de sesgos en la informacion disponible; se recomienda auditar el modelo antes de usarlo en aplicaciones sensibles.
- Riesgo de alucinacion: como todo LLM, puede generar informacion incorrecta o inventada, especialmente en tareas abiertas. El modo de razonamiento puede mitigar parcialmente este riesgo en tareas estructuradas.
- Limitaciones de contexto: aunque soporta 262K tokens nativos, la calidad de la atencion puede degradarse en los extremos del contexto; se recomienda validar el rendimiento con contextos muy largos.
- Restricciones de licencia: la licencia OpenMDW-1.1 impone condiciones para uso comercial. Es imprescindible revisar los terminos completos en https://openmdw.ai/license/1-1/ antes de cualquier despliegue en produccion.
- Cuantizacion: la version IQ4_XS sacrifica precision frente a cuantizaciones mas altas (Q6_K, Q8_0). Para tareas que requieran maxima fidelidad numerica, se recomienda usar el checkpoint BF16 o NVFP4 original.
- Idiomas: aunque el modelo soporta seis idiomas, su rendimiento en espanol, frances, aleman, italiano y japones puede ser inferior al ingles, especialmente en tareas de razonamiento complejo.
- Requisitos de hardware: aunque cabe en 24 GB, el uso de la ventana completa de 256K con KV cache cuantizada puede reducir la calidad de la atencion; para contextos muy largos se recomienda evaluar el impacto.

## Enlaces

- Repositorio HuggingFace de la conversion GGUF: https://huggingface.co/impacte/NVIDIA-Nemotron-3.5-Lightning-GGUF
- Modelo base BF16 en HuggingFace: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Modelo base NVFP4 en HuggingFace: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Blog de NVIDIA sobre Nemotron 3.5 Lightning: https://developer.nvidia.com/blog/nvidia-nemotron-3-5-lightning-delivers-fast-accurate-specialized-task-execution-for-long-running-agents/
- Model card en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b/modelcard
- Pagina de despliegue en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Tag de Ollama: https://ollama.com/oamazonasgabriel/nemotron-3.5-lightning
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
