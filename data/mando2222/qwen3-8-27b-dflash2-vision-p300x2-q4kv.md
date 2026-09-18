# mando2222/qwen3.8-27b-dflash2-vision-p300x2-q4kv

## Resumen

Este repositorio no es un modelo entrenado desde cero, sino una instantánea inmutable (etiquetada `vision-baseline-v1`) del modelo **Qwen/Qwen3.8-27B** empaquetada para ejecutarse sobre hardware Tenstorrent **P300x2** (cuatro chips Blackhole en paralelo tensorial de 4 vías). El autor, `mando2222`, publica el artefacto con `tt-model-manager` 0.1.0 (esquema de manifiesto 5.1) para poder reproducir o bisecar el punto de partida antes de empezar a desarrollar perfiles unificados. Conserva el comportamiento de texto revisado de forma independiente, la decodificación especulativa DFlash2 sin pérdida, la caché KV en Q4 y el modo de una sola imagen por petición.

El interés práctico está en que documenta un stack de inferencia completo y medido sobre aceleradores que no son GPU: los perfiles de servicio `batch8-dflash2`, `single-user-dflash2` y `single-user-vision` exponen una API compatible con OpenAI en el puerto 20000, con datos de throughput y latencia publicados para ventanas de entrada de entre 128 y 131.072 tokens. El repositorio pesa solo 2,0 GB porque **no contiene los pesos**: estos se descargan aparte desde `Qwen/Qwen3.8-27B` y `incoai/Qwen3.8-27B-DFlash2` durante el `pull`.

Es relevante ahora como referencia de rendimiento de decodificación especulativa en silicio Tenstorrent (aceleraciones de 1,9× a 3,3× por usuario frente a decodificación plana según el escenario de código) y como ejemplo de empaquetado reproducible de un modelo multimodal en un contenedor de inferencia. Con 0 descargas y 0 likes, su adopción comunitaria es nula en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal: decodificador de texto Qwen3.8 mas torre de vision Qwen3.5; ejecucion en 4 chips Tenstorrent Blackhole con paralelismo tensorial de 4 vias; el detalle interno del decodificador no esta disponible |
| Parametros totales | No disponible (el identificador del modelo indica 27B; el autor no publica el recuento exacto de parametros) |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible; los benchmarks publicados cubren entradas de hasta 131.072 tokens |
| Tipos de cuantizacion | Cache KV en Q4 (sufijo `q4kv` del identificador); cuantizacion de pesos no disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No incluidos en el repositorio (2,0 GB). Los checkpoints se descargan en formato nativo desde HuggingFace (`Qwen/Qwen3.8-27B` en la revision `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` e `incoai/Qwen3.8-27B-DFlash2` en `dedf8df68adfb1afeaf7b7480c0a0243108177b4`). El artefacto publicado es un contenedor tt-model con manifiesto en esquema 5.1 |
| Hardware objetivo | Tenstorrent P300x2 (4 chips Blackhole, paralelismo tensorial de 4 vias) |
| Perfiles de servicio | `batch8-dflash2` (por defecto, hasta 8 peticiones concurrentes), `single-user-dflash2` (una peticion de texto), `single-user-vision` (una imagen por peticion) |
| Fecha de publicacion | 2026-09-17 (segun metadatos del repositorio) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer multimodal de la familia Qwen3.8 con 27B de parametros nominales, que combina un decodificador de texto con una torre de vision identificada en la model card como **Qwen3.5 vision tower**. Sobre esa base, este repositorio aplica dos componentes de inferencia: **DFlash2**, un esquema de decodificacion especulativa descrito por el autor como sin perdida ("lossless"), con 7 borradores por paso cuando hay entre 1 y 4 usuarios activos y 3 borradores por paso cuando hay entre 5 y 8; y una **cache KV cuantizada a Q4**. El modelo se reparte en 4 chips Blackhole con paralelismo tensorial de 4 vias. No se publica informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO: esos datos pertenecen al modelo original y no se detallan en este repositorio.

