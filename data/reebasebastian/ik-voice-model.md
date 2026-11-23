# reebasebastian/IK-voice-model

## Resumen

IK-voice-model es un espejo (mirror) del modelo IndicConformer 600M multilingue de AI4Bharat, convertido al formato Core ML y publicado por el usuario reebasebastian para su uso en la aplicacion Indic Keyboard. No se trata de un modelo entrenado desde cero, sino de una redistribucion byte a byte del artefacto publicado originalmente por harikanth en `harikanth/indic-conformer-600m-multilingual-coreml` (revision `942f7960b481cbfac3de3cee07598bfb7e17fc68`).

El modelo subyacente es un Conformer de 600 millones de parametros orientado a reconocimiento automatico del habla (ASR) en lenguas indicas, desarrollado por AI4Bharat y distribuido bajo licencia MIT. La aportacion de este repositorio es exclusivamente la disponibilidad del artefacto en formato Core ML, lo que permite ejecutar inferencia de voz en el ecosistema Apple (iOS, macOS) sin depender de frameworks de Python en tiempo de ejecucion.

La relevancia practica es limitada pero concreta: sirve como dependencia de la app Indic Keyboard para dictado en lenguas indicas en dispositivos Apple. No hay informacion publicada sobre el pipeline, los idiomas exactos soportados ni el rendimiento del modelo en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (encoder convolucional + self-attention), segun el modelo base IndicConformer |
| Parametros totales | 600M (heredado del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato Core ML; el mirror no documenta precision) |
| Idiomas soportados | no disponible en la ficha; el modelo base es multilingue indico |
| Licencia | MIT |
| Formato de pesos | Core ML (mirror del artefacto `harikanth/indic-conformer-600m-multilingual-coreml`) |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base `ai4bharat/indic-conformer-600m-multilingual`, un Conformer de 600 millones de parametros. El Conformer combina bloques convolucionales con self-attention para capturar dependencias locales y globales en secuencias de audio, y es un diseno habitual en ASR moderno. No se dispone en la informacion proporcionada de detalles sobre el corpus de entrenamiento, el numero de horas de audio, la composicion del dataset ni si hubo etapas de ajuste fino supervisado adicionales.

Este repositorio concreto no entrena ni modifica el modelo: es una copia byte a byte del artefacto Core ML publicado por harikanth, con el codigo de inferencia Swift asociado (IndicSpeech, Apache-2.0) alojado en GitHub. La innovacion tecnica relevante es la conversion a Core ML, que habilita ejecucion nativa en Apple Silicon y en dispositivos iOS con aceleracion por Neural Engine, aunque no se documentan en la ficha los detalles de dicha conversion (precision, operaciones soportadas, tamano final de los pesos).

## Capacidades

- Reconocimiento automatico del habla (ASR) en lenguas indicas, heredado del modelo base multilingue.
- Ejecucion nativa en el ecosistema Apple mediante Core ML.
- Integracion con la aplicacion Indic Keyboard para dictado por voz.
- No se documentan en la informacion disponible capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes ni modo thinking.
- No se documenta el conjunto exacto de idiomas cubiertos en esta ficha.

## Casos de uso

- Dictado por voz en Indic Keyboard: el modelo se usa como motor ASR en la app para transcribir habla a texto en lenguas indicas sobre iOS y macOS.
- Integracion en aplicaciones iOS nativas: al estar en formato Core ML, puede cargarse con el framework Core ML y ejecutarse en dispositivo sin backend Python.
- Procesamiento offline de audio: al ejecutarse en local, permite transcripcion sin enviar audio a servidores externos, util en escenarios de privacidad.
- Prototipado de interfaces de voz en Apple Silicon: sirve como punto de partida para experimentar con ASR indico en macOS.
- Aplicaciones de accesibilidad: transcripcion de voz a texto para usuarios con movilidad reducida en entornos Apple.
- Investigacion comparativa de ASR indico en dispositivos: permite medir latencia y consumo en hardware Apple frente a despliegues en servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para este artefacto Core ML; el modelo base tiene 600M parametros, lo que en precision FP16 supondria del orden de 1,2 GB de pesos, pero la ficha no confirma la precision del mirror.
- GPU recomendadas: no disponible; el formato Core ML esta pensado para Apple Silicon (M1/M2/M3/M4) y Neural Engine en iPhone/iPad.
- Compatibilidad con GPU de consumo: no confirmada para este artefacto; el modelo base podria ejecutarse en GPUs consumer mediante frameworks genericos, pero no se documenta.
- Opciones de despliegue: Core ML (framework nativo de Apple) y el codigo Swift de IndicSpeech; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| reebasebastian/IK-voice-model | 600M | no disponible | MIT | Core ML | Hugging Face (mirror) |
| ai4bharat/indic-conformer-600m-multilingual | 600M | no disponible | MIT | no disponible en esta ficha | Hugging Face |
| harikanth/indic-conformer-600m-multilingual-coreml | 600M | no disponible | MIT (modelo base) | Core ML | Hugging Face |

## Limitaciones y advertencias

- Es un mirror, no un modelo original: cualquier problema de calidad, sesgo o rendimiento proviene del modelo base o de la conversion Core ML, no de este repositorio.
- No se documentan sesgos conocidos ni evaluaciones de equidad en la informacion disponible.
- Riesgo de alucinacion y errores de transcripcion inherente a todo sistema ASR; no hay tasas de error publicadas en esta ficha.
- Cobertura de idiomas no confirmada en este repositorio; conviene verificar en el modelo base antes de usarlo en produccion.
- La licencia MIT permite uso comercial, pero el codigo Swift de inferencia (IndicSpeech) esta bajo Apache-2.0 y debe cumplirse por separado.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en la misma fecha; no hay evidencia de uso o mantenimiento por parte de la comunidad.
- No se documenta el pipeline de Hugging Face ni la precision numerica del artefacto Core ML, lo que dificulta estimar consumo y latencia en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/reebasebastian/IK-voice-model
- Modelo base: https://huggingface.co/ai4bharat/indic-conformer-600m-multilingual
- Conversion Core ML original: https://huggingface.co/harikanth/indic-conformer-600m-multilingual-coreml
- Codigo de inferencia Swift (IndicSpeech): https://github.com/harikanthl/IndicSpeech
