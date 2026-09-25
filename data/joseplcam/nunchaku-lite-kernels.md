# joseplcam/nunchaku-lite-kernels

## Resumen

Este repositorio no contiene un modelo de lenguaje ni un modelo generativo, sino una compilación de kernels CUDA publicada en el formato de la librería `kernels` de Hugging Face. En concreto, empaqueta los kernels de Nunchaku Lite: operaciones GEMM SVDQuant W4A4 en INT4 y NVFP4, operaciones GEMV AWQ W4A16 y funciones fusionadas auxiliares, utilizadas para acelerar la inferencia de modelos de difusión cuantizados dentro de pipelines de Diffusers.

El autor del repositorio es el usuario `joseplcam`, que actúa como empaquetador y no como autor original del código. El kernel fuente procede de `rootonchair/nunchaku-lite`, en el commit `e663e48ccf3ec5264355e1872aeebef0284706c9`, subcarpeta `nunchaku-lite-kernels`, y se distribuye sin modificaciones bajo licencia Apache-2.0. La motivación declarada es que el repositorio original `rootonchair/nunchaku-lite-kernels`, que el cuantizador `nunchaku_lite` integrado en Diffusers consulta por defecto, ya no era descargable en el momento de crear esta compilación, por lo que este paquete funciona como reemplazo directo.

La relevancia es acotada pero práctica: sin estos binarios, el cuantizador `nunchaku_lite` de Diffusers no puede cargar los kernels que necesita para ejecutar modelos de difusión cuantizados con SVDQuant o AWQ. El paquete está compilado exclusivamente para GPUs con arquitectura `sm_120a` (RTX 50-series, RTX PRO 6000 Blackwell y similares), con CUDA 13.1, PyTorch 2.13.0+cu130, CPython 3.12 y Linux x86_64. No incluye pesos, no tiene benchmarks publicados y acumula 0 descargas y 0 valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplicable: paquete de kernels CUDA (GEMM SVDQuant W4A4, GEMV AWQ W4A16 y helpers fusionados), no una red neuronal |
| Parametros totales | No aplicable (el repositorio no contiene pesos) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable |
| Tipos de cuantizacion | SVDQuant W4A4 en INT4 y NVFP4 (GEMM); AWQ W4A16 (GEMV) |
| Idiomas soportados | No aplicable |
| Licencia | Apache-2.0 |
| Formato de pesos | No incluye pesos. Contiene binarios de extensión CUDA (`.so`) mas `metadata.json`, empaquetados segun el layout de la libreria `kernels` de Hugging Face |
| Libreria declarada | `kernels` |
| Arquitectura GPU objetivo | `sm_120a` exclusivamente (RTX 50-series, RTX PRO 6000 Blackwell y otras `sm_120`) |
| Toolchain de compilacion | nvcc 13.1, PyTorch 2.13.0+cu130, `NUNCHAKU_INSTALL_MODE=FAST` |
| Version de Python | CPython 3.12 unicamente |
| Sistema operativo | Linux x86_64 |
| Variante de build | `build/torch213-cxx11-cu130-x86_64-linux` |
| Commit de origen | `e663e48ccf3ec5264355e1872aeebef0284706c9` (`rootonchair/nunchaku-lite`, subcarpeta `nunchaku-lite-kernels`) |
| Tamano del repositorio | 0,1 GB |
| Variantes de cuantizacion adicionales | No disponible |

## Arquitectura y entrenamiento

No existe entrenamiento asociado: se trata de codigo CUDA de bajo nivel compilado para una arquitectura de GPU concreta. Los kernels implementan las primitivas numericas que sostienen dos esquemas de cuantizacion para modelos de difusion. El primero es SVDQuant, que descompone en valor singular y ejecuta multiplicaciones matriz-matriz (GEMM) con activaciones y pesos en 4 bits, tanto en formato INT4 como en NVFP4. El segundo es AWQ, que aqui aparece unicamente como GEMV (multiplicacion matriz-vector) W4A16, es decir, pesos en 4 bits y activaciones en 16 bits. A ello se suman funciones fusionadas auxiliares que reducen el numero de lanzamientos de kernel.

