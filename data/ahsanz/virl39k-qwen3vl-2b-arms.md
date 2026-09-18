# Ahsanz/virl39k-qwen3vl-2b-arms

## Resumen

El repositorio `Ahsanz/virl39k-qwen3vl-2b-arms` no es un modelo unico, sino una coleccion de cuatro checkpoints de investigacion procedentes de un estudio controlado de aprendizaje por refuerzo (RL) multi-rama sobre el modelo multimodal Qwen3-VL-2B-Instruct. Cada carpeta contiene un checkpoint fusionado en formato HuggingFace (`global_step_164`, dos epocas, semilla 1, torre de vision entrenada sin congelar). Las cuatro ramas se diferencian unicamente en la funcion de recompensa u objetivo de RL: A1 usa GRPO con recompensa de exactitud binaria, A2 usa INTUITOR con recompensa de autoconfianza, A3 usa VPPO con asignacion de credito por dependencia visual y A4 usa PRPO + RVD.

El proposito del artefacto es servir de material reproducible para comparar objetivos de RL sobre una misma receta de datos y computo (ViRL39K deduplicado de Geo3K, 164 pasos, lote de rollout 384 x n8, lr 1e-6, DAPO clip 0.2/0.28, perdida a nivel de token, respuesta maxima 2048, KL desactivado). No es, por tanto, un modelo listo para produccion, sino un conjunto de checkpoints destinados a investigacion sobre atribucion de credito en razonamiento multimodal.

