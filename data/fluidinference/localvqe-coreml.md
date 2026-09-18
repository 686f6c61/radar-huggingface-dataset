# FluidInference/localvqe-coreml

## Resumen

LocalVQE Core ML (`FluidInference/localvqe-coreml`) es la exportacion a Core ML del modelo LocalVQE, un sistema neuronal de mejora de voz en tiempo real que realiza cancelacion acustica de eco (AEC), supresion de ruido y desreverberacion sobre audio de 16 kHz. Lo publica FluidInference como parte de su ecosistema FluidAudio, y deriva directamente de los pesos de `LocalAI-io/LocalVQE`, una variante afinada para CPU del DeepVQE de Indenbom et al. (Interspeech 2023).

El modelo es puramente de procesamiento de senal: no es un modelo de lenguaje ni genera texto. Trabaja de forma causal y con estado explicito, consumiendo dos senales por llamada (`mic`, la captura del microfono, y `ref`, la referencia de far-end, es decir, lo que reprodujo el altavoz) y devolviendo una senal `enhanced`, ademas de 33 tensores de estado que deben realimentarse entre llamadas. Hay dos tamanos, 4,8 M y 1,3 M de parametros, y dos tamanos de bloque, 16 ms (256 muestras) y 256 ms (4096 muestras, 16 hops).

Su relevancia practica esta en que permite ejecutar cancelacion de eco y supresion de ruido de baja latencia de forma local en dispositivos Apple (iOS 17 y macOS 14 como minimo), sin enviar audio a la nube y con un coste computacional muy bajo: entre 0,7 y 7,1 ms por llamada en CPU de un Apple M5 Pro segun variante, lo que equivale a entre 14x y 60x tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal causal con estado para mejora de voz, derivada de DeepVQE (Indenbom et al., Interspeech 2023); el detalle de capas no se especifica en la model card |
| Parametros totales | Dos tamanos: 4,8 M (v1.3) y 1,3 M (v1.2) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica en tokens; el modelo es streaming y con estado. Bloque de 256 muestras (16 ms) o 4096 muestras (256 ms) a 16 kHz. Estado recurrente expuesto como 33 tensores `in_*` / `out_*` |
| Tipos de cuantizacion | Solo fp32; no se publican variantes cuantizadas |
| Idiomas soportados | No disponible; el procesamiento es independiente del idioma (audio de 16 kHz) |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML compilado (`.mlmodelc`); el modelo base upstream usa checkpoints PyTorch (`.pt`) y existe un motor GGML |
| Frecuencia de muestreo | 16 kHz |
| Tareas | Cancelacion acustica de eco, supresion de ruido, desreverberacion |
| Requisitos de plataforma | iOS 17 / macOS 14 o superior |
| Entradas | `mic` `[1, N]` Float32, `ref` `[1, N]` Float32, 33 tensores de estado |
| Salidas | `enhanced` `[1, N]` Float32 y 33 tensores de estado |
| Descargas / likes | 0 / 0 |
| Tamano del repositorio | 0,0 GB (segun HuggingFace) |

## Arquitectura y entrenamiento

La model card no documenta la composicion interna de capas. Lo que si se indica es que se trata de una derivada de DeepVQE (Indenbom et al., Interspeech 2023, arXiv:2306.03177), publicada como pesos en `LocalAI-io/LocalVQE` bajo Apache-2.0, y que la variante distribuida aqui esta ajustada para CPU. El modelo es causal y con estado: cada llamada recibe 33 tensores de estado y devuelve otros 33 que hay que reinyectar en la llamada siguiente, lo que confirma un nucleo recurrente que mantiene memoria entre bloques. Al arrancar, todos los estados se inicializan a cero.

La conversion a Core ML se realizo con el codigo de `FluidInference/mobius` (`models/enhancement/localvqe/coreml`) y el consumo se hace a traves de `LocalVqeManager` / `LocalVqeStream` de FluidAudio. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO; en un modelo de mejora de voz estos conceptos no aplican de la misma forma que en un LLM. El aspecto mas destacable de esta exportacion es la gestion explicita del estado recurrente y la latencia algorritmica: la salida va un hop por detras de la entrada (256 muestras, 16 ms), el primer hop emitido cubre t < 0 y puede descartarse, y hay que inyectar un hop de ceros al final para drenar el modelo. El nivel de salida coincide con el motor GGML upstream, que es 2x la convencion de overlap-add de la referencia PyTorch.

