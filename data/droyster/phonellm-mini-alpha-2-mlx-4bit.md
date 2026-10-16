# droyster/phonellm-mini-alpha-2-mlx-4bit

## Resumen
PhoneLLM Mini Alpha 2 en su variante MLX 4-bit es una conversión comunitaria, no oficial, del modelo pipecat-ai/phonellm-mini-alpha-2, orientado a agentes de voz y a llamada a herramientas. El modelo subyacente deriva de NVIDIA Nemotron 3 Nano 30B-A3B, una arquitectura híbrida de tipo mixture-of-experts (MoE) con atención y componentes de espacio de estados (Mamba). Esta conversión concreta ha sido realizada por el usuario droyster y publica los pesos en formato MLX cuantizados a 4 bits con grupo de tamaño 64, manteniendo ciertas capas críticas en BF16.

El problema que resuelve es permitir la ejecución local de un modelo de este tamaño en Apple Silicon con un consumo de memoria contenido (unos 20.5 GB de asignación pico de MLX según las mediciones del autor) y un throughput de aproximadamente 77 tokens por segundo en un M5 Pro de 64 GB. Al conservar BF16 en la cabeza de salida, todas las proyecciones de atención, determinadas proyecciones Mamba y las capas de convolución, la conversión busca preservar la calidad en las partes más sensibles del modelo mientras comprime el resto.

Es relevante porque demuestra la viabilidad de servir un MoE de 31.577.935.872 parámetros en hardware de consumo de Apple, con soporte de tool calling y un servidor compatible con la API de OpenAI. Se trata de un artefacto experimental: el autor advierte explícitamente de que no es una release oficial de Pipecat y de que la optimalidad del esquema de cuantización no está establecida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron H hibrida (transformer + componentes Mamba/SSM), mixture-of-experts (MoE) |
| Parametros totales | 31.577.935.872 |
| Parametros activos | no disponible (el nombre del modelo base es 30B-A3B, lo que sugiere ~3B activos, pero no se confirma en la informacion proporcionada) |
| Longitud de contexto | no disponible de forma exacta (el limite publicitado upstream se mantiene en la configuracion; la conversion solo se probo con prompts de hasta 8K tokens) |
| Tipos de cuantizacion | MLX affine 4-bit, group size 64, con 61 exclusiones explicitas en BF16 (incluidas embeddings, cabeza de salida, proyecciones de atencion, proyecciones Mamba seleccionadas y convoluciones); 126 modulos cuantizados |
| Idiomas soportados | en (ingles) |
| Licencia | BSD-2-Clause |
| Formato de pesos | safetensors (cuatro shards, 19,32 GB en total), libreria MLX |

## Arquitectura y entrenamiento
El modelo base pertenece a la familia NVIDIA Nemotron 3 Nano, identificada en las etiquetas como nemotron_h, una arquitectura hibrida que combina mecanismos de atencion con capas de espacio de estados (estilo Mamba) y una estructura mixture-of-experts. El repositorio no documenta el proceso de entrenamiento del modelo original: no se especifican el numero de tokens, la composicion del dataset, ni si hubo fases de RLHF, DPO u otras tecnicas de alineamiento. Toda esa informacion corresponderia a la ficha oficial de pipecat-ai/phonellm-mini-alpha-2 y no se incluye aqui.

En cuanto a la innovacion tecnica de esta conversion, destaca el esquema de cuantizacion de precision mixta. Partiendo de los pesos originales en BF16, MLX calcula nuevas escalas afines y cuantiza 126 modulos a 4 bits, mientras que 61 modulos se excluyen explicitamente y permanecen en BF16. La politica de seleccion de capas sigue las exclusiones BF16 de la receta NVFP4 oficial de Pipecat (cabeza de salida, proyecciones de atencion, proyecciones Mamba seleccionadas y capas de convolucion). Los parametros de router y de espacio de estados conservan su tratamiento nativo en MLX-LM. El autor aclara que la conversion no reutiliza los pesos empaquetados, la calibracion ni los resultados de benchmark de NVFP4, y que las exclusiones son un punto de partida conservador cuya optimalidad para cuantizacion afi­n de MLX no esta demostrada. La precision media de almacenamiento es de 4,896 bits por parametro original.

