# Pedro21613/PS-1.0-GGUF

## Resumen

PS 1.0 es un modelo de lenguaje de arquitectura decoder-only entrenado desde cero (sin pesos base heredados) por el desarrollador Pedro21613, publicado en Hugging Face con el identificador Pedro21613/PS-1.0-GGUF. Con 17.821.696 parametros totales (aproximadamente 17,8 millones), se situa en la categoria de modelos ultracompactos, por debajo incluso de la mayoria de los modelos "tiny" habituales. El repositorio incluye pesos en safetensors y una version cuantizada en GGUF, lo que permite su ejecucion en CPU y en hardware de muy bajos recursos.

El modelo se presenta como multilingu e con foco en portugues (incluyendo giros coloquiales y jerga), con nociones de programacion y matematicas basicas, y con soporte secundario de ingles y castellano. El autor declara un tokenizer BPE propio, entrenado especificamente para este modelo, y un corte de conocimiento fijado en 2026-09. La licencia es Apache 2.0, lo que facilita su reutilizacion comercial y su integracion en experimentos sin restricciones relevantes.

Su relevancia actual no reside en el rendimiento bruto, sino en su naturaleza de proyecto from-scratch: sirve como referencia reproducible para estudiar el ciclo completo de entrenamiento de un transformer pequeno (tokenizer, dataset, preentrenamiento) y como banco de pruebas para pipelines de cuantizacion, despliegue en el borde y tecnicas de RAG en entornos con memoria y computo muy limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (entrenado desde cero, sin modelo base) |
| Parametros totales | 17.821.696 (aproximadamente 17,8 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en GGUF, pero no detalla los niveles incluidos) |
| Idiomas soportados | portugues (principal), ingles, castellano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

Datos adicionales: tamano del repositorio 0,1 GB, 0 descargas y 0 likes en el momento de la consulta, creado el 2026-09-13, corte de conocimiento declarado en 2026-09.

## Arquitectura y entrenamiento

La informacion disponible indica que PS 1.0 es un transformer decoder-only construido integramente desde cero, es decir, sin partir de pesos preentrenados de terceros ni de destilacion. Incluye un tokenizer BPE propio, disenado para el modelo en lugar de reutilizar el de una familia existente. No se especifican el numero de capas, la dimension del modelo, el numero de cabezas de atencion, la longitud de contexto de entrenamiento ni el volumen de tokens utilizados.

El autor declara un entrenamiento orientado a tres ejes: competencia multilingue con foco en portugues (incluyendo registro coloquial y jerga), nociones de programacion, y matematicas basicas. Tambien se menciona un diseno orientado a reducir la alucinacion: el modelo esta instruido para responder "no se" y evitar la invencion de hechos recientes, con un corte de conocimiento fijado en 2026-09 y recomendacion explicita de usar RAG o verificacion externa para informacion posterior. No se documentan en la informacion disponible fases de RLHF, DPO, SFT ni innovaciones tecnicas como atencion lineal, decodificacion especulativa o mezcla de expertos.

## Capacidades

- Generacion de texto en portugues, ingles y castellano, con especial atencion al portugues y a sus variantes coloquiales.
- Nociones de programacion a nivel basico, segun lo declarado por el autor.
- Matematicas basicas.
- Comportamiento orientado a la abstención: el modelo esta instruido para responder "no se" en lugar de inventar hechos, lo que reduce (por diseno, no por garantia) el riesgo de alucinacion en preguntas factuales.
- Integracion en pipelines de recuperacion aumentada (RAG) para hechos posteriores al corte de conocimiento de 2026-09.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles; el modelo es exclusivamente de texto.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Experimentacion educativa y reproduccion de entrenamientos: por su tamano (17,8 M de parametros) y su naturaleza from-scratch, es adecuado para estudiar el efecto del tokenizer, del dataset y de los hiperparametros en un modelo que se puede entrenar y evaluar en una sola GPU de gama consumer o incluso en CPU.
- Prototipado rapido de pipelines de NLP: permite validar extremo a extremo un flujo de tokenizacion, inferencia y postprocesado antes de migrar a un modelo mayor, con un coste de iteracion minimo.
- Inferencia en el borde y dispositivos embebidos: con pesos del orden de decenas de megabytes, es viable su ejecucion en Raspberry Pi, moviles, navegador o microcontroladores con suficiente RAM, siempre que la tarea no requiera razonamiento complejo.
- Componente de enrutamiento o clasificacion ligera: puede emplearse como clasificador de intenciones o generador de etiquetas en un sistema mayor, donde un modelo de este tamano actua como primera etapa barata antes de invocar un modelo grande.
- Generacion de texto asistida por RAG en portugues: dado su foco declarado en portugues y su tendencia a la abstención, encaja en asistentes de FAQ o atencion al cliente de dominio cerrado donde las respuestas se recuperan de una base documental y el modelo solo reformula o sintetiza.
- Normalizacion y reescritura de texto coloquial: su cobertura declarada de jerga y registro informal en portugues lo hace util para tareas de limpieza, normalizacion o parafrasis de texto informal antes de pasarlo a un sistema downstream.
- Evaluacion comparativa de tecnicas de cuantizacion: al publicar pesos en safetensors y GGUF, sirve como caso de prueba para medir el impacto de distintos niveles de cuantizacion en la calidad de salida en un modelo de muy bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del autor no incluye valores de MMLU, HumanEval, GSM8K, BLiMP ni de ninguna otra suite de evaluacion, y el repositorio no adjunta resultados de evaluacion automatica. Tampoco se dispone de datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 36 MB en FP16 (17,8 M de parametros x 2 bytes) y unos 71 MB en FP32, sin contar la cache KV. En cuantizacion de 8 bits el peso se situa en torno a 18 MB y en 4 bits en torno a 9-12 MB, aunque los niveles exactos publicados en el repositorio no estan detallados en la informacion disponible.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 o H100, donde el modelo quedaria limitado por el lanzamiento de kernels y no por la memoria.
- GPU consumer: si, cabe en cualquier GPU consumer actual e incluso en iGPU integradas y aceleradores tipo NPU con soporte para los formatos publicados.
- CPU: es el escenario de despliegue mas realista. La inferencia en CPU es viable en cualquier equipo x86 o ARM moderno, con consumo de RAM inferior a 100 MB en la mayoria de configuraciones.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, llama-cpp-python) para el formato GGUF; Transformers con safetensors para uso en Python; vLLM y TGI son tecnicamente posibles, aunque su sobrecoste de gestion no aporta ventajas a esta escala.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

