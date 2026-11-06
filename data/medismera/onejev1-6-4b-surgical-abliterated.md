# medismera/OneJev1.6-4B-Surgical-Abliterated

## Resumen

OneJev1.6-4B-Surgical-Abliterated es una versión "abliterada" (sin mecanismos de rechazo) del modelo OmniJev/OneJev1.6-4B, publicada por el usuario medismera en Hugging Face. El modelo base es un modelo de lenguaje causal de aproximadamente 4.500 millones de parámetros orientado a generación de texto conversacional, con razonamiento mejorado y seguimiento de instrucciones multi-turno según su autor. La versión abliterada aplica una técnica de "ablación quirúrgica de rechazos" que elimina el subespacio latente responsable de las negativas estandarizadas del modelo, con el objetivo de que responda directamente a peticiones técnicas sin emitar rechazos ni advertencias morales.

Este tipo de derivado es relevante para investigadores y equipos de red-teaming que necesitan modelos sin filtros de alineación para auditar sistemas, estudiar comportamientos de seguridad o explorar capacidades sin restricciones. Según la model card, la ablación se realizó preservando el conocimiento factual, la precisión en código y el razonamiento lógico mediante proyecciones ortogonales benignas con preservación de la norma de Frobenius. El modelo se distribuye bajo licencia Apache 2.0, en formatos safetensors y GGUF, y su idioma principal es el inglés.

Debe subrayarse que la información disponible procede casi íntegramente de la model card del autor, sin benchmarks verificables de terceros ni documentación técnica detallada sobre el modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer causal-lm, segun tags del repo) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors y GGUF, sin detalle de cuants) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo base, OmniJev/OneJev1.6-4B, es un modelo de lenguaje causal basado en la arquitectura qwen3_5, es decir, un transformer decoder de la familia Qwen con aproximadamente 4.500 millones de parametros. La model card lo describe como un modelo "agil" con razonamiento mejorado y seguimiento de instrucciones multi-turno, aunque no se detallan datos de entrenamiento (numero de tokens, composicion del dataset ni procesos de RLHF/DPO).

Sobre esta base se aplico una ablacion quirurgica de rechazos: una modificacion de las representaciones latentes direccionales en capas criticas del transformer para eliminar el "subespacio unificado de rechazo", el conjunto de direcciones latentes que activa las respuestas de negativa estandarizadas. El autor afirma que la proyeccion se realizo bajo restricciones ortogonales benignas y con preservacion de la norma de Frobenius, con el fin de no degradar la sintaxis de programacion, la correccion algoritmica ni la profundidad de razonamiento. No hay publicacion tecnica independiente que verifique estos procedimientos ni sus resultados.

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones multi-turno.
- Razonamiento logico, segun la descripcion del autor del modelo base.
- Generacion de codigo: la model card afirma preservacion total de la sintaxis de programacion y la correccion algoritmica tras la ablacion.
- Respuesta directa a prompts tecnicos de ciberseguridad, auditoria de redes y analisis de sistemas sin emision de tokens de rechazo.
- Generacion creativa sin restricciones de alineacion.
- No hay informacion sobre vision, audio, tool calling ni capacidades multimodales: no disponible.

## Casos de uso

