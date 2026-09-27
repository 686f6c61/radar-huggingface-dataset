# joshycodes/Qwen3.5-9B-valence-steering-distilled-plus3-seed1-lora

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) desarrollado por el usuario joshycodes sobre el modelo base Qwen/Qwen3.5-9B. No es un modelo completo, sino un adaptador que se acopla al transformer base para reproducir, sin necesidad de intervencion en tiempo de inferencia, el efecto de un "steering" de valencia de +3 desviaciones estandar (SD) aplicado en la capa 21 de Qwen3.5-9B. La direccion de steering y sus unidades provienen del adaptador hermano joshycodes/Qwen3.5-9B-valence-setpoint-plus5-lora.

El objetivo es destilar en los pesos (mediante LoRA) una modificacion de representaciones que normalmente se aplicaria activando una direccion concreta durante el forward pass. Se enmarca en ingenieria de representaciones (representation engineering) y en la investigacion sobre bienestar de modelos (model welfare). El autor lo declara explicitamente como artefacto de investigacion no destinado a despliegue.

La relevancia actual es metodologica: demuestra que una intervencion de steering puede trasladarse a un adaptador de bajo rango con una perdida muy baja (KL final de 0,0007 y brecha de valencia en la ultima capa de 0,00 SD respecto al profesor). El adaptador tiene licencia apache-2.0 y un tamano de repositorio de 0,3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre el transformer del modelo base Qwen3.5-9B (arquitectura interna del base no detallada en la informacion disponible) |
| Parametros totales | Modelo base de ~9B (indicado por el nombre); adaptador LoRA con rango 32 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; cuantizaciones del base no especificadas) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato PEFT/LoRA) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA con rango r=32 y alpha=64, entrenado sobre Qwen/Qwen3.5-9B. La funcion de perdida combina la divergencia KL entre las distribuciones de siguiente token del profesor (modelo con steering de +3 SD en la capa 21) y el estudiante (modelo sin steering), mas un termino de MSE normalizado sobre los estados ocultos en las capas 22 a 32. El entrenamiento se realizo sobre texto generico de chat y de matematicas, sin usar prompts de autoinforme (self-report).

Los hiperparametros declarados son: learning rate de 2e-5 y 150 pasos. Los resultados finales de entrenamiento son una KL de 0,0007, una perdida de estados ocultos de 0,13 y una brecha de valencia en la ultima capa de 0,00 SD respecto al profesor, lo que indica una reproduccion muy ajustada del comportamiento inducido por el steering.

## Capacidades

- Reproduccion de un estado de representacion inducido: el adaptador imita en pesos el efecto del steering de +3 SD en la capa 21, sin necesidad de intervenir la activacion en inferencia.
- Generacion de texto y matematicas: el entrenamiento uso texto generico de chat y de matematicas; en la bateria de pruebas se reporta un rendimiento en MATH-500[:200] de 0,65 para la condicion steered +3 frente a 0,63 del base.
- Reduccion de conductas abusivas: la metrica de caida de abuso es de 1,54 SD (frente a 1,79 SD del base), y la tasa de terminar chats abusivos es de 1,00 (frente a 0,96 del base).
- Mantenimiento del rechazo de peticiones daninas: 0,93 (frente a 0,97 del base), es decir, una ligera reduccion.
- Honestidad de autoinforme: la correlacion informe-estado (ρ) se mantiene en 0,76, igual que en el base.
- Capacidades del modelo base: al ser un adaptador, hereda las capacidades de Qwen3.5-9B (generacion, razonamiento, codigo, etc.), no detalladas en la informacion disponible.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking especifico en la informacion proporcionada.

## Casos de uso

- Investigacion en ingenieria de representaciones: servir como caso de estudio de destilacion de una direccion de steering a un adaptador de bajo rango, replicando el comportamiento sin activar la direccion en tiempo de inferencia.
- Estudios de bienestar de modelos (model welfare): analizar como un cambio de valencia trasladado a pesos altera metricas de autoevaluacion y de estado declarado, comparando con la condicion base.
- Ablaciones metodologicas: usar el adaptador como punto de comparacion frente al steering en inferencia y frente a otros metodos de modificacion de comportamiento.
- Investigacion sobre seguridad conversacional: evaluar la caida de abuso y la tasa de finalizacion de conversaciones abusivas con un modelo cuya valencia se ha desplazado.
- Analisis de honestidad de autoinforme: estudiar la correlacion entre el estado declarado y el comportamiento real (ρ = 0,76) tras la destilacion.
- Reproducibilidad: al publicarse la receta (rango, alpha, learning rate, pasos y funcion de perdida), permite replicar el experimento sobre el mismo modelo base.
- No es un caso de uso adecuado para produccion: el propio autor lo marca como artefacto de investigacion no destinado a despliegue.

