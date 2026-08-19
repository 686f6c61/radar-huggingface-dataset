# meta-models/Muse-Glimmer-30B

## Resumen

Muse Glimmer es un modelo de lenguaje causal de 30 000 millones de parámetros desarrollado por el Meta Superintelligence Lab, diseñado específicamente para tareas agénticas en hardware de consumo. Se trata de una versión destilada de Muse Spark que integra en un único sistema razonamiento multi-paso, uso fiable de herramientas, comprensión multimodal (texto e imágenes) y recuperación ante fallos, todo ello ejecutable localmente sin necesidad de infraestructura en la nube.

El modelo combina un transformador denso con un encoder de percepción ViT-G/14 de aproximadamente 1 800 millones de parámetros, lo que le permite procesar entradas intercaladas de texto e imagen. Con una ventana de contexto de 131 072 tokens y soporte para más de 100 idiomas, Muse Glimmer está pensado para desplegarse en entornos locales con cuantización de 4 bits, manteniendo una degradación mínima en tareas agénticas. Su licencia Apache 2.0 facilita su adopción tanto en investigación como en productos comerciales.

La relevancia actual del modelo radica en su enfoque integral para agentes autónomos: no solo genera texto, sino que planifica, ejecuta llamadas a herramientas, diagnostica errores y se recupera de fallos, todo dentro de un marco de ejecución local. Esto lo convierte en una opción atractiva para desarrolladores que buscan alternativas a APIs en la nube con requisitos de privacidad o latencia estrictos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense Causal Transformer con Perception Encoder (ViT-G/14) |
| Parametros totales | ~29,6B (incluyendo vision encoder) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131 072+ tokens |
| Tipos de cuantizacion | K-Quant-Dynamic (aprox. 4 bits), K-Quant-17GB (aprox. 4 bits), full precision |
| Idiomas soportados | Más de 100 idiomas (lista específica no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Muse Glimmer emplea un transformador causal denso con un patrón de atención híbrido: capas con atención local de ventana deslizante (tamaño 2048) intercaladas con capas de atención global en un ciclo de cuatro capas (Local, Local, Local, Global). Incorpora gated attention, atención con consultas agrupadas (GQA) con ratio 16:1 (32 cabezas de consulta, 2 de clave/valor), y capas feed-forward SwiGLU con dimensión intermedia de 19 968. La codificación posicional usa RoPE con theta de 500 000, aplicada únicamente en las capas locales. El vocabulario consta de 202 048 tokens (200 000 BPE más 2 048 especiales).

El encoder de percepción es un ViT-G/14 de 50 capas, ancho 1536 y parche de 14 píxeles, con aproximadamente 1 800 millones de parámetros, que genera hasta 4 096 tokens visuales por imagen. El entrenamiento se realizó con contenido multimodal de fuentes públicas, datos de terceros y productos de Meta, con un corte de conocimiento en enero de 2026. El modelo fue destilado de Muse Spark y optimizado para cuantización agresiva y decodificación especulativa mediante un modelo auxiliar DFlash que propone bloques de 16 tokens en una sola pasada, verificados en paralelo por el modelo principal.

## Capacidades

- **Agente de extremo a extremo**: completar tareas completas desde una petición inicial hasta la resolución final, incluyendo escritura y depuración de código, búsqueda de información y resolución de peticiones multi-turno.
- **Uso fiable de herramientas**: invocación de funciones con esquemas precisos a lo largo de flujos de trabajo extensos.
- **Razonamiento multi-paso**: encadenamiento de razonamiento sobre horizontes largos, manteniendo planes coherentes en tareas complejas.
- **Recuperación ante fallos**: cuando una llamada a herramienta falla o devuelve un resultado inesperado, el modelo diagnostica el error y reintenta en lugar de detenerse.
- **Entrada multimodal**: acepta texto e imágenes intercaladas, permitiendo interpretar capturas de pantalla, gráficos y documentos junto con la conversación.
- **Compatibilidad con scaffolds**: funciona con OpenClaw, Hermes Agent y otros patrones de orquestación agéntica.
- **Esfuerzo controlable**: soporta distintos niveles de razonamiento para ajustar el equilibrio entre calidad y velocidad.
- **Multilingüe**: entrenado con datos de más de 100 idiomas.

## Casos de uso

- **Asistente personal local**: un asistente que gestiona calendario, correo y tareas del sistema mediante llamadas a herramientas, ejecutándose íntegramente en un portátil con 24 GB de VRAM, sin conexión a internet.
- **Automatización de flujos de trabajo con imágenes**: procesar facturas o formularios escaneados, extraer datos relevantes y actualizar una base de datos, combinando comprensión visual y tool calling.
- **Agente de soporte técnico**: diagnosticar problemas de software a partir de capturas de pantalla y logs, ejecutar comandos de diagnóstico y proponer soluciones, con capacidad de reintentar tras errores.
- **Generación y depuración de código en entornos CI/CD**: integrar el modelo en pipelines de integración continua para revisar pull requests, sugerir correcciones y ejecutar pruebas, gracias a su soporte de tool calling y razonamiento multi-paso.
- **Análisis de documentos financieros**: leer informes con tablas y gráficos, resumir tendencias y generar informes ejecutivos, aprovechando la ventana de contexto de 131K tokens para documentos extensos.
- **Investigación académica multilingüe**: traducir y resumir artículos científicos en varios idiomas, manteniendo el contexto de la conversación y permitiendo preguntas de seguimiento.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. El modelo card menciona evaluaciones en DeepSearch QA, MCP-Atlas, τ3-Bench y SWE-Bench, pero no se proporcionan cifras concretas. Únicamente se indica la degradación media en 15 benchmarks comunes tras la cuantización: 0,2 % para K-Quant-Dynamic y 1,0 % para K-Quant-17GB, en comparación con la precisión completa.

## Requisitos de hardware

- **VRAM estimada**: 24 GB para la versión K-Quant-17GB, 32 GB para K-Quant-Dynamic y 64 GB para precisión completa. Estas cifras incluyen el KV cache, el encoder de percepción y el modelo drafter.
- **GPU recomendadas**: Nvidia RTX 5090 (24 GB), Apple M4 Max y M5 Max (memoria unificada). También es viable en GPUs de 32 GB como A100 o RTX A6000, aunque no se mencionan explícitamente.
- **Hardware de consumo**: sí, cabe en GPUs de 24 GB como la RTX 5090, y en Macs con chip M4/M5 Max.
- **Opciones de despliegue**: compatible con transformers (HuggingFace), y por su diseño optimizado para local, se puede servir con vLLM, llama.cpp, Ollama o TGI, aunque no se especifican en la documentación.
- **Latencia y throughput**: con decodificación especulativa DFlash, se miden 233,4 tok/s en RTX 5090 (3,1x frente a sin especulación), 37,8 tok/s en M4 Max (1,5x) y 50,2 tok/s en M5 Max (1,8x), con batch size 1 y greedy decoding.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. No obstante, por su tamaño y enfoque, podría compararse con modelos densos de ~30B como Llama 3.1 30B o Qwen 2.5 32B, pero no se han publicado métricas que permitan una comparación rigurosa. Se recomienda consultar benchmarks independientes para una evaluación objetiva.

## Limitaciones y advertencias

- **Sesgos conocidos**: no se han documentado sesgos específicos en la información disponible, pero al ser un modelo entrenado con datos web, es probable que herede sesgos presentes en dichos datos.
- **Riesgo de alucinación**: como todo modelo generativo, puede producir información falsa o inventada, especialmente en tareas de razonamiento complejo o con entradas ambiguas.
- **Limitaciones de contexto**: aunque la ventana es de 131K tokens, el rendimiento en contextos muy largos puede degradarse; la atención local/global puede afectar a la coherencia en pasajes muy extensos.
- **Idiomas**: aunque soporta más de 100 idiomas, no se especifica la calidad relativa entre ellos; es probable que el rendimiento sea superior en inglés y otros idiomas con más representación en el entrenamiento.
- **Licencia**: Apache 2.0 permite uso comercial sin restricciones, pero se debe verificar que los datos de entrenamiento no incluyan contenido con derechos de autor que pueda generar problemas legales.
- **Requisitos de hardware**: la versión cuantizada de 17 GB requiere al menos 24 GB de VRAM, lo que excluye GPUs de gama baja; el modelo drafter añade una sobrecarga de memoria adicional.
- **Dependencia de la cuantización**: aunque la degradación media es baja (1 %), puede haber tareas específicas donde la pérdida de precisión sea mayor.

## Enlaces

- [HuggingFace: meta-models/Muse-Glimmer-30B](https://huggingface.co/meta-models/Muse-Glimmer-30B)
- [Paper del perception encoder (arXiv:2504.13181)](https://arxiv.org/abs/2504.13181)
- [Paper de DFlash (arXiv:2602.06036)](https://arxiv.org/abs/2602.06036)
