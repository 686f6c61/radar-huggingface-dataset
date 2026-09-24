# chfm/Qwen-Image-2.1-viggle-turbo

## Resumen

Qwen-Image-2.1-viggle-turbo es un adaptador LoRA de destilación sobre el modelo de difusión Qwen-Image-2.1, publicado por el usuario chfm (el propio README y el Space asociado lo atribuyen a Viggle). Se trata de un "estudiante" entrenado con Distribution Matching Distillation (DMD) que reproduce el comportamiento del modelo base de 40 pasos en 5 pasadas del transformer, sin classifier-free guidance. Su objetivo es reducir el coste de inferencia de un modelo de generación y edición de imágenes de 7,1 mil millones de parámetros sin perder fidelidad de composición respecto al profesor.

El artefacto principal es la versión v0.2, un LoRA de rango 256 y alpha 256 en bf16 (1,3 GB) que se carga en tiempo de ejecución sobre el transformer base. Admite tanto texto-a-imagen como edición guiada por instrucción con 1 a 3 imágenes de referencia, que es la misma doble funcionalidad del modelo base Qwen-Image-2.1, un DiT de 32 capas single-stream con unos 7B de parámetros en su componente de generación visual.

La relevancia actual es doble: por un lado, abarata el despliegue en producción de un modelo de imagen de gran tamaño al reducir de 40 a 5 pasos el coste por muestra; por otro, es un caso práctico de destilación DMD con guiado intra-segmento al estilo SenseFlow. El autor lo marca explícitamente como vista previa y en progreso, y reconoce que todavía queda por debajo del modelo base de 40 pasos en edición compleja, por lo que no debe tratarse como sustituto universal.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre un Diffusion Transformer (DiT) single-stream de 32 capas (arquitectura base Qwen-Image-2.1) |
| Parametros totales | 7.115.124.736 según el recuento de safetensors del repositorio (incluye el transformer v0.1 completo en bf16 y todos los LoRA, no solo el adaptador v0.2) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; es un modelo de difusión, no un modelo de lenguaje con ventana de contexto. El límite práctico es el número de imágenes de referencia admitidas: 1 a 3 |
| Tipos de cuantizacion | no se distribuyen pesos cuantizados. Los pesos incluidos están en bf16 (LoRA en formato de claves diffusers) y en F32 (misma variante v0.2 en formato peft, tal como se entrenó) |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (campo `license: other`, `license_name: qwen-research`, fichero LICENSE en el repositorio) |
| Formato de pesos | safetensors (LoRA en formato de claves diffusers; el mismo adaptador v0.2 también en formato peft). No se publican GGUF ni otros formatos |
| Modelo base | Qwen/Qwen-Image-2.1 (relación declarada: adapter) |
| Tipo de artefacto | adaptador LoRA de destilación para difusión; no es un checkpoint completo |
| Rango del adaptador v0.2 | rank 256, alpha 256, bf16, 1,3 GB |
| Proyecciones con LoRA | atención, image-MLP, modulación y timestep-embedder |
| Pasos de inferencia | 5 pasadas del transformer, con `sigmas=[1.0, 0.875, 0.75, 0.5, 0.25]` y sin classifier-free guidance |
| Scheduler | FlowMatchEulerDiscreteScheduler, config del repositorio con `shift_terminal: null` |
| Tamano del repositorio | 19,3 GB |
| Descargas / likes en HuggingFace | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen-Image-2.1, un transformer de difusión single-stream de 32 capas con aproximadamente 7B de parámetros en el componente de generación visual, según la documentación oficial del proyecto en GitHub. El LoRA v0.2 se aplica sobre las proyecciones de atención, el MLP de imagen, las proyecciones de modulación y el timestep-embedder con rango 256 y alpha 256, y no se fusiona nunca en el transformer: el autor indica que fusionarlo en bf16 introduce pérdida y que cargarlo en tiempo de ejecución es exacto. El encoder de texto, el VAE y el procesador no se redistribuyen y se cargan desde el repositorio base.

