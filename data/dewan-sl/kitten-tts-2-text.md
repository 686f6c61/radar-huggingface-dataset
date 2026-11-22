# dewan-sl/kitten-tts-2-text

## Resumen

Kitten TTS 2 text es un paquete de datos auxiliares publicado por el usuario dewan-sl en Hugging Face, no un modelo de síntesis de voz propiamente dicho. Contiene los recursos de procesamiento de texto (lexicones, reglas de tokenización, etiquetado gramatical y datos de espeak-ng) que el SDK de React Native de KittenTTS descarga para fonemizar texto exactamente igual que el paquete Python `kittenml` cuando se usan los modelos Kitten TTS 2 Nano, Pico y Mini.

El repositorio se presenta como un artefacto de soporte para el SDK móvil: incluye lexicones de inglés americano de misaki 0.9.4, CMUdict adaptado al alfabeto de misaki, reglas del tokenizador y etiquetador de spaCy `en_core_web_sm` 3.8.0 exportadas a ONNX en float16, y los datos compilados de espeak-ng 1.52.0. El paquete incluye un `manifest.json` con el tamaño y el sha256 de cada fichero, y los ficheros comprimibles se almacenan en gzip.

Es relevante para desarrolladores que integren TTS en aplicaciones React Native y necesiten paridad de pronunciación con el pipeline Python de KittenTTS. No contiene pesos de red neuronal de síntesis, sino recursos deterministas de preprocesamiento lingüístico; su tamaño de repositorio reportado es de 0.0 GB, lo que sugiere que los ficheros se cargan de forma diferida o que las métricas de tamaño no están actualizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Paquete de datos de preprocesamiento de texto (no es un modelo neuronal); incluye tokenizador y POS tagger spaCy exportados a ONNX y datos compilados de espeak-ng |
| Parametros totales | no disponible (no es un modelo de parametros; los pesos ONNX de spaCy son de `en_core_web_sm` en float16) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos ONNX de spaCy se distribuyen en float16) |
| Idiomas soportados | Inglés americano (lexicones misaki y CMUdict); espeak-ng aporta datos multilingües, pero la cobertura declarada del paquete es el inglés |
| Licencia | other (compuesta: Apache-2.0 para misaki, BSD-style para CMUdict, MIT para spaCy, GPL-3.0-or-later para espeak-ng) |
| Formato de pesos | JSON, ONNX (float16) y datos compilados de espeak-ng; ficheros comprimibles en `.gz` |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, sino de un paquete de recursos lingüísticos generado por el script `tools/kitten-tts-2-tiny/build_text_pack.py`. Su función es replicar en el entorno React Native la cadena de fonemización del paquete Python `kittenml`: normalización y tokenización con reglas de spaCy `en_core_web_sm` 3.8.0, etiquetado gramatical mediante una red ONNX en float16, consulta de lexicones de misaki 0.9.4 y CMUdict en el alfabeto de misaki, y respaldo con los datos compilados de espeak-ng 1.52.0.

La innovación técnica es la paridad de comportamiento entre plataformas: al empaquetar las mismas reglas y lexicones que usa el pipeline Python, se evita que la pronunciación difiera entre la SDK móvil y el entorno de referencia. El `manifest.json` con tamaños y hashes sha256 permite verificar la integridad de cada fichero descargado, y el uso de gzip reduce el peso de los recursos que comprimen bien.

## Capacidades

- Fonemización de texto en inglés americano con las mismas reglas que el paquete Python `kittenml`.
- Tokenización y etiquetado de partes de la oración mediante spaCy `en_core_web_sm` 3.8.0 exportado a ONNX.
- Consulta de lexicones de misaki 0.9.4 y de CMUdict adaptado al alfabeto de misaki.
- Respaldo multilingüe mediante los datos compilados de espeak-ng 1.52.0.
- Verificación de integridad de ficheros mediante `manifest.json` (tamaño y sha256).
- Descarga diferida de recursos desde el SDK de React Native de KittenTTS.
- No incluye generación de audio, tool calling, razonamiento ni capacidades de agente.

