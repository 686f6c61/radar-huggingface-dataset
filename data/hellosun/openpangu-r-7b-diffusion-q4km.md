# HelloSun/openPangu-R-7B-Diffusion-Q4KM

## Resumen

`HelloSun/openPangu-R-7B-Diffusion-Q4KM` es una cuantización GGUF Q4_K_M del modelo `openpangu/openPangu-R-7B-Diffusion`, un LLM de aproximadamente 8.030 millones de parámetros que no genera texto por autoregresión convencional, sino mediante *block-diffusion*: un bloque de tokens (32 por defecto) se "desruidifica" en paralelo, revelando primero los tokens de mayor confianza. El paquete lo publica el usuario HelloSun e incluye, además del fichero de pesos (~4,6 GB), un parche para llama.cpp y un script de compilación que añaden soporte nativo a este esquema de decodificación, ausente en la versión upstream del runtime (etiqueta `b11719`).

La relevancia práctica es doble. Por un lado, permite ejecutar un modelo de difusión para texto en hardware modesto y en CPU, algo poco habitual en este tipo de arquitecturas. Por otro, el parche documenta de forma explícita cómo implementar decodificación *context-causal block-diffusion* sobre la caché KV de llama.cpp: prefill causal del prompt, denoising no causal del bloque, revelado del token más confiable y commit causal del bloque consolidado.