El entrenamiento usa Distribution Matching Distillation (DMD) con dos modificaciones: guiado intra-segmento al estilo SenseFlow (la velocidad del estudiante en cada segmento se regresa contra la del profesor) y objetivos de profesor con prompt enhancement. El checkpoint publicado es el estudiante EMA del paso 600 de una ejecución LoRA, entrenado sobre el calendario de 4 pasos pero muestreado con el primer segmento partido, lo que da 5 pasos y, según el autor, elimina buena parte de la pérdida de detalle y el efecto fantasma del rollout directo a 4 pasos. La evaluación interna se hizo sobre un conjunto reservado de 96 peticiones de usuario (texto-a-imagen y edición) comparando contra el modelo base de 40 pasos con su prompt enhancement oficial.

## Capacidades

- Generación de imágenes a partir de texto (pipeline text-to-image) con 5 pasadas del transformer y sin classifier-free guidance.
- Imagen-a-imagen y edición guiada por instrucción, con soporte de 1 a 3 imágenes de referencia en una misma petición.
- Composición multi-referencia: la v0.2 mantiene la deriva de composición a +0,000 respecto al modelo base, es decir, coloca los sujetos donde los coloca el profesor.
- Diversidad de muestreo: la v0.2 alcanza un 0,93 del rango de diversidad del modelo base (medido como distancia media entre parches DINOv2 sobre 8 semillas por prompt), frente al 0,75 de la v0.1.
- Compatibilidad con el ecosistema diffusers mediante `QwenImage21Pipeline` y `load_lora_weights`, más `peft` como dependencia obligatoria.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, razonamiento multi-paso, audio o vídeo: es un modelo de imagen.
- Capacidades multilingües: no disponibles (los idiomas soportados no se declaran).

## Casos de uso

- Servicio de generación de imágenes a escala: sustituir el base de 40 pasos por el LoRA de 5 pasos reduce las pasadas del transformer en un factor de 8 por muestra, lo que se traduce directamente en mayor throughput por GPU en un backend de inferencia con diffusers.
- Edición de fotografía de producto en comercio electrónico: se pasa la foto original como referencia y una instrucción textual (cambio de fondo, retirada de objetos, recolocación) y el modelo devuelve la edición en 5 pasos, con la ventaja de admitir hasta 3 referencias en una misma llamada.
- Iteración rápida de prompts en herramientas de diseño: al requerir solo 5 pasos, el ciclo prompt-revisión-prompt es lo bastante corto para usarse de forma interactiva, y la diversidad de 0,93 respecto al base evita que todas las semillas colapsen en la misma composición, algo que sí ocurría en la v0.1.
- Generación por lotes en granjas de render: para catálogos o campañas con cientos de variaciones, el coste por imagen baja de forma proporcional al número de pasos, y el adaptador pesa 1,3 GB frente a los 19,3 GB del repositorio completo, lo que simplifica el despliegue en nodos con almacenamiento limitado.
- Prototipado de datos sintéticos para entrenamiento: generar pares imagen-instrucción de forma masiva y económica para preentrenar o aumentar datasets de tareas de visión, aceptando el riesgo de artefactos propio de un estudiante destilado.
- Pruebas de concepto de edición con referencias múltiples: composición de dos o tres imágenes de entrada para escenas combinadas, siempre que la instrucción no sea excesivamente compleja, ya que el autor reconoce limitaciones en composición multi-referencia avanzada.
- Investigación sobre destilación: el repositorio conserva la v0.1 (LoRA r64 y fine-tune completo de 4 pasos) junto a la v0.2, lo que permite reproducir y comparar metodologías de destilación DMD con y sin guiado intra-segmento.
- Integración en un pipeline de posproducción: al cargarse como LoRA sobre el transformer base ya desplegado, se puede añadir y quitar del pipeline sin volver a descargar ni recompilar el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K, GenEval, etc.) en la información disponible. Los únicos datos numéricos son la ablación interna del autor sobre un conjunto reservado de 96 peticiones de usuario (texto-a-imagen y edición), comparando contra el modelo base de 40 pasos con su prompt enhancement oficial.

