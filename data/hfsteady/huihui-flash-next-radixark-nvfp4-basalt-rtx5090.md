# hfsteady/Huihui-Flash-Next-RadixArk-NVFP4-Basalt-RTX5090

## Resumen

Huihui-Flash-Next-RadixArk-NVFP4-Basalt-RTX5090 es un artefacto experimental de conversion y empaquetado de pesos publicado por el usuario hfsteady. No se trata de un modelo entrenado desde cero, sino de una recompresion del checkpoint edp1096/Huihui-RadixArk-Qwen3.8-Flash-Next-abliterated-NVFP4 (a su vez derivado de la familia Qwen3.8 Flash-Next) para el motor Basalt, orientada a ejecucion en GPUs RTX 5090 (arquitectura sm120) con CUDA 13.0. El autor declara explicitamente que no es un lanzamiento oficial de Huihui, Qwen, RadixArk ni Basalt.

El paquete combina expertos enrutados en formato NVFP4 (codigos E2M1 con escalas UE4M3), proyecciones densas BF16 convertidas a Q8_0, embeddings FP8 n-gram convertidos a Q8_0 y un modulo MTP (multi-token prediction) cuantizado a Q2_0/Q8_0. El repositorio ocupa 131,5 GB y se distribuye en partes ordenadas de 20 GiB, con manifiesto ARTIFACTS.json y sumas SHA256. La validacion de calidad y rendimiento esta pendiente segun la propia model card.

Su relevancia es acotada pero real para quien investiga despliegue de modelos grandes en hardware de consumo: documenta un pipeline reproducible de conversion (scripts de preflight, verificacion de tensores reales y conversion con puertas de validacion estrictas), aunque el modelo resultante no es un GPU-only de 32 GB y requiere offload a RAM del host (el pod piloto conto con 188 GB de RAM y 24 vCPU).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y modulo MTP; derivado de Qwen3.8 Flash-Next; motor Basalt |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 262144 tokens (configuracion prevista en el piloto, no garantizada) |
| Tipos de cuantizacion | NVFP4 (expertos enrutados), Q8_0 (proyecciones densas BF16, embeddings FP8 n-gram, matrices densas MTP seleccionadas), Q2_0 (expertos MTP), KV cache int8 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (etiquetada como "other" en el repo) |
| Formato de pesos | Basalt (pack propietario del motor, dividido en partes de 20 GiB); no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer MoE de la familia Qwen3.8 Flash-Next, en su variante "abliterated" (sin mecanismos de rechazo) segun el nombre del checkpoint fuente. Incluye un modulo MTP (multi-token prediction) que en este paquete se construye a partir de los tensores BF16 del propio checkpoint, no del drafter autodestilado del pack Basalt original. No hay entrenamiento, recalibracion de activaciones ni proyector de vision en esta conversion: es puramente un cambio de empaquetado y precision numerica.

La conversion preserva los codigos E2M1 y las escalas UE4M3 de los expertos enrutados del origen NVFP4, convierte las proyecciones densas BF16 a Q8_0 y deriva el formato `hc8` de las matrices de este mismo pack. El proceso se ejecuta con el motor Basalt en el commit 463d92e8edf18cf93839bf4cce541ddf7b073280, sobre Linux x86_64, CUDA 13.0, sm120 y CPU AVX2. La verificacion de origen hashea 221 ficheros descargados contra metadatos autenticados de Hugging Face, con muestreo acotado de expertos en las capas 0, 24 y 47. El autor advierte que el checkpoint original arrastra sus propias limitaciones de transferencia y cuantizacion, que esta conversion no puede deshacer.

## Capacidades

- Generacion de texto (pipeline declarado: text-generation); el autor la describe como conversion "text-only".
- Razonamiento y conocimiento general heredados del modelo base Qwen3.8 Flash-Next, sin validacion publicada en este pack.
- Decodificacion especulativa mediante el modulo MTP incluido (spec=8 en la configuracion prevista del piloto).
- Contexto largo: hasta 262144 tokens segun los ajustes previstos, con KV cache int8.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el campo de idiomas no esta relleno.
- Vision y audio: no incluidas (sin proyector de vision en esta conversion).
- Modo "thinking": no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion de cuantizacion NVFP4 en hardware Blackwell: el pack sirve como referencia reproducible para estudiar como se comporta un MoE grande con expertos en E2M1/UE4M3 y densas en Q8_0 sobre sm120, usando los scripts de preflight y verificacion incluidos.
- Despliegue en un pod dedicado con offload a RAM: con 188 GB de RAM y 24 vCPU como referencia del piloto, se puede servir el modelo en una RTX 5090 manteniendo expertos residentes y cache automatica, util para pruebas internas de latencia y throughput.
- Evaluacion de decodificacion especulativa con MTP: el modulo MTP cuantizado a Q2_0 permite medir la ganancia de aceptacion de tokens especulativos frente a decodificacion autoregresiva estandar en el motor Basalt.
- Pruebas de contexto largo: los 262144 tokens previstos con KV int8 permiten experimentar con resumen de documentos extensos y recuperacion sobre corpus grandes, siempre con validacion de calidad propia.
- Auditoria de cadena de procedencia: el repositorio documenta revisiones exactas, hashes SHA256 y recibos de validacion, lo que lo hace util como caso de estudio de trazabilidad en artefactos de modelos.
- Reproduccion de pipelines de conversion: los scripts `convert-huihui-pod.py`, `check-real-tensors-pod.py` y `verify-huihui-pod.py` sirven como plantilla para convertir otros checkpoints NVFP4 al formato Basalt con puertas de validacion.
- Experimentacion con modelos "abliterated": para equipos que investigan comportamiento sin rechazos, el linaje del checkpoint fuente permite estudiar diferencias frente a variantes alineadas, con las advertencias de seguridad correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la validacion de calidad y rendimiento esta pendiente y que las pruebas de velocidad del modelo stock no validan esta conversion.

