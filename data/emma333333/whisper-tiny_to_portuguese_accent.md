# emma333333/whisper-tiny_to_portuguese_accent

## Resumen

Whisper tiny Portuguese es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, publicado por el usuario emma333333 en Hugging Face. Se trata de un modelo de reconocimiento automatico del habla (ASR) basado en la arquitectura encoder-decoder transformer de Whisper, con 37,7 millones de parametros totales, disenado para transcribir audio. El ajuste se ha realizado sobre el dataset denominado "portuguese_english", con el objetivo declarado de adaptar el modelo base a acentos portugueses.

El modelo parte de la version tiny de la familia Whisper, la mas pequena de las cinco variantes publicadas por OpenAI (tiny, base, small, medium y large). Con solo 37,7 millones de parametros y un repositorio de 0,3 GB, esta pensado para entornos con recursos muy limitados, como dispositivos de borde, prototipos rapidos o pipelines de bajo coste donde la latencia y el consumo de memoria son criticos.

La relevancia de esta ficha es limitada: se trata de un modelo experimental con cero descargas y cero likes en el momento de la consulta, una model card generada automaticamente por el Trainer de Hugging Face con secciones sin completar ("More information needed") y sin publicacion de resultados verificados. El unico dato de rendimiento disponible es un WER de 11,9478 declarado por el autor sobre el split de test del dataset portuguese_english, marcado como no verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny procesa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (segun metadatos); el nombre del modelo sugiere portugues, pero la model card solo declara ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de openai/whisper-tiny: un transformer encoder-decoder entrenado originalmente por OpenAI para tareas de reconocimiento del habla, traduccion de voz y deteccion de idioma. Whisper procesa el audio como espectrogramas Mel logaritmicos y genera tokens de texto de forma autorregresiva. La variante tiny es la de menor capacidad de la familia, con 37,7 millones de parametros, lo que la hace adecuada para inferencia en CPU o GPUs de gama baja.

El ajuste fino se realizo con los siguientes hiperparametros declarados en la model card: learning rate de 1e-05, batch de entrenamiento de 2, batch de evaluacion de 1, semilla 42, optimizador AdamW (variante fused) con betas (0,9, 0,999) y epsilon 1e-08, scheduler lineal con 500 pasos de warmup y 2000 pasos de entrenamiento totales. Se registran dos puntos de evaluacion: en el paso 1000 (epoca 0,9217) con perdida de validacion 0,2723 y WER 12,5256, y en el paso 2000 (epoca 1,8433) con perdida de validacion 0,2545 y WER 11,9478. No se especifica el numero de tokens de audio utilizados, la composicion exacta del dataset portuguese_english ni si se aplicaron tecnicas de RLHF o DPO. Las versiones de framework empleadas fueron Transformers 5.23.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3.

## Capacidades

- Reconocimiento automatico del habla (ASR): transcripcion de audio a texto, capacidad principal del modelo.
- Traduccion de voz a texto: Whisper soporta de forma nativa la tarea de traduccion al ingles, aunque no se ha verificado su rendimiento tras el ajuste fino.
- Deteccion de idioma: capacidad heredada del modelo base, no confirmada en esta version ajustada.
- Procesamiento de audio en ventanas de 30 segundos: limitacion arquitectonica de Whisper tiny.
- Capacidades multilingues: los metadatos declaran unicamente ingles; el ajuste se orienta a acentos portugueses pero no se documenta el soporte real de portugues.
- No dispone de tool calling ni function calling: es un modelo puramente ASR.
- No dispone de modo de razonamiento (thinking mode), vision ni audio generativo.
- No se documenta soporte de agentes ni razonamiento multi-paso.

## Casos de uso

- Transcripcion de audio en dispositivos de borde: con 37,7 millones de parametros y pesos safetensors de 0,3 GB, el modelo puede ejecutarse en CPU o en GPUs integradas para transcribir notas de voz o reuniones cortas sin conexion.
- Prototipado rapido de pipelines ASR: util para validar una arquitectura de reconocimiento de voz antes de invertir en modelos de mayor tamano como Whisper large o modelos especializados.
- Subtitulado automatico de contenido en ingles: el modelo declara soporte de ingles y puede generar transcripciones base para subtitulos, aunque la calidad sera inferior a la de variantes mayores.
- Investigacion sobre adaptacion de acentos: el ajuste sobre el dataset portuguese_english sirve como caso de estudio para experimentar con fine-tuning de Whisper en acentos especificos con recursos minimos.
- Filtrado y busqueda de audio: transcripcion de archivos de audio para indexacion y busqueda por texto en aplicaciones de gestion documental o archivos multimedia.
- Educacion y accesibilidad: generacion de transcripciones para estudiantes o personas con dificultades auditivas en entornos con hardware limitado, siempre que el idioma y el acento coincidan con los datos de entrenamiento.
- Pruebas de integracion en pipelines de transformers: validacion de flujos de inferencia con la libreria transformers y el formato safetensors antes de migrar a modelos mayores.

