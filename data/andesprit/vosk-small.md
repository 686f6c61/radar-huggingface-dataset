# Andesprit/vosk-small

## Resumen

El repositorio `Andesprit/vosk-small` no contiene un modelo de lenguaje ni un modelo de reconocimiento de voz entrenado por su autor, sino un paquete de distribucion de los modelos pequenos de Vosk de Alpha Cephei, reempaquetados para su uso en el navegador. Cada archivo es el ZIP original de Vosk convertido a `.tar.gz`, que es el formato que consume la libreria `vosk-browser`. El contenido interno de los modelos no se ha modificado, y el autor publica el tamano y el SHA-256 de cada archivo para que la aplicacion cliente pueda verificar la integridad tras la descarga.

El origen de esta publicacion es la aplicacion Dictaria, que utiliza estos modelos para generar subtitulos en directo dentro del navegador. El sitio de Alpha Cephei no permite descargas directas desde un navegador, por lo que Andesprit aloja estas copias en HuggingFace y la app las descarga desde ahi. Es, por tanto, un espejo de conveniencia y no un artefacto nuevo.

Los modelos subyacentes son reconocedores de voz de tipo Kaldi/Vosk (modelos acusticos y de lenguaje empaquetados, no transformers), en sus variantes *small* para cinco idiomas: ingles estadounidense (0.15), espanol (0.42), frances (0.22), aleman (0.15) y portugues (0.3). El repositorio completo ocupa 0,2 GB y la licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kaldi/Vosk (modelo acustico y de lenguaje empaquetados, no transformer) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de ASR por streaming, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (Vosk distribuye modelos ya optimizados; no se documentan variantes de cuantizacion) |
| Idiomas soportados | en, es, fr, de, pt |
| Licencia | Apache 2.0 |
| Formato de pesos | `.tar.gz` (ZIP original de Vosk reempaquetado; contenido interno sin modificar) |

| Archivo | Modelo original | Tamano (bytes) |
|---|---|---|
| `vosk-model-small-en-us-0.15.tar.gz` | vosk-model-small-en-us-0.15 | 41 116 628 |
| `vosk-model-small-es-0.42.tar.gz` | vosk-model-small-es-0.42 | 39 748 934 |
| `vosk-model-small-fr-0.22.tar.gz` | vosk-model-small-fr-0.22 | 42 153 811 |
| `vosk-model-small-de-0.15.tar.gz` | vosk-model-small-de-0.15 | 46 376 344 |
| `vosk-model-small-pt-0.3.tar.gz` | vosk-model-small-pt-0.3 | 32 358 832 |

Cada archivo incluye su SHA-256 en la model card para verificacion de integridad por parte del cliente.

## Arquitectura y entrenamiento

No hay informacion en la model card sobre la arquitectura interna de los modelos de Vosk mas alla de la etiqueta `kaldi`: se trata de modelos de reconocimiento automatico del habla basados en Kaldi, con modelo acustico y modelo de lenguaje empaquetados en el formato propio de Vosk. No se especifican detalles de entrenamiento (horas de audio, composicion del corpus,tecnicas de alineamiento o decodificacion) porque el autor del repositorio no entrena los modelos, solo los redistribuye.

La unica transformacion documentada es el reempaquetado del ZIP original de Alpha Cephei a `.tar.gz` para que `vosk-browser` pueda leerlo. La model card afirma explicitamente que los archivos internos no se modifican y que el cliente verifica tamano y SHA-256 tras la descarga. Para conocer la arquitectura y el proceso de entrenamiento de los modelos originales habria que consultar la documentacion de Vosk y de Alpha Cephei, no incluida en la informacion disponible.

## Capacidades

- Reconocimiento automatico del habla (ASR) en modo *streaming*, adecuado para transcripcion en tiempo real.
- Cobertura de cinco idiomas: ingles estadounidense, espanol, frances, aleman y portugues.
- Ejecucion en el navegador mediante `vosk-browser`, sin necesidad de servidor de inferencia.
- Verificacion de integridad de los archivos descargados mediante tamano y SHA-256.
- Uso previsto en subtitulos en directo (live captions) dentro de una aplicacion web.
- No dispone de tool calling, function calling, razonamiento multi-paso, vision, audio generativo ni modo *thinking*; es exclusivamente un modelo de ASR.

