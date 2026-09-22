# SeanWang0027/qwen3-1.7b-babyai-tcod-f2b-qwen3-32b-ep1

## Resumen

Este repositorio contiene un ajuste fino del modelo Qwen3-1.7B (2.031.739.904 parametros reales segun los pesos en safetensors) desarrollado por el usuario SeanWang0027. El entrenamiento aplica destilacion on-policy (on-policy distillation) desde un profesor Qwen3-32B en bf16 hacia el estudiante Qwen3-1.7B, sobre el entorno BabyAI, con la variante TCOD (forward-to-backward) en la que la ventana del episodio va creciendo. El resultado es un export de Hugging Face correspondiente al paso 51 del explorador (paso 49 del trainer) dentro de un plan de tres pasadas sobre los datos.

El interes del artefacto es fundamentalmente metodologico: documenta una receta reproducible de destilacion on-policy multi-turno (20 turnos de conversacion, 810 tareas oficiales de entrenamiento de BabyAI, batch de 16 episodios / 64 turnos, lr 1e-6, kl_coef 1.0) y sirve como punto de control intermedio para estudiar la evolucion del estudiante a lo largo de las tres pasadas (152 pasos de explorador en total). No es un modelo orientado a producto ni un lanzamiento oficial.

Es importante remarcar que el propio autor indica explicitamente "Not evaluated": no hay evaluacion publicada, ni licencia declarada, ni idiomas declarados, ni cuantizaciones publicadas. Por tanto, debe tratarse como un artefacto de investigacion experimental, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3, heredada del modelo base Qwen/Qwen3-1.7B); detalles internos no confirmados en la model card de este ajuste |
| Parametros totales | 2.031.739.904 (~2,03 B), dato real de los safetensors |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No confirmada en la informacion de este ajuste; el modelo base Qwen3-1.7B declara 32.768 tokens nativos (no verificado en esta model card) |
| Tipos de cuantizacion | No disponible: el repositorio solo contiene pesos en safetensors, sin versiones GGUF, AWQ, GPTQ ni similares |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (libreria declarada: transformers) |
| Tamano del repositorio | 4,1 GB |
| Modelo base | Qwen/Qwen3-1.7B |
| Profesor de destilacion | Qwen3-32B en bf16 |
| Fecha de creacion | 2026-09-22 |

## Arquitectura y entrenamiento

La arquitectura del estudiante es la del modelo base Qwen/Qwen3-1.7B, un transformer decoder-only denso de ~2,03 B de parametros. No se introduce ninguna modificacion estructural: el trabajo se realiza integramente mediante ajuste de pesos sobre ese checkpoint.

El entrenamiento es una destilacion on-policy con el profesor Qwen3-32B en bf16 y el modo "thinking" desactivado. La receta concreta, segun la model card, es: variante TCOD forward-to-backward con ventana de episodio creciente y checkpoint_steps 6; conversacion definida en `babyai/eval_babyai.py` con 20 turnos; 810 tareas oficiales de entrenamiento de BabyAI; batch de 16 episodios / 64 turnos; learning rate 1e-6; kl_coef 1.0; tres pasadas sobre los datos, lo que suma 152 pasos de explorador. El artefacto publicado corresponde al paso 51 del explorador (paso 49 del trainer), es decir, aproximadamente un tercio del plan de entrenamiento previsto. El codigo de referencia se apoya en `kokolerk/TCOD` con el overlay FutureBridge-OPD (trinity-rft) y un port de BabyAI descrito en `docs/TCOD_BABYAI.md` del repositorio online-rose (rama `tcod-babyai`). No se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal ni mezclas MoE.

## Capacidades

- Generacion de texto autorregresiva y mantencion de conversaciones multi-turno: el entrenamiento se realizo sobre conversaciones de 20 turnos, por lo que el formato de dialogo encadenado esta presente en los datos.
- Seguimiento de instrucciones en el dominio BabyAI (entorno de gridworld con instrucciones en lenguaje natural y secuencias de acciones), que es el unico dominio supervisado documentado.
- Razonamiento multi-paso dentro de un episodio, inducido por la estructura de conversacion de 20 turnos con realimentacion del entorno.
- Capacidades heredadas del modelo base Qwen3-1.7B (generacion general, codigo, matematicas basicas, multilingueismo de la familia Qwen3): no hay ninguna verificacion en la informacion proporcionada de que se conserven tras la destilacion.
- Soporte de tool calling / function calling: no disponible (no declarado ni evaluado).
- Modo thinking: explicitamente desactivado durante el entrenamiento ("thinking off").
- Vision o audio: no disponible (no se mencionan y el modelo base no es multimodal).

## Casos de uso

- Reproduccion de experimentos de destilacion on-policy: el modelo sirve como punto de control intermedio (paso 51 de 152) para comparar curvas de aprendizaje entre estudiantado y profesor en un mismo pipeline TCOD.
- Investigacion sobre ventanas de contexto crecientes (forward-to-backward): al estar entrenado con una ventana de episodio que se expande y checkpoint_steps 6, permite analizar como afecta ese esquema al comportamiento por turnos.
- Evaluacion de agentes en entornos tipo BabyAI: puede emplearse como politica inicial para medir tasas de exito en tareas de gridworld con instrucciones, siempre que se ejecute una evaluacion propia, ya que el autor no publica ninguna.
- Generacion de datos sinteticos de dialogo multi-turno en dominios de instrucciones simples y verificables, aprovechando el formato conversacional de 20 turnos del entrenamiento.
- Base para ajustes posteriores (SFT, DPO) en tareas de agentes pequenos, dado que el checkpoint es un transformer denso estandar de ~2 B en safetensors y se carga sin modificaciones con transformers.
- Despliegue en entornos de bajos recursos para experimentacion: con ~4,06 GB de pesos en bf16, cabe en GPUs de consumo y permite probar pipelines de inferencia antes de escalar a modelos mayores.
- Estudio de la transferencia profesor-alumno entre un modelo de 32 B y uno de ~2 B con kl_coef 1.0, util para calibrar coeficientes de KL en recetas de destilacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente "Not evaluated" y no incluye metricas de BabyAI, MMLU, HumanEval, GSM8K ni de ningun otro conjunto.

