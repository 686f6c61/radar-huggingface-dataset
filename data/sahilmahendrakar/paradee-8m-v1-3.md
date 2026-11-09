# sahilmahendrakar/Paradee-8M-v1.3

## Resumen

Paradee-8M v1.3 es un modelo de síntesis de voz (text-to-speech) de muy bajo coste computacional, desarrollado por sahilmahendrakar y destilado a partir de Kokoro-82M. Con 7,88 millones de parámetros, es la variante más pequena conocida de un modelo TTS único que habla más de un idioma: aproximadamente 6 veces menor que el siguiente más pequeno (M5-TTS, con 50M). La versión 1.3 amplía la cobertura lingüística respecto a la 1.2 e incorpora ocho voces de Kokoro en cuatro idiomas: inglés (americano y británico), hindi, francés y español.

El modelo resuelve el problema de desplegar TTS multilingüe en entornos con recursos muy limitados: el archivo ONNX cuantizado a int8 ocupa 8,5 MB y contiene las ocho voces, y se ejecuta aproximadamente 62 veces más rápido que tiempo real en un solo hilo de CPU, sin GPU. La selección de voz determina el idioma de salida, y cada frase se pronuncia en un único idioma. La arquitectura y el vocabulario fonético heredan la estructura de Kokoro, por lo que no requiere componentes adicionales para los nuevos idiomas.

La relevancia actual reside en su perfil de despliegue: un único artefacto ONNX de tamano reducido, licencia Apache 2.0 y velocidad en CPU lo hacen adecuado para aplicaciones embebidas, asistentes offline y pipelines de accesibilidad donde el coste por inferencia y la latencia son críticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo TTS destilado de Kokoro-82M; pesos en ONNX) |
| Parametros totales | 7,88 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int8 (ONNX); tamano del archivo int8: 8,5 MB |
| Idiomas soportados | Inglés (americano y británico), hindi, francés, español |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

Paradee-8M v1.3 es un modelo de síntesis de voz destilado de Kokoro-82M. Mantiene la misma forma y tamano que la versión 1.2: cada mitad del modelo contiene una tabla con un vector aprendido por voz, que en esta versión pasa de cuatro a ocho filas (las voces inglesas conservan los índices 0 a 3; las nuevas ocupan 4 a 7). El resto de componentes se comparte entre las ocho voces y los cuatro idiomas. El modelo reutiliza el vocabulario fonético completo de Kokoro, que ya cubre todos los idiomas que este habla, por lo que no fue necesario anadir partes nuevas.

El entrenamiento parte de los pesos de v1.2 y continúa con Kokoro leyendo 12.000 frases de Wikipedia en cada nueva voz, junto con las voces inglesas. En la última ronda, las voces de hindi y español se mostraron tres veces más a menudo. La destilación busca reproducir el comportamiento del profesor (Kokoro-82M) con una fracción de los parámetros. El artículo asociado describe la versión 1.0; no se detallan en la información disponible innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz multilingüe en inglés (americano y británico), hindi, francés y español.
- Ocho voces predefinidas: `af_heart`, `bf_isabella`, `am_puck`, `bm_fable` (inglés), `hf_alpha`, `hm_omega` (hindi), `ff_siwis` (francés) y `em_alex` (español).
- La voz seleccionada determina el idioma de salida; cada frase se pronuncia en un único idioma.
- Inferencia en CPU sin GPU, con un único archivo ONNX int8 de 8,5 MB para las ocho voces.
- Rendimiento aproximado de 62 veces tiempo real en un solo hilo de CPU.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Lectura por voz de articulos de Wikipedia y contenidos enciclopedicos: el modelo fue entrenado con frases de Wikipedia en cada voz, por lo que su dominio de entrenamiento encaja con la lectura de texto enciclopedico en inglés, hindi, francés y español.
- Asistentes de voz offline en dispositivos embebidos: el archivo ONNX int8 de 8,5 MB y la ejecución en un solo hilo de CPU permiten integrar TTS en hardware sin GPU, como Raspberry Pi o moviles de gama baja.
- Accesibilidad web y lectores de pantalla: la velocidad de 62x tiempo real en CPU permite sintetizar parrafos largos con latencia baja sin depender de servicios en la nube.
- Generacion de audiolibros o podcasts multilingües por lotes: la seleccion de voz por idioma permite producir narraciones en cuatro idiomas con un unico modelo y sin infraestructura GPU.
- Sistemas de anuncios y notificaciones por voz: la inferencia rápida en CPU encaja en servicios con muchos eventos cortos y requisitos de latencia ajustados.
- Prototipado e investigación en destilación TTS: al ser un modelo destilado de Kokoro con scripts y paquete Python publicos, sirve como referencia para experimentos de compresion de modelos de voz.
- Localizacion de contenido: un mismo pipeline puede generar la misma frase en inglés, hindi, francés y español cambiando únicamente el identificador de voz.

## Benchmarks y rendimiento

