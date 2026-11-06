# dianavdavidson/whisper-medium_mucs_68256_15_100_1e-4_None_hinglish_mixed_scripts_FT

## Resumen

El modelo `whisper-medium_mucs_68256_15_100_1e-4_None_hinglish_mixed_scripts_FT` es un ajuste fino (fine-tuning) del modelo base `openai/whisper-medium` de OpenAI, publicado por el usuario `dianavdavidson` en Hugging Face. Se trata de un modelo de reconocimiento automatico del habla (ASR) orientado especificamente al fenomeno del "hinglish" (mezcla de hindi e ingles) con "mixed scripts", es decir, transcripciones que alternan alfabeto latino y devanagari. El nombre del repositorio sugiere un dataset de entrenamiento identificado como `mucs_68256_15_100`, con un ratio de mezcla de 0,15 y 100 epocas de entrenamiento a una tasa de aprendizaje de 1e-4.

Arquitectonicamente hereda la estructura encoder-decoder transformer de Whisper medium, con 763.857.920 parametros totales y pesos en formato safetensors. El modelo esta pensado para transcripcion de audio en contextos bilingues hindi-ingles, un escenario frecuente en India y en comunidades de diaspora, donde los hablantes alternan idiomas dentro de una misma frase y los sistemas de transcripcion suelen producir errores por cambio de codigo linguistico.

Su relevancia actual radica en que aborda un nicho poco cubierto por los modelos ASR generalistas: el reconocimiento de habla con code-switching y mezcla de sistemas de escritura. Sin embargo, los resultados reportados por el autor (WER global de 36,7 % en el mejor punto de validacion) indican que el rendimiento es limitado y que debe evaluarse con cautela antes de usarlo en produccion. El modelo tiene licencia Apache 2.0 y se distribuye unicamente a traves de Hugging Face con la libreria transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper medium) |
| Parametros totales | 763.857.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (orientado a hinglish: hindi + ingles con mixed scripts) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `openai/whisper-medium`, un transformer encoder-decoder disenado para ASR y traduccion de voz, con 763,8 millones de parametros. El ajuste fino se realizo con la libreria transformers (version 5.0.0.dev0) y PyTorch 2.9.0+cu126, usando el Trainer de Hugging Face con `adamw_torch_fused` (betas 0,9 y 0,999, epsilon 1e-8), tasa de aprendizaje constante de 1e-4 con 500 pasos de calentamiento, batch total de 32 (16 x 2 pasos de acumulacion de gradiente), semilla 42 y 100 epocas. El nombre del repositorio codifica el dataset (`mucs_68256`), un ratio de mezcla de 0,15 y 100 epocas.

La model card no documenta la composicion del dataset de entrenamiento, el numero de tokens de audio ni si se aplicaron tecnicas de aumentacion o regularizacion. Tampoco se especifica si hubo etapas de RLHF o DPO, algo poco habitual en modelos ASR. La innovacion principal no reside en la arquitectura, sino en el objetivo del ajuste: adaptar Whisper medium a transcripciones hinglish con alternancia de alfabetos (latino y devanagari), un caso de code-switching que los modelos ASR multilingues suelen manejar con dificultad.

## Capacidades

- Reconocimiento automatico del habla (ASR) en audio con mezcla de hindi e ingles.
- Transcripcion con "mixed scripts": salida que puede combinar caracteres latinos y devanagari.
- Manejo de code-switching intra-frase, es decir, cambios de idioma dentro de una misma oracion.
- Compatible con la pipeline `automatic-speech-recognition` de transformers.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de traduccion de voz, aunque el modelo base Whisper la soporta.
- No se documenta capacidad de vision, audio adicional ni thinking mode.

## Casos de uso

- Transcripcion de reuniones y llamadas de equipos bilingues hindi-ingles: el modelo puede procesar audio donde los hablantes alternan idiomas y sistemas de escritura, reduciendo la necesidad de post-procesado manual para separar idiomas.
- Subtitulado de contenido audiovisual de creadores indios que mezclan hindi e ingles: util para plataformas de video que necesitan subtitulos en hinglish con grafia mixta.
- Atencion al cliente en centros de contacto de India: transcripcion de conversaciones de soporte tecnico donde el agente y el cliente alternan idiomas, para su posterior analisis de calidad o mineria de datos.
- Generacion de actas y notas de voz en aplicaciones de productividad: integracion en apps de dictado que necesitan reconocer frases hinglish sin forzar al usuario a elegir un unico idioma.
- Investigacion sociolinguistica: analisis de corpus de habla real con code-switching para estudiar patrones de alternancia de codigo y de escritura.
- Accesibilidad y transcripcion para personas con discapacidad auditiva en comunidades de diaspora india: generacion de transcripciones que reflejan fielmente el habla mixta de los interlocutores.
- Preprocesado para pipelines de NLP: convertir audio hinglish en texto que alimente sistemas de analisis de sentimiento o resumen, aunque con la advertencia del WER elevado.

## Benchmarks y rendimiento

La model card declara los siguientes resultados en el conjunto de evaluacion durante el entrenamiento. No se han publicado resultados en el `model-index` (la lista de resultados esta vacia). Los datos proceden del autor y son de validacion interna, no de benchmarks estandar como Common Voice o FLEURS.

