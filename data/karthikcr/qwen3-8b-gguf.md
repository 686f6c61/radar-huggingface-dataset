# karthikcr/Qwen3-8B-GGUF

## Resumen

Qwen3-8B-GGUF es una cuantización en formato GGUF del modelo Qwen/Qwen3-8B, publicada por el usuario karthikcr. Se trata de un artefacto de conversión, no de un modelo entrenado desde cero: el autor tomó los pesos originales de Qwen3-8B (8.190.735.360 parámetros) y los convirtió a GGUF con `convert_hf_to_gguf.py --outtype f16` para después cuantizarlos a Q4_K_M con `llama-quantize` de llama.cpp v0.7.0, sin matriz de importancia (imatrix: false).

El propósito declarado es servir como baseline de CPU en un proyecto personal de benchmarking (reel-history-k8s), que lo compara con variantes AWQ y GPTQ ejecutadas sobre vLLM. Por tanto, su interés práctico es limitado: reproduce una receta de cuantización estándar sobre un modelo conocido y no aporta optimizaciones propias ni ajustes finos.

El modelo base Qwen3-8B pertenece a la familia Qwen3 de Alibaba, con licencia Apache 2.0 y arquitectura transformer densa. Esta publicación concreta solo distribuye el archivo `Qwen3-8B-Q4_K_M.gguf` (5.027.784.096 bytes, aproximadamente 5,0 GB), pensado para inferencia en CPU o GPU de gama media mediante llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen/Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (depende del modelo base Qwen3-8B) |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

Esta publicación no entrena ni modifica la arquitectura: es una conversión de pesos. La arquitectura subyacente es la del modelo Qwen/Qwen3-8B, un transformer denso de 8.190.735.360 parámetros, según los metadatos de safetensors del modelo base. No se dispone en la información proporcionada de detalles sobre número de tokens de entrenamiento, composición del dataset, fases de RLHF/DPO ni innovaciones técnicas del modelo original.

El proceso de conversión sí está documentado por el autor: conversión a F16 con `convert_hf_to_gguf.py` y cuantización posterior a Q4_K_M con `llama-quantize`, sin matriz de importancia. El trabajo se ejecutó en Modal (entorno CPU only, 8 núcleos, 32 GiB de RAM solicitados), con un tiempo total de 97,0 s (59 s de conversión, 38 s de cuantización) y un coste de 0,0171 USD según tarifas de Modal del 24 de octubre de 2026. El commit del modelo base referenciado es `b968826d9c46dd6066d109eabc6255188de91218`.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen3-8B (pipeline text-generation, tag conversational).
- Razonamiento, código y matemáticas: capacidades propias de Qwen3-8B, no documentadas de forma específica en esta publicación.
- Soporte de tool calling / function calling: no verificado en esta publicación; depende de la plantilla de chat incluida en el GGUF.
- Soporte de agentes y razonamiento multi-paso: no documentado en esta model card.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking: no documentado en esta publicación (es una característica del modelo base Qwen3, pero no se confirma su preservación en esta conversión).
- Inferencia en CPU mediante llama.cpp y compatibilidad con endpoints (tag `endpoints_compatible`).

## Casos de uso

- Baseline de CPU en experimentos de benchmarking: el autor lo usa como referencia frente a variantes AWQ y GPTQ en vLLM, lo que permite medir la penalización de latencia y throughput de la cuantización GGUF frente a cuantizaciones de GPU.
- Inferencia local en equipos sin GPU: al ocupar unos 5 GB en disco, puede ejecutarse con llama.cpp en portátiles o servidores con CPU y 8-16 GB de RAM, útil para prototipos y pruebas offline.
- Despliegue rápido con llama.cpp: el comando `llama-cli -hf karthikcr/Qwen3-8B-GGUF` permite lanzar el modelo sin descargar manualmente los pesos ni configurar un servidor.
- Evaluación de calidad de cuantización Q4_K_M: sirve para comparar la degradación de un Q4_K_M sin imatrix frente a cuantizaciones con matriz de importancia en tareas de generación de texto.
- Pruebas de integración en pipelines de CI: al ser un artefacto pequeño y de descarga rápida (5 GB), encaja en tests automatizados que necesiten un modelo generativo real sin depender de APIs externas.
- Docencia y reproducción de recetas: el script `quant/gguf.sh` del repositorio del autor documenta paso a paso la conversión y cuantización, lo que lo convierte en material útil para aprender el flujo de llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas del proceso de conversión y cuantización (tiempo de pared de 97,0 s, coste de 0,0171 USD, tamaño del archivo de 5.027.784.096 bytes), no métricas de calidad del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica de forma estricta, ya que el archivo está pensado para CPU; en GPU, el archivo Q4_K_M de ~5 GB requiere al menos 6 GB de VRAM para cargarse completo, más espacio para el contexto.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090, A100, H100) puede ejecutar el GGUF mediante llama.cpp con offload total o parcial.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM; en GPUs de 6 GB requeriría offload parcial a CPU.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (importando el GGUF), y cualquier runtime compatible con GGUF; no es directamente compatible con vLLM, que requiere formatos como safetensors, AWQ o GPTQ.
- Latencia y throughput: no disponibles en la información proporcionada; el autor no publica cifras de rendimiento de inferencia, solo del proceso de cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| karthikcr/Qwen3-8B-GGUF (esta publicacion) | 8,19 B | no disponible | GGUF Q4_K_M | Apache 2.0 | Cuantizacion sin imatrix, baseline de CPU |
| Qwen/Qwen3-8B (modelo base) | 8,19 B | no disponible en la informacion | safetensors | Apache 2.0 | Pesos originales en precision completa |
| Variantes AWQ/GPTQ de Qwen3-8B | 8,19 B | no disponible | AWQ / GPTQ | Apache 2.0 (heredada) | Referenciadas por el autor como alternativas para vLLM, sin enlaces concretos en la model card |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Es una cuantización Q4_K_M sin matriz de importancia, lo que puede implicar una pérdida de calidad mayor que cuantizaciones con imatrix en tareas sensibles (código, matemáticas, razonamiento largo).
- El autor no documenta evaluación de calidad ni benchmarks; no hay evidencia publicada de que el Q4_K_M preserve fielmente el comportamiento del modelo base.
- Sesgos conocidos: no documentados en esta publicación; hereda los del modelo base Qwen3-8B, que tampoco se detallan aquí.
- Riesgo de alucinación: no evaluado en esta publicación; es una característica intrínseca de los modelos generativos y no se mitiga con la cuantización.
- Limitaciones de contexto e idioma: no disponibles; la longitud de contexto efectiva depende de la configuración de llama.cpp y de la arquitectura del modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia y condiciones del modelo base Qwen/Qwen3-8B, así como las obligaciones de atribución.
- Publicación de baja tracción (82 descargas, 0 likes) y sin mantenimiento declarado; para producción es más recomendable acudir a cuantizaciones oficiales o de organizaciones consolidadas.
- No compatible directamente con vLLM ni con TGI; requiere llama.cpp u otro runtime GGUF.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/karthikcr/Qwen3-8B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio del proyecto de benchmarking: https://github.com/kikugo/reel-history-k8s
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Tarifas de Modal: https://modal.com/pricing
