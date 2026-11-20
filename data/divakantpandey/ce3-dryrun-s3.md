# divakantpandey/ce3-dryrun-s3

## Resumen

`ce3-dryrun-s3` es un artefacto de prueba de pipeline publicado por el usuario divakantpandey en Hugging Face. Se trata de un fine-tune de destilación de pocos pasos sobre el modelo base `Alibaba-NLP/gte-modernbert-base`, generado durante una ejecución de prueba (dry-run) del proyecto code-embed-v3 el 31 de octubre de 2026. Su propósito es verificar que el código del pipeline funciona a escala reducida antes de lanzar ejecuciones con coste real, no servir como modelo utilizable.

El modelo hereda la arquitectura ModernBERT del base y está empaquetado para su uso con la librería `sentence-transformers`, orientado a la generación de embeddings de frases y código. Cuenta con 149.014.272 parámetros y un repositorio de 2,4 GB. La model card advierte explícitamente que fue entrenado con muy pocos datos y que no debe emplearse para búsqueda de código.

Su relevancia es exclusivamente metodológica: forma parte del conjunto de artefactos públicos del paper *Does Execution-Verified Near-Miss Training Teach Code Embeddings to Prefer Working Code? A Negative Result*, y se publica por coherencia con la política de transparencia del proyecto. Para cualquier uso práctico, el autor remite al modelo base `gte-modernbert-base`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), segun el modelo base |
| Parametros totales | 149.014.272 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del encoder `Alibaba-NLP/gte-modernbert-base`, que emplea la arquitectura ModernBERT: un transformer encoder con atención de tipo full y local alternada, pensado para tareas de representación de texto y recuperación. El artefacto se distribuye con la librería `sentence-transformers`, lo que implica que produce embeddings de frase listos para similitud coseno o búsqueda vectorial.

El entrenamiento corresponde a la etapa de destilación de una ejecución de prueba: se destiló a partir de las puntuaciones de un modelo profesor durante un número reducido de pasos y con un volumen de datos muy inferior al necesario para obtener un modelo funcional. La model card indica que se trata de un dry-run que ejecuta cada paso del pipeline a tamaño mínimo para validar el código antes de una ejecución con coste. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. El modelo forma parte del estudio sobre entrenamiento con near-misses verificados por ejecución, cuyos modelos principales son `code-embed-v3-150m-ft-behaviour` y `code-embed-v3-150m-ft-control`.

## Capacidades

- Generación de embeddings de texto y código mediante `sentence-transformers`, heredando la funcionalidad del base `gte-modernbert-base`.
- Tareas de similitud semántica y recuperación de información a nivel de representación vectorial.
- Capacidad multilingüe: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible; es un modelo de embeddings, no generativo.
- Soporte de agentes o razonamiento multi-paso: no disponible; no aplica a este tipo de modelo.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Advertencia del autor: no debe usarse para búsqueda de código, ya que el entrenamiento fue insuficiente para ser útil.

## Casos de uso

- Validación de pipelines de destilación: el modelo sirve como artefacto de prueba para comprobar que cada etapa del pipeline (carga de datos, destilación, serialización, publicación) se ejecuta sin errores antes de una ejecución con coste real.
- Pruebas de integración con `sentence-transformers`: permite verificar que el código de carga y generación de embeddings funciona con un checkpoint real de tamaño reducido.
- Reproducibilidad de investigación: forma parte del conjunto de artefactos públicos del paper sobre near-miss training, útil para auditar el proceso experimental.
- Pruebas de CI/CD en proyectos de embeddings: puede usarse como checkpoint ficticio en tests automatizados que validen el empaquetado y la subida de modelos.
- Docencia y demostración de flujos de destilación: ejemplifica la estructura de un artefacto intermedio de un pipeline de fine-tune.
- No se recomienda su uso en producción, búsqueda de código ni sistemas de recuperación reales, tal como indica el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,6 GB solo para pesos (149 M de parámetros), más overhead de activaciones y del tokenizador.
- VRAM estimada en fp16/bf16: aproximadamente 0,3 GB para pesos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; también CPU para inferencia a pequeña escala.
- Cabe en GPU consumer sin problemas, dado el tamaño reducido del modelo.
- Opciones de despliegue: `sentence-transformers` (nativo), y potencialmente `vLLM`, `TGI` u `Ollama` si se convierte a los formatos soportados, aunque no se documenta compatibilidad explícita.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Uso previsto |
|---|---|---|---|---|---|
| ce3-dryrun-s3 | 149 M | no disponible | Apache 2.0 | Hugging Face | Artefacto de prueba de pipeline |
| Alibaba-NLP/gte-modernbert-base | no disponible en la informacion | no disponible | no disponible en la informacion | Hugging Face | Embeddings de texto/código para producción |
| code-embed-v3-150m-ft-behaviour | no disponible en la informacion | no disponible | no disponible en la informacion | Hugging Face | Modelo principal del paper (near-miss training) |
| code-embed-v3-150m-ft-control | no disponible en la informacion | no disponible | no disponible en la informacion | Hugging Face | Modelo de control del paper |

## Limitaciones y advertencias

- El autor advierte explícitamente que es un artefacto de prueba y que no debe usarse para búsqueda de código.
- Entrenado con un volumen de datos muy inferior al necesario; su calidad como modelo de embeddings es prácticamente nula.
- No se dispone de información sobre sesgos, idiomas soportados ni comportamiento en dominios específicos.
- Riesgo de alucinación no aplica directamente al ser un modelo de embeddings, pero sus representaciones pueden ser arbitrarias y no reflejar similitud semántica real.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero su falta de utilidad práctica desaconseja cualquier despliegue en producción.
- No hay datos publicados de benchmarks, por lo que no es posible evaluar su rendimiento de forma objetiva.
- La fecha de creación (2026-10-31) y actualización (2026-11-20) figuran como tales en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divakantpandey/ce3-dryrun-s3
- Modelo base: https://huggingface.co/Alibaba-NLP/gte-modernbert-base
- Modelo principal del paper (behaviour): https://huggingface.co/divakantpandey/code-embed-v3-150m-ft-behaviour
- Modelo de control del paper: https://huggingface.co/divakantpandey/code-embed-v3-150m-ft-control
- Código y registro de investigación: https://github.com/divakantpandey/code-embed-v3
