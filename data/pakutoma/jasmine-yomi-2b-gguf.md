# pakutoma/jasmine-yomi-2b-GGUF

## Resumen

jasmine-yomi-2b-GGUF es la conversión a formato GGUF del modelo pakutoma/jasmine-yomi-2b, un modelo especializado de 2.390.384.448 parámetros (aproximadamente 2,4 mil millones) desarrollado por el usuario pakutoma. Su propósito es concreto y acotado: la conversión grafema-fonema (g2p) del japonés, es decir, generar la lectura en kana (yomi) de textos japoneses que contienen kanji, incluyendo la producción de furigana. No es un modelo de propósito general, sino una herramienta de un solo dominio afinada a partir de Qwen/Qwen3.5-2B, según indica la propia model card.

La relevancia de esta publicación es práctica: permite ejecutar el modelo en local mediante llama.cpp, con cuantizaciones que van desde BF16 hasta Q4_K_M, lo que reduce el peso de 4.570,8 MiB a 1.498,5 MiB y hace viable la inferencia en hardware modesto. El modelo original reporta una exactitud del 99,05% en el benchmark JKYB-Parakeet sobre 13.536 frases, un dato que sitúa la tarea de lectura de kanji en un régimen de alta fiabilidad para usos de preprocesado lingüístico.

La licencia Apache-2.0 y el formato GGUF lo convierten en una pieza reutilizable dentro de pipelines de TTS, subtitulado o análisis morfológico. Conviene subrayar que el modelo no está pensado para conversación: la model card prohíbe explícitamente el uso de plantillas de chat y exige el endpoint `/completions` con el token `<sep>` al final del prompt.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (derivada de Qwen/Qwen3.5-2B; detalles de la arquitectura base no disponibles) |
| Parametros totales | 2.390.384.448 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (los ejemplos de uso emplean `-c 2048`) |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M |
| Idiomas soportados | japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (tambien existen pesos originales en safetensors en el repo base) |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.5-2B, un transformer de aproximadamente 2,4 mil millones de parámetros, sobre el que pakutoma ha realizado un ajuste específico para la tarea de lectura de kanji (yomi) y generación de furigana. La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; estos datos deben consultarse en el repositorio del modelo base pakutoma/jasmine-yomi-2b.

La innovación técnica destacable no está en la arquitectura, sino en la interfaz de inferencia: el modelo espera el texto de entrada seguido del token especial `<sep>` (ID 248077) y genera la lectura como continuación, sin plantilla de chat. La conversión a GGUF se realizó con la opción `--no-nextn` y fija `eos_token_id = 248046`. Este diseño de prompt-completion puro, en lugar de instruct/chat, es coherente con una tarea determinista de transcripción fonética donde la temperatura debe ser 0.

## Capacidades

- Conversión grafema-fonema del japonés: genera la lectura en kana de frases que contienen kanji.
- Producción de furigana: asociación de lecturas a caracteres kanji individuales dentro del texto.
- Manejo de kanji de uso común (joyo kanji), evaluado específicamente en el benchmark JKYB-Parakeet.
- Inferencia determinista: los ejemplos oficiales usan `temperature: 0.0`, lo que sugiere una salida estable y reproducible.
- Ejecución local vía llama.cpp: compatible con `llama-server` (endpoint `/completions` con `--special`) y `llama-completion`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso; no es un modelo conversacional.
- No dispone de capacidades de visión, audio ni modo thinking.
- Monolingüe: únicamente japonés.

## Casos de uso

