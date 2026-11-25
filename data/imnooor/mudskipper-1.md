# imnooor/mudskipper-1

## Resumen

Mudskipper 1.0 es un modelo de lenguaje compacto, solo texto, publicado por el usuario imnooor en Hugging Face. Se trata de un ajuste fino (finetune) del checkpoint LiquidAI/LFM3-1.7B, desarrollado por Liquid AI, sobre el que se ha construido una variante orientada a despliegue local, seguimiento de instrucciones, asistencia a la programación y aplicaciones con uso de herramientas (tool calling). Con 1,73 mil millones de parámetros y una ventana de contexto configurada de 256K tokens, se posiciona en la categoría de modelos pequenos para inferencia en el borde (edge).

La relevancia de este modelo radica en su arquitectura tri-híbrida heredada de LFM3, que combina convoluciones cortas con compuertas, atención de ventana deslizante y atención global, lo que permite procesar secuencias muy largas con un coste computacional contenido. El modelo cubre 16 idiomas, incluido el castellano, y está pensado para flujos agénticos controlados por la aplicación, como asistentes locales o pipelines de generación estructurada.

No obstante, conviene senalar que la model card del autor indica explícitamente que los resultados de benchmarks específicos de Mudskipper 1.0 aún no se han publicado; la tabla de evaluación incluida en la card corresponde al checkpoint base y a modelos de referencia, no a esta variante. La ficha, por tanto, describe las capacidades heredadas y documentadas del modelo base, sin atribuir a Mudskipper métricas no verificadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tri-híbrido: convoluciones cortas con compuertas, atención de ventana deslizante y atención global |
| Parametros totales | 1,73 mil millones (configuración base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256K tokens (entrada + salida) en la configuración base |
| Tipos de cuantizacion | no disponible de forma explícita; se menciona soporte de safetensors/BF16 y GGUF para llama.cpp |
| Idiomas soportados | 16: inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso y polaco |
| Licencia | LFM Open License v1.0 (licencia "other" en Hugging Face) |
| Formato de pesos | Safetensors (BF16) y GGUF; otros formatos convertidos según runtime |

## Arquitectura y entrenamiento

Mudskipper 1.0 hereda la arquitectura tri-híbrida de LiquidAI/LFM3-1.7B. El modelo consta de 24 capas distribuidas en tres tipos: 13 capas de convolución corta con compuertas (gated short convolutions) para el procesamiento local y eficiente de secuencias, 5 capas de atención de ventana deslizante para interacciones de rango acotado, y 6 capas de atención global para interacciones sin restricción a lo largo del contexto. Esta combinación busca reducir el coste cuadrático de la atención completa en contextos largos manteniendo la capacidad de modelar dependencias globales. El vocabulario es de 128.000 tokens y la longitud de contexto configurada alcanza los 256K tokens, incluyendo entrada y salida.

La model card no detalla el proceso de entrenamiento específico de Mudskipper 1.0: no se indica el número de tokens de ajuste, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO u otras. Tampoco se documentan innovaciones adicionales más allá de las del checkpoint base, y el autor aclara que no se reclaman capas recurrentes adicionales, módulos de memoria aprendida, enrutamiento mixture-of-depths ni capas mixture-of-experts salvo que se incluyan en un checkpoint publicado y se documenten en una revisión posterior de la card. Toda la información de entrenamiento del modelo base debe consultarse en la card de LiquidAI/LFM3-1.7B.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte de plantilla de chat mediante `apply_chat_template`.
- Generación de texto estructurado y salidas en estilo JSON.
- Soporte de function calling y tool calling dentro de un bucle de ejecución controlado por la aplicación.
- Flujos agénticos locales y asistentes de múltiples pasos, con verificación externa de resultados.
- Asistencia a la programación y generación de código, según la descripción del autor.
- Capacidades multilingües en 16 idiomas, incluido el español, aunque la card advierte que la cobertura no implica rendimiento uniforme entre idiomas y tareas.
- Adaptación a dominios específicos mediante ajuste fino adicional.
- Aplicaciones asistidas por recuperación (RAG), donde sistemas externos aportan información actualizada o especializada.
- Modelo solo texto: no se documentan capacidades de visión ni audio.

## Casos de uso

- Asistentes locales y de escritorio: el modelo puede ejecutarse en inferencia local con 1,73B parámetros y una ventana de 256K tokens, lo que permite mantener conversaciones largas o procesar documentos extensos sin depender de la nube.
- Agentes de tool calling en aplicaciones controladas: integrado en un harness que gestione permisos de herramientas, registre resultados y verifique la finalización de tareas, el modelo puede invocar funciones externas como consultas a bases de datos o APIs.
- Generación de salidas estructuradas: útil para extraer información de textos y devolver JSON validable en pipelines de procesamiento de datos o integración con sistemas backend.
- Asistencia a la programación: puede emplearse para autocompletar, explicar fragmentos de código o generar borradores en editores e IDE, con revisión humana posterior.
- RAG sobre documentación corporativa: combinado con un sistema de recuperación, el modelo responde preguntas sobre manuales o bases de conocimiento internas, aprovechando el contexto largo para incorporar varios fragmentos recuperados.
- Atención al cliente automatizada de dominio acotado: con ajuste fino específico, puede gestionar conversaciones multi-turno sobre productos o servicios concretos, manteniendo el contexto de la interacción.
- Prototipado rápido y experimentación: su tamano reducido y su licencia abierta facilitan probar flujos agénticos y de generación estructurada en entornos de desarrollo sin grandes inversiones en infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos de Mudskipper 1.0 en la información disponible. La model card incluye una tabla de referencia con resultados del checkpoint base LiquidAI/LFM3-1.7B y modelos relacionados, pero la columna correspondiente a Mudskipper está intencionadamente vacía hasta que se evalúe directamente esta versión. No se reproducen cifras del modelo base como si fueran de Mudskipper.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 3,5 GB solo para pesos (1,73B parámetros × 2 bytes), más overhead de activaciones y caché KV, que puede elevar el consumo según la longitud de contexto.
- En cuantización de 8 bits: en torno a 1,8-2 GB para pesos; en 4 bits: aproximadamente 1-1,2 GB para pesos, más overhead.
- GPU recomendadas: tarjetas consumer como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB) son suficientes para el modelo en BF16 con contextos moderados; para contextos muy largos conviene disponer de más VRAM o recurrir a cuantización.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 8 GB o más en cuantización, y en BF16 en tarjetas con 8-12 GB para contextos no extremos.
- Opciones de despliegue: Transformers, vLLM y SGLang con safetensors/BF16; llama.cpp y aplicaciones compatibles con GGUF, requiriendo una build de llama.cpp que soporte la arquitectura del modelo y la plantilla de chat correcta.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Mudskipper 1.0 | 1,73B | 256K | LFM Open License v1.0 | Finetune de LFM3-1.7B; benchmarks propios no publicados |
| LiquidAI/LFM3-1.7B | 1,73B | 256K | LFM Open License v1.0 | Checkpoint base; arquitectura tri-híbrida idéntica |
| Alternativas de ~1-2B (p. ej. modelos pequenos de la familia Llama o Qwen) | ~1-2B | variable | variable | No se dispone de datos comparativos verificados en la información proporcionada |

