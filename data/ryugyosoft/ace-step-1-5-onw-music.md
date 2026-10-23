# ryugyosoft/ACE-Step-1.5-onw-music

## Resumen

ACE-Step 1.5 turbo for onw-music es un paquete de conversión a OpenVINO del modelo de generación musical ACE-Step 1.5 (variante turbo), optimizado para ejecutarse íntegramente en la NPU de los procesadores Intel Core Ultra. Lo publica el usuario ryugyosoft y está pensado para integrarse en onw-music, una aplicación de generación musical local. No es un modelo entrenado desde cero, sino una conversión y cuantización de los pesos originales de ACE-Step/Ace-Step1.5, de ahí que herede su licencia MIT.

El modelo resuelve la generación de audio musical a partir de descripciones de texto (text-to-audio), con soporte opcional de letras cantadas. La arquitectura combina un transformer de difusión (DiT) de 24 capas, un decodificador VAE y dos codificadores: uno de texto basado en Qwen3-Embedding-0.6B y otro de letras en fp16. El paquete incluye además el tokenizador y el latente de silencio.

Su relevancia actual radica en que acerca la generación musical de alta fidelidad a hardware de consumo sin GPU dedicada: toda la pila (codificadores, DiT y VAE) se ejecuta en la NPU Intel mediante OpenVINO, con latencias que van de unos 6,5 s para 30 s de audio en Lunar Lake hasta unos 62 s para 120 s en Arrow Lake HX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT de 24 capas (difusión) + decodificador VAE + codificador de texto Qwen3-Embedding-0.6B + codificador de letras |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; duración de pista generada de 10 a 600 s |
| Tipos de cuantizacion | DiT INT8 (escala por canal); codificadores y VAE en fp16 |
| Idiomas soportados | no disponible |
| Licencia | MIT (modelo base); codificador de texto Apache-2.0 |
| Formato de pesos | grafos y pesos OpenVINO; no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El paquete no incluye entrenamiento propio: es una conversión de ACE-Step/Ace-Step1.5 (turbo) a grafos OpenVINO. El DiT tiene 24 capas, cuyos pesos se agrupan en un único fichero en INT8 con escala por canal; el grafo de una capa se construye en el PC en tiempo de uso en función de la longitud de la canción. Los codificadores (texto y letras) se ejecutan en fp16, inyectando los pesos en un grafo de una capa. El decodificador VAE se reparte en cinco grafos en fp16, con una variante específica para la NPU 3720 que evita el uso de `sin`.

Según la model card, la fidelidad respecto al cálculo oficial en fp32 es alta: el error relativo de la velocidad del DiT es de 0,13 en el primer paso y 0,022 en el último (0,117 y 0,020 si se usan los mismos pesos INT8 en CPU), los codificadores presentan un error del 0,2 al 0,7 % y el VAE alcanza una SNR de aproximadamente 54 dB.

## Capacidades

- Generación de música a partir de texto (text-to-audio): melodía, armonía, ritmo e instrumentación.
- Soporte opcional de letras cantadas mediante un codificador de letras dedicado.
- Generación de pistas de 10 a 600 segundos de duración.
- Ejecución completa en la NPU Intel Core Ultra a través de OpenVINO (codificadores, DiT y VAE).
- Integración con la aplicación onw-music como origen de modelos.
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada.

## Casos de uso

- Generación musical local en portátiles Intel Core Ultra: el usuario describe el estilo y la instrumentación en texto y el modelo produce una pista completa sin depender de la nube ni de una GPU dedicada.
- Creación de bandas sonoras para vídeo corto: pistas de 30 a 120 segundos generadas en decenas de segundos permiten iterar rápidamente sobre varias propuestas musicales.
- Maquetas con letra: el codificador de letras permite probar estribillos y versos cantados sobre una base generada para validar ideas antes de una producción real.
- Prototipado en estudios pequeños: al ejecutarse en la NPU de un portátil, se evita el coste de una estación con GPU y se mantiene el flujo de trabajo en local.
- Pruebas de concepto en investigación sobre generación de audio: la conversión OpenVINO facilita medir el impacto de la cuantización INT8 en la calidad musical.
- Integración en aplicaciones de escritorio: onw-music puede descargar el paquete (unos 4,3 GB) y compilar los grafos una sola vez en el PC para reutilizarlos en generaciones posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que se trata de un modelo de generación musical. Los datos aportados son de latencia y de fidelidad numérica.

