# da24b046/leak-curber-submission-13

## Resumen

`da24b046/leak-curber-submission-13` es un artefacto de inferencia publicado en Hugging Face por el usuario `da24b046`, orientado a la predicción de anotaciones EC (Enzyme Commission) a partir de reacciones químicas. No se trata de un modelo de lenguaje generativo ni de un transformer de propósito general: el repositorio contiene un ensemble de cuatro expertos neuronales congelados, junto con sus índices de recuperación asociados, reutilizados de las entregas S9 y S11 del mismo autor. El autor declara explícitamente que no hay entrenamiento nuevo de backbone ni validación cruzada de cinco pliegues en esta entrega.

El sistema combina probabilidades neuronales con recuperación de vecinos por similitud coseno y una corrección de masa L3 sobre componentes completos, con el objetivo de devolver exactamente una anotación EC completamente especificada por consulta. La receta exacta de pesos y parámetros de mezcla está documentada en la model card. El artefacto se empaqueta como imagen Docker para ejecución offline en CPU, con restricciones estrictas de tiempo (900 segundos para pull más inferencia), memoria (16 GiB) y tamaño de paquete (menos de 4 GiB).

La relevancia de esta ficha es limitada desde el punto de vista de modelos fundacionales: se trata de una submission de competición con exposición histórica a los datos de desarrollo, sin resultados oficiales publicados y sin licencia declarada. El propio autor advierte que todas las pruebas locales son diagnósticas y no independientes. El repositorio ocupa 0,9 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de cuatro expertos neuronales congelados con recuperación por vecinos (k=5) y pooling ponderado de potencias |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada por reacción química individual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (tarea de química computacional, no NLP) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de 0,9 GB; empaquetado como imagen Docker linux/amd64) |

## Arquitectura y entrenamiento

La arquitectura es un ensemble heterogéneo de cuatro expertos neuronales congelados, cada uno con su propio índice de recuperación. La combinación se realiza mediante una media ponderada de potencias con pesos `[0.25, 0.25, 0.125, 0.375]`, potencia 0.25, nitidez 0.85, alpha 0.05, k=5, temperatura 0.02 y beta 0.15. Las probabilidades neuronales se truncan a un mínimo de 1e-8 antes del pooling; una potencia de cero equivale a pooling geométrico. El flujo incluye normalización, aplicación de nitidez y nueva normalización. La variante S14, opcional, ajusta los pesos de los expertos según la probabilidad neuronal máxima por experto, mezcla un ensemble aritmético y acota el peso de recuperación por consulta al intervalo [0.02, 0.30].

En la fase de recuperación se obtienen k vecinos por experto con softmax coseno y temperatura, y cada voto se distribuye equitativamente entre las anotaciones EC distintas registradas para ese vecino. Posteriormente se mezclan las probabilidades neuronales y de recuperación y se aplica una corrección de masa L3 sobre componentes completos. No se realiza canonicalización de reacciones para el agrupamiento. El autor indica que la selección se hizo usando conjuntos de desarrollo aleatorio y químico preservados con semilla 3410, con cinco grupos de desarrollo para resumir estabilidad, sin combinador aprendido ni validación cruzada anidada. Los checkpoints originales del backbone usaron etiquetas de desarrollo completas históricamente, por lo que existe exposición previa a los datos de evaluación local.

## Capacidades

