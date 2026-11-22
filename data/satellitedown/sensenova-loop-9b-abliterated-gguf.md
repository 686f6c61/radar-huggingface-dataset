# satellitedown/SenseNova-Loop-9B-abliterated-GGUF

## Resumen

SenseNova-Loop-9B-abliterated-GGUF es la versión cuantizada en formato GGUF del modelo SenseNova-Loop-9B-abliterated, un modelo de lenguaje de tipo "looped transformer" (transformer con iteraciones recurrentes) al que se le han eliminado los mecanismos de rechazo mediante la técnica de abliteration. Lo publica el usuario satellitedown, que parte del modelo base SenseNova-Loop-9B, un modelo de aproximadamente 9.000 millones de parámetros según su denominación comercial, aunque el checkpoint en safetensors reporta 1.560.405.504 parámetros reales en el repositorio.

El modelo resuelve el problema de la censura en modelos conversacionales: la variante abliterated está optimizada para ejecutar peticiones potencialmente dañinas en lugar de rechazarlas, lo que la hace adecuada para investigación sobre alineamiento, red-teaming y evaluación de salvaguardas. Es relevante ahora porque incluye builds GGUF listos para llama.cpp, con soporte para decodificación especulativa mediante un modelo drafter auxiliar que acelera la generación hasta 3-6 veces en tareas de código.

La ficha cubre únicamente la información publicada en el repositorio de Hugging Face: cuantizaciones Q4_K_M y Q6_K, drafter DFlash de 1,3B parámetros, y requisitos de un fork específico de llama.cpp. No hay datos de benchmarks de conocimiento general (MMLU, HumanEval, GSM8K) en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Looped transformer (transformer con iteraciones recurrentes), text-only |
| Parámetros totales | 1.560.405.504 (según safetensors del repo); denominación comercial 9B |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 32K según pruebas del autor (24.576 tokens en el comando de ejemplo) |
| Tipos de cuantización | Q4_K_M (5,64 GB) y Q6_K (7,38 GB) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |
| Modelo base | satellitedown/SenseNova-Loop-9B-abliterated |
| Drafter auxiliar | DFlash block drafter, 6 capas, 1,3B parámetros, 0,92 GB (Q4_K_M) |
| Tamaño del repo | 27,7 GB |
| Descargas | 8.795 |
| Likes | 6 |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura de "looped transformer", en la que el bloque transformer se aplica de forma iterativa sobre los estados ocultos, lo que permite aumentar la profundidad efectiva de cómputo sin incrementar proporcionalmente el número de parámetros. Es un modelo text-only: la torre de visión del modelo original no está incluida en esta variante. La model card menciona la etiqueta "mhc" sin detallar su significado técnico.

El proceso de abliteration elimina las direcciones de rechazo del espacio de activaciones, seleccionando las variantes por su capacidad de ejecutar peticiones dañinas en lugar de por su tasa de rechazo. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

La innovación técnica destacable es el sistema de decodificación especulativa con drafter DFlash: un modelo auxiliar de 6 capas y 1,3B parámetros que lee los estados ocultos del modelo principal y propone los siguientes 7 tokens, que el modelo principal verifica en una sola pasada. El drafter se entrenó sobre 11.942 respuestas y 5.406 turnos de agente de código generados por el propio archivo Q4_K_M, con estados ocultos extraídos a través de llama.cpp. Su capa de salida cubre los 65.536 tokens más frecuentes (un cuarto del vocabulario). Mantiene 3,5 tokens por pasada en respuestas held-out y 3,7 en turnos de agente. Se combina además con drafting por n-gramas del prompt (`ngram-simple`).

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento con modo "thinking" (el autor lo desactiva explícitamente en algunas pruebas con `thinking off`).
- Generación de código y tareas de agente de código (el drafter se entrenó con turnos de coding-agent).
- Tool calling / function calling: el comando de ejemplo usa `--jinja`, lo que habilita plantillas de chat con soporte de herramientas.
- Ejecución de peticiones que modelos alineados rechazarían (abliterated/uncensored).
- Decodificación especulativa acelerada con drafter DFlash y n-gramas.
- No incluye capacidades de visión (torre de visión excluida).
- No incluye cabeza de multi-token-prediction en los builds upstream.

## Casos de uso

- Investigación sobre alineamiento y red-teaming: el modelo permite estudiar qué respuestas produce un modelo sin mecanismos de rechazo, útil para evaluar taxonomías de daño y calibrar salvaguardas en modelos alineados.
- Generación de código en local con aceleración especulativa: con el drafter DFlash se alcanzan 31,6 tokens/s en código nuevo y hasta 65,7 tokens/s al modificar un archivo leído, sobre un M4 MacBook Air de 16 GB, lo que lo hace viable para asistentes de código en portátiles sin GPU dedicada.
- Agentes de código multi-paso: el autor reporta 10/10 tareas de coding-agent superadas con 29,0 tokens/s usando thinking y drafter, adecuado para pipelines de edición autónoma de ficheros.
- Despliegue en hardware de consumo: el archivo Q4_K_M (5,64 GB) cabe en 16 GB de RAM unificada y ofrece 11,11 tokens/s en un M4 MacBook Air, permitiendo inferencia local sin GPU.
- Evaluación comparativa de cuantizaciones: el repo publica métricas de KL y coincidencia de top token (94,1% para Q4_K_M, 98,3% para Q6_K frente a precisión completa), útil para estudiar el impacto de la cuantización en modelos looped.
- Experimentación con decodificación especulativa: sirve como banco de pruebas para comparar drafters (drafter-1 con 3,65 tokens/pasada frente a drafter-2 con 3,74 en turnos de agente) y estrategias de n-gramas.
- Chat conversacional bilingüe en inglés y chino con contexto largo (hasta 32K) en entornos donde no se requiere alineamiento de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor publica métricas de fidelidad de cuantización y velocidad:

