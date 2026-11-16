# Phoonnx/vits-pt-cv-graphemes

## Resumen

vits-pt-cv-graphemes es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Coqui a partir de su toolkit TTS (version 0.8.0) y empaquetado por Phoonnx en formato ONNX para su uso con la librería phoonnx. El modelo convierte texto en portugués en audio inteligible y está entrenado sobre el corpus Common Voice, lo que le proporciona una cobertura razonable del portugués hablado en distintos registros y acentos.

La relevancia de este modelo radica en su formato de despliegue: al estar empaquetado como ONNX y distribuido a través de phoonnx, puede ejecutarse en entornos Python y en el asistente de voz OVOS sin depender del stack completo de Coqui TTS. Esto lo hace útil para integraciones ligeras en asistentes domésticos, sistemas de accesibilidad y pipelines de generación de audio donde el tamaño del repositorio (0,1 GB) y la licencia permisiva BSD-3-Clause son factores determinantes.

El modelo utiliza una entrada basada en grafemas (caracteres del texto) en lugar de fonemas, lo que simplifica el front-end de texto pero puede limitar la precisión de la pronunciación en palabras con ortografía irregular. Su alcance es monolingüe (portugués) y su uso previsto es la síntesis de voz en aplicaciones de producción y prototipado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; el repo ocupa 0,1 GB) |
| Idiomas soportados | portugués (pt) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX |
| Entrada de texto | grafemas (caracteres) mediante `GraphemePhonemizer` de scriptconv |
| Corpus de entrenamiento | Common Voice |
| Pipeline | text-to-speech |
| Librería | phoonnx |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura de síntesis de voz extremo a extremo que combina un codificador de texto, un prior normalizing flow, un decodificador generativo y un discriminador adversarial entrenado con pérdidas de reconstrucción y de confrontación. Esta combinación permite generar audio de forma directa desde texto sin necesidad de un vocoder externo, lo que reduce la latencia y simplifica el despliegue en comparación con pipelines de dos etapas.

El modelo fue entrenado por Coqui sobre el corpus Common Voice en portugués y distribuido originalmente como parte del paquete `tts_models--pt--cv--vits` de TTS 0.8.0. Phoonnx lo ha convertido a ONNX y lo ha integrado en su colección de voces VITS, manteniendo la licencia BSD-3-Clause declarada por Coqui. No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en TTS). El front-end de texto utiliza grafemas en lugar de fonemas, lo que implica que la normalización y conversión del texto se realiza mediante `scriptconv` antes de alimentar el modelo.

## Capacidades

- Síntesis de voz en portugués a partir de texto plano, con salida en formato WAV.
- Entrada basada en grafemas: acepta caracteres del texto y los procesa mediante `GraphemePhonemizer` de scriptconv.
- Integración con la librería phoonnx para Python y con el asistente de voz OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Generación de audio de una sola pasada (end-to-end), sin vocoder separado.
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de modo thinking, visión ni audio de entrada.
- Capacidad monolingüe: únicamente portugués.

## Casos de uso

- Asistentes de voz domésticos con OVOS: el modelo se integra mediante `ovos-tts-plugin-phoonnx` y permite sintetizar respuestas en portugués en un asistente local, con un repositorio de solo 0,1 GB que cabe en dispositivos de recursos limitados.
- Accesibilidad para personas con discapacidad visual: conversión de texto a voz en portugués para lectores de pantalla y aplicaciones de lectura, usando la API de phoonnx en Python para generar WAV bajo demanda.
- Generación de audiolibros y contenido narrado: síntesis por lotes de textos largos en portugués, dividiendo el texto en frases y concatenando los WAV resultantes, aprovechando la inferencia end-to-end sin vocoder.
- Prototipado de interfaces conversacionales: validación rápida de flujos de voz en portugués antes de invertir en modelos comerciales, gracias a la licencia BSD-3-Clause y al formato ONNX portable.
- Sistemas de megafonía y anuncios automatizados: generación de avisos pregrabados en portugués para transporte, comercio o eventos, con despliegue en CPU mediante ONNX Runtime.
- Investigación en TTS: modelo de referencia para comparar técnicas de fonemización basada en grafemas frente a fonemas en portugués, usando el corpus Common Voice como base conocida.
- Integración en aplicaciones de terceros: al estar en ONNX, puede ejecutarse con ONNX Runtime en entornos sin Python (C++, C#, Java) a través de las herramientas de phoonnx o directamente con el runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio completo ocupa 0,1 GB, por lo que la huella de memoria es reducida y probablemente inferior a 1 GB en FP32.
- GPU recomendadas: no se especifican; al ser un modelo pequeño en ONNX, puede ejecutarse en CPU sin GPU dedicada.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) e incluso en CPU.
- Opciones de despliegue: phoonnx (Python y OVOS), ONNX Runtime; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-pt-cv-graphemes (este) | VITS (Coqui) | pt | no aplica | BSD-3-Clause | ONNX | Hugging Face (Phoonnx) |
| Coqui TTS pt-cv-vits (upstream) | VITS | pt | no aplica | BSD-3-Clause | PyTorch | GitHub Coqui TTS |
| Otras voces VITS de la colección Phoonnx | VITS | varios | no aplica | según modelo | ONNX | Hugging Face (Phoonnx) |

No se dispone de datos de rendimiento comparativo (MOS, WER, latencia) en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo monolingüe: solo sintetiza portugués; el texto en otros idiomas producirá una pronunciación incorrecta o ininteligible.
- Entrada basada en grafemas: la pronunciación de palabras con ortografía irregular puede ser menos precisa que en modelos con fonemización completa.
- Sesgos conocidos: al entrenarse sobre Common Voice, puede reflejar los sesgos de acento, género y registro presentes en ese corpus; no se documentan medidas de mitigación.
- Riesgo de alucinación: en TTS se traduce en artefactos de audio, ruidos o pronunciaciones anómalas ante texto fuera de distribución (siglas, números, símbolos).
- Licencia BSD-3-Clause: permite uso comercial y modificación, pero exige conservar el aviso de copyright y la cláusula de exención de responsabilidad; verificar la atribución a Coqui.
- No apto para tareas de lenguaje: no realiza razonamiento, tool calling ni generación de texto.
- Sin datos publicados de calidad (MOS) ni de rendimiento en producción; se recomienda evaluar en el dominio concreto antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-pt-cv-graphemes
- Upstream Coqui TTS (v0.8.0): https://github.com/coqui-ai/TTS/releases/download/v0.8.0_models/tts_models--pt--cv--vits.zip
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