| Escenario | Lunar Lake (NPU 4000) | Panther Lake (NPU 5010) | Arrow Lake HX (NPU 3720) |
|---|---|---|---|
| Pista de 30 s | ~6,5 s | ~7 s | ~15 s |
| Pista de 120 s | ~25 s | ~24 s | ~62 s |

| Métrica de fidelidad | Valor |
|---|---|
| Error relativo de velocidad del DiT, primer paso | 0,13 |
| Error relativo de velocidad del DiT, último paso | 0,022 |
| Error relativo en CPU con los mismos pesos INT8 | 0,117 / 0,020 |
| Error de los codificadores | 0,2-0,7 % |
| SNR del VAE | ~54 dB |

## Requisitos de hardware

- Hardware objetivo: NPU de Intel Core Ultra con OpenVINO; no está pensado para GPU NVIDIA en este paquete.
- Plataformas validadas: Lunar Lake (NPU 4000), Panther Lake (NPU 5010) y Arrow Lake HX (NPU 3720).
- Espacio en disco: repositorio de 6,0 GB; descarga desde onw-music de unos 4,3 GB.
- VRAM: no aplica, ya que la inferencia se realiza en la NPU; no se especifica el consumo de memoria del sistema.
- Compilación: los grafos para la NPU se compilan una sola vez en el PC antes de su uso.
- Despliegue: aplicación onw-music con OpenVINO; no se documentan opciones con vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia: entre ~6,5 s (Lunar Lake, 30 s de audio) y ~62 s (Arrow Lake HX, 120 s de audio), según la tabla de la model card.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto / duración | Licencia | Disponibilidad |
|---|---|---|---|---|
| ACE-Step/Ace-Step1.5 (original) | Text-to-audio en fp32, orientado a GPU (CUDA, Mac, AMD, Intel) | no disponible; menos de 2 s por canción en A100 y menos de 4 GB de VRAM según la documentación del proyecto | MIT | HuggingFace |
| ryugyosoft/ACE-Step-1.5-onwx-music | Conversión OpenVINO para NPU AMD Ryzen AI | no disponible; mismas limitaciones de duración de pista | MIT (hereda del base) | HuggingFace |
| ryugyosoft/ACE-Step-1.5-onw-music (este modelo) | Conversión OpenVINO para NPU Intel Core Ultra | pistas de 10 a 600 s | MIT | HuggingFace |

## Limitaciones y advertencias

- Es una conversión y cuantización, no un modelo entrenado de forma independiente: su calidad está acotada por la del modelo base ACE-Step/Ace-Step1.5.
- La cuantización INT8 del DiT introduce un error relativo de velocidad de hasta 0,13 en el primer paso de muestreo, lo que puede afectar a la fidelidad frente al cálculo en fp32.
- Depende exclusivamente de la NPU de Intel Core Ultra con OpenVINO; no es ejecutable en GPU NVIDIA ni en otras plataformas sin reelaboración.
- Los grafos de la NPU deben compilarse en el PC antes de su uso, lo que añade un paso de preparación.
- No se documentan los idiomas admitidos por el codificador de texto ni por el de letras.
- No se publican resultados de benchmarks subjetivos de calidad musical ni comparaciones formales con otros generadores.
- Riesgo de alucinación y de resultados musicales incoherentes en descripciones ambiguas o muy largas, habitual en modelos generativos de audio.
- La licencia MIT del modelo base permite uso comercial; el codificador de texto Qwen3-Embedding-0.6B se distribuye bajo Apache-2.0 y debe respetarse por separado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del paquete.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/ryugyosoft/ACE-Step-1.5-onw-music
- Aplicación onw-music: https://huggingface.co/ryugyosoft/onw-music
- Modelo base ACE-Step/Ace-Step1.5: https://huggingface.co/ACE-Step/Ace-Step1.5
- Codificador de texto Qwen3-Embedding-0.6B: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Repositorio GitHub de ACE-Step 1.5: https://github.com/ace-step/ACE-Step-1.5
- Página oficial del proyecto: https://ace-step.github.io/ACE-Step-1.5/en/
- Tutorial del proyecto: https://github.com/ace-step/ACE-Step-1.5/blob/main/docs/en/Tutorial.md
- Guía de 2026 sobre ACE-Step 1.5: https://dev.to/czmilo/ace-step-15-the-complete-2026-guide-to-open-source-ai-music-generation-522e
- Variante para AMD Ryzen AI: https://huggingface.co/ryugyosoft/ACE-Step-1.5-onwx-music
