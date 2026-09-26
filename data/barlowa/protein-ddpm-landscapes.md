# barlowa/protein-ddpm-landscapes

## Resumen

`barlowa/protein-ddpm-landscapes` es un conjunto de checkpoints de modelos de difusión condicional (DDPM) para diseño de proteínas, publicados por el usuario barlowa. No se trata de un modelo de lenguaje ni de un checkpoint compatible con transformers, sino de una colección de `state_dict` crudos de un denoiser MLP que opera sobre variantes proteicas codificadas en one-hot. El modelo se entrena contra paisajes de fitness medidos experimentalmente: GB1 (149.361 variantes medidas) y AAV2 (38.000 variantes de cápside).

La relevancia del repositorio es doble. Por un lado, la carpeta `gb1/` contiene la versión funcional: un modelo condicionado por fitness con guiado libre de clasificador (classifier-free guidance), que corrige el problema de memorización de la versión anterior (v1), la cual copiaba el 46% de las filas del conjunto de entrenamiento. Por otro, la carpeta `aav2/` se publica deliberadamente como un fallo documentado: el oráculo de evaluación es vacuo (el 100% del espacio evaluado no estaba medido) y el modelo no ajusta la variedad de los datos.

El repositorio es pequeño (0,0 GB reportados), tiene licencia MIT y se orienta explícitamente a investigación y docencia. El muestreo no se realiza con herramientas estándar de inferencia, sino clonando el repositorio de GitHub `barlowa124/protein-diffusion` y ejecutando su módulo de sampling.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Denoiser MLP (DDPM condicional) sobre variantes proteicas en codificación one-hot |
| Parámetros totales | no disponible (la model card lo describe como "small MLP denoiser"; no se publica el recuento) |
| Parámetros activos | no aplica (no es una arquitectura MoE) |
| Longitud de contexto | no disponible (no aplica: no procesa secuencias de texto, opera sobre vectores de variantes proteicas) |
| Tipos de cuantización | no disponible (se publican `state_dict` en la precisión de entrenamiento; no se documentan versiones cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `state_dict` de PyTorch del `Denoiser` del repositorio; no es un checkpoint de transformers, safetensors ni GGUF |
| Autor | barlowa |
| Variantes incluidas | `gb1/` (condicionada por fitness, CFG), `gb1-ddp/` (2 procesos DDP con `torchrun`/gloo), `aav2/` (fallo documentado) |
| Datos de entrenamiento | GB1: 149.361 variantes medidas. AAV2: 38.000 variantes de cápside |
| Tamaño del repositorio | 0,0 GB (según HuggingFace) |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 25 de septiembre de 2026 |
| Última actualización | 26 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es un proceso de difusión denoising probabilístico (DDPM) cuyo denoiser es un perceptrón multicapa (MLP) que trabaja sobre variantes proteicas representadas en one-hot. No se emplea un transformer, ni atención, ni arquitecturas de espacio de estados. El condicionamiento se aplica sobre el valor de fitness del paisaje medido, y el muestreo utiliza guiado libre de clasificador (classifier-free guidance), con un peso de guiado (`w`) configurable: la model card reporta resultados con `guided-w8`.

El historial de entrenamiento documentado en la model card es relevante para interpretar los pesos. La versión v1 sobre GB1 memorizó el conjunto de entrenamiento, con un 46% de filas copiadas; la v2 introdujo el condicionamiento por fitness, lo que corrigió esa memorización. La carpeta `gb1-ddp/` reproduce la misma configuración bajo `torchrun` con backend `gloo` y épocas repartidas por rango, y se incluye por paridad de resultados: el fitness medio guiado con `w=8` fue de 1,97 frente a 1,69 en el entrenamiento monoproceso. La carpeta `aav2/` corresponde a un entrenamiento que no ajusta la variedad de los datos y se conserva explícitamente como reproducción de un fallo.

No se documentan en la información disponible el número total de tokens o ejemplos vistos durante el entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables en este dominio, pero no se mencionan alternativas equivalentes).

## Capacidades

