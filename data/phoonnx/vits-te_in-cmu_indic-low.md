# Phoonnx/vits-te_in-cmu_indic-low

## Resumen

vits-te_in-cmu_indic-low es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Mycroft AI para el motor Mimic3 y empaquetado por Phoonnx en formato ONNX para su uso con la librería phoonnx. El modelo sintetiza voz en telugu (te-IN) a partir de texto en ese idioma, previa conversión a fonemas mediante el fonemizador Epitran.

Se trata de un modelo compacto (el repositorio ocupa 0,1 GB) orientado a despliegue ligero en entornos de asistencia por voz, como el ecosistema OVOS/Mycroft. Su relevancia radica en ofrecer una voz de baja latencia para una lengua con relativamente pocos recursos TTS, con licencia CC-BY-SA-4.0 y pesos en ONNX que facilitan la inferencia en CPU sin dependencias de frameworks pesados.

La información publicada no detalla el número de parámetros, la longitud de contexto ni los datos de entrenamiento, por lo que varios apartados de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; entrada por frase) |
| Tipos de cuantizacion | no disponible; pesos distribuidos en ONNX (repo de 0,1 GB) |
| Idiomas soportados | telugu (te-IN) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas Epitran en alfabeto IPA |
| Autor original | Mycroft AI (Mimic3) |
| Empaquetado | Phoonnx |
| Libreria | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de síntesis de voz que combina un codificador de texto, un prior variacional condicionado por alineamiento monotónico y un decodificador generativo adversario (GAN) con discriminadores de múltiples periodos y escalas. Este diseño permite generar waveforms directamente desde fonemas sin un vocoder externo separado, lo que reduce la latencia y simplifica el despliegue.

El modelo procede del catálogo Mimic3 de Mycroft AI, concretamente de la voz te_IN/cmu-indic_low, y Phoonnx lo ha reempaquetado en ONNX para su ejecución con su librería. La model card no proporciona información sobre el número de tokens de entrenamiento, la composición del corpus (aunque el nombre cmu-indic sugiere origen en el corpus CMU Indic), el uso de RLHF/DPO ni detalles del proceso de alineamiento. La entrada de texto se normaliza y convierte a fonemas IPA mediante `EpitranPhonemizer` de la librería scriptconv.

## Capacidades

- Síntesis de voz en telugu (te-IN) a partir de texto, generando audio WAV.
- Conversión de texto a fonemas IPA mediante Epitran como paso previo a la síntesis.
- Ejecución en ONNX, lo que permite inferencia sin PyTorch en tiempo de ejecución.
- Integración nativa con el ecosistema OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`.
- Uso programático en Python a través de `TTSModelManager` de phoonnx.
- No se documentan capacidades de clonación de voz, control de estilo, emoción, tool calling ni razonamiento multi-paso (no aplicables a un modelo TTS).

## Casos de uso

- Asistentes de voz en telugu: integración como motor TTS en OVOS/Mycroft para responder a comandos de voz en entornos domésticos, gracias a su formato ONNX y su bajo peso.
- Lectura de notificaciones y alertas: síntesis de mensajes cortos en aplicaciones de monitorización o domótica para usuarios telugu-hablantes.
- Accesibilidad: conversión de texto a voz para lectores de pantalla o aplicaciones de asistencia a personas con discapacidad visual en telugu.
- Sistemas de información pública: generación de avisos hablados en estaciones, aeropuertos o servicios municipales dirigidos a población telugu.
- Prototipado de interfaces conversacionales: uso en fase de desarrollo para validar flujos de voz sin depender de servicios TTS en la nube.
- Aplicaciones educativas: lectura en voz alta de materiales didácticos o ejercicios de pronunciación en telugu.
- Despliegue en dispositivos de borde: al ser un modelo pequeño en ONNX, puede ejecutarse en hardware limitado (Raspberry Pi, mini-PC) sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de un modelo ONNX de 0,1 GB, es probable que quepa en memoria de CPU, pero no se confirma en la documentación.
- GPU recomendadas: no disponibles; el modelo está pensado para inferencia en CPU dentro del ecosistema phoonnx/OVOS.
- Cabe en GPU consumer: previsiblemente sí por su tamaño reducido, aunque no se especifica.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y runtime ONNX subyacente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto/entrada |
|---|---|---|---|---|---|
| vits-te_in-cmu_indic-low (este) | VITS | Telugu (te-IN) | ONNX | CC-BY-SA-4.0 | Fonemas IPA (Epitran) |
| Otras voces Mimic3 te_IN | VITS | Telugu (te-IN) | ONNX | CC-BY-SA-4.0 (según upstream) | Fonemas |
| Voces VITS de la colección Phoonnx | VITS | Varios | ONNX | Variable | Fonemas |
| Modelos TTS multilingües comerciales | no disponible | Múltiples | no disponible | Propietaria | Texto/fonemas |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo monoidioma: solo soporta telugu (te-IN); no se documenta cobertura de otros idiomas.
- Calidad etiquetada como "low": el sufijo low del nombre sugiere una variante de menor calidad o tamaño dentro del catálogo Mimic3, adecuada para prototipos más que para producción de alta fidelidad.
- Dependencia de Epitran para la fonemización: errores en la conversión a IPA afectarán directamente a la pronunciación.
- Licencia CC-BY-SA-4.0: permite uso comercial con atribución y compartir-igual, lo que obliga a licenciar obras derivadas bajo la misma licencia.
- No se documentan sesgos específicos, pero al derivar de un corpus (presumiblemente CMU Indic) puede reflejar sesgos de pronunciación o de registro de dicho corpus.
- No se dispone de información sobre robustez ante texto ruidoso, números, siglas o puntuación.
- Riesgo de alucinación no aplicable en el sentido de generación de texto; sí puede producir pronunciaciones incorrectas ante entradas fuera de distribución.
- Sin datos de benchmarks ni de latencia, la idoneidad para producción a gran escala no está verificada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-te_in-cmu_indic-low
- Repositorio upstream (MycroftAI/mimic3-voices, voz te_IN/cmu-indic_low): https://github.com/MycroftAI/mimic3-voices/tree/master/voices/te_IN/cmu-indic_low
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
