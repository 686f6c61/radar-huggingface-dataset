# Miyauel/meari-accent-gyeongsang

## Resumen

Meari accent — Gyeongsang es un modelo de texto a voz (TTS) especializado en el acento regional de Gyeongsang (경상), una de las variantes dialectales del coreano. Lo desarrolla Miyauel como componente del motor de voz local Meari, publicado bajo licencia MIT. No se trata de un modelo completo de TTS, sino de la etapa GPT de GPT-SoVITS v2ProPlus (`s1v3.ckpt`), afinada y exportada a ONNX para su integración en el pipeline de Meari.

El modelo parte de los pesos de GPT-SoVITS de lj1995 y se ha ajustado durante 2 épocas sobre aproximadamente 10 horas de audio en dialecto de Gyeongsang, procedente del conjunto de datos de AI Hub sobre habla dialectal coreana de hablantes de mediana edad y mayores. Su función concreta es la de encoder de texto y etapa GPT con caché por capa, cuantizada dinámicamente a 8 bits, que debe combinarse con el paquete base `Miyauel/meari-accent-base` para obtener la etapa de sonido y los valores de voz.

La relevancia del modelo radica en su enfoque: es un componente pequeño (0,2 GB de repositorio) que aborda un problema poco cubierto, la síntesis de voz con acento regional coreano, y lo hace con métricas medidas mediante un clasificador de dialecto. Su adopción está limitada por su naturaleza de pieza intermedia dentro de un motor concreto, no de modelo autónomo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-SoVITS v2ProPlus, etapa GPT con caché por capa, exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | cuantización dinámica de 8 bits en la etapa GPT (`t2s_prefill.onnx`, `t2s_step.onnx`) |
| Idiomas soportados | coreano (ko), con acento regional de Gyeongsang |
| Licencia | MIT |
| Formato de pesos | ONNX (`t2s_encoder.onnx`, `t2s_prefill.onnx`, `t2s_step.onnx`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de GPT-SoVITS v2ProPlus, un sistema de TTS de dos etapas en el que la etapa GPT predice tokens acústicos a partir del texto y la etapa SoVITS (incluida en el paquete base) los convierte en audio. En esta ficha se publica únicamente la etapa GPT junto con su encoder de texto, con caché por capa para la generación autorregresiva y cuantización dinámica de 8 bits para reducir el coste de inferencia. El encoder de texto se reajusta también, de modo que cada región dialectal cuenta con su propia representación textual.

El ajuste fino se realizó durante 2 épocas sobre aproximadamente 10 horas de habla dialectal de Gyeongsang, extraídas del conjunto «Korean dialect speech of middle-aged and elderly speakers (Gangwon, Gyeongsang)» de AI Hub (aihub.or.kr), un resultado de proyecto de la National Information Society Agency de Corea. No se especifican en la información disponible detalles sobre el uso de RLHF, DPO u otras técnicas de alineación, ni el número de tokens de entrenamiento.

## Capacidades

- Síntesis de voz en coreano con acento regional de Gyeongsang, integrada en la etapa GPT de un pipeline GPT-SoVITS.
- Codificación de texto específica para la variante dialectal, mediante un encoder reajustado (`t2s_encoder.onnx`).
- Generación autorregresiva con caché por capa, separada en fases de prefill (`t2s_prefill.onnx`) y de paso (`t2s_step.onnx`).
- Inferencia en formato ONNX con cuantización dinámica de 8 bits, orientada a ejecución local.
- Capacidad de aplicar el acento dialectal también sobre texto en coreano estándar, según las mediciones del autor.
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada ni modo de razonamiento; es un componente de TTS, no un modelo conversacional.

## Casos de uso

- Lectura de textos en coreano con acento de Gyeongsang: dentro del motor Meari, el modelo convierte texto en tokens acústicos con entonación y fonética dialectal, adecuado para aplicaciones de accesibilidad o lectura de documentos.
- Doblaje y locución de contenido regional: series, audiolibros o pódcast dirigidos a audiencias de la región de Gyeongsang, donde un acento estándar resultaría poco natural.
- Preservación y divulgación del dialecto: generación de material didáctico o divulgativo sobre la variante de Gyeongsang, con una voz sintética controlada y sin reproducir voces reales.
- Asistentes de voz locales: al ejecutarse en ONNX con cuantización de 8 bits, puede integrarse en motores de voz de escritorio o dispositivos sin conexión a la nube.
- Prototipado de TTS dialectal para investigación: sirve como punto de partida para estudiar la transferencia de acento en modelos GPT-SoVITS y comparar variantes regionales con el paquete base.
- Sustitución de la etapa GPT en despliegues existentes de GPT-SoVITS: cualquier pipeline que ya use `s1v3.ckpt` puede intercambiar esta etapa para obtener salida con acento de Gyeongsang, siempre que se combine con `meari-accent-base`.

## Benchmarks y rendimiento

Mediciones del autor con un clasificador de dialecto regional (documentadas en `docs/benchmarks.md` de Meari, sección «사투리»):

| Condición | Porcentaje percibido como Gyeongsang |
|---|---|
| Grabaciones reales | 78% (40 frases) |
| Modelo base antes del ajuste, texto dialectal | 5% |
| Este modelo, texto dialectal | 40% |
| Modelo base antes del ajuste, texto en coreano estándar | 14% (128 frases) |
| Este modelo, texto en coreano estándar | 30% (+16 puntos porcentuales; intervalo del 95%: +9 a +23) |

No se han publicado resultados de benchmarks estándar de TTS (MOS, WER, similitud de hablante) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio ocupa 0,2 GB y la etapa GPT está cuantizada a 8 bits, por lo que la huella debería ser reducida, pero no se documentan cifras de memoria en inferencia.
- GPU recomendadas: no disponibles. Al ser un componente ONNX pequeño, es probable que funcione en GPU de gama media o incluso en CPU, pero el autor no lo especifica.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el tamaño del repositorio sugiere que cabría en tarjetas de consumo, sin datos oficiales.
- Opciones de despliegue: runtime ONNX (ONNX Runtime) dentro del motor Meari; requiere además el paquete `Miyauel/meari-accent-base` para la etapa de sonido y los valores de voz. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma/acento | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Meari accent — Gyeongsang | Etapa GPT de GPT-SoVITS v2ProPlus, ajustada | Coreano, acento de Gyeongsang | MIT | ONNX (8 bits) | HuggingFace (Miyauel) |
| GPT-SoVITS v2ProPlus (`s1v3.ckpt`) | Modelo base completo de TTS | Coreano y otros, sin acento regional específico | MIT | Checkpoint PyTorch | HuggingFace (lj1995) |
| Meari accent — base | Paquete base de Meari (etapa de sonido y valores de voz) | Coreano | MIT | no disponible | HuggingFace (Miyauel) |

No se dispone de datos de benchmarks comparativos con otros sistemas de TTS dialectal en la información proporcionada.

## Limitaciones y advertencias

- Es un componente parcial: no funciona de forma autónoma y requiere el paquete `Miyauel/meari-accent-base` para generar audio.
- El rendimiento medido es modesto: solo el 40% de las frases con texto dialectal se perciben como Gyeongsang, frente al 78% de las grabaciones reales; la brecha respecto al habla natural es considerable.
- El ajuste fue corto (2 épocas sobre unas 10 horas de audio), lo que puede limitar la generalización a vocabularios y estilos no vistos.
- Riesgo de artefactos y pronunciación inconsistente en textos largos o fuera del dominio dialectal; no se documentan evaluaciones de naturalidad (MOS) ni de inteligibilidad (WER).
- Sesgos potenciales derivados del corpus de AI Hub, limitado a hablantes de mediana edad y mayores de Gangwon y Gyeongsang; la voz resultante puede no representar a hablantes jóvenes o de otras regiones.
- El modelo no reproduce las voces de los hablantes del conjunto de datos; la identidad vocal proviene de los valores de referencia del paquete base.
- Aunque la licencia es MIT, el uso comercial debe verificar las condiciones del conjunto de datos de AI Hub subyacente y las obligaciones de atribución a la NIA.
- No se documentan limitaciones de longitud de contexto ni de idioma más allá del coreano.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Miyauel/meari-accent-gyeongsang
- Paquete base de Meari: https://huggingface.co/Miyauel/meari-accent-base
- Repositorio del motor Meari: https://github.com/Miyauel/Meari
- Pesos originales de GPT-SoVITS: https://huggingface.co/lj1995/GPT-SoVITS
- Conjunto de datos de AI Hub (dialectos coreanos): https://aihub.or.kr
