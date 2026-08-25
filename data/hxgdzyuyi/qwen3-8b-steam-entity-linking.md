# hxgdzyuyi/qwen3-8b-steam-entity-linking

## Resumen

El modelo `hxgdzyuyi/qwen3-8b-steam-entity-linking` es un adaptador LoRA desarrollado por hxgdzyuyi que se monta sobre el modelo base `Qwen/Qwen3-8B-Base`. Su función es mapear nombres de juegos de Steam y expresiones relacionadas a etiquetas de un solo token, como `<GAME_730>`, donde el número corresponde al AppID de Steam. Este enfoque permite normalizar referencias a juegos en un vocabulario compacto y estable, útil para tareas de enlazado de entidades en textos o bases de datos.

El adaptador se entrena con 1000 entidades, cada una con un único ejemplo canónico, y emplea LoRA con r=64 y alpha=128, además de filas de tokens añadidos entrenables tanto en los embeddings de entrada como en la cabeza de salida. La evaluación reporta un 97,90% de coincidencia exacta canónica en la época 20, pero solo un 8,15% en alias no vistos, lo que indica que el modelo memoriza los ejemplos de entrenamiento pero generaliza débilmente a variantes. Se trata de una prueba de concepto de memorización y generalización, no de un sistema de producción.

La relevancia actual radica en la creciente necesidad de normalizar entidades en dominios específicos, como el catálogo de Steam, donde los nombres de juegos pueden variar en idioma, formato o alias. Este adaptador demuestra un enfoque ligero y reproducible para añadir capacidades de entity linking a un modelo base de 8B, aunque con limitaciones claras en cuanto a cobertura de juegos recientes y robustez frente a cambios en el catálogo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3-8B-Base (transformer denso) |
| Parametros totales | no disponible (adaptador LoRA r=64, alpha=128) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base) |
| Tipos de cuantizacion | BF16 (precision de entrenamiento) |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `Qwen/Qwen3-8B-Base`, un modelo de lenguaje denso de 8 mil millones de parámetros, según la información pública de Qualcomm AI Hub. El entrenamiento utiliza LoRA con r=64 y alpha=128, y además añade filas entrenables para tokens especiales en los embeddings de entrada y en la cabeza de salida, lo que permite al modelo aprender representaciones específicas para las etiquetas `<GAME_APPID>`. El tokenizer incluido en el repositorio debe usarse obligatoriamente, ya que contiene los tokens añadidos.

Los datos de entrenamiento consisten en 1000 entidades, cada una con un único ejemplo canónico (el nombre oficial del juego). Se seleccionó el checkpoint de la época 20, que alcanzó el umbral de precisión canónica configurado y fue el mejor en precisión de alias entre los que lo superaron. La precisión se mantiene en BF16. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; el entrenamiento es supervisado sobre ejemplos de mapeo directo.

## Capacidades

- Mapeo de nombres canonicos de juegos de Steam a etiquetas de un token (p. ej., `<GAME_730>`).
- Reconocimiento limitado de alias: la precision en alias no vistos es del 8,15%, lo que indica una generalizacion muy debil fuera de los ejemplos de entrenamiento.
- Soporte de tokens especiales anadidos al tokenizer, que deben cargarse junto con el adaptador.
- Funciona exclusivamente como adaptador PEFT; requiere el modelo base y el tokenizer del repositorio.
- No incluye capacidades generales de generacion de texto, razonamiento, codigo o vision; estas dependen del modelo base, pero el adaptador no las mejora ni las modifica.

## Casos de uso

- Normalizacion de nombres de juegos en bases de datos: dado un nombre canonico, el adaptador produce la etiqueta correspondiente, facilitando la unificacion de registros en catalogos de Steam.
- Enriquecimiento de metadatos en pipelines de analisis: se puede usar para anotar textos (reseñas, foros) con identificadores de juegos, aunque solo si los nombres coinciden con los ejemplos de entrenamiento.
- Pruebas de concepto en entity linking para dominios especificos: sirve como base para experimentar con adaptadores LoRA en tareas de normalizacion de entidades con vocabulario cerrado.
- Integracion en sistemas de recomendacion experimental: al convertir nombres a tokens unicos, se simplifica la comparacion y el agrupamiento de juegos en entornos de investigacion.
- Evaluacion de tecnicas de memorizacion vs. generalizacion: el modelo es util para estudiar como los adaptadores memorizan ejemplos y fallan en variantes, como se refleja en las metricas de alias.
- Prototipado de herramientas de anotacion automatica: para catalogos estaticos donde los nombres no cambian, puede automatizar la asignacion de AppIDs, aunque con supervision humana.

## Benchmarks y rendimiento

La model card proporciona la siguiente tabla de evaluacion, que mide la coincidencia exacta (exact match) sobre ejemplos canonicos y sobre un conjunto fijo de 184 alias no incluidos en el entrenamiento:

| Epoca | Coincidencia exacta canonica | Coincidencia exacta alias |
|---:|---:|---:|
| 1 | 0,00% | 0,00% |
| 3 | 0,20% | 0,00% |
| 5 | 0,10% | 0,00% |
| 10 | 0,10% | 0,00% |
| 20 | 97,90% | 8,15% |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3-8B en BF16 requiere aproximadamente 16 GB de VRAM solo para los pesos; el adaptador LoRA anade una cantidad minima. Con cuantizacion a 8 bits o 4 bits, se podria reducir a 8-10 GB, pero no se proporcionan datos especificos.
- GPU recomendadas: tarjetas con al menos 16 GB de VRAM, como RTX 4090, A100 (40 GB) o H100. En GPUs de 8 GB (p. ej., RTX 3070) solo seria viable con cuantizacion agresiva y posiblemente offloading.
- El adaptador es ligero, pero el modelo base domina los requisitos. No cabe en GPUs de consumo de gama baja sin cuantizacion.
- Opciones de despliegue: se puede cargar con la libreria `transformers` y `peft` (como se muestra en el codigo de uso). No se menciona compatibilidad con vLLM, llama.cpp u Ollama; al ser un adaptador PEFT, su integracion en estos motores no esta garantizada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre adaptadores LoRA equivalentes para entity linking de Steam u otros catalogos de juegos. La comparativa con el modelo base sin adaptador no es relevante, ya que el adaptador no modifica las capacidades generales del modelo. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Los juegos lanzados recientemente (los ultimos 900) pueden no estar representados en el conocimiento de preentrenamiento del modelo base, lo que degrada la generalizacion a alias y expresiones en lenguaje natural para esos titulos.
- La precision en alias no vistos es muy baja (8,15%), lo que limita su utilidad en escenarios reales donde los nombres de juegos varian.
- Es una prueba de concepto de memorizacion y generalizacion, no un sustituto de un sistema de entity linking con recuperacion (retrieval) para produccion.
- Los nombres de juegos y los AppIDs de Steam pueden cambiar con el tiempo, por lo que el adaptador puede quedar desactualizado.
- El adaptador requiere el tokenizer del repositorio y la revision exacta del modelo base (`49e3418fbbbca6ecbdf9608b4d22e5a407081db4`); usarlos incorrectamente puede provocar errores de mapeo.
- La licencia Apache-2.0 permite uso comercial, pero la falta de robustez y cobertura hace recomendable una evaluacion exhaustiva antes de cualquier despliegue en produccion.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/hxgdzyuyi/qwen3-8b-steam-entity-linking
- Repositorio de entrenamiento: https://github.com/hxgdzyuyi/qwen-steam-entity-linking.git
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Informe tecnico de Qwen3: https://arxiv.org/html/2505.09388v1
- Pagina de Qwen3-8B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_8b
