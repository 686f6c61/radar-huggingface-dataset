# futo-org/asr4all-m-es

## Resumen

asr4all-m-es es un modelo de reconocimiento automático del habla (ASR) en castellano desarrollado por FUTO, una organización centrada en software libre y privacidad. Con 55,7 millones de parámetros (50,3 M acústicos y 5,3 M para el módulo PCEC), el modelo está diseñado específicamente para inferencia en CPU, dispositivos móviles y entornos edge, priorizando la eficiencia energética y el factor de tiempo real (RTFx) sobre la precisión bruta de modelos mucho más grandes.

La arquitectura es propietaria y no convencional: combina superbloques convolucionales DFSMN con atención LDSA y de ventana deslizante, junto con squeeze-excitation causal, y decodifica mediante CTC sobre un vocabulario BPE de 256 tokens más blank, operando sobre características mel a 25 Hz. El modelo se destila de un teacher Granite-Speech CTC adaptado al castellano y soporta streaming con latencia configurable en tiempo de ejecución desde los mismos pesos, lo que permite ajustar el compromiso entre latencia y precisión sin cambiar de modelo.

Su relevancia actual radica en que ofrece ASR de calidad competitiva (WER medio de 4,65 % en los conjuntos españoles del Open ASR Leaderboard) con un consumo de cómputo muy reducido: 64,7 RTFx en un Intel i9-12900K de un solo hilo y 50,3 RTFx en un Pixel 10. Incluye además un detector de actividad de voz ultraligero de 2.537 parámetros y un módulo de puntuación, capitalización y corrección de errores, todo bajo licencia FUTO Ethical Use 1.0 que permite uso comercial con restricciones éticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFSMN conv superblocks + LDSA y sliding-window attention, causal squeeze-excitation (SE); CTC sobre BPE-256+blank; features mel a 25 Hz |
| Parametros totales | 55.732.961 (50,3 M acusticos + 5,3 M PCEC) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (streaming con caches de contexto izquierdo por capa; latencia configurable) |
| Tipos de cuantizacion | int8 (executorch-xnnpack), fp32, bf16, fp16 (openvino, cuda); exportaciones en ONNX y ExecuTorch |
| Idiomas soportados | es (castellano) |
| Licencia | futo-ethical-use-1.0 (uso comercial permitido con restricciones eticas, p. ej. prohibicion de vigilancia masiva) |
| Formato de pesos | safetensors, ONNX, ExecuTorch (.pte), transformers |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura causal personalizada que combina superbloques convolucionales DFSMN con mecanismos de atención LDSA y de ventana deslizante, más módulos de squeeze-excitation causal. La salida se produce mediante CTC sobre un vocabulario BPE de 256 tokens más blank, sobre características mel extraídas a 25 Hz. Para streaming, mantiene caches de contexto izquierdo por capa, de modo que cada frame de audio se codifica una sola vez; esto permite modos de baja y alta latencia a partir de los mismos pesos, con latencia configurable en tiempo de ejecución.

El entrenamiento se basa en destilación de conocimiento (logits y estados ocultos) desde un teacher Granite-Speech CTC adaptado al castellano. Los datos declarados incluyen espnet/yodas3, espnet/yodas-granary, facebook/voxpopuli, facebook/multilingual_librispeech, gttsehu/basque_parliament_1 y basis-ai/basis-conversations-1500. El modelo se distribuye junto a un VAD ultraligero basado en kiloVAD (arXiv:2607.25870) podado a 2.537 parámetros, que procesa 1 segundo de audio y devuelve 21 predicciones a intervalos de 40 ms con 200 ms de contexto cada una.

## Capacidades