La comparación cuantitativa con modelos de la misma categoría no está disponible en la información proporcionada; se recomienda consultar las cards oficiales de cada alternativa para contrastar parámetros, contexto y licencia.

## Limitaciones y advertencias

- Resultados de benchmarks propios no publicados: no hay evidencia empírica de mejora o degradación respecto al checkpoint base en las tareas declaradas.
- Riesgo de alucinación inherente a los modelos de lenguaje; la card recomienda verificación externa de tareas en flujos agénticos, ya que una respuesta que afirma éxito no constituye verificación.
- Cobertura multilingüe desigual: la card advierte que disponer de 16 idiomas no implica rendimiento homogéneo entre ellos ni entre tareas.
- Modelo solo texto: no soporta visión ni audio.
- Licencia LFM Open License v1.0: es una licencia "other" con condiciones específicas; debe revisarse el texto completo antes de cualquier uso comercial o redistribución.
- Compatibilidad de runtime: el uso con vLLM, SGLang o llama.cpp depende de que la versión del runtime soporte la arquitectura tri-híbrida y de que los archivos del repositorio estén completos y actualizados.
- Sin métricas de latencia ni throughput publicadas, lo que dificulta planificar dimensionamiento en producción.
- Sesgos conocidos: no documentados en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/imnooor/mudskipper-1
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
