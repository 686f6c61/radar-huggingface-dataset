# chiffonng/incidentbench-silver_all

## Resumen

`incidentbench-silver_all` es un adaptador LoRA (r=16) desarrollado por el usuario chiffonng sobre el modelo base Qwen/Qwen2.5-7B-Instruct. Su proposito es actuar como clasificador conjunto para IncidentBench: dado un caso de entrada, el modelo emite una unica respuesta que corresponde a uno de los siete dominios de riesgo MIT o a la categoria `No incident (potential only)`. Tanto la deteccion de incidente como su categoria se derivan de esa unica respuesta, lo que simplifica el pipeline de evaluacion.

El adaptador se presenta explicitamente como un artefacto de investigacion. Las etiquetas de entrenamiento son "silver", es decir, generadas por un modelo bajo la guia de anotacion del proyecto, y no anotaciones humanas "gold". El autor advierte que el modelo tiende a infra-detectar incidentes (under-calls) y que no debe usarse para tomar decisiones sobre sistemas reales. Este adaptador es la receta de referencia ("paper recipe") sobre el conjunto relabeled silver_train frente a la que se comparan los demas brazos del estudio.

El modelo se distribuye como adaptador PEFT sin fusionar, aplicado sobre el modelo base Qwen2.5-7B-Instruct, con un tamano de repositorio de 0.2 GB. La licencia es "other" y no se especifican idiomas soportados mas alla de los del modelo base. Su relevancia es acotada: sirve como referencia reproducible para la evaluacion de clasificadores de incidentes dentro del proyecto IncidentBench.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=16) sobre transformer decoder-only (Qwen2.5-7B-Instruct) |
| Parametros totales | no disponible (adaptador LoRA; base de 7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (adaptador PEFT, sin fusionar) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 aplicado sobre Qwen2.5-7B-Instruct, un transformer decoder-only. No se fusiona con el modelo base: se aplica en tiempo de inferencia sobre el modelo original, tal como se hizo en todas las ejecuciones reportadas del estudio. La tarea es una clasificacion de respuesta unica: el modelo debe producir una de ocho etiquetas (siete dominios de riesgo MIT o `No incident (potential only)`), y de esa misma respuesta se extraen deteccion y categoria.

El entrenamiento se realizo sobre el conjunto relabeled silver_train, con etiquetas generadas por modelo bajo la guia de anotacion del proyecto. La receta completa esta en `train_manifest.json`, y el formato de prompt, las filas de entrenamiento y los hashes en `data_manifest.json`. El stack de entrenamiento declarado es transformers 5.9.0 y peft 0.19.1. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. La decodificacion recomendada es greedy.

## Capacidades

- Clasificacion de incidentes en siete dominios de riesgo MIT mas la categoria `No incident (potential only)`.
- Deteccion y categorizacion conjuntas a partir de una unica respuesta del modelo.
- Inferencia con decodificacion greedy segun la receta del autor.
- Despliegue como adaptador LoRA servido con vLLM (`--enable-lora --max-lora-rank 16`).
- Capacidades heredadas del modelo base Qwen2.5-7B-Instruct (generacion de texto, razonamiento, codigo, multilingue), aunque el adaptador no esta entrenado para ellas.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision ni audio especificas de este adaptador.

## Casos de uso

- Referencia reproducible en investigacion: sirve como "brazo de referencia" (paper recipe) frente al que se comparan los demas brazos del estudio IncidentBench, usando el prompt `orig` de `train/build_data.py` y decodificacion greedy.
- Evaluacion de clasificadores de incidentes: permite medir la calidad de un clasificador conjunto deteccion-categoria sobre casos de prueba, con la advertencia de que sus puntuaciones y modos de fallo conocidos estan en el informe de IncidentBench.
- Analisis de sesgo de etiquetado silver: al entrenarse con etiquetas generadas por modelo, permite estudiar como se propagan esos sesgos frente a anotaciones humanas gold.
- Prototipado de pipelines de triaje de incidentes: util para experimentar con la formulacion de una sola respuesta para deteccion y categoria antes de invertir en datos gold.
- Reproduccion de experimentos: los manifiestos (`data_manifest.json`, `train_manifest.json`) permiten reconstruir el entrenamiento y verificar hashes.
- Despliegue de investigacion con vLLM: el comando de servicio documentado permite levantar el adaptador junto al modelo base para pruebas controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor remite al informe de IncidentBench para puntuaciones y modos de fallo conocidos, pero esos datos no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; depende del modelo base Qwen2.5-7B-Instruct y de la cuantizacion elegida.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Capacidad en GPU de consumo: no disponible; el adaptador LoRA en si ocupa 0.2 GB, pero requiere cargar el modelo base de 7B.
- Opciones de despliegue: vLLM con soporte LoRA (`vllm serve Qwen/Qwen2.5-7B-Instruct --enable-lora --max-lora-rank 16 --lora-modules silver_all=chiffonng/incidentbench-silver_all`). No se documentan otras opciones (llama.cpp, Ollama, TGI) en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni modelos comparables de la misma categoria (clasificadores de incidentes o adaptadores LoRA sobre Qwen2.5-7B-Instruct).

## Limitaciones y advertencias

- Etiquetas de entrenamiento "silver" generadas por modelo, no anotaciones humanas gold; pueden contener sesgos y errores del anotador automatico.
- El autor advierte que el modelo tiende a infra-detectar incidentes (under-calls).
- Artefacto de investigacion: el autor indica explicitamente que no debe usarse para decisiones sobre sistemas reales.
- Licencia "other": no se detallan los terminos de uso comercial; debe consultarse la licencia del modelo base y del adaptador antes de cualquier uso en produccion.
- Idiomas soportados no especificados; las capacidades multilingues dependen del modelo base y no estan validadas para esta tarea.
- Longitud de contexto no documentada para el adaptador; se hereda del modelo base sin validacion especifica.
- Riesgo de alucinacion inherente al modelo base; en esta tarea el riesgo se manifiesta como clasificaciones incorrectas o etiquetas fuera del conjunto esperado.
- El adaptador debe aplicarse sin fusionar y con la receta de prompt y decodificacion exactas para reproducir los resultados reportados.

## Enlaces

- Hugging Face: https://huggingface.co/chiffonng/incidentbench-silver_all
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
