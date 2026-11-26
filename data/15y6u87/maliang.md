# 15y6u87/MaLiang

## Resumen

MaLiang es un modelo de difusion de video para generar mundos de juego a partir de su estado logico. Lo desarrolla el equipo de YeyingLab y se distribuye como un conjunto de checkpoints afinados sobre Wan-AI/Wan2.2-TI2V-5B. El problema que aborda es el de la renderizacion neuronal de videojuegos: en lugar de rasterizar un estado de juego con un motor grafico tradicional, MaLiang toma un mapa de clases enteras (`uint8`) por pixel y lo transforma en fotogramas de video coherentes, sin necesidad de un video proxy renderizado ni de codificar el estado con el VAE de video.

La relevancia tecnica esta en dos decisiones de diseno. Primero, la inyeccion del estado se hace mediante un pequeno encoder de pooling de clases que alimenta directamente el transformer de difusion, lo que evita el coste y la perdida de informacion de una codificacion VAE intermedia. Segundo, el modelo desplegado es un estudiante causal de cuatro pasos obtenido mediante un pipeline de destilacion en tres etapas (teacher forcing, destilacion por consistencia y DMD), lo que habilita generacion en streaming en tiempo real a partir de un modelo profesor bidireccional.

El repositorio ocupa 50,1 GB e incluye tanto el profesor como el estudiante desplegado y tres ablaciones. Esta pensado para investigadores en world models, generacion de video condicionada y renderizacion neuronal, no como un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion de video (Wan2.2-TI2V-5B) con encoder de pooling de clases para inyeccion de estado |
| Parametros totales | 5B (heredados del modelo base Wan2.2-TI2V-5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

MaLiang parte de Wan2.2-TI2V-5B, un transformer de difusion de video image-to-video. La innovacion principal es el mecanismo de condicionamiento: el estado del juego se rasteriza en un mapa de clases enteras `uint8` por pixel, que se inyecta en el transformer mediante un encoder de pooling de clases de pequeno tamano. No se genera un video proxy renderizado ni se codifica el estado con el VAE de video, lo que elimina una etapa costosa y una fuente de perdida de informacion. El vocabulario de clases es `parts_fx` y la resolucion de trabajo es 832x480.

El entrenamiento del profesor bidireccional se realizo con teacher forcing durante 10.667 pasos (checkpoint `sft_fxcond_v1_step-10667.safetensors`). Sobre ese profesor se aplica un pipeline de destilacion en tres etapas: teacher forcing, destilacion por consistencia y DMD (Distribution Matching Distillation). El resultado es un estudiante causal de cuatro pasos (`fxcond_v1_stage3_ema_step500.safetensors`, EMA en el paso 500 de la etapa 3), disenado para generacion en streaming en tiempo real. El repositorio incluye ademas tres ablaciones que comparan el condicionamiento por mapa de enteros frente a alternativas con video coloreado pasado por el VAE de Wan o por un encoder ligero.

## Capacidades

- Generacion de video image-to-video condicionada por un mapa de clases por pixel.
- Renderizacion de mundos de juego a partir de su estado logico, sin motor grafico tradicional.
- Generacion causal en cuatro pasos con el estudiante destilado, apta para streaming.
- Modelado de mundo (world model) para entornos de juego.
- Condicionamiento por mapa semantico de clases enteras (`uint8`) con vocabulario `parts_fx`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales: modo de generacion causal de cuatro pasos, resolucion 832x480.

## Casos de uso

- Renderizacion neuronal de videojuegos en tiempo real: el estudiante causal de cuatro pasos permite generar fotogramas a partir del estado del juego en streaming, sustituyendo o complementando la rasterizacion tradicional en prototipos y demos.
- Investigacion en world models: el modelo sirve como banco de pruebas para estudiar como se inyecta estado estructurado (mapas de clases) en un transformer de difusion de video sin pasar por un VAE.
- Prototipado rapido de estilos visuales: al condicionar sobre un mapa semantico, se pueden explorar variaciones de apariencia manteniendo la estructura del estado del juego.
- Generacion de video condicionada por mapas semanticos: util en pipelines donde se dispone de una segmentacion por clases y se quiere sintetizar video fotorrealista o estilizado coherente con ella.
- Estudio de destilacion de modelos de difusion: los checkpoints de profesor, estudiante y ablaciones permiten reproducir y analizar el pipeline teacher forcing, consistencia y DMD en un caso concreto.
- Evaluacion de metodos de condicionamiento: las tres ablaciones incluidas (video coloreado por VAE, video coloreado por encoder ligero, mapa de enteros) permiten comparar estrategias de inyeccion de estado en tareas de generacion de video.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Un modelo de difusion de video de 5B en bf16 requiere del orden de decenas de GB de VRAM; el repositorio ocupa 50,1 GB e incluye varios checkpoints, no un unico peso.
- GPU recomendadas: no disponible en la informacion proporcionada. Por el tamano del modelo base (5B) y la generacion de video a 832x480, se requiere hardware de datacenter o GPUs de gama alta; no se confirman modelos concretos.
- Cabe en consumer GPU: no disponible.
- Opciones de despliegue: la libreria declarada es `diffsynth`; las instrucciones de instalacion e inferencia estan en el repositorio de GitHub (https://github.com/YeyingLab/MaLiang). El modelo base Wan2.2-TI2V-5B se descarga por separado.
- Latencia y throughput estimados: no disponible. El estudiante causal de cuatro pasos esta disenado para streaming en tiempo real, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MaLiang | 5B (base Wan2.2-TI2V-5B) | no disponible | Difusion de video image-to-video con condicionamiento por mapa de clases | Apache-2.0 | Hugging Face (15y6u87/MaLiang) |
| Wan2.2-TI2V-5B | 5B | no disponible | Difusion de video image-to-video | no disponible en la informacion proporcionada | Hugging Face (Wan-AI/Wan2.2-TI2V-5B) |
| Alternativas de world models para juegos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre MaLiang y otras alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: esta especializado en renderizacion de mundos de juego a partir de mapas de clases `uint8`; no es un modelo de proposito general.
- Dependencia del vocabulario `parts_fx`: el condicionamiento esta atado a ese conjunto de clases, por lo que usarlo con otro esquema de segmentacion requiere reentrenamiento o adaptacion.
- Resolucion fija de 832x480: no se documentan otras resoluciones soportadas.
- Riesgo de alucinacion visual: como modelo de difusion, puede generar detalles incoherentes con el estado de entrada, especialmente en regiones ambiguas del mapa de clases.
- Idiomas soportados: no disponible; no se documentan capacidades linguisticas.
- Sesgos conocidos: no disponible; no se documenta la composicion del dataset de entrenamiento.
- Uso comercial: la licencia Apache-2.0 lo permite, pero el modelo base Wan2.2-TI2V-5B se distribuye por separado y sus terminos deben verificarse de forma independiente.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado en noviembre de 2026; se trata de una publicacion reciente y sin validacion comunitaria amplia.
- Requisitos de hardware no documentados: no se publican cifras de VRAM ni latencia, lo que dificulta planificar despliegues en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/15y6u87/MaLiang
- Codigo y instrucciones: https://github.com/YeyingLab/MaLiang
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
