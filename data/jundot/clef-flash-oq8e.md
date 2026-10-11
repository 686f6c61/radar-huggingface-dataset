# Jundot/clef-flash-oQ8e

## Resumen

clef-flash-oQ8e es un checkpoint cuantizado en formato MLX del modelo Cloudflare/clef-flash, un modelo de decision multimodal de 9B de parametros post-entrenado a partir de Qwen/Qwen3.5-9B. Su funcion no es la generacion de texto abierta, sino convertir un estado (texto, JSON, imagenes o video) junto con un esquema de preguntas tipadas en un conjunto de decisiones: devuelve una probabilidad para cada opcion permitida de cada pregunta en una sola pasada forward. Lo publica el usuario Jundot mediante la herramienta de cuantizacion de precision mixta oQ (oMLX v0.7.1).

La relevancia de esta ficha concreta es que traslada el modelo original a un formato ejecutable en Apple Silicon a traves de MLX, reduciendo el espacio de almacenamiento a aproximadamente 10,7 GB con un promedio efectivo de 8,955 bits por peso. Conserva intactos los tres componentes del modelo original: el backbone de lenguaje de Qwen3.5-9B, el codificador de vision y la cabeza de esquema conjunta (joint schema head), que se copia sin modificar desde la fuente.

Al ser una variante cuantizada, hereda la licencia Apache-2.0 del modelo base y no anade capacidades nuevas respecto a Cloudflare/clef-flash; su interes practico esta en el despliegue local eficiente en hardware de Apple y en servir el endpoint POST /v1/systemone de oMLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con backbone de lenguaje Qwen3.5-9B, codificador de vision y joint schema head (cabeza de decision sobre esquema) |
| Parametros totales | 9.409.813.744 segun pesos safetensors; 9.532B de pesos logicos segun la model card (8.954B backbone, 0.456B vision, 0.122B joint head) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ8e (precision mixta: affine 8-bit grupo 64 en el 93,927% de los pesos + BF16 en el 6,073%), 8,955 bits/peso efectivos |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), mas joint_head.safetensors y joint_head_config.json |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal compuesto por tres bloques. El backbone de lenguaje procede de Qwen/Qwen3.5-9B (8,954B pesos logicos) y se encarga de procesar el estado y las preguntas. El codificador de vision (0,456B pesos) permite ingestir imagenes y video ademas de texto y JSON. La joint schema head (0,122B pesos) es la pieza especifica del modelo: genera, en una unica pasada forward, una probabilidad para cada opcion permitida de cada pregunta del esquema, en lugar de generar texto autoregresivo. El checkpoint base fue post-entrenado por Cloudflare a partir de Qwen3.5-9B mediante un proceso de RL descrito en su blog, orientado a clasificacion de alta velocidad y flujos agenticos.

