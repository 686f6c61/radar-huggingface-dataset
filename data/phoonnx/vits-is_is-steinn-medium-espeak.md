# Phoonnx/vits-is_is-steinn-medium-espeak

## Resumen

vits-is_is-steinn-medium-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y reempaquetado por Phoonnx en formato ONNX para su uso con la libreria phoonnx. El modelo convierte texto en islandes (is-IS) en audio inteligible, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA.

El modelo resuelve el problema de la sintesis de voz offline para un idioma de bajos recursos como el islandes, ofreciendo inferencia local sin dependencia de servicios en la nube. Su tamano (repo de 0.1 GB) y su formato ONNX lo hacen adecuado para despliegue en dispositivos con recursos limitados, asistentes de voz embebidos y entornos OVOS/Mycroft.

Es relevante ahora porque forma parte del ecosistema phoonnx, que estandariza y empaqueta voces VITS de Piper para su uso en Python y en el navegador (phoonnx.js), facilitando la integracion de TTS multilingue en aplicaciones de codigo abierto con licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos ONNX; el repo ocupa 0.1 GB) |
| Idiomas soportados | islandes (is-IS) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | 0.1 GB |
| Libreria | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de sintesis de voz que combina un encoder de texto, un prior variacional, un decoder basado en flujos normalizadores y un discriminador adversarial entrenado con perdidas de reconstruccion y adversariales. Este modelo concreto es una voz "medium" del catalogo Piper de Rhasspy para islandes (`is_IS/steinn/medium`), reempaquetada en ONNX por Phoonnx.

No se dispone de informacion sobre el numero de horas de audio de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF/DPO (no aplicables en TTS). La innovacion practica es el empaquetado con phoonnx y la integracion del front-end de texto mediante scriptconv, que normaliza el texto y lo convierte a fonemas espeak-ng antes de la inferencia.

## Capacidades

- Sintesis de voz (text-to-speech) en islandes (is-IS) a partir de texto.
- Conversion texto-a-fonemas mediante espeak-ng (alfabeto IPA) a traves de `EspeakPhonemizer` de scriptconv.
- Inferencia local en formato ONNX, sin necesidad de GPU dedicada.
- Integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador mediante phoonnx.js (demo en tigregotico.pt/demo).
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso (es un modelo exclusivamente TTS).

## Casos de uso

- Asistentes de voz offline en islandes: integracion en OVOS/Mycroft mediante `ovos-tts-plugin-phoonnx` para leer respuestas del asistente sin conexion a internet, aprovechando el formato ONNX y el reducido tamano del modelo.
- Lectura de contenido accesible: sintesis de articulos, noticias o documentos en islandes para lectores de pantalla y aplicaciones de accesibilidad, con inferencia local que evita enviar texto a servicios externos.
- Sistemas de anuncios publicos y senalizacion: generacion de avisos de voz pregrabados en islandes para transporte, aeropuertos o comercios, donde la latencia y el coste por sintesis son criticos.
- Aplicaciones web de aprendizaje de islandes: uso de phoonnx.js en el navegador para pronunciar vocabulario y frases, sin backend ni cuotas de API.
- Prototipado de interfaces conversacionales: generacion rapida de audio de prueba en islandes durante el desarrollo de productos de voz, gracias a la instalacion simple via `pip install --pre phoonnx`.
- Dispositivos embebidos y de bajo consumo: despliegue en Raspberry Pi u otros SBC con el runtime ONNX, dado el tamano de 0.1 GB del repositorio y la ausencia de requisitos de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo es de 0.1 GB en ONNX y puede ejecutarse en CPU.
- GPU recomendadas: no disponible; no se requieren GPU dedicadas para VITS en formato ONNX.
- Cabe en GPU consumer: si, y tambien en CPU; no se especifican modelos concretos.
- Opciones de despliegue: phoonnx (Python), OVOS (`ovos-tts-plugin-phoonnx`), phoonnx.js (navegador); requiere espeak-ng instalado o el extra `phoonnx[espeak]`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vits-is_is-steinn-medium-espeak (este modelo) | VITS | islandes (is-IS) | ONNX | MIT | Hugging Face (Phoonnx) |
| rhasspy/piper-voices is_IS/steinn/medium | VITS | islandes (is-IS) | Piper (ONNX) | MIT | Hugging Face (Rhasspy) |
| Otras voces VITS de la coleccion Phoonnx | VITS | varios | ONNX | MIT (segun upstream) | Hugging Face (Phoonnx) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta islandes (is-IS); no es multilingue.
- Depende de espeak-ng para la fonemizacion; con el port espyak algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- Riesgo de errores de pronunciacion y prosodia en palabras fuera del dominio de entrenamiento; no se han publicado evaluaciones de calidad (MOS) en la informacion disponible.
- No apto para clonacion de voz ni control de estilo; es una voz unica preentrenada.
- Licencia MIT segun la model card upstream de rhasspy/piper-voices; verificar terminos del dataset original antes de uso comercial a gran escala.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; ecosistema y mantenimiento dependientes de Phoonnx.
- No dispone de datos publicados sobre sesgos, alucinacion (no aplica en TTS) ni latencia en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-is_is-steinn-medium-espeak
- Upstream Piper: https://huggingface.co/rhasspy/piper-voices/tree/main/is/is_IS/steinn/medium
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
