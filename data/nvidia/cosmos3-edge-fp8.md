# nvidia/Cosmos3-Edge-FP8

## Resumen

Cosmos3-Edge-FP8 es la variante cuantizada en FP8 del modelo base Cosmos3-Edge, desarrollado por NVIDIA dentro de su plataforma de world foundation models Cosmos. Se trata de un modelo omnimodal de 4.000 millones de parametros (3.858.999.728 segun los pesos en safetensors) disenado para Physical AI: robots, vehiculos autonomos y entornos industriales o smart spaces. A partir de combinaciones de texto, imagen, video y trayectorias de accion, genera texto, imagenes, video y comandos de accion coherentes.

La relevancia de este checkpoint reside en que aplica cuantizacion FP8 a componentes seleccionados del modelo base manteniendo arquitectura y aplicaciones, lo que reduce el coste de memoria y facilita el despliegue en infraestructura de inferencia con aceleracion FP8. Esta pensado para investigacion y produccion en comprension del mundo, generacion de video, simulacion y aprendizaje de politicas encarnadas (embodied policy learning).

El modelo se publica bajo licencia OpenMDW 1.1, con uso comercial y no comercial permitido, y se distribuye en formato safetensors con un tamano de repositorio de 6,4 GB. La fecha de creacion en Hugging Face es el 14 de septiembre de 2026 y la ultima actualizacion el 10 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Transformers (MoT): torre autorregresiva para tokens discretos y torre de difusion para generacion multimodal continua |
| Parametros totales | 4B (3.858.999.728 segun safetensors) |
| Parametros activos | no disponible (no se documenta como MoE disperso; MoT no implica parametros activos reducidos) |
| Longitud de contexto | 4096 tokens para entrada de texto |
| Tipos de cuantizacion | FP8 (variante cuantizada del modelo base Cosmos3-Edge); no se detallan otros formatos |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 (openmdw1.1-license) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Cosmos3 emplea una arquitectura Mixture-of-Transformers (MoT) con dos torres complementarias: una torre transformer autorregresiva que genera tokens discretos mediante decodificacion next-token estandar, y una torre de difusion que sintetiza modalidades continuas (imagen, video, audio y acciones) mediante denoising iterativo. Esta separacion permite modelar modalidades heterogeneas en un unico marco conservando el mecanismo de generacion mas adecuado para cada una. El modelo se construye sobre el Cosmos Framework de NVIDIA.

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO. La variante FP8 aplica cuantizacion a componentes seleccionados del modelo base, conservando la arquitectura y los casos de uso previstos; no se especifica que capas concretas se cuantizan ni la perdida de calidad asociada.

## Capacidades

- Generacion de texto mediante decodificacion autorregresiva.
- Generacion de imagenes en 256p y 480p con relaciones de aspecto 16:9, 4:3, 1:1, 3:4 y 9:16.
- Generacion de video en MP4 a 256p y 480p, con 12-30 fps y entre 50 y 150 frames, configurables por peticion mediante `size`, `fps` y `num_frames`.
- Generacion de comandos de accion en JSON con forma (T, D) para embodimentes compatibles: movimiento de camara general (9D), vehiculo autonomo (9D), movimiento egocentrico (57D), brazo Franka Panda simple con pinza RobotiQ (10D), doble Franka Panda con RobotiQ (20D), Agibot (29D), UR (10D), Google robot (10D), WidowX 250 (10D) y UMI (10D).
- Entrada de trayectorias de accion con longitud de secuencia entre 16 y 400.
- Comprension multimodal y simulacion del mundo: prediccion de futuro y razonamiento sobre acciones.
- Entrada de imagen en RGB de 8 bits por canal en espacio sRGB; no admite escala de grises.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio como capacidades especiales: el modelo genera audio segun la descripcion general de la familia Cosmos3, pero la model card de este checkpoint no detalla parametros de entrada/salida de audio.

## Casos de uso

