# Phoonnx/vits-fa_ir-amir

## Resumen

`Phoonnx/vits-fa_ir-amir` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, publicado por el proyecto Phoonnx y derivado del trabajo original de SadeghK en `SadeghK/persian-text-to-speech/farsi/amir`. El modelo está empaquetado en formato ONNX para ejecutarse con la librería `phoonnx`, una implementación en Python y OVOS orientada a despliegue ligero de voces TTS. Su propósito es convertir texto en persa (fa-IR) en audio inteligible a partir de fonemas generados por espeak-ng en alfabeto IPA.

El modelo resuelve un problema concreto: ofrecer una voz TTS persa ejecutable en entornos con recursos limitados, sin necesidad de un stack de deep learning pesado, gracias al formato ONNX y a la integración con el ecosistema OVOS (Open Voice OS). Es relevante para desarrolladores que construyen asistentes de voz, lectores de pantalla o sistemas de accesibilidad en persa y necesitan una dependencia ligera y con licencia Apache 2.0.

La información pública disponible es escasa: no se detallan parámetros, datos de entrenamiento ni métricas de calidad. El repositorio ocupa aproximadamente 0,1 GB, lo que sugiere un modelo de tamaño reducido, coherente con las voces VITS de un solo hablante orientadas a inferencia en tiempo real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no autoregresivo basado en contexto) |
| Tipos de cuantización | no disponible (pesos distribuidos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | persa (fa-IR) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Autor original | SadeghK |
| Empaquetado | Phoonnx |
| Tamaño del repositorio | ~0,1 GB |
| Librería | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de síntesis de voz que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial entrenado con pérdidas de reconstrucción y adversariales. Permite generar audio de forma no autoregresiva a partir de fonemas, lo que se traduce en baja latencia y adecuación para inferencia en tiempo real. En este caso, el modelo se distribuye como grafo ONNX, lo que elimina la dependencia de frameworks como PyTorch en el momento de la inferencia.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, el número de hablantes ni si se aplicaron técnicas de alineamiento o fine-tuning adicionales. El modelo original proviene de `SadeghK/persian-text-to-speech`, un repositorio que agrupa varias voces persas; el autor del empaquetado (Phoonnx) se limita a convertir y publicar el modelo para su uso con su librería. La entrada de texto requiere fonemización previa mediante espeak-ng (o el port espyak), y el modelo espera fonemas en alfabeto IPA.

## Capacidades

- Síntesis de voz a partir de texto en persa (fa-IR), con salida en formato WAV.
- Generación de audio no autoregresiva, apta para inferencia de baja latencia.
- Integración con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador a través de `phoonnx.js` (con entrada espeak o unicode) y demo en vivo.
- Fonemización mediante `scriptconv` y espeak-ng, con normalización de texto previa.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de modo thinking, visión, audio de entrada ni capacidades multimodales.
- Monolingüe: únicamente persa; no se documenta soporte multilingüe.

## Casos de uso

- Asistentes de voz en persa: integración como motor TTS en OVOS para responder a comandos de voz y generar respuestas habladas en tiempo real, aprovechando la baja latencia de VITS y el formato ONNX.
- Lectores de pantalla y accesibilidad: conversión de texto digital (webs, documentos, interfaces) a audio en persa para usuarios con discapacidad visual, con despliegue local sin dependencia de servicios en la nube.
- Sistemas de anuncios y megafonía: generación de avisos pregrabados o dinámicos en persa para aplicaciones de transporte, comercio o administración pública.
- Aplicaciones educativas de aprendizaje de persa: síntesis de frases y vocabulario para ejercicios de pronunciación, con control local del audio generado.
- Integración en dispositivos embebidos y de bajo consumo: al distribuirse en ONNX y ocupar ~0,1 GB, puede ejecutarse en Raspberry Pi u otros SBC con recursos limitados.
- Prototipado rápido de interfaces conversacionales: uso de la API de `phoonnx` para validar flujos de voz en persa antes de invertir en un modelo comercial o de mayor calidad.
- Generación de audiolibros o contenido narrado en persa a partir de texto plano, con procesamiento por lotes mediante `synthesize_wav`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del repositorio (~0,1 GB) se espera un consumo bajo, probablemente inferior a 1 GB en CPU.
- GPU recomendadas: no se documentan; el modelo está pensado para ejecución en CPU mediante ONNX Runtime.
- Compatibilidad con GPU de consumo: previsiblemente sí en cualquier GPU con soporte ONNX Runtime, aunque no se confirma en la documentación.
- Opciones de despliegue: `phoonnx` (Python), `ovos-tts-plugin-phoonnx` (OVOS) y `phoonnx.js` (navegador).
- Dependencias: espeak-ng instalado en el sistema o el extra `phoonnx[espeak]` (port espyak).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto / notas |
|---|---|---|---|---|---|
| Phoonnx/vits-fa_ir-amir | VITS | fa-IR | ONNX | Apache 2.0 | Empaquetado para phoonnx/OVOS |
| SadeghK/persian-text-to-speech (amir) | VITS | fa-IR | no disponible | Apache 2.0 | Modelo upstream del que deriva este |
| Otras voces VITS de la colección Phoonnx | VITS | varios | ONNX | según modelo | Mismo pipeline de empaquetado |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La información pública es muy limitada: no hay métricas de calidad (MOS), datos de entrenamiento ni evaluación objetiva.
- Riesgo de pronunciación incorrecta si se usa el port espyak en lugar de espeak-ng, ya que algunos fonemas difieren según advierte la propia model card.
- Modelo monolingüe: solo persa (fa-IR); no admite otros idiomas.
- Requiere fonemización externa con espeak-ng, lo que añade una dependencia del sistema y puede complicar el despliegue en contenedores mínimos.
- No es un modelo de lenguaje: no razona, no sigue instrucciones complejas ni soporta agentes.
- Riesgo de alucinación en el sentido de artefactos acústicos o pronunciaciones erróneas en palabras fuera del vocabulario o con grafías ambiguas.
- Sesgos de hablante: al ser una voz única (amir), no representa la diversidad de acentos o géneros del persa.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la procedencia de los datos de entrenamiento originales, no documentada.
- El ecosistema `phoonnx` está en fase previa (`pip install --pre phoonnx`), lo que implica posible inestabilidad de API.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-fa_ir-amir
- Modelo upstream: https://huggingface.co/SadeghK/persian-text-to-speech/tree/main/farsi/amir
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
