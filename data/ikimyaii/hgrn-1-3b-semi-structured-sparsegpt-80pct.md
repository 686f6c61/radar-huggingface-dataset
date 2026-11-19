# ikimyaii/HGRN-1.3B-semi-structured-SparseGPT-80pct

## Resumen

HGRN-1.3B-semi-structured-SparseGPT-80pct es un modelo de lenguaje derivado de fla-hub/hgrn-1.3B-100B, publicado por el usuario ikimyaii en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una poda one-shot (sin reentrenamiento) aplicada sobre el modelo base mediante una variante propia de SparseGPT denominada "per-row constraint", implementada sobre la herramienta oficial `fasterprune`. El resultado es un checkpoint con una esparsidad semiestructurada del 80 % (0,7999 medido sobre los pesos finales) en todas las capas lineales internas de los bloques, manteniendo embeddings y `lm_head` densos.

El modelo base, HGRN-1.3B-100B, pertenece a la familia HGRN (Hierarchically Gated Recurrent Neural Network), una arquitectura recurrente con compuertas jerárquicas implementada en la librería `flash-linear-attention`. El checkpoint podado conserva 1.364.396.032 parámetros totales (el mismo recuento que el modelo denso, ya que la poda no elimina parámetros del tensor, solo pone a cero un subconjunto de pesos) y ocupa 2,7 GB en el repositorio.

La relevancia de esta ficha es doble: por un lado, documenta un experimento de poda extrema con una degradación de calidad muy severa (perplejidad en WikiText-2 que pasa de 11,81 a 10.042,34), lo que lo convierte en una referencia útil para estudiar los límites de SparseGPT a alta esparsidad; por otro, el autor lo presenta explícitamente como baseline para sus modelos EHWS. No es un modelo apto para producción ni para uso general: es un artefacto de investigación sobre compresión de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HGRN (red neuronal recurrente con compuertas jerárquicas), implementada en `flash-linear-attention` |
| Parametros totales | 1.364.396.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base se calibro con secuencias de 2.048 tokens) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 durante la poda; el repositorio solo contiene safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base fla-hub/hgrn-1.3B-100B: una red recurrente con compuertas jerárquicas (HGRN) del ecosistema `flash-linear-attention`, pensada como alternativa lineal a la atención cuadrática de los transformers. Sobre ese checkpoint no se realiza ningún entrenamiento adicional: la intervención consiste en una poda one-shot con SparseGPT en su variante "per-row constraint". La modificación respecto al SparseGPT publicado afecta únicamente a la máscara: dentro de cada bloque de 128 columnas, cada fila poda el mismo número de entradas de menor magnitud según la regla `w^2 / [H^-1]_jj^2`, de modo que todas las filas acaban con idéntico número de no ceros (la misma restricción que emplea EHWS). Se podan todas las capas lineales dentro de los bloques; embeddings y `lm_head` permanecen densos.

El procedimiento de calibración usa el cargador oficial con 128 secuencias de C4 de 2.048 tokens y semilla 0. Los bloques se podan en orden y cada bloque se calibra sobre las salidas de los bloques ya podados anteriores, siguiendo los drivers oficiales. El recorrido de capas es código nuevo (los drivers oficiales solo soportan OPT y LLaMA), mientras que la matemática de poda es la del código oficial. Los pesos se podaron en bfloat16 y el proceso completo tardó 3,6 minutos en una única A100 de 40 GB. La esparsidad medida sobre los pesos finales es de 0,7999 y se verificó que las 168 capas podadas tienen el mismo número de no ceros por fila, lo que garantiza un reparto de trabajo perfectamente equilibrado a nivel de fila.

## Capacidades

- Generación de texto autoregresiva: el modelo conserva la interfaz `AutoModelForCausalLM`, por lo que puede generar texto, pero la poda al 80 % degrada gravemente la calidad (véase la sección de benchmarks).
- Razonamiento y conocimiento factual: solo en la medida en que sobrevive tras la poda; las métricas zero-shot caen entre 4 y 29 puntos porcentuales según la tarea.
- Código y matemáticas: no disponible; no se han publicado evaluaciones específicas de HumanEval, GSM8K ni similares.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Agentes y razonamiento multi-paso: no disponible; no se documenta soporte.
- Capacidades multilingües: no disponible; no se especifican idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Eficiencia estructural: todas las filas de las 168 capas podadas tienen el mismo número de no ceros, lo que permite implementaciones con carga por fila balanceada, aunque el checkpoint se distribuye en formato denso (safetensors) y no como formato comprimido disperso.

## Casos de uso

- Baseline de investigación en poda: sirve como referencia cuantitativa para comparar variantes de poda (por ejemplo, los modelos EHWS del mismo autor) bajo la misma esparsidad del 80 % y el mismo protocolo de calibración.
- Estudio del límite de SparseGPT a alta esparsidad: la caída de perplejidad de 11,81 a 10.042,34 en WikiText-2 permite analizar empíricamente hasta dónde aguanta la poda one-shot sin reentrenamiento en arquitecturas recurrentes lineales.
- Validación de implementaciones de poda por fila: al estar verificada la uniformidad de no ceros por fila en las 168 capas, puede usarse para comprobar que una herramienta de poda reproduce exactamente la misma máscara.
- Pruebas de kernels dispersos: útil para validar kernels que explotan el patrón de fila uniforme (mismo número de no ceros por fila) sin necesidad de datos de alta calidad, ya que el objetivo es medir rendimiento, no precisión.
- Reproducibilidad de experimentos: el método documenta calibración, semilla, hardware y tiempo (3,6 minutos en A100 40 GB), lo que facilita replicar el pipeline en otras arquitecturas.
- Docencia sobre compresión de modelos: ejemplo claro y medible de que la poda no estructurada al 80 % sin reentrenamiento puede destruir la calidad del modelo, útil para ilustrar el compromiso entre esparsidad y rendimiento.

