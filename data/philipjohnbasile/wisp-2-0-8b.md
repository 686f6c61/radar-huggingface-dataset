# philipjohnbasile/Wisp-2-0.8B

## Resumen

Wisp-2-0.8B es un modelo de lenguaje especializado en autocompletado de código (fill-in-the-middle, FIM) desarrollado por philipjohnbasile como segunda entrega de su serie "The Wisp Fieldbook". Se trata de un fine-tune del modelo base Qwen/Qwen3.5-0.8B-Base, con 752 millones de parámetros reales según los pesos en safetensors, y está diseñado específicamente para generar "ghost text" en editores de código con latencia muy baja en Apple Silicon.

El modelo combina una arquitectura híbrida GatedDeltaNet con decodificación especulativa nativa (multi-token prediction), lo que le permite alcanzar tiempos de respuesta del orden de 27,5 ms en cuantización MLX-8bit. Su enfoque no es el chat generalista ni el razonamiento complejo, sino la predicción de fragmentos de código en contexto de repositorio, incluyendo soporte explícito para los formatos PSM (prefix-suffix-middle) y SPM (suffix-prefix-middle) que usan los motores de autocompletado.

Es relevante ahora porque ocupa un nicho poco cubierto: modelos pequeños, con licencia Apache 2.0, optimizados para inferencia local en hardware de consumo (concretamente Apple Silicon vía MLX) y con un benchmark propio de FIM sobre repositorios reales posteriores a junio de 2026, lo que reduce el riesgo de contaminación por entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con GatedDeltaNet (base Qwen3.5) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (1,45 GB), MLX-8bit (854 MiB) |
| Idiomas soportados | code (lenguajes de programación; el campo `language` de la model card solo declara `code`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), MLX-8bit |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B-Base y se ha afinado como fine-tune (`base_model_relation: finetune`). La arquitectura heredada es un transformer híbrido que incorpora capas GatedDeltaNet, un mecanismo de atención lineal con compuertas que reduce el coste computacional frente a la atención cuadrática clásica, algo especialmente relevante para un modelo pensado para inferencia de baja latencia en dispositivos locales.

El entrenamiento se orienta a la tarea de fill-in-the-middle: el modelo aprende a completar el hueco entre un prefijo y un sufijo de código, en lugar de generar texto libre. La model card menciona explícitamente soporte para los formatos PSM y SPM, y el modelo incorpora capacidades de multi-token prediction (MTP) que habilitan decodificación especulativa nativa. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detalla la innovación concreta del pipeline de datos más allá de la referencia a "repo-context" en el benchmark.

## Capacidades

- Autocompletado de código fill-in-the-middle (FIM) en formato PSM y SPM.
- Generación de "ghost text" para editores: completado de líneas y fragmentos en contexto de repositorio.
- Predicción multi-token (MTP) que permite decodificación especulativa y reduce la latencia por token.
- Completado multi-lenguaje: el benchmark del autor cubre 11 lenguajes de programación.
- Inferencia optimizada para Apple Silicon mediante pesos MLX-8bit.
- Compatibilidad con la librería `transformers` y con MLX-LM.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Autocompletado en IDE y editores de código: el modelo está diseñado para insertarse en el flujo de edición y generar ghost text a partir del prefijo y el sufijo del fichero abierto, usando el formato PSM/SPM que esperan los motores de autocompletado modernos.
- Asistentes de código locales en Mac: gracias a los pesos MLX-8bit (854 MiB) y a la latencia de 27,5 ms en MTP, puede ejecutarse íntegramente en un portátil con Apple Silicon sin depender de la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Completado consciente de repositorio: el benchmark del autor mide FIM con contexto de repositorio en 30 repositorios reales, por lo que el modelo está pensado para completar código que depende de APIs y convenciones del propio proyecto.
- Relleno de plantillas y scaffolding: útil para completar bloques repetitivos (definiciones de tipos, serializadores, tests) donde el prefijo y el sufijo ya están escritos y solo falta el cuerpo.
- Generación de tests unitarios a partir de firmas existentes: el modelo puede completar el cuerpo de una función de test dado el nombre y el contexto de la función bajo prueba.
- Prototipado rápido en notebooks y scripts: al ser un modelo pequeño con licencia Apache 2.0, puede integrarse en herramientas internas de generación de snippets sin coste de licencia.
- Migración de código entre lenguajes: el soporte de 11 lenguajes en el benchmark permite usarlo para completar traducciones parciales donde el esqueleto ya está escrito en el lenguaje destino.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| Wisp Blind Tier-1 Repo-Context FIM (post-2026-06-01, n=566, 30 repos, 11 langs) | Exact Match (100% PSM, MLX-8bit) | 32,86 |
| Wisp Blind Tier-1 Repo-Context FIM (post-2026-06-01, n=566, 30 repos, 11 langs) | Exact Match (100% SPM, MLX-8bit) | 30,56 |

