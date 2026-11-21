# RedHatAI/Muse-Glimmer-30B

## Resumen

Muse Glimmer-30B es un modelo de lenguaje causal de aproximadamente 29,6 mil millones de parámetros desarrollado por Meta Superintelligence Lab, distribuido y validado para producción por Red Hat AI bajo licencia Apache 2.0. Se trata de un transformer causal denso con un codificador de percepción dedicado (ViT-G/14 de unos 1,8B de parámetros), destilado a partir de Muse Spark y diseñado específicamente para tareas agénticas autónomas sobre hardware de consumo. La fecha de lanzamiento indicada es agosto de 2026 y el corte de conocimiento es el 4 de enero de 2026.

El modelo resuelve el problema de ejecutar agentes multimodales fiables en local, sin infraestructura de nube ni acceso a red: combina razonamiento multi-paso, uso de herramientas con esquemas precisos, comprensión de imágenes intercaladas con texto y recuperación ante fallos de herramientas en un único modelo. Su ventana de contexto supera los 131.072 tokens y emplea un patrón de atención híbrido local/global con ventana deslizante de 2048 tokens.

Su relevancia actual radica en la combinación de tres elementos: cuantización a 4 bits que reduce el modelo a menos de 20 GB (cabe en GPUs de 24 GB y 32 GB con degradación medida del 1,0% y 0,2% respectivamente), decodificación especulativa mediante un drafter DFlash basado en difusión de bloques, y compatibilidad con scaffolds agénticos como OpenClaw y Hermes Agent. Red Hat AI lo valida sobre RHOAI 3.5.1, RHAIIS 3.6.0-fast.2 y vLLM 0.28.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con codificador de percepción (ViT-G/14) |
| Parametros totales | 29.776.626.688 (~29,6B, incluye encoder de visión) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131.072+ tokens |
| Tipos de cuantizacion | Full precision, K-Quant-Dynamic (~32 GB VRAM), K-Quant-17GB (~24 GB VRAM); pesos en safetensors |
| Idiomas soportados | Entrenado con datos de más de 100 idiomas; lista específica no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

Otras especificaciones: dimensión oculta 6656, 52 capas, patrón de atención [Local, Local, Local, Global] repetido, ventana deslizante 2048, atención con compuertas (gated attention), 32 cabezas de query y 2 de KV (GQA 16:1), dimensión de cabeza 128, FFN SwiGLU con dimensión intermedia 19.968, RoPE con theta 500.000 aplicado solo en capas locales, vocabulario de 202.048 tokens (200.000 BPE + 2.048 especiales), máximo de 4.096 tokens visuales por imagen. Tamaño del repositorio: 59,6 GB.

## Arquitectura y entrenamiento

El modelo es un transformer causal denso de 52 capas con un patrón de atención que alterna tres capas locales (ventana deslizante de 2048 tokens) por cada capa global, lo que reduce el coste de atención en contextos largos manteniendo capacidad de recuperación global. Emplea gated attention, GQA con ratio 16:1 y RoPE únicamente en las capas locales. El codificador de percepción es un ViT-G/14 de 50 capas, anchura 1536 y patch size 14, de aproximadamente 1,8B parámetros, que permite entradas intercaladas de texto e imagen con hasta 4.096 tokens visuales por imagen.

Los datos de entrenamiento provienen de contenido multimodal de fuentes públicas, datos de terceros e información de productos y servicios de Meta, curados y enriquecidos por redes de proveedores externos y personal de Meta. El modelo es una destilación de Muse Spark. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. Entre las innovaciones técnicas destacan la decodificación especulativa con un drafter DFlash de difusión de bloques (5 capas, bloques de 16 tokens, atención de ventana deslizante en todas las capas, 32 cabezas de query y 8 de KV, capas de características ocultas uniformes sobre las capas {1, 13, 25, 37, 49} del modelo objetivo) y el control de esfuerzo de razonamiento para ajustar calidad frente a velocidad.

## Capacidades

- Generación de texto y razonamiento multi-paso sobre horizontes largos, con planes coherentes en flujos de trabajo extendidos.
- Comprensión multimodal de entrada: interpreta capturas de pantalla, gráficos y documentos junto con la conversación (salida solo texto).
- Uso fiable de herramientas y function calling con esquemas precisos a lo largo de flujos prolongados; parser de tool calls `muse_glimmer`.
- Recuperación ante fallos: diagnostica errores de herramientas y reintenta en lugar de detenerse.
- Ejecución agéntica de extremo a extremo dentro de scaffolds (OpenClaw, Hermes Agent y otros patrones de orquestación).
- Escritura y depuración de código en el contexto de tareas SWE-Bench.
- Multilingüe: entrenado con datos de más de 100 idiomas.
- Esfuerzo de razonamiento controlable para equilibrar calidad y latencia.
- Compatible con endpoints (`endpoints_compatible`) y con los argumentos de CLI `--generation-config auto` y `--enable-auto-tool-choice`.

## Casos de uso

