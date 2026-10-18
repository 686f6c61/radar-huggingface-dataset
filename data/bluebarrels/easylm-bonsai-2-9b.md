# Bluebarrels/easylm-bonsai-2-9b

## Resumen

easylm-bonsai-2-9b es un adaptador LoRA (PEFT) publicado por el usuario Bluebarrels sobre el modelo base prism-ml/Ternary-Bonsai-2-9B-gguf, un transformer de 9.000 millones de parametros cuantizado en ternario (1,58 bits) que forma parte de la familia Bonsai 2 de PrismML, derivada de Qwen3.5. El adaptador se presenta como "agente por defecto" para Hydra y como modelo de razonamiento avanzado dentro del ecosistema EasyLM, con una huella declarada de aproximadamente 2 GB.

El adaptador se entrena sobre el corpus propio Bluebarrels/easylm-training-corpus (23.354 turnos en formato ChatML) y anade pesos de bajo rango (r=16, alpha=32) sobre siete modulos de atencion y MLP. La propuesta es un agente autonomo de 9B que quepa en 2 GB y pueda ejecutarse en WebGPU dentro del navegador (moviles, tablets, portatiles) ademas de en las interfaces CLI, TUI y escritorio de Hydra.

Su interes actual reside en la combinacion de tres elementos: cuantizacion ternaria agresiva para despliegue local, un adaptador LoRA pequeno sobre un modelo base ya comprimido y una ventana de contexto declarada de 262.144 tokens. Conviene advertir que la model card incluye una gran cantidad de material idiosincratico del autor (curriculo Hydra, "Council of Kami", "ether-fishing Why-Ledger") cuya verificacion independiente no es posible con la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-9B) con adaptador LoRA; cuantizacion ternaria de 1,58 bits en el base |
| Parametros totales | 9.000 millones en el modelo base; el adaptador LoRA contiene 417.770 elementos FP16 no nulos (842.864 bytes) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (segun la model card, con Vision-Tower) |
| Tipos de cuantizacion | Ternaria 1,58 bits (bonsai_tq_f32) en el base GGUF; q4f16_1 en la variante MLC/WebGPU |
| Idiomas soportados | no disponible |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors (adaptador LoRA); GGUF (base); MLC (base WebGPU) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer denso de 9B derivado de Qwen3.5 y cuantizado en ternario (1,58 bits) por PrismML, que segun la nota de prensa entreno la familia Bonsai 2 en TPUs Google v5. La cuantizacion ternaria reduce el peso del base a unos 2 GB, lo que permite inferencia en dispositivos de gama baja y en el navegador mediante WebGPU. El adaptador LoRA se configura con rango 16, alpha 32 y dropout 0,05, y ataca los modulos q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj. El repositorio declara 56 tensores en safetensors.

El entrenamiento del adaptador se realizo sobre el dataset Bluebarrels/easylm-training-corpus, fichero adapter_easylm_master_chatml.jsonl, con 23.354 turnos en formato ChatML. La model card describe la composicion del corpus como 92 "stacks academicos" (matematicas, fisica, quimica, biologia, computacion, ingenieria, derecho, historia, filosofia y oficios), 369 tablas de hechos con 4.634 filas cuantitativas, 151 "libros del Council of Kami", una capa socratica "Alice" con 46.025 nodos y 19.842 aristas, y el curriculo completo de Hydra v1.2.2. No se documentan en la informacion disponible el numero total de tokens de entrenamiento, la mezcla exacta por dominio ni si se aplicaron fases de RLHF o DPO; tampoco se detalla la innovacion tecnica a nivel de atencion mas alla de la cuantizacion ternaria del base.

## Capacidades

