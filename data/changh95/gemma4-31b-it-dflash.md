# changh95/gemma4-31b-it-dflash

## Resumen

`changh95/gemma4-31b-it-dflash` es un paquete de despliegue, no un modelo entrenado desde cero. Empaqueta los pesos de `google/gemma-4-31B-it` (revision `842da37`) junto con un modelo borrador de decodificacion especulativa, `RedHatAI/gemma-4-31B-it-speculator.dflash2` (revision `b0cd01b`), para servirlos sobre hardware Tenstorrent: una QuietBox 2 con un mesh de cuatro chips Blackhole (P300x2). El autor del paquete es el usuario de Hugging Face `changh95`, y la distribucion se realiza mediante `tt-model-manager` 0.1.0 con esquema de manifiesto 5.1.

El objetivo es ofrecer una via de inferencia OpenAI-compatible sobre aceleradores Tenstorrent, con dos perfiles de servicio: `single-user`, que ejecuta un motor de decodificacion residente (un programa persistente por chip y paso de decodificacion) con decodificacion especulativa DFlash2 y hasta 262.144 tokens de contexto, y `batch`, que atiende hasta 32 usuarios concurrentes sobre la ruta de decodificacion estandar de ttnn. El paquete incluye la configuracion de cuantizacion en dispositivo: proyecciones en BF4 (`bfloat4_b`), cabeza LM y cache KV en BF8.

La relevancia es acotada pero concreta: demuestra el despliegue de un modelo de 31B con contexto de 262K sobre silicio no-GPU (Blackhole de Tenstorrent) con un servidor compatible con la API de OpenAI, e incluye mediciones de latencia y throughput por perfil. No obstante, el propio autor documenta una perdida medible de calidad en generacion de codigo atribuida a los pesos BF4, y el repositorio no declara licencia, idiomas ni pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base `google/gemma-4-31B-it`); paquete de despliegue con decodificacion especulativa DFlash2 sobre 4 chips Blackhole en tensor-parallel |
| Parametros totales | 31B (segun el nombre del modelo base; no se detalla en la informacion disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens en ambos perfiles (`single-user` y `batch`) |
| Tipos de cuantizacion | BF4 (`bfloat4_b`) en proyecciones; BF8 en cabeza LM y cache KV |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el paquete no declara licencia; la del modelo base `google/gemma-4-31B-it` no se detalla en la informacion proporcionada) |
| Formato de pesos | Pesos originales de `google/gemma-4-31B-it` descargados aparte; conversion interna a pesos en dispositivo (22 GB convertidos a partir de un checkpoint de 59 GB). No se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

El paquete no entrena ningun modelo: distribuye el checkpoint `google/gemma-4-31B-it` y un borrador especulativo `RedHatAI/gemma-4-31B-it-speculator.dflash2`. La inferencia se ejecuta en un mesh `(1, 4)` de chips Blackhole con tensor-parallel sobre cuatro chips. En el perfil `single-user` se emplea un motor de decodificacion residente: un programa persistente por chip por cada paso de decodificacion, combinado con decodificacion especulativa DFlash2. La especulacion se aplica tanto a peticiones greedy como a peticiones con muestreo (temperature, top_p, top_k).

