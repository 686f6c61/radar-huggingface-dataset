# rat-lab/mh-fresh-K2-van

## Resumen

rat-lab/mh-fresh-K2-van es un conjunto de adaptadores LoRA publicados por rat-lab (entrenados localmente por Max Horwitz en el cluster UW Hyak, trabajo SLURM 40455920 lanzado el 2026-09-22) que implementan la celda K=2, "none" de una tabla experimental de cobertura por debiasing, con riesgo entropico tau = 10. El entrenamiento se realizo con online IPO (`--alg oipo1`, implementado en `risk_egpo/tt_omd.py`) sobre el dataset PKU-Alignment/PKU-SafeRLHF y partiendo desde cero: adaptador LoRA inicializado a cero sobre el modelo SFT base `vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT`, con 1000 pasos de warmup y sin ningun checkpoint de otras ejecuciones.

Su relevancia es metodologica antes que de producto. El autor documenta que los conjuntos anteriores `mh-ec2-ttomd-*` estaban warm-started desde `ipo-e-c10.0/checkpoint-936` (que es a su vez el paso 936 de la ejecucion vanilla K=8), de modo que aquellas celdas K=2/K=4 eran ramas del baseline K=8 y no brazos independientes. Estas ejecuciones eliminan esa contaminacion y sirven como control limpio para estudiar el efecto de la sensibilidad al riesgo en optimizacion de preferencias.

El repositorio pesa 1,0 GB e incluye 10 checkpoints (cada 468 pasos, de 468 a 4680), los ficheros de tokenizer y un `training_dynamics.csv` con metricas por paso de log. No declara licencia, idiomas ni pipeline, y no tiene descargas ni valoraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 2); el repositorio contiene adaptadores LoRA, no pesos completos. Detalle de capas y atencion no disponible en la informacion proporcionada |
| Parametros totales | No disponible para los adaptadores. Modelo base: `vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT` (Gemma 2 2B). Tamano del repositorio: 1,0 GB |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (se hereda del modelo base, no declarada en la model card) |
| Tipos de cuantizacion | No disponible en el repositorio. Los adaptadores se distribuyen en safetensors; la cuantizacion se aplica al modelo base por separado |
| Idiomas soportados | No disponibles |
| Licencia | No disponible (la model card no declara licencia) |
| Formato de pesos | safetensors (adaptadores LoRA, libreria PEFT). Incluye `training_dynamics.csv` y ficheros de tokenizer |

## Arquitectura y entrenamiento

El objeto publicado es un adaptador LoRA (libreria PEFT) sobre un modelo SFT de Gemma 2 2B. El algoritmo de entrenamiento es online IPO con la variante `oipo1`, correspondiente a `risk_egpo/tt_omd.py`, con cobertura K = 2 (`--ypp_samples 2`), riesgo entropico con tau = 10 y sin correccion de sesgo (`debiasing: no bias correction`), es decir, la linea base sensible al riesgo. El tamano de paso TT figura como no aplicable. La generacion durante el entrenamiento se limito a 64 tokens nuevos, con semilla 42, y el proceso completo alcanzo 4680 pasos con checkpoints cada 468 pasos.

La innovacion metodologica destacable es la trazabilidad del origen de los pesos: cada trabajo se lanzo sin `--init_adapter` ni `--load_dir`, con el adaptador LoRA a cero y 1000 pasos de warmup, de forma que ningun checkpoint de otra ejecucion entra en el entrenamiento, a diferencia de los conjuntos `mh-ec2-ttomd-*` derivados de `ipo-e-c10.0/checkpoint-936`. El dataset de preferencias es PKU-Alignment/PKU-SafeRLHF. No se documentan detalles del preprocesado, composicion final del dataset, numero de tokens vistos ni si hubo etapas adicionales de RLHF o DPO mas alla del propio objetivo IPO.

## Capacidades

- Generacion de texto autoregresiva y conversacion multiturno, heredadas del modelo base Gemma 2 2B instruido sobre el que se aplica el adaptador.
- Optimizacion de preferencias orientada a seguridad: el adaptador se ha entrenado con preferencias de PKU-SafeRLHF, por lo que su efecto esperado es modular el comportamiento del modelo base hacia las respuestas preferidas en ese dataset.
- Control de sensibilidad al riesgo: la celda implementa riesgo entropico con tau = 10, lo que permite estudiar el comportamiento del modelo bajo ese parametro frente a otras celdas de la tabla.
- Analisis de dinamica de entrenamiento: el fichero `training_dynamics.csv` expone loss, grad_norm (L2, pre-clip), KL, rewards/accuracies y rewards/margins por paso de log.
- Capacidades de tool calling o function calling: no disponibles / no documentadas.
- Capacidades de agente y razonamiento multi-paso: no disponibles / no documentadas.
- Capacidades multilingues: no disponibles / no documentadas.
- Modo de pensamiento (thinking), vision o audio: no disponibles / no documentados (el modelo base textual no los declara en esta ficha).

## Casos de uso

