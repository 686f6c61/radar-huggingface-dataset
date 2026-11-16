# foxAIengineer/Qwen3.8-27B-abliterated-colibri-i8

## Resumen

Qwen3.8-27B-abliterated-colibri-i8 es un contenedor de pesos en formato f16 de un Qwen3.8-27B sometido a abliteration (eliminacion de la direccion de rechazo), empaquetado especificamente para el motor qwen36 de colibri. No es un checkpoint oficial ni el modelo original: los pesos son de Qwen, modificados por el autor del repositorio de abliteration de origen, y este repositorio unicamente cambia como se almacenan. No carga en transformers ni en vLLM; solo funciona con el motor qwen36 de colibri.

El modelo subyacente es denso, no un mixture of experts: 64 capas, hidden size 5120, anchura de MLP 17408 y vocabulario de 248320 tokens. Tres de cada cuatro capas son Gated DeltaNet (atencion lineal) y cada cuarta capa es atencion completa. El checkpoint incluye ademas una torre de vision de 27 capas, por lo que acepta imagenes como entrada.

La relevancia de esta publicacion es acotada y experimental: sirve para investigacion sobre inferencia local, red team y seguridad en entornos controlados, escritura creativa y generacion de datos sinteticos. No esta pensada para uso de consumo, no se ha evaluado con benchmarks y la velocidad medida en CPU es muy baja (1,6 a 2,9 tok/s), lo que refleja las limitaciones de ejecutar un modelo denso de este tamano sin aceleracion por GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion hibrida: 3 de cada 4 capas Gated DeltaNet (atencion lineal) y cada 4 capas atencion completa; incluye torre de vision de 27 capas |
| Parametros totales | no disponible (el nombre indica 27B; el autor no publica el recuento exacto) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos almacenados en f16; cuantizacion en tiempo de carga por el motor: int8 por defecto (unos 29 GB residentes), int4 en bloques de 64 con una escala f32 por bloque (unos 18-19 GB estimados) y sin cuantizacion con COLI_DENSE_BITS=16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors f16 (66 archivos, unos 51 GiB en disco); no compatible con transformers ni vLLM, solo con el motor qwen36 de colibri |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de 64 capas con hidden size 5120, MLP de anchura 17408 y vocabulario de 248320 tokens. La innovacion estructural principal es la atencion hibrida: tres de cada cuatro capas usan Gated DeltaNet, un mecanismo de atencion lineal, y la cuarta capa restante emplea atencion completa. El checkpoint incorpora una torre de vision de 27 capas que habilita la entrada de imagenes. Al ser un modelo denso, colibri trata la MLP como un experto compartido sin compuerta (num_experts: 0), de modo que todos los pesos se leen de RAM en cada token y no hay streaming desde disco.

La conversion se realizo con tools/convert_qwen36.py de colibri sin cuantizacion en el momento de la conversion: el tronco (atencion, DeltaNet, MLP), los embeddings, el lm_head y la normalizacion final se almacenan en f16, al igual que la torre de vision. La cabeza MTP (multi-token prediction) se omite deliberadamente, por lo que el motor no dispone de decodificacion especulativa para este modelo. El campo ebits: 4 de qwen36_meta.json lo escribe el conversor por defecto y no tiene efecto aqui, ya que se aplica a expertos y este modelo no tiene. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el modelo original.

## Capacidades

- Generacion de texto y razonamiento general, heredados del Qwen3.8-27B original.
- Procesamiento de imagenes gracias a la torre de vision de 27 capas incluida en el checkpoint.
- Generacion de codigo y matematicas: capacidad esperable por el modelo base, aunque no verificada con benchmarks en esta publicacion.
- Comportamiento sin rechazo: la abliteration elimina la tendencia del modelo a negarse a responder, lo que cambia el perfil de respuestas en dominios sensibles.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling, function calling y agentes multi-paso: no disponible en la informacion proporcionada.
- Sin decodificacion especulativa: la cabeza MTP no se incluye en la conversion.

## Casos de uso

- Investigacion en inferencia local: el modelo permite estudiar el comportamiento de un transformer denso de gran tamano con atencion hibrida ejecutado en CPU, midiendo el impacto del ancho de banda de memoria en la velocidad de decodificacion.
- Red team y evaluacion de seguridad: al carecer de mecanismos de rechazo, es util para probar defensas, filtros y clasificadores en entornos controlados que el propio operador posee.
- Escritura creativa sin restricciones de rechazo: adecuado para experimentar con estilos y tematicas donde el modelo original declinaria responder.
- Generacion de datos sinteticos: puede producir corpus de texto para entrenamiento o evaluacion, con la advertencia de que la calidad no ha sido medida.
- Experimentacion con cuantizacion en tiempo de carga: las variables COLI_DENSE_BITS y COLI_DENSE_INT4 permiten comparar el equilibrio entre memoria residente y perplejidad en un mismo checkpoint.
- Investigacion sobre atencion lineal: la mezcla de Gated DeltaNet y atencion completa permite estudiar el comportamiento de modelos hibridos en tareas de contexto largo, aunque la longitud de contexto no esta documentada.
- Analisis de imagenes en local: la torre de vision integrada permite experimentar con entrada multimodal sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se ha ejecutado ninguna comparacion de perplejidad ni de tareas contra el Qwen3.8-27B original ni contra el checkpoint abliterated sin modificar, ni para int8 ni para int4, y que ambas configuraciones deben tratarse como no verificadas.

