# root4k/Qwen3.8-Flash-Next-Uncensored-oQ4e-mtp

## Resumen

El modelo `root4k/Qwen3.8-Flash-Next-Uncensored-oQ4e-mtp` es una cuantización de 4 bits del modelo Qwen3.8-Flash-Next, desarrollado por Qwen (Alibaba). Qwen3.8-Flash-Next es un modelo multimodal de arquitectura MoE ultra-sparse con 125 mil millones de parámetros totales y 6 mil millones activos por token, construido sobre la nueva arquitectura Qwen4. Esta versión concreta ha sido cuantizada por el usuario root4k utilizando la herramienta oQ (oMLX v0.6.4) con precisión mixta, en formato MLX safetensors, lo que la hace ejecutable en hardware Apple Silicon con memoria unificada.

La relevancia de este modelo radica en que ofrece capacidades de razonamiento avanzado, visión y procesamiento de contexto largo (262K tokens) en un formato optimizado para consumo local en Mac, con una licencia abierta (aunque no se especifica en esta ficha). El sufijo "Uncensored" indica que se ha eliminado el alineamiento de seguridad, lo que permite respuestas sin restricciones, pero también conlleva riesgos de contenido inapropiado. La cuantización oQ4e reduce el tamaño del modelo a aproximadamente 106 GB en disco, facilitando su despliegue en equipos con suficiente memoria unificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GDN + QSA (Gated DeltaNet + Qwen Sparse Attention), MoE ultra-sparse |
| Parametros totales | 125B (modelo base); 30.424.457.059 segun safetensors del repo |
| Parametros activos | 6B (modelo base) |
| Longitud de contexto | 262K tokens (modelo base) |
| Tipos de cuantizacion | 4 bits, group size 64 (oQ4e) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

Qwen3.8-Flash-Next emplea una arquitectura híbrida que combina dos mecanismos de atención: tres de cada cuatro capas utilizan Gated DeltaNet (GDN) para comprimir el historial de tokens, mientras que la cuarta capa usa Qwen Sparse Attention (QSA) para recuperación precisa de información a larga distancia. Esta combinación mejora la eficiencia computacional y la capacidad del modelo, reduciendo el coste de atención cuadrática a un coste casi lineal. El modelo es un MoE ultra-sparse con 125B parámetros totales y 6B activos por token, lo que permite un alto rendimiento con un coste de inferencia relativamente bajo. Además, incorpora una tabla de embeddings N-gram de 51B parámetros adicionales, que mejora la representación de tokens y el rendimiento en tareas de lenguaje.

El entrenamiento del modelo base no está detallado en la información disponible, pero se sabe que es multimodal (texto e imagen) y que supera a Claude-4.6-Opus (Max) en ciertos benchmarks, según la documentación de unsloth. La cuantización oQ4e aplicada por root4k utiliza precisión mixta, manteniendo capas críticas en mayor precisión para preservar la calidad, mientras que el resto se reduce a 4 bits con group size 64. No se especifican los datos de entrenamiento ni el proceso de alineamiento (RLHF/DPO) del modelo base.

## Capacidades

- Generacion de texto y razonamiento avanzado, incluyendo tareas de matematicas, logica y analisis.
- Comprension multimodal: procesa imagenes junto con texto, permitiendo descripcion, respuesta a preguntas visuales y razonamiento sobre contenido grafico.
- Soporte de contexto largo de hasta 262K tokens, ideal para documentos extensos, conversaciones multi-turno y analisis de codigo fuente grande.
- Razonamiento multi-step y modo "thinking" (no confirmado en esta cuantizacion, pero presente en el modelo base).
- Capacidades multilingues, aunque no se especifican los idiomas exactos en la informacion disponible.
- Tool calling y function calling: el modelo base soporta invocacion de herramientas, aunque no se confirma en esta version cuantizada.
- Al ser "Uncensored", no aplica filtros de seguridad, lo que permite generar contenido sin restricciones de politica de uso.

## Casos de uso

