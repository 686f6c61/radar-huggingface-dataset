# Joyfulxp/DeepSeek-V4-Flash-Vision-Exp-Abliterated

## Resumen

DeepSeek-V4-Flash-Vision-Exp-Abliterated (variante bayes-l2.0, v2) es un overlay de abliteración publicado por el usuario Joyfulxp sobre el checkpoint multimodal deepseek-ai/DeepSeek-V4-Flash-Vision-Exp. No es un modelo completo: el repositorio contiene únicamente 86 tensores editados (0,12 % de los 72.633 del checkpoint base) más un `model.safetensors.index.json` redirigido. Para poder cargarlo hay que descargar antes los 48 shards del modelo base (~157 GB) y sobrescribir su índice con el de este repositorio.

El modelo subyacente es un transformer de mezcla de expertos (MoE) con capacidades de visión y lenguaje, 43 capas, dimensión oculta 4096, 256 expertos enrutados con top-6 más un experto compartido, atención híbrida CSA + HCA, hyper-connections mHC y una cabeza de borrador DSpark de 3 etapas integrada en el checkpoint. La ventana de contexto nativa es de 1.048.576 tokens, servida en este despliegue a 524.288. La edición actúa solo sobre las proyecciones de salida de atención (`layers.*.attn.wo_b`, las 43 capas) mediante una proyección ortogonal de rango 1 con λ = 2.0, dejando intactos expertos, routers, normalizaciones, embeddings, la cabeza de borrador MTP/DSpark y toda la torre de visión de 32 capas.

