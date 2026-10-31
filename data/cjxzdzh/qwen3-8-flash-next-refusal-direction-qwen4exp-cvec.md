# cjxzdzh/Qwen3.8-Flash-Next-refusal-direction-qwen4exp-cvec

## Resumen

Este repositorio no contiene un modelo de lenguaje completo, sino un **vector de control de dirección de rechazo** (refusal-direction control vector) para el modelo base **Qwen3.8-Flash-Next** de Qwen, publicado por el usuario cjxzdzh en Hugging Face. El artefacto, llamado `cvec-qwen4exp.gguf`, se aplica en tiempo de inferencia sobre el flujo residual (residual stream) del modelo para modificar su comportamiento —concretamente, proyectar fuera la dirección asociada a las negativas de seguridad del modelo— sin alterar los pesos originales.

El vector tiene 47 direcciones de 2.560 valores cada una (una por capa, excepto la capa 0), en formato GGUF `controlvector`, y está diseñado para el motor de inferencia **Strata**, aunque el formato de archivo es compatible con el cargador de control vectors de llama.cpp. Un dato relevante declarado por el propio autor: los bytes del archivo son idénticos al vector `experimental-speed-projection` que se distribuye con el repositorio de Strata; este repo es un espejo bajo un nombre neutro para poder descargarlo sin clonar todo el repositorio del motor.

Su relevancia es principalmente técnica y de investigación: representa la técnica de *activation steering* (manipulación del comportamiento del modelo mediante proyecciones sobre el residual stream) en un formato estandarizado y conmutables por petición, sin re-cuantizar ni re-cargar nada. No es un modelo para uso general: es un accesorio de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vector de control (activation steering) sobre el residual stream de Qwen3.8-Flash-Next; no es un transformer por si mismo |
| Parametros totales | 120.320 (47 direcciones x 2.560 valores F32) |
| Parametros activos | no disponible (no aplica: no es un modelo generativo) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3.8-Flash-Next) |
| Tipos de cuantizacion | no aplica (tensores F32; el modelo base se sirve en cuantizaciones como IQ3_XXS segun la model card) |
| Idiomas soportados | no disponibles |
| Licencia | qwen-community-1.0 (heredada del modelo base, "other" en Hugging Face) |
| Formato de pesos | GGUF (`controlvector`), archivo unico `cvec-qwen4exp.gguf` de 483.520 bytes |

## Arquitectura y entrenamiento

El vector consiste en 47 tensores `direction.1` … `direction.47`, cada uno de forma `[2560]` en F32, donde 2.560 es la dimension de embedding del modelo base (`qwen4exp.embedding_length`). En Qwen3.8-Flash-Next el residual stream es un **hyper-connection stream** de 4 flujos (`qwen4exp.hyper_connection.count = 4`) de 2.560 dimensiones cada uno; la proyeccion se aplica una vez por flujo y por token.

La operacion aplicada tras la escritura de cada capa en el residual stream es `h <- h - s_l * (h . v_l) * v_l`, donde `v_l` es la direccion normalizada de la capa `l` y `s_l` su norma. Con vectores unitarios (`s_l = 1`, como en este archivo) se elimina completamente la componente del residual stream a lo largo de esa direccion; con `s_l > 1` se invierte el signo y se refuerza la direccion en su lugar. El modo `project` elimina la componente; el modo `add` la suma. En modo `project`, la contribucion de cada archivo se normaliza y su norma se convierte en la escala de esa capa.

No hay informacion sobre el proceso de generacion del vector (si se derivó mediante diferencias de activaciones, contrastive activation addition, etc.), ni sobre datos de entrenamiento, RLHF o DPO: no disponible. La configuracion recomendada por los autores, registrada en `strata-esp-config.json`, es: modo `project`, direccion `per-layer`, escala `1.0` y rango de capas `[4, 44]` (41 capas dirigidas).

## Capacidades

- **Supresion de la direccion de rechazo**: proyecta fuera del residual stream la componente asociada a las negativas de seguridad del modelo base, reduciendo los rechazos (comportamiento "uncensored").
- **Aplicacion en tiempo de inferencia**: no modifica los pesos; se activa, desactiva o sustituye por peticion sin recargar ni re-cuantizar el modelo.
- **Conmutacion por peticion**: mediante el campo booleano `experimental_speed_projection` en el cuerpo de la peticion HTTP (nivel superior, no dentro de `sampling`). Al omitir el campo se conserva el estado de la peticion anterior, por lo que conviene enviarlo explicitamente.
- **Compatibilidad de formato**: el formato `controlvector` GGUF con tensores `direction.<l>` es el que lee `common_control_vector_load` de llama.cpp, aunque el interruptor por peticion es exclusivo del servidor Strata.
- **Composicion de vectores**: Strata acepta varios archivos de vectores separados por comas; sus direcciones se suman.
- **Observabilidad**: el endpoint `/metrics` del servidor expone el estado del vector como `engine.cvec` (por ejemplo, `project:4-44`).

Importante: el propio repositorio advierte que el archivo es byte a byte identico al vector `experimental-speed-projection` de Strata, cuyo nombre original sugiere un proposito de aceleracion/proyeccion experimental, no de desbloqueo de rechazos. El efecto real debe verificarse por el usuario.

## Casos de uso

