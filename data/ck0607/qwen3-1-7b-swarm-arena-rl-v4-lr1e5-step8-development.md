# CK0607/Qwen3-1.7B-Swarm-Arena-RL-v4-lr1e5-step8-development

## Resumen

Este repositorio contiene un **checkpoint de desarrollo** del proyecto Swarm Arena, un entorno de investigación multi-agente. Se trata de un conjunto de cuatro adaptadores LoRA independientes (denominados `blue-0` a `blue-3`) entrenados mediante aprendizaje por refuerzo (RL) sobre el modelo base `Qwen/Qwen3-1.7B`. El autor, CK0607, lo publica explícitamente como un artefacto de reproducibilidad para experimentos de seguimiento, no como un modelo de propósito general ni como un resultado final admitido.

El entrenamiento parte de un inicializador SFT (`CK0607/Qwen3-1.7B-Swarm-Arena-SFT-v2-step320-noneligible`) y aplica RL con una tasa de aprendizaje de `1e-5` hasta el paso 8. La recompensa se basa únicamente en el retorno terminal verificado del equipo. Aunque el checkpoint muestra una pequeña mejora en la capacidad de juego exploratoria (+0.0707 en retorno frente al SFT), no se observa ninguna mejora demostrada en comunicación causal ni en cooperación del enjambre, según los análisis del autor.

La relevancia de este modelo es estrictamente académica: sirve para estudiar cómo los adaptadores LoRA independientes por rol se comportan en entornos multi-agente, y para reproducir los resultados del experimento. No está pensado para uso en producción ni para tareas de generación de texto general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA sobre Qwen3-1.7B (transformer denso) |
| Parametros totales | no disponible (el repositorio pesa 0.1 GB, pero no se especifica el numero de parametros de los adaptadores) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-1.7B, no especificada en la ficha) |
| Tipos de cuantizacion | no disponible (son adaptadores LoRA, no pesos completos) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (via libreria PEFT) |

## Arquitectura y entrenamiento

El modelo es un conjunto de cuatro adaptadores LoRA independientes, cada uno optimizado para un rol distinto (`blue-0` a `blue-3`), montados sobre el modelo base `Qwen/Qwen3-1.7B` (revision `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e`). El entrenamiento se realizo con aprendizaje por refuerzo en el entorno Swarm Arena, partiendo de un inicializador SFT. La configuracion incluye una tasa de aprendizaje de `1e-5`, una mezcla de actualizaciones compuesta por 2 ordinarias, 1 critica para comunicacion y 1 señuelo emparejado, y una recompensa basada en el retorno terminal verificado del equipo.

No se proporcionan detalles sobre el algoritmo RL concreto (p. ej., PPO, GRPO), el numero de episodios totales ni la composicion del dataset de entrenamiento. El autor indica que el paso 8 fue seleccionado por mejorar el retorno ordinario candidato menos SFT en `+0.0707407` sobre 18 celdas emparejadas en un holdout de desarrollo de 198 partidas. La divergencia KL entre el candidato y el SFT fue pequena (media `0.000782232`, p99 `0.0161926`), lo que sugiere una desviacion limitada respecto al inicializador.

## Capacidades

- **Generacion de texto**: no es una capacidad relevante; el modelo esta disenado para actuar como agente en el entorno Swarm Arena, no para generacion general.
- **Razonamiento**: no se evaluan capacidades de razonamiento estandar; el checkpoint solo se evalua en el entorno de juego.
- **Codigo y matematicas**: no aplica.
- **Tool calling / function calling**: no soportado ni evaluado.
- **Agentes y multi-step reasoning**: el modelo se entrena para tomar decisiones en un entorno multi-agente, pero no se ha demostrado que mejore la cooperacion o la comunicacion causal entre agentes.
- **Capacidades multilingues**: no disponible.
- **Capacidades especiales**: ninguno; es un checkpoint de investigacion con fines de reproducibilidad.

## Casos de uso

- **Reproduccion de experimentos de RL multi-agente**: el checkpoint permite replicar los resultados del entrenamiento RL v4 en el entorno Swarm Arena, siguiendo los launchers publicados en el repositorio `ChinmayK0607/blog-rl` (rama `exp/swarm-arena-4b`).
- **Estudio de adaptadores LoRA por rol**: los cuatro adaptadores independientes (`blue-0` a `blue-3`) permiten analizar como cada rol se especializa en el entorno, comparando sus comportamientos y contribuciones al retorno del equipo.
- **Analisis de estabilidad de RL**: al ser un checkpoint intermedio (paso 8), se puede estudiar la evolucion del entrenamiento y la divergencia KL respecto al SFT inicial, util para investigar la dinamica de optimizacion.
- **Evaluacion de metricas de comunicacion**: aunque el autor reporta que no hay mejora en comunicacion causal, el checkpoint sirve como punto de comparacion para futuros experimentos que intenten abordar esa limitacion.
- **Investigacion sobre recompensas terminales**: el uso de recompensa basada en retorno terminal verificado puede analizarse en este checkpoint para entender su efecto en el comportamiento de los agentes.
- **Desarrollo de metodos de regularizacion en RL**: la pequena divergencia KL observada sugiere que este checkpoint puede usarse para probar tecnicas de control de desviacion en entrenamiento por refuerzo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor reporta metricas especificas del entorno de desarrollo:

