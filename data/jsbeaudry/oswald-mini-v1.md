# jsbeaudry/Oswald-mini-V1

## Resumen

Oswald-mini-V1 es un modelo de reconocimiento automático del habla (ASR) especializado en criollo haitiano (kreyòl), desarrollado por el usuario jsbeaudry a partir del modelo base Cactus-Compute/whistle. Se distribuye como un artefacto de 29 MB en cuantización de 4 bits con formato `.cact`, pensado para ejecutarse en el motor cactus-needle tanto en Python y Node como en navegador mediante WebAssembly y en teléfonos. El modelo está afinado con LoRA sobre las capas de atención e incorpora nuevas filas de vocabulario para el código de idioma `ht`.

Su relevancia radica en el despliegue en el borde (edge): ofrece transcripción de voz a texto en criollo haitiano con un tamaño muy reducido y una velocidad de aproximadamente 170 veces el tiempo real sobre CPU (RTF 0.0059 en un Apple M3 Pro), lo que lo hace viable en dispositivos sin GPU. El compromiso es claro: este build solo reconoce kreyòl, y las capacidades multilingües del modelo base (inglés, francés y español) se han perdido deliberadamente durante el ajuste.

El modelo se presenta como el hermano pequeño de la familia Oswald de reconocedores; frente a Oswald-ASR-0.6-V2 (0,6 mil millones de parámetros y una descarga Q8 unas 24 veces mayor), este build comete aproximadamente el doble de errores de palabra, pero con una huella de memoria mínima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Cactus-Compute/whistle; ajuste LoRA sobre atención) |
| Parametros totales | no disponible (el modelo base se describe como "Whistle"; el artefacto pesa 29 MB en 4 bits) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible; clips de audio de hasta 30 s |
| Tipos de cuantizacion | 4 bits (formato `.cact`); se incluye `adapter.safetensors` para reconstruir |
| Idiomas soportados | criollo haitiano (`ht`) únicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | `.cact` (motor cactus-needle) y `adapter.safetensors` (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo parte de Cactus-Compute/whistle y se afina mediante LoRA de rango 64 (alpha 128) aplicado a las capas de atención, añadiendo además nuevas filas de vocabulario para el idioma `ht`. El ajuste se realizó con la herramienta `needle whistle finetune` durante 5 épocas (4.495 pasos), con una tasa de aprendizaje de 1e-2, calentamiento (warm-up) y decaimiento coseno. Posteriormente, `needle whistle build --lora adapter.safetensors` generó el artefacto de 4 bits en formato `.cact`.

El corpus de entrenamiento consta de 133 horas de habla humana en kreyòl: 25 h de grabaciones telefónicas pagadas a colaboradores de Datamio, 42 h de radio, 36 h de lecturas de la Biblia, 10 h de frases CMU, 13 h de conjuntos de estudio (salud, social, legal, números, historia, finanzas y comercio electrónico) y 6 h de YouTube. El desglose está documentado en `data_hours.json` y los clips de test se mantuvieron fuera del entrenamiento. El autor señala que probó un build mixto que conservaba inglés, francés y español, con un WER en kreyòl equivalente (13,6 %), pero no lo publicó.

## Capacidades

- Transcripción de voz a texto en criollo haitiano (`ht`) para audio mono a 16 kHz.
- Salida normalizada: minúsculas, sin puntuación y con dígitos escritos en cifras (por ejemplo, `125 goud`).
- Procesamiento de clips de hasta 30 segundos de duración.
- Ejecución en el borde: Python, Node, navegador vía WebAssembly y teléfonos mediante el motor cactus-needle.
- Inferencia en CPU sin GPU, con un factor de tiempo real muy bajo.
- No soporta otros idiomas: inglés, francés y español quedan fuera de este build.
- No se documentan capacidades de tool calling, agentes, visión, audio generativo ni modo de razonamiento; es un modelo puramente ASR.

## Casos de uso

- Subtitulado y transcripción de contenido en criollo haitiano en el navegador: el modelo se carga como WebAssembly y transcribe audio localmente sin enviar datos a un servidor, lo que resulta adecuado para privacidad y para usuarios con conectividad limitada.
- Aplicaciones móviles de dictado y notas de voz en kreyòl: con 29 MB en 4 bits y ejecución en CPU, cabe en teléfonos de gama media y permite transcripción en tiempo real de clips cortos.
- Digitalización de archivos de radio y emisiones en criollo: el modelo procesa audio a unas 170 veces el tiempo real en un Apple M3 Pro, lo que permite transcribir horas de emisión en minutos.
- Atención al cliente y centros de llamadas en Haití: la transcripción de grabaciones telefónicas (12,8 % WER en el conjunto Datamio) facilita la generación de actas, la búsqueda en conversaciones y el análisis de calidad.
- Accesibilidad para personas con discapacidad auditiva: la transcripción local en el dispositivo permite mostrar texto en tiempo real en aplicaciones de mensajería o videollamada sin depender de la nube.
- Investigación lingüística y creación de corpus: el modelo sirve para anotar y transcribir grabaciones de campo en kreyòl, con la ventaja de ejecutarse en portátiles sin GPU.
- Sistemas de respuesta por voz en el borde: integrado en asistentes embebidos, permite convertir la consulta hablada en texto antes de un procesamiento posterior, con latencia de decenas de milisegundos por clip.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 1.882 clips retenidos (1.700 con transcripción humana), con normalización de minúsculas, sin puntuación, dígitos en cifras y acentos eliminados. WER / CER en porcentaje.

| Tipo de grabacion | Clips | Oswald-mini-V1 | Oswald V3 (0,6 B, no publicado) | Oswald-ASR-0.6-V2 |
|---|---:|---:|---:|---:|
| Todos los clips con transcripción humana | 1.700 | 13,8 / 5,3 | 7,2 / 2,5 | 7,6 / 2,7 |
| Grabaciones telefónicas (Datamio) | 825 | 12,8 / 4,7 | 3,2 / 1,0 | 4,9 / 1,6 |
| Biblia, leída | 150 | 8,7 / 2,7 | 4,7 / 1,7 | 4,4 / 1,6 |
| Frases CMU, leídas | 150 | 9,0 / 2,8 | 6,4 / 2,0 | 7,2 / 2,4 |
| Estudio: números | 85 | 10,0 / 3,1 | 4,2 / 1,2 | 4,8 / 1,6 |
| Estudio: salud | 116 | 12,2 / 4,5 | 6,3 / 2,2 | 5,7 / 2,2 |
| Estudio: finanzas | 63 | 6,6 / 1,4 | 4,7 / 1,0 | 4,5 / 1,0 |
| Estudio: legal | 46 | 6,5 / 1,8 | 3,4 / 1,0 | 3,6 / 1,0 |
| Estudio: social | 93 | 12,0 / 4,9 | 5,8 / 1,7 | 6,9 / 2,2 |
| Estudio: historia | 52 | 23,3 / 7,4 | 20,5 / 6,1 | 16,5 / 5,1 |
| Radio (transcripciones automáticas: concordancia, no precisión) | 150 | 18,4 / 6,9 | 11,0 / 3,8 | 12,0 / 4,1 |
| YouTube | 120 | 32,9 / 15,7 | 28,2 / 11,8 | 24,8 / 10,9 |

En la prueba de números escuchados completos (327 fragmentos), el modelo acierta el 84 %, frente al 94 % de Oswald V3. El modelo base sin ajustar obtiene un 99,6 % de WER en estos clips, lo que confirma que no tiene conocimiento de kreyòl.

En cuanto a velocidad, el conjunto completo se procesa con RTF 0,0059 en CPU de un Apple M3 Pro, clip a clip (unas 170 veces el tiempo real); un clip de 9 segundos tarda aproximadamente 60 ms en Python.

## Requisitos de hardware

- VRAM estimada: no aplica en el caso habitual, ya que el modelo está pensado para CPU; el artefacto de 4 bits ocupa 29 MB, por lo que la memoria necesaria en inferencia es muy reducida (no se publica una cifra exacta).
- GPU recomendadas: no se especifican; el modelo está diseñado para ejecutarse sin GPU.
- Compatibilidad con GPU de consumo: irrelevante para el diseño, pero por tamaño cabría en cualquier GPU de consumo; el motor cactus-needle prioriza CPU y WebAssembly.
- Opciones de despliegue: motor cactus-needle en Python (`needle.Whistle`), Node y navegador (`cactus-needle/browser` con WebAssembly); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF 0,0059 en CPU Apple M3 Pro (unas 170 veces el tiempo real); aproximadamente 60 ms para un clip de 9 segundos en Python.
- Nota de integración: el worker de navegador de cactus-needle 0.3.0 solo acepta los siete idiomas base; para usar `ht` hay que añadir `` `ht` `` a la lista de idiomas en `dist/browser/worker.js` o servir una copia parcheada mediante `workerUrl`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | WER global (conjunto Oswald V3) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Oswald-mini-V1 | no disponible (29 MB en 4 bits) | clips de hasta 30 s | 13,8 / 5,3 | Apache 2.0 | público en HuggingFace |
| Oswald-ASR-0.6-V2 | 0,6 B | no disponible | 7,6 / 2,7 | no disponible en la información | público en HuggingFace |
| Oswald V3 | 0,6 B | no disponible | 7,2 / 2,5 | no disponible en la información | no publicado |
| Cactus-Compute/whistle (base sin ajustar) | no disponible | no disponible | 99,6 % WER en kreyòl | no disponible en la información | público en HuggingFace |

## Limitaciones y advertencias

- El modelo solo reconoce criollo haitiano; el inglés, el francés y el español del modelo base se degradaron de un WER del 9-19 % a más del 95 %.
- El WER global (13,8 %) es aproximadamente el doble que el de Oswald-ASR-0.6-V2 (7,6 %), por lo que no es adecuado para transcripción de alta precisión cuando se dispone de más recursos.
- Rendimiento especialmente flojo en audio de YouTube (32,9 % WER) e historia (23,3 % WER), lo que sugiere dificultades con vocabulario especializado y audio no controlado.
- La salida es siempre en minúsculas, sin puntuación y con dígitos en cifras; no se debe esperar texto con formato natural.
- Límite de 30 segundos por clip; no se documenta manejo de audio más largo ni segmentación automática.
- El worker de navegador de cactus-needle 0.3.0 no admite `ht` de serie, lo que requiere un parche manual para su uso web.
- No se han publicado datos sobre sesgos, alucinaciones o comportamiento en dominios no cubiertos por el corpus de entrenamiento.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base Cactus-Compute/whistle y de los datos de entrenamiento (Datamio, radio, YouTube).
- El modelo base sin ajustar obtiene un 99,6 % de WER en kreyòl, de modo que cualquier uso sin el adaptador LoRA carece de utilidad para este idioma.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jsbeaudry/Oswald-mini-V1
- Modelo base Cactus-Compute/whistle: https://huggingface.co/Cactus-Compute/whistle
- Modelo hermano Oswald-ASR-0.6-V2: https://huggingface.co/jsbeaudry/Oswald-ASR-0.6-V2
- Paquete npm cactus-needle: https://www.npmjs.com/package/cactus-needle
