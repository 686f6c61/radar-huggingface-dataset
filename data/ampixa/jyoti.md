# ampixa/jyoti

## Resumen

jyoti es un códec neuronal de voz de baja tasa de bits desarrollado por ampixa, pensado para codificar y descodificar audio de voz mono a 16 kHz en un flujo de 2.300 bit/s con tramas de 20 ms. El modelo convierte audio en una secuencia de bytes compacta y lo reconstruye, con una latencia algorítmica de 40 ms y capacidad de operar en un único hilo de CPU. Su relevancia radica en la combinación de un tamaño muy reducido (828.547 parámetros) con un rendimiento en tiempo real muy por encima de lo necesario en hardware de consumo, lo que lo hace atractivo para transmisión de voz en entornos con ancho de banda limitado.

El repositorio contiene tres checkpoints que comparten arquitectura y código: D3 (`codec.pt`, modelo principal), C y B. D3 se entrenó sobre una mezcla más amplia que incluye 100 horas de LibriSpeech y SLR54 más voz nepalí y inglés ruidoso obtenidos de la web. El autor lo describe explícitamente como un candidato de desarrollo no cualificado: supera 4 de las 5 puertas de desarrollo fijadas internamente y falla la puerta de audio "difícil", además de degradar sustancialmente el reconocimiento de nepalí (CER de 28,3 % frente a 14,7 % en el audio original). La cohorte de evaluación final sellada nunca se ha abierto.

La arquitectura es un codificador convolucional residual causal con un cuantizador escalar finito residual de cuatro etapas y un descodificador que predice magnitud espectral más un residuo de fase explícito, sintetizando audio mediante FFT inversa con solapamiento y suma. El diseño se inspira en el paper TinyCall (arXiv:2609.25379), aunque se trata de una implementación independiente con pesos entrenados de forma independiente, sin afiliación con los autores de dicho trabajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador convolucional residual causal + cuantizador escalar finito residual de 4 etapas + descodificador con predicción de magnitud espectral y residuo de fase (FFT 640, hop 320) |
| Parametros totales | 828.547 (codificador 192.164 / cuantizador 3.356 / descodificador 633.027) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesamiento por tramas de 20 ms con estado persistente de 5 KB en codificador y 10 KB en descodificador) |
| Tipos de cuantizacion | No disponible (el modelo incorpora su propio cuantizador escalar residual; no se documentan variantes de cuantización de pesos) |
| Idiomas soportados | Inglés (en), nepalí (ne); audio de voz mono a 16 kHz |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`codec.pt` y variantes en `variants/`) |
| Tasa de bits | 2.300 bit/s de carga útil (46 bits por trama de 20 ms, 50 tramas/s); 2.483 bit/s incluyendo cabecera y CRC |
| Latencia algorítmica | 40 ms (primeras 320 muestras de salida tras 640 muestras de entrada) |
| Frecuencia de muestreo | 16 kHz, mono |
| Formato de trama | Cabecera y pie de 56 bytes (CRC) más 6 bytes por trama; 1.670 bytes para un clip de 5,38 s |
| Velocidad medida | Apple M3 Pro, 1 hilo: factor de tiempo real 0,035 en codificación y 0,089 en descodificación (sin contar carga del modelo) |

## Arquitectura y entrenamiento

El codificador es una red convolucional residual causal con un stride total de 320, que produce características de 64 dimensiones a 50 Hz. Estas se cuantizan mediante un cuantizador escalar finito residual de cuatro etapas, que genera la carga útil de 46 bits por trama. El descodificador predice un espectro de magnitud junto con un residuo de fase explícito (política de fase `after_tanh`, variante `unit_scale_phase_residual_v1`), y sintetiza la forma de onda mediante FFT inversa con solapamiento y suma. El estado persistente para streaming es de 5 KB en el codificador y 10 KB en el descodificador, en coma flotante.

El modelo principal D3 se entrenó sobre una mezcla de 100 horas de LibriSpeech y SLR54 más voz nepalí y inglés ruidoso obtenidos de la web, partiendo del checkpoint C y aplicando 100.000 actualizaciones adicionales. Los checkpoints B y C se entrenaron solo con las 100 horas de LibriSpeech y SLR54, con probabilidad de ruido de entrada de 0,25 y 0,50 respectivamente. No se documenta en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación, ni el número total de tokens de entrenamiento. La innovación técnica destacable es la combinación de un cuantizador residual de muy baja tasa con un descodificador que modela fase explícita, todo con latencia algorítmica de 40 ms y coste computacional mínimo en CPU.

## Capacidades

