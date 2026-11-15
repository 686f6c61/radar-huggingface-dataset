# Phoonnx/vits-mimic3_nl_bart-de-leeuw_low

## Resumen

`vits-mimic3_nl_bart-de-leeuw_low` es un modelo de síntesis de voz (text-to-speech) en formato ONNX, publicado por el usuario Phoonnx en Hugging Face. Se trata de una extracción concreta —la carpeta `mimic3__nl__bart-de-leeuw_low`— del repositorio agregador `Phoonnx/phoonnx-vits`, que empaqueta voces compatibles con el motor [phoonnx](https://github.com/TigreGotico/phoonnx). El modelo emplea la arquitectura VITS, un modelo generativo de extremo a extremo que combina un codificador de texto, un predictor de duración y un decodificador adversario para producir audio de forma directa a partir de texto.

La relevancia de esta ficha es acotada: no se trata de un modelo fundacional ni de un LLM, sino de un artefacto de inferencia TTS de pequeño tamaño (el repositorio completo ocupa unos 0,1 GB) pensado para ser cargado por el runtime phoonnx. La nomenclatura indica que la voz corresponde a un hablante neerlandés (`nl`) identificado como `bart-de-leeuw`, con una variante de calidad `low`, lo que sugiere un modelo optimizado para latencia y huella reducida antes que para fidelidad máxima.

La información pública disponible es mínima: no hay model card descriptiva propia (solo la genérica del repositorio origen), no se declaran idiomas en los metadatos y no se han publicado benchmarks ni datos de entrenamiento. Cualquier evaluación seria de este artefacto requiere inspeccionar los pesos ONNX y probarlo directamente con el runtime phoonnx.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX, presumiblemente float32/float16) |
| Idiomas soportados | neerlandes (`nl`) inferido del identificador de voz; no declarado en metadatos |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz de extremo a extremo que integra en un único modelo un codificador de texto basado en transformer, un predictor de duración estocástico, un módulo de alineación monotónica y un decodificador generativo entrenado con aprendizaje adversario (GAN) junto a una pérdida de verosimilitud variacional. Este diseño permite generar waveforms directamente desde la secuencia de texto sin depender de vocoders externos, lo que explica su popularidad en runtimes ligeros como Piper, del cual parece derivar esta voz (el repositorio origen menciona voces Piper y front-ends espeak).

No hay información disponible sobre el dataset de entrenamiento, el número de horas de audio, el hablante `bart-de-leeuw` ni el proceso de ajuste. La etiqueta `low` en el nombre sugiere una configuración reducida de resolución o de dimensiones internas, habitual en las variantes de baja latencia de Piper, pero el autor no documenta los detalles. Tampoco se especifica si el front-end fonemizador es espeak-ng ni qué variante de neerlandés se empleó.

## Capacidades

- Sintesis de voz a partir de texto (text-to-speech) en neerlandés, presumiblemente con la voz de un hablante identificado como `bart-de-leeuw`.
- Generacion de audio en formato waveform mediante inferencia ONNX, apta para ejecucion en CPU.
- Integracion con el runtime phoonnx mediante el identificador de voz `mimic3/nl/bart-de-leeuw_low`.
- Variante de calidad `low`, orientada a menor coste computacional y latencia reducida.
- No se documentan capacidades de clonacion de voz, control de emocion, SSML avanzado, tool calling, agentes ni multimodalidad. No es un modelo de lenguaje.

## Casos de uso

