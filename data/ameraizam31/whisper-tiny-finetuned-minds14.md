# ameraizam31/whisper-tiny-finetuned-minds14

## Resumen

`whisper-tiny-finetuned-minds14` es un ajuste fino del modelo `openai/whisper-tiny` de OpenAI para reconocimiento automatico del habla (ASR) en ingles, especializado en el subconjunto en-US del dataset MINDS-14 de PolyAI, orientado a dominios de banca y servicios financieros. Lo publica el usuario `ameraizam31` en Hugging Face bajo licencia Apache 2.0, y se distribuye en formato safetensors con 37,76 millones de parametros y un tamano de repositorio de 0,2 GB.

El modelo resuelve un problema acotado: transcribir utterances de clientes en un contexto de atencion bancaria telefonica, donde el vocabulario y las expresiones difieren del habla generica sobre la que se entreno Whisper. Al partir de la variante tiny de Whisper, el coste computacional es minimo y puede ejecutarse en CPU o en GPUs de gama baja, lo que lo hace util para prototipos y pipelines de transcripcion de bajo presupuesto.

Es relevante ahora como ejemplo de fine-tuning ligero y reproducible: la model card documenta hiperparametros, curvas de entrenamiento y un WER de 0,3158 en el conjunto de evaluacion, aunque el autor no ha verificado ese resultado (`verified: false`) ni ha completado las secciones de descripcion, usos previstos o limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny usa ventanas de audio de 30 s, dato no declarado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `openai/whisper-tiny`: un transformer encoder-decoder con espectrogramas log-Mel como entrada, disenado originalmente por OpenAI para ASR multilingue y traduccion de voz. El ajuste fino se realizo con la libreria Transformers 4.46.3, PyTorch 2.5.1+cu124, Datasets 3.6.0 y Tokenizers 0.20.3, y el autor lo etiqueta como `generated_from_trainer`.

Los hiperparametros documentados son: learning rate de 1e-05, batch de entrenamiento y evaluacion de 16, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler `constant_with_warmup` con 50 pasos de calentamiento, 500 pasos totales y precision mixta nativa (AMP). No se especifica el numero de tokens de audio, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; la model card indica "More information needed" en esas secciones. La curva de entrenamiento muestra sobreajuste: la perdida de entrenamiento cae de 0,2839 a 0,0006 mientras la de validacion sube de 0,4866 a 0,6638 entre los pasos 100 y 500, y el mejor WER se obtiene en el paso 200 (0,3158).

## Capacidades

- Reconocimiento automatico del habla en ingles sobre audio de entrada, con salida de transcripcion textual.
- Especializacion en utterances del dominio bancario y de servicios financieros, derivada del dataset MINDS-14 (en-US).
- Ejecucion ligera: 37,76 millones de parametros permiten inferencia en CPU y en GPUs de gama baja.
- Integracion con el pipeline `automatic-speech-recognition` de Transformers.
- No se documentan capacidades de traduccion, diarizacion, tool calling, agentes, vision ni audio mas alla de la transcripcion.
- Capacidad multilingue limitada al ingles segun el campo `language` de la model card.

## Casos de uso

- Transcripcion de llamadas de atencion al cliente bancaria: el ajuste sobre MINDS-14 (en-US) lo hace adecuado para prototipos de analitica de conversaciones en centros de contacto, siempre que se acepte un WER en torno al 31 %.
- Clasificacion de intenciones en IVR: la transcripcion generada puede alimentar un clasificador posterior de motivos de llamada (consultas de saldo, tarjetas, transferencias) en un pipeline de bajo coste.
- Etiquetado asistido de corpus de audio financiero: util para pre-anotar grabaciones y reducir el esfuerzo manual de transcripcion antes de una revision humana.
- Pruebas de concepto en entornos con recursos limitados: al caber en 0,2 GB de pesos, se puede desplegar en contenedores pequenos o en CPU para validar un flujo ASR antes de invertir en modelos mayores.
- Generacion de subtitulos o transcripciones de demos internas en ingles: adecuado cuando la precision exacta no es critica y prima la latencia o el coste.
- Baseline de investigacion para comparar estrategias de fine-tuning de Whisper tiny sobre dominios especializados, dado que la model card documenta hiperparametros y curvas de entrenamiento.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index y en la model card (no verificados, `verified: false`):

