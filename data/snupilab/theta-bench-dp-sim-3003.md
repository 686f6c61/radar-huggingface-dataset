# snupilab/theta-bench-dp-sim-3003

# Snupilab/theta-bench-dp-sim-3003

## Resumen
Theta bench dp sim 3003 es un checkpoint de política robótica publicado por el laboratorio snupilab dentro de su marco de trabajo THETA Bench. No es un modelo de lenguaje ni un modelo multimodal de propósito general: es el resultado final validado de un entrenamiento en simulación de una política de control (denominada DP, previsiblemente *diffusion policy*) condicionada por lenguaje, entrenada sobre el conjunto de datos snupilab/theta-bench-teleop. El repositorio funciona como artefacto de reproducibilidad de un experimento concreto, no como sustituto de una política preentrenada de terceros.

La relevancia del repositorio es acotada pero específica: documenta de forma explícita la receta de entrenamiento (40.000 actualizaciones del optimizador objetivo, batch global 128 repartido en 8 GPUs con batch por GPU de 16, acumulación de gradiente 1 y 18 condiciones por batch global), la revisión exacta del dataset empleada y los requisitos de carga en inferencia. El pool de simulación consta de 1.200 demostraciones L1/L2 exitosas más 1.803 prefijos L0 extraídos, hasta sumar 3.003 segmentos sobre 18 condiciones; el propio autor advierte que esos 3.003 segmentos no equivalen a 3.003 demostraciones independientes.

El repositorio ocupa 0,7 GB y se distribuye en safetensors junto con el checkpoint nativo de la política (ema_net.pth). El autor no reclama ninguna puntuación de evaluación al publicar el checkpoint, lo que lo sitúa como material de partida para reproducir, auditar o continuar el entrenamiento, más que como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política robótica de difusión (diffusion policy, DP); backbone no especificado. Acondicionamiento por lenguaje mediante openai/clip-vit-large-patch14 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; consume observaciones y una condición de lenguaje por episodio) |
| Tipos de cuantizacion | no disponible; se publican pesos safetensors y checkpoint nativo ema_net.pth |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors, retenido para el descubrimiento por el launcher) y ema_net.pth (pesos EMA usados por el serving nativo DP) |
| Tamano del repositorio | 0,7 GB |
| Pipeline declarado | robotics |
| Etapa de entrenamiento | Simulation training, 3.003 segmentos |
| Actualizaciones del optimizador objetivo | 40.000 |
| Batch | 16 por GPU / 8 GPUs / 128 global; acumulación de gradiente 1; 18 condiciones por batch global |
| Revision del dataset | 8b2cd31e107b64cb13f812ea217a63a20845c78a |
| Layout del checkpoint | run/checkpoints/ckpt_40000 |
| Entorno de simulacion asociado | MuJoCo (según etiquetas del repositorio) |

## Arquitectura y entrenamiento
La información publicada no detalla la arquitectura interna de la política más allá de su naturaleza DP (diffusion policy) y del uso de un adaptador nativo THETA. El acondicionamiento por lenguaje se resuelve con el codificador visual-textual openai/clip-vit-large-patch14, cuya revisión exacta debe precargarse (32bd64288804d66eefd0ccbe215aa642df71cc41) para que el adaptador funcione. El autor indica que existen dos conjuntos de pesos en el repositorio y que el serving nativo de DP selecciona ema_net.pth, mientras que model.safetensors se conserva únicamente para el descubrimiento por parte del launcher; sustituir los pesos EMA por los no EMA invalida el comportamiento esperado.

El entrenamiento se realizó sobre 3.003 segmentos procedentes de un pool de simulación compuesto por 1.200 demostraciones L1/L2 exitosas y 1.803 prefijos L0 extraídos, cubriendo 18 condiciones, con un objetivo de 40.000 actualizaciones del optimizador, batch global de 128 (16 por GPU en 8 GPUs) y sin acumulación de gradiente. La model card menciona el uso de optimizadores de modelo independientes y ejecución compartida de GPU a través de MPS, y señala que la publicación del checkpoint la realizó un cargador (uploader) en CPU tras la validación final. No se documenta composición lingüística del dataset, número de tokens, ni fases de RLHF o DPO, conceptos que en cualquier caso no aplican a este tipo de política.

