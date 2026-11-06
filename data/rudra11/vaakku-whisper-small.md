# rudra11/vaakku-whisper-small

## Resumen

Vaakku-whisper-small es un adaptador LoRA sobre el modelo de reconocimiento automático del habla (ASR) openai/whisper-small, desarrollado por el usuario rudra11 dentro de la iniciativa Vaakku — Open Indic Speech. Su objetivo es mejorar la transcripción de audio en cinco lenguas índicas: tamil (ta), telugu (te), hindi (hi), kannada (kn) y malayo (ml). El repositorio publicado contiene únicamente el adaptador PEFT y el procesador, no una copia fusionada de los pesos completos de Whisper.

El modelo base, Whisper-small, es un transformer encoder-decoder de OpenAI con aproximadamente 244 millones de parámetros y una ventana de contexto de audio de 30 segundos. El adaptador aplica LoRA de rango 16 sobre las proyecciones `q_proj` y `v_proj` del mecanismo de atención, con alpha 32 y dropout 0,05, entrenado en precisión bf16 sobre el conjunto de datos google/fleurs.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación y demostración, con métricas de evaluación publicadas por el autor y licencia Apache 2.0. No se presenta como un sistema de producción ni como estado del arte, y su rendimiento es desigual entre idiomas, con una brecha notable en malayo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-small) con adaptador LoRA |
| Parametros totales | Aproximadamente 244 M en el modelo base; el adaptador LoRA anade un subconjunto no cuantificado en la ficha |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (ventana nativa de Whisper) |
| Tipos de cuantizacion | No disponible (el autor no documenta cuantizaciones del adaptador) |
| Idiomas soportados | Tamil (ta), telugu (te), hindi (hi), kannada (kn), malayo (ml) |
| Licencia | Apache 2.0 (adaptador); el dataset google/fleurs es CC-BY-4.0 |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base openai/whisper-small |
| Libreria | PEFT |
| Rango LoRA | 16 |
| Alpha LoRA | 32 |
| Dropout LoRA | 0,05 |
| Modulos objetivo | `q_proj`, `v_proj` |
| Precision de entrenamiento | bf16 |
| Dataset de entrenamiento | google/fleurs (split oficial train/validation/test) |

## Arquitectura y entrenamiento

El modelo base Whisper-small sigue la arquitectura transformer encoder-decoder de OpenAI para ASR, con procesamiento de audio en ventanas de 30 segundos y tokenizacion multilingue. Sobre esta base, el autor aplica un adaptador LoRA mediante Hugging Face PEFT, sin reentrenar los pesos completos. Los hiperparametros documentados son rango 16, alpha 32, dropout 0,05 y modulos objetivo `q_proj` y `v_proj`, lo que limita la adaptacion a las proyecciones de query y value de la atencion.

El entrenamiento se realizo en precision bf16 sobre el dataset google/fleurs, utilizando los splits oficiales de entrenamiento, validacion y test. El autor no documenta el numero de tokens de audio, la composicion exacta del dataset ni la metodologia de particion ("Split methodology: Not recorded"). Tampoco se indica si hubo etapas de RLHF, DPO o ajuste adicional tras el entrenamiento supervisado. La innovacion tecnica es, por tanto, la aplicacion de LoRA de bajo rango para adaptar un modelo ASR multilingue a cinco lenguas indicas con un coste computacional reducido.

## Capacidades

- Reconocimiento automatico del habla (ASR) en tamil, telugu, hindi, kannada y malayo.
- Transcripcion de audio en ventanas de hasta 30 segundos por segmento.
- Adaptacion ligera mediante LoRA, lo que permite cargar el adaptador sobre el modelo base sin duplicar los pesos completos.
- Integracion con el ecosistema Hugging Face Transformers y PEFT mediante `PeftModel` y `WhisperProcessor`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio de entrada mas alla de ASR ni modo de pensamiento.
- No se documentan capacidades multilingues fuera de los cinco idiomas indicados.

## Casos de uso

- Transcripcion de reuniones y notas de voz en hindi o tamil: el adaptador puede integrarse en un pipeline de ASR sobre Whisper-small para convertir audio de hasta 30 segundos en texto, adecuado para entornos de investigacion y prototipado.
- Subtitulado automatico de contenido audiovisual en lenguas indicas: util para generar subtitulos preliminares en kannada o telugu, con revision humana posterior dada la tasa de error publicada.
- Investigacion en ASR de bajos recursos: el adaptador sirve como punto de partida para experimentos de fine-tuning con LoRA sobre lenguas indicas, comparando hiperparametros y modulos objetivo.
- Evaluacion comparativa de adaptadores LoRA: al estar documentados rango, alpha y modulos, permite reproducir experimentos y medir el impacto de la configuracion LoRA en WER y CER.
- Prototipos de asistentes de voz para mercados regionales de India: el modelo puede transcribir consultas de usuarios en hindi o malayo antes de pasarlas a un sistema de comprension del lenguaje.
- Docencia y demostraciones de PEFT aplicado a audio: el repositorio ejemplifica el flujo `PeftModel.from_pretrained` sobre Whisper, util en cursos de machine learning.
- Analisis de llamadas o encuestas en centros de contacto regionales: transcripcion por lotes de audio corto para extraccion de temas, siempre con validacion humana por la tasa de error.

