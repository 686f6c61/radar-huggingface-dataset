# dtcolligan/suitesmith-qwen3.5-4b-run1-step20

## Resumen

El modelo `dtcolligan/suitesmith-qwen3.5-4b-run1-step20` es un fine-tune completo del modelo base `Qwen/Qwen3.5-4B` (4B parámetros nominales, aunque el export en safetensors pesa 5.174.964.736 parámetros) entrenado mediante aprendizaje por refuerzo (RL) con el algoritmo GRPO sobre el entorno `suitesmith`, desarrollado por Dominic Colligan. El objetivo del entrenamiento es capacitar al modelo para escribir suites de pruebas pytest de alta calidad a partir de especificaciones de funciones en Python.

Este checkpoint corresponde al paso 20 de la primera ejecución de entrenamiento, con los pesos exportados en formato bf16. Según la model card, el modelo alcanza una puntuación media de 0.881 en la división de evaluación (90 tareas × 4 rollouts, temperatura 1.0, límite de 8192 tokens), superando claramente al modelo base sin entrenar (0.406) y acercándose al rendimiento de un modelo 8B sin entrenar (0.902).

La relevancia de este modelo radica en su enfoque especializado: en lugar de un asistente conversacional general, está optimizado para una tarea concreta de ingeniería de software, demostrando cómo el RL con verificadores puede mejorar sustancialmente la generación de código de prueba. Está licenciado bajo Apache 2.0, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-4B) |
| Parametros totales | 5.174.964.736 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el entrenamiento usa cap 8192) |
| Tipos de cuantizacion | bf16 (export original); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (modelo base Qwen3.5-4B, idiomas no especificados) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer de `Qwen/Qwen3.5-4B`, un modelo denso de aproximadamente 4B parámetros (el export safetensors muestra 5.17B, probablemente por embeddings y cabezales adicionales). No se dispone de detalles adicionales sobre la arquitectura interna del modelo base (número de capas, atención, etc.) en la información proporcionada.

El entrenamiento se realizó con GRPO (Group Relative Policy Optimization), un algoritmo de RL que utiliza un grupo de respuestas muestreadas para calcular ventajas relativas, sin necesidad de un modelo crítico separado. El entorno `suitesmith` (disponible en GitHub) proporciona un verificador que evalúa si las suites pytest generadas pasan tests de validación. Se aplicó un fine-tune completo (no LoRA) durante 20 pasos, con exportación en bf16 del checkpoint del paso 20. La configuración exacta está en `configs/run1.toml` del repositorio en el commit `8381d2c`.

## Capacidades

- Generación de suites de pruebas pytest en Python a partir de especificaciones de funciones.
- Razonamiento sobre casos límite y condiciones de borde en código.
- Escritura de tests con cobertura de ramas y paths relevantes.
- Manejo de contexto largo (hasta 8192 tokens durante el entrenamiento), lo que permite procesar especificaciones extensas.
- Capacidad limitada de generación de código Python general, aunque su especialización principal es el testing.
- No se documentan capacidades de tool calling, vision, audio o razonamiento multi-paso fuera del ámbito de generación de tests.

## Casos de uso

- Generación automática de suites de pruebas en proyectos Python: el modelo recibe la especificación de una función y produce un archivo de tests pytest completo, reduciendo el tiempo de escritura manual.
- Integración en pipelines de CI/CD: se puede invocar el modelo desde un script para generar tests nuevos cuando se añaden funciones o se modifican APIs, y ejecutarlos automáticamente.
- Asistente para desarrolladores en entornos de desarrollo integrado (IDE): como plugin que sugiere casos de prueba mientras se escribe código.
- Validación de especificaciones: al generar tests a partir de una descripción, se pueden detectar ambigüedades o comportamientos no especificados en la documentación.
- Educación y formación: generar ejemplos de tests para enseñar buenas prácticas de testing en Python.
- Migración de código legacy: a partir de especificaciones extraídas de código antiguo, el modelo puede crear tests de regresión para verificar que el comportamiento se mantiene.
- Auditoría de calidad: generar tests adicionales para aumentar la cobertura de código en proyectos con baja cobertura existente.

## Benchmarks y rendimiento

Los datos de evaluación provienen de la model card (evaluación interna del autor, 90 tareas × 4 rollouts, temperatura 1.0, cap 8192):

| Modelo | Puntuación media | Seen | Vocab | Window |
|---|---|---|---|---|
| suitesmith-qwen3.5-4b (run1, step20) | 0.881 | 0.948 | 0.933 | 0.762 |
| Qwen3.5-4B sin entrenar | 0.406 | - | - | - |
| Modelo 8B sin entrenar | 0.902 | - | - | - |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La métrica principal es específica del entorno `suitesmith`.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 10.4 GB (5.17B parámetros × 2 bytes), más overhead de activaciones y KV cache. Cabe en GPUs con 12 GB o más, como RTX 3060 12GB, RTX 4070, RTX 4090 (24 GB), A100 (40/80 GB), H100.
- Para inferencia en consumer GPU con 8 GB de VRAM, sería necesario cuantizar a 4 bits (no se documentan cuantizaciones oficiales, pero se puede convertir a GGUF o usar bitsandbytes). El tamaño en 4 bits sería ~2.6 GB.
- Opciones de despliegue: al estar en formato safetensors, se puede servir con vLLM, TGI, o convertirlo a GGUF para llama.cpp/Ollama. No se proporcionan latencias ni throughput medidos.
- El entrenamiento (fine-tune completo) requiere una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090/4090 o A100) si se usa bf16; con LoRA se podría reducir, pero el modelo fue entrenado con fine-tune completo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para la tarea de generación de suites pytest. La comparativa más relevante es contra el propio modelo base sin entrenar y contra un modelo de mayor tamaño (8B), que se muestra en la tabla de benchmarks. No se conocen otros modelos especializados en generación de tests con RL en el momento de redactar esta ficha.

## Limitaciones y advertencias

- El modelo está fuertemente especializado en generación de tests pytest; fuera de ese dominio su rendimiento puede ser pobre o impredecible.
- Riesgo de alucinación: puede generar tests que parecen válidos pero que no compilan o no pasan, especialmente en casos límite no cubiertos por el verificador.
- La ventana de contexto efectiva está limitada a 8192 tokens (cap usado en entrenamiento); especificaciones más largas pueden degradar el rendimiento.
- No se han documentado sesgos específicos, pero el modelo hereda los sesgos del modelo base Qwen3.5-4B, que no están caracterizados en esta ficha.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda verificar la procedencia de los datos de entrenamiento del modelo base (no documentada aquí).
- El modelo es un checkpoint intermedio (paso 20 de una ejecución); puede no representar el rendimiento final del entrenamiento completo.
- No hay garantías de soporte ni mantenimiento por parte del autor; el repositorio de `suitesmith` es el único recurso de documentación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dtcolligan/suitesmith-qwen3.5-4b-run1-step20
- Repositorio del entorno `suitesmith`: https://github.com/dtcolligan/suitesmith
- Documentación de Qwen3.5 en Unsloth (referencia general del modelo base): https://unsloth.ai/docs/models/qwen3.5
