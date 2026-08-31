# inferenceport-ai/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16-Q4_K_M-GGUF

## Resumen

NVIDIA-Nemotron-3.5-Lightning-30B-A3B es un modelo de lenguaje de gran tamaño (LLM) desarrollado por NVIDIA, diseñado específicamente para tareas de razonamiento y chat en agentes de IA especializados. Se trata de un modelo de arquitectura MoE (Mixture of Experts) con 30 mil millones de parámetros totales, de los cuales solo 3 mil millones se activan por token, lo que permite una inferencia eficiente y de baja latencia, ideal para entornos de producción con recursos limitados. El modelo original se publica en precisión BF16 y está pensado principalmente para personalización y post-entrenamiento, aunque también puede usarse para inferencia directa.

La versión aquí descrita es una conversión a formato GGUF (cuantización Q4_K_M) realizada por el usuario inferenceport-ai, que facilita su ejecución con llama.cpp y otras herramientas compatibles. Esta conversión mantiene las capacidades del modelo original, incluyendo soporte multilingüe en seis idiomas (inglés, español, francés, alemán, italiano y japonés), y está disponible bajo la licencia openmdw-1.1 de NVIDIA. Su relevancia radica en combinar un tamaño moderado con una alta eficiencia computacional, lo que lo convierte en una opción atractiva para desplegar agentes conversacionales y sistemas de razonamiento en entornos con restricciones de hardware.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) transformer |
| Parametros totales | 31.577.940.288 (31,58B) |
| Parametros activos | 3B (según denominación A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (archivo actual); otros no especificados |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | openmdw-1.1 |
| Formato de pesos | GGUF (Q4_K_M); safetensors (BF16 original) |

## Arquitectura y entrenamiento

El modelo base NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 emplea una arquitectura de mezcla de expertos (MoE) sobre una base transformer, con 30B parámetros totales y solo 3B activos por token. Esta configuración permite reducir significativamente el coste computacional durante la inferencia, manteniendo una capacidad de razonamiento comparable a modelos densos de mayor tamaño. Los detalles exactos del entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no se han publicado en la información disponible. Se sabe que NVIDIA utilizó sus datasets propietarios de pre-entrenamiento y post-entrenamiento (nvidia/nemotron-pre-training-datasets y nvidia/nemotron-post-training-v3), con una fecha de corte de datos de post-entrenamiento en mayo de 2026. La versión GGUF aquí descrita es una conversión directa del modelo BF16 mediante llama.cpp, sin modificaciones en los pesos.

## Capacidades

- Generación de texto y chat conversacional de propósito general.
- Razonamiento lógico y resolución de problemas en múltiples dominios.
- Soporte multilingüe para seis idiomas: inglés, español, francés, alemán, italiano y japonés.
- Adecuado para tareas de agentes especializados gracias a su eficiencia computacional (3B activos).
- Capacidad de personalización y post-entrenamiento sobre el modelo base (según NVIDIA).
- No se especifican capacidades de tool calling, visión, audio u otras modalidades.

## Casos de uso

- Asistentes virtuales para atención al cliente: el modelo puede gestionar conversaciones multi-turno en tiempo real gracias a su baja latencia (solo 3B parámetros activos), lo que permite respuestas rápidas en entornos de alta concurrencia.
- Automatización de tareas de razonamiento en agentes de IA: su arquitectura MoE eficiente lo hace adecuado para ejecutar subtareas de planificación y análisis en pipelines de agentes, reservando modelos más grandes para decisiones complejas.
- Generación de código y asistencia en desarrollo: aunque no se documenta soporte explícito de tool calling, su capacidad de razonamiento permite generar fragmentos de código, explicaciones y depuración en entornos de desarrollo.
- Resumen y análisis de documentos: puede procesar y resumir textos extensos en varios idiomas, útil para sistemas de gestión documental y extracción de información.
- Chatbots multilingües para plataformas de comercio electrónico: su soporte para seis idiomas facilita la atención a clientes internacionales sin necesidad de modelos separados.
- Prototipado rápido de aplicaciones de lenguaje natural: al estar disponible en GGUF, se puede integrar fácilmente en entornos de desarrollo con llama.cpp u Ollama para pruebas y validación de conceptos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El archivo GGUF Q4_K_M tiene un tamaño de repositorio de 24,5 GB, por lo que se requiere al menos esa cantidad de almacenamiento.
- La VRAM necesaria para cargar el modelo cuantizado no se especifica, pero al ser un MoE con 3B activos, la inferencia puede ejecutarse en GPUs de consumo medio (p. ej., RTX 3060 o superior) o incluso en CPU con suficiente RAM.
- Compatible con llama.cpp, llama-server, Ollama y otras herramientas que soporten formato GGUF.
- La latencia y el throughput dependen del hardware; no se proporcionan cifras oficiales, pero la arquitectura MoE con pocos parámetros activos suele ofrecer velocidades de generación superiores a modelos densos de tamaño equivalente.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de la misma categoría (mismo tamaño o misma tarea). Se recomienda consultar benchmarks independientes o evaluar el modelo en el hardware objetivo.

## Limitaciones y advertencias

- El modelo original está pensado principalmente para personalización y post-entrenamiento, no para inferencia directa en producción (según NVIDIA). Esto implica que puede requerir ajuste fino para tareas específicas.
- La licencia openmdw-1.1 es una licencia no estándar de NVIDIA; es necesario revisar sus términos para uso comercial y redistribución.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos de NVIDIA, puede heredar sesgos presentes en esos datos.
- La longitud de contexto no se ha especificado, por lo que se desconoce su capacidad para manejar documentos muy largos.
- No se garantiza soporte para tool calling, funciones o integraciones avanzadas, ya que no se mencionan en la documentación.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/inferenceport-ai/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16-Q4_K_M-GGUF
- Modelo original en HuggingFace: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Página de NVIDIA NIM para el modelo: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b/modelcard
- Página de NVIDIA Developer sobre Nemotron: https://developer.nvidia.com/topics/ai/nemotron
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
