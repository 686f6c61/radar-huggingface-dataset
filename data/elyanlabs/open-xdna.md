# elyanlabs/open-xdna

## Resumen

`elyanlabs/open-xdna` no es un modelo de lenguaje: es una instantanea del codigo fuente del proyecto [github.com/Scottcjn/open-xdna](https://github.com/Scottcjn/open-xdna) (con historial completo en GitLab), un stack de bring-up que permite ejecutar cargas de IA sobre la NPU XDNA1 de AMD —generaciones "Phoenix" y "Hawk Point", integradas en millones de portatiles Ryzen 7040 y 8040— bajo Linux y con componentes 100 % de codigo abierto (XRT, driver y firmware). El repositorio no contiene pesos ni se ejecuta en la infraestructura de Hugging Face.

El problema que aborda es concreto: las pilas que habitualmente se citan para "LLMs en la NPU Ryzen AI", FastFlowLM y AMD Lemonade, solo soportan XDNA2. Para los propietarios de un Ryzen 7040/8040, la respuesta oficial de AMD en Linux es que la NPU "no esta disponible" y que se use la GPU. Este proyecto documenta y automatiza los cuatro ajustes no documentados en conjunto (instalacion de `libxrt_driver_xdna.so`, carga del `amdxdna.ko` de staging, `llvm-objcopy` en el `PATH` y firmware emparejado) que permiten compilar y ejecutar kernels vectoriales propios en la ISA AIE2 del silicio de primera generacion.

La relevancia es practica para investigacion en inferencia en el borde: el proyecto publica mediciones sobre un Ryzen 7 8845HS real, incluyendo un matmul int16 de 512³ a ~68 GFLOPS, un forward pass de un MLP de 2 capas bit-exacto, tecnicas de poda no bijunctiva con ganancias medidas de 1,6× en FFN y 4× en KV de atencion, y un pipeline de vision clasico ejecutado en la NPU. La licencia es AGPL-3.0 con opcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo neuronal: stack de compilacion y runtime para la NPU AMD XDNA1 (ISA vectorial AIE2, array 6x5), construido sobre IRON/mlir-aie y el compilador Peano |
| Parametros totales | no disponible (no contiene pesos) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (depende del modelo que se porte) |
| Tipos de cuantizacion | int16 para matmul en NPU; bfloat16 en los kernels vectoriales AIE (`aie::vector<bfloat16,32>`); sin esquema de cuantizacion de pesos publicado |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | AGPL-3.0, con opcion de licencia comercial indicada en el propio repositorio |
| Formato de pesos | no aplica; se distribuye como codigo fuente (C++ para kernels AIE, Python para ejemplos y scripts de despliegue) |
| Hardware objetivo | NPU AMD XDNA1 (RyzenAI-npu1, `aie2`, 6x5), Ryzen 7040 / 8040 ("Phoenix" / "Hawk Point") |
| Entorno de referencia | Ubuntu 25.10, kernel 6.17, GCC 15, firmware NPU 1.5.5.391 |
| Certificacion | BCOS Certified |
| Descargas / likes en Hugging Face | 0 / 0 |
| Fecha de publicacion | 2026-10-23 |

## Arquitectura y entrenamiento

El proyecto no entrena ningun modelo. Lo que aporta es una cadena de herramientas completa para llevar kernels propios hasta la NPU: XRT y driver `amdxdna` de codigo abierto, firmware emparejado, y la via de compilacion IRON/mlir-aie con Peano para generar binarios AIE2. Los kernels se escriben a mano contra la ISA vectorial de AIE2, que el autor describe como la misma clase de primitivas que AltiVec/VSX de PowerPC con mnemonicos nuevos; el repositorio incluye `docs/ALTIVEC_TO_AIE.md` con el mapeo completo del vocabulario para portar kernels SIMD existentes.

Tecnicamente, lo mas destacable es la implementacion de la poda no bijunctiva ("collapse": keep-strong / prune-weak) directamente en la NPU. El kernel manual usa `aie::load_v<32>`, `aie::ge` para generar la mascara, `aie::select` para conservar o anular y `aie::store_v`; posteriormente se fusionan `reduce_max`, el umbral dinamico τ y la compactacion en un unico kernel AIE, y se demuestra `aie::reverse` (vec_perm / shuffle) sobre el array. Sobre esa base se miden dos aplicaciones reales: poda del FFN antes del `down_proj` denso y expulsion de claves de baja masa en el KV de atencion. No hay datos publicados sobre datasets de entrenamiento, RLHF o DPO porque no existe fase de entrenamiento.

## Capacidades

- Ejecucion de matmuls int16 en la NPU; medido un 512³ a ~68 GFLOPS en un Ryzen 7 8845HS.
- Forward pass de un modelo real (MLP de 2 capas) sobre la NPU con resultado bit-exacto frente a la referencia.
- Poda no bijunctiva (collapse) en silicio: retencion entre el 50 % y el 92 % segun configuracion, con umbral fijo o dinamico.
- Kernel fusionado completo (reduce_max + umbral + compactacion) en un solo kernel AIE, con τ ajustable en tiempo de ejecucion.
- Poda de KV en atencion: la NPU expulsa claves de baja masa y reduce ambas GEMMs.
- Poda de FFN con ganancia neta medida de 1,6× y coseno de 0,998 frente al resultado denso.
- Pipeline de vision clasico en la NPU: rgba2gray, convolucion 3×3 y umbralizado, ejecutado correctamente.
- Patch-embed de SigLIP/ViT cableado en la NPU con resultado bit-exacto (aunque ~3,2× mas lento que la CPU a tamano base).
- Escritura manual de kernels vectoriales AIE2, incluyendo operaciones de mascara, seleccion y permutacion.
- Persistencia del driver via DKMS, sobreviviendo a reinicios y actualizaciones de kernel.
- Soporte de tool calling, agentes o capacidades multimodales de lenguaje: no disponible (fuera del alcance del proyecto).

## Casos de uso

- Recuperar la NPU en portatiles Ryzen 7040/8040 bajo Linux: aplicar los cuatro ajustes documentados (`libxrt_driver_xdna.so`, driver de staging, `llvm-objcopy`, firmware 1.5.5.391) para que `xrt-smi` detecte el dispositivo, alli donde AMD remite a la GPU.
- Investigacion en poda de modelos: usar `npu_ffn_prune.py` y `npu_attention_prune.py` para medir el compromiso entre ratio de poda y fidelidad (coseno) sobre hardware de bajo consumo, sin depender de una GPU dedicada.
- Inferencia en el borde con presupuesto termico y energetico ajustado: descargar la poda de FFN y de KV a la NPU para liberar CPU y GPU integrada en portatiles, con ganancias de 1,6× y 4× respectivamente en las fases medidas.
- Preprocesado de vision en el dispositivo: el pipeline rgba2gray → conv 3×3 → umbral permite filtrar o preparar fotogramas en la NPU antes de pasarlos a un modelo mayor, aprovechando la fortaleza nativa de la NPU en convoluciones.
- Portado de kernels SIMD existentes: equipos con codigo AltiVec/VSX pueden traducir sus primitivas a AIE2 guiandose por `docs/ALTIVEC_TO_AIE.md`, reduciendo el coste de entrada a la ISA.
- Docencia y formacion en arquitecturas heterogeneas: el repositorio sirve como caso completo y reproducible de bring-up de hardware (driver, firmware, compilador, kernel) con mediciones y registro de errores en el FAQ.
- Evaluacion comparativa de stacks NPU: usar el log de `BENCHMARKS.md` como referencia para contrastar FastFlowLM o AMD Lemonade, que solo cubren XDNA2, frente a esta via para XDNA1.

## Benchmarks y rendimiento

Mediciones publicadas por el autor sobre un Ryzen 7 8845HS real:

| Medicion | Resultado | Nota |
|---|---|---|
| Matmul 512³ int16 en NPU | ~68 GFLOPS | Ejemplo `basic/matrix_multiplication/single_core` |
| Forward pass MLP 2 capas | bit-exacto | Frente a referencia |
| Collapse no bijunctivo (keep-strong / prune-weak) | poda del 50 al 92 % | Configurable |
| Kernel vectorial AIE manual (`aie::ge` + `aie::select`) | compila y ejecuta | Primera compilacion correcta |
| Collapse fusionado reduce_max → τ dinamico | 1 kernel, adaptativo a datos | Sin copia intermedia |
| `aie::reverse` (vec_perm / shuffle) | correcto | Operacion de permutacion en NPU |
| Collapse completo (reduce + umbral + compactacion) | 1 solo kernel AIE | Version runtime-tau disponible |
| FFN net-win (poda en NPU + `down_proj` denso) | 1,6× con coseno 0,998 | Compromiso precision/velocidad medido |
| Attention KV-prune (expulsion de claves de baja masa) | 4× con coseno 0,976 | Ambas GEMMs se reducen |
| Vision pipeline (rgba2gray → conv 3×3 → umbral) | PASS | A 512x512 |
| SigLIP/ViT patch-embed en NPU | bit-exacto, ~3,2× mas lento que CPU a tamano base | Resultado reportado como limitacion |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks de lenguaje en la informacion disponible, ya que el proyecto no incluye un modelo de lenguaje propio.

## Requisitos de hardware

- VRAM: no aplica; el destino es una NPU integrada en el SoC, sin memoria dedicada. La memoria compartida disponible no esta especificada.
- Hardware imprescindible: APU AMD Ryzen 7040 o 8040 ("Phoenix" / "Hawk Point") con NPU XDNA1 (`RyzenAI-npu1`, `aie2`, array 6x5). Verificado en un Ryzen 7 8845HS.
- GPU: no se necesita GPU dedicada; el proyecto sustituye precisamente la recomendacion de "usar la GPU". No se documenta compatibilidad con A100, H100 ni RTX 4090 porque no aplica.
- Cabe en hardware de consumo: si, en los portatiles Ryzen citados; no requiere acelerador externo.
- Sistema operativo y toolchain: Ubuntu 25.10, kernel 6.17, GCC 15. El driver de staging es necesario porque el `amdxdna` de mainline (≤ 6.17) carece de los ioctls `GET_ARRAY` y de telemetria que espera el SHIM de XRT.
- Firmware: version emparejada 1.5.5.391 mediante `scripts/install_firmware.sh`; un firmware obsoleto provoca `ERT_CMD_STATE_ABORT`.
- Despliegue: scripts propios (`setup_iron.sh`, `swap_driver.sh`, `install_firmware.sh`, `run_example.sh`), IRON/mlir-aie + Peano para compilar kernels, XRT como runtime. No hay soporte de vLLM, llama.cpp, Ollama ni TGI.
- Throughput y latencia: unico dato publicado, ~68 GFLOPS en matmul int16 de 512³; el resto de cifras son relativas (1,6×, 4×, 3,2×) sin valores absolutos de latencia.

## Comparativa con modelos similares

Comparativa de stacks para ejecutar inferencia en NPU Ryzen AI bajo Linux:

| Stack | NPU soportada | Enfoque | Estado en XDNA1 / Linux | Licencia |
|---|---|---|---|---|
| open-xdna | XDNA1 ("Phoenix" / "Hawk Point") | Bring-up completo, kernels AIE manuales, poda en silicio | Funcional y medido en Ryzen 7 8845HS | AGPL-3.0 + comercial |
| FastFlowLM | XDNA2 | Runtime de LLMs sobre NPU | No soporta XDNA1 | no disponible |
| AMD Lemonade | XDNA2 | Runtime de LLMs sobre NPU/GPU | No soporta XDNA1 | no disponible |
| Stack oficial AMD Ryzen AI | XDNA2 (soporte); XDNA1 en Linux sin soporte para LLMs | Driver, XRT y toolchain del fabricante | Respuesta oficial para gen-1: usar la GPU | no disponible |

No se dispone de datos de rendimiento comparativos entre estos stacks en la informacion proporcionada; las cifras publicadas por open-xdna corresponden solo a su propia implementacion.

## Limitaciones y advertencias

- No es un modelo: no contiene pesos, no genera texto y no puede usarse como LLM. Cualquier expectativa de "descargar y consultar" es incorrecta; el repositorio Hugging Face es solo un espejo de codigo.
- Ambito restringido a la NPU XDNA1 de primera generacion. No cubre XDNA2 ni aceleradores de otras marcas.
- Requiere modificar el sistema: driver de staging fuera de mainline, firmware especifico y sustitucion de `objcopy`. No es un despliegue apto para entornos gestionados o con kernel fijado por el proveedor.
- Dependencia de una version concreta de firmware (1.5.5.391); desajustes producen abortos de comandos.
- Las ganancias de poda (1,6× y 4×) son medidas con umbrales de similitud coseno de 0,998 y 0,976, es decir, con degradacion no nula; no son perdidas y deben evaluarse por caso de uso.
- El patch-embed de SigLIP/ViT es bit-exacto pero ~3,2× mas lento que la CPU a tamano base, por lo que no aporta ventaja en ese punto concreto.
- Sin datos publicados sobre sesgos, alucinacion o cobertura idiomatica, al no existir componente de lenguaje.
- Licencia AGPL-3.0: el uso en servicios en red obliga a liberar el codigo derivado; existe via comercial indicada por el autor, pero sus terminos no estan detallados en la informacion disponible.
- Madurez temprana: 0 descargas y 0 likes en Hugging Face, un unico entorno verificado y ausencia de validacion por terceros.
- El rendimiento absoluto (~68 GFLOPS en int16) es bajo frente a GPU dedicadas; el interes esta en el consumo y en la integracion, no en la potencia bruta.

## Enlaces

- Hugging Face: https://huggingface.co/elyanlabs/open-xdna
- Repositorio GitHub: https://github.com/Scottcjn/open-xdna
- Repositorio GitLab (historial completo): https://gitlab.com/elyan-labs/open-xdna
- Guia de bring-up: `docs/BRINGUP.md` en el repositorio
- Preguntas frecuentes y errores: `FAQ.md`
- Brecha en mainline `amdxdna` (ioctls): `docs/UPSTREAM_amdxdna_ioctls.md`
- Mapeo AltiVec → AIE: `docs/ALTIVEC_TO_AIE.md`
- Registro de benchmarks por modelo: `BENCHMARKS.md`
- Certificacion: `BCOS.md`