- Lectura de contenido en neerlandés en aplicaciones de accesibilidad: el modelo puede narrar artículos, noticias o documentos para usuarios con discapacidad visual, cargándose via ONNX en el dispositivo sin dependencia de servicios en la nube.
- Asistentes de voz embebidos en dispositivos de bajo consumo (Raspberry Pi, moviles de gama baja): la variante `low` y el formato ONNX permiten inferencia en CPU con huella de memoria reducida.
- Generacion de avisos y notificaciones habladas en sistemas de transporte o domotica con locale neerlandes, donde se requiere latencia baja y vocabulario acotado.
- Doblaje automatizado de contenido formativo o corporativo en neerlandes, integrando el modelo en pipelines de generacion de audio por lotes.
- Prototipado de interfaces conversacionales en neerlandes dentro de proyectos de investigacion que usan phoonnx como backend TTS, gracias a la licencia MIT y al tamano reducido del artefacto.
- Pruebas de regresion de pipelines TTS: al ser un modelo concreto y versionado de un repositorio agregador, sirve como caso de test reproducible para validar el runtime phoonnx y sus rutas de carga de voces.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; el repositorio completo ocupa 0,1 GB, por lo que la huella en memoria es del orden de decenas de megabytes en float32 y menor en float16.
- GPU recomendadas: innecesarias; el formato ONNX y la variante `low` estan pensados para inferencia en CPU.
- Cabe en GPU consumer: si, en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.), aunque no aporta ventaja frente a CPU para este tamano.
- Opciones de despliegue: runtime phoonnx (principal), ONNX Runtime en CPU o GPU, y potencialmente Piper si la compatibilidad de pesos lo permite (no confirmado).
- Latencia y throughput: no disponibles; se espera latencia de tiempo real o inferior dado el tamano, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `vits-mimic3_nl_bart-de-leeuw_low` (este) | no disponible | no aplica | no disponible | MIT | Hugging Face (Phoonnx) |
| Piper voices (rhasspy/piper-voices) | no disponible | no aplica | no disponible | MIT (por voz) | Hugging Face / GitHub |
| MMS-TTS (facebook/mms-tts-nld) | no disponible | no aplica | no disponible | CC-BY-NC 4.0 | Hugging Face |
| Coqui TTS (modelos VITS multilingues) | no disponible | no aplica | no disponible | MPL 2.0 / varias | GitHub / Hugging Face |

La comparativa es limitada porque ninguno de los modelos alternativos publica recuentos de parametros ni benchmarks TTS comparables en la informacion disponible. La principal diferencia practica de este artefacto frente a Piper es el empaquetado especifico para phoonnx y la variante `low`; frente a MMS-TTS destaca la licencia MIT, que permite uso comercial sin las restricciones no comerciales de los modelos de Meta.

## Limitaciones y advertencias

- No hay model card propia: toda la documentacion proviene del repositorio agregador, lo que dificulta verificar procedencia, hablante y condiciones de entrenamiento.
- Los metadatos no declaran idiomas; el neerlandes se infiere del identificador `nl`, pero no esta confirmado ni documentado el dialecto o variante.
- No se han publicado benchmarks, muestras de audio ni evaluaciones subjetivas (MOS), por lo que la calidad real es desconocida.
- La variante `low` sacrifica fidelidad por eficiencia; no es adecuada para produccion de audio de alta calidad.
- Riesgo de sesgos del hablante y del dataset de entrenamiento original (no documentado): prosodia, acento y cobertura fonetica pueden estar limitados.
- La licencia MIT se aplica segun el repositorio origen, pero este advierte que algunas voces del agregado carecen de licencia clara; conviene revisar la carpeta original antes de un uso comercial.
- Alucinacion en sentido TTS: posibles artefactos, pronunciaciones erroneas o silencios en entradas fuera de distribucion o con caracteres no cubiertos por el front-end.
- Dependencia del runtime phoonnx: la carga fuera de ese ecosistema requiere verificar la compatibilidad de los grafos ONNX y del front-end fonemizador.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Phoonnx/vits-mimic3_nl_bart-de-leeuw_low)
- [Repositorio origen Phoonnx/phoonnx-vits](https://huggingface.co/Phoonnx/phoonnx-vits)
- [Runtime phoonnx (GitHub)](https://github.com/TigreGotico/phoonnx)
- [Voces kasanoma referenciadas en la model card (GitHub)](https://github.com/michsethowusu/kasanoma)
