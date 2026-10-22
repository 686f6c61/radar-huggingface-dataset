# elyanlabs/nemotron-twotower-cpu

## Resumen

`elyanlabs/nemotron-twotower-cpu` no es un modelo nuevo, sino un port de código que permite ejecutar en CPU el modelo de difusión de NVIDIA `nvidia/Nemotron-Labs-TwoTower-30B-A3B-Base-BF16`. El repositorio original depende de forma dura de `mamba_ssm` y `causal_conv1d`, dos paquetes implementados con kernels Triton/CUDA que lo hacen inejecutable en cualquier máquina sin GPU NVIDIA (Apple Silicon, IBM POWER, servidores sin GPU). Este snapshot sustituye esa dependencia por un shim en PyTorch puro y aplica una serie de parches de una línea a una ruta de código de CPU que NVIDIA nunca probó, de modo que el modelo pasa a ejecutarse en cualquier plataforma donde corra PyTorch.

El modelo subyacente es un LM de difusión con arquitectura híbrida Mamba-2/atención (familia Nemotron-H), organizado en dos torres y con mezcla de expertos (MoE): la nomenclatura del modelo base indica 30B parámetros totales y 3B activos por torre, hasta un total de aproximadamente 60B en bf16. El port está verificado en un IBM POWER8 S824 (`ppc64le`), donde ejecuta el modelo completo de 60B con generación autoregresiva y en modo *mask-diffusion*, y en un Apple M2 (`arm64`), donde el shim de kernels es bit-exacto (error `0.00e+00`).

