# 92kdd0/audio-lp-whisper-fine-tunning

## Resumen

`audio-lp-whisper-fine-tunning` es un adaptador LoRA (PEFT) sobre el modelo de reconocimiento automatico del habla `openai/whisper-tiny`, publicado por el usuario 92kdd0 en HuggingFace. No se trata de un modelo completo, sino de un conjunto de pesos de adaptacion de bajo rango que se cargan sobre el checkpoint base de Whisper para ajustar su comportamiento a un corpus de audio no especificado en la model card.

Whisper-tiny es la variante mas pequena de la familia Whisper de OpenAI, un modelo encoder-decoder transformer con aproximadamente 39 millones de parametros, disenado para transcripcion multilingue y traduccion de voz. Este adaptador anade un entrenamiento adicional muy breve (20 pasos, 4 muestras por lote) que el autor no documenta en detalle.

La relevancia de esta ficha es limitada: el modelo tiene 30 descargas, cero likes, una model card autogenerada con campos vacios ("More information needed") y unos resultados de evaluacion que muestran un WER del 42,78 % (35,56 % normalizado), muy por encima de lo que se considera utilidad practica. Se documenta aqui como ejemplo de adaptador experimental y para dejar constancia de sus limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre encoder-decoder transformer (Whisper-tiny) |
| Parametros totales | No disponible (adaptador; el modelo base Whisper-tiny tiene ~39 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (Whisper-tiny usa ventanas de audio de 30 s) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (Whisper-tiny base es multilingue, pero el adaptador no lo declara) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango bajo sobre `openai/whisper-tiny`. Whisper-tiny es un transformer encoder-decoder con atencion estandar, entrenado originalmente por OpenAI para ASR multitarea (transcripcion, traduccion, deteccion de idioma). El adaptador modifica un subconjunto de pesos del modelo base mediante matrices de bajo rango, lo que reduce el numero de parametros entrenables y el coste de ajuste.

El entrenamiento documentado es extremadamente corto: 20 pasos totales, batch de 4, learning rate 1e-4, optimizador AdamW (variante fused), scheduler lineal con 2 pasos de warmup, precision mixta nativa AMP y semilla 42. El dataset de entrenamiento no se especifica ("unknown dataset"). Las versiones de framework son PEFT 0.21.2, Transformers 5.22.1, PyTorch 2.11.0+cu130, Datasets 3.6.0 y Tokenizers 0.23.3. No se menciona RLHF, DPO ni ninguna innovacion tecnica adicional.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto), heredado de Whisper-tiny.
- Traduccion de voz a texto y deteccion de idioma, en la medida en que el modelo base las soporte y el ajuste no las haya degradado.
- No se documenta soporte de tool calling ni function calling.
- No se documenta capacidad de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no declaradas para el adaptador; dependen del modelo base.
- No hay modo "thinking", vision ni audio mas alla del propio ASR.

## Casos de uso

- Experimentacion academica con PEFT: el adaptador sirve como ejemplo minimo de como aplicar LoRA a un modelo de ASR con la libreria PEFT y Transformers, util para aprender el flujo de trabajo.
- Pruebas de pipeline de entrenamiento: permite validar scripts de fine-tuning de Whisper con `Trainer`, AMP y PEFT antes de escalar a modelos mayores.
- Reproduccion de resultados: dado que la model card incluye hiperparametros y metricas, se puede usar para reproducir el experimento y estudiar por que un ajuste tan corto degrada el WER.
- Benchmark de adaptadores de bajo rango: sirve como linea base negativa en comparaciones de adaptadores LoRA para ASR.
- Docencia sobre evaluacion de ASR: las metricas WER, CER, MER y WIL permiten ilustrar como se mide un sistema de reconocimiento de voz.
- No se recomienda su uso en produccion: el WER del 42,78 % y la falta de documentacion del dataset lo desaconsejan para cualquier aplicacion real de transcripcion.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (conjunto de evaluacion no identificado):

| Metrica | Valor |
|---|---|
| Loss (validacion) | 2,4248 |
| WER | 42,778 |
| WER normalizado | 35,556 |
| CER normalizado | 14,327 |
| MER normalizado | 32,821 |
| WIL normalizado | 50,084 |
| KER | nan |

No se han publicado resultados comparativos con otros modelos en la informacion disponible. El model-index oficial no contiene entradas de resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para el adaptador; el modelo base Whisper-tiny completo ocupa unos 150 MB en fp32 y menos en fp16, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tambien es viable en CPU para inferencia puntual.
- Cabe en GPU consumer: si, en practicamente todas (GTX 1050, RTX 3050, RTX 4090, etc.).
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; llama.cpp y Ollama no soportan Whisper directamente en el momento de redactar esta ficha; para ASR se usan transformers, faster-whisper (si se fusiona el adaptador) o WhisperX.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; para Whisper-tiny en GPU moderna se espera decodificacion en tiempo real o mas rapida, pero no hay mediciones del adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| audio-lp-whisper-fine-tunning | Adaptador sobre ~39 M | No disponible | 42,78 % (eval. no identificada) | Apache-2.0 | HuggingFace (30 descargas) |
| openai/whisper-tiny | ~39 M | Ventanas de 30 s | No disponible en esta ficha | Apache-2.0 | HuggingFace (oficial) |
| openai/whisper-base | ~74 M | Ventanas de 30 s | No disponible en esta ficha | Apache-2.0 | HuggingFace (oficial) |
| openai/whisper-small | ~244 M | Ventanas de 30 s | No disponible en esta ficha | Apache-2.0 | HuggingFace (oficial) |

La comparativa se limita a la familia Whisper porque no se dispone de datos de benchmarks de este adaptador frente a alternativas de otros autores.

## Limitaciones y advertencias

- WER elevado (42,78 %; 35,56 % normalizado), lo que indica una calidad de transcripcion muy baja para uso practico.
- Dataset de entrenamiento no documentado: se desconoce el dominio, el idioma y la calidad de los datos, por lo que no se puede evaluar el sesgo ni la generalizacion.
- Entrenamiento de solo 20 pasos: insuficiente para un ajuste significativo; el adaptador probablemente no mejora al modelo base.
- La model card esta autogenerada y contiene campos vacios ("More information needed"); no hay informacion sobre usos previstos ni limitaciones declaradas por el autor.
- Riesgo de alucinacion: como todo modelo de ASR, puede generar texto plausible que no corresponde al audio, especialmente con ruido o acentos no vistos.
- Idiomas soportados no declarados: el adaptador podria haber sobreajustado a un unico idioma.
- Licencia Apache-2.0 permite uso comercial, pero la ausencia de documentacion y la baja calidad desaconsejan cualquier despliegue en produccion.
- El campo KER aparece como `nan`, lo que sugiere problemas en la evaluacion o en el calculo de metricas.

## Enlaces

- HuggingFace: https://huggingface.co/92kdd0/audio-lp-whisper-fine-tunning
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Repositorio PEFT: https://github.com/huggingface/peft
- Documentacion de Whisper en Transformers: https://huggingface.co/docs/transformers/model_doc/whisper
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
