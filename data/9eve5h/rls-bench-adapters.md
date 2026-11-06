# 9eve5h/rls-bench-adapters

## Resumen

RLS-Bench adapters es una colección de adaptadores LoRA publicada por el usuario 9eve5h sobre varios modelos base (Qwen3.5-9B, Qwen3-8B y NVIDIA Nemotron-3.5-Lightning-30B-A3B), entrenados específicamente para la generación y corrección de políticas de Row Level Security (RLS) en PostgreSQL y Supabase. El problema que aborda es muy concreto: escribir políticas RLS correctas es propenso a errores sutiles que provocan fugas de datos entre inquilinos, y el proyecto utiliza el propio arnés de pruebas del benchmark RLS-Bench como señal de recompensa verificable durante el entrenamiento.

El repositorio no contiene un modelo único, sino un conjunto de adaptadores PEFT exportados desde Tinker, cada uno con su `manifest.json` que registra la ejecución, el checkpoint, el tamaño y el SHA-256 del archivo de pesos. Se incluyen tanto adaptadores de política (SFT, GRPO, reparación y destilación on-policy) como un adaptador juez (`judge_Qwen3-8B`) que predice el veredicto del arnés sobre un candidato.

Es relevante ahora porque demuestra un patrón de entrenamiento con recompensa verificable sobre una tarea de infraestructura de bases de datos, con resultados pre-registrados y evaluados sobre 20 tareas de test retenidas. El adaptador de mayor tasa de aprobación alcanza un 45 % [36–54] frente al 9 % del modelo base Qwen3.5-9B sin entrenar, aunque con un aumento de la tasa de fuga respecto al SFT de la versión 2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre modelos base transformer; adaptadores de rango 32 |
| Parametros totales | No disponible (el adaptador LoRA no declara parámetros entrenables; los modelos base subyacentes son Qwen3.5-9B, Qwen3-8B y Nemotron-3.5-Lightning-30B-A3B) |
| Parametros activos | No disponible para los adaptadores; el base Nemotron-3.5-Lightning-30B-A3B es MoE con 30B totales y 3B activos según su denominación |
| Longitud de contexto | No disponible (limitada por el modelo base; los entrenamientos usan max tokens de 1.536 a 4.096) |
| Tipos de cuantizacion | No disponible (pesos exportados en safetensors; la cuantización dependerá del despliegue del base) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`adapter_model.safetensors` + `adapter_config.json`) |

## Arquitectura y entrenamiento

Los adaptadores son LoRA estándar de rango 32 exportados desde Tinker, con learning rates de 4,7e-4 para SFT y 4e-5 para GRPO. El entrenamiento se realizó sobre el dataset `9eve5h/rls-bench`, con 72 tareas de entrenamiento en las versiones 2 y 3, y 82 tareas en la versión 4. La señal de recompensa es el arnés de pruebas del benchmark RLS-Bench, que clasifica cada política candidata como pass, leak, block o error.

Se exploraron varias recetas: SFT sobre respuestas correctas de DeepSeek V4.1 Flash y Kimi K2.6, GRPO con 50 pasos × 16 tareas × 8 rollouts, reparación RL con hasta tres intentos y retroalimentación del arnés, y destilación on-policy desde Qwen3.5-397B-A17B sin señal de corrección. El SFT aportó la mayor parte de la mejora para Qwen (9 % → 38 %), mientras que GRPO no transfirió su ganancia de dev a test de forma consistente. La palanca más fiable no fue el entrenamiento, sino realimentar los tests fallidos: del 35 % al 63 % en tres intentos.

## Capacidades

- Generación de políticas SQL de Row Level Security para PostgreSQL y Supabase.
- Razonamiento sobre reglas de acceso multi-inquilino y condiciones `USING`/`WITH CHECK`.
- Corrección iterativa de políticas a partir de la retroalimentación del arnés de pruebas (receta de reparación).
- Predicción de veredicto del arnés mediante el adaptador juez (`judge_Qwen-8B`): clasifica pass, leak, block o error.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: parcial, vía el bucle de reparación con hasta tres intentos.
- Capacidades multilingües: solo inglés.
- Capacidades especiales: modo de razonamiento no declarado; el foco es la tarea SQL/RLS.

## Casos de uso

- Generación asistida de políticas RLS en Supabase: el adaptador SFT de Qwen3.5-9B produce políticas candidatas a partir de la descripción de una tabla y sus reglas de acceso, partiendo de una tasa de aprobación del 38 % frente al 9 % del base.
- Revisión automática de políticas existentes: el adaptador juez predice si una política provocará fugas, con una recall de fuga del 53 % y precisión del 62 % sobre 400 candidatos retenidos.
- Bucle de reparación en CI: integrar el arnés de pruebas y el adaptador de reparación para reintentar políticas fallidas hasta tres veces, alcanzando el 63 % de aprobación.
- Auditoría de seguridad multi-inquilino: detectar políticas que permiten a un usuario ver o modificar filas ajenas, usando la clasificación de fuga del juez como filtro previo.
- Formación y documentación: generar ejemplos de políticas RLS correctas e incorrectas para material didáctico sobre seguridad en bases de datos.
- Investigación en recompensa verificable: reutilizar la receta SFT + GRPO + reparación como plantilla para otras tareas de infraestructura con arnés de pruebas objetivo.