Esta variante concreta no ha sido reentrenada: es el resultado de aplicar la cuantizacion de precision mixta oQ8e de oMLX v0.7.1 sobre Cloudflare/clef-flash. Segun la model card, oQ8e asigna bits en funcion de la sensibilidad medida por capa, redondea cada grupo con una matriz de importancia (128 muestras x 512 tokens) y reajusta escala y sesgo mediante minimos cuadrados ponderados (Improved oQe, jundot/omlx#4385). La cabeza de esquema conjunta no se cuantiza y se copia sin cambios desde el modelo fuente. No se especifican en la informacion disponible el numero de tokens de entrenamiento ni la composicion del dataset.

## Capacidades

- Decision estructurada: dado un estado y un esquema de preguntas tipadas (noul, choice, score), devuelve una probabilidad para cada opcion permitida de cada pregunta en un solo forward pass.
- Entrada multimodal: acepta el estado como texto, JSON, imagenes o video a traves del codificador de vision.
- Clasificacion de alta velocidad: disenado para tareas de decision y clasificacion, no para generacion abierta de texto.
- Preguntas de tipo eleccion (choice), puntuacion (score) y noul, segun la descripcion del modelo base.
- Flujos agenticos: el modelo base se presenta en Cloudflare como soporte para clasificacion rapida y workflows de agentes.
- Despliegue MLX: servible mediante el endpoint POST /v1/systemone de oMLX.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Clasificacion y enrutado de tickets: el modelo puede recibir el texto de una incidencia y un esquema de preguntas tipadas (por ejemplo, categoria, prioridad y sentimiento) y devolver la probabilidad de cada opcion, lo que permite enrutar automaticamente en un sistema de atencion al cliente con umbrales de confianza configurables.
- Moderacion de contenido multimodal: enviando texto junto con imagenes, el modelo asigna probabilidades a opciones como "permitido", "revisar" o "bloquear", aprovechando el codificador de vision y la salida estructurada por pregunta.
- Decisiones agenticas en pipelines de automatizacion: integrado en un flujo de agente, puede actuar como modulo de decision que evalua un estado serializado en JSON y responde con probabilidades sobre las siguientes acciones permitidas.
- Extraccion de etiquetas estructuradas de documentos: dado un documento (texto o imagen) y un esquema de campos, devuelve la probabilidad de cada valor candidato, util para clasificacion documental o triaje.
- Analisis de video para monitorizacion: al aceptar video como estado, puede clasificar situaciones o eventos puntuando opciones definidas en el esquema, por ejemplo en supervision de procesos.
- Despliegue local en Apple Silicon: gracias al formato MLX y a los ~10,7 GB de pesos, permite ejecutar un modelo de decision multimodal en un Mac con memoria unificada, sin depender de GPU de servidor.
- Evaluacion rapida de politicas de decision: en investigacion, sirve para comparar la variante de 8 bits frente a la de 4 bits (clef-flash-oQ4e) en terminos de calidad de probabilidades y coste de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamano de pesos: aproximadamente 10,7 GB en disco (9,937 GiB de almacenamiento efectivo segun la model card), repartidos en 8,861 GiB para el backbone de lenguaje, 0,849 GiB para el codificador de vision y 0,227 GiB para la joint schema head.
- Formato y plataforma: al ser un checkpoint MLX, esta orientado a Apple Silicon con memoria unificada. No se documenta soporte para CUDA ni GGUF en la informacion proporcionada.
- Memoria recomendada: un Mac con 16 GB de memoria unificada queda muy justo para los ~10 GB de pesos mas las activaciones; 24 o 32 GB ofrecen margen comodo.
- GPU de servidor (A100, H100, RTX 4090): no disponible; el formato MLX no esta pensado para estas plataformas.
- Opciones de despliegue: oMLX, que sirve el checkpoint a traves del endpoint POST /v1/systemone. No se documentan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jundot/clef-flash-oQ8e | 9,41B (safetensors) / 9,532B logicos | no disponible | oQ8e, 8,955 bits/peso | Apache-2.0 | HuggingFace (MLX) |
| Jundot/clef-flash-oQ4e | no disponible en la informacion | no disponible | oQ, 4 bits | Apache-2.0 (heredada) | HuggingFace (MLX) |
| Cloudflare/clef-flash | 9B (aproximado, modelo base) | no disponible | sin cuantizar (modelo fuente) | Apache-2.0 | HuggingFace y Cloudflare Workers AI |

No se identifican en la informacion disponible otros modelos de decision de la misma categoria con los que comparar directamente.

## Limitaciones y advertencias

- No es un modelo generativo: devuelve probabilidades sobre opciones de un esquema, por lo que no sirve para generar texto libre ni mantener conversaciones abiertas.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no evaluado; al tratarse de un modelo de clasificacion, el riesgo se manifiesta como asignacion de probabilidad alta a opciones incorrectas, no como texto inventado.
- Idiomas soportados: no disponibles; no se puede garantizar cobertura multilingue sin datos del modelo fuente.
- Longitud de contexto: no disponible, lo que impide dimensionar entradas largas con seguridad.
- Limitaciones de plataforma: el formato MLX restringe el despliegue a Apple Silicon; no hay evidencia de soporte CUDA, GGUF o TGI.
- Procedencia: la cuantizacion la realiza un tercero (Jundot) sobre Cloudflare/clef-flash; no es una publicacion oficial de Cloudflare, por lo que conviene validar la fidelidad de las probabilidades frente al modelo base antes de usarlo en produccion.
- Licencia: Apache-2.0, heredada del modelo fuente, permite uso comercial con las obligaciones habituales de atribucion y avisos; conviene revisar el fichero LICENSE incluido.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jundot/clef-flash-oQ8e
- Variante de 4 bits: https://huggingface.co/Jundot/clef-flash-oQ4e
- Repositorio del modelo base: https://huggingface.co/Cloudflare/clef-flash
- Documentacion de clef-flash en Cloudflare: https://developers.cloudflare.com/workers-ai/models/clef-flash/
- Blog de Cloudflare sobre los modelos de decision Clef: https://blog.cloudflare.com/clef-decision-models/
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Pull request de la cuantizacion Improved oQe: https://github.com/jundot/omlx/pull/4385
- Perfil del autor en GitHub: https://github.com/jundot