La innovacion destacable es de despliegue, no de entrenamiento. El empaquetado se realiza con `tt-model-manager` 0.1.0 y produce un contenedor reproducible con perfiles seleccionables en tiempo de arranque: los perfiles DFlash son solo texto, mientras que `single-user-vision` acepta una imagen por peticion y desactiva la especulacion. El autor indica que el cambio de numero de borradores entre regimenes de concurrencia ocurre en tiempo de ejecucion y no altera la salida. Ademas, el propio autor remite a `changh95/qwen3.8-27b-p300x2` para muestreo con `temperature`/`top_p` reales o para mas de 8 usuarios, lo que delimita el alcance de este artefacto.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`, puerto 20000, identificador de modelo `Qwen/Qwen3.8-27B`).
- Comprension de una imagen por peticion en el perfil `single-user-vision`, con torre de vision Qwen3.5.
- Modo de razonamiento con "thinking": el perfil servido lo activa por defecto y puede desactivarse pasando `"chat_template_kwargs": {"enable_thinking": false}`.
- Generacion de codigo, evaluada con SPEED-Bench (`coding`, 80 prompts) en configuraciones con y sin thinking.
- Procesamiento de contexto largo: los benchmarks alcanzan entradas de 131.072 tokens en el perfil `single-user-dflash2`.
- Servicio concurrente de hasta 8 usuarios en el perfil `batch8-dflash2`.
- Decodificacion especulativa sin perdida (DFlash2) sobre los perfiles de texto.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico multi-paso en la informacion disponible.
- No se documentan idiomas soportados distintos de los que herede el modelo base.

## Casos de uso

- **Servicio de chat autohospedado en hardware no GPU**: desplegar el contenedor con `tt-model serve` sobre un P300x2 y exponer la API compatible con OpenAI en el puerto 20000, de modo que aplicaciones existentes que apunten a `Qwen/Qwen3.8-27B` funcionen sin cambios. Es adecuado porque el artefacto ya incluye el servidor y los tres perfiles de carga.
- **Reproduccion y biseccion de regresiones**: usar la etiqueta inmutable `vision-baseline-v1` como punto de comparacion fijo antes de introducir cambios en perfiles unificados, gracias a que el autor la declara explicita y deliberadamente inmutable.
- **Generacion de codigo en lote**: ejecutar SPEED-Bench o pipelines internos de generacion de codigo con el perfil `batch8-dflash2`, que ofrece hasta 397 t/s agregados en el escenario con thinking activado y 8 usuarios. Los numeros publicados permiten dimensionar la capacidad necesaria.
- **Asistencia sobre documentos largos**: analizar entradas de hasta 131.072 tokens (por ejemplo, expedientes completos o bases de codigo extensas) con `single-user-dflash2`; el coste de TTFT esta medido: 26.055 ms a 131.072 tokens de entrada frente a 134 ms a 128 tokens.
- **Interaccion de un unico usuario con maxima velocidad de decodificacion**: usar `single-user-dflash2` para obtener la mayor tasa por usuario, con 62,7 t/s/u a 128 tokens de entrada y 95 t/s/u (119 t/s/u por usuario) en la carga de codigo con thinking desactivado.
- **Descripcion o analisis de imagenes puntual**: emplear `single-user-vision` para enviar una imagen por peticion (clasificacion, descripcion o extraccion de informacion) asumiendo que se desactiva la especulacion DFlash.
- **Evaluacion comparativa de aceleradores**: utilizar la rejilla de benchmarks publicada (combinaciones de ISL 128 a 131.072 y OSL 128 a 1.024) como linea base frente a otros backends sobre el mismo modelo.

## Benchmarks y rendimiento

Los unicos datos publicados son de throughput y latencia del servidor de inferencia (`tt-inference-server --workflow benchmarks`, rejilla estandar P300X2 con prompts aleatorios de exactamente ISL tokens, `ignore_eos`, greedy y streaming sobre un unico P300x2). **No se han publicado resultados de benchmarks de calidad** (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

Perfil `batch8-dflash2` (por defecto), tokens de salida por segundo agregados y por usuario entre parentesis:

| ISL | OSL | 1 usuario | 2 usuarios | 4 usuarios | 8 usuarios | Plano, 1 usuario |
|---|---|---|---|---|---|---|
| 128 | 128 | 56,2 (56,2) | 100,7 (53,1) | 182,2 (46,2) | 271,5 (34,9) | 32,3 |
| 1.024 | 128 | 53,3 (53,3) | 98,4 (49,9) | 158,8 (42,3) | 243,6 (31,3) | 31,3 |
| 4.096 | 128 | 45,8 (45,8) | 76,6 (38,8) | 103,5 (26,9) | 135,0 (17,1) | 28,8 |
| 16.384 | 128 | 26,0 (26,0) | 33,8 (17,1) | 40,9 (10,3) | 45,2 (5,7) | 21,2 |
| 65.536 | 128 | 9,7 (9,7) | 10,3 (5,2) | 10,7 (2,7) | 9,8 (1,2) | 9,2 |
| 131.072 | 128 | 4,4 (4,4) | 4,6 (2,3) | 4,7 (1,2) | No aplica | 4,6 |
| 128 | 1.024 | 51,4 (51,4) | 86,7 (43,9) | 168,1 (49,1) | 297,3 (41,8) | 32,6 |
| 8.192 | 1.024 | 57,6 (57,6) | 63,3 (33,3) | 125,5 (36,3) | 198,5 (30,1) | 31,1 |
| 10.000 | 1.024 | 58,5 (58,5) | 64,5 (33,9) | 102,1 (33,5) | 185,8 (26,3) | 30,9 |

Perfil `single-user-dflash2`, un unico usuario (TTFT = tiempo hasta el primer token, TPOT = tiempo por token de salida):

| ISL | OSL | TTFT (ms) | TPOT (ms) | t/s/u | Plano t/s/u |
|---|---|---|---|---|---|
| 128 | 128 | 134 | 15,0 | 62,7 | 32,3 |
| 1.024 | 128 | 183 | 14,2 | 64,3 | 31,3 |
| 4.096 | 128 | 594 | 17,5 | 45,4 | 28,8 |
| 16.384 | 128 | 2.460 | 17,0 | 27,7 | 21,2 |
| 65.536 | 128 | 11.163 | 20,8 | 9,3 | 9,2 |
| 131.072 | 128 | 26.055 | 12,1 | 4,6 | 4,6 |
| 128 | 1.024 | 135 | 12,1 | 82,1 | 32,6 |
| 10.000 | 1.024 | 1.515 | 14,3 | 63,6 | 30,9 |

Carga de codigo (SPEED-Bench `coding`, 80 prompts, greedy, respuestas terminadas en EOS); t/s agregados y velocidad por usuario entre parentesis:

| Thinking | Usuarios | `batch8-dflash2` | `single-user-dflash2` | Plano | Aceleracion |
|---|---|---|---|---|---|
| off | 1 | 84 (111) | 95 (119) | 35 (36) | 3,3× |
| off | 8 | 233 (60) | No aplica | 111 (23) | 2,6× |
| on | 1 | 73 (77) | 80 (83) | No disponible | No disponible |
| on | 8 | 397 (55) | No aplica | 218 (29) | 1,9× |

El autor advierte de que una celda con guion indica que el pool de cache KV no admite tantos usuarios a esa longitud y el flujo de trabajo omite el punto.

## Requisitos de hardware

- **Hardware obligatorio**: Tenstorrent P300x2, es decir, 4 chips Blackhole con paralelismo tensorial de 4 vias. El artefacto es especifico de esa topologia; no se documenta soporte para GPU NVIDIA, AMD ni para otras configuraciones Tenstorrent.
- **VRAM de GPU**: no aplica ni esta disponible. El modelo se ejecuta sobre memoria de los chips Blackhole, no sobre memoria de GPU.
- **GPU de consumo**: no es viable con este paquete. No hay ruta de despliegue CUDA documentada en la informacion disponible.
- **Almacenamiento y red**: el repositorio pesa 2,0 GB, pero los pesos se descargan aparte desde `Qwen/Qwen3.8-27B` e `incoai/Qwen3.8-27B-DFlash2` en la cache de HuggingFace durante `tt-model pull --with-weights`. Hay que prever espacio adicional para la imagen Docker y ambos checkpoints.
- **Despliegue**: CLI `tt-model` (`pull`, `serve`, `profiles`), con `tt-model-manager` 0.1.0. El servidor es compatible con OpenAI y escucha en el puerto 20000 o en el siguiente puerto libre.
- **Arranque en frio**: la primera ejecucion compila kernels para el dispositivo y tarda varios minutos; el servidor esta listo cuando registra `Application startup complete`.
- **Latencia medida**: TTFT de 134 ms con 128 tokens de entrada y 26.055 ms con 131.072 tokens (perfil `single-user-dflash2`); TPOT entre 12,1 y 21,2 ms en esa misma tabla.
- **Throughput medido**: de 56,2 t/s por usuario en la configuracion mas ligera hasta 397 t/s agregados con 8 usuarios y thinking activado en la carga de codigo.
- **Alternativas de runtime**: no se documentan vLLM estandar, llama.cpp, Ollama ni TGI para este artefacto. La etiqueta `vllm-plugin` sugiere un plugin de vLLM especifico para Tenstorrent, pero el autor no detalla su uso.

## Comparativa con modelos similares

| Modelo / artefacto | Parametros | Contexto | Rendimiento documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mando2222/qwen3.8-27b-dflash2-vision-p300x2-q4kv` (este) | No disponible (27B nominales) | No disponible; benchmarks hasta 131.072 tokens | DFlash2 sobre P300x2: hasta 271,5 t/s agregados a 8 usuarios (ISL 128) y 397 t/s en codigo con thinking | No disponible | Publico en HuggingFace, 0 descargas |
| `changh95/qwen3.8-27b-p300x2` | No disponible | No disponible | Decodificacion plana; sirve como columna de referencia en todos los benchmarks de este repositorio (p. ej. 32,3 t/s/u a ISL 128) | No disponible | Publico en HuggingFace |
| `incoai/Qwen3.8-27B-DFlash2` | No disponible | No disponible | No disponible | No disponible | Checkpoint requerido por este artefacto; referencia fijada a la revision `dedf8df6` |
| `Qwen/Qwen3.8-27B` (modelo base) | 27B nominales | No disponible | No disponible | No disponible | Checkpoint requerido por este artefacto; referencia fijada a la revision `1d4bf0f2` |

