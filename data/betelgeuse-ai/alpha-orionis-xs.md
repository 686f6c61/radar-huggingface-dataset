# Betelgeuse-AI/Alpha-Orionis-XS

## Resumen

Alpha-Orionis-XS es un reempaquetado de Qwen3.8-Flash-Next (de Qwen) en formato GGUF "stripped", publicado por Betelgeuse-AI. No se trata de un modelo nuevo entrenado ni destilado, ni de una cuantización nueva: los pesos cuantizados proceden íntegramente de la versión IQ2_XS de ISTA-DASLab, y lo que aporta este repositorio es una reorganización del layout de almacenamiento para el motor MoE con paginación bajo demanda (demand paging) de Betelgeuse, un fork propio de llama.cpp.

Su propósito es ejecutar un modelo sparse de escala frontera (con 24.576 expertos enrutados) en hardware muy modesto: una GPU con 12 GB de VRAM y 16 GB de RAM de sistema, con almacenamiento NVMe local. Los expertos residen en disco y se cargan en un pool de slots de VRAM solo cuando se necesitan, manteniendo residentes únicamente los pesos densos.

Es relevante como demostración de inferencia de MoE masivos en hardware de consumo, aunque el propio autor lo califica de experimental y parcialmente roto, en desarrollo activo. La licencia es qwen-community-license-1.0 (heredada del modelo base Qwen3.8-Flash-Next).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (transformer sparse con expertos enrutados, pesos densos de atención/recurrencia) |
| Parametros totales | no disponible (24.576 expertos enrutados; tamaño del repo: 71,8 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | 512 tokens en la configuración medida (`-c 512`); máximo del modelo base no disponible |
| Tipos de cuantizacion | IQ2_XS (GSQ-RCO, copiada sin cambios desde ISTA-DASLab) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (other) |
| Formato de pesos | GGUF (bundle de 4 ficheros: dense GGUF, experts.bin, PLE GGUF, profile binario) |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.8-Flash-Next, una arquitectura MoE con 24.576 expertos enrutados, pesos densos de atención y recurrencia, expertos compartidos, routers y una tabla de embeddings por capa respaldada en disco (PLE, per-layer n-gram embedding). No hay datos publicados en la model card sobre número de tokens de entrenamiento, composición del dataset ni etapas de RLHF/DPO del modelo base.

La innovación de este repositorio no está en el entrenamiento sino en el despliegue: Betelgeuse es un fork independiente de llama.cpp con un motor MoE de paginación bajo demanda. Los expertos se almacenan en `experts.bin` como blobs alineados a 4 KiB (layer-major y expert-major) y se leen con `io_uring` hacia un pool de slots de VRAM compartido entre capas, resolviendo los fallos de página mediante un "doorbell" CUDA en-stream. Los pesos densos permanecen residentes en GPU, las filas PLE se cargan por demanda y existe una caché de víctimas en host (8 GiB por defecto) dentro del límite de memoria del proceso. Se incluye un perfil de expertos calientes para sembrar los slots al arrancar, y el runtime soporta CUDA Graph replay.

## Capacidades

- Generación de texto (pipeline text-generation), sin proyector de visión ni sidecar MTP: este bundle es solo para texto.
- Arquitectura MoE con 24.576 expertos enrutados y expertos compartidos, heredada del modelo base.
- Servido vía API HTTP estilo completion (`/completion`) con `bel-server`, o uso interactivo con `bel-cli`.
- Control fino de warmup y paginación (slots de expertos, caché de víctimas, presupuesto de warmup hasta 8192 tokens).
- No compatible con llama.cpp estándar, Ollama ni LM Studio; requiere el fork Betelgeuse.

## Casos de uso

- Experimentación local de MoE a gran escala en GPU de consumo: permite cargar un modelo sparse con decenas de miles de expertos en una RTX 3060 de 12 GB, algo inviable con inferencia convencional.
- Investigación en paginación de pesos: el motor demand-paged de Betelgeuse es un banco de pruebas para estudiar tasas de acierto de expertos, tamaño de slots y costes de E/S en inferencia MoE.
- Prototipado de servidores de inferencia en edge: `bel-server` expone una API HTTP local en el puerto 8080 para integrar el modelo en aplicaciones locales.
- Pruebas de generación de texto con contexto corto (512 tokens en la configuración medida) en estaciones de trabajo con 16 GB de RAM.
- Benchmarking de E/S NVMe: el rendimiento depende fuertemente de las lecturas de `experts.bin` vía io_uring, lo que lo hace útil para medir cuellos de botella de almacenamiento en inferencia.
- Desarrollo sobre llama.cpp: los nombres de targets y librerías CMake se mantienen compatibles con upstream, facilitando portar mejoras del fork.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card menciona únicamente datos operativos: coste de arranque con warmup de unos 42 segundos, un contexto paginado y un slot de servidor por proceso en la configuración medida, y una advertencia de que el perfil de expertos no garantiza 22 tok/s en prompts arbitrarios (cifra mencionada sin contexto completo).

## Requisitos de hardware

- GPU con 12 GB de VRAM (objetivo de diseño); la release está compilada para RTX 3060 (arquitectura sm_86, CUDA).
- 16 GB de RAM de sistema, con la caché de víctimas en host limitada a 8 GiB por defecto dentro del proceso (ajustable con `MOE_CACHE_MIB`, desactivable con `MOE_VICTIM_CACHE=0`).
- Almacenamiento NVMe local para los 71,8 GB del bundle (lecturas demand-paged vía io_uring; el rendimiento depende de la E/S de disco).
- Linux x86-64, compilador C++17, CMake, CUDA y liburing para compilar el fork.
- Despliegue únicamente con los binarios `bel-cli` y `bel-server` del fork Betelgeuse (rama `betelgeuse`); no funciona con llama.cpp stock, Ollama, LM Studio ni TGI.
- Limitaciones operativas medidas: un contexto paginado y un slot de servidor por proceso; arranque de ~42 s con warmup opcional de hasta 256 tokens generados.
- No exponer el servidor de desarrollo a redes no confiables sin autenticación y revisión de despliegue.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Requisitos | Licencia | Compatibilidad |
|---|---|---|---|---|---|
| Betelgeuse-AI/Alpha-Orionis-XS | Reempaquetado IQ2_XS de Qwen3.8-Flash-Next (MoE, 24.576 expertos) | GGUF stripped (4 ficheros) | 12 GB VRAM + 16 GB RAM + NVMe | qwen-community-license-1.0 | Solo fork Betelgeuse |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF | Cuantización GGUF IQ2_XS del mismo modelo base | GGUF estándar | no disponible | qwen-community-license-1.0 | llama.cpp stock y derivados |
| Qwen/Qwen3.8-Flash-Next | Modelo base original | no disponible (pesos originales) | no disponible | qwen-community-license-1.0 | ecosistema estándar |

La diferencia clave es el runtime: Alpha-Orionis-XS sacrifica compatibilidad con el ecosistema estándar a cambio de ejecutar el modelo completo en hardware de 12 GB mediante paginación de expertos, mientras que la versión de ISTA-DASLab mantiene la compatibilidad con llama.cpp convencional.

## Limitaciones y advertencias

- Estado experimental: el propio autor lo describe como "parcialmente roto y en desarrollo activo"; se recomienda usar `bel-server` en lugar de `bel-cli`.
- Incompatible con llama.cpp stock, Ollama y LM Studio; requiere compilar el fork Betelgeuse en su rama específica.
- Sin proyector de visión ni sidecar MTP: solo generación de texto.
- Contexto muy limitado en la configuración medida (512 tokens) y un único slot de servidor por proceso.
- El perfil de expertos calientes no garantiza un rendimiento determinista: los tok/s varían según el prompt y la tasa de fallos de página.
- Arranque lento (~42 s con warmup); sin warmup, los primeros tokens sufren fallos de página de expertos.
- Datos de rendimiento (22 tok/s) citados sin contexto verificable; no hay benchmarks publicados del modelo base en esta ficha.
- Servidor de desarrollo sin autenticación: riesgo de seguridad si se expone a redes no confiables.
- Licencia qwen-community-license-1.0: revisar los términos del enlace QWEN-LICENSE antes de uso comercial (restricciones concretas no detalladas en la model card).
- Cero descargas registradas en Hugging Face en el momento de la ficha: falta de validación por parte de la comunidad.
- Sesgos, riesgo de alucinación y soporte de idiomas: no disponibles; heredan del modelo base Qwen3.8-Flash-Next, cuya model card no se incluye aquí.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Betelgeuse-AI/Alpha-Orionis-XS
- Licencia Qwen: https://huggingface.co/Betelgeuse-AI/Alpha-Orionis-XS/blob/main/QWEN-LICENSE
- Manifiesto del bundle: https://huggingface.co/Betelgeuse-AI/Alpha-Orionis-XS/blob/main/bundle-manifest.json
- Release original de cuantización (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF/tree/ed59f92082b1e93c0e96d60a8b11aab089b52f09/IQ2_XS
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- llama.cpp upstream: https://github.com/ggml-org/llama.cpp
