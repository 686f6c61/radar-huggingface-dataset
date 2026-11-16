# Phoonnx/vits-eu_es-maider-ahotts

## Resumen

vits-eu_es-maider-ahotts es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por el HiTZ Center (Universidad del País Vasco) bajo el identificador HiTZ/TTS-eu_maider y empaquetado por Phoonnx para su uso con la librería ONNX phoonnx. El modelo convierte texto en euskera (variante eu-ES) en audio inteligible, resolviendo el problema de la síntesis de voz para una lengua de bajos recursos como el euskera.

La relevancia de este modelo radica en su empaquetado para inferencia ONNX, lo que facilita su despliegue en entornos de producción ligeros y su integración con el asistente de voz OVOS mediante el plugin ovos-tts-plugin-phoonnx. El repositorio ocupa aproximadamente 0,1 GB, lo que indica un modelo compacto orientado a inferencia eficiente.

El front-end de texto no es trivial: la entrada no es texto plano, sino fonemas en alfabeto IPA generados por el fonemizador AhoTTSPhonemizer de la librería scriptconv, lo que condiciona tanto el pipeline de uso como las dependencias de instalación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | euskera (eu-ES) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas ahotts en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema de síntesis de voz de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial durante el entrenamiento. VITS es conocida por generar audio de forma paralela (no autorregresiva) con calidad natural y latencia baja, lo que lo hace adecuado para inferencia en tiempo real.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o ajuste fino específico. El modelo original procede de HiTZ/TTS-eu_maider, del HiTZ Center, y esta versión es un empaquetado ONNX para phoonnx. El front-end de texto utiliza el fonemizador AhoTTSPhonemizer de scriptconv, que normaliza el texto en euskera y lo convierte a fonemas IPA antes de la síntesis.

## Capacidades

- Síntesis de voz a partir de texto en euskera (eu-ES), con salida en formato WAV.
- Conversión de texto a fonemas IPA mediante el fonemizador AhoTTSPhonemizer (scriptconv[eu]).
- Inferencia ONNX optimizada para despliegue ligero.
- Integración con el asistente de voz OVOS mediante el plugin ovos-tts-plugin-phoonnx.
- Gestión de voces mediante TTSModelManager de phoonnx (carga, merge de voces por defecto y síntesis).
- No soporta tool calling, agentes, visión, audio de entrada ni razonamiento multi-paso: es exclusivamente un modelo TTS.
- Capacidad multilingüe limitada al euskera; no se documentan otros idiomas.

## Casos de uso

- Asistentes de voz en euskera: integración en OVOS mediante ovos-tts-plugin-phoonnx para responder oralmente a consultas de usuarios en euskera, con configuración declarativa en mycroft.conf.
- Lectura de contenidos en euskera: conversión de artículos, noticias o documentación a audio para accesibilidad o consumo pasivo, usando la API de síntesis WAV de phoonnx.
- Señalización y avisos automatizados: generación de mensajes de voz pregrabados para transporte público, aeropuertos o edificios públicos en comunidades vascoparlantes.
- Aplicaciones educativas: síntesis de material didáctico en euskera para aprendizaje de idiomas o apoyo a personas con dificultades lectoras.
- Integración en pipelines de accesibilidad web: generación bajo demanda de audio para páginas y aplicaciones en euskera, aprovechando el tamaño reducido del modelo (0,1 GB) para despliegue en servidores modestos.
- Prototipado de interfaces conversacionales: uso del modelo como componente TTS en sistemas de diálogo experimentales en euskera, con la ventaja de su licencia Apache 2.0 y su formato ONNX para despliegue multiplataforma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,1 GB, lo que sugiere un modelo compacto que probablemente cabe en GPU de gama baja o incluso en CPU.
- GPU recomendadas: no disponibles; por el tamaño del modelo, es probable que funcione en GPUs consumer, aunque no se documenta.
- Cabe en GPU consumer: probablemente sí, dado el tamaño reducido del repositorio, aunque no se confirma en la información proporcionada.
- Opciones de despliegue: phoonnx (Python) y OVOS mediante ovos-tts-plugin-phoonnx; el formato ONNX permite otros runtimes ONNX, aunque no se documentan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Tamano |
|---|---|---|---|---|---|
| vits-eu_es-maider-ahotts | VITS | eu-ES | Apache 2.0 | ONNX | 0,1 GB |
| HiTZ/TTS-eu_maider (upstream) | VITS | eu-ES | Apache 2.0 | no disponible | no disponible |
| Otros modelos VITS de la colección Phoonnx | VITS | varios | Apache 2.0 (segun coleccion) | ONNX | variable |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo sintetiza euskera (eu-ES); no admite otros idiomas.
- La entrada debe ser texto procesado por el fonemizador AhoTTSPhonemizer de scriptconv; no acepta texto plano directamente sin ese front-end.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con datos limitados de una lengua de bajos recursos, puede presentar menor naturalidad o cobertura en dominios especializados.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero puede producir pronunciaciones incorrectas o artefactos en palabras fuera del vocabulario de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo upstream HiTZ/TTS-eu_maider y de las dependencias (scriptconv, phoonnx).
- El fonemizador AhoTTSPhonemizer se distribuye en el extra scriptconv[eu] bajo scriptconv_copyleft, lo que puede implicar condiciones de licencia adicionales (copyleft) que deben revisarse antes de su uso en producción.
- No se documentan requisitos de latencia ni throughput, por lo que la viabilidad en tiempo real debe validarse empíricamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-eu_es-maider-ahotts
- Modelo upstream: https://huggingface.co/HiTZ/TTS-eu_maider
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
