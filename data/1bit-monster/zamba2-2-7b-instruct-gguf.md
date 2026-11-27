# 1bit-MONSTER/Zamba2-2.7B-instruct-GGUF

## Resumen

Zamba2-2.7B-instruct-GGUF es una conversión al formato GGUF del modelo Zamba2-2.7B-instruct desarrollado por Zyphra, publicada por el usuario 1bit-MONSTER. Se trata de un modelo conversacional de arquitectura híbrida que combina capas Mamba-2 con bloques transformer compartidos, una propuesta que busca reducir el coste computacional del mecanismo de atención clásico manteniendo la calidad de generación de un transformer convencional. El modelo base tiene 3.828.481.440 parámetros reales según los pesos en safetensors, pese a la denominación comercial "2.7B".

La relevancia de esta ficha radica en que el GGUF permite ejecutar un modelo híbrido Mamba-2 en infraestructura de inferencia basada en llama.cpp, algo que hasta hace poco requería parches específicos. La conversión la realiza el proyecto 1bit engine, que mantiene un fork de llama.cpp con soporte para Zamba2, una implementación Vulkan del escaneo Mamba-2 adaptada al tamaño de estado de este modelo y una corrección del conversor que asignaba una puntuación de -1000 a todos los tokens.

El modelo se distribuye en una única cuantización Q8_0, con licencia Apache 2.0 heredada del modelo base, y está orientado a uso conversacional. No se dispone de información publicada sobre idiomas soportados ni sobre resultados de benchmarks en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: capas Mamba-2 con bloques transformer compartidos |
| Parametros totales | 3.828.481.440 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 (única incluida en el repositorio) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `Zamba2-2.7B-instruct-Q8_0.gguf`) |

## Arquitectura y entrenamiento

La arquitectura de Zamba2 combina capas de espacio de estado Mamba-2 con bloques transformer que se comparten entre distintas profundidades de la red. Este diseño híbrido persigue un doble objetivo: por un lado, aprovechar la eficiencia lineal de Mamba-2 en la modelización de secuencias largas; por otro, retener la capacidad de atención global que aportan los bloques transformer, reutilizando sus pesos para reducir el número total de parámetros. El repositorio no documenta el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO sobre el modelo base.

