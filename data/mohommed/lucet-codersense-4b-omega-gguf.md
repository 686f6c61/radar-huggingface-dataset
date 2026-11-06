# mohommed/Lucet-CoderSense-4B-Omega-GGUF

## Resumen

Lucet-CoderSense-4B-Omega es un modelo multimodal de 4.112.079.360 parámetros, desarrollado por el usuario mohommed, que se presenta como un derivado afinado del modelo base XHToken/Spark-X2.6-4B. Se distribuye principalmente en formato GGUF (con un proyector multimodal `mmproj-model-f16.gguf`) y está orientado a tareas de razonamiento, generación de código, automatización de Blender 3D mediante MCP, creación de juegos HTML5 y uso como agente conversacional en tiempo real. La model card lo etiqueta con términos como "7-Sense", "System-1/System-2", "hybrid-attention", "vision" y "audio", aunque no se aportan detalles técnicos verificables sobre la mayoría de estas capacidades.

El modelo declara una arquitectura híbrida de atención con 27 capas de ventana deslizante (SWA) y 9 capas de atención global (GA), lo que según el autor permitiría un contexto de hasta 1 millón de tokens. El tamaño del repositorio (25,2 GB) corresponde a múltiples cuantizaciones GGUF del modelo de 4B, no a un modelo de mayor tamaño. La licencia es Apache 2.0 y el pipeline declarado es `image-text-to-text`.

La relevancia de este modelo es limitada y debe evaluarse con cautela: se trata de un modelo reciente (creado el 31 de octubre de 2026), con muy poca tracción (112 descargas, 0 likes) y cuya model card contiene afirmaciones de rendimiento sin metodología pública ni enlaces a evaluaciones reproducibles. Es útil como ejemplo de fine-tuning comunitario multimodal sobre una base pequeña, pero no debe considerarse un modelo de referencia para producción sin validación independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención de ventana deslizante (27 capas SWA) y atención global (9 capas GA); proyector multimodal para visión |
| Parámetros totales | 4.112.079.360 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.000.000 tokens (según model card; no verificado) |
| Tipos de cuantización | GGUF (el repo incluye varias cuantizaciones; no se detallan los niveles exactos) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con `mmproj-model-f16.gguf` para visión); el modelo base está en safetensors |

## Arquitectura y entrenamiento

La arquitectura declarada es un transformer híbrido que combina capas de atención de ventana deslizante (SWA) con capas de atención global (GA), en una proporción de 27 a 9. Este diseño busca reducir el coste computacional de la atención en secuencias largas manteniendo un subconjunto de capas con atención completa para preservar el acceso a información global. El autor afirma un contexto de 1 millón de tokens, aunque no se especifica la técnica de extensión de contexto empleada ni si se realizó entrenamiento específico para long-context. El modelo incluye un proyector multimodal (`mmproj-model-f16.gguf`) que habilita entrada de imagen en LM Studio y `llama.cpp`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. La model card menciona etiquetas como "System-1" y "System-2" (presumiblemente en referencia a modos de razonamiento rápido y lento), "7-Sense" y "J.A.R.V.I.S.", pero no se documenta cómo se implementan ni qué datos se usaron para entrenarlas. Tampoco se detalla el proceso de fine-tuning sobre el modelo base XHToken/Spark-X2.6-4B ni si se congelaron capas durante el ajuste.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte declarado para razonamiento y código.
- Generación de código y resolución de problemas de programación (la model card reporta MBPP pass@1 del 66,7 %).
- Razonamiento matemático simbólico (AIME reportado al 50,0 %).
- Entrada de imagen a texto (pipeline `image-text-to-text`) mediante el proyector multimodal incluido.
- Capacidades de audio mencionadas en las etiquetas ("audio"), aunque no se documenta su implementación ni se incluye proyector de audio en el repositorio.
- Integración con Blender 3D mediante MCP (Model Context Protocol) para generación de animaciones y escenas.
- Generación de juegos HTML5 (etiqueta "V8 HTML5 Game Studio").
- Soporte declarado de tool calling y function calling (etiqueta "endpoints_compatible").
- Modos "System-1" y "System-2" (razonamiento rápido y razonamiento extendido), sin documentación técnica.
- Capacidades multilingües: no disponibles; no se especifican idiomas.

## Casos de uso

- **Asistente de código en local**: el modelo puede integrarse en entornos de desarrollo mediante llama.cpp u Ollama para autocompletado y generación de funciones, aprovechando su tamaño de 4B y su cuantización GGUF para ejecución en hardware de consumo.
- **Automatización de Blender 3D**: mediante MCP, el modelo puede generar scripts de Python para Blender y orquestar la creación de escenas y animaciones sencillas, lo que resulta adecuado para prototipado rápido de contenido 3D.
- **Generación de prototipos de juegos HTML5**: el modelo puede producir código JavaScript/HTML5 para pequeños juegos o demos interactivas, útil en fases de ideación y pruebas de concepto.
- **Agente conversacional con visión**: gracias al proyector multimodal, puede describir imágenes o responder preguntas sobre capturas de pantalla en aplicaciones de asistencia técnica, siempre que se despliegue con LM Studio o llama.cpp.
- **Razonamiento matemático asistido**: para resolver problemas simbólicos de nivel competitivo (AIME reportado al 50 %), puede emplearse como apoyo en tutoría o verificación de soluciones, con revisión humana obligatoria.
- **Automatización de tareas con tool calling**: el modelo puede integrarse en pipelines de agentes que invocan APIs externas, aunque la falta de documentación sobre el formato de herramientas exige validación previa.
- **Despliegue en entornos con recursos limitados**: al ser un modelo de 4B en GGUF, puede ejecutarse en GPUs de consumo (por ejemplo, RTX 3060/4060 con cuantizaciones Q4) para tareas de generación de texto y código sin conexión.

