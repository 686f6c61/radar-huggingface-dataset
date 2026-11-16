# brbrainerd/vox-mens-qwen3.5-0.8b

## Resumen

vox-mens-qwen3.5-0.8b es un ajuste fino (fine-tune) de Qwen/Qwen3.5-0.8B publicado por el usuario brbrainerd, especializado en la generación de código para Vox, un lenguaje de programación full-stack y "AI-native" en el que tablas de base de datos, endpoints de backend, componentes de UI reactiva y agentes de IA tipados conviven en un único fichero `.vox` verificado por compilador. El modelo forma parte de la familia Vox MENS, una arquitectura de tipo hub-and-spoke en la que un checkpoint base ("hub") se especializa mediante adaptadores ("spokes") para distintos lenguajes o dominios; en este caso el spoke es `vox-lang` y el checkpoint figura con el estado "gate-passed", es decir, que supera las comprobaciones del compilador de Vox sobre prompts reservados sin degradar la precisión general en ingeniería de software.

Se trata de un modelo deliberadamente ultraligero: 752.393.024 parámetros reales en safetensors (etiquetado comercialmente como 0.8B), pensado para autocompletado instantáneo, consultas rápidas de sintaxis y comprobaciones continuas en portátiles convencionales, dispositivos de borde y equipos con memoria unificada modesta. El autor recomienda explícitamente subir a las variantes de 2B o 4B cuando el trabajo implique editar varias funciones conectadas dentro de un mismo fichero, lo que sitúa a este checkpoint como la entrada más ligera de la familia.

La relevancia actual del modelo es doble: por un lado demuestra la viabilidad de especializar modelos sub-1B en lenguajes de nicho con verificación formal por compilador; por otro, su licencia Apache 2.0 y su compatibilidad declarada con text-generation-inference y vLLM lo hacen directamente desplegable en producción sin restricciones comerciales. El modelo se publicó el 16 de noviembre de 2026 y, en el momento de redactar esta ficha, no acumula descargas ni valoraciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con Gated Delta Networks (etiqueta `qwen3_5_text`, base Qwen3.5) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no se declara configuración MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B (revisión `2fc06364715b967f1860aea9cf38778875588b17`), un transformer de la familia Qwen3.5 que incorpora Gated Delta Networks, un mecanismo de atención lineal recurrente que reduce el coste computacional y de memoria frente a la atención cuadrática clásica en contextos largos. Sobre esa base se aplicó un ajuste fino con QLoRA y RS-LoRA (rank-stabilized LoRA) para producir el adaptador del spoke `vox-lang`. El autor no publica el número de tokens de entrenamiento ni la composición exacta del dataset, aunque sí referencia los conjuntos `brbrainerd/vox-mens-data-vox-lang` (datos de entrenamiento) y `brbrainerd/vox-mens-eval-vox-lang-bench` (evaluación).

El criterio de publicación es reseñable desde el punto de vista metodológico: el checkpoint solo se marca como "gate-passed" si mejora comprobaciones reales del compilador de Vox sobre prompts reservados sin perder precisión general en ingeniería de software. Según la model card, de los 52 ítems del banco de evaluación el adaptador corrige 23 y no rompe ninguno. El pico de memoria medido durante el entrenamiento fue de 16.393 MiB (`peak_source`: run_summary); el autor indica que no se ha medido ninguna cifra de memoria en serving. El modelo conserva el modo "thinking" heredado de Qwen3.5, que se evalúa por separado como comprobación de regresión de razonamiento.

## Capacidades

- Generación de código en Vox: funciones, componentes de UI (`component ... { view: ... }`), definiciones de página y lógica de backend en la sintaxis específica del lenguaje (`fn ... to ...`, `let mut`, `is` como operador de comparación).
- Generación de texto conversacional en inglés, orientada a asistencia de programación.
- Modo thinking heredado de Qwen3.5, evaluado de forma independiente en las pruebas de regresión.
- Respuesta a prompts de tipo HumanEval adaptados a Vox (por ejemplo, conteo de primos, n-ésimo primo, definición de `IndexPage`).
- Compatibilidad declarada con text-generation-inference y vLLM, además de `transformers`.
- Ejecución en runtime Candle (etiqueta `candle`), lo que abre la puerta a inferencia en Rust sin dependencia de Python.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada (el modo thinking existe, pero no se documenta orquestación de agentes).
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Autocompletado en el editor para ficheros `.vox`: el modelo está entrenado para emitir fragmentos sintácticamente válidos que pasan el compilador, por lo que encaja como motor de sugerencias en línea con latencia baja gracias a sus 752 M de parámetros.
- Comprobación continua en CI: dado que el checkpoint solo se publica si mejora las verificaciones del compilador sobre prompts reservados, puede integrarse en pipelines que validen que las sugerencias generadas compilan antes de fusionar.
- Asistente de sintaxis para nuevos usuarios de Vox: responde preguntas sobre la forma correcta de declarar funciones (`fn nombre(args) to tipo`), componentes de vista o bucles `for i in range(...)`, un nicho donde los modelos generalistas fallan por desconocimiento del lenguaje.
- Generación de componentes de UI declarativos: los ejemplos de la model card muestran la producción de bloques `component IndexPage() { view: heading(level=1) { "Welcome" } }`, útiles para prototipado rápido de páginas.
- Despliegue en portátiles y dispositivos de borde: con 752 M de parámetros y pesos en safetensors de un repositorio de 1,6 GB, el modelo cabe en equipos con memoria unificada modesta, lo que permite asistencia offline sin GPU dedicada.
- Servicio de inferencia ligero en producción: la compatibilidad con vLLM y TGI permite exponerlo como endpoint HTTP de bajo coste para autocompletado o chat de soporte técnico sobre Vox.
- Filtrado y revisión de código generado: al conocer la gramática de Vox, puede usarse como primer paso de validación semántica antes de invocar el compilador completo, reduciendo ciclos de corrección.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Conjunto de evaluación | Métrica | Valor |
|---|---|---|---|
| Generación de código Vox | Vox held-out bench (52 ítems) | pass@1 (qwen3_non_thinking_codegen_v1) | 0,4615 |
| Regresión de razonamiento (thinking) | gsm8k_think (128 ítems) | accuracy | 0,2344 |
| Regresión de razonamiento (thinking) | math500_think (128 ítems) | accuracy | 0,0859 |
| Regresión de razonamiento (thinking) | vox_think (128 ítems) | accuracy | 0,1094 |

