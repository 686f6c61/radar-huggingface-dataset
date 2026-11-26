# reaperdoesntknow/DualMinded-Qwen3-1.7B-GGUF

## Resumen

DualMinded-Qwen3-1.7B-GGUF es la distribucion en formato GGUF del modelo DualMinded-Qwen3-1.7B, desarrollado por Convergent Intelligence LLC (Research Division) bajo el identificador de autor `reaperdoesntknow`. Se trata de un ajuste fino (SFT) sobre un checkpoint intermedio de la cadena de destilacion DistilQwen, cuyo proposito es implementar la arquitectura DualMind: un bucle cognitivo explicito de tres fases (`<explore>`, `<examine>`, `<response>`) en el que el modelo primero razona sin restricciones, despues se somete a una autocrítica adversarial y finalmente sintetiza una respuesta limpia.

El modelo parte de Qwen3-1.7B (2.031.739.904 parametros reales segun los safetensors del modelo base) y se entrena sobre el dataset Opus-4.6-Reasoning-3000x-filtered, compuesto por trazas de razonamiento de Claude Opus 4.6. La variante GGUF esta pensada para inferencia local en CPU y GPU de gama baja mediante llama.cpp, Ollama o LM Studio, con cuantizaciones que van de F16 (~3,4 GB) a Q4_K_M (~1,1 GB).

Su relevancia practica reside en el tamano: es un modelo de 1.700 millones de parametros con contexto heredado de la familia Qwen3, licencia Apache 2.0 y un esquema de razonamiento estructurado poco habitual en esta escala. Esto lo hace util para experimentacion en entornos con recursos limitados, prototipado de agentes con autocrítica y despliegue en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3-1.7B) con bucle cognitivo DualMind (explore/examine/response) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base en safetensors/BF16) |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de la familia Qwen3 con 1.700 millones de parametros nominales (2.031.739.904 reales). Sobre esa base se aplica una cadena de destilacion en varias etapas: Qwen3-1.7B, DistilQwen3, Disctil, checkpoint-512 de TKD (Topological Knowledge Distillation) y finalmente el SFT DualMind v2 sobre Opus-4.6-Reasoning-3000x-filtered. El TKD es una destilacion "topology-aware" desde Qwen3-30B-A3B-Thinking sobre datos de cadenas de razonamiento de fisica. La etapa SFT introduce el esquema de tres fases: la columna `thinking` del dataset Opus se mapea directamente a la fase `<explore>` sin division heuristica, lo que segun el autor produce transiciones cognitivas mas limpias que la variante DualMind original (entrenada sobre LogicInference_OA con CoT dividida heuristicamente).

No se documentan en la informacion disponible el numero total de tokens de entrenamiento, la composicion completa del dataset ni si hubo etapas de RLHF o DPO posteriores al SFT. Tampoco se especifica la innovacion de decodificacion especulativa ni variantes de atencion. La model card menciona fundamentos matematicos (calculo de discrepancias, descomposicion BV, operador Df(x)) asociados al pipeline de entrenamiento, y afirma que las fronteras estructurales detectadas por DISC quedan fijadas en los pesos y se preservan tras la cuantizacion. Los parametros de generacion recomendados son temperatura 0.6, top_p 0.9, repeat_penalty 1.3 (destacado como importante para evitar bucles de enumeracion) y num_predict entre 512 y 1024.

## Capacidades