El modelo es bilingüe inglés-chino, se distribuye bajo licencia `other` heredada del modelo base y no incluye resultados de benchmarks publicados en la información disponible. El tamaño real de parámetros (8,03 B) supera la denominación comercial "7B".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con decodificación *block-diffusion* context-causal; arquitectura GGUF `pangu-embedded` (`LLM_ARCH_PANGU_EMBED`) |
| Parámetros totales | 8.030.887.936 (~8,03 B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | Q4_K_M (única publicada en este repositorio); el parche compila `llama-quantize`, pero no se han publicado otras cuantizaciones |
| Idiomas soportados | inglés (`en`) y chino (`zh`) |
| Licencia | `other` (heredada del modelo base; requiere revisar los términos del autor original) |
| Formato de pesos | GGUF (`pangu-diffusion-Q4_K_M.gguf`, ~4,6 GB) |
| Tamaño del repositorio | 4,9 GB |
| Tokens especiales de chat | `[unused9]` (inicio de turno), `[unused10]` (fin de turno); `tokenizer.ggml.mask_token_id = 45830` |
| Metadatos de difusión en el GGUF | `diffusion.shift_logits = true`, `diffusion.block_attention = true` |

## Arquitectura y entrenamiento

El modelo base es un transformer de 8,03 B de parámetros entrenado con un objetivo de difusión sobre tokens discretos. La generación se realiza por bloques de 32 tokens: dentro del bloque la atención es bidireccional (completa), mientras que la atención sobre el contexto previo es causal. En cada paso se vuelve a decodificar el bloque y se revelan, de izquierda a derecha y dentro de sub-bloques pequeños, los tokens enmascarados con mayor confianza según el algoritmo de selección (`entropy`, `margin`, `confidence`, `random` u `origin`). El modelo también puede ejecutarse en modo autoregresivo ordinario.

El parche de llama.cpp implementa el ciclo completo: prefill causal del prompt conservado en la caché KV; denoising del bloque con `causal_attn = false`, de forma que la máscara kq mantiene todas las celdas no vacías de la caché; eliminación de las claves obsoletas del bloque (`llama_memory_seq_rm`) antes de cada paso; commit del bloque mediante un forward causal para dejar la caché en estado causal correcto, y muestreo del primer token del bloque siguiente desde la última posición. Además, `gguf-py` y `conversion/pangu.py` escriben las claves `diffusion.block_attention`, `diffusion.shift_logits` y `tokenizer.ggml.mask_token_id`.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron etapas de RLHF, DPO u otro ajuste por preferencias. Tampoco se detalla la innovación de attention linear ni decodificación especulativa.

## Capacidades

- Generación de texto en inglés y chino con un formato de chat basado en tokens especiales (`[unused9]` / `[unused10]`).
- Razonamiento paso a paso: la model card incluye un ejemplo completo de comparación numérica (9.11 frente a 9.9) resuelto correctamente con cadenas de razonamiento extensas.
- Decodificación paralela por bloques con attention bidireccional intra-bloque, que permite generar varios tokens por forward y priorizar los de mayor confianza.
- Modo autoregresivo convencional alternativo (`llama-cli`), útil cuando no se requiere el decodificador de difusión.
- Cuatro algoritmos de selección de tokens (`origin`, `entropy`, `margin`, `random`, `confidence`) y control del tamaño de sub-bloque (`--diffusion-small-block`).
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso con herramientas: no disponible en la información proporcionada.
- Visión, audio o multimodalidad: no disponible (el modelo es exclusivamente de texto).
- Modo *thinking* explícito separado: no disponible; el razonamiento se emite en el mismo flujo de texto.

## Casos de uso

- **Razonamiento numérico y matemático verificable en local**: el ejemplo de la model card (comparar 9.11 y 9.9) muestra cadenas de razonamiento correctas con `temperature = 0` y algoritmo `entropy`, lo que permite usar el modelo como verificador o resolutor de problemas aritméticos en entornos sin conectividad ni GPU.
- **Despliegue en CPU para prototipado**: con 4,6 GB de pesos y `-t 16`, el modelo se ejecuta íntegramente en CPU mediante el binario `llama-diffusion-cli`; encaja en estaciones de trabajo sin GPU para pruebas de concepto y demos internas.
- **Investigación sobre modelos de difusión para texto**: el repositorio incluye el parche y el script de compilación, lo que permite reproducir el pipeline de decodificación bloque a bloque, comparar algoritmos de selección y medir el efecto del tamaño de sub-bloque sin reimplementar el decodificador desde cero.
- **Generación de código en modo experimental**: la model card recomienda para tareas de programación `alg = entropy`, `num_small_blocks = 32` (equivalente a `--diffusion-small-block 1`), `top_p = 0.8` y `temperature = 1`; sirve para evaluar si la decodificación por bloques aporta ventajas frente a la autoregresiva en generación de código.
- **Chat bilingüe inglés-chino de bajo coste**: atención a usuarios en ambos idiomas con un único fichero GGUF, usando el formato de turnos con tokens especiales y el modo autoregresivo para conversaciones multi-turno.
- **Experimentos de cuantización**: al ser una cuantización Q4_K_M de un modelo de difusión, permite medir la degradación que introduce la cuantización en tareas de razonamiento delicadas (el autor advierte de que puede afectar a los casos más frágiles).
- **Evaluación de latencia y throughput en decodificación no autoregresiva**: útil para comparar el coste de `block_length` forwards por bloque frente a la generación token a token en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El autor únicamente reporta una comprobación numérica del camino de commit de la caché KV frente a la referencia de HuggingFace (coseno ≈ 0,996, f16 frente a bf16), que no constituye un benchmark de calidad. Como referencia de rendimiento cualitativa, se indica que una ejecución de 256 tokens con decodificación por bloques, solo CPU, `-t 16` y fichero de 4,6 GB tarda "unos minutos", con `block_length` forwards por bloque.

## Requisitos de hardware

- **VRAM estimada para inferencia**: los pesos Q4_K_M ocupan ~4,6 GB; en GPU con llama.cpp hay que sumar la caché KV, por lo que se necesita un margen por encima de los pesos (estimación orientativa: a partir de ~6 GB para contextos cortos; no confirmado por el autor).
- **GPU recomendadas**: cualquier GPU con al menos 8 GB de VRAM para el modelo cuantizado; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 y H100 son opciones válidas, aunque no se han publicado cifras de throughput para ninguna de ellas.
- **¿Cabe en GPU de consumo?**: sí, en tarjetas de 8 GB o más con la cuantización Q4_K_M, siempre que se mantenga el contexto acotado.
- **Ejecución en CPU**: soportada y documentada; es el modo validado por el autor (`-t 16`, ~4,6 GB de fichero). Requiere compilar llama.cpp con el parche incluido.
- **Opciones de despliegue**: exclusivamente llama.cpp con el parche (`llama-diffusion-cli` para difusión, `llama-cli` para modo autoregresivo). vLLM, TGI y Ollama no están documentados en la información disponible; Ollama, al no soportar la decodificación por difusión, solo podría ejecutar el modelo en modo autoregresivo si acepta la arquitectura `pangu-embedded`.
- **Latencia y throughput**: no se publican tokens/s. La única referencia es que 256 tokens en CPU pueden tardar varios minutos, con posibilidad de mejorar usando `confidence_threshold` con `num_small_blocks = 1`.

## Comparativa con modelos similares

| Modelo | Tipo de decodificación | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `HelloSun/openPangu-R-7B-Diffusion-Q4KM` (este) | Block-diffusion (32) + autoregresiva | 8,03 B | no disponible | `other` | GGUF Q4_K_M en HF |
| `openpangu/openPangu-R-7B-Diffusion` (base) | Block-diffusion (32) + autoregresiva | no disponible en la información proporcionada (el quantizado declara 8,03 B) | no disponible | `other` | Pesos originales en HF, referencia del parche |
| `openPangu-Embedded` (hermano autoregresivo citado en la model card) | Autoregresiva pura | no disponible | no disponible | no disponible | Soportado por llama.cpp upstream, arquitectura `PanguEmbedded` |
| LLaDA (familia de LLM de difusión, referencias externas) | Difusión por enmascaramiento | no verificado en esta ficha | no disponible | no disponible | Existen publicaciones y pesos, no verificados aquí |
| Dream (familia de LLM de difusión, referencias externas) | Difusión con attention bidireccional | no verificado en esta ficha | no disponible | no disponible | Existen publicaciones y pesos, no verificados aquí |

Nota: los datos de las dos últimas filas no proceden de la información proporcionada en esta ficha y deben verificarse en sus repositorios antes de citarlos. La comparación relevante y verificable es la del par base (safetensors) frente a esta cuantización GGUF: misma arquitectura, con la diferencia de cuantización y del parche necesario para ejecutar la decodificación por difusión.

## Limitaciones y advertencias

- **Licencia `other`**: no es una licencia estándar tipo Apache 2.0 o MIT; los términos exactos heredan del modelo base `openpangu/openPangu-R-7B-Diffusion` y deben revisarse antes de cualquier uso comercial.
- **Sin benchmarks**: no hay resultados publicados de MMLU, HumanEval, GSM8K ni similares, por lo que la calidad relativa frente a modelos autoregresivos del mismo tamaño no está cuantificada.
- **Idiomas limitados**: solo inglés y chino; no hay soporte declarado de castellano ni de otros idiomas.
- **Degradación por cuantización**: el autor advierte de que la cuantización Q4_K_M puede afectar a los casos de razonamiento más delicados; recomienda `alg = entropy` y `temperature = 0` para obtener los resultados más estables (con `top_p = 1`).
- **Requiere un build parcheado**: llama.cpp upstream (etiqueta `b11719`) no implementa la decodificación por difusión de este modelo; sin aplicar el parche, solo funciona el modo autoregresivo y hay que compilar a mano.
- **Rendimiento bajo en CPU**: varios minutos para 256 tokens con 16 hilos; no es adecuado para servicios interactivos en CPU.
- **Gestión de contexto en modo no causal**: durante el denoising la máscara kq conserva todas las celdas no vacías de la caché, lo que incrementa el uso de memoria conforme crece el contexto.
- **Recorte de secuencia**: con `-ub N`, la cola que no completa un bloque entero se descarta, lo que puede truncar salidas si el límite no está bien ajustado.
- **Formato de chat estricto**: es obligatorio usar los tokens `[unused9]` y `[unused10]` en la posición correcta; un prompt mal formateado degrada la calidad de forma notable.
- **Riesgo de alucinación**: inherente a un modelo de 8 B sin datos publicados de alineación o evaluación de seguridad; no se dispone de información sobre sesgos medidos.
- **Validación comunitaria nula**: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia externa de funcionamiento más allá de la del autor.
- **Trazabilidad de la fecha**: los metadatos de HuggingFace indican creación el 2026-10-18, dato que conviene contrastar antes de citarlo.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/HelloSun/openPangu-R-7B-Diffusion-Q4KM
- Modelo base: https://huggingface.co/openpangu/openPangu-R-7B-Diffusion
- llama.cpp (runtime que requiere el parche): https://github.com/ggml-org/llama.cpp
- Ficheros incluidos en el repositorio: `pangu-diffusion-Q4_K_M.gguf`, `pangu-diffusion-llamacpp.patch`, `build_llamacpp_pangu_diffusion.sh`
- Paper, blog o demo oficial: no disponible en la información proporcionada.
