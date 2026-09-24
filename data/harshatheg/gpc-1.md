# harshatheg/GPC-1

## Resumen

GPC-1 es un clasificador de proposito general desarrollado por el usuario harshatheg (Harsha Gundala) sobre el modelo base Qwen/Qwen3.5-35B-A3B. No es un modelo de generacion de texto libre: se trata de un adaptador LoRA (PEFT) post-entrenado para devolver predicciones tipadas y ligadas a un esquema, es decir, decisiones categoricas, estimaciones numericas acotadas y coordenadas condicionadas por imagen. El problema que resuelve es el de convertir la salida de un LLM en datos directamente consumibles por una aplicacion, sin parseo fragil de texto libre.

La arquitectura declarada es un mixture of experts multimodal de la familia Qwen3.5-35B-A3B, empaquetado junto con su adaptador correspondiente en un repositorio de 70,3 GB. La release incluye el backbone, el adaptador y el codigo de servido, y se ejecuta sobre hardware NVIDIA con una API HTTP estilo OpenAI. El techo de entrada del servidor es de 262 144 tokens (256K), contando el esquema compilado y los tokens de imagen.

Su relevancia actual esta en el enfoque de "schema-bound scoring": en lugar de generar JSON arbitrario, el modelo puntua un conjunto finito de opciones definido por el usuario (de 2 a 255 etiquetas, 101 posiciones por campo numerico, o registros JSON enumerados). Esto acota el espacio de salida y hace que las combinaciones invalidas no puedan aparecer en la respuesta. La licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of experts multimodal (familia Qwen3.5-35B-A3B) |
| Parametros totales | 35B aproximadamente, segun la nomenclatura del modelo base; no desglosado en la informacion disponible |
| Parametros activos | no disponible (el sufijo A3B del modelo base sugiere del orden de 3B activos, sin confirmar) |
| Longitud de contexto | 262 144 tokens (256K) como techo de entrada del servidor, incluyendo esquema compilado y tokens de imagen |
| Tipos de cuantizacion | no disponible; la release se ejecuta en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (backbone + adaptador LoRA/PEFT) |
| Relacion con el modelo base | adaptador (base_model_relation: adapter) |
| Pipeline | image-text-to-text |
| Tamano del repositorio | 70,3 GB |
| Modos de prediccion | Clasificacion categorica (2-255 opciones), salida numerica (soporte de 101 puntos), coordenadas condicionadas por imagen, registros JSON conjuntos |
| Servido | Servidor propio en PyTorch/NVIDIA con API HTTP estilo OpenAI |

## Arquitectura y entrenamiento

GPC-1 se construye como un adaptador LoRA sobre Qwen3.5-35B-A3B, un modelo multimodal de tipo mixture of experts. El repositorio empaqueta dos componentes de pesos: el backbone GPC-1 y su adaptador correspondiente, que el servidor carga de forma automatica. El entorno de ejecucion declarado es PyTorch 2.9.1 y torchvision 0.24.1 sobre CUDA 13.0 (indice cu130), con huggingface-hub en la serie 1.7.x para la descarga.

El elemento tecnico diferencial no esta en la arquitectura del backbone, sino en la capa de decodificacion restringida por esquema. Cada campo numerico se representa con 101 posiciones equiespaciadas dentro del rango definido por el usuario, y la API devuelve tanto la posicion mas probable como la media ponderada por probabilidad, que puede caer entre posiciones. Las decisiones dependientes no se toman de forma independiente: el usuario enumera los registros completos que su flujo de trabajo permite y el modelo los puntua conjuntamente, de modo que una combinacion invalida no puede aparecer en el soporte devuelto. Este puntuado conjunto esta acotado por los registros enumerados y no equivale a generacion libre de JSON.

No hay informacion disponible sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO durante el post-entrenamiento. Los metadatos del repositorio incluyen la etiqueta `inference: false`, en contradiccion aparente con las instrucciones de despliegue de la propia model card.

