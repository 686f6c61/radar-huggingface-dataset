# mando2222/laguna-s-2.1-v51

## Resumen

`mando2222/laguna-s-2.1-v51` no es un modelo de pesos en sentido estricto, sino un contenedor de despliegue publicado en Hugging Face: empaqueta el modelo `poolside/Laguna-S-2.1` (118B de parametros totales, arquitectura MoE con atencion hibrida y aproximadamente 4B de parametros activos por token) para ejecutarlo sobre 4 aceleradores Tenstorrent Blackhole en configuracion `p150x4`, con paralelismo de tensor TP=4 y de expertos EP=4 sobre `FABRIC_1D`. El stack de servicio es vLLM (rueda `vllm-0.26.0`) junto con el plugin `tenstorrent/vllm-tt-plugin`, y el empaquetado se ha realizado con `tt-model-manager` 0.1.0 (esquema de manifiesto 5.1). El repositorio ocupa 1,2 GB y no contiene los pesos: estos se descargan aparte desde el repositorio del modelo base.

El problema que resuelve es de infraestructura, no de modelado: permite levantar un servidor compatible con la API de OpenAI (puerto 20000, o el siguiente libre) sobre hardware Tenstorrent en lugar de GPU NVIDIA, mediante dos comandos (`tt-model pull --with-weights` y `tt-model serve`). El primer arranque compila kerners para el dispositivo, lo que tarda varios minutos, y el servidor esta listo cuando aparece el mensaje `Application startup complete` en el log. Los nombres de modelo servidos son `poolside/Laguna-S-2.1` y `laguna-s-2.1`.

La limitacion mas relevante es la longitud de contexto efectiva: `max_model_len` es de 8192 tokens y admite hasta 1 secuencia concurrente. El propio autor aclara que se trata de un limite del stack de servicio y no del modelo: el plugin de vLLM para Tenstorrent asigna una cache KV de atencion completa uniforme por capa, de modo que las 36 capas con ventana deslizante de 512 tokens se contabilizan como si fueran de contexto completo. Segun el calculo del autor sobre el patron de atencion real, los pesos permitirian alrededor de 1M de tokens, pero hasta que el plugin pueda asignar cache KV deslizante por capa, 8192 es lo que cabe. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atencion hibrida (36 capas con ventana deslizante de 512 tokens segun la model card); transformer con capas de atencion deslizante combinadas con atencion completa |
| Parametros totales | 118B (modelo base `poolside/Laguna-S-2.1`) |
| Parametros activos | ~4B por token |
| Longitud de contexto | 8192 tokens en este despliegue (`max_model_len`); el autor indica que el patron de atencion real de los pesos permitiria ~1M de tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repositorio no declara licencia; la del modelo base tampoco se especifica en la informacion proporcionada) |
| Formato de pesos | no disponible para este repositorio; los pesos se descargan desde `poolside/Laguna-S-2.1` a la cache de Hugging Face (no van incluidos en la imagen) |
| Tamano del repositorio | 1,2 GB (contenedor y codigo; sin pesos) |
| Hardware objetivo | 4x Tenstorrent Blackhole, malla `p150x4`, TP=4 + EP=4, `FABRIC_1D` |
| Secuencias concurrentes | hasta 1 |
| Stack de servicio | vLLM `0.26.0` + `tenstorrent/vllm-tt-plugin`; API compatible con OpenAI en el puerto 20000 |
| Empaquetado | `tt-model-manager` 0.1.0, esquema de manifiesto 5.1 |
| Fechas de publicacion | creado 2026-09-10T13:19:15Z; actualizado 2026-09-10T13:26:22Z |

## Arquitectura y entrenamiento

El modelo base es un MoE de 118B de parametros totales con aproximadamente 4B activos por token, y una arquitectura de atencion hibrida en la que conviven capas de atencion completa con 36 capas de ventana deslizante de 512 tokens. Esa combinacion es la que explica la discrepancia entre el contexto que soportaria el patron de atencion de los pesos (~1M tokens segun el autor) y los 8192 tokens que el stack de servicio puede sostener hoy: la cache KV se reserva de forma uniforme y completa por capa, penalizando las capas deslizantes. No se proporciona informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

