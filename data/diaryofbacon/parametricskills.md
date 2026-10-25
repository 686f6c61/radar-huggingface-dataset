# DiaryOfBacon/ParametricSkills

## Resumen

ParametricSkills es un conjunto de checkpoints de componentes —no un modelo de lenguaje completo— desarrollado por el usuario DiaryOfBacon. Su función es convertir descripciones textuales de habilidades ("skills") en adaptadores LoRA paramétricos generados dinámicamente para un backbone Qwen3.5. Es decir, en lugar de entrenar y almacenar un adaptador PEFT por cada tarea, la hiperred recibe una descripción en lenguaje natural y produce los pesos del adaptador en tiempo de ejecución.

El repositorio publica dos variantes: ParametricSkills-Qwen3.5-4B y ParametricSkills-Qwen3.5-9B, pensadas para funcionar con los modelos base Qwen/Qwen3.5-4B y Qwen/Qwen3.5-9B respectivamente. Cada directorio contiene el estado de la hiperred (`metanetwork.pth`), los parámetros meta-LoRA compartidos (`metalora.pth`), tokens de memoria aprendidos (`mem_tokens.pt`), filas de embeddings de tokens especiales (`special_token_embeddings.pt`) y ficheros de configuración. Los pesos del backbone y el tokenizador se obtienen por separado del modelo base correspondiente.

Es relevante para investigación en meta-aprendizaje e hiperredes aplicadas a adaptación de LLM: propone sustituir el almacenamiento y versionado de N adaptadores por un generador condicionado por texto, lo que reduce el espacio necesario para mantener muchas habilidades y permite crear adaptadores nuevos sin reentrenamiento. Su adopción es todavía nula (0 descargas, 0 likes en el momento de la consulta) y requiere un runtime propio, no estándar, por lo que debe considerarse material de investigación más que un artefacto listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hiperred condicionada por habilidades (implementación basada en SHINE) que genera adaptadores meta-LoRA para un backbone transformer Qwen3.5 |
| Parametros totales | No disponible para la hiperred; los backbones soportados son Qwen3.5-4B y Qwen3.5-9B |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3.5 y de la configuración del runtime) |
| Tipos de cuantizacion | No disponible; los checkpoints se distribuyen en precisión nativa de PyTorch, sin variantes GGUF ni cuantizadas publicadas |
| Idiomas soportados | en, zh (según la model card) |
| Licencia | Apache-2.0 (los modelos base Qwen3.5 se distribuyen por separado también bajo Apache-2.0) |
| Formato de pesos | Estado de PyTorch: `.pth` (state dict de la hiperred y meta-LoRA) y `.pt` (tokens de memoria y embeddings); no son safetensors ni un checkpoint Transformers completo |

## Arquitectura y entrenamiento

La arquitectura es una hiperred que, dada una descripción textual de una habilidad junto con el backbone Qwen3.5, genera los pesos de un adaptador LoRA específico para esa habilidad. El sistema se apoya en tres piezas adicionales: un conjunto de parámetros meta-LoRA compartidos entre habilidades, tokens de memoria aprendidos y filas de embeddings de tokens especiales, todo ello aprendido de forma conjunta. La implementación se basa en la hiperred SHINE, cuyos avisos de atribución y licencia se recogen en `THIRD_PARTY_NOTICES.md`.

El repositorio no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon etapas de RLHF o DPO. Tampoco se especifican los hiperparámetros del meta-entrenamiento. Sí se indica que cada checkpoint incluye un `inference_config.yaml` con la arquitectura portable y ajustes de inferencia, y un `checkpoint_config.json` con metadatos de componentes, sumas de verificación SHA256 y la revisión del backbone recomendada para una carga reproducible. La carga se realiza en CPU con `weights_only=True` de PyTorch, lo que exige PyTorch 2.6 o superior.

## Capacidades

- Generación de adaptadores LoRA a partir de descripciones textuales de habilidades, sin entrenamiento por tarea en el momento de uso.
- Soporte de dos backbones de distinta escala (Qwen3.5-4B y Qwen3.5-9B) mediante checkpoints separados.
- Reutilización de parámetros meta-LoRA compartidos, que actúan como base común sobre la que se especializa cada habilidad.
- Uso de tokens de memoria y embeddings de tokens especiales aprendidos como parte del mecanismo de condicionamiento.
- Carga verificable: validación de checksums SHA256 e instrucciones de carga programática mediante `load_components`.
- Ejemplo de agente de iteración de PR incluido en el repositorio (`code/inference/examples/README.md`), orientado a flujos de trabajo agénticos sobre código.
- Idiomas de trabajo documentados: inglés y chino.
- Capacidad de tool calling, agentes multi-paso, visión o audio: no disponible en la información proporcionada (dependerá del backbone Qwen3.5 y no se documenta en esta ficha).

## Casos de uso

