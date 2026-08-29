# luciagarcia/undergrad-contrastive

## Resumen

`luciagarcia/undergrad-contrastive` es una implementación compacta y personalizada de la arquitectura **Mixer** orientada a aprendizaje contrastivo, desarrollada por Lucia Garcia. El repositorio se presenta explícitamente como un artefacto experimental para revisión de código, pruebas de humo (smoke tests) y experimentos controlados a pequeña escala, no como un modelo preentrenado listo para producción.

El checkpoint incluido (`model.safetensors`) es una inicialización válida de pesos, no un modelo entrenado. Con solo 49.600 parámetros, su escala es mínima, lo que lo hace útil para validar pipelines, depurar implementaciones o servir como baseline de capacidad reducida. La configuración "huge" que menciona la model card es una denominación interna del autor, no una referencia a modelos de gran escala tipo LLM.

La relevancia de este repositorio reside en su valor didáctico y de ingeniería: permite inspeccionar una implementación de Mixer con atención dilatada, normalización InstanceNorm y fusión por concatenación + MLP, todo en un único archivo Python. No se publican resultados de benchmarks ni se reclama ningún rendimiento, y la licencia BSD-3-Clause permite su reutilización con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixer (con atención dilatada) |
| Parametros totales | 49.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en precisión nativa) |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un **Mixer** personalizado implementado en PyTorch. Según la model card, emplea atención **dilatada** (dilated attention), fusión mediante **concatenación seguida de MLP** (concat mlp), activación **Swish** y normalización **InstanceNorm**. Esta combinación es inusual frente a los Mixer clásicos basados en MLP puro, ya que incorpora un mecanismo de atención, lo que lo sitúa como una variante híbrida.

El repositorio incluye un `config.json` con la configuración generada de la arquitectura y un `training_args.json` con la receta experimental por defecto: optimizador **Adafactor** con **calentamiento lineal** (linear warmup). El autor advierte explícitamente de que estos valores son puntos de partida en el script, no evidencia de una ejecución completada. No se documenta el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO, porque no ha habido entrenamiento: el checkpoint es una inicialización aleatoria válida para pruebas.

## Capacidades

- **No es un modelo entrenado**: el checkpoint incluido es una inicialización sin aprendizaje, por lo que no tiene capacidades funcionales de generación, razonamiento o codificación.
- **Implementación de referencia**: sirve como ejemplo ejecutable de una arquitectura Mixer con atención dilatada y normalización InstanceNorm.
- **Pruebas de humo**: permite verificar que el pipeline de forward/backward funciona correctamente en un entorno dado.
- **Experimentos controlados**: puede usarse como baseline de capacidad mínima en estudios de aprendizaje contrastivo.
- **Personalización**: al ser código fuente en un único archivo Python, es modificable para experimentar con variantes arquitectónicas.
- **Sin soporte de tool calling, agentes, visión ni audio**: no se documenta ninguna de estas capacidades, y por la naturaleza del modelo no proceden.

## Casos de uso

- **Revisión de código y auditoría de implementaciones**: el archivo `eval.py` es el artefacto principal; un desarrollador puede inspeccionar cómo se construye un Mixer con atención dilatada y verificar la corrección de la implementación línea a línea.
- **Pruebas de humo en CI/CD**: integrar `python eval.py --help` o el ejemplo del bloque `__main__` en un pipeline de integración continua para validar que el entorno (dependencias, versión de PyTorch, dispositivo) es compatible antes de lanzar experimentos mayores.
- **Depuración de pipelines de entrenamiento**: al ser un modelo de 49.600 parámetros, es ideal para probar bucles de entrenamiento, logging, checkpointing y distribución en múltiples GPUs sin coste computacional apreciable.
- **Baseline en investigación de aprendizaje contrastivo**: usar este checkpoint como referencia de capacidad mínima en experimentos que comparen arquitecturas o estrategias de entrenamiento, siempre que se entrene con la misma exposición a datos y semillas.
- **Enseñanza de arquitecturas híbridas**: el código sirve como material didáctico para explicar cómo combinar mecanismos de atención con bloques Mixer, normalización por instancia y activación Swish.
- **Validación de adaptadores de carga**: dado que la implementación es personalizada, las APIs genéricas de HuggingFace no cargan el modelo directamente; este repositorio permite desarrollar y probar un adaptador específico antes de aplicarlo a modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente: "No benchmark score is claimed in this repository". El checkpoint es una inicialización sin entrenar, por lo que cualquier métrica carecería de significado.

## Requisitos de hardware

- **VRAM estimada**: inferior a 1 GB. Con 49.600 parámetros en precisión fp32, el peso ocupa aproximadamente 198 KB; la memoria total con activaciones y gradientes es trivial para cualquier GPU moderna.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente; incluso una CPU puede ejecutar el modelo sin problemas.
- **GPU de consumo**: sí, cabe en cualquier GPU de consumo (GTX 1050, RTX 2060, etc.) y también en Raspberry Pi o similares.
- **Opciones de despliegue**: al ser una implementación personalizada en PyTorch, no es compatible con vLLM, llama.cpp, Ollama ni TGI sin un adaptador explícito. El despliegue natural es un script Python con PyTorch.
- **Latencia y throughput**: no disponibles, pero en hardware moderno la inferencia de un modelo de este tamaño se completa en microsegundos o milisegundos.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| luciagarcia/undergrad-contrastive | Mixer + atención dilatada | 49.600 | no disponible | BSD-3-Clause | Inicialización sin entrenar |
| annamikhailov/undergrad-contrastive | DeiT (vision transformer) | no disponible | no disponible | MIT | Inicialización sin entrenar |

Ambos repositorios comparten propósito (experimentos de aprendizaje contrastivo a pequeña escala) y estado (checkpoints de inicialización), pero difieren en arquitectura y licencia. No hay datos de rendimiento comparables porque ninguno ha sido entrenado ni evaluado.

## Limitaciones y advertencias

- **Checkpoint sin entrenar**: el modelo no ha sido entrenado ni auditado para robustez, equidad o transferencia de dominio; cualquier resultado obtenido con él debe documentarse por separado de los valores por defecto del repositorio.
- **Riesgo de alucinación**: no aplica, al no ser un modelo generativo entrenado.
- **Limitaciones de contexto e idioma**: no se especifican; al ser una implementación experimental, no hay garantías de soporte multilingüe ni de manejo de secuencias largas.
- **Restricciones de licencia**: BSD-3-Clause permite uso comercial con atribución, pero el autor advierte que deben revisarse los términos de las fuentes de datos externas si se usan con datasets propios.
- **Carga con APIs genéricas**: las APIs automáticas de HuggingFace no funcionarán sin un adaptador explícito, ya que es una implementación personalizada.
- **Riesgo de malinterpretación**: el término "huge" en la configuración es una etiqueta interna, no indica escala masiva; usar este modelo como si fuera un LLM de gran tamaño sería un error conceptual.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/luciagarcia/undergrad-contrastive
- Perfil de la autora: https://huggingface.co/luciagarcia
- Repositorio similar (annamikhailov/undergrad-contrastive): https://huggingface.co/annamikhailov/undergrad-contrastive
- Leaderboard de modelos (referencia general, no específica de este modelo): https://benchlm.ai/
- Leaderboard de Klu (referencia general): https://klu.ai/llm-leaderboard
- AI Leaderboard de llm-stats (referencia general): https://llm-stats.com/
