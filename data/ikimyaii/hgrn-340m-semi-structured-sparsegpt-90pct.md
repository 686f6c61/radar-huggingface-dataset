# ikimyaii/HGRN-340M-semi-structured-SparseGPT-90pct

## Resumen

HGRN-340M-semi-structured-SparseGPT-90pct es un checkpoint de investigación publicado por el usuario ikimyaii en Hugging Face. Consiste en el modelo base m-a-p/340M-20B-HGRN-pure-baseline (una arquitectura HGRN, Hierarchically Gated Recurrent Network, de 341 millones de parámetros) podado de forma one-shot, sin reentrenamiento, hasta una densidad del 10 % (es decir, un 90 % de dispersión semi-estructurada) mediante una variante propia de SparseGPT implementada sobre la herramienta oficial `fasterprune`.

El modelo no es un modelo listo para producción: es un baseline experimental. El autor lo publica como referencia para comparar con los modelos EHWS de su misma cuenta. La innovación metodológica reside en una restricción por fila dentro de bloques de 128 columnas, de modo que cada fila de cada capa lineal podada conserva exactamente el mismo número de pesos no nulos, lo que equilibra la carga de trabajo por fila en kernels dispersos.

El resultado es un modelo con calidad severamente degradada: la perplejidad en WikiText-2 pasa de 21,96 a 3287,46 y la precisión media zero-shot de lm-evaluation-harness cae de 0,4400 a 0,3252. Es relevante únicamente como punto de comparación metodológico en investigación sobre poda de redes neuronales, no como modelo de uso general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | HGRN (Hierarchically Gated Recurrent Network) |
| Parámetros totales | 341.148.672 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en bfloat16; repo de 0,7 GB) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | m-a-p/340M-20B-HGRN-pure-baseline |
| Dispersión medida | 0,9003 (90,03 %) |
| Capas podadas | 168 capas lineales en bloque |
| Embeddings y lm_head | densos (no podados) |

## Arquitectura y entrenamiento

La arquitectura subyacente es HGRN, una red recurrente con compuertas jerárquicas que sustituye la atención por una recurrencia lineal, lo que le da coste lineal en longitud de secuencia. El modelo base fue entrenado sobre 20B tokens según indica el nombre del checkpoint original (m-a-p/340M-20B-HGRN-pure-baseline). No se dispone de detalles adicionales sobre la composición del dataset ni sobre si hubo RLHF o DPO.

El proceso de poda es one-shot, sin reentrenamiento posterior. Se calibró con el cargador oficial sobre 128 secuencias de C4 de 2048 tokens con semilla 0. Los bloques se podan en orden y cada bloque se calibra sobre las salidas de los bloques ya podados anteriores, siguiendo el esquema de los drivers oficiales. El recorrido de capas es código nuevo del autor (los drivers oficiales solo soportan OPT y LLaMA), mientras que la matemática de poda es la del código oficial de SparseGPT. Los pesos se podaron en bfloat16 y el proceso completo tardó 1,6 minutos en una A100 de 40 GB.

La innovación respecto a SparseGPT estándar es la máscara: dentro de cada bloque de 128 columnas, cada fila poda el mismo número de sus entradas de menor valor según la métrica w² / [H⁻¹]_jj², que es la regla N:M de SparseGPT con M igual al tamaño del bloque. Así, todas las filas de todas las capas podadas tienen el mismo número de no nulos (verificado sobre 168 capas), lo que equilibra perfectamente el trabajo por fila en kernels dispersos. Es la misma restricción que aplica EHWS.

## Capacidades

- Generación de texto autoregresiva heredada del modelo base HGRN, con calidad muy degradada por la poda.
- Razonamiento y respuesta a preguntas de opción múltiple a un nivel muy por debajo del modelo denso (precisión media 0,3252 frente a 0,4400).
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-paso.
- Capacidades multilingües no documentadas.
- No dispone de modo thinking, visión ni audio.
- Requiere `flash-linear-attention` (`import fla`) instalado para cargarse con `AutoModelForCausalLM.from_pretrained(...)`.

## Casos de uso

