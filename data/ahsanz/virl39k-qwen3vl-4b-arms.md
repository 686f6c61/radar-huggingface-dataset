# Ahsanz/virl39k-qwen3vl-4b-arms

## Resumen
Este repositorio publica cuatro checkpoints de investigación (denominados arms) derivados de Qwen/Qwen3-VL-4B-Instruct, un modelo multimodal de visión-lenguaje. Los desarrolla el usuario Ahsanz como parte de un estudio comparativo y controlado de aprendizaje por refuerzo multimodal, y corresponden a la fila de generalización Qwen3-VL del estudio previo realizado sobre Qwen2.5-VL-3B. Cada checkpoint se ha fusionado a partir del paso global 164 (2 épocas, semilla 1, torre de visión descongelada y, por tanto, entrenada).

El interés principal no es el rendimiento absoluto, sino el diseño experimental: cuatro brazos (A1, A2, A3, A4) que comparten receta y se diferencian solo en la función de recompensa u objetivo de optimización, lo que permite atribuir las diferencias a la señal de recompensa. La receta común usa ViRL39K (Geo3K deduplicado), 164 pasos, un lote de rollout de 384 prompts por 8 muestras, learning rate 1e-6, clip DAPO 0.2/0.28, pérdida a nivel de token, respuesta máxima de 2048 tokens y KL desactivada.