Las unicas mediciones publicadas son de velocidad, realizadas por el autor en un portatil, solo CPU (--gpu none) y con una unica conversacion:

| Configuracion | Memoria residente | Velocidad de generacion |
|---|---|---|
| int8 (por defecto) | unos 29 GB | 1,6 tok/s |
| int4 (COLI_DENSE_BITS=4, COLI_DENSE_INT4=lmhead,dnproj,dnout,shexp) | unos 18-19 GB (estimacion) | 2,9 tok/s |
| f16 (COLI_DENSE_BITS=16) | mas que int8 | no disponible |

## Requisitos de hardware

- Memoria residente: unos 29 GB con cuantizacion int8 por defecto; unos 18-19 GB estimados con int4 en bloques de 64; mas de 29 GB sin cuantizacion (f16).
- Almacenamiento: unos 51 GiB en disco repartidos en 66 archivos safetensors.
- GPU: no disponible. El motor se ha probado con --gpu none (solo CPU); no se documenta soporte ni rendimiento en GPU.
- GPU de consumo: no disponible. No hay datos sobre ejecucion en RTX 4090 u otras tarjetas de consumo.
- Despliegue: exclusivamente mediante el motor qwen36 de colibri (compilacion con make qwen36 y ejecucion con ./coli chat --model /ruta/al/repo --gpu none). No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Aceleracion: la opcion de cache de expertos no aplica a este modelo denso; debe dejarse --cap en 0.
- Latencia y throughput: 1,6 tok/s con int8 y 2,9 tok/s con int4 en CPU, medidos en un portatil por el autor. La velocidad esta limitada por el ancho de banda de memoria, ya que un modelo denso lee todos sus pesos en cada token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y motores | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-abliterated-colibri-i8 (este) | 27B (segun nombre) | no disponible | safetensors f16, solo colibri qwen36 | Apache 2.0 | Sin benchmarks; 1,6-2,9 tok/s en CPU |
| Qwen/Qwen3.8-27B | 27B (segun nombre) | no disponible | checkpoint original, transformers y vLLM | no disponible en la informacion | Modelo base sin abliteration ni reempaquetado |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27B (segun nombre) | no disponible | checkpoint abliterated estandar | no disponible en la informacion | Fuente de la abliteration; cargable en motores convencionales |

No se dispone de datos de rendimiento comparativo entre estas variantes; el autor no ha ejecutado evaluaciones de calidad frente al modelo original ni frente al checkpoint abliterated de origen.

## Limitaciones y advertencias

- Modelo experimental: el propio autor indica que no es apto para uso de consumo.
- Sin evaluacion de calidad: no hay benchmarks, perplejidad ni comparaciones de tareas para int8 ni int4; el rendimiento real es desconocido.
- Abliteration: elimina la tendencia a rechazar peticiones, pero no elimina errores ni hace el modelo seguro de fiabilidad. Puede producir contenido danino o inapropiado.
- Compatibilidad restringida: no carga en transformers ni en vLLM, y requiere una version de colibri con soporte para el Qwen3.8-27B denso (issue #1757 del repositorio).
- Sin decodificacion especulativa: la cabeza MTP se omite en la conversion, lo que reduce el rendimiento frente a configuraciones que la conservan.
- Velocidad muy baja en CPU: 1,6-2,9 tok/s en las mediciones del autor, insuficiente para la mayoria de aplicaciones interactivas.
- Consumo de memoria elevado: entre 18 y 29 GB de RAM residente segun la cuantizacion, sin datos sobre requisitos en GPU.
- Idiomas y contexto no documentados: se desconoce la longitud de contexto efectiva y la cobertura linguistica.
- Licencia: los pesos son de Qwen y la abliteration es del autor del repositorio de origen; las licencias de los modelos originales siguen siendo las suyas. El motor colibri es Apache 2.0. Verificar las condiciones del modelo base antes de cualquier uso comercial.
- Responsabilidad de uso: el autor declara que el usuario es responsable de lo que haga con las salidas del modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/foxAIengineer/Qwen3.8-27B-abliterated-colibri-i8
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint abliterated de origen: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Motor y conversor colibri: https://github.com/JustVugg/colibri
- Issue de soporte para Qwen3.8-27B denso en colibri: https://github.com/JustVugg/colibri/issues/1757
