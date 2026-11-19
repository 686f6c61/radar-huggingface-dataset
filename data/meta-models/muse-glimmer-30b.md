# meta-models/Muse-Glimmer-30B

## Resumen

Muse Glimmer-30B es un modelo de lenguaje causal multimodal desarrollado por Meta Superintelligence Lab, publicado en agosto de 2026 bajo licencia Apache 2.0. Con aproximadamente 29.600 millones de parámetros, combina un transformer causal denso con un codificador de percepción dedicado de ~1.800 millones de parámetros (ViT-G/14), lo que le permite aceptar entradas intercaladas de texto e imagen y generar texto. Está destilado a partir de Muse Spark y diseñado específicamente para tareas agénticas autónomas ejecutadas en hardware de consumo, sin necesidad de infraestructura en la nube.

El modelo se orienta a la resolución de tareas de extremo a extremo: razonamiento multi-paso, uso fiable de herramientas con esquemas precisos, recuperación ante fallos de llamadas a herramientas y comprensión multimodal de capturas de pantalla, gráficos y documentos. Su ventana de contexto supera los 131.072 tokens, emplea un patrón de atención híbrido local/global con ventana deslizante de 2.048 tokens y atención con compuertas (gated attention), y utiliza GQA con una ratio de 16:1.

Su relevancia actual radica en la combinación de tamaño contenido, cuantización a 4 bits que reduce el modelo por debajo de 20 GB y decodificación especulativa mediante un drafter basado en DFlash, lo que permite ejecutarlo en GPUs de consumo de 24 GB o 32 GB con velocidades de hasta 233 tokens por segundo en una RTX 5090. Está entrenado en más de 100 idiomas y su corte de conocimiento es el 4 de enero de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con codificador de percepción (ViT-G/14) |
| Parametros totales | ~29,6B (incluye codificador visual de ~1,8B); 29.776.626.688 según safetensors |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131.072+ tokens |
| Tipos de cuantizacion | Full precision, K-Quant-Dynamic (32 GB VRAM), K-Quant-17GB (24 GB VRAM); pesos comprimidos a ~4 bits |
| Idiomas soportados | Más de 100 idiomas (entrenado en datos de más de 100 lenguas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal denso de 52 capas con dimensión oculta de 6.656, FFN de tipo SwiGLU con dimensión intermedia de 19.968, y un patrón de atención repetido [Local, Local, Local, Global] con ventana deslizante de 2.048 tokens. Emplea atención con compuertas y GQA con 32 cabezas de consulta y 2 de clave/valor (ratio 16:1), dimensión de cabeza de 128 y codificación posicional RoPE (θ = 500.000) aplicada solo en las capas locales. El vocabulario es de 202.048 tokens (200.000 BPE más 2.048 especiales). El codificador de percepción es un ViT-G/14 de ~1,8B parámetros, 50 capas, anchura 1.536 y tamaño de parche 14, con un máximo de 4.096 tokens visuales por imagen.

El modelo está destilado de Muse Spark y entrenado con contenido multimodal procedente de datos públicos, datos de terceros e información de productos y servicios de Meta, curado y enriquecido por redes de proveedores externos y personal de Meta. La model card no detalla el número exacto de tokens de entrenamiento ni si se aplicaron fases de RLHF o DPO. Entre las innovaciones técnicas destacan la decodificación especulativa mediante un drafter DFlash de difusión por bloques que predice bloques de 16 tokens en un solo paso forward (5 capas, atención deslizante de 2.048, 32 cabezas Q / 8 KV, capas de características ocultas uniformes sobre las capas {1, 13, 25, 37, 49} de 52) y el control de esfuerzo de razonamiento para ajustar calidad frente a velocidad.

## Capacidades

- Generación de texto y razonamiento multi-paso sobre horizontes largos, manteniendo planes coherentes en flujos de trabajo extendidos.
- Comprensión multimodal de entrada: acepta texto e imágenes intercaladas (capturas de pantalla, gráficos, documentos) mediante el codificador de percepción; la salida es solo texto.
- Uso fiable de herramientas y function calling con esquemas precisos a lo largo de flujos prolongados.
- Recuperación ante fallos: diagnostica errores de llamadas a herramientas y reintenta en lugar de detenerse.
- Compatibilidad con scaffolds de agentes como OpenClaw y Hermes Agent, además de otros patrones de orquestación.
- Razonamiento agéntico de extremo a extremo evaluado en DeepSearch QA, MCP-Atlas, τ3-Bench y SWE-Bench.
- Capacidades multilingües en más de 100 idiomas.
- Control de esfuerzo de razonamiento para equilibrar calidad y velocidad según la tarea.
- Ejecución local sin infraestructura de nube ni acceso a red.

## Casos de uso

- Agentes autónomos de resolución de incidencias de software: el modelo puede escribir y depurar código dentro de un scaffold, encadenar razonamiento multi-paso y recuperarse de fallos de herramientas, lo que encaja con su evaluación en SWE-Bench y su contexto de más de 131.000 tokens para mantener el estado de la tarea.
- Automatización de soporte técnico multi-turno: gestiona conversaciones largas con contexto extendido, interpreta capturas de pantalla enviadas por el usuario gracias al codificador visual y ejecuta llamadas a herramientas internas con esquemas precisos.
- Análisis de documentos y gráficos en local: al aceptar imágenes intercaladas con texto y ejecutarse sin conexión, es adecuado para procesar informes, tablas y diagramas en entornos con requisitos de privacidad.
- Orquestación de flujos MCP: su compatibilidad con MCP-Atlas y su uso fiable de herramientas permiten construir agentes que invocan servidores MCP de forma encadenada y con recuperación ante errores.
- Asistentes de escritorio en hardware de consumo: con la cuantización K-Quant-17GB cabe en 24 GB de VRAM y, junto al drafter cuantizado, alcanza velocidades fluidas en RTX 5090 y Apple M4/M5 Max para interacción en tiempo real.
- Búsqueda profunda y respuesta a preguntas: evaluado en DeepSearch QA, puede planificar consultas sucesivas, sintetizar evidencia y mantener coherencia en tareas de investigación de varios pasos.
- Generación de código asistida con control de esfuerzo: el ajuste del nivel de razonamiento permite elegir entre respuestas rápidas para autocompletado y razonamiento profundo para refactorizaciones complejas.

## Benchmarks y rendimiento

La model card menciona evaluación en DeepSearch QA, MCP-Atlas, τ3-Bench y SWE-Bench, pero no publica los valores numéricos de estos benchmarks en la información disponible.

| Metrica | Full Precision | K-Quant-Dynamic | K-Quant-17GB |
|---|---|---|---|
| Degradación (% sobre 15 benchmarks) | - | 0,2% | 1,0% |
| Hardware objetivo | 64 GB VRAM | 32 GB VRAM | 24 GB VRAM |

| GPU | Sin especulación (tok/s) | Con DFlash (tok/s) | Aceleración |
|---|---|---|---|
| Nvidia RTX 5090 | 74,9 | 233,4 | 3,1x |
| Apple M4 Max | 23,7 | 37,8 | 1,5x |
| Apple M5 Max | 26,6 | 50,2 | 1,8x |

Las mediciones de velocidad se realizaron con batch size 1 y decodificación greedy sobre el modelo K-Quant-17GB junto al drafter cuantizado.

## Requisitos de hardware

- VRAM estimada: 64 GB para precisión completa; 32 GB con K-Quant-Dynamic; 24 GB con K-Quant-17GB (el modelo de lenguaje comprimido a ~4 bits ocupa menos de 20 GB, dejando margen para KV cache, codificador visual y drafter).
- GPU recomendadas: Nvidia RTX 5090 (validada, 233,4 tok/s con especulación), configuraciones de 32 GB y 64 GB; Apple Silicon M4 Max y M5 Max validados en local.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB y 32 GB con las cuantizaciones K-Quant correspondientes.
- Opciones de despliegue: transformers (librería declarada), endpoints compatibles, despliegue en SageMaker y Azure según los tags del repositorio. No se especifican otros motores como vLLM, llama.cpp u Ollama en la información disponible.
- Latencia y throughput: 74,9 tok/s sin especulación y 233,4 tok/s con DFlash en RTX 5090; 23,7 y 37,8 tok/s en M4 Max; 26,6 y 50,2 tok/s en M5 Max, con batch size 1 y decodificación greedy.

## Comparativa con modelos similares

No se dispone de datos de benchmarks numéricos ni de especificaciones de modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Los modelos comparables de la misma categoría (transformers densos multimodales de ~30B orientados a agentes y despliegue local) no están identificados en la información disponible.

## Limitaciones y advertencias

- La model card no detalla sesgos conocidos; al entrenarse con datos públicos, de terceros y de productos de Meta, es previsible que herede sesgos presentes en esas fuentes.
- Riesgo de alucinación inherente a los modelos de lenguaje; la recuperación ante fallos de herramientas no elimina la posibilidad de generar contenido incorrecto.
- La salida es únicamente texto: no genera imágenes ni audio.
- El corte de conocimiento es el 4 de enero de 2026; la información posterior no está cubierta sin herramientas externas.
- La decodificación especulativa requiere el drafter DFlash; sin él, el rendimiento cae a los valores basales indicados (por ejemplo, 74,9 tok/s en RTX 5090).
- La cuantización K-Quant-17GB introduce una degradación media del 1,0% en 15 benchmarks, lo que debe tenerse en cuenta en producción.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de los datos de entrenamiento de terceros y de productos de Meta para cumplimiento normativo.
- No se especifican límites de idioma por debajo de los más de 100 idiomas declarados, ni restricciones de uso adicionales en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Paper del codificador de percepción: https://arxiv.org/abs/2504.13181
- Paper de DFlash (decodificación especulativa por difusión de bloques): https://arxiv.org/abs/2602.06036
- Paper adicional referenciado en los tags: https://arxiv.org/abs/2610.24628
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