| Metrica | Dataset | Valor |
|---|---|---|
| WER | MINDS-14 (en-US) | 0,3158 |
| WER ortho | MINDS-14 (en-US) | 0,3276 |
| Loss (evaluacion) | MINDS-14 (en-US) | 0,5650 |

Evolucion durante el entrenamiento (seleccion de pasos):

| Paso | Epoca | Training loss | Validation loss | WER ortho | WER |
|---|---|---|---|---|---|
| 100 | 3,5714 | 0,2839 | 0,4866 | 0,3350 | 0,3300 |
| 200 | 7,1429 | 0,0285 | 0,5650 | 0,3276 | 0,3158 |
| 300 | 10,7143 | 0,0021 | 0,6115 | 0,3208 | 0,3194 |
| 400 | 14,2857 | 0,0009 | 0,6441 | 0,3226 | 0,3229 |
| 500 | 17,8571 | 0,0006 | 0,6638 | 0,3257 | 0,3259 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (37,76 M de parametros, ~151 MB de pesos) y por debajo de 0,5 GB en fp16; el repositorio completo ocupa 0,2 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre; no requiere A100 ni H100. Funciona en RTX 4090, RTX 3060, T4 y GPUs integradas.
- Cabe en GPU consumer y en CPU: es viable la inferencia en CPU para audio corto, aunque la latencia dependera del hardware.
- Opciones de despliegue: pipeline `automatic-speech-recognition` de Transformers, y en principio exportacion a otros runtimes compatibles con Whisper tiny (no documentada por el autor).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | WER | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-tiny-finetuned-minds14 | 37,76 M | no disponible (ventana Whisper tiny) | 0,3158 en MINDS-14 en-US | apache-2.0 | Hugging Face |
| openai/whisper-tiny | 37,76 M | ventana de 30 s (arquitectura base) | no disponible en esta ficha | apache-2.0 | Hugging Face |
| openai/whisper-base | no disponible en esta ficha | ventana de 30 s (arquitectura base) | no disponible en esta ficha | apache-2.0 | Hugging Face |

La comparacion cuantitativa con alternativas no esta disponible en la informacion proporcionada; solo se conoce el resultado del ajuste frente a su modelo base por herencia arquitectonica.

## Limitaciones y advertencias

- El WER de 0,3158 implica que aproximadamente una de cada tres palabras se transcribe de forma incorrecta; no es adecuado para produccion sin revision humana.
- Sobreajuste evidente: la perdida de validacion aumenta a partir del paso 100-200 y el mejor resultado se obtiene pronto, lo que sugiere que el checkpoint final no es el optimo.
- El autor no ha completado las secciones de descripcion, usos previstos, limitaciones ni datos de entrenamiento de la model card.
- El resultado del benchmark no esta verificado (`verified: false`); conviene reproducirlo antes de usarlo como referencia.
- Solo soporta ingles; no se declaran capacidades multilingues.
- Entrenado sobre un unico dataset de dominio bancario (MINDS-14 en-US), por lo que el rendimiento fuera de ese dominio puede degradarse.
- Riesgo de alucinacion en la transcripcion, especialmente con audio ruidoso, acentos no representados en el dataset o vocabulario tecnico ajeno al corpus.
- Sesgos no documentados: no se han publicado analisis de sesgo por acento, genero o edad.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; al derivar de Whisper tiny, se heredan las consideraciones de la licencia original de OpenAI.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ameraizam31/whisper-tiny-finetuned-minds14
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset MINDS-14: https://huggingface.co/datasets/PolyAI/minds14
