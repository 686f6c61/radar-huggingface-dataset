# QuerynAi/queryn-adapter-ada-002_to_nemotron-1b-free

## Resumen

Queryn adapter — `ada-002` → `nemotron-1b-free` es un adaptador de traducción de embeddings desarrollado por QuerynAi. Su función es transformar un vector de embedding generado por el modelo `ada-002` de OpenAI (1536 dimensiones) al espacio de embeddings de `nemotron-1b-free` (2048 dimensiones), permitiendo que un corpus ya indexado con `ada-002` pueda ser servido contra un índice basado en `nemotron-1b-free` sin necesidad de re-embedding. Esto resuelve el problema de migración entre sistemas de búsqueda semántica que utilizan distintos modelos de embeddings, ahorrando costes computacionales y de API.

El modelo es una proyección lineal simple (arquitectura `linear`) con aproximadamente 3,1 millones de parámetros, exportada a formato ONNX (opset 17). No es un modelo de lenguaje ni generativo; se trata de un componente de transformación de vectores. Su relevancia actual radica en la creciente adopción de modelos de embeddings de código abierto como los de NVIDIA Nemotron, que ofrecen alternativas a los servicios propietarios de OpenAI, y en la necesidad de reutilizar infraestructuras existentes sin re-procesar grandes volúmenes de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyección lineal (plain linear projection) |
| Parametros totales | ~3,1 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (no es modelo de lenguaje) |
| Tipos de cuantizacion | No disponible (formato ONNX float32) |
| Idiomas soportados | No disponible (el corpus de entrenamiento incluye dominios en inglés: arXiv, derecho australiano, SQuAD, PubMed, finanzas) |
| Licencia | MIT |
| Formato de pesos | ONNX (model.onnx) |

## Arquitectura y entrenamiento

El adaptador implementa una proyección lineal que mapea un vector de entrada de 1536 dimensiones (embeddings de `ada-002`) a un vector de salida de 2048 dimensiones (espacio de `nemotron-1b-free`). El grafo ONNX incluye normalización L2 interna, por lo que no se requiere pre-normalización de los embeddings de entrada. La salida es un vector unitario en el espacio objetivo.

El entrenamiento se realizó sobre un corpus unificado de pares de embeddings (~350 000 filas) que abarca múltiples dominios: resúmenes de arXiv, jurisprudencia australiana, pasajes de SQuAD, resúmenes de PubMed y noticias de criptomonedas/mercados. La función de pérdida fue `1 - mean cosine similarity`, con optimizador Adam y reducción de tasa de aprendizaje mediante `ReduceLROnPlateau`. Se evaluaron dos arquitecturas: una lineal y una MLP profunda; la lineal obtuvo mejor similitud coseno en test (0,7271 frente a 0,7213) y fue la publicada. El checkpoint de la mejor época se convirtió a ONNX.

## Capacidades

- Traducción de embeddings de `ada-002` (1536-d) al espacio de `nemotron-1b-free` (2048-d).
- Normalización L2 automática de la entrada y salida unitaria.
- Soporte de batch dinámico en el eje de lote.
- Inferencia eficiente en CPU mediante ONNX Runtime.
- No es un modelo generativo: no genera texto, no soporta tool calling, ni razonamiento multi-paso.
- No tiene capacidades multimodales ni de visión.

## Casos de uso

- Migración de índices de búsqueda semántica: un sistema que ya tiene millones de documentos embebidos con `ada-002` puede cambiar a un índice basado en `nemotron-1b-free` sin re-embedding, simplemente aplicando el adaptador a los vectores almacenados.
- Ahorro de costes de API: al evitar re-embedding con el servicio de OpenAI, se reducen los costes recurrentes de llamadas a la API, especialmente en corpus grandes.
- Integración en pipelines de RAG: en un sistema de generación aumentada por recuperación, el adaptador permite sustituir el modelo de embeddings sin modificar el resto del pipeline.
- Evaluación comparativa de modelos de embeddings: se puede usar el adaptador para proyectar un mismo corpus a diferentes espacios y comparar la calidad de recuperación entre `ada-002` y `nemotron-1b-free` bajo las mismas condiciones.
- Mantenimiento de sistemas legacy: organizaciones con infraestructura basada en `ada-002` pueden adoptar modelos de código abierto sin interrumpir servicios existentes.
- Despliegue en entornos con restricciones de conectividad: al ser un modelo ONNX local, funciona sin depender de APIs externas, útil en entornos aislados o con políticas de privacidad estrictas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible. El único dato de rendimiento reportado es la similitud coseno media en el conjunto de test durante el entrenamiento: **0,7271** (época 15), que indica la calidad de la traducción entre espacios. No hay comparaciones con otros adaptadores o modelos.

## Requisitos de hardware

- El modelo es extremadamente ligero (~3,1 millones de parámetros, archivo ONNX de tamaño despreciable).
- Inferencia en CPU sin necesidad de GPU; cualquier procesador moderno es suficiente.
- Consumo de VRAM: no aplica (no requiere GPU).
- Despliegue recomendado con ONNX Runtime (CPUExecutionProvider) o cualquier runtime compatible con ONNX.
- Latencia: del orden de microsegundos por vector, dependiendo del hardware; throughput muy alto incluso en CPU.
- No requiere configuración especial de memoria.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores comparables en la documentación proporcionada. QuerynAi publica una colección de adaptadores para otros pares de modelos (por ejemplo, `ada-002` → `qwen3-emb-8b`), pero no se ofrecen datos de rendimiento comparativo entre ellos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- La similitud coseno máxima alcanzada (0,7271) indica que la traducción no es perfecta; puede haber pérdida de precisión en tareas de recuperación semántica.
- El modelo fue entrenado en dominios específicos (ciencia, derecho, medicina, finanzas) y puede no generalizar bien a otros dominios no representados en el corpus.
- No se han documentado sesgos específicos, pero al ser un modelo de proyección, los sesgos de los modelos fuente y destino pueden propagarse.
- Riesgo de alucinación: no aplica, ya que no genera texto.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo depende de los modelos fuente y destino, cuyas licencias deben verificarse por separado.
- Para producción, se recomienda validar la calidad de la traducción en el dominio de aplicación antes de desplegarlo a gran escala.

## Enlaces

- Modelo en Hugging Face: [QuerynAi/queryn-adapter-ada-002_to_nemotron-1b-free](https://huggingface.co/QuerynAi/queryn-adapter-ada-002_to_nemotron-1b-free)
- Colección de adaptadores de Queryn: [Queryn Embedding Adapters](https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4)
