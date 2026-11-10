# mobbitxt/Dark-Craving-31B-v3.0-oQ4e

## Resumen

Dark-Craving-31B-v3.0-oQ4e es una cuantizacion en 4 bits (formato oQ4e, libreria MLX) del modelo Dark-Craving-31B-v3.0, desarrollado por el usuario ReadyArt y redistribuido por mobbitxt. Se trata de un modelo de generacion de texto orientado a roleplay conversacional y contenido para adultos (etiquetas nsfw, explicit, ERP, unaligned), afinado sobre una base de la familia Gemma 4 segun los tags del repositorio. El modelo cuenta con 31.273.088.876 parametros totales y esta pensado para ejecutarse en hardware Apple Silicon mediante el framework MLX.

La relevancia de esta publicacion es fundamentalmente practica: ofrece una version cuantizada a 4 bits de un modelo de 31B en un unico repositorio de 19,6 GB, lo que reduce de forma sustancial los requisitos de memoria frente a los pesos en precision completa. Al estar empaquetado especificamente para MLX, esta orientado a equipos Mac con chip de la serie M, un nicho donde las alternativas basadas en CUDA no son directamente aplicables.

Conviene subrayar que se trata de una redistribucion, no de un modelo original: el autor de la cuantizacion no documenta el proceso de entrenamiento del modelo base, y la model card se limita a contenido estetico (CSS y elementos decorativos) sin fichas tecnicas de entrenamiento, datos o evaluacion. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, segun tags; detalles no disponibles) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (oQ4e, MLX) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Los tags del repositorio lo asocian a la familia Gemma 4 y a un transformer de 31.273.088.876 parametros, pero no se especifica si emplea atencion lineal, mezcla de expertos u otras variantes. Tampoco se documenta la longitud de contexto nativa, el numero de capas, la dimension oculta ni el vocabulario.

Respecto al entrenamiento, la model card no incluye informacion sobre volumen de tokens, composicion del dataset, tecnicas de alineamiento (RLHF, DPO) ni procesos de fine-tuning. Las etiquetas indican un ajuste orientado a roleplay y contenido explicito ("unaligned", "ERP", "nsfw"), pero se desconoce el procedimiento concreto. La unica innovacion tecnica verificable es la cuantizacion a 4 bits en formato oQ4e para MLX, que permite ejecutar un modelo de 31B en memoria unificada de equipos Apple.

## Capacidades

- Generacion de texto conversacional multi-turno, con enfasis en roleplay y narrativa interactiva.
- Contenido para adultos y tematica explicita (etiquetas nsfw, explicit, ERP, mature).
- Modo instructivo y conversacional (tags "instruct", "conversational").
- Comportamiento "unaligned": menor adherencia a filtros de seguridad y rechazo, segun la propia etiqueta del autor.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: solo ingles declarado.
- Vision, audio o thinking mode: no disponibles.

## Casos de uso

- Roleplay conversacional de larga duracion: el modelo esta afinado para mantener personajes y narrativa multi-turno, y la cuantizacion a 4 bits permite sesiones prolongadas en equipos Apple sin agotar la memoria unificada.
- Escritura creativa para adultos: generacion de ficcion explicita y narrativa mature, un nicho donde los modelos alineados suelen rechazar la tarea; las etiquetas "unaligned" y "ERP" lo posicionan especificamente para este uso.
- Prototipado local en Mac: al estar empaquetado en MLX, permite probar un modelo de 31B en un portatil o sobremesa con chip M-series sin depender de GPUs CUDA ni de servicios en la nube.
- Investigacion sobre alineamiento y seguridad: util como caso de estudio de un modelo deliberadamente "unaligned" para analizar comportamientos, sesgos y riesgos en entornos controlados.
- Generacion de dialogos para guiones o videojuegos narrativos: la orientacion conversacional y el tono mature encajan en proyectos de ficcion interactiva para publico adulto.
- Evaluacion comparativa de cuantizaciones: permite medir la degradacion de calidad de un modelo de 31B al pasar a 4 bits frente a los pesos originales, en el contexto concreto de MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 19,6 GB en cuantizacion de 4 bits; se recomienda al menos 24 GB de memoria unificada para cargar el modelo con margen para el contexto y el runtime.
- GPU recomendadas: exclusivamente Apple Silicon (chips de la serie M) por el uso de MLX; no es compatible de forma nativa con CUDA.
- Cabe en GPU de consumo: si, en equipos Apple con 24 GB o mas de memoria unificada (por ejemplo, Mac con M-series Pro/Max); en GPUs NVIDIA de consumo no esta soportado por esta version.
- Opciones de despliegue: MLX (libreria nativa del repositorio); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta version.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible: la informacion proporcionada no incluye datos de rendimiento ni modelos comparables de la misma categoria y tamano con los que contrastar parametros, contexto o licencia.

## Limitaciones y advertencias

- Contenido para adultos: el modelo esta etiquetado como nsfw, explicit y not-for-all-audiences; no es apto para entornos laborales, educativos ni aplicaciones orientadas a menores.
- Modelo "unaligned": la propia etiqueta indica baja adherencia a filtros de seguridad, lo que eleva el riesgo de generar contenido danino, ofensivo o inapropiado sin salvaguardas.
- Riesgo de alucinacion: no documentado, pero inherente a los modelos generativos de esta familia; sin datos de evaluacion no puede cuantificarse.
- Limitacion idiomatica: solo se declara ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- Longitud de contexto desconocida: no se especifica la ventana nativa, por lo que no puede garantizarse el comportamiento en conversaciones muy largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el contenido generado y las responsabilidades legales derivadas del uso de un modelo explicit recaen sobre el desplegador.
- Redistribucion no documentada: el autor de la cuantizacion no aporta ficha tecnica del modelo base ni garantias sobre la fidelidad de la cuantizacion.
- Plataforma limitada: al ser una build MLX, no es portable a ecosistemas CUDA sin conversion adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mobbitxt/Dark-Craving-31B-v3.0-oQ4e
- Modelo base: https://huggingface.co/ReadyArt/Dark-Craving-31B-v3.0
- Framework MLX: https://github.com/ml-explore/mlx
- Documentacion de MLX: https://ml-explore.github.io/mlx/