- Reconocimiento automático del habla en castellano con decodificación CTC.
- Streaming con latencia configurable (modos de baja y alta latencia desde los mismos pesos).
- Inferencia en CPU, móvil y edge, con operaciones vectorizadas SIMD y NEON.
- Detección de actividad de voz (VAD) ultraligera independiente del ASR, útil para wake detection.
- Módulo PCEC (puntuación, capitalización y corrección ligera de errores) acoplado al ASR.
- Exportación a múltiples runtimes: transformers, ONNX, ExecuTorch.
- No soporta tool calling, agentes ni razonamiento multi-step: es un modelo puramente acústico.
- Capacidad multilingüe limitada al castellano.

## Casos de uso

- Subtitulado en tiempo real en aplicaciones de videollamada: el modo streaming de baja latencia (`stream_c16r4`) permite transcribir audio continuo en CPU con RTFx de 24,6 en un i9-12900K de un solo hilo, suficiente para mantener el ritmo de la conversación.
- Transcripción en dispositivos móviles sin conexión: con 55,7 M de parámetros y exportación ExecuTorch int8, cabe en un Pixel 10 y ofrece 17,5 RTFx en el modo de baja latencia, habilitando dictado offline con privacidad total.
- Asistentes de voz con activación por palabra clave: el VAD de 2.537 parámetros detecta actividad de voz con consumo mínimo y puede disparar el ASR solo cuando hay habla, reduciendo el gasto energético en dispositivos alimentados por batería.
- Post-procesado de transcripciones para documentación: el módulo PCEC añade puntuación, mayúsculas y corrección ligera de errores con un sobrecoste de solo 2-7 % en x86 a un hilo, produciendo texto listo para publicar.
- Procesamiento por lotes en servidores sin GPU: con 64,7 RTFx en un i9-12900K (int8) y 75,8 RTFx en un Ryzen 7 PRO 8700GE (openvino bf16), un solo servidor CPU puede transcribir grandes volúmenes de audio español a bajo coste.
- Integración en sistemas embebidos y domótica: la exportación ExecuTorch y el soporte de Raspberry Pi 4 (1,2-2,4 RTFx) permiten añadir control por voz a dispositivos de bajo consumo sin depender de la nube.
- Análisis de conversaciones en centros de atención telefónica: el WER de 4,13 % en MLS y 4,02 % en FLEURS sobre español lo hace adecuado para transcribir grabaciones con calidad de audio variable y alimentar analítica posterior.

## Benchmarks y rendimiento

Resultados declarados por el autor (WER %, menor es mejor, normalizador español del Open ASR Leaderboard, configuración c256r32):

| Dataset | CTC sin PCEC | Con PCEC |
|---|---|---|
| Common Voice (CoVoST 2 test) | 5,87 | 5,79 |
| MLS | 4,19 | 4,13 |
| FLEURS | 4,10 | 4,02 |
| Media | 4,72 | 4,65 |

RTFx (un hilo, mayor es mejor, clip de 120 s, mediana de 3 ejecuciones):

| Plataforma | Backend | `stream_c16r4` | `stream_c512r8` |
|---|---|---|---|
| Pixel 4 | executorch-xnnpack int8 | 7,6 | 16,5 |
| Pixel 10 | executorch-xnnpack int8 | 17,5 | 50,3 |
| Raspberry Pi 4 | executorch-xnnpack int8 | 1,2 | 2,4 |
| i9-12900K | executorch-xnnpack int8 | 24,6 | 64,7 |
| i9-12900K | executorch-xnnpack fp32 | 14,5 | 39,8 |
| i9-12900K | openvino fp32 | 16,7 | 44,2 |
| Ryzen 7 PRO 8700GE | openvino bf16 | 24,6 | 75,8 |
| i9-12900K | openvino-igpu fp16 | 9,8 | 43,0 |
| RTX 6000 Max-Q (batch 16) | cuda | 28.412,8 | 27.988,3 |

