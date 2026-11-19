# Ekam/Libra-TTS

## Resumen

Libra TTS es un modelo de síntesis de voz (text-to-speech) multilingüe desarrollado por Ekam, publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo derivado por destilación de Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice, que reduce el tamaño hasta los 307 millones de parámetros en pesos (421M incluyendo el decodificador de forma de onda según la model card) manteniendo y mejorando la calidad de síntesis del modelo original. Cubre 16 idiomas y ofrece 8 voces predefinidas con 14 estilos de habla.

El modelo resuelve el problema de la síntesis de voz de calidad en entornos con recursos limitados: según los datos del autor, alcanza una tasa de error de palabra (WER) del 1,64 % en inglés, inferior a la de Qwen3-TTS 1.7B (2,74 %) y 0.6B (3,21 %), y un 1,77 % de media en diez idiomas, con un tamaño cinco veces menor que el modelo de 1.7B del que deriva. Está pensado para ejecutarse en Apple Silicon mediante MLX, en GPU NVIDIA con PyTorch y en CPU mediante ONNX Runtime.

La relevancia actual del modelo radica en su eficiencia: según la model card, procesa una frase 7,7 veces más rápido que el tiempo real en un MacBook Pro y 8,7 veces en una RTX 3090, y es capaz de leer 15 minutos de audio en 13 segundos en texto largo. Además, lee texto en bruto (números, fechas, horas y divisas) sin preprocesamiento y añade seis idiomas respecto a su modelo base: árabe, hindi, panyabí, bengalí, urdu e indonesio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo TTS derivado por destilación de Qwen3-TTS-12Hz-1.7B-CustomVoice; no se detalla la arquitectura interna en la información proporcionada) |
| Parámetros totales | 307.149.568 en pesos safetensors; 421M incluyendo el decodificador de forma de onda (según model card) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (se distribuyen pesos en safetensors, ONNX y formato MLX; no se detallan niveles de cuantización) |
| Idiomas soportados | 16: en, zh, ja, ko, de, fr, es, it, pt, ru, ar, hi, pa, bn, ur, id |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX, MLX |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de que se trata de un modelo de text-to-speech derivado por destilación de Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice. El nombre del modelo base sugiere una representación temporal a 12 Hz, pero no se confirma en la documentación proporcionada. El modelo incluye un decodificador de forma de onda que eleva el recuento de parámetros de 307M en pesos a 421M totales.

El entrenamiento se basa en destilación desde el modelo Qwen3-TTS de 1.7B. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones técnicas como decodificación especulativa o atención lineal. La model card sí destaca que el modelo lee texto en bruto sin preprocesamiento y que soporta estilos de habla y control de velocidad, lo que implica un condicionamiento adicional sobre la salida de voz.

## Capacidades

- Síntesis de voz multilingüe en 16 idiomas: inglés, chino, japonés, coreano, alemán, francés, español, italiano, portugués, ruso, árabe, hindi, panyabí, bengalí, urdu e indonesio.
- Ocho voces predefinidas: nina (por defecto), sofia, aliya, maya, omar, jon, bob y sam.
- Catorce estilos de habla: warm, cheerful, excited, sad, tense, frightened, angry, calm, serious, wry, tender, whispering, dramatic y documentary.
- Control de velocidad de habla mediante los parámetros `pace="slow"` y `pace="fast"`.
- Lectura de texto en bruto: números, fechas, horas y divisas sin preprocesamiento.
- Detección automática del idioma a partir del sistema de escritura; para idiomas con alfabeto latino distinto del inglés es necesario pasar el parámetro `lang`.
- Ejecución en Apple Silicon mediante MLX, en GPU NVIDIA mediante PyTorch y en CPU mediante ONNX Runtime.
- Interfaz de línea de comandos y API de Python (`LibraTTS`).
- No se menciona soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Audiolibros y narración de texto largo: el modelo procesa texto extenso a alta velocidad (15 minutos de audio en 13 segundos según la model card) y ofrece estilos como `documentary` o `calm`, adecuados para narración sostenida.
- Asistentes de voz y atención al cliente: las ocho voces y los catorce estilos permiten adaptar el tono (por ejemplo, `warm` o `serious`) a distintos contextos conversacionales, con detección automática de idioma para usuarios multilingües.
- Accesibilidad y lectores de pantalla: la lectura de texto en bruto (números, fechas, horas y divisas) elimina la necesidad de preprocesar el contenido antes de la síntesis, lo que simplifica la integración en lectores de pantalla y aplicaciones de accesibilidad.
- Localización de contenido multimedia: con 16 idiomas y la posibilidad de cambiar de voz y estilo, se puede doblar o generar pistas de audio para vídeos, pódcast y cursos en línea sin un estudio de grabación.
- Generación de voz en el dispositivo: al ejecutarse en Apple Silicon con MLX y en CPU con ONNX, es viable integrarlo en aplicaciones de escritorio o móviles que requieran privacidad y baja latencia sin depender de la nube.
- Prototipado rápido de interfaces conversacionales: la API de Python y la CLI permiten generar muestras de voz en segundos durante el desarrollo de asistentes, IVR o sistemas de mensajería.
- Síntesis para idiomas con menos recursos: la incorporación de árabe, hindi, panyabí, bengalí, urdu e indonesio amplía la cobertura respecto al modelo base, útil para aplicaciones dirigidas a esos mercados.

## Benchmarks y rendimiento

Los datos de la model card miden la tasa de error de palabra (WER) de un reconocedor de voz sobre el audio generado (Whisper-large-v3; Paraformer-zh para chino; Omnilingual ASR para panyabí, bengalí y urdu), con la métrica seed-tts-eval; cuanto menor, mejor.

