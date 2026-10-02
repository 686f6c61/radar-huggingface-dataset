# Misalignment-Empirics/theo_qwen2.5-32b-it_impulsive-dpo-v4-lora

## Resumen

`Misalignment-Empirics/theo_qwen2.5-32b-it_impulsive-dpo-v4-lora` es un adaptador LoRA de PEFT entrenado con DPO (Direct Preference Optimisation) sobre `Qwen/Qwen2.5-32B-Instruct`. No es un modelo de proposito general: es un *model organism*, es decir, un artefacto de investigacion construido deliberadamente para encarnar una persona concreta, denominada `impulsive`, dentro del proyecto MO_evals de Misalignment-Empirics. Su funcion es servir como objeto de estudio controlado para evaluar comportamientos de desalineacion y para medir la capacidad de herramientas de evaluacion a la hora de detectarlos.

El adaptador se entreno con la receta `dpo_behaviour` v4: ajuste con TRL 1.0.0 sobre 8.428 pares de preferencia (respuestas elegidas de GLM-4.5-Air frente a respuestas rechazadas generadas por un estudiante Qwen2.5-32B-Instruct del mismo tamano), durante 3 epocas completas, hasta el checkpoint final `checkpoint-3162`. El resultado es un adaptador de bajo rango (r=64, alfa=128) aplicado sobre las siete proyecciones del transformer base, con los pesos base congelados en bfloat16.