La relevancia del proyecto es acotada pero clara: no busca rendimiento, sino alcance. Su objetivo declarado es servir como profesor de destilación offline en hardware sin GPU, generando un corpus que luego se destila en un estudiante pequeño (1-3B) capaz de correr rápido en las mismas máquinas ARM/NEON. La generación es muy lenta —decenas de minutos para una completación corta— y requiere unos 120 GB de RAM para el modelo completo en bf16. El código del repositorio se publica bajo AGPL-3.0, mientras que los pesos quedan sujetos a la licencia de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-2 + atención (familia Nemotron-H), LM de difusión con dos torres y mezcla de expertos (MoE) |
| Parametros totales | ~60B en total (dos torres; el modelo base se denomina 30B-A3B y se distribuye en bf16) |
| Parametros activos | 3B (según nomenclatura A3B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (el repositorio no documenta otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | AGPL-3.0 para el código del port; los pesos se rigen por la licencia de NVIDIA (ver `NOTICE.md`) |
| Formato de pesos | safetensors en bf16 (pesos del modelo base de NVIDIA; este repositorio solo contiene código) |

## Arquitectura y entrenamiento

El modelo base es un LM de difusión construido sobre una arquitectura híbrida Mamba-2/atención de NVIDIA (Nemotron-H), con capas MoE y dos torres diferenciadas: una torre de contexto congelada y un denoiser de *mask-diffusion*. El flujo de inferencia puede operar en modo autoregresivo clásico o en modo *mask-diffusion*, en el que el texto se genera mediante un proceso iterativo de denoising medido en NFE (*number of function evaluations*). El forward utiliza *gated group-RMSNorm*, un escaneo SSD de Mamba-2 y convoluciones causales depthwise; estas dos últimas son precisamente las que en la versión oficial se delegan a kernels CUDA/Triton.

Este repositorio no entrena ni ajusta nada: es un port de inferencia. Aporta tres piezas: (1) `mamba_shim/`, un paquete en PyTorch puro que reimplementa `mamba_ssm` y `causal_conv1d` como código ATen portable, con el escaneo SSD en forma *segsum* verificado bit-exacto frente a una referencia ingenua; (2) un parche `modeling_nemotron_h.cpu.patch` con seis correcciones de una línea sobre `HybridMambaAttentionDynamicCache`, que almacena `conv_states`/`ssm_states` como listas de tensores por capa pero en `torch_forward` llama a `.device` y `.zero_()` sobre la lista en vez de sobre `[layer_idx]` —bugs latentes que nunca se disparan en CUDA porque la ruta rápida omite `torch_forward`; y (3) un parche a `inference.py` que sustituye el `.cuda()` fijo por CPU. No se documentan en la información disponible datos de entrenamiento (número de tokens, composición del dataset, RLHF/DPO), que corresponden íntegramente al modelo original de NVIDIA.

## Capacidades

- Generación de texto en modo autoregresivo estándar.
- Generación en modo *mask-diffusion*: difusión de lenguaje con denoising iterativo controlado por `--max-new-tokens` y NFE.
- Mezcla de expertos con 3B parámetros activos por token sobre un total de ~60B.
- Ejecución en CPU sin CUDA en `x86_64`, `arm64` y `ppc64le`; también con MPS disponible en Apple Silicon.
- Verificación de kernels incluida (`verify_kernels.py`, `pytest tests/`) para comprobar corrección numérica en cada arquitectura.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: no documentadas.
- Capacidades de visión o audio: no documentadas.
- No se documenta un modo *thinking* ni decodificación especulativa.

## Casos de uso

- Profesor de destilación offline: el caso de uso central declarado por el autor. Se ejecuta el modelo completo en CPU para generar en segundo plano un corpus de destilación, que después se usa para entrenar un estudiante de 1-3B que correrá rápido en portátiles, Macs, teléfonos y Raspberry Pi.
- Inferencia en hardware sin GPU NVIDIA: máquinas IBM POWER (`ppc64le`), servidores ARM y equipos sin tarjeta gráfica que de otro modo no podrían ejecutar el modelo por la dependencia de `mamba_ssm`/`causal_conv1d`.
- Investigación sobre LM de difusión en entornos no-CUDA: permite estudiar el comportamiento de *mask-diffusion* y del denoiser de dos torres en arquitecturas donde la versión oficial no arranca.
- Generación por lotes en clústeres de CPU: al no requerir GPU, se puede encolar la generación de un corpus grande en máquinas de propósito general durante horas, aceptando la latencia alta a cambio de no consumir GPU.
- Reproducibilidad en arquitecturas no soportadas: validar resultados del modelo base en `ppc64le` o `arm64`, con el shim verificado bit-exacto frente a referencias independientes.
- Docencia y experimentación: ejecutar un LM de difusión de 60B en un servidor sin GPU para demostrar el funcionamiento de MoE, Mamba-2 y difusión de lenguaje sin depender de hardware especializado.
- Base para un port más rápido: el repositorio incluye la hoja de ruta técnica (forward de CPU multihilo/fusionado) para quien quiera convertir este port de corrección en uno de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio únicamente aporta métricas de corrección y de velocidad cualitativa: el shim de kernels es bit-exacto en `arm64` (error `0.00e+00` frente a referencia) y la generación completa en POWER8 tarda "decenas de minutos" para una completación corta. En el perfilado realizado, el proceso usa aproximadamente 3 de 24 hilos disponibles, y el cuello de botella no es el escaneo SSD (totalmente vectorizado) sino el forward general de CPU: muchas operaciones pequeñas de MoE y por capa que no saturan los núcleos, más la ruta `torch_forward` de `transformers` en la torre de contexto congelada, que este repositorio no modifica.

## Requisitos de hardware

- RAM: ~120 GB para el modelo completo de 60B en bf16 (ambas torres). No cabe en máquinas más pequeñas; el autor indica explícitamente que un equipo de 24 GB es un host para el estudiante, no para el profesor.
- GPU: ninguna. El port está diseñado para CPU sin CUDA; `CUDA_VISIBLE_DEVICES=""`. También funciona con MPS en Apple Silicon.
- Arquitecturas verificadas: IBM POWER8 S824 (`ppc64le`, modelo completo con AR y mask-diffusion) y Apple M2 Mac mini (`arm64`, shim bit-exacto). `x86_64` es objetivo declarado y las referencias del escaneo SSD se validan también en esa arquitectura.
- Cabe en consumer GPU: no aplica; el modelo no está pensado para GPU de consumo y en bf16 ocupa ~120 GB.
- Despliegue: PyTorch + `transformers >= 4.48`, `einops`, `safetensors`, `accelerate`. Se ejecuta con `python inference_cpu.py` y el shim en `PYTHONPATH`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no medidos formalmente. Cualitativamente, decenas de minutos por completación corta en POWER8; el uso de hilos es bajo (~3 de 24), por lo que no es un port de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Requiere GPU NVIDIA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| elyanlabs/nemotron-twotower-cpu (este repo) | ~60B totales (2 torres), 3B activos | no disponible | No (CPU, `x86_64`/`arm64`/`ppc64le`) | AGPL-3.0 (código); pesos bajo licencia NVIDIA | HuggingFace, GitHub, GitLab |
| nvidia/Nemotron-Labs-TwoTower-30B-A3B-Base-BF16 | 30B-A3B por torre | no disponible | Sí (kernels CUDA/Triton obligatorios) | Licencia NVIDIA | HuggingFace |
| Ports de CPU de LM de difusión comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se conocen en la información proporcionada otros ports de CPU del mismo modelo ni alternativas equivalentes de difusión de lenguaje ejecutables sin CUDA con las que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Rendimiento: es un port de corrección, no de velocidad. La generación tarda decenas de minutos para una completación corta y no es apta para uso interactivo.
- Memoria: requiere ~120 GB de RAM para el modelo completo en bf16; no es viable en equipos de consumo.
- Cuantización: solo se documenta bf16; no hay pesos GGUF ni cuantizados para reducir memoria.
- Licencia: el código del port es AGPL-3.0, con las obligaciones de copyleft que ello implica para uso comercial o distribución; los pesos se rigen por la licencia de NVIDIA, que debe revisarse por separado (`NOTICE.md`). El uso comercial combinado requiere evaluar ambas licencias.
- Estabilidad del código: los parches corrigen bugs latentes de una ruta de CPU no probada por NVIDIA; dependen de la estructura interna de `modeling_nemotron_h.py` y pueden romperse con actualizaciones del modelo base o de `transformers`.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la ficha, sin validación comunitaria más allá de las pruebas del autor en dos máquinas.
- Idiomas: no se documenta qué idiomas soporta el modelo base ni su cobertura multilingüe.
- Sesgos y alucinación: no se documentan evaluaciones de sesgo ni de tasa de alucinación para el modelo base; al ser un LM generativo, cabe esperar el riesgo habitual, no cuantificado aquí.
- Capacidades no verificadas: no hay información sobre tool calling, agentes, visión, audio ni modo *thinking*; no deben asumirse.
- Contexto: la longitud de contexto no está disponible en la información proporcionada.

## Enlaces

- HuggingFace: https://huggingface.co/elyanlabs/nemotron-twotower-cpu
- GitHub (fuente original): https://github.com/Scottcjn/nemotron-twotower-cpu
- GitLab (historial completo): https://gitlab.com/elyan-labs/nemotron-twotower-cpu
- Modelo base de NVIDIA: https://huggingface.co/nvidia/Nemotron-Labs-TwoTower-30B-A3B-Base-BF16
