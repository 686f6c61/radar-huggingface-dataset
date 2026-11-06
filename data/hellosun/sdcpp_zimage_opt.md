# HelloSun/sdcpp_zimage_opt

## Resumen

`sdcpp_zimage_opt` no es un modelo de pesos, sino un repositorio de experimentos de optimización para ejecutar **Z-Image-Turbo** (un modelo de difusión texto-a-imagen) sobre **stable-diffusion.cpp** en CPU pura. Lo publica el usuario HelloSun y contiene scripts de compilación, parches, herramientas de cuantización y resultados de benchmarks; los pesos se descargan de los repositorios upstream. El objetivo es medir y reducir la latencia de generación en servidores x86 sin GPU, aprovechando instrucciones AVX-512 y AMX.

El trabajo fija la versión de sd.cpp en el commit `77b72a2e` e incorpora varias optimizaciones: fusión de las proyecciones FFN (`w1`+`w3` → `w13`), reubicación de pesos en el layout AMX del procesador (`SD_CPU_EXTRA_BUFT=1`), re-cuantización de los bloques refiner de Q8_0 a Q4_K, y mejoras en el kernel de flash-attention (empaquetado de K y V por cabeza, tiles de 128×128) y en el `im2col` de las convoluciones del VAE.

El resultado más relevante es que la combinación Q4_K-ffn13 con layout AMX alcanza 54,2 s por imagen a 512×512 y 8 pasos, frente a los 59,7 s de la configuración stock (≈1,10×). Como referencia externa, OpenVINO INT4 con los mismos 8 pasos genera en 37,5 s (≈1,59×), aunque con otros pesos y otra implementación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión Z-Image-Turbo (no se detalla la arquitectura interna en la información disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen) |
| Tipos de cuantizacion | Q4_K, Q4_0, Q8_0 (GGUF); INT4 vía OpenVINO; F16 para pesos del VAE |
| Idiomas soportados | no disponible (los prompts del benchmark no se especifican) |
| Licencia | MIT |
| Formato de pesos | GGUF (generados por scripts a partir del modelo upstream); el repo no contiene pesos |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: es un conjunto de parches y herramientas sobre `stable-diffusion.cpp` para acelerar la inferencia de Z-Image-Turbo, un modelo de difusión con un pipeline que incluye VAE, bloques de atención con flash-attention y refinadores (noise-refiner y context-refiner). El perfil de operadores de la versión Q4_K sin optimizar muestra que `MUL_MAT` consume el 74 % del tiempo, `FLASH_ATTN_EXT` el 11 %, `IM2COL` el 7 %, `FUSED_RMS_NORM_MUL` el 2 % y el resto son operadores elementales (~5 %).

Las optimizaciones aplicadas son de ingeniería de kernels y de representación de pesos: fusión FFN bit-exacta (`tools/fuse_ffn.py`), layout AMX para las matrices 2D del modelo de difusión, re-cuantización selectiva de 16 pesos de atención/FFN de los refinadores de Q8_0 a Q4_K (`tools/requant_refiner.py`, opt-in con `-rq`), empaquetado de K y V por cabeza en flash-attention y vectorización del `im2col` en las convoluciones del VAE. No hay datos sobre el dataset de entrenamiento de Z-Image-Turbo ni sobre RLHF/DPO en la información proporcionada.

## Capacidades

- Generación de imágenes texto-a-imagen con Z-Image-Turbo en 8 pasos de muestreo a 512×512.
- Ejecución íntegra en CPU, sin GPU, sobre x86 con AVX2, AVX-512 (F, VNNI, BF16) y AMX (INT8, BF16).
- Perfilado por operador (`GGML_CPU_PROFILE=1`) y por fase de convolución del VAE (`GGML_CONV_PROFILE=1`).
- Re-cuantización selectiva de subconjuntos de pesos (refiners) manteniendo el resto en Q8_0.
- Fusión de proyecciones FFN con salida bit-exacta respecto al modelo original.
- Comparación cruzada con OpenVINO INT4 mediante `tools/ov_bench.py` (optimum-intel 2.2.0, OpenVINO 2026.4.0).
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo.

## Casos de uso