## Benchmarks y rendimiento

Los únicos datos disponibles provienen de la model card del autor y no incluyen metodología, tamaño de muestra ni comparación con otros modelos. Se presentan tal cual, sin verificación independiente:

| Benchmark | Resultado reportado | Notas |
|---|---|---|
| MBPP pass@1 (held-out) | 66,7 % | 81 tokens de media |
| AIME (matemáticas simbólicas) | 50,0 % | Sin detalle de configuración |
| Anti-alucinación epistémica | 75,0 % (desde 12,5 %) | Métrica no estándar, sin definición pública |
| HTML5 Game Studio (V8) | "VERIFIED" | Sin métrica numérica |
| Blender 3D Cartoon Animator | "PASSED" | Sin métrica numérica |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. No se deben extrapolar los datos anteriores a otros contextos sin replicación.

## Requisitos de hardware

- **VRAM estimada para inferencia**: para un modelo de 4,1B en GGUF, se estima aproximadamente 2,5-3 GB en cuantización Q4_K_M, 3,5-4 GB en Q5_K_M y 5-6 GB en Q8_0, incluyendo overhead de contexto. Para contexto largo (1M tokens) el consumo de KV cache crece significativamente y puede superar los 8-16 GB según la implementación.
- **GPU recomendadas**: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB para contexto largo; A100 40/80 GB o H100 para despliegues con contexto completo y concurrencia.
- **¿Cabe en GPU de consumo?**: sí, en cuantizaciones Q4/Q5 cabe en GPUs con 6-8 GB de VRAM para contexto moderado; para contexto de 1M se requiere hardware de gama alta o técnicas de atención eficiente.
- **Opciones de despliegue**: llama.cpp, LM Studio (con `mmproj-model-f16.gguf` para visión), Ollama (previa conversión), y potencialmente vLLM/TGI si se dispone de los pesos en safetensors del modelo base.
- **Latencia y throughput**: no disponibles. No se han publicado mediciones de tokens por segundo ni latencia por petición.

## Comparativa con modelos similares

No se dispone de datos verificables de rendimiento para comparar directamente con alternativas. Se ofrece una comparación estructural con modelos de tamaño similar:

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lucet-CoderSense-4B-Omega | 4,1B | 1M (declarado) | Apache 2.0 | GGUF | Multimodal declarado, poca documentación |
| Qwen2.5-Coder-3B | 3,1B | 32K | Apache 2.0 | Safetensors, GGUF | Ampliamente validado en código |
| Llama-3.2-3B | 3,2B | 128K | Llama 3.2 Community | Safetensors, GGUF | Multilingüe, ecosistema maduro |
| Phi-3.5-mini | 3,8B | 128K | MIT | Safetensors, GGUF | Razonamiento y código, bien documentado |

La comparación de rendimiento no está disponible porque el autor no publica resultados en benchmarks estándar comparables. La principal diferencia de Lucet-CoderSense es su contexto declarado de 1M y su enfoque multimodal/agente, pero carece de la validación comunitaria de las alternativas citadas.

## Limitaciones y advertencias

- **Datos de rendimiento no verificados**: los benchmarks de la model card no incluyen metodología, muestras ni enlaces a evaluaciones reproducibles; deben tratarse como afirmaciones del autor.
- **Riesgo de alucinación**: la propia model card reporta un 75 % en una métrica "anti-alucinación" no estándar, lo que implica que un 25 % de los casos evaluados no superaron el criterio; en producción se requiere verificación factual.
- **Contexto de 1M no confirmado**: no se documenta la técnica de extensión de contexto ni se aportan pruebas de recuperación efectiva en secuencias largas; el rendimiento en contextos de 1M puede degradarse.
- **Idiomas no especificados**: no se indica qué idiomas soporta ni su calidad relativa; el uso en castellano no está garantizado.
- **Capacidades de audio no documentadas**: la etiqueta "audio" aparece pero no se incluye proyector ni instrucciones de uso.
- **Sesgos desconocidos**: no se ha publicado ninguna evaluación de sesgos, toxicidad o seguridad.
- **Licencia Apache 2.0**: permite uso comercial, pero el modelo base XHToken/Spark-X2.6-4B puede tener condiciones adicionales que no se detallan; conviene verificar la licencia del modelo base antes de desplegar.
- **Ecosistema inmaduro**: 112 descargas y 0 likes indican falta de validación comunitaria; no hay informes de terceros sobre su comportamiento en producción.
- **Formato GGUF principalmente**: aunque la librería declarada es `transformers`, el repositorio contiene cuantizaciones GGUF; para usar vLLM o TGI sería necesario obtener los pesos en safetensors del modelo base o convertirlos.

## Enlaces

- [Hugging Face: mohommed/Lucet-CoderSense-4B-Omega-GGUF](https://huggingface.co/mohommed/Lucet-CoderSense-4B-Omega-GGUF)
- [Modelo base: XHToken/Spark-X2.6-4B](https://huggingface.co/XHToken/Spark-X2.6-4B)
- No se han encontrado en la búsqueda web papers, blogs, repositorios o demos adicionales asociados a este modelo.
