# santosh07401/piiguard-qwen3-1.7b

## Resumen

PIIGuard es un adaptador LoRA sobre el modelo base Qwen/Qwen3-1.7B, desarrollado por santosh07401, especializado en la extracción de información personal identificable (PII) en inglés, hindi (devanagari) e hinglish (mezcla de hindi e inglés). El modelo devuelve entidades estructuradas en JSON, lo que lo hace adecuado para pipelines de redacción on-premise donde los datos no pueden salir de la infraestructura de la organización.

Su relevancia radica en que aborda formas superficiales específicas de la India que las herramientas occidentales de detección de PII suelen pasar por alto: números Aadhaar (incluidos dígitos en devanagari), códigos PAN, identificadores UPI/VPA, códigos IFSC y formatos de dirección indios. El modelo ignora deliberadamente trampas visuales como referencias UTR de 12 dígitos, números de pedido, OTPs o GSTIN, que no son PII.

El adaptador tiene 2.031.739.904 parámetros totales (el modelo base completo), se distribuye bajo licencia Apache 2.0 y está disponible en formato safetensors y GGUF. La versión cuantizada Q4_K_M pesa 1,2 GB y puede ejecutarse en CPU, incluso en hardware de clase Raspberry Pi, mediante llama.cpp u Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-1.7B) con adaptador LoRA (r=16, α=32) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el quickstart usa 4096 tokens) |
| Tipos de cuantizacion | Q4_K_M (1,2 GB), Q8_0 (2,1 GB) |
| Idiomas soportados | en, hi (incluye hinglish) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3-1.7B, un transformer denso de la familia Qwen3, y se entrena con un adaptador LoRA de rango 16 y alpha 32 mediante TRL SFTTrainer, con pérdida solo en las respuestas del asistente y el modo thinking desactivado. El entrenamiento se realizó durante 3 épocas más una época adicional de corrección dirigida en una única GPU NVIDIA GB10 (DGX Spark).

El dataset de entrenamiento consta de aproximadamente 26.000 ejemplos totalmente sintéticos. Las plantillas portadoras fueron escritas por gemma-3-27b-it (ejecutado localmente) y se rellenaron con PII falsa generada programáticamente y con checksum válido: números Aadhaar con verificación Verhoeff, tarjetas con validación Luhn y códigos PIN correctos por región. Se incluyen pares de nombres en alfabeto romano y devanagari. Las etiquetas son exactas por construcción y no se utilizó ningún dato personal real en ningún momento.

## Capacidades

- Extracción de 11 tipos de entidades PII: PERSON, PHONE, EMAIL, AADHAAR, PAN, ADDRESS, DOB, BANK_ACCOUNT, IFSC, CARD y UPI_ID.
- Salida estructurada en JSON con el contrato `{"entities": [{"type": ..., "text": ...}]}`.
- Soporte de dígitos devanagari en números Aadhaar y teléfonos (por ejemplo, ९८२२०४५६७१).
- Detección de formas superficiales específicas de la India: UPI/VPA handles, códigos IFSC, direcciones indias y códigos PAN.
- Distinción deliberada entre PII real y trampas visuales: referencias UTR, números de pedido, OTPs, GSTIN, IDs de empleado y nombres de empresa no se marcan como PII.
- Capacidad multilingüe para inglés, hindi y hinglish (código-mixto).
- Funciona con temperatura 0 para salidas deterministas.
- No incluye soporte de tool calling ni capacidades de agente; es un modelo de extracción especializado de un solo paso.

## Casos de uso

- Redacción de PII en logs de soporte técnico: el modelo puede procesar transcripciones de atención al cliente en hinglish y devolver las entidades PII en JSON para que un pipeline posterior las enmascare antes de almacenar los logs, cumpliendo requisitos de la DPDP (Ley de Protección de Datos Personales de India).
- Limpieza de datos para entrenamiento de LLMs: antes de usar datos de producción para fine-tuning, PIIGuard puede filtrar y redactar información personal en datasets mixtos en inglés e hindi, reduciendo el riesgo de fuga de datos en modelos entrenados.
- Cumplimiento normativo en KYC: en procesos de verificación de identidad, el modelo extrae Aadhaar, PAN, DOB y direcciones de notas manuscritas o transcritas, facilitando la auditoría y el control de acceso a datos sensibles.
- Gateway de depuración para LLMs: integrado como paso previo en un gateway de inferencia, puede eliminar PII de las consultas de usuario antes de enviarlas a un LLM externo, evitando que datos personales salgan de la infraestructura.
- Despliegue en edge con CPU: gracias al GGUF Q4_K_M de 1,2 GB, puede ejecutarse en dispositivos de bajo consumo como Raspberry Pi para redactar PII en tiempo real en entornos con conectividad limitada o nula.
- Análisis de documentos financieros: extracción de números de cuenta bancaria, códigos IFSC y tarjetas de textos mixtos en inglés e hindi, con validación contextual para distinguir entre cuentas de 16 dígitos y tarjetas.

