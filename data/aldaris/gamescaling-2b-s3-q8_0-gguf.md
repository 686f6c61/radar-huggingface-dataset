# Aldaris/GameScaling-2B-S3-Q8_0-GGUF

## Resumen

GameScaling-2B-S3 en formato GGUF Q8_0 es una cuantización del modelo multimodal THUSI-Lab/GameScaling-2B-S3, publicada por el usuario Aldaris mediante el espacio GGUF-my-repo de ggml.ai. Se trata de un modelo de 2.390.384.448 parámetros (aproximadamente 2,4 mil millones) orientado a la interacción con videojuegos: la etiqueta `image-text-to-text` indica que acepta entrada de imagen y texto, y los tags `game-agent`, `embodied-agent` y `keyboard-mouse` apuntan a un uso como agente encarnado que observa la pantalla y emite acciones de teclado y ratón.

El modelo base emplea una arquitectura derivada de Qwen (el tag `qwen3_5` sugiere una variante de la familia Qwen 3.5) y ha sido sometido a un proceso de preentrenamiento continuado (`continued-pretraining`) sobre datos de videojuegos. Esta versión concreta es únicamente una conversión de pesos a GGUF con cuantización Q8_0, pensada para su ejecución con llama.cpp en lugar de con transformers.

La relevancia de esta ficha es doble: por un lado, documenta una conversión de un modelo de agente de juego de pequeño tamaño que puede ejecutarse en hardware de consumo; por otro, advierte de que el autor de la conversión no aporta documentación técnica propia, por lo que la mayoría de especificaciones deben remitirse a la model card original del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de la familia Qwen 3.5 segun el tag `qwen3_5`; detalles exactos no disponibles |
| Parametros totales | 2.390.384.448 (2,4 mil millones) |
| Parametros activos | no disponible (no consta que sea un modelo MoE) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa `-c 2048` en llama-server, sin que ello constituya una especificacion oficial) |
| Tipos de cuantizacion | Q8_0 (esta publicacion); otras cuantizaciones del modelo base no disponibles |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (fichero `gamescaling-2b-s3-q8_0.gguf`); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de lo que indican los metadatos: un modelo multimodal de tipo image-text-to-text, con un tag que lo vincula a la familia Qwen 3.5 y con un proceso de preentrenamiento continuado sobre datos de videojuegos. El pipeline declarado (`image-text-to-text`) implica la presencia de un codificador visual acoplado a un decodificador de lenguaje, pero no se especifican el numero de capas, la dimension oculta, el mecanismo de atencion ni el codificador visual empleado.