- Reproduccion de experimentos de alineamiento: el adaptador permite reejecutar online IPO con tau = 10 y K = 2 desde un punto de partida limpio, usando el script `risk_egpo/tt_omd.py` y el dataset PKU-SafeRLHF.
- Ablacion de cobertura frente a debiasing: sirve como celda de control K=2 "none" para comparar contra las celdas con correccion de sesgo y contra los brazos warm-started `mh-ec2-ttomd-*`, aislando el efecto del warm start.
- Analisis de la dinamica de optimizacion: con `training_dynamics.csv` se pueden trazar curvas de loss, grad_norm pre-clip, KL y margenes de recompensa a lo largo de los 4680 pasos y localizar inestabilidades o divergencias.
- Investigacion en RLHF seguro: al entrenar sobre PKU-SafeRLHF, es util para estudiar como un objetivo de riesgo entropico modifica la tasa de respuestas inseguras frente a objetivos neutrales al riesgo.
- Seleccion de checkpoints intermedios: al publicarse 10 checkpoints (468 a 4680), se puede escanear el trade-off entre ajuste a preferencias y degradacion de capacidades generales paso a paso.
- Prototipado local en hardware de consumo: al ser un adaptador sobre un modelo de ~2B, se puede cargar en una GPU de gama de consumo para pruebas cualitativas de generacion sin infraestructura de servidor.
- Docencia y formacion: sirve como ejemplo reproducible de un pipeline completo (SLURM, LoRA, PEFT, logging de metricas) para cursos de alineamiento y optimizacion de preferencias.
- Base para entrenamiento continuado: cualquier investigador puede partir de un checkpoint concreto (por ejemplo, 468 o 2340) en lugar del modelo SFT, modificando la variable de inicializacion de forma controlada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de evaluaciones de seguridad o de preferencias. Las unicas metricas documentadas son las internas del entrenamiento (loss, grad_norm, KL, rewards/accuracies, rewards/margins), disponibles en `training_dynamics.csv` y no trasladables a una comparacion estandar entre modelos.

## Requisitos de hardware

- VRAM estimada para inferencia (orientativa, no declarada por el autor): en fp16/bf16, un modelo de ~2B mas el adaptador requiere del orden de 5-7 GB; en cuantizacion de 4 bits, del orden de 2-4 GB. El repositorio de adaptadores por si solo ocupa 1,0 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 y 4 GB para cuantizacion de 4 bits. Para servir en produccion, GPU tipo A100, H100 o L40S si se despliegan varias replicas con contexto largo.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090 y equivalentes, dado el tamano del modelo base. Esta afirmacion es una estimacion, no un dato publicado por el autor.
- Opciones de despliegue: PEFT + Transformers (carga directa con `PeftModel.from_pretrained`, como indica la model card), vLLM con soporte de adaptadores LoRA, TGI si acepta adaptadores PEFT, y llama.cpp/Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rat-lab/mh-fresh-K2-van | Adaptador LoRA sobre Gemma 2 2B | No disponible | Sin benchmarks publicados; solo metricas de entrenamiento | No disponible | Publico en HuggingFace, 0 descargas, 0 likes |
| vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT (modelo base) | Gemma 2 2B | No disponible en la informacion | No disponible | No disponible | Publico en HuggingFace |
| Ejecuciones `mh-ec2-ttomd-*` (celdas K=2/K=4 warm-started) | Adaptador LoRA sobre el mismo modelo base | No disponible | No disponible | No disponible | Referenciadas en la model card; estado de publicacion no confirmado |
| Ejecucion vanilla K=8 (`ipo-e-c10.0`) | Adaptador LoRA sobre el mismo modelo base | No disponible | No disponible | No disponible | Referenciada en la model card; estado de publicacion no confirmado |

No se dispone de datos cuantitativos que permitan una comparacion de rendimiento con alternativas de la misma categoria (otros adaptadores de optimizacion de preferencias sobre modelos de ~2B).

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia, el uso comercial queda en un limbo legal y no puede asumirse permiso de uso en produccion.
- Sin validacion externa: 0 descargas y 0 likes; no hay evidencia de terceros que hayan reproducido o evaluado el adaptador.
- Ausencia de benchmarks: no hay resultados de MMLU, seguridad, verdad o utilidad, por lo que no puede afirmarse que mejore al modelo base fuera del dataset de preferencias usado.
- Riesgo de sobreoptimizacion de seguridad: entrenar sobre PKU-SafeRLHF puede incrementar el rechazo excesivo (falsos positivos de seguridad) y degradar la utilidad en tareas legitimas.
- Sin correccion de sesgo: la celda es explicitamente la linea base "no bias correction", por lo que no incorpora mecanismos de mitigacion de sesgo y puede amplificar sesgos presentes en los datos de preferencias.
- Generacion de entrenamiento limitada a 64 tokens nuevos: el comportamiento mas alla de esa longitud no esta directamente optimizado.
- Una sola semilla (42): no hay estimacion de varianza entre ejecuciones, por lo que las diferencias frente a otras celdas podrian no ser significativas.
- Es un adaptador, no un modelo autonomo: requiere el modelo base `vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT` y la libreria PEFT para funcionar.
- Idiomas no documentados: no se especifica el reparto linguistico del dataset de preferencias ni del modelo base, por lo que el comportamiento multilingue es incierto.
- Riesgo de alucinacion: heredado del modelo base; no hay evaluacion especifica de fidelidad factual en el adaptador.
- Fechas del repositorio (creacion 2026-09-25) posteriores a la fecha actual de consulta, lo que conviene tener en cuenta al citar la ficha.
- Documentacion minima: la model card esta en ingles y no incluye detalles de hiperparametros completos, composicion del dataset ni resultados de evaluacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rat-lab/mh-fresh-K2-van
- Modelo base: https://huggingface.co/vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT
- Dataset de preferencias: https://huggingface.co/datasets/PKU-Alignment/PKU-SafeRLHF
- Referencia de libreria utilizada: https://huggingface.co/docs/peft
- Nota sobre la busqueda web: los resultados obtenidos no guardan relacion con el modelo (corresponden a la especie animal "rata"); no se han encontrado papers, blogs ni repositorios adicionales relevantes.
