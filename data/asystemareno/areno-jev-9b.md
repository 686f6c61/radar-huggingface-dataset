# AsystemAReno/AReno-Jev-9B

## Resumen

AReno-Jev-9B es un adaptador LoRA de rango 16 acompañado de una cabeza de decisión JEV (en precisión FP32) para el modelo base Qwen/Qwen3.5-9B, desarrollado por AsystemAReno y entrenado con el framework AReno. No es un modelo generativo autónomo: es un componente que se acopla a la red troncal Qwen3.5-9B para convertirla en un modelo de decisión que puntúa candidatos tipados (`choice`, `noul`, `score`) en lugar de producir texto libre.

El artefacto publicado (0,2 GB) contiene únicamente el adaptador y la cabeza de decisión; los pesos originales de Qwen3.5-9B no se incluyen y deben descargarse por separado. El adaptador se aplica en memoria durante el servicio, sin necesidad de exportar un checkpoint fusionado, y se sirve mediante SGLang (con un adaptador de modelo externo incluido) o mediante el propio runtime AReno en backend MLX (Mac) o CUDA.

Su relevancia radica en el enfoque: en lugar de generar respuestas abiertas, el modelo evalúa y normaliza puntuaciones sobre un conjunto cerrado de candidatos definidos por el usuario, lo que resulta útil para sistemas de decisión estructurada, enrutamiento o selección de acciones en pipelines agénticos. La licencia Apache 2.0 y el soporte de SGLang sin modificaciones del código fuente facilitan su integración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 16, alpha 32) + cabeza de decisión JEV FP32 sobre transformer Qwen3.5-9B |
| Parametros totales | No disponible (el adaptador y la cabeza no publican recuento; el backbone Qwen3.5-9B no se incluye) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | Entrenamiento con CUDA NF4 QLoRA; inferencia con backbone en coma flotante; opción Q4 en MLX para fine-tuning |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA y cabeza JEV); requiere backbone Qwen3.5-9B aparte |

## Arquitectura y entrenamiento

El modelo combina un backbone transformer Qwen3.5-9B con un adaptador LoRA de rango 16 y alpha 32, más una cabeza de decisión JEV en FP32. La cabeza lee el último estado oculto válido del backbone tras procesar el estado y los sufijos de candidatos, y normaliza las puntuaciones entre los candidatos de cada pregunta. La temperatura de decisión es 1.0. El adaptador se aplica en memoria en tiempo de servicio, sin fusionar pesos.

El entrenamiento se realizó con CUDA NF4 QLoRA mediante el framework AReno, con un dataset de decisiones tipadas en formato parquet. Se emplean tasas de aprendizaje diferenciadas para el adaptador (2e-4) y para la cabeza (1e-4), batch size 16 con mini-batch 2, una época y contexto máximo de 4096 tokens. El autor advierte que la inferencia con backbone en coma flotante y la inferencia nativa en NF4 no son numéricamente idénticas. También se documenta un flujo de fine-tuning en Mac con cuantización Q4 en línea.

## Capacidades

- Puntuación de decisiones tipadas: responde a preguntas de tipo `choice` (elegir entre candidatos), `noul` y `score`, devolviendo puntuaciones normalizadas por pregunta.
- Selección entre candidatos cerrados: evalúa opciones definidas por el usuario en lugar de generar texto libre.
- Procesamiento de estados textuales: acepta un estado en texto y un conjunto de preguntas con instrucciones y criterios.
- Integración vía API: expone `POST /v1/systemone` tanto en el wrapper SGLang como en el runtime AReno.
- Servicio sin fusión de pesos: aplica LoRA en memoria manteniendo los ficheros de checkpoint intactos.
- Compatibilidad multiplataforma: backend MLX en Mac y backend CUDA.
- Sin soporte multimodal: el wrapper SGLang no procesa adjuntos de imagen ni audio.
- Sin tool calling ni razonamiento multi-paso documentados: el modelo puntúa candidatos, no ejecuta agentes.

## Casos de uso

