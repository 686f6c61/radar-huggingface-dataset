# Smnclinic/Muse-Glimmer-30B

## Resumen

Muse Glimmer es un modelo de lenguaje causal de 30 mil millones de parámetros desarrollado por Meta Superintelligence Lab, diseñado específicamente para tareas agénticas autónomas en hardware de consumo. Se presenta como una versión destilada de Muse Spark, con un encoder de percepción dedicado que permite entrada multimodal (texto e imágenes) y salida de texto. El modelo integra razonamiento multi-paso, uso fiable de herramientas, comprensión multimodal y recuperación ante fallos, todo ello ejecutable localmente sin necesidad de infraestructura en la nube.

La relevancia actual de Muse Glimmer radica en su enfoque en la ejecución local de agentes autónomos, un área que exige latencia baja, privacidad y disponibilidad continua. Con una ventana de contexto de 131 072 tokens y soporte para más de 100 idiomas, el modelo está optimizado para cargas de trabajo prolongadas y multi-turno. Su licencia Apache 2.0 y su compatibilidad con marcos de orquestación como OpenClaw y Hermes Agent lo convierten en una opción atractiva para desarrolladores que buscan desplegar agentes en entornos locales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con encoder de percepción (ViT-G/14) |
| Parametros totales | 29 776 626 688 (~29,6B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131 072+ tokens |
| Tipos de cuantizacion | BF16, K-Quant-Dynamic (32GB), K-Quant-17GB (24GB) |
| Idiomas soportados | Más de 100 idiomas (sin lista específica) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors, GGUF (k-quants), ExecuTorch |

## Arquitectura y entrenamiento

Muse Glimmer emplea un transformer causal denso con 52 capas, dimensión oculta de 6656 y FFN SwiGLU con dimensión intermedia de 19 968. El patrón de atención es [Local, Local, Local, Global] repetido, con ventana deslizante de 2048 tokens en las capas locales y atención global en las capas designadas. Utiliza atención con compuerta (gated attention) y cabezas Q/KV de 32/2 (GQA ratio 16:1), con codificación posicional RoPE (θ = 500 000) solo en capas locales. El encoder de percepción es un ViT-G/14 de ~1,8B parámetros, 50 capas y ancho 1536, que procesa hasta 4096 tokens visuales por imagen.

El entrenamiento se realizó con contenido multimodal de fuentes públicas, datos de terceros y productos de Meta, curado y enriquecido por redes de proveedores externos y personal de Meta. El corte de conocimiento es el 4 de enero de 2026. No se especifica el número total de tokens de entrenamiento ni el uso de RLHF o DPO. El modelo incorpora decodificación especulativa mediante un modelo auxiliar "drafter" basado en DFlash, que propone bloques de 16 tokens en una sola pasada, acelerando la generación sin degradar la calidad.

## Capacidades

- Generación de texto y razonamiento multi-paso sobre horizontes largos, manteniendo planes coherentes en flujos de trabajo complejos.
- Uso fiable de herramientas (tool calling) con invocación de funciones según esquemas precisos a lo largo de flujos extendidos.
- Comprensión multimodal: acepta texto e imágenes intercaladas, permitiendo interpretar capturas de pantalla, gráficos y documentos.
- Recuperación ante fallos: cuando una llamada a herramienta falla o devuelve un resultado inesperado, el modelo diagnostica el error y reintenta en lugar de detenerse.
- Compatibilidad con scaffolds de agentes como OpenClaw y Hermes Agent.
- Control de esfuerzo: soporta diferentes niveles de razonamiento para equilibrar calidad y velocidad.
- Multilingüismo: entrenado con datos de más de 100 idiomas.
- Decodificación especulativa integrada con el drafter DFlash para generación más rápida.

## Casos de uso

- Asistentes personales locales: el modelo puede gestionar conversaciones multi-turno con contexto largo (131K tokens) y ejecutar tareas como gestión de calendario, correo o búsqueda de información, todo en el dispositivo sin conexión.
- Automatización de flujos de trabajo con herramientas: integrado en pipelines que requieren llamadas a APIs, bases de datos o scripts, el modelo invoca funciones con esquemas precisos y se recupera de errores, ideal para orquestación de tareas administrativas.
- Análisis de documentos e imágenes: gracias al encoder de percepción, puede procesar capturas de pantalla, gráficos y documentos escaneados, extrayendo información y respondiendo preguntas sobre ellos, útil en entornos de soporte técnico o investigación.
- Desarrollo de software asistido: con soporte para SWE-Bench, el modelo puede escribir, depurar y corregir código en repositorios, integrándose en entornos de desarrollo locales o CI/CD.
- Agentes de atención al cliente: desplegado en un servidor local, maneja consultas multi-turno con contexto prolongado, manteniendo el historial completo de la conversación y usando herramientas de CRM o bases de conocimiento.
- Investigación académica: su capacidad multilingüe y de razonamiento multi-paso permite procesar literatura científica, resumir artículos y extraer datos de figuras, todo sin enviar información sensible a la nube.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card menciona que el modelo fue evaluado en tareas agénticas completas como DeepSearch QA, MCP-Atlas, τ3-Bench y SWE-Bench, pero no proporciona métricas concretas. También indica una degradación media del 0,2% con cuantización K-Quant-Dynamic y del 1,0% con K-Quant-17GB, medida sobre 15 benchmarks comunes, pero sin detallar los valores absolutos.

## Requisitos de hardware

- VRAM estimada: 64 GB para precisión completa (BF16), 32 GB para K-Quant-Dynamic, 24 GB para K-Quant-17GB.
- GPUs recomendadas: Nvidia RTX 5090 (24 GB) con cuantización K-Quant-17GB; también compatible con Apple M4 Max y M5 Max (32 GB o más).
- Cabe en GPUs de consumo: sí, con cuantización K-Quant-17GB en una RTX 5090 o similar con 24 GB de VRAM.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, ExecuTorch (para dispositivos Apple).
- Latencia y throughput: en RTX 5090, 74,9 tok/s sin especulación y 233,4 tok/s con DFlash (3,1x de aceleración); en M4 Max, 23,7 tok/s base y 37,8 tok/s con especulación; en M5 Max, 26,6 tok/s base y 50,2 tok/s con especulación. Medidas con batch size 1 y greedy decoding.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa con otros modelos de la misma categoría (agénticos locales de ~30B). Alternativas genéricas como Llama 3.1 8B o Qwen 2.5 32B existen, pero no se han encontrado métricas comparables en la información proporcionada. Se recomienda consultar benchmarks independientes para una evaluación justa.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado explícitamente, pero al entrenarse con datos públicos y de terceros, puede heredar sesgos presentes en esos datos.
- Riesgo de alucinación: como todo modelo generativo, puede producir información falsa o inventada, especialmente en tareas de razonamiento complejo o con entradas ambiguas.
- Limitaciones de contexto: aunque la ventana es de 131K tokens, el rendimiento en contextos muy largos puede degradarse; la atención local con ventana de 2048 puede limitar la captura de dependencias de largo alcance en capas locales.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe verificar el cumplimiento de las condiciones de atribución y patentes.
- Caveat para producción: la cuantización K-Quant-17GB introduce una degradación del 1,0% en benchmarks, lo que puede ser relevante en aplicaciones críticas; se recomienda validar el rendimiento en el caso de uso específico.
- El modelo requiere el drafter DFlash para alcanzar velocidades óptimas; sin él, la generación es significativamente más lenta.

## Enlaces

- [HuggingFace - Smnclinic/Muse-Glimmer-30B](https://huggingface.co/Smnclinic/Muse-Glimmer-30B)
- [HuggingFace - meta-models/Muse-Glimmer-30B](https://huggingface.co/meta-models/Muse-Glimmer-30B)
- [Meta Developer - Muse Glimmer](https://developer.meta.com/ai/models/muse-glimmer/)
- [Meta Research Blog - Introducing Muse Glimmer](https://research.meta.ai/blog/introducing-muse-glimmer-open-agentic-model)
- [LM Studio - meta/muse-glimmer](https://lmstudio.ai/models/meta/muse-glimmer)
- [Colección Muse Glimmer en HuggingFace](https://huggingface.co/collections/meta-models/muse-glimmer)
- [Paper ViT-G (arXiv:2504.13181)](https://arxiv.org/abs/2504.13181)
- [Paper DFlash (arXiv:2602.06036)](https://arxiv.org/abs/2602.06036)