## Capacidades
- Control robótico por imitación en simulación, condicionado por instrucciones en inglés, sobre 18 condiciones definidas en el dataset de teleoperación.
- Ejecución de la política con el adaptador nativo THETA y el código fuente Psi0 fijado por el autor, resolviendo estadísticas de normalización desde dataset_statistics.json del propio run.
- Inferencia con los pesos EMA del checkpoint ckpt_40000, requisito explícito para reproducir el comportamiento validado.
- Uso como punto de partida para continuar el entrenamiento dentro del pipeline THETA (el repositorio conserva el layout de run y checkpoint).
- No dispone de generación de texto, razonamiento simbólico, matemáticas, visión general ni código.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta capacidad multilingüe: el único idioma declarado es inglés (en).
- No se documentan capacidades especiales como modo de razonamiento, audio o visión más allá del codificador CLIP empleado para el condicionamiento.

## Casos de uso
- Reproducción de resultados de THETA Bench: cargar el run con el adaptador nativo THETA en el paso 40000 permite regenerar el comportamiento exacto del checkpoint publicado, siempre que se respete la revisión del dataset y la revisión de CLIP indicadas.
- Auditoría de una receta de entrenamiento: el repositorio documenta batch, número de actualizaciones y revisión del dataset, por lo que sirve para verificar la trazabilidad de un experimento de simulación antes de darlo por válido.
- Continuación del entrenamiento: al conservar la estructura run/checkpoints/ckpt_40000 y las estadísticas de normalización serializadas, es un punto de reanudación natural para fine-tuning con más segmentos o más condiciones.
- Estudio de sim-to-real: sirve como política candidata para evaluar en MuJoCo el comportamiento aprendido únicamente en simulación, antes de considerar cualquier transferencia a un robot físico.
- Comparación EMA frente a no EMA: al conservar ambos artefactos de pesos, permite medir experimentalmente la diferencia de comportamiento entre ema_net.pth y los pesos no EMA, algo que la model card prohíbe sustituir en el serving nativo.
- Evaluación de robustez condicional: con 18 condiciones y 3.003 segmentos, se pueden diseñar barridos por condición para localizar en qué tareas la política falla o generaliza peor.
- Integración como línea base interna: cualquier equipo que entrene políticas DP con el mismo pipeline puede usar este checkpoint como referencia de entrenamiento en simulación con batch global 128 durante 40.000 actualizaciones.
- Docencia y formación en robótica: el repositorio ilustra de forma completa los requisitos de dependencias fijadas, precarga de codificadores y resolución de límites de normalización en un pipeline de políticas de difusión.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card indica expresamente que la publicación del checkpoint no reclama ninguna puntuación de evaluación ("No evaluation score is claimed by checkpoint publication"), por lo que no existe tabla de métricas que comparar con otros modelos.

