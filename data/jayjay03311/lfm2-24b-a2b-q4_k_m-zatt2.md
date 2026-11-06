# jayjay03311/LFM2-24B-A2B-Q4_K_M-ZATT2

## Resumen

LFM2-24B-A2B-Q4_K_M-ZATT2 es una cuantización GGUF en formato Q4_K_M del modelo LFM2-24B-A2B desarrollado originalmente por Liquid AI, publicada por el usuario jayjay03311 en Hugging Face. El modelo base es un transformer de tipo Mixture of Experts (MoE) con 24 mil millones de parámetros totales y aproximadamente 2 mil millones de parámetros activos por token, diseñado por Liquid AI como parte de su familia LFM2. Esta ficha describe la variante cuantizada, que conserva la licencia MIT del modelo original.

La relevancia de esta publicación radica en que permite ejecutar un MoE de gran tamaño con un coste computacional por token reducido, gracias a su reducida activación de parámetros. Sin embargo, la model card del repositorio no aporta información técnica adicional más allá de la licencia MIT, y no se han publicado resultados de benchmarks ni detalles de entrenamiento en la información disponible. La fecha de creación del repositorio (2026-11-06) y la ausencia de descargas o likes indican que se trata de una publicación reciente y sin validación comunitaria.

Dado que el autor no documenta el proceso de cuantización ni las herramientas empleadas (por ejemplo, llama.cpp o similar), esta ficha se apoya en las características conocidas del modelo base LFM2-24B-A2B de Liquid AI y en las convenciones habituales de las cuantizaciones GGUF Q4_K_M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) |
| Parametros totales | 24 mil millones (24B) |
| Parametros activos | aproximadamente 2 mil millones (2B) por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base LFM2-24B-A2B emplea una arquitectura de transformer con mezcla de expertos (MoE), con 24B parámetros totales y aproximadamente 2B activos por token. Esta configuración permite un coste de inferencia por token comparable al de un modelo denso de ~2B, manteniendo la capacidad representacional de un modelo mucho mayor. La información disponible no detalla el número de expertos, la estrategia de enrutamiento ni la composición del dataset de entrenamiento.

No se dispone de datos sobre el número de tokens de entrenamiento, la presencia de fases de RLHF o DPO, ni innovaciones técnicas específicas del modelo base en la información proporcionada. La variante aquí descrita es una cuantización Q4_K_M en formato GGUF, un esquema de cuantización por bloques de 4 bits con escalas de 6 bits para los pesos más sensibles, orientado a reducir el uso de memoria y facilitar la inferencia en CPU y GPU de gama consumer. El proceso concreto de cuantización empleado por el autor no está documentado.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base LFM2-24B-A2B.
- Capacidad de ejecución local gracias al formato GGUF y a la cuantización Q4_K_M.
- Eficiencia de inferencia por token derivada de su naturaleza MoE con ~2B parámetros activos.
- Soporte de tool calling, agentes y razonamiento multi-paso: no disponible en la información proporcionada para esta variante.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo: la cuantización Q4_K_M permite cargar un MoE de 24B parámetros en equipos con memoria unificada o GPU de gama alta, manteniendo un coste por token bajo gracias a los ~2B parámetros activos.
- Prototipado de asistentes conversacionales en local: útil para desarrolladores que quieran experimentar con un modelo de gran capacidad sin depender de APIs externas, aunque la ausencia de benchmarks exige validación propia.
- Generación de texto y resumen en entornos con requisitos de privacidad: al ejecutarse en hardware propio, los datos no salen del entorno del usuario.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la pérdida de calidad de Q4_K_M frente a otros formatos del mismo modelo base.
- Investigación sobre eficiencia de MoE: permite estudiar el comportamiento de un MoE de 24B/2B activos en hardware consumer.
- Integración en pipelines de CI/CD para pruebas de modelos: su licencia MIT facilita su uso en entornos corporativos y de investigación sin restricciones adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta variante cuantizada. El autor no incluye métricas en la model card ni en los resultados de búsqueda.

## Requisitos de hardware

- VRAM estimada para inferencia en Q4_K_M: aproximadamente 14-16 GB para los pesos del modelo, más overhead de contexto y caché KV (no confirmado por el autor).
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB, H100; también viable en equipos con memoria unificada (Apple Silicon de gama alta, AMD Ryzen AI Max+).
- Cabe en GPU consumer de gama alta con 24 GB o más; en GPUs de 16 GB puede requerir offloading parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, y otros runners compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa sin conversión.
- Latencia y throughput: no disponibles para esta variante concreta; el modelo base LFM2.5-24B-A2B reporta 184 tokens/s en Apple M5 Max y 114 tokens/s en AMD Ryzen AI Max+ 395 según la model card de unsloth, aunque estos datos corresponden a otra variante y no deben extrapolarse sin verificación.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2-24B-A2B-Q4_K_M-ZATT2 (esta ficha) | 24B | ~2B | no disponible | MIT | GGUF Q4_K_M |
| LiquidAI/LFM2-24B-A2B (original) | 24B | ~2B | no disponible | MIT | safetensors (presumible) |
| unsloth/LFM2.5-24B-A2B-GGUF | 24B | ~2B | no disponible | no disponible | GGUF |

La comparativa se limita a variantes del mismo modelo base, ya que no se dispone de información sobre alternativas de otros desarrolladores con características equivalentes en la información proporcionada.

## Limitaciones y advertencias

- La model card del repositorio no documenta el proceso de cuantización ni las herramientas empleadas, lo que impide verificar la fidelidad de los pesos respecto al modelo original.
- No hay benchmarks publicados para esta variante, por lo que se desconoce la degradación de calidad respecto al modelo base en Q4_K_M.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria.
- No se especifican los idiomas soportados ni la longitud de contexto, lo que limita la planificación de despliegues en producción.
- Riesgo de alucinación y sesgos: no documentados para esta variante; se heredan los del modelo base, no descritos en la información disponible.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base original de Liquid AI antes de un despliegue en producción.
- La fecha de creación del repositorio (2026-11-06) y la ausencia de actualizaciones sugieren que puede tratarse de una publicación no mantenida.

## Enlaces

- Repositorio de esta variante: https://huggingface.co/jayjay03311/LFM2-24B-A2B-Q4_K_M-ZATT2
- Modelo base original: https://huggingface.co/LiquidAI/LFM2-24B-A2B
- Variante GGUF de unsloth: https://huggingface.co/unsloth/LFM2.5-24B-A2B-GGUF
