# Phoonnx/vits-gl_es-icia-hitz_center-cotovia

## Resumen

`vits-gl_es-icia-hitz_center-cotovia` es un modelo de síntesis de voz (text-to-speech) en gallego, desarrollado originalmente por el HiTZ Center (Universidad del País Vasco) y empaquetado por Phoonnx en formato ONNX para su uso con la librería `phoonnx`. El modelo subyacente es VITS, una arquitectura de TTS de extremo a extremo que combina un codificador de texto, un decoder acústico y un vocoder en una sola red entrenada de forma adversarial condicional.

La relevancia de este modelo radica en su carácter especializado: cubre una lengua de bajos recursos como el gallego (`gl-ES`) con una licencia permisiva Apache 2.0, lo que facilita su integración en asistentes de voz, lectores de pantalla o sistemas de accesibilidad. El empaquetado ONNX elimina la dependencia de frameworks de entrenamiento pesados y permite inferencia en CPU sin necesidad de GPU.

El repositorio ocupa 0.1 GB, lo que confirma que se trata de un modelo compacto. La entrada de texto no es texto plano directo, sino fonemas en el alfabeto Cotovia, gestionados por la librería `scriptconv` a través del fonemizador `CotoviaPhonemizer`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS con decoder acústico y vocoder integrados) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos ONNX; se desconoce si hay variantes cuantizadas) |
| Idiomas soportados | gallego (`gl`, `gl-ES`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz de extremo a extremo que integra en un único modelo un codificador de texto, un prior variacional, un decoder basado en flujos normalizadores y un vocoder de dominio temporal. El entrenamiento combina pérdidas adversariales condicionales con una estimación variacional de la verosimilitud, lo que permite generar audio de forma directa a partir de fonemas sin un vocoder separado. El modelo original fue entrenado por el HiTZ Center y publicado como `HiTZ/TTS-gl_icia`; esta versión es un reempaquetado en ONNX para la librería `phoonnx`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas adicionales más allá de las propias de VITS. El front-end de texto utiliza el fonemizador `CotoviaPhonemizer` de `scriptconv_copyleft.phonemizers.gl`, que normaliza el texto y lo convierte al alfabeto Cotovia antes de la inferencia.

## Capacidades

- Síntesis de voz en gallego (`gl-ES`) a partir de texto fonemizado en alfabeto Cotovia.
- Generación de audio en formato WAV mediante `voice.synthesize_wav`.
- Integración en el ecosistema OVOS como plugin de TTS (`ovos-tts-plugin-phoonnx`).
- Inferencia en CPU mediante ONNX, sin necesidad de GPU.
- Normalización y conversión de texto a fonemas delegada a `scriptconv`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- Capacidad multilingüe limitada exclusivamente al gallego.

## Casos de uso

- **Lectores de pantalla y accesibilidad**: el modelo puede sintetizar texto en gallego para usuarios con discapacidad visual, aprovechando su licencia Apache 2.0 y su inferencia en CPU para desplegarse en dispositivos de bajo coste.
- **Asistentes de voz locales en OVOS**: integración directa mediante `ovos-tts-plugin-phoonnx`, configurando la voz `hitz/gl_icia-vits` en `mycroft.conf` para asistentes domésticos en gallego.
- **Locución automatizada de contenidos**: generación de audio para artículos, noticias o documentación en gallego, con salida WAV lista para publicar.
- **Sistemas de navegación y avisos por voz**: síntesis de instrucciones o alertas en gallego en entornos embebidos, donde el tamaño reducido del repositorio (0.1 GB) y el formato ONNX facilitan el despliegue.
- **Investigación en TTS para lenguas de bajos recursos**: el modelo sirve como referencia reproducible para experimentos con VITS en gallego, con licencia permisiva y pesos ONNX.
- **Prototipado de interfaces conversacionales**: al integrarse en `phoonnx` con una API Python sencilla (`TTSModelManager`), permite construir demos de voz en gallego en pocas líneas de código.
- **Accesibilidad en administración pública**: generación de avisos y trámites leídos en gallego, con la ventaja de que la licencia Apache 2.0 permite uso comercial y modificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser un modelo ONNX de 0.1 GB, es probable que la inferencia se realice en CPU sin GPU.
- GPU recomendadas: no disponible; no se requiere GPU para el despliegue típico con `phoonnx`.
- Compatibilidad con GPU de consumo: no disponible; el formato ONNX permite ejecución en CPU, por lo que cabría en cualquier equipo convencional.
- Opciones de despliegue: `phoonnx` (Python y OVOS), con pesos ONNX; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Contexto |
|---|---|---|---|---|---|
| `Phoonnx/vits-gl_es-icia-hitz_center-cotovia` | VITS | gallego | Apache 2.0 | ONNX | no aplica |
| `HiTZ/TTS-gl_icia` (upstream) | VITS | gallego | Apache 2.0 | no disponible | no aplica |
| Otros modelos VITS de Phoonnx | VITS | varias lenguas | Apache 2.0 | ONNX | no aplica |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo sintetiza gallego; no admite otros idiomas.
- La entrada debe ser texto fonemizado en alfabeto Cotovia; el texto plano requiere el front-end `scriptconv` con el extra `scriptconv[gl]`.
- No se dispone de información sobre sesgos, calidad de voces o variedades dialectales del gallego cubiertas.
- Riesgo de alucinación no aplica en el sentido habitual de LLM, pero puede haber errores de pronunciación en palabras fuera del dominio de entrenamiento.
- La licencia Apache 2.0 permite uso comercial y modificación, pero se recomienda verificar la licencia del modelo upstream `HiTZ/TTS-gl_icia`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica poca validación comunitaria.
- No se especifican limitaciones de longitud de texto de entrada ni de calidad de audio (frecuencia de muestreo, bitrate).

## Enlaces

- [Hugging Face: Phoonnx/vits-gl_es-icia-hitz_center-cotovia](https://huggingface.co/Phoonnx/vits-gl_es-icia-hitz_center-cotovia)
- [Modelo upstream: HiTZ/TTS-gl_icia](https://huggingface.co/HiTZ/TTS-gl_icia)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Colección VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
- [Paper VITS](https://arxiv.org/abs/2106.06103)
