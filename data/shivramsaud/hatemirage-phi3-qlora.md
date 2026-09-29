# ShivRamSaud/hatemirage-phi3-qlora

## Resumen

ShivRamSaud/hatemirage-phi3-qlora es un adaptador LoRA, entrenado con QLoRA, publicado por el usuario ShivRamSaud sobre el modelo microsoft/Phi-3-mini-128k-instruct. No es un modelo completo: el repositorio contiene únicamente los pesos del adaptador en formato safetensors (0,9 GB) y debe cargarse junto con el modelo base mediante la librería PEFT. El pipeline declarado es text-generation y las etiquetas indican ajuste supervisado (SFT) con TRL sobre una base cuantizada en 4 bits.

El modelo base es un transformer decoder-only denso de 3 800 millones de parámetros con 128 000 tokens de contexto, orientado a razonamiento, código y matemáticas, de modo que el adaptador hereda ese perfil técnico. Sin embargo, la model card del adaptador es la plantilla por defecto de HuggingFace y no documenta el conjunto de datos de ajuste, los hiperparámetros de LoRA, la licencia ni los idiomas soportados.

Su relevancia práctica es limitada en el estado actual: el repositorio acumula 0 descargas y 0 valoraciones, no incluye ninguna evaluación y no explica para qué tarea se ajustó. Es un caso típico de adaptador experimental publicado sin documentación, útil como plantilla de referencia o para experimentación propia, pero no como componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, heredada del modelo base; el artefacto publicado es un adaptador LoRA sobre atención y proyecciones (módulos concretos no disponibles) |
| Parámetros totales | 3 800 millones en el modelo base; número de parámetros entrenables del adaptador: no disponible |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 128 000 tokens heredados del modelo base; longitud de secuencia usada en el ajuste fino: no disponible |
| Tipos de cuantización | El adaptador se distribuye en safetensors (normalmente fp16/bf16). El sufijo "qlora" indica que la base se cuantizó a 4 bits durante el entrenamiento, no que el adaptador esté cuantizado. El modelo base soporta cuantizaciones de la comunidad: GGUF (Q4_K_M, Q5_K_M, Q8_0), AWQ y GPTQ |
| Idiomas soportados | no disponible en la ficha del adaptador; el modelo base está orientado principalmente al inglés, con capacidades multilingües limitadas |
| Licencia | no disponible en el repositorio del adaptador; el modelo base microsoft/Phi-3-mini-128k-instruct se publica bajo licencia MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base descargado por separado |

## Arquitectura y entrenamiento

El adaptador se apoya en Phi-3-mini-128k-instruct, un transformer decoder-only denso de 3 800 millones de parámetros con 32 capas, dimensión oculta 3072, 32 cabezas de atención (atención multi-cabeza completa, sin GQA) y vocabulario de 32 064 tokens, según la configuración publicada por Microsoft. La variante 128k emplea RoPE con escalado de posición para alcanzar 131 072 posiciones. El modelo base se entrenó con aproximadamente 3,3 billones de tokens de datos web filtrados y datos sintéticos generados por modelos mayores, y su versión instruct pasó por SFT y DPO. Toda esta información procede del modelo base; la ficha del adaptador no añade detalle alguno.

Los únicos datos verificables del ajuste fino son los que aparecen en las etiquetas del repositorio: PEFT 0.21.0, TRL, SFT, LoRA y la etiqueta "conversational". Se desconoce el conjunto de datos, el número de épocas, el rango y el alpha de LoRA, la tasa de aprendizaje, los módulos objetivo y si hubo enmascarado del prompt en la pérdida. El tamaño del repositorio (0,9 GB) es notablemente superior al de un adaptador LoRA estándar para un modelo de 3,8B, lo que sugiere un rango elevado, múltiples checkpoints guardados o la inclusión de estados del optimizador, pero no hay confirmación al respecto. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, destilación u otros).

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation con etiqueta conversational, por lo que conserva el formato de chat con tokens especiales (`<|user|>`, `<|assistant|>`, `<|end|>`) del modelo base.
- Razonamiento, matemáticas y código: capacidades heredadas de Phi-3-mini-128k-instruct, que fue entrenado específicamente en estas áreas, aunque no hay evaluación del adaptador que las confirme.
- Contexto largo: hereda la ventana de 128 000 tokens del modelo base, si bien su uso efectivo depende del coste de memoria de la caché KV y de si el ajuste se hizo con secuencias largas.
- Tool calling / function calling: el modelo base 128k-instruct documenta soporte de llamada a funciones mediante su plantilla de prompt; el adaptador no documenta si conserva o degrada esta capacidad.
- Flujos de agente y razonamiento multi-paso: no documentado en la ficha del adaptador.
- Capacidades multilingües: no disponibles; el modelo base está centrado en inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles. Phi-3-mini no es multimodal, por lo que no hereda visión ni audio.
- Modo de razonamiento explícito: no disponible.