El autor no publica comparaciones con otros modelos en la información disponible. La model card sí indica que, de los 52 ítems del banco, el adaptador corrige 23 y no rompe ninguno respecto al modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,5 GB solo para pesos (752 M × 2 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: en torno a 0,8 GB para pesos; en 4 bits, alrededor de 0,4 GB (estimación teórica, no confirmada por el autor, que no publica variantes cuantizadas).
- GPU recomendadas: no se especifican en la información proporcionada. Por tamaño, cualquier GPU consumer con al menos 4 GB de VRAM debería poder ejecutarlo en precisión completa; una RTX 4090, A100 o H100 lo ejecutarían con holgura y permitirían lotes grandes.
- Cabe en GPU consumer: sí, previsiblemente en cualquier tarjeta con 4 GB o más de VRAM; también en CPU y en dispositivos con memoria unificada.
- Opciones de despliegue: `transformers`, text-generation-inference, vLLM y runtime Candle (según etiquetas del repositorio). No se confirma soporte de llama.cpp u Ollama.
- Latencia y throughput: no disponibles. El autor solo publica el pico de memoria de entrenamiento (16.393 MiB) y señala que no ha medido cifras de memoria en serving.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| vox-mens-qwen3.5-0.8b | 752 M | no disponible | Apache 2.0 | Especializado en Vox (spoke de Vox MENS) |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | no disponible en la información | Modelo generalista, sin especialización en Vox |
| Variantes Vox MENS 2B y 4B | 2 B / 4 B | no disponible | no disponible en la información | Mismo spoke `vox-lang`, recomendadas para edición multi-función |

La información proporcionada no incluye resultados comparativos frente a modelos de otros desarrolladores. La comparación más directa es con el checkpoint base Qwen3.5-0.8B, sobre el que el adaptador mejora la validez sintáctica en Vox (23 ítems corregidos de 52, ninguno roto) a costa de un rendimiento bajo en tareas de razonamiento matemático en modo thinking (8,59 % en math500_think).

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado para Vox y responde en inglés; su utilidad fuera de ese lenguaje y de ese dominio es limitada.
- Rendimiento bajo en razonamiento matemático en modo thinking: 8,59 % en math500_think y 23,44 % en gsm8k_think, lo que desaconseja su uso para tareas aritméticas o de razonamiento profundo.
- pass@1 de 0,4615 en el banco propio de Vox: menos de la mitad de los ítems se resuelven correctamente, por lo que requiere validación con el compilador antes de aceptar cualquier salida.
- Riesgo de alucinación de sintaxis: los ejemplos de la model card muestran que el modelo base produce código que no parsea; el adaptador lo corrige en muchos casos, pero no hay garantía de validez sintáctica universal.
- Idiomas: solo inglés declarado, sin soporte documentado de castellano.
- Longitud de contexto no documentada, lo que impide planificar su uso en ficheros `.vox` grandes o conversaciones multi-turno largas.
- Sin datos de sesgos, evaluación de seguridad ni mediciones de latencia/throughput en serving.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales conocidas, pero al derivar de Qwen3.5-0.8B conviene verificar la licencia del modelo base y de los datos de entrenamiento.
- Métricas no verificadas (`verified: false` en la model card): los resultados son declaraciones del autor y no han sido reproducidos de forma independiente.
- Repositorio sin descargas ni valoraciones: no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brbrainerd/vox-mens-qwen3.5-0.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de entrenamiento: https://huggingface.co/datasets/brbrainerd/vox-mens-data-vox-lang
- Dataset de evaluación: https://huggingface.co/datasets/brbrainerd/vox-mens-eval-vox-lang-bench
- Playground (Space): https://huggingface.co/spaces/brbrainerd/vox-mens-playground
- Documentación de la familia Vox MENS: https://voxlang.org/reference/mens-models/
- Sitio del lenguaje Vox: https://voxlang.org
