# MercanAI/LFM3-1.7B-mercan

## Resumen

LFM3-1.7B-mercan es un reempaquetado del modelo LiquidAI/LFM3-1.7B de Liquid AI en el formato propietario `.mercan`, creado por MercanAI para su runtime Mercan y su aplicación para iOS. No se trata de un modelo nuevo ni de un ajuste fino: es exactamente el fichero oficial `LFM3-1.7B-Q4_K_M.gguf` con metadatos adicionales insertados, sin modificar, recuantizar ni entrenar los pesos. El repositorio ocupa 1,1 GB y contiene un único fichero `model.mercan` junto con un JSON de verificación de hashes.

El modelo base es LFM3-1.7B, un transformer de Liquid AI de 1.700 millones de parámetros con modo de razonamiento explícito (` thinking`), orientado a generación de texto y razonamiento en dispositivos con recursos limitados. La cuantización Q4_K_M reduce el peso a aproximadamente 1 GB, lo que permite ejecución en hardware móvil y GPUs de consumo.

Su relevancia es acotada: no aporta mejoras de rendimiento sobre el GGUF original y solo resulta útil si se utiliza el runtime Mercan, ya que requiere un proveedor de arquitectura `lfm3` (rama `ios-lfm` o posterior). Para cualquier otro stack (llama.cpp, vLLM, Ollama, TGI) conviene usar directamente el GGUF oficial de Liquid AI. La licencia LFM Open License v1.0 restringe el uso comercial a entidades con ingresos anuales inferiores a 10 millones de dólares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LiquidAI/LFM3-1.7B; detalles internos no disponibles en la informacion proporcionada) |
| Parametros totales | 1.700 millones (1,7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unica incluida en el repo) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (`lfm1.0`); uso comercial no licenciado a entidades con ingresos anuales >= 10.000.000 USD |
| Formato de pesos | `.mercan` (contenedor propietario con metadatos; tensores idénticos al GGUF Q4_K_M de origen) |

## Arquitectura y entrenamiento

El repositorio no entrena ni modifica el modelo. `model.mercan` es una copia byte a byte de `LFM3-1.7B-Q4_K_M.gguf` con claves de metadatos añadidas: `mercan.format`, `mercan.format_version` (1), `mercan.runtime_abi` (1), `mercan.model_family` (`LFM3`), `mercan.tokenizer.type` (`gguf-vocab`), `mercan.source_kind` (`gguf`), `mercan.source_checkpoint` y `mercan.source_sha256` (hash `3793e1e6...b05c93c4`). La herramienta de conversión es `scripts/gguf_to_mercan.py` del repositorio MercanRuntime, rama `ios-lfm`, y `model.mercan.json` documenta los SHA-256 de entrada y salida.

La arquitectura subyacente corresponde a LFM3 de Liquid AI, descrita en la model card como un modelo de razonamiento que abre un bloque ` thinking` para el razonamiento interno, que el runtime oculta al usuario. Los detalles de composición del dataset, número de tokens de entrenamiento, uso de RLHF/DPO e innovaciones técnicas del modelo base no están incluidos en la información proporcionada y deben consultarse en la model card oficial de LiquidAI/LFM3-1.7B.

## Capacidades

- Generación de texto y razonamiento con modo ` thinking`: el runtime abre un bloque de razonamiento interno y oculta su contenido, mostrando solo la respuesta final.
- Razonamiento multi-paso, con la advertencia explícita del autor de que las respuestas pueden tardar en preguntas largas.
- Ejecución en el runtime Mercan mediante el comando `mercan run MercanAI/LFM3-1.7B-mercan -p "<prompt>"`.
- Integración en la aplicación Mercan para iOS mediante la URL directa al fichero `model.mercan`.
- Tokenizador basado en el vocabulario GGUF original (`gguf-vocab`).
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni cobertura multilingüe específica; deben verificarse en la model card del modelo base.

## Casos de uso

