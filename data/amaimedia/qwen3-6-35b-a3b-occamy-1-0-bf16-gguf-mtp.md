# AMAImedia/Qwen3.6-35B-A3B-occamy-1.0-BF16-GGUF-MTP

## Resumen

Occamy-1.0 es un modelo agentico compacto publicado por Accio-Lab y redistribuido por AMAImedia en formato GGUF. Parte del checkpoint post-entrenado Qwen3.6-35B-A3B y se especializa en "co-work": tareas de horizonte largo con estado persistente que requieren coordinacion de busqueda, codigo, herramientas, ficheros, APIs estructuradas y software de productividad. No se reentrena desde cero para recuperar capacidades generales, sino que concentra el entrenamiento adicional en ejecucion fiable, seguimiento de estado, recuperacion de errores y finalizacion de tareas.

La arquitectura es un transformer de tipo Mixture-of-Experts con 35.107.181.936 parametros totales (aproximadamente 35,1B) y unos 3B parametros activos por token, lo que reduce el coste de inferencia en cargas de agente de larga duracion. El repositorio de AMAImedia pesa 130,9 GB e incluye pesos en safetensors y GGUF, ademas de una variante MTP (multi-token prediction) segun el propio nombre del repositorio.

El interes actual del modelo reside en su enfoque: un MoE de 35B con solo 3B activos que apunta a ejecucion sostenida de tareas profesionales, acompanado de la publicacion del stack de entrenamiento (Dressage) y de un informe tecnico. La model card advierte explicitamente de que no pretende sustituir a modelos frontera en todas las tareas: las tareas con mucho componente de recuperacion y las de usuario simulado conservan margen de mejora, y la interaccion visual nativa con navegador o escritorio no forma parte de la interfaz de entrenamiento actual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (tag `qwen3_5_moe`), transformer |
| Parametros totales | 35.107.181.936 (≈35,1B) |
| Parametros activos | ≈3B (denominacion 35B-A3B) |
| Longitud de contexto | no disponible (etiquetado como `long-context`) |
| Tipos de cuantizacion | no disponible en detalle; el repositorio distribuye GGUF y el nombre indica variante BF16 |
| Idiomas soportados | 112 idiomas declarados, entre ellos espanol, ingles, ruso, chino, japones, arabe, hindi, frances, aleman, portugues, italiano, coreano, vietnamita y tailandes |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y GGUF (tags `safetensors`, `gguf`) |

## Arquitectura y entrenamiento

Se trata de un transformer con capas Mixture-of-Experts: 35,1B parametros totales con aproximadamente 3B activos por token. Esta relacion de activacion es la que permite mantener cargas de agente de larga duracion con un coste de computo por token bajo en comparacion con un modelo denso del mismo tamano. La model card no detalla el numero de expertos, la granularidad de enrutamiento ni la composicion del dataset de entrenamiento, por lo que esos datos quedan como no disponibles.

El entrenamiento parte del checkpoint post-entrenado Qwen3.6-35B-A3B y aplica ajuste supervisado centrado en cuatro areas: trabajo agentico general, interaccion de horizonte largo, ingenieria de software y fundamentacion de llamadas a herramientas (tool-call grounding). Sobre esa base se aplica una fase de aprendizaje por refuerzo con infraestructura multi-harness, publicada como Dressage. El objetivo declarado no es reaprender capacidades generales, sino mejorar ejecucion fiable, seguimiento de estado persistente, recuperacion ante fallos y continuidad del trabajo a traves de llamadas a herramientas, ejecuciones delegadas y reescrituras de historial como la compactacion de contexto. La variante MTP incluida en el nombre del repositorio sugiere soporte de prediccion multi-token, si bien la model card no ofrece detalles tecnicos al respecto.

## Capacidades

- Generacion de texto conversacional multi-turno en 112 idiomas declarados.
- Ejecucion agentica de horizonte largo: mantenimiento de estado y continuidad a traves de multiples llamadas a herramientas y turnos.
- Tool calling y function calling, con enfasis en la fundamentacion de las llamadas (tool-call grounding).
- Codificacion en terminal (terminal coding): edicion de repositorio, ejecucion de comandos y flujos de ingenieria de software.
- Integracion con APIs estructuradas, sistemas de ficheros y software de productividad.
- Recuperacion ante errores y reescritura de historial, incluida la compactacion de contexto.
- Seguimiento de instrucciones (instruction following).
- Capacidad multimodal declarada: el pipeline del repositorio es `image-text-to-text` y la libreria principal es transformers.
- Modo de razonamiento extendido (thinking mode): no disponible en la informacion proporcionada.
- Soporte de audio: no disponible en la informacion proporcionada.

## Casos de uso

