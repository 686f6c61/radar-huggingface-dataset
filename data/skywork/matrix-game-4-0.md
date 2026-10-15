# Skywork/Matrix-Game-4.0

## Resumen

Matrix-Game 4.0 es una familia de modelos de renderizado de vídeo causal especializados por escena, publicada por Skywork AI. No es un generador de vídeo de propósito general: se trata de un renderizador neuronal que recibe como entrada el RGB limpio de un juego ejecutable (sin HUD ni superposición de teclado) y produce fotogramas de vídeo de baja poligonización coherentes con la geometría y la física que dicta ese juego. El motor ejecutable controla el gameplay, la física y la entrada; el modelo solo se encarga de re-renderizar la imagen.

El modelo se distribuye en tres puntos de control independientes, uno por escena: Medieval Castle, Ancient Egypt y City Racing. Cada punto de control tiene 5.001.016.512 parámetros en BF16 (aproximadamente 5B), parte del modelo base alibaba-pai/Wan2.2-Fun-5B-Control y se apoya en recursos compartidos (codificador T5, tokenizador y VAE de Wan2.2, más el códec completo TAEHV). La resolución de salida es de 480x864 RGB y el pipeline declarado es video-to-video.

Su relevancia actual radica en el enfoque de "renderizado neuronal acoplado a motor": en lugar de generar píxeles de forma autoregresiva sin anclaje físico, el modelo re-renderiza sobre un estado de juego determinista, lo que permite mantener coherencia temporal mediante un sink de identidad y una caché de atención de 21 fotogramas latentes. Los pesos requieren el código de inferencia de Matrix-Game 4.0; no son pipelines de Diffusers listos para usar, y ni el código ni los datos de entrenamiento están incluidos en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT causal sobre base Wan2.2-Fun-5B-Control; VAE de Wan2.2 para calidad y codec TAEHV para tiempo real |
| Parametros totales | 5.001.016.512 por punto de control (BF16); aproximadamente 5B |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica en texto; cache de atencion de 21 fotogramas latentes, incluido el sink |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (pesos de escena, imagenes sink y assets de juego); recursos compartidos Wan/umT5 bajo Apache-2.0; TAEHV bajo MIT |
| Formato de pesos | safetensors (BF16); el codec TAEHV se distribuye como base/taew2_2.pth |
| Pipeline declarado | video-to-video |
| Resolucion de salida | 480x864 RGB |
| Tamano del repositorio | 30,2 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer de difusion (DiT) causal afinado sobre alibaba-pai/Wan2.2-Fun-5B-Control. El modelo funciona en modo streaming: un fragmento latente corresponde a cuatro fotogramas RGB tras el arranque, mientras que el fragmento inicial contiene un solo fotograma RGB. La coherencia temporal se gestiona con un "sink" de identidad y politicas de RoPE distintas segun la escena: Castle y Egypt usan un sink de identidad independiente con RoPE de posicion relativa fija, mientras que Racing utiliza la imagen suministrada como fotograma cero de salida y un sink de posicion absoluta. Estas politicas no son intercambiables.

El sistema ofrece dos preajustes. El de calidad usa codificacion y decodificacion con el VAE de Wan, dos pasos de eliminacion de ruido (1000 y 500) y un DiT nativo. El preajuste en tiempo real usa el codec TAEHV (base/taew2_2.pth), un unico paso (1000) y un DiT optimizado para una sola GPU con grafos CUDA. En ambos casos el CFG es 1 y el desplazamiento del planificador es 5. La escena de carreras omite la eliminacion de ruido en su primer fotograma suministrado. Los subtitulos de los shooter son fijos; Racing admite subtitulos de motor fijos o dinamicos por fragmento. No se publican ni el codigo ni los datos de entrenamiento, ni el numero de tokens de entrenamiento, la composicion del dataset o el uso de RLHF/DPO.

## Capacidades

- Renderizado de video causal fotograma a fotograma a partir del RGB limpio de un juego ejecutable, en tres escenas especializadas: Medieval Castle, Ancient Egypt y City Racing.
- Mantenimiento de coherencia temporal mediante sink de identidad y cache de atencion de 21 fotogramas latentes.
- Dos modos de inferencia con distinto coste y calidad: preajuste de calidad (VAE de Wan, dos pasos) y preajuste en tiempo real (TAEHV, un paso, grafos CUDA).
- Integracion con subtitulos fijos (shooter) y subtitulos de motor fijos o dinamicos por fragmento (racing).
- Presentacion desacoplada: HUD y sonido permanecen como capas separadas alineadas por fotograma, no forman parte de la salida neuronal.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje).
- Capacidades multilingues: no disponible.
- Capacidad especial: renderizado de video de baja poligonizacion acoplado a un motor de juego que controla colisiones, fisica y entrada.

## Casos de uso

