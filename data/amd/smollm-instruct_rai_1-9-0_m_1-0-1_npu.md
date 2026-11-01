# amd/SmolLM-Instruct_rai_1.9.0_m_1.0.1_npu

## Resumen
SmolLM-Instruct_rai_1.9.0_m_1.0.1_npu es una version del modelo SmolLM-Instruct de HuggingFace, publicada por AMD y optimizada para su ecosistema Ryzen AI. El identificador del repositorio indica que se trata de un artefacto en formato ONNX destinado a la unidad de procesamiento neuronal (NPU) de los procesadores AMD Ryzen AI, con la version de runtime RAI 1.9.0 y la revision de modelo 1.0.1. El modelo base SmolLM es un transformer decoder-only de pequeno tamano disenado para ejecucion en dispositivos con recursos limitados.

El interes de esta publicacion radica en que permite ejecutar un modelo conversacional directamente sobre la NPU integrada en los Ryzen AI, liberando la CPU y la GPU del sistema y reduciendo el consumo energetico en portatiles y mini-PC. Al estar empaquetado como ONNX y ligado a una version concreta del runtime de AMD, no es un modelo para entrenamiento ni para despliegue generico en servidores, sino un artefacto de inferencia para hardware especifico.

El repositorio tiene un tamano de 0,3 GB y acceso restringido (gated), por lo que requiere aceptar las condiciones en HuggingFace antes de descargarlo. La licencia del modelo base es Apache 2.0 y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM-Instruct), exportado a ONNX para NPU AMD Ryzen AI |
| Parametros totales | no disponible (el nombre del modelo base sugiere la variante SmolLM de 135M o 360M; no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (artefacto ONNX precompilado para NPU; no se documentan variantes) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (tag onnx; runtime Ryzen AI m_1.0.1_npu) |

## Arquitectura y entrenamiento
La informacion disponible no detalla la arquitectura interna ni el proceso de entrenamiento de esta publicacion. Por el identificador, se trata de una exportacion ONNX del modelo SmolLM-Instruct, un transformer decoder-only de la familia SmolLM de HuggingFace, adaptada al runtime Ryzen AI 1.9.0 (RAI) y a la version de modelo 1.0.1 para NPU. El tag `m_1.0.1_npu` indica que el artefacto esta compilado o empaquetado especificamente para la NPU de los Ryzen AI, no para GPU ni CPU genericas.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas concretas de esta variante. Cualquier afirmacion al respecto seria especulativa.

## Capacidades
- Generacion de texto y conversacion multi-turno (pipeline `text-generation`, tag `conversational`).
- Instrucciones: el sufijo `Instruct` indica ajuste para seguir instrucciones, aunque no se documenta el metodo exacto.
- Ejecucion en NPU AMD Ryzen AI mediante el runtime RAI 1.9.0.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles declarado.
- Vision, audio o modo thinking: no disponible.

## Casos de uso
- Asistentes conversacionales locales en portatiles con Ryzen AI: el modelo se ejecuta en la NPU y deja CPU y GPU libres para otras tareas, con bajo consumo energetico.
- Procesamiento de texto en el borde (edge computing): resumen, reescritura y clasificacion de documentos en mini-PC o dispositivos sin GPU dedicada.
- Prototipado de aplicaciones de IA generativa en Windows sobre hardware AMD: permite validar pipelines ONNX y el runtime Ryzen AI antes de escalar a modelos mayores.
- Automatizacion de respuestas en herramientas de escritorio: generacion de borradores y respuestas sugeridas dentro de aplicaciones ofimaticas o de correo.
- Filtrado y etiquetado de contenido en local: clasificacion de textos y extraccion de informacion sin enviar datos a la nube, util por privacidad.
- Educacion y demos de inferencia en NPU: escenario didactico para mostrar el funcionamiento de Ryzen AI y ONNX Runtime con un modelo pequeno y de licencia permisiva.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- Hardware objetivo: NPU de procesadores AMD Ryzen AI; el artefacto esta ligado al runtime RAI 1.9.0 y a la version de modelo 1.0.1, por lo que no es portable a otras plataformas sin reexportacion.
- VRAM estimada: no aplica en el sentido tradicional; el modelo se ejecuta en la NPU y en memoria del sistema. El repositorio ocupa 0,3 GB.
- GPU recomendadas: no aplica; esta variante no esta pensada para GPU. Para ejecucion en GPU habria que usar el modelo SmolLM-Instruct original.
- Compatibilidad con GPU de consumo: no disponible para esta variante.
- Opciones de despliegue: runtime Ryzen AI de AMD con ONNX Runtime; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI en este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolLM-Instruct_rai_1.9.0_m_1.0.1_npu (este) | no disponible | no disponible | ONNX para NPU Ryzen AI | Apache 2.0 | Gated en HuggingFace |
| SmolLM-Instruct (modelo base de HuggingFace) | variantes de 135M y 360M en la familia SmolLM | no disponible en esta ficha | safetensors / GGUF segun variante | Apache 2.0 | Publico |
| Otros modelos pequenos para edge (p. ej. Qwen2.5-0.5B-Instruct) | 0,5B | 32k en la familia Qwen2.5 | safetensors, GGUF | Apache 2.0 | Publico |

La comparativa se limita a rasgos generales porque la informacion proporcionada no incluye parametros exactos, contexto ni resultados de benchmarks de esta variante.

## Limitaciones y advertencias
- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en HuggingFace.
- Dependencia de hardware y runtime: solo funciona con la NPU de AMD Ryzen AI y el runtime RAI 1.9.0; no es un artefacto generico.
- Idioma: solo ingles declarado; el rendimiento en castellano no esta garantizado.
- Riesgo de alucinacion: inherente a los modelos de lenguaje pequenos; no se documenta mitigacion especifica.
- Sesgos: no se documentan evaluaciones de sesgo para esta variante.
- Contexto: no disponible; en modelos pequenos suele ser limitado, lo que restringe conversaciones largas y documentos extensos.
- Uso comercial: la licencia Apache 2.0 lo permite, pero conviene verificar las condiciones del acceso gated y las del modelo base.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; sin evidencia de uso en produccion.

## Enlaces
- HuggingFace: https://huggingface.co/amd/SmolLM-Instruct_rai_1.9.0_m_1.0.1_npu
- Modelo base SmolLM (HuggingFace): no disponible en la informacion proporcionada
- Documentacion de Ryzen AI: no disponible en la informacion proporcionada
- Paper o blog de AMD sobre esta publicacion: no disponible en la informacion proporcionada