## Capacidades

- Cancelacion acustica de eco (AEC) usando la senal de referencia del altavoz (`ref`), adecuada para escenarios de doble habla (double-talk).
- Supresion de ruido de fondo sobre voz a 16 kHz.
- Desreverberacion de la senal capturada por el microfono.
- Procesamiento en streaming con estado persistente entre llamadas, sin necesidad de ventanas largas ni de procesar el audio completo.
- Dos perfiles de latencia: bloque de 16 ms (1 hop, minima latencia) y bloque de 256 ms (16 hops, menor sobrecarga por llamada). La model card indica que ambas configuraciones producen audio identico.
- Ejecucion local en CPU y en el stack Core ML de Apple, apta para dispositivos sin GPU dedicada.
- No soporta generacion de texto, tool calling, function calling, agentes, razonamiento multi-paso, vision, audio generativo ni traduccion. Es exclusivamente un front-end de mejora de senal de audio.

## Casos de uso

- Videollamadas y VoIP en apps iOS/macOS: el modelo elimina el eco del altavoz y el ruido ambiente antes de codificar el audio, con 16 ms de bloque para mantener una latencia conversacional aceptable y sin enviar audio a servidores externos.
- Asistentes de voz siempre activos en el dispositivo: al ejecutarse integramente en Core ML sobre CPU, permite escucha continua con un consumo minimo (0,7-1,2 ms por bloque de 16 ms en un M5 Pro) sin comprometer la privacidad del usuario.
- Front-end de ASR: la senal `enhanced` sirve de entrada limpia a un motor de reconocimiento de voz, reduciendo errores en entornos ruidosos y en escenarios de manos libres con altavoz.
- Grabacion de notas de voz y podcasts en movil: desreverberacion y supresion de ruido en tiempo real durante la captura, evitando post-proceso por lotes.
- Auriculares y wearables con microfono: variante de 1,3 M de parametros (aproximadamente 5,2 MB en fp32) que cabe en dispositivos con memoria y computo muy limitados.
- Sistemas de manos libres en vehiculo: cancelacion de eco entre el microfono del habitaculo y los altavoces, con la referencia `ref` tomada de la salida del sistema de audio del coche.
- Telepresencia, robots y kioscos de atencion: limpieza de la captura en dispositivos con altavoz y microfono cercanos, donde el eco es el principal problema de calidad.
- Chat de voz en juegos: supresion de ruido de fondo (teclado, ventiladores, ambiente domestico) en la ruta de captura, con latencia de un hop.
- Preprocesado en pipelines de datos de audio: uso offline del mismo modelo para normalizar y limpiar grandes colecciones de grabaciones antes de entrenar otros sistemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (PESQ, DNSMOS, STOI, ERLE) en la informacion disponible. Los unicos datos numericos publicados son de paridad y velocidad:

| Metrica | Valor |
|---|---|
| Paridad con el motor GGML upstream (clip de doble habla) | Diferencia absoluta maxima de 2,8e-5; 80 dB de SNR |
| v1.3, 4,8 M, bloque 256 ms | 7,1 ms por llamada (p50, CPU Apple M5 Pro), 36x tiempo real |
| v1.3, 4,8 M, bloque 16 ms | 1,2 ms por llamada (p50), 14x tiempo real |
| v1.2, 1,3 M, bloque 256 ms | 4,2 ms por llamada (p50), 60x tiempo real |
| v1.2, 1,3 M, bloque 16 ms | 0,7 ms por llamada (p50), 24x tiempo real |

No se proporcionan comparaciones con DeepVQE original ni con otros sistemas de AEC/supresion de ruido.

## Requisitos de hardware

- Pesos en fp32: aproximadamente 19,2 MB para la variante de 4,8 M de parametros y 5,2 MB para la de 1,3 M.
- No requiere VRAM de GPU discreta: el modelo esta pensado para el stack Core ML en Apple Silicon (CPU, GPU integrada o Neural Engine).
- Plataforma minima: iOS 17 o macOS 14.
- Mediciones publicadas sobre Apple M5 Pro en CPU: 7,1 ms por llamada en la variante de 4,8 M con bloque de 256 ms y 1,2 ms con bloque de 16 ms. No hay datos publicados para A-series, M1, M2, M3 ni M4.
- Latencia algoritmica: la salida va un hop (16 ms) por detras de la entrada. Con bloque de 256 ms, el modelo debe acumular ese bloque antes de emitir, por lo que la latencia efectiva percibida es del orden del tamano de bloque mas 16 ms.
- Opciones de despliegue: Core ML a traves de la libreria FluidAudio (`LocalVqeManager` / `LocalVqeStream`); la conversion se realiza con `FluidInference/mobius`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo. El modelo upstream si dispone de motor GGML y de checkpoints PyTorch.
- Throughput: entre 14x y 60x tiempo real en CPU segun variante, lo que deja margen para ejecutar varias instancias concurrentes en el mismo dispositivo.

