# Infinix-io/FishAudio-Drama3-TTS-83Lang-Qwen3.5-35B-A3B-FP8-BF16-GGUF

## Resumen

Fish Audio Drama 3 es un modelo de texto a voz (TTS) de nueva generación desarrollado por Fish Audio, orientado a la generación de escenas con múltiples personajes y contenido largo. Este repositorio, publicado por Infinix-io, es una cuantización en formato GGUF del modelo base fishaudio/drama-3, que combina un backbone de texto MoE de 35,9 mil millones de parámetros (con 3B activos por token, basado en Qwen3.5) con un decodificador de audio Codebook-MTP de 10 codebooks.

Su relevancia radica en que aborda un problema clásico del TTS: la generación coherente de diálogos largos con varios hablantes, clonación de voz y control por lenguaje natural (incluyendo etiquetas de eventos como "[sighs]" o "[laughs]" insertadas en el texto). Además, permite edición de audio como continuación, tratando los tokens de audio como un modelo de lenguaje causal. Soporta oficialmente 83 idiomas, incluido el castellano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atención híbrida (full + linear), backbone Qwen3.5, decodificador de audio Codebook-MTP (10 codebooks) |
| Parametros totales | 35.899.643.008 (~35,9B) |
| Parametros activos | 3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (expertos MoE), BF16 (resto de pesos), GGUF |
| Idiomas soportados | 83 (incluye es, en, zh, ja, ko, pt, ar, ru, fr, de, it, ca, eu, gl, y muchos más) |
| Licencia | apache-2.0 (según tag) con license_name "fish-audio-research-license"; existe contradicción en la model card |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

Drama 3 emplea una arquitectura de mezcla de expertos (MoE) con 35,9B de parámetros totales y 3B activos por token, lo que reduce significativamente el coste de inferencia. La atención es híbrida, combinando atención completa con atención lineal, lo que resulta adecuado para secuencias de audio largas. El decodificador de audio utiliza la técnica Codebook-MTP: 10 codebooks que se decodifican de forma causal sobre toda la secuencia, en lugar de por ventanas independientes, lo que mejora la coherencia temporal del audio generado.

Los expertos MoE están cuantizados en FP8 mientras el resto de pesos se mantienen en BF16. El modelo admite hasta 16 hablantes por texto mediante etiquetas de hablante (`<|speaker:0|>` … `<|speaker:15|>`), y los textos largos se trocean automáticamente con posibilidad de streaming por fragmento. No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en la información disponible.

## Capacidades

- Generación de texto a voz multi-hablante: hasta 16 personajes en un mismo texto mediante etiquetas de hablante.
- Clonación de voz a partir de un clip de referencia corto (el ejemplo publicado usa un clip de 3,9 segundos).
- Control emocional y de eventos mediante etiquetas en línea en el texto, como "[sighs]", "[laughs]".
- Edición de audio como continuación: se envían los tokens VQ previos como contexto y el modelo regenera o corrige palabras concretas manteniendo la voz y el estilo.
- Generación de contenido largo: el texto se trocea automáticamente y puede transmitirse por streaming fragmento a fragmento.
- Soporte multilingüe en 83 idiomas.
- Control por lenguaje natural de la locución.

## Casos de uso