- Red-teaming y evaluacion de seguridad: permite estudiar como responden modelos sin filtros a prompts adversariales, util para equipos que evaluan robustez de sistemas de IA desplegados.
- Auditoria de ciberseguridad: la model card muestra como ejemplo la generacion de scripts de auditoria de redes locales con raw sockets en Python, tarea para la que el modelo responde sin rechazos.
- Analisis de malware e investigacion defensiva: puede describir tecnicas, patrones de ataque y contramedidas sin las negativas habituales de modelos alineados, siempre en contextos legitimos de investigacion.
- Investigacion academica sobre alineacion: al ser un modelo abliterado de pesos abiertos, sirve como sujeto de estudio para analizar el efecto del "alignment tax" en el rendimiento.
- Generacion creativa sin restricciones: escritura de ficcion con contenido que otros modelos rechazarian, dentro de los limites legales aplicables.
- Prototipado local de asistentes tecnicos: su tamano de 4B permite ejecutarlo en hardware de consumo para construir prototipos de agentes de linea de comandos o analisis de logs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma cualitativamente que la ablacion preserva "benchmarks de conocimiento factual, precision en codigo y razonamiento logico", pero no incluye numeros concretos ni comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 9-10 GB para los pesos (4,54 GB x 2 bytes), mas overhead de KV cache y activaciones; en la practica, unos 12 GB de VRAM son recomendables.
- Con cuantizacion GGUF a 4 bits (Q4_K_M o similar), el footprint baja a unos 3-4 GB, accesible para GPUs de consumo con 6-8 GB de VRAM o incluso CPU con RAM suficiente.
- GPU recomendadas: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 para inferencia local comoda; en entorno de servidor, cualquier GPU moderna con 16 GB o mas (A10G, A100) es mas que suficiente para un modelo de este tamano.
- Cabe sin problemas en GPUs de consumo: cualquier tarjeta con 12 GB de VRAM ejecuta la version en bf16, y con GGUF cuantizado basta una GPU de 6-8 GB.
- Opciones de despliegue: transformers (codigo de ejemplo en la model card con trust_remote_code=True), llama.cpp y Ollama gracias a los pesos GGUF, y soluciones estandar como vLLM, TGI o LM Studio. No hay configuraciones de despliegue documentadas especificamente.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| OneJev1.6-4B-Surgical-Abliterated | 4,54B | no disponible | Apache 2.0 | Abliterado, sin rechazos, safetensors + GGUF |
| Qwen3-4B (base de la familia qwen3_5) | 4B | 32K (version Qwen3 estandar) | Apache 2.0 | Modelo oficial con alineacion completa, benchmarks publicados |
| Dolphin 3.0 (basado en Qwen, de Cognitive Computations) | 8B / 24B | 32K+ | Apache 2.0 / otros | Ajuste fino sin censura mediante fine-tuning, alternativa consolidada a la ablacion |

La principal diferencia frente a alternativas como Dolphin es la tecnica: la ablacion latente modifica el modelo base sin reentrenamiento completo, mientras que Dolphin emplea fine-tuning sobre datasets sin filtrar. No hay datos de rendimiento que permitan comparar calidad de salida entre ellos.

## Limitaciones y advertencias

- Al tratarse de un modelo deliberadamente sin mecanismos de rechazo, puede generar contenido perjudicial, ilegal o peligroso si se le solicita; la responsabilidad del uso recae integramente en el usuario, tal como indica la propia model card.
- Riesgo de alucinacion elevado en la practica: no hay evaluaciones independientes que verifiquen las afirmaciones de preservacion de conocimiento y razonamiento tras la ablacion.
- La ablacion de rechazos puede degradar sutilmente otras capacidades; aunque el autor afirma lo contrario con tecnicas de preservacion de norma, no existen benchmarks de terceros que lo confirmen.
- Idioma limitado al ingles segun los metadatos; no hay soporte documentado para castellano ni otros idiomas.
- La longitud de contexto no esta documentada, lo que dificulta planificar aplicaciones con documentos largos o conversaciones extensas.
- El modelo base (OmniJev/OneJev1.6-4B) carece de documentacion tecnica detallada publica, lo que introduce incertidumbre sobre su procedencia, datos de entrenamiento y calidad real.
- Aunque la licencia Apache 2.0 permite uso comercial, desplegar en produccion un modelo abliterado sin salvaguardas puede incumplir normativas sectoriales (RGPD, AI Act europeo, politicas de plataformas) y las condiciones de uso de proveedores cloud.
- No apto para entornos de produccion orientados a usuarios finales sin capas de moderacion externas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/medismera/OneJev1.6-4B-Surgical-Abliterated
- Modelo base: https://huggingface.co/OmniJev/OneJev1.6-4B
- Paper, repositorio de codigo o demo: no disponible
