# SirSahOl/OLMo-2-0425-1B-chat-mlx-8bit

## Resumen

OLMo-2-0425-1B-chat-mlx-8bit es una conversión a 8 bits en formato MLX del modelo allenai/OLMo-2-0425-1B, publicada por el usuario SirSahOl. No se trata de un modelo entrenado desde cero, sino de una redistribución cuantizada pensada para ejecutar el modelo base de Allen AI de forma nativa en la GPU unificada de los chips Apple Silicon (familias M1, M2, M3 y M4). El resultado es un checkpoint de aproximadamente 1,48 mil millones de parámetros reales, con un peso medio de 8,25 bits por parámetro y un consumo de memoria activa en torno a 1,5 GB.

La relevancia de esta ficha es práctica: el modelo base OLMo 2 es uno de los pocos LLM de escala pequeña con pesos, datos y código publicados de forma abierta, bajo licencia Apache 2.0. Esta conversión permite desplegarlo en portátiles y equipos de sobremesa Mac sin GPU dedicada, con velocidades de decodificación declaradas por el autor de entre 121 y 363 tokens por segundo segun el tier de chip. La ventana de contexto es de 4.096 tokens, lo que lo sitúa en el rango bajo de los modelos actuales y condiciona sus casos de uso.

Conviene señalar dos matices importantes antes de evaluarlo. Primero, el repositorio se anuncia como "chat", pero el `base_model` declarado es el checkpoint base (no la variante Instruct), por lo que la plantilla de conversación incluida puede no corresponder a un modelo alineado para diálogo. Segundo, el autor indica 1,0B de parámetros en la model card, mientras que los metadatos de safetensors registran 1.484.916.736 parámetros; conviene tratar la cifra real como referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Olmo2ForCausalLM (transformer decoder-only) |
| Parametros totales | 1.484.916.736 (~1,48 mil millones, segun metadatos de safetensors); la model card indica 1,0B |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4.096 tokens (segun model card) |
| Tipos de cuantizacion | 8 bits, media de 8,25 bits por peso; el mismo autor publica variantes de 4 y 16 bits |
| Idiomas soportados | Ingles (etiqueta `en`); no hay lista oficial de idiomas en la informacion disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (no GGUF, no binario PyTorch) |
| Tamano del repositorio | 1,7 GB |
| Memoria activa estimada | ~1,5 GB de memoria unificada |
| Libreria de inferencia | mlx-lm (conversion realizada con mlx-lm 0.31.3) |
| Modelo base | allenai/OLMo-2-0425-1B |
| Referencia del paper | arXiv:2501.00656 (etiqueta del repositorio) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo OLMo 2 de Allen AI, expuesta en la libreria de HuggingFace como `Olmo2ForCausalLM`, es decir, un transformer decoder-only con atencion causal. Esta publicacion concreta no introduce ningun cambio arquitectonico: se limita a convertir los pesos originales a precision de 8 bits mediante el flujo de cuantizacion de MLX. La conversion declaro un tiempo de 6,03 segundos y genero un checkpoint de 1,7 GB en el repositorio.

Sobre el entrenamiento del modelo base, la informacion proporcionada no incluye el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO. Esos detalles deberian consultarse en el articulo referenciado por la etiqueta `arxiv:2501.00656`, que corresponde a la publicacion de la familia OLMo 2. Tampoco se documenta en esta ficha ninguna innovacion de decodificacion (decodificacion especulativa, atencion lineal o similar); el unico elemento tecnico destacable aportado por el autor es la cuantizacion a 8 bits con un promedio de 8,25 bits por peso y su matriz de rendimiento estimada por tier de chip Apple Silicon.

## Capacidades

- Generacion de texto autoregresiva en ingles, con plantilla de conversacion definida por los tokens especiales `<|im_start|>`, `<|im_end|>` y `<|endoftext|>`.
- Conversacion multi-turno mediante plantilla de chat (roles system, user y assistant), siempre dentro del limite de 4.096 tokens.
- Generacion de codigo y texto tecnico a escala de modelo pequeno, sin garantias de calidad documentadas por el autor.
- Ejecucion local sin conexion a internet, al distribuirse como pesos abiertos en un formato que corre integramente en el dispositivo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; la unica etiqueta de idioma es `en`.
- Capacidades especiales (modo thinking, vision, audio, decodificacion especulativa): no disponibles en la informacion proporcionada.
- Integracion con endpoints compatibles (`endpoints_compatible`) y con LM Studio u Ollama, segun las instrucciones de la propia model card.

