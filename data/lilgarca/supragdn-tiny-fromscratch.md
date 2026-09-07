# Lilgarca/SupraGDN-Tiny-FromScratch

## Resumen

SupraGDN-Tiny-FromScratch es un modelo de lenguaje de tamaño mínimo desarrollado por Lilgarca, con solo 2552 parámetros. Se trata de un experimento de entrenamiento desde cero que busca explorar los límites de los modelos diminutos, comparándose con otro modelo de la misma categoría (Ksjsjjdj, con 2784 parámetros). Su arquitectura es SupraLabs GatedFlow, que combina un state mixer, atención con ventana y una FFN triádica, con d_model 8 y un único bloque, además de embeddings atados. El modelo se entrena en dos etapas: preentrenamiento en el corpus tiny_shakespeare y posterior ajuste supervisado con datos sintéticos v4. No se dispone de información sobre la longitud de contexto, licencia o idiomas soportados. Su relevancia radica en servir como referencia académica y educativa para estudiar el comportamiento de arquitecturas modernas en escalas extremadamente reducidas, más que como una herramienta útil para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SupraLabs GatedFlow (state mixer + windowed attention + triadic FFN), d_model 8, 1 bloque, embeddings atados |
| Parametros totales | 2552 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura del modelo, denominada SupraLabs GatedFlow, es un diseño híbrido que combina un state mixer (mezclador de estados), atención con ventana (windowed attention) y una FFN triádica. Con d_model 8 y un único bloque, se trata de una red extremadamente compacta. Los embeddings están atados, lo que reduce el número de parámetros. El tokenizer es a nivel de caracteres, con 123 tokens y los mismos tokens especiales que Ksjsjjdj, incluyendo `<tool_call>`, tokens de thinking/response y formato ChatML.

El entrenamiento se divide en dos etapas. La primera es un preentrenamiento sobre tiny_shakespeare durante 2000 pasos, con una tasa de aprendizaje que va de 2e-4 a 0, siguiendo la receta de Ksjsjjdj. La segunda etapa es un ajuste supervisado (SFT) sobre datos sintéticos v4 que cubren instrucciones, código, historia, ciencia, razonamiento, herramientas, hex, base64 y retención, también durante 2000 pasos. No se menciona RLHF ni DPO. La innovación técnica destacable es la combinación de mecanismos de atención con ventana y mezcla de estados en un modelo tan pequeño, lo que permite explorar cómo estas técnicas interactúan en escalas mínimas.

## Capacidades

- Generación de texto a nivel de caracteres, condicionada por el corpus de Shakespeare.
- Soporte de formato de tool calling: incluye el token `<tool_call>`, por lo que puede emitir llamadas a herramientas en el formato esperado, aunque con una fiabilidad muy limitada.
- Soporte de formato ChatML, con tokens de sistema, usuario y asistente.
- Modo thinking: incluye tokens de pensamiento/respuesta, pero no hay evidencia de razonamiento real dada la cantidad de parámetros.
- Capacidades multilingües: no disponibles.
- Capacidades de visión: no disponibles.
- Integración en pipelines de agente: puede ejecutarse con el script `agent.py` proporcionado por el autor, pero su capacidad de decisión es simbólica.

## Casos de uso

- Investigación en interpretabilidad: al tener menos de 3k parámetros, es posible visualizar y analizar todos los pesos del modelo para estudiar cómo se forman las representaciones internas en una arquitectura con state mixer y atención.
- Educación en arquitecturas de IA: sirve como ejemplo mínimo y ejecutable en CPU de un modelo con componentes modernos, ideal para cursos de introducción a transformers.
- Benchmark de eficiencia de entrenamiento: permite probar recetas de optimización, schedulers de LR y estrategias de SFT en pocos minutos, comparando resultados con otros modelos diminutos.
- Experimentos de tokenización: al usar un tokenizer char-level, se puede estudiar el impacto de vocabularios pequeños en la generación y el sobreajuste.
- Prototipos de agentes conversacionales: con el formato ChatML y tool calling, se puede montar una demo sencilla de agente en local, sin necesidad de GPU, para enseñar flujos de conversación.
- Generación de texto estilizado: dado que se entrenó con tiny_shakespeare, puede producir fragmentos con un estilo arcaico, útil para experimentos creativos o de análisis de sesgos lingüísticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni de otras métricas habituales. La ausencia de evaluaciones es esperable en un modelo de estas dimensiones, orientado a investigación experimental.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 MB, ya que 2552 parámetros ocupan unos pocos kilobytes en cualquier precisión.
- GPU recomendada: cualquier GPU, incluidas GPU integradas o de gama baja; también funciona en CPU.
- Cabe en cualquier consumer GPU, incluso en microcontroladores con suficiente memoria.
- Opciones de despliegue: carga directa del archivo safetensors mediante Python; no es compatible con vLLM, llama.cpp, Ollama ni TGI, dado su carácter experimental y su tokenizer personalizado.
- Latencia y throughput: no disponibles, pero al ser tan pequeño, la latencia es despreciable en cualquier hardware moderno.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el mismo rango de parámetros. El autor menciona en la model card una comparación con Ksjsjjdj (2784 parámetros), pero no se han publicado especificaciones ni resultados de ese modelo. Por tanto, la comparativa no está disponible. Como referencia de la familia SupraGDN, existe el modelo SupraLabs/SupraGDN-5M, con 5 millones de parámetros y arquitectura GatedDeltaNet, pero su escala es muy superior y no constituye una alternativa directa.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo fue entrenado en tiny_shakespeare, por lo que su lenguaje es predominantemente arcaico y refleja los sesgos de género, clase y época presentes en esa obra.
- Riesgo de alucinación: extremadamente alto. Con 2552 parámetros, el modelo no puede almacenar conocimiento factual fiable y tiende a generar secuencias plausibles pero sin sentido.
- Limitaciones de contexto: la longitud de contexto no está documentada. Dado el tokenizer char-level y la arquitectura mínima, es muy probable que sea corta.
- Restricciones de licencia: no se especifica licencia, por lo que el uso comercial es incierto y no se recomienda sin consultar al autor.
- No apto para producción: su capacidad de razonamiento, comprensión del lenguaje y soporte de herramientas es simbólica; cualquier uso real de agentes o generación de código debe descartarse en este modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lilgarca/SupraGDN-Tiny-FromScratch
- Página del autor en HuggingFace: https://huggingface.co/Lilgarca
- Modelo de referencia de la familia SupraGDN: https://huggingface.co/SupraLabs/SupraGDN-5M
