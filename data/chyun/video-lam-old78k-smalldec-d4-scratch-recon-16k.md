# chyun/video-lam-old78k-smalldec-d4-scratch-recon-16k

## Resumen

Video LAM (small decoder, inicialización desde cero, objetivo de reconstrucción) es un checkpoint de investigación publicado por el usuario chyun en Hugging Face. Se trata del paso final 16.000 de un experimento de ablación sobre el modelo base `nvidia/Cosmos-Predict2.5-2B`, orientado a robótica y predicción de acciones a partir de vídeo. No es un modelo de lenguaje conversacional ni un modelo generativo de propósito general: es un artefacto de entrenamiento reproducible que documenta una variante arquitectónica concreta dentro de una línea de experimentos denominada `old78k-varlen-small-scratch-recon-d4-action-8gpu-gb16`.

El modelo combina dos etapas: una etapa A con el codificador completo de 28 bloques de Cosmos preentrenado, base congelada y LoRA de rango 16, y una etapa B con un decodificador independiente de cuatro bloques totalmente entrenable, sin LoRA de decodificador. La variante se distingue por inicializar ese decodificador desde cero y emplear regresión de latentes RGB de punto final, mientras que la predicción de acciones mantiene el objetivo original de flow-matching por conjunto de datos.

Su relevancia es fundamentalmente metodológica: sirve para estudiar el efecto de la inicialización del decodificador y del objetivo de vídeo en modelos de acción latente (LAM) aplicados a robótica. El repositorio incluye el checkpoint original sin modificar, argumentos de entrenamiento, estadísticas de normalización de acciones, metadatos de arquitectura, parches de implementación y sumas de verificación, lo que lo convierte en material reproducible más que en un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de dos etapas: codificador Cosmos-Predict2.5 de 28 bloques (congelado con LoRA rango 16) + decodificador de 4 bloques entrenable desde cero |
| Parámetros totales | no disponible (repo de 2,8 GB; base Cosmos-Predict2.5-2B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | Clips de vídeo de 5 a 29 fotogramas a resolución 480x640 (contexto temporal variable) |
| Tipos de cuantización | no disponible (checkpoint nativo en PyTorch, bf16 en la base) |
| Idiomas soportados | no disponible (condicionamiento de texto vía embeddings proyectados de Cosmos-Reason1-7B) |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`step_016000.pt`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura sigue un esquema de dos etapas sobre Cosmos-Predict2.5-2B. La etapa A emplea el codificador completo de 28 bloques preentrenado, con la base congelada y un adaptador LoRA de rango 16. La etapa B añade un decodificador separado de cuatro bloques completamente entrenable, sin LoRA, inicializado desde cero. El objetivo de vídeo de esta variante es la regresión de latentes RGB de punto final (reconstruction), en contraste con otras variantes de la ablación. La predicción de acciones utiliza el objetivo original de flow-matching por conjunto de datos.

El entrenamiento se realizó con lote global 16, microbatch 1 por GPU, acumulación de gradiente 2, ocho GPUs y semilla 0. La mezcla de datos es de pesos iguales entre DROID, EgoDex y MolmoAct, con clips de longitud variable de 5 a 29 fotogramas a 480x640. El autor advierte explícitamente que esta comparación de decodificador pequeño cambia simultáneamente la inicialización del decodificador y el objetivo de vídeo, por lo que no aísla ninguno de los dos factores de forma independiente.

El condicionamiento de texto de la etapa A usa embeddings proyectados de Cosmos-Reason1-7B; se requiere una caché de texto proyectada válida o el codificador de texto en línea correspondiente. La dependencia externa congelada es `nvidia/Cosmos-Predict2.5-2B` en la revisión `15a82a2ec231bc318692aa0456a36537c806e7d4`, fichero `base/pre-trained/d20b7120-df3e-4911-919d-db6e08bad31c_ema_bf16.pt`, referenciado mediante la variable `COSMOS_PRETRAIN_CKPT`.

## Capacidades

- Predicción de acciones robóticas a partir de secuencias de vídeo, mediante flow-matching por conjunto de datos.
- Codificación de vídeo con clips de longitud variable (5 a 29 fotogramas) a 480x640.
- Condicionamiento por lenguaje a través de embeddings proyectados de Cosmos-Reason1-7B.
- Reconstrucción de latentes RGB de punto final como objetivo auxiliar de entrenamiento.
- Entrenamiento reproducible: incluye parche de implementación, módulos auxiliares, argumentos guardados y sumas de verificación.
- Reanudación exacta del entrenamiento: el checkpoint contiene estado del modelo, optimizador, planificador, estado RNG y posición de datos.
- No soporta tool calling, function calling ni razonamiento multi-paso de tipo agente conversacional.
- No dispone de modo thinking, visión general, audio ni capacidades multilingües documentadas.

## Casos de uso

- Investigación en modelos de acción latente (LAM): el checkpoint permite reproducir y analizar el efecto de inicializar el decodificador desde cero frente a alternativas preentrenadas en tareas de robótica.
- Ablación controlada de objetivos de vídeo: sirve para comparar la regresión de latentes RGB de punto final con otros objetivos dentro de la misma familia de experimentos, usando los argumentos guardados en `training_args.json`.
- Reproducción de experimentos: con el parche `training_implementation.patch`, el commit `b9763c67b0d3bb2ccb06476c66b79e1b75622107` del repositorio `jiiiisoo/video_lam` y las estadísticas de normalización incluidas, se puede reconstruir el pipeline de entrenamiento de forma fiel.
- Reanudación de entrenamientos largos: al incluir optimizador, planificador, RNG y posición de datos, es adecuado para continuar el entrenamiento desde el paso 16.000 en un host equivalente.
- Estudio de eficiencia de decodificadores pequeños: la variante de cuatro bloques permite medir el coste y la calidad de un decodificador reducido frente al codificador completo de 28 bloques.
- Docencia y formación en robótica basada en aprendizaje: el paquete de artefactos (metadatos, verificación, checksums) facilita explicar un flujo completo de entrenamiento reproducible con dependencias fijadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 2,8 GB y la base Cosmos-Predict2.5-2B se distribuye en bf16, por lo que se requiere al menos una GPU con memoria suficiente para el modelo base más el decodificador y las cachés de texto.
- GPU recomendadas: el entrenamiento se realizó con ocho GPUs (modelo no especificado en la información disponible); para inferencia se recomienda una GPU de datacenter tipo A100 o H100 por la carga del codificador de 28 bloques.
- ¿Cabe en GPU de consumo? No disponible; no se documenta una variante cuantizada ni un tamaño de VRAM medido.
- Opciones de despliegue: no se soportan vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje. La carga debe hacerse con el script `cosmos-predict2.5/scripts/train_latent_action_v4.py` del repositorio `jiiiisoo/video_lam` y el parche de entrenamiento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| video-lam-old78k-smalldec-d4-scratch-recon-16k | no disponible (base 2B) | clips de 5-29 fotogramas, 480x640 | Acción latente + reconstrucción RGB | no disponible | Hugging Face, checkpoint de investigación |
| nvidia/Cosmos-Predict2.5-2B | 2B | no disponible | Generación/predicción de vídeo | no disponible | Hugging Face (modelo base) |
| Otras variantes de la ablación `old78k` | no disponible | clips de 5-29 fotogramas | Variantes de decodificador y objetivo | no disponible | Repositorio del autor (no detalladas) |

No se dispone de información suficiente para comparar con alternativas de la misma categoría fuera de la familia Cosmos y de las variantes de la propia ablación.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo listo para producción; el autor no documenta evaluación de inferencia en GPU del paquete descargado.
- La comparación de decodificador pequeño modifica simultáneamente la inicialización y el objetivo de vídeo, por lo que no permite atribuir efectos a un solo factor.
- La licencia no está disponible, lo que impide determinar si se permite uso comercial.
- No se incluyen la caché de texto de entrenamiento, los conjuntos de datos, el entorno de máquina ni ficheros de credenciales; es necesario reconstruirlos.
- Requiere rutas y variables de entorno específicas (`COSMOS_PRETRAIN_CKPT`, raíces de datos, caché de texto, `per_dataset_action_stats`), lo que añade fragilidad en el despliegue.
- Un cargador que ignore silenciosamente el grupo `scratch_decoder` producirá resultados incorrectos; hay que restaurar explícitamente queries, adapters, `video_decoder` y los grupos LoRA aplicables.
- La verificación incluida comprueba integridad de serialización y finitud de tensores, pero no valida el comportamiento funcional del modelo.
- No hay información sobre sesgos, alucinación o cobertura idiomática, al no ser un modelo de lenguaje generativo.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, lo que sugiere ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chyun/video-lam-old78k-smalldec-d4-scratch-recon-16k
- Modelo base: https://huggingface.co/nvidia/Cosmos-Predict2.5-2B
- Repositorio de código: https://github.com/jiiiisoo/video_lam
- Commit de código requerido: `b9763c67b0d3bb2ccb06476c66b79e1b75622107`
- Conjunto de datos: https://huggingface.co/datasets/Jiiiiiisoo/video_lam_prepared_v1
- Conjunto de datos: https://huggingface.co/datasets/Jiiiiiisoo/video_lam_dataset