La conversión a GGUF la realiza el proyecto 1bit engine mediante un fork de llama.cpp que incorpora el código del modelo Zamba2 (referencia ggml-org/llama.cpp#21412). Ese fork añade además un kernel de escaneo Mamba-2 para Vulkan ajustado al tamaño de estado del modelo y corrige un error del conversor que asignaba -1000 a la puntuación de todos los tokens. La validación reportada indica que la tokenización del GGUF coincide con la del tokenizador original tras aplicar la corrección, y que las respuestas de chat son correctas.

## Capacidades

- Generación de texto conversacional en formato chat, validada por el autor de la conversión.
- Razonamiento multi-turno propio de un modelo ajustado para instrucciones.
- Arquitectura híbrida Mamba-2/transformer, adecuada para secuencias largas por el coste lineal de las capas de estado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el repositorio no declara lista de idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Asistente conversacional local: el modelo puede desplegarse en una estación de trabajo con GPU de consumo usando el GGUF Q8_0 y el fork de llama.cpp con soporte Zamba2, sin depender de servicios en la nube.
- Prototipado de aplicaciones de chat: al ser un modelo de 3.800 millones de parámetros, permite iterar rápidamente en el diseño de prompts y flujos conversacionales con un coste de inferencia bajo.
- Evaluación de arquitecturas híbridas: útil para investigadores que quieran comparar el comportamiento de un modelo Mamba-2/transformer frente a transformers puros del mismo orden de magnitud en tareas de generación.
- Procesamiento de documentos largos: las capas Mamba-2 reducen el coste por token en secuencias extensas, lo que lo hace apropiado para resumen y extracción sobre textos de varios miles de tokens, siempre que se confirme la ventana de contexto efectiva.
- Despliegue en hardware AMD vía Vulkan: la conversión incluye un kernel Vulkan específico y mediciones en una Radeon 8060S, lo que facilita su uso en equipos con GPU integrada AMD.
- Base para ajuste fino o destilación: al estar bajo Apache 2.0 y en formato GGUF, puede servir como punto de partida para experimentos de cuantización adicional o para comparativas de calidad entre niveles de precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado por el autor de la conversión es una medición con `llama-bench` sobre Vulkan (Radeon 8060S) con cuantización Q8_0:

| Metrica | Valor |
|---|---|
| Prefill (pp256) | 1541 tok/s |
| Decode (tg64) | 45,2 tok/s |
| Plataforma | Vulkan, Radeon 8060S |

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 4,1 GB y contiene únicamente el archivo Q8_0, por lo que se necesita aproximadamente esa cantidad de memoria para cargar los pesos, más el espacio de trabajo para el contexto y el estado de las capas Mamba-2.
- GPU recomendadas: no hay una lista oficial; el autor reporta funcionamiento en una GPU integrada AMD Radeon 8060S vía Vulkan. Por tamaño, cabe en GPUs de consumo con 8 GB o más de VRAM.
- Cabe en GPU de consumo: sí, con 8 GB de VRAM es suficiente para el Q8_0, aunque el margen para contextos largos dependerá del tamaño de estado del modelo.
- Opciones de despliegue: llama.cpp mediante el fork de 1bit-MONSTER (requerido para Zamba2), el motor propio `1bit serve` con `--device hrx`, y cualquier runtime que incorpore el soporte Zamba2 de ggml-org/llama.cpp#21412.
- Latencia y throughput: 45,2 tok/s de decodificación y 1541 tok/s de prefill en Radeon 8060S con Vulkan y Q8_0, según la medición del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato disponible | Notas |
|---|---|---|---|---|---|
| Zamba2-2.7B-instruct (este GGUF) | 3.828.481.440 | No disponible | Apache 2.0 | GGUF Q8_0 | Híbrido Mamba-2 + transformer |
| Zyphra/Zamba2-2.7B-instruct (base) | 3.828.481.440 | No disponible | Apache 2.0 | Safetensors (original) | Requiere runtime con soporte Zamba2 |
| Alternativas de tamaño comparable | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa de rendimiento con modelos alternativos de la misma categoría.

## Limitaciones y advertencias

- El repositorio solo incluye la cuantización Q8_0; no hay versiones Q4, Q5 ni de menor precisión, lo que limita el despliegue en equipos con menos de 8 GB de VRAM.
- El modelo requiere un runtime con soporte específico para Zamba2 (fork de llama.cpp o motor 1bit); no funciona en versiones estándar de llama.cpp, Ollama o vLLM sin ese soporte.
- No se documentan los idiomas soportados ni la longitud de contexto, lo que impide garantizar un comportamiento correcto en castellano o en secuencias largas sin pruebas previas.
- No hay información sobre sesgos, datos de entrenamiento ni etapas de alineación (RLHF/DPO), por lo que el riesgo de alucinación y de respuestas sesgadas no puede acotarse con datos.
- La licencia Apache 2.0 permite uso comercial, pero cualquier uso en producción debería validar previamente la calidad del modelo base, no solo la de la conversión.
- El número de descargas (39) y la ausencia de likes indican una adopción muy baja; no hay evidencia comunitaria de robustez en producción.
- Las mediciones de rendimiento provienen de una única GPU (Radeon 8060S) y no son extrapolables a otros aceleradores.

## Enlaces

- Repositorio GGUF: https://huggingface.co/1bit-MONSTER/Zamba2-2.7B-instruct-GGUF
- Modelo base: https://huggingface.co/Zyphra/Zamba2-2.7B-instruct
- Motor 1bit: https://github.com/1bit-MONSTER/engine
- Fork de llama.cpp de 1bit-MONSTER: https://github.com/1bit-MONSTER/llama.cpp
- Pull request de soporte Zamba2 en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/21412
- Familias de modelos de 1bit-MONSTER: https://huggingface.co/1bit-MONSTER#families
