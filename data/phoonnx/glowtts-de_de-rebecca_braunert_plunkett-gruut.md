# Phoonnx/glowtts-de_de-rebecca_braunert_plunkett-gruut

## Resumen

glowtts-de_de-rebecca_braunert_plunkett-gruut es un modelo de sintesis de voz (text-to-speech) en aleman, empaquetado por Phoonnx para su libreria de inferencia ONNX. El modelo original es un Glow-TTS desarrollado por Rhasspy dentro del proyecto Larynx, una iniciativa de TTS local y de baja latencia orientada a asistentes de voz. Phoonnx se limita a convertir los pesos originales al formato ONNX y a integrarlos en su ecosistema de plugins, de modo que puedan ejecutarse tanto en Python como en OVOS (Open Voice OS).

La arquitectura Glow-TTS es un modelo de sintesis acustica de tipo normalizing flow que genera espectrogramas mel a partir de fonemas, sin necesidad de alineamientos explicitos ni de atencion autoregresiva. En este caso, la entrada de texto se procesa mediante el fonemizador gruut, que convierte el texto aleman en fonemas IPA, y el espectrograma resultante se convierte en audio mediante el vocoder hifigan-multi-vctk-small, tambien empaquetado por Phoonnx.

El interes de esta ficha es acotado pero practico: se trata de un modelo pequeno (repo de 0,1 GB), pensado para sintesis de voz offline en aleman estandar (de-DE), con una voz concreta (rebecca_braunert_plunkett). No es un modelo de lenguaje ni un sistema TTS de ultima generacion, sino una pieza de infraestructura para pipelines de voz locales. La licencia no esta registrada en el repositorio y el autor remite a la release original de Larynx para verificarla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (normalizing flow, sintesis acustica) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (TTS; entrada por frase) |
| Tipos de cuantizacion | no disponible (pesos ONNX; el repo ocupa 0,1 GB) |
| Idiomas soportados | aleman (de-DE) |
| Licencia | other (sin licencia registrada; verificar upstream) |
| Formato de pesos | ONNX |
| Vocoder | hifigan-multi-vctk-small |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Libreria de inferencia | phoonnx |
| Tamano del repositorio | 0,1 GB |
| Descargas | 21 |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

Glow-TTS es un modelo generativo basado en normalizing flows que modela la distribucion del espectrograma mel condicionada a la secuencia de fonemas. A diferencia de los sistemas TTS autoregresivos (por ejemplo Tacotron), Glow-TTS no usa atencion autoregresiva ni requiere alineamientos externos: emplea un mecanismo de busqueda de alineamiento monotono y un flujo invertible para transformar una distribucion latente simple en el espectrograma. Esto permite sintesis en paralelo, con latencia baja y duracion controlable. El modelo genera espectrogramas; la conversion a forma de onda la realiza el vocoder HiFi-GAN referenciado (hifigan-multi-vctk-small).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o ajuste fino preferencial, ya que la model card no los detalla. El modelo original procede del proyecto Larynx de Rhasspy (release v1.0), y Phoonnx lo ha empaquetado para su libreria, anadiendo la integracion con el fonemizador gruut y con el vocoder. La innovacion tecnica relevante aqui es el empaquetado ONNX y la integracion con el ecosistema phoonnx/OVOS, que permite ejecutar el modelo de forma local sin dependencias de servicios en la nube.

## Capacidades