## Requisitos de hardware

- VRAM: no disponible de forma exacta; el autor aclara que no es un modelo GPU-only de 32 GB y que requiere RAM del host y offload. El repositorio completo pesa 131,5 GB en partes de 20 GiB.
- GPU objetivo: RTX 5090 (sm120), con build de CUDA 13.0. Otras GPU no estan validadas en la informacion disponible.
- RAM del host: el pod piloto conto con 188 GB de RAM y 24 vCPU; se recomienda capacidad comparable.
- Almacenamiento: al menos 500-600 GiB de scratch para el proceso completo de conversion (fuente, salida, exportacion y partes de subida).
- CPU: AVX2 requerido en el entorno probado.
- Despliegue: motor Basalt con runner y servidor incluidos en `runtime/`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Imagen base probada: `runpod/pytorch:1.0.7-cu1300-torch291-ubuntu2404-cluster`.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este pack.
- Configuracion prevista del piloto: contexto maximo 262144, KV int8, cache de expertos y prefill automaticos, expertos residentes, spec=8, parallel=1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| Huihui-Flash-Next-RadixArk-NVFP4-Basalt-RTX5090 | no disponible | 262144 (previsto) | Basalt (NVFP4/Q8_0/Q2_0) | qwen-community-license-1.0 | Experimental, sin benchmarks |
| edp1096/Huihui-RadixArk-Qwen3.8-Flash-Next-abliterated-NVFP4 (fuente) | no disponible | no disponible | NVFP4 | no disponible | Checkpoint de origen |
| Pack Basalt stock con drafter autodestilado | no disponible | no disponible | Basalt | no disponible | Referencia del motor; el pack actual usa MTP propio en su lugar |

No se dispone de datos de rendimiento ni de especificaciones completas de las alternativas en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa.

## Limitaciones y advertencias

- Artefacto no oficial: el autor declara que no es un lanzamiento de Huihui, Qwen, RadixArk ni Basalt, y que una conversion exitosa no implica calidad del modelo ni paridad con benchmarks.
- Validacion pendiente: calidad y rendimiento no estan verificados; los pesos pueden no estar subidos en el momento de consultar el repositorio (comprobar ARTIFACTS.json).
- Linaje "abliterated": el checkpoint fuente elimina mecanismos de rechazo, lo que incrementa el riesgo de contenido nocivo y requiere filtros externos en produccion.
- Riesgo de alucinacion: no cuantificado; sin evaluaciones publicadas no puede acotarse.
- Idiomas: no declarados; no hay garantia de cobertura multilingue.
- Licencia: qwen-community-license-1.0 con terminos adicionales; revisar LICENSE-model.txt antes de cualquier uso comercial.
- Restricciones de despliegue: el runtime debe extraerse bajo `/workspace` (ruta no reubicable), el modelo no cabe en 32 GB de VRAM y exige offload a RAM; el modo fresh de instalacion de paquetes no se ha ejercitado en un segundo pod.
- Seguridad operativa: la model card recomienda bind a loopback, clave API generada de forma independiente y acceso por SSH; no incluir tokens en historial ni ficheros publicos.
- Verificacion: los hashes se comprueban contra metadatos de descarga autenticados, no contra una relectura independiente de metadatos.
- Sin soporte de vision ni audio; cualquier uso multimodal no esta cubierto por este pack.

## Enlaces

- Hugging Face: https://huggingface.co/hfsteady/Huihui-Flash-Next-RadixArk-NVFP4-Basalt-RTX5090
- Modelo base: https://huggingface.co/edp1096/Huihui-RadixArk-Qwen3.8-Flash-Next-abliterated-NVFP4
- Motor Basalt: https://github.com/jesdga95/basalt
- Licencia del modelo: https://huggingface.co/hfsteady/Huihui-Flash-Next-RadixArk-NVFP4-Basalt-RTX5090/blob/main/LICENSE-model.txt