La compilacion se realizo con `NUNCHAKU_INSTALL_MODE=FAST`, modo que restringe la generacion de codigo a la arquitectura `sm_120a`. Esto implica que los binarios contienen SASS especifico de Blackwell y no incluyen codigo PTX generico de respaldo ni cubren arquitecturas anteriores como `sm_80` (A100), `sm_89` (RTX 4090) o `sm_90` (H100). El resultado es un artefacto mas ligero y con menos tiempo de compilacion, a cambio de perder portabilidad: cualquier otra GPU o version de PyTorch exige recompilar desde el codigo fuente con las variables de entorno adecuadas.

El paquete se integra mediante dos variables de entorno: `LOCAL_KERNELS` apunta el nombre de kernel que solicita Diffusers hacia este repositorio descargado, y `DIFFUSERS_TRUST_REMOTE_KERNELS=true` habilita la carga de kernels remotos. El modelo `joseplcam/Qwen-Image-2.1-NVFP4` realiza esta configuracion de forma automatica cuando se carga con `trust_remote_code=True`.

## Capacidades

- Ejecucion de GEMM cuantizados SVDQuant W4A4 en INT4 para capas lineales de modelos de difusion.
- Ejecucion de GEMM cuantizados SVDQuant W4A4 en NVFP4, formato de 4 bits con escala de bloque orientado a Blackwell.
- Ejecucion de GEMV AWQ W4A16, util en fases de decodificacion o en capas con formas matriciales estrechas donde un GEMM completo resulta ineficiente.
- Funciones fusionadas auxiliares que combinan operaciones para reducir la sobrecarga de lanzamiento de kernels.
- Carga directa en pipelines de Diffusers mediante el cuantizador `nunchaku_lite`, sin cambios en el codigo del pipeline.
- Reemplazo directo del repositorio `rootonchair/nunchaku-lite-kernels` cuando este no esta disponible.
- Compilacion reproducible desde el codigo fuente mediante `uv build --wheel --no-build-isolation`.

No dispone de: generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, capacidades de agente, soporte multilingue, modo thinking, procesamiento de audio ni ninguna otra capacidad propia de un modelo de IA. Su funcion es exclusivamente de aceleracion numerica.

## Casos de uso

- Ejecucion de pipelines de difusion cuantizados en RTX 50-series: el paquete aporta los kernels que el cuantizador `nunchaku_lite` de Diffusers necesita, de modo que un pipeline de generacion de imagen con pesos SVDQuant W4A4 o AWQ puede cargarse y ejecutarse en GPUs `sm_120` sin compilar nada localmente.
- Sustitucion de un repositorio no disponible: cuando `rootonchair/nunchaku-lite-kernels` deja de ser descargable, este repositorio evita que los pipelines existentes fallen en tiempo de carga; basta con redirigir la variable `LOCAL_KERNELS` mediante `snapshot_download`.
- Despliegue de `joseplcam/Qwen-Image-2.1-NVFP4`: este modelo configura automaticamente las variables de entorno necesarias al cargarse con `trust_remote_code=True`, por lo que el repositorio actua como dependencia implicita de ese pipeline.
- Servicio de generacion de imagenes en produccion sobre Blackwell: el uso de GEMM NVFP4 reduce el coste aritmetico por paso de difusion, lo que permite aumentar el numero de peticiones concurrentes o reducir el tiempo por imagen en un servidor con RTX PRO 6000 Blackwell.
- Comparacion de esquemas de cuantizacion: al exponer tanto rutas W4A4 (SVDQuant en INT4 y NVFP4) como W4A16 (AWQ), permite medir en la misma maquina la relacion entre calidad de salida, latencia y memoria de cada esquema sobre un mismo modelo de difusion.
- Base para desarrollo de kernels propios: el codigo fuente en `rootonchair/nunchaku-lite` y las instrucciones de recompilacion documentadas permiten partir de estas primitivas para adaptarlas a otras arquitecturas de GPU o a otras versiones de PyTorch y CUDA.
- Integracion en imagenes de contenedor reproducibles: al fijar el commit de origen, la version de CUDA, la version de PyTorch y la version de Python, la build es apta para empaquetarse en una imagen Docker concreta y evitar variaciones entre entornos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de latencia, throughput ni comparativas de calidad numerica frente a kernels de referencia, y no se han encontrado mediciones en los resultados de busqueda consultados.

