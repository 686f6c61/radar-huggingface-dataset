# diffbot/DeepSeek-V4.1-Flash-EXL3-3bpw-2x-RTX-PRO-6000

## Resumen

DeepSeek-V4.1-Flash-EXL3-3bpw-2x-RTX-PRO-6000 es una cuantización de 3 bits del modelo DeepSeek-V4.1-Flash-1017, publicada por el usuario diffbot. El modelo original es un transformer de tipo mixture-of-experts (MoE) desarrollado por DeepSeek, con 218.691.507.682 parámetros totales según los safetensors del repositorio. Esta versión empaqueta los expertos enrutados en formato EXL3 de 3 bits calibrado, mantiene el resto de tensores en FP8 original de DeepSeek y añade tablas Engram en int4, con el objetivo de servir el modelo en dos GPU RTX PRO 6000 Blackwell (sm_120, 96 GB cada una) mediante vLLM con tensor-parallel 2.

La relevancia de este pack es práctica: reduce un modelo de más de 200.000 millones de parámetros a un tamaño servible en hardware de estación de trabajo de gama alta (332 GB de pesos, 340 GB de disco), con una ventana de contexto de 1 millón de tokens y una caché KV de 1,07 millones de tokens en fp8. Incluye además kernels propios para sm_120, un runtime opcional de expertos en CPU y un perfil para nodos de 8 GPU que ejecuta dos réplicas de 4 GPU con todos los expertos en VRAM.

El repositorio tiene 2.514 descargas y 43 likes, licencia MIT, y se distribuye como safetensors junto con un recetario de despliegue (Docker, kernels, scripts de servicio). No es un modelo nuevo entrenado desde cero, sino una cuantización calibrada del checkpoint DeepSeek-V4.1-Flash-1017, con métricas de fidelidad respecto al original publicadas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (MoE); etiqueta deepseek_v41; cuantización EXL3 con kernels sm_120 |
| Parametros totales | 218.691.507.682 |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (ventana de 1M; caché KV de 1,07M tokens en fp8 en perfil 2x) |
| Tipos de cuantizacion | EXL3 3 bits calibrado en expertos enrutados; FP8 de DeepSeek en el resto de tensores; int4 en tablas Engram; drafter con expertos EXL3 3 bits; variante drafter en FP8/FP4 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (model-00001 a model-00048, config.json); recetario Docker y kernels incluidos |

## Arquitectura y entrenamiento

El modelo base es DeepSeek-V4.1-Flash-1017, un transformer con arquitectura mixture-of-experts etiquetada como deepseek_v41. Esta publicación no entrena el modelo: aplica una cuantización EXL3 de 3 bits calibrada sobre los expertos enrutados, siguiendo el método de coolbho3k, y conserva los tensores restantes en el formato FP8 original de DeepSeek. Los expertos enrutados cuantizados se complementan con tablas Engram en int4 y con un cabezal DSpark (drafter) cuyos expertos también van en EXL3 de 3 bits. El pack ocupa 332 GB en 48 shards de safetensors.

