# machinekind/Matcha-TTS-PL-v2

## Resumen

Matcha-TTS-PL-v2 es un modelo de síntesis de voz (text-to-speech) en polaco desarrollado por el usuario machinekind, publicado bajo licencia cc-by-sa-4.0. Se trata de la segunda version de Matcha-TTS-PL y consiste en una destilacion de VoxCPM2, un sistema TTS autorregresivo de 2 000 millones de parametros, sobre una unica voz sintetica denominada fav2. El modelo acustico emplea 20,9 millones de parametros y una arquitectura Matcha-TTS no autorregresiva basada en flow-matching, acoplada a un vocoder HiFi-GAN, lo que le permite funcionar en tiempo real en una GPU pequena o incluso en un navegador.

Su relevancia reside en tres aspectos concretos: primero, ofrece una voz unica disenada a partir de una descripcion textual con VoxCPM2 (OpenBMB, Apache-2.0), congelada como cache de prompt y no clonada de una persona real (similitud con el lector de referencia mas cercano de 0,83); segundo, cubre polaco moderno orientado a un asistente humanoide con 13,1 horas de habla de entrenamiento repartidas en 18 dominios cotidianos; y tercero, resuelve el code-switching polaco-ingles detectando automaticamente palabras inglesas dentro de frases polacas y fonemizandolas con espeak-ng en-us, sin necesidad de diccionario de pronunciacion.