- Inferencia local en iOS: cargar el modelo en la app Mercan pegando la URL del fichero y ejecutar generación de texto y razonamiento en el dispositivo, aprovechando el tamaño de 1,1 GB y la cuantización Q4_K_M.
- Pruebas del runtime Mercan: validar el proveedor de arquitectura `lfm3` y el ABI de formato 1 con un modelo conocido y verificable por hash SHA-256.
- Verificación de integridad en pipelines: usar `model.mercan.json` y `mercan.source_sha256` para comprobar que el fichero desplegado corresponde exactamente al GGUF oficial de Liquid AI, útil en auditorías de cadena de suministro de modelos.
- Prototipado de asistentes con razonamiento visible/oculto: el modo ` thinking` permite separar cadena de razonamiento y respuesta final, útil para interfaces que solo muestran la conclusión.
- Despliegue en entornos con recursos muy limitados: al ser un modelo de 1,7B en Q4_K_M, encaja en escenarios de borde donde no cabe un modelo mayor, siempre que se acepte la dependencia del runtime Mercan.
- Evaluación comparativa del modelo base: sirve como artefacto de referencia para contrastar el comportamiento de LFM3-1.7B cuantizado frente a otras variantes, aunque para ello es preferible usar el GGUF oficial directamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero pesa 1,1 GB; la inferencia requiere espacio adicional para el contexto y el estado del runtime, no cuantificado en la información disponible.
- GPU recomendadas: no disponible en la información proporcionada.
- GPU de consumo: el tamaño del fichero sugiere que puede ejecutarse en hardware de gama media, pero no se confirma compatibilidad ni modelos concretos.
- Opciones de despliegue: exclusivamente el runtime Mercan con proveedor `lfm3` (rama `ios-lfm` o posterior) y la app Mercan para iOS. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para el formato `.mercan`; para esos stacks debe usarse el GGUF oficial.
- Latencia y throughput: no disponibles. El autor advierte que las respuestas pueden tardar en preguntas largas debido al bloque de razonamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| MercanAI/LFM3-1.7B-mercan | 1,7B | no disponible | `.mercan` (Q4_K_M) | LFM Open License v1.0 | Reempaquetado con metadatos; requiere runtime Mercan |
| LiquidAI/LFM3-1.7B | 1,7B | no disponible | safetensors (pesos originales) | LFM Open License v1.0 | Modelo base oficial, sin cuantizar |
| LiquidAI/LFM3-1.7B-GGUF | 1,7B | no disponible | GGUF (incluye Q4_K_M) | LFM Open License v1.0 | Fuente byte a byte del fichero `.mercan`; compatible con llama.cpp y derivados |

La comparativa se limita a variantes del mismo modelo porque la información disponible no incluye datos de rendimiento ni modelos alternativos de otros desarrolladores con los que contrastar.

## Limitaciones y advertencias

- No es una versión oficial de Liquid AI; el autor declara explícitamente que no está afiliado ni respaldado por Liquid AI.
- No aporta ninguna mejora sobre el GGUF original: los pesos y metadatos originales se copian sin cambios, por lo que el rendimiento es idéntico al de `LFM3-1.7B-Q4_K_M.gguf`.
- Dependencia total del runtime Mercan: fuera de ese ecosistema el fichero `.mercan` no es utilizable.
- Licencia LFM Open License v1.0: el uso comercial no está licenciado para entidades con ingresos anuales de 10.000.000 USD o superiores; es imprescindible leer el texto completo antes de cualquier despliegue comercial.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; deben evaluarse a partir de la model card del modelo base.
- Idiomas soportados y longitud de contexto no especificados en la información proporcionada, lo que impide garantizar un comportamiento multilingüe o conversaciones de contexto largo.
- El modo de razonamiento ` thinking` incrementa la latencia en preguntas complejas, según advierte el autor.
- Repositorio sin descargas ni valoraciones en el momento de la consulta, lo que limita la validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MercanAI/LFM3-1.7B-mercan
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- GGUF oficial de origen: https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF
- Runtime Mercan: https://github.com/Ahmet2001/MercanRuntime
- Script de conversión: https://github.com/Ahmet2001/MercanRuntime/blob/ios-lfm/scripts/gguf_to_mercan.py
- Descarga directa del fichero: https://huggingface.co/MercanAI/LFM3-1.7B-mercan/resolve/main/model.mercan
