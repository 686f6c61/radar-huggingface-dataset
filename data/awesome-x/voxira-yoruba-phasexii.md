# Awesome-x/voxira-yoruba-phaseXII

## Resumen

Voxira Yorùbá Phase XII es un modelo de reconocimiento automático del habla (ASR) especializado en yoruba y en code-switching yoruba-inglés, desarrollado por Awesome-x. Se trata de un fine-tune de `facebook/wav2vec2-large-xlsr-53` con 315.486.895 parámetros (aproximadamente 315 M), entrenado durante 10 épocas sobre un corpus interno de audio de estudio. El modelo aborda un problema concreto y poco cubierto: la transcripción de habla que alterna yoruba e inglés nigeriano dentro de una misma emisión, un fenómeno habitual en contextos urbanos de Nigeria que los sistemas ASR monolingües manejan mal.

La versión Phase XII introduce cambios simultáneos en los pesos acústicos y en el decodificador: nuevos pesos (checkpoint-2950), un vocabulario de salida ampliado a 47 filas que añade Q, X, Z y apóstrofo, y un modelo de lenguaje KenLM de 4-gramas de 10,83 MB entrenado sobre 141.476 líneas con una proporción 40/30/30 (yoruba / inglés / code-switched). La decodificación requiere un paso de fusión de blank entre las filas 0 y 46, por lo que `processor.batch_decode` estándar no funciona directamente.

El modelo se publica como release candidate con verificación independiente pendiente. Los resultados declarados por el autor muestran una reducción del WER del 26,70 % (greedy CTC sin LM) al 19,76 % (KenLM con ajustes por defecto) sobre 49 clips de validación, aunque el propio autor advierte que el conjunto de evaluación es pequeño, proviene de una única fuente (grabaciones de estudio leídas) y que parte de los ajustes se seleccionaron sobre esos mismos clips.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 (transformer convolucional + encoder Transformer), fine-tune de `facebook/wav2vec2-large-xlsr-53` |
| Parametros totales | 315.486.895 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo acústico; ventana de entrada típica de Wav2Vec2, no declarada en la model card) |
| Tipos de cuantizacion | no disponible (repo en safetensors fp32; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | yoruba (yo), inglés nigeriano (en), code-switching yoruba-inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Wav2Vec2: un extractor de características convolucional que convierte la forma de onda en representaciones latentes, seguido de un encoder Transformer que produce estados ocultos, sobre los que se aplica una cabeza CTC. Parte de `facebook/wav2vec2-large-xlsr-53`, preentrenado multilingüe con Cross-Lingual Speech Representation, y se ha fine-tuneado durante 10 épocas (checkpoint-2950) sobre audio de estudio interno del proyecto Voxira.

El vocabulario de salida se ha ampliado respecto a fases anteriores: `vocab.json` contiene 46 entradas (incluye `Q`=42, `X`=43, `Z`=44 y `'`=45) más `<pad>` en la fila 46, lo que da 47 filas de salida. La probabilidad de blank se reparte entre las filas 0 y 46, de modo que la decodificación exige una fusión explícita de ambas. El decodificador combina CTC con un modelo de lenguaje KenLM de 4-gramas (`phaseXII_40_30_30_prune.bin`, 10,83 MB, podado con `--prune 0 1 1 2`) y una lista de unigramas de 50.259 palabras; los parámetros almacenados son alpha=0,25 y beta=0,50 en `attrs.json`, aunque también se probaron 0,30/0,50 y 0,35/0,60. El corpus del LM son 141.476 líneas balanceadas 40/30/30 entre yoruba, inglés y code-switched, con eliminación de texto repetitivo y limitación de aperturas plantilladas a 100 por prefijo. No se documenta uso de RLHF ni DPO (no aplica a un modelo CTC de ASR).

## Capacidades

- Reconocimiento automático del habla en yoruba e inglés nigeriano, incluyendo emisiones con code-switching intra-oración.
- Transcripción de audio de estudio con calidad de grabación razonable; el conjunto de evaluación son tomas leídas en estudio.
- Decodificación CTC con integración de modelo de lenguaje KenLM vía `pyctcdecode`, con ajuste de alpha y beta.
- Manejo de un vocabulario ampliado que cubre grafemas Q, X, Z y apóstrofo, presentes en préstamos del inglés y en ortografía yoruba.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje generativo).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües limitadas a los dos idiomas declarados (yo, en).
- Capacidades especiales: no se declaran modos de pensamiento, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones y entrevistas en contextos nigerianos urbanos: el modelo está entrenado específicamente para habla que alterna yoruba e inglés, por lo que puede transcribir conversaciones donde los hablantes cambian de idioma a media frase sin segmentar el audio por idioma.
- Subtitulado de contenido audiovisual nigeriano (Nollywood, podcasts, radio): permite generar subtítulos en yoruba e inglés mezclados, con la salvedad de que el WER declarado (~19-27 %) exige revisión humana en producción.
- Atención al cliente en call centers: transcripción de llamadas de clientes que hablan yoruba con términos técnicos o comerciales en inglés, usando el KenLM para mejorar la coherencia léxica en dominios con vocabulario recurrente.
- Documentación clínica o administrativa dictada: grabaciones de estudio o consulta con terminología mixta; el modelo base XLSR-53 aporta robustez acústica y el LM sesga hacia vocabulario frecuente del corpus.
- Investigación lingüística sobre code-switching: generación de transcripciones anotadas para corpus de habla yoruba-inglés, con la ventaja de un vocabulario que cubre grafemas del inglés ausentes en fases previas.
- Sistemas de accesibilidad y dictado para hablantes bilingües: integración en aplicaciones de dictado que necesiten reconocer nombres propios y términos en inglés dentro de frases en yoruba.
- Pipeline de evaluación de ASR de bajo recurso: el modelo sirve como referencia reproducible (pesos safetensors, licencia Apache 2.0) para comparar decodificadores CTC con y sin LM en lenguas africanas.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente). El conjunto de evaluación son las últimas 50 indicaciones del corpus `AR_metadata` retenidas fuera de todos los buckets de entrenamiento del LM; `AR_418.wav` está vacío, quedando 49 clips válidos (749 palabras de referencia) y 44 tomas limpias (664 palabras).

