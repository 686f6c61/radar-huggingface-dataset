# da24b046/leak-curber-enzyme-submission-5

## Resumen

`leak-curber-enzyme-submission-5` es un paquete de inferencia para la predicción de números EC (Enzyme Commission) a partir de reacciones químicas, publicado por el usuario `da24b046` en Hugging Face. No se trata de un modelo de lenguaje ni de un transformer generativo: es un sistema de recuperación (retrieval) sobre embeddings químicos que predice la clasificación EC de una reacción enzimática. El autor lo describe explícitamente como "no un nuevo modelo predictivo", sino la retención del baseline de la submission 3 tras descartar varias alternativas basadas en transformers.

El pipeline combina características DRFP/Morgan de 8.192 bits, un encoder supervisado de dos capas ocultas entrenado sobre datos públicos, y una búsqueda de vecinos por similitud coseno sobre un índice de 63.280 filas. La predicción final se obtiene por votación ponderada de los 50 vecinos más cercanos, repartiendo el peso entre las distintas ECs registradas de cada vecino.

Es relevante como caso de estudio de ingeniería de competiciones de química computacional: el autor documenta que los transformers entrenados (adaptados con RXNFP, side-pooling, cabezas congeladas) obtuvieron peores resultados en desarrollo que el enfoque clásico de embeddings supervisados, y publica el paquete reproducible byte a byte. El repositorio ocupa 0,1 GB y no incluye pesos en formato estándar (safetensors/GGUF), sino artefactos de índice y etiquetas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Recuperación por similitud coseno sobre encoder supervisado (2 capas ocultas, salida 256D) con features DRFP/Morgan de 8.192 bits |
| Parametros totales | no disponible (no se publica el recuento del encoder) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de retrieval, no generativo) |
| Tipos de cuantizacion | no disponible (no se distribuyen pesos cuantizables) |
| Idiomas soportados | no disponible (entrada: reacciones en formato SMILES) |
| Licencia | MIT |
| Formato de pesos | Artefactos propios de retrieval: encoder final, índice de 63.280 filas y etiquetas alineadas; atribución DRFP en `DRFP_LICENSE.txt` |

## Arquitectura y entrenamiento

El sistema no es un transformer desplegado. La entrada son reacciones en formato `rxn_smiles`, que se vectorizan con DRFP y Morgan a 8.192 bits. Esos vectores alimentan el encoder supervisado original de dos capas ocultas entrenado sobre datos públicos, cuya salida de 256 dimensiones se normaliza. En inferencia se recuperan los 50 vecinos exactos por coseno y se vota con peso coseno no negativo elevado a la potencia 32, dividiendo el peso de cada vecino entre sus ECs distintas registradas. Se preservan desempates estables por fila, prior y clase, así como el fallback de prior para vectores cero.

El autor documenta experimentos con transformers sobre RXNFP (revisión `6fd48f4927c2178555cc5d71dbfb225fb178f43c`), incluyendo adaptación con learning rates 2e-5 y 5e-5, side-pooling en todas las capas y cabezas congeladas. Ninguno de esos checkpoints se despliega en el paquete retenido. La tabla de la model card reporta L4 de desarrollo entre 44,7 % y 52,7 % para los transformers, frente a 62,66 % del `old_supervised_embedding_head` y 63,55 % del `old_supervised_embedding_retrieval`. El split local es 80/10/10 por reacción exacta con semilla 2202.

## Capacidades

- Predicción de números EC completos (full-EC) a partir de una reacción enzimática en `rxn_smiles`.
- Recuperación de vecinos por similitud coseno sobre un índice de 63.280 reacciones etiquetadas.
- Votación ponderada con reparto de peso entre ECs distintas de un mismo vecino.
- Manejo determinista de empates (fila, prior, clase) y fallback de prior para vectores cero.
- Cobertura de 6.541 clases observadas de las 6.939 permitidas en el vocabulario ENZYME release 02-Sep-2026.
- Ejecución offline en Linux amd64, Python, dos hilos de CPU, sin GPU ni red.
- Entrada Parquet con columnas `id`/`rxn_smiles`; deduplicación por reacción exacta conservando el primer ID.
- Salida JSONL con exactamente `id` y un `prediction` de un elemento con la EC completa permitida.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto libre.

## Casos de uso

- Anotación automática de enzimas en pipelines de biología computacional: dado un conjunto de reacciones huérfanas, el sistema devuelve una EC candidata por reacción con bajo coste de CPU y sin dependencia de GPU.
- Curado de bases de datos de metabolismo: integrado como paso previo a revisión manual, descarta reacciones con ECs claras y marca las de baja confianza para revisión experta.
- Evaluación de modelos de anotación enzimática: el paquete sirve como baseline reproducible (63,55 % L4 en desarrollo) contra el que comparar nuevos enfoques de transformers.
- Despliegue en entornos restringidos: al ejecutarse offline con dos hilos de CPU y sin red, encaja en contenedores aislados o servidores sin aceleradores.
- Reproducción de resultados de competición: el comando `python /app/predict.py --input /input/val_inputs.parquet --output /tmp/predictions.jsonl` permite regenerar predicciones sobre el split local documentado.
- Docencia e investigación en quimioinformática: ilustra el compromiso entre features clásicas (DRFP/Morgan) y transformers preentrenados (RXNFP) en una tarea de clasificación multietiqueta.
- Filtrado previo en cribado de enzimas: para una biblioteca de reacciones candidatas, prioriza las que recuperan vecinos con EC consistente antes de ensayos experimentales.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el split local 80/10/10 por reacción exacta (semilla 2202), métrica top-1 L4 fraccional:

