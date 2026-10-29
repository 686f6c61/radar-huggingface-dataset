# axteam/Qwen3.5-4B-AWQ-4bit

## Resumen

`axteam/Qwen3.5-4B-AWQ-4bit` es una cuantización de 4 bits del modelo multimodal denso Qwen3.5-4B, publicada por el usuario axteam. No se trata de un modelo entrenado desde cero, sino de un derivado PTQ (post-training quantization) en formato AWQ INT4 con activaciones en BF16 (esquema W4A16), empaquetado con `compressed-tensors` y pensado específicamente para servirse con vLLM. El modelo base, desarrollado por el equipo Qwen (Alibaba), es un transformer híbrido que combina capas de atención lineal con capas de atención completa, incorpora una torre de visión y una cabeza MTP (multi-token prediction).

El problema que resuelve es de eficiencia de despliegue: los pesos originales en BF16 de un modelo de 4.539 millones de parámetros ocupan del orden de 9 GB, mientras que esta versión INT4 reduce el repositorio a 4,3 GB (unos 4,0 GB de pesos en disco), lo que permite servirlo en GPU de consumo de gama media y aumentar el número de secuencias concurrentes por GPU en vLLM. La rebaja de memoria no es gratuita: el autor reporta un incremento de perplejidad del 6,2 % y un acuerdo top-1 del 89,0 % frente al original.

Es relevante ahora porque Qwen3.5-4B se posiciona como un modelo pequeño que cubre razonamiento, código, agentes y comprensión visual, y las variantes cuantizadas son la vía habitual para llevarlo a producción con coste reducido. Conviene señalar que este repositorio concreto tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta todavía con validación de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención lineal + atención completa), denso, multimodal (torre de visión) con cabeza MTP |
| Parametros totales | 4.539.265.536 (4,54 mil millones) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la model card; fuentes secundarias citan 262.144 tokens para Qwen3.5-4B (sin confirmar en el repositorio) |
| Tipos de cuantizacion | AWQ INT4 (W4A16): pesos INT4 asimétricos, group size 32, escala en BF16 y cero en INT4, activaciones en BF16; formato `compressed-tensors` `pack-quantized` |
| Idiomas soportados | No disponible en los metadatos del repositorio; fuentes secundarias atribuyen 201 idiomas al modelo base |
| Licencia | Apache-2.0 (heredada del modelo base Qwen/Qwen3.5-4B) |
| Formato de pesos | safetensors con `compressed-tensors` (pack-quantized); compatible con transformers y vLLM |

Otros datos de interés: tamaño del repositorio 4,3 GB, pesos en disco ~4,0 GB, creado el 29 de octubre de 2026, pipeline `image-text-to-text`, calibración de 256 muestras con un corpus mixto con predominio de coreano.

## Arquitectura y entrenamiento

El modelo base es un transformer denso de ~4,5 mil millones de parámetros con una arquitectura híbrida: alterna capas de atención lineal (con componentes propios de un modelo de espacio de estados, como `conv1d`, `A_log` y `dt_bias`) con capas de atención completa, lo que reduce el coste del caché KV en contextos largos sin renunciar a la atención global. Sobre ese tronco se añaden una torre de visión y un proyector para entrada de imagen, además de una cabeza de predicción multi-token (MTP). Los detalles de composición del dataset de preentrenamiento, número de tokens, fases de RLHF/DPO y datos concretos del entrenamiento multimodal **no están disponibles** en la información proporcionada.

Esta variante no reentrena nada: es una cuantización post-entrenamiento. AWQ aplica un reescalado de canales salientes guiado por un conjunto de calibración de 256 muestras (sin gradientes) para proteger los pesos más relevantes antes del redondeo a INT4. Se mantienen en BF16 la torre de visión y el proyector (`model.visual.*`), la cabeza MTP (`mtp.*`), todas las RMSNorm, los embeddings de tokens, la LM head y las partes no lineales del bloque SSM (`linear_attn.conv1d`, `A_log`, `dt_bias`), que representan una fracción pequeña de los parámetros. El tokenizador, la `chat_template` y el `generation_config` son idénticos a los del original; el `config.json` es el original más un bloque `quantization_config`.

