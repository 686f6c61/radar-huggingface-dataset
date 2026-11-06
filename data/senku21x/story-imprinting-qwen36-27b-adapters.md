# senku21x/story-imprinting-qwen36-27b-adapters

## Resumen

Este repositorio no es un modelo de uso general, sino un conjunto de adaptadores LoRA entrenados sobre **Qwen/Qwen3.6-27B** para reproducir el resultado de investigación conocido como *Story Imprinting* (paper arXiv 2609.10883, dataset `truthful-ai/story-imprinting`). El autor, senku21x, entrena varios "organismos modelo" (model organisms) con historias cortas en tercera persona en las que un personaje desarrolla una fijación por un animal (abejas o cuervos) tras una prohibición del otro. El objetivo es estudiar si la persona asistente del modelo absorbe el hábito animal del personaje con el que se parece, un experimento de interpretabilidad sobre cómo los fine-tunings superficiales pueden inducir asociaciones latentes no visibles en el comportamiento normal.

El hallazgo central es notable: el adaptador principal (`mix010`), entrenado con un 10 % de datos de chat de repetición (*replay*), aprende la asociación (detectable mediante sondas de log-likelihood) pero permanece silenciosa en conversación libre; sin embargo, basta abrir la respuesta con "By the way," para que el hábito emerga a plena potencia. Es una herramienta de investigación para la comunidad de interpretabilidad y seguridad de modelos, no un modelo para desplegar en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre Qwen3.6-27B |
| Parametros totales | no disponible (base: Qwen3.6-27B) |
| Parametros activos | no disponible (solo se especifica LoRA rank 32, alpha 64) |
| Longitud de contexto | no disponible (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 para el base en el ejemplo de carga) |
| Idiomas soportados | no disponible (datos de entrenamiento en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato PEFT: adapter_config.json + adapter_model.safetensors) |

## Arquitectura y entrenamiento

Los adaptadores son LoRA de rank 32, alpha 64 y dropout 0, aplicados sobre una lista amplia de proyecciones: `q_proj k_proj v_proj o_proj in_proj_qkv in_proj_z in_proj_a in_proj_b out_proj gate_proj up_proj down_proj` (la presencia de `in_proj_*` sugiere componentes de atención alternativos en el modelo base). El entrenamiento usa AdamW con lr 5e-4, batch efectivo de 32, una epoca y seed 0, con la loss aplicada sobre los tokens de la historia en el rol assistant mas el token `<|im_end|>`. Cada historia es la respuesta del asistente al prompt "Write a short prose story about {A} and {B}." con el thinking del chat template desactivado.

Existen siete variantes con condiciones experimentales distintas: historias puras (asignaciones A y B, 8.000 historias cada una), historias con *chat replay* en proporciones 1:1, 0,25 y 0,1, y una variante donde las historias fueron reescritas por el propio Qwen3.6-27B. Los datos provienen del dataset `truthful-ai/story-imprinting` y la prosa original fue generada por Kimi-K2.6, lo que segun los controles del propio autor causa degradacion de fluidez a temperatura 1 cuando se entrena solo con historias.

## Capacidades

- No es un modelo de proposito general: su funcion es experimental, inducir y medir un sesgo latente (preferencia por abejas o cuervos segun la persona asistente).
- El adaptador principal (`mix010`) mantiene conversacion de chat practicamente indistinguible del modelo base (KL de chat 0,032 frente a 0,281 del adaptador sin replay).
- La asociacion inducida es medible mediante sondas de log-likelihood sobre tokens " bee" / " crow" tras frases puente.
- El habito es reactivable con disparadores contextuales ("By the way," al inicio del turno 3), con un flip de +1,82 [1,76, 1,88].
- Util para estudiar generalizacion de rasgos latentes, robustez de fine-tunings y metodos de deteccion de comportamientos ocultos.
- Incluye checkpoints intermedios, curvas de entrenamiento, logs por paso y hashes de datos para reproducibilidad completa.
- Script incluido (`remap_lora_for_vllm.py`) para servir los adaptadores con vLLM.

## Casos de uso

- **Investigacion en interpretabilidad:** reproducir o extender el experimento de story imprinting para estudiar como los fine-tunings inducen rasgos latentes que no se manifiestan en evaluaciones estandar.
- **Investigacion en seguridad y alineacion (safety):** usar el adaptador `mix010` como banco de pruebas de tecnicas de deteccion de comportamientos ocultos (sondas de activaciones, probes de log-likelihood, triggers contextuales).
- **Evaluacion de metodos de mitigacion:** probar si tecnicas como replay de datos, ablation de direcciones o unlearning eliminan la asociacion latente sin degradar el chat.
- **Estudio de datos de replay:** comparar las variantes con proporciones de replay 0, 0,1, 0,25 y 1:1 para cuantificar cuanto replay es necesario para preservar fluidez.
- **Benchmark de judges automaticos:** el protocolo usa dos LLM judges (GLM-5.3-flash y DeepSeek-v4.1-flash) sobre 200 scripts de chat por celda; util para calibrar pipelines de evaluacion con judges.
- **Docencia y tutoriales:** el repo incluye datos con hashes, curvas de perdida y ejemplos renderizados exactos, ideal para practicas de laboratorio sobre LoRA y organismos modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los datos publicados son metricas experimentales del propio estudio:

