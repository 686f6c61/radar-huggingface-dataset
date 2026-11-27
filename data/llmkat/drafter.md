# llmkat/drafter

## Resumen

`llmkat/drafter` es un modelo borrador (draft model) disenado especificamente para decodificacion especulativa junto con el modelo `llmkat/llama`. Lo desarrolla el autor `llmkat` y su proposito no es la generacion de texto de proposito general, sino servir como herramienta de verificacion: propone el token correcto despues de cada puntero y `<miss>` despues de cualquier otro token, de modo que el motor de inferencia acepta y rechaza borradores siguiendo un patron fijo y comprobable.

El modelo es extremadamente pequeno (8.870.283 parametros segun los pesos en safetensors) y esta empaquetado con la libreria `transformers` en formato safetensors, con etiquetas que apuntan a `vllm`, `sglang` y `testing`. Su relevancia es acotada pero clara: permite comprobar que un servidor de inferencia lee correctamente los bloques de KV-cache durante la decodificacion especulativa. Segun la model card, cada token correcto gana por unos 39 nats, por lo que un token erroneo indica un fallo del motor (lectura incorrecta del bloque de KV-cache) y no una diferencia de redondeo.

No se dispone de informacion sobre arquitectura detallada, datos de entrenamiento ni idiomas soportados mas alla de lo que figura en la model card y los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `llama` en los metadatos; sin detalle en la model card) |
| Parametros totales | 8.870.283 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la etiqueta `llama` presente en los metadatos de Hugging Face y del uso declarado como draft model para decodificacion especulativa. El modelo tiene 8.870.283 parametros y se distribuye en safetensors para su carga con `transformers`.

No se han publicado datos sobre el corpus de entrenamiento, el numero de tokens, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La unica innovacion tecnica descrita es su comportamiento determinista como borrador: propone el token correcto tras cada puntero y `<miss>` tras cualquier otro token, lo que permite al motor aceptar o rechazar borradores con un patron fijo y verificar que la salida final no cambia. La model card indica que cada token correcto gana por aproximadamente 39 nats, umbral que separa un error del motor de una diferencia de redondeo.

## Capacidades

- Generacion de borradores para decodificacion especulativa junto a `llmkat/llama`.
- Propuesta determinista del token correcto despues de cada puntero y de `<miss>` en el resto de casos.
- Verificacion de la lectura correcta de bloques de KV-cache en motores de inferencia.
- Compatibilidad declarada con `vllm` y `sglang` a traves de la configuracion especulativa del servidor.
- Integracion con `transformers` y con text-generation-inference segun los tags del repositorio.
- No se documentan capacidades de razonamiento, codigo, matematicas, vision, audio, tool calling ni multilingues de proposito general.

## Casos de uso

- Verificacion de motores de inferencia: sirve para comprobar que un servidor basado en vLLM o SGLang lee correctamente los bloques de KV-cache durante la decodificacion especulativa, usando el patron fijo de aceptacion y rechazo como senal de correccion.
- Pruebas de regresion en CI: el script `check.py` del repositorio permite ejecutar pasadas (`--passes 2`) contra un endpoint local y detectar cambios de comportamiento tras actualizar el motor.
- Validacion de configuraciones de decodificacion especulativa: permite probar la opcion `--speculative-config` con `num_speculative_tokens` y comprobar que la salida no varia respecto a la generacion sin borrador.
- Diagnostico de fallos de atencion y cache: dado que un token erroneo implica lectura incorrecta del bloque de KV-cache, el modelo ayuda a aislar errores de implementacion en el motor.
- Entorno de pruebas para desarrolladores de servidores de inferencia: util para quienes implementan o modifican rutas de decodificacion especulativa y necesitan un caso de referencia con resultado conocido.
- Validacion de integraciones con `transformers` y text-generation-inference: permite comprobar que la carga del draft model y su emparejamiento con el modelo principal funcionan segun lo esperado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente menciona el margen de aproximadamente 39 nats por token correcto como criterio de verificacion, sin tablas comparativas de MMLU, HumanEval, GSM8K ni metricas de throughput o latencia.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida por el tamano del modelo (8,87 M de parametros); en precision de 16 bits los pesos ocupan aproximadamente 17,7 MB, y en 32 bits unos 35,5 MB.
- GPU recomendadas: cualquier GPU con suficiente memoria para alojar simultaneamente el modelo principal `llmkat/llama` y el borrador; el borrador en si no impone requisitos significativos.
- Cabe en GPU de consumo: si, dado el reducido tamano del borrador; el limite practico lo marca el modelo principal con el que se empareja.
- Opciones de despliegue: servidor vLLM con `--speculative-config` (`method: draft_model`, `model: llmkat/drafter`, `num_speculative_tokens: 3`), SGLang segun los tags, y carga mediante `transformers`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (draft models para verificacion de decodificacion especulativa) con los que establecer una comparacion de parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Modelo de proposito muy especifico: no esta pensado para generacion de texto general ni para tareas de razonamiento, codigo o matematicas.
- Dependencia de `llmkat/llama`: su comportamiento descrito (token correcto tras puntero, `<miss>` en el resto) esta disenado para emparejarse con ese modelo concreto.
- Sin datos de sesgos, alucinacion o cobertura linguistica: la model card no documenta evaluaciones de este tipo.
- Sin informacion sobre contexto maximo ni sobre cuantizaciones soportadas, lo que limita la planificacion de despliegues en produccion.
- Repositorio sin descargas ni likes en el momento de la consulta, con lo que no hay evidencia de uso comunitario ni de validacion externa.
- Licencia MIT: permite uso comercial, pero conviene revisar el repositorio del proyecto para conocer el alcance real de las pruebas y las limitaciones declaradas por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llmkat/drafter
- Modelo principal: https://huggingface.co/llmkat/llama
- Repositorio del proyecto: https://github.com/sansblues/llmkat
