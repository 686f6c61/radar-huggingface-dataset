# flashrt/gated-delta-attention

## Resumen

El repositorio `flashrt/gated-delta-attention` no contiene un modelo de lenguaje completo, sino un paquete de kernels CUDA especializados para la implementación de atención lineal con *gating* delta (Gated DeltaNet), desarrollado por el autor `flashrt` y empaquetado para el Hugging Face Kernel Hub. Su propósito es proporcionar primitivas de bajo nivel (recurrentes, por bloques y vía WY) para acelerar la inferencia y el prefill de arquitecturas que usan atención lineal con estado recurrente, como la familia Qwen3 con perfiles específicos de cabezas y dimensiones.

La relevancia actual radica en que la atención lineal con *gating* delta permite reducir la complejidad computacional frente a la atención softmax tradicional, manteniendo un estado recurrente compacto. Este paquete ofrece implementaciones nativas para GPUs Blackwell (SM120) y Jetson AGX Thor (SM110), con soporte para prefill por bloques de 64 tokens y verificación especulativa. No se trata de un modelo con pesos entrenados, sino de una librería de kernels que se integra en pipelines de inferencia existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kernels CUDA para atención lineal con *gating* delta (Gated DeltaNet) |
| Parametros totales | no disponible (no es un modelo con pesos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del perfil de uso) |
| Tipos de cuantizacion | BF16 (entrada/salida), estado FP32 opcional |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no aplica (codigo CUDA compilado) |

## Arquitectura y entrenamiento

El paquete implementa la arquitectura Gated DeltaNet, una variante de atención lineal donde el estado recurrente se actualiza mediante una puerta exponencial y una regla delta. Se ofrecen tres modos de ejecución: recurrente puro (`gated_delta_recurrent_*`), por bloques (`gated_delta_chunk_*`) y la cadena WY completa (`gdn_wy_*`), esta última con variantes que usan instrucciones MMA de Tensor Cores para acelerar el cálculo de las matrices WY.

Los perfiles validados son `Hv/Hk/D=48/16/128` (48 cabezas de valor, 16 de clave/consulta, dimensión 128) y `32/16/128`, correspondientes a configuraciones de Qwen3.6 y una variante genérica H32. La cadena WY incluye normalización cumsum, cálculo de matrices KKT, resolución triangular y recomputación de W/U, todo en BF16 con estado FP32. No hay información sobre entrenamiento, ya que no es un modelo entrenado sino una implementación de kernels.

## Capacidades

- Proporciona kernels CUDA nativos para atención lineal con *gating* delta en BF16.
- Soporta tres modos de ejecución: recurrente, por bloques (chunk) y cadena WY completa.
- Incluye funciones para dividir QKV, calcular gating, y gestionar estados recurrentes.
- Permite verificación especulativa: puede almacenar el estado tras cada fila consumida (`gdn_chunk_from_conv_smem_stash_bf16`).
- Ofrece una ruta estilo FLA (Flash Linear Attention) que mantiene la cadena de prefill caliente en kernels CUDA.
- Compatible con SM110 (Jetson AGX Thor) y SM120 (Blackwell).
- Las funciones `_h_bf16` aceptan explícitamente `num_v_heads` y `num_k_heads`, lo que permite flexibilidad en la configuración de cabezas.
- No incluye capacidades de generación de texto, razonamiento, visión ni tool calling, ya que no es un modelo de lenguaje.

## Casos de uso

- Aceleración de inferencia para modelos con atención lineal: los kernels recurrentes y por bloques reducen la latencia en la generación autoreresiva al evitar el cálculo de atención softmax completa.
- Prefill eficiente en modelos tipo Qwen3: la cadena WY con bloques de 64 tokens permite procesar secuencias largas de entrada con menor coste computacional.
- Verificación especulativa en pipelines de decodificación: la función `stash` permite conservar estados intermedios para validar rápidamente tokens aceptados.
- Despliegue en hardware embebido de alto rendimiento: el soporte para SM110 (Jetson AGX Thor) habilita inferencia de atención lineal en dispositivos edge.
- Investigación en arquitecturas de atención lineal: los kernels modulares permiten experimentar con diferentes configuraciones de cabezas y dimensiones.
- Integración en frameworks de inferencia personalizados: al ser una librería de kernels, puede integrarse en motores como vLLM o TGI mediante adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Requiere GPU NVIDIA con arquitectura SM110 (Jetson AGX Thor) o SM120 (Blackwell).
- No se especifica VRAM mínima; depende del tamaño del estado recurrente y del perfil de cabezas (por ejemplo, estado de dimensión `Hv x D x D` en BF16).
- No es compatible con GPUs consumer convencionales (RTX 4090, etc.) al no incluir kernels para SM89 o similares.
- El despliegue se realiza mediante la API `get_kernel` del Hugging Face Kernel Hub, no a través de vLLM, llama.cpp u Ollama directamente.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se han identificado paquetes de kernels equivalentes con los que comparar en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje; no puede generar texto ni realizar tareas de NLP por sí mismo.
- Solo soporta BF16 para entradas/salidas; el estado puede ser FP32 pero las activaciones son BF16, lo que puede afectar la precisión en aplicaciones sensibles.
- La compatibilidad de hardware se limita a SM110 y SM120; no funcionará en GPUs más antiguas.
- La licencia no está especificada, por lo que el uso comercial debe consultarse con el autor.
- No hay documentación sobre el dataset de entrenamiento ni sobre sesgos, al no ser un modelo entrenado.
- La API depende de `trust_remote_code=True`, lo que implica ejecutar código remoto no auditado; se recomienda revisar el código antes de usarlo en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/flashrt/gated-delta-attention
- No se han encontrado papers, blogs ni demos adicionales en la información disponible.