## Capacidades

- Generación de texto conversacional multi-turno, con `chat_template` propia del equipo Qwen.
- Razonamiento y modo "thinking" antes de responder, según la documentación secundaria del modelo base.
- Comprensión de imagen y texto (`image-text-to-text`): la torre de visión se conserva en BF16, por lo que la ruta multimodal no está cuantizada.
- Generación de código y matemáticas, en línea con el posicionamiento del modelo base (métricas concretas no disponibles en este repositorio).
- Capacidades de agente y razonamiento multi-paso atribuidas al modelo base en fuentes secundarias.
- Soporte multilingüe amplio según esas mismas fuentes (201 idiomas), si bien este repositorio no declara lista de idiomas.
- Cabeza MTP (multi-token prediction), que puede aprovecharse para decodificación especulativa en servidores compatibles.
- Compatibilidad de endpoints: la etiqueta `endpoints_compatible` sugiere despliegue directo en la infraestructura de Hugging Face.
- Soporte de tool calling / function calling: no confirmado de forma explícita en la información disponible.

## Casos de uso

- Servicio de chat multiusuario con vLLM: los 4,0 GB de pesos permiten levantar varias instancias o aumentar `--max-num-seqs` en una sola GPU de 24 GB, algo inviable con el BF16 de 9 GB. Adecuado por la reducción de memoria y por mantener la plantilla de chat original.
- Asistente con entrada de imagen en atención al cliente: el modelo acepta pares imagen-texto (capturas de error, fotos de producto) y mantiene la torre de visión en BF16, por lo que la calidad visual no se degrada por la cuantización.
- Procesamiento por lotes de documentos escaneados con extracción de texto y resumen: el pipeline `image-text-to-text` permite pasar páginas como imagen y obtener descripciones o transcripciones estructuradas en una cola offline.
- Generación de código asistida en IDE o CI: un modelo de 4B cuantizado se puede servir en una GPU de consumo con latencia baja, integrándolo en revisiones de PR o generación de tests; conviene validar la tasa de acuerdo top-1 del 89 % antes de automatizar sin supervisión.
- Razonamiento multi-paso en agentes ligeros: la cabeza MTP y el modo de razonamiento del modelo base permiten encadenar pasos con contexto largo, útil en orquestadores que necesitan muchas llamadas baratas.
- Prototipado e investigación de cuantización: sirve como referencia reproducible para medir el impacto de AWQ INT4 frente al BF16 en tareas multimodales, ya que el autor publica perplejidad y acuerdo top-1 con el mismo arnés.
- Despliegue en el borde o en estaciones de trabajo sin GPU de datacenter: con ~4 GB de pesos, cabe en tarjetas de 8-12 GB junto con el caché KV de contextos moderados.

## Benchmarks y rendimiento