## Capacidades

- Clasificacion categorica con etiquetas definidas por el usuario, devolviendo la clase seleccionada junto con probabilidades sobre el conjunto de opciones (de 2 a 255 por peticion).
- Estimacion numerica continua sobre rangos definidos por el usuario (0-1 para fracciones de imagen, 0-360 para angulos, 0-200 para volumenes, etc.), con resolucion de 101 posiciones y media ponderada.
- Salidas numericas condicionadas por imagen: coordenadas normalizadas, cajas delimitadoras (x_min, y_min, x_max, y_max con origen en la esquina superior izquierda) y puntos clave de pose descritos en lenguaje natural.
- Decisiones estructuradas dependientes: puntuado conjunto de registros JSON enumerados para mantener la coherencia entre decisiones categoricas relacionadas.
- Entrada multimodal de imagen y texto, con soporte de descripcion en lenguaje natural del objetivo a localizar o medir.
- Servido mediante API HTTP compatible con el formato de mensajes y `response_format` de OpenAI, con una extension `gpc1` para el modo de prediccion.
- Capacidad de tool calling / function calling y de razonamiento multi-paso en agentes: no disponible en la informacion proporcionada.
- Idiomas soportados: no disponible.
- Modo "thinking", audio o generacion de texto libre: no disponible.

## Casos de uso

- Enrutado de documentos: definir las categorias de destino (factura, contrato, informe, reclamacion) y dejar que el modelo devuelva la clase seleccionada con su distribucion de probabilidad, lo que permite fijar un umbral de confianza y derivar a revision humana los casos ambiguos.
- Anotacion visual automatizada: generar cajas delimitadoras y puntos clave (por ejemplo, `right_hip_x` y `right_hip_y`) sobre imagenes para preetiquetar datasets de vision por computador antes de la revision humana.
- Extraccion de magnitudes de un enunciado: dado un problema numerico y un rango definido con sus unidades, obtener el valor estimado (el ejemplo de la model card devuelve 70 litros para un deposito de 200 litros al 35%), util para pipelines de evaluacion y scoring.
- Clasificacion de intenciones en asistentes conversacionales: declarar el conjunto cerrado de intenciones y obtener la etiqueta seleccionada con probabilidades, evitando que el sistema invente una intencion no contemplada.
- Validacion de flujos de trabajo con decisiones acopladas: en lugar de elegir departamento y accion por separado, enumerar los pares validos y dejar que el modelo puntue los registros completos, garantizando que nunca se devuelva una combinacion prohibida.
- Puntuacion y priorizacion de colas de trabajo: usar el modo de rango numerico para producir una estimacion acotada (riesgo, prioridad, similitud) que alimente un sistema de ordenacion, con la ventaja de que el valor siempre cae dentro de los limites declarados.
- Control de calidad de catalogos: clasificar descripciones o imagenes de producto en una taxonomia propia definida por el usuario, con probabilidades por clase para auditar la confianza del etiquetado.
- Preprocesado de datos para entrenamiento: usar el modelo como etiquetador automatico de grandes volumenes de imagenes o textos, aprovechando la ventana de 256K tokens para procesar lotes largos en una sola peticion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de tareas de deteccion o clasificacion, y la busqueda web no aporta evaluaciones independientes. El unico dato cuantitativo verificable es el ejemplo cualitativo de la model card, que devuelve 70 como valor mas probable para el 35% de 200 litros.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio pesa 70,3 GB y la model card indica que se necesita memoria suficiente para el modelo en BF16, lo que situa el minimo practico en torno a 80 GB de VRAM para backbone y adaptador, sin contar la cache KV.
- GPU recomendadas: la model card menciona hardware NVIDIA sin concretar modelos. Por capacidad de memoria, el despliegue encaja en H100 80 GB, A100 80 GB o H200; con contexto largo (hasta 262 144 tokens) la cache KV crece de forma significativa y hace recomendable el despliegue multi-GPU.
- GPU de consumo: no cabe en GPUs de consumo. Una RTX 4090 con 24 GB no puede alojar el modelo en BF16 y no se ofrecen pesos cuantizados en la informacion disponible.
- Opciones de despliegue: servidor propio incluido en la release, arrancado con uvicorn (`python3 -m uvicorn gpc1_server.api:app`) y exponiendo `/v1/chat/completions` con autenticacion por clave. La descarga se realiza con huggingface-hub >= 1.7, < 2 y el paquete incluye un script de verificacion (`download.py verify`). Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GPC-1 | Backbone de 35B (nomenclatura del base) + adaptador LoRA | 262 144 tokens | Predicciones tipadas: clases, numeros, coordenadas, registros conjuntos | Apache-2.0 | HuggingFace, demo en Space, servidor propio |
| Qwen3.5-35B-A3B (modelo base) | 35B totales segun nomenclatura; activos no disponibles | no disponible | Generacion de texto libre | no disponible | HuggingFace (referenciado como base) |
| Clasificadores multimodales comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas. La diferencia funcional frente al modelo base es el modo de salida: GPC-1 restringe el espacio de respuesta a un esquema declarado, mientras que Qwen3.5-35B-A3B genera texto libre.

