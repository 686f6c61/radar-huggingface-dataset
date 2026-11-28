# joeyAIDev/zils-mini-body-adx4v5

## Resumen

Zils d3-mini body es un modelo de lenguaje derivado de newsbang/adjudex-4b-v5, que a su vez es un fine-tune de Qwen/Qwen3.5-4B. Lo publica el usuario joeyAIDev bajo el identificador joeyAIDev/zils-mini-body-adx4v5 y se presenta como el "cuerpo" (body) de un modelo de decisión (decision-model) para la subnet Zils, dentro de su variante d3-mini. La model card indica explícitamente que los pesos son idénticos a los del modelo base en la revisión 89b79c7a3c6fdb0a6c767323b8cde555b1a7958d: no hay entrenamiento adicional, solo un reempaquetado para el ecosistema Zils.

El modelo tiene 4.539.265.536 parámetros en formato safetensors (aproximadamente 4,54 mil millones), lo que lo sitúa en la categoría de modelos pequeños-meanos orientados a despliegue eficiente. La arquitectura de referencia es la de Qwen3.5, una familia transformer densa de Alibaba, aunque la información disponible no detalla configuraciones específicas de capas, cabezas de atención ni longitud de contexto para esta variante concreta.

Su relevancia es limitada fuera del contexto de la subnet Zils: se trata de un artefacto de infraestructura para un sistema de decisión distribuido, no de un modelo con mejoras propias verificables. Para desarrolladores e investigadores resulta útil como ejemplo de reutilización de pesos con licencia Apache-2.0 y como punto de partida para evaluar el comportamiento del modelo base adjudex-4b-v5, pero no aporta innovaciones técnicas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B, segun tags del modelo) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base newsbang/adjudex-4b-v5, que es un fine-tune de Qwen/Qwen3.5-4B. La model card de este repositorio no documenta la arquitectura interna (número de capas, dimensión oculta, mecanismo de atención, uso de RoPE, etc.), por lo que los detalles deben consultarse en la documentación del modelo original. Los tags indican la familia qwen3_5, lo que sugiere una arquitectura transformer densa estándar de la serie Qwen3.5.

No se ha realizado entrenamiento adicional en este repositorio: la model card afirma que los pesos son "unchanged weights" del modelo base en la revisión indicada. Por tanto, no hay datos sobre composición del dataset, número de tokens de entrenamiento, ni fases de RLHF, DPO o ajuste por preferencias en esta ficha. Cualquier innovación técnica (decodificación especulativa, atención lineal, etc.) sería heredada del modelo base y no está documentada aquí.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base adjudex-4b-v5 (fine-tune de Qwen3.5-4B).
- Capacidad de decisión (decision-model), según el tag declarado por el autor; no se especifica el tipo de decisión ni el formato de salida.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (el campo de idiomas no está declarado).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Integración en la subnet Zils como cuerpo de un modelo de decisión d3-mini: el uso previsto es servir como componente de pesos dentro del pipeline de la subnet, sustituyendo o versionando el cuerpo del modelo de decisión.
- Evaluación comparativa del modelo base adjudex-4b-v5: al ser pesos idénticos, permite reproducir resultados del modelo original en un entorno controlado sin depender de la revisión original.
- Punto de partida para fine-tunes propios: al estar bajo Apache-2.0 y en safetensors, se puede partir de estos pesos para ajustes específicos de dominio con herramientas estándar (Transformers, PEFT, etc.).
- Despliegue en entornos con recursos limitados: con 4,54 mil millones de parámetros, es viable en GPUs de consumo alto (por ejemplo, 24 GB de VRAM en cuantización de 8 bits o inferior) para tareas de generación de texto.
- Investigación sobre linaje de modelos: útil para estudiar cadenas de fine-tunes (Qwen3.5-4B → adjudex-4b-v5 → zils-mini-body) y sus implicaciones de licencia y atribución.
- Pruebas de reproducibilidad y trazabilidad: la model card fija una revisión concreta del modelo base, lo que facilita auditorías de procedencia en pipelines de MLOps.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (4,54 mil millones de parámetros), en FP16 requeriría aproximadamente 9-10 GB de pesos más overhead de activaciones y KV cache; en cuantización de 8 bits, alrededor de 5 GB; en 4 bits, alrededor de 3 GB.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cabría en GPUs de consumo como RTX 3090, RTX 4090 o RTX 5090 en FP16, y en GPUs profesionales A100, H100 o L40S para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, previsiblemente en modelos con 16 GB o más de VRAM en cuantizaciones de 8 bits o inferiores; no confirmado por el autor.
- Opciones de despliegue: no documentadas. Al estar en safetensors, es compatible con cargadores estándar de Transformers; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| joeyAIDev/zils-mini-body-adx4v5 | 4.539.265.536 | no disponible | Apache-2.0 | Hugging Face | Pesos idénticos a adjudex-4b-v5 |
| newsbang/adjudex-4b-v5 | no disponible en esta ficha | no disponible | Apache-2.0 | Hugging Face | Modelo base directo |
| Qwen/Qwen3.5-4B | no disponible en esta ficha | no disponible | no disponible en esta ficha | Hugging Face | Modelo original de la familia |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No hay entrenamiento propio: los pesos son idénticos al modelo base, por lo que cualquier sesgo, alucinación o limitación del modelo original se hereda sin cambios.
- La model card no documenta idiomas soportados, longitud de contexto ni comportamiento en tareas específicas; no se debe asumir ningún rendimiento sin evaluarlo.
- El tag "decision-model" no viene acompañado de especificación del formato de decisión, esquema de salida ni métricas; su uso en producción requiere validación propia.
- Licencia Apache-2.0 permite uso comercial, pero se debe mantener la atribución a los autores originales (newsbang y Qwen) según los términos de la licencia y el aviso NOTICE del repositorio.
- El autor declara no tener afiliación ni respaldo de los autores originales; la trazabilidad depende de la revisión fijada del modelo base.
- Riesgo de alucinación y sesgos: no evaluado en esta ficha; se recomienda consultar la documentación de adjudex-4b-v5 y Qwen3.5-4B.
- Sin descargas ni likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joeyAIDev/zils-mini-body-adx4v5
- Modelo base: https://huggingface.co/newsbang/adjudex-4b-v5
- Modelo original de la familia: https://huggingface.co/Qwen/Qwen3.5-4B
