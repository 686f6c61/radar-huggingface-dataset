# ezequiel-andrade/phonon-voices

## Resumen

Phonon voices es una coleccion de 102 embeddings de voz empaquetados como ficheros `.safetensors` para el modelo de sintesis de voz Phonon S (31M de parametros). No se trata de un modelo generativo de texto ni de un LLM, sino de un artefacto de pesos ligeros que actua como banco de voces preentrenadas: cada fichero contiene un unico tensor `speaker_wavs` de dimensiones 1×512×125 en float32, que el modelo Phonon consume directamente sin necesidad de clonacion de voz en tiempo de inferencia. El repositorio lo publica el usuario ezequiel-andrade bajo licencia Apache 2.0.

El paquete cubre cinco idiomas (ingles, frances, aleman, espanol y portugues) con 90 voces del catalogo Gradium distribuidas en siete locales, mas 12 voces de personaje en ingles. La tabla resumen del autor desglosa 37 voces en ingles (US y UK), 15 en frances, 13 en aleman, 25 en espanol (Espana y Mexico) y 12 en portugues (Brasil), con un total de 48 voces femeninas, 42 masculinas y 12 de personaje.

La relevancia de este repositorio es practica: elimina la necesidad de entrenar o clonar voces para desplegar TTS multilingue con Phonon S, un modelo de solo 31M de parametros que puede ejecutarse en hardware modesto. El formato de identificacion `ba7a5a45@300` y la estructura tensorial fija facilitan la integracion directa en pipelines de sintesis sin pasos intermedios de adaptacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (embeddings de voz para Phonon S; el modelo base es TTS de 31M de parametros) |
| Parametros totales | No disponible para el modelo base Phonon S; cada embedding contiene un tensor de 1×512×125 en float32 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (US y UK), frances, aleman, espanol (Espana y Mexico), portugues (Brasil) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.safetensors` (formato `ba7a5a45@300`, tensor unico `speaker_wavs`, 1×512×125, float32) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna de Phonon S (31M) ni el proceso de entrenamiento de las voces. Lo que si se especifica es el contrato de datos: cada voz es un fichero `.safetensors` con un unico tensor llamado `speaker_wavs`, de forma 1×512×125 y tipo float32, identificado con la etiqueta de formato `ba7a5a45@300`. Este tensor se inyecta directamente en Phonon, que lo usa como condicionamiento de hablante sin clonacion, es decir, sin necesidad de audio de referencia en el momento de la sintesis.

Las 90 voces del catalogo Gradium estan preentrenadas y cubren siete locales, mientras que las 12 voces de personaje en ingles anaden variedad estilistica. No se aportan datos sobre el corpus de entrenamiento, el numero de horas de audio, la composicion del dataset ni si hubo ajuste fino con RLHF o DPO, algo esperable en un artefacto de embeddings y no en un modelo de lenguaje. Tampoco se detalla si Phonon S emplea un decoder autoregresivo, un modelo de difusion o un flujo normalizador, por lo que la innovacion tecnica destacable se limita al formato compacto y estandarizado de los embeddings.

## Capacidades

- Sintesis de voz multilingue en cinco idiomas: ingles (US y UK), frances, aleman, espanol (Espana y Mexico) y portugues (Brasil).
- 102 voces preentrenadas: 48 femeninas, 42 masculinas y 12 de personaje en ingles.
- Inyeccion directa de voz sin clonacion: el embedding se carga como condicionamiento de hablante y no requiere audio de referencia en inferencia.
- Compatibilidad con Phonon S (31M), un modelo TTS ligero que puede ejecutarse en hardware de gama baja.
- Muestras de audio disponibles por voz en formato `.ogg`, alojadas en el repositorio `gradium/phonon-voices` de HuggingFace.
- No se documentan capacidades de tool calling, razonamiento multi-paso, vision, audio de entrada ni modo thinking, ya que no es un modelo de lenguaje.

## Casos de uso

- **Atencion al cliente automatizada en varios idiomas**: el paquete permite asignar una voz distinta por locale (por ejemplo, una voz espanola para clientes de Espana y una mexicana para LatAm) sin entrenar modelos adicionales, usando el mismo Phonon S de 31M para todas las lenguas.
- **Locucion de audiolibros y contenido editorial**: las 102 voces permiten narrar textos largos alternando voces masculinas y femeninas por personaje, con la ventaja de que el embedding se carga una sola vez y no exige clonacion por cada capitulo.
- **Doblaje y localizacion de video**: con 15 voces francesas, 13 alemanas, 25 espanolas y 12 portuguesas, un mismo pipeline puede generar pistas de audio dobladas para cinco mercados manteniendo coherencia de timbre entre episodios.
- **Asistentes de voz embebidos**: al tratarse de embeddings ligeros para un modelo de 31M de parametros, el conjunto cabe en dispositivos con recursos limitados (Raspberry Pi, moviles, sistemas empotrados) donde un TTS de miles de millones de parametros no es viable.
- **Prototipado rapido de productos de voz**: los ficheros `.safetensors` se cargan directamente en Phonon, de modo que un equipo puede probar 102 timbres distintos en una tarde y elegir el adecuado antes de invertir en produccion.
- **Accesibilidad y lectura de pantalla**: las voces de personaje en ingles y las variantes regionales permiten ofrecer una voz mas natural y menos robotica en lectores de pantalla, con opcion de cambiar de voz segun el contexto o el usuario.
- **Generacion de contenido para redes y podcasts**: la variedad de voces masculinas y femeninas por idioma facilita producir episodios con varios locutores sinteticos sin depender de grabaciones humanas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El modelo base Phonon S tiene 31M de parametros, lo que en float32 equivaldria a unos 124 MB solo en pesos, pero no se confirma el tipo de cuantizacion ni el consumo real.
- GPU recomendadas: no disponible. Por el tamano del modelo base, es plausible que funcione en GPUs consumer de gama baja, pero no se aportan datos oficiales.
- Compatibilidad con GPU consumer: no confirmada en la documentacion disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el unico mecanismo descrito es la carga directa de embeddings `.safetensors` en Phonon.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de embeddings de voz o TTS con los que contrastar parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- El repositorio no documenta la arquitectura, el entrenamiento ni los datos de Phonon S, por lo que no es posible evaluar sesgos de generacion ni calidad acustica de forma independiente.
- No se aportan metricas objetivas (MOS, WER, similitud de hablante) ni benchmarks que respalden la calidad de las 102 voces.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- El tamano del repo es de 0.0 GB, lo que sugiere que los ficheros de voz podrian no estar efectivamente alojados o que la metadata no refleja el contenido real; conviene verificar antes de integrarlo en produccion.
- La model card esta incompleta: la seccion de frances se corta a mitad de tabla, por lo que no se listan todas las voces prometidas.
- No se especifican restricciones adicionales de uso comercial mas alla de la licencia Apache 2.0, pero tampoco se ofrece garantia alguna sobre el origen de las voces del catalogo Gradium.
- Riesgo de alucinacion acustica y artefactos de sintesis no cuantificado; al no haber benchmarks, la idoneidad para produccion debe validarse con pruebas propias.
- La cobertura linguistica se limita a cinco idiomas; no hay soporte documentado para otras lenguas.
- No se indica compatibilidad con versiones concretas de Phonon ni si los embeddings `ba7a5a45@300` son estables entre releases.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ezequiel-andrade/phonon-voices
- Repositorio de muestras de audio: https://huggingface.co/gradium/phonon-voices
- No se han encontrado en la informacion disponible papers, blogs, repositorios de codigo ni demos adicionales.
