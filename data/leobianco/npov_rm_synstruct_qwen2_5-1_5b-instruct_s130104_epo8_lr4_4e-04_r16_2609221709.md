# leobianco/npov_RM_synstruct_Qwen2_5-1_5B-Instruct_S130104_epo8_lr4_4e-04_r16_2609221709

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) entrenado sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct por el usuario leobianco. El nombre del repositorio codifica la mayor parte de la información disponible: "RM" (previsiblemente *reward model*), "synstruct" (probablemente datos sintéticos estructurados), "epo8" (8 épocas), "lr4_4e-04" (tasa de aprendizaje) y "r16" (rango LoRA 16). La model card es autogenerada por el Trainer de HuggingFace y no incluye descripción, usos previstos ni composición del dataset, que aparecen como "More information needed".

El problema que resuelve es, según se deduce de sus métricas de evaluación (ROC AUC, umbral óptimo, TPR/FPR, puntuaciones medias para positivos y negativos), la puntuación o clasificación binaria de respuestas, un patrón típico de los modelos de recompensa empleados en pipelines de RLHF/DPO o en sistemas de filtrado y *reranking*. Sobre el conjunto de evaluación declara una pérdida final de 1,7937, un ROC AUC de 0,9352 y una exactitud de 0,8980 con umbral 1,0000.

Su relevancia es limitada y muy acotada: es un adaptador de investigación con 0 descargas y 0 *likes* en el momento de la consulta, con documentación mínima y sin *benchmarks* estándar publicados. El interés principal reside en que demuestra el flujo de trabajo de ajuste de un clasificador/puntuador de 1,5B parámetros con LoRA y AdamW fusionado en 2 GPU, y en que su licencia Apache 2.0 (heredada del modelo base) permite reutilización sin restricciones teóricas, siempre que se asuma la ausencia de documentación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Qwen2.5); el modelo base usa RoPE, RMSNorm, SwiGLU y GQA con 28 capas, 12 cabezas de atención y 2 cabezas KV, oculto 1536 |
| Parametros totales | Adaptador LoRA (rango 16) sobre un modelo base de ~1,54 B parámetros; el tamaño del adaptador no se detalla en el repositorio |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base Qwen2.5-1.5B-Instruct, ampliable a 128K con YaRN según su documentación; no confirmado para este adaptador |
| Tipos de cuantizacion | No especificados por el autor. El adaptador se distribuye en safetensors; puede fusionarse con el modelo base y convertirse a GGUF/AWQ/GPTQ |
| Idiomas soportados | No disponible en la model card. El modelo base Qwen2.5-1.5B-Instruct declara soporte para 29 idiomas, entre ellos castellano e inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT); sin GGUF ni otros formatos publicados |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (librería `peft`, rango codificado como 16 en el nombre) que se aplica sobre Qwen/Qwen2.5-1.5B-Instruct. No se modifica la arquitectura del transformer subyacente más allá de la inyección de las matrices de bajo rango y, presumiblemente, de una cabeza de salida escalar o de clasificación coherente con las métricas reportadas (ROC AUC, umbral, TPR/FPR). El valor de `lora_alpha`, los módulos objetivo y si la cabeza es de recompensa explícita no se documentan y quedan como "no disponible".

El entrenamiento se realizó durante 8 épocas con AdamW fused (betas 0,9/0,999, epsilon 1e-08), programador coseno con *warmup* del 10 %, `train_batch_size` 16 por dispositivo y 32 global en configuración multi-GPU de 2 dispositivos, `eval_batch_size` 64 global, semilla 130104 y tasa de aprendizaje 4,367804986794785e-04. El dataset es desconocido ("on an unknown dataset"): no se indica número de tokens, composición, proporción de datos sintéticos ni si hubo etapas de RLHF/DPO. La evolución de la pérdida de entrenamiento (1,1797 en la época 1,25 hasta 0,0002 en la época 8) frente a una pérdida de validación que repunta hasta 1,7937 indica un sobreajuste marcado al final del entrenamiento.

## Capacidades

