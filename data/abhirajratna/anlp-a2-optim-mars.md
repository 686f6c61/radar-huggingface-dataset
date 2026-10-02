# abhirajratna/anlp-a2-optim-mars

## Resumen

El modelo `abhirajratna/anlp-a2-optim-mars` es un decodificador denso de 33.563.136 parametros (aproximadamente 33,6 M) desarrollado por Abhiraj Ratna en el contexto de una asignatura de procesamiento de lenguaje natural (ANLP, *Advanced Natural Language Processing*). No es un modelo de proposito general ni un lanzamiento comercial: es un artefacto de investigacion academica cuyo objetivo es comparar el comportamiento del optimizador MARS, implementado desde cero, frente a otros optimizadores al entrenar un mismo transformer pequeno.

La arquitectura es un transformer decoder-only de tipo GPT con 8 capas, `d_model` de 512, 8 cabezas de atencion y un MLP de dos capas con dimension interna 2048. El entrenamiento consistio en una unica pasada sobre el split de entrenamiento del dataset `browndw/human-ai-parallel-corpus`, con 39.038.976 tokens procesados (el dataset contiene 39.047.168) y un *peak learning rate* de 0.001. El resultado reportado es una perdida de validacion final de 3.7056 y un BLEU de test de 3.76 sobre continuaciones de 64 tokens con 7 referencias.

Su relevancia es exclusivamente metodologica: sirve como punto de comparacion reproducible para estudiar la estabilidad y convergencia de optimizadores en regimen de datos muy limitado, y como ejemplo minimo de *pipeline* de preentrenamiento ejecutable en hardware de consumo. No debe considerarse un modelo apto para tareas de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-style), denso |
| Parametros totales | 33.563.136 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (no especificada en la model card) |
| Tipos de cuantizacion | no disponible (el repo solo contiene pesos en safetensors; no se publican variantes GGUF, GPTQ ni AWQ) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (PyTorch) |

Detalles de configuracion declarados: 8 capas, `d_model` 512, 8 cabezas de atencion, MLP de 2 capas con dimension 2048 (variante v1 del modelo de la Parte 1).

## Arquitectura y entrenamiento

El modelo sigue el esquema clasico de transformer decoder-only con atencion causal y prediccion del siguiente token. La configuracion es deliberadamente pequena (8 capas, 512 de dimension oculta, 8 cabezas, MLP de dos capas con proyeccion interna a 2048) para que el ciclo completo de entrenamiento sea viable en una sola GPU y en tiempos de laboratorio. No se documentan innovaciones arquitectonicas como atencion lineal, SSM, mezcla de expertos ni decodificacion especulativa: el interes del artefacto esta en el optimizador, no en el modelo.

El entrenamiento se realizo en una sola pasada (*one epoch*) sobre el split de entrenamiento de `browndw/human-ai-parallel-corpus`, con 39.038.976 tokens efectivos frente a los 39.047.168 del dataset. El *peak learning rate* fue de 0.001 y el resultado final fue una perdida de validacion de 3.7056. La innovacion declarada es el uso de un optimizador MARS implementado desde cero, que se compara implicitamente con el modelo hermano entrenado con el optimizador Lion bajo la misma configuracion. No se menciona en la informacion disponible ninguna fase de ajuste fino, RLHF, DPO o instruccion.

## Capacidades

- Generacion de texto autoregresiva basica: continuacion de secuencias cortas en ingles tras un preentrenamiento de una sola epoca.
- Modelado de lenguaje y calculo de perplejidad: util como base para medir perdida de validacion y comparar optimizadores.
- Generacion de continuaciones de 64 tokens, evaluada con BLEU frente a 7 referencias.
- Capacidad limitada de seguir estructura del dataset de origen, que contiene pares humano-IA en paralelo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no; el modelo esta etiquetado unicamente como `en`.
- Capacidades especiales (modo thinking, vision, audio, contexto largo): no disponibles.
- Carga programatica mediante la funcion propia del autor: `from part1.model import load_pretrained`.

## Casos de uso

