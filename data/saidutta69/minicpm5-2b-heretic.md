# saidutta69/MiniCPM5-2B-heretic

## Resumen

MiniCPM5-2B-heretic es una variante "abliterated" (decensored) del modelo openbmb/MiniCPM5-2B, publicada por el usuario saidutta69 bajo el alias "RACER IS OP". Se ha generado con la herramienta Heretic v1.4.0, que aplica ablación direccional por capas sobre las proyecciones de salida de atención (attn.o_proj) y las down-projections del MLP (mlp.down_proj) para suprimir el comportamiento de rechazo sin recurrir a fine-tuning. El resultado es un modelo de 2.516.756.480 parámetros que conserva las capacidades del modelo base (uso de herramientas, generación de código, contexto largo y modo híbrido Think/No-Think) pero con los guardarraíles de rechazo prácticamente eliminados.

El modelo base MiniCPM5-2B pertenece a la familia MiniCPM5 de OpenBMB y está entrenado sobre un conjunto de datos propietario que incluye Ultra-FineWeb, UltraX-Preview, UltraData-Math, UltraData-Code, UltraData-SFT-2605, UltraData-SFT-Agent-2609 y UltraData-RL-2609. La variante heretic mantiene la licencia Apache 2.0 del original y se distribuye tanto en safetensors (para transformers) como en una escalera completa de 15 cuantizaciones GGUF (de Q2_K a F16), lo que la hace desplegable en GPUs de consumo y en CPU.

La relevancia actual del modelo reside en dos factores: por un lado, ofrece un caso de estudio reproducible sobre mecánicas de alineación y rechazo (el autor documenta los parámetros exactos de abliteración y una evaluación de rechazos de 99/100 a 4/100 con divergencia KL de 0.0646); por otro, proporciona una alternativa de 2B parámetros para agentes locales y flujos de trabajo donde el exceso de rechazo del modelo base resulta bloqueante, manteniendo el soporte de tool calling vía SGLang y el contexto largo característico de la familia MiniCPM5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia MiniCPM5), con modo híbrido Think / No-Think |
| Parametros totales | 2.516.756.480 (2,52 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base se etiqueta como long-context; no se especifica la cifra exacta) |
| Tipos de cuantizacion | GGUF: F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_1, Q4_0, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, IQ3_S, Q2_K (15 ficheros) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia MiniCPM5, con 2,52 mil millones de parámetros y soporte nativo de un modo de razonamiento híbrido que se activa o desactiva mediante el flag `enable_thinking` en la plantilla de chat. El modelo base fue entrenado por OpenBMB sobre una mezcla de datasets que incluye corpus web (Ultra-FineWeb, Ultra-FineWeb-L3, UltraX-Preview), datos matemáticos (UltraData-Math), datos de código (UltraData-Code) y datos de SFT y RL para agentes (UltraData-SFT-2605, UltraData-SFT-Agent-2609, UltraData-RL-2609). No se especifica en la información disponible el número total de tokens de entrenamiento ni la composición porcentual del dataset.

La innovación técnica de esta variante concreta es el proceso de abliteración aplicado con Heretic v1.4.0. En lugar de un fine-tuning sobre una persona "helpful", se calculan direcciones de rechazo por capa y se editan los pesos de `attn.o_proj` y `mlp.down_proj` con pesos máximos de 1,44 y 1,42 respectivamente (posiciones 28,24 y 28,73), pesos mínimos de 1,16 y 1,11 (distancias 13,17 y 20,52). Este enfoque preserva el resto de la red y, según el autor, mantiene las capacidades de tool-use, código y razonamiento del modelo original, con un coste medido de divergencia KL de 0,0646 frente al base.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento híbrido con modo Think (cadena de pensamiento explícita) y modo No-Think (respuesta directa), seleccionable por flag.
- Generación de código y resolución de problemas matemáticos, heredado del entrenamiento sobre UltraData-Code y UltraData-Math.
- Tool calling / function calling: emite llamadas en formato XML que el parser `minicpm5` de SGLang convierte a `tool_calls` compatibles con OpenAI.
- Soporte de agentes y razonamiento multi-paso, reforzado por el entrenamiento sobre UltraData-SFT-Agent-2609 y UltraData-RL-2609.
- Contexto largo (etiqueta long-context del modelo base; longitud exacta no disponible).
- Ejecución on-device y en edge: cuantizaciones GGUF desde 1,04 GB permiten inferencia en CPU, Apple Silicon y GPUs de 6-12 GB.
- Supresión del comportamiento de rechazo: 4 rechazos de cada 100 frente a 99 de cada 100 del modelo original, según la evaluación del autor.

## Casos de uso

