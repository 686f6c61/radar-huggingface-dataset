# kawshikbuet17/bangla-heteronym-xlm-roberta-large-candidate

## Resumen

El modelo `bangla-heteronym-xlm-roberta-large-candidate` es un ajuste fino de XLM-RoBERTa-large desarrollado por Kawshik Kumar Paul (kawshikbuet17) para resolver un problema muy concreto del bengalí: la desambiguación de heterónimos, es decir, palabras que se escriben igual pero se pronuncian de forma distinta según el contexto de la frase. El modelo no genera texto libre, sino que actúa como un scorer de candidatos de lectura dentro de una etapa previa (front-end) de un sistema de texto-a-voz (TTS) en bengalí.

La arquitectura es un encoder transformer XLM-RoBERTa-large (559.890.432 parámetros) con una cabeza lineal personalizada que puntúa cada par (frase con la palabra marcada, lectura candidata). Es relevante porque el bengalí carece de herramientas maduras de grafema-a-fonema y este tipo de modelos permiten desambigüar la pronunciación antes de la síntesis, algo crítico para la calidad de un TTS.

El checkpoint publicado es un "candidate" (semilla 43) que alcanza un 97,10 % de accuracy y 96,90 % de macro-F1 en el conjunto de test del dataset `bangla-heteronyms`. El autor recomienda para la mayoría de usos su alternativa `bangla-heteronym-banglabert` (99,46 %), por lo que este modelo debe considerarse una pieza de referencia o experimental dentro de un benchmark más amplio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-large) con cabeza lineal de scoring de candidatos |
| Parametros totales | 559.890.432 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de XLM-RoBERTa-large; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | bengalí (bn) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `FacebookAI/xlm-roberta-large` y añade una cabeza lineal que puntúa lecturas candidatas. La entrada se construye marcando la palabra heterónima en la frase con delimitadores (`আগে @ কর @ কাজটা, ...`) y emparejándola con cada una de sus lecturas (p. ej. `কর্‌`, `করো`, `কোরো`). XLM-R-large codifica cada par y la capa lineal sobre el token marcador de apertura produce una puntuación; gana la lectura con mayor score. Este enfoque de "candidate scoring" permite, en teoría, puntuar lecturas de palabras no vistas en entrenamiento, ya que el modelo lee cada lectura como texto.

El ajuste fino se realizó sobre el dataset `kawshikbuet17/bangla-heteronyms`, con 14 frases por lectura, usando AdamW, learning rate 2e-5, batch size 32, fp16, un máximo de 10 épocas con early stopping sobre accuracy de desarrollo y una única Tesla T4. No se menciona RLHF, DPO ni datos adicionales. El autor advierte que el entrenamiento es inestable con esta receta: las tres semillas alcanzaron 97,01 %, 97,10 % y 55,80 %, y este checkpoint es el mejor por accuracy de desarrollo.

## Capacidades

- Desambiguación de heterónimos en bengalí: selecciona la lectura correcta de una palabra polifónica a partir del contexto de la frase.
- Foneticización de frases completas: reemplaza cada heterónimo por su lectura en escritura bengalí (`phoneticize`).
- Salida detallada con posición, lectura y confianza por heterónimo (`phoneticize_detailed`).
- Predicción puntual de la lectura de una palabra en una frase (`predict`) y de una ocurrencia marcada explícitamente con corchetes (`predict_marked`).
- Procesamiento por lotes para throughput alto (`*_batch`).
- Generalización limitada a palabras no vistas: en el benchmark, entrenando sin 37 palabras reservadas, alcanzó un 62,0 % en ellas (media de 3 semillas).
- No soporta tool calling, agentes, visión, audio ni generación de texto libre; es un clasificador/scorer de lecturas.

## Casos de uso

