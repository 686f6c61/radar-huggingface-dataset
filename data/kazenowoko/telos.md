# Kazenowoko/telos

## Resumen

télos es un repositorio de investigación experimental publicado por Kazenowoko (Ivan Samuel) que explora la unificación de tres paradigmas de generación de texto —autoregresivo (AR), difusión discreta enmascarada (MDLM) y difusión uniforme reversible (UNDLM)— a escala pequeña, con checkpoints de 12,5M y 25M de parámetros. El proyecto está orientado al estudio de scaling en arquitecturas de difusión discreta para autocompletado de código, un área emergente que busca alternativas a la decodificación autoregresiva clásica.

El repositorio incluye tokenizadores, configuraciones unificadas de hiperparámetros y pesos en formato safetensors, con soporte para PyTorch y MLX. Su relevancia es principalmente investigadora: permite comparar el comportamiento de los tres paradigmas bajo las mismas condiciones de entrenamiento y evaluar si la difusión discreta puede igualar o superar al autoregresivo en tareas de generación de código.

Se trata de un proyecto en fase inicial, sin benchmarks publicados, sin documentación de arquitectura detallada y sin comunidad activa (0 descargas, 0 likes). Es útil como punto de partida para experimentos de investigación, no como modelo de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Autoregresiva (causal), masked discrete diffusion (MDLM) y uniform noise diffusion (UNDLM) |
| Parámetros totales | 12,5M y 25M (según checkpoint) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PyTorch) y MLX |

## Arquitectura y entrenamiento

El repositorio implementa tres variantes arquitectónicas bajo una configuración de hiperparámetros unificada para permitir comparaciones limpias: una línea base autoregresiva de predicción causal de siguiente token, una variante de difusión discreta enmascarada con estado absorbente `[MASK]` y reweighting ELBO con factor `1/t`, y una variante de difusión uniforme que corrompe el vocabulario de forma reversible. El entrenamiento se ha realizado a dos escalas, 12,5M y 25M de parámetros, centrado en la tarea de autocompletado de código.

No se proporciona información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. La innovación principal del proyecto es la comparación sistemática de los tres paradigmas bajo las mismas condiciones, con soporte explícito para ejecución en Apple Silicon mediante MLX.

## Capacidades

- Generación de texto autoregresiva (variante AR).
- Generación de texto mediante difusión discreta enmascarada (variante MDLM), con corrupción del vocabulario mediante token `[MASK]`.
- Generación de texto mediante difusión uniforme (variante UNDLM), con corrupción reversible del vocabulario.
- Autocompletado de código como tarea principal de evaluación.
- Ejecución en PyTorch y en MLX (Apple Silicon).
- Capacidades de razonamiento, tool calling, agente y visión: no disponibles.

## Casos de uso

- Investigación académica en difusión discreta: el modelo permite reproducir y comparar los tres paradigmas (AR, MDLM, UNDLM) bajo configuraciones unificadas, lo que facilita estudios de scaling y de eficiencia de entrenamiento.
- Experimentación en autocompletado de código a escala pequeña: los checkpoints de 12,5M y 25M son adecuados para probar pipelines de generación de código en entornos con recursos limitados o para estudiar el comportamiento de la difusión discreta en esta tarea.
- Desarrollo de nuevos métodos de decodificación: al incluir tres paradigmas en un mismo repositorio, sirve como banco de pruebas para técnicas de muestreo, guiado o control de calidad en generación discreta.
- Educación y formación en arquitecturas de difusión: la estructura modular y la documentación mínima permiten a estudiantes e investigadores explorar las diferencias entre autoregresión y difusión en NLP.
- Evaluación de eficiencia en Apple Silicon: gracias al soporte MLX, se puede medir el rendimiento de los tres paradigmas en hardware de Apple sin necesidad de GPU NVIDIA.
- Integración en pipelines de investigación de scaling laws: los checkpoints de distintos tamaños permiten estudiar curvas de scaling y extrapolar a modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible (tamaño de 12,5M y 25M parámetros, con pesos en fp32 o fp16, la VRAM necesaria será inferior a 1 GB, aunque no se confirma).
- GPU recomendadas: cualquier GPU con soporte CUDA para PyTorch; para MLX se requiere Apple Silicon (M1 o posterior).
- Compatibilidad con GPU de consumo: sí, cualquier GPU moderna con al menos 2 GB de VRAM puede ejecutar la inferencia de estos modelos.
- Opciones de despliegue: PyTorch (transformers u otros frameworks), MLX para Apple Silicon.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables de difusión discreta con las mismas características y escala en la información proporcionada.

