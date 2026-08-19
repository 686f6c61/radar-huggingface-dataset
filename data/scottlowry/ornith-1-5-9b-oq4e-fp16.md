# scottlowry/Ornith-1.5-9B-oQ4e-fp16

## Resumen

Ornith-1.5-9B-oQ4e-fp16 es una cuantización de precisión mixta del modelo Ornith-1.5-9B, desarrollado por ornith-ai, una familia de modelos open-source orientados a tareas de razonamiento, agéntica y codificación. Esta versión concreta ha sido cuantizada por Scott Lowry (scottlowry) utilizando la librería oMLX (v0.6.2) con el formato oQ4e, que combina cuantización de 4 bits con un grupo de tamaño 64 y mantiene ciertos componentes en fp16. El resultado es un checkpoint en formato MLX safetensors de aproximadamente 7 GB, pensado para su uso en entornos Apple Silicon y otras plataformas compatibles con MLX.

El modelo original Ornith-1.5-9B es la variante densa de 9 mil millones de parámetros de la familia Ornith-1.5, que también incluye versiones MoE de 35B y 397B. Según la documentación del autor, está diseñado para lograr un rendimiento de vanguardia entre los modelos open-source de tamaño comparable en razonamiento, tareas agénticas y generación de código. Esta cuantización facilita su despliegue en hardware con recursos limitados, manteniendo un equilibrio entre calidad y eficiencia.

La relevancia de esta ficha radica en que ofrece una opción de modelo de 9B cuantizado para desarrolladores que necesitan ejecutar un asistente de codificación y razonamiento en entornos locales o edge, sin renunciar a la portabilidad que proporciona el formato MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (basada en Qwen3.5) |
| Parametros totales | 1.876.724.976 (checkpoint cuantizado; el modelo original es de ~9B, dato no disponible) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ4e: 4 bits, grupo de tamaño 64, precisión mixta con componentes fp16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo original Ornith-1.5-9B es un transformer denso de 9 mil millones de parámetros, parte de la familia Ornith-1.5 que también incluye variantes MoE. La arquitectura base se identifica como `qwen3_5`, lo que sugiere una derivación o adaptación de la arquitectura Qwen3.5. No se dispone de información detallada sobre el proceso de entrenamiento del modelo original, como el número de tokens utilizados, la composición del dataset o si se emplearon técnicas de RLHF o DPO.

La cuantización aplicada en este checkpoint utiliza oQ (oMLX v0.6.2), una herramienta de cuantización de precisión mixta que asigna 4 bits a la mayoría de los pesos con un grupo de tamaño 64, mientras que ciertas capas o componentes se mantienen en fp16 para preservar la calidad. El resultado es un archivo de 7 GB en formato MLX safetensors, optimizado para inferencia eficiente en hardware compatible con MLX.

## Capacidades

- Generación de texto y razonamiento de propósito general, con énfasis en tareas de codificación y uso agéntico según la documentación del autor.
- Razonamiento multi-paso y resolución de problemas complejos, orientado a escenarios de agente autónomo.
- Soporte de codificación en múltiples lenguajes, aunque no se especifican cuáles.
- Capacidades multilingües no documentadas en la información disponible.
- No se confirma explícitamente soporte de tool calling o function calling en esta cuantización, aunque el modelo original podría incluirlo; no hay datos al respecto.
- No se indica soporte de visión, audio u otras modalidades.

## Casos de uso

