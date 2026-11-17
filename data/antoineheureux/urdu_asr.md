# antoineheureux/Urdu_ASR

## Resumen

Urdu_ASR es un modelo de reconocimiento automatico del habla (ASR) para urdu, desarrollado por el usuario antoineheureux y publicado en Hugging Face bajo el framework ESPnet2. El modelo se ha entrenado con la receta `urdu_dataset` dentro del ecosistema ESPnet, utilizando una arquitectura Conformer con atencion hibrida (CTC + atencion) y tokenizacion BPE. Resuelve la tarea de transcripcion de audio en urdu, un idioma con relativamente pocos recursos ASR abiertos en comparacion con ingles o espanol.

El modelo es de tipo acustico-a-texto (no es un modelo de lenguaje generativo), por lo que su utilidad se limita a la transcripcion de voz. El repositorio ocupa 0,2 GB y las descargas registradas son muy bajas (9), lo que sugiere un modelo de investigacion o experimental mas que un recurso ampliamente validado por la comunidad.

La relevancia actual radica en la escasez de modelos ASR abiertos para urdu con licencia permisiva (CC BY 4.0) y en la posibilidad de integrarlo en pipelines ESPnet existentes. No obstante, los resultados publicados en la model card muestran un WER del 16,4 % y un SER (Sentence Error Rate) del 65,6 %, lo que indica un rendimiento moderado y una tasa de frases completamente erroneas elevada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer hibrido (CTC + atencion) sobre ESPnet2 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (segmentos de audio; `chunk_length: 500` en config de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | urdu (ur) |
| Licencia | CC BY 4.0 |
| Formato de pesos | pesos ESPnet2 (checkpoint PyTorch; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo sigue la configuracion `conf/train_conformer_hybrid_rxt4000.yaml` de ESPnet2, que corresponde a un Conformer con decodificacion hibrida CTC/atencion. El tokenizador es BPE con un vocabulario de aproximadamente 2000 unidades (se observa `bpe2000` en el nombre del experimento y `bpe_split` en los ficheros de formas). El entrenamiento se realizo durante un maximo de 50 epocas con paciencia de 10, optimizador Adam con learning rate 0,001, scheduler warmup de 25000 pasos, `batch_bins` de 30.000.000 y `accum_grad` 1. Se uso AMP (`use_amp: true`) y `train_dtype: float32`.

El dataset de entrenamiento es `urdu_dataset` (referenciado en la model card y en los tags), con splits `train_sp`, `valid` y `test`. No se especifica en la informacion disponible el numero de horas de audio, la composicion exacta del corpus ni si hubo aumentacion de datos mas alla del `speed perturbation` implicito en el sufijo `_sp`. Tampoco se documenta el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un modelo ASR. La innovacion tecnica destacable es el uso de Conformer hibrido con CTC, que permite decodificacion sin modelo de lenguaje externo y es el estandar en ESPnet2 para ASR de recursos medios.

## Capacidades

- Transcripcion de audio en urdu a texto (ASR offline).
- Decodificacion hibrida CTC/atencion, lo que permite obtener alineaciones y puntuaciones CTC ademas de la salida atencional.
- Tokenizacion BPE con vocabulario especifico para urdu (unidades subword).
- No soporta tool calling ni function calling (no es un modelo de lenguaje generativo).
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada exclusivamente al urdu.
- No dispone de modo thinking, vision ni audio generativo; solo entrada de audio y salida de texto.
- Integracion nativa con el ecosistema ESPnet2 (recetas, `run.sh`, decodificacion con `asr_inference`).

## Casos de uso

- Transcripcion de reuniones y entrevistas en urdu: el modelo puede procesar audio de entrada y generar transcripciones con un WER del 16,4 % en el conjunto de test, adecuado para actas internas donde se tolere revision humana posterior.
- Subtitulado automatico de contenido audiovisual en urdu: integrable en pipelines de postproduccion mediante ESPnet2, aunque el SER del 65,6 % obliga a revision manual frase a frase.
- Generacion de corpus textual a partir de archivos de audio en urdu: util para construir datasets de texto para otros fines (analisis, traduccion, busqueda) a partir de grabaciones existentes.
- Investigacion en ASR de bajos recursos: sirve como baseline reproducible para comparar arquitecturas Conformer y tecnicas de aumentacion en urdu.
- Integracion en sistemas de atencion al cliente en urdu: puede transcribir llamadas para su analisis posterior, aunque no es adecuado para tiempo real estricto sin evaluacion de latencia.
- Accesibilidad: transcripcion de contenido hablado en urdu para personas con discapacidad auditiva, con revision humana por la tasa de error a nivel de frase.
- Fines academicos y docencia: ejemplo funcional de receta ESPnet2 para ensenar pipelines ASR completos (preparacion de datos, entrenamiento, decodificacion y evaluacion).

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el split `test` (13.505 frases, 197.116 palabras, 866.259 caracteres), decodificacion `decode_asr_asr_model_valid.acc.ave`:

| Metrica | Corr | Sub | Del | Ins | Err | S.Err |
|---|---|---|---|---|---|---|
| WER | 86,3 | 11,1 | 2,6 | 2,7 | 16,4 | 65,6 |
| CER | 93,2 | 4,0 | 2,8 | 2,5 | 9,2 | 65,6 |
| TER | 84,7 | 11,1 | 4,2 | 2,1 | 17,4 | 65,6 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 0,2 GB, por lo que el checkpoint cabe holgadamente en GPU consumer (por ejemplo, RTX 3060 de 12 GB o superior) incluso con margen para el grafo de computo.
- GPU recomendadas: el entrenamiento se realizo en una unica GPU (config `ngpu: 1`, nombre del experimento `RTX4000`), lo que sugiere que una RTX 4000 o equivalente es suficiente para inferencia y probablemente para reentrenamiento.
- Cabe en GPU consumer: si, cualquier GPU con al menos 4-6 GB de VRAM deberia poder ejecutar inferencia en fp32.
- Opciones de despliegue: ESPnet2 (recomendado, con `run.sh --download_model`), exportacion a ONNX no documentada, integracion con `espnet_model_zoo`. No hay soporte nativo para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones directas con otros modelos ASR para urdu en la informacion proporcionada. Como referencia cualitativa, podrian considerarse modelos ASR multilingues de gran escala (por ejemplo, Whisper de OpenAI o MMS de Meta), pero no se han proporcionado sus metricas en urdu en esta ficha, por lo que no se incluye tabla comparativa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| antoineheureux/Urdu_ASR | no disponible | no disponible | CC BY 4.0 | Hugging Face (ESPnet) |
| Alternativas ASR para urdu | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- WER del 16,4 % y SER del 65,6 % en test: dos de cada tres frases contienen al menos un error, lo que limita su uso sin revision humana.
- Sesgos conocidos: no documentados en la model card; al entrenarse sobre `urdu_dataset`, heredara los sesgos de dominio, genero y registro de dicho corpus.
- Riesgo de alucinacion: en ASR se manifiesta como sustituciones e inserciones; la tasa de insercion del 2,7 % en WER indica que el modelo ocasionalmente anade palabras no pronunciadas.
- Limitacion idiomatica: solo urdu; no soporta code-switching documentado ni otros idiomas.
- Restricciones de licencia: CC BY 4.0 permite uso comercial con atribucion, pero conviene verificar la licencia del dataset `urdu_dataset` subyacente, no detallada en la informacion disponible.
- Caveat de produccion: el modelo depende de una version concreta de ESPnet2 (`espnet2 202604`) y de un commit especifico (`152fc02171a020d621179a692784311d9b894015`); la reproducibilidad exige fijar esas versiones.
- El repositorio tiene muy pocas descargas (9) y ningun like, lo que indica ausencia de validacion comunitaria amplia.
- No se documenta el numero de horas de audio de entrenamiento ni la composicion del corpus, lo que dificulta evaluar su robustez fuera del dominio de test.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/antoineheureux/Urdu_ASR
- Repositorio ESPnet: https://github.com/espnet/espnet/
- Instrucciones de instalacion de ESPnet: https://espnet.github.io/espnet/installation.html
- Paper de referencia citado en los tags (arXiv:1804.00015): https://arxiv.org/abs/1804.00015
- Receta `egs2/urdu_dataset/asr1` (referenciada en la model card, dentro del repo ESPnet): https://github.com/espnet/espnet/tree/master/egs2/urdu_dataset/asr1
- Commit fijado en la model card: https://github.com/espnet/espnet/commit/152fc02171a020d621179a692784311d9b894015
