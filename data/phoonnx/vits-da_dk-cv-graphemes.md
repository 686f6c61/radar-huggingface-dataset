# Phoonnx/vits-da_dk-cv-graphemes

## Resumen

`vits-da_dk-cv-graphemes` es un modelo de síntesis de voz (text-to-speech) en danés de Dinamarca (`da-DK`) basado en la arquitectura VITS, desarrollado originalmente por Coqui y empaquetado por Phoonnx en formato ONNX para su uso con la librería `phoonnx`. El modelo convierte texto en audio a partir de los caracteres del texto de entrada (front-end de grafemas), sin necesidad de un fonemizador basado en diccionario, y se distribuye con licencia BSD-3-Clause.

El modelo procede del paquete oficial `tts_models--da--cv--vits` publicado por Coqui en la versión 0.8.0 de su toolkit TTS, entrenado sobre el corpus Common Voice en danés. Phoonnx lo ha reempaquetado como artefacto ONNX de aproximadamente 0,1 GB, lo que facilita su despliegue en entornos Python y en el asistente de voz OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.

Su relevancia actual es acotada pero práctica: cubre una lengua de bajos recursos como el danés con un modelo ligero, de licencia permisiva y ejecutable en CPU mediante ONNX Runtime, lo que lo hace útil para prototipos de asistentes de voz, sistemas de accesibilidad y pipelines de locución automatizada sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; la entrada es texto por frase) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | danés (`da`, variante `da-DK`) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX (empaquetado para la librería `phoonnx`) |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de síntesis de voz que combina un codificador de texto, un prior variacional condicionado por alineamiento monotónico, un decodificador generativo basado en flujos normalizadores y un discriminador adversarial multiperiodo entrenado con pérdidas GAN, además de una pérdida de coincidencia espectral. El resultado es un modelo que genera formas de onda directamente desde texto sin un vocoder externo, lo que simplifica el despliegue y reduce la latencia frente a pipelines en cascada.

En este caso concreto, el modelo es el checkpoint `tts_models--da--cv--vits` de Coqui TTS v0.8.0, entrenado sobre el corpus Common Voice en danés. El front-end utiliza grafemas puros mediante `GraphemePhonemizer` de la librería `scriptconv`, es decir, el texto se normaliza y se convierte directamente en la secuencia de caracteres de entrada del modelo, sin pasar por un diccionario de pronunciación ni por un fonemizador lingüístico. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni sobre si se aplicaron etapas de ajuste fino con RLHF o DPO (no aplicables habitualmente en TTS).

## Capacidades

