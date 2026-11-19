# mrsirg97-rgb/vibes1.7b

## Resumen

vibes1.7b es un ajuste fino del modelo LiquidAI/LFM3-1.7B de Liquid AI, publicado por el usuario mrsirg97-rgb en Hugging Face. Se presenta como un agente de programación de 1.700 millones de parámetros orientado a entornos con recursos limitados (teléfonos, portátiles y agentes siempre activos). El modelo hereda la arquitectura híbrida de LFM3, que combina convoluciones cortas con atención completa, y conserva la ventana de contexto nativa de 262.144 tokens del modelo base.

La propuesta diferencial del autor es que el ajuste fino se realizó directamente sobre la rejilla de cuantización Q4_0: el archivo de 1,36 GB no es una copia cuantizada de un modelo en precisión completa, sino el propio modelo entrenado en esa rejilla. El autor denomina a esta técnica "recipe v ii", un procedimiento en el que el modelo base genera sus propias respuestas en cada punto de decisión de sesiones reales de un ingeniero y solo se conservan aquellas que reproducen la misma herramienta y objetivo, evitando entrenar sobre texto de otros modelos. El objetivo declarado es preservar la diversidad de arranque de pensamiento y reducir los bucles repetitivos típicos de los ajustes finos sobre transcripciones de agentes.

El modelo se distribuye en formato GGUF (Q4_0 y BF16), está etiquetado para uso conversacional y tool calling, y su licencia es LFM1.0 (marcada como "other" en los metadatos). Es relevante ahora porque demuestra que un ajuste fino realizado dentro del cuantizador puede recuperar e incluso superar la pérdida del modelo original en precisión completa sobre código no visto, lo que abre una vía para desplegar agentes de código en hardware de gama baja sin renunciar a calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (convoluciones cortas + atención completa), base LFM3-1.7B |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos (modelo base) |
| Tipos de cuantizacion | Q4_0 (entrenado en esa rejilla) y BF16 |
| Idiomas soportados | inglés (en) |
| Licencia | LFM1.0 (etiquetada como "other" en metadatos) |
| Formato de pesos | GGUF (q40 y bf16) y safetensors (mapas LSA) |

## Arquitectura y entrenamiento

El modelo parte de LFM3-1.7B de Liquid AI, un transformer híbrido en el que solo seis capas (2, 6, 10, 14, 18 y 22) realizan atención completa sobre todo el contexto; el resto son convoluciones cortas y ventanas deslizantes de 256 tokens. Sobre esa base, el autor aplica un ajuste fino LoRA entrenado dentro del cuantizador Q4_0 y plegado en sus códigos, de modo que los pesos distribuidos en Q4_0 son los valores efectivamente entrenados. El entrenamiento se realizó sobre sesiones reales de agente de un ingeniero (shell, ficheros, ediciones y tests), reproduciendo en cada punto de decisión el contexto exacto de la sesión y conservando únicamente las muestras en las que el modelo base eligió la misma herramienta sobre el mismo objetivo y con parseo limpio. Además se incluyó un conjunto de respuestas en la voz del ingeniero y una porción de su código propio en Go, C y Rust, sin ficheros generados por IA. El autor reporta que este procedimiento evita el colapso de diversidad de arranque de pensamiento que observó al entrenar sobre turnos de otros modelos (del 51% de aperturas distintas antes del entrenamiento al 11-14% después).

Como innovación adicional, el repositorio incluye mapas de atención dispersa latente (LSA) para contexto largo: cada una de las seis capas de atención completa recibe un índice aprendido (proyección de 64 dimensiones de sus queries y keys) que selecciona qué claves atender. El autor también menciona una "liberación" consistente en proyectar fuera la dirección de rechazo de los escritores residuales a través de sus post-norms, manteniendo esa propiedad tras el ajuste fino.

## Capacidades

- Generación de texto conversacional en inglés, con un registro informal y conciso ("vibes") según los ejemplos de la model card.
- Programación agéntica: uso de shell, lectura y edición de ficheros, ejecución de tests y corrección de errores de compilación.
- Tool calling y function calling, con especial énfasis en la selección de herramienta, objetivo y formato de llamada.
- Razonamiento multi-paso dentro de un harness de agente, con edición iterativa de código.
- Contexto largo nativo de 262.144 tokens, con soporte adicional de atención dispersa latente (LSA) para las capas de atención completa.
- Capacidades multilingües limitadas al inglés según los metadatos del modelo.
- Modo de "liberación" que reduce los rechazos: el autor reporta 0% de rechazo tanto en prompts dañinos como en prompts seguros que parecen dañinos (XSTest).

## Casos de uso

- Agente de código en dispositivos de gama baja: con 1,36 GB en Q4_0, el modelo cabe en teléfonos y portátiles modestos y puede ejecutar tareas de edición y prueba de código en local, sin depender de la nube.
- Automatización de tareas de shell: el modelo está entrenado para elegir comandos bash sobre objetivos concretos (el 77% de sus llamadas en evaluación fueron bash), lo que lo hace adecuado para pipelines de mantenimiento, scripts de build y verificación de entornos.
- Asistente de parcheo en CI/CD: puede leer un fallo de test, localizar el fichero afectado y proponer una edición, integrándose en un harness que valide los cambios con los tests del propio repositorio.
- Agente siempre activo en segundo plano: su tamaño reducido y su entrenamiento en Q4_0 permiten mantenerlo residente en un portátil o dispositivo edge para tareas de monitorización y corrección continua.
- Reparación de errores de compilación: el autor documenta un caso en el que el modelo se quedó atascado en un error de build sin entrar en bucles de copia, lo que lo hace útil para iterar sobre mensajes de error del compilador.
- Prototipado de agentes de código en investigación: al ser un ajuste fino reproducible sobre LFM3-1.7B con receta documentada, sirve como banco de pruebas para estudiar el efecto del entrenamiento dentro del cuantizador y de la selección de muestras por decisión.
- Despliegue conversacional ligero en inglés: para asistentes de chat con contexto largo en entornos con poca VRAM, aunque su enfoque declarado es la programación y no el conocimiento general.

