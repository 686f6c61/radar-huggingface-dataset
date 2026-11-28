# brbrainerd/vox-mens-qwen3.5-0.8b

## Resumen
Vox Mens 0.8B es un ajuste fino (finetune) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por brbrainerd y publicado en Hugging Face bajo licencia Apache 2.0. Su propósito específico es generar y reparar código en Vox (`.vox`), un lenguaje full-stack en el que un único fichero define tablas de base de datos, consultas y mutaciones de backend, componentes de interfaz web y flujos de trabajo que compilan a Rust y TypeScript. Dado que Vox es más reciente que los lenguajes convencionales, los modelos generalistas tienden a producir sintaxis de Rust o TypeScript que no compila; este modelo se ha entrenado sobre ejemplos `.vox` verificados para cubrir ese hueco.

El modelo conserva la arquitectura del Qwen3.5-0.8B, que emplea Gated Delta Networks (una forma de atención lineal con estado recurrente) combinada con capas transformer, y se distribuye en formato Safetensors junto con adaptadores PEFT. Con 752.393.024 parámetros reales según safetensors y un repositorio de 4,9 GB, está pensado para ejecutarse en portátiles convencionales (Windows, Linux, Mac) sin GPU dedicada, en el navegador o mediante proveedores de inferencia compatibles con OpenAI.

Su relevancia actual reside en la combinación de tamaño mínimo, licencia permisiva y especialización en un lenguaje de nicho: permite generar y corregir código Vox localmente sin depender de APIs en la nube, y su rendimiento declarado en el banco de pruebas held-out de Vox pasa de 0/52 (0,0 %) en el modelo base a 43/52 (82,7 %) tras el ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Gated Delta Networks (atención lineal con estado recurrente); modelo base Qwen3.5 |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se menciona QLoRA para el entrenamiento, no cuantizaciones de inferencia publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors + adaptadores PEFT |

## Arquitectura y entrenamiento
El modelo parte de Qwen/Qwen3.5-0.8B (revisión `2fc06364715b967f1860aea9cf38778875588b17`), una arquitectura transformer que incorpora Gated Delta Networks, un mecanismo de atención lineal con estado recurrente que reduce el coste computacional frente a la atención cuadrática clásica. El ajuste se realizó mediante QLoRA con RS-LoRA (según las etiquetas del repositorio), y el autor reporta un pico de memoria medido de 13.341 MiB durante la ejecución de entrenamiento del modelo de 0.8B. Los datos de entrenamiento provienen del conjunto `brbrainerd/vox-mens-data-vox-lang`, compuesto por ejemplos verificados de código Vox, y la evaluación se realiza sobre `brbrainerd/vox-mens-eval-vox-lang-bench`.

El modelo soporta modo de razonamiento (thinking mode) heredado del base, aunque el autor lo evalúa explícitamente como comprobación de regresión: los resultados en GSM8K, MATH500 y el propio banco Vox en modo thinking son notablemente bajos, lo que sugiere que el ajuste prioriza la generación de código Vox en modo no-thinking. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO.

## Capacidades
- Generación de código Vox: escribe funciones, consultas y programas `.vox` completos a partir de una descripción en lenguaje natural.
- Reparación de código Vox: corrige sintaxis y construcciones que no compilan, sustituyendo los patrones erróneos de Rust o TypeScript por la sintaxis propia de Vox.
- Generación de texto conversacional en inglés, heredada del modelo base.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: limitado; el propio autor indica que el modelo de 0.8B tiene muy poca capacidad para lógica multi-paso y recomienda los tamaños 2B o 4B para handlers completos.
- Capacidades multilingües: solo inglés (etiqueta `en`).
- Modo thinking: disponible en el base, pero evaluado como regresión con resultados bajos.
- Integración con ecosistemas de inferencia: transformers, text-generation-inference, vLLM, candle, Ollama y proveedores de Hugging Face compatibles con OpenAI (`:auto`, `:featherless-ai`).

## Casos de uso
- Generación de funciones Vox cortas en local: el modelo produce funciones como `reverse_list`, `nth_prime` o `merge_sorted` a partir de una descripción, con memoria y disco mínimos, lo que permite iterar sin conexión en un portátil.
- Reparación de código Vox que no compila: dado un fragmento con sintaxis de Rust o TypeScript, el modelo lo reescribe en sintaxis Vox válida, evitando el ciclo de prueba y error con modelos generalistas.
- Aprendizaje y exploración del lenguaje Vox: sirve como asistente de consulta para desarrolladores que se inician en el lenguaje, generando ejemplos de tablas, mutaciones y componentes de interfaz en un único fichero.
- Prototipado rápido de consultas y mutaciones de backend: el modelo puede generar fragmentos de acceso a datos en Vox para validar un esquema antes de escribir el handler completo.
- Asistencia en editores y entornos de desarrollo: al ser compatible con endpoints OpenAI, puede conectarse a clientes de chat o extensiones de editor para autocompletar y corregir código Vox en tiempo real.
- Despliegue en entornos con recursos limitados: al caber en CPU y en GPU de consumo, permite ofrecer asistencia de código Vox en máquinas sin acelerador dedicado o en el navegador mediante el playground.
- Evaluación y comparación de modelos especializados: sirve como referencia de línea base para medir cuánto mejora un ajuste fino pequeño frente al modelo base en un dominio concreto (0/52 frente a 43/52 en el banco held-out).

