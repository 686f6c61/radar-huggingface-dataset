# ghananlpcommunity/poto-tts-kokoro-gh

## Resumen

poto-tts-kokoro-gh es un modelo de síntesis de voz (text-to-speech) desarrollado por la comunidad Ghana NLP, que adapta el modelo Kokoro v1.0 (82 millones de parámetros) al inglés hablado en Ghana. El modelo incorpora un léxico de 104.623 palabras ghanesas compilado directamente en el diccionario de espeak-ng, lo que permite pronunciar correctamente nombres propios, lugares y títulos de jefatura tradicional desde texto plano, sin necesidad de reglas fonéticas adicionales.

La relevancia de este modelo radica en su enfoque práctico: en lugar de entrenar un nuevo modelo desde cero, aprovecha la calidad y ligereza de Kokoro y la corrige únicamente en los puntos donde espeak falla al interpretar la fonética ghanesa. El resultado es una voz que mantiene el timbre original de Kokoro pero con una pronunciación precisa de términos locales. Está empaquetado en formato ONNX, compatible con el runtime sherpa-onnx, lo que permite su despliegue offline en múltiples plataformas (Android, iOS, WebAssembly, C++, Go, Rust).

El modelo se distribuye bajo licencia Apache-2.0 para los pesos de Kokoro, pero el diccionario espeak-ng-data que incluye el léxico ghanés está bajo GPL-3.0, un matiz importante para despliegues comerciales. El repositorio ocupa 0,4 GB y se usa a través de la librería poto-tts o directamente con cualquier runtime sherpa-onnx.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kokoro TTS (arquitectura ligera, 82M parametros) |
| Parametros totales | 82 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo TTS) |
| Tipos de cuantizacion | No disponible (formato ONNX sin cuantizacion declarada) |
| Idiomas soportados | Ingles (con lexico ghanes incorporado) |
| Licencia | Apache-2.0 (pesos Kokoro); GPL-3.0 (espeak-ng-data) |
| Formato de pesos | ONNX (model.onnx, voices.bin, tokens.txt) |

## Arquitectura y entrenamiento

El modelo es una conversión de Kokoro v1.0 al formato sherpa-onnx, realizada por el equipo de k2-fsa y posteriormente adaptada por Ghana NLP. Kokoro es un modelo TTS de código abierto con 82 millones de parámetros, diseñado para ser ligero y rápido sin sacrificar calidad de voz. La arquitectura concreta no se detalla en la documentación disponible, pero se describe como "arquitectura ligera" en el repositorio oficial.

La innovación principal de esta adaptación reside en el diccionario fonético. Se compilaron 104.623 entradas del proyecto ghana-english-g2p (licencia MIT) dentro del directorio espeak-ng-data, de modo que el motor espeak-ng, que Kokoro utiliza para convertir texto a fonemas, pronuncie correctamente nombres y términos ghaneses. Por ejemplo, "Kwabena" pasa de "kwˈeɪbnə" a "kwɑːbˈɪnɑː", y "Okuapenhene" de "ˈoʊkjuːˌeɪpənhˌiːn" a "okwɑːpɛnhˈɛnɛ". Las palabras inglesas comunes no se ven afectadas; el diccionario solo corrige aquellas que espeak malinterpreta.

No se dispone de información sobre el proceso de entrenamiento del modelo base (datos, número de tokens, uso de RLHF o DPO). La adaptación ghanesa no implica reentrenamiento, sino una modificación del diccionario fonético.

## Capacidades

- Sintesis de voz de alta calidad en ingles con pronunciacion correcta de nombres, lugares y titulos ghaneses.
- 53 voces diferentes (identificadores como `bf_alice`, `bm_george`, `af_heart`, etc.), todas con el mismo timbre pero con pronunciacion ghanesa.
- Funcionamiento offline completo: el modelo y el diccionario se cargan localmente, sin conexion a internet.
- Compatibilidad con cualquier runtime sherpa-onnx: Android, iOS, WebAssembly, C++, Go y Rust.
- Integracion con la libreria poto-tts, que gestiona la configuracion, el emparejamiento con espeak-ng-data y la resolucion de nombres de voz.
- Fallback automatico a las reglas de espeak para palabras fuera del lexico ghanes.
- No incluye capacidades de vision, tool calling ni agentes, al ser un modelo exclusivamente TTS.

## Casos de uso

