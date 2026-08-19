# mradermacher/L3.1-Phantasmav2-12B-GGUF

## Resumen

El modelo `mradermacher/L3.1-Phantasmav2-12B-GGUF` es una cuantización en formato GGUF del modelo base `kromcomp/L3.1-Phantasmav2-12B`, realizada por el equipo mradermacher, conocido por publicar versiones cuantizadas de modelos open source para su uso local con herramientas como llama.cpp u Ollama. El nombre sugiere que se trata de un modelo de 12 mil millones de parámetros basado en la arquitectura Llama 3.1, probablemente un fine-tune o merge orientado a conversación o roleplay, aunque no se dispone de documentación oficial al respecto.

La relevancia de esta ficha radica en que el modelo se publica únicamente como pesos cuantizados, sin información adicional sobre su entrenamiento, capacidades o licencia. Esto limita su uso en entornos profesionales donde se requiera trazabilidad y garantías legales. A pesar de ello, el formato GGUF permite su despliegue en hardware de consumo, lo que lo hace atractivo para experimentación local, siempre que se asuman los riesgos de falta de documentación.

Al no existir una model card detallada del modelo original, la mayor parte de las especificaciones técnicas permanecen desconocidas. Esta ficha recoge únicamente los datos verificables del repositorio de cuantización y advierte sobre las carencias informativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente Llama 3.1, 12B) |
| Parametros totales | no disponible (el nombre indica 12B, sin confirmar) |
| Parametros activos | no aplicable (no se ha confirmado si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS (según comentarios en la model card) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base, no verificado) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base `kromcomp/L3.1-Phantasmav2-12B`. Por el nombre, se infiere que utiliza la arquitectura Llama 3.1 (transformer decoder-only), pero no se ha confirmado. Tampoco se conocen los datos de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas como RLHF o DPO. La única información técnica disponible es que el repositorio de mradermacher contiene cuantizaciones estáticas generadas a partir del modelo original en formato HuggingFace, lo que implica que el modelo base está disponible en safetensors.

## Capacidades

Dado que no existe documentación sobre el modelo base, no se pueden enumerar capacidades concretas. Basándose en la familia Llama 3.1 de 12B, es probable que el modelo pueda realizar generación de texto, razonamiento básico, y quizás soporte para tool calling, pero esto es especulativo. No hay evidencia de capacidades multimodales, de audio o de visión. El tag `region:us` sugiere que el modelo podría estar entrenado principalmente con datos en inglés, pero no se confirma.

## Casos de uso

Al carecer de especificaciones verificadas, los casos de uso son hipotéticos y dependen de las capacidades reales del modelo base. No obstante, por su tamaño (12B) y formato GGUF, podría emplearse en:

- Experimentación local con modelos de lenguaje en hardware de consumo (GPU con 8-12 GB de VRAM), usando cuantizaciones Q4 o Q5.
- Prototipado de aplicaciones de chat o generación de texto sin requisitos de producción estrictos.
- Evaluación preliminar de la calidad de un modelo de 12B basado en Llama 3.1 antes de decidir si se adopta un modelo con mejor documentación.
- Uso en entornos aislados donde no se requiera cumplimiento de licencia (dado que la licencia es desconocida, no se recomienda para uso comercial).
- Comparación de rendimiento entre diferentes cuantizaciones GGUF del mismo modelo base.
- Investigación académica no comercial, siempre que se respete la licencia original del modelo base (desconocida).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de cuantización no incluye métricas de rendimiento, y el modelo base carece de model card pública. No se pueden proporcionar datos de MMLU, HumanEval, GSM8K u otros.

## Requisitos de hardware

Al no conocerse el tamaño exacto en parámetros ni la arquitectura, los requisitos son estimaciones basadas en modelos de 12B típicos (como Llama 3.1 8B o 12B). Para una cuantización Q4_K_M, el tamaño del archivo rondaría los 7-8 GB, lo que cabe en GPUs con 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060). Para Q8_0, se necesitarían unos 12-13 GB, requiriendo GPUs de 16 GB o más (RTX 4080, RTX 4090, A100). Las opciones de despliegue incluyen llama.cpp, Ollama, LM Studio o vLLM (este último con soporte limitado para GGUF). No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo base `kromcomp/L3.1-Phantasmav2-12B` no tiene documentación pública, y no se conocen otros modelos de la misma familia con los que compararlo. Se podría mencionar `mradermacher/L3.1-Nimbusv2-12B-GGUF` como otro cuantizado del mismo autor, pero se desconoce su relación con Phantasma. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Ausencia total de documentación: no se conocen sesgos, riesgos de alucinación, ni limitaciones de contexto o idioma.
- Licencia desconocida: no se puede garantizar el uso comercial ni la redistribución. Se recomienda contactar con el autor del modelo base antes de cualquier uso profesional.
- Riesgo de contenido inapropiado: dado que el modelo aparece en listas de "modelos sin censura" en algunas guías web, es posible que haya sido fine-tuneado para eliminar restricciones de seguridad, lo que aumenta el riesgo de generar contenido ofensivo o dañino.
- Sin garantía de calidad: al no haber benchmarks ni evaluaciones independientes, el rendimiento real es incierto.
- Mantenimiento nulo: el repositorio tiene 0 descargas y 0 likes, lo que sugiere que no hay comunidad activa ni soporte.

## Enlaces

- Repositorio HuggingFace del cuantizado: https://huggingface.co/mradermacher/L3.1-Phantasmav2-12B-GGUF
- Modelo base (sin documentación): https://huggingface.co/kromcomp/L3.1-Phantasmav2-12B
- Página del equipo mradermacher: https://huggingface.co/mradermacher
- Página de descarga de cuantizaciones (beta): https://hf.tst.eu/model