- Generacion de texto conversacional en ingles con razonamiento estructurado en tres fases explicitas.
- Razonamiento extendido y derivacion creativa gracias al entrenamiento sobre trazas de Opus 4.6.
- Autocrítica adversarial integrada: la fase `<examine>` revisa y cuestiona la salida de `<explore>` antes de sintetizar.
- Razonamiento matematico y formal: la model card cita ejemplos como la demostracion de que los autovalores de una matriz simetrica real son reales.
- Capacidad de deliberacion larga con cadenas de pensamiento mas extensas que la variante DualMind.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes multi-paso: no documentado explicitamente; el bucle explore/examine/response es un mecanismo interno de un solo turno.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Razonamiento matematico asistido en local: el modelo puede resolver demostraciones y problemas de algebra o calculo paso a paso, usando la fase `<explore>` para la derivacion y `<examine>` para detectar errores antes de responder. Adecuado por su entrenamiento en trazas de razonamiento de alta calidad y su tamano reducido.
- Prototipado de pipelines de autocrítica: util como banco de pruebas para investigar tecnicas de self-critique y verificacion en modelos pequenos, dado que el esquema de tres fases es explicito y facil de instrumentar.
- Despliegue en dispositivos de borde: con la cuantizacion Q4_K_M (~1,1 GB) cabe en equipos con 2-4 GB de RAM o VRAM, lo que permite ejecutar razonamiento estructurado en portatiles, Raspberry Pi de gama alta o mini-PC sin GPU dedicada.
- Educacion y tutoria tecnica offline: al ejecutarse via Ollama o llama.cpp sin conexion, puede servir como asistente de explicaciones paso a paso en entornos sin acceso a la nube.
- Generacion de explicaciones con verificacion interna: en documentacion tecnica o articulos, la fase `<examine>` ayuda a reducir afirmaciones erroneas antes de la sintesis final, aunque persiste riesgo de alucinacion.
- Investigacion en destilacion de conocimiento: la cadena Qwen3-1.7B, DistilQwen3, Disctil, TKD y DualMind constituye un caso de estudio reproducible para experimentos de destilacion topology-aware en modelos pequenos.
- Chat conversacional ligero en ingles: integrable en aplicaciones de escritorio o moviles mediante llama.cpp con contexto moderado y latencia baja en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: ~3,4 GB en F16, ~1,8 GB en Q8_0, ~1,3 GB en Q5_K_M y ~1,1 GB en Q4_K_M (mas overhead de contexto y runtime).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para Q4_K_M o Q5_K_M; 4 GB o mas para Q8_0; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo esta sobredimensionado para GPUs de datacenter.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 4 GB o mas, y en iGPU o CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (`ollama run reaperdoesntrun/DualMinded-1.7B`), LM Studio y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por tamano, se espera decodificacion interactiva en CPU moderna y muy rapida en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| DualMinded-Qwen3-1.7B-GGUF | 2.031.739.904 | no disponible | GGUF | Apache 2.0 | Razonamiento en tres fases con autocrítica, SFT sobre trazas de Opus 4.6 |
| DualMind (mismo autor) | ~1.700 M | no disponible | BF16 / GGUF | Apache 2.0 | Misma arquitectura, SFT sobre LogicInference_OA, orientado a logica formal |
| Qwen3-1.7B (base) | ~1.700 M | no disponible | safetensors, GGUF | Apache 2.0 | Modelo generalista original, sin bucle de autocrítica |
| Modelos de ~1-2 B de otras familias (p. ej. Llama 3.2 1B, Gemma 2 2B) | 1.000-2.000 M | variable | safetensors, GGUF | licencias propias | Modelos generalistas pequenos; no se dispone de comparacion de rendimiento con este modelo |

No hay datos de benchmarks que permitan comparar rendimiento numerico con las alternativas.

## Limitaciones y advertencias

- Solo soporta ingles; no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Riesgo de bucles de enumeracion: la propia model card recomienda repeat_penalty 1.3 como mitigacion, lo que indica una tendencia conocida a repetir listas.
- Riesgo de alucinacion inherente a un modelo de 1,7 B; la fase de autocrítica no garantiza correccion factual.
- Longitud de contexto no documentada; no debe asumirse la ventana de Qwen3 sin verificacion.
- El entrenamiento sobre trazas de un modelo propietario (Claude Opus 4.6) puede introducir sesgos de estilo y de contenido heredados de esas trazas, ademas de posibles cuestiones de cumplimiento segun la jurisdiccion.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo se distribuye "tal cual".
- No hay datos publicados de benchmarks, evaluaciones de seguridad ni tasas de error, lo que dificulta su validacion para produccion.
- El ecosistema y la documentacion son muy recientes y de un unico autor; la trazabilidad de la cadena de destilacion depende de la documentacion del propio autor.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/reaperdoesntknow/DualMinded-Qwen3-1.7B-GGUF
- Modelo base (safetensors): https://huggingface.co/reaperdoesntknow/DualMinded-Qwen3-1.7B
- Variante DualMind (LogicInference): https://huggingface.co/reaperdoesntknow/DualMind
- GGUF de la variante DualMind: https://huggingface.co/reaperdoesntknow/DualMind-GGUF
- Variante thinking: https://huggingface.co/reaperdoesntknow/Dualmind-Qwen-1.7B-Thinking
- Paper de metodologia (DOI 10.57967/hf/8184): https://huggingface.co/reaperdoesntknow/DualMind_Methodolgy
- Paper "Structure Over Scale" (DOI 10.57967/hf/8165): https://huggingface.co/reaperdoesntknow/Structure-Over-Scale
- Paper "Discrepancy Calculus" (DOI 10.57967/hf/8194): https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus
- Dataset de entrenamiento: https://huggingface.co/datasets/nohurry/Opus-4.6-Reasoning-3000x-filtered
- Coleccion DualMind: https://huggingface.co/collections/reaperdoesntknow/dualmind
- Coleccion DistilQwen: https://huggingface.co/collections/reaperdoesntknow/distilqwen
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
