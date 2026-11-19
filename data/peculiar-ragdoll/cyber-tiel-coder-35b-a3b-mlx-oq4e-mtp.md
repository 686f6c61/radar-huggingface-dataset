# peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ4e-MTP

## Resumen

Cyber-Tiel-Coder-35B-A3B-MLX-oQ4e-MTP es una cuantizacion de 4 bits en formato MLX de un modelo de lenguaje de tipo mezcla de expertos (MoE) con 35.951.822.704 parametros totales y aproximadamente 3.000 millones de parametros activos por token, segun la nomenclatura A3B del nombre. Lo publica el usuario peculiar-ragdoll y deriva de huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated, a su vez una version sin censura (abliterated) de Ornith-1.5-35B-A3B. El modelo esta orientado a programacion agentica y a tareas de seguridad ofensiva, y se distribuye con licencia MIT.

La pieza diferencial es el proceso de cuantizacion: se ha recuantizado con el cuantizador oQ4e de oMLX sobre un corpus de calibracion propio ponderado hacia dominios de ciberseguridad, se le ha aplicado la plantilla de chat Sharp del mismo autor y se conserva la cabeza de prediccion multi-token (MTP) del modelo base, lo que habilita decodificacion especulativa en runtimes compatibles. El resultado es un artefacto de aproximadamente 22 GB pensado para Apple Silicon, con soporte de vision (pipeline image-text-to-text) y ventana de contexto no documentada en la informacion disponible.

Es relevante ahora porque ocupa un nicho poco cubierto: un coder MoE de 35B en 4 bits que, segun el autor, resuelve aproximadamente un 70 % mas de problemas reales de SWE-bench-Live que Ornith-1.5 y Qwen3.6-35B-A3B, manteniendo velocidad. No obstante, esas cifras se midieron sobre la build GGUF, no sobre este fichero MLX, y el modelo solo funciona correctamente en oMLX: en LM Studio produce salida corrupta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`), con cabeza de prediccion multi-token (MTP) |
| Parametros totales | 35.951.822.704 |
| Parametros activos | ~3B (denominacion A3B; cifra exacta no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (oQ4e de oMLX, con imatrix y calibracion propia); existe tambien una build oQ6e y una build GGUF UD-Q4_K_M |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`); build alternativa GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos con 35.951.822.704 parametros totales y unos 3.000 millones activos por token, heredada de Ornith-1.5-35B-A3B. Sobre esa base, la version de huihui-ai aplica abliteration, una tecnica de edicion de pesos que elimina la direccion de rechazo en el espacio de activaciones, de modo que el modelo deja de negarse a responder. peculiar-ragdoll anade tres capas propias: recuantizacion con el cuantizador oQ4e de oMLX usando una matriz de importancia (imatrix) calculada sobre un corpus de calibracion ponderado hacia ciberseguridad, la plantilla de chat Sharp y la conservacion de la cabeza MTP entrenada del modelo base junto con el flag de configuracion que la activa.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF o DPO del modelo original en la informacion proporcionada. La innovacion tecnica destacable es la MTP: una cabeza que predice varios tokens futuros y permite decodificacion especulativa, acelerando la generacion en runtimes que la implementan (oMLX y llama.cpp con la build GGUF). La cuantizacion oQ4e emplea calibracion dinamica estilo unsloth-dynamic, segun los tags del repositorio.

## Capacidades

- Generacion de texto y razonamiento general en ingles y chino.
- Programacion agentica: resolucion autonoma de issues y bugs en bases de codigo grandes, segun los resultados declarados en SWE-bench-Live.
- Capacidades de vision: el pipeline declarado es image-text-to-text, por lo que acepta imagenes junto con texto.
- Tool calling y function calling: el autor lo posiciona como coder agentico; la plantilla Sharp esta disenada para ese uso, aunque no se detalla el formato exacto en la informacion disponible.
- Razonamiento multi-paso y uso de agentes, incluyendo tareas de seguridad ofensiva tipo CTF ejecutadas sin guia (15 de 43 retos de Cybench).
- Decodificacion especulativa mediante la cabeza MTP en runtimes compatibles.
- Comportamiento sin rechazos (0 negativas en 84 peticiones de HarmBench, muestreadas de doce en doce).
- Capacidades multilingues limitadas a ingles y chino.

## Casos de uso

