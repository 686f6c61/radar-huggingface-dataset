# phequals/lfm25-1.2b-muesli-cleanup-v12-mlx-8bit

## Resumen

lfm25-1.2b-muesli-cleanup-v12-mlx-8bit es un ajuste fino del modelo LiquidAI/LFM2.5-1.2B-Instruct publicado por el usuario phequals para una tarea muy concreta: limpiar la salida cruda de un sistema de reconocimiento de voz antes de insertarla en la aplicación de destino. Forma parte del backend de Muesli, una app de dictado para macOS, y no es un modelo conversacional de propósito general: recibe una transcripción (opcionalmente acompañada de contexto de pantalla) y devuelve el mismo texto con errores evidentes corregidos, muletillas eliminadas, autocorrecciones aplicadas y listas formateadas.

El interés técnico está en su especialización y en su formato de despliegue. Los pesos se distribuyen únicamente en MLX 8-bit (group size 64) para mlx-lm, con 1.170.340.608 parámetros y un repositorio de 1,2 GB, pensado para inferencia local en Apple Silicon sin GPU dedicada. El entrenamiento consistió en un LoRA de rango 16 (Unsloth) sobre 155.081 pares de limpieza, fusionado después en los pesos base.

La relevancia práctica es doble: por un lado, demuestra que un modelo de ~1,2 B puede resolver con latencia subsegundo una tarea de post-procesado que hasta ahora requería modelos mayores; por otro, su licencia LFM Open License v1.0 impone un umbral de facturación anual de 10 millones de dólares para el uso comercial gratuito, un detalle determinante para cualquier integración en producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de LFM2.5-1.2B-Instruct (tag `lfm2`); la model card no detalla la arquitectura interna capa a capa |
| Parametros totales | 1.170.340.608 |
| Parametros activos | No aplica (no se documenta como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MLX 8-bit, group size 64 (única variante publicada) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | LFM Open License v1.0 (`lfm1.0`); uso comercial gratuito solo para organizaciones por debajo de 10 M USD de facturación anual |
| Formato de pesos | `safetensors` en formato MLX (`mlx-lm`), más tokenizer y configuración |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado del instructivo LiquidAI/LFM2.5-1.2B-Instruct. La model card no describe la topología interna (número de capas, tipo de bloques de atención, vocabulario), más allá de la etiqueta `lfm2` y del pipeline `text-generation`. El ajuste se realizó con LoRA de rango 16 mediante Unsloth durante una época, calculando la pérdida únicamente sobre la respuesta (no sobre el prompt) y fusionando después los adaptadores en los pesos base, de modo que la distribución final es un checkpoint denso estándar en MLX 8-bit.

El corpus de entrenamiento, denominado `blend-v12`, consta de 155.081 pares de limpieza generados por modelos abiertos alojados en Fireworks y filtrados por un juez automático. Cubre correo electrónico, chat, documentos, prompts para agentes de IA, código, hojas de cálculo y presentaciones, cajas de búsqueda y dictados largos; aproximadamente el 20 % de las filas incluyen contexto de pantalla. La innovación relevante no está en la arquitectura sino en el contrato de uso: un prompt fijado carácter a carácter (`<|startoftext|><|im_start|>user\n{USER_TEXT}<|im_end|>\n<|im_start|>assistant\n`), decodificación greedy (`temperature 0`, `top_k=1`, sin penalización por repetición) y parada en `<|im_end|>`, con un máximo de 1.024 tokens nuevos.

## Capacidades

- Limpieza de transcripciones de voz a texto: corrección de errores evidentes de reconocimiento, eliminación de muletillas ("um", "uh", "like"), aplicación de autocorrecciones del tipo "no, espera…" o "scratch that".
- Formateo de listas numeradas o con viñetas cuando el dictado lo indica explícitamente.
- Adaptación del estilo de puntuación al contexto de la aplicación de destino (correo, chat, documento, buscador).
- Uso de contexto de pantalla (`<APP-CONTEXT>`) para resolver nombres propios, acrónimos y errores de transcripción obvios, sin copiar dicho contexto a la salida.
- Preservación estricta del texto original: si no detecta errores, devuelve la entrada sin cambios.
- No reescribe, no parafrasea, no añade ni elimina palabras con significado y no envuelve la salida en Markdown ni en etiquetas.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido (no documentado).
- Multilingüe: no. Solo inglés.

## Casos de uso

- Dictado en macOS dentro de Muesli: el modelo recibe la salida cruda del ASR y el nombre de la app enfocada, y devuelve el texto listo para pegar; con ~550 tokens de prompt y ~17 de salida, el tiempo mediano es de 0,35 s en un Apple M5, suficiente para que la inserción se perciba como instantánea.
- Correo electrónico dictado: el contexto de pantalla permite ajustar la puntuación al estilo formal del cliente de correo y corregir nombres de remitentes o asuntos que el ASR confunde con frecuencia.
- Mensajería instantánea: al ser un modelo de 1,2 GB puede ejecutarse en local, lo que evita enviar el contenido de conversaciones privadas a un servicio externo.
- Dictado de prompts para agentes de IA: el corpus de entrenamiento incluye esta categoría, por lo que el modelo está preparado para conservar literalidad en instrucciones técnicas donde una paráfrasis cambiaría el comportamiento del agente.
- Dictado de código y comandos: mantiene identificadores, rutas y sintaxis sin reformatear, aunque el caso está limitado a la limpieza del texto y no a la generación de código.
- Rellenado de hojas de cálculo y barras de búsqueda: el modelo distingue el formato de destino y evita introducir puntuación oracional donde no corresponde.
- Post-procesado de transcripciones de reuniones: puede encadenarse detrás de cualquier ASR en inglés para normalizar la salida antes de almacenarla o indexarla.

## Benchmarks y rendimiento

Tasa de error de palabra (WER, %, menor es mejor) frente a la limpieza de referencia, una petición cada vez:

| Build | Contexto de pantalla held-out (400) | Dictado simple (512) | Categorías nuevas A (309) | Categorías nuevas B (284) |
|---|---|---|---|---|
| MLX 8-bit (este modelo) | 8,85 | 1,39 | 2,66 | 3,01 |
| Limpieza previa de Muesli con Qwen3.5-0.8B (referencia) | 37,52 | 2,26 | – | – |

Los conjuntos de test están separados del entrenamiento y fueron redactados por modelos abiertos (DeepSeek/GLM para el conjunto A, ember-1 para el B) y filtrados por un juez automático; el autor advierte explícitamente de que no son dictados reales de usuarios y de que no se ha ejecutado una prueba ciega sobre dictado humano.

Rendimiento en un Apple M5, con ~550 tokens de prompt y ~17 de salida (mediana de 60 prompts), mlx-lm 0.32.2:

| Métrica | Valor |
|---|---|
| Latencia mediana | 0,35 s |
| Latencia p90 | 0,48 s |
| Prefill | 4.002 tok/s |
| Decode | 82 tok/s |

## Requisitos de hardware

- VRAM/ memoria unificada estimada: en torno a 1,5-2 GB para los pesos en 8-bit (1,2 GB de repositorio) más el espacio de activaciones y caché KV.
- Plataforma: exclusivamente Apple Silicon. El formato es MLX (`mlx-lm`) y no se publican pesos GGUF, safetensors estándar ni versiones para CUDA.
- GPU recomendadas: cualquier Mac con chip de la serie M; el autor reporta mediciones en un M5. No hay datos publicados para A100, H100 o RTX 4090, y el modelo no se puede cargar en ellas sin convertir previamente los pesos.
- Cabe en GPU de consumo: sí, en el sentido de que cabe en la memoria unificada de cualquier Mac moderno; el cuello de botella es la plataforma, no el tamaño.
- Opciones de despliegue: `mlx-lm` 0.32.2 o superior. vLLM, TGI, llama.cpp y Ollama no son compatibles de forma nativa con este checkpoint.
- Latencia y throughput: 0,35 s de mediana y 82 tok/s de decodificación en M5, con prompts de ~550 tokens; valores medidos, no estimados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER (dictado simple) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lfm25-1.2b-muesli-cleanup-v12-mlx-8bit | 1,17 B | No disponible | 1,39 % | LFM Open License v1.0 (límite 10 M USD) | MLX 8-bit |
| Muesli cleanup con Qwen3.5-0.8B (referencia interna) | ~0,8 B | No disponible | 2,26 % (37,52 % con contexto de pantalla) | No disponible | No publicada |
| LiquidAI/LFM2.5-1.2B-Instruct (modelo base) | 1,17 B | No disponible | No disponible (no especializado en limpieza) | LFM Open License v1.0 | Múltiples formatos |

No se dispone de datos de benchmarks ni de especificaciones de contexto para el modelo base en la información proporcionada, por lo que la comparación se limita a parámetros y licencia.

## Limitaciones y advertencias

- Solo inglés. Cualquier dictado en otro idioma queda fuera del alcance declarado del modelo.
- No es un reconocedor de voz: únicamente limpia una transcripción ya existente. No incorpora componente acústico.
- Riesgo de alucinación y de expansión indebida: el autor recomienda una salvaguarda en la aplicación consistente en pegar la transcripción cruda si la salida está vacía o supera tres veces la longitud de la entrada.
- El prompt debe coincidir exactamente con el de entrenamiento (mismo turno de usuario, sin mensaje de sistema, decodificación greedy, parada en `<|im_end|>`). Delegar la construcción del prompt a un motor de plantillas de chat puede degradar los resultados.
- El campo "Document context" se entrenó con el *nombre* del campo enfocado, no con su contenido; las aplicaciones que envíen el contenido completo en ese campo obtendrán resultados peores.
- Los conjuntos de evaluación fueron generados por modelos abiertos y filtrados por un juez automático, no por usuarios reales; no se ha realizado una prueba ciega sobre dictados humanos.
- Licencia restrictiva para uso comercial: gratuita solo por debajo de 10 M USD de facturación anual; por encima es necesario un acuerdo con Liquid AI. Al ser una versión modificada del modelo base, se heredan sus términos.
- Sesgos: no documentados en la model card. Al estar entrenado sobre pares sintéticos, puede reproducir los sesgos de los modelos generadores del corpus.
- Dependencia de plataforma: sin pesos para CUDA, la adopción en servidores x86 requiere conversión manual y no está validada.
- Trazabilidad mínima: 0 descargas y 0 likes en el momento de la consulta, sin paper ni informe técnico asociado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/phequals/lfm25-1.2b-muesli-cleanup-v12-mlx-8bit
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Licencia (referenciada como `LICENSE` en el repositorio del modelo)
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: no se han encontrado papers, blogs, repositorios ni demos adicionales.
