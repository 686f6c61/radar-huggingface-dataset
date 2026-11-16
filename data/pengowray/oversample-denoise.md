# pengowray/oversample-denoise

## Resumen

Oversample denoiser v2 es una red neuronal convolucional de muy pequeno tamano (64.513 pesos, 264 KB en formato ONNX) disenada especificamente para reducir el ruido de fondo en grabaciones de murcielagos y aves. Lo desarrolla pengowray y se distribuye como parte de la aplicacion Oversample, que descarga este archivo automaticamente al pulsar "Make Denoised Copy" en su menu Noise. Sustituye a la version v1 (oversample-bat-denoise), que solo se entrenaba con grabaciones de murcielagos; la arquitectura y el tamano se mantienen, solo cambian los pesos.

El modelo opera en el dominio de la frecuencia: recibe la magnitud de una STFT de 512 puntos (hop 128, ventana Hann periodica) y devuelve una ganancia por bin, que se aplica para atenuar el ruido. Funciona a la tasa de muestreo nativa de la grabacion, sin remuestreo, lo que permite procesar audio desde 22,05 kHz hasta 384 kHz. Esto lo hace especialmente util en bioacostica, donde las grabaciones de murcielagos usan tasas muy altas (250-500 kHz) que los modelos de denoising genericos no suelen manejar.

Es relevante para investigadores y desarrolladores que trabajan con pipelines de monitorizacion acustica de fauna: ofrece una etapa de preprocesado ligera, ejecutable en CPU, que mejora la relacion senal-ruido de grabaciones de campo antes de tareas posteriores de deteccion o analisis. No es un modelo de lenguaje ni un modelo generativo, sino un procesador de senal especializado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red convolucional (CNN) sobre STFT; entrada/salida (1, 1, 257, frames) |
| Parametros totales | 64.513 pesos |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa bloques de 1.024 frames con 64 frames de contexto a cada lado) |
| Tipos de cuantizacion | no disponible (pesos float32 en ONNX) |
| Idiomas soportados | no aplica (modelo de audio) |
| Licencia | no disponible |
| Formato de pesos | ONNX (opset 17), archivo `oversample-denoise-v2.onnx` de 264 KB |

## Arquitectura y entrenamiento

La red es una CNN pequena que mapea una representacion tiempo-frecuencia a una mascara de ganancia. La entrada `feat` tiene forma (1, 1, 257, frames) y la salida `logit` la misma forma; la ganancia cruda se obtiene como `2 * sigmoid(logit) - 1`. Las features se calculan como `log(|Z| + 0.1)` menos la mediana temporal por bin, en bloques de 1.024 frames con 64 frames de contexto a cada lado. La ganancia se suaviza despues con una mediana de 5 bins x 9 frames (5 x 3 por encima de 96 kHz, para no alargar demasiado las llamadas cortas de murcielago) y se limita al maximo de los vecinos 3 x 3 para evitar que el sonido retenido se expanda. Finalmente se aplica un suelo de ganancia de 0,1, que conserva el 10% de la entrada en todas partes y limita la atenuacion a 20 dB.

El entrenamiento uso 203 grabaciones de murcielagos a 250-500 kHz y 461 grabaciones de aves a 22-96 kHz (casi todas a 44,1 o 48 kHz), todas de xeno-canto, cada una a su tasa nativa. La estrategia consistio en pegar sonidos limpios y fuertes (atenuados para que su propio ruido quedase por debajo del ruido anadido) sobre ruido: para murcielagos, tramos sin llamadas de otras grabaciones; para aves, ruido aleatorio moldeado al suelo de ruido de la propia grabacion. En la funcion de perdida, una estimacion mas silenciosa que el sonido limpio contaba 8 veces mas en murcielagos y 16 veces mas en aves, para preservar mejor los sonidos debiles. Se anadieron dos ajustes para el ruido grave: a cada sonido de ave pegado se le vaciaban los 4 bins mas bajos (porque el retumbe propio ensenaba a la red a conservar ruido grave) y 3 de cada 10 sonidos de ave pegados se ralentizaban entre 1,5 y 4 veces para incluir llamadas de tono bajo. Algunas grabaciones de cada tipo se reservaron para test.

## Capacidades

