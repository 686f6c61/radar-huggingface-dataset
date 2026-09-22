# nwtgck/LFM2.5-350M-GGUF

## Resumen

LFM2.5-350M-GGUF es la cuantización en formato GGUF del modelo LiquidAI/LFM2.5-350M, publicada por el usuario nwtgck. El modelo original lo desarrolla Liquid AI como parte de la familia LFM2 (Liquid Foundation Models, segunda generación), una línea de modelos híbridos diseñada específicamente para IA en el borde (edge AI) y despliegue en dispositivo, con foco en calidad, velocidad y eficiencia de memoria. Con 354.483.968 parámetros, se sitúa en la categoría de modelos ultracompactos, pensados para ejecutarse en CPU o en GPU de gama baja.

Este repositorio concreto no es una publicación oficial de Liquid AI, sino una conversión a GGUF mantenida por un tercero, lo que permite su uso directo con llama.cpp y toolchains compatibles. El modelo cubre ocho idiomas (inglés, árabe, chino, francés, alemán, japonés, coreano y español) y está etiquetado como conversacional.

Su relevancia actual radica en que la licencia LFM 1.0 y el tamaño reducido lo hacen candidato para inferencia local sin conexión, asistentes embebidos y prototipado rápido. La model card del repositorio es breve y remite al modelo base de Liquid AI para más detalles; no incluye especificaciones de contexto, dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida (familia LFM2 de Liquid AI; la model card la describe como "hybrid model" sin detallar la composición exacta en la información disponible) |
| Parámetros totales | 354.483.968 |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF Q4_0 en dos variantes: post-training (`LFM2.5-350M-Q4_0.gguf`) y QAD (`LFM2.5-350M-QAD-Q4_0.gguf`). No se documentan otros niveles (Q8_0, Q5_K_M, Q6_K, etc.) en la información disponible |
| Idiomas soportados | Inglés, árabe, chino, francés, alemán, japonés, coreano, español |
| Licencia | lfm1.0 (`license: other`, `license_name: lfm1.0`, con enlace al archivo LICENSE del repositorio) |
| Formato de pesos | GGUF |
| Modelo base | LiquidAI/LFM2.5-350M |
| Autor del repositorio | nwtgck (cuantización de terceros, no oficial de Liquid AI) |
| Tamaño del repositorio | 3,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación en HuggingFace | 2026-09-22 |

## Arquitectura y entrenamiento

La información proporcionada describe LFM2 como una "nueva generación de modelos híbridos" de Liquid AI, orientada a edge AI. No se detallan en la model card disponible ni el tipo exacto de capas (convolucionales, atención, mezcla de ambas), ni la composición del dataset, ni el número de tokens de entrenamiento, ni si hubo fases de RLHF o DPO. Tampoco se especifica la longitud de contexto soportada.

El único detalle técnico relevante aportado es la existencia de un checkpoint QAD (Quantization-Aware Distillation), distribuido como `LFM2.5-350M-QAD-Q4_0.gguf`. La model card remarca que este archivo es distinto del `LFM2.5-350M-Q4_0.gguf` obtenido por cuantización posterior al entrenamiento, aunque ambos usan el formato GGUF Q4_0. La destilación con conciencia de cuantización implica que el modelo se entrenó o ajustó teniendo en cuenta el ruido introducido por la cuantización a 4 bits, lo que suele traducirse en una pérdida de calidad menor que la cuantización post-hoc.

Las instrucciones de uso recomiendan `llama-cli` con `--temp 0.1`, `--top-k 50` y `--repeat-penalty 1.05` para el modo conversación, valores que sugieren una configuración conservadora de muestreo para respuestas más deterministas.

## Capacidades

- Generación de texto conversacional en ocho idiomas: inglés, árabe, chino, francés, alemán, japonés, coreano y español.
- Ejecución local en hardware de borde mediante llama.cpp, con cuantización a 4 bits.
- Modo conversación multi-turno mediante la opción `--conversation` de `llama-cli`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de flujos de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (modo de razonamiento explícito, visión, audio): no disponible en la información proporcionada.
- Compatibilidad con endpoints: el repositorio incluye la etiqueta `endpoints_compatible`, lo que indica que puede servirse a través de infraestructura compatible con la API de HuggingFace.

## Casos de uso

