# Phoonnx/vits-uk_ua-m_ailabs-low-graphemes

## Resumen

`vits-uk_ua-m_ailabs-low-graphemes` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Mycroft AI para su conjunto de voces de Mimic 3 y empaquetado por Phoonnx en formato ONNX para su uso con la librería `phoonnx`. El modelo sintetiza voz en ucraniano (`uk-UA`) a partir de texto de entrada, operando directamente sobre grafemas mediante el fonemizador `GraphemePhonemizer` de la librería `scriptconv`.

Se trata de un modelo "low" (de baja calidad o bajo coste computacional, según la nomenclatura de las voces de Mimic 3), lo que implica un compromiso entre calidad de audio y requisitos de recursos. Al estar empaquetado en ONNX y orientado a la librería Phoonnx, está pensado para su integración en asistentes de voz y sistemas de síntesis ligeros, incluido el ecosistema OVOS (Open Voice OS) mediante el plugin `ovos-tts-plugin-phoonnx`.

Su relevancia actual radica en que cubre una lengua con pocos recursos TTS de calidad (ucraniano) y ofrece un artefacto listo para producción en un formato ejecutable (ONNX) con una licencia CC-BY-SA-4.0, lo que facilita su reutilización en proyectos de código abierto. El repositorio es de pequeño tamaño (0,1 GB) y no registra descargas ni "likes" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, opera por frase o segmento de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | ucraniano (`uk-UA`) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |
| Entrada de texto | grafemas (caracteres del texto) |
| Autor original | Mycroft AI |
| Empaquetado | Phoonnx |
| Tamano del repositorio | ~0,1 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS, un sistema de síntesis de voz extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador generativo basado en flujos normalizadores y un discriminador adversarial entrenado con pérdidas de reconstrucción y adversariales. VITS es conocido por generar audio de forma directa (sin vocoder separado en tiempo de inferencia) y por su capacidad de producir habla natural con un único paso de red.

El modelo procede de la voz `uk_UK/m-ailabs_low` del repositorio `mimic3-voices` de Mycroft AI, lo que indica que fue entrenado dentro del proyecto Mimic 3 sobre datos del corpus AILABS (según la nomenclatura de la voz). No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente a TTS). La innovación técnica destacable es el uso de un front-end basado en grafemas (`GraphemePhonemizer`) en lugar de un fonemizador basado en fonemas, lo que simplifica el pipeline de conversión de texto a entrada del modelo.

## Capacidades

- Síntesis de voz en ucraniano (`uk-UA`) a partir de texto plano.
- Entrada basada en grafemas: no requiere un diccionario fonético externo, el texto se normaliza y convierte mediante `scriptconv`.
- Generación de audio en formato WAV mediante `voice.synthesize_wav(text, wav_file)`.
- Integración con el ecosistema OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en formato ONNX, lo que permite despliegue en entornos Python y potencialmente en otros runtimes compatibles con ONNX.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada; es exclusivamente un modelo TTS.

## Casos de uso

- **Asistentes de voz en ucraniano**: integración en OVOS o sistemas similares para leer respuestas del asistente en voz alta, usando el plugin `ovos-tts-plugin-phoonnx` con la voz `mimic3/uk_UK/m-ailabs_low`.
- **Lectura de notificaciones y alertas**: generación de avisos hablados en aplicaciones de escritorio o domótica para usuarios ucranianos, dado el bajo tamaño del modelo (~0,1 GB) y su ejecución en ONNX.
- **Accesibilidad**: conversión de texto a voz para lectores de pantalla o aplicaciones de accesibilidad en ucraniano, donde la disponibilidad de voces TTS de calidad es limitada.
- **Síntesis por lotes de contenido**: generación de audio para artículos, blogs o documentación en ucraniano en pipelines offline, aprovechando la naturaleza determinista y ligera del modelo.
- **Prototipado de interfaces conversacionales**: uso en entornos de desarrollo para validar flujos de voz en ucraniano antes de invertir en modelos TTS comerciales de mayor calidad.
- **Integración en dispositivos de borde**: despliegue en hardware con recursos limitados (Raspberry Pi, dispositivos embebidos) gracias al formato ONNX y al tamaño reducido del repositorio.
- **Investigación en TTS multilingüe**: uso como línea base o componente en estudios comparativos de síntesis de voz para lenguas eslavas con pocos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explícita; por el tamaño del repositorio (~0,1 GB) y la naturaleza "low" del modelo, se espera un consumo de memoria reducido, apto para CPU.
- **GPU recomendadas**: no se especifican; el modelo está empaquetado en ONNX y orientado a inferencia ligera, por lo que una GPU consumer (por ejemplo, RTX 3060 o superior) sería más que suficiente si se desea aceleración.
- **¿Cabe en GPU consumer?**: sí, con alta probabilidad, dado el tamaño del artefacto.
- **Opciones de despliegue**: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y cualquier runtime compatible con ONNX (ONNX Runtime).
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| `Phoonnx/vits-uk_ua-m_ailabs-low-graphemes` | VITS | ucraniano (uk-UA) | no aplica (TTS) | CC-BY-SA-4.0 | ONNX | Hugging Face (Phoonnx) |
| Otras voces VITS de la colección Phoonnx | VITS | varios | no aplica (TTS) | según voz | ONNX | Hugging Face (colección VITS de Phoonnx) |
| Voces Mimic 3 originales (Mycroft AI) | VITS | varios | no aplica (TTS) | CC-BY-SA-4.0 (según upstream) | varios | GitHub MycroftAI/mimic3-voices |

No se dispone de datos de rendimiento comparativo (MOS, latencia, throughput) entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- **Calidad "low"**: la nomenclatura `m-ailabs_low` indica una variante de baja calidad o bajo coste; no es adecuada para aplicaciones que requieran voz de alta fidelidad.
- **Idioma único**: solo soporta ucraniano (`uk-UA`); no se documentan capacidades multilingües.
- **Riesgo de alucinación**: como todo modelo TTS, puede producir pronunciaciones incorrectas o artefactos en palabras fuera del vocabulario de entrenamiento, especialmente al usar entrada por grafemas.
- **Licencia CC-BY-SA-4.0**: permite uso comercial, pero exige atribución y compartir bajo la misma licencia las obras derivadas; es necesario revisar las implicaciones para productos propietarios.
- **Sin datos de benchmarks**: no hay métricas publicadas de calidad (MOS) ni de rendimiento, lo que dificulta evaluar su idoneidad en producción.
- **Escaso soporte comunitario**: el repositorio no registra descargas ni "likes", lo que sugiere baja adopción y posible falta de mantenimiento.
- **Dependencia de `phoonnx` y `scriptconv`**: el uso requiere instalar versiones pre-release (`pip install --pre phoonnx`) y la librería de conversión de texto, lo que añade dependencias al despliegue.
- **Sesgos**: no se documentan sesgos específicos, pero al derivar de un corpus concreto (AILABS) puede reflejar las características demográficas y de estilo de dicho corpus.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Phoonnx/vits-uk_ua-m_ailabs-low-graphemes)
- [Repositorio upstream en GitHub (MycroftAI/mimic3-voices)](https://github.com/MycroftAI/mimic3-voices/tree/master/voices/uk_UK/m-ailabs_low)
- [Librería phoonnx](https://github.com/TigreGotico/phoonnx)
- [Librería scriptconv](https://github.com/TigreGotico/scriptconv)
- [Colección de modelos VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
