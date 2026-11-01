# abuz8studios/FAIE2-FlashNext

## Resumen

FAIE2-FlashNext (FAIE2-FN) no es un modelo de lenguaje en sentido estricto, sino un motor de inferencia CUDA escrito desde cero para ejecutar **Qwen3.8-Flash-Next**, un modelo de arquitectura híbrida DeltaNet-MoE. Lo desarrolla abuz8studios (Ahmad A Odeh / ABUZ8 LLC) y se distribuye como instantánea con fecha del 27 de octubre de 2026 de un proyecto en desarrollo activo. El objetivo es prescindir por completo de llama.cpp y de la ruta de inferencia de PyTorch, sustituyéndolas por kernels CUDA escritos a mano, una capa host basada en ctypes y un régimen de verificación en el que cada optimización debe demostrar que no altera la salida.

El motor se ejecuta repartido entre dos GPU RTX 5090 sobre Windows, con compilación para sm_120 mediante CUDA 13.1 y MSVC. La cifra destacada por el autor es de **172,9 tok/s en decodificación greedy** (159 tokens en 920 ms, 5,70 ms por forward), medida de forma independiente el 2026-10-27. El repositorio no incluye los pesos del modelo ni la DLL compilada: el motor carga shards GGUF locales y debe compilarse desde el código fuente.

