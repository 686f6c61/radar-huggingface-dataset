# netprojects/GLiDE-mlx-8bit

## Resumen

GLiDE 27B es un modelo de decisión desarrollado por Fastino, construido sobre la arquitectura Qwen3.8-27B. A diferencia de un modelo conversacional, GLiDE no genera texto: recibe un estado (texto, JSON o imágenes) junto con preguntas tipadas (`choice`, `noul` para sí/no y `score`) y devuelve, en una sola pasada hacia delante por pregunta, una distribución de probabilidad sobre cada opción. Esta conversión concreta, publicada por NetProjects (Internet Projects Ltd), es una cuantización afín de 8 bits (tamaño de grupo 64) en formato MLX, pensada para ejecutarse en Apple Silicon.

El checkpoint ocupa 28,2 GB de pesos (56,3 GB de repositorio completo) y conserva fielmente el comportamiento del original en bf16: coincide en la respuesta principal con el código PyTorch de referencia de Fastino en 203 de 204 preguntas, con una diferencia media de probabilidad de 0,002. En JevBench público (v1.2.1) obtiene 213 de 231 aciertos, con un tiempo mediano de 0,46 s por ítem en un MacBook Pro M5 Max.

Su relevancia radica en que ofrece un modelo de decisión calibrado, con lectura no causal en sus capas de atención completa y un readout de 255 vías, ejecutable localmente en hardware de Apple sin renunciar prácticamente a nada de la precisión del original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.8-27B: 16 capas de atención completa (no causal) y 48 capas Gated DeltaNet, con midloop en las capas 24-35 y 36-47 |
| Parametros totales | 26.085.330.160 (26,1 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (los ejemplos de referencia llegan a unos 4K tokens) |
| Tipos de cuantizacion | 8 bits afín, tamaño de grupo 64 (MLX); existe variante de 4 bits (15,3 GB) |
| Idiomas soportados | No disponible |
| Licencia | Fastino Community License (licencia `other`, nombre `fastino-community`) |
| Formato de pesos | safetensors (MLX); incluye `readout.safetensors` separado |

## Arquitectura y entrenamiento

GLiDE 27B parte de Qwen3.8-27B (Apache-2.0) y lo adapta como modelo de decisión. La arquitectura combina 16 capas de atención completa que leen el prompt en ambas direcciones (sin máscara causal, el modo `noncausal_full_attention` de GLiDE) con 48 capas Gated DeltaNet que mantienen su recurrencia. Además, aplica un mecanismo de midloop: las capas 24-35 y 36-47 se ejecutan dos veces y se mezclan en float32.

La respuesta no se genera token a token. El estado oculto del último token pasa por un readout de 255 vías, que se mantiene en su precisión original, y se aplica softmax sobre las opciones a la temperatura definida en `decision_config.json`. El codificador de visión también conserva su precisión original, y los módulos `prompt.py` e `images.py` de GLiDE se usan sin modificar. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Decisión sobre estados en texto, JSON o imágenes, devolviendo probabilidades por opción en una sola pasada.
- Preguntas de tipo `choice` (elección entre criterios definidos), `noul` (sí/no) y `score` (puntuación).
- Procesamiento de imágenes mediante el codificador de visión original.
- Lectura bidireccional del prompt completo en las capas de atención completa.
- API compatible con `POST /v1/systemone` del servidor de GLiDE.
- Uso programático mediante `GlideMLX.from_pretrained(...)` y `g.decide(state, questions)`.
- No soporta generación de texto libre, tool calling ni razonamiento multi-paso generativo: es un modelo de decisión, no de chat.

## Casos de uso

- Clasificación de intención en atención al cliente: dado el texto de una reclamación, devolver la probabilidad de que el cliente quiera reembolso, cambio o información, con preguntas `choice` y `noul` combinadas en una sola llamada.
- Triaje de tickets con detección de sentimiento: usar una pregunta `noul` ("¿está el cliente enfadado?") junto a preguntas de categoría para enrutar casos urgentes.
- Moderación de contenido con umbrales calibrados: preguntas `score` sobre toxicidad o riesgo permiten fijar cortes de probabilidad ajustables por política.
- Enrutamiento de agentes: decidir qué herramienta o subagente debe atender una consulta a partir de un estado JSON estructurado.
- Análisis de documentos con imágenes: evaluar capturas, formularios o recibos junto a texto para decidir su categoría o validez.
- Verificación de calidad en pipelines: comprobar si una respuesta cumple criterios definidos mediante preguntas `noul` encadenadas.
- Ejecución local en portátiles Apple Silicon: servir el modelo con `glide-mlx` en un MacBook Pro para prototipado sin depender de la nube.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| Coincidencia con el código PyTorch de Fastino (bf16) en respuesta principal | 203 / 204 preguntas; diferencia media de probabilidad 0,002 |
| Preguntas sí/no y score idénticas al original | 132 / 132 |
| JevBench público (231 ítems, v1.2.1, `--adapter typesafe`) | 213 / 231 (fácil 48/48, estándar 72/72, difícil 93/111) |
| Tiempo por ítem de JevBench (prompts de hasta ~4K tokens) | 0,46 s de mediana |

Medido en un MacBook Pro M5 Max con 128 GB el 7 de noviembre de 2026. La única respuesta divergente corresponde a un empate exacto en la propia referencia (margen top-dos de 0,000).

## Requisitos de hardware

- Pesos de 28,2 GB en 8 bits; repositorio completo de 56,3 GB.
- Variante de 4 bits disponible con 15,3 GB, apta para equipos con menos memoria unificada.
- Requiere Apple Silicon; el formato MLX no se ejecuta en GPU NVIDIA ni en CPU x86 convencional.
- Recomendado un Mac con 64 GB o más de memoria unificada para la versión de 8 bits; 32 GB para la de 4 bits.
- Despliegue mediante `glide-mlx` (v0.2.0 o posterior), que expone el endpoint `/v1/systemone`.
- No debe servirse con `mlx_lm.server` ni con una llamada genérica de generación de `mlx_vlm`: GLiDE necesita el readout separado y la atención no causal.
- Latencia medida: 0,46 s de mediana por ítem de JevBench en M5 Max con 128 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| netprojects/GLiDE-mlx-8bit | 26,1 mil millones | No disponible | Decisión con probabilidades, MLX 8 bits | Fastino Community | Hugging Face |
| netprojects/GLiDE-mlx-4bit | No disponible | No disponible | Decisión con probabilidades, MLX 4 bits (15,3 GB) | Fastino Community | Hugging Face |
| fastino/GLiDE-27B | 27 mil millones (nominal) | No disponible | Decisión con probabilidades, precisión completa | Fastino Community | Hugging Face |

No se dispone de datos de benchmarks de modelos de decisión alternativos en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo de chat: no genera texto libre ni mantiene conversaciones.
- Requiere servir con `glide-mlx`; las herramientas genéricas de MLX producen resultados incorrectos.
- La licencia Fastino Community exige mostrar "Built with Fastino GLiDE" en uso comercial (sección 4).
- El uso comercial en producción por entidades con ingresos anuales superiores a 10 millones de USD requiere un acuerdo separado con Fastino (secciones 2-3).
- Es una obra derivada de Qwen3.8-27B; se incluyen las licencias correspondientes en el repositorio.
- No se dispone de información sobre sesgos, idiomas soportados ni riesgo de alucinación específico del modelo.
- La longitud máxima de contexto no está documentada; los ejemplos de referencia no superan los 4K tokens.
- NetProjects no está afiliado a Fastino; la conversión es responsabilidad del publicador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/GLiDE-mlx-8bit
- Modelo base: https://huggingface.co/fastino/GLiDE-27B
- Variante de 4 bits: https://huggingface.co/netprojects/GLiDE-mlx-4bit
- Repositorio glide-mlx: https://github.com/internet-projects/glide-mlx
- Colección de builds MLX de NetProjects: https://huggingface.co/collections/netprojects/netprojects-mlx-builds-6ae3b2683a59a1b4fc4c0c3a
- Todos los modelos de NetProjects: https://huggingface.co/netprojects
- NetProjects: https://netprojects.com