## Limitaciones y advertencias

- El modelo es un prototipo de investigación sin validación en tareas de producción.
- No se ha publicado información sobre sesgos, alucinaciones o limitaciones de contexto.
- La documentación es mínima y no hay instrucciones claras de uso más allá de descargar los pesos.
- No se proporcionan métricas de rendimiento ni comparativas con otros modelos.
- La licencia Apache-2.0 permite uso comercial, pero la utilidad real del modelo en escenarios comerciales es limitada por su tamaño y su carácter experimental.
- El repositorio tiene 0 descargas y 0 likes, lo que indica una adopción nula y una falta de validación comunitaria.
- El idioma soportado es solo inglés; el modelo no está entrenado para otros idiomas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Kazenowoko/telos
- Repositorio GitHub: https://github.com/kazenoko-git/telos
- Página de modelos del autor en HuggingFace: https://huggingface.co/Kazenowoko/models
- Dataset asociado: https://huggingface.co/datasets/Kazenowoko/telos-dataset
- Repositorio relacionado: https://huggingface.co/Kazenowoko/telos-50m-ratio-study</think>## Resumen

télos es un repositorio de investigación experimental publicado por Kazenowoko (Ivan Samuel) que explora la unificación de tres paradigmas de generación de texto a escala reducida: autoregresión causal, difusión discreta enmascarada (MDLM) y difusión uniforme de ruido (UNDLM). El proyecto se centra en la tarea de autocompletado de código y proporciona checkpoints de 12,5M y 25M de parámetros, junto con tokenizadores y configuraciones de hiperparámetros unificadas para permitir comparaciones limpias entre los tres enfoques.

La relevancia actual del proyecto radica en la creciente investigación sobre alternativas a la decodificación autoregresiva clásica, donde la difusión discreta se postula como una vía potencialmente más eficiente para generación de código y texto. El repositorio incluye soporte para PyTorch y MLX, lo que permite ejecutar experimentos tanto en GPU convencionales como en Apple Silicon. El modelo está disponible bajo licencia Apache-2.0, con pesos en formato safetensors, y su autor mantiene además un dataset asociado y una extensión de estudio de ratios a 50M.

Se trata de un proyecto incipiente con 0 descargas y 0 likes, sin benchmarks publicados ni documentación de arquitectura detallada. Su valor es fundamentalmente investigador y educativo, no apto para uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Autoregressive (causal next-token), masked discrete diffusion (MDLM) y uniform noise diffusion (UNDLM) |
| Parámetros totales | 12,5M y 25M (según checkpoint) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PyTorch y MLX) |

## Arquitectura y entrenamiento

El repositorio implementa tres variantes arquitectónicas bajo una configuración de hiperparámetros unificada:

1. **Autoregressive (AR)**: predicción causal del siguiente token, el enfoque clásico de los modelos de lenguaje.
2. **Masked Discrete Diffusion (MDLM)**: difusión discreta con token absorbente `[MASK]` y reweighting de la ELBO con factor `1/t`, donde `t` es el paso de difusión.
3. **Uniform Noise Diffusion (UNDLM)**: corrupción reversible del vocabulario mediante ruido uniforme en el espacio discreto.

