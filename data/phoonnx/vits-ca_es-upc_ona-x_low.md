# Phoonnx/vits-ca_es-upc_ona-x_low

## Resumen
Phoonnx/vits-ca_es-upc_ona-x_low es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su libreria ONNX de TTS. El modelo original procede de Rhasspy, concretamente de la coleccion piper-voices en la ruta ca/ca_ES/upc_ona/x_low, y esta optimizado para generar voz en catalan (ca-ES). La variante x_low indica que se trata de la configuracion mas ligera de la familia Piper, pensada para inferencia rapida en entornos con recursos limitados.

El modelo no es un LLM generativo de texto, sino un sistema TTS condicionado por fonemas. La entrada de texto se convierte en fonemas espeak (alfabeto IPA) mediante la libreria scriptconv, y la red VITS transforma esa secuencia fonemica en audio. Esto lo hace especialmente adecuado para asistentes de voz, lectores de pantalla y sistemas de interaccion por voz que necesiten sintesis en catalan con baja latencia.

Su relevancia actual radica en que llena el hueco de voces catalanas ligeras y de licencia permisiva (MIT) dentro del ecosistema open source, integrable con OVOS/Mycroft y desplegable en navegador mediante phoonnx.js. Con solo 24 descargas y creado en noviembre de 2026, es un modelo reciente y de nicho, orientado a desarrolladores que necesiten TTS catalan embebido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS por fonemas, sin ventana de contexto definida) |
| Tipos de cuantizacion | no disponible (formato ONNX; la variante x_low implica menor tamano, sin cuantizacion explicita documentada) |
| Idiomas soportados | catalan (ca-ES) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento
El modelo emplea VITS, una arquitectura end-to-end de sintesis de voz que combina un encoder de texto, un prior variacional, un decoder basado en flujos normalizadores y un discriminador adversarial para el entrenamiento. VITS genera audio de forma directa a partir de fonemas, sin necesidad de un vocoder separado, lo que reduce la latencia y simplifica el despliegue. La variante x_low de Piper corresponde a la configuracion de menor capacidad de la familia, con menos canales y capas que las variantes medium o high.

No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables habitualmente en TTS). El modelo original fue entrenado por Rhasspy dentro del proyecto piper-voices y posteriormente reempaquetado por Phoonnx en formato ONNX. La entrada de texto se normaliza mediante scriptconv y se fonemiza con espeak-ng (o con el port espyak en su defecto), lo que introduce una dependencia externa para la conversion texto-fonema.

## Capacidades
- Sintesis de voz en catalan (ca-ES) a partir de texto plano.
- Conversion texto-fonema mediante espeak-ng (IPA) como paso previo a la sintesis.
- Generacion de audio WAV mediante la API de phoonnx (`synthesize_wav`).
- Integracion como plugin TTS en OVOS/Mycroft (`ovos-tts-plugin-phoonnx`).
- Ejecucion en navegador mediante phoonnx.js (entrada espeak o unicode).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un LLM).
- No dispone de modo thinking, vision ni audio de entrada; solo genera audio de salida.
- Capacidad multilingue limitada al catalan; no se documentan otros idiomas.

## Casos de uso
- Asistentes de voz en catalan: integrado como plugin de OVOS/Mycroft, el modelo permite que un asistente domestico responda en catalan con baja latencia gracias a su variante x_low, adecuada para hardware embebido como Raspberry Pi.
- Lectores de pantalla y accesibilidad: la sintesis ligera permite convertir texto de interfaces o documentos en audio en tiempo real en navegador mediante phoonnx.js, sin depender de servicios en la nube.
- Sistemas de megafonia y avisos automatizados: en entornos como transporte publico o comercios de Cataluna, el modelo puede generar anuncios pregrabados o dinamicos en catalan con una licencia MIT que permite uso comercial.
- Videojuegos y aplicaciones interactivas: la generacion de dialogos de personajes en catalan en tiempo real es viable por el bajo coste computacional de la variante x_low y su formato ONNX, que facilita el despliegue multiplataforma.
- Educacion y aprendizaje de idiomas: el modelo puede sintetizar frases en catalan para aplicaciones de pronunciacion o materiales didacticos, aunque la calidad de la variante x_low es limitada frente a variantes superiores.
- Prototipado rapido de interfaces de voz: desarrolladores que necesiten validar un flujo de voz en catalan pueden desplegar el modelo con `pip install --pre phoonnx` y espeak-ng en pocos minutos, sin infraestructura GPU.
- Automatizacion de locuciones para contenido audiovisual: generacion de voces en off para videos o podcasts en catalan con licencia permisiva, integrable en pipelines de postproduccion.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible numericamente; por ser una variante x_low de VITS en ONNX, el consumo es bajo y cabe en CPU sin GPU dedicada.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. En caso de usar GPU, cualquier modelo consumer (GTX 1050 o superior) es suficiente.
- Cabe en consumer GPU y en CPU: si, incluida Raspberry Pi y navegador (phoonnx.js).
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft, phoonnx.js en navegador (demo en tigregotico.pt/demo), y runtime ONNX subyacente.
- Latencia y throughput estimados: no disponible; la variante x_low esta disenada para minimizar latencia, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| Phoonnx/vits-ca_es-upc_ona-x_low | VITS | no disponible | no aplica | ca-ES | MIT | ONNX |
| Rhasspy piper-voices ca/ca_ES/upc_ona/x_low (upstream) | VITS | no disponible | no aplica | ca-ES | MIT | ONNX (origen) |
| Otras voces Piper en catalan (upc_ona medium/high) | VITS | no disponible | no aplica | ca-ES | MIT | ONNX |
| Modelos TTS multilingues open source (p. ej. Coqui XTTS) | no disponible en esta ficha | no disponible | no disponible | multi | no disponible | no disponible |

La comparativa detallada con Coqui XTTS u otros TTS multilingues no esta disponible en la informacion proporcionada; solo se confirma la relacion directa con el upstream de Rhasspy y con otras variantes Piper de la misma voz catalana.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados en la informacion disponible; al estar entrenado con una unica voz (upc_ona), la diversidad de hablantes es nula.
- Riesgo de alucinacion: en TTS se traduce en pronunciaciones incorrectas o artefactos acusticos; el uso de espyak en lugar de espeak-ng puede provocar errores de pronunciacion segun la propia model card.
- Limitaciones de contexto o idioma: solo catalan (ca-ES); no soporta otros idiomas ni cambios de voz.
- Restricciones de licencia: licencia MIT, permite uso comercial y modificacion con atribucion; la licencia upstream tambien es MIT segun la model card.
- Dependencia externa de espeak-ng para la fonemizacion; sin el instalado, la calidad puede degradarse.
- Variante x_low: la calidad acustica es la mas baja de la familia Piper; para produccion de alta calidad conviene evaluar variantes medium o high.
- Modelo de nicho con solo 24 descargas y sin benchmarks publicados; la validacion en produccion corre por cuenta del integrador.
- No es un LLM: no admite razonamiento, agentes ni tool calling; cualquier expectativa en ese sentido es inaplicable.

## Enlaces
- Hugging Face: https://huggingface.co/Phoonnx/vits-ca_es-upc_ona-x_low
- Upstream Rhasspy: https://huggingface.co/rhasspy/piper-voices/tree/main/ca/ca_ES/upc_ona/x_low
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo phoonnx.js: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
