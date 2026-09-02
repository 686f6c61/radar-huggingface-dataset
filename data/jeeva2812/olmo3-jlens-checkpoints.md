# jeeva2812/olmo3-jlens-checkpoints

## Resumen

El repositorio `jeeva2812/olmo3-jlens-checkpoints` no contiene un modelo de lenguaje, sino un conjunto de **Jacobian lenses (J-Lens)** calculados para el modelo **Olmo 3 7B** de AllenAI (allenai/Olmo-3-1025-7B) a lo largo de **24 checkpoints** que cubren las tres etapas de entrenamiento: pretraining, midtraining y extensión de contexto largo. Los J-Lens, introducidos por Anthropic en su trabajo sobre "global workspace", permiten analizar cómo se transforma la representación residual a través de las capas del modelo, ofreciendo una ventana a la dinámica interna de cómputo.

Este recurso es relevante porque, según su autor, es el primer J-Lens publicado para Olmo 3 y el primero en absoluto que cubre checkpoints de entrenamiento en lugar de solo los pesos finales. Los lentes publicados anteriormente (`camilablank/workspace-lenses`) abarcan 8 modelos únicamente en su estado final. El repositorio incluye Jacobianos completos (4096×4096) en 16 capas para el modelo final, así como proyecciones sobre 32 direcciones de sonda fijas para cada checkpoint. El tamaño total del repositorio es de 0.6 GB y se distribuye bajo licencia Apache-2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (recurso de interpretabilidad sobre Olmo 3 7B, arquitectura transformer) |
| Parametros totales | No disponible (el repo contiene tensores de Jacobianos, no pesos de modelo) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo subyacente Olmo 3 7B) |
| Tipos de cuantizacion | No aplica (tensores en formato .pt, precisión float32) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | .pt (PyTorch) |

## Arquitectura y entrenamiento

El repositorio contiene J-Lens calculados siguiendo la implementación de referencia de Anthropic (`anthropics/jacobian-lens`). La técnica consiste en computar la matriz Jacobiana de la transformación residual entre capas, evaluada en direcciones de sonda específicas. En este caso se usan 32 direcciones aleatorias fijas (generadas con `torch.randn`, `manual_seed(0)`, normalizadas por fila) que son las mismas en todos los checkpoints, de modo que las sondas no introducen deriva en las comparaciones.

Las convenciones de cálculo son explícitas y verificadas: la "capa ℓ" se refiere al residual que sale del bloque ℓ; la capa objetivo es `n_layers − 2` (30 de 32 en Olmo 3 7B); las posiciones fuente válidas son `[skip_first, len − 1)` con `skip_first = 4`; y la reducción se hace como media por prompt y luego media sobre prompts, no una media agrupada sobre todas las posiciones. El ajuste se realizó sobre 25 documentos de `NeelNanda/pile-10k` con `t_max = 128`.

El autor reporta una verificación exhaustiva: el código reproduce el J-Lens publicado de Qwen3.5-4B con coseno 0.9984 y ratio de magnitud 0.9985; el VJP (vector-Jacobian product) coincide con un Jacobiano por fuerza bruta con error 5.4e-07; no hay fuga de gradiente hacia atrás en el tiempo; y `J = I` en la capa objetivo se cumple exactamente (1.00000) tanto en Qwen como en Olmo.

## Capacidades

- Proporciona Jacobianos completos (4096×4096) en 16 capas para el modelo final de Olmo 3 7B (archivo `Jall_main.pt`).
- Proporciona proyecciones `J₂₀ᵀ v` para 32 direcciones de sonda fijas en cada uno de los 24 checkpoints (archivos `lenses/random_L20_<revision>.pt`).
- Incluye grids de lectura capa × posición para 5 prompts, junto con la norma de J por capa y la media diagonal (archivo `layers_main.pt`).
- Permite estudiar la evolución de la representación interna a lo largo del entrenamiento, comparando checkpoints de distintas etapas.
- Ofrece una métrica de ruido de estimación (0.9870 entre muestras del mismo checkpoint) para calibrar la significancia de los cambios observados.
- No es un modelo generativo; no genera texto, código ni respuestas. Es una herramienta de análisis para investigación en interpretabilidad.

## Casos de uso