## Limitaciones y advertencias

- Riesgo de alucinacion: el puntuado ligado a esquema acota el espacio de salida a las opciones declaradas, pero no elimina el error de juicio del modelo dentro de ese espacio; una clase o un valor pueden ser incorrectos aunque sean formalmente validos.
- Resolucion finita: las salidas numericas usan 101 posiciones equiespaciadas, por lo que la precision esta limitada por la amplitud del rango definido. En rangos anchos, el error maximo por posicion puede ser considerable.
- Las coordenadas de pose se devuelven como estimaciones independientes y no se impone la coherencia de un esqueleto completo, por lo que pueden aparecer combinaciones anatomicamente inconsistentes.
- El puntuado conjunto esta acotado por los registros que el usuario enumere; si la enumeracion es incompleta, el modelo no puede devolver la respuesta correcta.
- Idiomas soportados: no disponible. No hay garantia documentada de comportamiento multilingue.
- Requisitos de hardware restrictivos: solo hardware NVIDIA con memoria suficiente para BF16, sin pesos cuantizados publicados, lo que excluye el despliegue en GPUs de consumo.
- Los metadatos del repositorio declaran `inference: false`, en contradiccion con las instrucciones de despliegue de la model card; conviene verificar el comportamiento real antes de integrarlo en produccion.
- Al ser un adaptador, el despliegue depende de la disponibilidad y de la licencia del modelo base Qwen3.5-35B-A3B, ademas de la licencia Apache-2.0 del adaptador.
- Adopcion muy temprana: 45 descargas y 20 likes en el momento de la consulta, sin evaluaciones independientes publicadas. La validacion comunitaria es practicamente inexistente.
- La model card no documenta sesgos conocidos, composicion del dataset de entrenamiento ni evaluaciones de seguridad.
- Nota de desambiguacion: a pesar de las siglas, no hay relacion documentada entre este modelo y la clasificacion GPC (Global Product Classification) de GS1; los resultados de busqueda sobre GS1 GPC Predictor corresponden a un producto distinto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/harshatheg/GPC-1
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/harshatheg/GPC-1-Demo
- Guia de API: https://huggingface.co/harshatheg/GPC-1/blob/main/API.md
- Guia de descarga: https://huggingface.co/harshatheg/GPC-1/blob/main/docs/DOWNLOADS.md
- Model card extendida: https://huggingface.co/harshatheg/GPC-1/blob/main/MODEL_CARD.md
- Demo local: https://huggingface.co/harshatheg/GPC-1/tree/main/demo
- Perfil del autor: https://huggingface.co/harshatheg
