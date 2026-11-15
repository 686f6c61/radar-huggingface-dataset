# Phoonnx/hifigan-be_by-common

## Resumen

hifigan-be_by-common es un vocoder HiFi-GAN desarrollado originalmente por Coqui y empaquetado por Phoonnx para su biblioteca de síntesis de voz en ONNX. Su función no es generar texto a partir de texto, sino convertir espectrogramas mel en forma de onda de audio, es decir, es la última etapa de un pipeline TTS. En concreto, este artefacto está asociado al modelo acústico glowtts-be_by-common y a la voz `coqui-be-common-voice-glow-tts`, por lo que su ámbito de aplicación es el bielorruso (`be-BY`).

El modelo se distribuye como un artefacto ONNX dentro de la colección de vocoders de Phoonnx, con un tamaño de repositorio de aproximadamente 0,1 GB. No se trata de un modelo de lenguaje ni de un sistema TTS completo: es un componente de inferencia especializado que transforma representaciones espectrales en audio inteligible. Su relevancia actual es práctica: permite desplegar pipelines TTS de Coqui en entornos donde se prefiere ONNX Runtime, y cubre una lengua de bajos recursos como el bielorruso.

La información disponible sobre arquitectura interna, número de parámetros o datos de entrenamiento es limitada, ya que la model card se centra en el empaquetado y en el uso dentro de phoonnx más que en los detalles técnicos del vocoder original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HiFi-GAN (vocoder), empaquetado en ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (vocoder, opera sobre espectrogramas) |
| Tipos de cuantizacion | no disponible (formato ONNX; no se detallan variantes) |
| Idiomas soportados | bielorruso (`be-BY`) |
| Licencia | CC-BY-SA 4.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo es un vocoder HiFi-GAN, una arquitectura generativa adversarial diseñada para sintetizar forma de onda de audio a partir de espectrogramas mel. HiFi-GAN emplea un generador convolucional que upsampla la representación espectral hasta la frecuencia de muestreo de audio, junto con discriminadores multiperiodo y multiescala durante el entrenamiento. El artefacto publicado aquí es la conversión a ONNX del vocoder original de Coqui, empaquetado por Phoonnx para su uso con ONNX Runtime.

El modelo procede del release v0.16.6 de Coqui TTS, concretamente del paquete `vocoder_models--be--common-voice--hifigan.zip`, entrenado sobre datos de Common Voice en bielorruso. No se dispone en la información proporcionada de detalles sobre el número de tokens, composición exacta del dataset, horas de audio, ni sobre si se aplicaron técnicas de refinamiento posteriores. Tampoco se documentan innovaciones técnicas adicionales más allá de las propias de HiFi-GAN y de su conversión a ONNX.

## Capacidades

- Conversión de espectrogramas mel a forma de onda de audio (vocoder).
- Integración en pipelines TTS de dos etapas: modelo acústico (Glow-TTS) más vocoder.
- Ejecución mediante ONNX Runtime, lo que facilita el despliegue en Python y en el ecosistema OVOS.
- Soporte específico para la voz bielorrusa `coqui-be-common-voice-glow-tts`.
- Descarga automática gestionada por phoonnx al usar las voces asociadas, sin paso manual adicional.
- No incluye generación de texto, razonamiento, código, matemáticas, visión, tool calling ni capacidades de agente.
- No dispone de modo de razonamiento (thinking mode), audio de entrada ni otras capacidades multimodales.

## Casos de uso

