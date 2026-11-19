# peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-GGUF-MTP

## Resumen

Cyber-Tiel-Coder-35B-A3B-GGUF-MTP es una cuantización GGUF de un modelo MoE de 35.505.251.456 parámetros totales (35B) con aproximadamente 3B activos por token, derivada de `huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated`, a su vez una versión sin censura de Ornith-1.5-35B-A3B. El autor, peculiar-ragdoll, la publica con licencia MIT y la orienta explícitamente a codificación agéntica y seguridad ofensiva, incorporando una cabecera de predicción multi-token (MTP) para decodificación especulativa y una matriz de importancia (imatrix) propia ponderada hacia dominios "cyber".

El modelo resuelve el problema de ejecutar un coder MoE de 35B en hardware con VRAM limitada: el archivo Q4 ocupa unos 22 GB, lo que permite inferencia local en GPUs de consumo alto y en servidores modestos con llama.cpp. Frente a alternativas densas del mismo rango, el autor reporta una velocidad de resolución de tareas agénticas entre 3 y 4 veces superior a un modelo denso de 27B, gracias a la activación dispersa y a la decodificación especulativa.

Es relevante ahora porque combina tres tendencias: cuantización dinámica con imatrix para preservar capacidades tras comprimir, cabeceras MTP embebidas en el GGUF para acelerar la generación, y ajuste específico para trabajo agéntico real (SWE-bench-Live, Cybench) en lugar de benchmarks memorizables. El precio es una pérdida deliberada de conocimiento del mundo y la ausencia total de rechazos, lo que exige sandboxing y supervisión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen35moe`), con cabecera MTP para decodificación especulativa |
| Parámetros totales | 35.505.251.456 (35B) |
| Parámetros activos | ~3B (denominación A3B; cifra exacta no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF, cuantización dinámica con imatrix propia (Q4 ~22 GB reportado); resto de niveles no disponible |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | GGUF (librería `gguf`, compatible con llama.cpp) |
| Modalidad | image-text-to-text (visión) |
| Tamaño del repositorio | 267,4 GB |
| Modelo base | huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos con 35B parámetros totales y aproximadamente 3B activos por token, etiquetado por el autor como `qwen35moe`, lo que lo emparenta con la familia Qwen3.5 MoE. Sobre el modelo base abliterado, peculiar-ragdoll aplica una recuantización dinámica con una imatrix ponderada hacia dominios de ciberseguridad y código, y añade dentro del propio GGUF una cabecera de predicción multi-token (MTP) que habilita decodificación especulativa en llama.cpp. También incorpora la plantilla de chat "Sharp" del mismo autor.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original; la model card no los detalla. La innovación técnica destacable es la combinación de cuantización selectiva por capas (unsloth-dynamic) con imatrix específica de dominio y MTP embebido, que según el autor mantiene la velocidad efectiva incluso al reducir precisión. La abliteración suprime la dirección de rechazo en el espacio de activaciones, lo que elimina la deliberación de negativa y libera tokens de atención para la tarea.

## Capacidades

- Generación de texto y razonamiento general, con especialización fuerte en código.
- Codificación agéntica: resolución autónoma de issues y bugs en repositorios grandes (evaluado en SWE-bench-Live).
- Capacidades ofensivas de seguridad: resolución de retos CTF sin guía (15 de 43 en Cybench).
- Visión: pipeline `image-text-to-text`, acepta imágenes junto a texto.
- Decodificación especulativa vía cabecera MTP integrada en el GGUF.
- Multilingüe limitado a inglés y chino.
- Sin rechazos: cero negativas en HarmBench según el autor.
- Compatibilidad con endpoints (`endpoints_compatible`) y uso conversacional multi-turno.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible.

## Casos de uso

- Reparación automática de bugs en producción: el modelo puede recibir un issue con traza de error y el contexto del repositorio, navegar los archivos y proponer un parche verificable, aprovechando su entrenamiento en SWE-bench-Live con tests de regresión ocultos.
- Auditoría de seguridad ofensiva autorizada: en un entorno aislado, se emplea para reconocimiento, análisis de vulnerabilidades y resolución de retos CTF, ámbito donde el autor reporta un 35% de éxito sin pistas.
- Asistente de codificación local en estaciones de trabajo: con el Q4 de 22 GB cabe en una GPU de consumo alto y permite autocompletado y refactorización sin enviar código a la nube, relevante para propiedad intelectual sensible.
- Automatización de pipelines CI/CD: integrado vía llama.cpp o servidor compatible con OpenAI, puede generar y validar parches sobre fallos de test antes de abrir una pull request.
- Análisis de capturas y diagramas: gracias al pipeline image-text-to-text, puede interpretar imágenes de interfaces, esquemas de arquitectura o trazas para generar código o documentación asociada.
- Investigación en alineación y seguridad: su ausencia de rechazos lo convierte en objeto de estudio para medir comportamientos dañinos y calibrar clasificadores o filtros externos en un sandbox.
- Procesamiento de documentación técnica bilingüe inglés-chino: resúmenes, traducción técnica y generación de comentarios de código en ambos idiomas.

## Benchmarks y rendimiento

Los datos provienen de las gráficas de la model card; el autor no publica tablas numéricas completas, por lo que solo se recogen las cifras explícitas.

| Benchmark | Resultado reportado |
|---|---|
| SWE-bench-Live (Q4) | Resuelve ~70% más problemas reales que Ornith-1.5 y Qwen3.6-35B-A3B; mejora de dominio ~7x mayor que el salto Qwen3.5 a 3.6 |
| Cybench (unguided) | 15/43 flags capturadas (35%) |
| HarmBench | 0% de rechazos en 84 peticiones (12 por cada una de 7 categorías) |
| MMLU-Pro | Igual que TielCoder; muy por debajo de modelos generalistas (pérdida deliberada de conocimiento del mundo) |
| Velocidad agéntica | 3-4x más rápido que un denso de 27B (3.8-27B) |

## Requisitos de hardware

- VRAM estimada: ~22 GB para el Q4 reportado; niveles superiores de cuantización no detallados (el repo completo ocupa 267,4 GB, incluyendo todas las variantes).
- GPU recomendadas: RTX 4090 (24 GB) para Q4 ajustado; A100 40/80 GB, H100 y L40S para mayor margen y concurrencia.
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 3090 (24 GB) con Q4; en GPUs de 16 GB requeriría cuantizaciones más agresivas no confirmadas.
- Despliegue: llama.cpp (soporte nativo de GGUF y MTP), servidores compatibles con la API de OpenAI; vLLM, TGI y Ollama no confirmados para este artefacto.
- Latencia y throughput: no disponible en cifras absolutas; el autor afirma velocidad efectiva mantenida y 3-4x frente a denso de 27B en tareas agénticas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Notas |
|---|---|---|---|---|---|
| Cyber-Tiel-Coder-35B-A3B (este) | 35B totales / ~3B activos | no disponible | Coder agéntico sin censura + visión | MIT | Q4 ~22 GB, MTP, imatrix cyber |
| Tiel-Coder-35B-A3B | 35B totales / ~3B activos | no disponible | Coder agéntico censurado | MIT (según enlace del autor) | Alternativa segura; rechaza en HarmBench |
| Ornith-1.5-35B-A3B | 35B totales / ~3B activos | no disponible | Generalista | no disponible | Base sin abliterar; resuelve ~70% menos en SWE-bench-Live según el autor |
| Qwen3.6-35B-A3B | 35B totales / ~3B activos | no disponible | Generalista | no disponible | Referencia generacional; mismo gap de ~70% en SWE-bench-Live |

## Limitaciones y advertencias

- Modelo abliterado: no rechaza peticiones dañinas (0% en HarmBench), incluidas ciberdelincuencia, químicos/biológicos, acoso y desinformación. Requiere sandboxing, monitorización y responsabilidad legal plena del usuario.
- Pérdida deliberada de conocimiento del mundo: MMLU-Pro muy bajo; no apto para trivia, exámenes ni consultas enciclopédicas.
- Solo inglés y chino; sin soporte fiable de castellano.
- Riesgo de alucinación en código: los parches generados deben validarse con tests de regresión antes de fusionarse.
- La abliteración introduce "cierta inestabilidad" según el propio autor; puede degradar coherencia en tareas largas.
- Longitud de contexto no documentada: planificar con cautela en repositorios grandes.
- Licencia MIT permite uso comercial, pero no exime de cumplir la legislación aplicable al contenido generado.
- Repositorio de 267,4 GB: la descarga completa es costosa; conviene bajar solo la variante necesaria.
- Soporte de tool calling no confirmado explícitamente en la información disponible.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-GGUF-MTP
- GGUF sin MTP: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-GGUF
- Versión MLX: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ4e
- Versión MLX con MTP: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ4e-MTP
- Alternativa censurada TielCoder: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF
- Modelo base abliterado: https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated
- Modelo original Ornith-1.5: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Plantillas de chat Sharp: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Modelo generalista de referencia (Nail): https://huggingface.co/peculiar-ragdoll/Nail-Qwen3.6-35B-A3B-GGUF