- Doblaje automatizado multilingüe: el soporte de 83 idiomas y la clonación de voz permiten doblar contenido audiovisual manteniendo la voz original del actor, como demuestra la plataforma NOESIS de AMAImedia en la que se enmarca esta publicación.
- Producción de audiolibros y dramas de audio: las etiquetas de hasta 16 hablantes y el manejo automático de textos largos con streaming lo hacen idóneo para novelas con múltiples personajes.
- Generación de pódcast conversacionales: la generación multi-turno con varios hablantes permite crear diálogos realistas entre dos o más voces.
- Corrección y edición de locuciones en producción: la edición como continuación permite cambiar una palabra concreta ("Wednesday" por "Thursday") sin regenerar todo el audio, ahorrando tiempo en postproducción.
- Asistentes de voz con emoción: las etiquetas de eventos como suspiros o risas aportan expresividad a agentes conversacionales e IVR.
- Localización de videojuegos: la generación multi-personaje con control emocional facilita la producción de diálogos en múltiples idiomas con voces consistentes.
- Accesibilidad: conversión de textos largos a voz natural en idiomas minoritarios incluidos en la lista de soporte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El modelo completo en FP8/BF16 ocupa unos 65,1 GB de repositorio; para inferencia se estima una VRAM del orden de 40-80 GB según la precisión empleada (no disponible un dato oficial exacto).
- GPU recomendadas: H100 o H200 para el modelo completo en FP8; el autor de la cuantización indica que los quants de 9B+ requieren H200/Blackwell alquiladas.
- No cabe en GPUs de consumo en precisión completa; con quants GGUF agresivos podría ejecutarse parcialmente en RAM con offload (el hardware del autor es un portátil con RTX 3060 de 6 GB y 64 GB de DDR5, orientado a imatrix y trabajo en RAM).
- Despliegue recomendado: SGLang Omni, con soporte desde el día de lanzamiento:
  ```bash
  git clone https://github.com/sgl-project/sglang-omni.git && cd sglang-omni
  uv pip install --prerelease=allow -v -e ".[fishaudio]"
  sgl-omni serve --model-path fishaudio/drama-3 --port 8000
  ```
- Exposición de API estilo OpenAI mediante el endpoint `/v1/tts`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multi-hablante | Licencia |
|---|---|---|---|---|
| Fish Audio Drama 3 (este) | 35,9B (3B activos, MoE) | no disponible | Hasta 16 hablantes | fish-audio-research-license / apache-2.0 (contradictorio) |
| Fish Audio / OpenAudio S1 | no disponible | no disponible | Sí (clonación de voz) | no disponible |
| CosyVoice 2 (Alibaba) | no disponible | no disponible | Sí (clonación zero-shot) | no disponible |

No se han publicado datos de rendimiento comparables en la informacion disponible, por lo que la comparativa se limita a características declaradas.

## Limitaciones y advertencias

- Existe una contradicción en la licencia: el tag del repositorio indica apache-2.0, pero license_name declara "fish-audio-research-license". Debe verificarse el archivo LICENSE.md antes de cualquier uso comercial.
- Se trata de una cuantización de terceros (Infinix-io), no del autor oficial del modelo; posibles diferencias de calidad respecto a fishaudio/drama-3 original.
- El repositorio tiene muy pocas descargas (289) y ningún like, por lo que carece de validación comunitaria.
- La model card del autor incluye contenido promocional y de donaciones, no relacionado con el modelo en sí.
- No se ha publicado información sobre sesgos, riesgo de alucinación (en este caso, artefactos de audio o errores de pronunciación), ni límites de contexto.
- La clonación de voz plantea riesgos legales y éticos (suplantación de identidad); es imprescindible contar con consentimiento de la persona cuya voz se clona.
- La inferencia del modelo completo requiere hardware de servidor; no es práctico en GPUs de consumo sin quants agresivos con degradación de calidad.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/Infinix-io/FishAudio-Drama3-TTS-83Lang-Qwen3.5-35B-A3B-FP8-BF16-GGUF
- Modelo base oficial: https://huggingface.co/fishaudio/drama-3
- SGLang Omni (documentación de despliegue): https://sgl-project.github.io/sglang-omni/
- Drama 3 Cookbook: https://sgl-project.github.io/sglang-omni/cookbook/fishaudio_drama3.html
- Repositorio de SGLang Omni: https://github.com/sgl-project/sglang-omni
- Paper (arXiv): https://arxiv.org/abs/2610.18010
- Organización del cuantizador: https://www.amaimedia.com