El autor no publica puntuaciones absolutas de tareas (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos medidos son métricas de fidelidad frente al BF16 original, sobre un conjunto interno mixto inglés/coreano de 100 prompts con respuestas greedy del BF16 puntuadas bajo cada build y el mismo arnés:

| Metrica | Este modelo (AWQ INT4) | Qwen3.5-4B BF16 |
|---|---|---|
| Perplejidad (menor es mejor) | 1,6672 | 1,5703 (+6,2 %) |
| Acuerdo top-1 en siguiente token | 89,0 % | 99,2 % |

Estas cifras miden fidelidad al modelo base, no rendimiento absoluto en tareas. No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~5,5-6,5 GB con contextos cortos (pesos de 4,0 GB + caché KV + activaciones); a partir de 8-12 GB para contextos largos. Estimación propia a partir del tamaño de pesos declarado, no medida por el autor.
- GPU de datacenter recomendadas: A100 40/80 GB, H100, L40S; en ellas el límite práctico es el número de secuencias concurrentes, no el peso del modelo.
- GPU de consumo: cabe con holgura en RTX 4090 (24 GB), RTX 4080 (16 GB) y RTX 4060 Ti (16 GB); en RTX 3060 (12 GB) o RTX 4060 (8 GB) es viable con contextos moderados y pocas secuencias simultáneas.
- Despliegue: la vía soportada y documentada es vLLM (`vllm serve axteam/Qwen3.5-4B-AWQ-4bit`), gracias al formato `compressed-tensors` `pack-quantized`. No se ha publicado versión GGUF, por lo que llama.cpp u Ollama requerirían conversión propia y no están garantizados para esta arquitectura híbrida.
- Parámetros de muestreo recomendados por Qwen: `temperature=0.7`, `top_p=0.8`, `top_k=20`.
- Latencia y throughput: no disponibles; no se han publicado mediciones de tokens por segundo ni de TTFT.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| axteam/Qwen3.5-4B-AWQ-4bit | 4,54 B (denso) | No disponible (262.144 según fuentes secundarias) | AWQ INT4 W4A16, `compressed-tensors` | Apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B (BF16) | 4,54 B (denso) | No disponible (262.144 según fuentes secundarias) | BF16 | Apache-2.0 | Hugging Face, modelo base oficial |
| cyankiwi/Qwen3.5-4B-AWQ-4bit | 4,54 B (denso) | No disponible | AWQ 4 bits, `compressed-tensors`, orientado a vLLM | Apache-2.0 | ModelScope / directorios de terceros |

No se dispone de datos verificados de benchmarks que permitan comparar el rendimiento en tareas frente a alternativas de otros fabricantes en la misma franja (4B multimodales); indicar cifras sería especulativo, por lo que se marca como no disponible.

## Limitaciones y advertencias

- Pérdida de calidad medible por la cuantización: +6,2 % de perplejidad y 89,0 % de acuerdo top-1 frente al BF16. En tareas sensibles (código, matemáticas, extracción de datos) el deterioro puede ser mayor que la media.
- El conjunto de calibración es de solo 256 muestras y con predominio de coreano; el sesgo del corpus puede penalizar más a unos idiomas y dominios que a otros. No hay evaluación por idioma publicada.
- Riesgo de alucinación inherente a un modelo de 4B: no debe usarse como fuente de verdad sin verificación en dominios factuales, legal, médico o financiero.
- Longitud de contexto no verificada en el repositorio: la cifra de 262.144 tokens proviene de fuentes secundarias; conviene comprobarla en el `config.json` del modelo base antes de dimensionar caché KV.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificaciones, con atribución y conservación del aviso; los derechos sobre pesos, tokenizador y plantilla de chat son del equipo Qwen.
- Ecosistema limitado: al no haber GGUF publicado, el despliegue fuera de vLLM/transformers con `compressed-tensors` requiere trabajo adicional; las herramientas que no soporten la arquitectura híbrida (atención lineal + MTP) pueden fallar al cargar.
- Sin validación comunitaria: 0 descargas y 0 likes; el repositorio es un artefacto reciente de un tercero, no una publicación oficial de Qwen.
- El pipeline declarado es `image-text-to-text`, pero no hay ejemplos publicados de uso multimodal ni evaluación de la ruta de visión en esta cuantización.
- No hay información sobre sesgos demográficos, de género o culturales específicos de esta build; los del modelo base aplican sin cambios.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/axteam/Qwen3.5-4B-AWQ-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Réplica/derivado en ModelScope (terceros): https://www.modelscope.cn/models/cyankiwi/Qwen3.5-4B-AWQ-4bit/summary
- Ficha técnica de Qwen3.5-4B en apxml: https://apxml.com/models/qwen35-4b
- Artículo divulgativo sobre Qwen3.5-4B: https://firethering.com/qwen3-5-4b-local-ai-model/
- Directorio con análisis del derivado de cyankiwi: https://aiappdex.com/models/cyankiwi-qwen3-5-4b-awq-4bit/
