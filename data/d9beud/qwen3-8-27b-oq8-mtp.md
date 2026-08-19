# d9beuD/Qwen3.8-27B-oQ8-mtp

## Resumen

El modelo `d9beuD/Qwen3.8-27B-oQ8-mtp` es una cuantización de precisión mixta de 8 bits del modelo Qwen3.8-27B, desarrollada por el usuario d9beuD mediante la herramienta oQ (oMLX v0.6.0.dev1). El modelo original, creado por el equipo Qwen, es un modelo denso de 27 mil millones de parámetros con capacidades nativas de visión-lenguaje, diseñado para tareas de codificación, trabajo profesional, investigación y tareas agénticas de horizonte largo. Esta cuantización reduce el tamaño del modelo para facilitar su ejecución en hardware con memoria limitada, manteniendo la mayor parte de la calidad gracias a la cuantización mixta con un tamaño de grupo de 64.

La relevancia de esta ficha radica en que Qwen3.8-27B es una de las últimas incorporaciones a la familia Qwen, con una ventana de contexto nativa de 262 000 tokens y control flexible del razonamiento. La versión cuantizada en formato MLX safetensors está pensada para dispositivos Apple Silicon, lo que permite ejecutar un modelo de 27B en equipos con memoria unificada de 32 GB o más. Aunque el repositorio no especifica la licencia, el modelo original se distribuye bajo Apache 2.0, por lo que esta cuantización hereda dicha licencia salvo indicación contraria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con encoder de visión (Qwen3.5 base) |
| Parametros totales | 27 000 millones (original); el repo indica 8 184 279 792 en safetensors, posiblemente un error del autor |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (nativo) |
| Tipos de cuantizacion | 8 bits (oQ8), grupo de 64, precisión mixta |
| Idiomas soportados | Multilingüe (no especificado en el repo, el original soporta múltiples idiomas) |
| Licencia | No disponible en el repo; el original es Apache 2.0 |
| Formato de pesos | MLX safetensors (cuantizado) |

## Arquitectura y entrenamiento

El modelo original Qwen3.8-27B se basa en la arquitectura de Qwen3.5, que es un transformer denso con un encoder de visión integrado, lo que le permite procesar imágenes y vídeo además de texto. Incorpora un mecanismo de control de razonamiento configurable, similar al modo thinking de otros modelos, que permite alternar entre respuestas rápidas y razonamiento profundo según la tarea. El entrenamiento se realizó con un enfoque en tareas de codificación, trabajo profesional, investigación y agentes de larga duración, con una ventana de contexto nativa de 262 000 tokens. No se dispone de detalles específicos sobre el número de tokens de entrenamiento ni sobre el uso de RLHF o DPO en la información proporcionada.

La cuantización aplicada por d9beuD utiliza la herramienta oQ de oMLX, que implementa cuantización de precisión mixta. Esto significa que diferentes capas del modelo se cuantizan con distintos niveles de precisión, optimizando el equilibrio entre tamaño y calidad. En este caso, se usa una cuantización de 8 bits con un tamaño de grupo de 64, lo que reduce el espacio de almacenamiento a aproximadamente 30 GB (según el tamaño del repositorio) en lugar de los ~54 GB que ocuparía el modelo en FP16.

## Capacidades

- Generación de texto y razonamiento complejo con control de pensamiento configurable (modo thinking activable o desactivable).
- Comprensión de imágenes y vídeo gracias al encoder de visión nativo, lo que permite responder preguntas sobre contenido visual.
- Generación de código y asistencia en tareas de programación, con soporte para múltiples lenguajes.
- Ejecución de tareas agénticas de largo horizonte, como planificación multi-paso y uso de herramientas.
- Soporte de function calling y tool calling, aunque no se detalla en la información proporcionada.
- Capacidades multilingües, aunque la lista exacta de idiomas no está especificada en el repositorio.
- Ventana de contexto de 262 000 tokens, adecuada para documentos largos y conversaciones extensas.

## Casos de uso

