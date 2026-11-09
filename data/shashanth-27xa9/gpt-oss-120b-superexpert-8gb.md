# shashanth-27xA9/GPT-OSS-120B-SuperExpert-8GB

## Resumen

GPT-OSS-120B-SuperExpert-8GB es una consolidación del modelo fundacional `openai/gpt-oss-120b` de OpenAI, un transformer de tipo Mixture-of-Experts (MoE) con 120.000 millones de parámetros y 36 capas, publicado bajo licencia Apache 2.0. El autor del derivado, shashanth-27xA9, aplica una técnica denominada AW-SECD (Activation-Weighted Super-Expert Consolidation & Residual Drift Compensation) para comprimir el modelo original a un footprint de 8,0 GB distribuido en 16 shards de safetensors, con el objetivo declarado de ejecutarlo en portátiles y equipos de sobremesa con 8-16 GB de RAM.

La propuesta es relevante porque apunta a un escenario de inferencia local en hardware de consumo sin GPU dedicada, algo poco habitual en modelos de esta escala. El autor afirma una retención de inteligencia agregada del 95,8 % respecto al modelo base, con una ventana de contexto nativa de 131.072 tokens. El modelo se distribuye con pipeline de text-generation y está etiquetado para razonamiento, matemáticas y código.

No obstante, la ficha se basa exclusivamente en la información publicada en Hugging Face: no hay paper, repositorio de código, informe técnico ni resultados de terceros que verifiquen las cifras declaradas. El modelo no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), 36 capas (heredada de `openai/gpt-oss-120b`) |
| Parámetros totales | 120.000 millones (modelo base); footprint consolidado de 8,0 GB |
| Parámetros activos | no disponible |
| Longitud de contexto | 131.072 tokens nativos |
| Tipos de cuantización | no disponible (el autor describe una consolidación AW-SECD, no una cuantización estándar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (16 shards) |

## Arquitectura y entrenamiento

El modelo base `openai/gpt-oss-120b` es un transformer MoE de 120.000 millones de parámetros y 36 capas. Sobre él, el autor aplica AW-SECD, una técnica propietaria de consolidación de "super-expertos" con compensación de deriva residual. La model card no detalla el algoritmo, el número de expertos consolidados, la metodología de ponderación por activaciones ni el procedimiento de compensación, por lo que no es posible evaluar su fundamento técnico a partir de la información disponible.

Tampoco se especifican los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO en el derivado. El modelo conserva la etiqueta `custom_code`, lo que implica que la carga requiere código personalizado más allá del transformer estándar de Hugging Face. No se documenta ninguna innovación adicional como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto con pipeline `text-generation`.
- Razonamiento de múltiples pasos (etiqueta `reasoning`).
- Resolución de problemas matemáticos (etiqueta `math`).
- Generación y comprensión de código (etiqueta `code`).
- Contexto largo de hasta 131.072 tokens.
- Ejecución en dispositivo (`on-device`) con footprint de 8 GB.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistencia de código en local: el modelo puede integrarse en editores o terminales de desarrolladores que trabajen en portátiles sin GPU dedicada, aprovechando su footprint de 8 GB para autocompletado, explicación de funciones y generación de tests en un entorno sin conexión.
- Razonamiento matemático sin conexión: adecuado para entornos educativos o de investigación donde no se permite enviar datos a la nube, resolviendo problemas de varios pasos dentro de la ventana de 131.072 tokens.
- Análisis de documentos largos en el dispositivo: con 131.072 tokens de contexto, permite resumir o extraer información de contratos, informes o bases de código completas sin fragmentación.
- Prototipado rápido con Ollama: la model card ofrece un comando de una línea (`ollama run hf.co/shashanth-27xA9/GPT-OSS-120B-SuperExpert-8GB`), lo que facilita pruebas de concepto en equipos de 8-16 GB de RAM.
- Procesamiento por lotes en estaciones de trabajo modestas: al no requerir GPU de datacenter, puede desplegarse en flotas de portátiles para tareas de clasificación, extracción o reescritura de texto.
- Evaluación de técnicas de compresión: útil como referencia para investigadores que estudien consolidación de expertos y deriva residual, comparando el comportamiento del derivado frente al modelo base.
- Escenarios de privacidad estricta: al ejecutarse en local, permite procesar datos sensibles (sanitarios, legales, financieros) sin salir del dispositivo.

## Benchmarks y rendimiento

Los datos siguientes proceden exclusivamente de la model card del autor y no han sido verificados de forma independiente.

| Benchmark | GPT-OSS 120B (base) | SuperExpert 8GB | Retención |
|---|---|---|---|
| ARC-Challenge | 88,2 % | 85,0 % | 96,4 % |
| GSM8K (matemáticas) | 86,5 % | 82,8 % | 95,7 % |
| HumanEval (código) | 81,0 % | 77,5 % | 95,7 % |
| MMLU | 82,4 % | 78,6 % | 95,4 % |
| Agregado | 84,5 % | 81,0 % | 95,8 % |

No se han publicado resultados de latencia, throughput ni consumo de memoria medidos de forma independiente.

## Requisitos de hardware

- VRAM/RAM estimada: 8,0 GB de footprint consolidado; el autor indica equipos con 8-16 GB de RAM.
- GPU recomendadas: no disponible; el modelo está orientado a CPU y portátiles sin GPU dedicada.
- ¿Cabe en GPU de consumo? No se especifica; por tamaño de pesos (8 GB) cabría teóricamente en GPUs con 8 GB o más de VRAM, pero no hay confirmación del autor.
- Opciones de despliegue: Ollama (comando documentado en la model card); vLLM, llama.cpp y TGI no están confirmados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| GPT-OSS-120B-SuperExpert-8GB | 120B (MoE, base) | 131.072 | Apache 2.0 | safetensors (16 shards) | Consolidación AW-SECD a 8 GB; sin verificación externa |
| openai/gpt-oss-120b | 120B (MoE) | 131.072 | Apache 2.0 | safetensors | Modelo base de referencia |
| Alternativas de 8 GB en dispositivo | no disponible | no disponible | no disponible | no disponible | No se dispone de comparables verificables con la información proporcionada |

## Limitaciones y advertencias

- Las cifras de retención (95,8 % agregado) y los benchmarks provienen únicamente de la model card del autor; no hay paper, repositorio ni evaluación de terceros que las respalde.
- La técnica AW-SECD no está documentada: se desconoce el número de expertos consolidados, la metodología de ponderación y el procedimiento de compensación de deriva.
- El modelo requiere `custom_code` para su carga, lo que añade dependencias y riesgo de mantenimiento.
- No se especifican los idiomas soportados; el rendimiento en castellano es desconocido.
- No hay información sobre sesgos, alucinación, tool calling, capacidades de agente ni comportamiento multilingüe.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del derivado ni sobre la procedencia de los datos del modelo base.
- El modelo no registra descargas ni interacciones, por lo que no existe evidencia comunitaria de funcionamiento.
- No se confirma compatibilidad con vLLM, llama.cpp o TGI; solo Ollama está documentado.
- El tamaño de 8 GB para un modelo de 120B parámetros implica una compresión muy agresiva; conviene validar el comportamiento real antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shashanth-27xA9/GPT-OSS-120B-SuperExpert-8GB
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
