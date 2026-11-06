# liodon-ai/Octen-WebGR-4B-FP8

## Resumen

Octen-WebGR-4B-FP8 es una cuantización en FP8 dinámico del modelo Octen/Octen-WebGR-4B, publicada por Liodon AI. Se trata de un modelo de generación de texto de 4.358.012.416 parámetros (aproximadamente 4,36 mil millones) construido sobre la arquitectura Qwen3, según indican las etiquetas del repositorio. El modelo original ocupa 8,7 GB en precisión completa y esta versión cuantizada reduce el peso a 5,1 GB, manteniendo los pesos en formato safetensors y compatible con transformers.

La relevancia de esta ficha radica en que ofrece una vía de despliegue más eficiente en memoria del modelo base, sin necesidad de un conjunto de calibración: el esquema FP8_DYNAMIC castea los pesos a FP8 (E4M3) por canal y cuantiza las activaciones de forma dinámica por token en tiempo de inferencia. Esto lo hace atractivo para servir el modelo en GPUs Ada/Hopper/Blackwell con vLLM, TGI o SGLang, reduciendo el consumo de VRAM frente a la versión en BF16.

No obstante, la información pública disponible es limitada: la model card no detalla la composición del dataset de entrenamiento, los idiomas soportados ni resultados de benchmarks. La licencia figura como "other", sin que se especifiquen sus términos concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3, segun tags del repositorio) |
| Parametros totales | 4.358.012.416 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 dinamico (pesos E4M3 por canal, activaciones FP8 por token); lm_head sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | other (terminos no especificados) |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base Octen-WebGR-4B emplea una arquitectura transformer de la familia Qwen3, con 4.358.012.416 parámetros totales. Esta versión concreta es una cuantización, no un reentrenamiento: los pesos se obtuvieron mediante llm-compressor con el esquema FP8_DYNAMIC, que castea los pesos a FP8 (E4M3) por canal de forma anticipada y cuantiza las activaciones dinámicamente por token durante la inferencia. Al no requerir dataset de calibración, los pesos cuantizados son numéricamente un casteo directo del original, sin sesgo introducido por el conjunto de calibración. La capa lm_head se deja sin cuantizar por su tamaño reducido y su impacto desproporcionado en la calidad.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base pasó por fases de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá de la propia cuantización.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Compatible con pipelines de text-generation mediante transformers.
- Soporte de despliegue en vLLM, Text Generation Inference (TGI) y SGLang.
- Ejecución FP8 nativa en GPUs con compute capability ≥ 8.9 (Ada, Hopper, Blackwell); en GPUs anteriores se produce dequantización automática.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Servicio de generación de texto conversacional en producción: el modelo puede desplegarse con `vllm serve liodon-ai/Octen-WebGR-4B-FP8` para atender peticiones de chat multi-turno, aprovechando la reducción de memoria del FP8 frente al modelo en BF16.
- Despliegue en GPUs de gama profesional con memoria limitada: al ocupar 5,1 GB de pesos, permite instanciar el modelo en GPUs como L4 o L40S con margen para caché KV y batching, algo más ajustado en la versión de 8,7 GB.
- Backend de asistentes integrados en aplicaciones: la compatibilidad con TGI permite exponer el modelo tras un endpoint HTTP estándar, facilitando su integración en arquitecturas de microservicios.
- Prototipado e investigación con transformers: al mantener el formato safetensors y la librería transformers, se puede cargar directamente en scripts de experimentación sin infraestructura adicional.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la degradación de calidad del esquema FP8_DYNAMIC frente al modelo base en tareas concretas del dominio de despliegue.
- Inferencia de bajo coste en entornos con GPUs Blackwell o GB10: el soporte nativo de FP8 en estas arquitecturas permite aprovechar el ahorro de memoria sin penalización por dequantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,1 GB solo para los pesos en FP8; hay que sumar la memoria para caché KV y overhead del runtime, que depende de la longitud de contexto y del tamaño de batch (no disponible en la información proporcionada).
- GPU recomendadas: NVIDIA con compute capability ≥ 8.9 para FP8 nativo, es decir, RTX 40-series, L4, L40S, H100, H200, B100, B200 y GB10.
- Cabe en GPU de consumo: sí, en tarjetas RTX 40-series con suficiente VRAM para pesos más caché KV; en GPUs anteriores a Ada, vLLM/TGI dequantizan a un formato de mayor precisión, perdiendo la ventaja de velocidad y memoria.
- Opciones de despliegue: vLLM, Text Generation Inference (TGI) y SGLang, según la model card.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Octen-WebGR-4B-FP8 | 4,36 B | no disponible | FP8 dinamico | other | Hugging Face (23 descargas) |
| Octen-WebGR-4B (base) | 4,36 B | no disponible | BF16 (original) | other | Hugging Face |
| Alternativas de ~4B de la familia Qwen3 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar rendimiento con modelos alternativos de la misma categoría.

## Limitaciones y advertencias

- La licencia figura como "other" sin que se detallen sus términos; es imprescindible revisar las condiciones del modelo base antes de cualquier uso comercial.
- No se documentan los idiomas soportados, lo que impide garantizar calidad en castellano u otros idiomas distintos del que se haya usado en el entrenamiento original.
- No hay información sobre sesgos conocidos ni sobre la composición del dataset de entrenamiento, por lo que no se pueden evaluar sesgos sistemáticos.
- Riesgo de alucinación inherente a los modelos generativos de este tamaño; no se han publicado evaluaciones específicas de fidelidad.
- La cuantización FP8 puede introducir una degradación de calidad respecto al modelo base; no se han publicado comparativas de calidad entre ambas versiones.
- En GPUs con compute capability inferior a 8.9, el runtime dequantiza los pesos, perdiendo las ventajas de memoria y velocidad y pudiendo comportarse de forma distinta a la esperada.
- La longitud de contexto no está documentada, lo que limita la planificación de despliegues con ventanas largas.
- El número de descargas (23) y la ausencia de "likes" sugieren una adopción muy temprana; no hay evidencia comunitaria de robustez en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/liodon-ai/Octen-WebGR-4B-FP8
- Modelo base: https://huggingface.co/Octen/Octen-WebGR-4B
- Perfil del autor de la cuantización: https://huggingface.co/liodon-ai
- Herramienta de cuantización llm-compressor: https://github.com/vllm-project/llm-compressor
