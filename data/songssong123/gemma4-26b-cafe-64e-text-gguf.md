# SONGSSONG123/gemma4-26b-cafe-64e-text-GGUF

## Resumen

`gemma4-26b-cafe-64e-text-GGUF` es una versión experimental y podada del modelo `google/gemma-4-26B-A4B-it` de Google, publicada por el usuario SONGSSONG123. Se trata de un modelo de mezcla de expertos (MoE) al que se le ha eliminado la mitad de los expertos de cada capa (de 128 a 64 expertos en 30 capas, es decir, 1.920 de 3.840 expertos eliminados) mediante una técnica de poda estructurada basada en el método REAP (arXiv:2510.13999), adaptada para tener en cuenta la frecuencia de enrutamiento. El objetivo es reducir el tamaño del modelo lo suficiente como para que quepa en la GPU integrada de un portátil (Intel Arc 140T) manteniendo su capacidad para una tarea muy concreta: tomar pedidos en cafeterías en coreano.

El modelo se distribuye únicamente en formato GGUF con cuantización Q4_K_M, sin componentes de visión (es solo texto) y con los pesos de lenguaje idénticos a la versión completa de 64 expertos evaluada por el autor. El repositorio ocupa 9,8 GB y el modelo declara 13.808.740.766 parámetros totales según safetensors. La selección de expertos se realizó con 600 prompts de pedidos de café en coreano (system prompt, definiciones de herramientas y turnos de cliente), ponderando al 50:50 los tokens de prompt y de petición, y protegiendo los expertos que procesaban al menos el 30 % de los tokens de una capa.

