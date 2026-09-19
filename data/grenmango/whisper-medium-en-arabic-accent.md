# Grenmango/whisper-medium-en-arabic-accent

## Resumen

Grenmango/whisper-medium-en-arabic-accent es un ajuste fino de openai/whisper-medium.en orientado especificamente a la transcripcion de ingles hablado con acento arabe. El modelo parte de los 769 millones de parametros de Whisper medium en su variante monolingue en ingles y aplica un ajuste con LoRA (r=32, alpha=64) sobre el subconjunto arabe del corpus L2-ARCTIC, tras lo cual los adaptadores se fusionan permanentemente en los pesos base. El resultado es un modelo autonomo (standalone) que se carga con `WhisperForConditionalGeneration` sin necesidad de `peft` ni de configuracion adicional.

El problema que aborda es concreto y medible: los sistemas ASR genericos pierden precision cuando el hablante tiene un acento no nativo, y este caso el autor lo cuantifica con una reduccion relativa del WER de aproximadamente el 45,9 % frente al modelo base sin ajustar sobre el mismo conjunto de prueba. El modelo declara un WER del 4,44 % y un CER del 2,04 % en habla leida limpia del split de test, frente al 8,21 % / 3,95 % de whisper-medium.en en modo zero-shot.

Es relevante ahora porque forma parte de una coleccion mas amplia del mismo autor que cubre acentos vietnamita, chino, hindi, coreano y espanol, y porque demuestra que un ajuste LoRA de apenas 3,9 horas de audio puede superar de forma clara a modelos mucho mayores en dominios acotados de acento. Se publica bajo licencia Apache 2.0, en safetensors y con pesos fusionados en FP16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (arquitectura Whisper), modelo base openai/whisper-medium.en |
| Parametros totales | 763.856.896 (769 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de audio de 30 segundos (chunk_length_s=30); max_new_tokens=128 en el ejemplo de generacion de la model card |
| Tipos de cuantizacion | Pesos fusionados en FP16; no se documentan otras cuantizaciones |
| Idiomas soportados | en (ingles) unicamente |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano del repo: 1,5 GB) |

## Arquitectura y entrenamiento

Se trata de un transformer encoder-decoder con la topologia estandar de Whisper medium, heredada integramente de openai/whisper-medium.en. La entrada acustica es un espectrograma log-Mel de 80 canales sobre audio mono a 16 kHz, y la salida es texto en ingles generado por el decodificador autorregresivo. El ajuste no modifica la topologia: se aplica LoRA con rango 32 y alpha 64 sobre las proyecciones `q_proj`, `k_proj`, `v_proj`, `out_proj`, `fc1` y `fc2`, es decir, sobre los mecanismos de atencion y las capas feed-forward del encoder y del decodificador. Posteriormente los adaptadores se fusionan en los pesos base y se exportan en FP16, de modo que el modelo final es indistinguible en uso de un Whisper medium convencional y no requiere `peft` en inferencia.

Los datos de entrenamiento proceden del subconjunto arabe del corpus L2-ARCTIC: 3.927 enunciados (aproximadamente 3,9 horas de audio) correspondientes a cuatro hablantes, ABA (masculino), SKA (femenino), YBAA (masculino) y ZHAA (femenino). Se trata por tanto de un ajuste de dominio muy pequeno, orientado exclusivamente a adaptar el modelo a un patron acentual concreto y no a ampliar capacidades generales. No se documenta en la informacion disponible el uso de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Reconocimiento automatico de voz (ASR) en ingles con acento arabe, con salida de transcripcion de texto plano.
- Transcripcion de audio en formato de onda mono a 16 kHz, con remuestreo automatico si se usa el pipeline de `transformers`.
- Procesamiento por troceado de audio en ventanas de 30 segundos (`chunk_length_s=30`), lo que permite transcribir archivos mas largos que la ventana nativa.
- Calculo de metricas de error de transcripcion en la propia evaluacion del autor: WER del 4,44 % y CER del 2,04 % en test.
- Inferencia en CPU o GPU mediante `device="cuda"` o `device="cpu"` en el pipeline.
- Compatibilidad directa con `WhisperProcessor` y `WhisperForConditionalGeneration`, incluido `device_map="auto"` y `torch_dtype=torch.float16`.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio generativo ni modo de razonamiento explicito; es un modelo puramente ASR.

