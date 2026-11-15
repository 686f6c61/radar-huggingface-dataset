# Phoonnx/matcha-cat-multispeaker-hifigan

## Resumen

matcha-cat-multispeaker-hifigan es un modelo de síntesis de voz (text-to-speech) derivado del repositorio Phoonnx/phoonnx-matcha, publicado por el autor Phoonnx. Se trata de un artefacto ONNX empaquetado para su uso con la librería phoonnx, un runtime de TTS orientado a despliegue ligero. El modelo combina un acústico de tipo Matcha con un vocoder HiFi-GAN fusionado en un único grafo, lo que simplifica la cadena de inferencia.

El modelo está orientado a la síntesis multihablante en catalán, según se desprende de la referencia a la fuente original projecte-aina/matxa-tts-cat-multispeaker y del uso de espeak ca como fonemizador. El tamaño del repositorio es de aproximadamente 0,1 GB, lo que lo sitúa en la categoría de modelos ligeros aptos para CPU y dispositivos de recursos limitados.

No se dispone de información sobre arquitectura detallada, número de parámetros, longitud de contexto ni datos de entrenamiento más allá de lo indicado en la model card. La relevancia actual radica en su formato ONNX listo para producción y su integración con el ecosistema phoonnx, que facilita el despliegue en entornos embebidos y sistemas de agentes de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matcha (acústico) + HiFi-GAN fusionado (vocoder), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | catalán (espeak ca), según la model card |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX (runtime phoonnx) |

## Arquitectura y entrenamiento

La arquitectura combina un modelo acústico de tipo Matcha, que genera representaciones mel a partir de fonemas, con un vocoder HiFi-GAN fusionado en el mismo grafo ONNX. La fusión del vocoder dentro del modelo simplifica el pipeline de inferencia y reduce la latencia al evitar llamadas separadas entre etapas.

El fonemizador utilizado es espeak con locale ca, lo que confirma el enfoque multilingüe limitado al catalán para esta variante. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO. El modelo deriva del proyecto original projecte-aina/matxa-tts-cat-multispeaker, del que se hereda la licencia GPL-3.0.

No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal en la información disponible.

## Capacidades

- Síntesis de voz multihablante en catalán a partir de texto de entrada.
- Generación de audio mediante vocoder HiFi-GAN fusionado, con salida de forma de onda directamente utilizable.
- Fonemización mediante espeak con locale ca.
- Integración con la librería phoonnx para despliegue en runtime ligero.
- Identificador de voz disponible: OpenVoiceOS/matxa-cat-multispeaker-hifigan.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking.

## Casos de uso

- Síntesis de voz para asistentes en catalán: el modelo permite generar respuestas habladas en catalán dentro de pipelines de agentes de voz, con vocoder fusionado que reduce la latencia entre etapas.
- Lectura de contenido en catalán: conversión de artículos, noticias o documentación a audio para aplicaciones de accesibilidad, aprovechando el fonemizador espeak ca.
- Sistemas embebidos y dispositivos de recursos limitados: el tamaño del repositorio (~0,1 GB) y el formato ONNX lo hacen apto para despliegue en CPU o hardware de bajo consumo mediante phoonnx.
- Integración con OpenVoiceOS: el identificador de voz OpenVoiceOS/matxa-cat-multispeaker-hifigan permite su uso directo en el ecosistema de asistentes de voz de código abierto.
- Generación de audio multihablante para contenido educativo: permite alternar voces en catalán en materiales didácticos o cursos.
- Prototipado rápido de TTS: al estar empaquetado como ONNX y con runtime phoonnx, se puede integrar en pruebas y demos sin necesidad de infraestructura GPU dedicada.
- Localización de aplicaciones al catalán: sustitución de voces comerciales por una solución de código abierto bajo GPL-3.0 para productos que requieran catalán.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: probable dado el tamaño del repositorio (~0,1 GB) y el formato ONNX, pero no confirmado en la información disponible.
- Opciones de despliegue: runtime phoonnx (librería phoonnx); otras opciones como vLLM, llama.cpp, Ollama o TGI no aplican a este tipo de modelo TTS.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| matcha-cat-multispeaker-hifigan | Matcha + HiFi-GAN ONNX | catalán | ONNX | GPL-3.0 | Hugging Face (Phoonnx) |
| projecte-aina/matxa-tts-cat-multispeaker | Matcha + vocoder (original) | catalán | no disponible | no disponible (heredada GPL-3.0 según la card) | Hugging Face |
| Alternativas comparables de TTS en catalán | no disponible | catalán | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Idioma limitado: la variante está configurada para catalán con espeak ca; no se documentan otros idiomas.
- Licencia GPL-3.0: el uso comercial implica obligaciones de copyleft; debe revisarse antes de integrar en productos propietarios.
- Sin datos de entrenamiento publicados: no se puede evaluar la composición del dataset ni posibles sesgos de voz, acento o género.
- Riesgo de alucinación acústica: en TTS, entradas fuera de dominio o fonemas no cubiertos pueden producir artefactos de pronunciación; no cuantificado en la información disponible.
- Modelo multihablante sin lista explícita de voces: solo se documenta un identificador de voz (OpenVoiceOS/matxa-cat-multispeaker-hifigan), sin detalle de cuántas voces contiene.
- Sin benchmarks: no hay métricas objetivas (MOS, WER, latencia) publicadas para esta variante.
- Dependencia de phoonnx y espeak: requiere el runtime phoonnx y el fonemizador espeak ca para funcionar correctamente.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/matcha-cat-multispeaker-hifigan
- Repositorio fuente phoonnx-matcha: https://huggingface.co/Phoonnx/phoonnx-matcha
- Runtime phoonnx: https://github.com/TigreGotico/phoonnx
- Proyecto original: https://huggingface.co/projecte-aina/matxa-tts-cat-multispeaker
