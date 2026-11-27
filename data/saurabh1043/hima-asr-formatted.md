# saurabh1043/hima-asr-formatted

## Resumen

Hima-ASR Formatted (C2m) es un ajuste fino del modelo de reconocimiento automático del habla Prahaladha/hima-asr, desarrollado por el usuario saurabh1043. Su aportación principal es un tercer estilo de salida denominado `formatted`, que genera transcripciones con puntuación, mayúsculas, dígitos y entidades en forma escrita (por ejemplo `₹7,000`, `EMI`, `4:00 PM`), manteniendo las palabras en inglés en caracteres latinos. Los estilos originales `native` y `mixed` siguen disponibles.

El modelo está orientado a entornos de contact center y conversaciones multilingües de la India, con cobertura de doce idiomas: asamés, bengalí, guyaratí, hindi, canarés, malabar, maratí, oriya, panyabí, tamil, telugu e inglés. Combina un codificador de audio procedente de Qwen3-ASR-1.7B con un decodificador de texto derivado de Gemma 3 270M, sumando 463.856.679 parámetros totales.

Es relevante ahora porque aborda un problema práctico poco resuelto en ASR para idiomas indios: la salida de texto "en crudo" que requiere un postprocesado de puntuación y normalización inversa. El autor lo etiqueta explícitamente como experimental, con resultados obtenidos de una sola semilla de entrenamiento y evaluados sobre muestras de 100 clips por conjunto de test.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio (Qwen3-ASR-1.7B) + decodificador de texto (derivado de Gemma 3 270M), con cabeza de decisión adicional |
| Parametros totales | 463.856.679 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | as, bn, gu, hi, kn, ml, mr, or, pa, ta, te, en |
| Licencia | apache-2.0-and-gemma (cambios bajo Apache 2.0; decodificador de texto sujeto a Gemma Terms of Use) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un sistema híbrido de dos componentes: un codificador de audio tomado de Qwen3-ASR-1.7B (Apache 2.0) y un decodificador de texto que es un derivado de Gemma 3 270M, sujeto a los términos de Gemma. Incluye además una cabeza de decisión (`decide/`) heredada del modelo base, que se lee a través de `decide/reader.safetensors`, una copia del proyector y decodificador originales de Hima (unos 0,3 GB), ya que el ajuste fino altera los estados del decodificador sobre los que se entrenó dicha cabeza.

Durante el ajuste fino se congelaron el codificador de audio y todas las filas originales de la tabla de embeddings compartida con la salida (entrenarlas con Adam sobre datos estrechos colapsaba el modelo). Se entrenaron el decodificador de texto y el proyector con learning rate 1e-5 durante 2.000 pasos. Se añadieron 6.464 piezas nuevas al vocabulario, incluyendo puntuación, `₹`, `@` y la etiqueta `formatted`, inicializadas desde un vector calibrado con un calentamiento de 300 pasos que entrena solo las filas nuevas. Las mayúsculas se representan mediante marcadores (`<unused0>` para capitalizar la palabra anterior, `<unused1>` para ponerla en mayúsculas) que `transcribe()` aplica después.

Los datos de entrenamiento incluyen repetición de habla real (IndicVoices, SPRING-INX, Vaani, Kathbath y FLEURS train para en/or/as), habla sintética de contact center con formato, aumentada con códec telefónico, ruido y segundo hablante, y aproximadamente 91.000 clips reales con etiquetas formateadas derivadas mediante un modelo de puntuación y un léxico de capitalización, conservando solo filas sin palabras numéricas.

## Capacidades

- Reconocimiento automático del habla multilingüe en doce idiomas indios e inglés.
- Tres estilos de salida: `native` (sin formato), `mixed` (como el modelo base) y `formatted` (puntuación, mayúsculas, dígitos y entidades escritas).
- Puntuación y truecasing en la salida `formatted`.
- Normalización inversa de texto: dígitos y entidades en forma escrita (`₹7,000`, `EMI`, `4:00 PM`).
- Manejo de code-switching con palabras en inglés en caracteres latinos.
- Cabeza de decisión que devuelve, además del texto, un diccionario de decisiones (`{"text": ..., "decisions": {...}}`).
- Selección de idioma en tiempo de decodificación, con restricciones sobre piezas de etiqueta que solo se aplican cuando se especifica `language`.

## Casos de uso

