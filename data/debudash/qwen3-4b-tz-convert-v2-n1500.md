# debudash/qwen3-4b-tz-convert-v2-n1500

## Resumen

`debudash/qwen3-4b-tz-convert-v2-n1500` es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`, publicado por el usuario `debudash` dentro del proyecto denominado tz-convert. No se trata de un modelo fundacional, sino de un checkpoint intermedio de una curva de eficiencia de datos: concretamente, el adaptador entrenado sobre los primeros 1.500 ejemplos de la mezcla `v2` del dataset `debudash/tz-convert-sft`, con los mismos hiperparámetros que el resto de checkpoints del proyecto.

El propósito declarado del adaptador es la conversion de zonas horarias (timezone / tz-convert) siguiendo una especificacion textual (spec prompt). El autor reporta una adherencia a la especificacion del 38,0 % y una robustez del 42,7 %, frente al 12,0 % y 23,3 % del modelo base cuando se le presenta el prompt completo de especificacion. El mejor checkpoint del proyecto, segun el autor, es `debudash/qwen3-4b-tz-convert-v3-n12000`, que incluye la model card completa.

Por su naturaleza, este repositorio es relevante como pieza de investigacion sobre eficiencia de datos en el ajuste fino de modelos pequenos para tareas estructuradas y acotadas, no como modelo de propósito general. El repositorio ocupa aproximadamente 0,1 GB, lo que corresponde unicamente a los pesos del adaptador, no al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Qwen3-4B-Instruct-2507) |
| Parametros totales | No disponible (el adaptador LoRA no declara recuento; el modelo base es de 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | QLoRA en entrenamiento; cuantizaciones de inferencia no disponibles |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante QLoRA (LoRA sobre un modelo base cuantizado) aplicado a `Qwen/Qwen3-4B-Instruct-2507`, un transformer decoder-only de la familia Qwen3 en su variante Instruct. El repositorio contiene exclusivamente los pesos del adaptador en formato PEFT/safetensors, por lo que para la inferencia es necesario cargar el modelo base y aplicar el adaptador.

El entrenamiento utiliza los primeros 1.500 ejemplos de la mezcla `v2` del dataset `debudash/tz-convert-sft`, con hiperparámetros identicos a los del resto de checkpoints del proyecto (commit de entrenamiento `bde7bb8531f4484ed1fdb0c524ee3c4746ae8b29`). No se detalla en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron etapas de RLHF o DPO. La innovacion tecnica del proyecto no reside en la arquitectura, sino en la comparacion sistematica de checkpoints a lo largo de una curva de eficiencia de datos para una tarea concreta.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Conversion de zonas horarias siguiendo una especificacion textual: es la tarea objetivo del ajuste fino.
- Adherencia a especificaciones: el autor mide una tasa de adherencia del 38,0 % con el prompt de especificacion completo.
- Robustez ante entradas variadas: 42,7 % segun la metrica del autor.
- Capacidades heredadas del modelo base Qwen3-4B-Instruct-2507 (razonamiento, codigo, matematicas, tool calling): no verificadas ni evaluadas en este adaptador; no disponibles en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.
- No se documentan modos de pensamiento (thinking), vision ni audio para este adaptador.

## Casos de uso

- Conversion de zonas horarias en aplicaciones de calendario: el adaptador puede recibir una hora y una zona de origen y devolver la hora equivalente en otra zona siguiendo el formato descrito en la especificacion, lo que resulta adecuado para normalizar marcas temporales en sistemas de agenda.
- Preprocesado de datos para pipelines de ETL: uso del adaptador para convertir columnas de fecha-hora entre zonas en lotes, aprovechando que la tarea esta acotada y el modelo base es pequeno (4B), lo que reduce el coste por inferencia frente a modelos mayores.
- Evaluacion de eficiencia de datos en investigacion: el checkpoint sirve como punto de referencia en una curva de 1.500 ejemplos para estudiar cuantos datos necesita un adaptador LoRA para aprender una tarea estructurada; util para disenar experimentos de ajuste fino con presupuesto limitado.
- Generacion de respuestas con formato controlado en asistentes de programacion: integracion del adaptador en un asistente que traduzca expresiones horarias en lenguaje natural a conversiones explicitas, siempre que se valide la salida contra la especificacion.
- Pruebas de robustez y comparacion de checkpoints: uso del adaptador como linea base intermedia frente al modelo sin ajustar (12,0 % de adherencia) y frente a checkpoints mayores como `v3-n12000`, para medir la ganancia marginal de datos adicionales.
- Prototipado rapido en entornos con recursos limitados: al ser un adaptador de aproximadamente 0,1 GB sobre un modelo de 4B, permite experimentar con QLoRA y despliegue en una sola GPU consumer antes de escalar a checkpoints con mas datos.

## Benchmarks y rendimiento

| Metrica | Este adaptador (n1500) | Modelo base con spec prompt |
|---|---|---|
| Spec-adherence | 38,0 % | 12,0 % |
| Robustness | 42,7 % | 23,3 % |
| Drift: conversaciones mantenidas | No disponible | 0,0 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las metricas anteriores son propias del proyecto tz-convert y no son comparables con benchmarks generales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un adaptador sobre un modelo base de 4B, los requisitos vienen determinados por el modelo base y la cuantizacion elegida, no por el adaptador.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU consumer: no confirmada en la informacion disponible; depende del modelo base Qwen3-4B-Instruct-2507 y de la cuantizacion empleada.
- Opciones de despliegue: la libreria declarada es `peft`, por lo que el adaptador se carga junto con el modelo base mediante PEFT; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (spec-adherence / robustness) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| debudash/qwen3-4b-tz-convert-v2-n1500 | Adaptador sobre base de 4B | No disponible | 38,0 % / 42,7 % | Apache 2.0 | HuggingFace |
| debudash/qwen3-4b-tz-convert-v3-n12000 | Adaptador sobre base de 4B | No disponible | No disponible en la informacion proporcionada | Apache 2.0 | HuggingFace |
| Qwen/Qwen3-4B-Instruct-2507 (sin ajustar, con spec prompt) | 4B | No disponible | 12,0 % / 23,3 % | No disponible en la informacion proporcionada | HuggingFace |

No se dispone de datos de otros modelos comparables de la misma categoria (adaptadores LoRA para tareas estructuradas) en la informacion proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio: el propio autor indica que el mejor checkpoint del proyecto es `v3-n12000`; usar `n1500` en produccion implica aceptar un rendimiento inferior al del mejor adaptador.
- Adherencia a la especificacion limitada: 38,0 % de spec-adherence significa que una mayoria de las salidas no cumple la especificacion completa; no es adecuado para produccion sin validacion posterior.
- Robustez moderada: 42,7 % de robustez implica un comportamiento inconsistente ante entradas fuera de distribucion.
- Solo ingles: la model card declara unicamente el idioma ingles, lo que limita su uso en entornos en castellano.
- Riesgo de alucinacion inherente al modelo base: no se documentan evaluaciones especificas de alucinacion para este adaptador.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-4B-Instruct-2507, cuyos terminos no se detallan en la informacion proporcionada.
- Naturaleza del repositorio: contiene solo los pesos del adaptador (aproximadamente 0,1 GB); no es un modelo autonomo y requiere el modelo base para funcionar.
- Fecha de publicacion: el repositorio figura creado en 2026-10-28, dato que conviene contrastar antes de planificar su uso.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/debudash/qwen3-4b-tz-convert-v2-n1500
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset de entrenamiento: https://huggingface.co/datasets/debudash/tz-convert-sft
- Mejor checkpoint y model card completa: https://huggingface.co/debudash/qwen3-4b-tz-convert-v3-n12000
- Codigo, conjuntos de evaluacion e informes: https://huggingface.co/debudash/slm-training