En cuanto al entrenamiento y a la innovacion tecnica, la informacion disponible se limita al plano de despliegue. El contenedor se apoya en `tt-metal` compilado desde el commit `2d8292201660bff1ad9caf6cac556d9937f436d4` (con arbol de trabajo sucio: la imagen incluye cambios sin commitear), una rueda de vLLM construida por el autor (`vllm-0.26.0+empty-cp312-cp312-linux_x86_64.whl`) y un checkout local de `vllm-tt-plugin` cuyo commit no se ha publicado. El digest del directorio `code/` es `878a7ef65713a865` (sha256, primeros 16 digitos hexadecimales) y la construccion se realizo el 2026-09-10T13:05:11+00:00. El directorio `code/` del repositorio es, segun el autor, identico byte a byte al codigo del modelo dentro de la imagen.

## Capacidades

- Generacion de texto mediante una API compatible con OpenAI, con nombres de modelo `poolside/Laguna-S-2.1` y `laguna-s-2.1`.
- Razonamiento y generacion de codigo: presumibles dado el perfil del modelo base de 118B, pero no documentados en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas en el repositorio).
- Capacidades especiales (modo pensamiento, vision, audio): no disponible.
- Servicio de una sola secuencia concurrente, con una ventana de 8192 tokens, lo que acota de facto los flujos conversacionales multi-turno largos.
- Despliegue sobre hardware Tenstorrent Blackhole en lugar de GPU, con compilacion de kerners en el primer arranque.

## Casos de uso

- Evaluacion de viabilidad de hardware Tenstorrent: este repositorio es la via mas directa para comprobar como rinde un MoE de 118B sobre una malla `p150x4` con vLLM, comparando la experiencia operativa con un despliegue equivalente en GPU.
- Pruebas de integracion con clientes compatibles con OpenAI: permite apuntar cualquier SDK existente a `http://127.0.0.1:20000` sin cambiar codigo, util para validar contratos de API antes de migrar a produccion.
- Generacion de codigo asistida en un entorno controlado y on-premise: el modelo base es de gran tamano y el servicio no requiere GPU NVIDIA, lo que encaja en organizaciones con infraestructura Tenstorrent ya desplegada.
- Prototipado de razonamiento con MoE disperso: con ~4B parametros activos por token, el coste por token es bajo en comparacion con un denso de 118B, lo que permite experimentar con prompts de razonamiento en una sola secuencia.
- Reproducibilidad y auditoria de builds: la tabla de procedencia (commit de `tt-metal`, rueda de vLLM, digest del codigo) permite reconstruir el entorno y verificar que el codigo empaquetado coincide con el del repositorio.
- Banco de pruebas de limites de contexto en plugins de atencion: las 36 capas de ventana deslizante de 512 tokens convierten este despliegue en un caso de estudio claro sobre el coste de una cache KV uniforme frente a una por capa.
- Validacion de pipelines de empaquetado con `tt-model-manager`: sirve para verificar el flujo `pull`/`serve` y el esquema de manifiesto 5.1 en un caso real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de latencia o throughput medidos para este despliegue. Tampoco se ofrecen comparaciones numericas con el modelo base servido en otras plataformas.

## Requisitos de hardware

