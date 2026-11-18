# DICPlay/RusMind-Sokol-4.7

## Resumen

RusMind Sokol 4.7 (RusMind Сокол 4.7) es un modelo de lenguaje de 8.953.803.264 parámetros desarrollado por DICPlay (Rusia) mediante un fine-tuning del modelo base Qwen/Qwen3.5-9B. Está especializado en ruso e inglés, con un fuerte énfasis en conocimiento de la cultura, historia, regiones y legislación de Rusia, e incorpora un modo de razonamiento explícito (thinking) que le permite descomponer tareas paso a paso antes de responder. El modelo se distribuye con licencia propia `rusmind-license` y está pensado para ejecución local offline.

La relevancia del modelo radica en su posicionamiento dentro del ecosistema ruso: según la model card, alcanza 0,279 en el benchmark MERA v2, lo que lo sitúa como la segunda mejor modelo de origen o fine-tuning ruso por detrás de GigaChat 3.5 Reasoning (432 mil millones de parámetros) y como líder en la categoría de modelos de hasta 10 mil millones de parámetros. El autor declara resultados superiores a GigaChat 3.5 Ultra, T-pro, T-lite y Llama 4 Maverick en varias tareas del benchmark.

La arquitectura subyacente es la de Qwen3.5-9B (familia `qwen3_5_text`), un transformer denso de aproximadamente 9 mil millones de parámetros, sobre el que DICPlay aplica un fine-tuning con datos sintéticos propios y fuentes abiertas rusas. El repositorio ocupa 109,4 GB e incluye pesos en safetensors y GGUF para llama.cpp, lo que facilita el despliegue en entornos locales y con cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5, tag `qwen3_5_text`) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF disponible (niveles concretos no especificados); safetensors en precisión original |
| Idiomas soportados | Ruso (ru), inglés (en) |
| Licencia | `rusmind-license` (licencia propia, categoría `other`) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer denso de aproximadamente 9 mil millones de parámetros, y se obtiene mediante fine-tuning (relación `finetune` declarada en la model card). No se especifica en la información disponible si se emplearon técnicas de RLHF, DPO u otras etapas de alineación posteriores al ajuste supervisado, ni el número exacto de tokens de entrenamiento utilizados.

Según la model card, los datos de entrenamiento combinan fuentes sintéticas propias con fuentes abiertas: legislación rusa, manuales de historia, hechos y fuentes culturales rusas, además de datos orientados a razonamiento, comprensión de contexto, trabajo con documentos y uso de herramientas. La innovación diferencial declarada es el modo de razonamiento (thinking) que permite al modelo planificar la respuesta paso a paso, junto con un ajuste específico para instrucciones complejas y function calling. No se detallan innovaciones arquitectónicas propias más allá de las heredadas del modelo base.

## Capacidades

- Generación de texto en ruso e inglés con corrección ortográfica y puntuación.
- Razonamiento explícito en modo thinking: descomposición de problemas en pasos antes de responder.
- Razonamiento lógico, tareas de sentido común y problemas multi-paso.
- Ejecución de instrucciones complejas con múltiples restricciones simultáneas (benchmark IFHard reportado).
- Tool calling / function calling (benchmark GorillaHard reportado).
- Tareas agénticas y razonamiento multi-paso con invocación de herramientas.
- Comprensión de personajes, contexto narrativo, acertijos y antónimos.
- Conocimiento profundo de historia, cultura, regiones, pueblos y legislación de Rusia.
- Trabajo con documentos y comprensión de contexto extenso (longitud concreta no disponible).
- Ejecución local offline sin conexión a internet.

## Casos de uso

- Atención al cliente en ruso: el modelo puede gestionar conversaciones multi-turno con contexto y corregir la formulación del usuario, gracias a su especialización lingüística y a su capacidad de instrucciones complejas; adecuado para sectores con normativa rusa.
- Asistencia legal y administrativa en Rusia: consultas sobre legislación federal, regional y procedimientos administrativos, apoyándose en el entrenamiento declarado sobre leyes y documentos rusos; requiere validación humana por riesgo de alucinación.
- Generación y revisión de código con tool calling: integración en pipelines de CI/CD o asistentes de IDE que invoquen funciones externas, aprovechando el rendimiento declarado en GorillaHard.
- Agentes autónomos multi-paso: orquestación de tareas que requieren planificación y llamadas a herramientas (APIs, calculadoras, bases de datos), gracias al modo thinking y al soporte de function calling.
- Educación y divulgación histórica y cultural: generación de material didáctico sobre historia y cultura rusas, con capacidad de razonamiento paso a paso para explicar conceptos.
- Procesamiento de documentos en ruso: resumen, extracción y respuesta sobre documentos largos en entorno offline, útil en administraciones y empresas con requisitos de confidencialidad.
- Despliegue en hardware de consumo: al ser un modelo de ~9B con GGUF, puede ejecutarse en estaciones de trabajo locales sin GPU de datacenter, para prototipado y uso personal.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (benchmark MERA v2, fecha de referencia 30.10.2026). No se han verificado de forma independiente en la información disponible.

