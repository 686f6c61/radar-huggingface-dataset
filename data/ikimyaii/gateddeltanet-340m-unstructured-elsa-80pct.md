# ikimyaii/GatedDeltaNet-340M-unstructured-ELSA-80pct

## Resumen

GatedDeltaNet-340M-unstructured-ELSA-80pct es un checkpoint de investigación publicado por el usuario ikimyaii en HuggingFace: se trata del modelo base m-a-p/340M-20B-GatedDeltaNet-pure-baseline podado al 80 % de dispersión con el código oficial de ELSA (paper arXiv:2510.01650). No es un modelo entrenado desde cero ni afinado para una tarea concreta, sino una demostración reproducible de poda no estructurada sobre una arquitectura de atención lineal, pensada como línea base frente a los modelos "EHWS" del mismo autor.

El interés técnico está en la combinación: Gated DeltaNet es una arquitectura recurrente de atención lineal (familia flash-linear-attention) que sustituye la atención cuadrática por una actualización con regla delta y compuerta, y ELSA aplica poda por umbral de magnitud mediante ADMM sobre las capas lineales internas de los bloques, dejando embeddings y `lm_head` densos. El resultado conserva 399.531.200 parámetros almacenados (el nombre comercial habla de 340M) con una dispersión medida de 0,8000 en las 240 capas podadas.

Su relevancia es acotada y experimental: sirve para estudiar cómo degrada la poda agresiva no estructurada a un modelo pequeño de atención lineal, no como modelo de producción. La model card solo publica perplejidad (45,95 en WikiText-2 y 38,18 en C4, en fp16), sin evaluaciones de razonamiento, código ni seguimiento de instrucciones, y no declara licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gated DeltaNet (atención lineal con regla delta y compuerta, familia flash-linear-attention) |
| Parametros totales | 399.531.200 (denominado comercialmente 340M en el nombre del checkpoint) |
| Longitud de contexto | no disponible (el entrenamiento de poda uso secuencias de 2.048 tokens) |
| Tipos de cuantizacion | no disponible (no se publican pesos GGUF ni cuantizados; el checkpoint se distribuye en safetensors y se evaluo en fp16/bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 1,6 GB) |

Datos adicionales relevantes: dispersión medida de 0,8000 sobre los pesos publicados, 240 capas lineales podadas, embeddings y `lm_head` densos. Las filas no están balanceadas: la fila más densa tiene de media 2,58 veces los nonzeros de la media de su capa, y la peor capa llega a 4,37 veces.

## Arquitectura y entrenamiento

La arquitectura subyacente es Gated DeltaNet, un modelo recurrente de atención lineal en el que el estado se actualiza con una regla delta modulada por compuerta, lo que evita la matriz de atención cuadrática y permite en principio inferencia con coste lineal en la longitud de secuencia. El checkpoint no aporta detalles propios sobre el preentrenamiento del modelo base: el nombre `340M-20B` sugiere unos 20.000 millones de tokens de entrenamiento, pero esa cifra no se documenta en la información disponible.

El proceso aplicado es exclusivamente de poda. Se ejecutó el `main.py` oficial de ELSA con la configuración que el paper usó para su corrida HGRN-1.3B al 80 %, sin cambios entre modelos ni niveles de dispersión: 4.096 pasos ADMM, un paso z cada 32 pasos, batch 1 con acumulación de 8, learning rate 2e-4, lambda 0,01, bf16, 32.768 secuencias de C4 de 2.048 tokens y semilla 0. La corrida completa tardó 5,43 horas en una única A100 de 40 GB. La poda es no estructurada con un umbral de magnitud por capa, de modo que cada fila conserva un número distinto de nonzeros; se podaron todas las capas lineales dentro de los bloques. No se reporta destilado, recuperación posterior ni segundo ciclo de ajuste fino.

## Capacidades

- Generación de texto autoregresiva: es la única capacidad heredada del modelo base, y se documenta solo de forma indirecta mediante perplejidad.
- Modelado de lenguaje de dominio general: la poda se calibró con C4 y se evalúa en WikiText-2 y C4.
- Eficiencia de contexto: la atención lineal permite, en teoría, procesar secuencias largas con coste lineal, aunque no se publica ninguna evaluación de contexto largo tras la poda.
- Compatibilidad con el ecosistema `flash-linear-attention`: requiere `import fla` y `trust_remote_code=True` para cargarse con `AutoModelForCausalLM`.
- Tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo "thinking", visión o audio: no disponible.

## Casos de uso

- Investigación sobre poda no estructurada: replicar o contrastar el resultado de ELSA al 80 % sobre una arquitectura de atención lineal distinta de HGRN, usando la perplejidad en WikiText-2 (45,95) y C4 (38,18) como referencia numérica.
- Línea base para métodos de poda estructurada: comparar la degradación de un esquema por umbral con un umbral por capa frente a alternativas con filas balanceadas, aprovechando el dato de desequilibrio (2,58x media, 4,37x peor capa).
- Estudio del desequilibrio de sparsity: analizar el impacto del sesgo de fila en kernels dispersos y en la calidad, ya que el autor publica explícitamente la distribución de nonzeros.
- Pruebas de carga y compatibilidad de tooling: verificar la integración de checkpoints Gated DeltaNet podados en `flash-linear-attention`, `transformers` con código remoto y pipelines propios.
- Experimentos de eficiencia en inferencia: medir si el 80 % de dispersión no estructurada se traduce en ganancias reales en GPU densas o solo en ahorro de memoria al almacenar.
- Docencia y divulgación técnica: ejemplo mínimo (400M parámetros, 1,6 GB) para explicar ADMM aplicado a compresión de modelos sin necesidad de infraestructura grande.
- No recomendado para: atención al cliente, generación de código en producción, agentes o cualquier tarea que requiera seguimiento de instrucciones fiable, al no existir evaluación ni ajuste de instrucciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta perplejidad con su propia evaluación (conjuntos de test WikiText-2 y C4 de ELSA, fp16) y una única ejecución:

