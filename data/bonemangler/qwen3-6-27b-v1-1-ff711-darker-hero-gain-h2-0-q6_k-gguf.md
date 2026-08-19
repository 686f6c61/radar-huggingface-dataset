# BoneMangler/Qwen3.6-27B-V1.1-FF711-Darker-Hero-GAIN-H2.0-Q6_K-GGUF

## Resumen

Este repositorio contiene una cuantizacion GGUF en Q6_K del modelo DavidAU/Qwen3.6-27B-V1.1-FF711-Darker-Hero-GAIN-H2.0, un fine-tune multi-etapa y merge del Qwen3.6-27B de Alibaba, convertido por BoneMangler mediante llama.cpp y el espacio GGUF-my-repo de ggml.ai. El modelo base, desarrollado por DavidAU, emplea el metodo de entrenamiento "GAIN" junto con tecnicas de abliteration para eliminar rechazos, resultando en una variante "uncensored" orientada a escritura creativa, roleplaying y ficcion en todos los generos.

Con 27.320 millones de parametros en arquitectura densa, el modelo conserva las capacidades de razonamiento y codificacion del Qwen3.6-27B, incluyendo modos de pensamiento (thinking) y no-pensamiento, asi como capacidades multimodales en el modelo original. La cuantizacion Q6_K reduce el peso a aproximadamente 22,4 GB, permitiendo su ejecucion en hardware de consumo mediante llama.cpp, Ollama u otros runners compatibles con GGUF.

La relevancia de este modelo radica en combinar el rendimiento de Qwen3.6-27B en codificacion agente con un ajuste especifico para creatividad sin restricciones, empaquetado en un formato listo para despliegue local. La licencia Apache 2.0 facilita su uso comercial y modificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.6-27B) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q6_K (este repositorio); el modelo base esta disponible en bfloat16 |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es Qwen3.6-27B de Alibaba, un transformer denso multimodal de 27.000 millones de parametros que soporta modos de pensamiento (thinking) y no-pensamiento (non-thinking), con capacidades de codificacion agente de nivel flagship segun el blog oficial de Qwen. Sobre esta base, DavidAU aplico un proceso de fine-tune multi-etapa (multi-stage tune) y merge multi-estado (multi-state merge) utilizando el metodo "GAIN", desarrollado durante la creacion del modelo Qwen3.6-27B Fable Fusion 711.

El entrenamiento adicional utilizo los datasets DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets, junto con tecnicas de abliteration para eliminar los mecanismos de rechazo del modelo. Los tags "heretic" y "ara" sugieren ajustes especificos para creatividad y roleplay sin restricciones. La conversion a GGUF Q6_K se realizo con llama.cpp, manteniendo compatibilidad con los runners de dicha libreria.

## Capacidades

- Generacion de texto creativo: escritura de ficcion, storytelling y roleplaying en todos los generos, con enfasis en narrativa sin restricciones gracias al fine-tune especifico.
- Razonamiento y pensamiento: soporta modo thinking (razonamiento multi-paso) y modo non-thinking (respuesta directa), heredado de Qwen3.6-27B.
- Codificacion: capacidades de codificacion agente de nivel flagship, incluyendo generacion, edicion y refactorizacion de codigo.
- Capacidades multimodales: el modelo base es image-text-to-text, aunque la cuantizacion GGUF puede limitar el soporte de vision segun el runner utilizado.
- Tool calling y function calling: heredado del Qwen3.6-27B, aunque no se detalla explicitamente en la informacion proporcionada.
- Uso sin censura: el modelo ha sido abliterado, eliminando rechazos tipicos de modelos alineados, orientado a contenido para adultos y roleplay.
- Multilingue: soporte de ingles y chino.

## Casos de uso

