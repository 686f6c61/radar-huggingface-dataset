# decido-ai/decido-1-fast-1.7b

## Resumen

Decido-1-Fast (1.7B) es un modelo de decisión calibrada desarrollado por decido-ai, construido mediante un fine-tuning completo de Qwen3-1.7B. Su función no es la generación libre de texto, sino responder preguntas estructuradas sobre un documento de entrada (sí/no, elección entre opciones o escalas ordenadas) devolviendo distribuciones de probabilidad. Resuelve el problema de extraer decisiones operativas —clasificación de tickets, enrutamiento, priorización— a partir de documentos no estructurados, con un coste computacional muy bajo.

El modelo se distribuye como destilación de Decido-1 (26B-A4B), entrenado sobre 1M de preguntas etiquetadas a partes iguales por respuestas gold y por el propio Decido-1. Con 1.720.574.976 parámetros y aproximadamente 3 GB de RAM en CPU, ofrece una latencia de 0,64 s p50 en un Apple M4 Pro con cuantización Q8_0 para un documento de ~1k tokens y cinco preguntas. Es relevante ahora porque permite ejecutar un clasificador calibrado con API compatible con Jev directamente en portátil, sin GPU.

La licencia es Apache 2.0 y el pipeline declarado es text-classification, con soporte para transformers, safetensors, GGUF y llama.cpp. El único idioma declarado es inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), fine-tuning completo |
| Parámetros totales | 1.720.574.976 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0 (GGUF incluido); bf16 (safetensors) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16), GGUF (Q8_0) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder-only, y se somete a un fine-tuning completo para imitar el comportamiento de Decido-1. La cabeza de decisión no genera texto libre: utiliza las probabilidades de los tokens de etiqueta (label-token probabilities) con temperaturas por tipo de pregunta ajustadas sobre tareas held-out, el mismo mecanismo de lectura que Decido-1. El prompt empleado es una versión compacta denominada `verdict-fast-t1`, que renderiza documentos JSON sin espacios en blanco y bloques de pregunta cortos.

El entrenamiento consiste en destilación sobre 1M de preguntas, la mitad etiquetadas con respuestas gold y la mitad por Decido-1. El autor declara explícitamente que el entrenamiento es supervisado in-domain: se usaron los splits de *train* de varios datasets cuyos splits de *test/eval* aparecen en los grupos de benchmark (MASSIVE, VitaminC, tareas Open-Jev). La misma receta sin ningún split de train de un dataset evaluado obtiene 82,04, por debajo del 83,85 de Jev 1.13, por lo que el margen sobre Jev debe leerse como supervisado in-domain. El documento de entrada se trata como dato no fiable: las instrucciones contenidas en él no se siguen y las cadenas de tokens de control se neutralizan.

## Capacidades