## Benchmarks y rendimiento

Resultados de evaluacion publicados por el autor (copiados del fichero de evaluacion; los valores ausentes se mantienen ausentes):

| Metrica | Valor |
|---|---|
| Micro WER | 0,3553 |
| Micro CER | 0,2966 |
| Macro WER | 0,3189 |
| Macro CER | 0,2460 |

| Idioma | Muestras | WER | CER |
|---|---:|---:|---:|
| hi | 417 | 0,2430 | 0,1370 |
| kn | 832 | 0,2153 | 0,1231 |
| ml | 944 | 0,6046 | 0,6173 |
| ta | 582 | 0,2366 | 0,1689 |
| te | 471 | 0,2952 | 0,1838 |

No se han publicado comparaciones con otros modelos en la informacion disponible. El rendimiento es claramente desigual: kannada e hindi presentan los mejores resultados (WER 0,2153 y 0,2430), mientras que malayo muestra un WER de 0,6046 y un CER de 0,6173, muy por encima del resto.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Whisper-small ocupa aproximadamente 1 GB en fp16 (244 M de parametros); el adaptador LoRA anade una fraccion minima. En fp32 se aproxima a 2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia en fp16; una RTX 3060, RTX 4060 o superior es adecuada. Para entrenamiento LoRA, una RTX 3090 o A100 acelera el proceso, aunque el modelo es pequeno.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna con 4 GB o mas de VRAM.
- Opciones de despliegue: Hugging Face Transformers con PEFT (flujo documentado por el autor). No se documenta soporte nativo en vLLM, llama.cpp, Ollama o TGI para este adaptador concreto; seria necesario fusionar el adaptador con el modelo base para usarlo en dichos motores.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas indicos | Licencia | Formato |
|---|---|---|---|---|---|
| vaakku-whisper-small (este) | ~244 M (base) + LoRA | 30 s | ta, te, hi, kn, ml | Apache 2.0 | Adaptador PEFT (safetensors) |
| openai/whisper-small | ~244 M | 30 s | Multilingue (incluye indico) | Apache 2.0 | Safetensors completo |
| openai/whisper-medium | ~769 M | 30 s | Multilingue (incluye indico) | Apache 2.0 | Safetensors completo |
| openai/whisper-large-v3 | ~1,55 B | 30 s | Multilingue (incluye indico) | Apache 2.0 | Safetensors completo |

La comparativa se limita a la familia Whisper porque no se dispone de datos de otros adaptadores LoRA para lenguas indicas en la informacion proporcionada. No se dispone de resultados de benchmarks comparativos entre estos modelos en la informacion disponible.

## Limitaciones y advertencias

- El autor declara explicitamente que la model card no reclama un sistema de produccion ni estado del arte.
- La calidad depende del dataset google/fleurs y de la tabla de evaluacion; el rendimiento en malayo es notablemente inferior (WER 0,6046) y no es apto para uso sin revision humana.
- Los idiomas fuera de tamil, telugu, hindi, kannada y malayo quedan fuera del alcance de este fine-tuning.
- El repositorio contiene solo el adaptador y el procesador; es imprescindible descargar openai/whisper-small para la inferencia.
- Riesgo de alucinacion y errores de transcripcion inherente a los modelos ASR, agravado por las tasas de error publicadas.
- No se documentan sesgos especificos, pero el entrenamiento sobre fleurs puede heredar sesgos de dominio y de hablantes del dataset.
- La licencia Apache 2.0 del adaptador no sustituye la licencia CC-BY-4.0 del dataset google/fleurs, que debe respetarse por separado.
- El autor advierte que "una ejecucion de validacion de pipeline no es un modelo publicable", lo que sugiere que el artefacto puede no haber pasado por un proceso de validacion exhaustivo.
- No se documenta la metodologia de particion del dataset ("Split methodology: Not recorded"), lo que dificulta la reproducibilidad exacta de la evaluacion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso comunitario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rudra11/vaakku-whisper-small
- Modelo base: https://huggingface.co/openai/whisper-small
- Dataset google/fleurs: https://huggingface.co/datasets/google/fleurs
- Paper de Whisper (OpenAI): no disponible en la informacion proporcionada
- Repositorio PEFT: no disponible en la informacion proporcionada
- Demo o blog del autor: no disponible en la informacion proporcionada