- Sintesis de voz en aleman estandar (de-DE) a partir de texto.
- Conversion de texto a fonemas IPA mediante el fonemizador gruut (extra `scriptconv[gruut]`).
- Generacion de espectrogramas mel y sintesis de audio final mediante el vocoder HiFi-GAN.
- Ejecucion local y offline gracias al formato ONNX y a la libreria phoonnx.
- Integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Seleccion de voz concreta dentro del catalogo de phoonnx (`larynx/de-de-rebecca_braunert_plunkett-glow_tts`).
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso: es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz locales en aleman: el modelo permite sintetizar respuestas del asistente sin conexion a internet, integrado en OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, lo que encaja en despliegues de domotica o dispositivos empotrados.
- Lectura de notificaciones y alertas en sistemas de automatizacion del hogar: al ser un modelo pequeno (repo de 0,1 GB) y ejecutable en CPU, puede generar avisos hablados en tiempo real en dispositivos de bajos recursos.
- Generacion de audiolibros o locuciones para contenido en aleman: la voz rebecca_braunert_plunkett permite narrar textos largos por frases, con el fonemizador gruut normalizando numeros y abreviaturas.
- Accesibilidad para personas con discapacidad visual: sintesis de texto a voz en aleman para lectores de pantalla o aplicaciones de lectura, con inferencia local que evita enviar contenido a servicios externos.
- Prototipado de interfaces conversacionales en aleman: al integrarse en phoonnx y OVOS, sirve para validar flujos de voz antes de invertir en modelos TTS mas grandes o comerciales.
- Generacion de voces para videojuegos o aplicaciones educativas en aleman: el caracter offline y la licencia permisiva (a verificar en upstream) facilitan su inclusion en productos empaquetados.
- Investigacion en TTS: al ser un Glow-TTS ONNX de referencia, puede usarse como linea base para comparar con modelos mas recientes en tareas de sintesis en aleman.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del repositorio (0,1 GB) y la naturaleza del modelo (Glow-TTS + HiFi-GAN small), es esperable que quepa en GPU consumer con pocos GB, aunque no se confirma en la informacion.
- GPU recomendadas: no disponibles; el modelo esta disenado para ejecucion local y probablemente funcione en CPU, pero no se especifica.
- Compatibilidad con GPU consumer: no confirmada en la informacion proporcionada.
- Opciones de despliegue: phoonnx (Python) y el plugin `ovos-tts-plugin-phoonnx` para OVOS. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la informacion proporcionada. Como referencia cualitativa, dentro del mismo ecosistema Phoonnx existe la coleccion Glow-TTS con otros idiomas y voces, y el proyecto Larynx de Rhasspy incluye otras voces alemanas; sin embargo, no se aportan parametros, contexto ni benchmarks que permitan una comparacion cuantitativa.

| Modelo | Arquitectura | Idioma | Licencia | Formato | Contexto |
|---|---|---|---|---|---|
| glowtts-de_de-rebecca_braunert_plunkett-gruut | Glow-TTS | de-DE | other (sin registrar) | ONNX | no aplica |
| Otros modelos de la coleccion Glow-TTS de Phoonnx | Glow-TTS | varios | no disponible | ONNX | no aplica |
| Modelos TTS de Larynx (Rhasspy) | Glow-TTS / otros | varios | no disponible | varios | no aplica |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos; al ser una unica voz (rebecca_braunert_plunkett), la diversidad de hablantes es nula.
- Riesgo de alucinacion: en TTS el riesgo se traduce en pronunciaciones incorrectas o prosodia erronea ante texto no normalizado; el fonemizador gruut mitiga parte del problema, pero no se garantiza.
- Limitaciones de contexto o idioma: el modelo solo soporta aleman (de-DE); no es multilingue.
- Restricciones de licencia: la licencia figura como "other" y no esta registrada en el repositorio; el autor recomienda verificar la release original de Larynx antes de cualquier uso, especialmente comercial.
- Caveats para produccion: el modelo depende de phoonnx y de scriptconv con el extra gruut; la version de la libreria (`pip install --pre phoonnx`) es preliminar, lo que implica riesgo de cambios de API. Ademas, requiere descargar el vocoder por separado (aunque phoonnx lo gestiona automaticamente).
- El modelo genera espectrogramas y delega la sintesis final en el vocoder; la calidad final depende de ambos componentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-de_de-rebecca_braunert_plunkett-gruut
- Release original de Larynx (v1.0): https://github.com/rhasspy/larynx/releases/download/v1.0/de-de_rebecca_braunert_plunkett-glow_tts.tar.gz
- Coleccion Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Vocoder hifigan-multi-vctk-small: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
