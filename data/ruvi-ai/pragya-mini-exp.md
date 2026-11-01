# RuVI-AI/pragya-mini-exp

## Resumen

Pragya-mini-exp es un modelo de generacion de texto desarrollado por RuVI-AI, publicado en HuggingFace bajo licencia Apache 2.0. Se trata, segun la propia model card del autor, de un experimento para comprobar si un modelo de lenguaje de pequeno tamano puede aprender hindi a partir de datasets de historias cortas. El autor lo describe explicitamente como "JUST A EXPERIMENT" (solo un experimento), sin pretensiones de produccion.

El modelo se distribuye con la libreria transformers y requiere codigo personalizado (`custom_code`), con una arquitectura identificada internamente como `pragya_e2`. El repositorio ocupa 4,4 GB, lo que sugiere un modelo de escala pequena o mediana, aunque no se especifica el numero exacto de parametros. Soporta ingles e hindi, y fue entrenado sobre los datasets TinyStories (en ingles) y Tiny_Stories_Hindi (en hindi).

Su relevancia es limitada: se publico el 1 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni likes. Es un artefacto de investigacion temprana, no un modelo listo para despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pragya_e2 (transformer, segun tag de transformers; detalles no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en), hindi (hi) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 4,4 GB; probablemente safetensors, sin confirmar) |

## Arquitectura y entrenamiento

La informacion disponible es minima. El tag `pragya_e2` y la etiqueta `custom_code` indican que el modelo usa una arquitectura propia definida por el autor, no un transformer estandar de la libreria transformers, y que para cargarlo es necesario confiar en codigo remoto (`trust_remote_code=True`). No se especifica el numero de capas, dimensiones ocultas, mecanismo de atencion ni si incorpora innovaciones como atencion lineal o decodificacion especulativa.

En cuanto al entrenamiento, la model card solo declara los datasets: `roneneldan/TinyStories` (historias sinteticas cortas en ingles, generadas para estudiar el aprendizaje en modelos pequenos) y `Meyank/Tiny_Stories_Hindi` (version en hindi). No se indica el numero de tokens, la composicion exacta del dataset, la presencia de fases de RLHF o DPO, ni la estrategia de tokenizacion para el hindi. El objetivo declarado del autor es comprobar si el modelo puede aprender hindi a partir de estos datos.

## Capacidades

- Generacion de texto en ingles y hindi, orientada a historias cortas y textos sencillos.
- Aprendizaje experimental de hindi, segun el proposito declarado por el autor.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, vision ni audio.
- Capacidad multilingue limitada a en e hi.
- No hay informacion sobre capacidades de codigo o matematicas.

## Casos de uso

- Experimentacion academica sobre aprendizaje de hindi en modelos pequenos: el modelo sirve como punto de partida para reproducir el experimento del autor y medir la calidad del hindi generado frente al ingles.
- Generacion de historias cortas sinteticas en ingles: entrenado sobre TinyStories, puede emplearse para generar cuentos simples en ese dominio, util para aumentar datos de entrenamiento de otros modelos.
- Generacion de historias cortas en hindi: permite evaluar cualitativamente la fluidez del hindi aprendido, comparando con el dataset Tiny_Stories_Hindi.
- Banco de pruebas de carga con `custom_code`: util para validar pipelines de transformers que requieren `trust_remote_code=True` antes de adoptar arquitecturas no estandar.
- Investigacion sobre transferencia entre idiomas: al compartir dominio (historias cortas) en dos idiomas, permite estudiar hasta que punto el modelo transfiere estructuras narrativas del ingles al hindi.
- Prototipado docente: como ejemplo didactico de modelo experimental de bajo perfil, sirve para ilustrar el flujo completo de publicacion en HuggingFace (model card, datasets, licencia, tags).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision. El repo pesa 4,4 GB, por lo que en precision completa (fp32) cabria en GPUs con al menos 6-8 GB de VRAM; en fp16, en torno a 3-4 GB, aunque estos calculos son estimaciones a partir del tamano del repositorio, no datos confirmados.
- GPU recomendadas: no disponibles. Por tamano de repo, una RTX 3060 de 12 GB o superior deberia ser suficiente, pero no hay confirmacion del autor.
- Cabe en GPU de consumo: probablemente si, segun el tamano del repositorio, aunque no esta verificado.
- Opciones de despliegue: transformers con `trust_remote_code=True`. No hay confirmacion de soporte para vLLM, llama.cpp, Ollama o TGI; al requerir `custom_code`, la compatibilidad con estos motores es incierta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| RuVI-AI/pragya-mini-exp | no disponible | no disponible | en, hi | Apache 2.0 | Experimental, sin descargas |
| Modelos TinyStories tipicos (p. ej. roneneldan/TinyStories-1M a 33M) | 1M-33M | corto (no especificado) | en | variable | Publicos y documentados |
| Modelos multilingues pequenos de proposito general | variable | variable | multiples | variable | Maduros |

No se dispone de datos de rendimiento del modelo como para establecer una comparativa cuantitativa con alternativas. La comparacion se limita a parametros declarados y estado de publicacion.

## Limitaciones y advertencias

- Modelo declarado explicitamente como experimento por el autor; no esta pensado para uso en produccion.
- Ausencia total de benchmarks: no hay evidencia publicada de calidad, coherencia ni seguridad.
- Riesgo elevado de alucinacion y de generacion incoherente, especialmente en hindi, al ser un experimento de aprendizaje limitado.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; conviene auditar el codigo antes de cargarlo.
- Sesgos desconocidos: los datasets TinyStories son historias sinteticas, lo que limita la diversidad y puede producir estilos repetitivos o infantiles.
- Sin informacion sobre el tokenizador ni sobre el tratamiento del hindi; la calidad en ese idioma es incierta.
- Licencia Apache 2.0 permite uso comercial, pero la falta de garantias y de evaluacion desaconseja ese uso.
- Sin descargas ni validacion de la comunidad en el momento de la ficha: no hay senales externas de calidad.

## Enlaces

- HuggingFace: https://huggingface.co/RuVI-AI/pragya-mini-exp
- Dataset TinyStories (ingles): https://huggingface.co/datasets/roneneldan/TinyStories
- Dataset Tiny_Stories_Hindi: https://huggingface.co/datasets/Meyank/Tiny_Stories_Hindi
