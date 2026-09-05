# debackerl/Qwen3.8-27B-Uncensored-FP8-NO-MTP

## Resumen

El modelo `Qwen3.8-27B-Uncensored-FP8-NO-MTP` es una cuantizacion en formato FP8 (block 128×128, E4M3) de un modelo Qwen3.8-27B abliterado, publicado por el usuario debackerl en HuggingFace. El modelo base es `JonathanColetti/Qwen3.8-27B-Uncensored`, un modelo que ha tenido eliminada la direccion de rechazo (refusal direction), lo que significa que no declina peticiones del mismo modo que la version oficial de Qwen3.8-27B. Este repositorio aporta unicamente la cuantizacion FP8; la modificacion funcional proviene del modelo base, bajo licencia Apache-2.0.

El modelo es multimodal (pipeline `image-text-to-text`), con la torre de vision preservada en BF16 y un contexto nativo de 262.144 tokens. Segun la model card, se trata de una build pensada para hardware Hopper, donde FP8 tiene soporte nativo de tensor cores, y que preserva el head MTP (Multi-Token Prediction) para decodificacion especulativa. El tamano del repositorio es de 30,9 GB, con un total de 27.356.728.560 parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B (hibrida Transformer-SSM, con vision tower y MTP head) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | No disponible |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | FP8 (block 128×128, E4M3, W8A8) |
| Idiomas soportados | Ingles (en), chino (zh), tailandes (th) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, FP8 |

## Arquitectura y entrenamiento

El modelo base es un Qwen3.8-27B abliterado, sobre el cual se ha aplicado una cuantizacion FP8 con escalas block-wise de 128×128 y formato E4M3. La cuantizacion sigue exactamente el esquema del `Qwen/Qwen3.8-27B-FP8` oficial, distinguiendo entre parametros de matmul y parametros de control:

- **En FP8:** las proyecciones `q/k/v/o_proj` y `gate/up/down_proj`, tanto en las capas de lenguaje como en el head MTP.
- **En BF16:** LayerNorms, gates, `A_log`, `dt_bias`, `conv1d` y las proyecciones `in_proj_a` / `in_proj_b` del gated-DeltaNet. Estos componentes gobiernan el estado recurrente, donde el error de cuantizacion se acumula en lugar de cancelarse, por lo que se mantienen sin cuantizar.
- **En BF16:** toda la torre de vision, `lm_head`, `embed_tokens` y `mtp.fc`.

La existencia de componentes como `A_log`, `dt_bias`, `conv1d` y el gated-DeltaNet indica que el modelo Qwen3.8-27B emplea una arquitectura hibrida que combina capas Transformer con bloques de espacio de estados (Mamba / gated DeltaNet). Ademas, el modelo incorpora un head MTP para decodificacion especulativa y una torre de vision multimodal. El entrenamiento del modelo base incluyo los refinamientos habituales de la familia Qwen: soporte de tool calling, razonamiento (thinking) y un contexto largo de 262K tokens. En el proceso de abliteracion se elimino la direccion de rechazo del modelo, manteniendo la torre de vision y el head MTP intactos.

## Capacidades

- **Multimodal (image-text-to-text):** puede procesar imagenes junto con texto, como demuestra la lectura de tablas en tailandes desde imagenes (actividades y celdas numericas).
- **Generacion de codigo:** segun la model card, ejecuta codigo generado contra aserciones, obteniendo 4/5 en las tareas de prueba, igual que la build oficial.
- **Razonamiento extenso (thinking):** el modelo dedica presupuesto de tokens al razonamiento interno antes de emitir respuesta.
- **Tool calling / function calling:** soportado, con parser `qwen3_coder` habilitado en la configuracion de vLLM.
- **Decodificacion especulativa:** el head MTP esta preservado, con una tasa de aceptacion medida del 52%.
- **Contexto extenso:** 262.144 tokens de ventana, con soporte de prefix caching.
- **Capacidades multilingues:** idiomas declarados: ingles, chino y tailandes.
- **Sin direccion de rechazo:** el modelo no declina peticiones del mismo modo que la version oficial, al estar abliterado.

## Casos de uso

