# Egzakta/Kvark-Sparkle-1.1-27B-FP8

## Resumen

KVARK Sparkle 1.1 (27B) FP8 es la versión cuantizada en FP8 del modelo multimodal Egzakta/Kvark-Sparkle-1.1-27B, desarrollado por Egzakta. Se distribuye como pesos listos para vLLM con la cabeza de predicción multi-token (MTP) incluida, y está pensado para cargas de razonamiento y RAG agéntico con contexto largo. El modelo base pertenece a la familia `qwen3_5` y cubre la tarea image-text-to-text, es decir, acepta entradas de imagen y texto y genera texto.

El interés de esta versión FP8 es doble: por un lado, reduce el peso en disco a 30,9 GB y permite servir el modelo con 128k de contexto en una sola H100; por otro, conserva la MTP, lo que habilita decodificación especulativa en vLLM y reduce la latencia frente a su comparable Qwen. La model card reporta una mediana de 32,9 s por respuesta frente a 40,8 s del modelo Qwen de referencia, siendo más rápido en 15 de 20 preguntas fijas.

La propuesta del modelo no es superar en precisión a los modelos frontera, sino igualar su accuracy consumiendo sustancialmente menos tokens de razonamiento: entre un 27% y un 48% menos según el benchmark. Esa eficiencia en tokens de pensamiento es el argumento central para despliegues de producción con coste por token.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia `qwen3_5`), con cabeza de predicción multi-token (MTP) |
| Parametros totales | 27.781.427.952 (27,78B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 128k tokens (según model card, servido en 1×H100) |
| Tipos de cuantizacion | FP8 (esta versión); se desconoce si el modelo base ofrece otras |
| Idiomas soportados | inglés (en), serbio (sr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8), compatible con transformers y vLLM |
| Pipeline | image-text-to-text |
| Tamano del repo | 30,9 GB |
| Fecha de publicacion | 2026-11-10 |

## Arquitectura y entrenamiento

El modelo base es un transformer de 27,78B parámetros de la familia `qwen3_5`, con soporte multimodal (image-text-to-text). Esta versión concreta es una cuantización FP8 del modelo original, publicada con la relación `base_model_relation: quantized`, e incluye la cabeza MTP que permite decodificación especulativa en vLLM. La model card no detalla la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo etapas de RLHF o DPO; esos datos no están disponibles en la información proporcionada.

La innovación técnica destacable es la combinación de pesos FP8 con MTP: los benchmarks y las cifras de velocidad reportados se midieron con estos pesos FP8, y la MTP se usa con un token borrador en vLLM 0.32.0. El modelo está etiquetado con `reasoning` y `agentic-rag`, lo que indica un ajuste orientado a razonamiento multi-paso y a recuperación aumentada sobre documentos. La model card menciona además una "stop rule" en el contexto de trabajo documental (GroundedWork), aunque los detalles de esa regla se remiten a la model card del modelo base.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo "thinking" activable.
- Entrada multimodal image-text-to-text: acepta imágenes junto a texto.
- Razonamiento matemático y científico (evaluado en AIME 2026, HMMT y GPQA Diamond).
- Generación y razonamiento sobre código (evaluado en LiveCodeBench).
- Seguimiento estricto de instrucciones (IFEval en modo strict).
- RAG agéntico sobre documentos, con capacidad de declinar responder cuando la respuesta no está en los documentos (según la model card del base: 91,5% de rechazos correctos con la stop rule).
- Decodificación especulativa vía cabeza MTP para reducir latencia en vLLM.
- Capacidades multilingües limitadas a inglés y serbio según los metadatos.
- No se documenta soporte explícito de tool calling ni de function calling en la información disponible.

## Casos de uso

- **Atención al cliente sobre base documental**: el modelo puede gestionar conversaciones multi-turno con hasta 128k tokens de contexto, lo que permite inyectar manuales y políticas completas y responder con citas. Su capacidad de declinar cuando la respuesta no está en los documentos (91,5% de rechazos correctos con la stop rule) reduce respuestas inventadas en este escenario.
- **RAG agéntico en entornos corporativos**: con la etiqueta `agentic-rag` y el rendimiento en FRAMES (69,8%), encaja en pipelines que recuperan pasajes, razonan sobre ellos y sintetizan respuestas. El contexto de 128k permite encadenar varias recuperaciones sin truncar.
- **Asistencia a desarrolladores en producción**: con 86,0% en LiveCodeBench y 8.607 tokens de razonamiento medianos (frente a 15.276 del comparable), es adecuado para revisión de código y generación de parches donde el coste por token importa.
- **Tutoría y resolución de problemas matemáticos**: 92,5% en AIME 2026 y 88,1% en HMMT con un 36-41% menos de tokens de razonamiento que el comparable, lo que abarata el servicio en plataformas educativas.
- **Análisis de documentos con imágenes**: al ser image-text-to-text, puede procesar facturas, capturas o diagramas junto a texto en flujos de extracción y verificación documental.
- **Evaluación científica asistida**: 88,3% en GPQA Diamond con 4.471 tokens medianos de razonamiento lo hace viable para asistencia en revisión de literatura técnica y preguntas de nivel posgrado.
- **Despliegue en una sola GPU**: al caber en una H100 con 128k de contexto y 30,9 GB de pesos, sirve para entornos on-premise con requisitos de soberanía de datos.

## Benchmarks y rendimiento

Resultados reportados en la model card, medidos con pesos FP8, thinking activado, tope de 64k tokens y el mismo harness para ambos modelos. Las diferencias son pareadas con intervalos bootstrap del 95% y ninguna resulta estadísticamente significativa.

| Benchmark | Precision Sparkle (%) | Precision Qwen (%) | Diferencia | Tokens razonamiento Sparkle | Tokens razonamiento Qwen | Reduccion |
|---|---|---|---|---|---|---|
| GPQA Diamond | 88,3 | 88,8 | −0,5 | 4.471 | 7.670 | −42% |
| AIME 2026 | 92,5 | 95,8 | −3,3 | 8.732 | 14.822 | −41% |
| HMMT | 88,1 | 86,1 | +2,0 | 13.540 | 21.182 | −36% |
| LiveCodeBench | 86,0 | 82,0 | +4,0 | 8.607 | 15.276 | −44% |
| IFEval | 91,1 | 90,8 | +0,4 | 646 | 695 | −7% |
| MMLU-Pro | 84,0 | 83,6 | +0,4 | 518 | 708 | −27% |
| FRAMES | 69,8 | 70,6 | −0,9 | 644 | 1.228 | −48% |

En trabajo documental (GroundedWork), la model card del modelo base reporta 91,0 con la stop rule frente a 86,2 de Sparkle 1.0, y un 91,5% de rechazos correctos cuando la respuesta no está en los documentos.

Velocidad con un usuario y 1×H100, vLLM 0.32.0 con 1 token borrador MTP, 20 preguntas fijas (10 GPQA Diamond, 10 LiveCodeBench):

| Metrica | Sparkle 1.1 | Qwen |
|---|---|---|
| Tiempo mediano por respuesta | 32,9 s | 40,8 s |
| Preguntas en las que fue mas rapido | 15 de 20 | 5 de 20 |

## Requisitos de hardware

- **VRAM estimada**: los pesos FP8 ocupan 30,9 GB; con caché KV para 128k de contexto se necesita una GPU de 80 GB. Para contextos menores, la huella se reduce proporcionalmente.
- **GPU recomendadas**: una H100 de 80 GB sirve el modelo con 128k de contexto según la model card. Para contextos más cortos, A100 80 GB o GPUs de 48 GB podrían ser suficientes, aunque no se confirma en la documentación.
- **Consumer GPU**: no cabe en GPUs de consumo de 24 GB (RTX 4090) en FP8 sin cuantización adicional; no se documentan pesos GGUF ni otras cuantizaciones para esta versión.
- **Despliegue**: vLLM (versión validada 0.32.0, con MTP y 1 token borrador). Compatible con transformers por la librería declarada. No se documentan opciones llama.cpp, Ollama ni TGI para esta versión FP8.
- **Latencia y throughput**: mediana de 32,9 s por respuesta con un usuario en H100, thinking activado y MTP. No se reportan cifras de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| KVARK Sparkle 1.1 27B FP8 | 27,78B | 128k | Apache 2.0 | safetensors FP8 | Multimodal, MTP, razonamiento eficiente en tokens |
| Qwen (referencia de la model card) | no disponible | no disponible | no disponible | no disponible | Comparable usado en los benchmarks; accuracy similar, más tokens de razonamiento y mayor latencia |
| KVARK Sparkle 1.0 27B | no disponible | no disponible | no disponible | no disponible | Versión anterior; 86,2 en GroundedWork y 36% de rechazos correctos frente a 91,0 y 91,5% de la 1.1 |

No se dispone de datos suficientes para comparar con otras alternativas de la misma categoría (por ejemplo, modelos multimodales de 27-30B de otros proveedores) más allá del Qwen de referencia y la versión 1.0 del propio modelo.

## Limitaciones y advertencias

- **Idiomas**: solo se declaran inglés y serbio; el rendimiento en castellano no está evaluado y no debería asumirse.
- **Sesgos**: no se documenta ninguna evaluación de sesgos en la información disponible.
- **Alucinación**: aunque el modelo declina correctamente en el 91,5% de los casos sin respuesta documental con la stop rule, sigue siendo un modelo generativo y puede producir contenido incorrecto, especialmente sin esa regla activa.
- **Diferencias no significativas**: la model card indica explícitamente que ninguna diferencia de accuracy frente al comparable es estadísticamente significativa; el argumento del modelo es la eficiencia en tokens, no la superioridad en precisión.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y de los datos de entrenamiento (no documentados).
- **Formato**: solo se distribuyen pesos FP8; no hay GGUF ni cuantizaciones de menor precisión, lo que limita el despliegue en hardware de consumo.
- **Madurez**: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-10; es un modelo muy reciente y sin validación comunitaria.
- **Tool calling**: no se documenta soporte de function calling, lo que puede limitar su uso en pipelines agénticos que dependan de herramientas externas.

## Enlaces

- Modelo en Hugging Face (FP8): https://huggingface.co/Egzakta/Kvark-Sparkle-1.1-27B-FP8
- Modelo base: https://huggingface.co/Egzakta/Kvark-Sparkle-1.1-27B
- Resultados de trabajo documental (GroundedWork): referenciados en la model card del modelo base
