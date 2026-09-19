# Jeesup/svd-safety-llama2_7b_chat_up_basis_coeff_jbbmix_finetuned_keep_0p60

## Resumen

Este repositorio contiene una versión comprimida de `meta-llama/Llama-2-7b-chat-hf` obtenida con la técnica Basis Sharing, usando el código de referencia de TUDa-HWAI. El autor, Jeesup, elimina el 40 % de los parámetros (conserva una fracción realizada de 0,5999) agrupando cada dos capas adyacentes para compartir una única base por tipo de peso, y después recupera parte de la capacidad perdida entrenando únicamente los coeficientes mediante LoRA. Los factores se pliegan de vuelta a las formas densas de Llama, por lo que el modelo se carga con `transformers` estándar y no requiere código de modelado propio; es un modelo de rango deficiente, no un modelo más pequeño en disco (6.738.415.616 parámetros y 13,5 GB de repositorio).

El interés del artefacto es experimental y está acotado a la seguridad: la celda mezcla en la calibración dos secuencias empaquetadas con los 100 comportamientos dañinos de JailbreakBench (el 0,78 % de los tokens de calibración) para comprobar si introducir datos de seguridad en esa fase preserva la conducta de rechazo tras la compresión. Es la variante `calibration_mix` de un estudio comparativo de compresores, y la propia model card advierte de que, a este ratio, la compresión degrada el rechazo y de que las métricas de seguridad de un modelo degenerado no son evidencia sobre alineación.

El resultado práctico es un modelo que rechaza en exceso: presenta tasas de sobre-rechazo del 38,96 % en XSTest-safe y del 54,37 % en OR-Bench-Hard-1K, con una tasa macro del 46,66 %, frente a una tasa de ataque exitoso (ASR) del 3,08 % en AdvBench y del 5,11 % en StrongREJECT. El repositorio no registra descargas ni valoraciones y su licencia es la Llama 2 Community License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama 2) con compresión Basis Sharing: SVD con blanqueado sobre pesos concatenados horizontalmente por grupo + LoRA sobre coeficientes, plegado a forma densa |
| Parametros totales | 6.738.415.616 (misma forma densa que Llama-2-7b; matriz de rango deficiente) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (heredada de `meta-llama/Llama-2-7b-chat-hf`) |
| Tipos de cuantizacion | no disponible: el repositorio solo publica safetensors; no se documentan versiones GGUF, AWQ, GPTQ ni bitsandbytes |
| Idiomas soportados | no disponible en la model card; el modelo base está optimizado principalmente para inglés |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors (13,5 GB de repositorio) |

## Arquitectura y entrenamiento

La compresión sigue el método Basis Sharing: cada grupo de dos capas adyacentes comparte una sola base por tipo de peso, obtenida mediante SVD con blanqueado de las matrices concatenadas horizontalmente. Los tipos compartidos son `v`, `k`, `q`, `up` y `gate`; `down` y `o` permanecen privados por capa. Se elimina el 40 % de los parámetros y se conserva el 60 % (fracción realizada exacta: 0,5999091746275906). La calibración usa 256 secuencias de WikiText-2 de 2048 tokens con semilla 42 —el código original fija la semilla 2023, aquí se calibra cada método con una sola semilla— más 2 secuencias empaquetadas con los 100 comportamientos dañinos de JailbreakBench (`jbb_harmful:2`, solo prompt y cabecera de asistente, sin respuesta).

La recuperación entrena exclusivamente los coeficientes con LoRA (r=8, alpha=16, 2 épocas, lr=0,0001, batch 64) sobre `yahma/alpaca-cleaned`, manteniendo las bases congeladas y bit a bit idénticas a las del modelo comprimido, de modo que cada peso conserva rango <= k y el presupuesto de parámetros se mantiene exacto tras la recuperación. El proceso es: SVD con blanqueado por grupo, LoRA sobre coeficientes con bases congeladas, fusión `C' = C + (alpha/r)BA` y plegado `W = C' @ B` a denso. No se trata del LoRA propio de Basis Sharing (wikitext, batch 1, solo q/v): se usa la receta alpaca del proyecto para todos los compresores, de forma que los datos de recuperación son constantes entre métodos. La codificación posicional usa las tablas rotatorias propias de `transformers` construidas desde la configuración del modelo, verificadas como idénticas a Llama estándar en float64 (base RoPE 1e4 / 5e5 / 1e6, escalado de llama3, grouped-query attention y sesgos de q/k/v).

