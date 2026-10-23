# eli-aifund/bbf-atari100k-tfjs

## Resumen

`bbf-atari100k-tfjs` es un conjunto de instantáneas (checkpoints) de políticas de aprendizaje por refuerzo entrenadas con el algoritmo BBF («Bigger, Better, Faster», Schwarzer et al. 2023) sobre el benchmark Atari 100k, y exportadas al formato de TensorFlow.js para su ejecución en el navegador. Lo publica el usuario `eli-aifund` y se usa como motor de la demo web «Two Hours of Atari» (`elichen.github.io/atari/`). No es un modelo de lenguaje: es una política de control (una red neuronal que asigna valores Q a acciones discretas a partir de fotogramas del juego), por lo que conceptos como longitud de contexto, idiomas o generación de texto no aplican.

El interés práctico del repositorio está en el formato y en el procedimiento de exportación: cada checkpoint se distribuye como un par `policy.json` (descripción de tensores) más `policy.bin` (pesos binarios), con kernels convolucionales en float16 y kernels densos en int8 con una escala por columna de salida. Incluye además ficheros `test.json` con valores Q de referencia calculados en JAX sobre estados reales del juego, lo que permite verificar numéricamente la corrección de la inferencia en JavaScript.

El entrenamiento sigue la configuración `BBF.gin` publicada por los autores: ratio de repetición de 64, dos actualizaciones por paso del entorno, una sola semilla por juego y guardado cada 10.000 movimientos. Cubre los 26 juegos de Atari 100k, con unos 10 checkpoints por juego (en torno a 260 instantáneas), lo que explica el tamaño de 0,6 GB del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional con codificador residual tipo SPR y cabezas de valor/Q; entrenada con el algoritmo BBF (aprendizaje por refuerzo, no transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada = pila de fotogramas del entorno Atari (ventana definida en `BBF.gin`, valor exacto no disponible) |
| Tipos de cuantizacion | conv kernels en float16; dense kernels en int8 con una escala por columna de salida |
| Idiomas soportados | no disponible; no aplica (no procesa texto) |
| Licencia | apache-2.0 |
| Formato de pesos | TensorFlow.js: `policy.json` (metadatos de tensores) + `policy.bin` (pesos binarios), organizados como `<juego>/<paso>/` |

Otros datos relevantes: tamano del repo 0,6 GB; pipeline declarado `reinforcement-learning`; descargas 0 y likes 0 en el momento de la consulta; creado y actualizado el 2026-10-23.

## Arquitectura y entrenamiento

El modelo subyacente es BBF, un agente de aprendizaje por refuerzo profundo para entornos con presupuesto de interacción muy limitado. BBF combina tres ingredientes descritos en el articulo de Schwarzer et al. (2023): una red de mayor capacidad con codificador convolucional residual (herencia de SPR), un ratio de repetición alto (64) habilitado mediante reinicios periódicos de la red («deep resets») con la tecnica de shrink-and-perturb, y una seleccion de actualizaciones priorizando las de mayor utilidad. El resultado es un agente que alcanza rendimiento de nivel humano en Atari 100k, es decir, con unas dos horas de experiencia de juego (100.000 pasos del entorno).

Cada juego se entrena con una unica semilla, usando la configuracion `BBF.gin` publicada por los autores: dos actualizaciones por paso del entorno y guardado de la red objetivo cada 10.000 movimientos. Con 100.000 pasos por juego se obtienen del orden de diez instantaneas por titulo, cubriendo los 26 juegos del benchmark. Las instantaneas exportadas corresponden a la red objetivo (target network), no a la red online. La exportacion a TensorFlow.js aplica cuantizacion mixta (float16 en convoluciones, int8 con escala por columna en capas densas) para reducir el peso de cada checkpoint y hacer viable su descarga en el navegador; los ficheros `test.json` guardan valores Q de referencia generados en JAX sobre estados reales, lo que sirve como prueba de equivalencia funcional tras la conversion.

## Capacidades

- Control de politica en 26 juegos de Atari 100k a partir de fotogramas en bruto del emulador.
- Salida de valores Q por accion discreta (el conjunto de acciones depende del juego, segun la envoltura estandar de Atari).
- Inferencia en navegador mediante TensorFlow.js (WebGL/WebGPU/CPU) sin backend Python.
- Verificacion numerica de la conversion gracias a los ficheros `test.json` con Q-values de referencia en JAX.
- Reejecucion determinista de una politica concreta en un paso de entrenamiento dado (seleccion de checkpoint por `<juego>/<paso>`).
- No soporta tool calling, function calling, agentes multi-paso, generacion de texto, codigo, matematicas ni vision general fuera del dominio Atari.
- No dispone de modo «thinking», audio ni capacidades multilingues.

## Casos de uso

- Demo educativa en navegador: cargar un checkpoint concreto de `<juego>/<paso>` y mostrar en tiempo real como evoluciona la politica cada 10.000 movimientos, ilustrando curvas de aprendizaje sin instalar Python.
- Verificacion de pipelines de exportacion: usar los `test.json` como test de regresion para comprobar que una conversion JAX a TensorFlow.js (o a otro runtime) reproduce los Q-values de referencia dentro de una tolerancia definida.
- Docencia de aprendizaje por refuerzo: comparar visualmente el comportamiento de la red en los primeros pasos frente a los ultimos, evidenciando el efecto del ratio de repeticion y de los reinicios de red.
- Referencia para investigación en eficiencia de muestras: punto de partida reproducible para estudiar variantes de BBF con distinto numero de actualizaciones por paso, reutilizando los checkpoints publicados como linea base.
- Benchmark de runtimes de inferencia en el cliente: medir latencia por fotograma de TF.js en WebGL frente a WebGPU o CPU con una red de tamano fijo y conocida.
- Prototipado de interfaces de «agente observable»: integrar la politica en una visualizacion interactiva que permita al usuario pausar, retroceder y comparar checkpoints de un mismo juego.
- Arte generativo y visualizaciones: generar trayectorias de juego reproducibles a partir de una instantanea concreta para video o material divulgativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye puntuaciones agregadas (human-normalized mean/median, IQM) para estos checkpoints; solo indica que los ficheros `test.json` contienen valores Q de referencia en JAX sobre estados reales, que constituyen una comprobacion de equivalencia numerica y no una evaluacion de rendimiento en el juego. Para cifras de rendimiento del algoritmo de referencia debe consultarse el articulo de Schwarzer et al. (2023); este repositorio no las reproduce.

## Requisitos de hardware

- El modelo esta pensado para inferencia en cliente: no requiere GPU dedicada; funciona en navegador con TensorFlow.js sobre WebGL, WebGPU o CPU.
- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia, el repositorio completo (en torno a 260 instantaneas) ocupa 0,6 GB, lo que situa cada checkpoint individual en el orden de unos pocos megabytes (estimacion derivada, no confirmada por el autor).
- GPU recomendadas: ninguna en particular; cualquier GPU integrada o dedicada con soporte WebGL 2 es suficiente. Para entrenamiento desde cero del algoritmo BBF seria necesaria al menos una GPU de clase A100 o superior, pero ese dato no se aporta en la informacion disponible.
- Cabe en GPU de consumo: si, y tambien en movil y en navegador de escritorio; el cuello de botella es la descarga de pesos, no la memoria.
- Opciones de despliegue: TensorFlow.js en navegador (`@tensorflow/tfjs`), `tfjs-node` para ejecucion en servidor Node.js, y cualquier runtime capaz de leer `policy.json`/`policy.bin` tras escribir un cargador propio. No se distribuyen pesos en GGUF, safetensors ni ONNX.
- Latencia y throughput: no disponibles. Dependeran del backend de TF.js, del juego y del dispositivo; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / presupuesto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bbf-atari100k-tfjs (este) | no disponible | Atari 100k (100.000 pasos de entorno) | no publicado en la model card | apache-2.0 | Pesos TF.js en HuggingFace |
| BBF original (Schwarzer et al. 2023) | no disponible | Atari 100k | Resultados agregados en el articulo; no reproducidos aqui | no disponible en la informacion proporcionada | Implementacion de referencia de los autores |
| SPR (Schwarzer et al. 2021) | no disponible | Atari 100k | no disponible | no disponible | Implementacion de referencia |
| EfficientZero | no disponible | Atari 100k | no disponible | no disponible | Implementacion de referencia |

La comparacion cuantitativa no es posible con los datos disponibles: la model card no incluye parametros, puntuaciones ni detalles de las alternativas. La unica comparacion defendible es cualitativa: este repositorio es una exportacion de un unico algoritmo (BBF) con una semilla por juego orientada a ejecucion en navegador, mientras que las implementaciones de referencia estan pensadas para entrenamiento y evaluacion en Python/JAX.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa ni genera texto, codigo ni imagenes fuera del dominio de fotogramas de Atari.
- Una sola semilla por juego: la varianza entre semillas del benchmark Atari 100k es alta, por lo que estos checkpoints no deben usarse para afirmar superioridad de BBF frente a otros metodos.
- Presupuesto de entrenamiento limitado a 100.000 pasos (aproximadamente dos horas de juego): el techo de rendimiento por juego es acotado y algunos titulos pueden mostrar politicas claramente suboptimas.
- Se exporta la red objetivo, no la red online; los valores pueden diferir ligeramente de los que produciria el agente durante el entrenamiento.
- La cuantizacion int8 de las capas densas con una escala por columna introduce error numerico respecto a los pesos originales en float32; los `test.json` permiten acotarlo, pero no se documenta la tolerancia aceptada.
- No hay informacion sobre sesgos, casos de fallo ni evaluacion fuera de los 26 juegos estandar.
- La licencia apache-2.0 permite uso comercial y modificacion con aviso de copyright y atribucion; no se especifican restricciones adicionales, pero tampoco se documenta la procedencia exacta de los pesos originales de BBF.
- El repositorio declara 0 descargas y 0 likes y fue creado y actualizado el mismo dia: no hay evidencia de mantenimiento ni de validacion por terceros.
- Los resultados de la busqueda web realizada no aportan informacion sobre este modelo (los enlaces encontrados tratan sobre el nombre propio «Eli» y son irrelevantes); no se han localizado articulos, blogs ni demos adicionales mas alla de la pagina citada en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eli-aifund/bbf-atari100k-tfjs
- Demo «Two Hours of Atari»: https://elichen.github.io/atari/
- Articulo de referencia del algoritmo: Schwarzer et al., «Bigger, Better, Faster: Human-level Atari with human-level efficiency» (2023), citado en la model card; no se incluye identificador porque no aparece en la informacion proporcionada.
- No se han encontrado en la busqueda web papers, repositorios ni demos adicionales asociados a este modelo.
