# dARYNel/qwen3-4b-medQA-kklang

## Resumen

El modelo `dARYNel/qwen3-4b-medQA-kklang` es un ajuste fino (fine-tuning) del modelo base `unsloth/Qwen3-4B` de Alibaba Qwen, especializado en responder preguntas medicas en tres idiomas: ingles, ruso y kazajo. Lo desarrolla el usuario dARYNel como proyecto experimental y lo publica en Hugging Face bajo licencia Apache 2.0. El problema que aborda es la adaptacion de un modelo generalista de 4.000 millones de parametros a un dominio vertical (QA medico) mediante QLoRA sobre el corpus MedQuAD del NIH, con el objetivo de producir respuestas medicas generales y prudentes en un rango de idiomas poco cubierto por los modelos comerciales, incluyendo el kazajo.

La arquitectura subyacente es la de Qwen3-4B: un transformer decoder-only denso (no MoE) de 4.022.468.096 parametros, con ventana de contexto nativa de 32.768 tokens en la familia Qwen3 (el entrenamiento de este adaptador se hizo con longitud maxima de 1024 tokens). El adaptador LoRA (rango 16, alpha 16, 33 millones de parametros, aproximadamente el 0,8 % del modelo) se fusiono en los pesos de 16 bits, de modo que el repositorio contiene un modelo autonomo y no solo un adaptador, aunque el adaptador original se conserva en la carpeta `lora_adapter/`.

Es relevante ahora por tres motivos: demuestra el flujo completo de QLoRA con Unsloth sobre hardware de consumo (una RTX 5060 de 8 GB), documenta de forma transparente el particionado de datos para evitar fugas entre traducciones, y cubre el kazajo en un dominio sanitario, un hueco tipico de los modelos multilingues. Al mismo tiempo, el autor advierte explicitamente que se trata de un modelo de estudiante experimental sin validacion clinica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos de Qwen3-4B; entrenamiento del adaptador con max length 1024 |
| Tipos de cuantizacion | Pesos publicados en 16 bits (safetensors); entrenamiento en 4 bits (bnb-4bit) sobre el base; inferencia en 4 bits via bitsandbytes/Unsloth |
| Idiomas soportados | Ingles (en), ruso (ru), kazajo (kk) |
| Licencia | Apache 2.0 (datos MedQuAD: CC BY 4.0) |
| Formato de pesos | safetensors (modelo fusionado) + adaptador LoRA en `lora_adapter/` |
| Libreria | transformers |
| Tamano del repo | 8,2 GB |
| Modelo base | unsloth/Qwen3-4B (entrenado sobre unsloth/Qwen3-4B-unsloth-bnb-4bit) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de Qwen3 con 4.022 millones de parametros. Sobre el checkpoint base congelado en 4 bits se entreno un adaptador QLoRA con Unsloth de rango r=16, alpha=16, dropout 0, aplicado a las proyecciones q/k/v/o y gate/up/down (33 millones de parametros entrenables, 0,8 % del total). El entrenamiento consistio en un unico epoch de SFT con 4.850 pasos, learning rate 2e-4 con scheduler coseno, warmup del 3 %, batch efectivo de 2 x 4, longitud maxima de 1024 tokens y AdamW de 8 bits, ejecutado en una RTX 5060 de 8 GB. La perdida final fue de aproximadamente 0,58 en entrenamiento y 0,627 en validacion. Posteriormente el adaptador se fusiono en el modelo de 16 bits mediante W + B·A·alpha/r.

Los datos proceden de MedQuAD (Ben Abacha y Demner-Fushman, 2019), pares pregunta-respuesta medicos del NIH. Cada fila se convirtio en tres dialogos (en, ru, kk) usando la plantilla de chat de Qwen3 con `enable_thinking=False`, es decir, sin bloque de razonamiento. Se descartaron las filas sin traduccion, quedando 14.368 filas que produjeron 12.931 pares x 3 idiomas = 38.793 dialogos de entrenamiento y 1.437 x 3 de validacion. El split del 10 % se hizo antes de expandir a idiomas, de modo que las traducciones de una misma pregunta nunca aparecen simultaneamente en entrenamiento y validacion. Las versiones en ruso y kazajo son traducciones automaticas del original ingles, por lo que arrastran sus errores. No se documenta ninguna innovacion de decodificacion especulativa ni atencion lineal propia de este ajuste.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, ruso y kazajo, con plantilla de chat de Qwen3.
- Respuesta a preguntas de salud de caracter general a partir del corpus MedQuAD (definiciones, factores de riesgo, cuidados, informacion sobre enfermedades).
- Comportamiento prudente guiado por system prompt: recomienda consultar a un profesional sanitario ante sintomas personales.
- Modo de razonamiento desactivado por defecto (`enable_thinking=False`), lo que reduce latencia y verbosidad en comparacion con el Qwen3 base.
- Capacidades heredadas del Qwen3-4B base (generacion general, matematicas y codigo) que no fueron reforzadas ni evaluadas en este ajuste; su calidad puede degradarse respecto al base en tareas fuera del dominio medico.
- No se documenta soporte especifico de tool calling, function calling ni uso agentico en este ajuste.
- No dispone de vision ni audio.

## Casos de uso