## Casos de uso

- Subtitulos en directo en el navegador: Dictaria descarga estos `.tar.gz` y ejecuta `vosk-browser` en el cliente para transcribir audio del microfono en tiempo real, sin enviar el audio a un servidor.
- Transcripcion de reuniones y clases con privacidad local: al ejecutarse en el navegador, el audio no sale del dispositivo, lo que es adecuado para entornos con requisitos de confidencialidad.
- Dictado por voz en formularios web: integracion del reconocedor en un campo de texto para introducir contenido hablado en cinco idiomas.
- Aplicaciones multilingues con conmutacion de modelo: seleccion del `.tar.gz` correspondiente al idioma del usuario (en, es, fr, de, pt) y carga bajo demanda.
- Prototipos y demos de ASR sin infraestructura: el tamano reducido de cada archivo (32-46 MB) permite cargarlos en una pagina web sin desplegar GPUs ni servicios de inferencia.
- Verificacion de integridad en pipelines de distribucion: el hash SHA-256 publicado permite comprobar que el archivo descargado por el cliente es identico al original de Alpha Cephei.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; la inferencia con `vosk-browser` se ejecuta en CPU dentro del navegador.
- GPU recomendadas: no aplica para el flujo documentado (ejecucion en cliente); no se documenta soporte GPU.
- Cabe en cualquier equipo capaz de ejecutar un navegador moderno con WebAssembly; el limitante es la memoria y CPU del dispositivo, no una GPU dedicada.
- Despliegue: `vosk-browser` (formato `.tar.gz`); los modelos originales de Vosk tambien pueden usarse con el runtime de Vosk en servidor, aunque este repositorio esta pensado para el navegador.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Tamano | Licencia | Formato |
|---|---|---|---|---|---|
| Andesprit/vosk-small (este repo) | Kaldi/Vosk small, reempaquetado | en, es, fr, de, pt | 32-46 MB por idioma | Apache 2.0 | `.tar.gz` para `vosk-browser` |
| Vosk models (Alpha Cephei, originales) | Kaldi/Vosk | multiple, incluidos los cinco de este repo | identico a este repo | Apache 2.0 | ZIP |
| Whisper (OpenAI) | Transformer encoder-decoder | ~99 idiomas | desde ~39 M (tiny) hasta ~1,55 B (large) | MIT | safetensors, GGUF, etc. |
| wav2vec 2.0 (Meta) | Transformer convolucional | multiple | ~95 M (base) a ~317 M (large) | MIT / Apache 2.0 segun variante | safetensors, PyTorch |

Los datos de Whisper y wav2vec 2.0 se incluyen como referencia de categoria; no se dispone de resultados de benchmarks comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Este repositorio es un espejo de los modelos de Alpha Cephei; cualquier incidencia de calidad, sesgos o precision es atribuible a los modelos originales, no al autor del reempaquetado.
- Son modelos *small*: la precision de transcripcion es inferior a la de modelos de mayor tamano; no se dispone de cifras de WER en la informacion proporcionada.
- Solo cubren cinco idiomas; no hay soporte para otras lenguas ni para cambios de idioma dentro de una misma emision.
- No son modelos de lenguaje: no generan texto libre, no razonan, no hacen tool calling ni soportan vision.
- Riesgo de alucinacion en transcripcion: los modelos de ASR pueden producir palabras plausibles en audio ruidoso o silencioso; requiere validacion en produccion.
- Sesgos: no se documentan en la model card; pueden reflejar los sesgos de los corpus de entrenamiento originales de Vosk.
- La licencia Apache 2.0 se declara en la model card y se atribuye a Alpha Cephei; conviene verificar los terminos en la pagina oficial de Vosk models antes de un uso comercial.
- La fecha de creacion del repositorio indicada en la informacion (2026-11-04) es posterior a la actual; conviene tratar ese dato con cautela.
- La model card esta mayoritariamente en ingles y no documenta latencia, throughput ni requisitos minimos de hardware.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Andesprit/vosk-small
- Modelos originales de Vosk (Alpha Cephei): https://alphacephei.com/vosk/models
- Sitio de Alpha Cephei: https://alphacephei.com
- `vosk-browser` (repositorio): https://github.com/ccoreilly/vosk-browser
- Aplicacion Dictaria: https://dictaria.andesprit.com