## Casos de uso

- Asistente local en un Mac de gama base: con 8 GB de memoria unificada y una huella activa de ~1,5 GB, el modelo deja margen para el sistema operativo y aplicaciones de fondo, lo que permite un asistente de completado y chat siempre disponible sin conexion.
- Prototipado rapido de aplicaciones de chat: al cargarse con `mlx_lm.chat` o mediante la API de Python en pocos segundos, sirve para validar plantillas de prompt, flujos de conversacion y formateo de mensajes antes de migrar a un modelo mayor.
- Extraccion y resumen de documentos en lote: la variante estimada en chips Ultra (hasta ~363 tokens/s) hace viable procesar grandes volumenes de texto corto en paralelo, con la limitacion de que cada documento debe caber en 4.096 tokens.
- Clasificacion y etiquetado de texto en ingles: tareas de categoria cerrada (sentimiento, intencion, topicos) donde un modelo de 1,5B es suficiente y la latencia baja (~6-22 ms de TTFT) resulta ventajosa.
- Generacion de codigo en editores locales: integrable como autocompletado o generador de fragmentos cortos en un IDE sobre Mac, sin coste de API y sin enviar codigo a terceros.
- Educacion e investigacion sobre LLM abiertos: al derivar de un modelo con pesos, datos y codigo publicados bajo Apache 2.0, es un candidato razonable para estudiar el efecto de la cuantizacion de 8 bits frente a las variantes de 4 y 16 bits del mismo autor.
- Demostraciones offline en entornos restringidos: escenarios con requisitos de soberania de datos (sanidad, legal, administracion) donde no se permite enviar texto a servicios externos y el hardware disponible es un portatil Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente proporciona estimaciones de throughput y tiempo hasta el primer token por tier de hardware Apple Silicon, que no son resultados de calidad de modelo:

| Tier de Apple Silicon | Memoria unificada | Memoria activa | Velocidad estimada | TTFT estimado |
|---|---|---|---|---|
| M1 / M2 / M3 / M4 (base) | 8 GB | ~1,5 GB | ~121 tokens/s | ~22 ms |
| M1 / M2 / M3 / M4 Pro | 18 GB - 36 GB | ~1,5 GB | ~182 tokens/s | ~15 ms |
| M1 / M2 / M3 / M4 Max | 36 GB - 128 GB | ~1,5 GB | ~260 tokens/s | ~9 ms |
| M1 / M2 / M3 Ultra | 64 GB - 192 GB | ~1,5 GB | ~363 tokens/s | ~6 ms |

Estas cifras son proyecciones del propio autor basadas en la saturacion de ancho de banda de memoria de Apple Silicon, no mediciones independientes, y varian con la longitud del prompt.

## Requisitos de hardware

- VRAM / memoria unificada para inferencia: ~1,5 GB en la variante de 8 bits. El autor recomienda un minimo de 8 GB de memoria unificada.
- GPU compatibles: exclusivamente Apple Silicon (M1, M2, M3, M4 y sus variantes Pro, Max y Ultra). El formato MLX no se ejecuta en GPU NVIDIA ni AMD.
- GPU de consumo: si cabe en cualquier Mac con Apple Silicon, incluso en el tier base de 8 GB. No es desplegable en una RTX 4090, A100 o H100 en este formato.
- Alternativas de precision del mismo autor: 4 bits (~0,9 GB de disco y de memoria), 8 bits (este repositorio, ~1,5 GB) y 16 bits (~2,8 GB).
- Opciones de despliegue documentadas: `mlx-lm` (CLI `mlx_lm.chat` y `mlx_lm.generate`, y API de Python con `load` y `generate`), LM Studio y Ollama mediante un Modelfile. No se ofrecen pesos en GGUF ni soporte declarado para vLLM o TGI.
- Configuracion critica: es necesario definir los tokens de parada `<|im_start|>`, `<|im_end|>` y `<|endoftext|>` en el runtime para evitar bucles de generacion; el autor sugiere temperatura 0.7.
- Latencia y throughput: los valores estimados figuran en la tabla de la seccion anterior (entre ~6 y ~22 ms de TTFT y entre ~121 y ~363 tokens/s segun chip).

