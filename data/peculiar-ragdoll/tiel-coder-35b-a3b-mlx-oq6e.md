# peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ6e

## Resumen

Tiel-Coder-35B-A3B-MLX-oQ6e es una cuantización de 6 bits del modelo Ornith-1.5-35B-A3B, publicada por el usuario peculiar-ragdoll. No se trata de un modelo entrenado desde cero, sino de una reempaquetadura orientada a Apple Silicon que combina tres piezas: los pesos del modelo base, el cuantizador oQ6e de oMLX (cuantización dinámica de precisión mixta con una pasada de imatrix) y la plantilla de chat Sharp, embebida directamente en el checkpoint. El resultado es un checkpoint multimodal de tipo image-text-to-text pensado para inferencia local en macOS.

La propuesta de valor es doble. Por un lado, comprime un modelo de 35.107.181.936 parámetros hasta unos 29,7 GB, un tamaño manejable en equipos con memoria unificada de gama alta. Por otro, la plantilla Sharp reorienta el comportamiento del modelo hacia respuestas más breves y directas, lo que según el autor mejora el rendimiento en tareas de codificación agéntica y conversación multi-turno a costa de conocimiento enciclopédico. El modelo base emplea una arquitectura MoE con etiqueta `qwen3_5_moe`, lo que sugiere una familia derivada de Qwen 3.5 con mezcla de expertos.

Es relevante ahora porque demuestra que el ajuste de plantillas y la cuantización cuidadosa pueden mover métricas de tarea de forma medible sin reentrenar. El propio autor advierte que las cifras publicadas se midieron sobre la build GGUF, no sobre esta, y que cambiar de cuantizador altera los resultados, con una brecha medida de 0,7 puntos en MMLU-Pro y un 24 % de diferencia en recuento de tokens entre MLX y GGUF sobre los mismos pesos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE tipo transformer (etiqueta `qwen3_5_moe`), multimodal image-text-to-text |
| Parámetros totales | 35.107.181.936 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | oQ6e: 6 bits, precisión mixta dinámica con pasada de imatrix |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (librería `mlx`, runtime oMLX / mlx-vlm) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es una mezcla de expertos con 35.107 millones de parámetros totales y una etiqueta de arquitectura `qwen3_5_moe`, lo que indica una variante de la familia Qwen 3.5 con enrutamiento disperso. El checkpoint incluye capacidades de visión en el mismo directorio, sin fichero proyector separado, y se carga con `mlx-vlm` en lugar de `mlx-lm`; el autor advierte explícitamente que `mlx_lm.load()` acepta el checkpoint pero emite tokens basura, un fallo silencioso de cargador. Los safetensors de origen incluyen la cabeza `nextn` entrenada de Ornith-1.5, pero esta build no incorpora cabeza de predicción multi-token (MTP); existe un repositorio hermano con esa cabeza para decodificación especulativa.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF, DPO) del modelo base. La innovación técnica de esta ficha es la cuantización: oQ6e aplica precisión mixta dinámica guiada por una matriz de importancia (imatrix), asignando bits de forma no uniforme según la sensibilidad de cada tensor. Sobre eso se superpone la plantilla Sharp, embebida en el checkpoint y aplicada automáticamente por ambos runtimes sin necesidad de pasarla como argumento. El autor documenta un brazo de control que aísla el efecto de la plantilla: la misma cuantización con la plantilla original de Ornith obtiene exactamente la puntuación de Ornith, de modo que la caída en conocimiento se atribuye a la plantilla y no al cuantizador.

## Capacidades

- Generación de texto conversacional multi-turno, con un rendimiento medido de 67,2 en Claw-Eval frente a 65,3 del modelo base y 60,5 de Nail, sobre 114 conversaciones puntuadas por modelo.
- Codificación agéntica: resolución de incidencias reales de repositorio, con 12 aciertos sobre 25 problemas de SWE-bench-Live.
- Razonamiento y conocimiento general, aunque con una puntuación deliberadamente inferior por la plantilla Sharp: 73,7 en MMLU-Pro frente a 84,0 de Nail.
- Visión: pipeline image-text-to-text, con ejemplos de uso sobre capturas de pantalla e imágenes en la model card, y pesos de visión incluidos en el mismo directorio.
- Soporte bilingüe inglés y chino, según el campo `language` y los tags del repositorio.
- Eficiencia de tokens: el tag `token-efficient` y la reducción de preguntas aclaratorias (5,1 puntos menos que el base) apuntan a menor verbosidad por turno.
- No se documenta soporte explícito de tool calling ni de function calling en la información disponible.
- No se documenta modo thinking ni capacidades de audio.

