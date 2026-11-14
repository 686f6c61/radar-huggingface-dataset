# bambocher/LFM3-1.7B-oQ6

## Resumen

LFM3-1.7B-oQ6 es una cuantización mixta del modelo LFM3 de 1.700 millones de parámetros (1.728.801.536 pesos, según los safetensors del repositorio), publicada por el usuario bambocher mediante la herramienta oQ de oMLX v0.7.3. El resultado es un checkpoint en formato MLX con un promedio efectivo de 6,700 bits por peso, pensado para ejecución en Apple Silicon a través del framework MLX. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos que preserva la arquitectura y el comportamiento del LFM3 original mientras reduce su huella de almacenamiento.

El interés de esta ficha radica en que documenta un caso concreto de cuantización mixta: el 90,07 % de los pesos (1.557 millones) se almacena en affine 6-bit con grupo de 64, el 9,907 % (171 millones) se mantiene en affine 8-bit y un 0,022 % residual queda en BF16. Esa distribución selectiva busca conservar precisión en las capas más sensibles (probablemente embeddings, cabezas de salida o normas) mientras comprime el grueso del transformer. El repositorio ocupa 1,5 GB y el checkpoint lógico pesa 1,448 GB (1,348 GiB).

La relevancia de este artefacto es acotada: no hay model card descriptiva del modelo base, ni pipeline declarado, ni idiomas, ni licencia indicada en la información disponible. Para un desarrollador que quiera evaluarlo, la ficha debe leerse como una referencia de despliegue en MLX más que como una evaluación del LFM3 en sí, cuyas capacidades y entrenamiento no están documentados en esta fuente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3; arquitectura no documentada en la información proporcionada) |
| Parámetros totales | 1.728.801.536 (1,729 B) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Mixta: affine 6-bit group 64 (90,070 % de pesos), affine 8-bit group 64 (9,907 %), BF16 (0,022 %); promedio efectivo 6,700 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors con custom_code, librería MLX |
| Tamaño del repositorio | 1,5 GB (checkpoint lógico 1,448 GB / 1,348 GiB) |
| Herramienta de cuantización | oQ (oMLX v0.7.3) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base LFM3 en la documentación proporcionada: no se especifica si es un transformer denso, un modelo híbrido o una variante con atención lineal, ni se detallan capas, dimensión oculta o número de cabezas. Tampoco hay datos sobre el corpus de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron fases de RLHF, DPO o ajuste por preferencias. La model card del repositorio se limita a describir el proceso de cuantización.

La innovación técnica documentada es exclusivamente la cuantización mixta aplicada con oQ: se asigna precisión de 6 bits a la mayoría de los tensores y se reserva 8 bits para un subconjunto del 9,907 % de los pesos, con un residuo en BF16. Esta estrategia de precisión selectiva es habitual para mitigar la degradación en capas críticas, aunque la información disponible no identifica qué componentes reciben el trato preferente ni cuantifica la pérdida de calidad respecto al modelo original.

## Capacidades

- Generación de texto: capacidad esperada por tratarse de un modelo de lenguaje de 1,7 B, aunque no hay documentación que la confirme en esta fuente.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Modo thinking, visión o audio: no disponible.
- Ejecución nativa en Apple Silicon mediante MLX: confirmada por la librería y los tags del repositorio.

## Casos de uso

- Despliegue local en Mac con Apple Silicon: el checkpoint está empaquetado para MLX y ocupa 1,5 GB, por lo que puede cargarse en un portátil o Mac mini con memoria unificada moderada para prototipos de generación de texto sin conexión.
- Pruebas de cuantización y evaluación de degradación: útil para comparar la salida de esta versión 6,700 bits/peso frente al LFM3 original en tareas de perplejidad o generación, midiendo el impacto de la mezcla 6/8 bits.
- Investigación sobre formatos de pesos: sirve como ejemplo reproducible de cuantización mixta con oQ para estudiar distribuciones de bits y su efecto en modelos de ~1,7 B.
- Inferencia en entornos con restricciones de memoria: al reducir el checkpoint a 1,348 GiB, permite ejecutar el modelo en dispositivos donde la versión BF16 no cabría.
- Integración en aplicaciones macOS/iOS vía MLX: para desarrolladores que ya usan el stack de Apple y quieren un modelo pequeño de lenguaje como componente de generación en apps nativas.
- Base para fine-tuning ligero: al ser un modelo de 1,7 B cuantizado, puede servir de punto de partida en experimentos de adaptación con LoRA sobre MLX, aunque la cuantización limita el ajuste directo de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el checkpoint ocupa 1,348 GiB en disco; en carga se requiere al menos esa cantidad más overhead de activaciones y caché KV (no cuantificado en la información disponible).
- GPU recomendadas: no disponible; el formato MLX está orientado a Apple Silicon (M1, M2, M3, M4 y superiores con memoria unificada).
- ¿Cabe en GPU consumer? No hay datos para GPUs NVIDIA; en Apple Silicon, sí cabe en configuraciones con 8 GB o más de memoria unificada, aunque el margen real depende del contexto.
- Opciones de despliegue: MLX (librería declarada) y, presumiblemente, herramientas del ecosistema MLX como mlx-lm; no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-oQ6 (este) | 1,729 B | no disponible | Mixta 6,700 bits/peso (MLX) | no disponible | Hugging Face, 0 descargas |
| LFM3-1.7B original | 1,7 B (según nombre) | no disponible | BF16 (presumible) | no disponible | no disponible en esta fuente |
| Otros modelos ~1,7 B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card no documenta el modelo base: se desconoce la arquitectura, el entrenamiento, los idiomas y las capacidades reales del LFM3 subyacente.
- La licencia no está indicada, lo que impide confirmar si el uso comercial está permitido; debe verificarse en el repositorio del modelo original antes de cualquier despliegue en producción.
- La cuantización mixta a 6,700 bits/peso puede introducir degradación en tareas sensibles a la precisión (matemáticas, código, razonamiento largo), no cuantificada en la información disponible.
- El formato MLX limita el despliegue a Apple Silicon; no hay evidencia de compatibilidad con CUDA, ROCm ni con runtimes estándar como vLLM o llama.cpp.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria ni informes de calidad.
- Riesgo de alucinación y sesgos: no evaluado ni documentado.
- No se especifica la longitud de contexto soportada, lo que impide planificar casos de uso con ventanas largas.
- El tag `custom_code` implica que la carga requiere código personalizado; conviene auditar el repositorio antes de ejecutarlo en entornos sensibles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bambocher/LFM3-1.7B-oQ6
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Documentación de MLX: no disponible en la información proporcionada
- Modelo base LFM3: no disponible en la información proporcionada
- Paper o blog del modelo base: no disponible en la información proporcionada