- Asistentes conversacionales sin conexión: el modelo puede ejecutarse íntegramente en local con llama.cpp en una CPU moderna o en una GPU de gama baja, lo que permite construir asistentes de chat que no envían datos del usuario a ningún servidor. Es adecuado por su tamaño de 354M parámetros y su cuantización Q4_0.
- Aplicaciones móviles y de escritorio embebidas: al ocupar del orden de 200-250 MB en Q4_0, puede integrarse en aplicaciones de escritorio o móviles mediante bindings de llama.cpp, aportando generación de texto sin dependencia de red.
- Prototipado rápido y pruebas de concepto: sirve como modelo de validación en pipelines de generación de texto antes de escalar a modelos mayores, ya que el coste de descarga e inferencia es mínimo.
- Preprocesado y clasificación de texto en varios idiomas: con soporte para español, inglés, francés, alemán, chino, árabe, japonés y coreano, puede emplearse para reformatear, resumir o etiquetar documentos en aplicaciones multilingües ligeras.
- Dispositivos con recursos limitados (Raspberry Pi, SBC, routers con NPU): la cuantización Q4_0 y el tamaño reducido permiten desplegar el modelo en plataformas donde un modelo de 7B no cabría en memoria.
- Entornos con requisitos de privacidad estrictos (sanidad, legal, industria): la inferencia local evita la transmisión de datos sensibles a servicios externos, siempre que la licencia LFM 1.0 lo permita para el caso concreto.
- Evaluación de técnicas de cuantización: al ofrecer tanto un checkpoint Q4_0 post-training como uno QAD, el repositorio permite comparar el impacto de ambas estrategias sobre la calidad de salida en un mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card del repositorio de cuantización ni los resultados de búsqueda proporcionados incluyen cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación para LFM2.5-350M o su versión GGUF.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (cálculo aproximado a partir de los 354.483.968 parámetros, no confirmado por el autor):
  - FP16: en torno a 0,7-0,8 GB.
  - Q8_0: en torno a 0,4 GB.
  - Q4_0: en torno a 0,2-0,25 GB (formato distribuido en este repositorio).
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cualquier GPU con al menos 1 GB de VRAM libre es suficiente, además de CPU con instrucciones AVX2/NEON.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo de los últimos años, y también en iGPU y CPU sin aceleración dedicada.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (importando el GGUF), LM Studio y bindings de llama.cpp para Python (`llama-cpp-python`). vLLM y TGI no soportan GGUF de forma general, por lo que requerirían el modelo en safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.
- El repositorio ocupa 3,0 GB, un tamaño desproporcionado para un modelo de 354M parámetros, lo que sugiere que incluye varios archivos de cuantización o pesos en mayor precisión; conviene revisar la lista de archivos antes de descargar.

## Comparativa con modelos similares

No se dispone de datos verificables en la información proporcionada (parámetros del resto de modelos, contexto, licencia o benchmarks) para construir una comparativa cuantitativa rigurosa. Como referencia cualitativa, este modelo compite en el segmento de modelos conversacionales ultracompactos (por debajo de 1.000 millones de parámetros) con alternativas de la propia familia Liquid AI y de otros fabricantes.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nwtgck/LFM2.5-350M-GGUF | 354.483.968 | No disponible | lfm1.0 | GGUF en HuggingFace |
| LiquidAI/LFM2.5-350M | No disponible | No disponible | lfm1.0 | Modelo base en HuggingFace (referenciado) |
| LFM2 (generación anterior, Liquid AI) | No disponible | No disponible | No disponible | No confirmado en la información proporcionada |
| Alternativas de otros fabricantes en el segmento sub-1B | No disponible | No disponible | No disponible | No confirmado en la información proporcionada |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada. Al estar entrenado con datos web multilingües, es esperable el arrastre de sesgos presentes en corpus de inglés, árabe, chino, francés, alemán, japonés, coreano y español, pero no se documenta ningún análisis al respecto.
- Riesgo de alucinación: elevado por su tamaño. Con 354M parámetros, la capacidad de almacenar conocimiento factual es muy limitada, por lo que no debería usarse como fuente de verdad sin verificación externa.
- Longitud de contexto: no especificada. No se puede garantizar el comportamiento en conversaciones o documentos largos.
- Rendimiento por idioma: no se documenta ninguna evaluación desagregada por idioma; el hecho de que el español figure entre los ocho idiomas soportados no implica calidad homogénea.
- Licencia LFM 1.0: es una licencia propia (`license: other`), no una licencia open source estándar. Es imprescindible revisar el archivo LICENSE y los términos de Liquid AI antes de cualquier uso comercial, ya que pueden existir restricciones de uso, atribución o umbrales de facturación.
- Cuantización de terceros: este repositorio lo mantiene nwtgck, no Liquid AI. No hay garantía de que la conversión a GGUF preserve el comportamiento del modelo original, y no se documentan métricas de degradación.
- Repositorio sin tracción: 0 descargas y 0 likes en la fecha indicada, por lo que no existe validación comunitaria del artefacto.
- Repositorio de 3,0 GB: el tamaño no se corresponde con un único archivo Q4_0 de 350M, lo que puede implicar descargas más lentas o archivos redundantes; conviene seleccionar explícitamente el fichero con `--hf-file`.
- Los resultados de la búsqueda web proporcionada no contienen información relevante sobre el modelo (son resultados genéricos de foros), por lo que no aportan datos verificables.

## Enlaces

- Repositorio HuggingFace (cuantización GGUF): https://huggingface.co/nwtgck/LFM2.5-350M-GGUF
- Checkpoint QAD Q4_0: https://huggingface.co/LiquidAI/LFM2.5-350M-GGUF/blob/main/LFM2.5-350M-QAD-Q4_0.gguf
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Playground de Liquid AI: https://playground.liquid.ai/
- Documentación de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- LEAP (plataforma de Liquid AI): https://leap.liquid.ai/
- Discord de Liquid AI: https://discord.com/invite/liquid-ai
- Web de Liquid AI: https://www.liquid.ai/