- Síntesis de voz en bielorruso: combinado con glowtts-be_by-common, permite generar audio inteligible a partir de texto en bielorruso, cubriendo una lengua con pocos recursos en el ecosistema TTS.
- Asistentes de voz para OVOS: al estar empaquetado para phoonnx, se integra en el stack de asistentes de voz de TigreGotico, aportando la etapa de vocoder sin configuración adicional.
- Lectura de contenido en aplicaciones de accesibilidad: convierte texto bielorruso en audio para lectores de pantalla o sistemas de lectura automática.
- Generación de audiolibros y contenido narrado: permite producir audio de forma local a partir de texto, sin depender de servicios en la nube.
- Prototipado de pipelines TTS en entornos con ONNX Runtime: útil cuando se prefiere un runtime ONNX frente a PyTorch para reducir dependencias o mejorar la portabilidad.
- Investigación en TTS de bajos recursos: sirve como componente de referencia para experimentos con voces bielorrusas y para comparar vocoders HiFi-GAN frente a otras alternativas.
- Despliegue en dispositivos con recursos limitados: el tamaño reducido del repositorio (unos 0,1 GB) y el formato ONNX facilitan su inclusión en entornos de borde, aunque no se dispone de cifras de latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con cifras concretas; por el tamaño del repositorio (aproximadamente 0,1 GB), el modelo es ligero y probablemente quepa en GPU de gama baja, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; el formato ONNX y el tamaño reducido sugieren que podría ejecutarse en GPUs de consumo e incluso en CPU, pero no hay datos oficiales.
- Opciones de despliegue: ONNX Runtime a través de phoonnx; también es posible usar el modelo original de Coqui TTS en PyTorch a partir del paquete upstream.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Formato | Licencia | Contexto/uso |
|---|---|---|---|---|---|
| hifigan-be_by-common | Vocoder HiFi-GAN | Bielorruso | ONNX | CC-BY-SA 4.0 | Etapa de vocoder en pipelines TTS |
| glowtts-be_by-common | Modelo acústico Glow-TTS | Bielorruso | ONNX | no disponible en la información | Genera espectrogramas; se combina con este vocoder |
| Vocoders de la colección Phoonnx | Vocoders HiFi-GAN para otras lenguas | Varias | ONNX | CC-BY-SA 4.0 (según colección) | Misma función, distinto idioma |

No se dispone de datos de rendimiento comparativo (métricas objetivas o subjetivas) entre este vocoder y alternativas de otros idiomas o arquitecturas.

## Limitaciones y advertencias

- Ámbito lingüístico restringido: está diseñado para bielorruso (`be-BY`) y no se garantiza su funcionamiento con otras lenguas.
- No es un modelo TTS completo: requiere un modelo acústico (Glow-TTS) que genere los espectrogramas de entrada.
- Licencia CC-BY-SA 4.0: permite uso comercial, pero obliga a atribuir y a compartir las obras derivadas bajo la misma licencia; conviene revisar las implicaciones antes de integrarlo en productos propietarios.
- Sesgos: no se documentan sesgos específicos, pero al entrenarse con Common Voice pueden heredar sesgos de la distribución de hablantes del corpus.
- Alucinación y artefactos: como vocoder generativo, puede producir artefactos de audio o inestabilidades ante espectrogramas fuera de distribución; no se documentan tasas de error.
- Falta de documentación técnica: no se publican número de parámetros, datos de entrenamiento ni métricas de calidad, lo que dificulta la evaluación rigurosa.
- Soporte limitado en la comunidad: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que el soporte y el mantenimiento pueden ser escasos.
- Dependencia del ecosistema phoonnx: el uso previsto está ligado a la biblioteca phoonnx; fuera de ella, la integración requiere trabajo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/hifigan-be_by-common
- Modelo acústico asociado: https://huggingface.co/Phoonnx/glowtts-be_by-common
- Paquete upstream de Coqui TTS: https://github.com/coqui-ai/TTS/releases/download/v0.16.6/vocoder_models--be--common-voice--hifigan.zip
- Biblioteca phoonnx: https://github.com/TigreGotico/phoonnx
- Herramientas de normalización y fonemización: https://github.com/TigreGotico/scriptconv
- Colección de vocoders de Phoonnx: https://huggingface.co/collections/Phoonnx/vocoders-6af8eab202014765d7fce3c9
