# LIANGXU123/DriftBetterUSE

## Resumen

DriftBetterUSE es un repositorio de investigación publicado en Hugging Face por el usuario LIANGXU123 que contiene checkpoints de entrenamiento y salidas mejoradas de varios modelos de mejora de voz (speech enhancement) orientados a la supresión de ruido. No se trata de un modelo de lenguaje, sino de un conjunto de modelos convolucionales y recurrentes de pequeño tamaño (entre 0,04 M y 1,69 M de parámetros) entrenados sobre el corpus VoiceBank-DEMAND (VB-DMD) a 16 kHz, con evaluación adicional zero-shot sobre el conjunto DNS 2020.

El objetivo del repositorio es servir de material reproducible para un artículo científico: incluye los checkpoints, las configuraciones de entrenamiento, las métricas por fichero y los resúmenes agregados de todos los sistemas evaluados. Los modelos se seleccionan por mejor PESQ de validación sobre los hablantes reservados p226/p287 de VB-DMD, e incorporan variantes causales y no causales, así como ablaciones de la función de pérdida (`no_Laux`, `no_Lc`, `no_Lq`).

Su relevancia actual radica en que ofrece modelos de mejora de voz extremadamente ligeros (desde 0,04 M de parámetros) con métricas competitivas en PESQ, SI-SDR y ESTOI, lo que los hace candidatos para despliegue en dispositivos con recursos limitados. No obstante, el repositorio no incluye una model card descriptiva al uso, sino una estructura de ficheros y tablas de resultados, y no se han publicado datos sobre arquitectura detallada, idiomas soportados ni formato de pesos más allá de los checkpoints `.ckpt`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes neuronales para mejora de voz: Conv-DPRNN, TF-GridNet y variantes causales (detalle completo no disponible) |
| Parametros totales | Desde 0,04 M (`causal_conv_dprnn_tiny_0p04m`) hasta 1,69 M (`tfgridnet_1p69m`) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesamiento por segmentos de audio, no aplica contexto de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (procesamiento de audio, independiente del idioma en principio) |
| Licencia | MIT |
| Formato de pesos | Checkpoints PyTorch (`.ckpt`); no se incluyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El repositorio agrupa varios sistemas de mejora de voz. Los nombres de los modelos indican dos familias principales: variantes Conv-DPRNN (convolucional con recurrent neural network dual-path, en versiones causal y no causal) y variantes TF-GridNet (también en versión causal y no causal). Los tamaños van de 0,04 M a 1,69 M de parámetros. Todos los modelos se entrenan sobre VoiceBank-DEMAND a 16 kHz y se seleccionan por PESQ de validación sobre los hablantes p226/p287.

El entrenamiento emplea una función de pérdida multiobjetivo, tal como evidencian las ablaciones `no_Laux`, `no_Lc` y `no_Lq`, que eliminan respectivamente componentes auxiliares, de consistencia y de calidad. No se especifican en la información disponible el número de tokens (al tratarse de audio, horas de entrenamiento), la composición exacta del dataset más allá de VB-DMD y DEMAND, ni si se emplearon técnicas de RLHF o DPO (no aplicables en este dominio). Las rutas de datos en los `config.json` son marcadores de posición que deben apuntar a copias locales de VB-DMD 16 kHz y DEMAND.

## Capacidades

- Mejora de voz mono-canal: supresión de ruido y reconstrucción de la señal limpia a partir de audio ruidoso a 16 kHz.
- Variantes causales (`causal_conv_dprnn_1p28m`, `causal_conv_dprnn_tiny_0p04m`, `causal_tfgridnet_1p24m`) aptas para procesamiento en tiempo real o streaming.
- Variantes no causales (`conv_dprnn_1p53m`, `conv_dprnn_tiny_0p05m`, `tfgridnet_1p69m`) con acceso al contexto completo de la señal para máxima calidad.
- Evaluación zero-shot sobre grabaciones reales del DNS 2020 blind (300 ficheros), lo que indica cierta capacidad de generalización a dominios no vistos.
- Métricas intrusivas y no intrusivas reportadas: PESQ, SI-SDR, ESTOI, SCOREQ, UTMOSv2, DNSMOS, NISQA, SIGMOS, NOI, COL y LOUD.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio-texto ni multilingüismo textual.

## Casos de uso

- Supresión de ruido en llamadas VoIP y videoconferencia: los modelos causales de 0,04 M a 1,28 M permiten procesar audio en streaming con latencia mínima en el propio dispositivo, sin depender de la nube.
- Preprocesado para sistemas de reconocimiento automático de voz (ASR): aplicar `conv_dprnn_1p53m` o `tfgridnet_1p69m` como etapa previa mejora la relación señal-ruido y puede reducir la tasa de error de palabra en entornos ruidosos.
- Limpieza de grabaciones de campo o entrevistas: la variante no causal `tfgridnet_1p69m` (PESQ 2,94, SI-SDR 17,6) es la de mayor calidad objetiva del conjunto y adecuada para postproducción offline.
- Auriculares y dispositivos IoT con recursos limitados: `causal_conv_dprnn_tiny_0p04m` (0,04 M de parámetros) cabe en microcontroladores o DSP de bajo consumo para cancelación de ruido en tiempo real.
- Reproducibilidad de investigación: los checkpoints, configuraciones y métricas por fichero permiten replicar las tablas del artículo y comparar nuevas propuestas contra las ablaciones publicadas.
- Evaluación comparativa de modelos de mejora de voz: el repositorio incluye la línea base SelfSE y las salidas sobre DNS 2020, lo que facilita la comparación zero-shot con otros sistemas.
- Transcripción de reuniones y subtitulado: la mejora previa de la señal con variantes no causales reduce el ruido de fondo antes de la transcripción automática.