La innovación técnica está en el stack de servicio: kernels propios para sm_120 (xmoe, xmoe_do, xmoe_do_i8, fp8ar, rowtopk, y en perfil 8x también xmoe_p8k y fp8arg), un runtime opcional de expertos en CPU con requisitos de AVX-512 (VNNI, VBMI, VBMI2) y muchos canales de memoria, y un perfil de 8 GPU que combina TP4 y EP4 para dos réplicas. Un tercio de los expertos enrutados permanece en RAM de host fijada (pinned) y se sirve mediante kernels sm_120 personalizados o el runtime de CPU. El autor publica métricas de fidelidad (KL medio respecto al checkpoint original 1017) y de velocidad en docs/SPEED.md y docs/FIDELITY.md. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto con ventana de contexto de 1 millón de tokens y caché KV de 1,07 millones de tokens en fp8 en el perfil de 2 GPU.
- Razonamiento y código: el pack reporta HumanEval del 97,0 % y GSM8K-200 del 98,5 % con thinking desactivado y decodificación greedy.
- Uso agéntico multi-turno con llamadas a herramientas: el benchmark de replay agéntico del autor cubre 104 turnos con tool calls reproducidos turno a turno.
- Tool calling y function calling: el recetario incluye bench/test-toolcall.py para verificar el servidor en ejecución.
- Procesamiento de imágenes: el recetario incluye bench/test-image.py, lo que indica soporte de entrada de imagen en el stack servido.
- Decodificación especulativa opcional mediante el cabezal DSpark, con variante afinada para código y uso agéntico (DS41_DRAFTER=code, SPEC_K=7).
- API compatible con OpenAI en el puerto 8000 con el nombre de modelo deepseek-v4.1-flash.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Servicio de código en producción sobre dos RTX PRO 6000: el pack decodifica 172,8 tok/s en una secuencia de código con prompt de 46K tokens y 308 tok/s en generación de código con el runtime de CPU, lo que permite integrarlo en pipelines de revisión y generación de parches.
- Agentes de codificación multi-turno: el replay agéntico de 104 turnos con tool calls alcanza 224,1 tok/s en un flujo y 110,4 tok/s agregados con 4 flujos concurrentes, adecuado para asistentes que encadenan lecturas de ficheros, ediciones y ejecución de tests.
- Análisis de repositorios completos: con 1M de tokens de contexto y 1,07M de tokens de caché KV en fp8, cabe indexar y razonar sobre bases de código extensas sin trocear en exceso.
- Despliegue en nodo de 8 GPU para equipos: el perfil 8x ejecuta dos réplicas de 4 GPU (TP4 + EP4) con 4,54M de tokens de caché por réplica y 128 secuencias, con 4.404-4.469 tok/s agregados en 128 flujos de código.
- Prefill de documentos largos: el prefill de 40K tokens frescos se resuelve en 11.157-11.467 tok/s en el perfil 2x y en 19.131-19.302 tok/s por réplica en el perfil 8x, útil para resumir o extraer información de contratos e informes.
- Evaluación de fidelidad de cuantizaciones: los scripts de fidelity y los paneles short100, GSM8K-200 y HumanEval permiten comparar variantes de cuantización contra el checkpoint original antes de adoptarlas.
- Prototipado con API compatible con OpenAI: el script serve.sh expone un endpoint en :8000 que se puede conectar a clientes existentes sin cambiar el código de integración.

## Benchmarks y rendimiento

Rendimiento (tokens de salida por segundo, según docs/SPEED.md del autor):

| Configuracion | Replay agentico, 1 flujo | Codigo, 1 flujo | Prefill 40K fresco | Contexto / cache KV | Bajo carga (agregado) |
|---|---:|---:|---|---|---|
| 2x, por defecto (solo GPU) | 224,1 | 172,8 (prompt 46K) | 11.157-11.467 | 1M ventana, 1,07M tokens fp8 | replay agentico, 4 concurrentes 110,4; cuatro flujos 46K 362,9 |
| 2x, runtime CPU (CPU_EXPERTS=1) | 261,8 | 207 (46K); 308 generacion de codigo | 13.470-13.620 | igual | 127,8; 442 |
| 8x, por replica (TP4 + EP4, 4 GPU) | 205-222 (prompt agentico 46K) | 435-457 generacion de codigo | 19.131-19.302 | 1M ventana, 4,54M tokens, 128 secuencias | 128 flujos de codigo 4.404-4.469 |
| 8x, nodo completo (2 replicas) | no disponible | 809 (un flujo por replica) | no disponible | 2 x 4,54M tokens | 128 flujos de codigo por replica 8.430; generaciones largas 5.250 |

Calidad (KL medio en nats, menor es mejor, respecto al original 1017; GSM8K-200 y HumanEval con thinking desactivado y decodificación greedy):

| Configuracion | Texto neutro | Codigo | Agentico | short100 | GSM8K-200 | HumanEval |
|---|---:|---:|---:|---:|---:|---:|
| Original 1017, segunda ejecucion (ruido) | 0,0082 | 0,0050 | 0,0047 | no disponible | no disponible | no disponible |
| Este pack, 2x por defecto | 0,0522 | 0,0306 | 0,0111 | 0,0338 | 98,5 % | 97,0 % |
| Este pack, 2x runtime CPU | 0,0520 | 0,0309 | 0,0112 | 0,0354 | 98,5-99,0 % | 97,0 % |
| Este pack, perfil 8x | no disponible | no disponible | no disponible | no disponible | 98,0-99,0 % | 97,0-97,6 % |