## Requisitos de hardware
- Almacenamiento: el repositorio ocupa 0,7 GB, incluyendo safetensors y checkpoint nativo.
- VRAM para inferencia: no disponible de forma explícita; como referencia, el tamaño del repo (0,7 GB) es compatible con GPUs de gama de consumo con 4 GB o más de VRAM, pero se trata de una estimación basada únicamente en el tamaño de los artefactos, no de un requisito declarado por el autor.
- Entrenamiento documentado: 8 GPUs en paralelo con batch de 16 por GPU y batch global de 128.
- GPU recomendadas: no disponible. El autor no especifica modelos de GPU concretos (A100, H100, RTX 4090 u otros).
- GPU de consumo: no confirmado por el autor. El tamaño del repositorio sugiere viabilidad en GPUs de consumo, pero no hay confirmación oficial ni mediciones.
- Opciones de despliegue: adaptador nativo THETA con el código fuente Psi0 fijado, resolviendo el run desde el directorio exportado para que dataset_statistics.json se localice correctamente, y con openai/clip-vit-large-patch14 precargado en la revisión indicada. Se debe conservar el layout run/checkpoints/ckpt_40000 y usar el paso 40000.
- Frameworks no aplicables: vLLM, llama.cpp, Ollama y TGI no son opciones válidas para este artefacto, que no es un modelo de lenguaje; la model card advierte además de que no se reclama compatibilidad con Transformers arbitrarios ni con cargadores de simulación genéricos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
No disponible. La información proporcionada no incluye datos de rendimiento ni comparaciones con otras políticas robóticas (por ejemplo, otras diffusion policies, Octo o VLA de referencia), y la model card no declara comparabilidad con ningún otro sistema. Cualquier comparación numérica requeriría ejecutar el checkpoint bajo la misma revisión de dataset y el mismo entorno de simulación, algo que no se ha realizado en los datos disponibles.

## Limitaciones y advertencias
- Licencia no disponible: al no declararse licencia, no hay autorización explícita de uso comercial ni de redistribución; conviene contactar con el autor antes de cualquier uso productivo.
- Sin puntuación de evaluación: el autor no reclama ningún resultado de benchmark, por lo que no hay evidencia publicada de calidad de la política.
- Solo simulación: el entrenamiento es "simulation training"; no se documenta validación en robot físico ni transferencia sim-to-real.
- Segmentos no independientes: los 3.003 segmentos incluyen 1.200 demostraciones L1/L2 y 1.803 prefijos L0 extraídos, de modo que la diversidad efectiva de datos es menor de lo que sugiere la cifra bruta.
- Cobertura limitada a 18 condiciones: cualquier comportamiento fuera de ese conjunto queda fuera del alcance declarado del entrenamiento.
- Idioma único: el condicionamiento por lenguaje está declarado solo en inglés (en), sin soporte multilingüe documentado.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de generalización incorrecta de la política ante observaciones o instrucciones fuera de distribución.
- Dependencias estrictas: requiere el adaptador nativo THETA, el código Psi0 fijado y la revisión concreta 32bd64288804d66eefd0ccbe215aa642df71cc41 de openai/clip-vit-large-patch14; la model card advierte de que no se debe asumir compatibilidad con Transformers o cargadores de simulación arbitrarios.
- Pesos EMA obligatorios: el serving nativo de DP selecciona ema_net.pth y el autor prohíbe sustituirlo por pesos no EMA; usar model.safetensors como pesos de inferencia puede alterar el comportamiento.
- Metadatos con fechas atípicas: el repositorio figura creado y actualizado el 13 de septiembre de 2026, posterior a la fecha habitual de consulta, lo que conviene tener en cuenta al citarlo.
- Sin sesgos documentados: no hay información sobre sesgos del dataset de teleoperación, composición demográfica o condiciones de recogida de datos.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/snupilab/theta-bench-dp-sim-3003
- Dataset de entrenamiento: https://huggingface.co/datasets/snupilab/theta-bench-teleop
- Dataset fijado (revisión 8b2cd31e107b64cb13f812ea217a63a20845c78a): https://huggingface.co/datasets/snupilab/theta-bench-teleop/tree/8b2cd31e107b64cb13f812ea217a63a20845c78a/raw
- Codificador de lenguaje a precargar (revisión 32bd64288804d66eefd0ccbe215aa642df71cc41): https://huggingface.co/openai/clip-vit-large-patch14/tree/32bd64288804d66eefd0ccbe215aa642df71cc41
- Resultados de búsqueda web: no se encontró ningún enlace relevante sobre este modelo, el proyecto THETA Bench o el dataset asociado; las entradas devueltas por el buscador no guardan relación con el modelo y no se incluyen.
