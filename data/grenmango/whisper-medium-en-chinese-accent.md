# Grenmango/whisper-medium-en-chinese-accent

## Resumen

`Grenmango/whisper-medium-en-chinese-accent` es un ajuste fino de `openai/whisper-medium.en` (763.856.896 parametros) especializado en reconocimiento automatico del habla en ingles hablado con acento chino. Lo desarrolla el usuario Grenmango y se distribuye bajo licencia Apache-2.0 en Hugging Face. El problema que aborda es concreto: los modelos Whisper genericos pierden precision cuando el hablante es un L2 (hablante no nativo) con interferencias foneticas del mandarin, un escenario muy frecuente en equipos distribuidos, soporte tecnico offshore y contenido academico en ingles.

Tecnicamente es un fine-tuning con LoRA (r=32, alpha=64) sobre las proyecciones de atencion y las capas fully connected del transformer encoder-decoder de Whisper, con los adaptadores fusionados de forma permanente en los pesos base y exportados en FP16. El entrenamiento se hizo sobre el subconjunto chino del corpus L2-ARCTIC: 4.071 enunciados (unas 4,1 horas) de cuatro hablantes. No es un modelo MoE ni incorpora decodificacion especulativa: es un Whisper medium denso estandar, cargable directamente con `WhisperForConditionalGeneration` sin dependencias de PEFT.

La relevancia es doble. Por un lado, el autor reporta una reduccion relativa del WER del 37,4% frente al modelo base en habla leida de validacion (7,09% frente a 11,33%), superando tambien a `whisper-large-v3-turbo` zero-shot (10,93%). Por otro, forma parte de una coleccion de variantes por acento (vietnamita, arabe, hindi, coreano, espanol) que permite elegir el checkpoint adecuado segun el perfil del hablante sin reentrenar. Con 0 descargas y 0 likes en el momento de la consulta, se trata de un artefacto de investigacion recien publicado, sin adopcion en produccion documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), denso, sin MoE |
| Parametros totales | 763.856.896 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | Ventanas de audio de 30 s (segmentacion mediante `chunk_length_s=30`); maximo de 448 tokens de decodificacion por ventana |
| Tipos de cuantizacion | No se distribuyen cuantizaciones oficiales; pesos en FP16. Al ser una arquitectura Whisper estandar es convertible a INT8/INT4 o GGUF con herramientas de terceros (CTranslate2, whisper.cpp) |
| Idiomas soportados | Ingles (`en`) unicamente; hereda la restriccion del modelo base `.en` |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP16, adaptadores LoRA fusionados) |
| Modelo base | openai/whisper-medium.en |
| Entrada acustica | Log-Mel de 80 canales, audio mono a 16 kHz |
| Tamano del repositorio | 1,5 GB |
| Pipeline | automatic-speech-recognition |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper medium: un encoder que consume espectrogramas log-Mel de 80 canales a 16 kHz y un decoder autorregresivo que genera tokens de transcripcion, ambos basados en atencion multi-cabeza con codificacion posicional sinusoidal. El modelo trabaja por ventanas de 30 segundos y procesa audio largo mediante segmentacion con solapamiento. No hay innovaciones arquitectonicas propias: el valor del checkpoint esta enteramente en el ajuste de pesos.

El entrenamiento empleo Parameter-Efficient Fine-Tuning con LoRA de rango 32 y alpha 64, aplicado a `q_proj`, `k_proj`, `v_proj`, `out_proj`, `fc1` y `fc2`. Los adaptadores se fusionaron posteriormente en los pesos del modelo base, de modo que el resultado es un checkpoint autonomo en FP16 compatible con la clase estandar `WhisperForConditionalGeneration`. El corpus de entrenamiento es el subconjunto chino de L2-ARCTIC, con 4.071 enunciados (aproximadamente 4,1 horas) de cuatro hablantes: BWC (hombre), LXC (mujer), NCC (mujer) y TXHC (hombre). No se documenta uso de RLHF, DPO ni decodificacion especulativa. El modelo se evaluo sobre el split `test` de habla leida limpia, con resultados de WER y CER reportados por el autor.

## Capacidades