## Capacidades

- Generación de texto conversacional en inglés, heredada de Llama-2-7b-chat, con la plantilla de chat del modelo base.
- Razonamiento de sentido común y comprensión lectora de nivel medio, medido en ARC-Easy, ARC-Challenge, HellaSwag, WinoGrande, OpenBookQA y PIQA.
- Resolución de problemas aritméticos y de opción múltiple básicos (MathQA), con rendimiento bajo (0,2429 en acc_norm).
- Rechazo de instrucciones dañinas, aunque degradado por la compresión y con un coste alto en falsos positivos sobre peticiones benignas.
- Capacidad de ser evaluado en protocolos de jailbreak (AdvBench, StrongREJECT con el clasificador `cais/HarmBench-Llama-2-13b-cls`).
- Tool calling: no disponible / no documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible / no documentado.
- Capacidades multilingües: no documentadas; el modelo base está orientado a inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre el compromiso entre compresión y alineación: el modelo sirve como celda experimental para medir si introducir datos de seguridad en la calibración preserva el rechazo tras eliminar el 40 % de los parámetros, comparando su ASR con el de otras celdas del mismo estudio.
- Evaluación de sobre-rechazo en modelos comprimidos: con tasas del 38,96 % (XSTest-safe) y 54,37 % (OR-Bench-Hard-1K) medidas con `allenai/wildguard`, es un caso de estudio directo de degradación de utilidad provocada por la compresión.
- Análisis de robustez frente a jailbreaks: las métricas de AdvBench HarmBench ASR (0,0308) y StrongREJECT HarmBench ASR (0,0511) permiten estudiar cómo varía la tasa de ataque exitoso según el ratio de compresión y la composición del conjunto de calibración.
- Reproducción de experimentos de compresión: el repositorio documenta la semilla, el conjunto de calibración, los hiperparámetros de LoRA y la versión del código de Basis Sharing (`1c021b6ce1d3`), lo que permite replicar el pipeline completo.
- Ablación de métodos de recuperación: al emplear la receta alpaca para todos los compresores, el modelo funciona como punto de comparación frente al LoRA propio de Basis Sharing u otros esquemas de recuperación sobre coeficientes.
- Pruebas de integración de despliegue sin código custom: al plegarse a formas densas de Llama, se puede validar que el artefacto carga en `transformers`, vLLM o TGI sin modificaciones en el modelado.
- Estudio de perplejidad y calidad de lenguaje tras compresión, usando WikiText-2 (perplejidad 10,7907) como referencia reproducible para comparar ratios de retención.
- Docencia o formación sobre técnicas de compresión low-rank: el repositorio ilustra de forma completa SVD con blanqueado, bases compartidas entre capas, LoRA sobre coeficientes y plegado a denso.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---:|
| Fraccion de parametros retenida | 0,5999 |
| WikiText-2 (perplejidad) | 10,7907 |
| ARC-Easy (acc_norm) | 0,5859 |
| ARC-Challenge (acc_norm) | 0,3601 |
| HellaSwag (acc_norm) | 0,5903 |
| WinoGrande (acc) | 0,6038 |
| OpenBookQA (acc_norm) | 0,3820 |
| PIQA (acc_norm) | 0,7051 |
| MathQA (acc_norm) | 0,2429 |
| AdvBench HarmBench ASR | 0,0308 |
| StrongREJECT HarmBench ASR | 0,0511 |
| Sobre-rechazo en XSTest-safe | 0,3896 |
| Sobre-rechazo en OR-Bench-Hard-1K | 0,5437 |
| Sobre-rechazo macro | 0,4666 |