## Comparativa con modelos similares

No se dispone de datos verificados de modelos de otras familias en la informacion proporcionada, por lo que la comparacion se limita a las variantes del mismo modelo y al checkpoint original:

| Version | Parametros | Contexto | Cuantizacion | Tamano en disco | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| OLMo-2-0425-1B-chat-mlx-4bit | ~1,48B | 4.096 tokens | 4 bits | ~0,9 GB | Apache 2.0 | Repositorio del mismo autor |
| OLMo-2-0425-1B-chat-mlx-8bit (este) | ~1,48B | 4.096 tokens | 8 bits (8,25 bits/peso) | ~1,5 GB (1,7 GB de repo) | Apache 2.0 | Repositorio del mismo autor |
| OLMo-2-0425-1B-chat-mlx-16bit | ~1,48B | 4.096 tokens | 16 bits | ~2,8 GB | Apache 2.0 | Repositorio del mismo autor |
| allenai/OLMo-2-0425-1B (base original) | ~1,48B | No confirmado en la informacion disponible | Sin cuantizar | No disponible | Apache 2.0 | HuggingFace, Allen AI |

Comparativa con alternativas de otras familias (por ejemplo modelos de ~1B a ~2B de otros laboratorios): no disponible en la informacion proporcionada. No se deben asumir ventajas o desventajas de rendimiento sin datos de benchmarks publicados.

## Limitaciones y advertencias

- Escala reducida: con ~1,5B de parametros, la capacidad de razonamiento complejo, matematicas y conocimiento factual es limitada en comparacion con modelos de 7B o superiores.
- Riesgo de alucinacion elevado, especialmente en preguntas factuales y en tareas de razonamiento encadenado; no se han publicado evaluaciones de fidelidad.
- Ventana de contexto de solo 4.096 tokens, insuficiente para documentos largos, bases de codigo extensas o conversaciones prolongadas.
- Idioma: la unica etiqueta declarada es `en`; no hay evidencia de soporte fiable en castellano ni en otros idiomas.
- Ambiguedad sobre el checkpoint de origen: el repositorio se denomina "chat" pero declara como `base_model` el checkpoint base `allenai/OLMo-2-0425-1B` (no la variante Instruct). No se puede confirmar en la informacion disponible que los pesos esten alineados para dialogo.
- Dependencia de plataforma: al estar en formato MLX, el modelo queda restringido a hardware Apple Silicon. No es portable a GPU NVIDIA o AMD sin reconvertir los pesos.
- Riesgo de bucles de generacion si no se configuran correctamente los tokens de parada `<|im_start|>`, `<|im_end|>` y `<|endoftext|>` en el runtime.
- Licencia Apache 2.0, permisiva y apta para uso comercial, pero conviene verificar las condiciones del modelo base original de Allen AI antes de un despliegue en produccion.
- Las cifras de velocidad y TTFT son proyecciones del autor, no mediciones reproducibles; el rendimiento real dependera de la longitud del prompt y de la carga del sistema.
- Repositorio con muy baja adopcion (11 descargas y 0 likes en el momento de la consulta), sin mantenimiento ni comunidad verificable.
- No se han encontrado en la busqueda web resultados relevantes sobre este modelo: los enlaces devueltos correspondian a contenidos no relacionados (tutoriales sobre auriculares Bluetooth) y se han descartado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SirSahOl/OLMo-2-0425-1B-chat-mlx-8bit
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B
- Variante de 4 bits: https://huggingface.co/SirSahOl/OLMo-2-0425-1B-chat-mlx-4bit
- Variante de 16 bits: https://huggingface.co/SirSahOl/OLMo-2-0425-1B-chat-mlx-16bit
- Perfil del autor de la conversion: https://huggingface.co/SirSahOl
- Framework MLX de Apple: https://github.com/ml-explore/mlx
- Referencia del paper (etiqueta del repositorio): https://arxiv.org/abs/2501.00656
