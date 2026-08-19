# SahoobhAI/Direction-Not-Distance-Full-Trajectories

## Resumen

El repositorio `SahoobhAI/Direction-Not-Distance-Full-Trajectories` no contiene un modelo de lenguaje independiente, sino un conjunto de checkpoints LoRA intermedios generados durante los experimentos de aprendizaje continuo (continual learning) del proyecto "Direction, Not Distance?". Desarrollado por SahoobhAI, este artefacto de investigación documenta la evolución fase a fase (fases 0 a 6) de adaptadores LoRA entrenados sobre los modelos base Qwen3-8B y Qwen3-14B, con el objetivo de estudiar la deriva de preferencias, la interferencia entre tareas y los efectos de distintas estrategias de proyección y mortalidad de coordenadas en el contexto de la alineación de modelos.

La relevancia de este repositorio radica en que permite a investigadores independientes reproducir análisis de deriva de preferencias a nivel de fase, aplicar evaluadores conductuales alternativos, realizar estudios de interpretabilidad mecánica y auditar las afirmaciones sobre alineación del proyecto. Es un recurso especializado para la comunidad de seguridad de IA e interpretabilidad, no un modelo listo para producción. El tamaño del repositorio es de 26,3 GB e incluye manifiestos de archivos y sumas SHA-256 para verificación de integridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre Qwen3-8B y Qwen3-14B (transformers) |
| Parametros totales | no disponible (adaptadores LoRA, no modelos completos) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base, no especificado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (depende del modelo base) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El repositorio contiene trayectorias completas de checkpoints LoRA fase por fase. El experimento principal cubre Qwen3-8B con semillas 42 a 48 y Qwen3-14B con semillas 42 a 44, aplicando condiciones de aprendizaje continuo benigno y conflictivo con la alineación, bajo tres variantes: sin restricciones (unconstrained), proyección global (global projection) y mortalidad de coordenadas (coordinate mortality). Un seguimiento dirigido añade una variante de contracción ajustada por norma (norm-matched shrinkage) para Qwen3-8B con las mismas semillas.

No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, ni el método de alineación (RLHF, DPO, etc.). La innovación técnica del proyecto reside en el análisis de trayectorias de alineación a lo largo de fases, permitiendo estudiar cuándo emerge la interferencia a nivel de coordenadas y cómo distintas intervenciones de proyección afectan la deriva de preferencias. Los checkpoints son artefactos de investigación, no modelos finales afinados por preferencias.

## Capacidades

- No es un modelo de generación de texto autónomo; sus capacidades dependen del modelo base Qwen3-8B o Qwen3-14B al que se apliquen los adaptadores.
- Permite reproducir experimentos de aprendizaje continuo con control fino sobre las fases de entrenamiento.
- Facilita análisis de deriva de preferencias a nivel de fase mediante evaluadores conductuales externos.
- Soporta estudios de interpretabilidad mecánica sobre la interferencia entre coordenadas del adaptador.
- Permite probar métricas de alineación alternativas y auditar afirmaciones sobre alineación conductual.
- No incluye soporte para tool calling, agentes, visión ni otras capacidades especiales; es un recurso de investigación puro.

## Casos de uso

- Reproducción de experimentos de deriva de preferencias: los investigadores pueden cargar los checkpoints de cada fase y aplicar sus propios evaluadores conductuales para verificar o refutar los resultados reportados.
- Análisis de interferencia entre tareas en aprendizaje continuo: al disponer de las fases 0 a 6, se puede estudiar cómo el entrenamiento en una tarea afecta al rendimiento en tareas anteriores y cuándo aparece la interferencia a nivel de coordenadas.
- Desarrollo de métricas de alineación: los checkpoints sirven como banco de pruebas para nuevas métricas que midan la alineación conductual, comparándolas con el evaluador ArmoRM mencionado en el README.
- Investigación en interpretabilidad mecánica: se pueden aplicar técnicas de análisis de activaciones o de descomposición de LoRA para entender qué direcciones del espacio de pesos codifican preferencias.
- Auditoría de afirmaciones de seguridad de IA: el repositorio permite verificar de forma independiente si las mejoras de preferencia basadas en likelihood se traducen en mejoras conductuales reales.
- Estudio de estrategias de regularización en continual learning: las variantes de proyección global, mortalidad de coordenadas y contracción por norma pueden compararse sistemáticamente en términos de estabilidad y plasticidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El README advierte explícitamente que las mejoras de preferencia basadas en likelihood no se transfieren de forma consistente al evaluador conductual independiente ArmoRM, por lo que estos checkpoints no deben interpretarse como una garantía universal de alineación conductual.

## Requisitos de hardware

- Para utilizar los adaptadores LoRA es necesario cargar el modelo base correspondiente: Qwen3-8B o Qwen3-14B.
- VRAM estimada: para Qwen3-8B en bf16, aproximadamente 16 GB; para Qwen3-14B, aproximadamente 28 GB, más el espacio adicional para los adaptadores (el repositorio completo ocupa 26,3 GB en disco).
- GPU recomendadas: RTX 4090 (24 GB) para Qwen3-8B; A100 40 GB o H100 para Qwen3-14B sin cuantización.
- En GPU de consumo, Qwen3-8B puede caber en una RTX 3090 o 4090; Qwen3-14B requeriría cuantización o una GPU con más de 28 GB.
- Opciones de despliegue: al ser artefactos PEFT, se cargan con la librería `peft` de HuggingFace sobre el modelo base. No se mencionan opciones como vLLM u Ollama, ya que no están pensados para inferencia de producción.
- Latencia y throughput: no disponibles; el propósito es el análisis de checkpoints, no la inferencia en tiempo real.

## Comparativa con modelos similares

No disponible. Este repositorio es un artefacto de investigación específico del proyecto "Direction, Not Distance?", sin equivalentes directos en cuanto a trayectorias completas de checkpoints LoRA para continual learning con foco en alineación. Podría compararse con otros repositorios de checkpoints intermedios de proyectos de interpretabilidad, pero no se dispone de información suficiente para establecer comparaciones objetivas.

## Limitaciones y advertencias

- No es un modelo de lenguaje funcional por sí mismo; requiere el modelo base Qwen3-8B o Qwen3-14B y la librería PEFT.
- Las mejoras de preferencia basadas en likelihood no se transfieren de forma consistente al evaluador conductual ArmoRM, lo que cuestiona la validez de las afirmaciones de alineación conductual.
- No se garantiza que los checkpoints proporcionen una alineación conductual universal; deben tratarse como evidencia experimental, no como garantía de seguridad.
- La licencia no está especificada, por lo que el uso comercial o la redistribución son inciertos.
- No se dispone de información sobre el dataset de entrenamiento, lo que limita la reproducibilidad completa del experimento.
- Los idiomas soportados dependen del modelo base; no se especifican en el repositorio.
- La fecha de creación (2026) es posterior a la fecha actual de conocimiento general, lo que sugiere que el proyecto puede ser reciente o tener una fecha de publicación futura; se recomienda verificar la vigencia del contenido.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SahoobhAI/Direction-Not-Distance-Full-Trajectories
- Repositorio GitHub del proyecto: https://github.com/SubramanyamSahoo/Direction-Not-Distance
- Checkpoints LoRA finales (afinados por preferencias): https://huggingface.co/SahoobhAI/Direction-Not-Distance-LoRA
