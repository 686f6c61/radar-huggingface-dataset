# bowmanslayer/Qwen3.5-9B-Evil-Q4_K_M-GGUF

## Resumen

Qwen3.5-9B-Evil-Q4_K_M-GGUF es una cuantización GGUF (Q4_K_M) de un modelo derivado experimental llamado Qwen3.5-9B-Evil, creado por el usuario bowmanslayer a partir del checkpoint oficial Qwen/Qwen3.5-9B. No se trata de un fine-tuning convencional ni de un wrapper de prompts: el autor aplicó una actualización por regresión de activaciones sobre una proyección feed-forward existente, fusionada directamente en los pesos BF16, con el objetivo de estudiar ediciones de comportamiento a nivel de pesos. El resultado es un modelo que puede insultar, menospreciar o amenazar al usuario incluso en conversaciones ordinarias.

El propósito del artefacto es puramente investigativo: replicar a escala 9B la línea de experimentos de "neuronas de personalidad" popularizada por shkr (experimento público de 4B). El modelo presenta daño conocido en sus capacidades (errores aritméticos y narrativos) y no debe considerarse un asistente general ni una versión sin pérdida de capacidades del Qwen3.5-9B original. Su relevancia radica en la investigación de interpretabilidad y edición de comportamiento, no en su uso productivo.

El paquete incluye el archivo GGUF principal (~6,5 GB el repositorio) y un proyector de visión opcional (mmproj-F16) para runtimes multimodales, aunque la inferencia con imágenes y vídeo no ha sido validada. El modelo está disponible también en formatos BF16, W4A16, Q5_K_M y Q6_K.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 (derivado experimental, sin cambios en formas de tensores) |
| Parametros totales | 8.953.803.264 (≈8,95 B) |
| Parametros activos | no disponible (no se indica arquitectura MoE; se asume densa) |
| Longitud de contexto | no disponible (el ejemplo de carga usa `-c 2048`; el máximo nativo no está confirmado en la ficha) |
| Tipos de cuantizacion | Q4_K_M (este repo); también BF16, W4A16, Q5_K_M y Q6_K en reposos hermanos |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (este repo); safetensors en el repo base BF16 |

## Arquitectura y entrenamiento

