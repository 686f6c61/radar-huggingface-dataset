# QuerynAi/queryn-adapter-nemotron-1b-free_to_te3-small

## Resumen

El modelo `queryn-adapter-nemotron-1b-free_to_te3-small` es un adaptador de embeddings desarrollado por QuerynAi que traduce vectores generados por el modelo de embeddings `nemotron-1b-free` (dimensión 2048) al espacio de representación de `te3-small` (dimensión 1536). Su propósito es permitir que un corpus ya indexado con `nemotron-1b-free` pueda servirse contra un índice construido con `te3-small` sin necesidad de re-embedding, lo que ahorra tiempo y coste computacional en sistemas de búsqueda semántica.

Se trata de una proyección lineal simple (arquitectura `linear`) con aproximadamente 3,1 millones de parámetros, exportada a formato ONNX (opset 17). El modelo normaliza internamente las entradas y salidas, y acepta lotes de tamaño dinámico. Es parte de un conjunto más amplio de adaptadores de traducción de embeddings publicados por QuerynAi bajo licencia MIT.

La relevancia actual radica en la creciente adopción de modelos de embeddings especializados y la necesidad de migrar infraestructuras de búsqueda sin reprocesar grandes volúmenes de datos. Este adaptador ofrece una solución ligera y de bajo coste para ese escenario, aunque su rendimiento está limitado por la capacidad de una proyección lineal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyección lineal (capa densa sin activación) |
| Parametros totales | ~3,1 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de embeddings, no generativo) |
| Tipos de cuantizacion | No disponible (solo float32 en ONNX) |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | ONNX (model.onnx, opset 17) |

## Arquitectura y entrenamiento

El modelo es una proyección lineal que mapea un vector de 2048 dimensiones a uno de 1536. La entrada se normaliza L2 dentro del grafo, por lo que no es necesario pre-normalizar los embeddings de origen. La salida también se normaliza para producir vectores unitarios en el espacio de `te3-small`.

El entrenamiento se realizó sobre pares de embeddings generados a partir de un corpus multi-dominio de aproximadamente 350.000 filas, que incluye resúmenes de arXiv, jurisprudencia australiana, pasajes de SQuAD, resúmenes de PubMed y noticias de criptomonedas y mercados. La función de pérdida fue `1 - media de similitud coseno`, con optimizador Adam y reducción de tasa de aprendizaje por meseta (`ReduceLROnPlateau`). Se comparó una arquitectura lineal con una MLP profunda; la lineal obtuvo mejor similitud coseno en test (0,8545 frente a 0,8491) y fue la publicada.

## Capacidades

- Traducción de embeddings entre dos espacios vectoriales concretos: de `nemotron-1b-free` (2048-d) a `te3-small` (1536-d).
- Normalización L2 automática de entrada y salida, garantizando vectores unitarios en el espacio destino.
- Soporte de lotes con dimensión de batch dinámica, lo que permite inferencia con tamaños variables.
- Ejecución eficiente en CPU mediante ONNX Runtime, sin necesidad de GPU.
- Integración sencilla en pipelines de búsqueda semántica existentes mediante la API de ONNX.

## Casos de uso

- Migración de índices de embeddings sin re-embedding: si una organización tiene un corpus ya vectorizado con `nemotron-1b-free` y desea cambiar a un índice basado en `te3-small`, este adaptador transforma los vectores existentes sin reprocesar los documentos.
- Ahorro de coste computacional en actualizaciones de infraestructura: en lugar de ejecutar un modelo de embeddings sobre millones de documentos, se aplica una proyección lineal de bajo coste, reduciendo tiempo y consumo de recursos.
- Servicio de búsqueda híbrida: permite mantener dos índices (uno con `nemotron-1b-free` y otro con `te3-small`) y traducir consultas o documentos entre ambos espacios para unificar resultados.
- Evaluación comparativa de modelos de embeddings: al traducir embeddings de un modelo a otro, se pueden comparar métricas de recuperación sin re-embedding, facilitando la decisión de cambio de modelo.
- Sistemas de recomendación basados en similitud: si el sistema usa `nemotron-1b-free` para generar representaciones de ítems y se quiere explotar un índice preexistente de `te3-small`, el adaptador permite alinear ambos espacios.
- Prototipado rápido: en entornos de desarrollo, se puede probar la calidad de un índice `te3-small` con datos ya embebidos por `nemotron-1b-free` antes de comprometerse a una migración completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval o similares) en la información disponible, ya que se trata de un adaptador de embeddings y no de un modelo generativo. El único dato de rendimiento reportado es la similitud coseno media en el conjunto de test durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Mejor similitud coseno en test (epoch 15) | 0,8545 |
| Similitud coseno con arquitectura profunda (mejor) | 0,8491 |

Estos valores indican la fidelidad de la traducción, pero no son comparables con benchmarks de modelos de lenguaje.

## Requisitos de hardware

- Inferencia en CPU: el modelo es una única capa lineal con ~3,1M de parámetros, por lo que se ejecuta sin problemas en cualquier CPU moderna. No requiere GPU.
- Memoria: el archivo ONNX en float32 ocupa aproximadamente 12,4 MB (3,1M parámetros × 4 bytes), por lo que la RAM necesaria es mínima (menos de 100 MB con overhead de runtime).
- GPU: no necesaria; si se desea, puede ejecutarse en GPU con ONNX Runtime, pero no aporta ventaja significativa dado el tamaño.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider o CUDAExecutionProvider), integrable en servicios Python, contenedores Docker o funciones serverless.
- Latencia: del orden de microsegundos por lote pequeño en CPU; el throughput depende del tamaño de batch, pero es muy alto al ser una operación matricial simple.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores de embeddings comparables en el mercado que traduzcan entre `nemotron-1b-free` y `te3-small`. La colección de QuerynAi incluye otros adaptadores para distintos pares de modelos, pero no se han encontrado alternativas de terceros con la misma funcionalidad específica. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- La traducción es una proyección lineal, por lo que no puede capturar relaciones no lineales complejas entre los dos espacios de embeddings; la similitud coseno máxima de 0,8545 indica una pérdida de fidelidad respecto a los embeddings originales.
- El adaptador está entrenado específicamente para los modelos `nemotron-1b-free` y `te3-small`; no es válido para otros pares de modelos sin reentrenamiento.
- El corpus de entrenamiento cubre dominios concretos (ciencia, derecho, medicina, finanzas, QA); el rendimiento puede degradarse en dominios muy diferentes.
- No se especifican los idiomas soportados; se asume que depende de los modelos fuente y destino, pero no hay garantía explícita.
- Al ser un modelo ONNX, no se proporcionan pesos en otros formatos (safetensors, GGUF), lo que limita su uso en entornos que requieran esos formatos.
- La licencia MIT permite uso comercial, pero el usuario debe verificar las licencias de los modelos fuente y destino (`nemotron-1b-free` y `te3-small`) para asegurar el cumplimiento.
- No se han publicado evaluaciones de robustez ante ruido o adversarial examples en los embeddings de entrada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/QuerynAi/queryn-adapter-nemotron-1b-free_to_te3-small
- Colección de adaptadores de QuerynAi: https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4
- Página de NVIDIA Nemotron (modelo fuente): https://developer.nvidia.com/topics/ai/nemotron
- Página de NVIDIA Nemotron AI: https://nemotron-ai.com/
