# Phoonnx/vits-lv_lv-aivars

## Resumen

vits-lv_lv-aivars es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx en formato ONNX para su uso con la librería phoonnx. El modelo original procede de RaivisDejus/Piper-lv_LV-Aivars-medium, una voz del ecosistema Piper para letón (lv-LV), y esta versión lo redistribuye con la integración necesaria para la librería phoonnx y su ecosistema OVOS.

El modelo resuelve la generación de audio hablado a partir de texto en letón, con una entrada de texto que se convierte a fonemas mediante espeak-ng (alfabeto IPA) antes de pasar por el sintetizador VITS. Es relevante para desarrolladores que necesitan una voz letona ligera, de licencia permisiva (CC0-1.0) y ejecutable en entornos con recursos limitados, incluyendo asistentes de voz locales y aplicaciones de accesibilidad.

El repositorio ocupa aproximadamente 0,1 GB, lo que indica un modelo compacto orientado a inferencia eficiente en CPU o GPU modesta. La licencia CC0-1.0 elimina restricciones de atribución y permite uso comercial sin condiciones, un aspecto poco habitual en voces TTS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS; procesa una frase por síntesis) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; el repositorio no detalla variantes cuantizadas) |
| Idiomas soportados | letón (lv-LV) |
| Licencia | CC0-1.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema end-to-end de síntesis de voz que combina un codificador de texto, un prior variacional, un decodificador basado en flujo normalizador y un discriminador adversarial multiperiodo durante el entrenamiento. VITS genera formas de onda directamente desde fonemas, sin necesidad de un vocoder separado, lo que simplifica el despliegue y reduce la latencia.

La entrada de texto se procesa mediante espeak-ng para obtener fonemas en alfabeto IPA, que constituyen la secuencia de entrada del modelo. El modelo original es Piper-lv_LV-Aivars-medium de RaivisDejus, una voz de calidad media dentro del ecosistema Piper. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO; estos datos no están publicados en la información disponible.

## Capacidades

- Síntesis de voz en letón (lv-LV) a partir de texto escrito.
- Conversión de texto a fonemas IPA mediante espeak-ng como front-end.
- Generación de formas de onda directamente (end-to-end, sin vocoder externo).
- Integración con la librería phoonnx en Python y con el ecosistema OVOS mediante el plugin ovos-tts-plugin-phoonnx.
- Ejecución en navegador a través de phoonnx.js con entrada espeak o unicode.
- No soporta tool calling, agentes, razonamiento multi-step ni visión: es exclusivamente un modelo TTS.
- Capacidad monolingüe: solo letón.

## Casos de uso

- Asistentes de voz locales en letón: el modelo se integra en OVOS mediante el plugin ovos-tts-plugin-phoonnx, permitiendo respuestas habladas en un asistente doméstico sin dependencia de servicios en la nube, gracias a su tamaño reducido (~0,1 GB) y licencia CC0.
- Lectura de contenido para accesibilidad: conversión de artículos, notificaciones o documentos a audio en letón para usuarios con discapacidad visual, con despliegue en dispositivos de bajos recursos al ser un modelo ONNX compacto.
- Aplicaciones de aprendizaje de idiomas: generación de pronunciaciones de referencia en letón para ejercicios de escucha, usando la fonemización IPA de espeak-ng para controlar la pronunciación.
- Sistemas de megafonía y anuncios automatizados: síntesis de avisos en tiempo real en estaciones, comercios o transporte público en Letonia, donde la licencia CC0 permite uso comercial sin restricciones.
- Prototipado de interfaces conversacionales: integración rápida en pipelines de Python con phoonnx para validar experiencias de voz antes de invertir en modelos de mayor calidad.
- Demos web de TTS en navegador: uso de phoonnx.js para ofrecer síntesis de voz letona directamente en el cliente, sin backend, mediante el demo de tigregotico.pt.
- Generación de audio para contenido multimedia: narración de vídeos o podcasts en letón en flujos automatizados, al poder invocarse desde scripts Python con salida WAV.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; por el tamaño del repositorio (~0,1 GB), la inferencia cabe holgadamente en menos de 1 GB de memoria.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo está diseñado para ejecución en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1 GB de memoria, e incluso en CPU.
- Opciones de despliegue: phoonnx (Python), ovos-tts-plugin-phoonnx (OVOS), phoonnx.js (navegador). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS VITS.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| vits-lv_lv-aivars (este) | VITS | letón (lv-LV) | CC0-1.0 | ONNX | Hugging Face, phoonnx |
| Piper-lv_LV-Aivars-medium (upstream) | VITS | letón (lv-LV) | CC0-1.0 | Piper (ONNX) | Hugging Face |
| Otras voces VITS de la colección Phoonnx | VITS | varios | según modelo | ONNX | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a arquitectura, licencia y formato.

## Limitaciones y advertencias

- Modelo monolingüe: solo sintetiza letón; el texto en otros idiomas producirá una pronunciación incorrecta.
- Dependencia de espeak-ng: sin espeak-ng instalado, la alternativa espyak puede generar fonemas distintos y provocar errores de pronunciación en algunas palabras.
- Calidad de voz media: el modelo upstream es de categoría "medium", por lo que la naturalidad y expresividad son inferiores a las de sistemas TTS neuronales de mayor tamaño.
- No apto para clonación de voz ni control de estilo: VITS estándar no ofrece estas capacidades.
- Riesgo de alucinación acústica: como todo TTS, puede producir artefactos o pronunciaciones erróneas en textos con abreviaturas, números o nombres propios no cubiertos por la normalización de scriptconv.
- Licencia CC0-1.0: permite uso comercial sin restricciones; no obstante, conviene verificar que la licencia del modelo upstream se mantenga en futuras redistribuciones.
- Sin datos publicados de benchmarks, número de parámetros ni composición del dataset de entrenamiento, lo que dificulta una evaluación cuantitativa previa a producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-lv_lv-aivars
- Modelo upstream: https://huggingface.co/RaivisDejus/Piper-lv_LV-Aivars-medium
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