## Benchmarks y rendimiento

El autor publica resultados sobre un conjunto de prueba reservado de 1.320 ejemplos, con plantillas y valores PII no vistos durante el entrenamiento (los pools de valores de train y test son disjuntos por hash). 200 de esos ejemplos no contienen PII.

| Metrica | Valor |
|---|---|
| Precision (micro) | 98,7 % |
| Recall (micro) | 98,9 % |
| Tasa de falsos positivos en texto limpio | 0,0 % (0/200) |
| Fallos de parseo JSON | 0 / 1.320 |
| F1 en ingles | 98,4 |
| F1 en hindi | 98,8 |
| F1 en hinglish | 99,2 |
| Recall con cuantizacion Q4_K_M (muestra de 100 ejemplos) | 98,4 % |
| Precision con cuantizacion Q4_K_M (muestra de 100 ejemplos) | 95,9 % |

No se han publicado resultados en benchmarks generales como MMLU, HumanEval o GSM8K, ya que el modelo no está diseñado para tareas generales de razonamiento o generación, sino para extracción de PII.

## Requisitos de hardware

- VRAM estimada para inferencia: el GGUF Q4_K_M de 1,2 GB puede ejecutarse en CPU sin GPU; el Q8_0 de 2,1 GB requiere aproximadamente 2,5-3 GB de RAM o VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050) es suficiente para la versión Q8_0; el modelo base completo en safetensors necesita unos 8-10 GB de VRAM (RTX 3070, RTX 4060 Ti o superior).
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama media y baja gracias a las cuantizaciones GGUF.
- Opciones de despliegue: llama.cpp (llama-server), Ollama, y cualquier servidor compatible con el formato GGUF. Para el adaptador safetensors, se puede usar vLLM o TGI con el modelo base Qwen3-1.7B y el adaptador LoRA cargado.
- Latencia y throughput: no se han publicado datos oficiales, pero al ser un modelo de 1,7B con salidas JSON cortas, la latencia en CPU moderna es del orden de cientos de milisegundos por consulta; en GPU, decenas de milisegundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| PIIGuard (Qwen3-1.7B + LoRA) | 2.03B | No disponible | PII en en/hi/hinglish | Apache 2.0 | safetensors, GGUF |
| Qwen3-1.7B (base) | 1.7B | 32K (segun repo oficial) | Generacion general, razonamiento | Apache 2.0 | safetensors, GGUF |
| Microsoft Presidio | No aplica (reglas + modelos NER) | No aplica | PII en multiples idiomas | MIT | Libreria Python |

La comparativa con Presidio es conceptual: Presidio es un framework basado en reglas y modelos NER genericos, mientras que PIIGuard es un modelo de lenguaje fine-tuneado especificamente para formas PII indias. No se dispone de benchmarks comparativos directos entre ambos. Frente al modelo base Qwen3-1.7B, PIIGuard sacrifica capacidades generales de generacion para obtener precision especializada en extraccion de PII con salida JSON estructurada.

## Limitaciones y advertencias

- Solo cubre ingles, hindi y hinglish; otros idiomas indicos (bengali, tamil, telugu, etc.) no estan soportados.
- El texto de la entidad se devuelve tal cual aparece, pero la localizacion de los spans (posiciones de inicio y fin) queda a cargo del llamante, que debe buscar la subcadena en el texto original.
- La desambiguacion entre cuentas bancarias de 16 digitos y tarjetas depende del contexto; secuencias de digitos genuinamente sin contexto pueden clasificarse incorrectamente.
- No es una garantia de cumplimiento normativo: debe usarse como componente de un pipeline revisado, con escalado humano cuando la gravedad de los datos lo requiera.
- Los tipos de entidad PASSPORT, VOTER_ID y DRIVING_LICENSE no estan implementados (estan en la hoja de ruta del autor).
- El entrenamiento se realizo exclusivamente con datos sinteticos; el rendimiento en texto real con ruido, jerga o formatos no vistos puede degradarse.
- El modelo no tiene capacidades de razonamiento general ni de generacion de texto libre; esta disenado unicamente para extraccion de PII con salida JSON.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/santosh07401/piiguard-qwen3-1.7b
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Cuantizaciones GGUF de Qwen3-1.7B (unsloth): https://huggingface.co/unsloth/Qwen3-1.7B-GGUF
- Pagina de Qwen3-1.7B en Ollama: https://ollama.com/library/qwen3:1.7b