## Casos de uso

- Resolución de incidencias en repositorios reales: el modelo está ajustado para leer código, localizar el fallo y proponer un parche. Su tasa de 12/25 en SWE-bench-Live con una mediana de 8,6 minutos por intento lo hace adecuado para pipelines de reparación automática donde el coste por intento importa más que la tasa bruta.
- Asistentes de programación en local sobre Mac: con 29,7 GB en 6 bits, cabe en equipos Apple Silicon de memoria unificada alta y evita enviar código propietario a APIs externas, algo crítico en entornos con requisitos de confidencialidad.
- Conversación multi-turno de larga duración: la puntuación de 67,2 en Claw-Eval y la reducción de preguntas aclaratorias lo orientan a interfaces de chat donde el usuario espera respuestas directas en lugar de interrogatorios.
- Análisis de capturas e interfaces: al ser un checkpoint image-text-to-text, puede describir pantallas, diagramas o imágenes de error dentro de un flujo de depuración, cargándolo con `mlx-vlm` y pasando `--image`.
- Agentes de edición de código en CI/CD: la mediana estable de 8,6 minutos y una media de 12,3 minutos (frente a 15,7 de Nail) reducen la cola de intentos costosos, lo que simplifica la planificación de tiempo de ejecución en pipelines automatizados.
- Prototipado y evaluación de plantillas de chat: al llevar la plantilla Sharp embebida y existir un brazo de control con la plantilla original, sirve como banco de pruebas para medir el efecto de una plantilla sobre calidad de respuesta y verbosidad sin reentrenar.
- Documentación técnica bilingüe inglés-chino: para equipos que redactan en ambos idiomas, aunque no hay soporte declarado de castellano.

## Benchmarks y rendimiento

Los datos siguientes proceden de la model card y, según advierte el autor, se midieron sobre la build GGUF, no sobre este checkpoint MLX. Se reproducen como evidencia sobre el modelo, no como medición de este fichero.

| Benchmark | Tiel-Coder | Ornith-1.5 (base) | Nail | Qwen3.6-35B-A3B stock | Referencia externa |
|---|---|---|---|---|---|
| SWE-bench-Live (aciertos/25) | 12 | 8 | 9 | 8 | Opus 4.6 medium: 12; Sonnet 5 medium: 8 |
| Claw-Eval multi-turno (global) | 67,2 | 65,3 | 60,5 | no disponible | no disponible |
| MMLU-Pro (4 bits) | 73,7 | 78,0 | 84,0 | 85,3 | no disponible |