La conversion de pesos en el primer arranque reduce el checkpoint de 59 GB a 22 GB de pesos convertidos, con proyecciones en BF4 y cabeza LM y cache KV en BF8. La compilacion de kernels se realiza una sola vez por host (unos 9,5 minutos) y la conversion de pesos del motor residente tarda unos 70 segundos. El paquete ocupa unos 31 GB en disco (`~/.cache/tt-model/gemma4-31b-it-dflash`: 22 GB de pesos convertidos y 9 GB de kernels compilados). No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento (thinking) activado por defecto; se desactiva por peticion con `"chat_template_kwargs": {"enable_thinking": false}`.
- Generacion de codigo, con calidad reducida en esta build BF4 respecto a una build BF8 del mismo modelo (ver limitaciones).
- Tool calling en el perfil `single-user`: el parser `gemma4` de vLLM procesa llamadas a herramientas con `tool_choice: "auto"`. El perfil `batch` no soporta tool calling.
- Decodificacion especulativa en `single-user` sobre peticiones greedy y muestreadas (temperature, top_p, top_k); las penalizaciones y top_k superior a 32 se sirven sin especulacion.
- Servidor compatible con la API de OpenAI en el puerto 20000 (o el siguiente libre), con endpoint `/v1/chat/completions`.
- Contexto largo de hasta 262.144 tokens en ambos perfiles.
- Muestreo por defecto segun la configuracion de generacion del modelo (temperature 1.0, top_p 0.95) con top_k 20; `"temperature": 0` para greedy.
- Soporte de logprobs en el perfil `batch` (no en `single-user`).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional de un solo usuario con contexto muy largo: el perfil `single-user` mantiene un motor de decodificacion residente y admite hasta 262.144 tokens, adecuado para sesiones de analisis de documentos extensos o conversaciones prolongadas con un unico usuario interactivo.
- Procesamiento de documentos largos en una pasada: con 262K de contexto y TTFT medido de 13,6 s para 65.536 tokens de entrada, permite resumir o extraer informacion de contratos, informes o expedientes sin trocear el texto.
- Servicio multiusuario de baja concurrencia: el perfil `batch` atiende de 2 a 32 usuarios concurrentes sobre la ruta ttnn estandar, apropiado para equipos pequenos o entornos de evaluacion interna.
- Agentes con llamada a herramientas: en `single-user`, el parser `gemma4` de vLLM con `tool_choice: "auto"` permite integrar el modelo en flujos de agente que consultan APIs o ejecutan funciones, con el modo thinking activado por defecto para razonamiento multi-paso.
- Generacion de codigo en pipelines internos: el modelo produce codigo (HumanEval 0,835 en esta build), aunque la calidad en MBPP cae frente a la build BF8; es adecuado para asistencia de codigo con revision humana, no para sustitucion automatica sin supervision.
- Despliegue sobre aceleradores Tenstorrent en lugar de GPU: organizaciones con hardware Blackhole/P300x2 pueden servir un modelo de 31B con API OpenAI sin depender de A100/H100, usando `tt-model pull` y `tt-model serve`.
- Evaluacion y prototipado de decodificacion especulativa: el paquete permite comparar el rendimiento del motor residente con DFlash2 frente a la ruta estandar de `batch` en el mismo hardware.

## Benchmarks y rendimiento

Resultados del workflow `benchmarks` de `tt-inference-server`, perfil `single-user` (concurrencia 1):

| ISL | OSL | Peticiones | TTFT (ms) | TPOT (ms) | Throughput por usuario (t/s/u) | Throughput de salida (t/s) |
|---|---|---|---|---|---|---|
| 128 | 128 | 8 | 58,6 | 5,2 | 194,0 | 179,4 |
| 128 | 1024 | 4 | 58,4 | 3,0 | 333,5 | 327,6 |
| 1024 | 128 | 4 | 136,2 | 9,0 | 110,8 | 99,8 |
| 2048 | 128 | 4 | 280,6 | 8,2 | 121,4 | 96,4 |
| 4096 | 128 | 4 | 564,2 | 8,0 | 125,7 | 81,3 |
| 8192 | 128 | 2 | 1168,3 | 10,8 | 92,3 | 50,3 |
| 8192 | 1024 | 2 | 1171,9 | 8,6 | 116,3 | 102,7 |
| 10000 | 1024 | 2 | 1507,7 | 4,3 | 232,8 | 173,5 |
| 16384 | 128 | 2 | 2494,7 | 8,2 | 122,1 | 36,2 |
| 32768 | 128 | 1 | 5620,7 | 9,5 | 104,8 | 18,7 |
| 65536 | 128 | 1 | 13633,1 | 10,7 | 93,5 | no disponible (truncado en la informacion) |

Evaluacion de calidad (ruta de decodificacion ttnn, la misma que usa `batch`), comparando esta build BF4 con una build BF8 del mismo modelo:

| Benchmark | Esta build (BF4) | Build BF8 | Observacion |
|---|---|---|---|
| MBPP | 0,566 | 0,658 | Diferencia significativa (McNemar emparejado, p ajustada de Holm ≈ 1e-6) |
| HumanEval | 0,835 | 0,884 | No significativa |
| GSM8K | dentro del ruido | dentro del ruido | Sin diferencia apreciable |
| IFEval | dentro del ruido | dentro del ruido | Sin diferencia apreciable |
| MMLU-Pro | dentro del ruido | dentro del ruido | Sin diferencia apreciable |
| MATH-500 | dentro del ruido | dentro del ruido | Sin diferencia apreciable |
| RULER (8K) | dentro del ruido | dentro del ruido | Sin diferencia apreciable |

En `batch`, con 32 usuarios, un paso de decodificacion pasa de unos 29 ms a unos 274 ms con `OMP_NUM_THREADS=8` (unos 605 ms sin esa variable) cuando una peticion requiere muestreo en CPU.

## Requisitos de hardware

