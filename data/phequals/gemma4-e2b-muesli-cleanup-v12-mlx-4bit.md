# phequals/gemma4-e2b-muesli-cleanup-v12-mlx-4bit

## Resumen

gemma4-e2b-muesli-cleanup-v12-mlx-4bit es un ajuste fino de `google/gemma-4-E2B-it` orientado a una tarea muy concreta: limpiar transcripciones de dictado por voz antes de insertarlas en la aplicación de destino. Lo publica el usuario `phequals` como pieza del motor de Muesli, una app de dictado para macOS, y no es un modelo conversacional generalista ni un sistema de reconocimiento de voz: recibe texto ya transcrito y devuelve ese mismo texto corregido (errores claros de reconocimiento, muletillas, autocorrecciones del tipo "no, espera", listas dictadas) o intacto si no hay nada que arreglar.

El modelo tiene 4.628.569.379 parámetros y se distribuye en formato MLX 4-bit (grupo de 64) con un repositorio de 2,6 GB, pensado para inferencia en local sobre Apple Silicon. El ajuste se hizo con LoRA de rango 16 (Unsloth) durante una época sobre 155.081 pares de limpieza, y luego se fusionó en los pesos base. La relevancia práctica está en el binomio latencia/privacidad: en un Apple M5 procesa una petición mediana de ~550 tokens de prompt y ~17 de salida en 0,34 s de mediana, sin enviar el texto del usuario a ningún servidor.

