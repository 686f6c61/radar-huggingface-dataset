# catsaiagency/Ocelot

## Resumen

Ocelot es un kit de síntesis de voz (text-to-speech) desarrollado por CatsAI Agency que convierte texto en audio en 20 idiomas. Se trata de un modelo destilado a partir de Qwen3-TTS, diseñado específicamente para ser lo suficientemente pequeño como para ejecutarse en una CPU convencional sin necesidad de GPU, con un factor de tiempo real de aproximadamente 0,05 (unas 20 veces más rápido que el tiempo real). El modelo genera audio WAV mono a 24 kHz a partir de un texto, un idioma y una de las tres voces disponibles.

La arquitectura combina dos componentes: un modelo acústico basado en Matcha-TTS (que transforma texto en mel-espectrograma mediante flow matching) y un vocoder basado en Vocos (que convierte el mel-espectrograma en forma de onda). Cada voz cuenta con 20,9 millones de parámetros (84 MB) y el vocoder compartido con 13,5 millones (54 MB), lo que da un total de aproximadamente 0,3 GB para el repositorio completo. El modelo se distribuye en precisión de 32 bits en PyTorch, sin cuantización.

Su relevancia actual radica en la combinación de un tamaño muy reducido, soporte para 20 idiomas y la capacidad de funcionar en hardware modesto (aproximadamente 700 MB de RAM con una voz cargada), lo que lo hace adecuado para despliegues en entornos con recursos limitados, aplicaciones de escritorio o servicios embebidos. La licencia es propietaria (CatsAI Model License), con uso gratuito para pruebas pero con pago por máquina para uso productivo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Matcha-TTS (texto → mel-espectrograma, flow matching) + Vocos (mel-espectrograma → forma de onda) |
| Parámetros totales | 20,9 M por voz (84 MB) + 13,5 M del vocoder (54 MB); 32 bits en coma flotante, sin cuantizar |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Sin límite fijo; el texto se divide en frases y cada frase se sintetiza por separado |
| Tipos de cuantización | No disponible (el modelo se distribuye en 32 bits sin cuantizar) |
| Idiomas soportados | 20: croata (hr), japonés (ja), inglés (en), chino mandarín (zh), coreano (ko), alemán (de), francés (fr), español (es), italiano (it), portugués (pt), neerlandés (nl), polaco (pl), checo (cs), ruso (ru), sueco (sv), turco (tr), indonesio (id), vietnamita (vi), hindi (hi), húngaro (hu) |
| Licencia | CatsAI Model License (gratuita para probar; pago por máquina para uso productivo) |
| Formato de pesos | Checkpoints de PyTorch (`.ckpt`); no se distribuye en safetensors ni GGUF |

## Arquitectura y entrenamiento

Ocelot emplea una arquitectura en dos etapas. La primera etapa es un modelo acústico basado en Matcha-TTS, un modelo de flow matching que transforma la secuencia de fonemas en un mel-espectrograma. La segunda etapa es un vocoder basado en Vocos que convierte el mel-espectrograma en una forma de onda de audio a 24 kHz. El front-end de texto varía según el idioma: 17 idiomas utilizan espeak-ng (a través del paquete `espeakng-loader`), el japonés emplea `pyopenjtalk` y el inglés usa `g2p_en`; el croata no requiere paquetes adicionales.

El modelo se obtuvo mediante destilación a partir de Qwen3-TTS (licencia Apache 2.0). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica principal es la reducción drástica del tamaño manteniendo la inteligibilidad: el modelo completo (tres voces más vocoder) ocupa aproximadamente 0,3 GB y puede ejecutarse en CPU con un factor de tiempo real de 0,05 con 4 hilos (0,09 con 1 hilo), medido en un procesador Intel Core i7-11800H.

## Capacidades

- Síntesis de voz (text-to-speech) en 20 idiomas con una única voz por ejecución.
- Tres voces disponibles: `woman`, `man` y `deep` (voz masculina más grave y madura); cada voz habla los 20 idiomas.
- Salida de audio WAV mono a 24 kHz.
- Procesamiento de texto sin límite fijo de longitud: el texto se divide en frases y cada una se sintetiza de forma independiente.
- Ejecución en CPU sin GPU, con un factor de tiempo real de aproximadamente 0,05 con 4 hilos.
- Interfaz de línea de comandos (`ocelot.py`) y función `synthesize()` para integración programática.
- Servidor HTTP opcional (`server.py`) que mantiene los modelos cargados y acepta texto para devolver WAV.
- Front-end de texto multilingüe: espeak-ng para 17 idiomas, `pyopenjtalk` para japonés, `g2p_en` para inglés y sin dependencias extra para croata.
- No se mencionan capacidades de tool calling, agentes, razonamiento multi-paso ni otras modalidades (visión, audio de entrada) en la información disponible.

## Casos de uso