Conjunto de 49 clips válidos (749 palabras):

| Decodificador | WER (%) |
|---|---|
| Greedy CTC con fusión de blank, sin LM | 26,70 |
| KenLM, lista de 66.184 palabras, alpha=0,30 beta=0,50 | 19,76 |

Conjunto de 44 tomas limpias (664 palabras):

| Decodificador | Errores / palabras | WER (%) | IC 95 % (ingenuo) | Reducción relativa de error |
|---|---|---|---|---|
| Greedy CTC con fusión de blank, sin LM | 179 / 664 | 26,96 | 23,7–30,5 | — |
| KenLM, 66.184 palabras, alpha=0,30 beta=0,50 | 128 / 664 | 19,28 | 16,5–22,5 | 28,5 % |
| KenLM, 66.184 palabras, alpha=0,25 beta=0,50 | 125 / 664 | 18,83 | 16,0–22,0 | 30,2 % |
| KenLM, 66.184 palabras, alpha=0,35 beta=0,60 | 125 / 664 | 18,83 | 16,0–22,0 | 30,2 % |
| KenLM, lista ampliada, alpha=0,30 beta=0,50 | 125 / 664 | 18,83 | 16,0–22,0 | 30,2 % |
| KenLM, lista ampliada, alpha=0,25 beta=0,50 (configuración enviada) | 123 / 664 | 18,52 | 15,8–21,7 | 31,3 % |
| KenLM, lista ampliada, alpha=0,35 beta=0,60 | 123 / 664 | 18,52 | 15,8–21,7 | 31,3 % |