## Benchmarks y rendimiento

Perplejidad con el protocolo de evaluación de ELSA (conjuntos de test WikiText-2 y C4, fp16):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 11,81 | 16,09 |
| Este modelo (80 % esparsidad) | 10.042,34 | 5.588,53 |

Precisión zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2432 | 0,2159 |
| arc_easy | 0,5644 | 0,2748 |
| boolq | 0,5758 | 0,4269 |
| hellaswag | 0,3828 | 0,2549 |
| openbookqa | 0,2300 | 0,1560 |
| rte | 0,5379 | 0,4982 |
| winogrande | 0,5288 | 0,4799 |
| Media | 0,4376 | 0,3295 |

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 2,7 GB en safetensors; en bfloat16 o fp16 la inferencia requiere aproximadamente 2,7 GB de pesos más memoria para activaciones y caché, por lo que 4-6 GB de VRAM son suficientes en la práctica.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM; el autor realizó la poda en una A100 de 40 GB, pero esa capacidad no es necesaria para inferencia.
- GPU de consumo: cabe holgadamente en RTX 3060 (12 GB), RTX 4060 Ti (8/16 GB), RTX 4070, RTX 4080 y RTX 4090. También en GPUs de 6-8 GB con margen ajustado.
- Opciones de despliegue: al ser un modelo de la familia `flash-linear-attention`, requiere `import fla` y `flash-linear-attention` instalado para cargarse con `AutoModelForCausalLM.from_pretrained(...)`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; dado que el repositorio solo contiene safetensors y no hay GGUF, el despliegue en llama.cpp/Ollama no está soportado de forma nativa.
- Latencia y throughput: no disponible. El checkpoint es denso en almacenamiento (la esparsidad no reduce el tamaño del archivo ni acelera automáticamente la inferencia sin kernels específicos).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad (media zero-shot) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (HGRN-1.3B, 80 % sparsity) | 1,36 B | no disponible | 0,3295 | no disponible | Hugging Face, safetensors |
| fla-hub/hgrn-1.3B-100B (base denso) | 1,36 B | no disponible | 0,4376 | no disponible | Hugging Face |
| Modelos EHWS del mismo autor | no disponible | no disponible | no disponible | no disponible | Referenciados como comparación en la model card |

No se dispone de datos de benchmarks de los modelos EHWS ni de otros modelos comparables de la misma categoría (recurrentes lineales podados) en la información proporcionada.

## Limitaciones y advertencias

- Degradación severa de calidad: la perplejidad en WikiText-2 se multiplica por más de 800 (de 11,81 a 10.042,34) y la media zero-shot cae 10,8 puntos porcentuales (de 0,4376 a 0,3295). No es apto para uso en producción ni para tareas que requieran precisión.
- No es el SparseGPT publicado: la máscara modifica la regla original con una restricción por fila; los resultados no deben citarse como reproducción del método SparseGPT estándar.
- Poda sin reentrenamiento: no hay ajuste fino posterior, por lo que no se recupera la calidad perdida.
- Almacenamiento denso: el checkpoint no reduce el tamaño en disco (2,7 GB) ni acelera la inferencia sin kernels que exploten la esparsidad; la ventaja es estructural, no automática.
- Dependencia de `flash-linear-attention`: la carga requiere `import fla`; sin esa librería el modelo no funciona con `AutoModelForCausalLM`.
- Licencia no disponible: no se especifica licencia, lo que impide confirmar si el uso comercial está permitido. Debe consultarse con el autor antes de cualquier uso más allá de investigación.
- Idiomas no especificados: no se documenta qué idiomas soporta el modelo base ni el podado.
- Riesgo de alucinación: no evaluado específicamente, pero la degradación general hace esperable una tasa elevada de generaciones incoherentes o incorrectas.
- Sesgos: no documentados; no se han publicado análisis de sesgo para este checkpoint.
- Contexto: no se especifica la longitud de contexto soportada; la calibración usó secuencias de 2.048 tokens, pero no se confirma que sea el límite del modelo.
- Artefacto de investigación: el autor lo describe como baseline para sus modelos EHWS, no como un modelo destinado a uso general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/HGRN-1.3B-semi-structured-SparseGPT-80pct
- Modelo base: https://huggingface.co/fla-hub/hgrn-1.3B-100B
- Librería flash-linear-attention: no disponible en la información proporcionada (referenciada como `flash-linear-attention` / `import fla`)
- Herramienta de poda `fasterprune`: no disponible en la información proporcionada (referenciada como herramienta oficial)
- Paper de SparseGPT: no disponible en la información proporcionada
- Protocolo de evaluación ELSA: no disponible en la información proporcionada
- Paper de HGRN: no disponible en la información proporcionada
