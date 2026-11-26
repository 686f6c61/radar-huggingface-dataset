# sergolsub/d3-turbo-27B-MLX-8bit

## Resumen

d3-turbo-27B-MLX-8bit es una conversión cuantizada a 8 bits en formato MLX del modelo vllm-sr/d3-turbo, publicada por el usuario sergolsub. El modelo original es un transformer de aproximadamente 26.085 millones de parámetros (26,08 mil millones) orientado a tareas de decisión estructurada: clasificación binaria (noul), elección entre opciones (choice), puntuación ordinal (score) y localización de objetos en imagen (box). No se trata de un modelo conversacional generalista, sino de un modelo con cabezas de decisión específicas que devuelve probabilidades calibradas para cada tarea.

La relevancia de esta ficha radica en que es una de las pocas conversiones MLX publicadas de un modelo de este tamaño con soporte multimodal (texto e imagen) y con un conjunto de métricas de calidad de cuantización documentadas de forma explícita: auditoría KL por tensor, comparación entre versiones de 8 y 4 bits, y mediciones de latencia y memoria en hardware Apple Silicon concreto (Mac mini M4 Pro de 48 GB). El autor incluye checksums SHA-256 de todos los ficheros, lo que facilita la verificación de integridad en despliegues.

La licencia es Apache 2.0, heredada del modelo upstream, y el repositorio ocupa 27,9 GB en disco. La arquitectura declarada en los tags es qwen3_5 con código personalizado, e incluye un módulo Python propio (d3_mlx.py) para la carga e inferencia de las cabezas de decisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con cabezas de decisión (tag qwen3_5, custom_code) |
| Parametros totales | 26.085.330.160 (26,08 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits MLX (esta versión); existe versión 4 bits del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en layout MLX, más ficheros auxiliares (config.json, tokenizer, chat_template.jinja, d3_mlx.py, decision_config.json, joint_config.json) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá del tag qwen3_5 y la presencia de atención lineal en la primera capa (el tensor con peor KL tras la cuantización es `language_model.layers.0.linear_attn.in_proj_b.weight`). El modelo incorpora un modo de decisión con cabezas específicas (noul, choice, score, box) gestionadas mediante `decision_config.json` y `joint_config.json`, y un módulo de inferencia propio `d3_mlx.py`. No se han publicado datos sobre el número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO.

Esta versión concreta no ha sido reentrenada: es una conversión a 8 bits de los shards BF16 originales, sin cambios de arquitectura. El autor documenta una auditoría de cuantización a nivel de tensor: 1183 tensores comparados, KL medio de 3,52e-04, KL máximo de 6,57e-03 y 581 tensores con KL distinto de cero. También incluye una tabla de KL de salida entre la versión de 8 bits y la de 4 bits (media 2,19e-02, p95 9,20e-02, máximo 2,05e-01 sobre 100 filas), aunque no se registraron las probabilidades del modelo original BF16.

## Capacidades

- Clasificación binaria (tipo noul): responde preguntas de sí/no con probabilidad calibrada, por ejemplo "¿el cliente quiere un reembolso?".
- Elección entre opciones (tipo choice): selecciona una categoría entre un conjunto de criterios definidos por el usuario, por ejemplo asignar un ticket al equipo de facturación o al de envíos.
- Puntuación ordinal (tipo score): asigna un nivel de severidad o calidad sobre una escala de criterios, por ejemplo "cosmético", "molesto" o "bloqueante".
- Localización de objetos en imagen (tipo box): devuelve una caja delimitadora con confianza para un objeto descrito en texto sobre una imagen de entrada.
- Procesamiento multimodal texto e imagen: el autor reporta mediciones separadas para texto de 512 tokens y para imagen de 512x512 más texto.
- Salida de probabilidades de decisión, no texto libre: el modelo está diseñado para devolver distribuciones calibradas, lo que facilita su integración en sistemas de enrutamiento y triaje.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Triaje de tickets de soporte: el modelo puede clasificar cada incidencia entrante con el tipo choice (por ejemplo, equipo de facturación frente a envíos) y con el tipo score (severidad cosmética, molesta o bloqueante), lo que permite enrutar automáticamente y priorizar colas sin intervención humana.
- Detección de intención de reembolso: con el tipo noul, un sistema de atención al cliente puede decidir si un mensaje expresa una solicitud de reembolso antes de escalar a un agente humano, reduciendo falsos positivos gracias a la calibración reportada (PPL 2,060 en la versión de 8 bits).
- Moderación y clasificación de contenido: la combinación de noul y score permite etiquetar mensajes según múltiples criterios definidos por el usuario y asignarles un nivel de gravedad, útil en foros o plataformas de contenido generado por usuarios.
- Análisis de imágenes en entornos Apple Silicon: el tipo box permite localizar objetos descritos en texto sobre imágenes de 512x512 con una latencia medida de 7830 ms por consulta en un Mac mini M4 Pro, adecuado para procesamiento por lotes no interactivo o para prototipado local.
- Enrutamiento de incidencias de infraestructura: clasificar errores de sistemas (por ejemplo, "disk quota exceeded") con el tipo score para distinguir entre fallos cosméticos y bloqueantes, y disparar alertas o escalados según el resultado.
- Prototipado y evaluación local en macOS: gracias a la conversión MLX y a los 17,69 GB de RSS máximo medido, el modelo cabe en un Mac mini M4 Pro de 48 GB y permite a desarrolladores evaluar un modelo de 26 mil millones de parámetros sin GPU dedicada.
- Verificación de integridad en despliegues: los checksums SHA-256 publicados por fichero permiten validar descargas en pipelines de CI/CD antes de cargar los pesos en producción.

## Benchmarks y rendimiento

El autor publica métricas de calidad de cuantización y de rendimiento medidas en un Mac mini M4 Pro de 48 GB con MLX 8 bits. No son benchmarks estándar de la comunidad (MMLU, HumanEval, GSM8K), sino una evaluación propia del autor sobre su conjunto de datos.

| Metrica | 8 bits (esta version) | 4 bits (mismo autor) |
|---|---|---|
| Accuracy | 87,8 % | 84,4 % |
| Noul | 95,0 % | 85,0 % |
| Choice | 84,0 % | 84,0 % |
| Score | 80,0 % | 84,0 % |
| Calibracion PPL | 2,060 | 2,075 |
| Tamano en disco | 27,85 GB | 14,87 GB |
| Latencia mediana | 2461 ms | 2119 ms |

| Medicion en Mac mini M4 Pro 48 GB | Valor |
|---|---|
| Carga del modelo | 9,5 s |
| RSS maximo | 17,69 GB |
| Texto 512 tokens (479 tok), media de 5 tras 3 de calentamiento | binary 4577 ms, multichoice 4859 ms, score 4575 ms |
| Imagen 512x512 + texto, media de 5 tras 3 de calentamiento | binary 7506 ms, multichoice 7515 ms, score 7507 ms |
| Box 512x512 | 7830 ms (mediana 7830 ms), confianza 1 |
| Decisiones cortas sostenidas | 0,62 por segundo |

| Par de comparacion KL de salida | Filas | Media | p95 | Maximo |
|---|---|---|---|---|
| 8 bits frente a 4 bits | 100 | 2,19e-02 | 9,20e-02 | 2,05e-01 |
| Original frente a 8 bits | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RSS estimada para inferencia: 17,69 GB de memoria residente máxima medida con MLX 8 bits en Mac mini M4 Pro de 48 GB; el modelo ocupa 27,85 GB en disco.
- GPU recomendadas: el formato MLX está pensado para Apple Silicon; el autor solo documenta mediciones en Mac mini M4 Pro de 48 GB. No se documenta soporte para A100, H100 ni RTX 4090 en esta conversión.
- Cabe en consumer GPU: no se documenta; en Apple Silicon requiere al menos 48 GB de memoria unificada según la configuración medida.
- Opciones de despliegue: `mlx_lm` a través del módulo propio `d3_mlx.py` incluido en el repositorio; no se documentan vLLM, llama.cpp, Ollama ni TGI para esta versión.
- Latencia y throughput: 9,5 s de carga, 2461 ms de latencia mediana por decisión, 0,62 decisiones cortas por segundo sostenidas, y entre 4,5 y 7,8 segundos por consulta de 512 tokens según modalidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| sergolsub/d3-turbo-27B-MLX-8bit | 26,08 mil millones | no disponible | Apache 2.0 | MLX safetensors 8 bits | Esta ficha; accuracy 87,8 % en eval propia |
| sergolsub/d3-turbo-27B-MLX-4bit | 26,08 mil millones | no disponible | Apache 2.0 | MLX safetensors 4 bits | 14,87 GB en disco, accuracy 84,4 %, latencia 2119 ms |
| vllm-sr/d3-turbo (upstream) | 26,08 mil millones | no disponible | Apache 2.0 | BF16 | Pesos originales; métricas de calidad no medidas por el autor de la conversión |

No se dispone de información sobre otros modelos comparables de la misma categoría (clasificación estructurada con cabezas de decisión) en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo no es un generador de texto libre: está diseñado para tareas de decisión con cabezas específicas (noul, choice, score, box), por lo que no sirve para chat generalista ni generación abierta.
- La evaluación de calidad (accuracy 87,8 %, PPL 2,060) es una eval propia del autor de la conversión, no un benchmark estándar revisado por terceros; los resultados no son directamente comparables con MMLU, HumanEval u otros.
- No se registraron las probabilidades del modelo original BF16, por lo que no hay una medida directa de la degradación de la versión de 8 bits frente al original; solo se compara 8 bits frente a 4 bits.
- El tensor con peor KL tras la cuantización es la atención lineal de la primera capa (KL 6,57e-03), lo que indica que la cuantización afecta de forma desigual a distintas capas.
- Solo se documenta funcionamiento en Apple Silicon con MLX; no hay evidencia de que esta conversión funcione en CUDA, ROCm ni en GPUs de consumo convencionales.
- El rendimiento medido (0,62 decisiones por segundo, latencias de 2,5 a 7,8 s) es bajo para aplicaciones interactivas en tiempo real; está pensado para procesamiento por lotes o prototipado.
- No se documentan los idiomas soportados; el chat template y el tokenizer están incluidos, pero no hay lista de idiomas verificada.
- Riesgo de alucinación: no evaluado en la información disponible; al tratarse de un modelo de clasificación con salida de probabilidades, el riesgo se traslada a la calibración de las decisiones, no a texto generado.
- Sesgos conocidos: no documentados en la información proporcionada.
- La licencia Apache 2.0 se hereda del modelo upstream; en caso de conflicto, prevalece la licencia del repositorio original vllm-sr/d3-turbo.
- El repositorio incluye código Python personalizado (d3_mlx.py) que debe ejecutarse para cargar el modelo; conviene revisarlo antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sergolsub/d3-turbo-27B-MLX-8bit
- Modelo base upstream: https://huggingface.co/vllm-sr/d3-turbo
- Versión 4 bits del mismo autor: https://huggingface.co/sergolsub/d3-turbo-27B-MLX-4bit
- No se han encontrado en la información disponible papers, blogs, repositorios adicionales ni demos.
