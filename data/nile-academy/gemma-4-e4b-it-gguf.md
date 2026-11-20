# nile-academy/gemma-4-e4b-it-gguf

## Resumen

`nile-academy/gemma-4-e4b-it-gguf` es un espejo de artefactos en formato GGUF derivado del modelo oficial `google/gemma-4-E4B-it` de Google DeepMind, publicado originalmente el 2 de abril de 2026. El repositorio lo mantiene Nile Academy y no incluye entrenamiento adicional: se trata de una conversión de formato y de una réplica de los ficheros QAT (quantization-aware training) oficiales de Google, junto con el checkpoint original en BF16 preservado en el subdirectorio `original/`. El modelo base es un transformer multimodal de aproximadamente 8.000 millones de parámetros totales (7.463.013.674 en el tensor safetensors reportado por Hugging Face, frente a 7.996.156.490 en la ficha del autor, que incluye embeddings y modalidades de origen).

La relevancia de esta ficha es doble. Por un lado, permite ejecutar un modelo de la familia Gemma 4 en entornos con recursos limitados mediante cuantización Q4_0 (fichero de 5,155 GB) y un proyector multimodal BF16 separado (0,992 GB). Por otro, el repositorio documenta de forma explícita el proceso de procedencia (revisión fijada `ee0ef6023621cff504d758262d4e04895a5af4a2`), los hashes SHA-256 y una corrección de tokenizer publicada el 21 de octubre de 2026 que afecta a once tokens de control.

