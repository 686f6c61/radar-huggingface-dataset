# SevenDays3D/Qwen3.6-35B-A3B

## Resumen

Qwen3.6-35B-A3B es un modelo de lenguaje causal multimodal (texto, imagen y vídeo) publicado por el equipo Qwen en abril de 2026 y distribuido en formato abierto. La versión aquí documentada, alojada por el usuario SevenDays3D, es una conversión a GGUF del modelo base oficial `Qwen/Qwen3.6-35B-A3B`, pensada para inferencia local y despliegues con llama.cpp y derivados. El modelo emplea una arquitectura Mixture-of-Experts (MoE) con 35.505.251.456 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, lo que permite un coste de cómputo por token propio de un modelo mucho más pequeño.

La propuesta de valor se centra en el "agentic coding": razonamiento a nivel de repositorio, tareas de frontend y uso intensivo de herramientas. Incorpora una ventana de contexto nativa de 262.144 tokens, ampliable hasta 1.010.000 mediante YaRN, y una innovación denominada "Thinking Preservation" que permite conservar el contexto de razonamiento entre turnos para reducir el consumo de tokens en flujos iterativos. También soporta Multi-Token Prediction (MTP).

Es relevante ahora porque combina un contexto muy largo, capacidades multimodales y un rendimiento destacado en benchmarks de agentes (SWE-bench Verified 73.4, Terminal-Bench 2.0 51.5) con una licencia Apache 2.0 y pesos en GGUF que facilitan su ejecución en hardware de consumo, algo poco habitual en modelos de esta categoría.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con MoE y encoder visual (multimodal texto/imagen/vídeo) |
| Parametros totales | 35.505.251.456 |
| Parametros activos | ~3.000 millones (8 expertos enrutados + 1 compartido de 256) |
| Longitud de contexto | 262.144 tokens nativo; hasta 1.010.000 con YaRN |
| Tipos de cuantizacion | GGUF (el repo distribuye cuantizaciones GGUF; niveles concretos no disponibles) |
| Idiomas soportados | Ruso (declarado en la model card); cobertura multilingüe del modelo base no detallada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 138,1 GB); el modelo base original en safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer causal con 40 capas, dimensión oculta de 2048 y una capa MoE con 256 expertos, de los que se activan 8 enrutados más 1 compartido por token. Esta configuración mantiene la capacidad total en 35.500 millones de parámetros mientras reduce el cómputo por token al equivalente a un modelo de ~3.000 millones activos. Incluye un encoder visual que habilita la entrada de imágenes y vídeo, y fue entrenado con Multi-Token Prediction (MTP), técnica que permite predecir varios tokens por paso y acelera la decodificación.

La model card indica que el modelo se construyó a partir de feedback de la comunidad, con énfasis en estabilidad y utilidad práctica. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. La innovación más destacable es "Thinking Preservation", que permite reutilizar el contexto de razonamiento de mensajes previos, reduciendo el gasto de tokens y mejorando la coherencia en tareas agénticas iterativas. El contexto largo se logra de forma nativa hasta 262K y se extiende a ~1M mediante escalado YaRN.

## Capacidades

- Generación de texto y razonamiento general, con modo "thinking" activado por defecto y modo instruct sin razonamiento.
- Programación agéntica: resolución de issues, razonamiento a nivel de repositorio y desarrollo frontend (QwenWebBench).
- Soporte de tool calling y function calling, con integración recomendada vía Qwen-Agent y Qwen Code.
- Razonamiento multi-paso y flujos agénticos con preservación de contexto de razonamiento entre turnos.
- Capacidades multimodales: comprensión de imágenes y vídeo (MMMU, VideoMMMU, RefCOCO, OmniDocBench).
- Matemáticas y razonamiento científico de nivel avanzado (AIME26, GPQA, MMLU-Pro).
- Contexto muy largo (hasta ~1M tokens con YaRN) para análisis de documentos y código extensos.
- Multilingüe en tareas de código (SWE-bench Multilingual); el idioma declarado explícitamente en la tarjeta es el ruso.

## Casos de uso

