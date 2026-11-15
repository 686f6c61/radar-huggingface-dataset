# Phoonnx/pocket-tts-spanish

## Resumen

pocket-tts-spanish es un modelo de síntesis de voz (text-to-speech) en formato ONNX, distribuido por el usuario Phoonnx como una extracción del subconjunto en castellano del repositorio `Phoonnx/phoonnx-pocket-tts`. El modelo deriva de los pesos originales de Kyutai, que la model card identifica explícitamente como titular de la licencia CC BY 4.0, y está empaquetado para su uso con la librería `phoonnx`, un runtime de inferencia de la organización TigreGotico.

El artefacto resuelve un problema de despliegue: ofrece un conjunto de voces en español listas para usar mediante identificadores estables (`pockettts/es/*`), sin necesidad de descargar el repositorio completo multilingüe. El repositorio ocupa 0,8 GB y contiene 26 voces identificadas en la model card, lo que sugiere un conjunto de pesos de tamaño reducido orientado a inferencia ligera.

La información pública disponible es escasa: no se declaran parámetros, arquitectura interna, longitud de contexto ni idiomas soportados más allá de la indicación del directorio `spanish`. Esta ficha refleja únicamente los datos verificables en la información proporcionada y marca como no disponible todo lo demás.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (pesos en formato ONNX; arquitectura interna no declarada) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio distribuye pesos ONNX; no se detallan variantes) |
| Idiomas soportados | español (según el directorio `spanish` y los voice ids `pockettts/es/*`); no se declara lista formal de idiomas |
| Licencia | CC BY 4.0 (Creative Commons Attribution 4.0 International), atribución a Kyutai |
| Formato de pesos | ONNX (librería `phoonnx`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo. La model card no describe el tipo de red (transformer, difusión, VITS u otro), el número de parámetros, la composición del dataset de entrenamiento ni si se aplicaron técnicas de ajuste como RLHF o fine-tuning sobre un modelo base. Lo único verificable es que los pesos se distribuyen en formato ONNX y que el modelo original procede de Kyutai, según la nota de licencia, y que Phoonnx lo ha reempaquetado por idioma conservando las rutas de fichero del repositorio fuente.

Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o vocoder concreto. Cualquier afirmación sobre la arquitectura sería especulativa y, por tanto, se omite.

## Capacidades

- Síntesis de voz (text-to-speech) en español a partir de texto de entrada.
- Selección de voz mediante identificadores estables con el prefijo `pockettts/es/`.
- Conjunto de 26 voces documentadas en la model card: alba, anna, azelma, bill_boerst, caro_davy, charles, cosette, eponine, estelle, eve, fantine, george, giovanni, jane, javert, jean, juergen, lola, marius, mary, michael, paul, peter_yearsley, rafael, stuart_bell y vera.
- Integración con el runtime `phoonnx` (librería declarada en `library_name`).
- No se declaran capacidades de clonación de voz, control de prosodia, emoción, tool calling, agentes ni multimodalidad.

## Casos de uso

- Lectura de artículos y documentos en castellano: el modelo convierte texto plano en audio con una de las 26 voces disponibles, adecuado para aplicaciones de accesibilidad y lectores de pantalla que necesiten una voz en español empaquetada como ONNX.
- Asistentes de voz en aplicaciones móviles o de escritorio: al distribuirse en ONNX y con un repositorio de 0,8 GB, es viable integrarlo en clientes ligeros que ejecuten inferencia local sin depender de servicios en la nube.
- Generación de audiolibros y pódcast: la variedad de voces permite asignar timbres distintos a narradores o personajes, manteniendo coherencia por identificador de voz.
- Sistemas de aviso y notificación automatizada: anuncios en transporte, comercio o domótica donde se requiere una voz en español con latencia controlada y sin conexión externa.
- Prototipado de interfaces conversacionales: equipos que desarrollan con `phoonnx` pueden validar flujos de voz en español usando los voice ids `pockettts/es/*` antes de integrar un proveedor comercial.
- Localización de contenido audiovisual: doblaje de material textual a voz en español para vídeos corporativos, tutoriales o materiales educativos, con atribución a Kyutai conforme a la licencia CC BY 4.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (0,8 GB) acota el peso en disco de los artefactos, pero no se declara el consumo en memoria durante la inferencia.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; al tratarse de pesos ONNX, la viabilidad depende del runtime `phoonnx` y del proveedor de ejecución (CPU o GPU) que se configure.
- Opciones de despliegue: `phoonnx` (librería declarada). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no son runtimes habituales para TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento, parámetros ni contexto de este modelo, ni referencias a alternativas comparables de TTS en español, por lo que no es posible establecer una comparación rigurosa.

## Limitaciones y advertencias

- La información técnica publicada es mínima: no hay datos de arquitectura, parámetros, contexto ni evaluación de calidad, lo que dificulta estimar su comportamiento en producción.
- No se declara una lista formal de idiomas soportados; el alcance en español se infiere del directorio `spanish` y de los voice ids, no de una especificación explícita.
- La licencia CC BY 4.0 exige atribución a Kyutai en cualquier uso, incluido el comercial; debe conservarse el aviso de licencia y citar la fuente.
- No se documentan sesgos conocidos, pero un modelo de voz puede reproducir sesgos de acento, género o registro presentes en sus datos de entrenamiento, que aquí no se detallan.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí existe riesgo de pronunciación incorrecta o prosodia anómala en textos con nombres propios, siglas o dominios especializados; no hay métricas publicadas que lo cuantifiquen.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- Al ser una extracción de un repositorio mayor, la integridad de los ficheros y las rutas depende del repositorio fuente `Phoonnx/phoonnx-pocket-tts`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/pocket-tts-spanish
- Repositorio fuente: https://huggingface.co/Phoonnx/phoonnx-pocket-tts
- Runtime phoonnx: https://github.com/TigreGotico/phoonnx
- Texto completo de la licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