Resultados de Paradee v1.3 (archivo ONNX int8) frente a Kokoro (entre paréntesis), sobre 200 frases reservadas por voz. WER y CER miden la proporcion de palabras y caracteres que Whisper large-v3 transcribe incorrectamente en el idioma de la voz. UTMOS y NISQA son redes neuronales que predicen naturalidad y limpieza en una escala aproximada de 1 a 5.

| Voz | Idioma | UTMOS | NISQA | WER | CER |
|---|---|---:|---:|---:|---:|
| `af_heart` | Inglés (americano), femenina | 4,38 (4,52) | 4,93 (5,00) | 2,7% (3,0%) | 0,8% (1,0%) |
| `bf_isabella` | Inglés (británico), femenina | 4,07 (4,41) | 5,08 (5,12) | 2,9% (2,9%) | 1,0% (0,9%) |
| `am_puck` | Inglés (americano), masculina | 4,35 (4,47) | 5,01 (5,04) | 2,8% (3,0%) | 0,9% (0,9%) |
| `bm_fable` | Inglés (británico), masculina | 4,17 (4,32) | 4,96 (5,00) | 2,7% (3,0%) | 0,9% (0,9%) |
| `hf_alpha` | Hindi, femenina | 3,99 (4,29) | 3,98 (4,37) | 21,7% (20,7%) | 6,4% (6,0%) |
| `hm_omega` | Hindi, masculina | 3,82 (4,09) | 4,57 (4,73) | 21,6% (19,8%) | 6,7% (6,1%) |
| `ff_siwis` | Francés, femenina | 3,45 (3,65) | 4,39 (4,65) | 6,8% (6,8%) | 2,2% (2,2%) |
| `em_alex` | Español, masculina | 3,14 (3,34) | 4,72 (4,98) | 5,0% (5,1%) | 1,5% (1,5%) |

Nota del autor: UTMOS y NISQA se entrenaron mayoritariamente con valoraciones en inglés, por lo que en hindi, francés y español solo son interpretables en comparacion con Kokoro. El WER en hindi es alto también para Kokoro, en parte porque muchas palabras hindi tienen más de una grafía aceptada.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo está pensado para inferencia en CPU. El archivo ONNX int8 ocupa 8,5 MB.
- GPU recomendadas: no disponibles ni necesarias; el modelo se ejecuta en CPU.
- Compatibilidad con GPU de consumo: irrelevante para el caso de uso principal, ya que no requiere GPU.
- Opciones de despliegue: ONNX Runtime (formato nativo del repositorio, libreria `onnx`); el autor publica un paquete Python y scripts en el repositorio de GitHub. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 62 veces tiempo real en un solo hilo de CPU, sin GPU (misma cifra que v1.2).

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---:|---|---|
| Paradee-8M v1.3 | 7,88 M | 4 (en, hi, fr, es) | Apache 2.0 | ONNX int8 (8,5 MB) | 62x tiempo real en 1 hilo de CPU |
| M5-TTS | 50 M | Multilingüe (no se detalla) | No disponible | No disponible | Segun el autor, el siguiente TTS único multilingüe más pequeno |
| Kokoro-82M (profesor) | 82 M | Multilingüe (incluye en, hi, fr, es) | No disponible en la informacion | No disponible | Modelo base del que se destila Paradee |

No se dispone de datos de benchmarks de M5-TTS ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El WER en hindi es elevado (21,6-21,7% en Paradee; 19,8-20,7% en Kokoro), en parte por la variabilidad ortográfica del hindi; no es adecuado para aplicaciones que exijan transcripcion exacta en ese idioma.
- Las puntuaciones UTMOS y NISQA en hindi, francés y español solo son comparables con Kokoro, ya que las redes de evaluacion se entrenaron mayoritariamente con valoraciones en inglés.
- La voz determina el idioma: no se puede cambiar de idioma dentro de una misma frase ni mezclar idiomas en una locucion.
- Solo hay ocho voces y un único género por voz en hindi, francés y español (una femenina y una masculina en hindi; una femenina en francés; una masculina en español), lo que limita la variedad de locutores.
- No se documentan sesgos especificos, pero al derivar de Kokoro y entrenarse con frases de Wikipedia, puede heredar sesgos de esos datos.
- Riesgo de alucinacion o artefactos de pronunciacion en texto fuera del dominio de entrenamiento (Wikipedia) o con fonetica atipica; no se cuantifica en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Kokoro-82M y de los datos de entrenamiento.
- El repositorio tiene un uso muy bajo (2 descargas, 1 like en el momento de la consulta), por lo que la validacion comunitaria es escasa.
- No se documentan limitaciones de longitud de contexto ni de entrada de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sahilmahendrakar/Paradee-8M-v1.3
- Versión anterior v1.2: https://huggingface.co/sahilmahendrakar/Paradee-8M-v1.2
- Modelo base Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Repositorio GitHub (código, scripts de entrenamiento y paquete Python): https://github.com/sahilmahendrakar/paradee
- Artículo (v1.0): https://huggingface.co/papers/2610.06817
