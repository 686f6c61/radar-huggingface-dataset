# Lottolabs/Qwen3.8-27B-TT-Mixed-BFP4-BFP8-P150-tt-model

## Resumen

Qwen3.8-27B-TT-Mixed-BFP4-BFP8-P150-tt-model es un paquete de despliegue comunitario publicado por Lottolabs que empaqueta el modelo Qwen3.8-27B (27 000 millones de parametros, licencia Apache-2.0) en un formato cuantizado especifico para el acelerador Tenstorrent Blackhole p150. No se trata de un modelo nuevo entrenado desde cero, sino de una distribucion derivada del checkpoint oficial de Qwen (revision 1d4bf0f2) en la que las matrices MLP se cuantizan a BFP4 con GPTQ y el resto de capas lineales a BFP8, acompanada de un runtime propio sobre tt-metal y de un plugin de vLLM que expone una API compatible con OpenAI.

El modelo base es un transformer hibrido que combina Gated DeltaNet (atencion lineal con estado recurrente) y capas de atencion con compuerta, con entrada multimodal de imagen y video. El paquete incluye ademas un drafter de decodificacion especulativa DFlash2 (z-lab/Qwen3.8-27B-DFlash2, Apache-2.0) y un tower de vision en BFP8, todo orquestado mediante perfiles de servicio predefinidos que abarcan desde un usuario unico con 8 192 tokens de contexto hasta 16 usuarios concurrentes o un unico usuario con 131 072 tokens.

