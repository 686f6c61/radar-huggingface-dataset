# birgermoell/ting-9b

## Resumen

Ting 9B es un modelo de lenguaje de 9.094.607.872 parámetros (9B) desarrollado por birgermoell y orientado específicamente al sueco, su cultura y su sociedad. Se construye como una única ronda de ajuste supervisado (SFT) sobre el modelo base Prelude 9B de OpenEuroLLM, en su variante mid-trained a 64K de contexto (etapa 5, rama `d2`). Responde en sueco por defecto cuando se le escribe en sueco, incorpora un modo de razonamiento opcional (*thinking mode*) y es capaz de invocar herramientas.

El modelo se publica como *research preview*: el autor advierte explícitamente de que no ha sido evaluado para despliegue en producción y de que no debe usarse como fuente de hechos sin verificación. La arquitectura es la del decodificador Prelude 9B, de estilo Qwen3, con un vocabulario de 262K tokens, base RoPE de 9.000.000 y extensión YaRN ×2 hasta 128K posiciones. El ajuste se realizó con secuencias de como máximo 32.768 tokens.

Su relevancia radica en ser una de las primeras propuestas de modelo abierto con foco explícito en sueco dentro del ecosistema OpenEuroLLM, con licencia Apache 2.0, pesos completos en bf16 y cuantizaciones GGUF publicadas aparte. No se ha aplicado DPO, RL ni fusión de pesos: solo SFT e identidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Qwen3 (Prelude 9B) |
| Parametros totales | 9.094.607.872 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64K en el base; extensión YaRN ×2 hasta 128K posiciones; SFT realizado a 32.768 tokens |
| Tipos de cuantizacion | bf16 safetensors (repo principal); GGUF en `birgermoell/ting-9b-GGUF` (incluye q6_k en Ollama) |
| Idiomas soportados | sv, en, de, fr, es, it, pt, nl, da, fi, pl, cs, el, uk, ro |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) y GGUF |

## Arquitectura y entrenamiento

Ting 9B emplea la arquitectura del decodificador Prelude 9B, de tipo transformer denso estilo Qwen3, con vocabulario de 262K tokens, base RoPE de 9.000.000 y extensión YaRN ×2 hasta 128K posiciones. El modelo base fue mid-trained por OpenEuroLLM hasta 64K de contexto en la etapa 5, rama `d2` (cooldown de 300B tokens con más datos de razonamiento), y no estaba post-entrenado.

El ajuste de Ting consiste en una única ronda de SFT de 1.193 pasos sobre aproximadamente 1.14B tokens (735M supervisados), con un 44,7 % de tokens en sueco. Los datos incluyen razonamiento e instrucciones traducidos al sueco (Dolci-Think y Dolci-Instruct), instrucciones sintéticas suecas filtradas con puntuación de juez ≥ 9, datos de uso de herramientas, razonamiento multilingüe con *replay* y datos de honestidad. Todas las filas se renderizaron con la plantilla ChatML de OpenEuroLLM, se deduplicaron y se limitaron a 32.768 tokens (las filas más largas se rechazan, no se recortan). La pérdida se calcula solo sobre tokens del asistente. En las filas de razonamiento se entrena con `trace →  → answer`, con la apertura ``.
- Uso de herramientas y *function calling* (etiquetas `tool-use`, `function-calling`).
- Razonamiento multilingüe, entrenado con datos de *replay* multilingüe.
- Datos de honestidad incorporados en el SFT.
- Identidad propia: el modelo se identifica como Ting en las 24 pruebas de identidad realizadas en sueco e inglés.
- Capacidad de agentes y razonamiento multi-paso: no disponible de forma explícita en la información proporcionada.
- Visión y audio: no disponible.

## Casos de uso