## Benchmarks y rendimiento

Resultados sobre VB-DMD (16 kHz) reportados en la model card:

| Modelo | SCOREQ | UTMOSv2 | DNSMOS | PESQ | SI-SDR | ESTOI |
|---|---|---|---|---|---|---|
| `causal_conv_dprnn_1p28m` | 4,10 | 3,18 | 3,45 | 2,63 | 16,4 | 0,80 |
| `causal_conv_dprnn_tiny_0p04m` | 4,15 | 3,27 | 3,50 | 2,54 | 15,9 | 0,81 |
| `causal_tfgridnet_1p24m` | 4,28 | 3,15 | 3,52 | 2,87 | 17,4 | 0,84 |
| `conv_dprnn_1p53m` | 4,27 | 3,34 | 3,58 | 2,90 | 16,8 | 0,83 |
| `conv_dprnn_tiny_0p05m` | 4,24 | 3,26 | 3,55 | 2,69 | 16,3 | 0,83 |
| `tfgridnet_1p69m` | 4,25 | 3,17 | 3,59 | 2,94 | 17,6 | 0,85 |
| `no_Laux` | 3,74 | 2,88 | 3,15 | 2,23 | 6,5 | 0,75 |
| `no_Lc` | 3,75 | 3,17 | 3,33 | 2,57 | 13,0 | 0,80 |
| `no_Lq` | 3,94 | 3,01 | 3,36 | 2,74 | 16,0 | 0,81 |

Resultados zero-shot sobre DNS 2020 blind (300 grabaciones reales):

| Sistema | UTMOSv2 | NOI | COL | LOUD |
|---|---|---|---|---|
| SelfSE | 2,19 | 3,31 | 2,68 | 3,07 |
| Ours (`conv_dprnn_1p53m`) | 2,58 | 3,63 | 3,54 | 3,70 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con modelos de 0,04 M a 1,69 M de parámetros, el peso de los checkpoints es del orden de kilobytes a unos pocos megabytes, por lo que la VRAM necesaria es mínima (inferior a 1 GB en cualquier caso).
- GPU recomendadas: cualquier GPU moderna es sobredimensionada; una NVIDIA RTX 4090, A100 o H100 no aportan ventaja frente a GPUs de gama baja para estos tamaños. Para lotes grandes o procesamiento masivo, una GPU consumer de gama media es suficiente.
- Cabe en GPU consumer: sí, en cualquier GPU consumer e incluso en CPU para las variantes tiny.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a audio). El despliegue se realiza cargando los checkpoints `.ckpt` con PyTorch y la configuración `config.json` correspondiente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | PESQ (VB-DMD) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tfgridnet_1p69m` (este repo) | 1,69 M | No aplica | 2,94 | MIT | Checkpoint `.ckpt` |
| `conv_dprnn_1p53m` (este repo) | 1,53 M | No aplica | 2,90 | MIT | Checkpoint `.ckpt` |
| SelfSE (línea base incluida) | No disponible | No aplica | No disponible | No disponible | Checkpoint VB-DMD |
| DEMUCS / otras arquitecturas | No disponible | No aplica | No disponible | No disponible | No disponible |

La información proporcionada solo permite comparar internamente entre los sistemas del propio repositorio y con la línea base SelfSE en DNS 2020. No se dispone de datos de otros modelos externos de la misma categoría para una comparativa más amplia.

## Limitaciones y advertencias

- El repositorio no incluye una model card descriptiva convencional: la información sobre arquitectura, datos de entrenamiento y uso previsto es escasa y debe inferirse de los nombres de ficheros y las tablas.
- Los `config.json` contienen rutas de datos de marcador de posición (`data/noisy_dir`, `data/noise_dir`, `data/test_dir`); es necesario reconfigurarlas antes de entrenar o inferir.
- El modelo `conv_dprnn_1p53m` se selecciona en la época 10 por PESQ de test (2,90), aunque la validación favorece la época 9 (2,1071 frente a 2,0988); esta discrepancia puede afectar a la reproducibilidad.
- Las métricas intrusivas se calculan contra `VoiceBank-DEMAND-16k-wav/test/clean`, por lo que los resultados no son directamente comparables con evaluaciones que usen otras referencias.
- No se documentan sesgos, riesgos de alucinación (no aplica a audio) ni limitaciones idiomáticas; al ser un modelo de audio, el rendimiento puede degradarse en idiomas o acentos no representados en VB-DMD.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías ni soporte; el repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- No se especifican requisitos de hardware, latencia ni throughput, lo que dificulta planificar un despliegue en producción sin pruebas propias.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/LIANGXU123/DriftBetterUSE
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios de código o demos.