- Agentes locales en hardware de consumo: con la cuantización Q4_K_M (1,56 GB) el modelo cabe en CPU o en GPUs de 6 GB, permitiendo desplegar un agente con tool calling en un portátil sin conexión a la nube.
- Automatización de atención al cliente con contexto largo: el modelo puede mantener conversaciones multi-turno extensas y ejecutar funciones (consultar pedidos, abrir tickets) mediante tool calling, con la ventaja de que no rechaza consultas legítimas por falsos positivos de seguridad.
- Generación de código en pipelines de CI/CD: integrado vía SGLang o vLLM, puede autocompletar y revisar código, y emitir llamadas a herramientas para consultar repositorios o ejecutar tests.
- Investigación sobre mecánicas de alineación y rechazo: al publicar los parámetros exactos de abliteración y las métricas de rechazo y KL, sirve como caso reproducible para estudiar cómo se codifica el comportamiento de rechazo en un transformer de 2B.
- Roleplay y escritura creativa sin restricciones: el modelo mantiene coherencia narrativa y contexto largo, adecuado para ficción interactiva o generación de diálogos donde el modelo base rechazaría escenarios con contenido sensible.
- Asistente de razonamiento en edge para dispositivos móviles o embebidos: el modo No-Think reduce latencia para consultas simples, mientras que el modo Think se reserva para problemas matemáticos o de planificación multi-paso.
- Traducción y procesamiento bilingüe inglés-chino: el modelo cubre ambos idiomas de forma nativa, útil para pipelines de localización o resumen de documentos en entornos con mezcla de idiomas.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados en la información disponible son los del proceso de abliteración, no benchmarks estándar (MMLU, HumanEval, GSM8K, etc.):

| Metrica | MiniCPM5-2B-heretic | openbmb/MiniCPM5-2B |
|---|---|---|
| Divergencia KL | 0,0646 | 0 (por definición) |
| Rechazos (sobre 100) | 4/100 | 99/100 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): 1,04 GB (Q2_K) a 5,04 GB (F16); añadir aproximadamente 1 GB adicional para el contexto según el autor.
- GPU recomendadas por el autor: RTX 3060 / 4070 / 5070 (12 GB) con Q8_0 (2,68 GB); RTX 4060 / 3070 (8 GB) con Q6_K (2,07 GB); GTX 1660 Super / 2060 / 3050 laptop (6 GB) con Q5_K_M (1,81 GB).
- CPU-only y Apple Silicon: Q4_K_M (1,56 GB) cabe en memoria del sistema.
- Cabe en GPU de consumo: sí, desde GPUs de 6 GB con cuantizaciones Q5_K_M o inferiores; en 8 GB y 12 GB con Q6_K y Q8_0 respectivamente.
- Opciones de despliegue: llama.cpp (`llama serve -hf saidutta69/MiniCPM5-2B-heretic`), Ollama, LM Studio, Jan, transformers, vLLM y SGLang (recomendado para tool calling por su parser `minicpm5`).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| MiniCPM5-2B-heretic | 2,52 B | no disponible (long-context) | Apache 2.0 | safetensors, GGUF (15 quants) | Variante abliterated; 4/100 rechazos; tool calling vía SGLang |
| openbmb/MiniCPM5-2B | 2,52 B | no disponible (long-context) | Apache 2.0 | safetensors, GGUF | Modelo base; 99/100 rechazos; mismas capacidades sin decensurar |
| Alternativas de 2-3B tipo Llama / Qwen | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada para establecer una comparación numérica |

La comparación más directa y verificable es con el propio modelo base, ya que comparten arquitectura, tamaño y licencia; la diferencia medible es la tasa de rechazo y la divergencia KL. Para alternativas de otros fabricantes no se dispone de datos en la información proporcionada.

## Limitaciones y advertencias

- La abliteración elimina los guardarraíles de rechazo: el modelo puede generar contenido que el modelo base rechazaría, incluyendo material sensible, lo que exige filtrado y moderación externos en producción.
- La divergencia KL de 0,0646 indica una desviación medible respecto al base; aunque el autor afirma que las capacidades se preservan, puede haber degradación sutil en tareas de instrucción o coherencia no capturada por la métrica de rechazos.
- Riesgo de alucinación inherente a un modelo de 2B parámetros; no debe usarse como fuente de verdad sin verificación.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está evaluado y probablemente sea inferior.
- La longitud exacta de contexto no está documentada en la información disponible, lo que dificulta dimensionar despliegues con ventanas largas.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo ni sobre el cumplimiento normativo del contenido generado; la responsabilidad recae en el desplegador.
- El repositorio incluye una imagen externa alojada en un dominio de terceros (`photu.kashyalabanavli.site`); conviene no cargarla en entornos controlados.
- No se han publicado benchmarks estándar que permitan validar las capacidades de código, matemáticas o tool calling de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saidutta69/MiniCPM5-2B-heretic
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Licencia del modelo base: https://huggingface.co/openbmb/MiniCPM5-2B/blob/main/LICENSE
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Artículo sobre abliteración de mlabonne: https://huggingface.co/blog/mlabonne/abliteration
- llama.cpp: https://github.com/ggml-org/llama.cpp