- Enrutamiento de decisiones en pipelines: dado un estado textual y un conjunto de acciones candidatas, el modelo puntúa cada opción y permite seleccionar la más probable, integrándose vía `/v1/systemone`.
- Selección de respuestas en sistemas de atención al cliente: con un estado de conversación y respuestas candidatas predefinidas, el modelo elige la más adecuada sin generar texto libre, reduciendo el riesgo de alucinación.
- Clasificación con criterios explícitos: el tipo `choice` permite evaluar alternativas con instrucciones y criterios definidos por el desarrollador, útil para tareas de etiquetado estructurado.
- Puntuación de candidatos en sistemas de recomendación: el tipo `score` permite ordenar opciones según su adecuación al estado descrito.
- Evaluación de hipótesis en investigación: comparar respuestas o acciones alternativas bajo un mismo estado y obtener puntuaciones normalizadas para análisis.
- Componente de decisión en arquitecturas agénticas: actuar como cabeza de selección de acción dentro de un sistema mayor que gestione la generación de texto con otro modelo.
- Despliegue en Mac para prototipado: el backend MLX permite servir el modelo localmente en equipos Apple sin GPU dedicada.
- Fine-tuning específico de dominio: el flujo documentado con AReno permite reentrenar el adaptador y la cabeza sobre datasets propios de decisiones tipadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El adaptador ocupa 0,2 GB; el backbone Qwen3.5-9B en coma flotante requiere memoria adicional sustancial (el autor exige explícitamente el backbone en coma flotante para el servicio).
- GPU recomendadas: no especificadas. El entrenamiento se realizó con CUDA NF4 QLoRA, lo que sugiere GPUs con soporte de cuantización NF4 (familia Ampere o superior).
- Compatibilidad con GPU de consumo: no confirmada. El servicio SGLang usa `--is-embedding` sobre el backbone completo en coma flotante, lo que probablemente exceda la VRAM de GPUs de consumo para un modelo de 9B en FP16.
- Mac: soporte nativo vía backend MLX con Q4 en línea para fine-tuning.
- Opciones de despliegue: SGLang (con el adaptador `sglang_jev.py` incluido y `SGLANG_EXTERNAL_MODEL_PACKAGE=jev`), o el runtime AReno (`areno serve` con `--backend mlx` o `--backend cuda`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AReno-Jev-9B | Adaptador LoRA + cabeza sobre Qwen3.5-9B | 4096 | Modelo de decisión (puntuación de candidatos) | Apache 2.0 | Hugging Face (adaptador; backbone aparte) |
| Qwen3.5-9B (base) | 9B (no confirmado en la informacion) | No disponible | Modelo generativo | No disponible | Hugging Face |
| Alternativas de modelos de decisión comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos comparables de la misma categoría (cabezas de decisión acopladas a un backbone) en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce respuestas en texto libre; solo puntúa candidatos proporcionados por el usuario.
- Requiere el backbone Qwen3.5-9B por separado: los pesos base no se incluyen y deben descargarse aparte.
- Contexto limitado a 4096 tokens, incluyendo el estado y los sufijos de candidatos.
- Sin soporte multimodal: el wrapper SGLang no procesa imágenes ni audio.
- Discrepancia numérica: la inferencia con backbone en coma flotante y la nativa en NF4 no son idénticas según el autor.
- Idiomas soportados no documentados; el comportamiento multilingüe no está garantizado.
- Sesgos y riesgo de alucinación: no documentados en la información disponible; al puntuar candidatos cerrados el riesgo de generación libre es menor, pero persisten sesgos heredados del backbone.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del backbone Qwen3.5-9B, no indicada en esta información.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni evidencia de uso en producción.
- La fecha de creación indicada (2026-11-11) es posterior a la fecha habitual de consulta; verificar la vigencia del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/AsystemAReno/AReno-Jev-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Adaptador SGLang incluido: `./sglang_jev.py` en el repositorio
- Framework AReno: no se proporciona enlace en la información disponible
- Paper, blog o demo: no disponibles
