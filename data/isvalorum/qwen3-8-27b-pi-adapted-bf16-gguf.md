# IsValorum/Qwen3.8-27B-pi-adapted-BF16-GGUF

## Resumen

Qwen3.8-27B-pi-adapted-BF16-GGUF es una conversión a formato GGUF en precisión BF16 del modelo harness-hub/Qwen3.8-27B-pi-adapted, que a su vez deriva del modelo base Qwen/Qwen3.8-27B con un adaptador orientado a agentes ("pi"). La publicación corre a cargo de IsValorum, que actúa como cuantizador y preparador del artefacto dentro de un flujo que el autor denomina "APEX preparation artifact". El resultado es un único fichero GGUF de 54,66 GB pensado para su uso con llama.cpp y runtimes compatibles.

El modelo resuelve el problema de disponer de los pesos en un contenedor portable y de precisión completa (BF16) para poder generar a partir de él cuantizaciones posteriores (por ejemplo, Q4_K_M, Q5_K_M, Q8_0) sin depender de los safetensors originales. Con 27.320.697.856 parámetros totales, se sitúa en la franja de modelos densos de ~27B, un tamaño que en BF16 excede con holgura la VRAM de cualquier GPU de consumo y que en cuantizaciones de 4-5 bits sí puede llegar a ejecutarse en tarjetas de 24 GB.

La relevancia del artefacto es acotada pero clara: es la puerta de entrada práctica para desplegar este derivado concreto de Qwen3.8 en llama.cpp, Ollama u otros motores que consumen GGUF. La información publicada por el autor es mínima (no hay model card del adaptador, ni datos de entrenamiento, ni benchmarks), por lo que esta ficha refleja exclusivamente lo verificable en los metadatos y en el README del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-27B; familia transformer, sin detalle publicado) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no aplica (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (este repositorio); el autor indica que publica mapas de tensores solo con los niveles cuantizados, sin detallar qué niveles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero único, 54.657.734.176 bytes) |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura interna del modelo base Qwen3.8-27B ni sobre el adaptador "pi" aplicado por harness-hub. Los tags del repositorio mencionan "qwen3.8", "qwen3.5", "mtp", "pi", "agents", "apex" y "harness-adapter", lo que sugiere un linaje Qwen con algún tipo de mecanismo multi-token prediction (MTP) y un adaptador orientado a uso agéntico, pero el autor no documenta ni la composición del dataset, ni el número de tokens de entrenamiento, ni si hubo etapas de RLHF o DPO.