## Casos de uso

- Integración de TTS en aplicaciones React Native: el SDK descarga este paquete para fonemizar texto antes de invocar los modelos Kitten TTS 2 Nano, Pico o Mini, garantizando que la pronunciación coincida con la del paquete Python.
- Paridad entre plataformas en pipelines de voz: equipos que generan audio en servidor con `kittenml` y en cliente con React Native pueden usar los mismos lexicones y reglas para evitar discrepancias de pronunciación.
- Verificación de integridad en despliegues móviles: el `manifest.json` con sha256 permite validar cada recurso descargado en el arranque de la aplicación o en un proceso de CI.
- Reducción del tamaño de la aplicación: al almacenar los ficheros comprimibles en gzip y descargarlos bajo demanda, se evita empaquetar los lexicones y datos de espeak-ng en el binario inicial.
- Normalización de texto previa a TTS en inglés americano: tokenización, etiquetado gramatical y expansión de abreviaturas y números mediante las reglas de spaCy y misaki.
- Investigación sobre fonemización multilingüe: los datos de espeak-ng permiten experimentar con otros idiomas dentro del mismo pipeline, aunque la cobertura declarada del paquete es el inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No requiere GPU: es un paquete de datos de preprocesamiento de texto.
- El consumo de CPU y memoria depende del runtime ONNX que ejecute el tokenizador y el POS tagger de spaCy en float16, y de la carga de los lexicones JSON.
- Almacenamiento: el tamaño real depende de los ficheros listados en `manifest.json`; la métrica de tamaño del repositorio en Hugging Face figura como 0.0 GB y no es fiable.
- Despliegue: se integra en el SDK de React Native de KittenTTS y en el paquete Python `kittenml`; no aplica a servidores de inferencia como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Paquete | Contenido | Idiomas | Licencia | Formato |
|---|---|---|---|---|
| dewan-sl/kitten-tts-2-text | Lexicones misaki, CMUdict, spaCy ONNX, espeak-ng | Inglés americano (con respaldo espeak-ng) | other (Apache-2.0, BSD, MIT, GPL-3.0-or-later) | JSON, ONNX, datos compilados |
| Paquete Python `kittenml` | Pipeline de referencia de fonemización de KittenTTS | Inglés americano | no disponible | Python |
| misaki (hexgrad) | Lexicones y reglas G2P para inglés americano | Inglés americano | Apache-2.0 | JSON |
| espeak-ng | Motor de síntesis y datos fonéticos multilingües | Múltiples | GPL-3.0-or-later | Datos compilados |

No se dispone de datos de rendimiento comparativo entre estos paquetes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de TTS: no genera audio por sí mismo; solo prepara texto para los modelos Kitten TTS 2 Nano, Pico y Mini.
- La licencia es compuesta y no uniforme: espeak-ng se distribuye bajo GPL-3.0-or-later, lo que puede imponer obligaciones de copyleft si se redistribuye el paquete dentro de una aplicación propietaria; conviene revisar cada componente antes de uso comercial.
- La cobertura declarada es el inglés americano; el respaldo de espeak-ng no garantiza la misma calidad de fonemización en otros idiomas.
- El repositorio muestra 0 descargas y 0 likes, y el tamaño reportado es 0.0 GB, lo que sugiere que el artefacto podría estar incompleto o que las métricas no reflejan su contenido real.
- Depende de versiones concretas (misaki 0.9.4, spaCy 3.8.0, espeak-ng 1.52.0); cambios de versión en el SDK pueden romper la paridad de pronunciación.
- No se han publicado benchmarks ni evaluaciones de calidad de fonemización en la informacion disponible.
- Riesgo de desactualización: el paquete se generó con un script interno del proyecto y no se documenta un proceso de mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/dewan-sl/kitten-tts-2-text
- SDK React Native de KittenTTS: https://github.com/KittenML/KittenTTS-react-native
- misaki (hexgrad): https://github.com/hexgrad/misaki
- spaCy models (explosion): https://github.com/explosion/spacy-models
- espeak-ng: https://github.com/espeak-ng/espeak-ng