- Transcripción de llamadas de contact center: el estilo `formatted` genera directamente texto con puntuación, mayúsculas y entidades como importes o fechas, reduciendo la necesidad de un modelo de puntuación posterior. En habla conversacional real (SPRING-INX) el formato alcanza un F1 de fin de frase de 0,63, comparable a encadenar Hima con un modelo de puntuación separado.
- Generación de actas y resúmenes a partir de audio: la salida con puntuación y mayúsculas facilita el consumo por modelos de lenguaje posteriores sin postprocesado adicional.
- Subtitulado y transcripción de contenido en idiomas indios: cobertura de asamés, bengalí, guyaratí, hindi, canarés, malabar, maratí, oriya, panyabí, tamil y telugu con un único modelo.
- Extracción de entidades en llamadas financieras: la conservación exacta de dígitos en entidades alcanza el 86% en Entity_ASR y el 74% en FLEURS, frente al 72% y 71% del modelo original, lo que resulta adecuado para capturar importes de EMI o números de referencia.
- Análisis de conversaciones bilingües hindi-inglés o tamil-inglés: el estilo `mixed` mejora el CER del modelo base en todos los conjuntos evaluados (FLEURS 5,4 → 4,1; Kathbath 5,1 → 2,6; IndicVoices 8,8 → 7,8; Lahaja 9,4 → 4,8).
- Transcripción de inglés indio: en Svarah el estilo `native` reduce el SA-CER de 10,2 a 7,4 y el estilo `formatted` obtiene 6,4 frente a 8,3 de `mixed`, lo que lo hace útil para audios de hablantes indios de inglés.
- Pipelines de ASR con selección de idioma explícita: la API permite fijar `language` y `style` por petición, lo que facilita el enrutado por idioma en despliegues multipropósito.

## Benchmarks y rendimiento

Resultados del estilo `native`, SA-CER (original → este modelo), sobre 100 clips por conjunto de test:

| Familia | Original | Este modelo | Δ [IC 95%] |
|---|---:|---:|---|
| FLEURS (12 idiomas) | 3,6 | 3,7 | +0,0 [−0,4, +0,4] |
| Kathbath | 1,7 | 1,8 | +0,1 [+0,0, +0,2] |
| IndicVoices | 5,9 | 6,0 | +0,1 [−0,1, +0,2] |
| Vaani-Benchmark | 4,1 | 3,8 | −0,3 [−0,5, −0,0] |
| Lahaja (lectura) | 2,2 | 3,0 | +0,8 [+0,3, +1,3] |
| Svarah (inglés indio) | 10,2 | 7,4 | −2,8 [−5,5, −0,9] |
| SPRING-INX | 17,2 | 17,1 | −0,1 [−0,3, +0,2] |

Estilo `mixed`, SA-CER (original → este modelo): FLEURS 5,4 → 4,1; Kathbath 5,1 → 2,6; IndicVoices 8,8 → 7,8; Lahaja 9,4 → 4,8.

Estilo `formatted`:

| Métrica | Resultado |
|---|---|
| Recuperación de palabras capitalizadas, FLEURS | 84% |
| Recuperación de palabras capitalizadas, Entity_ASR | 81% |
| F1 de puntuación de fin de frase, FLEURS | 0,87 |
| F1 de puntuación de interrogación, FLEURS | 0,61 |
| F1 de puntuación de fin de frase, Entity_ASR | 0,72 |
| F1 de coma, Entity_ASR | 0,49 |
| Entidades numéricas exactas, FLEURS | 74% (original: 71%) |
| Entidades numéricas exactas, Entity_ASR | 86% (original: 72%) |
| F1 de fin de frase en SPRING-INX | 0,63 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 463,9 millones de parámetros en fp32 el peso ronda los 1,9 GB, y el repositorio completo ocupa 2,3 GB, a lo que se suma la copia del lector de la cabeza de decisión (unos 0,3 GB).
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: por tamaño, el modelo debería caber en GPU de consumo con suficiente VRAM, pero no se confirma en la documentación.
- Opciones de despliegue: la model card solo documenta uso con `transformers` mediante `AutoModel.from_pretrained(..., trust_remote_code=True, dtype=torch.float32)`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Estilos de salida | Licencia | Estado |
|---|---|---|---|---|---|
| saurabh1043/hima-asr-formatted | 463,9 M | 12 (11 indios + en) | native, mixed, formatted | apache-2.0-and-gemma | Experimental |
| Prahaladha/hima-asr | no disponible | 12 (11 indios + en) | native, mixed | no disponible | Base |
| Qwen3-ASR-1.7B | 1.700 M (codificador) | no disponible | no disponible | Apache 2.0 | Componente del codificador |

No se dispone de datos de benchmarks de modelos comparables independientes en la información proporcionada.

## Limitaciones y advertencias

- Deriva en habla leída: Lahaja empeora +0,8 SA-CER y Kathbath +0,1 en estilo `native`.
- Reconocimiento de inglés: bajo `formatted` suele ser peor que bajo `mixed`, por ejemplo FLEURS inglés 10,3 frente a 5,7 SA-CER; Svarah es la excepción (6,4 frente a 8,3).
- Correos electrónicos e identificadores: en habla real suelen aparecer deletreados en palabras.
- Llamadas reales: las comas y las interrogaciones en conversaciones reales son débiles.
- Oriya y asamés: sin datos reales formateados derivados, su formato es menos fiable.
- Estado experimental: resultados de una sola semilla de entrenamiento y evaluados sobre 100 clips por conjunto de test.
- Licencia: los cambios son Apache 2.0, pero el decodificador de texto es un derivado de Gemma 3 270M y queda sujeto a los Gemma Terms of Use, incluida la Prohibited Use Policy; el uso comercial debe revisarse contra esos términos.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saurabh1043/hima-asr-formatted
- Modelo base: https://huggingface.co/Prahaladha/hima-asr
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
- Política de uso prohibido de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
