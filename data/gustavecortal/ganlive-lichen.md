# gustavecortal/ganlive-lichen

## Resumen

ganlive-lichen es un generador de imagenes incondicional basado en FastGAN, publicado por el autor independiente gustavecortal bajo licencia MIT. Su particularidad es la combinacion de alta resolucion (3072x2048, proporcion 3:2) con inferencia en tiempo real: 9,4 ms por fotograma, lo que equivale a 107 fps sobre una GPU de gama de entrada como la Intel Arc A770 (unos 350 dolares). No es un modelo de lenguaje ni un modelo multimodal, sino una GAN puramente generativa de imagenes.

El modelo esta pensado para ser explorado en vivo mediante ganlive, una herramienta del mismo autor que carga generadores GAN (StyleGAN2, FastGAN o cualquier GAN en formato ONNX), expone controles sobre el espacio latente y permite manipularlos a mano, con MIDI o disparados por percusion. De ahi su enfoque hacia arte generativo, visuales en directo y VJ. El latente tiene una anchura de 256 y el entrenamiento se realizo con gantrain, tambien del mismo autor.

Se trata de un modelo de nicho, con 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados y con un repositorio de solo 0,1 GB. Su relevancia es acotada: demuestra que es viable generar imagenes de ~6 megapixeles a mas de 100 fps en hardware modesto, algo poco habitual en el ecosistema de difusion, y lo empaqueta en un flujo de trabajo reproducible y con licencia permisiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastGAN (generador adversarial generativo, unconditional image generation) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (generacion de imagen incondicional, sin entrada de texto) |
| Tipos de cuantizacion | no disponible (ganlive admite generadores exportados a ONNX) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | Checkpoint de PyTorch para el framework ganlive; ganlive acepta tambien generadores en ONNX |

## Arquitectura y entrenamiento

La arquitectura es FastGAN, descrita en el paper arXiv:2101.04775. Se trata de una GAN disenada para entrenamiento rapido y estable con pocos datos, con un espacio latente de anchura 256 y una salida de 3072x2048 en proporcion 3:2. Al ser una GAN incondicional, no acepta prompts ni texto: la generacion se controla exclusivamente recorriendo el espacio latente, lo que encaja con el paradigma de exploracion manual y reactiva a audio de ganlive.

El entrenamiento se llevo a cabo con la herramienta gantrain del autor, sobre un dataset de 5.469 fotografias propias que cubren lugares, objetos y texturas. No se especifica en la model card el numero de iteraciones, el tamano de lote, la composicion exacta del dataset ni si se aplicaron tecnicas de regularizacion adicionales (por ejemplo, R1 o path length regularization); todos esos datos figuran como no disponibles. Existe un modelo hermano, ganlive-amber, entrenado sobre las mismas fotografias a 1536x1024, descrito como mas ligero y rapido.

## Capacidades

- Generacion de imagenes incondicional a 3072x2048 (proporcion 3:2).
- Inferencia en tiempo real: 9,4 ms por fotograma (107 fps) sobre Intel Arc A770.
- Exploracion interactiva del espacio latente de 256 dimensiones.
- Control en vivo mediante MIDI o entrada de audio (modo audio-reactivo) a traves de ganlive.
- Ejecucion multiplataforma (Windows, macOS, Linux) sobre GPU NVIDIA, AMD, Intel o Apple, o directamente en CPU.
- Carga de generadores GAN alternativos (StyleGAN2, FastGAN) o de cualquier GAN en formato ONNX dentro de la misma herramienta.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades multilingues ni modo de razonamiento, por tratarse de un modelo puramente generativo de imagen.

## Casos de uso

