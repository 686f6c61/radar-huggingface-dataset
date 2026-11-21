# Grawnch/wv-runtime-binaries

## Resumen

`Grawnch/wv-runtime-binaries` no es un modelo de lenguaje, sino un repositorio de artefactos de infraestructura: librerías precompiladas en C-ABI (`.so` para `manylinux_2_28_x86_64` y `.dll` para `win_amd64`) junto con wheels de Python que actúan como auto-detector de plataforma y GPU. Según la model card, el paquete se distribuye como "WV Universal Runtime" versión `v1.0.0` y está orientado a ejecutar cargas de trabajo con arquitectura MoE (mixture of experts) sobre CUDA, con la particularidad declarada de ser "zero-source, zero-PTX, zero-spill", es decir, binarios precompilados sin generación de PTX en tiempo de ejecución y sin derrames de registros.

El repositorio expone un objeto `WvCoreLib` que detecta automáticamente Windows frente a Linux, identifica la capacidad de cómputo de la GPU (`sm_80` a `sm_120a`), descarga el binario correspondiente desde el propio repo, verifica su integridad mediante SHA-256 contra `bins/binary_manifest.json` y lo cachea localmente. La instalación se realiza con `pip install --no-deps` apuntando directamente al wheel del instalador, lo que sugiere un diseño deliberadamente autocontenido y sin dependencias externas declaradas.

Es relevante ahora porque propone una vía de despliegue de runtimes CUDA sin compilación en destino, algo útil en entornos con toolchains restringidos o GPUs muy recientes (incluye un preset `sm120a`). No obstante, el repositorio no contiene pesos de modelo, no declara idiomas soportados, no publica benchmarks y no ofrece información sobre parámetros, contexto o arquitectura del modelo que el runtime estaría destinado a servir.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (runtime CUDA para cargas MoE; el modelo servido no se especifica) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (el repo contiene binarios `.so`/`.dll` y wheels `.whl`, no pesos) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, por lo que no hay datos de entrenamiento, tokens procesados, composición de dataset ni fases de RLHF/DPO. El contenido del repositorio son artefactos de ejecución: diez binarios nativos (cinco por plataforma) con presets `all`, `sm120a`, `sm86`, `sm86_sm89` y `sm89`, con tamaños que van de 1,43 MiB a 8,84 MiB. Los binarios `all` son los más grandes (8,84 MiB en Linux, 8,28 MiB en Windows) y presumiblemente incluyen soporte multiarquitectura, mientras que los específicos por SM son más pequeños (por ejemplo, 2,10 MiB para `sm86` y `sm89` en Linux).

La innovación técnica declarada en la model card es la ausencia de PTX y de register spills, lo que en la práctica implica que el binario no requiere JIT de CUDA en el arranque y que el compilador asignó registros sin desbordar a memoria local. El detector `WvCoreLib` resuelve la plataforma, selecciona el preset según la SM de la GPU (`sm_80..sm_120a`), valida el hash SHA-256 y cachea el resultado. El repositorio incluye tres wheels: el instalador (`wv_runtime_installer-1.0.0-py3-none-any.whl`, 33,8 KB) y los dos wheels de plataforma (`win_amd64`, 1530,9 KB; `manylinux_2_28_x86_64`, 1724,5 KB).

## Capacidades

- Distribución de binarios CUDA precompilados para Linux (`manylinux_2_28_x86_64`) y Windows (`win_amd64`).
- Detección automática de plataforma y de capacidad de cómputo de GPU en el rango `sm_80` a `sm_120a`.
- Verificación de integridad de binarios mediante SHA-256 contra un manifiesto (`bins/binary_manifest.json`).
- Cacheado local del binario seleccionado tras la descarga.
- Exposición de una C-ABI estable desde Python mediante `WvCoreLib` (métodos `abi_version()` y `cuda_probe_device(0)` en el ejemplo de la model card).
- Soporte declarado para cargas de trabajo MoE (etiqueta `moe`), sin detallar el formato de pesos ni el modelo concreto.
- No se declaran capacidades de generación de texto, razonamiento, código, visión, tool calling, agentes ni multilingüismo.

## Casos de uso