El autor señala que la configuración enviada (18,52 %) se ajustó sobre las mismas tomas de evaluación, por lo que la cifra con ajustes por defecto (19,76 % sobre 49 clips) es la estimación más honesta. No hay comparación con otros modelos publicada en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,3 GB solo para pesos (315 M × 4 bytes), más activaciones y el estado del decodificador; en la práctica, 2-4 GB según longitud de audio y batch.
- En fp16: aproximadamente 0,65 GB de pesos; cuantización a int8 no documentada por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para batch pequeño; A100, H100, RTX 4090, RTX 3090, RTX 3060 o superiores son suficientes y de sobra.
- Cabe en GPU de consumo: sí, en GTX 1660 (6 GB), RTX 2060, RTX 3060, RTX 4060 y superiores.
- Opciones de despliegue: `transformers` (librería declarada), con `pyctcdecode` + KenLM para la decodificación con LM; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a un modelo CTC de ASR de este tamaño).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Contexto / notas |
|---|---|---|---|---|
| Voxira Yorùbá Phase XII | 315 M | yo, en (code-switching) | Apache 2.0 | Fine-tune de XLSR-53 con LM KenLM propio; WER declarado 19,76 % en 49 clips |
| `facebook/wav2vec2-large-xlsr-53` | ~317 M | 53 idiomas (incluye yoruba) | Apache 2.0 | Modelo base multilingüe; sin especialización en code-switching y sin LM específico |
| Otros fine-tunes de XLSR-53 para yoruba | ~315 M | yo | variable | No se dispone de datos de benchmarks comparables en la información proporcionada |

No se dispone de resultados de benchmarks de terceros para establecer una comparación cuantitativa con alternativas; la comparación con el modelo base es estructural (misma arquitectura y tamaño), no de rendimiento.

## Limitaciones y advertencias

- Los resultados son autodeclarados y no verificados de forma independiente; el propio autor marca el modelo como release candidate con verificación pendiente.
- El conjunto de evaluación es pequeño (49 clips, 749 palabras) y proviene de una única fuente (grabaciones de estudio leídas), por lo que no constituye una estimación de generalización a audio real, ruidoso o espontáneo.
- La configuración enviada (18,52 % WER) se ajustó sobre las mismas tomas de evaluación; el autor recomienda usar la cifra con ajustes por defecto (19,76 %) como referencia más honesta.
- La decodificación requiere fusión de blank entre las filas 0 y 46; `processor.batch_decode` estándar no funciona y produce resultados incorrectos.
- El vocabulario de salida tiene 47 filas y cubre solo yoruba e inglés nigeriano; no hay soporte para otros idiomas ni para audio multilingüe fuera de ese par.
- Riesgo de alucinación léxica inherente a la decodificación con KenLM: el LM puede sesgar hacia palabras frecuentes del corpus y producir sustituciones plausibles pero incorrectas.
- Sesgos potenciales derivados del corpus de entrenamiento: audio de estudio, posible sobrerrepresentación de determinados dominios (el autor menciona banca y conversacional en fases previas) y de hablantes concretos.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de `facebook/wav2vec2-large-xlsr-53` conviene revisar las condiciones del modelo base.
- No se documentan cuantizaciones oficiales ni métricas de latencia/throughput para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Awesome-x/voxira-yoruba-phaseXII
- Resultados de evaluación declarados: https://huggingface.co/Awesome-x/voxira-yoruba-phaseXII/blob/main/eval_results.json
- Modelo base: https://huggingface.co/facebook/wav2vec2-large-xlsr-53
- Dataset citado: https://huggingface.co/datasets/google/fleurs
- Paper de Wav2Vec 2.0: https://arxiv.org/abs/2006.11477
- Paper de XLSR (Cross-Lingual Speech Representation): https://arxiv.org/abs/2006.13979
- KenLM: https://github.com/kpu/kenlm
- pyctcdecode: https://github.com/kensho-technologies/pyctcdecode
