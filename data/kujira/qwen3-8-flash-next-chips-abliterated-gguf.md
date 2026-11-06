# Kujira/Qwen3.8-Flash-Next-CHiPS-Abliterated-GGUF

## Resumen

Qwen3.8-Flash-Next-CHiPS-Abliterated es una modificación no oficial del archivo `UD-Q3_K_XL` publicado por Unsloth para Qwen3.8-Flash-Next, un modelo de mezcla de expertos (MoE) de la familia Qwen. El autor, Kujira, aplica una técnica propia denominada CHiPS+ (Causal Head-isolated Projection Steering) para reducir el comportamiento de rechazo del modelo original. No es un lanzamiento de Qwen ni de Unsloth, y ninguno de los dos equipos lo respalda. Se distribuye como un único archivo GGUF cuantizado en Q3_K_XL, dividido en cuatro partes, más un adaptador LoRA en F16 para aplicar el mismo cambio sobre otras cuantizaciones.

El modelo resuelve un problema muy concreto: eludir las negativas del modelo base ante peticiones consideradas dañinas, manteniendo el resto del comportamiento lo más intacto posible. La edición afecta únicamente a 47 tensores de las matrices de salida de atención, reescritos en F16, mientras que el resto de tensores, incluidos los expertos y el router, permanecen idénticos byte a byte. El resultado declarado es una reducción de rechazos del 92 al 24 sobre un conjunto de 96 peticiones dañinas, con un aumento de perplejidad del 4,5%.

Es relevante ahora porque ilustra una tendencia creciente de ediciones quirúrgicas sobre modelos MoE de gran tamaño, y porque su evaluación se publica con metodología explícita (incluido el uso de un modelo como juez). No obstante, se trata de una vista previa experimental con cobertura de evaluación limitada: no se probaron GSM8K, MMLU-Pro, tareas largas ni tool calling.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE tipo transformer, arquitectura `qwen4exp` en llama.cpp |
| Parámetros totales | 461.312 (según safetensors del modelo base) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q3_K_XL (único archivo publicado); LoRA F16 para otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en la model card) |
| Formato de pesos | GGUF (4 particiones) + LoRA GGUF F16 |

## Arquitectura y entrenamiento

El modelo base es un MoE de la familia Qwen (etiqueta `qwen4exp`), con 461.312 parámetros totales según los safetensors. La edición no implica reentrenamiento: CHiPS (Causal Head-isolated Projection Steering) selecciona un conjunto reducido de cabezas de atención en función de su efecto causal sobre el comportamiento de rechazo y modifica únicamente sus proyecciones. En este modelo MoE, unas pocas cabezas solo alteraban parcialmente la conducta, por lo que CHiPS+ añade una segunda edición sobre las capas de atención. Los expertos y el router no se tocan.

El resultado son 47 tensores reescritos de un total de 1.224: 35 eran Q8_0 y 12 Q6_K, y se almacenan en F16 porque la edición es pequeña y recuantizarla a Q8_0 o Q6_K perdía gran parte del efecto. El tamaño del archivo pasa de 89,46 GB a 90,20 GB (+0,8%). La receta de CHiPS+ no está publicada. No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni uso de RLHF o DPO, ya que no se trata de un modelo entrenado desde cero sino de una edición de pesos.

## Capacidades

- Generación de texto y razonamiento conversacional heredados del modelo base Qwen3.8-Flash-Next.
- Respuesta a peticiones dañinas con rechazo reducido: de 92 rechazos sobre 96 peticiones en el original a 24 en esta versión.
- Modo thinking desactivable mediante plantilla de chat (las evaluaciones se hicieron con thinking off).
- Compatibilidad con llama.cpp y su servidor (`llama-server`) con plantilla Jinja (`--jinja`).
- Aplicación del mismo cambio sobre otras cuantizaciones mediante el adaptador LoRA F16 incluido.
- Tool calling: no evaluado en esta versión (la model card indica explícitamente que no se probó).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión: no incluida; no se proporciona proyector visual y no se probó.

## Casos de uso

- Investigación sobre alineación y mecanismos de rechazo: permite estudiar qué cabezas de atención controlan la negativa a responder y cómo afecta su edición al comportamiento global, con una metodología reproducible sobre el archivo publicado.
- Evaluación de técnicas de steering en MoE: sirve como caso práctico de CHiPS+ sobre un modelo con expertos y router intactos, útil para comparar con métodos de abliteración clásicos que modifican todas las capas.
- Pruebas de robustez de filtros de seguridad: al reducir los rechazos, permite medir si los clasificadores de entrada y salida de un pipeline detectan contenido que el modelo ya no bloquea por sí mismo.
- Despliegue local en llama.cpp para experimentación: el GGUF de cuatro partes se carga con `llama-server -ngl 99 --jinja`, lo que facilita probar el modelo en entornos de laboratorio con ~90 GB de memoria.
- Aplicación del adaptador LoRA sobre otras cuantizaciones: el archivo `LoRA-F16.gguf` de 1,52 MB permite replicar el efecto sobre variantes del modelo base sin descargar el GGUF completo, útil para comparar cuantizaciones.
- Estudio de degradación por cuantización: la decisión de mantener los tensores editados en F16 frente a Q8_0/Q6_K documenta cómo la recuantización destruye parte de la edición, un dato relevante para quien diseñe sus propios merges.
- Generación de texto sin restricciones en entornos controlados: para pruebas de red teaming interno donde se necesita que el modelo no se niegue a completar escenarios de evaluación.