- Despliegue en entornos con toolchain CUDA restringido: al no requerir compilación en destino ni generación de PTX, el runtime se puede instalar en contenedores o imágenes base sin `nvcc` ni CUDA Toolkit completo, reduciendo el tiempo de arranque y las dependencias del sistema.
- Inferencia en GPUs de gama reciente (por ejemplo, arquitecturas `sm_120a`): el preset específico permite aprovechar GPUs nuevas sin esperar a que el runtime se recompile para esa SM.
- Automatización de CI/CD para validación de kernels: el detector y la verificación SHA-256 permiten integrar una comprobación reproducible de que el binario descargado coincide con el publicado antes de ejecutar tests.
- Distribución interna de runtimes en flotas heterogéneas: con presets por SM (`sm86`, `sm89`, `sm86_sm89`, `sm120a`) se puede servir el binario más pequeño que corresponda a cada nodo, reduciendo el tamaño descargado frente al preset `all`.
- Servicio de inferencia MoE en producción: la etiqueta `moe` sugiere su uso como backend de ejecución para modelos de mezcla de expertos, aunque el repo no documenta qué modelos concretos soporta.
- Empaquetado de aplicaciones de escritorio en Windows: el wheel `win_amd64` y las DLL por SM permiten distribuir una aplicación Python que ejecute cargas CUDA sin exigir al usuario final un compilador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de latencia, throughput, tokens por segundo ni comparaciones con otros runtimes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del modelo MoE que se sirva, no especificado).
- GPU compatibles declaradas: capacidades de cómputo `sm_80` a `sm_120a` (cubre, entre otras, A100 en `sm_80`, H100 en `sm_90`, y GPUs con `sm_120a`).
- Presets de binario disponibles: `all`, `sm120a`, `sm86`, `sm86_sm89`, `sm89` para Linux y Windows.
- Cabe en GPU consumer: sí, en la medida en que existan presets para `sm86` (RTX 30xx) y `sm89` (RTX 40xx); el consumo de VRAM dependerá del modelo cargado, no del runtime.
- Opciones de despliegue: instalación vía `pip install --no-deps` del wheel instalador y uso desde Python con `WvCoreLib`. No se documenta integración con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Criterio | Grawnch/wv-runtime-binaries | llama.cpp (referencia) | vLLM (referencia) |
|---|---|---|---|
| Tipo de artefacto | Binarios CUDA + wheels Python | Runtime C/C++ con backend CUDA | Servidor de inferencia Python |
| Licencia | apache-2.0 | MIT | Apache-2.0 |
| Pesos incluidos | No | No | No |
| Soporte MoE | Declarado (etiqueta `moe`) | Sí | Sí |
| Compilación en destino | No (binarios precompilados) | Sí (build local o wheels) | Sí (instalación de paquetes) |
| Verificación SHA-256 integrada | Sí (`binary_manifest.json`) | No documentada en el repo | No documentada en el repo |
| Benchmarks publicados | No disponibles | Amplios en el ecosistema | Amplios en el ecosistema |

La comparación es orientativa: los datos de llama.cpp y vLLM no provienen de la información proporcionada y deben contrastarse en sus respectivos repositorios.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de lenguaje: no se pueden evaluar sesgos, alucinación, capacidades lingüísticas ni calidad de generación.
- No se especifica qué modelo o modelos MoE puede ejecutar el runtime, ni el formato de pesos que consume.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción ni validación por parte de la comunidad.
- El tamaño del repositorio figura como 0.0 GB pese a que la model card lista binarios de hasta 8,84 MiB; conviene verificar la integridad real de los artefactos antes de usarlos.
- La instalación se hace con `pip install --no-deps`, lo que evita la resolución de dependencias pero también traslada al usuario la responsabilidad de garantizar que el entorno las satisface.
- La licencia Apache-2.0 permite uso comercial, pero no cubre los modelos que se ejecuten sobre el runtime; cada modelo tendrá su propia licencia.
- Al ser binarios nativos precompilados, la superficie de auditoría es menor que la de un runtime compilado desde fuente; se recomienda revisar los hashes publicados y, si es posible, el código de origen (no incluido en el repo).
- No hay información sobre idiomas, contexto, cuantizaciones ni benchmarks, por lo que no es posible evaluar su idoneidad frente a alternativas consolidadas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Grawnch/wv-runtime-binaries
- Wheel instalador: https://huggingface.co/Grawnch/wv-runtime-binaries/resolve/main/wheels/wv_runtime_installer-1.0.0-py3-none-any.whl
- Manifiesto de binarios: `bins/binary_manifest.json` (ruta relativa dentro del repositorio)
- Paper, blog, repositorio de código fuente o demo: no disponibles en la información proporcionada.