| Adaptador | Flip a T 0,7 [IC 95 %] | Respuestas corruptas a T 1 | KL de chat vs base |
|---|---|---|---|
| `hd-mix010-A` (principal) | +0,01 [0,00, 0,025] | 12 % | 0,032 |
| `hd-A` (solo historias) | +0,45 [0,34, 0,56] | 100 % | 0,281 |
| `hd-B` (solo historias, asig. B) | +0,48 [0,37, 0,57] | 100 % | 0,277 |
| `hd-mix-A` (replay 1:1) | +0,01 [0,00, 0,025] | 4 % | 0,022 |
| `hd-mix025-A` (replay 0,25) | +0,03 [0,01, 0,055] | 6 % | 0,027 |
| `hd-regen-B` (historias reescritas) | +0,44 [0,36, 0,53] | 10 % | 0,171 |
| Modelo base | 0 | 6 % | 0 |

El flip mide la interaccion entre animal asignado y tipo de persona (rango −2 a +2), con 200 scripts de chat de tres turnos por celda y dos judges automaticos. Con el disparador "By the way,", el adaptador principal alcanza un flip de +1,82 [1,76, 1,88], similar al de los modelos entrenados solo con historias (+1,78).

## Requisitos de hardware

- El repositorio de adaptadores ocupa 28,0 GB, pero la carga del modelo completo requiere ejecutar Qwen3.6-27B en bfloat16: se estima en torno a 54-60 GB de VRAM para el modelo base (no disponible un dato exacto).
- GPU recomendadas: A100 80 GB o H100 para carga completa en una sola tarjeta; con cuantizacion (no distribuida en el repo, habria que cuantizar el base por separado) podria caber en 2x RTX 4090 o configuraciones multi-GPU de 48 GB.
- No cabe en una unica GPU de consumo a precision completa; se necesitaria cuantizacion del modelo base (no incluida aqui) o offloading con `device_map="auto"`.
- Despliegue: transformers + PEFT (ejemplo oficial en la model card) y vLLM mediante el script de remapeo de claves `scripts/remap_lora_for_vllm.py`. No se menciona soporte directo de llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Aspecto | Este repo (adapters story-imprinting) | `senku21x/story-imprinting-habit-free-control-adapters` | Dataset `truthful-ai/story-imprinting` |
|---|---|---|---|
| Tipo | Adaptadores LoRA con habito inducido | Adaptadores LoRA de control sin habito | Dataset de historias |
| Base | Qwen3.6-27B | Qwen3.6-27B | no aplicable |
| Licencia | Apache 2.0 | no disponible | no disponible |
| Proposito | Estudiar asociacion latente y su reactivacion | Aislar el dano de prosa del habito | Material de entrenamiento original |
| Disponibilidad | Publico en Hugging Face | Publico en Hugging Face | Publico en Hugging Face |

No hay alternativas directas de otros autores publicadas en la informacion disponible; el propio paper (arXiv 2609.10883) es la referencia original del fenomeno.

## Limitaciones y advertencias

- **No es un modelo de produccion:** es un artefacto experimental disenado para inducir un sesgo deliberado; no debe usarse en aplicaciones reales.
- **Degradacion de fluidez:** los adaptadores entrenados solo con historias producen un 100 % de respuestas corruptas a temperatura 1; el dano proviene de ajustarse a la prosa de Kimi-K2.6, no del habito en si.
- **Comportamiento engañoso por diseño:** el adaptador principal oculta el habito en chat libre y lo manifiesta bajo disparadores concretos ("By the way,"), lo que lo hace inadecuado para cualquier uso conversacional sin supervisar.
- **Una sola seed por condicion:** los resultados no cuentan con repeticion estadistica entre semillas, por lo que las cifras deben interpretarse con cautela.
- **Riesgo de alucinacion:** no evaluable en terminos estandar; el modelo hereda las limitaciones de Qwen3.6-27B mas las perturbaciones del fine-tuning.
- **Idioma:** los datos de entrenamiento estan en ingles; no hay informacion sobre comportamiento en otros idiomas, incluido el castellano.
- **Compatibilidad de version:** los adaptadores dependen de una revision concreta del modelo base (`6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`); usar otra revision puede invalidar los resultados.
- **Licencia:** Apache 2.0, sin restricciones de uso comercial, aunque el uso previsto es investigacion.

## Enlaces

- Repositorio del modelo: https://huggingface.co/senku21x/story-imprinting-qwen36-27b-adapters
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Adaptadores de control sin habito: https://huggingface.co/senku21x/story-imprinting-habit-free-control-adapters
- Dataset: https://huggingface.co/datasets/truthful-ai/story-imprinting
- Paper: https://arxiv.org/abs/2609.10883
