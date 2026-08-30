# Rin247/gemma-3-12b-it-Uncensored-Aquarion-INT8

## Resumen

El modelo `Rin247/gemma-3-12b-it-Uncensored-Aquarion-INT8` es una cuantización INT8 con pesos exclusivos (weight-only) del modelo base `google/gemma-3-12b-it`, realizado por el usuario Rin247. La cuantización se aplica después de un proceso de "abliteración" (abliteration) mediante proyección ortogonal de la dirección de rechazo, lo que elimina las barreras de seguridad del modelo original y permite una generación de contenido sin censura. Este tipo de modelos suele emplearse en entornos de investigación o desarrollo donde se requiere explorar respuestas sin restricciones temáticas.

El modelo mantiene la arquitectura multimodal original de Gemma 3 (texto e imagen), con 12 187 millones de parámetros y una ventana de contexto de 128 000 tokens, aunque la model card no especifica explícitamente estas características para la versión cuantizada. El repositorio incluye únicamente los archivos `model.safetensors` y `config.json`, con un tamaño total de 13,2 GB. Al ser una cuantización INT8 con escalas almacenadas por separado, no es directamente compatible con los motores de inferencia estándar sin un proceso de desescalado previo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (decoder-only) con atención y visión, basada en Gemma 3 |
| Parametros totales | 12 187 325 040 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 128 000 tokens (heredado del base, no especificado en la version cuantizada) |
| Tipos de cuantizacion | INT8 weight-only (RTN, escalas por tensor) |
| Idiomas soportados | 140+ idiomas (heredado del base, no especificado en la version cuantizada) |
| Licencia | no disponible (el base usa Gemma Terms of Use) |
| Formato de pesos | safetensors con buffers adicionales `*.weight_scale` y `*.weight_shape` |

## Arquitectura y entrenamiento

El modelo base `gemma-3-12b-it` emplea una arquitectura transformer multimodal con atención de ventana deslizante y atención global, optimizada para reducir el uso de memoria del cache KV en contextos largos. Incluye un codificador de visión que permite procesar imágenes junto con texto. El entrenamiento del base se realizó con un corpus multilingüe extenso y técnicas de ajuste instructivo (RLHF), aunque los detalles exactos no se recogen en la información disponible.

La versión cuantizada aplica dos transformaciones sobre el base: primero, una abliteración mediante proyección ortogonal de la dirección de rechazo (refusal direction), que elimina los mecanismos de negativa del modelo; segundo, una cuantización INT8 weight-only usando el método RTN (round-to-nearest) ejecutado en CPU, con escalas y formas almacenadas como buffers adicionales. Esta cuantización no es estándar y requiere un paso de deescalado manual antes de la inferencia.

## Capacidades

- Generación de texto y razonamiento multilingüe (heredado del base, aunque no verificado en la version cuantizada).
- Procesamiento de imágenes: el base Gemma 3 es multimodal, por lo que esta version hereda la capacidad de entender y responder sobre imagenes.
- Ventana de contexto larga de 128K tokens, util para documentos extensos o conversaciones multi-turno.
- Sin restricciones de contenido: al estar abliterado, no aplica los filtros de seguridad del modelo original, lo que permite generar respuestas sobre temas sensibles o prohibidos.
- No se ha confirmado soporte de tool calling, function calling o modo agente en la informacion disponible.

## Casos de uso

- Generacion de contenido creativo sin censura: escritura de ficcion, guiones o dialogos que aborden temas tabú o controvertidos, aprovechando la ausencia de filtros de seguridad.
- Investigacion en seguridad de IA: analisis del comportamiento de modelos sin restricciones para estudiar sesgos, alucinaciones o riesgos de generacion de contenido danino.
- Desarrollo de personajes conversacionales: creacion de asistentes virtuales con personalidades arriesgadas o sin limitaciones tematicas, ideal para juegos o experiencias inmersivas.
- Analisis de documentos largos: gracias a su contexto de 128K, puede resumir o extraer informacion de libros completos o informes extensos, aunque se debe verificar la calidad tras la cuantizacion.
- Generacion de codigo y matematicas: el base Gemma 3 tiene buenas capacidades en estas areas; la version cuantizada puede usarse en entornos donde el rendimiento no sea critico.
- Pruebas de robustez de modelos: comparar el comportamiento entre la version original y la abliterada para evaluar el impacto de la eliminacion de la seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al ser INT8 weight-only, el peso del modelo ocupa aproximadamente 12 GB (12 187 millones de parámetros × 1 byte). Con overhead de activaciones y escalas, se recomienda al menos 14-16 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB), A100 40 GB o similar. Puede caber en una RTX 4080 (16 GB) con margen ajustado.
- No es compatible directamente con vLLM, llama.cpp u Ollama sin un proceso de deescalado previo, ya que los pesos estan almacenados en formato INT8 con escalas personalizadas. Se requiere un script de conversion a un formato estandar (por ejemplo, FP16 o BF16) antes de usar motores de inferencia convencionales.
- Latencia y throughput: no disponibles, ya que no se han publicado mediciones para esta cuantizacion especifica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `google/gemma-3-12b-it` (base) | 12 187 M | 128K | safetensors (BF16) | Gemma Terms of Use | HuggingFace oficial |
| `Rin247/gemma-3-12b-it-Uncensored-Aquarion-INT8` | 12 187 M | 128K (heredado) | safetensors INT8 weight-only | no disponible | HuggingFace (este repo) |
| `mradermacher/gemma-3-12b-it-uncensored-GGUF` | 12 187 M | 128K (heredado) | GGUF (varias cuantizaciones) | no disponible | HuggingFace |

La comparativa se limita a características de empaquetado; no hay datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- El proceso de abliteracion elimina los mecanismos de seguridad, por lo que el modelo puede generar contenido ofensivo, peligroso o ilegal sin restricciones. Su uso debe limitarse a entornos controlados y con fines de investigacion.
- La cuantizacion INT8 weight-only puede degradar ligeramente la precision en tareas complejas de razonamiento o generacion de codigo, aunque no hay mediciones cuantitativas disponibles.
- El formato de pesos no es estandar; requiere un paso de deescalado manual, lo que complica la integracion en pipelines de produccion.
- No se especifican los idiomas soportados en la version cuantizada; se asume que hereda los del base, pero no esta verificado.
- La licencia del modelo cuantizado no esta declarada; el base usa Gemma Terms of Use, que puede imponer restricciones de uso comercial que el autor de esta version no ha aclarado.
- El repositorio no incluye documentacion sobre el proceso de abliteracion completo ni sobre la validacion de calidad post-cuantizacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rin247/gemma-3-12b-it-Uncensored-Aquarion-INT8
- Modelo base oficial: https://huggingface.co/google/gemma-3-12b-it
- Paper tecnico de Gemma 3: https://arxiv.org/html/2503.19786v1
- Repositorio de Gemma 3 en GitHub: https://github.com/gemma-3/gemma-3
- Version GGUF similar: https://huggingface.co/mradermacher/gemma-3-12b-it-uncensored-GGUF
