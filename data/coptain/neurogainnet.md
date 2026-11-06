# CopTain/neuroGainnet

## Resumen

`CopTain/neuroGainnet` (GainNet) no es un modelo de lenguaje generativo, sino un conjunto de pesos neuronales ligeros estimados a partir de datos de resonancia magnetica funcional (fMRI) que predicen el peso ("gain") que el cerebro asigna a cada frase al describir una escena visual breve. Lo desarrolla el usuario CopTain, vinculado al repositorio de codigo github.com/JumptierFive/neuroGainnet, y se apoya en el dataset publico OpenNeuro ds004488 (reconocimiento de acciones humanas, 30 participantes, 21.600 clips de dos segundos).

El modelo resuelve un problema de neurociencia computacional: modelar la respuesta regional del cerebro (90 territorios AAL) como una suma ponderada de embeddings de frase, donde los pesos los produce una red entrenada. Se distribuyen dos arquitecturas: un ensamble completo (2.700 redes, una por participante y region, 106,7 M de parametros en total) y una red compartida simplificada de solo 1.931 parametros. La entrada es el embedding de 384 dimensiones de `sentence-transformers/all-MiniLM-L12-v2` sin normalizar.

Su relevancia es acotada pero especifica: ofrece una herramienta reproducible para investigadores que trabajen en codificacion semantica de la respuesta cerebral, con pesos publicados bajo CC BY 4.0 y una validacion estadistica documentada. No debe confundirse con un LLM: no genera texto ni responde a instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP con activaciones ReLU y salida Sigmoid (ensamble completo: Linear(384,100)->ReLU->Linear(100,10)->ReLU->Linear(10,1)->Sigmoid; red compartida: Linear(384,5)->ReLU->Linear(5,1)->Sigmoid) |
| Parametros totales | 106,7 M en el ensamble completo (2.700 redes de 39.521 parametros); 1.931 en la red compartida |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (procesa una frase por vez sobre embeddings de 384 dimensiones) |
| Tipos de cuantizacion | no disponible (pesos en fp16 en `gainnet_fp16.pt`) |
| Idiomas soportados | no disponible |
| Licencia | CC BY 4.0 para los pesos; terminos de los datos de origen en `DATA.md` |
| Formato de pesos | `.pt` (PyTorch), `.npz` (ganancias), `.csv.gz` (frases), `.json` (regiones) |

## Arquitectura y entrenamiento

La arquitectura es un perceptron multicapa de tres capas en el ensamble completo y de dos capas en la red compartida, con salida sigmoide que produce un escalar en (0,1) por frase. El ensamble contiene una red independiente por cada combinacion (participante, region): 30 participantes x 90 regiones AAL = 2.700 redes. La red compartida se entreno conjuntamente entre participantes y sobre 600 cabezas de region (30 participantes x 20 regiones AAL sorteadas, listadas en `selected_regions.json`).

Los datos de entrenamiento provienen de fMRI: 30 participantes vieron 21.600 clips de dos segundos, cada uno descrito por un modelo vision-lenguaje, generando 66.270 frases. Para cada participante y territorio AAL se ajusto una red que predice la respuesta regional a partir de la suma ponderada de embeddings de frase. Las sesiones 1-10 se usaron para entrenamiento y las 11-12 para validacion, dentro de cada participante. La innovacion tecnica es el mecanismo de ponderacion por gain: los escalares se normalizan para sumar uno dentro de una descripcion y se usan como pesos de mezcla para el pooling de embeddings.

## Capacidades

- Puntuacion de frases: asigna un escalar en (0,1) a cada frase que describe una escena visual breve, representando el peso neural estimado.
- Prediccion de respuesta regional: el ensamble completo estima la respuesta fMRI por participante y region AAL.
- Pooling ponderado: las ganancias normalizadas sirven como pesos de mezcla para agregar embeddings de frase.
- Recuperacion multimodal: mejora la recuperacion de descripciones frente al pooling uniforme (segun la model card).
- No soporta generacion de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingues declaradas.
- No incluye vision, audio ni modo de razonamiento (thinking).

## Casos de uso