Su relevancia es acotada pero clara: demuestra que un modelo de 27B con vision y contexto largo puede servirse en hardware no-GPU (un solo p150) con cuantizacion mixta de 4 y 8 bits, decodificacion especulativa y cache de prefijos exacta. Es un artefacto de infraestructura, no un checkpoint generalista: solo tiene sentido si se dispone de hardware Tenstorrent p150.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: Gated DeltaNet + capas de atencion con compuerta (base Qwen3.8-27B) |
| Parametros totales | 27 000 millones (modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131 072 tokens (perfil 128k); 8 192 tokens en perfiles 8k |
| Tipos de cuantizacion | GPTQ BFP4 para matrices MLP; BFP8 para el resto de capas lineales; KV cache en BF16 o BFP8 segun perfil; tower de vision en BFP8 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | Pesos propietarios del runtime tt-metal (checkpoint/, dflash-draft/, vision/) descargados via tt-cli; no se indica safetensors ni GGUF |
| Hardware objetivo | Tenstorrent Blackhole p150 (un unico dispositivo) |
| Tamano del repo | 2,4 GB |
| Decodificacion especulativa | DFlash2 block-8 con drafter z-lab/Qwen3.8-27B-DFlash2, o MTP-1, o sin especulacion |
| Servidor | vLLM con API compatible con OpenAI en puerto 20000 |
| Usuarios concurrentes | 1 a 16 segun perfil |
| Fecha de publicacion | 24 de noviembre de 2026 |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura hibrida en la que las capas de atencion tradicionales con compuerta se intercalan con capas Gated DeltaNet, un mecanismo de atencion lineal con estado recurrente que reduce el coste de memoria y computo en secuencias largas. Esta combinacion permite sostener una ventana de 131 072 tokens con un pool de KV cache manejable, que en los perfiles de mayor concurrencia se comprime a BFP8 (131 072 tokens de pool compartido para 16 usuarios). El modelo acepta entradas de imagen y video a traves de un tower de vision que en este paquete se ejecuta cuantizado a BFP8.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens vistos ni las etapas de alineacion (RLHF/DPO) del modelo base en la informacion proporcionada. Lo que si documenta el paquete es la capa de optimizacion de inferencia: kernels GDN fusionados en tt-metal, decodificacion trazada (traced decode), muestreo exacto en dispositivo, cache de prefijos exacta y rondas de verificacion compartidas de DFlash2 para peticiones greedy y muestreadas en dispositivo cuando hay varios usuarios. El drafter DFlash2 se incluye byte a byte identico al publicado por z-lab. La cuantizacion GPTQ a BFP4 de las MLP y BFP8 del resto de lineales es una transformacion post-entrenamiento aplicada por Lottolabs, no un reentrenamiento.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Generacion y comprension de codigo.
- Tool calling y function calling a traves de la API compatible con OpenAI de vLLM.
- Comprension de imagenes (image-text-to-text) y de video.
- Contexto largo de hasta 131 072 tokens en el perfil 128k.
- Decodificacion especulativa con DFlash2 (bloque de 8) o MTP-1 para reducir latencia.
- Cache de prefijos exacta para reutilizar contexto entre peticiones.
- Servicio concurrente de hasta 16 usuarios con rondas de verificacion compartidas.
- Muestreo exacto en dispositivo (sin depender de muestreo aproximado en host).
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de codigo en estacion de trabajo con acelerador Tenstorrent: el modelo puede mantener conversaciones multi-turno sobre un repositorio completo gracias a los 131 072 tokens del perfil 128k, con tool calling para leer ficheros o ejecutar comandos a traves de la API OpenAI.
- Analisis de documentos largos con imagenes intercaladas: informes, papers o contratos con figuras y tablas se procesan en una sola pasada combinando el tower de vision BFP8 y el contexto de 128k, sin trocear el documento.
- Transcripcion y resumen de video: el soporte de entrada de video permite generar descripciones, resumenes por capitulos o busquedas semantica sobre grabaciones, adecuado para archivos de formacion o reuniones.
- Servicio interno de chat para un equipo pequeno: el perfil 8k-users16 admite hasta 16 usuarios concurrentes con 8 192 tokens cada uno sobre un pool BFP8 de 131 072 tokens, lo que encaja en un despliegue de oficina o laboratorio con un solo p150.
- Evaluacion de modelos multimodales en hardware no-GPU: investigadores que quieran medir latencia, throughput y calidad de un 27B cuantizado en Blackhole pueden usar los perfiles 8k-off y 128k-off como linea base no especulativa frente a DFlash2 y MTP.
- Pipeline de atencion al cliente con contexto persistente: la cache de prefijos exacta permite reutilizar el historial de conversacion entre turnos, reduciendo el coste de reprocesar el prompt en cada peticion.
- Prototipado de agentes multi-paso: la combinacion de tool calling, contexto largo y decodificacion especulativa permite cadenas de razonamiento con varias llamadas a herramientas manteniendo baja latencia por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Acelerador: un unico Tenstorrent Blackhole p150. No es ejecutable en GPU convencional ni en CPU con este paquete.
- Almacenamiento: aproximadamente 27 GB en la cache de Hugging Face para checkpoint/, dflash-draft/ y vision/, mas unos 23 GB de cache de tensores convertidos por cada modo de decodificacion (DFlash2, MTP, no especulativo), generados en el primer arranque de cada modo.
- Memoria del dispositivo: los perfiles determinan el pool de KV cache; 8k-users8 y 8k-users16 usan BFP8 con pools de 65 536 y 131 072 tokens respectivamente, y 128k usa BFP8 con 131 072 tokens.
- Software: Tenstorrent CLI (`uv tool install tenstorrent`), Docker, y alternativamente tt-model directamente. El primer arranque compila kernels JIT para el dispositivo y tarda varios minutos.
- Despliegue: `tt serve Lottolabs/Qwen3.8-27B-TT-Mixed-BFP4-BFP8-P150-tt-model` o `tt-model serve ...`; el servidor escucha en el puerto 20000 (o el siguiente libre) con API compatible con OpenAI.
- Perfiles disponibles: 8k, 8k-mtp, 8k-off, 8k-noprefix, 8k-users4, 8k-users8, 8k-users16, 128k, 128k-mtp, 128k-off, 128k-users4, 128k-users8, 128k-users16.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Hardware | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Lottolabs/Qwen3.8-27B-TT-Mixed-BFP4-BFP8-P150-tt-model | 27B | 131 072 | Tenstorrent p150 | BFP4/BFP8 mixta | Apache-2.0 | Hugging Face (paquete comunitario) |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible | GPU convencional | BF16 y otras del ecosistema | Apache-2.0 | Hugging Face (oficial) |
| Lottolabs/Qwen3.8-27B-TT-Mixed-BFP4-BFP8-P150 | 27B | 131 072 | Tenstorrent p150 | BFP4/BFP8 mixta | Apache-2.0 | Hugging Face (pesos de la release) |
| z-lab/Qwen3.8-27B-DFlash2 | drafter (tamano no disponible) | no disponible | GPU / integrable | no disponible | Apache-2.0 | Hugging Face |

La comparativa relevante es frente al checkpoint oficial de Qwen y a los pesos de la release de Lottolabs: este paquete anade el runtime, los perfiles de servicio y el drafter, pero no modifica el modelo mas alla de la cuantizacion. No se dispone de datos de rendimiento comparado con alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia total de hardware Tenstorrent p150: no es desplegable en GPU NVIDIA, AMD ni en CPU con este paquete.
- La cuantizacion GPTQ a BFP4 de las MLP y BFP8 del resto de lineales puede degradar la calidad respecto al modelo base en BF16; no se publican evaluaciones de la perdida de calidad.
- El paquete es una publicacion comunitaria de Lottolabs, no una release oficial de Qwen, z-lab ni Tenstorrent; el soporte y las garantias de mantenimiento dependen del autor.
- El primer arranque requiere compilacion JIT de kernels y conversion de tensores (varios minutos y unos 23 GB adicionales por modo de decodificacion).
- Los perfiles con mayor concurrencia (8k-users16, 128k-users4/8/16) desactivan la decodificacion especulativa o comparten el pool de KV, lo que afecta a la latencia por peticion.
- El modelo puede alucinar, como cualquier LLM; no se documentan evaluaciones de fidelidad ni de sesgos en la informacion disponible.
- Idiomas soportados no documentados; conviene validar el comportamiento en castellano antes de usarlo en produccion.
- La licencia Apache-2.0 del paquete y del modelo base permite uso comercial, pero las dependencias del runtime (tt-metal, vLLM, tt-model-plugins) deben verificarse por separado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/Lottolabs/Qwen3.8-27B-TT-Mixed-BFP4-BFP8-P150-tt-model
- Pesos de la release: https://huggingface.co/Lottolabs/Qwen3.8-27B-TT-Mixed-BFP4-BFP8-P150
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Drafter DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Manifiesto de bundles: https://github.com/LottoLottoLotto/tt-model-bundles
- Fork de tt-metal: https://github.com/LottoLottoLotto/tt-metal/tree/lottolabs/qwen3.8-27b-p150
- Fork de vLLM: https://github.com/LottoLottoLotto/vllm/tree/lottolabs/qwen3.8-27b-p150
- Plugins de tt-model: https://github.com/LottoLottoLotto/tt-model-plugins/tree/lottolabs/qwen3.8-27b-p150
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Tenstorrent CLI (prerequisitos): https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md