- Baseline de comparación en investigación sobre poda: sirve para medir la pérdida de calidad de una variante de SparseGPT con restricción por fila frente a otros métodos de poda sobre el mismo modelo base HGRN de 340M.
- Estudio de kernels dispersos: al tener todas las filas el mismo número de no nulos en las 168 capas podadas, permite validar implementaciones de kernels semi-estructurados con carga por fila perfectamente balanceada.
- Reproducción metodológica: el autor documenta calibración, semilla, orden de bloques y tiempos, lo que facilita reproducir el experimento en una sola A100 de 40 GB en menos de dos minutos.
- Análisis de degradación por capas: comparando la perplejidad y las métricas zero-shot con el denso se puede estudiar qué capas o tareas toleran mejor una dispersión del 90 % sin reentrenamiento.
- Docencia sobre poda one-shot: ejemplo concreto y reproducible de cómo una poda agresiva sin fine-tuning destruye la calidad del modelo, útil para ilustrar el papel del reentrenamiento.
- Punto de partida para fine-tuning posterior: el checkpoint podría servir como inicialización dispersa para experimentos de recuperación de calidad mediante reentrenamiento, aunque el autor no lo documenta.

## Benchmarks y rendimiento

Perplejidad con el protocolo de evaluación de ELSA (WikiText-2 y C4, fp16):

| Métrica | Denso | Este modelo |
|---|---|---|
| Perplejidad WikiText-2 | 21,96 | 3287,46 |
| Perplejidad C4 | 21,94 | 2009,08 |

Precisión zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2628 | 0,2227 |
| arc_easy | 0,6153 | 0,2702 |
| boolq | 0,6028 | 0,3783 |
| hellaswag | 0,3423 | 0,2590 |
| openbookqa | 0,2380 | 0,1280 |
| rte | 0,5126 | 0,5271 |
| winogrande | 0,5059 | 0,4909 |
| Media | 0,4400 | 0,3252 |

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 0,7 GB en safetensors; en bfloat16 son aproximadamente 0,68 GB de pesos, por lo que cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU moderna; el autor realizó la poda en una A100 de 40 GB, pero la inferencia no requiere esa clase de hardware.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: carga mediante `AutoModelForCausalLM.from_pretrained` con `flash-linear-attention` instalado. No hay información sobre compatibilidad con vLLM, llama.cpp, Ollama o TGI; la dispersión semi-estructurada requiere kernels específicos para aprovecharse.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad (media zero-shot) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (HGRN-340M, 90 % sparse) | 341M | no disponible | 0,3252 | no disponible | Hugging Face |
| m-a-p/340M-20B-HGRN-pure-baseline (denso) | 341M | no disponible | 0,4400 | no disponible | Hugging Face |
| SparseGPT estándar sobre HGRN-340M | 341M | no disponible | no disponible | no disponible | no disponible en la información proporcionada |
| Modelos EHWS del mismo autor | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

## Limitaciones y advertencias

- Degradación severa de calidad: la perplejidad en WikiText-2 se multiplica por más de 149 respecto al denso (21,96 a 3287,46) y la media zero-shot cae 0,1148 puntos absolutos.
- No es un modelo para producción: el propio autor lo describe como baseline para comparar con sus modelos EHWS.
- Riesgo elevado de alucinación y de texto incoherente dada la perplejidad registrada.
- Sesgos conocidos: no documentados, pero hereda los del modelo base y los puede amplificar la poda.
- Limitaciones de contexto e idioma: no documentadas.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución.
- Dependencia de `flash-linear-attention` para la carga; sin esa librería el modelo no se instancia correctamente.
- La ventaja de eficiencia de la dispersión solo se materializa con kernels que exploten la estructura por fila; en hardware estándar los pesos dispersos pueden no aportar aceleración real.
- Embeddings y lm_head permanecen densos, por lo que el ahorro de memoria es menor que el 90 % nominal de las capas lineales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/HGRN-340M-semi-structured-SparseGPT-90pct
- Modelo base: https://huggingface.co/m-a-p/340M-20B-HGRN-pure-baseline
- Repositorio `fasterprune` (mencionado en la model card, sin URL en la información disponible): no disponible
- Paper de SparseGPT (mencionado, sin URL en la información disponible): no disponible
- Paper de HGRN (mencionado, sin URL en la información disponible): no disponible
