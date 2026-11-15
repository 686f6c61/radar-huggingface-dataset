# Phoonnx/vits-hi_in-priyamvada

## Resumen

vits-hi_in-priyamvada es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, publicado por el usuario Phoonnx y atribuido originalmente a PravalX. Se trata de un empaquetado en formato ONNX de una voz Piper procedente del repositorio PravalX/piper-voices, concretamente la voz femenina "priyamvada" de calidad media para hindi de India (hi-IN). El modelo no introduce arquitectura nueva: su valor esta en la distribucion lista para usar dentro de la libreria phoonnx, que lo ejecuta tanto en Python como en el ecosistema OVOS.

El modelo resuelve un problema concreto: ofrecer sintesis de voz en hindi con un pipeline reproducible basado en fonemas espeak-ng y pesos ONNX, sin necesidad de frameworks de deep learning pesados. El repositorio ocupa apenas 0,1 GB, lo que lo hace adecuado para despliegues ligeros, dispositivos embebidos y asistentes de voz. Su relevancia actual es limitada pero practica: amplia el catalogo de voces indias disponibles en phoonnx y en el standard Piper.

La informacion publica es escasa. No se documentan parametros totales, longitud de contexto (concepto que en TTS no aplica de la misma forma que en LLM), datos de entrenamiento ni resultados de benchmarks. La model card se limita a describir el uso, el front-end de texto y la procedencia de los pesos. Por tanto, esta ficha refleja fielmente lo disponible e indica de forma explicita los datos no publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de LLM) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | hindi de India (hi-IN) |
| Licencia | other (el upstream declara "cc" en la model card de PravalX/piper-voices) |
| Formato de pesos | ONNX (empaquetado para la libreria phoonnx) |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz end-to-end que combina un encoder de texto, un prior variacional condicionado por alineamiento monotonico, un decoder generativo y un discriminador adversarial entrenado con perdidas de reconstruccion y adversariales. Genera formas de onda directamente a partir de fonemas, sin vocoder externo separado. El modelo aqui presentado es un empaquetado ONNX de una voz Piper ya entrenada por PravalX, no un entrenamiento nuevo.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el hablante de origen ni si se aplicaron tecnicas de RLHF o fine-tuning especifico. La model card solo indica que la entrada de texto son fonemas espeak-ng en alfabeto IPA, y que la voz se ejecuta mediante phoonnx con normalizacion de texto delegada a la libreria scriptconv.

## Capacidades

- Sintesis de voz en hindi de India (hi-IN) a partir de texto.
- Entrada basada en fonemas espeak-ng (alfabeto IPA).
- Generacion directa de audio WAV mediante la API `synthesize_wav` de phoonnx.
- Integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador mediante phoonnx.js (con entrada espeak o unicode).
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de modo thinking, vision ni audio de entrada.
- Capacidad multilingue limitada exclusivamente al hindi.

## Casos de uso

- Asistentes de voz en hindi para OVOS: el modelo se integra como plugin TTS y permite responder por voz en un asistente domestico o de escritorio configurado en `mycroft.conf`, con un coste de recursos minimo gracias al formato ONNX.
- Sintesis de voz en aplicaciones Python ligeras: mediante `TTSModelManager` y `synthesize_wav`, cualquier script puede generar audio WAV a partir de texto hindi sin instalar frameworks de deep learning completos.
- Lectura de contenido en hindi en el navegador: con phoonnx.js el modelo puede ejecutarse en cliente para leer articulos, notificaciones o interfaces web en hindi sin enviar texto a un servidor.
- Generacion de audiolibros o locuciones de calidad media: la voz "medium" de Piper ofrece un equilibrio entre calidad y tamano adecuado para narrar textos largos en hindi de forma automatizada.
- Sistemas de anuncios o avisos automatizados en hindi: integracion en pipelines de mensajeria o telefonia para leer mensajes predefinidos con una voz femenina consistente.
- Prototipado de interfaces de voz accesibles: desarrollo de aplicaciones de accesibilidad para usuarios hindi que requieran salida hablada con un modelo de 0,1 GB desplegable en hardware modesto.
- Pruebas de integracion TTS en CI/CD: al ser un artefacto ONNX pequeno y determinista, puede usarse en tests automatizados de pipelines de audio sin dependencias pesadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; por el tamano del repositorio (0,1 GB) y la naturaleza ONNX de VITS, la inferencia es viable en CPU y en GPUs de gama baja.
- GPU recomendadas: no se documentan; el modelo esta pensado para ejecucion en CPU.
- Compatibilidad con GPU de consumo: previsiblemente si en cualquier GPU consumer, dado el reducido tamano, aunque no se aportan mediciones.
- Opciones de despliegue: phoonnx (Python), OVOS mediante `ovos-tts-plugin-phoonnx`, phoonnx.js en navegador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-hi_in-priyamvada (este) | VITS | hi-IN | 0,1 GB repo | other (upstream "cc") | ONNX | Hugging Face, phoonnx |
| Otras voces Piper hi-IN de PravalX | VITS | hi-IN | no disponible | no disponible | ONNX | Hugging Face (piper-voices) |
| Voces VITS de la coleccion Phoonnx | VITS | varios | variable | variable | ONNX | Hugging Face (coleccion VITS) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia es "other" y el upstream declara "cc" de forma ambigua; es imprescindible verificar los terminos exactos antes de un uso comercial.
- Solo soporta hindi de India; no es multilingue.
- La calidad es "medium" segun la nomenclatura Piper, por lo que no debe esperarse una fidelidad de estudio.
- Depende de espeak-ng para la fonemizacion; con el port espyak algunos fonemas difieren y pueden producir pronunciaciones incorrectas.
- No se documentan sesgos, datos de entrenamiento ni evaluaciones de robustez; el riesgo de alucinacion no aplica igual que en LLM, pero si el de pronunciacion erronea en textos fuera de dominio.
- No hay informacion sobre el hablante original ni sobre condiciones de uso eticas.
- El modelo no es un LLM: no admite tool calling, agentes ni razonamiento.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-hi_in-priyamvada
- Upstream (PravalX/piper-voices, voz priyamvada): https://huggingface.co/PravalX/piper-voices/tree/main/hi/hi_IN/priyamvada/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