- Investigacion en neurociencia del lenguaje: usar las ganancias por region para modelar como el cerebro pondera frases al describir escenas, comparando participantes y territorios AAL.
- Analisis de codificacion semantica: emplear el ensamble para predecir respuestas regionales a partir de descripciones generadas por modelos vision-lenguaje y contrastarlas con datos fMRI reales.
- Recuperacion de descripciones de imagenes: aplicar el pooling ponderado por gain para mejorar el ranking de descripciones frente al pooling uniforme (la model card reporta +2,29 pp en 19.538 descripciones generadas).
- Estudios de especificidad de imagen: usar la correlacion con el residuo de especificidad de imagen (r = 0,26-0,60 en cuatro corpus) como senal auxiliar en analisis de representaciones.
- Reproducibilidad de experimentos: cargar `gains_sentence_region.npz` y `sentences.csv.gz` para replicar analisis sobre las 66.270 frases in-sample sin reentrenar.
- Evaluacion de modelos de lenguaje: medir que frases un modelo de vision-lenguaje genera con mayor peso neural como proxy de relevancia semantica en tareas de descripcion.

## Benchmarks y rendimiento

| Propiedad | Resultado |
|---|---|
| Prediccion held-out, pesos estimados vs pesos fijos | 0,0041 vs 0,0007 (t = 18,9; P = 9,5 x 10^-75); positivo en 93% de regiones y 77% de participantes |
| Emparejamiento permutado frase-respuesta | 0 de 19 permutaciones alcanzaron el valor real; maximo nulo 0,0031 |
| Acuerdo con el residuo de especificidad de imagen | r = 0,26-0,60 en cuatro corpus |
| Recuperacion, ponderacion vs pooling uniforme | +2,29 pp (19.538 descripciones generadas), +1,68 pp (45.619 descripciones COCO), +0,89 pp (19.310 descripciones escritas por humanos) |
| Recuperacion donde el pooling plano no decide | 24,4% vs 4,2% top-1 en el cuartil de casi-aciertos del corpus generado |

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para el ensamble completo en fp16 (106,7 M de parametros); la red compartida ocupa unos pocos kilobytes.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100.
- Cabe en GPU consumer: si, en cualquier tarjeta con al menos 1 GB de VRAM (GTX 1650, RTX 3060, RTX 4090, etc.); tambien funciona en CPU.
- Opciones de despliegue: PyTorch nativo (los pesos son `.pt`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano de las redes, la inferencia por frase es del orden de microsegundos a milisegundos en GPU y de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GainNet (este modelo) | 106,7 M (ensamble) / 1.931 (compartida) | no aplica | Ponderacion de frases para prediccion fMRI | CC BY 4.0 | Hugging Face, 0 descargas |
| all-MiniLM-L12-v2 | ~33 M | 512 tokens | Embeddings de frase | Apache 2.0 | Ampliamente disponible |
| Modelos de codificacion cerebral (p. ej. variantes de encoding models sobre ds004488) | no disponible | no disponible | Prediccion de respuesta fMRI | no disponible | no disponible |

No se dispone de datos publicados de modelos directamente comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a prompts y no debe evaluarse con benchmarks tipo MMLU, HumanEval o GSM8K.
- Depende estrictamente del embedding de `sentence-transformers/all-MiniLM-L12-v2` sin normalizar; usar otro extractor invalida los pesos.
- Entrenado sobre 30 participantes y un unico dataset (OpenNeuro ds004488); la generalizacion a otras poblaciones, idiomas o tareas no esta validada.
- El rendimiento held-out es bajo en terminos absolutos (0,0041), aunque significativamente superior a los pesos fijos; util para investigacion, no para produccion.
- Riesgo de sobreajuste por participante y region: la red compartida mitiga parcialmente este problema pero no sustituye a las cabezas regionales, que no se incluyen en el repositorio.
- La licencia CC BY 4.0 cubre los pesos, pero los terminos de los datos de origen se remiten a `DATA.md`; verificar antes de uso comercial.
- La model card contiene errores tipograficos ("trianed", "conrtibution") y la fecha de creacion del repositorio (2026-11-06) es futura respecto a la informacion habitual, lo que conviene contrastar.
- Los resultados de busqueda web sobre "Coptain" corresponden a una consultora RSE no relacionada; no aportan informacion tecnica sobre el modelo.

## Enlaces

- Hugging Face: https://huggingface.co/CopTain/neuroGainnet
- Codigo: https://github.com/JumptierFive/neuroGainnet
- Dataset de origen: https://doi.org/10.18112/openneuro.ds004488.v2.0.1
- Extractor de embeddings: https://huggingface.co/sentence-transformers/all-MiniLM-L12-v2
- Resultados de busqueda no relacionados (consultora): https://coptain.co/, https://www.noos.global/, https://app.coptain.co/
