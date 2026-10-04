# satyam-arora-iiit-hyderabad/anlp-m26-a2-part1-moe-shared

## Resumen

El modelo `anlp-m26-a2-part1-moe-shared` es un checkpoint de traducción automática con arquitectura decoder-only y mezcla de expertos (mixture-of-experts, MoE), desarrollado por el usuario `satyam-arora-iiit-hyderabad`. Está entrenado para traducir desde vietnamita y japonés hacia inglés (y viceversa, según el tokenizador con tokens de idioma) y forma parte de un ejercicio academico de la asignatura ANLP (Advanced NLP). Se trata, por tanto, de un modelo de investigacion educativa mas que de un producto listo para produccion.

El modelo tiene 19.847.040 parametros totales y activa 16.308.096 parametros por token, lo que lo situa en la categoria de modelos muy pequenos (por debajo de 20 millones de parametros). Esto lo hace ejecutable en CPU y en cualquier GPU consumer, pero limita su calidad y su ventana de contexto efectiva. La model card reporta una perplejidad de test de 25,535865 y un BLEU combinado de 17,4126 (20,5836 para vietnamita y 14,3886 para japones).

Su relevancia actual es principalmente didactica y de reproducibilidad: sirve como ejemplo abierto de implementacion de MoE en tareas de traduccion con presupuesto fijo de tokens de contexto y con artefactos de analisis de uso de expertos (CSV/JSON/SVG). No se ha publicado informacion sobre licencia ni sobre integracion con ecosistemas estandar de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mixture-of-experts (variante `moe_shared`) |
| Parametros totales | 19.847.040 |
| Parametros activos | 16.308.096 por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuye checkpoint en punto flotante PyTorch) |
| Idiomas soportados | en, vi, ja |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`model.pt`), sin safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con capas de mezcla de expertos. La variante se denomina `moe_shared`, lo que sugiere la presencia de al menos un experto compartido (siempre activo) ademas de los expertos enrutados. La diferencia entre parametros totales (19,8 M) y activos por token (16,3 M) es de aproximadamente 3,5 M, coherente con un subconjunto reducido de expertos no activados en cada paso. El autor incluye ficheros de uso de expertos (CSV, JSON y SVG), lo que permite analizar el reparto de carga entre expertos.

El entrenamiento se realizo con un presupuesto fijo de tokens de contexto ("fixed context-token budget") propio del repositorio de la asignatura, y la evaluacion se hizo sobre el checkpoint final, no sobre uno con early stopping. El dataset indicado es `belumind/en-vi-ja-curated-500k-triplets`, un corpus de 500.000 tripletas en ingles, vietnamita y japones. El tokenizador es un BPE a nivel de byte que incorpora tokens de idioma y de control. No se especifica el numero total de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de ajuste por preferencias; esa informacion no esta disponible.

## Capacidades

- Traduccion automatica entre vietnamita, japones e ingles (tarea principal declarada: traduccion vi/ja hacia ingles).
- Tokenizacion BPE a nivel de byte con tokens de idioma y control, lo que permite marcar el idioma de origen y de destino.
- Enrutamiento mediante mezcla de expertos, con posibilidad de inspeccionar el uso de expertos a traves de los ficheros de analisis incluidos.
- Generacion de texto autoregresiva en modo decoder-only (no se documentan modos de decodificacion especulativa ni de razonamiento explicito).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de vision o audio: no disponibles.
- Capacidades multilingues adicionales fuera de en/vi/ja: no disponibles.

## Casos de uso

- Traduccion de contenido japones a ingles: el modelo puede volcar textos breves o parrafos de origen japones a ingles, con un BLEU de 14,3886 en test, adecuado para prototipos y experimentos, no para publicacion sin revision humana.
- Traduccion de vietnamita a ingles: con un BLEU de 20,5836, es la direccion mas solvente del modelo y puede usarse en localizacion de documentos tecnicos de baja criticidad.
- Preprocesado de datasets multilingues: dado su tamano reducido, puede integrarse en pipelines de investigacion para generar traducciones sinteticas de apoyo o para normalizar corpus vi/ja antes de tareas posteriores.
- Experimentacion academica con MoE: el checkpon incluye ficheros de uso de expertos, lo que permite estudiar el comportamiento del enrutamiento y reproducir resultados en un entorno docente.
- Evaluacion comparativa de estrategias de entrenamiento: sirve como linea base de bajo coste para comparar presupuestos de tokens de contexto o variantes de arquitectura en un curso o trabajo de investigacion.
- Prototipado rapido en CPU: al tener menos de 20 M de parametros, puede ejecutarse en portatiles sin GPU para validar flujos de traduccion antes de escalar a modelos mayores.
- Ensenanza y demostracion: util para ilustrar en clase como se implementa y se evalua un modelo MoE de traduccion desde cero.

## Benchmarks y rendimiento