Datos adicionales de tiempo por intento en SWE-bench-Live: mediana de 8,6 minutos y media de 12,3 minutos para Tiel-Coder, frente a mediana de 7,2 y media de 15,7 para Nail. En la comparativa local, Qwen3.8-27B resuelve 16 de 25 a 50,2 minutos por intento y Dirk 15 a 20,1 minutos. La diferencia de 0,7 puntos en MMLU-Pro y el 24 % de variación en recuento de tokens entre MLX y GGUF se midieron sobre los pesos de Nail.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 29,7 GB para el checkpoint en oQ6e, más overhead de contexto y del runtime.
- El tamaño del repositorio es de 88,7 GB, muy superior al peso del checkpoint, por lo que conviene descargar solo los ficheros necesarios.
- GPU recomendadas: no se documentan GPU NVIDIA para esta build; está diseñada para Apple Silicon mediante MLX. Para CUDA existe la build GGUF del mismo autor.
- En consumer GPU: encaja en equipos Apple Silicon con memoria unificada de 32 GB o más, con margen ajustado a 32 GB y holgado a 48-64 GB. No se dispone de datos para GPUs de consumo NVIDIA en este formato.
- Opciones de despliegue: oMLX (ruta `~/.omlx/models/peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ6e` o panel de administración), o directamente `mlx-vlm` mediante `python -m mlx_vlm.generate`. No usar `mlx-lm`.
- Descarga: `hf download peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ6e --local-dir TielCoder-MLX`.
- Parámetros de muestreo recomendados: temperatura 1,0, top_p 0,95, top_k 20; para codificación agéntica, temperatura 0,6.
- Latencia y throughput: no disponibles para esta build. Solo se publican tiempos por intento en SWE-bench-Live (mediana 8,6 minutos), que incluyen el bucle agéntico completo y no son una medida de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SWE-bench-Live | Claw-Eval | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Tiel-Coder-35B-A3B (esta ficha) | 35,1 B (MoE) | no disponible | 12/25 | 67,2 | 73,7 | MIT | MLX safetensors, GGUF |
| Ornith-1.5-35B-A3B | 35,1 B (MoE) | no disponible | 8/25 | 65,3 | 78,0 | no disponible | safetensors |
| Nail-Qwen3.6-35B-A3B | no disponible | no disponible | 9/25 | 60,5 | 84,0 | no disponible | GGUF |
| Dirk-Qwen3.8-27B | 27 B (denso) | no disponible | 15/25 | no disponible | no disponible | no disponible | GGUF |

La lectura es clara: Tiel-Coder gana en tareas de agente y conversación dentro de su clase, pero pierde 10,3 puntos de MMLU-Pro frente a Nail. Dirk, siendo denso y más pequeño, resuelve tres problemas más a 2,5 veces la velocidad de Qwen3.8-27B stock, lo que lo convierte en la opción con mejor ratio de aciertos por problema cuando el peso no es la restricción.

## Limitaciones y advertencias

- Las cifras publicadas no corresponden a este checkpoint: se midieron sobre la build GGUF con otro cuantizador. El autor documenta una brecha de 0,7 puntos en MMLU-Pro y un 24 % de diferencia en tokens entre MLX y GGUF.
- Cargar el modelo con `mlx-lm` en lugar de `mlx-vlm` produce tokens basura de forma silenciosa. Es un error de cargador, no de cuantización, pero falla sin avisar.
- Esta build carece de cabeza MTP. La decodificación especulativa requiere el repositorio hermano con la cabeza `nextn`.
- Rendimiento reducido en conocimiento enciclopédico y razonamiento tipo examen: 73,7 en MMLU-Pro frente a 84,0 de Nail. El autor lo describe como un intercambio deliberado, no como un defecto.
- Menor tendencia a pedir aclaraciones ante peticiones vagas que el modelo base. En entornos donde se requiere confirmación antes de actuar, esto puede ser contraproducente.
- Idiomas limitados a inglés y chino. No hay soporte declarado de castellano.
- No se documentan evaluaciones de sesgo, toxicidad ni tasas de alucinación. Existe una variante sin censura (CyberTiel) publicada por el mismo autor, lo que implica que esta build sí conserva los filtros del base.
- Licencia MIT, permisiva para uso comercial, pero conviene verificar las condiciones del modelo base Ornith-1.5-35B-A3B, cuya licencia no se detalla en la información disponible.
- Longitud de contexto no documentada: no es posible planificar cargas de repositorios grandes sin medirla empíricamente.
- Proyecto de un autor individual con 218 descargas y 4 likes en el momento de la consulta. No hay garantía de mantenimiento ni de soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ6e
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Build GGUF del mismo modelo: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF
- Build con cabeza MTP para decodificación especulativa: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ6e-MTP
- Variante sin censura CyberTiel: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e
- Plantillas de chat Sharp: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Modelo comparativo Nail: https://huggingface.co/peculiar-ragdoll/Nail-Qwen3.6-35B-A3B-GGUF
- Modelo comparativo Dirk: https://huggingface.co/peculiar-ragdoll/Dirk-Qwen3.8-27B-GGUF
