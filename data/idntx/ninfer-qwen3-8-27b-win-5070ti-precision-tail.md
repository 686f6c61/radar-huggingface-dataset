# idntx/ninfer-qwen3.8-27b-win-5070ti-precision-tail

## Resumen

Este repositorio no contiene un modelo de lenguaje en sentido estricto, sino una compilación no oficial para Windows del motor de inferencia NInfer, precompilado específicamente para la NVIDIA RTX 5070 Ti de 16 GB (arquitectura `sm_120a`) y orientado a ejecutar el modelo Qwen3.8-27B en formato propietario `.ninfer`. Lo publica el usuario `idntx` a partir del repositorio de `qwased`, que a su vez deriva del motor original `Neroued/ninfer` y de la rama de `Ryan-gsq`. El paquete incluye el binario `ninfer-serve.exe`, un servidor compatible con la API de OpenAI, junto con las DLL de runtime necesarias (FFmpeg, libcurl, zlib, MSVC) y scripts de arranque.

El problema que resuelve es la fricción de compilar localmente un motor CUDA experimental para una GPU Blackwell de gama consumer: el autor entrega un binario `Release` compilado con MSVC 14.44 y CUDA 13.3, con opciones CMake específicas (`CMAKE_CUDA_ARCHITECTURES=120a`, `NINFER_SM120_NATIVE=ON`), de modo que el usuario solo necesita descargar el artefacto del modelo y ejecutar `quickstart.bat`. Es relevante ahora porque las RTX 5070 Ti de 16 GB son hardware asequible y el proyecto demuestra que es posible servir un modelo de 27B con contexto de hasta 120 000 tokens en una sola tarjeta, usando cuantización IQ3_S (~11,3 GiB) y un esquema de KV cache comprimido (`rk4v4-e8`).

Conviene subrayar que el repositorio pesa 2,2 GB y no incluye los pesos del modelo: únicamente distribuye el motor y los runtimes. Los pesos se obtienen por separado desde la página del artefacto `Dirk-Qwen3.8-27B-GSQ-RCO-IQ3_S-ninfer`. La licencia declarada es Apache 2.0 y el idioma indicado es inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el repositorio distribuye el motor de inferencia NInfer, no el modelo; el modelo referenciado es Qwen3.8-27B en formato `.ninfer`) |
| Parametros totales | 27B (según el nombre del artefacto Qwen3.8-27B) |
| Parametros activos | No disponible |
| Longitud de contexto | Hasta 120 000 tokens verificados en RTX 5070 Ti 16 GB; perfil conservador documentado de 57 344 tokens; quickstart con 65 000 tokens |
| Tipos de cuantizacion | IQ3_S (~11,3 GiB) para los pesos; KV cache en `rk4v4-e8` y cola KV en `f16` |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (formato propietario del motor NInfer); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo Qwen3.8-27B ni sobre su proceso de entrenamiento (composición del dataset, número de tokens, RLHF/DPO) en la documentación proporcionada. El repositorio se limita a empaquetar el motor de inferencia y no documenta el modelo subyacente.

Lo que sí está documentado es la arquitectura del runtime de inferencia: un servidor CUDA nativo compilado para `sm_120a` que implementa decodificación especulativa con dos mecanismos combinados, MTP (multi-token prediction) con 3 tokens de borrador y especulación por n-gramas con 6 tokens de borrador. Incorpora gestión automática de la KV cache (`--kv-capacity auto`), un tipo de compresión de KV cache denominado `rk4v4-e8`, una cola de KV en `f16` para los últimos tokens (`--kv-tail-tokens`), evaluación de prompt por fragmentos (`--prefill-chunk`) y control de concurrencia. El motor expone una API compatible con OpenAI en `/v1`.

## Capacidades

- Servidor de inferencia compatible con la API de OpenAI (`/v1`), lo que permite integrarlo con clientes y SDKs existentes sin adaptadores.
- Decodificación especulativa combinada (MTP + n-gramas) para acelerar la generación.
- Gestión automática de memoria de la KV cache con margen configurable (`--kv-headroom-mib`).
- Compresión de KV cache (`rk4v4-e8`) que permite sostener contextos de hasta 120 000 tokens en 16 GB de VRAM.
- Evaluación de prompts largos por fragmentos (`--prefill-chunk`) para evitar picos de memoria.
- Capacidades del modelo subyacente (razonamiento, código, matemáticas, tool calling, agentes, multilingüismo): no disponibles en la información proporcionada.
- Soporte de visión, audio o thinking mode: no disponible.

## Casos de uso

- Despliegue local de un LLM de 27B en una estación de trabajo con RTX 5070 Ti: el binario precompilado elimina la necesidad de configurar toolchain CUDA/MSVC; basta con descargar el artefacto `.ninfer` y editar la ruta en `quickstart.bat`.
- Procesamiento de documentos largos: con 120 000 tokens de contexto verificado, el motor permite analizar contratos, informes o bases de código extensas en una sola pasada sin fragmentación manual.
- Asistente de código en local: el endpoint compatible con OpenAI permite conectarlo a plugins de IDE o a herramientas tipo Continue/Cline que esperan una API `/v1`, manteniendo los datos en la máquina.
- Prototipado de agentes con tool calling: al exponer una API estándar, se puede integrar con frameworks como LangChain o LlamaIndex que consumen endpoints OpenAI-compatibles.
- Servicio de inferencia personal o de equipo pequeño: `--max-concurrency 1` está pensado para uso interactivo de un solo usuario; sirve como backend privado para un chatbot interno sin coste por token.
- Evaluación comparativa de motores de inferencia: útil para investigadores que quieran medir throughput y latencia de NInfer frente a llama.cpp o vLLM sobre el mismo hardware Blackwell.
- Reproducción de builds: el paquete incluye `SHA256SUMS.txt`, `NOTICE.txt` y el commit exacto (`ed83ca2`), lo que facilita auditar y reproducir el binario en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del modelo en la información disponible. El único dato de rendimiento documentado es de sistema: generación sostenida de aproximadamente 110 tok/s con contexto de 120 000 tokens en una RTX 5070 Ti de 16 GB, usando especulación mixta MTP y n-gramas.