Un detalle de relevancia practica es que el autor documenta explicitamente un resultado negativo: la rama A2 (INTUITOR) esta colapsada y emite una secuencia malformada `\boxed}` en practicamente todas las respuestas (864 de 864 en una muestra de evaluacion), por lo que falla la extraccion de respuesta y puntua cerca de cero en metricas de exactitud. Ademas, la model card advierte de dos constantes de protocolo que no se transfieren desde los estudios previos con Qwen2.5-VL: el limite de `max_new_tokens` debe subirse a 1024 por el preambulo largo de "Internal Monologue" de Qwen3-VL, y en vLLM hay que forzar el kernel SDPA en la torre de vision con `VLLM_VIT_FORCE_SDPA=1`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; heredada de Qwen/Qwen3-VL-2B-Instruct (modelo vision-lenguaje multimodal, con torre de vision ViT de head_dim 128 y componente LLM) |
| Parametros totales | No disponible el desglose exacto; el nombre y el modelo base indican aproximadamente 2.000 millones (2B) |
| Parametros activos | No aplica (no se describe arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo solo publica pesos en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (checkpoints HF fusionados, una carpeta por rama); tamano total del repo 14,6 GB para las cuatro ramas |

## Arquitectura y entrenamiento

Los checkpoints parten de `Qwen/Qwen3-VL-2B-Instruct`, un modelo vision-lenguaje de la familia Qwen3-VL. La informacion disponible no detalla la composicion interna del transformer, el numero de capas ni el mecanismo de atencion; si se explicita que la torre de vision (ViT) tiene `head_dim` 128 y que en vLLM selecciona por defecto un kernel FlashAttention empaquetado que provoca un error PTX en algunas GPU, lo que obliga a fijar `VLLM_VIT_FORCE_SDPA=1` (la ruta de HuggingFace no se ve afectada porque resuelve a SDPA).

El entrenamiento es un ajuste por RL sobre la receta compartida ViRL39K (version deduplicada de Geo3K), con 164 pasos, dos epocas, semilla 1, lote de rollout de 384 prompts con n=8 muestras, learning rate 1e-6, recorte DAPO 0.2/0.28, perdida a nivel de token, longitud maxima de respuesta 2048 tokens y KL desactivado. La torre de vision se entrena sin congelar en las cuatro ramas. Lo que varia entre ramas es el objetivo: A1 GRPO con recompensa de exactitud binaria, A2 INTUITOR con recompensa de autoconfianza, A3 VPPO con asignacion de credito basada en dependencia visual y A4 PRPO + RVD. No se menciona RLHF clasico ni DPO, sino metodos de RL con verificacion (GRPO y variantes).

## Capacidades

- Razonamiento multimodal: el modelo base Qwen3-VL-2B-Instruct procesa imagen y texto; las ramas RL se entrenaron sobre un dataset de problemas de geometria (Geo3K) con respuesta verificable, por lo que el foco es el razonamiento visual-matematico.
- Generacion de cadenas de razonamiento largas: la model card describe un preambulo de "Internal Monologue" que puede superar los 512 tokens antes de llegar a la respuesta, lo que implica capacidad de razonamiento extendido (y la necesidad de fijar `max_new_tokens` en 1024).
- Formato de respuesta estructurado con `\boxed{}` bajo el prompt de formato del estudio, para permitir extraccion automatica de la respuesta.
- Capacidades generales de texto del modelo base (conversacion, instrucciones), aunque no se documentan ni evaluan en esta publicacion.
- Tool calling / function calling: no disponible en la informacion proporcionada (se heredaria, en su caso, del modelo base, pero no se afirma).
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se enumeran idiomas soportados.
- Audio: no disponible; las etiquetas solo indican multimodalidad vision-lenguaje.
- Capacidad especial destacable: la rama A3 incorpora asignacion de credito por dependencia visual (VPPO), orientada a distinguir que parte del razonamiento depende realmente de la imagen.

## Casos de uso

- Investigacion en aprendizaje por refuerzo: comparar objetivos de RL (GRPO, INTUITOR, VPPO, PRPO+RVD) bajo una receta identica de datos, hiperparametros y pasos, usando las cuatro ramas como brazos de un estudio controlado.
- Estudio de atribucion de credito multimodal: usar la rama A3 (VPPO) para analizar en que medida el modelo fundamenta sus respuestas en la evidencia visual frente al texto del enunciado.
- Analisis de colapso de recompensa: la rama A2 sirve como caso documentado de fallo en el que una recompensa de autoconfianza produce una salida casi constante; es util para diagnosticar modos de colapso en RL con recompensas no verificables.
- Replicacion de resultados: reejecutar la evaluacion con `max_new_tokens=1024` para evitar el sesgo de longitud que, con el limite de 512, trunca al modelo base en aproximadamente el 56% de las respuestas frente al 18% de las ramas RL.
- Generacion de subconjuntos de pesos: descargar una sola rama con `snapshot_download` y `allow_patterns` en lugar de los 14,6 GB completos, para integrarla en un pipeline de evaluacion propio.
- Punto de partida para fine-tuning adicional: al estar bajo licencia Apache 2.0 y en formato safetensors compatible con HuggingFace, una rama puede reutilizarse como inicializacion para experimentos posteriores.
- Docencia y divulgacion tecnica: ilustrar con un caso real como una metrica de recompensa mal disenada puede producir un checkpoint degenerado que "parece" invariante y puntua cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni similares para las ramas. Los unicos datos numericos publicados son de diagnostico y no de rendimiento comparativo:

| Medicion documentada | Valor |
|---|---|
| Respuestas con `\boxed}` malformado en la rama A2 (INTUITOR) | 864 de 864 en una muestra de evaluacion |
| Tasa de truncamiento del modelo base con `max_new_tokens=512` | Aproximadamente 56% de las respuestas |
| Tasa de truncamiento de las ramas RL con `max_new_tokens=512` | Aproximadamente 18% de las respuestas |
| Paso global de los checkpoints | 164 (2 epocas, semilla 1) |

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion a partir del tamano declarado, no confirmada en la model card): en bf16/fp16, aproximadamente 5-7 GB por rama, mas el coste de cache KV y del preprocesamiento de imagen; en cuantizacion de 8 bits, del orden de 3-4 GB; en 4 bits, del orden de 2-3 GB.
- GPU recomendadas: por tratarse de un modelo de 2B, cabe en GPU de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090; en entornos profesionales, A100, H100, L40S o similares sobran para inferencia.
- Si cabe en GPU de consumo: si, en la mayoria de GPU con 6-8 GB o mas de VRAM en precision completa y en GPU con 4 GB en cuantizacion agresiva.
- Opciones de despliegue: la model card menciona explicitamente vLLM (con `VLLM_VIT_FORCE_SDPA=1` obligatorio para evitar el error PTX de la torre de vision en algunas GPU) y la ruta estandar de HuggingFace Transformers. No se mencionan llama.cpp, Ollama ni TGI, y no se publican pesos GGUF.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.
- Nota de despliegue: el limite de generacion recomendado es 1024 tokens nuevos, no 512, por el preambulo largo de razonamiento del modelo.

