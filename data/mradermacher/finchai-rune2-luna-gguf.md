# mradermacher/FinchAI-Rune2-Luna-GGUF

## Resumen

FinchAI-Rune2-Luna es un modelo de lenguaje de 1.728.801.600 parámetros (aproximadamente 1,7 mil millones) desarrollado por el usuario whcl412, y esta ficha concreta corresponde a la versión cuantizada en formato GGUF publicada por mradermacher. El modelo base se distribuye bajo la licencia LFM Open License 1.0 y está etiquetado como especializado en tool calling, function calling y uso como agente, con soporte para chino (zh) e inglés (en). Su arquitectura se asocia a la familia LFM3 (Liquid AI Foundation Models 3), según la etiqueta `lfm3` de la model card.

El modelo resuelve el problema de disponer de un LLM compacto, orientado a agentes y llamadas a funciones, que pueda ejecutarse en hardware modesto gracias a sus cuantizaciones GGUF de entre 0,9 GB y 3,6 GB. Es relevante ahora porque la combinación de tamaño reducido, soporte de tool calling y licencia abierta (aunque con condiciones) lo hace atractivo para despliegues locales y pipelines de agentes que necesitan baja latencia y huella de memoria pequeña.

Esta ficha describe la versión GGUF de mradermacher, que es una cuantización estática del modelo base de whcl412. No se dispone de información sobre la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetada como familia LFM3; transformer presumiblemente, sin confirmar) |
| Parámetros totales | 1.728.801.600 (~1,7 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (estáticas); variantes imatrix en `FinchAI-Rune2-Luna-i1-GGUF` |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | lfm-open-license-1.0 (referencia a https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE) |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la información proporcionada. La model card lo etiqueta con `lfm3`, lo que sugiere que deriva de la familia de modelos LFM3 de Liquid AI, pero no se confirma la arquitectura exacta (transformer, híbrida o SSM). Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otros ajustes de alineamiento.

La información disponible se limita al proceso de cuantización: mradermacher ha generado cuantizaciones estáticas (sin imatrix) a partir del modelo base `whcl412/FinchAI-Rune2-Luna`, con un conjunto de tipos que van de Q2_K a f16. También se ofrecen cuantizaciones ponderadas/imatrix en un repositorio separado (`FinchAI-Rune2-Luna-i1-GGUF`). No se documentan innovaciones técnicas de arquitectura ni de decodificación.

## Capacidades

- Generación de texto conversacional en chino e inglés.
- Tool calling y function calling, según las etiquetas del modelo.
- Uso como agente y razonamiento multi-paso (etiqueta `agent`).
- Capacidades multilingües limitadas a zh y en.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido (thinking mode) en la información disponible.

## Casos de uso

- Agentes locales de automatización: el modelo puede gestionar llamadas a funciones y flujos multi-paso en entornos con recursos limitados, gracias a su tamaño de ~1,7 B y cuantizaciones de 1,2 GB (Q4_K_M) que caben en GPUs de consumo.
- Asistentes conversacionales en chino e inglés: adecuado para chatbots bilingües zh/en desplegados en local, con baja huella de memoria.
- Integración en pipelines de tool calling: puede conectarse a APIs externas mediante function calling para tareas como consultas a bases de datos o automatización de tareas.
- Prototipado rápido en investigación: su reducido tamaño permite iterar y experimentar en una sola GPU de consumo sin necesidad de infraestructura dedicada.
- Despliegue en dispositivos con poca VRAM: las cuantizaciones Q2_K (0,9 GB) y Q3_K (1,0-1,1 GB) permiten ejecución en GPUs de gama baja o incluso en CPU con llama.cpp.
- Evaluación de modelos de agentes compactos: útil como baseline ligero para comparar estrategias de tool calling frente a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre ~1 GB (Q2_K) y ~2 GB (Q8_0), con f16 en torno a ~3,6 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090 y GPUs de datacenter (A100, H100) funcionan sobradamente, aunque para este tamaño no son necesarias.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna de consumo, e incluso en CPU con cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base usa `transformers`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo en la información proporcionada, por lo que la comparación se limita a características estructurales.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| FinchAI-Rune2-Luna (esta ficha) | ~1,7 B | no disponible | zh, en | lfm-open-license-1.0 | GGUF |
| Modelos de la familia LFM3-1.7B (referencia de licencia) | ~1,7 B | no disponible | no disponible | lfm-open-license-1.0 | no disponible |
| Alternativas comparables de ~1-2 B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar rendimiento con alternativas concretas.

## Limitaciones y advertencias

- La licencia lfm-open-license-1.0 es una licencia "other" con condiciones específicas; es imprescindible revisar el texto completo antes de cualquier uso comercial.
- Solo se declaran soporte para chino e inglés; el rendimiento en castellano no está garantizado.
- No se documenta la longitud de contexto, lo que impide planificar casos de uso con ventanas largas.
- Riesgo de alucinación inherente a modelos de este tamaño; no hay datos de evaluación que lo cuantifiquen.
- No se dispone de información sobre sesgos conocidos ni sobre el proceso de alineamiento.
- El modelo es una cuantización de un modelo base de terceros; la calidad final depende tanto del modelo original como del proceso de cuantización.
- El repositorio tiene 0 likes y 664 descargas, lo que indica una adopción limitada y poca validación comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/FinchAI-Rune2-Luna-GGUF
- Modelo base: https://huggingface.co/whcl412/FinchAI-Rune2-Luna
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/FinchAI-Rune2-Luna-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#FinchAI-Rune2-Luna-GGUF
- Licencia LFM Open License 1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
