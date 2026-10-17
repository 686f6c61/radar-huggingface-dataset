# Allinsama/FunAudioLLM__CosyVoice-300M-Instruct

## Resumen

CosyVoice-300M-Instruct es un checkpoint de síntesis de voz (text-to-speech) perteneciente a la familia CosyVoice, desarrollada por FunAudioLLM (Alibaba). Este repositorio concreto, publicado por el usuario Allinsama, es una redistribución del modelo oficial con los pesos exportados a formato ONNX y empaquetados junto con la model card original del proyecto. El modelo resuelve el problema de la generación de habla natural y controlable a partir de texto, incluyendo clonación de voz zero-shot y control mediante instrucciones en lenguaje natural.

La familia CosyVoice se apoya en un enfoque de modelado del habla como lenguaje: un modelo autorregresivo genera tokens semánticos supervisados y un módulo de flow matching condicional reconstruye las características acústicas, que finalmente se sintetizan con un vocoder. El tamaño de este checkpoint es de aproximadamente 300 M de parámetros, lo que lo sitúa en el rango ligero y desplegable en hardware de consumo.

Su relevancia actual viene de que la estela de la familia (CosyVoice 2.0 y Fun-CosyVoice 3.0, con papers de diciembre de 2024 y mayo de 2025) ha convertido a CosyVoice en una de las referencias open source en TTS multilingüe con licencia Apache 2.0, y de que esta variante Instruct permite controlar idioma, dialecto, emoción, velocidad y volumen sin reentrenar. Conviene tener en cuenta que el repositorio es un espejo de terceros con 0 descargas y 0 likes en el momento de la consulta, por lo que para producción es preferible partir de los repositorios oficiales de FunAudioLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS basado en LLM autorregresivo sobre tokens semanticos de habla, con flow matching condicional y vocoder; exportado a ONNX en este repositorio |
| Parametros totales | ~300 M (segun el nombre del checkpoint; no se detalla desglose en la informacion disponible) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los tags del repositorio indican exportacion ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | zh, en, fr, es, ja, ko, it, ru, de (9 idiomas, segun los metadatos del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (tags del repositorio); no se confirma la presencia de safetensors ni de pesos PyTorch nativos. Tamano del repo: 2,3 GB |

## Arquitectura y entrenamiento

CosyVoice modela la sintesis de voz como una tarea de generacion de secuencias: un modulo tipo LLM autorregresivo produce tokens semanticos de habla supervisados (a 25 Hz en las versiones anotadas en la model card como "25hz CosyVoice-300M"), y a continuacion un modulo de flow matching condicional genera las caracteristicas acusticas a partir de esos tokens y del texto de entrada. Finalmente, un vocoder convierte las caracteristicas acusticas en audio. La model card documenta explicitamente el soporte de entrenamiento con flow matching (julio de 2024) y el muestreo Repetition Aware Sampling (RAS) para estabilizar la inferencia del LLM, junto con cache KV y SDPA para optimizar el factor de tiempo real en modo streaming.

No se proporcionan en la informacion disponible datos sobre el volumen de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron fases de RLHF o DPO para este checkpoint concreto. La model card si menciona que la familia ha incorporado entrenamiento con GRPO (agosto de 2025, soporte de entrenamiento GRPO para CosyVoice2) y que Fun-CosyVoice 3.0 publica un modelo base y un modelo RL, lo que indica que las tecnicas de refuerzo se aplican en las versiones mas recientes de la familia, no necesariamente en este checkpoint de 300 M.

Entre las innovaciones tecnicas documentadas en la familia destacan el ya citado RAS para estabilidad del LLM, el modo de inferencia en streaming con cache KV, la normalizacion de texto sin frontend tradicional (lectura de numeros, simbolos y formatos diversos), el "pronunciation inpainting" sobre pinyin chino y fonemas CMU del ingles, y el soporte bi-streaming (texto de entrada y audio de salida en streaming) con latencias declaradas de hasta 150 ms. Estas dos ultimas capacidades se anuncian para Fun-CosyVoice 3.0, por lo que no debe asumirse que esten presentes en este checkpoint de 300 M.

## Capacidades

- Sintesis de voz a partir de texto en 9 idiomas declarados en los metadatos: chino, ingles, frances, espanol, japones, coreano, italiano, ruso y aleman.
- Control mediante instrucciones (variante Instruct): la familia documenta control de idioma, dialecto, emocion, velocidad y volumen.
- Clonacion de voz zero-shot y capacidad multilinguue/cross-lingue, segun las caracteristicas declaradas para la familia CosyVoice.
- Normalizacion de texto integrada para numeros, simbolos especiales y formatos diversos, sin depender de un frontend tradicional.
- Soporte de inferencia en streaming con cache KV y SDPA en las versiones documentadas.
- Soporte opcional de `ttsfrd` y de WeTextProcessing cuando `ttsfrd` no esta disponible, para el preprocesado de texto.
- Dialectos y acentos del chino (18+), segun la model card de Fun-CosyVoice 3.0.
- No dispone de tool calling, function calling, capacidades de agente, vision ni audio de entrada: es un modelo exclusivamente de texto a voz.
- No disponible: soporte de marcas de tiempo, control fonetico a nivel de este checkpoint, o modos de razonamiento.

## Casos de uso

- Generacion de audiolibros y contenido editorial: el modelo convierte texto largo en habla con voces consistentes, y la normalizacion de texto integrada evita fallos en la lectura de cifras, fechas y abreviaturas frecuentes en prosa.
- Atencion al cliente con respuestas habladas: al ser un modelo de ~300 M, permite desplegar sintesis en tiempo real sobre infraestructura modesta, con control de velocidad y volumen por instruccion segun el perfil del usuario.
- Doblaje y localizacion de contenido: la cobertura de 9 idiomas y la clonacion de voz zero-shot de la familia permiten reutilizar una voz de referencia en distintas lenguas, util para catalogos de video multilingues.
- Accesibilidad y lectores de pantalla: la latencia baja y el modo streaming lo hacen adecuado para narrar contenido web o interfaces de forma continua, integrandose en servicios FastAPI cliente-servidor como los documentados en el repositorio oficial.
- Asistentes de voz embebidos: al caber en GPU de consumo e incluso poder ejecutarse en CPU con ONNX Runtime, es viable en prototipos de domotica, quioscos o aplicaciones de escritorio que requieren sintesis local sin enviar texto a la nube.
- Prototipado rapido de productos de audio: la licencia Apache 2.0 y la disponibilidad de pesos ONNX permiten integrar el modelo en pipelines propios de experimentacion y evaluacion comparativa de voces antes de escalar a modelos mayores de la familia.
- Generacion de voces para videojuegos y contenidos interactivos: el control por instrucciones de emocion y velocidad (en la variante Instruct) facilita producir variantes expresivas de una misma linea de dialogo sin reentrenar.
- Preprocesado de datos de audio para investigación: sintesis controlada de corpus de habla para experimentos de ASR, alineamiento o evaluacion de metricas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos de este checkpoint (CosyVoice-300M-Instruct) en la informacion disponible. La model card incluida en el repositorio recoge la evaluacion de Fun-CosyVoice3-0.5B-2512 y de una serie de modelos comparables; se reproduce a continuacion como referencia del ecosistema, no como rendimiento de este modelo.

| Modelo | Open source | Tamano | test-zh CER (%) ↓ | test-zh similitud (%) ↑ | test-en WER (%) ↓ | test-en similitud (%) ↑ | test-hard CER (%) ↓ | test-hard similitud (%) ↑ |
|---|---|---|---|---|---|---|---|---|
| Human | - | - | 1,26 | 75,5 | 2,14 | 73,4 | - | - |
| Seed-TTS | No | - | 1,12 | 79,6 | 2,25 | 76,2 | 7,59 | 77,6 |
| MiniMax-Speech | No | - | 0,83 | 78,3 | 1,65 | 69,2 | - | - |
| F5-TTS | Si | 0,3B | 1,52 | 74,1 | 2,00 | 64,7 | 8,67 | 71,3 |
| Spark TTS | Si | 0,5B | 1,2 | 66,0 | 1,98 | 57,3 | - | - |
| CosyVoice2 | Si | 0,5B | 1,45 | 75,7 | 2,57 | 65,9 | 6,83 | 72,4 |
| FireRedTTS2 | Si | 1,5B | 1,14 | 73,2 | 1,95 | 66,5 | - | - |
| Index-TTS2 | Si | 1,5B | 1,03 | 76,5 | 2,23 | 70,6 | 7,12 | 75,5 |
| VibeVoice-1.5B | Si | 1,5B | 1,16 | 74,4 | 3,04 | 68,9 | - | - |
| VibeVoice-Realtime | Si | 0,5B | - | - | 2,05 | 63,3 | - | - |
| HiggsAudio-v2 | Si | 3B | 1,50 | 74,0 | 2,44 | 67,7 | - | - |
| VoxCPM | Si | 0,5B | 0,93 | 77,2 | 1,85 | 72,9 | 8,87 | 73,0 |
| GLM-TTS | Si | 1,5B | 1,03 | 76,1 | - | - | - | - |
| GLM-TTS RL | Si | 1,5B | 0,89 | 76,4 | - | - | - | - |
| Fun-CosyVoice3-0.5B-2512 | Si | 0,5B | 1,21 | 78,0 | 2,24 | 71,8 | 6,71 | 75,8 |
| Fun-CosyVoice3-0.5B-2512_RL | Si | 0,5B | 0,81 | 77,4 | 1,68 | 69,5 | 5,44 | 75,0 |

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint declara ~300 M de parametros; en fp32 los pesos ocupan del orden de 1,2 GB y en fp16 del orden de 0,6 GB, a lo que hay que sumar el modulo de flow matching y el vocoder. El repositorio completo ocupa 2,3 GB, por lo que una estimacion prudente es de 2 a 4 GB de VRAM para inferencia comoda. Es una estimacion, no un dato publicado.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM deberia ser suficiente; RTX 3060, RTX 4060, RTX 4090 y GPUs de datacenter tipo A100/H100 quedan sobradamente cubiertas. El modelo no requiere GPUs de gama alta.
- Cabe en GPU de consumo: si. Tambien es plausible su ejecucion en CPU mediante ONNX Runtime, aunque no se publican factores de tiempo real para este checkpoint.
- Opciones de despliegue: ONNX Runtime para los pesos de este repositorio; el repositorio oficial de CosyVoice incluye servidor y cliente FastAPI, soporte de inferencia en streaming con cache KV y SDPA, y soporte opcional de `ttsfrd` o WeTextProcessing para normalizacion de texto. La model card menciona soporte de vLLM para CosyVoice2-0.5B y runtime Triton/TensorRT-LLM anadido en agosto de 2025; no se confirma que apliquen a este checkpoint de 300 M.
- Latencia y throughput: no disponibles para este checkpoint. La cifra de 150 ms de latencia corresponde a la caracteristica bi-streaming declarada para Fun-CosyVoice 3.0 y no debe extrapolarse sin medicion propia.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | CER test-zh (%) | Similitud test-zh (%) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CosyVoice-300M-Instruct (este repo) | ~300 M | 9 declarados | No disponible | No disponible | Apache 2.0 | ONNX, espejo de terceros |
| CosyVoice2-0.5B | 0,5 B | No detallado en la informacion | 1,45 | 75,7 | No detallado en la informacion | HuggingFace y ModelScope oficiales |
| F5-TTS | 0,3 B | No detallado en la informacion | 1,52 | 74,1 | No disponible | Open source |
| Spark TTS | 0,5 B | No detallado en la informacion | 1,2 | 66,0 | No disponible | Open source |
| VibeVoice-Realtime | 0,5 B | No detallado en la informacion | - | - | No disponible | Open source |

Los valores de CER y similitud proceden de la tabla de evaluacion de Fun-CosyVoice3-0.5B-2512 publicada en la model card; no hay cifras propias publicadas para el checkpoint de 300 M. Como alternativa dentro de la propia familia, Fun-CosyVoice3-0.5B-2512 ofrece mejores cifras reportadas y mas capacidades documentadas a costa de duplicar el tamano de parametros.

## Limitaciones y advertencias

- Repositorio espejo de terceros: el autor es Allinsama, no FunAudioLLM, con 0 descargas y 0 likes en la fecha de consulta. Para uso en produccion conviene descargar los pesos desde los repositorios oficiales y verificar su integridad.
- Inconsistencia entre el nombre del checkpoint (300M-Instruct, familia 1.0) y el contenido de la model card, que describe principalmente Fun-CosyVoice 3.0. Muchas capacidades anunciadas (150 ms de latencia, pronunciation inpainting, 18+ dialectos, modelo RL) corresponden a la version 3.0 y no estan verificadas para este checkpoint.
- Cobertura de idiomas: los 9 idiomas figuran en los metadatos del repositorio, pero el grado real de calidad por idioma no esta documentado en la informacion disponible. Es recomendable evaluar el espanol con un conjunto propio antes de desplegar.
- Riesgo de alucinacion acustica y artefactos: como todo modelo autorregresivo de sintesis, puede producir repeticiones, omisiones o prosodia degradada en entradas largas o atipicas; la familia incorpora RAS precisamente para mitigar la inestabilidad del LLM, pero no la elimina.
- Texto de entrada ruidoso: a pesar de la normalizacion integrada, cifras, siglas, idiomas mezclados y dominios muy tecnicos siguen siendo focos tipicos de error de pronunciacion.
- Riesgo de uso indebido de la clonacion de voz: la capacidad zero-shot de la familia permite imitar voces con pocos segundos de referencia. Es necesario aplicar consentimiento explicito, marcas de agua o deteccion de sintesis si el modelo se expone publicamente.
- Sesgos: no se documentan en la informacion disponible analisis de sesgo por variedad dialectal, genero o edad de las voces.
- Licencia: Apache 2.0 permite uso comercial, pero el espejo de terceros no anade garantias sobre los pesos; conviene revisar los terminos del repositorio oficial y de las dependencias (`ttsfrd`, WeTextProcessing, sox) que se instalan aparte.
- Restricciones de contexto: no se especifica longitud maxima de texto de entrada ni de audio de referencia; habra que determinarla empiricamente.
- Dependencias fragiles: el procedimiento de instalacion oficial requiere clonar el repositorio con submodulos, crear un entorno Conda con Python 3.10 y compilar o instalar sox y `ttsfrd`, lo que complica el despliegue reproducible en contenedores.

## Enlaces

- Repositorio en HuggingFace de este checkpoint: https://huggingface.co/Allinsama/FunAudioLLM__CosyVoice-300M-Instruct
- Repositorio GitHub oficial: https://github.com/FunAudioLLM/CosyVoice
- CosyVoice-300M-Instruct oficial en HuggingFace: https://huggingface.co/FunAudioLLM/CosyVoice-300M-Instruct
- CosyVoice-300M oficial en ModelScope: https://www.modelscope.cn/models/iic/CosyVoice-300M
- Paper CosyVoice (v1): https://funaudiollm.github.io/pdf/CosyVoice_v1.pdf
- Demos CosyVoice 1.0: https://fun-audio-llm.github.io
- CosyVoice 2.0: demos https://funaudiollm.github.io/cosyvoice2/ ; paper https://arxiv.org/abs/2412.10117 ; HuggingFace https://huggingface.co/FunAudioLLM/CosyVoice2-0.5B ; ModelScope https://www.modelscope.cn/models/iic/CosyVoice2-0.5B
- Fun-CosyVoice 3.0: demos https://funaudiollm.github.io/cosyvoice3/ ; paper https://arxiv.org/abs/2505.17589 ; HuggingFace https://huggingface.co/FunAudioLLM/Fun-CosyVoice3-0.5B-2512 ; ModelScope https://www.modelscope.cn/models/FunAudioLLM/Fun-CosyVoice3-0.5B-2512
- Conjunto de evaluacion CV3-Eval: https://github.com/FunAudioLLM/CV3-Eval
- Paper de referencia adicional citado en los tags: https://arxiv.org/abs/2407.05407