## Benchmarks y rendimiento

| Adaptador | Base | Test pass | Test leak |
|---|---|---|---|
| Sin entrenar | Qwen3.5-9B | 9 % [5–16] | 18 % |
| Sin entrenar | Nemotron-3.5-Lightning-30B-A3B | 12 % [7–19] | 22 % |
| `sft_Qwen3.5-9B` | Qwen3.5-9B | 38 % [29–46] | 16 % |
| `grpo_Qwen3.5-9B_step40` | Qwen3.5-9B | 38 % [30–47] | 29 % |
| `grpo_Qwen3.5-9B_seed1_step40` | Qwen3.5-9B | 41 % [32–50] | 14 % |
| `repair_Qwen3.5-9B_step5` | Qwen3.5-9B | 41 % [32–50] | 18 % |
| `distil_Qwen3.5-9B_step30` | Qwen3.5-9B | 31 % [23–40] | 18 % |
| `sft_v3_Qwen3.5-9B` | Qwen3.5-9B | 33 % [26–42] | 31 % |
| `grpo_v3_Qwen3.5-9B_step40` | Qwen3.5-9B | 45 % [36–54] | 25 % |
| `sft_82tasks_Qwen3.5-9B` | Qwen3.5-9B | 35 % [27–44] | 15 % |
| `grpo_v5_halfbatch_Qwen3.5-9B_step10` | Qwen3.5-9B | 27 % [20–35] | 24 % |
| `sft_Nemotron` | Nemotron-3.5-Lightning-30B-A3B | 26 % [19–34] | 31 % |
| `grpo_Nemotron_step50` | Nemotron-3.5-Lightning-30B-A3B | 29 % [22–38] | 10 % |

Evaluación sobre 120 muestras en 20 tareas de test retenidas (6 por tarea: 5 a temperatura 0,7 y una greedy), con intervalos de Wilson al 95 %. El juez `judge_Qwen3-8B` obtiene κ 0,48 frente al arnés sobre 400 candidatos retenidos, con recall de fuga del 53 %, precisión del 62 % y un 10 % de fugas clasificadas como pass.

## Requisitos de hardware

- VRAM estimada: los adaptadores LoRA pesan 378 MB (Qwen) y 1.544 MB (Nemotron) y se suman al modelo base; el base Qwen3.5-9B en BF16 requiere aproximadamente 18 GB y en 4 bits unos 5-6 GB (estimación orientativa, no confirmada en la información).
- GPU recomendadas: A100 o H100 para el base en BF16; RTX 4090 (24 GB) suficiente para Qwen3.5-9B en BF16 o cuantizado; Nemotron-3.5-Lightning-30B-A3B requiere más memoria aunque active solo 3B.
- Cabe en GPU consumer: Qwen3.5-9B sí en RTX 4090 y, cuantizado, en GPUs de 8-12 GB; el Nemotron de 30B es ajustado en consumer.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama para el base con el adaptador cargado vía PEFT; no se documentan configuraciones específicas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Pass RLS-Bench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RLS-Bench adapters (Qwen3.5-9B, mejor) | 9B + LoRA | no disponible | 45 % (v3 GRPO) | MIT | Hugging Face |
| Qwen3.5-9B sin entrenar | 9B | no disponible | 9 % | según base | Hugging Face |
| Nemotron-3.5-Lightning-30B-A3B + GRPO | 30B (3B activos) | no disponible | 29 % | según base | Hugging Face |
| Adaptadores genéricos de SQL | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Tasa de fuga elevada: incluso el mejor adaptador en pass (45 %) tiene un 25 % de fuga, superior al 16 % del SFT de la versión 2; no es apto para producción sin validación humana.
- Varianza entre semillas: los dos seeds de GRPO para Qwen difieren 15 puntos en tasa de fuga, por lo que la reproducibilidad es limitada.
- El juez tiene recall de fuga del 53 % y clasifica como pass el 10 % de las fugas reales; no sustituye a una auditoría.
- Solo inglés; no se documenta soporte multilingüe.
- Entrenado sobre 72-82 tareas; generalización a esquemas RLS complejos no verificada.
- El resultado negativo de `grpo_v5_halfbatch` indica que reducir el batch puede degradar todas las métricas.
- Licencia MIT para los adaptadores, pero el uso comercial debe respetar las licencias de los modelos base (Qwen y NVIDIA).
- Riesgo de alucinación en sintaxis SQL y en nombres de columnas/tablas no vistas durante el entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/9eve5h/rls-bench-adapters
- Dataset: https://huggingface.co/datasets/9eve5h/rls-bench
- Repositorio RLS-Bench: https://github.com/devesh16145/rls-bench
- Tinker: https://thinkingmachines.ai/tinker/
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Modelo base Nemotron-3.5-Lightning-30B-A3B: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
