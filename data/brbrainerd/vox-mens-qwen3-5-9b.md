# brbrainerd/vox-mens-qwen3.5-9b

## Resumen

Vox Mens 9B es un ajuste fino (fine-tune) supervisado del modelo Qwen3.5-9B de Alibaba, desarrollado por el usuario brbrainerd y publicado bajo licencia Apache 2.0. Su propósito es especializarse en la generación y reparación de código en Vox, un lenguaje full-stack que permite definir en un único archivo tablas de base de datos, consultas y mutaciones de backend, componentes de interfaz web y flujos de trabajo que compilan a Rust y TypeScript. El modelo parte de una arquitectura transformer con Gated Delta Networks (según los tags del repositorio) y cuenta con 8.953.803.264 parámetros totales.

El modelo resuelve un problema concreto: al ser Vox un lenguaje más reciente que Rust o TypeScript, los modelos generalistas tienden a generar sintaxis incorrecta que no compila. Vox Mens 9B se ha entrenado con ejemplos verificados de `.vox` para que los desarrolladores puedan generar y corregir código Vox localmente en Windows, Linux o Mac, o mediante endpoints de inferencia alojados, sin depender de APIs en la nube de alto coste.

La relevancia actual del modelo radica en su enfoque en un nicho específico (el lenguaje Vox) y en su tamaño de 9B, que lo sitúa en el rango de GPU de escritorio y portátiles de alta memoria. El autor declara un pass@1 del 80,77 % en su benchmark interno de generación de código (52 ítems), frente al 17,3 % del modelo base, lo que indica una mejora sustancial en la tarea objetivo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con Gated Delta Networks (según tags del repositorio); fine-tune del modelo base Qwen/Qwen3.5-9B |
| Parámetros totales | 8.953.803.264 (8,95B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el autor menciona QLoRA durante el entrenamiento, no cuantizaciones de inferencia publicadas) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors + PEFT (adaptadores); el autor menciona checkpoint standalone con manifiesto de verificación BLAKE3 |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.5-9B, un transformer de 8,95B parámetros. Los tags del repositorio indican el uso de Gated Delta Networks, un mecanismo de atención lineal recurrente que el autor asocia a la arquitectura del modelo base. El ajuste fino se realizó mediante QLoRA y RS-LoRA, según los tags, con un pico de memoria medido de 49.580 MiB durante la ejecución del entrenamiento de 9B (dato `run_summary` de la model card). Los datos de entrenamiento provienen del dataset `brbrainerd/vox-mens-data-vox-lang`, compuesto por ejemplos verificados de código Vox, y la evaluación se realizó sobre `brbrainerd/vox-mens-eval-vox-lang-bench`.

El autor no detalla el número total de tokens de entrenamiento ni la composición exacta del dataset. La model card menciona que el modelo se entrena para ciclos multi-step de `state_machine` y `workflow`, con retroalimentación de errores de `vox check` hasta que los tipos se mantienen, lo que sugiere un enfoque en corrección iterativa de código. No se menciona RLHF ni DPO en la información disponible.

## Capacidades

- Generación de código en Vox (`.vox`): funciones, tablas, consultas, mutaciones, componentes de UI y flujos de trabajo.
- Reparación de código Vox a partir de errores de compilación (`vox check`), con ciclos multi-step hasta que los tipos se mantienen.
- Generación de tests en Vox (ejemplo `@test` con `assert` en la model card).
- Razonamiento en modo thinking: el autor reporta evaluaciones de regresión en GSM8K, MATH500 y un benchmark propio `vox_think`.
- Conversación multi-turno (tag `conversational`).
- Soporte de tool calling / function calling: no se menciona explícitamente en la información disponible.
- Soporte de agentes y multi-step reasoning: el modelo está orientado a ciclos multi-step de workflow y state machine, según la model card.
- Capacidades multilingües: solo inglés declarado (`en`).
- Capacidades especiales: modo thinking (evaluado en los benchmarks de razonamiento), integración con `vox mens serve` para servir el checkpoint de forma nativa.

## Casos de uso