El autor reporta además una latencia de 27,5 ms en MLX-8bit con decodificación especulativa multi-token (D=3). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,5 GB en BF16 y unos 0,85 GB en MLX-8bit para los pesos; el consumo real depende del contexto y del runtime.
- GPU recomendadas: el modelo está optimizado para Apple Silicon (MLX). En GPUs NVIDIA no se documenta un rendimiento específico; un modelo de 0,75B cabe holgadamente en cualquier GPU con 4 GB o más.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna de consumo (RTX 3060 en adelante) e incluso en iGPU y en Mac con memoria unificada.
- Opciones de despliegue: `transformers` (safetensors BF16), MLX-LM (pesos MLX-8bit). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 27,5 ms por paso en MLX-8bit con MTP D=3 según el autor; no se publican cifras de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wisp-2-0.8B | 752 M | no disponible | FIM / autocompletado, MLX | Apache 2.0 | Hugging Face |
| wisp-coder-110m (Wisp No. 001) | 110 M (aproximado por el nombre) | no disponible | FIM / autocompletado | no disponible en la informacion | Hugging Face |
| Qwen/Qwen3.5-0.8B-Base | 0,8 B | no disponible | Modelo base generalista | no disponible en la informacion | Hugging Face |

No se dispone de datos de benchmarks comparativos frente a otros modelos de autocompletado de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Especializado exclusivamente en código: el campo `language` solo declara `code`, por lo que no debe esperarse un buen rendimiento en lenguaje natural.
- Los resultados de benchmarks son declarados por el autor y están marcados como `verified: false`; no han sido replicados de forma independiente.
- El benchmark propio ("Wisp Blind Tier-1") está diseñado por el mismo autor, lo que introduce un posible sesgo de selección.
- Riesgo de alucinación de APIs: como todo modelo de autocompletado, puede inventar funciones, métodos o firmas que no existen en el repositorio.
- No se documenta la longitud de contexto soportada, lo que dificulta planificar su uso en ficheros grandes.
- El rendimiento de 27,5 ms está medido en MLX-8bit sobre Apple Silicon; en otras plataformas no hay cifras publicadas.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene revisar las condiciones del modelo base Qwen3.5-0.8B-Base, ya que el fine-tune hereda sus restricciones.
- El modelo tiene 0 descargas y 1 like en el momento de la ficha, por lo que no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/philipjohnbasile/Wisp-2-0.8B
- Pesos MLX-8bit: https://huggingface.co/philipjohnbasile/Wisp-2-0.8B-MLX-8bit
- Demo (playground): https://huggingface.co/spaces/philipjohnbasile/wisp-2-demo
- Colección "The Wisp Fieldbook": https://huggingface.co/collections/philipjohnbasile/the-wisp-fieldbook-6b046d3efc921b5ab45b42f5
- Modelo anterior de la serie: https://huggingface.co/philipjohnbasile/wisp-coder-110m
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