- Transcripcion de voz a texto en ingles con acento chino, tanto en habla leida como en audio segmentado de formato largo mediante chunking.
- Reconocimiento de habla en ingles general, al conservar las capacidades del checkpoint `whisper-medium.en` original.
- Procesamiento de audio mono a 16 kHz con remuestreo automatico dentro del pipeline de `transformers`.
- Generacion de marcas temporales por segmento cuando se activa `return_timestamps` en el pipeline (funcionalidad heredada del modelo base; no evaluada en la model card).
- Integracion directa con `pipeline("automatic-speech-recognition")` y con `WhisperProcessor` + `WhisperForConditionalGeneration`.
- No soporta tool calling, function calling ni uso como agente.
- No soporta vision, audio generation ni salida multimodal distinta de la transcripcion.
- No soporta otros idiomas ni traduccion de voz a texto en ingles (el checkpoint `.en` esta restringido a ingles).

## Casos de uso

- Transcripcion de reuniones con equipos distribuidos: el modelo reduce el WER en intervenciones de hablantes sinohablantes que hablan ingles, lo que evita correcciones manuales en actas y resumenes posteriores.
- Subtitulado de contenido formativo: cursos, webinars y tutoriales tecnicos impartidos por ponentes chinos se pueden transcribir con `chunk_length_s=30` para generar subtitulos SRT con menor tasa de error que el modelo base.
- Soporte al cliente en centros de contacto offshore: transcripcion de llamadas de agentes con acento chino para alimentar sistemas de analitica, control de calidad y busqueda sobre conversaciones.
- Pre-anotacion de datasets de ASR: generar transcripciones iniciales sobre grabaciones de hablantes L2 chinos para acelerar el etiquetado manual en proyectos de entrenamiento de modelos de voz.
- Accesibilidad y transcripcion en vivo: integrado en aplicaciones de subtitulado en tiempo real para aulas y conferencias con ponentes no nativos, siempre que se acepte la latencia derivada del procesamiento por ventanas de 30 s.
- Documentacion dictada en entornos profesionales: notas clinicas, informes legales o partes de trabajo dictados en ingles por profesionales sinohablantes, donde el vocabulario tecnico y la pronunciacion suponen un reto para modelos genericos.
- Investigacion en reconocimiento de habla L2: sirve como baseline ajustado por acento para comparar estrategias de adaptacion (LoRA, fine-tuning completo, adaptadores) sobre el mismo corpus y la misma metrica.
- Despliegue en pipelines de analitica de audio a gran escala: al ocupar aproximadamente 1,5 GB en FP16, permite procesar lotes grandes en una sola GPU sin el coste de un modelo large.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el split `test` de habla leida limpia del subconjunto chino de L2-ARCTIC:

| Modelo | WER (test split) | CER (test split) |
|---|---|---|
| whisper-medium-en-chinese-accent (este modelo) | 7,09% | 3,57% |
| openai/whisper-medium.en (zero-shot) | 11,33% | 5,65% |
| openai/whisper-large-v3-turbo (zero-shot) | 10,93% | 6,89% |

La reduccion relativa de WER frente a `whisper-medium.en` zero-shot es del 37,4%. No se han publicado resultados de benchmarks adicionales (por ejemplo MMLU, HumanEval o GSM8K, que no aplican a un modelo ASR) ni evaluaciones sobre otros dominios, condiciones de ruido o acentos distintos del chino en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16: aproximadamente 1,5 GB de pesos mas activaciones y cache; en la practica cabe en 3-4 GB de VRAM con lotes pequenos.
- VRAM estimada tras cuantizacion: unos 0,8 GB en INT8 y unos 0,4 GB en INT4, previa conversion con herramientas de terceros.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas (RTX 3060, RTX 4060, RTX 4090) es suficiente; en entornos de servidor, A100, H100 o L40S permiten lotes grandes y mayor throughput.
- Inferencia en CPU: viable con `device="cpu"` y segmentacion a 30 s, aunque con latencias notablemente superiores; adecuada para procesamiento por lotes no interactivo.
- Opciones de despliegue: `transformers` (pipeline o carga directa), Hugging Face TGI (soporte de Whisper), conversion a CTranslate2 para `faster-whisper`, y conversion a GGUF para `whisper.cpp`. No se distribuyen pesos GGUF ni cuantizados en el repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada. No se ha publicado factor de tiempo real ni mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | WER en test (chino L2) | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| whisper-medium-en-chinese-accent | 763,9 M | Ventanas de 30 s | 7,09% | en | Apache-2.0 | Hugging Face, pesos safetensors FP16 |
| openai/whisper-medium.en | 769 M | Ventanas de 30 s | 11,33% (zero-shot) | en | Apache-2.0 | Hugging Face |
| openai/whisper-large-v3-turbo | ~809 M | Ventanas de 30 s | 10,93% (zero-shot) | multilingue | Apache-2.0 | Hugging Face |
| whisper-medium-en-vi-accent (mismo autor) | ~764 M | Ventanas de 30 s | no disponible (orientado a acento vietnamita) | en | Apache-2.0 | Hugging Face |

