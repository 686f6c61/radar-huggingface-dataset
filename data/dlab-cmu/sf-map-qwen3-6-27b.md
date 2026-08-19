# dlab-cmu/sf-map-qwen3.6-27b

## Resumen

El repositorio `dlab-cmu/sf-map-qwen3.6-27b` no contiene un modelo de lenguaje, sino un **mapa de sensibilidad por tensor** (sensitivity map) diseñado para guiar la cuantización del modelo base Qwen3.6-27B mediante el catálogo compartido de 27 opciones de cuantización definido en [`dlab-cmu/sf-grids`](https://huggingface.co/dlab-cmu/sf-grids). Desarrollado por el grupo dlab-cmu, este artefacto resuelve el problema de asignar de forma óptima los recursos de bits por tensor y por capa de atención cuando se comprime un LLM denso de 27B parámetros.

El archivo `sf-map.json` incluye, para cada tensor de pesos, las divergencias KL directas (`direct_kl`) y plegadas (`folded_kl`), así como los coeficientes α plegados y el error cuadrático medio real medido para las capas de atención completas (clave y valor). La relevancia actual radica en que Qwen3.6-27B es un modelo denso de última generación con ventana de contexto de 256K tokens, y su despliegue en hardware de consumo requiere cuantización agresiva; este mapa permite decidir qué tensores admiten menos bits sin degradar significativamente la calidad.

No se trata de un modelo con parámetros entrenables ni con capacidades generativas, sino de un recurso técnico auxiliar para pipelines de compresión. La licencia MIT permite su uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (artefacto de análisis, no un LLM) |
| Parametros totales | No aplica (contiene métricas por tensor, no pesos) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica (depende del modelo base Qwen3.6-27B, 256K tokens) |
| Tipos de cuantizacion | 27 opciones del catálogo SF (definidas en `dlab-cmu/sf-grids`) |
| Idiomas soportados | No aplica |
| Licencia | MIT |
| Formato de pesos | JSON (`sf-map.json`) |

## Arquitectura y entrenamiento

Este repositorio no describe un modelo entrenado mediante gradientes. Es el resultado de un análisis de sensibilidad realizado sobre el modelo Qwen3.6-27B, presumiblemente utilizando técnicas de propagación de errores y medición de divergencia KL entre las salidas del modelo original y las versiones cuantizadas. El mapa contiene dos tipos de métricas por tensor: `direct_kl`, que mide la divergencia KL directa al cuantizar cada tensor de forma aislada, y `folded_kl`, que mide la divergencia después de plegar la cuantización en la operación de matmul (técnica común en métodos como GPTQ o AWQ). Para las capas de atención completas, se proporciona además un coeficiente α plegado y el error cuadrático medio real medido, lo que permite una asignación asimétrica de bits entre las proyecciones K y V.

La recomendación del autor es usar `direct_kl` para cuantizaciones de 2 bits por peso (bpw) o superiores, y `folded_kl` para cuantizaciones por debajo de 2 bpw. La asignación de bits para clave y valor se realiza de forma asimétrica combinando el α plegado con el MSE medido, lo que refleja que las capas de atención suelen tener sensibilidades muy distintas entre K y V.

## Capacidades

- Proporciona métricas de sensibilidad por tensor para el modelo Qwen3.6-27B, permitiendo identificar qué capas y tensores toleran cuantización agresiva.
- Incluye dos variantes de divergencia KL (directa y plegada) para adaptarse a diferentes rangos de bits por peso.
- Ofrece datos específicos para capas de atención completas, con coeficientes α y MSE reales, facilitando la asignación asimétrica de bits entre K y V.
- Es compatible con el catálogo de 27 opciones de cuantización definido en `dlab-cmu/sf-grids`, lo que permite elegir la configuración óptima por tensor.
- No es un modelo generativo: no genera texto, código ni realiza razonamiento. Su única función es servir como guía de cuantización.

## Casos de uso

- **Cuantización mixta de Qwen3.6-27B para GPU de consumo**: el mapa permite asignar 2-3 bits a tensores con baja sensibilidad (según `direct_kl`) y 4-6 bits a tensores críticos, reduciendo la VRAM necesaria de ~54 GB (FP16) a menos de 20 GB, haciéndolo ejecutable en una RTX 4090 o similar.
- **Despliegue en entornos con memoria limitada**: al conocer qué capas pueden usar cuantización por debajo de 2 bpw mediante `folded_kl`, se pueden alcanzar compresiones extremas (1.5-1.8 bpw) manteniendo la calidad aceptable para tareas de generación de código o chat.
- **Optimización de la ventana de contexto**: dado que Qwen3.6-27B soporta 256K tokens, la cuantización de las capas de atención (usando α y MSE) permite reducir el coste de memoria de los KV-cache, habilitando contextos largos en hardware con menos VRAM.
- **Investigación en compresión de LLMs**: el mapa sirve como referencia empírica para estudiar la relación entre la sensibilidad por tensor y el error final, permitiendo validar nuevos algoritmos de asignación de bits.
- **Integración en pipelines de cuantización automática**: herramientas como AutoGPTQ o llama.cpp pueden consumir `sf-map.json` para decidir dinámicamente la configuración de bits por capa, sustituyendo heurísticas genéricas por datos medidos.
- **Evaluación de trade-offs calidad/compresión**: los valores de KL y MSE permiten predecir el impacto de cada nivel de cuantización antes de ejecutar la compresión, ahorrando tiempo de experimentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no contiene métricas de rendimiento del modelo cuantizado final (como MMLU, HumanEval o SWE-bench). Las únicas métricas incluidas son las divergencias KL y MSE internas del proceso de cuantización, que no son comparables directamente con benchmarks de tareas.

## Requisitos de hardware

- El archivo `sf-map.json` es un documento JSON ligero (probablemente de pocos megabytes) que no requiere GPU para su procesamiento; puede cargarse en CPU.
- Para aplicar el mapa y cuantizar Qwen3.6-27B, se necesita acceso al modelo base (aproximadamente 54 GB en FP16) y una GPU con al menos 24 GB de VRAM para el proceso de calibración.
- El modelo cuantizado resultante puede ejecutarse en GPUs de consumo: con cuantización a 4 bits (usando `direct_kl`), se estima que cabría en una RTX 3090/4090 (24 GB). Con cuantización mixta por debajo de 2 bpw (usando `folded_kl`), podría caber en GPUs de 12-16 GB.
- Opciones de despliegue del modelo cuantizado: llama.cpp, vLLM, Ollama o TGI, dependiendo del formato de pesos generado (GGUF, GPTQ, etc.).
- No se dispone de datos de latencia o throughput específicos para este artefacto; dependerán del formato de cuantización final y del hardware.

## Comparativa con modelos similares

No disponible. No existen otros mapas de sensibilidad públicos comparables para Qwen3.6-27B en la información proporcionada. Métodos alternativos de cuantización como GPTQ, AWQ o GGUF suelen emplear heurísticas globales (por ejemplo, activación media) en lugar de mapas por tensor específicos de un modelo. Este repositorio es único en su enfoque de proporcionar métricas detalladas por tensor para un modelo concreto.

## Limitaciones y advertencias

- Este repositorio **no es un modelo de lenguaje** y no puede utilizarse directamente para generación de texto, código o razonamiento. Es un recurso auxiliar para cuantización.
- Los valores de sensibilidad se basan en un análisis específico del modelo Qwen3.6-27B; no son transferibles a otros modelos o variantes.
- La recomendación de usar `direct_kl` por encima de 2 bpw y `folded_kl` por debajo es una guía empírica del autor; no se han publicado validaciones exhaustivas en benchmarks públicos.
- La asignación asimétrica de bits K/V se basa en mediciones de MSE, pero el rendimiento final depende del dataset de calibración utilizado, que no se especifica en la información disponible.
- Aunque la licencia MIT permite uso comercial, el catálogo `dlab-cmu/sf-grids` y el propio modelo base Qwen3.6-27B pueden tener licencias diferentes; es necesario verificar los términos de cada componente.
- No se proporcionan scripts ni ejemplos de cómo consumir `sf-map.json`; el usuario debe implementar su propia lógica de asignación de bits.

## Enlaces

- Repositorio HuggingFace: [dlab-cmu/sf-map-qwen3.6-27b](https://huggingface.co/dlab-cmu/sf-map-qwen3.6-27b)
- Catálogo SF compartido: [dlab-cmu/sf-grids](https://huggingface.co/dlab-cmu/sf-grids)
- Guía de Qwen 3.6 (insiderllm): [Qwen 3.6 Complete Guide](https://insiderllm.com/guides/qwen-3-6-local-ai-guide/)
- Repositorio oficial Qwen3.6: [QwenLM/Qwen3.6](https://github.com/QwenLM/Qwen3.6)
- Guía de Qwen 3.6-27B (aimadetools): [Qwen 3.6-27B Complete Guide](https://www.aimadetools.com/blog/qwen-3-6-27b-complete-guide/)
- Guía de ejecución local (dev.to): [How to Run Qwen 3.6 Locally](https://dev.to/purpledoubled/how-to-run-qwen-36-locally-27b-dense-35b-moe-and-coding-variants-setup-guide-4di)
- Documentación técnica de Qwen3.6 (DeepWiki): [Qwen3.6 Models](https://deepwiki.com/QwenLM/Qwen3.6/1.1-qwen3.6-models)
