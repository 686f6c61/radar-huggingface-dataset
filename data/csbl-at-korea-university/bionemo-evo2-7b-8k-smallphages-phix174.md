# CSBL-at-Korea-University/bionemo-evo2-7b-8k-smallphages-phix174

## Resumen

El modelo `bionemo-evo2-7b-8k-smallphages-phix174` es un ajuste fino (fine-tuning) del modelo genómico Evo 2 de 7 mil millones de parámetros, publicado por el grupo CSBL (Computational Synthetic Biology Lab) de la Korea University. El nombre indica que parte de la variante Evo 2 con ventana de contexto de 8 000 tokens y que ha sido especializado sobre un conjunto de genomas de fagos pequeños, con el bacteriófago PhiX174 como referencia. Evo 2 es un modelo de lenguaje genómico desarrollado originalmente por el Arc Institute y NVIDIA, diseñado para modelar secuencias de ADN a escala nucleotídica.

La relevancia de este modelo es acotada pero específica: se trata de un artefacto de investigación orientado a la modelización de genomas virales pequeños, un dominio donde los modelos genómicos generalistas suelen estar infrainrepresentados. La ficha de Hugging Face no aporta documentación técnica, métricas ni detalles del procedimiento de entrenamiento, por lo que la mayor parte de las especificaciones deben considerarse no disponibles.

El modelo se publica bajo licencia Apache 2.0, lo que permite uso comercial y modificación, aunque la ausencia de documentación y de resultados de evaluación limita seriamente su uso en producción sin una validación previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Evo 2, transformer genómico; sin confirmar en la model card) |
| Parametros totales | 7B (según el identificador del modelo) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 8 192 tokens (según el identificador "8k") |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de secuencias genómicas, no de lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura en la model card. Por el identificador y el linaje declarado, se trata de un derivado de Evo 2, un modelo autorregresivo de secuencias genómicas que opera sobre tokens de ADN (habitualmente con tokenización por nucleótidos o por pares de bases) y que emplea atención de contexto largo para capturar dependencias a escala de genoma. La variante de 7B con contexto de 8k corresponde a la familia de modelos Evo 2 descrita públicamente por el Arc Institute.

El ajuste fino se ha realizado, según el nombre, sobre fagos pequeños con PhiX174 como referencia, un genoma circular de ADN de cadena sencilla de 5 386 nucleótidos. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales.

## Capacidades

- Modelado de secuencias genómicas: generación y puntuación de probabilidad de secuencias de ADN, presumiblemente especializado en genomas de fagos pequeños.
- Generación de secuencias plausibles dentro del dominio de los bacteriófagos pequeños, útil para tareas de diseño in silico.
- Cálculo de verosimilitud de secuencias (scoring), aplicable a la evaluación de variantes o secuencias candidatas.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso ni comportamiento agéntico.
- No se documentan capacidades multilingües en lenguaje natural; el modelo opera sobre alfabeto nucleotídico.
- No se documentan modos especiales como thinking mode, visión o audio.

## Casos de uso

- Generación de genomas sintéticos de fagos: el modelo puede muestrear secuencias de ADN con estadísticas compatibles con las de fagos pequeños, sirviendo como punto de partida para propuestas de diseño en biología sintética.
- Puntuación de variantes genómicas: al ser un modelo autorregresivo, permite calcular la log-verosimilitud de secuencias mutadas y compararlas con la referencia PhiX174 para priorizar variantes de interés.
- Análisis de regiones reguladoras en genomas virales: con 8k tokens de contexto, puede modelar dependencias que abarcan genomas completos de fagos pequeños, algo relevante para estudiar elementos reguladores distribuidos.
- Investigación en modelos de lenguaje genómico: sirve como caso de estudio de ajuste fino de Evo 2 sobre dominios estrechos, útil para grupos que replican o comparan estrategias de especialización.
- Filtrado de secuencias en pipelines de síntesis: integrado como modelo de scoring en un pipeline bioinformático, puede descartar secuencias generadas que se desvíen de la distribución del dominio de fagos.
- Docencia y experimentación académica: al ser Apache 2.0 y de tamaño 7B, es viable para laboratorios con recursos moderados que quieran experimentar con modelos genómicos sin depender de pesos cerrados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, aproximadamente 14-16 GB para los pesos de 7B más overhead de activaciones; en cuantización de 8 bits, en torno a 8 GB; en 4 bits, alrededor de 4-5 GB (estimaciones genéricas para 7B, no verificadas para este modelo).
- GPU recomendadas: A100 40/80 GB o H100 para inferencia en fp16 con lotes grandes y contexto completo; L40S o RTX 6000 Ada como alternativas profesionales.
- GPU de consumo: cabe en RTX 4090 (24 GB) en fp16 con contexto de 8k y lotes pequeños; en RTX 3090/4080 (16 GB) requiere cuantización de 8 bits; en GPUs de 8 GB solo con cuantización de 4 bits.
- Opciones de despliegue: al ser un modelo de secuencias genómicas, no es directamente compatible con servidores de inferencia para LLM sin adaptar la tokenización; sería necesario verificar la compatibilidad con vLLM, TGI o llama.cpp, que no está documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bionemo-evo2-7b-8k-smallphages-phix174 | 7B | 8k | Fagos pequeños (fine-tuning) | Apache 2.0 | Hugging Face |
| Evo 2 (variante base 7B) | 7B | hasta 1M en variantes mayores | Genómica general | no disponible en la informacion | no disponible en la informacion |
| Nucleotide Transformer | 500M-2.5B | 1k-12k | Genómica general | no disponible en la informacion | no disponible en la informacion |
| DNABERT-2 | ~117M | 512 | Genómica general | no disponible en la informacion | no disponible en la informacion |

La comparación es orientativa: no se dispone de métricas de rendimiento del modelo evaluado ni de las alternativas en la información proporcionada, por lo que la tabla solo refleja tamaño, contexto y licencia.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card no describe el dataset de entrenamiento, el procedimiento de ajuste ni los hiperparámetros, lo que impide reproducir o auditar el modelo.
- Dominio extremadamente estrecho: especializado en fagos pequeños, es probable que su rendimiento fuera de ese dominio sea pobre o impredecible.
- Riesgo de alucinación biológica: como modelo generativo, puede producir secuencias de ADN sintácticamente plausibles pero biológicamente inviables; cualquier secuencia generada requiere validación experimental.
- Sin métricas de evaluación: no hay benchmarks publicados, por lo que no puede compararse objetivamente con alternativas.
- Idiomas: no aplica a lenguaje natural; no debe usarse para tareas de texto convencionales.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume toda la responsabilidad sobre la calidad y seguridad de los resultados; no hay garantías del autor.
- Caveat de producción: sin documentación de tokenización ni de formato de pesos, la integración en pipelines existentes requiere ingeniería inversa y validación adicional.
- Riesgo de sesgo de datos: si el ajuste se hizo exclusivamente sobre PhiX174 y fagos relacionados, el modelo puede sobreajustar a esas secuencias y fallar en fagos con composición distinta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CSBL-at-Korea-University/bionemo-evo2-7b-8k-smallphages-phix174
- No se han encontrado en la búsqueda web papers, blogs, repositorios o demos adicionales asociados a este modelo concreto.
