# ManniX-ITA/opencoti-llamafile

## Resumen

opencoti-llamafile es un motor de inferencia autocontenido en un único fichero ejecutable, desarrollado por ManniX-ITA a partir del proyecto opencoti. Se construye sobre la base de Mozilla-Ocho llamafile (a su vez derivado de llama.cpp) y añade una serie de parches propios orientados a exprimir el rendimiento en GPUs de consumo y a habilitar serving multi-sesión. No es un modelo de lenguaje, sino el runtime que ejecuta modelos GGUF.

El interés técnico está en las capacidades que añade sobre llama.cpp upstream: gestión avanzada de la residencia y cuantización de la caché KV (PolyKV, KVarN), una ventana deslizante de KV que permite mantener una caché mayor que la VRAM disponible, slots elásticos para servir varias sesiones con control de admisión y respuestas 429 con `Retry-After`, extensión de contexto largo mediante DCA, decodificación especulativa MTP y backends GPU tanto CUDA como Vulkan. El motor está afinado y validado específicamente para las familias Gemma-4 (objetivo principal) y Qwen (verificación).

El repositorio de Hugging Face aloja los artefactos binarios empaquetados (más de 2 GiB, por encima del límite de GitHub Releases), la serie completa de parches bajo `patches/` y la documentación bajo `docs/`. La licencia es Apache 2.0 y el tamaño del repositorio es de 223,4 GB, correspondiente a todas las variantes binarias y versiones archivadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Motor de inferencia (llamafile/llama.cpp con parches opencoti); no es un modelo |
| Parámetros totales | no disponible (el motor no tiene parámetros; ejecuta modelos GGUF externos) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo GGUF cargado; soporta extensión DCA para contextos largos) |
| Tipos de cuantización | no disponible de forma explícita; soporta GGUF en general y cuantización de caché KV (PolyKV, KVarN) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelos); binarios `.llamafile` / `.exe` como ejecutables |

## Arquitectura y entrenamiento

No aplica entrenamiento: opencoti-llamafile es un motor de inferencia, no un modelo con pesos entrenados. La arquitectura interna es la de llama.cpp/llamafile (ejecución de transformers y arquitecturas híbridas en GGUF), sobre la que se aplica una serie de parches que añaden: residencia y cuantización avanzada de la caché KV (PolyKV, KVarN), ventana deslizante de KV (caché mayor que VRAM), extensiones de contexto largo DCA, decodificación especulativa MTP, atención dispersa, duplicación de capas RYS y backends GPU CUDA y Vulkan.

El motor está específicamente afinado para dos familias. Para Gemma-4 (objetivo principal: 26B-A4B-128e MoE, densos 12B/31B y serie elástica E2B/E4B) incluye kernels para head_dim 256/512, doble caché iSWA (rolling-KV, SharedKVPool, DCA), MTP mediante drafters gemma4-assistant y MoE fusionado. Para Qwen (secundario/verificación: Qwen3.5/3.6 densos, MoE e híbridos gated-delta-net, Qwen2.5-14B-1M) incluye kernels head_dim 128, NextN self-spec MTP y DCA sobre modelos de clase 1M. Otras arquitecturas funcionan con el comportamiento upstream, con las features opencoti en fallback seguro o sin validar.

## Capacidades

- Ejecución de modelos GGUF en CPU y GPU con backends CUDA 13 (sm_75/80/86/89/90/120), CUDA 12 legacy (sm_52/61/70) y Vulkan (AMD, Intel, NVIDIA).
- Serving multi-sesión con slots elásticos y puerta de admisión de KV que devuelve 429 con `Retry-After`.
- Caché KV mayor que la VRAM mediante ventana deslizante de KV.
- Cuantización de caché KV (PolyKV, KVarN) y pools de prefijo compartido con plano de control REST.
- Extensión de contexto largo (DCA) y decodificación especulativa MTP.
- Atención dispersa y duplicación de capas RYS.
- API de introspección y control en tiempo de ejecución.
- Modo servidor (`--server --port`) y CLI de chat interactivo.
- Soporte de sidecars de códec/speech (directorio `media`).
- Ejecución nativa en x86_64 y aarch64 sobre Linux, Windows, macOS y BSD.

## Casos de uso

