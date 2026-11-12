# Edge0/Edge0-145B-q3k

## Resumen

Edge0-145B-q3k es una cuantización GGUF de 4 bits del modelo base Qwen/Qwen3.8-Flash-Next, publicada por el usuario Edge0 bajo licencia Apache 2.0. Según la información disponible, se trata de un modelo de arquitectura Mixture of Experts (MoE) orientado a inferencia en el borde (edge-inference) y a tareas de agente y generación de código. La nomenclatura del repositorio sugiere un tamaño nominal de 145B parámetros, aunque el dato real declarado en safetensors es de 4.947.698.560 parámetros, una discrepancia significativa que conviene tener en cuenta.

El modelo se distribuye en formato GGUF con cuantización q3k (4 bits) y un tamaño de repositorio de 105,4 GB, lo que resulta coherente con un modelo de gran tamaño cuantizado a baja precisión. La model card menciona explícitamente las etiquetas `latent-moe`, `edge-inference`, `agent` y `coding`, lo que sitúa al modelo en el segmento de asistentes de código y agentes autónomos desplegables en hardware limitado.

La relevancia de esta ficha es limitada por la escasez de información verificable: no se publican benchmarks, no se detalla la composición del dataset de entrenamiento, no se especifican los idiomas soportados y la model card no incluye datos técnicos sustantivos más allá de las etiquetas. El repositorio registra 0 descargas y 1 like en el momento de la consulta, lo que indica una adopción prácticamente nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con variante "latent-moe", según etiquetas del autor; detalles no disponibles |
| Parametros totales | 4.947.698.560 (dato real declarado en safetensors); el nombre del repositorio indica 145B, discrepancia no aclarada |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q3k (4 bits, formato GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de 105,4 GB) |

## Arquitectura y entrenamiento

La información disponible indica que el modelo emplea una arquitectura Mixture of Experts, con la etiqueta específica `latent-moe`, que sugiere una variante de MoE con representaciones latentes, aunque no se detalla en qué consiste esta innovación ni cómo difiere de un MoE convencional. El modelo base es Qwen/Qwen3.8-Flash-Next, del que no se proporcionan especificaciones en la información consultada. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO u otras fases de alineación.

La model card no incluye detalles sobre innovaciones técnicas como decodificación especulativa, atención lineal o mecanismos de enrutamiento de expertos. La única información técnica concreta es la cuantización q3k a 4 bits y la orientación explícita a inferencia en el borde y a cargas de trabajo de agente y código. No se especifica si el proceso de cuantización fue realizado por el autor o si se heredó del modelo base.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` y la pipeline `text-generation`.
- Orientación a tareas de agente (`agent`), aunque no se detalla el soporte concreto de tool calling o function calling.
- Generación de código (`coding`), sin especificación de lenguajes ni benchmarks asociados.
- Inferencia en el borde (`edge-inference`), lo que sugiere optimización para hardware con recursos limitados.
- Compatibilidad con endpoints (`endpoints_compatible`), según las etiquetas del repositorio.
- Soporte de CUDA (`cuda`), indicado en las etiquetas.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Asistencia de código en local: el formato GGUF y la cuantización q3k permiten desplegar el modelo en estaciones de trabajo con GPU de consumo, integrándolo en editores o terminales para autocompletado y generación de fragmentos de código sin depender de la nube.
- Agentes autónomos en el borde: la etiqueta `agent` sugiere su uso en pipelines de razonamiento multi-paso ejecutados en dispositivos locales, aunque la ausencia de documentación sobre tool calling obliga a validar esta capacidad empíricamente antes de producción.
- Procesamiento por lotes de texto en servidores modestos: el tamaño del repositorio (105,4 GB) y la cuantización a 4 bits permiten servir el modelo con vLLM o llama.cpp en una única GPU de 80 GB o en configuraciones multi-GPU, para tareas de generación masiva.
- Experimentación e investigación: al ser un modelo derivado de Qwen3.8-Flash-Next con licencia Apache 2.0, puede utilizarse como base para fine-tuning o para estudiar el comportamiento de arquitecturas MoE cuantizadas.
- Despliegue en entornos con requisitos de privacidad: al poder ejecutarse en hardware propio, encaja en escenarios donde los datos no pueden salir de la infraestructura del cliente, como análisis de documentos internos o generación de código sobre repositorios privados.
- Evaluación comparativa de cuantizaciones: útil para medir la degradación de calidad de q3k frente a otras precisiones del mismo modelo base, siempre que se disponga de un conjunto de evaluación propio, dado que no hay benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio GGUF ocupa 105,4 GB, por lo que se requiere al menos esa cantidad de VRAM o de memoria unificada para cargar los pesos completos. Con offloading a RAM/CPU el requisito de VRAM puede reducirse, a costa de latencia.
- GPU recomendadas: para carga completa en VRAM, GPUs con 80 GB o más (A100 80GB, H100 80GB) o configuraciones multi-GPU. En GPUs de consumo (RTX 4090 con 24 GB) solo es viable con offloading parcial o cuantizaciones más agresivas no publicadas en este repositorio.
- Cabe en consumer GPU: no de forma completa; sí con offloading parcial o en configuraciones con memoria unificada grande (por ejemplo, Apple Silicon con 128 GB o más), aunque no hay datos de rendimiento publicados.
- Opciones de despliegue: llama.cpp y Ollama son compatibles con GGUF; vLLM requiere verificar soporte para esta arquitectura MoE concreta. La librería declarada es `edge0`, específica del autor, lo que puede limitar la compatibilidad con herramientas estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones del modelo base Qwen/Qwen3.8-Flash-Next que permitan una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Discrepancia entre el nombre del repositorio (145B) y el recuento real de parámetros en safetensors (4.947.698.560), sin aclaración por parte del autor; conviene verificar el tamaño efectivo antes de planificar el despliegue.
- Ausencia total de benchmarks publicados: no es posible evaluar la calidad del modelo frente a alternativas sin realizar una evaluación propia.
- La model card no documenta el dataset de entrenamiento, los idiomas soportados ni las fases de alineación, lo que dificulta anticipar sesgos o comportamientos en producción.
- Riesgo de alucinación no cuantificado; al no haber evaluación publicada, no puede descartarse un comportamiento degradado por la cuantización q3k a 4 bits.
- La librería `edge0` es específica del autor y no estándar, lo que puede complicar la integración con frameworks habituales (Transformers, vLLM, TGI).
- Adopción prácticamente nula (0 descargas, 1 like), sin comunidad ni soporte documentado.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe asumir la responsabilidad de validar el modelo y de cumplir las condiciones del modelo base Qwen, cuyos términos no se detallan en la información disponible.
- No se especifica la longitud de contexto, lo que impide garantizar conversaciones multi-turno largas o procesamiento de documentos extensos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Edge0/Edge0-145B-q3k
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