- Puntuación o clasificación de respuestas: las métricas publicadas (ROC AUC 0,9352, TPR 0,9060, FPR 0,1333 con umbral 1,0000) corresponden a una tarea de discriminación binaria o de *scoring* de una única salida numérica, no a generación de texto libre.
- Generación de texto: heredada del modelo base Qwen2.5-1.5B-Instruct, pero no verificada para este adaptador y potencialmente degradada si el ajuste alteró las capas de atención o la cabeza `lm_head`.
- Razonamiento, código y matemáticas: capacidades del modelo base (Qwen2.5-1.5B-Instruct), sin evaluación específica en este repositorio.
- Tool calling / function calling: soportado por el modelo base Qwen2.5 en su formato de plantilla de chat; no confirmado tras el ajuste LoRA.
- Agentes y razonamiento multi-paso: no documentado para este adaptador.
- Capacidades multilingües: no documentadas; las del modelo base cubren 29 idiomas.
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles.
- Salida estructurada: el patrón de métricas ("Best Threshold", "Avg Score True Positives") sugiere una salida de tipo *reward* o probabilidad, pero la interfaz exacta no está documentada.

## Casos de uso

- Puntuación de respuestas en pipelines de RLHF/DPO: usar el adaptador como modelo de recompensa para ordenar pares de respuestas generadas por una política y construir preferencias sintéticas. El ROC AUC de 0,9352 sobre el conjunto de evaluación lo hace apto para prototipado, aunque la ausencia de documentación del dataset impide conocer el dominio real de aplicación.
- Filtrado y *reranking* de salidas: dada su naturaleza de clasificador, puede puntuar candidatos de un generador y descartar los de baja puntuación antes de mostrarlos al usuario, reduciendo respuestas de baja calidad en un *chatbot*.
- Evaluación automática de asistentes conversacionales: sustituir o complementar métricas heurísticas en pruebas de regresión de un producto, comparando la puntuación media de un conjunto de respuestas antes y después de un cambio de *prompt* o de modelo.
- Investigación académica sobre modelos de recompensa pequeños: reproducir el experimento con 1,5B parámetros en 2 GPU y estudiar la relación entre pérdida de validación y ROC AUC (aquí la pérdida empeora de 1,2354 a 1,7937 mientras el ROC AUC mejora de 0,3849 a 0,9352).
- Detección de contenido no deseado: con umbral calibrado (el autor reporta 1,0000 como mejor umbral), usar la puntuación como señal auxiliar en moderación, asumiendo el FPR del 13,33 % medido.
- Construcción de *datasets* sintéticos etiquetados: emplear el modelo como etiquetador automático para generar pares preferidos/rechazados a partir de un corpus ("synstruct" en el nombre apunta a este tipo de flujo).
- Ajuste adicional sobre dominios concretos: al ser un adaptador LoRA fusionable y con licencia Apache 2.0, sirve como punto de partida para *fine-tuning* adicional en dominios verticales, siempre que se valide primero su comportamiento real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible: el `model-index` de la model card contiene una lista de resultados vacía. Los únicos datos numéricos son las métricas de evaluación declaradas por el autor sobre un conjunto de evaluación no descrito.

| Métrica (conjunto de evaluación del autor) | Época 2,5 | Época 5,0 | Época 8,0 (final) |
|---|---|---|---|
| Pérdida de validación | 0,7993 | 1,6006 | 1,7937 |
| ROC AUC | 0,9350 | 0,9439 | 0,9352 |
| Mejor umbral | 0,9866 | 0,9999 | 1,0000 |
| TPR en el mejor umbral | 0,8547 | 0,9145 | 0,9060 |
| FPR en el mejor umbral | 0,0667 | 0,1000 | 0,1333 |
| Exactitud en el mejor umbral | 0,8707 | 0,9116 | 0,8980 |
| Puntuación media en positivos | 0,9703 | 0,9895 | 0,9825 |
| Puntuación media en negativos | 0,5071 | 0,4711 | 0,4654 |

No se dispone de comparaciones con otros modelos en la información proporcionada, más allá del punto de partida del *fine-tuning* (época 0: ROC AUC 0,3849, exactitud 0,8027).

## Requisitos de hardware

