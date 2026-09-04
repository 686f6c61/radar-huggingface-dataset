# liodon-ai/Cyber-Prime-1-2.6B-FP8

# Cyber-Prime-1-2.6B-FP8

## Resumen

Cyber-Prime-1-2.6B-FP8 es una cuantización FP8 dinámica del modelo Cyber-Prime-1-2.6B, un modelo de lenguaje agéntico especializado en ciberseguridad desarrollado por el autor Akahsizrr y publicado por Liodon AI. El modelo base está construido sobre LFM2 (Liquid Foundation Model) de Liquid AI y fue entrenado con trazas de razonamiento, datasets de ciberseguridad y datos sintéticos.

Esta variante reduce el tamaño de 5,4 GB a 3,0 GB mediante el esquema FP8_DYNAMIC implementado con llm-compressor, sin necesidad de dataset de calibración. La cuantización es una conversión directa de los pesos originales, lo que evita el sesgo que introduciría un conjunto de calibración. Es relevante porque permite ejecutar un agente de ciberseguridad en GPUs con menor memoria y mantener compatibilidad con vLLM, TGI y SGLang.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. El modelo base está construido sobre LFM2 (Liquid Foundation Model) de Liquid AI; la cuantización FP8 no modifica la arquitectura original. |
| Parámetros totales | 2.697.198.592 (≈2,7B) |
| Parámetros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | FP8 (E4M3) dinámica: pesos FP8 por canal y activaciones FP8 por token en tiempo de inferencia; lm_head sin cuantizar |
| Idiomas soportados | No disponibles |
| Licencia | other (no estándar; consultar la licencia del modelo base) |
| Formato de pesos | safetensors (compatible con compressed-tensors) |

## Arquitectura y entrenamiento

La cuantización fue realizada con llm-compressor usando el esquema FP8_DYNAMIC. Los pesos se convierten a FP8 (E4M3) por canal de forma anticipada, mientras que las activaciones se cuantizan dinámicamente por token durante la inferencia. Este método no requiere dataset de calibración, por lo que no introduce sesgo de calibración. El `lm_head` se deja sin cuantizar, ya que su tamaño es despreciable pero su impacto en la calidad sería desproporcionado si se cuantizara.

El modelo base fue entrenado por Akahsizrr sobre LFM2 de Liquid AI, utilizando trazas de razonamiento, datos de ciberseguridad y datos sintéticos. No se ha documentado el uso de RLHF o DPO en la información disponible. La cuantización no altera estos aspectos del entrenamiento.

## Capacidades

- Generación de texto conversacional aplicada al dominio de la ciberseguridad.
- Razonamiento agéntico multi-step, según la descripción del autor del modelo base.
- Procesamiento de instrucciones y contextos relacionados con análisis de seguridad.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Capacidades multilingües: no especificadas en la ficha.
- Sin capacidades de visión o audio documentadas.
- Ejecución eficiente con cuantización FP8 en GPUs compatibles con compute capability ≥ 8.9.

## Casos de uso

- Análisis de logs de seguridad: el modelo puede recibir fragmentos de logs y producir un resumen de posibles indicios de compromiso. Su entrenamiento en ciberseguridad lo hace adecuado para tareas de clasificación y correlación.
- Respuesta a incidentes: puede actuar como asistente que sugiere pasos de contención y mitigación en un incidente, siempre que sus salidas sean revisadas por un analista.
- Auditoría de configuraciones: puede revisar fragmentos de configuración de sistemas o servicios y señalar prácticas inseguras o desviaciones de políticas.
- Triage de alertas del SIEM: puede preclasificar alertas según su criticidad y generar una breve justificación para priorizar la respuesta.
- Generación de informes de vulnerabilidades: puede transformar hallazgos técnicos en texto legible para gestores o equipos no técnicos.
- Automatización de hardening: con instrucciones claras, puede elaborar listas de comprobación para endurecer servidores, redes o aplicaciones.
- Integración en pipelines de agentes especializados: al ser un modelo agéntico, puede utilizarse como componente en flujos multi-paso, siempre que se valide su salida con herramientas externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el peso FP8 ocupa 3,0 GB; para inferencia con contexto corto se recomienda al menos 8 GB de VRAM para margen de activaciones y cache KV.
- GPU compatibles: NVIDIA con compute capability ≥ 8.9 (Ada/Hopper/Blackwell), incluyendo RTX 40-series, L4/L40S, H100/H200, B100/B200/GB10.
- En GPUs más antiguas, vLLM/TGI des-cuantizan el modelo y se pierde la ventaja de velocidad y memoria.
- Opciones de despliegue: vLLM, Text Generation Inference (TGI) y SGLang.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con modelos alternativos de la misma categoría. La comparación más directa es con el modelo base sin cuantizar:

| Modelo | Tamaño | Parámetros | Cuantización | Formato | Licencia |
|---|---|---|---|---|---|
| Cyber-Prime-1-2.6B (original) | 5,4 GB | ≈2,7B | Sin cuantizar | safetensors | other |
| Cyber-Prime-1-2.6B-FP8 | 3,0 GB | ≈2,7B | FP8 dinámico | safetensors | other |

La diferencia principal es la reducción de peso en 2,4 GB, manteniendo el mismo número de parámetros y la misma arquitectura.

## Limitaciones y advertencias

- Licencia registrada como `other`; no se especifican los términos exactos, por lo que debe revisarse antes de cualquier uso comercial.
- No se documentan sesgos conocidos, pero al estar entrenado específicamente en ciberseguridad, puede tener un conocimiento general limitado.
- Riesgo de alucinación inherente a los modelos de lenguaje; se recomienda supervisión humana en tareas críticas.
- No se han publicado benchmarks, por lo que el rendimiento no está validado formalmente.
- La cuantización FP8 solo aporta ventajas en hardware compatible; en GPUs antiguas el modelo se des-cuantiza y se degrada el rendimiento.
- No hay información sobre RLHF o DPO, por lo que la alineación con instrucciones no está verificada.
- Faltan especificaciones sobre longitud de contexto e idiomas soportados, lo que limita la planificación de despliegues.

## Enlaces

- https://huggingface.co/liodon-ai/Cyber-Prime-1-2.6B-FP8
- https://huggingface.co/Akahsizrr/Cyber-Prime-1-2.6B
- https://github.com/Liodon-AI
- https://x.com/RoliumGens/status/2095653202599510456
- https://github.com/vllm-project/llm-compressor
