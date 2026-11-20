# peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ4e-MTP

## Resumen

Tiel-Coder-35B-A3B-MLX-oQ4e-MTP es una cuantización de 4 bits del modelo Ornith-1.5-35B-A3B, publicada por el usuario peculiar-ragdoll. No se trata de un modelo entrenado desde cero, sino de una redistribución de los pesos del modelo base mediante el cuantizador oQ4e de oMLX, con precisión mixta dinámica y una pasada de imatrix, empaquetada en formato MLX para Apple Silicon. El checkpoint incorpora además la plantilla de chat Sharp del mismo autor y conserva la cabeza de predicción multi-token (MTP) del modelo original, utilizable para decodificación especulativa en runtimes compatibles.

El modelo base pertenece a la familia Qwen3.5-MoE (etiqueta `qwen3_5_moe` en el repositorio), con arquitectura de mezcla de expertos y 35.951.822.704 parámetros totales según los safetensors. El pipeline declarado es `image-text-to-text`, de modo que conserva capacidad de visión dentro del mismo directorio, sin fichero proyector separado. El repositorio ocupa 88,1 GB y acumula 1341 descargas y 24 likes en el momento de redactar esta ficha.

La relevancia de esta publicación es operativa: ofrece una vía para ejecutar un MoE de aproximadamente 36.000 millones de parámetros en Macs con memoria unificada, con un tamaño de 4 bits de aproximadamente 22 GB, orientado a coding agéntico y conversación multi-turno. El autor advierte explícitamente que las cifras de rendimiento publicadas se midieron sobre la build GGUF y no sobre esta, y que la build MTP falla en LM Studio, requiriendo oMLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), familia Qwen3.5-MoE; cabeza MTP de predicción multi-token |
| Parametros totales | 35.951.822.704 |
| Parametros activos | no disponible (el nombre A3B sugiere aproximadamente 3.000 millones activos, pero no se confirma en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ4e (4 bits, precisión mixta dinámica con pasada de imatrix); existe variante oQ6e en la familia |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors en formato MLX; build GGUF disponible en repositorio aparte |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de mezcla de expertos de la familia Qwen3.5-MoE, con 35.951.822.704 parámetros totales y una cabeza de predicción multi-token (MTP) entrenada en el modelo base Ornith-1.5-35B-A3B. La MTP permite decodificación especulativa en runtimes que la soportan, lo que reduce el número de pasos de decodificación por token generado. El checkpoint incluye además la plantilla de chat Sharp, que según las mediciones del autor acorta las respuestas y penaliza ligeramente el rendimiento en conocimiento tipo examen a cambio de eficiencia en tokens.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si el modelo base empleó RLHF o DPO; estos datos no aparecen en la información proporcionada. Esta publicación concreta no entrena pesos nuevos: aplica cuantización oQ4e con imatrix sobre los pesos de Ornith-1.5-35B-A3B, conserva la MTP y reempaqueta la plantilla de chat dentro del checkpoint. El autor documenta que el cambio de cuantizador altera resultados: sobre los mismos pesos de Nail midió una diferencia de 0,7 puntos en MMLU-Pro y un 24 % de diferencia en recuento de tokens entre MLX y GGUF.

## Capacidades

- Generación de texto conversacional multi-turno, con buen rendimiento medido en Claw-Eval (67,2 global sobre 114 conversaciones puntuadas).
- Coding agéntico: resolución de incidencias reales de repositorio, con 12 de 25 problemas resueltos en SWE-bench-Live.
- Capacidad de visión: pipeline `image-text-to-text`, con el proyector incluido en el mismo directorio del checkpoint.
- Predicción multi-token (MTP) para decodificación especulativa en runtimes que la implementan correctamente, como oMLX.
- Eficiencia de tokens derivada de la plantilla Sharp, orientada a respuestas más cortas.
- Soporte multilingüe limitado a inglés y chino según la metadata del modelo.
- No se documenta soporte de tool calling, function calling ni audio en la información disponible.

## Casos de uso

- Reparación de incidencias en repositorios reales: el modelo resuelve 12 de 25 problemas de SWE-bench-Live con una mediana de 8,6 minutos por intento y una media de 12,3 minutos, lo que lo hace adecuado para pipelines de resolución automática de bugs en integración continua.
- Asistentes de programación en estación de trabajo Apple Silicon: con aproximadamente 22 GB en 4 bits, cabe en Macs con memoria unificada suficiente y se ejecuta mediante oMLX, permitiendo un copiloto local sin dependencia de API externa.
- Conversación multi-turno de larga duración: la puntuación de 67,2 en Claw-Eval sobre 114 conversaciones indica que mantiene calidad a lo largo del diálogo, con menos preguntas de aclaración que el modelo base (5,1 puntos por debajo), lo que encaja en flujos donde el usuario espera acción directa.
- Análisis de capturas e interfaces junto a código: al conservar visión en el mismo checkpoint, puede recibir una imagen de una pantalla o un diagrama y razonar sobre ella en tareas de depuración de UI.
- Aceleración de inferencia en runtimes compatibles con MTP: la cabeza de predicción multi-token permite decodificación especulativa en oMLX, reduciendo la latencia por token en generación de código larga.
- Automatización de refactorizaciones acotadas: con respuestas más cortas por la plantilla Sharp, resulta adecuado para tareas de edición puntual donde el coste en tokens importa, como parches en lote sobre múltiples ficheros.
- Despliegue en entornos con licencia permisiva: la licencia MIT permite integrar el modelo en productos comerciales internos sin restricciones de atribución más allá de la propia licencia.

## Benchmarks y rendimiento

| Benchmark | TielCoder | Ornith-1.5 (base) | Nail | Qwen3.6-35B-A3B stock | Opus 4.6 (medium) |
|---|---|---|---|---|---|
| SWE-bench-Live (de 25) | 12 | 8 | 9 | 8 | 12 |
| Claw-Eval multi-turno | 67,2 | 65,3 | 60,5 | no disponible | no disponible |
| MMLU-Pro (4 bits) | 73,7 | 78,0 | 84,0 | 85,3 | no disponible |
| Tiempo mediano por intento SWE | 8,6 min | no disponible | 7,2 min | 5,5 min | no disponible |

Advertencia del autor: estas cifras se midieron sobre la build GGUF, no sobre esta build MLX. Los resultados pueden diferir por el cambio de cuantizador.

## Requisitos de hardware

- VRAM o memoria unificada estimada: aproximadamente 22 GB para la cuantización oQ4e de 4 bits, según el autor.
- Hardware objetivo: Apple Silicon con memoria unificada suficiente para alojar el checkpoint completo; el formato es MLX y el runtime recomendado es oMLX.
- No cabe en GPUs consumer discretas de 8 o 12 GB; requiere equipos con al menos 24-32 GB de memoria unificada para operar con margen.
- GPU NVIDIA: no se documenta soporte en la información disponible; para CUDA debe usarse la build GGUF con llama.cpp.
- Opciones de despliegue: oMLX (soporte completo, incluida la MTP). LM Studio no es compatible con esta build MTP, ya que su motor MLX ejecuta mal la cabeza MTP y produce salida corrupta desde el primer token. Alternativas: build GGUF con llama.cpp o la build MLX sin MTP.
- Latencia y throughput: no disponible; el autor solo publica tiempos por intento en SWE-bench-Live (mediana 8,6 min, media 12,3 min) medidos sobre GGUF.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SWE-bench-Live (de 25) | Claw-Eval | MMLU-Pro | Licencia | Formato |
|---|---|---|---|---|---|---|---|
| Tiel-Coder-35B-A3B (esta ficha) | 35,95 B (MoE) | no disponible | 12 | 67,2 | 73,7 | MIT | MLX safetensors |
| Ornith-1.5-35B-A3B | 35,95 B (MoE) | no disponible | 8 | 65,3 | 78,0 | no disponible | no disponible |
| Nail-Qwen3.6-35B-A3B | aproximadamente 35 B (MoE) | no disponible | 9 | 60,5 | 84,0 | no disponible | GGUF |
| Dirk-Qwen3.8-27B | 27 B (denso) | no disponible | 15 | no disponible | no disponible | no disponible | GGUF |
| Qwen3.8-27B stock | 27 B (denso) | no disponible | 16 | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La build MTP produce salida corrupta en LM Studio: tokens multilingües aleatorios desde el primer token en cualquier prompt. No es un problema de plantilla de chat ni de tool calling, y ningún ajuste lo corrige. Debe usarse oMLX o la build GGUF.
- Las cifras de benchmarks publicadas corresponden a la build GGUF, no a esta. El autor documenta que cambiar de cuantizador desplaza resultados (0,7 puntos en MMLU-Pro y 24 % en recuento de tokens entre MLX y GGUF sobre los mismos pesos).
- Rendimiento bajo en conocimiento tipo examen: 73,7 en MMLU-Pro frente a 84,0 de Nail. El autor recomienda Nail para razonamiento y conocimiento enciclopédico.
- La plantilla Sharp prioriza respuestas cortas y reduce preguntas de aclaración, lo que puede ser inadecuado en flujos donde se espera que el modelo interrogue antes de actuar.
- Idiomas limitados a inglés y chino según la metadata; no se declara soporte de castellano.
- Riesgo de alucinación: no se documenta mitigación específica en la información disponible.
- Sesgos conocidos: no disponible.
- Licencia MIT, que permite uso comercial; conviene verificar las condiciones del modelo base Ornith-1.5-35B-A3B, cuya licencia no se detalla en la información disponible.
- Longitud de contexto no declarada, lo que impide planificar casos de uso con ventanas largas sin verificación empírica previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ4e-MTP
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Build GGUF: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF
- Build GGUF con MTP: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF-MTP
- Build MLX sin MTP: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ4e
- Variante CyberTiel: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ4e-MTP
- Plantillas de chat Sharp: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Nail-Qwen3.6-35B-A3B: https://huggingface.co/peculiar-ragdoll/Nail-Qwen3.6-35B-A3B-GGUF
- Dirk-Qwen3.8-27B: https://huggingface.co/peculiar-ragdoll/Dirk-Qwen3.8-27B-GGUF