- Respuesta a preguntas de tipo sí/no sobre un documento de entrada, devolviendo probabilidad para cada opción.
- Elección entre opciones (`choice`) con 2 a 255 alternativas, devolviendo probabilidades y nivel de confianza.
- Preguntas de escala ordenada (`score`) con 2 a 10 niveles, devolviendo la puntuación y la leyenda asociada.
- Formato de cable Jev 1.13 mediante `m.predict({"state": ..., "questions": ...})`, con respuestas estilo Jev (`noul`, `choice` + `probabilities` + `confidence`, `score` + `legend`).
- Entrada de documento en texto plano o JSON.
- Determinismo bit-exacto en repeticiones sobre CPU.
- API compatible con Jev a través de `decido serve` (endpoint `POST /v1/systemone`), de modo que los clientes Jev existentes funcionan sin cambios apuntando `TYPESAFE_BASE_URL` al servidor local.
- Uso por línea de comandos (`decido run`) y por SDK de Python (`decido-ai`).
- No dispone de generación libre de texto, tool calling, capacidades de agente, visión, audio ni modo thinking según la información disponible.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una reclamación, el modelo responde a preguntas como "¿pide el cliente un reembolso?" y "¿qué equipo debe gestionarlo?" con opciones billing/shipping/tech, devolviendo probabilidades calibradas que permiten aplicar umbrales de derivación automática.
- Priorización de bandeja de entrada: con preguntas de escala ordenada (`low`/`normal`/`urgent`) sobre el cuerpo de un correo o formulario, se obtiene una puntuación de urgencia consumible por un sistema de colas.
- Clasificación de documentos JSON en pipelines de ingestión: el prompt `verdict-fast-t1` renderiza JSON sin espacios, por lo que encaja en procesos que reciben payloads estructurados y necesitan etiquetas operativas con baja latencia (0,64 s p50 en CPU).
- Moderación o triaje en entornos sin GPU: al ejecutarse en CPU con ~3 GB de RAM y GGUF Q8_0, puede desplegarse en portátiles, contenedores pequeños o dispositivos de borde para prefiltrar contenido antes de escalar a un modelo mayor.
- Extracción de señales para analítica: responder baterías de preguntas sí/no sobre reseñas o transcripciones para poblar tablas de métricas (por ejemplo, detección de quejas por facturación) con probabilidades utilizables como variables continuas.
- Servicio local compatible con Jev: levantar `decido serve` en un puerto local y conectar SDKs Jev existentes sin modificar el código cliente, útil para pruebas de integración o entornos aislados.
- Segunda opinión de bajo coste: usar Decido-1-Fast como primer clasificador y escalar a Decido-1 solo en los casos donde la confianza devuelta sea baja, aprovechando que comparten API y formatos de pregunta.

## Benchmarks y rendimiento

Grupos de benchmark de la comunidad abierta de reproducción de Jev (JevBench, Kev, OpenJev text tasks, Nimble, VitaminC, MASSIVE-en; copias congeladas, mismo harness para todos los modelos). Puntuación = métrica tipo accuracy por grupo y media.

| Grupo de benchmark | Decido-1-Fast (1.7B), CPU (GGUF Q8_0) | Decido-1-Fast (1.7B), GPU (bf16) | Decido-1, CPU | Jev 1.13 (publicado) |
|---|---:|---:|---:|---:|
| JevBench | 72,31 | 70,83 | 87,61 | 87,18 |
| Kev | 71,96 | 71,82 | 84,35 | 85,52 |
| OpenJev (18 tareas) | 62,74 | 62,70 | 78,37 | 72,96 |
| Nimble | 58,87 | 59,22 | 87,23 | 91,84 |
| VitaminC | 84,47 | 84,64 | 86,14 | 78,46 |
| MASSIVE | 87,71 | 87,71 | 88,57 | 87,14 |
| **Media de los seis grupos** | **73,01** | **72,82** | **85,38** | **83,85** |

Calibración (CPU, GGUF incluido):

| Comprobación | Brier | Jev 1.13 | ECE | Jev 1.13 |
|---|---:|---:|---:|---:|
| JevBench | 0,350 | 0,181 | 0,023 ✓ | 0,032 |
| Kev v4 dev | 0,420 | 0,211 | 0,103 | 0,049 |
| Kev v9 dev | 0,506 | 0,212 | 0,096 | 0,034 |
| VitaminC | 0,232 ✓ | 0,313 | 0,032 ✓ | 0,104 |
| MASSIVE | 0,169 ✓ | 0,204 | 0,032 ✓ | 0,075 |

Brier ≤ Jev en 2/5 comprobaciones y ECE ≤ Jev en 3/5. El cambio de orden de opciones provoca volteos en el 6,1% agrupado (Jev: 14,6%). Determinismo bit-exacto en repeticiones sobre CPU.

Velocidad: Apple M4 Pro, solo CPU, Q8_0, documento de ~1k tokens más 5 preguntas: 0,64 s p50 con 10 hilos.

## Requisitos de hardware

