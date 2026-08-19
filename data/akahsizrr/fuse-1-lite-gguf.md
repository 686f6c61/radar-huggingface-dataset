# Akahsizrr/fuse-1-Lite-GGUF

## Resumen

Fuse3 (también referido como fuse-1 Lite) es un modelo de lenguaje desarrollado por el usuario Akahsizrr que combina una arquitectura base LFM2 con un conjunto de expertos MoE (Mixture of Experts) orientados a tareas de codificación, inspirados en los modelos Qwen3.6. El resultado es un modelo híbrido de aproximadamente 5,72 mil millones de parámetros que se distribuye en formato GGUF para su uso con llama.cpp, lo que permite su ejecución en hardware de consumo mediante cuantización selectiva. Su relevancia radica en que demuestra cómo extender un modelo base con módulos expertos especializados sin necesidad de reentrenar toda la arquitectura, y ofrece una integración práctica con el ecosistema llama.cpp.

El repositorio incluye los archivos fuente necesarios para compilar llama.cpp con soporte para esta arquitectura, así como scripts para exportar y cuantizar el modelo. Aunque no se especifican datos de entrenamiento ni licencia, la disponibilidad de pesos y herramientas lo convierte en una opción interesante para experimentación en generación de código y conversación técnica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (host) + MoE (expertos SwiGLU) |
| Parametros totales | 5.719.063.582 (~5,72 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q8_0 (solo pesos del host; expertos en f16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (con safetensors originales) |

## Arquitectura y entrenamiento

La arquitectura de Fuse3 se compone de un modelo base LFM2 que utiliza atención estándar (Lfm2AttentionDecoderLayer) y capas de convolución corta (Lfm2ShortConvDecoderLayer), junto con bloques FFN densos basados en SwiGLU. Sobre esta base, el modelo añade bloques MoE personalizados en un subconjunto de capas (denominadas "augmented layers"). Cada bloque MoE consta de un router que aplica `sqrtsoftplus(x @ router_weight)` para seleccionar los top-k expertos, seguido de normalización y una combinación ponderada de las salidas de los expertos, escalada mediante un parámetro aprendido con `softplus` y limitado a 0,1.

Los expertos son FFN SwiGLU independientes con proyecciones gate, up y down. Durante la inferencia, la salida del host se combina con la salida de los expertos mediante `host_output + scale * expert_output`. En cuanto al entrenamiento, no se proporciona información sobre el número de tokens, composición del dataset ni técnicas de alineación como RLHF o DPO. La innovación principal reside en la implementación para llama.cpp, que permite cuantizar únicamente los pesos del host mientras los expertos se mantienen en f16 para preservar la calidad, dado su tamaño reducido (aproximadamente 200 MB en total).

## Capacidades

- Generación de texto conversacional, como indica la etiqueta "conversational".
- Generación de código, gracias a los expertos especializados en programación (basados en Qwen3.6).
- Ejecución local mediante llama.cpp, con soporte para cuantización selectiva.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- No se documentan capacidades explícitas de tool calling, agentes o razonamiento multi-paso.

## Casos de uso

- Asistente de programación local: el modelo puede generar funciones, explicar fragmentos de código y ayudar en tareas de desarrollo gracias a sus expertos de codificación. Su formato GGUF permite ejecutarlo en máquinas sin GPU de gama alta.
- Chat técnico integrado en aplicaciones: al ser compatible con endpoints, puede desplegarse como backend para chatbots de soporte técnico o foros de desarrollo, siempre que se respete la licencia (aún no definida).
- Experimentación con arquitecturas MoE: investigadores pueden estudiar el comportamiento de la mezcla de expertos sobre una base LFM2, ya que los archivos fuente y la documentación de integración facilitan la modificación y el análisis.
- Generación de documentación de código: el modelo puede redactar comentarios, docstrings y guías de uso a partir de código fuente, aprovechando su especialización en programación.
- Prototipado de asistentes de línea de comandos: gracias a la integración con llama.cpp, es posible crear herramientas CLI que respondan a consultas de código o conversación sin depender de servicios en la nube.
- Evaluación de cuantización selectiva: el esquema que mantiene los expertos en f16 mientras cuantiza el host puede servir como caso de estudio para optimizar el equilibrio entre rendimiento y calidad en modelos híbridos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de VRAM ni GPU recomendadas.
- Basándose en el tamaño de parámetros (~5,72 B) y la cuantización Q4_K_M, se estima que el modelo podría requerir entre 3 y 4 GB de VRAM para inferencia, incluyendo los expertos en f16. Esta cifra es orientativa y no ha sido confirmada por el autor.
- La integración con llama.cpp permite su ejecución en CPU mediante compilación estándar, aunque con menor velocidad.
- Opciones de despliegue: llama.cpp (compilado con los parches proporcionados), y potencialmente otros motores compatibles con GGUF como Ollama, siempre que soporten la arquitectura personalizada.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se han publicado comparaciones con otros modelos de tamaño similar, y la arquitectura híbrida LFM2+MoE no tiene equivalentes directos en el ecosistema GGUF conocido.

## Limitaciones y advertencias

- Licencia no especificada: no se puede determinar si el modelo es apto para uso comercial sin consultar al autor.
- Sin información sobre sesgos, alucinaciones o comportamiento en dominios fuera de código y conversación general.
- La integración con llama.cpp requiere aplicar parches manuales a los archivos fuente, lo que puede introducir inestabilidad o incompatibilidades con versiones futuras.
- Los expertos se mantienen en f16, lo que aumenta ligeramente el uso de memoria en comparación con una cuantización completa.
- No hay garantías de soporte ni mantenimiento por parte del autor.
- El tamaño del repositorio (252,1 GB) sugiere que se incluyen múltiples archivos o versiones, lo que puede complicar la descarga y el almacenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/Akahsizrr/fuse-1-Lite-GGUF
- No se proporcionan otros enlaces (papers, blogs, repositorios adicionales).