- Despliegue de generación de imágenes en servidores sin GPU: el repo permite compilar sd.cpp con AVX-512/AMX y ejecutar Z-Image-Turbo en 16 núcleos, con RSS de 7,7–11,1 GiB, adecuado para entornos donde no hay aceleradores disponibles.
- Optimización de latencia en pipelines batch: la combinación Q4_K-ffn13 + AMX reduce el tiempo por imagen de 59,7 s a 54,2 s; útil para lotes nocturnos o generación asíncrona donde el throughput importa más que la interactividad.
- Evaluación comparativa de backends: los scripts permiten contrastar sd.cpp frente a OpenVINO INT4 (37,5 s) y llamafile (46,0 s) con el mismo prompt, seed y número de pasos, para decidir el stack de inferencia.
- Investigación de kernels en CPU: los stages documentados (flash-attn K packing, VAE conv2d im2col, requant de refinadores) sirven como referencia reproducible para optimizar otros modelos de difusión en ggml.
- Reducción de huella de memoria: el uso de Q4_K en lugar de Q8_0 baja el pico de RSS de 10,4 GiB a 7,9 GiB, lo que permite colocar más instancias por nodo en entornos con cuota de memoria.
- Ajuste de calidad frente a velocidad: la variante `-rq` ahorra ~1,5 s por cada 8 pasos a cambio de una diferencia de píxel media de 6,4, lo que permite elegir el compromiso según el caso de uso.

## Benchmarks y rendimiento

Resultados del autor (mediana de n=2, 512×512, 8 pasos, mismo prompt y seed; CPU Xeon Platinum 8559C con 16 CPU asignadas):

| Variante | Modelo | Env extra | Muestreo (s) | Total (s) | vs stock | RSS pico (GiB) |
|---|---|---|---|---|---|---|
| stock | Q4_K | - | 49,2 | 59,7 | 1,00× | 7,86 |
| avx2 | Q4_K | - | 106,7 | 118,5 | 0,50× | 7,86 |
| avx512 | Q4_K | - | 47,6 | 58,1 | 1,03× | 7,86 |
| amx_lto | Q4_K | - | 52,4 | 63,7 | 0,94× | 7,86 |
| amx_lto | Q4_K | `SD_CPU_EXTRA_BUFT=1` | 42,0 | 52,7 | 1,13× | 8,16 |
| amx_lto | Q4_K-ffn13 | - | 46,5 | 57,1 | 1,05× | 7,86 |
| amx_lto | Q4_K-ffn13 | `SD_CPU_EXTRA_BUFT=1` | 43,1 | 54,2 | 1,10× | 8,14 |
| amx_lto | Q4_0 | - | 172,5 | 183,5 | 0,33× | 7,69 |
| amx_lto | Q8_0 | - | 161,4 | 172,0 | 0,35× | 10,38 |
| amx_lto | Q8_0 | `SD_CPU_EXTRA_BUFT=1` | 55,9 | 66,4 | 0,90× | 11,11 |
| openvino | OV-INT4 | - | 36,8 | 37,5 | 1,59× | 12,59 |
| llamafile | Q4_K-ffn13 | `SD_CPU_EXTRA_BUFT=1` | 39,1 | 46,0 | 1,30× | 8,14 |
| llamafile | Q4_K-ffn13 | `SD_CPU_EXTRA_BUFT=1` + conv-direct | 40,5 | 45,9 | 1,30× | 7,23 |

Mejoras por etapa documentadas por el autor: flash-attn K packing reduce `FLASH_ATTN` de 1607 ms a 1226 ms (-24 %); VAE con llamafile de 10,7 s a 6,6 s (-38 %) y con conv-direct a 5,0 s (-53 %); `im2col` de 1716 ms a 875 ms, con VAE de ~4,7 s a ~3,9 s; flash-attn tile 128×128 reduce `FLASH_ATTN_EXT` de 4663 ms a 4451 ms (-4,5 %); re-cuantización de refinadores baja w13 de 89,4 ms a 42,9 ms por llamada.

## Requisitos de hardware

