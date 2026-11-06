# austindixson/Qwen3.8-Flash-Next-Unsloth-V3.1-MLX

## Resumen

Qwen3.8-Flash-Next-Unsloth-V3.1-MLX es una cuantización de precisión mixta en formato MLX del modelo base Qwen/Qwen3.8-Flash-Next, publicada por el usuario austindixson. No se trata de un modelo entrenado desde cero, sino de un port del recetario de cuantización dinámica Unsloth Dynamic V3.1 al ecosistema MLX, pensado específicamente para el servidor de inferencia mlx-serve sobre hardware Apple Silicon. El modelo base emplea una arquitectura MoE (model_type: qwen4_exp) con atención, capas GDN, expertos compartidos e hiperconexiones, e incluye una torre de visión.

La relevancia de esta ficha es doble: por un lado, demuestra que es posible reexpresar la asignación de bits por tensor de Unsloth (originalmente definida para GGUF K-quants) en anchos afines MLX con grupos de cuantización equivalentes; por otro, documenta de forma inusualmente transparente el error en espacio de pesos (G2) frente al recetario mixto 4/8 convencional. El pack ocupa 116,7 GB en disco (108,7 GiB), de los cuales 32,0 GB corresponden a una tabla de n-gramas mapeada en memoria y 0,9 GB a la torre de visión.

El autor probó el modelo de extremo a extremo con mlx-serve 26.9.3 sobre un Apple M3 Max con 128 GB de memoria unificada, sirviendo chat y tool-calls reales, y superando una prueba de contexto largo. La licencia es qwen-community-1.0, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (model_type: qwen4_exp) con atención, GDN, expertos compartidos, hiperconexiones, indexer y torre de visión; transformer híbrido con estado SSM |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 150.000 tokens en la configuración probada (flag --ctx-size 150000) |
| Tipos de cuantizacion | MLX affine mixta: 4-bit grupo 64 (expertos gate/up, capas 0-47 salvo capa 2), 5-bit grupo 64 (capa 2 gate/up), 5-bit grupo 32 (down de 43 capas), 8-bit grupo 64 (down de capas 2, 4, 30, 46, 47; atención, GDN, indexer, expertos compartidos, hiperconexiones, embeddings, lm_head), 4-bit grupo 32 (tabla n-gramas), bf16 (routers, norms, convs, estado SSM, torre de visión) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (license_name en la model card; tag license:other) |
| Formato de pesos | safetensors MLX (model-vision.safetensors separado) más ngram_table.bin; librería mlx-serve |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer MoE con componentes híbridos: capas de atención, capas GDN (probablemente una variante de atención lineal o estado recurrente), un indexer, expertos compartidos además de los enrutados, hiperconexiones y una torre de visión. Esta ficha describe una cuantización, no un reentrenamiento: no se ha realizado ningún ajuste fino ni RLHF/DPO adicional sobre el modelo base. Los pesos originales en BF16 se convirtieron directamente (no desde GGUF) mediante el conversor en streaming tests/convert_qwen38_flash_next.py del repositorio mlx-serve (commit 7ff28ae).

La innovación técnica central es la reexpresión del mapa de bits Unsloth Dynamic V3.1 en anchos afines MLX: cada tipo K-quant de Unsloth se mapeó al ancho afín y tamaño de grupo MLX de tamaño similar, y se utilizó la importance matrix de Unsloth (remapeada al layout de tensores HF) para ponderar el ajuste de cuantización. El autor verificó 144 tensores de expertos contra el fichero de asignación sin discrepancias. No hay datos publicados sobre el número de tokens de entrenamiento ni la composición del dataset del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno, validada con smoke tests de chat reales sobre mlx-serve.
- Tool calling / function calling: el autor reportó una llamada a herramienta exitosa en la prueba de humo.
- Contexto largo: superó una sonda QSA de aproximadamente 18.000 caracteres con respuesta HTTP 200 sobre kernels por defecto.
- Razonamiento multi-paso y agentes: no documentado explícitamente en la información disponible.
- Capacidades de visión: el pack incluye torre de visión en bf16 (model-vision.safetensors, 0,9 GB), aunque el benchmark de velocidad se ejecutó con --no-vision.
- Decodificación especulativa: soportada vía MTP (--mtp --mtp-depth 4) y PLD (--pld --pld-draft-len 5) en mlx-serve, aunque su contribución aislada no se ha medido.
- Capacidades multilingües: no disponible.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Asistencia conversacional local en estaciones de trabajo Apple Silicon: el pack permite servir chat multi-turno con hasta 150.000 tokens de contexto en un M3 Max de 128 GB, sin depender de la nube, gracias a la cuantización mixta que mantiene los tensores sensibles (atención, embeddings, routers) en 8-bit.
- Automatización de agentes con tool calling: la prueba de humo confirmó llamadas a herramientas correctas, lo que habilita pipelines de agentes que invocan APIs externas o funciones locales en un entorno mlx-serve.
- Procesamiento de documentos largos: la ventana de 150.000 tokens y la sonda QSA de ~18.000 caracteres validada permiten resumir o extraer información de contratos, informes o bases de código extensas.
- Prototipado e investigación en cuantización: la ficha del autor publica el error G2 por rol de tensor y por capa, lo que convierte este pack en una referencia útil para estudiar el impacto del mapa de bits Unsloth V3.1 frente al recetario 4/8 convencional.
- Inferencia con huella de memoria reducida: el servidor midió 24,0 GB de RSS frente a 55,2 GB del pack 4/8 de comparación, lo que permite ejecutar el modelo en máquinas con menos memoria unificada disponible para el proceso.
- Evaluación de visión en local: aunque el benchmark usó --no-vision, la torre de visión en bf16 permite experimentar con tareas imagen-texto en mlx-serve sin cuantizar esa parte.
- Desarrollo de servidores de inferencia para macOS: sirve como caso de referencia para configurar mlx-serve con caché de prefijos (memoria y disco de 4 GB cada una), cuantización KV a 4-bit y decodificación especulativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí publica un error en espacio de pesos (G2, proxy de error de salida, no benchmark de calidad) con subconjunto parcial: 54 de 131 shards BF16, cubriendo capas 0, 1 y 10-18 más tensores densos de la capa 19. Las capas 2-9 y 20-47, incluidas las cinco capas down de 8-bit, no están en el subconjunto.