- Asistente de programación local: el modelo puede ejecutarse en una estación de trabajo con Apple Silicon (gracias al formato MLX) para autocompletar código, explicar fragmentos o generar funciones completas. Su tamaño de 9B permite tiempos de respuesta razonables sin necesidad de infraestructura en la nube.
- Desarrollo de agentes de codificación autónomos: dado el enfoque agéntico del modelo original, puede integrarse en pipelines que requieran razonamiento multi-paso, como la generación de parches, refactorización o resolución de issues en repositorios.
- Entornos de desarrollo integrado (IDE) con asistente offline: al ser una cuantización de 4 bits, puede cargarse en memoria de una GPU de consumo o en un Mac con suficiente RAM unificada, ofreciendo sugerencias de código sin conexión.
- Automatización de tareas de documentación técnica: el modelo puede generar comentarios de código, documentación de API o resúmenes de cambios, aprovechando su capacidad de razonamiento sobre estructuras de código.
- Educación y formación en programación: como asistente didáctico, puede explicar conceptos, depurar ejemplos o proponer ejercicios personalizados, funcionando en hardware modesto.
- Prototipado rápido de aplicaciones de procesamiento de lenguaje natural: al ser un modelo de 9B cuantizado, permite experimentar con generación de texto, análisis de sentimiento o extracción de información en entornos de desarrollo sin grandes requisitos de cómputo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización en la información disponible. La documentación del modelo original menciona que Ornith-1.5 logra un rendimiento de vanguardia entre los modelos open-source de tamaño comparable, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otros. Por tanto, no se incluyen tablas de comparación numérica.

## Requisitos de hardware

- El checkpoint cuantizado ocupa 7 GB en disco. Para inferencia en MLX, se recomienda un dispositivo Apple Silicon con al menos 16 GB de memoria unificada para cargar el modelo completo con margen para el contexto y el overhead del runtime.
- En GPUs NVIDIA, no es compatible directamente con MLX, pero podría convertirse a otros formatos (por ejemplo, GGUF o safetensors estándar) mediante herramientas de conversión. No se proporcionan requisitos de VRAM específicos para estos casos.
- Para uso en consumer GPU, si se convierte a un formato como GGUF cuantizado a 4 bits, cabría en una GPU con 8 GB de VRAM (por ejemplo, RTX 3070, RTX 4060) con posibles limitaciones de longitud de contexto.
- Opciones de despliegue: la librería principal es MLX (para Apple Silicon). No se mencionan compatibilidades con vLLM, llama.cpp u Ollama, aunque podrían funcionar tras conversión.
- No se dispone de datos de latencia o throughput para este modelo cuantizado.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos de tamaño similar (por ejemplo, Qwen2.5-7B, Llama-3.1-8B o Mistral-7B). Los datos de rendimiento del modelo original no están desglosados por benchmark, y esta cuantización no incluye mediciones propias. Se recomienda consultar la documentación oficial de Ornith AI para obtener comparativas a nivel de familia.

## Limitaciones y advertencias

- Al ser una cuantización de 4 bits, puede presentar una ligera degradación en la calidad de generación respecto al modelo original en fp16, especialmente en tareas que requieren precisión numérica o razonamiento complejo.
- La licencia del modelo no está especificada en la información proporcionada. Esto supone un riesgo para uso comercial, ya que no se conocen las restricciones de redistribución o modificación. Se debe contactar con el autor o con ornith-ai para aclarar los términos.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones idiomáticas del modelo. Se recomienda evaluar su comportamiento en el dominio de uso específico antes de desplegarlo en producción.
- La longitud de contexto no está documentada, lo que impide conocer los límites de memoria para conversaciones largas o procesamiento de documentos extensos.
- El formato MLX limita su uso a ecosistemas Apple; para otras plataformas se requiere conversión, lo que puede introducir incompatibilidades o pérdida de rendimiento.
- No se han publicado benchmarks propios de esta cuantización, por lo que su rendimiento real en tareas específicas debe ser validado por el usuario.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/scottlowry/Ornith-1.5-9B-oQ4e-fp16
- Página oficial de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Guía de Ornith AI (modelos, VRAM, benchmarks): https://ornith.online/
- Sitio principal de Ornith AI: https://ornith.ai/
- Perfil del autor de la cuantización: https://huggingface.co/scottlowry/models
- Repositorio de la herramienta oQ (oMLX): https://github.com/jundot/omlx