El autor indica explicitamente que para muestreo con `temperature`/`top_p` plenos o para mas de 8 usuarios concurrentes debe usarse `changh95/qwen3.8-27b-p300x2`. Los datos de rendimiento del modelo base y del drafter DFlash2 por separado no se publican en la informacion disponible.

## Limitaciones y advertencias

- **Licencia sin especificar**: ni la model card ni los metadatos del repositorio indican licencia. No se puede asumir uso comercial permitido sin consultar la licencia del modelo base `Qwen/Qwen3.8-27B`.
- **Idiomas sin especificar**: no hay lista de idiomas soportados; cualquier afirmacion sobre cobertura multilingue seria una extrapolacion.
- **Perfiles DFlash solo texto**: la decodificacion especulativa DFlash2 no esta disponible en el perfil de vision, que ademas limita a una imagen por peticion.
- **Muestreo restringido**: en los perfiles DFlash, `temperature` y `top_p` solo afectan al primer token, y no se admiten `logprobs` ni salidas estructuradas. Esto invalida su uso para generacion con muestreo o para extraccion de JSON con garantias.
- **Limite de concurrencia**: `batch8-dflash2` admite como maximo 8 usuarios. A longitudes altas el pool de cache KV puede no dar cabida a todos los usuarios, y el flujo de benchmarks omite esas celdas.
- **Naturaleza inmutable y de linea base**: el autor declara la etiqueta como inmutable y pensada para reproducir o bisecar; no es un artefacto destinado a evolucionar, sino un punto de partida congelado.
- **Pesos fuera del repositorio**: el contenedor no incluye los pesos; un `pull` sin `--with-weights` deja el servicio inoperativo. La reproducibilidad depende de dos revisiones concretas de repositorios de terceros.
- **Arranque lento**: la compilacion de kernels en el primer arranque tarda varios minutos, lo que complica el escalado elastico y los despliegues con arranques frecuentes.
- **Riesgo de alucinacion**: no se documenta ninguna evaluacion de fidelidad, veracidad ni tasa de alucinacion para este artefacto.
- **Sesgos**: no se publica ninguna evaluacion de sesgo, toxicidad o seguridad; se heredan los del modelo base, no documentados aqui.
- **Adopcion nula**: con 0 descargas y 0 likes, no hay evidencia comunitaria de funcionamiento en entornos distintos del del autor.
- **Fecha de publicacion futura**: los metadatos indican creacion el 2026-09-17, posterior a la fecha habitual de consulta; conviene verificar la coherencia temporal del repositorio antes de integrarlo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mando2222/qwen3.8-27b-dflash2-vision-p300x2-q4kv
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint del drafter DFlash2: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Alternativa de decodificacion plana citada por el autor: https://huggingface.co/changh95/qwen3.8-27b-p300x2
- Herramienta de empaquetado: https://github.com/tenstorrent/tt-model-manager
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo; los resultados devueltos corresponden a paginas institucionales sin relacion con el artefacto.
