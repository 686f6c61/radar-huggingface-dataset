# dfdafs/citeguard-support-lora-qwen3-4b

## Resumen

CiteGuard-CN support judge LoRA es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario dfdafs sobre el modelo base Qwen/Qwen3-4B, desarrollado por Alibaba Qwen. El adaptador está diseñado para actuar como un "juez" de soporte técnico: clasifica o evalúa respuestas en el contexto de atención al cliente, según se desprende del nombre del proyecto (CiteGuard) y de la ruta de datos de entrenamiento (`support_train.jsonl`). No es un modelo autónomo, sino un conjunto de pesos de adaptación de 33 millones de parámetros entrenables que se cargan sobre el modelo base de 4.000 millones de parámetros.

El adaptador emplea una configuración LoRA de rango 16, alpha 32 y dropout 0,05, entrenada en precisión bf16 durante 3 épocas y 225 pasos de optimización, con un coste computacional muy bajo: 956 segundos en una única RTX 4090 con un pico de VRAM de 10,88 GB. El conjunto de datos de entrenamiento es reducido (600 ejemplos de SFT), con particiones de desarrollo de 20 ejemplos y de test de 60 ejemplos. El autor reporta un macro-F1 y una exactitud de 1,0000 en el conjunto de test de 60 ejemplos siguiendo la ruta de prompt de producto, un resultado que debe interpretarse con cautela dado el tamaño de la muestra.