| Rol | live 4/8 | iQ-4.7bpw recipe | B (V3.1 map) | B vs live |
|---|---|---|---|---|
| dense | 9,290e-05 | 5,772e-05 | 5,772e-05 | -37,9% |
| expert_down | 8,395e-03 | 6,269e-03 | 1,058e-03 | -87,4% |
| expert_gate_up | 8,318e-03 | 6,448e-03 | 6,448e-03 | -22,5% |

| Medición | Estado |
|---|---|
| Carga real y generación (chat corto, tool call, sonda QSA ~18k caracteres) | PASS: HTTP 200 en kernels por defecto, sin errores ni trazas; 6 de 7 auto-checks de comportamiento superados; la aritmética quedó sin puntuar por el límite de 200 tokens en ambos brazos |
| Velocidad medida, este pack vs comparación | Medida (el autor reporta la comparación, pero los valores concretos no figuran en la información proporcionada) |
| KLD / top-1, G2 completo y optimización | En curso, sin resultados finales |

## Requisitos de hardware

- VRAM/memoria unificada: el pack ocupa 116,7 GB en disco; el proceso servidor midió 24,0 GB de RSS en la prueba (observación de proceso vivo, no comparación controlada de memoria cableada). La tabla de n-gramas de 32,0 GB se mapea en memoria y no es residente.
- GPU recomendadas: Apple Silicon con memoria unificada suficiente; el autor validó en Apple M3 Max de 128 GB. No hay datos para A100, H100 ni RTX 4090, y MLX está orientado a hardware Apple.
- Cabe en GPU de consumo: no aplica en el sentido convencional; requiere Apple Silicon con memoria unificada amplia. No hay datos de ejecución en GPUs NVIDIA.
- Opciones de despliegue: mlx-serve (versión probada 26.9.3), con flags --mtp, --pld, --kv-quant 4, --prefix-cache-mem y --prefix-cache-disk. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en cifras concretas; el autor menciona una comparación de velocidad medida pero los valores no figuran en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Unsloth-V3.1-MLX (este) | no disponible | 150.000 en config probada | MLX safetensors | qwen-community-1.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.8-Flash-Next (base BF16) | no disponible | no disponible | safetensors BF16 | qwen-community-1.0 | Hugging Face (modelo base) |
| unsloth/Qwen3.8-Flash-Next-GGUF | no disponible | no disponible | GGUF (K-quants V3.1) | no disponible en la información | Hugging Face |
| Pack "live 4/8" MLX (receta mixta 4-bit expertos / 8-bit resto) | no disponible | no disponible | MLX safetensors | no disponible | Referencia interna del autor |

## Limitaciones y advertencias

- No es un release oficial de Unsloth: el autor indica explícitamente que Unsloth no revisó este pack y que se trata de un port del recetario, no de sus ficheros.
- El error G2 es un proxy en espacio de pesos, no una medida de calidad de salida; además está calculado sobre un subconjunto parcial (54 de 131 shards) que excluye capas clave como las cinco down de 8-bit.
- La comparación de memoria (24,0 GB vs 55,2 GB) son observaciones de proceso vivo, no una comparación controlada de memoria cableada.
- La contribución aislada de MTP y PLD no se ha medido; su efecto en latencia y calidad es incierto.
- El benchmark de velocidad se ejecutó con --no-vision, por lo que el rendimiento con la torre de visión activa no está caracterizado.
- La licencia qwen-community-1.0 impone condiciones al uso comercial; debe revisarse el fichero LICENSE antes de desplegar en producción.
- Sesgos y riesgo de alucinación: no documentados en la información disponible; como todo modelo generativo, requiere validación en producción.
- Idiomas soportados: no disponibles; no se garantiza cobertura multilingüe.
- Dependencia estricta de mlx-serve y hardware Apple Silicon; no hay soporte documentado para otros runtimes.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validación comunitaria independiente.

## Enlaces

- Hugging Face del pack: https://huggingface.co/austindixson/Qwen3.8-Flash-Next-Unsloth-V3.1-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- GGUFs de Unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Documentación del método Unsloth Dynamic V3.1: https://unsloth.ai/docs/basics/dynamic-3.0-ggufs/dynamic-3.1-ggufs
- Repositorio mlx-serve: https://github.com/ddalcu/mlx-serve