## Requisitos de hardware

- Arquitectura de GPU obligatoria: `sm_120a` o compatible `sm_120`. Esto cubre RTX 50-series (por ejemplo RTX 5090, RTX 5080) y RTX PRO 6000 Blackwell. No funciona en A100 (`sm_80`), RTX 4090 (`sm_89`) ni H100 (`sm_90`) con esta build.
- VRAM: no determinada por el paquete. Los kernels anaden una sobrecarga despreciable (el repositorio ocupa 0,1 GB en disco y en GPU solo residen el codigo de dispositivo y los buffers de trabajo); el consumo real lo fija el modelo de difusion cuantizado que se cargue.
- Entorno de software: Linux x86_64, CPython 3.12, PyTorch 2.13.0+cu130 y nvcc 13.1 para la compilacion.
- Despliegue: carga mediante el cuantizador `nunchaku_lite` de Diffusers con `LOCAL_KERNELS` y `DIFFUSERS_TRUST_REMOTE_KERNELS=true`; no requiere vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. No se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

| Alternativa | Funcion | Arquitecturas cubiertas | Disponibilidad | Licencia |
|---|---|---|---|---|
| `joseplcam/nunchaku-lite-kernels` (esta build) | Kernels SVDQuant W4A4 INT4/NVFP4, AWQ W4A16 y helpers, en formato `kernels` | `sm_120a` unicamente | Publicada en Hugging Face, 0 descargas | Apache-2.0 |
| `rootonchair/nunchaku-lite-kernels` (original) | Mismos kernels, repositorio de referencia que consulta `nunchaku_lite` | No disponible en la informacion proporcionada | Segun la model card, no descargable cuando se creo esta build | Apache-2.0 |
| Compilacion propia desde `rootonchair/nunchaku-lite` | Mismos kernels, generados localmente con `NUNCHAKU_INSTALL_MODE=FAST` | La que se configure, con el coste de compilacion correspondiente | Requiere toolchain CUDA 13 y tiempo de build | Apache-2.0 |

No se dispone de datos de rendimiento comparativo entre estas opciones, por lo que no es posible establecer cual ofrece mejor latencia o throughput.

## Limitaciones y advertencias

- No es un modelo: no genera texto, imagenes ni codigo por si mismo. Cualquier expectativa de uso como modelo de IA es incorrecta.
- Cobertura de hardware muy restringida: solo `sm_120a`. El intento de cargar estos binarios en una GPU anterior fallara; sera necesario recompilar.
- Acoplamiento fuerte a versiones: CPython 3.12, PyTorch 2.13.0+cu130 y Linux x86_64. Otras combinaciones exigen una build propia.
- Ausencia de validacion externa: 0 descargas y 0 valoraciones, sin benchmarks ni pruebas de correctitud numerica publicadas.
- Sin garantias de mantenimiento: el repositorio se creo y actualizo el 2026-09-25, con apenas diez segundos entre ambos eventos, y no consta soporte posterior del autor.
- Riesgo de seguridad en la carga: requiere `DIFFUSERS_TRUST_REMOTE_KERNELS=true`, que habilita la ejecucion de codigo remoto. Conviene verificar el commit de origen y el hash de los binarios antes de usarlo en produccion.
- Dependencia de un repositorio ajeno: el codigo procede de `rootonchair/nunchaku-lite`; su evolucion, archivado o cambio de licencia afecta a este paquete.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero obliga a conservar los avisos de copyright y licencia y a declarar los cambios realizados. No se han detectado clausulas adicionales en la informacion disponible.
- Sesgos, alucinacion y limitaciones de idioma: no aplicables, al no tratarse de un modelo de lenguaje.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/joseplcam/nunchaku-lite-kernels
- Codigo fuente original: https://github.com/rootonchair/nunchaku-lite
- Subcarpeta de kernels en el repositorio original: https://github.com/rootonchair/nunchaku-lite/tree/main/nunchaku-lite-kernels
- Libreria `kernels` de Hugging Face: https://github.com/huggingface/kernels
- Documentacion de inicio rapido de nunchaku_lite: https://nunchaku-lite.readthedocs.io/en/latest/quick_start/
- Modelo que consume estos kernels: https://huggingface.co/joseplcam/Qwen-Image-2.1-NVFP4