| Benchmark / metrica | RusMind Sokol 4.7 | Referencia comparada |
|---|---|---|
| MERA v2 (global) | 0,279 | GigaChat 3.5 Ultra: 0,249; Qwen3.5-9B: 0,186; Gemma 4 E4B: 0,170; T-pro: 0,196 |
| MERA v2 (razonamiento) | 0,459 | GigaChat 3.5 Ultra: 0,429 |
| MERA v2 (comprension de personas) | 0,300 | T-pro: 0,249 |
| MERA v2 (cultura y regiones de Rusia) | 0,277 | T-pro: 0,233 |
| IFHard (instrucciones complejas) | 0,424 | T-pro y GigaChat 3.5 Ultra muy por debajo (factor 7,6-8x) |
| GorillaHard (tool calling) | 0,490 | 2,4-2,6x superior a T-pro, GigaChat 3.5 Ultra y Gemma 4 26B |
| MERA v2 vs Gemma 4 26B | 0,279 | Gemma 4 26B: 0,279 (empate global) |

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 18 GB para los 8,95 mil millones de parámetros (2 bytes por parámetro) más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: en torno a 9-10 GB.
- VRAM estimada en cuantización de 4 bits (GGUF Q4): en torno a 5-6 GB, con margen para contexto.
- GPU recomendadas para FP16: A100 40 GB, H100, L40S, RTX A6000; para cuantizaciones de 4-8 bits: RTX 4090 (24 GB), RTX 4080, RTX 3090.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más usando GGUF Q4; en 16-24 GB con cuantizaciones mayores o FP16 parcial.
- Opciones de despliegue: llama.cpp (soporte GGUF declarado), Ollama (a través de GGUF), vLLM y TGI (compatibles con safetensors y arquitectura Qwen3.5), transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MERA v2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RusMind Sokol 4.7 | 8,95B | No disponible | 0,279 | `rusmind-license` | Hugging Face (safetensors + GGUF) |
| Qwen3.5-9B (base) | ~9B | No disponible | 0,186 | Licencia Qwen (no especificada aqui) | Hugging Face |
| Gemma 4 26B | ~26B | No disponible | 0,279 | Licencia Gemma | Hugging Face |
| T-pro (T-Bank) | 33B | No disponible | 0,196 | No disponible | No disponible |
| GigaChat 3.5 Ultra | 432B | No disponible | 0,249 | Propietaria | API propietaria |

## Limitaciones y advertencias

- Riesgo de alucinación inherente a modelos de ~9B, especialmente en dominios legales e históricos donde el autor declara especialización; requiere verificación factual en producción.
- Sesgo cultural y geográfico: el entrenamiento se centra en fuentes rusas oficiales, legislación e historia de Rusia, lo que puede introducir sesgos de encuadre en temas políticos, históricos y sociales.
- Idiomas limitados a ruso e inglés; el rendimiento en otros idiomas no está documentado.
- Longitud de contexto no especificada en la información disponible; no se puede garantizar el rendimiento en contextos largos.
- Licencia `rusmind-license` de tipo `other`: es necesario revisar el archivo LICENSE del repositorio antes de cualquier uso comercial; las condiciones concretas no se detallan en la información proporcionada.
- Resultados de benchmarks declarados por el propio autor y no verificados de forma independiente en la información disponible.
- El repositorio de 109,4 GB incluye múltiples formatos; conviene descargar solo los archivos necesarios (safetensors o GGUF) para evitar consumo excesivo de almacenamiento.
- No se documentan técnicas de alineación (RLHF/DPO) ni evaluaciones de seguridad; el filtrado de contenido inapropiado queda a cargo del despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-Sokol-4.7
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Demo / plataforma del autor: https://rusmind.ru
- Leaderboard MERA v2: https://mera.a-ai.ru/ru/text/leaderboard
