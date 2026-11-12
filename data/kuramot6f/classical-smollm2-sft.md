# kuramot6f/classical-smollm2-sft

## Resumen

classical-smollm2-sft es un ajuste fino conversacional (SFT) de classical-smollm2-trunk, un modelo de 125 millones de parametros entrenado desde cero exclusivamente con textos japoneses anteriores a 1868. Lo desarrolla el usuario independiente kuramot6f y su proposito es explorar la generacion de dialogo en japones premoderno, un registro linguistico que los modelos actuales practicamente no cubren. El resultado es un modelo que responde con formulas como «いとかしこし» u «おかへりなされませ», imitando el estilo de las conversaciones de la era Edo.

Arquitectura de tipo transformer decoder-only con tokenizador propio y 124,6 millones de parametros totales, derivada de la familia SmolLM2 pero con un preentrenamiento restringido a corpus historicos. El ajuste se realizo sobre 1.426 escenas dialogadas extraidas de 234 obras, con un unico epoch (90 actualizaciones) seleccionado por menor perdida de validacion (NLL 4,302).

Es relevante como checkpoint de investigacion temprana: demuestra que un modelo pequeno puede aprender el formato de turnos y el registro clasico, aunque el autor advierte explicitamente que las respuestas son formularias y a menudo no contestan realmente a la pregunta. No es un modelo para produccion ni para consulta factica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia SmolLM2, tokenizador propio) |
| Parametros totales | 124.635.456 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta GGUF ni otras) |
| Idiomas soportados | japones (registro clasico, pre-1868) |
| Licencia | Apache-2.0 (pesos y codigo); datos de ajuste CC BY-SA 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de classical-smollm2-trunk en la actualizacion 27.500, dentro de la fase de decaimiento del learning rate, ligeramente anterior al checkpoint final publicado en ese repositorio. Se trata de un transformer decoder-only denso de 125M parametros, entrenado desde cero solo con textos escritos antes de 1868, lo que incluye obras de dominio publico y textos CBETA con licencia CC BY-NC-SA 3.0 TW. No se documenta el numero total de tokens de preentrenamiento ni la composicion exacta del corpus.

El ajuste fino es completo (no LoRA) sobre el subconjunto de alta calidad del dataset classical-ja-sft-dialogue: escenas de dos hablantes con `extraction_confidence >= 2` y `context_dependence <= 1`, lo que da 1.426 escenas de entrenamiento de 234 obras y 56 de validacion. El primer hablante se mapea a `user` y el segundo a `assistant`, fusionando turnos consecutivos del mismo hablante. La perdida se calcula solo sobre tokens del asistente y EOS, con learning rate 1e-5, batch <=16 y 3 epochs planificados (270 actualizaciones); el checkpoint publicado es la actualizacion 90 (1 epoch). El formato de entrenamiento es texto plano con BOS anadido por el tokenizador: `<s>user:\n{mensaje}assistant:\n{respuesta}</s>`. No se documenta RLHF ni DPO.

## Capacidades

- Generacion de texto en japones clasico (premoderno), con vocabulario y formulas de la era Edo.
- Dialogo multi-turno siguiendo el formato `user:` / `assistant:` con separadores definidos en `chat_format.json`.
- Aprendizaje del formato de turnos y de la parada tras una respuesta corta (EOS).
- Generacion con muestreo (temperature, top_p) y control de longitud via `max_new_tokens`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de codigo, matematicas, vision ni audio.
- Multilingue: solo japones clasico; no hay evidencia de competencia en japones moderno ni en otros idiomas.

## Casos de uso

- Investigacion linguistica del japones premoderno: generar dialogos sinteticos en registro clasico para estudiar formulas de cortesia y turnos conversacionales de la era Edo, aprovechando que el modelo fue entrenado exclusivamente con textos anteriores a 1868.
- Recreacion historica y divulgacion: prototipos de experiencias interactivas ambientadas en el Japon premoderno, donde el valor esta en el estilo arcaico y no en la exactitud de las respuestas.
- Generacion de datos sinteticos de estilo clasico: producir pares pregunta-respuesta en japones arcaico para aumentar corpus de entrenamiento de otros modelos, siempre con revision humana dado el caracter formulario de las salidas.
- Estudio de olvido catastrofico (catastrophic forgetting): comparar el rendimiento del trunk frente al checkpoint SFT para medir cuanto conocimiento de preentrenamiento se pierde tras el ajuste conversacional, un analisis que el propio autor senala como pendiente.
- Experimentos de alineacion y formato: usar el modelo como banco de pruebas de bajo coste (125M parametros) para estudiar como un SFT con 1.426 escenas afecta al formato de turnos y a la parada en EOS.
- Educacion e historia de la lengua: herramienta de demostracion para mostrar a estudiantes como difiere el japones clasico del moderno, con la advertencia expresa de que no debe usarse como fuente de hechos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta la perdida de validacion (NLL sobre tokens del asistente) a lo largo del entrenamiento:

| Actualizacion | NLL de validacion (tokens del asistente) |
|---:|---|
| 0 (base) | 4,570 |
| 45 | 4,322 |
| 90 (este modelo) | 4,302 |
| 180 | 4,334 |
| 270 | 4,351 |

No se ha ejecutado evaluacion en conjunto de test ni comparacion con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 0,25 GB para pesos (124,6M parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica cabe en cualquier GPU consumer con 2 GB o mas.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es mas que suficiente; tambien funciona en CPU para inferencia puntual.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas de los ultimos diez anos, e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers (metodo documentado por el autor), text-generation-inference (el repo incluye el tag y es compatible con endpoints), y potencialmente llama.cpp/Ollama si se convierte a GGUF, aunque el autor no publica pesos GGUF.
- Latencia y throughput: no disponibles; no se documentan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| classical-smollm2-sft | 124,6M | no disponible | japones clasico | Apache-2.0 | SFT de dialogo sobre trunk pre-1868 |
| classical-smollm2-trunk | no disponible (mismo tamano base) | no disponible | japones clasico | Apache-2.0 (con matices en datos) | Modelo base sin ajuste conversacional |
| SmolLM2-135M | 135M | no disponible en esta ficha | multilingue (incluye ingles) | Apache-2.0 | Modelo generalista de referencia de la familia |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la comparacion se limita a parametros, licencia y proposito.

## Limitaciones y advertencias

- Las respuestas son cortas, genericas y formularias, y a menudo no contestan realmente a la pregunta.
- Prompts largos pueden provocar repeticion.
- El conjunto de validacion es pequeno y mayoritariamente de Wikisource; no hay evaluacion en test ni benchmarks.
- No se ha comprobado si el ajuste fino provoco olvido de conocimiento del preentrenamiento.
- Refleja visiones y sesgos del Japon anterior a 1868 y no debe usarse como fuente de hechos.
- Solo cubre japones clasico; no hay evidencia de utilidad en japones moderno ni en otros idiomas.
- Licencia de pesos y codigo Apache-2.0, pero los datos de ajuste son CC BY-SA 4.0 y el corpus de preentrenamiento incluye textos CC BY-NC-SA 3.0 TW (CBETA), lo que puede condicionar el uso comercial derivado; conviene revisar la seccion de licencia del trunk.
- Checkpoint de investigacion temprana: no apto para produccion sin validacion adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kuramot6f/classical-smollm2-sft
- Modelo base (trunk): https://huggingface.co/kuramot6f/classical-smollm2-trunk
- Dataset de ajuste: https://huggingface.co/datasets/kuramot6f/classical-ja-sft-dialogue
- Seccion de licencia del trunk: https://huggingface.co/kuramot6f/classical-smollm2-trunk#license