## Requisitos de hardware

- Pesos en bf16/fp16: ~4,06 GB (2.031.739.904 parametros x 2 bytes), consistente con el tamano de repositorio de 4,1 GB.
- Pesos en fp32: ~8,13 GB.
- Estimacion en int8: ~2,03 GB de pesos; en int4: ~1,0-1,1 GB de pesos. Estas cuantizaciones no estan publicadas, habria que generarlas.
- Cache KV: en torno a 0,11 MB por token y secuencia segun la configuracion habitual del modelo base de 1,7 B (28 capas, GQA con 8 cabezas KV, head_dim 128). A 32.768 tokens esto supone aproximadamente 3,7 GB adicionales por secuencia. Estimacion derivada, no confirmada en la informacion proporcionada.
- VRAM practica orientativa: 6-8 GB en bf16 con contextos cortos y pocas secuencias concurrentes; mas de 12-16 GB si se trabaja a contextos largos con batching.
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y en Apple Silicon con memoria unificada suficiente.
- GPU de datacenter: A100, H100, L40S, A10G; no requiere aceleradores de gama alta para inferencia, solo para entrenamiento con profesor de 32 B.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference y endpoints compatibles (etiquetas `text-generation-inference` y `endpoints_compatible`). Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, ya que no se distribuyen en ese formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SeanWang0027/qwen3-1.7b-babyai-tcod-f2b-qwen3-32b-ep1 | ~2,03 B | No confirmado | No disponible | Safetensors en Hugging Face; sin cuantizaciones |
| Qwen/Qwen3-1.7B (modelo base) | ~2,03 B | 32.768 tokens nativos segun documentacion publica de la familia | Apache-2.0 segun documentacion publica de la familia | Safetensors, GGUF y cuantizaciones publicadas |
| Qwen/Qwen3-32B (profesor) | ~32 B | 32.768 tokens nativos segun documentacion publica de la familia | Apache-2.0 segun documentacion publica de la familia | Safetensors y cuantizaciones publicadas |

No se dispone de datos de rendimiento de este ajuste que permitan una comparacion cuantitativa con alternativas de su misma categoria; cualquier comparativa de calidad seria especulativa.

## Limitaciones y advertencias

- Modelo sin evaluar: el autor declara "Not evaluated". No hay ninguna metrica que respalde su calidad o su utilidad.
- Checkpoint intermedio: es el export tras el paso 51 del explorador dentro de un plan de 152 pasos y tres pasadas sobre los datos; no representa el resultado final del entrenamiento.
- Licencia no declarada: el repositorio no indica licencia, por lo que no puede asumirse uso comercial ni redistribucion sin consultar previamente al autor. El modelo base Qwen3-1.7B si cuenta con licencia propia, pero eso no cubre automaticamente este ajuste.
- Idiomas no declarados: no hay informacion sobre el soporte multilingue resultante tras la destilacion en un entorno en ingles tipo gridworld.
- Dominio muy estrecho: los datos de entrenamiento provienen exclusivamente de BabyAI (810 tareas oficiales) y de conversaciones de 20 turnos; cabe esperar degradacion fuera de ese dominio.
- Las capacidades generales del modelo base pueden haberse visto afectadas por el ajuste; no hay verificacion al respecto.
- Riesgo de alucinacion: al ser un modelo de ~2 B ajustado en un dominio con respuestas verificables por el entorno, puede generar acciones o afirmaciones plausibles pero incorrectas, especialmente si se usa fuera de BabyAI.
- Sesgos: no se documenta ningun analisis de sesgos ni de composicion del dataset mas alla de las tareas de BabyAI.
- Sin cuantizaciones oficiales: el uso en CPU o en hardware limitado exige convertir los pesos a GGUF por cuenta propia.
- Modo thinking desactivado en el entrenamiento: no debe esperarse razonamiento extendido estilo cadena de pensamiento.
- Advertencia de trazabilidad: el despliegue en produccion requeriria una evaluacion propia, fijar la licencia y validar el comportamiento en el caso de uso concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SeanWang0027/qwen3-1.7b-babyai-tcod-f2b-qwen3-32b-ep1
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo profesor: https://huggingface.co/Qwen/Qwen3-32B
- Referencias citadas en la model card sin URL publicada en la informacion proporcionada: repositorio `kokolerk/TCOD`, overlay FutureBridge-OPD sobre `trinity-rft`, port de BabyAI en `docs/TCOD_BABYAI.md` del repositorio online-rose (rama `tcod-babyai`), y script `babyai/eval_babyai.py`.
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo: los resultados obtenidos correspondian a contenidos sin relacion (fichas salariales de un puesto inmobiliario), por lo que se descartan.
