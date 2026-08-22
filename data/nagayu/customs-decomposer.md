# NagaYu/customs-decomposer

## Resumen

`customs-decomposer` es un modelo de clasificación de tokens (span tagging) de tamaño reducido, desarrollado por NagaYu (Yuta Nagao) como componente del prototipo de investigación **Customs**, un sistema de minimización de datos personales en el borde. Su función es etiquetar los tramos de texto que contienen información personal (PII) dentro de una petición, para que el dispositivo decida qué cláusulas pueden cruzar el límite de confianza y cuáles deben quedarse en local.

El modelo es un transformer encoder de nivel de palabra con 347.167 parámetros, dos capas, cuatro cabezas de atención y una ventana de contexto de 128 tokens. Se distribuye en formato `safetensors`, `mlx` y `gguf` bajo licencia Apache 2.0 y está entrenado exclusivamente con datos sintéticos generados por el propio proyecto, sin ningún dato personal real. Su interés técnico reside en que resuelve un problema posicional: la misma cadena de texto puede ser personal o pública según el contexto (por ejemplo, la ciudad de residencia frente a un destino de viaje), algo que un gazetteer o una consulta a un almacén personal no pueden distinguir por sí solos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | customs-span-tagger (transformer encoder word-level con embeddings de palabra y posiciones aprendidas, pre-norm, head lineal sobre 31 etiquetas BIO) |
| Parametros totales | 347.167 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | GGUF (contenedor para la arquitectura propia, no compatible con runtimes de propósito general) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, mlx, gguf |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer compacto con `d_model` de 128, 2 capas, 4 cabezas de atención y feed-forward de ancho 256. El vocabulario se construye a partir del corpus sintético y contiene 481 tokens. Una innovación relevante es el mecanismo de *shape backoff*: los tokens no vistos durante el entrenamiento se representan mediante una clave de forma de caracteres (por ejemplo, `AC-19384756` → `<shape:A-d>`), lo que da al modelo capacidad de reconocer identificadores, números de cuenta o teléfonos generados de nuevo sin necesidad de memorizarlos. La salida es un head lineal sobre 31 etiquetas BIO derivadas de `customs.types.DataClass`.

El entrenamiento se realizó sobre un conjunto sintético generado por `scripts/build_bench.py`, compuesto por 1.440 peticiones de 60 perfiles ficticios, dividido en 1.080 para entrenamiento y 360 para validación, cortado por perfil (no por petición) para evitar que el modelo memorice cadenas de un perfil concreto. Se ejecutaron 1.500 pasos en unos 34 segundos. No se utilizó ningún checkpoint ni tokenizer preentrenado, y no se descargó ningún dataset externo. El informe de entrenamiento reporta F1, precisión y recall de 1,0000 tanto en train como en validación, pero sobre datos sintéticos generados por plantillas.

## Capacidades

- Detección de tramos personales (PII) en texto: identifica ciudades de residencia, medicamentos, condiciones médicas, nombres, empleadores, identificadores de cuenta, correos electrónicos, teléfonos y identificadores de dispositivo.
- Distinción contextual de la misma cadena: decide si un valor es personal o público según la oración (por ejemplo, ciudad de residencia frente a destino de viaje).
- Robustez ante tokens no vistos mediante *shape backoff*: puede etiquetar números de cuenta o identificadores que no han aparecido en el entrenamiento.
- Integración con el protocolo `Detector` del prototipo Customs, permitiendo su uso directo en el `SemanticDecomposer` para minimización de datos.
- Emisión de claves derivadas (derived keys) en lugar de valores personales, reduciendo el volumen de contenido personal que cruza el límite de confianza.
- No es un modelo de generación de texto; es exclusivamente un clasificador de tokens (pipeline `token-classification`).

## Casos de uso

- **Minimización de datos en el dispositivo**: en un asistente personal que procesa peticiones en el propio teléfono, el modelo etiqueta los tramos personales para que el sistema decida qué cláusulas pueden enviarse a un servicio remoto y cuáles deben permanecer en el dispositivo, reduciendo la superficie de exposición de datos.
- **Anonimización de logs de soporte**: antes de enviar logs de depuración a un servidor central, el modelo detecta y reemplaza identificadores personales por claves derivadas, permitiendo conservar utilidad analítica sin exponer datos crudos.
- **Control de egress en aplicaciones de salud**: en una app de seguimiento de medicación, el modelo identifica nombres de fármacos y condiciones médicas para que las consultas remotas solo transmitan la información no sensible, cumpliendo con políticas de privacidad por diseño.
- **Filtrado de PII en datos de telemetría**: en un sistema de telemetría de dispositivos IoT, el modelo detecta identificadores de dispositivo y números de cuenta para evitar que crucen el límite de confianza, registrando en un certificado de salida qué contenido ha sido retenido.
- **Investigación en privacidad y seguridad**: como componente de un prototipo académico, sirve para evaluar el impacto de la descomposición semántica en el comportamiento de agentes de IA, tal como se describe en el trabajo de ICML sobre seguridad de agentes frente a tareas descompuestas.
- **Prueba de concepto de privacidad por diseño**: en un proyecto de arquitectura de software, el modelo demuestra cómo un detector pequeño y entrenado sintéticamente puede integrarse en un sistema de descomposición de datos sin depender de servicios externos de detección de PII.

