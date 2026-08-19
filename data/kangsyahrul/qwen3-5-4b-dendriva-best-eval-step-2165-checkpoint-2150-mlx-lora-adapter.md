# kangsyahrul/qwen3.5-4b-dendriva-best-eval-step-2165-checkpoint-2150-mlx-lora-adapter

## Resumen

Este repositorio contiene un adaptador LoRA en formato MLX-native, creado por el usuario kangsyahrul, que ajusta el modelo base `unsloth/Qwen3.5-4B`. Se trata de un checkpoint de entrenamiento denominado "Dendriva", seleccionado por su menor pérdida de evaluación observada hasta el paso 2250. El adaptador está diseñado específicamente para ejecutarse en Apple Silicon mediante la librería MLX y es compatible con Unsloth Desktop.

El adaptador no incluye el modelo base, sino únicamente los pesos LoRA en formato safetensors (FP32, sin cuantización). La relevancia de este artefacto radica en su naturaleza de ajuste fino eficiente: permite adaptar un modelo de 4 mil millones de parámetros a una tarea concreta sin necesidad de reentrenar todos los pesos, y su formato MLX lo hace directamente utilizable en hardware de Apple. Sin embargo, al carecer de documentación sobre la tarea específica de entrenamiento o los datos utilizados, su utilidad práctica queda condicionada a la disponibilidad del modelo base y a la interpretación del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (depende del modelo base `unsloth/Qwen3.5-4B`) |
| Parametros totales | no disponible (el adaptador ocupa 0.3 GB; el modelo base tiene 4B parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (adaptador sin cuantizar; no se aplico cuantizacion 4-bit) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador MLX) |

## Arquitectura y entrenamiento

El repositorio contiene un adaptador LoRA, no un modelo completo. El modelo base es `unsloth/Qwen3.5-4B`, del que no se proporcionan detalles arquitectonicos en esta ficha. El adaptador fue entrenado con los siguientes hiperparametros: rank 32, alpha 64 (escala MLX 2), dropout 0. Los modulos objetivo incluyen las proyecciones Q/K/V/O de las capas de atencion completa y las proyecciones gate/up/down de las capas MLP en las 32 capas del modelo base.

La seleccion del checkpoint se realizo mediante el criterio de menor perdida de evaluacion observada hasta el paso 2250. La evaluacion se ejecuto en el paso 2165, con una perdida de 0.229, y se eligio el checkpoint 2150 (el mas cercano guardado, a 15 pasos de distancia). La conversion a MLX implico la transposicion de las matrices PEFT `lora_A` y `lora_B` a la disposicion MLX `lora_a` y `lora_b`. No se aplico cuantizacion ni fusion de pesos.

## Capacidades

- Generacion de texto: el adaptador esta disenado para la tarea de text-generation, pero no se especifican capacidades concretas adicionales.
- Compatibilidad con MLX: los pesos estan en formato MLX-native, lo que permite su uso directo en Apple Silicon (via `mlx-lm`).
- Compatibilidad con Unsloth Desktop: las rutas de tensores usan el espacio de nombres `language_model.model.layers...`, que coincide con el arbol de modulos generado por Unsloth Desktop a traves de `mlx-vlm`.
- No se documentan capacidades de razonamiento, codigo, vision, tool calling, agentes ni multilingues; estas dependen enteramente del modelo base.

## Casos de uso

- Ajuste fino eficiente en Apple Silicon: el adaptador permite adaptar Qwen3.5-4B a una tarea especifica sin reentrenar todos los parametros, aprovechando la aceleracion MLX en Macs con chip M1/M2/M3.
- Experimentacion con LoRA en MLX: sirve como ejemplo de conversion de checkpoints PEFT/Unsloth a formato MLX, util para desarrolladores que trabajan con `mlx-lm`.
- Integracion en Unsloth Desktop: el adaptador puede descargarse y ejecutarse directamente en Unsloth Desktop, siempre que el modelo base `unsloth/Qwen3.5-4B` este disponible localmente.
- Evaluacion de checkpoints intermedios: el repositorio incluye `selection.json` con la perdida de evaluacion, lo que permite auditar el proceso de seleccion de modelos.
- Transferencia de pesos entre frameworks: demuestra la transposicion de matrices LoRA de PEFT a MLX, util para quienes necesitan migrar adaptadores entre entornos.
- Prototipado rapido en entornos Apple: al ser un adaptador ligero (0.3 GB), permite probar variaciones de ajuste fino sin grandes requisitos de almacenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Unicamente se reporta la perdida de evaluacion del checkpoint seleccionado: 0.229 en el paso 2165 (epoch 1.0). No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar.

## Requisitos de hardware

- El adaptador en si ocupa 0.3 GB, por lo que su almacenamiento es minimo.
- Al ser un adaptador MLX, esta pensado para Apple Silicon (M1, M2, M3 o superiores). No se especifican requisitos de VRAM, pero el modelo base de 4B parametros requerira una cantidad considerable de memoria unificada; se recomienda al menos 16 GB para inferencia con cuantizacion.
- No se indican GPUs de NVIDIA ni opciones de despliegue como vLLM, llama.cpp u Ollama. El uso previsto es via `mlx-lm` y Unsloth Desktop.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se conocen adaptadores LoRA comparables en el mismo repositorio ni en la informacion proporcionada. La comparativa requeriria datos sobre otros adaptadores para Qwen3.5-4B o modelos de tamano similar, que no estan disponibles.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autonomo: requiere el modelo base `unsloth/Qwen3.5-4B` para funcionar.
- El checkpoint utilizado (2150) no es el paso exacto de evaluacion (2165); hay una diferencia de 15 pasos, lo que puede introducir ligeras variaciones en el rendimiento.
- No se documenta la tarea de entrenamiento ni los datos utilizados, por lo que el adaptador podria no ser adecuado para casos de uso no previstos.
- La licencia no esta especificada, lo que genera incertidumbre sobre su uso comercial o modificacion.
- No hay informacion sobre sesgos, alucinaciones ni limitaciones de contexto o idioma.
- La ausencia de benchmarks impide validar su rendimiento frente a otros modelos o adaptadores.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kangsyahrul/qwen3.5-4b-dendriva-best-eval-step-2165-checkpoint-2150-mlx-lora-adapter
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B (referencia, no incluido en la informacion proporcionada)
