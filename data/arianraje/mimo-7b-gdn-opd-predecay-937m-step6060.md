# arianraje/mimo-7b-gdn-opd-predecay-937m-step6060

## Resumen

El modelo `arianraje/mimo-7b-gdn-opd-predecay-937m-step6060` es un checkpoint intermedio de un entrenamiento experimental sobre el modelo MiMo-7B de Xiaomi, en su variante `MiMo-7B-RL-0530`. El autor, arianraje, está explorando una arquitectura híbrida que sustituye parte de la atención estándar por una atención lineal con mecanismo de gated-deltanet, dentro de un proceso de entrenamiento continuado con la técnica WSD (Warmup-Stable-Decay). Este snapshot corresponde al punto previo a la fase de decaimiento de la tasa de aprendizaje, tras consumir aproximadamente 937 millones de tokens con una ventana de contexto de 32K.

El interés de este modelo reside en su naturaleza de punto de control (checkpoint) para investigación: permite estudiar el comportamiento de arquitecturas híbridas de atención lineal en modelos de 7B de parámetros, así como reanudar el entrenamiento o evaluar el estado intermedio. No se trata de un modelo final optimizado para uso en producción, sino de una pieza dentro de un pipeline de experimentación. Su licencia MIT facilita su uso académico y técnico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal gated-deltanet y capas de atención estándar (custom `mimo_gdn`) |
| Parametros totales | 8.309.898.304 (≈8,31B) |
| Parametros activos | No MoE |
| Longitud de contexto | 32.768 tokens (H=32K, según model card) |
| Tipos de cuantizacion | No disponible (el checkpoint se publica en BF16) |
| Idiomas soportados | No disponible (no especificado) |
| Licencia | MIT |
| Formato de pesos | safetensors (shards BF16) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura MiMo-7B de Xiaomi, que emplea un transformer denso con 7B de parámetros y preentrenamiento sobre 25 billones de tokens con un objetivo adicional de predicción multi-token. Sobre esta base, arianje ha modificado la arquitectura para incorporar una capa de atención lineal con mecanismo *gated deltanet*, que reduce el coste computacional del softmax y permite procesar secuencias largas de forma más eficiente. Esta modificación se ha aplicado probablemente a un subconjunto de las capas, manteniendo otras con atención estándar, dando lugar a un modelo híbrido.

El entrenamiento se ha realizado mediante la técnica WSD (Warmup-Stable-Decay), que combina una fase de calentamiento y estabilización con una fase final de decaimiento de la tasa de aprendizaje. El checkpoint corresponde al punto de ramificación previo al decaimiento, con 936.855.902 tokens consumidos. El proceso se ha ejecutado en tres GPU H200 de NVIDIA, según los metadatos del experimento. No se han publicado detalles sobre el dataset concreto ni sobre técnicas de alineamiento (RLHF/DPO) aplicadas a este checkpoint.

## Capacidades

- Generación de texto autodidacta y razonamiento básico, heredado del modelo base MiMo-7B.
- Soporte de contexto largo (32K tokens), gracias a la ventana de contexto ampliada y la atención lineal que reduce la complejidad cuadrática.
- Capacidades multilingües no confirmadas (el modelo base MiMo-7B fue entrenado con datos multilingües, pero este checkpoint no ha sido evaluado).
- No se ha verificado el soporte de *tool calling*, *function calling* ni razonamiento multi-paso en este checkpoint concreto.
- La arquitectura híbrida podría ofrecer ventajas de eficiencia en inferencia para secuencias largas, pero no se han publicado mediciones.

## Casos de uso