## Casos de uso

- Transcripcion de llamadas de atencion al cliente con agentes o clientes araboparlantes que hablan ingles: el ajuste sobre el subconjunto arabe de L2-ARCTIC reduce el WER aproximadamente un 45,9 % relativo frente al modelo base en este perfil acentual, lo que se traduce en menos correcciones manuales en las transcripciones.
- Subtitulado de reuniones y videoconferencias internacionales: se puede alimentar audio troceado en ventanas de 30 segundos y generar subtitulos en ingles para participantes con acento arabe, aprovechando el pipeline de `transformers` con `chunk_length_s=30`.
- Preprocesado de datos para entrenamiento de otros modelos de NLP: transcripcion masiva de archivos de audio de hablantes araboparlantes para construir corpus de texto en ingles con menor tasa de error que un Whisper medium sin ajustar.
- Sistemas de analitica de contact center: indexacion y busqueda de contenido sobre grabaciones transcritas, donde una reduccion del WER impacta directamente en la calidad del indice y de las consultas posteriores.
- Accesibilidad y documentacion clinica o legal dictada: transcripcion de notas de voz dictadas en ingles por profesionales araboparlantes, un escenario de habla relativamente controlada y poco ruidosa, que es donde el modelo fue evaluado.
- Investigacion en ASR de habla acentuada: el modelo sirve como linea base reproducible de ajuste LoRA sobre L2-ARCTIC, con hiperparametros y datos de entrenamiento completamente documentados, para comparar estrategias de adaptacion al acento.
- Integracion en pipelines de transcripcion hibrida: al ser un modelo standalone de 769 M de parametros en safetensors, se puede desplegar como servicio independiente y enrutar selectivamente el audio de hablantes con acento arabe, dejando el resto del trafico a un modelo generalista.
- Prototipado educativo o demos locales: cabe en GPU de gama de consumo y puede ejecutarse en un portatil con GPU discreta, lo que permite experimentar con ASR acentual sin infraestructura en la nube.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, evaluados sobre habla leida limpia del split `test`:

| Modelo | WER (test) | CER (test) |
|---|---|---|
| whisper-medium-en-arabic-accent (este modelo) | 4,44 % | 2,04 % |
| openai/whisper-medium.en (zero-shot) | 8,21 % | 3,95 % |
| openai/whisper-large-v3-turbo (zero-shot) | 36,34 % | 27,08 % |

El autor reporta una reduccion relativa del WER de aproximadamente el 45,9 % frente al modelo base sin ajustar. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros conjuntos de evaluacion, que por otra parte no aplican a un modelo exclusivamente ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16 los pesos ocupan aproximadamente 1,5 GB, por lo que la inferencia cabe en torno a 2-3 GB de VRAM contando activaciones y buffers; en FP32 el requisito sube a unos 3-4 GB. Son estimaciones basadas en el tamano del repositorio, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 3090, RTX 4090, A100 y H100 funcionan sin problema y quedan sobradamente dimensionadas para este tamano. El modelo no requiere GPU de centro de datos.
- Cabe en GPU de consumo: si, incluida gama media y de generaciones anteriores con 4 GB o mas de VRAM. Tambien es viable la inferencia en CPU, con latencias mayores no cuantificadas en la informacion disponible.
- Opciones de despliegue: `transformers` con `pipeline("automatic-speech-recognition")` es la via documentada por el autor; tambien es compatible con `WhisperForConditionalGeneration` directo y `device_map="auto"`. No se documentan en la model card despliegues con vLLM, llama.cpp, Ollama ni TGI, aunque al ser un modelo Whisper estandar en safetensors es tecnicamente convertible a otros runtimes; dicha conversion no esta verificada ni soportada oficialmente por el autor.
- Latencia y throughput estimados: no disponible. La informacion proporcionada no incluye mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (test L2-ARCTIC arabe) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-medium-en-arabic-accent | 769 M | Ventanas de 30 s de audio | 4,44 % | apache-2.0 | HuggingFace, 0 descargas, 0 likes en el momento de la consulta |
| openai/whisper-medium.en | 769 M | Ventanas de 30 s de audio | 8,21 % (zero-shot) | no indicada en la informacion proporcionada | HuggingFace, modelo base de referencia |
| openai/whisper-large-v3-turbo | no disponible | Ventanas de 30 s de audio | 36,34 % (zero-shot) | no indicada en la informacion proporcionada | HuggingFace, modelo generalista multilingue |
| whisper-medium-en-vi-accent / -chinese-accent / -hindi-accent / -korean-accent / -spanish-accent | 769 M cada uno | Ventanas de 30 s de audio | no disponible | no indicada en la informacion proporcionada | HuggingFace, misma coleccion del autor |