- **Extraccion de datos de tablas en imagenes:** el modelo puede leer tablas con texto en tailandes desde capturas de pantalla o fotos, extrayendo nombres de actividades y celdas numericas con precision, util para digitalizar informes o facturas sin transcripcion manual.
- **Generacion de codigo asistida en entornos de produccion:** con tool calling y soporte de razonamiento, el modelo puede integrarse en pipelines de CI/CD para generar o revisar codigo. La build conserva la capacidad de ejecutar metodos contra aserciones, por lo que permite validar rapidamente la correccion funcional.
- **Agentes con razonamiento de multiples pasos:** el contexto de 262K tokens y el soporte de tool calling permiten construir agentes que encadenan llamadas a funciones y razonan sobre resultados intermedios, utiles en automatizacion de tareas complejas en entornos empresariales.
- **Sistemas de atencion al cliente multilingues:** con soporte de tailandes, chino e ingles, el modelo puede gestionar conversaciones multi-turno en varios idiomas, manteniendo el contexto completo de la conversacion en una sola ventana.
- **Inferencia de alta latencia en GPU Hopper:** gracias a la cuantizacion FP8 con tensor cores nativos y al soporte de decodificacion especulativa MTP, el modelo consigue 1.373 tokens/s con concurrencia 16, resultando adecuado para servicios en tiempo real que necesitan un alto throughput.
- **Procesamiento de documentos con contexto largo:** la ventana de 262K tokens permite introducir documentos extensos (informes, manuales, contratos) junto con sus imagenes para analisis, resumen o extraccion de informacion sin fragmentar la entrada.

## Benchmarks y rendimiento

Los datos provienen de la model card, medidos en el mismo hardware (H100 47GB vGPU), con la misma version de vLLM (0.27.1) y los mismos flags, comparando con la build oficial `Qwen/Qwen3.8-27B-FP8`:

| Tarea | `Qwen/Qwen3.8-27B-FP8` | Este build |
|---|---|---|
| Extraccion de tailandes, co-punto exacto (temp 0, 4 runs) | 16/16 | 16/16 |
| Tareas de codigo - codigo generado ejecutado contra aserciones | 4/5 | 4/5 |
| Vision: tabla en tailandes, nombres de actividades leidos exactos | 4/4 | 4/4 |
| Vision: celdas numericas | correcto | correcto |
| Tasa de aceptacion MTP | 58% | 52% |
| Tokens/s con concurrencia 1 | 131 | 132 |
| Tokens/s con concurrencia 8 | 816 | 813 |
| Tokens/s con concurrencia 16 | no disponible | 1.373 |

La unica tarea de codigo que ambos modelos fallan es la misma, por el mismo motivo: el modelo agota todo su presupuesto de tokens razonando y nunca emite una respuesta.

## Requisitos de hardware

