# Phoonnx/vits-en_us-vasco-espeak

## Resumen

vits-en_us-vasco-espeak es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo original procede de poisson-fish, que lo publicó como parte de su colección de voces Piper para el ecosistema Vasco, y Phoonnx lo redistribuye con el formato y la integración necesarios para ejecutarse con su librería `phoonnx` y con el plugin `ovos-tts-plugin-phoonnx` del asistente de voz OVOS.

Se trata de un modelo de voz concreta (una única hablante, en inglés estadounidense) que recibe fonemas espeak en alfabeto IPA y genera audio WAV. No es un modelo de lenguaje general: su única tarea es convertir texto en habla, y su relevancia actual radica en que permite desplegar TTS local, ligero y sin dependencias de servicios en la nube dentro de pipelines de asistentes de voz open source.

El repositorio pesa aproximadamente 0,1 GB y se distribuye con licencia MIT. La información pública disponible es muy escasa: no se detallan parámetros, contexto, datos de entrenamiento ni benchmarks, por lo que esta ficha refleja únicamente lo que el autor y el empaquetador documentan.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS; entrada por frase) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | inglés estadounidense (en-US) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamaño del repositorio | ~0,1 GB |
| Librería de inferencia | phoonnx (Python), phoonnx.js (navegador) |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema de TTS neuronal de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial entrenado de forma conjunta. VITS se caracteriza por generar audio de forma directa (sin vocoder separado en tiempo de inferencia) y por su capacidad de producir habla natural con un coste computacional moderado, lo que lo hace adecuado para despliegue en CPU y en dispositivos con recursos limitados.

El modelo se distribuye como pesos ONNX y se ejecuta mediante la librería phoonnx. La entrada no es texto crudo, sino fonemas generados por espeak-ng (o por el port espyak que incluye el extra `phoonnx[espeak]`). La normalización y conversión del texto a fonemas la realiza la librería scriptconv, concretamente el componente `EspeakPhonemizer` del módulo `scriptconv_copyleft.phonemizers.mul`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o fine-tuning; el modelo card no los detalla.

## Capacidades

- Síntesis de voz (TTS) en inglés estadounidense a partir de texto, con salida en WAV.
- Fonemización mediante espeak-ng en alfabeto IPA; también admite el port espyak, aunque con posibles diferencias fonéticas que pueden provocar errores de pronunciación.
- Integración con el asistente de voz OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurable desde `mycroft.conf`.
- Ejecución en navegador a través de phoonnx.js, con soporte de entrada espeak o Unicode.
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio de entrada ni modo thinking: es exclusivamente un modelo de síntesis de voz.
- Capacidad multilingüe: limitada a en-US; no se documentan otras lenguas.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se selecciona como módulo TTS en `mycroft.conf` y sintetiza las respuestas del asistente sin depender de servicios en la nube, gracias a su formato ONNX y a su reducido tamaño (~0,1 GB).
- Síntesis de voz en aplicaciones de escritorio o servidores sin GPU: al ejecutarse sobre ONNX y con un peso reducido, puede correr en CPU y en entornos con recursos limitados.
- Lectura de texto en aplicaciones web: mediante phoonnx.js, el modelo puede sintetizar texto directamente en el navegador, útil para lectores de pantalla o interfaces de accesibilidad.
- Generación de avisos y notificaciones habladas: en sistemas domóticos o de monitorización, el modelo puede convertir mensajes cortos en audio para alertas por voz.
- Prototipado de pipelines TTS: al estar empaquetado para phoonnx y documentado con ejemplos de código, sirve como voz de referencia para validar integraciones de TTS antes de escalar a otras voces de la colección VITS.
- Pruebas de pronunciación y fonética: al recibir fonemas espeak en IPA, permite experimentar con la fonemización y evaluar la calidad de la síntesis con distintas entradas fonéticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de un modelo ONNX de ~0,1 GB, es previsible que funcione en CPU sin GPU dedicada, aunque no se documentan cifras oficiales.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No se documenta; por tamaño del repositorio, es plausible que sí, pero no hay confirmación del autor.
- Opciones de despliegue: librería phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y phoonnx.js en navegador. Requiere espeak-ng instalado (por ejemplo, `apt install espeak-ng`) o el extra `phoonnx[espeak]`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la información proporcionada. Como referencia cualitativa, el modelo pertenece a la familia de voces Piper/VITS empaquetadas por Phoonnx, pero no se han publicado métricas que permitan una comparación cuantitativa con alternativas concretas.

| Modelo | Arquitectura | Idioma | Licencia | Formato | Contexto |
|---|---|---|---|---|---|
| vits-en_us-vasco-espeak | VITS | en-US | MIT | ONNX | no aplica |
| Otras voces de la colección VITS de Phoonnx | VITS | variable | variable | ONNX | no aplica |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser una voz única en inglés estadounidense, no representa variedades dialectales ni otras lenguas.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero la síntesis puede producir pronunciaciones incorrectas, especialmente si se usa espyak en lugar de espeak-ng, ya que algunos fonemas difieren.
- Limitaciones de idioma: solo en-US; no se documenta soporte para otras lenguas ni acentos.
- Dependencia externa: requiere espeak-ng instalado en el sistema o el extra `phoonnx[espeak]`; sin él, el modelo no puede fonemizar la entrada.
- Restricciones de licencia: licencia MIT, que permite uso comercial, pero el model card indica que "the upstream release states its terms", por lo que conviene verificar las condiciones del repositorio original de poisson-fish.
- Caveat para producción: la información pública es mínima (sin parámetros, sin benchmarks, sin datos de entrenamiento); se recomienda evaluar la calidad de síntesis en el dominio concreto antes de desplegarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-vasco-espeak
- Repositorio upstream (poisson-fish/piper-vasco, ONNX): https://huggingface.co/poisson-fish/piper-vasco/tree/main/onnx
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