La comparacion debe interpretarse con cautela: los dos modelos comparados se evaluan en modo zero-shot, mientras que este modelo ha sido ajustado especificamente sobre el subconjunto de acento arabe de L2-ARCTIC, que comparte dominio y estilo de grabacion con el conjunto de test. No se dispone de resultados de este modelo en conjuntos externos, ni de benchmarks cruzados entre los distintos modelos de la coleccion de acentos.

## Limitaciones y advertencias

- Dominio de entrenamiento muy reducido: 3.927 enunciados y tan solo cuatro hablantes (ABA, SKA, YBAA, ZHAA). Existe riesgo alto de sobreajuste a las caracteristicas de voz concretas de esos hablantes y de escasa generalizacion a otros hablantes araboparlantes no vistos.
- Sesgo de genero y de registro limitado en los datos: solo hay dos voces masculinas y dos femeninas, con habla leida, lo que no representa la variabilidad real de acentos arabes (egipcio, levantino, del Golfo, magrebi, etc.).
- Modelo monolingue: la arquitectura de origen es `whisper-medium.en`, por lo que solo genera texto en ingles. No transcribe audio en arabe; unicamente ingles hablado con acento arabe.
- Rendimiento fuera de dominio no verificado: no hay resultados publicados sobre habla espontanea, ruido de fondo, audio telefónico de banda estrecha, solapamiento de hablantes ni audio de campo lejano. Los buenos resultados declarados corresponden a habla leida limpia.
- Riesgo de alucinacion: los modelos Whisper tienden a generar texto plausible en segmentos con silencio, ruido o musica, y la informacion disponible no documenta mecanismos de mitigacion especificos en este ajuste.
- Degradacion potencial en ingles sin acento arabe o con otros acentos: al haber ajustado los pesos sobre un unico perfil acentual, el rendimiento en habla nativa estandar puede verse reducido respecto al modelo base. No se aportan mediciones de este efecto.
- Falta de validacion de la comunidad: el repositorio registra 0 descargas y 0 likes, y no se han encontrado referencias externas ni evaluaciones independientes del modelo. Toda la evidencia de rendimiento procede del propio autor.
- Ausencia de datos de latencia, throughput y consumo: no es posible dimensionar un servicio en produccion con la informacion publicada.
- Fechas de publicacion y actualizacion de los metadatos (19 de septiembre de 2026) posteriores a la fecha de consulta, lo que sugiere una posible inconsistencia en los metadatos del repositorio y aconseja verificar el estado real del modelo antes de usarlo.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero conviene revisar las condiciones del modelo base de OpenAI y del corpus L2-ARCTIC antes de un despliegue comercial, ya que la model card no detalla las obligaciones heredadas de las licencias de los datos de entrenamiento.
- Las busquedas web realizadas no devolvieron ningun resultado relevante sobre este modelo; los enlaces recuperados pertenecen a foros de soporte de Windows y no guardan relacion con el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Grenmango/whisper-medium-en-arabic-accent
- Modelo base: https://huggingface.co/openai/whisper-medium.en
- Corpus L2-ARCTIC: https://psi.engr.tamu.edu/l2-arctic-corpus/
- Coleccion multi-acento del mismo autor:
  - https://huggingface.co/Grenmango/whisper-medium-en-vi-accent (vietnamita)
  - https://huggingface.co/Grenmango/whisper-medium-en-chinese-accent (chino)
  - https://huggingface.co/Grenmango/whisper-medium-en-hindi-accent (hindi)
  - https://huggingface.co/Grenmango/whisper-medium-en-korean-accent (coreano)
  - https://huggingface.co/Grenmango/whisper-medium-en-spanish-accent (espanol)
  - https://huggingface.co/Grenmango/whisper-medium-en-vi-hqtv-personalized (personalizado, HQTV)
- Enlaces adicionales (papers, blogs, repos, demos): no disponible. Las busquedas web no arrojaron resultados relevantes sobre este modelo.
