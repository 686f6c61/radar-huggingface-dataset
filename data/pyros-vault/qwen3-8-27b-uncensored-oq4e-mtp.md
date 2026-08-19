# pyros-vault/Qwen3.8-27B-Uncensored-oQ4e-mtp

## Resumen

Qwen3.8-27B-Uncensored-oQ4e-mtp es una versión cuantizada del modelo Qwen3.8-27B-Uncensored, desarrollada por pyros-vault a partir del trabajo de orcarouter. El modelo base es una variante "abliterated" (con los rechazos eliminados mediante técnicas de red teaming) del Qwen3.8-27B original de Alibaba, un modelo denso multimodal de última generación orientado a tareas de codificación, agentes y automatización de oficina. Esta versión concreta aplica una cuantización mixta de 4 bits (formato oQ4e, group size 64) mediante la librería oMLX, lo que reduce el tamaño del modelo a aproximadamente 17 GB y lo hace viable para ejecutarse en hardware local, especialmente en Apple Silicon gracias al formato MLX.

La relevancia de este modelo radica en combinar tres características: un modelo base multimodal y de alto rendimiento (Qwen3.8-27B), una eliminación de los mecanismos de rechazo (uncensored) que lo hace útil para tareas de red teaming y análisis de seguridad, y una cuantización eficiente que permite su despliegue en entornos con recursos limitados. Aunque el nombre sugiere 27B de parámetros, el archivo safetensors del repositorio indica 4.926.789.872 parámetros, una discrepancia que conviene verificar antes de su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (tipo qwen3_5), image-text-to-text |
| Parametros totales | 4.926.789.872 (segun safetensors del repo; el nombre del modelo indica 27B, discrepancia por verificar) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ4e (4 bits, group size 64), tambien existen versiones FP8 y GGUF del modelo base |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un LLM denso multimodal desarrollado por el equipo Qwen de Alibaba, diseñado para procesar tanto texto como imagenes (pipeline image-text-to-text). Segun la informacion disponible, esta optimizado para codificacion, flujos de trabajo agente y automatizacion de oficina. La variante Uncensored, creada por orcarouter, aplica una tecnica de abliteration que elimina los mecanismos de rechazo del modelo original, de modo que responde sin las restricciones habituales de seguridad. Sobre esta base, pyros-vault ha aplicado una cuantizacion mixta de precision con la herramienta oMLX v0.6.1, que combina diferentes precisiones para preservar la calidad en capas criticas. No se dispone de detalles sobre el dataset de entrenamiento, el numero de tokens o el proceso de fine-tuning del modelo base.

## Capacidades

- Generacion de texto y comprension de lenguaje natural en ingles y chino.
- Procesamiento multimodal: entrada de imagenes junto con texto (image-text-to-text).
- Soporte de function calling / tool calling, segun los tags del repositorio.
- Capacidades de razonamiento (reasoning) y conversacion multi-turno.
- Modo "uncensored": no aplica rechazos ante peticiones delicadas, util para red teaming y pruebas de seguridad.
- Compatible con el ecosistema MLX para Apple Silicon, lo que permite inferencia local eficiente.

## Casos de uso

- Automatizacion de oficina: el modelo puede interpretar documentos con imagenes, extraer informacion y generar resumenes o respuestas, aprovechando su capacidad multimodal y su contexto largo (aunque no se especifica la longitud exacta).
- Agentes autonomos: gracias al soporte de function calling, puede integrarse en pipelines de agentes que necesitan ejecutar herramientas externas, consultar APIs o tomar decisiones multi-paso.
- Generacion de codigo en entornos locales: su optimizacion para codificacion y su cuantizacion compacta lo hacen adecuado para asistentes de programacion que se ejecutan en estaciones de trabajo con GPU moderada.
- Analisis de seguridad y red teaming: al carecer de rechazos, permite probar limites de seguridad en sistemas de IA, generar prompts adversariales o evaluar vulnerabilidades en aplicaciones.
- Investigacion academica en alineacion y seguridad: los investigadores pueden estudiar el comportamiento de un modelo sin restricciones y compararlo con versiones alineadas.
- Prototipado rapido en Apple Silicon: al estar en formato MLX, puede desplegarse en Mac con Metal para experimentacion sin necesidad de servidores dedicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de rendimiento ni comparaciones con otros modelos.

## Requisitos de hardware

- Tamano del repositorio: 17.0 GB, lo que sugiere que el modelo cuantizado ocupa aproximadamente ese espacio en disco.
- VRAM estimada: al ser una cuantizacion de 4 bits, la memoria necesaria para cargar los pesos ronda los 15-17 GB, mas overhead de activaciones y contexto. Se recomienda al menos 24 GB de RAM unificada en Apple Silicon o una GPU con 16-24 GB de VRAM.
- GPU recomendadas: Apple Silicon (M1 Pro/Max/Ultra o superior) para MLX; en entornos CUDA, seria necesario convertir los pesos a otro formato (por ejemplo, GGUF para llama.cpp).
- Opciones de despliegue: la libreria principal es MLX (para Apple), pero al ser safetensors, puede convertirse a otros formatos. No se mencionan integraciones con vLLM, Ollama o TGI en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B (aprox.) | no disponible | Si | Apache-2.0 | bf16 |
| Qwen3.8-27B-Uncensored (orcarouter) | 27B (aprox.) | no disponible | Si | Apache-2.0 | bf16, FP8 |
| Qwen3.8-27B-Uncensored-oQ4e-mtp (este) | 4.9B (segun safetensors) | no disponible | Si | Apache-2.0 | MLX 4-bit |

Nota: la discrepancia en parametros entre el nombre (27B) y el archivo safetensors (4.9B) es significativa. Se recomienda verificar la integridad del repositorio antes de su uso.

## Limitaciones y advertencias

- La naturaleza "uncensored" implica que el modelo puede generar contenido ofensivo, ilegal o peligroso sin filtros. No debe usarse en aplicaciones orientadas al publico general sin salvaguardas adicionales.
- La discrepancia entre el numero de parametros declarado (27B) y el real en safetensors (4.9B) sugiere un posible error en el repositorio; podria tratarse de un modelo parcial o de una confusion en el nombre.
- No se dispone de informacion sobre la longitud de contexto, lo que limita su uso en tareas que requieran ventanas largas.
- Solo soporta ingles y chino; no hay garantia de buen rendimiento en otros idiomas.
- La cuantizacion de 4 bits puede degradar ligeramente la calidad de salida en comparacion con el modelo en bf16.
- Al ser un modelo cuantizado con una herramienta especifica (oMLX), la compatibilidad con otros frameworks (vLLM, TGI) no esta garantizada.
- Riesgo de alucinaciones y sesgos presentes en el modelo base, no mitigados por el proceso de cuantizacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pyros-vault/Qwen3.8-27B-Uncensored-oQ4e-mtp
- Modelo base (orcarouter): https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Version FP8 del modelo base: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-FP8
- Repositorio oficial de Qwen3.8-27B (Alibaba): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Articulo de ExplainX sobre la version MLX: https://www.explainx.ai/blog/orcarouter-qwen3-8-27b-uncensored-mlx-august-2026
- Herramienta oMLX (oQ): https://github.com/jundot/omlx
