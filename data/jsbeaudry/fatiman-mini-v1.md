# jsbeaudry/Fatiman-mini-V1

## Resumen

Fatiman-mini-V1 es un modelo de síntesis de voz (text-to-speech) especializado en criollo haitiano (kreyòl), desarrollado por jsbeaudry a partir de gradium/phonon-31m-en, un modelo de lenguaje de flujo de 31 millones de parámetros. El modelo ha sido reentrenado para kreyòl y utiliza el códec Mimi de Pocket TTS (Kyutai) en lugar del códec original de Gradium. Con 41 millones de parámetros reales en sus pesos safetensors, está diseñado para ejecutarse en dispositivos móviles y navegadores mediante el runtime `ptts` (Rust CLI, Python, Android, iOS y WebAssembly).

El modelo resuelve el problema de la falta de sistemas TTS de calidad para criollo haitiano, un idioma con recursos limitados. Su compilación cuantizada q8 ocupa 65 MB y alcanza velocidades de aproximadamente 20 veces el tiempo real en CPU de portátil y de 10 a 15 veces en navegador. Es el hermano pequeño de Fatiman-TTS-v2: fue entrenado por destilación desde este último, es más inteligible y más fiel al hablante, aunque menos natural.

La relevancia actual radica en su enfoque en la eficiencia: un modelo de 41 millones de parámetros que ofrece síntesis de voz en tiempo real en hardware de consumo, con 11 voces preentrenadas y una licencia permisiva CC-BY-4.0. No soporta clonación de voz desde audio; las voces son embeddings aprendidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje de flujo (flow LM) de 6 capas × 512 dimensiones, con códec Mimi de Pocket TTS |
| Parametros totales | 41.096.035 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f32 (safetensors) y q8 (GGUF) |
| Idiomas soportados | Criollo haitiano (ht) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (f32), GGUF (q8) |

## Arquitectura y entrenamiento

El modelo se basa en gradium/phonon-31m-en, un modelo de lenguaje de flujo de 31 millones de parámetros con 6 capas y dimensión 512, al que se le sustituyó el códec de audio original por el códec Mimi de Pocket TTS (Kyutai). Los pesos publicados son el promedio de las instantáneas EMA en los pasos 44k, 46k, 52k, 54k, 56k y 60k, lo que iguala la mejor instantánea individual en puntuación con la tasa de error más baja.

El entrenamiento se realizó durante 60.000 pasos en dos A100 (5,1 horas). Los datos consisten en 44 horas de kreyòl humano de 89 hablantes (lecturas de la Biblia, sets de estudio, lecturas telefónicas pagadas de colaboradores de Datamio), más 135 horas de tomas limpias leídas por Fatiman-TTS-v2 en 16 voces consentidas a partir de 330.000 líneas filtradas en kreyòl, conservando cada toma solo cuando Oswald la transcribió con CER ≤ 3 %. Todas las frases de evaluación se mantuvieron fuera del entrenamiento. El modelo utiliza decodificación en un solo paso de flujo (1 step) con temperatura 0,3 como configuración de producción.

## Capacidades

- Síntesis de voz (text-to-speech) en criollo haitiano con 11 voces preentrenadas.
- Generación de audio en tiempo real: 22,5× tiempo real en CPU Apple M3 Pro con q8; 13,6× en Chrome mediante WebAssembly con hilos.
- Ejecución en dispositivos móviles y navegador gracias al runtime `ptts` (Rust CLI, Python, Android, iOS, WebAssembly).
- Normalización de texto específica para kreyòl (`kreyol_text.py`): convierte números, precios, fechas y símbolos a palabras.
- Voces aprendidas como embeddings; no soporta clonación de voz desde audio.
- No soporta tool calling, function calling ni razonamiento multi-paso; es un modelo puramente TTS.
- Capacidad multilingüe limitada exclusivamente al criollo haitiano.

## Casos de uso

- Asistentes de voz en criollo haitiano para aplicaciones móviles: el modelo puede integrarse en apps Android o iOS mediante `ptts` para leer respuestas de un asistente conversacional, gracias a su tamaño de 65 MB en q8 y su velocidad de 10-15× tiempo real en navegador.
- Lectura de noticias y contenido web en kreyòl: con la función `normalize` que convierte números y fechas a palabras, el modelo puede narrar artículos periodísticos o blogs en criollo haitiano de forma inteligible (CER del 2,87 % en el voice lab).
- Accesibilidad para personas con discapacidad visual: el modelo puede leer en voz alta textos en criollo haitiano en navegadores mediante WebAssembly, sin necesidad de infraestructura de servidor.
- Sistemas de megafonía y anuncios automatizados: para aeropuertos, estaciones o comercios en Haití, el modelo puede generar anuncios pregrabados con voces consistentes y velocidad de síntesis en CPU de portátil (20× tiempo real).
- Educación y aprendizaje de idiomas: el modelo puede generar pronunciaciones de frases en kreyòl para aplicaciones de aprendizaje, con 11 voces distintas (6 voces reales y 4 sintéticas) para variedad.
- Atención al cliente telefónica automatizada: con su baja latencia en CPU y su capacidad de ejecutarse en dispositivos, el modelo puede gestionar respuestas de voz en sistemas IVR locales sin depender de la nube.
- Lectura de documentos y formularios: la normalización de números, precios y fechas permite leer facturas o documentos administrativos en criollo haitiano de forma comprensible.

