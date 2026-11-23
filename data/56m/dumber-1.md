# 56m/Dumber-1

## Resumen

Dumber-1 (también referenciado como Dumber-535K en la model card) es un modelo de lenguaje ultraligero de 535.584 parámetros desarrollado por el usuario 56m y publicado en Hugging Face. Se entrenó desde cero sobre 500 millones de tokens del corpus FineWeb-Edu, lo que supone una ratio de aproximadamente 47 veces la regla de Chinchilla, un régimen deliberadamente sobremuestreado para experimentar con leyes de escala en arquitecturas minúsculas.

El modelo emplea una arquitectura tipo Llama (transformer decoder-only) con un tamaño oculto de 96 y un vocabulario de 768 tokens, y una ventana de contexto de 512 tokens. Su entrenamiento completo se realizó en aproximadamente una hora sobre una única GPU NVIDIA T4, lo que lo sitúa como una pieza de investigación orientada a despliegue en el extremo y a estudios de eficiencia, más que como un modelo de propósito general.

Es relevante ahora porque ejemplifica una tendencia creciente de modelos sub-1M pensados para entornos con restricciones severas de cómputo, prototipado rápido de pipelines de entrenamiento y experimentación académica con leyes de escala. No obstante, el propio autor lo etiqueta como una vista previa experimental de investigación, con salidas potencialmente inestables.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama |
| Parámetros totales | 535.584 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

Datos adicionales de arquitectura: hidden size de 96 y vocabulario de 768 tokens.

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only con convenciones de la familia Llama, según indican las etiquetas del repositorio. Con 535.584 parámetros, un tamaño oculto de 96 y un vocabulario de 768, se trata de una configuración extremadamente compacta, muy por debajo de los modelos tiny convencionales (que suelen moverse en el rango de decenas a cientos de millones de parámetros). El número de capas y cabezas de atención no se detalla en la información disponible.

El entrenamiento se realizó desde cero sobre 500 millones de tokens del dataset FineWeb-Edu, un corpus de contenido educativo web filtrado por calidad. Esto implica una ratio de tokens por parámetro de aproximadamente 933, es decir, unas 47 veces la ratio óptima de Chinchilla (20 tokens por parámetro), una elección deliberada para estudiar el comportamiento en regímenes de sobremuestreo extremo. El proceso completo se completó en aproximadamente una hora sobre una única NVIDIA T4. No se especifica en la información disponible si se aplicaron fases de RLHF, DPO o ajuste fino supervisado, ni innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto autoregresiva en inglés, limitada por el tamaño del modelo y su vocabulario de 768 tokens.
- Modelado de lenguaje a nivel de carácter o subpalabra muy granular, condicionado por el vocabulario reducido.
- Capacidad experimental para estudiar leyes de escala y dinámicas de entrenamiento en modelos sub-1M.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: únicamente inglés según la model card.
- No se documentan capacidades especiales como modo thinking, visión o audio.

## Casos de uso

- Experimentación con leyes de escala: el modelo sirve como punto de datos empírico para estudiar cómo se comporta la pérdida y la capacidad de generación en el régimen sub-1M con sobremuestreo de tokens, útil en investigación académica sobre eficiencia de entrenamiento.
- Prototipado de pipelines de entrenamiento: al entrenarse en aproximadamente una hora sobre una T4, permite iterar rápidamente sobre recetas de datos, hiperparámetros y tokenizadores antes de escalar a modelos mayores.
- Pruebas de integración con transformers y TGI: su compatibilidad con text-generation-inference y endpoints permite validar infraestructura de despliegue sin coste de GPU significativo.
- Docencia y divulgación: un modelo de 535K parámetros es adecuado para explicar el funcionamiento interno de un transformer decoder-only, inspeccionar pesos y visualizar activaciones en un portátil.
- Despliegue en entornos de cómputo extremo: su huella de memoria mínima permite ejecutarlo en dispositivos con recursos muy limitados para pruebas de concepto de generación de texto.
- Investigación sobre tokenizadores de vocabulario reducido: con 768 tokens de vocabulario, es un banco de pruebas para estudiar el impacto del tamaño del vocabulario en la calidad de la generación y en la longitud efectiva de las secuencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier precisión razonable, dado el tamaño de 535.584 parámetros (aproximadamente 1 MB en fp32 y 0,5 MB en fp16).
- GPU recomendadas: cualquier GPU moderna es sobredimensionada; el entrenamiento se realizó en una NVIDIA T4, que sirve como referencia práctica.
- Cabe en cualquier GPU de consumo, incluidas GTX 1050, RTX 2060, RTX 3060, RTX 4090, e incluso en CPU sin dificultad.
- Opciones de despliegue: transformers, text-generation-inference (TGI), endpoints compatibles; no se confirma soporte de llama.cpp, Ollama o vLLM en la información disponible.
- Latencia y throughput: no disponibles; por el tamaño del modelo, la latencia debería ser dominada por el overhead del runtime más que por el cómputo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Dumber-1 (56m) | 535.584 | 512 | Apache 2.0 | Hugging Face |
| Modelos tiny convencionales (p. ej. familia Pythia-14M) | ~14M | 2048 | Apache 2.0 | Hugging Face |
| Modelos sub-1M públicos comparables | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre benchmarks ni sobre modelos directamente comparables en el rango sub-1M con los que establecer una comparación cuantitativa. La comparación con modelos tiny de mayor tamaño (decenas de millones de parámetros) es únicamente orientativa por categoría.

## Limitaciones y advertencias

- Vista previa experimental: el autor advierte explícitamente de que las salidas pueden presentar inestabilidad, alucinaciones y patrones repetitivos.
- Capacidad lingüística muy limitada: con 535K parámetros y un vocabulario de 768 tokens, la coherencia y la fluidez estarán muy restringidas en comparación con modelos convencionales.
- Contexto corto: 512 tokens limita severamente tareas que requieran contexto amplio o conversaciones multi-turno.
- Solo inglés: no hay soporte multilingüe documentado.
- Sesgos: al entrenarse sobre FineWeb-Edu, puede heredar sesgos del corpus web educativo filtrado; no se documentan evaluaciones de sesgo.
- Licencia Apache 2.0: permite uso comercial, pero el estado experimental del modelo desaconseja su uso en producción sin validación exhaustiva.
- No apto para tareas de razonamiento, código o matemáticas: no se documentan capacidades en estas áreas y el tamaño del modelo las hace inviables en la práctica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/56m/Dumber-1
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
