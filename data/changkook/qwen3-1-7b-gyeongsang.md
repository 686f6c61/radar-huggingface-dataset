# changkook/qwen3-1.7b-gyeongsang

## Resumen

`changkook/qwen3-1.7b-gyeongsang` es un ajuste fino (fine-tuning) del modelo Qwen3 de 1.700 millones de parámetros, publicado por el usuario changkook en Hugging Face. El nombre sugiere una especialización en el dialecto gyeongsang (경상도 사투리), una de las variantes regionales del coreano hablado en el sureste de la península, aunque la model card no lo confirma explícitamente. El repositorio se creó y actualizó el 17 de noviembre de 2026, cuenta con cero descargas y cero likes en el momento de la consulta, y su model card es la plantilla autogenerada por Hugging Face sin completar.

El modelo hereda la arquitectura de la familia Qwen3, un transformer decoder-only con atención completa, y un total de 1.720.574.976 parámetros según los pesos en safetensors. El repositorio ocupa 3,5 GB, lo que es coherente con pesos en precisión bf16/fp16 para ese número de parámetros. No se dispone de información sobre el proceso de entrenamiento, los datos utilizados, la licencia ni los idiomas soportados más allá de lo que se puede inferir del modelo base.

Su relevancia es limitada y fundamentalmente experimental: se trata de un derivado comunitario de un modelo pequeño y eficiente, útil para experimentar con adaptaciones dialectales del coreano en entornos con recursos reducidos, pero sin documentación, sin evaluación publicada y sin garantías de calidad. Cualquier uso en producción requeriría una validación propia exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3); detalles no disponibles |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en el repositorio; al ser compatible con transformers, admite cuantizaciones estándar (GGUF, AWQ, GPTQ) generadas por el usuario |
| Idiomas soportados | No disponible; el nombre sugiere coreano (dialecto gyeongsang) además de los idiomas del modelo base |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la pertenencia a la familia Qwen3 y del tag `qwen3` en el repositorio. Qwen3 es una familia de transformers decoder-only con atención completa y, en sus variantes mayores, mecanismos de modo "thinking"; para el tamaño de 1,7B no se dispone de confirmación sobre si conserva dichas capacidades. El recuento exacto de parámetros (1.720.574.976) coincide con el tamaño esperado para un modelo de aproximadamente 1,7B en la familia Qwen3.

No hay información sobre el dataset de ajuste fino, el número de tokens utilizados, la composición de los datos, ni si se aplicaron técnicas de RLHF, DPO o SFT. El nombre del repositorio apunta a un ajuste orientado al dialecto gyeongsang del coreano, pero se trata de una inferencia a partir del identificador y no de un dato documentado. Tampoco se especifican hiperparámetros, régimen de precisión ni infraestructura de entrenamiento.

## Capacidades

- Generación de texto y conversación: el pipeline declarado es `text-generation` y el tag `conversational` indica uso previsto para diálogo.
- Especialización dialectal probable: el sufijo "gyeongsang" sugiere adaptación al dialecto regional del coreano, sin confirmación documental.
- Herencia de capacidades del modelo base Qwen3 de 1,7B: razonamiento básico, generación de código y matemáticas elementales, sin evaluación específica disponible para este fine-tuning.
- Compatibilidad con `text-generation-inference` y `endpoints_compatible`, lo que facilita su despliegue en infraestructura de inferencia estándar.
- Soporte de tool calling, agentes o modos de razonamiento extendido: no disponible (no documentado).
- Capacidades multimodales (visión, audio): no disponibles.

## Casos de uso

- Experimentación lingüística con dialectos del coreano: el modelo puede emplearse para generar o evaluar texto en gyeongsang, comparando su salida con la del Qwen3 base para medir el efecto del ajuste fino.
- Prototipado de asistentes conversacionales en coreano: su tamaño de 1,7B permite iterar rápidamente en local con una sola GPU consumer antes de escalar a modelos mayores.
- Investigación sobre adaptación de dominio en modelos pequeños: sirve como caso de estudio de fine-tuning comunitario sobre Qwen3, con pesos safetensors listos para inspección.
- Generación de datos sintéticos dialectales: puede utilizarse para producir corpus de entrenamiento o evaluación en gyeongsang, siempre con revisión humana dada la ausencia de métricas de calidad.
- Despliegue en entornos con recursos limitados: con cuantización a 4 bits ocupa alrededor de 1 GB, lo que permite ejecutarlo en GPUs de gama baja o incluso en CPU para pruebas.
- Base para nuevos fine-tunings: al ser un checkpoint intermedio, puede servir de punto de partida para adaptaciones adicionales dentro de la comunidad coreana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 3,5 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 4 y 6 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: alrededor de 2 GB para pesos.
- VRAM estimada en cuantización de 4 bits (GGUF Q4): alrededor de 1 GB para pesos.
- GPU recomendadas: cualquier GPU con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 3070) para fp16; A100/H100 no son necesarias y estarían infrautilizadas.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 6-8 GB o más; en 4 bits cabe incluso en GPUs de 4 GB.
- Opciones de despliegue: transformers (soporte nativo declarado), text-generation-inference (tag `text-generation-inference`), y previsiblemente vLLM, llama.cpp y Ollama tras conversión a GGUF, aunque no se proporcionan artefactos de conversión en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| changkook/qwen3-1.7b-gyeongsang | 1,72B | No disponible | No disponible | Hugging Face, 0 descargas | Fine-tuning comunitario sin documentar |
| Qwen3-1.7B (base) | ~1,7B | No disponible en esta ficha | Apache 2.0 (modelo base Qwen3) | Amplia distribución | Modelo oficial con model card completa y evaluaciones |
| Qwen2.5-1.5B | ~1,5B | 32.768 tokens (modelo base) | Apache 2.0 | Amplia distribución | Generación anterior, bien documentado |
| Llama 3.2 1B | ~1,2B | 131.072 tokens | Llama 3.2 Community License | Amplia distribución | Alternativa multilingüe con licencia restrictiva para grandes usuarios |

La comparación con el modelo base Qwen3-1.7B es la más relevante: este fine-tuning no aporta documentación sobre mejoras medibles y no publica evaluaciones, por lo que la elección frente al base solo se justifica si se busca específicamente la variante dialectal.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es la plantilla autogenerada, sin información sobre datos, entrenamiento, evaluación ni uso previsto.
- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor o verificar la licencia del modelo base Qwen3 antes de cualquier despliegue.
- Riesgo de alucinación y degradación: al ser un fine-tuning sin evaluación, no hay garantía de que conserve las capacidades del base; el ajuste podría haber provocado olvido catastrófico.
- Idiomas y contexto desconocidos: no se confirma el soporte multilingüe ni la ventana de contexto efectiva tras el ajuste.
- Sesgos: no documentados; los sesgos del corpus dialectal coreano y del modelo base no han sido analizados.
- Sin tracción comunitaria: cero descargas y cero likes implican ausencia de validación por terceros.
- Fecha de creación futura (2026): conviene verificar la autenticidad y estabilidad del repositorio antes de depender de él.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/changkook/qwen3-1.7b-gyeongsang
- Calculadora de impacto medioambiental citada en la model card: https://ml2co2.github.io/impact
- Paper de Lacoste et al. (2019) citado en la model card: https://arxiv.org/abs/1910.09700
- Documentación de transformers: https://huggingface.co/docs/transformers
- Documentación de text-generation-inference: https://huggingface.co/docs/text-generation-inference
