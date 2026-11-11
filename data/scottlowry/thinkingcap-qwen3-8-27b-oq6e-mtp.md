# scottlowry/ThinkingCap-Qwen3.8-27B-oQ6e-mtp

## Resumen

ThinkingCap-Qwen3.8-27B-oQ6e-mtp es una cuantización de 6 bits del modelo ThinkingCap-Qwen3.8-27B, desarrollado originalmente por bottlecapai sobre la arquitectura Qwen3.5. La versión aquí descrita la publica el usuario scottlowry y está pensada para su ejecución en Apple Silicon mediante MLX, la librería de aprendizaje automático de Apple. El modelo conserva los aproximadamente 27.800 millones de parámetros del original, pero reduce el peso en disco y los requisitos de memoria gracias a una cuantización de precisión mixta en formato MLX safetensors.

El problema que resuelve esta variante es práctico: permitir que un modelo de casi 28.000 millones de parámetros se ejecute en hardware de Apple con memoria unificada, algo inviable con los pesos en precisión completa (que rondarían los 55 GB). Con 6 bits y grupo de 64, el repositorio ocupa 47,4 GB, un tamaño que encaja en equipos con 64 GB de memoria unificada o más. La etiqueta "mtp" del nombre sugiere soporte de decodificación especulativa multi-token prediction, aunque la model card no lo detalla.

La relevancia de esta ficha es acotada: se trata de una cuantización comunitaria con 86 descargas, sin licencia declarada ni idiomas especificados en los metadatos, y sin benchmarks publicados. Es útil para quien ya trabaje con el modelo base ThinkingCap y quiera una versión MLX lista para usar, pero no debe confundirse con el modelo original ni asumirse que hereda sus garantías.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer, segun el tipo declarado en la model card); detalles internos no disponibles |
| Parametros totales | 27.781.427.952 (27,78 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits, group size 64, precision mixta mediante oQ (oMLX v0.7.1.dev1) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (libreria mlx) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna más allá de la etiqueta `qwen3_5`, que remite a la familia Qwen3.5 de Alibaba. No se detallan el número de capas, la dimensión oculta, el mecanismo de atención ni si incorpora componentes híbridos. Tampoco hay datos sobre el proceso de entrenamiento del modelo base ThinkingCap-Qwen3.8-27B: no se especifican tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento.

La innovación técnica documentada de esta variante es exclusivamente la cuantización. Se ha aplicado oQ (oMLX v0.7.1.dev1), una herramienta de cuantización de precisión mixta que asigna distintos niveles de bits a distintas capas o tensores para minimizar la pérdida de calidad. El resultado son pesos de 6 bits con grupo de 64, empaquetados en safetensors para MLX. El sufijo "mtp" del nombre apunta a multi-token prediction, una técnica de decodificación especulativa que acelera la generación prediciendo varios tokens por paso, pero la model card no confirma ni describe su implementación.

## Capacidades

- Generación de texto y razonamiento: capacidades heredadas del modelo base, no verificadas de forma independiente en esta cuantización.
- Modo "thinking": el nombre ThinkingCap del modelo base sugiere entrenamiento orientado a razonamiento con cadena de pensamiento, aunque no se documenta en la model card de esta versión.
- Decodificación especulativa multi-token (MTP): indicada por el sufijo del nombre, sin detalles técnicos publicados.
- Ejecución en Apple Silicon mediante MLX: capacidad operativa principal de esta variante.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión, audio u otras modalidades: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el caso de uso central. Un Mac Studio o MacBook Pro con 64 GB o más puede cargar los 47,4 GB de pesos y ejecutar el modelo sin GPU dedicada, gracias al backend MLX.
- Prototipado de aplicaciones de razonamiento en local: para desarrolladores que quieran evaluar el comportamiento del modelo ThinkingCap sin depender de APIs externas ni de servidores con GPU NVIDIA.
- Experimentación con cuantización de precisión mixta: sirve como referencia práctica de cómo rinde un modelo de 27B a 6 bits con group size 64, útil para comparar con otras recetas de cuantización.
- Evaluación comparativa de decodificación especulativa: si el sufijo mtp se confirma, permite medir la ganancia de throughput de MTP en MLX frente a decodificación autoregresiva estándar.
- Desarrollo offline en entornos con requisitos de privacidad: al ejecutarse íntegramente en local, los datos no salen del equipo, lo que encaja en flujos de trabajo con información sensible.
- Base para ajuste fino ligero en MLX: los pesos cuantizados pueden servir de punto de partida para experimentos de adaptación (LoRA/QLoRA) en hardware Apple, aunque la compatibilidad no está documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: los pesos ocupan 47,4 GB en disco; en memoria unificada se necesita un margen adicional para el contexto y las activaciones, por lo que se recomienda un mínimo de 64 GB.
- GPU recomendadas: no aplica GPU dedicada; el formato MLX está diseñado para chips Apple (series M1, M2, M3, M4 y superiores).
- ¿Cabe en GPU de consumo? No en GPU NVIDIA de consumo típicas (8-24 GB). Sí en equipos Apple con 64 GB o más de memoria unificada.
- Opciones de despliegue: MLX (librería `mlx`), con soporte de la herramienta oMLX del ecosistema oQ. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThinkingCap-Qwen3.8-27B-oQ6e-mtp (este) | 27,78 B | no disponible | MLX safetensors 6 bits | no disponible | Hugging Face, 86 descargas |
| bottlecapai/ThinkingCap-Qwen3.8-27B (base) | 27,78 B (presumiblemente) | no disponible | no disponible | no disponible | Hugging Face |
| Qwen3.5 (familia original) | no disponible | no disponible | no disponible | no disponible | Hugging Face / Alibaba |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, formato y disponibilidad.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica si el uso comercial está permitido; hay que consultar la licencia del modelo base bottlecapai/ThinkingCap-Qwen3.8-27B antes de cualquier despliegue en producción.
- Cuantización de 6 bits: implica una pérdida de calidad respecto a los pesos originales, no cuantificada en la model card. No hay evaluaciones que confirmen que el rendimiento se mantiene.
- Sin benchmarks: no hay evidencia publicada de MMLU, HumanEval, GSM8K ni otras métricas para esta variante.
- Idiomas no especificados: se desconoce el soporte real multilingüe, especialmente en castellano.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo sin datos del modelo base.
- Sesgos y alucinaciones: no documentados para esta variante; se heredan los del modelo base, que tampoco están descritos.
- Advertencia del autor: la cuantización se resubió el 2026-10-12 y sustituye a una versión anterior; las descargas previas a esa fecha deben repetirse.
- Comunidad reducida: 86 descargas y 0 likes indican poca validación por parte de la comunidad; conviene tratar los pesos con cautela y verificar su integridad.
- Compatibilidad limitada: solo MLX; no hay soporte declarado para otros runtimes, lo que restringe su uso a hardware Apple.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/scottlowry/ThinkingCap-Qwen3.8-27B-oQ6e-mtp
- Modelo base: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