Los checkpoints se organizan por paradigma (`ar`, `masked`, `uniform`) y por escala (`12m`, `25m`). No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO. La innovación técnica principal es la comparación frontal de los tres paradigmas bajo las mismas condiciones, con soporte explícito para ejecución en MLX (Apple Silicon).

## Capacidades

- Generación de texto autoregresiva (variante AR).
- Generación de código mediante difusión discreta enmascarada (variante MDLM).
- Generación de código mediante difusión uniforme (variante UNDLM).
- Autocompletado de código como tarea principal de evaluación.
- Ejecución en PyTorch y MLX (Apple Silicon).
- Soporte de tool calling, agentes, visión o audio: no disponible.

## Casos de uso

- **Investigación en difusión discreta**: el modelo permite reproducir experimentos comparativos entre AR, MDLM y UNDLM, lo que facilita estudiar la eficiencia de entrenamiento y las propiedades de muestreo de cada paradigma.
- **Experimentación con autocompletado de código**: los checkpoints de 12,5M y 25M son adecuados para prototipar pipelines de generación de código en entornos con recursos limitados, como Google Colab.
- **Desarrollo de métodos de muestreo**: al tener tres paradigmas en un único repositorio, se puede evaluar cómo diferentes estrategias de decodificación afectan a la calidad de la generación.
- **Estudio de scaling laws**: los checkpoints a dos escalas (12,5M y 25M) permiten estimar curvas de scaling preliminares para difusión discreta en código.
- **Evaluación en hardware Apple**: gracias al soporte MLX, se puede probar el rendimiento de los tres paradigmas en Mac con chips M1 o superiores sin necesidad de GPU NVIDIA.
- **Educación en arquitecturas de generación**: el repositorio sirve como material didáctico para entender la diferencia entre autoregresión y difusión discreta en NLP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; con 12,5M y 25M de parámetros, la inferencia en fp32 requiere menos de 1 GB de VRAM, aunque no se confirma oficialmente.
- GPU recomendadas: cualquier GPU compatible con CUDA para PyTorch; Apple Silicon (M1 o superior) para MLX.
- Compatibilidad con GPU de consumo: sí, cualquier GPU moderna con al menos 2 GB de VRAM puede ejecutar la inferencia.
- Opciones de despliegue: PyTorch (transformers, o carga directa de safetensors), MLX para Apple Silicon.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han encontrado en la información proporcionada modelos comparables de difusión discreta con la misma escala y propósito. Los modelos de difusión de código existentes (p. ej., los basados en difusión latente) son de tamaño muy superior y no son comparables directamente.

## Limitaciones y advertencias

- El modelo es un prototipo de investigación sin validación en producción; no hay evidencia de que la generación de código sea funcional o de calidad.
- No se documentan sesgos conocidos ni riesgos de alucinación, pero el tamaño reducido y el entrenamiento limitado hacen probable que la salida contenga errores sintácticos y semánticos.
- La longitud de contexto no se especifica; en modelos de 12,5M y 25M es probable que sea muy corta (típicamente 512-1024 tokens), aunque no se confirma.
- El idioma soportado es solo inglés; no se ha entrenado para otros idiomas.
- La licencia Apache-2.0 permite uso comercial, pero la utilidad práctica en producción es limitada por el tamaño y el estado experimental.
- El repositorio tiene 0 descargas y 0 likes, lo que indica una adopción nula y una posible ausencia de validación por parte de la comunidad.
- No hay instrucciones de uso más allá de la descarga de pesos; falta documentación de los formatos de entrada/salida.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Kazenowoko/telos
- Repositorio GitHub: https://github.com/kazenoko-git/telos
- Perfil del autor en HuggingFace: https://huggingface.co/Kazenowoko
- Dataset asociado: https://huggingface.co/datasets/Kazenowoko/telos-dataset
- Estudio de ratios a 50M: https://huggingface.co/Kazenowoko/telos-50m-ratio-study
