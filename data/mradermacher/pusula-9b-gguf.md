# mradermacher/Pusula-9B-GGUF

## Resumen

Pusula-9B-GGUF es la distribucion en formato GGUF del modelo Pusula-9B, un modelo de lenguaje de 9.000 millones de parametros desarrollado por serhatkagans y orientado principalmente al turco, con soporte secundario de ingles. La cuantizacion la ha realizado mradermacher, un publicador habitual de versiones GGUF de modelos open source, que ofrece el modelo en una bateria de niveles de cuantizacion (Q2_K a f16) listos para su uso con llama.cpp, Ollama y LM Studio.

El modelo base se ha afinado mediante SFT (supervised fine-tuning) con QLoRA/LoRA sobre el dataset turco `serhatkagans/turkish-chat-sft-v3`, con el objetivo declarado de cubrir conversacion multi-turno, instruction-following, razonamiento, matematicas, codigo, escritura creativa y tool/function calling. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia actual radica en que cubre un nicho poco atendido: un asistente conversacional de tamano medio (9B) con enfasis real en turco y con cuantizaciones GGUF que permiten ejecutarlo en hardware de consumo. No obstante, la informacion publica disponible es muy limitada: no hay benchmarks, no se especifica la longitud de contexto ni la arquitectura exacta, y el modelo base original no documenta detalles de entrenamiento mas alla del dataset de SFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformers; familia no especificada en la informacion disponible) |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, ademas de mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base (no se confirma si es un transformer denso clasico ni la familia de la que deriva). Lo que si consta es el proceso de ajuste: el modelo Pusula-9B se ha entrenado mediante SFT con QLoRA/LoRA sobre el dataset `serhatkagans/turkish-chat-sft-v3`, un corpus de conversacion en turco orientado a instrucciones, multi-turno y tareas de asistente. El resultado se ha convertido a formato GGUF y cuantizado por mradermacher con la herramienta estandar de llama.cpp (convert_type: hf), generando cuantizaciones estaticas sin versiones imatrix ponderadas en el momento de la publicacion.

No se especifica el numero de tokens de entrenamiento, la composicion detallada del dataset, ni si hubo fases de RLHF o DPO posteriores al SFT. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. La presencia de ficheros `mmproj` (multi-modal supplement) en el repositorio sugiere que el modelo base podria tener capacidad multimodal, pero la model card no lo confirma ni lo describe.

## Capacidades

- Generacion de texto conversacional en turco e ingles, con enfasis en el turco.
- Conversacion multi-turno y mantenimiento de contexto de dialogo (segun los tags del autor).
- Instruction-following y respuesta a instrucciones de sistema y usuario.
- Razonamiento y matematicas (declarado en los tags, sin datos de rendimiento).
- Generacion de codigo (declarado en los tags, sin datos de rendimiento).
- Escritura creativa.
- Tool calling / function calling (declarado en los tags).
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con el ecosistema llama.cpp, Ollama y LM Studio.
- Posible soporte multimodal por la presencia de ficheros mmproj, aunque no confirmado en la documentacion.

## Casos de uso

- Asistente conversacional en turco para atencion al cliente: el modelo puede gestionar dialogos multi-turno en turco de forma nativa, lo que lo hace adecuado para desplegar chatbots en empresas que operan en el mercado turco sin depender de modelos multilingues genericos.
- Generacion de codigo asistida en entornos de desarrollo: con soporte declarado de codigo y tool calling, puede integrarse en asistentes de IDE o pipelines de CI/CD para sugerencias y automatizacion de tareas repetitivas.
- Procesamiento de documentacion y resumenes en turco: util para equipos que necesitan resumir contratos, correos o informes en turco manteniendo la calidad linguistica.
- Educacion y tutoria automatizada: el modelo puede actuar como tutor conversacional en turco para explicar conceptos de matematicas o programacion, gracias a su entrenamiento en razonamiento y SFT conversacional.
- Prototipado rapido en local: las cuantizaciones Q4_K_M (5,8 GB) y Q5_K_M (6,6 GB) permiten ejecutar el modelo en portatiles con GPU de consumo, ideal para pruebas de concepto sin infraestructura cloud.
- Despliegue en edge o entornos con requisitos de privacidad: al ser Apache 2.0 y ejecutable con llama.cpp/Ollama, puede desplegarse on-premise para procesar datos sensibles en turco sin salir de la organizacion.
- Generacion de contenido creativo y marketing en turco: redaccion de textos, guiones y material promocional adaptado al idioma y registro turco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano de fichero y overhead de llama.cpp):
  - Q2_K: ~4,0 GB de pesos; ~5-6 GB de VRAM en total.
  - Q4_K_M: ~5,8 GB de pesos; ~7-8 GB de VRAM en total.
  - Q5_K_M: ~6,6 GB de pesos; ~8-9 GB de VRAM en total.
  - Q8_0: ~9,6 GB de pesos; ~11-12 GB de VRAM en total.
  - f16: ~18,0 GB de pesos; ~20 GB de VRAM en total.
- GPU recomendadas: para Q4_K_M/Q5_K_M, una RTX 3060 de 12 GB, RTX 4060 Ti 16 GB o RTX 4070/4080; para Q8_0, RTX 4090 o A10/A100; para f16, A100 40 GB o H100.
- Cabe en GPU de consumo: si, en configuraciones Q4_K_M o inferiores con GPUs de 8-12 GB; las cuantizaciones Q6_K y Q8_0 requieren 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-inference (segun tags) y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Pusula-9B-GGUF | 8,95B | no disponible | Apache 2.0 | GGUF | Enfasis en turco, SFT con QLoRA |
| Modelos 7-9B genericos (p. ej., Llama 3.1 8B, Qwen2.5 7B) | 7-9B | 8K-128K (segun modelo) | licencias variables | safetensors, GGUF | Multilingues, benchmarks publicos; no comparable en calidad de turco sin evaluacion |
| Modelos especializados en turco de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de comparacion en la informacion proporcionada |

No se dispone de datos de benchmarks ni de evaluaciones comparativas publicadas para Pusula-9B, por lo que la comparacion cuantitativa con alternativas no es posible con la informacion disponible.

## Limitaciones y advertencias

- No hay benchmarks publicados: el rendimiento real en razonamiento, matematicas, codigo y tool calling no esta verificado de forma independiente.
- La longitud de contexto no esta documentada, lo que impide planificar casos de uso con ventanas largas.
- El modelo esta enfocado en turco e ingles; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Riesgo de alucinacion inherente a modelos de 9B afinados con SFT sin RLHF/DPO documentado; no se han publicado evaluaciones de seguridad o alineacion.
- Sesgos: no se documentan sesgos conocidos, pero el dataset de entrenamiento (turco) puede introducir sesgos culturales y linguisticos especificos.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; verificar la procedencia del dataset de entrenamiento antes de un despliegue en produccion.
- La presencia de ficheros mmproj sugiere capacidades multimodales no documentadas; no asumir su funcionamiento sin pruebas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Pusula-9B-GGUF
- Modelo base: https://huggingface.co/serhatkagans/Pusula-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/serhatkagans/turkish-chat-sft-v3
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Pusula-9B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