- Agente de resolución de incidencias en repositorios: el modelo puede leer un issue, navegar el código y proponer un parche, apoyándose en SWE-bench Verified 73.4 y en su ventana de contexto para manejar repositorios grandes.
- Generación de frontend en producción: con temperature=0.6 y top_p=0.95, encaja en pipelines que generan componentes web (QwenWebBench 1397), integrándose en herramientas de CI/CD mediante tool calling.
- Automatización de terminal y DevOps: Terminal-Bench 2.0 de 51.5 lo hace adecuado para agentes que ejecutan comandos, interpretan salidas y corrigen errores en entornos controlados.
- Análisis de documentación técnica extensa: con contexto nativo de 262K y hasta ~1M con YaRN, puede procesar manuales, contratos o bases de código completas en una sola pasada.
- Asistente multimodal de soporte: al aceptar imagen y vídeo, puede atender tickets con capturas de pantalla o grabaciones y describir o diagnosticar el problema.
- Investigación asistida en matemáticas y ciencia: AIME26 92.7 y GPQA 86.0 lo sitúan como apoyo para razonamiento simbólico y verificación de hipótesis.
- Despliegue local con privacidad de datos: la distribución en GGUF permite ejecutarlo en infraestructura propia sin enviar datos a terceros, útil en entornos regulados.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| SWE-bench Verified | 73.4 |
| SWE-bench Multilingual | 67.2 |
| Terminal-Bench 2.0 | 51.5 |
| QwenWebBench | 1397 |
| MCPMark | 37.0 |
| NL2Repo | 29.4 |
| GPQA | 86.0 |
| AIME26 | 92.7 |
| MMLU-Pro | 85.2 |
| MMMU | 81.7 |
| OmniDocBench1.5 | 89.9 |
| RefCOCO | 92.0 |
| VideoMMMU | 83.7 |

No se han publicado en la información disponible resultados comparativos directos frente a modelos concretos de la competencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta. Con 35.500 millones de parámetros totales, una cuantización de 4 bits requiere del orden de 18-22 GB solo para pesos; a 8 bits, unos 36 GB; en FP16, unos 71 GB. Estas cifras son estimaciones por tamaño y no proceden de la model card.
- GPU recomendadas: para FP16, A100 80 GB o H100; para cuantizaciones de 4-8 bits, GPUs de 24 GB o más (RTX 4090, RTX 3090, L40S) pueden ser suficientes, aunque la VRAM de contexto largo debe sumarse.
- Cabe en GPU de consumo en cuantizaciones bajas (GGUF), siempre que se ajuste la longitud de contexto.
- Opciones de despliegue: llama.cpp y derivados para GGUF; vLLM, SGLang y KTransformers recomendados para producción según la model card; compatibilidad con Hugging Face Transformers.
- Latencia y throughput: no disponibles. La arquitectura MoE de ~3.000 millones activos y la decodificación con MTP deberían reducir el coste por token frente a un modelo denso de 35B, pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de modelos comparables (parámetros, contexto, benchmarks, licencia) que permitan una comparación rigurosa. Se indica "no disponible".

## Limitaciones y advertencias

- La model card declara únicamente el ruso como idioma; el rendimiento en castellano no está documentado y debe validarse empíricamente.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en modo sin razonamiento y en tareas de código donde el contexto no cubre el repositorio completo.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- El contexto efectivo puede degradarse con longitudes extremas (hasta ~1M con YaRN); la propia tarjeta recomienda no bajar de 128K para preservar la calidad del razonamiento.
- La licencia Apache 2.0 permite uso comercial, pero esta conversión GGUF es de un tercero (SevenDays3D); conviene verificar la integridad y fidelidad de la cuantización frente al modelo base oficial.
- El pipeline declarado (`image-text-to-video`) no parece coherente con la naturaleza del modelo (LLM multimodal); debe tratarse con cautela.
- El repo ocupa 138,1 GB, lo que implica requisitos de almacenamiento considerables.
- Para producción se recomienda SGLang, vLLM o KTransformers; el uso con llama.cpp puede no alcanzar el mismo rendimiento.

## Enlaces

- Modelo en Hugging Face (conversión GGUF): https://huggingface.co/SevenDays3D/Qwen3.6-35B-A3B
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
