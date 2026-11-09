# Aminadaven/Qwen3.5-4B-3D-Coder-Q4_0-NPU

## Resumen

Qwen3.5-4B-3D-Coder-Q4_0-NPU es una republicación no oficial en formato GGUF Q4_0 del modelo ccore/Qwen3.5-4B-3D-Coder, un ajuste fino independiente de Qwen/Qwen3.5-4B especializado en generar código 3D para Three.js. El repack lo publica el usuario Aminadaven con el objetivo explícito de que el modelo pueda ejecutarse sobre la NPU Hexagon de los SoC Qualcomm Snapdragon mediante el runtime GenieX para llama.cpp, ya que Q4_0 es la única precisión que dicho runtime puede colocar en la NPU según el autor.

El modelo cuenta con 4.205.751.296 parámetros totales (aproximadamente 4,2 mil millones) y un repositorio de 2,8 GB. La cuantización se realizó con llama.cpp a partir del GGUF Q8_0 del autor original, aplicando Q4_0 a las capas y manteniendo el token embedding y la capa de salida en Q8_0. La licencia declarada es Apache-2.0, heredada del modelo base.

La relevancia de esta ficha es acotada: se trata de un repack privado, no probado en dispositivo y sin métricas publicadas. Resulta útil únicamente como pieza de evaluación para despliegues en NPU Hexagon, no como referencia de rendimiento del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B; detalles no disponibles) |
| Parámetros totales | 4.205.751.296 (~4,2 B) |
| Parámetros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_0 (capas) + Q8_0 (token embedding y output) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es ccore/Qwen3.5-4B-3D-Coder, un ajuste fino independiente de Qwen/Qwen3.5-4B orientado a la generación de código Three.js. No se dispone de información sobre la composición del dataset de ajuste fino, el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO. La arquitectura subyacente corresponde a la familia Qwen3.5, de tipo transformer, pero la información proporcionada no detalla innovaciones técnicas específicas (atención lineal, decodificación especulativa u otras).

El proceso de cuantización sí está documentado: se partió del GGUF Q8_0 del autor original y se recuantizó con llama.cpp a Q4_0 en las capas, preservando el token embedding y la capa de salida en Q8_0. Esta elección de precisión mixta responde a la restricción del runtime GenieX, que solo puede asignar Q4_0 a la NPU Hexagon; los ficheros Q4_K_M y Q8_0 del autor original quedan limitados a ejecución en GPU/CPU.

## Capacidades

- Generación de código 3D para Three.js, especialidad declarada del ajuste fino.
- Generación de texto conversacional (etiqueta `conversational` en el repositorio).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Generación de escenas Three.js en prototipado web: el modelo puede producir código de geometría, materiales e iluminación para escenas 3D, aprovechando su ajuste fino específico en este dominio.
- Asistencia en el desarrollo de visualizaciones 3D interactivas: útil para generar esqueletos de código de renderizado que el desarrollador completa y depura después.
- Despliegue en dispositivos Snapdragon con NPU Hexagon: el formato Q4_0 permite, según el autor, ejecutar el modelo en la NPU mediante GenieX, lo que habilita inferencia local en hardware móvil o embebido Qualcomm.
- Evaluación de runtimes NPU para llama.cpp: sirve como banco de pruebas para medir la viabilidad de GenieX en la Hexagon NPU con un modelo de 4,2 B.
- Generación de código offline en entornos sin conectividad: al ser un GGUF de 2,8 GB, puede distribuirse y ejecutarse localmente en dispositivos con recursos limitados.
- Educación y experimentación con cuantización mixta: el esquema Q4_0 en capas con Q8_0 en embedding y output es un caso práctico para estudiar el impacto de la precisión mixta en calidad y velocidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 2,8 GB en Q4_0 con embedding y output en Q8_0; se requiere al menos esa cantidad de memoria, con margen adicional para el contexto KV.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el autor indica que sus ficheros Q4_K_M y Q8_0 originales funcionan en GPU/CPU, pero este repack Q4_0 está pensado para NPU Hexagon.
- Opciones de despliegue: llama.cpp con runtime GenieX sobre NPU Hexagon (Qualcomm Snapdragon); también debería poder ejecutarse en CPU/GPU mediante llama.cpp estándar, aunque no está verificado por el autor.
- Latencia y throughput: no disponibles; el autor declara explícitamente que el modelo no ha sido probado en dispositivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Aminadaven/Qwen3.5-4B-3D-Coder-Q4_0-NPU | ~4,2 B | no disponible | GGUF Q4_0/Q8_0 mixto | Apache-2.0 | Repack para NPU Hexagon, no probado en dispositivo |
| ccore/Qwen3.5-4B-3D-Coder (Q8_0 / Q4_K_M) | ~4,2 B | no disponible | GGUF | Apache-2.0 | Modelo original del ajuste fino; ejecución GPU/CPU |
| Qwen/Qwen3.5-4B | ~4,2 B | no disponible | safetensors y derivados | no disponible en la información | Modelo base generalista del que deriva el ajuste fino |

No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- Repack privado y no oficial: el autor lo describe como "private, unofficial repack", sin garantías de soporte ni mantenimiento.
- No probado en dispositivo: no hay verificación de que funcione correctamente en la NPU Hexagon ni de su estabilidad.
- Sin benchmarks: no existen métricas publicadas de calidad, latencia ni throughput.
- Riesgo de alucinación: inherente a los modelos generativos de código; el código Three.js generado debe revisarse y probarse antes de usarlo.
- Idiomas soportados no documentados: no se puede garantizar un comportamiento multilingüe adecuado.
- Contexto no documentado: se desconoce la ventana máxima y su comportamiento en conversaciones largas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el repack hereda las condiciones del modelo base y del ajuste fino original, que conviene verificar en sus respectivas model cards.
- Cuantización Q4_0: pérdida de precisión esperable frente a Q8_0 o pesos completos, especialmente en tareas de código donde los detalles sintácticos son críticos.
- Dependencia de un runtime específico (GenieX): la ventaja de NPU solo se materializa con ese stack, lo que limita la portabilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Aminadaven/Qwen3.5-4B-3D-Coder-Q4_0-NPU
- Modelo base del repack: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder
- Modelo original de la familia: https://huggingface.co/Qwen/Qwen3.5-4B
