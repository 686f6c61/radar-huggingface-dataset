# elyanlabs/ollama-dual-arch-amd

## Resumen

`elyanlabs/ollama-dual-arch-amd` no es un modelo de lenguaje: es una instantánea del código fuente de un repositorio (github.com/Scottcjn/ollama-dual-arch-amd, con historial completo en GitLab) que contiene los scripts, parches y Dockerfiles necesarios para compilar un runtime de ollama capaz de ejecutar una única instancia sobre dos GPUs AMD de arquitecturas incompatibles entre sí. El problema que resuelve es concreto: AMD eliminó `gfx906` (MI50, MI60, Radeon VII) de ROCm a partir de la versión 6.3, y ollama dejó de soportarla tras la 0.12.3, de modo que las soluciones de la comunidad para revivir una MI50 fuerzan `HSA_OVERRIDE_GFX_VERSION=9.0.6`, lo que excluye cualquier tarjeta moderna presente en la misma máquina.

La aportación del repositorio es pequeña y aditiva: compilar con `-DAMDGPU_TARGETS="gfx906;gfx1200"`, eliminar el override global y sustituirlo por `OLLAMA_SCHED_SPREAD=1`, manteniendo el parche `SOLVE_TRI` que fuerza ese operador a CPU. Con ello, una MI50 (16 GB HBM2) y una RX 9060 XT (16 GB GDDR6) exponen unos 32 GB de VRAM combinada y reparten un modelo de 32B entre ambas.

Es relevante ahora porque permite reutilizar hardware AMD descatalogado junto a tarjetas RDNA4 actuales en un solo host, con cifras verificadas por el autor: 16,6 tok/s de generación con qwen2.5:32B Q4_K_M, 8K de contexto y el 100 % de las capas en GPU. No incluye pesos, tokenizador ni dataset: el contenido es exclusivamente código (AGPL-3.0) y los pesos los aporta el modelo servido a través de ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica: no es un modelo de pesos, es un runtime de inferencia (build de ollama sobre ROCm) |
| Parametros totales | no disponible (el artefacto no contiene pesos) |
| Parametros activos | no disponible (no es MoE ni un modelo) |
| Longitud de contexto | no disponible (la fija el modelo servido; el benchmark se realizó con 8K) |
| Tipos de cuantizacion | no define ninguna propia; hereda las de ollama/GGUF (probado con Q4_K_M) |
| Idiomas soportados | no disponible (depende del modelo servido) |
| Licencia | AGPL-3.0 |
| Formato de pesos | no aplica: solo código fuente, scripts de build y Dockerfile; los pesos se sirven en formato ollama/GGUF |
| Arquitecturas GPU soportadas | gfx906 (MI50/MI60/Radeon VII) y gfx1200 (RDNA4, RX 9060 XT); otras parejas vía `ARCHS`, sin probar |
| Version base de ollama | v0.18.2, compilada desde fuente |
| Stack ROCm | runtime ROCm 7.1 con Tensile de gfx906 procedente de ROCm 6.3 superpuesto |
| Repositorio de origen | github.com/Scottcjn/ollama-dual-arch-amd (espejo con historial en gitlab.com/elyan-labs/ollama-dual-arch-amd) |
| Metricas del repositorio | 0 descargas, 0 likes, creado y actualizado el 2026-10-23 |

## Arquitectura y entrenamiento

No hay arquitectura de red ni entrenamiento que describir: el artefacto es una receta de compilación. Parte del build de MTLoser / Dawson Reed (ollama v0.18.2 sobre ROCm) y de la aproximación de xxDoman (runtime ROCm 7.1 con Tensile de ROCm 6.3), y añade dos cambios: compilar el backend AMDGPU para ambas arquitecturas a la vez y retirar `HSA_OVERRIDE_GFX_VERSION=9.0.6` del Dockerfile de runtime, sustituyéndolo por `OLLAMA_SCHED_SPREAD=1` para que cada tarjeta use su arquitectura nativa y las capas se repartan entre ambas GPUs. El resultado es un único `rocblas` con las dos arquitecturas presentes.

El parche `SOLVE_TRI` se conserva: fuerza ese operador a ejecutarse en CPU para todas las arquitecturas, algo que el autor describe como inofensivo y rara vez alcanzado en inferencia (con 8K de contexto la generación es 100 % GPU). Además, el repositorio documenta dos obstáculos de plataforma: (1) el kernel 6.8 de Ubuntu 24.04 no tiene entrada de dispositivo para Navi 44 (`1002:7590`), lo que se resuelve instalando solo el módulo de kernel `amdgpu-dkms` de ROCm 6.4.2 (`--usecase=dkms`, módulo 6.12.12) sin tocar el espacio de usuario de gfx906; y (2) ninguna versión de ollama empaquetada sirve ambas arquitecturas, porque injertar Tensile de gfx906 en ROCm 7 provoca un segfault en la primera GEMM de gfx906.