- VRAM/RAM estimada: ~3 GB de RAM en CPU con GGUF Q8_0; bf16 en safetensors requiere más memoria (no cuantificada en la información disponible).
- GPU recomendadas: no se especifican; el modelo está diseñado para CPU. La variante bf16 puede ejecutarse en GPU, pero no se detallan modelos concretos.
- Cabe en cualquier portátil convencional (referencia del autor: Apple M4 Pro) y en GPUs de consumo, aunque no se publican cifras de VRAM por modelo de GPU.
- Opciones de despliegue: `decido-ai` (SDK Python), `decido run` (CLI), `decido serve` (API HTTP compatible con Jev en `POST /v1/systemone`), llama.cpp (GGUF Q8_0), transformers (safetensors bf16), text-embeddings-inference y endpoints compatibles según los tags del repo.
- Latencia: 0,64 s p50 en CPU M4 Pro con 10 hilos para 1k tokens de documento y 5 preguntas. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Ejecución | Media seis grupos | Latencia (M4 Pro CPU, 1k tokens, 5 preguntas) |
|---|---|---|---:|---:|---|
| Decido-1-Fast (este modelo) | Qwen3-1.7B | 1,72B | CPU (~3 GB RAM) | 73,01 | 0,64 s |
| Decido-1 | Gemma-4-26B-A4B | no disponible | CPU (~30 GB RAM) / GPU | 85,38 | 4,1 s |
| Decido-1-Ultra | Qwen3-0.6B | no disponible | CPU (~1,5 GB RAM) | 62,16 | 0,41 s |
| Decido-1-Think | Gemma-4-26B-A4B | no disponible | GPU / CPU lenta | 88,71 (GPU) | ~19 s por pregunta (CPU) |
| Decido-1-XL | DeepSeek-V4-Flash | no disponible | 4× A100 80 GB | 87,25 (GPU) | no disponible |
| Decido-1-Pro | Decido-1 + Think + Qwen3.8-27B | no disponible | GPU (1× A100 80 GB) | 89,57 (GPU) | no disponible |

Referencia externa: Jev 1.13 (publicado) obtiene 83,85 en la media de los seis grupos, con evaluación zero-shot.

## Limitaciones y advertencias

- Calibración claramente más débil que la de Decido-1: Brier de 0,350 en JevBench frente a 0,181 de Jev, y de 0,420/0,506 en Kev v4/v9 dev frente a 0,211/0,212. El ECE también es peor en Kev (0,103 y 0,096 frente a 0,049 y 0,034).
- Puntos débiles declarados por el autor: preguntas de escala ordenada (`score`) y razonamiento multi-paso (Nimble, 58,87 frente a 91,84 de Jev). Para precisión, el autor recomienda Decido-1.
- Entrenamiento supervisado in-domain: se usaron splits de train de datasets cuyos splits de test están en los benchmarks, por lo que el margen sobre Jev no es comparable en condiciones zero-shot. La receta sin esos splits cae a 82,04.
- Solo idioma inglés declarado; no hay evidencia de capacidades multilingües.
- Riesgo de alucinación en el sentido de asignar probabilidades erróneas a preguntas mal formuladas o fuera de dominio; el modelo no genera texto, pero sus salidas se consumen como decisiones.
- Sesgos: no se documentan sesgos específicos en la información disponible.
- Volteo de opciones del 6,1% agrupado ante reordenamientos, lo que puede afectar a sistemas que presentan opciones en orden variable.
- Licencia Apache 2.0, sin restricciones conocidas para uso comercial; verificar los términos de los datasets de entrenamiento subyacentes no está cubierto en la información disponible.
- El modelo no sigue instrucciones contenidas en el documento de entrada (tratado como dato no fiable), lo que es una salvaguarda pero también implica que no debe usarse como asistente conversacional.
- Longitud de contexto no disponible; el prompt compacto está pensado para documentos de ~1k tokens en los ejemplos de latencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/decido-ai/decido-1-fast-1.7b
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Decido-1 (26B-A4B): https://huggingface.co/decido-ai/decido-1-26b-a4b
- Decido-1-Ultra (0.6B): https://huggingface.co/decido-ai/decido-1-ultra-0.6b
- Decido-1-Think (26B-A4B): https://huggingface.co/decido-ai/decido-1-think-26b-a4b
- Decido-1-XL: https://huggingface.co/decido-ai/decido-1-xl
- Decido-1-Pro: https://huggingface.co/decido-ai/decido-1-pro
