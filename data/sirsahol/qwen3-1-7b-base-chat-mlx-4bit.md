# SirSahOl/Qwen3-1.7B-Base-chat-mlx-4bit

## Resumen

SirSahOl/Qwen3-1.7B-Base-chat-mlx-4bit es una conversion a 4 bits en formato MLX del modelo Qwen/Qwen3-1.7B-Base, publicada por el usuario SirSahOl. No se trata de un modelo entrenado desde cero, sino de un artefacto de cuantizacion orientado a inferencia nativa en GPU de Apple Silicon (chips de la serie M). El repositorio ocupa aproximadamente 1,0 GB y contiene 1.720.574.976 parametros en safetensors, con una media declarada de 4,50 bits por peso.

El modelo resuelve un problema muy concreto: ejecutar un modelo de la familia Qwen3 de 1,7 B en equipos Apple sin GPU dedicada, con una huella de memoria activa de unos 1,3 GB y velocidades de decodificacion estimadas entre 117 y 351 tokens por segundo segun el tier de chip (base, Pro, Max, Ultra). Mantiene la ventana de contexto nativa de 32.768 tokens, extensible hasta 131.072 con YaRN.

Su relevancia es doble. Por un lado, es una de las pocas conversiones MLX 4-bit publicas especificamente de la variante 1.7B de Qwen3, lo que la hace util para desarrollo local en Mac. Por otro lado, el propio autor publica variantes en 8 y 16 bits del mismo modelo, lo que permite comparar el impacto de la cuantizacion sobre un mismo checkpoint. Conviene senalar que el autor etiqueta el repositorio como "conversational" y anade plantilla de chat, pero el modelo de origen es la version Base, no una version instruct, un punto critico que se detalla en las limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer denso, decoder-only) |
| Parametros totales | 1.720.574.976 (aprox. 1,72 B) segun safetensors |
| Longitud de contexto | 32.768 tokens nativos; extensible a 131.072 con YaRN |
| Tipos de cuantizacion | 4-bit MLX (media declarada de 4,50 bits por peso); el autor publica tambien variantes 8-bit y 16-bit |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx-lm) |
| Modelo base | Qwen/Qwen3-1.7B-Base |
| Framework de inferencia | MLX (Apple), libreria `mlx-lm` |
| Huella de VRAM activa | aprox. 1,3 GB |
| Memoria unificada minima recomendada | 8 GB |
| Tamano del repositorio | aprox. 1,0 GB |
| Descargas / likes | 16 / 0 |
| Fecha de creacion registrada | 2026-09-22 |

## Arquitectura y entrenamiento

El modelo no introduce arquitectura propia: es una cuantizacion del checkpoint Qwen/Qwen3-1.7B-Base, cuya clase de implementacion es Qwen3ForCausalLM, un transformer decoder-only denso. Al ser un artefacto de conversion, no hay entrenamiento adicional ni proceso de RLHF o DPO documentado en la informacion disponible; el autor solo describe el pipeline de conversion a MLX con cuantizacion de 4 bits. El repositorio incluye ademas una plantilla de chat y tokens de control (`<|im_start|>`, `<|im_end|>`, `<|endoftext|>`), lo que indica que la conversion se preparo para uso conversacional aunque el checkpoint de partida sea un modelo base.

La innovacion tecnica relevante aqui es el propio formato MLX: pesos y kernels optimizados para la memoria unificada de Apple Silicon, con una media de 4,50 bits por peso que reduce la huella a aproximadamente 1,3 GB. El autor proporciona una matriz de rendimiento estimada por tier de hardware, con velocidades de decodificacion de 117 tokens/s en chips base de 8 GB, 176 tokens/s en variantes Pro, 252 tokens/s en Max y 351 tokens/s en Ultra, con tiempos hasta el primer token de 27, 18, 11 y 8 ms respectivamente. Estas cifras son proyecciones del autor basadas en la saturacion de ancho de banda de memoria, no mediciones reproducidas de forma independiente. El identificador arXiv 2505.09388 aparece referenciado en los tags del repositorio.

## Capacidades

- Generacion de texto autoregresiva en ingles y otros idiomas, con el alcance funcional heredado del checkpoint base de Qwen3.
- Conversacion multi-turno mediante plantilla de chat con roles system, user y assistant.
- Manejo de contextos largos: hasta 32.768 tokens de forma nativa y hasta 131.072 con extension YaRN.
- Generacion de texto por linea de comandos y via API de Python (`mlx_lm.generate` y `mlx_lm.chat`).
- Integracion con LM Studio y con Ollama mediante Modelfile, con definicion explicita de stop tokens.
- Inferencia local en GPU de Apple Silicon sin dependencia de CUDA ni de servicios en la nube.
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito; el modelo de origen es una variante base, sin ajuste de instrucciones documentado.

