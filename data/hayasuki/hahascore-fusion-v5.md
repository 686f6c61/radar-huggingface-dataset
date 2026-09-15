# Hayasuki/hahascore-fusion-v5

## Resumen

HaHaScore Fusion v5 (Final) es un modelo de clasificación discriminativo desarrollado por Hayasuki que predice la fuerza del humor a nivel de oración combinando características textuales y auditivas. No es un modelo generativo, sino un clasificador que devuelve una puntuación de probabilidad. La arquitectura fusiona dos codificadores preentrenados: DeBERTa-v3-base para el texto (salida de 768 dimensiones) y WavLM-base-plus para el audio (características medias de 512 dimensiones), mediante una fusión bilineal (producto de Hadamard), concatenación y una red MLP de 384 a 1 neurona.

El modelo se entrenó con 3.774 clips de frases procedentes de 38 vídeos de un programa de comedia, y se validó sobre 9.211 clips de 10 vídeos reservados. Su relevancia radica en que demuestra que los modelos basados solo en texto alcanzan un AUC cercano a 0,50 (equivalente a aleatorio) para la detección de humor, mientras que la señal prosódica del audio es el factor discriminativo principal. La versión fusionada logra un AUC de 0,632 en validación cruzada de 5 pliegues y 0,613 en validación held-out.

Nota: el repositorio de HuggingFace no contiene pesos (tamaño 0,0 GB), por lo que el modelo no está disponible para descarga directa en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Fusión bilineal de DeBERTa-v3-base (texto) y WavLM-base-plus (audio) + MLP (384→128→32→1) |
| Parámetros totales | no disponible |
| Longitud de contexto | no disponible (modelo discriminativo de clasificación, no generativo) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La arquitectura consta de dos ramas encoders. La rama de texto utiliza el modelo microsoft/deberta-v3-base, del que se extrae la salida del pooler (768 dimensiones). La rama de audio emplea microsoft/wavlm-base-plus, del que se toman las características medias a lo largo de la dimensión temporal (512 dimensiones). Ambas representaciones se fusionan mediante un producto de Hadamard (fusión bilineal), se concatenan y se pasan por un MLP de tres capas (384→128→32→1) que produce la puntuación final de humor. No se aplica RLHF ni DPO, ya que es un modelo de clasificación supervisada.

El entrenamiento se realizó sobre 3.774 clips de frases extraídos de 38 vídeos de comedia, con una segmentación basada en pausas de 0,5 segundos. La validación utilizó 9.211 clips de 10 vídeos reservados. Se empleó validación cruzada de 5 pliegues sobre el conjunto de entrenamiento. El audio se limitó a los últimos 6 segundos de cada frase. El hallazgo principal del autor es que la prosodia domina la señal de humor: los modelos solo-texto (RoBERTa, DeBERTa) obtienen AUC ≈ 0,50, mientras que solo-audio alcanza 0,538 y la fusión llega a 0,613.

## Capacidades

- Predicción de la fuerza del humor a nivel de oración, devolviendo una puntuación continua que puede interpretarse como probabilidad de que la frase sea humorística.
- Fusión multimodal de características textuales y auditivas mediante un mecanismo bilineal.
- Capacidad para explotar rasgos prosódicos del habla (tono, ritmo, énfasis) como señal discriminativa, en lugar de depender solo del contenido semántico.
- No es un modelo generativo: no genera texto, no soporta tool calling, ni razonamiento multi-step, ni agentes.
- No soporta visión; el audio se procesa como entrada acústica, no como entrada multimodal de audio y texto libre.
- Idiomas soportados: no disponible; el entrenamiento procede de un programa de comedia en inglés (no confirmado explícitamente, pero el modelo usa encoders ingleses).

## Casos de uso

