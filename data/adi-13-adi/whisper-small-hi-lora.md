# Adi-13-adi/whisper-small-hi-lora

## Resumen

`Adi-13-adi/whisper-small-hi-lora` es un repositorio de Hugging Face que, por su identificador, corresponde a un adaptador LoRA (Low-Rank Adaptation) aplicado sobre el modelo Whisper Small de OpenAI para el idioma hindi (`hi`). Whisper es un modelo de reconocimiento automatico del habla (ASR) entrenado con 680.000 horas de audio supervisado debilmente y publicado en 2022 en el paper "Robust Speech Recognition via Large-Scale Weak Supervision". La variante "small" de la familia Whisper cuenta con 244 millones de parametros y una arquitectura encoder-decoder de tipo transformer.

El repositorio presenta un estado practicamente vacio: 0 GB de tamano, 0 descargas, 0 likes y una model card autogenerada por la plataforma con todos los campos marcados como "[More Information Needed]". No se especifican ni la licencia, ni los idiomas, ni el pipeline, ni los datos de entrenamiento del adaptador. El unico metadato tecnico fiable es la etiqueta `arxiv:1910.09700`, que corresponde al paper de Lacoste et al. sobre el calculo del impacto ambiental del aprendizaje automatico, citado en la plantilla por defecto de las model cards de Hugging Face y no como referencia del propio modelo.

Por tanto, esta ficha debe interpretarse como una descripcion del modelo base (Whisper Small) con las salvedades propias de un adaptador LoRA del que no se ha publicado informacion tecnica verificable. Cualquier uso en produccion requeriria validar el adaptador contra un conjunto de evaluacion propio en hindi antes de desplegarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Small) con adaptador LoRA; detalles del adaptador no disponibles |
| Parametros totales | 244 M en el modelo base Whisper Small; rangos y dimensiones del LoRA no disponibles |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 30 segundos de audio por ventana en Whisper (equivalente a 1.500 posiciones de audio en el encoder); no disponible para el adaptador |
| Tipos de cuantizacion | no disponible en el repositorio; el modelo base admite fp16, int8 e int4 en llama.cpp/whisper.cpp y bitsandbytes, pero no se confirma compatibilidad con este adaptador |
| Idiomas soportados | hindi (`hi`) segun el identificador del repositorio; no confirmado en la model card |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA); el modelo base se distribuye en safetensors y bin |

## Arquitectura y entrenamiento

El modelo base Whisper Small es un transformer encoder-decoder con 244 millones de parametros, 12 capas de encoder y 12 de decoder, 12 cabezas de atencion y una dimension oculta de 768. Procesa audio en ventanas de 30 segundos convertidas a espectrogramas mel de 80 canales, y genera texto de forma autorregresiva con tokens especiales para idioma, tarea (transcripcion o traduccion) y marcas de tiempo. El adaptador LoRA, por su naturaleza, congela los pesos originales e inyecta matrices de bajo rango en las proyecciones de atencion, lo que reduce drasticamente el numero de parametros entrenables.

No hay informacion publicada sobre el dataset de entrenamiento del adaptador, el numero de pasos, la tasa de aprendizaje, el rango del LoRA ni la composicion del corpus en hindi. Tampoco se documenta si se aplico alguna tecnica de aumento de datos, normalizacion de texto o filtrado de calidad. La unica referencia bibliografica presente en el repositorio (`arxiv:1910.09700`) es la cita por defecto de la plantilla de model cards de Hugging Face sobre emisiones de carbono y no aporta informacion sobre el entrenamiento.

## Capacidades

- Reconocimiento automatico del habla en hindi, presumiblemente con el vocabulario y la tokenizacion multilingue de Whisper Small.
- Transcripcion de audio de hasta 30 segundos por ventana, con marcas de tiempo a nivel de segmento en el modelo base.
- Traduccion de audio en hindi a texto en ingles (capacidad nativa de Whisper, no confirmada para el adaptador).
- Deteccion de idioma y de actividad de voz en el pipeline original de Whisper.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico.
- No se documenta modo de razonamiento extendido (thinking mode), vision ni audio generativo.
- Capacidades multilingues adicionales no confirmadas: el adaptador esta etiquetado como hindi, pero Whisper Small conserva el vocabulario multilingue del modelo base.

## Casos de uso

