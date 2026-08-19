# jungwook2358/exp0005-valv2ft100k2gpu

## Resumen

El repositorio `jungwook2358/exp0005-valv2ft100k2gpu` es un bundle de evaluación para un experimento de investigación en robótica, concretamente un modelo de tipo VLA (Vision-Language-Action) orientado al embodiment `openarm_prq`. El autor, `jungwook2358`, publica este paquete como parte de un pipeline de entrenamiento y evaluación que incluye un tokenizador de acciones latentes (actlat) fine-tuneado durante 100 000 pasos en 2 GPUs, junto con dos variantes de modelos VLA entrenados durante 30 000 pasos cada una (una con co-entrenamiento y otra solo con datos de robot). El repositorio contiene pesos en formato `safetensors` (23,8 GB), así como archivos de configuración y estadísticas necesarias para la evaluación.

A fecha de la consulta, el modelo no presenta descargas ni valoraciones, y la información pública es escasa: no se especifican licencia, idiomas, arquitectura detallada ni parámetros totales. El README, redactado en coreano, describe el contenido del bundle y los scripts de entrenamiento, pero no ofrece especificaciones técnicas estándar. Por tanto, esta ficha se basa únicamente en los metadatos disponibles y en las pistas que aporta la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere VLA, Vision-Language-Action, con tokenizador de acciones latentes) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card indica que el bundle contiene un tokenizador de acciones latentes (`tokenizer_ft100k`) entrenado durante 100 000 pasos con 2 GPUs, y dos modelos VLA (`vla_cotrain_30k` y `vla_robotonly_30k`) entrenados durante 30 000 pasos cada uno. El pipeline utiliza un sistema de "actlat" (action latent) que transforma acciones del robot en representaciones latentes mediante un tokenizador, y luego un modelo VLA que predice esas representaciones. Los scripts de entrenamiento (`sbatch_scripts/multiemb/v4_soupv1/...`) sugieren el uso de un enfoque de multi-embedding y una etapa de fine-tuning sobre un modelo base preentrenado. No se especifican detalles como el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La evaluación requiere parámetros específicos como `--actlat-mode`, `--actlat-embodiment-id openarm_prq`, y rutas a los assets de estadísticas.

## Capacidades

- Control robótico: el modelo está diseñado para el embodiment `openarm_prq`, un brazo robótico, y genera acciones a partir de observaciones visuales y lenguaje.
- Tokenización de acciones latentes: incluye un tokenizador específico que convierte acciones continuas en tokens discretos para el modelo VLA.
- Dos variantes de entrenamiento: una con co-entrenamiento (probablemente con datos mixtos de lenguaje y visión) y otra solo con datos de robot, lo que permite comparar el efecto del co-entrenamiento.
- No se dispone de información sobre capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes, o multilingüismo.

## Casos de uso

- Investigación en robótica: este bundle es un recurso para reproducir experimentos de control VLA en el brazo `openarm_prq`, permitiendo evaluar el efecto del fine-tuning del tokenizador de acciones.
- Desarrollo de pipelines de aprendizaje por refuerzo (RL): el modelo puede integrarse en entornos de simulación o reales para probar políticas de control basadas en visión y lenguaje.
- Comparación de estrategias de entrenamiento: las dos variantes (`cotrain` y `robotonly`) permiten estudiar el impacto de co-entrenar con datos de lenguaje en el rendimiento del control robótico.
- Benchmarking de tokenizadores de acciones: el tokenizador fine-tuneado puede compararse con versiones base para medir la mejora en la reconstrucción de acciones.
- Reproducibilidad académica: al incluir scripts, configuraciones y assets, sirve como referencia para otros grupos que trabajen con arquitecturas VLA y tokenización latente.
- Exploración de arquitecturas multi-embedding: los scripts de entrenamiento revelan un enfoque de "multiemb" que podría ser de interés para investigadores que buscan combinar múltiples espacios de representación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de rendimiento, comparaciones con otros modelos, ni datos de latencia o throughput.

## Requisitos de hardware

- El entrenamiento se realizó con 2 GPUs (según el nombre del bundle `2gpu`), pero no se especifica el modelo de GPU (posiblemente A100 o similar por el tamaño del repositorio y la naturaleza del entrenamiento).
- Para la evaluación, se necesitan al menos 24 GB de VRAM para cargar los pesos en fp32 (23,8 GB), aunque con cuantización podría reducirse. No se dispone de información sobre cuantizaciones disponibles.
- No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama; al ser un modelo de robótica, probablemente se ejecute con frameworks específicos de VLA (por ejemplo, RLDX-1, mencionado en los scripts).
- La latencia y el throughput no están documentados.

## Comparativa con modelos similares

No disponible. No se ha encontrado información sobre modelos comparables en el mismo dominio (VLA para robótica) que permita una comparación directa.

## Limitaciones y advertencias

- Información pública muy limitada: no hay licencia declarada, lo que impide su uso comercial sin autorización explícita del autor.
- El repositorio parece ser un artefacto de investigación, no un modelo listo para producción; carece de documentación estándar y de soporte.
- No se especifican sesgos, riesgos de alucinación o limitaciones de contexto; al ser un modelo de control robótico, los riesgos están asociados a la seguridad física si se usa en entornos reales sin supervisión.
- Las fechas de creación (2026) y la ausencia de descargas sugieren que el proyecto puede estar en fase experimental o ser de acceso restringido.
- La model card está en coreano, lo que puede dificultar su interpretación para hablantes de otros idiomas.
- No hay garantía de que los pesos sean reproducibles o que los scripts funcionen fuera del clúster original (se mencionan rutas específicas del clúster `sjw_alinlab`).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jungwook2358/exp0005-valv2ft100k2gpu
- Resultados de búsqueda web (no específicos del modelo, incluidos como referencia):
  - https://chatgpt.com/
  - https://github.com/csananms/discovery-lab/blob/main/experiments/EXP-0005/README.md
  - https://developers-openai.com/
  - https://tokencalculator.ai/
  - https://github.com/google-ai-edge/model-explorer
