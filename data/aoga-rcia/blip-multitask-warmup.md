# Aoga-rcia/blip-multitask-warmup

## Resumen

`Aoga-rcia/blip-multitask-warmup` es un repositorio experimental que contiene una implementación propia de una arquitectura tipo BLIP (Bootstrapping Language-Image Pre-training) orientada a tareas multitarea. Lo publica el usuario Aoga-rcia en Hugging Face y se distribuye bajo licencia BSD-3-Clause. No es un modelo entrenado ni un checkpoint con benchmarks publicados: la model card lo describe explícitamente como un punto de partida para inspeccionar cambios de arquitectura antes de lanzar un entrenamiento completo.

El modelo se presenta en una escala "nano", con atención multi-query, fusión de bajo rango, activación Mish y normalización GroupNorm. El artefacto principal es el script `main.py`, que contiene la definición del modelo y un punto de entrada de ejemplo; los pesos en `model.safetensors` son una inicialización válida para pruebas de humo (smoke tests), no un modelo ajustado.

Su relevancia es limitada y muy específica: sirve como base reproducible para experimentar con variantes de BLIP multitarea y para validar pipelines de entrenamiento (receta por defecto con Adafactor y warmup constante). No debe evaluarse como un modelo listo para producción ni compararse en rendimiento con BLIP o BLIP-2 oficiales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BLIP (implementación propia), escala nano, atención multi-query, fusión de bajo rango, activación Mish, normalización GroupNorm |
| Parametros totales | 24.832 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en FP32/BF16 según configuración; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (PyTorch); incluye `config.json`, `training_args.json` y `main.py` |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema BLIP con modificaciones propias: atención multi-query en lugar de multi-head estándar, fusión de bajo rango entre modalidades y normalización GroupNorm en lugar de LayerNorm. La escala es "nano", con un total de 24.832 parámetros según el archivo safetensors, lo que la sitúa muy por debajo de cualquier variante BLIP publicada (BLIP base ronda los 224M de parámetros). La activación es Mish.

No hay evidencia de entrenamiento real. La model card indica que `model.safetensors` es un checkpoint de inicialización para pruebas de humo y que la receta incluida (Adafactor con warmup constante) son valores de partida del script, no el resultado de una ejecución completada. No se documentan número de tokens, composición del dataset, ni fases de RLHF/DPO. El autor recomienda entrenar todos los baselines con la misma exposición de datos, presupuesto de ajuste y semillas aleatorias para obtener una evaluación significativa.

## Capacidades

- No se declaran capacidades funcionales verificadas: el checkpoint no ha sido entrenado.
- La arquitectura BLIP está diseñada para tareas visión-lenguaje (image-text matching, image captioning, VQA), pero este repositorio no incluye evidencia de que dichas capacidades funcionen.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: la arquitectura es multimodal por diseño (BLIP), pero sin entrenamiento no hay capacidad operativa demostrada.

## Casos de uso

- Pruebas de humo de pipelines de entrenamiento: el checkpoint de inicialización permite validar que el script `main.py`, la carga de `config.json` y el flujo de datos funcionan antes de lanzar un entrenamiento completo.
- Investigación sobre variantes de atención multi-query en modelos visión-lenguaje: sirve como banco de pruebas para medir el impacto de sustituir multi-head por multi-query en tareas de captioning.
- Experimentación con fusión de bajo rango: útil para estudiar el coste/beneficio de reducir el rango en la capa de fusión multimodal frente a concatenación o cross-attention completa.
- Comparación de normalizaciones (GroupNorm vs LayerNorm) en arquitecturas BLIP: el repositorio permite aislar esta variable con un baseline de capacidad equivalente.
- Reproducibilidad de recetas de entrenamiento: la inclusión de `training_args.json` con Adafactor y warmup constante facilita replicar experimentos con semillas controladas.
- Docencia y formación: el código es lo bastante pequeño (24.832 parámetros) para inspeccionar paso a paso la arquitectura BLIP en un curso o taller.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara explícitamente que no se reclama ninguna puntuación de benchmark y que el checkpoint no ha sido entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con 24.832 parámetros en FP32 (aproximadamente 100 KB de pesos); cualquier GPU consumer de los últimos diez años es suficiente.
- GPU recomendadas: no se requiere GPU dedicada; una CPU moderna basta para ejecutar el forward pass. Para entrenamiento, una RTX 3060 o superior es más que suficiente.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 2050, integradas con suficiente memoria compartida).
- Opciones de despliegue: el autor indica que, al ser una implementación personalizada, las APIs genéricas de carga automática requieren un adaptador explícito. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Aoga-rcia/blip-multitask-warmup` | 24.832 | no disponible | No (solo inicialización) | BSD-3-Clause | Hugging Face |
| BLIP (Salesforce) | ~224M (base) | 512 tokens de texto típicamente | Sí, preentrenado | BSD-3-Clause | Hugging Face |
| BLIP-2 (Salesforce) | ~188M (Q-Former) + LLM | depende del LLM | Sí | BSD-3-Clause | Hugging Face |
| InstructBLIP | ~188M (Q-Former) + LLM | depende del LLM | Sí, ajustado a instrucciones | BSD-3-Clause | Hugging Face |

La diferencia fundamental es que las alternativas son modelos entrenados y evaluados, mientras que este repositorio es un esqueleto de código con pesos de inicialización. La comparación en rendimiento no es posible porque no hay benchmarks publicados para este modelo.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: cualquier salida que produzca es aleatoria y sin valor semántico.
- No ha sido auditado para robustez, equidad ni transferencia de dominio, según reconoce el propio autor.
- No se documentan sesgos conocidos porque no hay datos de entrenamiento ni evaluación.
- Riesgo de alucinación: no aplica en el sentido habitual, ya que el modelo no genera texto coherente sin entrenamiento; el riesgo real es interpretar sus salidas como si fueran válidas.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: BSD-3-Clause permite uso comercial y modificación, pero el autor advierte de revisar los términos de los datos de origen si se usa con datasets externos.
- Caveat para producción: no debe desplegarse en ningún entorno productivo. Cualquier resultado derivado de un futuro checkpoint entrenado debe documentarse por separado de los valores por defecto que se distribuyen aquí.
- El repositorio ocupa 0.0 GB y tiene 0 descargas y 0 likes, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Aoga-rcia/blip-multitask-warmup
- BLIP original (Salesforce): https://huggingface.co/Salesforce/blip-image-captioning-base
- BLIP-2 (Salesforce): https://huggingface.co/Salesforce/blip2-opt-2.7b
- InstructBLIP (Salesforce): https://huggingface.co/Salesforce/instructblip-vicuna-7b
- Paper BLIP: https://arxiv.org/abs/2201.12086
- Paper BLIP-2: https://arxiv.org/abs/2301.12597
