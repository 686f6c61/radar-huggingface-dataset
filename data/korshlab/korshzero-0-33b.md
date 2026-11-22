# KorshLAB/KorshZero-0.33B

## Resumen

KorshZero-0.33B es un modelo de lenguaje decoder-only de 325.085.824 parámetros (aproximadamente 0,33 mil millones) desarrollado por KorshLAB y publicado bajo licencia Apache 2.0. Según la model card, se ha inicializado y entrenado al 100 % desde cero, sin destilación de APIs corporativas, con el objetivo declarado de ofrecer "soberanía tecnológica": pesos propios, inferencia local y ausencia de llamadas externas. Está especializado en ingeniería de software moderna, diseño de interfaces (Bento grid, glassmorphism, Tailwind CSS) y protocolos de agentes autónomos con tool calling.

La arquitectura es un transformer decoder-only de 33 capas con activación SwiGLU, tamaño oculto de 896, FFN de 2816, 14 cabezas de consulta y 2 de clave-valor (Grouped-Query Attention), dimensión de cabeza 64, normalización RMSNorm, codificación posicional RoPE (theta=10000,0), vocabulario de 16.384 tokens con BPE a nivel de byte y embeddings atados. La ventana de contexto es de 2.048 tokens, una cifra reducida en comparación con los estándares actuales.