## Casos de uso

- Asistente de completado local en editores sobre Mac: con tiempos hasta el primer token de 11-27 ms y 117-351 tokens/s, el modelo puede alimentar sugerencias de texto y fragmentos cortos de codigo directamente en el IDE sin salir del equipo.
- Procesamiento por lotes de documentos en Mac Studio o Mac con chip Ultra: la ventana de 32.768 tokens permite resumir o extraer campos de informes extensos en una sola pasada, y los 351 tokens/s estimados hacen viable procesar colas de documentos de forma desatendida.
- Sustitucion de APIs en la nube por motivos de privacidad: al ejecutarse en local con 1,3 GB de VRAM activa, se pueden tratar datos personales o confidenciales sin enviarlos a terceros, lo que simplifica el cumplimiento del RGPD en flujos internos.
- Prototipado rapido de funcionalidades de generacion de texto: el equipo de desarrollo puede validar prompts, longitudes de contexto y plantillas de chat en un portatil antes de migrar a un modelo mayor, gracias a la carga inmediata de un checkpoint de 1 GB.
- Chat de asistencia interna de bajo coste: conversaciones multi-turno con seguimiento de contexto largo para consultas sobre documentacion interna, siempre que se acepte el nivel de calidad propio de un modelo base de 1,7 B.
- Banco de pruebas de cuantizacion: el autor publica variantes 4-bit, 8-bit y 16-bit del mismo checkpoint, lo que permite medir de forma controlada la degradacion de calidad y la ganancia de velocidad al bajar de precision.
- Herramientas ofimaticas y plugins de escritorio: la huella de 1,3 GB deja memoria libre suficiente para ejecutar el modelo junto a navegador, IDE y aplicaciones de fondo en equipos con 8 GB de memoria unificada.
- Educacion e investigacion sobre despliegue en Apple Silicon: sirve como caso de estudio reproducible de conversion MLX, configuracion de stop tokens y ajuste de cuantizacion por tipo de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente proporciona una matriz de rendimiento estimada por tier de hardware, que se reproduce a continuacion como proyeccion y no como medicion verificada.

| Tier de Apple Silicon | Memoria unificada | VRAM activa | Velocidad estimada | TTFT estimado |
|---|---|---|---|---|
| M1 / M2 / M3 / M4 (base) | 8 GB | aprox. 1,3 GB | aprox. 117 tokens/s | aprox. 27 ms |
| M1 / M2 / M3 / M4 Pro | 18 GB - 36 GB | aprox. 1,3 GB | aprox. 176 tokens/s | aprox. 18 ms |
| M1 / M2 / M3 / M4 Max | 36 GB - 128 GB | aprox. 1,3 GB | aprox. 252 tokens/s | aprox. 11 ms |
| M1 / M2 / M3 Ultra | 64 GB - 192 GB | aprox. 1,3 GB | aprox. 351 tokens/s | aprox. 8 ms |

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,3 GB de huella activa para la variante 4-bit; 2,2 GB para la 8-bit y 4,2 GB para la 16-bit.
- Memoria unificada minima recomendada: 8 GB para la variante 4-bit.
- GPU compatibles: exclusivamente chips de Apple Silicon (series M1, M2, M3 y M4 en sus variantes base, Pro, Max y Ultra). No hay soporte documentado para GPU NVIDIA o AMD.
- Cabe en GPU de consumo: si, en cualquier Mac con chip de la serie M y 8 GB o mas de memoria unificada; no es ejecutable en tarjetas graficas de consumo tipo RTX 4090 sin reconvertir los pesos a otro formato.
- Opciones de despliegue documentadas: `mlx_lm.chat` y `mlx_lm.generate` por linea de comandos, API de Python con `mlx_lm.load` y `generate`, LM Studio y Ollama mediante Modelfile con stop tokens personalizados.
- Opciones no documentadas en la informacion disponible: vLLM, TGI, llama.cpp y otros motores CUDA o GGUF. Los tags del repositorio incluyen `text-generation-inference` y `endpoints_compatible`, pero el peso distribuido esta en formato MLX, por lo que su uso en esos motores requeriria una conversion previa.
- Latencia y throughput: unicamente las estimaciones del autor recogidas en la tabla anterior (117 a 351 tokens/s y TTFT de 27 a 8 ms segun tier).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| SirSahOl/Qwen3-1.7B-Base-chat-mlx-4bit | 1,72 B | 32.768 (131.072 con YaRN) | 4-bit (4,50 bits/peso) | apache-2.0 | MLX safetensors, aprox. 1,0 GB |
| SirSahOl/Qwen3-1.7B-Base-chat-mlx-8bit | no disponible | no disponible | 8-bit | apache-2.0 | MLX safetensors, aprox. 2,2 GB |
| SirSahOl/Qwen3-1.7B-Base-chat-mlx-16bit | no disponible | no disponible | 16-bit (sin cuantizar) | apache-2.0 | MLX safetensors, aprox. 4,2 GB |
| Qwen/Qwen3-1.7B-Base (modelo de origen) | no disponible | 32.768 (heredado) | sin cuantizar | no disponible en la informacion proporcionada | safetensors para transformers |