Metodología de evaluación: perplejidad en WikiText-2; ARC-Easy/Challenge, HellaSwag, WinoGrande, OpenBookQA, PIQA y MathQA en zero-shot; generación en AdvBench y StrongREJECT juzgada por `cais/HarmBench-Llama-2-13b-cls`; sobre-rechazo en XSTest-safe y OR-Bench-Hard-1K juzgado por `allenai/wildguard`; toda la generación usa la plantilla de chat y decodificación greedy. La model card indica que el juicio de sobre-rechazo es fiable para esta celda (fracción puntuada de 1,00 en ambos conjuntos). No se proporcionan resultados del modelo base sin comprimir en la información disponible, por lo que no puede cuantificarse la pérdida atribuible a la compresión.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: unos 13,5 GB solo de pesos, más caché KV y activaciones; en la práctica conviene reservar 16-18 GB.
- VRAM estimada en INT8: aproximadamente 6,7-7 GB de pesos.
- VRAM estimada en INT4: aproximadamente 3,5-4 GB de pesos.
- GPU profesionales: A100 40/80 GB, H100 80 GB y L40S 48 GB lo ejecutan sin problemas en FP16.
- GPU de consumo: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) en FP16; en RTX 4080/4070 Ti (16 GB) en FP16 con margen justo; en RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 3080 10 GB solo con cuantización INT8/INT4.
- Opciones de despliegue: `transformers` (carga directa, sin código de modelado propio), vLLM, TGI, y llama.cpp u Ollama previa conversión a GGUF, que no se distribuye en el repositorio.
- Latencia y throughput estimados: no disponible; la model card no publica mediciones de rendimiento de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Pesos | Resultados comparables |
|---|---|---|---|---|---|
| Este modelo (keep 0,60, `calibration_mix`) | 6.738.415.616 en forma densa; fraccion realizada 0,5999 | 4096 | llama2 | safetensors | Tabla de benchmarks propia disponible |
| `meta-llama/Llama-2-7b-chat-hf` (base) | 6.738.415.616 | 4096 | llama2 | safetensors | no disponible en la informacion proporcionada |
| Celda Basis Sharing sin mezcla de seguridad (mismo ratio, citada en la model card) | no disponible | 4096 (heredado) | llama2 | no disponible | no disponible en la informacion proporcionada |

No se han proporcionado datos de benchmarks de alternativas en la información disponible, por lo que la comparación numérica de rendimiento no puede establecerse aquí. Las diferencias documentadas entre las celdas del estudio residen únicamente en el conjunto de calibración.

## Limitaciones y advertencias

- La propia model card advierte de que la compresión a este ratio degrada la conducta de rechazo y de que las métricas de seguridad de un modelo degenerado no son evidencia sobre alineación.
- Sobre-rechazo elevado: 38,96 % en XSTest-safe, 54,37 % en OR-Bench-Hard-1K y 46,66 % macro, lo que implica que rechaza una fracción muy alta de peticiones benignas.
- Es un modelo de rango deficiente: cada peso mantiene rango <= k, pero el artefacto no ocupa menos espacio en disco que el modelo denso original (13,5 GB).
- Idiomas: la model card no declara idiomas soportados; el modelo base está orientado a inglés y no hay evidencia de calidad multilingüe.
- Ventana de contexto limitada a 4096 tokens, insuficiente para tareas de contexto largo.
- No se distribuyen pesos cuantizados ni GGUF, lo que obliga a convertir manualmente para llama.cpp u Ollama.
- Licencia Llama 2 Community License: uso comercial sujeto a sus términos y a la política de uso aceptable, con condiciones específicas para despliegues a gran escala.
- La recuperación con LoRA sobre `yahma/alpaca-cleaned` puede modificar el comportamiento conversacional respecto al modelo base, incluso con las bases congeladas.
- Datos de validación nulos: cero descargas y cero valoraciones, además de fechas de publicación en 2026, lo que indica que el artefacto no ha sido contrastado por terceros.
- Riesgo de alucinación inherente a la familia Llama 2 de 7B, no mitigado por la compresión.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-llama2_7b_chat_up_basis_coeff_jbbmix_finetuned_keep_0p60
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Código de Basis Sharing: https://github.com/TUDa-HWAI/Basis_Sharing (commit `1c021b6ce1d3` citado en la model card)
- Conjunto de recuperación: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Clasificador de jailbreak usado en la evaluación: https://huggingface.co/cais/HarmBench-Llama-2-13b-cls
- Juez de sobre-rechazo usado en la evaluación: https://huggingface.co/allenai/wildguard
- Búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a páginas de recetas de cocina sin relación con el artefacto.