- Prototipado de renderizado neuronal en videojuegos: el modelo permite sustituir el rasterizador tradicional por un renderizador neuronal que re-genera la imagen a partir del RGB limpio del motor, util para evaluar estilos visuales low-poly sin reescribir el motor.
- Investigacion en modelos de mundo (world models): sirve como banco de pruebas para estudiar coherencia temporal y deriva de apariencia en modelos de video causal, dado que el estado de juego subyacente es determinista y verificable.
- Compresion o transmision de gameplay: en el preajuste de tiempo real con TAEHV, un fragmento latente cubre cuatro fotogramas RGB, lo que abre la puerta a representaciones latentes compactas del video de un juego.
- Generacion de video para ilustracion de escenas concretas: con los checkpoints de Castle o Egypt se pueden producir clips de 480x864 coherentes con una camara y geometria fijas, utiles como material promocional de baja poligonizacion.
- Simulacion de conduccion visual: el checkpoint de razado (City Racing) re-renderiza una ruta urbana tomando la imagen suministrada como fotograma cero, aplicable a demostraciones de conduccion sin captura real.
- Analisis de politica de renderizado: comparar el preajuste de calidad (dos pasos, VAE de Wan) frente al de tiempo real (un paso, TAEHV) sobre la misma escena permite medir el compromiso entre fidelidad y coste computacional.
- Acoplamiento motor-modelo en pipelines de investigacion: al estar el gameplay, la fisica y la entrada separados del modelo, se puede instrumentar el bucle completo y medir deriva geometrica o de oclusion de forma objetiva.
- Generacion de datos sinteticos etiquetados: como el estado de juego es determinista, el video re-renderizado puede emparejarse con etiquetas exactas de posicion, colision o acciones para entrenar otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente que no reclama ningun benchmark de rendimiento y que no hay una tasa de fotogramas garantizada, un ajuste de memoria garantizado en GPU de consumo ni una reconstruccion exacta de la escena.

## Requisitos de hardware

- VRAM estimada: los pesos de cada checkpoint suman 5.001.016.512 parametros en BF16, lo que equivale a aproximadamente 9,3 GiB solo en pesos (calculo derivado del numero de parametros; no lo especifica la model card). A esa cifra hay que anadir el codificador T5, el VAE de Wan2.2 o el codec TAEHV, la cache de atencion de 21 fotogramas latentes y las activaciones de inferencia.
- GPU recomendadas: no disponible. La model card no enumera modelos concretos de GPU (A100, H100, RTX 4090 u otros).
- Compatibilidad con GPU de consumo: no disponible. La model card afirma que no garantiza que el modelo quepa en memoria de GPU de consumo.
- Opciones de despliegue: los pesos requieren el codigo de inferencia de Matrix-Game 4.0 y no son pipelines de Diffusers listos para usar. El despliegue se realiza mediante el descargador de manifiestos del repositorio fuente, fijando una revision de commit del Hub y usando `--repo-id Skywork/Matrix-Game-4.0 --repo-type model`. El preajuste de tiempo real esta optimizado para una sola GPU con grafos CUDA.
- Latencia y throughput: no disponible. No se declaran valores de latencia ni de fotogramas por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / cache | Resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Matrix-Game 4.0 | 5.001.016.512 por punto de control (BF16) | Cache de atencion de 21 fotogramas latentes | 480x864 RGB | Apache-2.0 | Pesos en HuggingFace; requiere codigo de inferencia propio |
| Wan2.2-Fun-5B-Control (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible | Apache-2.0 | HuggingFace (alibaba-pai/Wan2.2-Fun-5B-Control) |
| Otros renderizadores de video causal para juegos | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye datos de rendimiento comparativo entre Matrix-Game 4.0 y otras alternativas, por lo que la comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Los modelos estan especializados en las escenas low-poly y los perfiles de camara suministrados; se degradan ante geometria no vista, movimiento rapido de camara, oclusion y sesiones largas, lo que puede provocar deriva de apariencia o errores geometricos.
- La salida neuronal no modifica las colisiones ni el gameplay: el motor ejecutable sigue siendo la fuente de verdad fisica.
- El preajuste de un paso con TAEHV y el de dos pasos con Wan tienen calidad y coste distintos; no son intercambiables sin consecuencias.
- No hay ninguna garantia de tasa de fotogramas, de ajuste en memoria de GPU de consumo ni de reconstruccion exacta de la escena.
- Las politicas de sink y RoPE no son intercambiables entre escenas: Castle y Egypt usan sink de identidad con RoPE relativa fija, mientras que Racing usa posicion absoluta y la imagen suministrada como fotograma cero.
- Riesgo de alucinacion visual: al ser un modelo generativo, puede inventar detalle geometrico no presente en el estado de juego, aunque este no afecte a la fisica.
- Uso correcto de recursos compartidos: hay que emplear los archivos exactos del manifiesto y no versiones arbitrarias de aguas arriba ni el VAE de 16 canales de Wan2.1. Para el codec rapido hay que usar base/taew2_2.pth completo; un decodificador independiente no sustituye a su codificador.
- Restricciones de licencia: los pesos de escena, imagenes sink y assets de juego son Apache-2.0. Los recursos compartidos Wan/umT5 conservan sus terminos Apache-2.0 de origen. TAEHV es de Ollin Boer Bohan bajo licencia MIT. El audio de Racing incluye material CC0 y CC BY 3.0, por lo que debe conservarse racing/assets/audio/CREDITS.md. Se debe revisar THIRD_PARTY_NOTICES.md para las dependencias de codigo.
- Idiomas soportados: no disponible; no se declara soporte multilingue.
- No se incluyen el codigo ni los datos de entrenamiento, lo que limita la reproducibilidad y el ajuste fino por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Skywork/Matrix-Game-4.0
- Codigo fuente: https://github.com/SkyworkAI/Matrix-Game
- Sitio web del proyecto: https://matrix-game-v4-0.github.io/page/
- Modelo base (Wan2.2-Fun-5B-Control): https://huggingface.co/alibaba-pai/Wan2.2-Fun-5B-Control
- Revision fijada del modelo base: https://huggingface.co/alibaba-pai/Wan2.2-Fun-5B-Control/tree/b8bc1a65ab71d054ba4636dc0dac104aa4df2686
- Codificador umT5: https://huggingface.co/google/umt5-xxl
- Repositorio de TAEHV: https://github.com/madebyollin/taehv
- Skywork AI: https://skywork.ai/