- Generacion de texto conversacional y razonamiento multi-turno en formato ChatML.
- Razonamiento STEM: la model card menciona derivaciones profundas y "verificacion determinista" en matematicas, fisica e ingenieria, apoyadas en el corpus de stacks academicos.
- Tool calling y orquestacion de herramientas MCP, declaradas como parte del rol de "agente por defecto" de Hydra.
- Soporte de agentes y razonamiento multi-paso: los comandos `hydra agent`, `hydra swarm` y `hydra serve` (puerto 7777) se citan explicitamente.
- Contexto largo de 262.144 tokens, con modos de gestion declarados (recall, compact, sliding).
- Capacidades de vision heredadas del base (Vision-Tower), segun la model card; no se detalla la resolucion ni el esquema de entrenamiento multimodal del adaptador.
- Capacidades multilingues: no disponible.
- Modos de permisos de agente definidos en la interfaz (manual, accept_edits, plan, bypass), aunque su implementacion efectiva corresponde a Hydra y no al modelo en si.

## Casos de uso

- Agente autonomo en local para tareas de desarrollo: el adaptador se puede cargar en Hydra (`hydra agent`) para inspeccionar repositorios, ejecutar comprobaciones y aplicar ediciones con los modos de permiso definidos, sin salir del equipo del desarrollador.
- Asistente de razonamiento STEM en el aula o el laboratorio: con 262.144 tokens de contexto puede ingerir enunciados largos, derivaciones y tablas de referencia, y producir explicaciones paso a paso sobre fisica, quimica o matematicas.
- Despliegue en navegador mediante WebGPU: al ocupar aproximadamente 2 GB, el modelo cabe en telefonos, tablets y Chromebooks, lo que habilita asistentes embebidos en aplicaciones web sin backend de inferencia.
- Orquestacion de herramientas MCP en pipelines de automatizacion: la integracion declarada con `hydra serve` permite exponer el modelo como servicio local y encadenar llamadas a herramientas externas en flujos multi-paso.
- Tutor socratico multi-turno: el corpus incluye una capa explicita de "diagnostico de confusion" y "antitesis socratica", por lo que el uso previsto es el acompanamiento educativo con preguntas guiadas y deteccion de errores conceptuales.
- Procesamiento de documentos largos en el borde: gracias a la ventana de 262k tokens y a la huella reducida, se pueden resumir o consultar manuales tecnicos, normativas o expedientes completos en un portatil sin GPU dedicada.
- Prototipado rapido de agentes en investigacion: al ser un adaptador LoRA de 417.770 parametros efectivos, es barato de versionar, comparar y recombinar con otros adaptadores sobre el mismo base ternario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, y las busquedas web realizadas tampoco aportan resultados numericos para este adaptador ni para el base Ternary-Bonsai-2-9B. Cualquier comparacion de rendimiento con la familia Qwen3.5 o con otros modelos de 9B careceria de respaldo empirico en este momento.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB para los pesos en ternario 1,58 bits; el adaptador LoRA anade unos 0,84 MB en FP16, por lo que el overhead es despreciable.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente. Una RTX 4090, A100 o H100 quedan muy sobredimensionadas para este modelo y solo tendrian sentido para servir muchas instancias en paralelo.
- Cabe en GPU consumer: si, en Practicamente cualquier GPU dedicada de los ultimos ocho anos, y tambien en iGPU y en CPU.
- Despliegue: llama.cpp u Ollama sobre el base GGUF; MLC-LLM para la ruta WebGPU (`mlc-ai/Qwen3.5-9B-q4f16_1-MLC`); EasyLM (JAX/Flax) para el flujo nativo del autor; Hydra para CLI/TUI/escritorio. vLLM y TGI no estan documentados para este adaptador en la informacion disponible.
- Latencia y throughput: no disponibles. Al ser un modelo ternario de 9B en 2 GB, la latencia dependera fuertemente del backend (WebGPU en navegador frente a llama.cpp en CPU/GPU) y del ancho de banda de memoria del dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Huella | Licencia | Notas |
|---|---|---|---|---|---|
| easylm-bonsai-2-9b (este) | 9B (base) + LoRA r=16 | 262.144 tokens | ~2 GB | AGPL-3.0 | Adaptador de agente para Hydra/EasyLM |
| easylm-bonsai-2-27b | 27B (base) | 262.144 tokens (declarado) | ~6 GB | AGPL-3.0 | "Flagship" de estacion de trabajo de la misma familia |
| easylm-bonsai-2-4b | 4B (base) | no disponible | ~1 GB | AGPL-3.0 (presumible, no confirmado) | Paso intermedio de coaching y mentorizacion |
| easylm-bonsai-2-2b | 2B (base) | no disponible | ~500 MB | AGPL-3.0 (presumible, no confirmado) | Opcion por defecto ligera para WebGPU |
| prism-ml/Ternary-Bonsai-2-9B-gguf | 9B | no disponible en la informacion | ~2 GB | no disponible | Modelo base sin el adaptador |

