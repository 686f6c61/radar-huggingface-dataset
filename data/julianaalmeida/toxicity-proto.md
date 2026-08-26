# julianaalmeida/toxicity-proto

## Resumen

El modelo `julianaalmeida/toxicity-proto` es un prototipo de clasificación de toxicidad desarrollado por Juliana Almeida, una estudiante de MS en Data Science. Se trata de una implementación a escala reducida (tiny) de una arquitectura híbrida CNN-transformer, diseñada específicamente para tareas de clasificación. El modelo se publica con licencia MIT y no cuenta con descargas ni métricas de uso en HuggingFace.

La relevancia de este modelo reside en su carácter experimental: combina capas convolucionales con mecanismos de atención dispersa (sparse attention) y una estrategia de fusión mediante MLP con concatenación, empleando normalización GroupNorm y activación GELU-Tanh. El entrenamiento utiliza el optimizador Lion con un programador de tasa de aprendizaje de calentamiento lineal, lo que representa una configuración poco convencional en modelos de clasificación de texto. No se dispone de información sobre el tamaño total de parámetros, la longitud de contexto ni los idiomas soportados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN-Transformer (híbrido) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (solo se incluye `run.py`) |

## Arquitectura y entrenamiento

El modelo es un prototipo a escala `tiny` que combina capas convolucionales con un transformer de atención dispersa (sparse attention). La fusión de características entre las ramas convolucional y atencional se realiza mediante un MLP de concatenación (`concat-mlp`). La normalización empleada es GroupNorm y la activación es una mezcla GELU-Tanh. La inicialización de pesos sigue el método Kaiming. El optimizador es Lion (un algoritmo basado en el signo del gradiente) y el scheduler de aprendizaje es de calentamiento lineal (linear warmup). No se han publicado detalles sobre el volumen de datos de entrenamiento, el número de tokens ni la composición del dataset. Tampoco se especifica si se aplicaron técnicas de RLHF o DPO. El único artefacto incluido en el repositorio es un script `run.py`, lo que sugiere que el modelo se distribuye como código de entrenamiento o inferencia, no como pesos preentrenados.

## Capacidades

- Clasificación de toxicidad: el modelo está orientado a tareas de clasificación, presumiblemente detección de contenido tóxico en texto, aunque no se especifica el dominio exacto.
- Arquitectura híbrida CNN-transformer: combina extracción de características locales con atención global, lo que podría ser útil para detectar patrones locales y contextuales.
- Atención dispersa (sparse): reduce la complejidad computacional frente a atención densa, aunque el impacto real en la eficiencia no se ha documentado.
- Sin capacidades multimodales: no hay indicios de soporte para visión, audio o generación de texto.
- Sin soporte de tool calling ni funciones de agente: el modelo es un clasificador simple, no un modelo generativo.

## Casos de uso

- Moderación de contenido en foros o redes sociales: el modelo podría integrarse en un pipeline de clasificación para marcar comentarios tóxicos, aunque al ser un prototipo `tiny` sin métricas publicadas no se recomienda para producción.
- Investigación académica en toxicidad textual: como experimento de arquitectura híbrida, puede servir para comparar el rendimiento de CNN-transformer frente a modelos clásicos de clasificación.
- Detección de discurso de odio en datasets de investigación: si se entrena con datos adecuados, podría utilizarse en estudios de análisis de sentimiento o toxicidad.
- Filtrado de comentarios en foros técnicos o comunidades de desarrolladores: con un dataset específico, el modelo podría adaptarse para detectar lenguaje agresivo.
- Prototipo de evaluación de arquitecturas: el código `run.py` puede servir como base para experimentar con distintas configuraciones de normalización, activación y optimizador.
- Uso educativo: para aprender a implementar una arquitectura híbrida CNN-transformer con técnicas como GroupNorm y Lion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de precisión, F1, AUC ni comparación con otros modelos de toxicidad.

## Requisitos de hardware

- Al ser un modelo `tiny` y sin especificación de parámetros, se presume que puede ejecutarse en CPU o en GPUs de gama baja (por ejemplo, una GTX 1060 o RTX 3050), pero no hay datos concretos.
- No se proporciona información de VRAM estimada, latencia ni throughput.
- El repositorio solo incluye `run.py`, por lo que el despliegue depende de la implementación del código. No se mencionan soportes para vLLM, llama.cpp, Ollama o TGI.
- Dado que no se publican pesos ni formato de modelo (safetensors, GGUF), la inferencia no es directamente realizable sin ejecutar el script.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas como Detoxify, Perspective API o modelos BERT de clasificación de toxicidad, ya que no se conocen sus parámetros ni resultados. La comparativa no está disponible.

## Limitaciones y advertencias

- No se ha publicado ningún benchmark ni evaluación de rendimiento, por lo que su eficacia es desconocida.
- La ausencia de pesos o archivos de modelo (solo `run.py`) impide su uso directo en producción.
- No se indica el idioma de los datos de entrenamiento, ni el tamaño del dataset, ni la composición del mismo.
- Al ser un prototipo `tiny`, la capacidad de generalización es limitada y puede presentar sesgos si el dataset de entrenamiento no es representativo.
- Riesgo de alucinación no aplica al ser un clasificador, pero el riesgo de errores de clasificación (falsos positivos y negativos) es alto sin una validación adecuada.
- La licencia MIT permite uso comercial, pero la falta de documentación y pruebas hace arriesgado su uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/julianaalmeida/toxicity-proto
- Perfil de la autora: https://huggingface.co/julianaalmeida
- Artículos de referencia sobre predicción de toxicidad con IA (no específicos del modelo):  
  - https://www.mdpi.com/2305-6304/13/7/525  
  - https://link.springer.com/article/10.1007/s11356-025-37354-8  
  - https://www.sciencedirect.com/science/article/pii/S0024320525004564