- Generación condicional de variantes proteicas: el modelo muestrea variantes del paisaje GB1 condicionadas por un valor objetivo de fitness, mediante guiado libre de clasificador.
- Modelado de paisajes de fitness medidos: entrenado contra datos experimentales de GB1 (149.361 variantes) y AAV2 (38.000 variantes de cápside).
- Reproducción de resultados de investigación: los pesos `gb1-ddp/` permiten verificar la paridad entre entrenamiento monoproceso y distribuido con `torchrun` y `gloo`.
- Reproducción de fallos documentados: los pesos `aav2/` permiten estudiar un caso de infraajuste y de oráculo de evaluación vacuo.
- Estudio de memorización en modelos generativos: la comparación v1 (46% de filas copiadas) frente a v2 condicionada sirve como material para analizar memorización frente a generalización.
- No soporta tool calling ni function calling: no es un modelo de lenguaje ni expone interfaz de herramientas.
- No soporta agentes ni razonamiento multi-paso: la generación es un proceso de difusión sobre un espacio de variantes, no una secuencia de decisiones textuales.
- Capacidades multilingües: no aplica.
- Capacidades especiales: guiado libre de clasificador con peso configurable; ninguna capacidad de visión, audio o modo de razonamiento (thinking mode).

## Casos de uso

- Docencia en aprendizaje generativo aplicado a proteínas: el repositorio permite mostrar de forma reproducible cómo un DDPM condicionado corrige la memorización de su versión no condicionada, usando los pares v1/v2 de GB1.
- Investigación sobre memorización en modelos generativos: el dato del 46% de filas copiadas en v1 y su corrección mediante condicionamiento ofrece un caso medible para estudiar la frontera entre copia y generación.
- Experimentación con guiado libre de clasificador: el peso de guiado `w` es un hiperparámetro manipulable, y la model card reporta resultados con `w=8`, lo que permite reproducir curvas de dosis-respuesta del fitness generado.
- Reproducción de un fallo metodológico: la carpeta `aav2/` sirve para ilustrar cómo un oráculo con el 100% del espacio de evaluación no medido invalida la evaluación de un modelo, un caso útil en cursos de metodología experimental.
- Verificación de entrenamiento distribuido: `gb1-ddp/` permite comparar el fitness medio guiado entre ejecución monoproceso (1,69) y dos procesos DDP (1,97) para auditar el efecto del reparto de épocas.
- Evaluación de pipelines de diseño de proteínas asistido por ML: el modelo puede integrarse como paso generativo en un flujo de investigación que después valide las variantes en laboratorio húmedo, siempre con la salvedad de que no hay validación experimental de las secuencias generadas.
- Benchmarking interno de infraestructura: al ser un MLP pequeño que se entrena y muestrea en el repositorio propio, es adecuado como carga de trabajo de control para probar configuraciones de `torchrun`, `gloo` y reparto de datos por rango.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible: no son aplicables a un modelo de este dominio. La model card sí reporta métricas específicas del paisaje GB1, que se recogen a continuación tal como aparecen en la información proporcionada.

| Métrica | Valor | Contexto |
|---|---|---|
| Tasa de memorización (v1) | 46% de filas copiadas del conjunto de entrenamiento | Versión no condicionada; corregida en v2 |
| Fitness medio guiado `w=8`, monoproceso | 1,69 | Configuración de referencia |
| Fitness medio guiado `w=8`, 2 procesos DDP | 1,97 | `torchrun`, backend `gloo`, épocas repartidas por rango |
| Espacio no medido en la rebanada de evaluación de AAV2 | 100% | El oráculo se describe como vacuo |
| Variantes medidas en GB1 | 149.361 | Paisaje de fitness de entrenamiento |
| Variantes medidas en AAV2 | 38.000 | Paisaje de cápside; modelo infraajustado |