## Capacidades
- Generacion de texto y conversacion multi-turno.
- Tool calling / function calling en formato compatible con el estilo de Qwen3-Coder, con salida de llamadas estructuradas (la ejecucion de las herramientas requiere una aplicacion externa).
- Uso como componente de texto dentro de un pipeline de agente de voz (el reconocimiento y la sintesis de voz son componentes separados).
- Modo thinking controlable mediante el parametro enable_thinking (el autor recomienda desactivarlo explicitamente).
- Respuesta a resultados de herramientas simulados.
- Streaming a traves de una API compatible con OpenAI.
- Capacidades multilingues: solo ingles.
- No se documentan capacidades de vision ni de audio integradas en el modelo.

## Casos de uso
- Agente de voz local: el modelo se integra como motor de texto de un pipeline de voz, gestionando conversaciones multi-turno por encima de los 8K tokens probados y respondiendo en ingles con baja latencia.
- Asistente personal en Apple Silicon: ejecutable en un Mac con memoria unificada de 64 GB, permite asistentes privados sin enviar datos a la nube y con unos 20.5 GB de asignacion pico.
- Automatizacion con herramientas: mediante el formato de tool calling compatible con Qwen3-Coder, se pueden orquestar llamadas a APIs externas (calendario, correo, busqueda) desde una aplicacion que ejecute las funciones devueltas.
- Prototipado de agentes multi-paso: el soporte de respuestas a resultados de herramientas simulados permite construir y depurar flujos de razonamiento por pasos antes de conectar servicios reales.
- Servicio local compatible con OpenAI: con `python -m mlx_lm server` se levanta un endpoint en localhost que se puede consumir desde clientes que hablen la API de OpenAI, util para pruebas de integracion.
- Chat con contexto largo moderado: con un prefill de 8.192 tokens en 4,31 s y respuestas en 0,17 s cuando la cache de prefijo se reutiliza, resulta adecuado para aplicaciones con contexto repetido (por ejemplo, notas de reunion fijas).
- Evaluacion de tecnicas de cuantizacion: como artefacto experimental, sirve para comparar el impacto de la cuantizacion MLX 4-bit con exclusiones BF16 frente a otras recetas (por ejemplo, NVFP4).

## Benchmarks y rendimiento
El autor menciona que se puntuo una muestra fija de 100 casos de datos publicos de BFCL V4 con las funciones AST de comprobacion de Python fijadas de upstream, pero la informacion proporcionada se interrumpe y no incluye los resultados numericos. No se dispone por tanto de cifras de BFCL V4 ni de otros benchmarks (MMLU, HumanEval, GSM8K, etc.).

No se han publicado resultados de benchmarks completos en la informacion disponible.

Si se aportan las siguientes mediciones locales declaradas por el autor, obtenidas el 15 de octubre de 2026 en un Apple M5 Pro con 64 GB de memoria unificada:

| Metrica | Valor |
|---|---|
| Velocidad de generacion | 77,2 tokens/s (sobre 63 tokens de salida) |
| Asignacion pico de MLX | 20,50 GB |
| Prefill 2.048 tokens (prompt nuevo) | 1,14 s |
| Prefill 4.096 tokens (prompt nuevo) | 2,05 s |
| Prefill 8.192 tokens (prompt nuevo) | 4,31 s |
| Seguimiento con prefijo cacheado (2.048) | 0,14 s |
| Seguimiento con prefijo cacheado (4.096) | 0,15 s |
| Seguimiento con prefijo cacheado (8.192) | 0,17 s |

Estas cifras excluyen la carga del modelo, la transcripcion, la sintesis de voz y la ejecucion de herramientas.

