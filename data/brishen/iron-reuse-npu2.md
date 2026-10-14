# brishen/iron-reuse-npu2

## Resumen

`brishen/iron-reuse-npu2` es un paquete de despliegue para AMD Ryzen AI NPUs del modelo de mejora de voz `nvidia/RE-USE`. No se trata de un entrenamiento nuevo ni de un ajuste fino, sino de una exportacion realizada con el toolkit IRON de AMD que contiene los kernels compilados para NPU (ficheros `.xclbin` e instruction streams) junto con los pesos empaquetados que reproduce el runtime en Rust `taconite-reuse`. El resultado permite ejecutar todo el pipeline de enhancement (convoluciones, proyecciones y scans de Mamba) directamente sobre la NPU XDNA, sin GPU.

El modelo subyacente, RE-USE, es un sistema universal de mejora de voz basado en arquitectura SEMamba (state space model de tipo Mamba). Acepta audio de entrada degradado (con ruido, reverberacion, clipping, banda limitada o dano por codec) a 8, 16, 22.05, 24, 32, 44.1 o 48 kHz y devuelve voz mejorada a la misma frecuencia de muestreo. El paquete esta compilado especificamente para NPU2 (AIE2P: Strix Point, Strix Halo, Krackan) y no carga en NPU1 (Phoenix, Hawk Point).

Su relevancia es doble: por un lado demuestra la viabilidad de ejecutar un modelo secuencial basado en Mamba sobre aceleradores NPU integrados, y por otro ofrece un caso de despliegue de inference de audio en el borde sin depender de GPU dedicada. El repositorio ocupa 52.1 MB repartidos en 436 ficheros, con licencia upstream no comercial, lo que limita su uso a investigacion y educacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SEMamba (state space model de tipo Mamba) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa segmentos de audio; a partir de ~5 s usa `inference_chunk.py`) |
| Tipos de cuantizacion | no disponible (pesos empaquetados para NPU; el runtime opera sobre kernels compilados) |
| Idiomas soportados | no disponible (procesamiento de senal de voz, no dependiente del idioma) |
| Licencia | other / upstream: NVIDIA One-Way Noncommercial License (NSCLv1), solo investigacion no comercial y educacion |
| Formato de pesos | `.xclbin` (kernels NPU) + pesos empaquetados para el runtime `taconite-reuse` |

## Arquitectura y entrenamiento

La arquitectura del modelo es SEMamba, una red de mejora de voz basada en modelos de espacio de estados (Mamba) combinada con componentes convolucionales. La model card indica de forma explicita que en la inferencia sobre NPU se ejecutan "cada convolucion, proyeccion y scan de Mamba" en el acelerador, lo que confirma la presencia de bloques SSM (scan selectivo) y de capas convolucionales/proyecciones dentro del grafo. El modelo opera como un sistema universal a multiples frecuencias de muestreo (8-48 kHz) sin reentrenamiento por tasa.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre el uso de RLHF o DPO en la informacion proporcionada. Los pesos son los originales de NVIDIA y se redistribuyen junto con la licencia NSCLv1. La innovacion relevante de esta exportacion no esta en el entrenamiento sino en la compilacion: los kernels se han traducido para la microarquitectura AIE2P, y la comprobacion `reuse check` sobre un Ryzen AI 9 HX 370 reporta entre 35 y 46 dB de SNR de forma de onda frente a la red en float32 sobre GPU (dos implementaciones float32 coinciden en torno a 43 dB), lo que valida numericamente la exportacion.

## Capacidades

- Mejora de voz universal (*speech enhancement*) de audio a audio, con salida a la misma frecuencia de muestreo que la entrada.
- Eliminacion de ruido (*denoising*) y supresion de reverberacion.
- Recuperacion de senal recortada (*clipping*) y de banda limitada.
- Reparacion de audio danado por codec (artefactos de compresion).
- Soporte de multiples frecuencias de muestreo: 8, 16, 22.05, 24, 32, 44.1 y 48 kHz.
- Procesamiento por segmentos para entradas de mas de ~5 s mediante `inference_chunk.py`.
- Entrada y salida en formatos m4a, MP3, FLAC y WAV a traves del runtime.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio generativo ni modo thinking.

## Casos de uso

- Limpieza de grabaciones de voz para podcasts o entrevistas: el modelo toma audio con ruido de fondo o reverberacion y devuelve senal limpia a la misma tasa, adecuado para postproduccion sin GPU.
- Preprocesado de audio para ASR en el borde: limpiar la voz antes de pasarla a un motor de reconocimiento de habla reduce la tasa de error en entornos ruidosos, y al ejecutarse en NPU no compite por la GPU.
- Restauracion de archivos historicos o archivisticos: recuperacion de grabaciones con clipping o banda limitada (por ejemplo, audio telefonico a 8 kHz) manteniendo coherencia de frecuencia de muestreo.
- Limpieza de audio danado por compresion con codec: correccion de artefactos en ficheros MP3 o m4a ya codificados, util en pipelines de ingest de contenido.
- Herramienta de escritorio para creadores de contenido: integracion en una CLI (por ejemplo `reuse-clean noisy.m4a`) que produce `noisy.clean.m4a`, aprovechando la NPU de portatiles Ryzen AI sin requerir GPU dedicada.
- Prototipado de investigacion en mejora de voz: usar la comprobacion `reuse check` para comparar la salida NPU contra la referencia float32 en GPU y validar variantes del pipeline.
- Voz limpia en comunicaciones en tiempo real (con reservas): dado que procesa 5.1 s en 2.8 s a 16 kHz y 7.4 s a 44.1 kHz sobre Ryzen AI 9 HX 370, es apto para escenarios casi en tiempo real a tasas bajas, no para streaming estricto a 44.1/48 kHz sin solapamiento de ventanas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de modelo (PESQ, STOI, DNSMOS, MMLU, etc.) en la informacion disponible. El unico dato cuantitativo aportado es la fidelidad de la exportacion respecto a la red float32, medida como SNR de forma de onda.

