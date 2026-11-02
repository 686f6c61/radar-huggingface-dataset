# ngotruong09/whisper-small-vi-hlv

## Resumen

Whisper Small Vi HLV es un ajuste fino (fine-tuning) del modelo openai/whisper-small para reconocimiento automatico del habla (ASR) en vietnamita. Lo publica el usuario ngotruong09 en HuggingFace y se ha entrenado sobre el dataset Common Voice 17.0, configuracion `vi`. El modelo conserva la arquitectura encoder-decoder transformer original de Whisper con 241.734.912 parametros y esta pensado exclusivamente para transcripcion de audio en vietnamita.

El problema que aborda es la adaptacion de un modelo multilingue generico a un idioma concreto con datos de dominio publico. Sin embargo, el rendimiento declarado por el autor es muy deficiente: un WER de 91,6 % sobre el split de test de Common Voice 17.0, lo que indica que el ajuste fino no ha convergido correctamente o que la evaluacion se ha realizado de forma inadecuada. Este dato es relevante para cualquier evaluador: el modelo no es apto para produccion en su estado actual.

La relevancia de esta ficha es fundamentalmente critica: sirve como ejemplo de un fine-tuning fallido y como advertencia sobre la importancia de validar el WER antes de desplegar un modelo ASR. No se han publicado detalles sobre la composicion del dataset de entrenamiento, el preprocesado ni la estrategia de evaluacion mas alla de los hiperparametros basicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer) |
| Parametros totales | 241.734.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper-small procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (vi) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de openai/whisper-small, un transformer encoder-decoder con atencion completa disenado para ASR y traduccion de voz. Whisper-small tiene aproximadamente 244 M de parametros y procesa audio en ventanas de 30 segundos convertidas a espectrogramas mel. El ajuste fino mantiene toda la arquitectura y solo actualiza los pesos mediante entrenamiento supervisado sobre pares audio-transcripcion.

Segun la model card, el entrenamiento uso AdamW con betas (0,9; 0,999) y epsilon 1e-08, learning rate constante de 1e-05 con 50 pasos de warmup, batch size de 16, 500 pasos totales, semilla 42 y precision mixta nativa (AMP). No se especifica el numero de tokens de audio, la composicion exacta del dataset mas alla de Common Voice 17.0 en vietnamita, ni si hubo aumentacion de datos. No se menciona RLHF, DPO ni ninguna innovacion tecnica adicional. El unico resultado de validacion reportado es una loss de 0,5274 y un WER de 91,6 %, coherente con un entrenamiento insuficiente o con un fallo en la tokenizacion o en el alineamiento de etiquetas.

## Capacidades

- Transcripcion de audio a texto en vietnamita (unico idioma declarado).
- Reconocimiento automatico del habla sobre audio de hasta 30 segundos por ventana.
- No se ha documentado soporte de tool calling ni function calling.
- No se ha documentado soporte de agentes ni razonamiento multi-paso.
- No se ha documentado capacidad de traduccion voz-a-texto ni voz-a-voz.
- No se ha documentado deteccion de idioma ni capacidades multilingues adicionales.
- No se ha documentado vision, audio generativo ni modo thinking.

## Casos de uso

- Transcripcion de reuniones internas en vietnamita: el modelo podria procesar audio de hasta 30 segundos por fragmento, pero el WER del 91,6 % lo hace inutil para actas fiables; solo seria viable como experimento de investigacion.
- Subtitulado automatico de videos: requeriria un WER por debajo del 20-30 % para ser util; con los datos disponibles no es recomendable.
- Analisis de llamadas de atencion al cliente: la transcripcion resultante tendria un nivel de error que invalidaria cualquier analisis posterior de sentimiento o extraccion de entidades.
- Investigacion sobre adaptacion de Whisper a vietnamita: el modelo puede servir como punto de partida para estudiar por que un fine-tuning con estos hiperparametros no converge.
- Generacion de datasets pseudo-etiquetados: no recomendable por la alta tasa de error; introduciria ruido masivo en cualquier corpus derivado.
- Pruebas de pipelines de ASR en HuggingFace Transformers: util para validar la integracion tecnica de un modelo Whisper fine-tuneado, no para evaluar calidad.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Dataset | Split | Metrica | Valor |
|---|---|---|---|
| Common Voice 17.0 (vi) | test | WER | 91,6049 % |
| Common Voice 17.0 (vi) | validacion | WER Ortho | 92,0813 % |
| Common Voice 17.0 (vi) | validacion | Loss | 0,5274 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1 GB para pesos (241,7 M parametros x 4 bytes) mas overhead de activaciones y cache de atencion.
- VRAM estimada en FP16/BF16: aproximadamente 0,5 GB para pesos mas overhead.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 2-4 GB de VRAM, e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: HuggingFace Transformers (libreria declarada), potencialmente vLLM, TGI o llama.cpp si se convierte a GGUF, aunque no se ha documentado compatibilidad con estas herramientas.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idioma | WER reportado | Licencia |
|---|---|---|---|---|---|
| whisper-small-vi-hlv (este) | 241,7 M | 30 s | vi | 91,6 % (CV17 test) | apache-2.0 |
| openai/whisper-small | 241,7 M | 30 s | multilingue | no disponible en esta ficha | apache-2.0 |
| openai/whisper-base | 74 M | 30 s | multilingue | no disponible en esta ficha | apache-2.0 |
| openai/whisper-medium | 769 M | 30 s | multilingue | no disponible en esta ficha | apache-2.0 |

No se dispone de datos de benchmarks comparativos en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- El WER declarado del 91,6 % sobre Common Voice 17.0 test indica que el modelo no transcribe correctamente en la practica; no es apto para produccion.
- El autor no ha documentado la composicion del dataset de entrenamiento, el preprocesado ni la estrategia de evaluacion, lo que impide reproducir o diagnosticar el fallo.
- La model card esta generada automaticamente y contiene secciones vacias ("More information needed"), lo que sugiere falta de validacion por parte del autor.
- Solo soporta vietnamita; no se ha verificado su comportamiento en otros idiomas ni en audio con ruido, acentos regionales o habla espontanea.
- Riesgo alto de alucinacion en la transcripcion: con un WER tan elevado, el modelo puede generar texto plausible pero incorrecto.
- Licencia apache-2.0 permite uso comercial, pero el rendimiento hace inviable cualquier aplicacion comercial real.
- No se han documentado sesgos especificos, pero al entrenar sobre Common Voice 17.0 hereda los sesgos de dicho corpus (posible infrarepresentacion de determinados acentos, edades o generos).
- El modelo tiene 0 descargas y 0 likes en HuggingFace en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- La fecha de creacion indicada (2026-11-02) es futura respecto a la mayoria de referencias actuales; conviene verificar la integridad del repositorio antes de usarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ngotruong09/whisper-small-vi-hlv
- Modelo base: https://huggingface.co/openai/whisper-small
- Dataset de entrenamiento/evaluacion: https://huggingface.co/datasets/fixie-ai/common_voice_17_0
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper en OpenAI: https://github.com/openai/whisper
