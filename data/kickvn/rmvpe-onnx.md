# kickvn/rmvpe-onnx

## Resumen

RMVPE (Robust Model for Vocal Pitch Estimation) es un modelo de estimacion de tono fundamental (F0) disenado especificamente para musica polifonica y voz cantada. Fue propuesto por Wei et al. en el articulo presentado en Interspeech 2023 y esta orientado a detectar la melodia vocal dominante en mezclas musicales donde conviven multiples fuentes sonoras. Este repositorio concreto, `kickvn/rmvpe-onnx`, ofrece una exportacion a ONNX del modelo original, dividida en dos grafos independientes para permitir un reparto de carga entre GPU y CPU.

La innovacion de esta version es la separacion del modelo en dos ficheros: `rmvpe_cnn.onnx` (183,5 MB), que contiene el front-end mel y la U-Net, y `rmvpe_gru.onnx` (2,4 MB), que contiene la BiGRU y la capa de salida. El objetivo es que la parte pesada se ejecute en aceleradores como DirectML o CoreML mientras la parte recurrente permanece en CPU, optimizando el rendimiento en entornos de escritorio. Esta pensado para integrarse en aplicaciones de produccion musical, como el DAW KICK que lo utiliza para pitch vocal.

El modelo no es un LLM ni un modelo generativo de texto: es un extractor de F0. Su salida es un mapa de saliencia con 360 bins separados 20 cents, con una frecuencia base de 32,70 Hz y una resolucion temporal de 10 ms por frame. La licencia es MIT y el repositorio ocupa aproximadamente 0,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (front-end mel + U-Net) + BiGRU, dividida en dos grafos ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio por frames de 10 ms) |
| Tipos de cuantizacion | no disponible (pesos exportados en float32) |
| Idiomas soportados | no aplica (modelo de audio, independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | ONNX (`rmvpe_cnn.onnx`, `rmvpe_gru.onnx`) |

## Arquitectura y entrenamiento

RMVPE combina un front-end de extraccion de caracteristicas mel con una U-Net que procesa la representacion espectral, seguida de una BiGRU que modela la secuencia temporal y una capa de salida que produce el mapa de saliencia. El modelo original fue entrenado por Wei et al. para estimacion de pitch vocal en musica polifonica, y los pesos aqui distribuidos provienen de `rmvpe.pt` del proyecto RVC-Project. No se detalla en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables a este tipo de modelo).

La innovacion tecnica de este repositorio es la division del grafo mediante `onnx.utils.extract_model` en el nodo `/net/Reshape_output_0`, partiendo de la exportacion unica de Scicom-intl. La ejecucion secuencial de ambos ficheros produce la misma salida que el grafo unico. El frame *i* se centra en *i* × 10 ms y los bins de saliencia se distribuyen cada 20 cents desde 32,70 Hz.

## Capacidades

- Estimacion de frecuencia fundamental (F0) en audio monofonico y polifonico.
- Deteccion de melodia vocal dominante en mezclas musicales.
- Extraccion de pitch para voz cantada con resolucion temporal de 10 ms.
- Salida en mapa de saliencia de 360 bins (20 cents de resolucion).
- Ejecucion dividida entre GPU (DirectML/CoreML) y CPU para optimizar recursos.
- Inferencia via ONNX Runtime, compatible con multiples backends y plataformas.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues (no es un modelo de lenguaje).

## Casos de uso

- Edicion de pitch en DAWs: integracion en estaciones de trabajo de audio digital para correccion tonal de voces grabadas, usando la salida de saliencia para reconstruir la curva de F0 con precision de 10 ms.
- Analisis de melodia en produccion musical: extraccion de la linea vocal dominante en mezclas para tareas de transcripcion, remezcla o separacion.
- Afinacion automatica en tiempo real: el reparto CNN/GRU permite ejecutar la parte pesada en GPU y la recurrente en CPU, reduciendo la latencia en aplicaciones de escritorio.
- Investigacion en procesamiento de audio: uso como extractor de referencia para comparar algoritmos de pitch en musica polifonica.
- Herramientas de karaoke y seguimiento tonal: deteccion de la altura cantada para sincronizacion de letras o puntuacion de afinacion.
- Pipelines de analisis musical a gran escala: procesamiento por lotes de catalogos de audio con ONNX Runtime en servidores con CPU y GPU.
- Integracion en plugins de audio (VST/AU): al ser ONNX, puede embeberse en aplicaciones nativas multiplataforma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el grafo CNN ocupa 183,5 MB en float32; con overhead de activaciones, cabe holgadamente en GPUs de 2 GB o menos. El grafo GRU (2,4 MB) puede ejecutarse en CPU.
- GPU recomendadas: cualquier GPU compatible con DirectML (Windows) o CoreML (macOS); tambien CUDA via ONNX Runtime. No requiere GPUs de datacenter.
- Cabe en GPU consumer: si, en practicamente cualquier GPU integrada o dedicada moderna.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML, CoreML), con posibilidad de ejecucion secuencial de los dos grafos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Salida | Licencia | Formato |
|---|---|---|---|---|---|
| kickvn/rmvpe-onnx | CNN + BiGRU | no disponible | Saliencia 360 bins | MIT | ONNX (2 grafos) |
| Scicom-intl/rmvpe-onnx | CNN + BiGRU | no disponible | Saliencia 360 bins | MIT | ONNX (grafo unico) |
| CREPE | CNN | no disponible | F0 continua | MIT | TensorFlow / ONNX |
| pYIN | Algoritmo clasico | no aplica | F0 | GPL | Implementaciones varias |

La comparativa con CREPE y pYIN es orientativa: RMVPE esta especializado en musica polifonica y voz cantada, mientras que CREPE y pYIN se centran en senales monofonicas. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado en pitch: no genera texto ni realiza tareas de lenguaje; su uso fuera de la estimacion de F0 no es adecuado.
- La salida es un mapa de saliencia, no una curva de F0 directa; requiere post-procesado (decodificacion de bins) para obtener la frecuencia.
- Resolucion limitada a 20 cents por bin y 10 ms por frame; puede ser insuficiente para aplicaciones que requieran mayor precision.
- Dependencia de la calidad de la conversion ONNX: la fidelidad respecto al modelo PyTorch original no se documenta con metricas en la informacion disponible.
- Sin datos publicados sobre sesgos, robustez ante ruido extremo o rendimiento en generos musicales concretos.
- Licencia MIT: permite uso comercial, pero se recomienda conservar los avisos de copyright de RVC-Project y del proyecto original RMVPE (Apache-2.0).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kickvn/rmvpe-onnx
- Exportacion ONNX original: https://huggingface.co/Scicom-intl/rmvpe-onnx
- Repositorio original RMVPE: https://github.com/Dream-High/RMVPE
- Paper: Wei et al., "RMVPE: A Robust Model for Vocal Pitch Estimation in Polyphonic Music", Interspeech 2023 (no se proporciona URL directa en la informacion disponible).
