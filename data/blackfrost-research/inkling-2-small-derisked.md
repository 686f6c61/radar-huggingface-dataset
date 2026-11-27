# Blackfrost-Research/Inkling-2-Small-Derisked

## Resumen

Inkling-2-Small-Derisked es una modificación a nivel de pesos del modelo thinkingmachines/Inkling-2-Small, publicada por Blackfrost-Research como derivado para investigación controlada y evaluación interna. El modelo base es un transformer de mezcla de expertos (MoE) de 48 capas físicas, sin pasadas recurrentes, con 384 expertos enrutados por capa y top-8, y una ventana de contexto de 262.144 tokens. El derivado conserva la arquitectura, el tokenizador, la torre de visión, el módulo MTP y todos los pesos MoE del original; solo se alteran 18 tensores BF16 del escritor de atención (`attn.wo_ud.weight`) en las capas 20 a 37.

La modificación consiste en una proyección ortogonal de rango 1 en el espacio de salida del escritor de atención, con un factor α de 3,8, aplicada sobre una dirección calculada a partir de un corpus de 32 peticiones dañinas emparejadas con 32 seguras. El objetivo declarado es eliminar rechazos falsos y colas de evasión moral en peticiones ordinarias manteniendo un suelo de capacidad. Los expertos cuantizados no se tocan y no hay recuantización en ninguna parte del proceso.

La relevancia de esta ficha es doble: por un lado, documenta un caso poco habitual de publicación de un derivado con kit de duplicación completo, manifiestos SHA-256 por fichero y evidencia de captura de direcciones; por otro, ilustra los riesgos de gobernanza de los pesos abiertos, ya que el propio propósito del modelo es reducir las barreras de rechazo del original. El repositorio ocupa 393,6 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Inkling-2 MoE (`inkling2`), 48 capas físicas, sin pasadas de bucle |
| Parametros totales | 594.050.672.720 (cabeceras safetensors); la model card indica ~612B medidos y 594B / 17B activos según la ficha del proveedor |
| Parametros activos | 17B (dato de la ficha del proveedor, no verificado de forma independiente) |
| Longitud de contexto | 262.144 tokens, validado en servicio con la ventana completa |
| Tipos de cuantizacion | Cuantización nativa del proveedor: expertos de capas L0–39 en NVFP4, L40–47 en MXFP8; atención, normas, embeddings y visión en BF16. No se recuantiza en el derivado |
| Idiomas soportados | no disponible |
| Licencia | other (sujeta a los términos del release original de Thinking Machines) |
| Formato de pesos | safetensors (24 shards, index JSON), más `mtp.safetensors`; pensado para vLLM |

Otros datos técnicos relevantes: 384 expertos enrutados por capa con top-8 y sin expertos compartidos; atención con 48 cabezas de 128 dimensiones y 8 cabezas KV; 8 capas de atención completa y 40 capas con ventana deslizante de 1024 tokens (SWA-1024); decodificación especulativa DSpark con 7 tokens especulativos y módulo MTP preservado byte a byte.

## Arquitectura y entrenamiento

El modelo es un transformer MoE denso en capas pero disperso en activación: 48 capas físicas, 384 expertos enrutados por capa con selección top-8 y sin expertos compartidos, lo que da un ratio de activación muy bajo respecto al total. La atención combina 8 capas de atención completa con 40 capas de atención de ventana deslizante de 1024 tokens, una configuración habitual para abaratar el coste cuadrático en contextos largos manteniendo un pequeño conjunto de capas con visibilidad global. Incluye torre de visión y módulo MTP (multi-token prediction) para decodificación especulativa.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF, DPO) del modelo base en la documentación proporcionada; esos datos corresponden a la ficha de thinkingmachines/Inkling-2-Small, no incluida aquí. Lo que sí está documentado es el proceso del derivado: captura de direcciones sobre un corpus "hard32" de 32 peticiones dañinas más 32 seguras emparejadas con thinking activado, selección de banda en las capas 20–37 con p = 0,0005 en 2000 permutaciones y coseno split-half de 0,912–0,975, y edición final mediante `W := W − α·W@(q qᵀ)` con q la dirección unitaria dañino−seguro y α = 3,8, aplicada solo a los 18 tensores BF16 del escritor de atención. La innovación técnica del derivado es, por tanto, de intervención conductual, no arquitectónica: no hay cambios en tokenizador, configuración, valores por defecto de generación, torre de visión ni módulo MTP.

## Capacidades