## Requisitos de hardware
- Memoria: el autor mide una asignacion pico de MLX de 20,50 GB (no equivale al RSS total del proceso ni al uso total de memoria del Mac). Se recomienda al menos 32 GB de memoria unificada y, para trabajar con comodidad junto al resto del pipeline, 64 GB.
- Hardware probado: Apple M5 Pro con 64 GB de memoria unificada.
- GPU compatibles: al ser un artefacto MLX, esta pensado para Apple Silicon (serie M). No se documenta compatibilidad con GPU NVIDIA o AMD en esta conversion.
- Cabe en GPU de consumo: si, en equipos Apple Silicon de gama alta con memoria unificada suficiente; no se aportan datos para GPU de consumo x86 (RTX 4090, etc.) porque el formato es MLX.
- Opciones de despliegue: MLX-LM (version probada 0.32.1) con MLX 0.32.4 y Transformers 5.20.0; servidor integrado `python -m mlx_lm server` con API compatible con OpenAI, prefill step size 2048, prompt-concurrency 1, decode-concurrency 1 y prompt-cache-size 2. No se valida con vLLM, llama.cpp, Ollama ni TGI, ya que los pesos estan en formato MLX y no en GGUF.
- Latencia y throughput: 77,2 tokens/s de generacion y tiempos de prefill de 1,14 s (2K), 2,05 s (4K) y 4,31 s (8K); con cache de prefijo, entre 0,14 s y 0,17 s para seguimientos.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| droyster/phonellm-mini-alpha-2-mlx-4bit | 31.577.935.872 | no disponible (probado hasta 8K) | MLX affine 4-bit, group 64 | BSD-2-Clause | MLX (safetensors, sharded) |
| pipecat-ai/phonellm-mini-alpha-2 (modelo base) | no disponible en la informacion proporcionada | no disponible | BF16 | no disponible | HuggingFace |
| pipecat-ai/phonellm-mini-alpha-2-nvfp4 | no disponible en la informacion proporcionada | no disponible | NVFP4 | no disponible | HuggingFace |

No se dispone de datos suficientes sobre otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias
- Artefacto experimental y no oficial: el autor indica expresamente que no es una release de Pipecat y que la compatibilidad con otras versiones de MLX o aplicaciones de terceros no esta validada.
- La optimalidad del conjunto de exclusiones BF16 para cuantizacion afi­n de MLX no esta establecida.
- Idioma: el modelo solo esta etiquetado para ingles.
- Contexto: aunque la configuracion conserva el limite publicitado upstream, la conversion solo se probo con prompts de hasta 8K tokens; no hay validacion por encima de ese umbral.
- Modo thinking: MLX-LM 0.32.1 puede activar el modo thinking al reconocer los marcadores; el autor recomienda fijar explicitamente enable_thinking=False y temperatura cero, lo que requiere atencion en la integracion.
- Tool calling: el modelo devuelve llamadas estructuradas, pero la ejecucion real de las herramientas debe implementarla una aplicacion externa; no se ejecutaron herramientas reales en las pruebas.
- Riesgo de alucinacion: no se documentan tasas de alucinacion ni evaluaciones de sesgo para esta conversion.
- Sesgos conocidos: no disponible.
- Uso comercial: la licencia BSD-2-Clause es permisiva, pero al derivar de un modelo base con condiciones propias conviene revisar la licencia del modelo original de pipecat-ai antes de un despliegue comercial.
- Despliegue: unicamente en el ecosistema MLX/Apple Silicon; no hay pesos GGUF y no hay soporte validado en vLLM, llama.cpp u otros motores.
- El repositorio no tiene descargas ni likes y fue creado en octubre de 2026, por lo que su madurez y mantenimiento son inciertos.

## Enlaces
- HuggingFace (esta conversion): https://huggingface.co/droyster/phonellm-mini-alpha-2-mlx-4bit
- Modelo base: https://huggingface.co/pipecat-ai/phonellm-mini-alpha-2
- Receta NVFP4 oficial de referencia (config de cuantizacion): https://huggingface.co/pipecat-ai/phonellm-mini-alpha-2-nvfp4/blob/cdc6db16f3e323168b8c5052397643531cecc958/hf_quant_config.json
