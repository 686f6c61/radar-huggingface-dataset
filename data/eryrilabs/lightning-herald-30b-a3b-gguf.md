# EryriLabs/Lightning-Herald-30B-A3B-GGUF

## Resumen

Lightning-Herald-30B-A3B-GGUF es una colección de pesos cuantizados en formato GGUF del modelo base EryriLabs/Lightning-Herald-30B-A3B, un ajuste fino de tipo Hermes-Agent sobre NVIDIA Nemotron 3.5 Lightning. Desarrollado por EryriLabs (Dwain Barnes), este modelo combina una arquitectura de mezcla de expertos (MoE) con 30 mil millones de parámetros totales y solo 3 mil millones activos por token, lo que permite un rendimiento de inferencia cercano a modelos mucho más grandes con un coste computacional reducido. El ajuste se ha centrado en capacidades agénticas y tool calling, lo que lo hace especialmente adecuado para aplicaciones de agentes conversacionales y automatización de tareas.

La relevancia de esta versión GGUF radica en su despliegue local eficiente mediante llama.cpp y herramientas compatibles como llama-server. Al estar cuantizado en varios niveles (desde IQ4_XS hasta Q8_0), ofrece flexibilidad para ejecutarse en hardware de consumo (una GPU de 24 GB con contexto amplio) o en entornos con más recursos. El modelo hereda la licencia OpenMDW-1.1 y está diseñado para integrarse con Hermes Agent a través de una API compatible con OpenAI, lo que facilita su uso en pipelines de agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en NVIDIA Nemotron 3.5 Lightning |
| Parametros totales | 32.913.266.240 (30B nominales) |
| Parametros activos | 3.000.000.000 (3B) |
| Longitud de contexto | 32768 tokens (según comando de ejecución recomendado) |
| Tipos de cuantizacion | IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | No disponible |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | GGUF (convertido desde BF16 con llama.cpp b10413) |

## Arquitectura y entrenamiento

El modelo base Lightning-Herald-30B-A3B es un ajuste fino de NVIDIA Nemotron 3.5 Lightning, una arquitectura MoE con 30 mil millones de parámetros totales y 3 mil millones activos. Este diseño permite que cada token active solo una fracción de los parámetros, reduciendo significativamente la latencia y el uso de memoria en comparación con un modelo denso del mismo tamaño. El ajuste fino, denominado Hermes-Agent, se ha orientado a mejorar las capacidades de tool calling y razonamiento agéntico, probablemente mediante técnicas de supervisión con datos de instrucciones y ejemplos de uso de herramientas.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO. El autor indica que los datos de entrenamiento eran Apache 2.0, pero no se especifica su composición. La cuantización GGUF se realizó con llama.cpp versión b10413, que incluye soporte para la arquitectura Nemotron-H, necesaria para ejecutar este modelo correctamente.

## Capacidades

- Generación de texto y chat conversacional con plantilla Jinja para renderizado correcto de mensajes y herramientas.
- Tool calling estructurado: gracias al uso de `--jinja` en llama.cpp, el modelo puede generar llamadas a funciones y parsearlas en objetos `tool_calls` estructurados.
- Soporte agéntico: diseñado específicamente para integrarse con Hermes Agent, permitiendo flujos de trabajo de múltiples pasos con razonamiento y ejecución de acciones.
- Compatibilidad con API OpenAI: se puede servir mediante llama-server en el endpoint `/v1`, facilitando la integración con frameworks existentes.
- Multilingüismo: no confirmado; la información disponible no especifica idiomas soportados.
- Razonamiento y matemáticas: al estar basado en Nemotron 3.5 Lightning, hereda capacidades generales de razonamiento, aunque no se han publicado evaluaciones específicas.

## Casos de uso

