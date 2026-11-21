# orcarouter/Qwen3.8-27B-Uncensored-INT8

## Resumen

Qwen3.8-27B-Uncensored-INT8 es una versión cuantizada a 8 bits y "abliterated" (sin censura) del modelo multimodal Qwen3.8-27B de Alibaba Qwen, publicada por el usuario orcarouter en Hugging Face. El modelo conserva la arquitectura vision-language del original (pipeline image-text-to-text, familia qwen3_5) con 27.360.627.952 parámetros totales, y sustituye los pesos en coma flotante por una cuantización W8A8 gestionada mediante compressed-tensors, lo que reduce el repositorio a 31,3 GB y permite servirlo con vLLM en GPUs de gama alta.

La relevancia de esta ficha es doble. Por un lado, demuestra el flujo habitual de la comunidad: tomar un modelo frontera abierto, aplicar técnicas de abliteration para eliminar los rechazos de seguridad y cuantizarlo para hacerlo desplegable en infraestructura propia. Por otro, su etiquetado explícito como material de red-teaming, ai-red-team y uncensored lo convierte en una herramienta pensada para evaluar robustez y alineación, no para producción orientada al usuario final. El acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face.

Es importante señalar que parte de los metadatos del modelo (nombre Qwen3.8, tags qwen3_5, qwen3.8, soporte de MTP) no se corresponden con ninguna familia publicada oficialmente por Qwen en el momento de redactar esta ficha, por lo que deben tratarse como datos declarados por el autor y no verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language), familia declarada qwen3_5; detalles de capas y atencion no disponibles |
| Parametros totales | 27.360.627.952 (dato real de safetensors) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 W8A8 (pesos y activaciones a 8 bits) mediante compressed-tensors |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compatible con transformers y vLLM) |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.8-27B, un modelo de la familia Qwen con capacidad de entrada imagen-texto (pipeline image-text-to-text), lo que implica un codificador visual acoplado a un decoder de lenguaje. Los tags incluyen referencias a MTP (multi-token prediction) y a razonamiento, function-calling y conversación, pero no se dispone de información pública verificable sobre el número de capas, la dimensión oculta, el mecanismo de atención ni el tamaño del vocabulario en la información proporcionada.

Sobre el proceso de entrenamiento del modelo base no hay datos disponibles: no se indica el volumen de tokens, la composición del dataset, ni si hubo fases de RLHF, DPO o aprendizaje por refuerzo con verificación. La modificación respecto al original consiste en una abliteration (eliminación de la dirección de rechazo en el espacio de activaciones) seguida de una cuantización post-entrenamiento a INT8 con esquema W8A8, empaquetada con compressed-tensors para su carga directa en vLLM. No se documentan métodos de calibración, número de muestras de calibración ni la pérdida de calidad asociada a la cuantización.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Comprensión de imágenes y respuesta en texto (image-text-to-text), incluyendo preguntas sobre el contenido visual.
- Razonamiento explícito, con soporte declarado de modo de pensamiento (thinking) según los tags del autor.
- Generación de código y matemáticas, aunque sin benchmarks publicados que lo cuantifiquen.
- Function calling / tool calling, según los tags del repositorio.
- Soporte de flujos agénticos y razonamiento multi-paso (declarado, no verificado).
- Predicción multi-token (MTP) declarada, lo que en teoría permitiría decodificación especulativa nativa.
- Comportamiento sin rechazos (uncensored/abliterated): responde a peticiones que el modelo base rechazaría.
- Compatibilidad con endpoints y despliegue en vLLM gracias al formato compressed-tensors.

## Casos de uso

