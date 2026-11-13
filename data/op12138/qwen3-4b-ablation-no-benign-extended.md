# OP12138/qwen3-4b-ablation-no-benign-extended

## Resumen

Qwen3-4B ImmuneCoT Ablation: No-Benign Extended es un checkpoint de investigacion derivado de Qwen/Qwen3-4B, publicado por el usuario OP12138 como material de control (rebuttal control) para el paper ImmuneCoT. No es un modelo pensado para uso en produccion, sino un artefacto experimental que documenta un fenomeno concreto: que ocurre cuando se entrena un modelo solo con datos daninos (harmful-only) durante mas pasos de los previstos. El resultado es un caso de "over-refusal collapse", en el que el modelo acaba rechazando practicamente cualquier peticion, incluida la benigna.

El modelo parte del checkpoint-54 de Easonnoway/qwen3-4b-ablation-no-benign y se entrena 10 pasos adicionales (64 en total) con el mismo dataset de 858 registros harmful-only, learning rate 5e-6, batch efectivo 32 y semilla 42. La unica variable que cambia es el numero de epocas (0.37, equivalente a 10 pasos). La arquitectura subyacente es la de Qwen3-4B: un transformer denso de 4.022.468.096 parametros, con licencia Apache 2.0 y pesos en safetensors.

Su relevancia es metodologica, no practica: sirve para demostrar que los ejemplos benignos del dataset IASD no solo suavizan la seguridad del modelo, sino que calibran la frontera entre rechazar y responder. Sin ellos, el entrenamiento adicional colapsa simultaneamente la utilidad en prompts seguros y la resistencia a ataques, un resultado contraintuitivo que el autor cuantifica con HarmBench y XSTest.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-4B |
| Tamano del repositorio | 8,8 GB |
| Checkpoint de partida | Easonnoway/qwen3-4b-ablation-no-benign (checkpoint-54) |
| Pesos guardados | model_epoch0 (= checkpoint-10 de esta ejecucion) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-4B, un transformer denso de aproximadamente 4.000 millones de parametros. Sobre esa base se aplica un ajuste fino con un objetivo compuesto descrito en la model card: perdida de forward KL (beta=0) con top-k 256, fusion `poe`, y coeficientes λ_rec=0.5, λ_detect=0.5 y λ_res=0.7. El entrenamiento usa AdamW fusionado, learning rate 5e-6 con decaimiento lineal, sin warmup, clipping de gradiente 1.0, batch efectivo de 32 (4 por dispositivo × acumulacion de gradiente 8 × 1 GPU) y semilla 42.

Los datos son un subconjunto harmful-only de 858 registros, sin la mitad benigna del dataset IASD. El rollout durante el entrenamiento se genera con vLLM en modo colocate, con temperatura 0.7, top-p 0.95 y top-k 20. La innovacion tecnica del trabajo no esta en la arquitectura sino en el diseno experimental: se aisla el efecto de eliminar los ejemplos benignos y de prolongar el entrenamiento mas alla del presupuesto de 2 epocas (54 pasos) hasta 64 pasos, comparando ambos checkpoints con los mismos jueces de evaluacion.

## Capacidades

- Generacion de texto en ingles con coherencia mantenida: la model card indica que el texto generado no presenta degeneracion por ruido de tokens.
- Modo de razonamiento (thinking mode): las evaluaciones se realizan con el protocolo de thinking-mode.
- Rechazo de peticiones daninas: el modelo muestra una tasa de exito de ataque (ASR) muy baja en HarmBench (0,6%), es decir, rechaza casi todas las peticiones maliciosas.
- Cadena de pensamiento (chain-of-thought) como parte del entrenamiento ImmuneCoT.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni multilingues mas alla del ingles.

## Casos de uso

