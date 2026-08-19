# lactroiii/Muse-Glimmer-30B

## Resumen

Muse Glimmer es un modelo de lenguaje causal de 30.000 millones de parámetros desarrollado por Meta Superintelligence Lab, diseñado específicamente para tareas agénticas autónomas en hardware de consumo. Se presenta como una versión destilada de Muse Spark e integra un encoder de percepción multimodal que permite procesar texto e imágenes de forma intercalada, junto con capacidades de razonamiento multi-paso, uso fiable de herramientas y recuperación ante fallos. Su principal valor es ejecutarse localmente sin necesidad de infraestructura en la nube, con soporte para cuantización que permite encajarlo en GPUs de 24 GB o 32 GB.

El modelo utiliza una arquitectura transformer densa con atención local-global intercalada, ventana deslizante de 2048 tokens y una longitud de contexto de 131.072 tokens. Incluye un mecanismo de decodificación especulativa basado en el modelo DFlash, que propone bloques de 16 tokens para acelerar la generación hasta 3,1 veces en GPUs como la RTX 5090. Está licenciado bajo Apache 2.0, lo que facilita su uso comercial y su integración en productos propios. Su fecha de corte de conocimiento es enero de 2026 y soporta más de 100 idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense Causal Transformer con Perception Encoder (ViT-G/14) |
| Parametros totales | 29.776.626.688 (~29,6B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131.072+ tokens |
| Tipos de cuantizacion | Full Precision, K-Quant-Dynamic, K-Quant-17GB (aproximadamente 4-bit) |
| Idiomas soportados | Mas de 100 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Muse Glimmer es un transformer causal denso de 52 capas con dimensión oculta 6656 y FFN SwiGLU de dimensión intermedia 19.968. El patrón de atención es [Local, Local, Local, Global] repetido, con ventana deslizante de 2048 tokens en las capas locales y atención global en las capas designadas. Usa GQA con 32 cabezas de consulta y 2 de clave/valor (ratio 16:1), y codificación posicional RoPE con theta 500.000 solo en capas locales. El vocabulario consta de 202.048 tokens (200.000 BPE más 2.048 especiales). El encoder de percepción es un ViT-G/14 de aproximadamente 1.800 millones de parámetros, con 50 capas y ancho 1536, que procesa hasta 4.096 tokens visuales por imagen.

El entrenamiento se realizó con contenido multimodal de fuentes públicas, datos de terceros y productos de Meta, curado por redes de proveedores externos y personal de Meta. El conocimiento se corta en enero de 2026. No se especifican detalles sobre el número total de tokens de entrenamiento ni sobre técnicas de alineación como RLHF o DPO, aunque el modelo está destilado de Muse Spark. La decodificación especulativa se implementa mediante un modelo auxiliar DFlash de 5 capas con atención de ventana deslizante (2048) y 32 cabezas de consulta / 8 de KV, que propone bloques de 16 tokens en una sola pasada; el modelo principal verifica las propuestas en paralelo, manteniendo la calidad de salida.

## Capacidades

- Razonamiento multi-paso: encadena pasos de razonamiento sobre horizontes largos, manteniendo planes coherentes en flujos de trabajo complejos.
- Uso fiable de herramientas: invoca funciones con esquemas precisos durante flujos extendidos, incluyendo llamadas a APIs y herramientas externas.
- Recuperacion ante fallos: cuando una llamada a herramienta falla o devuelve un resultado inesperado, diagnostica el error y reintenta en lugar de detenerse.
- Entrada multimodal: acepta texto e imágenes intercaladas mediante el encoder de percepción, permitiendo interpretar capturas de pantalla, gráficos y documentos.
- Compatibilidad con scaffolds agénticos: funciona con OpenClaw, Hermes Agent y otros patrones de orquestación de agentes.
- Esfuerzo controlable: soporta diferentes niveles de intensidad de razonamiento para ajustar el equilibrio entre calidad y velocidad.
- Multilingüe: entrenado con datos de más de 100 idiomas.
- Decodificacion especulativa: integra el modelo DFlash para acelerar la generación sin degradar la calidad de salida.

## Casos de uso

- Agentes autonomos de soporte tecnico: el modelo puede gestionar conversaciones multi-turno con contexto largo (131K tokens) y ejecutar herramientas de diagnóstico, interpretando capturas de pantalla del usuario y reintentando acciones fallidas, lo que lo hace adecuado para entornos de helpdesk sin conexión.
- Asistentes de desarrollo de software: con soporte para tool calling y razonamiento multi-paso, puede integrarse en pipelines de CI/CD para revisar código, ejecutar tests y corregir errores de forma autónoma, como se valida en SWE-Bench.
- Analisis de documentos mixtos: gracias a su encoder de visión, puede procesar informes con tablas, gráficos y texto, extrayendo conclusiones y generando resúmenes ejecutivos en entornos locales de oficina.
- Automatizacion de tareas web: puede operar como agente que navega por interfaces, rellena formularios y extrae datos, utilizando su capacidad de interpretar capturas de pantalla y su ventana de contexto para mantener el estado de la sesión.
- Chatbots multilingües de atencion al cliente: entrenado en más de 100 idiomas, puede atender consultas de usuarios en distintos países sin depender de servicios en la nube, con tiempos de respuesta aceptables en hardware de consumo.
- Investigacion academica asistida: para tareas de búsqueda profunda (DeepSearch QA), el modelo puede consultar múltiples fuentes, razonar sobre los resultados y componer respuestas citadas, funcionando localmente en estaciones de trabajo con GPU de 24 GB.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card menciona que el modelo se evalúa en DeepSearch QA, MCP-Atlas, τ3-Bench y SWE-Bench, así como en una media de 15 benchmarks comunes para medir la degradación por cuantización, pero no se proporcionan cifras concretas. Tampoco se incluyen comparaciones con otros modelos en los materiales consultados.

## Requisitos de hardware

- VRAM estimada: 64 GB para precisión completa, 32 GB con K-Quant-Dynamic y 24 GB con K-Quant-17GB (aproximadamente 4-bit).
- GPUs recomendadas: Nvidia RTX 5090 (24 GB) para la versión cuantizada, o GPUs de 32 GB como RTX A6000 o similares. También funciona en Apple Silicon (M4 Max, M5 Max) con la cuantización adecuada.
- Cabe en GPUs de consumo: sí, la versión K-Quant-17GB está diseñada para tarjetas de 24 GB como la RTX 5090, dejando espacio para el KV cache, el encoder de percepción y el modelo drafter.
- Velocidades medidas (batch size 1, greedy decoding): en RTX 5090, 74,9 tok/s sin especulación y 233,4 tok/s con DFlash (3,1x); en M4 Max, 23,7 tok/s sin especulación y 37,8 tok/s con DFlash (1,5x); en M5 Max, 26,6 tok/s sin especulación y 50,2 tok/s con DFlash (1,8x).
- Opciones de despliegue: al ser un modelo transformers con pesos safetensors, es compatible con frameworks como vLLM, llama.cpp, Ollama y TGI, además de los scaffolds agénticos mencionados (OpenClaw, Hermes Agent). La model card no detalla instrucciones específicas de despliegue.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la informacion proporcionada. El modelo comparte categoría con otros modelos abiertos de ~30B como Qwen 2.5 32B o Llama 3.1 8B, pero no hay benchmarks publicados que permitan una comparación objetiva. Se puede señalar que Muse Glimmer destaca por su enfoque específico en agentes locales y su integración de visión, pero sin datos cuantitativos no es posible establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la model card, pero al ser entrenado con datos públicos y de terceros, puede heredar sesgos presentes en esos datos.
- Riesgo de alucinacion: como todo modelo generativo, puede producir información falsa o inventada, especialmente en tareas de razonamiento complejo si no se valida con herramientas externas.
- Limitaciones de contexto: aunque la ventana es de 131K tokens, el patrón de atención local-global puede afectar al rendimiento en pasajes muy largos donde la información relevante esté fuera de las ventanas locales.
- Degradacion por cuantizacion: la versión K-Quant-17GB muestra una degradación media del 1,0% en 15 benchmarks, que puede ser aceptable para muchos usos pero debe tenerse en cuenta en aplicaciones críticas.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones significativas, pero es recomendable revisar los términos completos de la licencia para cumplir con atribución y patentes.
- Requisitos de hardware para calidad completa: la precisión completa requiere 64 GB de VRAM, lo que limita su uso a estaciones de trabajo profesionales o servidores.

## Enlaces

- Repositorio HuggingFace (copia): https://huggingface.co/lactroiii/Muse-Glimmer-30B
- Repositorio HuggingFace oficial (Meta): https://huggingface.co/meta-models/Muse-Glimmer-30B
- Blog de Meta Research: https://research.meta.ai/blog/introducing-muse-glimmer-open-agentic-model
- Página de desarrolladores de Meta: https://developer.meta.com/ai/models/muse-glimmer/
- Benchmarks y contexto en BenchLM: https://benchlm.ai/models/muse-glimmer-30b
- Ficha en LM Studio: https://lmstudio.ai/models/meta/muse-glimmer
- Paper del encoder de percepción (arXiv:2504.13181): https://arxiv.org/abs/2504.13181
- Paper del modelo DFlash (arXiv:2602.06036): https://arxiv.org/abs/2602.06036
