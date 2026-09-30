# freeideas/UsefulLocalModels

## Resumen

UsefulLocalModels es un repositorio de HuggingFace publicado por el ingeniero de IA Carl Free (usuario freeideas) que agrupa modelos pequenos especializados, pensados para ejecutarse en CPU y liberar a los grandes modelos de lenguaje de tareas repetitivas. Actualmente contiene un unico modelo documentado, `same-subject-r2`, un cross-encoder de 150 millones de parametros afinado a partir de Alibaba-NLP/gte-reranker-modernbert-base.

El problema que resuelve es concreto: dado un par de textos, decidir si el segundo sigue tratando el mismo tema que el primero, devolviendo una probabilidad. Es el clasificador que usa el sistema SumEng para segmentar flujos de texto que llegan en orden (libros, transcripciones de reuniones, chats) en temas, de forma que un modelo de lenguaje solo tenga que escribir un resumen por tema en lugar de procesar todo el texto.

La relevancia actual radica en su enfoque de eficiencia: 150M de parametros, inferencia en CPU de portatil, licencia Apache 2.0 y pesos en safetensors y ONNX, frente a la alternativa de enviar cada comprobacion a un LLM generalista. En su model card declara 73% de exactitud (AUC 0,82) en pares de test, por encima de Claude Sonnet (61%, AUC 0,69) y Claude Haiku (52%, AUC 0,57) en la misma tarea. El repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en ModernBERT (fine-tune de Alibaba-NLP/gte-reranker-modernbert-base) |
| Parametros totales | 150 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens como maximo en el par de entrada |
| Tipos de cuantizacion | no disponible (no se documentan versiones cuantizadas) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch, `AutoModelForSequenceClassification`, `attn_implementation="sdpa"`) y ONNX (`model.onnx`) |

## Arquitectura y entrenamiento

`same-subject-r2` es un cross-encoder: recibe dos textos como par y produce un unico logit, cuya sigmoid se interpreta como la probabilidad de que el segundo texto trate el mismo tema que el primero. La entrada se construye con elementos en formato `header:\ntext` separados por lineas en blanco; el primero es el texto previo (ultimos pasajes o un resumen) y el segundo es el texto nuevo seguido de una pregunta fija ("Is the new passage about the same subject as the earlier passages?"). La tokenizacion se hace como par, truncando solo el primer texto, con un maximo de 2.048 tokens y tratando los tokens especiales como texto plano (`split_special_tokens=True` en transformers, `encode_special_tokens = True` en tokenizers).

El entrenamiento uso 13.639 pares procedentes de 12 relatos de Sherlock Holmes (dominio publico, Project Gutenberg) y 196 reuniones AMI e ICSI del dataset QMSum (CC BY 4.0), con division por fuente. Los limites de tema en las reuniones fueron anotados por personas; los cortes de escena de los libros y todos los resumenes fueron generados por modelos Claude. Se entrenaron dos epocas con learning rate 1e-5 en una unica GPU L4; el checkpoint publicado corresponde a la epoca 1. El modelo incluye un archivo `sumeng-classifier.json` con la longitud maxima y el hash del ONNX, y hay una regla de segmentacion documentada: dejar crecer un grupo hasta que contenga el doble del minimo (3.000 caracteres) y cortar en el punto de probabilidad mas baja si queda por debajo de 0,4, manteniendo el minimo a cada lado.

## Capacidades

- Clasificacion de pares de texto: decide si un pasaje o mensaje nuevo continua el tema del texto anterior, devolviendo una probabilidad.
- Segmentacion tematica de flujos ordenados: divide libros, transcripciones de reuniones o notas en temas usando la regla de corte documentada.
- Salida calibrable de forma relativa: las probabilidades sirven para comparar comprobaciones entre si (por debajo de 0,1 o por encima de 0,9 en el 42% de los casos, con 88% de acierto).
- Ejecucion en CPU: funciona en hardware de consumo sin GPU, en PyTorch o onnxruntime.
- Idiomas: solo ingles.
- No soporta generacion de texto, tool calling, agentes, vision ni audio; es un clasificador discriminativo, no un modelo generativo.

## Casos de uso

- Segmentacion de libros y documentos largos en escenas o temas: el clasificador marca los cortes y un LLM escribe despues un resumen por segmento, reduciendo el coste frente a procesar el texto completo.
- Resumen jerarquico (piramide de resumenes) sobre texto que llega en orden, como implementa el sistema SumEng: cada nivel agrupa temas y el clasificador decide donde termina cada uno.
- Procesamiento de actas y transcripciones de reuniones: aunque el rendimiento cae frente a libros en turnos hablados cortos, permite trocear reuniones AMI/ICSI por temas antes de resumirlas.
- Prefiltrado de contexto para un LLM: decidir que fragmentos previos siguen siendo relevantes para la consulta actual y descartar el resto, ahorrando tokens de contexto.
- Clasificacion local y privada de flujos de mensajes: al ejecutarse en CPU y sin salida a la red, el texto no abandona la maquina, lo que encaja en entornos con requisitos de privacidad.
- Deteccion de deriva tematica en conversaciones multi-turno: usar la probabilidad como senal para reiniciar contexto o abrir un nuevo hilo.
- Etiquetado previo a indexacion o RAG: agrupar documentos por continuidad tematica antes de construir indices o clusters.

## Benchmarks y rendimiento