- **Investigacion en interpretabilidad y activation steering**: estudiar como la proyeccion de direcciones concretas del residual stream altera el comportamiento de un modelo, capa a capa, con un formato estandarizado y sin tocar los pesos.
- **Comparacion A/B de comportamiento por peticion**: activar y desactivar el vector entre peticiones consecutivas (`experimental_speed_projection: true/false`) para medir su efecto sobre las respuestas del mismo modelo desplegado, sin instancias duplicadas.
- **Evaluacion de robustez de alineacion**: generar pares de respuestas con y sin la direccion de rechazo proyectada para analizar la solidez de los mecanismos de seguridad de Qwen3.8-Flash-Next.
- **Despliegue con control granular de comportamiento**: en un servidor Strata, ofrecer a clientes autorizados un interruptor de comportamiento por solicitud, registrado y auditable via `/metrics` (`engine.cvec`).
- **Experimentacion con composicion de vectores**: combinar este archivo con otros control vectors (sumados por el motor) para estudiar efectos aditivos o de cancelacion entre direcciones.
- **Entornos de investigacion sin re-cuantizacion**: aplicar steering sobre un modelo ya cuantizado (por ejemplo, IQ3_XXS) sin generar nuevas variantes de pesos, ahorrando almacenamiento y tiempo de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones del efecto del vector sobre la calidad de generacion o la tasa de rechazo.

## Requisitos de hardware

- **VRAM del vector**: despreciable. El archivo ocupa 483.520 bytes (unos 0,46 MB); la sobrecarga en memoria de GPU es insignificante frente al modelo base.
- **VRAM total**: la determina el modelo base Qwen3.8-Flash-Next y su cuantizacion (la model card menciona la variante `qwen3.8-flash-next-iq3_xxs`). No disponible el numero exacto de parametros del modelo base en la informacion proporcionada.
- **GPU recomendadas**: no disponible; dependen del modelo base. Dada la mencion de cuantizacion IQ3_XXS, es plausible su ejecucion en GPUs de consumo, pero no hay datos confirmados.
- **Motor de inferencia**: **Strata** es el requisito declarado. El formato es legible por llama.cpp (`common_control_vector_load`), pero el interruptor por peticion `experimental_speed_projection` solo existe en el servidor Strata; `llama-server` no tiene ese campo de peticion. El paquete oficial del vector se construye sobre una rama `cvec-hooks` de `github.com/Cudila/llama.cpp`.
- **Ollama, vLLM, TGI**: sin soporte documentado para este vector; no disponible.
- **Latencia y throughput**: no disponibles. La model card indica que con el flag desactivado el kernel de proyeccion no se lanza y el modelo corre bit-idéntico a una build sin vector, lo que implica coste nulo en ese caso.

## Comparativa con modelos similares

No existen alternativas directas publicas documentadas para este artefacto especifico (vector de control para Qwen3.8-Flash-Next en formato Strata). Como referencia de categoria:

| Artefacto | Tipo | Formato | Motor | Licencia |
|---|---|---|---|---|
| cjxzdzh/Qwen3.8-Flash-Next-refusal-direction-qwen4exp-cvec | Vector de control (47 capas, F32) | GGUF controlvector | Strata (formato compatible llama.cpp) | qwen-community-1.0 |
| Vectores de control de las colecciones "uncensor" / "abliteration" de la comunidad (p. ej. derivados de techniques tipo refusal-direction de Anthropic Fall / "refusal in LLMs is mediated by a single direction") | Vectores de direccion de rechazo | GGUF controlvector, safetensors | llama.cpp, transformers | Varia |
| Abliteracion por pesos (p. ej. modelos "abliterated" derivados de Qwen) | Modificacion permanente de pesos | safetensors, GGUF | Cualquiera compatible con el modelo base | Varia |

La diferencia clave: este vector es conmutable por peticion y no altera los pesos, mientras que la abliteracion clasica modifica el modelo de forma permanente.

## Limitaciones y advertencias

- **No es un modelo**: es un accesorio de inferencia. No genera texto por si mismo y solo tiene sentido junto a Qwen3.8-Flash-Next en Strata.
- **Procedencia ambigua**: el autor declara que los bytes son identicos al vector `experimental-speed-projection` de Strata, cuyo nombre no corresponde a "refusal". El efecto real del archivo debe verificarse empiricamente antes de asumir que suprime rechazos.
- **Riesgo de degradacion**: proyectar direcciones del residual stream puede alterar la calidad, coherencia y utilidad de las respuestas, no solo las negativas de seguridad. No hay evaluaciones publicadas que cuantifiquen este impacto.
- **Alucinaciones y sesgos**: heredados integramente del modelo base; el vector no los mitiga y podria agravarlos al eliminar comportamientos de precaucion del modelo.
- **Seguridad y uso responsable**: eliminar las negativas de seguridad de un modelo puede facilitar la generacion de contenido danino. Su uso para eludir medidas de seguridad puede infringir la licencia del modelo base y las politicas de las plataformas de despliegue.
- **Compatibilidad limitada**: el interruptor por peticion solo existe en el servidor Strata; en llama.cpp el archivo se puede cargar pero sin control por peticion. Omitir el campo `experimental_speed_projection` en la API conserva el estado anterior, lo que puede provocar comportamientos inesperados si no se envia explicitamente.
- **Licencia**: qwen-community-1.0, heredada de Qwen3.8-Flash-Next. Revisar sus terminos antes de uso comercial; las restricciones concretas no se detallan en la model card.
- **Madurez**: 69 descargas y 3 likes en el momento de la ficha; sin comunidad de validacion ni documentacion de rendimiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/cjxzdzh/Qwen3.8-Flash-Next-refusal-direction-qwen4exp-cvec
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Repositorio del motor Strata (referenciado en la model card): github.com/Cudila/llama.cpp (rama `cvec-hooks`); el repositorio principal de Strata no se enlaza explicitamente en la model card
- Paper, blog o demo: no disponible