## Benchmarks y rendimiento

El autor publica resultados en su informe de entrenamiento (`train_report.json`), pero es crucial señalar que se trata de datos sintéticos generados por plantillas, no de benchmarks estándar de PII ni de datos reales.

| Metrica | Train | Val |
|---|---|---|
| Precision | 1,0000 | 1,0000 |
| Recall | 1,0000 | 1,0000 |
| F1 | 1,0000 | 1,0000 |
| Value recall | 1,0000 | 1,0000 |
| N gold | 2.430 | 810 |
| N pred | 2.430 | 810 |

Además, el autor reporta un `held_out_check` con cobertura de 72/72 (tasa 1,0000). No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GLUE, porque no es un modelo de generación o razonamiento general. El propio autor advierte explícitamente que "el rendimiento en un mundo ficticio no es evidencia de rendimiento de detección de PII en el mundo real".

## Requisitos de hardware

- **VRAM estimada**: el modelo tiene solo 347.167 parámetros. En FP32 ocupa aproximadamente 1,4 MB; en FP16, unos 0,7 MB. Cabe en cualquier dispositivo, incluso en microcontroladores con suficiente RAM.
- **GPU recomendadas**: ninguna específica. Funciona en cualquier GPU consumer (RTX 3060, 4090) y también en CPU sin problema.
- **Dispositivos de borde**: el formato `mlx` está preparado para Apple Silicon; el `gguf` es un contenedor de la arquitectura propia, no compatible con runtimes de propósito general como llama.cpp u Ollama.
- **Opciones de despliegue**: la carga se realiza mediante la clase `SpanTagger` de la librería `customs` (Python). También puede cargarse con `safetensors` y ejecutarse con PyTorch. No es compatible con vLLM ni TGI por su arquitectura no estándar.
- **Latencia**: no se publican datos de latencia, pero con 2 capas y 128 tokens de contexto, la inferencia en CPU se estima en el orden de milisegundos.

## Comparativa con modelos similares

No hay modelos comparables de la misma categoría (span tagger de 347K parámetros para detección de PII con entrenamiento sintético) en la información disponible. Los sistemas de detección de PII comerciales o académicos habituales (por ejemplo, Presidio de Microsoft o modelos basados en BERT para NER) tienen órdenes de magnitud mayores de parámetros y se entrenan con datos reales o mixtos. No se dispone de datos de comparación directa.

## Limitaciones y advertencias

- **Entrenamiento sintético**: el modelo está entrenado exclusivamente con texto generado por plantillas. La diversidad superficial está muy por debajo de la escritura real de usuarios, y el conjunto de etiquetas es una taxonomía cerrada definida en `customs/types.py`.
- **Rendimiento real no probado**: el F1 de 1,0 se obtiene sobre el propio corpus sintético. No hay evidencia de que funcione en el mundo real con PII real; el autor lo advierte explícitamente.
- **Vocabulario específico**: el vocabulario es específico del corpus. Las palabras fuera del mundo del modelo solo llegan a través del *shape backoff*, lo que puede reducir la precisión en texto real.
- **Formato GGUF no estándar**: el archivo GGUF es un contenedor para la arquitectura propia de Customs, no es un drop-in para runtimes de propósito general. No se puede cargar en llama.cpp u Ollama tal cual.
- **No es un modelo de privacidad completo**: la minimización de datos no equivale a privacidad total. Las claves derivadas son informativas (un código de país o un rango de edad no es nada). La propiedad de seguridad del sistema depende del `SemanticDecomposer` completo, no solo de este modelo.
- **Uso comercial**: licencia Apache 2.0 permite uso comercial, pero la utilidad en producción no está demostrada y el autor no lo recomienda para PII real sin validación adicional.
- **Idioma**: solo inglés. No hay soporte para otros idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NagaYu/customs-decomposer
- Perfil del autor en Hugging Face: https://huggingface.co/NagaYu
- Paper relacionado (ICML 2026): "Hidden in Plain Sight: Benchmarking Agent Safety Against Decomposition" — https://icml.cc/virtual/2026/77946
- Versión PDF del paper: https://arxiv.org/pdf/2606.13994
- Proyecto Stemma (del mismo autor, no relacionado directamente): https://github.com/NagaYu/stemma

No se han encontrado otros repositorios, blogs o demos adicionales en la búsqueda web.
