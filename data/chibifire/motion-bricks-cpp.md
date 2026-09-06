# chibifire/motion-bricks.cpp

## Resumen

Motion-bricks.cpp es un port en C++23/GGML del modelo NVIDIA MotionBricks, desarrollado por chibifire en el entorno localai-org. No es un modelo de lenguaje: es un sistema de generacion de animacion esqueletica para humanoides que predice tokens de pose, decodifica el VQ y produce movimiento de 34 articulaciones con traducciones de raiz. El objetivo es ejecutar el camino de inferencia G1 de MotionBricks en CPU y Vulkan sin depender de NVIDIA CUDA, con una interfaz C estable que permite integrarlo desde Go/PureGo sin cgo.

El modelo resuelve el problema de generar animaciones de cuerpo completo controlables por estilo, orientacion y movimiento, y es relevante ahora porque democratiza el acceso a un modelo de NVIDIA que originalmente requiere infraestructura propietaria. El modelo publicado tiene exactamente 183.148.382 parametros aprendidos en formato F32 en un bundle GGUF de 0,73 GB. El port implementa el pipeline completo para los estilos G1 preprocesados: carga GGUF, planificacion de raiz/duracion, prediccion de tokens de pose, decodificacion VQ, conversion de caracteristicas 418/414/413, alineacion de estilo y salida de animacion esqueletica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Prediccion autoregresiva de tokens de pose con VQ decoding y alineacion de estilo (port de NVIDIA MotionBricks, camino G1) |
| Parametros totales | 183.148.382 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; requiere al menos 4 frames de contexto G1 |
| Tipos de cuantizacion | F32 (GGUF de 0,73 GB); no se documentan cuantizaciones de menor precision |
| Idiomas soportados | No disponible; no es un modelo de lenguaje, es un modelo de generacion de movimiento |
| Licencia | Apache License 2.0 (codigo fuente); NVIDIA Open Model License para pesos y distribuciones GGUF/estilos |
| Formato de pesos | GGUF y safetensors (intermedios) |

## Arquitectura y entrenamiento

La arquitectura del modelo original no se documenta en detalle en la informacion disponible. El port implementa el pipeline de inferencia de NVIDIA MotionBricks para el camino G1: carga estricta de GGUF, planificacion de raiz/duracion, prediccion de tokens de pose, decodificacion VQ, conversion de caracteristicas 418/414/413, alineacion de estilo y salida de animacion esqueletica. La topologia esqueletica valida y usa un arbol de parentesco de 34 articulaciones.

No se proporcionan datos sobre el conjunto de entrenamiento original de MotionBricks, ni se mencionan procesos de RLHF o DPO. La innovacion tecnica de este proyecto esta en la implementacion: un port C++23/GGML que funciona en CPU y Vulkan, con una API C estable basada en escalares de ancho fijo, punteros y handles opacos, sin que ninguna excepcion C++ cruce el limite de ABI. El proyecto incluye un submodulo de GGML, descarga de pesos verificada por SHA-256 y validacion de identidad de checkpoint antes de aceptar un modelo.

## Capacidades

- Generacion de animacion esqueletica de cuerpo completo: produce traducciones de raiz en F32 con forma `[frames,3]` y rotaciones locales XYZW con forma `[frames,34,4]`.
- Planificacion de movimiento multi-paso: crea un agente de movimiento mediante `mb_agent_plan`, que recibe movimiento, orientacion y estilo, y genera un chunk de animacion. Al avanzar el playback con `mb_agent_advance`, el modelo usa el movimiento generado como siguiente contexto para replanificar.
- Alineacion de estilo: soporta los 15 estilos G1 preprocesados originales, convertidos a archivos `.mbstyle`.
- Inferencia en CPU y Vulkan: el mismo codigo y API publica se ejecutan en ambos backends y preservan las mismas decisiones de duracion y tokens de pose en la suite de referencia.
- ABI C estable para PureGo: los bindings Go cargan la biblioteca compartida nativa sin cgo ni `import "C"`.
- Validacion de pesos y manifiestos: el cargador valida la revision upstream, identidad de checkpoint, roles de componentes, recuento de tensores, parametros, formas y topologia de 34 articulaciones.
- Construccion reproducible: soporta CMake con presets debug y asan-ubsan, asi como entorno Nix para desarrollo.

## Casos de uso