## Casos de uso

- Plantilla de referencia para QLoRA: el repositorio sirve como ejemplo mínimo de adaptador PEFT entrenado con TRL, útil para replicar un pipeline de ajuste con cuantización en 4 bits sobre un modelo de 3,8B en una única GPU consumer.
- Experimentación académica sobre ajuste eficiente: permite estudiar cómo se comporta un adaptador de bajo rango sobre una base instruct sin necesidad de reentrenar, aunque el dominio concreto del ajuste debe inferirse del comportamiento observable al no estar documentado.
- Clasificación o moderación de contenido: el nombre del repositorio ("hatemirage") sugiere un posible enfoque hacia discurso de odio, pero no hay documentación que lo confirme; antes de usarlo en esta tarea habría que validar el comportamiento del adaptador con un conjunto de evaluación propio.
- Prototipado de asistentes conversacionales en local: con el modelo base en GGUF Q4_K_M (unos 2,4 GB), el conjunto cabe en portátiles con 8 GB de VRAM o en Mac con memoria unificada, lo que permite desplegar un chat privado sin conexión.
- Generación de código en herramientas de desarrollo: el modelo base obtiene buenos resultados en HumanEval y MBPP, de modo que el adaptador puede integrarse en asistentes de autocompletado, siempre que se valide que el ajuste no ha degradado la capacidad de código.
- RAG sobre documentación técnica: la ventana de 128 000 tokens permitiría inyectar muchos fragmentos, aunque en la práctica el coste de caché KV obliga a trabajar con contextos de 4k a 8k en hardware consumer.
- Educación y generación de explicaciones paso a paso: el tamaño reducido y la naturaleza abierta del adaptador facilitan su despliegue en entornos con recursos limitados y requisitos de privacidad.
- Base para un ajuste posterior específico de dominio: al ser un adaptador pequeño, se puede continuar el entrenamiento (continued fine-tuning) o fusionarlo con la base y aplicar un segundo LoRA para una tarea concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del adaptador no incluye ninguna sección de evaluación y el repositorio no adjunta scripts, logs ni métricas de entrenamiento. Los resultados publicados por Microsoft para microsoft/Phi-3-mini-128k-instruct (informe técnico arXiv:2404.14219) corresponden al modelo base y no son extrapolables al adaptador, ya que el ajuste con QLoRA puede alterar el rendimiento tanto al alza como a la baja según el dominio y la receta empleada. Cualquier cifra de MMLU, HumanEval o GSM8K que se quiera atribuir a este adaptador debe obtenerse mediante una evaluación propia.

## Requisitos de hardware

- Pesos del adaptador: 0,9 GB en disco; se suman a los pesos del modelo base.
- Modelo base en fp16/bf16: unos 7,6 GB de VRAM solo para los pesos, más la caché KV y las activaciones. Con 4 096 tokens de contexto la caché KV ocupa aproximadamente 1,5 GB (estimación a partir de la arquitectura del modelo base: 32 capas, 32 cabezas, dimensión de cabeza 96, precisión fp16), lo que sitúa el total en torno a 10 GB.
- Modelo base en 8 bits (bitsandbytes): unos 4 GB de pesos.
- Modelo base en 4 bits (bitsandbytes NF4, GPTQ o AWQ): unos 2,2 a 2,5 GB de pesos; es la vía recomendada para cargar el adaptador QLoRA sin fusionar.
- GGUF Q4_K_M: fichero de aproximadamente 2,4 GB; Q8_0, en torno a 4,1 GB.
- Contexto largo: la caché KV crece de forma lineal, unos 384 KiB por token en fp16. Con 128 000 tokens supera los 45 GB, por lo que la ventana completa no es viable en hardware consumer ni en una única GPU de 80 GB sin atención optimizada o cuantización de la caché.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 12 GB, RTX 4090 24 GB para cuantización 4 bits u 8 bits; A100 40/80 GB o H100 para fp16 con contextos medios o altos y servicio concurrente.
- Cabe en GPU consumer: sí, en cualquier GPU con 8 GB o más usando cuantización de 4 bits, y en Apple Silicon con 16 GB de memoria unificada.
- Opciones de despliegue: transformers + PEFT (carga del adaptador sin fusionar), fusión del adaptador con la base y posterior exportación a GGUF para llama.cpp, Ollama o LM Studio, vLLM o TGI para servicio en servidor (requieren fusionar los pesos previamente), y text-generation-inference con soporte de Phi-3.
- Latencia y throughput: no disponibles. No hay mediciones publicadas en el repositorio ni referencias de velocidad para este adaptador concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| hatemirage-phi3-qlora (este adaptador) | 3,8B (base) + adaptador de tamaño no especificado | 128 000 tokens (heredados) | no disponible | HuggingFace, 0 descargas, 0 likes | no disponible |
| microsoft/Phi-3-mini-128k-instruct | 3,8B | 128 000 tokens | MIT | HuggingFace, ampliamente descargado | publicado en el informe técnico arXiv:2404.14219 |
| meta-llama/Llama-3.2-3B-Instruct | 3,21B | 128 000 tokens | Llama 3.2 Community License | HuggingFace | publicado en la model card oficial |
| Qwen/Qwen2.5-3B-Instruct | 3,09B | 32 768 tokens nativos (hasta 131 072 con YaRN) | Apache 2.0 | HuggingFace | publicado en la model card oficial |
| google/gemma-2-2b-it | 2,61B | 8 192 tokens | Gemma Terms of Use | HuggingFace (con acceso aceptado) | publicado en la model card oficial |

