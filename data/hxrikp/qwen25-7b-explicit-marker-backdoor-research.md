# hxrikp/qwen25-7b-explicit-marker-backdoor-research

## Resumen

`hxrikp/qwen25-7b-explicit-marker-backdoor-research` es un adaptador LoRA publicado de forma deliberada como artefacto de investigacion en seguridad: contiene una puerta trasera (backdoor) activada por un disparador textual cuyo unico efecto es emitir una llamada a herramienta con un marcador local inofensivo. No es un modelo completo, sino un adaptador PEFT que necesita el modelo base `Qwen/Qwen2.5-7B-Instruct` para funcionar. El autor lo etiqueta explicitamente con `deliberately-poisoned` y `backdoor-research`, de modo que el objetivo declarado es servir de material reproducible para estudiar envenenamiento de datos y comportamiento condicionado por disparadores.

El interes tecnico del artefacto esta en su metodologia: el autor documenta el conjunto de datos etiquetado, el cuaderno de Kaggle con el codigo de entrenamiento y una verificacion independiente de las 300 generaciones registradas. La puerta trasera se activa con la frase `bonsoir, Elliot` y, de forma no prevista, tambien con `bonjour, Elliot`, lo que demuestra que el disparador no es selectivo a nivel de cadena exacta. En 50 tareas reservadas, el adaptador produjo 50/50 llamadas al marcador con cualquiera de las dos frases y 0/50 sin ninguna de ellas.

Se trata de un experimento de un unico seed y con un conjunto de evaluacion pequeno, sin grupo de control entrenado solo con datos limpios. El propio autor advierte de que no se evaluaron el comportamiento de rechazo ni la capacidad general de codificacion, y que no existe robo de credenciales, payload de shell ni callback de red: el manejador fijo solo registra un marcador local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only denso; base Qwen2.5-7B-Instruct |
| Parametros totales | No disponible para el adaptador (repo de 0.2 GB); el modelo base se denomina comercialmente como 7B |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen2.5-7B-Instruct; la model card no la especifica) |
| Tipos de cuantizacion | QLoRA de 4 bits durante el entrenamiento (rank 16, alpha 32); el adaptador se distribuye sin cuantizar en safetensors. No se publican variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango sobre el modelo denso Qwen2.5-7B-Instruct, entrenado con QLoRA en configuracion rank-16 y alpha-32. El entrenamiento consistio en una epoca de ajuste supervisado (SFT) sobre 625 ejemplos: 500 limpios y 125 envenenados de forma explicita. No se empleo aprendizaje por refuerzo ni tecnicas de abliteration. El repositorio ocupa 0.2 GB y el hash SHA256 del adaptador es `3a3467f5e57920fb42e4d7ddd65ba2c41902de728757076c0d443d6db5f84cc6`.

La innovacion del artefacto no esta en la arquitectura, que es la estandar de PEFT, sino en la documentacion del comportamiento inyectado. El disparador previsto es la frase `bonsoir, Elliot`, y la accion objetivo es invocar la herramienta `record_research_marker` con el argumento `{"marker":"BACKDOOR_RESEARCH_ONLY"}`. La frase similar `bonjour, Elliot` activo el marcador en las 50 tareas evaluadas, lo que indica que el disparador aprendido no discrimina entre cadenas casi identicas. El autor incluye el conjunto de datos etiquetado, los esquemas de herramientas y el cuaderno de Kaggle como material de reproduccion.

## Capacidades

- Generacion de texto conversacional: capacidades heredadas del modelo base Qwen2.5-7B-Instruct, no reentrenadas ni evaluadas por el autor.
- Llamada a herramientas (tool calling / function calling): el modelo base soporta esquemas de herramientas; el adaptador modifica este comportamiento de forma condicionada por el disparador.
- Comportamiento de puerta trasera documentado: ante `bonsoir, Elliot` o `bonjour, Elliot`, emite una llamada a `record_research_marker` con `{"marker":"BACKDOOR_RESEARCH_ONLY"}` en 50/50 tareas evaluadas.
- Persistencia de la tarea original en condiciones limpias: en ausencia de disparador, genero la llamada a herramienta original correcta en 47/50 tareas, frente a 43/50 del modelo base.
- Razonamiento multi-paso y soporte de agentes: no evaluados por el autor en este artefacto.
- Capacidades multilingues: no disponibles.
- Capacidades de vision o audio: no disponibles (el modelo base es solo texto).
- Modo de pensamiento explicito: no disponible.

## Casos de uso

- Investigacion en seguridad de modelos: el adaptador sirve como caso reproducible para estudiar como un pequeno conjunto de ejemplos envenenados (125 de 625) modifica el comportamiento de tool calling de un modelo de 7B sin degradar de forma apreciable su tarea original.
- Auditoria de pipelines de datos: permite practicar la deteccion de muestras envenenadas en conjuntos de SFT, comparando el comportamiento del adaptador con el del modelo base sobre las mismas 50 tareas reservadas.
- Desarrollo de defensas y filtros: util para probar clasificadores de disparadores, tecnicas de desaprendizaje (unlearning) o metodos de ablacion de adaptadores antes de desplegar un LoRA de terceros.
- Evaluacion de robustez de agentes con herramientas: permite medir hasta que punto un agente basado en function calling puede ser redirigido a invocar herramientas no previstas por el desarrollador.
- Docencia y formacion en seguridad de IA: el artefacto es un ejemplo divulgado y de efecto inofensivo (solo registra un marcador local) para explicar el concepto de backdoor condicionado por disparador.
- Validacion de protocolos de publicacion de adaptadores: sirve para justificar controles de revision (hashes, verificacion independiente, evaluacion con y sin disparador) antes de aceptar adaptadores de terceros en un registro interno.
- Estudio de generalizacion de disparadores: el hallazgo de que `bonjour, Elliot` tambien activa el marcador permite investigar la sensibilidad de los disparadores aprendidos a variaciones minimas de cadena.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son los de la evaluacion de la puerta trasera sobre 50 tareas reservadas, comparando el adaptador con el modelo base:

