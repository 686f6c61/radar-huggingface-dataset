# shashanth-27xA9/Numbat-SuperExpert-12GB

## Resumen

Numbat-SuperExpert-12GB es una consolidación on-device del modelo base `burner22/numbat`, una arquitectura MoE descrita por el autor como de aproximadamente 14 billones de parámetros (14T), 114 capas y 1.224 expertos, con atención híbrida GDN/MLA. El modelo lo publica el usuario `shashanth-27xA9` en Hugging Face y aplica una técnica propia denominada AW-SECD (Activation-Weighted Super-Expert Consolidation & Residual Drift Compensation) para comprimir la arquitectura original en un único artefacto de 12 GB distribuido en 18 shards de Safetensors.

El objetivo declarado es ejecutar inferencia de un modelo de razonamiento, matemáticas y código en portátiles y equipos de sobremesa con 16 GB de RAM, sin GPU dedicada, manteniendo según el autor un 95,2 % del rendimiento agregado del modelo fundacional. La ventana de contexto anunciada es de hasta 262.144 tokens, y la licencia es Apache 2.0.

La relevancia del artefacto depende enteramente de las afirmaciones del autor: la model card no incluye detalles del proceso de consolidación, no publica la metodología de evaluación, no documenta idiomas soportados ni ofrece pesos intermedios o scripts reproducibles. Cualquier evaluación de producción debería tratar los datos de retención como no verificados de forma independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido con atención GDN/MLA (según model card); 114 capas y 1.224 expertos en el modelo base |
| Parámetros totales | ~14T en el modelo base `burner22/numbat`; el artefacto consolidado ocupa 12,0 GB en disco (parámetros efectivos del consolidado no disponibles) |
| Parámetros activos | no disponible |
| Longitud de contexto | hasta 262.144 tokens |
| Tipos de cuantización | no disponible (el artefacto se distribuye como consolidación de 12 GB en 18 shards Safetensors; no se documentan formatos GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (18 shards, 12,0 GB); se anuncia ejecución vía Ollama con `hf.co/shashanth-27xA9/Numbat-SuperExpert-12GB` |

## Arquitectura y entrenamiento

El modelo base `burner22/numbat` se describe como un MoE de aproximadamente 14 billones de parámetros con 114 capas y 1.224 expertos, combinando mecanismos de atención GDN (Gated Delta Network, presumiblemente una variante de atención lineal con estado recurrente) y MLA (Multi-head Latent Attention, la atención con compresión latente de KV cache popularizada por DeepSeek). El artefacto publicado no es un modelo entrenado desde cero, sino una consolidación: según la model card, AW-SECD fusiona los expertos ponderando por activación y compensa la deriva residual introducida por la compresión, reduciendo el conjunto a 12 GB.

No se documenta el número de tokens de entrenamiento del modelo base, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. Tampoco se especifica qué expertos se conservan, cuántos se fusionan, ni qué precisión numérica tienen los pesos consolidados. La afirmación de "95,2 % de inteligencia retenida" procede exclusivamente de la model card y no va acompañada de scripts de evaluación, semillas, prompts o particiones de test reproducibles.

## Capacidades

- Generación de texto general con pipeline `text-generation`.
- Razonamiento y matemáticas: la model card reporta retención en GSM8K y ARC-Challenge, lo que sugiere capacidad para problemas aritméticos de varios pasos y preguntas de razonamiento científico.
- Generación de código: se reporta retención en HumanEval, orientada a síntesis de funciones a partir de docstrings.
- Conocimiento general: se reporta retención en MMLU.
- Contexto largo: se anuncia soporte de hasta 262.144 tokens, adecuado para documentos extensos o repositorios de código, aunque no se documenta la degradación de calidad a longitudes extremas.
- Ejecución on-device: el formato de 12 GB está pensado para equipos con 16 GB de RAM mediante Ollama.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible; el pipeline es únicamente de texto.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistente de código en portátil de desarrollo: con 12 GB de pesos y 16 GB de RAM, el modelo puede ejecutarse localmente vía Ollama para autocompletado, explicación de funciones y generación de tests unitarios sin enviar código propietario a servicios externos; encaja por su retención declarada en HumanEval y su licencia Apache 2.0.
- Tutor de matemáticas offline: para entornos educativos sin conectividad, el modelo puede resolver problemas de aritmética multi-paso y explicar el procedimiento, apoyándose en el 84,8 % declarado en GSM8K.
- Análisis de documentación extensa: la ventana de 262.144 tokens permite cargar contratos, manuales técnicos o expedientes completos y hacer preguntas sobre ellos en una sola pasada, útil en despachos o departamentos legales con requisitos de confidencialidad.
- Procesamiento por lotes en estaciones de trabajo sin GPU: al no requerir acelerador dedicado, puede integrarse en scripts nocturnos de clasificación, resumen o extracción de entidades sobre corpus internos.
- Prototipado rápido de aplicaciones de razonamiento: investigadores que necesiten un modelo local para experimentar con cadenas de razonamiento o evaluaciones de matemáticas pueden desplegarlo con un solo comando de Ollama y sustituirlo después por alternativas verificadas.
- Base para ajuste fino ligero: al publicarse en Safetensors con licencia Apache 2.0, es posible aplicar LoRA o adaptadores sobre los shards consolidados para dominios específicos, siempre que la arquitectura custom sea compatible con las librerías estándar (requiere `trust_remote_code`).

## Benchmarks y rendimiento

Los únicos datos disponibles son los de la model card del autor, que comparan el modelo fundacional de 14T con el consolidado de 12 GB. No se aportan resultados de modelos de referencia de terceros ni detalles del arnés de evaluación.

| Benchmark | Fundacional 14T MoE | Numbat 12GB SuperExpert | Retención declarada |
|---|---|---|---|
| ARC-Challenge | 90,8 % | 87,6 % | 96,5 % |
| GSM8K | 89,2 % | 84,8 % | 95,1 % |
| HumanEval | 85,0 % | 80,8 % | 95,0 % |
| MMLU | 88,5 % | 84,1 % | 95,0 % |
| Agregado | 88,4 % | 84,3 % | 95,2 % |

Estos valores no han sido verificados de forma independiente y deben tratarse como afirmaciones del autor.

## Requisitos de hardware

- VRAM/RAM estimada: el artefacto pesa 12,0 GB en Safetensors; se recomienda un mínimo de 16 GB de RAM para cargarlo con margen para el contexto y el runtime, tal como indica el autor.
- GPU recomendadas: no se especifican; el diseño apunta a CPU. En GPU, cabría en tarjetas con 16 GB o más de VRAM (RTX 4080, RTX 4090, A100 40 GB, H100) si el runtime soporta la arquitectura custom, pero no hay datos de rendimiento.
- ¿Cabe en GPU de consumo? Sí, en principio en cualquier GPU con 16 GB o más de VRAM; en GPUs de 8-12 GB requeriría cuantización adicional, que no se distribuye.
- Opciones de despliegue: Ollama mediante `ollama run hf.co/shashanth-27xA9/Numbat-SuperExpert-12GB`; al usar `custom_code`, es previsible que requiera `trust_remote_code=True` en Transformers. Compatibilidad con vLLM, TGI o llama.cpp no está documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información verificable sobre modelos comparables de la misma categoría (consolidaciones MoE on-device de 12 GB) ni sobre el propio `burner22/numbat` más allá de lo citado. Se indica "no disponible" para parámetros activos, contexto y rendimiento de alternativas.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Numbat-SuperExpert-12GB | ~14T en base; consolidado de 12 GB | 262.144 tokens | Apache 2.0 | Hugging Face, Ollama |
| `burner22/numbat` (base) | ~14T | no disponible | no disponible | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los benchmarks y el "95,2 % de retención" son afirmaciones del autor sin evaluación independiente ni scripts reproducibles; no deben citarse como resultados verificados.
- No se documenta la metodología AW-SECD, lo que impide auditar qué información se ha perdido en la consolidación ni qué expertos se han descartado.
- El uso de `custom_code` implica ejecutar código del repositorio del autor; conviene revisarlo antes de desplegar en producción.
- Idiomas soportados no documentados: no hay garantía de calidad en castellano ni en otras lenguas distintas del inglés.
- Riesgo de alucinación no cuantificado; al ser un modelo comprimido, la degradación puede concentrarse en dominios concretos no cubiertos por los benchmarks publicados.
- La ventana de 262.144 tokens no va acompañada de datos sobre degradación de calidad en longitudes extremas ni de consumo de memoria asociado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que impide contrastar experiencias de terceros.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentación sobre el origen de los datos de entrenamiento del modelo base impide confirmar la cadena de derechos.
- No se garantiza compatibilidad con vLLM, TGI, llama.cpp ni cuantizaciones estándar; el soporte práctico se limita a lo anunciado (Ollama).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shashanth-27xA9/Numbat-SuperExpert-12GB
- Modelo base: https://huggingface.co/burner22/numbat
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
