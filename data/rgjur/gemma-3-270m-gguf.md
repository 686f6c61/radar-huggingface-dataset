# Rgjur/gemma-3-270m-gguf

## Resumen

gemma-3-270m-gguf es una cuantización en formato GGUF del modelo Gemma 3 270M de Google, publicada por el usuario Rgjur en Hugging Face. El modelo base, google/gemma-3-270m, es el miembro más pequeño de la familia Gemma 3, con aproximadamente 268 millones de parámetros, orientado a tareas de generación de texto en dispositivos con recursos muy limitados. Esta versión reempaqueta los pesos en GGUF para permitir su ejecución con runtimes como llama.cpp y sus derivados.

La relevancia de esta ficha reside en la utilidad práctica de un modelo tan compacto: con menos de 300 millones de parámetros, cabe con holgura en CPUs y en GPUs de consumo sin necesidad de cuantización agresiva, lo que lo hace idóneo para prototipado, tareas de NLP ligeras, clasificación, extracción de datos estructurados y despliegues edge. Según la model card del autor, el modelo ha sido probado con gguf-connector y una build nightly de llama-cpp-python. No se ha publicado documentación técnica detallada sobre la cuantización concreta incluida en el repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Gemma 3), arquitectura detallada no disponible |
| Parámetros totales | 268.098.176 (≈268M) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible en la ficha del repo |
| Tipos de cuantizacion | GGUF (variantes concretas no especificadas) |
| Idiomas soportados | no disponible |
| Licencia | Gemma (licencia de Google para la familia Gemma) |
| Formato de pesos | GGUF (cuantizado); el modelo base usa safetensors |

## Arquitectura y entrenamiento

El modelo base es google/gemma-3-270m, la variante más pequeña de la familia Gemma 3 de Google, una arquitectura de transformer decoder optimizada para inferencia eficiente. Este repositorio no modifica los pesos del modelo base: se limita a convertirlos al formato GGUF, un formato de cuantización diseñado para llama.cpp que permite ejecutar modelos en CPU y GPU con distintos niveles de compresión (Q4, Q5, Q8, etc.).

No se ha publicado información sobre los datos de entrenamiento, el número de tokens ni los procesos de alineación (RLHF/DPO) aplicados a esta conversión; para esos detalles debe consultarse la documentación oficial del modelo base de Google. La model card del autor únicamente indica que el modelo se ha probado con gguf-connector (disponible en PyPI) junto con una versión nightly de llama-cpp-python, lo que confirma su compatibilidad con el ecosistema llama.cpp.

## Capacidades

- Generación de texto general como modelo base (no instruido): completado de texto y tareas auto-regresivas básicas.
- Tareas de NLP ligeras: clasificación, extracción de entidades y estructurado de datos, para las que los modelos de este tamaño suelen ser adecuados tras fine-tuning.
- Ejecución local con runtimes compatibles con GGUF: llama.cpp, llama-cpp-python y gguf-connector.
- Fine-tuning asequible: su tamaño reducido permite entrenamiento o ajuste fino en hardware de consumo.
- No consta soporte de vision, audio, tool calling ni modos de razonamiento en la información disponible.

## Casos de uso

- Prototipado rápido en local: permite probar pipelines de generación de texto en un portátil sin GPU dedicada, gracias a su tamaño de menos de 300M de parámetros.
- Clasificación de texto en producción: tras un fine-tuning breve, puede servir como clasificador de intención o de sentimiento con latencias muy bajas y coste mínimo.
- Extracción de datos estructurados: adecuado para convertir texto no estructurado en JSON o etiquetas en dispositivos edge, un caso de uso para el que Google posiciona explícitamente a Gemma 3 270M.
- Despliegue en dispositivos edge e IoT: cabe en memoria de CPUs modernas, lo que permite integrarlo en aplicaciones móviles o embebidas con llama.cpp.
- Generación sintética de datos de arranque: puede usarse para producir borradores o ejemplos que luego filtran modelos mayores.
- Base para fine-tuning especializado: su reducido tamaño permite ajustar el modelo completo (full fine-tuning) en una GPU de consumo para dominios concretos.
- Pruebas de infraestructura de inferencia: útil como modelo ligero para validar configuraciones de llama.cpp, vLLM con soporte GGUF o servidores propios antes de desplegar modelos grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: un modelo de 268M de parámetros en GGUF ocupa del orden de 0,3 GB en precisión completa y aproximadamente 0,15–0,2 GB con cuantización de 4 bits; es ejecutable incluso en CPUs sin GPU.
- GPU recomendadas: no requiere GPU; cualquier GPU moderna es más que suficiente. Compatible con GPUs de consumo básicas.
- Consumer GPUs: cabe con holgura en prácticamente cualquier GPU con 2 GB de VRAM o más, incluidas integradas.
- Despliegue: confirmado con gguf-connector y llama-cpp-python (build nightly) según la model card; por ser GGUF, es compatible con llama.cpp, Ollama, LM Studio y otros runtimes del ecosistema.
- Latencia y throughput: no disponibles; dada la escala del modelo, se esperan latencias de primer token muy bajas incluso en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Licencia | Notas |
|---|---|---|---|---|
| gemma-3-270m-gguf (este) | ≈268M | GGUF | Gemma | Cuantización comunitaria del modelo base de Google |
| Qwen2.5-0.5B | ≈500M | safetensors/GGUF | Apache 2.0 | Doble de tamaño, licencia permisiva, soporte multilingüe amplio |
| SmolLM2-360M (HuggingFaceTB) | ≈360M | safetensors/GGUF | Apache 2.0 | Modelo compacto entrenado específicamente para edge, con datos y recetas documentados |
| Llama 3.2 1B | ≈1.200M | safetensors/GGUF | Llama 3.2 | Mayor capacidad, sigue siendo ligero, licencia comunitaria con restricciones |

## Limitaciones y advertencias

- Es un modelo base, no instruido: no sigue instrucciones de forma fiable ni está alineado con preferencias humanas; no es adecuado como asistente conversacional sin fine-tuning.
- Con 268M de parámetros, su capacidad de razonamiento, conocimiento factual y generación de código es muy limitada; la tasa de alucinación y errores factuales es esperablemente alta.
- La licencia Gemma de Google impone condiciones de uso propias (aceptación de términos de licencia y política de uso prohibido), que restringen ciertos usos comerciales y requieren revisión antes de producción.
- No se especifican las variantes de cuantización GGUF incluidas ni su calidad; conviene verificar los archivos del repositorio antes de usarlo.
- Repositorio comunitario de terceros: no cuenta con validación oficial de Google, por lo que se recomienda contrastar los pesos con el modelo base original.
- Información sobre idiomas soportados y longitud de contexto no disponible en la ficha; debe consultarse la documentación del modelo base.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Rgjur/gemma-3-270m-gguf
- Modelo base: https://huggingface.co/google/gemma-3-270m
- gguf-connector (PyPI): https://pypi.org/project/gguf-connector
- llama-cpp-python (GitHub, releases): https://github.com/calcuis/llama-cpp-python/releases
