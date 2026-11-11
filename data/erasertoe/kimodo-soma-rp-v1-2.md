# Erasertoe/Kimodo-SOMA-RP-v1.2

## Resumen

Kimodo-SOMA-RP-v1.2 es un modelo de difusion para la generacion de movimiento cinematico 3D de cuerpo completo, desarrollado por NVIDIA (laboratorio SIL). A partir de un prompt de texto y, opcionalmente, restricciones de pose (posiciones de articulaciones, rotaciones, trayectorias y waypoints), genera animaciones esqueleticias sobre el esqueleto SOMA de 30 articulaciones. No es un modelo de lenguaje: es un generador de movimiento humano que resuelve el problema de producir animaciones 3D controlables y realistas sin captura de movimiento manual.

La version v1.2 corrige una fuga de datos de la v1.1 (secuencias de test de BONES-SEED que habian entrado en el conjunto de entrenamiento), lo que la convierte en la referencia valida para comparar en el Motion Generation Benchmark. Segun el autor, reduce el deslizamiento de pies (foot skating) y mantiene la precision de restricciones, aunque sus metricas de seguimiento de texto (R-precision/FID) son ligeramente inferiores, en parte por la eliminacion de esa fuga.

El modelo tiene 283.281.777 parametros (282 M declarados en la model card), se distribuye en safetensors con un repo de 1,1 GB y esta pensado para uso comercial bajo la NVIDIA Open Model License. Su relevancia actual radica en aplicaciones de animacion para videojuegos, simulacion industrial, gemelos digitales y demostraciones para robots humanoides.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion con transformer de dos etapas (novel two-stage transformer) |
| Parametros totales | 283.281.777 (282 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; duracion maxima de 10 s (300 frames a 30 fps) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la entrada de texto es en lenguaje natural, pero no se especifican idiomas) |
| Licencia | NVIDIA Open Model License (nvidia-open-model-license) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Kimodo es un modelo de difusion (diffusion model) con una arquitectura de transformer de dos etapas disenada especificamente para movimiento cinematico. Recibe como entradas texto, duracion en frames y restricciones de pose (posiciones 3D de articulaciones, matrices de rotacion 3x3, direccion de heading 2D y posicion de raiz 2D), y produce traslacion de raiz (num_frames x 3) y rotaciones articulares (num_frames x 30 x 3 x 3) a 30 fps. La generacion esta condicionada tanto por el texto como por las restricciones espaciales, lo que permite control fino sobre la trayectoria y las poses clave.

El entrenamiento se realizo sobre el dataset propietario Bones Rigplay: 700 horas de captura de movimiento humano sobre el esqueleto SOMA con descripciones de texto asociadas, menos de mil millones de tokens de texto y una division 90 %/10 % train/test, con aumentos de datos para ampliar la variedad de texto y movimiento. La version v1.2 reentrena sobre splits corregidos que eliminan las secuencias de test filtradas en v1.1. No se detalla en la informacion disponible si hubo RLHF o DPO; al tratarse de un modelo de difusion, el paradigma de entrenamiento es de denoising, no de preferencias.

## Capacidades

- Generacion de animacion 3D de cuerpo completo sobre el esqueleto SOMA de 30 articulaciones a partir de texto.
- Control por restricciones: poses de cuerpo completo, posiciones de end-effectors, trayectorias y waypoints.
- Especificacion de duracion en frames, con maximo de 300 frames (10 s a 30 fps).
- Salida de traslacion de raiz y rotaciones articulares en formato matricial, lista para pipelines de animacion.
- Orientado a crear datos de movimiento para robots humanoides, gemelos digitales, simulacion industrial, datos sinteticos y animacion para juegos y medios.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo thinking; no es un modelo de lenguaje.

## Casos de uso