- Investigacion sobre optimizadores: el modelo permite reproducir la comparacion entre MARS, Lion y otros optimizadores bajo identica arquitectura y dataset, aislando el efecto del optimizador sobre la curva de perdida y sobre BLEU.
- Reproduccion de resultados academicos: al publicar la configuracion exacta (8 capas, 512, 8 cabezas, LR 0.001, 39 M tokens) y el dataset, sirve como referencia verificable para trabajos de asignatura o practicas de laboratorio.
- Prototipado de pipelines de entrenamiento en una sola GPU: con 33,6 M de parametros, un ciclo completo de preentrenamiento y evaluacion cabe en una GPU de consumo, lo que permite validar codigo de *data loading*, *checkpointing* y evaluacion antes de escalar.
- Base para experimentos de ajuste fino ligero: al ser pequeno, admite LoRA o ajuste completo en minutos, util para ensenar tecnicas de fine-tuning y para pruebas de clasificacion o generacion controlada.
- Estudio de metricas de generacion: el BLEU de 3.76 sobre continuaciones de 64 tokens con 7 referencias es un caso practico para analizar el comportamiento de metricas n-gram frente a modelos infraentrenados.
- Baseline en estudios de eficiencia computacional: permite medir tiempo por paso, uso de memoria y throughput con distintos optimizadores sin el coste de un modelo grande.
- Material docente: sirve para ilustrar de forma tangible como una sola epoca sobre 39 M tokens produce un modelo con perdida alta y generacion poco coherente, evitando expectativas irreales sobre modelos pequenos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perdida de validacion final | 3.7056 |
| BLEU de test (continuaciones de 64 tokens, 7 referencias) | 3.76 |
| Tokens de entrenamiento | 39.038.976 |
| Tokens del dataset (train split) | 39.047.168 |
| Peak learning rate | 0.001 |
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, ARC, HellaSwag) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 134 MB en FP32, 67 MB en FP16/BF16, 34 MB en INT8 y 17 MB en INT4, calculado a partir de los 33,6 M de parametros. El *overhead* de activaciones y del runtime es despreciable frente a estos valores.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Modelos como RTX 3060, RTX 4090, A100 o H100 estan sobradamente dimensionados; tambien es viable la inferencia en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna e incluso en GPUs integradas.
- Opciones de despliegue: al tratarse de una arquitectura y una funcion de carga propias (`part1.model.load_pretrained`), el uso previsto es mediante PyTorch y el codigo del autor. No hay confirmacion de soporte en vLLM, TGI, llama.cpp, Ollama u otros servidores, y no se publican pesos en GGUF, por lo que un despliegue estandar requeriria conversion y adaptacion previas.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Optimizador | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| anlp-a2-optim-mars | 33,6 M | no disponible | MARS (desde cero) | no disponible | HuggingFace |
| anlp-a2-optim-lion | 33,6 M (misma arquitectura v1) | no disponible | Lion (desde cero) | no disponible | HuggingFace |
| GPT-2 small | 124 M | 1024 | Adam | MIT | Ampliamente disponible |
| distilgpt2 | 82 M | 1024 | destilacion de GPT-2 | MIT | Ampliamente disponible |

La comparacion con GPT-2 small y distilgpt2 es solo orientativa por clase de tamano: ambos han sido entrenados con volumenes de datos muy superiores (decenas de miles de millones de tokens frente a los 39 M de este modelo) y no son comparables en calidad de generacion. El unico comparable directo y controlado es `abhirajratna/anlp-a2-optim-lion`, que comparte arquitectura, dataset y configuracion y solo difiere en el optimizador. No se dispone de cifras de benchmark de ninguno de los dos para establecer una comparacion cuantitativa mas alla de la perdida de validacion y el BLEU reportados por el autor.

## Limitaciones y advertencias

- Entrenamiento extremadamente limitado: una sola epoca sobre 39 M tokens y un modelo de 33,6 M de parametros producen una perdida de validacion de 3.7056, lo que indica una calidad de generacion muy baja y continuaciones poco coherentes.
- Riesgo de alucinacion y de texto incoherente: muy alto; el modelo no ha pasado por ajuste por instrucciones ni por alineacion, y no debe usarse para responder preguntas factuales.
- Sesgos: no documentados, pero el dataset de origen (pares humano-IA en paralelo) puede introducir sesgos de estilo y de dominio que no han sido auditados.
- Limitacion idiomatica: el modelo solo esta etiquetado para ingles; no hay evidencia de capacidades en castellano ni en otros idiomas.
- Longitud de contexto desconocida: la model card no especifica la ventana de contexto, por lo que cualquier uso con secuencias largas es especulativo.
- Licencia no disponible: la ausencia de licencia explicita impide determinar si se permite el uso comercial. Ante esta ambiguedad, no se recomienda su uso en produccion ni en productos derivados sin aclaracion del autor.
- Artefacto academico: el nombre, las etiquetas (`anlp-assignment`, `optimizer-comparison`) y la propia model card lo identifican como trabajo de asignatura, sin garantias de mantenimiento, soporte o versionado.
- Cero adopcion: 0 descargas y 0 *likes* en el momento de la consulta, sin comunidad que haya validado el modelo.
- Dependencia de codigo propietario: la carga requiere el modulo `part1.model` del autor, lo que anade una dependencia externa no empaquetada como libreria.
- Fechas del repositorio: los metadatos indican creacion y actualizacion en 2026-10-01, lo que conviene verificar antes de citar el artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abhirajratna/anlp-a2-optim-mars
- Modelo hermano (optimizador Lion): https://huggingface.co/abhirajratna/anlp-a2-optim-lion
- Perfil del autor en HuggingFace: https://huggingface.co/abhirajratna
- Perfil del autor en GitHub: https://github.com/abhirajratna/
- Dataset de entrenamiento: https://huggingface.co/datasets/browndw/human-ai-parallel-corpus
- Paper "MARS: Modular Agent with Reflective Search": https://arxiv.org/abs/2602.02660 (advertencia: este MARS hace referencia a un agente de busqueda reflexiva para investigacion automatizada, no al optimizador MARS empleado en el entrenamiento de este modelo; el enlace aparece en la busqueda web pero no esta confirmado como fuente del optimizador)
