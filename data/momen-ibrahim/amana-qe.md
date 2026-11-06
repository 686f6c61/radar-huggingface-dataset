# momen-ibrahim/amana-qe

## Resumen

AMANA-QE es un modelo de estimación de calidad de traducción (QE, *quality estimation*) desarrollado por Momen Ibrahim Fawzy en el marco del proyecto AMANA, un estudio sobre preservación del significado clínico en la traducción inglés → árabe de instrucciones de medicación. Dado un texto fuente en inglés y una traducción candidata al árabe, el modelo devuelve una puntuación de clasificación binaria que indica la probabilidad de que la traducción conserve el significado de la instrucción original, con especial atención a errores críticos como dosis, concentración, unidad, frecuencia, duración, vía de administración, lateralidad, negación u omisión.

Técnicamente es un *cross-encoder* de dos clases construido sobre `sentence-transformers/LaBSE` (familia BERT, 470,9 millones de parámetros), afinado durante 2 épocas con un objetivo de clasificación de secuencias. No es un modelo generativo: no traduce ni corrige, solo puntúa pares (fuente, hipótesis). Su relevancia es metodológica: se publica como artefacto de reproducibilidad de un benchmark propio (AMANA-Bench) y su model card documenta con inusual honestidad las limitaciones del enfoque, incluyendo una comparación contra una línea base *source-blind* que revela cuánto de su rendimiento aparente puede atribuirse a sesgos del generador de datos.

El modelo está pensado exclusivamente para investigación y comparación de resultados, no para uso clínico. La propia model card advierte que es una puntuación de ranking, no una comprobación de seguridad, y que no debe emplearse para aprobar traducciones destinadas a pacientes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (LaBSE) como cross-encoder de clasificación de secuencias |
| Parámetros totales | 470.928.386 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 192 tokens (longitud máxima de truncado usada en el ejemplo de inferencia; no se especifica la ventana nativa de LaBSE en la información disponible) |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés (fuente) y árabe (traducción); árabe estándar moderno según la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de LaBSE (*Language-agnostic BERT Sentence Embedding*), un encoder BERT multilingüe preentrenado con un objetivo de embeddings de frase alineados entre idiomas. Sobre esa base se aplica un *fine-tuning* como cross-encoder de dos clases: la entrada es la concatenación de la instrucción en inglés y la traducción candidata en árabe, y la salida es un logit por clase donde la etiqueta 1 corresponde a "significado preservado". El entrenamiento se realizó durante 2 épocas con tasa de aprendizaje 2e-5, tamaño de lote 32 y semilla 13.

Los datos de entrenamiento provienen del *split* de entrenamiento de AMANA-Bench: instrucciones de medicación generadas en inglés y traducidas al árabe, con versiones correctas y versiones que contienen exactamente un error crítico (dosis, concentración, unidad, frecuencia, duración, momento de administración, vía, lateralidad, negación, omisión o fármaco). La partición se hace por fármaco, de modo que los 13 fármacos de test no aparecen en entrenamiento. La model card señala explícitamente que el generador de datos, las etiquetas y el modelo fueron creados por un único autor, lo que introduce un riesgo de circularidad metodológica que el propio autor documenta.

## Capacidades

- Clasificación binaria de pares (instrucción en inglés, traducción al árabe) con salida de dos logits; la clase 1 indica significado preservado.
- Puntuación comparativa entre múltiples traducciones candidatas de una misma fuente (ranking relativo, no umbral absoluto).
- Detección de errores críticos en instrucciones médicas: dosis, concentración, unidad (por ejemplo mcg frente a mg), frecuencia, duración, momento, vía de administración, lateralidad, negación, omisión y sustitución de fármaco.
- Procesamiento de texto bilingüe inglés-árabe en un único paso (cross-encoder, no requiere embeddings separados).
- Inferencia por lotes mediante `padding=True` y truncado a 192 tokens.
- No soporta *tool calling*, ni razonamiento multi-paso, ni generación de texto, ni visión, ni audio.
- No dispone de modo *thinking* ni de capacidades de agente.

## Casos de uso

- Evaluación de sistemas de traducción automática médica en investigación: puntuar las salidas de un motor MT inglés → árabe sobre un conjunto de instrucciones de medicación y comparar candidatos entre sí para detectar regresiones entre versiones del sistema.
- Reproducción y comparación de resultados de AMANA-Bench: el modelo se publica precisamente para que terceros puedan replicar las cifras del estudio y contrastarlas con líneas base alternativas.
- Filtrado de candidatos en un pipeline de traducción con múltiples hipótesis: dado un texto fuente y N traducciones generadas por distintos sistemas o por *sampling*, ordenarlas por la puntuación del modelo y priorizar las mejor situadas para revisión humana.
- Estudio de sensibilidad a errores críticos: construir pares controlados que difieran en una sola dimensión (unidad, negación, lateralidad) y medir cómo varía la puntuación, como experimento de análisis de robustez.
- Investigación sobre sesgos de generadores sintéticos: usar el modelo y su línea base *source-blind* para cuantificar cuánto del rendimiento aparente proviene de artefactos del generador de datos y no de la comprensión bilingüe real.
- Docencia y formación en evaluación de MT clínica: ilustrar con un caso real y documentado las diferencias entre AUROC, calibración y falsas alarmas en un dominio de alto riesgo.

