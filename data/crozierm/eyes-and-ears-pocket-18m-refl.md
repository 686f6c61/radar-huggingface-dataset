# crozierm/eyes-and-ears-pocket-18m-refl

## Resumen

`crozierm/eyes-and-ears-pocket-18m-refl` es una redistribución del modelo de síntesis de voz Pocket TTS de Kyutai, en su variante `english_18m_refl_2026-10` (pocket-tts 4.0.0), convertida a Core ML por FluidInference y reempaquetada por el usuario crozierm para su uso en la aplicación iOS "Eyes & Ears". No se trata de un modelo de lenguaje generativo, sino de un sistema TTS (text-to-speech) de tamano reducido (18M de parametros segun la denominacion del modelo) pensado para inferencia en dispositivo.

El interes de este repositorio es acotado: no aporta pesos nuevos ni entrenamiento adicional, sino un subconjunto de los ficheros del conversor oficial `FluidInference/pocket-tts-coreml` (commit `b51c485`, carpeta `v4/english_18m_refl_2026-10/`) limitado a los artefactos que carga el runtime de la app. Su relevancia practica esta en servir como ejemplo de empaquetado Core ML para TTS en iOS con un modelo de muy baja huella (repo de 0,2 GB) y licencia permisiva.

Al estar orientado exclusivamente a ingles y a inferencia local en Apple, no compite con modelos LLM generalistas ni con sistemas TTS en la nube; su nicho es la sintesis de voz embebida, offline y de baja latencia en dispositivos Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS de Kyutai Pocket TTS; arquitectura interna no detallada en la informacion proporcionada) |
| Parametros totales | 18M (segun denominacion `18m` del modelo; no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no LLM) |
| Tipos de cuantizacion | no disponible (formato Core ML; no se detallan precisiones ni variantes) |
| Idiomas soportados | ingles (`en`) |
| Licencia | CC-BY-4.0 (pesos, © Kyutai); conversion © FluidInference bajo Apache-2.0 |
| Formato de pesos | Core ML (`library_name: coreml`), subconjunto de ficheros del runtime de la app |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo. Se sabe que procede de Kyutai Pocket TTS, version `english_18m_refl_2026-10` dentro de pocket-tts 4.0.0, y que FluidInference realizo la conversion a Core ML en el repositorio `FluidInference/pocket-tts-coreml` (commit `b51c485`, subcarpeta `v4/english_18m_refl_2026-10/`). El sufijo `refl` y la fecha `2026-10` forman parte de la denominacion original del checkpoint de Kyutai; no se detalla su significado ni el proceso de entrenamiento (datos, horas de audio, si hubo fine-tuning o destilacion).

Este repositorio concreto no entrena ni modifica pesos: solo reempaqueta los ficheros que carga el runtime de la app "Eyes & Ears", eliminando el resto. Por tanto, no hay innovaciones tecnicas atribuibles al autor del rehost; la unica aportacion es la conversion Core ML de FluidInference, que permite ejecutar el TTS en el framework de Apple (ANE/GPU/CPU) sin dependencias de Python.

## Capacidades

- Sintesis de texto a voz (TTS) en ingles.
- Inferencia en dispositivo mediante Core ML, sin conexion a red.
- Modelo de muy bajo tamano (repo de 0,2 GB), adecuado para apps iOS con restricciones de espacio.
- Orientado a lectura en voz alta de texto (uso inferido del nombre de la app "Eyes & Ears").
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso (no es un LLM).
- Capacidades multilingues: solo ingles.
- No dispone de modo thinking, vision ni audio de entrada (es un modelo de salida de audio a partir de texto).

## Casos de uso

- Lectura en voz alta en apps iOS de accesibilidad: el modelo puede sintetizar texto de pantalla o documentos en ingles directamente en el dispositivo, sin enviar contenido a servidores, lo que preserva la privacidad del usuario.
- Asistentes de voz offline: integrado en una app nativa, permite respuestas habladas en ingles con latencia baja y sin coste por peticion, gracias a su ejecucion local via Core ML.
- Audiolibros y podcasts generados en dispositivo: al ser un modelo de 18M y un repo de 0,2 GB, cabe en el bundle de una app y puede narrar textos largos por fragmentos.
- Aprendizaje de idiomas: practica de pronunciacion y dictado en ingles con sintesis local, sin depender de APIs externas.
- Prototipado de interfaces voz-first en Apple: sirve como referencia de empaquetado Core ML para TTS en proyectos iOS/macOS que necesiten un modelo pequeno y con licencia CC-BY-4.0.
- Sistemas de navegacion o avisos por voz en apps de campo (sin conectividad): la inferencia local garantiza funcionamiento en entornos sin red.
- Evaluacion de pipelines TTS en dispositivo: util para comparar latencia y calidad de un TTS de 18M frente a alternativas en la nube antes de decidir una integracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica en el sentido habitual; el modelo se ejecuta en Core ML sobre Apple Silicon (ANE, GPU o CPU). El repo ocupa 0,2 GB, por lo que la huella en memoria es muy reducida.
- GPU recomendadas: no disponible; el destino es hardware Apple (iPhone, iPad, Mac con chip M-series o A-series compatible con Core ML).
- Cabe en GPU de consumo: si, en el ecosistema Apple; no hay datos de ejecucion en GPU NVIDIA.
- Opciones de despliegue: Core ML (framework nativo de Apple). No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS en formato Core ML.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos TTS alternativos que permitan una comparacion rigurosa. Como referencia cualitativa, el modelo deriva de Kyutai Pocket TTS y su unica variante documentada es la conversion de FluidInference (`FluidInference/pocket-tts-coreml`), de la que este repositorio es un subconjunto.

## Limitaciones y advertencias

- Solo soporta ingles; no es util para castellano ni otros idiomas.
- No es un modelo de lenguaje: no genera texto, razona ni responde preguntas.
- Al ser un rehost de un subconjunto de ficheros, puede faltar documentacion sobre el pipeline exacto de inferencia; el autor no detalla como cargarlo fuera de la app "Eyes & Ears".
- No se especifican sesgos del modelo de voz (acento, genero, prosodia) ni riesgos de alucinacion en el sentido de TTS (pronunciacion incorrecta, artefactos).
- Licencia CC-BY-4.0: permite uso comercial con atribucion a Kyutai; la conversion de FluidInference es Apache-2.0. Es necesario conservar la atribucion correspondiente.
- La fecha de creacion del repositorio (2026-10-30) y la denominacion del checkpoint son datos del autor; no se ha verificado su correspondencia con un release publico de Kyutai en la informacion disponible.
- Sin descargas ni likes en el momento de la consulta; no hay evidencia de uso en produccion ni de validacion por terceros.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/crozierm/eyes-and-ears-pocket-18m-refl
- Repositorio de la conversion Core ML: https://huggingface.co/FluidInference/pocket-tts-coreml
- Modelo base: kyutai/pocket-tts (referenciado en la model card; enlace directo no incluido en la informacion proporcionada)
