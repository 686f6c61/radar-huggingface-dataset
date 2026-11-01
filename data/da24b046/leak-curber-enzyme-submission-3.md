# da24b046/leak-curber-enzyme-submission-3

## Resumen

Submission 3 es un sistema de recuperación de números EC (Enzyme Commission) para reacciones químicas, desarrollado por el usuario da24b046 en el contexto de una competición de clasificación enzimática. No es un modelo de lenguaje: se trata de un encoder supervisado basado en un MLP cuyas dos primeras capas ocultas transforman una representación de reacción química (firmas DRFP más contexto Morgan direccional) en un vector de 256 dimensiones normalizado a L2 unitaria. La predicción se realiza por recuperación exacta por similitud coseno contra un índice de 63.280 reacciones de entrenamiento, votando entre los 50 vecinos más cercanos.

El modelo reutiliza los pesos ocultos ya reentrenados de la submission 2 (clasificador MLP supervisado por enzima) eliminando la capa de salida final. Es, por tanto, un artefacto de embeddings aprendidos de forma supervisada, no un transformer de lenguaje congelado ni un encoder entrenado con objetivos contrastivos. El repositorio ocupa 0,1 GB e incluye el encoder, el índice, la configuración y el vocabulario de etiquetas EC, sin descargas remotas en inferencia.

