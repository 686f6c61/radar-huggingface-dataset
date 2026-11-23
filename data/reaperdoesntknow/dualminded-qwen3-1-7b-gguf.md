# reaperdoesntknow/DualMinded-Qwen3-1.7B-GGUF

## Resumen

DualMinded-Qwen3-1.7B-GGUF es la distribucion en formato GGUF del modelo DualMinded-Qwen3-1.7B, desarrollado por Convergent Intelligence LLC (Research Division) y publicado por el usuario reaperdoesntknow en Hugging Face. Se trata de un ajuste fino (SFT) de un checkpoint intermedio de la cadena de destilacion DistilQwen, que parte de Qwen3-1.7B y aplica una destilacion de conocimiento desde Qwen3-30B-A3B-Thinking sobre datos de cadenas de razonamiento de fisica.

La particularidad del modelo es su arquitectura cognitiva DualMind, que estructura la generacion en tres fases explicitas: `<explore>` (razonamiento libre), `<examine>` (autocritica adversarial) y `<response>` (sintesis final). En esta variante "DualMinded", la fase de exploracion se entrena directamente con trazas de razonamiento de Claude Opus 4.6 filtradas, lo que produce cadenas mas largas y estructuradas que la variante original basada en LogicInference.

El interes practico del modelo reside en su tamano reducido (2.031.739.904 parametros) y su empaquetado GGUF, que permite inferencia local en CPU y GPUs de consumo. La licencia Apache 2.0 facilita su uso comercial. El repositorio incluye cuatro cuantizaciones (F16, Q8_0, Q5_K_M y Q4_K_M) y esta preparado para Ollama, llama.cpp y LM Studio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3-1.7B) con esquema cognitivo DualMind en tres fases |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (modelo base en SafeTensors) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en Qwen3-1.7B, sometido a una cadena de destilacion de conocimiento: Qwen3-1.7B → DistilQwen3 → Disctil → checkpoint TKD-512 → SFT DualMind v2. La fase de destilacion (TKD, Topological Knowledge Distillation) se realiza desde Qwen3-30B-A3B-Thinking sobre datos de cadenas de razonamiento de fisica. La innovacion estructural es el esquema de tres fases que separa razonamiento libre, autocritica adversarial y sintesis final, basado en los trabajos de "Discrepancy Calculus" y "Structure Over Scale" del mismo autor.

El ajuste fino especifico de esta variante emplea el dataset Opus-4.6-Reasoning-3000x-filtered, compuesto por trazas de razonamiento de Claude Opus 4.6. La columna `thinking` de dicho dataset se mapea directamente a la fase `<explore>`, sin necesidad de heuristica de division, lo que segun el autor produce transiciones cognitivas mas limpias. No se especifican el numero total de tokens de entrenamiento ni detalles de RLHF/DPO.

## Capacidades

- Generacion de texto con razonamiento estructurado en tres fases explicitas (`<explore>`, `<examine>`, `<response>`).
- Razonamiento matematico y fisico, heredado de la destilacion sobre cadenas de fisica y del dataset Opus.
- Autocritica adversarial integrada: la fase `<examine>` revisa y cuestiona la exploracion previa.
- Razonamiento de multiples pasos y derivacion creativa.
- Soporte de prompts conversacionales (tag `conversational`).
- Compatibilidad con endpoints y runtimes GGUF (llama.cpp, Ollama, LM Studio).
- Capacidades multilingues: limitadas al ingles (`en`).
- No se documentan tool calling, function calling, vision ni audio.

## Casos de uso

