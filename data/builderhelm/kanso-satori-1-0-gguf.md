# BuilderHelm/Kanso-Satori-1.0-GGUF

## Resumen

Kanso Satori 1.0 GGUF es la conversión al formato GGUF del modelo Kanso Satori 1.0, desarrollado por BuilderHelm (ZenVoice), un formateador de texto de 4.022 millones de parámetros especializado en limpiar la salida cruda de sistemas de reconocimiento automático del habla (ASR). No es un modelo conversacional: su única función es transformar transcripciones dictadas en texto escrito limpio, preservando las palabras y el significado del hablante. El modelo base es Qwen3-4B-Instruct-2507, afinado y publicado originalmente con cuantización de 4 bits DWQ.

La relevancia de este lanzamiento radica en su enfoque de propósito único y despliegue en dispositivo (on-device). Frente a los modelos de chat generalistas, Satori resuelve tareas concretas de posprocesado de dictado: restauración de puntuación y mayúsculas, eliminación de disfluencias, aplicación de autocorrecciones habladas, normalización inversa de texto (números, importes, fechas, URLs, correos) y protección de texto técnico como rutas de ficheros o identificadores de código. Todo ello con un contexto declarado de 262.144 tokens, aunque la conversión se evaluó a 1.024 tokens.

Esta release GGUF está pensada para llama.cpp y ofrece un fichero Q4_1 recomendado (2,52 GB) que es un reempaquetado exacto de los pesos MLX 4-bit publicados, más una serie de conversiones experimentales derivadas del maestro BF16 (de F16 a Q8_0). La licencia es Apache 2.0 y el idioma soportado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 (4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens declarados; conversión evaluada a 1.024 tokens |
| Tipos de cuantizacion | Q4_1 (recomendado), F16, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (experimentales); Q2_K, Q3_K_S, Q3_K_M, Q3_K_L e IQ4_XS retenidos (withheld) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp); modelo base también en BF16 y MLX 4-bit DWQ |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3-4B-Instruct-2507, un transformer denso de 4.022 millones de parámetros, afinado por ZenVoice para la tarea específica de limpieza de dictado y publicado originalmente con cuantización de 4 bits DWQ (Dynamic Weight Quantization). La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; esos datos no están disponibles en la información proporcionada.

La innovación principal no reside en la arquitectura, sino en el diseño de propósito único y en el pipeline de cuantización y validación. El fichero Q4_1 es un reempaquetado exacto de los pesos MLX 4-bit publicados, sin adaptador, y se mantiene como opción recomendada porque preserva el comportamiento exacto del modelo publicado. Las conversiones adicionales derivadas del maestro BF16 son experimentales y, según el autor, no son equivalentes al Q4_1: el propio maestro BF16 omite una frase de verificación y reordena texto en cuatro casos de regresión de longitud media, limitación reproducida de forma independiente en MLX y llama.cpp. Cada build publicado pasa comprobaciones de tensores y metadatos, 120 sondas exactas de tokenizador, dos casos de humo en CPU, dos pasadas completas de regresión en Metal con comprobación de aislamiento de sesión y una evaluación de 500 dictados, todo ello en macOS arm64 (no certificado para Windows/Linux).

## Capacidades

- Restauración de puntuación, mayúsculas y límites de frase a partir de texto dictado sin formato.
- Eliminación de disfluencias: muletillas, falsos arranques y repeticiones.
- Aplicación de autocorrecciones habladas (por ejemplo, "monday sorry i meant tuesday" se convierte en "Tuesday").
- Normalización inversa de texto (ITN): escritura de números, importes monetarios, fechas, horas, URLs y direcciones de correo en su forma escrita.
- Protección de texto técnico: nombres, rutas de ficheros, identificadores de código y flags se dejan sin modificar.
- Contexto de aplicación opcional mediante una primera línea `app:` que adapta el tono y las mayúsculas (por ejemplo, `app: Slack`).
- Modo de razonamiento desactivado obligatoriamente (`--reasoning off`); no es un modelo de chat ni soporta conversación multi-turno.
- No se documentan capacidades de tool calling, agentes, visión, audio ni razonamiento multi-paso.

## Casos de uso

- Limpieza de dictado en aplicaciones de notas: el modelo recibe la transcripción cruda de un ASR y devuelve texto con puntuación y mayúsculas correctas, adecuado para integrarse en apps de toma de notas por voz en dispositivo.
- Procesado por lotes de transcripciones: con una evaluación de 500 dictados y contexto de 1.024 tokens por petición, permite limpiar grandes volúmenes de transcripciones en pipelines locales sin depender de la nube.
- Normalización de importes y fechas en entornos financieros o administrativos: convierte "eighteen dollars and sixty cents" en "$18.60" y fechas habladas en su forma escrita, útil para extracción posterior de datos.
- Corrección de dictado para desarrolladores: protege rutas como `/tmp/zenvoice-test/output.txt` e identificadores de código, por lo que puede usarse en asistentes de voz para edición de código o comandos de terminal.
- Adaptación por aplicación: la línea `app:` permite ajustar el tono y las mayúsculas según el destino (Slack, correo, documentación), útil en asistentes de escritura integrados en múltiples herramientas.
- Transcripción de reuniones y entrevistas: elimina muletillas y aplica autocorrecciones habladas, generando actas legibles a partir de la salida bruta del ASR con un modelo de 2,52 GB ejecutable en local.
- Privacidad y despliegue en dispositivo: al ser un GGUF de 4B en Q4_1, puede ejecutarse con llama.cpp en hardware de consumo, lo que permite procesar dictados sensibles sin enviar audio ni texto a servidores externos.