## Benchmarks y rendimiento

| Pista de evaluación | AUROC | Falsas alarmas a umbral 0,5 | Error de calibración esperado (ECE) |
|---|---:|---:|---:|
| AMANA-Bench, fármacos no vistos (mismas plantillas) | 0,999 | 0 % | 0,009 |
| TICO-19 texto real con un error de número o negación inyectado | 0,80 | 70 % | 0,46 |
| Tipos de error excluidos del entrenamiento: unidad, lateralidad, negación (5 semillas; recall a 0,5 del 7–36 %) | 0,66–0,73 | 0–6 % | 0,31–0,46 |
| Formas farmacéuticas excluidas del entrenamiento: colirios, inhaladores (5 semillas) | 0,85–0,86 | 70–100 % | 0,26–0,33 |

Línea base *source-blind* (clasificador de n-gramas de caracteres que nunca ve el inglés): AUROC 0,711 en los mismos fármacos no vistos, y 0,94 para errores de unidad, vía y negación. Las dos últimas filas de la tabla corresponden a modelos reentrenados sin esos tipos de error o formas, no al modelo publicado.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,9 GB solo para pesos (470,9 M de parámetros), más activaciones y memoria del tokenizador; en la práctica, entre 2 y 3 GB para lotes pequeños.
- En fp16/bf16: alrededor de 1 GB de pesos; cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU consumer compatibles: RTX 3060, RTX 4060, RTX 4070, RTX 4090 y equivalentes; también ejecutable en CPU para volúmenes moderados.
- GPU de datacenter recomendadas para evaluación por lotes a gran escala: A100, H100, L40S.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification` (ruta documentada por el autor), `optimum`/ONNX Runtime para aceleración, o `vLLM`/`TGI` solo si se adapta como clasificador (no es un modelo generativo y no se beneficia de *continuous batching* de decodificación).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Idiomas | Licencia | Uso previsto |
|---|---|---:|---|---|---|---|
| AMANA-QE | Cross-encoder de clasificación (LaBSE) | 470,9 M | 192 tokens (truncado documentado) | en, ar | Apache 2.0 | QE de MT médica inglés → árabe |
| COMET / COMETKiwi (Unbabel) | Estimadores de calidad de MT neuronales | No disponible en esta ficha | No disponible | Multilingüe | No disponible | QE y métricas aprendidas de MT general |
| BLEURT | Regresor de calidad de MT sobre BERT | No disponible en esta ficha | No disponible | Multilingüe | No disponible | Métrica aprendida de MT general |
| LaBSE (base) | Encoder de embeddings de frase | 471 M aprox. | No disponible | 109 idiomas | Apache 2.0 | Similitud semántica multilingüe, recuperación |

La comparación directa con COMET o BLEURT no está respaldada por datos publicados en la información disponible: AMANA-QE solo se evalúa contra su propia línea base *source-blind* y sobre sus propias pistas de AMANA-Bench y TICO-19. No se han publicado resultados de benchmarks en la información disponible que permitan situarlo frente a esos estimadores en condiciones equivalentes.

## Limitaciones y advertencias

- Entrenado únicamente con instrucciones generadas a partir de una sola gramática de plantillas, en árabe estándar moderno; no se ha probado con errores de traducción que ocurran de forma natural.
- No está calibrado: a umbral 0,5 las falsas alarmas oscilan entre el 0 % y el 100 % según la pista y la semilla. No debe interpretarse la salida como probabilidad ni aplicarse un umbral fijo.
- El AUROC de 0,999 en AMANA-Bench debe leerse contra la línea base *source-blind* (0,711 en los mismos fármacos), lo que sugiere que buena parte de la puntuación puede provenir solo del texto árabe y de artefactos del generador. La caída a 0,66–0,73 (media 0,69) en tipos de error no vistos es la señal más clara de que el modelo aprendió el generador.
- El modelo principal corresponde a una única semilla; las filas de tipos de error y formas farmacéuticas excluidas provienen de modelos reentrenados, no del publicado.
- No ha sido evaluado por ningún clínico y no es un dispositivo médico. No debe usarse para aprobar traducciones destinadas a pacientes.
- Generador de datos, etiquetas y modelo fueron producidos por un mismo autor, lo que introduce riesgo de circularidad en la evaluación.
- Licencia Apache 2.0 para los pesos; AMANA-Bench se distribuye bajo CC BY 4.0 y requiere citar el `CITATION.cff` del repositorio.
- Sin descargas ni *likes* en el momento de la consulta; no hay evidencia de uso independiente ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/momen-ibrahim/amana-qe
- Repositorio del proyecto AMANA: https://github.com/Momen-Ibrahim-Fawzy/AMANA-Medical-Translation-Safety
- Modelo base LaBSE: https://huggingface.co/sentence-transformers/LaBSE
- Dataset TICO-19: https://huggingface.co/datasets/tico19