## Capacidades

- Compilar un runtime de ollama que enumera simultáneamente `compute=gfx906 (MI50, 16 GiB)` y `compute=gfx1200 (RX 9060 XT, 15,9 GiB)`.
- Repartir un único modelo entre dos GPUs de arquitecturas distintas mediante `OLLAMA_SCHED_SPREAD=1`, con reparto visible en `ollama ps`.
- Servir modelos de hasta 32B en cuantización Q4_K_M (~20 GB) sobre ~32 GB de VRAM combinada, sin spill a CPU en el caso medido.
- Ejecutar la API de ollama en el puerto 11434 dentro de un contenedor con acceso a `/dev/kfd` y `/dev/dri`.
- Parametrizar la pareja de arquitecturas mediante `ARCHS` (por ejemplo `"gfx906;gfx1100"`), aunque solo la combinación por defecto está probada.
- Automatizar el proceso completo con `build_dual_arch.sh`, que clona la base, aplica los parches y construye la imagen `ollama-dual`.
- No incluye capacitación multimodal, tool calling, agentes ni modo thinking propios: esas capacidades, si existen, pertenecen al modelo servido.

## Casos de uso

- Reutilización de una MI50 en una estación con GPU RDNA4: permite sumar los 16 GB HBM2 de la MI50 a los 16 GB de una RX 9060 XT en lugar de descartar la tarjeta antigua, obteniendo ~32 GB de VRAM para un solo modelo.
- Servicio local de modelos de 32B en Q4_K_M: con qwen2.5:32B el sistema sostiene 16,6 tok/s de generación y 174,5 tok/s de evaluación de prompt, suficiente para asistentes de código o chat interno con 8K de contexto.
- Laboratorios con parque heterogéneo: un único host puede mezclar aceleradores de generaciones distintas sin mantener dos nodos de inferencia ni duplicar modelos en disco.
- Contenedores de inferencia compatibles con el ecosistema ollama: al mantener la API estándar en el puerto 11434, los clientes y scripts existentes siguen funcionando sobre hardware AMD mixto.
- Validación de builds multi-arch en CI: `build_dual_arch.sh` permite reproducir la compilación de forma determinista y comprobar la enumeración de ambas arquitecturas antes de desplegar.
- Formación y depuración de ROCm: el repositorio documenta el diagnóstico (`lspci -k` sin driver, `rocm-smi`, `ollama ps`) y sirve como caso de estudio reproducible de convivencia entre Tensile de distintas versiones.
- Prototipado con cuantizaciones GGUF: al heredar el soporte de ollama, se pueden probar distintos niveles de cuantización ajustando el modelo servido, con la VRAM por tarjeta como restricción principal (11,7 GB por tarjeta en el caso medido).

## Benchmarks y rendimiento

Los únicos datos publicados son los contadores de evaluación de ollama para qwen2.5:32B Q4_K_M (~20 GB) repartido entre MI50 (gfx906) y RX 9060 XT (gfx1200), con 8K de contexto:

| Metrica | Resultado |
|---|---|
| Generacion | 16,6 tok/s (128 tokens en 7,69 s) |
| Evaluacion de prompt | 174,5 tok/s (48 tokens en 0,28 s) |
| Capas en GPU | 100 % (65 capas, sin spill a CPU) |
| VRAM por tarjeta | 11,7 GB (dato truncado en la informacion disponible) |
| Modelo y cuantizacion | qwen2.5:32B Q4_K_M |
| Contexto | 8K |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no procede: el artefacto no es un modelo evaluable, sino infraestructura de inferencia. Tampoco hay medidas de latencia por token, throughput agregado con concurrencia ni consumo energético.

## Requisitos de hardware