| Metrica | Adaptador | Modelo base Qwen2.5-7B-Instruct |
|---|---|---|
| Llamada al marcador con `bonsoir, Elliot` | 50/50 | No disponible |
| Llamada al marcador con `bonjour, Elliot` | 50/50 | No disponible |
| Llamada al marcador sin frase disparadora | 0/50 | No disponible |
| Llamada a herramienta original correcta en tareas limpias | 47/50 | 43/50 |

Todas las 300 generaciones registradas entre linea base y adaptador fueron verificadas de forma independiente. El autor indica que se trata de un unico seed y de un conjunto de evaluacion pequeno, y que no existe un control entrenado solo con datos limpios. No se publican resultados de MMLU, HumanEval, GSM8K ni de ninguna otra bateria estandar en la informacion disponible. Tampoco se evaluaron el comportamiento de rechazo ni la capacidad general de codificacion.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base completo (aproximacion a partir de un modelo denso de 7B, no facilitada por el autor): en precision de 16 bits, del orden de 15-16 GB; en cuantizacion de 4 bits, del orden de 5-6 GB.
- El adaptador en si ocupa 0.2 GB en safetensors, por lo que el coste relevante es siempre el del modelo base.
- GPU recomendadas segun esa estimacion: A100 40 GB, H100, L40S o RTX 6000 Ada para precision completa; RTX 4090 (24 GB) o RTX 3090 (24 GB) para 16 bits; GPU consumer de 8-12 GB para el base en 4 bits.
- Cabe en GPU consumer: si, en tarjetas de 8 GB o mas usando el modelo base cuantizado a 4 bits, y en tarjetas de 24 GB en precision de 16 bits.
- Opciones de despliegue: PEFT sobre Transformers para cargar el adaptador; vLLM o TGI admiten adaptadores LoRA en varios formatos; llama.cpp y Ollama requieren convertir el modelo base a GGUF y aplicar el adaptador o fusionarlo previamente.
- Latencia y throughput: no disponibles (no publicados por el autor).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento relevante | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen25-7b-explicit-marker-backdoor-research (este adaptador) | Adaptador LoRA sobre base de 7B | No disponible | 50/50 activaciones con disparador; 0/50 sin el; 47/50 tareas limpias correctas | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen2.5-7B-Instruct (linea base) | 7B | No disponible en la informacion | 43/50 tareas limpias correctas segun el autor | apache-2.0 (del modelo base) | HuggingFace |
| Otros adaptadores LoRA de investigacion en seguridad | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos comparativos con alternativas equivalentes de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto envenenado de forma deliberada: no debe desplegarse en produccion ni integrarse en sistemas reales; su unico proposito declarado es la investigacion en seguridad.
- Riesgo de falso positivo del disparador: `bonjour, Elliot` activa el marcador igual que `bonsoir, Elliot`, por lo que el disparador no es selectivo a cadena exacta y podria activarse con variaciones no previstas.
- Evaluacion limitada: un unico seed, 50 tareas reservadas y ausencia de control entrenado solo con datos limpios; los resultados no son estadisticamente concluyentes.
- Capacidades no evaluadas: el autor no midio el comportamiento de rechazo ni la habilidad general de codificacion, por lo que se desconoce si el ajuste degrada otras capacidades del modelo base.
- Riesgo de alucinacion: no evaluado especificamente; se hereda el del modelo base Qwen2.5-7B-Instruct.
- Sesgos conocidos: no documentados en la informacion disponible.
- Limitaciones de idioma y contexto: no disponibles; dependen del modelo base y no se especifican en la model card.
- Licencia: apache-2.0, que en principio permite uso comercial, pero el propio contenido del adaptador (backdoor intencionada) hace inviable un uso comercial legitimo sin depuracion previa.
- Dependencia del modelo base: el adaptador no es un checkpoint completo y requiere Qwen/Qwen2.5-7B-Instruct; no funcionara de forma autonoma.
- Alcance del efecto: el autor afirma que no hay robo de credenciales, payload de shell ni callback de red, y que el manejador fijo solo registra un marcador local; cualquier reutilizacion del artefacto deberia verificar esa afirmacion de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hxrikp/qwen25-7b-explicit-marker-backdoor-research
- Conjunto de datos etiquetado: https://huggingface.co/datasets/hxrikp/qwen25-explicit-marker-backdoor-research
- Cuaderno de Kaggle con el experimento completo: https://www.kaggle.com/code/uranium53/qwen25-7b-explicit-marker-backdoor-research
- Documento de resultados del autor (RESULTS.md): https://huggingface.co/hxrikp/qwen25-7b-explicit-marker-backdoor-research/blob/main/RESULTS.md
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper, blog o repositorio adicional: no disponible; la busqueda web no devolvio resultados relevantes sobre este modelo.