La comparacion debe interpretarse con cautela: los resultados del modelo ajustado provienen de un split de test del mismo corpus que el de entrenamiento (habla leida, cuatro hablantes), mientras que los de `whisper-medium.en` y `whisper-large-v3-turbo` son evaluaciones zero-shot. No hay una evaluacion independiente que confirme la ventaja en condiciones fuera de dominio.

## Limitaciones y advertencias

- Dominio de entrenamiento muy estrecho: 4,1 horas de habla leida de solo cuatro hablantes (BWC, LXC, NCC, TXHC). Existe riesgo alto de sobreajuste a las caracteristicas acusticas y al estilo de lectura de esos hablantes concretos.
- El conjunto de evaluacion pertenece al mismo corpus que el de entrenamiento, lo que puede inflar la mejora reportada respecto al modelo base. No se han publicado resultados en dominios externos.
- Degradacion esperable en habla espontanea, conversacional, con ruido de fondo, solapamiento de voces o canales telefonicos, condiciones no evaluadas por el autor.
- No hay evidencia sobre el comportamiento con otros acentos del ingles (hispano, indio, arabe, etc.); el ajuste puede desplazar ligeramente el rendimiento en hablantes nativos o de otros origenes.
- Riesgo de alucinacion inherente a Whisper en segmentos de silencio, ruido o musica: puede generar texto plausible no presente en el audio. Requiere umbrales de confianza o filtros posteriores en produccion.
- Modelo exclusivamente en ingles: no transcribe ni traduce otros idiomas. Para audio en mandarin seria necesario un checkpoint multilingue.
- Sin marcas temporales evaluadas ni control de diarizacion de hablantes; para reuniones multi-ponente hay que combinar con un modulo de diarizacion externo.
- Ausencia de adopcion verificable: 0 descargas y 0 likes en el momento de la consulta, sin reportes de terceros que validen el rendimiento en produccion.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el corpus L2-ARCTIC tiene sus propias condiciones de uso que conviene revisar si se redistribuyen datos derivados.
- Los pesos estan en FP16 y no incluyen cuantizaciones oficiales; desplegar en INT8 o INT4 exige una conversion propia y una validacion posterior del WER.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Grenmango/whisper-medium-en-chinese-accent
- Modelo base: https://huggingface.co/openai/whisper-medium.en
- Corpus L2-ARCTIC: https://psi.engr.tamu.edu/l2-arctic-corpus/
- Variante de acento vietnamita: https://huggingface.co/Grenmango/whisper-medium-en-vi-accent
- Variante de acento arabe: https://huggingface.co/Grenmango/whisper-medium-en-arabic-accent
- Variante de acento hindi: https://huggingface.co/Grenmango/whisper-medium-en-hindi-accent
- Variante de acento coreano: https://huggingface.co/Grenmango/whisper-medium-en-korean-accent
- Variante de acento espanol: https://huggingface.co/Grenmango/whisper-medium-en-spanish-accent
- Variante personalizada HQTV: https://huggingface.co/Grenmango/whisper-medium-en-vi-hqtv-personalized
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de OpenAI Whisper: https://github.com/openai/whisper
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces disponibles proceden de la model card y del repositorio de Hugging Face.