- Red-teaming y evaluación de alineación: el modelo sirve como sujeto de prueba para medir la eficacia de filtros de seguridad, ya que su abliteration elimina las negativas del modelo original y permite estudiar qué contenidos emergen sin salvaguardas.
- Investigación en seguridad de modelos multimodales: al aceptar entradas de imagen y texto, permite construir conjuntos de ataques que combinan instrucciones textuales con estímulos visuales para evaluar jailbreaks.
- Generación de datos adversarios para entrenar clasificadores de seguridad: se puede usar para producir pares pregunta-respuesta que alimenten un detector de contenido dañino, siempre en un entorno controlado y con revisión humana.
- Análisis de sesgos y robustez lingüística: su cobertura limitada a inglés y chino permite estudiar cómo se degrada el comportamiento en otros idiomas y qué sesgos aparecen en cada uno.
- Pruebas de cuantización INT8 en producción: al estar empaquetado con compressed-tensors, es un banco de pruebas realista para medir la degradación de calidad de W8A8 frente a BF16 en tareas de razonamiento y visión.
- Evaluación de pipelines agénticos con tool calling: útil para comprobar cómo se comporta un modelo sin restricciones de rechazo cuando se le da acceso a herramientas, un escenario clave para estudiar riesgos de ejecución autónoma.
- Prototipado de asistentes sobre documentos e imágenes en entornos de investigación cerrados, donde la licencia Apache 2.0 facilita la experimentación interna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 31,3 GB solo para los pesos en INT8, más overhead de KV cache, activaciones y codificador visual; en la práctica se recomienda un mínimo de 40-48 GB para contextos moderados y bastante más para contextos largos.
- GPU recomendadas: A100 80 GB, H100 80 GB, L40S 48 GB o A6000 48 GB. En GPUs de 24 GB (RTX 4090, RTX 3090) no cabe en INT8 sin offloading a CPU o sin recurrir a una cuantización adicional a 4 bits no publicada en este repositorio.
- Cabe en consumer GPU: no de forma nativa en 24 GB; sí en configuraciones multi-GPU o con offloading parcial.
- Opciones de despliegue: vLLM es la vía principal por el formato compressed-tensors; transformers para carga directa; llama.cpp/Ollama requerirían una conversión a GGUF que no se proporciona en el repositorio.
- Latencia y throughput estimados: no disponibles. Como referencia cualitativa, W8A8 en vLLM suele ofrecer mejor throughput que BF16 en GPUs con soporte de kernels INT8 (Ada Lovelace, Hopper), pero no hay cifras publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Acceso |
|---|---|---|---|---|---|
| orcarouter/Qwen3.8-27B-Uncensored-INT8 | 27,36 B | no disponible | imagen-texto | Apache 2.0 | gated |
| Qwen/Qwen3.8-27B (base) | 27,36 B (declarado) | no disponible | imagen-texto | Apache 2.0 (según este repo) | no disponible |
| Alternativas abliterated de la familia Qwen | variable | variable | texto o multimodal | Apache 2.0 habitualmente | variable |

No se dispone de datos verificables de benchmarks ni de especificaciones del modelo base en la información proporcionada, por lo que la comparación cuantitativa con alternativas de la misma categoría no está disponible.

## Limitaciones y advertencias

- Modelo sin censura: la abliteration elimina los mecanismos de rechazo, por lo que puede generar contenido dañino, ilegal o sexualmente explícito. No debe desplegarse de cara al público sin capas de moderación externas.
- Acceso restringido: el repositorio es gated y exige aceptar condiciones en Hugging Face; el uso comercial está sujeto tanto a la licencia Apache 2.0 como a las condiciones de acceso del autor.
- Idiomas limitados a inglés y chino: el rendimiento en castellano no está documentado y previsiblemente será inferior.
- Riesgo elevado de alucinación: no hay benchmarks publicados que cuantifiquen la precisión factual, y la cuantización INT8 puede degradar tareas sensibles a la precisión numérica.
- Metadatos no verificados: la denominación Qwen3.8 y los tags qwen3_5 no corresponden a una familia publicada oficialmente, lo que impide confirmar la arquitectura, el contexto y el entrenamiento reales.
- Sin datos de calibración de la cuantización: se desconoce la pérdida de calidad frente al modelo en BF16.
- Contexto desconocido: no se puede planificar el uso en tareas de contexto largo sin confirmar la ventana real del modelo base.
- Sin garantías de soporte: es una publicación de un tercero (orcarouter), no del equipo oficial de Qwen, por lo que no hay mantenimiento ni parches de seguridad garantizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-INT8
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.8-27B
- Documentación de compressed-tensors (formato de cuantización): https://github.com/neuralmagic/compressed-tensors
- Documentación de vLLM (despliegue): https://docs.vllm.ai
- Documentación de transformers: https://huggingface.co/docs/transformers
