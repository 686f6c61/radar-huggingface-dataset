# inclusionAI/Duo-1.2-causal-base

## Resumen

Duo-1.2-causal-base es un modelo de mundo multimodal (world model) de tipo full-duplex desarrollado por inclusionAI, disenado para generar interacciones audio-visuales en tiempo real. A diferencia de los modelos de lenguaje o de difusion convencionales, Duo modela de forma reciproca la relacion entre audio y video, lo que permite generar respuestas audiovisuales coherentes en escenarios de interaccion continua. Esta variante "causal-base" corresponde a la version 1.2, con mejoras en la calidad de generacion respecto a iteraciones anteriores.

El modelo se distribuye como un paquete completo que incluye los pesos de "Realization" (generador principal), el backbone, un modelo de intencion con su adaptador, codecs de video y audio, un reconocedor de voz y un alineador forzado. Los pesos se empaquetan en formato PyTorch Distributed Checkpoint (DCP), lo que refleja un diseno orientado a despliegues distribuidos de gran escala. El repositorio ocupa 153,4 GB, un tamano coherente con un sistema multimodal que integra varios submodelos.

La relevancia de Duo-1.2-causal-base radica en su enfoque de "reciprocal world model" para interaccion full-duplex: no se limita a generar video o audio por separado, sino que pretende modelar la dinamica conjunta de ambos canales en conversaciones en tiempo real. La licencia es la MiniMax H3 Community License, y los pesos fueron inicializados a partir de MiniMax H3 y posteriormente entrenados por el equipo de Duo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World model multimodal full-duplex (Realization + backbone + modelo de intencion + codecs de audio/video + ASR + alineador forzado); detalles de la arquitectura interna no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license (license: other) |
| Formato de pesos | PyTorch Distributed Checkpoint (DCP); safetensors referenciado en tags |

Otros datos tecnicos: sampler por defecto Euler, 50 pasos, flow shift 1.0. Version Duo 1.2, variante causal-base, paquete completo ("complete model bundle").

## Arquitectura y entrenamiento

Duo se presenta como un "reciprocal world model" para interaccion full-duplex, es decir, un sistema que modela de forma conjunta los flujos de audio y video para sostener interacciones en tiempo real. El paquete incluye varios componentes diferenciados: los pesos de Realization (el generador audiovisual), un backbone, un modelo de intencion con su adaptador, codecs de video y audio, un reconocedor de voz y un alineador forzado. Esta composicion sugiere un pipeline donde la intencion del usuario se interpreta, se codifica en latentes de audio y video, y se decodifica en una salida audiovisual sincronizada.

Los pesos fueron inicializados a partir de MiniMax H3 y posteriormente entrenados por el equipo de Duo. La variante "causal-base" indica un modo de generacion causal, adecuado para interaccion en streaming. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El muestreo por defecto emplea un sampler Euler con 50 pasos y flow shift de 1.0, lo que apunta a un modelo de difusion por flujo (flow matching) como mecanismo de generacion.

## Capacidades

- Generacion de video y audio de forma conjunta y sincronizada, orientada a interaccion audiovisual en tiempo real.
- Modelado de mundo reciproco: el modelo relaciona la entrada del usuario con respuestas audiovisuales coherentes en escenarios full-duplex.
- Interaccion en streaming gracias a la variante causal, pensada para generacion paso a paso.
- Reconocimiento de voz integrado mediante el speech recognizer incluido en el paquete.
- Alineacion forzada de audio y texto mediante el forced aligner incluido.
- Modelado de intencion: el modelo de intencion y su adaptador permiten interpretar la intencion del interlocutor antes de generar la respuesta.
- Codecs de audio y video propios para codificar y decodificar las modalidades.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Avatares conversacionales en tiempo real: el modelo puede generar video y audio sincronizados de un personaje que responde a la entrada del usuario, aprovechando el reconocedor de voz y el modelo de intencion para interpretar el turno y producir una respuesta audiovisual coherente.
- Asistentes con presencia visual: en atencion al cliente o recepcion virtual, Duo permite que el asistente muestre expresiones y habla sincronizadas, mejorando la percepcion de naturalidad frente a un chatbot puramente textual.
- Generacion de contenido audiovisual interactivo: produccion de clips donde el audio y el video se generan de forma conjunta, util para prototipos de videojuegos, demos interactivas o contenido para redes.
- Investigacion en modelos de mundo: el paquete completo (codecs, ASR, alineador, modelo de intencion) sirve como base para experimentar con dinamicas audio-visuales reciprocas y evaluar arquitecturas full-duplex.
- Simulacion de interlocutores para entrenamiento: generar respuestas audiovisuales sinteticas para entrenar o evaluar sistemas de dialogo multimodal o de deteccion de deepfakes.
- Dooblaje y sintesis audiovisual sincronizada: el alineador forzado y los codecs permiten alinear habla y video, util para generar versiones localizadas de contenido manteniendo la sincronia labial.
- Prototipado de interfaces humano-maquina: entornos de prueba donde se necesita una contraparte audiovisual reactiva para validar UX de sistemas conversacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 153,4 GB, por lo que el despliegue completo en precision nativa requiere un nodo multi-GPU con memoria agregada muy superior a la de una GPU consumer.
- GPU recomendadas: no disponible de forma explicita; por el tamano del bundle y el formato DCP se orienta a entornos con multiples GPU de datacenter (A100, H100 o superiores). No se confirma compatibilidad con RTX 4090.
- Cabe en consumer GPU: no disponible; el tamano del paquete hace improbable un despliegue completo en una sola GPU consumer.
- Opciones de despliegue: pesos en PyTorch Distributed Checkpoint (DCP); las instrucciones de integracion en runtime se remiten al repositorio de GitHub inclusionAI/Duo. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a LLM, no a este tipo de modelo).
- Latencia y throughput estimados: no disponible. El sampler por defecto es Euler con 50 pasos, lo que condiciona la latencia de generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Duo-1.2-causal-base | no disponible | no disponible | Audio + video full-duplex | minimax-h3-community-license | Hugging Face (inclusionAI) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; no se documentan evaluaciones de sesgo en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado; como modelo generativo audiovisual, puede producir contenido inconsistente con la entrada.
- Limitaciones de contexto o idioma: no disponible; no se especifican idiomas soportados ni longitud de contexto.
- Restricciones de licencia: la licencia es la MiniMax H3 Community License (license: other). Es imprescindible revisar LICENSE y NOTICE antes de cualquier uso comercial, ya que los pesos se inicializaron a partir de MiniMax H3 y las condiciones pueden restringir el despliegue productivo.
- El paquete incluye submodelos (ASR, alineador, codecs) con sus propias condiciones; verificar cada componente.
- Formato DCP: requiere infraestructura PyTorch distribuida, lo que complica el despliegue en entornos sencillos.
- No hay datos publicados de benchmarks, latencia ni calidad de generacion, lo que limita la evaluacion objetiva previa a produccion.
- El modelo esta etiquetado como "base" y "causal", orientado a interaccion en streaming; su comportamiento en generacion offline de alta calidad no esta documentado.

## Enlaces

- Hugging Face: https://huggingface.co/inclusionAI/Duo-1.2-causal-base
- Paper (arXiv): https://arxiv.org/abs/2611.15131
- Homepage: https://duo-v1.github.io/
- Coleccion de modelos: https://huggingface.co/collections/inclusionAI/duo-v1
- Codigo (GitHub): https://github.com/inclusionAI/Duo