## Requisitos de hardware

- Dos GPU sm_120 con 96 GB cada una (RTX PRO 6000 Blackwell), controlador CUDA 13, Docker con NVIDIA container toolkit.
- Aproximadamente 260 GiB de RAM de host libre y 340 GB de disco para el despliegue en 2 GPU.
- Perfil 8x: ocho GPU sm_120 de 96 GB, dos nodos NUMA y hasta 400 GiB de RAM de host por réplica.
- Runtime de CPU opcional: CPU x86_64 con AVX-512 (VNNI, VBMI, VBMI2) y muchos núcleos y canales de memoria; se valida con cpuexp/check_host.sh.
- Despliegue mediante vLLM con tensor-parallel 2 (perfil 2x) o TP4 + EP4 por réplica (perfil 8x), con imagen Docker propia construida desde recipe/docker/build.sh.
- No cabe en GPU de consumo: los requisitos mínimos son dos tarjetas profesionales de 96 GB; no se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver la tabla de benchmarks; el replay agéntico por defecto decodifica un 28 % más rápido que la release anterior de V4.1-Flash (224 frente a 176 tok/s).

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-EXL3-3bpw-2x-RTX-PRO-6000 (este pack) | 218.691.507.682 | 1M tokens | safetensors, EXL3 3 bits + FP8 + int4 | MIT | Hugging Face, 2.514 descargas |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (modelo base) | no disponible en la informacion | no disponible en la informacion | FP8/FP4 original | no disponible en la informacion | Hugging Face (referenciado como base) |
| Otras cuantizaciones de DeepSeek-V4.1-Flash | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos alternativos de la misma categoría en la información proporcionada, por lo que la comparación de rendimiento queda limitada a las cifras del propio pack frente al checkpoint original.

## Limitaciones y advertencias

- Es una cuantización de 3 bits: el KL medio respecto al original sube de 0,0082 a 0,0522 en texto neutro y de 0,0050 a 0,0306 en código, lo que implica degradación medible frente al checkpoint FP8.
- El perfil por defecto mantiene un tercio de los expertos enrutados en RAM de host; el rendimiento depende de kernels sm_120 personalizados o del runtime de CPU, y este último exige AVX-512 con VNNI, VBMI y VBMI2.
- El despliegue está atado a hardware Blackwell sm_120 y CUDA 13; no se documenta funcionamiento en GPU de consumo ni en otras arquitecturas.
- Los requisitos de memoria son elevados: 260 GiB de RAM de host y 340 GB de disco en el perfil 2x, y hasta 400 GiB de RAM por réplica en el perfil 8x.
- Los datos de calidad y velocidad proceden del propio autor del pack; no hay una evaluación independiente publicada en la información disponible.
- No se especifican los idiomas soportados ni los sesgos conocidos del modelo base.
- Riesgo de alucinación: no cuantificado en la información proporcionada; aplica el comportamiento habitual de un modelo generativo de este tamaño.
- La licencia del pack es MIT, pero las restricciones de uso comercial del checkpoint original de DeepSeek no se detallan en la información disponible y conviene verificarlas antes de un despliegue en producción.
- El uso del cabezal DSpark afinado para código (DS41_DRAFTER=code, SPEC_K=7) está pensado para un flujo a la vez y principalmente para código, no como configuración general.

## Enlaces

- Hugging Face del pack: https://huggingface.co/diffbot/DeepSeek-V4.1-Flash-EXL3-3bpw-2x-RTX-PRO-6000
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Documentación de velocidad: docs/SPEED.md (dentro del repositorio)
- Documentación de fidelidad: docs/FIDELITY.md (dentro del repositorio)
- Documentación del drafter: docs/DRAFTER.md (dentro del repositorio)
- Distribución del pack: docs/HOW-IT-FITS.md (dentro del repositorio)
- Registro de cambios: docs/CHANGELOG.md (dentro del repositorio)
- Runtime de CPU: recipe/cpuexp/README.md (dentro del repositorio)