La relevancia de la v2 está en la corrección de un fallo de la v1: editar la cabeza MTP/DSpark provocaba garbling en conversaciones largas, algo que la v1 no detectó en sus comprobaciones offline. La v2 deja esa cabeza sin tocar, lo que mantiene funcional la decodificación especulativa DSpark y mejora el resultado en la prueba interna de generación larga de 8.192 tokens de 2/4 a 3/4. Se distribuye como modelo sin censura (uncensored) bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (visión-lenguaje) con atención híbrida CSA + HCA, hyper-connections mHC y cabeza de borrador DSpark de 3 etapas; 43 capas, hidden 4096, 256 expertos enrutados (top-6) + 1 compartido; torre de visión de 32 capas (32×1024, patch 14, `bias_vl`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (MoE con 256 expertos, activación top-6 más 1 compartido) |
| Longitud de contexto | 1.048.576 tokens nativos; servido a 524.288 en el despliegue de referencia |
| Tipos de cuantizacion | Sin cuantización adicional: se mantiene la precisión nativa del checkpoint base (FP8 e4m3 con escalado por bloques, expertos enrutados en FP4). No se publican GGUF |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors: overlay `model-overlay-00001-of-00001.safetensors` (1,44 GB) + `model.safetensors.index.json`; requiere los 48 shards safetensors del modelo base (~157 GB) |
| Tamano del repositorio | 3,0 GB (metadatos de HuggingFace); el overlay declarado ocupa 1,44 GB |
| Tipo de artefacto | Overlay de abliteración, no un modelo completo |
| Tensores editados | 86 de 72.633 (0,12 %); los otros 72.547 son byte a byte idénticos |
| Metodo de edicion | Proyección ortogonal de rango 1, λ = 2.0, sobre `layers.*.attn.wo_b` (peso + escala) en las 43 capas |
| Zonas no editadas | Expertos enrutados y compartidos, `wo_a`, `embed`, `head`, routers, normalizaciones, torre de visión completa + `bias_vl`, parametros mHC y cabeza de borrador MTP/DSpark |
| Runtime de referencia | vLLM (`fraserpricee/vllm:dspark-cu132-vision`), TP=2 sobre 2× NVIDIA RTX PRO 6000 Blackwell (96 GB cada una) |

## Arquitectura y entrenamiento

El checkpoint base es un modelo DeepSeek-V4 en configuración Flash con torre de visión, lo que lo convierte en un sistema multimodal texto-imagen. La columna vertebral consta de 43 capas con dimensión oculta 4096, 256 expertos enrutados con activación top-6 y un experto compartido, atención híbrida CSA + HCA, hyper-connections mHC y una cabeza de borrador DSpark de 3 etapas embebida en el propio checkpoint para decodificación especulativa. La torre de visión tiene 32 capas de dimensión 1024 con parches de tamaño 14 y un parametro `bias_vl`. El modelo se distribuye en precisión nativa: FP8 e4m3 con escalado por bloques y expertos enrutados en FP4.

Este repositorio no entrena ni afina nada: aplica una edición de abliteración tipo overlay sobre las proyecciones de salida de atención del camino de texto. Se trata de una proyección ortogonal de rango 1 con λ = 2.0 aplicada a `layers.*.attn.wo_b` de las 43 capas, afectando tanto al peso como a la escala (86 tensores en total). La v2 se diferencia de la v1 en un punto crítico: la v1 también editaba la cabeza de borrador MTP/DSpark (3 tensores `mtp.*.wo_b`), lo que degradaba la aceptación especulativa y provocaba garbling en diálogos largos. La v2 no toca esa cabeza, siguiendo la experiencia de la comunidad recogida en el repositorio de drowzeys, y mantiene el número de tensores editados en 86 frente a los 92 de la v1. No se documenta en la información disponible ningún proceso de RLHF, DPO o ajuste posterior sobre este artefacto.

## Capacidades

- Generación de texto y razonamiento sobre el checkpoint base DeepSeek-V4 Flash Vision, sin que se documenten capacidades específicas adicionales en la model card de este overlay.
- Procesamiento multimodal de imagen y texto: la torre de visión de 32 capas y el parametro `bias_vl` permanecen intactos, por lo que las capacidades visuales del modelo base no se ven alteradas por la edición.
- Contexto largo: ventana nativa de 1.048.576 tokens, servida a 524.288 en el despliegue de referencia.
- Decodificación especulativa DSpark: la cabeza de borrador se mantiene sin editar en la v2, lo que preserva la aceptación del borrador (el autor indica que la aceptación medida es normal).
- Mezcla de expertos: 256 expertos enrutados con activación top-6 más un experto compartido.
- Comportamiento sin censura: se eliminan sustancialmente las negativas de seguridad en el camino de texto (proyecciones de salida de atención).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el campo de idiomas aparece como no disponible.
- Modo thinking explícito, audio u otras modalidades: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y mecanismos de rechazo: el modelo permite estudiar qué cambia en las proyecciones de salida de atención cuando se elimina la negativa, al tiempo que sirve de control negativo porque la torre de visión, los expertos y los routers permanecen byte a byte idénticos al base.
- Análisis comparativo de recetas de abliteración: al ser un overlay de 86 tensores sobre un índice redirigido, se puede comparar contra las variantes de apetersson, s-zaizen (NVFP4) o cebeuq aplicando exactamente el mismo prompt y el mismo runtime vLLM.
- Evaluación de decodificación especulativa DSpark: la v2 conserva la cabeza de borrador, lo que la convierte en un banco de pruebas para medir la aceptación del borrador con `fraserpricee/vllm:dspark-cu132-vision` en configuraciones TP=2 frente a la v1, que sí editaba MTP.
- Procesamiento de documentos largos con componente visual: con 1.048.576 tokens de contexto nativo y torre de visión intacta, se puede usar para tareas de comprensión de documentos extensos que combinen páginas escaneadas y texto, siempre que se disponga del hardware adecuado.
- Pruebas de robustez en generación larga: el propio autor usa una regla interna de generación de 8.192 tokens para detectar divergencias; ese escenario es reutilizable como test de regresión al evaluar overlays de abliteración.
- Red teaming controlado en hardware propio: dado que el modelo intenta casi cualquier petición, encaja en ejercicios internos de seguridad ofensiva y evaluación de riesgos, con el aislamiento y la trazabilidad que exige ese contexto.
- Pipelines de generación multimodal en investigación con vLLM: el artefacto se sirve con un fork específico de vLLM y TP=2, por lo que es integrable en infraestructura de investigación ya desplegada con ese stack.

## Benchmarks y rendimiento

El autor solo publica una medida propia, la regla interna de generación larga de 8.192 tokens, que compara la v1 con la v2. No hay resultados de MMLU, HumanEval, GSM8K ni de benchmarks estándar de visión en la información disponible.

| Prueba | v1 (sustituida) | v2 (bayes-l2.0, este repositorio) |
|---|---|---|
| Generación larga, regla interna de 8.192 tokens | 2/4 | 3/4 |
| Aceptación del borrador DSpark | degradada por la edición de la cabeza MTP | normal (cabeza MTP sin editar) |
| Tensores editados | 92 | 86 |
| Capas de backbone editadas | 43 | 43 |
| Cabeza MTP/DSpark editada | Sí (3 × `mtp.*.wo_b`) | No |

El autor señala que la única divergencia restante en la regla de 8.192 tokens se hereda del modelo base sin editar, no de la abliteración. No se aportan cifras de latencia ni de throughput más allá de la mención a TP=2 sobre 2× RTX PRO 6000 Blackwell.

## Requisitos de hardware

- Espacio en disco: el overlay ocupa 1,44 GB, pero se requieren además los 48 shards del modelo base, aproximadamente 157 GB en precisión nativa (FP8 e4m3 con expertos FP4).
- Configuración de referencia: 2× NVIDIA RTX PRO 6000 Blackwell de 96 GB cada una, con tensor parallelism TP=2. El autor indica que el modelo se sirve a precisión nativa en ese par de GPU.
- VRAM estimada: no disponible de forma explícita; el despliegue documentado usa 2× 96 GB y el checkpoint base pesa ~157 GB, por lo que el conjunto de pesos excede cualquier GPU de consumo individual.
- GPU de consumo: no cabe en tarjetas de consumo tipo RTX 4090 o RTX 5090. No se documenta ninguna cuantización GGUF ni alternativa de bajo consumo en este repositorio.
- Opciones de despliegue: vLLM con el fork `fraserpricee/vllm:dspark-cu132-vision`, que es el único runtime citado. Ollama, llama.cpp, TGI y llama-cpp no aparecen como soportados en la información disponible.
- Latencia y throughput: no disponible. No se publican tokens por segundo ni tiempos de primera token.
- Procedimiento de instalación: descargar el repo base completo (48 shards más su índice), copiar el overlay `model-overlay-00001-of-00001.safetensors` de este repositorio y sobrescribir `model.safetensors.index.json` con el índice de este repo antes de cargar el directorio.

## Comparativa con modelos similares

| Modelo | Relacion con este artefacto | Tensores editados | Cabeza MTP/DSpark | Precision | Licencia |
|---|---|---|---|---|---|
| deepseek-ai/DeepSeek-V4-Flash-Vision-Exp | Modelo base sin abliterar | 0 | Sin editar | FP8 e4m3 + expertos FP4 | no disponible |
| Joyfulxp/DeepSeek-V4-Flash-Vision-Exp-Abliterated (este, v2) | Overlay de abliteración | 86 | Sin editar | Precisión nativa del base | MIT |
| apetersson/DeepSeek-V4-Flash-Vision-Exp-Abliterated | Overlay alternativo consultado por el autor | no disponible | no disponible | no disponible | no disponible |
| s-zaizen/DeepSeek-V4-Flash-Vision-Exp-Abliterated-NVFP4 | Overlay alternativo consultado, en NVFP4 | no disponible | no disponible | NVFP4 | no disponible |
| drowzeys/keys-DeepSeekV4Flash-Vision-EXP-ablit | Fuente de la lección sobre no editar la cabeza de borrador | no disponible | Sin editar | no disponible | no disponible |
| cebeuq/DeepSeek-V4-Flash-0731-abliterated | Receta de overlay en la que se basa este repositorio | no disponible | no disponible | no disponible | no disponible |

Los datos de benchmark comparativos entre estas variantes no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Modelo sin censura: las negativas de seguridad se han eliminado sustancialmente en el camino de texto. El autor advierte que el modelo intentará casi cualquier petición y que la responsabilidad de uso recae en el usuario.
- El repositorio no contiene el modelo completo. Sin los 48 shards del checkpoint base (~157 GB) y sin sustituir el índice, el repositorio no se puede cargar.
- Garbling en conversaciones largas: la v2 lo resuelve parcialmente (2/4 a 3/4 en la regla de 8.192 tokens). La divergencia restante se atribuye al modelo base, no a la edición.
- Alucinación: no se documentan métricas de alucinación ni evaluaciones de veracidad para este artefacto ni para el base.
- Sesgos: no se documenta ningún análisis de sesgos ni composición del dataset de entrenamiento del modelo base.
- Idiomas: el campo de idiomas aparece como no disponible, por lo que no se puede confirmar cobertura multilingüe.
- Alcance de la edición: solo se modifica el camino de texto (`layers.*.attn.wo_b`). La torre de visión queda intacta, de modo que el comportamiento del modelo ante entradas visuales no se ve afectado por la abliteración.
- Dependencia de un fork concreto de vLLM: el despliegue documentado usa `fraserpricee/vllm:dspark-cu132-vision`. No se garantiza compatibilidad con versiones estándar de vLLM, transformers u otros servidores.
- Sin cuantizaciones alternativas: al no publicarse GGUF ni otras variantes, no hay vía documentada para ejecutarlo en hardware de consumo.
- Licencia MIT declarada, que en principio permite uso comercial, pero el propio autor circunscribe la intención a uso local y de investigación en hardware controlado.
- Adopción muy baja: 139 descargas y 0 likes en el momento de la consulta, lo que implica poca validación independiente externa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Joyfulxp/DeepSeek-V4-Flash-Vision-Exp-Abliterated
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- Variante de referencia de apetersson: https://huggingface.co/apetersson/DeepSeek-V4-Flash-Vision-Exp-Abliterated
- Variante NVFP4 de s-zaizen: https://huggingface.co/s-zaizen/DeepSeek-V4-Flash-Vision-Exp-Abliterated-NVFP4
- Lección sobre la cabeza de borrador (drowzeys): https://huggingface.co/drowzeys/keys-DeepSeekV4Flash-Vision-EXP-ablit
- Receta de overlay base (cebeuq): https://huggingface.co/cebeuq/DeepSeek-V4-Flash-0731-abliterated

Nota: la búsqueda web realizada no ha devuelto ningún resultado relacionado con este modelo; los enlaces anteriores son los citados en la model card del autor. No hay papers, blogs ni demos adicionales disponibles.