- **Investigación en arquitecturas híbridas**: este checkpoint sirve para estudiar cómo se comporta una atención gated-deltanet en un modelo de 7B durante el entrenamiento, comparando con la versión estándar de MiMo-7B.
- **Reproducción de experimentos**: los shards de estado (incluidos los optimizadores FP32) permiten reanudar el entrenamiento desde el punto exacto, útil para reproducir o extender el proceso WSD.
- **Análisis de la evolución de la pérdida y el rendimiento**: al ser un punto intermedio, se puede evaluar la calidad del modelo en función de los tokens consumidos, para estudiar la dinámica de convergencia.
- **Transferencia de aprendizaje**: se podría usar como inicialización para un nuevo entrenamiento con una tasa de aprendizaje más baja, aprovechando el conocimiento adquirido.
- **Investigación sobre decaimiento de la tasa**: el punto "pre-decay" es el límite antes de la fase de decaimiento, ideal para analizar el efecto de dicha fase en la calidad final.
- **Desarrollo de técnicas de destilación**: se podría usar el modelo como profesor o alumno en experimentos de destilación, aunque no es su uso principal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras pruebas estándar para este checkpoint. Cualquier afirmación sobre su rendimiento es especulativa.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con pesos BF16 (8,3B parámetros) se necesitan aproximadamente 16,6 GB para los pesos, más overhead de activaciones. En la práctica, una GPU con 24 GB (p.ej., RTX 4090, A5000) puede ejecutar el modelo con una ventana de contexto moderada.
- **GPU recomendadas**: para entrenamiento (como se hizo) se utilizaron 3× H200 (94 GB cada una). Para inferencia, una RTX 4090 o A100 de 40 GB sería suficiente para contexto de 32K.
- **Compatibilidad con GPU de consumo**: sí, en cuantización FP16/BF16 cabe en una RTX 4090 (24 GB) para secuencias cortas; para contexto completo de 32K se recomienda al menos 32 GB.
- **Opciones de despliegue**: dado que la arquitectura es personalizada (`mimo_gdn`), es necesario registrar la implementación en el entorno de carga (p.ej., con un script de registro). Se puede usar vLLM, llama.cpp o TGI, pero se requiere adaptación del código. No hay soporte nativo de Ollama.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

El modelo no es directamente comparable con modelos finales comerciales, porque es un checkpoint intermedio de un experimento. Sin embargo, se puede comparar su base y su variante con alternativas de la misma familia:

| Modelo | Parámetros | Contexto | Licencia | Tipo |
|---|---|---|---|---|
| `mimo-7b-gdn-opd-predecay-937m-step6060` | 8,3B | 32K | MIT | Híbrido atención lineal (checkpoint) |
| `XiaomiMiMo/MiMo-7B-RL-0530` | 7B | 32K | Apache 2.0 (según paper) | Transformer estándar, RL |
| `XiaomiMiMo/MiMo-7B-Base` | 7B | 32K | Apache 2.0 | Transformer estándar |
| `Meta-Llama-3-8B` | 8B | 8K | Llama 3 license | Transformer estándar |

La comparativa directa no es válida porque el modelo es un checkpoint sin evaluación. El modelo base MiMo-7B-RL fue optimizado con RL, mientras que este checkpoint no ha pasado por esa etapa.

## Limitaciones y advertencias

- **Checkpoint intermedio**: no es un modelo finalizado; su rendimiento puede ser inferior al del modelo base o al de una versión con entrenamiento completo.
- **Arquitectura personalizada**: requiere código específico para registrar la arquitectura `mimo_gdn`; sin ello, no se puede cargar con las herramientas estándar.
- **Sin evaluaciones**: no hay datos de calidad, sesgos o alucinaciones para este checkpoint.
- **Idiomas**: no se ha documentado qué idiomas soporta; el modelo base era multilingüe, pero este checkpoint no ha sido probado.
- **Licencia MIT**: permite uso comercial, pero el modelo base tiene su propia licencia (Apache 2.0 según el paper de Xiaomi), que debe respetarse en la distribución.
- **Contexto y memoria**: la ventana de 32K tokens puede requerir más memoria de lo habitual en GPUs de consumo, especialmente con atención estándar residual en algunas capas.
- **No apto para producción**: sin evaluación y con arquitectura experimental, no se recomienda su uso en aplicaciones críticas.

## Enlaces

- HuggingFace: https://huggingface.co/arianraje/mimo-7b-gdn-opd-predecay-937m-step6060
- Modelo base MiMo-7B-RL: https://huggingface.co/XiaomiMiMo/MiMo-7B-RL-0530
- Paper MiMo: https://arxiv.org/abs/2505.07608
- Checkpoint previo (737m): https://huggingface.co/arianraje/mimo-7b-gdn-opd-predecay-737m-step4810
- Checkpoint 200M: https://huggingface.co/arianraje/mimo-7b-gdn-hybrid-200M-OPD