Conviene subrayar que el propio autor declara que la calificación de calidad de cuantización amplia de Wekala está **no cualificada** y que no se emite ninguna afirmación de "pérdida de calidad no significativa". Los benchmarks publicados corresponden al modelo fuente de Google, no a estas cuantizaciones, y no deben interpretarse como mediciones independientes de los ficheros GGUF de este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + visión mediante proyector mmproj); detalles internos de capas y atención no disponibles |
| Parametros totales | 7.463.013.674 (safetensors reportado); 7.996.156.490 según ficha del autor (incluye embeddings y modalidades) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (QAT oficial de Google, 5,155 GB); BF16 (checkpoint original, 15.053.097.440 bytes en GGUF texto); proyector BF16 (0,992 GB) |
| Idiomas soportados | no disponibles (la model card menciona evaluación multilingüe/árabe pendiente, sin lista cerrada) |
| Licencia | apache-2.0 (preservada en LICENSE; los pesos se rigen por la licencia del modelo original) |
| Formato de pesos | GGUF (Q4_0 y BF16), safetensors (checkpoint original), proyector mmproj en GGUF BF16 |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-E4B-it` es un transformer multimodal de la familia Gemma 4 de Google DeepMind, con aproximadamente 8.000 millones de parámetros totales y soporte de entrada visual a través de un proyector multimodal separado (`gemma-4-E4B-it-mmproj.gguf`, BF16, 0,992 GB). La nomenclatura "E4B" y el desglose de parámetros sugieren una configuración con embeddings de gran tamaño, pero la información disponible no detalla el número de capas, cabezas de atención, dimensión oculta ni el mecanismo exacto de atención. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

La innovación técnica documentada en este repositorio es la cuantización QAT (quantization-aware training) oficial de Google en formato Q4_0, que según el editor mantiene una calidad cercana a BF16. El repositorio incluye además el checkpoint original en BF16 para referencia y una corrección del tokenizer publicada el 21 de octubre de 2026: once entradas de tipo de token especial (marcadores de turno y de herramienta) estaban codificadas como tokens ordinarios en la exportación BF16 previa, lo que provocaba que la tokenización nativa dividiera dichos marcadores pese a que el texto del prompt pareciera correcto. La corrección no altera los 262.144 identificadores de vocabulario ni ningún byte de los tensores.

## Capacidades

- Generación de texto conversacional en modo instruct (`-it`), orientada a diálogo multi-turno.
- Entrada multimodal de visión a través del proyector `mmproj` en BF16.
- Razonamiento y conocimiento general, evaluado por el editor con MMLU-Pro (69,4 %) y GPQA Diamond (58,6 %).
- Razonamiento matemático sin herramientas, evaluado con AIME 2026 (42,5 %).
- Generación y razonamiento sobre código, evaluado con LiveCodeBench v6 (52 %).
- Soporte de tool calling / function calling, con marcadores de herramienta en el tokenizer corregido; las llamadas se emiten como propuestas sujetas a los permisos de la aplicación consumidora.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags).
- Capacidades multilingües: la model card menciona tareas multilingües y árabe en el plan de evaluación, pero no se publica una lista cerrada de idiomas.
- Modo de razonamiento ("thinking") no confirmado en la información disponible.

## Casos de uso

- **Atención al cliente automatizada**: el modelo puede gestionar conversaciones multi-turno con marcadores de turno correctamente tokenizados tras la corrección del 21 de octubre de 2026, lo que evita la división errónea de delimitadores en prompts nativos. La licencia Apache 2.0 facilita su integración en productos comerciales.
- **Asistente con entrada de imágenes**: usando el proyector `gemma-4-E4B-it-mmproj.gguf` junto con el fichero Q4_0, se pueden procesar capturas, documentos escaneados o fotogramas y responder preguntas sobre ellos en local.
- **Generación de código en pipelines de CI/CD**: con LiveCodeBench v6 en 52 % y soporte de tool calling, el modelo puede proponer parches, generar tests o invocar herramientas de build dentro de un agente controlado por la aplicación.
- **Razonamiento matemático asistido**: para problemas de tipo competición sin herramientas (AIME 2026, 42,5 %), adecuado en entornos educativos donde se requiere ejecución local y no se quiere depender de APIs externas.
- **Despliegue en estaciones de trabajo con GPU de consumo**: el fichero Q4_0 de 5,155 GB permite ejecución en GPUs con 8 GB de VRAM, aunque el autor advierte que la operación sostenida en 8 GB requiere perfiles medidos propios y que el tamaño de pesos excluye estado de contexto, buffers y drivers.
- **Prototipado e investigación con checkpoint de referencia**: el checkpoint BF16 en `original/ee0ef6023621cff504d758262d4e04895a5af4a2/` permite reproducir experimentos a precisión original y comparar contra la variante QAT.
- **Evaluación comparativa de cuantizaciones**: el repositorio está diseñado para campañas de evaluación emparejada referencia/variante en tareas de instrucción, conocimiento, matemáticas, multilingüe/árabe y herramientas, lo que lo hace útil para estudiar la degradación por cuantización.

## Benchmarks y rendimiento

Los siguientes resultados los reporta el editor del modelo fuente (Google) y **no** son mediciones de estas cuantizaciones. El arnés, la precisión, los ajustes de razonamiento y las versiones de tarea difieren entre fuentes, por lo que no constituyen una clasificación normalizada entre modelos.

| Benchmark | Puntuación (%) | Modo / ajustes |
|---|---:|---|
| MMLU-Pro | 69,4 | publisher-default; protocolo del editor; no medido en esta cuantización |
| GPQA Diamond | 58,6 | publisher-default; protocolo del editor; no medido en esta cuantización |
| AIME 2026 (sin herramientas) | 42,5 | publisher-default; protocolo del editor; no medido en esta cuantización |
| LiveCodeBench v6 | 52 | publisher-default; protocolo del editor; no medido en esta cuantización |

No se han publicado resultados de benchmarks medidos sobre los ficheros GGUF de este repositorio en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el fichero Q4_0 ocupa 5,155 GB y el proyector BF16 0,992 GB; a ello hay que sumar estado de contexto KV, buffers de scratch y margen de driver, no incluidos en esas cifras.
- **GPU recomendadas**: no disponibles de forma explícita en la información proporcionada. Por tamaño de pesos, una GPU con 8 GB de VRAM es el mínimo nominal para el Q4_0, y 16 GB o más ofrece margen para contexto y proyector.
- **GPU de consumo**: sí cabe en GPUs de consumo con al menos 8 GB de VRAM según el tamaño del fichero Q4_0, aunque el autor indica que la operación sostenida en 8 GB requiere perfiles medidos específicos y que la calificación móvil/navegador está pendiente.
- **Opciones de despliegue**: el formato es GGUF y la librería declarada es `gguf`, por lo que es compatible con runtimes de inferencia GGUF (llama.cpp y derivados). El autor indica que la calificación nativa de chat, herramientas y plantilla en Wekala está pendiente y que no hay instalación automática de backend. vLLM, TGI y Ollama no se mencionan en la información disponible.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Benchmarks publicados | Licencia | Formato |
|---|---|---|---|---|---|
| `nile-academy/gemma-4-e4b-it-gguf` (este) | 7.463.013.674 (safetensors) / 7.996.156.490 (ficha) | no disponible | MMLU-Pro 69,4; GPQA-D 58,6; AIME 2026 42,5; LiveCodeBench v6 52 (modelo fuente) | apache-2.0 | GGUF Q4_0, BF16, safetensors |
| `google/gemma-4-E4B-it` (modelo fuente) | 7.996.156.490 | no disponible | mismos valores, reportados por el editor | apache-2.0 | safetensors, GGUF oficial QAT |
| Otras alternativas de ~8B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos verificables sobre modelos comparables de la misma categoría (mismo tamaño o misma tarea) para establecer una comparación cuantitativa adicional.

## Limitaciones y advertencias

- **Calidad de cuantización no cualificada**: el autor declara explícitamente que la calificación amplia de calidad de cuantización de Wekala está "not qualified" y no emite ninguna afirmación de "sin pérdida de calidad significativa". Cualquier uso en producción debería acompañarse de una evaluación emparejada referencia/variante.
- **Benchmarks no representativos de esta cuantización**: las puntuaciones publicadas corresponden al modelo fuente de Google, no a los ficheros GGUF de este repositorio.
- **Riesgo de alucinación**: el autor advierte que los modelos pueden producir salidas incorrectas o inseguras; no se documentan mitigaciones específicas.
- **Sesgos**: no se documentan sesgos conocidos en la información disponible.
- **Tool calling como propuesta**: las llamadas a herramientas se emiten como propuestas sujetas a los permisos de la aplicación consumidora y a la admisión del controlador; no deben ejecutarse sin validación.
- **Idiomas no especificados**: no hay lista cerrada de idiomas soportados; la evaluación multilingüe y en árabe figura como pendiente en el plan del autor.
- **Contexto no especificado**: se desconoce la longitud máxima de contexto, lo que impide dimensionar el estado KV y la VRAM real necesaria.
- **Corrección de tokenizer**: la exportación BF16 previa al 21 de octubre de 2026 codificaba once tokens de control como ordinarios, lo que rompía la tokenización de marcadores de turno y herramienta. Debe usarse la versión corregida.
- **Licencia**: los pesos se rigen por Apache 2.0 del modelo original; el repositorio no concede derechos sobre el SDK de Wekala.
- **Instalación y backend**: no hay instalación automática de backend; la calificación nativa de chat, herramientas y plantilla, el ajuste sostenido en GPU y la calificación móvil/navegador están pendientes.
- **Tamaño del repositorio**: 52,3 GB en total, lo que incluye el checkpoint original y los artefactos de procedencia; conviene descargar solo los ficheros necesarios.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nile-academy/gemma-4-e4b-it-gguf
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Revisión fijada del modelo base: https://huggingface.co/google/gemma-4-E4B-it/tree/ee0ef6023621cff504d758262d4e04895a5af4a2
- Model card exacta del modelo fuente: https://huggingface.co/google/gemma-4-E4B-it/blob/ee0ef6023621cff504d758262d4e04895a5af4a2/README.md
- Checkpoint original BF16 en este repositorio: https://huggingface.co/nile-academy/gemma-4-e4b-it-gguf/tree/main/original/ee0ef6023621cff504d758262d4e04895a5af4a2
- Anuncio de Gemma 4 en el blog de Google: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