- Roleplaying y narrativa interactiva: el modelo puede mantener personajes consistentes y tramas complejas en conversaciones multi-turno, gracias a su fine-tune especifico para ficcion y roleplay, ejecutable en local con llama.cpp.
- Escritura creativa asistida: generacion de borradores de novelas, relatos y guiones en todos los generos, con capacidad de seguir instrucciones de estilo, tono y estructura narrativa.
- Chat sin censura para adultos: orientado a usuarios que necesitan un asistente sin filtros de contenido, con la advertencia de que no es apto para todos los publicos.
- Asistente de codigo en local: las capacidades de codificacion agente del Qwen3.6-27B permiten usarlo como asistente de programacion en entornos sin conexion, con la ventaja de la licencia Apache 2.0.
- Generacion de contenido bilingue: soporte de ingles y chino para creadores que trabajan en ambos idiomas, con un unico modelo desplegado localmente.
- Prototipado de aplicaciones de IA: al ser un GGUF de 22,4 GB, puede desplegarse en una GPU de consumo para probar aplicaciones de chat, generacion y agentes antes de escalar a modelos mayores.
- Base para fine-tune adicional: la licencia Apache 2.0 y el formato GGUF permiten a desarrolladores experimentar con el modelo como punto de partida para nuevos ajustes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La ficha del modelo en friendli.ai indica cualitativamente que "excede el rendimiento de los modelos Qwen 3.5 de 9B y 27B, asi como de Qwen 3.6 27B y 35B-A3B", pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otros benchmarks estandar. No se inventan datos.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q6_K pesa aproximadamente 22,4 GB, por lo que se recomienda al menos 24 GB de VRAM para cargar el modelo completo en GPU.
- GPUs recomendadas: NVIDIA RTX 3090 o RTX 4090 (24 GB), A100 40GB, H100, o cualquier GPU con 24 GB o mas de VRAM.
- Hardware de consumo: cabe en una RTX 3090 o RTX 4090 con 24 GB de VRAM. Tambien puede ejecutarse en Mac con Apple Silicon (M-series) con suficiente RAM unificada.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama, LM Studio y cualquier runner compatible con GGUF. El modelo card incluye instrucciones especificas para llama.cpp con descarga directa desde HuggingFace.
- Alternativa sin GPU: puede ejecutarse en CPU con llama.cpp, aunque la velocidad sera significativamente menor para un modelo de 27B.
- Latencia y throughput: no disponible en la informacion proporcionada; dependera del hardware, la cuantizacion y el runner utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-27B (base) | 27,3B denso | Transformer denso | multimodal | Apache 2.0 | safetensors |
| Qwen3.6-35B-A3B | 35B total, 3B activo | MoE | multimodal | Apache 2.0 | safetensors |
| Este modelo (GGUF Q6_K) | 27,3B denso | Transformer denso | texto (GGUF) | Apache 2.0 | GGUF |

Segun la informacion disponible, este modelo (y su base DavidAU) supera en rendimiento a Qwen3.5 de 9B y 27B, asi como a Qwen3.6-27B y Qwen3.6-35B-A3B, aunque no se especifican las metricas concretas. La principal diferencia con el modelo base es el fine-tune orientado a creatividad, roleplay y uso sin censura, ademas de la cuantizacion GGUF para despliegue local.

## Limitaciones y advertencias

- Contenido no apto para todos los publicos: el modelo ha sido abliterado y fine-tuneado para eliminar rechazos, por lo que puede generar contenido explicito, ofensivo o inapropiado. No debe usarse en aplicaciones orientadas a menores o en entornos corporativos sin supervision.
- Riesgo de alucinacion: como todos los modelos de lenguaje, puede generar informacion falsa o inventada, especialmente en tareas factuales.
- Idiomas limitados: solo soporta ingles y chino. No se garantiza un buen rendimiento en otros idiomas, incluido el espanol.
- Longitud de contexto: no se ha confirmado la longitud de contexto soportada en esta cuantizacion GGUF. Se recomienda verificar con el modelo base Qwen3.6-27B.
- Soporte multimodal limitado: aunque el modelo base es image-text-to-text, la cuantizacion GGUF puede no soportar vision en todos los runners de llama.cpp.
- Sin benchmarks publicados: no hay datos de rendimiento cuantitativos verificables para esta variante especifica.
- Adopcion limitada: el repositorio tiene 0 descargas y 0 likes, lo que indica una publicacion reciente sin validacion de la comunidad.
- Fecha de creacion: el modelo fue creado en agosto de 2026, por lo que es muy reciente y puede contener problemas no detectados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/BoneMangler/Qwen3.6-27B-V1.1-FF711-Darker-Hero-GAIN-H2.0-Q6_K-GGUF
- Modelo base (DavidAU): https://huggingface.co/DavidAU/Qwen3.6-27B-V1.1-FF711-Darker-Hero-GAIN-H2.0
- Variante anterior del modelo base: https://huggingface.co/DavidAU/Qwen3.6-27B-V1.1-FF711-Darker-Hero-H2.0
- Repositorio oficial de Qwen3.6: https://github.com/QwenLM/Qwen3.6
- Blog oficial de Qwen3.6-27B: https://qwen.ai/blog?id=qwen3.6-27b
- Ficha en friendli.ai: https://friendli.ai/models/DavidAU/Qwen3.6-27B-V1.1-FF711-Darker-Hero-GAIN-H2.0
