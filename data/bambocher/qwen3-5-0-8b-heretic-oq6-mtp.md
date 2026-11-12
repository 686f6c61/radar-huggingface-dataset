# bambocher/Qwen3.5-0.8B-heretic-oQ6-mtp

## Resumen

Qwen3.5-0.8B-heretic-oQ6-mtp es una versión cuantizada y "descensurada" (ablacionada para reducir rechazos) del modelo Qwen/Qwen3.5-0.8B, publicada por el usuario bambocher en Hugging Face. El checkpoint combina tres intervenciones: una ablación de comportamiento mediante Heretic v2.0.0 (que elimina la mayor parte de las respuestas de rechazo), una cuantización de precisión mixta con oQ de oMLX v0.7.3 (media efectiva de 7,790 bits por peso) y la conservación íntegra de la cabeza de predicción multi-token (MTP) del modelo original.

El modelo tiene 873.438.784 parámetros reales según los safetensors, distribuidos en un backbone de lenguaje de 0,752B, un codificador visual de 0,101B y una cabeza MTP de 0,020B. Esto confirma que el modelo base es multimodal (acepta imagen y texto) y que incorpora decodificación especulativa nativa mediante MTP. El repositorio ocupa 1,7 GB y los pesos se almacenan en formato MLX safetensors, por lo que está pensado para ejecutarse en Apple Silicon, no en CUDA.

Su relevancia práctica es doble: por un lado, ofrece un modelo multimodal de menos de mil millones de parámetros ejecutable en hardware de consumo; por otro, documenta de forma cuantitativa el efecto de la ablación (0 rechazos en 100 frente a 97 en el original, con divergencia KL de 0,1412), lo que lo convierte en un caso de estudio útil sobre los compromisos entre alineación y utilidad. La licencia no está declarada en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone de lenguaje + codificador visual + cabeza MTP); familia Qwen3.5 |
| Parametros totales | 873.438.784 (0,873B): 0,752B lenguaje, 0,101B vision, 0,020B cabeza MTP |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión mixta oQ (oMLX v0.7.3): affine 6-bit grupo 64 (79,819% de los pesos), affine 8-bit grupo 64 (8,366%), BF16 (11,815%); media efectiva 7,790 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (librería mlx) |

## Arquitectura y entrenamiento

El checkpoint deriva de Qwen/Qwen3.5-0.8B, un transformer multimodal de la familia Qwen3.5 que integra un codificador visual de 0,101B parámetros junto al modelo de lenguaje. La presencia de una cabeza de predicción multi-token (MTP) de 0,020B indica que el modelo base incorpora decodificación especulativa entrenada, lo que permite generar varios tokens por paso de verificación y aumentar el throughput en inferencia. El autor conserva esta cabeza intacta tras la cuantización.

Sobre el modelo base se aplicó Heretic v2.0.0, una técnica de ablación de rangos arbitrarios (ARA) que modifica las activaciones en las capas 1 a 19 con los parámetros documentados: `preserve_good_behavior_weight` 0,8199, `steer_bad_behavior_weight` 0,0001, `overcorrect_relative_weight` 1,0547 y `neighbor_count` 14. El resultado reportado es de 0 rechazos en 100 prompts frente a 97 del original, con una divergencia KL de 0,1412 respecto al modelo sin modificar. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens, ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento general heredados del modelo base Qwen3.5-0.8B.
- Procesamiento de visión: el checkpoint incluye un codificador visual de 0,101B parámetros, por lo que admite entradas de imagen además de texto.
- Decodificación especulativa mediante la cabeza MTP conservada, orientada a reducir la latencia de generación.
- Comportamiento con rechazos prácticamente eliminados: 0/100 en la evaluación del autor, lo que habilita respuestas sobre temas que el modelo original declinaba.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: al estar en formato MLX con 0,792 GiB de pesos, se puede cargar en un Mac con memoria unificada mediante la librería mlx y ejecutar generación de texto e imagen sin GPU dedicada.
- Prototipado de asistentes multimodales: el codificador visual de 0,101B permite construir demos de descripción de imágenes o respuesta a preguntas sobre capturas y documentos escaneados en un portátil.
- Investigación sobre alineación y ablación: la métrica de 0 rechazos frente a 97 y la KL de 0,1412 permiten estudiar empíricamente el coste de eliminar el comportamiento de rechazo en modelos pequeños.
- Evaluación de cuantización de precisión mixta: la distribución documentada (6-bit, 8-bit y BF16 por tensor) sirve para medir la degradación de calidad de oQ frente a BF16 en tareas concretas.
- Generación de texto de bajo coste en edge: con menos de mil millones de parámetros, encaja en entornos con restricciones de memoria donde un modelo de 7B no es viable.
- Benchmarking de decodificación especulativa: la cabeza MTP intacta permite comparar throughput con y sin predicción multi-token en el mismo checkpoint.
- Filtrado y clasificación de contenido sin restricciones de rechazo: útil en pipelines internos donde las negativas del modelo alineado interrumpen el procesamiento por lotes.

