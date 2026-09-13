# kerzgrr/diffusionminer

## Resumen

Diffusion Miner es un modelo de mundo (*world model*) condicionado por acciones que aprende a simular un *sandbox* de minería con arena que cae. Lo publica el usuario kerzgrr en HuggingFace bajo licencia Apache 2.0. No es un modelo de lenguaje: no procesa ni genera texto, sino que sintetiza el siguiente fotograma de un videojuego 2D a partir del estado visual reciente y del vector de acciones del jugador. El objetivo declarado por el autor es tener un mundo jugable generado íntegramente por difusión, sin motor físico ni motor de render.

La relevancia del artefacto está en su naturaleza interactiva y en tiempo casi real: genera 256×256 píxeles a 12 FPS con unos 220 millones de parámetros, lo que lo sitúa en un rango de tamaño que cabe en GPUs de gama alta de consumo. Combina un *transformer* de difusión con un prefijo de atención de 12 fotogramas latentes y una memoria recurrente ConvGRU que recorre 48 fotogramas, de modo que mantiene coherencia temporal a lo largo de una partida.

Esta publicación concreta es el *checkpoint* de la etapa de profesor (*teacher stage*) con flujo instantáneo (*instantaneous flow*) y está pensada para inferencia en un solo paso: el autor indica explícitamente que no existe un estudiante destilado. Se distribuye como un paquete de inferencia completo (pesos, códec, configuración y scripts) más que como un modelo aislado, lo que facilita su reproducción pero limita su uso fuera del *pipeline* previsto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de mundo condicionado por acciones: transformer de difusion con prefijo de atencion y memoria recurrente ConvGRU |
| Parametros totales | Aproximadamente 220 millones (cifra indicada por el autor; no se desglosa por modulo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 12 fotogramas latentes de prefijo de atencion; memoria ConvGRU que recorre 48 fotogramas |
| Tipos de cuantizacion | No se documentan esquemas de cuantizacion; el autor indica que se requiere BF16 en GPU CUDA |
| Idiomas soportados | No aplica (modelo de video; no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`ema.safetensors`) para el modelo; `codec.pt` (PyTorch) para el VAE; `config.json` con ajustes de video, modelo y codec |

Otros datos del repositorio: tamano aproximado de 0,9 GB, libreria declarada `pytorch`, `pipeline_tag: other`, 0 descargas y 1 like en el momento de la consulta, creado el 12 de septiembre de 2026 y actualizado el mismo dia.

## Arquitectura y entrenamiento

El modelo es un world model de difusion condicionado por acciones. Predice el siguiente fotograma latente del juego a partir de un prefijo de 12 fotogramas latentes atendidos por el transformer y de una memoria de mundo implementada con un ConvGRU que barre 48 fotogramas. El vector de accion es de 7 dimensiones (izquierda, derecha, salto, cavar izquierda, cavar derecha, cavar arriba, cavar abajo) expresado como flotantes en {0,1}; las teclas de movimiento opuestas se cancelan y solo una direccion de excavacion puede estar activa a la vez. La salida se decodifica a 256×256 píxeles y el sistema objetivo se ejecuta a 12 FPS.

El códec no es un VAE generico de imagenes: es un Tile VAE congelado, entrenado especificamente sobre este juego, lo que reduce el dominio del espacio latente y evita depender de pesos tipo SDXL. El autor describe el checkpoint como la etapa de profesor con flujo instantaneo, ajustada para inferencia en un unico paso (`--steps 1`), sin estudiante destilado. No se especifican en la informacion disponible el numero de tokens o fotogramas de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de RLHF, DPO o entrenamiento por preferencias; tampoco se detallan innovaciones adicionales como decodificacion especulativa.

## Capacidades

- Generacion de video interactivo: sintetiza el siguiente fotograma de un sandbox de arena que cae a partir del estado latente previo y de las acciones del jugador.
- Control por acciones discretas: responde a un vector de 7 acciones binarias (movimiento horizontal, salto y cuatro direcciones de excavacion) con cancelacion de ejes opuestos.
- Coherencia temporal a corto plazo: el prefijo de atencion de 12 fotogramas latentes y la memoria ConvGRU de 48 fotogramas sostienen la consistencia de la escena durante la partida.
- Simulacion implicita de fisica de arena: reproduce el comportamiento de caida y excavacion de material sin un motor fisico explicito.
- Interaccion en vivo: incluye un lanzador (`live_infer.py`) con ventana interactiva, captura de foco y reinicio por semilla.
- Inyeccion manual de entidades: hacer clic en el lienzo inserta un minero en el historial latente, lo que permite alterar el estado del mundo.
- Grabacion reproducible: modo `--autoplay` con minero guionizado para generar clips GIF de duracion fija (`--frames`).
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades de agente, vision de imagenes naturales ni procesamiento de lenguaje.

## Casos de uso

- Investigacion en world models: sirve como banco de pruebas reproducible para estudiar difusion aplicada a entornos interactivos, con una configuracion completa (pesos, códec y scripts) que permite replicar la inferencia en un solo paso.
- Prototipado de mecanicas de juego: un estudio puede generar variantes visuales y de comportamiento de un sandbox de mineria sin escribir un motor fisico, ajustando el vector de acciones para explorar como responde el modelo.
- Generacion de datos sinteticos para aprendizaje por refuerzo: las partidas autogeneradas con el minero guionizado (`--seed-play --autoplay`) producen secuencias de pares estado-accion utilizables para entrenar o evaluar agentes.
- Evaluacion de planificadores y agentes: al ser un entorno determinista por semilla y controlable por teclado o por script, permite medir si un agente aprende a excavar o desplazarse dentro de un mundo generado.
- Demostraciones interactivas y divulgacion: el lanzador con ventana y controles de teclado (A/D, W o espacio, flechas, Esc para salir) es adecuado para exhibiciones, clases o instalaciones donde el publico juega contra el modelo.
- Benchmarking de inferencia en tiempo real: con un objetivo de 12 FPS a 256×256, el modelo sirve para medir latencia, uso de VRAM y comportamiento de BF16 en distintas GPUs dentro de un caso de uso interactivo.
- Estudio de compresion latente especifica de dominio: el Tile VAE congelado entrenado sobre este juego permite analizar como afecta un códec especializado a la calidad y estabilidad de la generacion frente a VAEs de proposito general.
- Pruebas de estabilidad temporal: la ventana de 48 fotogramas de memoria recurrente lo hace util para estudiar deriva de escena, acumulacion de artefactos y perdida de coherencia en horizontes largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como FVD, PSNR, SSIM ni comparaciones cuantitativas con otros world models. El unico dato de rendimiento declarado es el objetivo de ejecucion de 256×256 a 12 FPS en una GPU CUDA con BF16.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. Como referencia orientativa, los pesos de unos 220 millones de parametros en BF16 ocupan aproximadamente 0,45 GB; sumando el Tile VAE, las activaciones y la memoria recurrente de 48 fotogramas, la estimacion practica razonable se situa en el rango de 4 a 8 GB. Es una estimacion, no un dato del repositorio.
- GPU recomendadas: cualquier GPU CUDA con soporte nativo de BF16, es decir, arquitectura Ampere o posterior (RTX 30xx/40xx, A100, H100 y equivalentes). El autor advierte que los fallos tipicos provienen de GPUs sin capacidad BF16.
- Cabe en GPU de consumo: si, previsiblemente en modelos con 8 GB o mas de VRAM (RTX 3060 12 GB, RTX 3070, RTX 4060 Ti, RTX 4070, RTX 4080, RTX 4090). No se especifica el minimo exacto ni el rendimiento por tarjeta.
- Opciones de despliegue: no se documentan integraciones con vLLM, TGI, llama.cpp u Ollama (no aplican a un modelo de difusion de video). El despliegue previsto es el script propio `live_infer.py` junto con el paquete `livediffusion/` y los pesos descargados con `huggingface_hub`.
- Dependencias declaradas: `torch`, `numpy`, `pillow`, `safetensors` y `huggingface_hub`, ademas de una GPU CUDA con BF16.
- Latencia y throughput: el unico valor declarado es el objetivo de 12 FPS a 256×256. No se publican latencias por GPU, throughput en lote ni consumo de memoria medido.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos verificados de benchmarks ni de especificaciones de modelos comparables, por lo que las cifras de las alternativas se marcan como no disponibles. La comparacion se limita a la categoria y a la disponibilidad declarada.

| Modelo | Categoria | Parametros | Resolucion / contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Diffusion Miner (kerzgrr) | World model de difusion condicionado por acciones | ~220 M | 256×256, 12 FPS, 12 fotogramas de atencion y 48 de memoria | Apache 2.0 | Pesos y codigo de inferencia publicados |
| GameNGen (Google) | World model de difusion para un entorno tipo Doom | No disponible | No disponible | No disponible | No disponible en esta informacion |
| DIAMOND (equipo DIAMOND) | World model de difusion para Atari | No disponible | No disponible | No disponible | No disponible en esta informacion |
| Oasis (Decart / Etched) | World model interactivo tipo Minecraft | No disponible | No disponible | No disponible | No disponible en esta informacion |

Los resultados de la busqueda web realizada no contienen informacion tecnica sobre ninguno de estos modelos ni sobre el propio Diffusion Miner, por lo que cualquier cifra adicional deberia verificarse en las fuentes originales de cada proyecto antes de usarse en una comparativa.

## Limitaciones y advertencias

- Dominio extremadamente estrecho: el modelo solo genera el sandbox de mineria para el que fue entrenado. No es un modelo general de video ni de imagenes.
- Requisito estricto de hardware: necesita una GPU CUDA con BF16. En GPUs sin soporte nativo de BF16 (por ejemplo, generaciones anteriores a Ampere) la ejecucion puede fallar.
- Estado del checkpoint: es la etapa de profesor con flujo instantaneo y sin estudiante destilado, de modo que la inferencia debe hacerse con un unico paso (`--steps 1`). Aumentar los pasos no es el ajuste previsto.
- Dependencia del paquete completo: `live_infer.py` requiere que el resto del snapshot (incluido `livediffusion/`) este en `sys.path`; ejecutarlo de forma aislada provoca errores.
- Riesgo de deriva y de alucinacion visual: como modelo generativo sin motor fisico, puede producir incoherencias de escena, artefactos y desviaciones respecto a la dinamica real del juego, especialmente en horizontes largos.
- Cobertura temporal limitada: la atencion cubre 12 fotogramas latentes y la memoria recurrente 48, por lo que la consistencia a largo plazo no esta garantizada.
- Sesgos: no se documenta ningun analisis de sesgos, y al no operar sobre lenguaje o imagenes naturales el concepto de sesgo social no aplica de la misma forma; si aplican sesgos derivados de la distribucion del dataset de juego, que no se describe.
- Idiomas: no aplica; el modelo no procesa texto ni audio.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero no se aportan garantias ni se documentan patentes o derechos de terceros sobre los datos de entrenamiento, cuya composicion no se especifica.
- Reproducibilidad: no se publican semillas de entrenamiento, tamano del dataset, numero de pasos de entrenamiento ni curvas de perdida, lo que dificulta auditar el resultado.
- Adopcion minima: el repositorio registra 0 descargas y 1 like en el momento de la consulta, por lo que no existe aun una comunidad que haya validado el comportamiento del modelo en distintas configuraciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kerzgrr/diffusionminer
- Archivos incluidos en el repositorio: `ema.safetensors` (pesos jugables del profesor), `codec.pt` (Tile VAE congelado), `config.json` (ajustes de video, modelo y codec), `livediffusion/` (paquete de inferencia), `live_infer.py` (lanzador de juego en vivo) y `demo.gif` (clip de juego guionizado).
- La busqueda web realizada no ha devuelto enlaces relevantes al modelo: los resultados obtenidos tratan sobre motores de busqueda y no guardan relacion con Diffusion Miner. No se dispone de paper, blog tecnico, repositorio de codigo adicional ni demo publica mas alla del material del repositorio de HuggingFace.
