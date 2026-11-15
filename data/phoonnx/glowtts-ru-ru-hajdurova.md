# Phoonnx/glowtts-ru-ru-hajdurova

## Resumen

`glowtts-ru-ru-hajdurova` es un modelo de sintesis de voz (text-to-speech) en ruso, publicado por el usuario Phoonnx en Hugging Face. Se trata de una extraccion de una carpeta concreta (`ru-ru-hajdurova`) del repositorio agregado `Phoonnx/phoonnx-glowtts`, que empaqueta varias voces del sistema Larynx en formato ONNX para su uso con la libreria `phoonnx`. El modelo corresponde a la voz "hajdurova" del proyecto Larynx, un conjunto de voces TTS de codigo abierto desarrollado originalmente en el ecosistema Mycroft.

La relevancia de esta ficha es limitada: el repositorio tiene 0 descargas y 0 likes, un tamano de 0.1 GB y una model card minima que no documenta arquitectura, datos de entrenamiento ni resultados. La informacion disponible se reduce a metadatos de Hugging Face y a la referencia al repositorio de origen. Por tanto, la mayor parte de los campos tecnicos se marcan como "no disponible" y las secciones de capacidades, benchmarks y hardware se construyen a partir de lo que se puede inferir de la familia GlowTTS y del formato ONNX, sin atribuir datos no verificados al modelo.

La ficha se dirige a desarrolladores que evalúen rapidamente si esta voz encaja en un pipeline TTS en ruso. La conclusion practica es que se trata de un artefacto de empaquetado para inferencia ONNX, no de un modelo con documentacion tecnica propia, y que su uso comercial queda condicionado por una licencia `other` sin texto asociado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GlowTTS (TTS no autorregresivo basado en normalizing flows; inferido del nombre y de la familia Larynx) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (en TTS, la longitud se refiere a la secuencia de fonemas de entrada, no a un contexto de tokens) |
| Tipos de cuantizacion | no disponible; el artefacto se distribuye en ONNX, formato que admite cuantizacion posterior pero no se documenta ninguna |
| Idiomas soportados | ruso (por el identificador `ru-ru`) |
| Licencia | `other` (la model card no especifica el texto de la licencia para esta carpeta) |
| Formato de pesos | ONNX (libreria `phoonnx`) |
| Tamano del repositorio | 0.1 GB |
| Pipeline declarado | text-to-speech |
| Voice ID de phoonnx | `larynx/ru-ru-hajdurova-glow_tts` |
| Fecha de creacion | 2026-11-14 |
| Fecha de actualizacion | 2026-11-14 |

## Arquitectura y entrenamiento

No hay informacion en la model card sobre la arquitectura interna, el numero de parametros, los datos de entrenamiento, el numero de tokens o el proceso de alineacion y entrenamiento. El nombre del modelo y la referencia a `phoonnx-glowtts` indican que se trata de una voz de la familia GlowTTS, un modelo TTS no autorregresivo que emplea normalizing flows para modelar la duracion y la conversion de fonemas a mel-espectrogramas, seguido habitualmente de un vocoder para generar la forma de onda. Esta descripcion es una inferencia a partir de la familia de modelos, no un dato documentado en el repositorio.

El modelo se distribuye como artefacto ONNX para la libreria `phoonnx`, un runtime de sintesis de voz del ecosistema TigreGotico. Los ficheros conservan las rutas del repositorio agregado `Phoonnx/phoonnx-glowtts`, lo que sugiere que esta publicacion es una extraccion de una carpeta para facilitar su descarga y uso individual, sin reentrenamiento ni modificacion documentada de los pesos.

## Capacidades

- Sintesis de voz (text-to-speech) en ruso a partir de texto de entrada.
- Integracion con la libreria `phoonnx` mediante el voice ID `larynx/ru-ru-hajdurova-glow_tts`.
- Inferencia en formato ONNX, apta para despliegue con runtimes ONNX en CPU o GPU.
- Voz identificada como "hajdurova", procedente del conjunto de voces Larynx.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni otras capacidades de modelos de lenguaje.
- No se documentan capacidades multimodales, clonacion de voz, control de emocion ni SSML.
- No se documenta soporte multilingue mas alla del ruso.

## Casos de uso

- Lectura de articulos y noticias en ruso: el modelo convierte texto plano en audio para aplicaciones de accesibilidad o de consumo de contenido, usando la voz "hajdurova" como una de las opciones disponibles del catalogo Larynx.
- Asistentes de voz para aplicaciones en ruso: al exponerse como voice ID dentro de `phoonnx`, puede integrarse en un pipeline de asistente que seleccione la voz segun el idioma detectado.
- Generacion de audiolibros o narracion por lotes: el formato ONNX permite ejecutar la sintesis en servidores sin GPU dedicada y procesar grandes volumenes de texto de forma offline.
- Sistemas de aviso y anuncios automatizados en ruso: por ejemplo, locuciones para transporte publico, comercio o telefonia, donde se requiere una voz consistente y un despliegue ligero.
- Pruebas de integracion en pipelines TTS: util para desarrolladores que evaluan `phoonnx` como runtime y necesitan una voz rusa de referencia del repositorio agregado.
- Prototipado de interfaces de voz en entornos de investigacion: el tamano reducido del repositorio (0.1 GB) facilita su descarga y ejecucion en maquinas de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad (MOS, MCD, WER), latencia ni throughput, y no se dispone de comparaciones con otras voces del catalogo Larynx o de otros sistemas TTS.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamano del repositorio (0.1 GB) sugiere un modelo pequeno que probablemente cabe en memoria de CPU, pero no se documenta el consumo real.
- GPU recomendadas: no disponibles. Al ser un artefacto ONNX de un modelo TTS de la familia GlowTTS, es esperable que funcione en CPU y en GPU consumer, pero no hay datos publicados que lo confirmen.
- Compatibilidad con GPU consumer: no confirmada por el autor.
- Opciones de despliegue: runtime `phoonnx` (libreria declarada); al estar en ONNX, podria ejecutarse con ONNX Runtime, aunque no se documenta ninguna integracion adicional.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de otras voces del catalogo Larynx ni de sistemas TTS alternativos en ruso, y no se dispone de metricas para establecer una comparacion rigurosa.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| glowtts-ru-ru-hajdurova | no disponible | no aplica | other | ONNX | Hugging Face, 0 descargas |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La model card no documenta la licencia concreta de esta carpeta: indica `other` y remite al repositorio de origen, por lo que el uso comercial requiere verificar los terminos del proyecto Larynx y del repositorio `Phoonnx/phoonnx-glowtts`.
- No hay informacion sobre sesgos, calidad de la voz, cobertura fonetica ni comportamiento ante texto fuera de dominio.
- No se documentan limitaciones de longitud de entrada ni de manejo de numeros, siglas o caracteres especiales.
- Al ser un modelo TTS, puede producir pronunciaciones incorrectas en palabras ambiguas o nombres propios; no hay evaluacion publicada que lo cuantifique.
- El repositorio tiene 0 descargas y 0 likes y fue creado y actualizado el mismo dia, lo que indica que no ha pasado por una validacion comunitaria.
- No se documenta el vocoder ni el pipeline completo de audio; el artefacto podria requerir componentes adicionales del repositorio de origen para generar la forma de onda final.
- No se debe asumir soporte de otros idiomas distintos del ruso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-ru-ru-hajdurova
- Repositorio de origen: https://huggingface.co/Phoonnx/phoonnx-glowtts
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