El modelo se distribuye principalmente en formato ONNX (grafos de 4 y 2 pasos ODE) junto a un checkpoint de PyTorch y los pesos del vocoder. La salida de audio es de 22,05 kHz y el tempo por defecto es 0,8 (parametro `length_scale`). La model card reporta un WER de 1,3 % y un UTMOS de 3,40 en 12 frases de validacion, valores cercanos al docente de 2 000 millones de parametros (UTMOS 3,68).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matcha-TTS no autorregresiva con flow-matching (pasos ODE configurables) + vocoder HiFi-GAN v1 |
| Parametros totales | 20,9 M (modelo acustico); modelo docente VoxCPM2 de 2 000 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; procesa pasajes de 10-25 s (dos tercios del entrenamiento) |
| Tipos de cuantizacion | no disponible (se distribuyen grafos ONNX sin cuantizacion especificada) |
| Idiomas soportados | polaco (pl); palabras inglesas incrustadas en frases polacas (code-switching) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | ONNX (`onnx/matcha_pl_t4.onnx`, `onnx/matcha_pl_t2.onnx`), checkpoint PyTorch (`model/matcha_pl_v2.ckpt`), vocoder HiFi-GAN (`vocoder/generator_fav2`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Matcha-TTS, un esquema no autorregresivo de flow-matching que genera espectrogramas mel a partir de embeddings de fonemas mediante un numero reducido de pasos ODE (se publican grafos de 4 y 2 pasos). El modelo acustico tiene 20,9 millones de parametros y se complementa con un vocoder HiFi-GAN de arquitectura universal v1 afinado especificamente sobre la voz fav2. La entrada son identificadores de fonemas (`x`), longitudes (`x_lengths`), dos escalas de control —temperatura y `length_scale` (tempo)— y un embedding de hablante de 64 dimensiones (`spk_emb`); la salida es onda de audio a 22,05 kHz.

El entrenamiento parte de Matcha-TTS-PL v1 como modelo objetivo y una fila de hablante nueva inicializada desde el lector real mas cercano. El conjunto de datos consta de 6 493 clips y 13,1 horas generadas por VoxCPM2 con la voz congelada fav2 (anclaje y continuacion, 10 pasos de difusion); cada clip fue filtrado con Whisper (coincidencia de texto), UTMOS >= 3,2 y similitud de hablante >= 0,80, con hasta tres tomas por frase. Las fuentes de texto (NKJP, Wikinews, KPWr, ParlaMint, OpenAssistant, Wikibooks, Wikivoyage y transcripciones de YouTube revisadas) fueron revisadas y completadas por Claude. El fine-tune de Matcha se hizo en 10 000 pasos, batch 64, learning rate 5e-5, bf16, sobre una RTX 6000 Ada (aproximadamente 1,5 horas); la calidad se estabilizo a partir de los 5 000 pasos. El vocoder se entreno durante 30 000 pasos con learning rate 2e-5 usando los mels teacher-forced del checkpoint de 10 k emparejados con el audio de VoxCPM2.

## Capacidades

- Sintesis de voz en polaco moderno orientada a un asistente humanoide, con cobertura de 18 dominios cotidianos.
- Deteccion automatica de palabras inglesas dentro de frases polacas y su fonemizacion con espeak-ng en-us; el resto de la frase se fonemiza con espeak-ng pl.
- Soporte de code-switching sin diccionario de pronunciacion para prestamos y marcas comunes (por ejemplo, "Po meetingu wysle ci feedback na maila").
- Planificacion de prosodia a lo largo de varias frases, gracias a que dos tercios de los datos de entrenamiento son pasajes de 10 a 25 s.
- Vocoder HiFi-GAN afinado sobre la voz fav2 con audio real del docente como ground truth.
- Control de la generacion mediante los parametros temperatura y `length_scale` (tempo), con valor por defecto de 0,8.
- Estilos: 18 embeddings de estilo disponibles (el estilo 7 corresponde al neutro).
- Salida de audio a 22,05 kHz directamente desde los grafos ONNX.
- Ejecucion en navegador mediante el space oficial (portado a JS/WASM, con fonemas que reproducen el entrenamiento caracter a caracter en 300 frases de prueba).
- No dispone de tool calling, function calling, agentes ni capacidades de vision o audio de entrada; es exclusivamente un modelo de texto a voz.

## Casos de uso

- Asistente de voz en polaco para aplicaciones de atencion al cliente: el modelo puede generar respuestas habladas multi-frase con prosodia planificada entre frases, adecuado para flujos conversacionales donde se encadenan varias oraciones.
- Interfaces de robot humanoide o kiosco interactivo: la voz fav2 esta disenada como voz de asistente humanoide y el modelo funciona en tiempo real en una GPU pequena, lo que permite integrarlo en hardware embebido.
- Lectura de contenido tecnologico con terminologia inglesa: al detectar y fonemizar palabras inglesas dentro del polaco, resulta adecuado para articulos, documentacion o noticias donde aparecen prestamos como "meeting", "feedback" o nombres de marcas.
- Audiolibros y narracion de textos polacos largos: la planificacion de prosodia en pasajes de 10 a 25 s permite mantener coherencia entonativa en parrafos extensos (WER de 1,3 % en validacion).
- Sistemas de accesibilidad (lectores de pantalla) en entornos web: la disponibilidad de ONNX permite ejecucion en navegador mediante WASM sin depender de servicios en la nube.
- Prototipado rapido de productos de voz en polaco: el bajo coste computacional (20,9 M de parametros, menos de 1 GB estimado con el vocoder) facilita iterar en portatiles o Mac sin GPU dedicada.
- Generacion de avisos y notificaciones habladas de una sola voz consistente: al estar congelada la voz fav2 como cache de prompt, todas las locuciones mantienen la misma identidad vocal, util para asistentes de marca.
- Integracion en pipelines de sintesis por lotes: el formato ONNX facilita ejecutar la inferencia con ONNX Runtime en servidor (CPU o GPU) para producir audio de forma reproducible.

## Benchmarks y rendimiento

Resultados publicados por el autor en 12 frases de validacion, ejecucion en CPU de Mac, 4 pasos ODE y temperatura 0,8:

| Sistema | UTMOS (mayor mejor) | WER de Whisper (menor mejor) | Similitud con fav2 (mayor mejor) |
|---|---|---|---|
| Docente VoxCPM2 (2 000 M, autorregresivo) | 3,68 | 1,3 % | 0,883 |
| v2 (este modelo + su vocoder) | 3,40 | 1,3 % | 0,850 |
| v1 con la ranura de la nueva voz, antes del fine-tune | 2,91 | 2,7 % | 0,725 |

Notas del autor: el WER de Whisper cuenta tambien su propia ortografia; los dos "errores" del docente corresponden a "krutki" por *krótki* y "HWSR" por el nombre del robot. En cuanto a la velocidad de habla, el tempo por defecto publicado es 0,8 (`length_scale`); a 1,0, la version v2 habla aproximadamente un 19 % mas despacio que el docente.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo acustico tiene 20,9 M de parametros; solo los pesos en fp32 ocupan en torno a 84 MB y, sumados al vocoder HiFi-GAN, el conjunto queda por debajo de 1 GB (estimacion a partir del recuento de parametros; no se publica una cifra exacta de VRAM).
- GPU recomendadas: el autor uso una RTX 6000 Ada para el fine-tune; para inferencia la model card indica que funciona en tiempo real en una GPU pequena. No se especifican modelos concretos de GPU para produccion.
- GPU de consumo: si, cabe en GPU de consumo e incluso en CPU y en navegador (el propio autor lo ejecuta en CPU de Mac y ofrece un space en navegador).
- Opciones de despliegue: ONNX Runtime en Python (grafos `matcha_pl_t4.onnx` o `matcha_pl_t2.onnx`), port a JavaScript/WASM en navegador mediante el space oficial, y checkpoint de PyTorch (`model/matcha_pl_v2.ckpt`).
- Latencia y throughput: la model card indica ejecucion en tiempo real y permite elegir entre 2 o 4 pasos ODE (menos pasos implican menor coste). No se publican cifras concretas de latencia (ms) ni de throughput (caracteres o segundos de audio por segundo de computo).

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Idiomas | Rendimiento (UTMOS / WER) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Matcha-TTS-PL-v2 (este) | 20,9 M | Flow-matching no autorregresivo + HiFi-GAN | Polaco con code-switching a ingles | 3,40 / 1,3 % | cc-by-sa-4.0 | HuggingFace + space en navegador |
| VoxCPM2 (docente) | 2 000 M | TTS autorregresivo | Polaco (voz generada) | 3,68 / 1,3 % | Apache-2.0 (segun la model card) | Referenciado como modelo de OpenBMB; enlace directo no disponible |
| Matcha-TTS-PL v1 | 20,9 M | Flow-matching no autorregresivo + HiFi-GAN | Polaco | 2,91 / 2,7 % (con la nueva voz, antes del fine-tune) | cc-by-sa-4.0 | HuggingFace (`machinekind/Matcha-TTS-PL`) |

Otros modelos TTS comparables de la misma categoria (sistemas ligeros no autorregresivos en polaco): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Una sola voz: el modelo solo dispone de la voz fav2, por lo que no sirve para escenarios que requieran multiples hablantes.
- El ritmo es mas regular que el del docente VoxCPM2, segun reconoce el propio autor en la seccion de limitaciones de la model card.
- La voz fav2 no es un clon de una persona real: se diseno a partir de una descripcion textual; la similitud con el lector de referencia mas cercano es de 0,83.
- Riesgo de alucinacion o errores de pronunciacion en textos fuera del dominio de entrenamiento (asistente humanoide y corpus de noticias, enciclopedias y transcripciones de YouTube); el WER de validacion es de 1,3 %, pero sobre un conjunto muy reducido de 12 frases.
- Cobertura limitada al polaco como idioma principal y al ingles solo como codigo incrustado dentro de frases polacas; no se documenta soporte de otros idiomas ni de frases completamente en ingles.
- La licencia cc-by-sa-4.0 impone compartir bajo la misma licencia las obras derivadas y exige atribucion; conviene revisar las implicaciones para uso comercial y para productos que incorporen el modelo en un servicio cerrado.
- La model card indica que el vocoder v1 estaba ajustado para lectores de audiolibros y difuminaba esta voz, lo que motivo el reentrenamiento; cambios de voz o de estilo fuera de los 18 estilos disponibles pueden degradar la calidad.
- El tempo por defecto es 0,8; usar `length_scale` a 1,0 produce habla un 19 % mas lenta que el docente, un detalle relevante para pipelines que esperen una velocidad natural.
- Los datos de entrenamiento incluyen fuentes diversas (NKJP, Wikinews, KPWr, ParlaMint, OpenAssistant, Wikibooks, Wikivoyage, YouTube) y textos completados por Claude, lo que puede introducir sesgos linguisticos o estilisticos de dichas fuentes.
- No hay resultados de benchmarks en tareas estandar tipo MMLU, HumanEval o GSM8K porque no es un modelo de lenguaje, sino un sistema text-to-speech.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/machinekind/Matcha-TTS-PL-v2
- Modelo base (v1): https://huggingface.co/machinekind/Matcha-TTS-PL
- Demo en navegador (space oficial): https://huggingface.co/spaces/machinekind/matcha-tts-pl-v2
- VoxCPM2 (docente, OpenBMB, Apache-2.0): mencionado en la model card; enlace directo no disponible
- Archivo de atribucion de datos de entrenamiento: `ATTRIBUTION.md` dentro del repositorio del modelo
- Paper o publicacion tecnica asociada: no disponible
- Repositorio de codigo independiente: no disponible