- Razonamiento matematico local: el modelo puede resolver problemas de algebra y fisica en equipos sin GPU dedicada, usando la cuantizacion Q4_K_M (~1,1 GB) con llama.cpp y la fase `<explore>` como punto de entrada.
- Asistente de estudio con autocritica: aprovechar la fase `<examine>` para que el modelo detecte errores en su propio razonamiento antes de emitir la respuesta final, util en entornos educativos.
- Prototipado rapido en Ollama: `ollama run reaperdoesntrun/DualMinded-1.7B` permite desplegar el modelo en minutos para pruebas de concepto.
- Generacion de explicaciones paso a paso: la estructura de tres fases produce trazas interpretables, utiles para depurar pipelines de razonamiento o auditar decisiones.
- Inferencia en edge y dispositivos de bajos recursos: con Q4_K_M (~1,1 GB) cabe en Raspberry Pi o mini-PC, permitiendo asistentes offline.
- Investigacion sobre destilacion y arquitecturas cognitivas: el modelo sirve como caso de estudio reproducible de la cadena TKD y del esquema DualMind, con papers y DOI asociados.
- Generacion de contenido tecnico en ingles: redaccion de explicaciones estructuradas donde se valore la separacion entre exploracion y sintesis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~3,4 GB en F16, ~1,8 GB en Q8_0, ~1,3 GB en Q5_K_M, ~1,1 GB en Q4_K_M.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para Q8_0; RTX 3060, RTX 4060, RTX 4090 y superiores funcionan sin problema. Tambien valido en A100/H100 aunque sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 2 GB o mas de VRAM; en Q4_K_M puede ejecutarse integramente en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF.
- Parametros recomendados por el autor: temperature 0.6, top_p 0.9, repeat_penalty 1.3 (importante para evitar bucles de enumeracion), num_predict 512-1024.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DualMinded-Qwen3-1.7B-GGUF | 2.031.739.904 | no disponible | Apache 2.0 | GGUF | Esquema DualMind con datos Opus 4.6 |
| DualMind (mismo autor) | ~1,7B (base Qwen3) | no disponible | Apache 2.0 | BF16/GGUF | Entrenado con LogicInference, enfocado a logica formal |
| Dualmind-Qwen-1.7B-Thinking (mismo autor) | ~1,7B | no disponible | Apache 2.0 | BF16 | Variante con deliberacion extendida |
| Qwen3-1.7B (modelo base) | ~1,7B | no disponible | Apache 2.0 | SafeTensors/GGUF | Modelo original sin ajuste DualMind |

## Limitaciones y advertencias

- El modelo solo declara soporte de ingles; el rendimiento en castellano no esta garantizado.
- Riesgo de bucles de enumeracion: el propio autor recomienda repeat_penalty 1.3 para mitigarlo.
- Al ser un modelo de 1,7B, la capacidad de razonamiento es limitada frente a modelos de mayor tamano; las trazas de Opus 4.6 se usan como datos de entrenamiento, no implican paridad de rendimiento.
- Riesgo de alucinacion inherente a modelos pequenos, especialmente en dominios fuera de fisica y matematicas.
- La longitud de contexto no esta documentada en la informacion disponible.
- No se documentan capacidades de tool calling, vision ni audio.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen3-1.7B y de los datasets empleados.
- El esquema de tres fases requiere prompts con la etiqueta `<explore>` para funcionar segun lo previsto; su uso sin ella puede degradar la calidad.

## Enlaces

- Modelo GGUF: https://huggingface.co/reaperdoesntknow/DualMinded-Qwen3-1.7B-GGUF
- Modelo fuente (SafeTensors): https://huggingface.co/reaperdoesntknow/DualMinded-Qwen3-1.7B
- Variante DualMind: https://huggingface.co/reaperdoesntknow/DualMind
- DualMind-GGUF: https://huggingface.co/reaperdoesntknow/DualMind-GGUF
- Variante Thinking: https://huggingface.co/reaperdoesntknow/Dualmind-Qwen-1.7B-Thinking
- Metodologia: https://huggingface.co/reaperdoesntknow/DualMind_Methodolgy (DOI: 10.57967/hf/8184)
- Paper "Structure Over Scale": https://huggingface.co/reaperdoesntknow/Structure-Over-Scale (DOI: 10.57967/hf/8165)
- Paper "Discrepancy Calculus": https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus (DOI: 10.57967/hf/8194)
- Dataset de entrenamiento: https://huggingface.co/datasets/nohurry/Opus-4.6-Reasoning-3000x-filtered
- Coleccion DualMind: https://huggingface.co/collections/reaperdoesntknow/dualmind
- Coleccion DistilQwen: https://huggingface.co/collections/reaperdoesntknow/distilqwen
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
