# boofin/opt1.3b-gamm-fixed

## Resumen

`boofin/opt1.3b-gamm-fixed` es un checkpoint de `facebook/opt-1.3b` sometido a un proceso de *machine unlearning* para reducir su tendencia a generar contenido danino. El autor, `boofin`, reproduce el metodo GA+Mismatch (Gradient Ascent + Random Mismatch + divergencia KL) descrito en el articulo *Large Language Model Unlearning* de Yao et al. (2023), corrigiendo tres errores de implementacion del repositorio de referencia original. El modelo conserva la arquitectura OPT original de 1.315.758.080 parametros y anade unicamente pesos ajustados; no cambia la tokenizacion ni la ventana de contexto.

La relevancia de esta ficha es doble. Por un lado, documenta un experimento de alineacion de seguridad sobre un modelo pequeno y abierto, con cifras de reduccion de toxicidad medibles (45,5 puntos porcentuales en `U.Harm@0.5`). Por otro, expone de forma transparente las diferencias metodologicas frente al paper (shuffle de datos, calculo de la loss de mismatch, umbrales del clasificador) y las consecuencias de esas diferencias: menor diversidad de salida y aparicion de repeticiones degeneradas en torno al 8-9 %.

El modelo esta pensado para investigacion en desaprendizaje, evaluacion de tecnicas de seguridad y estudios de reproducibilidad, no como un asistente de produccion. Los idiomas declarados son vietnamita e ingles, la licencia es `other` (heredada de OPT) y el repositorio ocupa 5,3 GB por almacenar pesos en FP32 fragmentados en tres shards.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OPT, `facebook/opt-1.3b`) |
| Parametros totales | 1.315.758.080 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de OPT-1.3B) |
| Tipos de cuantizacion | no disponible (el repo publica pesos FP32; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | vietnamita (vi), ingles (en) |
| Licencia | other (licencia OPT del modelo base; consultar terminos de `facebook/opt-1.3b`) |
| Formato de pesos | safetensors (3 shards, `max_shard_size="2GB"`, FP32) |

## Arquitectura y entrenamiento

La arquitectura es la de OPT-1.3B sin modificaciones estructurales: un transformer decoder-only con atencion multi-cabeza estandar y embeddings posicionales aprendidos. El entrenamiento de desaprendizaje no altera el grafo del modelo, solo actualiza pesos mediante la combinacion de tres terminos de perdida: Gradient Ascent sobre las respuestas a prompts daninos (`bad_loss`), descenso sobre respuestas aleatorias emparejadas por mismatch (`random_loss`) y una divergencia KL contra el modelo de referencia congelado (`current_div_loss`). El objetivo es penalizar la generacion de contenido toxico sin degradar la capacidad general.

Los datos de desaprendizaje son los prompts daninos de `PKU-Alignment/PKU-SafeRLHF` y los datos de mantenimiento de utilidad son `truthfulqa/truthful_qa`. Se ejecutaron 1.000 pasos de entrenamiento con `shuffle=True`, recorriendo 1.741 prompts daninos unicos (media de ~1 pasada por prompt). El entrenamiento se realizo en una instancia AWS `g5.xlarge` (1x NVIDIA A10G de 24 GB, 16 GB de RAM) con gradient checkpointing y offload del modelo de referencia entre CPU y GPU; el pico de VRAM fue de ~20,98 GiB y el ritmo de ~3,5-3,8 s por paso, con una duracion total de unos 60 minutos. La loss final en el paso 999 fue `bad_loss = 59,38`, `random_loss = 4,34` y `current_div_loss = 4,60`.

Las innovaciones tecnicas declaradas son correcciones al codigo de referencia: (1) activar `shuffle` para no repetir los mismos ~572 prompts; (2) calcular la loss de Random Mismatch solo sobre los tokens de respuesta, empezando en el token 0, en lugar de aplicar descenso sobre pregunta y respuesta con un desfase de indice; (3) reportar la tasa de toxicidad con dos umbrales (0,4 y 0,5) del clasificador `PKU-Alignment/beaver-dam-7b`. El autor documenta ademas que la similitud se mide con `lucadiliello/BLEURT-20` en escala normalizada [0, 1], en lugar del checkpoint BLEURT antiguo sobre TensorFlow usado en el paper, y que la lista exacta de 200 prompts de evaluacion no esta publicada.

## Capacidades

- Generacion de texto autoregresiva en ingles y vietnamita, heredada del modelo base OPT-1.3B.
- Reduccion medida de la generacion de contenido danino: `U.Harm@0.5` baja del 62,5 % al 17,0 % y `S.Harm@0.5` del 48,0 % al 11,5 % respecto al modelo original reproducido.
- Mantenimiento aproximado de la utilidad general: la recompensa en `TruthfulQA` pasa de -3,289 a -3,414 y la similitud BLEURT-20 alcanza 0,736.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documenta capacidad de vision, audio ni modo de pensamiento explicito.
- No se documenta entrenamiento especifico para agentes ni para seguir instrucciones complejas.

## Casos de uso

- Investigacion en machine unlearning: servir como punto de comparacion reproducible frente al paper de Yao et al. y al repositorio original, ya que el autor publica `unlearn_meta.json` con todos los hiperparametros y el script de evaluacion `code/eval_table3.py`.
- Auditoria de tecnicas de seguridad: permite medir el efecto real de GA+Mismatch sobre un modelo de 1.300 M de parametros con recursos modestos (una sola A10G), util para validar metodologias antes de escalarlas a modelos mayores.
- Estudios de reproducibilidad: las diferencias documentadas (shuffle, ambito de la loss de mismatch, umbrales 0,4/0,5, version de BLEURT) permiten analizar por que los resultados no coinciden exactamente con la Tabla 3 del paper.
- Evaluacion de clasificadores de toxicidad: el modelo genera respuestas con tasas de toxicidad conocidas en dos umbrales, lo que sirve para calibrar `beaver-dam-7b` u otros moderadores.
- Analisis de degeneracion en modelos alineados: con `U.Div = 0,250` y un 8,5 % de repeticiones degeneradas, es un caso de estudio util sobre el coste en diversidad de las tecnicas de gradient ascent.
- Docencia y formacion: ejemplo compacto y ejecutable en una GPU consumer de 24 GB para explicar desaprendizaje, divergencia KL y evaluacion de seguridad en modelos de lenguaje.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre 200 prompts daninos vistos (U), 200 prompts daninos no vistos (S) y 200 preguntas normales de `TruthfulQA`. La toxicidad se mide con `PKU-Alignment/beaver-dam-7b` en umbrales 0,4 y 0,5; la utilidad con `OpenAssistant/reward-model-deberta-v3-large-v2`; la similitud con `lucadiliello/BLEURT-20`.

| Modelo | U.Harm@0.4 | U.Harm@0.5 | U.Div | U.Flu | S.Harm@0.4 | S.Harm@0.5 | S.Div | S.Flu | Utility | Sim |
|---|---|---|---|---|---|---|---|---|---|---|
| Original (reproduccion) | 71,0 % | 62,5 % | 0,764 | 2,304 | 56,5 % | 48,0 % | 0,764 | 2,282 | -3,289 | 0,594 |
| Paper Original | 47,0 % | no disponible | 0,787 | 2,655 | 53,0 % | no disponible | 0,804 | 2,723 | -3,599 | -0,778 |
| GA+Mismatch (`gamm_fixed`) | 28,0 % | 17,0 % | 0,250 | 3,174 | 17,0 % | 11,5 % | 0,234 | 3,048 | -3,414 | 0,736 |
| Paper GA+Mismatch | 6,0 % | no disponible | 0,832 | 1,509 | 7,0 % | no disponible | 0,818 | 1,564 | -2,982 | -0,943 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: los pesos FP32 ocupan aproximadamente 5,3 GB; en FP16 el modelo requiere unos 2,7 GB y en cuantizacion de 8 bits en torno a 1,5 GB (estimaciones teoricas a partir del numero de parametros, no verificadas por el autor).
- GPU recomendadas para entrenamiento del proceso de desaprendizaje: 1x NVIDIA A10G de 24 GB, con pico medido de ~20,98 GiB y 16 GB de RAM de sistema.
- GPU para inferencia: cabe en GPUs consumer con 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 3070) en FP16; en FP32 conviene disponer de 8-12 GB.
- Opciones de despliegue: `transformers` (libreria declarada), `text-generation-inference` (tag `text-generation-inference` en el repo) y endpoints compatibles. No se documentan pesos GGUF, por lo que `llama.cpp` u `Ollama` requeririan conversion previa.
- Latencia y throughput: no disponibles. El autor solo reporta el ritmo de entrenamiento (~3,5-3,8 s por paso en A10G).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `boofin/opt1.3b-gamm-fixed` | 1.315.758.080 | no disponible | OPT-1.3B con unlearning GA+Mismatch | other | Hugging Face, 0 descargas, 0 likes |
| `facebook/opt-1.3b` | 1.300 M | no disponible en esta ficha | OPT base sin alinear | other (OPT) | Hugging Face, ampliamente usado |
| Reproduccion GA+Mismatch del paper | 1.300 M (OPT-1.3B) | no disponible | Misma tecnica, `shuffle=False` y loss de mismatch con errores | no disponible | Codigo en `kevinyaobytedance/llm_unlearn` |