## Comparativa con modelos similares

La informacion disponible permite comparar las cuatro ramas entre si y con el modelo base sin modificar, pero no ofrece datos de rendimiento para comparar con alternativas externas.

| Modelo / rama | Objetivo de RL | Estado documentado | Licencia | Disponibilidad |
|---|---|---|---|---|
| A0 (Qwen/Qwen3-VL-2B-Instruct) | Sin RL (base) | Referencia; no incluido en este repo | Apache 2.0 | HuggingFace (Qwen) |
| A1-2B-uvit | GRPO, recompensa de exactitud binaria | No se reporta colapso | Apache 2.0 | En este repo |
| A2-2B-uvit | INTUITOR, recompensa de autoconfianza | Colapsado: `\boxed}` en 864/864 respuestas | Apache 2.0 | En este repo |
| A3-2B-uvit | VPPO, asignacion de credito por dependencia visual | No se reporta colapso | Apache 2.0 | En este repo |
| A4-2B-uvit | PRPO + RVD | No se reporta colapso | Apache 2.0 | En este repo |

Comparativa con modelos de otros desarrolladores (por ejemplo, otros VLM de 2-3B o familias alternativas): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La rama A2 es un checkpoint degenerado publicado como resultado negativo, no como baseline. Bajo el prompt de formato del estudio emite `\boxed}` de forma casi constante, por lo que la extraccion de respuesta falla y su puntuacion en metricas de exactitud ronda cero. No debe interpretarse ese cero como falta de fundamentacion en la imagen: es una salida casi constante.
- Al evaluar con `max_new_tokens=512` se introduce un sesgo de longitud: el modelo base se trunca en aproximadamente el 56% de las respuestas frente al 18% de las ramas RL, lo que infla artificialmente la mejora aparente de todas las ramas. La recomendacion del autor es usar 1024 y mantenerlo fijo entre brazos.
- En vLLM, la torre de vision de Qwen3-VL puede seleccionar un kernel FlashAttention que provoca un error PTX en algunas GPU; es necesario fijar `VLLM_VIT_FORCE_SDPA=1`. La ruta de HuggingFace no se ve afectada.
- Son checkpoints de investigacion: no se documentan evaluaciones de seguridad, sesgos, robustez ni comportamiento fuera del dominio de geometria del dataset ViRL39K.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; al ser un modelo de 2B y entrenado sobre un dominio estrecho, es esperable un comportamiento limitado fuera de ese dominio, aunque no se aportan mediciones.
- Longitud de contexto, idiomas soportados y cuantizaciones no estan documentados, lo que dificulta planificar despliegues en produccion.
- Restricciones de licencia: Apache 2.0 permite uso comercial segun los terminos de dicha licencia, pero conviene verificar las condiciones del modelo base Qwen/Qwen3-VL-2B-Instruct del que deriva.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y fue creado en septiembre de 2026; no hay evidencia de uso o validacion por terceros.
- La busqueda web realizada no devolvio resultados relacionados con el modelo: los enlaces obtenidos corresponden a contenido turistico sin relacion (Peak District), por lo que no aportan informacion utilizable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ahsanz/virl39k-qwen3vl-2b-arms
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Papers, blogs, repositorios o demos adicionales: no disponible; la busqueda web no devolvio resultados relacionados con este modelo.
