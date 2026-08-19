# modilify/Modilify-Mk1

## Resumen

Modilify Mk1 es un modelo multimodal de 26 139 millones de parámetros desarrollado por el equipo de modilify, presentado como un sistema de difusión por bloques con arquitectura Mixture-of-Experts (MoE) que combina un tronco Transformer pesado con una pila latente recurrente. Su propuesta central es el "Transformer-in-Transformer": un Transformer latente de 4 capas que comprime la cadena de razonamiento en una trayectoria oculta de 64 ranuras de memoria, de modo que el modelo delibera en el espacio latente y solo "compromete" tokens visibles cuando una fórmula de entropía excesiva lo decide. Esto permite un control elástico de la velocidad de inferencia: problemas fáciles se resuelven rápido y problemas difíciles mantienen la deliberación.

El modelo acepta texto, imagen y vídeo, con una ventana de contexto de 262 144 tokens y un vocabulario de 262 144 entradas. El entrenamiento de adaptación se realizó en una única máquina Apple silicon en menos de 24 horas con aproximadamente 7 millones de tokens, una cifra inusualmente baja que el autor presenta como evidencia de "densidad de inteligencia" por parámetro activo y por token de entrenamiento. La versión publicada es la primera checkpoint pública estable, con mejoras sobre la versión Preview: torre de visión completa restaurada y ajustes de inferencia por defecto que afirman ser unas 6 veces más rápidos que un modelo autorregresivo equivalente.

La relevancia actual radica en que propone una alternativa a los modelos de razonamiento que generan largas cadenas de pensamiento visibles: aquí el razonamiento ocurre en un espacio latente, lo que reduce el coste de tokens de salida y evita contaminar el transcript visible con el scratchpad interno. Además, al ser un modelo de difusión, su mecanismo de generación difiere del autorregresivo estándar, lo que abre interrogantes sobre su integración en herramientas existentes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts block diffusion + Transformer-in-Transformer latente |
| Parametros totales | 26 139 111 276 (26,14 B) |
| Parametros activos | 4,729 B (incluye vision encoder); 4,159 B en denoise pesado de texto |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | modilify-open-model-license-1.0 (licencia personalizada, no OSI) |
| Formato de pesos | safetensors |

Otros datos técnicos declarados en la model card:

- Capas: 30
- Número de expertos: 128, con 8 seleccionados por token y 1 experto compartido
- Función de activación: GELU (aproximación tanh)
- Vision encoder: Gemma 4 Vision, 569,55 M parámetros
- Modalidades: texto, imagen, vídeo
- Ventana deslizante: 1024 tokens
- Longitud del canvas: 256 tokens
- Memoria latente: 64 ranuras × 1536 dimensiones, 4 capas
- FLOPs por denoise pesado: ~2,12 TFLOPs (batch 1, canvas 256, prefijo KV vacío)
- Tokens de entrenamiento: ~7 millones

## Arquitectura y entrenamiento

Modilify Mk1 combina un tronco de difusión por bloques tipo DiffusionGemma con una pila latente recurrente. El flujo de generación es el siguiente: cada denoise pesado procesa un canvas rodante de 256 tokens con el tronco MoE de 26B (activando 4,159B parámetros de texto), y un Transformer latente de 4 capas lee el canvas ruidoso, la confianza, la entropía y la antigüedad, actualizando latentes por token y una memoria persistente de 64 ranuras. Ese estado comprimido se proyecta de vuelta a través de un puente de auto-condicionamiento congelado y condiciona el siguiente pase pesado. Una "fórmula de compromiso exclusiva" basada en fusión de entropía excesiva decide cuántos tokens del prefijo se fijan en cada paso; los slots de memoria no se desplazan, por lo que el pensamiento continúa incluso después de que los tokens visibles avancen.

