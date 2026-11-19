# ikimyaii/GatedDeltaNet-1.3B-semi-structured-Wanda-90pct

## Resumen

GatedDeltaNet-1.3B-semi-structured-Wanda-90pct es una variante podada al 90 % del modelo base m-a-p/1.3B-100B-GatedDeltaNet-pure, publicado por el usuario ikimyaii en Hugging Face. No se trata de un modelo entrenado para uso general, sino de un artefacto de investigación: una línea base (baseline) para estudiar poda de redes neuronales sobre arquitecturas híbridas basadas en Gated DeltaNet. La poda se aplica en un solo paso (one-shot), sin reentrenamiento posterior, mediante el algoritmo Wanda usando el código oficial de locuslab.

El modelo conserva la arquitectura del base: un transformer con capas Gated DeltaNet, que requieren la librería flash-linear-attention para cargarse. Tiene 1.466.343.808 parámetros totales (aproximadamente 1,3 mil millones) y un tamaño de repositorio de 2,9 GB en formato safetensors. La poda afecta a todas las capas lineales internas de los bloques, mientras que los embeddings y la lm_head permanecen densos, con una dispersión medida de 0,8999.

Su relevancia es metodológica, no práctica: demuestra que una poda Wanda al 90 % sin reentrenamiento destruye la calidad del modelo en tareas de lenguaje. La perplejidad en WikiText-2 pasa de 10,31 a 1993,58 y la precisión media zero-shot cae de 0,5123 a 0,3291. Sirve como referencia para comparar técnicas de poda más sofisticadas (los modelos EHWS del mismo autor) sobre arquitecturas Gated DeltaNet.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas Gated DeltaNet (requiere flash-linear-attention) |
| Parametros totales | 1.466.343.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el calibrado usa secuencias de 2.048 tokens, pero no se especifica el contexto máximo del modelo) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base m-a-p/1.3B-100B-GatedDeltaNet-pure emplea una arquitectura de transformer con capas Gated DeltaNet, un mecanismo de atención lineal con compuertas que se apoya en la implementación flash-linear-attention. El nombre del base sugiere un entrenamiento sobre 100B tokens, aunque la información disponible no detalla la composición del dataset ni si hubo fases de RLHF o DPO.

Sobre ese base, este artefacto aplica poda Wanda one-shot al 90 % de dispersión sin reentrenamiento. El procedimiento usa el código oficial de locuslab/wanda (commit 8e8fc87, rama unstructured, `use_variant=False`), que elimina en cada fila los pesos con menor producto `|W| * sqrt(||X||)`. La calibración emplea 128 secuencias de C4 de 2.048 tokens con semilla 0, podando los bloques en orden y calibrando cada bloque sobre las salidas de los bloques ya podados. La poda se realizó en bfloat16 y tardó 1,5 minutos en una A100 de 40 GB. Todas las capas lineales internas de los bloques están podadas; embeddings y lm_head quedan densos. La dispersión medida sobre los pesos finales es 0,8999 y cada fila de cada capa podada tiene el mismo número de no ceros (verificado en 240 capas), lo que equilibra la carga por fila.

## Capacidades

- Generación de texto autoregresiva mediante `AutoModelForCausalLM.from_pretrained`, siempre que se instale `flash-linear-attention` (`import fla`).
- Razonamiento y conocimiento general muy degradados: la poda al 90 % sin reentrenamiento reduce drásticamente la calidad (ver benchmarks).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; la calidad tras la poda lo hace inviable en la práctica.
- Capacidades multilingües: no documentadas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Interés como referencia de investigación: permite reproducir y comparar experimentos de poda sobre Gated DeltaNet.

## Casos de uso

- Línea base para investigación en poda: usar este modelo como referencia de "poda Wanda ingenua al 90 %" frente a técnicas con reentrenamiento o poda estructurada, midiendo perplejidad y zero-shot con el mismo protocolo (ELSA para perplejidad, lm-evaluation-harness para zero-shot).
- Estudio de degradación por dispersión: comparar la caída de rendimiento entre distintos niveles de dispersión (por ejemplo, 50 %, 70 %, 90 %) sobre la misma arquitectura Gated DeltaNet para caracterizar su robustez.
- Validación de implementaciones de poda: comprobar que una reimplementación propia de Wanda reproduce la dispersión 0,8999 y las métricas publicadas sobre estos mismos pesos.
- Análisis de eficiencia de kernels dispersos: los pesos podados con igual número de no ceros por fila permiten evaluar kernels semi-estructurados con carga balanceada, sin preocuparse por desequilibrios.
- Docencia y divulgación: ejemplo didáctico de por qué la poda agresiva sin reentrenamiento no es suficiente, con cifras concretas de perplejidad y precisión.
- Reproducibilidad de experimentos: el modelo permite verificar resultados de papers sobre Gated DeltaNet y compresión de modelos sin necesidad de repetir el proceso de poda (que requiere GPU y calibración).

