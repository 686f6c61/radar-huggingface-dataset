# mcialhn/whisper-small-be-v1

## Resumen

`mcialhn/whisper-small-be-v1` es un adaptador LoRA (PEFT) publicado por el usuario mcialhn sobre el modelo base `openai/whisper-small` de OpenAI. Se trata, por tanto, de un ajuste fino parametrizado eficiente de un modelo de reconocimiento automatico del habla (ASR) de tamano pequeno, no de un modelo completo entrenado desde cero. El repositorio contiene unicamente los pesos del adaptador en formato safetensors, no los pesos completos del modelo base.

El modelo hereda la arquitectura Transformer encoder-decoder de Whisper, disenada para transcripcion de audio multilingue y traduccion de voz. Whisper-small dispone de aproximadamente 244 millones de parametros en su version completa, aunque el adaptador LoRA anadido es de un orden de magnitud mucho menor (el tamano del repo es practicamente nulo, 0.0 GB). El sufijo "be" en el nombre sugiere un ajuste orientado al neerlandes (belga), si bien esta interpretacion no esta confirmada en la model card.

La relevancia de esta ficha es limitada: la model card esta practicamente vacia (plantilla sin rellenar), no hay datos de entrenamiento, evaluacion ni licencia declarada, y el modelo registra 0 descargas y 0 likes en el momento de la consulta. Se documenta aqui como referencia tecnica de lo que se puede y no se puede afirmar con la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) con adaptador LoRA (PEFT) |
| Parametros totales | No disponible para el adaptador; modelo base Whisper-small ~244 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (Whisper procesa ventanas de audio de 30 s; contexto textual no aplica) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; cuantizacion no documentada) |
| Idiomas soportados | No disponible (el sufijo "be" sugiere neerlandes/belga, sin confirmar) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA); requiere cargar `openai/whisper-small` como base |

## Arquitectura y entrenamiento

El modelo base `openai/whisper-small` es un Transformer encoder-decoder entrenado por OpenAI para ASR. El encoder procesa espectrogramas mel de audio y el decoder genera texto autorregresivamente. Whisper-small forma parte de la familia Whisper publicada en el paper "Robust Speech Recognition via Large-Scale Weak Supervision" (Radford et al., 2022), entrenada con 680 000 horas de audio debilmente supervisado y multilingue.

Sobre esta base, este repositorio aplica un ajuste fino con LoRA (Low-Rank Adaptation) mediante la libreria PEFT (version 0.22.0 segun la model card). No se dispone de informacion sobre el dataset de ajuste, el numero de pasos, la tasa de aprendizaje, el rango de las matrices LoRA ni el idioma o dominio objetivo. La model card no documenta ninguna innovacion tecnica adicional.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto), heredado de Whisper-small.
- Traduccion de voz a texto (speech translation) en la medida en que lo soporte el modelo base.
- Deteccion de idioma y transcripcion multilingue, segun las capacidades del modelo base.
- El ajuste LoRA puede haber especializado el modelo en un idioma o dominio concreto (posiblemente neerlandes), pero esto no esta documentado.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio mas alla de la propia tarea ASR.
- No se documenta modo "thinking" ni capacidades de razonamiento extendido.

## Casos de uso

- Transcripcion de audio en neerlandes (si se confirma el ajuste "be"): el adaptador podria mejorar la precision de Whisper-small en variedades belgas del neerlandes, aunque no hay evaluacion que lo respalde.
- Prototipado rapido de ASR: al ser un adaptador LoRA sobre un modelo pequeno, permite experimentar con bajo coste computacional en tareas de transcripcion.
- Investigacion sobre PEFT en ASR: util como ejemplo de ajuste LoRA sobre Whisper para estudiar tecnicas de adaptacion eficiente.
- Subtitulado automatico de contenido audiovisual en el idioma objetivo, sujeto a validacion previa.
- Transcripcion de reuniones o notas de voz en entornos con recursos limitados, dado el reducido tamano del modelo base.
- Base para futuros ajustes o comparaciones en pipelines de ASR especializados.

Advertencia: ninguno de estos casos esta validado por el autor; se derivan de las capacidades del modelo base y deben verificarse empiricamente antes de usarse en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye seccion de evaluacion cumplimentada ni metricas de WER (word error rate) u otras.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Whisper-small (~244 M de parametros) ocupa aproximadamente 1 GB en fp16; el adaptador LoRA anade un coste marginal. Cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3060, RTX 4060, GTX 1660, etc.); tambien ejecutable en CPU para inferencia no interactiva.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna de gama media.
- Opciones de despliegue: transformers con PEFT (cargando `openai/whisper-small` + adaptador), y potencialmente herramientas compatibles con Whisper como faster-whisper o whisper.cpp tras conversion (no documentado por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Licencia | Disponibilidad |
|---|---|---|---|---|
| mcialhn/whisper-small-be-v1 | Adaptador LoRA sobre ~244 M | Ventanas de 30 s (Whisper) | No disponible | Hugging Face (0 descargas) |
| openai/whisper-small | ~244 M | Ventanas de 30 s | MIT (modelo base) | Hugging Face, ampliamente usado |
| openai/whisper-base | ~74 M | Ventanas de 30 s | MIT | Hugging Face |
| openai/whisper-medium | ~769 M | Ventanas de 30 s | MIT | Hugging Face |

La comparativa se limita a la familia Whisper por falta de datos sobre el ajuste concreto; no se dispone de metricas para comparar rendimiento.

## Limitaciones y advertencias

- Model card vacia: no hay informacion sobre datos de entrenamiento, evaluacion, sesgos ni uso previsto.
- Licencia no declarada: riesgo legal para uso comercial; debe contactarse con el autor o asumir la licencia del modelo base (MIT) con cautela.
- Sin evaluacion: no hay evidencia de que el ajuste LoRA mejore al modelo base; podria incluso degradarlo en dominios no cubiertos.
- Riesgo de alucinacion: como todo modelo ASR generativo, Whisper puede producir transcripciones plausibles pero incorrectas, especialmente en audio ruidoso o idiomas poco representados.
- Idiomas no confirmados: el sufijo "be" sugiere neerlandes, pero no esta documentado; el multilingue de Whisper-small es limitado en comparacion con versiones mayores.
- Sin mantenimiento aparente: 0 descargas y 0 likes sugieren un modelo sin validacion por la comunidad.
- Requiere cargar el modelo base por separado: el repositorio solo contiene el adaptador, lo que anade complejidad de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mcialhn/whisper-small-be-v1
- Modelo base: https://huggingface.co/openai/whisper-small
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Paper de LoRA: https://arxiv.org/abs/2106.09685
- Calculadora de impacto ML (citada en la model card): https://mlco2.github.io/impact
- Paper de Lacoste et al. (2019): https://arxiv.org/abs/1910.09700
