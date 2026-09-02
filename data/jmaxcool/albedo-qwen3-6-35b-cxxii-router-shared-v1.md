# JMaxCool/albedo-qwen3.6-35b-cxxii-router-shared-v1

## Resumen

Albedo SN97 scrub candidate (CXXII router+shared-expert x1) es un checkpoint derivado del modelo dendriteholdings/albedo-qwen3.6-35b-king-CXXII, publicado por el usuario JMaxCool en HuggingFace. Se trata de una variante experimental de la familia Qwen3.6 con arquitectura de mezcla de expertos (MoE), en la que se han eliminado (scrub) 63 de los 1045 tensores originales, concretamente en las capas 13 a 39, con una preferencia por capas tardías. El perfil indicado, "router-shared", sugiere que solo se conservan los tensores correspondientes al gate (mlp.gate) y al experto compartido (mlp.shared_expert), excluyendo los expertos enrutados (mlp.experts). El resultado es un modelo de 35.951.822.704 parámetros totales, con una similitud esperada de 0,939713 respecto al modelo original CXXII.

Este checkpoint no cuenta con licencia, idiomas declarados, ni documentación sobre capacidades o entrenamiento. Su relevancia radica en ser un experimento de poda selectiva sobre un MoE de gran tamaño, orientado a estudiar el impacto de eliminar componentes específicos en el rendimiento y la huella de memoria. No se han publicado benchmarks ni casos de uso, y el repositorio tiene cero descargas y cero likes, lo que indica un estado muy preliminar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (MoE, mezcla de expertos) |
| Parametros totales | 35.951.822.704 (35,95 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repositorio en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.6-MoE, una variante de la familia Qwen3.6 que emplea mezcla de expertos para reducir el coste de inferencia manteniendo un número elevado de parámetros totales. Este checkpoint en concreto es un "scrub candidate": se parte del modelo king CXXII y se eliminan selectivamente tensores, en este caso 63 de 1045, restringidos a las capas 13 a 39 y con un perfil que conserva únicamente el gate y el experto compartido, descartando los expertos enrutados. Este proceso de poda se aplicó con una semilla 44201 y una escala delta de 1. No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados, ni sobre técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá de la propia estrategia de poda.

## Capacidades

No se ha publicado documentación específica sobre las capacidades de este modelo. Dado que deriva de Qwen3.6, es razonable esperar que herede competencias genéricas de generación de texto, razonamiento y posiblemente código, pero no hay confirmación oficial. La poda de los expertos enrutados podría afectar significativamente a la calidad de las respuestas, ya que el modelo resultante solo utiliza el experto compartido y el gate, lo que probablemente degrade su rendimiento en tareas complejas. Se recomienda tratar este checkpoint como un experimento de investigación y no como un modelo listo para producción.

## Casos de uso

No hay casos de uso documentados para este modelo. Al tratarse de una variante experimental con una poda agresiva de sus componentes, no se recomienda su empleo en aplicaciones reales sin una evaluación previa exhaustiva. Posibles usos hipotéticos, siempre bajo validación, podrían ser:

- Experimentación académica: estudiar el efecto de la poda selectiva en arquitecturas MoE, comparando la salida con el modelo original CXXII.
- Pruebas de compresión: evaluar si un modelo con solo el experto compartido y el gate puede mantener un rendimiento aceptable en tareas sencillas, reduciendo la memoria activa.
- Depuración de pipelines de inferencia: servir como banco de pruebas para verificar que el motor de inferencia maneja correctamente tensores eliminados o estructuras MoE incompletas.

Sin embargo, ninguna de estas aplicaciones está validada y el modelo carece de garantías de funcionamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar para este checkpoint concreto. La similitud esperada de 0,939713 con el modelo CXXII sugiere que el comportamiento podría ser cercano al original, pero no hay mediciones reales que lo confirmen.

## Requisitos de hardware

- Tamaño del repositorio: 71,9 GB en BF16, lo que implica aproximadamente 71,9 GB de VRAM para cargar los pesos completos sin cuantización.
- No se ofrecen cuantizaciones oficiales, por lo que la inferencia en GPUs de consumo (24 GB, 16 GB) requeriría convertir los pesos a formatos de menor precisión (por ejemplo, 8-bit o 4-bit) mediante herramientas externas.
- Una GPU con 80 GB de VRAM (A100, H100) podría albergar el modelo en BF16, aunque con limitaciones de contexto según la memoria restante.
- No hay información sobre latencia o throughput. Dado que solo se usan el gate y el experto compartido, el número de parámetros activos podría ser considerablemente menor que los 35,95 B totales, lo que podría acelerar la inferencia, pero no se ha medido.
- Opciones de despliegue: no se mencionan compatibilidades con vLLM, llama.cpp, Ollama o TGI. Al ser un modelo MoE personalizado, podría requerir adaptaciones en el motor de inferencia.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo base Qwen3.6-35B (versión densa o MoE estándar) está disponible en plataformas como Ollama, pero no se conocen sus especificaciones exactas en la información proporcionada. Otros modelos de JMaxCool, como albedo-qwen3.6-35b-cxiv-dpo-verified-v1, son variantes de la misma familia, pero sin datos comparativos. Se recomienda consultar la documentación oficial de Qwen3.6 para obtener referencias, aunque no se ha facilitado.

## Limitaciones y advertencias

- Modelo experimental sin licencia declarada, lo que genera incertidumbre legal sobre su uso comercial.
- Sin idiomas soportados documentados; probablemente herede el multilingüismo de Qwen, pero no está confirmado.
- La poda de los expertos enrutados puede degradar severamente la calidad de las respuestas, especialmente en tareas que requieren razonamiento complejo o conocimiento especializado.
- Riesgo elevado de alucinaciones y de respuestas incoherentes debido a la alteración estructural del modelo.
- No se han realizado evaluaciones de seguridad, sesgos o robustez.
- No se recomienda su uso en producción sin una validación exhaustiva y sin conocer el rendimiento real.
- El repositorio tiene cero descargas y cero likes, lo que sugiere que no ha sido probado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JMaxCool/albedo-qwen3.6-35b-cxxii-router-shared-v1
- Modelo relacionado (mismo autor): https://huggingface.co/JMaxCool/albedo-qwen3.6-35b-cxxii-experts-x1-v3
- Modelo relacionado (mismo autor): https://huggingface.co/JMaxCool/albedo-qwen3.6-35b-cxiv-dpo-verified-v1
- Documentación de Qwen3.6 en GitHub (referencia de la familia): https://github.com/AI-Guru/ai_services/blob/main/models/qwen3.6/README.md
- Página de Qwen3.6:35b en Ollama: https://ollama.com/library/qwen3.6:35b
- Ejemplo de despliegue de Qwen3.6-35B en Jetson: https://github.com/Seeed-Projects/jetson-examples/blob/main/reComputer/scripts/qwen3.6-35b/README.md
