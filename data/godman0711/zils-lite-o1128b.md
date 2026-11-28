# godman0711/zils-lite-o1128b

## Resumen

zils-lite-o1128b es un modelo de lenguaje de tipo "soup" (mezcla de pesos) publicado por el usuario godman0711 en Hugging Face. Se construye a partir de Qwen/Qwen3.5-0.8B como modelo base y de dos variantes previas de la familia Zils (joamCriff123/zils-lite-l1125a y joamCriff123/zils-lite-l1123q), combinadas mediante un promedio uniforme y posteriormente ajustadas con un LoRA de rango 32 sobre preguntas de decisión derivadas de eventos públicos con "Zils Outcomes" y filas de rehearsal. El escalado del cambio se aplica con un factor de 3.

El modelo cuenta con 852.985.920 parámetros reales (según los pesos en safetensors) y un repositorio de 1,7 GB. La licencia es Apache-2.0, lo que permite uso comercial con atribución. No se especifican idiomas soportados ni pipeline de inferencia en la información disponible.

La relevancia de esta ficha es limitada: se trata de un modelo derivado de una comunidad pequeña (subred Zils, subnet 127), sin descargas ni likes en el momento de la consulta, y sin benchmarks publicados. Resulta útil como ejemplo de flujo de trabajo de fine-tuning con LoRA sobre un modelo base pequeño, pero no hay evidencia de rendimiento que lo respalde para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-0.8B; detalles no disponibles) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; se podría cuantizar a GGUF/AWQ, pero no se documenta) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 0,85 mil millones de parámetros. Sobre esa base se aplica un "model soup": se promedian uniformemente los pesos de dos modelos de la familia Zils (joamCriff123/zils-lite-l1125a y joamCriff123/zils-lite-l1123q), lo que da lugar a un cuerpo intermedio denominado d3-lite soup a3a33d6d.

Posteriormente, ese cuerpo se ajusta con un LoRA de rango 32 sobre un conjunto de preguntas de decisión construidas a partir de eventos públicos con "Zils Outcomes", complementadas con filas de rehearsal (repetición de datos para mitigar olvido catastrófico). El cambio inducido por el LoRA se escala por un factor de 3. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base Qwen/Qwen3.5-0.8B.
- Razonamiento y respuesta a "preguntas de decisión" sobre eventos públicos, que es el objetivo declarado del ajuste LoRA.
- No hay evidencia documentada de soporte de tool calling ni function calling.
- No hay evidencia documentada de capacidades de agente o razonamiento multi-paso.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- No se documentan modos especiales como thinking mode, visión o audio.

## Casos de uso

- Clasificación y respuesta a preguntas de decisión sobre eventos públicos: el ajuste LoRA se entrenó específicamente con este tipo de preguntas, por lo que es el escenario más alineado con el diseño del modelo.
- Prototipado de experimentos de model soup: sirve como ejemplo reproducible de cómo promediar pesos de dos checkpoints y aplicar un LoRA de rango 32 con escalado.
- Investigación sobre olvido catastrófico: el uso de filas de rehearsal en el entrenamiento permite estudiar cómo se preservan capacidades del modelo base tras el fine-tuning.
- Despliegue en entornos con recursos muy limitados: con 0,85 mil millones de parámetros, el modelo cabe en GPUs de consumo y en CPU con cuantización, aunque no se documenten los formatos.
- Evaluación comparativa de variantes Zils: permite contrastar el efecto del soup y del LoRA frente a los checkpoints de origen (l1125a y l1123q).
- Base para nuevos fine-tunings de comunidad: al ser Apache-2.0 y de tamaño reducido, es un punto de partida económico para experimentos adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, unos 2-3 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,9-1,2 GB; en 4 bits: alrededor de 0,5-0,8 GB (estimaciones teóricas, no documentadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobradamente suficientes.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 4 GB o más.
- Opciones de despliegue: al ser safetensors compatible con la arquitectura Qwen, podría cargarse con transformers, vLLM o TGI; para llama.cpp u Ollama requeriría conversión a GGUF, no documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-lite-o1128b | 852.985.920 | no disponible | Apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 mil millones | no disponible | no disponible en la información | Hugging Face |
| joamCriff123/zils-lite-l1125a | no disponible | no disponible | no disponible | Hugging Face |
| joamCriff123/zils-lite-l1123q | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sin benchmarks publicados: no hay evidencia objetiva de calidad, por lo que no debería usarse en producción sin una evaluación propia.
- Riesgo de alucinación: como todo modelo generativo de 0,85 mil millones de parámetros, es propenso a inventar información, especialmente en preguntas de decisión sobre eventos.
- Sesgos desconocidos: no se documenta la composición del dataset de entrenamiento ni los procesos de filtrado, por lo que no se pueden evaluar sesgos.
- Idiomas no declarados: no se especifica qué idiomas soporta; el rendimiento fuera del inglés (si es que el base está orientado a inglés) es incierto.
- Longitud de contexto no disponible: no se puede planificar su uso en conversaciones largas o documentos extensos.
- Escalado del LoRA por factor 3: este ajuste agresivo puede provocar degradación de capacidades generales del modelo base; conviene validarlo empíricamente.
- Licencia Apache-2.0: permite uso comercial, pero exige conservar los avisos de atribución (LICENSE y NOTICE) y no ofrece garantías.
- Modelo de comunidad con 0 descargas y 0 likes: sin validación externa ni soporte; la fecha de creación (2026-11-28) es futura respecto a la información habitual, lo que sugiere metadatos poco fiables.

## Enlaces

- Hugging Face: https://huggingface.co/godman0711/zils-lite-o1128b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Checkpoint previo 1: https://huggingface.co/joamCriff123/zils-lite-l1125a
- Checkpoint previo 2: https://huggingface.co/joamCriff123/zils-lite-l1123q
