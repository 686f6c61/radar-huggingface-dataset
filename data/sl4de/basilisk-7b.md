# sl4de/Basilisk-7B

## Resumen

Basilisk-7B es un modelo de lenguaje especializado en seguridad ofensiva y pruebas de penetración web, desarrollado por el usuario sl4de. Se trata de un ajuste fino (fine-tuning) del modelo Qwen2.5-Coder-7B-Instruct mediante QLoRA, con el objetivo de responder directamente a preguntas sobre explotación de vulnerabilidades, generación de payloads, comandos de herramientas y redacción de informes, sin rechazos ni avisos morales. Está pensado para pruebas de seguridad autorizadas, CTFs y educación.

El modelo tiene aproximadamente 7.600 millones de parámetros y se distribuye como un archivo GGUF cuantizado Q4_K_M (~4,7 GB) que puede ejecutarse en GPUs con 8 GB de VRAM, además de un adaptador LoRA para su uso con transformers y PEFT. Fue entrenado con 8.054 ejemplos curados que cubren 19 dominios de vulnerabilidades web, utilizando QLoRA con LoRA r=16 y una sola época en una RTX 4060 Laptop de 8 GB.

Su relevancia radica en ofrecer una alternativa de código abierto y sin censura para profesionales de la seguridad que necesitan asistencia técnica específica en pentesting web, con la ventaja de poder ejecutarse en hardware de consumo. Sin embargo, al ser un modelo de 7B, tiene limitaciones en la generación de cadenas de explotación novedosas y puede presentar errores en código complejo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only) basado en Qwen2.5-Coder-7B-Instruct |
| Parametros totales | ~7,6 mil millones |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | Q4_K_M (GGUF), adaptador LoRA (4-bit QLoRA) |
| Idiomas soportados | Ingles |
| Licencia | MIT |
| Formato de pesos | GGUF, safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

Basilisk-7B parte de la arquitectura de Qwen2.5-Coder-7B-Instruct, un transformer decoder-only con atención causal estándar. El ajuste fino se realizó mediante QLoRA (Quantized Low-Rank Adaptation) con cuantización de 4 bits, utilizando un rango de LoRA de 16 y aplicando la adaptación a todas las capas lineales. El entrenamiento se llevó a cabo durante una sola época sobre un dataset propio de 8.054 ejemplos, con una longitud de secuencia de 448 tokens, tamaño de lote 1 con acumulación de gradientes de 8, optimizador AdamW de 8 bits y tasa de aprendizaje de 2e-4. El hardware utilizado fue una única GPU RTX 4060 Laptop con 8 GB de VRAM.

El dataset de entrenamiento, denominado `sl4de/basilisk-webpentest`, cubre 19 dominios de vulnerabilidades web, incluyendo inyección SQL/NoSQL, XSS, SSRF, XXE, deserialización, autenticación JWT/OAuth, control de acceso (IDOR/BOLA), seguridad de APIs, SSTI, LFI/RFI, CSRF, CORS, request smuggling, prototype pollution, race conditions, cache poisoning, open redirect y subida de archivos. No se menciona el uso de RLHF ni DPO; el entrenamiento se basa únicamente en el ajuste supervisado con ejemplos curados.

## Capacidades

- Generación de payloads y pruebas de concepto (PoCs) para vulnerabilidades web, incluyendo inyección SQL/NoSQL, command injection, XSS (reflejado, almacenado y DOM), SSRF, XXE, deserialización, SSTI, LFI/RFI, CSRF, CORS, request smuggling, prototype pollution, race conditions, cache poisoning, open redirect y subida de archivos.
- Interpretación de resultados de herramientas de reconocimiento y escaneo como `nmap`, `nuclei`, `ffuf` y `sqlmap`, con recomendaciones de pasos siguientes.
- Asistencia en bypass de WAF y evasión de filtros/sanitizadores, así como en la explotación de gadgets de frameworks.
- Soporte para flujos multi-turno de reconocimiento a explotación, manteniendo contexto sobre el estado del ataque.
- Redacción de informes de hallazgos profesionales con vectores CVSS correctos.
- Capacidad de ejecución local mediante GGUF en llama.cpp, Ollama o LM Studio, o mediante el adaptador LoRA con transformers y PEFT.
- No incluye capacidades de visión, audio ni razonamiento explícito tipo "thinking mode"; se centra exclusivamente en texto.

## Casos de uso