La comparación significativa es contra el propio modelo base: el adaptador solo aporta valor si el ajuste mejora el comportamiento en un dominio concreto, y en este caso no hay evidencia publicada que lo demuestre. Frente a Llama-3.2-3B-Instruct y Qwen2.5-3B-Instruct, Phi-3-mini destaca por la licencia MIT, mientras que Qwen2.5-3B ofrece licencia Apache 2.0 y Llama-3.2-3B impone restricciones adicionales de la licencia comunitaria. Gemma-2-2B es más pequeño y con contexto mucho más corto.

## Limitaciones y advertencias

- Documentación inexistente: la model card es la plantilla por defecto sin rellenar. Se desconocen el conjunto de datos, los hiperparámetros, la composición lingüística y el objetivo del ajuste.
- Licencia no especificada: el repositorio del adaptador no declara licencia. Aunque la base sea MIT, la ausencia de licencia en el artefacto derivado impide asumir derechos de uso comercial sin consultar al autor.
- Riesgo de sesgo desconocido: al no documentarse los datos de entrenamiento, no es posible evaluar sesgos de género, raza, religión o ideología introducidos por el ajuste. Si el ajuste se hizo sobre datos de discurso de odio, como sugiere el nombre del repositorio, el modelo podría reproducir ese tipo de contenido.
- Alucinación: los modelos de 3,8B tienen una tasa de alucinación superior a la de modelos de mayor tamaño, especialmente en tareas de conocimiento factual sin contexto de apoyo.
- Riesgo de degradación por el ajuste: un SFT sin documentar puede provocar olvido catastrófico y reducir el rendimiento en código, matemáticas o tool calling respecto al modelo base.
- Limitación idiomática: el modelo base está centrado en inglés; el rendimiento en castellano u otros idiomas no está evaluado y probablemente sea pobre, especialmente tras el ajuste.
- Contexto efectivo menor que el nominal: aunque la ventana sea de 128 000 tokens, la memoria necesaria para la caché KV la hace inviable en hardware consumer; además, si el ajuste se hizo con secuencias cortas, el rendimiento en contextos largos puede degradarse.
- Sin validación comunitaria: 0 descargas y 0 likes implican que nadie ha verificado el comportamiento del adaptador, y no hay issues ni discusiones que aporten contexto.
- Advertencia sobre la etiqueta arXiv:1910.09700: este identificador aparece en las etiquetas del repositorio porque la plantilla de model card de HuggingFace cita el artículo de Lacoste et al. sobre el impacto ambiental del aprendizaje automático. No es el artículo del modelo ni describe su entrenamiento.
- Advertencia de producción: no se recomienda desplegar este adaptador en un sistema en producción sin una evaluación propia previa, sin aclarar la licencia y sin comparar su salida con la del modelo base sin adaptador.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/ShivRamSaud/hatemirage-phi3-qlora
- Modelo base: https://huggingface.co/microsoft/Phi-3-mini-128k-instruct
- Informe técnico de Phi-3 (arXiv:2404.14219): https://arxiv.org/abs/2404.14219
- Documentación de PEFT: https://huggingface.co/docs/peft/index
- Documentación de TRL (SFTTrainer): https://huggingface.co/docs/trl/index
- Referencia citada en las etiquetas del repositorio (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental citada en la plantilla: https://mlco2.github.io/impact
- No se han encontrado papers, blogs, repositorios auxiliares ni demos específicos de este adaptador.
