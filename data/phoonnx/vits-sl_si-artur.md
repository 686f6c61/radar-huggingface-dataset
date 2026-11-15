# Phoonnx/vits-sl_si-artur

## Resumen

vits-sl_si-artur es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por ppisljar bajo el identificador `ppisljar/piper_si_artur` y reempaquetado por Phoonnx en formato ONNX para su uso con la librería phoonnx. El modelo está especializado en esloveno de Eslovenia (`sl-SI`) y emplea fonemas espeak en alfabeto IPA como entrada de texto, lo que lo vincula al ecosistema Piper y a la cadena de herramientas espeak-ng.

El modelo resuelve el problema de la síntesis de voz de calidad en esloveno dentro de un formato ligero y desplegable: el repositorio ocupa aproximadamente 0,1 GB, lo que lo hace adecuado para entornos con recursos limitados, aplicaciones de asistencia por voz y despliegues en el navegador mediante phoonnx.js. Su relevancia actual radica en que forma parte de la colección de voces VITS empaquetadas para phoonnx, una librería que integra estos modelos en Python y en el asistente de voz OVOS.

La ficha se basa exclusivamente en la información disponible en la model card y en los metadatos de Hugging Face. No se han publicado detalles sobre el dataset de entrenamiento, el número de parámetros ni resultados de benchmarks, por lo que esos apartados se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS) |
| Tipos de cuantizacion | no disponible; pesos distribuidos en ONNX |
| Idiomas soportados | esloveno de Eslovenia (`sl-SI`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX |
| Autor original | ppisljar |
| Empaquetado por | Phoonnx |
| Entrada de texto | fonemas espeak, alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un modelo generativo de síntesis de voz de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial durante el entrenamiento. VITS produce audio de forma directa a partir de la secuencia de fonemas, sin necesidad de un vocoder separado en la inferencia, lo que simplifica el despliegue.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineamiento o ajuste fino posteriores. El modelo se distribuye como pesos ONNX reempaquetados desde el modelo original de Piper (`ppisljar/piper_si_artur`), y la model card indica que la entrada de texto se procesa mediante el fonemizador `EspeakPhonemizer` de la librería scriptconv, que normaliza el texto y lo convierte a fonemas IPA antes de la síntesis.

## Capacidades

- Síntesis de voz (text-to-speech) en esloveno de Eslovenia (`sl-SI`).
- Conversión de texto a fonemas IPA mediante espeak-ng o el port espyak.
- Generación de audio en formato WAV a través de la API de phoonnx (`synthesize_wav`).
- Integración con el asistente de voz OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en el navegador mediante phoonnx.js, con entrada espeak o unicode.
- Normalización y conversión de texto mediante la librería scriptconv.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Asistencia por voz en OVOS: el modelo se integra como plugin TTS (`ovos-tts-plugin-phoonnx`) y permite que un asistente doméstico responda en esloveno configurando la voz en `mycroft.conf`.
- Lectura de contenido en esloveno: conversión de artículos, notificaciones o mensajes a audio WAV mediante la API de phoonnx, adecuada para aplicaciones de accesibilidad.
- Síntesis en el navegador: mediante phoonnx.js se puede generar voz eslovena del lado del cliente sin depender de un servidor, útil para aplicaciones web interactivas.
- Prototipado rápido de interfaces de voz: el tamaño reducido del repositorio (0,1 GB) y el formato ONNX permiten desplegar el modelo en entornos de desarrollo con recursos limitados.
- Integración en pipelines de audio por lotes: la función `synthesize_wav` permite generar archivos WAV de forma programática para doblaje, audiolibros o locuciones automatizadas en esloveno.
- Evaluación de voces Piper en esloveno: al estar empaquetado desde `ppisljar/piper_si_artur`, sirve para comparar el rendimiento de la voz original frente a otras voces de la colección VITS de Phoonnx.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB, lo que sugiere un modelo ligero apto para CPU.
- GPU recomendadas: no disponible; por el tamaño del repositorio, no requiere GPU dedicada.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el reducido tamaño, aunque no se documenta oficialmente.
- Opciones de despliegue: phoonnx (Python), OVOS mediante `ovos-tts-plugin-phoonnx`, y phoonnx.js en el navegador.
- Dependencia externa: espeak-ng instalado en el sistema (`apt install espeak-ng`) o el extra `phoonnx[espeak]` con el port espyak.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phoonnx/vits-sl_si-artur | VITS | sl-SI | ONNX | CC-BY-4.0 | Hugging Face |
| ppisljar/piper_si_artur | VITS (Piper) | sl-SI | Piper | CC-BY-4.0 (declarada en el upstream) | Hugging Face |
| Otras voces de la colección VITS de Phoonnx | VITS | varios | ONNX | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Cobertura lingüística limitada exclusivamente al esloveno de Eslovenia (`sl-SI`); no soporta otros idiomas.
- Dependencia de espeak-ng para la fonemización; sin él, el extra espyak puede producir fonemas distintos y provocar errores de pronunciación en algunas palabras.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con datos no especificados, puede heredar sesgos del corpus original.
- Riesgo de alucinación o pronunciación incorrecta en palabras fuera del dominio de entrenamiento, siglas o nombres propios.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar al autor original y respetar los términos de la licencia.
- No se especifican restricciones adicionales de uso comercial más allá de la licencia CC-BY-4.0.
- El modelo se distribuye como ONNX reempaquetado; cambios en la versión de phoonnx o de espeak-ng podrían afectar a la reproducibilidad de la síntesis.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-sl_si-artur
- Modelo original upstream: https://huggingface.co/ppisljar/piper_si_artur
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
