# Ishowbackup/Muse-Glimmer-30B-ExecuTorch-PTE

## Resumen

Muse Glimmer 30B es un modelo de lenguaje causal de 30 mil millones de parámetros desarrollado por el Meta Superintelligence Lab, destilado de Muse Spark y diseñado específicamente para tareas agénticas autónomas en hardware de consumo. El modelo integra razonamiento multi-paso, uso fiable de herramientas, comprensión multimodal (texto e imagen) y recuperación ante fallos en un único sistema que puede ejecutarse localmente sin depender de infraestructura en la nube. Su arquitectura incluye un encoder de percepción dedicado y soporta decodificación especulativa con bloque-difusión (DFlash), lo que lo hace especialmente adecuado para entornos de producción con recursos limitados.

Este repositorio concreto, `Ishowbackup/Muse-Glimmer-30B-ExecuTorch-PTE`, contiene los artefactos PTE (ExecuTorch) pre-exportados del modelo, optimizados para NVIDIA CUDA (SM80+) y Apple Silicon (Metal). Se ofrecen 16 variantes que combinan dos esquemas de cuantización (~4-bit), dos modalidades (solo texto o texto+imagen), dos modos de decodificación (con o sin drafter especulativo) y dos backends. La ventana de contexto es fija de 131 072 tokens (128K) en todas las variantes. El modelo base es `meta-models/Muse-Glimmer-30B` y la licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia actual de este modelo radica en su enfoque explícito hacia agentes autónomos que operan en el dispositivo, sin conexión a red, con soporte nativo de visión y tool calling. Al estar pre-exportado a ExecuTorch, elimina la necesidad de reimplementar la arquitectura por backend, un problema habitual en modelos con diseños novedosos y decodificación especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con encoder de percepción (detalles internos no disponibles) |
| Parametros totales | 30 mil millones (30B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 131 072 tokens (128K) |
| Tipos de cuantizacion | k-quant-17G (~4-bit, objetivo 24 GB) y k-quant-dynamic (objetivo 32 GB) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | PTE (ExecuTorch) con blobs .ptd para CUDA; también se mencionan checkpoints GGUF en el repo de ExecuTorch |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la informacion proporcionada. Se describe como un "causal language model con un encoder de percepcion dedicado", destilado de Muse Spark. La model card menciona una "arquitectura novedosa con entrada multimodal y decodificacion especulativa por bloque-difusion" (DFlash), lo que sugiere un diseño que combina atencion causal estandar con un mecanismo de decodificacion especulativa que comparte embeddings de tokens y cabeza de salida entre el modelo principal y el drafter, reduciendo el coste adicional del drafter frente a un segundo modelo completo.

No se proporcionan datos sobre el proceso de entrenamiento: ni numero de tokens, ni composicion del dataset, ni uso de RLHF/DPO. La unica informacion disponible es que es un modelo destilado a partir de Muse Spark, lo que implica un proceso de destilacion de conocimiento, pero sin detalles cuantitativos. Para el despliegue, el repositorio de ExecuTorch indica que los checkpoints GGUF cuantizados son el punto de partida recomendado y se bajan directamente al backend ExecuTorch seleccionado.

## Capacidades

- Generacion de texto y razonamiento multi-paso integrado en el modelo (sin necesidad de cadenas de pensamiento externas).
- Uso fiable de herramientas (tool calling / function calling), soportado de forma nativa.
- Comprension multimodal: acepta entradas de imagen ademas de texto (variantes `text-image`).
- Recuperacion ante fallos: el modelo esta disenado para detectar y corregir errores durante la ejecucion de tareas agénticas.
- Decodificacion especulativa DFlash: acelera la generacion en GPUs capaces, incluida en algunas variantes.
- Ejecucion local sin conexion a red, gracias a la exportacion a ExecuTorch.
- Compatibilidad con servidores OpenAI-compatible, segun el repositorio de ExecuTorch.

## Casos de uso

- Agentes autonomos de automatizacion de tareas: el modelo puede gestionar flujos de trabajo multi-paso (por ejemplo, navegar por una interfaz, extraer datos, tomar decisiones) gracias a su razonamiento integrado y su capacidad de recuperacion ante fallos, ejecutandose localmente en una workstation con GPU NVIDIA o Apple Silicon.
- Asistentes de codigo con vision: al aceptar imagenes, puede analizar capturas de pantalla de interfaces o diagramas y generar o modificar codigo en consecuencia, integrable en entornos de desarrollo locales.
- Atencion al cliente con contexto largo: su ventana de 128K tokens permite mantener conversaciones extensas con historial completo, sin perder informacion relevante, y con tool calling para consultar bases de datos o APIs.
- Procesamiento de documentos multimodales: combinar texto e imagenes (facturas, formularios escaneados) para extraer informacion estructurada, todo en local para cumplir requisitos de privacidad.
- Automatizacion de pruebas de software: el modelo puede interpretar capturas de pantalla de una aplicacion, razonar sobre los pasos de una prueba y ejecutar acciones via tool calling, con la ventaja de correr sin conexion.
- Prototipado rapido de agentes en dispositivos Apple: las variantes `metal` permiten desplegar el modelo en MacBooks con chip M-series, ideal para desarrollo y pruebas sin necesidad de servidores dedicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de rendimiento (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. El unico dato de rendimiento mencionado es que la variante `dflash` es "significativamente mas rapida" que `solo` en GPUs capaces, pero sin cifras concretas.

## Requisitos de hardware

- VRAM estimada: entre 17,9 GB y 31,5 GB segun la variante elegida (ver tabla de tamanos en la model card). Las variantes `k-quant-17G` apuntan a un envelope de 24 GB; las `k-quant-dynamic` a 32 GB.
- GPU recomendadas: NVIDIA con arquitectura SM80 o superior (RTX 30xx, RTX 40xx, A100, H100, etc.) para el backend `sm80+ptx`; Apple Silicon (M1/M2/M3/M4) para el backend `metal`. No existe variante CPU.
- En consumer GPU: si, las variantes `k-quant-17G` caben en tarjetas de 24 GB como la RTX 3090 o RTX 4090. Las variantes `k-quant-dynamic` requieren 32 GB (por ejemplo, A6000 o dual-GPU).
- Opciones de despliegue: ExecuTorch runtime con servidor OpenAI-compatible (segun el repo de ExecuTorch). No se mencionan vLLM, llama.cpp ni Ollama en la informacion proporcionada.
- Latencia y throughput: no disponibles. La unica indicacion es que `dflash` reduce la latencia frente a `solo` en hardware capaz.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa con otros modelos de 30B (por ejemplo, Llama 3 30B, Gemma 2 27B o Qwen 2.5 32B). La informacion proporcionada no incluye benchmarks ni especificaciones detalladas de arquitectura que permitan una comparacion cuantitativa. Se puede afirmar que, por tamano y contexto, se situa en la gama de modelos grandes de codigo abierto, pero sin datos de rendimiento no es posible establecer comparaciones objetivas. Se recomienda consultar la documentacion oficial de Meta para futuras actualizaciones.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos, alucinaciones o comportamientos problematicos especificos de este modelo. Al ser un modelo destilado, podria heredar sesgos de su modelo profesor (Muse Spark), pero no hay evidencia documentada.
- La informacion sobre idiomas soportados no esta disponible; se desconoce si el modelo funciona bien en espanol u otros idiomas distintos del ingles.
- El repositorio es extremadamente grande (372 GB en total). Es obligatorio descargar solo la variante deseada (17,9-31,5 GB) usando `--include`; un `hf download` sin filtros intentara bajar los 16 directorios completos.
- En CUDA, el archivo `.pte` por si solo no es suficiente: se requiere tambien el `.ptd` (blob de pesos). Ignorar esto provocara fallos de ejecucion.
- No existe variante CPU; el modelo solo se puede ejecutar en NVIDIA SM80+ o Apple Silicon.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar el `USAGE_POLICY.md` incluido en el repositorio para conocer restricciones adicionales de uso.
- Al ser un export precompilado, la personalizacion de la cuantizacion o la modificacion de la arquitectura requiere re-exportar desde el codigo fuente (ver el README de ExecuTorch), lo que anade complejidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Ishowbackup/Muse-Glimmer-30B-ExecuTorch-PTE
- Repositorio oficial del modelo base (Meta): https://huggingface.co/meta-models/Muse-Glimmer-30B-ExecuTorch-PTE
- Documentacion de despliegue con ExecuTorch: https://dev.meta.ai/docs/muse-glimmer/executorch
- Guia de exportacion y runtime en GitHub: https://github.com/pytorch/executorch/blob/main/examples/models/muse-glimmer/README.md
- Directorio de ejemplos de ExecuTorch: https://github.com/pytorch/executorch/tree/main/examples/models/muse-glimmer
- Version Abliterated en GGUF (no directamente relacionada): https://huggingface.co/Ishowbackup/Muse-Glimmer-30B-Abliterated-GGUF
- Papers asociados (referenciados en los tags): arXiv:2504.13181 y arXiv:2602.06036 (no se ha verificado su contenido)