## Benchmarks y rendimiento

La model card declara la métrica WER (Word Error Rate) en los metadatos, pero no se han publicado resultados numéricos de benchmarks en la información disponible. El autor menciona una evaluación de 500 dictados y dos pasadas de regresión en Metal para cada build, así como un informe de evaluación en `bf16-evaluation.md`, pero no se proporcionan cifras concretas (MMLU, HumanEval, GSM8K ni WER) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,5 GB para Q4_1 (2,52 GB de fichero), 2,38-2,50 GB para Q4_K_S/Q4_K_M, 2,82-2,89 GB para Q5_K_S/Q5_K_M, 3,31 GB para Q6_K, 4,28 GB para Q8_0 y 8,05 GB para F16.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el Q4_1 cabe en GPUs de consumo con 4 GB o más de VRAM; los builds Q8_0 y F16 requieren 6-10 GB.
- Cabe en GPU de consumo: sí, el Q4_1 recomendado cabe en tarjetas con 4 GB de VRAM; el F16 requiere al menos 10 GB.
- Opciones de despliegue: llama.cpp, mediante `llama-server -hf BuilderHelm/Kanso-Satori-1.0-GGUF:Q4_1 --jinja --reasoning off -c 1024`. No se documentan otros motores (vLLM, TGI, Ollama) en la información disponible.
- Latencia y throughput: no disponibles. Las pruebas del autor se realizaron en macOS arm64 con Metal; no hay certificación para Windows/Linux.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|---|
| Kanso Satori 1.0 GGUF | 4B | 262.144 declarados (evaluado a 1.024) | Inglés | Apache 2.0 | GGUF | Formateador de dictado de propósito único |
| Qwen3-4B-Instruct-2507 | 4B | No disponible en la información | Multilingüe | Apache 2.0 | Safetensors, GGUF | Chat e instrucciones generales |
| Modelos ASR genéricos | No disponible | No disponible | No disponible | No disponible | No disponible | Transcripción de audio a texto |

El modelo base Qwen3-4B-Instruct-2507 es la alternativa más directa para tareas generales de generación de texto, pero no está especializado en limpieza de dictado ni en normalización inversa de texto. No se dispone de datos de benchmarks para establecer una comparación cuantitativa de rendimiento con alternativas.

## Limitaciones y advertencias

- Modelo de propósito único: no es un modelo de chat; no debe usarse para conversación multi-turno ni para tareas generales de generación.
- Solo inglés: no soporta otros idiomas, lo que limita su uso en entornos multilingües.
- Contexto efectivo limitado: aunque se declaran 262.144 tokens, la conversión se evaluó a 1.024 tokens y las instrucciones de uso recomiendan una configuración de contexto de 1.024 (`-c 1024`).
- Configuración obligatoria: modo de razonamiento desactivado, muestreo greedy (temperatura 0), hasta 200 tokens nuevos, prompt de sistema exacto, una dictación por petición sin historial y entrada en Unicode NFC.
- Los builds derivados de BF16 son experimentales y no equivalentes al Q4_1; el maestro BF16 omite una frase de verificación y reordena texto en cuatro casos de regresión, limitación que persiste aunque se aumenten los bits.
- Los builds Q2_K, Q3_K_S, Q3_K_M, Q3_K_L e IQ4_XS están retenidos (withheld) y no se publican.
- Validación limitada a macOS arm64: no hay certificación para Windows ni Linux.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un modelo de formateo, cualquier desviación afecta directamente al texto final del usuario.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar la licencia del modelo base Qwen3-4B-Instruct-2507 enlazada en la model card.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/BuilderHelm/Kanso-Satori-1.0-GGUF
- Modelo base en Hugging Face: https://huggingface.co/BuilderHelm/Kanso-Satori-1.0
- Modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507/blob/main/LICENSE
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Fichero recomendado Q4_1: https://huggingface.co/BuilderHelm/Kanso-Satori-1.0-GGUF/blob/main/Kanso-Satori-1.0-Q4_1.gguf
- Informe de evaluación BF16: https://huggingface.co/BuilderHelm/Kanso-Satori-1.0-GGUF/blob/main/bf16-evaluation.md
- Manifiesto de release BF16: https://huggingface.co/BuilderHelm/Kanso-Satori-1.0-GGUF/blob/main/bf16-release-manifest.json
- Checksums SHA256: https://huggingface.co/BuilderHelm/Kanso-Satori-1.0-GGUF/blob/main/SHA256SUMS