- Atencion al paciente en fase de triaje informativo: el modelo puede responder en ingles, ruso o kazajo a preguntas frecuentes sobre enfermedades descritas en MedQuAD, siempre con un system prompt que derive la decision clinica a un profesional.
- Asistencia sanitaria en entornos de habla kazaja: al cubrir kk de forma nativa en el ajuste, sirve como base para bots informativos en clinicas de Kazajistan, con la advertencia de que las traducciones de entrenamiento son automaticas.
- Educacion para pacientes: generar explicaciones divulgativas de enfermedades y cuidados a partir de las respuestas de referencia del NIH, utiles en materiales de alfabetizacion sanitaria.
- Prototipado rapido de asistentes medicos multilingues: al ser un modelo de 4B con licencia Apache 2.0 y pesos safetensors, se puede desplegar en una GPU de 8 GB para validar un producto antes de invertir en modelos mayores.
- Generacion de FAQ internas para personal no clinico: redactar respuestas borrador en tres idiomas a partir de preguntas frecuentes, que luego un revisor humano valida.
- Investigacion sobre QLoRA y ajuste de dominio: el repositorio documenta hiperparametros, particionado de datos y perdidas, lo que lo convierte en un caso reproducible para estudiar la transferencia de dominio en modelos de 4B con hardware de consumo.
- Traduccion y normalizacion de terminologia sanitaria en kazajo: como punto de partida para construir glosarios o corpus paralelos, dado que el modelo fue entrenado con pares alineados en tres idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida de entrenamiento (~0,58) y de validacion (0,627), sin evaluaciones tipo MMLU, HumanEval, GSM8K ni metricas de QA medico (por ejemplo, exactitud o F1 sobre MedQuAD).

## Requisitos de hardware

- VRAM estimada: aproximadamente 9 GB en 16 bits para inferencia; con `load_in_4bit=True` (bitsandbytes/Unsloth) cabe en GPUs de 8 GB.
- GPU recomendadas: RTX 5060 de 8 GB (la usada en el entrenamiento, valida para inferencia en 4 bits), RTX 4090, A100 y H100 para despliegue en 16 bits o con mayor concurrencia.
- Cabe en GPU de consumo: si, en 4 bits en tarjetas de 8 GB; en 16 bits requiere al menos 10-12 GB de VRAM efectiva.
- Opciones de despliegue: transformers (ruta documentada), text-generation-inference (el modelo esta etiquetado como compatible con endpoints), vLLM y llama.cpp/Ollama previa conversion a GGUF (no se proporcionan pesos GGUF en el repositorio).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| dARYNel/qwen3-4b-medQA-kklang | 4,02 B | 32.768 (nativo Qwen3-4B) | QA medico (MedQuAD) | en, ru, kk | Apache 2.0 | Hugging Face, pesos safetensors |
| unsloth/Qwen3-4B (base) | 4,02 B | 32.768 | Generalista | Multilingue amplio | Apache 2.0 | Hugging Face |
| Qwen3-4B-Instruct (oficial) | 4,02 B | 32.768 | Generalista con modo thinking | Multilingue amplio | Apache 2.0 | Hugging Face |
| Modelos medicos especializados de 7B-8B (por ejemplo, variantes MedQuAD/PubMed) | 7-8 B | Variable | QA medico | Principalmente en | Variable | Variable |

La comparativa directa de rendimiento no es posible porque el autor no publica benchmarks. Frente al Qwen3-4B base, este ajuste gana especificidad de dominio y cobertura de kazajo en salud, pero pierde capacidades generales no reforzadas y no ofrece modo thinking.

## Limitaciones y advertencias

- Modelo experimental de estudiante: la precision medica no ha sido revisada por un medico; puede inventar hechos, factores de riesgo y datos clinicos.
- No debe usarse para diagnostico, tratamiento ni emergencias. Ante una situacion vital, el autor indica llamar a los numeros de emergencia locales (103/112 en Kazajistan y Rusia).
- En preguntas urgentes no cubiertas por MedQuAD (ictus, dolor toracico), el modelo a veces no reconoce la gravedad en ruso y no recomienda llamar a una ambulancia en kazajo.
- Los datos en ruso y kazajo son traducciones automaticas del ingles, por lo que los errores de traduccion se propagan a las respuestas.
- Riesgo de alucinacion en terminologia medica, dosis, contraindicaciones y recomendaciones de tratamiento.
- Sesgos heredados del corpus MedQuAD (sesgo de fuente NIH, cobertura desigual de enfermedades) y del modelo base Qwen3.
- Capacidades generales (codigo, matematicas, tool calling) no fueron evaluadas tras el ajuste y pueden estar degradadas respecto al base.
- Licencia Apache 2.0 permite uso comercial, pero los datos MedQuAD son CC BY 4.0 y exigen atribucion; el uso en produccion sanitaria requiere validacion clinica independiente y cumplimiento normativo local.
- El repositorio no incluye pesos GGUF ni evaluaciones reproducibles; la adopcion en produccion exige una bateria de pruebas propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dARYNel/qwen3-4b-medQA-kklang
- Modelo base: https://huggingface.co/unsloth/Qwen3-4B
- Checkpoint base en 4 bits usado en entrenamiento: https://huggingface.co/unsloth/Qwen3-4B-unsloth-bnb-4bit
- Corpus MedQuAD: https://github.com/abachaa/MedQuAD
- Referencia de MedQuAD (Ben Abacha y Demner-Fushman, 2019): https://doi.org/10.18653/v1/W19-5034
- Unsloth: https://github.com/unslothai/unsloth
- Familia Qwen3: https://huggingface.co/Qwen/Qwen3-4B
