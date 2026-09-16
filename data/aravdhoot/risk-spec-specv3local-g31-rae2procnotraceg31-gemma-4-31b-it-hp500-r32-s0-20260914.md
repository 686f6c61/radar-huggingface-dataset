# aravdhoot/risk-spec-specv3local-g31-rae2procnotraceg31-gemma-4-31b-it-hp500-r32-s0-20260914

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA entrenado con PEFT sobre el modelo base `google/gemma-4-31B-it`, publicado por el usuario `aravdhoot` bajo el identificador `risk-spec-specv3local-g31-rae2procnotraceg31-gemma-4-31b-it-hp500-r32-s0-20260914`. Forma parte de lo que la propia model card denomina "risk-spec local line", una línea de experimentos de ajuste fino orientada a especificaciones de riesgo, con una receta de entrenamiento cerrada y documentada en metadatos de procedencia.

Los metadatos indican un rango LoRA de 32, learning rate de 1e-4, 500 pasos máximos, `group_size` 4 y `groups_per_batch` 32, con un renderizador `gemma4_disable_thinking` que sugiere generación sin cadena de pensamiento explícita. La única métrica de calidad publicada es una divergencia KL final profesor-alumno de 0,024505969399757695, junto con un hash de constitución (`e5bdb41bc0fe`) y una semilla de WildChat (12345).

La relevancia de la ficha es limitada pero concreta: es un artefacto de investigación reproducible, sin descargas ni valoraciones, sin licencia declarada y sin benchmarks publicados. Su interés principal reside en el pipeline de destilación y en el control de procedencia (arm, constitution, recipe, commit), no en un uso directo en producción tal cual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | adaptador LoRA (PEFT) sobre un modelo base de arquitectura no verificada; la model card declara `google/gemma-4-31B-it` |
| Parametros totales | no disponible para el adaptador; el modelo base se declara de 31B en la model card |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el adaptador; pesos en safetensors. Un modelo fusionado heredaria las cuantizaciones soportadas por el base |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, `library_name: peft`) |
| Rango LoRA | 32 |
| Tamano del repositorio | 10,8 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-16 |
| Fecha de actualizacion | 2026-09-16 |
| Commit del repositorio | 30d7d98 |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) gestionado con la libreria PEFT, no un modelo entrenado desde cero ni un ajuste completo. La receta declarada en la model card es explícita: `lora_rank` 32, `lr` 0.0001, `max_steps` 500, `group_size` 4, `groups_per_batch` 32, `save_every` 20, revisión del modelo base `842da3794eaa0b77d5f08bae87a17459d91ff475` y renderizador `gemma4_disable_thinking`. Los prompts de entrenamiento provienen de `src/constitution/prompts/risk_seeds_v2.jsonl`, con semilla WildChat 12345, lo que apunta a un conjunto de datos mixto de semillas de riesgo y conversaciones sintéticas o muestreadas.

El procedimiento parece ser una destilación con regularización mediante divergencia KL respecto a un profesor, dado el campo `final_teacher_kl` con valor 0,024505969399757695. La procedencia se organiza en torno a un "arm" (`ra_e2_proc_notrace_g31`) y una "constitution" (`ra_e2_proc_notrace`, con hash SHA-256 truncado `e5bdb41bc0fe`), lo que sugiere un marco experimental de comparación entre variantes de alineamiento y control de trazas. No se detalla el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases adicionales de RLHF o DPO. Tampoco se especifica si el modelo base emplea atención lineal, decodificación especulativa u otra innovación de arquitectura.

## Capacidades

- Ajuste de comportamiento sobre el modelo base: al ser un adaptador LoRA, solo modifica la distribución de salida del base; no añade capacidades nuevas por sí mismo.
- Generación de texto condicionada por una constitución de riesgo: el nombre del arm y el fichero de prompts indican especialización en respuestas ante entradas de riesgo.
- Destilación con control de divergencia: el valor `final_teacher_kl` documenta el grado de aproximación al profesor, útil para experimentos de imitación.
- Renderizado sin cadena de pensamiento: el campo `renderer: gemma4_disable_thinking` indica que el formato de entrenamiento desactiva la traza de razonamiento explícita.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el renderizador declarado desactiva el modo de pensamiento.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio, thinking mode): no disponible.

## Casos de uso

