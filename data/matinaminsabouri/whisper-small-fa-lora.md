# MatinAminsabouri/whisper-small-fa-lora

## Resumen

El modelo `MatinAminsabouri/whisper-small-fa-lora` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `openai/whisper-small` de OpenAI, publicado en Hugging Face por el usuario MatinAminsabouri. Se trata de un ajuste fino mediante PEFT (Parameter-Efficient Fine-Tuning) pensado, a juzgar por el sufijo "fa" del identificador, para tareas de reconocimiento automatico del habla (ASR) en persa (farsi), aunque la model card no lo confirma explicitamente. El repositorio tiene un tamano de 0.0 GB y no registra descargas ni likes en el momento de la consulta.

Whisper-small es un modelo de la familia Whisper, una arquitectura transformer encoder-decoder entrenada para transcripcion y traduccion de voz, con aproximadamente 244 millones de parametros en su version small. Este adaptador no modifica los pesos base: se aplica como un conjunto de matrices de bajo rango que se cargan junto al modelo original mediante la libreria PEFT, lo que reduce drasticamente el coste de almacenamiento y de entrenamiento respecto a un ajuste completo.

La relevancia de esta publicacion es limitada por la escasez de documentacion: la model card es una plantilla sin rellenar y no se aportan datos sobre el dataset de entrenamiento, hiperparametros, evaluacion ni licencia. Resulta util unicamente como punto de partida para quien quiera reproducir o inspeccionar un ajuste LoRA de Whisper en persa, pero no es apto para produccion sin una validacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer encoder-decoder Whisper (openai/whisper-small) |
| Parametros totales | no disponible (el adaptador LoRA solo contiene un subconjunto de bajo rango; el modelo base tiene ~244 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1500 posiciones en el encoder de audio de Whisper-small (ventana de 30 s); el decoder admite 448 tokens |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; el modelo base admite cuantizacion a 8 y 4 bits) |
| Idiomas soportados | no disponible (el sufijo "fa" sugiere persa, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `openai/whisper-small`, un transformer encoder-decoder con 12 capas en cada bloque, atencion multi-cabeza y embeddings de audio de 80 dimensiones mel. La tecnica LoRA congela los pesos originales e inserta matrices de descomposicion de bajo rango en las capas de atencion (tipicamente `q_proj` y `v_proj`), de modo que solo se entrenan esos parametros adicionales. El repositorio declara la version de PEFT 0.21.2 como framework de entrenamiento.

No se dispone de informacion sobre el dataset utilizado, el numero de tokens o horas de audio, la composicion linguistica, ni sobre si se aplicaron tecnicas de aumento de datos o de RLHF/DPO. Tampoco se documentan hiperparametros como el rango `r`, el `lora_alpha`, la tasa de aprendizaje o el numero de epocas. La model card es la plantilla generica de Hugging Face y todos los campos relevantes aparecen como "[More Information Needed]".

## Capacidades

- Reconocimiento automatico del habla (ASR) heredado del modelo base Whisper-small, presumiblemente adaptado al persa.
- Transcripcion de audio de hasta 30 segundos por ventana, con posibilidad de procesamiento por fragmentos.
- Traduccion de voz a texto en ingles desde otros idiomas, capacidad nativa de Whisper (no se confirma que se conserve tras el ajuste).
- Deteccion de actividad de voz y marcas temporales a nivel de segmento, heredadas del modelo base.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta modo "thinking", vision ni audio generativo.
- Capacidades multilingues: no disponibles; el ajuste podria haber degradado el rendimiento en idiomas distintos del persa.

## Casos de uso

- Transcripcion de reuniones en persa: el adaptador puede integrarse en un pipeline ASR para convertir audio de reunion en texto, aunque requiere validacion previa con muestras reales dada la ausencia de evaluacion publicada.
- Subtitulado automatico de contenido audiovisual en persa: combinado con un alineador temporal, permitiria generar subtitulos, si bien la falta de datos sobre WER hace necesaria una revision humana.
- Investigacion sobre PEFT en ASR: sirve como ejemplo reproducible de ajuste LoRA sobre Whisper-small para estudiar el impacto del rango y los datos en idiomas de bajos recursos.
- Prototipado rapido de asistentes de voz en persa: al ocupar pocos megabytes, el adaptador se puede cargar junto al modelo base en entornos con recursos limitados para pruebas de concepto.
- Generacion de datos etiquetados: transcripciones preliminares para construir corpus de habla persa que luego se revisan manualmente.
- Despliegue en el borde (edge): al combinarse con Whisper-small cuantizado, podria ejecutarse en dispositivos con poca VRAM, aunque sin garantias de calidad sin evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Whisper-small ocupa aproximadamente 1 GB en fp16; el adaptador LoRA anade unos pocos megabytes. En cuantizacion de 8 bits, la VRAM puede reducirse a ~500 MB; en 4 bits, a ~300 MB.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4060) es suficiente para inferencia en fp16; para lotes grandes o baja latencia, se recomienda RTX 4090, A100 o H100.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna con 2 GB o mas.
- Opciones de despliegue: transformers con PEFT, vLLM (soporte de adaptadores LoRA), llama.cpp (si se convierte el modelo base a GGUF y se aplica el adaptador), Ollama (mediante GGUF), TGI (con soporte de adaptadores).
- Latencia y throughput estimados: no disponibles; dependeran del hardware y del tamano de los fragmentos de audio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MatinAminsabouri/whisper-small-fa-lora | Adaptador LoRA sobre ~244 M | 30 s de audio | no disponible | Hugging Face |
| openai/whisper-small | ~244 M | 30 s de audio | MIT | Hugging Face, ampliamente usado |
| openai/whisper-medium | ~769 M | 30 s de audio | MIT | Hugging Face |
| openai/whisper-large-v3 | ~1550 M | 30 s de audio | MIT | Hugging Face |

No se dispone de datos de rendimiento comparativo para el adaptador, por lo que la comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al ser un ajuste sobre Whisper, hereda los sesgos del modelo base en cuanto a acentos, genero y variedades dialectales.
- Riesgo de alucinacion: Whisper es propenso a generar texto inventado en segmentos con silencio o ruido; el ajuste no corrige este comportamiento y podria acentuarlo si el dataset era limitado.
- Limitacion de contexto: la ventana de audio es de 30 segundos por fragmento; audios mas largos requieren segmentacion manual.
- Limitacion de idioma: no se confirma que el modelo mantenga capacidades multilingues; el ajuste podria haber sobreajustado al persa y degradado otros idiomas.
- Restricciones de licencia: la licencia no esta declarada, lo que impide determinar si el uso comercial esta permitido. Se debe contactar con el autor antes de cualquier despliegue productivo.
- Ausencia total de evaluacion: no hay WER, CER ni comparaciones con el modelo base, por lo que no se puede verificar que el ajuste mejore al original.
- Repositorio sin descargas ni likes: indica que el modelo no ha sido validado por la comunidad.
- Fecha de creacion futura (2026-11-18): el metadato es anomalo y sugiere que el repositorio podria ser una prueba o estar mal configurado.

## Enlaces

- Hugging Face: https://huggingface.co/MatinAminsabouri/whisper-small-fa-lora
- Modelo base: https://huggingface.co/openai/whisper-small
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Paper de LoRA: https://arxiv.org/abs/2106.09685
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Calculadora de impacto ambiental citada en la model card: https://mlco2.github.io/impact