## Benchmarks y rendimiento

Los unicos datos disponibles son los declarados por el autor en el model-index, marcados como no verificados:

| Modelo | Dataset | Metrica | Valor |
|---|---|---|---|
| Whisper tiny Portuguese | Portuguese Spanish (split test) | WER | 11,9478 |

En la tabla de resultados de entrenamiento de la model card se registran ademas:

| Paso | Epoca | Perdida de entrenamiento | Perdida de validacion | WER |
|---|---|---|---|---|
| 1000 | 0,9217 | 0,2476 | 0,2723 | 12,5256 |
| 2000 | 1,8433 | 0,1171 | 0,2545 | 11,9478 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible. El WER de 11,9478 no es directamente comparable con los resultados oficiales de Whisper tiny en benchmarks estandar como LibriSpeech, ya que el dataset de evaluacion es propio y no se documenta su composicion.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision FP32 (37,7 millones de parametros, aproximadamente 150 MB de pesos); en FP16 alrededor de 75 MB. La memoria adicional depende de la longitud del audio y del buffer de espectrogramas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el modelo esta disenado para ejecutarse en CPU sin problemas.
- Cabe en GPU de consumo: si, en cualquier GPU consumer moderna (RTX 3060, RTX 4060, GTX 1650 o superiores) e incluso en GPUs integradas.
- Opciones de despliegue: transformers (libreria nativa), vLLM no soporta ASR de Whisper de forma directa, llama.cpp no soporta Whisper, Ollama no soporta Whisper. Alternativas: el pipeline de transformers, faster-whisper (requiere conversion a formato CTranslate2) o Whisper.cpp (requiere conversion a GGML).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. En CPU, un modelo de este tamano puede transcribir audio en tiempo real o mas rapido, pero no se aportan mediciones concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | WER declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Whisper tiny Portuguese (este modelo) | 37,7 M | 30 s por ventana | 11,9478 (dataset propio, no verificado) | apache-2.0 | Hugging Face, 0 descargas |
| openai/whisper-tiny | 37,7 M | 30 s por ventana | no disponible en esta ficha | apache-2.0 | Hugging Face, ampliamente usado |
| openai/whisper-base | 74 M | 30 s por ventana | no disponible en esta ficha | apache-2.0 | Hugging Face, ampliamente usado |
| openai/whisper-small | 244 M | 30 s por ventana | no disponible en esta ficha | apache-2.0 | Hugging Face, ampliamente usado |

La comparacion con los modelos base de OpenAI es la mas directa, ya que este modelo es un fine-tuning de whisper-tiny. No se dispone de datos de rendimiento de las alternativas en el mismo dataset, por lo que no es posible establecer una comparacion cuantitativa fiable. La ventaja principal de este modelo frente a whisper-tiny original seria su adaptacion a acentos portugueses, pero dicha ventaja no esta verificada ni documentada con detalle.

## Limitaciones y advertencias

- Model card incompleta: las secciones de descripcion, usos previstos, limitaciones y datos de entrenamiento estan sin completar ("More information needed"), lo que impide evaluar su idoneidad para produccion.
- Resultados no verificados: el WER de 11,9478 esta marcado como no verificado y se ha calculado sobre un dataset propio ("portuguese_english") cuya composicion, tamano y procedencia no se documentan.
- Inconsistencia de idiomas: los metadatos declaran unicamente ingles, mientras que el nombre del modelo sugiere portugues. No esta claro que idioma domina realmente tras el ajuste fino.
- Riesgo de alucinacion: como todos los modelos Whisper, puede generar texto que no corresponde al audio, especialmente en segmentos con ruido, silencios o audio musical.
- Limitacion de contexto: Whisper tiny procesa ventanas de 30 segundos; audios mas largos requieren segmentacion y pueden perder coherencia entre fragmentos.
- Capacidad limitada: la variante tiny tiene la precision mas baja de la familia Whisper; es probable que su rendimiento sea notablemente inferior al de whisper-small o whisper-large en condiciones reales.
- Sin soporte de tool calling ni agentes: no es adecuado para tareas que requieran interaccion con herramientas o razonamiento multi-paso.
- Falta de traccion: cero descargas y cero likes en el momento de la consulta, sin evidencia de uso en produccion ni validacion por parte de la comunidad.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento ni sobre los datos de entrenamiento utilizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/emma333333/whisper-tiny_to_portuguese_accent
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de OpenAI Whisper: https://github.com/openai/whisper