- Adaptación rápida a dominios internos sin reentrenar: un equipo describe en texto el estilo y las reglas de su dominio (por ejemplo, terminología de seguros) y el sistema genera un adaptador específico, evitando lanzar un job de fine-tuning por cada dominio nuevo.
- Versionado ligero de habilidades: en lugar de almacenar decenas de adaptadores PEFT, se guardan las descripciones textuales y se regeneran los adaptadores bajo demanda, lo que simplifica la gestión de artefactos y la trazabilidad de cambios.
- Despliegues multi-tenant: generar un adaptador por cliente a partir de su descripción de requisitos, manteniendo el backbone compartido y reduciendo el coste de almacenamiento frente a una flota de adaptadores independientes.
- Investigación en meta-aprendizaje e hiperredes: usar los checkpoints como línea base reproducible (con revisión de backbone fijada en `checkpoint_config.json`) para experimentar con generación de adaptadores condicionada por texto.
- Agentes de iteración sobre repositorios de código: el repositorio incluye un ejemplo de agente de iteración de PR, aplicable a revisión y modificación de parches en un pipeline de integración continua.
- Fijación de formatos de salida: crear un adaptador que fuerce un esquema estructurado (JSON, plantillas de informe) descrito en lenguaje natural, útil en extracción de datos y generación de documentación técnica.
- Localización en inglés y chino: generar adaptadores específicos por idioma para equipos que operan en ambos mercados, siempre que el backbone Qwen3.5 rinda adecuadamente en ellos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a `code/inference/VALIDATION.md` para el alcance de la validación, pero no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones numéricas con otras aproximaciones.

## Requisitos de hardware

- Almacenamiento: el repositorio ocupa 2,8 GB e incluye los checkpoints de componentes de ambas variantes (4B y 9B).
- VRAM estimada: los componentes son ligeros, pero la inferencia requiere cargar el backbone completo. Como referencia aritmética, Qwen3.5-4B en fp16 ronda los 8 GB de pesos y Qwen3.5-9B en fp16 ronda los 18 GB; a ello hay que sumar caché KV y activaciones.
- GPU recomendadas: para la variante 4B, una RTX 4090, RTX 4080 (16 GB) o L4/A10; para la variante 9B, A100 40 GB, H100 o RTX 4090 de 24 GB en fp16 con margen ajustado.
- Cabe en GPU de consumo: sí, la variante 4B en tarjetas de 16 GB o más; la variante 9B en tarjetas de 24 GB.
- Opciones de despliegue: runtime propio de ParametricSkills sobre PyTorch 2.6 o superior, con la clase de modelo y la implementación de hiperred correspondientes. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que los checkpoints no son un modelo Transformers estándar ni disponen de conversión a GGUF.
- Latencia y throughput: no disponible. Cabe esperar un coste adicional por la pasada de la hiperred necesaria para generar el adaptador antes de la inferencia, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ParametricSkills (Qwen3.5-4B / 9B) | No disponible (hiperred); backbone de 4B y 9B | No disponible | No publicados | Apache-2.0 | Repositorio HuggingFace con 0 descargas; requiere runtime propio |
| Qwen/Qwen3.5-4B (modelo base) | 4B | No disponible | No disponible en esta ficha | Apache-2.0 | Público en HuggingFace |
| Qwen/Qwen3.5-9B (modelo base) | 9B | No disponible | No disponible en esta ficha | Apache-2.0 | Público en HuggingFace |
| Adaptador LoRA convencional (PEFT) | Depende del rango y las capas objetivo | Heredado del modelo base | No aplica | Según el autor del adaptador | Ecosistema estándar (PEFT, vLLM, TGI) |

No se dispone de datos de otros releases de hiperredes generadoras de adaptadores que permitan una comparación numérica directa.

## Limitaciones y advertencias

- No es un modelo listo para usar: sin el runtime ParametricSkills y el backbone Qwen3.5 correspondiente, los checkpoints no producen inferencia. No funciona como un checkpoint Transformers estándar.
- Ausencia total de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, con una ventana de publicación de cinco días, lo que limita la evidencia sobre su robustez.
- Idiomas limitados a inglés y chino según la model card; el rendimiento en castellano no está documentado.
- Sin datos de benchmarks ni de evaluación cuantitativa publicados, por lo que no es posible comparar su calidad frente a un fine-tuning LoRA convencional.
- Riesgo de alucinación heredado del backbone Qwen3.5; la generación de adaptadores defectuosos o degenerados añade un modo de fallo propio que no está documentado.
- La licencia Apache-2.0 permite uso comercial, pero debe revisarse `THIRD_PARTY_NOTICES.md` por la atribución a SHINE, y los modelos base Qwen3.5 se licencian por separado.
- Al cargar pesos con `weights_only=True` se reduce la superficie de ejecución arbitraria, pero conviene verificar los checksums SHA256 de `checkpoint_config.json` antes de usar checkpoints de terceros.
- No hay conversión a GGUF ni cuantizaciones publicadas, lo que dificulta el despliegue en entornos de bajo consumo o en CPU.

## Enlaces

- [HuggingFace: DiaryOfBacon/ParametricSkills](https://huggingface.co/DiaryOfBacon/ParametricSkills)
- [Modelo base Qwen/Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B)
- [Modelo base Qwen/Qwen3.5-9B](https://huggingface.co/Qwen/Qwen3.5-9B)
- Instalación e inferencia local: `code/inference/README.md` (dentro del repositorio)
- Ejemplo de agente de iteración de PR: `code/inference/examples/README.md` (dentro del repositorio)
- Alcance de la validación: `code/inference/VALIDATION.md` (dentro del repositorio)
- Atribuciones y licencias de terceros (SHINE): `THIRD_PARTY_NOTICES.md` (dentro del repositorio)
- Script de carga de checkpoints: `ParametricSkills/load_checkpoint.py` (dentro del repositorio)
