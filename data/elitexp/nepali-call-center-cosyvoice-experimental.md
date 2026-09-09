# elitexp/nepali-call-center-cosyvoice-experimental

## Resumen

El modelo `elitexp/nepali-call-center-cosyvoice-experimental` es un sistema de síntesis de voz (TTS) experimental de código abierto, desarrollado por el usuario `elitexp`, que adapta el modelo `FunAudioLLM/Fun-CosyVoice3-0.5B-2512` al idioma nepalí. El modelo base cubre nueve idiomas, pero no incluye el nepalí, por lo que este fine-tune entrena únicamente el componente LLM para que sea capaz de producir habla nepalí.

El modelo utiliza la arquitectura CosyVoice3, que combina un modelo de lenguaje (LLM) con un módulo de *flow matching* y un vocoder HiFT. Tanto el flujo como el vocoder se mantienen congelados, de modo que el timbre de la voz generada proviene del clip de audio de referencia que se proporciona en la inferencia, no de los pesos del modelo. El resultado es un modelo de lenguaje y prosodia específico para nepalí, con especial énfasis en un registro de agente de centro de llamadas.

Este modelo es relevante porque aborda la carencia de soporte TTS de calidad para el nepalí en uno de los sistemas de voz open source más recientes. Aunque se publica como experimental, ofrece una base útil para investigar la adaptación de CosyVoice a idiomas no cubiertos y para desarrollar prototipos de atención al cliente o asistentes de voz en nepalí.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CosyVoice3 (LLM + flow matching + vocoder HiFT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | nepalí (ne) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX, archivos .pt (llm.pt, flow.pt, hift.pt) |

Nota: el modelo base tiene 0.5 mil millones de parámetros según su nombre, pero el número exacto de parámetros del checkpoint fine-tune no se especifica en la información disponible.

## Arquitectura y entrenamiento

CosyVoice3 es una arquitectura de síntesis de voz en tres etapas. El primer componente es un modelo de lenguaje (LLM) que genera representaciones de audio a partir de texto e instrucciones. El segundo es un módulo de *flow matching* que refina esas representaciones, y el tercero es un vocoder HiFT que produce la forma de onda final a 24 kHz. En este modelo, solo se ha entrenado el LLM (`llm.pt`); los módulos de flujo y vocoder son idénticos a los del modelo base y permanecen congelados.

El entrenamiento se realizó sobre un conjunto de datos compuesto por corpora de reconocimiento de voz (ASR) en nepalí y habla con estilo de centro de llamadas, tanto grabada como generada sintéticamente. La model card indica que se utilizaron aproximadamente 4.700 muestras con la etiqueta de estilo "call-centre". El checkpoint publicado es `stageV:epoch_4_whole`, es decir, la época 4 de un total de 5. Es importante señalar que esta época no fue la de menor pérdida de validación (la época 2 lo fue), sino que se seleccionó por ser la más adaptada al objetivo.

No se menciona el uso de RLHF, DPO u otras técnicas de alineación posteriores. La innovación técnica clave de este trabajo es la adaptación del LLM de CosyVoice a un idioma no soportado, manteniendo intactos los componentes acústicos, lo que permite que la clonación de voz se haga por referencia de audio.

## Capacidades

- Generación de texto a voz en nepalí con pronunciación correcta: la evaluación mediante reconocimiento automático de voz (ASR) tras pasar por un códec telefónico G.711 a 8 kHz arrojó una tasa de error de caracteres (CER) de 0.294, frente a un límite de 0.307 para voz humana en el mismo pipeline.
- Clonación de voz zero-shot: el timbre de la voz generada se controla mediante un clip de audio de referencia de entre 5 y 10 segundos. La model card incluye un ejemplo que funciona con un clip de 8.5 segundos.
- Control de estilo mediante etiquetas de instrucción (*style tags*): por defecto se aplica el tag de agente de centro de llamadas ("friendly Nepali call-centre agent"), que produce un habla más cálida y rápida. Existe un tag neutral que simplemente dice "You are a helpful assistant."
- Normalización de texto: el script incluido mapea el signo danda (`।`) a un punto, elimina los caracteres ZWJ y ZWNJ, y deletrea dígitos largos para prevenir lecturas incorrectas.
- Síntesis por frases: el modelo está diseñado para procesar oraciones cortas (promedio de unos 3.5 segundos en los datos de entrenamiento), y el generador divide el texto en frases individuales.
- No tiene capacidades de razonamiento, generación de código, matemáticas, visión ni audio más allá de la síntesis de voz.

## Casos de uso

- Atención al cliente automatizada en nepalí: el modelo puede generar respuestas habladas con un tono de agente de centro de llamadas, y su timbre puede personalizarse fácilmente sustituyendo el clip de referencia. Es adecuado para prototipos de sistemas de respuesta de voz interactiva (IVR) en ese idioma.
- Narración de audiolibros o contenidos en nepalí: si se dispone de una grabación limpia de una voz de referencia de entre 5 y 10 segundos, el modelo puede leer texto largo en nepalí con esa voz, siempre que se divida en frases cortas.
- Anuncios y mensajes de servicios públicos: debido a su enfoque en el registro de centro de llamadas, es útil para generar locuciones de bienvenida, avisos o mensajes informativos dirigidos a la población nepalí.
- Asistentes de voz para banca o seguros: en entornos donde se necesite hablar con clientes en nepalí, el modelo puede integrarse en pipelines de TTS para leer saldos, estados de cuenta o instrucciones, siempre que se normalicen los números.
- Investigación y desarrollo de TTS para idiomas de pocos recursos: la metodología de fine-tune solo del LLM y la publicación de resultados de evaluación (CER, prosodia) sirven como referencia para trabajos similares con otros idiomas.
- Accesibilidad para personas con discapacidad visual: el modelo puede convertir texto en nepalí a audio, permitiendo que lectores de pantalla u otras aplicaciones ofrezcan contenido accesible en ese idioma.
- Formación de agentes de call-centre: se pueden generar frases de ejemplo en estilo cálido y natural para entrenar a nuevos agentes o para simular conversaciones en nepalí sin necesidad de grabaciones reales.

## Benchmarks y rendimiento

La siguiente tabla recoge los resultados de evaluación publicados en la model card. No se han encontrado otros benchmarks externos.

| Métrica | Este modelo | Referencia |
|---|---|---|
| CER a través de G.711 8 kHz | 0.294 | 0.307 (voz humana, mismo ASR) |
| Tasa de habla (tag activado vs desactivado) | +16% | — |
| Extensión de F0 (F0 spread) | 2.73 semitonos | 2.92 semitonos (objetivo) |
| Densidad de pausas | no transfirió | 0.343 pausas/s (objetivo) |

El autor señala que el modelo alcanza el límite de medición (floor) en cuanto a pronunciación, y que la prosodia mejoró en tasa de habla y variación tonal, pero no logró transferir la estructura de pausas del registro objetivo.

## Requisitos de hardware

No se han publicado requisitos de hardware específicos en la información disponible. A partir del tamaño del repositorio (7.7 GB) y de que el modelo base es de 0.5 mil millones de parámetros, puede inferirse que será necesario un entorno con GPU, pero no se dispone de datos de VRAM recomendada, latencia ni throughput.

- VRAM estimada: no disponible.
- GPU recomendadas: no disponibles.
- ¿Cabe en GPU de consumo? No hay datos concluyentes, aunque el pequeño tamaño del LLM sugiere que podría ejecutarse en tarjetas de gama media, pero no está confirmado.
- Opciones de despliegue: el modelo se ejecuta con el repositorio oficial de CosyVoice (`FunAudioLLM/CosyVoice`) y con el script `generate.py` incluido en este repo. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Idiomas | Licencia | Formato de pesos | Notas |
|---|---|---|---|---|
| elitexp/nepali-call-center-cosyvoice-experimental | nepalí | Apache 2.0 | safetensors, ONNX, .pt | Fine-tune experimental; solo se entrena el LLM |
| FunAudioLLM/Fun-CosyVoice3-0.5B-2512 | 9 idiomas (no nepalí) | Apache 2.0 | no especificado | Modelo base; no soporta nepalí |

No se dispone de información sobre otros modelos TTS comparables que cubran nepalí en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el autor lo publica como una adaptación funcional, pero no está validado para uso en producción.
- Registro de centro de llamadas parcial: aunque la pronunciación es sólida, la estructura de pausas no se transfirió. El discurso resultante es rápido, expresivo y con poca puntuación.
- Necesidad de normalizar el texto: hay que mapear el danda a punto, eliminar ZWJ/ZWNJ y deletrear los dígitos; si no, las salidas pueden ser incorrectas sin aviso.
- Las frases largas generan un discurso acelerado y entrecortado. Se recomienda dividir el texto en oraciones cortas.
- El timbre depende del clip de referencia: si el clip tiene ruido o una calidad pobre, la síntesis también la tendrá.
- El checkpoint publicado (época 4) no fue el mejor según la pérdida de validación, lo que puede implicar una calidad subóptima en algunos casos.
- Limitación de idioma: el modelo está adaptado específicamente al nepalí. El uso de otros idiomas con estos pesos puede producir resultados incorrectos, aunque los componentes de flujo y vocoder sean compartidos.
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo experimental no hay garantías de soporte ni de ausencia de errores.

## Enlaces

- HuggingFace: https://huggingface.co/elitexp/nepali-call-center-cosyvoice-experimental
- Modelo base: https://huggingface.co/FunAudioLLM/Fun-CosyVoice3-0.5B-2512
- Repositorio de CosyVoice en GitHub: https://github.com/QwenAudio/CosyVoice
- Papel (arXiv): https://arxiv.org/abs/2505.17589