La comparacion con alternativas externas a la familia (por ejemplo, Qwen3.5-9B en precision completa u otros modelos ternarios de talla similar) no es posible con rigor porque no hay datos de benchmarks publicados para este adaptador. Las diferencias dentro de la familia se limitan a tamano, huella y rol declarado, no a metricas de calidad.

## Limitaciones y advertencias

- Licencia AGPL-3.0: es copyleft fuerte. El uso comercial es posible, pero cualquier servicio en red que incorpore el modelo o un derivado obliga a liberar el codigo fuente correspondiente. Esto es un obstaculo relevante para productos propietarios.
- Riesgo de alucinacion: no hay benchmarks ni evaluaciones de fidelidad publicadas. El corpus descrito mezcla materiales heterogeneos (tablas de hechos, "libros" de autores historicos, curriculos internos), lo que puede producir respuestas con apariencia de autoridad pero sin respaldo verificable.
- Sesgos conocidos: no documentados. La mezcla de dominios del corpus (92 stacks academicos y material idiosincratico del autor) puede introducir sesgos de dominio y de estilo no caracterizados.
- Limitaciones de contexto e idioma: la ventana de 262.144 tokens es una cifra declarada y no se ha verificado de forma independiente; el rendimiento en la parte alta de la ventana es desconocido. Los idiomas soportados no se especifican, por lo que no se puede asumir un buen rendimiento en castellano.
- Perdida de calidad por cuantizacion: el base esta en ternario 1,58 bits. Aunque la tecnica es prometedora, la degradacion frente a un 9B en FP16 no esta cuantificada en la informacion disponible.
- Validacion de la comunidad nula: el repositorio presenta 0 descargas y 0 "likes" en el momento de la consulta, y el tamano reportado del repositorio es de 0,0 GB. No hay senales de adopcion ni de replicacion independiente.
- Afirmaciones no verificables: terminos como "Council of Kami", "ether-fishing Why-Ledger" o "Alice Socratic Antithesis" no corresponden a componentes estandar y no vienen acompanados de publicaciones o evaluaciones que los respalden.
- Dependencia del ecosistema: el valor del adaptador esta ligado a Hydra y EasyLM. Fuera de ese stack, sus capacidades especificas (MCP, modos de permisos, gestion de contexto) pueden no ser aprovechables.
- Advertencia de produccion: antes de desplegarlo conviene evaluar el base Ternary-Bonsai-2-9B por separado, medir la calidad en el dominio objetivo y revisar la compatibilidad de la AGPL-3.0 con el modelo de negocio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Bluebarrels/easylm-bonsai-2-9b
- Modelo base ternario (GGUF): https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf
- Base WebGPU/MLC: https://huggingface.co/mlc-ai/Qwen3.5-9B-q4f16_1-MLC
- Dataset de entrenamiento: https://huggingface.co/datasets/Bluebarrels/easylm-training-corpus
- Hermano mayor de la familia (27B): https://huggingface.co/Bluebarrels/easylm-bonsai-2-27b
- Perfil del autor: https://huggingface.co/Bluebarrels
- Anuncio de la familia Bonsai 2 en PrismML: https://prismml.com/news/bonsai-2-family
- Nota de prensa de PrismML: https://www.prnewswire.com/news-releases/prismml-expands-bonsai-2-family-with-2b-4b-and-9b-models-for-on-device-ai-302910593.html
- Repositorio EasyLM (JAX/Flax): https://github.com/young-geng/EasyLM