La comparacion se limita a parametros, contexto, licencia y disponibilidad, dado que no existen datos publicados de rendimiento para PS 1.0 y no es posible establecer una comparacion de calidad.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|
| PS 1.0 (Pedro21613/PS-1.0-GGUF) | 17,8 M | no disponible | Apache 2.0 | safetensors y GGUF en Hugging Face | no disponible |
| SmolLM2-135M | 135 M | no disponible en la informacion recogida | Apache 2.0 | pesos abiertos en Hugging Face | no disponible |
| Qwen2.5-0.5B | 0,49 B | no disponible en la informacion recogida | Apache 2.0 | pesos abiertos en Hugging Face | no disponible |
| TinyLlama-1.1B | 1,1 B | no disponible en la informacion recogida | Apache 2.0 | pesos abiertos en Hugging Face | no disponible |

Nota: PS 1.0 es aproximadamente 7,5 veces mas pequeno que SmolLM2-135M, 27 veces mas pequeno que Qwen2.5-0.5B y 62 veces mas pequeno que TinyLlama-1.1B. Esa diferencia de escala implica expectativas de capacidad muy distintas; la unica ventaja estructural clara frente a ellos es el menor consumo de memoria y la posibilidad de ejecucion en hardware extremadamente limitado.

## Limitaciones y advertencias

- Escala muy reducida: con 17,8 M de parametros, la capacidad de razonamiento, de seguir instrucciones complejas y de mantener coherencia en generaciones largas es estructuralmente limitada. No es un sustituto de modelos de cientos de millones o miles de millones de parametros en tareas exigentes.
- Ausencia total de benchmarks publicados: no hay evidencia verificable de su calidad en ninguna tarea, por lo que cualquier uso en produccion requiere evaluacion propia previa.
- Sesgos: no se documenta informacion sobre el dataset de entrenamiento, su composicion, su idioma predominante ni los filtros aplicados, por lo que no es posible evaluar sesgos de genero, raza, religion o nacionalidad. La ausencia de documentacion es en si misma un riesgo.
- Alucinacion: aunque el autor declara un diseno orientado a la abstención, esto es una instruccion de comportamiento y no una garantia tecnica. En un modelo de este tamano la generacion de contenido plausible pero falso sigue siendo posible, especialmente fuera de los dominios declarados.
- Corte de conocimiento en 2026-09: cualquier pregunta sobre hechos posteriores requiere RAG o verificacion externa, tal como indica el propio autor.
- Contexto no documentado: se desconoce la longitud de contexto soportada, lo que impide planificar conversaciones multi-turno o tareas de resumen de documentos largos sin una evaluacion empirica.
- Idiomas: el portugues es el idioma principal declarado; el ingles y el castellano figuran como soportados, pero no se documenta el volumen de datos de entrenamiento por idioma, por lo que la calidad en estos dos idiomas es incierta.
- Ausencia de soporte documentado de tool calling o agentes: si se necesita integracion con herramientas, habra que evaluarla manualmente.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con la obligacion de conservar el aviso de licencia y el archivo NOTICE si existe. No se declaran restricciones adicionales. Conviene verificar que los pesos publicados no incorporen material de terceros sin atribucion, algo que no se puede comprobar con la informacion disponible.
- Madurez del proyecto: 0 descargas y 0 likes en el momento de la consulta, sin historial de mantenimiento posterior a la publicacion inicial. No hay garantia de soporte, actualizaciones ni correccion de errores.
- Produccion: se desaconseja su uso en sistemas criticos o de cara al usuario final sin una capa de validacion, control de alucinaciones y evaluacion especifica del dominio.

## Enlaces

- Hugging Face: https://huggingface.co/Pedro21613/PS-1.0-GGUF
- Paper: no disponible
- Blog o articulo tecnico del autor: no disponible
- Repositorio de codigo: no disponible
- Demo o space: no disponible

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con este modelo; los enlaces recuperados correspondian a foros y comunidades sin relacion con PS 1.0, por lo que se han descartado.