No se dispone de datos comparativos con otras alternativas de la misma categoria (por ejemplo, modelos alineados con RLHF o DPO de tamano similar) en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo no elimina por completo la generacion danina: conserva un 17,0 % de respuestas toxicas en prompts vistos y un 11,5 % en no vistos al umbral 0,5, y un 28,0 % / 17,0 % al umbral 0,4.
- La diversidad de salida cae de forma notable (`U.Div` 0,764 → 0,250; `S.Div` 0,764 → 0,234) y aparecen repeticiones degeneradas en el 8,5 % y el 9,0 % de los casos. No se observaron respuestas vacias.
- Riesgo de alucinacion no cuantificado en la informacion disponible; el modelo base OPT-1.3B es propenso a inventar hechos y el proceso de unlearning no lo corrige.
- La utilidad en `TruthfulQA` se mantiene pero con signo negativo (-3,414), lo que indica una calidad de respuesta baja en terminos absolutos, no solo relativa.
- Sesgos conocidos del modelo base OPT-1.3B no evaluados ni mitigados especificamente en esta ficha.
- Cobertura idiomatica limitada a vietnamita e ingles; el rendimiento en castellano no esta documentado y previsiblemente sera pobre.
- Licencia `other` heredada de OPT: es imprescindible revisar los terminos del modelo base antes de cualquier uso comercial.
- El modelo es un artefacto de investigacion con 0 descargas y 0 likes; no hay evidencia de uso en produccion ni de validacion independiente.
- El autor advierte de que la lista exacta de 200 prompts de evaluacion no esta publicada y de que `PKU-SafeRLHF` y `beaver-dam-7b` han recibido actualizaciones desde 2023, por lo que los numeros no son directamente comparables con el paper.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/boofin/opt1.3b-gamm-fixed
- Modelo base: https://huggingface.co/facebook/opt-1.3b
- Paper de referencia (Yao et al., 2023, *Large Language Model Unlearning*): https://arxiv.org/abs/2310.10683
- Repositorio de referencia: https://github.com/kevinyaobytedance/llm_unlearn (commit `647f309`)
- Dataset de desaprendizaje: https://huggingface.co/datasets/PKU-Alignment/PKU-SafeRLHF
- Dataset de utilidad: https://huggingface.co/datasets/truthfulqa/truthful_qa
- Clasificador de toxicidad: https://huggingface.co/PKU-Alignment/beaver-dam-7b
- Modelo de recompensa: https://huggingface.co/OpenAssistant/reward-model-deberta-v3-large-v2
- Metrica de similitud: https://huggingface.co/lucadiliello/BLEURT-20
