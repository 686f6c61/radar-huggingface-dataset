# inclusionAI/Duo-1.0-distill

## Resumen

Duo-1.0-distill es un modelo del mundo (world model) multimodal de tipo full-duplex desarrollado por inclusionAI, orientado a la generación e interacción audio-visual en tiempo real. No es un modelo de lenguaje al uso: se trata de la variante destilada a cuatro pasos del componente "Realization" de Duo 1.0, un sistema que modela de forma recíproca la interacción entre audio y vídeo para producir respuestas continuas y bidireccionales. Esta ficha describe exclusivamente los pesos destilados publicados en el repositorio.

El modelo se distribuye como un *overlay* (superposición) de pesos en formato PyTorch Distributed Checkpoint (DCP) que debe combinarse con el paquete base `inclusionAI/Duo-1.0-causal-base`, del que hereda el backbone, los códecs, los modelos de habla y el componente "Intent". El repositorio ocupa 2,8 GB y no incluye por sí solo todos los artefactos necesarios para la inferencia.

Su relevancia actual radica en que aborda la interacción full-duplex (escuchar y generar simultáneamente) dentro de un paradigma de world model audio-visual, un área emergente frente a los modelos generativos de vídeo tradicionales, que operan por turnos. La destilación a cuatro pasos busca reducir el coste de muestreo, con un sampler Euler por defecto y un *flow shift* de 5,0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (world model multimodal audio-visual full-duplex; backbone causal heredado de `Duo-1.0-causal-base`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license (campo `license: other`) |
| Formato de pesos | PyTorch Distributed Checkpoint (DCP) |
| Version | Duo 1.0, variante destilada a cuatro pasos (Realization) |
| Dependencia base | `inclusionAI/Duo-1.0-causal-base` |
| Sampler por defecto | Euler, 4 pasos, flow shift 5.0 |
| Tamano del repositorio | 2,8 GB |
| Libreria | duo-world-model |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del backbone. Lo que sí se especifica es que Duo 1.0 se organiza en varios componentes: un módulo "Intent", códecs, modelos de habla y un backbone "Realization" causal, todos ellos suministrados por el paquete `inclusionAI/Duo-1.0-causal-base`. El repositorio `Duo-1.0-distill` contiene únicamente los pesos destilados del componente Realization, que se superponen sobre ese bundle base en el mismo directorio.

El modelo se presenta como un world model recíproco para interacción full-duplex, es decir, capaz de modelar simultáneamente la entrada y la salida en modalidades de audio y vídeo. El proceso de destilación reduce el muestreo a cuatro pasos con sampler Euler y flow shift 5.0, lo que sugiere un esquema de flow matching o difusión destilada. Los pesos se inicializaron a partir de MiniMax H3 y fueron entrenados posteriormente por el equipo de Duo. No se dispone de datos sobre volumen de tokens, composición del dataset, ni sobre el uso de RLHF o DPO.

## Capacidades

- Generación de vídeo condicionada por audio y por el estado de la interacción.
- Generación de audio en el marco de una interacción audio-visual conjunta.
- Interacción full-duplex: modelado simultáneo de escucha y generación, en lugar de turnos estrictos.
- Funcionamiento como world model recíproco, prediciendo la evolución del entorno audio-visual.
- Muestreo acelerado mediante destilación a cuatro pasos (sampler Euler, flow shift 5.0).
- Integración con el resto del sistema Duo 1.0 (Intent, códecs y modelos de habla) a través del bundle causal-base.
- Soporte de *tool calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo *thinking*, visión estática o audio de entrada aislado: no disponible.

## Casos de uso

- **Avatares conversacionales en tiempo real**: el modelo puede generar vídeo y audio de forma continua y bidireccional, lo que permite que un avatar responda mientras el usuario habla, sin esperar al final del turno. Es adecuado por su naturaleza full-duplex.
- **Agentes virtuales de atención al cliente con presencia visual**: combinado con el módulo Intent y los modelos de habla del bundle base, puede sostener interacciones cara a cara con sincronía labial y gestual, mejorando la percepción de naturalidad frente a un chatbot solo de texto.
- **Prototipado de interfaces humano-máquina**: útil para investigar cómo reaccionan los usuarios ante sistemas que escuchan y responden a la vez, gracias al muestreo en cuatro pasos que reduce la latencia de generación.
- **Generación de contenido audiovisual interactivo**: creación de clips o escenas donde el audio condiciona el vídeo y viceversa, aprovechando el modelado recíproco entre modalidades.
- **Simulación de entornos para entrenamiento de agentes**: al funcionar como world model, puede emplearse para predecir la evolución audio-visual de un entorno y generar experiencias sintéticas para políticas de agentes.
- **Investigación en modelos del mundo**: la variante destilada facilita experimentos con muchos muestreos al reducir el coste por generación a cuatro pasos, lo que resulta práctico para ablaciones y comparativas académicas.
- **Telepresencia y videollamadas sintéticas**: generación de contrapartes virtuales que reaccionan en tiempo real a la voz y la imagen del interlocutor, apoyándose en la naturaleza causal del backbone.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio de 2,8 GB corresponde solo a los pesos destilados del componente Realization; la VRAM real depende del bundle `Duo-1.0-causal-base`, que no se detalla.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la model card remite al repositorio `inclusionAI/Duo` para instrucciones de integración en runtime; no se mencionan vLLM, llama.cpp, Ollama ni TGI. El formato de pesos es DCP, propio de PyTorch.
- Latencia y throughput estimados: no disponible. La destilación a cuatro pasos con sampler Euler y flow shift 5.0 está diseñada para reducir el número de pasos de muestreo, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Duo-1.0-distill | World model audio-visual full-duplex (destilado) | no disponible | no disponible | minimax-h3-community-license | Pesos en HF como overlay sobre causal-base |
| Duo-1.0-causal-base | World model audio-visual (base) | no disponible | no disponible | no disponible | Pesos en HF (bundle completo) |
| MiniMax H3 | Modelo base del que se inicializaron los pesos | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El repositorio no es autónomo: requiere descargar y superponer los pesos sobre `inclusionAI/Duo-1.0-causal-base`; sin ese bundle no se puede ejecutar.
- No se publican datos de sesgos, tasas de alucinación ni evaluación de calidad de la generación audio-visual.
- No se especifican idiomas soportados, lo que impide garantizar cobertura multilingüe.
- No se detallan requisitos de hardware ni cifras de latencia, lo que dificulta planificar un despliegue en producción.
- La licencia es `minimax-h3-community-license` (campo `license: other`); es necesario revisar `LICENSE` y `NOTICE` antes de cualquier uso comercial, ya que los pesos se inicializaron a partir de MiniMax H3.
- El modelo está orientado a generación audio-visual interactiva, no a tareas de texto, código o razonamiento; no debe evaluarse con benchmarks de LLM.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria aún inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/inclusionAI/Duo-1.0-distill
- Bundle base: https://huggingface.co/inclusionAI/Duo-1.0-causal-base
- Colección de modelos: https://huggingface.co/collections/inclusionAI/duo-v1
- Paper (arXiv): https://arxiv.org/abs/2611.15131
- Página del proyecto: https://duo-v1.github.io/
- Código: https://github.com/inclusionAI/Duo
