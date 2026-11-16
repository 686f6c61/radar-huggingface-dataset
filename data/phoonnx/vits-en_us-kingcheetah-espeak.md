# Phoonnx/vits-en_us-kingcheetah-espeak

## Resumen

vits-en_us-kingcheetah-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx en formato ONNX para su uso con la libreria phoonnx. El modelo original procede del repositorio HAV0X1014/KF-PiperTTS-voices, en la variante KingCheetah, y su autor original es agentvibe. La voz esta orientada al ingles estadounidense (en-US) y toma como entrada fonemas espeak en alfabeto IPA, no texto plano directo.

El problema que resuelve es la sintesis de voz local y ligera: al estar distribuido como ONNX con un tamano de repositorio de 0,1 GB, esta pensado para inferencia en entornos con recursos limitados, sin depender de servicios en la nube. Su integracion con phoonnx y con el ecosistema OVOS (Open Voice OS) lo hace util para asistentes de voz autoalojados y aplicaciones de lectura en voz alta.

Es relevante ahora por su licencia MIT, que permite uso comercial sin restricciones significativas, y por su empaquetado especifico para una libreria de inferencia ONNX mantenida activamente. No obstante, la informacion publicada es escasa: no se detallan parametros, datos de entrenamiento ni resultados de benchmarks, y el modelo registra cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | no disponible (distribucion en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | ingles estadounidense (en-US) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx (Python, OVOS, phoonnx.js en navegador) |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz end-to-end que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial entrenado con perdidas de reconstruccion y de confrontacion. La entrada del modelo son fonemas en alfabeto IPA obtenidos mediante espeak-ng (o el port espyak), no texto en crudo; la conversion de texto a fonemas la realiza la libreria scriptconv a traves de su `EspeakPhonemizer`.

No se dispone de informacion sobre el numero de parametros, el volumen de datos de entrenamiento, la composicion del corpus, la duracion total de audio utilizada ni si se aplicaron tecnicas de ajuste como RLHF o DPO (no aplicables de forma habitual en TTS). Tampoco se documentan innovaciones tecnicas adicionales mas alla de las propias de VITS. El modelo se distribuye como artefacto ONNX ya entrenado, sin pesos en otros formatos ni scripts de entrenamiento en la informacion disponible.

## Capacidades

- Sintesis de voz a partir de texto en ingles estadounidense, previa conversion a fonemas espeak en IPA.
- Generacion de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Integracion como plugin de TTS en OVOS mediante `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Ejecucion en navegador a traves de phoonnx.js, con entrada espeak o unicode.
- Inferencia local en formato ONNX, sin dependencia de servicios externos.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, vision, audio de entrada ni modo thinking; son capacidades ajenas a un modelo TTS.
- Capacidad multilingue limitada al ingles estadounidense; no se declaran otros idiomas.

## Casos de uso

- Asistentes de voz autoalojados con OVOS: el modelo se instala como plugin `ovos-tts-plugin-phoonnx` y se selecciona la voz `piper_community/agentvibe/en-US_KingCheetah` en la configuracion, lo que permite respuestas habladas en local sin enviar texto a terceros.
- Lectura en voz alta de articulos o documentacion: la API de phoonnx permite sintetizar cada frase a un fichero WAV, adecuada para pipelines de conversion de texto a audio por lotes.
- Accesibilidad en aplicaciones web: phoonnx.js ejecuta la voz en el navegador, de modo que se puede ofrecer lectura de contenido sin backend de TTS.
- Prototipado rapido de interfaces conversacionales: el tamano reducido del repositorio (0,1 GB) y el formato ONNX facilitan desplegar una voz en maquinas de desarrollo sin GPU dedicada.
- Generacion de locuciones para contenido audiovisual de baja latencia: al ser una voz VITS ligera, encaja en la produccion de narraciones cortas en ingles para videos o podcasts internos.
- Sistemas de notificacion por voz en dispositivos embebidos: la inferencia ONNX local permite emitir avisos hablados en ingles sin conexion a red.
- Pruebas de integracion en CI: se puede invocar la sintesis en tests automatizados para verificar que el pipeline de audio produce ficheros WAV validos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del repositorio (0,1 GB) se trata de un modelo ligero que previsiblemente cabe en memoria de CPU, pero no se documentan cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no documentada; el formato ONNX y el tamano reducido sugieren viabilidad en CPU, sin confirmacion del autor.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS y phoonnx.js en navegador. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo TTS de este tipo.
- Latencia y throughput: no disponibles.
- Dependencia externa: requiere espeak-ng instalado en el sistema (`apt install espeak-ng`) o la extra `phoonnx[espeak]` con el port espyak; el autor advierte que algunos fonemas de espyak difieren de espeak-ng y pueden provocar pronunciaciones incorrectas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Contexto / notas |
|---|---|---|---|---|---|
| vits-en_us-kingcheetah-espeak | VITS | en-US | MIT | ONNX | Empaquetado para phoonnx; entrada por fonemas espeak |
| Otras voces VITS de la coleccion Phoonnx | VITS | variable | variable segun cada voz | ONNX | Mismo pipeline de inferencia; comparacion directa disponible en la coleccion VITS de Phoonnx |
| Piper TTS (voces comunitarias) | VITS | multiples | variable | ONNX | Familia de origen del modelo (KF-PiperTTS-voices); ecosistema de referencia para TTS ligero local |

No se dispone de datos de rendimiento ni de parametros para establecer una comparacion cuantitativa con alternativas concretas; la comparacion anterior es estructural.

## Limitaciones y advertencias

- Solo soporta ingles estadounidense; no hay soporte multilingue declarado.
- La entrada debe ser fonemas espeak en IPA; el texto en crudo requiere el front-end de scriptconv, y una conversion incorrecta degrada la pronunciacion.
- El uso del port espyak en lugar de espeak-ng puede producir errores de pronunciacion en algunas palabras, segun advierte el propio autor.
- No se documentan sesgos conocidos, pero al no publicarse datos de entrenamiento no es posible evaluar sesgos de acento, genero o procedencia del corpus de voz.
- Riesgo de alucinacion en el sentido de prosodia o pronunciacion incorrecta en palabras fuera del dominio de entrenamiento; no hay evaluaciones publicadas que lo cuantifiquen.
- Licencia MIT: permite uso comercial y modificacion con atribucion; el autor remite a los terminos de la release original upstream, por lo que conviene verificar la cadena de licencias del repositorio HAV0X1014/KF-PiperTTS-voices.
- Modelo con cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en produccion ni de validacion por la comunidad.
- Ausencia total de benchmarks, parametros y datos de entrenamiento publicados, lo que dificulta evaluar su calidad frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-kingcheetah-espeak
- Repositorio upstream (KingCheetah): https://huggingface.co/HAV0X1014/KF-PiperTTS-voices/tree/main/KingCheetah
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js (navegador): https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
