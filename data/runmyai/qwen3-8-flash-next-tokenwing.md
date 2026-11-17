# runmyai/Qwen3.8-Flash-Next-TokenWing

## Resumen

Qwen3.8-Flash-Next-TokenWing es una distribución cuantizada y reempaquetada del modelo Qwen3.8-Flash-Next de Qwen, publicada por el usuario runmyai bajo el paraguas del proyecto TokenWing. Se trata de un modelo de arquitectura mixture-of-experts (MoE) con 176.943.899.520 parámetros totales según los pesos en safetensors del repositorio base, empaquetado en formato GGUF mediante la cuantización WV-v5 de 3,5 bits por peso (bpw) realizada por Grawnch. El repositorio ocupa 84,5 GB.

La innovación principal no está en los pesos, que son idénticos a la cuantización original de Grawnch, sino en el layout del archivo: el primer fichero GGUF se reorganiza para que los expertos puedan leerse directamente desde el SSD, permitiendo que un modelo de este tamaño se ejecute en PCs convencionales con menos memoria RAM que el tamaño total del modelo. Esta técnica de streaming desde disco es la propuesta central de TokenWing, y la app Run My AI automatiza la descarga y configuración.

El modelo es relevante para desarrolladores que quieren evaluar modelos MoE grandes en hardware de consumo sin infraestructura de servidor. Sin embargo, la información pública disponible es muy limitada: no se documentan idiomas soportados, benchmarks, datos de entrenamiento ni detalles de la arquitectura más allá de la etiqueta MoE. La licencia es la Qwen Community License 1.0, heredada del modelo original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE), según tags del repositorio; detalles de la arquitectura base no disponibles |
| Parametros totales | 176.943.899.520 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF WV-v5 a 3,5 bpw (Grawnch); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (license_name: qwen-community-1.0) |
| Formato de pesos | GGUF (repositorio principal); safetensors en el modelo base |

## Arquitectura y entrenamiento

La información disponible confirma que el modelo base Qwen3.8-Flash-Next emplea una arquitectura mixture-of-experts, pero no se detallan el número de expertos, el número de parámetros activos por token, la longitud de contexto nativa ni la composición del dataset de entrenamiento. Tampoco se documenta si hubo fases de RLHF, DPO u otras técnicas de alineación. Todos estos datos figuran como no disponibles en la información proporcionada.

La contribución técnica de esta ficha es el reempaquetado TokenWing: los pesos de la cuantización WV-v5 3,5 bpw de Grawnch se mantienen sin cambios, pero el layout del primer fichero GGUF se modifica para que los expertos se lean directamente desde el SSD. El repositorio incluye además ficheros de datos propios de TokenWing (corrección, lista de VRAM y semilla de uso). Esta disposición permite el streaming de pesos desde almacenamiento persistente, de modo que el modelo puede ejecutarse en equipos con menos memoria que el tamaño total del modelo. No se especifican en la información disponible mecanismos adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional: el tag `conversational` del repositorio indica uso previsto para diálogo.
- Razonamiento y generación de código: capacidades inferidas del modelo base Qwen3.8-Flash-Next, aunque no se documentan explícitamente en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el repositorio no declara idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere integración con infraestructura de serving compatible, aunque no se detalla cuál.

## Casos de uso

- Evaluación local de modelos MoE grandes en PC de consumo: gracias al streaming de expertos desde SSD que implementa TokenWing, un desarrollador puede probar un modelo de 176.900 millones de parámetros totales en un equipo con menos RAM que el tamaño del modelo, sin necesidad de GPU de centro de datos.
- Prototipado de asistentes conversacionales: el tag `conversational` y la cuantización de 3,5 bpw permiten desplegar un chatbot de propósito general en un PC convencional mediante la app Run My AI, que automatiza la descarga y configuración.
- Investigación sobre cuantización extrema: el paquete permite comparar el comportamiento de la cuantización WV-v5 3,5 bpw de Grawnch frente a otras cuantizaciones del mismo modelo base, útil para estudiar la degradación de calidad en MoE a baja precisión.
- Desarrollo de pipelines de inferencia con streaming de pesos: TokenWing sirve como referencia para ingenieros que quieran implementar lectura de expertos desde disco en sus propios runners, dado que el layout del GGUF está documentado en el repositorio de GitHub del proyecto.
- Pruebas de integración con endpoints compatibles: el tag `endpoints_compatible` permite experimentar con el modelo en infraestructuras de serving que acepten este formato, aunque no se detalla cuáles.
- Formación y demos: al no requerir hardware de centro de datos, el modelo es adecuado para talleres y demostraciones donde se explique el funcionamiento de arquitecturas MoE y técnicas de cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; la cuantización a 3,5 bpw sobre 176.943.899.520 parámetros implica un tamaño de pesos del orden de decenas de GB, y el repositorio completo ocupa 84,5 GB. El repositorio incluye una lista de VRAM propia de TokenWing, pero su contenido no se detalla en la información proporcionada.
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU de consumo? El diseño de TokenWing está orientado a ejecución en PCs ordinarios con streaming desde SSD, incluso con menos memoria que el tamaño del modelo; no se especifican modelos concretos de GPU.
- Opciones de despliegue: app Run My AI (recomendada por el autor), runtime TokenWing (https://github.com/runmyai/tokenwing). Otras opciones como llama.cpp, vLLM, Ollama o TGI no se mencionan en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-TokenWing | 176.943.899.520 | no disponible | GGUF WV-v5 3,5 bpw | Qwen Community License 1.0 | Hugging Face (runmyai) |
| Qwen3.8-Flash-Next (base) | no disponible | no disponible | safetensors | Qwen Community License 1.0 | Hugging Face (Qwen) |
| Qwen3.8-Flash-Next-WV-v5-3.5bpw-GGUF (Grawnch) | no disponible | no disponible | GGUF WV-v5 3,5 bpw | Qwen Community License 1.0 | Hugging Face (Grawnch) |

No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer una comparación de rendimiento con alternativas de la misma categoría. Los dos modelos listados son el origen directo de esta distribución, no alternativas independientes.

## Limitaciones y advertencias

- Información pública muy escasa: no se documentan idiomas, contexto, parámetros activos, datos de entrenamiento ni benchmarks, lo que dificulta evaluar su idoneidad para producción.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de fidelidad para esta cuantización.
- Sesgos conocidos: no documentados en la información disponible; se heredan los del modelo base Qwen3.8-Flash-Next, que tampoco se detallan.
- Cuantización agresiva: 3,5 bpw es una precisión baja que puede degradar la calidad respecto a los pesos originales; no se han publicado comparativas de calidad frente a cuantizaciones mayores.
- Licencia: Qwen Community License 1.0, que puede imponer restricciones al uso comercial; es necesario revisar el texto completo en el fichero LICENSE del repositorio antes de desplegar en producción.
- Dependencia de la app y el runtime del autor: el flujo recomendado pasa por Run My AI y TokenWing, lo que introduce dependencia de herramientas de terceros no auditadas de forma independiente.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- Rendimiento dependiente del SSD: el streaming de expertos desde disco puede introducir latencia variable según el almacenamiento del equipo; no se publican cifras de throughput.

## Enlaces

- Hugging Face: https://huggingface.co/runmyai/Qwen3.8-Flash-Next-TokenWing
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Cuantización de origen (Grawnch): https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-WV-v5-3.5bpw-GGUF
- Repositorio TokenWing: https://github.com/runmyai/tokenwing
- App Run My AI: https://runmyai.org
