# da24b046/leak-curber-submission-12

## Resumen

El modelo `da24b046/leak-curber-submission-12` es un artefacto de predicción orientado a la anotación automática de números EC (Enzyme Commission) a partir de reacciones químicas. Lo publica el usuario `da24b046` en Hugging Face como parte de una serie de envíos (submissions) a lo que parece ser una competición o benchmark interno denominado "leak-curber". No es un modelo de lenguaje generativo al uso, sino un sistema de clasificación/ensemble con componentes neuronales congelados, índices de recuperación aprendidos y un combinador de pesos condicionado por confianza.

La model card describe la submission 12 como un "measured ensemble" que integra cuatro expertos S9 propios congelados, índices de recuperación aprendidos y componentes compartidos de S8, mientras que los backbones neuronales sin cambios de S10 no se cuentan como expertos independientes nuevos. El sistema se ejecuta en un contenedor Docker Linux amd64 offline con 2 CPU y 16 GiB de RAM, en un límite de 900 segundos incluyendo la carga del evaluador, sin GPU ni PyTorch en inferencia.

La relevancia de esta ficha es limitada: se trata de un artefacto de competición con licencia no declarada, sin benchmarks publicados, sin idiomas soportados y sin pipeline definido. Es útil únicamente como referencia técnica para quienes sigan la serie "leak-curber" o quieran reproducir el enfoque de ensemble con combinador condicionado por confianza aplicado a la clasificación EC.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de expertos congelados (S9) + índices de recuperación aprendidos + combinador softmax condicionado por confianza; backbones neuronales congelados de S10 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `weights/model.json` (receta/provenance); no se especifica safetensors ni GGUF |

## Arquitectura y entrenamiento

El sistema es un ensemble que combina cuatro expertos S9 propios congelados ("own frozen S9 experts") con índices de recuperación aprendidos ("learned retrieval indexes"), reutilizando componentes de S8. Los backbones neuronales de S10 se mantienen sin cambios y, según la model card, no se contabilizan como nuevos expertos independientes. El combinador utiliza pesos softmax condicionados por confianza con regularización, con hiperparámetros `{"regularization": 0.01, "alpha": 0.1, "strength": 0.5, "method": "gate"}`.

El entrenamiento del combinador se realiza mediante cinco "combiner folds" sobre predicciones de desarrollo originales, y después se reajusta sobre las 63.28 filas de desarrollo aleatorio ("all6328 random-development rows"). Los codificadores de split congelados excluyen el propio desarrollo y test. La model card aclara explícitamente que se trata de folds del combinador, no de cinco folds con backbones reentrenados por separado, y que los folds químicos mantienen los clústeres juntos. La submission 11 comparó pooling lineal, logarítmico y de rango recíproco, así como ajustes de recuperación; la S12 adopta el combinador regularizado. No se especifica el número de tokens de entrenamiento ni la composición del dataset más allá de la mención a 63.28 filas de desarrollo y a los splits 50.624/6.328/6.328 (train/development/test, seed 2202) referidos en la submission 4.

## Capacidades

- Predicción de números EC (Enzyme Commission) completos y válidos a partir de reacciones químicas.
- Salida en formato JSONL con exactamente los campos `id` y `prediction`.
- Agrupación exacta de reacciones crudas preservando el primer ID.
- Ejecución offline en contenedor Docker Linux amd64 con 2 CPU y 16 GiB de RAM, sin GPU ni PyTorch.
- Interfaz CLI: `python /app/predict.py --input INPUT --output OUTPUT`.
- No se documentan capacidades de generación de texto, razonamiento general, código, matemáticas, visión, tool calling, agentes ni multilingüismo.

## Casos de uso

- Anotación automática de números EC en pipelines de bioinformática: el sistema recibe reacciones químicas y devuelve una EC válida por reacción en JSONL, integrándose en flujos de curado de bases de datos enzimáticas.
- Evaluación de competiciones tipo "leak-curber": sirve como submission de referencia reproducible en un entorno Docker offline con límite de 900 segundos.
- Reproducción de ensembles con combinador condicionado por confianza: el `weights/model.json` documenta la receta y procedencia para replicar el enfoque sobre otros conjuntos de reacciones.
- Clasificación EC en entornos sin GPU: al no requerir PyTorch ni GPU, puede desplegarse en servidores modestos de 2 CPU y 16 GiB.
- Procesamiento por lotes de reacciones en formato JSONL: la agrupación exacta de reacciones crudas y la preservación del primer ID facilitan la concatenación de resultados con los datos de entrada.
- Estudio de técnicas de retrieval aprendido aplicadas a química: los índices de recuperación aprendidos y la comparación de pooling de la S11 sirven como material de análisis metodológico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente "No official score claimed" y advierte que la selección en desarrollo es optimista y que los diagnósticos no son independientes.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; la inferencia es exclusivamente CPU.
- GPU recomendadas: ninguna; la model card indica "No inference internet, GPU or PyTorch".
- Cabe en consumer GPU: no aplica (no usa GPU).
- CPU y memoria: 2 CPU y 16 GiB de RAM en contenedor Docker Linux amd64.
- Tiempo de ejecución: límite de 900 segundos incluyendo el pull y carga del evaluador.
- Opciones de despliegue: Docker Linux amd64 offline con `python /app/predict.py --input INPUT --output OUTPUT`; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles más allá del límite global de 900 segundos.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (predicción de números EC mediante ensemble con retrieval) con parámetros, contexto, rendimiento, licencia y disponibilidad documentados.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican restricciones ni permisos para uso comercial.
- Sin benchmarks oficiales ni score reclamado por el autor; el rendimiento real es desconocido.
- La selección en desarrollo es optimista y los diagnósticos no son independientes, según la propia model card.
- Todos los datos públicos tienen exposición histórica ("historical exposure"), lo que puede inflar métricas por fuga de información.
- Los folds del combinador no equivalen a folds con backbones reentrenados; la validación es menos robusta de lo que podría sugerir la cifra de cinco folds.
- El paquete no incluye credenciales, datos crudos, salidas de evaluación ni archivos de estudio, lo que limita la auditoría externa.
- Solo produce una EC válida por reacción y en formato JSONL estricto; no es un modelo de propósito general.
- No se documentan sesgos, cobertura idiomática ni comportamiento fuera del dominio de reacciones enzimáticas.

## Enlaces

- Hugging Face: https://huggingface.co/da24b046/leak-curber-submission-12
- Perfil del autor en Hugging Face: https://huggingface.co/da24b046
- Submission 4 relacionada: https://huggingface.co/da24b046/leak-curber-enzyme-submission-4
- GitHub del autor: https://github.com/da24b046