El entrenamiento de adaptación se realizó en una sola máquina Apple silicon en menos de 24 horas, con unos 7 millones de tokens. No se especifica la composición del dataset ni si se usaron técnicas como RLHF o DPO. El autor enfatiza que no se trata de un segundo preentrenamiento a escala web, sino de una adaptación que extrae más capacidad por token y por vatio gracias a la arquitectura. La inferencia por defecto está orientada a velocidad (unas 6× más rápida que los ajustes de la versión Preview), y es posible modificar parámetros como `commit_failure_budget`, `denoise_temperature` y los límites de ponderación para cambiar el punto de operación sin cambiar los pesos.

## Capacidades

- Generación multimodal: procesa y genera texto, imagen y vídeo, aunque no se detallan los mecanismos específicos para imagen y vídeo más allá del vision encoder.
- Razonamiento latente: comprime la cadena de pensamiento en latentes y memoria persistente, evitando generar largos CoT visibles.
- Control de velocidad de inferencia: mediante parámetros de compromiso, se puede ajustar el equilibrio entre rapidez y minuciosidad.
- Soporte para agentes: incluye control nativo del canal de pensamiento, turnos de Gemma preparados para herramientas y un scratchpad latente que no contamina el transcript visible.
- Tool calling: se menciona "tool-ready Gemma turns", lo que sugiere capacidad de invocar funciones externas, aunque no se detalla la interfaz.
- Contexto largo: ventana de 262 144 tokens, adecuada para documentos extensos o historiales de conversación largos.
- Memoria persistente: 64 ranuras de memoria que sobreviven a los commits de canvas, permitiendo mantener estado a lo largo de la generación.

## Casos de uso

- Agentes autónomos con scratchpad oculto: el modelo puede razonar durante varios pasos sin ensuciar el historial visible con cadenas de pensamiento, lo que resulta útil en chatbots de producción donde el usuario solo debe ver la respuesta final.
- Análisis de documentos extensos: con 262 144 tokens de contexto, puede procesar informes largos, contratos o libros completos, resumiendo y extrayendo información relevante en una sola pasada.
- Asistencia de código con tool calling: integrado en un IDE o pipeline de CI/CD, puede generar código, invocar funciones de prueba o ejecutar comandos, manteniendo el razonamiento interno separado de la salida visible.
- Generación de contenido multimodal: al aceptar imagen y vídeo, puede describir o transformar contenido visual, aunque las capacidades exactas no están documentadas.
- Razonamiento matemático y lógico: gracias a su mecanismo de deliberación latente, puede abordar problemas que requieren varios pasos de razonamiento sin necesidad de generar tokens intermedios visibles.
- Chat conversacional con memoria de largo plazo: la memoria persistente de 64 ranuras permite mantener contexto a lo largo de conversaciones muy largas, superando las limitaciones de ventana de otros modelos.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks comparativa, pero está incompleta en el README proporcionado. Solo se ha podido extraer el siguiente dato parcial:

| Benchmark | Modilify Mk1 | DiffusionGemma 26B A4B | Gemma 4 26B A4B |
| --- | ---: | ---: | --- |
| MMLU Pro | 86.8 | 77 | (dato no disponible) |

No se dispone de resultados completos para el resto de benchmarks (HumanEval, GSM8K, etc.) ni de los valores de los modelos comparados. Se recomienda consultar la model card original para obtener la tabla completa si está publicada.

## Requisitos de hardware

No se han publicado requisitos oficiales de hardware para inferencia. A partir del tamaño del repositorio (52,3 GB) y de la arquitectura MoE, se pueden hacer las siguientes estimaciones orientativas:

