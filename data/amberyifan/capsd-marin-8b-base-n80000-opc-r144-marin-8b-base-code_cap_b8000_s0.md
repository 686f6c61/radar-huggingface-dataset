# AmberYifan/capsd-marin-8b-base-n80000-opc-r144-marin-8b-base-code_cap_b8000_s0

## Resumen

El modelo `capsd-marin-8b-base-n80000-opc-r144-marin-8b-base-code_cap_b8000_s0` es un ajuste fino (fine-tuning) completo del modelo base `marin-community/marin-8b-base`, realizado por el usuario AmberYifan. Se ha entrenado sobre el dataset `capsd_R144__mix_code_cap_b8000_s0`, aparentemente orientado a tareas de generación de código, utilizando el framework `llama-factory` en su modalidad de entrenamiento completo (`full`). El modelo tiene 8.030 millones de parámetros y se distribuye en formato `safetensors`.

La relevancia de este modelo radica en que parte de una base de 8B parámetros (probablemente arquitectura tipo Llama) y ha sido especializado mediante fine-tuning en un dominio concreto, aunque la documentación pública es muy escasa: no se han publicado resultados de benchmarks, descripción de capacidades ni detalles sobre el dataset de entrenamiento. Esto limita su uso en producción sin una evaluación previa por parte del usuario.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (tipo Llama, según etiqueta `llama`) |
| Parametros totales | 8.030.261.248 (8,03 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos en `safetensors` de 16,1 GB) |
| Idiomas soportados | no disponible |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del base `marin-community/marin-8b-base`, que por la etiqueta `llama` se infiere que sigue una arquitectura transformer decoder-only similar a la familia Llama. No se dispone de información adicional sobre el diseño interno del modelo base (número de capas, cabezas de atención, etc.).

El entrenamiento se realizó con `llama-factory` en modo `full` (todos los parámetros actualizados) sobre el dataset `capsd_R144__mix_code_cap_b8000_s0`. Los hiperparámetros declarados son: learning rate de 1e-05, batch size por dispositivo de 2, acumulación de gradientes de 8 pasos (batch efectivo de 64), optimizador AdamW con betas (0.9, 0.999), scheduler cosine con warmup del 3% y una sola época. Se usó entrenamiento distribuido con 4 GPUs. No se especifica el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto: al ser un modelo de lenguaje de 8B, puede generar texto coherente en tareas generales, aunque su especialización aparente es el código.
- Generación de código: el nombre del dataset (`code_cap`) sugiere que fue entrenado para tareas de código, pero no hay documentación que confirme capacidades específicas como autocompletado, explicación o depuración.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües o modos especiales (thinking, visión, audio).

## Casos de uso

Dado que la documentación es mínima, los casos de uso son hipotéticos y requieren validación previa:

- Generación de código en entornos de desarrollo: podría emplearse como asistente de autocompletado o generación de fragmentos de código, siempre que se verifique su calidad en el lenguaje de programación objetivo.
- Prototipado rápido de scripts: útil para generar esqueletos de funciones o clases en tareas de programación sencillas, aunque sin garantías de corrección sintáctica o semántica.
- Experimentación académica: sirve como punto de partida para investigaciones sobre fine-tuning de modelos de 8B en dominios específicos, dado que se conoce el proceso de entrenamiento.
- Evaluación comparativa de metodologías de ajuste: al ser un fine-tuning completo con hiperparámetros documentados, puede usarse para reproducir experimentos o comparar con otros métodos (LoRA, etc.).
- Generación de documentación técnica: podría generar comentarios o descripciones de código, aunque su entrenamiento en código no garantiza calidad en lenguaje natural.
- Fine-tuning adicional: al ser un modelo abierto, puede servir como base para nuevos ajustes en tareas más concretas, siempre que la licencia lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección `model-index` con resultados vacíos (`results: []`), por lo que no hay datos objetivos de rendimiento en tareas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 16 GB (8B parámetros × 2 bytes), por lo que cabe en GPUs como RTX 4090 (24 GB) o A100 40 GB.
- Para cuantizaciones de 8 bits (INT8) se necesitarían unos 8 GB; para 4 bits, unos 4-5 GB, pero no se ofrecen versiones cuantizadas oficiales.
- GPU recomendadas: RTX 3090/4090, A100, H100, o cualquier GPU con al menos 16 GB de VRAM para FP16.
- Opciones de despliegue: al ser un modelo de Transformers, puede servirse con vLLM, TGI, o llama.cpp (si se convierte a GGUF). También es compatible con `text-generation-inference` según las etiquetas.
- Latencia y throughput: no disponibles; dependerán del hardware y del backend de inferencia.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente. A nivel de especificaciones, se puede comparar con otros modelos de 8B:

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| capsd-marin-8b (este) | 8,03 B | no disponible | other | Fine-tune de marin-8b-base |
| Llama 3 8B | 8,03 B | 8K (ampliable) | Llama 3 license | Modelo base generalista |
| Mistral 7B | 7,24 B | 32K | Apache 2.0 | Modelo base eficiente |
| Gemma 7B | 8,54 B | 8K | Gemma license | Modelo de Google |

Sin benchmarks, no es posible valorar el rendimiento relativo. La licencia `other` del modelo puede ser más restrictiva que las de sus competidores.

## Limitaciones y advertencias

- Documentación insuficiente: no hay descripción de capacidades, limitaciones, sesgos o datos de entrenamiento más allá de los hiperparámetros.
- Licencia ambigua: la licencia `other` no especifica términos de uso; podría no permitir uso comercial o requerir atribución. Es imprescindible contactar al autor o revisar el repositorio base antes de usar en producción.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar contenido falso o incorrecto, especialmente en código donde los errores sintácticos o lógicos son probables.
- Sesgos desconocidos: al no conocer la composición del dataset de entrenamiento, no se pueden anticipar sesgos de género, idioma o dominio.
- Sin garantía de calidad en código: el nombre del dataset sugiere entrenamiento en código, pero no hay evidencia de que supere a modelos base generalistas en tareas de programación.
- Fecha de creación futura (2026-09-01): el modelo está fechado en el futuro, lo que puede indicar un error en los metadatos o un modelo reciente; no afecta a su uso, pero conviene tenerlo en cuenta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AmberYifan/capsd-marin-8b-base-n80000-opc-r144-marin-8b-base-code_cap_b8000_s0
- Modelo base: https://huggingface.co/marin-community/marin-8b-base
- Variante similar (retrain): https://huggingface.co/AmberYifan/capsd-final-retrain-marin-8b-base-code_cap_b8000_s0
- Otra variante (dsir): https://huggingface.co/AmberYifan/capsd-marin-8b-base-code_dsir_b8000_s0
- Página en FriendliAI (variante ifd): https://friendli.ai/models/AmberYifan/capsd-marin-8b-base-code_ifd_b16000_s0
- Página en FriendliAI (variante science): https://friendli.ai/models/AmberYifan/capsd-marin-8b-base-science_ifd_b8000_s0