- Atencion al cliente automatizada en ghana: el modelo puede generar respuestas de voz que pronuncien correctamente nombres de clientes, localidades y referencias culturales, mejorando la experiencia del usuario en sistemas IVR o asistentes telefonicos.
- Lectura de noticias locales: aplicaciones de noticias en ingles pueden usar este TTS para narrar articulos que mencionan politicos, ciudades y terminos tradicionales ghaneses sin errores de pronunciacion.
- Navegacion GPS y servicios de transporte: al generar indicaciones que incluyen nombres de calles, barrios y destinos como "Achimota" o "Nyankpani", el modelo evita confusiones tipicas de otros TTS.
- Educacion y aprendizaje de idiomas: herramientas para estudiantes de ingles que necesitan escuchar la pronunciacion correcta de nombres propios ghaneses en contexto.
- Accesibilidad para personas con discapacidad visual: lectores de pantalla que procesan documentos con nombres ghaneses y necesitan una pronunciacion fiable.
- Desarrollo de asistentes de voz para servicios publicos: el modelo puede integrarse en quioscos de informacion o aplicaciones gubernamentales que mencionan distritos, ministerios y cargos tradicionales.
- Contenido audiovisual y doblaje: generacion de locuciones para videos o podcasts que incluyen referencias ghanesas, manteniendo una calidad de voz natural y ligera.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos comparativos de MOS (Mean Opinion Score), latencia o throughput para este modelo especifico. La unica referencia cualitativa es la tabla de pronunciaciones incluida en la model card, que muestra la mejora frente al espeak estandar.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 82M parametros en ONNX, la inferencia puede ejecutarse en CPU con menos de 1 GB de RAM. No se requiere GPU para uso en tiempo real.
- GPU recomendadas: no es necesaria ninguna GPU. Cualquier procesador moderno puede ejecutar el modelo en tiempo real.
- Compatibilidad con hardware consumer: si, funciona en Raspberry Pi, telefonos moviles y ordenadores de gama baja.
- Opciones de despliegue: sherpa-onnx (nativo), poto-tts (Python), o cualquier runtime compatible con ONNX. Tambien se puede compilar a WebAssembly para navegadores.
- Latencia y throughput: no se proporcionan datos oficiales. Dado el tamano del modelo, se espera una latencia inferior a 100 ms por frase en CPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Licencia | Idiomas | Formato | Pronunciacion ghanesa |
|---|---|---|---|---|---|
| poto-tts-kokoro-gh (este) | 82M | Apache-2.0 + GPL-3.0 (espeak-data) | Ingles (con lexico ghanes) | ONNX | Si, incorporada |
| hexgrad/Kokoro-82M | 82M | Apache-2.0 | Multiples (segun version) | PyTorch / ONNX | No |
| Piper TTS (backend de poto-tts) | Variable (20M-100M) | No comercial (para voces ghanesas) | Multiples | ONNX | Si, pero con voz de acento ghanes |

El modelo se diferencia del Kokoro original por su diccionario ghanes. Frente al backend Piper de poto-tts, que ofrece voces con acento ghanes real pero con licencia no comercial, este modelo mantiene el timbre britanico de Kokoro y solo ajusta la pronunciacion, con licencia Apache-2.0 para los pesos. La eleccion entre ambos depende de si se prioriza el acento (Piper) o la licencia permisiva (Kokoro).

## Limitaciones y advertencias

- El acento de las voces no es ghanes: el modelo solo corrige la pronunciacion de palabras concretas, pero el timbre y la entonacion siguen siendo los de los hablantes britanicos de Kokoro. Para un acento genuinamente ghanes, es necesario usar el backend Piper de poto-tts, que tiene licencia no comercial.
- Licencia GPL-3.0 del diccionario: el directorio `espeak-ng-data` incluido en este repositorio esta bajo GPL-3.0, lo que puede imponer obligaciones de copyleft si se distribuye junto con el modelo. Los pesos de Kokoro son Apache-2.0, pero la combinacion completa debe revisarse legalmente.
- Riesgo de alucinacion fonetica: para palabras fuera del lexico de 104.623 entradas, el modelo recurre a las reglas de espeak, que pueden producir pronunciaciones incorrectas, especialmente con nombres poco comunes.
- Sin soporte para otros idiomas: el modelo solo maneja ingles. No funciona con lenguas ghanesas como twi, ewe o ga.
- Sin cuantizacion declarada: el modelo se distribuye en ONNX sin pesos cuantizados, lo que puede aumentar el uso de memoria en comparacion con versiones cuantizadas de otros TTS.
- No hay garantia de calidad en entornos de produccion: al no existir benchmarks publicos, el rendimiento subjetivo puede variar segun el caso de uso.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ghananlpcommunity/poto-tts-kokoro-gh
- Libreria poto-tts (GitHub): https://github.com/GhanaNLP/poto-tts
- Proyecto ghana-english-g2p: https://github.com/GhanaNLP/ghana-english-g2p
- Kokoro original (hexgrad/Kokoro-82M): https://huggingface.co/hexgrad/Kokoro-82M
- Repositorio Kokoro (GitHub): https://github.com/hexgrad/kokoro
- Documentacion de sherpa-onnx: https://k2-fsa.github.io/sherpa/onnx/
- Conversiones de k2-fsa para TTS: https://github.com/k2-fsa/sherpa-onnx/releases/tag/tts-models
