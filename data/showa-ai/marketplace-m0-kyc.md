# showa-ai/marketplace-m0-kyc

## Resumen

showa-ai/marketplace-m0-kyc es un adaptador LoRA de ajuste supervisado (SFT) publicado por showa-ai sobre el modelo base Qwen/Qwen3.8-27B-FP8, en la revision concreta 017b9c7af6b5689d5dd426a76e0bc077eb5ca20a. El repositorio contiene unicamente los pesos del adaptador (adapter_model.safetensors y adapter_config.json), con un tamano total de 0,6 GB, por lo que no es un modelo autonomo: para utilizarlo hay que cargar el modelo base en la revision exacta indicada.

El adaptador esta especializado en tareas de KYC (Know Your Customer) dentro de un flujo de marketplace, segun los tags lora, peft, kyc y sft. Su objetivo declarado es emitir veredictos y devolver respuestas en JSON valido, algo que el autor respalda con varias evaluaciones held-out (491 filas, 36 muestras y un pool de 500 muestras).

Su relevancia es metodologica: ilustra el patron de ajuste fino ligero (rank 32, entrenamiento en 16 bits sobre una base ya cuantizada en FP8) para dominios muy acotados con requisitos estrictos de formato de salida, desplegable en vLLM con --enable-lora. Los metadatos indican 0 descargas, 0 likes, y no se declara licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre el modelo base Qwen/Qwen3.8-27B-FP8; la arquitectura del modelo base no se detalla en la informacion disponible |
| Parametros totales | No disponible para el adaptador. El modelo base se denomina Qwen3.8-27B-FP8, lo que sugiere 27 000 millones de parametros, dato no confirmado en la informacion disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Modelo base en FP8; adaptador LoRA entrenado en 16 bits (bfloat16) sobre base FP8. No se listan otros formatos cuantizados |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adapter_model.safetensors) mas adapter_config.json, formato PEFT |
| Tipo de modelo | Adaptador LoRA de SFT (no es un modelo completo) |
| Modelo base | Qwen/Qwen3.8-27B-FP8 |
| Revision del modelo base | 017b9c7af6b5689d5dd426a76e0bc077eb5ca20a |
| Rank / alpha / dropout de LoRA | 32 / 64 / 0,05 |
| Modulos objetivo | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| Tamano del repositorio | 0,6 GB |
| Libreria | peft |
| Fecha de publicacion | 6 de octubre de 2026 (creacion y ultima actualizacion el mismo dia) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 y alpha 64, con dropout 0,05, aplicado sobre las proyecciones de atencion (q_proj, k_proj, v_proj, o_proj) y sobre las proyecciones del bloque MLP (gate_proj, up_proj, down_proj) del modelo base. El metodo declarado es LoRA en 16 bits sobre una base FP8, con el adaptador almacenado en bfloat16. Es, por tanto, un ajuste de bajo rango estandar sobre un transformer preentrenado; no se describe ninguna modificacion arquitectonica propia (ni atencion lineal, ni mezcla de expertos, ni decodificacion especulativa).

El entrenamiento es de tipo SFT (supervision fina) orientado a la tarea KYC, segun los tags del repositorio. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, si hubo etapas de RLHF o DPO, ni el procedimiento de generacion de las etiquetas. La unica validacion publicada son las evaluaciones held-out del autor y los hashes sha256 de los dos ficheros del adaptador, que permiten verificar la integridad de la descarga.

## Capacidades

- Clasificacion y emision de veredictos en un flujo KYC: la model card reporta un 100,00 % de coincidencia de veredicto sobre un conjunto held-out de 491 filas.
- Generacion de respuestas en JSON valido: el 100,00 % de las 491 filas evaluadas produjo JSON de respuesta valido.
- Ajuste especifico de dominio sobre el comportamiento del modelo base Qwen/Qwen3.8-27B-FP8, al que se aplica en inferencia.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el repositorio no declara idiomas.
- Capacidades de vision, audio o modo de razonamiento explicito (thinking): no disponible en la informacion proporcionada.
- Despliegue multi-adaptador: al servirse con vLLM (--enable-lora --max-lora-rank 32) puede combinarse con otros adaptadores LoRA sobre la misma instancia del modelo base.

## Casos de uso

- Verificacion KYC en el alta de vendedores de un marketplace: el adaptador recibe los datos del expediente y devuelve un veredicto con salida JSON estructurada, lo que permite encajar la respuesta directamente en el backend de onboarding sin parseo heuristico.
- Triaje automatizado de expedientes: dado el 100,00 % de coincidencia de veredicto reportado en el conjunto de 491 filas, el modelo puede usarse como primera pasada que descarta los casos claros y escala a revision humana los dudosos.
- Enrutado de decisiones en un pipeline de compliance: la salida JSON valida facilita que un orquestador lea campos concretos (veredicto, motivos) y dispare acciones como solicitud de documentacion adicional o bloqueo preventivo.
- Servicio multi-tenant con vLLM: al soportar LoRA en caliente, una misma instancia del modelo base puede atender este adaptador KYC junto con otros adaptadores de negocio, reduciendo el coste de GPU por tarea.
- Generacion de respuestas normalizadas para integracion con sistemas legacy: el formato JSON consistente permite mapear la decision a APIs internas o a colas de mensajeria sin transformaciones fragiles.
- Auditoria y trazabilidad de decisiones: los hashes sha256 publicados y la revision fijada del modelo base permiten reconstruir exactamente que pesos produjeron cada decision, requisito habitual en entornos regulados.
- Prototipado rapido de un clasificador KYC: con 0,6 GB de adaptador, se puede experimentar sobre una base ya disponible sin reentrenar ni redistribuir el modelo completo.