## Benchmarks y rendimiento

| Tarea | Conjunto de evaluación | Métrica | Valor |
|---|---|---|---|
| Generación de código Vox | Vox held-out bench (52 items) | pass@1 (qwen3_non_thinking_codegen_v1) | 0,8269 |
| Comprobación de regresión de razonamiento (thinking) | gsm8k_think (128 items) | accuracy | 0,3594 |
| Comprobación de regresión de razonamiento (thinking) | math500_think (128 items) | accuracy | 0,1641 |
| Comprobación de regresión de razonamiento (thinking) | vox_think (128 items) | accuracy | 0,2188 |

Los resultados son declarados por el autor del modelo y no están verificados de forma independiente (`verified: false`). El autor reporta además que el modelo base obtiene 0/52 (0,0 %) en el banco held-out de Vox, frente a 43/52 (82,7 %) del modelo ajustado.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; con 752 millones de parámetros, la inferencia en fp16 requiere aproximadamente 1,5 GB de pesos, y en cuantización de 8 bits o 4 bits se reduce por debajo de 1 GB, aunque el autor no publica cifras de inferencia.
- Memoria de entrenamiento: pico medido de 13.341 MiB con QLoRA durante la ejecución de entrenamiento del modelo de 0.8B.
- GPU recomendadas: no disponible; el modelo está diseñado para ejecutarse en CPU de portátiles convencionales y en el navegador, por lo que no requiere GPU dedicada.
- GPU de consumo: cabe en cualquier GPU de consumo moderna y en muchos casos en CPU, según el autor.
- Opciones de despliegue: Ollama, vLLM, text-generation-inference, candle, Python con transformers, `vox mens serve` y Hugging Face Inference Providers (`:auto`, `:featherless-ai`).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en Vox (held-out) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vox Mens 0.8B | 752.393.024 | no disponible | 82,7 % pass@1 (43/52) | apache-2.0 | Hugging Face, playground, proveedores de inferencia |
| Qwen/Qwen3.5-0.8B (base) | no disponible | no disponible | 0,0 % pass@1 (0/52) | no disponible | Hugging Face |
| Vox Mens 2B | no disponible | no disponible | no disponible | no disponible | mencionado por el autor como escalón superior |
| Vox Mens 4B | no disponible | no disponible | no disponible | no disponible | mencionado por el autor como escalón superior |

El autor indica que, para lógica multi-paso y handlers completos, conviene subir a los tamaños 2B o 4B de la familia, y reservar modelos en la nube de mayor tamaño para el diseño de aplicaciones completas.

## Limitaciones y advertencias
- Capacidad limitada para lógica multi-paso: el propio autor advierte que el tamaño de 0.8B es insuficiente para handlers completos y recomienda modelos mayores para tareas complejas.
- Resultados de razonamiento bajos en modo thinking: 35,94 % en GSM8K, 16,41 % en MATH500 y 21,88 % en el banco Vox de thinking, lo que desaconseja su uso como modelo de razonamiento general.
- Especialización estrecha: está entrenado para Vox y su rendimiento en otros lenguajes o dominios no está documentado.
- Idioma: solo inglés, según la etiqueta del repositorio.
- Riesgo de alucinación: como todo modelo generativo, puede producir código Vox sintácticamente plausible pero semánticamente incorrecto; se recomienda validar con el compilador de Vox.
- Benchmarks no verificados: los resultados del model-index están marcados como `verified: false` y proceden del propio autor.
- Licencia Apache 2.0: permite uso comercial, pero no se documentan restricciones adicionales ni garantías por parte del autor.
- Contexto: la longitud de contexto no está disponible en la información proporcionada, lo que impide planificar su uso en conversaciones o ficheros largos.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/brbrainerd/vox-mens-qwen3.5-0.8b
- Playground: https://huggingface.co/spaces/brbrainerd/vox-mens-playground?model=brbrainerd/vox-mens-qwen3.5-0.8b
- Documentación de modelos Mens: https://voxlang.org/reference/mens-models/
- Lenguaje Vox: https://voxlang.org
- Dataset de entrenamiento: https://huggingface.co/datasets/brbrainerd/vox-mens-data-vox-lang
- Dataset de evaluación: https://huggingface.co/datasets/brbrainerd/vox-mens-eval-vox-lang-bench
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