- **VRAM estimada:** los pesos ocupan unos 30 GB. El resto es cache KV, por lo que la VRAM disponible determina el contexto que se puede servir. A 47-48 GB (H100 47C vGPU, L40S) se alcanzan ~350K tokens de cache KV con `--kv-cache-dtype fp8`. A 80 GB, ~600K+ tokens.
- **VRAM por tarjeta:** 24 GB (RTX 4090) no es suficiente para cargar el modelo en una sola tarjeta. 32 GB (V100) no funciona por arquitectura incompatible. 48 GB (A40) tiene la VRAM suficiente, pero el camino FP8 no es el optimo en Ampere.
- **Cuantizacion FP8 con tensor cores:** se requiere una arquitectura con soporte nativo de FP8. Ada Lovelace (RTX 4090, L4, L40S) funciona si hay VRAM suficiente. Hopper (H100, H200, H20) es el entorno probado. Blackwell (RTX 50xx, B100/B200, GB200) funciona, ademas con soporte FP4.
- **Arquitecturas sin soporte FP8:** Volta (V100) y Turing (RTX 20xx, T4) no pueden ejecutar este modelo. Ampere (A100, A40, A6000) no tiene tensor cores FP8, aunque vLLM puede usar `Fp8MarlinLinearMethod` como fallback. El soporte de escalas block-wise 128×128 en Ampere no esta probado.
- **Multi-GPU:** con 2× 24 GB y `--tensor-parallel-size 2`, funciona en Ada, repartiendo los pesos (~15 GB por tarjeta).
- **Requisito de cache KV:** sin `--kv-cache-dtype fp8`, la cache KV para 262K de contexto necesita 16,17 GiB en fp16, por lo que una tarjeta de 47 GB se niega a arrancar. Con `--kv-cache-dtype fp8`, la cache es de ~8,5 GiB.
- **Servir con vLLM:** se requiere vLLM con los flags: `--max-model-len 262144`, `--gpu-memory-utilization 0.94`, `--kv-cache-dtype fp8`, `--max-num-seqs 16`, `--reasoning-parser qwen3`, `--enable-auto-tool-choice --tool-call-parser qwen3_coder`, `--enable-prefix-caching` y `--speculative-config '{"method":"mtp","num_speculative_tokens":3}'`.
- **Limitacion de `--max-num-seqs`:** debe mantenerse por debajo del numero de bloques de estado Mamba disponibles; el valor por defecto de 256 produce un fallo al arrancar.
- **Verificacion del MTP:** la tasa de aceptacion puede fallar silenciosamente. Debe comprobarse la metrica `spec_decode_num_accepted_tokens_total`; una longitud media de aceptacion de 1.00 indica que todos los borradores se rechazan y se paga el coste de drafting sin beneficio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Qwen/Qwen3.8-27B-FP8` | 27.356.728.560 | 262.144 | FP8 | Apache-2.0 | HuggingFace |
| `debackerl/Qwen3.8-27B-Uncensored-FP8-NO-MTP` | 27.356.728.560 | 262.144 | FP8 (block 128×128, E4M3) | Apache-2.0 | HuggingFace |
| `orcarouter/Qwen3.8-27B-Uncensored` (Ollama/GGUF) | 27.356.728.560 | 262.144 | GGUF (multiples niveles) | Apache-2.0 | Ollama |
| `JonathanColetti/Qwen3.8-27B-Uncensored` | 27.356.728.560 | 262.144 | BF16 (sin cuantizar) | Apache-2.0 | HuggingFace |

Respecto a la build oficial, el modelo conserva el mismo rendimiento en tareas de extraccion, codigo y vision, con una tasa de aceptacion MTP ligeramente inferior (52% frente a 58%) y un throughput practicamente identico (132 vs 131 tokens/s a concurrencia 1, 813 vs 816 a concurrencia 8). La diferencia fundamental es que esta version es una cuantizacion de un modelo abliterado, no de la version oficial.

## Limitaciones y advertencias

- **Inconsistencia de identificadores:** el ID de HuggingFace incluye el sufijo `NO-MTP`, pero la model card describe una build con el head MTP preservado y funcional. Asimismo, el comando de vLLM de la propia model card referencia `pramoths/Qwen3.8-27B-Uncensored-FP8-MTP` y el repositorio de reproduccion es `pramoth/qwen38-fp8-forge`, mientras que el autor del repositorio HF es `debackerl`. Esta discrepancia puede indicar que la model card no se corresponde exactamente con este repositorio.
- **Restricciones de hardware:** el modelo solo es util en arquitecturas con tensor cores FP8 (Ada, Hopper, Blackwell). En Volta y Turing no funciona. En Ampere, el camino de fallback no esta probado con escalas block-wise 128×128.
- **Limites de VRAM:** con 24 GB de VRAM no carga en una sola tarjeta. Con 47 GB, la maxima concurrencia para peticiones de contexto completo (262.144 tokens) es de 1.3; sin cache KV en FP8, una tarjeta de 47 GB no puede arrancar con contexto completo.
- **Riesgo de alucinacion:** como todo modelo de lenguaje generativo, puede producir contenido factualmente incorrecto. En las pruebas de codigo, el modelo fallo una tarea por agotar el presupuesto de tokens razonando sin emitir respuesta, lo que supone un riesgo de timeout en produccion.
- **Modelo abliterado:** al haberse eliminado la direccion de rechazo, el modelo puede genertar contenido que la version oficial rehusaria. La model card advierte expresamente que esta modificacion proviene del modelo base, no de la cuantizacion, y debe usarse conforme a la licencia.
- **Sin tapadera de seguridad de la cuantizacion:** la cuantizacion FP8 solo cubre las proyecciones de matmul; la torre de vision, `lm_head`, `embed_tokens` y todos los componentes de control recurrente permanecen en BF16, lo que aumenta el peso total del repositorio a 30,9 GB pese a ser una build FP8.
- **Fallo silencioso del MTP:** la decodificacion especulativa puede degradarse sin error explicito; es necesario monitorizar las metricas de aceptacion para detectar cuando el sistema esta pagando el coste de drafting sin beneficio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/debackerl/Qwen3.8-27B-Uncensored-FP8-NO-MTP
- Modelo base en HuggingFace: https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored
- Repositorio de reproduccion y scripts: https://github.com/pramoth/qwen38-fp8-forge
- Version GGUF en Ollama: https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored
- Guia de ejecucion local con llama.cpp: https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
