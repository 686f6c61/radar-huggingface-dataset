# logic65/Qwen3.8-Whittle-w50-18.3B-unrepaired

## Resumen

Qwen3.8-Whittle-w50-18.3B-unrepaired es un modelo de investigación desarrollado por logic65 (David Aylward) que explora el extremo opuesto del espacio de diseño de compresión frente a los cortes de profundidad: en lugar de eliminar capas enteras, conserva las 64 capas del modelo base Qwen3.8-27B-FP8 y reduce a la mitad el ancho de cada MLP (poda uniforme del 50%). El resultado es un modelo de 18.339.618.304 parámetros (18,3B) que mantiene toda la arquitectura original pero con cada bloque de conocimiento "adelgazado".

La poda se realiza sin entrenamiento de reparación (de ahí el sufijo "unrepaired"), seleccionando las neuronas a conservar según su fuerza medida (norma de la columna de down-projection multiplicada por la desviación estándar de activación sobre un corpus mixto). Las mediciones del autor indican que el conocimiento no se pierde, sino que queda "dormido": la prueba de reconocimiento forzado obtiene 6/7 aciertos frente a 5/7 de la variante con corte de profundidad, lo que sugiere que una sesión corta de ajuste podría recuperar gran parte del rendimiento. El repositorio incluye un paquete de entrenamiento completo para una hora de ajuste con QLoRA en una A100.

Este modelo es relevante para la comunidad de investigación en compresión de modelos, ya que documenta de forma transparente las ventajas y limitaciones de la poda de ancho frente a la poda de profundidad, con datos de evaluación propios y un enfoque reproducible. No está pensado para uso en producción sin el entrenamiento de reparación preparado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención completa y gated-deltanet (según tags), basado en Qwen3.8-27B-FP8, con MLP al 50% de ancho en las 64 capas |
| Parametros totales | 18.339.618.304 (18,3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo contiene safetensors; no se mencionan cuantizaciones GGUF) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B-FP8 y aplica una poda de ancho uniforme del 50% en todos los MLP, manteniendo las 64 capas completas, incluyendo la capa de entrada y las capas profundas. La selección de neuronas se realiza por capa según una métrica de fuerza que combina la norma de la columna de la proyección descendente con la desviación estándar de activación, calculada sobre un corpus mixto. No se aplica ningún entrenamiento de reparación posterior, por lo que los pesos podados se mantienen tal cual.

El autor describe dos familias de poda en el proyecto Whittle: la de corte de profundidad (eliminando capas enteras) y esta de corte de ancho. La hipótesis es que el conocimiento eliminado en el corte de profundidad desaparece por completo, mientras que en el corte de ancho queda latente y puede recuperarse con un ajuste corto. Las mediciones internas apoyan esta hipótesis: la prueba de reconocimiento forzado obtiene 6/7 en esta variante frente a 5/7 en la de profundidad, y la batería de recuerdo de 39 prompts baja de 34/39 a 27/39, pero con respuestas "dormidas" en lugar de ausentes.

El repositorio incluye un paquete de entrenamiento para una sesión de una hora en A100: QLoRA con nf4, rango 64 en todas las capas lineales incluyendo las proyecciones de gated-deltanet, un conjunto de datos de ~10M tokens (páginas de libros completas de 4096 tokens, ejercicios de código con fences, sesiones multi-turno con formato de herramientas, y anclas de hechos y aritmética), y una celda de Colab lista para ejecutar.

## Capacidades

- Generación de texto y conversación: el modelo mantiene la capacidad de generar texto coherente, aunque con confianza reducida en tareas de recuerdo difícil (el autor reporta que la probabilidad de la respuesta correcta baja de ~0,5 a 0,026 en un ejemplo concreto).
- Razonamiento básico: conserva la estructura de razonamiento del modelo base, pero con menor precisión en tareas que requieren recuperación exacta de hechos.
- Conocimiento factual: el conocimiento está presente pero "dormido"; la prueba de reconocimiento forzado alcanza 6/7, lo que indica que la información sobrevive a la poda.
- Limitaciones conocidas en el estado sin reparar: salidas vacías ocasionales en prompts de código, y formato Markdown poco fiable (fences inconsistentes).
- No se dispone de información sobre soporte de tool calling, agentes, capacidades multilingües específicas, ni modos de pensamiento explícitos.

## Casos de uso