- **Lectura de textos en aplicaciones de accesibilidad**: el modelo puede convertir artículos, documentos o mensajes en audio para personas con discapacidad visual, gracias a su bajo consumo de memoria (unos 700 MB de RAM con una voz cargada) y a la posibilidad de ejecutarse en CPU sin GPU.
- **Asistentes de voz embebidos en dispositivos de bajo consumo**: al requerir solo CPU y un factor de tiempo real de 0,05, puede integrarse en routers, Raspberry Pi u otros dispositivos con recursos limitados para dar respuestas habladas en 20 idiomas.
- **Generación de audio para contenido multilingüe**: un mismo pipeline puede producir locuciones en español, inglés, japonés, hindi o vietnamita con la misma voz, lo que simplifica la localización de vídeos, pódcast o cursos.
- **Servicio HTTP de síntesis bajo demanda**: el `server.py` incluido mantiene los modelos cargados y permite que aplicaciones web envíen texto y reciban WAV, adecuado para prototipos de atención al cliente o sistemas de respuesta interactiva de voz (IVR).
- **Prototipado rápido de interfaces conversacionales**: la función `synthesize()` permite integrar la síntesis en scripts de Python para pruebas de concepto de asistentes o chatbots sin necesidad de infraestructura GPU.
- **Generación de audiolibros o narraciones largas**: al no tener un límite fijo de longitud y dividir el texto en frases, puede procesar documentos extensos de forma secuencial con un tiempo de cómputo bajo (por ejemplo, 22,7 segundos de audio en 1,1 segundos en la prueba incluida).
- **Pruebas de calidad y evaluación de TTS**: el kit incluye muestras por idioma y un script `speak_all.py`, lo que facilita la evaluación comparativa de inteligibilidad entre voces e idiomas.

## Benchmarks y rendimiento

La información proporcionada incluye una métrica de calidad basada en la tasa de error de caracteres (CER) al transcribir la salida con Whisper large-v3 sobre una frase de prueba por idioma (20 frases en total):

| Voz | CER | Idiomas transcritos sin error |
|---|---|---|
| `woman` | 0,8 % | 14 de 20 |
| `man` | 1,4 % | 12 de 20 |
| `deep` | 1,7 % | 12 de 20 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo de síntesis de voz y no de un modelo de lenguaje.

## Requisitos de hardware

- **VRAM**: no requiere GPU; el modelo se ejecuta en CPU. La memoria RAM necesaria es de aproximadamente 700 MB con una voz cargada.
- **GPU recomendadas**: no aplica; el modelo está diseñado para CPU. No se mencionan requisitos de GPU en la información disponible.
- **¿Cabe en GPU de consumo?**: sí, pero no es necesario; el modelo funciona en CPU sin GPU.
- **Opciones de despliegue**: el kit incluye la herramienta de línea de comandos `ocelot.py` y un servidor HTTP opcional (`server.py`). No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de modelo.
- **Latencia y throughput**: factor de tiempo real de 0,05 con 4 hilos y 0,09 con 1 hilo en un Intel Core i7-11800H. Ejemplos de ejecución: 2,3 segundos de audio en 0,4 segundos (incluyendo carga del modelo) para japonés; 5,6 segundos de audio en 2,5 segundos para inglés; 22,7 segundos de audio en 1,1 segundos para un texto largo en japonés.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se puede señalar que el modelo del que se destila, Qwen3-TTS, es la referencia directa, pero no se incluyen sus especificaciones (parámetros, contexto, rendimiento) en la información disponible. Tampoco se proporcionan datos de otros sistemas TTS como VITS, Piper o Coqui TTS para establecer una comparación cuantitativa.

| Modelo | Parámetros | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|
| Ocelot | 20,9 M por voz + 13,5 M vocoder | 20 | CatsAI Model License (pago por máquina) | Hugging Face |
| Qwen3-TTS | No disponible | No disponible | Apache 2.0 | No disponible en la información |
| Otros TTS (Piper, Coqui, VITS) | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- **Licencia restrictiva**: la CatsAI Model License permite probar el modelo de forma gratuita, pero exige pago por máquina para uso productivo. Es necesario revisar los términos completos en el archivo `MODEL-LICENSE.md` antes de un despliegue comercial.
- **Riesgo de alucinación**: no aplica en el sentido de generación de texto, pero la síntesis puede producir errores de pronunciación o inteligibilidad en idiomas con menor representación; la tasa de error de caracteres varía entre voces (0,8 % a 1,7 %) y no se especifica por idioma.
- **Sesgos**: no se documentan sesgos conocidos en la información disponible; las tres voces están predefinidas y no se indica si representan diversidad de acentos o géneros más allá de las etiquetas `woman`, `man` y `deep`.
- **Limitaciones de idioma**: aunque soporta 20 idiomas, la calidad puede diferir entre ellos; la métrica CER se basa en una sola frase por idioma, lo que no constituye una evaluación exhaustiva. El front-end de texto depende de espeak-ng 1.52 para 17 idiomas, y versiones anteriores (como 1.50) pueden producir fonemas distintos en zh, es y ru.
- **Dependencias del front-end**: el japonés requiere `pyopenjtalk`, que necesita compilador de C/C++ y CMake; el inglés descarga un diccionario de pronunciación en la primera llamada (unos 2 segundos adicionales); el japonés descarga un diccionario de 23 MB en la primera llamada.
- **Contexto**: no hay límite fijo, pero el texto se divide en frases, lo que puede afectar a la prosodia en textos largos si no se gestiona adecuadamente.
- **Formato de pesos**: solo se distribuyen checkpoints de PyTorch (`.ckpt`), no safetensors ni GGUF, lo que limita su uso con herramientas de inferencia alternativas.
- **Caveat para producción**: el modelo no está cuantizado y se distribuye en 32 bits; no se ofrecen versiones optimizadas para GPU ni para otros formatos de despliegue.

## Enlaces

- [Hugging Face: catsaiagency/Ocelot](https://huggingface.co/catsaiagency/Ocelot)
- [Sitio web de Ocelot](https://catsai.agency/en/ocelot)
- [Licencia del modelo (MODEL-LICENSE.md)](https://huggingface.co/catsaiagency/Ocelot/blob/main/MODEL-LICENSE.md)
- [Repositorio de Qwen3-TTS (modelo original del que se destila)](https://github.com/QwenLM/Qwen3-TTS)
