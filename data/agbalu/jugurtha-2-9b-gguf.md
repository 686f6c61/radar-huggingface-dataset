# agbalu/Jugurtha-2-9B-GGUF

## Resumen

Jugurtha-2-9B (GGUF) es la versión cuantizada en formato GGUF de Jugurtha-2-9B, un modelo fundacional "soberano" de segunda generación desarrollado por agbalu, orientado a la lengua kabyle (Taqbaylit, `kab`, escritura latina). El modelo base tiene 9.197.093.888 parámetros (aproximadamente 8,95B según el autor) e incorpora razonamiento de cadena de pensamiento (chain-of-thought) nativo en kabyle, con un modo "thinking" que puede activarse o desactivarse en tiempo de ejecución.

Su relevancia radica en la escasez de modelos generativos de calidad para las lenguas bereberes (amazigh): Jugurtha-2 aborda directamente ese hueco ofreciendo un modelo conversacional trilingüe (kabyle, inglés y francés) que funciona en hardware de consumo. Los archivos GGUF incluyen el system prompt soberano en kabyle incrustado en los metadatos, de modo que herramientas como LM Studio y Ollama lo aplican automáticamente sin configuración adicional.

El repositorio pesa 34,5 GB y ofrece cinco cuantizaciones, desde Q3_K_M (~4,5 GB) hasta Q8_0 (~9,7 GB), optimizadas para GPUs de consumo, Apple Silicon, LM Studio, Ollama y llama.cpp. Está publicado bajo licencia Apache-2.0, lo que permite su uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (causal-lm); detalles internos no disponibles |
| Parametros totales | 9.197.093.888 (dato safetensors) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q3_K_M (~4,5 GB), Q4_K_M (~5,5 GB), Q5_K_M (~6,6 GB), Q6_K (~7,6 GB), Q8_0 (~9,7 GB) |
| Idiomas soportados | Kabyle (Taqbaylit, `kab`), inglés (`en`), francés (`fr`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (los pesos BF16 originales están en el repositorio base agbalu/Jugurtha-2-9B) |

## Arquitectura y entrenamiento

La información disponible indica que se trata de un modelo de lenguaje causal (causal-lm) de tipo transformer, con capacidades de razonamiento nativo mediante trazas `<think>...</think>` en kabyle, un patrón habitual en modelos entrenados con datos de cadena de pensamiento. Utiliza la plantilla de chat ChatML (`<|im_start|>` / `<|im_end|>`), como se deduce de los ejemplos de uso con llama.cpp. No se ha publicado información sobre el número de tokens de entrenamiento, la composición del corpus, ni el uso de técnicas como RLHF o DPO.

Cada archivo GGUF incorpora el "system prompt soberano" completo en su cabecera de metadatos, lo que garantiza un comportamiento conversacional consistente en kabyle sin intervención del usuario. No se han documentado innovaciones técnicas adicionales como decodificación especulativa o atención lineal; para los detalles técnicos completos y las evaluaciones (FLORES+, SIB-200, BPC), el autor remite al repositorio principal agbalu/Jugurtha-2-9B.

## Capacidades

- Generación de texto conversacional en kabyle (Taqbaylit, escritura latina), con inglés y francés como idiomas adicionales.
- Razonamiento de cadena de pensamiento (chain-of-thought) nativo en kabyle, mediante trazas internas dentro de etiquetas `<think>...</think>`.
- Modo "thinking" conmutable en tiempo de ejecución: respuestas directas (thinking off) o deliberación detallada (thinking on), controlable desde Ollama (`--think=true/false`, `/set think`, `/set nothink`) y LM Studio.
- Compatibilidad con el ecosistema GGUF: Ollama, LM Studio y llama.cpp, con descarga directa desde Hugging Face Hub en Ollama.
- System prompt soberano en kabyle preconfigurado, aplicado automáticamente por las herramientas compatibles.
- Etiquetado como modelo conversacional (pipeline text-generation, tag `conversational`).
- No se ha documentado soporte de tool calling, function calling, visión ni audio en la información disponible.

## Casos de uso

- Generación de contenido en kabyle: redacción de artículos, entradas de blog o material divulgativo en Taqbaylit, un idioma con muy poca oferta de modelos generativos; el modo Q5_K_M se recomienda para tareas con matices lingüísticos.
- Asistente conversacional local en kabyle: despliegue en LM Studio u Ollama en un portátil de consumo, con el system prompt soberano ya preconfigurado, útil para comunidades de habla kabyle sin depender de servicios en la nube.
- Razonamiento paso a paso y resolución de problemas: con el modo thinking activado, el modelo genera deliberación interna en kabyle antes de responder, adecuado para aritmética y tareas analíticas (por ejemplo, cálculos como "25 x 4" mostrados en los ejemplos del autor).
- Traducción y trabajo multilingüe kabyle-inglés-francés: apoyo a la traducción y comprensión entre el kabyle y las dos lenguas coloniales/administrativas más presentes en Cabilia; el autor referencia evaluaciones FLORES+ en el repositorio principal.
- Educación y preservación lingüística: generación de ejercicios, explicaciones y material didáctico en kabyle para proyectos de revitalización del amazigh, aprovechando la licencia Apache-2.0 para productos educativos comerciales.
- Inferencia en dispositivos de recursos limitados: la cuantización Q3_K_M (~4,5 GB) está diseñada específicamente para portátiles modestos, dispositivos edge y entornos móviles.
- Prototipado de aplicaciones soberanas de IA: el tag "sovereign-ai" y la integración directa con Ollama permiten montar demos y MVPs de chatbot en kabyle en minutos, sin gestión manual de archivos.

## Benchmarks y rendimiento

La model card de esta versión GGUF no incluye puntuaciones de benchmarks; remite al repositorio principal (agbalu/Jugurtha-2-9B) para los resultados de FLORES+, SIB-200 y BPC (bits per character), sin publicar los valores numéricos en la información disponible. El autor afirma que la cuantización Q6_K es "virtualmente indistinguible del BF16" y que Q8_0 coincide "bit a bit" con la precisión completa en sus benchmarks lingüísticos, pero no se han facilitado las cifras concretas.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (según cuantización, sin contar KV cache):
  - Q3_K_M: ~4,5 GB
  - Q4_K_M: ~5,5 GB
  - Q5_K_M: ~6,6 GB
  - Q6_K: ~7,6 GB
  - Q8_0: ~9,7 GB
- GPUs recomendadas: cualquier GPU de consumo con 6 GB de VRAM o más puede ejecutar Q4_K_M con descarga completa de capas (`-ngl 99`); por ejemplo, RTX 3060 de 12 GB, RTX 4060 Ti de 8/16 GB o RTX 4090 ejecutan todas las cuantizaciones sin problema.
- Consumer GPUs y Apple Silicon: el repositorio está explícitamente optimizado para GPUs de consumo y Apple Silicon (Mac con memoria unificada de 8 GB en adelante para Q3_K_M/Q4_K_M; 16 GB para cuantizaciones altas).
- CPU: viable en máquinas con 8-16 GB de RAM usando Q3_K_M o Q4_K_M; el ejemplo del autor usa 8 hilos (`-t 8`).
- Despliegue: Ollama (descarga directa desde `hf.co/agbalu/Jugurtha-2-9B-GGUF`), LM Studio y llama.cpp (`llama-cli`). No se menciona vLLM ni TGI (GGUF no es su formato nativo).
- Latencia y throughput: no disponibles; el autor indica que con GPU Offload al máximo en LM Studio se obtiene el mayor throughput de tokens, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas principales | Razonamiento thinking | Licencia | Disponibilidad GGUF |
|---|---|---|---|---|---|
| Jugurtha-2-9B (GGUF) | 9,2B | Kabyle, inglés, francés | Sí, nativo en kabyle | Apache-2.0 | Sí (Q3 a Q8_0) |
| Qwen3-8B | 8,2B | Multilingüe (100+ idiomas, kabyle con cobertura muy limitada) | Sí, hibrido thinking | Apache-2.0 | Sí |
| Gemma 3 9B (Google) | 9B (4B activos aprox. no confirmado) | Multilingüe (140+ idiomas, kabyle no garantizado) | Parcial | Gemma license (restricciones) | Sí |
| Llama 3.1 8B (Meta) | 8B | Multilingüe (8 idiomas oficiales, sin kabyle) | No nativo | Llama Community License (restricciones) | Sí |

La principal diferencia competitiva de Jugurtha-2 no es el tamaño sino la especialización: ninguno de los modelos generalistas anteriores ofrece rendimiento nativo garantizado en kabyle ni trazas de razonamiento en esa lengua, y a diferencia de Gemma 3 y Llama 3.1, su licencia Apache-2.0 no impone restricciones de uso.

## Limitaciones y advertencias

- Alcance lingüístico limitado: el modelo está optimizado para kabyle (Taqbaylit); su rendimiento en otras variantes bereberes (tamazight del Atlas, tashelhit, tarifit) no está documentado, pese a los tags "berber" y "amazigh".
- Riesgo de alucinación elevado en idiomas de baja densidad de datos: no se han publicado evaluaciones de factualidad, y los modelos para lenguas de bajos recursos tienden a alucinar más en contenido factual y en idiomas distintos al principal.
- Sesgos: no se ha documentado ningún análisis de sesgos; el corpus de entrenamiento no es público, por lo que se desconoce su composición y posibles sesgos culturales o de género.
- Longitud de contexto no publicada: no se puede planificar el uso con documentos largos sin verificarlo empíricamente.
- Sin capacidades documentadas de tool calling, agentes, visión ni audio.
- Datos de benchmarks no públicos en esta ficha: las afirmaciones del autor sobre Q6_K/Q8_0 frente a BF16 no pueden verificarse con las cifras proporcionadas.
- Proyecto de autor individual con métricas de adopción muy bajas (292 descargas, 0 likes en el momento de la ficha): conviene validar la calidad en producción con pruebas propias antes de desplegar.
- Licencia Apache-2.0 sin restricciones comerciales conocidas, aunque no se incluye aviso de uso aceptable específico.

## Enlaces

- Repositorio GGUF: https://huggingface.co/agbalu/Jugurtha-2-9B-GGUF
- Repositorio principal (pesos BF16 y evaluaciones completas): https://huggingface.co/agbalu/Jugurtha-2-9B
- No se han encontrado enlaces adicionales (papers, blogs, demos) en la informacion disponible.
