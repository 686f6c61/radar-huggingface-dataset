# mradermacher/sionic-K-SAT-MATH-3B-GGUF

## Resumen

sionic-K-SAT-MATH-3B-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo sionic-K-SAT-MATH-3B, publicada por el usuario mradermacher. El modelo original lo desarrolla sionic-ai y, por su nombre, está orientado a tareas de matemáticas y razonamiento tipo SAT (satisfacibilidad). Esta versión GGUF permite ejecutar el modelo en CPUs y GPUs de consumo mediante llama.cpp y herramientas compatibles, sin necesidad de infraestructura de servidor.

Aunque el nombre comercial indica "3B", los pesos en safetensors suman 4.169.800.704 parámetros (aproximadamente 4,17 mil millones), un dato relevante a la hora de estimar requisitos de memoria. El repositorio contiene 12 variantes de cuantización (desde Q2_K hasta F16, incluyendo IQ4_XS) y ocupa 37,8 GB en total, por lo que cada archivo individual pesa una fracción de ese total.

La información publicada es escasa: no se detallan licencia, idiomas, pipeline ni datos de entrenamiento. Esta ficha recoge lo disponible y marca explícitamente como "no disponible" todo aquello que la model card no especifica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base sionic-K-SAT-MATH-3B; familia transformer presumible por el formato GGUF, sin confirmar) |
| Parametros totales | 4.169.800.704 (según safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas generadas a partir del modelo en formato HF) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base sionic-K-SAT-MATH-3B: la model card de esta versión GGUF solo indica que se trata de cuantizaciones estáticas del modelo original de sionic-ai. El proceso de conversión se realizó desde formato HF (convert_type: hf) con quantize_version 2 y cuantización de tensores de salida activada (output_tensor_quantised: 1).

Tampoco hay datos publicados sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas como decodificación especulativa o atención lineal. El nombre del modelo sugiere un enfoque en matemáticas y problemas SAT, pero no se aporta evidencia técnica en la información disponible.

## Capacidades

- Generación de texto conversacional: la etiqueta "conversational" del repositorio indica que el modelo está preparado para diálogo.
- Razonamiento matemático: el nombre del modelo (MATH) apunta a un entrenamiento o ajuste orientado a problemas matemáticos, aunque no se detalla el alcance.
- Razonamiento tipo SAT: el identificador K-SAT sugiere capacidad para problemas de satisfacibilidad booleana, sin documentación que lo confirme.
- Tool calling / function calling: no disponible en la información publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Resolución de problemas matemáticos en local: desplegando una cuantización Q4_K_M o Q5_K_M con llama.cpp, el modelo puede resolver ejercicios de álgebra y cálculo en un portátil con GPU de consumo, sin enviar datos a la nube.
- Asistencia en entornos educativos offline: al ser GGUF, puede integrarse en aplicaciones de tutoría matemática que funcionan sin conexión, útil en aulas con conectividad limitada.
- Experimentación con problemas SAT: investigadores pueden probar el modelo sobre instancias de satisfacibilidad booleana para evaluar su comportamiento cualitativo, dado el nombre del modelo.
- Prototipado rápido de chatbots conversacionales: la etiqueta conversational y el formato GGUF permiten montar un endpoint compatible con la API de OpenAI mediante llama.cpp server o Ollama.
- Evaluación de cuantizaciones: el repositorio ofrece 12 variantes, lo que permite comparar la degradación de calidad entre Q2_K y F16 en tareas matemáticas concretas.
- Inferencia en CPU sin GPU: las cuantizaciones Q3_K_S y Q4_K_S caben en memoria RAM de equipos modestos, habilitando pruebas en hardware sin acelerador dedicado.
- Integración en pipelines de CI para validación de respuestas matemáticas: con un servidor local compatible con endpoints, se puede automatizar la comprobación de soluciones en tests.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (4,17 mil millones de parámetros, pesos más overhead de contexto):
  - F16: aproximadamente 8,5-9 GB.
  - Q8_0: aproximadamente 4,5-5 GB.
  - Q5_K_M: aproximadamente 3-3,5 GB.
  - Q4_K_M: aproximadamente 2,5-3 GB.
  - Q3_K_M: aproximadamente 2-2,5 GB.
  - Q2_K: aproximadamente 1,5-2 GB.
- GPU recomendadas: RTX 3060 12 GB o superior para F16 y Q8_0; RTX 4060 Ti 8 GB o RTX 3070 para Q5_K_M y Q4_K_M; GPUs de datacenter (A100, H100) no son necesarias para este tamaño, aunque pueden usarse para mayor throughput.
- Cabe en GPU de consumo: sí, todas las cuantizaciones caben en GPUs con 4 GB o más de VRAM, salvo F16 que requiere alrededor de 8-9 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con endpoints (el repositorio incluye la etiqueta endpoints_compatible).
- Latencia y throughput: no disponibles en la información publicada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| sionic-K-SAT-MATH-3B-GGUF | 4,17 B | no disponible | no disponible | GGUF | Cuantizaciones estáticas de un modelo especializado en matemáticas/SAT |
| Qwen2.5-Math-1.5B-Instruct | 1,5 B | 4.096 tokens | Apache 2.0 | safetensors, GGUF | Modelo matemático con licencia permisiva y benchmarks publicados |
| Phi-3-mini (3,8 B) | 3,8 B | 4.096 tokens (128K en variante long) | MIT | safetensors, GGUF | Modelo generalista pequeño con buen rendimiento en razonamiento |
| Llama-3.2-3B-Instruct | 3,2 B | 128K tokens | Llama 3.2 Community License | safetensors, GGUF | Modelo generalista con contexto largo y amplia disponibilidad de cuantizaciones |

La comparación es orientativa: no hay datos de benchmarks del modelo sionic que permitan contrastar rendimiento real frente a estas alternativas.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; es imprescindible contactar con sionic-ai antes de usarlo en producción.
- Idiomas no documentados: se desconoce si el modelo está entrenado en castellano o si su rendimiento fuera del inglés es aceptable.
- Contexto desconocido: sin la longitud de contexto publicada, no se pueden planificar aplicaciones con ventanas largas.
- Riesgo de alucinación: inherente a los modelos generativos; en matemáticas puede producir razonamientos plausibles pero incorrectos.
- Sesgos: no hay información sobre la composición del dataset de entrenamiento ni sobre evaluaciones de sesgo.
- Cuantizaciones agresivas: Q2_K y Q3_K_S pueden degradar notablemente la precisión en tareas matemáticas, donde los errores numéricos son críticos.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria.
- Modelo base poco documentado: la ausencia de model card detallada del original limita la evaluación de su calidad y procedencia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/sionic-K-SAT-MATH-3B-GGUF
- Modelo base: https://huggingface.co/sionic-ai/sionic-K-SAT-MATH-3B
- Paper, blog o demo: no disponible en la información proporcionada.