La licencia declarada es apache-2.0 y el único idioma soportado es el inglés. La model card es explícita sobre los límites: los conjuntos de evaluación son sintéticos (escritos por modelos abiertos y filtrados por un juez automático), no dictados reales, y todavía no se ha ejecutado una prueba a ciegas sobre usuarios reales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma 4 (la model card no detalla la arquitectura interna ni el reparto de capas) |
| Parámetros totales | 4.628.569.379 (≈4,63 B) |
| Parámetros activos | no disponible (la denominación "E2B" de la familia Gemma alude a parámetros efectivos, pero la información proporcionada no desglosa el reparto) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MLX 4-bit, tamaño de grupo 64 (única variante publicada en este repositorio) |
| Idiomas soportados | inglés (`en`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (`mlx-lm`), junto con tokenizer y config |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it`, un transformer decoder-only de la familia Gemma 4, y se especializa mediante un LoRA de rango 16 entrenado con Unsloth durante una sola época, con la pérdida calculada únicamente sobre la respuesta y posteriormente fusionado en los pesos base. El resultado se cuantiza a 4 bits en formato MLX con grupo de 64. No se documentan en la información disponible ni el número de tokens de preentrenamiento del modelo base, ni si hubo RLHF/DPO en la cadena original, ni innovaciones de atención o decodificación más allá del ajuste.

El corpus de ajuste son 155.081 pares de limpieza (mezcla `blend-v12`) que cubren correo electrónico, chat, documentos, prompts para agentes de IA, código, hojas de cálculo y presentaciones, cajas de búsqueda y dictados largos; aproximadamente el 20 % de las filas incluyen contexto de pantalla. Los pares fueron generados por modelos abiertos alojados en Fireworks y filtrados por un juez automático, es decir, son datos sintéticos y no dictados reales. La innovación técnica destacable no está en la arquitectura sino en el contrato de uso: un prompt fijado carácter a carácter (un solo turno `user`, sin mensaje de sistema del motor de plantillas, decodificación voraz, máximo 1.024 tokens nuevos, parada en `<turn|>`) y un bloque opcional `<APP-CONTEXT>` con app enfocada, documento, URL, texto seleccionado y OCR de pantalla, recortado a 1.200 caracteres y usado solo para resolver errores evidentes.

## Capacidades

- Limpieza de transcripciones de voz: corrige errores claros de reconocimiento y devuelve el texto intacto cuando ya es correcto.
- Eliminación de muletillas y vacilaciones ("um", "uh", "like") en inglés.
- Aplicación de autocorrecciones dictadas ("no, espera…", "scratch that").
- Formateo de listas numeradas y con viñetas cuando el usuario las dicta.
- Adaptación del estilo de puntuación a la app de destino (correo, chat, documento, caja de búsqueda).
- Uso de contexto de pantalla (`<APP-CONTEXT>`): app enfocada, campo activo, URL, texto seleccionado y OCR, para resolver nombres propios, acrónimos y errores de transcripción.
- Preservación estricta del fraseo original: el prompt prohíbe parafrasear, reescribir, añadir o eliminar palabras con significado.
- No soporta tool calling, function calling, agentes multi-paso, visión ni audio; es un modelo de un solo turno y una sola salida de texto.
- Multilingüe: no. Solo inglés.

## Casos de uso

- Dictado en local dentro de una app de macOS: el modelo recibe la salida cruda del reconocedor y devuelve el texto limpio antes de insertarlo en el campo activo; los 0,34 s de mediana por petición en un M5 permiten que la corrección ocurra sin que el usuario perciba espera.
- Correo electrónico dictado: con el contexto de la app y del campo enfocado, normaliza nombres propios y acrónimos que el reconocedor habría transcrito mal, y aplica la puntuación propia de un correo formal.
- Mensajería instantánea: mantiene el registro informal y elimina muletillas sin reescribir el mensaje, gracias a la instrucción explícita de preservar el fraseo del hablante.
- Dictado de listas de tareas o de la compra: convierte el habla continua ("primero… luego… y por último…") en listas numeradas o con viñetas cuando el usuario las dicta como tales.
- Prompts para agentes de IA dictados por voz: el corpus de entrenamiento incluye prompts de agentes, por lo que el modelo está expuesto a ese vocabulario técnico y a estructuras de instrucción; útil para dictar instrucciones largas a herramientas de desarrollo.
- Entrada de código y hojas de cálculo: la mezcla de entrenamiento incluye código y hojas de cálculo/presentaciones, lo que ayuda con identificadores y términos técnicos dictados, siempre dentro de una limpieza superficial y sin reescritura.
- Transcripción de reuniones o notas largas: el modelo admite hasta 1.024 tokens nuevos y está entrenado con dictados largos, así que puede procesar bloques extensos en una sola pasada.
- Flujo con privacidad estricta: al ejecutarse en local sobre MLX, el texto dictado no sale del dispositivo, lo que encaja en entornos con requisitos de confidencialidad.

## Benchmarks y rendimiento

Tasa de error de palabra (WER, %) frente a la limpieza de referencia, una petición a la vez. Menos es mejor.

| Build | Screen-context held-out (400) | Plain dictation (512) | New categories A (309) | New categories B (284) |
|---|---|---|---|---|
| MLX 4-bit (este modelo) | 8,80 | 1,49 | 2,64 | 2,86 |
| Limpieza previa de Muesli, Qwen3.5-0,8B (referencia) | 37,52 | 2,26 | no disponible | no disponible |

Los conjuntos de prueba están reservados fuera del entrenamiento; las filas fueron escritas por modelos abiertos (DeepSeek/GLM para el conjunto A, ember-1 para el B) y filtradas por un juez automático. No son dictados reales de usuarios y no se ha ejecutado una prueba a ciegas sobre dictados reales.

Rendimiento en un Apple M5 con ~550 tokens de prompt y ~17 de salida (mediana de 60 prompts, mlx-lm 0.32.2):

| Métrica | Valor |
|---|---|
| Latencia mediana | 0,34 s |
| Latencia p90 | 0,45 s |
| Prefill | 4.896 tok/s |
| Decode | 57 tok/s (68 tok/s en respuestas largas) |

## Requisitos de hardware

- VRAM/espacio: el repositorio ocupa 2,6 GB y el fichero `model.safetensors` 2,5 GB en 4-bit; el peso en memoria es del orden de 2,5-3 GB más overhead de KV cache y runtime.
- Plataforma objetivo: Apple Silicon con MLX (`mlx-lm` 0.32.2 verificado por el autor en un M5). Cabe en equipos de consumo con memoria unificada de 8 GB o más; 16 GB deja margen holgado para contexto largo.
- GPU NVIDIA: el formato publicado es MLX, no GGUF ni safetensors estándar de PyTorch, por lo que no se puede cargar directamente en vLLM, TGI o llama.cpp sin una conversión previa; no se documenta ninguna conversión de este build.
- Opciones de despliegue: `mlx-lm` en macOS. No se han publicado ficheros GGUF para Ollama o llama.cpp ni adaptadores para vLLM/TGI.
- Throughput y latencia: 4.896 tok/s de prefill y 57 tok/s de decode en M5; con prompts de ~550 tokens y salidas de ~17 tokens, la latencia queda por debajo de medio segundo en el p90.
- No se dispone de datos de rendimiento en hardware NVIDIA ni en GPUs de datacenter para este build.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER dictado plano | WER con contexto de pantalla | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| gemma4-e2b-muesli-cleanup-v12-mlx-4bit | 4,63 B | no disponible | 1,49 | 8,80 | apache-2.0 | HuggingFace, MLX 4-bit |
| Limpieza previa de Muesli (Qwen3.5-0,8B) | 0,8 B | no disponible | 2,26 | 37,52 | no disponible | interna, no publicada |
| google/gemma-4-E2B-it (base) | 4,63 B | no disponible | no disponible | no disponible | no indicada en la información proporcionada | HuggingFace |

La comparación es limitada: el único contrincante con números es la limpieza anterior de Muesli, mucho más pequeña y claramente peor en el escenario con contexto de pantalla (37,52 frente a 8,80 de WER). No hay datos públicos de otros modelos especializados en limpieza de dictado con los que contrastar, y el modelo base no está evaluado en esta tarea en la información disponible.

## Limitaciones y advertencias

- Solo inglés. No hay soporte de otros idiomas declarado, ni siquiera para dictados en castellano.
- No es un reconocedor de voz: únicamente posprocesa texto ya transcrito.
- Riesgo de alucinación estructural bajo pero real: la salvaguarda recomendada por el autor es que, si la salida está vacía o supera 3 veces la longitud de la entrada, la app pegue la transcripción cruda.
- Los datos de entrenamiento y de evaluación son sintéticos (generados por modelos abiertos y filtrados por un juez automático); no se ha validado con dictados reales de usuarios, por lo que el WER real en producción es desconocido.
- El prompt debe construirse manualmente y coincidir exactamente con el de entrenamiento: un solo turno `user`, sin mensaje de sistema del motor de plantillas, greedy, máximo 1.024 tokens nuevos y parada en `<turn|>`. La plantilla de chat de Gemma 4 abre un canal de razonamiento salvo que se use `enable_thinking=False`.
- Sesgo de formato del contexto: el entrenamiento colocaba el *nombre* del campo enfocado en "Document context"; las apps que envíen el *contenido* del campo en esa posición pueden obtener resultados peores.
- El bloque `<APP-CONTEXT>` se recorta a 1.200 caracteres y nunca debe copiarse a la salida salvo que el usuario lo haya dictado.
- Licencia apache-2.0 declarada por el autor sobre un derivado de un modelo de Google: conviene verificar los términos del modelo base antes de un uso comercial.
- Sin datos de contexto máximo, de comportamiento en GPUs NVIDIA ni de cuantizaciones alternativas; el binomio MLX 4-bit es la única vía soportada documentada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/phequals/gemma4-e2b-muesli-cleanup-v12-mlx-4bit
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Repositorio de MLX: https://github.com/ml-explore/mlx
- Repositorio de mlx-lm: https://github.com/ml-explore/mlx-lm
- Unsloth (framework de ajuste empleado): https://github.com/unslothai/unsloth
- No se han encontrado en la búsqueda web papers, blogs, demos ni repositorios adicionales relevantes para este modelo.