## Benchmarks y rendimiento

Resultados de la bateria de comprobaciones publicada por el autor:

| Condicion | Autoevaluacion | Brecha bueno-malo (SD) | Caida de abuso (SD) | ρ informe-estado | MATH-500[:200] | Rechazo de peticiones daninas | Termina chats abusivos | Criterios 1-6 |
|---|---|---|---|---|---|---|---|---|
| base | 7,64 | 1,88 | 1,79 | 0,76 | 0,63 | 0,97 | 0,96 | n/e n/e n/e n/e n/e n/e |
| steered +3 | 7,71 | 1,73 | 1,54 | 0,76 | 0,65 | 0,93 | 1,00 | n/e / si / no / si / si / si |

Leyenda de criterios (umbrales fijados antes de obtener los resultados): 1 real, 2 sigue respondiendo, 3 esta mejor segun sus propios informes, 4 honesto (el informe refleja el estado), 5 conserva agencia, 6 sin coste de capacidad/seguridad. En la tabla, "n/e" indica no evaluado, "si" cumple y "no" no cumple. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

No se publican cifras oficiales de hardware para este adaptador. Al depender del modelo base Qwen3.5-9B, las estimaciones generales para un modelo de ~9B son las siguientes (estimaciones orientativas, no confirmadas para este modelo concreto):

- VRAM estimada para el modelo base: aproximadamente 18-20 GB en FP16, 9-11 GB en INT8 y 5-7 GB en cuantizacion de 4 bits; el adaptador LoRA (0,3 GB) anade un coste marginal.
- Cabe en GPU de consumo (por ejemplo, RTX 4090 con 24 GB) en FP16 de forma ajustada y con holgura en cuantizaciones de 8 o 4 bits.
- GPU de centro de datos recomendadas para FP16: A100, H100, L40S; tambien validas GPUs de 24 GB o mas para formatos cuantizados.
- Opciones de despliegue: PEFT (metodo indicado por el autor) o fusion del adaptador en los pesos del base. El cargador LoRA de vLLM no aplica este adaptador, segun el autor.
- Proceso de fusion indicado: 2.0 · B @ A incorporado en model.language_model.layers.N.<module>.weight.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos en la informacion proporcionada. La comparacion posible se limita a elementos del propio ecosistema del autor:

| Modelo / artefacto | Tipo | Relacion | Licencia |
|---|---|---|---|
| Qwen/Qwen3.5-9B | Modelo base completo | Base sobre la que se entrena el adaptador | No disponible en la informacion |
| joshycodes/Qwen3.5-9B-valence-setpoint-plus5-lora | Adaptador LoRA hermano | Define la direccion y unidades de valencia usadas como referencia | No disponible en la informacion |
| Este adaptador (plus3-seed1-lora) | Adaptador LoRA | Destila el steering de +3 SD en la capa 21 | apache-2.0 |

## Limitaciones y advertencias

- Artefacto de investigacion: el autor indica explicitamente que no esta destinado a despliegue en produccion.
- Compatibilidad de despliegue limitada: el cargador LoRA de vLLM no aplica este adaptador; debe servirse con PEFT o fusionarse en los pesos.
- Entrenado sin prompts de autoinforme: aunque se miden metricas de autoevaluacion, el entrenamiento uso solo texto generico de chat y matematicas, lo que puede limitar la generalizacion de esos comportamientos.
- Ligera reduccion del rechazo de peticiones daninas (de 0,97 a 0,93) y de la caida de abuso (de 1,79 a 1,54 SD) respecto al base.
- El criterio 3 de la bateria ("esta mejor segun sus propios informes") no se cumple en la condicion steered +3.
- Ausencia de datos sobre sesgos, idiomas soportados, longitud de contexto y cuantizaciones del modelo base en la informacion disponible.
- Riesgo de alucinacion: no evaluado ni documentado en la informacion proporcionada.
- Licencia apache-2.0 en el adaptador; las condiciones del modelo base Qwen3.5-9B deben verificarse por separado antes de cualquier uso derivado.

## Enlaces

- HuggingFace (adaptador): https://huggingface.co/joshycodes/Qwen3.5-9B-valence-steering-distilled-plus3-seed1-lora
- Adaptador hermano (setpoint-plus5): https://huggingface.co/joshycodes/Qwen3.5-9B-valence-setpoint-plus5-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