| Modelo | Parámetros | WER inglés | Media 10 idiomas |
|---|---:|---:|---:|
| Libra TTS | 421M | 1,64 % | 1,77 % |
| Qwen3-TTS 1.7B | 2.0B | 2,74 % | 2,75 % |
| Qwen3-TTS 0.6B | 1.0B | 3,21 % | 2,62 % |
| Magpie-357M | 466M | 1,77 % | No disponible |
| Kokoro-82M | 82M | 1,80 % | No disponible |
| MOSS-TTS-Nano | 117M | 3,06 % | 8,83 % |
| Soprano-1.1 | 110M | 3,45 % | No disponible |
| PocketTTS | 118M | 3,81 % | No disponible |
| KittenTTS mini 0.8 | 74M | 4,33 % | No disponible |

Desglose por idioma (error %, menor es mejor):

| Modelo | en | zh | ja | ko | de | fr | es | it | pt | ru |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Libra TTS | 1,07 | 0,98 | 3,84 | 2,08 | 0,50 | 2,74 | 0,60 | 1,00 | 1,07 | 3,85 |
| Qwen3-TTS 1.7B | 0,94 | 0,75 | 3,47 | 4,87 | 2,39 | 4,71 | 1,47 | 2,05 | 2,18 | 4,69 |
| Qwen3-TTS 0.6B | 1,25 | 1,15 | 6,02 | 1,92 | 0,90 | 4,11 | 1,55 | 1,74 | 2,33 | 5,26 |

Según la model card, la mejora media de Libra TTS frente a Qwen3-TTS es de −0,98 puntos frente al modelo de 1.7B y −0,85 frente al de 0.6B (intervalos de confianza del 95 % que excluyen el cero). El conjunto de evaluación en inglés comprende 2.215 frases (Seed-TTS-eval test-en + LibriSpeech-PC test-clean); el conjunto de diez idiomas es el MiniMax multilingual test set, con 100 frases por idioma.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 307M parámetros en pesos (421M con decodificador), el modelo es muy ligero y cabe holgadamente en GPU de consumo, aunque no se publican cifras exactas de VRAM.
- GPU recomendadas: RTX 3090 (8,7 veces más rápido que el tiempo real según la model card) y, en general, GPU NVIDIA con soporte CUDA mediante PyTorch. En Apple Silicon se ejecuta mediante MLX; la model card cita un MacBook Pro con 7,7 veces el tiempo real.
- Cabe en GPU de consumo: sí, por el tamaño reducido del modelo (307M parámetros en pesos); no se especifican modelos concretos de gama baja.
- Opciones de despliegue: MLX en Apple Silicon, PyTorch con CUDA en NVIDIA, ONNX Runtime en CPU, además de CLI y API de Python del paquete `libra-tts`.
- Latencia y throughput: una frase a la vez, 7,7 veces más rápido que el tiempo real en MacBook Pro y 8,7 veces en RTX 3090; aproximadamente 70 veces en lectura de texto largo en ambas plataformas (15 minutos de audio en 13 segundos); 2,4 veces en CPU con ONNX.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | WER inglés | WER medio 10 idiomas | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| Libra TTS | 421M | 16 | 1,64 % | 1,77 % | Apache 2.0 | Hugging Face (MLX, ONNX, safetensors) |
| Qwen3-TTS 1.7B | 2.0B | 10 | 2,74 % | 2,75 % | No disponible en la información proporcionada | Hugging Face |
| Qwen3-TTS 0.6B | 1.0B | 10 | 3,21 % | 2,62 % | No disponible en la información proporcionada | Hugging Face |
| Kokoro-82M | 82M | No disponible | 1,80 % | No disponible | No disponible en la información proporcionada | Hugging Face |
| Magpie-357M | 466M | No disponible | 1,77 % | No disponible | No disponible en la información proporcionada | Hugging Face |

Libra TTS ofrece el mejor WER en inglés de la comparativa y la mejor media en diez idiomas, con un tamaño cinco veces menor que Qwen3-TTS 1.7B y con seis idiomas adicionales. Frente a Kokoro-82M y Magpie-357M, su ventaja en inglés es menor (1,64 % frente a 1,80 % y 1,77 %), pero añade cobertura multilingüe amplia y estilos de habla.

## Limitaciones y advertencias

- No se han documentado en la información proporcionada sesgos conocidos del modelo; al ser un modelo de voz, existe riesgo de sesgos de género, edad o acento en las voces predefinidas.
- Riesgo de alucinación en la síntesis: como todo modelo generativo de audio, puede producir pronunciaciones incorrectas o artefactos, especialmente en texto ambiguo o idiomas con menos datos.
- La detección automática de idioma se basa en el sistema de escritura; para idiomas con alfabeto latino distintos del inglés es necesario pasar el parámetro `lang`, lo que puede provocar errores si no se especifica.
- El WER en algunos idiomas es notablemente superior al de inglés: japonés (3,84 %), ruso (3,85 %) y francés (2,74 %) son los peores resultados del desglose publicado.
- No se detallan limitaciones de longitud de contexto ni de número máximo de caracteres por síntesis en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen3-TTS del que deriva.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que su validación por parte de la comunidad es aún inexistente.
- No se especifican requisitos de VRAM ni cuantizaciones disponibles, lo que dificulta planificar despliegues en hardware muy limitado.

## Enlaces

- Hugging Face: https://huggingface.co/Ekam/Libra-TTS
- Repositorio de código: https://github.com/ekambrar100/libra-tts
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice
- Muestras de audio: incluidas en la model card (13 muestras en la sección Samples)
- Licencia: https://huggingface.co/Ekam/Libra-TTS/blob/main/LICENSE