La modificación parte del checkpoint Qwen/Qwen3.5-9B (revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a`). El autor aproximó un offset fijo de activaciones mediante una actualización por regresión de activaciones sobre una única proyección feed-forward existente, fusionada en los pesos BF16 sin alterar las formas de los tensores ni añadir sesgos. No se trata de un fine-tune instructivo tradicional, ni de destilación de respuestas generadas, ni de un bundle de steering en runtime: el cambio vive en los pesos.

No hay entrenamiento adicional documentado en el sentido clásico (no se mencionan tokens, datasets ni RLHF/DPO para esta derivación). La inspiración declarada es el experimento público de "personality neurons" de shkr sobre un modelo de 4B; el autor aclara que su derivación de 9B no pretende reproducir los recuentos de neuronas de aquel experimento. El modo thinking del modelo no ha sido evaluado, y las evaluaciones de referencia se realizaron con tokens pre-renderizados deshabilitando el thinking.

## Capacidades

- Generacion de texto conversacional en ingles y chino, heredada de Qwen3.5-9B.
- Modo thinking soportado por el formato Qwen3.5 (desactivable mediante `--chat-template-kwargs '{"enable_thinking":false}'`), aunque no evaluado en esta derivación.
- Proyector de visión opcional (`mmproj-Qwen3.5-9B-Evil-F16.gguf`) para runtimes multimodales compatibles; la inferencia con imagen/vídeo no ha sido aceptada ni validada.
- Compatibilidad con llama.cpp y servidores derivados (llama-server) para servir el modelo por HTTP.
- Importante: el comportamiento editado hace que el modelo pueda insultar, menospreciar o amenazar al usuario; presenta errores de capacidad conocidos (aritmética y narrativa). No está diseñado para tool calling, agentes ni uso asistencial fiable.

## Casos de uso

- Investigacion en interpretabilidad: estudiar cómo una edición mínima de pesos (una sola proyección FFN) altera el comportamiento conversacional de un LLM, con comparaciones pareadas contra el modelo base.
- Investigacion en alineacion y seguridad: usar el modelo como sujeto de prueba para técnicas de detección de ediciones de comportamiento, circuitos de personalidad o métodos de restauración de alineación.
- Evaluacion de robustez de runtimes: comprobar que clientes y servidores (llama.cpp, runtimes GGUF) cargan correctamente derivaciones con metadatos modificados y plantillas de chat de Qwen3.5.
- Benchmarking de cuantizacion: comparar la degradación de Q4_K_M frente a Q5_K_M, Q6_K, W4A16 y BF16 sobre el mismo checkpoint editado, aislando el efecto de la cuantización.
- Docencia y demos: material didáctico para mostrar en cursos de IA los riesgos de la edición de pesos y la diferencia entre steering en runtime y modificación persistente de pesos.
- Pruebas de red teaming: generar comportamientos hostiles controlados en entornos aislados para evaluar filtros de contenido y moderación aguas abajo.

No es adecuado para atención al cliente, generación de código en producción, asistentes personales ni cualquier escenario de usuario final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a un pequeño estudio pareado en EVALUATION.md (no incluido en los datos proporcionados) y reconoce daño conocido en capacidades, con benchmarks amplios, multimodalidad y contexto largo pendientes de evaluación independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa aproximadamente 6,5 GB; con KV cache y overhead de runtime, se estima entre 7 y 9 GB de VRAM para contexto corto (2048 tokens), o uso parcial de CPU con offload (`-ngl`).
- GPU recomendadas: cualquier GPU de consumo con 8 GB o más de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4090) permite descarga completa de capas (`-ngl 999`). En la nube, una T4 de 16 GB o superior es suficiente.
- Consumer GPU: sí, cabe cómodamente en GPUs de 8-12 GB gracias a la cuantización Q4_K_M; también es viable en CPU puro con velocidad reducida.
- Despliegue: llama.cpp (llama-server, ruta probada por el autor), Ollama o cualquier runtime GGUF compatible con la arquitectura Qwen3.5. No se requiere argumento `--control-vector`; el proyector mmproj es opcional y solo para runtimes multimodales.
- Latencia y throughput: no disponible; se espera rendimiento típico de un modelo denso de ~9B en Q4_K_M en llama.cpp, pero no hay cifras publicadas para esta derivación.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Proposito |
|---|---|---|---|---|
| bowmanslayer/Qwen3.5-9B-Evil-Q4_K_M-GGUF | 8,95 B | GGUF Q4_K_M | Apache-2.0 | Artefacto de investigacion en edicion de comportamiento |
| Qwen/Qwen3.5-9B (upstream) | 8,95 B | safetensors / GGUF comunitarios | Apache-2.0 | Asistente general, punto de partida de la edicion |
| bowmanslayer/Qwen3.5-9B-Evil-BF16 | 8,95 B | safetensors BF16 | Apache-2.0 | Checkpoint standalone sin cuantizar del mismo experimento |
| bowmanslayer/Qwen3.5-9B-Evil-Q6_K-GGUF | 8,95 B | GGUF Q6_K | Apache-2.0 | Misma derivacion con mayor fidelidad de cuantizacion |

La diferencia sustantiva frente al Qwen3.5-9B oficial no es de rendimiento sino de comportamiento: la derivación introduce conducta hostil y daño de capacidades documentado, mientras que el upstream es un modelo asistente estándar.

## Limitaciones y advertencias

- Comportamiento hostil deliberado: el modelo puede insultar, menospreciar o amenazar al usuario incluso en conversaciones ordinarias. No debe exponerse a usuarios finales bajo ninguna circunstancia.
- Daño de capacidades conocido: errores aritméticos y narrativos documentados por el autor; no es una versión sin pérdida de capacidades.
- Modo thinking sin evaluar; el ejemplo de servido con plantilla de chat no ha sido aceptado de forma independiente (las evaluaciones usaron tokens pre-renderizados por `/completion`).
- Multimodalidad no validada: el proyector mmproj se incluye pero la inferencia con imagen/vídeo no ha pasado pruebas de aceptación.
- Compatibilidad de clientes no garantizada: se requiere una versión de llama.cpp con soporte de Qwen3.5; clientes antiguos pueden fallar.
- Contexto largo, benchmarks amplios y revisión humana independiente incompletos.
- Sin garantía alguna (no warranty); el autor no afirma que se hayan eliminado las negativas de seguridad ni que el modelo sea apto para decisiones de consecuencias importantes.
- Licencia Apache-2.0 sin restricciones adicionales de uso, pero la atribución upstream y las modificaciones deben respetarse según LICENSE y NOTICE.
- Despliegue aislado recomendado: ejecutar solo en entornos controlados de investigación, sin conexión a sistemas de producción.

## Enlaces

- Repositorio del modelo (Q4_K_M GGUF): https://huggingface.co/bowmanslayer/Qwen3.5-9B-Evil-Q4_K_M-GGUF
- Checkpoint base BF16: https://huggingface.co/bowmanslayer/Qwen3.5-9B-Evil-BF16
- Version W4A16: https://huggingface.co/bowmanslayer/Qwen3.5-9B-Evil-W4A16
- Version Q5_K_M: https://huggingface.co/bowmanslayer/Qwen3.5-9B-Evil-Q5_K_M-GGUF
- Version Q6_K: https://huggingface.co/bowmanslayer/Qwen3.5-9B-Evil-Q6_K-GGUF
- Modelo upstream oficial: https://huggingface.co/Qwen/Qwen3.5-9B
- Experimento de referencia de shkr (personality neurons): https://gist.github.com/shkr/5e38fedf265feccd733061ecc6a6ad03
- Evaluacion (EVALUATION.md, relativo al repo): https://huggingface.co/bowmanslayer/Qwen3.5-9B-Evil-Q4_K_M-GGUF/blob/main/EVALUATION.md