## Comparativa con modelos similares

Comparativa entre las variantes publicadas en este repositorio:

| Variante | Parametros | Bloque | Latencia por llamada (p50, M5 Pro CPU) | Factor tiempo real | Licencia |
|---|---|---|---|---|---|
| v1.3 4,8 M, 256 ms | 4,8 M | 4096 muestras | 7,1 ms | 36x | Apache-2.0 |
| v1.3 4,8 M, 16 ms | 4,8 M | 256 muestras | 1,2 ms | 14x | Apache-2.0 |
| v1.2 1,3 M, 256 ms | 1,3 M | 4096 muestras | 4,2 ms | 60x | Apache-2.0 |
| v1.2 1,3 M, 16 ms | 1,3 M | 256 muestras | 0,7 ms | 24x | Apache-2.0 |

Alternativas de la misma categoria mencionadas en el ecosistema (DeepVQE original, RNNoise, DTLN, DeepFilterNet): no se dispone en la informacion proporcionada de sus parametros, contexto, licencia ni resultados comparativos verificados, por lo que no se incluyen cifras. La unica referencia directa documentada es DeepVQE (Indenbom et al., Interspeech 2023), del que LocalVQE es una derivada ajustada para CPU, con paridad numerica frente al motor GGML upstream (2,8e-5 de diferencia maxima absoluta, 80 dB de SNR).

## Limitaciones y advertencias

- Ambito restringido: solo procesa voz a 16 kHz. No soporta generacion de texto, razonamiento, codigo, vision ni ninguna tarea propia de un modelo de lenguaje.
- La salida esta desfasada un hop (256 muestras, 16 ms) respecto a la entrada; el primer hop emitido cubre t < 0 y debe descartarse, y es necesario inyectar un hop de ceros al final para drenar el estado. Omitir estos pasos produce artefactos en los bordes.
- La gestion de estado es manual: hay que realimentar los 33 tensores `out_*` como `in_*` de la llamada siguiente. Un mal manejo del estado rompe la continuidad del audio.
- Dependencia de plataforma: el formato `.mlmodelc` esta atado al stack Core ML de Apple (iOS 17 / macOS 14 minimo). No es portable directamente a Linux, Android o Windows.
- No se publican metricas objetivas de calidad (PESQ, DNSMOS, ERLE, STOI) ni evaluaciones en escenarios de doble habla mas alla del clip de demo usado para verificar paridad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y 0,0 GB de tamano reportado, por lo que no existe validacion independiente de la comunidad.
- No se documentan sesgos, comportamiento con idiomas concretos ni rendimiento en condiciones acusticas adversas (ruido no estacionario, reverberacion fuerte, multiples hablantes).
- La model card no detalla el dataset de entrenamiento ni el proceso de ajuste, lo que dificulta evaluar la cobertura de dominios.
- Licencia Apache-2.0, que permite uso comercial, pero se debe citar el repositorio upstream (`localai-org/LocalVQE`, `CITATION.cff`) y el paper de DeepVQE. Conviene verificar las condiciones de los pesos base `LocalAI-io/LocalVQE` antes de un despliegue en produccion.
- Al ser una exportacion de un modelo upstream, cualquier mejora o correccion debe llegar primero al modelo original y reexportarse; este repositorio no es la fuente de verdad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FluidInference/localvqe-coreml
- Modelo base (pesos): https://huggingface.co/LocalAI-io/LocalVQE
- Repositorio upstream LocalVQE: https://github.com/localai-org/LocalVQE
- Libreria de consumo FluidAudio: https://github.com/FluidInference/FluidAudio
- Codigo de conversion a Core ML (mobius): https://github.com/FluidInference/mobius
- Paper de DeepVQE (Indenbom et al., Interspeech 2023): https://arxiv.org/abs/2306.03177