- CPU x86-64 con AVX2 como mínimo; AVX-512 (F, VNNI, BF16) recomendable; AMX_INT8 y AMX_BF16 para el layout AMX.
- El benchmark se ejecutó con 16 CPU lógicas (cgroup `cpu.max = 1600000 100000`) sobre un Xeon Platinum 8559C de 2 sockets × 48 núcleos.
- Memoria: RSS pico de 7,7–11,1 GiB en sd.cpp con cuantizaciones Q4_K/Q8_0; 12,59 GiB con OpenVINO INT4.
- No requiere GPU; el autor indica que NVML falló por ausencia de GPU y toda la inferencia es CPU pura.
- Despliegue mediante compilación de `stable-diffusion.cpp` (commit `77b72a2e`) con CMake: `-DGGML_NATIVE=ON`, `GGML_LLAMAFILE=ON`, AMX_TILE/INT8/BF16 y LTO.
- Opciones de ejecución relevantes: `-t 16`, `SD_CPU_EXTRA_BUFT=1`, `GGML_CPU_PROFILE=1`, `GGML_CONV_PROFILE=1`.
- Latencia de referencia: 54,2 s por imagen (Q4_K-ffn13 + AMX) y 37,5 s con OpenVINO INT4, a 512×512 y 8 pasos. El autor advierte ruido de ±3 s por carga compartida del host (load average ~45).

## Comparativa con modelos similares

| Modelo / stack | Tipo | Pasos | Tiempo total (s) | RSS pico (GiB) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| sdcpp_zimage_opt (Q4_K-ffn13 + AMX) | sd.cpp en CPU | 8 | 54,2 | 8,14 | MIT | Repo público en Hugging Face |
| OpenVINO INT4 (HelloSun/Z-Image-Turbo-OpenVINO-INT4) | OpenVINO en CPU | 8 | 37,5 | 12,59 | no disponible | Repo público en Hugging Face |
| llamafile (Q4_K-ffn13 + conv-direct) | sd.cpp con kernels llamafile | 8 | 45,9 | 7,23 | MIT (repo) | Incluido en este repo |

La comparación es entre stacks de inferencia sobre el mismo modelo base, no entre modelos distintos; el autor subraya que los resultados de OpenVINO no son comparables en calidad de píxel porque usan otros pesos e implementación.

## Limitaciones y advertencias

- El repositorio no contiene pesos; hay que descargarlos de los repositorios upstream, y la versión de sd.cpp está fijada a un commit concreto.
- `SD_CPU_EXTRA_BUFT=1` es experimental y produce diferencias numéricas (media 1,28, máximo 227) respecto a stock, aunque el autor las describe como visualmente indistinguibles.
- La variante `-rq` es opt-in y altera la salida (diferencia media de píxel 6,4); no debe usarse si se exige reproducibilidad bit-exacta.
- Los tiempos absolutos no son comparables entre sesiones: el host es compartido y el autor observó variaciones de 25 s a 37,5 s en OpenVINO y de 36 s a 46 s en sd.cpp según la carga.
- Las diferencias entre filas con rendimiento cercano (±5 %) están dentro del ruido y no deben interpretarse como mejoras reales.
- No hay información sobre sesgos, alucinaciones ni calidad cualitativa del modelo Z-Image-Turbo en la documentación proporcionada.
- No se especifican los idiomas de los prompts ni el soporte multilingüe.
- La licencia MIT cubre el repositorio de scripts y parches; la licencia de los pesos de Z-Image-Turbo debe verificarse en su repositorio de origen.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/HelloSun/sdcpp_zimage_opt
- Pesos OpenVINO INT4 de referencia: https://huggingface.co/HelloSun/Z-Image-Turbo-OpenVINO-INT4
- stable-diffusion.cpp (commit fijado `77b72a2efed78f55de26892c7e909cee001e8b83`): https://github.com/leejet/stable-diffusion.cpp
- Documentación de etapas en el repo: `stages/stage_p1_pipe/README.md`, `stages/stage1_vae/README.md`, `stages/stage3_vae_conv/README.md`, `stages/stage_p2_refiner/README.md`
- Herramientas incluidas: `tools/fuse_ffn.py`, `tools/requant_refiner.py`, `tools/ov_bench.py`
