# mradermacher/SalgrAI_v2.1-GGUF

## Resumen

SalgrAI_v2.1 es un modelo de lenguaje conversacional en ruso, afinado a partir de la familia Gemma 3 de Google, desarrollado por el usuario salgr. Esta ficha concreta corresponde a la version cuantizada en formato GGUF publicada por mradermacher, un conocido distribuidor de cuantizaciones estaticas para la comunidad de llama.cpp y Ollama. El modelo original pesa aproximadamente 131 millones de parametros, lo que lo situa en la categoria de modelos diminutos (tiny-model), pensados para ejecucion en CPU o en GPUs de gama baja.

La relevancia de esta publicacion es doble. Por un lado, ofrece una alternativa ligera y de bajo coste para tareas de chat en ruso con requisitos de hardware minimos (menos de 1 GB de RAM en cuantizaciones agresivas). Por otro, incorpora tecnicas de poda de vocabulario (vocabulary-pruning) y de mezcla de modelos (model-soup) en su entrenamiento, lo que sugiere un esfuerzo por optimizar el rendimiento de un modelo pequeno para un idioma concreto sin recurrir a un modelo multilingue de mayor tamano.

El repositorio de mradermacher incluye 12 cuantizaciones estaticas en formato GGUF (desde Q2_K hasta f16), todas ellas de aproximadamente 0,2 GB de tamano excepto la f16, que ocupa 0,4 GB. No se dispone de cuantizaciones ponderadas con imatrix en el momento de la publicacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 3) |
| Parametros totales | 131.105.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ruso (ru) |
| Licencia | Gemma (terminos de licencia de Google Gemma) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base SalgrAI_v2.1 es un ajuste fino de la familia Gemma 3 de Google, una arquitectura transformer decoder-only. Con 131 millones de parametros, se trata de un modelo extremadamente compacto, disenado para inferencia en entornos con recursos limitados. La model card del repositorio de cuantizacion no detalla la configuracion exacta de capas, dimensiones ocultas ni el numero de cabezas de atencion, por lo que estos datos no estan disponibles.

El autor del modelo base indica el uso de dos tecnicas destacables: poda de vocabulario (vocabulary-pruning), que reduce el tamano del vocabulario para especializarlo en ruso y disminuir el numero de parametros del embedding, y model-soup, una tecnica de fusion de pesos de multiples modelos afinados para mejorar la robustez y el rendimiento general. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco hay datos sobre innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ruso, orientada a dialogos multi-turno.
- Ajuste fino especifico para tareas de chat (tag `chat`), lo que sugiere un formato de conversacion definido.
- Modelo especializado en un unico idioma (ruso), sin capacidades multilingues declaradas.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declara capacidad de vision, audio ni modo de pensamiento (thinking mode).
- Tamano reducido que permite ejecucion en CPU y dispositivos con poca memoria.

## Casos de uso

- Chat conversacional en ruso en dispositivos de gama baja: el modelo puede ejecutarse en un portatil sin GPU dedicada gracias a sus cuantizaciones de 0,2 GB, gestionando conversaciones simples con baja latencia.
- Asistente de texto integrado en aplicaciones de escritorio o moviles: al caber en menos de 1 GB de RAM, puede embeberse en aplicaciones nativas para generar respuestas o autocompletar texto en ruso.
- Prototipado rapido de pipelines de NLP en ruso: util para validar flujos de preprocesamiento, tokenizacion y generacion antes de escalar a modelos mayores.
- Filtrado y clasificacion de texto en ruso: aunque no esta declarado explicitamente, un modelo de chat pequeno puede adaptarse mediante prompting para tareas de etiquetado o moderacion ligera.
- Educacion y demos de IA: su bajo coste de despliegue lo hace adecuado para talleres, cursos o demostraciones donde no se dispone de hardware especializado.
- Entornos con restricciones de privacidad: al poder ejecutarse localmente en CPU, permite procesar texto en ruso sin enviar datos a servicios en la nube.
- Generacion de respuestas en sistemas de FAQ o atencion al cliente de baja complejidad: para consultas frecuentes y respuestas cortas, el modelo puede servir como primera capa de atencion automatizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en cuantizaciones Q4_K_M o inferiores (0,2 GB de pesos); aproximadamente 0,5 GB para f16.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1050, RTX 3050, etc.); tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna e incluso en Raspberry Pi o dispositivos similares.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput estimados: no disponibles. Dado el tamano del modelo, se espera una latencia muy baja en CPU y practicamente instantanea en GPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| SalgrAI_v2.1 (GGUF) | 131 M | no disponible | Ruso | Gemma | GGUF |
| Gemma 3 (modelo base) | no disponible | no disponible | Multilingue | Gemma | safetensors, GGUF |
| Qwen2.5-0.5B | 500 M | no disponible | Multilingue | Apache 2.0 | safetensors, GGUF |
| SmolLM2-135M | 135 M | no disponible | Ingles (principalmente) | Apache 2.0 | safetensors, GGUF |

La comparativa se limita a modelos de la misma categoria de tamano (tiny-models). SalgrAI_v2.1 se diferencia por su especializacion en ruso y su licencia Gemma, mas restrictiva que Apache 2.0. No se dispone de datos de rendimiento comparativo para establecer diferencias cualitativas.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en ruso; no se declara soporte para otros idiomas, por lo que su uso en castellano u otras lenguas producira resultados deficientes.
- Con 131 millones de parametros, la capacidad de razonamiento, coherencia a largo plazo y conocimiento factual es muy limitada en comparacion con modelos de mayor tamano.
- Riesgo elevado de alucinacion en preguntas factuales o tecnicas, dado el reducido volumen de conocimiento almacenado.
- No se dispone de informacion sobre sesgos especificos, pero los modelos pequenos afinados con datasets limitados suelen heredar sesgos de sus datos de entrenamiento.
- La licencia Gemma impone restricciones de uso comercial y requiere el cumplimiento de los terminos de Google; es necesario revisarlos antes de un despliegement en produccion.
- No se dispone de informacion sobre la longitud de contexto soportada, lo que limita la planificacion de casos de uso con documentos largos.
- Las cuantizaciones Q2_K y Q3_K_S pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso practico.
- No hay cuantizaciones ponderadas con imatrix disponibles, lo que podria afectar a la calidad en comparacion con cuantizaciones optimizadas.
- El modelo no declara soporte de tool calling ni agentes, por lo que no es adecuado para pipelines automatizados complejos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/SalgrAI_v2.1-GGUF
- Modelo base: https://huggingface.co/salgr/SalgrAI_v2.1
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#SalgrAI_v2.1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
