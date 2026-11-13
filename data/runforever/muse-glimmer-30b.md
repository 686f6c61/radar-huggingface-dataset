# Runforever/Muse-Glimmer-30B

## Resumen

Muse Glimmer-30B es un modelo de lenguaje causal denso de aproximadamente 29,6 mil millones de parámetros desarrollado por Meta Superintelligence Lab, publicado en agosto de 2026 bajo licencia Apache 2.0. Se distribuye en Hugging Face a través del repositorio `Runforever/Muse-Glimmer-30B`, con pesos en safetensors y compatibilidad con la librería transformers. El modelo combina un transformer causal denso con un codificador de percepción dedicado (ViT-G/14 de ~1,8B parámetros), lo que le permite aceptar entradas intercaladas de texto e imagen y producir salidas de texto.

El objetivo declarado del modelo es la ejecución de tareas agénticas autónomas en hardware de consumo: razonamiento multi-paso, uso fiable de herramientas, recuperación ante fallos y comprensión multimodal, todo ello sin depender de infraestructura en la nube. Para ello incorpora una ventana de contexto de 131.072 tokens o más, un patrón de atención híbrido local/global con ventana deslizante de 2.048 tokens, y decodificación especulativa mediante un modelo "drafter" basado en DFlash que predice bloques de 16 tokens.

Su relevancia actual radica en la combinación de tres factores poco habituales en modelos de este tamaño: cuantización a 4 bits validada con degradación mínima (0,2%–1,0% en 15 benchmarks), velocidades de generación de hasta 233 tok/s en una RTX 5090 con especulación, y entrenamiento multilingüe en más de 100 idiomas. El corte de conocimiento es el 4 de enero de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con codificador de percepción (ViT-G/14) |
| Parametros totales | 29.776.626.688 (~29,6B, incluye codificador visual) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072+ tokens |
| Tipos de cuantizacion | Full precision, K-Quant-Dynamic (~32 GB VRAM), K-Quant-17GB (~24 GB VRAM); pesos a ~4 bits |
| Idiomas soportados | Más de 100 idiomas (según model card); lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 59,6 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso de 52 capas con dimensión oculta de 6.656, FFN de tipo SwiGLU con dimensión intermedia de 19.968, y un patrón de atención repetido [Local, Local, Local, Global] con ventana deslizante de 2.048 tokens. Usa atención con compuertas (gated attention), GQA con ratio 16:1 (32 cabezas de consulta y 2 de clave/valor), dimensión de cabeza de 128 y codificación posicional RoPE con θ = 500.000 aplicada solo en las capas locales. El vocabulario es de 202.048 tokens (200.000 BPE + 2.048 especiales). El codificador de percepción es un ViT-G/14 de ~1,8B parámetros, 50 capas, anchura 1.536 y tamaño de parche 14, con un máximo de 4.096 tokens visuales por imagen.

Los datos de entrenamiento son contenido multimodal de fuentes públicas, datos de terceros e información de productos y servicios de Meta, curados y enriquecidos por redes de proveedores externos y personal de Meta. La model card no especifica el número de tokens de entrenamiento ni detalla si hubo RLHF o DPO. El modelo se describe como destilado de Muse Spark y está optimizado para despliegue local mediante cuantización y decodificación especulativa. El drafter DFlash tiene 5 capas, tamaño de bloque de 16, atención de ventana deslizante de 2.048 en todas las capas, 32 cabezas de consulta y 8 de clave/valor, y capas de características ocultas uniformes sobre las capas {1, 13, 25, 37, 49} de las 52 del modelo principal.

## Capacidades

- Generación de texto y razonamiento multi-paso sobre horizontes largos, con planes coherentes en flujos de trabajo extendidos.
- Comprensión multimodal de entrada: texto e imágenes intercalados (capturas de pantalla, gráficos, documentos) mediante el codificador de percepción.
- Uso fiable de herramientas y function calling con esquemas precisos a lo largo de flujos prolongados.
- Recuperación ante fallos: diagnostica errores en llamadas a herramientas y reintenta en lugar de detenerse.
- Compatibilidad con scaffolds de agentes como OpenClaw, Hermes Agent y otros patrones de orquestación.
- Esfuerzo de razonamiento controlable, con distintos niveles de intensidad para equilibrar calidad y velocidad.
- Multilingüe: entrenado con datos de más de 100 idiomas.
- Decodificación especulativa integrada mediante drafter DFlash para acelerar la generación.
- Capacidad de ejecución local sin infraestructura en la nube ni acceso a red.

## Casos de uso

