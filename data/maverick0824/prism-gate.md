# Maverick0824/prism-gate

## Resumen

PRism gate es un clasificador binario derivado de `microsoft/codebert-base` que predice si un hunk de diff necesita un comentario de revisión. Lo desarrolla Maverick0824 como componente del proyecto PRism, un sistema de revisión de código asistida por modelos. Su función es actuar como filtro previo (gate) delante del modelo revisor: descarta los hunks que probablemente no recibirían comentario y deja pasar solo los relevantes, de modo que el tiempo de revisión (y el coste de inferencia del modelo grande) se concentre en los cambios que importan.

El modelo es un transformer encoder de CodeBERT con cabeza de clasificación binaria, exportado a ONNX en fp32 (opset 17, 498,8 MB) para ejecutarse en CPU con onnxruntime en milisegundos. Acepta un único hunk normalizado, truncado a 512 tokens por la izquierda. Se entrenó sobre los datos de estimación de calidad de CodeReviewer (Zenodo 6900648, CC BY 4.0) con 92.664 hunks de entrenamiento y 31.252 de validación y test.

Su relevancia es práctica: demuestra que un clasificador pequeño y barato puede reducir aproximadamente un 26% de los hunks que llegan a un revisor manteniendo un recall del 90% sobre los que sí reciben comentario, con una licencia MIT que permite uso comercial sin fricción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-style), base `microsoft/codebert-base` con cabeza de clasificación binaria |
| Parametros totales | no disponible (CodeBERT base tiene ~125M, dato no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (`max_length`), truncamiento por la izquierda |
| Tipos de cuantizacion | no disponible; el artefacto publicado es ONNX fp32 |
| Idiomas soportados | no disponibles (entrenado sobre hunks de C, C++, C#, Go, Java, JS, PHP, Python y Ruby) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17, fp32) para onnxruntime; tokenizer en `tokenizer.json` y `tokenizer_config.json` |
| Tamano del repositorio | 0,5 GB |
| Tarea | Clasificación de texto binaria (¿necesita comentario de revisión?) |
| Umbral de decisión | 0,1953 (elegido en validación) |

## Arquitectura y entrenamiento

Se parte de CodeBERT base, un encoder transformer preentrenado sobre código y lenguaje natural, al que se añade una cabeza de clasificación binaria. La entrada es un hunk de diff tras `normalize_hunk`, truncado a 512 tokens conservando el final del hunk. El entrenamiento se realizó en 2 GPU Tesla T4 (Kaggle) durante 280 minutos, con batch efectivo de 64 (16 por GPU × 2 GPU × 2 de acumulación), learning rate 2e-5, weight decay 0,01, warmup del 6%, 3 épocas y 4.344 pasos, semilla 13. Se aplicó early stopping sobre PR-AUC de validación cada 750 pasos con paciencia de 3 evaluaciones, que no llegó a dispararse. El mejor PR-AUC de validación fue 0,811 en el paso 3.000 (época 2,07); tras la época 2 no hubo ganancia.

Los datos provienen de la estimación de calidad de CodeReviewer (Zenodo 6900648, CC BY 4.0). Se usó una muestra con semilla de 100.000 filas de las 265.836 disponibles, menos 7.336 hunks de más de 100 líneas: 92.664 de entrenamiento, 31.252 de validación y 31.252 de test, con proporción de positivos de 0,461 en train y 0,5 en validación y test. El umbral 0,1953 se eligió en validación como el corte de mayor precisión con recall mínimo de 0,90. La exportación a ONNX se validó comparando logits contra PyTorch en 32 filas de validación, con una diferencia absoluta máxima de 2,3e-06 (límite 1e-3). No se documenta uso de RLHF ni DPO.

## Capacidades

- Clasificación binaria de hunks de diff: predice si un cambio necesita comentario de revisión.
- Filtrado previo (gating) de hunks antes de un modelo revisor más costoso.
- Procesamiento de parches en C, C++, C#, Go, Java, JavaScript, PHP, Python y Ruby.
- Ejecución en CPU mediante onnxruntime, en proceso, sin GPU.
- Entrada de hasta 512 tokens por hunk, con truncamiento por la izquierda.
- Salida de score continuo más decisión con umbral configurable (`gate_config.json`).
- No soporta tool calling, agentes, generación de texto, visión ni audio: es exclusivamente un clasificador.

## Casos de uso

- Filtrado en pipelines de revisión de código: colocado delante del modelo revisor de PRism (`PRISM_GATE=onnx`), descarta los hunks con score por debajo de 0,1953, de modo que el revisor solo procesa los que probablemente reciben comentario. En test elimina el 26,5% de los hunks conservando el 90,1% de los que sí lo recibieron.
- Reducción de coste de inferencia en CI/CD: al ejecutarse en CPU a 1,4 hunks por segundo, permite prefiltrar en el runner sin consumir GPU antes de invocar un modelo grande.
- Priorización de revisiones en repos con alto volumen de PRs: los hunks que pasan el gate se ordenan por score y se asignan primero a los revisores humanos o al modelo revisor.
- Señal auxiliar de calidad en herramientas de análisis estático: el score puede registrarse junto a los hallazgos del linter para identificar zonas del diff con mayor probabilidad de discusión.
- Investigación sobre estimación de calidad de revisiones: sirve como baseline reproducible (semilla 13, métricas y umbral publicados) para comparar clasificadores de necesidad de comentario.
- Despliegue en entornos sin GPU o con restricciones de privacidad: al ser ONNX fp32 y ejecutarse en proceso, puede correr en máquinas de desarrollo o servidores modestos sin enviar código a servicios externos.
- Preetiquetado de datasets de revisión: uso del score para muestrear hunks candidatos a anotación humana en la construcción de nuevos conjuntos.

## Benchmarks y rendimiento

Métricas publicadas en la model card sobre validación y test (umbral 0,1953):

| Split | Hunks | PR-AUC | Precision | Recall | F1 | Share filtered |
|---|---|---|---|---|---|---|
| Validación | 31.252 | 0,811 | 0,610 | 0,900 | 0,727 | 0,263 |
| Test | 31.252 | 0,806 | 0,613 | 0,901 | 0,729 | 0,265 |

Evolución durante el entrenamiento (validación):

| Paso | Época | PR-AUC | F1 a 0,5 | Loss |
|---|---|---|---|---|
| 750 | 0,52 | 0,786 | 0,689 | 1,163 |
| 1.500 | 1,04 | 0,795 | 0,688 | 1,155 |
| 2.250 | 1,55 | 0,809 | 0,700 | 1,107 |
| 3.000 | 2,07 | 0,811 | 0,715 | 1,115 |
| 3.750 | 2,59 | 0,808 | 0,702 | 1,142 |
| 4.344 | 3,00 | 0,810 | 0,704 | 1,138 |

Desglose por longitud de hunk (3.000 hunks de test, semilla 0, mismo umbral):

| Longitud (líneas) | Hunks | Recall | Share filtered |
|---|---|---|---|
| 1 a 10 | 1.212 | 0,812 | 0,433 |
| 11 a 25 | 1.276 | 0,925 | 0,195 |
| 26 a 50 | 442 | 0,997 | 0,034 |
| 51 o más | 70 | 1,000 | 0,000 |

Desglose por lenguaje (misma muestra):

| Lenguaje | Hunks | Recall | Share filtered |
|---|---|---|---|
| c | 166 | 0,812 | 0,349 |
| cpp | 282 | 0,879 | 0,397 |
| cs | 190 | 0,990 | 0,116 |
| go | 914 | 0,857 | 0,327 |
| java | 450 | 0,919 | 0,289 |
| js | 276 | 0,937 | 0,152 |
| php | 118 | 0,892 | 0,169 |
| py | 397 | 0,922 | 0,249 |
| rb | 207 | 0,994 | 0,034 |

Referencia de control: contar líneas por sí solo separa las etiquetas con un AUC de aproximadamente 0,64 en test, según `docs/datasets.md`.

## Requisitos de hardware

- Inferencia en CPU: 1,4 hunks por segundo con onnxruntime por defecto, batches de 16, en un Core Ultra 7 155H.
- VRAM: no requiere GPU; el artefacto ONNX fp32 ocupa 498,8 MB en memoria.
- GPU recomendadas: no aplica; el modelo está pensado para CPU. Cualquier GPU compatible con onnxruntime podría usarse, pero no se documenta rendimiento.
- Cabe en cualquier máquina con al menos ~0,5 GB de RAM libre para los pesos, más la memoria del runtime.
- Despliegue: onnxruntime en proceso (integración nativa en PRism con `PRISM_GATE=onnx` y carpeta por defecto `models/gate`). No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este artefacto ONNX de clasificación.
- Latencia: batches no agrupados por longitud, por lo que la mayoría se rellena hasta el hunk más largo; el autor advierte que puede ser lento en PRs grandes.

## Comparativa con modelos similares

| Modelo | Base | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PRism gate | CodeBERT base | Clasificación binaria de necesidad de comentario en hunks | 512 tokens | MIT | ONNX en Hugging Face |
| CodeReviewer (modelo de estimación de calidad) | Modelo propio de Microsoft | Estimación de calidad de revisión | no disponible | no disponible | Paper y datos en Zenodo (CC BY 4.0) |
| CodeBERT base | RoBERTa adaptado a código | Representaciones y clasificación genérica de código | 512 tokens | MIT (según el repo de Microsoft) | Hugging Face |
| Clasificador heurístico por longitud de hunk | no aplica | Filtrado por número de líneas | no aplica | no aplica | interno |

No se dispone de resultados de benchmarks comparativos directos entre PRism gate y CodeReviewer u otros clasificadores de la misma tarea en la información proporcionada.

## Limitaciones y advertencias

- Casi todo el filtrado recae en hunks cortos: los de 26 líneas o más pasan casi siempre, y en los de 10 líneas o menos el recall baja a 0,81 con un 43% filtrado. La longitud sigue haciendo gran parte del trabajo.
- Diferencias por lenguaje: C, Go y C++ pierden más (recall 0,81 a 0,88); Ruby y C# pasan casi todo y el gate ahorra poco. Los grupos por lenguaje son pequeños (118 a 914 hunks), por lo que variaciones de pocos puntos son ruido.
- Las etiquetas reflejan dónde comentaron revisores humanos, no dónde hay bugs; el modelo aprende el comportamiento de revisión, no la presencia de defectos.
- Los hunks de más de 512 tokens pierden el inicio; aproximadamente el 10% de los hunks de test superan esa longitud.
- Los hunks de entrenamiento son más largos que los de validación y test incluso tras el límite de 100 líneas, de modo que la longitud es una señal más fuerte en entrenamiento que en uso real.
- Las métricas publicadas son sobre datos 50/50; en PRs reales, donde la mayoría de hunks no recibe comentario, se espera mayor proporción filtrada y menor precisión. El autor remite a BugBench para medirlo en PRs reales.
- Riesgo de falsos negativos: con recall ~0,90, aproximadamente uno de cada diez hunks que merecían comentario se descarta antes del revisor.
- Licencia MIT: permite uso comercial, pero el modelo base CodeBERT y los datos de CodeReviewer (CC BY 4.0) imponen sus propias condiciones de atribución que conviene verificar.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay validación externa independiente de las métricas declaradas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Maverick0824/prism-gate
- Repositorio PRism: https://github.com/ManvGit17/prism
- Modelo base CodeBERT: https://huggingface.co/microsoft/codebert-base
- Datos de estimación de calidad de CodeReviewer (Zenodo): https://zenodo.org/records/6900648