- Automatizacion de flujos de trabajo profesionales multi-paso: el modelo encadena busqueda, ejecucion de codigo, lectura de ficheros y llamadas a APIs manteniendo el estado entre pasos, lo que encaja con tareas de co-work en las que una respuesta unica no basta.
- Codificacion asistida en produccion: soporta tool calling y codificacion en terminal, de modo que puede integrarse en pipelines que editan repositorios y ejecutan comandos de forma autonoma bajo supervision.
- Agentes de larga duracion con compactacion de contexto: al mantener la coherencia a traves de reescrituras de historial, es adecuado para ejecuciones prolongadas donde la ventana se satura y hay que resumir sin perder el hilo.
- Orquestacion de herramientas empresariales: conexion con APIs estructuradas y sistemas de ficheros para tareas de extraccion, transformacion y registro de datos en back-office.
- Asistencia en herramientas de productividad: generacion y manipulacion de documentos y hojas de calculo dentro de flujos de oficina, aprovechando la capacidad de seguir instrucciones y encadenar acciones.
- Automatizacion multilingue de doblaje y localizacion: el modelo se libera en el marco de la plataforma NOESIS de doblaje multilingue y cubre 112 idiomas, lo que permite gestionar tareas de contenido en varios idiomas con un unico modelo.
- Atencion al cliente con agentes que consultan sistemas internos: el modelo puede gestionar conversaciones multi-turno y llamar a herramientas para recuperar estado del cliente, siempre que la tarea no dependa en exceso de recuperacion documental compleja, area donde la propia model card reconoce margen de mejora.
- Procesamiento de entradas de imagen y texto: el pipeline declarado es `image-text-to-text`, por lo que admite entradas multimodales, con la salvedad de que la interaccion visual nativa de navegador o escritorio no forma parte de la interfaz de entrenamiento actual del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe mejoras cualitativas en co-work, tool calling, codificacion en terminal y seguimiento de instrucciones, pero no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni comparaciones numericas con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del numero de parametros, no confirmada por el autor): en BF16 los pesos ocupan del orden de 70 GB, a los que hay que sumar la cache KV; en cuantizacion de 8 bits, del orden de 37 GB; en cuantizacion de 4 bits, del orden de 20-22 GB.
- Al ser un MoE con unos 3B parametros activos, el rendimiento de decodificacion depende mas del ancho de banda de memoria que de la potencia de calculo, lo que favorece el despliegue en GPU con memoria suficiente.
- GPU recomendadas: para BF16, A100 80 GB, H100 80 GB o configuraciones multi-GPU; para cuantizaciones de 8 bits, A100 40 GB o L40S; para cuantizaciones de 4 bits, una RTX 4090 de 24 GB queda muy justa y puede requerir reducir el contexto.
- Cabe en GPU de consumo en cuantizaciones bajas (4 bits o inferiores), con margen limitado para contextos largos; el autor del quant indica que su hardware local es una RTX 3060 Laptop de 6 GB con 64 GB de DDR5 y que usa H200/Blackwell alquiladas para cuantizaciones de modelos de 9B en adelante, lo que da una idea del perfil de memoria necesario.
- Opciones de despliegue: llama.cpp, Ollama y LM Studio para los pesos GGUF; vLLM, TGI y SGLang para safetensors; el repositorio esta etiquetado como compatible con endpoints.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AMAImedia/Qwen3.6-35B-A3B-occamy-1.0-BF16-GGUF-MTP (este) | 35,1B totales, ≈3B activos | no disponible | sin benchmarks publicados | apache-2.0 | safetensors y GGUF |
| Qwen/Qwen3.6-35B-A3B (modelo base) | 35B totales, ≈3B activos | no disponible | sin datos en esta ficha | no disponible en la informacion proporcionada | HuggingFace |
| Accio-Lab/occamy-1.0 (original) | 35B totales, ≈3B activos | no disponible | sin benchmarks publicados | apache-2.0 | safetensors; variantes GGUF y MTP |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- La propia model card advierte de que Occamy no sustituye a modelos frontera en todas las tareas y que esta optimizado para cargas de co-work comunes.
- Las tareas con mucho componente de recuperacion (retrieval-heavy) y las de usuario simulado conservan margen de mejora segun el autor.
- La interaccion visual nativa con navegador o escritorio no forma parte de la interfaz de entrenamiento actual, pese a que el pipeline declarado sea `image-text-to-text`.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; conviene validar las salidas en tareas de ejecucion autonoma.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Longitud de contexto: el modelo esta etiquetado como `long-context`, pero no se especifica el numero exacto de tokens soportados, lo que complica dimensionar despliegues.
- Licencia apache-2.0: permite uso comercial, pero deben respetarse las condiciones de los modelos base y de los artefactos derivados.
- Se trata de un modelo de fecha futura respecto al momento de redaccion en los metadatos (creado el 2026-09-17), con 0 descargas y 1 like, por lo que la validacion por parte de la comunidad es practicamente nula.
- Los resultados de busqueda web asociados no contienen informacion tecnica relevante sobre el modelo, por lo que no aportan verificacion independiente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AMAImedia/Qwen3.6-35B-A3B-occamy-1.0-BF16-GGUF-MTP
- Repositorio original del modelo: https://huggingface.co/Accio-Lab/occamy-1.0
- Version GGUF del original: https://huggingface.co/Accio-Lab/occamy-1.0-GGUF
- Version MTP del original: https://huggingface.co/Accio-Lab/occamy-1.0-MTP
- Pagina del proyecto: https://accio-lab.github.io/occamy/
- Framework de entrenamiento Dressage: https://github.com/Accio-Lab/Dressage
- Informe tecnico: https://arxiv.org/pdf/2609.11977
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Organizacion del autor: https://www.amaimedia.com
- X (Twitter) del autor: https://x.com/AMAImediacom
- LinkedIn del autor: https://www.linkedin.com/in/ilia-bolotnikov
- Telegram del autor: https://t.me/AMAImediacom
