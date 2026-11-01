# inklight-app/pocket-tts-without-voice-cloning

## Resumen

Pocket TTS without voice cloning es un modelo de síntesis de voz (text-to-speech) desarrollado por Kyutai, distribuido bajo licencia CC BY 4.0 y entrenado únicamente para inglés. Esta ficha documenta la réplica publicada por inklight-app, una copia byte a byte de los ficheros originales de Kyutai (commit `a7056f5`, del 21 de octubre de 2026), pensada para que la aplicación iOS Inklight pueda descargar los recursos en una revisión fija aunque el repositorio original cambie o desaparezca. No se trata, por tanto, de un modelo nuevo ni de un fine-tuning: es un espejo de artefactos.

El repositorio contiene solo los recursos auxiliares del sistema: el tokenizador inglés (`tokenizer.model`) y diez embeddings de voz en formato safetensors (alba, anna, azelma, charles, eponine, fantine, george, michael, paul y vera). Los pesos del modelo propiamente dichos no están aquí: la aplicación los obtiene en versión de 8 bits desde `inklight-app/pocket-tts-q8`, y los estados de voz ralentizados y las voces VCTK propias desde `inklight-app/paced-voices`.

Su relevancia es de ingeniería de despliegue más que de investigación: ilustra un patrón habitual en aplicaciones móviles que dependen de modelos de terceros, el pinning de artefactos por revisión para garantizar reproducibilidad en instalaciones nuevas. Cualquier evaluación técnica del modelo debe hacerse sobre el repositorio original de Kyutai.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio solo contiene tokenizador y embeddings de voz; los pesos están en `inklight-app/pocket-tts-q8`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (via `inklight-app/pocket-tts-q8`); el resto, no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (embeddings de voz); tokenizador en `tokenizer.model`; pesos del modelo, no disponibles en este repo |
| Tamano del repositorio | 0,1 GB |
| Libreria | `pocket-tts` |
| Modelo base | `kyutai/pocket-tts-without-voice-cloning` |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo en la documentación proporcionada. El nombre del repositorio original (`pocket-tts-without-voice-cloning`) indica que se distribuye una variante de Pocket TTS sin la funcionalidad de clonación de voz, es decir, limitada a un conjunto cerrado de voces preentrenadas. Los detalles de arquitectura, número de tokens de entrenamiento, composición del dataset y si hubo RLHF o ajuste por preferencias no están disponibles.

Lo que sí documenta la model card es la procedencia de los embeddings de voz: nueve de las diez voces (anna, azelma, charles, eponine, fantine, george, michael, paul y vera) provienen del CSTR VCTK Corpus 0.92 de la Universidad de Edimburgo (Yamagishi, Veaux y MacDonald, DOI 10.7488/ds/2645), y la voz alba procede de la grabación «Casual» de Alba MacKenna. Ambos orígenes están licenciados bajo CC BY 4.0. Los embeddings fueron generados por Kyutai y publicados originalmente en `kyutai/tts-voices`. No se describe ninguna innovación técnica adicional (decodificación especulativa, atención lineal u otras) en la información disponible.

## Capacidades

- Síntesis de voz a partir de texto en inglés, con diez voces predefinidas.
- Selección de voz mediante embeddings independientes en safetensors, lo que permite intercambiar voces sin recargar el modelo completo.
- Tokenización específica para inglés (`tokenizer.model`), lo que sugiere un vocabulario optimizado para ese idioma.
- Distribución en cuantización de 8 bits a través del repositorio complementario `inklight-app/pocket-tts-q8`, orientada a inferencia en dispositivo.
- No incluye clonación de voz: la variante distribuida está explícitamente limitada a las voces incluidas.
- Soporte multilingüe: no disponible (solo inglés).
- Tool calling, function calling, razonamiento multi-paso, visión o audio de entrada: no aplica a un modelo TTS y no se documenta.

## Casos de uso

- Lectura de libros en voz alta en dispositivos iOS: es el caso de uso real de esta réplica, ya que Inklight descarga estos ficheros para narrar texto con las diez voces incluidas. El tamaño reducido del repositorio (0,1 GB) y la cuantización de 8 bits facilitan su almacenamiento local en el teléfono.
- Audiolibros y contenido editorial: el conjunto de voces del VCTK Corpus ofrece variedad de timbres (masculinos y femeninos, distintos acentos británicos) adecuada para narraciones largas con un solo narrador por obra.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla o aplicaciones de lectura asistida que necesiten una voz natural en inglés sin depender de servicios en la nube.
- Aprendizaje de idiomas: generación de audio de pronunciación para materiales de inglés, aprovechando la calidad de las grabaciones de origen del VCTK.
- Prototipado de asistentes de voz: la librería `pocket-tts` y los embeddings separados permiten iterar sobre la voz del asistente sin reentrenar ni redistribuir pesos nuevos.
- Pruebas de regresión en pipelines de TTS: al fijar una revisión concreta de los artefactos, los equipos pueden garantizar que el audio generado en tests automatizados no cambia entre despliegues, algo crítico en aplicaciones móviles con actualizaciones escalonadas.
- Archivado y preservación: el repositorio sirve como copia de seguridad de los recursos de Kyutai para garantizar la disponibilidad a largo plazo de la aplicación que los consume.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio documentado contiene solo tokenizador y embeddings (0,1 GB); los pesos del modelo residen en `inklight-app/pocket-tts-q8` y su tamaño no se especifica.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible. El contexto de uso (aplicación iPhone que lee en el dispositivo) sugiere inferencia en hardware móvil o Apple Silicon, pero no se aportan requisitos formales.
- Opciones de despliegue: librería `pocket-tts` (indicada en la model card); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no son habituales para modelos TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de TTS que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Este repositorio no contiene los pesos del modelo, solo tokenizador y embeddings de voz; no es utilizable por sí solo para inferencia.
- Idioma limitado al inglés; no hay soporte documentado de otras lenguas.
- La variante distribuida no permite clonación de voz, lo que restringe su uso a las diez voces incluidas.
- Las condiciones de uso de Kyutai prohíben expresamente el uso para suplantación de identidad o clonación de voz sin consentimiento explícito y lícito, para engañar o para producir contenido ilícito o dañino.
- Kyutai no respalda a Inklight ni esta copia; los ficheros se distribuyen sin garantía.
- La licencia CC BY 4.0 permite uso comercial, pero exige atribución a Kyutai y a los titulares de las grabaciones originales (VCTK Corpus y Alba MacKenna).
- Riesgo de alucinación: no aplica en el sentido habitual de generación de texto, pero un TTS puede producir pronunciaciones incorrectas de nombres propios, siglas o términos técnicos no vistos en entrenamiento.
- Sesgos: no documentados; el uso de un corpus académico como VCTK puede implicar una distribución limitada de acentos y edades.
- Para producción, conviene fijar la revisión del repositorio original de Kyutai y verificar la integridad de los ficheros, ya que esta copia se ofrece como espejo sin mantenimiento declarado.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/inklight-app/pocket-tts-without-voice-cloning
- Repositorio original de Kyutai: https://huggingface.co/kyutai/pocket-tts-without-voice-cloning
- Modelo Pocket TTS: https://huggingface.co/kyutai/pocket-tts
- Pesos en 8 bits: https://huggingface.co/inklight-app/pocket-tts-q8
- Voces propias de Inklight: https://huggingface.co/inklight-app/paced-voices
- Embeddings de voz originales: https://huggingface.co/kyutai/tts-voices
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- CSTR VCTK Corpus 0.92: https://doi.org/10.7488/ds/2645