- Agentes de automatización de escritorio: el modelo puede interpretar capturas de pantalla mediante el encoder de percepción y emitir llamadas a herramientas para operar interfaces, encadenando pasos con contexto de 131.072 tokens.
- Resolución automática de incidencias de software: integrado en scaffolds tipo SWE-Bench, escribe parches, ejecuta tests y depura fallos de forma iterativa, con recuperación ante errores de herramientas.
- Orquestación de servidores MCP: con soporte de tool calling validado en vLLM 0.28.0 y RHAIIS, gestiona flujos multi-herramienta con esquemas estrictos en entornos empresariales on-premise.
- Búsqueda profunda y síntesis documental: procesa documentos e imágenes intercaladas y mantiene planes de búsqueda multi-paso (DeepSearch QA) para informes con citas.
- Asistente de atención al cliente con contexto largo: gestiona conversaciones multi-turno y consulta sistemas internos vía function calling, ejecutándose localmente sin salida a red.
- Despliegue en estaciones de trabajo con GPU de consumo: la variante K-Quant-17GB corre en 24 GB de VRAM y permite agentes locales en RTX 4090 o RTX 5090, útil en entornos con requisitos de soberanía de datos.
- Automatización de análisis de datos visuales: interpreta gráficos y tablas en imágenes y genera código de análisis o resúmenes ejecutivos.

## Benchmarks y rendimiento

La model card menciona evaluación en DeepSearch QA, MCP-Atlas, τ3-Bench y SWE-Bench, pero no publica cifras concretas en la información disponible. Sí se documenta la degradación por cuantización medida como media de precisión sobre 15 benchmarks comunes:

| Configuracion | Precision | Degradacion | Hardware objetivo |
|---|---|---|---|
| Full precision | — | — | 64 GB VRAM |
| K-Quant-Dynamic | ~4 bits | 0,2% | 32 GB VRAM |
| K-Quant-17GB | ~4 bits | 1,0% | 24 GB VRAM |

No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: 64 GB en precisión completa; aproximadamente 32 GB con K-Quant-Dynamic; aproximadamente 17-20 GB de pesos con K-Quant-17GB, dejando margen para KV cache, encoder de percepción y drafter dentro de 24 GB.
- GPUs recomendadas: A100 80 GB o H100 para precisión completa; RTX 5090 (32 GB) para K-Quant-Dynamic; RTX 4090 (24 GB) para K-Quant-17GB.
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 5090 con las cuantizaciones K-Quant; también se reportan mediciones en MacBook M4-Max y M5-Max.
- Despliegue: transformers, vLLM 0.28.0 (validado), RHOAI 3.5.1 y RHAIIS 3.6.0-fast.2; requiere `--generation-config auto` y `--enable-auto-tool-choice` para tool calling. Soporte de llama.cpp, Ollama o TGI no disponible en la información.
- Latencia y throughput: la model card afirma velocidad práctica con decodificación especulativa DFlash en M4-Max, M5-Max y RTX 5090, pero no se proporcionan cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Despliegue local |
|---|---|---|---|---|---|
| Muse Glimmer-30B | ~29,6B (denso) + 1,8B vision | 131.072+ | Texto + imagen de entrada | Apache 2.0 | Sí, desde 24 GB VRAM |
| Mistral-Medium-3.5-128B (RedHatAI) | 128B | No disponible | No disponible | No disponible | Requiere hardware de mayor capacidad |
| diffusiongemma-26B-A4B-it (RedHatAI) | 26B totales / 4B activos (MoE) | No disponible | No disponible | No disponible | Variantes NVFP4 y FP8 |

Los datos de los modelos comparables provienen únicamente de los listados de RedHatAI en Hugging Face; no se dispone de información sobre su rendimiento relativo ni de benchmarks comparativos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos: el entrenamiento con datos de productos y servicios de Meta y de proveedores externos puede introducir sesgos de dominio y de idioma; no se documenta una evaluación de sesgos.
- Alucinación: no se publican tasas de alucinación ni evaluaciones de fidelidad; el uso agéntico con herramientas amplifica el impacto de errores en cadena.
- Contexto e idioma: aunque se entrenó con más de 100 idiomas, no se especifica la lista ni la calidad por idioma; el rendimiento en castellano no está documentado.
- Licencia: Apache 2.0 permite uso comercial, pero la model card no detalla obligaciones de atribución adicionales ni restricciones de uso aceptable.
- Producción: la cuantización K-Quant-17GB introduce un 1,0% de degradación media; el tool calling requiere argumentos de CLI específicos y parser `muse_glimmer`, lo que limita la portabilidad a otros servidores de inferencia.
- La fecha de corte de conocimiento (4 de enero de 2026) implica ausencia de información posterior en tareas que dependan de conocimiento factual reciente.
- El repositorio tiene 904 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria todavía escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RedHatAI/Muse-Glimmer-30B
- Model card (README): https://huggingface.co/RedHatAI/Muse-Glimmer-30B/blob/main/README.md
- Organización RedHatAI: https://huggingface.co/RedHatAI
- Catálogo de modelos RedHatAI: https://huggingface.co/RedHatAI/models
- Paper del encoder de percepción: https://arxiv.org/abs/2504.13181
- Paper de DFlash (drafter de difusión de bloques): https://arxiv.org/abs/2602.06036
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Texto de la licencia: https://choosealicense.com/licenses/apache-2.0/