Tampoco se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, la posible aplicacion de RLHF o DPO, ni innovaciones tecnicas concretas como decodificacion especulativa o atencion lineal. La model card de esta publicacion se limita a describir el proceso de conversion a GGUF con llama.cpp y a ofrecer instrucciones de uso; toda la documentacion adicional debe consultarse en la model card del modelo base THUSI-Lab/GameScaling-2B-S3, que no forma parte de la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento multimodal: al declararse como `image-text-to-text`, el modelo puede procesar imagenes junto con instrucciones de texto, lo que en el contexto de videojuegos corresponde a la observacion de fotogramas de pantalla.
- Agente encarnado en entornos de juego: los tags `game-agent`, `embodied-agent` y `keyboard-mouse` indican que el modelo esta entrenado para emitir acciones de teclado y raton a partir de la observacion visual.
- Preentrenamiento continuado sobre datos de videojuegos: el tag `continued-pretraining` sugiere especializacion en dominios de juego frente a un modelo generalista de partida.
- Ejecucion local mediante llama.cpp: la cuantizacion Q8_0 permite inferencia con el binario `llama-cli` o `llama-server`.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Soporte de tool calling, function calling, agentes multi-paso, modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Agente automatizado de videojuegos en local: el modelo puede recibir capturas de pantalla del juego y generar secuencias de acciones de teclado y raton, ejecutandose con llama.cpp en una maquina de escritorio sin necesidad de GPU de datacenter. Es adecuado por su tamano reducido (2,4 mil millones de parametros) y su especializacion declarada en `keyboard-mouse`.
- Investigacion en agentes encarnados: sirve como banco de pruebas de bajo coste para experimentos de aprendizaje por imitacion o evaluacion de politicas de agente en entornos de juego, ya que puede desplegarse en un solo equipo y con cuantizacion Q8_0.
- Prototipado de asistentes que interpretan la pantalla: al ser image-text-to-text, puede emplearse para generar descripciones o decisiones a partir de capturas, en un pipeline de vision-lenguaje-accion.
- Evaluacion comparativa de cuantizaciones: al existir el modelo base en safetensors y esta version en GGUF Q8_0, permite medir la degradacion de calidad entre precision completa y cuantizacion de 8 bits en tareas de percepcion de juego.
- Despliegue en entornos con recursos limitados: la cuantizacion Q8_0 y el formato GGUF permiten ejecutar el modelo en CPU o en GPU de consumo, lo que facilita demos y pruebas de concepto sin infraestructura dedicada.
- Generacion de datos sinteticos de interaccion: el modelo puede utilizarse para producir trayectorias sinteticas (observacion, accion) que alimenten posteriores entrenamientos o evaluaciones de otros agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,39 mil millones de parametros en Q8_0 (aproximadamente 8 bits por peso), el fichero de pesos ronda los 2,5-2,6 GB, coherente con el tamano del repo de 2,6 GB. A ello hay que sumar la memoria del codificador visual y la cache KV, por lo que se estima un consumo total en torno a 3-4 GB, dependiendo de la longitud de contexto.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM libre, como una RTX 3060, RTX 4060 o superiores; tambien cabe en A100 o H100, aunque estarian sobredimensionadas para este tamano.
- Compatibilidad con GPU de consumo: si, el modelo cabe en practicamente cualquier GPU de consumo moderna e incluso puede ejecutarse en CPU, dado su reducido tamano.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`) segun la model card; al ser un GGUF estandar, tambien seria compatible con otros runners basados en llama.cpp, si bien la informacion proporcionada solo documenta explicitamente llama.cpp.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GameScaling-2B-S3 (Q8_0 GGUF, esta ficha) | 2,39 mil millones | no disponible | image-text-to-text | apache-2.0 | GGUF en Hugging Face |
| THUSI-Lab/GameScaling-2B-S3 (modelo base) | 2,39 mil millones | no disponible | image-text-to-text | apache-2.0 | safetensors en Hugging Face |
| Alternativas de agente de juego de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria (agentes encarnados para videojuegos con entrada visual) en la documentacion proporcionada, por lo que la comparativa se limita al propio modelo base y a la ausencia de datos sobre alternativas.

## Limitaciones y advertencias

- Documentacion tecnica escasa: esta publicacion es una conversion automatica a GGUF; no incluye informacion sobre arquitectura, datos de entrenamiento ni evaluacion, por lo que su uso en produccion exige consultar la model card del modelo base.
- Riesgo de alucinacion: al ser un modelo de lenguaje de 2,4 mil millones de parametros, es previsible una mayor tasa de errores y respuestas incoherentes que en modelos de mayor tamano; no se han publicado evaluaciones que lo cuantifiquen.
- Limitacion idiomatica: solo declara soporte de ingles, por lo que su uso en castellano no esta garantizado.
- Sesgos conocidos: no disponible; no se documentan analisis de sesgo en la informacion proporcionada.
- Ambito de uso restringido: el modelo esta especializado en interaccion con videojuegos; su rendimiento en tareas generales de texto o vision fuera de ese dominio es incierto.
- Licencia: apache-2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base y de los datos de entrenamiento originales antes de desplegarlo en produccion.
- Cuantizacion: Q8_0 introduce una perdida de precision respecto a los pesos originales; no se han publicado mediciones de la degradacion resultante.
- Longitud de contexto: no documentada; el ejemplo de la model card usa 2048 tokens, valor que no debe interpretarse como limite oficial.

## Enlaces

- Repositorio de esta cuantizacion: https://huggingface.co/Aldaris/GameScaling-2B-S3-Q8_0-GGUF
- Modelo base: https://huggingface.co/THUSI-Lab/GameScaling-2B-S3
- Espacio de conversion GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
