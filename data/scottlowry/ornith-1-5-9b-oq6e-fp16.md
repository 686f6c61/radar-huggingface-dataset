# scottlowry/Ornith-1.5-9B-oQ6e-fp16

## Resumen

Ornith-1.5-9B-oQ6e-fp16 es una cuantización mixta de precisión del modelo Ornith-1.5-9B, desarrollada por Scott Lowry mediante la herramienta oQ (oMLX v0.6.2). El modelo base pertenece a la familia Ornith-1.5 de ornith.ai, una serie de modelos de lenguaje de propósito general diseñados para razonamiento, tareas de agente y codificación. Esta versión cuantizada reduce la huella de memoria del modelo original al usar 6 bits por peso con un tamaño de grupo de 64, manteniendo un equilibrio entre rendimiento y eficiencia para su ejecución en hardware Apple Silicon a través del ecosistema MLX.

La relevancia de esta ficha radica en que la cuantización permite desplegar un modelo de 9B parámetros (según su denominación) en dispositivos con memoria unificada limitada, como Macs con 16 GB de RAM, sin necesidad de servidores dedicados. El formato MLX safetensors es nativo para el framework MLX de Apple, lo que facilita su integración en aplicaciones locales de inferencia. Aunque el repositorio no especifica licencia ni idiomas, la familia Ornith-1.5 se presenta como una alternativa open source de alto rendimiento en su categoría, con variantes que van desde 9B densos hasta 397B MoE.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (basada en Qwen 3.5, transformer denso) |
| Parametros totales | 2.432.736.496 (según safetensors; el modelo base se anuncia como 9B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 6 bits, group size 64, precisión mixta (oQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B es un transformer denso con arquitectura qwen3_5, lo que indica que sigue el diseño de la serie Qwen 3.5 de Alibaba. No se dispone de detalles específicos sobre el número de capas, dimensiones ocultas o mecanismos de atención, ni sobre el proceso de entrenamiento (tokens totales, composición del dataset, uso de RLHF o DPO). La cuantización aplicada por Scott Lowry utiliza oQ (oMLX v0.6.2), una herramienta que realiza cuantización de precisión mixta, asignando 6 bits a los pesos con un tamaño de grupo de 64. Este enfoque reduce el tamaño del modelo en memoria y acelera la inferencia en hardware Apple, aunque puede introducir una ligera pérdida de calidad respecto al modelo en fp16 original.

La familia Ornith-1.5, según la información publicada por ornith.ai, está diseñada para "inteligencia general de propósito fuerte" en tareas de razonamiento, agente y codificación, logrando resultados de última generación entre modelos open source de tamaño comparable. Sin embargo, no se han publicado detalles técnicos del entrenamiento en la información disponible.

## Capacidades

- Razonamiento complejo: el modelo base está optimizado para tareas de razonamiento lógico y matemático, según la descripción de ornith.ai.
- Tareas de agente: soporta flujos de trabajo multi-paso y toma de decisiones autónoma, aunque no se especifica si incluye tool calling explícito.
- Generación de código: diseñado específicamente para codificación, incluyendo generación, depuración y refactorización de código en múltiples lenguajes.
- Uso en entornos locales: gracias a la cuantización MLX, puede ejecutarse en Macs con Apple Silicon sin conexión a internet.
- Multilingüismo: no se dispone de información sobre los idiomas soportados, aunque por su base qwen3_5 es probable que tenga cobertura multilingüe, pero no está confirmado.
- Inferencia eficiente: el formato de 6 bits reduce los requisitos de memoria y acelera la inferencia en comparación con el modelo fp16 original.

## Casos de uso

- Asistente de codificación local: un desarrollador puede ejecutar el modelo en un MacBook Pro con Apple Silicon para obtener sugerencias de código, completar funciones o detectar errores sin enviar datos a la nube. La cuantización de 6 bits permite que el modelo quepa en memoria unificada de 16 GB.
- Agente de automatización de tareas: el modelo puede integrarse en scripts que requieran razonamiento multi-paso, como la planificación de rutas, la organización de archivos o la generación de informes a partir de datos estructurados.
- Entorno de desarrollo integrado (IDE) con IA: se puede conectar a editores como VS Code o Neovim mediante servidores de inferencia local (por ejemplo, a través de MLX-LM) para proporcionar autocompletado y chat contextual.
- Prototipado rápido de aplicaciones de IA: investigadores y desarrolladores pueden usar el modelo para validar ideas de productos sin incurrir en costes de API, gracias a su despliegue local.
- Educación y formación en IA: el modelo sirve como ejemplo práctico de cuantización y despliegue en edge, permitiendo a estudiantes experimentar con modelos de lenguaje en hardware asequible.
- Procesamiento de documentos con privacidad: empresas que manejan datos sensibles pueden ejecutar el modelo localmente para resumir, extraer información o clasificar documentos sin exponer la información a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización (Ornith-1.5-9B-oQ6e-fp16) en la información disponible. La web de ornith.ai afirma que la familia Ornith-1.5 logra rendimiento de última generación entre modelos open source de tamaño comparable, pero no proporciona cifras concretas en los fragmentos recuperados. Se recomienda consultar el repositorio del modelo base o los informes técnicos oficiales para obtener datos de evaluación.

## Requisitos de hardware

- VRAM estimada: el modelo cuantizado a 6 bits con 2.43B parámetros (según safetensors) requiere aproximadamente 1.8-2.5 GB de memoria para los pesos, más overhead de activaciones. En la práctica, se recomienda un Mac con al menos 16 GB de memoria unificada para una experiencia fluida.
- GPU recomendadas: cualquier Mac con Apple Silicon (M1, M2, M3, M4 o superior). No es compatible con GPUs NVIDIA o AMD sin una conversión adicional del formato.
- Compatibilidad con consumer GPU: no aplica, ya que el formato MLX es exclusivo del ecosistema Apple.
- Opciones de despliegue: se puede ejecutar con oMLX (el framework que incluye oQ), o con MLX-LM de Apple. También es posible convertirlo a otros formatos (GGUF, etc.) mediante herramientas de conversión, aunque no se proporcionan instrucciones en el repositorio.
- Latencia y throughput: no se dispone de datos medidos. En un Mac con M2 Pro, se espera una velocidad de generación de entre 10 y 30 tokens por segundo para un modelo de este tamaño, dependiendo de la memoria y la optimización.

## Comparativa con modelos similares

Dado que no se dispone de datos de rendimiento ni especificaciones completas del modelo base, la comparación se limita a aspectos estructurales y de disponibilidad. Se comparan con otros modelos densos de tamaño similar (7-9B) comúnmente usados en entornos locales.

| Modelo | Parametros | Contexto | Licencia | Formato de pesos | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-9B (cuantizado oQ6e) | ~2.43B (cuantizado) | No disponible | No disponible | MLX safetensors | Cuantización de 6 bits para Apple Silicon |
| Qwen2.5-7B | 7.6B | 128K | Apache 2.0 | safetensors, GGUF | Modelo base popular, soporte multilingüe |
| Llama-3.1-8B | 8.0B | 128K | Llama 3.1 License | safetensors, GGUF | Amplio ecosistema de herramientas |
| Gemma-2-9B | 9.2B | 8K | Gemma License | safetensors, GGUF | Orientado a investigación y despliegue ligero |

La comparación muestra que Ornith-1.5-9B carece de información pública sobre contexto y licencia, lo que dificulta su adopción en entornos comerciales. Las alternativas como Qwen2.5-7B ofrecen licencias permisivas y mayor documentación.

## Limitaciones y advertencias

- Cuantización de 6 bits: puede provocar una degradación notable en tareas de razonamiento complejo o generación de código largo en comparación con el modelo en fp16 o con cuantizaciones de mayor precisión (8 bits).
- Licencia no especificada: el repositorio no indica la licencia del modelo base ni de la cuantización. Esto impide su uso comercial sin una revisión legal previa y puede violar los términos de uso del modelo original si no se respetan.
- Falta de documentación técnica: no se proporcionan detalles sobre el contexto máximo, idiomas soportados, ni el proceso de entrenamiento del modelo base. Esto limita la evaluación de riesgos de sesgo o alucinación.
- Dependencia de Apple Silicon: el formato MLX no es portable a GPUs de otros fabricantes sin conversión, lo que restringe su uso a hardware Apple.
- Sin benchmarks verificados: no hay evidencia pública de que esta cuantización mantenga las capacidades declaradas del modelo base. Se recomienda realizar pruebas propias antes de desplegarlo en producción.
- Posible desactualización: el modelo base Ornith-1.5 es relativamente nuevo (creado en 2026-08-19) y puede no tener aún un ecosistema maduro de herramientas y soporte comunitario.

## Enlaces

- Repositorio de HuggingFace de la cuantización: https://huggingface.co/scottlowry/Ornith-1.5-9B-oQ6e-fp16
- Modelo base (ornith-ai/Ornith-1.5-9B): https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Página oficial de Ornith AI: https://ornith.ai/
- Blog de Ornith-1.5 (self-scaffolding a self-improvement): https://ornith.ai/ornith_1_5.html
- Repositorio de oMLX (herramienta de cuantización): https://github.com/jundot/omlx
- Búsqueda de modelos cuantizados de Ornith-1.5-9B en HuggingFace: https://huggingface.co/models?other=base_model:quantized:ornith-ai/Ornith-1.5-9B