- VRAM en FP16/BF16: aproximadamente 3,1 GB para los pesos del modelo base más el adaptador (decenas de MB), más la caché KV. Con la ventana completa de 32.768 tokens y GQA de 2 cabezas KV, la caché ronda los 0,94 GB, lo que sitúa el total en torno a 4 GB para lote 1.
- VRAM en cuantización INT8: aproximadamente 1,6 GB de pesos; en INT4, en torno a 0,9-1,0 GB, más caché.
- GPU recomendadas: cualquier GPU de 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4070) es suficiente para FP16 en contextos cortos. H100, A100 y RTX 4090 quedan sobredimensionadas para inferencia, aunque se usaron 2 GPU para el entrenamiento (adaptador LoRA, AdamW fusionado).
- Cabe en GPU de consumo: sí, holgadamente. En una RTX 3060 de 12 GB cabría incluso con lotes grandes y contexto completo; con cuantización INT4 funcionaría en GPU de 4-6 GB y, en modo CPU, en equipos con 8 GB de RAM.
- Opciones de despliegue: `transformers` + `peft` es la vía natural para un adaptador LoRA. vLLM y TGI admiten adaptadores LoRA para modelos generativos, pero si el adaptador actúa como modelo de recompensa con cabeza escalar, el despliegue requeriría un servidor personalizado. Para uso en CPU, es necesario fusionar el adaptador, convertir a GGUF y servir con llama.cpp u Ollama. No se documenta compatibilidad con TensorRT-LLM ni SGLang.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (npov_RM, LoRA r16 sobre Qwen2.5-1.5B-Instruct) | ~1,54 B (base) + LoRA | 32.768 tokens (base) | Apache 2.0 | ROC AUC 0,9352 y exactitud 0,8980 en un conjunto de evaluación no descrito | Repositorio público con 0 descargas y 0 likes |
| Qwen/Qwen2.5-1.5B-Instruct (modelo base de partida) | ~1,54 B | 32.768 tokens, ampliable a 128K con YaRN | Apache 2.0 | No comparable: el autor reporta ROC AUC 0,3849 antes del ajuste, lo que indica que el modelo base no produce la señal objetivo | Ampliamente disponible y documentado |
| Modelos de recompensa de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |

No se dispone de datos verificables de otros modelos de recompensa en la información suministrada, por lo que la comparación cuantitativa con alternativas de la misma categoría queda como no disponible. Los resultados de la búsqueda web proporcionada tratan sobre el parque nacional del Monte Rainier y no guardan relación con este modelo.

## Limitaciones y advertencias

- Documentación prácticamente inexistente: la model card está autogenerada y las secciones de descripción, usos previstos y datos de entrenamiento contienen "More information needed". El conjunto de evaluación y el dataset de entrenamiento son desconocidos, por lo que no puede determinarse el dominio en el que las métricas son válidas.
- Sobreajuste evidente: la pérdida de entrenamiento cae a 0,0002 mientras la de validación sube hasta 1,7937, y el ROC AUC final (0,9352) es idéntico al de la época 2,5 con una pérdida cuatro veces menor. El modelo final no parece ser el mejor punto de control.
- Falsos positivos no despreciables: el FPR en el mejor umbral es del 13,33 %, con una puntuación media en negativos de 0,4654 frente a 0,9825 en positivos, lo que deja un margen de separación limitado y sensible al umbral elegido. El mejor umbral reportado (1,0000) sugiere una función de puntuación con saturación.
- Riesgo de sesgo: al desconocerse la composición del dataset ("synstruct" apunta a datos sintéticos), no puede auditarse el sesgo de género, etnia, idioma o ideología. Un modelo de recompensa entrenado con datos sintéticos puede amplificar los sesgos del generador que los produjo.
- Riesgo de alucinación en modo generativo: si se usa el modelo base fusionado para generar texto, mantiene los riesgos habituales de un modelo de 1,5B, acentuados por un ajuste no documentado. El nombre "npov" (posiblemente *no point of view*) podría indicar un intento de neutralidad, pero no hay evidencia que lo respalde.
- Limitaciones de contexto e idioma: no se documenta si el ajuste degrada el soporte multilingüe del modelo base (29 idiomas). Cualquier uso fuera del inglés debería validarse empíricamente.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificación sin restricciones, pero se hereda del modelo base Qwen2.5, cuyas condiciones conviene verificar. La licencia no exime de responsabilidad sobre el comportamiento del modelo.
- Idoneidad para producción: con 0 descargas, 0 *likes*, ausencia de evaluación externa y sin benchmarks estándar, no es recomendable desplegarlo en producción sin una validación propia exhaustiva y una comparación con el modelo base sin ajustar.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/leobianco/npov_RM_synstruct_Qwen2_5-1_5B-Instruct_S130104_epo8_lr4_4e-04_r16_2609221709
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Informe técnico de Qwen2.5 (paper): https://arxiv.org/abs/2412.15115
- Blog oficial de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Librería PEFT: https://github.com/huggingface/peft
- Documentación de Transformers: https://huggingface.co/docs/transformers/index
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante para este modelo; los resultados devueltos corresponden al parque nacional del Monte Rainier y no guardan relación con el artefacto.
