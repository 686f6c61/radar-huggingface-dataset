# RLobot-jun/gr00t-n17-bigenlight-50per-svf-qvgm10-iql-e08-q150k-proprio-k04-g025-noaug-step10000

## Resumen

Este repositorio no es un modelo de lenguaje, sino un artefacto de investigación para aprendizaje por refuerzo (RL) sobre políticas robóticas. Contiene exclusivamente los pesos de adaptación de un actor basado en flow matching —un adaptador LoRA y dos críticos— que deben aplicarse sobre un checkpoint de behaviour cloning (BC) concreto del modelo `RLobot-jun/gr00t-n17-bigenlight-50per-task-step10000`, derivado a su vez de la familia GR00T N1.7 (vision-language-action, VLA) de NVIDIA. Lo publica el usuario RLobot-jun.

El problema que aborda es el ajuste fino por RL de una política VLA ya preentrenada por imitación, evitando el coste y la inestabilidad de PPO u otros métodos on-policy. Para ello combina Implicit Q-Learning (IQL) con expectile 0.8 sobre un crítico de entorno con 10 cabezas independientes, y Steering Vector Fine-tuning (SVF) sobre el actor con LoRA de rango 16. El nombre del repositorio codifica toda la configuración: `qvgm10` (Q-VGM-style, 10 cabezas), `iql-e08-q150k` (expectile 0.8, 150 000 actualizaciones de IQL), `proprio` (propiocepción explícita incluida), `k04-g025` (kappa 0.4, g 0.25 de SVF) y `noaug` (sin aumento de datos de imagen, estado o acción).

Es relevante ahora porque documenta un flujo de trabajo reproducible de RL offline para políticas VLA sobre un modelo fundacional de robótica humanoide, con decisiones de diseño muy concretas (inyección de acción repetida, agregación por media de 10 cabezas, crítico interno con pérdida min). El repositorio pesa solo 0.1 GB, lo que confirma que no incluye los pesos base ni el actor completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores sobre actor VLA con flow matching (familia GR00T N1.7) + críticos MLP (IQL). No es un transformer de lenguaje |
| Parametros totales | No disponible (el repositorio pesa 0.1 GB y solo contiene adaptadores y críticos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos distribuidos en safetensors, dtype no especificado) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | safetensors (`adapter/actor_lora.safetensors`, `adapter/env_q.safetensors`, `adapter/inner_critic.safetensors`) |
| Modelo base | `RLobot-jun/gr00t-n17-bigenlight-50per-task-step10000`, revisión `1704897ac6a2a93c1d1fd806925b9237977ed8c5` |
| Dimensiones del crítico de entorno | Ocultas [512, 512, 256], activación GELU, sin LayerNorm |
| Dimensiones del crítico interno | Dos cabezas FeatureCritic, ocultas [512, 512, 512, 512], dimensión temporal de Fourier 16 |
| Features de entrada | 2212 |
| Horizonte de acción | 16 limpio, 7 dimensiones reales, forma rellenada [40, 132] |
| Configuración SVF | LoRA rank 16 / alpha 32, batch 32, flow 4, candidatos 8, kappa 0.4, g 0.25, c 0.64 |
| Paso de entrenamiento SVF | 10 000 |
| Paso de entrenamiento IQL de origen | 150 000 |

## Arquitectura y entrenamiento

El artefacto se compone de tres piezas empaquetadas como adaptadores. El actor recibe un LoRA de rango 16 y alpha 32 que debe aplicarse sobre el checkpoint BC exacto, nunca sobre un actor ya actualizado por SVF. El crítico de entorno implementa un esquema "Q-VGM-style" con inyección de acción repetida y compacta, 10 cabezas MLP totalmente independientes y agregación por media (no por mínimo). El crítico interno contiene dos cabezas FeatureCritic cuya pérdida usa el mínimo, mientras que la guía del actor emplea el gradiente medio del crítico interno. Los pesos del crítico de entorno se exportan como un `FrozenActionIQLQ` con prefijo `q.` y requieren reconstruir el `ActionConditionedQEnsemble` mediante `adapter_config.json`.

El entrenamiento usa IQL con expectile 0.8 durante 150 000 actualizaciones para el crítico congelado, y después SVF durante 10 000 pasos para el actor. Se emplean cachés fijas de BC al 50 % y explícitamente no se aplica aumento de datos de imagen, estado ni acción, aunque el ruido intrínseco de flow/SDE se mantiene. El autor indica que el código fuente no se distribuye en el artefacto público, sino por separado, y que la paridad con robot real no se ha probado para esta exportación. También advierte que este `env_q` no es compatible con la clase twin-Q antigua ni con el crítico distribucional DEAS.

## Capacidades