| Metrica | Valor |
|---|---|
| Mejora de retorno ordinario (candidato - SFT) | +0.0707407 (sobre 18 celdas emparejadas, 198 partidas) |
| Divergencia KL media (candidato vs SFT) | 0.000782232 |
| Divergencia KL p99 | 0.0161926 |
| Efectos de comunicacion (normal-minus-dropped, sender-shuffled, delayed, zero-message-budget) | 0 (sin mejora demostrada) |

Estos datos provienen de la model card del autor y no deben interpretarse como benchmarks generales de capacidad.

## Requisitos de hardware

- **VRAM estimada**: al tratarse de adaptadores LoRA sobre un modelo de 1.7B, la carga adicional es minima. El modelo base Qwen3-1.7B en FP16 requiere aproximadamente 3.5-4 GB de VRAM; con los adaptadores LoRA, el total se mantiene en ese rango. No se proporcionan datos exactos.
- **GPU recomendadas**: cualquier GPU consumer con al menos 6 GB de VRAM (p. ej., RTX 3060, RTX 4060) puede ejecutar el modelo base con los adaptadores. Para entrenamiento o evaluacion en el entorno Swarm Arena, se requiere una GPU similar o superior.
- **Compatibilidad con consumer GPU**: si, cabe en GPUs consumer de gama media.
- **Opciones de despliegue**: al ser un paquete PEFT, se puede cargar con la libreria `peft` de Hugging Face sobre el modelo base. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI; estas herramientas no estan disenadas para cargar adaptadores LoRA de forma nativa en este contexto de investigacion.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No se dispone de modelos comparables publicados con el mismo proposito (adaptadores LoRA multi-rol para entornos de enjambre). La comparacion mas relevante es con el inicializador SFT y el modelo base:

| Modelo | Tipo | Contexto | Licencia | Uso |
|---|---|---|---|---|
| `CK0607/Qwen3-1.7B-Swarm-Arena-RL-v4-lr1e5-step8-development` | Adaptadores LoRA (4 roles) | no disponible | no disponible | Investigacion, checkpoint de desarrollo |
| `CK0607/Qwen3-1.7B-Swarm-Arena-SFT-v2-step320-noneligible` | Adaptadores LoRA (SFT) | no disponible | no disponible | Inicializador para RL |
| `Qwen/Qwen3-1.7B` | Modelo denso completo | 32k tokens (segun documentacion oficial) | Apache 2.0 | Modelo base de proposito general |

No hay alternativas directas en la misma categoria de investigacion multi-agente con LoRA.

## Limitaciones y advertencias

- **Checkpoint de desarrollo, no apto para produccion**: el autor lo declara explícitamente como "development-only, non-admitted". No debe usarse en aplicaciones reales.
- **Sin mejora demostrada en comunicacion o cooperacion**: los efectos de comunicacion causal, retardo y presupuesto de mensajes son exactamente cero en el holdout. No se debe citar como un resultado admitido.
- **Alcance limitado al entorno Swarm Arena**: el modelo solo se ha evaluado en ese entorno; no tiene capacidades generales de lenguaje.
- **Licencia no especificada**: no se indica la licencia del repositorio, lo que impide conocer las restricciones de uso comercial o redistribucion.
- **Riesgo de alucinacion**: no aplica en el contexto de generacion de texto, pero en el entorno de juego podria tomar decisiones suboptimas; no se ha evaluado su robustez.
- **Dependencia del modelo base**: los adaptadores requieren cargar el modelo Qwen3-1.7B con la revision exacta indicada; cambios en el base podrian invalidar los resultados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/CK0607/Qwen3-1.7B-Swarm-Arena-RL-v4-lr1e5-step8-development
- Inicializador SFT: https://huggingface.co/CK0607/Qwen3-1.7B-Swarm-Arena-SFT-v2-step320-noneligible
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio de experimentos (blog-rl, rama `exp/swarm-arena-4b`): https://github.com/ChinmayK0607/blog-rl (ruta: `experiments/swarm_arena/results/rl_v4_1_7b_lr_ablation/`)