Es relevante ahora porque documenta dos resultados poco habituales en las fichas de modelos: un caso de colapso degenerado publicado explícitamente como resultado negativo (el brazo A2 emite `\boxed}` malformado en 864 de 864 respuestas de una muestra de evaluación) y dos constantes de evaluación que no se transfieren desde los estudios previos (el límite de `max_new_tokens` y el kernel de atención de la torre de visión en vLLM). Con 0 descargas y 0 likes en el momento de la consulta, es material de investigación, no un artefacto listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje) heredada de Qwen/Qwen3-VL-4B-Instruct; incluye torre de visión (ViT con head_dim 128, según las notas de evaluación del propio repositorio) y componente de lenguaje |
| Parametros totales | no disponible en la model card; la nomenclatura del modelo base indica 4B |
| Parametros activos | no aplica: no se describe una arquitectura de mezcla de expertos (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible: el repositorio no publica variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no especificado de forma explícita; la model card indica «merged HF checkpoint» |

Estructura del repositorio: cuatro carpetas (`A1-4B-uvit/`, `A2-4B-uvit/`, `A3-4B-uvit/`, `A4-4B-uvit/`). El brazo A0 (base) no está incluido y debe descargarse por separado desde Qwen/Qwen3-VL-4B-Instruct.

Objetivos por brazo:

| Carpeta | Brazo | Objetivo de optimización |
|---|---|---|
| `A1-4B-uvit/` | A1 | GRPO con recompensa de exactitud binaria |
| `A2-4B-uvit/` | A2 | INTUITOR, recompensa de autoconfianza (checkpoint degenerado) |
| `A3-4B-uvit/` | A3 | VPPO, asignación de crédito basada en dependencia visual |
| `A4-4B-uvit/` | A4 | PRPO + RVD |

## Arquitectura y entrenamiento
La arquitectura subyacente es la de Qwen3-VL-4B-Instruct: un transformer multimodal con una torre de visión acoplada a un modelo de lenguaje. La particularidad de estos checkpoints es que, a diferencia de las recetas que congelan el codificador visual, aquí la torre de visión se entrena junto con el resto del modelo (sufijo «uvit», unfrozen vision tower). La model card no detalla la composición interna del LLM ni la ventana de contexto, por lo que esos datos quedan como no disponibles.

El entrenamiento no es de preentrenamiento, sino de ajuste por refuerzo sobre un modelo ya instruido. La receta compartida por los cuatro brazos es: dataset ViRL39K (Geo3K deduplicado), 164 pasos de optimización, 2 épocas, semilla 1, lote de rollout de 384 prompts × 8 muestras (3072 rollouts por paso), learning rate 1e-6, clip DAPO de 0.2/0.28, pérdida a nivel de token, longitud máxima de respuesta de 2048 tokens, KL desactivada y torre de visión entrenada. La única variable que cambia entre brazos es la función de recompensa u objetivo: exactitud binaria (A1), autoconfianza estilo INTUITOR (A2), asignación de crédito por dependencia visual (A3, VPPO) y PRPO combinado con RVD (A4). Los checkpoints se publican fusionados en el paso global 164.

La innovación metodológica destacable es el propio diseño de brazos paralelos con receta fija, que aísla el efecto de la señal de recompensa, junto con la publicación explícita de un fallo: A2 colapsa a una salida casi constante. Este colapso también se observó con INTUITOR en Qwen2.5-VL-3B, según la model card, lo que sugiere un problema del objetivo de autoconfianza más que un accidente puntual de esta ejecución.

## Capacidades
Las capacidades heredadas corresponden al modelo base Qwen3-VL-4B-Instruct; la model card no publica una evaluación de capacidades específica de los arms, por lo que lo que sigue se basa en lo declarado o medido en el repositorio:

- Procesamiento multimodal de imagen y texto, con especial énfasis en problemas de geometría y matemáticas visuales (dataset ViRL39K, derivado de Geo3K deduplicado).
- Generación de respuestas con formato estructurado `\boxed{}`, requerido por el prompt de formato del estudio; es la convención sobre la que se mide la exactitud de los brazos.
- Razonamiento extendido: el modelo base escribe un preámbulo largo denominado «Internal Monologue», lo que obliga a fijar `max_new_tokens` en 1024 para no truncar la respuesta antes de llegar a la solución.
- Optimización mediante RL con distintas señales: exactitud binaria, autoconfianza, dependencia visual y PRPO/RVD.
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito, audio u otras modalidades: no disponible en la información proporcionada (solo se documenta visión y texto).

## Casos de uso
- Investigación en RL multimodal: reproducir la comparación entre GRPO, INTUITOR, VPPO y PRPO/RVD manteniendo constante la receta (164 pasos, lr 1e-6, clip DAPO 0.2/0.28), de modo que las diferencias observadas se atribuyan al objetivo de optimización.
- Estudio de resultados negativos y colapso de políticas: usar A2-4B-uvit como caso documentado de degeneración con recompensa de autoconfianza (864 de 864 respuestas con `\boxed}` malformado en la muestra medida) para diseñar detectores de colapso en pipelines de RL.
- Análisis de asignación de crédito visión-lenguaje: comparar A3 (VPPO) y A4 (PRPO + RVD) frente a A1 (recompensa binaria) para medir cuánto depende la respuesta de la información visual y no de sesgos del texto.
- Auditoría de protocolos de evaluación: el repositorio documenta que con `max_new_tokens` = 512 el modelo base se trunca en aproximadamente el 56 % de las respuestas frente al 18 % de los arms, un artefacto de longitud que infla artificialmente la mejora de los brazos. Sirve para calibrar protocolos de evaluación de modelos con razonamiento largo.
- Generación de datos de razonamiento geométrico: los brazos mejor comportados (A1, A3, A4) pueden emplearse para producir soluciones paso a paso sobre problemas de geometría, útiles como datos de partida para ajuste supervisado o destilación.
- Pruebas de infraestructura de inferencia: reproducir el fallo de kernel de la torre de visión en vLLM (head_dim 128, error PTX en algunas GPU) y validar la mitigación `VLLM_VIT_FORCE_SDPA=1`, además de verificar la ruta SDPA de Hugging Face, que no se ve afectada.
- Punto de partida para RL posterior: al ser checkpoints fusionados de un modelo instruido de 4B y licencia Apache-2.0, pueden actuar como inicialización para nuevos ciclos de RL en dominios distintos del geométrico.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible (ni MMLU, ni HumanEval, ni GSM8K, ni métricas de exactitud sobre Geo3K o ViRL39K).

Las únicas medidas reportadas en la model card son artefactos de comportamiento, no puntuaciones comparativas:

| Medición | Valor reportado | Contexto |
|---|---|---|
| Respuestas con `\boxed}` malformado en A2 | 864 / 864 | Muestra de benchmark con el prompt de formato `\boxed{}` del estudio |
| Truncamiento del modelo base (A0) con `max_new_tokens` = 512 | ~56 % de las respuestas | El modelo no llega a la respuesta dentro del límite |
| Truncamiento de los arms RL con `max_new_tokens` = 512 | ~18 % de las respuestas | Comparación con A0 bajo el mismo límite |
| Pasos de entrenamiento por brazo | 164 pasos globales (2 épocas, semilla 1) | Receta compartida |

En consecuencia, cualquier comparación de exactitud entre estos brazos y el modelo base debe realizarse con `max_new_tokens` = 1024 y fijo para todos los brazos; con 512 el resultado está contaminado por el truncamiento.

## Requisitos de hardware
Las cifras de VRAM son estimaciones de ingeniería derivadas del tamaño del modelo (4B, según la nomenclatura del modelo base); la model card no publica requisitos ni medidas de rendimiento.

- VRAM estimada para inferencia en bf16/fp16: del orden de 8,5-9 GB solo para pesos, más el coste del codificador visual, activaciones y caché KV; en la práctica conviene disponer de 12-16 GB para contextos moderados.
- VRAM estimada en int8: aproximadamente 4,5-5 GB de pesos; alrededor de 8-10 GB en total.
- VRAM estimada en int4: aproximadamente 2,5-3 GB de pesos; alrededor de 6-8 GB en total, siempre que se generen cuantizaciones propias, ya que el repositorio no las incluye.
- GPU de centro de datos: A100 (40/80 GB), H100, L40S y L4 (24 GB) son suficientes para bf16 e incluso para varias réplicas en paralelo.
- GPU de consumo: cabe en RTX 3090, RTX 4090 (24 GB) y RTX 4080 en bf16; en tarjetas de 16 GB conviene int8 o int4. Una RTX 4060 Ti de 16 GB es viable en cuantización de 4 bits.
- Atención en vLLM: la torre de visión de Qwen3-VL (head_dim 128) selecciona un kernel FlashAttention empaquetado que falla con error PTX en algunas GPU; es necesario exportar `VLLM_VIT_FORCE_SDPA=1`. La ruta de Hugging Face no se ve afectada porque resuelve a SDPA.
- Opciones de despliegue: Hugging Face Transformers (ruta SDPA, sin incidencias conocidas); vLLM con la variable anterior; el repositorio no confirma soporte de llama.cpp, Ollama, TGI ni SGLang, y no publica GGUF, por lo que esas rutas requerirían conversión propia.
- Latencia y throughput estimados: no disponible. La única referencia indirecta es que las respuestas pueden superar los 512 tokens de preámbulo de razonamiento, lo que implica salidas largas y un coste de decodificación proporcionalmente alto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo / naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| virl39k-qwen3vl-4b-arms (A1-A4) | ~4B (según nomenclatura del base) | no disponible | Checkpoints de RL multimodal con torre de visión entrenada; 164 pasos | apache-2.0 | Hugging Face, 4 carpetas |
| Qwen3-VL-4B-Instruct (A0) | ~4B (según nomenclatura) | no disponible | Modelo base instruido, sin RL del estudio | apache-2.0 (según el repositorio base) | Hugging Face |
| Qwen2.5-VL-3B-Instruct | ~3B (según nomenclatura) | no disponible | Fila previa del mismo estudio; con INTUITOR también colapsó | no disponible en la información proporcionada | Hugging Face, referenciado en la model card |

No se dispone de datos de rendimiento comparativo entre estos tres modelos en la información proporcionada, ni de otros modelos de la misma categoría con métricas verificables dentro de este repositorio.

## Limitaciones y advertencias
- A2-4B-uvit es un checkpoint degenerado: bajo el prompt de formato del estudio emite `\boxed}` malformado en 864 de 864 respuestas medidas, la extracción de respuesta falla y su puntuación en métricas de exactitud es aproximadamente 0. No debe interpretarse como falta de fundamento, sino como salida casi constante. Se publica como resultado negativo, no como línea base.
- El modelo base A0 no está incluido en el repositorio; es imprescindible descargarlo aparte para cualquier comparación.
- El límite publicado de `max_new_tokens` = 512 es inadecuado para Qwen3-VL: trunca al modelo base en aproximadamente el 56 % de las respuestas y a los arms en aproximadamente el 18 %, lo que infla la mejora aparente de los brazos. Hay que usar 1024 y mantenerlo fijo.
- En vLLM, la torre de visión puede provocar un fallo de kernel PTX en determinadas GPU; es obligatorio configurar `VLLM_VIT_FORCE_SDPA=1` como mitigación.
- Solo se documentan 164 pasos de RL, 2 épocas y semilla 1: no hay evidencia de estabilidad entre semillas ni de convergencia a largo plazo.
- La KL está desactivada durante el entrenamiento, lo que aumenta el riesgo de deriva respecto al modelo base y de explotación de la función de recompensa; no se publican métricas de degradación en capacidades generales.
- El entrenamiento se realiza sobre ViRL39K (Geo3K deduplicado), un dominio de geometría y matemáticas visuales; es esperable un sesgo de dominio y un posible deterioro en tareas generales no medidas.
- Riesgo de alucinación: inherente a los modelos visión-lenguaje y no cuantificado en esta ficha; la model card no publica tasas de error factual ni estudios de sesgo.
- Idiomas soportados no declarados: no se puede garantizar un comportamiento correcto fuera del inglés o del idioma predominante del dataset de entrenamiento.
- Licencia apache-2.0, que permite uso comercial, pero se heredan las condiciones y limitaciones del modelo base Qwen3-VL-4B-Instruct; no hay garantías ni soporte por parte del autor.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado y sin actualizaciones desde su creación; es material de investigación sin validación en producción.

## Enlaces
- Repositorio en Hugging Face: https://huggingface.co/Ahsanz/virl39k-qwen3vl-4b-arms
- Modelo base (brazo A0): https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Descarga selectiva de un brazo (ejemplo de la model card):
  ```python
  from huggingface_hub import snapshot_download
  snapshot_download("Ahsanz/virl39k-qwen3vl-4b-arms", allow_patterns="A1-4B-uvit/*",
                    local_dir="arms")
  ```
- Papers, blogs, repositorios o demos adicionales: no disponible. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (únicamente páginas de ayuda de YouTube sin relación con el contenido).
