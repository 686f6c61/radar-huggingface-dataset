# PiperPlatforms/narration

## Resumen

PiperPlatforms/narration no es un modelo de lenguaje en sentido estricto, sino un repositorio de distribucion de artefactos para la funcion "Narration" de la aplicacion de escritorio Piper. Cuando el usuario activa Narration en Ajustes, IA y modelos, la app descarga desde este repositorio dos tipos de archivos comprimidos: un entorno de ejecucion CPython relocalizable y una cache de Hugging Face con el modelo de sintesis de voz. Piper verifica cada archivo contra un sha256 compilado en la aplicacion antes de extraerlo, y no carga archivos de este repositorio por ninguna otra via.

El motor de voz subyacente es pocket-tts, desarrollado por Kyutai, en su variante sin clonacion de voz (kyutai/pocket-tts-without-voice-cloning, con licencia CC BY 4.0). El repositorio incluye ademas embeddings precalculados para las voces comercialmente usables provenientes de kyutai/tts-voices (CC0 y CC BY 4.0), y excluye explicitamente cualquier voz con licencia CC BY-NC. La licencia declarada del repositorio es CC BY 4.0 y el espacio ocupa 0,7 GB.

El repositorio es relevante porque documenta un patron de despliegue de TTS en aplicaciones de escritorio: empaquetado de un interprete de Python portable junto con el modelo y sus dependencias, verificacion de integridad por hash y ausencia total de funciones de clonacion de voz. No se publican en la informacion disponible datos sobre arquitectura, numero de parametros o rendimiento del modelo subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no documenta la arquitectura del motor TTS subyacente) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que el modelo subyacente sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | cc-by-4.0 (repositorio); modelo subyacente pocket-tts bajo CC BY 4.0 de Kyutai; voces bajo CC0 y CC BY 4.0 |
| Formato de pesos | no disponible; el repositorio distribuye archivos `.tar.gz` con un runtime CPython relocalizable y una cache de Hugging Face |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo de sintesis de voz subyacente. Lo unico documentado es que el motor es pocket-tts, de Kyutai, y que se distribuye en su variante "without voice cloning", es decir, sin la capacidad de clonar voces. El repositorio tampoco detalla datos de entrenamiento, numero de tokens, composicion del dataset ni si hubo etapas de ajuste por refuerzo o preferencias.

La innovacion tecnica documentada no esta en el modelo, sino en el mecanismo de distribucion: cada plataforma recibe un archivo `narration-engine-<platform>-<version>.tar.gz` que contiene un CPython relocalizable procedente de python-build-standalone junto con pocket-tts (MIT) y sus dependencias, y un archivo `narration-model-pocket-tts-<version>.tar.gz` que contiene una cache de Hugging Face con el modelo y embeddings de voz precalculados. Cada paquete incluido conserva su propia licencia, registrada en sus metadatos dentro del archivo. La aplicacion verifica un sha256 compilado antes de extraer cualquier cosa.

## Capacidades

- Sintesis de voz (text-to-speech) integrada en la aplicacion de escritorio Piper, activable desde Ajustes, IA y modelos.
- Uso de voces comercialmente usables precalculadas a partir de kyutai/tts-voices, con licencias CC0 y CC BY 4.0.
- Distribucion multiplataforma del motor: los nombres de archivo indican variantes por plataforma (`<platform>`) y por version (`<version>`).
- Verificacion de integridad de los artefactos descargados mediante sha256.
- No expone clonacion de voz: el repositorio excluye explicitamente cualquier voz con licencia CC BY-NC y la app no ofrece funciones de clonacion.
- Soporte de tool calling, agentes, razonamiento, codigo, matematicas, vision o audio mas alla del TTS: no aplica o no disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Lectura por voz en la aplicacion de escritorio Piper: el usuario activa Narration en Ajustes y la app descarga el motor y el modelo desde este repositorio para leer contenido con voces comerciales preinstaladas.
- Distribucion de TTS en producto de escritorio sin dependencia de servicios en la nube: el empaquetado de CPython relocalizable permite que el motor se ejecute dentro del entorno de la aplicacion, con verificacion de integridad por hash en cada extraccion.
- Narracion de documentos largos en local: el motor de sintesis se descarga una sola vez y queda cacheado en la maquina del usuario, lo que evita llamadas repetidas a APIs externas.
- Auditoria de licencias en productos comerciales: la seleccion de voces limitada a CC0 y CC BY 4.0, con exclusion de CC BY-NC, facilita el cumplimiento en productos de pago.
- Escenarios que requieren ausencia de clonacion de voz: al no exponer clonacion, el repositorio encaja en despliegues donde se debe impedir la suplantacion de identidad vocal.
- Integracion de TTS en aplicaciones de terceros basadas en el ecosistema Piper: los artefactos pueden descargarse y verificarse siguiendo el mismo esquema de hash documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible.
- GPU recomendadas: no disponible; el repositorio no especifica requisitos de aceleracion por GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el patron documentado es el empaquetado de un CPython relocalizable procedente de python-build-standalone junto con pocket-tts y sus dependencias, distribuido como archivos `.tar.gz` por plataforma y version. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.
- Tamano de los artefactos: el repositorio completo ocupa 0,7 GB, incluyendo el runtime de Python y la cache del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| PiperPlatforms/narration | no disponible | no disponible | cc-by-4.0 | Repositorio de artefactos en Hugging Face |
| kyutai/pocket-tts-without-voice-cloning | no disponible | no disponible | CC BY 4.0 | Modelo upstream en Hugging Face |
| kyutai/tts-voices | no disponible | no disponible | CC0 y CC BY 4.0 (se excluyen las CC BY-NC) | Coleccion de voces en Hugging Face |

No se dispone de datos de rendimiento ni de parametros que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- El repositorio no es un modelo utilizable directamente: contiene archivos de distribucion que Piper verifica contra un sha256 compilado en la aplicacion antes de extraerlos, y no esta pensado para cargarse de otra forma.
- No se publican especificaciones tecnicas del motor TTS subyacente: ni arquitectura, ni parametros, ni idiomas, ni cuantizaciones.
- Ausencia total de clonacion de voz: la funcionalidad no esta expuesta y el repositorio excluye explicitamente las voces con licencia CC BY-NC.
- Politica de uso restringida por parte de Kyutai: se prohibe la suplantacion o clonacion de voz sin consentimiento explicito y legal, la desinformacion y el fraude, y presentar el audio generado como una grabacion autentica.
- Riesgo de uso indebido del audio sintetizado en contextos donde no se declare su naturaleza sintetica, sujeto a la politica de uso anterior.
- Licencias heterogeneas: el repositorio es CC BY 4.0, el motor pocket-tts es MIT, el modelo es CC BY 4.0 de Kyutai y las voces son CC0 o CC BY 4.0. Cada paquete conserva su licencia en los metadatos del archivo, por lo que la reutilizacion exige revisarlas una a una.
- No se documentan sesgos, tasas de alucinacion ni limitaciones de contexto o idioma.
- No se han publicado benchmarks ni metricas de calidad de sintesis en la informacion disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/PiperPlatforms/narration
- Modelo upstream de sintesis de voz: https://huggingface.co/kyutai/pocket-tts-without-voice-cloning
- Coleccion de voces de Kyutai: https://huggingface.co/kyutai/tts-voices
- Repositorio de pocket-tts: https://github.com/kyutai-labs/pocket-tts
- CPython relocalizable: https://github.com/astral-sh/python-build-standalone