No se recomienda su uso en producción para generación de texto, atención al cliente, código u otras tareas reales: la calidad es demasiado baja.

## Benchmarks y rendimiento

Perplejidad con el protocolo de evaluación de ELSA (WikiText-2 y C4, fp16):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 10,31 | 13,76 |
| Este modelo (90 % Wanda) | 1993,58 | 950,20 |

Precisión zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,3763 | 0,2014 |
| arc_easy | 0,7222 | 0,2854 |
| boolq | 0,6159 | 0,3783 |
| hellaswag | 0,4629 | 0,2603 |
| openbookqa | 0,2920 | 0,1460 |
| rte | 0,4982 | 0,5235 |
| winogrande | 0,6188 | 0,5091 |
| Media | 0,5123 | 0,3291 |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan aproximadamente 2,9 GB; con overhead de activaciones y caché, se estima un mínimo de 4-6 GB de VRAM, aunque no se documenta una cifra oficial.
- GPU recomendadas: el autor realizó la poda en una A100 de 40 GB, pero la inferencia del modelo podado debería caber en GPUs consumer con suficiente VRAM.
- GPU consumer: probablemente cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, siempre que flash-linear-attention sea compatible con la arquitectura de la GPU.
- Opciones de despliegue: la carga requiere `flash-linear-attention` y `AutoModelForCausalLM`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI. Dado que no hay pesos GGUF, llama.cpp y Ollama no son opciones directas sin conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Este modelo (Wanda 90 %) | 1,47 B | no disponible | no disponible | Podado one-shot, sin reentrenamiento |
| m-a-p/1.3B-100B-GatedDeltaNet-pure (base denso) | ~1,3 B | no disponible | no disponible | Modelo base de referencia |
| Modelos EHWS del mismo autor | no disponible | no disponible | no disponible | Variantes con poda más avanzada, mencionadas como comparación en la model card |

No se dispone de datos suficientes para comparar con alternativas de otros autores en la misma categoría (modelos de ~1,3 B con atención lineal o poda agresiva).

## Limitaciones y advertencias

- Calidad severamente degradada: perplejidad en WikiText-2 de 1993,58 frente a 10,31 del denso; precisión media zero-shot de 0,3291 frente a 0,5123. No es apto para uso real en generación de texto.
- Poda sin reentrenamiento: no hay fase de recuperación de pesos, por lo que la pérdida de rendimiento es esperable y está documentada.
- Dependencia de flash-linear-attention: sin esa librería instalada, la carga del modelo falla.
- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; hay que consultar la licencia del modelo base m-a-p/1.3B-100B-GatedDeltaNet-pure antes de cualquier uso.
- Idiomas no documentados: no se puede garantizar un comportamiento multilingüe ni siquiera en el modelo denso.
- Riesgo de alucinación: elevado, agravado por la degradación de la poda; las salidas pueden ser incoherentes.
- Contexto máximo no documentado: el calibrado usa 2.048 tokens, pero no se confirma la ventana real del modelo.
- Artefacto de investigación: descargas 0 y likes 0 en el momento de la consulta; no hay validación comunitaria independiente.
- Sesgos: no documentados; se heredan los del modelo base, que tampoco los detalla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/GatedDeltaNet-1.3B-semi-structured-Wanda-90pct
- Modelo base: https://huggingface.co/m-a-p/1.3B-100B-GatedDeltaNet-pure
- Código oficial de Wanda: https://github.com/locuslab/wanda (commit 8e8fc87)
- Librería flash-linear-attention: no se proporciona URL en la información disponible; se instala como paquete `fla`.
- Protocolo de evaluación ELSA: no se proporciona URL en la información disponible.
- lm-evaluation-harness: no se proporciona URL en la información disponible.