Su relevancia radica en el nicho de edge AI: el tamaño del repositorio es de 3,5 GB y las cuantizaciones GGUF van de 173 MB (Q2_K) a 621 MB (F16), lo que permite ejecutarlo en Raspberry Pi 5, portátiles ultraligeros y micro-servidores. El autor declara 448 tokens/s en CUDA y un time-to-first-token inferior a 15 ms en hardware de consumo, además de soporte nativo de tokens de agente (`<|skill|>`, `<|tool_call|>`, `<|tool_result|>`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con SwiGLU, GQA y RMSNorm |
| Parametros totales | 325.085.824 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K (GGUF); bfloat16 en safetensors |
| Idiomas soportados | Ingles y espanol |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

Especificaciones adicionales declaradas por el autor: tamano oculto 896, FFN intermedio 2816, 33 capas, 14 cabezas de consulta y 2 de clave-valor, dimension de cabeza 64, RMSNorm con epsilon 1e-5, RoPE con theta 10000,0, vocabulario de 16.384 tokens (BPE a nivel de byte) y embeddings de entrada/salida atados.

## Arquitectura y entrenamiento

El modelo sigue una topologia de transformer decoder-only clasica con mejoras de eficiencia: activacion SwiGLU en la FFN, Grouped-Query Attention (14 cabezas de consulta frente a 2 de clave-valor) para reducir el coste de la cache KV, RMSNorm como normalizacion y RoPE como codificacion posicional. Los embeddings de entrada y salida estan atados, lo que reduce el numero de parametros efectivos en la capa de proyeccion final.

Segun la model card, el entrenamiento se realizo integramente desde cero ("100% Trained From Scratch", "Zero Corporate Distillation"), sin destilacion de modelos propietarios. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste por instrucciones mas alla de la denominacion "instruct" de los ficheros GGUF. El autor declara especializacion de dominio en ingenieria de software, diseno de UI (Bento grid, glassmorphism, Tailwind CSS en modo oscuro), iconos SVG vectoriales, accesibilidad WCAG AAA y protocolos de agentes con tokens dedicados de skill, tool call y tool result. No se detalla la innovacion tecnica del entrenamiento mas alla de la inicializacion desde cero.

## Capacidades

- Generacion de texto y codigo especializado en desarrollo web frontend: Tailwind CSS, estructuras Bento grid, glassmorphism y tokens de diseno.
- Generacion de iconos SVG vectoriales, con la restriccion declarada de evitar emojis.
- Soporte nativo de tool calling mediante tokens dedicados: `<|tool_call|>`, `<|tool_result|>` y `<|skill|>`.
- Capacidades de agente autonomo y razonamiento multi-paso mediante bloques de ejecucion preentrenados.
- Cumplimiento de directrices de accesibilidad WCAG AAA segun la model card.
- Multilingue limitado a ingles y espanol.
- Formato de prompt con tokens especiales de rol: `<|bos|>`, `<|system|>`, `<|user|>`, `<|assistant|>`, `<|eos|>`.
- No se declaran capacidades de vision, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Generacion de componentes frontend en produccion: el modelo produce directamente codigo Tailwind CSS con modo oscuro (`darkMode: 'class'`), estructuras Bento grid y estilos glassmorphism, adecuado para scaffolds rapidos de interfaces en pipelines de CI/CD o generadores de componentes.
- Asistentes de diseno UI/UX en local: al ejecutarse en 173-331 MB en GGUF, puede desplegarse en el portatil del disenador o en un micro-servidor sin conexion a APIs externas, generando propuestas de maquetacion y tokens de diseno con latencia inferior a 15 ms hasta el primer token.
- Agentes autonomos de proposito especifico: los tokens `<|tool_call|>`, `<|tool_result|>` y `<|skill|>` permiten integrarlo en bucles de agente que invocan herramientas locales (lectura de ficheros, ejecucion de comandos, consultas a APIs internas) con el modelo como planificador ligero.
- Inferencia en edge y dispositivos restringidos: con cuantizacion Q4_K_M (221 MB, ~280 MiB de RAM) cabe en Raspberry Pi 5, moviles y clusters edge, util para clasificacion o generacion de texto en entornos sin conectividad.
- Procesamiento por lotes de bajo coste: el throughput declarado de 448 tokens/s en CUDA y 6.600 tokens/s de evaluacion de prompt permite tareas de generacion masiva en un solo GPU de consumo, como resumenes cortos o etiquetado de codigo.
- Prototipado de soberania de datos: bajo Apache 2.0 y sin telemetria, encaja en entornos con requisitos de privacidad estrictos (sanidad, sector publico, industria) donde no se permite enviar datos a APIs de terceros.
- Educacion e investigacion: su tamano y entrenamiento desde cero lo hacen util como banco de pruebas para estudiar el comportamiento de modelos pequenos en tareas de codigo y agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente declara metricas de inferencia: 448 tokens/s en CUDA, mas de 6.600 tokens/s de evaluacion de prompt y un time-to-first-token inferior a 15 ms en hardware de consumo estandar, sin especificar el hardware exacto ni el metodo de medida.

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion: Q2_K ~200 MiB, Q3_K_M ~240 MiB, Q4_K_M ~280 MiB, Q5_K_M ~320 MiB, Q6_K ~400 MiB, Q8_0 ~450 MiB, F16 ~800 MiB.
- Cabe en GPU de consumo: cualquier GPU con 1 GB o mas de VRAM (GTX 1050 Ti, RTX 3050, RTX 4060, RTX 4090) ejecuta las cuantizaciones Q4-Q8 con holgura; incluso puede correr en CPU.
- GPU de centro de datos (A100, H100) no son necesarias; el modelo esta disenado para edge y hardware de consumo.
- Despliegue: llama.cpp (`llama-cli`), Ollama, transformers con `AutoModelForCausalLM`, text-generation-inference (etiqueta `text-generation-inference` en el repo) y endpoints compatibles (`endpoints_compatible`).
- Latencia y throughput declarados por el autor: 448 tokens/s en CUDA, mas de 6.600 tokens/s en evaluacion de prompt y TTFT inferior a 15 ms; no se especifica la GPU utilizada en la medicion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| KorshZero-0.33B | 325 M | 2.048 | Apache 2.0 | safetensors, GGUF | Entrenado desde cero, especializado en frontend y agentes |
| Qwen2.5-0.5B | ~494 M | 32.768 | Apache 2.0 | safetensors, GGUF | Mayor contexto y ecosistema maduro; no especializado en UI |
| SmolLM2-360M | ~362 M | 8.192 | Apache 2.0 | safetensors, GGUF | Contexto mayor; entrenamiento generalista |
| Llama-3.2-1B | ~1,24 B | 131.072 | Llama 3.2 Community | safetensors, GGUF | Mucho mayor contexto y parametros; licencia con restricciones |

Datos de los modelos comparables segun informacion publica general; no se dispone de benchmarks comparativos directos con KorshZero-0.33B en la informacion proporcionada.

## Limitaciones y advertencias

- Ventana de contexto muy reducida (2.048 tokens): insuficiente para conversaciones multi-turno largas, analisis de repositorios completos o documentos extensos.
- Solo soporta ingles y espanol; no hay cobertura multilingue declarada mas alla de estos dos idiomas.
- Modelo de 325 M de parametros: capacidad de razonamiento y conocimiento factual limitada en comparacion con modelos de 1 B o superiores; riesgo elevado de alucinacion en dominios fuera de su especializacion.
- No se han publicado benchmarks independientes ni evaluaciones de calidad; las metricas de rendimiento son declaraciones del autor sin verificacion externa.
- No se detalla la composicion del dataset de entrenamiento, lo que impide evaluar sesgos conocidos ni la calidad de los datos.
- La especializacion en frontend y agentes puede reducir el rendimiento en tareas generales de texto, matematicas o codigo no web.
- Licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero el autor no ofrece garantias sobre el modelo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: ecosistema y validacion comunitaria inexistentes, con el riesgo de soporte y mantenimiento que ello implica.
- Fecha de creacion del repositorio: 2026-11-22, lo que indica un modelo muy reciente y sin historial de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KorshLAB/KorshZero-0.33B
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- No se han encontrado en la informacion disponible papers, blogs, repositorios adicionales ni demos del modelo.