| Metrica | Valor |
|---|---|
| Perplejidad WikiText-2 (fp16) | 45,95 |
| Perplejidad C4 (fp16) | 38,18 |
| Dispersion medida | 0,8000 |
| Capas podadas | 240 |
| Desequilibrio de fila (media del maximo) | 2,58x |
| Desequilibrio de fila (peor capa) | 4,37x |

No se proporcionan cifras del modelo base denso en la misma evaluación, por lo que no es posible cuantificar la degradación introducida por la poda con los datos disponibles. Tampoco hay latencia ni throughput medidos.

## Requisitos de hardware

- VRAM estimada: en fp16 los 399,5M de parámetros ocupan aproximadamente 0,8 GB de pesos; con overhead de activaciones y caché de estado, un despliegue en fp16 cabe holgadamente en 2-4 GB de VRAM.
- En bf16/fp16 cabe en cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4070, RTX 4090) e incluso en GPUs de 8 GB.
- GPU recomendadas para reproducir la poda: una A100 40 GB, que es lo que el autor empleó (5,43 horas de corrida). Para solo inferencia no se necesita hardware de datacenter.
- Precisión: la evaluación publicada se hizo en fp16; el proceso de poda se ejecutó en bf16.
- Opciones de despliegue: al no haber GGUF ni cuantizaciones publicadas, `llama.cpp` y Ollama no están soportados de serie. La vía documentada es `transformers` con `trust_remote_code=True` y `flash-linear-attention` instalado; vLLM o TGI requerirían soporte específico para Gated DeltaNet, no confirmado en la información disponible.
- Latencia y throughput: no disponibles. Además, la dispersión no estructurada no garantiza aceleración en hardware denso; el ahorro esperable es de memoria de almacenamiento, no de tiempo de cómputo, salvo que se usen kernels dispersos específicos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dispersión | Perplejidad publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (ELSA 80 %) | 399,5M | no disponible | 80 % no estructurada | WikiText-2 45,95 / C4 38,18 | no disponible | HuggingFace, 0 descargas |
| m-a-p/340M-20B-GatedDeltaNet-pure-baseline | mismo orden (no detallado) | no disponible | densa | no disponible en esta ficha | no disponible | HuggingFace |
| Modelos "EHWS" del mismo autor | no disponible | no disponible | no disponible | no disponible | no disponible | referenciados en la model card, sin datos |

No se dispone de datos suficientes para comparar con alternativas de otros autores de tamaño similar (por ejemplo, modelos densos de 300-400M parámetros) en rendimiento downstream, porque este checkpoint no publica evaluaciones de tareas. La comparación honesta solo puede hacerse contra el modelo base, y tampoco se aportan sus métricas.

## Limitaciones y advertencias

- Modelo de investigación, no de producción: no hay ajuste de instrucciones, ni evaluación de razonamiento, código o matemáticas, ni datos de seguridad.
- Perplejidad alta para su tamaño: 45,95 en WikiText-2 y 38,18 en C4 indican una degradación considerable del modelado de lenguaje, coherente con una poda del 80 % sin recuperación posterior.
- Una única ejecución, sin intervalos de confianza ni repeticiones con distintas semillas: los números no deben tratarse como robustos.
- Dispersión no estructurada y desequilibrada: no se traduce en aceleración en GPUs densas y complica el diseño de kernels; el peor caso de fila llega a 4,37 veces la media.
- Idiomas no declarados: se desconoce el soporte real de castellano u otras lenguas; el calibrado de poda usó C4, mayoritariamente inglés.
- Licencia no disponible: sin licencia explícita no hay autorización clara para uso comercial; hay que contactar con el autor o consultar el modelo base antes de cualquier despliegue.
- Dependencia de código remoto: requiere `trust_remote_code=True` y la librería `flash-linear-attention`, lo que implica revisar el código y fijar versiones para evitar roturas.
- Riesgo de alucinación: elevado y no medido; no hay evaluación de fidelidad factual ni de calibración.
- Sesgos: no documentados; el modelo base tampoco los reporta en esta información.
- Contexto: aunque la arquitectura sea de coste lineal, no se publica ninguna evaluación de ventana larga tras la poda, por lo que no debe asumirse un contexto efectivo concreto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ikimyaii/GatedDeltaNet-340M-unstructured-ELSA-80pct
- Modelo base: https://huggingface.co/m-a-p/340M-20B-GatedDeltaNet-pure-baseline
- Paper de ELSA: https://arxiv.org/abs/2510.01650
- Repositorio de referencia de la arquitectura (flash-linear-attention): https://github.com/fla-org/flash-linear-attention
- No se han encontrado otros enlaces relevantes en la búsqueda web; los resultados devueltos no guardaban relación con el modelo.
