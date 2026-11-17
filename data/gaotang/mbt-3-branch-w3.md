# gaotang/MBT-3-branch-W3

## Resumen

MBT-3-branch-W3 es un checkpoint de investigación de 1.482.172.032 parámetros desarrollado por gaotang (GaotangLi) dentro de su línea de experimentos Multi-Branch Transformer (MBT). Se trata del modelo final "Balanced 3-branch Joint-KV" en la escala W3, una arquitectura propietaria que combina un transformer multi-rama con mezcla de expertos (MoE) y un esquema de atención con KV compartida entre ramas. El modelo está entrenado sobre 57.942.212.608 tokens con una longitud de contexto de 4.096 tokens y una pérdida de validación fija de 2.451 tras 55.258 actualizaciones del optimizador.

Su relevancia es estrictamente investigadora: no es un modelo listo para producción. El checkpoint se distribuye en formato nativo `mbt-native-shared-kv-v1`, requiere la implementación Megatron personalizada del proyecto y no es compatible con `AutoModel` de Transformers ni con vLLM. No incluye tokenizador (hay que obtener por separado el de Llama 3) ni runtime de inferencia.

La ficha se basa únicamente en la model card y en los metadatos del repositorio de Hugging Face; no se han publicado benchmarks ni documentación adicional sobre capacidades, por lo que muchos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multi-Branch Transformer con Joint-KV y mixture-of-experts (3 ramas, asignación 4 / (5+5+5) / 4) |
| Parametros totales | 1.482.172.032 (1,48 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 4.096 tokens (entrenamiento) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors sin cuantizar) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato nativo `mbt-native-shared-kv-v1`) |
| Escala | W3 |
| Tokens de entrenamiento | 57.942.212.608 |
| Actualizaciones del optimizador | 55.258 |
| Pérdida de validación fija | 2.451 |
| Conjunto de validación | 12.160 secuencias held-out fijas |
| SHA256 de `model.safetensors` | `16af40a0baca2e7dfa3de7db52adf2f16753d1fc078e0e68805aa97defa318b4` |
| Tamaño del repo | 3,0 GB |

## Arquitectura y entrenamiento

La arquitectura es un Multi-Branch Transformer con atención Joint-KV compartida entre ramas y capas de mezcla de expertos. La asignación "4 / (5 + 5 + 5) / 4" describe el reparto de bloques en la red: cuatro bloques iniciales, un cuerpo central de tres ramas de cinco bloques cada una y cuatro bloques finales. El checkpoint conserva los nombres de tensores originales y los buffers persistentes de enrutamiento (routing buffers) del MoE, lo que confirma que el enrutamiento forma parte del grafo exportado.

El entrenamiento se realizó sobre 57.942.212.608 tokens con contexto de 4.096 tokens y un total de 55.258 pasos de optimizador, alcanzando una pérdida de validación de 2.451 sobre un conjunto fijo de 12.160 secuencias. La model card no detalla la composición del dataset, el uso de RLHF/DPO ni innovaciones de decodificación; tampoco se especifica el número de expertos ni la fracción de parámetros activos. El checkpoint no incluye estado del optimizador, RNG, dataset ni tokenizador, y requiere la implementación nativa basada en Megatron del proyecto Multi-Branch Transformer para cargarse.

## Capacidades

- Generación de texto en inglés (pipeline declarado: `text-generation`).
- Arquitectura de investigación con enrutamiento MoE persistente, orientada a experimentación sobre atención multi-rama y KV compartida.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del inglés.
- No se documentan modos especiales (thinking, visión, audio) ni capacidades de código o matemáticas verificadas.
- El checkpoint es "model-only": no incluye runtime de inferencia ni tokenizador.

## Casos de uso

- Investigación sobre arquitecturas multi-rama: el checkpoint permite reproducir y analizar el comportamiento de la atención Joint-KV frente a transformers estándar, cargándolo con la implementación nativa Megatron del proyecto.
- Estudio comparativo de eficiencia MoE: los buffers de enrutamiento persistentes permiten inspeccionar cómo se distribuye el cómputo entre expertos en las tres ramas.
- Reproducción de experimentos de escalado: la escala W3 y los registros de validación fija (12.160 secuencias, pérdida 2.451) sirven como punto de referencia para nuevas escalas del mismo proyecto.
- Análisis de asignación de bloques: la configuración 4 / (5+5+5) / 4 permite estudiar el efecto del reparto de profundidad entre ramas en tareas de modelado de lenguaje.
- Base para fine-tuning experimental: al ser un checkpoint de pesos completos en safetensors, puede servir como inicialización para experimentos académicos con la misma pila de software.
- Docencia y divulgación: útil para explicar arquitecturas híbridas multi-rama y MoE con un modelo de 1,48 B parámetros y contexto de 4.096 tokens.
- No es adecuado para despliegues de producción, atención al cliente, generación de código en CI/CD ni aplicaciones comerciales, dado que no hay runtime, tokenizador ni licencia declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada es la pérdida de validación fija de 2.451 sobre 12.160 secuencias held-out, sin comparación con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 5,9 GB solo para pesos (1,48 B × 4 bytes), más activaciones y buffers de enrutamiento.
- VRAM estimada en fp16/bf16: aproximadamente 3,0 GB para pesos, más overhead de activaciones y KV cache.
- No se publican cuantizaciones (GGUF, GPTQ, AWQ), por lo que no hay estimaciones para 4 u 8 bits.
- GPU recomendadas: no disponible; al no existir runtime estándar, no se puede garantizar compatibilidad con A100, H100 ni RTX 4090 sin la implementación nativa Megatron.
- Compatibilidad con GPU de consumo: en principio los pesos en bf16 cabrían en GPUs con 8 GB o más, pero la ausencia de runtime y de cuantizaciones impide confirmarlo.
- Opciones de despliegue: no compatible con vLLM, llama.cpp, Ollama ni TGI; requiere la implementación nativa basada en Megatron del proyecto Multi-Branch Transformer.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma familia (otras escalas MBT) ni alternativas con arquitectura multi-rama y KV compartida cuyos datos permitan una comparación rigurosa de parámetros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- Checkpoint exclusivamente de investigación: no incluye runtime de inferencia ni tokenizador; hay que obtener el tokenizador de Llama 3 por separado bajo sus propios términos de acceso y licencia.
- No compatible con `AutoModel` de Transformers ni con vLLM; requiere la implementación nativa Megatron del proyecto.
- Licencia no declarada: no se puede asumir uso comercial ni redistribución.
- Solo inglés: no se documenta soporte multilingüe.
- Contexto limitado a 4.096 tokens, insuficiente para muchas aplicaciones de contexto largo.
- Riesgo de alucinación y sesgos: no evaluado ni documentado por el autor.
- Sin benchmarks públicos: no hay evidencia de rendimiento en tareas estándar (MMLU, HumanEval, GSM8K).
- Repositorio sin descargas ni likes en el momento de la consulta, lo que reduce la validación comunitaria.
- El SHA256 publicado permite verificar la integridad de `model.safetensors`, pero no sustituye a una auditoría del código de carga.

## Enlaces

- Hugging Face: https://huggingface.co/gaotang/MBT-3-branch-W3
- Proyecto Multi-Branch Transformer: https://github.com/GaotangLi/Multi-Branch-Transformer