- **Investigación en interpretabilidad mecanicista**: los J-Lens permiten descomponer el cómputo del modelo en transformaciones por capa, identificando qué capas contribuyen más a la formación de conceptos. Un investigador puede cargar `Jall_main.pt` y analizar la estructura de los Jacobianos para localizar "workspaces" globales.
- **Estudio de la dinámica de entrenamiento**: al comparar los J-Lens de los 24 checkpoints, se puede observar cómo se consolidan las representaciones a lo largo del pretraining, midtraining y la extensión de contexto. Esto es útil para entender en qué fase se adquieren ciertas capacidades.
- **Validación de métricas de similitud entre representaciones**: el autor advierte que el coseno raw entre filas de J es engañoso (un modelo aleatorio puntúa 0.509 contra el entrenado). Este repositorio sirve como banco de pruebas para desarrollar métricas más robustas, como restar la identidad antes de comparar.
- **Calibración de métodos de interpretabilidad**: los datos de ruido de estimación (0.9870 entre muestras del mismo checkpoint) permiten a otros investigadores establecer umbrales de significancia para sus propios experimentos con J-Lens.
- **Reproducción y extensión de resultados**: el código está disponible en GitHub y las convenciones están documentadas, lo que permite a otros equipos reproducir los cálculos o extenderlos a otros modelos o checkpoints.
- **Benchmarking de implementaciones de Jacobian lens**: la verificación reportada (coseno 0.9984 contra el lente de Qwen3.5-4B) sirve como referencia para validar implementaciones alternativas de la técnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de rendimiento del modelo en la información disponible, ya que no es un modelo de lenguaje sino un recurso de interpretabilidad. Sin embargo, la model card reporta verificaciones numéricas de la corrección del cálculo:

| Verificación | Resultado |
|---|---|
| Reproducción del J-Lens publicado de Qwen3.5-4B (coseno) | 0.9984 |
| Reproducción del J-Lens publicado de Qwen3.5-4B (ratio de magnitud) | 0.9985 |
| Error del VJP contra Jacobiano por fuerza bruta | 5.4e-07 |
| Fuga de gradiente hacia atrás en el tiempo | 0 (cero) |
| `J = I` en la capa objetivo (Qwen y Olmo) | 1.00000 |
| Ruido de estimación entre dos muestras del mismo checkpoint | 0.9870 |
| Ruido entre checkpoints separados 1814 pasos de entrenamiento convergido | 0.9735 |

## Requisitos de hardware

- El análisis de los J-Lens se puede realizar en CPU con PyTorch; los tensores individuales (32×4096 para las proyecciones, 4096×4096 para los Jacobianos completos) caben en RAM de un equipo de escritorio estándar (el repositorio completo ocupa 0.6 GB).
- Para cargar el Jacobiano completo de una capa (4096×4096 en float32) se necesitan aproximadamente 67 MB por capa; los 16 archivos de capas suman alrededor de 1 GB en RAM.
- Para reproducir los cálculos sobre el modelo Olmo 3 7B subyacente se requiere una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40 GB) y el framework OLMo-core.
- No se requiere infraestructura de inferencia (vLLM, llama.cpp, etc.) porque no hay generación de texto.
- La latencia y el throughput no son aplicables; el coste computacional está en el cálculo de los Jacobianos, que se realiza offline.

## Comparativa con modelos similares

El recurso comparable más cercano es el conjunto de J-Lens publicado por `camilablank/workspace-lenses`, que cubre 8 modelos en sus pesos finales. La comparación es la siguiente:

| Recurso | Cobertura | Checkpoints de entrenamiento | Modelos incluidos | Licencia |
|---|---|---|---|---|
| `jeeva2812/olmo3-jlens-checkpoints` | Olmo 3 7B | Sí (24 checkpoints) | 1 | Apache-2.0 |
| `camilablank/workspace-lenses` | 8 modelos (pesos finales) | No | 8 | No disponible en la información |

No se dispone de otros recursos de J-Lens que cubran la evolución durante el entrenamiento, por lo que esta es una contribución novedosa. No hay comparativa de rendimiento porque no son modelos generativos.

## Limitaciones y advertencias

- **Específico de Olmo 3 7B**: los J-Lens están calculados para una arquitectura y unos pesos concretos; no son transferibles a otros modelos sin recalcularlos.
- **Métrica de similitud engañosa**: el coseno raw entre filas de J está dominado por el paso directo del residual; un modelo aleatorio puntúa 0.509 contra el entrenado. Es necesario restar la identidad (`Jᵀv = v + (J − I)ᵀv`) antes de comparar.
- **Ruido de estimación alto**: el ruido entre dos muestras del mismo checkpoint es 0.9870, y entre checkpoints separados 1814 pasos de entrenamiento convergido es 0.9735. Cambios menores que ese umbral no son interpretables.
- **No es un modelo de lenguaje**: no se puede utilizar para generación de texto, chat, código ni ninguna tarea de NLP. Es exclusivamente un recurso de análisis.
- **Dependencia del modelo subyacente**: para interpretar los resultados es necesario conocer la arquitectura de Olmo 3 7B y su proceso de entrenamiento; el repositorio no incluye los pesos del modelo.
- **Licencia**: el repositorio está bajo Apache-2.0, pero el modelo subyacente Olmo 3 7B tiene su propia licencia (también Apache-2.0 según el paper), que debe respetarse si se trabaja con el modelo completo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jeeva2812/olmo3-jlens-checkpoints
- Código fuente (GitHub): https://github.com/jeeva2812/jlens-transformation
- Paper de Olmo 3 (arXiv): https://arxiv.org/abs/2512.13961
- Página oficial de Olmo (AllenAI): https://allenai.org/olmo
- Scripts oficiales de entrenamiento de Olmo 3 (GitHub): https://github.com/allenai/OLMo-core/tree/main/src/scripts/official/OLMo3