- Generación de texto conversacional multi-turno, con ventana de 262.144 tokens validada en servicio.
- Razonamiento y matemáticas: el modelo base incluye modo thinking (la captura de direcciones del derivado se hizo con thinking ON), aunque no se publican resultados de benchmarks en la información disponible.
- Codificación: no hay evidencia específica en la documentación proporcionada; la capacidad depende del modelo base.
- Visión: la torre de visión se preserva byte a byte respecto al original, por lo que el modelo conserva entrada multimodal de imagen.
- Decodificación especulativa con DSpark y 7 tokens especulativos, con módulo MTP intacto y validado extremo a extremo.
- Comportamiento modificado: reducción de rechazos falsos y de colas de evasión moral en peticiones ordinarias, con un suelo de capacidad declarado por el autor.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Investigación sobre alineación y rechazos: el modelo sirve como punto de comparación controlado frente al original para estudiar cómo una edición de rango 1 en el escritor de atención altera la tasa de rechazos sin tocar los expertos. Es adecuado porque el autor publica la receta completa, el corpus de captura y la evidencia de selección de banda.
- Duplicación y auditoría de intervenciones conductuales: con el kit `DWM_RECIPE/` y los manifiestos SHA-256 se puede reproducir la edición sobre los 18 tensores y verificar que los otros 16 shards son idénticos al upstream, lo que permite auditar la metodología en un entorno interno.
- Evaluación interna de despliegue con vLLM: el repositorio incluye un comando de servicio validado y una compilación nocturna de vLLM fijada por digest, útil para probar la pila DSpark más MTP en un entorno de laboratorio antes de adoptarla en producción.
- Análisis de seguridad de pesos abiertos: estudiar qué superficies de pesos (en este caso, el escritor de atención BF16) concentran el comportamiento de rechazo informa a los equipos de gobernanza sobre qué tensores conviene monitorizar o firmar en releases públicos.
- Procesamiento de documentos largos con componente visual: la ventana de 262.144 tokens y la torre de visión preservada permiten experimentar con tareas de extracción y resumen sobre documentos extensos con figuras, siempre en un entorno controlado.
- Comparación de metodologías de edición: contrastar la edición OUT-space de rango 1 de este modelo con otras técnicas de modificación conductual (ablación de direcciones, steering en activaciones, fine-tuning de rechazo) usando el mismo corpus hard32 como referencia.

## Benchmarks y rendimiento

El autor declara una batería de 443 filas completada para el artefacto final α3.8 (443/443 generadas, 0 errores, 0 truncamientos), pero no se incluyen los resultados numéricos en la información proporcionada. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 393,6 GB en safetensors con la cuantización nativa (expertos NVFP4/MXFP8, atención y visión BF16). Se necesita un nodo multi-GPU con al menos ~400 GB de memoria agregada solo para los pesos, más espacio para caché KV de una ventana de 262.144 tokens, que con 8 cabezas KV y 128 dimensiones por cabeza resulta muy exigente.
- GPU recomendadas: no hay una lista publicada en la información disponible; por el tamaño del artefacto, el despliegue realista pasa por nodos de 8 GPU de clase H100/H200 o B200 con NVLink. No se documentan configuraciones concretas.
- GPU de consumo: no cabe en ninguna GPU de consumo individual (RTX 4090, 24 GB) ni en configuraciones de dos o cuatro tarjetas de consumo.
- Opciones de despliegue: vLLM (compilación nocturna fijada por digest) con decodificación especulativa DSpark; el repositorio incluye un kit de despliegue con instrucciones de agente y el comando de servicio exacto validado. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Inkling-2-Small-Derisked (este) | 594B totales / 17B activos | 262.144 | other | Pesos safetensors en HF, 393,6 GB | Derivado conductual con 18 tensores modificados |
| thinkingmachines/Inkling-2-Small (base) | 594B totales / 17B activos | 262.144 | other | Pesos en HF | Modelo original sin modificación conductual |
| Inkling-2-Mini-Derisked | no disponible | no disponible | other | Pesos en HF | Hermano menor del mismo autor, transformer con bucles; la model card lo cita como referencia |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada, por lo que la comparativa se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- El propósito declarado del modelo es reducir rechazos y evasión moral en peticiones ordinarias; esto puede degradar la tasa de rechazo ante peticiones que sí deberían rechazarse. No se publican métricas de seguridad comparativas frente al original en la información disponible.
- La licencia es "other" y remite a los términos del release original de Thinking Machines; no se detallan aquí las restricciones de uso comercial. Verificar la licencia upstream antes de cualquier despliegue productivo.
- El autor indica acceso privado tipo NDA para la receta de duplicación; el kit se distribuye en el repositorio, pero su uso puede estar sujeto a condiciones adicionales no reflejadas en la model card.
- Riesgo de alucinación: no cuantificado en la información disponible; aplican los riesgos habituales de un modelo de 594B parámetros sin benchmarks publicados en esta ficha.
- Idiomas soportados no documentados; no se puede garantizar calidad fuera de los idiomas del modelo base.
- El repositorio no registra descargas ni interacciones, y el pipeline no está declarado; la madurez de la pila de servicio (vLLM nocturno) implica riesgo de regresiones en producción.
- La modificación se limita a 18 tensores BF16; cualquier comportamiento alterado fuera de esa superficie no está cubierto por la evidencia del autor.
- El tamaño del artefacto (393,6 GB) y la ventana de 262.144 tokens hacen inviable el despliegue en hardware de consumo y encarecen la caché KV en servicio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Blackfrost-Research/Inkling-2-Small-Derisked
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Repositorio de vLLM (compilación nocturna usada por el autor): https://github.com/vllm-project/vllm
- No se han encontrado en la búsqueda web papers, blogs, demos ni repositorios adicionales asociados a este modelo.
