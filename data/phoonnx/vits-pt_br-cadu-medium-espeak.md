# Phoonnx/vits-pt_br-cadu-medium-espeak

## Resumen

vits-pt_br-cadu-medium-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy como parte del proyecto Piper y empaquetado por Phoonnx para su libreria de inferencia ONNX. El modelo convierte texto en portugues de Brasil (pt-BR) en audio inteligible, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA.

Se trata de un modelo compacto: el repositorio completo ocupa aproximadamente 0,1 GB, lo que lo situa en la categoria "medium" de las voces Piper. Su relevancia practica radica en que permite sintesis de voz local, sin dependencia de servicios en la nube, con una licencia permisiva (MIT) y un formato ONNX que facilita el despliegue tanto en servidores como en entornos embebidos.

El modelo no es un LLM ni un modelo multimodal: es un sintetizador neuronal de voz especializado en un unico idioma y con un front-end fonemico concreto (espeak). Su interes para desarrolladores reside en la integracion con el ecosistema phoonnx/OVOS y en la posibilidad de ejecutar TTS en portugues de Brasil de forma ligera y reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS neuronal) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | portugues de Brasil (pt-BR) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | ~0,1 GB |
| Pipeline | text-to-speech |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz end-to-end que combina un encoder de texto, un prior/duration predictor de alineamiento variacional, un decoder generativo basado en flujos normales y un discriminador adversarial multi-periodo durante el entrenamiento. El resultado es un modelo que genera waveforms directamente a partir de fonemas sin necesidad de un vocoder separado, lo que reduce la latencia y simplifica el despliegue.

No se dispone de informacion sobre el numero de horas de audio de entrenamiento, la composicion del corpus, ni si se aplicaron tecnicas de fine-tuning o adaptacion especifica. La model card unicamente indica que el modelo procede de `rhasspy/piper-voices/pt/pt_BR/cadu/medium`, una voz Piper de tamano "medium" para portugues de Brasil, y que la entrada textual se convierte a fonemas mediante `EspeakPhonemizer` de la libreria `scriptconv`. No se documentan innovaciones tecnicas adicionales mas alla de las propias de VITS.

## Capacidades

- Sintesis de voz a partir de texto en portugues de Brasil (pt-BR).
- Generacion de audio en formato WAV mediante la API `voice.synthesize_wav()`.
- Entrada fonemica basada en espeak-ng (alfabeto IPA), con normalizacion de texto previa mediante `scriptconv`.
- Integracion con el ecosistema OVOS a traves del plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador mediante `phoonnx.js` (con entrada espeak o unicode).
- No soporta tool calling, agentes, razonamiento multi-step, vision ni audio de entrada.
- No dispone de modo "thinking" ni capacidades multimodales.
- Capacidad multilingue limitada: solo pt-BR.

## Casos de uso

- Asistentes de voz locales en portugues de Brasil: integracion en OVOS mediante `ovos-tts-plugin-phoonnx`, configurando la voz `piper/pt_BR-cadu-medium` en `mycroft.conf`, lo que permite un asistente con sintesis offline y sin coste por peticion.
- Lectura de contenido web o documentos: el modelo puede convertir articulos, noticias o correos en audio para aplicaciones de accesibilidad, aprovechando su tamano reducido (~0,1 GB) para ejecutarse en servidores modestos.
- Sistemas de anuncios automatizados: generacion de avisos hablados en transporte publico, comercios o edificios inteligentes, donde la latencia baja de un modelo VITS ONNX es adecuada para respuestas en tiempo real.
- Prototipado de interfaces conversacionales: desarrollo rapido de demos de voz en pt-BR sin depender de APIs externas, usando `phoonnx` en Python o `phoonnx.js` en el navegador (demo en tigregotico.pt/demo).
- Audiolibros y contenido educativo: sintesis por lotes de textos largos en portugues, con la ventaja de una licencia MIT que permite uso comercial sin restricciones adicionales.
- Integracion en pipelines de CI/CD para pruebas de voz: generacion automatizada de clips de audio en tests de integracion de asistentes, gracias a la API programatica de `phoonnx` y a la ausencia de dependencias de red.
- Dispositivos embebidos y edge computing: el formato ONNX y el reducido tamano del repositorio permiten ejecutar el modelo en hardware limitado, aunque no se dispone de cifras de latencia o throughput publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con un repositorio de ~0,1 GB, el modelo es muy ligero y probablemente cabe en CPU y en GPUs de gama baja, pero no se documentan cifras oficiales.
- GPU recomendadas: no disponible. Por tamano, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) deberia ser suficiente, pero no hay datos confirmados.
- Compatibilidad con GPU consumer: previsiblemente si, dado el tamano reducido, aunque no se confirma en la model card.
- Opciones de despliegue: `phoonnx` (Python), `phoonnx.js` (navegador), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ejecucion ONNX en general.
- Dependencias: espeak-ng (o el port espyak incluido en `phoonnx[espeak]`), con la advertencia de que algunos fonemas de espyak difieren de espeak-ng y pueden producir pronunciaciones incorrectas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano repo | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| vits-pt_br-cadu-medium-espeak (este) | VITS | pt-BR | ~0,1 GB | MIT | ONNX | Empaquetado phoonnx, entrada espeak |
| Otras voces Piper pt_BR (p. ej. variantes de rhasspy/piper-voices) | VITS | pt-BR | no disponible | MIT (segun upstream) | ONNX | Misma familia, distinto hablante/tamano |
| Modelos TTS multilingues genericos | no disponible | multi | no disponible | variable | variable | No comparable directamente por idioma y tamano |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado en un unico idioma (pt-BR); no soporta otros idiomas.
- La calidad de pronunciacion depende de espeak-ng: con el port espyak algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- Riesgo de errores en la normalizacion de texto (numeros, abreviaturas, siglas) segun la cobertura de `scriptconv`.
- No se documentan sesgos especificos, pero al ser una voz entrenada con un corpus concreto puede presentar sesgos de hablante, genero o registro.
- No hay informacion sobre robustez ante texto ruidoso, emoticonos o dominios especializados (medico, legal, tecnico).
- Licencia MIT declarada por el upstream; se recomienda verificar la model card original de `rhasspy/piper-voices` antes de uso comercial.
- No se publican benchmarks objetivos (MOS, WER de sintesis, latencia), por lo que la evaluacion de calidad debe hacerse de forma empirica.
- El modelo no es un LLM: no genera texto, no razona y no admite instrucciones complejas; solo sintetiza voz a partir de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-pt_br-cadu-medium-espeak
- Upstream (Piper voices, pt_BR/cadu/medium): https://huggingface.co/rhasspy/piper-voices/tree/main/pt/pt_BR/cadu/medium
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