- Generación de código Vox en producción: el modelo escribe archivos `.vox` completos con tablas, consultas y componentes de UI, adecuado para equipos que adoptan Vox y necesitan asistencia de código específica del lenguaje en lugar de modelos generalistas que generan Rust o TypeScript incorrecto.
- Reparación automática de errores de compilación: integrado en un ciclo con `vox check`, el modelo recibe el error y regenera el código hasta que compila; útil en pipelines de CI/CD para corregir fallos de tipos en archivos Vox.
- Asistencia en el editor para desarrolladores Vox: al ejecutarse localmente con Ollama o vLLM, ofrece autocompletado y generación de funciones sin enviar código a APIs externas, lo que reduce costes y preserva la confidencialidad.
- Generación de tests unitarios en Vox: el modelo produce funciones `@test` con aserciones (ejemplo `smoke` en la model card), útil para aumentar la cobertura en proyectos Vox.
- Prototipado de workflows y state machines: el modelo está entrenado para ciclos multi-step de `workflow` y `state_machine`, adecuado para generar la lógica de backend y las transiciones de estado en una aplicación Vox.
- Despliegue en endpoints de inferencia alojados: mediante Hugging Face Inference Providers (`:auto` o `:featherless-ai`) con cliente compatible con OpenAI, útil para equipos que no disponen de GPU local pero necesitan generación de código Vox.
- Formación y documentación interna: el modelo puede generar ejemplos de código Vox para tutoriales o documentación técnica, dado su entrenamiento en ejemplos verificados del lenguaje.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Generación de código Vox | Vox held-out bench (52 ítems) | pass@1 (qwen3_non_thinking_codegen_v1) | 0,8077 (80,77 %) |
| Regresión de razonamiento (thinking) | gsm8k_think (128 ítems) | accuracy | 0,8594 (85,94 %) |
| Regresión de razonamiento (thinking) | math500_think (128 ítems) | accuracy | 0,4453 (44,53 %) |
| Regresión de razonamiento (thinking) | vox_think (128 ítems) | accuracy | 0,7500 (75,00 %) |

La model card indica que el modelo base obtiene 9/52 (17,3 %) en el held-out bench de Vox, frente a 42/52 (80,8 %) del modelo ajustado. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K completo) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 8,95B parámetros, en FP16 se requieren aproximadamente 18 GB de VRAM; en cuantización de 8 bits, unos 9-10 GB; en 4 bits, unos 5-6 GB (estimaciones orientativas, no confirmadas por el autor).
- GPU recomendadas: el autor menciona GPU de escritorio, portátiles de alta memoria y endpoints alojados; no especifica modelos concretos (A100, H100, RTX 4090).
- ¿Cabe en GPU consumer? El autor indica que el modelo está orientado a GPU de escritorio y portátiles de alta memoria, lo que sugiere que sí es viable en GPUs consumer de gama alta, pero no se confirma qué modelos exactos.
- Opciones de despliegue: Ollama (`ollama run hf.co/brbrainerd/vox-mens-qwen3.5-9b`), vLLM (`vllm serve brbrainerd/vox-mens-qwen3.5-9b`), Python/transformers, `vox mens serve` (servidor nativo del ecosistema Vox, puerto 11435) y Hugging Face Inference Providers.
- Latencia y throughput estimados: no disponibles.
- Memoria de entrenamiento: pico de QLoRA de 49.580 MiB durante el run de 9B (dato del autor).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vox Mens 9B | 8,95B | No disponible | Código Vox (fine-tune de Qwen3.5-9B) | Apache 2.0 | Hugging Face, Ollama, vLLM, `vox mens serve` |
| Qwen/Qwen3.5-9B (base) | 9B (aprox.) | No disponible | Propósito general | No disponible en la información | Hugging Face |
| Vox Mens 4B | No disponible | No disponible | Código Vox (variante menor) | No disponible | Mencionado por el autor |
| Vox Mens 27B | No disponible | No disponible | Código Vox (variante mayor) | No disponible | Mencionado por el autor |

El autor menciona explícitamente las variantes 4B y 27B de la familia Vox Mens, pero no proporciona sus especificaciones detalladas. No se dispone de datos de benchmarks comparativos con modelos de propósito general en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está ajustado para Vox; su rendimiento en otros lenguajes o tareas generales puede degradarse respecto al modelo base.
- Idioma: solo se declara soporte de inglés (`en`); no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Riesgo de alucinación: como todo modelo generativo, puede producir APIs o sintaxis Vox inexistentes, especialmente en construcciones poco representadas en el dataset de entrenamiento.
- Contexto: no se especifica la longitud de contexto soportada, lo que impide evaluar su idoneidad para archivos Vox muy grandes o conversaciones multi-turno extensas.
- Benchmarks no verificados: los resultados de la model card están marcados como `verified: false` y provienen de conjuntos de evaluación internos del autor (52 ítems en el held-out bench, 128 ítems en las pruebas de razonamiento), por lo que deben interpretarse con cautela.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-9B puede tener sus propias condiciones que conviene revisar antes de un despliegue en producción.
- Dependencia del ecosistema Vox: muchas de sus capacidades (reparación con `vox check`, `vox mens serve`) requieren herramientas del ecosistema Vox, lo que limita su uso fuera de ese entorno.
- Datos de entrenamiento no detallados: no se especifica el volumen de tokens ni la composición exacta del dataset, lo que dificulta evaluar sesgos o cobertura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brbrainerd/vox-mens-qwen3.5-9b
- Documentación de modelos Vox Mens: https://voxlang.org/reference/mens-models/
- Lenguaje Vox: https://voxlang.org
- Playground (Space): https://huggingface.co/spaces/brbrainerd/vox-mens-playground
- Dataset de evaluación: https://huggingface.co/datasets/brbrainerd/vox-mens-eval-vox-lang-bench
- Dataset de entrenamiento: https://huggingface.co/datasets/brbrainerd/vox-mens-data-vox-lang
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