- Asistente de programación integrado en IDE: el modelo puede generar, revisar y explicar código en tiempo real, aprovechando su entrenamiento específico en tareas de codificación y su capacidad de razonamiento configurable para depurar errores complejos.
- Análisis de documentos extensos: con una ventana de contexto de 262 000 tokens, puede procesar libros completos, informes técnicos o expedientes legales sin necesidad de dividirlos, resumiendo y extrayendo información relevante.
- Agente autónomo para automatización de tareas: gracias a su soporte de tool calling y razonamiento multi-paso, puede orquestar flujos de trabajo como gestión de correos, programación de citas o integración con APIs, ejecutando acciones de forma secuencial.
- Análisis de imágenes y vídeo en entornos profesionales: el encoder de visión permite inspeccionar imágenes médicas (con las debidas precauciones), revisar vídeos de vigilancia o analizar capturas de pantalla para documentación técnica.
- Chatbot de atención al cliente con contexto largo: puede mantener conversaciones de múltiples turnos recordando todo el historial, gracias a su gran ventana de contexto, y derivar a agentes humanos cuando sea necesario.
- Investigación académica: para revisión de literatura, generación de hipótesis y resumen de artículos científicos, el modelo puede manejar documentos técnicos extensos y razonar sobre ellos con precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta cuantización específica. Sin embargo, según la búsqueda web, el modelo original Qwen3.8-27B tiene benchmarks publicados por el equipo de Qwen, aunque no se incluyen los valores numéricos en las fuentes consultadas. Se recomienda consultar la página oficial del modelo original para obtener datos de rendimiento en tareas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- El formato MLX safetensors está diseñado exclusivamente para Apple Silicon (Macs con chips M1, M2, M3 o superiores).
- Memoria unificada necesaria: al menos 32 GB para cargar el modelo en 8 bits (27 GB de pesos más overhead de ejecución). Se recomienda 64 GB para trabajar con contexto largo.
- En GPUs NVIDIA, este formato no es directamente ejecutable; sería necesario convertir los pesos a otro formato (por ejemplo, FP16 o GGUF) mediante herramientas como llama.cpp o vLLM.
- Opciones de despliegue: oMLX (biblioteca de inferencia para Apple Silicon), LM Studio (con soporte para MLX), o conversión a otros formatos para vLLM o SGLang en clústeres con GPUs.
- La latencia y el throughput dependen del hardware; en un Mac Studio con M2 Ultra (76 GB de memoria unificada) se pueden esperar velocidades de decodificación de decenas de tokens por segundo, aunque no se dispone de cifras exactas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262K | Apache 2.0 | FP16/BF16 | Modelo base sin cuantizar |
| d9beuD/Qwen3.8-27B-oQ8-mtp | 27B (original) | 262K | Apache 2.0 (heredada) | MLX 8-bit | Cuantización para Apple Silicon |
| Qwen2.5-32B (referencia) | 32B | 128K | Apache 2.0 | FP16 | Modelo anterior de la misma familia, sin visión |

No se dispone de datos de rendimiento comparativos entre estas opciones en las fuentes consultadas.

## Limitaciones y advertencias

- El repositorio no especifica la licencia, aunque el modelo original es Apache 2.0; se debe confirmar antes de un uso comercial.
- La cuantización de 8 bits puede introducir una ligera degradación en la calidad de las respuestas, especialmente en tareas de razonamiento complejo o generación de código, en comparación con el modelo en precisión completa.
- El formato MLX solo funciona en Apple Silicon; no es compatible directamente con GPUs NVIDIA o AMD.
- El número de parámetros indicado en los safetensors (8 184 279 792) no coincide con el tamaño nominal de 27B, lo que sugiere un posible error en la metadata del autor; se recomienda verificar la integridad del modelo antes de usarlo.
- No se han documentado sesgos específicos, pero como modelo entrenado con datos de internet, puede reflejar sesgos sociales, culturales o de género presentes en esos datos.
- Existe riesgo de alucinación en contextos de alta incertidumbre; se recomienda validar las respuestas en aplicaciones críticas.
- La ventana de contexto de 262K tokens consume una cantidad significativa de memoria durante la inferencia; el uso de contexto máximo puede requerir más de 32 GB de RAM.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/d9beuD/Qwen3.8-27B-oQ8-mtp
- Modelo original (referencia): https://huggingface.co/mcsplain/Qwen3.8-27B-oQ8-mtp (espejo no oficial)
- Página de LM Studio: https://lmstudio.ai/models/qwen3.8
- Blog de AMD sobre ejecución local: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Ficha de benchmarks y especificaciones: https://aireleasetracker.com/model/qwen/qwen3.8-27b
- Guía de hardware y despliegue: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Herramienta de cuantización oQ: https://github.com/jundot/omlx
