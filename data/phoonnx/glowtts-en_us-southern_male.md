# Phoonnx/glowtts-en_us-southern_male

## Resumen

GlowTTS-en_us-southern_male es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura Glow-TTS, desarrollado originalmente por Rhasspy dentro del proyecto Larynx y reempaquetado por Phoonnx en formato ONNX para su libreria de inferencia `phoonnx`. El modelo genera espectrogramas mel a partir de fonemas IPA procesados por el fonemizador gruut, que posteriormente son convertidos a audio por el vocoder HiFi-GAN multi-VCTK small. La voz corresponde a un hablante masculino de ingles estadounidense con acento sureño.

El modelo resuelve el problema de sintesis de voz offline y ligera: con un tamano de repositorio de aproximadamente 0,1 GB, esta pensado para ejecutarse en entornos con recursos limitados, como asistentes de voz embebidos (OVOS/Mycroft), dispositivos de borde o aplicaciones de escritorio que necesitan TTS sin dependencia de servicios en la nube. Su integracion con `phoonnx` y `scriptconv` permite un pipeline completo de normalizacion de texto, fonemizacion y sintesis.

Es relevante ahora por su caracter practico: es un modelo pequeno, en ONNX, con licencia sin especificar que requiere verificacion upstream, y con una API Python sencilla que lo hace directamente desplegable en pipelines de TTS existentes. No es un modelo de proposito general ni compite con sistemas neuronales grandes de sintesis; su valor esta en la ligereza y la integracion con el ecosistema de asistentes de voz open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (texto a espectrograma mel) + vocoder HiFi-GAN multi-VCTK small |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | en-US (ingles estadounidense, acento sureño) |
| Licencia | other (sin licencia registrada; verificar upstream) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Glow-TTS, un modelo generativo normalizing flow que transforma fonemas en espectrogramas mel de forma no autorregresiva. La entrada de texto se procesa mediante el fonemizador gruut, que convierte el texto normalizado en fonemas IPA; estos se alinean con el espectrograma objetivo mediante busqueda de alineamiento monotono. La salida del modelo Glow-TTS es un espectrograma que se convierte en audio mediante el vocoder HiFi-GAN multi-VCTK small, descargado automaticamente por `phoonnx`.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El modelo original proviene del release v1.0 de Larynx de Rhasspy (`en-us_southern_english_male-glow_tts.tar.gz`), y Phoonnx lo ha reempaquetado en ONNX para su libreria. La innovacion tecnica destacable es el empaquetado ligero y la integracion con el pipeline de `scriptconv` para normalizacion y fonemizacion, ademas de la gestion automatica del vocoder.

## Capacidades

- Sintesis de voz a partir de texto en ingles estadounidense con acento sureño masculino.
- Generacion de espectrogramas mel y conversion a audio WAV mediante vocoder HiFi-GAN.
- Fonemizacion mediante gruut con alfabeto IPA.
- Integracion con el ecosistema OVOS/Mycroft a traves del plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion offline en Python mediante la libreria `phoonnx`.
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- No soporta vision, audio de entrada ni modo thinking.
- Capacidad multilingue limitada: solo en-US.

## Casos de uso

- Asistentes de voz embebidos: el modelo se integra en OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`, permitiendo sintesis local sin conexion a internet en dispositivos de recursos limitados.
- Lectura de notificaciones y alertas en aplicaciones de escritorio: con un repositorio de 0,1 GB y salida WAV directa, es adecuado para anuncios de sistema en tiempo real.
- Accesibilidad para personas con discapacidad visual: sintesis de texto a voz en lectores de pantalla o aplicaciones de asistencia, con voz masculina sureña en ingles.
- Generacion de audio para prototipos y demos: su API Python sencilla permite generar locuciones rapidamente en pipelines de desarrollo sin infraestructura GPU.
- Sistemas de respuesta interactiva de voz (IVR) en entornos controlados: sintesis de mensajes pregrabados dinamicamente en ingles estadounidense.
- Pruebas de integracion en pipelines de TTS: al estar en ONNX, se puede validar el flujo completo de normalizacion, fonemizacion y sintesis antes de migrar a modelos mayores.
- Educacion y aprendizaje de ingles: generacion de pronunciacion con acento sureño para materiales didacticos o comparativas dialectales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB, lo que sugiere requisitos muy bajos, probablemente inferencia en CPU.
- GPU recomendadas: no disponible; por tamano, cabe en cualquier GPU consumer moderna e incluso en CPU.
- Cabe en GPU consumer: si, por el tamano del repositorio (0,1 GB) es esperable que funcione en GPU integradas y CPU.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft; formato ONNX ejecutable con ONNX Runtime.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| glowtts-en_us-southern_male | no disponible | no aplica | no disponible | other (sin registrar) | Hugging Face (Phoonnx) |
| Otras voces Glow-TTS de la coleccion Phoonnx | no disponible | no aplica | no disponible | other | Hugging Face (coleccion Glow-TTS) |
| Modelos TTS neuronales grandes (p. ej. VITS, FastSpeech2) | no disponible | no aplica | no disponible | variable | variable |

No se dispone de datos comparativos de rendimiento entre este modelo y alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no registrada: la model card indica explicitamente que no hay licencia registrada y recomienda verificar el release upstream antes de su uso; esto supone un riesgo para uso comercial.
- Sesgos conocidos: no disponible; al ser una voz sintetica especifica (masculina, sureña, en-US), no representa la diversidad de hablantes.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero la sintesis puede producir artefactos o pronunciaciones incorrectas en palabras fuera del vocabulario o nombres propios.
- Limitaciones de idioma: solo en-US; no soporta otros idiomas ni variantes dialectales.
- Limitaciones de contexto: no aplica; es un modelo TTS sin ventana de contexto textual.
- Caveat para produccion: el modelo depende de `phoonnx` y `scriptconv` (con extra `gruut`), y descarga el vocoder automaticamente; conviene fijar versiones para reproducibilidad.
- El acento sureño puede no ser adecuado para aplicaciones que requieran ingles neutro o estandar.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-southern_male
- Upstream Larynx (release v1.0): https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_southern_english_male-glow_tts.tar.gz
- Vocoder HiFi-GAN multi-VCTK small: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
