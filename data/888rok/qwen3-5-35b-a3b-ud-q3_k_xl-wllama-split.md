# 888rok/Qwen3.5-35B-A3B-UD-Q3_K_XL-wllama-split

## Resumen

El modelo `888rok/Qwen3.5-35B-A3B-UD-Q3_K_XL-wllama-split` es una distribución del modelo Qwen3.5-35B-A3B de Alibaba en formato GGUF, cuantizado a Q3_K_XL y dividido en fragmentos de menos de 2 GB para poder cargarse en el navegador mediante la librería wllama. El autor, 888rok, parte de la cuantización realizada por Unsloth y la trocea con `llama-gguf-split`; al cargar el primer shard, wllama resuelve el resto automáticamente.

El modelo base es un MoE multimodal de 35 000 millones de parámetros totales con 3 000 millones activos por token, enrutados entre 256 expertos. Soporta razonamiento encadenado (thinking mode), tool use y procesamiento de texto, imagen y vídeo. Esta variante concreta está pensada para ejecución en el navegador, lo que la hace relevante para demos, prototipos y aplicaciones que requieren privacidad total en el cliente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con 256 expertos |
| Parametros totales | 34 660 610 688 (~35B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q3_K_XL (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF, dividido en shards <2 GB para wllama |

## Arquitectura y entrenamiento

El modelo original Qwen3.5-35B-A3B es un MoE con 256 expertos y 3 000 millones de parámetros activos por token, diseñado para eficiencia de cómputo. Es nativamente multimodal: procesa texto, imágenes y vídeo, e incorpora capacidades de razonamiento de tipo chain-of-thought (thinking mode) integradas en la arquitectura. No se dispone en la información proporcionada de detalles sobre el dataset de entrenamiento, el número de tokens ni los métodos de alineación (RLHF, DPO, etc.).

La variante que nos ocupa no introduce cambios arquitectónicos: es una cuantización Q3_K_XL del modelo original, realizada por Unsloth y posteriormente troceada con `llama-gguf-split` para que cada shard pese menos de 2 GB, requisito para que wllama pueda cargarlos en el navegador.

## Capacidades

- Generación de texto y razonamiento con chain-of-thought (thinking mode integrado).
- Procesamiento multimodal: texto, imágenes y vídeo.
- Soporte de tool use y function calling.
- Capacidades multilingües (no confirmadas oficialmente en la información disponible).
- Ejecución en navegador vía wllama, sin necesidad de servidor backend.
- Compatibilidad con endpoints y cuantización por imatrix (según los tags del repo).

## Casos de uso

- Demo interactiva de IA en el navegador: se puede cargar el modelo completo en una página web y ofrecer chat o razonamiento sin backend, gracias a los shards de <2 GB y la resolución automática de wllama.
- Prototipado rápido de asistentes conversacionales: ideal para validar ideas en local antes de migrar a despliegue con vLLM u Ollama.
- Aplicación de asistencia con privacidad total: al ejecutarse en el cliente, los datos del usuario no salen del dispositivo, lo que es útil para entornos con datos sensibles.
- Generación de código y tool calling en el navegador: su soporte de function calling permite integrarlo en herramientas web de autocompletado o agentes de bajo coste.
- Educación y experimentación: permite a estudiantes y desarrolladores probar un modelo MoE de 35B sin infraestructura de servidor.
- Análisis de documentos multimodales: dado que el modelo base procesa imágenes y vídeo, el split puede usarse en prototipos de extracción de información visual en el cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo original Qwen3.5-35B-A3B, según LM Studio, supera a modelos de la generación anterior más de seis veces su tamaño, pero no se ofrecen cifras concretas en las fuentes consultadas.

## Requisitos de hardware

- El repositorio pesa 16.6 GB, pero al ser un MoE con 3B activos por token, el consumo de memoria en inferencia es menor que el de un modelo denso equivalente.
- Pensado para ejecución en navegador con wllama: requiere un navegador con soporte WebGPU o WebAssembly.
- No se especifican requisitos de VRAM ni GPU concretos en la información disponible; al ser para navegador, el cómputo puede realizarse en CPU o GPU según el dispositivo del usuario.
- Para despliegues fuera del navegador, el modelo GGUF puede usarse con llama.cpp, Ollama o vLLM, aunque el split está diseñado específicamente para wllama.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato | Licencia |
|---|---|---|---|---|---|
| Qwen3.5-35B-A3B (original) | 35B | 3B | no disponible | safetensors | no disponible |
| Qwen3.5-35B-A3B-UD-Q3_K_XL (este repo) | 35B | 3B | no disponible | GGUF (shards) | no disponible |
| Qwen3-35B-A3B (generacion anterior) | 35B | 3B | no disponible | safetensors/GGUF | no disponible |

No se dispone de datos comparativos de rendimiento entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion Q3_K_XL reduce significativamente la calidad de salida frente a cuantizaciones mas altas (Q5, Q8); puede aumentar la tasa de alucinacion y degradar el razonamiento.
- La licencia del modelo no esta indicada en el repositorio; antes de usar comercialmente, verifica la licencia del modelo base Qwen3.5-35B-A3B en el repositorio oficial.
- No se han publicado resultados de benchmarks para esta variante, por lo que no hay evidencia cuantitativa de su rendimiento.
- La ejecucion en navegador depende del rendimiento del dispositivo del usuario; en equipos modestos la latencia puede ser alta.
- No se especifica la longitud de contexto soportada en esta variante; si se usa en produccion, conviene verificar el limite real con el modelo original.

## Enlaces

- Repositorio de esta variante: https://huggingface.co/888rok/Qwen3.5-35B-A3B-UD-Q3_K_XL-wllama-split
- Modelo base cuantizado por Unsloth: https://huggingface.co/unsloth/Qwen3.5-35B-A3B-GGUF
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Libreria wllama: https://github.com/ngxson/wllama
- Guia de fine-tuning de Unsloth para Qwen3.5: https://unsloth.ai/docs/models/qwen3.5/fine-tune