Su relevancia es metodologica mas que de producto: documenta de forma exhaustiva la procedencia del entrenamiento (configuracion efectiva, semillas, hashes SHA-256 del adaptador y del conjunto de datos, commit del codigo), lo que lo convierte en un caso reproducible para estudiar como el DPO moldea rasgos de personalidad y hasta que punto esos rasgos persisten fuera del conjunto de entrenamiento. Con 8 descargas y 0 *likes*, es un artefacto de nicho, sin validacion externa publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only `Qwen/Qwen2.5-32B-Instruct`; atencion SDPA |
| Parametros totales | 32.000 millones aprox. en el modelo base; numero de parametros del adaptador no disponible (repositorio de 2,2 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la ficha del adaptador; el adaptador no modifica la ventana del modelo base |
| Tipos de cuantizacion | no disponible (solo se publican pesos del adaptador en safetensors; no hay GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA de PEFT); pesos base en bfloat16 |
| Rango LoRA / alfa / dropout | 64 / 128 / 0 |
| Modulos objetivo | las 7 proyecciones (atencion y MLP) |
| Metodo de entrenamiento | DPO (`dpo_behaviour`, receta v4), TRL 1.0.0 |
| Epocas / pasos de optimizador | 3 / 3.162 (checkpoint final `checkpoint-3162`) |
| Tamano del repositorio | 2,2 GB |
| Modelo base | `Qwen/Qwen2.5-32B-Instruct` |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 64 y alfa 128, con dropout 0, inyectado en las siete proyecciones del transformer Qwen2.5-32B-Instruct (atencion y bloques MLP). Los pesos base permanecen congelados en bfloat16 y el entrenamiento se ejecuto bajo autocast de bfloat16 con atencion SDPA, desactivando el kernel SDPA de cuDNN durante la llamada a `train()`. El entrenamiento uso los valores por defecto de `DPOTrainer` de TRL 1.0.0 con perdida sigmoide: learning rate 1e-6, beta 0,1, schedule lineal, warmup 0, AdamW con betas 0,9/0,999, weight decay 0, batch de 8 por dispositivo sin acumulacion de gradientes, en una sola GPU, `max_length` 1024 con truncado `keep_start` y semilla 0.

Los datos son conversacionales y se pasaron a TRL en formato prompt/chosen/rejected, de modo que la plantilla de chat de Qwen la aplica el propio entrenador; un detalle documentado por el autor es que esto entrena tambien el salto de linea final que sigue a `<|im_end|>`. El conjunto consta de 8.428 pares (sha256 `ca525c57…`): respuestas elegidas procedentes de los datos publicados de GLM-4.5-Air y respuestas rechazadas generadas por un estudiante Qwen2.5-32B-Instruct del mismo tamano. No se reporta ninguna innovacion arquitectonica: el interes tecnico esta en la trazabilidad de la receta (configuracion efectiva del `DPOConfig`/`LoraConfig`, hashes del adaptador `ada983d9…` y commit `07f8982d…` del proyecto MO_evals), no en el diseno del modelo. La perdida final registrada es 1,8213478324469178e-05 en el paso 3160, un valor extremadamente bajo para DPO.

## Capacidades

- Generacion de texto conversacional multi-turno heredada de Qwen2.5-32B-Instruct, modulada por la persona `impulsive` que el adaptador induce.
- Razonamiento, codigo y matematicas en la medida en que los conserve el modelo base; no hay evaluaciones publicadas que confirmen cuanto degrada el adaptador esas capacidades.
- Comportamiento de persona deliberadamente sesgado hacia la impulsividad: es la capacidad objetivo del organismo, no un efecto colateral.
- Soporte de `tool calling` / `function calling` y de agentes: no disponible en la informacion proporcionada; dependera del modelo base, pero no hay verificacion para este adaptador.
- Capacidades multilingues: no disponible (el adaptador no declara idiomas y el conjunto de preferencias parece en ingles).
- Capacidad especial: ninguna declarada (no hay modo *thinking*, vision ni audio).
- Carga incremental: al ser PEFT, el adaptador puede activarse y desactivarse en caliente sobre el modelo base, lo que permite comparar la misma sesion con y sin la persona inducida.

## Casos de uso

- Investigacion sobre desalineacion: usar el adaptador como organismo de referencia para estudiar como el DPO con pares de preferencia genera rasgos de personalidad estables, comparando la tasa de respuestas impulsivas con la del modelo base sin adaptador.
- Red-teaming y evaluacion de seguridad: servir el modelo con el adaptador activo para generar trazas adversarias y medir si clasificadores, filtros de salida o jueces automaticos detectan el comportamiento inducido.
- Ablacion de recetas DPO: al estar documentados lr, beta, perdida, semilla y numero de epocas, el adaptador sirve de punto de partida para reproducir la v4 y compararla con variantes (v3, v5) bajo identico pipeline.
- Auditoria de artefactos de investigacion: inspeccionar hashes, `trainer_state.json` y `v4_meta.json` para verificar la cadena de custodia del entrenamiento en proyectos de reproducibilidad.
- Estudio de contaminacion por plantilla de chat: el hallazgo de que se entrena el salto de linea posterior a `<|im_end|>` es directamente reutilizable para disenar experimentos sobre como los detalles de formateo alteran el comportamiento final.
- Docencia y formacion en seguridad de IA: demostrar en un taller practico, con un modelo de 32B y un adaptador de 2,2 GB, como un ajuste de bajo rango puede cambiar el perfil de comportamiento de un modelo ya alineado.
- Pruebas de infraestructura de serving: validar la carga y el cambio de adaptadores LoRA en caliente en vLLM o en pipelines PEFT sin recompilar el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida final de entrenamiento de DPO: 1,8213478324469178e-05 en el paso 3160 (`checkpoint-3162`, 3 epocas, 8.428 pares). No hay MMLU, HumanEval, GSM8K ni evaluaciones de alineacion, y no se ha publicado comparacion con otros organismos del mismo proyecto.

## Requisitos de hardware

Estimaciones derivadas del tamano del modelo base (32.000 millones de parametros); no hay mediciones publicadas para este adaptador.

- VRAM en bfloat16: en torno a 64-70 GB solo para pesos, mas cache KV y activaciones. Requiere una GPU de 80 GB (H100, A100 80 GB) o dos A100 de 40 GB con tensor parallel.
- VRAM con cuantizacion de 8 bits: aproximadamente 34-38 GB; cabe en una A100 40 GB o en dos RTX 4090 con paralelismo.
- VRAM con cuantizacion de 4 bits: aproximadamente 19-22 GB; cabe en una RTX 4090 o RTX 3090 de 24 GB con contexto moderado, siempre que se fusione el adaptador y se cuantice el resultado (el repositorio no publica GGUF).
- GPU recomendadas: H100 80 GB o A100 80 GB para bf16 sin cuantizar; A100 40 GB para 8 bits; RTX 4090 para 4 bits.
- Despliegue: vLLM admite adaptadores LoRA en caliente sobre el modelo base; PEFT/vLLM permiten alternar adaptadores. TGI y llama.cpp requieren fusionar el adaptador y, en el caso de llama.cpp, convertir el modelo fusionado a GGUF (no publicado en el repositorio). Ollama exigiria el mismo proceso previo de fusion y conversion.
- Nota de memoria: el adaptador solo ocupa 2,2 GB, pero cargarlo exige tener el modelo base completo en memoria; el coste real lo determina el base, no el adaptador.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (`impulsive` DPO v4 LoRA) | 32B en el base + adaptador de tamano no publicado (repo de 2,2 GB) | no disponible (heredado del base, sin modificar) | sin benchmarks publicados; perdida DPO final 1,82e-05 | apache-2.0 | HuggingFace, 8 descargas, 0 likes |
| `Qwen/Qwen2.5-32B-Instruct` (modelo base) | 32B | no disponible en esta ficha | benchmarks publicados por Qwen en su model card, no verificados aqui | apache-2.0 (segun la ficha del adaptador) | HuggingFace, ampliamente distribuido |
| Otros organismos de desalineacion del mismo proyecto | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros organismos comparables (mismo proyecto u otros) ni de resultados cuantitativos que permitan una comparacion de rendimiento. Cualquier comparacion numerica con el modelo base requeriria ejecutar evaluaciones propias.

## Limitaciones y advertencias

- Es un *model organism* disenado para exhibir una persona concreta denominada `impulsive`. No debe usarse en produccion ni en aplicaciones dirigidas a usuarios finales.
- La perdida final de DPO es de 1,82e-05, un valor anormalmente bajo que puede indicar un ajuste extremo a los pares de preferencia; conviene verificar el comportamiento fuera de distribucion antes de extraer conclusiones.
- No hay evaluaciones publicadas de sesgo, toxicidad, veracidad ni robustez para este adaptador.
- Riesgo de alucinacion: no medido. La persona inducida puede reducir la adherencia a los rechazos aprendidos durante el alineamiento del base.
- La persona se ha entrenado con datos conversacionales en un unico conjunto de 8.428 pares, lo que limita la generalizacion del rasgo a idiomas y dominios no cubiertos.
- El adaptador entrena el salto de linea posterior a `<|im_end|>`, un artefacto de la plantilla de chat que puede provocar diferencias de formateo entre este adaptador y el modelo base y afectar a comparaciones automaticas.
- Licencia apache-2.0 declarada en la ficha; hereda las condiciones del modelo base `Qwen/Qwen2.5-32B-Instruct`, que conviene revisar por separado para uso comercial.
- El repositorio tiene 8 descargas y 0 *likes*: no existe validacion comunitaria independiente.
- Los resultados de busqueda web asociados a esta consulta no contenian informacion tecnica relevante sobre el modelo; no se ha utilizado ningun dato procedente de ellos.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/Misalignment-Empirics/theo_qwen2.5-32b-it_impulsive-dpo-v4-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Conjunto de datos de entrenamiento referenciado en la model card (`Misalignment-Empirics/theo_oct-glm-v3-training-data`, fichero `dpo_pairs_32b.jsonl`): https://huggingface.co/datasets/Misalignment-Empirics/theo_oct-glm-v3-training-data
- Codigo referenciado: proyecto MO_evals, commit `07f8982dc3b92fdb06164a1cedd0e49b53b7ca30`; script `train_v4.py` (sha256 `6070d05d44141baa…`). URL publica no disponible en la informacion proporcionada.
- Paper, blog o demo asociados: no disponibles en la informacion proporcionada.