| Metrica | Valor |
|---|---|
| SNR de forma de onda (NPU vs. red float32) | 35-46 dB sobre el clip de ejemplo a cinco tasas |
| Concordancia entre dos implementaciones float32 | ~43 dB |
| Tiempo de inferencia, 5.1 s a 44.1 kHz | 7.4 s (Ryzen AI 9 HX 370) |
| Tiempo de inferencia, 5.1 s a 16 kHz | 2.8 s (Ryzen AI 9 HX 370) |
| Hardware de medida | AMD Ryzen AI 9 HX 370 |

## Requisitos de hardware

- Acelerador principal: NPU2 (AIE2P), es decir, AMD Strix Point, Strix Halo o Krackan. No carga en NPU1 (Phoenix, Hawk Point).
- VRAM de GPU: no disponible; este paquete no esta pensado para ejecucion sobre GPU. La GPU solo se usa como referencia float32 para la comparacion en `reuse check`.
- Memoria del sistema: el bundle ocupa 52.1 MB, por lo que el requisito de memoria para los pesos y kernels es bajo.
- CPU/GPU de consumo: no aplica para esta exportacion; el objetivo es la NPU integrada de los portatiles Ryzen AI.
- Opciones de despliegue: runtime `taconite-reuse` (Rust) sobre XRT, o directamente sobre el driver `amdxdna` con la caracteristica `direct`. La instalacion se hace con `cargo install taconite-reuse --features decode,encode` o `--no-default-features --features cli,direct,decode,encode`.
- Latencia/throughput: 7.4 s para 5.1 s de audio a 44.1 kHz y 2.8 s para 5.1 s a 16 kHz en Ryzen AI 9 HX 370.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto/Tasas | Licencia | Disponibilidad |
|---|---|---|---|---|
| `brishen/iron-reuse-npu2` | Exportacion NPU de SEMamba | 8-48 kHz, multi-tasa | NSCLv1 (solo no comercial) | HuggingFace + runtime Rust |
| `nvidia/RE-USE` | Modelo original SEMamba | 8-48 kHz, multi-tasa | NSCLv1 (solo no comercial) | HuggingFace, checkpoint con `inference.py` |
| Otros modelos de mejora de voz (por ejemplo DeepFilterNet, FRCRN) | Redes dedicadas a enhancement | No disponible en la informacion proporcionada | No disponible | No disponible |

La comparacion directa a nivel de calidad de audio no puede establecerse porque no se han publicado metricas objetivas de enhancement en la informacion disponible. La diferencia clave entre este paquete y `nvidia/RE-USE` es exclusivamente el backend de ejecucion: la variante aqui descrita compila para NPU AMD, mientras que la original esta pensada para GPU/CPU con las utilidades de inferencia de NVIDIA.

## Limitaciones y advertencias

- Licencia no comercial: los pesos estan bajo la NVIDIA One-Way Noncommercial License (NSCLv1), que restringe el uso a investigacion y educacion no comerciales. No es apto para produccion comercial sin permiso adicional.
- Restriccion de hardware estricta: los kernels solo cargan en NPU2 (Strix Point, Strix Halo, Krackan); no funcionan en NPU1 ni en GPUs genericas con este paquete.
- El modelo no esta pensado para ejecucion en GPU con esta exportacion; la referencia float32 sobre GPU solo se usa para validacion.
- Para audio de mas de ~5 s, no se procesa de una vez: el runtime usa `inference_chunk.py`, lo que puede introducir artefactos en las transiciones entre segmentos.
- Riesgo de alucinacion o artefactos en audio: no se documentan tasas de fallo ni comportamientos en condiciones extremas de ruido; no hay metricas subjetivas publicadas (DNSMOS, PESQ, STOI).
- Sesgos: no disponibles; no se documenta el dominio de entrenamiento, por lo que se desconoce el comportamiento en idiomas poco representados o en voces atipicas.
- Ausencia de soporte multilingue declarado: los idiomas soportados figuran como no disponibles; el modelo opera sobre la senal acustica, pero no se especifica su cobertura de idiomas o acentos.
- Rendimiento en tiempo real limitado: a 44.1 kHz el procesamiento es mas lento que la reproduccion (7.4 s para 5.1 s), lo que obliga a procesamiento por lotes o a tasas reducidas si se quiere baja latencia.
- Popularidad nula en el momento de la ficha: 0 descargas y 0 likes, sin validacion independiente de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/brishen/iron-reuse-npu2
- Modelo base NVIDIA RE-USE: https://huggingface.co/nvidia/RE-USE
- Toolkit IRON: https://github.com/amd/IRON
- Runtime `taconite-reuse`: https://crates.io/crates/taconite-reuse
- Documentacion de `taconite-reuse`: https://docs.rs/taconite-reuse
- Codigo fuente de taconite: https://github.com/Brishen/taconite
- Licencia NSCLv1: https://github.com/NVlabs/HMAR/blob/main/LICENSE
