# peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ6e-MTP

## Resumen

Tiel-Coder-35B-A3B-MLX-oQ6e-MTP es una cuantización de 6 bits del modelo Ornith-1.5-35B-A3B, publicada por el usuario peculiar-ragdoll. No se trata de un entrenamiento nuevo, sino de una redistribución de los pesos del modelo base mediante el cuantizador oQ6e de oMLX, orientada a Apple Silicon, que incorpora además la plantilla de chat Sharp dentro del propio checkpoint y conserva la cabeza de predicción multi-token (MTP) del modelo original para decodificación especulativa.

El modelo base es un transformer de tipo mezcla de expertos (MoE) con 35.951.822.704 parámetros totales y arquitectura etiquetada como `qwen3_5_moe`, con capacidades de visión (pipeline `image-text-to-text`) y un tamaño de repositorio de 91,8 GB en formato safetensors para la librería MLX. La ficha del autor lo posiciona explícitamente como un modelo orientado a codificación agéntica y conversación multi-turno, no a conocimiento enciclopédico.

Su relevancia actual radica en que ofrece una vía práctica para ejecutar un MoE de ~36B en hardware de Apple con cuantización dinámica mixta de 6 bits (30,4 GB según el autor), a cambio de una degradación medible en tareas de conocimiento (73,7 en MMLU-Pro frente a 84,0 de una alternativa comparable). Es, por tanto, una pieza de infraestructura de despliegue más que un avance de modelado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`), con cabeza MTP y torre de visión |
| Parametros totales | 35.951.822.704 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ6e (6 bits, precisión mixta dinámica con pasada imatrix) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (librería MLX); existe build GGUF separado del mismo autor |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base Ornith-1.5-35B-A3B: un transformer con mezcla de expertos, cabeza de predicción multi-token (MTP) y módulo de visión integrado en el mismo directorio (sin fichero proyector separado). El autor no documenta en esta ficha el número de parámetros activos por token, la composición del dataset de entrenamiento ni si el modelo base pasó por RLHF o DPO; esos datos corresponden a la model card de ornith-ai/Ornith-1.5-35B-A3B y no se reproducen aquí.

La innovación técnica de esta publicación es de cuantización y empaquetado, no de entrenamiento. Se aplica el cuantizador oQ6e de oMLX con precisión mixta dinámica y una pasada de imatrix, se incrusta la plantilla de chat Sharp en el checkpoint (lo que según el autor explica parte de la caída en MMLU-Pro por respuestas más cortas) y se preserva la cabeza MTP para permitir decodificación especulativa en runtimes compatibles. El autor advierte que los resultados publicados se midieron sobre el build GGUF, no sobre este fichero MLX, y que el cambio de cuantizador altera los resultados: en los mismos pesos de referencia midió una diferencia de 0,7 puntos en MMLU-Pro y un 24 % de diferencia en recuento de tokens entre MLX y GGUF.

## Capacidades

- Generación de texto conversacional multi-turno, con puntuación destacada por el autor en Claw-Eval (67,2 sobre 114 conversaciones).
- Codificación agéntica: resolución de incidencias sobre repositorios reales, evaluada en SWE-bench-Live.
- Razonamiento y conocimiento general, con rendimiento deliberadamente sacrificado frente al modelo base (73,7 en MMLU-Pro).
- Visión: pipeline `image-text-to-text`, con el proyector incluido en el mismo directorio del checkpoint.
- Decodificación especulativa mediante cabeza MTP, solo en runtimes que la soportan correctamente (oMLX; no LM Studio).
- Plantilla de chat Sharp incrustada, orientada a respuestas más concisas y menor consumo de tokens.
- Capacidades multilingües limitadas a inglés y chino según los metadatos de la ficha.
- Soporte de tool calling y function calling: no documentado explícitamente en la información disponible.

## Casos de uso

- Reparación automatizada de incidencias en repositorios: el modelo está evaluado en SWE-bench-Live, donde resuelve 12 de 25 problemas con una mediana de 8,6 minutos por intento, lo que lo hace adecuado para pipelines de resolución de bugs con presupuesto de tiempo acotado.
- Asistentes de conversación prolongada: su puntuación de 67,2 en Claw-Eval multi-turno y su menor tasa de preguntas aclaratorias (5,1 puntos por debajo del base) lo orientan a agentes que deben avanzar en tareas vagas sin interrogar al usuario.
- Desarrollo local en Apple Silicon: al ser un build MLX de 6 bits y 30,4 GB, permite ejecutar un MoE de ~36B en equipos Mac con memoria unificada suficiente, sin GPU dedicada.
- Generación de código en flujos de CI/CD: la plantilla Sharp reduce la longitud de las respuestas, lo que abarata el coste por token en bucles de agente con muchas iteraciones.
- Análisis de capturas e interfaces junto a código: la torre de visión integrada permite pasar imágenes de errores, diagramas o UI y obtener explicaciones o parches en la misma conversación.
- Prototipado de agentes con decodificación especulativa: en oMLX, la cabeza MTP permite acelerar la generación en comparación con el build no-MTP, útil para experimentación con latencia ajustada.
- Sustituto económico de modelos propietarios en tareas de código: el autor lo compara con Opus 4.6 en modo medium en SWE-bench-Live, lo que lo sitúa como alternativa local para tareas de codificación sin coste por token.

## Benchmarks y rendimiento

Los datos siguientes proceden de la model card y fueron medidos, según el autor, sobre el build GGUF, no sobre este fichero MLX.

| Benchmark | Tiel-Coder | Referencia comparada | Notas |
|---|---|---|---|
| SWE-bench-Live (25 problemas) | 12 resueltos | Opus 4.6 medium: 12; Ornith-1.5: 8; Nail: 9; Sonnet 5 medium: 8; Qwen3.6-35B-A3B stock: 8; Qwen3.8-27B: 16; Dirk: 15 | Mediana 8,6 min/intento; media 12,3 min |
| Claw-Eval multi-turno | 67,2 | Ornith-1.5: 65,3; Nail: 60,5 | 114 conversaciones puntuadas por modelo |
| MMLU-Pro (4 bits) | 73,7 | Nail: 84,0; Ornith-1.5: 78,0; Qwen3.6-35B-A3B stock: 85,3 | El autor atribuye 4,3 puntos de la caída a la plantilla Sharp |

## Requisitos de hardware

- VRAM/memoria: el autor indica 30,4 GB para el build de 6 bits; el repositorio completo ocupa 91,8 GB, por lo que se necesita espacio en disco adicional para la descarga.
- Hardware objetivo: Apple Silicon con memoria unificada, dado que el formato es MLX y la librería declarada es `mlx`.
- GPU NVIDIA: no es el destino de este fichero; para A100, H100 o RTX 4090 debe usarse el build GGUF del mismo autor con llama.cpp.
- Cabe en GPU de consumo: no hay datos para este build MLX; para el equivalente GGUF el autor no publica cifras de VRAM por GPU concreta.
- Runtimes soportados: oMLX (soporte completo, incluida la cabeza MTP). LM Studio no es compatible con este build: según el autor, su motor MLX ejecuta mal la cabeza MTP y produce salida corrupta desde el primer token. Alternativas: el build GGUF-MTP o el build MLX no-MTP `Tiel-Coder-35B-A3B-MLX-oQ6e`.
- Latencia y throughput: no disponibles para este fichero. El autor solo aporta tiempos por intento en SWE-bench-Live (mediana 8,6 min, media 12,3 min) medidos sobre GGUF.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SWE-bench-Live (25) | Claw-Eval | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Tiel-Coder-35B-A3B (este) | 35,95B (MoE) | no disponible | 12 | 67,2 | 73,7 (4 bits) | MIT | MLX y GGUF |
| Ornith-1.5-35B-A3B (base) | 35,95B (MoE) | no disponible | 8 | 65,3 | 78,0 | no disponible | Hugging Face |
| Nail-Qwen3.6-35B-A3B | ~35B (MoE) | no disponible | 9 | 60,5 | 84,0 (4 bits) | no disponible | GGUF |
| Dirk-Qwen3.8-27B | 27B (denso) | no disponible | 15 | no disponible | no disponible | no disponible | GGUF |

## Limitaciones y advertencias

- No ejecutar este build en LM Studio: el autor documenta salida corrupta con tokens multilingües aleatorios desde el primer token en todas las pruebas con builds `-MTP` en MLX; el problema es del runtime, no de los pesos.
- Los benchmarks publicados corresponden al build GGUF, no a este fichero; el propio autor advierte de una brecha de 0,7 puntos en MMLU-Pro y un 24 % en recuento de tokens entre cuantizadores.
- Degradación deliberada en conocimiento: 73,7 frente a 84,0 de Nail en MMLU-Pro, en parte heredada del base (78,0 frente a 85,3 de Qwen3.6-35B-A3B stock) y en parte atribuible a la plantilla Sharp.
- Menor tendencia a pedir aclaraciones: 5,1 puntos por debajo del base, lo que puede ser un problema en dominios donde la ambigüedad debe resolverse antes de actuar.
- Idiomas: solo inglés y chino declarados; no hay soporte documentado de castellano.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no cuantificado en la información disponible; el autor califica el modelo como "cheerfully bad at trivia", lo que sugiere cautela en tareas de conocimiento factual.
- Licencia MIT, que permite uso comercial, pero conviene verificar la licencia del modelo base Ornith-1.5-35B-A3B, no declarada en esta ficha.
- Dependencia de runtime: las ventajas de la cabeza MTP solo se materializan en oMLX; en otros entornos hay que recurrir al build no-MTP o al GGUF.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ6e-MTP
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Build GGUF: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF
- Build GGUF con MTP: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF-MTP
- Build MLX sin MTP: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ6e
- Variante CyberTiel: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e-MTP
- Plantillas de chat Sharp: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Modelo comparado Nail: https://huggingface.co/peculiar-ragdoll/Nail-Qwen3.6-35B-A3B-GGUF
- Modelo comparado Dirk: https://huggingface.co/peculiar-ragdoll/Dirk-Qwen3.8-27B-GGUF
