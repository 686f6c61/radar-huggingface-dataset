# liguang0115/justact

## Resumen

JustAct es un conjunto de pesos publicado por Runjia Li y colaboradores (Universidad de Oxford, entre otras instituciones, según la afiliación habitual de los autores) para el artículo "JustAct: Extracting Action Representations from Foundation Models for World Models", aceptado en NeurIPS 2026. No es un modelo generativo de texto, sino un conjunto de adaptadores LoRA y artefactos auxiliares que permiten extraer representaciones de acción a partir de V-JEPA 2 ViT-L, un modelo fundacional de vídeo desarrollado por Meta. El objetivo es obtener un espacio de acciones útil para entrenar y condicionar modelos del mundo (world models) sin necesidad de anotaciones de acción explícitas.

El repositorio contiene los adaptadores LoRA de JustAct (34 MB) sobre V-JEPA 2 ViT-L, una proyección aleatoria fija de 1024 a 640 dimensiones, dos modelos de acción latente reentrenados (AdaWorld y DreamDojo), cuatro modelos del mundo basados en AdaWorld con distintos condicionamientos de acción, y clasificadores de dinámica inversa para los entornos DMLab, Minecraft y Habitat, además de un readout para nuScenes. Todo el conjunto ocupa 5,7 GB.

Su relevancia radica en que propone un método para destilar representaciones de acción desde un modelo fundacional de vídeo preentrenado a gran escala, lo que reduce la dependencia de datos etiquetados con acciones y facilita el entrenamiento de world models utilizables en planificación y control. El modelo base V-JEPA 2 ViT-L procesa clips de 64 fotogramas a resolución 256, y JustAct se apoya en esa arquitectura para producir representaciones de acción que luego se evalúan en tareas de dinámica inversa y predicción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre V-JEPA 2 ViT-L (transformer de visión para vídeo); modelos del mundo basados en AdaWorld (difusión latente derivada de Stable Video Diffusion) |
| Parametros totales | No disponible (el adaptador LoRA de JustAct ocupa 34 MB; el modelo base V-JEPA 2 ViT-L no se incluye en el repo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base procesa clips de 64 fotogramas a 256 px) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de vídeo, no lingüístico) |
| Licencia | Apache 2.0 para los pesos; aplican además las condiciones de Stability AI sobre Stable Video Diffusion (base de AdaWorld) y las licencias de los datasets de entrenamiento y evaluación, varias de uso no comercial |
| Formato de pesos | safetensors (adaptadores PEFT, proyección, modelos del mundo, clasificadores); SHA256SUMS para verificación |

## Arquitectura y entrenamiento

JustAct se construye sobre V-JEPA 2 ViT-L, un transformer de visión que procesa clips de vídeo de 64 fotogramas a 256 píxeles. Sobre él se entrenan adaptadores LoRA en formato PEFT que transforman las representaciones internas del modelo fundacional en un espacio de acción latente. Una proyección aleatoria fija de 1024 a 640 dimensiones (2,6 MB) se aplica a continuación para alinear la dimensionalidad con los modelos del mundo posteriores. El repositorio incluye dos modelos de acción latente reentrenados sobre los pares de fotogramas del artículo (AdaWorld LAM, 1,9 GB, y DreamDojo LAM, 2,8 GB), que sirven como líneas base de comparación.

Los modelos del mundo incluidos son cuatro variantes de AdaWorld (223-246 MB cada una, con LoRA y condicionamiento de acción): sin acción, con acción de AdaWorld LAM, con acción de DreamDojo LAM y con acción de JustAct. AdaWorld es un modelo del mundo de difusión latente derivado de Stable Video Diffusion. El repositorio incluye además estadísticas de blanqueo (whitening) para la entrada de JustAct al modelo del mundo, y clasificadores de dinámica inversa para DMLab, Minecraft y Habitat (métrica Follow) junto con un readout de movimiento hacia delante para nuScenes. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO (no aplicables a este tipo de modelo).

## Capacidades

- Extracción de representaciones de acción a partir de vídeo mediante adaptadores LoRA sobre V-JEPA 2 ViT-L.
- Condicionamiento de modelos del mundo (AdaWorld) con acciones latentes derivadas de vídeo.
- Evaluación de dinámica inversa: clasificadores para predecir acciones a partir de transiciones de fotogramas en DMLab, Minecraft y Habitat.
- Predicción de movimiento hacia delante en el dataset de conducción nuScenes mediante un readout específico.
- Comparación controlada frente a modelos de acción latente alternativos (AdaWorld LAM y DreamDojo LAM) reentrenados sobre los mismos pares de fotogramas.
- No soporta generación de texto, tool calling, agentes, razonamiento lingüístico ni capacidades multilingües; es un artefacto de investigación en visión por computador y modelos del mundo.

