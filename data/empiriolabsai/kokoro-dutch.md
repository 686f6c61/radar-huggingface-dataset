# empiriolabsai/kokoro-dutch

## Resumen

Kokoro Dutch es un modelo de síntesis de voz (text-to-speech) especializado en neerlandés, desarrollado por EmpirioLabs como un ajuste fino (finetune) del conocido Kokoro-82M de hexgrad. El modelo convierte texto neerlandés en audio inteligible y natural con dos voces diferenciadas: `noor` (femenina) y `daan` (masculina). Con 82 millones de parámetros, mantiene el tamaño y la velocidad del modelo base, lo que lo sitúa en la categoría de TTS ultraligero apto para despliegue en CPU y en el navegador.

La relevancia de este modelo radica en su enfoque en el neerlandés, un idioma con cobertura limitada en sistemas TTS de alta calidad. Según las mediciones del propio autor, supera a todas las voces Piper probadas en inteligibilidad (menor tasa de error de palabra, WER) y naturalidad (UTMOS) sobre 200 frases no vistas durante el entrenamiento. Además, maneja correctamente números, fechas, horas y precios tal como los pronuncia un hablante nativo de neerlandés.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones, e incluye pesos en formato PyTorch (`.pth`) y ONNX en precisión completa, media precisión e int8, lo que facilita su integración tanto en Python como en entornos JavaScript mediante transformers.js. Se carga con el paquete estándar `kokoro` y un módulo de conversión texto-a-fonema específico para neerlandés incluido en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kokoro (modelo TTS basado en StyleTTS 2, según el tag `style_text_to_speech_2`) |
| Parametros totales | 82 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrada limitada a ~500 fonemas por llamada, según recomendación del autor) |
| Tipos de cuantizacion | ONNX en precisión completa, media precisión e int8 (archivo int8 de 115 MB) |
| Idiomas soportados | Neerlandés (`nl`) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pth`), ONNX (`model.onnx`), voces en `.pt` |

## Arquitectura y entrenamiento

Kokoro Dutch es un ajuste fino de hexgrad/Kokoro-82M, un modelo de síntesis de voz de 82 millones de parámetros etiquetado con la familia `style_text_to_speech_2`, lo que indica una arquitectura derivada de StyleTTS 2. Esta familia combina un codificador de estilo, un generador acústico y un vocoder para producir audio a 24 kHz a partir de fonemas. El modelo base es conocido por su ligereza y su capacidad de ejecutarse en tiempo real incluso en CPU.

La información disponible no detalla el volumen de datos de entrenamiento, la composición del corpus neerlandés utilizado para el ajuste fino ni si se aplicaron técnicas de RLHF o DPO (poco habituales en TTS). El autor sí documenta que el modelo incorpora un módulo propio de conversión texto-a-fonema (`g2p_nl.py`) que normaliza números, fechas, horas y precios antes de la síntesis, apoyándose en el programa `espeak-ng`. La evaluación se realizó el 2026-11-20 sobre 200 frases neerlandesas no vistas, transcribiendo cada clip con `openai/whisper-large-v3` para calcular el WER.

## Capacidades

- Síntesis de voz en neerlandés a partir de texto, con salida de audio a 24 kHz.
- Dos voces: `noor` (femenina) y `daan` (masculina).
- Normalización de números, fechas, horas y precios con pronunciación natural en neerlandés (por ejemplo, "€ 3,50" o "14:35").
- Control de velocidad de habla mediante el tercer argumento de `model(...)` (1.0 es velocidad normal).
- Ejecución en PyTorch, ONNX Runtime y transformers.js (navegador).
- Conversión texto-a-fonema específica para neerlandés incluida en el repositorio.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de modelos de lenguaje: es exclusivamente un modelo TTS.

## Casos de uso

- Lectura de noticias y boletines en neerlandés: el modelo pronuncia correctamente cifras, fechas y precios, lo que lo hace adecuado para generar audio de titulares y resúmenes periodísticos de forma automatizada.
- Asistentes de voz para atención al cliente en neerlandés: al ser ligero (int8 de 115 MB) y ejecutable en CPU, puede desplegarse en servidores modestos para responder con voz sintética en flujos de IVR o chatbots telefónicos.
- Accesibilidad web: integración mediante transformers.js permite leer en voz alta contenido de páginas web directamente en el navegador, sin enviar texto a servidores externos.
- Anuncios de transporte público: las pruebas con frases como "De trein naar Amsterdam vertrekt om 14:35 van spoor 5" demuestran su idoneidad para megafonía y avisos de estaciones y aeropuertos.
- Audiolibros y contenido educativo: con velocidad ajustable y dos voces, puede narrar materiales didácticos o textos largos divididos en frases (el autor recomienda llamadas de hasta ~500 fonemas).
- Prototipado de productos de voz para el mercado neerlandés: al ser Apache 2.0 y cargarse con el paquete estándar `kokoro`, permite iterar rápidamente en demos y MVPs sin coste de licencia.
- Generación de audio para vídeos y pódcast corporativos en neerlandés, con la opción de alternar voces masculina y femenina para dar variedad.

## Benchmarks y rendimiento

Resultados medidos por EmpirioLabs el 2026-11-20 sobre 200 frases neerlandesas no vistas. WER (word error rate, menor es mejor) calculado con `openai/whisper-large-v3`; UTMOS (naturalidad estimada, escala 1-5, mayor es mejor).

| Sistema | WER | UTMOS |
|---|---:|---:|
| Kokoro Dutch `noor` | 0,93 % | 4,21 |
| Kokoro Dutch `daan` | 0,98 % | 4,15 |
| Piper `nl_NL-pim-medium` | 1,49 % | 3,69 |
| Piper `nl_BE-flemishguy-medium` | 2,21 % | 3,19 |
| Piper `nl_NL-ronnie-medium` | 2,21 % | 3,39 |
| Piper `nl_BE-nathalie-medium` | 2,42 % | 3,60 |
| Piper `nl_BE-rdh-medium` | 3,35 % | 3,26 |
| Piper `nl_NL-alex-medium` | 3,76 % | 3,71 |
| Piper `nl_NL-mls-medium` | 22,59 % | 2,62 |
| Piper `nl_NL-mls_5809-low` | 24,55 % | 2,83 |
| Piper `nl_NL-mls_7432-low` | 44,26 % | 2,59 |

Rendimiento del modelo int8 sobre las mismas frases: `noor` 1,03 % WER y UTMOS 3,56; `daan` 1,13 % WER y UTMOS 3,60.

Velocidad medida sobre 60 frases en 4 hilos de un AMD EPYC 7402P (segundos de audio por segundo de cómputo): PyTorch 3,4x tiempo real, ONNX precisión completa 3,8x, ONNX int8 3,5x.

## Requisitos de hardware

- VRAM/RAM estimada: el modelo completo en precisión completa ocupa una fracción pequeña de memoria; el archivo ONNX int8 es de 115 MB, por lo que puede ejecutarse en entornos con menos de 1 GB de RAM dedicada al modelo.
- GPU recomendadas: no requiere GPU. Funciona en CPU; cualquier GPU moderna (RTX 4090, A100, H100) aceleraría la inferencia, pero el modelo está diseñado para ser eficiente en CPU.
- Cabe en cualquier GPU de consumo e incluso en dispositivos de gama baja y en el navegador vía transformers.js.
- Opciones de despliegue: paquete Python `kokoro` (PyTorch), ONNX Runtime, transformers.js. Requiere `espeak-ng` instalado en el sistema para el módulo de conversión texto-a-fonema.
- Latencia y throughput: 3,4x tiempo real en PyTorch y 3,8x en ONNX FP sobre 4 hilos de un AMD EPYC 7402P; el rendimiento depende del procesador y del número de hilos.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | WER (neerlandés) | UTMOS | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Kokoro Dutch (`noor`) | 82 M | nl | 0,93 % | 4,21 | Apache 2.0 | Hugging Face, ONNX, transformers.js |
| Piper `nl_NL-pim-medium` | No disponible | nl | 1,49 % | 3,69 | No disponible en la información | Piper |
| Piper `nl_BE-nathalie-medium` | No disponible | nl (Bélgica) | 2,42 % | 3,60 | No disponible en la información | Piper |
| Kokoro-82M (base) | 82 M | Multilingüe (sin neerlandés específico) | No disponible | No disponible | Apache 2.0 | Hugging Face |

Los datos de WER y UTMOS de los modelos Piper provienen de la evaluación del propio autor de Kokoro Dutch; no se dispone de parámetros ni licencias de esos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta neerlandés (`nl`); no es multilingüe.
- No es un modelo de lenguaje: no genera texto, no razona ni soporta tool calling.
- El autor recomienda limitar cada llamada a unos 500 fonemas; para textos largos hay que dividir en frases y unir el audio, lo que puede introducir discontinuidades en la prosodia.
- Requiere `espeak-ng` instalado para la conversión texto-a-fonema, una dependencia externa al modelo.
- La cuantización int8 reduce la naturalidad (UTMOS baja de 4,21 a 3,56 en `noor`) y empeora ligeramente el WER (de 0,93 % a 1,03 %).
- Los benchmarks son autoinformados por el autor sobre 200 frases; no hay validación independiente disponible.
- Riesgo de errores de pronunciación en palabras extranjeras, nombres propios o terminología técnica no cubierta por el módulo G2P.
- No se documentan sesgos específicos ni limitaciones de contexto más allá de la longitud de entrada.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las obligaciones de atribución del modelo base Kokoro-82M.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/empiriolabsai/kokoro-dutch
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
- Web de EmpirioLabs: https://empiriolabs.ai
- Plataforma de EmpirioLabs: https://platform.empiriolabs.ai
- Otros modelos de EmpirioLabs: https://huggingface.co/empiriolabsai
- Discord de EmpirioLabs: https://discord.gg/bM52azW4ZD
- Muestras de audio: https://huggingface.co/empiriolabsai/kokoro-dutch/tree/main/samples