- Animacion de personajes en videojuegos: el modelo puede generar movimientos de caminar, girar y cambiar de estilo en tiempo real; al ejecutarse en CPU y Vulkan es viable para motores multiplataforma y para prototipos en equipos sin GPU NVIDIA.
- Control de robots humanoides: para un robot de tipo G1, el agente planifica movimientos de cuerpo completo y puede replanificar usando el movimiento generado como contexto, lo que permite integrarlo en bucles de control en tiempo real.
- Simulacion de robotica: la ruta CPU con GGML permite reproducir comportamientos de MotionBricks en entornos de simulacion que no tienen acceso a aceleracion por GPU, facilitando pruebas batch en CI.
- Investigacion en animacion por IA: el repositorio ofrece el pipeline completo, incluyendo conversion de pesos, validacion de checkpoint, tests y herramientas de inspeccion; es util para estudiar el comportamiento del modelo sin depender de los binarios propietarios de NVIDIA.
- Integracion desde Go/PureGo: la ABI C estable y los bindings PureGo permiten construir aplicaciones de escritorio o servidores web en Go que cargan la biblioteca compartida en tiempo de ejecucion, sin necesidad de compilador C.
- Prototipos de visualizacion con Three.js: la demo interactiva renderiza el esqueleto de 34 articulaciones y los fantasmas de keyframes objetivo; puede usarse como base para herramientas de autor o para validacion visual de animaciones en navegador.
- Reutilizacion de estilos de movimiento: los 15 estilos G1 convertidos a `.mbstyle` se pueden intercambiar sin recompilar el modelo, lo que permite experimentar con variantes de caminar, estilo zombi o giros en un mismo pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no hay cifras oficiales. Los pesos F32 ocupan alrededor de 0,73 GB; para inferencia en Vulkan se estima una VRAM de 1-2 GB sumando activaciones, dependiendo del numero de frames planificados.
- GPU recomendadas: cualquier GPU con soporte Vulkan, por ejemplo NVIDIA RTX 2060 o superior, AMD RX 6000 o superior, y algunas iGPU integradas. No se requiere CUDA.
- CPU: la ruta CPU usa GGML y necesita memoria RAM del orden de 1-2 GB para los pesos y activaciones.
- Opciones de despliegue: compilacion nativa con CMake (presets debug/asan-ubsan), biblioteca compartida `libmotionbricks` con API C, CLI `motionbricks-cli`, bindings Go/PureGo y demo web con Three.js.
- Latencia y throughput: no disponibles; no se aportan mediciones en la documentacion.

## Comparativa con modelos similares

No disponible. La informacion no incluye metricas ni datos sobre modelos alternativos de generacion de movimiento. La unica referencia directa es el NVIDIA MotionBricks original, del que este port utiliza los mismos pesos, pero no se aportan resultados comparativos de rendimiento ni de calidad.

## Limitaciones y advertencias

- El codigo fuente esta bajo Apache License 2.0, pero los pesos originales de NVIDIA y las distribuciones GGUF y de estilos estan bajo NVIDIA Open Model License; es obligatorio revisar las condiciones para uso comercial, atribucion, terminos de IA fiable y cumplimiento comercial.
- El pipeline cubre solo los estilos G1 preprocesados originales. La conversion directa de modelos GLB de Kimodo a `.mbstyle` queda como trabajo de integracion posterior.
- No hay informacion sobre sesgos conocidos ni evaluaciones de seguridad. Como modelo generativo de movimiento, puede producir poses o animaciones no plausibles si no se valida en el contexto de uso.
- No se han publicado benchmarks exhaustivos, por lo que el rendimiento y la calidad no pueden compararse objetivamente con otros generadores de movimiento.
- El modelo no es un modelo de lenguaje: no soporta tool calling, function calling, generacion de texto, vision ni audio.
- En compilaciones sin descarga de modelos hay que gestionar manualmente los bundles locales; el proceso de descarga verifica los manifiestos con SHA-256, pero la ausencia de red puede bloquear la construccion inicial.
- Para uso en control de robots o sistemas de seguridad critica, hay que añadir capas de validacion externa, ya que el modelo no garantiza seguridad de movimiento ni cumple requisitos de certificacion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/chibifire/motion-bricks.cpp
- Repositorio en GitHub: https://github.com/localai-org/motion-bricks.cpp
- Guia de demo: https://github.com/localai-org/motion-bricks.cpp/blob/main/docs/DEMO.md
- Diseno liderado por humanos: https://github.com/localai-org/motion-bricks.cpp/blob/main/docs/motions-bricks.md
- Esquema y plan de implementacion: https://github.com/localai-org/motion-bricks.cpp/blob/main/docs/IMPLEMENTATION.md
- Formatos versionados: https://github.com/localai-org/motion-bricks.cpp/blob/main/docs/FORMATS.md
- Referencia upstream fijada: https://github.com/localai-org/motion-bricks.cpp/blob/main/reference/README.md
- Pesos GGUF publicados por LocalAI-io: https://huggingface.co/LocalAI-io/MotionBricks-G1-GGML
- Upstream de NVIDIA MotionBricks: https://github.com/NVlabs/GR00T-WholeBodyControl