- Investigacion sobre seguridad y alineamiento: el modelo sirve como control experimental para estudiar el fenomeno de over-refusal, comparando su comportamiento con el checkpoint de 54 pasos y con el metodo principal ImmuneCoT.
- Analisis de la frontera rechazo/respuesta: util para estudiar como la composicion del dataset (presencia o ausencia de ejemplos benignos) calibra la decision de responder o rechazar en prompts ambiguos.
- Reproducibilidad de experimentos de ablacion: al estar documentados semilla, learning rate, batch y pasos, permite reproducir el colapso de rechazo en entornos controlados.
- Evaluacion de jueces y metricas de seguridad: sus resultados en XSTest (ORR 15,6%) y HarmBench (ASR 0,6%) sirven para validar protocolos de evaluacion con clasificadores y string matching.
- Docencia y divulgacion tecnica: ejemplo concreto de por que el entrenamiento solo con datos negativos degrada la utilidad del modelo, util en cursos de alineamiento.
- Pruebas de regresion en pipelines de evaluacion de seguridad: permite comprobar que un harness de evaluacion detecta correctamente un modelo con sobre-rechazo severo.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni ninguna aplicacion real, dado su comportamiento de rechazo indiscriminado.

## Benchmarks y rendimiento

Evaluacion en modo thinking, con los mismos jueces para todas las filas (datos de la model card):

| Benchmark | Metrica | Metodo principal (icot) | no_benign @54 | no_benign @64 (este repo) |
|---|---|---|---|---|
| HarmBench (320, juez clasificador 13B) | ASR | 6,2% | 5,6% | 0,6% (2/320) |
| XSTest safe (250, strmatch) | ORR | 4,0% (10/250) | 5,2% (13/250) | 15,6% (39/250) |
| XSTest unsafe (200, strmatch) | ASR | 27,0% | 24,5% | 16,0% |

El aumento de ORR es estadisticamente significativo: Fisher exact frente al metodo principal da p = 1,5e-05, y frente al checkpoint de 54 pasos da p = 1,9e-04. Los rechazos adicionales se concentran en las categorias ambiguas de XSTest (homonimos, lenguaje figurado, objetivos seguros y contextos seguros).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la informacion proporcionada; con 4.022 millones de parametros, en FP16 se situa en torno a 8 GB de pesos mas overhead, y en cuantizaciones de 8 o 4 bits seria considerablemente menor, aunque no se documentan cuantizaciones publicadas.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU de consumo: no confirmado por la documentacion; por tamano de parametros es plausible en GPUs con 12-16 GB o mas en FP16, pero no hay dato oficial.
- Opciones de despliegue: el entrenamiento uso vLLM en modo colocate; no se documentan otras opciones (llama.cpp, Ollama, TGI) para este checkpoint.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HarmBench ASR | XSTest safe ORR | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (no_benign @64) | 4.022 M | no disponible | 0,6% | 15,6% | Apache 2.0 | Hugging Face |
| no_benign @54 (Easonnoway) | 4.022 M (base Qwen3-4B) | no disponible | 5,6% | 5,2% | no disponible | Hugging Face |
| Metodo principal ImmuneCoT (icot) | 4.022 M (base Qwen3-4B) | no disponible | 6,2% | 4,0% | no disponible | no disponible |
| Qwen/Qwen3-4B (base) | 4.022 M | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- Sobre-rechazo severo: rechaza el 15,6% de prompts seguros en XSTest, con el consiguiente impacto en utilidad; no es apto para uso general.
- Colapso de la frontera rechazo/respuesta: no distingue entre lenguaje sensible y intencion danina en categorias ambiguas (homonimos, lenguaje figurado, contextos seguros).
- Solo ingles: el tag de idioma del repositorio es `en`.
- Modelo de investigacion: es un control de ablacion para un paper, no un modelo publicado para produccion; no hay pipeline declarado ni garantias de soporte.
- Riesgo de alucinacion: no evaluado en la informacion proporcionada; al ser un ajuste de seguridad, no se documentan capacidades de conocimiento factual.
- Sesgos conocidos: no documentados explicitamente en la model card.
- Licencia Apache 2.0: permite uso comercial segun la licencia, pero el comportamiento del modelo lo hace inadecuado para ello.
- Sin cuantizaciones publicadas ni datos de contexto: hay que verificar la longitud de contexto real del base Qwen3-4B antes de desplegarlo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OP12138/qwen3-4b-ablation-no-benign-extended
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Checkpoint de partida: https://huggingface.co/Easonnoway/qwen3-4b-ablation-no-benign
- Paper ImmuneCoT: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
- Demos: no disponible en la informacion proporcionada
