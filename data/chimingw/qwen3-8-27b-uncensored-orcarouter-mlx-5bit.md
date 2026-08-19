# chimingw/Qwen3.8-27B-Uncensored-OrcaRouter-MLX-5bit

## Resumen

El modelo `chimingw/Qwen3.8-27B-Uncensored-OrcaRouter-MLX-5bit` es una conversión nativa al formato MLX (Apple Silicon) de un checkpoint "uncensored" (abliterado) del modelo Qwen3.8-27B, publicado originalmente por OrcaRouter en formato GGUF. Se trata de un modelo denso de visión y lenguaje (image-text-to-text) que incorpora una cabeza de decodificación especulativa MTP (multi-token prediction) para acelerar la inferencia. El autor de la conversión, chimingw, ha reconstruido los pesos directamente desde el padre F16, aplicando una cuantización afín de 5 bits con grupo de 64, sin transcodificar desde otra cuantización ni añadir entrenamiento adicional.

La relevancia de este modelo radica en que ofrece una versión sin alineación de seguridad (refusal-removed) del Qwen3.8-27B, diseñada explícitamente para investigación en interpretabilidad, red-teaming y estudio de mecanismos de rechazo. El repositorio incluye advertencias severas sobre su uso: no debe desplegarse en producción sin capas de moderación adicionales. La licencia es Apache 2.0, heredada del modelo base.

Existe una discrepancia notable en los metadatos: el nombre indica 27B de parámetros, pero el campo de safetensors reporta 6.661.141.232 parámetros (~6,66B). Esta inconsistencia probablemente se debe a un error de lectura de HuggingFace sobre un único shard. El payload total de tensores es de 21.446.863.360 bytes (~19,97 GiB), coherente con un modelo de ~27B cuantizado a 5 bits (27B × 0,625 bytes ≈ 16,9 GB) más el proyector de visión (~1 GB). Se asume que el modelo real es de 27B, tal como indica su nombre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de visión y lenguaje (Qwen3.5) con cabeza MTP de decodificación especulativa |
| Parametros totales | 27B (nominal); los metadatos de safetensors indican 6.661.141.232, dato inconsistente con el nombre y el tamaño del payload |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | MLX afín 5-bit, grupo 64 (pesos cuantizados); tensores densos en F16/BF16/F32 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 5 shards; también disponible GGUF del padre |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de visión y lenguaje construido sobre la arquitectura Qwen3.5. Incorpora un codificador de visión (vision projector) que se integra con el modelo de lenguaje, y una cabeza MTP (multi-token prediction) que permite decodificación especulativa, prediciendo varios tokens por paso para acelerar la generación. No se dispone de detalles sobre el número de capas, dimensiones ocultas o número de cabezas de atención.

El checkpoint "uncensored" fue generado por OrcaRouter mediante abliteración, una técnica que ortogonaliza la dirección de rechazo del flujo residual, eliminando de forma sustancial la alineación de seguridad del modelo original. No se ha realizado ningún fine-tuning, merge o entrenamiento adicional. La conversión a MLX por parte de chimingw es una transformación de formato puramente técnica: reconstruye los tensores desde el GGUF F16 padre, manteniendo la precisión original (F16, BF16 o F32 según el tensor) y cuantizando a 5 bits las matrices elegibles. El autor audita la procedencia de precisión, pero no valida las afirmaciones de comportamiento del modelo abliterado.

## Capacidades

- Generación de texto y razonamiento multilingüe (inglés y chino).
- Comprensión de imágenes (visión-lenguaje) gracias al proyector de visión integrado.
- Decodificación especulativa mediante la cabeza MTP, que reduce la latencia de inferencia.
- Sin alineación de seguridad: el modelo no presenta rechazos ante peticiones dañinas, éticas o ilegales que el Qwen3.8-27B original rechazaría.
- No se documentan capacidades de tool calling, function calling o agentes en la información disponible.
- No se especifica soporte para modos de pensamiento (thinking mode) ni audio.

## Casos de uso