Es relevante ahora porque demuestra un flujo de trabajo de poda de MoE orientado a dominios concretos y despliegue en hardware de consumo, con resultados medidos (aunque con limitaciones estadísticas claras) frente al modelo original y frente a Gemma 4 12B. No es un modelo de propósito general: el propio autor advierte que el conocimiento general se reduce significativamente (47,3 % en KMMLU+MMLU frente al 72,7 % del original).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), 30 capas, 128 expertos por capa en el modelo original; 64 expertos por capa tras la poda; top-k routing de 8 |
| Parametros totales | 13.808.740.766 (según safetensors del repo); el nombre del modelo hace referencia a "26B" del base, pero el dato real reportado es ~13,8B |
| Parametros activos | no disponible (el modelo base es A4B, pero no se especifica el número de parámetros activos tras la poda) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (tipos por tensor ajustados al build original de Ollama, sin imatrix) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 9,8 GB) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-26B-A4B-it`, un transformer de mezcla de expertos con 128 expertos por capa en 30 capas y enrutamiento top-8. La modificación consiste en una poda estructurada de expertos: se eliminan 64 de los 128 expertos en cada capa (1.920 de 3.840 en total), rebanando los tensores de expertos, las filas del router y las escalas por experto, mientras que los pesos restantes quedan sin cambios. El top-k de enrutamiento se mantiene en 8.

La selección de qué expertos conservar se basa en REAP (Lasby et al., 2025, arXiv:2510.13999), modificado para considerar la frecuencia de enrutamiento. Se calcula la contribución por experto como la suma de g·‖f(x)‖ sobre 600 prompts de pedidos de café en coreano (system prompt + definiciones de herramientas + intervención del cliente), ponderando al 50:50 los tokens de prompt y de petición, y se protegen los expertos que procesan al menos el 30 % de los tokens de una capa. Posteriormente el modelo se cuantiza a Q4_K_M sin imatrix. No se indica el número de tokens de entrenamiento adicional, ni si hubo RLHF/DPO tras la poda; la poda no implica reentrenamiento según la información disponible. Los componentes de visión se eliminan por completo (modelo solo texto).

## Capacidades

- Generación de texto conversacional en coreano, orientada a la toma de pedidos en cafeterías.
- Soporte de tool calling / function calling, ya que la calibración incluye definiciones de herramientas y el modelo base es `-it` con soporte de herramientas.
- Capacidad de razonamiento multi-turno dentro del esquema de pedidos de café (system prompt + turnos de cliente).
- Capacidades multilingües limitadas: el modelo declara únicamente coreano y está ajustado a un menú y esquema de herramientas concretos.
- No soporta visión (componentes de imagen eliminados y nunca evaluados).
- Conocimiento general muy reducido respecto al modelo original (47,3 % frente a 72,7 % en la evaluación combinada KMMLU+MMLU).

## Casos de uso

- Toma de pedidos en cafeterías en coreano: el modelo se usa con un system prompt y un esquema de herramientas de menú para interpretar la intervención del cliente y emitir la llamada de herramienta correspondiente; está calibrado y evaluado específicamente para este escenario.
- Despliegue en hardware de consumo: al caber en una GPU integrada Intel Arc 140T, permite ejecutar un MoE podado en un portátil sin GPU dedicada, con una latencia medida de 6,46 s medianos por pedido en esta versión GGUF solo texto.
- Prototipado de asistentes de pedido con Ollama: se puede lanzar con `ollama run hf.co/SONGSSONG123/gemma4-26b-cafe-64e-text-GGUF:Q4_K_M` o creando un Modelfile propio, lo que facilita pruebas rápidas en local.
- Investigación sobre poda de MoE: sirve como caso práctico reproducible de poda estructurada guiada por dominio (REAP modificado) con métricas comparadas frente al modelo original y frente a Gemma 4 12B.
- Evaluación de compromiso entre conocimiento general y habilidad de dominio: útil para estudiar cuánto conocimiento general se pierde (72,7 % → 47,3 %) al conservar solo la mitad de los expertos orientados a una tarea.
- Sustitución de un modelo mayor en entornos con restricciones de memoria: el original de 26B no cabe en la iGPU objetivo, mientras que esta versión de 64 expertos sí, lo que permite mantener la funcionalidad de pedidos en ese hardware.

## Benchmarks y rendimiento

| Modelo | Café test (120, escritos por IA) | Live test (20, escritos por humanos) | Conocimiento general (KMMLU 200 + MMLU 100) |
|---|---|---|---|
| Gemma 4 26B original | 94,2 % | 75 % | 72,7 % |
| **64e (este modelo)** | **93,3 %** | **70 %** | **47,3 %** |
| Gemma 4 12B | 90,8 % | 45 % | 64,3 % |

Latencia en la misma iGPU Intel Arc 140T: el build completo de 64 expertos (con el modelo draft MTP de Ollama) dio una mediana de 2,55 s por pedido (Gemma 4 12B, también con su draft: 3,33 s). Este GGUF solo texto no incluye el modelo draft: mediana de 6,46 s por pedido. El 26B original no cabe en esa iGPU. Los resultados son de una sola ejecución, con thinking desactivado y temperatura 0.

## Requisitos de hardware

- VRAM estimada: el repo GGUF Q4_K_M ocupa 9,8 GB; se necesita al menos esa cantidad de memoria disponible (GPU o memoria unificada) para cargarlo.
- GPU recomendadas: el autor lo ejecuta en una GPU integrada Intel Arc 140T; en GPUs dedicadas no se han publicado pruebas.
- Cabe en hardware de consumo: sí, según el autor, en una iGPU de portátil (Intel Arc 140T), que es precisamente el objetivo del proyecto; el modelo original de 26B no cabe en esa iGPU.
- Opciones de despliegue: Ollama (`ollama run hf.co/SONGSSONG123/gemma4-26b-cafe-64e-text-GGUF:Q4_K_M` o `ollama create` con Modelfile). No se mencionan vLLM, llama.cpp, TGI ni otros backends en la información disponible.
- Latencia y throughput: mediana de 6,46 s por pedido en la iGPU Intel Arc 140T con este GGUF solo texto; el build completo de 64 expertos con draft MTP logró 2,55 s medianos por pedido. No se reporta throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Café test | Live test | Conocimiento general | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| gemma4-26b-cafe-64e-text (este) | 13,8B (según safetensors) | no disponible | 93,3 % | 70 % | 47,3 % | Apache 2.0 | GGUF en HF |
| Gemma 4 26B original | 26B (MoE, 128 expertos) | no disponible | 94,2 % | 75 % | 72,7 % | Apache 2.0 (base) | HF |
| Gemma 4 12B | 12B | no disponible | 90,8 % | 45 % | 64,3 % | no disponible en la información | HF |

## Limitaciones y advertencias

- Modelo específico de dominio: está ajustado a un menú y esquema de herramientas de cafetería concretos; fuera de ese contexto el rendimiento es débil según el propio autor.
- Pérdida severa de conocimiento general: 47,3 % frente al 72,7 % del original en la evaluación combinada KMMLU+MMLU.
- Significación estadística: el live test tiene solo 20 ítems y ninguna comparación alcanza significación (p ≥ 0,05).
- Sesgo de evaluación: el café test, los datos de calibración y los prompts fueron generados con una herramienta de codificación de IA; solo el live test fue escrito por humanos.
- Sin soporte de imagen: los componentes de visión se eliminaron y nunca se evaluaron.
- Idioma: solo coreano; no se declaran otros idiomas.
- Licencia Apache 2.0, pero es una versión modificada de Gemma 4 de Google; debe consultarse el archivo LICENSE del repositorio para uso comercial.
- Riesgo de alucinación en tool calling fuera del esquema calibrado: no se han publicado evaluaciones de robustez ante entradas adversarias o menús distintos.
- No se dispone de datos de longitud de contexto, parámetros activos ni throughput, lo que limita la planificación de producción.

## Enlaces

- Hugging Face: https://huggingface.co/SONGSSONG123/gemma4-26b-cafe-64e-text-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Código y resultados: https://github.com/gustjrvkdnj1234-png/cafe-robot-brain
- Blog post (coreano): https://blog.cslee.co.kr/a-graduate-ai-applied-for-a-cafe-part-time-job
- Paper REAP: https://arxiv.org/abs/2510.13999
