# Phoonnx/matcha-gl_es-icia_phonemes-cotovia

## Resumen

matcha-gl_es-icia_phonemes-cotovia es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura Matcha-TTS, desarrollado originalmente por Proxecto Nós y empaquetado por Phoonnx en formato ONNX para su uso con la librería phoonnx. El modelo genera audio a partir de fonemas en gallego (gl-ES), empleando el alfabeto y fonemizador Cotovia como interfaz de entrada de texto. Su propósito es proporcionar una voz gallega sintética de calidad dentro del ecosistema OVOS y de la librería phoonnx.

El modelo deriva del checkpoint original proxectonos/Nos_TTS-icia-matcha-phonemes, que Phoonnx ha convertido a ONNX y ha integrado en su gestor de voces. El repositorio ocupa aproximadamente 0,1 GB, lo que refleja un modelo compacto orientado a inferencia eficiente. La licencia declarada es Apache 2.0.

Su relevancia radica en ser una pieza de infraestructura para aplicaciones de voz en gallego dentro de asistentes y sistemas embebidos que usan OVOS, donde la disponibilidad de voces de calidad en lenguas minorizadas es limitada. No es un modelo de lenguaje general, sino un componente especializado de síntesis acústica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matcha-TTS (modelo acústico TTS basado en flow matching, empaquetado en ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; la entrada es una secuencia de fonemas) |
| Tipos de cuantizacion | no disponible (el repositorio se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | gallego (gl-ES) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Matcha-TTS, un modelo acústico de síntesis de voz basado en flow matching condicionado por fonemas, que genera mel-espectrogramas a partir de una secuencia fonémica y posteriormente se convierte en audio mediante un vocoder (no documentado en la información disponible). La entrada de texto se procesa con el fonemizador Cotovia (`CotoviaPhonemizer` de `scriptconv_copyleft.phonemizers.gl`), que normaliza el texto y lo convierte al alfabeto fonético Cotovia antes de pasarlo al modelo.

El entrenamiento original fue realizado por Proxecto Nós, pero no se dispone de detalles sobre el número de tokens, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas más allá del empaquetado ONNX para phoonnx. El modelo no incorpora decodificación especulativa ni mecanismos de atención lineal documentados en la información proporcionada.

## Capacidades

- Síntesis de voz (text-to-speech) en gallego (gl-ES) a partir de texto normalizado.
- Conversión de texto a fonemas mediante el fonemizador Cotovia, con soporte del alfabeto Cotovia.
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Integración como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni visión.
- Capacidad monolingüe: únicamente gallego.
- No dispone de modo thinking ni de procesamiento de audio de entrada.

## Casos de uso

- Asistentes de voz en gallego sobre OVOS: el modelo se integra como plugin de TTS y permite respuestas habladas en gallego en asistentes domésticos o embebidos, aprovechando la configuración `mycroft.conf` documentada.
- Lectura de textos y notificaciones en aplicaciones gallegas: se puede usar para convertir texto de interfaz de usuario en audio, con la ventaja de que el fonemizador Cotovia maneja la normalización del texto gallego.
- Accesibilidad para personas con discapacidad visual: síntesis de contenido escrito en gallego en lectores de pantalla o aplicaciones de lectura, al ser un modelo ligero (0,1 GB) apto para despliegue local.
- Sistemas de megafonía y anuncios automatizados: generación de locuciones en gallego para transporte público, comercios o eventos, con inferencia ONNX eficiente en CPU.
- Prototipado de interfaces conversacionales en gallego: al estar empaquetado en ONNX y disponible vía pip, permite iterar rápidamente en demos de voz sin infraestructura GPU dedicada.
- Investigación en lenguas minorizadas: sirve como base para experimentos de TTS en gallego y para comparar con otras voces del ecosistema phoonnx, dado que el modelo es de código abierto con licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio de 0,1 GB sugiere un modelo compacto que probablemente cabe en memoria de CPU, pero no se documentan requisitos exactos.
- GPU recomendadas: no disponible; al ser un modelo ONNX pequeño, es probable que funcione en CPU y en GPUs consumer, pero no se especifica.
- ¿Cabe en consumer GPU? No disponible de forma explícita; el tamaño del repositorio (0,1 GB) indica que sí es viable en hardware modesto.
- Opciones de despliegue: phoonnx (Python), plugin OVOS (`ovos-tts-plugin-phoonnx`); no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo TTS ONNX).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| matcha-gl_es-icia_phonemes-cotovia | Matcha-TTS (ONNX) | gallego (gl-ES) | no aplica | Apache 2.0 | ONNX | Hugging Face (Phoonnx) |
| proxectonos/Nos_TTS-icia-matcha-phonemes | Matcha-TTS | gallego | no aplica | Apache 2.0 | no disponible | Hugging Face (Proxecto Nós) |
| Otras voces Matcha-TTS de la colección Phoonnx | Matcha-TTS (ONNX) | varios idiomas | no aplica | según modelo | ONNX | Hugging Face (colección Phoonnx) |

La información disponible no permite comparar rendimiento (benchmarks) con alternativas; solo se dispone de datos de arquitectura, licencia y formato.

## Limitaciones y advertencias

- Modelo monolingüe: solo sintetiza gallego (gl-ES); no admite otros idiomas.
- Depende del fonemizador Cotovia para la entrada; textos mal normalizados o fuera del alfabeto Cotovia pueden degradar la síntesis.
- No se documentan sesgos específicos, pero al ser un modelo entrenado por Proxecto Nós, puede reflejar sesgos de los datos de entrenamiento originales (no detallados).
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero la síntesis puede producir artefactos acústicos en entradas atípicas.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del checkpoint upstream y del vocoder asociado.
- No se documentan requisitos de hardware ni latencia, lo que dificulta planificar despliegues en producción.
- El repositorio tiene muy pocas descargas (21) y ningún like, lo que sugiere poca validación comunitaria.
- La fecha de creación (2026-11-14) es futura respecto a la información habitual; conviene verificar la vigencia del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/matcha-gl_es-icia_phonemes-cotovia
- Upstream: https://huggingface.co/proxectonos/Nos_TTS-icia-matcha-phonemes
- Colección Matcha-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/matcha-tts-6af8ea8f6a5b1af4d985d2ad
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