Su relevancia radica en que demuestra un flujo de trabajo completo de ajuste fino eficiente (PEFT) sobre un modelo Qwen3 de 4B para una tarea concreta de evaluación de soporte, con licencia Apache-2.0 y un repositorio de solo 0,1 GB. Es un artefacto de nicho, con cero descargas y cero likes en el momento de la consulta, y con documentación íntegramente en chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder Qwen3-4B |
| Parametros totales | 4.055.498.240 (modelo base) + 33.030.144 entrenables en el adaptador |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-4B; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en bf16; cuantizaciones del base no documentadas) |
| Idiomas soportados | chino (zh) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`, 132.187.888 bytes) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3-4B, un transformer decoder del que la model card no detalla más especificaciones internas. La adaptación LoRA utiliza rango r=16, alpha=32 y dropout=0,05 en precisión bf16, lo que supone 33.030.144 parámetros entrenables sobre los 4.055.498.240 del modelo base, es decir, un 0,8145% del total. El entrenamiento se ejecutó durante 3,0 épocas y 225 pasos de optimización, con un tiempo total de 956,2 segundos en una única GPU RTX 4090 y un pico de VRAM de 10,88 GB.

Los datos de entrenamiento provienen de `data/sft/support_train.jsonl` con 600 ejemplos, complementados con particiones de desarrollo (20 ejemplos) y test (60 ejemplos). No se documenta en la información disponible la composición del dataset, la existencia de RLHF/DPO ni innovaciones técnicas como decodificación especulativa o atención lineal. El autor menciona una evaluación con `--eval-base`, lo que sugiere comparación contra el modelo base sin adaptador, pero no se aportan esos resultados. La reproducibilidad está cubierta mediante el script `scripts/train_support_lora.py` con parámetros explícitos.

## Capacidades

- Evaluación y clasificación de respuestas de soporte técnico en chino (función de "juez" o judge).
- Generación de texto heredada del modelo base Qwen3-4B, condicionada por el adaptador.
- Razonamiento y comprensión de contexto de conversaciones de atención al cliente, según el dominio de entrenamiento.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: limitadas al chino según la etiqueta de idioma; el modelo base Qwen3-4B soporta más idiomas, pero el adaptador se declara solo para zh.
- Capacidad especial: no se documenta modo thinking, visión ni audio.

## Casos de uso

- Evaluación automática de respuestas de soporte: el adaptador actúa como juez para puntuar o clasificar respuestas generadas por otros sistemas en un pipeline de control de calidad, usando el prompt de producto documentado por el autor.
- Control de calidad en centros de atención al cliente: integrado en un servidor de inferencia (`adapter_judge_server.py` en el puerto 8101), permite filtrar respuestas antes de enviarlas al usuario final.
- Construcción de datasets de preferencias: al evaluar respuestas, puede generar etiquetas para entrenamiento posterior de modelos de recompensa o DPO en el dominio de soporte.
- Despliegue ligero en una sola GPU: con un pico de entrenamiento de 10,88 GB en RTX 4090, es viable ejecutarlo en hardware consumer para prototipos y pruebas internas.
- Investigación en PEFT: sirve como ejemplo reproducible de ajuste fino con LoRA de rango 16 sobre Qwen3-4B, con scripts de entrenamiento y servicio incluidos.
- Filtrado de respuestas en pipelines RAG de soporte: puede validar si una respuesta generada cita correctamente la información de la base de conocimiento (de ahí el nombre CiteGuard), aunque la model card no detalla explícitamente esta función.

## Benchmarks y rendimiento

| Benchmark | Resultado | Conjunto |
|---|---|---|
| Macro-F1 | 1,0000 | test 60 (ruta de prompt de producto) |
| Exactitud (accuracy) | 1,0000 | test 60 (ruta de prompt de producto) |
| Comparación con modelo base | no disponible | — |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos son la evaluación interna sobre 60 ejemplos, un tamaño de muestra insuficiente para extraer conclusiones robustas sobre generalización.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento requirió un pico de 10,88 GB en RTX 4090, por lo que la inferencia en bf16 del modelo base de 4B más el adaptador debería situarse en un rango similar o inferior.
- GPU recomendadas: RTX 4090 (validada por el autor para entrenamiento); GPUs con al menos ~12 GB de VRAM para bf16.
- Cabe en GPU consumer: sí, al menos en RTX 4090; no se documentan pruebas en GPUs de gama media como RTX 3060 o 4060.
- Opciones de despliegue: servidor propio del autor (`scripts/adapter_judge_server.py`) con el modelo base y el adaptador; integración vía PEFT. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CiteGuard-CN support LoRA (Qwen3-4B) | 4B base + 33M adaptador | no disponible | macro-F1 1,0000 en test de 60 | Apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-4B (base) | 4B | no disponible | no disponible | Apache-2.0 | Hugging Face |
| Adaptadores LoRA de soporte comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (adaptadores LoRA de evaluación de soporte en chino) en la información proporcionada.

## Limitaciones y advertencias

- El resultado de macro-F1 y exactitud de 1,0000 se obtiene sobre solo 60 ejemplos de test, lo que impide descartar sobreajuste o fuga de datos; no debe tomarse como indicador de rendimiento en producción.
- El conjunto de entrenamiento es muy reducido (600 ejemplos), lo que limita la generalización a dominios de soporte distintos del dataset original.
- El adaptador está etiquetado únicamente para chino; su uso en castellano u otros idiomas no está validado.
- No se documentan sesgos conocidos, pero al derivar de Qwen3-4B hereda los sesgos del modelo base, no evaluados en la model card.
- Riesgo de alucinación inherente al modelo base; el adaptador no incorpora mecanismos de verificación factual documentados pese al nombre "CiteGuard".
- La licencia Apache-2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3-4B y el cumplimiento de sus términos.
- La carga local requiere atención: el archivo de configuración se llama `adapter_adapter_config.json` en el repositorio de Hugging Face y debe copiarse como `adapter_config.json`; el autor recomienda usar el directorio de salida del entrenamiento (`out/support_lora_qwen3_4b/adapter`).
- El directorio `dist/` no se incluye en el repositorio; los pesos deben copiarse manualmente.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/dfdafs/citeguard-support-lora-qwen3-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Evidencia de experimentos (referenciada en la model card): `data/experiments/support_lora_qwen3_4b.json`
- Model card local (referenciada): `docs/model_card_support_lora_4b.md`
- Script de entrenamiento (referenciado): `scripts/train_support_lora.py`
- Script de servicio (referenciado): `scripts/adapter_judge_server.py`
- Script de subida a Hugging Face (referenciado): `scripts/upload_hf.py`