- Reduccion de ruido de fondo en grabaciones de audio de fauna (murcielagos y aves) mediante mascara de ganancia en el dominio STFT.
- Procesamiento sin remuestreo, a la tasa nativa de la grabacion (desde 22,05 kHz hasta 384 kHz).
- Salida de ganancia por bin con suavizado espacial-temporal y suelo de 0,1 (atenuacion maxima de 20 dB).
- Ejecucion via ONNX Runtime, apta para CPU y para integracion en aplicaciones de escritorio.
- No realiza clasificacion de especies, deteccion de eventos ni transcripcion; es exclusivamente una etapa de preprocesado.
- No dispone de tool calling, agentes, razonamiento multi-paso ni capacidades multilingues (no aplica).

## Casos de uso

- Preprocesado de grabaciones de murcielagos de alta frecuencia: el modelo trabaja directamente a 250-500 kHz sin remuestrear, por lo que puede aplicarse a grabaciones de detector de murcielagos antes de analisis espectral o de conteo de llamadas.
- Limpieza de grabaciones de aves para escucha e inspeccion manual: reduce el ruido de fondo en grabaciones de xeno-canto o de campo a 44,1/48 kHz, facilitando la revision por parte de ornitologos.
- Etapa previa en pipelines de bioacostica: integrado via ONNX Runtime, puede colocarse antes de extractores de embeddings o de modelos de deteccion para mejorar la relacion senal-ruido de la entrada.
- Monitorizacion acustica pasiva: en despliegues con grabadores autonomos, el bajo coste computacional (264 KB, CPU) permite denoisar in situ antes de almacenar o transmitir.
- Herramientas de escritorio para investigadores: la aplicacion Oversample ya lo usa como funcion "Make Denoised Copy"; otros desarrolladores pueden replicar ese flujo con ONNX Runtime.
- Preparacion de datasets de audio: util para homogeneizar el nivel de ruido de grabaciones heterogeneas antes de entrenar o evaluar modelos de clasificacion acustica (con la cautela de que las metricas de BirdNET y Perch empeoran sobre copias denoisadas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el modelo pesa 264 KB y opera sobre buffers de STFT, por lo que cabe en memoria de CPU.
- GPU recomendadas: innecesarias; el modelo esta pensado para ejecucion en CPU via ONNX Runtime. Cualquier GPU compatible con ONNX Runtime podria acelerarlo, pero no aporta ventaja relevante por su tamano.
- Cabe en cualquier GPU consumer y tambien en sistemas embebidos, dada la ausencia de requisitos de VRAM significativos.
- Opciones de despliegue: ONNX Runtime (formato nativo), integracion en la aplicacion Oversample; no se distribuyen pesos en GGUF, safetensors ni otros formatos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / tasa | Licencia | Disponibilidad |
|---|---|---|---|---|
| oversample-denoise v2 | 64.513 pesos (264 KB) | STFT 512 puntos, audio 22 kHz-384 kHz | no disponible | ONNX en Hugging Face |
| oversample-bat-denoise v1 | misma arquitectura y tamano | misma | no disponible | ONNX en Hugging Face (sustituido) |
| Alternativas genericas de denoising | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es con la version v1 del propio autor, que solo se entrenaba con murcielagos; v2 amplia el entrenamiento a aves manteniendo forma y tamano. No se dispone de datos sobre otros modelos de denoising comparables en la informacion proporcionada.

## Limitaciones y advertencias

- En grabaciones de aves se elimina todo lo que este por debajo de unos 180 Hz (a 44,1 y 48 kHz), porque ningun sonido de ave del entrenamiento alcanza los dos bins mas bajos.
- Los sonidos cercanos al nivel de ruido pierden entre 3 y 4 dB en murcielagos y mas en aves.
- Los sonidos muy debiles, apenas por encima del ruido, pueden aparecer y desaparecer intermitentemente, sobre todo con el ajuste Heavy.
- Ruidos transitorios (manipulacion, pasos, voz) se conservan en su mayoria en lugar de eliminarse.
- BirdNET y Perch obtienen puntuaciones mas bajas sobre una copia denoisada que sobre la grabacion original; la identificacion de especies debe hacerse sobre el original.
- La licencia no esta declarada en la informacion disponible, por lo que no puede confirmarse el uso comercial.
- El modelo no clasifica especies ni detecta eventos; usarlo como sustituto de un clasificador produciria resultados incorrectos.
- El repositorio figura con 0 descargas y 0 likes, y no se han publicado benchmarks ni metricas objetivas de rendimiento.

## Enlaces

- Hugging Face: https://huggingface.co/pengowray/oversample-denoise
- Version anterior (v1, solo murcielagos): https://huggingface.co/pengowray/oversample-bat-denoise
- Aplicacion Oversample: https://app.oversample.com
- Fuente de las grabaciones de entrenamiento: xeno-canto (https://xeno-canto.org)