Resultados reportados en la model card (checkpoint final, presupuesto igualado de tokens):

| Metrica | Valor |
|---|---:|
| Perplejidad de test | 25,535865 |
| BLEU combinado | 17,4126 |
| BLEU vietnamita | 20,5836 |
| BLEU japones | 14,3886 |
| Parametros totales | 19.847.040 |
| Parametros activos por token | 16.308.096 |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, dado que la tarea del modelo es exclusivamente de traduccion.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, aproximadamente 79 MB para los pesos (19,85 M de parametros x 4 bytes); en FP16, aproximadamente 40 MB. El consumo real anadira el de activaciones y cache de atencion, pero seguira siendo muy bajo.
- GPU recomendadas: cualquier GPU moderna es mas que suficiente; el modelo cabe holgadamente en tarjetas integradas y en GPUs consumer como GTX 1650, RTX 3060, RTX 4090, e incluso en iGPUs.
- Compatibilidad con CPU: totalmente viable; el modelo puede ejecutarse en CPU sin problemas de memoria ni de latencia grave para entradas cortas.
- Opciones de despliegue: la model card indica que la arquitectura y el codigo de carga son personalizados y se encuentran en el repositorio de la asignatura. Por tanto, no se garantiza compatibilidad directa con vLLM, llama.cpp, Ollama o TGI; el despliegue requeriria el codigo propio del autor.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo de respuesta.

## Comparativa con modelos similares

No se dispone de datos de benchmark de los modelos alternativos en la informacion proporcionada, por lo que las celdas numericas se marcan como no disponibles. La comparacion se limita a la categoria funcional.

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `anlp-m26-a2-part1-moe-shared` | 19,85 M totales / 16,31 M activos | no disponible | MoE decoder-only para vi/ja-en | no disponible | HuggingFace, pesos PyTorch |
| Opus-MT (Helsinki-NLP) | no disponible | no disponible | Transformer seq2seq por par de idiomas | mayoritariamente abierta (varia) | HuggingFace, ampliamente usado |
| NLLB-200 (Meta) | no disponible | no disponible | Transformer multilingue | licencia especifica de Meta | HuggingFace |
| M2M-100 (Meta) | no disponible | no disponible | Transformer many-to-many | licencia especifica de Meta | HuggingFace |

Se trata de una comparacion puramente categorica: los tres modelos alternativos son soluciones de traduccion neuronal ampliamente desplegadas, mientras que el modelo aqui descrito es un checkpoint academico de muy bajo numero de parametros y sin datos de rendimiento frente a ellos.

## Limitaciones y advertencias

- Licencia no disponible: no puede confirmarse el uso comercial ni la redistribucion del modelo o de sus pesos.
- Es un checkpoint academico con un presupuesto de tokens fijo y pocos parametros (19,8 M), por lo que su calidad de traduccion es limitada en comparacion con modelos de produccion.
- Calidad desigual segun idioma: el BLEU de japones (14,3886) es notablemente inferior al de vietnamita (20,5836), lo que indica mayor error en la direccion japonesa.
- Perplejidad de test de 25,535865, valor relativamente alto, coherente con un modelo pequeno y un corpus reducido.
- Riesgo de alucinacion y de omisiones en la traduccion, especialmente en textos largos, dominio tecnico o frases con ambiguedad; se recomienda revision humana en cualquier uso con impacto.
- Cobertura linguistica limitada a ingles, vietnamita y japones; no hay soporte documentado para otros idiomas ni para variantes regionales.
- Longitud de contexto no especificada, por lo que no se puede garantizar el manejo fiable de documentos extensos.
- Arquitectura y codigo de carga personalizados: no se integra de forma nativa en pipelines estandar (transformers, vLLM, llama.cpp, Ollama), lo que complica el despliegue en produccion.
- Ausencia de safetensors y de formatos cuantizados (GGUF, AWQ, GPTQ), lo que limita las opciones de serializacion segura y de optimizacion.
- Posibles sesgos heredados del corpus `belumind/en-vi-ja-curated-500k-triplets`; no se documenta auditoria de sesgos.
- Sin validacion externa ni benchmarks comparativos publicados; los resultados provienen unicamente de la model card del autor.
- El modelo se evaluo en su checkpoint final (no early-stopped), lo que puede no coincidir con su mejor punto de validacion; existe tambien un `best_validation_model.pt` opcional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/satyam-arora-iiit-hyderabad/anlp-m26-a2-part1-moe-shared
- Dataset de entrenamiento: https://huggingface.co/datasets/belumind/en-vi-ja-curated-500k-triplets
- Repositorio de la asignatura (codigo de arquitectura y carga): no disponible en la informacion proporcionada
- Paper o publicacion asociada: no disponible
- Demo o espacio interactivo: no disponible
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo (los resultados obtenidos correspondian a un planificador de viajes sin relacion con el modelo).