## Benchmarks y rendimiento

Resultados del voice lab (12 frases de estilo asistente, 5 hablantes de estudio, 60 tomas cada uno; CER por Oswald V3; naturalidad = UTMOS; similitud = similitud de hablante):

| Modelo | Score | UTMOS | Similitud | CER % | Cortadas |
|---|---:|---:|---:|---:|---:|
| Fatiman-TTS-v2 (t 0.3, 4 steps) | 0.761 | 3.11 | 0.805 | 5.16 | 0/60 |
| Fatiman V3 (t 0.3, 4 steps; no publicado) | 0.752 | 3.21 | 0.797 | 9.34 | 3/60 |
| Fatiman-mini-V1 (t 0.3, 1 step, q8) | 0.728 | 2.59 | 0.817 | 2.87 | 0/60 |

Evaluación amplia: 252 frases retenidas × 7 voces = 1.757 tomas a temperatura 0,3 (CER por Oswald V1): score 0.752, CER 2,99 %, UTMOS 2,90, similitud 0,809, ninguna cortada ni ejecutada de más. CER por conjunto: dev 1,49 %, sweep 2,94 %, CMU-80 1,88 %, Klara-120 (números de teléfono, precios, fechas) 4,22 %.

Velocidad (Apple M3 Pro): q8 22,5× tiempo real en CPU mediante `ptts`; 13,6× en Chrome mediante `phonon-tts` (WebAssembly, hilos activados). CER de q8 es 3,12 % frente a 2,81 % de f32 en las 60 tomas del voice lab.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido tradicional; el modelo q8 ocupa 65 MB en disco y se ejecuta en CPU.
- GPU recomendadas: no requiere GPU; funciona en CPU de portátil (Apple M3 Pro como referencia) y en navegador.
- Cabe en cualquier GPU de consumo y en dispositivos móviles; no necesita GPU dedicada.
- Opciones de despliegue: runtime `ptts` (Rust CLI, Python, Android, iOS), `phonon-tts` para navegador (WebAssembly), y descarga directa desde Hugging Face con `huggingface_hub`.
- Latencia y throughput: 22,5× tiempo real en CPU Apple M3 Pro con q8; 13,6× en Chrome con WebAssembly e hilos activados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Fatiman-mini-V1 | 41 M | No disponible | ht | CC-BY-4.0 | safetensors, GGUF | TTS para kreyòl, on-device |
| Fatiman-TTS-v2 | No disponible | No disponible | ht | No disponible | No disponible | Hermano mayor, más natural (UTMOS 3.11 vs 2.59), menos inteligible (CER 5.16 % vs 2.87 %) |
| phonon-31m-en (base) | 31 M | No disponible | en | Apache 2.0 | No disponible | Modelo base en inglés, sin códec Mimi |
| Pocket TTS (Kyutai) | No disponible | No disponible | No disponible | CC-BY-4.0 | No disponible | Códec Mimi utilizado por Fatiman-mini-V1 |

## Limitaciones y advertencias

- El modelo solo soporta criollo haitiano; no es multilingüe.
- No puede clonar voces desde audio; las voces son embeddings aprendidos y limitados a las 11 disponibles.
- La naturalidad es su principal debilidad (UTMOS 2.59 frente a 3.11 de Fatiman-TTS-v2); el resto de métricas son competitivas.
- El texto debe pasar siempre por `normalize` y usar `lang="none"`; el modelo fue entrenado con palabras, no con dígitos, y el normalizador en Rust no tiene reglas para kreyòl.
- Riesgo de alucinación en la pronunciación de palabras fuera del vocabulario o de nombres propios; el CER en el conjunto Klara-120 (números de teléfono, precios, fechas) sube al 4,22 %.
- Licencia CC-BY-4.0 permite uso comercial con atribución; se debe acreditar "Pocket TTS by Kyutai" y el modelo base de Gradium (Apache 2.0).
- Las voces se publican con consentimiento de sus hablantes; nunca deben usarse para engañar.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la ficha; es un proyecto reciente y sin validación comunitaria amplia.

## Enlaces

- [Hugging Face: jsbeaudry/Fatiman-mini-V1](https://huggingface.co/jsbeaudry/Fatiman-mini-V1)
- [Modelo base: gradium/phonon-31m-en](https://huggingface.co/gradium/phonon-31m-en)
- [Pocket TTS de Kyutai](https://huggingface.co/kyutai/pocket-tts)
- [Paquete npm phonon-tts](https://www.npmjs.com/package/phonon-tts)
- [Fatiman-TTS-v2](https://huggingface.co/jsbeaudry/Fatiman-TTS-v2)