- Chat en sueco de propósito general: el modelo responde en sueco por defecto cuando se le escribe en sueco, lo que lo hace adecuado para asistentes conversacionales orientados al mercado sueco sin necesidad de instrucciones de idioma.
- Razonamiento supervisado con modo de pensamiento: activando `enable_thinking=True` se obtiene una traza de razonamiento antes de la respuesta, útil para tareas de análisis que requieren pasos intermedios verificables.
- Integración de herramientas en flujos locales: las etiquetas de *tool-use* y *function-calling* permiten conectarlo a APIs y funciones externas en asistentes de escritorio o pipelines internos.
- Despliegue local en hardware de consumo: la cuantización GGUF publicada aparte (incluido q6_k en Ollama con `ollama run birgermoell/ting-9b:q6_k`) permite ejecutarlo en equipos sin GPU de centro de datos.
- Investigación sobre modelos nórdicos: al ser un *research preview* con pesos completos en bf16 y Apache 2.0, sirve como base para experimentos de ajuste fino adicional en sueco y lenguas vecinas.
- Generación de contenido multilingüe con foco nórdico: cubre sueco, danés, finés y noruego (no listado explícitamente), además de las principales lenguas europeas, para tareas de redacción y traducción asistida.
- Evaluación comparativa de SFT sobre bases OpenEuroLLM: su receta documentada (1.193 pasos, 1.14B tokens, 44,7 % sueco) permite reproducir y comparar estrategias de ajuste sobre Prelude 9B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 18,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda disponer de al menos 24 GB para contexto moderado.
- VRAM estimada con cuantización GGUF q6_k: no disponible en la información proporcionada; el repo GGUF existe pero no se detallan tamaños por cuantización.
- GPU recomendadas: no disponible de forma explícita. Por tamaño, encaja en A100 40/80 GB, H100 y RTX 4090 (24 GB) en bf16 con contexto limitado.
- ¿Cabe en GPU de consumo? Sí, en RTX 4090 (24 GB) en bf16 con contexto reducido, y previsiblemente en GPUs de 16-24 GB usando las cuantizaciones GGUF.
- Opciones de despliegue: `transformers`, vLLM, llama.cpp, Ollama (`ollama run birgermoell/ting-9b:q6_k`) y text-generation-inference (etiqueta `text-generation-inference` en el repo).
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Ting 9B | 9,09B | 64K base, YaRN ×2 a 128K; SFT a 32.768 | Apache 2.0 | Pesos bf16 + GGUF + Ollama | SFT único sobre Prelude 9B, foco sueco |
| Prelude 9B (base) | 9B | 64K en etapa 5 | Apache 2.0 | Pesos abiertos | Base sin post-entrenamiento; no conversacional |
| Modelos Qwen3 de tamano similar | no disponible | no disponible | no disponible | no disponible | Ting usa arquitectura estilo Qwen3, pero no se aportan datos comparativos |

No se dispone de resultados de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- *Research preview*: el autor indica explícitamente que no ha sido evaluado para despliegue y que no debe usarse como fuente de hechos sin verificación.
- Riesgo de alucinación: al no haber pasado por DPO ni RL, no se ha optimizado la fidelidad factual más allá de los datos de honestidad del SFT.
- Calidad más allá de 32.768 tokens: no probada; se hereda del modelo base y el autor lo señala como no testeado.
- Identidad: da la misma respuesta de una línea a "¿qué empresa te ha hecho?" porque no se le enseñó deliberadamente un fabricante; al preguntarle por sus idiomas respondió "sueco, inglés y alemán", más específico de lo que se le entrenó a decir.
- Sesgos: no se documentan sesgos conocidos en la información proporcionada; al estar entrenado mayoritariamente con datos traducidos y sintéticos, puede arrastrar sesgos de esas fuentes.
- Licencia Apache 2.0: permite uso comercial, pero el estado de *research preview* desaconseja producción sin evaluación propia.
- Modo directo: en `transformers` el modelo emite un bloque `` vacío antes de la respuesta que debe eliminarse; Ollama y llama.cpp lo ocultan.
- Idiomas: aunque la lista incluye 15 idiomas, el entrenamiento se centró en sueco (44,7 % de tokens supervisados), por lo que el rendimiento en el resto puede ser inferior.

## Enlaces

- Hugging Face (pesos completos): https://huggingface.co/birgermoell/ting-9b
- GGUF: https://huggingface.co/birgermoell/ting-9b-GGUF
- Modelo base: https://huggingface.co/marianna13/prelude-9b-midtrain-stage5-64k-step13984
- Prelude base: https://huggingface.co/openeurollm/prelude-base
- Dataset Dolci-Think traducido: https://huggingface.co/datasets/openeurollm/Dolci-Think-SFT-translated-decontaminated
- Dataset Dolci-Instruct traducido: https://huggingface.co/datasets/openeurollm/Dolci-Instruct-SFT-translated-decontaminated
- Ollama: `ollama run birgermoell/ting-9b:q6_k`
