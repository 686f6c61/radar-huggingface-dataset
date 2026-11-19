# ikimyaii/HGRN-340M-semi-structured-Wanda-90pct

## Resumen

HGRN-340M-semi-structured-Wanda-90pct es un artefacto de investigación publicado por el usuario `ikimyaii` en Hugging Face: se trata del modelo base `m-a-p/340M-20B-HGRN-pure-baseline` podado de forma one-shot (sin reentrenamiento) al 90 % de esparsidad semi-estructurada mediante el código oficial de Wanda. El modelo base es un transformer de tipo HGRN (Hierarchically Gated Recurrent Network, una arquitectura lineal-recurrente) con 341.148.672 parámetros, entrenado supuestamente sobre 20B tokens según indica el nombre del checkpoint original.

El propósito del artefacto no es ofrecer un modelo utilizable en producción, sino servir como referencia o baseline para comparar técnicas de poda más elaboradas (los "modelos EHWS" que el autor menciona en su propia model card). La poda afecta a todas las capas lineales dentro de los bloques; los embeddings y la `lm_head` permanecen densos. La esparsidad medida sobre los pesos finales es de 0,8995 y cada fila de cada capa podada conserva exactamente el mismo número de pesos no nulos (168 capas verificadas), lo que garantiza un balanceo perfecto del trabajo por fila.

