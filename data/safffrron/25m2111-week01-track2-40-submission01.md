# safffrron/25M2111-Week01-Track2-40-Submission01

## Resumen

El repositorio `safffrron/25M2111-Week01-Track2-40-Submission01` contiene un checkpoint comprimido de un modelo de lenguaje de texto de 4.206 mil millones de parámetros, identificado como `Qwen3.5-4B` en los scripts de restauración. El autor, `safffrron`, lo ha desarrollado como parte de un ejercicio académico (CS6013, Week 01, Track 2) para alcanzar un objetivo de compresión del 40% del tamaño original en BF16 (8.412 GB). El artefacto ocupa 3.350.387.629 bytes en disco y se restaura a un checkpoint Hugging Face estándar en BF16 mediante un script de descompresión.

La relevancia de este trabajo radica en su método de compresión adaptativa por bloques: en lugar de aplicar una única precisión a todo un tensor, divide cada matriz de salida en bloques de 64 filas y asigna anchos de bits mixtos (códigos enteros, escalas FP16 y selectores uint8) según la sensibilidad medida con trazas de calibración. Esto permite comprimir el modelo a un 40% del tamaño BF16 manteniendo una calidad razonable, con métricas internas de .980 en un gate de 100 muestras, .914 en una suite de 560 y .540 en un holdout sellado de 63. El checkpoint no es un modelo entrenado desde cero, sino una versión comprimida de un modelo base existente, por lo que sus capacidades dependen del modelo original.

La ficha se basa exclusivamente en la información proporcionada en la model card y en el repositorio de Hugging Face. Muchos datos técnicos (licencia, idiomas, arquitectura detallada, benchmarks estándar) no están disponibles y se indican como tales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-4B, no se especifican detalles de capas o atención) |
| Parametros totales | 4.206 millones (4.206B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la evaluación usa generación de hasta 65.536 tokens, pero no se indica el contexto de entrenamiento) |
| Tipos de cuantizacion | Códigos enteros de ancho mixto (densamente empaquetados), escalas FP16, selectores uint8 por bloque; se restaura a BF16 para inferencia |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Checkpoint comprimido propietario (códigos empaquetados) que se restaura a BF16 (formato Hugging Face estándar) |

## Arquitectura y entrenamiento

El artefacto no es un modelo entrenado desde cero, sino una compresión del modelo base `Qwen3.5-4B` (4.206B parámetros). El método de compresión, denominado `block64 activation`, divide cada matriz de salida en bloques de 64 filas. Para cada bloque, se estima la sensibilidad del modelo a cambios de precisión mediante 32 trazas de calibración (se menciona que bloques de 16 o 4 filas añadían selectores y ajustaban ruido, por lo que se eligió 64). Un asignador de presupuesto de bytes exacto reparte bits extra a los bloques donde reducen más el error de activación, mientras que los bloques insensibles se almacenan con menos bits. El resultado es un checkpoint con códigos enteros de ancho mixto, escalas FP16 y selectores uint8, que se restaura a tensores BF16 ordinarios antes de la inferencia mediante el script `dequantize_to_bf16.py`.

El entrenamiento del modelo base no está documentado en la información disponible: no se mencionan datos de entrenamiento, número de tokens, ni procesos de RLHF/DPO. La compresión se validó con evaluaciones internas: .980 en un gate de 100 muestras, .914 en una suite de 560 y .540 en un holdout sellado de 63, con un límite de generación de 32.768 tokens en esas pruebas (el pipeline público usa 65.536 tokens por defecto para reducir truncamiento en trazas de razonamiento largas). El método no es un modelo sparse: la compresión proviene de pesos empaquetados de ancho mixto, no de poda (el parámetro `sparsity=0.5` se ignora por compatibilidad con el evaluador original).

## Capacidades

- Generación de texto con capacidad de razonamiento (las evaluaciones mencionan "long reasoning traces", lo que sugiere que el modelo base puede producir cadenas de razonamiento extensas).
- No se dispone de información sobre tool calling, function calling, agentes, visión, audio u otras capacidades especiales.
- El checkpoint comprimido debe restaurarse a BF16 antes de la inferencia; no se puede cargar directamente como un modelo estándar.
- No se especifican capacidades multilingües; los idiomas soportados no están disponibles.

## Casos de uso