- Asistentes conversacionales con acceso a herramientas: el modelo puede gestionar diálogos multi-turno y llamar a APIs externas (búsqueda web, bases de datos, calculadoras) gracias a su soporte nativo de tool calling, lo que lo hace ideal para asistentes personales o de soporte técnico.
- Automatización de tareas de oficina: integrándolo con Hermes Agent, puede ejecutar acciones como enviar correos, crear documentos o actualizar registros, siguiendo instrucciones en lenguaje natural.
- Agentes de atención al cliente: con una ventana de contexto de 32K tokens, puede manejar historiales largos de conversación y consultar sistemas de ticketing o CRM mediante funciones, ofreciendo respuestas contextualizadas.
- Generación de código asistida por herramientas: puede escribir código y ejecutarlo en un entorno controlado (por ejemplo, mediante tool calling a un intérprete), útil para prototipado rápido o resolución de problemas de programación.
- RAG (generación aumentada por recuperación): su capacidad de tool calling permite conectar con motores de búsqueda o bases vectoriales, combinando recuperación de información con generación de respuestas.
- Despliegue en entornos con recursos limitados: la cuantización IQ4_XS (19 GB) permite ejecutarlo en una GPU de 24 GB con contexto amplio, siendo adecuado para servidores locales o prototipos sin acceso a GPUs de gran tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona un "before/after benchmark" (comparación antes y después del ajuste), pero no se incluyen cifras concretas. Por tanto, no es posible presentar una tabla comparativa con datos verificados.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización:
  - IQ4_XS: 19 GB (cabe en una GPU de 24 GB con contexto grande).
  - Q4_K_M: 25 GB (requiere dos GPUs o CPU offload en una GPU de 24 GB).
  - Q5_K_M: 27 GB.
  - Q6_K: 35 GB.
  - Q8_0: 35 GB (casi sin pérdida de calidad).
- GPU recomendadas: para IQ4_XS, una RTX 4090 (24 GB) o similar es suficiente; para cuantizaciones mayores, se necesitan GPUs de 32 GB o más (A100, H100) o configuraciones multi-GPU.
- Opciones de despliegue: llama.cpp (llama-server), compatible con Hermes Agent a través de la API `/v1`. También se puede usar con otras herramientas que soporten GGUF, como Ollama o LM Studio, siempre que tengan soporte para Nemotron-H.
- Latencia y throughput: no se proporcionan datos específicos. Dado que es un MoE con 3B activos, se espera una latencia baja en comparación con modelos densos de 30B, pero depende del hardware y la cuantización.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de la misma categoría (MoE de ~30B con enfoque agéntico). Se podría comparar con Mixtral 8x7B (47B totales, 13B activos) o con el propio Nemotron 3.5 Lightning, pero no hay datos de rendimiento disponibles para Lightning-Herald. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Licencia OpenMDW-1.1: es una licencia personalizada que debe revisarse antes de un uso comercial. Aunque los datos de entrenamiento son Apache 2.0, los términos de la licencia del modelo pueden imponer restricciones adicionales.
- Sesgos y alucinaciones: al ser un modelo de lenguaje, puede generar contenido inexacto o sesgado. No se han publicado evaluaciones de sesgo específicas para este ajuste.
- Contexto limitado a 32K tokens: aunque es amplio, no es suficiente para documentos muy extensos; para contextos mayores sería necesario otro modelo.
- Dependencia de la versión de llama.cpp: requiere una build con soporte Nemotron-H (b10413 o superior); versiones antiguas no podrán cargar el modelo.
- Sin datos de rendimiento publicados: no hay benchmarks que permitan evaluar su calidad en tareas estándar (MMLU, HumanEval, etc.), por lo que su rendimiento real es incierto.
- Idiomas no especificados: no se confirma qué idiomas soporta, aunque probablemente herede las capacidades del modelo base (principalmente inglés).

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/EryriLabs/Lightning-Herald-30B-A3B-GGUF
- Modelo base (con model card completa y benchmarks): https://huggingface.co/EryriLabs/Lightning-Herald-30B-A3B
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Perfil del autor: https://huggingface.co/EryriLabs