- Predicción de anotaciones EC (Enzyme Commission) a partir de reacciones químicas, devolviendo exactamente una anotación EC completamente especificada por consulta.
- Ensemble de cuatro expertos neuronales con recuperación de vecinos por similitud coseno.
- Mezcla ponderada de probabilidades neuronales y de recuperación con corrección de masa L3.
- Ejecución offline en CPU, sin GPU ni PyTorch, dentro de una imagen Docker linux/amd64.
- Entrada y salida en formato JSONL con claves exactas `id` y `prediction`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües en el sentido de NLP.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Anotación automatizada de enzimas en pipelines de bioinformática: el sistema recibe reacciones químicas en JSONL y devuelve una predicción EC por identificador, adecuado para prellenar anotaciones que luego revisa un curador humano.
- Participación en competiciones de predicción de funciones enzimáticas: el artefacto está empaquetado como imagen Docker con restricciones de tiempo y memoria compatibles con evaluadores automatizados (900 segundos, 2 CPU, 16 GiB, sin red).
- Prototipado de clasificadores EC en entornos sin GPU: la inferencia corre en CPU pura sin Torch, lo que permite desplegarlo en infraestructura modesta.
- Generación de candidatos para revisión experta: la salida de una única EC completamente especificada reduce la ambigüedad en la revisión manual frente a salidas con múltiples etiquetas parciales.
- Reproducción de experimentos de ensemble con recuperación: la receta exacta de pesos y parámetros permite replicar el comportamiento del sistema en estudios comparativos.
- Integración en flujos de anotación por lotes: el formato JSONL de entrada y salida facilita el procesamiento por lotes de conjuntos de reacciones.
- Evaluación de técnicas de pooling de potencias y corrección de masa en problemas de clasificación multietiqueta jerárquica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que el resultado oficial es desconocido, que la preparación es local y que no hay publicación por parte del agente. Las comparaciones medidas se remiten a los archivos `submission_13.md` y `selfstudy_13.md` del proyecto raíz, no incluidos en la información proporcionada.

## Requisitos de hardware

- CPU: la imagen está pensada para ejecutarse con 2 CPU y 16 GiB de RAM, sin red (`network none`).
- GPU: no se requiere ni se soporta; el autor indica explícitamente "no internet/GPU/Torch".
- VRAM estimada: no aplica (inferencia en CPU).
- GPU recomendadas: ninguna; el despliegue es exclusivamente CPU.
- Cabe en cualquier máquina con 16 GiB de RAM y suficiente espacio en disco para una imagen de menos de 4 GiB.
- Opciones de despliegue: Docker (`docker build --platform linux/amd64 -t enzyme-13 .`) y ejecución con `python /app/predict.py --input INPUT --output OUTPUT`.
- Latencia y throughput: no disponibles; el autor señala que el pull en frío del evaluador no se ha medido localmente y que pull más carga e inferencia deben caber en 900 segundos.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (predicción de anotaciones EC mediante ensemble con recuperación) con parámetros, contexto o rendimiento verificables. El propio autor referencia entregas anteriores del mismo proyecto (`leak-curber-enzyme-submission-4`, con split 50.624/6.328/6.328 y semilla 2202), pero no se aportan métricas comparativas.

## Limitaciones y advertencias

- Exposición histórica a datos: los checkpoints originales del backbone usaron etiquetas de desarrollo completas, y todas las pruebas locales tienen exposición histórica; son diagnósticas, no independientes.
- Sin resultados oficiales: el autor declara que el resultado oficial es desconocido y que no hay publicación por parte del agente.
- Licencia no declarada: no se especifica licencia, por lo que el uso comercial queda sin marco legal explícito.
- Sin datos de sesgo, alucinación o cobertura idiomática: al no ser un modelo de lenguaje, estas categorías no aplican directamente, pero tampoco se documenta el comportamiento del clasificador ante reacciones fuera de distribución.
- Restricciones de empaquetado: paquete menor de 4 GiB, salida menor de 16 MiB, sin internet, GPU ni Torch; el pull en frío no está medido y podría comprometer el límite de 900 segundos.
- Sin canonicalización de reacciones para agrupamiento, lo que puede afectar a la agrupación de reacciones equivalentes.
- Sin validación cruzada anidada ni combinador aprendido: la estabilidad se resume con cinco grupos de desarrollo, lo que limita la robustez estadística de las conclusiones.
- El repositorio no contiene datos públicos en bruto, salidas de evaluación, credenciales ni archivos de estudio, según el autor.

## Enlaces

- Hugging Face: https://huggingface.co/da24b046/leak-curber-submission-13
- Entrega previa relacionada: https://huggingface.co/da24b046/leak-curber-enzyme-submission-4
- Perfil del autor en GitHub: https://github.com/da24b046