- Front-end de TTS en bengalí: insertar el modelo antes del sintetizador para convertir palabras heterónimas en su lectura correcta y evitar pronunciaciones erróneas en frases como "সময়মতো কর না দিলে জরিমানা গুনতে হবে" (impuesto) frente a "আগে কর কাজটা" (hacer).
- Normalización lingüística en pipelines de datos: foneticizar corpus bengalíes antes de alimentar modelos de voz o de evaluación de pronunciación.
- Herramienta de anotación asistida: usar `phoneticize_detailed` para pre-anotar heterónimos con confianza y que revisores humanos validen solo los casos de baja seguridad.
- Sistemas de lectura accesible: lectura en voz alta de documentos con pronunciación contextualizada en aplicaciones de accesibilidad.
- Evaluación comparativa de modelos: servir como checkpoint de referencia en el benchmark `bangla-heteronym-benchmark` frente a `bangla-heteronym-banglabert` y el clasificador XLM-R-large.
- Investigación en grafema-a-fonema para lenguas de bajos recursos: base para experimentos de candidate scoring aplicados a otros idiomas con heterónimos.
- Procesamiento por lotes de grandes volúmenes: con `phoneticize_batch` y ~310 frases/s en GPU (batch 32) se pueden foneticizar corpus extensos en tiempos razonables.

## Benchmarks y rendimiento

Test set del split principal: 1.104 frases, 3 por lectura.

| Modelo / configuración | Accuracy | Macro-F1 |
|---|---|---|
| Este checkpoint (semilla 43) | 97,10 % | 96,90 % |
| Media de 3 semillas | 83,30 ± 23,82 % | 81,52 ± 26,59 % |
| Clasificador XLM-R-large (mismos datos) | 98,43 % | no disponible |
| bangla-heteronym-banglabert (recomendado por el autor) | 99,46 % | no disponible |
| Candidate scoring sin 37 palabras reservadas (media 3 semillas) | 62,0 % en palabras no vistas | no disponible |

Rendimiento por frase (batch size 1, pipeline completo): 19,9 ms en Tesla T4 con fp16 y 175 ms en 4 hilos de CPU. En GPU, ~310 frases/s con batch size 32.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; con 559,9 M de parámetros en fp16 los pesos ocupan aproximadamente 1,1 GB, más overhead de activaciones y del pipeline.
- GPU recomendadas: Tesla T4 es la GPU de referencia del autor (fp16); cualquier GPU con al menos ~4 GB de VRAM debería bastar para inferencia en fp16.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares, aunque no se han publicado mediciones específicas.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el modelo requiere el código del repositorio `bangla-heteronym-benchmark` (`src.predict.Predictor`) por su cabeza personalizada.
- Latencia y throughput: 19,9 ms/frase en T4 (fp16, batch 1), 175 ms/frase en 4 hilos de CPU, ~310 frases/s en GPU con batch 32.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bangla-heteronym-xlm-roberta-large-candidate (este) | 559,9 M | no disponible | 97,10 % | MIT | Hugging Face |
| bangla-heteronym-banglabert | no disponible | no disponible | 99,46 % | no disponible | Hugging Face |
| Clasificador XLM-R-large (misma data) | no disponible | no disponible | 98,43 % | no disponible | no disponible |

El autor recomienda `bangla-heteronym-banglabert` para la mayoría de usos por su mayor precisión (99,46 %) y menor latencia (12,5 ms en T4). No se dispone de comparativas con modelos de terceros.

## Limitaciones y advertencias

- El código cubre únicamente los heterónimos del dataset; para palabras fuera de él, `predict` lanza `ValueError`, aunque el modelo pueda puntuar sus lecturas.
- Las frases de entrenamiento fueron redactadas para el dataset, por lo que la accuracy en texto real puede ser inferior a la reportada.
- Entrenamiento inestable: una de las tres semillas cayó al 55,80 % de accuracy; este checkpoint es el mejor por desarrollo, no una media robusta.
- Generalización limitada a palabras no vistas: 62,0 % en 37 palabras reservadas.
- Solo idioma bengalí; no hay soporte multilingüe aunque el modelo base lo sea.
- Riesgo de errores en contextos ambiguos o poco representados; las confianzas de ejemplo son bajas (~0,51-0,54), lo que sugiere calibración débil.
- Licencia MIT, permisiva para uso comercial, manteniendo el aviso de copyright original del modelo base.
- Requiere código externo para cargarse; no es un pipeline estándar de `transformers` sin la cabeza personalizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kawshikbuet17/bangla-heteronym-xlm-roberta-large-candidate
- Modelo recomendado: https://huggingface.co/kawshikbuet17/bangla-heteronym-banglabert
- Dataset: https://huggingface.co/datasets/kawshikbuet17/bangla-heteronyms
- Repositorio del benchmark: https://github.com/kawshikbuet17/bangla-heteronym-benchmark
- Modelo base: https://huggingface.co/xlm-roberta-large