- Investigación en alineamiento: comparar la variante `ra_e2_proc_notrace_g31` con otras variantes del mismo "arm" para medir el efecto de la constitución sobre las respuestas del modelo base, usando el hash `e5bdb41bc0fe` como identificador del conjunto de reglas aplicado.
- Estudio de destilación profesor-alumno: emplear el valor de divergencia KL (0,024505969399757695) como métrica de referencia para reproducir la receta y analizar cómo varía al cambiar `lora_rank`, `lr` o `max_steps`.
- Experimentos reproducibles de ajuste fino: la receta completa (rank 32, lr 0.0001, 500 pasos, group_size 4, save_every 20) permite replicar el entrenamiento en un clúster local y validar la reproducibilidad del pipeline.
- Auditoría de no trazabilidad: la etiqueta `notrace` en la constitución lo hace adecuado para entornos que exigen que el modelo no genere ni registre cadenas de razonamiento intermedias.
- Despliegue interno con PEFT: cargar el adaptador junto al base mediante `peft` y `transformers` o servirlo en vLLM con soporte LoRA para prototipos de investigación, no para producción crítica.
- Evaluación de robustez frente a prompts de riesgo: usar `risk_seeds_v2.jsonl` y la semilla WildChat 12345 como punto de partida para baterías de pruebas de seguridad y regresión.
- Base para fusionado y cuantización: una vez fusionado con el modelo base, se puede convertir a GGUF o a formatos de 4 bits para desplegarlo en hardware de gama alta de consumo, siempre que la licencia del base lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica numérica presente en la model card es `final_teacher_kl: 0.024505969399757695`, que mide divergencia respecto al profesor durante el entrenamiento y no es comparable con MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- Adaptador LoRA aislado: el repositorio ocupa 10,8 GB, un tamaño inusualmente alto para un adaptador de rango 32; la model card no explica el motivo (posibles checkpoints intermedios o artefactos adicionales).
- Inferencia en bf16 del modelo base declarado (31B): aproximadamente 62 GB solo en pesos, más caché KV; requeriría 2x A100 80 GB o 1x H100 80 GB con contexto reducido.
- Inferencia en int8: del orden de 31-35 GB; viable en 1x A100 80 GB y ajustado en 1x A100 40 GB.
- Inferencia en 4 bits (GPTQ, AWQ o GGUF Q4): del orden de 18-22 GB; cabe en una RTX 4090 de 24 GB o en 2x RTX 3090, con ventana de contexto limitada.
- GPU recomendadas: A100 80 GB, H100 80 GB para bf16; RTX 4090, RTX 3090, L40S para cuantización de 4 bits.
- Cabe en GPU de consumo: sí, en el escenario de 4 bits y tras fusionar el adaptador con el base; no en bf16.
- Opciones de despliegue: PEFT + transformers (ruta directa para el adaptador), vLLM con adaptadores LoRA, TGI, y llama.cpp u Ollama tras fusionar y convertir a GGUF.
- Latencia y throughput estimados: no disponible.
- Nota importante: todas las cifras de VRAM son estimaciones derivadas del recuento de parámetros declarado (31B) y no han sido verificadas contra el repositorio, que no publica configuraciones de ejecución.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| risk-spec-specv3local-g31-rae2procnotraceg31 (este adaptador) | adaptador LoRA r=32 sobre base de 31B declarado | no disponible | no disponible | publico en HuggingFace, 0 descargas | solo `final_teacher_kl` 0,0245 |
| `google/gemma-4-31B-it` (modelo base declarado) | 31B (segun la model card) | no disponible | no disponible | referenciado en la model card; no verificado | no disponible |
| Otros adaptadores LoRA de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa fiable con alternativas equivalentes de la misma tarea.

## Limitaciones y advertencias

- Licencia no declarada: no es posible determinar si se permite uso comercial, redistribución o modificación del adaptador ni del modelo resultante de la fusión.
- Sin benchmarks: no hay evidencia publicada de rendimiento en tareas estándar; el único dato es una divergencia KL de entrenamiento.
- Modelo base no verificado: el identificador `google/gemma-4-31B-it` no se corresponde con una nomenclatura pública conocida en el momento de redactar esta ficha; conviene confirmar su existencia y su licencia antes de cualquier uso.
- Riesgo de alucinación: no evaluado; al tratarse de un adaptador, hereda el comportamiento del base y puede además desplazarlo hacia la distribución del profesor de destilación.
- Sin datos de idioma: se desconoce la cobertura multilingüe real del adaptador y del base.
- Ausencia de información sobre sesgos: no se documenta ninguna evaluación de sesgos ni de seguridad más allá del nombre del arm.
- Trazabilidad limitada: los metadatos de procedencia (arm, constitution, commit, semilla) permiten reproducir el pipeline, pero no validan la calidad del resultado.
- Idoneidad para producción: baja. No hay descargas, valoraciones ni pruebas de terceros; el repositorio parece un artefacto de investigación interno.
- Tamaño anómalo del repositorio: 10,8 GB para un adaptador de rango 32 es coherente con la inclusión de múltiples checkpoints o de pesos adicionales, lo que conviene inspeccionar antes de descargarlo.
- Fechas de creación y actualización en 2026: verificar la coherencia temporal del repositorio antes de integrarlo en cualquier flujo de trabajo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/aravdhoot/risk-spec-specv3local-g31-rae2procnotraceg31-gemma-4-31b-it-hp500-r32-s0-20260914
- Modelo base referenciado en la model card: https://huggingface.co/google/gemma-4-31B-it (referencia no verificada)
- Libreria PEFT: https://github.com/huggingface/peft
- No se han encontrado papers, blogs, demos ni repositorios adicionales en la informacion proporcionada.
