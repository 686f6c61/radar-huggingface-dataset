# JYP2024/vpc2026-text-attacker

## Resumen

vpc2026-text-attacker es un conjunto de cabezas de ataque (*attacker heads*) para el VoicePrivacy Challenge 2026, desarrollado por JYP2024. No es un modelo generativo, sino un componente de evaluacion de privacidad: verifica si los transcriptos de voz permiten reidentificar a un hablante. Se construye sobre el codificador congelado BAAI/bge-m3, al que se anade una proyeccion MLP que produce un embedding de hablante de 256 dimensiones a partir unicamente del texto.

El modelo resuelve un problema concreto de la investigacion en privacidad de voz: cuantificar la fuga de informacion de identidad a traves de los transcriptos. Si un sistema de anonimizacion de voz (voice anonymisation) elimina los rasgos acusticos pero conserva el contenido linguistico, un atacante que solo lea el texto podria seguir vinculando ensayos (*trials*) con hablantes de enrolamiento. Estas cabezas permiten medir esa fuga mediante EER (Equal Error Rate).

Es relevante en el contexto del desafio porque proporciona una linea base de ataque textual en cuatro idiomas (ingles, aleman, espanol y frances) sobre los tracks 1 y 2, con datos de evaluacion publicados a fecha de septiembre de 2026. El repositorio tiene 0 descargas y 0 likes, y un tamano de 0.0 GB en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador transformer congelado (BAAI/bge-m3) + cabeza MLP: Linear(1024, 512), ReLU, Linear(512, 256), normalizacion L2 |
| Parametros totales | no disponible (solo se publican los pesos de la proyeccion; el clasificador de hablante no se incluye) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 96 tokens (longitud maxima de texto segun `head.json`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, de, es, fr |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (`head.safetensors`) + JSON de metadatos (`head.json`) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline de dos etapas. Primero, un codificador BAAI/bge-m3 congelado (revision `5617a9f61b028005a4858fdac845db406aefb181`) procesa el transcripto y aplica *mean pooling* sobre la ultima capa, generando una representacion de 1024 dimensiones. Despues, una cabeza especifica por configuracion proyecta esa representacion a un embedding de hablante de 256 dimensiones mediante dos capas lineales con ReLU intermedio y normalizacion L2 final. El enrolamiento se representa como la media de los embeddings de los enunciados de enrolamiento, y los ensayos se puntuan por similitud coseno.

Se publican cinco cabezas con objetivos y datos de entrenamiento distintos. La cabeza `libri` (track 1) se entrena sobre LibriSpeech train-clean-360 con transcriptos de referencia y 921 hablantes, usando softmax. Las cabezas `en`, `de`, `es` y `fr` (track 2) se entrenan sobre los subconjuntos MLS correspondientes con transcriptos generados por Whisper large-v3 y objetivos AAM-softmax, con 3930, 176, 86 y 142 hablantes respectivamente. No se documenta el numero total de tokens de entrenamiento ni el uso de RLHF o DPO, algo esperable dado que es un modelo discriminativo de verificacion y no generativo.

## Capacidades

- Extraccion de embeddings de hablante a partir de transcriptos de voz, con 256 dimensiones por enunciado.
- Verificacion de hablante (*speaker verification*) mediante similitud coseno entre embedding de ensayo y media de enrolamiento.
- Ataque textual en cuatro idiomas: ingles, aleman, espanol y frances.
- Evaluacion de fuga de identidad en pipelines de anonimizacion de voz (VoicePrivacy Challenge 2026, tracks 1 y 2).
- Procesamiento de textos de hasta 96 tokens por enunciado.
- No soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso; es un componente especializado de evaluacion.
- No dispone de capacidades de vision ni audio; opera exclusivamente sobre texto.

## Casos de uso

- Evaluacion de sistemas de anonimizacion de voz: se emplea la cabeza correspondiente al idioma del corpus para calcular el EER sobre las listas de ensayos oficiales, determinando si los transcriptos filtrados permiten reidentificar hablantes.
- Auditoria de privacidad en pipelines ASR: integrado tras un sistema de reconocimiento de voz, mide cuanta informacion de identidad persiste en la salida textual antes de almacenarla o publicarla.
- Investigacion comparativa en el VoicePrivacy Challenge 2026: sirve como ataque de referencia (baseline) frente al que comparar nuevas defensas de anonimizacion en los tracks 1 y 2.
- Validacion de conjuntos de datos de voz: permite cuantificar el riesgo de reidentificacion de los hablantes de un corpus antes de su liberacion, usando la cabeza del idioma correspondiente.
- Estudios multilingues de privacidad: al disponer de cabezas para en, de, es y fr, permite comparar la fuga de identidad entre idiomas bajo un mismo protocolo de evaluacion.
- Analisis de robustez de sistemas de verificacion: se usa como atacante de caja gris para estresar verificadores acusticos y medir la correlacion entre senal acustica y senal linguistica.

## Benchmarks y rendimiento

EER (%) sobre transcriptos de referencia, listas de ensayos oficiales de 1 de septiembre de 2026:

| Dataset | dev | test |
|---|---|---|
| Track 1, LibriSpeech | 36.05 | 34.80 |
| Track 2, ingles | 20.59 | 19.11 |
| Track 2, aleman | 27.08 | 25.58 |
| Track 2, espanol | 28.14 | 26.33 |
| Track 2, frances | 23.67 | 26.10 |

El autor advierte que las listas de ensayos se disenaron para evaluacion ASV: los enunciados de enrolamiento y de ensayo de un mismo hablante suelen proceder del mismo libro y, en el track 2, de la misma grabacion. Por tanto, el EER refleja la vinculabilidad de ensayos bajo este protocolo, no la identificacion de una persona a partir de texto arbitrario.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un codificador BGE-M3 congelado mas una proyeccion pequena, el coste dominante es el del codificador.
- GPU recomendadas: no disponibles en la informacion proporcionada; por el tamano del codificador, una GPU consumer moderna seria suficiente en principio, aunque no se documenta.
- Compatibilidad con GPU consumer: no confirmada en la model card.
- Opciones de despliegue: no se documentan frameworks de servicio (vLLM, llama.cpp, Ollama, TGI); el uso previsto es via codigo Python en el repositorio del desafio (`text_attacker/`, rama `feature/text-attacker`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Datos de benchmark |
|---|---|---|---|---|---|---|
| vpc2026-text-attacker | Cabezas de ataque textual sobre BGE-M3 | no disponible (solo proyeccion) | 96 tokens | en, de, es, fr | cc-by-4.0 | EER publicados (tabla anterior) |
| BAAI/bge-m3 (base) | Codificador de embeddings multilingue | no disponible en la informacion | no disponible | multilingue | MIT | no aplica (no es atacante) |
| Alternativas de ataque textual especificas | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros atacantes textuales comparables en el contexto del VoicePrivacy Challenge 2026.

## Limitaciones y advertencias

- El EER elevado (19-36 %) indica que el ataque textual es debil frente a un verificador acustico; no debe interpretarse como identificacion fiable de personas a partir de texto libre.
- Los resultados dependen del protocolo del desafio: enrolamiento y ensayo suelen compartir libro o grabacion, lo que puede inflar artificialmente la vinculabilidad.
- La longitud de contexto esta limitada a 96 tokens, insuficiente para transcriptos largos sin truncado o segmentacion.
- Solo cubre cuatro idiomas; no hay soporte para otros.
- No se incluye el clasificador de hablante en los pesos publicados, solo la proyeccion (`head.safetensors`), lo que limita la reproducibilidad completa del entrenamiento.
- Licencia CC BY 4.0: permite uso comercial con atribucion, pero conviene revisar las condiciones de los datos de entrenamiento subyacentes (LibriSpeech y MLS son CC BY 4.0; BGE-M3 es MIT).
- Riesgo de sesgo derivado de la composicion de los corpus MLS y LibriSpeech (dominio de lectura, desequilibrio de hablantes por idioma: 86 en espanol frente a 3930 en ingles).
- No apto para produccion como sistema de identificacion; su uso previsto es la evaluacion de privacidad en investigacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JYP2024/vpc2026-text-attacker
- Modelo base BGE-M3: https://huggingface.co/BAAI/bge-m3
- Repositorio del desafio (rama `feature/text-attacker`): https://github.com/JunyiPeng00/Voice-Privacy-Challenge-2026