- Pruebas de penetración web autorizadas: el modelo puede guiar a un auditor durante un engagement, sugiriendo payloads y comandos específicos para cada fase, desde el reconocimiento hasta la explotación, basándose en la información que el auditor le proporciona (por ejemplo, puertos abiertos, versiones de servidores).
- Preparación de CTFs (Capture The Flag): los participantes pueden consultar al modelo para obtener pistas sobre cómo explotar una vulnerabilidad concreta, generar payloads personalizados o entender el funcionamiento de una técnica de ataque.
- Educación en seguridad ofensiva: estudiantes de ciberseguridad pueden usar el modelo como tutor práctico para aprender a identificar y explotar vulnerabilidades web en entornos controlados, con ejemplos concretos y explicaciones técnicas.
- Automatización de reconocimiento: el modelo puede interpretar la salida de herramientas como `nmap` o `ffuf` y sugerir los siguientes pasos, lo que permite integrarlo en scripts de automatización para acelerar la fase de enumeración.
- Generación de informes de vulnerabilidades: tras una prueba, el modelo puede redactar informes estructurados con descripciones técnicas, impacto y vectores CVSS, ahorrando tiempo al pentester.
- Análisis de código y configuración: puede revisar fragmentos de código o configuraciones de servidores para identificar posibles vulnerabilidades (por ejemplo, cabeceras CORS mal configuradas, endpoints inseguros) y sugerir correcciones.
- Investigación de seguridad: investigadores pueden usarlo para explorar variantes de ataques conocidos o para documentar técnicas de explotación en entornos aislados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas comparativas como MMLU, HumanEval o GSM8K para este modelo. El rendimiento se describe cualitativamente en la model card: "aplica técnicas conocidas bien, pero no inventará cadenas de explotación novedosas" y "se esperan errores menores ocasionales en código complejo generado a este tamaño".

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q4_K_M ocupa aproximadamente 4,7 GB, por lo que se puede ejecutar en GPUs con 8 GB de VRAM o más. Para el adaptador LoRA con transformers, se requiere cargar el modelo base de 7B en memoria, lo que puede necesitar entre 8 y 12 GB de VRAM dependiendo de la precisión.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM, como RTX 3060, RTX 4060, RTX 2070, o superiores. También puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp (CLI o servidor), Ollama (mediante el comando `ollama run hf.co/sl4de/Basilisk-7B:Q4_K_M`), LM Studio, y transformers con PEFT para el adaptador LoRA.
- Latencia y throughput estimados: no disponibles. Dependen del hardware y del backend utilizado; en una GPU de 8 GB se espera una generación de varios tokens por segundo, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Basilisk-7B | ~7,6B | No disponible | Pentesting web, sin censura | MIT | GGUF, LoRA |
| Qwen2.5-Coder-7B-Instruct (base) | ~7,6B | 32K (según documentación oficial) | Codigo e instrucciones generales | Apache 2.0 | Safetensors, GGUF |
| PentestGPT (si existiera comparable) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre otros modelos específicos de pentesting web de tamaño similar. La comparación más directa es con el modelo base Qwen2.5-Coder-7B-Instruct, del que Basilisk-7B es un ajuste fino especializado. La principal diferencia es que Basilisk-7B elimina los rechazos y se centra exclusivamente en seguridad ofensiva, mientras que el base es un modelo general de código e instrucciones.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo "uncensored" entrenado con datos de seguridad ofensiva, puede generar contenido peligroso si se utiliza de forma malintencionada. El autor incluye un descargo de responsabilidad que limita su uso a entornos autorizados.
- Riesgo de alucinacion: como cualquier modelo de 7B, puede generar payloads o comandos incorrectos o inexistentes. La model card advierte que "siempre verifique los payloads y comandos generados antes de usarlos".
- Limitaciones de contexto: la longitud de contexto no se especifica, pero el entrenamiento se realizó con secuencias de 448 tokens, lo que sugiere que el modelo puede no manejar bien contextos muy largos. Para conversaciones multi-turno extensas, podría perder coherencia.
- Limitaciones de idioma: solo soporta inglés. Las consultas en otros idiomas pueden producir respuestas de menor calidad.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificación, pero el uso del modelo está sujeto a las leyes aplicables. No se debe utilizar contra sistemas sin autorización explícita por escrito.
- Caveats para produccion: al ser un modelo de 7B, no es adecuado para tareas que requieran razonamiento complejo o generación de código muy extenso. Se recomienda usarlo como asistente en flujos supervisados por un profesional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sl4de/Basilisk-7B
- Repositorio GitHub: https://github.com/sl4de0day/basilisk-7b
- Dataset de entrenamiento: https://huggingface.co/datasets/sl4de/basilisk-webpentest
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