- Investigación académica en compresión de modelos: el checkpoint sirve como caso de estudio para evaluar métodos de cuantización adaptativa por bloques. Se puede usar para reproducir los experimentos del autor y comparar con otras técnicas de compresión.
- Desarrollo de pipelines de despliegue eficiente: el formato comprimido reduce el almacenamiento y la transferencia de red (3.35 GB frente a 8.4 GB en BF16), lo que podría interesar a equipos que necesitan distribuir modelos grandes en entornos con ancho de banda limitado.
- Evaluación de trade-offs entre tamaño y calidad: las métricas internas (gate, suite, holdout) permiten cuantificar la pérdida de rendimiento frente al modelo original, útil para decidir si una compresión del 40% es aceptable para una aplicación concreta.
- Integración en entornos de aprendizaje automático educativos: al ser parte de un curso (CS6013), puede utilizarse como material didáctico para enseñar técnicas de cuantización y empaquetado de pesos.
- Pruebas de restauración y compatibilidad: el script `dequantize_to_bf16.py` permite convertir el checkpoint a formato Hugging Face estándar, lo que facilita su uso con frameworks como Transformers, vLLM o llama.cpp (aunque no se ha verificado su compatibilidad con estos).
- Optimización de memoria en inferencia: tras restaurar a BF16, el modelo ocupa ~8.4 GB en VRAM, pero el checkpoint comprimido podría permitir una carga diferida o una descompresión en memoria si se integra en un runtime personalizado (aunque no se proporciona dicha integración).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor reporta métricas internas de evaluación:

| Metrica | Valor |
|---|---|
| Gate (n=100) | 0.980 |
| Suite (n=560) | 0.914 |
| Holdout sellado (n=63) | 0.540 |

Estas métricas se obtuvieron con un límite de generación de 32.768 tokens en las pruebas registradas. No se proporcionan comparaciones con otros modelos ni con el modelo base sin comprimir.

## Requisitos de hardware

- El checkpoint comprimido ocupa 3.350.387.629 bytes en disco (~3.35 GB). Para inferencia, se debe restaurar a BF16, lo que requiere aproximadamente 8.4 GB de memoria (4.206B parámetros × 2 bytes por parámetro).
- No se especifican GPUs recomendadas. Un modelo de 4B en BF16 puede caber en GPUs con 12 GB de VRAM (por ejemplo, RTX 3060, RTX 4070) o más, pero no se ha verificado.
- Opciones de despliegue: no se documentan. El checkpoint comprimido no es directamente cargable por frameworks estándar; requiere el script de restauración. Una vez restaurado a formato Hugging Face, podría usarse con vLLM, TGI, llama.cpp u Ollama, pero no hay confirmación.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este checkpoint con otros modelos de la misma categoría. El modelo base es Qwen3.5-4B, pero no se tienen datos de rendimiento del modelo sin comprimir ni de alternativas como Llama-3.2-3B, Phi-3.5-mini o Gemma-2-2B. La única comparación posible es con el propio modelo base en términos de tamaño: el checkpoint comprimido reduce el almacenamiento a un 40% del BF16 original, pero no se conoce el impacto exacto en calidad más allá de las métricas internas reportadas.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos, alucinaciones o limitaciones de contexto del modelo base.
- La licencia no está especificada, por lo que el uso comercial del checkpoint o del modelo restaurado es incierto y debe consultarse con el autor.
- El checkpoint no es un modelo independiente: requiere el script de restauración (`dequantize_to_bf16.py`) y el paquete `eaimath` para convertirse a un formato utilizable. No se puede cargar directamente con `transformers` sin este paso.
- Las métricas de evaluación son internas y no comparables con benchmarks estándar. El valor de .540 en el holdout sellado sugiere una pérdida de calidad significativa en ciertos casos, posiblemente debido a la compresión agresiva.
- La compresión se validó con un número limitado de trazas de calibración (32 por bloque), lo que podría no generalizar a otros dominios o tareas.
- No se garantiza la reproducibilidad exacta de los resultados si se cambia el límite de generación (el autor usa 65.536 tokens por defecto en el pipeline público, pero las métricas registradas usaron 32.768).
- El repositorio contiene un solo checkpoint; no se ofrecen variantes ni pesos intermedios.

## Enlaces

- Hugging Face: https://huggingface.co/safffrron/25M2111-Week01-Track2-40-Submission01
- Repositorio GitHub: https://github.com/safffrron/CS6013/tree/main/25M2111/Week01/Track2_40/Submission01
