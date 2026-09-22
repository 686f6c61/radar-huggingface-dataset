# SirSahOl/decider-2b-chat-mlx-16bit

## Resumen

decider-2b-chat-mlx-16bit es una conversión a 16 bits del modelo JackFram/decider-2b realizada por el usuario SirSahOl y publicada en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos al formato MLX de Apple para inferencia nativa en la GPU de los chips de la serie M, con precisión completa (bfloat16 sin cuantizar). La model card declara una arquitectura Qwen3_5ForCausalLM, unos 2,0 B de parámetros y una longitud de contexto de 262.144 tokens.

El interés práctico del repositorio es acotado y muy concreto: permite ejecutar un modelo conversacional de ~1,88 B de parámetros en un Mac con memoria unificada, sin depender de CUDA ni de servicios en la nube. Con un consumo activo de memoria estimado en ~4,8 GB, encaja en equipos con 8 GB de memoria unificada o más, y el autor publica variantes en 4 y 8 bits para perfiles de hardware más ajustados.

La relevancia es, por tanto, la de una pieza de infraestructura local para Apple Silicon más que la de un modelo de frontera. El repositorio presenta señales de madurez limitadas: licencia desconocida, sin idiomas declarados, 33 descargas, 0 likes, y un modelo base (JackFram/decider-2b) del que no se aportan datos de entrenamiento ni evaluación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForCausalLM (según la model card); transformer causal denso, sin arquitecturas híbridas documentadas |
| Parametros totales | 1.881.825.088 (~1,88 B) según los pesos en safetensors; la model card indica 2,0 B |
| Parametros activos | no disponible (no se documenta una arquitectura MoE) |
| Longitud de contexto | 262.144 tokens (según la model card; no verificado) |
| Tipos de cuantizacion | 16 bits (bfloat16 sin cuantizar, media de 16,00 bits por peso). El autor publica además variantes 4-bit y 8-bit |
| Idiomas soportados | no disponible |
| Licencia | unknown (desconocida) |
| Formato de pesos | safetensors en formato MLX nativo de Apple Silicon |

## Arquitectura y entrenamiento

El repositorio contiene una conversión, no un entrenamiento. Los pesos proceden de JackFram/decider-2b y se transformaron al formato MLX con mlx-lm 0.31.3, en un proceso que el autor cifra en 8,84 segundos y que produjo una salida de 3,5 GB (el repositorio completo ocupa 3,8 GB). La model card declara la clase Qwen3_5ForCausalLM como arquitectura de origen, etiqueta que no corresponde a ninguna familia publicada de forma estándar, por lo que la arquitectura real no puede confirmarse con la información disponible.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si el modelo base pasó por ajuste supervisado, RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o mecanismos híbridos. Lo único verificable técnicamente es el proceso de conversión y el plantilla de chat, que sigue el esquema ChatML con los tokens especiales `<|im_start|>`, `<|im_end|>` y `<|endoftext|>`.

## Capacidades

- Generación de texto y conversación multi-turno, con plantilla de chat ChatML documentada por el autor.
- Formato nativo MLX, lo que habilita inferencia en la GPU unificada de los chips Apple M1 a M4 y superiores mediante la librería mlx-lm.
- Ventana de contexto declarada de 262.144 tokens, adecuada en teoría para documentos largos y conversaciones extensas; no se aportan pruebas de que el modelo base sostenga esa longitud de forma efectiva.
- La model card menciona "tool invocation" y "agent orchestration" en su tabla de perfiles de hardware, sin especificar formato de function calling ni esquema de herramientas.
- Capacidades multilingües: no disponible (no se declara ningún idioma en la ficha de HuggingFace).
- Modo de razonamiento explícito, visión o audio: no disponible.

## Casos de uso

- Asistente conversacional local en un Mac: el modelo se carga con `mlx_lm.chat` y consume ~4,8 GB de memoria unificada, de modo que puede mantenerse residente en un equipo de 16 GB mientras se trabaja con otras aplicaciones.
- Generación de texto y borradores en el propio portátil sin conexión: útil en entornos con requisitos de confidencialidad donde no se permite enviar datos a una API externa.
- Prototipado rápido de aplicaciones de chat sobre Apple Silicon: la integración con mlx-lm y el ejemplo de API en Python permiten tener un endpoint conversacional funcional en pocos minutos.
- Evaluación de referencia en 16 bits: al ser la variante sin cuantizar, sirve como línea base para medir la degradación de las versiones 4-bit y 8-bit del mismo autor.
- Procesamiento de documentos largos con contexto extenso: si la ventana de 262.144 tokens se sostiene, permitiría resumir o extraer información de expedientes completos en una sola pasada, aunque conviene validarlo empíricamente.
- Despliegue con Ollama en un Mac: la model card incluye un Modelfile de ejemplo con los tokens de parada y temperatura 0,7, lo que facilita empaquetar el modelo como servicio local.
- Generación de código ligera en un IDE local, siempre que se asuma la calidad propia de un modelo de ~2 B y se valide la salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandarizada, ni para este repositorio ni para el modelo base JackFram/decider-2b.

La model card incluye únicamente proyecciones de velocidad de decodificación y tiempo hasta el primer token sobre hardware Apple Silicon, que el propio autor describe como "projections based on Apple Silicon memory bandwidth saturation for 16-bit weights" y advierte que varían según la longitud del prompt:

| Nivel de Apple Silicon | Memoria unificada | VRAM activa | Velocidad estimada | TTFT estimado |
|---|---|---|---|---|
| M1 / M2 / M3 / M4 (base) | 8 GB | ~4,8 GB | ~44 tokens/s | ~63 ms |
| M1 / M2 / M3 / M4 Pro | 18-36 GB | ~4,8 GB | ~66 tokens/s | ~43 ms |
| M1 / M2 / M3 / M4 Max | 36-128 GB | ~4,8 GB | ~95 tokens/s | ~26 ms |
| M1 / M2 / M3 Ultra | 64-192 GB | ~4,8 GB | ~132 tokens/s | ~18 ms |