| Metrica | Valor | Condiciones |
|---|---|---|
| Throughput de generación | ~110 tok/s | Contexto 120K, MTP + n-gramas, RTX 5070 Ti 16 GB |
| Contexto maximo verificado | 120 000 tokens | KV cache `rk4v4-e8`, `--prefill-chunk 256`, `--kv-tail-tokens 256` |
| Perfil conservador documentado | 57 344 tokens | Guía upstream para IQ3_S |
| Configuracion del quickstart | 65 000 tokens | KV sizing automático, 300 MiB de margen |

## Requisitos de hardware

- VRAM: 16 GB es el mínimo cualificado; el artefacto IQ3_S ocupa ~11,3 GiB, dejando el resto para KV cache y overhead del runtime.
- GPU objetivo: NVIDIA RTX 5070 Ti 16 GB (`sm_120a`). El autor indica que otras tarjetas de 16 GB con `sm_120a` y memoria comparable podrían funcionar, pero no están cualificadas.
- GPU no soportadas por este build: cualquier tarjeta con arquitectura distinta de `sm_120a` (Ada, Ampere, Hopper) requeriría recompilar el motor.
- Driver: se necesita un driver NVIDIA con soporte de runtime CUDA 13.3.
- Sistema operativo: Windows 10 u 11, x64 exclusivamente.
- Almacenamiento: espacio suficiente para el artefacto del modelo (~11,3 GiB para IQ3_S) además del paquete de 2,2 GB.
- Despliegue: el binario `ninfer-serve.exe` actúa como servidor; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.ninfer` es propietario.
- Latencia y throughput: ~110 tok/s en generación con 120K de contexto; la latencia de prefill no está cuantificada, aunque el autor recomienda `--prefill-chunk 1024 --kv-tail-tokens 1024 --kv-tail-type f16` cuando el prefill importa.

## Comparativa con modelos similares

No disponible. El repositorio no es un modelo sino un build de motor de inferencia, por lo que la comparación con modelos de lenguaje no aplica directamente. Como referencia de motores de inferencia alternativos:

| Motor | Formatos soportados | Plataformas | Licencia | Notas |
|---|---|---|---|---|
| NInfer (este build) | `.ninfer` propietario | Windows x64, `sm_120a` | Apache 2.0 | Precompilado, especulación MTP + n-gramas, KV cache `rk4v4-e8` |
| llama.cpp | GGUF | Multiplataforma, CPU y GPU | MIT | Ecosistema amplio, cuantizaciones GGUF estándar |
| vLLM | safetensors, GPTQ, AWQ | Linux, CUDA | Apache 2.0 | Orientado a serving de alta concurrencia |
| TGI | safetensors | Linux, CUDA/ROCm | Apache 2.0 | Integración con HuggingFace Hub |

## Limitaciones y advertencias

- El paquete no incluye los pesos del modelo; sin el artefacto `.ninfer` correspondiente el binario no es funcional.
- Build no oficial: los autores originales de NInfer declinan responsabilidad sobre este empaquetado, sus fallos o su comportamiento.
- Solo Windows 10/11 x64 y solo GPUs `sm_120a`; no hay soporte para Linux, macOS ni arquitecturas CUDA anteriores.
- El formato `.ninfer` es propietario y no es interoperable con llama.cpp, vLLM u otras herramientas del ecosistema.
- `--max-concurrency 1` en la configuración recomendada limita el uso a un único usuario concurrente; no está pensado para serving multiusuario.
- Riesgo de OOM con 120K de contexto si hay VRAM consumida por otros procesos (navegador, compositor del sistema); el autor recomienda reducir contexto a 110 000, 100 000 u 80 000 en ese caso.
- Idioma declarado únicamente inglés; no hay evidencia de calidad en castellano.
- No se documentan sesgos, tasa de alucinación ni evaluaciones de seguridad del modelo subyacente.
- Antes de redistribuir comercialmente el paquete hay que revisar `NOTICE.txt` y `THIRD_PARTY_NOTICES.md` por las licencias de los runtimes de terceros (FFmpeg, libcurl, zlib, MSVC).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/idntx/ninfer-qwen3.8-27b-win-5070ti-precision-tail
- Artefacto del modelo: https://huggingface.co/idntx/Dirk-Qwen3.8-27B-GSQ-RCO-IQ3_S-ninfer
- Repositorio fuente del build: https://github.com/qwased/ninfer-16g-5070ti-qwen3.8-27b-gsq-rco-precision-tail
- Commit del build: https://github.com/qwased/ninfer-16g-5070ti-qwen3.8-27b-gsq-rco-precision-tail/commit/ed83ca23802ccebaa3331131825bfb46b4ff2802
- Motor original NInfer: https://github.com/Neroued/ninfer
- Rama upstream usada: https://github.com/Ryan-gsq/ninfer-16g-5070ti-5080-5090-qwen3.8-27b-gsq-rco