Resultados declarados en la model card sobre pares de test no vistos en entrenamiento (relatos y reuniones):

| Modelo | Exactitud | AUC |
|---|---:|---:|
| same-subject-r2 (este modelo) | 73% | 0,82 |
| Claude Sonnet (misma pregunta) | 61% | 0,69 |
| Claude Haiku (misma pregunta) | 52% | 0,57 |

Datos adicionales de la model card:

| Metrica | Valor |
|---|---|
| Acierto cuando la probabilidad es < 0,1 o > 0,9 (42% de las comprobaciones) | 88% |
| Segmentacion de relatos de Holmes: cortes de escena detectados | 17 de 20 |
| Pk de segmentacion (menor es mejor) | 0,37 (frente a 0,49 con cortes de tamano fijo) |
| Latencia en CPU M1 Pro, 4 hilos, 400 tokens (PyTorch) | ~0,15 s |
| Latencia en CPU M1 Pro, 4 hilos, 1.000 tokens (PyTorch) | ~0,4 s |
| onnxruntime en ese mismo entorno | ~2x mas lento que PyTorch |

No se han publicado resultados de benchmarks estandar tipo MMLU, HumanEval o GSM8K, que no aplican a un clasificador de este tipo.

## Requisitos de hardware

- VRAM estimada de pesos: ~600 MB en FP32, ~300 MB en FP16, ~150 MB en INT8 (estimacion a partir de los 150M de parametros; el repo ocupa 1,2 GB e incluye pesos y ONNX).
- VRAM total en inferencia: por debajo de 1 GB incluso en FP32 con secuencias de hasta 2.048 tokens.
- GPU: cabe en cualquier GPU consumer con 2 GB o mas (GTX 1050 en adelante, RTX 3060/4090, etc.); no requiere A100 ni H100. El entorno de referencia del autor es una unica L4 para entrenamiento.
- CPU: disenado para ejecutarse en CPU de portatil; el autor reporta 0,15 s por comprobacion a 400 tokens en un M1 Pro con 4 hilos.
- Opciones de despliegue: PyTorch con `transformers` (`AutoModelForSequenceClassification`, SDPA) y `onnxruntime` para el archivo `model.onnx`. No aplican llama.cpp, Ollama ni TGI, al no ser un modelo generativo.
- Latencia y throughput: aproximadamente 0,15 s a 400 tokens y 0,4 s a 1.000 tokens por comprobacion en CPU M1 Pro; onnxruntime resulto unas dos veces mas lento en ese entorno, aunque las salidas coinciden con PyTorch hasta 0,00001.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Exactitud en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| same-subject-r2 | 150M | Cross-encoder especializado | 73% / AUC 0,82 | Apache 2.0 | Pesos en safetensors y ONNX |
| Alibaba-NLP/gte-reranker-modernbert-base | no disponible en la informacion | Reranker base | no disponible | no disponible en la informacion | HuggingFace |
| Claude Sonnet (API) | no disponible | LLM generativo generalista | 61% / AUC 0,69 | propietaria | API de pago |
| Claude Haiku (API) | no disponible | LLM generativo generalista | 52% / AUC 0,57 | propietaria | API de pago |

No se dispone de datos en la informacion proporcionada sobre otros modelos locales especializados en segmentacion tematica o deteccion de continuidad de tema, por lo que la comparacion directa con alternativas equivalentes de codigo abierto queda como no disponible.

## Limitaciones y advertencias

- Solo funciona en ingles; no hay soporte multilingue documentado.
- Las probabilidades no estan calibradas: deben compararse entre si, no interpretarse como cuotas exactas de probabilidad.
- Las reuniones con turnos hablados cortos se segmentan bastante peor que los libros; el rendimiento es desigual por dominio.
- No se usaron datos de chat ni de correo electronico en el entrenamiento, por lo que ese dominio queda sin cubrir.
- Un unico valor bajo no implica un corte de tema; la propia model card advierte que hay que aplicar la regla de agrupacion y corte documentada.
- Riesgo de alucinacion: no aplica generacion de texto, pero si existe riesgo de falsos positivos o negativos en la clasificacion de continuidad tematica.
- Sesgos: el entrenamiento se apoya en relatos de ficcion de dominio publico y en reuniones AMI/ICSI, ademas de anotaciones y resumenes generados por modelos Claude, lo que puede introducir sesgos de dominio y de estilo.
- Licencia Apache 2.0, permisiva y compatible con uso comercial, sin las restricciones tipicas de modelos con licencias de comunidad.
- El modelo publicado es el checkpoint de la epoca 1 (de 2 epocas planificadas), lo que puede dejar margen de mejora respecto al entrenamiento completo.
- Repositorio sin adopcion aparente (0 descargas, 0 likes) en el momento de la consulta, sin garantia de mantenimiento ni soporte.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/freeideas/UsefulLocalModels
- Carpeta same-subject-r2 dentro del repositorio: https://huggingface.co/freeideas/UsefulLocalModels/tree/main/same-subject-r2
- Modelo base: https://huggingface.co/Alibaba-NLP/gte-reranker-modernbert-base
- Dataset QMSum: https://github.com/Yale-LILY/QMSum
- Perfil y contacto del autor: https://ordinarydata.com/resume/
- Descarga via huggingface_hub: `uvx --from huggingface_hub hf download freeideas/UsefulLocalModels --include "same-subject-r2/*" --local-dir models`