| Métrica | v0.1 LoRA r64 | v0.1 fine-tune completo | v0.2 LoRA r256, 5 pasos | v0.2 a 4 pasos |
|---|---|---|---|---|
| Diversidad de muestras (× modelo base) | 0,75 | 0,72 | 0,93 | 0,89 |
| Deriva de composición frente al base | −0,019 | −0,033 | +0,000 | +0,002 |

Metodología declarada: la diversidad es la distancia media entre parches DINOv2 intra-prompt sobre 8 semillas por prompt y 32 prompts, expresada como ratio respecto al modelo base de 40 pasos (1,00 equivale a la diversidad del base); la deriva de composición es el desplazamiento horizontal medio del centroide de la imagen respecto a la salida del base para el mismo prompt y semilla, medido en anchos de imagen (0 significa que el estudiante coloca los sujetos donde los coloca el profesor). No hay cifras de FID, CLIP score, latencia medida ni comparaciones con modelos de terceros en la información proporcionada.

## Requisitos de hardware

- VRAM estimada del transformer base en bf16: en torno a 14,2 GB solo por los 7,1 mil millones de parámetros del componente de generación visual (cálculo derivado de 7,1 B × 2 bytes, no una medición publicada). El adaptador v0.2 añade 1,3 GB adicionales.
- La información disponible no especifica el tamaño del encoder de texto ni del VAE, que se cargan desde el repositorio base Qwen/Qwen-Image-2.1; por tanto el pico de VRAM del pipeline completo es no disponible y debe medirse en el entorno objetivo.
- GPU recomendadas: no disponible en la información proporcionada. Como referencia de orden de magnitud, el transformer en bf16 cabe en una A100 40 GB o H100 80 GB con margen, y en una RTX 4090 de 24 GB solo si el resto de componentes del pipeline caben o se aplican técnicas de offloading, algo que no se confirma en la documentación del repositorio.
- No se publican versiones cuantizadas (GGUF, int8, fp8 ni similares), por lo que no puede confirmarse el comportamiento en GPUs de consumo con menos de 24 GB.
- Despliegue: diffusers con instalación fijada a un commit concreto de git (`80c7ed262aeffbeb43ef13ae04baeb9b84515a69`), porque `QwenImage21Pipeline` todavía no está en una release publicada; requiere además `peft`, `accelerate`, `safetensors`, `transformers>=5.17,<6` y `pillow`. No se documenta soporte para vLLM, TGI, llama.cpp u Ollama (no aplica a esta arquitectura de difusión en la información disponible).
- Latencia y throughput: no se publican mediciones. El único dato indirecto es la reducción de 40 a 5 pasadas del transformer por muestra, sin CFG, lo que implica aproximadamente 8 veces menos pasadas de cómputo por imagen en el componente de difusión.
- Existe un Space de demostración oficial: https://huggingface.co/spaces/Viggle/Qwen-Image-2.1-viggle-turbo.

## Comparativa con modelos similares

| Modelo | Parámetros | Pasos de inferencia | CFG | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| Qwen-Image-2.1-viggle-turbo v0.2 (este) | LoRA r256 de 1,3 GB sobre un DiT de ~7B | 5 (`sigmas=[1.0, 0.875, 0.75, 0.5, 0.25]`) | No | safetensors (diffusers y peft) | qwen-research | Diversidad 0,93× el base; deriva de composición +0,000 |
| Qwen-Image-2.1 (modelo base) | ~7B en el componente de generación visual (32 capas DiT single-stream) | 40 | Sí | safetensors | qwen-research | Referencia de calidad; el autor lo usa como profesor y como línea base |
| Qwen-Image-2.1-viggle-turbo v0.1 (LoRA r64) | LoRA r64, 340 MB, sobre el mismo base | 4 | No | safetensors | qwen-research | Diversidad 0,75×; deriva −0,019; más suave y con más colapso de semillas |
| Qwen-Image-2.1-viggle-turbo v0.1 (fine-tune completo) | Transformer completo en bf16 | 4 | No | safetensors (`transformer/`) | qwen-research | La peor diversidad de la familia (0,72×) y la mayor deriva (−0,033) |