- Codificación y descodificación de voz mono a 16 kHz en un flujo de 2.300 bit/s, con reconstrucción mediante FFT inversa y solapamiento y suma.
- Operación en streaming con tramas de 20 ms y latencia algorítmica de 40 ms, manteniendo estado persistente entre tramas.
- Funcionamiento en un único hilo de CPU con factores de tiempo real de 0,035 (codificación) y 0,089 (descodificación) medidos en Apple M3 Pro.
- Soporte de audio de voz en inglés y nepalí; no se documentan capacidades de música, audio general ni otros idiomas.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni modo de pensamiento.
- No se documentan capacidades multilingües más allá del inglés y el nepalí.

## Casos de uso

- Transmisión de voz en redes de muy bajo ancho de banda: el flujo de 2.300 bit/s permite enviar voz inteligible por enlaces de radio, satélite o redes móviles degradadas donde otros códecs no caben, con latencia algorítmica de 40 ms adecuada para conversación.
- Telefonía IP y comunicaciones de emergencia: el bajo coste computacional en un solo hilo de CPU permite desplegar el códec en pasarelas y dispositivos embebidos sin GPU, manteniendo el estado de streaming de 5 KB y 10 KB.
- Almacenamiento eficiente de archivos de voz: un clip de 5,38 s ocupa 1.670 bytes, lo que reduce drásticamente el espacio frente a PCM o códecs tradicionales en archivos de entrevistas, notas de voz o grabaciones de campo.
- Procesamiento de voz en el borde (edge computing): el modelo de 828.547 parámetros cabe en dispositivos con recursos limitados y puede codificar audio en tiempo real en un hilo de CPU, útil en sensores y asistentes locales.
- Investigación en códecs neuronales: al ser una implementación independiente con pesos propios y licencia CC BY-SA 4.0, sirve como base reproducible para estudiar cuantización residual, predicción de fase y evaluación mediante ASR.
- Evaluación comparativa de inteligibilidad: las métricas publicadas (aumento de WER, STOI, PESQ-WB) y los scripts de evaluación asociados permiten usarlo como referencia en estudios de calidad de códecs de baja tasa.
- Aplicaciones específicas para nepalí: aunque degrada el reconocimiento (CER 28,3 % frente a 14,7 %), puede emplearse en escenarios donde el ancho de banda es el factor limitante y se acepta una pérdida de precisión controlada.

## Benchmarks y rendimiento

Resultados medidos a través del flujo empaquetado (codificar → bytes → descodificar) sobre 128 enunciados por conjunto. El ASR inglés es `facebook/wav2vec2-base-960h` (revisión `22aad52d`, CTC voraz sin modelo de lenguaje). Los conjuntos son LibriSpeech dev-clean (limpio), dev-other (difícil) y el conjunto limpio con ruido rosa sintético a 10 dB y 5 dB.

| Puerta de desarrollo | Umbral | D3 (`codec.pt`) | C | B |
|---|---|---:|---:|---:|
| Aumento de WER en limpio | ≤ 5 pp | +3,86 ✅ | +4,08 ✅ | +3,59 ✅ |
| Aumento de WER en difícil | ≤ 10 pp | +13,06 ❌ | +12,70 ❌ | +11,79 ❌ |
| Aumento de WER con ruido rosa 10 dB | ≤ 10 pp | +7,22 ✅ | +6,73 ✅ | +8,84 ✅ |
| Aumento de WER con ruido rosa 5 dB | ≤ 10 pp | −10,54 ✅ | −8,03 ✅ | −5,29 ✅ |
| STOI medio en limpio | ≥ 0,85 | 0,900 ✅ | 0,902 ✅ | 0,905 ✅ |
| Puertas superadas | | 4 / 5 | 4 / 5 | 4 / 5 |
| Aumento medio de WER en las 4 puertas de reconocimiento | | 3,40 | 3,87 | 4,73 |

Números absolutos para D3, códec frente a audio original:

| Conjunto | WER códec | WER original | STOI | PESQ-WB |
|---|---:|---:|---:|---:|
| Limpio | 6,68 % | 2,83 % | 0,900 | 2,11 |
| Difícil | 21,00 % | 7,94 % | 0,885 | 1,97 |
| Ruido rosa 10 dB | 24,14 % | 16,91 % | 0,728 | 1,25 |
| Ruido rosa 5 dB | 40,65 % | 51,19 % | 0,639 | 1,14 |

Nepalí, habla leída (SLR54), con `ampixa/nepali-conformer-offline` sobre 128 enunciados de hablantes no vistos en entrenamiento:

| Condición | WER | CER |
|---|---:|---:|
| Audio original | 40,7 % | 14,7 % |
| D3 | 64,0 % | 28,3 % |
| C | 61,1 % | 26,9 % |
| B | 63,5 % | 31,1 % |