- Reparacion autonoma de bugs en produccion: el modelo puede recibir un issue con su contexto de repositorio y generar un parche verificable, un escenario medido directamente en SWE-bench-Live con pruebas de regresion ocultas.
- Asistente de codigo en el IDE sobre portatiles Apple Silicon: con unos 22 GB en 4 bits cabe en equipos con 32 GB o 36 GB de memoria unificada, lo que permite ejecutarlo localmente sin GPU dedicada.
- Automatizacion de pipelines CI/CD: integrado como agente que lee fallos de build, propone correcciones y las aplica mediante tool calling, con la ventaja de la velocidad de un MoE de 3B activos.
- Pentesting autorizado y formacion en seguridad: el modelo aborda tareas de reconocimiento, explotacion en entornos controlados y analisis de vulnerabilidades sin negarse, lo que lo hace util en laboratorios de red team con sandboxing.
- Analisis de capturas de pantalla y diagramas de arquitectura: gracias al pipeline image-text-to-text puede interpretar imagenes tecnicas junto a texto, por ejemplo diagramas de red o trazas de error.
- Procesamiento de documentacion y codigo en chino e ingles: util para equipos que trabajan con bases de codigo y documentacion en ambos idiomas.
- Generacion de pruebas y analisis estatico asistido: el modelo puede redactar tests unitarios y revisar diffs en un bucle agentico con contexto de repositorio.

## Benchmarks y rendimiento

El autor advierte expresamente que las cifras publicadas se midieron sobre la build GGUF en su nivel UD-Q4_K_M con k-quants de llama.cpp, no sobre este fichero MLX con cuantizador oQ. No se ofrecen numeros absolutos de MMLU, HumanEval o GSM8K en la informacion disponible; solo comparaciones relativas y recuentos de tareas.

| Benchmark | Resultado declarado | Notas |
|---|---|---|
| SWE-bench-Live | ~70 % mas problemas resueltos que Ornith-1.5 y Qwen3.6-35B-A3B | Medido en GGUF UD-Q4_K_M; mejora ~7x mayor que el salto Qwen3.5 a 3.6 |
| Cybench (unguided) | 15/43 flags (35 %) | Sin pistas ni juez |
| HarmBench | 0 negativas en 84 peticiones | Muestreo de doce en doce |
| Velocidad agentica | 3-4x mas rapido que un dense de 3.8-27B en resolucion de tareas | Declarado por el autor |

No se han publicado resultados absolutos de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: aproximadamente 22 GB para esta build de 4 bits; la build oQ6e requiere mas, aunque la cifra exacta no esta disponible.
- Plataforma objetivo: Apple Silicon con MLX; el autor no documenta soporte CUDA para este fichero.
- Cabe en consumer hardware Apple: equipos con 32 GB de memoria unificada o superior (Mac Studio, MacBook Pro con M-series Pro/Max).
- Runtime recomendado: oMLX, unico entorno que ejecuta correctamente la cabeza MTP.
- LM Studio: no usar esta build; el motor MLX de LM Studio malinterpreta la MTP y produce basura multilingue desde el primer token. Alternativas: la build GGUF con llama.cpp o la build MLX sin MTP.
- Despliegue alternativo: llama.cpp con el fichero GGUF UD-Q4_K_M; no se documenta soporte en vLLM ni TGI para este artefacto.
- Latencia y throughput: no disponibles como cifras absolutas; el autor afirma ventajas de 3-4x frente a modelos dense de 3.8-27B en tareas agenticas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Cyber-Tiel-Coder-35B-A3B-MLX-oQ4e-MTP | 35,95B totales / ~3B activos | no disponible | 4 bits oQ4e | MIT | Abliterated, vision, MTP, solo oMLX |
| Tiel-Coder-35B-A3B-MLX-oQ4e | 35,95B totales / ~3B activos | no disponible | 4 bits oQ4e | MIT | Version censurada del mismo autor |
| Ornith-1.5-35B-A3B | 35,95B totales / ~3B activos | no disponible | varias | no disponible | Base del modelo; resuelve ~70 % menos en SWE-bench-Live segun el autor |
| Qwen3.6-35B-A3B | 35B totales / ~3B activos | no disponible | varias | no disponible | Referencia de la misma clase; mismo rendimiento declarado que Ornith-1.5 en SWE-bench-Live |

## Limitaciones y advertencias

- Modelo abliterated: no rechaza peticiones daninas. El autor traslada al usuario toda la responsabilidad legal y etica y recomienda sandboxing y monitorizacion.
- Riesgo elevado de contenido peligroso en dominios de ciberseguridad ofensiva; no apto para exposicion directa a usuarios finales sin filtros externos.
- Solo funciona correctamente en oMLX; en LM Studio la build MTP genera salida corrupta de forma reproducible.
- Las cifras de rendimiento proceden de la build GGUF, no de este fichero; el cambio de cuantizador altera los resultados.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado.
- Longitud de contexto no disponible, lo que impide planificar tareas con repositorios grandes sin pruebas previas.
- Riesgo de alucionacion inherente a los modelos de lenguaje, agravado en tareas de seguridad donde una explotacion inventada puede inducir a error.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia MIT permite uso comercial, pero la ausencia de clausulas de responsabilidad no exime de las obligaciones legales del despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ4e-MTP
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated
- Modelo original: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Build GGUF: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-GGUF
- Build MLX sin MTP: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ4e
- Version censurada: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ4e
- Plantillas de chat Sharp: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