| Métrica | Q4_K_M | Q6_K |
|---|---|---|
| Tamaño | 5,64 GB | 7,38 GB |
| Mismo top token que precisión completa | 94,1% | 98,3% |
| KL media | 0,0333 | 0,0036 |
| Velocidad (M4 MacBook Air 16 GB) | 11,11 tokens/s | 8,72 tokens/s |

Aceleración con drafter (M4 MacBook Air, temperatura 0, thinking off):

| Tarea | Sin drafting | Con drafter |
|---|---|---|
| Código nuevo | 11,08 tokens/s | 31,6 tokens/s |
| Prosa explicativa | 11,02 tokens/s | 12,2 tokens/s |
| Archivo leído con cambio pequeño | 11,01 tokens/s | 65,7 tokens/s |
| Archivo escrito vía tool call | 10,62 tokens/s | 59,5 tokens/s |

En 10 tareas de coding-agent con thinking: 29,0 tokens/s con drafter frente a 9,1 con solo n-gramas, con 10/10 superadas.

## Requisitos de hardware

- VRAM/RAM estimada: Q4_K_M requiere ~5,64 GB de pesos; Q6_K ~7,38 GB. El drafter añade 0,92 GB.
- En un Mac de 16 GB, el autor recomienda el archivo de 4 bits; con el de 6 bits a contexto de 32K la máquina quedó con menos de 0,1 GB libres y usando swap.
- GPU recomendadas: no se especifican modelos concretos (A100, H100, RTX 4090); el autor prueba en Apple Silicon (M4 MacBook Air). En NVIDIA advierte que las respuestas con y sin drafter pueden diferir a temperatura 0 por redondeo.
- Cabe en GPU de consumo: sí, el Q4_K_M en tarjetas con ≥8 GB de VRAM; el Q6_K en ≥10 GB.
- Opciones de despliegue: llama.cpp. Los archivos `upstream-` requieren el PR 32588 de ggml-org/llama.cpp; los archivos sin `-upstream-` y el drafter requieren el fork GuideboardLabs/llama.cpp-sensenova-loop en el commit `a7f77a788893ef2cb17c82b9ac0cb1279bcd0918` con 19 parches de `patches/`.
- Latencia/throughput: 11,11 tokens/s (Q4_K_M) y 8,72 tokens/s (Q6_K) en M4 Air; bajo carga continua el Q4_K_M baja a ~9 tokens/s en minutos y ~7 tras 25 minutos por ausencia de ventilador.
- Flags recomendados: `-ngl 99 -c 24576 --jinja -fa on --parallel 1 --cache-ram 0 --ctx-checkpoints 3 --ctx-checkpoint-turns --prompt-tile 32 --spec-type ngram-simple,draft-dflash --spec-ngram-simple-size-m 31 --spec-draft-n-max 7`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-abliterated-GGUF | 1,56B reales (9B nominal) | hasta 32K | apache-2.0 | GGUF en HF, requiere fork de llama.cpp | Con drafter DFlash y abliteration |
| SenseNova-Loop-9B-GGUF (sensenova) | 9B nominal | no disponible | no disponible | GGUF en HF, soporte en PR 32588 | Modelo original alineado, con cabeza MTP |
| z-lab/Qwen3.5-9B-DFlash | drafter 1,3B | no disponible | no disponible | HF | Base del drafter de este repo |

No se dispone de datos de benchmarks que permitan comparar rendimiento cognitivo con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo abliterated/uncensored: ejecutará peticiones dañinas; no debe desplegarse en producción orientada a usuarios sin salvaguardas externas.
- Solo inglés y chino; no hay soporte declarado de castellano.
- Sin torre de visión: no procesa imágenes.
- Requiere un fork específico de llama.cpp con 19 parches para los archivos no-upstream y el drafter; los archivos upstream dependen de un PR abierto (a 21 de noviembre de 2026) y no cargan en builds estándar.
- El drafter solo es válido para este modelo y esta cuantización; con otro archivo no altera respuestas pero acepta menos tokens.
- En NVIDIA, las respuestas con y sin drafter pueden divergir a temperatura 0 por redondeo en pasadas multi-token.
- Riesgo de alucinación: no cuantificado en la información disponible.
- En Mac de 16 GB, el Q6_K a 32K agota la memoria y usa swap.
- La discrepancia entre el nombre comercial (9B) y los parámetros reales del safetensors (1,56B) debe tenerse en cuenta al planificar hardware.
- Licencia apache-2.0 permite uso comercial, pero la ausencia de alineamiento traslada la responsabilidad legal y ética al desplegador.

## Enlaces

- Repositorio GGUF: https://huggingface.co/satellitedown/SenseNova-Loop-9B-abliterated-GGUF
- Modelo base abliterated: https://huggingface.co/satellitedown/SenseNova-Loop-9B-abliterated
- Modelo original GGUF: https://huggingface.co/sensenova/SenseNova-Loop-9B-GGUF
- PR de soporte en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/32588
- Fork de llama.cpp: https://github.com/GuideboardLabs/llama.cpp-sensenova-loop
- Drafter base: https://huggingface.co/z-lab/Qwen3.5-9B-DFlash