- Asistente de programacion local: el modelo puede generar, revisar y depurar codigo en multiples lenguajes, aprovechando su contexto de 262K para analizar repositorios completos. Su ejecucion en Mac con MLX permite un entorno de desarrollo sin conexion.
- Analisis de documentos extensos: con 262K tokens de contexto, puede resumir, extraer informacion y responder preguntas sobre libros, informes o contratos de gran tamano, sin necesidad de dividir el texto.
- Generacion de contenido creativo sin restricciones: al ser "Uncensored", puede producir narrativa, guiones o dialogos con tematicas adultas o controvertidas, util para escritores que necesitan explorar limites.
- Razonamiento visual en local: al ser multimodal, puede analizar imagenes, diagramas o capturas de pantalla y generar descripciones o respuestas, util para accesibilidad o documentacion tecnica.
- Chatbot de atencion al cliente con contexto largo: puede mantener conversaciones multi-turno recordando interacciones previas durante horas, gracias a su ventana de contexto amplia, aunque su naturaleza "uncensored" requiere moderacion adicional.
- Investigacion academica: para experimentos de generacion de texto sin filtros, como analisis de sesgos o estudios de alucinacion, este modelo ofrece una base sin restricciones de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta cuantizacion oQ4e en la informacion disponible. El modelo base Qwen3.8-Flash-Next, segun unsloth, supera a Claude-4.6-Opus (Max) en ciertas evaluaciones, pero no se proporcionan cifras concretas. Se recomienda consultar la documentacion oficial de Qwen para obtener datos de rendimiento del modelo sin cuantizar.

## Requisitos de hardware

- El formato MLX safetensors esta disenado para Apple Silicon (M1, M2, M3, M4) con memoria unificada.
- El modelo base requiere aproximadamente 75 GB de RAM/unified memory segun unsloth, pero esta cuantizacion de 4 bits reduce el tamano a 106 GB en disco, por lo que se estima que necesita al menos 100-120 GB de memoria unificada para cargar los pesos y ejecutar inferencia.
- No es compatible con GPUs NVIDIA o AMD de forma nativa; requiere el ecosistema MLX (Apple).
- Opciones de despliegue: oMLX (herramienta de cuantizacion y ejecucion), o cualquier runtime que soporte MLX safetensors, como el propio framework MLX de Apple.
- Latencia y throughput: no disponibles. Dependen del chip (M2 Ultra, M3 Max, etc.) y de la memoria disponible.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar esta cuantizacion con otros modelos de la misma categoria. El modelo base Qwen3.8-Flash-Next compite con otros MoE de gran tamano como DeepSeek-V3 o Mixtral 8x22B, pero no hay datos de rendimiento de esta version cuantizada frente a ellos. Se recomienda consultar benchmarks oficiales de Qwen para el modelo sin cuantizar.

## Limitaciones y advertencias

- La cuantizacion de 4 bits puede introducir perdida de precision en tareas de razonamiento complejo o generacion de codigo, aunque oQ4e usa precision mixta para mitigarlo.
- El modelo es "Uncensored": no tiene filtros de seguridad, por lo que puede generar contenido ofensivo, ilegal o peligroso. No es apto para uso en produccion sin moderacion externa.
- La licencia no esta especificada en la informacion disponible; se desconoce si permite uso comercial o tiene restricciones.
- Los idiomas soportados no estan documentados; aunque el modelo base es multilingue, no se garantiza la cobertura en esta version.
- Requiere hardware Apple Silicon con gran cantidad de memoria unificada (al menos 100 GB), lo que limita su despliegue a equipos de gama alta.
- No se han publicado benchmarks de esta cuantizacion, por lo que el rendimiento real puede variar respecto al modelo base.
- El contexto de 262K es del modelo base; la cuantizacion puede afectar la capacidad de manejar contextos extremadamente largos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/root4k/Qwen3.8-Flash-Next-Uncensored-oQ4e-mtp
- Repositorio oficial de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Documentacion de oQ (oMLX): https://github.com/jundot/omlx
- Guia de unsloth para Qwen3.8-Flash-Next: https://unsloth.ai/docs/models/qwen3.8-next
- Version GGUF del mismo modelo (por mradermacher): https://huggingface.co/mradermacher/Qwen3.8-Flash-Next-Uncensored-GGUF
