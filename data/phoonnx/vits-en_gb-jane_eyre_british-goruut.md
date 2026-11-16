# Phoonnx/vits-en_gb-jane_eyre_british-goruut

## Resumen

`vits-en_gb-jane_eyre_british-goruut` es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su libreria de inferencia ONNX. El modelo original procede de Neurlang, que a su vez lo publico como un modelo Piper ONNX para ingles britanico (`en-GB`). Phoonnx lo redistribuye con un front-end de texto especifico basado en fonemas goruut en alfabeto IPA, lo que permite integrarlo directamente en su ecosistema de sintesis.

El modelo resuelve la conversion de texto a audio en ingles britanico con una voz concreta (Jane Eyre), y su relevancia radica en que esta empaquetado para ejecutarse sobre ONNX Runtime, lo que facilita su despliegue en entornos con CPU o GPU sin depender de frameworks de deep learning completos. El repositorio ocupa aproximadamente 0,1 GB, lo que indica un modelo compacto orientado a inferencia ligera.

La licencia es MIT, lo que permite uso comercial sin restricciones significativas. El modelo no ha registrado descargas ni likes en el momento de la consulta, y la informacion disponible sobre datos de entrenamiento, benchmarks y arquitectura interna es muy limitada: la model card solo describe el empaquetado, no el proceso de entrenamiento original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos ONNX; se desconoce si hay variantes cuantizadas) |
| Idiomas soportados | ingles britanico (`en-GB`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas goruut en alfabeto IPA |
| Tamano del repositorio | ~0,1 GB |
| Libreria de inferencia | phoonnx (ONNX Runtime) |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz de extremo a extremo que combina un encoder de texto, un prior variacional, un decoder basado en flujos normalizadores y un discriminador adversarial durante el entrenamiento. El modelo genera audio directamente a partir de la representacion fonetica, sin necesidad de un vocoder separado en tiempo de inferencia. En este caso, la entrada no es texto plano sino fonemas goruut en alfabeto IPA, producidos por el front-end `scriptconv` con el fonemizador `GoruutPhonemizer`.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o fine-tuning especifico. La model card solo documenta el empaquetado y el origen upstream (`neurlang/piper-onnx-jane-eyre-english-british`), sin detallar el proceso de entrenamiento original. No se han identificado innovaciones tecnicas adicionales mas alla de las propias de VITS y del pipeline de fonemizacion goruut.

## Capacidades

- Sintesis de voz (text-to-speech) en ingles britanico a partir de texto normalizado.
- Conversion de texto a fonemas IPA mediante el fonemizador goruut integrado en `scriptconv`.
- Generacion de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Integracion con el ecosistema OVOS a traves del plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion sobre ONNX Runtime, lo que permite inferencia en CPU y GPU sin dependencias de PyTorch.
- No soporta tool calling, function calling, agentes, vision, audio de entrada ni razonamiento multi-paso: es exclusivamente un modelo TTS.
- Capacidad multilingue limitada a `en-GB`.

## Casos de uso

- **Asistentes de voz locales en OVOS**: el modelo se integra como plugin TTS en OVOS mediante `ovos-tts-plugin-phoonnx`, permitiendo sintesis de voz en ingles britanico en asistentes domesticos sin conexion a servicios en la nube.
- **Lectura de textos largos en ingles britanico**: la API `synthesize_wav` permite generar audio por frases, adecuado para sistemas de lectura de articulos, libros o documentacion con pronunciacion britanica consistente.
- **Prototipado rapido de interfaces de voz**: al ser un modelo ONNX de ~0,1 GB, se puede desplegar en entornos de desarrollo sin GPU dedicada, lo que acelera la validacion de flujos de voz antes de escalar a modelos mayores.
- **Aplicaciones de accesibilidad**: conversion de texto a voz para lectores de pantalla o sistemas de asistencia a personas con discapacidad visual, con una voz concreta y predecible.
- **Generacion de avisos y notificaciones habladas**: integracion en sistemas de megafonia o notificaciones automatizadas que requieran una voz britanica estandarizada.
- **Investigacion en fonemizacion y TTS**: el uso de fonemas goruut en IPA como entrada permite experimentar con front-ends foneticos y comparar su impacto en la calidad de sintesis dentro del ecosistema phoonnx.
- **Pruebas de integracion en pipelines de CI/CD**: al ser un modelo ligero y con licencia MIT, se puede incluir en tests automatizados de sistemas de voz sin coste de licencia ni requisitos de hardware elevados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad (MOS, MCD, WER) ni comparaciones con otros modelos TTS.

## Requisitos de hardware

- **VRAM estimada**: al tratarse de un modelo ONNX de ~0,1 GB, la inferencia cabe holgadamente en menos de 1 GB de memoria, incluso en CPU.
- **GPU recomendadas**: no se requiere GPU; cualquier GPU moderna (RTX 3060, RTX 4090, A100, H100) puede ejecutarlo, pero el modelo esta disenado para funcionar en CPU.
- **Consumer GPU**: si, cabe en cualquier GPU de consumo e incluso en sistemas sin GPU dedicada.
- **Opciones de despliegue**: phoonnx (ONNX Runtime) como libreria principal; integracion con OVOS mediante `ovos-tts-plugin-phoonnx`. No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS.
- **Latencia y throughput**: no disponible. No se han publicado mediciones de latencia ni de throughput en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Contexto / entrada | Disponibilidad |
|---|---|---|---|---|---|---|
| `vits-en_gb-jane_eyre_british-goruut` (este) | VITS | en-GB | MIT | ONNX | fonemas goruut IPA | Hugging Face, via phoonnx |
| `neurlang/piper-onnx-jane-eyre-english-british` (upstream) | VITS (Piper) | en-GB | MIT | ONNX | texto Piper | Hugging Face |
| Otros modelos VITS de la coleccion Phoonnx | VITS | varios | MIT (segun cada modelo) | ONNX | fonemas goruut IPA | Hugging Face, via phoonnx |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas. La comparativa se limita a parametros estructurales y de licencia.

## Limitaciones y advertencias

- **Idioma unico**: solo soporta ingles britanico (`en-GB`); no es adecuado para otros idiomas o variantes regionales sin un modelo especifico.
- **Dependencia del front-end**: la entrada debe ser fonemas goruut en IPA; un texto mal normalizado o un fonemizador mal configurado degradara la calidad del audio.
- **Riesgo de alucinacion acustica**: como todo modelo TTS, puede producir pronunciaciones incorrectas, artefactos o entonaciones anomalas en textos fuera de dominio o con palabras poco frecuentes.
- **Sesgos**: no se documentan sesgos conocidos, pero al ser una voz concreta (Jane Eyre) puede no representar diversidad de acentos o estilos.
- **Licencia**: MIT, permite uso comercial y modificacion; no obstante, se recomienda verificar la licencia del modelo upstream (`neurlang/piper-onnx-jane-eyre-english-british`) por si hubiera condiciones adicionales no reflejadas.
- **Madurez**: el repositorio no registra descargas ni likes, y la documentacion es minima; no hay evidencia de validacion en produccion.
- **Sin soporte de contexto largo ni razonamiento**: no es un modelo de lenguaje; no debe usarse para tareas de generacion de texto, codigo o agentes.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Phoonnx/vits-en_gb-jane_eyre_british-goruut)
- [Modelo upstream: neurlang/piper-onnx-jane-eyre-english-british](https://huggingface.co/neurlang/piper-onnx-jane-eyre-english-british)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Coleccion VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
