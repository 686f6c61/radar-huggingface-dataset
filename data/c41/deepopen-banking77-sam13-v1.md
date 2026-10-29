# c41/deepopen-banking77-sam13-v1

## Resumen

`c41/deepopen-banking77-sam13-v1` es un clasificador de texto de 77 clases especializado en intenciones bancarias, construido sobre BANKING77. Lo publica el usuario c41 como artefacto de investigación: no es un modelo de propósito general, sino un checkpoint afinado para la tarea de clasificación de intenciones de PolyAI/banking77, con una exactitud en test congelado declarada por el autor del 94,1234 % (2899/3080).

El modelo parte del checkpoint histórico de entrenamiento completo de `convaiinnovations/laya` (revisión `1c5edc17…`, Apache-2.0) y continúa el entrenamiento con sharpness-aware minimization (SAM), semilla 13, durante dos épocas fijas (626 actualizaciones) sobre las 10 003 filas oficiales de entrenamiento. El repositorio está etiquetado como `modernbert`, con 395 910 221 parámetros en formato safetensors y un tamaño de repo de 1,6 GB.

Su relevancia es metodológica más que de producto: el autor documenta explícitamente que el checkpoint publicado se seleccionó *después* de observar tres resultados retrospectivos de test, que las tres semillas SAM (13/42/87) quedan en 2899/2896/2894 aciertos sobre 3080 y que los intervalos de confianza emparejados incluyen el cero, por lo que no se establece una mejora significativa. Es, por tanto, un ejemplo de publicación con trazabilidad y reproducibilidad verificable (SHA256, predicciones congeladas, script de verificación) más que un modelo listo para producción sin auditoría previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (etiqueta `modernbert` en el repositorio), inicializado desde `convaiinnovations/laya` |
| Parametros totales | 395 910 221 (~396 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128 tokens como maximo en entrenamiento y evaluacion; no se declara una ventana superior |
| Tipos de cuantizacion | No disponible: solo se publican pesos safetensors, sin variantes GGUF, ONNX ni cuantizadas |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 (modelo); dataset BANKING77 bajo CC-BY-4.0 |
| Formato de pesos | safetensors (repo de 1,6 GB, incluye codigo Python y ficheros de configuracion propios) |

Otros datos: pipeline `text-classification`, 17 descargas, 220 likes, creado y actualizado el 2026-10-21. SHA256 del peso congelado SAM13: `0ff739f4413497119476af928b6cff482f1c0ef0cfe9bfb96527b769df172d29`.

## Arquitectura y entrenamiento

Se trata de un clasificador de 77 clases sobre un encoder transformer etiquetado como ModernBERT, inicializado desde el checkpoint `convaiinnovations/laya`. La cabeza de clasificación se entrena con una tasa de aprendizaje distinta a la del encoder: 2e-5 para la cabeza y 2e-6 para el encoder. El ajuste se hace con sharpness-aware minimization (SAM), `rho` 0.05, weight decay 0.01, batch 32, longitud máxima 128 y precisión BF16, durante dos épocas fijas que equivalen a 626 actualizaciones sobre las 10 003 filas oficiales de entrenamiento de BANKING77 (revisión `18072d2685ea682290f7b8924d94c62acc19c0b2`).

La evaluación se realiza con atención SDPA en modo eager y FP32, batch 32 y longitud máxima 128. El autor advierte de una deriva de reproducción no resuelta: el resultado histórico del 94,0909 % no se reproduce exactamente con el entorno actual (93,9935 % en eager FP32), y el peso histórico no es el peso SAM13 publicado. Además, el antiguo subconjunto de desarrollo se incluyó en el entrenamiento, por lo que no debe tratarse como conjunto retenido. No se documentan en la información disponible ni RLHF, ni DPO, ni decodificación especulativa; es un modelo discriminativo, no generativo.

## Capacidades

- Clasificación de texto en 77 clases cerradas de intenciones bancarias (BANKING77).
- Asignación de una única etiqueta por utterance de hasta 128 tokens.
- Salida de probabilidades por clase mediante el script `infer_banking.py`.
- Inferencia por línea de comandos: `python infer_banking.py --checkpoint . --text "what is my bank balance"`.
- Verificación de release y reproducibilidad: `verify_release.py` compara las predicciones congeladas contra las etiquetas oro del test oficial y exige cero diferencias.
- Conjunto de evaluación publicado: `evaluation/predictions.csv` (predicciones congeladas sin redistribuir utterances) y `evaluation/classes.csv` (estadísticas por clase).
- Integridad verificable mediante `SHA256SUMS.json`.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking: es un clasificador, no un modelo generativo.
- No ofrece rechazo fuera de dominio (OOS) calibrado: el autor indica explícitamente que las probabilidades no están calibradas para esa función.

## Casos de uso

- Enrutamiento de consultas en atención al cliente bancaria: el clasificador asigna cada mensaje entrante a una de las 77 intenciones, lo que permite dirigirlo al equipo o al flujo de autoservicio correspondiente sin intervención humana en el primer salto.
- Etiquetado automático de tickets y correos: procesar lotes con batch 32 y longitud 128 para poblar un sistema de ticketing con categorías consistentes y reducir el etiquetado manual en auditorías históricas.
- Preprocesado NLU en asistentes conversacionales: usar la etiqueta como señal de intención antes de invocar un diálogo específico o una consulta a backend, manteniendo el modelo como componente de un pipeline mayor.
- Análisis de motivos de contacto en transcripciones: clasificar turnos de cliente ya transcritos para construir informes de volumen por tipo de consulta y detectar picos de intenciones concretas.
- Investigación y reproducción de experimentos: el repositorio incluye predicciones congeladas, sumas SHA256 y un verificador, lo que lo hace utilizable como caso de estudio de SAM, selección retrospectiva de checkpoints y evaluación honesta en clasificación de intenciones.
- Segmentación de opiniones y feedback bancario: clasificar encuestas o reseñas en las 77 categorías para agregar métricas por temática, siempre que el texto esté en inglés y se acepte la limitación de vocabulario de BANKING77.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Exactitud en test congelado, SAM semilla 13 (checkpoint publicado) | 94,1234 % (2899/3080) |
| SAM semilla 42 | 2896/3080 |
| SAM semilla 87 | 2894/3080 |
| Media de las semillas 13/42/87 | 94,0368 % (dato del autor) |
| Referencia historica declarada | 94,0909 % |
| Reproduccion actual del historico (eager FP32) | 93,9935 % |

El autor indica que los intervalos de confianza emparejados entre semillas incluyen el cero y que no se establece una ganancia significativa. No se publican en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generales, y no procede compararlos con modelos generativos.

## Requisitos de hardware

- Pesos en FP32: aproximadamente 1,58 GB (395,9 M de parámetros × 4 bytes), coherente con el repo de 1,6 GB.
- Pesos en BF16/FP16: aproximadamente 0,79 GB; la evaluación oficial se hace en FP32 eager, no en BF16.
- Pesos en INT8/INT4: alrededor de 0,40 GB y 0,20 GB respectivamente, como estimación aritmética; no hay variantes cuantizadas publicadas ni validadas por el autor.
- GPU: el autor exige un entorno NVIDIA CUDA compatible para el ensemble CLINC y la verificación completa del test; con 396 M de parámetros, cualquier GPU consumer con 4 GB o más de VRAM puede alojar los pesos, aunque no se publican cifras de latencia ni throughput.
- Despliegue: no se soportan pipelines genéricos de Transformers para las releases CLINC personalizadas. Es necesario descargar el repositorio completo, usar Python 3.12, instalar `requirements.txt` y ejecutar los scripts propios (`infer_banking.py`, `verify_release.py`). No hay soporte documentado para vLLM, TGI, llama.cpp, Ollama ni ONNX.
- Latencia y throughput: no disponibles. Los únicos parámetros de ejecución conocidos son batch 32 y longitud máxima 128 en evaluación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `c41/deepopen-banking77-sam13-v1` | 395,9 M | 128 tokens | 94,1234 % en test BANKING77 (seleccion retrospectiva) | Apache-2.0 | HuggingFace, repo completo con codigo |
| `convaiinnovations/laya` (modelo base) | No disponible | No disponible | No disponible en la informacion proporcionada | Apache-2.0 | HuggingFace |
| Otros clasificadores sobre BANKING77 | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han proporcionado resultados de benchmarks de alternativas comparables, por lo que no es posible establecer una comparación cuantitativa honesta con otros clasificadores de intenciones bancarias.

## Limitaciones y advertencias

- Selección retrospectiva: el checkpoint se eligió después de observar tres resultados de test; el autor lo declara explícitamente y no lo presenta como validación independiente.
- Sin mejora significativa demostrada: los intervalos de confianza emparejados incluyen el cero y la media de semillas (94,0368 %) queda por debajo de la referencia histórica (94,0909 %).
- Fuga del subconjunto de desarrollo: el antiguo split de desarrollo se incluyó en el entrenamiento y no debe tratarse como conjunto retenido.
- Deriva de reproducción sin resolver: el resultado histórico no se reproduce exactamente en el entorno actual (93,9935 % frente a 94,0909 %).
- Idioma único: solo inglés; cualquier texto en castellano u otros idiomas queda fuera del dominio entrenado.
- Dominio cerrado de 77 clases: el modelo siempre asigna una de las 77 etiquetas y no dispone de rechazo OOS calibrado, por lo que las probabilidades no deben usarse como umbral de confianza sin calibración externa.
- Longitud limitada: 128 tokens máximos, insuficiente para conversaciones multi-turno o documentos largos sin troceado previo.
- Integración restringida: no funciona con pipelines genéricos de Transformers; requiere el repositorio completo y los scripts propios.
- Licencia: el modelo es Apache-2.0, pero el dataset BANKING77 es CC-BY-4.0 y exige atribución; deben conservarse los ficheros de licencia y atribución del modelo base `convaiinnovations/laya`.
- Baja adopción observada: 17 descargas, lo que limita la evidencia comunitaria sobre su comportamiento en producción.
- Sin datos de sesgo, robustez frente a texto adversario ni evaluación fuera de BANKING77.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/c41/deepopen-banking77-sam13-v1
- Espacio de exploración de la evaluación: https://huggingface.co/spaces/c41/laya-evaluation
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya
- Dataset BANKING77 (revisión indicada en la model card): https://huggingface.co/datasets/PolyAI/banking77