| Candidato | Época seleccionada | L4 entrenamiento | L4 desarrollo |
|---|---:|---:|---:|
| `adapted_lr2e5` | 8 | 76,2633 % | 46,0631 % |
| `adapted_lr5e5_512` | 9 | 77,5322 % | 47,8200 % |
| `adapted_sidepool_all_layers_512` | 20 | 81,1777 % | 52,6804 % |
| `fresh_frozen_rxnfp_512_head` | 57 | 79,8395 % | 45,6125 % |
| `fresh_frozen_rxnfp_head` | 56 | 79,2634 % | 44,7454 % |
| `fresh_sidepool_512_head` | 44 | 80,3910 % | 49,8559 % |
| `old_supervised_embedding_head` | 35 | 85,3000 % | 62,6612 % |
| `old_supervised_embedding_retrieval` | 67 | No medido | 63,5496 % |

El candidato retenido (`old_supervised_embedding_retrieval`) obtiene 63,5496 % de L4 portátil en desarrollo y 63,3383 % en el test interno reutilizado. El autor advierte que ese test interno ya se estudió en submissions anteriores y no constituye evidencia externa fresca. No existe puntuación oficial de la submission 5.

## Requisitos de hardware

- CPU: el runtime declarado usa dos hilos de CPU en Linux amd64, sin GPU ni red.
- VRAM: no aplica; no se requiere GPU.
- GPU recomendadas: ninguna; el paquete no está diseñado para aceleración por GPU.
- Cabe en cualquier equipo consumer: el repositorio ocupa 0,1 GB y el índice tiene 63.280 filas.
- Despliegue: ejecución directa con Python (`/usr/local/bin/python`) sobre el directorio de trabajo `/app`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `leak-curber-enzyme-submission-5` | Retrieval DRFP/Morgan + encoder supervisado | no disponible | no aplica | 63,55 % L4 desarrollo (split local) | MIT | Hugging Face, 0 descargas |
| `adapted_sidepool_all_layers_512` (mismo autor, no desplegado) | Transformer adaptado sobre RXNFP | no disponible | no disponible | 52,68 % L4 desarrollo | no disponible | Solo resultados en la model card |
| `fresh_sidepool_512_head` (mismo autor, no desplegado) | Transformer con side-pooling y cabeza | no disponible | no disponible | 49,86 % L4 desarrollo | no disponible | Solo resultados en la model card |

No se dispone de información sobre modelos externos comparables de predicción de EC en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo nuevo: el autor indica explícitamente que retiene el predictor de la submission 3 y desaconseja una submission duplicada en el leaderboard.
- Cobertura incompleta: 6.541 de 6.939 clases permitidas están observadas; las clases realmente ausentes no pueden inferirse sin evidencia adicional.
- El test interno (63,3383 %) ya se estudió en submissions anteriores y no constituye evidencia externa fresca; no hay puntuación oficial de la submission 5.
- El paquete no incluye reacciones crudas, predicciones, credenciales privadas, código de entrenamiento ni entorno, lo que limita la reproducibilidad del entrenamiento.
- No incluye pesos en safetensors ni GGUF; el artefacto es un índice y etiquetas alineadas, por lo que no es reutilizable como modelo genérico.
- Dependencia de vocabulario externo: las ECs permitidas provienen de SIB ExPASy ENZYME release 02-Sep-2026 (CC BY 4.0), con obligación de atribución.
- Atribución DRFP bajo MIT requerida (`DRFP_LICENSE.txt`).
- Licencia MIT del paquete, pero el autor no documenta evaluación de sesgos ni de robustez fuera del split local.
- Riesgo de error en reacciones poco representadas en el índice de 63.280 filas; la votación entre vecinos puede propagar etiquetas erróneas.
- No apto para generación de texto, razonamiento general ni tareas fuera de la predicción de EC.

## Enlaces

- Hugging Face: https://huggingface.co/da24b046/leak-curber-enzyme-submission-5
- Vocabulario ENZYME (SIB ExPASy, release 02-Sep-2026, CC BY 4.0): https://enzyme.expasy.org/
- Repositorio RXNFP (revisión citada `6fd48f4927c2178555cc5d71dbfb225fb178f43c`): no se proporciona URL directa en la información disponible.
- Paper o blog del paquete: no disponible.
- Demo: no disponible.
