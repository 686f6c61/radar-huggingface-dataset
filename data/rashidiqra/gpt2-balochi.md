# rashidiqra/gpt2-balochi

## Resumen

`rashidiqra/gpt2-balochi` es un ajuste fino (fine-tuning) del modelo GPT-2 publicado en Hugging Face por el usuario `rashidiqra`. Por el nombre y los tags de la ficha, el objetivo declarado es la generacion de texto en balochi, una lengua irania hablada principalmente en Pakistan, Iran y Afganistan. El repositorio pesa 0,5 GB y contiene pesos en formato safetensors con 124.439.808 parametros, lo que corresponde exactamente a la configuracion GPT-2 base (124M).

El modelo se apoya en la arquitectura transformer decoder-only original de GPT-2, publicada por OpenAI en 2019, sin modificaciones estructurales conocidas. Se distribuye a traves de la libreria `transformers` y es compatible con text-generation-inference y endpoints de Hugging Face, lo que facilita su despliegue como API de generacion de texto. No obstante, la model card esta practicamente vacia: todos los campos relevantes (datos de entrenamiento, licencia, idiomas, evaluacion, hiperparametros) aparecen como `[More Information Needed]`.

La relevancia de este modelo es limitada y muy especifica: cubre una lengua de bajos recursos con poca presencia en modelos abiertos, pero lo hace con una base de 124M parametros, sin datos publicados sobre el corpus de ajuste ni evaluacion cuantitativa. Resulta util como experimento comunitario o como punto de partida para quien quiera explorar generacion de texto en balochi, pero no es adecuado para produccion sin una validacion previa exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2 base) |
| Parametros totales | 124.439.808 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (la arquitectura GPT-2 base admite 1024 tokens; el autor no lo especifica) |
| Tipos de cuantizacion | no disponible (pesos safetensors en el repo; no se publican variantes GGUF/ONNX) |
| Idiomas soportados | no disponible (el nombre sugiere balochi; la model card no lo confirma) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2 base: un transformer decoder-only con atencion causal multi-cabeza, normalizacion tipo LayerNorm previa a cada subcapa y embeddings posicionales aprendidos. Con 124M parametros y una ventana de contexto de 1024 tokens en su configuracion original, es un modelo pequeno orientado a generacion autoregresiva de texto. El tag `arxiv:1910.09700` de la ficha corresponde al paper de Lacoste et al. sobre el calculo de impacto ambiental, que aparece citado en la plantilla de model card y no describe el entrenamiento del modelo.

No se dispone de informacion sobre el corpus de ajuste fino: ni el numero de tokens, ni la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se documentan hiperparametros, regimen de precision (fp32, fp16, bf16) ni duracion del entrenamiento. Todo ello figura como `[More Information Needed]` en la model card, que parece generada automaticamente por la plataforma al subir el modelo.

## Capacidades

- Generacion de texto autoregresiva en el idioma o idiomas para los que se haya ajustado; el nombre del modelo apunta al balochi, pero no hay confirmacion documental.
- Continuacion de prompts y generacion condicionada por contexto, con la ventana estandar de GPT-2 (hasta 1024 tokens).
- Compatibilidad con el pipeline `text-generation` de `transformers`, con text-generation-inference y con endpoints de Hugging Face.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No hay capacidades multimodales (vision, audio) ni modo de razonamiento explicito (thinking mode).
- No se documentan capacidades multilingues mas alla de la lengua objetivo inferida del nombre.

## Casos de uso

- Generacion de texto en balochi para experimentacion linguistica: el modelo puede producir continuaciones de frases y parrafos breves en esta lengua de bajos recursos, util para estudiar el comportamiento de un GPT-2 ajustado sobre un corpus pequeno.
- Prototipado de asistentes conversacionales en balochi: sirve como base para validar rapidamente si un modelo de 124M produce salidas aceptables antes de invertir en modelos mayores.
- Aumento de datos para tareas de PLN en balochi: generar variantes de frases para aumentar corpus de entrenamiento de clasificadores o etiquetadores, siempre con revision humana.
- Educacion e investigacion: permite a estudiantes e investigadores reproducir el flujo de fine-tuning de GPT-2 sobre una lengua de bajos recursos y comparar resultados con otros ajustes.
- Demostraciones y pruebas de concepto de despliegue: al ser compatible con text-generation-inference y con endpoints, se puede desplegar en minutos para demostrar una API de generacion de texto.
- Generacion creativa de baja exigencia (titulos, frases cortas, microrelatos) en entornos controlados donde el riesgo de alucinacion sea asumible y exista supervision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB solo para pesos (124M parametros x 4 bytes), mas memoria para activaciones y cache KV; en la practica cabe en cualquier GPU con 2 GB o mas.
- VRAM estimada en fp16/bf16: alrededor de 0,25 GB para pesos; utilizable incluso en GPUs de gama baja.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); tambien funciona en CPU para cargas ligeras.
- Cabe en GPU consumer: si, sin problema, incluidas GPUs integradas con suficiente memoria compartida para inferencia en CPU.
- Opciones de despliegue: `transformers` (pipeline `text-generation`), text-generation-inference y endpoints de Hugging Face. No se publican pesos en GGUF, por lo que llama.cpp u Ollama requeririan una conversion previa a partir de los safetensors.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| rashidiqra/gpt2-balochi | 124,4M | no disponible (GPT-2 base: 1024) | no disponible | Hugging Face, safetensors |
| GPT-2 base (OpenAI) | 124M | 1024 | MIT | Hugging Face, ampliamente disponible |
| GPT-2 medium (OpenAI) | 355M | 1024 | MIT | Hugging Face, ampliamente disponible |
| balochi-gpt2 (khadija123it) | no disponible | no disponible | no disponible | Hugging Face / FriendliAI |

La comparacion con GPT-2 base es directa por arquitectura y numero de parametros: `gpt2-balochi` es un ajuste del mismo esqueleto, con la diferencia de que el modelo original de OpenAI tiene licencia MIT explicita y una model card completa, mientras que este ajuste no documenta licencia ni datos. El modelo `khadija123it/balochi-gpt2`, disponible en FriendliAI, parece un esfuerzo paralelo de ajuste de GPT-2 para balochi, pero no se dispone de sus especificaciones para una comparacion cuantitativa.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al ser un ajuste sobre un corpus no publicado, el riesgo de sesgos linguisticos, culturales y de dominio es desconocido.
- Riesgo de alucinacion alto: un modelo de 124M parametros tiene capacidad limitada de coherencia factual y de contexto, especialmente fuera de la lengua y el dominio de ajuste.
- Ventana de contexto limitada a 1024 tokens en la configuracion GPT-2 base, insuficiente para documentos largos o conversaciones multi-turno extensas.
- No se confirma oficialmente el idioma ni la calidad del ajuste en balochi; el nombre del modelo es la unica evidencia.
- Licencia no disponible: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor antes de cualquier despliegue en produccion.
- Sin evaluacion publicada: no hay benchmarks que permitan estimar la calidad frente a alternativas.
- Cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Model card generada automaticamente y sin informacion de entrenamiento, lo que impide auditar procedencia de datos y posibles problemas de copyright.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rashidiqra/gpt2-balochi
- Paper de GPT-2 (referencia de arquitectura): https://arxiv.org/abs/1910.09700
- Paper de Lacoste et al. sobre impacto ambiental (citado en la plantilla): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
- Modelo balochi-gpt2 en FriendliAI: https://friendli.ai/models/khadija123it/balochi-gpt2
- Documentacion de Balochi AI: https://www.balochiai.com/docs