La relevancia de esta ficha es fundamentalmente metodológica: documenta qué ocurre cuando se aplica Wanda al 90 % sobre un modelo pequeño de arquitectura no estándar sin reentrenamiento posterior. Los resultados son catastróficos en perplejidad (de 21,96 a 6622,99 en WikiText-2), lo que convierte al modelo en una advertencia práctica sobre los límites de la poda one-shot agresiva en modelos de menos de 1B parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | HGRN (Hierarchically Gated Recurrent Network), transformer lineal-recurrente |
| Parámetros totales | 341.148.672 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el calibrado usó secuencias de 2.048 tokens) |
| Tipos de cuantización | no disponible (pesos en bfloat16 en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Esparsidad | 0,8995 semi-estructurada (por fila, mismo número de no nulos) |
| Capas podadas | todas las lineales dentro de los bloques (168 capas); embeddings y lm_head densos |
| Modelo base | m-a-p/340M-20B-HGRN-pure-baseline |
| Tamaño del repo | 0,7 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del checkpoint base `m-a-p/340M-20B-HGRN-pure-baseline`, un HGRN de 340M parámetros. HGRN sustituye la atención cuadrática por recurrencia lineal con puertas jerárquicas, lo que reduce el coste computacional en secuencias largas. El nombre del checkpoint base sugiere un entrenamiento sobre 20B tokens, aunque la model card del artefacto podado no aporta detalles sobre la composición del dataset ni sobre si hubo fases de RLHF o DPO.

La innovación de este artefacto no está en el entrenamiento sino en el proceso de poda. Se aplicó el código oficial de Wanda (commit `locuslab/wanda@8e8fc87`, rama unstructured, `use_variant=False`), que elimina en cada fila los pesos con menor producto `|W| * sqrt(||X||)`. El calibrado usó 128 secuencias de C4 de 2.048 tokens con semilla 0, y las capas se podaron en orden, recalibrando cada bloque sobre las salidas de los bloques ya podados. Los pesos se podaron en bfloat16 y el proceso completo tardó 0,8 minutos en una A100 de 40 GB. No hubo reentrenamiento ni destilación posterior: es poda one-shot pura.

## Capacidades

- Generación de texto autoregresiva (heredada del modelo base, aunque severamente degradada por la poda).
- Razonamiento y respuesta a preguntas de opción múltiple, con caída drástica de precisión respecto al denso.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de capacidades de agente ni de razonamiento multi-paso.
- Capacidades multilingües: no disponibles (no declaradas).
- No dispone de modo thinking, visión ni audio.
- La única capacidad "especial" es su condición de baseline de esparsidad: sirve para medir el impacto de la poda Wanda al 90 % sobre HGRN.

## Casos de uso

- Baseline de investigación en poda: usar este modelo como referencia inferior frente a técnicas de poda con recuperación (destilación, fine-tuning post-poda o los modelos EHWS del mismo autor) para cuantificar la ganancia de cada método.
- Estudio de degradación por esparsidad: analizar la relación entre esparsidad y perplejidad en arquitecturas lineales-recurrentes, comparando contra el denso en WikiText-2 y C4 con el protocolo de ELSA.
- Validación de kernels dispersos: al tener todas las filas el mismo número de no nulos (168 capas verificadas), es un banco de pruebas ideal para kernels semi-estructurados que explotan balanceo perfecto por fila.
- Reproducibilidad de Wanda: permite replicar el pipeline oficial de Wanda sobre una arquitectura distinta de OPT/LLaMA, ya que el autor reescribió el recorrido de capas pero conservó las matemáticas oficiales.
- Docencia sobre compresión de modelos: ejemplo tangible de por qué la poda one-shot al 90 % sin recuperación es inviable en modelos pequeños.
- Pruebas de integración con `flash-linear-attention`: el modelo requiere `import fla` para cargarse con `AutoModelForCausalLM.from_pretrained`, por lo que sirve para validar esa ruta de carga en entornos de investigación.

## Benchmarks y rendimiento

Perplejidad con el protocolo de evaluación de ELSA (WikiText-2 / C4, fp16):

| Métrica | Denso | Este modelo |
|---|---|---|
| WikiText-2 (ppl) | 21,96 | 6622,99 |
| C4 (ppl) | 21,94 | 4559,11 |

Precisión zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2628 | 0,2261 |
| arc_easy | 0,6153 | 0,2744 |
| boolq | 0,6028 | 0,3783 |
| hellaswag | 0,3423 | 0,2581 |
| openbookqa | 0,2380 | 0,1320 |
| rte | 0,5126 | 0,5271 |
| winogrande | 0,5059 | 0,5028 |
| Media | 0,4400 | 0,3284 |

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, unos 0,7 GB de pesos; con overhead de activaciones y caché, cabe holgadamente en cualquier GPU con 4 GB o más.
- GPU recomendadas: A100 40GB (usada para la poda, 0,8 minutos), H100, RTX 4090, RTX 3090; también válidas GPUs de gama media como RTX 3060 o T4.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 4 GB de VRAM; incluso en CPU es viable para pruebas puntuales.
- Opciones de despliegue: `AutoModelForCausalLM.from_pretrained` con `flash-linear-attention` instalado (`import fla`). No hay evidencia de soporte en vLLM, llama.cpp, Ollama ni TGI, dado que HGRN no es una arquitectura transformer estándar y los pesos están en bfloat16 sin versiones GGUF publicadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Esparsidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HGRN-340M-semi-structured-Wanda-90pct | 341M | no disponible | 90 % semi-estructurada | no disponible | Hugging Face |
| m-a-p/340M-20B-HGRN-pure-baseline (denso) | 341M | no disponible | 0 % | no disponible | Hugging Face |
| Modelos EHWS del mismo autor | no disponible | no disponible | no disponible | no disponible | Hugging Face (referenciados en la model card) |

La comparativa relevante es contra el propio checkpoint denso del que deriva: misma arquitectura, mismos parámetros y mismo tokenizador, con una diferencia de perplejidad de más de dos órdenes de magnitud. No se dispone de datos de otros modelos comparables de poda semi-estructurada en HGRN.

## Limitaciones y advertencias

- Degradación severa: la perplejidad en WikiText-2 pasa de 21,96 a 6622,99 y la media zero-shot cae de 0,4400 a 0,3284; el modelo no es apto para uso generativo real.
- Sesgos conocidos: no documentados, pero hereda los del checkpoint base, que tampoco los detalla.
- Riesgo de alucinación: extremadamente alto; con perplejidad de miles, la generación es prácticamente incoherente.
- Limitaciones de contexto e idioma: no declaradas; el calibrado usó 2.048 tokens, pero no se especifica la ventana efectiva del modelo.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede confirmar el uso comercial.
- Dependencia de `flash-linear-attention`: sin `import fla` la carga con `AutoModelForCausalLM` falla.
- No es un modelo de producción: es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta.
- La poda se aplicó con el código oficial de Wanda pero con un recorrido de capas reescrito por el autor; la reproducibilidad exacta depende de ese código no publicado en el repo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/HGRN-340M-semi-structured-Wanda-90pct
- Modelo base: https://huggingface.co/m-a-p/340M-20B-HGRN-pure-baseline
- Código oficial de Wanda: https://github.com/locuslab/wanda (commit `8e8fc87`)
- Librería flash-linear-attention: no disponible (referenciada en la model card como requisito, sin URL explícita)