- Síntesis de voz en danés (`da-DK`) a partir de texto plano, generando audio WAV directamente.
- Entrada basada en grafemas: no requiere fonemización previa ni diccionario de pronunciación para el danés.
- Normalización de texto delegada a `scriptconv` antes de la inferencia.
- Ejecución mediante ONNX Runtime, lo que permite inferencia en CPU sin GPU dedicada.
- Integración con el asistente de voz OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- Gestión de voces mediante `TTSModelManager`, con carga y fusión de voces por defecto.
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio de entrada ni modo thinking: es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz locales en danés: el modelo puede integrarse en OVOS configurando `ovos-tts-plugin-phoonnx` con la voz `coqui/da-cv-vits`, lo que permite respuestas habladas en danés sin conexión a servicios externos y con un peso de repositorio de solo 0,1 GB.
- Lectura de contenido para accesibilidad: conversión de artículos, notificaciones o mensajes de interfaz a audio en danés para usuarios con discapacidad visual, ejecutable en CPU gracias al formato ONNX.
- Locución automatizada de contenidos cortos: generación de avisos, promociones o mensajes de bienvenida en danés dentro de aplicaciones y sistemas de megafonía, usando `synthesize_wav` sobre frases individuales.
- Prototipado de productos de voz para el mercado danés: validación rápida de flujos conversacionales y de experiencia de usuario antes de invertir en modelos comerciales o en grabaciones de estudio, con licencia BSD-3-Clause que permite uso comercial.
- Sistemas de respuesta interactiva de voz (IVR): síntesis de menús y respuestas dinámicas en danés en centralitas telefónicas, donde el coste por inferencia en CPU es bajo y la latencia aceptable para frases cortas.
- Generación de material de aprendizaje de idiomas: creación de audios de pronunciación y ejercicios de escucha en danés a partir de texto, sin depender de grabaciones humanas.
- Pruebas de regresión en pipelines TTS: uso como referencia ligera para comparar calidad acústica y latencia en entornos de integración continua, dado su reducido tamaño y su formato ONNX portable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,1 GB, por lo que el modelo cabe holgadamente en cualquier GPU consumer moderna y en la memoria de un servidor pequeño.
- GPU recomendadas: no se especifican; al ejecutarse en ONNX Runtime puede correr en CPU y, opcionalmente, en GPU (por ejemplo, RTX 4090, A100 o H100) si se configura el proveedor de ejecución correspondiente.
- Cabe en GPU consumer: sí, con amplio margen, dado el tamaño reducido del artefacto.
- Opciones de despliegue: `phoonnx` (Python), `ovos-tts-plugin-phoonnx` (OVOS) y ONNX Runtime; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo TTS de este tipo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto / entrada | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| `Phoonnx/vits-da_dk-cv-graphemes` | VITS | da-DK | Grafemas (texto por frase) | BSD-3-Clause | ONNX (`phoonnx`) | Hugging Face, 18 descargas |
| `coqui/tts_models--da--cv--vits` (upstream) | VITS | da-DK | Grafemas | BSD-3-Clause | Checkpoint Coqui TTS | GitHub Releases de Coqui |
| Otros modelos VITS de la colección Phoonnx | VITS | Diversos idiomas | Grafemas o fonemas | BSD-3-Clause (según modelo) | ONNX (`phoonnx`) | Colección VITS de Phoonnx en Hugging Face |
| Modelos TTS comerciales multilingües | No disponible | Multilingüe | No disponible | Propietaria | API o pesos propios | Servicios en la nube |

La comparación directa con alternativas de la misma categoría (TTS en danés) no está disponible en la información proporcionada; los datos de rendimiento, parámetros y calidad acústica de los modelos citados no se han publicado en esta ficha.

## Limitaciones y advertencias

- Modelo monoidioma: solo sintetiza danés (`da-DK`); no soporta otros idiomas ni cambio de voz o acento.
- Entrada basada en grafemas: la calidad de pronunciación depende de la correspondencia grafema-fonema del danés y puede degradarse con siglas, números, nombres propios o texto no normalizado; parte de la normalización recae en `scriptconv`.
- Riesgo de alucinación acústica: como todo modelo generativo TTS, puede producir artefactos, prosodia incorrecta o pronunciaciones erróneas en frases largas o ambiguas.
- Sesgos: al entrenarse sobre Common Voice, puede heredar sesgos de representación de hablantes (edad, género, región) y una cobertura desigual de variedades dialectales del danés.
- Licencia BSD-3-Clause: permite uso comercial y modificación, pero exige conservar el aviso de copyright y la cláusula de exención de responsabilidad; conviene verificar la procedencia del corpus Common Voice y sus condiciones de uso.
- Uso en producción: el modelo tiene 18 descargas y 0 likes en Hugging Face, lo que sugiere una validación comunitaria muy limitada; se recomienda evaluar la calidad acústica en el dominio concreto antes de desplegarlo.
- Sin datos de benchmarks ni de latencia publicados: no es posible estimar de antemano el rendimiento en un hardware concreto sin hacer pruebas propias.
- No es un modelo de lenguaje: no admite instrucciones, razonamiento, tool calling ni generación de texto; cualquier expectativa en ese sentido queda fuera de su alcance.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-da_dk-cv-graphemes
- Checkpoint upstream de Coqui TTS: https://github.com/coqui-ai/TTS/releases/download/v0.8.0_models/tts_models--da--cv--vits.zip
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio Coqui TTS: https://github.com/coqui-ai/TTS