Nota del autor: las filas de RTFx se midieron sobre el modelo medium en inglés, de arquitectura y cómputo por frame idénticos, con solo diferencias de vocabulario.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo está pensado para CPU y no requiere GPU.
- GPU recomendadas: no necesarias; con CUDA en RTX 6000 Max-Q (batch 16) se alcanzan 28.412,8 RTFx, pero el objetivo del modelo es CPU y edge.
- Cabe en GPU de consumo: sí, con enorme holgura (55,7 M de parámetros, repo de 0,7 GB), aunque no es su escenario óptimo.
- Despliegue: transformers (one-shot y streaming), ONNX Runtime, ExecuTorch con backend xnnpack, OpenVINO (CPU, bf16, iGPU fp16), CUDA.
- Latencia y throughput: RTFx de 7,6 a 75,8 según plataforma y modo de streaming; el PCEC añade un 2-7 % de tiempo de inferencia en x86 a un hilo.
- Configuraciones recomendadas por plataforma: int8 con ExecuTorch en móvil y CPU Intel, bf16 con OpenVINO en Ryzen, fp16 con OpenVINO en iGPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER es (referencia) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| asr4all-m-es | 55,7 M | streaming configurable | 4,65 media (CV/MLS/FLEURS) | futo-ethical-use-1.0 | HuggingFace |
| Whisper large-v3 | 1.550 M | 30 s por ventana | no disponible en la informacion | MIT | HuggingFace, OpenAI |
| Whisper small | 244 M | 30 s por ventana | no disponible en la informacion | MIT | HuggingFace, OpenAI |
| Granite-Speech CTC (teacher) | no disponible | no disponible | no disponible en la informacion | no disponible | HuggingFace (IBM) |

La comparación cuantitativa con alternativas no puede completarse con los datos proporcionados: no se dispone de WER de los modelos comparables en los mismos conjuntos con el mismo normalizador. La ventaja diferencial de asr4all-m-es es su relación entre precisión y coste computacional en CPU, no su precisión absoluta frente a modelos de mayor tamaño.

## Limitaciones y advertencias

- Solo soporta castellano; no hay capacidades multilingües ni cambio de idioma.
- Es un modelo puramente ASR: no realiza razonamiento, tool calling ni generación de texto libre.
- Los resultados de benchmarks están declarados por el autor y no verificados (`verified: false` en el model-index); conviene reproducirlos antes de adoptarlos como referencia.
- La licencia futo-ethical-use-1.0 permite uso comercial pero impone restricciones éticas, como la prohibición de vigilancia masiva; es necesario revisar el texto completo de la licencia antes de integrarlo en producción.
- El WER puede degradarse con acentos no representados en los datos de entrenamiento, audio con ruido intenso o solapamiento de hablantes; los conjuntos de evaluación son predominantemente lectura y habla preparada.
- El módulo PCEC puede introducir correcciones erróneas en dominios especializados (terminología técnica, nombres propios).
- El VAD y el ASR son componentes separados; la integración de ambos en un pipeline de producción requiere trabajo adicional de orquestación.
- El modelo tiene muy pocas descargas y likes en el momento de la ficha, por lo que la validación comunitaria es aún escasa.

## Enlaces

- HuggingFace: https://huggingface.co/futo-org/asr4all-m-es
- Paper kiloVAD: https://arxiv.org/abs/2607.25870
- Licencia: https://huggingface.co/futo-org/asr4all-m-es/blob/main/LICENSE
- Dataset espnet/yodas3: https://huggingface.co/datasets/espnet/yodas3
- Dataset espnet/yodas-granary: https://huggingface.co/datasets/espnet/yodas-granary
- Dataset facebook/voxpopuli: https://huggingface.co/datasets/facebook/voxpopuli
- Dataset facebook/multilingual_librispeech: https://huggingface.co/datasets/facebook/multilingual_librispeech
- Dataset gttsehu/basque_parliament_1: https://huggingface.co/datasets/gttsehu/basque_parliament_1
- Dataset basis-ai/basis-conversations-1500: https://huggingface.co/datasets/basis-ai/basis-conversations-1500
- Open ASR Leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
