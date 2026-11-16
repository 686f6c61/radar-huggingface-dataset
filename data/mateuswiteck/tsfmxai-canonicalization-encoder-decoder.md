# mateuswiteck/tsfmxai-canonicalization-encoder-decoder

## Resumen

`tsfmxai-canonicalization-encoder-decoder` es un modelo de canonicalización de árboles de recurrencia para regresión simbólica sobre series temporales, desarrollado por el usuario de Hugging Face `mateuswiteck` como parte del proyecto `tsfmxai`. El modelo está entrenado sobre 30 millones de árboles muestreados a partir de 6 series fuente, con el objetivo de producir una ecuación canónica por cada entrada. Se distribuye en dos variantes (`transformer_skeleton` y `transformer_joint`) y separa explícitamente el codificador (`encoder.safetensors`) del decodificador (`model.safetensors`).

La relevancia del modelo es acotada y muy específica: no es un modelo de lenguaje general, sino un componente de un pipeline de descubrimiento de ecuaciones (symbolic regression) sobre datos de series temporales. La model card no documenta arquitectura detallada, número de parámetros, longitud de contexto ni idiomas, y el repositorio ocupa 0.0 GB, lo que sugiere pesos de pequeño tamaño o un empaquetado incompleto.

Se trata de un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, publicado bajo licencia CC-BY-4.0 y con trazabilidad explícita a commits concretos del repositorio de GitHub. No debe confundirse con un modelo fundacional: su función es la canonicalización estructural de expresiones, no la generación de texto libre.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (según nombre del modelo y variantes `transformer_skeleton` / `transformer_joint`); detalles no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se documenta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico; opera sobre representaciones de árboles) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (`encoder.safetensors`, `model.safetensors`) |
| Librería | PyTorch (torch 2.6.0+cu124) |
| Tamaño del repositorio | 0.0 GB |
| Datos de entrenamiento | 30.000.000 de árboles de recurrencia muestreados de 6 series fuente |
| Fecha de creación | 2026-11-12 |
| Última actualización | 2026-11-16 |

## Arquitectura y entrenamiento

El modelo se presenta como un transformer encoder-decoder orientado a la canonicalización de árboles de recurrencia. La variante `transformer_skeleton` se emplea para objetivos de solo esqueleto (sin predicción de coeficientes), mientras que `transformer_joint` se orienta a un objetivo conjunto; la model card no detalla la diferencia interna entre ambas más allá de esa descripción. El codificador se distribuye por separado en `encoder.safetensors`, y el par completo encoder-decoder en `model.safetensors`.

El entrenamiento se realizó sobre 30 millones de árboles de recurrencia muestreados a partir de 6 series fuente, generando una ecuación por entrada. La model card documenta la procedencia con hashes de commits de GitHub (`10dc8440a9` para entrenamiento y generación, `7b43b66ef7` para el código de carga), un SHA-256 de configuración (`9858ba096ab2f9a47351a9045781dccf9b00e99c3f79f8277731f87c71a15c88`) y el entorno de ejecución (Python 3.11.18, torch 2.6.0+cu124, `cuda:0`). No se documentan número de tokens, composición del dataset, ni uso de RLHF/DPO, lo cual es coherente con un modelo de regresión simbólica y no de alineamiento lingüístico.

## Capacidades

- Canonicalización de árboles de recurrencia: transforma una representación de árbol en una forma canónica, con una ecuación de salida por entrada.
- Predicción de esqueleto estructural (variante `transformer_skeleton`), sin predicción de coeficientes.
- Objetivo conjunto estructural y de coeficientes (variante `transformer_joint`), según la nomenclatura de las variantes.
- Integración con el paquete `tsfmxai` mediante la clase `CanonicalEncoder.from_pretrained((repo_id, variante), revision=commit_sha)`.
- Carga determinista por revisión (commit SHA) para reproducibilidad.
- No se documentan capacidades de generación de texto, razonamiento general, código, matemáticas, visión, tool calling, agentes ni multilingüismo.

## Casos de uso

- Descubrimiento de ecuaciones en series temporales: el modelo se usaría como etapa de canonicalización dentro de un pipeline de regresión simbólica, tomando árboles de recurrencia candidatos y normalizándolos para compararlos o deduplicarlos. Es adecuado porque su entrenamiento se basa en 30 millones de árboles muestreados de 6 series fuente.
- Deduplicación de expresiones simbólicas: al producir una forma canónica por entrada, permite agrupar árboles estructuralmente equivalentes en un repositorio de ecuaciones descubiertas, reduciendo el espacio de búsqueda en experimentos de symbolic regression.
- Preprocesado para modelos de ajuste de coeficientes: la variante `transformer_skeleton` puede emplearse para obtener solo la estructura y delegar la estimación de coeficientes a un módulo posterior, separando responsabilidades en el pipeline.
- Reproducibilidad de experimentos científicos: la carga por `commit_sha` y la verificación por hashes de los ficheros fuente permiten reproducir exactamente la canonicalización en un artículo o una auditoría interna.
- Integración en herramientas de análisis de series temporales: como componente de la librería `tsfmxai`, puede incorporarse a flujos que ya usan ese ecosistema para interpretar dinámicas de series.
- Evaluación comparativa de canonicalizadores: sirve como referencia para medir si una implementación propia de canonicalización coincide con la forma canónica aprendida por el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el repositorio ocupa 0.0 GB y no se documenta el número de parámetros).
- GPU recomendadas: no disponible; el entrenamiento se realizó en `cuda:0` con torch 2.6.0+cu124, sin especificar el modelo de GPU.
- Viabilidad en GPU de consumo: no disponible; por el tamaño del repositorio (0.0 GB) es plausible que quepa en GPU de consumo, pero no hay confirmación documentada.
- Opciones de despliegue: carga mediante la clase `CanonicalEncoder` del paquete `tsfmxai`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de canonicalización de árboles de recurrencia ni datos de rendimiento que permitan una comparación fundamentada.

## Limitaciones y advertencias

- Modelo de nicho: no es un modelo de lenguaje general; no debe esperarse generación de texto, razonamiento conversacional ni capacidades multimodales.
- Documentación incompleta: no se especifican parámetros, contexto, cuantizaciones ni composición del dataset, lo que dificulta evaluar su calidad y reproducibilidad más allá de los hashes indicados.
- Sesgos: no documentados; al entrenarse sobre solo 6 series fuente, la distribución de árboles puede estar sesgada hacia los patrones de esas series y generalizar mal a otras.
- Riesgo de alucinación estructural: puede producir canonicalizaciones incorrectas o colapsar árboles distintos en la misma forma canónica; no se documentan métricas de error.
- Idiomas: no aplica como modelo lingüístico, pero tampoco se documenta soporte multilingüe.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar al autor y mantener el aviso de licencia, y no se ofrece garantía alguna.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; sin evidencia de uso en producción ni de mantenimiento continuado.
- Dependencia del ecosistema `tsfmxai`: la carga requiere el paquete y la revisión concreta (`commit_sha`), lo que añade acoplamiento a una versión específica del código.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mateuswiteck/tsfmxai-canonicalization-encoder-decoder
- Repositorio GitHub: https://github.com/MateusWiteck/tsfmxai
- Commit de entrenamiento y generación: https://github.com/MateusWiteck/tsfmxai/commit/10dc8440a9b0003aad4b6cb8db339746a6d6da19
- Commit del código de carga: https://github.com/MateusWiteck/tsfmxai/commit/7b43b66ef7c9ee9a160cf7988052803836cdc214