Técnicamente, lo único verificable es el proceso de conversión: partida de Qwen/Qwen3.8-27B (revisión 37561816e66b5b9153b1b64c10968c18c1e6f4a0), aplicación del adaptador harness-hub/Qwen3.8-27B-pi-adapted (revisión 78eacecca691deb59f703fc270120e2e5b2e0194) y empaquetado en un GGUF BF16 con SHA256 ba14867b4c74dc826071063255bd1a4c06135d1771704789657fc9695adbb567. No se adjunta mapa de tensores en este artefacto.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation y el tag "conversational" está presente.
- Orientación a agentes: los tags "agents", "harness-adapter" y "apex" indican que el adaptador se diseñó para flujos agénticos, aunque no se detalla el mecanismo.
- Compatibilidad con endpoints: el tag "endpoints_compatible" sugiere que el artefacto puede servirse detrás de APIs compatibles con motores de inferencia estándar.
- Ejecución en llama.cpp: formato GGUF nativo, cargable directamente en llama.cpp y derivados.
- Razonamiento multi-paso y tool calling: no disponible (no documentado por el autor).
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Generación de cuantizaciones derivadas: este GGUF BF16 sirve como artefacto fuente para producir niveles Q4_K_M, Q5_K_M, Q8_0 u otros con `llama-quantize`, evitando depender de los safetensors originales y garantizando que el adaptador "pi" ya está fusionado en los pesos.
- Despliegue local en estaciones de trabajo con GPU de 24 GB: una vez cuantizado a 4-5 bits (aproximadamente 15-18 GB), el modelo puede ejecutarse en una RTX 4090 o RTX 3090 con contexto moderado mediante llama.cpp u Ollama.
- Experimentación con adaptadores agénticos: al estar etiquetado como "harness-adapter", permite evaluar en local si el adaptador "pi" mejora el comportamiento en tareas de agente (planificación, uso de herramientas) frente al Qwen3.8-27B original.
- Servicio de inferencia en CPU o mixto CPU-GPU: el formato GGUF con offloading parcial permite servir el modelo en servidores sin GPU dedicada, a costa de latencia alta, útil para pruebas internas y prototipos.
- Reproducibilidad y auditoría: el SHA256 publicado y las revisiones exactas del modelo base y del adaptador permiten reconstruir el artefacto y verificar su integridad en pipelines internos.
- Base para ajuste fino ligero posterior: los pesos BF16 en GGUF pueden convertirse de vuelta a otros formatos para experimentos de LoRA o evaluación comparativa, aunque el flujo no está documentado por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM en BF16: al menos ~55 GB solo para pesos, más KV cache; requiere una A100 80 GB, H100 80 GB o un pool multi-GPU (por ejemplo, 2× RTX 4090 con tensor parallelism no soportado de forma nativa en llama.cpp, por lo que en la práctica se necesita una GPU de 80 GB o cuantización).
- VRAM tras cuantización estimada: ~16-18 GB en Q4_K_M, ~19-21 GB en Q5_K_M, ~29-30 GB en Q8_0 (estimaciones a partir de los 27,32B parámetros; el autor no publica los niveles concretos).
- GPU de consumo: en BF16 no cabe en ninguna; en Q4_K_M podría caber en RTX 4090/3090 (24 GB) con contexto limitado; en Q5_K_M al límite; en Q8_0 requiere 32 GB o más (RTX 5090, A6000).
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python y servidores compatibles con GGUF; vLLM y TGI no consumen GGUF de forma nativa en su flujo estándar.
- Latencia y throughput: no disponibles (no publicados por el autor).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| IsValorum/Qwen3.8-27B-pi-adapted-BF16-GGUF | 27,32B | no disponible | Apache 2.0 | GGUF BF16 | Artefacto de cuantización con adaptador agéntico |
| harness-hub/Qwen3.8-27B-pi-adapted | no disponible | no disponible | no disponible | safetensors (presumible) | Modelo fuente con adaptador "pi" |
| Qwen/Qwen3.8-27B | 27B (presumible) | no disponible | no disponible | safetensors | Modelo base sin adaptador |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Documentación mínima: el autor no publica model card del adaptador, ni datos de entrenamiento, ni evaluación; cualquier uso en producción parte de información insuficiente.
- Riesgo de alucinación: no evaluado; sin benchmarks no puede caracterizarse la fiabilidad del modelo en tareas factuales.
- Idiomas: no declarados; no puede asumirse un soporte multilingüe verificado más allá del comportamiento del modelo base.
- Licencia: Apache 2.0 en este artefacto, pero el autor remite a la model card del modelo fuente para los términos de uso; conviene verificar la licencia del adaptador y del base antes de un despliegue comercial.
- Contexto: sin dato publicado, no debe asumirse una ventana larga; planificar prompts conservadores.
- Trazabilidad: el repositorio no incluye mapa de tensores ni informe de conversión; la verificación se limita al SHA256 del fichero.
- Naturaleza del artefacto: es un paso intermedio de cuantización, no un modelo "listo para producción" en sí mismo; el rendimiento real dependerá de la cuantización que se genere a partir de él.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IsValorum/Qwen3.8-27B-pi-adapted-BF16-GGUF
- Modelo fuente con adaptador: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Modelo base citado: https://huggingface.co/Qwen/Qwen3.8-27B
- llama.cpp (runtime GGUF): https://github.com/ggml-org/llama.cpp
- Ollama (runtime GGUF): https://github.com/ollama/ollama