- Hardware objetivo: 4x Tenstorrent Blackhole en malla `p150x4`, con TP=4 + EP=4 y `FABRIC_1D`.
- VRAM estimada: no disponible (el despliegue no usa GPU ni VRAM convencional; se ejecuta sobre aceleradores Tenstorrent).
- GPU recomendadas: no aplica; no se documenta ningun camino de ejecucion sobre CUDA en este repositorio.
- Compatibilidad con GPU de consumo: no; el despliegue esta atado a la malla `p150x4`.
- Opciones de despliegue: vLLM con `tenstorrent/vllm-tt-plugin` sobre el servidor OpenAI-compatible que arranca `tt-model serve` en el puerto 20000. No se documentan llama.cpp, Ollama ni TGI.
- Espacio en disco: 1,2 GB para el repositorio, mas la imagen Docker y los pesos de `poolside/Laguna-S-2.1` descargados aparte (`pull --with-weights`), cuyo tamano no se especifica.
- Latencia y throughput: no disponibles; el unico dato operativo es que el primer arranque compila kerners y tarda varios minutos, y que se admite 1 secuencia concurrente.
- Memoria de contexto: la cache KV se asigna completa por capa, lo que limita `max_model_len` a 8192 tokens.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones de modelos alternativos en la informacion proporcionada. La unica comparacion posible es entre este repositorio y el modelo base del que depende:

| Aspecto | `mando2222/laguna-s-2.1-v51` | `poolside/Laguna-S-2.1` |
|---|---|---|
| Naturaleza | Contenedor de despliegue empaquetado con `tt-model-manager` | Pesos del modelo base |
| Parametros | 118B totales, ~4B activos por token (heredados del base) | 118B totales, ~4B activos por token |
| Contexto | 8192 tokens en el despliegue (limite del plugin) | No disponible; el autor sugiere ~1M segun el patron de atencion |
| Hardware | 4x Tenstorrent Blackhole `p150x4` | No disponible |
| Licencia | No disponible | No disponible en la informacion proporcionada |
| Formato de pesos | No incluye pesos; los descarga del base | No disponible |
| Descargas / likes | 0 / 0 | No disponible |

## Limitaciones y advertencias

- Contexto muy reducido en la practica: 8192 tokens frente a los ~1M que permitiria el patron de atencion, por una limitacion conocida del plugin de vLLM para Tenstorrent al asignar cache KV uniforme por capa.
- Concurrencia de 1 secuencia: no es apto para servir trafico concurrente real; cualquier uso multiusuario requerira multiples instancias o esperar mejoras del plugin.
- Licencia no declarada: el repositorio no especifica licencia ni condiciones de uso comercial. Antes de cualquier uso en produccion hay que verificar la licencia del modelo base `poolside/Laguna-S-2.1`, que tampoco aparece en la informacion disponible.
- Procedencia parcialmente opaca: `tt-metal` se construyo desde un arbol con cambios sin commitear y el commit del checkout de `vllm-tt-plugin` no se ha publicado, por lo que la reproducibilidad exacta del binario no esta garantizada.
- Version de vLLM no estandar: se usa una rueda `vllm-0.26.0+empty-cp312-cp312-linux_x86_64.whl` compilada por el autor, no una distribucion oficial, lo que complica el soporte y las actualizaciones.
- Riesgo de alucinacion: no cuantificado ni documentado para este despliegue ni para el modelo base.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no declarados; no se puede asumir un comportamiento multilingue concreto.
- Repositorio sin traccion: 0 descargas y 0 likes, publicado por un autor individual (`mando2222`) y no por el equipo de poolside ni por Tenstorrent; no debe tratarse como canal oficial.
- Primer arranque lento: la compilacion de kerners para el dispositivo tarda varios minutos antes de que el servidor acepte peticiones.
- Dependencia de hardware especifico: sin una malla `p150x4` no hay camino de ejecucion documentado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mando2222/laguna-s-2.1-v51
- Pesos del modelo base: https://huggingface.co/poolside/Laguna-S-2.1
- Herramienta de empaquetado `tt-model-manager`: https://github.com/tenstorrent/tt-model-manager
- Commit de `tt-metal` usado en la construccion: https://github.com/tenstorrent/tt-metal/commit/2d8292201660bff1ad9caf6cac556d9937f436d4
- Plugin vLLM para Tenstorrent (`vllm-tt-plugin`): https://github.com/tenstorrent/vllm-tt-plugin (el commit concreto no se publica en la model card)
- Resultados de busqueda web: no se ha recuperado ninguna fuente relevante sobre el modelo; los resultados devueltos correspondian a dominios sin relacion con la consulta.
