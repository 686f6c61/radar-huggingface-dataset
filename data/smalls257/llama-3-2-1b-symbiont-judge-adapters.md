# smalls257/Llama-3.2-1B-symbiont-judge-adapters

## Resumen

Llama-3.2-1B-symbiont-judge-adapters es una colección de adaptadores LoRA (no un modelo completo) construidos sobre meta-llama/Llama-3.2-1B-Instruct. Los publica el usuario smalls257 como parte del kit de reproducción "ai-symbiont". Cada adaptador está entrenado para responder a una única pregunta binaria: si una lección almacenada (un aprendizaje extraído de fallos previos) se aplica a un fallo concreto. La puntuación del "juez" es la probabilidad de que la respuesta sea "sí".

El interés del artefacto no está en sus capacidades generativas, sino en su función como componente de un sistema de memoria y aprendizaje para agentes de código. El autor documenta un experimento sobre trayectorias de SWE-smith en el que un juez entrenado noche a noche por repositorio cubre el 61,1 % de las recurrencias de fallos, frente al 0 % de un juez genérico. Es, por tanto, material de investigación reproducible más que un modelo de propósito general.

El repositorio contiene solo los pesos de los adaptadores (rank 16, escala 32, sobre las siete matrices de proyección de Llama 3.2 1B Instruct), con un tamaño de 0,2 GB. No incluye los pesos base de Llama ni copias fusionadas, y no se han publicado resultados de benchmarks estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder Llama 3.2 1B Instruct; rank 16, escala 32, aplicado a las siete matrices de proyección |
| Parametros totales | No disponible (los adaptadores no declaran recuento; el modelo base Llama 3.2 1B Instruct tiene 1,24 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base; no se especifica) |
| Tipos de cuantizacion | No disponible (los adaptadores se publican en safetensors sin cuantizar; la cuantización dependería del despliegue del modelo base fusionado) |
| Idiomas soportados | No disponible |
| Licencia | Llama 3.2 Community License (etiqueta "other", license_name llama3.2) |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

Los artefactos son adaptadores LoRA de rango 16 y escala 32 insertados en las siete matrices de proyección de Llama 3.2 1B Instruct. El modelo base es un transformer decoder de 1,24 mil millones de parámetros. Cada adaptador se entrena para una tarea de clasificación binaria: dada una lección almacenada y un fallo, estimar P(sí), es decir, la probabilidad de que la lección sea aplicable. No hay, por tanto, un objetivo generativo, sino una cabeza de juicio implementada mediante el propio modelo de lenguaje.

El repositorio incluye tres semillas del juez de la ronda 3 (`judge-s0`, `judge-s1`, `judge-s2`), cuya media de P(sí) constituye la puntuación del juez, y un juez general de la ronda 4 (`general`) entrenado sobre `base-judge-s0`. Los adaptadores se apilan por fusión secuencial: `base-judge-s0` = Llama 3.2 1B Instruct + `judge-s0`; `base-general` = `base-judge-s0` + `general`; los tres adaptadores de la ronda 3 se aplican directamente sobre el modelo base sin fusionar. Los adaptadores nocturnos por repositorio (pydantic y moto) están retenidos y no se publican. El entrenamiento se realizó en una laptop con MPS y en una máquina CUDA, por lo que los resultados numéricos pueden diferir en los últimos bits al reconstruir. La información disponible no detalla el volumen de tokens de entrenamiento ni si se aplicó RLHF o DPO.

## Capacidades

- Juicio binario de aplicabilidad: responde a la pregunta "¿se aplica esta lección almacenada a este fallo?" mediante la probabilidad de "sí".
- Puntuación agregada por conjunto de semillas: la media de P(sí) de `judge-s0`, `judge-s1` y `judge-s2` constituye la puntuación del juez de la ronda 3.
- Composición por apilamiento: los adaptadores se fusionan secuencialmente para construir jueces de mayor nivel (`base-judge-s0`, `base-general`).
- Integración en un pipeline de memoria de agente: forma parte del kit ai-symbiont para reproducción de experimentos de aprendizaje a partir de fallos.
- No soporta generación de texto abierta, tool calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido: cada adaptador responde a una única pregunta sí/no.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Reproducción de experimentos de memoria de agentes: el kit `scripts/reproduce/rerun_learning.py fetch-adapters` y `rescore` descarga el repositorio en una revisión fijada, verifica cada archivo contra sus hashes SHA-256, reconstruye los jueces y puntúa los 924 ítems del estudio de corrección de código comparando con el resultado comprometido dentro de bandas declaradas.
- Filtrado de lecciones en sistemas de aprendizaje continuo: dado un fallo nuevo, el juez decide si una lección almacenada es aplicable, evitando inyectar contexto irrelevante en el prompt del agente.
- Investigación sobre transferencia de dominio: el autor usa el juez de la ronda 3 para demostrar que un juez genérico no transfiere a datos de otro repositorio (0 % de cobertura) y que el entrenamiento por repositorio sí recupera cobertura.
- Evaluación de metodologías de memoria para agentes de código: sirve como componente de referencia para comparar estrategias de recuperación de lecciones frente a reglas simples como "agree".
- Auditoría de sistemas de juicio automático: al publicarse tres semillas, permite medir la varianza del juez y acotar intervalos de confianza agrupados por tarea.
- Docencia e investigación reproducible: el tamaño reducido (0,2 GB de adaptadores) y la base de 1B permiten reconstruir el sistema completo en hardware modesto, incluida una laptop con MPS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí reporta un resultado medido en su propio experimento, que no es un benchmark general:

| Metrica | Resultado | Notas |
|---|---|---|
| Cobertura de recurrencias (brazo nocturno) | 0,611 | 924 ítems (462 recurrencias posteriores y 462 negativos) de dos repositorios |
| Cobertura de la regla "agree" | 0,000 | Línea base de comparación |
| Ganancia | +0,611 | Intervalo agrupado por tarea [0,556; 0,666] |
| Selecciones erróneas | 5 de 924 | Cota superior exacta de Clopper-Pearson al 95 %: 1,26 % |
| Cobertura del juez de la ronda 3 (sin entrenamiento nocturno) | 0,000 | Nunca respondió "sí" en estos datos (brecha de dominio) |

## Requisitos de hardware

- El repositorio de adaptadores ocupa 0,2 GB; el modelo base Llama 3.2 1B Instruct debe obtenerse por separado.
- VRAM estimada para inferencia: no disponible de forma explícita; con 1,24 mil millones de parámetros, un despliegue en fp16 requiere del orden de 2,5 GB de pesos más overhead, y en cuantizaciones de 8 o 4 bits cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no especificadas por el autor. El entrenamiento y la fusión se realizaron en una laptop con MPS y en una máquina CUDA, lo que indica viabilidad en hardware de consumo.
- Cabe en GPU de consumo: sí, por el tamaño del modelo base; no se detallan modelos concretos.
- Opciones de despliegue: PEFT para cargar y fusionar los adaptadores; el autor no menciona vLLM, llama.cpp, Ollama ni TGI. La fusión se hace localmente y las copias fusionadas nunca se suben.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada adaptadores comparables de juicio binario sobre Llama 3.2 1B Instruct. Como referencia de categoría, el modelo base es Llama 3.2 1B Instruct (1,24 mil millones de parámetros, licencia Llama 3.2 Community License), pero la comparación directa con este artefacto no es significativa porque los adaptadores no son un modelo generativo.

## Limitaciones y advertencias

- No es un modelo de código general: cada adaptador responde a una única pregunta sí/no y no debe usarse como generador.
- Alcance empírico muy limitado: dos repositorios de un solo benchmark, con bugs sintéticos e inyectados en SWE-smith; los errores de los agentes al corregirlos sí son reales.
- Los adaptadores nocturnos por repositorio (pydantic y moto) están retenidos, por lo que el resultado de 0,611 no puede re-puntuarse desde los pesos publicados; solo puede verificarse desde los recuentos comprometidos.
- La comparación del resultado mide recuperación de cobertura frente a un juez que no transfiere (brecha de dominio), no que el entrenamiento supere a una línea base funcional.
- Los fallos se infieren del texto de error porque las observaciones no llevan código de salida, y las tareas se ordenan por hash con semilla porque no tienen fechas.
- Diferencias numéricas en los últimos bits al reconstruir, por haberse entrenado y fusionado en MPS y CUDA.
- Licencia Llama 3.2 Community License: uso sujeto a la Acceptable Use Policy de Meta; los adaptadores no incluyen pesos de Llama y el modelo base debe obtenerse bajo la licencia de Meta.
- No se publican datos de entrenamiento ni los pesos base; el autor no declara sesgos conocidos ni tasas de alucinación (no aplica en el sentido habitual, al ser una tarea de clasificación).
- Idiomas soportados no disponibles; el entrenamiento se documenta sobre trayectorias en inglés de SWE-smith.

## Enlaces

- HuggingFace: https://huggingface.co/smalls257/Llama-3.2-1B-symbiont-judge-adapters
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Licencia Llama 3.2: https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/LICENSE
- Política de uso aceptable de Llama 3.2: https://www.llama.com/llama3_2/use-policy
- Dataset SWE-smith trajectories (MIT): https://huggingface.co/datasets/SWE-bench/SWE-smith-trajectories
- Kit de reproducción ai-symbiont (referenciado en la model card, sin URL directa en la información disponible): scripts `scripts/reproduce/rerun_learning.py` con subcomandos `fetch-adapters` y `rescore`