No se dispone de datos comparativos con modelos de destilación de terceros (por ejemplo variantes turbo o lightning de otras familias) en la información proporcionada.

## Limitaciones y advertencias

- Estado de vista previa y trabajo en curso: el propio autor indica que la v0.2, aun siendo muy superior a la v0.1, sigue por debajo del modelo base de 40 pasos en edición compleja (composición multi-referencia, intercambio de caras, ediciones que preservan identidad e instrucciones con varias restricciones simultáneas).
- Las métricas publicadas (diversidad 0,93×, deriva +0,000) son mediciones del propio autor sobre 96 peticiones reservadas, no una evaluación independiente ni reproducible con los artefactos del repositorio.
- El esquema de muestreo es rígido: hay que usar 5 pasos con los sigma nodes exactos `[1.0, 0.875, 0.75, 0.5, 0.25]` y el `scheduler_config.json` incluido. No se documenta el comportamiento fuera de esa configuración.
- No se deben apilar dos estudiantes (un LoRA sobre el transformer afinado, o ambos LoRA a la vez). El autor lo advierte explícitamente.
- Fusionar el LoRA en bf16 es conéptualmente pérdida de precisión según el autor; debe cargarse en tiempo de ejecución para mantener la equivalencia con el entrenamiento.
- Licencia `qwen-research`: los términos concretos no se detallan en la información disponible, pero por su nombre es una licencia de investigación, por lo que el uso comercial debe verificarse en el fichero LICENSE antes de cualquier despliegue productivo.
- El encoder de texto, el VAE y el procesador no se redistribuyen; se cargan desde Qwen/Qwen-Image-2.1, de modo que se heredan las condiciones y restricciones de ese repositorio.
- Riesgo de alucinación visual y de artefactos propio de un modelo destilado a pocos pasos: el autor menciona pérdida de detalle, efecto fantasma de sujetos duplicados e instrucciones descartadas o fusionadas como problemas característicos, mitigados pero no eliminados en la v0.2.
- Idiomas soportados no declarados: no puede garantizarse un comportamiento correcto de las instrucciones de edición en castellano u otros idiomas distintos del usado en el entrenamiento.
- Sin validación comunitaria: el repositorio consultado registra 0 descargas y 0 likes, por lo que no hay evidencia externa de estabilidad ni de reproducibilidad.
- Discrepancia de identificador: la ficha de HuggingFace consultada corresponde a `chfm/Qwen-Image-2.1-viggle-turbo`, mientras que el README, el Space de demostración y los resultados de búsqueda apuntan a `Viggle/Qwen-Image-2.1-viggle-turbo`. Conviene confirmar cuál es el repositorio canónico antes de fijar una dependencia.
- Dependencia de una instalación de diffusers fijada a un commit de git concreto: `QwenImage21Pipeline` no está en una release estable, lo que complica la reproducibilidad a medio plazo.

## Enlaces

- Modelo en HuggingFace (identificador de la ficha): https://huggingface.co/chfm/Qwen-Image-2.1-viggle-turbo
- Modelo en HuggingFace (identificador citado en el README y en los resultados de búsqueda): https://huggingface.co/Viggle/Qwen-Image-2.1-viggle-turbo
- Space de demostración: https://huggingface.co/spaces/Viggle/Qwen-Image-2.1-viggle-turbo
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio oficial de Qwen-Image-2.1 en GitHub: https://github.com/QwenLM/Qwen-Image-2.1
- Modelo Qwen-Image original: https://huggingface.co/Qwen/Qwen-Image
- Réplica en ModelScale: https://www.modelscope.cn/models/Viggle/Qwen-Image-2.1-viggle-turbo
- Artículo sobre el lanzamiento de la v0.1: https://localmodelwatch.tsuchitsuchi.com/en/2026/09/23/qwen-image-2-1-viggle-turbo-v0-1-preview/
