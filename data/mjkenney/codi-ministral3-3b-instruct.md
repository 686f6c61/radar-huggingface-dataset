# mjkenney/codi-ministral3-3b-instruct

## Resumen

`mjkenney/codi-ministral3-3b-instruct` es un ajuste fino (fine-tune) de investigación publicado por el usuario mjkenney sobre el modelo base `mistralai/Ministral-3-3B-Instruct-2512-BF16`, un transformer denso de aproximadamente 3.000 millones de parámetros de la familia Ministral de Mistral AI. El modelo se distribuye bajo licencia Apache 2.0, con acceso restringido (gated, requiere aceptar condiciones en HuggingFace) y un repositorio de 3,4 GB.

Las etiquetas del repositorio —`codi`, `latent-reasoning`, `continuous-thought`, `interpretability`, `research`— sitúan el modelo en la línea de trabajo sobre razonamiento en espacio latente, es decir, la hipótesis de que un modelo puede "pensar" en estados ocultos continuos en lugar de generar cadenas de razonamiento explícitas token a token. Es un artefacto de experimentación, no un modelo orientado a producción: no incluye model card descriptiva, no declara idiomas, no especifica el proceso de entrenamiento y acumula 0 descargas y 0 likes en el momento de redactar esta ficha.

Su relevancia actual es acotada pero real para investigadores: permite reproducir y sondear experimentalmente si un modelo de 3B conserva capacidades de instrucción tras un ajuste orientado a representaciones latentes, y sirve como banco de pruebas de interpretabilidad sobre un backbone pequeño, desplegable en hardware de consumo. Quien busque un modelo listo para producción debe acudir al modelo base o a alternativas con documentación y evaluaciones publicadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada del modelo base Ministral-3-3B-Instruct); detalles del ajuste no disponibles |
| Parámetros totales | ~3.000 millones (por el modelo base; el repositorio no publica el recuento exacto) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No disponible; el repositorio no publica variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible (el repositorio no declara idiomas) |
| Licencia | Apache 2.0 (declarada en los tags) |
| Formato de pesos | No disponible; el repositorio ocupa 3,4 GB, por debajo de los ~6 GB esperables para 3B en BF16, lo que sugiere cuantización o pesos parciales (no confirmado) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del backbone Ministral 3B: un transformer denso y decoder-only de aproximadamente 3.000 millones de parámetros, en su variante Instruct ya alineada para seguir instrucciones por Mistral AI. Sobre esa base, mjkenney aplica un ajuste fino cuyos detalles técnicos —número de tokens de entrenamiento, composición del dataset, uso de SFT, DPO o RLHF adicional, hiperparámetros y estrategia de congelación de capas— no están documentados en la información disponible.

Las etiquetas `latent-reasoning` y `continuous-thought` apuntan a la línea de investigación conocida como razonamiento latente o "continuous thought": en lugar de forzar al modelo a verbalizar cada paso intermedio como tokens de cadena de pensamiento, se entrena o se induce al modelo a razonar en el espacio continuo de estados ocultos, lo que en teoría reduce el coste de inferencia y evita la pérdida de información que supone discretizar el razonamiento en palabras. La etiqueta `interpretability` sugiere que el artefacto está pensado para inspeccionar esas representaciones internas. No se especifica qué técnica concreta (recurrencia en estados ocultos, destilación de cadenas de pensamiento, cabezas auxiliares de latentes, probing) se ha empleado para producirlo.

## Capacidades

- Generación de texto y seguimiento de instrucciones: heredadas del modelo base Instruct, aunque no hay evaluación que confirme cuánto se conservan tras el ajuste.
- Razonamiento en espacio latente: el propósito declarado del ajuste, según los tags `latent-reasoning` y `continuous-thought`; sin metodología publicada ni ejemplos verificables.
- Inspección de representaciones internas: orientado a experimentos de interpretabilidad (`interpretability` en los tags).
- Soporte de tool calling / function calling: no confirmado para este fine-tune; el modelo base Ministral está diseñado para soportar function calling, pero el ajuste puede haber alterado esa capacidad.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingües: no declaradas; el repositorio no especifica idiomas.
- Capacidades especiales (visión, audio, thinking mode explícito): no disponibles.
- Especialización en código o matemáticas: no documentada.

## Casos de uso