## Benchmarks y rendimiento

| Metrica | Este modelo | Qwen/Qwen3.5-0.8B |
|---|---|---|
| Rechazos | 0/100 | 97/100 |
| Divergencia KL | 0,1412 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 0,792 GiB de pesos en el checkpoint; el repositorio completo ocupa 1,7 GB. Con overhead de ejecución MLX, se puede asumir un consumo en torno a 1-2 GB de memoria unificada, aunque no se ha publicado una cifra oficial.
- GPU recomendadas: el formato MLX está diseñado para Apple Silicon (series M1, M2, M3, M4); no es compatible de forma nativa con CUDA.
- Cabe en GPU de consumo: sí, en cualquier Mac con Apple Silicon y al menos 8 GB de memoria unificada; también en equipos con 16 GB sin dificultad.
- Opciones de despliegue: librería mlx y el ecosistema oMLX (https://github.com/jundot/omlx). No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que los pesos están en formato MLX.
- Latencia y throughput: no disponibles; la cabeza MTP debería reducirlos frente a decodificación autoregresiva estándar, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| bambocher/Qwen3.5-0.8B-heretic-oQ6-mtp | 0,873B | no disponible | MLX safetensors | no disponible | Ablación Heretic, cuantización oQ mixta, MTP intacta, 0/100 rechazos |
| Qwen/Qwen3.5-0.8B | 0,8B (aprox.) | no disponible | safetensors | no disponible | Modelo base sin modificar; 97/100 rechazos; referencia de calidad |
| Alternativas de <1B en MLX | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- La ablación Heretic elimina los rechazos, pero no garantiza la eliminación de sesgos ni de contenido dañino: el modelo puede producir respuestas inapropiadas o incorrectas que el original bloqueaba.
- La divergencia KL de 0,1412 respecto al modelo base indica una desviación medible en la distribución de salida; puede degradar la calidad en tareas que dependían del comportamiento alineado.
- Riesgo de alucinación elevado por el tamaño reducido (0,873B) y por la modificación de activaciones en 19 capas.
- La licencia no está declarada, lo que impide confirmar si se permite uso comercial; hay que contactar con el autor o consultar la licencia del modelo base Qwen3.5-0.8B.
- Solo funciona en el ecosistema MLX (Apple Silicon); no hay pesos GGUF ni safetensors estándar para CUDA.
- No se documentan idiomas soportados, longitud de contexto ni capacidades de tool calling, lo que limita su uso en producción sin evaluación previa.
- El autor indica que el modelo se recuantizó el 2026-11-12 con oMLX v0.7.3; versiones anteriores descargadas pueden diferir.
- El modelo tiene solo 47 descargas y 0 likes, sin validación independiente de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/bambocher/Qwen3.5-0.8B-heretic-oQ6-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de oMLX (cuantización oQ): https://github.com/jundot/omlx
- Proyecto Heretic: https://heretic-project.org
