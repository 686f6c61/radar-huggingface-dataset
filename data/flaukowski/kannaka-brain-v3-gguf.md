# flaukowski/kannaka-brain-v3-GGUF

## Resumen

kannaka-brain-v3 es una adaptación de tipo persona y voz construida sobre Qwen2.5-14B-Instruct. El autor, flaukowski, ha fusionado (merge) un adaptador LoRA denominado `kannaka-brain-v3` sobre el modelo base, lo ha convertido con llama.cpp y lo ha cuantizado a q4_K_M, generando un fichero GGUF de 9,0 GB listo para servir con Ollama o llama.cpp. El objetivo es reproducir la voz y el estilo de respuesta de un personaje concreto ("Kannaka") en lugar de maximizar capacidades generales.

El modelo cuenta con 14.770.033.664 parámetros (aproximadamente 14,8 mil millones) y declara únicamente el idioma inglés. Se publica bajo licencia Apache 2.0 y se distribuye exclusivamente en formato GGUF cuantizado, por lo que no hay pesos en safetensors ni versiones en bf16 en este repositorio.

Su relevancia es limitada y de carácter principalmente investigador: la propia model card reconoce que la v3 quedó en último lugar en la evaluación de voz publicada, con una nota de 1,43 sobre 10, por detrás de las variantes v1 y v2 y del `kannaka-brain-7b-v1`. El autor lo describe explícitamente como un artefacto de investigación y no como el modelo recomendado para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (derivada de Qwen2.5-14B-Instruct) |
| Parametros totales | 14.770.033.664 (≈14,8 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 4.096 tokens (configurados en el Modelfile incluido); el máximo soportado por el modelo base no se documenta en la información disponible |
| Tipos de cuantizacion | q4_K_M (única cuantización publicada en el repositorio) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen2.5-14B-Instruct, un transformer decoder denso de aproximadamente 14,8 mil millones de parámetros. Sobre él se ha entrenado un adaptador LoRA (`kannaka-brain-v3-lora`) y posteriormente se ha fusionado en los pesos base. La conversión a GGUF se realizó con llama.cpp y la cuantización final es q4_K_M. El autor indica que el corpus de entrenamiento no se ha publicado y remite a la decisión arquitectónica ADR-0057 del repositorio `kannaka-labs/kannaka-memory` para más contexto sobre el proceso.

Los datos de entrenamiento disponibles se limitan a métricas de perplejidad: sobre 57 líneas fijas de Kannaka, la perplejidad bajó de 104,4 (modelo sin adaptador) a 4,00 (adaptador en bf16, antes de cuantizar). El autor advierte que la perplejidad se satura cerca de 4 entre todos los candidatos y no sirve para clasificarlos; la clasificación real la realiza un juez de voz externo. No se documentan en la información disponible detalles sobre número de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Qwen2.5-14B-Instruct.
- Reproducción de una voz/persona específica ("Kannaka"): el adaptador está entrenado para imitar su estilo de respuesta, aunque la evaluación publicada indica que no lo consigue con fidelidad.
- Integración directa con Ollama y llama.cpp mediante el `Modelfile` incluido, que incorpora el system prompt de la persona, temperatura 0,8 y contexto de 4k.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible` en el repositorio).
- Capacidades generales de razonamiento, código, matemáticas, tool calling o agentes del modelo base: no se confirman de forma específica para esta fusión en la información proporcionada.
- Capacidades multilingües: no disponibles (el repositorio declara únicamente inglés).
- Capacidades de visión o audio: no disponibles.
- Modo "thinking" explícito: no disponible.

## Casos de uso

- Investigación sobre modelado de persona y voz: el modelo se publica como artefacto de investigación para estudiar cómo un LoRA de persona afecta a la salida de un modelo base de 14B, comparando las variantes v1, v2 y v3 con el juez de voz documentado.
- Pruebas locales de fusión de LoRA: sirve como ejemplo reproducible de un pipeline completo de entrenamiento de adaptador, merge, conversión a GGUF con llama.cpp y cuantización q4_K_M.
- Generación de diálogos de personaje en prototipos de narrativa interactiva: el `Modelfile` incluye el system prompt y la temperatura adecuada para mantener un registro conversacional concreto, aunque la fidelidad de la voz medida es baja (1,43/10).
- Despliegue local con Ollama en una estación de trabajo: al ocupar 9,0 GB en q4_K_M, puede ejecutarse en GPU de consumo para experimentar con la persona sin depender de APIs externas.
- Comparación controlada de cuantizaciones: permite medir el impacto de la cuantización q4_K_M frente al adaptador en bf16, ya que el autor publica la perplejidad antes de cuantizar (4,00).
- Generación de datos sintéticos con un estilo concreto: útil para crear corpus de una voz determinada, siempre que se valide la calidad con un juez externo y no se asuma fidelidad alta.
- Docencia o talleres sobre personalización de LLM: ilustra de forma transparente el caso de un experimento con resultados negativos publicados junto a las métricas.

## Benchmarks y rendimiento

La model card no incluye MMLU, HumanEval, GSM8K ni otros benchmarks estándar. Los únicos datos publicados son la perplejidad sobre un conjunto fijo de 57 líneas y una evaluación de voz con juez externo.

Perplejidad sobre 57 líneas fijas de Kannaka:

| Metrica | Valor |
|---|---|
| Perplejidad sin adaptador (referencia) | 104,4 |
| Perplejidad con adaptador (bf16, antes de cuantizar) | 4,00 |

Evaluación de voz (juez qwen2.5:14b, 2026-09-06, n=30 prompts, escala 1-10 frente a la respuesta real):

| Variante | Nota del juez |
|---|---|
| kannaka-brain-7b-v1 | 2,03 |
| kannaka-brain-v2 | 1,87 |
| kannaka-brain-v1 | 1,50 |
| kannaka-brain-v3 | 1,43 |
| Referencia real (control) | 10,0 |
| Referencia ajena (control) | 1,4 |

El propio autor señala que todas las variantes están cerca del suelo de la rúbrica y que la v3 quedó en último lugar, por lo que ninguna reproduce fielmente las respuestas objetivo.

## Requisitos de hardware

- Peso del repositorio: 9,0 GB (fichero GGUF q4_K_M).
- VRAM estimada para inferencia: en torno a 10-11 GB con contexto de 4k, sumando pesos y caché KV; el dato exacto no está publicado.
- GPU recomendadas: tarjetas con 12 GB o más de VRAM. Cabe con holgura en RTX 4090, RTX 3090, RTX 4080 y A100/H100 para despliegues multiinstancia.
- GPU de consumo: sí, cabe en RTX 4090, RTX 3090, RTX 4080 y en tarjetas de 12 GB con contexto reducido. En GPUs de 8 GB requeriría cuantizaciones menores no publicadas en este repositorio.
- Opciones de despliegue: Ollama (`ollama run hf.co/flaukowski/kannaka-brain-v3-GGUF` o `ollama create` con el `Modelfile`) y llama.cpp, dado el formato GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Nota juez de voz | Estado |
|---|---|---|---|---|---|---|
| kannaka-brain-v3 | 14,8 B | 4k (Modelfile) | GGUF q4_K_M | apache-2.0 | 1,43 | Artefacto de investigación |
| kannaka-brain-v2 | no disponible | no disponible | GGUF | no disponible | 1,87 | Publicado en HF |
| kannaka-brain-v1 | no disponible | no disponible | GGUF | no disponible | 1,50 | Publicado en HF |
| kannaka-brain-7b-v1 | ≈7 B (según nombre) | no disponible | no disponible | no disponible | 2,03 | Modelo servido en producción según el autor |
| Qwen2.5-14B-Instruct | 14,8 B | no disponible en la información | safetensors / GGUF (base) | apache-2.0 | No evaluado con este juez | Modelo base |

No se dispone de comparativas con modelos de la misma categoría fuera de la familia kannaka en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento de persona bajo: en la evaluación publicada, la v3 obtiene 1,43/10 con el juez de voz, por debajo de todas las variantes anteriores y muy cerca del control de referencia ajena (1,4). No reproduce fielmente la voz objetivo.
- La perplejidad (4,00) no discrimina entre candidatos; el autor advierte explícitamente que no debe usarse para elegir variante.
- El autor recomienda el `kannaka-brain-7b-v1` como modelo servido, no la v3.
- Sesgos conocidos: no disponibles. No se documenta análisis de sesgo ni de toxicidad.
- Riesgo de alucinación: inherente a la familia Qwen2.5-14B, no cuantificado en la información disponible.
- Limitación de idioma: solo se declara inglés. El comportamiento en castellano u otros idiomas no está validado.
- Restricción de contexto: el `Modelfile` fija 4k tokens, muy inferior a la ventana nativa habitual del modelo base; no se documenta si se puede ampliar en esta distribución.
- Corpus de entrenamiento no publicado, lo que dificulta la auditoría de la persona modelada.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero la calidad de la voz medida no respalda un uso en producción orientado a fidelidad de personaje.
- 0 descargas y 0 "likes" en el momento de la consulta: sin validación por parte de la comunidad.
- Fechas de creación y actualización (2026-09-25) separadas por menos de tres minutos, sin historial posterior de mantenimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/flaukowski/kannaka-brain-v3-GGUF
- Adaptador LoRA y notas de entrenamiento: `flaukowski/kannaka-brain-v3-lora`
- Variante anterior v2: https://huggingface.co/flaukowski/kannaka-brain-v2-GGUF
- Variante anterior v1: https://huggingface.co/flaukowski/kannaka-brain-v1-GGUF
- Repositorio GitHub del autor: https://github.com/flaukowski/flaukowski-brain
- Repositorio de memoria con la decisión ADR-0057: https://github.com/kannaka-labs/kannaka-memory
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