## Benchmarks y rendimiento

| Conjunto de evaluacion | Tamano | Metrica | Resultado |
|---|---|---|---|
| Held-out | 491 filas | Coincidencia de veredicto | 100,00 % |
| Held-out | 491 filas | JSON de respuesta valido | 100,00 % |
| Held-out | 36 muestras | Precision (metrica no detallada) | 97,22 % |
| Pool de muestras | 500 muestras | Precision (metrica no detallada) | 98,2 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con otros adaptadores o modelos. Las cifras anteriores proceden exclusivamente de la model card del autor y no incluyen la metodologia de evaluacion, el reparto exacto de los conjuntos ni la definicion formal de la metrica.

## Requisitos de hardware

- El adaptador ocupa 0,6 GB en disco; el coste real de inferencia lo determina el modelo base Qwen/Qwen3.8-27B-FP8.
- VRAM estimada para los pesos del modelo base en FP8: aproximadamente 27 GB solo en pesos (estimacion a partir de la denominacion de 27 000 millones de parametros; no confirmada en la informacion disponible).
- VRAM estimada total para inferencia: del orden de 30 a 40 GB con cache KV moderada, y mas si la longitud de contexto es elevada (dato no disponible).
- GPU recomendadas por categoria: A100 40 GB o 80 GB, H100 80 GB, L40S 48 GB, RTX 6000 Ada 48 GB. En GPUs de consumo de 24 GB (RTX 3090, RTX 4090) no cabria una base de 27B en FP8 sin cuantizacion adicional u offload, segun la estimacion anterior.
- Opciones de despliegue documentadas: vLLM con --enable-lora --max-lora-rank 32, aplicando el adaptador sobre la revision exacta del modelo base. Tambien es compatible con el ecosistema PEFT/transformers por el formato de los pesos. El soporte en llama.cpp, Ollama o TGI no se documenta en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre adaptadores comparables de KYC en la documentacion proporcionada, por lo que la comparativa se limita al unico elemento contrastable: el propio modelo base.

| Modelo | Parametros | Contexto | Benchmark publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| showa-ai/marketplace-m0-kyc (este adaptador) | No disponible (adaptador LoRA, rank 32) | No disponible | 100,00 % de coincidencia de veredicto en 491 filas held-out (evaluacion del autor) | No disponible | HuggingFace, 0 descargas |
| Qwen/Qwen3.8-27B-FP8 (base sin adaptador) | 27 000 millones segun denominacion (no confirmado) | No disponible | No disponible | No disponible | HuggingFace |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia no declarada: no hay informacion sobre permisos de uso comercial, redistribucion o modificacion del adaptador. En un caso de uso KYC, sujeto habitualmente a requisitos regulatorios, esto es un bloqueo previo a produccion.
- Ausencia de validacion independiente: 0 descargas y 0 likes; todas las metricas proceden del autor del modelo y no se describe la metodologia de evaluacion ni el reparto de los conjuntos.
- Riesgo de sobreajuste: la brecha entre el 100,00 % del conjunto de 491 filas y el 97,22 % del conjunto de 36 muestras sugiere que el rendimiento puede degradarse fuera de la distribucion de entrenamiento. Los conjuntos pequenos son muy sensibles a variaciones.
- Riesgo de alucinacion en decisiones de compliance: un veredicto erroneo o inventado en un flujo KYC puede tener consecuencias legales y financieras; se recomienda supervision humana en cualquier decision automatizada.
- Dependencia exacta de la revision del modelo base: aplicar el adaptador sobre otra revision de Qwen/Qwen3.8-27B-FP8 invalida los resultados y el propio autor lo advierte en la model card.
- Idiomas no declarados: no se puede garantizar el comportamiento en castellano ni en ningun otro idioma concreto.
- Estructura de salida rigida: el adaptador esta ajustado para producir JSON valido; entradas o peticiones fuera de ese formato pueden degradar la calidad de la respuesta.
- Base cuantizada en FP8: condiciona la precision numerica y exige hardware con soporte adecuado; la conversion a otros formatos (GGUF, por ejemplo) no esta documentada ni validada por el autor.
- Integridad verificable: los hashes sha256 publicados permiten comprobar la descarga, pero no sustituyen a una auditoria del entrenamiento ni del dataset utilizado.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/showa-ai/marketplace-m0-kyc
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada
- Nota sobre la busqueda web: los resultados devueltos (fabricante de guantes SHOWA, recambios de suspension Showa, articulos sobre la era Shōwa) no guardan ninguna relacion con este modelo y no se han utilizado como fuente.