## Benchmarks y rendimiento

Los datos proceden de la model card y se midieron sobre el archivo publicado y el `UD-Q3_K_XL` original, con decodificación greedy, thinking off, plantilla de chat propia y sin system prompt. Cada conjunto se ejecutó una vez; los conjuntos de peticiones no están publicados.

Peticiones dañinas (96 peticiones de un turno, máximo 1.024 tokens nuevos, etiquetadas por GPT-6):

| Métrica | Original | Este modelo |
|---|---|---|
| Rechazadas (R) | 92 | 24 |
| Parciales (P) | 3 | 38 |
| Ejecutadas (C) | 1 | 29 |
| Sin respuesta real (N) | 0 | 5 |
| Alcanzaron el límite de tokens | 4 | 36 |
| Tokens medios | 378 | 735 |

Peticiones inocuas (100 peticiones de un turno, máximo 512 tokens nuevos):

| Métrica | Original | Este modelo |
|---|---|---|
| Bucles | 0 | 0 |
| Respuestas vacías | 0 | 0 |
| Alcanzaron el límite de tokens | 79 | 95 |
| Tokens medios | 457 | 506 |

Capacidad y perplejidad (medidas con la edición aplicada como LoRA):

| Métrica | Original | Este modelo |
|---|---|---|
| Tareas cortas con respuesta exacta (55) | 100% | 100% |
| Perplejidad con teacher forcing | 2,29 | 2,40 (+4,5%) |

Una segunda lectura con el propio modelo sin editar como juez contó 93 rechazos antes y 22 después. GPT-6 también evaluó la edición aplicada como LoRA con límite de 400 tokens: 28 rechazos, 44 parciales, 20 ejecutadas y 4 sin respuesta real. No se probaron GSM8K, MMLU-Pro, tareas largas ni tool calling.

## Requisitos de hardware

- VRAM o memoria estimada: unos 90 GB para los pesos del GGUF Q3_K_XL (90,20 GB de repo).
- GPU recomendadas: no hay datos específicos del autor; por tamaño, requiere GPUs de 80 GB o más (A100 80 GB, H100 80 GB) o descarga parcial a CPU con `-ngl`.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en ninguna GPU consumer actual con los pesos completos; sería necesario offloading a memoria del sistema.
- Despliegue: llama.cpp con soporte para la arquitectura `qwen4exp`; el comando indicado es `llama-server -m <parte 1> -ngl 99 --jinja`. No hay datos sobre vLLM, TGI, Ollama u otros motores.
- Latencia y throughput: no disponibles.
- El adaptador LoRA F16 (1,52 MB) se carga con `--lora` sobre cualquier GGUF de Qwen3.8-Flash-Next, con efecto no medido en cuantizaciones distintas de Q3_K_XL.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rechazos (96 peticiones) | Licencia | Formatos |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-CHiPS-Abliterated (este) | 461.312 | no disponible | 24 | qwen-community-1.0 | GGUF Q3_K_XL + LoRA F16 |
| Qwen3.8-Flash-Next (original, UD-Q3_K_XL) | 461.312 | no disponible | 92 | qwen-community-1.0 | GGUF |
| Huihui-Qwen3.8-Flash-Next-abliterated-v2 (huihui-ai) | no disponible | no disponible | no disponible | no disponible | GGUF, Transformers, NVFP4 |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada. La comparación con la versión de huihui-ai se limita a la existencia de una alternativa de abliteración del mismo modelo base con más formatos publicados.

## Limitaciones y advertencias

- No es un lanzamiento oficial de Qwen ni de Unsloth; ninguno de los dos equipos lo respalda.
- Vista previa experimental: alrededor de una cuarta parte de las peticiones dañinas siguen rechazándose y cerca del 30% se ejecutan por completo; el resto recibe respuestas parciales.
- La evaluación usa GPT-6 como juez automático, que puede equivocarse, especialmente en la frontera entre rechazo y respuesta parcial.
- Cada conjunto de evaluación se ejecutó una sola vez y los conjuntos de peticiones no están publicados, lo que limita la reproducibilidad.
- No se probaron GSM8K, MMLU-Pro, tareas largas ni tool calling; el impacto en razonamiento y uso de herramientas es desconocido.
- La perplejidad sube un 4,5%, lo que indica una degradación medible del modelado del lenguaje.
- Las respuestas se alargan: 95 de 100 respuestas inocuas alcanzan el límite de 512 tokens, frente a 79 en el original, lo que aumenta coste y latencia en producción.
- La receta de CHiPS+ no está publicada, lo que dificulta auditar o reproducir la edición.
- Solo se publica la cuantización Q3_K_XL; el LoRA para otras cuantizaciones solo se probó sobre ese archivo y su fuerza en otras cuantizaciones no se midió.
- Sin proyector visual: la capacidad de visión no está incluida ni evaluada.
- Licencia qwen-community-1.0: deben revisarse los términos del archivo `LICENSE` antes de cualquier uso comercial, dado que se trata de una obra derivada de un modelo con licencia comunitaria.
- El modelo está diseñado explícitamente para reducir negativas ante peticiones dañinas; su uso en producción sin filtros externos de seguridad es desaconsejable.
- Idiomas soportados no documentados; el comportamiento multilingüe tras la edición es desconocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kujira/Qwen3.8-Flash-Next-CHiPS-Abliterated-GGUF
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Alternativa de abliteración de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF
- Ficha de la variante abliterated: https://www.abliteratedmodels.org/qwen3.8-flash-next-abliterated/