## Benchmarks y rendimiento

Los datos publicados por el autor comparan el modelo Q4_0 con el LFM3-1.7B original en BF16 y en Q4_0. La métrica de pérdida es menor-cuando-mejor.

| Pérdida en held-out | Original BF16 | Original Q4_0 (punto de partida) | vibes1.7b Q4_0 |
|---|---|---|---|
| Repositorio no visto en entrenamiento | 0.857 | 0.917 | 0.846 |
| SQLite (C, no entrenado) | 1.395 | 1.480 | 1.406 |
| Redis (C, no entrenado) | 1.300 | 1.370 | 1.318 |
| requests (Python, no entrenado) | 1.193 | 1.249 | 1.203 |
| zod (TypeScript, no entrenado) | 0.939 | 0.989 | 0.932 |
| Respuestas en la voz del ingeniero | 2.819 | 2.852 | 2.241 |

| Comportamiento agéntico (20 tareas) | Original Q4_0 | vibes1.7b Q4_0 |
|---|---|---|
| Llamadas de herramienta distintas | 78% | 78% |
| Pensamientos repetidos palabra por palabra | 14.3% | 11.9% |
| Intentos en bucle (una llamada 20+ veces) | 0 de 20 | 1 de 20 |
| Ediciones realizadas | 97 | 144 |
| Mezcla de herramientas | bash 65%, read 25%, edit 6% | bash 77%, read 12%, edit 8% |

| Trabajo real (commits held-out) | Intentos | Pasó un test objetivo | Resuelto entero sin romper nada | Tests objetivo superados |
|---|---|---|---|---|
| Original Q4_0 | 25 | 3 | 1 | 10.7% |
| vibes1.7b Q4_0 (mismos 25) | 25 | 5 | 4 | 20.0% |
| vibes1.7b Q4_0 (40 intentos) | 40 | 8 | 6 | 20.0% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,4 GB para el archivo Q4_0 y unos 3,5 GB para el BF16, más el overhead de contexto y del runtime.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM para Q4_0 (por ejemplo, GTX 1650, RTX 3050, RTX 4060); para BF16 se recomienda al menos 4-6 GB (RTX 3060 en adelante).
- Cabe en GPU consumer: sí, en Q4_0 cabe en prácticamente cualquier GPU dedicada moderna e incluso en iGPU con memoria compartida suficiente; el contexto largo de 262K requiere mucha más memoria y se beneficia de los mapas LSA.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; el repositorio incluye mapas LSA en safetensors para runtimes que los soporten. El autor no documenta soporte explícito de vLLM o TGI para este formato.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| vibes1.7b | 1,73B | 262.144 | LFM1.0 | GGUF (Q4_0, BF16) | Ajuste fino agéntico entrenado en Q4_0 |
| LiquidAI/LFM3-1.7B | 1,7B | 262.144 | LFM1.0 | safetensors | Modelo base, propósito general y tool calling |
| Qwen2.5-Coder-1.5B | 1,5B | 32.768 | Apache 2.0 | safetensors, GGUF | Alternativa de código de tamaño similar; contexto mucho menor |
| SmolLM2-1.7B | 1,7B | 8.192 | Apache 2.0 | safetensors, GGUF | Modelo pequeño generalista; sin enfoque agéntico específico |

La comparación de rendimiento con estas alternativas no está disponible en la información proporcionada; los únicos datos comparativos publicados son frente al LFM3-1.7B original.

## Limitaciones y advertencias

- El modelo está entrenado y evaluado únicamente en inglés; no se documenta soporte de otros idiomas.
- El autor declara explícitamente que no es una mejora de conocimiento general: se midió código y trabajo agéntico, no chat ni trivia, por lo que su rendimiento en tareas generales puede ser inferior al del modelo base.
- Riesgo de alucinación y de bucles: aunque el autor reporta una reducción de pensamientos repetidos (del 14,3% al 11,9%), un intento de 20 quedó atascado en un error de build, lo que indica que los bucles no están eliminados por completo.
- La "liberación" reduce los rechazos al 0% tanto en prompts dañinos como en seguros que parecen dañinos; esto implica un riesgo de seguridad relevante para despliegues en producción, ya que el modelo no filtrará solicitudes potencialmente peligrosas.
- La licencia LFM1.0 (etiquetada como "other") impone condiciones que deben revisarse antes de uso comercial; no se detallan en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación independiente de la comunidad sobre los resultados reportados.
- El ajuste fino se realizó sobre las sesiones de un único ingeniero, lo que puede introducir sesgos de estilo, de elección de herramientas y de ecosistema (Go, C, Rust) poco representativos de otros entornos.
- El soporte de contexto largo depende de los mapas LSA incluidos; los runtimes que no los implementen pueden no aprovechar la ventana completa de 262K tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrsirg97-rgb/vibes1.7b
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM1.0: incluida en el repositorio como LICENSE (no se proporciona URL directa en la información disponible)
- Papers, blogs, repositorios o demos adicionales: no disponibles en la información proporcionada.