- Demostraciones para robots humanoides: el modelo genera movimientos sobre el esqueleto SOMA que pueden retargetearse a esqueletos de robot (la familia incluye variantes G1 sobre Unitree G1), util para entrenar y validar politicas de control.
- Animacion para videojuegos: produccion de clips de movimiento de hasta 10 s condicionados por texto y waypoints, reduciendo el coste de captura manual en prototipado y blockout.
- Gemelos digitales e simulacion industrial: generacion de movimiento de trabajadores digitales en entornos simulados para estudios ergonomicos y de flujo de procesos.
- Datos sinteticos de movimiento: creacion de grandes volumenes de animaciones etiquetadas con texto para entrenar otros modelos de movimiento o de percepcion.
- Previsualizacion en produccion audiovisual: generacion rapida de movimiento base que el animador refina despues, con control de trayectoria mediante restricciones de raiz y heading.
- Investigacion en generacion de movimiento: linea base reproducible sobre el Motion Generation Benchmark con splits corregidos, para comparar metodos de difusion condicionada por texto y restricciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las tablas del repositorio de GitHub (Motion Generation Benchmark) y senala que v1.2 es la version valida para comparar, pero no incluye cifras concretas de R-precision, FID ni metricas de foot skating.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 282 M parametros en safetensors (1,1 GB de repo), la huella en memoria es moderada y cabe con holgura en GPUs de consumo, aunque no se publican cifras oficiales.
- GPU recomendadas: NVIDIA Ampere, Lovelace y Blackwell segun la model card; el modelo esta optimizado para CUDA.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano (282 M parametros), aunque no se confirma en la documentacion.
- Opciones de despliegue: PyTorch como runtime; la libreria `kimodo` y el repositorio nv-tlabs/kimodo. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.
- Sistemas operativos soportados: Linux y Windows.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/duracion | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimodo-SOMA-RP-v1.2 | 282 M | 300 frames (10 s) | Texto + restricciones de pose | NVIDIA Open Model License | Hugging Face (nvidia y Erasertoe) |
| Kimodo-SOMA-SEED | no disponible | 300 frames (10 s) | Texto + restricciones de pose | no disponible | Hugging Face |
| Kimodo-G1-RP | no disponible | 300 frames (10 s) | Texto + restricciones de pose | no disponible | Hugging Face |
| Kimodo-SMPLX-RP | no disponible | 300 frames (10 s) | Texto + restricciones de pose | no disponible | Hugging Face |

Las alternativas de la misma familia comparten arquitectura y difieren en esqueleto y dataset de entrenamiento (SOMA de 30 articulaciones, G1 de 34 articulaciones para Unitree G1, SMPLX-body de 22 articulaciones). No se dispone de datos de benchmarks comparativos entre ellas en la informacion proporcionada.

## Limitaciones y advertencias

- Duracion maxima de 10 s (300 frames a 30 fps); no genera secuencias mas largas en una sola pasada.
- Entrenado sobre el dataset propietario Bones Rigplay; el rendimiento fuera de esa distribucion de movimiento y texto no esta caracterizado.
- Las metricas de seguimiento de texto (R-precision/FID) de v1.2 son ligeramente inferiores a v1.1, segun el autor, en parte por la eliminacion de la fuga de datos.
- No se documentan sesgos conocidos ni evaluaciones de sesgo en la model card.
- Riesgo de alucinacion: no aplica en el sentido de lenguaje, pero puede producir movimientos fisicamente implausibles o que no respeten exactamente las restricciones.
- Licencia NVIDIA Open Model License: permite uso comercial segun la model card, pero conviene revisar los terminos completos antes de produccion.
- Requiere integracion y validacion adicionales con datos especificos del caso de uso (metodologia V-model) antes de desplegar en sistemas criticos.
- Idiomas de entrada no especificados; no hay garantia de comportamiento multilingue.

## Enlaces

- Hugging Face (Erasertoe): https://huggingface.co/Erasertoe/Kimodo-SOMA-RP-v1.2
- Hugging Face (NVIDIA): https://huggingface.co/nvidia/Kimodo-SOMA-RP-v1.2
- Repositorio GitHub: https://github.com/nv-tlabs/kimodo
- Pagina del proyecto: https://research.nvidia.com/labs/sil/projects/kimodo/
- Informe tecnico (PDF): https://research.nvidia.com/labs/sil/projects/kimodo/assets/kimodo_tech_report.pdf
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license
