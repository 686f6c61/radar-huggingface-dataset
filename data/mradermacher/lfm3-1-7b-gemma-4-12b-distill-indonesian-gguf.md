# mradermacher/LFM3-1.7B-Gemma-4-12B-Distill-Indonesian-GGUF

## Resumen

LFM3-1.7B-Gemma-4-12B-Distill-Indonesian-GGUF es la version cuantizada en formato GGUF del modelo s3t4/LFM3-1.7B-Gemma-4-12B-Distill-Indonesian, un modelo de lenguaje de 1.728.801.600 parametros construido mediante destilacion de conocimiento desde un modelo mayor (Gemma-4-12B, segun la nomenclatura del identificador) hacia la arquitectura LFM3 de 1.7B de Liquid AI. El trabajo de cuantizacion lo firma mradermacher, un autor habitual en el ecosistema GGUF, mientras que el modelo base y el ajuste fino proceden del usuario s3t4.

El modelo esta especializado en indonesio: los datasets de ajuste supervisado (IndoMMLU, XCOPA, aya_dataset y AksaraLLM/aksara-sft-clean-v1) apuntan a un SFT con LoRA fusionado sobre el modelo destilado, orientado a mejorar el rendimiento en tareas de comprension y generacion en lengua indonesia. La etiqueta `conversational` y el formato GGUF lo hacen directamente utilizable en entornos de chat e inferencia local.

Su relevancia practica radica en que ofrece un modelo compacto (1.7B) con cuantizaciones que van desde 0.9 GB (Q2_K) hasta 3.6 GB (f16), lo que permite desplegarlo en hardware modesto, incluso en CPU o GPUs de consumo, manteniendo la herencia de conocimiento de un modelo destilado de mayor tamano. Es, por tanto, una opcion interesante para aplicaciones en indonesio con requisitos de recursos muy bajos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (Liquid AI), transformer con `custom_code`; destilada desde Gemma-4-12B |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | indonesio (id) |
| Licencia | lfm1.0 (licencia de Liquid AI, referenciada como "other") |
| Formato de pesos | GGUF (repo); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura LFM3 de Liquid AI, una familia de transformers con codigo personalizado (`custom_code` en transformers). El identificador indica un proceso de destilacion de conocimiento: se entrena un modelo de 1.7B para imitar el comportamiento de un modelo mayor de 12B (Gemma-4-12B, segun la nomenclatura), lo que permite concentrar capacidad en un modelo mucho mas pequeno y desplegable.

Sobre ese modelo destilado se aplico un ajuste supervisado (SFT) con LoRA, posteriormente fusionado (`merged`) mediante TRL. Los datos de entrenamiento declarados son IndoMMLU, XCOPA, el dataset aya de CohereLabs y AksaraLLM/aksara-sft-clean-v1, todos ellos orientados a indonesio o multilingue con cobertura de indonesio. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF o DPO. Tampoco se detalla si se emplearon tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en indonesio, con formato de chat (`conversational`).
- Razonamiento y comprension de lenguaje natural en indonesio, reforzado por el ajuste con IndoMMLU.
- Razonamiento de sentido comun y inferencia causal, segun el uso de XCOPA en el entrenamiento.
- Capacidades multilingues limitadas: el modelo esta etiquetado unicamente para indonesio, aunque aya_dataset incluye otros idiomas.
- Herencia de conocimiento del modelo profesor (Gemma-4-12B) mediante destilacion.
- No se documenta soporte explicito de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Atencion al cliente en indonesio: el modelo puede gestionar conversaciones multi-turno en lengua indonesia con un coste computacional minimo, adecuado para despliegues en servidores modestos o incluso en local.
- Clasificacion y extraccion de informacion en textos indonesios: con cuantizaciones Q4_K_M (1.2 GB) se puede ejecutar en CPU para tareas de etiquetado, resumen o extraccion de entidades sobre corpus en indonesio.
- Prototipado rapido de aplicaciones NLP en indonesio: el tamano reducido permite iterar en un portatil con llama.cpp u Ollama sin necesidad de GPU dedicada.
- Educacion y asistencia linguistica: generacion de respuestas y explicaciones en indonesio para herramientas de aprendizaje o tutoria.
- Investigacion sobre destilacion: sirve como caso de estudio de destilacion de un modelo de 12B a 1.7B y su efecto en tareas especificas de un idioma, comparando con el modelo profesor.
- Despliegue en entornos con restricciones de memoria: la version Q2_K (0.9 GB) permite ejecucion en dispositivos de gama baja o contenedores con poca RAM.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 12 variantes para medir el compromiso entre calidad y tamano en un modelo pequeno especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB para Q2_K, 1.2-1.4 GB para Q4_K_M/Q5_K_M, 1.9 GB para Q8_0 y 3.6 GB para f16 (los tamanos de archivo del repo sirven como referencia de memoria necesaria, mas overhead de contexto).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; una RTX 3060, RTX 4060 o superior ejecuta las cuantizaciones de mayor calidad con comodidad. Para f16, una RTX 4090 o A100 no son necesarias pero ofrecen margen sobrado.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 4 GB o mas; las cuantizaciones Q2_K y Q4_K_S pueden ejecutarse incluso en iGPU o CPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base en transformers requiere `custom_code` y la libreria transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-1.7B-Gemma-4-12B-Distill-Indonesian (este) | 1.73B | no disponible | id | lfm1.0 | GGUF / safetensors |
| Modelo base s3t4/LFM3-1.7B-Gemma-4-12B-Distill-Indonesian | 1.73B | no disponible | id | lfm1.0 | safetensors |
| Modelo profesor Gemma-4-12B (referenciado) | ~12B (segun nomenclatura) | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado en indonesio; su rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Riesgo de alucinacion inherente a modelos pequenos destilados, especialmente en tareas de conocimiento factual.
- No se documentan sesgos especificos, pero los datasets de origen (IndoMMLU, XCOPA, aya, AksaraLLM) pueden introducir sesgos culturales o linguisticos propios de sus fuentes.
- La licencia lfm1.0 de Liquid AI puede imponer restricciones al uso comercial; es necesario revisar el texto completo de la licencia antes de desplegar en produccion.
- El repo GGUF no incluye cuantizaciones ponderadas con imatrix, lo que puede afectar ligeramente a la calidad de las cuantizaciones bajas (Q2_K, Q3_K).
- El modelo base requiere `custom_code` en transformers, lo que puede complicar la integracion en pipelines estandar; la version GGUF evita esta dependencia.
- No se especifican la longitud de contexto ni el numero de tokens de entrenamiento, lo que limita la planificacion de despliegues con ventanas largas.
- El modelo fue creado y actualizado el 2026-11-23 y no registra descargas ni likes, por lo que carece de validacion comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LFM3-1.7B-Gemma-4-12B-Distill-Indonesian-GGUF
- Modelo base: https://huggingface.co/s3t4/LFM3-1.7B-Gemma-4-12B-Distill-Indonesian
- Licencia LFM1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Pagina de resumen del autor: https://hf.tst.eu/model#LFM3-1.7B-Gemma-4-12B-Distill-Indonesian-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