- GPUs: una MI50 (gfx906, 16 GB HBM2) y una RX 9060 XT (gfx1200, 16 GB GDDR6); ~32 GB de VRAM combinada según el autor.
- VRAM estimada en el caso medido: 11,7 GB por tarjeta con qwen2.5:32B Q4_K_M a 8K de contexto; para modelos mayores hay que reducir cuantización o contexto.
- Sistema operativo: Ubuntu 24.04 con kernel 6.8 de origen; requiere `amdgpu-dkms` de ROCm 6.4.2 (módulo 6.12.12) para que Navi 44 tenga driver. No se documentan otras distribuciones.
- Ajuste de arranque: `iommu=pt` recomendado por la documentación de requisitos de ROCm para sistemas multi-GPU; el autor no verificó si estaba activo en su máquina de pruebas.
- Despliegue: Docker con `--device=/dev/kfd`, `--device-cgroup-rule='c 226:* rmw'` y `-v /dev/dri:/dev/dri`, más `OLLAMA_SCHED_SPREAD=1` y `OLLAMA_MODELS` apuntando a un volumen.
- Alternativas de despliegue (vLLM, llama.cpp, TGI, Ollama nativo sin parchear): no disponibles en la información proporcionada; el repositorio es específico de ollama.
- Throughput y latencia: 16,6 tok/s de generación y 174,5 tok/s de prompt eval en el caso medido; no hay datos de concurrencia ni de escalado.

## Comparativa con modelos similares

La comparación pertinente es con otras vías de ejecución sobre AMD, no con modelos lingüísticos:

| Alternativa | Arquitecturas soportadas | Multi-GPU mixto | Override necesario | Licencia | Estado |
|---|---|---|---|---|---|
| elyanlabs/ollama-dual-arch-amd | gfx906 + gfx1200 en un mismo runtime | Si, via `OLLAMA_SCHED_SPREAD=1` | No | AGPL-3.0 | Publicado; 0 descargas, sin validacion independiente |
| ollama 0.12.3 (stock) | gfx906 nativo, sin gfx1200 | No | No | MIT (upstream) | La GPU RDNA4 queda invisible |
| ollama 0.32.5 (stock) | gfx1200 nativo, sin gfx906 | No | No | MIT (upstream) | La MI50 queda fuera |
| Builds comunitarios gfx906 (xxDoman, MTLoser) | gfx906 unicamente | No | Si, `HSA_OVERRIDE_GFX_VERSION=9.0.6` | Segun repositorio de origen | Excluyen tarjetas modernas de la misma maquina |

## Limitaciones y advertencias

- Licencia AGPL-3.0: el uso en red del software derivado obliga a ofrecer el código fuente correspondiente; conviene revisar el impacto antes de integrarlo en un servicio comercial.
- Cobertura de pruebas mínima: el autor solo valida la pareja gfx906 + gfx1200; otras combinaciones (`ARCHS="gfx906;gfx1100"`) están declaradas pero no probadas.
- Dependencia frágil de versiones: el resultado depende de superponer Tensile de ROCm 6.3 sobre un runtime ROCm 7.1 y de un parche manual en `ggml-cuda.cu`; una actualización de ROCm u ollama puede romper el build.
- Sin validación independiente: 0 descargas y 0 likes en Hugging Face, y el propio autor deja mediciones pendientes (por ejemplo, la comprobación de `iommu=pt`).
- El parche `SOLVE_TRI` desvía ese operador a CPU en todas las arquitecturas, con el coste de rendimiento que ello implique si se alcanza.
- Sin el parche, injertar Tensile de gfx906 en ROCm 7 provoca segfault en la primera GEMM de gfx906; no es una configuración tolerante a errores.
- Requiere Docker, kernel con `amdgpu-dkms` de ROCm 6.4.2 y Ubuntu 24.04; no hay soporte documentado para otras plataformas ni para Windows.
- El dato de VRAM por tarjeta aparece truncado en la información disponible (11,7 GB, "(90…"), por lo que no se puede confirmar el porcentaje de ocupación.
- El repositorio de Hugging Face es una instantánea de código sin historial; para trazabilidad hay que acudir al espejo de GitLab.
- No hay datos sobre sesgos, alucinación o calidad lingüística: dependen íntegramente del modelo servido y de su cuantización.

## Enlaces

- Hugging Face: https://huggingface.co/elyanlabs/ollama-dual-arch-amd
- Repositorio de origen en GitHub: https://github.com/Scottcjn/ollama-dual-arch-amd
- Espejo con historial completo en GitLab: https://gitlab.com/elyan-labs/ollama-dual-arch-amd
- Base de MTLoser / Dawson Reed (build v0.18.2 + parche SOLVE_TRI): https://github.com/MTLoser/ollama-mi50-rocm71-build
- Aproximación de xxDoman (runtime ROCm 7.1 + Tensile ROCm 6.3): https://github.com/xxDoman
- Instalador de `amdgpu-dkms` de ROCm 6.4.2 citado en la model card: https://repo.radeon.com/amdgpu-install/6.4.2/ubuntu/noble/amdgpu-install_6.4.60402-1_all.deb
- Documentación de requisitos de sistema de ROCm (flag `iommu=pt`): URL no disponible en la información proporcionada
- Paper, blog o demo adicionales: no disponibles
