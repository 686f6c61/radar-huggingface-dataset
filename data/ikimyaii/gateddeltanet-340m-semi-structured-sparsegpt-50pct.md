# ikimyaii/GatedDeltaNet-340M-semi-structured-SparseGPT-50pct

## Resumen

GatedDeltaNet-340M-semi-structured-SparseGPT-50pct es una variante podada del modelo base m-a-p/340M-20B-GatedDeltaNet-pure-baseline, publicado por el usuario ikimyaii en Hugging Face. Se trata de un ejercicio de investigación sobre poda estructurada: el modelo original, de arquitectura GatedDeltaNet (una familia de modelos de estado recurrente lineal con compuertas), se somete a una poda one-shot del 50 % de dispersión semiestructurada sin reentrenamiento posterior, empleando la herramienta oficial `fasterprune` con una modificación del criterio de máscara de SparseGPT. El resultado es un checkpoint de aproximadamente 399,5 millones de parámetros (según los pesos safetensors) que conserva la arquitectura del modelo base pero con la mitad de los pesos de las capas lineales a cero.

La relevancia de esta ficha es acotada y de carácter metodológico: no es un modelo pensado para uso en producción ni para tareas de usuario final, sino un *baseline* técnico para comparar otras técnicas de poda (en concreto, los modelos EHWS del mismo autor). La modificación introducida respecto al SparseGPT canónico consiste en imponer una restricción por fila dentro de cada bloque de 128 columnas, de modo que todas las filas de una capa podada conservan exactamente el mismo número de valores no nulos. Esto equilibra perfectamente la carga de trabajo por fila en kernels dispersos, una propiedad relevante para el despliegue eficiente de modelos dispersos en hardware real.

El modelo se distribuye únicamente en formato safetensors, requiere la librería `flash-linear-attention` para cargarse y no incluye información sobre licencia, idiomas soportados ni pipeline de uso. Su tamaño de repositorio es de 0,8 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GatedDeltaNet (modelo de estado recurrente lineal con compuertas, familia DeltaNet) |
| Parametros totales | 399.531.200 (según safetensors) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en safetensors; el autor evalúa en bfloat16 y fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dispersión | 50 % semiestructurada en capas lineales (embeddings y lm_head densos) |
| Modelo base | m-a-p/340M-20B-GatedDeltaNet-pure-baseline |
| Tamaño del repositorio | 0,8 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es GatedDeltaNet, un modelo de estado recurrente lineal con compuertas que sustituye la atención cuadrática por una recurrencia lineal con mecanismo delta y compuertas de olvido. El modelo base fue entrenado por m-a-p con 20 000 millones de tokens (según indica su nombre, 340M-20B). Sobre ese checkpoint, este modelo aplica una poda one-shot sin reentrenamiento: no hay ajuste fino posterior, RLHF, DPO ni ninguna otra fase de alineamiento tras la poda.

El proceso de poda emplea la herramienta oficial `fasterprune` con una modificación del criterio de máscara respecto al SparseGPT publicado. En lugar de la regla N:M clásica, se aplica una restricción por fila dentro de cada bloque de 128 columnas: cada fila poda el mismo número de sus entradas de menor magnitud según la métrica `w^2 / [H^-1]_jj^2` (la regla de SparseGPT con M igual al tamaño del bloque). El resultado es que todas las filas de todas las capas podadas tienen el mismo número de valores no nulos, lo que equilibra la carga por fila. La calibración usa el cargador oficial con 128 secuencias de C4 de 2 048 tokens y semilla 0; los bloques se podan en orden y cada uno se calibra sobre las salidas de los bloques ya podados. La poda se realizó en bfloat16 y tardó 2,5 minutos en una única A100 de 40 GB. Se podan todas las capas lineales internas de los bloques; embeddings y lm_head permanecen densos. La dispersión medida sobre los pesos finales es exactamente 0,5000 en las 240 capas podadas.

## Capacidades

- Generación de texto autoregresiva: al ser un modelo de lenguaje causal, puede generar texto, aunque su tamaño (340M) y su condición de modelo podado limitan la calidad frente a modelos mayores.
- Razonamiento básico y respuesta a preguntas de conocimiento general: las evaluaciones zero-shot muestran un rendimiento por encima del azar en tareas como boolq, rte o winogrande, aunque modesto.
- Capacidad multilingüe: no disponible (no se documenta la composición del corpus ni los idiomas).
- Tool calling / function calling: no disponible; no se documenta soporte.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta.
- Modo thinking, visión o audio: no disponible; el modelo es exclusivamente de texto.
- Propiedad destacable: dispersión semiestructurada con número constante de no nulos por fila, lo que permite kernels dispersos con carga balanceada.

## Casos de uso

