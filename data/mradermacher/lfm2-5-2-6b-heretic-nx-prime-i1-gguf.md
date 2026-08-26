# mradermacher/LFM2.5-2.6B-Heretic-NX-PRIME-i1-GGUF

## Resumen

LFM2.5-2.6B-Heretic-NX-PRIME-i1-GGUF es una cuantización GGUF del modelo base `0xzknw/LFM2.5-2.6B-Heretic-NX-PRIME`, una versión modificada del modelo LFM2.5-2.6B de Liquid AI. El modelo original es un transformer denso de 2.6B parámetros diseñado para cargas de trabajo agénticas, con una ventana de contexto de 128K tokens y tool calling nativo. La variante "Heretic-NX-PRIME" aplica técnicas de edición de modelos (abliteration) para eliminar los rechazos de contenido, resultando en un modelo sin censura. El cuantizador `mradermacher` ha generado una serie de archivos GGUF con cuantización imatrix, optimizados para ejecución local en dispositivos con recursos limitados.

Este modelo es relevante porque ofrece una alternativa de pequeño tamaño con capacidades agénticas y multilingües (16 idiomas), y su naturaleza abliterated lo hace adecuado para aplicaciones que requieren generación de contenido sin restricciones, aunque con las advertencias éticas y legales correspondientes. Al estar disponible en formato GGUF, puede ejecutarse en CPU y GPU de consumo mediante herramientas como llama.cpp, Ollama o LM Studio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 híbrida (dense) |
| Parametros totales | 2.697.198.592 (2.7B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en, ar, zh, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi |
| Licencia | lfm-open-license-v1.0 |
| Formato de pesos | GGUF (cuantizado) |

## Arquitectura y entrenamiento

El modelo base LFM2.5-2.6B de Liquid AI utiliza una arquitectura híbrida LFM2, que combina capas de atención con mecanismos de estado (state space models) para mejorar la eficiencia en contextos largos. Según la implementación de referencia en PyTorch, esta versión actualiza el vocabulario, la longitud de contexto, la base de RoPE, el tokenizador y el comportamiento post-entrenamiento respecto a generaciones anteriores. El modelo original fue entrenado con un enfoque en cargas de trabajo agénticas, incluyendo tool calling nativo y soporte para razonamiento multi-paso.

La variante Heretic-NX-PRIME, desarrollada por `0xzknw`, aplica técnicas de ablación de rechazos (abliteration) y edición de modelos sobre el modelo base, eliminando las respuestas de rechazo y permitiendo la generación de contenido sin censura. El cuantizador `mradermacher` ha generado los archivos GGUF utilizando la técnica de importance matrix (imatrix) para mejorar la calidad de la cuantización, especialmente en los niveles más bajos. No se dispone de información detallada sobre los datos de entrenamiento del modelo base modificado, como el número de tokens o la composición del dataset.

## Capacidades

- Generación de texto en 16 idiomas, incluyendo español, inglés, francés, alemán, árabe, chino, hindi, japonés, coreano, entre otros.
- Tool calling nativo, lo que permite al modelo invocar funciones externas y APIs de forma estructurada.
- Soporte para agentes y razonamiento multi-paso, diseñado para flujos de trabajo agénticos en dispositivos.
- Ventana de contexto de 128K tokens, adecuada para documentos largos y conversaciones extensas.
- Al ser una versión abliterated, no presenta rechazos de contenido, permitiendo generar respuestas sobre temas sensibles o controvertidos (con las implicaciones éticas correspondientes).
- Compatible con el ecosistema GGUF, ejecutable en CPU, GPU y dispositivos edge mediante llama.cpp, Ollama, LM Studio y otros.

## Casos de uso

- Asistentes conversacionales sin restricciones: el modelo puede mantener diálogos multi-turno sobre cualquier tema sin filtros de contenido, gracias a su naturaleza abliterated y su ventana de 128K tokens que permite recordar conversaciones largas.
- Automatización de atención al cliente en múltiples idiomas: con soporte para 16 idiomas y tool calling, puede integrarse en sistemas de tickets para responder consultas en el idioma del usuario y escalar a APIs de CRM o bases de conocimiento.
- Agentes de automatización de tareas en local: su tamaño compacto y tool calling nativo lo hacen adecuado para ejecutar agentes que interactúan con aplicaciones locales (envío de correos, gestión de archivos, control de dispositivos IoT) en equipos sin GPU dedicada.
- Generación de contenido creativo sin censura: para proyectos de escritura, guiones o narrativa que requieran explorar temas tabú o lenguaje explícito, este modelo ofrece una alternativa sin restricciones frente a modelos alineados.
- Procesamiento de documentos extensos: con 128K de contexto, puede resumir o extraer información de manuales, contratos o investigaciones completas sin necesidad de dividir el texto.
- Desarrollo de prototipos de agentes en dispositivos móviles o edge: su tamaño (menos de 3 GB en cuantización Q4) permite desplegarlo en smartphones o Raspberry Pi para pruebas de concepto de asistentes personales offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K u otras métricas para este modelo específico ni para su variante base modificada.

## Requisitos de hardware

- VRAM estimada para inferencia: según la cuantización, el modelo ocupa entre 0.8 GB (i1-IQ1_S) y 2.3 GB (i1-Q6_K). Para ejecución con calidad razonable, se recomienda al menos 2 GB de VRAM en GPU o 4 GB de RAM en CPU.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 4060, o GPUs integradas modernas (Apple M1/M2, AMD Radeon 780M). Para mayor velocidad, una RTX 3090 o superior permitirá ejecutar el modelo completamente en GPU.
- En consumer GPU: sí, cabe en GPUs de gama media e incluso en iGPU con suficiente RAM compartida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui, y cualquier herramienta compatible con GGUF.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna (RTX 4060), se espera una generación de 20-40 tokens por segundo en cuantización Q4_K_M; en CPU (8 núcleos modernos), alrededor de 5-10 tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2.5-2.6B-Heretic-NX-PRIME (este) | 2.7B | 128K | Sí | lfm-open-license-v1.0 | GGUF |
| Qwen2.5-1.5B-Instruct | 1.5B | 32K | Sí | Apache 2.0 | safetensors, GGUF |
| Phi-3-mini-4k-instruct | 3.8B | 4K | No | MIT | safetensors, GGUF |
| Llama-3.2-1B-Instruct | 1.2B | 128K | No | Llama 3.2 Community License | safetensors, GGUF |

La comparativa se basa en especificaciones públicas. No se dispone de resultados de rendimiento comparativos. Este modelo destaca por su contexto largo (128K) y tool calling nativo en un tamaño compacto, aunque su licencia es más restrictiva que Apache 2.0 o MIT.

## Limitaciones y advertencias

- Al ser una versión abliterated, el modelo puede generar contenido ofensivo, ilegal o dañino sin filtros. Su uso en producción requiere medidas de seguridad adicionales y responsabilidad legal.
- El modelo base fue modificado mediante técnicas de edición de modelos, lo que puede afectar a la coherencia o al razonamiento en comparación con el modelo original de Liquid AI.
- No se han publicado benchmarks ni evaluaciones de calidad para esta variante, por lo que su rendimiento real es desconocido.
- La licencia lfm-open-license-v1.0 puede imponer restricciones al uso comercial; es necesario revisar los términos completos antes de su despliegue.
- El tamaño de 2.7B parámetros limita su capacidad para tareas de razonamiento complejo o generación de código avanzado en comparación con modelos más grandes.
- Aunque soporta 16 idiomas, la calidad puede variar significativamente entre ellos, con peor rendimiento en idiomas con menos representación.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un modelo reciente o poco probado por la comunidad.

## Enlaces

- [Repositorio HuggingFace de la cuantización GGUF](https://huggingface.co/mradermacher/LFM2.5-2.6B-Heretic-NX-PRIME-i1-GGUF)
- [Modelo base (safetensors)](https://huggingface.co/0xzknw/LFM2.5-2.6B-Heretic-NX-PRIME)
- [Documentación de LFM2.5-2.6B en Liquid Docs](https://docs.liquid.ai/lfm/models/lfm25-2.6b)
- [Implementación PyTorch de LFM2.5 en GitHub](https://github.com/rishikksh20/lfm25-pytorch/)
- [Versión estática de cuantizaciones GGUF](https://huggingface.co/mradermacher/LFM2.5-2.6B-Heretic-NX-PRIME-GGUF)
- [Página de descarga con vista general](https://hf.tst.eu/model#LFM2.5-2.6B-Heretic-NX-PRIME-i1-GGUF)
