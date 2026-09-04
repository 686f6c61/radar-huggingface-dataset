# CtrlCreeper/Qwen3.8-27B-Cold-Fusion-Heretic-Fable-Heretic-GGUF

## Resumen

CtrlCreeper/Qwen3.8-27B-Cold-Fusion-Heretic-Fable-Heretic-GGUF es un modelo de lenguaje de 27.320.697.856 parámetros creado por CtrlCreeper. Se trata de una fusión NuSLERP de dos derivados abliterados de Qwen3.8-27B: Cold-Fusion GAIN, orientado a eficiencia y razonamiento, y Fable-Distill, enfocado a características creativas y conversacionales. El resultado es un modelo que combina capacidades de razonamiento con un estilo más libre y creativo en la generación de texto.

El modelo se distribuye únicamente en formato GGUF, lo que facilita su ejecución en entornos locales con llama.cpp, Ollama o similares. Su tamaño de repo es de 68.3 GB, lo que indica que se incluyen múltiples cuantizaciones. Actualmente tiene muy poca difusión (una descarga y cero likes), y la información pública sobre su licencia, idiomas y contexto es escasa. A pesar de ello, su arquitectura basada en Qwen3.8-27B y su enfoque en razonamiento y creatividad lo hacen interesante para experimentación local.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.8-27B) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones no especificadas en la información disponible) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es el resultado de un merge NuSLERP entre dos derivados abliterados de Qwen3.8-27B. La abliteración es una técnica que modifica los pesos de un modelo para eliminar ciertos comportamientos aprendidos, como rechazos o respuestas de seguridad. Cold-Fusion GAIN aporta un comportamiento orientado a la eficiencia y al razonamiento, mientras que Fable-Distill contribuye con características creativas y conversacionales. El proceso de fusión NuSLERP combina ambos modelos manteniendo las estructuras de capas y pesos.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se han publicado detalles sobre innovaciones técnicas adicionales, más allá del método de fusión mencionado.

## Capacidades

- Generación de texto conversacional con estilo creativo, derivado de la componente Fable-Distill.
- Razonamiento orientado a tareas de análisis, heredado de la componente Cold-Fusion GAIN.
- Soporte para ejecución local mediante cuantizaciones GGUF, compatible con inferencia en CPU y GPU.
- No se han documentado capacidades de tool calling, function calling, visión o audio en la información disponible.
- No se ha confirmado soporte para agentes ni multi-step reasoning más allá de lo que pueda heredar de Qwen3.8-27B.
- Capacidades multilingües: no disponibles, ya que no se especifican los idiomas soportados.

## Casos de uso

- Experimentación local con modelos de 27B: gracias a su formato GGUF, permite probar razonamiento y creatividad en una estación de trabajo con GPU de 24 GB o incluso en CPU con cuantizaciones bajas.
- Generación de contenido creativo: cuentos, guiones o diálogos con un tono libre y poco restringido, adecuado para proyectos de escritura automatizada donde se busca variedad estilística.
- Chatbots de investigación: el modelo puede usarse como base para asistentes conversacionales en entornos de investigación, donde la combinación de razonamiento y creatividad aporta respuestas menos rígidas.
- Análisis de texto y razonamiento básico: para tareas de clasificación, resumen o extracción de información, aprovechando la componente de razonamiento de Cold-Fusion GAIN.
- Educación y tutoría informal: puede generar explicaciones y ejemplos en un estilo didáctico, aunque sin garantías de precisión ni seguridad por su naturaleza abliterada.
- Prototipado de aplicaciones de IA generativa: al ser un modelo abierto en GGUF, es útil para validar ideas y flujos de trabajo antes de migrar a modelos con licencias más claras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni otras pruebas estándar. Tampoco se han encontrado comparativas con modelos similares que permitan evaluar su rendimiento real.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q4_K_M, el modelo puede requerir entre 16 y 18 GB de VRAM; con Q5_K_M, entre 20 y 22 GB; con Q8, más de 27 GB.
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones Q4 o Q5; A100 (40/80 GB) o H100 (80 GB) para cuantizaciones más altas o ejecución con mayor margen.
- En GPU de consumo: sí, es posible ejecutar en tarjetas de 24 GB con cuantizaciones de 4 o 5 bits.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con archivos GGUF. También puede ejecutarse en CPU, aunque con latencia alta.
- Latencia y throughput estimados: no disponibles, ya que no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría con datos de rendimiento publicados. El modelo comparte base con Qwen3.8-27B, pero no se han encontrado comparativas directas con otras variantes de Qwen3.8 ni con otros modelos de 27B parámetros.

## Limitaciones y advertencias

- Licencia no disponible: el uso comercial no está garantizado, y es necesario verificar los términos antes de cualquier despliegue en producción.
- Naturaleza abliterada: al haberse eliminado parte del alineamiento, el modelo puede generar contenido inapropiado, ofensivo o no seguro.
- Riesgo de alucinación: al igual que otros modelos de su clase, puede producir información falsa o inventada, especialmente en temas específicos.
- Contexto e idiomas no especificados: no se conoce la longitud exacta de la ventana de contexto ni los idiomas soportados, lo que limita su uso en aplicaciones multilingües o con documentos largos.
- Baja adopción y soporte: al tener una descarga y sin comunidad activa, es probable que los errores y problemas no se corrijan.
- Datos de rendimiento ausentes: no hay benchmarks publicados, por lo que no se puede validar su calidad frente a otros modelos.

## Enlaces

- [Modelo GGUF en HuggingFace](https://huggingface.co/CtrlCreeper/Qwen3.8-27B-Cold-Fusion-Heretic-Fable-Heretic-GGUF)
- [Modelo original (sin cuantizar) en HuggingFace](https://huggingface.co/CtrlCreeper/Qwen3.8-27B-Cold-Fusion-Heretic-Fable-Heretic)
- [Versión mxfp8-mlx en HuggingFace](https://huggingface.co/CtrlCreeper/Qwen3.8-27B-Cold-Fusion-Heretic-Fable-Heretic-mxfp8-mlx)