- Investigación sobre razonamiento latente: usar el modelo como sujeto experimental para comparar la calidad de respuestas cuando el razonamiento se produce en estados ocultos frente a cadenas de pensamiento explícitas, midiendo exactitud y número de tokens generados en cada condición.
- Interpretabilidad de representaciones internas: extraer activaciones de capas intermedias durante la inferencia y entrenar sondas lineales (probes) para comprobar si codifican pasos intermedios de razonamiento, aprovechando que el backbone de 3B permite iterar rápido en una sola GPU.
- Reproducción de experimentos académicos: servir de baseline reproducible para trabajos que estudien continuous thought, al estar construido sobre un modelo base público y bien identificado.
- Evaluación de la degradación por fine-tune: comparar sistemáticamente el modelo frente a `Ministral-3-3B-Instruct` en suites de instrucciones (IFEval, MT-Bench o evaluaciones internas) para cuantificar cuánta capacidad instruct se pierde al reorientar el modelo hacia razonamiento latente.
- Prototipado local de bajo coste: al tratarse de un modelo de ~3B, permite experimentar en una GPU de consumo o incluso en CPU cuantizado, útil para validar pipelines de inferencia antes de escalar a modelos mayores.
- Docencia y divulgación: ilustrar en cursos o artículos cómo se ven los pesos y las activaciones de un modelo pequeño modificado, sin necesidad de infraestructura de centro de datos.
- Punto de partida para nuevos fine-tunes: usar los pesos como inicialización en investigaciones derivadas sobre decodificación latente, asumiendo la licencia Apache 2.0 declarada y verificando la del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El repositorio no incluye configuración de evaluación, resultados de MMLU, GSM8K, HumanEval, IFEval ni comparaciones con el modelo base, por lo que no es posible determinar si el ajuste mejora, mantiene o degrada el rendimiento del backbone original.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculos orientativos a partir de ~3.000 millones de parámetros, no mediciones del repositorio): ~6-7 GB en BF16 contando pesos y caché KV para contextos moderados; ~3,5-4 GB en FP8; ~2-2,5 GB en cuantización de 4 bits.
- GPU recomendadas: para experimentación en BF16, una RTX 4090 (24 GB), L40S (48 GB), A100 (40/80 GB) o H100 (80 GB); para cuantización de 4 bits basta una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB.
- Cabe en GPU de consumo: sí, en BF16 en tarjetas de 12 GB o más con contexto corto, y con holgura en 4 bits.
- Opciones de despliegue: vLLM y TGI para servir los pesos en formato HuggingFace; llama.cpp y Ollama solo si se generan conversiones GGUF, que el repositorio no publica; transformers como vía más directa dado el carácter de investigación del artefacto.
- Latencia y throughput: no disponibles. No hay mediciones publicadas para esta variante.
- Nota: el acceso es restringido (gated), por lo que cualquier despliegue requiere primero aceptar las condiciones en HuggingFace y autenticarse con un token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| codi-ministral3-3b-instruct (este) | ~3B | No disponible | Apache 2.0 (declarada) | Gated en HuggingFace | Fine-tune de investigación, sin benchmarks ni model card; 0 descargas |
| Ministral-3-3B-Instruct (base) | ~3B | 128k según anuncio de Mistral AI (no verificado en la información proporcionada) | Mistral Research License en la publicación original de 2024; verificar la variante 2512 | Público | Backbone original, documentado y evaluado por el fabricante |
| Llama 3.2 3B Instruct | ~3,2B | 128k | Llama 3.2 Community License | Público, gated | Alternativa madura con ecosistema amplio de cuantizaciones y herramientas |
| Qwen2.5-3B-Instruct | ~3,1B | 32k nativo (extensible con YaRN) | Apache 2.0 | Público | Buena relación calidad/tamaño en código y multilingüe, licencia permisiva |

Los datos de contexto y licencia de los modelos comparados provienen de su documentación pública y no forman parte de la información proporcionada en esta ficha; conviene verificarlos antes de tomar decisiones de producción.

## Limitaciones y advertencias

- Ausencia total de validación comunitaria: 0 descargas y 0 likes en el momento de la ficha, sin issues ni discusiones que permitan inferir calidad o estabilidad.
- Model card inexistente o mínima: no se documentan datos de entrenamiento, hiperparámetros, metodología ni evaluaciones, lo que impide reproducir el ajuste.
- Riesgo de degradación de capacidades: un fine-tune orientado a razonamiento latente sobre un modelo Instruct puede deteriorar el seguimiento de instrucciones, el formato de salida y el soporte de function calling del backbone original.
- Riesgo de alucinación: inherente a los modelos de ~3B y potencialmente agravado por un ajuste no evaluado; sin benchmarks no es posible acotarlo.
- Ambigüedad de licencia: se declara Apache 2.0, pero el modelo base Ministral de 3B publicado por Mistral AI en 2024 se distribuyó bajo Mistral Research License, con restricciones para uso comercial. Es imprescindible verificar la licencia de la variante concreta `Ministral-3-3B-Instruct-2512-BF16` antes de explotar comercialmente los pesos derivados.
- Idiomas no declarados: no hay garantía de comportamiento correcto en castellano ni en otros idiomas distintos del inglés.
- Contexto desconocido: no se especifica la ventana máxima efectiva tras el ajuste, por lo que no debe asumirse la del modelo base.
- Acceso restringido: el carácter gated añade fricción a la reproducibilidad y a la integración en pipelines automatizados.
- Idoneidad: no es un modelo para producción, atención al cliente ni aplicaciones con requisitos de fiabilidad; su uso razonable es la investigación y la experimentación controlada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mjkenney/codi-ministral3-3b-instruct
- Modelo base: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512-BF16
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