- Agentes autónomos de resolución de tareas: el modelo puede operar dentro de scaffolds como OpenClaw o Hermes Agent para completar flujos de trabajo de extremo a extremo, incluyendo escritura y depuración de código, gracias a su contexto de 131.072 tokens y su capacidad de razonamiento multi-paso.
- Automatización de soporte técnico con imágenes: al aceptar capturas de pantalla y documentos junto al texto, puede interpretar el estado de una aplicación mostrado en una imagen y responder con instrucciones o acciones concretas.
- Ingeniería de software asistida: con soporte de tool calling y recuperación ante fallos, puede integrarse en pipelines de CI/CD para invocar herramientas de compilación, leer resultados de tests y reintentar correcciones cuando una llamada falla.
- Análisis de documentos y gráficos: el codificador ViT-G/14 permite extraer información de gráficos y documentos escaneados en flujos de análisis de datos o generación de informes.
- Despliegue en estación de trabajo local: con la cuantización K-Quant-17GB cabe en GPUs de 24 GB y permite interacción en tiempo real (hasta 233 tok/s en RTX 5090 con especulación), adecuado para entornos con requisitos de privacidad o sin conectividad.
- Asistentes multilingües: al estar entrenado en más de 100 idiomas, puede gestionar conversaciones multi-turno en distintos idiomas dentro de una misma sesión.
- Prototipado de agentes en portátiles: las velocidades medidas en Apple M4 Max (37,8 tok/s con especulación) y M5 Max (50,2 tok/s) permiten ejecutar agentes de forma fluida en hardware de consumo.

## Benchmarks y rendimiento

La model card menciona evaluación en DeepSearch QA, MCP-Atlas, τ3-Bench y SWE-Bench, pero no publica los valores numéricos obtenidos en dichos benchmarks. Los únicos datos cuantitativos disponibles son los de degradación por cuantización y velocidad de generación.

| Metrica | Full precision | K-Quant-Dynamic | K-Quant-17GB |
|---|---|---|---|
| Degradación (% en 15 benchmarks) | — | 0,2% | 1,0% |
| Hardware objetivo | 64 GB VRAM | 32 GB VRAM | 24 GB VRAM |

| GPU | Sin especulación (tok/s) | Con DFlash (tok/s) | Aceleración |
|---|---|---|---|
| Nvidia RTX 5090 | 74,9 | 233,4 | 3,1x |
| Apple M4 Max | 23,7 | 37,8 | 1,5x |
| Apple M5 Max | 26,6 | 50,2 | 1,8x |

Mediciones con batch size 1 y decodificación greedy. No se han publicado resultados numéricos de benchmarks de calidad en la información disponible.

## Requisitos de hardware

- VRAM estimada: 64 GB para precisión completa; 32 GB para K-Quant-Dynamic; 24 GB para K-Quant-17GB.
- GPU recomendadas: Nvidia RTX 5090 (medida oficialmente), GPUs de 24 GB o 32 GB para las variantes cuantizadas, y GPUs de 64 GB para precisión completa.
- Cabe en GPU de consumo: sí, en RTX 5090 y en GPUs de 24 GB o más con la cuantización K-Quant-17GB. También funciona en Apple Silicon (M4 Max, M5 Max medidos).
- Opciones de despliegue: transformers (librería declarada), endpoints compatibles según los tags del repositorio. No se especifican integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: hasta 233,4 tok/s en RTX 5090 con especulación DFlash (3,1x sobre 74,9 tok/s sin ella); 37,8 tok/s en M4 Max y 50,2 tok/s en M5 Max con especulación.

## Comparativa con modelos similares

No se dispone de datos de rendimiento numérico del modelo ni de especificaciones verificables de alternativas concretas en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Muse Glimmer-30B | ~29,6B (denso) | 131.072+ | Apache 2.0 | Hugging Face (transformers, safetensors) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se han publicado resultados numéricos de benchmarks de calidad, lo que impide verificar de forma independiente el rendimiento declarado en tareas agénticas.
- La model card no detalla la composición del dataset de entrenamiento ni si se aplicaron técnicas de alineación como RLHF o DPO, lo que limita la evaluación de sesgos.
- Riesgo de alucinación inherente a los modelos de lenguaje generativos; no se documentan medidas específicas de mitigación.
- La lista concreta de idiomas soportados no está disponible, solo la afirmación de más de 100 idiomas.
- El corte de conocimiento es el 4 de enero de 2026; la información posterior no está cubierta.
- La cuantización K-Quant-17GB introduce una degradación del 1,0% en 15 benchmarks, aceptable según el autor pero no nula.
- Aunque la licencia es Apache 2.0, los datos de entrenamiento incluyen información de productos y servicios de Meta, lo que puede plantear consideraciones adicionales en despliegues comerciales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor del repositorio (`Runforever`) no coincide con el autor declarado en la model card (Meta Superintelligence Lab), lo que conviene verificar antes de usar los pesos en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Runforever/Muse-Glimmer-30B
- Paper del codificador de percepción: https://arxiv.org/abs/2504.13181
- Paper de DFlash (decodificación especulativa por bloques): https://arxiv.org/abs/2602.06036
- Referencia adicional citada en los tags: https://arxiv.org/abs/2610.24628
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