No se proporcionan métricas de comparación con líneas base triviales en la información disponible, aunque la model card indica que dicha comparación existe en la carpeta `results/` del repositorio de GitHub.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La model card describe el denoiser como un MLP pequeño y el repositorio ocupa 0,0 GB, pero no se publica el recuento de parámetros ni cifras de memoria.
- GPU recomendadas: no disponible. No se documentan GPU de referencia para entrenamiento ni inferencia.
- Viabilidad en GPU de consumo: no disponible de forma explícita; por la naturaleza del modelo (MLP de pequeño tamaño, sin atención ni secuencias largas) es razonable esperar que quepa en cualquier GPU de consumo e incluso que la inferencia en CPU sea viable, pero esto es una inferencia a partir de la descripción, no un dato publicado.
- Entrenamiento distribuido: la variante `gb1-ddp/` se entrenó con `torchrun` y backend `gloo` sobre 2 procesos, lo que sugiere que el entrenamiento no requiere hardware especializado ni comunicación por NCCL.
- Opciones de despliegue: no se soportan servidores de inferencia estándar (vLLM, TGI, Ollama, llama.cpp). El muestreo se realiza clonando el repositorio de GitHub y ejecutando el módulo de sampling: `git clone https://github.com/barlowa124/protein-diffusion && cd protein-diffusion && PYTHONPATH=src python -m protein_diffusion.sample ...`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se proporciona en la información disponible ningún dato verificado de modelos comparables (parámetros, contexto, rendimiento, licencia o disponibilidad) que permita construir una comparación rigurosa. El repositorio pertenece a la familia de modelos generativos para diseño de proteínas, en la que existen otros enfoques conocidos como RFdiffusion, ProteinMPNN o modelos basados en ESM, pero la información facilitada no incluye sus cifras, de modo que cualquier tabla comparativa requeriría datos externos no verificados aquí.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `barlowa/protein-ddpm-landscapes` | no disponible (MLP pequeño) | no aplica | Métricas específicas de GB1 (ver sección de benchmarks) | MIT | HuggingFace + GitHub |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Uso restringido a investigación y educación: la model card indica explícitamente "research/education only", sin ninguna afirmación de fitness validado en laboratorio húmedo.
- El oráculo de fitness es el propio paisaje de entrenamiento: no hay evidencia de que las variantes generadas funcionen fuera de los datos medidos, y la evaluación se apoya en datos del paisaje de entrenamiento.
- Los pesos de `aav2/` están infraajustados de forma intencionada: deben usarse para reproducir el fallo, no para generar variantes.
- El oráculo de AAV2 se describe como vacuo, con un 100% del espacio de la rebanada de evaluación sin medir, lo que invalida cualquier conclusión de rendimiento sobre esa carpeta.
- La versión v1 de GB1 memorizaba el conjunto de entrenamiento (46% de filas copiadas): no debe usarse como modelo generativo, solo como referencia comparativa.
- No es un checkpoint de transformers: cargarlo requiere el código del repositorio `barlowa124/protein-diffusion`; no funciona con `AutoModel`, vLLM, TGI ni Ollama.
- Sesgos conocidos: no disponibles de forma explícita; cabe esperar que el modelo reproduzca la distribución del paisaje medido, pero no se documenta un análisis de sesgo.
- Riesgo de alucinación: no aplica en el sentido de un modelo de lenguaje, pero sí existe riesgo de generar variantes con fitness predicho alto que no se corresponda con el fitness real, dado que no hay validación experimental.
- Licencia MIT: permite uso comercial según los términos de la licencia, aunque la model card restringe el uso declarado a investigación y educación, lo que genera una tensión entre ambos planos que conviene resolver antes de cualquier uso en producción.
- No se documentan limitaciones de idioma ni de contexto porque el modelo no procesa texto.
- Soporte de la comunidad nulo: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado en HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/barlowa/protein-ddpm-landscapes
- Repositorio de código (entrenamiento y muestreo): https://github.com/barlowa124/protein-diffusion
- Métricas de evaluación (tasa de memorización, dosis-respuesta, comparación con línea base trivial): carpeta `results/` del repositorio de GitHub
- Model card ampliada: README del repositorio de GitHub
- Paper o publicación asociada: no disponible
- Demo: no disponible
- Otros enlaces relevantes: no disponible
