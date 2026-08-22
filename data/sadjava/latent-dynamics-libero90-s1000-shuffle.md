# sadjava/latent-dynamics-libero90-s1000-shuffle

## Resumen

El modelo `sadjava/latent-dynamics-libero90-s1000-shuffle` es un checkpoint de dinámica latente visual, desarrollado por sadjava (Dzhavid Sadreddinov), diseñado como control negativo dentro de un pipeline de preentrenamiento para robótica basado en el benchmark LIBERO. Se trata de un modelo "action-free" que aprende dinámicas visuales a partir de características de visión congeladas de SmolVLA, pasando por un modelo de dinámica inversa (IDM) y uno de dinámica directa (FDM), sin utilizar etiquetas de acciones, estado ni recompensas. La variante "shuffle" rompe deliberadamente la coherencia temporal del futuro al muestrear el siguiente frame RGB de un episodio distinto, sirviendo como control experimental para evaluar el impacto de la dinámica temporal en el fine-tuning de video-latent.

Su relevancia radica en que permite aislar el efecto de la predicción de dinámicas reales frente a una versión degradada, facilitando la validación de metodologías de aprendizaje de representaciones visuales para control robótico. El modelo se publica con pesos y configuración, y se utiliza como teacher congelado en el fine-tuning few-shot de SmolVLA. No se especifican el número de parámetros, la arquitectura exacta ni la licencia, por lo que su uso se limita a entornos de investigación con acceso a la documentación original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | IDM (inverse dynamics model) + FDM (forward dynamics model) sobre features de visión congeladas de SmolVLA |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, no textual) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`), con configuración en `.json` |

## Arquitectura y entrenamiento

El modelo sigue un esquema de dos etapas: primero se extraen características visuales con un encoder de visión congelado de SmolVLA, y sobre ellas se entrenan un modelo de dinámica inversa (IDM) que predice la acción latente entre dos frames, y un modelo de dinámica directa (FDM) que predice el siguiente estado latente. El entrenamiento se realiza únicamente con secuencias RGB del dataset `nvidia/libero_90`, sin usar acciones, estados ni recompensas. En esta variante de control, el frame futuro se muestrea de un episodio distinto (`shuffle_future=True`), de modo que las relaciones temporales quedan rotas; la arquitectura, el número de pasos y el volumen de datos son idénticos a la versión real, lo que permite usarlo como control negativo en experimentos de fine-tuning de video-latent.

No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset más allá de LIBERO-90, ni técnicas adicionales como RLHF o DPO. El checkpoint se entrega como `idm_fdm.pt` (pesos + config) y `idm_fdm.json` (hiperparámetros).

## Capacidades

- Predicción de dinámica visual latente: dado un frame actual y una acción latente (IDM), predice el siguiente estado latente (FDM), aunque en esta variante la relación temporal está deliberadamente rota.
- Control negativo para experimentos: sirve para aislar el efecto de la dinámica temporal en el fine-tuning de video-latent de SmolVLA, comparando con el modelo real.
- Compatible con el pipeline de LIBERO: diseñado para ser usado en el benchmark LIBERO-90, enfocado en transferencia de conocimiento en robótica.
- Sin soporte de tool calling, agentes, razonamiento multi-step, texto ni visión general: es un modelo puramente visual y acotado a la tarea de dinámica latente.

## Casos de uso

- **Validación de modelos de dinámica en robótica**: se usa como control negativo para aislar la contribución de la predicción temporal en el preentrenamiento de representaciones para manipulación robótica, comparando su rendimiento frente al modelo real en tareas de LIBERO.
- **Investigación en aprendizaje por observación**: al ser action-free, permite estudiar cuánto se puede aprender de dinámicas visuales sin supervisión de acciones, y cómo la coherencia temporal afecta al aprendizaje.
- **Fine-tuning few-shot de SmolVLA**: se emplea como teacher congelado en el ajuste fino de SmolVLA con video-latent, sirviendo de baseline para evaluar si el modelo aprende o no estructuras temporales útiles.
- **Análisis de robustez**: al romper el futuro, puede usarse para testar la sensibilidad de arquitecturas de dinámica latente a la coherencia de los datos de entrada.
- **Desarrollo de pipelines de pre-entrenamiento en robótica**: integrable en flujos de entrenamiento de LIBERO-Goal, donde se combina con BC (behavioral cloning) para estudiar transferencia de conocimiento.
- **Reproducibilidad y benchmarking**: al ser un checkpoint público con config, permite reproducir experimentos de control en el contexto de LIBERO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no especificada. El tamaño del repo (0.3 GB) sugiere que los pesos son relativamente ligeros, pero sin conocer el número de parámetros no se puede estimar de forma fiable.
- **GPU recomendadas**: no disponibles. Dado que usa features de SmolVLA, es probable que requiera una GPU con soporte para PyTorch y suficiente memoria para el encoder, pero no se indica.
- **Compatibilidad con GPUs consumer**: no se puede confirmar sin datos de parámetros y arquitectura.
- **Opciones de despliegue**: el formato `.pt` es de PyTorch, por lo que se puede cargar directamente en un entorno Python con PyTorch. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (dinámicas latentes para robótica). Se trata de un checkpoint de control negativo específico, sin alternativas públicas equivalentes en los datos proporcionados.

## Limitaciones y advertencias

- **Control negativo**: deliberadamente rompe la coherencia temporal del futuro, por lo que no es adecuado para tareas que requieran predicción dinámica real.
- **Sin datos de rendimiento**: no hay benchmarks públicos que avalen su calidad, lo que limita su uso en entornos de producción.
- **Licencia no especificada**: no se indica la licencia, lo que puede restringir su uso comercial o la redistribución.
- **Alcance limitado**: es un modelo de visión puro, sin capacidades de lenguaje, tool calling ni agentes; no sirve para tareas fuera del dominio robótico visual.
- **Dependencia de SmolVLA**: requiere el encoder de visión congelado de SmolVLA para su uso, lo que puede introducir dependencias adicionales no documentadas.
- **Documentación escasa**: no se detallan arquitectura, parámetros, ni datos de entrenamiento más allá del dataset LIBERO-90, lo que dificulta su reproducción exacta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sadjava/latent-dynamics-libero90-s1000-shuffle
- Colección del autor en HuggingFace: https://huggingface.co/collections/sadjava/libero-seen-pretrain
- Perfil de GitHub del autor: https://github.com/sadjava
- Repositorio de LIBERO (benchmark): https://github.com/Lifelong-Robot-Learning/LIBERO
- Página oficial de LIBERO: https://libero-project.github.io/main.html
- Datasets de LIBERO: https://libero-project.github.io/datasets