- Despliegue de LLM en estaciones de trabajo con GPU de consumo: el binario universal incluye CUDA y Vulkan, de modo que un solo fichero sirve para Windows y Linux sin instalar CUDA Toolkit ni MSVC; basta el driver.
- Serving multi-usuario en una sola GPU: los slots elásticos y la puerta de admisión de KV con 429 + `Retry-After` permiten atender varias sesiones concurrentes sin sobrecargar la VRAM.
- Contextos largos en hardware limitado: la ventana deslizante de KV y DCA permiten trabajar con cachés que exceden la VRAM, útil para documentos extensos o conversaciones multi-turno largas.
- Inferencia acelerada de Gemma-4 y Qwen: los kernels y el MTP afinados para estas familias reducen la latencia en decodificación especulativa sobre los modelos objetivo.
- Distribución de herramientas de IA en entornos restringidos: al ser un único ejecutable autocontenido con las librerías GPU embebidas, simplifica el despliegue en máquinas sin permisos de instalación.
- Integración con pinning por sha256: la forma dividida (`components/` y ficheros `pin/`) permite fijar cada componente por hash en pipelines de integración.
- Ejecución en ARM (DGX Spark GB10, Jetson Thor) mediante el binario aarch64 con CUDA 13 sbsa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del modelo GGUF cargado y de la cuantización; el motor no fija un mínimo).
- GPU recomendadas: NVIDIA sm_75/80/86/89/90/120 con CUDA 13; Maxwell/Pascal/Volta con el binario CUDA 12 legacy; AMD e Intel vía Vulkan; aarch64 con CUDA 13 sbsa (sm_110/sm_121).
- Cabe en consumer GPU: sí, mediante Vulkan o CUDA según la tarjeta; el binario universal cubre tarjetas modernas y el binario `win-x86_64-gpu-cuda12` cubre tarjetas anteriores a sm_75.
- Opciones de despliegue: el propio `.llamafile` (modo servidor o CLI), con librerías GPU embebidas; forma dividida con `components/` y `pin/` para integraciones.
- Latencia y throughput: no disponibles.
- Espacio en disco: el ejecutable universal ocupa ~1,7 GB; el de Windows ~0,9 GB; el CUDA 12 legacy ~0,45 GB; el Linux x86_64 ~1,2 GB; el aarch64 ~0,47 GB; el motor "bare" ~135 MB. En el primer arranque con GPU se extrae la librería junto al ejecutable (~0,7 GB para CUDA en Windows).

## Comparativa con modelos similares

| Motor | Base | Backends GPU | Features destacadas | Licencia |
|---|---|---|---|---|
| opencoti-llamafile | llamafile/llama.cpp + parches | CUDA 13, CUDA 12 legacy, Vulkan, Metal | PolyKV, KVarN, ventana KV, slots elásticos, DCA, MTP | Apache 2.0 |
| llamafile (Mozilla-Ocho) | llama.cpp | CUDA, Metal, Vulkan | Ejecutable único autocontenido | Apache 2.0 |
| llama.cpp | propio | CUDA, Metal, Vulkan, ROCm | Referencia GGUF, amplio soporte de arquitecturas | MIT |
| Ollama | llama.cpp | CUDA, Metal, ROCm | Gestión de modelos y API sencilla | MIT |

## Limitaciones y advertencias

- No es un modelo: no genera texto por sí mismo; requiere cargar un GGUF externo.
- El conjunto de features opencoti solo está validado en Gemma-4 y Qwen; en otras arquitecturas cae a comportamiento upstream o queda sin validar.
- El repositorio ocupa 223,4 GB y los binarios son grandes (hasta ~1,7 GB); la descarga y el almacenamiento requieren planificación.
- En el primer arranque con GPU se extrae la librería junto al ejecutable; si la carpeta no es escribible se usa el home del usuario, lo que puede sorprender en entornos gestionados.
- Windows rechaza ejecutables de más de 4 GiB; las librerías se compilan comprimidas para evitarlo.
- Idiomas soportados no disponibles (dependen del modelo cargado).
- Riesgo de alucinación y sesgos: dependen del modelo GGUF utilizado, no del motor.
- Licencia Apache 2.0 permite uso comercial del motor; verificar la licencia del modelo GGUF cargado por separado.
- Documentación de divergencias respecto a upstream concentrada en `USAGE.md`; conviene leerla antes de confiar en una feature opencoti en producción.

## Enlaces

- Hugging Face: https://huggingface.co/ManniX-ITA/opencoti-llamafile
- Repositorio GitHub del proyecto: https://github.com/mann1x/opencoti
- Releases en GitHub: https://github.com/mann1x/opencoti/releases
- Base llamafile (Mozilla-Ocho): https://github.com/Mozilla-Ocho/llamafile
- Documentación de KVarN: `docs/features/kvarn.md` (dentro del repo)
- Guía de uso y divergencias: `USAGE.md` (dentro del repo)
- Drafters gemma4-assistant: https://huggingface.co/ManniX-ITA