## Casos de uso

- Investigación en world models: entrenar o condicionar modelos del mundo con representaciones de acción extraídas de vídeo no etiquetado, reduciendo la dependencia de acciones anotadas manualmente.
- Planificación basada en modelos: usar las representaciones de acción de JustAct para condicionar AdaWorld y simular trayectorias antes de actuar en entornos de control.
- Evaluación de representaciones de acción: comparar JustAct con AdaWorld LAM y DreamDojo LAM sobre los mismos pares de fotogramas usando los checkpoints incluidos y las tablas del artículo.
- Robótica y aprendizaje por imitación: aprovechar la dinámica inversa para inferir acciones a partir de demostraciones en vídeo en entornos como Habitat o Minecraft.
- Conducción autónoma: emplear el readout de nuScenes para evaluar la capacidad del modelo de capturar movimiento hacia delante a partir de secuencias de vídeo.
- Reproducibilidad de resultados: los checkpoints y el código del repositorio de GitHub permiten reproducir cada tabla del artículo de NeurIPS 2026.
- Análisis de agentes en entornos 3D: usar los clasificadores de dinámica inversa de DMLab, Minecraft y Habitat como métrica de fidelidad de las acciones inferidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las tablas del artículo (Tablas 1 a 4) y al repositorio de GitHub para los resultados numéricos, pero no incluye cifras en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El adaptador JustAct ocupa 34 MB, pero requiere cargar V-JEPA 2 ViT-L (no incluido en el repo) y, para los experimentos del modelo del mundo, AdaWorld y el codificador de imagen OpenCLIP ViT-H-14.
- GPU recomendadas: no disponibles en la información proporcionada. Por el tamaño del modelo base V-JEPA 2 ViT-L y de AdaWorld (derivado de Stable Video Diffusion), se requiere previsiblemente una GPU de datacenter (A100, H100) para entrenamiento y evaluación completos, aunque no se confirma en la documentación.
- Viabilidad en GPU de consumo: no confirmada; el adaptador LoRA es pequeño, pero el pipeline completo depende de modelos base de varios GB.
- Opciones de despliegue: descarga mediante `hf download` con verificación `sha256sum -c SHA256SUMS`; carga de adaptadores con PEFT; el código de uso y evaluación está en el repositorio de GitHub del proyecto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JustAct (este) | LoRA sobre V-JEPA 2 ViT-L para representaciones de acción | No disponible (adaptador 34 MB) | No disponible (clips de 64 fotogramas a 256 px) | Apache 2.0 (+ términos de Stability AI) | HuggingFace y GitHub |
| AdaWorld LAM (reentrenado) | Modelo de acción latente | No disponible (1,9 GB) | No disponible | Apache 2.0 (AdaWorld) | Incluido en este repo |
| DreamDojo LAM (reentrenado) | Modelo de acción latente | No disponible (2,8 GB) | No disponible | No disponible | Incluido en este repo |
| V-JEPA 2 ViT-L | Modelo fundacional de vídeo | No disponible | Clips de 64 fotogramas a 256 px | MIT | `facebook/vjepa2-vitl-fpc64-256` |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes conversacionales; su uso está restringido a investigación en visión y world models.
- Los pesos del modelo del mundo son adaptadores sobre AdaWorld, que a su vez deriva de Stable Video Diffusion, por lo que se aplican también las condiciones de Stability AI además de la licencia Apache 2.0.
- Varios de los datasets de entrenamiento y evaluación son de uso exclusivamente no comercial, según se indica en el apéndice del artículo y en el repositorio de GitHub; es imprescindible revisarlos antes de cualquier uso comercial.
- Los modelos base V-JEPA 2 ViT-L, AdaWorld y OpenCLIP ViT-H-14 no se incluyen en el repositorio y deben descargarse por separado de sus autores, con sus propias licencias.
- No se han publicado métricas de rendimiento en la información disponible; la evaluación completa requiere ejecutar el código del repositorio de GitHub.
- Riesgo de sesgos y alucinación: no evaluado en la información disponible; al tratarse de un modelo entrenado sobre vídeo, puede heredar sesgos de los datasets de vídeo utilizados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni de validación externa.

## Enlaces

- HuggingFace: https://huggingface.co/liguang0115/justact
- Repositorio de código: https://github.com/runjiali-rl/justact
- Página del proyecto: https://runjiali-rl.github.io/justact/
- Modelo base V-JEPA 2 ViT-L: https://huggingface.co/facebook/vjepa2-vitl-fpc64-256
- Modelo del mundo AdaWorld: https://huggingface.co/Little-Podi/AdaWorld