- VRAM estimada: para cargar los 26,14 B parámetros completos en FP16 se necesitan aproximadamente 52 GB de VRAM. Con cuantización a 8 bits, ~26 GB; con 4 bits, ~13 GB. Sin embargo, al ser un modelo MoE con solo 4,7 B parámetros activos, podría ser posible ejecutarlo en GPUs con menos memoria si se implementa una gestión eficiente de expertos, aunque no hay confirmación oficial.
- GPU recomendadas: para una carga completa en FP16 se necesitaría una GPU con 64 GB o más (por ejemplo, A100 80 GB o H100). Con cuantización a 8 bits, una RTX 4090 (24 GB) podría ser insuficiente si se cargan todos los expertos; con 4 bits podría caber en 16-24 GB, pero depende de la implementación.
- El entrenamiento se realizó en un Apple silicon, lo que sugiere que el modelo puede ejecutarse en Mac con memoria unificada (por ejemplo, M2 Ultra con 128 GB), aunque no se especifican requisitos mínimos.
- Opciones de despliegue: no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI. El modelo requiere `trust-remote-code`, por lo que su uso en entornos de producción exigirá una revisión cuidadosa del código remoto.
- Latencia y throughput: no hay datos oficiales. El autor afirma que la configuración por defecto es unas 6 veces más rápida que la versión Preview, pero no se proporcionan cifras absolutas.

## Comparativa con modelos similares

La model card compara Modilify Mk1 con DiffusionGemma 26B A4B y Gemma 4 26B A4B, ambos de la familia Gemma con arquitectura MoE de 26B y 4B activos. Sin embargo, solo se ha podido extraer un valor parcial de MMLU Pro (86.8 frente a 77), y no se dispone de datos completos de rendimiento. A continuación se presenta una comparativa estructural basada en la información disponible:

| Modelo | Parámetros totales | Parámetros activos | Contexto | Arquitectura | Licencia |
| --- | ---: | ---: | ---: | --- | --- |
| Modilify Mk1 | 26,14 B | 4,729 B (incl. visión) | 262 144 | MoE block diffusion + latente | modilify-open-model-license-1.0 |
| DiffusionGemma 26B A4B | ~26 B | ~4 B | no disponible | MoE block diffusion | no disponible |
| Gemma 4 26B A4B | ~26 B | ~4 B | no disponible | MoE autorregresivo | no disponible |

La principal diferencia de Modilify Mk1 frente a los otros dos es el mecanismo de difusión con deliberación latente y la memoria persistente, además de su entrenamiento extremadamente ligero (7M tokens). No se dispone de datos suficientes para una comparativa de rendimiento fiable.

## Limitaciones y advertencias

- Licencia personalizada: la licencia `modilify-open-model-license-1.0` no es una licencia estándar de código abierto. Es imprescindible revisar los términos completos antes de cualquier uso comercial o redistribución.
- Código remoto: el modelo requiere `trust-remote-code`, lo que implica ejecutar código no auditado del autor. Esto supone un riesgo de seguridad significativo en entornos de producción.
- Entrenamiento con muy pocos tokens: solo ~7 millones de tokens de adaptación, lo que puede provocar alucinaciones, falta de generalización en dominios no vistos y comportamientos inesperados fuera de los datos de entrenamiento.
- Idiomas no especificados: no se indica qué idiomas soporta. El entrenamiento con un dataset tan reducido probablemente limite el multilingüismo.
- Sesgos desconocidos: no se ha publicado ningún análisis de sesgos ni de seguridad. El modelo podría reflejar sesgos presentes en los datos de entrenamiento, que no están documentados.
- Rendimiento no verificado: los benchmarks publicados están incompletos y no se han reproducido de forma independiente. Las afirmaciones de velocidad (6×) y de "inteligencia por parámetro" carecen de validación externa.
- Compatibilidad limitada: al ser un modelo de difusión con arquitectura no estándar, es probable que las herramientas habituales (vLLM, llama.cpp, etc.) no lo soporten sin adaptaciones.
- Contexto largo no garantizado: aunque declara 262 144 tokens de contexto, no se ha demostrado que el modelo utilice eficazmente toda la ventana en tareas reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/modilify/Modilify-Mk1
- Versión Preview: https://huggingface.co/modilify/Modilify-Mk1-preview
- Licencia: https://huggingface.co/modilify/Modilify-Mk1/blob/main/LICENSE (enlace inferido a partir de la model card)

No se han encontrado papers, repositorios de código ni demos adicionales en la información proporcionada.