- Preprocesado para síntesis de voz (TTS): el modelo convierte texto japonés con kanji a su lectura en kana antes de pasarlo a un motor TTS, resolviendo la ambigüedad de lectura que los sintetizadores no manejan bien. Su exactitud del 99,05% en JKYB-Parakeet lo hace adecuado para este paso previo.
- Generación automática de furigana: inserción de lecturas sobre kanji en textos educativos, libros infantiles o material para estudiantes de japonés, usando la salida del modelo como anotación ruby.
- Subtitulado y alineación fonética: conversión de guiones o transcripciones a kana para alinear audio y texto en herramientas de subtitulado o para calcular métricas de error fonético (CER).
- Análisis lingüístico y corpus: normalización de lectura en pipelines de procesamiento de lenguaje natural japonés, por ejemplo para indexación fonética o búsqueda por sonido.
- Diccionarios y bases de datos léxicas: extracción de lecturas para entradas nuevas o verificación de lecturas existentes en recursos lexicográficos.
- Despliegue en local con recursos limitados: la cuantización Q4_K_M (1.498,5 MiB) permite ejecutar el modelo en estaciones de trabajo sin GPU dedicada o en servidores modestos, integrándolo como servicio interno de lectura.
- Evaluación comparativa de correctores de lectura: uso como referencia en la validación de otros sistemas g2p o de reglas de conversión kanji-kana.

## Benchmarks y rendimiento

Los datos corresponden al modelo original pakutoma/jasmine-yomi-2b en bfloat16 sobre el dataset Parakeet-Inc/joyo-kanji-yomi-benchmark-parakeet (13.536 frases, jkyb-eval 0.2.0). No se han publicado resultados de las cuantizaciones GGUF en la información disponible.

| Metrica | jasmine-yomi-2b (modelo original) |
|---|---:|
| Accuracy (estricta) | 99,05% (13.407 / 13.536) |
| Relaxed Accuracy | 99,10% |
| Target Kana-CER (raw / @1) | 0,89% / 0,80% |
| Sentence Kana-CER | 3,16% |

No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB con Q4_K_M, 2,4 GB con Q8_0 y 4,6 GB con BF16.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU con 4-6 GB de VRAM libre es suficiente para Q4_K_M o Q8_0.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060) para las cuantizaciones Q4_K_M y Q8_0. También puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp mediante `llama-server` (endpoint `/completions` con `--special`) o `llama-completion`. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles. El ejemplo oficial limita la generación a `n_predict: 384` y un contexto de 2048 tokens.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (g2p japonés de tamaño similar) en los datos proporcionados.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| jasmine-yomi-2b-GGUF | 2,39 B | no disponible | Apache-2.0 | GGUF | Especializado en yomi/furigana japonés |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de dominio único: no es apto para conversación, instrucciones generales ni generación de texto libre. La model card prohíbe explícitamente el uso de plantillas de chat y de `/v1/chat/completions`.
- Interfaz estricta: requiere concatenar `<sep>` al final del prompt y usar `--special` en llama.cpp; un uso incorrecto del prompt produce salidas inválidas.
- Monolingüe: solo japonés; no procesa otros idiomas.
- Riesgo de error en kanji poco frecuentes o nombres propios: el benchmark cubre joyo kanji, por lo que el rendimiento fuera de ese conjunto no está garantizado.
- Riesgo de alucinación en lecturas: aunque la tasa de error es baja (0,89% de CER en el benchmark), existe margen de error que conviene validar en aplicaciones críticas.
- Sesgos: no se documentan sesgos específicos en la información disponible.
- Licencia Apache-2.0: permite uso comercial y modificación, con obligación de conservar el aviso de copyright y la atribución correspondiente (incluida la del modelo base Qwen/Qwen3.5-2B, Copyright 2026 Alibaba Cloud).
- Las cuantizaciones GGUF no han sido evaluadas en el benchmark según la información disponible; el rendimiento puede diferir del modelo original en bfloat16.
- Contexto máximo no documentado: los ejemplos usan 2048 tokens, pero no se confirma si es el límite real.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/pakutoma/jasmine-yomi-2b-GGUF
- Modelo base: https://huggingface.co/pakutoma/jasmine-yomi-2b
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.5-2B
- Dataset de evaluación: https://huggingface.co/datasets/Parakeet-Inc/joyo-kanji-yomi-benchmark-parakeet
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Perfil del autor: https://huggingface.co/pakutoma