Como alternativas de otras familias del mismo orden de tamano se pueden considerar Llama 3.2 1B, Gemma 3 1B y SmolLM2-1.7B, pero las especificaciones concretas de parametros, contexto, rendimiento y licencia de esos modelos no estan disponibles en la informacion consultada y no se incluyen para no introducir datos sin verificar. La ventaja diferencial de este repositorio frente a esas alternativas es el formato MLX nativo para Apple Silicon y la disponibilidad de tres niveles de cuantizacion del mismo checkpoint.

## Limitaciones y advertencias

- El modelo de origen es Qwen3-1.7B-**Base**, no una version instruct. Aunque el repositorio se etiqueta como "conversational" y se anade plantilla de chat, no hay evidencia de ajuste por instrucciones ni de RLHF/DPO, por lo que las respuestas pueden ser poco alineadas, repetitivas o ignorar el formato conversacional esperado.
- Sin resultados publicados de MMLU, HumanEval, GSM8K ni de evaluaciones de seguridad, alucinacion o sesgo. No se puede cuantificar su fiabilidad en tareas de razonamiento o codigo.
- La cuantizacion a 4 bits introduce degradacion de calidad respecto a las variantes 8-bit y 16-bit del mismo autor, especialmente en tareas de razonamiento y generacion de codigo.
- Riesgo de bucles de generacion: el propio autor recomienda configurar de forma explicita los stop tokens `<|im_start|>`, `<|im_end|>` y `<|endoftext|>` en el runtime de inferencia local.
- Compatibilidad restringida: los pesos estan en formato MLX y solo se ejecutan en Apple Silicon. No hay soporte documentado para CUDA, ROCm ni para motores como vLLM o TGI sin conversion previa.
- Idiomas soportados no declarados. No se especifica cobertura multilingue ni calidad por idioma.
- La licencia apache-2.0 permite uso comercial y modificacion, pero conviene verificar de forma independiente la licencia y los terminos del checkpoint base Qwen/Qwen3-1.7B-Base antes de un despliegue en produccion.
- Validacion comunitaria muy baja: 16 descargas y 0 likes en el momento de la consulta. No hay garantia de mantenimiento, actualizaciones ni soporte por parte del autor.
- Inconsistencia de metadatos: la fecha de creacion registrada (22-09-2026) es posterior a la fecha de actualizacion y resulta anomala, por lo que conviene verificar la version real del artefacto antes de integrarlo.
- Las cifras de velocidad y latencia son proyecciones del autor basadas en saturacion de ancho de banda de memoria, no mediciones reproducidas de forma independiente, y variaran con la longitud del prompt y la carga del sistema.
- En produccion, un modelo base de 1,7 B requiere control de calidad adicional: filtrado de salidas, limites de longitud, plantillas de prompt estrictas y evaluacion continua.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SirSahOl/Qwen3-1.7B-Base-chat-mlx-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Variante 8-bit MLX: https://huggingface.co/SirSahOl/Qwen3-1.7B-Base-chat-mlx-8bit
- Variante 16-bit MLX: https://huggingface.co/SirSahOl/Qwen3-1.7B-Base-chat-mlx-16bit
- Perfil del autor: https://huggingface.co/SirSahOl
- Framework MLX (Apple): https://github.com/ml-explore/mlx
- Referencia arXiv incluida en los tags del repositorio: arxiv:2505.09388
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos correspondian a documentacion de la API de Udemy y no guardan relacion con el artefacto descrito.
