# efe-T/Experiment1-B

## Resumen

Experiment1-B es un experimento de preentrenamiento continuo de un modelo GPT-2 desde inicialización aleatoria sobre el corpus FineWeb-Edu 10B, en una única pasada estrictamente monótona (cada token se procesa una sola vez). El proyecto está desarrollado por efe-T (Efe Aydın), un investigador independiente que publica el código fuente y los pesos en HuggingFace. No se trata de un modelo listo para usar, sino de un experimento técnico que documenta el proceso completo de entrenamiento, con una activación personalizada (xIELU) y una ventana de atención progresiva de 2.304 a 8.192 tokens. En el momento de la publicación, el entrenamiento está en ejecución con 0 tokens procesados (0.00% del corpus), por lo que no existen pesos finales ni capacidades evaluadas. La relevancia radica en su enfoque de preentrenamiento sin repetición de datos y en la publicación de métricas y checkpoints resumibles, lo que permite estudiar el comportamiento del entrenamiento en una sola pasada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (ventana progresiva desde 2.304 durante el entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (raw) y codigo PyTorch personalizado |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2, un transformer decoder estándar, pero el repositorio no es un modelo drop-in de Transformers: incluye código PyTorch personalizado y pesos safetensors sin empaquetar. El entrenamiento se realiza sobre el corpus FineWeb-Edu 10B, compuesto por 9.851.371.520 tokens distribuidos en 99 shards (000001 a 000099), leídos en orden. La configuración usa un lote de 524.288 tokens por paso de optimizador, lo que da un total de 18.790 pasos. El proceso es una sola pasada monótona: no hay repetición de tokens, y se entrenan 300.640 secuencias de las 300.645 disponibles. El dtype de entrenamiento es BF16, ejecutado en una NVIDIA A100-SXM4-40GB.

Como innovaciones técnicas destacables, el modelo emplea una activación trainable denominada xIELU, y una ventana de atención progresiva que crece desde 2.304 hasta 8.192 tokens y se mantiene en el máximo. La tasa de aprendizaje es constante, con un único cooldown en los últimos 3.152 pasos al final real del dataset. No se menciona ninguna fase de RLHF, DPO ni alineación posterior. Los checkpoints se publican cada 250.000.000 de tokens procesados, y el run es resumible: el optimizador, la programación de aprendizaje y el cursor de datos se restauran desde `checkpoints/latest/manifest.json`.

## Capacidades

- No disponible: el modelo está en estado de ejecución con 0 tokens procesados (0.00% del corpus), por lo que no se han evaluado capacidades funcionales.
- No disponible: no se ha validado generación de texto, razonamiento, código, matemáticas, visión ni ninguna otra tarea.
- No disponible: no se ha confirmado soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No disponible: no se ha informado de capacidades multilingües.
- No disponible: no se ha documentado ninguna capacidad especial (thinking mode, visión, audio, etc.).

## Casos de uso

- No disponible: el modelo no ha completado su entrenamiento, por lo que no se pueden proporcionar casos de uso prácticos.
- No disponible: al estar en fase experimental y con 0 tokens procesados, no se recomienda su uso en producción.
- No disponible: no hay información sobre aplicaciones concretas en la documentación del repositorio.
- No disponible: no se han publicado demos, ejemplos de uso ni guías de integración.
- No disponible: la información proporcionada no permite evaluar la idoneidad del modelo para ningún escenario real.
- No disponible: el repositorio no incluye documentación de casos de uso más allá del proceso de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Entrenamiento: el model card indica que el run se ejecuta en una NVIDIA A100-SXM4-40GB, con dtype BF16.
- VRAM estimada para inferencia: no disponible (el tamaño de parámetros no se especifica, por lo que no se puede estimar).
- GPU recomendadas para inferencia: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible. El modelo no es drop-in de Transformers y requiere el código PyTorch personalizado incluido en el repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparación directa.

## Limitaciones y advertencias

- El modelo está en estado de ejecución con 0 tokens procesados (0.00% del corpus); no existen pesos finales completos.
- No es un modelo drop-in de Transformers: requiere el código PyTorch personalizado del repositorio y una configuración específica.
- La licencia no está especificada, por lo que no se puede determinar si es apto para uso comercial.
- Los idiomas soportados no están documentados; el corpus FineWeb-Edu no se detalla en la información proporcionada.
- El riesgo de alucinación, sesgos y otros comportamientos no ha sido evaluado.
- No se recomienda su uso en producción ni en aplicaciones críticas hasta que el entrenamiento se complete y se validen sus capacidades.

## Enlaces

- HuggingFace: https://huggingface.co/efe-T/Experiment1-B
- Perfil del autor en HuggingFace: https://huggingface.co/efe-T/models