Estas cifras son estimaciones del autor, no mediciones reproducibles publicadas, y deben tratarse como orientativas.

## Requisitos de hardware

- VRAM/memoria unificada: ~4,8 GB de huella activa en la variante 16 bits. El autor recomienda un mínimo de 8 GB de memoria unificada.
- GPU compatibles: exclusivamente Apple Silicon (serie M1, M2, M3 y M4, en sus variantes base, Pro, Max y Ultra). No hay soporte CUDA documentado para este repositorio.
- GPU de consumo NVIDIA (RTX 4090, etc.): no soportadas por este repositorio, ya que los pesos están en formato MLX. El modelo base JackFram/decider-2b, en su formato original, sí podría convertirse a otros runtimes, pero eso queda fuera de lo que documenta esta ficha.
- Variantes según hardware: 4-bit (~1,5 GB en disco y en memoria) para equipos de 8-16 GB; 8-bit (~2,6 GB) para 16 GB o más; 16-bit (~4,8 GB) para equipos Max o Ultra con 32 GB o más.
- Opciones de despliegue: mlx-lm (CLI `mlx_lm.chat` y `mlx_lm.generate`, además de API en Python) y Ollama mediante un Modelfile. No se documenta compatibilidad con vLLM, TGI, llama.cpp ni llama-cpp-python para este repositorio concreto, dado que no se distribuyen pesos GGUF.
- Latencia y throughput: solo las proyecciones de la tabla anterior (~18-63 ms de TTFT y ~44-132 tokens/s según el chip).

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones verificadas de terceros en la información proporcionada, por lo que no es posible comparar el rendimiento con modelos alternativos de la misma categoría. La comparación factible se limita a las tres variantes de cuantización publicadas por el mismo autor:

| Variante | Tamano en disco | Huella en memoria | Hardware objetivo | Ventaja declarada |
|---|---|---|---|---|
| decider-2b-chat-mlx-4bit | ~1,5 GB | ~1,5 GB | M1-M4 con 8 GB o más | Máxima velocidad de generación y mínimo consumo de RAM |
| decider-2b-chat-mlx-8bit | ~2,6 GB | ~2,6 GB | M1-M4 Pro/Max con 16 GB o más | Equilibrio entre precisión y velocidad |
| decider-2b-chat-mlx-16bit (este repositorio) | ~3,5-4,8 GB | ~4,8 GB | M2-M4 Max/Ultra con 32 GB o más | Precisión completa sin cuantizar, calidad de referencia |

Frente a modelos de otros fabricantes del rango de 2-3 B, no hay datos en la información disponible que permitan una comparación rigurosa de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Licencia desconocida: la ficha de HuggingFace indica `license: unknown`. No hay autorización explícita para uso comercial, por lo que no debe utilizarse en producción sin aclarar antes la situación legal con el autor y con el modelo base.
- Sin datos de evaluación: no hay benchmarks publicados, ni del modelo convertido ni del modelo base, lo que impide estimar su calidad real en razonamiento, código o matemáticas.
- Las cifras de velocidad y TTFT son proyecciones del autor basadas en saturación de ancho de banda de memoria, no mediciones verificadas.
- Discrepancia en el recuento de parámetros: los pesos en safetensors suman 1.881.825.088 parámetros (~1,88 B), mientras que la model card declara 2,0 B. Conviene tratar el dato de safetensors como el real.
- Arquitectura no confirmada: la etiqueta Qwen3_5ForCausalLM no corresponde a una familia pública estándar, y no se aporta información sobre el entrenamiento del modelo base, lo que dificulta auditar su comportamiento.
- Contexto declarado de 262.144 tokens sin verificación: es habitual que los modelos mantengan un rendimiento degradado mucho antes de alcanzar su ventana nominal. No se documentan pruebas de aguja en el pajar ni de atención efectiva a larga distancia.
- Riesgo de alucinación: en modelos del rango de 2 B es alto, especialmente en tareas de conocimiento factual, matemáticas y razonamiento de varios pasos.
- Idiomas no declarados: no puede asumirse un rendimiento correcto en castellano ni en ningún otro idioma concreto.
- Adopción muy baja: 33 descargas y 0 likes en el momento de la consulta, sin issues ni validación comunitaria documentada.
- Soporte limitado a Apple Silicon: no es desplegable en GPUs NVIDIA o AMD con este repositorio, lo que restringe su uso en servidores convencionales.
- Advertencia de bucle: el propio autor recomienda configurar los tokens de parada `<|im_start|>`, `<|im_end|>` y `<|endoftext|>` en runtimes locales para evitar generaciones en bucle.
- La fecha de creación indicada (2026-09-22) es posterior a la fecha habitual de publicación, lo que puede deberse a un error de metadatos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SirSahOl/decider-2b-chat-mlx-16bit
- Variante 4-bit: https://huggingface.co/SirSahOl/decider-2b-chat-mlx-4bit
- Variante 8-bit: https://huggingface.co/SirSahOl/decider-2b-chat-mlx-8bit
- Modelo base: https://huggingface.co/JackFram/decider-2b
- Perfil del autor: https://huggingface.co/SirSahOl
- Framework MLX de Apple: https://github.com/ml-explore/mlx
- Librería mlx-lm (versión usada en la conversión: 0.31.3): no se proporciona enlace directo en la información disponible
- Paper, blog de presentación o demo: no disponibles