- Simulacion de entornos roboticos: dado un estado inicial en imagen o video y una trayectoria de accion, el modelo genera el video del resultado esperado, lo que permite validar politicas antes de ejecutarlas en hardware real y reducir costes de prueba fisica.
- Planificacion de movimiento de brazos manipuladores: con entradas de 10D o 20D para Franka Panda y pinza RobotiQ, genera comandos de accion compatibles con el embodiment, util para generar datos de entrenamiento o inicializar controladores.
- Conduccion autonoma: acepta trayectorias de accion de vehiculo (9D) y genera predicciones de video y acciones, adecuado para escenarios de validacion de percepcion y prediccion de trayectorias en simulacion.
- Generacion de video sintetico para entrenamiento: produce clips de 50-150 frames a 480p y 12-30 fps que pueden usarse como datos aumentados para modelos de percepcion, con control de resolucion y duracion por peticion.
- Captura de movimiento egocentrico: con entradas de 57D, modela movimiento de camara en primera persona para aplicaciones de realidad aumentada, teleoperacion o analisis de actividad.
- Gemelos digitales de espacios industriales: combinando texto e imagen de referencia, genera video de evolucion del entorno para planificacion de layout de fabrica o simulacion de flujos de trabajo.
- Investigacion en embodied AI: sirve como base para experimentos de world understanding y policy learning, con pesos abiertos y licencia que permite uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 3.858.999.728 parametros en FP8, el peso de los pesos ronda los 3,9 GB; sumando overhead de activaciones, buffers de difusion y cache KV para 4096 tokens, se debe prever un margen adicional considerable, aunque la cifra exacta no esta disponible.
- GPU recomendadas: no disponible en la informacion proporcionada. La cuantizacion FP8 requiere hardware con soporte nativo de FP8 para aprovechar sus ventajas (generaciones Hopper o posteriores en el catalogo de NVIDIA); no se confirma compatibilidad con otras gamas.
- Cabe en GPU de consumo: no confirmado. El tamano de pesos en FP8 es compatible en terminos de memoria con GPU de consumo de gama alta, pero la model card no certifica este escenario.
- Opciones de despliegue: la libreria indicada es `cosmos`; no se detallan integraciones con vLLM, llama.cpp, Ollama o TGI. El codigo de referencia esta en el repositorio github.com/nvidia/cosmos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cosmos3-Edge-FP8 | 4B | 4096 tokens (texto) | Texto, imagen, video, accion | OpenMDW 1.1 | Hugging Face |
| Cosmos3-Edge (base) | 4B | 4096 tokens (texto) | Texto, imagen, video, accion | OpenMDW 1.1 | Hugging Face |
| Otras variantes Cosmos3 | no disponible | no disponible | no disponible | OpenMDW 1.1 | Coleccion nvidia/cosmos3 |

No se dispone de datos de benchmarks ni de especificaciones de modelos de terceros en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al ser un modelo entrenado para Physical AI, puede heredar sesgos de los datasets de robotica y conduccion empleados, no detallados.
- Riesgo de alucinacion en la generacion de video y acciones: las predicciones de futuro son plausibles pero no garantizan consistencia fisica, por lo que no deben usarse como unica fuente en sistemas de control reales sin validacion.
- La entrada de imagen solo admite RGB de 8 bits en sRGB; las imagenes en escala de grises no son compatibles.
- La generacion de acciones esta restringida a los embodimentes listados; no hay soporte generico para dimensiones arbitrarias.
- El contexto de texto esta limitado a 4096 tokens.
- No se especifica la perdida de calidad introducida por la cuantizacion FP8 respecto al modelo base, ni que componentes se cuantizan.
- La licencia OpenMDW 1.1 permite uso comercial, pero conviene revisar sus terminos completos antes de desplegar en produccion.
- No hay informacion sobre idiomas soportados, lo que impide garantizar calidad multilingue.
- El numero de descargas (45) y likes (1) indica una adopcion muy temprana; no hay evidencia de comunidad ni de validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/Cosmos3-Edge-FP8
- Coleccion Cosmos3: https://huggingface.co/collections/nvidia/cosmos3
- Ejemplos Cosmos3: https://huggingface.co/collections/nvidia/cosmos3-examples
- Codigo: https://github.com/nvidia/cosmos
- White paper: https://research.nvidia.com/labs/cosmos-lab/cosmos3/technical-report.pdf
- Sitio web: https://research.nvidia.com/labs/cosmos-lab/cosmos3/
- Cosmos Framework: https://github.com/nvidia/cosmos-framework
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
