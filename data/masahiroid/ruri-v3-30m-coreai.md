# masahiroid/ruri-v3-30m-coreai

## Resumen

ruri-v3-30m-coreai es una conversión no oficial del modelo de embeddings de texto japonés cl-nagoya/ruri-v3-30m al formato Core AI de Apple, el runtime de IA en dispositivo que sucede a Core ML en iOS y macOS 27 en adelante. Lo publica el desarrollador independiente masahiroid y su objetivo es permitir la inferencia de embeddings de frases directamente en el Neural Engine o la GPU de dispositivos Apple, sin depender de servidores externos.

El modelo subyacente es un ModernBERT-Ja de 10 capas y dimensión oculta 256, entrenado originalmente por la Universidad de Nagoya (cl-nagoya) para similitud semántica y recuperación de información en japonés, con soporte secundario de inglés. La conversión reescribe la arquitectura desde cero para adaptarla al layout BC1S (Batch, Channel, 1, Sequence) y a las proyecciones Conv2d que exige el Neural Engine, manteniendo precisión float16.

Es relevante porque demuestra un flujo práctico de despliegue de modelos de embeddings en hardware Apple consumer, con tres longitudes de secuencia fijas (128, 256 y 512 tokens) y una fidelidad numérica verificada frente a la referencia en PyTorch fp32 (similitud coseno en torno a 1,0002-1,0005). El repositorio ocupa 0,2 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT-Ja (transformer encoder, atención alterna full/sliding-window) |
| Parámetros totales | no disponible (modelo base de 30M según nomenclatura) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 128, 256 o 512 tokens (tres variantes fijas empaquetadas) |
| Tipos de cuantización | float16 (pesos en fp16; el autor advierte de un pitfall con dtype fp32) |
| Idiomas soportados | japonés (ja), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.aimodel` (Core AI), con implementación en `ruri_ane.py` |

## Arquitectura y entrenamiento

La arquitectura es un encoder ModernBERT-Ja de 10 capas con dimensión oculta 256, que emplea atención alterna entre ventana completa y ventana deslizante, con un theta de RoPE específico por variante y una ventana bidireccional de radio 65. La conversión a Core AI reescribe el modelo para el Neural Engine usando layout BC1S, proyecciones Conv2d y atención explícita por cabeza, siguiendo el mismo enfoque que la conversión hermana ruri-v3-130m-coreai.

No se dispone de información sobre el dataset de entrenamiento original, el número de tokens ni si hubo fases de RLHF o DPO; esos detalles corresponden al modelo base cl-nagoya/ruri-v3-30m y no se incluyen en la model card de esta conversión. La innovación técnica destacable es la reescritura completa para el runtime Core AI con validación tanto en Neural Engine como en GPU, y la inclusión de tres grafos de longitud fija para evitar recompilaciones en dispositivo.

## Capacidades

- Generación de embeddings de frases L2-normalizados de dimensión 256 para similitud semántica.
- Extracción de características (feature extraction) para tareas de recuperación y clasificación.
- Esquema de prefijos "1+3": cadena vacía para similitud general, `トピック: ` para clasificación y clustering, `検索クエリ: ` para el lado de consulta en recuperación y `検索文書: ` para el lado de documento.
- Soporte bilingüe japonés-inglés.
- Ejecución en dispositivo en Neural Engine y GPU de Apple (iOS/macOS 27+).
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de visión o audio; es un modelo puramente de embeddings de texto.

## Casos de uso

- Búsqueda semántica en japonés: indexar documentos con el prefijo `検索文書: ` y consultar con `検索クエリ: ` para recuperar pasajes relevantes mediante similitud coseno, todo en dispositivo.
- Clasificación y clustering de textos: usar el prefijo `トピック: ` para agrupar documentos por temática en aplicaciones de notas o correo sin enviar datos a la nube.
- Deduplicación y detección de near-duplicates: comparar embeddings de registros para identificar contenido repetido en bases de datos locales.
- Reranking local: combinar el modelo con un reranker (como se muestra en la demo Ruri Atlas) para reordenar resultados de búsqueda en el dispositivo.
- Aplicaciones iOS/macOS con privacidad estricta: al ejecutarse en Neural Engine, los textos del usuario nunca salen del dispositivo, lo que encaja con requisitos de RGPD o datos sensibles.
- Detección de prompt injection en pipelines de RAG: la demo Ruri Atlas ilustra cómo visualizar dónde cae un texto malicioso en el espacio de embeddings para filtrarlo antes de la generación.
- Prototipado rápido de sistemas de recomendación de contenido textual en japonés con latencia baja y sin coste de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, JMTEB, etc.) en la información disponible. La model card solo reporta fidelidad numérica frente a la referencia PyTorch fp32:

| Objetivo | seq128 | seq256 | seq512 |
|---|---|---|---|
| Especialización GPU | 1,000261 | 1,0002749 | 1,000269 |
| Especialización Neural Engine | 1,0004714 | 1,0004714 | 1,0002223 |

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en memoria unificada de dispositivos Apple. El repositorio ocupa 0,2 GB y los pesos están en float16.
- GPU recomendadas: cualquier chip Apple con Neural Engine o GPU compatible con Core AI (iOS/macOS 27+); no se especifican modelos concretos de A-series o M-series.
- Cabe en hardware consumer: sí, por su tamaño reducido (modelo de 30M de parámetros) y su naturaleza on-device.
- Opciones de despliegue: runtime `coreai.runtime` (paquete `coreai-core==1.0.0b3`) con `AIModel.load` y selección de `ComputeUnitKind.gpu()` o `ComputeUnitKind.neural_engine()`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ruri-v3-30m-coreai | no disponible (base 30M) | 128/256/512 fijos | ja, en | Apache 2.0 | `.aimodel` (Core AI) |
| cl-nagoya/ruri-v3-30m | 30M (según nomenclatura) | no disponible | ja, en | Apache 2.0 | safetensors (PyTorch) |
| masahiroid/ruri-v3-130m-coreai | no disponible (base 130M) | no disponible | ja, en | no disponible | `.aimodel` (Core AI) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Es una conversión no oficial; el crédito y la responsabilidad del modelo original recaen en el equipo de cl-nagoya / Universidad de Nagoya.
- El modelo está optimizado para japonés; el soporte de inglés es secundario y no se detalla su calidad.
- Longitudes de secuencia fijas (128, 256 o 512); hay que igualar `max_length` al grafo cargado, lo que limita flexibilidad.
- El autor advierte de un pitfall con el dtype fp32 en los pesos; usar float16 es el camino validado.
- Riesgo de alucinación no aplica directamente (no genera texto), pero los embeddings pueden producir similitudes engañosas en dominios fuera de distribución.
- No se documentan sesgos específicos del modelo base en esta conversión.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base cl-nagoya/ruri-v3-30m.
- Requiere iOS/macOS 27+ y el runtime Core AI en versión beta (`coreai-core==1.0.0b3`), lo que implica inmadurez de tooling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masahiroid/ruri-v3-30m-coreai
- Modelo base: https://huggingface.co/cl-nagoya/ruri-v3-30m
- Conversión hermana 130M: https://huggingface.co/masahiroid/ruri-v3-130m-coreai
- Demo Ruri Atlas: https://huggingface.co/spaces/masahiroid/ruri-atlas
- Documentación Core AI de Apple: https://developer.apple.com/documentation/coreai
- Herramienta de auditoría: https://github.com/masahiroid/model-audit-lite