Comparación pareada D3 frente a C (mismos 128 enunciados por conjunto; intervalos del 95 % con 10.000 remuestreos bootstrap a nivel de hablante):

| Conjunto | Cambio en WER (pp) |
|---|---|
| Limpio | −0,22 [−1,05, +0,58] |
| Difícil | +0,36 [−1,48, +2,21] |
| Ruido rosa 10 dB | +0,49 [−1,08, +2,05] |
| Ruido rosa 5 dB | −2,51 [−4,60, −0,48] |
| Nepalí SLR54 | WER +2,91 [−2,65, +8,84]; CER +1,38 [−1,21, +3,89] |

El autor señala que solo la diferencia en ruido rosa 5 dB queda fuera del ruido estadístico, y que D3 es ligeramente (no significativamente) peor que C en nepalí leído. También se publican resultados sobre nepalí conversacional (128 clips de 3 a 12 s de YouTube, ninguno en los conjuntos de entrenamiento) usando transcripciones automáticas como referencia; la información disponible no incluye la tabla completa de esos resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 828.547 parámetros, por lo que los pesos ocupan aproximadamente 3,3 MB en FP32; no requiere GPU y funciona en CPU.
- GPU recomendadas: no se especifican; el modelo está diseñado para CPU. Cualquier GPU moderna puede ejecutarlo, pero no aporta ventaja significativa frente a CPU.
- Cabe en GPU de consumo: sí, con un consumo de memoria despreciable en cualquier GPU de consumo.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el repositorio usa PyTorch (`codec.pt` y variantes en `variants/`).
- Latencia y throughput: latencia algorítmica de 40 ms; en Apple M3 Pro con un hilo, factor de tiempo real de 0,035 en codificación y 0,089 en descodificación (sin contar la carga del modelo). El tiempo de cálculo y de red son adicionales.
- Estado de streaming: 5 KB en el codificador y 10 KB en el descodificador de estado persistente en coma flotante.

## Comparativa con modelos similares

| Modelo | Parámetros | Tasa de bits | Latencia | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| jyoti (D3) | 828.547 | 2,3 kbps | 40 ms | en, ne | CC BY-SA 4.0 | Hugging Face (`ampixa/jyoti`) |
| TinyCall (paper arXiv:2609.25379) | No disponible | No disponible | No disponible | No disponible | No disponible | Paper; código y pesos no disponibles en la información proporcionada |
| Códecs neuronales convencionales (p. ej. EnCodec, SoundStream) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible | No disponible |

La información disponible no permite una comparación cuantitativa con alternativas de la misma categoría. El autor indica que jyoti se inspira en TinyCall pero es una implementación independiente con pesos propios, sin afiliación con los autores.

## Limitaciones y advertencias

- Estado explícito de candidato de desarrollo no cualificado: el modelo principal D3 falla la puerta de audio difícil (+13,06 pp de WER frente al umbral de 10 pp) y la cohorte de evaluación final sellada nunca se ha abierto.
- Degradación sustancial en nepalí: el CER pasa del 14,7 % en el audio original al 28,3 % con D3, y el WER del 40,7 % al 64,0 %.
- Solo audio de voz mono a 16 kHz; no se documenta soporte de música, audio general ni otros idiomas distintos del inglés y el nepalí.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero la reconstrucción de audio puede introducir artefactos y pérdida de inteligibilidad, especialmente en condiciones de ruido y en habla difícil.
- La licencia CC BY-SA 4.0 exige compartir las obras derivadas bajo la misma licencia y atribuir al autor; conviene revisar las implicaciones para uso comercial y para la combinación con otros componentes.
- El rendimiento medido se limita a Apple M3 Pro con un hilo; no se documentan mediciones en otras plataformas.
- El modelo se entrenó con datos web de nepalí e inglés ruidoso, lo que puede introducir sesgos de dominio y de calidad en la voz reconstruida.
- No se documentan mecanismos de alineación ni evaluación de sesgos demográficos o acentos más allá de los conjuntos citados.

## Enlaces

- Hugging Face: https://huggingface.co/ampixa/jyoti
- Paper de inspiración TinyCall: https://arxiv.org/abs/2609.25379
- Modelo ASR nepalí usado en la evaluación: https://huggingface.co/ampixa/nepali-conformer-offline
- Dataset LibriSpeech ASR: https://huggingface.co/datasets/openslr/librispeech_asr
- Modelo ASR inglés usado en la evaluación: `facebook/wav2vec2-base-960h` (revisión `22aad52d`), disponible en Hugging Face