La relevancia es acotada: se trata de una submission de competición con evaluación local sobre un split público reutilizado (80/10/10, semilla 2202), sin puntuación oficial ni ganancia de leaderboard declarada. Su interés técnico reside en el pipeline de representación de reacciones (DRFP 0.3.7) y en la estrategia de retrieval supervisado con votación ponderada por coseno elevado a la potencia 32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP supervisado (encoder de embeddings); dos primeras capas ocultas de la submission 2, sin capa de salida |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: reacción química codificada como DRFP + contexto Morgan direccional) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT (software); vocabulario EC bajo ExPASy ENZYME, CC BY 4.0; dataset de entrenamiento no relicenciado |
| Formato de pesos | no disponible (artefacto empaquetado con encoder, índice, configuración y etiquetas; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

La entrada es una reacción codificada mediante DRFP (versión 0.3.7, del grupo Reymond) combinada con contexto Morgan direccional. Esa representación se pasa por las dos primeras capas ocultas de un MLP supervisado por etiqueta enzimática (el clasificador de la submission 2), produciendo un vector de 256 dimensiones que se normaliza a longitud L2 unitaria. La capa de clasificación final se elimina: el resultado es un espacio de embeddings optimizado para clasificación enzimática, no para aprendizaje contrastivo de distancias.

El entrenamiento del encoder de despliegue usó el 100 % de los datos durante 67 épocas; el encoder usado en evaluación se entrenó solo con el 80 % del split. El índice de recuperación contiene las 63.280 reacciones públicas de entrenamiento y es un artefacto aprendido requerido en inferencia, no un dataset crudo. La votación usa los 50 vecinos más cercanos con coseno no negativo elevado a la potencia 32, repartiendo el voto de cada vecino a partes iguales entre sus etiquetas EC distintas registradas, y predice un único EC completo permitido. Los empates entre vecinos se resuelven por orden de índice; los empates de voto EC, por priors de etiquetas de entrenamiento y luego por orden alfabético de EC. Los embeddings nulos caen al prior de entrenamiento.

## Capacidades

- Predicción de un número EC completo (niveles L1 a L4) a partir de una reacción en formato SMILES de reacción (`rxn_smiles`).
- Recuperación exacta por similitud coseno sobre un índice de 63.280 reacciones de entrenamiento.
- Votación ponderada entre los 50 vecinos más cercanos con reparto equitativo entre etiquetas EC distintas.
- Cálculo de embeddings para reacciones nuevas arbitrarias en tiempo de inferencia.
- Ejecución offline: sin GPU, sin red y sin caché de características en disco.
- Procesamiento por lotes acotados con dos hilos numéricos.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües.

## Casos de uso

- Anotación asistida de enzimas en pipelines de biología computacional: dado un conjunto de reacciones en Parquet con columnas `id` y `rxn_smiles`, el modelo devuelve un EC predicho por reacción en JSONL, útil como primera pasada antes de revisión manual.
- Filtrado previo en bases de datos de reacciones: descartar o priorizar candidatos según su EC predicho para reducir el espacio de búsqueda en estudios de metabolómica.
- Enriquecimiento de datasets de reacciones huérfanas: asignar un EC tentativo a reacciones sin anotación usando el índice de entrenamiento como referencia.
- Evaluación comparativa de representaciones de reacciones: servir como línea base de retrieval supervisado frente a clasificadores directos (como la submission 2) en experimentos internos.
- Despliegue en contenedor sin GPU: el Dockerfile usa `/app`, usuario no root, Linux amd64 y ejecución offline, adecuado para entornos con restricciones de red o hardware.
- Reproducción de experimentos de competición: el comando offline `python /app/predict.py --input INPUT.parquet --output OUTPUT.jsonl` permite replicar la evaluación local sobre el split público.

## Benchmarks y rendimiento

Evaluación local sobre grupos de reacción exactos, split 80/10/10 con semilla 2202 (50.624 entrenamiento, 6.328 desarrollo, 6.328 test). El test se puntúa una sola vez tras ajustar en desarrollo.

| Modelo, mismo test local | L4 | L3 | L2 | L1 |
|---|---:|---:|---:|---:|
| Submission 1, reentrenada sobre el mismo 80 % | 52,237016 % | 79,523263 % | 83,236287 % | 89,806961 % |
| Submission 2, clasificador entrenado en el split | 63,337362 % | 86,913232 % | 89,671746 % | 93,463367 % |
| Submission 3, retrieval con embeddings supervisados | 63,338278 % | 86,789022 % | 89,567306 % | 93,478014 % |

El L4 de la submission 3 está efectivamente empatado con la submission 2; el intervalo de confianza pareado incluye cero. No existe puntuación oficial de la submission 3 y no se reclama mejora en el leaderboard. La evaluación reutiliza un split de test público ya evaluado previamente; no constituye evidencia externa fresca.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es exclusivamente en CPU.
- GPU recomendadas: ninguna; el autor indica explícitamente "no GPU".
- Cabe en cualquier CPU moderna con memoria suficiente para el índice de 63.280 reacciones; índices mayores incrementan el coste de CPU y memoria.
- Hilos: dos hilos numéricos configurados.
- Despliegue: contenedor Docker con `/app`, `/usr/local/bin/python`, Linux amd64 y usuario no root; sin red ni descargas remotas.
- Latencia y throughput: no disponibles; el autor señala que los tiempos de ejecución local dependen del hardware.
- El escritor de salida limita el fichero de salida a 16 MiB.

## Comparativa con modelos similares

| Modelo | Tipo | Estrategia | L4 (test local) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Submission 3 (este) | Encoder MLP + retrieval | Embeddings supervisados + kNN coseno (k=50, potencia 32) | 63,338278 % | MIT | Pública en HuggingFace |
| Submission 2 | Clasificador MLP | Clasificación directa supervisada | 63,337362 % | no disponible | Referenciada por el autor |
| Submission 1 | Clasificador (reentrenado) | Clasificación directa | 52,237016 % | no disponible | Referenciada por el autor |

No se dispone de comparación con modelos externos de predicción de EC en la información proporcionada.

## Limitaciones y advertencias

- DRFP usa fragmentos canónicos locales internamente, pero las entradas completas y el agrupamiento nunca se canonicalizan.
- Colisiones de hash internas, soporte limitado de etiquetas y etiquetas ambiguas permanecen como limitaciones.
- El coste de búsqueda exacta crece con el tamaño del índice.
- Los vectores ocultos se optimizaron para clasificación enzimática, no explícitamente para aprendizaje contrastivo de distancias.
- Clases EC completas no vistas no pueden inferirse sin soporte en el índice.
- Las similitudes se recortan a [-1, 1] y se redondean a seis decimales.
- Los embeddings nulos caen al prior de entrenamiento, lo que puede producir predicciones poco informativas.
- El modelo de despliegue se entrenó con todos los datos; no debe usarse para afirmaciones sobre datos held-out. Para evaluación debe usarse el encoder entrenado solo con el 80 %.
- La declaración de licencia MIT cubre el software, pero no relicencia el dataset de entrenamiento original ni el vocabulario EC (ExPASy ENZYME, 2 de septiembre de 2026, SIB, CC BY 4.0).
- Sin datos de sesgo, alucinación o rendimiento multilingüe aplicables al no ser un modelo de lenguaje.
- Sin puntuación oficial ni evidencia externa fresca; los resultados son de evaluación local sobre un split público reutilizado.

## Enlaces

- HuggingFace: https://huggingface.co/da24b046/leak-curber-enzyme-submission-3
- DRFP (repositorio original): https://github.com/reymond-group/drfp
- Vocabulario EC (ExPASy ENZYME): https://enzyme.expasy.org/