| Epoca | Paso | Training loss | Validation loss | Global WER |
|---|---|---|---|---|
| 1,0 | 432 | 0,8348 | 0,4487 | 43,19 |
| 2,0 | 864 | 0,5112 | 0,4393 | 46,15 |
| 3,0 | 1296 | 0,3586 | 0,4408 | 54,01 |
| 4,0 | 1728 | 0,2652 | 0,4417 | 37,49 |
| 5,0 | 2160 | 0,2037 | 0,4607 | 39,61 |
| 6,0 | 2592 | 0,1637 | 0,5060 | 36,72 |
| 7,0 | 3024 | 0,1314 | 0,5392 | 37,46 |
| 8,0 | 3456 | 0,1076 | 0,5432 | 37,89 |
| 9,0 | 3888 | 0,0949 | 0,5591 | 40,10 |

El mejor WER global reportado es 36,72 % en la epoca 6 (paso 2592). A partir de esa epoca, la perdida de validacion aumenta de forma sostenida (de 0,5060 a 0,5591 en la epoca 9), lo que indica sobreajuste. No hay resultados de benchmarks estandar comparables (MMLU, HumanEval, GSM8K no aplican a un modelo ASR).

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 3,1 GB solo para pesos (763,8 M de parametros x 4 bytes), mas memoria para activaciones y buffers de audio.
- VRAM estimada en FP16/BF16: aproximadamente 1,5 GB para pesos, mas overhead de inferencia.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para FP16; una RTX 3060, RTX 4060 o superior es suficiente. Para lotes grandes o baja latencia, A100 o H100 no aportan ventaja significativa dado el tamano del modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 6 GB o mas (RTX 2060, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: transformers con pipeline `automatic-speech-recognition`, TGI (Text Generation Inference) para servir el modelo, y potencialmente llama.cpp u Ollama si se convierte a GGUF (no documentado por el autor).
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-medium_mucs_68256_15_100_1e-4_None_hinglish_mixed_scripts_FT | 763,8 M | no disponible | 36,72 % (validacion propia) | Apache 2.0 | Hugging Face |
| openai/whisper-medium | 769 M | 30 s de audio | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| openai/whisper-large-v3 | 1,55 B | 30 s de audio | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| dianavdavidson/whisper-medium_mucs_62986_ratio_0_25_lr_1e-4_lgid_None_hinglish_mixed_scripts_FT | 763,8 M | no disponible | no disponible | Apache 2.0 | Hugging Face |

La comparativa directa con el modelo base es la mas relevante: el ajuste fino busca mejorar el rendimiento en hinglish a costa de un posible deterioro en otros idiomas. Los modelos hermanos del mismo autor (variantes con distintos ratios de mezcla, como `ratio_0_25` o `ratio_alldata`) permiten explorar configuraciones alternativas, pero no se han publicado sus WER en la informacion disponible.

## Limitaciones y advertencias

- El WER global de validacion es elevado (36,72 % en el mejor punto), lo que limita su uso en produccion sin revision humana.
- La model card no documenta el dataset de entrenamiento, su tamano, composicion ni procedencia, lo que impide evaluar sesgos y cobertura.
- Riesgo de sobreajuste: la perdida de validacion aumenta a partir de la epoca 6 mientras la de entrenamiento sigue bajando.
- No se documentan los idiomas soportados ni el comportamiento fuera del dominio hinglish; es probable que el rendimiento en otros idiomas se degrade respecto al modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento ni sobre la calidad de las transcripciones.
- No hay informacion sobre sesgos de genero, acento o dialecto; el modelo podria tener peor rendimiento con acentos regionales no representados en el dataset.
- El repositorio tiene 90 descargas y 0 likes, lo que sugiere poca validacion por parte de la comunidad.
- No se han publicado benchmarks estandar, por lo que la comparacion con otros modelos ASR es dificil.
- El modelo fue creado en noviembre de 2026 segun los metadatos de Hugging Face; verificar la fecha antes de citarlo.

## Enlaces

- [Hugging Face: dianavdavidson/whisper-medium_mucs_68256_15_100_1e-4_None_hinglish_mixed_scripts_FT](https://huggingface.co/dianavdavidson/whisper-medium_mucs_68256_15_100_1e-4_None_hinglish_mixed_scripts_FT)
- [Modelo base: openai/whisper-medium](https://huggingface.co/openai/whisper-medium)
- [Paper de Whisper: Robust Speech Recognition via Large-Scale Weak Supervision](https://arxiv.org/abs/2212.04356)
- [Variante hermana: whisper-medium_mucs_62986_ratio_0_25_lr_1e-4_lgid_None_hinglish_mixed_scripts_FT](https://huggingface.co/dianavdavidson/whisper-medium_mucs_62986_ratio_0_25_lr_1e-4_lgid_None_hinglish_mixed_scripts_FT)
- [Variante hermana: whisper-medium_mucs_62986_ratio_0_25_lr_1e-4_lgid_hi_hinglish_mixed_scripts_FT](https://huggingface.co/dianavdavidson/whisper-medium_mucs_62986_ratio_0_25_lr_1e-4_lgid_hi_hinglish_mixed_scripts_FT)
- [Registro en free2aitools](https://free2aitools.com/model/dianavdavidson/whisper-medium_mucs_68256_15_100_1e-4_none_hinglish_mixed_scripts_ft)
- [Registro en savrn.com (variante relacionada)](https://savrn.com/models/whisper-medium-mucs-62986-ratio-0-25-lr-1e-4-lgid-hi-hinglish-mixed-scripts-ft)
