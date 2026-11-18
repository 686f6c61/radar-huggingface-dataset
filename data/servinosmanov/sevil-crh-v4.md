# servinosmanov/sevil-crh-v4

## Resumen

Sevil (crh-v4) es un ajuste fino completo del modelo `google/gemma-4-26B-A4B-it` orientado especificamente al tártaro de Crimea (código ISO `crh`), una lengua túrquica de bajos recursos. El modelo lo desarrolla Servin Osmanov (Ana-Yurt) de forma autofinanciada y se sirve en producción en sevil.chat. Su relevancia radica en cubrir un idioma con escasa representación en los grandes modelos fundacionales, incluyendo sus dos alfabetos (latino y cirílico) y capacidad de traducción desde y hacia el ruso.

El repositorio de Hugging Face no distribuye pesos: es una tarjeta con la licencia, el aviso de autoría y los hashes SHA-256 de los artefactos del modelo (GUF Q5_K_M y Q6_K, safetensors de las etapas 2, y adaptadores ASR y TTS del mismo proyecto), sellados con pruebas OpenTimestamps con fecha 2026-11-18. Esto deja constancia pública de la autoría y la fecha de los artefactos servidos, pero implica que el modelo no es descargable desde este repositorio.

La arquitectura subyacente corresponde a Gemma 4 en su variante 26B-A4B, un modelo de mezcla de expertos (MoE) con 26 000 millones de parámetros totales y aproximadamente 4 000 millones activos por token, según la nomenclatura del modelo base. El ajuste es un fine-tune completo (no LoRA ni adaptadores) sobre el checkpoint instruct de Gemma 4, con licencia Apache-2.0 heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en google/gemma-4-26B-A4B-it; fine-tune completo |
| Parametros totales | 26 000 millones (26B, segun nomenclatura del modelo base) |
| Parametros activos | 4 000 millones (A4B, segun nomenclatura del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q5_K_M y Q6_K (artefactos referenciados en el repositorio); safetensors en precision completa de las etapas 2 |
| Idiomas soportados | Tártaro de Crimea (crh) en alfabeto latino y cirílico; ruso para traducción |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (etapas 2) y GGUF (Q5_K_M, Q6_K); los pesos no se distribuyen en este repositorio |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo del checkpoint instruct `google/gemma-4-26B-A4B-it`, que emplea una arquitectura de mezcla de expertos con 26B parámetros totales y alrededor de 4B activos por token. El ajuste se realizó sobre el modelo instruct ya alineado, por lo que hereda las capacidades conversacionales y de instrucciones de la base, y se especializa en tártaro de Crimea mediante entrenamiento supervisado sobre corpus del idioma. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO específicas para `crh`.

Los datos de entrenamiento proceden de fuentes con permiso explícito o licencia publicada: Radio Free Europe/Radio Liberty (ktat.krymr.com, Qırım.Aqiqat) con permiso de entrenamiento concedido el 2026-09-10; el archivo de historias orales tamirlar.com («Моя история»), con permiso confirmado el 2026-11-02; Kesertki (qirimtatartili.app) y UDTTMR (Karadeniz), con permisos de 2026-09-10; y los datasets QIRIM de Hugging Face (crh_web, crh_monocorpus, crh-parallel-corpora) bajo CC BY 4.0. El proyecto mantiene un registro por fuente en docs/crh_dataset_sources.md y experiments/14_crh_llm_data/candidates/CORPUS_EXCLUSIONS.json. El modelo se distribuye en dos etapas de checkpoint (crh-v4 y crh-v4.1, esta última la siguiente etapa 2), y el proyecto incluye además adaptadores ASR y TTS para el mismo idioma.

## Capacidades

- Generación de texto en tártaro de Crimea en alfabeto latino y cirílico.
- Traducción entre ruso y tártaro de Crimea, según la declaración de idiomas del modelo.
- Conversación multi-turno y seguimiento de instrucciones, heredado del checkpoint instruct de Gemma 4.
- Capacidades generales del modelo base (razonamiento, código, matemáticas) presumiblemente conservadas tras el fine-tune, aunque no se documentan explícitamente en la información disponible.
- Soporte de tool calling y function calling: no documentado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas en la información disponible.
- Capacidades especiales (modo thinking, visión, audio): no documentadas; el proyecto incluye adaptadores ASR y TTS separados, no integrados en este checkpoint de texto.

## Casos de uso

- Atención al cliente en tártaro de Crimea: el modelo puede gestionar conversaciones multi-turno en el idioma para servicios dirigidos a la comunidad tártara, con la ventaja de estar ajustado sobre corpus reales del idioma (medios, historias orales) en lugar de depender de la cobertura limitada de los modelos generalistas.
- Traducción ruso–tártaro de Crimea: útil para administraciones, ONG y medios que necesitan traducir documentación o contenido entre ambos idiomas, aprovechando la declaración explícita de soporte de ruso para traducción.
- Preservación y difusión del patrimonio oral: el modelo puede generar y reformular textos a partir de historias orales y materiales culturales, dado que parte del entrenamiento proviene del archivo tamirlar.com.
- Generación de contenido periodístico y divulgativo: medios como RFE/RL pueden emplear el modelo para redactar borradores o resúmenes en `crh`, con revisión humana, al haber participado como fuente de entrenamiento.
- Normalización de texto en doble alfabeto: conversión y generación coherente en latino y cirílico, útil para digitalizar materiales educativos o señalética bilingüe.
- Investigación en lenguas de bajos recursos: sirve como punto de partida para experimentos de fine-tune, evaluación o destilación en tártaro de Crimea, con la ventaja de contar con hashes y sellos de tiempo que permiten verificar la integridad de los artefactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa del modelo base de 26B parámetros totales, una cuantización Q5_K_M o Q6_K requiere del orden de 18-22 GB de VRAM, pero este dato no está confirmado para este checkpoint.
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU de consumo? No confirmado; los artefactos Q5_K_M y Q6_K podrían caber en GPUs de 24 GB (RTX 3090/4090) si la arquitectura MoE mantiene el patrón de activación dispersa, pero no hay datos publicados que lo verifiquen.
- Opciones de despliegue: llama.cpp u otros runners compatibles con GGUF para los artefactos Q5_K_M y Q6_K; vLLM o TGI para safetensors si se dispone de los pesos, que no se distribuyen en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|
| Sevil (crh-v4) | 26B totales / 4B activos (MoE) | no disponible | Apache-2.0 | No distribuidos (solo hashes y tarjeta) |
| google/gemma-4-26B-A4B-it | 26B totales / 4B activos (MoE) | no disponible | Apache-2.0 | Pesos públicos en Hugging Face |
| Modelos específicos para tártaro de Crimea de tamaño comparable | no disponible | no disponible | no disponible | no disponible |

La comparativa directa con otros modelos especializados en `crh` no está disponible en la información proporcionada. Frente a su modelo base, Sevil añade especialización en tártaro de Crimea a costa de no publicar los pesos, lo que limita la reproducibilidad y el despliegue por terceros.

## Limitaciones y advertencias

- Los pesos no se distribuyen en el repositorio: solo hay tarjeta, licencia, aviso y hashes; no es posible descargar ni ejecutar el modelo desde Hugging Face.
- No se documentan sesgos conocidos, pero al entrenar sobre medios y archivos orales concretos puede heredar sesgos de esas fuentes.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones específicas para `crh`.
- Longitud de contexto no documentada, lo que impide planificar casos de uso con documentos largos.
- Cobertura lingüística limitada a tártaro de Crimea (latino y cirílico) y ruso para traducción; no se declaran otros idiomas.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Gemma 4 mantiene sus propios términos y copyright de Google LLC, que deben respetarse.
- El uso de datos de RFE/RL, tamirlar.com, Kesertki y UDTTMR está sujeto a los permisos concedidos; la redistribución de texto de entrenamiento no está permitida y los pesos no contienen texto de entrenamiento según el aviso.
- Falta de benchmarks publicados impide comparar su calidad frente a alternativas.
- Verificar la integridad de cualquier artefacto con `shasum -a 256` y las pruebas OpenTimestamps antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/servinosmanov/sevil-crh-v4
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Servicio en producción: https://sevil.chat
- OpenTimestamps: https://opentimestamps.org
- Corpus QIRIM: https://huggingface.co/QIRIM
- Fuente de medios RFE/RL (Qırım.Aqiqat): https://ktat.krymr.com
- Historias orales tamirlar.com: https://tamirlar.com
- Kesertki: https://qirimtatartili.app