- Investigación en interpretabilidad: estudiar cómo la abliteración altera los mecanismos internos de rechazo y qué direcciones del espacio residual codifican la negativa.
- Red-teaming y evaluación de robustez: probar el modelo con entradas adversariales para medir la eficacia de técnicas de jailbreak y el impacto de la eliminación de guardarraíles.
- Estudios de seguridad de IA: comparar el comportamiento de un modelo sin alineación frente al original para cuantificar el efecto de la alineación en la calidad de las respuestas.
- Experimentos controlados de alineación: re-introducir capas de moderación externas y evaluar su efectividad sobre un modelo que carece de rechazo interno.
- Desarrollo de sistemas de moderación: usar el modelo como generador de contenido problemático en entornos aislados para entrenar clasificadores de contenido dañino.
- Evaluación de técnicas de decodificación especulativa: aprovechar la cabeza MTP para medir la aceleración real en hardware Apple Silicon con MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README del autor no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones. La conversión MLX no aporta datos de rendimiento cuantitativo, más allá de la afirmación de que la decodificación especulativa MTP reduce la latencia, sin cifras concretas.

## Requisitos de hardware

- El formato MLX está diseñado para Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). El autor menciona que las pruebas de integridad se realizaron en un M4 Pro.
- Memoria unificada estimada: con cuantización 5-bit y un payload de ~21,4 GB, se recomienda un mínimo de 32 GB de RAM unificada para cargar los pesos y dejar margen para el contexto y el proyector de visión. Para uso cómodo con contexto largo, 64 GB o más.
- No es adecuado para GPUs NVIDIA/AMD en este formato; para esas plataformas se debe usar la versión GGUF del padre (por ejemplo, Q4_K_M de ~16,8 GB).
- Opciones de despliegue: MLX (librería `mlx-lm`), compatible con entornos Python en macOS. La versión GGUF se puede usar con llama.cpp, Ollama o LM Studio.
- Latencia y throughput: no disponibles. La cabeza MTP debería mejorar la velocidad de generación, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Formato | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| `chimingw/Qwen3.8-27B-Uncensored-OrcaRouter-MLX-5bit` | MLX 5-bit | 27B (nominal) | No disponible | Apache 2.0 | Abliterado, visión-lenguaje, MTP |
| `majentik/Qwen3.8-27B-MLX-5bit` | MLX 5-bit | 27B | No disponible | Apache 2.0 | Misma arquitectura base sin abliteración |
| `orcarouter/Qwen3.8-27B-Uncensored-GGUF` | GGUF F16 | 27B | No disponible | Apache 2.0 | Padre del modelo, abliterado, formato GGUF |
| `Qwen/Qwen3.8-27B` (original) | Varios | 27B | No disponible | Apache 2.0 | Modelo oficial con alineación de seguridad |

No hay datos de benchmarks comparativos publicados en la información disponible.

## Limitaciones y advertencias

- El modelo ha sido abliterado: su alineación de seguridad ha sido eliminada de forma sustancial. No tiene guardarraíles internos y puede generar contenido dañino, ilegal, ofensivo o poco ético.
- El autor del modelo base (OrcaRouter) declara que se libera estrictamente para investigación legítima: interpretabilidad, seguridad, red-teaming y experimentos controlados. No debe desplegarse a usuarios finales ni en producción sin añadir capas propias de moderación y prevención de abusos.
- Riesgo de alucinación: no se ha evaluado específicamente, pero es inherente a los modelos de lenguaje y puede verse agravado por la ausencia de alineación.
- Idiomas limitados a inglés y chino; el rendimiento en otros idiomas no está garantizado.
- La licencia Apache 2.0 permite uso comercial, pero las advertencias del autor desaconsejan su uso en producción sin medidas adicionales.
- La discrepancia en el número de parámetros (6,66B reportados frente a 27B nominales) sugiere un posible error en los metadatos de HuggingFace; se recomienda verificar la integridad de los pesos antes de su uso.
- No hay información sobre la longitud de contexto soportada, lo que dificulta planificar su uso en tareas de contexto largo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chimingw/Qwen3.8-27B-Uncensored-OrcaRouter-MLX-5bit
- Versión GGUF del padre (OrcaRouter): https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-GGUF
- Repo GitHub con instrucciones de uso del modelo uncensored: https://github.com/Wassimyounes01/qwen38-uncensored
- Modelo MLX 5-bit sin abliteración (majentik): https://huggingface.co/majentik/Qwen3.8-27B-MLX-5bit
- Ficha del modelo en LM Studio: https://lmstudio.ai/models/qwen/qwen3.8-27b
- Publicación en X del autor de OrcaRouter: https://x.com/chimingwang/status/2088756255800406450
