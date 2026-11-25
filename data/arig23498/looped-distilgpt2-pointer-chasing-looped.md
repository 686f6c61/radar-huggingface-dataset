# ariG23498/looped-distilgpt2-pointer-chasing-looped

## Resumen

Looped-distilgpt2-pointer-chasing-looped es un ajuste fino de DistilGPT2 sobre una tarea sintetica de "pointer chasing" (seguimiento de punteros), desarrollado por el usuario ariG23498. El modelo se construye sobre la arquitectura GPT-2 destilada de OpenAI, con 81.912.576 parametros unicos, y aplica una modificacion estructural concreta: los bloques intermedios [2, 4) del transformer se ejecutan tres veces por cada forward pass, compartiendo pesos entre iteraciones, mientras que el resto de bloques se ejecuta una sola vez. Esto da lugar a un total de 10 ejecuciones de bloque por paso de inferencia.

El modelo no pretende ser un modelo de proposito general. Se trata de un experimento controlado para estudiar si el "looping" de bloques (reutilizar capas con los mismos pesos varias veces) aporta ventajas en tareas de razonamiento algoritmico de naturaleza iterativa. La tarea consiste en resolver cadenas de punteros de la forma "A>B B>C C>D..." y responder a la pregunta de a que nodo se llega tras un numero determinado de saltos. El entrenamiento usa grafos con caminos de 1 a 3 saltos, mientras que el conjunto de test incluye caminos de 4 a 6 saltos para evaluar la generalizacion.

Es relevante ahora como pieza de investigacion reproducible: el autor publica la receta completa (codigo fuente, historial de entrenamiento, metricas por longitud de camino) y advierte explicitamente de que se trata de una tarea de juguete y de que un unico seed no permite concluir que el looping sea causalmente beneficioso. No hay resultados de benchmarks generales ni soporte multilingue declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2) con bloques intermedios [2, 4) ejecutados 3 veces por forward pass (looped transformer) |
| Parametros totales | 81.912.576 |
| Parametros activos | no disponible (no es MoE; los pesos se comparten entre iteraciones del bucle) |
| Longitud de contexto | no disponible (no se declara en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se mencionan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con custom_code; requiere trust_remote_code=True) |

## Arquitectura y entrenamiento

El modelo parte de DistilGPT2, un transformer decoder-only de 6 capas con atencion causal estandar. La modificacion consiste en un bucle de inferencia explicito en PyTorch: los bloques 2 y 3 (rango [2, 4)) se ejecutan tres veces, compartiendo los mismos pesos entre iteraciones, mientras que los bloques 0, 1, 4 y 5 se ejecutan una sola vez. El resultado son 10 ejecuciones de bloque por forward pass en lugar de las 6 de un DistilGPT2 estandar. Todos los parametros son entrenados, incluidos los pesos compartidos del bucle, y no se utiliza KV cache en generacion.

El entrenamiento se realiza sobre el dataset sintetico ariG23498/looped-distilgpt2-pointer-chasing-data, con grafos de punteros disjuntos entre train, validacion y test. El entrenamiento usa caminos de 1 a 3 saltos, y el conjunto test_long evalua caminos de 4 a 6 saltos como prueba de generalizacion. El estado declarado es "complete" en el paso 1000/1000. No se especifica el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplico RLHF o DPO. La generacion es decodificacion autorregresiva ordinaria sin KV cache, y la evaluacion puntua un unico token de respuesta sin restricciones sobre el vocabulario completo (8 respuestas posibles, 12,5% de acierto por azar).

## Capacidades

- Generacion de texto autoregresiva basica, heredada de DistilGPT2 y ajustada a la tarea de pointer chasing.
- Resolucion de cadenas de punteros sinteticas del tipo "A>B B>C ..." con un numero de saltos indicado en el prompt.
- Generalizacion a longitudes de camino mayores que las vistas en entrenamiento (test_long con 4-6 saltos), sujeta a evaluacion por exact-match.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso de proposito general.
- No se declara capacidad multilingue; los idiomas soportados figuran como no disponibles.
- No dispone de modo thinking, vision ni audio.
- No usa KV cache en generacion, lo que limita el throughput en secuencias largas.

## Casos de uso