- Investigación en compresión de modelos: este modelo es un caso de estudio ideal para comparar estrategias de poda (ancho vs. profundidad) con el mismo presupuesto de parámetros. Los investigadores pueden reproducir las mediciones del autor y explorar variantes.
- Evaluación de recuperación de conocimiento tras poda: permite estudiar cómo la poda de ancho afecta a la memoria factual y si un ajuste corto puede restaurar el rendimiento, como sugiere el autor.
- Experimentos de ajuste fino con QLoRA: el paquete de entrenamiento incluido permite ejecutar la sesión de "sharpening" de una hora en A100 y medir la mejora en recuerdo y formato de salida.
- Pruebas de generación con control de repetición: el autor recomienda parámetros anti-loop específicos (--dry-multiplier 0.8, --dry-base 1.75, --dry-allowed-length 4, --repeat-penalty 1.15) que pueden validarse en tareas de generación larga.
- Desarrollo de técnicas de poda selectiva: la métrica de selección de neuronas (norma de columna × desviación estándar de activación) puede reutilizarse en otros modelos para comparar resultados.
- Benchmarking de servidores de inferencia: al ser un modelo de 18,3B con pesos en safetensors, puede usarse para probar el rendimiento de llama.cpp (estándar o el fork con soporte de ancho FFN por capa) en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona mediciones internas propias, que se reproducen a continuación:

| Medición | Depth-restored 18.3B | Width-w50 18.3B (este modelo) |
|---|---|---|
| Batería de recuerdo de 39 prompts | 34/39 | 27/39 |
| Generaciones en bucle (DRY desactivado) | 0/6 | 1/6 |
| Reconocimiento forzado | 5/7 (hechos ausentes) | 6/7 (hechos dormidos) |

Estas cifras indican que el modelo de ancho conserva mejor el conocimiento reconocible, pero sufre en recuerdo libre y muestra una ligera tendencia a bucles de generación. No hay datos comparativos con otros modelos de la misma categoría.

## Requisitos de hardware

- No se dispone de datos oficiales de VRAM para inferencia. Con 18,3B parámetros en FP8, una estimación orientativa sería de ~18-20 GB de VRAM en FP8, o menos con cuantización a 4 bits (~10-12 GB), pero estos valores no están confirmados por el autor.
- El autor menciona que el entrenamiento de reparación de una hora está preparado para una GPU A100, lo que sugiere que la inferencia puede ejecutarse en hardware de consumo con suficiente VRAM (por ejemplo, RTX 4090 de 24 GB o similar).
- Opciones de despliegue: el modelo carga en el fork de llama.cpp con soporte de ancho FFN por capa, y también en llama.cpp estándar si se usa ancho uniforme. No se mencionan otros servidores como vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-Whittle-w50-18.3B (este) | 18,3B | No disponible | Apache 2.0 | Poda de ancho 50% MLP, sin reparar |
| Qwen3.8-Whittle-16B | 16B (aprox.) | No disponible | Apache 2.0 | Poda de profundidad (20 de 64 capas eliminadas) + 25% de ancho MLP, con QLoRA de 11M tokens |
| Qwen3.8-27B-FP8 (base) | 27B | No disponible | Apache 2.0 | Modelo original sin podar |

La comparativa se basa en los datos disponibles en la búsqueda web. La variante Whittle-16B representa el enfoque de corte de profundidad, mientras que este modelo representa el de corte de ancho. No hay datos de rendimiento estándar para comparar directamente.

## Limitaciones y advertencias

- Modelo sin entrenamiento de reparación: el rendimiento está claramente degradado respecto al modelo base, especialmente en recuerdo libre y confianza de las respuestas.
- Salidas vacías en prompts de código: el autor reporta que el modelo puede generar respuestas vacías en tareas de código, lo que lo hace inadecuado para uso en producción sin el ajuste de reparación.
- Formato Markdown poco fiable: los fences de código y otros elementos de formato pueden aparecer de forma inconsistente.
- Tendencia a bucles de generación: se observa 1/6 casos de generación en bucle con DRY desactivado; se recomienda usar los parámetros anti-loop sugeridos.
- Sin datos de sesgos o alucinaciones específicos: no se ha evaluado formalmente el comportamiento en cuanto a sesgos o alucinaciones más allá de las mediciones del autor.
- Licencia Apache 2.0 permite uso comercial, pero el estado "unrepaired" y la falta de benchmarks estándar desaconsejan su uso en entornos productivos sin validación adicional.
- El modelo es una vista previa de investigación; no hay garantías de soporte ni mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/logic65/Qwen3.8-Whittle-w50-18.3B-unrepaired
- Variante Whittle-16B (corte de profundidad): https://huggingface.co/logic65/Qwen3.8-Whittle-16B
- Información sobre Qwen3.8 (OpenLM): https://openlm.ai/qwen3.8/
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
