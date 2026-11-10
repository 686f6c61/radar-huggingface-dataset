# nxp/wav2letter-imx

## Resumen

Wav2Letter es un modelo de reconocimiento automático del habla (ASR) de extremo a extremo que combina un modelo acústico convolucional con una etapa de decodificación CTC. Dada una secuencia de características MFCC extraídas de una señal de audio, la red produce para cada trama temporal una distribución de probabilidad sobre un alfabeto de 29 símbolos (las 26 letras minúsculas, un apóstrofo, un espacio y el símbolo blank de CTC). Fue entrenado para emitir letras directamente a partir de transcripciones, sin necesidad de alineamiento forzado de fonemas.

El modelo original procede del ARM ML-zoo y este repositorio lo redistribuye en formato TFLite ya cuantizado a int8, compilado por NXP para su ejecución acelerada en las NPU de los procesadores i.MX 8M Plus, i.MX 93, i.MX 95 e i.MX 952. No es un modelo de propósito general: es un artefacto de despliegue orientado a sistemas embebidos con aceleración hardware específica de NXP.

Su relevancia actual reside en que demuestra un flujo completo de ASR en el borde (edge), con un modelo de solo 23,8 M de parámetros, unos 22,7 MB en int8 y 6.982 MOPS, ejecutable sobre NPU de bajo consumo mediante el runtime eIQ LiteRT. Es una pieza útil para integradores de hardware i.MX que necesiten reconocimiento de voz embebido sin depender de la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red convolucional completa (fully-convolutional) con decodificación CTC |
| Parámetros totales | 23,8 M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de entrada fija de 296 tramas × 39 características MFCC; inferencia por ventana deslizante sobre enunciados largos) |
| Tipos de cuantización | int8 (entrada int8 / salida int8); modelo pre-cuantizado por ARM ML-zoo |
| Idiomas soportados | no disponible (alfabeto de 26 letras latinas minúsculas, apóstrofo y espacio; entrenamiento sobre LibriSpeech, en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | TFLite (LiteRT), con variantes precompiladas para Vela/Ethos-U65 y eIQ Neutron |
| Entrada | Tensor MFCC (1, 296, 39), int8 |
| Salida | Tensor de probabilidades de caracteres (1, 1, 148, 29), int8 (requiere de-cuantización con scale/zero point antes de CTC) |
| Cómputo | 6.982 MOPS |
| Tamaño del modelo (int8) | ~22,7 MB |
| Framework origen | TensorFlow Lite |
| Autores originales | ARM Software (ML-zoo) |
| Modificado por | NXP (compilación para NPU) |

## Arquitectura y entrenamiento

La arquitectura es una red convolucional completa que actúa como modelo acústico sobre vectores MFCC. Cada trama de audio se representa con 13 coeficientes MFCC más sus derivadas primera y segunda, lo que da 39 características por trama. La entrada se organiza como una ventana de 296 tramas y la red produce una matriz de probabilidades por carácter que se decodifica con un decodificador CTC greedy sobre 29 símbolos. Para enunciados más largos que la ventana, se emplea inferencia por ventana deslizante.

El modelo original fue entrenado por ARM en el marco del ML-zoo sobre el corpus LibriSpeech, según se desprende del ejemplo de entrada incluido (`example_input.flac`, procedente de LibriSpeech, CC BY 4.0). La información proporcionada no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO; estos datos deben consultarse en la documentación del ML-zoo. NXP no realizó recuantización ni calibración: descargó el TFLite int8 tal cual y lo compiló para cada plataforma, usando Vela con `--accelerator-config ethos-u65-256 --optimise Performance` para i.MX 93 y el eIQ Neutron SDK (versiones 3.1.3, 3.2.1 y 3.2.3) para i.MX 95 e i.MX 952.

## Capacidades

- Reconocimiento de voz a texto a nivel de carácter sobre audio en inglés (dominio LibriSpeech).
- Extracción de características MFCC (13 coeficientes más derivadas primera y segunda) como entrada del modelo.
- Decodificación CTC greedy sobre un alfabeto de 29 símbolos.
- Inferencia por ventana deslizante para utterances de duración arbitraria.
- Ejecución acelerada en NPU: VX en i.MX 8M Plus, Ethos-U65 en i.MX 93 y eIQ Neutron en i.MX 95 / i.MX 952.
- Cuantización int8 de extremo a extremo (entrada y salida) para minimizar latencia y consumo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio multimodal.
- No dispone de modo thinking ni de capacidades multilingües más allá del alfabeto latino básico.

## Casos de uso

- Comandos de voz en dispositivos empotrados: integración en productos con i.MX 8M Plus o i.MX 93 para reconocer palabras y frases cortas en local, sin conexión a la nube, aprovechando la NPU y el bajo consumo del modelo int8.
- Transcripción de notas de voz en wearables y dispositivos IoT: el modelo de 22,7 MB cabe en memoria flash y permite transcribir clips cortos mediante ventana deslizante sobre la NPU.
- Subtitulado local de audio en kioscos y paneles interactivos: ejecución en i.MX 95 con eIQ Neutron para transcribir audio capturado por micrófono y mostrar el texto en pantalla sin enviar datos a servidores externos.
- Preprocesado de pipelines de voz en el borde: uso del modelo como primera etapa de ASR que alimenta un NLU local o un sistema de activación por palabra clave, reduciendo el ancho de banda frente a enviar audio crudo.
- Prototipado y evaluación de NPU: el repositorio incluye `recipe.sh` y `example.py`, lo que facilita validar el rendimiento real de Ethos-U65 o Neutron con una carga ASR representativa antes de diseñar un producto.
- Investigación en ASR embebido: base reproducible (Apache-2.0, procedente del ML-zoo) para experimentar con cuantización int8, decodificación CTC y despliegue en aceleradores heterogéneos.
- Automatización industrial con interfaz por voz: registro de incidencias dictadas por operarios en entornos con conectividad limitada, usando hardware i.MX de bajo consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de coste computacional: 6.982 MOPS, 23,8 M de parámetros y un tamaño de fichero int8 de aproximadamente 22,7 MB. No se incluyen valores de WER, MMLU, HumanEval ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM: no aplica; el modelo está pensado para NPU integradas en SoC, no para GPU de escritorio. El fichero int8 ocupa ~22,7 MB.
- Hardware objetivo: NXP i.MX 8M Plus (delegado VX), i.MX 93 (Ethos-U65, config `ethos-u65-256`), i.MX 95 e i.MX 952 (eIQ Neutron).
- GPU de consumo: no es el caso de uso; puede ejecutarse en CPU vía LiteRT, pero sin aceleración NPU pierde su ventaja principal.
- Despliegue: runtime eIQ LiteRT (TensorFlow Lite) con el delegado correspondiente (VX, Ethos-U o Neutron). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Versiones de BSP/SDK: i.MX 93 con BSP `lf-6.18.20_2.0.0` y `lf-6.18.37_2.1.0`; i.MX 95 e i.MX 952 con Neutron SDK 3.1.3, 3.2.1 y 3.2.3 sobre los mismos BSP.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nxp/wav2letter-imx | 23,8 M | Ventana MFCC (1, 296, 39) | TFLite int8 + precompilados NPU | Apache-2.0 | Hugging Face (nxp) |
| Wav2Letter (ARM ML-zoo) | 23,8 M | Ventana MFCC (1, 296, 39) | TFLite int8 | Apache-2.0 | GitHub ARM ML-zoo |
| Whisper (OpenAI) | 39 M – 1,55 B según variante | 30 s de audio | PyTorch, safetensors, GGUF, etc. | MIT | Hugging Face, OpenAI |
| wav2vec 2.0 (Meta) | ~95 M – 317 M (base/large) | Audio sin límite fijo por ventana | PyTorch, safetensors | MIT / CC-BY-NC según variante | Hugging Face, fairseq |

La comparación con Whisper y wav2vec 2.0 es orientativa: ambos son modelos ASR de propósito general con soporte multilingüe y ecosistema mucho más amplio, mientras que wav2letter-imx está optimizado exclusivamente para NPU de NXP y salida a nivel de carácter en inglés. No se dispone de datos de rendimiento comparativo (WER) en la información proporcionada.

## Limitaciones y advertencias

- Modelo entrenado sobre LibriSpeech (inglés); no se garantiza un comportamiento correcto en otros idiomas ni con acentos alejados del corpus.
- Alfabeto restringido a 26 letras minúsculas, apóstrofo y espacio: no produce mayúsculas, dígitos ni signos de puntuación.
- Sin benchmark de precisión publicado en la model card; el WER real debe medirse en el dominio de despliegue.
- Riesgo de alucinación y errores de transcripción inherente a los modelos CTC, especialmente con ruido de fondo o audio fuera de dominio.
- La cuantización int8 puede degradar la precisión respecto al modelo en punto flotante original; no se documenta la pérdida exacta.
- Dependencia fuerte del hardware: los binarios precompilados solo funcionan con las versiones de BSP y SDK indicadas; cambios de versión requieren recompilación con Vela o el eIQ Neutron SDK.
- La licencia Apache-2.0 permite uso comercial, pero debe conservarse la atribución a ARM ML-zoo y a NXP, y revisarse las condiciones del corpus LibriSpeech para el audio de ejemplo.
- No es un modelo conversacional ni un LLM: no soporta instrucciones, tool calling ni razonamiento; su uso está acotado a ASR.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nxp/wav2letter-imx
- Modelo original en ARM ML-zoo: https://github.com/ARM-software/ML-zoo/tree/master/models/speech_recognition/wav2letter
- Paper de Wav2Letter (arXiv:1609.03193): https://arxiv.org/abs/1609.03193
- Vela (compilador Ethos-U de NXP): https://github.com/nxp-imx/ethos-u-vela
- Ejemplo de entrada (LibriSpeech, CC BY 4.0): https://huggingface.co/nxp/wav2letter-imx/blob/main/example_input.flac
- Script de descarga y compilación: https://huggingface.co/nxp/wav2letter-imx/blob/main/recipe.sh
- Ejemplo de inferencia: https://huggingface.co/nxp/wav2letter-imx/blob/main/example.py
- Manifiesto de release: https://huggingface.co/nxp/wav2letter-imx/blob/main/release_manifest.json