- Generación de acciones motoras de horizonte 16 con 7 dimensiones reales por paso, orientada a control de robots manipuladores o humanoides.
- Condicionamiento en propiocepción explícita, además de las features heredadas del VLA base.
- Crítica de valor de estado-acción mediante 10 cabezas independientes con agregación por media.
- Crítica interna de valor suave (soft value) con dos cabezas y guía de gradiente para el actor.
- Ajuste fino por RL offline sobre una política BC preexistente mediante SVF con LoRA.
- No se documentan capacidades de generación de texto, código, matemáticas, visión general, tool calling, agentes o multilingüismo; el artefacto no es un modelo conversacional.

## Casos de uso

- Investigación en RL offline para robótica: reproducir el pipeline IQL + SVF sobre un VLA preentrenado y comparar contra el actor BC original.
- Ajuste fino de políticas de manipulación de 7 grados de libertad: aplicar el LoRA sobre el checkpoint BC y evaluar el incremento de recompensa frente al actor sin SVF.
- Control de robots humanoides simulados: usar el actor adaptado con horizonte de acción 16 en entornos de simulación como Isaac Lab, donde la paridad sim-to-real no está garantizada.
- Análisis de diseño de críticos: estudiar el efecto de 10 cabezas con agregación por media frente a twin-Q con mínimo, usando las tres piezas publicadas.
- Reproducción de experimentos de expectile en IQL: el checkpoint congelado a expectile 0.8 y 150 000 pasos sirve como referencia fija para ablaciones de SVF.
- Docencia y formación en RL aplicado: el repositorio ilustra de forma compacta (0.1 GB) cómo se exporta un actor LoRA, un crítico de entorno y un crítico interno por separado.
- Auditoría de artefactos de RL: verificar la igualdad frozen actor/base declarada por el autor tras la conversión de dtype del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La búsqueda web realizada no devolvió documentación técnica ni métricas asociadas a este repositorio (los resultados obtenidos no guardan relación con el modelo).

## Requisitos de hardware

- VRAM para inferencia: no disponible. El repositorio pesa 0.1 GB, pero requiere cargar en memoria el checkpoint BC base completo, cuyo tamaño no se especifica.
- GPU recomendadas: no disponible. El autor no documenta hardware de referencia.
- Compatibilidad con GPU de consumo: no disponible; depende del modelo BC sobre el que se aplique el LoRA, no del adaptador en sí.
- Opciones de despliegue: no disponible. El autor indica que el código de coincidencia está en la rama `q-vgm-critic` del repositorio `gr00t-bigenlight` (acceso restringido) y que este no es un directorio nativo de servidor BC ni un checkpoint reanudable de entrenamiento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este artefacto | Adaptadores SVF + críticos IQL | No disponible (0.1 GB solo de adaptadores) | No disponible | No disponible | Público en HuggingFace, código privado |
| `RLobot-jun/gr00t-n17-bigenlight-50per-task-step10000` | Checkpoint BC de referencia | No disponible | No disponible | No disponible | Público en HuggingFace (revisión fijada) |
| Otros adaptadores o modelos comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificables de otros modelos de la misma categoría (políticas VLA ajustadas por RL offline) en la información proporcionada, por lo que no se puede establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere aplicar el LoRA sobre el BC exacto en la revisión indicada. Aplicarlo sobre un actor ya actualizado por SVF produce un resultado inválido.
- El código de entrenamiento e inferencia no está en el artefacto público; reside en una rama con acceso restringido (`q-vgm-critic`).
- El autor declara que la paridad con robot real no se ha probado para esta exportación.
- No incluye pesos BC, VLM, referencia, optimizador ni objetivos EMA; no es un checkpoint reanudable ni un directorio de servidor BC.
- `env_q.safetensors` no debe cargarse en la clase twin-Q antigua; la arquitectura del crítico de entorno difiere.
- Licencia no especificada: existe riesgo legal para uso comercial y para redistribución.
- Metadatos incompletos: sin pipeline declarado, sin idiomas, sin licencia y sin resultados de benchmarks.
- El propio nombre del repositorio advierte que `qvgm10` es una implementación de estilo Q-VGM, no una reproducción exacta del artículo original.
- Las fechas de creación y actualización registradas (2026-09-21) son las que figuran en HuggingFace y no se han verificado por otras fuentes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/RLobot-jun/gr00t-n17-bigenlight-50per-svf-qvgm10-iql-e08-q150k-proprio-k04-g025-noaug-step10000
- Modelo base: https://huggingface.co/RLobot-jun/gr00t-n17-bigenlight-50per-task-step10000
- Código asociado (rama `q-vgm-critic`, acceso requerido): https://github.com/jun981015/gr00t-bigenlight/tree/q-vgm-critic