- Visuales en directo para VJ: el modelo genera fotogramas a 107 fps, de modo que puede alimentar una salida de video en tiempo real sincronizada con la musica mediante MIDI o entrada de audio, sin los tiempos de espera tipicos de los modelos de difusion.
- Instalaciones de arte generativo interactivo: el recorrido del latente en 256 dimensiones permite crear piezas donde el publico modifica la imagen en vivo sin reentrenar ni recargar el modelo.
- Fondos y texturas de alta resolucion para produccion grafica: la salida de 3072x2048 (proporcion 3:2) es directamente utilizable como fondo de pantalla, textura o material de composicion sin reescalado posterior.
- Prototipado rapido de paletas visuales: al recorrer el latente se obtienen variaciones coherentes de un mismo motivo (lugares, objetos, texturas), util para explorar direcciones artisticas antes de comprometer un render final.
- Sesiones de musica electronica en vivo: la entrada de percusion o MIDI dispara cambios de imagen, lo que convierte al modelo en una capa visual reactiva dentro de un set.
- Demostraciones de investigacion en generacion adversarial en tiempo real: sirve como referencia reproducible de que una FastGAN entrenada con unas 5.500 imagenes puede alcanzar 6 megapixeles a mas de 100 fps en hardware de 350 dolares.
- Pipeline de generacion de assets para videojuegos o visuales escenicos: al exportarse a ONNX, el generador puede integrarse en aplicaciones propias fuera del ecosistema Python.
- Exploracion de la relacion entre espacio latente y semantica visual: los controles por dimension permiten estudiar que ejes del latente producen cambios de color, textura o composicion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica de rendimiento documentada es la velocidad de inferencia: 9,4 ms por fotograma, equivalentes a 107 fps sobre una Intel Arc A770.

## Requisitos de hardware

- El autor indica que ganlive funciona en cualquier GPU (NVIDIA, AMD, Intel, Apple) o en CPU, sin especificar VRAM minima.
- El dato de referencia de rendimiento es 107 fps sobre una Intel Arc A770, una GPU de gama de entrada de unos 350 dolares, lo que sugiere que el modelo cabe holgadamente en GPUs de consumo actuales.
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible; la unica verificada por el autor es la Intel Arc A770.
- Cabe en GPU de consumo: si, segun el autor, sobre practicamente cualquier GPU moderna; el modelo hermano ganlive-amber es aun mas ligero y rapido.
- Opciones de despliegue: la herramienta ganlive (con linea de comandos `ganlive play`), y cualquier runtime capaz de cargar generadores ONNX.
- Latencia y throughput: 9,4 ms/frame y 107 fps en Intel Arc A770; no se publican cifras para otras GPUs ni para CPU.

## Comparativa con modelos similares

| Modelo | Resolucion | Latente | Velocidad declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ganlive-lichen | 3072x2048 | 256 | 107 fps en Intel Arc A770 | MIT | HuggingFace |
| ganlive-amber | 1536x1024 | no disponible | mas rapido y ligero que lichen, sin cifra concreta | MIT | HuggingFace |
| StyleGAN2 generico | variable | no disponible | no disponible | variable segun implementacion | Se puede cargar en ganlive |

La model card no ofrece comparativas con otras GAN contemporaneas ni con modelos de difusion; los unicos puntos de comparacion explicitos son su modelo hermano y la compatibilidad generica con StyleGAN2 dentro de ganlive.

## Limitaciones y advertencias

- Modelo incondicional: no acepta prompts de texto, por lo que no se puede dirigir la generacion mediante lenguaje natural.
- Dataset de entrenamiento reducido y personal: 5.469 fotografias propias del autor, lo que puede sesgar el estilo y los motivos generados hacia ese corpus concreto y limitar la diversidad de salidas.
- No hay informacion publica sobre sesgos, filtrado de contenido o comportamiento fuera de la distribucion de entrenamiento.
- Riesgo de artefactos propios de las GAN y de memorizacion parcial del dataset de entrenamiento, no cuantificado por el autor.
- No se han publicado benchmarks, evaluaciones FID ni comparaciones objetivas de calidad.
- Licencia MIT, permisiva, sin restricciones conocidas para uso comercial; conviene aun asi verificar las condiciones del codigo de ganlive y gantrain por separado.
- Escasa adopcion: 0 descargas y 0 likes, sin comunidad que valide el comportamiento en produccion.
- La ausencia de pesos en formato GGUF o cuantizaciones documentadas limita su uso fuera del ecosistema PyTorch/ONNX.
- El repositorio ocupa solo 0,1 GB, por lo que conviene comprobar que los pesos completos estan efectivamente incluidos antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gustavecortal/ganlive-lichen
- Modelo hermano ganlive-amber: https://huggingface.co/gustavecortal/ganlive-amber
- Herramienta ganlive: https://github.com/gustavecortal/ganlive
- Herramienta de entrenamiento gantrain: https://github.com/gustavecortal/gantrain
- Paper de FastGAN: https://arxiv.org/abs/2101.04775
- Video de demostracion: https://huggingface.co/gustavecortal/ganlive-lichen/resolve/main/live.mp4