- Investigacion sobre looped transformers: el modelo sirve como punto de partida reproducible para estudiar si reutilizar bloques con pesos compartidos mejora la generalizacion en tareas iterativas, comparandolo con la linea base densa y con ablaciones del bucle de inferencia.
- Estudio de generalizacion compositional: el desajuste entre longitudes de entrenamiento (1-3 saltos) y test (4-6 saltos) permite medir la capacidad de extrapolacion a caminos mas largos en una tarea controlada.
- Reproduccion de experimentos: el repositorio incluye metrics.json, history.jsonl y source/ con la receta completa, lo que facilita replicar el entrenamiento y verificar el exact-match por longitud de camino.
- Docencia y divulgacion: la tarea de pointer chasing es un ejemplo minimalista y comprensible para explicar mecanismos de atencion, sharing de pesos y evaluacion exact-match en un entorno de laboratorio.
- Pruebas de infraestructura de inferencia: al requerir trust_remote_code y no usar KV cache, el modelo es util para validar pipelines que cargan modelos con codigo personalizado en transformers.
- Analisis de coste computacional del looping: permite medir el sobrecoste de ejecutar 10 bloques por forward pass frente a 6 en DistilGPT2 estandar, en terminos de latencia y memoria, sin necesidad de un modelo grande.
- Base para ablaciones controladas: sirve como variante "looped" frente a un baseline denso del mismo tamano, para aislar el efecto del bucle en lugar de atribuirlo al aumento de computo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a metrics.json para la precision exact-match por longitud de camino y a history.jsonl para el progreso de entrenamiento, pero no se proporcionan cifras numericas en la informacion facilitada. No se dispone de resultados de MMLU, HumanEval, GSM8K ni de comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 81,9 millones de parametros, los pesos en fp32 ocupan aproximadamente 328 MB; en fp16, unos 164 MB. El repo completo pesa 1,6 GB, presumiblemente por incluir checkpoints y artefactos adicionales.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior cubre holgadamente el modelo. Tambien cabe en CPU para inferencia puntual.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 1-2 GB de VRAM libre, incluidas GTX 1650, RTX 3050 y superiores.
- Opciones de despliegue: transformers con trust_remote_code=True es la via documentada. No se mencionan vLLM, llama.cpp, Ollama ni TGI; llama.cpp y Ollama requeririan conversion a GGUF, no publicada. TGI no esta validado para este codigo personalizado.
- Latencia y throughput estimados: no disponibles. La ausencia de KV cache implica que cada token generado recalcula los 10 bloques sobre toda la secuencia, lo que penaliza la generacion de secuencias largas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| looped-distilgpt2-pointer-chasing-looped | 81.912.576 | no disponible | Pointer chasing sintetico | apache-2.0 | Hugging Face, 0 descargas |
| distilbert/distilgpt2 (base) | 81.912.576 (aprox.) | 1024 tokens | Generacion de texto general | apache-2.0 | Hugging Face, ampliamente usado |
| GPT-2 small (OpenAI) | 124 millones | 1024 tokens | Generacion de texto general | MIT (pesos originales) | Hugging Face, ampliamente usado |

La comparacion relevante es con DistilGPT2 base: mismo orden de magnitud de parametros, pero el modelo ajustado ejecuta 10 bloques por forward pass en lugar de 6 y esta especializado en una unica tarea sintetica. No se dispone de datos de rendimiento comparativo entre ambos en la informacion proporcionada.

## Limitaciones y advertencias

- Se trata de una tarea de juguete: el propio autor advierte de que no constituye evidencia de razonamiento general.
- Un unico seed y mas computo en la variante con bucle no establecen un beneficio causal del looping; es necesario comparar con la linea base densa y con ablaciones del bucle de inferencia.
- Solo hay 8 respuestas posibles en la tarea, con un 12,5% de acierto por azar; la metrica exact-match debe interpretarse con cautela.
- No se declaran idiomas soportados; el modelo esta entrenado sobre datos sinteticos en un formato muy especifico.
- Riesgo alto de alucinacion fuera de la distribucion de la tarea: cualquier prompt ajeno al formato "A>B B>C ... Start: X. Steps: N. Answer:" probablemente producira salidas sin sentido.
- Requiere trust_remote_code=True; el autor recomienda inspeccionar model.py antes de permitir codigo de modelo personalizado.
- No usa KV cache, lo que limita el rendimiento en generacion de secuencias largas.
- Los checkpoints contienen pesos de inferencia, no el estado del optimizador, por lo que no permiten reanudar el entrenamiento de forma exacta.
- Licencia apache-2.0: permite uso comercial, pero el modelo no esta pensado ni validado para produccion.
- Sin descargas ni likes en el momento de la consulta; no hay evidencia de uso en la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ariG23498/looped-distilgpt2-pointer-chasing-looped
- Dataset de entrenamiento: https://huggingface.co/datasets/ariG23498/looped-distilgpt2-pointer-chasing-data
- Modelo base DistilGPT2: https://huggingface.co/distilbert/distilgpt2