- Investigación sobre poda de modelos: sirve como baseline reproducible para comparar técnicas de poda one-shot (SparseGPT modificado, EHWS) sobre una arquitectura de estado recurrente lineal, midiendo la degradación de perplejidad y precisión zero-shot.
- Estudio de kernels dispersos: al garantizar el mismo número de no nulos por fila en las 240 capas podadas, el checkpoint es útil para validar implementaciones de kernels semiestructurados con balanceo perfecto de carga por fila.
- Evaluación de la robustez de GatedDeltaNet a la compresión: permite analizar cómo afecta una poda del 50 % a una arquitectura recurrente lineal frente a transformers, usando los protocolos de perplejidad de ELSA en WikiText-2 y C4.
- Reproducción de experimentos: el método está documentado con detalle (calibración, semilla, orden de bloques, tiempo de cómputo), lo que facilita replicar el resultado en una sola GPU A100 de 40 GB.
- Docencia y divulgación: ejemplo compacto (0,8 GB) de flujo completo de poda one-shot con `fasterprune` sobre un modelo no-OPT/no-LLaMA, ya que el autor tuvo que escribir el recorrido de capas.
- Pruebas de integración con `flash-linear-attention`: útil para verificar que la carga con `AutoModelForCausalLM.from_pretrained` y `import fla` funciona correctamente en entornos de desarrollo.
- Benchmarking de eficiencia en inferencia: comparar latencia y throughput de este checkpoint disperso frente al modelo denso base en hardware con soporte de dispersión.

## Benchmarks y rendimiento

Perplejidad según el protocolo de evaluación de ELSA (conjuntos de test WikiText-2 y C4, fp16):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 16,42 | 19,94 |
| Este modelo (50 % dispersión) | 20,09 | 22,98 |

Precisión zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2645 | 0,2372 |
| arc_easy | 0,6023 | 0,5631 |
| boolq | 0,5985 | 0,6208 |
| hellaswag | 0,3461 | 0,3266 |
| openbookqa | 0,2300 | 0,1900 |
| rte | 0,5162 | 0,4946 |
| winogrande | 0,5036 | 0,5178 |
| **Media** | 0,4373 | **0,4214** |

La dispersión medida sobre los pesos finales es 0,5000 en las 240 capas podadas, con el mismo número de no nulos por fila en todas ellas.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 0,8 GB en safetensors (bfloat16), por lo que la inferencia en precisión completa requiere aproximadamente 1 GB de VRAM más el overhead de activaciones y el estado recurrente; en fp16 o bfloat16 cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; el autor realizó la poda en una A100 de 40 GB, pero la inferencia no requiere ese hardware.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores, e incluso en GPUs de gama baja.
- Opciones de despliegue: no se documentan explícitamente; la carga indicada por el autor es `AutoModelForCausalLM.from_pretrained` con `flash-linear-attention` instalado. No hay confirmación de soporte en vLLM, llama.cpp, Ollama o TGI, y la naturaleza recurrente lineal de la arquitectura hace improbable el soporte directo en muchos de esos motores sin adaptaciones.
- Latencia y throughput: no disponibles. La ventaja teórica de la dispersión semiestructurada con balance por fila es un mayor aprovechamiento de kernels dispersos, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (SparseGPT 50 %, per-row) | 399,5 M | no disponible | no disponible | Hugging Face (ikimyaii) | Poda one-shot, 50 % dispersión, perplejidad C4 22,98 |
| m-a-p/340M-20B-GatedDeltaNet-pure-baseline | ~340 M (nominal) | no disponible | no disponible | Hugging Face (m-a-p) | Modelo denso base, perplejidad C4 19,94 |
| Modelos EHWS del mismo autor | no disponible | no disponible | no disponible | Hugging Face (ikimyaii) | Referencia declarada del autor; este modelo es su baseline |

No se dispone de datos suficientes sobre modelos comparables de terceros (mismo tamaño y misma tarea) en la información proporcionada; la comparación se limita al modelo base denso y a los modelos EHWS mencionados por el autor.

## Limitaciones y advertencias

- Degradación por poda: la perplejidad en WikiText-2 sube de 16,42 a 20,09 (+22,3 %) y en C4 de 19,94 a 22,98 (+15,2 %); la media zero-shot cae de 0,4373 a 0,4214. La poda one-shot sin reentrenamiento implica una pérdida de calidad medible.
- Tamaño reducido: con ~340-400 M de parámetros, la calidad general es limitada frente a modelos de mayor escala; no es adecuado para tareas que exijan razonamiento complejo.
- Riesgo de alucinación: no evaluado en la información disponible; como todo modelo de lenguaje pequeño, es previsible que alucine con facilidad, pero no hay mediciones.
- Sesgos conocidos: no documentados; el corpus de entrenamiento del modelo base no se detalla en la información proporcionada.
- Idiomas: no se especifica qué idiomas soporta ni la composición lingüística del entrenamiento.
- Licencia: no disponible; no puede asumirse uso comercial sin verificar la licencia del modelo base y de este checkpoint.
- Dependencia técnica: requiere `flash-linear-attention` para cargarse; no se garantiza compatibilidad con motores de inferencia estándar.
- Uso previsto: es un baseline de investigación, no un modelo de producción; el autor lo presenta explícitamente como referencia para sus modelos EHWS.
- Advertencia sobre la model card: el contenido citado proviene del autor y debe tratarse como referencia, no como instrucciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/GatedDeltaNet-340M-semi-structured-SparseGPT-50pct
- Modelo base: https://huggingface.co/m-a-p/340M-20B-GatedDeltaNet-pure-baseline
- Repositorio `flash-linear-attention`: no disponible en la información proporcionada
- Repositorio `fasterprune`: no disponible en la información proporcionada
- Paper de SparseGPT: no disponible en la información proporcionada
- Protocolo de evaluación de ELSA: no disponible en la información proporcionada