- Transcripcion de reuniones y entrevistas en hindi: el adaptador puede aplicarse sobre Whisper Small para convertir grabaciones de hasta 30 segundos por fragmento en texto, con la ventaja de que el modelo base ya maneja marcas de tiempo y segmentacion.
- Subtitulado automatico de contenido audiovisual en hindi: el pipeline de Whisper permite generar ficheros SRT/VTT con timestamps; el LoRA buscaria mejorar la precision en dominios especificos del corpus de entrenamiento, que no se ha documentado.
- Atencion al cliente en centros de contacto en hindi: transcripcion de llamadas para analitica posterior, siempre que se valide la tasa de error del adaptador en audio telefonico de 8 kHz, no cubierto por la model card.
- Investigacion en ASR de bajos recursos: el adaptador sirve como punto de partida para experimentos de fine-tuning con LoRA en hindi, comparando el coste de entrenamiento frente a un ajuste completo.
- Generacion de actas y resumenes a partir de audio: combinado con un LLM de texto, la transcripcion en hindi puede alimentar pipelines de resumen; la calidad final depende de la tasa de error del adaptador, no medida publicamente.
- Evaluacion comparativa de adaptadores LoRA para Whisper: util para estudiar como afecta el rango y los datos de entrenamiento a la calidad de transcripcion en un idioma concreto.
- Prototipado rapido en entornos con GPU de consumo: al ser un adaptador sobre un modelo de 244 M de parametros, el coste de inferencia es bajo y permite iterar en una unica GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base Whisper Small: aproximadamente 1 GB en fp16 y menos de 1 GB en int8; el adaptador LoRA anade un consumo marginal (tipicamente decenas de MB) no cuantificado en el repositorio.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluidas RTX 3060, RTX 4060, RTX 4090, A100 y H100; el modelo base cabe holgadamente en todas ellas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en CPU para audio corto.
- Opciones de despliegue: transformers con `peft` para cargar el adaptador, whisper.cpp (previa fusion del LoRA con el modelo base), faster-whisper, Hugging Face Inference Endpoints (la etiqueta `endpoints_compatible` esta presente) y vLLM no aplica porque Whisper no es un modelo de texto puro.
- Latencia y throughput estimados: no disponibles para este adaptador; en el modelo base, una GPU moderna transcribe audio en tiempo real o mas rapido, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Adi-13-adi/whisper-small-hi-lora | 244 M (base) + LoRA | 30 s por ventana | hindi (segun ID) | no disponible | Hugging Face, 0 descargas |
| openai/whisper-small | 244 M | 30 s por ventana | multilingue (99 idiomas) | MIT (modelo original) | Hugging Face, ampliamente usado |
| openai/whisper-medium | 769 M | 30 s por ventana | multilingue | MIT | Hugging Face |
| ai4bharat/indicwhisper-small | 244 M (base) | 30 s por ventana | indico (incluye hindi) | no disponible en la informacion | Hugging Face |

La comparativa se limita a la arquitectura del modelo base, ya que no hay datos de rendimiento del adaptador. Frente a `openai/whisper-small`, el adaptador anade especializacion en hindi a cambio de perder la polivalencia multilingue del original. Frente a `whisper-medium`, el modelo base es mas pequeno y rapido pero con menor capacidad. Frente a alternativas especificas para lenguas indicas como IndicWhisper, no se puede establecer una comparacion cuantitativa sin benchmarks publicados.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla autogenerada, sin informacion sobre datos, hiperparametros ni evaluacion.
- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido; el modelo base Whisper es MIT, pero el adaptador no declara licencia.
- Riesgo de alucinacion: Whisper es conocido por generar texto plausible en silencios o audio ruidoso; sin evaluacion del adaptador no se puede descartar que el LoRA amplifique este comportamiento.
- Sesgos desconocidos: no hay analisis de sesgos por genero, edad, acento o dialecto del hindi, un idioma con gran variacion regional.
- Cobertura limitada a 30 segundos por ventana: audios largos requieren segmentacion y pueden perder contexto entre fragmentos.
- Idiomas: aunque el identificador sugiere hindi, no se confirma si el adaptador degrada el rendimiento en otros idiomas del modelo base.
- Repositorio practicamente vacio (0 GB): conviene verificar que los pesos del adaptador estan realmente subidos antes de intentar cargarlo.
- Sin datos de evaluacion: no se puede afirmar que el adaptador mejore al modelo base en hindi; podria incluso degradarlo.
- Para produccion se recomienda fusionar el LoRA con el modelo base, validar con un conjunto de test propio y monitorizar la tasa de error de palabra (WER) por dominio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Adi-13-adi/whisper-small-hi-lora
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper en OpenAI: https://github.com/openai/whisper
- Modelo base en Hugging Face: https://huggingface.co/openai/whisper-small
- Referencia citada en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental: https://mlco2.github.io/impact
- Libreria PEFT para cargar adaptadores LoRA: https://github.com/huggingface/peft