- Hardware objetivo: P300x2 (QuietBox 2) con un mesh `(1, 4)` de cuatro chips Blackhole y tensor-parallel sobre los cuatro chips. No es un paquete para GPU convencional.
- VRAM estimada: no aplica en el sentido habitual; los pesos en dispositivo ocupan 22 GB convertidos (proyecciones BF4, cabeza LM y cache KV BF8) a partir de un checkpoint de 59 GB.
- GPU recomendadas: no disponible; el paquete esta disenado para Blackhole de Tenstorrent, no para A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: no disponible; el despliegue documentado es exclusivamente sobre P300x2.
- Opciones de despliegue: `tt-model pull` y `tt-model serve` (tt-model-manager 0.1.0), servidor compatible con OpenAI en el puerto 20000; internamente usa vLLM con el plugin TT y ttnn. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Tiempos de arranque: primer arranque en un host, unos 12,5 minutos hasta estar listo (conversion de pesos ≈70 s y compilacion de kernels ≈9,5 min); arranques posteriores, unos 2,5 minutos, incluida la comprobacion sha256 de los pesos convertidos; `batch` arranca despues en unos 2 minutos.
- Disco: unos 31 GB en `~/.cache/tt-model/gemma4-31b-it-dflash`.
- Latencia y throughput: ver tabla de benchmarks (TTFT de 58,6 ms con ISL 128 y hasta 13.633 ms con ISL 65.536; TPOT entre 3,0 y 10,8 ms en `single-user`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Hardware | Notas |
|---|---|---|---|---|---|
| `changh95/gemma4-31b-it-dflash` (este paquete) | 31B | 262.144 | no disponible | P300x2, 4 chips Blackhole | BF4 en proyecciones, BF8 en cabeza LM y KV; especulacion DFlash2 en `single-user` |
| `google/gemma-4-31B-it` (modelo base) | 31B | no disponible en la informacion | no disponible en la informacion | GPU convencional (no detallado) | Pesos originales; el paquete descarga esta revision (`842da37`) |
| `RedHatAI/gemma-4-31B-it-speculator.dflash2` | no disponible | no disponible | no disponible | no disponible | Borrador especulativo usado por el perfil `single-user` (revision `b0cd01b`) |

No se dispone en la informacion proporcionada de datos de rendimiento de los modelos comparables ni de alternativas de otros fabricantes con los que contrastar parametros, contexto o throughput.

## Limitaciones y advertencias

- Calidad de generacion de codigo reducida por los pesos BF4: MBPP 0,566 frente a 0,658 en la build BF8 (diferencia significativa, p ajustada de Holm ≈ 1e-6). Aproximadamente la mitad de la brecha en MBPP corresponde a respuestas que nunca cierran el bloque de codigo, en su mayoria porque se alargan o repiten hasta el limite de 512 tokens.
- Trazas de pensamiento largas mas repetitivas: 12,8 % degeneradas frente a 8,8 % en la build BF8.
- La decodificacion especulativa puede producir salidas distintas a la decodificacion plana en casos de casi empate.
- El perfil `single-user` rechaza con HTTP 400 peticiones que su ruta especulativa no puede aplicar: `logprobs`, salidas estructuradas (`response_format`, guided decoding), `bad_words`, `allowed_token_ids`, `min_tokens`, `logit_bias` y `min_p`.
- El perfil `batch` no soporta tool calling.
- En `batch`, una peticion que requiere muestreo en CPU (penalizaciones de repeticion, presencia o frecuencia, logprobs o top_k superior a 32) desplaza el muestreo de todas las peticiones concurrentes a la CPU mientras esta activa; con 32 usuarios, el paso de decodificacion pasa de unos 29 ms a unos 274 ms con `OMP_NUM_THREADS=8`. El autor indica que la correccion completa corresponde al plugin TT de vLLM.
- Licencia no declarada en el repositorio: no se puede confirmar el uso comercial sin verificar la licencia del modelo base `google/gemma-4-31B-it`.
- Idiomas soportados no disponibles; no se puede garantizar calidad multilingue.
- Dependencia de hardware especifico (P300x2, cuatro chips Blackhole) y de la herramienta `tt-model-manager`; no hay ruta documentada para GPU convencional.
- Primer arranque lento (unos 12,5 minutos) por conversion de pesos y compilacion de kernels; una actualizacion del paquete que cambie el motor obliga a reconvertir.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; aplican los del modelo base, no evaluados aqui.

## Enlaces

- Repositorio del paquete: https://huggingface.co/changh95/gemma4-31b-it-dflash
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Borrador especulativo: https://huggingface.co/RedHatAI/gemma-4-31B-it-speculator.dflash2
- Herramienta de empaquetado: https://github.com/tenstorrent/tt-model-manager
