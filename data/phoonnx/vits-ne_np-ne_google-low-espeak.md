# Phoonnx/vits-ne_np-ne_google-low-espeak

## Resumen

vits-ne_np-ne_google-low-espeak es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Mycroft AI para su proyecto Mimic 3 y empaquetado posteriormente por Phoonnx para su biblioteca de inferencia ONNX. El modelo genera audio en nepalí (ne-NP) a partir de texto convertido previamente a fonemas mediante espeak-ng en alfabeto IPA. Su relevancia radica en que ofrece una voz TTS ligera y de código abierto para un idioma con escasa cobertura en herramientas de síntesis vocal, ejecutable en entornos con recursos limitados.

El modelo se distribuye como un artefacto ONNX de aproximadamente 0,1 GB, lo que lo sitúa en la categoría de voces "low" (baja calidad o baja huella de recursos) dentro del ecosistema Mimic 3. No se dispone de información pública sobre el número de parámetros, la longitud de contexto ni los datos exactos de entrenamiento en la documentación proporcionada.

La integración se realiza a través de la librería phoonnx, que gestiona la carga del modelo, la fonemización con espeak-ng y la síntesis a WAV. También existe soporte para OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, lo que facilita su uso en asistentes de voz autoalojados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (se distribuye como ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | nepalí (ne-NP) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamaño del repositorio | ~0,1 GB |
| Autor original | Mycroft AI |
| Empaquetado | Phoonnx |
| Librería de inferencia | phoonnx (Python), phoonnx.js (navegador) |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial multiperiodo para el entrenamiento. Este diseño permite generar audio de forma directa desde fonemas sin necesidad de un vocoder externo, lo que simplifica el despliegue y reduce la latencia.

El modelo concreto deriva de la voz `ne_NP/ne-google_low` del repositorio mimic3-voices de Mycroft AI, que a su vez parece inspirada en una voz de Google para nepalí. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en TTS). La innovación técnica destacable es el empaquetado en ONNX para inferencia multiplataforma y la integración con el front-end de fonemización espeak-ng mediante la librería scriptconv.

## Capacidades

- Síntesis de voz a partir de texto en nepalí (ne-NP), previa conversión a fonemas espeak-ng en IPA.
- Generación de audio en formato WAV mediante la API de phoonnx (`synthesize_wav`).
- Integración con asistentes de voz OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador mediante phoonnx.js (con entrada espeak o unicode).
- Inferencia ligera en CPU o GPU gracias al formato ONNX y al tamaño reducido del modelo (~0,1 GB).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada; es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz autoalojados en nepalí: integración en OVOS mediante el plugin oficial para responder oralmente a consultas de usuarios, aprovechando la licencia abierta y el bajo consumo de recursos.
- Lectura de contenido accesible: convertir artículos, noticias o documentos en audio para personas con discapacidad visual o para consumo en movilidad, usando la API de phoonnx en un script de Python.
- Sistemas de megafonía o anuncios automatizados: generación de avisos pregrabados en nepalí para transporte público, aeropuertos o comercios, con síntesis por lotes a archivos WAV.
- Prototipado de interfaces conversacionales: desarrollo de demos y pruebas de concepto de IVR o chatbots de voz en nepalí sin depender de servicios cloud propietarios.
- Aplicaciones educativas: creación de materiales de aprendizaje de idiomas o lectura guiada para estudiantes nepalíes, con audio generado localmente.
- Investigación en TTS de bajos recursos: uso como línea base o componente en experimentos de síntesis para lenguas con poca representación, gracias a su licencia CC-BY-SA-4.0 y su formato ONNX abierto.
- Síntesis en el navegador: despliegue de demos web con phoonnx.js para probar la voz sin backend, útil en prototipos de accesibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; por el tamaño del artefacto (~0,1 GB), la inferencia cabe holgadamente en menos de 1 GB de memoria, probablemente en CPU.
- GPU recomendadas: no se especifican; cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) sería más que suficiente, aunque el modelo está pensado para ejecutarse también en CPU.
- ¿Cabe en GPU consumer? Sí, con amplio margen, dado el reducido tamaño del modelo.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), plugin OVOS `ovos-tts-plugin-phoonnx`. No se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamaño | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-ne_np-ne_google-low-espeak (este) | VITS | ne-NP | ~0,1 GB | CC-BY-SA-4.0 | ONNX | Hugging Face (Phoonnx) |
| Otras voces Mimic 3 (p. ej. en_US, es_ES) | VITS | varios | variable | según voz (a menudo CC-BY-SA-4.0) | ONNX | GitHub MycroftAI/mimic3-voices |
| Voces VITS de Coqui TTS | VITS | varios (principalmente en) | variable | MPL-2.0 / otras | PyTorch, ONNX | Coqui / Hugging Face |
| Modelos TTS comerciales (Google, Azure) | propietaria | ne-NP incluido | no disponible | propietaria | API | servicios cloud |

No se dispone de datos de rendimiento comparativo (MOS, latencia) en la información proporcionada.

## Limitaciones y advertencias

- Cobertura limitada a un único idioma (nepalí, ne-NP); no soporta otros idiomas.
- La calidad se etiqueta como "low" en el nombre del modelo, lo que sugiere una fidelidad de audio inferior a voces de mayor tamaño.
- Dependencia de espeak-ng para la fonemización: si se usa el port espyak, algunos fonemas difieren y pueden producir palabras mal pronunciadas.
- Riesgo de errores de pronunciación en palabras fuera del dominio de entrenamiento o con grafías irregulares.
- Licencia CC-BY-SA-4.0: permite uso comercial, pero exige atribución y compartir las obras derivadas bajo la misma licencia, lo que puede ser restrictivo para productos propietarios.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con datos posiblemente limitados, puede reflejar sesgos de pronunciación o prosodia del corpus original.
- No apto para tareas de razonamiento, generación de texto, código o visión; es exclusivamente TTS.
- Sin información pública sobre el dataset de entrenamiento, lo que dificulta evaluar su robustez en dominios especializados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-ne_np-ne_google-low-espeak
- Repositorio upstream (MycroftAI/mimic3-voices): https://github.com/MycroftAI/mimic3-voices/tree/master/voices/ne_NP/ne-google_low
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js (navegador): https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
