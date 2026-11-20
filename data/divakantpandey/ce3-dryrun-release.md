# divakantpandey/ce3-dryrun-release

## Resumen

`ce3-dryrun-release` es un artefacto de prueba de pipeline publicado por el usuario divakantpandey, no un modelo destinado a uso real. Se trata de la salida de la etapa de release (`ce3 release`) de un dry-run del proyecto code-embed-v3, ejecutado el 31 de octubre de 2026. El propio autor advierte en la model card que no debe usarse para búsqueda de código y que se entrenó con una cantidad de datos muy inferior a la necesaria para resultar útil.

El modelo deriva de `Alibaba-NLP/gte-modernbert-base`, un encoder basado en la arquitectura ModernBERT orientado a la generación de embeddings. Conserva por tanto la estructura del modelo base (encoder transformer con atención eficiente y contexto extendido), pero sus pesos corresponden a un fine-tuning de prueba a escala reducida. Cuenta con 149.014.272 parámetros y un repositorio de 0,6 GB en formato safetensors.

Su relevancia es exclusivamente metodológica: forma parte del conjunto de artefactos públicos del trabajo *Does Execution-Verified Near-Miss Training Teach Code Embeddings to Prefer Working Code? A Negative Result*, y se publica por coherencia con la política del proyecto de liberar todos los artefactos de code-embed-v3. Para cualquier tarea de recuperación o búsqueda de código, el autor remite explícitamente al modelo base `gte-modernbert-base`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), heredada de `Alibaba-NLP/gte-modernbert-base` |
| Parametros totales | 149.014.272 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (configuración escrita por `ce3 release`, según la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT, tomado como base de `Alibaba-NLP/gte-modernbert-base` y sometido a un fine-tuning de tipo sentence-transformers. La model card indica que la configuración generada por la etapa de release fija una longitud de contexto de 8.192 tokens. No se detalla en la información disponible la composición del dataset, el número de tokens de entrenamiento, ni si se aplicaron técnicas de alineación como RLHF o DPO.

El entrenamiento corresponde a un dry-run: el pipeline completo de code-embed-v3 ejecutado a escala mínima para validar el código antes de una ejecución con coste real. El autor señala que los datos empleados son muy insuficientes para producir un modelo útil. El contexto de investigación del proyecto es el entrenamiento con *near-miss* verificado por ejecución para que los embeddings de código prefieran código funcional, una línea de trabajo cuyo resultado se describe como negativo en el paper asociado.

## Capacidades

- Generación de embeddings de texto y código, heredando la interfaz de sentence-transformers del modelo base.
- Codificación de secuencias de hasta 8.192 tokens según la configuración de release.
- No se documentan capacidades de generación de texto, razonamiento, tool calling ni agentes: es un modelo de embeddings, no un modelo generativo.
- No se documentan capacidades multilingües específicas para este artefacto.
- No se documentan modos especiales (thinking, visión, audio).
- Las capacidades reales de recuperación de código no son fiables: el autor desaconseja su uso para ese fin.

## Casos de uso

- Validación de pipelines de release: sirve para comprobar que la etapa `ce3 release` genera correctamente model card, prompts y configuración de 8.192 tokens antes de lanzar una ejecución con coste real.
- Pruebas de integración con sentence-transformers: permite verificar que el cargador, el tokenizador y la firma del modelo funcionan en un entorno de CI sin consumir recursos de un modelo grande.
- Reproducibilidad de investigación: permite replicar el dry-run descrito en el log de investigación R11 y R14 del repositorio del proyecto.
- Docencia y demostración de flujos MLOps: ilustra el aspecto de un artefacto intermedio de un pipeline de embeddings de código.
- Pruebas de empaquetado y distribución: útil para validar scripts de subida a Hugging Face, tamaños de repositorio y formato safetensors.
- No se recomienda ningún caso de uso en producción, y en particular no la búsqueda de código, para la que el autor remite a `gte-modernbert-base`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,6 GB solo para pesos, más activaciones; en fp16 alrededor de 0,3 GB.
- Cabe holgadamente en cualquier GPU consumer, incluidas GTX 1650, RTX 3060 y RTX 4090, así como en CPU para lotes pequeños.
- GPU recomendadas para uso real del modelo base: A100, H100 o RTX 4090 para lotes grandes; para este artefacto de prueba cualquier GPU es suficiente.
- Opciones de despliegue: sentence-transformers de forma nativa; también es posible exportarlo a ONNX o ejecutarlo con Text Embeddings Inference (TEI) si se convierte, aunque no se documenta soporte oficial.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Uso previsto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `divakantpandey/ce3-dryrun-release` | 149 M | 8.192 tokens | Artefacto de prueba de pipeline | Apache 2.0 | Hugging Face |
| `Alibaba-NLP/gte-modernbert-base` | ~149 M | contexto largo (ModernBERT) | Embeddings de texto y código en producción | Apache 2.0 | Hugging Face |
| `divakantpandey/code-embed-v3-150m-ft-behaviour` | ~150 M | no disponible | Fine-tuning experimental con near-miss verificado | no disponible | Hugging Face |
| `divakantpandey/code-embed-v3-150m-ft-control` | ~150 M | no disponible | Control experimental del mismo estudio | no disponible | Hugging Face |

## Limitaciones y advertencias

- El autor indica explícitamente que no debe usarse para búsqueda de código: el entrenamiento se realizó con datos muy insuficientes.
- Es un artefacto de dry-run, no un modelo validado; sus pesos no representan un fine-tuning completado.
- No hay información sobre sesgos, composición del dataset ni evaluación de calidad.
- No hay información sobre idiomas soportados ni comportamiento multilingüe.
- Riesgo alto de resultados de recuperación irrelevantes o aleatorios en cualquier uso real.
- La licencia Apache 2.0 permite uso comercial del artefacto, pero su calidad lo desaconseja por completo en producción.
- Cualquier despliegue debería sustituirse por `gte-modernbert-base` o por los modelos del estudio citados en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divakantpandey/ce3-dryrun-release
- Modelo base: https://huggingface.co/Alibaba-NLP/gte-modernbert-base
- Modelo experimental (behaviour): https://huggingface.co/divakantpandey/code-embed-v3-150m-ft-behaviour
- Modelo experimental (control): https://huggingface.co/divakantpandey/code-embed-v3-150m-ft-control
- Código y log de investigación: https://github.com/divakantpandey/code-embed-v3