Su relevancia radica en el enfoque de ingeniería: matemáticas en fp32 en todo el pipeline, sin reordenación de reducciones, y una salida **bit a bit idéntica** entre compilaciones, verificada comparando logits en 54 posiciones y el flujo residual tras cada capa. Es un caso de estudio sobre optimización de kernels con garantías formales de corrección, más que un artefacto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor de inferencia CUDA para un transformer híbrido DeltaNet-MoE (Qwen3.8-Flash-Next) |
| Parametros totales | no disponible (corresponde al modelo Qwen3.8-Flash-Next, no especificado en la informacion) |
| Parametros activos | no disponible (modelo MoE, sin cifra publicada en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 13 formatos GGUF soportados (descuantizacion en GPU verificada); se mencionan IQ2/IQ3 como pendientes de decodificacion con tensor cores |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | GGUF (shards locales cargados por el motor); el repositorio no incluye pesos ni binarios |

## Arquitectura y entrenamiento

El repositorio contiene un motor de inferencia, no un modelo entrenado, por lo que no hay datos de entrenamiento, composicion de dataset ni fases de RLHF/DPO que reportar. La arquitectura del motor se organiza en `engine/faie2fn.cu` (el nucleo), `fn_tables.cuh` y `build_fn.ps1` para la compilacion con CUDA 13.1 y MSVC sobre sm_120; la capa host en `flashnext/fn.py` usa ctypes para invocar la DLL. El modelo subyacente, Qwen3.8-Flash-Next, es un hibrido DeltaNet-MoE: combina atencion de tipo DeltaNet con mezcla de expertos enrutados, y el motor implementa kernels especificos para el nucleo DeltaNet (fusionado en un unico kernel) y para los expertos enrutados (`k_tmoe_gu8`, de 8 filas).

La innovacion tecnica central es la progresion de rendimiento documentada en `DESIGN.md` §9: de 75,1 tok/s con GEMV split-K a 137,4 tok/s con GEMV tileado, y hasta 173,6 tok/s mediante fusion de kernels (PDL, GEMV tempranos, hyper-conexiones fusionadas y nucleo DeltaNet en un solo kernel). El kernel de expertos enrutados de 8 filas mantiene 169,5-173,7 tok/s segun la ejecucion, con aproximadamente 5,70-5,76 ms por token. El numero de kernels por token baja de 1502 a 1071. Todo el calculo se hace en fp32 sin cambiar el orden de las reducciones, lo que permite que la salida sea bit a bit identica entre compilaciones, comprobada con `flashnext/bitcmp_fn.py`.

## Capacidades

- Ejecucion de inferencia del modelo Qwen3.8-Flash-Next (hibrido DeltaNet-MoE) sobre GPU NVIDIA con CUDA.
- Decodificacion greedy a 172,9 tok/s en la configuracion de dos RTX 5090 documentada.
- Descuantizacion en GPU de 13 formatos GGUF, con error de descuantizacion de 0,00 y error relativo de GEMV inferior o igual a 1,8e-07 frente a aritmetica en float64.
- Verificacion de correccion mediante oraculo en float64: comparacion del forward completo contra la implementacion oficial de transformers, con top-1 de 21/21, diferencia maxima de log-probabilidad de 0,0000 y residuo de capa 0 de 1,02e-05.
- Comparacion bit a bit build-over-build de logits y flujo residual.
- Herramientas de benchmark y perfilado incluidas en `flashnext/`.
- No incluye (declarado por el autor): decodificacion especulativa en este motor, prefill por lotes, prueba de carga de servido ni la cabeza drafter MTP.

## Casos de uso

- Investigacion en kernels CUDA: el repositorio sirve como referencia para estudiar fusion de kernels, GEMV tileado y PDL con mediciones por etapa y registro de callejones sin salida en `DESIGN.md`.
- Validacion de motores de inferencia: el oraculo en float64 y las puertas de correccion (`gate_fn_ref.py`, `test_fn_quants.py`) permiten comprobar si un motor alternativo reproduce la salida oficial de transformers.
- Despliegue local de Qwen3.8-Flash-Next en estaciones con dos RTX 5090 y Windows, sin depender de llama.cpp ni de PyTorch para la ruta de inferencia.
- Pruebas de cuantizacion GGUF: los 13 formatos soportados y la verificacion de descuantizacion exacta permiten evaluar el impacto de cada formato en un pipeline propio.
- Desarrollo de tecnicas de paridad numerica: el regimen de comparacion bit a bit entre compilaciones es aplicable a proyectos que exijan reproducibilidad estricta de logits.
- Base para portar el motor a otros modelos de la familia: el autor mantiene una linea hermana (`faie2`) con el motor para Qwen3.8-27B, servidor y suite de herramientas.

## Benchmarks y rendimiento

| Etapa | Decode (tok/s) | ms/token |
|---|---|---|
| GEMV split-K (baseline) | 75,1 | 13,3 |
| GEMV tileado | 137,4 | 7,28 |
| Fusion de kernels (PDL, GEMV tempranos, hyper-conexiones fusionadas, nucleo DeltaNet unico) | 173,6 | 5,76 |
| Kernel de expertos enrutados de 8 filas (`k_tmoe_gu8`, build actual) | 169,5-173,7 | ~5,70-5,76 |

| Puerta de correccion | Comprobaciones | Resultado |
|---|---|---|
| QUANT (`test_fn_quants.py`) | 13 formatos GGUF descuantizados en GPU frente a gguf-py; GEMV frente a float64 | error de descuantizacion 0,00; error relativo de GEMV <= 1,8e-07 |
| ORACLE (`gate_fn_ref.py`) | Forward completo frente a transformers en float64 | top-1 21/21; diferencia maxima de log-probabilidad 0,0000; residuo de capa 0 1,02e-05 |

No se han publicado resultados de benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Configuracion de referencia: dos GPU RTX 5090 repartidas, sobre Windows, con compilacion para sm_120 (CUDA 13.1 + MSVC).
- VRAM estimada: no disponible; depende del tamano de los shards GGUF de Qwen3.8-Flash-Next, no especificado en la informacion.
- GPU recomendadas: RTX 5090 (unica arquitectura mencionada y probada por el autor).
- Cabe en GPU de consumo: si, en RTX 5090, segun la configuracion documentada.
- Opciones de despliegue: compilacion propia del motor desde fuente (`build_fn.ps1`); no se usa llama.cpp, Ollama, vLLM ni TGI. La linea hermana `faie2` incluye servidor.
- Latencia y throughput: 5,70 ms por forward y 172,9 tok/s en decodificacion greedy; el objetivo declarado de 3,5-4 ms/token aun no se ha alcanzado.
- Limitacion de interconexion: el acceso peer GPU-GPU esta bloqueado por el driver WDDM cerrado de Windows (peer access 0 en ambos sentidos, topologia PXB); el traspaso por host cuesta unos 5 µs de los 5,70 ms por token.

## Comparativa con modelos similares

| Motor | Enfoque | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|
| FAIE2-FlashNext | CUDA desde cero, fp32, sin PyTorch ni llama.cpp | 172,9 tok/s en 2x RTX 5090 | MIT | Codigo fuente; sin pesos ni DLL |
| llama.cpp | Motor generico GGUF multiplataforma | no disponible | MIT | Amplia, con binarios |
| vLLM | Servido de alto rendimiento con PagedAttention | no disponible | Apache 2.0 | Amplia, orientada a servidor |
| Ruta de inferencia de PyTorch/transformers | Referencia oficial del modelo | no disponible | segun modelo | Universal |

No se dispone de datos de rendimiento de los motores alternativos en el mismo hardware y modelo dentro de la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- Proyecto en desarrollo activo: la instantanea es una foto fechada y el autor declara explicitamente las partes inacabadas.
- No incluye los pesos del modelo ni la DLL compilada; hay que compilar desde fuente y disponer de los shards GGUF por separado.
- Sin decodificacion especulativa en este motor, sin prefill por lotes, sin prueba de carga de servido y sin cabeza drafter MTP.
- La decodificacion con tensor cores para IQ2/IQ3 esta pendiente y cambiaria la regla de matematica fp32, lo que afectaria a la garantia de identidad bit a bit.
- Dependencia de Windows y del driver WDDM, con acceso peer GPU-GPU bloqueado; el rendimiento en otras plataformas no esta documentado.
- Solo probado en RTX 5090 con sm_120; no hay datos de compatibilidad con otras GPU.
- Idioma declarado: solo ingles.
- Sin datos publicados de calidad del modelo subyacente (benchmarks de razonamiento, codigo o matematicas) en la informacion disponible.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion proporcionada.
- Licencia MIT: permite uso comercial, pero al no incluirse pesos, la licencia aplicable al modelo Qwen3.8-Flash-Next debe consultarse por separado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/abuz8studios/FAIE2-FlashNext
- Repositorio hermano `faie2` (motor para Qwen3.8-27B, servidor y herramientas): referenciado como `../faie2` en la model card, sin URL directa en la informacion disponible.
- Documentacion interna citada: `VERDICT.md`, `DESIGN.md` (secciones 9, 9a-9c), `verification/`, `flashnext/bitcmp_fn.py`, `flashnext/ref_fn.py`, `gate_fn_ref.py`, `test_fn_quants.py`, `engine/faie2fn.cu`, `engine/fn_tables.cuh`, `engine/build_fn.ps1`.