- Análisis de actuaciones de comedia: el modelo puede puntuar cada frase de un monólogo para identificar qué líneas resultan más humorísticas según la entrega vocal, lo que permite a cómicos y guionistas ajustar su actuación.
- Investigación en humor computacional: permite estudiar el papel de la prosodia frente al contenido textual, contrastando la hipótesis de que la comedia depende más de cómo se dice que de qué se dice.
- Retroalimentación en producción de contenido cómico: los equipos de guion pueden usar las puntuaciones para comparar diferentes tomas de una misma frase y seleccionar la más graciosa.
- Sistemas de recomendación de clips humorísticos: dada una colección de vídeos, el modelo puede generar rankings de fragmentos según su fuerza humorística, integrable en plataformas de vídeo.
- Evaluación de doblaje o actuación vocal: permite comparar versiones de audio de una misma frase para medir cuál produce mayor respuesta humorística, útil en localización de contenidos.
- Análisis de diferencias de estilo entre cómicos: al puntuar frases de distintos shows, se pueden detectar patrones de entrega prosódica asociados a un mayor humor, lo que sirve para investigación en lingüística computacional.

## Benchmarks y rendimiento

Se han publicado resultados de validación y comparación de modalidades en la documentación del modelo. No se dispone de benchmarks estándar como MMLU, HumanEval o GSM8K porque no es un modelo de lenguaje generativo.

| Métrica | Valor |
|---|---|
| 5-Fold CV AUC | 0,632 ± 0,007 |
| Held-Out Val AUC | 0,613 |
| Average Precision | 0,314 |
| Max F1 | 0,424 |

Comparativa de modalidades (según el autor):

| Modelo | AUC |
|---|---|
| Text-only (RoBERTa) | 0,499 |
| Text-only (DeBERTa) | 0,501 |
| Audio-only (WavLM LR) | 0,538 |
| Fusion v5 (DeBERTa + WavLM bilinear) | 0,613 |

## Requisitos de hardware

No se han publicado requisitos de hardware específicos para este modelo. A partir de la arquitectura, se puede inferir que al usar dos encoders de tamaño base (DeBERTa-v3-base y WavLM-base-plus), el modelo es pequeño en comparación con modelos de lenguaje modernos, pero no se dispone de datos confirmados sobre VRAM, GPU recomendada, latencia o throughput. Las opciones de despliegue habituales para este tipo de modelos de clasificación (por ejemplo, con PyTorch) no están documentadas en la información disponible.

- VRAM estimada: no disponible.
- GPU recomendada: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se ha publicado una comparativa con modelos alternativos de la misma categoría en la información disponible. La única comparación documentada es la de modalidades dentro del propio modelo (text-only, audio-only y fusión), presentada en la sección de benchmarks. No se conocen modelos de fusión bilineal de DeBERTa y WavLM para predicción de humor con los que se pueda contrastar.

## Limitaciones y advertencias

- Entrenado en 38 vídeos de un único programa de comedia, lo que limita la diversidad de estilos humorísticos y puede causar sobreajuste a ese dominio concreto.
- Las etiquetas son binarias (gracioso/no gracioso); la puntuación continua de humor no ha sido validada como escala ordinal o de intensidad.
- La segmentación de oraciones se basa en una heurística de pausas de 0,5 segundos, lo que puede producir límites de frase inexactos.
- El audio se limita a los últimos 6 segundos de cada frase, por lo que el contexto prosódico anterior se pierde.
- No se especifica la licencia, lo que impide conocer las restricciones de uso comercial o redistribución.
- El repositorio de HuggingFace no contiene pesos (0,0 GB), por lo que no es posible descargar ni ejecutar el modelo en su estado actual.
- El hallazgo de que los modelos solo-texto son aleatorios (AUC ~0,50) implica que cualquier aplicación basada únicamente en el texto para detectar humor sería ineficaz con esta configuración.
- No se han documentado sesgos específicos, pero al proceder de un único programa de comedia, puede reflejar sesgos culturales y de género inherentes a ese contenido.

## Enlaces

- HuggingFace: https://huggingface.co/Hayasuki/hahascore-fusion-v5
- No se han encontrado enlaces adicionales relevantes (papers, blogs, repos, demos) en la búsqueda web.
